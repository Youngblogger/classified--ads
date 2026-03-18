'use client';

import { useState, useRef, useEffect } from 'react';
import { getAuthToken } from '@/lib/cookies';
import { useGlobalStore } from '@/lib/store';
import { locationsApi, categoriesApi } from '@/lib/api';
import { useUIStore } from '@/lib/store';
import { X, MapPin, ChevronLeft, ChevronRight, Search, Check } from 'lucide-react';

// Icons
const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CameraIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface Category {
  id: number;
  name: string;
}

interface ImagePreview {
  file: File;
  preview: string;
}

export default function PostAdPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedLocation, setSelectedLocation } = useGlobalStore();
  const { toggleLocationModal } = useUIStore();
  
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    price: '',
    condition: 'new',
  });
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Location modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLGAModal, setShowLGAModal] = useState(false);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedLGA, setSelectedLGA] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Real data from API
  const [apiLocations, setApiLocations] = useState<any[]>([]);
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  
  // Category modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState<any>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [categorySearch, setCategorySearch] = useState('');
  
  // Fetch locations and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsRes, categoriesRes] = await Promise.all([
          locationsApi.getAll(),
          categoriesApi.getAll()
        ]);
        setApiLocations(locationsRes.data || []);
        setApiCategories(categoriesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const filteredLocations = apiLocations.length > 0 
    ? apiLocations.filter((loc: any) => loc.name.toLowerCase().includes(locationSearch.toLowerCase()))
    : [];

  // Filter categories based on search
  const filteredCategories = apiCategories.length > 0
    ? apiCategories.filter((cat: any) => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
    : [];

  // Input Validation & Sanitization Functions
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Accepts international phone formats with + or digits only
    const phoneRegex = /^\+?[\d\s\-()]{10,20}$/;
    return phoneRegex.test(phone);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateFile = (file: File): { valid: boolean; error: string } => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPG, PNG, GIF, and WebP images are allowed' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    return { valid: true, error: '' };
  };

  const sanitizeFilename = (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  };

  const validateAndSanitize = (name: string, value: string): string => {
    let sanitized = sanitizeInput(value);
    
    if (name === 'price') {
      // Only allow numbers and decimal points
      sanitized = value.replace(/[^0-9.]/g, '');
    }
    
    return sanitized;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validate specific fields
    let error = '';
    if (name === 'email' && value && !validateEmail(value)) {
      error = 'Please enter a valid email address';
    } else if (name === 'phone' && value && !validatePhone(value)) {
      error = 'Please enter a valid phone number';
    } else if (name === 'website' && value && !validateUrl(value)) {
      error = 'Please enter a valid URL';
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    
    // Sanitize input for text fields
    const sanitizedValue = (name === 'title' || name === 'description') ? sanitizeInput(value) : value;
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  // Location handlers
  const handleOpenLocation = () => {
    setShowLocationModal(true);
  };

  const handleStateClick = (state: any) => {
    setSelectedState(state);
    setShowLGAModal(true);
  };

  const handleLGASelect = (lga: string) => {
    setSelectedLGA(lga);
  };

  const handleConfirmLocation = () => {
    if (selectedState) {
      // Use real API location data (simple city, no LGA structure)
      if (apiLocations.length > 0) {
        setSelectedLocation({
          id: selectedState.id,
          name: selectedState.name,
          slug: selectedState.slug,
        });
      } else {
        // Fallback to old LGA structure for static data
        if (selectedLGA) {
          setSelectedLocation({
            id: selectedState.id.charCodeAt(0),
            name: `${selectedLGA}, ${selectedState.name}`,
            slug: `${selectedLGA.toLowerCase().replace(/\s+/g, '-')}-${selectedState.slug}`,
          });
        } else {
          setSelectedLocation({
            id: selectedState.id.charCodeAt(0),
            name: selectedState.name,
            slug: selectedState.slug,
          });
        }
      }
    }
    setShowLocationModal(false);
    setShowLGAModal(false);
    setSelectedState(null);
    setSelectedLGA(null);
  };

  const handleBackToStates = () => {
    setShowLGAModal(false);
    setSelectedState(null);
    setSelectedLGA(null);
  };

  // Category handlers
  const handleOpenCategory = () => {
    setShowCategoryModal(true);
  };

  const handleMainCategoryClick = (category: any) => {
    // Check if category has subcategories
    if (category.subcategories && category.subcategories.length > 0) {
      setSelectedMainCategory(category);
      setShowSubcategoryModal(true);
    } else {
      // No subcategories, select directly
      setFormData(prev => ({ ...prev, category: category.id.toString() }));
      setShowCategoryModal(false);
      setCategorySearch('');
    }
  };

  const handleSubcategorySelect = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
  };

  const handleConfirmCategory = () => {
    if (selectedSubcategory) {
      setFormData(prev => ({ ...prev, category: selectedSubcategory.id.toString() }));
    } else if (selectedMainCategory) {
      setFormData(prev => ({ ...prev, category: selectedMainCategory.id.toString() }));
    }
    setShowCategoryModal(false);
    setShowSubcategoryModal(false);
    setSelectedMainCategory(null);
    setSelectedSubcategory(null);
    setCategorySearch('');
  };

  const handleBackToCategories = () => {
    setShowSubcategoryModal(false);
    setSelectedMainCategory(null);
    setSelectedSubcategory(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImagePreview[] = [];
    Array.from(files).forEach(file => {
      if (images.length + newImages.length >= 8) return;
      
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, images: validation.error }));
        return;
      }
      
      // Sanitize filename
      const sanitizedFile = new File([file], sanitizeFilename(file.name), { type: file.type });
      
      newImages.push({
        file: sanitizedFile,
        preview: URL.createObjectURL(file),
      });
    });

    if (newImages.length > 0) {
      setErrors(prev => ({ ...prev, images: '' }));
      setImages(prev => [...prev, ...newImages].slice(0, 8));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: Record<string, string> = {};
    
    if (!formData.title || formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!selectedLocation) {
      newErrors.location = 'Please select a location';
    }
    
    if (images.length === 0) {
      newErrors.images = 'Please upload at least one image';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please login first');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('category_id', formData.category);
      formDataToSend.append('location_id', selectedLocation?.id?.toString() || '');
      formDataToSend.append('condition', formData.condition);
      
      images.forEach((img) => {
        formDataToSend.append('images[]', img.file);
      });

      const response = await fetch(`${apiUrl}/ads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to post ad');
      }

      const ad = await response.json();
      
      // Show appropriate message based on ad status
      if (ad.status === 'pending') {
        alert('Ad submitted successfully! It is pending approval and will be visible after admin approval.');
      } else {
        alert('Ad posted successfully!');
      }
      
      // Reset form
      setFormData({
        category: '',
        title: '',
        description: '',
        price: '',
        condition: 'new',
      });
      setImages([]);
    } catch (error: any) {
      alert(error.message || 'Failed to post ad. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Post New Ad</h2>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to list your item</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload Section */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
          <p className="text-sm text-gray-500 mb-4">Add up to 8 photos. First photo will be the cover.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                <img
                  src={img.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XIcon className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs rounded-lg">
                    Cover
                  </span>
                )}
              </div>
            ))}
            
            {images.length < 8 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
              >
                <CameraIcon className="w-8 h-8" />
                <span className="text-xs">Add Photo</span>
              </button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleOpenCategory}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 flex items-center justify-between hover:border-gray-400 transition-colors"
              >
                <span className={formData.category ? 'text-dark' : 'text-gray-400'}>
                  {formData.category 
                    ? (() => {
                        // Find the selected category name
                        for (const cat of apiCategories) {
                          if (cat.id.toString() === formData.category) return cat.name;
                          if (cat.subcategories) {
                            for (const sub of cat.subcategories) {
                              if (sub.id.toString() === formData.category) return `${cat.name} > ${sub.name}`;
                            }
                          }
                        }
                        return 'Select category';
                      })()
                    : 'Select category'}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleOpenLocation}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 flex items-center justify-between hover:border-gray-400 transition-colors"
              >
                <span className={selectedLocation ? 'text-dark' : 'text-gray-400'}>
                  {selectedLocation ? selectedLocation.name : 'Select location'}
                </span>
                <MapPin className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={80}
              placeholder="Give your item a catchy title"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            <p className="text-xs text-gray-400 mt-1">{formData.title.length}/80 characters</p>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={6}
              maxLength={2000}
              placeholder="Describe your item in detail. Include brand, model, condition, features, etc."
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{formData.description.length}/2000 characters</p>
          </div>
        </div>

        {/* Pricing & Condition */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pricing & Condition</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min={0}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {['new', 'used', 'refurbished'].map((condition) => (
                  <label key={condition} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value={condition}
                      checked={formData.condition === condition}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{condition}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Ad'}
          </button>
        </div>
      </form>

      {/* Location Modal */}
      {showLocationModal && (
        <>
          {/* State Selection */}
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-scale-in">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-dark">Select Location</h2>
                </div>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search state..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredLocations.map((state) => (
                    <button
                      key={state.id}
                      onClick={() => handleStateClick(state)}
                      className={`flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 ${
                        selectedLocation?.name?.includes(state.name) ? 'bg-primary-50 border-primary-200' : ''
                      }`}
                    >
                      <span className="font-medium text-dark">{state.name}</span>
                      <span className="text-sm text-gray-400">{state.lgas?.length} LGAs</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    {selectedLocation && (
                      <p className="text-sm text-gray-600">
                        Selected: <span className="font-medium text-dark">{selectedLocation.name}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowLocationModal(false)}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* LGA Selection */}
          {showLGAModal && selectedState && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col animate-scale-in">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBackToStates}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-dark">{selectedState.name}</h2>
                      <p className="text-xs text-gray-500">Select LGA</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowLocationModal(false); setShowLGAModal(false); }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <button
                    onClick={() => { setSelectedLGA(null); handleConfirmLocation(); }}
                    className={`w-full flex items-center justify-between p-4 mb-2 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 ${
                      !selectedLGA ? 'bg-primary-50 border-primary-200' : ''
                    }`}
                  >
                    <span className="font-medium text-dark">All of {selectedState.name}</span>
                    {!selectedLGA && <Check className="w-5 h-5 text-primary-600" />}
                  </button>

                  <div className="grid grid-cols-1 gap-1">
                    {selectedState.lgas?.map((lga: string) => (
                      <button
                        key={lga}
                        onClick={() => handleLGASelect(lga)}
                        className={`text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedLGA === lga
                            ? 'bg-primary-100 text-primary-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {selectedLGA === lga && (
                          <Check className="w-4 h-4 inline mr-2" />
                        )}
                        {lga}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      {selectedLGA && (
                        <p className="text-sm text-gray-600">
                          Selected: <span className="font-medium text-dark">{selectedLGA}, {selectedState.name}</span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleConfirmLocation}
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <>
          {/* Main Category Selection */}
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-scale-in">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <h2 className="text-xl font-bold text-dark">Select Category</h2>
                </div>
                <button
                  onClick={() => { setShowCategoryModal(false); setCategorySearch(''); }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleMainCategoryClick(category)}
                      className={`flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 ${
                        selectedMainCategory?.id === category.id ? 'bg-primary-50 border-primary-200' : ''
                      }`}
                    >
                      <span className="font-medium text-dark">{category.name}</span>
                      {category.subcategories && category.subcategories.length > 0 ? (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Check className="w-5 h-5 text-primary-600" />
                      )}
                    </button>
                  ))}
                </div>
                {filteredCategories.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No categories found</p>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    {formData.category && (
                      <p className="text-sm text-gray-600">
                        Selected: <span className="font-medium text-dark">
                          {(() => {
                            for (const cat of apiCategories) {
                              if (cat.id.toString() === formData.category) return cat.name;
                              if (cat.subcategories) {
                                for (const sub of cat.subcategories) {
                                  if (sub.id.toString() === formData.category) return `${cat.name} > ${sub.name}`;
                                }
                              }
                            }
                            return '';
                          })()}
                        </span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => { setShowCategoryModal(false); setCategorySearch(''); }}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Subcategory Selection */}
          {showSubcategoryModal && selectedMainCategory && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col animate-scale-in">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBackToCategories}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-dark">{selectedMainCategory.name}</h2>
                      <p className="text-xs text-gray-500">Select Subcategory</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowCategoryModal(false); setShowSubcategoryModal(false); setCategorySearch(''); }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {/* Option to select main category directly */}
                  <button
                    onClick={() => { setSelectedSubcategory(null); handleConfirmCategory(); }}
                    className={`w-full flex items-center justify-between p-4 mb-2 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 ${
                      !selectedSubcategory ? 'bg-primary-50 border-primary-200' : ''
                    }`}
                  >
                    <span className="font-medium text-dark">All of {selectedMainCategory.name}</span>
                    {!selectedSubcategory && <Check className="w-5 h-5 text-primary-600" />}
                  </button>

                  <div className="grid grid-cols-1 gap-1">
                    {selectedMainCategory.subcategories?.map((sub: any) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubcategorySelect(sub)}
                        className={`text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedSubcategory?.id === sub.id
                            ? 'bg-primary-100 text-primary-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {selectedSubcategory?.id === sub.id && (
                          <Check className="w-4 h-4 inline mr-2" />
                        )}
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      {selectedSubcategory && (
                        <p className="text-sm text-gray-600">
                          Selected: <span className="font-medium text-dark">{selectedMainCategory.name} &gt; {selectedSubcategory.name}</span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleConfirmCategory}
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}