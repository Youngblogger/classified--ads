'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import axios from 'axios';
import { formatPrice } from '@/lib/utils';

const BASE_URL = 'http://127.0.0.1:8000';

interface Ad {
  id: number;
  title: string;
  slug: string;
  price: string;
  currency: string;
  condition: string;
  description?: string;
  short_description?: string;
  images: { url?: string; display_url?: string; thumbnail_url?: string; is_primary: boolean; full_url?: string; full_thumbnail_url?: string }[];
  location: { name: string };
  created_at: string;
}

interface RelatedAdsProps {
  currentAdId: number;
  categoryId?: number;
}

export default function RelatedAds({ currentAdId, categoryId }: RelatedAdsProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const API_URL = 'http://127.0.0.1:8000/api';

  const fetchAds = useCallback(async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        per_page: '10',
        exclude: currentAdId.toString(),
      });
      if (categoryId) params.append('category_id', categoryId.toString());

      const response = await axios.get(`${API_URL}/ads?${params}`);

      const newAds = response.data.data || response.data;
      
      if (isInitial) {
        setAds(newAds);
      } else {
        setAds((prev) => [...prev, ...newAds]);
      }

      setHasMore(newAds.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching related ads:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentAdId, categoryId]);

  useEffect(() => {
    fetchAds(1, true);
  }, [fetchAds]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchAds(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, page, fetchAds]);

  const getPrimaryImage = (images: Ad['images']) => {
    const primary = images?.find((img) => img.is_primary);
    const img = primary || images?.[0];
    const url = img?.full_url || img?.full_thumbnail_url || img?.display_url || img?.thumbnail_url || img?.url || '/placeholder.jpg';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/storage/')) {
      return `${BASE_URL}${url}`;
    }
    return `${BASE_URL}/storage/${url}`;
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
      </div>
    );
  }

  if (ads.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="text-lg font-bold text-dark mb-4">Similar Ads</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {ads.map((ad) => (
          <Link
            key={ad.id}
            href={`/ad/${ad.slug}`}
            className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative aspect-[4/3] bg-gray-100">
              <img
                src={getPrimaryImage(ad.images)}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
              <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-md ${
                ad.condition === 'new' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {ad.condition === 'new' ? 'New' : 'Used'}
              </span>
            </div>
            <div className="p-3">
              <h4 className="font-medium text-dark text-sm line-clamp-2 group-hover:text-primary-600 transition-colors">
                {ad.title}
              </h4>
              <p className="text-lg font-bold text-primary-600 mt-1">
                {formatPrice(ad.price, ad.currency)}
              </p>
              {(ad.description || ad.short_description) && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {ad.short_description || ad.description}
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{ad.location?.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="mt-6 text-center">
          {loadingMore && (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
