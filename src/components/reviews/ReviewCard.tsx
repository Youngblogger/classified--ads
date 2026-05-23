'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, User, CheckCircle, Heart } from 'lucide-react';
import axios from 'axios';
import { getAuthToken } from '@/lib/cookies';
import VerifiedSellerBadge from '@/components/verification/VerifiedSellerBadge';
import BusinessVerifiedBadge from '@/components/verification/BusinessVerifiedBadge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface Review {
  id: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  is_verified?: boolean;
  helpful_count?: number;
  like_count?: number;
  is_liked_by_user?: boolean;
  created_at: string;
}

interface ReviewCardProps {
  review: Review;
  onReport: () => void;
}

function formatLikeCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toString();
}

export default function ReviewCard({ review, onReport }: ReviewCardProps) {
  const [likeCount, setLikeCount] = useState(review.like_count ?? 0);
  const [isLiked, setIsLiked] = useState(review.is_liked_by_user ?? false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const handleLike = async () => {
    const token = getAuthToken();
    if (!token) {
      alert('Please login to like this review');
      return;
    }

    if (isLikeLoading) return;
    setIsLikeLoading(true);

    const wasLiked = isLiked;
    
    setIsLiked(!wasLiked);
    setLikeCount((prev) => wasLiked ? prev - 1 : prev + 1);

    try {
      if (wasLiked) {
        await axios.delete(`${API_URL}/reviews/${review.id}/like`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/reviews/${review.id}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setIsLiked(wasLiked);
      setLikeCount((prev) => wasLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {review.user.avatar ? (
            <Image
              src={review.user.avatar}
              alt={review.user.name}
              width={48}
              height={48}
              className="rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-dark">{review.user.name}</span>
            {(review.user as any).is_verified_seller && <VerifiedSellerBadge size="sm" />}
            {(review.user as any).is_verified_business && <BusinessVerifiedBadge size="sm" />}
            {review.is_verified && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" />
                Verified Buyer
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
            <span className="text-sm text-gray-400 ml-1">{review.rating}</span>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-gray-600 text-sm mb-3">{review.comment}</p>
          )}

          {/* Date */}
          <p className="text-xs text-gray-400 mb-3">{formatDate(review.created_at)}</p>

          {/* Actions - Only Like button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={isLikeLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isLiked
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
              } ${isLikeLoading ? 'opacity-50 cursor-wait' : ''}`}
            >
              <Heart 
                className="w-4 h-4" 
                fill={isLiked ? "currentColor" : "none"}
              />
              {likeCount > 0 && (
                <span className="text-xs">
                  {formatLikeCount(likeCount)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
