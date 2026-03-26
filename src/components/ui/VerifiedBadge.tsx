'use client';

import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  isVerified?: boolean | null;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export default function VerifiedBadge({ 
  isVerified, 
  size = 'md',
  showTooltip = false,
  className = '' 
}: VerifiedBadgeProps) {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const sizeStyles = {
    sm: { fontSize: '10px', padding: '2px' },
    md: { fontSize: '12px', padding: '3px' },
    lg: { fontSize: '14px', padding: '4px' },
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-blue-500 text-white ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: '#1877f2',
        flexShrink: 0,
      }}
      title={showTooltip ? 'Verified Seller' : undefined}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={sizeClasses[size]}
        style={{ padding: sizeStyles[size].padding }}
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    </span>
  );
}

interface SellerNameProps {
  name: string;
  isVerified?: boolean | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SellerName({ name, isVerified, size = 'md', className = '' }: SellerNameProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}>
        {name}
      </span>
      <VerifiedBadge isVerified={isVerified} size={size} />
    </span>
  );
}
