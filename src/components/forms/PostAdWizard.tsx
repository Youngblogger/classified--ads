'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Upload, X, Image as ImageIcon, Check, ChevronRight, ChevronLeft,
  GripVertical, Loader2, Phone, Zap, ArrowRight, ArrowLeft,
  Shield, Clock, Star, AlertCircle
} from 'lucide-react';
import { adsApi } from '@/lib/api';
import { useAuthStore, useUIStore } from '@/lib/store';
import { getPhoneValidationError, getAdImageUrl } from '@/lib/utils';
import { nigeriaLocations } from '@/lib/nigeriaLocations';
import toast from 'react-hot-toast';
import { getAuthToken } from '@/lib/cookies';
import CategorySelector from '@/components/ui/CategorySelector';
import LocationSelector from '@/components/ui/LocationSelector';
import { compressImage } from '@/lib/imageCompression';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

type WizardStep = 'form' | 'boost' | 'payment';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface BoostOption {
  value: 'top' | 'featured' | 'highlight';
  label: string;
  description: string;
  icon: string;
  color: string;
}

const BOOST_OPTIONS: BoostOption[] = [
  { value: 'top', label: 'Top Deal', description: 'Appear at the top of search results', icon: '🚀', color: 'from-blue-500 to-blue-600' },
  { value: 'featured', label: 'Featured', description: 'Highlighted with a special badge', icon: '⭐', color: 'from-amber-500 to-orange-500' },
  { value: 'highlight', label: 'Highlight', description: 'Stand out with a colored border', icon: '💎', color: 'from-purple-500 to-purple-600' },
];

const DURATIONS = [1, 3, 7, 14, 30];
const DURATION_LABELS: Record<number, string> = {
  1: '1 day', 3: '3 days', 7: '7 days', 14: '14 days', 30: '30 days',
};

const localCategories = [
  { id: 1, name: 'Vehicles', slug: 'vehicles', icon: 'Car', children: [
    { id: 101, name: 'Cars', slug: 'cars' }, { id: 102, name: 'Motorcycles', slug: 'motorcycles' },
    { id: 103, name: 'Buses & Vans', slug: 'buses-vans' }, { id: 104, name: 'Trucks & Trailers', slug: 'trucks-trailers' },
  ]},
  { id: 2, name: 'Property', slug: 'property', icon: 'Home', children: [
    { id: 201, name: 'Apartments for Rent', slug: 'apartments-rent' }, { id: 202, name: 'Apartments for Sale', slug: 'apartments-sale' },
    { id: 203, name: 'Houses for Rent', slug: 'houses-rent' }, { id: 204, name: 'Houses for Sale', slug: 'houses-sale' },
  ]},
  { id: 3, name: 'Mobile Phones & Tablets', slug: 'mobile-phones', icon: 'Smartphone', children: [
    { id: 301, name: 'Smartphones', slug: 'smartphones' }, { id: 302, name: 'Tablets', slug: 'tablets' },
    { id: 303, name: 'Smartwatches', slug: 'smartwatches' }, { id: 304, name: 'Phone Accessories', slug: 'phone-accessories' },
  ]},
  { id: 4, name: 'Electronics', slug: 'electronics', icon: 'Monitor', children: [
    { id: 401, name: 'Laptops', slug: 'laptops' }, { id: 402, name: 'Desktop Computers', slug: 'desktops' },
    { id: 403, name: 'Televisions', slug: 'tvs' }, { id: 404, name: 'Gaming Consoles', slug: 'gaming' },
  ]},
  { id: 5, name: 'Fashion', slug: 'fashion', icon: 'Shirt', children: [
    { id: 501, name: "Men's Clothing", slug: 'men-clothing' }, { id: 502, name: "Women's Clothing", slug: 'women-clothing' },
    { id: 503, name: 'Shoes', slug: 'shoes' }, { id: 504, name: 'Watches', slug: 'watches' },
  ]},
  { id: 6, name: 'Home, Furniture & Appliances', slug: 'home-furniture', icon: 'Sofa', children: [
    { id: 601, name: 'Furniture', slug: 'furniture' }, { id: 602, name: 'Home Decor', slug: 'home-decor' },
    { id: 603, name: 'Kitchen Appliances', slug: 'kitchen-appliances' }, { id: 604, name: 'Bedding', slug: 'bedding' },
  ]},
  { id: 7, name: 'Jobs', slug: 'jobs', icon: 'Briefcase', children: [
    { id: 701, name: 'Full-time Jobs', slug: 'full-time-jobs' }, { id: 702, name: 'Part-time Jobs', slug: 'part-time-jobs' },
    { id: 703, name: 'Remote Jobs', slug: 'remote-jobs' }, { id: 704, name: 'Internships', slug: 'internship-jobs' },
  ]},
  { id: 8, name: 'Services', slug: 'services', icon: 'Wrench', children: [
    { id: 801, name: 'Cleaning Services', slug: 'cleaning-services' }, { id: 802, name: 'Repair & Maintenance', slug: 'repair-services' },
    { id: 803, name: 'Moving & Logistics', slug: 'moving-services' }, { id: 804, name: 'Event Services', slug: 'event-planning' },
  ]},
  { id: 9, name: 'Pets', slug: 'pets', icon: 'Dog', children: [
    { id: 901, name: 'Dogs', slug: 'dogs' }, { id: 902, name: 'Cats', slug: 'cats' },
    { id: 903, name: 'Birds', slug: 'birds' }, { id: 904, name: 'Pet Food', slug: 'pet-food' },
  ]},
  { id: 10, name: 'Health & Beauty', slug: 'health-beauty', icon: 'Heart', children: [
    { id: 1001, name: 'Skincare', slug: 'skincare' }, { id: 1002, name: 'Haircare', slug: 'haircare' },
    { id: 1003, name: 'Makeup', slug: 'makeup' }, { id: 1004, name: 'Fragrances', slug: 'fragrances' },
  ]},
];

