'use client';

import { getBoostConfig, getBoostPlanEmoji } from '@/lib/boost-config';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  boostType?: string | null;
  badgeIcon?: string | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'badge';
  className?: string;
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  basic:    { bg: 'bg-amber-50',    text: 'text-amber-800',    border: 'border-amber-200' },
  standard: { bg: 'bg-blue-50',     text: 'text-blue-800',     border: 'border-blue-200' },
  premium:  { bg: 'bg-purple-50',   text: 'text-purple-800',   border: 'border-purple-200' },
  platinum: { bg: 'bg-indigo-50',   text: 'text-indigo-800',   border: 'border-indigo-200' },
  gold:     { bg: 'bg-yellow-50',   text: 'text-yellow-800',   border: 'border-yellow-200' },
};

const sizeClasses: Record<string, string> = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
  md: 'text-xs px-2 py-1 gap-1',
  lg: 'text-sm px-3 py-1.5 gap-1.5',
};

const emojiSize: Record<string, string> = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
};

export default function PremiumBadge({ boostType, badgeIcon, size = 'sm', variant = 'badge', className }: PremiumBadgeProps) {
  if (!boostType) return null;

  const config = getBoostConfig(boostType);
  const emoji = badgeIcon || getBoostPlanEmoji(boostType);
  const colors = colorMap[boostType] || colorMap.basic;

  if (variant === 'inline') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium leading-none',
          colors.text,
          className,
        )}
        aria-label={`${config?.name || 'Boosted'} ad`}
      >
        <span className="text-sm leading-none">{emoji}</span>
        <span>{config?.name || 'Promoted'}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold leading-none shadow-sm',
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size],
        'backdrop-blur-sm',
        className,
      )}
      aria-label={`${config?.name || 'Boosted'} ad`}
    >
      <span className={emojiSize[size]}>{emoji}</span>
      <span>{config?.name || 'Promoted'}</span>
    </span>
  );
}
