'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, AlertCircle } from 'lucide-react';
import { formatPrice, formatRelativeTime, getAdMainImage, FALLBACK_IMAGE } from '@/lib/utils';
import PremiumBadge from '@/components/ui/PremiumBadge';
import { getBoostCardClasses } from '@/lib/boost-config';
import { useSimilarAds } from '@/hooks/useAds';

interface RelatedAdsProps {
  currentAdId: number;
  categoryId?: number;
  subcategoryId?: number;
  locationId?: number;
}

export default function RelatedAds({ currentAdId }: RelatedAdsProps) {
  const { similarAds, isLoading, isError } = useSimilarAds(currentAdId);

  const ads = similarAds.filter((ad: any) => ad.id !== currentAdId);

  if (isLoading) {
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

      {isError && (
        <div className="flex items-center gap-2 text-red-500 text-xs sm:text-sm mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 rounded-lg">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Failed to load similar ads</span>
        </div>
      )}

      {ads.length === 0 && !isLoading ? (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <p className="text-sm">No similar ads found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {ads.map((ad: any) => {
            const boostCardCls = getBoostCardClasses(ad.boost_type);
            const imgUrl = getAdMainImage(ad);
            const fallbackImage = FALLBACK_IMAGE;

            return (
              <Link
                key={ad.id}
                href={`/ad/${(ad.slug && ad.slug !== 'undefined') ? ad.slug : `ad-${ad.id}`}`}
                className={`group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 ${boostCardCls}`}
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  <Image
                    src={imgUrl || fallbackImage}
                    alt={ad.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { if (imgUrl) (e.target as HTMLImageElement).src = fallbackImage; }}
                  />
                  <PremiumBadge boostType={ad.boost_type} badgeIcon={(ad as any).badge_icon} size="sm" />
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
                  <h4 className="font-medium text-gray-900 text-xs sm:text-sm leading-snug line-clamp-2 mt-0.5">
                    {ad.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-xs text-gray-400">
                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="truncate">{ad.location?.name || ad.state || ad.lga || 'N/A'}</span>
                    {ad.created_at && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="whitespace-nowrap">{formatRelativeTime(ad.created_at)}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