export default function PostAdWizard() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toggleLoginModal } = useUIStore();

  const [wizardStep, setWizardStep] = useState<WizardStep>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [fetchingPrices, setFetchingPrices] = useState(false);

  // Form state
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
  const [images, setImages] = useState<ImageFile[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [categories, setCategories] = useState<any[]>(localCategories);

  // Boost state
  const [boostType, setBoostType] = useState<'top' | 'featured' | 'highlight'>('top');
  const [duration, setDuration] = useState(7);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedPhone = localStorage.getItem('user_phone');
    if (savedPhone && !phone) setPhone(savedPhone);
  }, [phone]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (data?.data?.length > 0) setCategories(data.data);
      } catch {}
    };
    fetchCategories();
  }, []);

  const fetchBoostPrices = async () => {
    try {
      setFetchingPrices(true);
      const res = await fetch(`${API_URL}/ads/boost-prices`);
      const data = await res.json();
      if (data.data?.prices) setPrices(data.data.prices);
      else setPrices({ top: 5, featured: 10, highlight: 3 });
    } catch {
      setPrices({ top: 5, featured: 10, highlight: 3 });
    } finally {
      setFetchingPrices(false);
    }
  };

  useEffect(() => {
    fetchBoostPrices();
  }, []);

  const calculatePrice = (): number => {
    const basePrice = prices[boostType] || 5;
    const multiplier = duration >= 30 ? 0.7 : duration >= 14 ? 0.8 : duration >= 7 ? 0.85 : duration >= 3 ? 0.9 : 1.0;
    return Math.round(basePrice * duration * multiplier * 100) / 100;
  };

  const getCategoryName = (id: number | null): string => {
    if (!id) return '';
    const cat = categories.find(c => c.id === id || c.children?.some((child: any) => child.id === id));
    if (cat?.children?.some((child: any) => child.id === id)) {
      const child = cat.children.find((child: any) => child.id === id);
      return child?.name || '';
    }
    return cat?.name || '';
  };

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

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) return 'Invalid format. Use JPG, PNG, WebP, GIF, or HEIC.';
    if (file.size > MAX_FILE_SIZE) return 'File too large. Max 5MB allowed.';
    return null;
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) { toast.error(`Maximum ${MAX_IMAGES} images allowed.`); return; }

    const filesToAdd = fileArray.slice(0, remainingSlots);
    const newImages: ImageFile[] = [];
    const errors: string[] = [];

    for (const file of filesToAdd) {
      const error = validateFile(file);
      if (error) { errors.push(`${file.name}: ${error}`); continue; }
      try {
        const compressed = await compressImage(file);
        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file: compressed.file,
          preview: compressed.preview,
        });
      } catch { errors.push(`${file.name}: Failed to process`); }
    }

    if (errors.length > 0) errors.forEach(err => toast.error(err));
    if (newImages.length > 0) setImages(prev => [...prev, ...newImages]);
  }, [images.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);

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
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const handleImageClick = () => { fileInputRef.current?.click(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) { processFiles(e.target.files); e.target.value = ''; }
  };

  const handleCategorySelect = (id: number, name: string, breadcrumb: string) => {
    setCategoryId(id); setCategoryBreadcrumb(breadcrumb);
  };

  const handleLocationSelect = (stateId: number, stateName: string, lga: string, fullLocation: string) => {
    setLocationId(stateId); setSelectedStateName(stateName); setLgaId(lga);
  };

  const conditionLabels: Record<string, string> = {
    'new': 'Brand New', 'like_new': 'Like New', 'good': 'Used', 'fair': 'Refurbished'
  };

  const formatPriceInput = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return Number(numericValue).toLocaleString();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value.replace(/[^0-9]/g, ''));
  };

  const isFormValid = title && description && price && parseFloat(price) > 0 && categoryId && locationId && images.length > 0 && condition;

  const handleContinueToBoost = () => {
    if (!isAuthenticated) {
      toast.error('Please login to post an ad.');
      toggleLoginModal();
      return;
    }
    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }
    setWizardStep('boost');
  };

  const handleSkipBoost = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const formData = buildFormData();
      const response = await adsApi.create(formData);
      const adSlug = response.data?.slug || response.data?.data?.slug;

      toast.success(
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <p className="font-semibold">Ad posted successfully!</p>
          </div>
          <p className="text-sm text-gray-600">Your ad is now live on the homepage!</p>
        </div>,
        { duration: 3000 }
      );

      clearDraft();
      setTimeout(() => router.push('/'), 800);
    } catch (err: any) {
      let errorMsg = 'Failed to post ad. Please try again.';
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0];
        if (Array.isArray(firstError) && firstError[0]) errorMsg = firstError[0];
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoostAd = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const formData = buildFormData();
      const token = getAuthToken();

      formData.append('boost_type', boostType);
      formData.append('duration_days', String(duration));

      const response = await fetch(`${API_URL}/ads/boost-on-publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate boost');
      }

      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to process boost');
    } finally {
      setIsLoading(false);
    }
  };

  const buildFormData = (): FormData => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('negotiable', negotiable ? '1' : '0');
    formData.append('category_id', String(categoryId));
    formData.append('location_id', String(locationId));
    if (selectedStateName) formData.append('state', selectedStateName);
    if (lgaId) formData.append('lga', lgaId);
    formData.append('condition', condition);
    if (phone) formData.append('phone', phone);
    formData.append('whatsapp', sameAsPhone ? phone : (whatsapp || ''));
    formData.append('attributes', JSON.stringify({}));
    images.forEach((img) => { formData.append('images[]', img.file); });
    return formData;
  };

  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem('post-ad-draft'); } catch {}
    }
  };

  if (wizardStep === 'payment' && paymentUrl) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-white rounded-2xl shadow-card p-4 md:p-6">
        <div className="flex items-center justify-center gap-2">
          {[
            { key: 'form', label: 'Ad Details' },
            { key: 'boost', label: 'Boost (Optional)' },
            { key: 'payment', label: 'Payment' },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                (s.key === 'form' && wizardStep === 'form') ? 'bg-primary-600 text-white' :
                (s.key === 'boost' && wizardStep === 'boost') ? 'bg-amber-500 text-white' :
                (s.key === 'payment' && wizardStep === 'payment') ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {i + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:inline ${
                wizardStep === s.key ? 'text-gray-900 font-medium' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
              {i < 2 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                (s.key === 'form' && wizardStep !== 'form') ? 'bg-primary-600' : 'bg-gray-200'
              }`} />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: AD DETAILS FORM */}
      {wizardStep === 'form' && (
        <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
          <h1 className="text-2xl font-bold text-dark mb-2">Post Your Ad</h1>
          <p className="text-gray-500 mb-8">Fill in the details to list your item for sale</p>

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
                  <span className={`text-base font-medium ${categoryBreadcrumb ? 'text-gray-900' : 'text-gray-400'}`}>
                    {categoryBreadcrumb || 'Select Category'}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
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
                  <span className={`text-base font-medium ${selectedStateName ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedStateName ? `${selectedStateName}${lgaId ? ` > ${lgaId}` : ''}` : 'Select Location'}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

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
                <input ref={fileInputRef} type="file" accept={ACCEPTED_FORMATS.join(',')} multiple onChange={handleFileChange} className="hidden" />
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Click or drag photos here</p>
                <p className="text-gray-400 text-sm mt-1">JPG, PNG, WebP, GIF, HEIC - Max 5MB</p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={() => setDraggedIndex(index)}
                      onDragEnd={() => setDraggedIndex(null)}
                      onDragOver={(e) => { e.preventDefault(); if (draggedIndex !== null) handleImageDragOver(e, index); }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                        draggedIndex === index ? 'border-primary-500 opacity-50' : 'border-gray-200'
                      }`}
                    >
                      <Image src={img.preview} alt="" fill sizes="150px" className="object-cover" />
                      <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        <GripVertical className="w-3 h-3" />
                      </div>
                      <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded">Cover</div>
                      )}
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <div onClick={handleImageClick} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-gray-50">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. iPhone 14 Pro Max 256GB"
                className="w-full px-4 py-3 text-base font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all bg-white text-gray-900 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400"
                maxLength={100}
              />
              <p className="text-sm text-gray-400 mt-2 text-right">{title.length}/100</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item in detail..."
                rows={5}
                className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all resize-none bg-white text-gray-900 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400"
              />
              <p className="text-sm text-gray-400 mt-2 text-right">{description.length}/2000</p>
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
              <label className="block text-base font-semibold text-gray-800 mb-3">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-2xl font-bold">₦</span>
                <input
                  type="text" value={formatPriceInput(price)} onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-4 text-2xl border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all font-bold bg-white text-gray-900 placeholder:text-2xl placeholder:font-bold placeholder:text-gray-300"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer mt-4">
                <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-gray-700">Price is negotiable</span>
              </label>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 space-y-4 border border-gray-200">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="text-base font-bold text-gray-900">Contact Information</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                      className={`w-full pl-11 pr-4 py-3 text-base font-semibold text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-4 transition-all placeholder:text-sm placeholder:font-normal placeholder:text-gray-400 ${
                        phoneError ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
                      }`}
                      maxLength={11}
                    />
                    {phoneError && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{phoneError}</p>}
                  </div>
                </div>
                {!sameAsPhone && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">WhatsApp Number</label>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                        placeholder="e.g. 08034567890"
                        className="w-full pl-11 pr-4 py-3 text-base font-semibold text-gray-900 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all placeholder:text-sm placeholder:font-normal placeholder:text-gray-400"
                        maxLength={11} />
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="text-xs font-medium text-gray-700">Is this your WhatsApp contact?</span>
                  </div>
                  <div className="flex items-center bg-gray-200 rounded-full p-0.5">
                    <button onClick={() => setSameAsPhone(true)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${sameAsPhone ? 'bg-green-500 text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}>Yes</button>
                    <button onClick={() => setSameAsPhone(false)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${!sameAsPhone ? 'bg-primary-600 text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}>No</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-6 border-t mt-8">
            <button onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-all">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleContinueToBoost}
              disabled={!isFormValid}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: BOOST UPSELL */}
      {wizardStep === 'boost' && (
        <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Make your ad sell faster</h1>
            <p className="text-gray-500 mt-2">Boost your ad to get more views and sell quicker. Skip if you prefer free posting.</p>
          </div>

          {fetchingPrices ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <>
              {/* Boost Type Selection */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Choose boost type</p>
                <div className="space-y-3">
                  {BOOST_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setBoostType(option.value)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        boostType === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₦{(prices[option.value] || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">/day</p>
                      </div>
                      {boostType === option.value && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Choose duration</p>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => {
                    const discount = d >= 30 ? '-30%' : d >= 14 ? '-20%' : d >= 7 ? '-15%' : d >= 3 ? '-10%' : null;
                    return (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`flex flex-col items-center px-4 py-3 rounded-xl border-2 transition-all min-w-[80px] ${
                          duration === d
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`text-sm font-semibold ${duration === d ? 'text-primary-700' : 'text-gray-700'}`}>
                          {DURATION_LABELS[d]}
                        </span>
                        {discount && (
                          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1">
                            {discount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-xl p-5 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{BOOST_OPTIONS.find(b => b.value === boostType)?.label}</span>
                  <span className="text-sm font-medium">₦{prices[boostType]?.toFixed(2)}/day</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="text-sm font-medium">{DURATION_LABELS[duration]}</span>
                </div>
                <hr className="border-gray-200 my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">₦{calculatePrice().toFixed(2)}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <button
                  onClick={handleBoostAd}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-200"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Boost My Ad — ₦{calculatePrice().toFixed(2)}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <button
                  onClick={handleSkipBoost}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  No thanks, publish for free
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Back */}
          <div className="mt-6">
            <button onClick={() => setWizardStep('form')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to form
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PAYMENT (shown during redirect) */}
      {wizardStep === 'payment' && (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Redirecting to payment...</h2>
          <p className="text-gray-500">Please complete your payment to boost your ad.</p>
        </div>
      )}

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

      {/* Trust Badges */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Secure Platform</p>
            <p className="text-xs text-gray-500">Your data is protected</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Quick Approval</p>
            <p className="text-xs text-gray-500">Ads go live in minutes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Star className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Reach Thousands</p>
            <p className="text-xs text-gray-500">Connect with serious buyers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
