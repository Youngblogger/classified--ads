'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ImageIcon } from 'lucide-react';
import { Ad } from '@/types';
import { formatPrice, getAdImageUrl } from '@/lib/utils';
import { useState, memo } from 'react';

interface AdCardProps {
  ad: Ad;
  variant?: 'default' | 'compact' | 'horizontal';
  priority?: boolean;
}

function AdCardComponent({ ad, variant = 'default', priority = false }: AdCardProps) {
  const [imgError, setImgError] = useState(false);
  
  const imagesArray = Array.isArray(ad.images) ? ad.images : [];
  let primaryImage = imagesArray.find(img => img?.is_primary);
  if (!primaryImage && imagesArray.length > 0) {
    primaryImage = imagesArray[0];
  }
  const imageUrl = primaryImage ? getAdImageUrl(primaryImage) : '';

  const getLocationDisplay = () => {
    if (!ad.location?.name) return 'N/A';
    if (ad.lga) return `${ad.location.name}, ${ad.lga}`;
    return ad.location.name;
  };

  const getConditionBadge = () => {
    if (!ad.condition) return null;
    const badgeClasses = ad.condition === 'new' ? 'bg-green-50 text-green-700' :
                         ad.condition === 'like_new' ? 'bg-blue-50 text-blue-700' :
                         ad.condition === 'good' ? 'bg-gray-50 text-gray-600' :
                         'bg-amber-50 text-amber-700';
    const label = ad.condition === 'new' ? 'New' :
                  ad.condition === 'like_new' ? 'Like New' :
                  ad.condition === 'good' ? 'Good' : 'Fair';
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClasses}`}>{label}</span>;
  };

  const imageLoader = () => imageUrl;

  if (variant === 'horizontal') {
    return (
      <Link href={`/ad/${ad.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row overflow-hidden">
        <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-gray-100">
          {imageUrl && !imgError ? (
            <Image
              src={imageUrl}
              alt={ad.title}
              fill
              sizes="(max-width: 768px) 100vw, 192px"
              className="object-cover"
              onError={() => setImgError(true)}
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <ImageIcon className="w-10 h-10 text-gray-300" />
            </div>
          )}
          {getConditionBadge()}
        </div>
        <div className="flex-1 p-4">
          <p className="text-xl font-bold text-primary-600 mb-1">
            {formatPrice(ad.price, ad.currency)}
          </p>
          <h3 className="font-semibold text-dark line-clamp-1">{ad.title}</h3>
          {ad.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{ad.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{getLocationDisplay()}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/ad/${ad.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-gray-100">
          {imageUrl && !imgError ? (
            <Image
              src={imageUrl}
              alt={ad.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover"
              onError={() => setImgError(true)}
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <ImageIcon className="w-8 h-8 text-gray-300" />
            </div>
          )}
          {getConditionBadge()}
        </div>
        <div className="p-3">
          <p className="text-primary-600 font-bold mb-1">
            {formatPrice(ad.price, ad.currency)}
          </p>
          <h3 className="font-medium text-dark text-sm line-clamp-1">{ad.title}</h3>
          {(ad.short_description || ad.description) && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">
              {ad.short_description || ad.description}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{getLocationDisplay()}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/ad/${ad.slug}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group">
      <div className="relative h-auto min-h-[200px] overflow-hidden bg-gray-100">
        {imageUrl && !imgError ? (
          <Image
            src={imageUrl}
            alt={ad.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xl font-bold text-primary-600 mb-1">
          {formatPrice(ad.price, ad.currency)}
        </p>
        <h3 className="font-semibold text-dark line-clamp-2 group-hover:text-primary-600 transition-colors">
          {ad.title}
        </h3>
        {(ad.short_description || ad.description) && (
          <p className="text-gray-500 text-sm mt-2 line-clamp-2">
            {ad.short_description || ad.description}
          </p>
        )}
        <div className="flex items-center justify-between gap-2 mt-3 text-gray-500 text-sm flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{getLocationDisplay()}</span>
          </div>
          {getConditionBadge()}
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
