'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MapPin, Image as ImageIcon } from 'lucide-react';
import PremiumBadge from '@/components/ui/PremiumBadge';
import { getBoostCardClasses, BoostType } from '@/lib/boost-config';
import { formatPrice, formatRelativeTime, FALLBACK_IMAGE, getAdMainImage } from '@/lib/utils';
import Image from 'next/image';
import { useBoostedAds } from '@/hooks/useAds';
import { useAdRanking } from '@/hooks/useAdRanking';

interface BoostedAd {
  id: number | string;
  title: string;
  slug: string;
  price: number;
  currency?: string;
  condition?: string;
  state?: string;
  lga?: string;
  location?: any;
  images?: any[];
  image?: any;
  main_image?: any;
  short_description?: string;
  description?: string;
  excerpt?: string;
  summary?: string;
  negotiable?: boolean;
  image_url?: string;
  is_boosted?: boolean;
  boost_status?: string | null;
  boost_type?: BoostType | string | null;
  boost_expires_at?: string | null;
  created_at?: string;
}

function getImageUrl(ad: BoostedAd): string {
  return getAdMainImage(ad);
}

function getLocationDisplay(ad: BoostedAd): string {
  const stateName = ad.state || (typeof ad.location === 'object' ? ad.location?.name : ad.location) || '';
  const lgaName = ad.lga || '';
  if (stateName && lgaName && stateName !== lgaName) {
    return `${lgaName}, ${stateName}`;
  }
  return stateName || lgaName || 'No location';
}

function AdCard({ ad }: { ad: BoostedAd }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = getImageUrl(ad);
  const imageCount = ad.images ? (Array.isArray(ad.images) ? ad.images.length : 0) : 0;
  const boostCardClasses = getBoostCardClasses(ad.boost_type);

  const handleAdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const targetSlug = (ad.slug && ad.slug !== 'undefined') ? ad.slug : `ad-${ad.id}`;
    window.location.href = `/ad/${targetSlug}`;
  };

  return (
    <div onClick={handleAdClick} className={`group min-w-[200px] sm:min-w-[220px] max-w-[240px] bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer flex-shrink-0 ${boostCardClasses}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={imgError ? FALLBACK_IMAGE : imageUrl}
          alt={ad.title}
          fill
          sizes="(max-width: 640px) 200px, 220px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgError(true)}
        />
        <PremiumBadge boostType={ad.boost_type} size="sm" />
        {imageCount > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            {imageCount}
          </div>
        )}
      </div>
      <div className="p-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm sm:text-base font-bold text-primary-600 leading-tight">
            {formatPrice(ad.price, ad.currency)}
          </p>
          {ad.negotiable && (
            <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">Negotiable</span>
          )}
        </div>
        <h3 className="font-medium text-gray-900 text-xs sm:text-sm leading-snug line-clamp-2 mt-0.5">
          {ad.title}
        </h3>
        <div className="flex items-center gap-1 mt-1.5 text-[10px] sm:text-xs text-gray-400">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{getLocationDisplay(ad)}</span>
          {ad.created_at && (
            <>
              <span className="text-gray-300">·</span>
              <span className="whitespace-nowrap">{formatRelativeTime(ad.created_at)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BoostedAdsCarousel() {
  const { boostedAds: rawBoostedAds, isLoading: loading } = useBoostedAds();
  const scrollRef = useRef<HTMLDivElement>(null);

  const boostedAds = useAdRanking(
    (rawBoostedAds as BoostedAd[]).filter((ad) => ad.is_boosted && ad.boost_type)
  ).slice(0, 20);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -600 : 600;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="py-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[220px] sm:min-w-[260px] bg-white rounded-lg overflow-hidden border border-gray-200 animate-pulse">
                <div className="aspect-[3/2] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (boostedAds.length === 0) return null;

  const groupedAds = boostedAds.reduce<Record<string, BoostedAd[]>>((acc, ad) => {
    const type = ad.boost_type || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(ad);
    return acc;
  }, {});

  return (
    <section className="py-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-nowrap items-center justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 whitespace-nowrap">
              Premium Ads
            </h2>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 text-xs font-semibold rounded-full">
              Featured
            </span>
          </div>
          <Link href="/ads" className="text-xs sm:text-sm text-primary-600 hover:underline font-medium whitespace-nowrap">
            View All
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-white shadow-md rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {boostedAds.map((ad) => (
              <AdCard key={`${ad.id}-${ad.boost_type}`} ad={ad} />
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-white shadow-md rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  );
}
