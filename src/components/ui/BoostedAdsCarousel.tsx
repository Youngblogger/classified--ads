'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Image as ImageIcon, Bookmark } from 'lucide-react';
import PremiumBadge from '@/components/ui/PremiumBadge';
import { getBoostCardClasses, BoostType, sortAdsByBoostPriority } from '@/lib/boost-config';
import { formatPrice, FALLBACK_IMAGE, getAdImageUrl, getAdImage } from '@/lib/utils';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useBoostedAds } from '@/hooks/useAds';

import { API_URL } from '@/lib/config';

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
  is_boosted?: boolean;
  boost_type?: BoostType | string | null;
  created_at?: string;
}

function getImageUrl(ad: BoostedAd): string {
  if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
    return getAdImageUrl(ad.images[0]) || FALLBACK_IMAGE;
  }
  if (ad.image) {
    return getAdImageUrl(ad.image) || FALLBACK_IMAGE;
  }
  return getAdImage(ad) || FALLBACK_IMAGE;
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
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const imageUrl = getImageUrl(ad);
  const imageCount = ad.images ? (Array.isArray(ad.images) ? ad.images.length : 0) : 0;
  const boostCardClasses = getBoostCardClasses(ad.boost_type);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to save ads');
        return;
      }
      if (isFavorited) {
        await fetch(`${API_URL}/favorites/${ad.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
      } else {
        await fetch(`${API_URL}/favorites`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ ad_id: ad.id })
        });
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const getConditionBadge = () => {
    if (!ad.condition) return null;
    const condition = ad.condition.toLowerCase();
    const badgeClasses = condition === 'new' || condition === 'brand_new' || condition === 'brand new' ? 'bg-green-50 text-green-700' :
                        condition === 'like_new' || condition === 'like new' ? 'bg-blue-50 text-blue-700' :
                        condition === 'good' ? 'bg-amber-50 text-amber-700' :
                        condition === 'fair' ? 'bg-orange-50 text-orange-700' :
                        'bg-gray-50 text-gray-600';
    const label = condition === 'new' || condition === 'brand_new' || condition === 'brand new' ? 'Brand New' :
                  condition === 'like_new' || condition === 'like new' ? 'Like New' :
                  condition === 'good' ? 'Good' :
                  condition === 'fair' ? 'Fair' : condition.charAt(0).toUpperCase() + condition.slice(1);
    return <span className={`absolute top-1.5 sm:top-2 left-1.5 sm:left-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${badgeClasses}`}>{label}</span>;
  };

  const handleAdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const targetSlug = (ad.slug && ad.slug !== 'undefined') ? ad.slug : `ad-${ad.id}`;
    window.location.href = `/ad/${targetSlug}`;
  };

  return (
    <div onClick={handleAdClick} className={`group min-w-[220px] sm:min-w-[260px] md:min-w-[280px] max-w-[280px] bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer flex-shrink-0 ${boostCardClasses}`}>
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
        <Image
          src={imgError ? FALLBACK_IMAGE : imageUrl}
          alt={ad.title}
          fill
          sizes="(max-width: 640px) 220px, (max-width: 768px) 260px, 280px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgError(true)}
        />
        {getConditionBadge()}
        <PremiumBadge boostType={ad.boost_type} size="sm" />
        <button 
          onClick={toggleFavorite}
          disabled={favoriteLoading}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white hover:bg-gray-50 rounded-full shadow-md transition-all duration-200 disabled:opacity-50 z-20 border border-gray-200"
        >
          <Bookmark 
            className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors ${
              isFavorited ? 'text-primary-600 fill-primary-600' : 'text-gray-600 hover:text-primary-600'
            }`} 
          />
        </button>
        {imageCount > 1 && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-black/70 text-white text-[10px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded flex items-center gap-0.5 sm:gap-1">
            <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {imageCount}
          </div>
        )}
      </div>
      <div className="p-2 sm:p-3">
        <p className="text-lg sm:text-xl font-bold text-primary-600">
          {formatPrice(ad.price, ad.currency)}
        </p>
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors text-sm sm:text-base leading-snug mt-1">
          {ad.title}
        </h3>
        <div className="flex items-center gap-1 sm:gap-2 mt-2 text-gray-500 text-xs sm:text-sm">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{getLocationDisplay(ad)}</span>
        </div>
      </div>
    </div>
  );
}

export default function BoostedAdsCarousel() {
  const { boostedAds: rawBoostedAds, isLoading: loading } = useBoostedAds();
  const scrollRef = useRef<HTMLDivElement>(null);

  const boostedAds = sortAdsByBoostPriority(
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
