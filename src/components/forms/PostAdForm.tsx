'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, MapPin, Tag, FileText, Check, ChevronRight, ChevronLeft, GripVertical, Loader2, Phone, ArrowLeft, ChevronDown } from 'lucide-react';
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
import CategoryModal from '@/components/ui/CategoryModal';
import LocationSelector from '@/components/ui/LocationSelector';
import structuredCategories from '@/data/structured-categories.json';
import DynamicSpecFields from '@/components/ui/DynamicSpecFields';
import { getCategoryFieldsBySubcategory, getCategoryFields } from '@/config/category-fields';
import { usePostAdDraft, clearPostAdDraft, getDraft } from '@/hooks/usePostAdDraft';
import type { PostAdDraft } from '@/hooks/usePostAdDraft';
import { compressImage } from '@/lib/imageCompression';
import { imageUploadApi } from '@/lib/api';
import { hashFile } from '@/lib/imageHasher';
import { createUploadQueue } from '@/lib/uploadEngine';
import { UploadingImage } from '@/types';
import ImageUploadCard from '@/components/ui/ImageUploadCard';
import BoostAdModal from '@/components/ui/BoostAdModal';
import StepIndicator from '@/components/ui/StepIndicator';
import DraftRestoreModal from '@/components/ui/DraftRestoreModal';
import PostAdPreview from '@/components/forms/PostAdPreview';

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
  fields: Array<{ name: string; type: string; options: string[]; }>;
}

type ImageFile = UploadingImage;

interface PostAdFormProps {
  onSuccess?: (adId: number) => void;
  isStandalone?: boolean;
}

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

const STEPS = [
  { id: 1, label: 'Category', shortLabel: 'Cat' },
  { id: 2, label: 'Details', shortLabel: 'Details' },
  { id: 3, label: 'Preview & Publish', shortLabel: 'Preview' },
];

