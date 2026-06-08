'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Search,
  X,
  Edit2,
  Edit3,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  RefreshCw,
  MoreHorizontal,
  Trash2,
  ImagePlus,
  Check,
  Type,
  FileText,
  Folder,
  MapPin,
  CircleDollarSign,
  Settings2,
  AlertCircle,
  Zap,
  Sparkles,
  Wand2,
  ChevronDown,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import DynamicField, { CategoryField } from '@/components/forms/DynamicField';
import PremiumBadge from '@/components/ui/PremiumBadge';
import { invalidateSwrCache, notifyCacheInvalidation } from '@/lib/cache-sync';
import { normalizeAd } from '@/lib/normalize-ad';

interface AdImage {
  id: string | number;
  url?: string;
  display_url?: string;
  thumbnail_url?: string;
  full_url?: string;
  full_thumbnail_url?: string;
  is_primary: boolean;
}

interface Ad {
  id: string | number;
  title: string;
  slug: string;
  description?: string;
  price: string | number;
  currency?: string;
  status: string;
  category: { id: number; name: string; slug: string } | { id: string; name: string; slug: string } | null;
  subcategory?: { id: number; name: string; slug: string } | null;
  location: { id?: number; name: string } | { id?: string; name: string } | null;
  state?: string;
  lga?: string;
  attributes?: Record<string, any> | string;
  user: { id: number | string; name: string; email: string; phone?: string; verified: boolean };
  images: AdImage[];
  views: number;
  created_at: string;
  updated_at?: string;
  edited_by_admin?: boolean;
  is_boosted?: boolean;
  boost_type?: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Location {
  id: number;
  name: string;
  lgas?: { id: number; name: string }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const STEALTH_PREFIX = '/secure-control-9ja';

const getToken = () => {
  if (typeof window === 'undefined') return '';
  let token: string | null = localStorage.getItem('admin_token');
  if (!token) {
    try {
      const parsed = JSON.parse(localStorage.getItem('admin-auth-storage') || '{}');
      token = parsed.state?.token;
    } catch {}
  }
  if (!token) {
    const cookieToken = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
    token = cookieToken || null;
  }
  return token || '';
};

function ModalWrapper({
  children,
  onClose,
  maxWidth = 'max-w-lg'
}: {
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleBackdropClick}>
      <div className={`bg-white rounded-2xl w-full ${maxWidth} max-h-[85vh] overflow-y-auto shadow-2xl`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function EditAdModal({
  ad,
  categories,
  locations,
  onClose,
  onSave
}: {
  ad: Ad;
  categories: Category[];
  locations: Location[];
  onClose: () => void;
  onSave: (data: Ad) => void;
}) {
  // Find the initial location_id from the ad's location
  const getInitialLocationId = () => {
    if (ad.location?.id) return ad.location.id;
    // Try to find by state name
    const stateLoc = locations.find(l => l.name === ad.state);
    if (stateLoc) {
      // Use children instead of lgas (API now returns children)
      const locWithChildren = stateLoc as any;
      const lgaLoc = locWithChildren.children?.find((l: any) => l.name === ad.lga);
      if (lgaLoc) return lgaLoc.id;
      return stateLoc.id;
    }
    return 0;
  };

  const [formData, setFormData] = useState({
    title: ad.title,
    description: ad.description || '',
    price: ad.price,
    category_id: ad.category?.id,
    state: ad.state || '',
    lga: ad.lga || '',
    location_id: getInitialLocationId()
  });
  const [saving, setSaving] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState(ad.price ? Number(ad.price).toLocaleString('en-US') : '');
  
  // AI Generation state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiMode, setAiMode] = useState<'improve' | 'shorter' | 'professional' | 'selling_points' | 'translate' | 'generate'>('generate');
  const [showAiOptions, setShowAiOptions] = useState(false);
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [aiTypingText, setAiTypingText] = useState('');
  const aiOptionsRef = useRef<HTMLDivElement>(null);
  
  // Typing animation effect
  useEffect(() => {
    if (!aiGeneratedText) {
      setAiTypingText('');
      return;
    }
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setAiTypingText(aiGeneratedText.slice(0, index));
      if (index >= aiGeneratedText.length) {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [aiGeneratedText]);
  
  // Category fields state
  const [categoryFields, setCategoryFields] = useState<CategoryField[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [attributes, setAttributes] = useState<Record<string, any>>(() => {
    // Parse existing attributes from ad
    if (ad.attributes) {
      if (typeof ad.attributes === 'string') {
        try {
          return JSON.parse(ad.attributes);
        } catch {
          return {};
        }
      }
      return ad.attributes;
    }
    return {};
  });

  // Fetch category fields when category changes
  useEffect(() => {
    const fetchCategoryFields = async () => {
      if (!formData.category_id) {
        setCategoryFields([]);
        return;
      }
      
      setFieldsLoading(true);
      try {
        const response = await fetch(`${API_URL}/categories/${formData.category_id}/fields`);
        const data = await response.json();
        if (data.flat && Array.isArray(data.flat)) {
          setCategoryFields(data.flat);
        } else if (data.fields) {
          const flatFields = Object.values(data.fields as Record<string, CategoryField[]>).flat();
          setCategoryFields(flatFields);
        } else {
          setCategoryFields([]);
        }
      } catch (err) {
        console.error('Failed to fetch category fields:', err);
        setCategoryFields([]);
      } finally {
        setFieldsLoading(false);
      }
    };
    
    fetchCategoryFields();
  }, [formData.category_id]);

  // Handle attribute change
  const handleAttributeChange = (name: string, value: any) => {
    setAttributes(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPriceForDisplay = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) {
      setPriceDisplay('');
      return '';
    }
    const num = parseInt(numericValue, 10);
    const formatted = num.toLocaleString('en-US');
    setPriceDisplay(formatted);
    return numericValue;
  };

  const handleStateChange = (stateName: string) => {
    const stateLoc = locations.find(l => l.name === stateName);
    setFormData({ 
      ...formData, 
      state: stateName, 
      lga: '',
      location_id: stateLoc?.id || 0
    });
  };

  const handleLgaChange = (lgaName: string) => {
    const stateLoc = locations.find(l => l.name === formData.state);
    const locWithChildren = stateLoc as any;
    const lgaLoc = locWithChildren?.children?.find((l: any) => l.name === lgaName);
    setFormData({ 
      ...formData, 
      lga: lgaName,
      location_id: lgaLoc?.id || stateLoc?.id || 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Prepare the data to send
      const updateData: Record<string, any> = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        edited_by_admin: true
      };

      // Only include category_id if it's set
      if (formData.category_id) {
        updateData.category_id = formData.category_id;
      }

      // Only include location_id if it's set
      if (formData.location_id) {
        updateData.location_id = formData.location_id;
      }

      // Also send state and lga for reference
      if (formData.state) {
        updateData.state = formData.state;
      }
      if (formData.lga) {
        updateData.lga = formData.lga;
      }
      
      // Include attributes if there are any
      if (Object.keys(attributes).length > 0) {
        updateData.attributes = attributes;
      }

      const res = await fetch(`${API_URL}${STEALTH_PREFIX}/ad/${ad.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (data.success || data.data) {
        toast.success('Ad updated successfully');
        // Update with the response data including any changes from the server
        const updatedAd = { 
          ...ad, 
          ...formData, 
          ...data.data,
          attributes,
          edited_by_admin: true 
        };
        onSave(updatedAd);
        onClose();
      } else {
        toast.error(data.message || 'Failed to update ad');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update ad');
    } finally {
      setSaving(false);
    }
  };

  // Gather product details for AI from the ad and form data
  const getProductDetails = useCallback(() => {
    const cat = categories.find(c => c.id === formData.category_id);
    const subcat = (ad as any).subcategory;
    const stateLoc = locations.find(l => l.name === formData.state);
    const features: string[] = [];
    if (Array.isArray(attributes.custom_features)) {
      features.push(...attributes.custom_features);
    }
    Object.entries(attributes).forEach(([key, value]) => {
      if (key !== 'custom_features' && value) {
        features.push(`${key}: ${value}`);
      }
    });

    return {
      title: formData.title || ad.title,
      description: formData.description || ad.description || '',
      category: cat?.name || '',
      subcategory: subcat?.name || '',
      price: formData.price || ad.price,
      condition: (attributes as any).condition || '',
      brand: (attributes as any).brand || '',
      location: [formData.state, formData.lga].filter(Boolean).join(', '),
      features,
    };
  }, [formData, ad, categories, locations, attributes]);

  const handleGenerateWithAI = useCallback(async (mode: 'improve' | 'shorter' | 'professional' | 'selling_points' | 'translate' | 'generate') => {
    setAiGenerating(true);
    setAiMode(mode);
    setShowAiOptions(false);
    setAiGeneratedText('');
    setAiTypingText('');

    try {
      const details = getProductDetails();
      const response = await fetch('/api/admin/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...details, mode }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate description');

      setAiGeneratedText(data.text);
      setFormData(prev => ({ ...prev, description: data.text }));
    } catch (err: any) {
      toast.error(err.message || 'AI generation failed');
    } finally {
      setAiGenerating(false);
    }
  }, [getProductDetails]);

  // Close AI options when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (aiOptionsRef.current && !aiOptionsRef.current.contains(e.target as Node)) {
        setShowAiOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-2xl">
      <div className="bg-gradient-to-br from-slate-50 to-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Edit Ad</h2>
              <p className="text-xs text-gray-500">Update listing details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-2">
                <Type className="w-4 h-4 text-gray-400" />
                Title
              </span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-200 transition-all bg-white"
              placeholder="Enter ad title"
              required
            />
          </div>
          
          {/* Description with AI */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Description
              </span>
            </label>
            <div className="relative">
              <textarea
                value={aiGeneratedText ? aiTypingText : formData.description}
                onChange={e => {
                  setFormData({ ...formData, description: e.target.value });
                  setAiGeneratedText('');
                  setAiTypingText('');
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-200 transition-all bg-white min-h-[120px] resize-y"
                placeholder="Describe your item..."
              />
              {aiGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-sky-500 animate-pulse" />
                    <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                  </div>
                  <span className="text-sm text-sky-600 font-medium animate-pulse">Generating with AI...</span>
                </div>
              )}
            </div>
            {/* AI Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative" ref={aiOptionsRef}>
                <button
                  type="button"
                  onClick={() => setShowAiOptions(!showAiOptions)}
                  disabled={aiGenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-purple-500 text-white text-xs font-medium rounded-lg hover:from-sky-600 hover:to-purple-600 transition-all disabled:opacity-50 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate with AI
                  <ChevronDown className={`w-3 h-3 transition-transform ${showAiOptions ? 'rotate-180' : ''}`} />
                </button>
                
                {showAiOptions && (
                  <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-10 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      type="button"
                      onClick={() => handleGenerateWithAI('generate')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                      Generate New
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateWithAI('improve')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 transition-colors"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-purple-500" />
                      Improve Description
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateWithAI('shorter')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      Make Shorter
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateWithAI('professional')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-green-500" />
                      Make More Professional
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateWithAI('selling_points')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-orange-500" />
                      Add Selling Points
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateWithAI('translate')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      Translate (Pidgin)
                    </button>
                  </div>
                )}
              </div>

              {aiGeneratedText && (
                <button
                  type="button"
                  onClick={() => handleGenerateWithAI(aiMode)}
                  disabled={aiGenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              )}
            </div>
          </div>
          
          {/* Price & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2">
                  <CircleDollarSign className="w-4 h-4 text-gray-400" />
                  Price (₦)
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₦</span>
                <input
                  type="text"
                  value={priceDisplay}
                  onChange={e => {
                    const numericValue = formatPriceForDisplay(e.target.value);
                    setFormData({ ...formData, price: numericValue });
                  }}
                  onBlur={() => {
                    if (formData.price && !priceDisplay) {
                      setPriceDisplay(Number(formData.price).toLocaleString('en-US'));
                    }
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-200 transition-all bg-white font-medium"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-gray-400" />
                  Category
                </span>
              </label>
              <select
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-200 transition-all bg-white"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Location Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              Location
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* State */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">State</label>
                <select
                  value={formData.state}
                  onChange={e => handleStateChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-200 transition-all bg-white"
                >
                  <option value="">Select state</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
              
              {/* LGA */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">LGA / Area</label>
                {formData.state ? (
                  <select
                    value={formData.lga}
                    onChange={e => handleLgaChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-200 transition-all bg-white"
                  >
                    <option value="">Select LGA</option>
                    {(locations.find(l => l.name === formData.state) as any)?.children?.map((lga: any) => (
                      <option key={lga.id} value={lga.name}>{lga.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-400 text-sm">
                    Select a state first
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Category-Specific Features Section */}
          {formData.category_id && (
            <div className="space-y-4 p-4 bg-gradient-to-br from-sky-50/50 to-white rounded-xl border border-sky-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-sky-500" />
                  Product Features
                </h3>
                {fieldsLoading && (
                  <div className="flex items-center gap-2 text-xs text-sky-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading fields...
                  </div>
                )}
              </div>
              
              {categoryFields.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categoryFields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <DynamicField
                        field={field}
                        value={attributes}
                        onChange={handleAttributeChange}
                      />
                    </div>
                  ))}
                </div>
              ) : !fieldsLoading && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    No predefined features for this category. Enter custom features below:
                  </div>
                  {/* Custom Features Input */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Add Custom Feature</label>
                      <input
                        type="text"
                        placeholder="e.g., Brand: Samsung, Color: Blue, etc."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-200 transition-all bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const value = input.value.trim();
                            if (value) {
                              const currentFeatures = Array.isArray(attributes.custom_features) 
                                ? attributes.custom_features 
                                : [];
                              handleAttributeChange('custom_features', [...currentFeatures, value]);
                              input.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    {/* Display added custom features */}
                    {Array.isArray(attributes.custom_features) && attributes.custom_features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attributes.custom_features.map((feature: string, index: number) => (
                          <div 
                            key={index}
                            className="flex items-center gap-2 px-3 py-1.5 bg-sky-100 text-sky-700 rounded-full text-sm"
                          >
                            <span>{feature}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newFeatures = attributes.custom_features.filter((_: string, i: number) => i !== index);
                                handleAttributeChange('custom_features', newFeatures);
                              }}
                              className="hover:text-sky-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl hover:from-sky-600 hover:to-sky-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
}

function ReplaceImagesModal({
  ad,
  onClose,
  onSave
}: {
  ad: Ad;
  onClose: () => void;
  onSave: (images: AdImage[]) => void;
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [existingImages, setExistingImages] = useState(ad.images || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalImageIds = useRef<(string | number)[]>(ad.images?.map((img: AdImage) => img.id) || []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    if (files.length > 0) setHasChanges(true);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newImages = [...existingImages];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    setExistingImages(newImages);
    setDraggedIndex(index);
    setHasChanges(true);
  };

  const handleDropZone = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      setSelectedFiles(files);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    // If no changes at all
    if (selectedFiles.length === 0 && !hasChanges) {
      toast.error('No changes to save');
      return;
    }
    
    // If only reordered (hasChanges but no new files) - save the new order
    if (selectedFiles.length === 0 && hasChanges) {
      setUploading(true);
      try {
        const imageIds = existingImages.map((img: AdImage) => img.id);
        const res = await fetch(`${API_URL}${STEALTH_PREFIX}/ad/${ad.id}/images/order`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ image_ids: imageIds })
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Image order updated');
          onSave(data.images || existingImages);
          onClose();
        } else {
          toast.error(data.message || 'Failed to update order');
        }
      } catch (error) {
        console.error('Order update error:', error);
        toast.error('Failed to update order');
      } finally {
        setUploading(false);
      }
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('images[]', file));

      const res = await fetch(`${API_URL}${STEALTH_PREFIX}/ad/${ad.id}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      const data = await res.json();
      if (data.success || data.images) {
        toast.success('Images uploaded successfully');
        onSave(data.images || existingImages);
        onClose();
      } else {
        toast.error(data.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeExistingImage = async (imageId: string | number) => {
    if (!confirm('Delete this image?')) return;
    try {
      const res = await fetch(`${API_URL}${STEALTH_PREFIX}/ad/${ad.id}/image/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Image deleted');
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        setHasChanges(true);
      } else {
        toast.error(data.message || 'Failed to delete image');
      }
    } catch {
      toast.error('Failed to delete image');
    }
  };

  const getImageUrl = (img: AdImage): string => {
    const url = img.thumbnail_url || img.display_url || img.url || '';
    // If it's already a full URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Otherwise, prepend the storage base URL
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '');
    return `${baseUrl}/storage/${url}`;
  };

  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-xl">
      <div>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Replace Images</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Current Images (drag to reorder)</h3>
            {existingImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {existingImages.map((img, index) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragOver={handleDragOver}
                    className={`relative group cursor-move ${draggedIndex === index ? 'opacity-50' : ''}`}
                  >
                    <Image
                      src={getImageUrl(img)}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover rounded-lg"
                    />
                    {img.is_primary && (
                      <span className="absolute top-1 left-1 bg-sky-600 text-white text-xs px-1.5 py-0.5 rounded">Primary</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No images</p>
            )}
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDropZone}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-sky-400 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {previews.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <Image src={src} alt="" fill sizes="80px" className="object-cover rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <ImagePlus className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Click or drag images here to upload</p>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || (!hasChanges && selectedFiles.length === 0)}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : selectedFiles.length > 0 ? (
                <>
                  <ImagePlus className="w-4 h-4" />
                  Upload Images
                </>
              ) : (
                <>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
  danger = false
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-gray-500 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-3 py-1.5 text-white rounded-lg disabled:opacity-50 flex items-center gap-1 text-sm ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

function RejectDialog({
  ad,
  reason,
  setReason,
  loading,
  onConfirm,
  onClose
}: {
  ad: Ad;
  reason: string;
  setReason: (v: string) => void;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
<ModalWrapper onClose={onClose} maxWidth="max-w-md">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2">Reject Ad</h2>
        <p className="text-gray-500 mb-4">Are you sure you want to reject this ad?</p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason for rejection..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 min-h-[80px] text-sm"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1 text-sm"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            Reject Ad
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

export default function AdsModerationPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 20;
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAds, setSelectedAds] = useState<Set<string | number>>(new Set());
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const fetchAds = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // 1. Try Supabase first — it has all the data
      let allAds: Ad[] = [];
      let totalCount = 0;

      try {
        const sbParams = new URLSearchParams({
          per_page: String(perPage),
          page: String(pageNum)
        });
        if (statusFilter !== 'all') sbParams.append('status', statusFilter);
        if (searchTerm) sbParams.append('search', searchTerm);
        const sbRes = await fetch(`/api/admin/ads/all?${sbParams}`);
        const sbData = sbRes.ok ? await sbRes.json() : null;
        if (sbRes.ok && sbData) {
          const rawListings = sbData.data || [];
          const mapped: Ad[] = rawListings.map((l: any) => normalizeAd({ ...l, images: l.listing_images || [], listing_images: l.listing_images || [] }));
          allAds = mapped;
          totalCount = sbData.total || mapped.length;
        }
      } catch (e) {
        console.error('Supabase fetch failed:', e);
      }

      // 2. Also try Laravel (may have extra ads or different data)
      try {
        const params = new URLSearchParams({
          per_page: String(perPage),
          page: String(pageNum)
        });
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (searchTerm) params.append('search', searchTerm);

        const res = await fetch(`${API_URL}${STEALTH_PREFIX}/ads?${params}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            toast.error('Session expired');
            window.location.href = '/admin/login';
            return;
          }
        } else {
          const data = await res.json();
          const laravelAds: Ad[] = data.data || [];
          // Merge Laravel ads (prefer their data, but deduplicate by id)
          const existingIds = new Set(allAds.map(a => a.id));
          for (const la of laravelAds) {
            if (!existingIds.has(la.id)) {
              allAds.push(la);
              existingIds.add(la.id);
            }
          }
          if (!totalCount) totalCount = data.total || laravelAds.length;
        }
      } catch (e) {
        console.error('Laravel fetch failed:', e);
        // Continue with Supabase data only
      }

      if (append) {
        setAds(prev => [...prev, ...allAds]);
      } else {
        setAds(allAds);
        setSelectedAds(new Set());
      }
      setTotalCount(totalCount || allAds.length);
      setHasMore(allAds.length === perPage);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      toast.error('Failed to load ads');
      if (!append) setAds([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [perPage, statusFilter, searchTerm]);

  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, []);

  useEffect(() => {
    setPage(1);
    setSelectedAds(new Set());
    fetchAds(1, false);
  }, [statusFilter, searchTerm, fetchAds]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchAds(page + 1, true);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      setCategories(data.data || []);
    } catch {
      console.error('Failed to fetch categories');
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_URL}/locations`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      setLocations(data.data || data || []);
    } catch {
      console.error('Failed to fetch locations');
    }
  };

  const triggerCacheSync = useCallback(() => {
    invalidateSwrCache(/^ads\?/);
    invalidateSwrCache('homepage_data');
    invalidateSwrCache('boosted_ads_listing');
    invalidateSwrCache(/^search/);
    invalidateSwrCache(/^secure-control-9ja/);
    notifyCacheInvalidation();
  }, []);

  const handleApprove = async () => {
    if (!selectedAd) return;
    try {
      setActionLoading(selectedAd.id);
      const res = await fetch(`${API_URL}${STEALTH_PREFIX}/ads/${selectedAd.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      if (data.ad || data.message) {
        toast.success('Ad approved');
        setAds(prev => prev.map(ad => ad.id === selectedAd.id ? { ...ad, status: 'active' } : ad));
        setShowApproveModal(false);
        triggerCacheSync();
      } else {
        toast.error(data.message || 'Failed to approve');
      }
    } catch {
      toast.error('Failed to approve ad');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedAd) return;
    try {
      setActionLoading(selectedAd.id);
      const res = await fetch(`${API_URL}${STEALTH_PREFIX}/ads/${selectedAd.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await res.json();
      if (data.ad || data.message) {
        toast.success('Ad rejected');
        setAds(prev => prev.map(ad => ad.id === selectedAd.id ? { ...ad, status: 'rejected', moderation_note: rejectReason } : ad));
        setShowRejectModal(false);
        setRejectReason('');
        triggerCacheSync();
      } else {
        toast.error(data.message || 'Failed to reject');
      }
    } catch {
      toast.error('Failed to reject ad');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedAd) return;
    try {
      setActionLoading(selectedAd.id);
      const res = await fetch(`${API_URL}${STEALTH_PREFIX}/ads/${selectedAd.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Ad deleted');
        setAds(prev => prev.filter(ad => ad.id !== selectedAd.id));
        setShowDeleteModal(false);
        triggerCacheSync();
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete ad');
    } finally {
      setActionLoading(null);
    }
  };

  const getImageUrl = (ad: Ad): string => {
    const img = ad.images?.find(i => i.is_primary) || ad.images?.[0];
    if (!img) return '';
    const url = img.full_url || img.display_url || img.url || '';
    // If it's already a full URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Otherwise, prepend the storage base URL
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '');
    return `${baseUrl}/storage/${url}`;
  };

  const toggleSelectAll = () => {
    if (selectedAds.size === ads.length) {
      setSelectedAds(new Set());
    } else {
      setSelectedAds(new Set(ads.map(ad => ad.id)));
    }
  };

  const toggleSelectAd = (adId: string | number) => {
    const newSelected = new Set(selectedAds);
    if (newSelected.has(adId)) {
      newSelected.delete(adId);
    } else {
      newSelected.add(adId);
    }
    setSelectedAds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedAds.size === 0) return;
    if (!confirm(`Delete ${selectedAds.size} selected ads? This cannot be undone.`)) return;
    
    setBulkDeleteLoading(true);
    const idsToDelete = Array.from(selectedAds);
    
    try {
      // Delete each ad individually
      const deletePromises = idsToDelete.map(async (id) => {
        const res = await fetch(`${API_URL}${STEALTH_PREFIX}/ads/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json'
          }
        });
        return { id, success: res.ok || res.status === 204 };
      });
      
      const results = await Promise.all(deletePromises);
      const successfulDeletes = results.filter(r => r.success).map(r => r.id);
      
      if (successfulDeletes.length > 0) {
        toast.success(`${successfulDeletes.length} ads deleted`);
        setAds(prev => prev.filter(ad => !successfulDeletes.some(id => String(id) === String(ad.id))));
        setSelectedAds(new Set());
        setTotalCount(prev => prev - successfulDeletes.length);
        triggerCacheSync();
      }
      
      if (successfulDeletes.length < idsToDelete.length) {
        toast.error(`${idsToDelete.length - successfulDeletes.length} ads failed to delete`);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete ads');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    active: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Quality & Moderation</h1>
          <p className="text-gray-500 mt-1">Review, edit, and manage classified ads</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedAds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {bulkDeleteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              Delete Selected ({selectedAds.size})
            </button>
          )}
          <button
            onClick={() => { fetchAds(1, false); setSelectedAds(new Set()); }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'active', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                statusFilter === status
                  ? 'bg-sky-100 text-sky-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {totalCount > 0 && (
            <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
              {totalCount.toLocaleString()} {totalCount === 1 ? 'ad' : 'ads'} total
            </span>
          )}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-500 w-10">
                  <input
                    type="checkbox"
                    checked={ads.length > 0 && selectedAds.size === ads.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Ad</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Category</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Location</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto" />
                  </td>
                </tr>
              ) : ads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No ads found</p>
                  </td>
                </tr>
              ) : (
                ads.map(ad => (
                  <tr key={ad.id} className={`hover:bg-gray-50 ${selectedAds.has(ad.id) ? 'bg-sky-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedAds.has(ad.id)}
                        onChange={() => toggleSelectAd(ad.id)}
                        className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                          {getImageUrl(ad) ? (
                            <Image src={getImageUrl(ad)} alt="" fill sizes="56px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{ad.title}</p>
                          <p className="text-sm text-gray-500">
                            ₦{Number(ad.price).toLocaleString()}
                          </p>
                          {ad.is_boosted && (
                            <PremiumBadge boostType={ad.boost_type} badgeIcon={(ad as any).badge_icon} size="sm" variant="inline" className="mt-0.5" />
                          )}
                          {ad.edited_by_admin && (
                            <span className="text-xs text-purple-600 flex items-center gap-1">
                              <Edit2 className="w-3 h-3" /> Edited
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{ad.category?.name || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{ad.location?.name || ad.state || '-'}</p>
                      {ad.lga && <p className="text-xs text-gray-500">{ad.lga}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[ad.status] || 'bg-gray-100 text-gray-700'}`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => window.open(`/ad/${ad.slug}`, '_blank')}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-sky-500 hover:bg-sky-600 rounded shadow-sm transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => { setSelectedAd(ad); setShowEditModal(true); }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded shadow-sm transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => { setSelectedAd(ad); setShowImagesModal(true); }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-purple-500 hover:bg-purple-600 rounded shadow-sm transition-all"
                          title="Replace Images"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Img
                        </button>
                        {ad.status !== 'active' && ad.status !== 'approved' && (
                          <button
                            onClick={() => { setSelectedAd(ad); setShowApproveModal(true); }}
                            disabled={actionLoading === ad.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded shadow-sm transition-all disabled:opacity-50"
                            title="Approve"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            App
                          </button>
                        )}
                        {ad.status !== 'rejected' && (
                          <button
                            onClick={() => { setSelectedAd(ad); setShowRejectModal(true); }}
                            disabled={actionLoading === ad.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 rounded shadow-sm transition-all disabled:opacity-50"
                            title="Reject"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Rej
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedAd(ad); setShowDeleteModal(true); }}
                          disabled={actionLoading === ad.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded shadow-sm transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hasMore && ads.length > 0 && (
          <div className="py-4 border-t border-gray-200 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-2.5 bg-white border-2 border-gray-200 text-gray-600 font-medium rounded-full hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                  <span className="text-sky-600">Loading...</span>
                </>
              ) : (
                <>
                  <MoreHorizontal className="w-4 h-4 text-sky-500" />
                  <span className="text-sm">Load More</span>
                  {totalCount > 0 && (
                    <span className="text-xs text-gray-400">
                      ({totalCount - ads.length})
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {showEditModal && selectedAd && (
        <EditAdModal
          ad={selectedAd}
          categories={categories}
          locations={locations}
          onClose={() => setShowEditModal(false)}
          onSave={updated => {
            setAds(prev => prev.map(ad => ad.id === updated.id ? updated : ad));
          }}
        />
      )}

      {showImagesModal && selectedAd && (
        <ReplaceImagesModal
          ad={selectedAd}
          onClose={() => setShowImagesModal(false)}
          onSave={images => {
            setAds(prev => prev.map(ad => ad.id === selectedAd.id ? { ...ad, images } : ad));
          }}
        />
      )}

      {showApproveModal && selectedAd && (
        <ConfirmDialog
          title="Approve Ad"
          message={`Are you sure you want to approve "${selectedAd.title}"?`}
          confirmLabel="Approve"
          onConfirm={handleApprove}
          onClose={() => setShowApproveModal(false)}
        />
      )}

      {showRejectModal && selectedAd && (
        <RejectDialog
          ad={selectedAd}
          reason={rejectReason}
          setReason={setRejectReason}
          loading={actionLoading === selectedAd.id}
          onConfirm={handleReject}
          onClose={() => setShowRejectModal(false)}
        />
      )}

      {showDeleteModal && selectedAd && (
        <ConfirmDialog
          title="Delete Ad"
          message={`Are you sure you want to permanently delete "${selectedAd.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
          danger
        />
      )}
    </div>
  );
}