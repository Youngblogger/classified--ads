import { getBoostPlan } from '@/lib/boost-config';

interface PromotedBadgeProps {
  boostType: string | null | undefined;
  className?: string;
}

export default function PromotedBadge({ boostType, className = '' }: PromotedBadgeProps) {
  const plan = getBoostPlan(boostType);
  if (!plan) return null;

  return (
    <span
      className={`premium-badge inline-flex items-center justify-center ${className}`}
      aria-label="Promoted ad"
    >
      💎
    </span>
  );
}
