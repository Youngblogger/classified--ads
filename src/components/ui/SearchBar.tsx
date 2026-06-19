'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import {
  Search, MapPin, X, ChevronDown, Loader2,
  Clock, TrendingUp, ArrowRight, Navigation, Sliders
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/lib/api';
import { useGlobalStore } from '@/lib/store';
import { parseQuery, type ParsedQuery } from '@/lib/search-query';
import { getAdImageUrl } from '@/lib/utils';

interface SuggestionAd {
  id: number;
  title: string;
  slug: string;
  price: number;
  currency: string;
  thumbnail?: string;
  location?: string;
}

interface SuggestionCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

interface SuggestionLocation {
  id: number;
  name: string;
  slug: string;
  state?: string;
}

interface SuggestionsData {
  categories: SuggestionCategory[];
  ads: SuggestionAd[];
  locations: SuggestionLocation[];
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
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const fetcher = (url: string) => fetch(url).then(res => res.json());

function getCategoryIcon(icon: string | undefined): string {
  if (!icon) return '📦';
  return icon;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="bg-yellow-200/70 font-medium text-gray-900 rounded-sm px-0.5">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function formatPrice(price: number, currency: string = 'NGN'): string {
  if (currency === 'NGN') return `₦${price.toLocaleString()}`;
  return `${currency} ${price.toLocaleString()}`;
}

function getLocationName(loc: any): string {
  if (typeof loc === 'string') return loc;
  return loc?.name || loc?.slug || '';
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
  const [suggestions, setSuggestions] = useState<SuggestionsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<'recent' | 'suggestions'>('recent');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  const { data: locationsData } = useSWR(
    `${API_URL}/locations`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000, fallbackData: { data: [] } }
  );
  const locations = useMemo(() => locationsData?.data || locationsData || [], [locationsData]);

  const parsedQuery = useMemo(() => parseQuery(query), [query]);

  const flattenedSuggestions = useMemo(() => {
    if (!suggestions) return [];
    const items: { type: 'ad' | 'category' | 'location'; data: any }[] = [];
    (suggestions.ads || []).forEach(a => items.push({ type: 'ad', data: a }));
    (suggestions.categories || []).forEach(c => items.push({ type: 'category', data: c }));
    (suggestions.locations || []).forEach(l => items.push({ type: 'location', data: l }));
    return items;
  }, [suggestions]);

  const allDropdownItems = useMemo(() => {
    if (activeSection === 'suggestions') return flattenedSuggestions;
    return recentSearches.map(s => ({ type: 'recent' as const, data: s }));
  }, [activeSection, flattenedSuggestions, recentSearches]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        try { setRecentSearches(JSON.parse(saved)); }
        catch { setRecentSearches([]); }
      }
    }
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)]
      .slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions(null);
      setActiveSection('recent');
      setHighlightedIndex(-1);
      return;
    }

    let cancelled = false;
    const fetchSuggestions = async () => {
      setIsLoading(true);
      setActiveSection('suggestions');
      try {
        const res = await api.get(`/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`);
        const data = res?.data?.data || res?.data || { categories: [], ads: [], locations: [] };
        if (!cancelled) {
          const mapped: SuggestionsData = {
            categories: (data.categories || []).map((c: any) => ({
              id: c.id, name: c.name, slug: c.slug, icon: c.icon,
            })),
            ads: (data.ads || []).map((a: any) => ({
              id: a.id, title: a.title, slug: a.slug,
              price: a.price, currency: a.currency || 'NGN',
              thumbnail: getAdImageUrl(a),
              location: a.location?.name || a.state || '',
            })),
            locations: (data.locations || []).map((l: any) => ({
              id: l.id, name: l.name, slug: l.slug,
            })),
          };
          const lowerQuery = debouncedQuery.toLowerCase();

          const localMatchedCategories = categories.filter(c =>
            c.name.toLowerCase().includes(lowerQuery)
          ).map(c => ({ id: Number(c.id), name: c.name, slug: c.slug, icon: c.icon }));
          const localMatchedLocations = (locations || []).filter((l: any) =>
            l.name?.toLowerCase().includes(lowerQuery)
          ).map((l: any) => ({ id: l.id, name: l.name, slug: l.slug }));

          mapped.categories = [
            ...mapped.categories,
            ...localMatchedCategories.filter((lmc: any) =>
              !mapped.categories.some((ec: any) => ec.id === Number(lmc.id))
            ),
          ].slice(0, 5);
          mapped.locations = [
            ...mapped.locations,
            ...localMatchedLocations.filter((lml: any) =>
              !mapped.locations.some((el: any) => el.id === lml.id)
            ),
          ].slice(0, 5);

          setSuggestions(mapped);
          setHighlightedIndex(-1);
        }
      } catch {
        if (!cancelled) setSuggestions(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchSuggestions();
    return () => { cancelled = true; };
  }, [debouncedQuery, categories, locations]);

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
    const searchTerm = parsedQuery.keyword || query.trim();
    if (searchTerm) {
      saveRecentSearch(query.trim());
      const params = new URLSearchParams();
      params.set('q', searchTerm);
      if (selectedCategoryId) params.set('category', selectedCategoryId.toString());
      if (selectedLocationId) params.set('location', selectedLocationId.toString());
      if (parsedQuery.location && !selectedLocationId) params.set('location', parsedQuery.location);
      if (parsedQuery.category && !selectedCategoryId) params.set('category', parsedQuery.category);

      router.push(`/ads?${params.toString()}`);
      setShowDropdown(false);

      if (onSearch) {
        onSearch(searchTerm, selectedCategoryId || undefined, selectedLocationId || undefined);
      }
    }
  }, [query, parsedQuery, selectedCategoryId, selectedLocationId, router, saveRecentSearch, onSearch]);

  const detectUserLocation = useCallback(async () => {
    function matchCoordinatesToNigerianState(lat: number, lng: number): any | null {
      const states = [
        { name: 'Lagos', slug: 'lagos', minLat: 6.4, maxLat: 6.7, minLng: 3.0, maxLng: 3.5 },
        { name: 'Abuja', slug: 'abuja', minLat: 8.9, maxLat: 9.2, minLng: 7.2, maxLng: 7.5 },
        { name: 'Kano', slug: 'kano', minLat: 11.9, maxLat: 12.3, minLng: 8.4, maxLng: 8.8 },
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
      return locations.find((loc: any) => loc.name === 'Lagos') || null;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const stateMatch = matchCoordinatesToNigerianState(latitude, longitude);
        if (stateMatch) {
          setSelectedLocationId(stateMatch.id.charCodeAt(0));
        } else {
          alert('Could not determine your location. Please select manually.');
        }
        setIsDetectingLocation(false);
      },
      () => {
        alert('Unable to detect your location. Please select manually.');
        setIsDetectingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [locations]);

  const handleResultClick = (type: 'ad' | 'category' | 'location' | 'recent', item: any) => {
    const label = item.title || item.name || item;
    saveRecentSearch(label);
    setShowDropdown(false);
    setQuery('');

    if (type === 'ad') {
      router.push(`/ad/${item.slug}`);
    } else if (type === 'category') {
      router.push(`/ads?category=${item.slug}`);
    } else if (type === 'location') {
      router.push(`/ads?location=${item.slug || item.name?.toLowerCase()}`);
    } else if (type === 'recent') {
      setQuery(item);
      setShowDropdown(true);
      searchInputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const count = allDropdownItems.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % Math.max(count, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev <= 0 ? Math.max(count - 1, 0) : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < count) {
        const item = allDropdownItems[highlightedIndex];
        handleResultClick(item.type as any, item.data);
        return;
      }
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      searchInputRef.current?.blur();
    } else if (e.key === 'Tab' && showDropdown && highlightedIndex >= 0) {
      const item = allDropdownItems[highlightedIndex];
      if (item.type === 'recent') {
        setQuery(item.data as string);
        e.preventDefault();
      }
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions(null);
    searchInputRef.current?.focus();
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const mainCategories = categories.filter((c: any) => !c.parent_id);

  const renderSuggestionSection = (
    label: string,
    icon: React.ReactNode,
    items: any[],
    type: 'ad' | 'category' | 'location',
    getKey: (item: any) => string | number,
    renderItem: (item: any, idx: number, globalIdx: number) => React.ReactNode,
    maxItems = 5
  ) => {
    if (!items.length) return null;
    const globalStartIdx = flattenedSuggestions.findIndex(s => s.type === type && s.data === items[0]);
    const safeStart = globalStartIdx >= 0 ? globalStartIdx : 0;

    return (
      <div className="py-1">
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {icon}
          <span>{label}</span>
        </div>
        {items.slice(0, maxItems).map((item, idx) => {
          const globalIdx = flattenedSuggestions.findIndex(
            s => s.type === type && (s.data.id === item.id || s.data === item)
          );
          return renderItem(item, idx, globalIdx >= 0 ? globalIdx : safeStart + idx);
        })}
      </div>
    );
  };

  const renderDropdownContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-4">
          <Loader2 className="w-7 h-7 text-primary-500 animate-spin mb-2" />
          <p className="text-xs text-gray-400">Searching...</p>
        </div>
      );
    }

    if (activeSection === 'suggestions' && suggestions) {
      const hasAny = (suggestions.ads?.length || 0) > 0 ||
                     (suggestions.categories?.length || 0) > 0 ||
                     (suggestions.locations?.length || 0) > 0;

      if (!hasAny && query.length >= 2) {
        return (
          <div className="py-10 text-center px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">No suggestions found</p>
            <p className="text-xs text-gray-400 mt-1">Try different keywords or check your spelling</p>
            <button
              onClick={handleSearch}
              className="mt-3 text-xs font-medium text-primary-600 hover:underline"
            >
              Search for &ldquo;{query}&rdquo;
            </button>
          </div>
        );
      }

      const sections: React.ReactNode[] = [];

      if (parsedQuery.keyword && parsedQuery.keyword !== query) {
        sections.push(
          <div key="parsed-hint" className="px-3 py-2 bg-blue-50/80 border-b border-blue-100">
            <p className="text-xs text-blue-700 flex items-center gap-1.5">
              <Sliders className="w-3 h-3" />
              Searching for <strong>&ldquo;{parsedQuery.keyword}&rdquo;</strong>
              {parsedQuery.location && <span> in <strong>{parsedQuery.location}</strong></span>}
            </p>
          </div>
        );
      }

      if (suggestions.ads?.length > 0) {
        sections.push(
          <div key="products" className="border-t border-gray-100 first:border-t-0">
            {renderSuggestionSection(
              'Products', <Search className="w-3 h-3" />,
              suggestions.ads, 'ad',
              a => a.id,
              (ad, idx, gIdx) => (
                <button
                  key={ad.id}
                  onClick={() => handleResultClick('ad', ad)}
                  onMouseEnter={() => setHighlightedIndex(gIdx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    gIdx === highlightedIndex ? 'bg-primary-50/70' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {getAdImageUrl(ad) ? (
                      <Image src={getAdImageUrl(ad)} alt="" fill sizes="36px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Search className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate leading-snug">
                      {highlightMatch(ad.title, query)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatPrice(ad.price, ad.currency)}
                      {ad.location && <span className="text-gray-400"> · {ad.location}</span>}
                    </p>
                  </div>
                </button>
              )
            )}
          </div>
        );
      }

      if (suggestions.categories?.length > 0) {
        sections.push(
          <div key="categories" className="border-t border-gray-100">
            {renderSuggestionSection(
              'Categories', <ChevronDown className="w-3 h-3" />,
              suggestions.categories, 'category',
              c => c.id,
              (cat, idx, gIdx) => (
                <button
                  key={cat.id}
                  onClick={() => handleResultClick('category', cat)}
                  onMouseEnter={() => setHighlightedIndex(gIdx)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                    gIdx === highlightedIndex ? 'bg-primary-50/70' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{getCategoryIcon(cat.icon)}</span>
                  <span className="text-sm text-gray-800">{highlightMatch(cat.name, query)}</span>
                </button>
              )
            )}
          </div>
        );
      }

      if (suggestions.locations?.length > 0) {
        sections.push(
          <div key="locations" className="border-t border-gray-100">
            {renderSuggestionSection(
              'Locations', <MapPin className="w-3 h-3" />,
              suggestions.locations, 'location',
              l => l.id,
              (loc, idx, gIdx) => (
                <button
                  key={loc.id}
                  onClick={() => handleResultClick('location', loc)}
                  onMouseEnter={() => setHighlightedIndex(gIdx)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                    gIdx === highlightedIndex ? 'bg-primary-50/70' : 'hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-800">
                    {highlightMatch(loc.name, query)}
                    {loc.state && <span className="text-gray-400 text-xs ml-1">({loc.state})</span>}
                  </span>
                </button>
              )
            )}
          </div>
        );
      }

      return (
        <div className="max-h-[420px] overflow-y-auto overscroll-contain">
          {sections}
          {query.length >= 2 && (
            <div className="border-t border-gray-100 p-2">
              <button
                onClick={handleSearch}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50/50 rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search for &ldquo;{query}&rdquo;</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="py-1">
        {recentSearches.length > 0 && (
          <div className="mb-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              <span>Recent Searches</span>
            </div>
            {recentSearches.slice(0, 5).map((term, idx) => (
              <button
                key={idx}
                onClick={() => handleResultClick('recent', term)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  idx === highlightedIndex ? 'bg-primary-50/70' : 'hover:bg-gray-50'
                }`}
              >
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate">{term}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = recentSearches.filter((_, i) => i !== idx);
                    setRecentSearches(updated);
                    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
                  }}
                  className="p-1 hover:bg-gray-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 pt-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            <TrendingUp className="w-3 h-3" />
            <span>Trending Searches</span>
          </div>
          {['iPhone 16', 'Toyota Camry', 'Laptop', 'Generator', 'Land for Sale'].map((term, idx) => (
            <button
              key={idx}
              onClick={() => handleResultClick('recent', term)}
              onMouseEnter={() => setHighlightedIndex(recentSearches.length + idx)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                (recentSearches.length + idx) === highlightedIndex ? 'bg-primary-50/70' : 'hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700">{term}</span>
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
                  if (query.length < 2) setActiveSection('recent');
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search for cars, phones, furniture, jobs..."
                className={`
                  w-full pl-12 pr-12 py-3
                  ${variant === 'hero' ? 'bg-gray-50 border border-gray-200' : 'bg-white border-0'}
                  rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500
                  text-dark placeholder-gray-400 text-sm
                `}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {query ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={clearSearch}
                    type="button"
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={handleSearch}
                    type="button"
                    className="p-1.5 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    <Search className="w-4 h-4 text-white" />
                  </button>
                </div>
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

            {/* Animated Dropdown */}
            <div
              className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden transition-all duration-200 ease-out origin-top ${
                showDropdown && (query || recentSearches.length > 0)
                  ? 'opacity-100 scale-y-100 max-h-[480px]'
                  : 'opacity-0 scale-y-95 max-h-0 pointer-events-none'
              }`}
            >
              {renderDropdownContent()}
            </div>
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
              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="flex-1 text-left text-sm truncate">
                {selectedLocation?.name || 'All Nigeria'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>

            {showLocationDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-[400px] overflow-y-auto">
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
                  <span className="font-medium text-sm">
                    {isDetectingLocation ? 'Detecting...' : 'Detect my location'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSelectedLocationId(null);
                    setShowLocationDropdown(false);
                  }}
                  className={`
                    w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-left text-sm
                    ${!selectedLocationId ? 'bg-primary-50 text-primary-600 font-medium' : ''}
                  `}
                >
                  <MapPin className="w-4 h-4" />
                  <span>All Nigeria</span>
                </button>
                {locations.map((state: any) => (
                  <button
                    key={state.id}
                    onClick={() => {
                      setSelectedLocationId(state.id);
                      setShowLocationDropdown(false);
                    }}
                    className={`
                      w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-left text-sm
                      ${selectedLocationId === state.id ? 'bg-primary-50 text-primary-600 font-medium' : ''}
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
        </div>
      </div>
    </div>
  );
}
