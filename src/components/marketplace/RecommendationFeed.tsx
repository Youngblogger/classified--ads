'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Sparkles, ChevronRight, ShoppingBag } from 'lucide-react';
import { useRecommendations } from '@/hooks/useAds';
import { getBoostPlan, isBoostExpired } from '@/lib/boost-config';
import { getAdMainImage } from '@/lib/image';

const fallbackImage = '/fallback-category.svg';

function formatPrice(price: number): string {
  const numPrice = typeof price === 'number' ? price : Number(price);
  if (isNaN(numPrice)) return '₦0';
  return '₦' + numPrice.toLocaleString('en-US');
}

function getBoostConfigForDisplay(ad: any) {
  const boostType = ad.boost_type || ad.boostType;
  if (!boostType) return null;
  const plan = getBoostPlan(boostType);
  if (!plan) return null;
  if (ad.boost_status !== 'active') return null;
  if (isBoostExpired(ad.boost_expires_at)) return null;
  return { type: boostType, plan };
}

function RecommendCard({ item }: { item: any }) {
  const imageUrl = getAdMainImage(item) || fallbackImage;
  const boostInfo = getBoostConfigForDisplay(item);
  const isFeatured = !!(item.is_featured || item.featured);

  const locationStr = item.state || (typeof item.location === 'object' ? item.location?.name : item.location) || '';
  const categoryStr = item.category_name || (typeof item.category === 'object' ? item.category?.name : item.category) || item.category_slug || '';

  return (
    <Link
      href={`/ad/${encodeURIComponent(item.slug || `ad-${item.id}`)}`}
      className="group flex-shrink-0 w-[180px] sm:w-[200px] snap-start bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={imageUrl}
          alt={item.title || 'Ad'}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="200px"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {boostInfo && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] font-bold rounded-full shadow-sm">
              <ShoppingBag className="w-2.5 h-2.5" />
              {boostInfo.plan?.name || 'Promoted'}
            </span>
          )}
          {isFeatured && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[9px] font-bold rounded-full shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
        </div>
        <div className="absolute bottom-2 right-2">
          <div className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-[5px] text-[10px] font-bold text-primary-600 shadow-sm">
            {formatPrice(item.price)}
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <h3 className="text-[11px] font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.2em]">
          {item.title || 'Ad listing'}
        </h3>
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400">
          <ShoppingBag className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{categoryStr || 'General'}</span>
          <span className="mx-1">·</span>
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{locationStr || 'Nigeria'}</span>
        </div>
      </div>
    </Link>
  );
}

export default function RecommendationFeed() {
  const { recommendations, isLoading } = useRecommendations(10);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  if (!isLoading && (!recommendations || recommendations.length === 0)) {
    return null;
  }

  return (
    <section className="w-full mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-50">
            <Sparkles className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Recommended for you</h2>
            <p className="text-[10px] text-gray-500">Based on popular listings</p>
          </div>
        </div>
        <Link
          href="/ads"
          className="flex items-center gap-0.5 text-[11px] font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#F5F7FA]/50 to-transparent z-10 pointer-events-none" />
        )}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={`skel-${i}`} className="flex-shrink-0 w-[180px] sm:w-[200px] bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-2.5 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : (
            recommendations.map((item: any) => (
              <RecommendCard key={`rec-${item.id}`} item={item} />
            ))
          )}
        </div>
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#F5F7FA]/50 to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </section>
  );
}
