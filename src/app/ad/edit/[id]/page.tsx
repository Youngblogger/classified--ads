'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Upload, X, Image as ImageIcon, DollarSign, MapPin, Tag, FileText, Check, ChevronRight } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { getStoredAd, saveAd, updateAd, StoredAd } from '@/lib/adStorage';

const mockCategories = [
  { id: 1, name: 'Vehicles', slug: 'vehicles', icon: '🚗', fields: ['make', 'model', 'year', 'mileage', 'fuel_type', 'transmission'] },
  { id: 2, name: 'Electronics', slug: 'electronics', icon: '📱', fields: ['brand', 'model', 'condition_detail', 'warranty'] },
  { id: 3, name: 'Furniture', slug: 'furniture', icon: '🛋️', fields: ['material', 'size', 'color', 'room_type'] },
  { id: 4, name: 'Fashion', slug: 'fashion', icon: '👗', fields: ['brand', 'size', 'color', 'gender', 'material'] },
  { id: 5, name: 'Real Estate', slug: 'real-estate', icon: '🏠', fields: ['property_type', 'bedrooms', 'bathrooms', 'sqft', 'year_built'] },
  { id: 6, name: 'Jobs', slug: 'jobs', icon: '💼', fields: ['job_type', 'salary', 'experience', 'education'] },
];

const mockLocations = [
  { id: 1, name: 'New York', slug: 'new-york' },
  { id: 2, name: 'Los Angeles', slug: 'los-angeles' },
  { id: 3, name: 'Chicago', slug: 'chicago' },
  { id: 4, name: 'Houston', slug: 'houston' },
  { id: 5, name: 'Miami', slug: 'miami' },
];

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const adId = Number(params.id);
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [adNotFound, setAdNotFound] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [condition, setCondition] = useState<'new' | 'used' | ''>('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{id: number; url: string; is_primary: boolean; order: number}[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<Record<string, string>>({});

  useEffect(() => {
    const ad = getStoredAd(adId);
    if (ad) {
      setTitle(ad.title);
      setDescription(ad.description);
      setPrice(ad.price.toString());
      setCategoryId(ad.category.id);
      setLocationId(typeof ad.location === 'object' ? ad.location.id : null);
      setCondition(ad.condition as 'new' | 'used');
      setExistingImages(ad.images || []);
      setImagePreview(ad.images?.map(img => img.url) || []);
    } else {
      setAdNotFound(true);
    }
  }, [adId]);

  const selectedCategory = mockCategories.find(c => c.id === categoryId);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImages = [...images, ...files].slice(0, 10);
      setImages(newImages);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreview([...imagePreview, ...newPreviews].slice(0, 10));
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
    
    const category = mockCategories.find(c => c.id === categoryId);
    const location = mockLocations.find(l => l.id === locationId);

    const allImages = [
      ...existingImages.map((img, idx) => ({
        id: idx + 1,
        url: img.url,
        is_primary: idx === 0,
        order: idx + 1,
      })),
      ...imagePreview.slice(existingImages.length).map((url, index) => ({
        id: existingImages.length + index + 1,
        url,
        is_primary: false,
        order: existingImages.length + index + 1,
      }))
    ];

    const updatedAd: StoredAd = {
      id: adId,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      description,
      price: Number(price),
      currency: 'USD',
      condition: condition || 'used',
      status: 'active',
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
      images: allImages,
    };

    updateAd(updatedAd);
    
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard/my-ads');
    }, 2000);
  };

  const canProceedToStep2 = title && description && categoryId && locationId && condition;
  const canSubmit = canProceedToStep2 && price && (existingImages.length > 0 || images.length > 0);

  if (adNotFound) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ad Not Found</h1>
            <p className="text-gray-500 mb-4">The ad you're trying to edit doesn't exist.</p>
            <button 
              onClick={() => router.push('/dashboard/my-ads')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg"
            >
              Back to My Ads
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-dark">Edit Your Ad</h1>
              <p className="text-gray-500 mt-2">Update the details of your listing</p>
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
                  <div className="card p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-dark">Basic Information</h2>
                    
                    <div>
                      <label className="label">Category *</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {mockCategories.map((cat) => (
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
                            <span className="text-2xl">{cat.icon}</span>
                            <span className="block mt-2 font-medium text-dark">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

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
                          {mockLocations.map((loc) => (
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

                    <div>
                      <label className="label">Price *</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0.00"
                          className="input pl-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">USD</span>
                      </div>
                    </div>

                    {selectedCategory && selectedCategory.fields.length > 0 && (
                      <div>
                        <h3 className="label">Specifications</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedCategory.fields.map((field) => (
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
                        disabled={!price || imagePreview.length === 0}
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue <ChevronRight className="w-5 h-5 ml-1" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="card p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-dark">Preview Your Changes</h2>

                    <div className="border border-gray-200 rounded-xl p-4">
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
                            ${Number(price).toLocaleString() || '0'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{mockLocations.find(l => l.id === locationId)?.name || 'Location'}</span>
                        </div>

                        <p className="text-gray-600">{description || 'Description will appear here...'}</p>
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
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-72 hidden lg:block">
                <div className="card p-4 sticky top-24">
                  <h3 className="font-semibold text-dark mb-4">Editing Tips</h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex gap-2">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span>Keep your title descriptive</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span>Update photos to attract more buyers</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span>Adjust price if needed</span>
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
