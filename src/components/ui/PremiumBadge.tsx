'use client';

import { getBoostConfig } from '@/lib/boost-config';

interface PremiumBadgeProps {
  boostType: string | null | undefined;
  size?: 'sm' | 'md';
  className?: string;
  variant?: 'absolute' | 'inline';
}

const TIER_CLASS: Record<string, string> = {
  platinum: 'boost-badge--diamond',
  gold: 'boost-badge--platinum',
  silver: 'boost-badge--gold',
  top: 'boost-badge--gold',
  featured: 'boost-badge--platinum',
  highlight: 'boost-badge--gold',
};

export default function PremiumBadge({ boostType, size = 'sm', className = '', variant = 'absolute' }: PremiumBadgeProps) {
  const config = getBoostConfig(boostType);
  if (!config) return null;

  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const tier = boostType?.toLowerCase() || '';
  const tierClass = TIER_CLASS[tier] || 'boost-badge--gold';

  const badge = (
    <div className={`boost-badge relative inline-flex ${tierClass} ${iconSize} ${className}`}>
      <img
        src={config.svgIcon}
        alt=""
        className="boost-badge__icon"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );

  if (variant === 'inline') {
    return badge;
  }

  return (
    <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-10 flex flex-col gap-1">
      {badge}
    </div>
  );
}