import React from 'react';
import { getBoostPlan } from '@/lib/boost-config';

export function CrownIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19l1-11 4 3 3-6 3 6 4-3 1 11z"/>
      <path d="M4 19h16"/>
    </svg>
  );
}

export function ShieldIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 4v6c0 4-3.5 7-8 9-4.5-2-8-5-8-9V7z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}

export function DiamondIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 8-8 12-8-12z"/>
      <path d="M2 10h20"/>
      <path d="M12 2v20"/>
    </svg>
  );
}

export function ZapIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/>
    </svg>
  );
}

const BADGE_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  zap: ZapIcon,
  crown: CrownIcon,
  diamond: DiamondIcon,
};

const PLAN_NAME_MAP: Record<string, React.FC<{ className?: string }>> = {
  gold: CrownIcon,
  platinum: ShieldIcon,
  diamond: DiamondIcon,
};

interface BoostPlanIconProps {
  badgeIcon?: string | null;
  boostType?: string | null;
  className?: string;
}

export function BoostPlanIcon({ badgeIcon, boostType, className = '' }: BoostPlanIconProps) {
  const Icon = badgeIcon
    ? BADGE_ICON_MAP[badgeIcon]
    : null;

  if (Icon) {
    return <Icon className={className} />;
  }

  if (boostType) {
    const plan = getBoostPlan(boostType);
    const FallbackIcon = plan ? PLAN_NAME_MAP[plan] : null;
    if (FallbackIcon) {
      return <FallbackIcon className={className} />;
    }
  }

  return null;
}
