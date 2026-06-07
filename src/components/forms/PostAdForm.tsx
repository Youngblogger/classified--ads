'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, MapPin, Tag, FileText, Check, ChevronRight, ChevronLeft, GripVertical, Loader2, Phone, MessageCircle, MapPinned, ArrowLeft, ChevronDown, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { adsApi } from '@/lib/api';
import { mutate } from 'swr';
import { useQueryClient } from '@tanstack/react-query';
import { adKeys } from '@/lib/query-keys';
import { broadcastCacheInvalidation, invalidateSwrCache } from '@/lib/cache-sync';
import { useAuthStore } from '@/lib/store';
import { requireAuth } from '@/lib/require-auth';
import { getPhoneValidationError } from '@/lib/utils';
import { nigeriaLocations } from '@/lib/nigeriaLocations';
import toast from 'react-hot-toast';
import CategorySelector from '@/components/ui/CategorySelector';
import LocationSelector from '@/components/ui/LocationSelector';
import { CategoryField } from './DynamicField';
import structuredCategories from '@/data/structured-categories.json';
import { getCategorySpec, SpecField } from '@/lib/category-spec-schema';
import { usePostAdDraft, clearPostAdDraft, DraftImage } from '@/hooks/usePostAdDraft';
import { compressImage, CompressedImage } from '@/lib/imageCompression';
import { imageUploadApi } from '@/lib/api';
import { hashFile } from '@/lib/imageHasher';
import { createUploadQueue } from '@/lib/uploadEngine';
import { UploadingImage } from '@/types';
import ImageUploadCard from '@/components/ui/ImageUploadCard';
import BoostAdModal from '@/components/ui/BoostAdModal';

interface StructuredCategory {
  category: string;
  hasBrand: boolean;
  brands: Array<{
    name: string;
    models: Array<{
      name: string;
      presets: string[];
    }>;
  }>;
  fields: Array<{
    name: string;
    type: string;
    options: string[];
  }>;
}

type ImageFile = UploadingImage;

interface PostAdFormProps {
  onSuccess?: (adId: number) => void;
  isStandalone?: boolean;
}

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

