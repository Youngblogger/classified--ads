'use client';

import { Eye, MousePointerClick, MessageCircle, Heart, TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';

interface BoostAnalytics {
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

interface BoostItem {
  views_count: number;
  clicks_count: number;
  whatsapp_clicks: number;
  saves_count: number;
  ctr: number;
  boost_type: string;
  ad: {
    id: number;
    title: string;
    slug: string;
  };
}

interface BoostAnalyticsCardsProps {
  analytics: BoostAnalytics;
  activeItems: BoostItem[];
}

export default function BoostAnalyticsCards({ analytics, activeItems }: BoostAnalyticsCardsProps) {
  if (activeItems.length === 0 && analytics.total_boosts === 0) return null;

  const overallCTR = analytics.total_views > 0
    ? ((analytics.total_clicks / analytics.total_views) * 100).toFixed(1)
    : '0.0';

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Analytics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500 font-medium">Total Views</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.total_views.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <MousePointerClick className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-gray-500 font-medium">Total Clicks</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.total_clicks.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500 font-medium">Avg CTR</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.average_ctr}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-500 font-medium">Total Saves</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.total_saves.toLocaleString()}</p>
        </div>
      </div>

      {analytics.top_performing_ad && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-900">Top Performing Ad</span>
            </div>
            <p className="text-sm font-medium text-gray-800 truncate">
              {analytics.top_performing_ad.ad?.title || 'N/A'}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
              <span className="font-semibold text-emerald-600">{analytics.top_performing_ad.ctr}% CTR</span>
              <span>{analytics.top_performing_ad.views_count} views</span>
              <span className="capitalize">{analytics.top_performing_ad.boost_type}</span>
            </div>
          </div>

          {analytics.worst_performing_ad && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900">Needs Optimization</span>
              </div>
              <p className="text-sm font-medium text-gray-800 truncate">
                {analytics.worst_performing_ad.ad?.title || 'N/A'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                <span className="font-semibold text-amber-600">{analytics.worst_performing_ad.ctr}% CTR</span>
                <span>{analytics.worst_performing_ad.views_count} views</span>
                <span className="capitalize">{analytics.worst_performing_ad.boost_type}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeItems.length > 0 && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Boost Performance Breakdown</span>
          </div>
          <div className="divide-y divide-gray-100">
            {activeItems.map((item) => (
              <div key={item.ad.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate max-w-[200px]">{item.ad.title}</span>
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                  <span>{item.views_count} views</span>
                  <span>{item.clicks_count + item.whatsapp_clicks} clicks</span>
                  <span className="font-semibold text-gray-700">{item.ctr}% CTR</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
