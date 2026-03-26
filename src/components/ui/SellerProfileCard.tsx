'use client';

import { CheckCircle } from 'lucide-react';

interface SellerProfileCardProps {
  seller: {
    name: string;
    profile_image?: string | null;
    avatar?: string | null;
    google_avatar?: string | null;
    facebook_avatar?: string | null;
    is_verified?: boolean;
    title?: string;
    joined_date?: string;
    created_at?: string;
    member_since?: string;
    rating?: number;
    total_reviews?: number;
  };
  size?: 'sm' | 'md' | 'lg';
  showHoverEffect?: boolean;
  className?: string;
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getProfileImage(seller: SellerProfileCardProps['seller']): string | null {
  const image = seller.profile_image || seller.avatar || seller.google_avatar || seller.facebook_avatar;
  if (!image) return null;
  
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  if (image.startsWith('/storage/')) {
    return `http://127.0.0.1:8000${image}`;
  }
  return `http://127.0.0.1:8000/storage/${image}`;
}

function VerifiedBadge({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };
  
  return (
    <svg
      width={sizes[size]}
      height={sizes[size]}
      viewBox="0 0 24 24"
      fill="none"
      className="flex-shrink-0"
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
        fill="#1d9bf0"
      />
    </svg>
  );
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizes = { sm: 12, md: 14 };
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          width={sizes[size]}
          height={sizes[size]}
          viewBox="0 0 24 24"
          className={i < fullStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function SellerInitials({ name, size = 45 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  const fontSize = size * 0.4;
  
  return (
    <div
      className="bg-primary-500 text-white font-bold flex items-center justify-center"
      style={{ width: size, height: size, fontSize }}
    >
      {initials}
    </div>
  );
}

export default function SellerProfileCard({
  seller,
  size = 'md',
  showHoverEffect = true,
  className = ''
}: SellerProfileCardProps) {
  const profileImage = getProfileImage(seller);
  const joinedDate = seller.joined_date || formatDate(seller.created_at || seller.member_since);
  
  const sizes = {
    sm: { image: 36, name: 13, title: 12, date: 10 },
    md: { image: 45, name: 15, title: 14, date: 12 },
    lg: { image: 56, name: 16, title: 15, date: 13 },
  };
  
  const currentSizes = sizes[size];

  return (
    <div
      className={`
        flex items-center justify-between
        bg-white rounded-xl border border-gray-100
        ${showHoverEffect ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {/* Left side - Profile image and name */}
      <div className="flex items-center gap-3">
        {/* Profile Image */}
        <div className="relative flex-shrink-0">
          {profileImage ? (
            <img
              src={profileImage}
              alt={seller.name}
              className="rounded-full object-cover border-2 border-gray-100"
              style={{ width: currentSizes.image, height: currentSizes.image }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={profileImage ? 'hidden' : ''}>
            <SellerInitials name={seller.name || 'U'} size={currentSizes.image} />
          </div>
        </div>
        
        {/* Name and Verified Badge */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className="font-bold text-dark"
              style={{ fontSize: currentSizes.name }}
            >
              {seller.name || 'Unknown Seller'}
            </span>
            {seller.is_verified && <VerifiedBadge size={size === 'sm' ? 'sm' : 'md'} />}
          </div>
          
          {/* Rating (if available) */}
          {seller.rating !== undefined && seller.rating > 0 && (
            <StarRating rating={seller.rating} size={size === 'lg' ? 'md' : 'sm'} />
          )}
        </div>
      </div>
      
      {/* Right side - Title and Joined Date */}
      <div className="flex flex-col items-end text-right">
        {seller.title && (
          <span
            className="font-medium text-gray-700"
            style={{ fontSize: currentSizes.title }}
          >
            {seller.title}
          </span>
        )}
        <span
          className="text-gray-400"
          style={{ fontSize: currentSizes.date }}
        >
          Joined {joinedDate}
        </span>
        {seller.total_reviews !== undefined && seller.total_reviews > 0 && (
          <span className="text-xs text-gray-400 mt-0.5">
            {seller.total_reviews} reviews
          </span>
        )}
      </div>
    </div>
  );
}
