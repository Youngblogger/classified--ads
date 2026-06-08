'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, TrendingUp, ArrowRight, Loader2, ArrowLeft, MapPin, Sliders } from 'lucide-react';
import { useGlobalStore } from '@/lib/store';
import { api } from '@/lib/api';
import { parseQuery } from '@/lib/search-query';
import { SafeImage } from '@/components/ui/SafeImage';

const RECENT_SEARCHES_KEY = 'ilist_recent_searches_mobile';
const MAX_RECENT = 8;

interface SuggestionItem {
  type: 'ad' | 'category' | 'location';
  data: any;
}

interface MobileSearchPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSearchPage({ isOpen, onClose }: MobileSearchPageProps) {
  const router = useRouter();
  const { selectedLocation } = useGlobalStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[] | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const parsed = parseQuery(query);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch { setRecentSearches([]); }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setQuery('');
      setSuggestions(null);
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions(null); return; }
    setIsSearching(true);
    try {
      const res = await api.get(`/search/suggestions?q=${encodeURIComponent(q)}`);
      const data = res?.data?.data || res?.data || { categories: [], ads: [], locations: [] };
      const items: SuggestionItem[] = [];
      (data.ads || []).slice(0, 4).forEach((a: any) => items.push({ type: 'ad', data: a }));
      (data.categories || []).slice(0, 4).forEach((c: any) => items.push({ type: 'category', data: c }));
      (data.locations || []).slice(0, 4).forEach((l: any) => items.push({ type: 'location', data: l }));
      setSuggestions(items.length > 0 ? items : null);
      setHighlightedIndex(-1);
    } catch {
      setSuggestions(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchSuggestions(query), 250);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [query, fetchSuggestions]);

  const handleSubmit = (term?: string) => {
    const searchTerm = (term || query).trim();
    if (!searchTerm) return;
    saveRecentSearch(searchTerm);
    onClose();
    const params = new URLSearchParams();
    params.append('q', parsed.keyword || searchTerm);
    if (selectedLocation?.slug) params.append('location', selectedLocation.slug);
    if (selectedLocation?.lga) params.append('lga', selectedLocation.lga);
    if (parsed.location && !selectedLocation?.slug) params.append('location', parsed.location);
    if (parsed.category) params.append('category', parsed.category);
    router.push(`/ads?${params.toString()}`);
  };

  const handleSuggestionClick = (item: SuggestionItem) => {
    const label = item.data.title || item.data.name || '';
    saveRecentSearch(label || query);
    onClose();
    if (item.type === 'ad' && item.data.slug) {
      router.push(`/ad/${item.data.slug}`);
    } else if (item.type === 'category') {
      router.push(`/ads?category=${item.data.slug}`);
    } else if (item.type === 'location') {
      router.push(`/ads?location=${item.data.slug || item.data.name?.toLowerCase()}`);
    }
  };

  const handleBack = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = suggestions || [];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % Math.max(items.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev <= 0 ? Math.max(items.length - 1, 0) : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < items.length) {
        handleSuggestionClick(items[highlightedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      handleBack();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleBack();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleBack]);

  const showParsedHint = parsed.keyword && parsed.keyword !== query && query.length >= 2;

  return (
    <div
      className={`fixed inset-0 z-[150] md:hidden transition-all duration-300 ease-out ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`absolute inset-0 bg-white transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div
          className="px-4 pt-12 pb-3"
          style={{
            background: 'linear-gradient(135deg, #00B53F 0%, #009E38 50%, #008C31 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-1 -ml-1 active:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search phones, cars, properties..."
                className="w-full pl-4 pr-10 py-2.5 bg-white/15 backdrop-blur-sm text-white placeholder-white/60 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent text-sm"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setSuggestions(null); inputRef.current?.focus(); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto px-4 pb-6" style={{ height: 'calc(100vh - 60px)' }}>
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="mt-3">
              {showParsedHint && (
                <div className="px-3 py-2 mb-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 flex items-center gap-1.5">
                    <Sliders className="w-3 h-3" />
                    Searching <strong>&ldquo;{parsed.keyword}&rdquo;</strong>
                    {parsed.location && <span> in <strong>{parsed.location}</strong></span>}
                  </p>
                </div>
              )}

              {suggestions.some(s => s.type === 'ad') && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 px-1">
                    <Search className="w-3 h-3" />
                    Products
                  </p>
                  {suggestions.filter(s => s.type === 'ad').map((item, idx) => (
                    <button
                      key={`ad-${item.data.id}`}
                      onClick={() => handleSuggestionClick(item)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${
                        idx === highlightedIndex ? 'bg-primary-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.data.thumbnail_url || item.data.image_url ? (
                          <SafeImage
                            src={item.data.thumbnail_url || item.data.image_url}
                            alt=""
                            className="object-cover w-full h-full"
                            containerClassName="w-full h-full"
                          />
                        ) : (
                          <Search className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.data.title}</p>
                        <p className="text-sm font-semibold text-primary-600">
                          ₦{(item.data.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {suggestions.some(s => s.type === 'category') && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 px-1">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.filter(s => s.type === 'category').map((item, idx) => (
                      <button
                        key={`cat-${item.data.id}`}
                        onClick={() => handleSuggestionClick(item)}
                        className="px-3 py-2 bg-gray-50 rounded-full text-sm text-gray-700 active:bg-gray-100 transition-colors"
                      >
                        {item.data.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {suggestions.some(s => s.type === 'location') && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 px-1">
                    <MapPin className="w-3 h-3" />
                    Locations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.filter(s => s.type === 'location').map((item, idx) => (
                      <button
                        key={`loc-${item.data.id}`}
                        onClick={() => handleSuggestionClick(item)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-full text-sm text-gray-700 active:bg-gray-100 transition-colors"
                      >
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {item.data.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleSubmit()}
                className="w-full mt-2 py-3 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl active:bg-primary-100 transition-colors"
              >
                View all results for &ldquo;{query}&rdquo;
              </button>
            </div>
          ) : suggestions && suggestions.length === 0 && query.length >= 2 ? (
            <div className="mt-6 py-12 text-center">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No results for &ldquo;{query}&rdquo;</p>
              <button
                onClick={() => handleSubmit()}
                className="mt-3 text-sm text-primary-600 font-medium active:text-primary-700"
              >
                Browse all listings
              </button>
            </div>
          ) : (
            <>
              {recentSearches.length > 0 && (
                <div className="mb-5 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Recent
                    </p>
                    <button
                      onClick={() => { setRecentSearches([]); localStorage.removeItem(RECENT_SEARCHES_KEY); }}
                      className="text-xs text-gray-400 active:text-gray-600"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => { setQuery(term); inputRef.current?.focus(); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-full text-sm text-gray-700 active:bg-gray-100 transition-colors"
                      >
                        <Clock className="w-3 h-3 text-gray-400" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  Trending
                </p>
                <div className="flex flex-wrap gap-2">
                  {['iPhone 16', 'Toyota Camry', 'Laptop', 'Generator', 'Land for Sale', 'Air conditioner', 'Samsung Galaxy', 'House for rent'].map((term, i) => (
                    <button
                      key={i}
                      onClick={() => { setQuery(term); inputRef.current?.focus(); }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-full text-sm text-gray-700 active:bg-gray-100 transition-colors"
                    >
                      <TrendingUp className="w-3 h-3 text-gray-400" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
