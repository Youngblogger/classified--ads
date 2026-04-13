'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { 
  Search, MapPin, X, ChevronDown, Loader2, 
  Clock, TrendingUp, ArrowRight, Navigation 
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/lib/api';
import { useGlobalStore } from '@/lib/store';

interface SearchResult {
  ads: {
    id: number;
    title: string;
    slug: string;
    price: number;
    currency: string;
    thumbnail?: string;
    location?: string;
  }[];
  categories: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  }[];
  locations: {
    id: number;
    name: string;
    slug: string;
    state?: string;
  }[];
  trending?: { term: string; count: number }[];
  typo_correction?: {
    term: string;
    suggestion: string;
    confidence: number;
  } | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  subcategories?: Category[];
}

interface SearchBarProps {
  categories?: Category[];
  variant?: 'header' | 'hero';
  className?: string;
  onSearch?: (query: string, categoryId?: number, locationId?: number) => void;
}

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 10;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const fetcher = (url: string) => fetch(url).then(res => res.json());

const defaultTrending = [
  { term: 'iPhone', count: 150 },
  { term: 'Toyota Camry', count: 120 },
  { term: 'Laptop', count: 95 },
  { term: 'House for rent', count: 85 },
  { term: 'Samsung Galaxy', count: 70 },
];

const categoryIconMap: Record<string, string> = {
  smartphone: '📱',
  laptop: '💻',
  car: '🚗',
  home: '🏠',
  briefcase: '💼',
  shirt: '👕',
  couch: '🛋️',
  sparkles: '💄',
  baby: '👶',
  gamepad2: '🎮',
  plant: '🌾',
  wrench: '🔧',
  factory: '🏭',
  graduationCap: '📚',
  partyPopper: '🎉',
  utensils: '🍽️',
  truck: '🚚',
  dumbbell: '🏋️',
  music: '🎵',
  pawPrint: '🐾',
  plane: '✈️',
  bookOpen: '📖',
};

function getCategoryIcon(icon: string | undefined, categoryName?: string): string {
  if (categoryName) {
    const nameLower = categoryName.toLowerCase();
    if (nameLower.includes('phone') || nameLower.includes('mobile') || nameLower.includes('tablet')) return '📱';
    if (nameLower.includes('vehicle') || nameLower.includes('car') || nameLower.includes('automotive') || nameLower.includes('bicycle')) return '🚗';
    if (nameLower.includes('property') || nameLower.includes('estate') || nameLower.includes('real estate') || nameLower.includes('land') || nameLower.includes('house')) return '🏠';
    if (nameLower.includes('electronic') || nameLower.includes('computer') || nameLower.includes('laptop') || nameLower.includes('tv') || nameLower.includes('camera')) return '💻';
    if (nameLower.includes('fashion') || nameLower.includes('clothing') || nameLower.includes('apparel') || nameLower.includes('shoe') || nameLower.includes('bag')) return '👕';
    if (nameLower.includes('service') || nameLower.includes('professional')) return '🛠️';
    if (nameLower.includes('furniture') || nameLower.includes('home')) return '🛋️';
    if (nameLower.includes('repair') || nameLower.includes('maintenance')) return '🔧';
    if (nameLower.includes('health') || nameLower.includes('beauty') || nameLower.includes('spa')) return '💄';
    if (nameLower.includes('sport') || nameLower.includes('fitness') || nameLower.includes('gym')) return '⚽';
    if (nameLower.includes('baby') || nameLower.includes('kid') || nameLower.includes('children')) return '👶';
    if (nameLower.includes('job') || nameLower.includes('employment')) return '💼';
    if (nameLower.includes('agriculture') || nameLower.includes('farm') || nameLower.includes('garden')) return '🌾';
    if (nameLower.includes('shop') || nameLower.includes('store')) return '🛒';
    if (nameLower.includes('food') || nameLower.includes('catering') || nameLower.includes('restaurant')) return '🍔';
    if (nameLower.includes('music') || nameLower.includes('instrument')) return '🎵';
  }
  if (!icon) return '📦';
  return categoryIconMap[icon] || '📦';
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <span key={i} className="bg-yellow-200 font-medium">{part}</span>
    ) : part
  );
}

