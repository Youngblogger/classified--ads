'use client';

import Link from 'next/link';
import { Eye, MousePointerClick, MessageCircle, Heart, Clock, RotateCcw, ChevronRight, AlertCircle } from 'lucide-react';
import { getBoostConfig } from '@/lib/boost-config';
import { getAdImageUrl } from '@/lib/utils';

interface AdImage {
  id?: number;
  url?: string;
  is_primary?: boolean;
}

interface BoostItem {
  boost_id: number;
  boost_type: 'top' | 'featured' | 'highlight';
  boost_status: string;
  boost_start_time: string;
  boost_end_time: string;
  ad: {
    id: number;
    title: string;
    slug: string;
    price: number;
    status: string;
    state?: string;
    lga?: string;
    images: AdImage[];
    category?: { id: number; name: string } | null;
  };
  views_count: number;
  clicks_count: number;
  whatsapp_clicks: number;
  saves_count: number;
  ctr: number;
}

interface ExpiredBoostListProps {
  items: BoostItem[];
  onBoostAgain: (adId: number, adTitle: string) => void;
}

const formatPrice = (price: number) =>
  `₦${price.toLocaleString('en-US')}`;

export default function ExpiredBoostList({ items, onBoostAgain }: ExpiredBoostListProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Expired Boosts</h2>
          <p className="text-sm text-gray-500">{items.length} boost{items.length > 1 ? 's' : ''} ended</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const boostConfig = getBoostConfig(item.boost_type);
          const primaryImage = item.ad.images?.find(img => img?.is_primary) || item.ad.images?.[0];
          const imageUrl = primaryImage ? getAdImageUrl(primaryImage) : null;

          return (
            <div
              key={item.boost_id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden opacity-90 hover:opacity-100 transition-opacity"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-36 h-32 sm:h-auto relative bg-gray-100 flex-shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.ad.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-gray-500/80 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Expired</span>
                  </div>
                </div>

                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-700 truncate">{item.ad.title}</h3>
                      <span className="text-sm font-bold text-primary-600 flex-shrink-0">
                        {formatPrice(item.ad.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <AlertCircle className="w-3 h-3" />
                      <span>Boost expired on {item.boost_end_time ? new Date(item.boost_end_time).toLocaleDateString() : 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.views_count}</span>
                      <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" />{item.clicks_count}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{item.whatsapp_clicks}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{item.saves_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
                    <button
                      onClick={() => onBoostAgain(item.ad.id, item.ad.title)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Boost Again
                    </button>
                    <Link
                      href={`/ad/${item.ad.slug}`}
                      className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-primary-600 text-xs font-medium ml-auto transition-colors"
                    >
                      View Ad <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
