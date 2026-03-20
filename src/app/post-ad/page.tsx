'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Upload, X, Image as ImageIcon, MapPin, Tag, FileText, Check, ChevronRight, GripVertical, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { adsApi, locationsApi, categoriesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  uploading?: boolean;
  error?: string;
}

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

export default function PostAdPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [condition, setCondition] = useState<'new' | 'like_new' | 'good' | 'fair' | ''>('');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, locsRes] = await Promise.all([
          categoriesApi.getAll(),
          locationsApi.getAll()
        ]);
        setCategories(catsRes.data?.data || catsRes.data || []);
        setLocations(locsRes.data?.data || locsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch categories/locations:', err);
      }
    };
    fetchData();
  }, []);

  const selectedCategory = categories.find(c => c.id === categoryId);

  const formatPrice = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return Number(numericValue).toLocaleString();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPrice(value);
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Invalid format. Use JPG, PNG, WebP, GIF, or HEIC.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Max 5MB allowed.';
    }
    return null;
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - images.length;
    
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const filesToAdd = fileArray.slice(0, remainingSlots);
    const newImages: ImageFile[] = [];
    const errors: string[] = [];

    filesToAdd.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview: URL.createObjectURL(file),
          uploading: false,
        });
      }
    });

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
    }
  }, [images.length]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDropReorder = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    
    setImages(prev => {
      const newImages = [...prev];
      const [draggedItem] = newImages.splice(draggedIndex, 1);
      newImages.splice(targetIndex, 0, draggedItem);
      return newImages;
    });
    setDraggedIndex(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category_id', categoryId!.toString());
      formData.append('location_id', locationId!.toString());
      formData.append('condition', condition);
      
      images.forEach((img) => {
        formData.append('images[]', img.file);
      });

      const res = await adsApi.create(formData);
      console.log('Success:', res.data);
      
      images.forEach(img => URL.revokeObjectURL(img.preview));
      
      const successMessage = res.data?.message || 'Ad posted successfully! Pending approval from admin.';
      toast.success(successMessage);
      
      setTimeout(() => {
        router.push('/dashboard/my-ads');
      }, 2000);
    } catch (error: any) {
      console.error('Error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to post ad';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToStep2 = title && description && categoryId && locationId && condition;
  const canSubmit = canProceedToStep2 && price && images.length > 0;
  const remainingSlots = MAX_IMAGES - images.length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-gray-900">Post Your Ad</h1>
              <p className="text-gray-500 mt-2">Fill in the details to list your item on the marketplace</p>
            </div>

            <div className="flex items-center justify-center mb-10">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > 1 ? <Check className="w-5 h-5" /> : '1'}
                </div>
                <div className={`w-20 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > 2 ? <Check className="w-5 h-5" /> : '2'}
                </div>
                <div className={`w-20 h-1 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </div>
              </div>
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
                          placeholder="Describe your item in detail. Include condition, features, and any relevant information."
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
                          value={formatPrice(price)}
                          onChange={handlePriceChange}
                          placeholder="0"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Images * ({images.length}/{MAX_IMAGES})
                      </label>
                      <div
                        ref={dropZoneRef}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => remainingSlots > 0 && fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                          isDragging 
                            ? 'border-primary-500 bg-primary-50' 
                            : remainingSlots > 0 
                              ? 'border-gray-300 hover:border-primary-500 hover:bg-gray-50' 
                              : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept={ACCEPTED_FORMATS.join(',')}
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={remainingSlots <= 0}
                        />
                        <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-primary-600' : 'text-gray-400'}`} />
                        <p className="text-gray-600 font-medium">
                          {isDragging ? 'Drop images here' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {remainingSlots > 0 ? `${remainingSlots} more image${remainingSlots > 1 ? 's' : ''} allowed` : 'Maximum images reached'}
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          JPG, PNG, WebP, GIF, HEIC up to 5MB
                        </p>
                      </div>

                      {images.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">
                            Drag images to reorder. First image is the primary.
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {images.map((img, index) => (
                              <div
                                key={img.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDropReorder(index)}
                                className={`relative aspect-square rounded-lg overflow-hidden group cursor-move ${
                                  draggedIndex === index ? 'opacity-50' : ''
                                }`}
                              >
                                <img src={img.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <GripVertical className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(img.id);
                                  }}
                                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                {index === 0 && (
                                  <span className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-2 py-0.5 rounded">
                                    Primary
                                  </span>
                                )}
                                <div className="absolute top-1 left-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs">
                                  <GripVertical className="w-3 h-3" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        disabled={!price || images.length === 0}
                        className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        Continue <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Preview Your Ad</h2>

                    <div className="border border-gray-200 rounded-xl p-4">
                      {images[0] && (
                        <div className="aspect-video rounded-lg overflow-hidden mb-4">
                          <img src={images[0].preview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full mb-2">
                              {condition === 'new' ? 'New' : condition === 'like_new' ? 'Like New' : condition === 'good' ? 'Good' : 'Fair'}
                            </span>
                            <h3 className="text-xl font-semibold text-gray-900">{title || 'Ad Title'}</h3>
                          </div>
                          <p className="text-2xl font-bold text-primary-600">
                            ₦{Number(price).toLocaleString() || '0'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{locations.find((l: any) => l.id === locationId)?.name || 'Location'}</span>
                        </div>

                        <p className="text-gray-600">{description || 'Description will appear here...'}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(2)}
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
                            Publishing...
                          </>
                        ) : (
                          'Publish Ad'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-72 hidden lg:block">
                <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
                  <h3 className="font-semibold text-gray-900 mb-4">Posting Tips</h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Use clear, high quality photos</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Write a detailed description</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Set a competitive price</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Choose the right category</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Include your location</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
