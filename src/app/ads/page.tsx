'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import OLXHeader from '@/components/home/OLXHeader';
import Footer from '@/components/layout/Footer';
import AdCard from '@/components/ui/AdCard';
import { Search, Filter, Grid, List, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { nigeriaLocations, NigeriaLocation } from '@/lib/nigeriaLocations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const fetcher = (url: string) => fetch(url).then(r => r.json()).catch(() => null);

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

export default function AdsPage() {
  const searchParams = useSearchParams();
  
  // URL params
  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const locationSlug = searchParams.get('location') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Local state
  const [localQuery, setLocalQuery] = useState(query);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
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
    { revalidateOnFocus: false, dedupingInterval: 300000, fallbackData: [] }
  );
  
  const categories: Category[] = categoriesData?.data || categoriesData || [];

  // Build query params
  const buildQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (localQuery) params.set('q', localQuery);
    if (selectedCategoryId) params.set('category', selectedCategoryId.toString());
    if (selectedLocationId) params.set('location', selectedLocationId.toString());
    if (priceMin) params.set('price_min', priceMin);
    if (priceMax) params.set('price_max', priceMax);
    if (condition) params.set('condition', condition);
    params.set('sort', sortBy);
    params.set('page', page.toString());
    return params.toString();
  }, [localQuery, selectedCategoryId, selectedLocationId, priceMin, priceMax, condition, sortBy, page]);

  const { data: adsData, isLoading, error } = useSWR(
    `${API_URL}/ads?${buildQueryParams}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000, fallbackData: { data: [], meta: {} } }
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

  // Find location by slug
  useEffect(() => {
    if (locationSlug) {
      const loc = nigeriaLocations.find(l => l.slug === locationSlug);
      if (loc) setSelectedLocationId(loc.id.charCodeAt(0));
    }
  }, [locationSlug]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (localQuery) params.set('q', localQuery);
    if (selectedCategoryId) {
      const cat = categories.find(c => c.id === selectedCategoryId);
      if (cat) params.set('category', cat.slug);
    }
    if (selectedLocationId) {
      const loc = nigeriaLocations.find(l => l.id.charCodeAt(0) === selectedLocationId);
      if (loc) params.set('location', loc.slug);
    }
    window.history.pushState({}, '', `/ads?${params.toString()}`);
  };

  const clearFilters = () => {
    setLocalQuery('');
    setSelectedCategoryId(null);
    setSelectedLocationId(null);
    setPriceMin('');
    setPriceMax('');
    setCondition('');
    setSortBy('newest');
    window.history.pushState({}, '', '/ads');
  };

  const mainCategories = categories.filter((c: any) => !c.parent_id);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <OLXHeader />
      
      <main className="flex-1 container-app py-8">
        {/* Search Header */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
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

        <div className="flex flex-col lg:flex-row gap-6">
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
                value={selectedLocationId || ''}
                onChange={(e) => setSelectedLocationId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <option value="">All Nigeria</option>
                {nigeriaLocations.map((state) => (
                  <option key={state.id} value={state.id.charCodeAt(0)}>
                    {state.name}
                  </option>
                ))}
              </select>
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
            <div className="flex items-center justify-between mb-6">
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

            {/* Ads Grid/List */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : ads.length > 0 ? (
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
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