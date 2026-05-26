'use client';

import { getBoostPlan } from '@/lib/boost-config';
import { BoostPlanIcon } from '@/lib/boost-icons';

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

  const pill = (
    <div className={`boost-pill ${plan} ${SIZE_CLASSES[size]} ${className}`}>
      <span className="boost-icon">
        <BoostPlanIcon badgeIcon={badgeIcon} boostType={boostType} className="w-3.5 h-3.5" />
      </span>
      <span className="font-medium leading-none whitespace-nowrap">{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
    </div>
  );

  if (variant === 'inline') return pill;

  return <div className="absolute top-2 left-2 z-10">{pill}</div>;
}
