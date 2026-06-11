'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { fetchBoostPlans, fetchBoostPlansFallback } from '@/services/boost-service';
import type { BoostPlan } from '@/types';

interface PromotionPackagesProps {
  selectedPlan: BoostPlan | null;
  onSelectPlan: (plan: BoostPlan) => void;
}

function getDefaultPlans(): BoostPlan[] {
  return [
    { id: 1, name: 'Basic', type: 'basic', price: 5, formatted_price: '₦5.00', duration_days: 7, features: ['Basic visibility boost', '7 days duration'], is_active: true },
    { id: 2, name: 'Standard', type: 'standard', price: 10, formatted_price: '₦10.00', duration_days: 14, features: ['Standard visibility boost', '14 days duration', 'Highlighted listing'], is_active: true },
    { id: 3, name: 'Premium', type: 'premium', price: 25, formatted_price: '₦25.00', duration_days: 30, features: ['Premium visibility boost', '30 days duration', 'Featured listing', 'Top search results'], is_active: true },
  ];
}

export default function PromotionPackages({ selectedPlan, onSelectPlan }: PromotionPackagesProps) {
  const [plans, setPlans] = useState<BoostPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBoostPlans().then((result) => {
      if (result.success && result.data && result.data.length > 0) {
        setPlans(result.data);
      } else {
        fetchBoostPlansFallback().then((fallback) => {
          setPlans(fallback.length > 0 ? fallback : getDefaultPlans());
        });
      }
    }).catch(() => {
      fetchBoostPlansFallback().then((fallback) => {
        setPlans(fallback.length > 0 ? fallback : getDefaultPlans());
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose a Promotion Package</h2>
      <div className="space-y-3">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => onSelectPlan(plan)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedPlan?.id === plan.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.duration_days} days</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">
                  {plan.formatted_price || `₦${plan.price.toFixed(2)}`}
                </p>
              </div>
            </div>
            {plan.features && plan.features.length > 0 && (
              <ul className="mt-3 space-y-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" /> {f}
                  </li>
                ))}
              </ul>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
