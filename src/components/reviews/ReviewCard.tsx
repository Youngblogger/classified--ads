'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Star, User, CheckCircle, ThumbsUp } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import { getReviewDisplayName, normalizeReviewerName } from '@/lib/reviewerName';
import VerifiedSellerBadge from '@/components/verification/VerifiedSellerBadge';
import BusinessVerifiedBadge from '@/components/verification/BusinessVerifiedBadge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface Review {
  id: number;
  user: {
    id: number;
    name: string;
    review_display_name?: string | null;
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
  const [animating, setAnimating] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user } = useAuthStore();
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleLike = async () => {
    if (!user?.id) {
      alert('Please login to like this review');
      return;
    }

    if (isLikeLoading) return;
    setIsLikeLoading(true);

    const wasLiked = isLiked;

    setIsLiked(!wasLiked);
    setLikeCount((prev) => wasLiked ? prev - 1 : prev + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    try {
      const likeName = normalizeReviewerName(user.name) === 'Anonymous User' ? undefined : user.name;
      await axios.post(`${API_URL}/reviews/${review.id}/like`, {
        user_id: user.id,
        user_name: likeName,
      });
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
    <>
      <style jsx>{`
        @keyframes like-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        .like-animating svg {
          animation: like-pop 0.3s ease-out;
        }
      `}</style>
      <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {review.user.avatar && !imgError ? (
            <Image
              src={review.user.avatar}
              alt={getReviewDisplayName(review.user)}
              width={48}
              height={48}
              className="rounded-full object-cover"
              unoptimized
              onError={() => setImgError(true)}
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
            <span className="font-semibold text-dark">{getReviewDisplayName(review.user)}</span>
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

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              ref={btnRef}
              onClick={handleLike}
              disabled={isLikeLoading}
              className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 ${
                isLiked
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              } ${isLikeLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'} ${animating ? 'like-animating' : ''}`}
            >
              <ThumbsUp
                className={`w-[18px] h-[18px] transition-all duration-200 ${
                  isLiked ? 'fill-blue-600' : 'fill-transparent group-hover:fill-blue-600/20'
                }`}
              />
              <span className={`tabular-nums ${likeCount > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                {formatLikeCount(likeCount)}
              </span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
