'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { formatPrice, getAdImageUrl } from '@/lib/utils';

interface AdImage {
  url?: string;
  display_url?: string;
  thumbnail_url?: string;
  original_url?: string;
  is_primary?: boolean;
  full_url?: string;
  full_thumbnail_url?: string;
}

interface Ad {
  id: number;
  title: string;
  slug: string;
  price: string | number;
  currency: string;
  condition: string;
  description?: string;
  short_description?: string;
  images: AdImage[];
  location?: { name: string } | null;
  lga?: string;
  created_at: string;
}

interface RelatedAdsProps {
  currentAdId: number;
  categoryId?: number;
  initialAds?: Ad[];
}

export default function RelatedAds({ currentAdId, categoryId, initialAds }: RelatedAdsProps) {
  const [ads, setAds] = useState<Ad[]>(initialAds || []);
  const [loading, setLoading] = useState(!initialAds);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadedIdsRef = useRef<Set<number>>(new Set(initialAds?.map(ad => ad.id) || []));

  const API_URL = 'http://127.0.0.1:8000/api';
  const ITEMS_PER_PAGE = 12;

  const fetchAds = useCallback(async (pageNum: number, isInitial = false) => {
    try {
      setError(null);
      
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setDebugInfo(`Fetching similar ads page ${pageNum}...`);

      const params = new URLSearchParams({
        ad_id: currentAdId.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        page: pageNum.toString(),
      });

      const response = await axios.get(`${API_URL}/ads/similar?${params}`, {
        timeout: 10000,
      });

      let newAds = response.data.data || response.data.ads || response.data || [];
      
      if (!Array.isArray(newAds)) {
        newAds = [];
      }

      setDebugInfo(`Got ${newAds.length} similar ads`);

      const uniqueAds = newAds.filter((ad: Ad) => {
        if (loadedIdsRef.current.has(ad.id)) {
          return false;
        }
        loadedIdsRef.current.add(ad.id);
        return true;
      });

      if (isInitial) {
        setAds(uniqueAds);
      } else {
        setAds((prev) => [...prev, ...uniqueAds]);
      }

      setHasMore(uniqueAds.length === ITEMS_PER_PAGE);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Error fetching similar ads:', err);
      setError(err.message || 'Failed to load ads');
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentAdId]);

  useEffect(() => {
    if (!initialAds) {
      fetchAds(1, true);
    }
  }, [initialAds, fetchAds]);

  useEffect(() => {
    if (loading || !hasMore) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchAds(page + 1);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loading, page, fetchAds]);

  const getConditionBadge = (condition: string) => {
    const isNew = condition === 'brand_new';
    const isLikeNew = condition === 'like_new';
    const isRefurbished = condition === 'refurbished';
    
    let badgeClass = 'bg-orange-100 text-orange-700';
    let label = 'Used';
    
    if (isNew) {
      badgeClass = 'bg-green-100 text-green-700';
      label = 'Brand New';
    } else if (isLikeNew) {
      badgeClass = 'bg-blue-100 text-blue-700';
      label = 'Like New';
    } else if (isRefurbished) {
      badgeClass = 'bg-purple-100 text-purple-700';
      label = 'Refurbished';
    }
    
    return (
      <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-md ${badgeClass}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <h3 className="text-lg font-bold text-dark mb-4">Similar Ads</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded-xl mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-1"></div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">Loading ads...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-dark">Similar Ads</h3>
        <span className="text-sm text-gray-500">{ads.length} ads</span>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button 
            onClick={() => fetchAds(1, true)} 
            className="ml-auto text-primary-600 hover:underline"
          >
            Retry
          </button>
        </div>
      )}
      
      {ads.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500">
          <p>No similar ads found</p>
          <button 
            onClick={() => fetchAds(1, true)} 
            className="text-primary-600 hover:underline mt-2"
          >
            Refresh
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {ads.map((ad) => (
              <Link
                key={ad.id}
                href={`/ad/${ad.slug}`}
                className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ minWidth: '280px' }}
              >
                <div className="relative aspect-[4/3] bg-gray-100 h-[180px]">
                  <img
                    src={getAdImageUrl(ad.images?.[0])}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'auto' }}
                    loading="eager"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg';
                    }}
                  />
                  {getConditionBadge(ad.condition)}
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-dark text-base line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {ad.title}
                  </h4>
                  <p className="text-xl font-bold text-primary-600 mt-2">
                    {formatPrice(ad.price, ad.currency)}
                  </p>
                  {(ad.description || ad.short_description) && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {ad.short_description || ad.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{ad.lga ? `${ad.location?.name}, ${ad.lga}` : ad.location?.name || 'N/A'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="mt-6 text-center py-4">
            {loadingMore && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading more ads...</span>
              </div>
            )}
            {!hasMore && ads.length > 0 && (
              <p className="text-sm text-gray-400">No more ads to show</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
