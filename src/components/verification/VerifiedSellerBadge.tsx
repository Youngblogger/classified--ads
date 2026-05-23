'use client';

import { BadgeCheck } from 'lucide-react';

interface VerifiedSellerBadgeProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function VerifiedSellerBadge({ showLabel = false, size = 'sm', className = '' }: VerifiedSellerBadgeProps) {
  const iconSize = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }[size];
  const textSize = { sm: 'text-xs', md: 'text-xs', lg: 'text-sm' }[size];

  return (
    <span className={`inline-flex items-center gap-1 ${className}`} title="Verified Seller">
      <BadgeCheck className={`${iconSize} text-[#1d9bf0]`} />
      {showLabel && <span className={`${textSize} font-medium text-[#1d9bf0]`}>Verified Seller</span>}
    </span>
  );
}
