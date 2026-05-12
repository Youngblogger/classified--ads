'use client';

import { useMemo } from 'react';
import { BarChart3, TrendingUp, Eye, MessageCircle, Percent, Target, ArrowUp, ArrowDown } from 'lucide-react';

interface SellerMetricsProps {
  stats?: {
    total_ads?: number;
    active_ads?: number;
    views?: number;
    total_views?: number;
    messages?: number;
    calls?: number;
    sold_ads?: number;
    total_reviews?: number;
    avg_rating?: number;
  } | null;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: { value: number; positive: boolean };
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

function MetricCard({ label, value, change, icon: Icon, color, bg }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4" role="region" aria-label={label}>
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        {change && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
            {change.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {change.value}%
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

export default function SellerMetrics({ stats }: SellerMetricsProps) {
  const metrics = useMemo(() => {
    if (!stats) return [];
    const views = stats.total_views || stats.views || 0;
    const activeAds = stats.active_ads || 0;
    const totalAds = stats.total_ads || 0;
    const conversionRate = views > 0 && totalAds > 0 ? ((stats.messages || 0) / views * 100) : 0;
    const sellThroughRate = totalAds > 0 ? ((stats.sold_ads || 0) / totalAds * 100) : 0;
    return [
      { label: 'Total Views', value: views.toLocaleString(), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Active Ads', value: activeAds, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Messages Received', value: stats.messages || 0, icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Conversion Rate', value: `${conversionRate.toFixed(1)}%`, change: { value: parseFloat(conversionRate.toFixed(1)), positive: conversionRate > 2 }, icon: Percent, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Sell-Through Rate', value: `${sellThroughRate.toFixed(1)}%`, change: { value: parseFloat(sellThroughRate.toFixed(1)), positive: sellThroughRate > 20 }, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Total Reviews', value: stats.total_reviews || 0, icon: BarChart3, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];
  }, [stats]);

  const barData = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Views', value: stats.total_views || stats.views || 0, color: 'bg-blue-500', max: 0 },
      { label: 'Messages', value: stats.messages || 0, color: 'bg-purple-500', max: 0 },
      { label: 'Sold', value: stats.sold_ads || 0, color: 'bg-green-500', max: 0 },
    ];
  }, [stats]);

  const maxValue = Math.max(...barData.map(d => d.value), 1);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-card p-6" role="region" aria-label="Seller performance metrics">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
            <BarChart3 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Seller Performance</h3>
            <p className="text-xs text-gray-500">Your marketplace analytics</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {barData.some(d => d.value > 0) && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Ad Engagement Overview</h4>
            <div className="space-y-3">
              {barData.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-900">{item.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
