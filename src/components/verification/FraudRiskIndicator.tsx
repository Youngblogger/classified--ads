'use client';

import { AlertTriangle, Info, Clock, ShieldOff } from 'lucide-react';
import { calculateTrustScore, estimateMemberSinceDays } from '@/lib/trust-score';

interface FraudRiskIndicatorProps {
  seller: {
    is_verified?: boolean;
    created_at?: string;
  };
  stats?: {
    total_reviews?: number;
    total_transactions?: number;
    active_ads?: number;
    response_rate?: number;
  };
  compact?: boolean;
}

export default function FraudRiskIndicator({ seller, stats, compact = false }: FraudRiskIndicatorProps) {
  const memberDays = estimateMemberSinceDays(seller?.created_at);
  const totalReviews = stats?.total_reviews || 0;
  const totalTransactions = stats?.total_transactions || 0;
  const activeAds = stats?.active_ads || 0;
  const isVerified = seller?.is_verified;

  const signals: { label: string; icon: React.ReactNode; type: 'warning' | 'info' | 'success' }[] = [];

  if (memberDays < 7) {
    signals.push({
      label: 'New account',
      icon: <Clock className="w-3 h-3" />,
      type: 'warning',
    });
  }

  if (memberDays >= 7 && !isVerified && totalTransactions === 0) {
    signals.push({
      label: 'Unverified transaction history',
      icon: <ShieldOff className="w-3 h-3" />,
      type: 'info',
    });
  }

  if (totalReviews === 0 && activeAds > 0 && !isVerified) {
    signals.push({
      label: 'No buyer reviews',
      icon: <Info className="w-3 h-3" />,
      type: 'info',
    });
  }

  if (activeAds === 0) {
    signals.push({
      label: 'No active listings',
      icon: <AlertTriangle className="w-3 h-3" />,
      type: 'info',
    });
  }

  if (signals.length === 0) return null;

  if (compact) {
    const warningSignals = signals.filter(s => s.type === 'warning');
    if (warningSignals.length === 0) return null;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-md text-[10px] text-amber-700 font-medium">
        <AlertTriangle className="w-3 h-3" />
        {warningSignals[0].label}
      </span>
    );
  }

  return (
    <div className="space-y-1.5">
      {signals.map((signal, i) => (
        <div
          key={i}
          className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md ${
            signal.type === 'warning'
              ? 'text-amber-700 bg-amber-50'
              : signal.type === 'info'
              ? 'text-gray-500 bg-gray-50'
              : 'text-green-700 bg-green-50'
          }`}
        >
          {signal.icon}
          <span>{signal.label}</span>
        </div>
      ))}
    </div>
  );
}
