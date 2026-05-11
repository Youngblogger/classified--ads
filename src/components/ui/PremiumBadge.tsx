'use client';

import { getBoostConfig } from '@/lib/boost-config';

interface PremiumBadgeProps {
  boostType: string | null | undefined;
  size?: 'sm' | 'md';
  className?: string;
  variant?: 'absolute' | 'inline';
}

const GLOW_CLASS: Record<string, string> = {
  platinum: 'boost-pill--diamond',
  gold: 'boost-pill--platinum',
  silver: 'boost-pill--gold',
  top: 'boost-pill--gold',
  featured: 'boost-pill--platinum',
  highlight: 'boost-pill--gold',
};

export default function PremiumBadge({ boostType, size = 'sm', className = '', variant = 'absolute' }: PremiumBadgeProps) {
  const config = getBoostConfig(boostType);
  if (!config) return null;

  const pillSize = size === 'sm' ? 'text-[10px] px-1.5 py-0.5 gap-0.5' : 'text-xs px-2 py-1 gap-1';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const tier = boostType?.toLowerCase() || '';
  const glowClass = GLOW_CLASS[tier] || 'boost-pill--gold';

  const badge = (
    <div className={`boost-pill inline-flex items-center ${pillSize} ${glowClass} ${className}`}>
      <img
        src={config.svgIcon}
        alt=""
        className={`${iconSize} boost-pill__icon`}
        style={{ pointerEvents: 'none' }}
      />
      <span className="font-semibold whitespace-nowrap leading-none">{config.displayName}</span>
    </div>
  );

  if (variant === 'inline') {
    return badge;
  }

  return (
    <div className="absolute top-2 left-2 z-10">
      {badge}
    </div>
  );
}
