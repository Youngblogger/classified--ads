'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BarChart3, Zap, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { growthApi } from '@/lib/api';
import BoostAdModal from '@/components/ui/BoostAdModal';
import ActiveBoostList from '@/components/promotion/ActiveBoostList';
import ExpiredBoostList from '@/components/promotion/ExpiredBoostList';
import BoostAnalyticsCards from '@/components/promotion/BoostAnalyticsCards';
import BoostRecommendationPanel from '@/components/promotion/BoostRecommendationPanel';
import BoostPricingReference from '@/components/promotion/BoostPricingReference';

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

interface AnalyticsData {
  total_boosts: number;
  active_count: number;
  expired_count: number;
  top_performing_ad: {
    ad: { id: number; title: string; slug: string };
    ctr: number;
    boost_type: string;
    views_count: number;
  } | null;
  worst_performing_ad: {
    ad: { id: number; title: string; slug: string };
    ctr: number;
    boost_type: string;
    views_count: number;
  } | null;
  total_views: number;
  total_clicks: number;
  total_saves: number;
  average_ctr: number;
}

interface BoostApiResponse {
  boosts: BoostItem[];
  active_boosts: BoostItem[];
  expired_boosts: BoostItem[];
  analytics: AnalyticsData;
  prices: Record<string, number>;
  durations: number[];
}

export default function BoostManagerPage() {
  const [data, setData] = useState<BoostApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boostModal, setBoostModal] = useState<{ show: boolean; adId: number; adTitle: string }>({
    show: false, adId: 0, adTitle: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await growthApi.myBoosts();
      setData(res.data.data);
    } catch (err: any) {
      console.error('Failed to load boost data:', err);
      setError('Failed to load boost data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRenew = (item: BoostItem) => {
    setBoostModal({ show: true, adId: item.ad.id, adTitle: item.ad.title });
  };

  const handleBoostAgain = (adId: number, adTitle: string) => {
    setBoostModal({ show: true, adId, adTitle });
  };

  const hasBoosts = data && data.boosts && data.boosts.length > 0;
  const hasActive = data && data.active_boosts && data.active_boosts.length > 0;
  const hasExpired = data && data.expired_boosts && data.expired_boosts.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Performance & Boost Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor, manage, and maximize your ad visibility</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading state */}
      {loading && !data && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
          <p className="text-gray-500 text-sm">Loading your boost performance...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 mb-3">{error}</p>
          <button
            onClick={fetchData}
            className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state — no boosts ever */}
      {!loading && !error && !hasBoosts && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <TrendingUp className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Boost Your First Ad</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Boosting increases your ad&apos;s visibility, puts it at the top of search results, and helps you sell faster.
          </p>
          <Link
            href="/dashboard/my-ads"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
          >
            <Zap className="w-4 h-4" />
            Go to My Ads
          </Link>
        </div>
      )}

      {/* Dashboard content */}
      {!loading && hasBoosts && (
        <>
          {/* 1. ACTIVE BOOSTED ADS OVERVIEW */}
          {hasActive && (
            <ActiveBoostList
              items={data!.active_boosts}
              onRenew={handleRenew}
            />
          )}

          {/* 2. EXPIRED BOOSTS SECTION */}
          {hasExpired && (
            <ExpiredBoostList
              items={data!.expired_boosts}
              onBoostAgain={handleBoostAgain}
            />
          )}

          {/* 3. PERFORMANCE ANALYTICS */}
          <BoostAnalyticsCards
            analytics={data!.analytics}
            activeItems={data!.active_boosts}
          />

          {/* 4. BOOST RECOMMENDATION ENGINE */}
          <BoostRecommendationPanel
            activeItems={data!.active_boosts}
            allItems={data!.boosts}
          />

          {/* 5. BOOST PRICING REFERENCE */}
          <BoostPricingReference
            prices={data!.prices}
            durations={data!.durations}
          />

          {/* Summary footer */}
          <div className="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-2xl p-5 border border-primary-100">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-primary-900 mb-1">Boost Summary</h3>
                <p className="text-xs text-primary-700">
                  {data!.analytics.active_count} active boost{data!.analytics.active_count !== 1 ? 's' : ''} ·
                  {data!.analytics.expired_count} expired · {data!.analytics.total_views.toLocaleString()} total views · {data!.analytics.average_ctr}% avg CTR
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Boost/Renew/Extend Modal */}
      <BoostAdModal
        adId={boostModal.adId}
        adTitle={boostModal.adTitle}
        isOpen={boostModal.show}
        onClose={() => setBoostModal({ show: false, adId: 0, adTitle: '' })}
      />
    </div>
  );
}
