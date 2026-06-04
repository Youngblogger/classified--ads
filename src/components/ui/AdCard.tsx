import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Ad } from '@/types';
import { formatPrice, formatRelativeTime, getAdMainImage } from '@/lib/utils';
import { useState, memo, useCallback } from 'react';
import PremiumBadge from './PremiumBadge';
import PromotedBadge from './PromotedBadge';
import VerifiedSellerBadge from '@/components/verification/VerifiedSellerBadge';
import { getBoostCardClasses } from '@/lib/boost-config';

interface AdCardProps {
  ad: Ad;
  priority?: boolean;
}

function AdCardComponent({ ad, priority = false }: AdCardProps) {
  const [imgError, setImgError] = useState(false);
  const fallbackImage = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image';

  const handleImageError = useCallback(() => {
    setImgError(true);
  }, []);

  if (!ad || typeof ad !== 'object') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AdCard] Received invalid ad object — skipping:', ad);
    }
    return null;
  }

  if (!ad.id) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AdCard] Ad missing `id` — skipping:', ad);
    }
    return null;
  }

  const imageUrl = getAdMainImage(ad);

  const safeTitle = ad.title || 'Ad listing';
  const safeId = ad.id;
  const safeSlug = ad.slug && ad.slug !== 'undefined' ? ad.slug : `ad-${safeId}`;
  const safeHref = `/ad/${encodeURIComponent(safeSlug)}`;

  const boostType = (ad as any)?.boost_type;
  const cardBoostClasses = getBoostCardClasses(boostType);
  const showFallback = !imageUrl || imgError;
  const imageSrc = showFallback ? fallbackImage : imageUrl;

  const getLocationDisplay = () => {
    const stateName = ad.state || (typeof ad.location === 'object' ? ad.location?.name : ad.location) || '';
    const lgaName = ad.lga || '';
    if (stateName && lgaName && stateName !== lgaName) return `${lgaName}, ${stateName}`;
    return stateName || lgaName || '';
  };

  const description = (ad as any).short_description || (ad.description ? ad.description.substring(0, 120) : '');

  return (
    <Link
      href={safeHref}
      className={`block bg-white rounded-xl overflow-hidden border border-gray-200/70 hover:border-gray-300 hover:shadow-lg transition-all duration-200 group break-inside-avoid ${cardBoostClasses}`}
    >
      <div className="relative max-h-[200px] md:max-h-[280px] overflow-hidden bg-gray-100 flex items-center justify-center">
        <img
          src={imageSrc}
          alt={safeTitle}
          className="w-full h-auto block flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-300"
          loading={priority ? 'eager' : 'lazy'}
          onError={handleImageError}
        />
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {boostType && <PremiumBadge boostType={boostType} badgeIcon={(ad as any).badge_icon} size="sm" />}
        </div>
        {(ad as any).user?.is_verified && (
          <div className="absolute top-2 right-2 z-10">
            <VerifiedSellerBadge size="sm" />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between flex-wrap mb-1">
          <p className="text-base font-bold text-primary-600 leading-tight">
            {formatPrice(ad.price, ad.currency)}
          </p>
          {ad.negotiable && (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              Negotiable
            </span>
          )}
        </div>
        <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">
          {safeTitle}
        </h3>
        {description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-1">
            {description}
          </p>
        )}
        {(getLocationDisplay() || ad.created_at) && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            {getLocationDisplay() && (
              <>
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{getLocationDisplay()}</span>
              </>
            )}
            {getLocationDisplay() && ad.created_at && (
              <span className="text-gray-300 mx-0.5">·</span>
            )}
            {ad.created_at && (
              <span className="whitespace-nowrap">{formatRelativeTime(ad.created_at)}</span>
            )}
          </div>
        )}
        {boostType && (
          <div className="mt-2">
            <PromotedBadge boostType={boostType} badgeIcon={(ad as any).badge_icon} />
          </div>
        )}
      </div>
    </Link>
  );
}

const AdCard = memo(AdCardComponent, (prevProps, nextProps) => {
  if (!prevProps.ad || !nextProps.ad) return false;
  return prevProps.ad.id === nextProps.ad.id && prevProps.priority === nextProps.priority;
});

AdCard.displayName = 'AdCard';

export default AdCard;
