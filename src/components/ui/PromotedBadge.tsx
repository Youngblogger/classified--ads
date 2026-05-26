import { BoostPlanIcon } from '@/lib/boost-icons';

interface PromotedBadgeProps {
  boostType: string | null | undefined;
  badgeIcon?: string | null;
  className?: string;
}

export default function PromotedBadge({ boostType, badgeIcon, className = '' }: PromotedBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      aria-label="Promoted ad"
    >
      <BoostPlanIcon badgeIcon={badgeIcon} boostType={boostType} className="w-3 h-3" />
    </span>
  );
}
