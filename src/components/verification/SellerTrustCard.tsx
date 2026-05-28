'use client';

import { Shield, Star, ShoppingBag, Clock, Zap, BadgeCheck, TrendingUp } from 'lucide-react';
import { calculateTrustScore as calcTrustScore, estimateMemberSinceDays } from '@/lib/trust-score';

interface SellerTrustCardProps {
  seller: {
    name?: string;
    is_verified?: boolean;
    created_at?: string;
  };
  stats?: {
    average_rating?: number;
    total_reviews?: number;
    total_transactions?: number;
    active_ads?: number;
    response_rate?: number;
    response_time?: string;
  };
}

function formatMemberSince(dateStr?: string): string {
  if (!dateStr) return 'Unknown';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const years = now.getFullYear() - date.getFullYear();
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    const months = (now.getMonth() - date.getMonth()) + (years * 12);
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    return 'Recently joined';
  } catch {
    return dateStr;
  }
}

function TrustProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-500 w-8 text-right">{value}%</span>
    </div>
  );
}

export default function SellerTrustCard({ seller, stats }: SellerTrustCardProps) {
  const isVerified = seller?.is_verified;
  const rating = stats?.average_rating || 0;
  const reviewCount = stats?.total_reviews || 0;
  const activeAds = stats?.active_ads || 0;
  const transactions = stats?.total_transactions || 0;
  const responseRate = stats?.response_rate;

  const trustScore = calcTrustScore({
    isVerified,
    averageRating: rating,
    totalReviews: reviewCount,
    totalTransactions: transactions,
    activeAds,
    responseRate,
    memberSinceDays: estimateMemberSinceDays(seller?.created_at),
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Trust Score Header */}
      <div className={`p-3 border-b ${trustScore.tier === 'highly_trusted' ? 'bg-emerald-50 border-emerald-200' : trustScore.tier === 'trusted' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold capitalize text-gray-700">Trust Score</span>
          <span className={`text-lg font-bold ${trustScore.tier === 'highly_trusted' ? 'text-emerald-600' : trustScore.tier === 'trusted' ? 'text-blue-600' : 'text-gray-500'}`}>
            {trustScore.overall}
            <span className="text-xs font-normal text-gray-400">/100</span>
          </span>
        </div>
        <span className={`text-xs font-medium ${trustScore.tier === 'highly_trusted' ? 'text-emerald-600' : trustScore.tier === 'trusted' ? 'text-blue-600' : 'text-gray-500'}`}>
          {trustScore.tierLabel}
        </span>
      </div>

      {/* Identity Trust */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Identity Trust</span>
        </div>
        <TrustProgressBar value={trustScore.identity} color="bg-blue-500" />
        <div className="flex items-center gap-2 mt-2">
          {isVerified ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded text-xs font-semibold text-[#1d9bf0]">
              <BadgeCheck className="w-3 h-3" strokeWidth={2.5} />
              Government ID Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded text-xs text-gray-500">
              <Shield className="w-3 h-3" />
              Not verified
            </span>
          )}
        </div>
      </div>

      {/* Reputation Trust */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reputation Trust</span>
        </div>
        <TrustProgressBar value={trustScore.behavior} color="bg-amber-500" />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="text-xs text-gray-600">
            <span className="block text-gray-400">Rating</span>
            <span className="font-semibold text-gray-900">
              {rating > 0 ? `${rating.toFixed(1)} / 5` : '\u2014'}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            <span className="block text-gray-400">Reviews</span>
            <span className="font-semibold text-gray-900">{reviewCount}</span>
          </div>
          {transactions > 0 && (
            <div className="text-xs text-gray-600">
              <span className="block text-gray-400">Transactions</span>
              <span className="font-semibold text-gray-900">{transactions}</span>
            </div>
          )}
        </div>
      </div>

      {/* Activity */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</span>
        </div>
        <TrustProgressBar value={trustScore.activity} color="bg-emerald-500" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <ShoppingBag className="w-3 h-3 text-gray-400" />
            <span>{activeAds} active ads</span>
          </div>
          {responseRate !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Zap className="w-3 h-3 text-gray-400" />
              <span>{responseRate}% response rate</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>{formatMemberSince(seller?.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
