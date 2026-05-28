'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Ad } from '@/types';
import { formatPrice, FALLBACK_IMAGE, getAdMainImage, getAdMainImageWithCacheBust } from '@/lib/utils';
import { useState, memo, useCallback } from 'react';
import PremiumBadge from './PremiumBadge';
import PromotedBadge from './PromotedBadge';
import VerifiedSellerBadge from '@/components/verification/VerifiedSellerBadge';
import { getBoostCardClasses } from '@/lib/boost-config';

interface AdCardProps {
  ad: Ad;
  variant?: 'default' | 'compact' | 'horizontal';
  priority?: boolean;
}

function AdCardComponent({ ad, variant = 'default', priority = false }: AdCardProps) {
  const [imgError, setImgError] = useState(false);

  const imageUrl = getAdMainImage(ad);
  
  const getSlug = useCallback(() => {
    return (ad.slug && ad.slug !== 'undefined') ? ad.slug : `ad-${ad.id}`;
  }, [ad.slug, ad.id]);

  const handleImageError = useCallback(() => {
    setImgError(true);
  }, []);

  const showFallback = !imageUrl || imgError;
  const boostType = (ad as any).boost_type;
  const cardBoostClasses = getBoostCardClasses(boostType);
  const imageSrc = showFallback ? FALLBACK_IMAGE : getAdMainImageWithCacheBust(ad);
  const adImageKey = `ad-img-${ad.id}-${imgError ? 'fallback' : 'original'}`;

  const getLocationDisplay = () => {
    const stateName = ad.state || (typeof ad.location === 'object' ? ad.location?.name : ad.location) || '';
    const lgaName = ad.lga || '';
    if (stateName && lgaName && stateName !== lgaName) return `${lgaName}, ${stateName}`;
    return stateName || lgaName || 'No location';
  };

  if (variant === 'horizontal') {
    return (
      <Link href={`/ad/${getSlug()}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex overflow-hidden block">
        <div className="relative w-28 sm:w-48 h-28 sm:h-36 flex-shrink-0 bg-gray-100">
          <Image
            key={adImageKey}
            src={imageSrc}
            alt={ad.title}
            fill
            sizes="(max-width: 768px) 112px, 192px"
            className="object-cover"
            onError={handleImageError}
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
          />
          <PremiumBadge boostType={boostType} badgeIcon={(ad as any).badge_icon} size="sm" />
          {(ad as any).user?.is_verified && (
            <div className="absolute top-1 right-1">
              <VerifiedSellerBadge size="sm" />
            </div>
          )}
        </div>
        <div className="flex-1 p-2 sm:p-3 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap w-full justify-between">
            <p className="text-sm sm:text-base font-bold text-primary-600 leading-tight">
              {formatPrice(ad.price, ad.currency)}
            </p>
            {ad.negotiable && (
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-[7px] whitespace-nowrap">Negotiable</span>
            )}
          </div>
          <h3 className="font-medium text-gray-900 text-xs sm:text-sm leading-snug line-clamp-1 mt-0.5">{ad.title}</h3>
          <div className="flex items-center gap-1 mt-1.5 text-[10px] sm:text-xs text-gray-400">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{getLocationDisplay()}</span>
            {boostType && <PromotedBadge boostType={boostType} badgeIcon={(ad as any).badge_icon} className="ml-auto" />}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/ad/${getSlug()}`} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow block ${cardBoostClasses}`}>
        <div className="relative aspect-square bg-gray-100">
          <Image
            key={adImageKey}
            src={imageSrc}
            alt={ad.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover"
            onError={handleImageError}
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
          />
          <PremiumBadge boostType={boostType} badgeIcon={(ad as any).badge_icon} size="sm" />
            {(ad as any).user?.is_verified && (
              <div className="absolute top-1 right-1">
                <VerifiedSellerBadge size="sm" />
              </div>
            )}
        </div>
        <div className="p-2">
          <div className="flex items-center gap-1.5 flex-wrap w-full justify-between">
            <p className="text-xs sm:text-sm font-bold text-primary-600 leading-tight">
              {formatPrice(ad.price, ad.currency)}
            </p>
            {ad.negotiable && (
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.5 rounded-[7px] whitespace-nowrap">Negotiable</span>
            )}
          </div>
          <h3 className="font-medium text-gray-900 text-xs leading-snug line-clamp-1 mt-0.5">{ad.title}</h3>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{getLocationDisplay()}</span>
            {boostType && <PromotedBadge boostType={boostType} badgeIcon={(ad as any).badge_icon} className="ml-auto" />}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/ad/${getSlug()}`} className={`bg-white rounded-xl overflow-hidden border border-gray-200/70 hover:border-gray-300 hover:shadow-lg transition-all duration-200 group block ${cardBoostClasses}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          key={adImageKey}
          src={imageSrc}
          alt={ad.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
        />
        <PremiumBadge boostType={boostType} badgeIcon={(ad as any).badge_icon} size="sm" />
          {(ad as any).user?.is_verified && (
            <div className="absolute top-1 right-1">
              <VerifiedSellerBadge size="sm" />
            </div>
          )}
      </div>
      <div className="p-2">
        <div className="flex items-center gap-1.5 flex-wrap w-full justify-between">
          <p className="text-sm sm:text-base font-bold text-primary-600 leading-tight">
            {formatPrice(ad.price, ad.currency)}
          </p>
          {ad.negotiable && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-[7px] whitespace-nowrap">Negotiable</span>
          )}
        </div>
        <h3 className="font-medium text-gray-900 text-xs sm:text-sm leading-snug line-clamp-1 mt-0.5">
          {ad.title}
        </h3>
        {(ad as any).short_description && (
          <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
            {(ad as any).short_description}
          </p>
        )}
        <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-gray-400">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{getLocationDisplay()}</span>
          {boostType && <PromotedBadge boostType={boostType} badgeIcon={(ad as any).badge_icon} className="ml-auto" />}
        </div>
      </div>
    </Link>
  );
}

const AdCard = memo(AdCardComponent, (prevProps, nextProps) => {
  return prevProps.ad.id === nextProps.ad.id && 
         prevProps.variant === nextProps.variant &&
         prevProps.priority === nextProps.priority;
});

AdCard.displayName = 'AdCard';

export default AdCard;