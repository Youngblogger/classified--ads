'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, MousePointerClick, MessageCircle, Heart, Clock, Zap, ChevronRight, RotateCcw, Timer } from 'lucide-react';
import { getBoostConfig } from '@/lib/boost-config';
import { getAdImageUrl } from '@/lib/utils';
import Image from 'next/image';
import BoostPlansModal from '@/components/ui/BoostPlansModal';

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
  boost_remaining_seconds: number;
  boost_remaining_days: number;
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

interface ActiveBoostListProps {
  items: BoostItem[];
  onRenew: (boost: BoostItem) => void;
}

const formatPrice = (price: number) =>
  `₦${price.toLocaleString('en-US')}`;

const formatDuration = (days: number): string => {
  if (days <= 0) return 'Less than a day';
  if (days === 1) return '1 day';
  return `${days} days`;
};

export default function ActiveBoostList({ items, onRenew }: ActiveBoostListProps) {
  const [extendModal, setExtendModal] = useState<{ show: boolean; adId: number; adTitle: string; adCategory?: any; adPrice?: any } | null>(null);

  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Active Boosts</h2>
          <p className="text-sm text-gray-500">{items.length} boost{items.length > 1 ? 's' : ''} active</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const boostConfig = getBoostConfig(item.boost_type);
          const primaryImage = item.ad.images?.find(img => img?.is_primary) || item.ad.images?.[0];
          const imageUrl = primaryImage ? getAdImageUrl(primaryImage) : null;

          return (
            <div
              key={item.boost_id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-card-hover transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 h-40 sm:h-auto relative bg-gray-100 flex-shrink-0">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.ad.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 192px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="w-8 h-8" />
                    </div>
                  )}
                  {boostConfig && (
                    <div className={`absolute top-2 left-2 bg-gradient-to-r ${boostConfig.gradient} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1`}>
                      <boostConfig.icon className="w-3 h-3" />
                      <span>{boostConfig.label}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link href={`/ad/${item.ad.slug}`} className="text-sm font-semibold text-gray-900 hover:text-primary-600 truncate">
                        {item.ad.title}
                      </Link>
                      <span className="text-sm font-bold text-primary-600 flex-shrink-0">
                        {formatPrice(item.ad.price)}
                      </span>
                    </div>

                    {item.ad.category && (
                      <p className="text-xs text-gray-500 mb-2">{item.ad.category.name}</p>
                    )}

                    <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5 mb-3 w-fit">
                      <Timer className="w-3.5 h-3.5" />
                      <span className="font-medium">{formatDuration(item.boost_remaining_days)} remaining</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.views_count} views</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MousePointerClick className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.clicks_count} clicks</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                        <span>{item.whatsapp_clicks} WhatsApp</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Heart className="w-3.5 h-3.5 text-red-400" />
                        <span>{item.saves_count} saves</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => onRenew(item)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Renew Boost
                    </button>
                    <button
                      onClick={() => setExtendModal({ show: true, adId: item.ad.id, adTitle: item.ad.title, adCategory: item.ad.category, adPrice: item.ad.price })}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Extend
                    </button>
                    <Link
                      href={`/ad/${item.ad.slug}`}
                      className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-primary-600 text-xs font-medium ml-auto transition-colors"
                    >
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {extendModal && (
        <BoostPlansModal
          adId={extendModal.adId}
          adTitle={extendModal.adTitle}
          isOpen={extendModal.show}
          onClose={() => setExtendModal(null)}
          adCategory={extendModal.adCategory}
          adPrice={extendModal.adPrice}
        />
      )}
    </section>
  );
}
