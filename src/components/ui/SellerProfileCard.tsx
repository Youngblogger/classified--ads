'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, UserPlus, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { followApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface SellerProfileCardProps {
  seller: {
    id?: number;
    name: string;
    profile_image?: string | null;
    avatar?: string | null;
    avatar_url?: string | null;
    full_avatar_url?: string | null;
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
    phone?: string | null;
    location?: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
  showHoverEffect?: boolean;
  showFollowButton?: boolean;
  showJoinedDate?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
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

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';

function getProfileImage(seller: SellerProfileCardProps['seller']): string | null {
  // Try all possible avatar sources - match header order
  const imageSources = [
    seller.full_avatar_url,
    seller.avatar_url,
    seller.avatar,
    seller.google_avatar,
    seller.facebook_avatar,
  ];
  
  const image = imageSources.find(img => img && typeof img === 'string' && img.trim() !== '');
  if (!image) return null;
  
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  if (image.startsWith('/storage/')) {
    return `${BACKEND_URL}${image}`;
  }
  // Handle case where it's just a filename like "avatars/xxx.jpg"
  return `${BACKEND_URL}/storage/${image}`;
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
      className="bg-primary-500 text-white font-bold flex items-center justify-center rounded-full"
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
  showPhone = true,
  showLocation = true,
  className = ''
}: SellerProfileCardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(seller.is_following || false);
  const [followersCount, setFollowersCount] = useState(seller.followers_count || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
    const isOwnProfile = user?.id === seller.id;
  const profileImage = getProfileImage(seller);
  const joinedDate = seller.joined_date || formatDate(seller.created_at || seller.member_since);
  
  const sizes = {
    sm: { image: 36, name: 13, title: 12, date: 10 },
    md: { image: 45, name: 15, title: 14, date: 12 },
    lg: { image: 56, name: 16, title: 15, date: 13 },
  };
  
  const currentSizes = sizes[size];

  useEffect(() => {
    if (seller.id && isAuthenticated) {
      followApi.getUserStats(seller.id)
        .then(res => {
          setIsFollowing(res.data.is_following);
          setFollowersCount(res.data.followers_count);
        })
        .catch(console.error)
        .finally(() => setIsInitializing(false));
    } else {
      setIsInitializing(false);
    }
  }, [seller.id, isAuthenticated]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow sellers');
      return;
    }
    
    if (!seller.id || seller.id === 0) {
      toast.error('Invalid seller');
      return;
    }
    
    if (isOwnProfile) {
      toast.error("You can't follow yourself");
      return;
    }
    
    // If already following, do nothing (cannot unfollow)
    if (isFollowing) {
      return;
    }

    setIsLoading(true);
    
    try {
      await followApi.follow(seller.id);
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      toast.success(`You're now following ${seller.name}`);
    } catch (error: any) {
      console.error('Follow error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to follow';
      toast.error(errorMsg);
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
          {/* Line 1: Name + Verified Badge + Follow Button */}
          <div className="flex items-center gap-4 sm:gap-3 min-w-0">
            <span
              className="font-bold text-dark truncate"
              style={{ fontSize: currentSizes.name, maxWidth: '160px' }}
            >
              {seller.name || 'Unknown Seller'}
            </span>
            {(seller.is_verified || seller.verified) && <VerifiedBadge size={size === 'sm' ? 'sm' : 'md'} />}
            <span className="text-xs text-gray-300 flex-shrink-0">|</span>
            
            {showFollowButton && seller.id && (
              <button
                onClick={handleFollow}
                disabled={isLoading || isInitializing || isOwnProfile}
                className={`
                  flex items-center gap-1 px-2 sm:px-3 py-0.5 rounded-full text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex-shrink-0
                  ${isFollowing 
                    ? 'bg-accent-600 text-white border-2 border-accent-600 cursor-default' 
                    : 'bg-[#E5E7EB] text-gray-800 hover:bg-accent-600 hover:text-white border-2 border-gray-400'
                  }
                  ${(isLoading || isInitializing) ? 'opacity-70 cursor-wait' : isFollowing ? '' : 'cursor-pointer'}
                `}
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* Line 2: Followers count */}
          <div className="flex items-center gap-x-3 gap-y-1 mt-1">
            <span className="text-xs text-gray-500">
              {followersCount > 0 ? formatFollowers(followersCount) : '0 followers'}
            </span>
          </div>
          
          {/* Rating (if available) */}
          {seller.rating !== undefined && seller.rating > 0 && (
            <div className="mt-1">
              <StarRating rating={seller.rating} size={size === 'lg' ? 'md' : 'sm'} />
            </div>
          )}
          
          {/* Joined Date with Location */}
          {showJoinedDate && (
            <div className="text-xs text-gray-400 mt-1">
              {seller.location && <span>{seller.location}</span>}
              {seller.location && <span className="mx-1">·</span>}
              <span>Joined {joinedDate}</span>
            </div>
          )}
          
          {/* Location */}
          {showLocation && seller.location && (
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {seller.location}
            </div>
          )}
          
          {/* Phone */}
          {showPhone && seller.phone && (
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {seller.phone}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