function formatPrice(price: number, currency: string = 'NGN'): string {
  if (currency === 'NGN') {
    return `₦${price.toLocaleString()}`;
  }
  return `${currency} ${price.toLocaleString()}`;
}

export default function SearchBar({ 
  categories = [], 
  variant = 'header',
  className = '',
  onSearch 
}: SearchBarProps) {
  const router = useRouter();
  const { selectedLocation } = useGlobalStore();
  
  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<'recent' | 'results'>('recent');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  const debouncedQuery = useDebounce(query, 400);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch locations from API
  const { data: locationsData } = useSWR(
    `${API_URL}/locations`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000, fallbackData: { data: [] } }
  );
  const locations = locationsData?.data || locationsData || [];

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch {
          setRecentSearches([]);
        }
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    
    const updated = [term, ...recentSearches.filter(s => s !== term)]
      .slice(0, MAX_RECENT_SEARCHES);
    
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  // Search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults(null);
        setActiveSection('recent');
        return;
      }

      setIsLoading(true);
      setActiveSection('results');

      try {
        const params = new URLSearchParams();
        params.append('q', debouncedQuery);
        if (selectedCategoryId) params.append('category', selectedCategoryId.toString());
        
        const response = await api.get(`/search?${params.toString()}`);
        setResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, selectedCategoryId]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
      const params = new URLSearchParams();
      params.set('q', query);
      if (selectedCategoryId) params.set('category', selectedCategoryId.toString());
      if (selectedLocationId) params.set('location', selectedLocationId.toString());
      
      router.push(`/ads?${params.toString()}`);
      setShowDropdown(false);
      
      if (onSearch) {
        onSearch(query, selectedCategoryId || undefined, selectedLocationId || undefined);
      }
    }
  }, [query, selectedCategoryId, selectedLocationId, router, saveRecentSearch, onSearch]);

  // Detect user location using browser Geolocation API
  const detectUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Nigerian state approximate boundaries (simplified)
        // We'll match to the closest Nigerian state based on coordinates
        const stateMatch = matchCoordinatesToNigerianState(latitude, longitude);
        
        if (stateMatch) {
          setSelectedLocationId(stateMatch.id.charCodeAt(0));
        } else {
          alert('Could not determine your location in Nigeria. Please select manually.');
        }
        
        setIsDetectingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to detect your location. Please select manually.');
        setIsDetectingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // Simple coordinate matching for Nigerian states
  function matchCoordinatesToNigerianState(lat: number, lng: number): any | null {
    // Simplified approximate boundaries for Nigerian states
    const states: { name: string; slug: string; minLat: number; maxLat: number; minLng: number; maxLng: number }[] = [
      { name: 'Lagos', slug: 'lagos', minLat: 6.4, maxLat: 6.7, minLng: 3.0, maxLng: 3.5 },
      { name: 'Abuja', slug: 'abuja', minLat: 8.9, maxLat: 9.2, minLng: 7.2, maxLng: 7.5 },
      { name: ' Kano', slug: 'kano', minLat: 11.9, maxLat: 12.3, minLng: 8.4, maxLng: 8.8 },
      { name: 'Rivers', slug: 'rivers', minLat: 4.4, maxLat: 5.0, minLng: 6.5, maxLng: 7.2 },
      { name: 'Delta', slug: 'delta', minLat: 5.0, maxLat: 5.8, minLng: 5.5, maxLng: 6.5 },
      { name: 'Oyo', slug: 'oyo', minLat: 7.5, maxLat: 8.0, minLng: 3.5, maxLng: 4.2 },
      { name: 'Ogun', slug: 'ogun', minLat: 6.5, maxLat: 7.2, minLng: 3.0, maxLng: 3.8 },
      { name: 'Enugu', slug: 'enugu', minLat: 6.4, maxLat: 6.9, minLng: 7.0, maxLng: 7.6 },
      { name: 'Kogi', slug: 'kogi', minLat: 7.2, maxLat: 7.9, minLng: 6.2, maxLng: 7.0 },
      { name: 'Anambra', slug: 'anambra', minLat: 5.9, maxLat: 6.4, minLng: 6.8, maxLng: 7.3 },
      { name: 'Imo', slug: 'imo', minLat: 5.4, maxLat: 5.9, minLng: 6.7, maxLng: 7.2 },
      { name: 'Abia', slug: 'abia', minLat: 5.0, maxLat: 5.5, minLng: 7.4, maxLng: 7.9 },
      { name: 'Niger', slug: 'niger', minLat: 9.3, maxLat: 10.3, minLng: 5.5, maxLng: 6.8 },
      { name: 'Benue', slug: 'benue', minLat: 6.5, maxLat: 7.5, minLng: 7.5, maxLng: 8.8 },
      { name: 'Plateau', slug: 'plateau', minLat: 8.8, maxLat: 9.5, minLng: 8.5, maxLng: 9.5 },
    ];

    for (const state of states) {
      if (lat >= state.minLat && lat <= state.maxLat && lng >= state.minLng && lng <= state.maxLng) {
        return locations.find((loc: any) => loc.name.trim() === state.name) || null;
      }
    }

    // Default to Lagos if not matched (most likely urban area)
    return locations.find((loc: any) => loc.name === 'Lagos') || null;
  }

  const handleResultClick = (type: 'ad' | 'category' | 'location', item: any) => {
    saveRecentSearch(item.title || item.name);
    setShowDropdown(false);
    setQuery('');

    if (type === 'ad') {
      router.push(`/ad/${item.slug}`);
    } else if (type === 'category') {
      router.push(`/ads?category=${item.slug}`);
    } else if (type === 'location') {
      router.push(`/ads?location=${item.slug}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = activeSection === 'results' 
      ? [...(results?.ads || []), ...(results?.categories || []), ...(results?.locations || [])]
      : recentSearches;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && activeSection === 'results' && results) {
        const adsList = results.ads || [];
        const catsList = results.categories || [];
        const locsList = results.locations || [];
        
        if (highlightedIndex < adsList.length) {
          handleResultClick('ad', adsList[highlightedIndex]);
        } else if (highlightedIndex < adsList.length + catsList.length) {
          handleResultClick('category', catsList[highlightedIndex - adsList.length]);
        } else if (highlightedIndex < adsList.length + catsList.length + locsList.length) {
          handleResultClick('location', locsList[highlightedIndex - adsList.length - catsList.length]);
        }
        return;
      }
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    searchInputRef.current?.focus();
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const mainCategories = categories.filter((c: any) => !c.parent_id);

  const renderDropdownContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
        </div>
      );
    }

    if (activeSection === 'results' && results) {
      const hasResults = (results.ads?.length || 0) > 0 || 
                        (results.categories?.length || 0) > 0 || 
                        (results.locations?.length || 0) > 0;

      if (!hasResults && query.length >= 2) {
        return (
          <div className="py-8 text-center text-gray-500">
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm mt-1">Try different keywords or check your spelling</p>
          </div>
        );
      }

      return (
        <div className="max-h-[400px] overflow-y-auto">
          {/* Typo Correction Suggestion */}
          {results.typo_correction && (
            <div className="p-3 bg-yellow-50 border-b border-yellow-100">
              <p className="text-sm text-gray-600">
                Did you mean{' '}
                <button
                  onClick={() => {
                    setQuery(results.typo_correction!.suggestion);
                    searchInputRef.current?.focus();
                  }}
                  className="font-semibold text-primary-600 hover:underline"
                >
                  {results.typo_correction.suggestion}
                </button>
                ?
              </p>
            </div>
          )}

          {/* Products */}
          {results.ads && results.ads.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase">Products</p>
              {results.ads.slice(0, 5).map((ad) => (
                <button
                  key={ad.id}
                  onClick={() => handleResultClick('ad', ad)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  {ad.thumbnail ? (
                    <img src={ad.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {highlightMatch(ad.title, query)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPrice(ad.price, ad.currency)} {ad.location && `• ${ad.location}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          {results.categories && results.categories.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase">Categories</p>
              {results.categories.slice(0, 5).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleResultClick('category', cat)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <span className="text-xl">{getCategoryIcon(cat.icon, cat.name)}</span>
                  <span className="text-sm text-gray-900">
                    {highlightMatch(cat.name, query)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Locations */}
          {results.locations && results.locations.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase">Locations</p>
              {results.locations.slice(0, 5).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleResultClick('location', loc)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {highlightMatch(loc.name, query)}
                    {loc.state && <span className="text-gray-500 text-xs ml-1">({loc.state})</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Recent searches and trending
    return (
      <div className="p-2">
        {recentSearches.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" /> Recent Searches
            </p>
            {recentSearches.slice(0, 5).map((term, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(term);
                  searchInputRef.current?.focus();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{term}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = recentSearches.filter((_, i) => i !== idx);
                    setRecentSearches(updated);
                    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
                  }}
                  className="ml-auto p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </button>
            ))}
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Trending
          </p>
          {(results?.trending || defaultTrending).map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(item.term);
                searchInputRef.current?.focus();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <span className="text-sm text-gray-700">{item.term}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`
        flex flex-col ${variant === 'hero' ? '' : ''}
        ${variant === 'hero' ? 'bg-white rounded-2xl p-4 shadow-xl' : 'bg-gray-100 rounded-xl'}
      `}>
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  setShowDropdown(true);
                  if (query.length < 2) {
                    setActiveSection('recent');
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search for cars, phones, furniture, jobs..."
                className={`
                  w-full pl-12 pr-12 py-3 
                  ${variant === 'hero' ? 'bg-gray-50 border border-gray-200' : 'bg-white border-0'}
                  rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 
                  text-dark placeholder-gray-400
                `}
              />
              {query ? (
                <button
                  onClick={handleSearch}
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              ) : (
                <button
                  onClick={handleSearch}
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && (query || recentSearches.length > 0 || true) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                {renderDropdownContent()}
              </div>
            )}
          </div>



          {/* Location Selector */}
          <div className="relative" ref={locationDropdownRef}>
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors
                ${variant === 'hero' ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'}
                text-gray-700 min-w-[140px]
              `}
            >
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="flex-1 text-left text-sm truncate">
                {selectedLocation?.name || 'All Nigeria'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showLocationDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-[400px] overflow-y-auto">
                {/* Detect Location Button */}
                <button
                  onClick={detectUserLocation}
                  disabled={isDetectingLocation}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 text-primary-600"
                >
                  {isDetectingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {isDetectingLocation ? 'Detecting...' : 'Detect my location'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSelectedLocationId(null);
                    setShowLocationDropdown(false);
                  }}
                  className={`
                    w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-left
                    ${!selectedLocationId ? 'bg-primary-50 text-primary-600' : ''}
                  `}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">All Nigeria</span>
                </button>
                {locations.map((state: any) => (
                  <button
                    key={state.id}
                    onClick={() => {
                      setSelectedLocationId(state.id);
                      setShowLocationDropdown(false);
                    }}
                    className={`
                      w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-left
                      ${selectedLocationId === state.id ? 'bg-primary-50 text-primary-600' : ''}
                    `}
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="flex-1">{state.name}</span>
                    {state.children && state.children.length > 0 && (
                      <span className="text-xs text-gray-400">{state.children.length} LGAs</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button removed - now inside search input */}
        </div>
      </div>
    </div>
  );
}