function dataURLToFile(dataURL: string, fileName: string, mimeType: string): File {
  const byteString = atob(dataURL.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
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
  { id: 11, name: 'Baby & Kids', slug: 'baby-kids', icon: 'Baby', children: [
    { id: 1101, name: 'Baby Gear', slug: 'baby-gear' }, { id: 1102, name: 'Kids Clothing', slug: 'kids-clothing' },
    { id: 1103, name: 'Toys & Games', slug: 'kids-toys' }, { id: 1104, name: 'Maternity', slug: 'maternity' },
  ]},
  { id: 12, name: 'Sports & Outdoors', slug: 'sports', icon: 'Trophy', children: [
    { id: 1201, name: 'Fitness & Gym', slug: 'fitness-gym' }, { id: 1202, name: 'Camping & Hiking', slug: 'camping-hiking' },
    { id: 1203, name: 'Cycling', slug: 'cycling' }, { id: 1204, name: 'Team Sports', slug: 'team-sports' },
  ]},
  { id: 13, name: 'Books & Media', slug: 'books-music-movies', icon: 'Book', children: [
    { id: 1301, name: 'Books', slug: 'books' }, { id: 1302, name: 'Music', slug: 'music' },
    { id: 1303, name: 'Movies & TV', slug: 'movies-tv' },
  ]},
  { id: 14, name: 'Food & Drinks', slug: 'food-drinks', icon: 'Coffee', children: [
    { id: 1401, name: 'Groceries', slug: 'groceries' }, { id: 1402, name: 'Beverages', slug: 'beverages' },
    { id: 1403, name: 'Snacks', slug: 'snacks' },
  ]},
  { id: 15, name: 'Agriculture & Farming', slug: 'agriculture', icon: 'Sprout', children: [
    { id: 1501, name: 'Farm Equipment', slug: 'farm-equipment' }, { id: 1502, name: 'Livestock', slug: 'livestock' },
    { id: 1503, name: 'Crops & Seeds', slug: 'crops-seeds' },
  ]},
];

function hasMeaningfulDraftData(draft: PostAdDraft | null): boolean {
  if (!draft) return false;
  let score = 0;
  if (draft.title?.length > 3) score++;
  if (draft.description?.length > 10) score++;
  if (draft.images?.length > 0) score++;
  if (draft.categoryId) score++;
  if (Object.keys(draft.attributes || {}).length > 0) score++;
  return score >= 2;
}

export default function PostAdForm({ onSuccess, isStandalone = true }: PostAdFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { saveDraftText, saveDraftImages, clearDraft } = usePostAdDraft();
  const formRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [submissionStep, setSubmissionStep] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<PostAdDraft | null>(null);

  const [showPostModal, setShowPostModal] = useState(false);
  const [postedAdId, setPostedAdId] = useState<number | null>(null);
  const [postedAdSlug, setPostedAdSlug] = useState<string | undefined>(undefined);
  const [postedAdImage, setPostedAdImage] = useState<string | undefined>(undefined);

  const [categories, setCategories] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [categoryId, setCategoryId] = useState<string | number | null>(null);
  const [categorySlug, setCategorySlug] = useState<string>('');
  const [categoryParentSlug, setCategoryParentSlug] = useState<string>('');
  const [subcategorySlug, setSubcategorySlug] = useState<string>('');
  const [categoryBreadcrumb, setCategoryBreadcrumb] = useState<string>('');
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [locationBreadcrumb, setLocationBreadcrumb] = useState<string>('');
  const [locationId, setLocationId] = useState<string | number | null>(null);
  const [selectedStateName, setSelectedStateName] = useState<string>('');
  const [lgaId, setLgaId] = useState<string>('');
  const [condition, setCondition] = useState<'new' | 'good' | 'fair' | ''>('');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [attributes, setAttributes] = useState<Record<string, any>>({});

  const [selectedStructuredCategory, setSelectedStructuredCategory] = useState<StructuredCategory | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [modelPresets, setModelPresets] = useState<string[]>([]);

  const [sameAsPhone, setSameAsPhone] = useState<boolean>(true);

  const [showBackConfirm, setShowBackConfirm] = useState(false);

  useEffect(() => {
    const savedPhone = localStorage.getItem('user_phone');
    if (savedPhone && !phone) setPhone(savedPhone);
  }, [phone]);

  useEffect(() => {
    setIdempotencyKey(`${Date.now()}-${crypto.randomUUID()}`);
  }, []);

  // Intelligent draft detection — show modal if meaningful data exists
  useEffect(() => {
    const draft = getDraft();
    if (draft && hasMeaningfulDraftData(draft) && !draftRestored) {
      setPendingDraft(draft);
      setShowDraftModal(true);
    }
  }, [draftRestored]);

  // Pre-fill phone from registration
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

  // Debounced autosave — only when there's meaningful data
  const hasAnyData = useMemo(() => {
    return title.length > 3 || description.length > 10 || images.length > 0 || !!categoryId || Object.keys(attributes).length > 0;
  }, [title, description, images.length, categoryId, attributes]);

  useEffect(() => {
    if (!hasAnyData) return;
    const timer = setTimeout(() => {
      saveDraftText({
        title, description, price, negotiable, categoryId, categorySlug,
        categoryParentSlug, subcategorySlug, categoryBreadcrumb,
        locationId, locationBreadcrumb, selectedStateName, lgaId,
        condition, phone, whatsapp, sameAsPhone, selectedBrand,
        selectedModel, selectedConfig, attributes,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [hasAnyData, title, description, price, negotiable, categoryId, categorySlug,
      categoryParentSlug, subcategorySlug, categoryBreadcrumb, locationId,
      locationBreadcrumb, selectedStateName, lgaId, condition, phone, whatsapp,
      sameAsPhone, selectedBrand, selectedModel, selectedConfig, attributes, saveDraftText]);

  useEffect(() => {
    if (images.length === 0 || !hasAnyData) return;
    const timer = setTimeout(async () => {
      const draftImages: any[] = [];
      for (const img of images) {
        try {
          const base64 = await fileToBase64(img.file);
          draftImages.push({ name: img.file.name, type: img.file.type, size: img.file.size, base64 });
        } catch {}
      }
      if (draftImages.length > 0) saveDraftImages(draftImages.map((d: any) => d as File));
    }, 1500);
    return () => clearTimeout(timer);
  }, [images, hasAnyData, saveDraftImages]);

  const restoreDraftData = useCallback(() => {
    const draft = pendingDraft;
    if (!draft) return;
    if (draft.step) setStep(draft.step);
    if (draft.title) setTitle(draft.title);
    if (draft.description) setDescription(draft.description);
    if (draft.price) setPrice(draft.price);
    if (draft.negotiable !== undefined) setNegotiable(draft.negotiable);
    if (draft.categoryId) setCategoryId(draft.categoryId);
    if (draft.categorySlug) setCategorySlug(draft.categorySlug);
    if (draft.categoryParentSlug) setCategoryParentSlug(draft.categoryParentSlug);
    if (draft.subcategorySlug) setSubcategorySlug(draft.subcategorySlug);
    if (draft.categoryBreadcrumb) setCategoryBreadcrumb(draft.categoryBreadcrumb);
    if (draft.locationId) setLocationId(draft.locationId);
    if (draft.locationBreadcrumb) setLocationBreadcrumb(draft.locationBreadcrumb);
    if (draft.selectedStateName) setSelectedStateName(draft.selectedStateName);
    if (draft.lgaId) setLgaId(draft.lgaId);
    if (draft.condition) setCondition(draft.condition as any);
    if (draft.phone) setPhone(draft.phone);
    if (draft.whatsapp) setWhatsapp(draft.whatsapp);
    if (draft.sameAsPhone !== undefined) setSameAsPhone(draft.sameAsPhone);
    if (draft.selectedBrand) setSelectedBrand(draft.selectedBrand);
    if (draft.selectedModel) setSelectedModel(draft.selectedModel);
    if (draft.selectedConfig) setSelectedConfig(draft.selectedConfig);
    if (draft.attributes) setAttributes(draft.attributes);
    if (draft.images?.length > 0) {
      const restoredImages = draft.images.map((img: any) => ({
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
    setShowDraftModal(false);
    setPendingDraft(null);
  }, [pendingDraft]);

  const discardDraft = useCallback(() => {
    clearDraft();
    setDraftRestored(true);
    setShowDraftModal(false);
    setPendingDraft(null);
  }, [clearDraft]);

  const getCategoryName = useCallback((id: string | number | null): string => {
    if (!id) return '';
    const cat = categories.find(c => c.id === id || c.children?.some((child: any) => child.id === id));
    if (cat?.children?.some((child: any) => child.id === id)) {
      const child = cat.children.find((child: any) => child.id === id);
      return child?.name || '';
    }
    return cat?.name || '';
  }, [categories]);

  useEffect(() => {
    if (!categoryId) {
      setSelectedStructuredCategory(null);
      setSelectedBrand(''); setSelectedModel(''); setSelectedConfig(''); return;
    }
    const categoryName = getCategoryName(categoryId);
    const normalizedName = categoryName.toLowerCase().trim();
    const matchedCategory = structuredCategories.categories.find(sc => {
      const scName = sc.category.toLowerCase();
      if (scName === normalizedName) return true;
      if (normalizedName.includes('mobile') && scName.includes('mobile')) return true;
      if ((normalizedName.includes('phone') || normalizedName.includes('tablet')) && scName.includes('mobile')) return true;
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
    setSelectedBrand(''); setSelectedModel(''); setSelectedConfig(''); setModelPresets([]);
  }, [categoryId, getCategoryName]);

  const getAvailableBrands = useCallback((): string[] => {
    if (!selectedStructuredCategory?.hasBrand) return [];
    return selectedStructuredCategory.brands.map(b => b.name).sort();
  }, [selectedStructuredCategory]);

  const getAvailableModels = useCallback((): string[] => {
    if (!selectedStructuredCategory || !selectedBrand) return [];
    const brand = selectedStructuredCategory.brands.find(b => b.name === selectedBrand);
    return brand?.models.map(m => m.name).sort() || [];
  }, [selectedStructuredCategory, selectedBrand]);

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel(''); setSelectedConfig(''); setModelPresets([]);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setSelectedConfig('');
    if (selectedStructuredCategory && selectedBrand) {
      const brand = selectedStructuredCategory.brands.find(b => b.name === selectedBrand);
      setModelPresets(brand?.models.find(m => m.name === model)?.presets || []);
    }
  };

  const handleConfigChange = (config: string) => setSelectedConfig(config);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<ReturnType<typeof createUploadQueue> | null>(null);

  useEffect(() => {
    const queue = createUploadQueue(3);
    queueRef.current = queue;
    queue.on((event) => {
      if (event.type === 'progress') {
        setImages(prev => prev.map(img => img.id === event.id ? { ...img, progress: event.pct, status: 'uploading' as const } : img));
      } else if (event.type === 'completed') {
        setImages(prev => prev.map(img => img.id === event.id ? { ...img, status: 'completed' as const, progress: 100 } : img));
      } else if (event.type === 'failed') {
        setImages(prev => prev.map(img => img.id === event.id ? { ...img, status: 'failed' as const, errorMessage: event.error.message, retryCount: img.retryCount + 1 } : img));
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
        setImages(prev => prev.map(i => (i.id === img.id ? { ...i, status: 'uploading' as const, progress: 1 } : i)));
        const response = await imageUploadApi.upload(file, (pct) => {
          setImages(prev => prev.map(i => (i.id === img.id ? { ...i, status: pct >= 100 ? 'processing' as const : 'uploading' as const, progress: pct } : i)));
          onProgress(pct);
        });
        return response.data;
      },
      onProgress: () => {},
      onComplete: (result: any) => {
        const data = result?.data || result;
        setImages(prev => prev.map(i => i.id === img.id ? {
          ...i, uploadedUrl: data?.url, thumbnailUrl: data?.thumbnail_url,
          mediumUrl: data?.medium_url, originalUrl: data?.original_url,
          imageHash: data?.image_hash, storagePath: data?.path || data?.storage_path,
          status: 'completed' as const, progress: 100,
        } : i));
      },
      onError: (error) => {
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'failed' as const, errorMessage: error.message } : i));
      },
      maxRetries: 3,
    });
  }, []);

  const handleAttributeChange = (name: string, value: any) => {
    setAttributes(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => { if (selectedBrand) setAttributes(prev => ({ ...prev, brand: selectedBrand })); }, [selectedBrand]);
  useEffect(() => { if (selectedModel) setAttributes(prev => ({ ...prev, model: selectedModel })); }, [selectedModel]);
  useEffect(() => {
    if (selectedConfig) setAttributes(prev => ({ ...prev, model: `${selectedModel} ${selectedConfig}` }));
  }, [selectedConfig, selectedModel]);

  useEffect(() => {
    setCategories(localCategories);
    const fetchCategories = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
        const catsRes = await fetch(`${API_URL}/categories`);
        const catsData = await catsRes.json();
        const allCategories = catsData?.data || [];
        if (allCategories.length > 0) setCategories(allCategories);
      } catch (err) { console.error('Failed to fetch categories:', err); }
    };
    fetchCategories();
  }, []);

  const specFields = useMemo(() => {
    const slug = subcategorySlug || categorySlug || categoryParentSlug;
    if (!slug) return [];
    const catFields = getCategoryFieldsBySubcategory(slug) || getCategoryFields(slug);
    return catFields?.fields || [];
  }, [subcategorySlug, categorySlug, categoryParentSlug]);

  const hasStructuredBrand = selectedStructuredCategory?.hasBrand && getAvailableBrands().length > 0;
  const displayFields = useMemo(() => {
    if (hasStructuredBrand) return specFields.filter(f => !['make', 'brand', 'model'].includes(f.name));
    return specFields;
  }, [specFields, hasStructuredBrand]);

  const stateSlugToId: Record<string, number> = {
    'abia': 1, 'abuja': 2, 'adamawa': 3, 'akwa-ibom': 4, 'anambra': 5,
    'bauchi': 6, 'bayelsa': 7, 'benue': 8, 'borno': 9, 'cross-river': 10,
    'delta': 11, 'ebonyi': 12, 'edo': 13, 'ekiti': 14, 'enugu': 15,
    'gombe': 16, 'imo': 17, 'jigawa': 18, 'kaduna': 19, 'kano': 20,
    'katsina': 21, 'kebbi': 22, 'kogi': 23, 'kwara': 24, 'lagos': 25,
    'nasarawa': 26, 'niger': 27, 'ogun': 28, 'ondo': 29, 'osun': 30,
    'oyo': 31, 'plateau': 32, 'rivers': 33, 'sokoto': 34, 'taraba': 35,
    'yobe': 36, 'zamfara': 37,
  };

  const selectedState = locationId ? nigeriaLocations.find(loc => stateSlugToId[loc.slug] === locationId) : null;

  const formatPriceDisplay = (value: string) => value ? Number(value).toLocaleString() : '';

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.currentTarget.value.replace(/[^0-9]/g, ''));
  };

  const validateFile = (file: File): string | null => {
    if (file.size === 0) return 'Selected file is empty.';
    if (!ACCEPTED_FORMATS.includes(file.type)) return 'Invalid format. Use JPG, PNG, WebP, GIF, or HEIC.';
    if (file.size > MAX_FILE_SIZE) return 'File too large. Max 5MB allowed.';
    return null;
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) { toast.error(`Maximum ${MAX_IMAGES} images allowed.`); return; }
    const filesToAdd = fileArray.slice(0, remainingSlots);
    const newImages: UploadingImage[] = [];
    const errors: string[] = [];
    const existingHashes = new Set(images.map(i => i.hash));
    for (const file of filesToAdd) {
      const error = validateFile(file);
      if (error) { errors.push(`${file.name}: ${error}`); continue; }
      try {
        const fileHash = await hashFile(file);
        if (existingHashes.has(fileHash)) { errors.push('Duplicate image'); continue; }
        const compressed = await compressImage(file);
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        newImages.push({ id, file: compressed.file, preview: compressed.preview, hash: fileHash, status: 'queued', progress: 0, retryCount: 0 });
      } catch (err) { errors.push(`${file.name}: Failed to process`); console.error(err); }
    }
    errors.forEach(err => toast.error(err));
    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      newImages.forEach(img => enqueueImageUpload(img));
    }
  }, [images.length, images, enqueueImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragEnd = () => setDraggedIndex(null);

  const handleImageDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    setImages(prev => { const newImages = [...prev]; const [item] = newImages.splice(draggedIndex, 1); newImages.splice(targetIndex, 0, item); return newImages; });
    setDraggedIndex(targetIndex);
  };

  const removeImage = (id: string) => {
    setImages(prev => { const img = prev.find(i => i.id === id); if (img) URL.revokeObjectURL(img.preview); return prev.filter(i => i.id !== id); });
  };

  const handleRetryUpload = (id: string) => {
    setImages(prev => prev.map(i => i.id === id && i.status !== 'completed' ? { ...i, status: 'queued' as const, progress: 0, errorMessage: undefined } : i));
    const img = images.find(i => i.id === id);
    if (img) enqueueImageUpload(img);
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) { processFiles(e.target.files); e.target.value = ''; }
  };

  const goToStep = (targetStep: number) => {
    setStep(targetStep);
    requestAnimationFrame(() => {
      if (formRef.current) window.scrollTo({ top: formRef.current.getBoundingClientRect().top + window.scrollY - 16, behavior: 'smooth' });
    });
  };

  const canProceedStep1 = !!categoryId && !!locationId;

  const validateStep2 = (): boolean => {
    if (!title || title.length < 5) { toast.error('Please enter a title (at least 5 characters)'); return false; }
    if (!price || parseFloat(price) <= 0) { toast.error('Please enter a valid price'); return false; }
    if (!condition) { toast.error('Please select a condition'); return false; }
    if (images.length === 0) { toast.error('Please upload at least one photo'); return false; }
    if (!description || description.length < 20) { toast.error('Please enter a description (at least 20 characters)'); return false; }
    if (!phone) { toast.error('Please enter a phone number'); return false; }
    return true;
  };

  const nextStep = () => {
    if (step === 1) {
      if (!canProceedStep1) { toast.error('Please select a category and location'); return; }
    }
    if (step === 2) {
      if (!validateStep2()) return;
    }
    goToStep(step + 1);
  };

  const prevStep = () => {
    if (step === 1) { router.back(); return; }
    goToStep(step - 1);
  };

  const canSubmit = title && description && price && categoryId && locationId && images.length > 0 && condition && images.every(i => i.status === 'completed');

  const SUBMISSION_STEPS = [
    { key: 'uploading_images', label: 'Uploading images...' },
    { key: 'processing', label: 'Processing your ad...' },
    { key: 'publishing', label: 'Publishing your listing...' },
    { key: 'success', label: 'Ad posted successfully' },
  ];

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!canSubmit) { toast.error('Please fill in all required fields and wait for image uploads'); return; }
    if (!requireAuth('/post-ad')) return;

    const pendingUploads = images.filter(i => i.status !== 'completed');
    if (pendingUploads.length > 0) { toast.error(`Please wait for all image uploads (${pendingUploads.length} pending).`); return; }

    setIsSubmitting(true);
    setSubmissionStep('uploading_images');

    try {
      setSubmissionStep('processing');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('negotiable', negotiable ? '1' : '0');
      formData.append('category_id', String(categoryId));
      if (categorySlug) formData.append('category_slug', categorySlug);
      if (categoryParentSlug) formData.append('category_parent_slug', categoryParentSlug);
      if (subcategorySlug) formData.append('subcategory_slug', subcategorySlug);
      formData.append('location_id', String(locationId));
      if (selectedStateName) formData.append('state', selectedStateName);
      if (lgaId) formData.append('lga', lgaId);
      formData.append('condition', condition);
      if (phone) formData.append('phone', phone);
      formData.append('whatsapp', sameAsPhone ? phone : (whatsapp || ''));
      if (Object.keys(attributes).length > 0) formData.append('attributes', JSON.stringify(attributes));

      const uploadedImages = images.filter(i => i.uploadedUrl);
      if (uploadedImages.length > 0) {
        formData.append('image_urls', JSON.stringify(uploadedImages.map(i => ({
          url: i.uploadedUrl!, thumbnail_url: i.thumbnailUrl || i.uploadedUrl!,
          medium_url: i.mediumUrl || i.uploadedUrl!, original_url: i.originalUrl || i.uploadedUrl!,
          image_hash: i.imageHash || null, storage_path: i.storagePath || '',
        }))));
      } else {
        images.forEach((img) => formData.append('images[]', img.file));
      }
      formData.append('_idempotency_key', idempotencyKey);

      setSubmissionStep('publishing');
      const response = await adsApi.create(formData);
      if (!response?.data?.data?.id && !(response as any)?.data?.id) throw new Error((response as any)?.statusText || 'Failed to post ad');

      const adId = (response.data as any)?.data?.id || (response.data as any)?.id;
      if (!adId) throw new Error(response.statusText || 'Failed to post ad');

      setSubmissionStep('success');
      const adSlug = (response.data as any)?.data?.slug || (response.data as any)?.slug;

      // Reset form
      setStep(1); setTitle(''); setDescription(''); setPrice(''); setCategoryId(null);
      setLocationId(null); setSelectedStateName(''); setLgaId(''); setCondition('');
      setPostedAdImage(images[0]?.preview);
      setImages([]); setAttributes({});
      clearDraft();

      const newAd = (response.data as any)?.data || response.data;
      if (newAd?.id) {
        mutate(key => typeof key === 'string' && key.startsWith('ads?'), (data: any) => {
          if (!data) return data;
          if (Array.isArray(data)) { if (data.some((a: any) => a?.id === newAd.id)) return data; return [newAd, ...data]; }
          if (data?.data && Array.isArray(data.data)) { if (data.data.some((a: any) => a?.id === newAd.id)) return data; return { ...data, data: [newAd, ...data.data] }; }
          return data;
        }, false);
      }
      broadcastCacheInvalidation();
      window.dispatchEvent(new CustomEvent('ilist:ad-created', { detail: { adId, slug: adSlug } }));
      mutate(key => typeof key === 'string' && key.startsWith('ads?'));
      invalidateSwrCache('homepage_data');
      queryClient.invalidateQueries({ queryKey: adKeys.all });

      setPostedAdId(adId);
      setPostedAdSlug(adSlug);
      if (onSuccess) onSuccess(adId);

      setTimeout(() => {
        setSubmissionStep(null);
        setIsSubmitting(false);
        setShowPostModal(true);
      }, 800);
    } catch (err: any) {
      setSubmissionStep(null);
      setIsSubmitting(false);
      let errorMsg = 'Failed to post ad. Please try again.';
      const duration = err.response?.duration || err.duration;
      const durationHint = duration ? ` (${Math.round(duration)}ms elapsed)` : '';
      console.error('Post ad error:', err);
      console.error('Full error response:', JSON.stringify(err.response?.data, null, 2));
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0];
        if (Array.isArray(firstError) && firstError[0]) errorMsg = firstError[0] + durationHint;
      } else if (err.response?.data?.message) errorMsg = err.response.data.message + durationHint;
      else if (err.response?.data?.error) errorMsg = err.response.data.error + durationHint;
      else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') errorMsg = 'Cannot connect to server. Please ensure the backend is running.';
      else if (err.code === 'ECONNABORTED') errorMsg = 'Request timed out. Please try again.';
      else if (err.response?.status === 401) { errorMsg = 'Please login to post an ad.'; requireAuth('/post-ad'); }
      else if (err.response?.status === 422) errorMsg = 'Validation error: Please check your input.';
      else if (err.response?.status === 429) errorMsg = 'Posting too frequently. Please wait.';
      else if (err.response?.status === 500) errorMsg = 'Server error. Please try again later.';
      else if (err.message) errorMsg = err.message + durationHint;
      toast.error(errorMsg);
    }
  };

  const conditionLabels: Record<string, string> = { new: 'New', good: 'Used', fair: 'Refurbished' };

  return (
    <div ref={formRef} className="space-y-4 relative">
      {/* Draft Restore Modal */}
      <DraftRestoreModal
        isOpen={showDraftModal}
        draft={pendingDraft}
        onContinue={restoreDraftData}
        onDiscard={discardDraft}
        onClose={discardDraft}
      />

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={step} />

      {/* Back button */}
      <button
        onClick={prevStep}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
        <span>Back</span>
      </button>

      {/* ===== STEP 1: CATEGORY ===== */}
      {step === 1 && (
        <div className="space-y-5 pt-2 animate-fadeIn">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Choose your category</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select the category that best fits your listing</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <button
                onClick={() => setShowCategorySelector(true)}
                className="w-full flex items-center justify-between py-3.5 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-md transition-all bg-white dark:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${categoryBreadcrumb ? 'bg-primary-50 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <Tag className={`w-4 h-4 ${categoryBreadcrumb ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                  </div>
                  <span className={`text-base font-medium ${categoryBreadcrumb ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                    {categoryBreadcrumb || 'Select Category'}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <button
                onClick={() => setShowLocationSelector(true)}
                className="w-full flex items-center justify-between py-3.5 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-md transition-all bg-white dark:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${locationBreadcrumb ? 'bg-primary-50 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <MapPin className={`w-4 h-4 ${locationBreadcrumb ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                  </div>
                  <span className={`text-base font-medium ${locationBreadcrumb ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                    {locationBreadcrumb || 'Select Location'}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={nextStep}
              disabled={!canProceedStep1}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Continue to Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 2: DETAILS ===== */}
      {step === 2 && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Listing details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Provide detailed information about your item</p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. iPhone 14 Pro Max 256GB"
              className="w-full px-4 py-3 text-base font-bold border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500"
              maxLength={100}
            />
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 text-right">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item in detail. Include features, condition, and any other relevant information..."
              rows={6}
              className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition-all resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500"
              maxLength={2000}
            />
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 text-right">{description.length}/2000</p>
          </div>

          {/* Condition & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {([{ key: 'new', label: 'New', color: 'emerald' }, { key: 'good', label: 'Used', color: 'amber' }, { key: 'fair', label: 'Refurbished', color: 'yellow' }] as const).map(({ key, label, color }) => {
                  const isSelected = condition === key;
                  const colorClasses = {
                    emerald: isSelected ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400',
                    amber: isSelected ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600 hover:text-amber-600 dark:hover:text-amber-400',
                    yellow: isSelected ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-yellow-300 dark:hover:border-yellow-600 hover:text-yellow-600 dark:hover:text-yellow-400',
                  };
                  return (
                    <button key={key} onClick={() => setCondition(key)} className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${colorClasses[color]}`}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">₦</span>
                <input
                  type="text" value={formatPriceDisplay(price)} onChange={handlePriceChange}
                  placeholder="Enter price" inputMode="numeric"
                  className="w-full pl-9 pr-4 py-3 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition-all font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-base placeholder:font-normal placeholder:text-gray-300 dark:placeholder:text-gray-500"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer mt-3">
                <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700" />
                <span className="text-gray-700 dark:text-gray-300">Price is negotiable</span>
              </label>
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photos <span className="text-red-500">*</span>
              <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(up to {MAX_IMAGES})</span>
            </label>
            <div
              ref={dropZoneRef} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={handleImageClick}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors bg-white dark:bg-gray-800 ${
                isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400'
              }`}
            >
              <input ref={fileInputRef} type="file" accept={ACCEPTED_FORMATS.join(',')} multiple onChange={handleFileChange} className="hidden" />
              <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Click or drag photos here</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">JPG, PNG, WebP, GIF, HEIC - Max 5MB</p>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                {images.map((img, index) => (
                  <ImageUploadCard key={img.id} image={img} index={index} isDragged={draggedIndex === index}
                    onDragStart={() => handleDragStart(index)} onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleImageDragOver(e, index)} onRemove={removeImage} onRetry={handleRetryUpload} />
                ))}
                {images.length < MAX_IMAGES && (
                  <div onClick={handleImageClick} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Brand/Model for structured categories */}
          {selectedStructuredCategory?.hasBrand && getAvailableBrands().length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
                  <select value={selectedBrand} onChange={(e) => handleBrandChange(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-700">
                    <option value="">Select Brand</option>
                    {getAvailableBrands().map((brand) => (<option key={brand} value={brand}>{brand}</option>))}
                  </select>
                </div>
                {selectedBrand && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
                    <select value={selectedModel} onChange={(e) => handleModelChange(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-700">
                      <option value="">Select Model</option>
                      {getAvailableModels().map((model) => (<option key={model} value={model}>{model}</option>))}
                    </select>
                  </div>
                )}
                {selectedModel && modelPresets.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Configuration</label>
                    <select value={selectedConfig} onChange={(e) => handleConfigChange(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-700">
                      <option value="">Select Configuration</option>
                      {modelPresets.map((preset) => (<option key={preset} value={preset}>{preset}</option>))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic spec fields */}
          {displayFields.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-primary-500 rounded-full" />
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Specifications</h3>
              </div>
              <DynamicSpecFields fields={displayFields} values={attributes} onChange={handleAttributeChange} />
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl p-5 space-y-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">Contact Information</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel" value={phone}
                  onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11); setPhone(val); setPhoneError(val.length === 11 ? getPhoneValidationError(val) : null); }}
                  placeholder="e.g. 08034567890"
                  className={`w-full px-4 py-3 text-base font-semibold border-2 rounded-lg focus:outline-none focus:ring-4 transition-all bg-white dark:bg-gray-800 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                    phoneError ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/40' : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-100 dark:focus:ring-primary-900/30'
                  }`}
                  maxLength={11}
                />
                {phoneError && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{phoneError}</p>}
              </div>

              {!sameAsPhone && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">WhatsApp Number</label>
                  <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                    placeholder="e.g. 08034567890"
                    className="w-full px-4 py-3 text-base font-semibold border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/40 transition-all bg-white dark:bg-gray-800 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    maxLength={11}
                  />
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Is this your WhatsApp contact?</span>
                <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-0.5">
                  <button onClick={() => setSameAsPhone(true)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${sameAsPhone ? 'bg-green-500 text-white shadow-sm' : 'bg-transparent text-gray-500 dark:text-gray-400'}`}>Yes</button>
                  <button onClick={() => setSameAsPhone(false)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${!sameAsPhone ? 'bg-primary-600 text-white shadow-sm' : 'bg-transparent text-gray-500 dark:text-gray-400'}`}>No</button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <button onClick={prevStep} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={nextStep} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-semibold text-sm rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md">
              Preview
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 3: PREVIEW & PUBLISH ===== */}
      {step === 3 && (
        <div className="animate-fadeIn">
          <PostAdPreview
            title={title}
            description={description}
            price={price}
            negotiable={negotiable}
            condition={condition}
            locationBreadcrumb={locationBreadcrumb}
            categoryBreadcrumb={categoryBreadcrumb}
            images={images}
            phone={phone}
            whatsapp={sameAsPhone ? phone : whatsapp}
            specFields={specFields}
            specValues={attributes}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onBack={prevStep}
          />
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategorySelector}
        onClose={() => setShowCategorySelector(false)}
        onSelect={(id, name, breadcrumb, slug, parentSlug) => {
          setCategoryId(id);
          setCategorySlug(slug || '');
          setCategoryParentSlug(parentSlug || '');
          setSubcategorySlug(slug || '');
          setCategoryBreadcrumb(breadcrumb);
        }}
        currentCategoryId={categoryId}
      />

      {/* Location Selector Modal */}
      <LocationSelector
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onSelect={(stateId, stateName, lga, fullLocation) => {
          setLocationId(stateId);
          setSelectedStateName(stateName);
          setLgaId(lga);
          setLocationBreadcrumb(fullLocation);
        }}
        selectedStateId={locationId}
        selectedLga={lgaId}
        selectedFullLocation={locationBreadcrumb}
      />

      {/* Post-Submission Boost Modal */}
      <BoostAdModal
        isOpen={showPostModal}
        onClose={() => { setShowPostModal(false); window.location.href = '/'; }}
        adId={postedAdId || 0}
        adSlug={postedAdSlug}
        adTitle={title}
        adImage={postedAdImage}
        adPrice={price}
        adLocation={locationBreadcrumb || undefined}
        adCategory={categoryBreadcrumb || undefined}
        showInitialStep={true}
      />

      {/* Submission progress overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 flex flex-col items-center">
            {submissionStep === 'success' ? (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-200">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Ad Posted Successfully!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Your listing is now live and visible to buyers.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary-200">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Posting your ad</h3>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: submissionStep === 'uploading_images' ? '25%' : submissionStep === 'processing' ? '50%' :
                        submissionStep === 'publishing' ? '75%' : '10%',
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {SUBMISSION_STEPS.find(s => s.key === submissionStep)?.label || 'Please wait...'}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
