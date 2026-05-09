'use client';

import '@/app/globals.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import ResponsiveHeader from '@/components/home/ResponsiveHeader';
import Footer from '@/components/layout/Footer';
import {
  Upload, X, Check, ChevronRight, Loader2, ArrowLeft,
  GripVertical, Phone
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { adsApi } from '@/lib/api';
import { FormSkeleton } from '@/components/ui/Skeleton';
import { getPhoneValidationError, getAdImageUrl } from '@/lib/utils';
import CategorySelector from '@/components/ui/CategorySelector';
import LocationSelector from '@/components/ui/LocationSelector';
import toast from 'react-hot-toast';

const MAX_IMAGES = 6;

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const adId = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [adNotFound, setAdNotFound] = useState(false);
  const [adData, setAdData] = useState<any>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryBreadcrumb, setCategoryBreadcrumb] = useState('');
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [selectedStateName, setSelectedStateName] = useState('');
  const [lgaId, setLgaId] = useState('');
  const [condition, setCondition] = useState<'new' | 'like_new' | 'good' | 'fair' | ''>('');
  const [images, setImages] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: number; url: string; is_primary: boolean }[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [sameAsPhone, setSameAsPhone] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!adId || isNaN(adId)) {
      setAdNotFound(true);
      setIsLoading(false);
      return;
    }

    const fetchAd = async () => {
      try {
        const res = await adsApi.get(adId);
        const ad = res.data?.data || res.data;

        if (ad) {
          setAdData(ad);
          setTitle(ad.title || '');
          setDescription(ad.description || '');
          setPrice(ad.price?.toString() || '');
          setNegotiable(ad.negotiable || false);
          setCategoryId(ad.category_id);
          setLocationId(ad.location_id);
          setSelectedStateName(ad.state || '');
          setLgaId(ad.lga || '');
          setCondition(ad.condition || '');
          setPhone(ad.phone || '');
          setWhatsapp(ad.whatsapp || '');

          if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
            setExistingImages(ad.images.map((img: any, idx: number) => ({
              id: img.id || idx,
              url: typeof img === 'string' ? img : (img.url || img.thumbnail_url || ''),
              is_primary: img.is_primary || idx === 0,
            })));
          }

          if (ad.category) {
            const catName = typeof ad.category === 'object' ? ad.category.name : ad.category;
            setCategoryBreadcrumb(catName);
          }
        } else {
          setAdNotFound(true);
        }
      } catch (error) {
        console.error('Failed to fetch ad:', error);
        setAdNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAd();
  }, [adId]);

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - images.length - existingImages.length;
    if (remainingSlots <= 0) { toast.error(`Maximum ${MAX_IMAGES} images allowed.`); return; }

    const filesToAdd = fileArray.slice(0, remainingSlots);
    const newImages: { id: string; file: File; preview: string }[] = [];

    for (const file of filesToAdd) {
      if (!file.type.startsWith('image/')) continue;
      const preview = URL.createObjectURL(file);
      newImages.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
      });
    }

    if (newImages.length > 0) setImages(prev => [...prev, ...newImages]);
  }, [images.length, existingImages.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeExistingImage = (index: number) => {
    const img = existingImages[index];
    if (typeof img.id === 'number') {
      setRemovedImageIds(prev => [...prev, img.id]);
    }
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const setPrimaryImage = (type: 'existing' | 'new', index: number) => {
    if (type === 'existing') {
      setExistingImages(prev => prev.map((e, i) => ({ ...e, is_primary: i === index })));
    } else {
      setImages(prev => prev.map((e, i) => ({ ...e, is_primary: i === index })));
    }
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    setImages(prev => {
      const newImages = [...prev];
      const [draggedItem] = newImages.splice(draggedIndex, 1);
      newImages.splice(targetIndex, 0, draggedItem);
      return newImages;
    });
    setDraggedIndex(targetIndex);
  };

  const handleCategorySelect = (id: number, name: string, breadcrumb: string) => {
    setCategoryId(id);
    setCategoryBreadcrumb(breadcrumb);
  };

  const handleLocationSelect = (stateId: number, stateName: string, lga: string) => {
    setLocationId(stateId);
    setSelectedStateName(stateName);
    setLgaId(lga);
  };

  const handleSubmit = async () => {
    if (!title || !description || !price || !categoryId || !locationId || !condition) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('negotiable', negotiable ? '1' : '0');
      if (categoryId) formData.append('category_id', categoryId.toString());
      if (locationId) formData.append('location_id', locationId.toString());
      if (selectedStateName) formData.append('state', selectedStateName);
      if (lgaId) formData.append('lga', lgaId);
      if (condition) formData.append('condition', condition);
      if (phone) formData.append('phone', phone);
      formData.append('whatsapp', sameAsPhone ? phone : (whatsapp || ''));

      if (removedImageIds.length > 0) {
        formData.append('removed_images', JSON.stringify(removedImageIds));
      }

      images.forEach((img) => { formData.append('images[]', img.file); });

      const primaryIndex = existingImages.findIndex(img => img.is_primary);
      if (primaryIndex >= 0) {
        formData.append('primary_image_id', String(existingImages[primaryIndex].id));
      }

      await adsApi.update(adId, formData);
      toast.success('Ad updated successfully!');
      setTimeout(() => router.push('/dashboard/my-ads'), 1500);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update ad';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatPriceInput = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return Number(numericValue).toLocaleString();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value.replace(/[^0-9]/g, ''));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <ResponsiveHeader />
        <main className="flex-1 pt-[150px] md:pt-[200px] pb-8 px-4">
          <div className="max-w-3xl mx-auto">
            <FormSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (adNotFound) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <ResponsiveHeader />
        <div className="flex-1 flex items-start justify-center pt-[180px] px-4">
          <div className="text-center bg-white rounded-2xl shadow-card p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ad Not Found</h2>
            <p className="text-gray-500 mb-4">This ad doesn&apos;t exist or you don&apos;t have permission to edit it.</p>
            <button
              onClick={() => router.push('/dashboard/my-ads')}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Back to My Ads
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ResponsiveHeader />

      <main className="flex-1 pt-[150px] md:pt-[200px] pb-8 px-4">
        <div className="container-app">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Edit Ad</h1>
                  <p className="text-sm text-gray-500">Update your listing details</p>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white rounded-2xl shadow-card p-4 md:p-6 lg:p-8">
                <div className="space-y-6">
                  {/* Category & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <button
                        onClick={() => setShowCategorySelector(true)}
                        className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
                      >
                        <span className={`text-sm font-medium truncate ${categoryBreadcrumb ? 'text-gray-900' : 'text-gray-400'}`}>
                          {categoryBreadcrumb || 'Select Category'}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <button
                        onClick={() => setShowLocationSelector(true)}
                        className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
                      >
                        <span className={`text-sm font-medium truncate ${selectedStateName ? 'text-gray-900' : 'text-gray-400'}`}>
                          {selectedStateName ? `${selectedStateName}${lgaId ? ` > ${lgaId}` : ''}` : 'Select Location'}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                      </button>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photos <span className="text-gray-400 font-normal">
                        ({existingImages.length + images.length}/{MAX_IMAGES})
                      </span>
                    </label>

                    {existingImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-3">
                        {existingImages.map((img, index) => (
                          <div key={img.id} className={`relative aspect-square rounded-lg overflow-hidden border-2 ${img.is_primary ? 'border-primary-500' : 'border-gray-200'}`}>
                            <Image src={getAdImageUrl(img)} alt="" fill sizes="150px" className="object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E'; }} />
                            {img.is_primary && (
                              <div className="absolute bottom-1 left-1 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded">Cover</div>
                            )}
                            <button onClick={() => setPrimaryImage('existing', index)} className="absolute top-1 left-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="w-3 h-3" />
                            </button>
                            <button onClick={() => removeExistingImage(index)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {images.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-3">
                        {images.map((img, index) => (
                          <div
                            key={img.id}
                            draggable
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={() => setDraggedIndex(null)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 ${draggedIndex === index ? 'border-primary-500 opacity-50' : 'border-gray-200'}`}
                          >
                            <Image src={img.preview} alt="" fill sizes="150px" className="object-cover" />
                            <button onClick={() => setPrimaryImage('new', index)} className="absolute top-1 left-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center text-[10px]">
                              <GripVertical className="w-3 h-3" />
                            </button>
                            <button onClick={() => removeNewImage(img.id)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {existingImages.length + images.length < MAX_IMAGES && (
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500 font-medium">Add photos</p>
                      </label>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. iPhone 14 Pro Max 256GB"
                      className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all bg-white text-gray-900 placeholder:text-gray-400"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your item in detail..."
                      rows={5}
                      className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all resize-none bg-white text-gray-900 placeholder:text-gray-400"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/2000</p>
                  </div>

                  {/* Condition */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Condition <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {([
                        { key: 'new', label: 'Brand New' }, { key: 'like_new', label: 'Like New' },
                        { key: 'good', label: 'Used' }, { key: 'fair', label: 'Refurbished' }
                      ] as const).map(({ key, label }) => (
                        <button
                          key={key} onClick={() => setCondition(key)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                            condition === key ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-200 hover:border-primary-400 hover:bg-primary-50 text-gray-700'
                          }`}
                        >
                          <span className="font-semibold text-sm">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="max-w-md">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-bold">₦</span>
                      <input
                        type="text" value={formatPriceInput(price)} onChange={handlePriceChange}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-3 text-xl border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all font-bold bg-white text-gray-900 placeholder:text-gray-300"
                      />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer mt-3">
                      <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      <span className="text-sm text-gray-700">Price is negotiable</span>
                    </label>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 space-y-4 border border-gray-200">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                        <Phone className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">Contact Information</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-800">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="tel" value={phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                              setPhone(val);
                              if (val.length === 11) setPhoneError(getPhoneValidationError(val));
                              else if (val.length > 0) setPhoneError(null);
                              else setPhoneError(null);
                            }}
                            placeholder="e.g. 08034567890"
                            className={`w-full pl-9 pr-3 py-2.5 text-sm font-medium bg-white border-2 rounded-lg focus:outline-none focus:ring-4 transition-all placeholder:text-gray-400 ${
                              phoneError ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
                            }`}
                            maxLength={11}
                          />
                          {phoneError && <p className="text-red-500 text-xs mt-1 font-medium">{phoneError}</p>}
                        </div>
                      </div>
                      {!sameAsPhone && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-gray-800">WhatsApp Number</label>
                          <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                              placeholder="e.g. 08034567890"
                              className="w-full pl-9 pr-3 py-2.5 text-sm font-medium bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all placeholder:text-gray-400"
                              maxLength={11} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <span className="text-xs font-medium text-gray-700">Is this your WhatsApp contact?</span>
                        </div>
                        <div className="flex items-center bg-gray-200 rounded-full p-0.5">
                          <button onClick={() => setSameAsPhone(true)}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${sameAsPhone ? 'bg-green-500 text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}>Yes</button>
                          <button onClick={() => setSameAsPhone(false)}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${!sameAsPhone ? 'bg-primary-600 text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}>No</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-end pt-6 border-t mt-8">
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Check className="w-4 h-4" /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>

              {/* Modals */}
              <CategorySelector
                isOpen={showCategorySelector}
                onClose={() => setShowCategorySelector(false)}
                onSelect={handleCategorySelect}
                selectedCategoryId={categoryId}
                selectedBreadcrumb={categoryBreadcrumb}
              />
              <LocationSelector
                isOpen={showLocationSelector}
                onClose={() => setShowLocationSelector(false)}
                onSelect={handleLocationSelect}
                selectedStateId={locationId}
                selectedLga={lgaId}
                selectedFullLocation={selectedStateName}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
