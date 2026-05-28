'use client';

'use client';

import { BadgeCheck } from 'lucide-react';
import { useState } from 'react';

interface VerifiedSellerBadgeProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function VerifiedSellerBadge({ showLabel = false, size = 'sm', className = '' }: VerifiedSellerBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const iconSize = { sm: 'w-3.5 h-3.5', md: 'w-[18px] h-[18px]', lg: 'w-5 h-5' }[size];
  const textSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-sm' }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 relative ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <BadgeCheck
        className={`${iconSize} text-[#1d9bf0]`}
        style={{ filter: 'drop-shadow(0 0 2px rgba(29,155,240,0.4))' }}
        strokeWidth={2.5}
      />
      {showLabel && <span className={`${textSize} font-semibold text-[#1d9bf0]`}>Verified</span>}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
            Verified Seller
          </div>
        </div>
      )}
    </span>
  );
}
