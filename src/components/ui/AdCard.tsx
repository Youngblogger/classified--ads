'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Zap, Crown, Diamond } from 'lucide-react';
import { Ad } from '@/types';
import { formatPrice, FALLBACK_IMAGE, getCategoryFallback } from '@/lib/utils';
import { useState, memo, useCallback } from 'react';
import PremiumBadge from './PremiumBadge';
import { getBoostConfig, getBoostCardClasses } from '@/lib/boost-config';

interface AdCardProps {
  ad: Ad;
  variant?: 'default' | 'compact' | 'horizontal';
  priority?: boolean;
}

function AdCardComponent({ ad, variant = 'default', priority = false }: AdCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  
  const getCategoryName = () => {
    if (!ad.category) return '';
    if (typeof ad.category === 'string') return ad.category;
    return ad.category.name || ad.category.slug || '';
  };
  
  const categoryName = getCategoryName();
  
  const getImageUrl = (): string => {
    const normalizeImage = (img: any): string => {
      let url = '';
      if (typeof img === 'string') {
        url = img;
      } else if (img && typeof img === 'object') {
        url = img.thumbnail_url || img.listing_url || img.thumbnail || img.full_thumbnail_url || img.display_url || img.url || img.full_url || img.original_url || '';
      }
      if (!url) return '';
      if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) return url;
      if (url.startsWith('json_dataset/')) return url.replace('json_dataset/', '/');
      return `/images/${url}`;
    };
    
    if (ad.main_image) {
      return normalizeImage(ad.main_image);
    }
    
    if (ad.slider_images && Array.isArray(ad.slider_images) && ad.slider_images.length > 0) {
      return normalizeImage(ad.slider_images[0]);
    }
    
    if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
      return normalizeImage(ad.images[0]);
    }
    
    return '';
  };
  
  const imageUrl = getImageUrl();
  
  const getSlug = useCallback(() => {
    return (ad.slug && ad.slug !== 'undefined') ? ad.slug : `ad-${ad.id}`;
  }, [ad.slug, ad.id]);
  
  const getFallbackImage = useCallback(() => {
    const categoryName = typeof ad.category === 'object' ? ad.category?.name || ad.category?.slug : ad.category;
    return getCategoryFallback(categoryName || '');
  }, [ad.category]);
  
  const handleImageError = useCallback(() => {
    if (retryCount < 2) {
      setImgSrc(getFallbackImage());
      setRetryCount(prev => prev + 1);
    } else {
      setImgError(true);
    }
  }, [retryCount, getFallbackImage]);
  
  const currentSrc = imgSrc || imageUrl;
  const showFallback = !currentSrc || imgError;

  const boostType = (ad as any).boost_type;
  const cardBoostClasses = getBoostCardClasses(boostType);

  const getLocationDisplay = () => {
    const stateName = ad.state || (typeof ad.location === 'object' ? ad.location?.name : ad.location) || '';
    const lgaName = ad.lga || '';
    
    if (stateName && lgaName && stateName !== lgaName) {
      return `${lgaName}, ${stateName}`;
    }
    return stateName || lgaName || 'No location';
  };

  const getConditionBadge = (positionClasses = '') => {
    if (!ad.condition) return null;
    const condition = String(ad.condition).toLowerCase();
    const badgeClasses = condition === 'new' || condition === 'brand_new' || condition === 'brand new' ? 'bg-green-50 text-green-700' :
                         condition === 'like_new' || condition === 'like new' ? 'bg-blue-50 text-blue-700' :
                         condition === 'good' ? 'bg-amber-50 text-amber-700' :
                         condition === 'fair' ? 'bg-purple-50 text-purple-700' :
                         'bg-gray-50 text-gray-600';
    const label = condition === 'new' || condition === 'brand_new' || condition === 'brand new' ? 'Brand New' :
                 condition === 'like_new' || condition === 'like new' ? 'Like New' :
                 condition === 'good' ? 'Used' :
                 condition === 'fair' ? 'Refurbished' : condition.charAt(0).toUpperCase() + condition.slice(1);
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClasses} ${positionClasses}`}>{label}</span>;
  };

  if (variant === 'horizontal') {
    return (
      <Link href={`/ad/${getSlug()}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row overflow-hidden block">
        <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-gray-100">
          {showFallback ? (
            <Image
              src={getFallbackImage()}
              alt="No image"
              fill
              sizes="(max-width: 768px) 100vw, 192px"
              className="object-cover"
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
            />
          ) : (
            <Image
              src={currentSrc}
              alt={ad.title}
              fill
              sizes="(max-width: 768px) 100vw, 192px"
              className="object-cover"
              onError={handleImageError}
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
            />
          )}
          {getConditionBadge('absolute top-2 right-2')}
          <PremiumBadge boostType={(ad as any).boost_type} size="sm" />
        </div>
        <div className="flex-1 p-4">
          {categoryName && (
            <span className="text-xs text-primary-600 font-medium">{categoryName}</span>
          )}
          <p className="text-xl font-bold text-primary-600 mb-1">
            {formatPrice(ad.price, ad.currency)}
          </p>
          <h3 className="font-semibold text-dark line-clamp-1">{ad.title}</h3>
          {((ad as any).short_description || ad.description) && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{(ad as any).short_description || ad.description}</p>
          )}
          <div className="flex items-center justify-between gap-2 mt-2 text-gray-500 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{getLocationDisplay()}</span>
            </div>
            {((ad as any).boost_status === 'active' || (ad as any).is_boosted) && (
              <span className={`boost-plan-tag boost-plan-tag--${(getBoostConfig((ad as any).boost_type)?.displayName || 'Gold').toLowerCase()}`}>
                {getBoostConfig((ad as any).boost_type)?.displayName || 'Gold'} Plan
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/ad/${getSlug()}`} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow block ${cardBoostClasses}`}>
        <div className="relative aspect-square bg-gray-100">
          {showFallback ? (
            <Image
              src={getFallbackImage()}
              alt="No image"
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <Image
              src={currentSrc}
              alt={ad.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover"
              onError={handleImageError}
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
            />
          )}
          {getConditionBadge('absolute top-2 right-2')}
          <PremiumBadge boostType={(ad as any).boost_type} size="sm" />
        </div>
        <div className="p-3">
          <div className="flex items-center gap-1 mb-1 flex-wrap">
            {categoryName && (
              <span className="text-xs text-primary-600 font-medium">{categoryName}</span>
            )}
          </div>
          <p className="text-primary-600 font-bold mb-1">
            {formatPrice(ad.price, ad.currency)}
          </p>
          <h3 className="font-medium text-dark text-sm line-clamp-1">{ad.title}</h3>
          {((ad as any).short_description || ad.description || (ad as any).excerpt || (ad as any).summary) && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">
              {(ad as any).short_description || ad.description || (ad as any).excerpt || (ad as any).summary}
            </p>
          )}
          <div className="flex items-center justify-between gap-1 mt-2 text-gray-400 text-xs">
            <div className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{getLocationDisplay()}</span>
            </div>
            {((ad as any).boost_status === 'active' || (ad as any).is_boosted) && (
              <span className={`boost-plan-tag boost-plan-tag--${(getBoostConfig((ad as any).boost_type)?.displayName || 'Gold').toLowerCase()}`}>
                {getBoostConfig((ad as any).boost_type)?.displayName || 'Gold'} Plan
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/ad/${getSlug()}`} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group block ${cardBoostClasses}`}>
      <div className="relative h-auto min-h-[200px] overflow-hidden bg-gray-100">
        {showFallback ? (
          <Image
            src={getFallbackImage()}
            alt="No image"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <Image
            src={currentSrc}
            alt={ad.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
          />
        )}
        {getConditionBadge('absolute top-2 right-2')}
        <PremiumBadge boostType={(ad as any).boost_type} size="sm" />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          {categoryName && (
            <span className="text-xs text-primary-600 font-medium">{categoryName}</span>
          )}
          </div>
          <p className="text-xl font-bold text-primary-600 mb-1">
          {formatPrice(ad.price, ad.currency)}
        </p>
        <h3 className="font-semibold text-dark line-clamp-2 group-hover:text-primary-600 transition-colors">
          {ad.title}
        </h3>
        {((ad as any).short_description || ad.description || (ad as any).excerpt || (ad as any).summary) && (
          <p className="text-gray-500 text-sm mt-2 line-clamp-2">
            {(ad as any).short_description || ad.description || (ad as any).excerpt || (ad as any).summary}
          </p>
        )}
        <div className="flex items-center justify-between gap-2 mt-3 text-gray-500 text-sm flex-wrap">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{getLocationDisplay()}</span>
          </div>
          <div className="flex items-center gap-2">
            {((ad as any).boost_status === 'active' || (ad as any).is_boosted) && (
              <span className={`boost-plan-tag boost-plan-tag--${(getBoostConfig((ad as any).boost_type)?.displayName || 'Gold').toLowerCase()}`}>
                {getBoostConfig((ad as any).boost_type)?.displayName || 'Gold'} Plan
              </span>
            )}
            {getConditionBadge()}
          </div>
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