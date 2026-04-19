'use client';

import { useState, useEffect, useMemo, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import ResponsiveHeader from '@/components/home/ResponsiveHeader';
import Footer from '@/components/layout/Footer';
import AdCard from '@/components/ui/AdCard';
import { Search, Filter, Grid, List, X, ChevronDown, SlidersHorizontal, MapPin, Loader2 } from 'lucide-react';
import { AdGridSkeleton } from '@/components/ui/Skeleton';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) return { data: [], meta: {} };
      throw new Error('Network response was not ok');
    }
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return { data: [], meta: {} };
  }
};

function getEmojiForCategory(name?: string): string {
  if (!name) return '📦';
  const nameLower = name.toLowerCase();
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
  return '📦';
}

interface Ad {
  id: number;
  title: string;
  slug: string;
  price: number;
  currency: string;
  images: { id: number; url: string; is_primary: boolean }[];
  location?: { id: number; name: string };
  category?: { id: number; name: string; slug: string };
  user?: { name: string; avatar?: string };
  created_at: string;
  condition?: string;
  status?: string;
  views?: number;
  updated_at?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  subcategories?: Category[];
}

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular';

function AdsPageContent() {
  const searchParams = useSearchParams();
  
  // URL params
  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const locationSlug = searchParams.get('location') || '';
  const lgaParam = searchParams.get('lga') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Local state
  const [localQuery, setLocalQuery] = useState(query || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedLocationSlug, setSelectedLocationSlug] = useState<string>(locationSlug);
  const [selectedLGA, setSelectedLGA] = useState<string>(lgaParam);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceMinRaw, setPriceMinRaw] = useState('');
  const [priceMaxRaw, setPriceMaxRaw] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [condition, setCondition] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Infinite scroll state
  const [allAds, setAllAds] = useState<Ad[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Fetch categories
  const { data: categoriesData } = useSWR(
    `${API_URL}/categories`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000, fallbackData: [], shouldRetryOnError: false }
  );
  
  // Fetch locations
  const { data: locationsData } = useSWR(
    `${API_URL}/locations`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000, fallbackData: [], shouldRetryOnError: false }
  );
  
  const categories: Category[] = categoriesData?.data || categoriesData || [];
  const locations = locationsData?.data || locationsData || [];

  // Build query params for search API
  const buildQueryParams = useCallback((pageNum: number) => {
    const params = new URLSearchParams();
    if (localQuery) params.set('q', localQuery);
    if (selectedCategoryId) params.set('category_id', selectedCategoryId.toString());
    if (selectedLocationSlug) params.set('location', selectedLocationSlug);
    if (selectedLGA) params.set('lga', selectedLGA);
    if (priceMinRaw) params.set('min_price', priceMinRaw);
    if (priceMaxRaw) params.set('max_price', priceMaxRaw);
    if (condition) params.set('condition', condition);
    
    // Sort mapping
    const sortMapping: Record<SortOption, { sort_by: string; sort_order: string }> = {
      'newest': { sort_by: 'created_at', sort_order: 'desc' },
      'price_asc': { sort_by: 'price', sort_order: 'asc' },
      'price_desc': { sort_by: 'price', sort_order: 'desc' },
      'popular': { sort_by: 'views', sort_order: 'desc' },
    };
    const sortConfig = sortMapping[sortBy];
    params.set('sort_by', sortConfig.sort_by);
    params.set('sort_order', sortConfig.sort_order);
    
    params.set('page', pageNum.toString());
    params.set('per_page', '20');
    return params.toString();
  }, [localQuery, selectedCategoryId, selectedLocationSlug, selectedLGA, priceMin, priceMax, condition, sortBy]);

  // Fetch ads for current page
  const fetchAds = async (pageNum: number, reset: boolean = false) => {
    try {
      if (pageNum === 1) {
        setIsInitialLoad(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const response = await fetch(`${API_URL}/search?${buildQueryParams(pageNum)}`);
      const data = await response.json();
      
      if (reset || pageNum === 1) {
        setAllAds(data.data || []);
      } else {
        setAllAds(prev => [...prev, ...(data.data || [])]);
      }
      
      setTotalPages(data.meta?.last_page || 1);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setIsInitialLoad(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchAds(1, true);
  }, [localQuery, selectedCategoryId, selectedLocationSlug, selectedLGA, priceMinRaw, priceMaxRaw, condition, sortBy]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages && !isLoadingMore) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchAds(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [currentPage, totalPages, isLoadingMore]);

  // Find category by slug
  useEffect(() => {
    if (categorySlug && categories.length > 0) {
      const findCategory = (cats: Category[], target: string): Category | null => {
        for (const cat of cats) {
          if (cat.slug === target) return cat;
          if (cat.subcategories) {
            const found = findCategory(cat.subcategories, target);
            if (found) return found;
          }
        }
        return null;
      };
      const cat = findCategory(categories, categorySlug);
      if (cat) setSelectedCategoryId(cat.id);
    }
  }, [categorySlug, categories]);

  // Sync location from URL
  useEffect(() => {
    setSelectedLocationSlug(locationSlug);
    setSelectedLGA(lgaParam);
  }, [locationSlug, lgaParam]);

  // Sync localQuery from URL
  useEffect(() => {
    setLocalQuery(query || '');
  }, [query]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (localQuery) params.set('q', localQuery);
    if (selectedCategoryId) {
      const cat = categories.find(c => c.id === selectedCategoryId);
      if (cat) params.set('category', cat.slug);
    }
    if (selectedLocationSlug) {
      params.set('location', selectedLocationSlug);
    }
    if (selectedLGA) {
      params.set('lga', selectedLGA);
    }
    window.history.pushState({}, '', `/ads?${params.toString()}`);
  };

  const clearFilters = () => {
    setLocalQuery('');
    setSelectedCategoryId(null);
    setSelectedLocationSlug('');
    setSelectedLGA('');
    setPriceMinRaw('');
    setPriceMaxRaw('');
    setPriceMin('');
    setPriceMax('');
    setCondition('');
    setSortBy('newest');
    window.history.pushState({}, '', '/ads');
  };

  const mainCategories = categories.filter((c: any) => !c.parent_id);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ResponsiveHeader />
      
      <main className="flex-1 w-full px-4 py-6 md:px-6 lg:px-8">
        {/* Search Header */}
        <div className="max-w-7xl mx-auto bg-white rounded-xl p-4 md:p-6 lg:p-8 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search ads..."
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {localQuery ? (
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

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-xl"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>

            {/* Search Button removed - now inside input */}
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Sticky */}
          <div className={`
            lg:w-64 lg:flex-shrink-0
            ${showFilters ? 'block' : 'hidden lg:block'}
          `}>
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Categories */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-gray-700 ${
                    !selectedCategoryId ? 'bg-primary-50 text-primary-600 font-medium' : 'hover:bg-gray-100 bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {mainCategories.slice(0, 10).map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-gray-700 ${
                      selectedCategoryId === cat.id ? 'bg-primary-50 text-primary-600 font-medium' : 'hover:bg-gray-100 bg-gray-50'
                    }`}
                  >
                    <span>{getEmojiForCategory(cat.name)}</span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Location</h3>
              <select
                value={selectedLocationSlug}
                onChange={(e) => {
                  setSelectedLocationSlug(e.target.value);
                  setSelectedLGA('');
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg mb-2"
              >
                <option value="">All Nigeria</option>
                {locations.map((state: any) => (
                  <option key={state.id} value={state.slug}>
                    {state.name}
                  </option>
                ))}
              </select>
              
              {/* LGA Dropdown */}
              {selectedLocationSlug && locations.find((l: any) => l.slug === selectedLocationSlug)?.children && (
                <select
                  value={selectedLGA}
                  onChange={(e) => setSelectedLGA(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <option value="">All LGAs in {locations.find((l: any) => l.slug === selectedLocationSlug)?.name}</option>
                  {locations.find((l: any) => l.slug === selectedLocationSlug)?.children?.map((lga: any) => (
                    <option key={lga.slug} value={lga.name}>
                      {lga.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
                  <input
                    type="text"
                    value={priceMin}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[,]/g, '');
                      setPriceMinRaw(raw);
                      setPriceMin(raw ? Number(raw).toLocaleString('en-US') : '');
                    }}
                    placeholder="Min"
                    className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                  />
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
                  <input
                    type="text"
                    value={priceMax}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[,]/g, '');
                      setPriceMaxRaw(raw);
                      setPriceMax(raw ? Number(raw).toLocaleString('en-US') : '');
                    }}
                    placeholder="Max"
                    className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Condition */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Condition</h3>
              <div className="flex flex-wrap gap-2">
                {['new', 'like_new', 'good', 'fair'].map((cond) => (
                  <button
                    key={cond}
                    onClick={() => setCondition(condition === cond ? '' : cond)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      condition === cond
                        ? cond === 'new' 
                          ? 'bg-green-600 text-white' 
                          : cond === 'like_new'
                            ? 'bg-blue-600 text-white'
                            : cond === 'good'
                              ? 'bg-amber-600 text-white'
                              : 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cond === 'new' ? 'Brand New' : cond === 'like_new' ? 'Like New' : cond === 'good' ? 'Good' : 'Fair'}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg bg-white shadow-sm"
            >
              Clear All Filters
            </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 bg-white rounded-xl p-4 md:p-6 shadow-sm">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {localQuery ? `Results for "${localQuery}"` : 'All Ads'}
                </h1>
                <p className="text-gray-500">
                  {allAds.length} ads found
                  {currentPage < totalPages && ` (showing ${currentPage * 20} of ${totalPages * 20})`}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>

                {/* View Mode */}
                <div className="flex bg-gray-100 border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(query || locationSlug || lgaParam) && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">Active filters:</span>
                {query && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm">
                    &quot;{query}&quot;
                    <button onClick={() => { setLocalQuery(''); handleSearch(); }} className="hover:text-primary-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {locationSlug && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm">
                    {locations.find((l: any) => l.slug === locationSlug)?.name || locationSlug}
                    {lgaParam && ` - ${lgaParam}`}
                    <button onClick={() => { setSelectedLocationSlug(''); setSelectedLGA(''); handleSearch(); }} className="hover:text-primary-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Ads Grid/List */}
            {isInitialLoad ? (
              viewMode === 'grid' ? (
                <AdGridSkeleton count={12} />
              ) : (
                <div className="flex flex-col gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 flex gap-4">
                      <div className="w-48 h-36 bg-gray-200 animate-pulse rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : allAds.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {allAds.map((ad) => (
                    <AdCard key={ad.id} ad={ad} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {allAds.map((ad) => (
                    <AdCard key={ad.id} ad={ad} variant="horizontal" />
                  ))}
                </div>
              )
            ) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No ads found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Infinite Scroll Loading Indicator */}
            {isLoadingMore && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600 mr-2" />
                <span className="text-gray-500">Loading more ads...</span>
              </div>
            )}
            
            {/* Load More Trigger Element */}
            {currentPage < totalPages && !isLoadingMore && (
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function AdsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-1 py-6">
        <AdGridSkeleton count={12} />
      </div>
    }>
      <AdsPageContent />
    </Suspense>
  );
}