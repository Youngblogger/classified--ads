'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Zap } from 'lucide-react';
import BoostAdModal from '@/components/ui/BoostAdModal';

interface Ad {
  id: number;
  title: string;
  slug: string;
  status: string;
}

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
      const res = await api.get('/my-ads');
      setMyAds(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      setMyAds([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

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

      {myAds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">You don&apos;t have any ads to boost.</p>
          <Link href="/dashboard/post-ad" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
            Post an Ad
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{ad.title}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${
                ad.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {ad.status}
              </span>
              <button
                onClick={() => setBoostModal({ show: true, adId: ad.id, adTitle: ad.title })}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
              >
                <Zap className="w-4 h-4" />
                Boost Now
              </button>
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
