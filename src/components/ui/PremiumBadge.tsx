'use client';

import { getBoostPlan } from '@/lib/boost-config';

function CrownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19l1-11 4 3 3-6 3 6 4-3 1 11z"/>
      <path d="M4 19h16"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3l8 4v6c0 4-3.5 7-8 9-4.5-2-8-5-8-9V7z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2l8 8-8 12-8-12z"/>
      <path d="M2 10h20"/>
      <path d="M12 2v20"/>
    </svg>
  );
}

const ICONS: Record<string, React.FC> = {
  gold: CrownIcon,
  platinum: ShieldIcon,
  diamond: DiamondIcon,
};

function BoostIcon({ type }: { type: string }) {
  const Icon = ICONS[type];
  if (!Icon) return null;
  return (
    <span className="boost-icon">
      <Icon />
    </span>
  );
}

interface PremiumBadgeProps {
  boostType: string | null | undefined;
  size?: 'sm' | 'md';
  className?: string;
  variant?: 'absolute' | 'inline';
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'text-[11px] px-[7px] py-[2px] gap-[4px]',
  md: 'text-xs px-2 py-[3px] gap-[5px]',
};

export default function PremiumBadge({ boostType, size = 'sm', className = '', variant = 'absolute' }: PremiumBadgeProps) {
  const plan = getBoostPlan(boostType);
  if (!plan) return null;

  const pill = (
    <div className={`boost-pill ${plan} ${SIZE_CLASSES[size]} ${className}`}>
      <BoostIcon type={plan} />
      <span className="font-medium leading-none whitespace-nowrap">{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
    </div>
  );

  if (variant === 'inline') return pill;

  return <div className="absolute top-2 left-2 z-10">{pill}</div>;
}
