'use client';

import { getBoostPlan, getBoostPlanLabel } from '@/lib/boost-config';

interface PremiumBadgeProps {
  boostType: string | null | undefined;
  badgeIcon?: string | null;
  size?: 'sm' | 'md';
  className?: string;
  variant?: 'absolute' | 'inline';
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'text-[11px] px-[7px] py-[2px] gap-[4px]',
  md: 'text-xs px-2 py-[3px] gap-[5px]',
};

export default function PremiumBadge({ boostType, badgeIcon, size = 'sm', className = '', variant = 'absolute' }: PremiumBadgeProps) {
  const plan = getBoostPlan(boostType);
  if (!plan) return null;

  const label = getBoostPlanLabel(boostType);

  const pill = (
    <div className={`boost-pill ${plan} ${SIZE_CLASSES[size]} ${className}`}>
      <span className="font-medium leading-none whitespace-nowrap">{label}</span>
    </div>
  );

  if (variant === 'inline') return pill;

  return <div className="absolute top-2 left-2 z-10">{pill}</div>;
}
