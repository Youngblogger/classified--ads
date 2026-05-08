'use client';

import { Gem, Star, Sparkles, Info } from 'lucide-react';

interface BoostPricingReferenceProps {
  prices: Record<string, number> | null;
  durations?: number[];
}

const BOOST_INFO = {
  top: {
    label: 'Top Ad',
    icon: Gem,
    gradient: 'from-amber-400 to-yellow-400',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    description: 'Highest visibility — appears first in search results with premium badge.',
  },
  featured: {
    label: 'Featured',
    icon: Star,
    gradient: 'from-blue-500 to-blue-400',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-200',
    description: 'Stand out with a featured badge and priority placement in listings.',
  },
  highlight: {
    label: 'Highlight',
    icon: Sparkles,
    gradient: 'from-purple-500 to-purple-400',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-200',
    description: 'Subtle highlight styling that makes your ad noticeable at a glance.',
  },
};

export default function BoostPricingReference({ prices, durations }: BoostPricingReferenceProps) {
  if (!prices) return null;

  const durationDisplay = durations?.[0] ?? 7;
  const hasDiscount = durationDisplay >= 7;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-bold text-gray-900">Boost Pricing</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.entries(BOOST_INFO) as [string, typeof BOOST_INFO['top']][]).map(([key, info]) => {
          const dailyPrice = prices[key] || 0;
          const weeklyPrice = dailyPrice * durationDisplay * (hasDiscount ? 0.85 : 1);
          const Icon = info.icon;

          return (
            <div
              key={key}
              className={`${info.bgLight} ${info.borderLight} border rounded-xl p-4`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 bg-gradient-to-r ${info.gradient} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900">{info.label}</span>
              </div>

              <div className="mb-3">
                <span className="text-2xl font-bold text-gray-900">₦{dailyPrice.toFixed(2)}</span>
                <span className="text-xs text-gray-500 ml-1">/day</span>
              </div>

              <p className="text-xs text-gray-600 mb-3 leading-relaxed">{info.description}</p>

              <div className="text-xs text-gray-500 space-y-1">
                <p>{durationDisplay}-day boost: <span className="font-semibold text-gray-700">₦{weeklyPrice.toFixed(2)}</span></p>
                {hasDiscount && (
                  <p className="text-emerald-600 font-medium">15% bulk discount applied</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Prices shown are for reference. Actual cost depends on selected boost type and duration.
      </p>
    </section>
  );
}
