import { getBoostPlanEmoji } from '@/lib/boost-config';

interface PromotedBadgeProps {
  boostType: string | null | undefined;
  badgeIcon?: string | null;
  className?: string;
}

export default function PromotedBadge({ boostType, badgeIcon, className = '' }: PromotedBadgeProps) {
  const emoji = getBoostPlanEmoji(boostType);
  return (
    <span
      className={`inline-flex items-center justify-center text-sm leading-none ${className}`}
      aria-label="Promoted ad"
    >
      {emoji}
    </span>
  );
}
