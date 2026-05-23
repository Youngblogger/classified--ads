'use client';

import { Building2 } from 'lucide-react';

interface BusinessVerifiedBadgeProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BusinessVerifiedBadge({ showLabel = false, size = 'sm', className = '' }: BusinessVerifiedBadgeProps) {
  const iconSize = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }[size];
  const textSize = { sm: 'text-xs', md: 'text-xs', lg: 'text-sm' }[size];
  const pillSize = { sm: 'px-2 py-0.5 gap-1', md: 'px-3 py-1 gap-1.5', lg: 'px-4 py-1.5 gap-2' }[size];

  return (
    <span
      className={`inline-flex items-center ${pillSize} bg-amber-50 text-amber-600 rounded-full font-medium ${className}`}
      title="Verified Business"
    >
      <Building2 className={`${iconSize}`} />
      {showLabel && <span className={textSize}>Verified Business</span>}
    </span>
  );
}
