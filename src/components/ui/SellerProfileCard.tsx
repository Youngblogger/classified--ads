'use client';

import { useState } from 'react';
import { CheckCircle, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { followApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface SellerProfileCardProps {
  seller: {
    id?: number;
    name: string;
    profile_image?: string | null;
    avatar?: string | null;
    google_avatar?: string | null;
    facebook_avatar?: string | null;
    is_verified?: boolean;
    verified?: boolean;
    title?: string;
    joined_date?: string;
    created_at?: string;
    member_since?: string;
    rating?: number;
    total_reviews?: number;
    followers_count?: number;
    is_following?: boolean;
    show_joined_date?: boolean;
  };
  size?: 'sm' | 'md' | 'lg';
  showHoverEffect?: boolean;
  showFollowButton?: boolean;
  showJoinedDate?: boolean;
  className?: string;
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatFollowers(count?: number): string {
  if (!count || count === 0) return '0 followers';
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M followers`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K followers`;
  }
  return `${count.toLocaleString()} follower${count === 1 ? '' : 's'}`;
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
  showFollowButton = false,
  showJoinedDate = true,
  className = ''
}: SellerProfileCardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(seller.is_following || false);
  const [followersCount, setFollowersCount] = useState(seller.followers_count || 0);
  const [isLoading, setIsLoading] = useState(false);
  
    const isOwnProfile = user?.id === seller.id;
  const profileImage = getProfileImage(seller);
  const joinedDate = seller.joined_date || formatDate(seller.created_at || seller.member_since);
  
  const sizes = {
    sm: { image: 36, name: 13, title: 12, date: 10 },
    md: { image: 45, name: 15, title: 14, date: 12 },
    lg: { image: 56, name: 16, title: 15, date: 13 },
  };
  
  const currentSizes = sizes[size];

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow sellers');
      return;
    }
    
    if (!seller.id) {
      toast.error('Invalid seller');
      return;
    }
    
    if (isOwnProfile) {
      toast.error("You can't follow yourself");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await followApi.follow(seller.id);
      setIsFollowing(response.data.is_following);
      setFollowersCount(response.data.followers_count);
      
      if (response.data.is_following) {
        toast.success(`You're now following ${seller.name}`);
      } else {
        toast.success(`Unfollowed ${seller.name}`);
      }
    } catch (error: any) {
      console.error('Follow error:', error);
      toast.error(error.response?.data?.message || 'Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-100 p-3 sm:p-4
        ${showHoverEffect ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      <div className="flex items-start gap-2 sm:gap-3">
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
        
        {/* Right side - Name and Follow button */}
        <div className="flex-1 min-w-0">
          {/* Line 1: Name + Verified Badge */}
          <div className="flex items-center gap-1">
            <span
              className="font-bold text-dark truncate"
              style={{ fontSize: currentSizes.name }}
            >
              {seller.name || 'Unknown Seller'}
            </span>
            {(seller.is_verified || seller.verified) && <VerifiedBadge size={size === 'sm' ? 'sm' : 'md'} />}
          </div>
          
          {/* Line 2: Followers count (left) + Follow button (right) */}
          <div className="flex items-center mt-1">
            {followersCount > 0 ? (
              <span className="text-xs text-gray-500">
                {formatFollowers(followersCount)}
              </span>
            ) : (
              <span className="text-xs text-gray-500">0 followers</span>
            )}
            
            {showFollowButton && seller.id && !isOwnProfile && (
              <button
                onClick={handleFollow}
                disabled={isLoading}
                className={`
                  flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ml-[10px] sm:ml-[15px]
                  ${isFollowing 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300' 
                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow'
                  }
                  ${isLoading ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
                `}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* Rating (if available) */}
          {seller.rating !== undefined && seller.rating > 0 && (
            <div className="mt-1">
              <StarRating rating={seller.rating} size={size === 'lg' ? 'md' : 'sm'} />
            </div>
          )}
          
          {/* Joined Date */}
          {showJoinedDate && (
            <div className="text-xs text-gray-400 mt-1">
              Joined {joinedDate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
