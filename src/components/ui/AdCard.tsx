import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Ad } from '@/types';
import { formatPrice, getAdMainImage } from '@/lib/utils';
import { memo } from 'react';
import { SafeImage } from './SafeImage';
import PremiumBadge from './PremiumBadge';
import PromotedBadge from './PromotedBadge';
import VerifiedSellerBadge from '@/components/verification/VerifiedSellerBadge';
import { getBoostCardClasses } from '@/lib/boost-config';

interface AdCardProps {
  ad: Ad;
  priority?: boolean;
}

function AdCardComponent({ ad, priority = false }: AdCardProps) {
  const fallbackImage = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image';

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

  const getLocationDisplay = () => {
    const stateName = ad.state || (typeof ad.location === 'object' ? ad.location?.name : ad.location) || '';
    if (stateName && ad.lga) return `${stateName}, ${ad.lga}`;
    return '';
  };

  const description = (ad as any).short_description || (ad.description ? ad.description.substring(0, 120) : '');

  return (
    <Link
      href={safeHref}
      className={`flex flex-col bg-white rounded-[7px] overflow-hidden border border-gray-200/70 hover:border-gray-300 hover:shadow-lg transition-all duration-200 group ${cardBoostClasses}`}
    >
      <div className="relative w-full overflow-hidden bg-gray-100 rounded-t-[7px] leading-[0] max-h-[340px]">
        <SafeImage
          src={imageUrl || fallbackImage}
          alt={safeTitle}
          className="w-full block transition-all duration-300 group-hover:scale-[1.02]"
          containerClassName="w-full"
          loading={priority ? 'eager' : 'lazy'}
          objectFit="cover"
        />
        <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1">
          {boostType && <PremiumBadge boostType={boostType} badgeIcon={(ad as any).badge_icon} size="sm" />}
        </div>
        {(ad as any).user?.is_verified && (
          <div className="absolute top-1.5 right-1.5 z-10">
            <VerifiedSellerBadge size="sm" />
          </div>
        )}
      </div>
      <div className="flex-1 p-1.5">
        <div className="flex items-center justify-between flex-wrap gap-0.5 mb-0.5">
          <p className="text-sm font-bold text-primary-600 leading-tight">
            {formatPrice(ad.price, ad.currency)}
          </p>
          {ad.negotiable && (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.5 rounded-[4px] whitespace-nowrap">
              Negotiable
            </span>
          )}
        </div>
        <h3 className="font-medium text-gray-900 text-xs leading-snug truncate">
          {safeTitle}
        </h3>
        {description && (
          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-1 mt-0.5">
            {description}
          </p>
        )}
        {boostType ? (
          <div className="flex items-center justify-end mt-0.5">
            <PromotedBadge boostType={boostType} badgeIcon={(ad as any).badge_icon} />
          </div>
        ) : (
          getLocationDisplay() && (
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-400">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{getLocationDisplay()}</span>
            </div>
          )
        )}
      </div>
    </Link>
  );
}

const AdCard = memo(AdCardComponent, (prevProps, nextProps) => {
  if (!prevProps.ad || !nextProps.ad) return false;
  const pa = prevProps.ad as any;
  const na = nextProps.ad as any;
  if (prevProps.ad.id !== nextProps.ad.id) return false;
  if (prevProps.priority !== nextProps.priority) return false;
  if (pa.is_boosted !== na.is_boosted) return false;
  if (pa.boost_type !== na.boost_type) return false;
  if (pa.boost_status !== na.boost_status) return false;
  if (pa.boost_expires_at !== na.boost_expires_at) return false;
  if (pa.is_featured !== na.is_featured) return false;
  if (prevProps.ad.status !== nextProps.ad.status) return false;
  if (prevProps.ad.price !== nextProps.ad.price) return false;
  if (prevProps.ad.title !== nextProps.ad.title) return false;
  if (pa.image_url !== na.image_url) return false;
  return true;
});

AdCard.displayName = 'AdCard';

export default AdCard;
