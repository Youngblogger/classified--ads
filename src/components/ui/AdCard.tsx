'use client';

import Link from 'next/link';
import { MapPin, Eye } from 'lucide-react';
import { Ad } from '@/types';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getImageUrl(img: any): string {
  if (!img) return '';
  
  let url = '';
  
  if (typeof img === 'string') {
    url = img;
  } else if (typeof img === 'object') {
    url = img.url || img.src || img.display_url || img.original_url || img.thumbnail_url || img.thumbnail || img.image || img.path || img.file || '';
  }
  
  if (!url) return '';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const baseUrl = API_URL.replace('/api', '');
  if (url.startsWith('/storage/')) {
    return `${baseUrl}${url}`;
  }
  
  return `${baseUrl}/storage/${url}`;
}

interface AdCardProps {
  ad: Ad;
  variant?: 'default' | 'compact' | 'horizontal';
  priority?: boolean;
}

export default function AdCard({ ad, variant = 'default' }: AdCardProps) {
  const [imgError, setImgError] = useState(false);
  
  // Ensure images is always an array
  const imagesArray = Array.isArray(ad.images) ? ad.images : [];
  // Find primary image or use first available
  let primaryImage = imagesArray.find(img => img?.is_primary);
  if (!primaryImage && imagesArray.length > 0) {
    primaryImage = imagesArray[0];
  }
  const imageUrl = primaryImage ? getImageUrl(primaryImage) : '';

  if (variant === 'horizontal') {
    return (
      <Link href={`/ad/${ad.slug}`} className="card card-hover flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-gray-100">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-4xl">📷</span>
            </div>
          )}
          {ad.condition === 'new' && (
            <span className="absolute top-2 left-2 badge-success">New</span>
          )}
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-dark line-clamp-1">{ad.title}</h3>
              <p className="text-xl font-bold text-primary-600 mt-1">
                {formatPrice(ad.price, ad.currency)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{ad.location?.name || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>{formatRelativeTime(ad.created_at)}</span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {ad.views}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/ad/${ad.slug}`} className="card card-hover">
        <div className="relative aspect-square bg-gray-100">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-3xl">📷</span>
            </div>
          )}
          {ad.condition === 'new' && (
            <span className="absolute bottom-2 left-2 badge-success text-xs">New</span>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-dark text-sm line-clamp-1">{ad.title}</h3>
          <p className="text-primary-600 font-bold mt-1">
            {formatPrice(ad.price, ad.currency)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{ad.location?.name || 'N/A'}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/ad/${ad.slug}`} className="card card-hover group">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-5xl">📷</span>
          </div>
        )}
        {ad.condition === 'new' && (
          <span className="absolute top-3 left-3 badge-success">New</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-dark line-clamp-2 group-hover:text-primary-600 transition-colors">
          {ad.title}
        </h3>
        {ad.description && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
            {ad.description}
          </p>
        )}
        <p className="text-xl font-bold text-primary-600 mt-2">
          {formatPrice(ad.price, ad.currency)}
        </p>
        <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{ad.location?.name || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
          <span>{formatRelativeTime(ad.created_at)}</span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {ad.views}
          </span>
        </div>
      </div>
    </Link>
  );
}
