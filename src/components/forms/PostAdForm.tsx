'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, MapPin, Tag, FileText, Check, ChevronRight, GripVertical, Loader2, Phone, MessageCircle, MapPinned } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { adsApi } from '@/lib/api';
import { useAuthStore, useUIStore } from '@/lib/store';
import { nigeriaLocations } from '@/lib/nigeriaLocations';
import toast from 'react-hot-toast';
import CategorySelector from '@/components/ui/CategorySelector';
import LocationSelector from '@/components/ui/LocationSelector';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  uploading?: boolean;
  error?: string;
}

interface PostAdFormProps {
  onSuccess?: (adId: number) => void;
  isStandalone?: boolean;
}

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

export default function PostAdForm({ onSuccess, isStandalone = true }: PostAdFormProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toggleLoginModal, toggleRegisterModal } = useUIStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const [categories, setCategories] = useState<any[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryBreadcrumb, setCategoryBreadcrumb] = useState<string>('');
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [locationBreadcrumb, setLocationBreadcrumb] = useState<string>('');
  const [locationId, setLocationId] = useState<number | null>(null);
  const [lgaId, setLgaId] = useState<string>('');
  const [condition, setCondition] = useState<'new' | 'like_new' | 'good' | 'fair' | ''>('');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Local fallback categories (same as homepage)
  const localCategories = [
    { id: 1, name: 'Vehicles', slug: 'vehicles', icon: 'Car', children: [
      { id: 101, name: 'Cars', slug: 'cars' },
      { id: 102, name: 'Motorcycles', slug: 'motorcycles' },
      { id: 103, name: 'Buses & Vans', slug: 'buses-vans' },
      { id: 104, name: 'Trucks & Trailers', slug: 'trucks-trailers' },
    ]},
    { id: 2, name: 'Property', slug: 'property', icon: 'Home', children: [
      { id: 201, name: 'Apartments for Rent', slug: 'apartments-rent' },
      { id: 202, name: 'Apartments for Sale', slug: 'apartments-sale' },
      { id: 203, name: 'Houses for Rent', slug: 'houses-rent' },
      { id: 204, name: 'Houses for Sale', slug: 'houses-sale' },
    ]},
    { id: 3, name: 'Mobile Phones & Tablets', slug: 'mobile-phones', icon: 'Smartphone', children: [
      { id: 301, name: 'Smartphones', slug: 'smartphones' },
      { id: 302, name: 'Tablets', slug: 'tablets' },
      { id: 303, name: 'Smartwatches', slug: 'smartwatches' },
      { id: 304, name: 'Phone Accessories', slug: 'phone-accessories' },
    ]},
    { id: 4, name: 'Electronics', slug: 'electronics', icon: 'Monitor', children: [
      { id: 401, name: 'Laptops', slug: 'laptops' },
      { id: 402, name: 'Desktop Computers', slug: 'desktops' },
      { id: 403, name: 'Televisions', slug: 'tvs' },
      { id: 404, name: 'Gaming Consoles', slug: 'gaming' },
    ]},
    { id: 5, name: 'Fashion', slug: 'fashion', icon: 'Shirt', children: [
      { id: 501, name: "Men's Clothing", slug: 'men-clothing' },
      { id: 502, name: "Women's Clothing", slug: 'women-clothing' },
      { id: 503, name: 'Shoes', slug: 'shoes' },
      { id: 504, name: 'Watches', slug: 'watches' },
    ]},
    { id: 6, name: 'Home, Furniture & Appliances', slug: 'home-furniture', icon: 'Sofa', children: [
      { id: 601, name: 'Furniture', slug: 'furniture' },
      { id: 602, name: 'Home Decor', slug: 'home-decor' },
      { id: 603, name: 'Kitchen Appliances', slug: 'kitchen-appliances' },
      { id: 604, name: 'Bedding', slug: 'bedding' },
    ]},
    { id: 7, name: 'Jobs', slug: 'jobs', icon: 'Briefcase', children: [
      { id: 701, name: 'Full-time Jobs', slug: 'full-time' },
      { id: 702, name: 'Part-time Jobs', slug: 'part-time' },
      { id: 703, name: 'Remote Jobs', slug: 'remote' },
      { id: 704, name: 'Internships', slug: 'internships' },
    ]},
    { id: 8, name: 'Services', slug: 'services', icon: 'Wrench', children: [
      { id: 801, name: 'Cleaning Services', slug: 'cleaning' },
      { id: 802, name: 'Repair & Maintenance', slug: 'repair' },
      { id: 803, name: 'Moving & Logistics', slug: 'moving' },
      { id: 804, name: 'Event Services', slug: 'events' },
    ]},
    { id: 9, name: 'Pets', slug: 'pets', icon: 'Dog', children: [
      { id: 901, name: 'Dogs', slug: 'dogs' },
      { id: 902, name: 'Cats', slug: 'cats' },
      { id: 903, name: 'Birds', slug: 'birds' },
      { id: 904, name: 'Pet Food', slug: 'pet-food' },
    ]},
    { id: 10, name: 'Health & Beauty', slug: 'health-beauty', icon: 'Heart', children: [
      { id: 1001, name: 'Skincare', slug: 'skincare' },
      { id: 1002, name: 'Haircare', slug: 'haircare' },
      { id: 1003, name: 'Makeup', slug: 'makeup' },
      { id: 1004, name: 'Fragrances', slug: 'fragrances' },
    ]},
  ];

  useEffect(() => {
    // Use local categories as default
    setCategories(localCategories);
    
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
        const catsRes = await fetch(`${API_URL}/categories`);
        const catsData = await catsRes.json();
        
        let allCategories = catsData?.data || [];
        if (allCategories.length > 0) {
          setCategories(allCategories);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  // Get LGAs for selected state from local data
  const getLgasForState = (stateSlug: string): string[] => {
    const state = nigeriaLocations.find(loc => loc.slug === stateSlug);
    return state?.lgas || [];
  };
  
  // Map local state slug to API numeric ID
  const stateSlugToId: Record<string, number> = {
    'abia': 1, 'abuja': 2, 'adamawa': 3, 'akwa-ibom': 4, 'anambra': 5,
    'bauchi': 6, 'bayelsa': 7, 'benue': 8, 'borno': 9, 'cross-river': 10,
    'delta': 11, 'ebonyi': 12, 'edo': 13, 'ekiti': 14, 'enugu': 15,
    'gombe': 16, 'imo': 17, 'jigawa': 18, 'kaduna': 19, 'kano': 20,
    'katsina': 21, 'kebbi': 22, 'kogi': 23, 'kwara': 24, 'lagos': 25,
    'nasarawa': 26, 'niger': 27, 'ogun': 28, 'ondo': 29, 'osun': 30,
    'oyo': 31, 'plateau': 32, 'rivers': 33, 'sokoto': 34, 'taraba': 35,
    'yobe': 36, 'zamfara': 37
  };
  
  const selectedState = locationId ? nigeriaLocations.find(loc => stateSlugToId[loc.slug] === locationId) : null;
  const stateLgas = selectedState?.lgas || [];

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleImageDragOver = (e: React.DragEvent, targetIndex: number) => {
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

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const nextStep = () => {
    if (step === 1 && !categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (step === 1 && !locationId) {
      toast.error('Please select a location');
      return;
    }
    if (step === 2 && (!title || title.length < 5)) {
      toast.error('Please enter a title (at least 5 characters)');
      return;
    }
    if (step === 2 && images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }
    if (step === 3 && (!price || parseFloat(price) <= 0)) {
      toast.error('Please enter a valid price');
      return;
    }
    setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const canSubmit = title && description && price && categoryId && locationId && images.length > 0 && condition;

  const handleSubmit = async () => {
    if (!canSubmit || isLoading) return;

    if (!isAuthenticated) {
      toast.error('Please login to post an ad.');
      toggleLoginModal();
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('negotiable', negotiable ? '1' : '0');
      formData.append('category_id', String(categoryId));
      formData.append('location_id', String(locationId));
      if (lgaId) formData.append('lga', lgaId);
      formData.append('condition', condition);
      if (phone) formData.append('phone', phone);
      if (whatsapp) formData.append('whatsapp', whatsapp);
      
      images.forEach((img, index) => {
        formData.append('images[]', img.file);
      });

      const response = await adsApi.create(formData);
      
      const adSlug = response.data?.slug || response.data?.data?.slug;
      const adId = response.data?.id || response.data?.data?.id;
      
      setIsLoading(false);
      
      // Reset form
      setStep(1);
      setTitle('');
      setDescription('');
      setPrice('');
      setCategoryId(null);
      setLocationId(null);
      setLgaId('');
      setCondition('');
      setImages([]);
      
      // Show success message
      toast.success(
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <p className="font-semibold">Ad posted successfully!</p>
          </div>
          <p className="text-sm text-gray-600">Your ad is now live on the homepage!</p>
        </div>,
        { duration: 6000 }
      );
      
      // Redirect to homepage after short delay
      if (isStandalone) {
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
      
      if (onSuccess) {
        onSuccess(adId);
      }
    } catch (err: any) {
      console.error('Post ad error:', err);
      
      let errorMsg = 'Failed to post ad. Please try again.';
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        if (Array.isArray(firstError) && firstError[0]) {
          errorMsg = firstError[0];
        }
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMsg = 'Cannot connect to server. Please ensure the backend is running on Laragon.';
      } else if (err.code === 'ECONNABORTED') {
        errorMsg = 'Request timed out. Please try again.';
      } else if (err.response?.status === 401) {
        errorMsg = 'Please login to post an ad.';
        toggleLoginModal();
      } else if (err.response?.status === 422) {
        errorMsg = 'Validation error. Please check your input.';
      } else if (err.response?.status === 500) {
        errorMsg = 'Server error. Please try again later.';
      }
      
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === categoryId || c.children?.some((child: any) => child.id === categoryId));

  const handleCategorySelect = (id: number, name: string, breadcrumb: string) => {
    setCategoryId(id);
    setCategoryBreadcrumb(breadcrumb);
  };

  const handleLocationSelect = (stateId: number, stateName: string, lga: string, fullLocation: string) => {
    setLocationId(stateId);
    setLgaId(lga);
    setLocationBreadcrumb(fullLocation);
  };

  const conditionLabels = {
    'new': 'Brand New',
    'like_new': 'Like New',
    'good': 'Good',
    'fair': 'Fair'
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['Category', 'Details', 'Price', 'Review'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              step > i + 1 ? 'bg-green-500 text-white' :
              step === i + 1 ? 'bg-primary-600 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`ml-2 text-sm hidden sm:inline ${step >= i + 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {s}
            </span>
            {i < 3 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Category & Location */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <button
              onClick={() => setShowCategorySelector(true)}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 transition-colors bg-white"
            >
              <span className={categoryBreadcrumb ? 'text-gray-900' : 'text-gray-400'}>
                {categoryBreadcrumb || 'Select Category'}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <button
              onClick={() => setShowLocationSelector(true)}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 transition-colors bg-white"
            >
              <span className={locationBreadcrumb ? 'text-gray-900' : 'text-gray-400'}>
                {locationBreadcrumb || 'Select Location'}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(up to {MAX_IMAGES})</span>
            </label>
            <div
              ref={dropZoneRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleImageClick}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors bg-white ${
                isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FORMATS.join(',')}
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Click or drag photos here</p>
              <p className="text-gray-400 text-sm mt-1">JPG, PNG, WebP, GIF, HEIC - Max 5MB</p>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleImageDragOver(e, index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                      draggedIndex === index ? 'border-primary-500 opacity-50' : 'border-gray-200'
                    }`}
                  >
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                      <GripVertical className="w-3 h-3" />
                    </div>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <div
                    onClick={handleImageClick}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-gray-50"
                  >
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. iPhone 14 Pro Max 256GB"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors bg-white text-gray-900 placeholder-gray-400"
              maxLength={100}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item in detail..."
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors resize-none bg-white text-gray-900 placeholder-gray-400"
              maxLength={2000}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/2000</p>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Condition <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['new', 'like_new', 'good', 'fair'] as const).map((cond) => (
                <button
                  key={cond}
                  onClick={() => setCondition(cond)}
                  className={`p-3 rounded-xl border-2 text-center transition-all bg-white ${
                    condition === cond
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-900'
                  }`}
                >
                  <span className="font-medium text-sm">{conditionLabels[cond]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors bg-white text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp (optional)
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="08012345678"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors bg-white text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Price */}
      {step === 3 && (
        <div className="max-w-md mx-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">₦</span>
              <input
                type="text"
                value={formatPrice(price)}
                onChange={handlePriceChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-4 text-2xl border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors font-bold bg-white text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={negotiable}
              onChange={(e) => setNegotiable(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700">Price is negotiable</span>
          </label>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {images[0] && (
                <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={images[0].preview} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg sm:text-base break-words">{title || 'No title'}</h3>
                <p className="text-xl sm:text-2xl font-bold text-primary-600 mt-1">
                  ₦{formatPrice(price) || '0'}
                  {negotiable && <span className="text-sm font-normal text-gray-500 ml-2">Negotiable</span>}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-500">Category:</span>
                <span className="text-gray-900 font-medium">{selectedCategory?.name || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-500">Location:</span>
                <span className="text-gray-900 font-medium">
                  {selectedState?.name || 'N/A'}{lgaId ? ` > ${lgaId}` : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-500">Condition:</span>
                <span className="text-gray-900 font-medium">{condition && conditionLabels[condition as keyof typeof conditionLabels] || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-500">Photos:</span>
                <span className="text-gray-900 font-medium">{images.length}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-500 text-sm">Description:</span>
              <p className="text-gray-700 mt-1 text-sm line-clamp-3">{description || 'No description'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        {step > 1 ? (
          <button
            onClick={prevStep}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            onClick={nextStep}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                Post Ad
                <Check className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Category Modal */}
      <div id="category-modal" className="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Select Category</h3>
            <button onClick={() => document.getElementById('category-modal')?.classList.add('hidden')} className="p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {categories.map((cat) => (
              <div key={cat.id}>
                <button
                  onClick={() => {
                    if (cat.children?.length > 0) {
                      setCategoryId(cat.children[0].id);
                    } else {
                      setCategoryId(cat.id);
                    }
                    document.getElementById('category-modal')?.classList.add('hidden');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg"
                >
                  {cat.name}
                </button>
                {cat.children?.map((child: any) => (
                  <button
                    key={child.id}
                    onClick={() => {
                      setCategoryId(child.id);
                      document.getElementById('category-modal')?.classList.add('hidden');
                    }}
                    className="w-full text-left px-8 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Selector Modal */}
      <CategorySelector
        isOpen={showCategorySelector}
        onClose={() => setShowCategorySelector(false)}
        onSelect={handleCategorySelect}
        selectedCategoryId={categoryId}
        selectedBreadcrumb={categoryBreadcrumb}
      />

      {/* Location Selector Modal */}
      <LocationSelector
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onSelect={handleLocationSelect}
        selectedStateId={locationId}
        selectedLga={lgaId}
        selectedFullLocation={locationBreadcrumb}
      />
    </div>
  );
}
