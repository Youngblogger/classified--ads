'use client';

import VerifiedSellerBadge from './VerifiedSellerBadge';
import BusinessVerifiedBadge from './BusinessVerifiedBadge';

interface VerificationBadgeProps {
  type: 'seller' | 'business';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function VerificationBadge({ type, showLabel, size, className }: VerificationBadgeProps) {
  if (type === 'business') {
    return <BusinessVerifiedBadge showLabel={showLabel} size={size} className={className} />;
  }
  return <VerifiedSellerBadge showLabel={showLabel} size={size} className={className} />;
}
