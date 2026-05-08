'use client';

import { Lightbulb, TrendingUp, BarChart3, Target, Zap } from 'lucide-react';

interface BoostItem {
  boost_type: string;
  views_count: number;
  clicks_count: number;
  whatsapp_clicks: number;
  saves_count: number;
  ctr: number;
  ad: {
    id: number;
    title: string;
    slug: string;
    category?: { id: number; name: string } | null;
  };
}

interface BoostRecommendationPanelProps {
  activeItems: BoostItem[];
  allItems: BoostItem[];
}

interface Recommendation {
  icon: typeof Lightbulb;
  color: string;
  bgColor: string;
  title: string;
  description: string;
  action: string;
}

export default function BoostRecommendationPanel({ activeItems, allItems }: BoostRecommendationPanelProps) {
  const recommendations: Recommendation[] = [];

  if (activeItems.length === 0 && allItems.length === 0) return null;

  const highViewsLowClicks = activeItems.find(
    item => item.views_count > 50 && item.ctr < 2
  );
  if (highViewsLowClicks) {
    recommendations.push({
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      title: 'High Views, Low Clicks',
      description: `"${highViewsLowClicks.ad.title}" gets views but few clicks. A Featured Boost adds a stronger visual CTA badge.`,
      action: 'Try Featured Boost',
    });
  }

  const categoryBoostMap: Record<string, string> = {
    'Vehicles': 'top',
    'Real Estate': 'top',
    'Electronics': 'featured',
    'Fashion': 'highlight',
    'Services': 'featured',
  };
  const adCategoryName = activeItems[0]?.ad?.category?.name || allItems[0]?.ad?.category?.name || '';
  const suggestedBoost = categoryBoostMap[adCategoryName];
  if (suggestedBoost && activeItems.length > 0) {
    const hasSuggested = activeItems.some(item => item.boost_type === suggestedBoost);
    if (!hasSuggested) {
      recommendations.push({
        icon: Target,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        title: 'Category Optimized Boost',
        description: `"${adCategoryName}" ads perform best with ${suggestedBoost === 'top' ? 'Top' : suggestedBoost === 'featured' ? 'Featured' : 'Highlight'} Boost based on market trends.`,
        action: `Switch to ${suggestedBoost === 'top' ? 'Top' : suggestedBoost === 'featured' ? 'Featured' : 'Highlight'} Boost`,
      });
    }
  }

  if (allItems.length >= 2) {
    const hasSaved = allItems.some(item => item.saves_count > 10);
    if (hasSaved) {
      recommendations.push({
        icon: TrendingUp,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        title: 'High Demand Signal',
        description: 'Ads with high saves convert well. Boosting now increases visibility by ~2.5x while demand is hot.',
        action: 'Boost Now',
      });
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      icon: Zap,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      title: 'Keep the Momentum',
      description: 'Your boosted ads are performing well. Consistent boosting maintains top visibility and maximizes ROI.',
      action: 'Extend Your Boost',
    });
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-bold text-gray-900">Smart Suggestions</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommendations.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <div
              key={i}
              className={`${rec.bgColor} rounded-xl border border-transparent p-4 hover:shadow-sm transition-shadow`}
            >
              <div className={`w-8 h-8 ${rec.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${rec.color}`} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{rec.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">{rec.description}</p>
              <span className={`text-xs font-semibold ${rec.color}`}>{rec.action} →</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
