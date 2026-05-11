'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { formatPrice, getAdImage, getAdImageUrl, getAdImages, FALLBACK_IMAGE, getCategoryFallback } from '@/lib/utils';
import PremiumBadge from '@/components/ui/PremiumBadge';
import { getBoostCardClasses, getBoostConfig } from '@/lib/boost-config';

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
  state?: string;
  lga?: string;
  created_at: string;
  category?: { name?: string; slug?: string } | string;
  is_boosted?: boolean;
  boost_status?: string | null;
  boost_type?: string | null;
}

interface RelatedAdsProps {
  currentAdId: number;
  categoryId?: number;
  subcategoryId?: number;
  locationId?: number;
  initialAds?: Ad[];
}

export default function RelatedAds({ currentAdId, categoryId, subcategoryId, locationId, initialAds }: RelatedAdsProps) {
  const [ads, setAds] = useState<Ad[]>(initialAds || []);
  const [loading, setLoading] = useState(!initialAds);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadedIdsRef = useRef<Set<number>>(new Set(initialAds?.map(ad => ad.id) || []));

  const API_URL = 'http://127.0.0.1:8000/api';
  const ITEMS_PER_PAGE = 8;

  const fetchAds = useCallback(async (pageNum: number, isInitial = false) => {
    try {
      setError(null);
      
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

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
        rootMargin: '50px',
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
    const isNew = condition === 'new' || condition === 'brand_new' || condition === 'brand new';
    const isLikeNew = condition === 'like_new' || condition === 'like new';
    const isGood = condition === 'good';
    const isFair = condition === 'fair';
    
    let badgeClass = 'bg-gray-50 text-gray-600';
    let label = condition.charAt(0).toUpperCase() + condition.slice(1);
    
    if (isNew) {
      badgeClass = 'bg-green-50 text-green-700';
      label = 'Brand New';
    } else if (isLikeNew) {
      badgeClass = 'bg-blue-50 text-blue-700';
      label = 'Like New';
    } else if (isGood) {
      badgeClass = 'bg-amber-50 text-amber-700';
      label = 'Used';
    } else if (isFair) {
      badgeClass = 'bg-purple-50 text-purple-700';
      label = 'Refurbished';
    }
    
    return (
      <span className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${badgeClass}`}>
        {label}
      </span>
    );
  };

  const getLocationDisplay = (ad: Ad) => {
    if (!ad.location?.name && !ad.state && !ad.lga) return 'N/A';
    
    const stateName = ad.state || ad.location?.name || '';
    const lgaName = ad.lga || '';
    
    if (stateName && lgaName) {
      return `${stateName}, ${lgaName}`;
    }
    return stateName || lgaName || 'N/A';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6">
        <h3 className="text-base sm:text-lg font-bold text-dark mb-3 sm:mb-4">Similar Ads</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 w-full overflow-hidden">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-bold text-dark">Similar Ads</h3>
        {ads.length > 0 && (
          <span className="text-xs sm:text-sm text-gray-500">{ads.length}+</span>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs sm:text-sm mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 rounded-lg">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
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
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <p className="text-sm">No similar ads found</p>
          <button 
            onClick={() => fetchAds(1, true)} 
            className="text-primary-600 hover:underline mt-2 text-sm"
          >
            Refresh
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {ads.map((ad) => {
              const boostCardCls = getBoostCardClasses(ad.boost_type);
              return (
              <Link
                key={ad.id}
                href={`/ad/${(ad.slug && ad.slug !== 'undefined') ? ad.slug : `ad-${ad.id}`}`}
                className={`group block bg-white rounded-lg sm:rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 ${boostCardCls}`}
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  {(() => {
                    const primaryImage = ad.images?.find(img => img?.is_primary) || ad.images?.[0];
                    const imageUrl = primaryImage ? getAdImageUrl(primaryImage) : '';
                    const fallbackImage = getCategoryFallback(ad.category);
                    
                    if (imageUrl) {
                      return (
                        <Image
                          src={imageUrl}
                          alt={ad.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackImage;
                          }}
                        />
                      );
                    }
                    return (
                      <Image
                        src={fallbackImage}
                        alt={ad.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        className="object-cover"
                        unoptimized
                      />
                    );
                  })()}
                  {getConditionBadge(ad.condition)}
                  <PremiumBadge boostType={ad.boost_type} size="sm" />
                </div>
                <div className="p-2 sm:p-3">
                  <h4 className="font-medium text-dark text-xs sm:text-sm line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {ad.title}
                  </h4>
                  <p className="text-sm sm:text-lg font-bold text-primary-600 mt-0.5 sm:mt-1">
                    {formatPrice(ad.price, ad.currency)}
                  </p>
                  <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                      <span className="truncate">{getLocationDisplay(ad)}</span>
                    </div>
                    {(ad.boost_status === 'active' || (ad as any).is_boosted) && (
                      <span className={`boost-plan-tag boost-plan-tag--${(getBoostConfig(ad.boost_type)?.displayName || 'Gold').toLowerCase()}`}>
                        {getBoostConfig(ad.boost_type)?.displayName || 'Gold'} Plan
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
            })}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="mt-4 sm:mt-6 text-center py-3 sm:py-4">
            {loadingMore && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span className="text-xs sm:text-sm">Loading more...</span>
              </div>
            )}
            {!hasMore && ads.length > 0 && (
              <p className="text-xs sm:text-sm text-gray-400">No more ads to show</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
