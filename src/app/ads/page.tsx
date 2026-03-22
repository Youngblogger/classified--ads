'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';
import AdCard from '@/components/ui/AdCard';
import { Search, Filter, Grid, List, X, ChevronDown, SlidersHorizontal, MapPin, Loader2 } from 'lucide-react';
import { nigeriaLocations, NigeriaLocation } from '@/lib/nigeriaLocations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
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
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [condition, setCondition] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch data
  const { data: categoriesData } = useSWR(
    `${API_URL}/categories`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000, fallbackData: [], shouldRetryOnError: false }
  );
  
  const categories: Category[] = categoriesData?.data || categoriesData || [];

  // Build query params for search API
  const buildQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (localQuery) params.set('q', localQuery);
    if (selectedCategoryId) params.set('category_id', selectedCategoryId.toString());
    if (selectedLocationSlug) params.set('location', selectedLocationSlug);
    if (selectedLGA) params.set('lga', selectedLGA);
    if (priceMin) params.set('min_price', priceMin);
    if (priceMax) params.set('max_price', priceMax);
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
    
    params.set('page', page.toString());
    return params.toString();
  }, [localQuery, selectedCategoryId, selectedLocationSlug, selectedLGA, priceMin, priceMax, condition, sortBy, page]);

  const { data: adsData, isLoading, error } = useSWR(
    `${API_URL}/search?${buildQueryParams}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000, fallbackData: { data: [], meta: {} }, shouldRetryOnError: false }
  );

  const ads: Ad[] = adsData?.data || adsData || [];
  const meta = adsData?.meta || {};

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
    setPriceMin('');
    setPriceMax('');
    setCondition('');
    setSortBy('newest');
    window.history.pushState({}, '', '/ads');
  };

  const mainCategories = categories.filter((c: any) => !c.parent_id);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
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
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-xl"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold"
            >
              Search
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Sticky */}
          <div className={`
            lg:w-64 lg:flex-shrink-0
            ${showFilters ? 'block' : 'hidden lg:block'}
          `}>
            <div className="lg:sticky lg:top-24 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    !selectedCategoryId ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {mainCategories.slice(0, 10).map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                      selectedCategoryId === cat.id ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.icon || '📦'}</span>
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
                {nigeriaLocations.map((state) => (
                  <option key={state.id} value={state.slug}>
                    {state.name}
                  </option>
                ))}
              </select>
              
              {/* LGA Dropdown */}
              {selectedLocationSlug && nigeriaLocations.find(l => l.slug === selectedLocationSlug)?.lgas && (
                <select
                  value={selectedLGA}
                  onChange={(e) => setSelectedLGA(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <option value="">All LGAs in {nigeriaLocations.find(l => l.slug === selectedLocationSlug)?.name}</option>
                  {nigeriaLocations.find(l => l.slug === selectedLocationSlug)?.lgas?.map((lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                />
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            {/* Condition */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Condition</h3>
              <div className="space-y-2">
                {['new', 'used', 'refurbished'].map((cond) => (
                  <label key={cond} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value={cond}
                      checked={condition === cond}
                      onChange={(e) => setCondition(e.target.value)}
                      className="text-primary-600"
                    />
                    <span className="capitalize">{cond}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              Clear All Filters
            </button>
          </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {localQuery ? `Results for "${localQuery}"` : 'All Ads'}
                </h1>
                <p className="text-gray-500">
                  {meta?.total || ads.length} ads found
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
                <div className="hidden md:flex bg-white border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : ''}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : ''}`}
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
                    "{query}"
                    <button onClick={() => { setLocalQuery(''); handleSearch(); }} className="hover:text-primary-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {locationSlug && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm">
                    {nigeriaLocations.find(l => l.slug === locationSlug)?.name || locationSlug}
                    {lgaParam && ` - ${lgaParam}`}
                    <button onClick={() => { setSelectedLocationSlug(''); setSelectedLGA(''); handleSearch(); }} className="hover:text-primary-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Ads Grid/List */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : ads.length > 0 ? (
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6' 
                  : 'flex flex-col gap-4'}
              `}>
                {ads.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>
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

            {/* Pagination */}
            {meta?.last_page > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        params.set('page', pageNum.toString());
                        window.history.pushState({}, '', `?${params.toString()}`);
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        pageNum === page 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    }>
      <AdsPageContent />
    </Suspense>
  );
}