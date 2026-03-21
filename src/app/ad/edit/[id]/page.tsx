'use client';

import { useState, useEffect } from 'react';
import OLXHeader from '@/components/home/OLXHeader';
import Footer from '@/components/layout/Footer';
import { Upload, X, MapPin, Tag, FileText, Check, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { adsApi, categoriesApi, locationsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface Location {
  id: number;
  name: string;
  slug: string;
}

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const adId = Number(params.id);
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [adNotFound, setAdNotFound] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [condition, setCondition] = useState<'new' | 'like_new' | 'good' | 'fair' | ''>('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{id: number; url: string; is_primary: boolean}[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [catsRes, locsRes] = await Promise.all([
        categoriesApi.getAll(),
        locationsApi.getAll(),
      ]);
      setCategories(catsRes.data?.data || catsRes.data || []);
      setLocations(locsRes.data?.data || locsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!adId || isNaN(adId)) {
      setAdNotFound(true);
      return;
    }
    
    const fetchAd = async () => {
      try {
        setIsLoading(true);
        const res = await adsApi.get(adId);
        const ad = res.data?.data || res.data;
        
        if (ad) {
          setTitle(ad.title || '');
          setDescription(ad.description || '');
          setPrice(ad.price?.toString() || '');
          setCategoryId(ad.category_id);
          setLocationId(ad.location_id);
          setCondition(ad.condition || '');
          
          if (ad.images && ad.images.length > 0) {
            setExistingImages(ad.images.map((img: any) => ({
              id: img.id,
              url: img.url,
              is_primary: img.is_primary,
            })));
            setImagePreview(ad.images.map((img: any) => img.url));
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

  const selectedCategory = categories.find(c => c.id === categoryId);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImages = [...images, ...files].slice(0, 6);
      setImages(newImages);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreview([...imagePreview, ...newPreviews].slice(0, 6));
    }
  };

  const removeImage = (index: number) => {
    if (index < existingImages.length) {
      const newExisting = existingImages.filter((_, i) => i !== index);
      setExistingImages(newExisting);
      setImagePreview(newExisting.map(img => img.url));
    } else {
      const newIndex = index - existingImages.length;
      const newImages = images.filter((_, i) => i !== newIndex);
      const newPreviews = imagePreview.filter((_, i) => i !== index);
      setImages(newImages);
      setImagePreview(newPreviews);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      if (categoryId) formData.append('category_id', categoryId.toString());
      if (locationId) formData.append('location_id', locationId.toString());
      if (condition) formData.append('condition', condition);
      
      images.forEach((img) => {
        formData.append('images[]', img);
      });

      await adsApi.update(adId, formData);
      toast.success('Ad updated successfully!');
      router.push('/dashboard/my-ads');
    } catch (error: any) {
      console.error('Error:', error);
      const message = error.response?.data?.message || 'Failed to update ad';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToStep2 = title && description && categoryId && locationId && condition;
  const canSubmit = canProceedToStep2 && price;
  const remainingSlots = 6 - images.length - existingImages.length;

  if (loadingData || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <OLXHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (adNotFound) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <OLXHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ad Not Found</h2>
            <p className="text-gray-500 mb-4">This ad doesn't exist or you don't have permission to edit it.</p>
            <button onClick={() => router.push('/dashboard/my-ads')} className="btn-primary">
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
      <OLXHeader />
      
      <main className="flex-1 py-8">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-gray-900">Edit Your Ad</h1>
              <p className="text-gray-500 mt-2">Update your listing details</p>
            </div>

            <div className="flex gap-8">
              <div className="flex-1">
                {step === 1 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Category *</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categories.map((cat: any) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategoryId(cat.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              categoryId === cat.id
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-2xl mb-1 block">{cat.icon}</span>
                            <span className="block font-medium text-gray-900">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Give your ad a catchy title"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe your item in detail..."
                          rows={6}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Condition *</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'new', label: 'New', desc: 'Brand new, never used' },
                          { value: 'like_new', label: 'Like New', desc: 'Barely used, excellent' },
                          { value: 'good', label: 'Good', desc: 'Minor signs of use' },
                          { value: 'fair', label: 'Fair', desc: 'Visible wear, works fine' },
                        ].map((cond) => (
                          <button
                            key={cond.value}
                            type="button"
                            onClick={() => setCondition(cond.value as any)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              condition === cond.value
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="block font-medium text-gray-900">{cond.label}</span>
                            <span className="text-sm text-gray-500">{cond.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={locationId || ''}
                          onChange={(e) => setLocationId(Number(e.target.value))}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
                        >
                          <option value="">Select a location</option>
                          {locations.map((loc: any) => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      disabled={!canProceedToStep2}
                      className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Continue <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Price & Images</h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">₦</span>
                        <input
                          type="text"
                          value={price}
                          onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="0"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isLoading}
                        className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
