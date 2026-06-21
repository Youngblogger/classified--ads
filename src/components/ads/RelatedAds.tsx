'use client';

import Link from 'next/link';
import { MapPin, AlertCircle } from 'lucide-react';
import { formatPrice, getAdMainImage } from '@/lib/utils';
import PremiumBadge from '@/components/ui/PremiumBadge';
import { getBoostCardClasses } from '@/lib/boost-config';
import { useSimilarAds } from '@/hooks/useAds';
import MasonryGrid from '@/components/ui/MasonryGrid';
import { SafeImage } from '@/components/ui/SafeImage';
import { EmptyState } from '@/components/ui/EmptyState';

interface RelatedAdsProps {
  currentAdId: string | number;
  categoryId?: number;
  subcategoryId?: number;
  locationId?: number;
}

export default function RelatedAds({ currentAdId }: RelatedAdsProps) {
  const { similarAds, isLoading, isError } = useSimilarAds(currentAdId);

  const ads = similarAds.filter((ad: any) => String(ad.id) !== String(currentAdId));

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6">
        <h3 className="text-base sm:text-lg font-bold text-dark mb-3 sm:mb-4">Similar Ads</h3>
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-2">
            <div className="animate-pulse bg-white rounded-[7px] overflow-hidden border border-gray-100">
              <div className="w-full h-44 bg-gray-200"></div>
              <div className="p-2.5 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="animate-pulse bg-white rounded-[7px] overflow-hidden border border-gray-100">
              <div className="w-full h-52 bg-gray-200"></div>
              <div className="p-2.5 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex-col gap-2 hidden sm:flex">
            <div className="animate-pulse bg-white rounded-[7px] overflow-hidden border border-gray-100">
              <div className="w-full h-36 bg-gray-200"></div>
              <div className="p-2.5 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="animate-pulse bg-white rounded-[7px] overflow-hidden border border-gray-100">
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-2.5 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex-col gap-2 hidden lg:flex">
            <div className="animate-pulse bg-white rounded-[7px] overflow-hidden border border-gray-100">
              <div className="w-full h-44 bg-gray-200"></div>
              <div className="p-2.5 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
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
        <EmptyState icon="search" title="No similar ads found" description="Check back later for related listings" className="py-8" />
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
                className={`flex flex-col bg-white rounded-[7px] overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 group ${boostCardCls}`}
              >
                <div className="relative w-full overflow-hidden bg-gray-100 rounded-t-[7px] leading-[0] max-h-[340px]">
                  <SafeImage
                    src={imgUrl || fallbackImage}
                    alt={ad.title}
                    className="w-full block transition-all duration-300 group-hover:scale-[1.02]"
                    containerClassName="w-full"
                    objectFit="cover"
                  />
                  <div className="absolute top-1.5 left-1.5 z-10">
                    <PremiumBadge boostType={ad.boost_type} badgeIcon={(ad as any).badge_icon} size="sm" />
                  </div>
                </div>
                <div className="flex-1 p-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-0.5 mb-0.5">
                    <p className="text-sm font-bold text-primary-600 leading-tight">
                      {formatPrice(ad.price, ad.currency)}
                    </p>
                    {ad.negotiable && (
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.5 rounded-[4px] whitespace-nowrap">Negotiable</span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 text-xs leading-snug truncate">
                    {ad.title}
                  </h4>
                  {ad.short_description && (
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{ad.short_description}</p>
                  )}
                  {!ad.boost_type && (
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-400">
                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="truncate">{ad.state && ad.lga ? `${ad.state}, ${ad.lga}` : ''}</span>
                  </div>
                  )}
                </div>
              </Link>
            );
          })}
        </MasonryGrid>
      )}
    </div>
  );
}
