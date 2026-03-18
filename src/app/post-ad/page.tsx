'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Upload, X, Image as ImageIcon, MapPin, Tag, FileText, Check, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { saveAd, generateAdId, generateSlug, StoredAd } from '@/lib/adStorage';
import { adsApi, locationsApi, categoriesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function PostAdPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Real data from API
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [condition, setCondition] = useState<'new' | 'used' | ''>('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<Record<string, string>>({});

  // Fetch categories and locations from API
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
    return Number(numericValue).toLocaleString('en-NG');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPrice(value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImages = [...images, ...files].slice(0, 10);
      setImages(newImages);

      // Generate previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreview([...imagePreview, ...newPreviews].slice(0, 10));
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreview(newPreviews);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Get category and location info
    const category = categories.find((c: any) => c.id === categoryId);
    const location = locations.find((l: any) => l.id === locationId);

    // Create image URLs from the uploaded files
    const adImages = imagePreview.map((url, index) => ({
      id: index + 1,
      url,
      is_primary: index === 0,
      order: index + 1,
    }));

    // Create new ad object with pending status
    const newAd: StoredAd = {
      id: generateAdId(),
      title,
      slug: generateSlug(title),
      description,
      price: Number(price),
      currency: 'NGN',
      condition,
      status: 'pending',
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: 1,
        name: 'Current User',
        email: 'user@example.com',
        phone: '+234 800 000 0000',
        created_at: new Date().toISOString(),
        verified: true,
      },
      category: {
        id: categoryId!,
        name: category?.name || '',
        slug: category?.slug || '',
        icon: category?.icon || '',
      },
      location: {
        id: locationId!,
        name: location?.name || '',
        slug: location?.slug || '',
      },
      images: adImages,
    };

    // Save to localStorage for demo
    saveAd(newAd);
    
// Try to send to backend API
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category_id', categoryId!.toString());
      formData.append('location_id', locationId!.toString());
      formData.append('condition', condition);
      
      images.forEach((img) => {
        formData.append('images[]', img);
      });

      const res = await adsApi.create(formData);
      console.log('Success:', res.data);
      toast.success('Ad posted successfully! Pending approval.');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error: ' + (error.message || 'Failed to post'));
    }
    
    setIsLoading(false);
    router.push('/dashboard/my-ads');
  };

  const canProceedToStep2 = title && description && categoryId && locationId && condition;
  const canSubmit = canProceedToStep2 && price && images.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-dark">Post Your Ad</h1>
              <p className="text-gray-500 mt-2">Fill in the details to list your item on the marketplace</p>
            </div>

            {/* Progress Steps */}
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
              {/* Main Form */}
              <div className="flex-1">
                {step === 1 && (
                  <div className="card p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-dark">Basic Information</h2>
                    
                    {/* Category Selection */}
                    <div>
                      <label className="label">Category *</label>
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
                            <span className="block mt-2 font-medium text-dark">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="label">Title *</label>
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Give your ad a catchy title"
                          className="input pl-12"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="label">Description *</label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe your item in detail"
                          rows={6}
                          className="input pl-12 resize-none"
                        />
                      </div>
                    </div>

                    {/* Condition */}
                    <div>
                      <label className="label">Condition *</label>
                      <div className="flex gap-4">
                        {(['new', 'used'] as const).map((cond) => (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => setCondition(cond)}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                              condition === cond
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            {cond === 'new' ? '✨ New' : '♻️ Used'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="label">Location *</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={locationId || ''}
                          onChange={(e) => setLocationId(Number(e.target.value))}
                          className="input pl-12 appearance-none cursor-pointer"
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
                      className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue <ChevronRight className="w-5 h-5 ml-1" />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="card p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-dark">Price & Images</h2>

                    {/* Price */}
                    <div>
                      <label className="label">Price *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">₦</span>
                        <input
                          type="text"
                          value={formatPrice(price)}
                          onChange={handlePriceChange}
                          placeholder="0"
                          className="input pl-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">NGN</span>
                      </div>
                    </div>

                    {/* Dynamic Specifications */}
                    {selectedCategory && selectedCategory.fields?.length > 0 && (
                      <div>
                        <h3 className="label">Specifications</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedCategory.fields.map((field: string) => (
                            <div key={field}>
                              <label className="text-sm text-gray-600 mb-1 block capitalize">{field.replace('_', ' ')}</label>
                              <input
                                type="text"
                                value={specifications[field] || ''}
                                onChange={(e) => setSpecifications({ ...specifications, [field]: e.target.value })}
                                className="input"
                                placeholder={`Enter ${field.replace('_', ' ')}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Images */}
                    <div>
                      <label className="label">Images * (up to 10)</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-600 font-medium">Click to upload images</p>
                          <p className="text-gray-400 text-sm mt-1">PNG, JPG up to 10MB each</p>
                        </label>
                      </div>

                      {/* Image Previews */}
                      {imagePreview.length > 0 && (
                        <div className="grid grid-cols-4 gap-3 mt-4">
                          {imagePreview.map((preview, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              {index === 0 && (
                                <span className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-2 py-0.5 rounded">
                                  Primary
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="btn-outline flex-1"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        disabled={!price || images.length === 0}
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue <ChevronRight className="w-5 h-5 ml-1" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="card p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-dark">Preview Your Ad</h2>

                    <div className="border border-gray-200 rounded-xl p-4">
                      {/* Preview Image */}
                      {imagePreview[0] && (
                        <div className="aspect-video rounded-lg overflow-hidden mb-4">
                          <img src={imagePreview[0]} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="badge-primary mb-2">{condition === 'new' ? 'New' : 'Used'}</span>
                            <h3 className="text-xl font-semibold text-dark">{title || 'Ad Title'}</h3>
                          </div>
                          <p className="text-2xl font-bold text-primary-600">
                            ₦{Number(price).toLocaleString('en-NG') || '0'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{locations.find((l: any) => l.id === locationId)?.name || 'Location'}</span>
                        </div>

                        <p className="text-gray-600">{description || 'Description will appear here...'}</p>

                        {specifications && Object.keys(specifications).length > 0 && (
                          <div className="border-t pt-3 mt-3">
                            <h4 className="font-medium text-dark mb-2">Specifications</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(specifications).map(([key, value]) => (
                                value && (
                                  <div key={key} className="text-sm">
                                    <span className="text-gray-500 capitalize">{key.replace('_', ' ')}: </span>
                                    <span className="text-dark">{value}</span>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(2)}
                        className="btn-outline flex-1"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isLoading}
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Publishing...' : 'Publish Ad'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="w-72 hidden lg:block">
                <div className="card p-4 sticky top-24">
                  <h3 className="font-semibold text-dark mb-4">Posting Tips</h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex gap-2">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span>Use clear, high-quality photos</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span>Write a detailed description</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span>Set a competitive price</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span>Choose the right category</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
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
