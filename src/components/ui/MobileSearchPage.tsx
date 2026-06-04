'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, TrendingUp, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useGlobalStore } from '@/lib/store';
import { api } from '@/lib/api';

const RECENT_SEARCHES_KEY = 'ilist_recent_searches_mobile';
const MAX_RECENT = 8;

const TRENDING = [
  'iPhone 16', 'Toyota Camry', 'Laptop', 'House for rent',
  'Samsung Galaxy', 'Generator', 'Air conditioner', 'Land for sale',
];

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
  const [searchResults, setSearchResults] = useState<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      setSearchResults(null);
    }
  }, [isOpen]);

  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults(null); return; }
    setIsSearching(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
      const respData = res.data;
      const adsList = respData?.data || respData?.results || [];
      setSearchResults({
        ads: adsList.map((ad: any) => ({
          id: ad.id,
          title: ad.title,
          slug: ad.slug,
          price: ad.price,
          currency: ad.currency || 'NGN',
          thumbnail: ad.thumbnail_url || ad.image_url,
          location: ad.location?.name || ad.state || '',
        })),
      });
    } catch { setSearchResults(null); }
    finally { setIsSearching(false); }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => performSearch(query), 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [query, performSearch]);

  const handleSubmit = (term: string) => {
    if (!term.trim()) return;
    saveRecentSearch(term.trim());
    onClose();
    const params = new URLSearchParams();
    params.append('q', term.trim());
    if (selectedLocation?.slug) params.append('location', selectedLocation.slug);
    if (selectedLocation?.lga) params.append('lga', selectedLocation.lga);
    router.push(`/ads?${params.toString()}`);
  };

  const handleBack = useCallback(() => {
    onClose();
  }, [onClose]);

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

  return (
    <div
      className={`fixed inset-0 z-[150] md:hidden transition-all duration-300 ease-out ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Full page */}
      <div
        className={`absolute inset-0 bg-white transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Search Header */}
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
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(query)}
                placeholder="Search phones, cars, properties..."
                className="w-full pl-4 pr-10 py-2.5 bg-white/15 backdrop-blur-sm text-white placeholder-white/60 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent text-sm"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setSearchResults(null); inputRef.current?.focus(); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto px-4 pb-6" style={{ height: 'calc(100vh - 60px)' }}>
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            </div>
          ) : searchResults ? (
            <>
              {searchResults.ads?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary-500 rounded-full" />
                    ADS
                  </p>
                  {searchResults.ads.slice(0, 5).map((ad: any) => (
                    <button
                      key={ad.id}
                      onClick={() => { saveRecentSearch(query); onClose(); router.push(`/ad/${ad.slug}`); }}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {ad.thumbnail ? (
                          <img src={ad.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Search className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{ad.title}</p>
                        <p className="text-sm font-semibold text-primary-600">₦{ad.price?.toLocaleString()}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </button>
                  ))}
                  <button
                    onClick={() => handleSubmit(query)}
                    className="w-full mt-2 py-3 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl active:bg-primary-100 transition-colors"
                  >
                    View all results for &ldquo;{query}&rdquo;
                  </button>
                </div>
              )}
              {(!searchResults.ads || searchResults.ads.length === 0) && query.length >= 2 && (
                <div className="py-12 text-center">
                  <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No results for &ldquo;{query}&rdquo;</p>
                  <button
                    onClick={() => handleSubmit(query)}
                    className="mt-3 text-sm text-primary-600 font-medium active:text-primary-700"
                  >
                    Browse all listings
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-5">
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

              {/* Trending */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  Trending
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((term, i) => (
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
