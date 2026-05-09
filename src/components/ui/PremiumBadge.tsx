'use client';

import { getBoostConfig } from '@/lib/boost-config';

interface PremiumBadgeProps {
  boostType: string | null | undefined;
  size?: 'sm' | 'md';
  className?: string;
  variant?: 'absolute' | 'inline';
}

export default function PremiumBadge({ boostType, size = 'sm', className = '', variant = 'absolute' }: PremiumBadgeProps) {
  const config = getBoostConfig(boostType);
  if (!config) return null;

  const Icon = config.icon;

  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-[9px] sm:text-[10px] gap-0.5'
    : 'px-2.5 py-1 text-xs gap-1';

  const iconSize = size === 'sm' ? 'w-2.5 h-2.5 sm:w-3 sm:h-3' : 'w-3.5 h-3.5';

  const badge = (
    <span
      className={`
        inline-flex items-center font-bold rounded-full
        bg-gradient-to-r ${config.gradient}
        text-white shadow-lg ${config.glowColor}
        ${sizeClasses}
        ${config.animation}
      `}
      style={{
        backgroundSize: '200% 100%',
      }}
    >
      <Icon className={`${iconSize} flex-shrink-0`} />
      <span className="tracking-wide uppercase leading-none">{config.label}</span>
    </span>
  );

  if (variant === 'inline') {
    return <div className={`inline-flex ${className}`}>{badge}</div>;
  }

  return (
    <div className={`absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-10 flex flex-col gap-1 ${className}`}>
      {badge}
    </div>
  );
}
