'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { storeApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import {
  BarChart3, Eye, Users, MousePointerClick, MessageCircle,
  TrendingUp, TrendingDown, Download, RefreshCw, Loader2,
  Calendar, ArrowLeft, Activity, Phone, Smartphone,
  ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';

type Period = '7d' | '30d' | '90d';

interface AnalyticsData {
  total_views: number;
  unique_visitors: number;
  followers: number;
  contact_clicks: number;
  whatsapp_clicks: number;
  followers_over_time: { date: string; count: number }[];
  views_over_time: { date: string; count: number }[];
  period: Period;
}

const periodLabels: Record<Period, string> = {
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days',
};

export default function StoreAnalyticsPage() {
  const { isAuthenticated } = useAuthStore();

  const [period, setPeriod] = useState<Period>('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await storeApi.getAnalytics(period);
      const d = (res.data as any)?.data || res.data || {};
      setData({
        total_views: d.total_views || 0,
        unique_visitors: d.unique_visitors || 0,
        followers: d.followers || 0,
        contact_clicks: d.contact_clicks || 0,
        whatsapp_clicks: d.whatsapp_clicks || 0,
        followers_over_time: d.followers_over_time || [],
        views_over_time: d.views_over_time || [],
        period,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load analytics';
      toast.error(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = () => {
    fetchAnalytics();
    toast.success('Analytics refreshed');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await storeApi.getAnalytics(period);
      const d = (res.data as any)?.data || res.data || {};
      const csvData = [
        ['Metric', 'Value'],
        ['Total Views', d.total_views || 0],
        ['Unique Visitors', d.unique_visitors || 0],
        ['Followers', d.followers || 0],
        ['Contact Clicks', d.contact_clicks || 0],
        ['WhatsApp Clicks', d.whatsapp_clicks || 0],
        ...(d.views_over_time || []).map((v: any) => [`Views ${v.date}`, v.count]),
        ...(d.followers_over_time || []).map((v: any) => [`Followers ${v.date}`, v.count]),
      ];
      const csv = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `store-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Analytics exported');
    } catch {
      toast.error('Failed to export analytics');
    } finally {
      setExporting(false);
    }
  };

  const formatNumber = (n: number) => n.toLocaleString('en-US');

  const getMaxValue = (items: { count: number }[]) => {
    if (items.length === 0) return 1;
    return Math.max(...items.map(v => v.count), 1);
  };

  const trendIndicator = (current: number, previous: number) => {
    if (previous === 0) return null;
    const pct = ((current - previous) / previous) * 100;
    if (pct === 0) return null;
    const isUp = pct > 0;
    return (
      <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-green-600' : 'text-red-600'}`}>
        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(pct).toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-card">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl h-72 shadow-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/store" className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Store Analytics</h2>
          </div>
          <p className="text-gray-500 text-sm mt-1">Track your store performance and growth</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600 mr-2">Period:</span>
          {(['7d', '30d', '90d'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
          <span className="text-xs text-gray-400 ml-auto">{periodLabels[period]}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Views */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            {data && trendIndicator(data.total_views, data.total_views - Math.round(data.total_views * 0.1))}
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(data?.total_views || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">Total Views</p>
        </div>

        {/* Unique Visitors */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(data?.unique_visitors || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">Unique Visitors</p>
        </div>

        {/* Followers */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(data?.followers || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">Followers</p>
        </div>

        {/* Contact Clicks */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <MousePointerClick className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(data?.contact_clicks || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">Contact Clicks</p>
        </div>

        {/* WhatsApp Clicks */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(data?.whatsapp_clicks || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">WhatsApp Clicks</p>
        </div>
      </div>

      {/* Views Over Time Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Views Over Time</h3>
          <span className="text-sm text-gray-500">{data?.views_over_time?.length || 0} data points</span>
        </div>
        {data?.views_over_time && data.views_over_time.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-end gap-1 sm:gap-2 h-48">
              {data.views_over_time.map((item, i) => {
                const maxVal = getMaxValue(data.views_over_time);
                const height = (item.count / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count}
                    </span>
                    <div
                      className="w-full bg-primary-500 rounded-t-md hover:bg-primary-600 transition-colors relative"
                      style={{ height: `${Math.max(height, 1)}%` }}
                      title={`${item.date}: ${item.count} views`}
                    />
                    <span className="text-[10px] text-gray-400 truncate w-full text-center">
                      {item.date.slice(-5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No view data available for this period
          </div>
        )}
      </div>

      {/* Followers Over Time Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Followers Growth</h3>
          <span className="text-sm text-gray-500">{data?.followers_over_time?.length || 0} data points</span>
        </div>
        {data?.followers_over_time && data.followers_over_time.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-end gap-1 sm:gap-2 h-48">
              {data.followers_over_time.map((item, i) => {
                const maxVal = getMaxValue(data.followers_over_time);
                const height = (item.count / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count}
                    </span>
                    <div
                      className="w-full bg-green-500 rounded-t-md hover:bg-green-600 transition-colors relative"
                      style={{ height: `${Math.max(height, 1)}%` }}
                      title={`${item.date}: ${item.count} followers`}
                    />
                    <span className="text-[10px] text-gray-400 truncate w-full text-center">
                      {item.date.slice(-5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No follower data available for this period
          </div>
        )}
      </div>
    </div>
  );
}
