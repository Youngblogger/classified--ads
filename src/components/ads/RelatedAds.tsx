'use client';

import Link from 'next/link';
import { MapPin, AlertCircle } from 'lucide-react';
import { formatPrice, getAdMainImage } from '@/lib/utils';
import PremiumBadge from '@/components/ui/PremiumBadge';
import { getBoostCardClasses } from '@/lib/boost-config';
import { useSimilarAds } from '@/hooks/useAds';
import MasonryGrid from '@/components/ui/MasonryGrid';

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
        <div className="columns-2 sm:columns-3 md:columns-4 gap-3 [&>*]:mb-3">
          {[...Array(4)].map((_, i) => {
            const heights = ['h-44', 'h-52', 'h-36', 'h-48'];
            return (
              <div key={i} className="animate-pulse break-inside-avoid bg-white rounded-t-[5px] overflow-hidden border border-gray-100">
                <div className={`w-full ${heights[i % heights.length]} bg-gray-200`}></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            );
          })}
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
        <MasonryGrid>
          {ads.map((ad: any) => {
            const boostCardCls = getBoostCardClasses(ad.boost_type);
            const imgUrl = getAdMainImage(ad);
            const fallbackImage = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image';

            return (
              <Link
                key={ad.id}
                href={`/ad/${(ad.slug && ad.slug !== 'undefined') ? ad.slug : `ad-${ad.id}`}`}
                className={`block bg-white rounded-t-[5px] overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 break-inside-avoid group ${boostCardCls}`}
              >
                <div className="relative max-h-[200px] md:max-h-[280px] overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={imgUrl || fallbackImage}
                    alt={ad.title}
                    className="w-full h-auto block flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => { if (imgUrl) (e.target as HTMLImageElement).src = fallbackImage; }}
                  />
                  <div className="absolute top-2 left-2 z-10">
                    <PremiumBadge boostType={ad.boost_type} badgeIcon={(ad as any).badge_icon} size="sm" />
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between flex-wrap mb-1">
                    <p className="text-sm font-bold text-primary-600 leading-tight">
                      {formatPrice(ad.price, ad.currency)}
                    </p>
                    {ad.negotiable && (
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.5 rounded-[4px] whitespace-nowrap">Negotiable</span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">
                    {ad.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{ad.location?.name || ad.state || ad.lga || 'N/A'}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </MasonryGrid>
      )}
    </div>
  );
}
