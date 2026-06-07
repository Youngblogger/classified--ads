'use client';

import { memo } from 'react';
import { CheckCircle, Clock, Shield, Zap, Star } from 'lucide-react';

type BadgeVariant = 'complete' | 'verified' | 'fast-responder' | 'recently-active' | 'top-rated';

const BADGE_CONFIG: Record<BadgeVariant, { icon: typeof CheckCircle; label: string; colors: string }> = {
  complete: {
    icon: CheckCircle,
    label: 'Complete Listing',
    colors: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  verified: {
    icon: Shield,
    label: 'Verified Seller',
    colors: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  'fast-responder': {
    icon: Zap,
    label: 'Fast Responder',
    colors: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  'recently-active': {
    icon: Clock,
    label: 'Recently Active',
    colors: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  'top-rated': {
    icon: Star,
    label: 'Top Rated',
    colors: 'bg-purple-50 text-purple-700 border-purple-200',
  },
};

interface QualityBadgeProps {
  variant: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

function QualityBadgeComponent({ variant, size = 'sm', className = '' }: QualityBadgeProps) {
  const config = BADGE_CONFIG[variant];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium border rounded-full ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} ${config.colors} ${className}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
}

export const QualityBadge = memo(QualityBadgeComponent);
