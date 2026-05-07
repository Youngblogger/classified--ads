'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ImageIcon, Zap, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { getAdImageUrl } from '@/lib/utils';
import BoostAdModal from '@/components/ui/BoostAdModal';

interface AdImage {
  id: number;
  url: string;
  is_primary: boolean;
}

interface Ad {
  id: number;
  title: string;
  slug: string;
  status: string;
  price: number;
  short_description: string | null;
  state: string | null;
  lga: string | null;
  location?: { name: string | null } | null;
  views?: number;
  created_at: string;
  is_boosted?: boolean;
  boost_type?: string | null;
  images?: AdImage[];
}

const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'number' ? price : parseFloat(String(price) || '0');
  return `₦${numPrice.toLocaleString('en-US')}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function PromotionsPage() {
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [boostModal, setBoostModal] = useState<{ show: boolean; adId: number | null; adTitle: string | null }>({
    show: false,
    adId: null,
    adTitle: null,
  });

  useEffect(() => {
    fetchMyAds();
  }, []);

  const fetchMyAds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/my-ads', { params: { status: 'active', limit: 50 } });
      const ads = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const activeAds = ads.filter((ad: Ad) => ad.status === 'active');
      setMyAds(activeAds);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      setMyAds([]);
    } finally {
      setLoading(false);
    }
  };

  const eligibleAds = myAds.filter(ad => ad.status === 'active');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Boost Your Ads</h1>
        <p className="text-gray-500 text-sm mt-1">Increase visibility and sell faster</p>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">How Boosting Works</h2>
        </div>
        <p className="text-sm text-gray-600">Select an ad below to boost it. Boosted ads appear at the top of search results and get more views.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : eligibleAds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">You don&apos;t have any active ads to boost.</p>
          <Link href="/dashboard/post-ad" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
            Post an Ad
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {eligibleAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-100">
                {(() => {
                  const imagesArray = ad.images || [];
                  const primaryImage = imagesArray.find((img) => img?.is_primary) || imagesArray[0];
                  const imageUrl = primaryImage ? getAdImageUrl(primaryImage) : '';
                  return imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  );
                })()}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                {ad.is_boosted && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      <Zap className="w-3 h-3" />
                      {ad.boost_type || 'Boosted'}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{ad.title}</h3>

                {/* Location */}
                {(ad.location?.name || ad.state || ad.lga) && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      {(() => {
                        const state = ad.state || ad.location?.name || '';
                        const lga = ad.lga || '';
                        return state && lga ? `${state}, ${lga}` : (state || lga || 'N/A');
                      })()}
                    </span>
                  </div>
                )}

                <p className="text-xl font-bold text-primary-600 mb-3">
                  {formatPrice(ad.price)}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{ad.views || 0} views</span>
                  <span>{formatDate(ad.created_at)}</span>
                </div>

                {/* Boost Button */}
                <button
                  onClick={() => setBoostModal({ show: true, adId: ad.id, adTitle: ad.title })}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
                >
                  <Zap className="w-4 h-4" />
                  {ad.is_boosted ? 'Boost Again' : 'Boost Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BoostAdModal
        adId={boostModal.adId ?? 0}
        adTitle={boostModal.adTitle ?? ''}
        isOpen={boostModal.show}
        onClose={() => setBoostModal({ show: false, adId: null, adTitle: null })}
      />
    </div>
  );
}
