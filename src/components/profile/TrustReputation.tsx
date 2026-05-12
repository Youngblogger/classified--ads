'use client';

import { useMemo } from 'react';
import { Shield, Star, CheckCircle, AlertTriangle, Clock, TrendingUp, Users, MessageCircle, ThumbsUp, Ban } from 'lucide-react';
import type { User } from '@/types';

interface TrustReputationProps {
  user: User | null;
  stats?: {
    total_ads?: number;
    active_ads?: number;
    sold_ads?: number;
    total_reviews?: number;
    avg_rating?: number;
    response_time?: string;
    successful_transactions?: number;
    total_views?: number;
  } | null;
}

export default function TrustReputation({ user, stats }: TrustReputationProps) {
  const trustScore = useMemo(() => {
    if (!user && !stats) return { score: 0, label: 'Newcomer', color: 'text-gray-600', bg: 'bg-gray-100' };
    let score = 0;
    if (user?.email_verified_at || user?.verified) score += 20;
    if (user?.phone_verified_at) score += 15;
    if (user?.phone) score += 5;
    if (user?.avatar || user?.avatar_url || user?.full_avatar_url) score += 10;
    if (user?.location) score += 5;
    if ((user as any)?.bio) score += 5;
    if (stats?.total_reviews && stats.total_reviews > 0) score += 15;
    if (stats?.avg_rating && stats.avg_rating >= 4) score += 10;
    if (stats?.avg_rating && stats.avg_rating >= 4.5) score += 5;
    if (stats?.sold_ads && stats.sold_ads >= 5) score += 10;
    if (stats?.sold_ads && stats.sold_ads >= 20) score += 5;
    if (stats?.successful_transactions && stats.successful_transactions >= 10) score += 10;
    const label = score >= 90 ? 'Excellent' : score >= 75 ? 'Very Good' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Newcomer';
    const color = score >= 75 ? 'text-green-600' : score >= 60 ? 'text-blue-600' : score >= 40 ? 'text-amber-600' : 'text-gray-600';
    const bg = score >= 75 ? 'bg-green-100' : score >= 60 ? 'bg-blue-100' : score >= 40 ? 'bg-amber-100' : 'bg-gray-100';
    return { score: Math.min(score, 100), label, color, bg };
  }, [user, stats]);

  const metrics = [
    { label: 'Total Reviews', value: stats?.total_reviews ?? 0, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Avg. Rating', value: stats?.avg_rating ? `${stats.avg_rating.toFixed(1)}★` : 'N/A', icon: ThumbsUp, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Ads Sold', value: stats?.sold_ads ?? 0, icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Response Time', value: stats?.response_time || 'N/A', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Transactions', value: stats?.successful_transactions ?? 0, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Views', value: stats?.total_views ? stats.total_views.toLocaleString() : '0', icon: Users, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-card p-6" role="region" aria-label="Trust and reputation">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${trustScore.bg}`}>
              <Shield className={`w-5 h-5 ${trustScore.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Trust Score</h3>
              <p className={`text-xs font-medium ${trustScore.color}`}>{trustScore.label}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${trustScore.color}`}>{trustScore.score}</span>
            <span className="text-sm text-gray-400">/100</span>
          </div>
        </div>

        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-5" role="progressbar" aria-valuenow={trustScore.score} aria-valuemin={0} aria-valuemax={100} aria-label={`Trust score ${trustScore.score}`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              trustScore.score >= 75 ? 'bg-green-500' : trustScore.score >= 60 ? 'bg-blue-500' : trustScore.score >= 40 ? 'bg-amber-500' : 'bg-gray-400'
            }`}
            style={{ width: `${trustScore.score}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className={`${m.bg} rounded-xl p-3`}>
                <Icon className={`w-4 h-4 ${m.color} mb-1`} />
                <p className="text-lg font-bold text-gray-900">{m.value}</p>
                <p className="text-xs text-gray-500">{m.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {trustScore.score >= 80 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
              <Shield className="w-3.5 h-3.5" /> Verified Seller
            </span>
          )}
          {trustScore.score >= 60 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
              <Star className="w-3.5 h-3.5" /> Trusted Member
            </span>
          )}
          {(stats?.total_reviews ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
              <MessageCircle className="w-3.5 h-3.5" /> {stats?.total_reviews} reviews
            </span>
          )}
          {(stats?.sold_ads ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" /> {stats?.sold_ads} sold
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6" role="region" aria-label="Safety and scam warnings">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-red-50 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="font-semibold text-gray-900">Safety Check</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-green-800">Account is in good standing</span>
          </div>
          {(user?.email_verified_at || user?.verified) ? (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-green-800">Email verified — trusted communication channel</span>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-amber-800">Email not verified — verify to build trust</span>
            </div>
          )}
          {user?.phone_verified_at ? (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-green-800">Phone verified — extra identity layer</span>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <Ban className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-500">Phone not verified</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
