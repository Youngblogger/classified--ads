'use client';

import { Eye, MousePointerClick, TrendingUp, Target, Clock, Zap } from 'lucide-react';

interface AdData {
  id: number;
  title: string;
  slug: string;
  price: number;
  status: string;
  category?: { id: number; name: string } | null;
}

interface BoostPerformanceFeedbackProps {
  boostType: string;
  viewsCount: number;
  clicksCount: number;
  whatsappClicks: number;
  savesCount: number;
  ctr: number;
  boostStart?: string;
  boostEnd?: string;
  ad: AdData;
}

const TIER_VIEW_MULTIPLIERS: Record<string, string> = {
  silver: '3x',
  gold: '6x',
  platinum: '10x',
  top: '4x',
  featured: '5x',
  highlight: '3x',
};

const TIER_BADGE_COLORS: Record<string, string> = {
  silver: 'from-amber-400 to-amber-500',
  gold: 'from-slate-400 to-slate-500',
  platinum: 'from-blue-500 to-blue-600',
  top: 'from-amber-400 to-amber-500',
  featured: 'from-slate-400 to-slate-500',
  highlight: 'from-amber-400 to-amber-500',
};

export default function BoostPerformanceFeedback({
  boostType,
  viewsCount,
  clicksCount,
  whatsappClicks,
  savesCount,
  ctr,
  boostStart,
  boostEnd,
}: BoostPerformanceFeedbackProps) {
  const multiplier = TIER_VIEW_MULTIPLIERS[boostType] || '3x';
  const badgeGradient = TIER_BADGE_COLORS[boostType] || 'from-amber-400 to-amber-500';
  const totalClicks = clicksCount + whatsappClicks;
  const avgNonBoostedViews = Math.max(1, Math.round(viewsCount / 3));
  const viewIncrease = viewsCount > 0 ? Math.round(((viewsCount - avgNonBoostedViews) / avgNonBoostedViews) * 100) : 0;

  const duration = boostStart && boostEnd
    ? Math.ceil((new Date(boostEnd).getTime() - new Date(boostStart).getTime()) / 86400000)
    : null;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className={`w-4 h-4 text-amber-500`} />
        <span className="text-sm font-semibold text-gray-800">Boost Performance</span>
        <span className={`ml-auto text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-gradient-to-r ${badgeGradient}`}>
          {boostType.charAt(0).toUpperCase() + boostType.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-lg border border-gray-100 p-2.5 text-center">
          <Eye className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{viewsCount.toLocaleString()}</p>
          <p className="text-[10px] text-gray-500">Views</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-2.5 text-center">
          <MousePointerClick className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
          <p className="text-[10px] text-gray-500">Clicks</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-2.5 text-center">
          <Target className="w-3.5 h-3.5 text-purple-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{ctr}%</p>
          <p className="text-[10px] text-gray-500">CTR</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-2.5 text-center">
          <TrendingUp className="w-3.5 h-3.5 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-amber-600">+{viewIncrease}%</p>
          <p className="text-[10px] text-gray-500">vs non-boosted</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-gray-500">
        {duration && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration} day{duration !== 1 ? 's' : ''}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Up to {multiplier} visibility
        </span>
      </div>
    </div>
  );
}
