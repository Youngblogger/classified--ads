import { getBoostConfig, getBoostPlanEmoji } from '@/lib/boost-config';
import { cn } from '@/lib/utils';

interface PromotedBadgeProps {
  boostType: string | null | undefined;
  badgeIcon?: string | null;
  className?: string;
}

const colorMap: Record<string, string> = {
  basic:    'text-amber-600',
  standard: 'text-blue-600',
  premium:  'text-purple-600',
  platinum: 'text-indigo-600',
  gold:     'text-yellow-600',
};

export default function PromotedBadge({ boostType, badgeIcon, className = '' }: PromotedBadgeProps) {
  if (!boostType) return null;

  const config = getBoostConfig(boostType);
  const emoji = badgeIcon || getBoostPlanEmoji(boostType);
  const color = colorMap[boostType] || 'text-amber-600';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        color,
        className,
      )}
      aria-label="Promoted ad"
    >
      <span className="text-sm leading-none">{emoji}</span>
      <span>{config?.name || 'Promoted'}</span>
    </span>
  );
}