function dataURLToFile(dataURL: string, fileName: string, mimeType: string): File {
  const byteString = atob(dataURL.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new File([ab], fileName, { type: mimeType });
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
    { id: 701, name: 'Full-time Jobs', slug: 'full-time-jobs' },
    { id: 702, name: 'Part-time Jobs', slug: 'part-time-jobs' },
    { id: 703, name: 'Remote Jobs', slug: 'remote-jobs' },
    { id: 704, name: 'Internships', slug: 'internship-jobs' },
  ]},
  { id: 8, name: 'Services', slug: 'services', icon: 'Wrench', children: [
    { id: 801, name: 'Cleaning Services', slug: 'cleaning-services' },
    { id: 802, name: 'Repair & Maintenance', slug: 'repair-services' },
    { id: 803, name: 'Moving & Logistics', slug: 'moving-services' },
    { id: 804, name: 'Event Services', slug: 'event-planning' },
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

export default function PostAdForm({ onSuccess, isStandalone = true }: PostAdFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { hasDraft, saveDraftText, saveDraftImages, clearDraft } = usePostAdDraft();
  const formRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [submissionStep, setSubmissionStep] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [showPostModal, setShowPostModal] = useState(false);
  const [postedAdId, setPostedAdId] = useState<number | null>(null);
  const [postedAdSlug, setPostedAdSlug] = useState<string | undefined>(undefined);
  const [postedAdImage, setPostedAdImage] = useState<string | undefined>(undefined);

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
  const [selectedStateName, setSelectedStateName] = useState<string>('');
  const [lgaId, setLgaId] = useState<string>('');
  const [condition, setCondition] = useState<'new' | 'good' | 'fair' | ''>('');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  // Dynamic fields state
  const [categoryFields, setCategoryFields] = useState<CategoryField[]>([]);
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [fieldsLoading, setFieldsLoading] = useState(false);
  
  // Structured category dropdowns
  const [selectedStructuredCategory, setSelectedStructuredCategory] = useState<StructuredCategory | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [modelPresets, setModelPresets] = useState<string[]>([]);
  
  // WhatsApp same as phone
  const [sameAsPhone, setSameAsPhone] = useState<boolean>(true);
  
  // Pre-fill phone from registration/localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem('user_phone');
    if (savedPhone && !phone) {
      setPhone(savedPhone);
    }
  }, [phone]);

  // Initialize idempotency key for this session
  useEffect(() => {
    setIdempotencyKey(`${Date.now()}-${crypto.randomUUID()}`);
  }, []);

  // Restore draft if available and form is empty
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('draft-banner-dismissed')) return;
    const raw = typeof window !== 'undefined' ? localStorage.getItem('post-ad-draft') : null;
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      if (!draft?.savedAt || Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) return;
      if (draftRestored) return;
      if (!title && !description && !price && images.length === 0) {
        if (draft.step) setStep(draft.step);
        if (draft.title) setTitle(draft.title);
        if (draft.description) setDescription(draft.description);
        if (draft.price) setPrice(draft.price);
        if (draft.negotiable !== undefined) setNegotiable(draft.negotiable);
        if (draft.categoryId) setCategoryId(draft.categoryId);
        if (draft.categoryBreadcrumb) setCategoryBreadcrumb(draft.categoryBreadcrumb);
        if (draft.locationId) setLocationId(draft.locationId);
        if (draft.locationBreadcrumb) setLocationBreadcrumb(draft.locationBreadcrumb);
        if (draft.selectedStateName) setSelectedStateName(draft.selectedStateName);
        if (draft.lgaId) setLgaId(draft.lgaId);
        if (draft.condition) setCondition(draft.condition);
        if (draft.phone) setPhone(draft.phone);
        if (draft.whatsapp) setWhatsapp(draft.whatsapp);
        if (draft.sameAsPhone !== undefined) setSameAsPhone(draft.sameAsPhone);
        if (draft.selectedBrand) setSelectedBrand(draft.selectedBrand);
        if (draft.selectedModel) setSelectedModel(draft.selectedModel);
        if (draft.selectedConfig) setSelectedConfig(draft.selectedConfig);
        if (draft.attributes) setAttributes(draft.attributes);
        if (draft.images?.length > 0) {
          const restoredImages = draft.images.map((img: DraftImage) => ({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file: dataURLToFile(img.base64, img.name, img.type),
            preview: img.base64,
            hash: '',
            status: 'completed' as const,
            progress: 100,
            retryCount: 0,
          }));
          setImages(restoredImages);
        }
        setDraftRestored(true);
      }
      } catch {}
  }, [draftRestored, title, description, price, images]);

  // Auto-hide draft toast after 1.5s
  useEffect(() => {
    if (!draftRestored) return;
    const showTimer = setTimeout(() => setBannerVisible(true), 50);
    bannerTimerRef.current = setTimeout(() => {
      setBannerVisible(false);
    }, 1500);
    return () => {
      clearTimeout(showTimer);
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, [draftRestored]);

  // Pre-fill category & location from last ad
  useEffect(() => {
    if (!isAuthenticated) return;
    const prefetch = async () => {
      try {
        const res = await adsApi.getMyAds({ limit: 1 });
        const ads = res.data?.data ?? [];
        if (!ads.length) return;
        const last = ads[0];
        if (last.category?.id && !categoryId) {
          setCategoryId(last.category.id);
          setCategoryBreadcrumb(last.category.name);
        }
        if (last.location?.id && last.lga && !locationId) {
          setLocationId(last.location.id);
          setSelectedStateName(last.location.name);
          setLgaId(last.lga);
          setLocationBreadcrumb(`${last.location.name} > ${last.lga}`);
        }
      } catch {}
    };
    prefetch();
  }, [isAuthenticated]);

  // Auto-save draft while typing (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const textData = {
        step,
        title,
        description,
        price,
        negotiable,
        categoryId,
        categoryBreadcrumb,
        locationId,
        locationBreadcrumb,
        selectedStateName,
        lgaId,
        condition,
        phone,
        whatsapp,
        sameAsPhone,
        selectedBrand,
        selectedModel,
        selectedConfig,
        attributes,
      };
      if (typeof window !== 'undefined') {
        try {
          const existing = localStorage.getItem('post-ad-draft');
          const parsed = existing ? JSON.parse(existing) : {};
          const merged = { ...parsed, ...textData, savedAt: Date.now() };
          localStorage.setItem('post-ad-draft', JSON.stringify(merged));
        } catch {}
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [step, title, description, price, negotiable, categoryId, categoryBreadcrumb, locationId, locationBreadcrumb, selectedStateName, lgaId, condition, phone, whatsapp, sameAsPhone, selectedBrand, selectedModel, selectedConfig, attributes]);

  // Auto-save images when they change
  useEffect(() => {
    if (images.length === 0) return;
    const timer = setTimeout(async () => {
      const draftImages: DraftImage[] = [];
      for (const img of images) {
        try {
          const base64 = await fileToBase64(img.file);
          draftImages.push({ name: img.file.name, type: img.file.type, size: img.file.size, base64 });
        } catch {}
      }
      if (draftImages.length > 0) {
        try {
          const existing = localStorage.getItem('post-ad-draft');
          const parsed = existing ? JSON.parse(existing) : {};
          parsed.images = draftImages;
          parsed.savedAt = Date.now();
          localStorage.setItem('post-ad-draft', JSON.stringify(parsed));
        } catch {}
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [images]);
  
  // Get category name from categoryId
  const getCategoryName = useCallback((id: number | null): string => {
    if (!id) return '';
    const cat = categories.find(c => c.id === id || c.children?.some((child: any) => child.id === id));
    if (cat?.children?.some((child: any) => child.id === id)) {
      const child = cat.children.find((child: any) => child.id === id);
      return child?.name || '';
    }
    return cat?.name || '';
  }, [categories]);
  
  // Match selected category to structured data
  useEffect(() => {
    if (!categoryId) {
      setSelectedStructuredCategory(null);
      setSelectedBrand('');
      setSelectedModel('');
      setSelectedConfig('');
      return;
    }
    
    const categoryName = getCategoryName(categoryId);
    const normalizedName = categoryName.toLowerCase().trim();
    
    // Try to find matching category in structured data
    const matchedCategory = structuredCategories.categories.find(sc => {
      const scName = sc.category.toLowerCase();
      // Direct match
      if (scName === normalizedName) return true;
      // Partial matches
      if (normalizedName.includes('mobile') && scName.includes('mobile')) return true;
      if (normalizedName.includes('phone') && scName.includes('mobile')) return true;
      if (normalizedName.includes('tablet') && scName.includes('tablet')) return true;
      if (normalizedName.includes('laptop') && scName.includes('laptop')) return true;
      if (normalizedName.includes('computer') && scName.includes('laptop')) return true;
      if (normalizedName.includes('vehicle') && scName.includes('vehicle')) return true;
      if (normalizedName.includes('car') && scName.includes('vehicle')) return true;
      if (normalizedName.includes('property') && scName.includes('property')) return true;
      if (normalizedName.includes('fashion') && scName.includes('fashion')) return true;
      if (normalizedName.includes('job') && scName.includes('job')) return true;
      if (normalizedName.includes('service') && scName.includes('service')) return true;
      if (normalizedName.includes('pet') && scName.includes('pet')) return true;
      if (normalizedName.includes('health') && scName.includes('health')) return true;
      if (normalizedName.includes('baby') && scName.includes('baby')) return true;
      if (normalizedName.includes('sport') && scName.includes('sport')) return true;
      if ((normalizedName.includes('home') || normalizedName.includes('furniture')) && scName.includes('home')) return true;
      if (normalizedName.includes('agric') && scName.includes('agric')) return true;
      if (normalizedName.includes('entertainment') && scName.includes('entertainment')) return true;
      return false;
    });
    
    setSelectedStructuredCategory(matchedCategory || null);
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedConfig('');
    setModelPresets([]);
  }, [categoryId, getCategoryName]);
  
  // Get brands for selected structured category
  const getAvailableBrands = (): string[] => {
    if (!selectedStructuredCategory?.hasBrand) return [];
    return selectedStructuredCategory.brands.map(b => b.name).sort();
  };
  
  // Get models for selected brand
  const getAvailableModels = (): string[] => {
    if (!selectedStructuredCategory || !selectedBrand) return [];
    const brand = selectedStructuredCategory.brands.find(b => b.name === selectedBrand);
    return brand?.models.map(m => m.name).sort() || [];
  };
  
  // Handle brand change
  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel('');
    setSelectedConfig('');
    setModelPresets([]);
  };
  
  // Handle model change
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setSelectedConfig('');
    
    // Get presets for this model
    if (selectedStructuredCategory && selectedBrand) {
      const brand = selectedStructuredCategory.brands.find(b => b.name === selectedBrand);
      const modelData = brand?.models.find(m => m.name === model);
      setModelPresets(modelData?.presets || []);
    }
  };
  
  // Handle config change
  const handleConfigChange = (config: string) => {
    setSelectedConfig(config);
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<ReturnType<typeof createUploadQueue> | null>(null);

  // Initialize upload queue once
  useEffect(() => {
    const queue = createUploadQueue(3);
    queueRef.current = queue;

    queue.on((event) => {
      if (event.type === 'progress') {
        setImages(prev =>
          prev.map(img =>
            img.id === event.id ? { ...img, progress: event.pct, status: 'uploading' as const } : img
          )
        );
      } else if (event.type === 'completed') {
        setImages(prev =>
          prev.map(img =>
            img.id === event.id ? { ...img, status: 'completed' as const, progress: 100 } : img
          )
        );
      } else if (event.type === 'failed') {
        setImages(prev =>
          prev.map(img =>
            img.id === event.id
              ? { ...img, status: 'failed' as const, errorMessage: event.error.message, retryCount: img.retryCount + 1 }
              : img
          )
        );
      }
    });

    return () => queue.abort();
  }, []);

  const enqueueImageUpload = useCallback((img: UploadingImage) => {
    if (!queueRef.current) return;

    queueRef.current.enqueue({
      id: img.id,
      file: img.file,
      execute: async (file, onProgress) => {
        setImages(prev =>
          prev.map(i => (i.id === img.id ? { ...i, status: 'uploading' as const, progress: 1 } : i))
        );
        const response = await imageUploadApi.upload(file, (pct) => {
          setImages(prev =>
            prev.map(i => (i.id === img.id ? { ...i, status: pct >= 100 ? 'processing' as const : 'uploading' as const, progress: pct } : i))
          );
          onProgress(pct);
        });
        return response.data;
      },
      onProgress: (pct) => {},
      onComplete: (result: any) => {
        const data = result?.data || result;
        const url = data?.url || result?.url;
        const thumbUrl = data?.thumbnail_url || result?.thumbnail_url;
        const mediumUrl = data?.medium_url;
        const originalUrl = data?.original_url;
        const imageHash = data?.image_hash;
        const storagePath = data?.path || data?.storage_path;
        setImages(prev =>
          prev.map(i =>
            i.id === img.id
              ? { ...i, uploadedUrl: url, thumbnailUrl: thumbUrl, mediumUrl, originalUrl, imageHash, storagePath, status: 'completed' as const, progress: 100 }
              : i
          )
        );
      },
      onError: (error) => {
        setImages(prev =>
          prev.map(i =>
            i.id === img.id ? { ...i, status: 'failed' as const, errorMessage: error.message } : i
          )
        );
      },
      maxRetries: 3,
    });
  }, []);

  // Fetch category fields when category is selected
  useEffect(() => {
    const fetchCategoryFields = async () => {
      if (!categoryId) {
        setCategoryFields([]);
        setAttributes({});
        return;
      }

      setFieldsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/categories/${categoryId}/fields`);
        const data = await response.json();
        if (data.flat && Array.isArray(data.flat)) {
          setCategoryFields(data.flat);
        } else if (data.fields) {
          // Handle grouped format
          const flatFields = Object.values(data.fields as Record<string, CategoryField[]>).flat();
          setCategoryFields(flatFields);
        }
      } catch (err) {
        console.error('Failed to fetch category fields:', err);
        setCategoryFields([]);
      } finally {
        setFieldsLoading(false);
      }
    };

    fetchCategoryFields();
  }, [categoryId]);

  // Handle attribute change
  const handleAttributeChange = (name: string, value: any) => {
    setAttributes(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Store brand/model/config in attributes when they change (matches seed data format)
  useEffect(() => {
    if (selectedBrand) {
      setAttributes(prev => ({ ...prev, brand: selectedBrand }));
    }
  }, [selectedBrand]);
  
  useEffect(() => {
    if (selectedModel) {
      setAttributes(prev => ({ ...prev, model: selectedModel }));
    }
  }, [selectedModel]);
  
  useEffect(() => {
    if (selectedConfig) {
      // Append trim to model name to match seed data format (e.g., "Camry SE")
      setAttributes(prev => ({
        ...prev,
        model: selectedConfig ? `${selectedModel} ${selectedConfig}` : selectedModel,
      }));
    }
  }, [selectedConfig, selectedModel]);

  useEffect(() => {
    // Use local categories as default
    setCategories(localCategories);
    
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
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

  // Resolve schema spec for current category
  const currentSpec = useMemo(() => {
    if (!selectedStructuredCategory) return undefined;
    return getCategorySpec(selectedStructuredCategory.category);
  }, [selectedStructuredCategory]);

  // Render a single schema field with the form's styled select/input pattern
  const renderSchemaField = useCallback((field: SpecField) => {
    const value = attributes[field.name] ?? '';
    if (field.type === 'select') {
      return (
        <div key={field.name} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <div className="relative group">
            <select
              value={value}
              onChange={(e) => handleAttributeChange(field.name, e.target.value)}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl bg-white text-gray-900 appearance-none cursor-pointer transition-all group-focus-within:border-primary-500 group-hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform group-focus-within:rotate-180" />
          </div>
        </div>
      );
    }
    if (field.type === 'number' || field.type === 'text') {
      return (
        <div key={field.name} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => handleAttributeChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all bg-white"
          />
        </div>
      );
    }
    return null;
  }, [attributes, handleAttributeChange]);

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

  const formatPriceDisplay = (value: string) => {
    if (!value) return '';
    return Number(value).toLocaleString();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value.replace(/[^0-9]/g, '');
    setPrice(raw);
  };

  const validateFile = (file: File): string | null => {
    if (file.size === 0) {
      return 'Selected file is empty and cannot be uploaded.';
    }
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Invalid format. Use JPG, PNG, WebP, GIF, or HEIC.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Max 5MB allowed.';
    }
    return null;
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - images.length;
    
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const filesToAdd = fileArray.slice(0, remainingSlots);
    const newImages: UploadingImage[] = [];
    const errors: string[] = [];
    const existingHashes = new Set(images.map(i => i.hash));

    for (const file of filesToAdd) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        continue;
      }

      try {
        const fileHash = await hashFile(file);
        if (existingHashes.has(fileHash)) {
          errors.push(`Duplicate image upload`);
          continue;
        }

        const compressed = await compressImage(file);
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        newImages.push({
          id,
          file: compressed.file,
          preview: compressed.preview,
          hash: fileHash,
          status: 'queued',
          progress: 0,
          retryCount: 0,
        });
      } catch (err) {
        errors.push(`${file.name}: Failed to process image`);
        console.error('Image processing error:', err);
      }
    }

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      // Queue uploads outside the updater to avoid nested state updates
      newImages.forEach(img => enqueueImageUpload(img));
    }
  }, [images.length, images, enqueueImageUpload]);

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

  const handleRetryUpload = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (!img || img.status === 'completed') return prev;
      return prev.map(i =>
        i.id === id ? { ...i, status: 'queued' as const, progress: 0, errorMessage: undefined } : i
      );
    });
    // Re-enqueue using the current image from state
    const img = images.find(i => i.id === id);
    if (img) enqueueImageUpload(img);
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
    if (step === 1) {
      if (!categoryId) {
        toast.error('Please select a category');
        return;
      }
      if (!locationId) {
        toast.error('Please select a location');
        return;
      }
      if (!title || title.length < 5) {
        toast.error('Please enter a title (at least 5 characters)');
        return;
      }
      if (!price || parseFloat(price) <= 0) {
        toast.error('Please enter a valid price');
        return;
      }
      if (!condition) {
        toast.error('Please select a condition');
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 2));
    requestAnimationFrame(() => {
      if (formRef.current) {
        const top = formRef.current.getBoundingClientRect().top + window.scrollY - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    requestAnimationFrame(() => {
      if (formRef.current) {
        const top = formRef.current.getBoundingClientRect().top + window.scrollY - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  };

  const canSubmit = title && description && price && categoryId && locationId && images.length > 0 && condition && images.every(i => i.status === 'completed');

  const SUBMISSION_STEPS = [
    { key: 'validating', label: 'Validating listing...' },
    { key: 'preparing_images', label: 'Preparing images...' },
    { key: 'uploading', label: 'Uploading your listing...' },
    { key: 'finalizing', label: 'Finalizing your listing...' },
  ];

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!title || !description || !price || !categoryId || !locationId || images.length === 0 || !condition) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!requireAuth('/post-ad')) return;

    const pendingUploads = images.filter(i => i.status !== 'completed');
    if (pendingUploads.length > 0) {
      toast.error(`Please wait for all image uploads to complete (${pendingUploads.length} pending).`);
      return;
    }

    setIsSubmitting(true);
    setSubmissionStep('validating');

    try {
      setSubmissionStep('preparing_images');
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
      
      if (Object.keys(attributes).length > 0) {
        formData.append('attributes', JSON.stringify(attributes));
      }
      
      // Send uploaded URLs instead of raw files
      const uploadedImages = images.filter(i => i.uploadedUrl);
      if (uploadedImages.length > 0) {
        const imageData = uploadedImages.map(i => ({
          url: i.uploadedUrl!,
          thumbnail_url: i.thumbnailUrl || i.uploadedUrl!,
          medium_url: i.mediumUrl || i.uploadedUrl!,
          original_url: i.originalUrl || i.uploadedUrl!,
          image_hash: i.imageHash || null,
          storage_path: i.storagePath || '',
        }));
        formData.append('image_urls', JSON.stringify(imageData));
      } else {
        images.forEach((img, index) => {
          formData.append('images[]', img.file);
        });
      }

      formData.append('_idempotency_key', idempotencyKey);
      
      setSubmissionStep('uploading');
      const response = await adsApi.create(formData);
      
      const adId = (response.data as any)?.data?.id || (response.data as any)?.id;
      if (!adId) throw new Error(response.statusText || 'Failed to post ad');
      
      setSubmissionStep('finalizing');
      const adSlug = (response.data as any)?.data?.slug || (response.data as any)?.slug;
      
      // Reset form
      setStep(1);
      setTitle('');
      setDescription('');
      setPrice('');
      setCategoryId(null);
      setLocationId(null);
      setSelectedStateName('');
      setLgaId('');
      setCondition('');
      // Save ad image before clearing state (for post-submission modal preview)
      setPostedAdImage(images[0]?.preview);
      
      setImages([]);
      setAttributes({});
      setCategoryFields([]);
      
      // Clear saved draft
      clearPostAdDraft();
      
      // Optimistic insert: prepend new ad into SWR cache for instant UI update
      const newAd = (response.data as any)?.data || response.data;
      if (newAd?.id) {
        mutate(
          key => typeof key === 'string' && key.startsWith('ads?'),
          (data: any) => {
            if (!data) return data;
            if (Array.isArray(data)) {
              if (data.some((a: any) => a?.id === newAd.id)) return data;
              return [newAd, ...data];
            }
            if (data?.data && Array.isArray(data.data)) {
              if (data.data.some((a: any) => a?.id === newAd.id)) return data;
              return { ...data, data: [newAd, ...data.data] };
            }
            return data;
          },
          false
        );
      }
      // Broadcast cross-tab sync
      broadcastCacheInvalidation();
      window.dispatchEvent(new CustomEvent('ilist:ad-created', { detail: { adId, slug: adSlug } }));
      // Invalidate caches for background revalidation
      mutate(key => typeof key === 'string' && key.startsWith('ads?'));
      invalidateSwrCache('homepage_data');
      queryClient.invalidateQueries({ queryKey: adKeys.all });
      
      setSubmissionStep(null);
      setIsSubmitting(false);
      
      // Show post-submission boost upsell modal
      setPostedAdId(adId);
      setPostedAdSlug(adSlug);
      setShowPostModal(true);
      
      if (onSuccess) {
        onSuccess(adId);
      }
    } catch (err: any) {
      setSubmissionStep(null);
      setIsSubmitting(false);
      
      let errorMsg = 'Failed to post ad. Please try again.';
      const duration = err.response?.duration || err.duration;
      const durationHint = duration ? ` (${Math.round(duration)}ms elapsed)` : '';
      
      console.error('Post ad error:', err);
      console.error('Full error response:', JSON.stringify(err.response?.data, null, 2));
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        if (Array.isArray(firstError) && firstError[0]) {
          errorMsg = firstError[0] + durationHint;
        }
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message + durationHint;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error + durationHint;
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMsg = 'Cannot connect to server. Please ensure the backend is running on Laragon.';
      } else if (err.code === 'ECONNABORTED') {
        errorMsg = 'Request timed out. The server took too long to respond. Please try again.';
      } else if (err.response?.status === 401) {
        errorMsg = 'Please login to post an ad.';
        requireAuth('/post-ad');
      } else if (err.response?.status === 422) {
        errorMsg = 'Validation error: Please check your input and try again.';
      } else if (err.response?.status === 429) {
        errorMsg = 'You are posting too frequently. Please wait a moment and try again.';
      } else if (err.response?.status === 500) {
        errorMsg = 'Server error. Please try again later.';
      }
      
      toast.error(errorMsg);
    }
  };

  const selectedCategory = categories.find(c => c.id === categoryId || c.children?.some((child: any) => child.id === categoryId));

  const handleCategorySelect = (id: number, name: string, breadcrumb: string) => {
    setCategoryId(id);
    setCategoryBreadcrumb(breadcrumb);
  };

  const handleLocationSelect = (stateId: number, stateName: string, lga: string, fullLocation: string) => {
    setLocationId(stateId);
    setSelectedStateName(stateName);
    setLgaId(lga);
    setLocationBreadcrumb(fullLocation);
  };

  const conditionLabels = {
    'new': 'New',
    'good': 'Used',
    'fair': 'Refurbished'
  };

  const goBack = () => {
    if (step > 1) {
      prevStep();
    } else {
      router.back();
    }
  };

  return (
    <div ref={formRef} className="space-y-4 relative">
      {/* Draft Restored Toast */}
      {draftRestored && isAuthenticated && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
          bannerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="bg-white border border-amber-200 rounded-xl shadow-lg px-5 py-3 flex items-center gap-3 min-w-[280px] max-w-md">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">Draft restored</p>
              <p className="text-xs text-amber-600 truncate">Continue where you left off</p>
            </div>
          </div>
        </div>
      )}
      {/* Back Button */}
      {step > 1 && (
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          <span>Back</span>
        </button>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {['Basic Info', 'Media & Details'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              step > i + 1 ? 'bg-green-500 text-white' :
              step === i + 1 ? 'bg-primary-600 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {step > i + 1 ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`ml-1.5 text-xs hidden sm:inline ${step >= i + 1 ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
              {s}
            </span>
            {i < 1 && <div className={`w-6 sm:w-12 h-0.5 mx-1.5 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-5 pt-1">
          {/* Category & Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <button
                onClick={() => setShowCategorySelector(true)}
                className="w-full flex items-center justify-between py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all duration-300 bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
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
                className="w-full flex items-center justify-between py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all duration-300 bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
              >
                <span className={`text-base font-medium ${locationBreadcrumb ? 'text-gray-900' : 'text-gray-400'}`}>
                  {locationBreadcrumb || 'Select Location'}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-3">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. iPhone 14 Pro Max 256GB"
              className="w-full px-4 py-3 text-base font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all duration-300 bg-white text-gray-900 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400"
              maxLength={100}
            />
            <p className="text-sm text-gray-400 mt-2 text-right">{title.length}/100</p>
          </div>

          {/* Condition & Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {([
                  { key: 'new', label: 'New', color: 'emerald' },
                  { key: 'good', label: 'Used', color: 'amber' },
                  { key: 'fair', label: 'Refurbished', color: 'yellow' }
                ] as const).map(({ key, label, color }) => {
                  const isSelected = condition === key;
                  const colorClasses = {
                    emerald: isSelected ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600',
                    amber: isSelected ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-600',
                    yellow: isSelected ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-300 hover:text-yellow-600',
                  };
                  return (
                    <button
                      key={key}
                      onClick={() => setCondition(key)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${colorClasses[color]}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">₦</span>
            <input
              type="text"
              value={formatPriceDisplay(price)}
              onChange={handlePriceChange}
              placeholder="Enter price"
              inputMode="numeric"
              className="w-full pl-9 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all duration-300 font-semibold bg-white text-gray-900 placeholder:text-base placeholder:font-normal placeholder:text-gray-300"
            />
              </div>
              <label className="flex items-center gap-3 cursor-pointer mt-3">
                <input
                  type="checkbox"
                  checked={negotiable}
                  onChange={(e) => setNegotiable(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">Price is negotiable</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Media & Details */}
      {step === 2 && (
        <div className="space-y-5">
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
                  <ImageUploadCard
                    key={img.id}
                    image={img}
                    index={index}
                    isDragged={draggedIndex === index}
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleImageDragOver(e, index)}
                    onRemove={removeImage}
                    onRetry={handleRetryUpload}
                  />
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

          {/* Description */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-3">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item in detail. Include features, condition, and any other relevant information..."
              rows={6}
              className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all duration-300 resize-none bg-white text-gray-900 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400"
            />
            <p className="text-sm text-gray-400 mt-2 text-right">{description.length}/2000</p>
          </div>



          {/* Brand/Model/Config for categories with brands */}
          {selectedStructuredCategory?.hasBrand && getAvailableBrands().length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Brand */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedBrand}
                      onChange={(e) => handleBrandChange(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl bg-white text-gray-900 appearance-none cursor-pointer transition-all group-focus-within:border-primary-500 group-hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    >
                      <option value="">Select Brand</option>
                      {getAvailableBrands().map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform group-focus-within:rotate-180" />
                  </div>
                </div>

                {/* Model */}
                {selectedBrand && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <div className="relative group">
                      <select
                        value={selectedModel}
                        onChange={(e) => handleModelChange(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl bg-white text-gray-900 appearance-none cursor-pointer transition-all group-focus-within:border-primary-500 group-hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      >
                        <option value="">Select Model</option>
                        {getAvailableModels().map((model) => (
                          <option key={`${selectedBrand}-${model}`} value={model}>{model}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform group-focus-within:rotate-180" />
                    </div>
                  </div>
                )}

                {/* Configuration */}
                {selectedModel && modelPresets.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Configuration
                    </label>
                    <div className="relative group">
                      <select
                        value={selectedConfig}
                        onChange={(e) => handleConfigChange(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl bg-white text-gray-900 appearance-none cursor-pointer transition-all group-focus-within:border-primary-500 group-hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      >
                        <option value="">Select Configuration</option>
                        {modelPresets.map((preset) => (
                          <option key={`${selectedBrand}-${selectedModel}-${preset}`} value={preset}>{preset}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform group-focus-within:rotate-180" />
                    </div>
                  </div>
                )}
              </div>

              {/* Schema-driven specification fields for categories with brands */}
              {currentSpec && selectedModel && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {currentSpec.fields.map((field) => renderSchemaField(field))}
                </div>
              )}
            </div>
          )}

          {/* Schema-driven specification fields for categories without brands */}
          {currentSpec && !selectedStructuredCategory?.hasBrand && currentSpec.fields.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentSpec.fields.map((field) => renderSchemaField(field))}
            </div>
          )}

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
                <label className="block text-sm font-semibold text-gray-800">
                  Phone Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                      setPhone(val);
                      if (val.length === 11) {
                        setPhoneError(getPhoneValidationError(val));
                      } else if (val.length > 0) {
                        setPhoneError(null);
                      } else {
                        setPhoneError(null);
                      }
                    }}
                    placeholder="e.g. 08034567890"
                    className={`w-full pl-11 pr-4 py-3 text-base font-semibold text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-4 transition-all duration-300 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400 group-hover:border-primary-300 ${
                      phoneError ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
                    }`}
                    maxLength={11}
                  />
                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{phoneError}</p>
                  )}
                </div>
              </div>
              
              {!sameAsPhone && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="block text-sm font-semibold text-gray-800">
                    WhatsApp Number
                  </label>
                  <div className="relative group">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                      placeholder="e.g. 08034567890"
                      className="w-full pl-11 pr-4 py-3 text-base font-semibold text-gray-900 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all duration-300 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400 group-hover:border-green-400"
                      maxLength={11}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* WhatsApp Confirmation */}
            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Is this your WhatsApp contact?</span>
                </div>
                <div className="flex items-center bg-gray-200 rounded-full p-0.5">
                  <button
                    onClick={() => setSameAsPhone(true)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                      sameAsPhone 
                        ? 'bg-green-500 text-white shadow-sm' 
                        : 'bg-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setSameAsPhone(false)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                      !sameAsPhone 
                        ? 'bg-primary-600 text-white shadow-sm' 
                        : 'bg-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Review Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-primary-50/30 rounded-xl p-4 sm:p-6 space-y-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Check className="w-5 h-5 text-primary-500" />
              Ad Summary
            </h4>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {images[0] && (
                <div className="w-full sm:w-20 h-40 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 relative border border-gray-200">
                  <Image src={images[0].preview} alt="" fill sizes="80px" className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base break-words">{title || 'No title'}</h3>
                <p className="text-lg font-bold text-primary-600 mt-1">
                  ₦{formatPriceDisplay(price) || '0'}
                  {negotiable && <span className="text-sm font-normal text-gray-500 ml-2">Negotiable</span>}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-400">Category:</span>
                <span className="text-gray-800 font-medium">{selectedCategory?.name || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-400">Location:</span>
                <span className="text-gray-800 font-medium">
                  {selectedState?.name || 'N/A'}{lgaId ? ` > ${lgaId}` : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-400">Condition:</span>
                <span className="text-gray-800 font-medium">{condition && conditionLabels[condition as keyof typeof conditionLabels] || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-gray-400">Photos:</span>
                <span className="text-gray-800 font-medium">{images.length}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Description:</span>
              <p className="text-gray-700 mt-0.5 text-sm line-clamp-2">{description || 'No description'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        {step > 1 ? (
          <button
            onClick={prevStep}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 2 ? (
          <button
            onClick={nextStep}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-semibold text-sm rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-semibold text-sm rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {SUBMISSION_STEPS.find(s => s.key === submissionStep)?.label || 'Posting...'}
              </>
            ) : (
              <>
                Post Ad
                <Check className="w-5 h-5" />
              </>
            )}
          </button>
        )}
        
        {/* Submission progress overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-200">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Posting your ad</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: submissionStep === 'validating' ? '15%' :
                           submissionStep === 'preparing_images' ? '35%' :
                           submissionStep === 'uploading' ? '65%' :
                           submissionStep === 'finalizing' ? '90%' : '50%',
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                {SUBMISSION_STEPS.find(s => s.key === submissionStep)?.label || 'Please wait...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      <div id="category-modal" className="fixed inset-0 bg-black/50 z-[150] hidden flex items-center justify-center p-4">
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

      {/* Post-Submission Boost Modal */}
      <BoostAdModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        adId={postedAdId || 0}
        adSlug={postedAdSlug}
        adTitle={title}
        adImage={postedAdImage}
        adPrice={price}
        adLocation={locationBreadcrumb || undefined}
        adCategory={categoryBreadcrumb || undefined}
        showInitialStep={true}
      />
    </div>
  );
}
