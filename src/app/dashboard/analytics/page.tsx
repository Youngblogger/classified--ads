'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { analyticsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Eye, MousePointerClick, TrendingUp, Heart, MessageSquare,
  Share2, Store, RefreshCw, ChevronRight
} from 'lucide-react';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';

const periods = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
];

const summaryCards = [
  { key: 'total_views', label: 'Total Views', icon: Eye },
  { key: 'total_clicks', label: 'Total Clicks', icon: MousePointerClick },
  { key: 'ctr', label: 'CTR', icon: TrendingUp, suffix: '%' },
  { key: 'total_favorites', label: 'Total Favorites', icon: Heart },
  { key: 'total_messages', label: 'Total Messages', icon: MessageSquare },
  { key: 'total_shares', label: 'Total Shares', icon: Share2 },
];

function TrendArrow({ value }: { value: number }) {
  const isUp = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-green-600' : 'text-red-500'}`}>
      <svg className={`w-3 h-3 ${isUp ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-7 bg-gray-200 rounded w-20 mb-1" />
      <div className="h-3 bg-gray-200 rounded w-12" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <TrendingUp className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load analytics</h3>
      <p className="text-sm text-gray-500 mb-6">Something went wrong. Please try again.</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm font-medium"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Eye className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No data yet</h3>
      <p className="text-sm text-gray-500 max-w-sm">
        Start posting ads to see analytics. Your performance metrics will appear here once you get your first views.
      </p>
      <Link
        href="/dashboard/post-ad"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm font-medium"
      >
        Post Your First Ad
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function StorePerformanceCard({ storeData }: { storeData: any }) {
  const metrics = [
    { label: 'Store Views', value: storeData?.views ?? 0, icon: Eye },
    { label: 'Followers', value: storeData?.followers ?? 0, icon: Store },
    { label: 'Contact Clicks', value: storeData?.contact_clicks ?? 0, icon: MousePointerClick },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Store className="w-5 h-5 text-primary-500" />
        <h3 className="text-sm font-semibold text-gray-900">Store Performance</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">{m.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{m.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const hasStore = user?.has_store || false;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const calls: any[] = [
        analyticsApi.getOverview(period),
        analyticsApi.getTopAds(),
      ];
      if (hasStore) {
        calls.push(analyticsApi.getStorePerformance(period));
      }
      const [overviewRes, topAdsRes, storeRes] = await Promise.all(calls);
      setData({
        overview: overviewRes.data,
        topAds: topAdsRes.data,
        store: storeRes?.data ?? null,
      });
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [period, hasStore]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) return <ErrorState onRetry={fetchData} />;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          {periods.map((p) => (
            <div key={p.value} className={`h-9 w-14 rounded-lg bg-gray-200 animate-pulse`} />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="flex-1 h-7 bg-gray-200 rounded-lg" />
                <div className="h-3 bg-gray-200 rounded w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const overview = data?.overview ?? {};
  const topAds = data?.topAds ?? [];
  const storeData = data?.store ?? null;
  const dailyData = overview?.daily_views ?? [];
  const isEmpty = !overview?.total_views && !overview?.total_clicks && topAds.length === 0;

  if (isEmpty) return <EmptyState />;

  return (
    <div className="space-y-6">
      {/* Page title + Period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                period === p.value
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          let value = overview?.[card.key];
          if (card.key === 'ctr') {
            value = value != null ? `${Number(value).toFixed(2)}%` : '0.00%';
          } else {
            value = value != null ? Number(value).toLocaleString() : '0';
          }
          const trend = overview?.[`${card.key}_trend`] ?? 0;
          return (
            <div
              key={card.key}
              className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {card.label}
                </span>
                <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-primary-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <div className="mt-1.5">
                <TrendArrow value={trend} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Chart */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Daily Views</h3>
        {dailyData.length > 0 ? (
          <AnalyticsChart data={dailyData} color="bg-gradient-to-r from-primary-400 to-primary-600" />
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No daily data available for this period.</p>
        )}
      </div>

      {/* Top Performing Ads */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Performing Ads</h3>
        {topAds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Favorites</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                </tr>
              </thead>
              <tbody>
                {topAds.map((ad: any, idx: number) => (
                  <tr key={ad.id ?? idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <Link
                        href={`/ad/${ad.slug ?? ad.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
                      >
                        {ad.title ?? `Ad #${ad.id}`}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-right text-gray-700 font-medium">{ad.views ?? 0}</td>
                    <td className="py-3 px-2 text-right text-gray-700 font-medium">{ad.favorites ?? 0}</td>
                    <td className="py-3 px-2 text-right text-gray-700 font-medium">{ad.clicks ?? 0}</td>
                    <td className="py-3 px-2 text-right">
                      <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-700 rounded-md text-xs font-semibold">
                        {ad.ctr != null ? `${Number(ad.ctr).toFixed(1)}%` : '0%'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">
            No ad performance data yet. Start posting ads to see your top performers.
          </p>
        )}
      </div>

      {/* Store Performance */}
      {hasStore && storeData && <StorePerformanceCard storeData={storeData} />}
    </div>
  );
}
