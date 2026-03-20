'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Eye } from 'lucide-react';
import { Ad } from '@/types';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getImageUrl(img: any): string {
  let url = img.url || img.display_url || img.original_url || img.thumbnail_url || img.thumbnail || '';
  if (url.startsWith('/storage/')) {
    url = `/storage/${url.replace('/storage/', '')}`;
  } else if (url.startsWith(API_URL + '/storage/')) {
    url = `/storage/${url.replace(API_URL + '/storage/', '')}`;
  } else if (url.startsWith('http://localhost:8000/storage/')) {
    url = `/storage/${url.replace('http://localhost:8000/storage/', '')}`;
  }
  return url;
}

interface AdCardProps {
  ad: Ad;
  variant?: 'default' | 'compact' | 'horizontal';
  priority?: boolean;
}

export default function AdCard({ ad, variant = 'default', priority = false }: AdCardProps) {
  
  const primaryImage = ad.images.find(img => img.is_primary) || ad.images[0];

  if (variant === 'horizontal') {
    return (
      <Link href={`/ad/${ad.slug}`} className="card card-hover flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
          {primaryImage ? (
            <Image
              src={getImageUrl(primaryImage)}
              alt={ad.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
              className="object-cover"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
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
            <span>{ad.location.name}</span>
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
        <div className="relative aspect-square">
          {primaryImage ? (
            <Image
              src={getImageUrl(primaryImage)}
              alt={ad.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
              className="object-cover"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
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
            <span className="truncate">{ad.location.name}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/ad/${ad.slug}`} className="card card-hover group">
      <div className="relative aspect-[4/3] overflow-hidden">
        {primaryImage ? (
          <Image
            src={getImageUrl(primaryImage)}
            alt={ad.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
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
          <span className="truncate">{ad.location.name}</span>
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
