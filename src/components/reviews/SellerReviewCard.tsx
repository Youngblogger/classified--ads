'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, User, CheckCircle, Heart } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store';
import type { SellerReview } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface SellerReviewCardProps {
  review: SellerReview;
  onUpdate?: () => void;
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

export default function SellerReviewCard({ review, onUpdate }: SellerReviewCardProps) {
  const [likeCount, setLikeCount] = useState(review.like_count ?? 0);
  const [isLiked, setIsLiked] = useState(review.is_liked_by_user ?? false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const { isAuthenticated, token } = useAuthStore();

  const getAvatarUrl = (img: any): string => {
    if (!img) return '';
    let url = '';
    if (typeof img === 'string') {
      url = img;
    } else if (typeof img === 'object') {
      url = img.url || img.src || img.avatar || img.google_avatar || img.facebook_avatar || '';
    }
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';
    if (url.startsWith('/storage/')) {
      return `${baseUrl}${url}`;
    }
    return `${baseUrl}/storage/${url}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleLike = async () => {
    if (!isAuthenticated || !token) {
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

  const avatarUrl = getAvatarUrl(review.user?.avatar || review.user?.google_avatar || review.user?.facebook_avatar);

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={review.user?.name || 'User'}
              width={48}
              height={48}
              className="rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#4B5320]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[#4B5320]" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-dark">
                {review.user?.name || 'Anonymous User'}
              </span>
              {review.user?.verified && (
                <span className="flex items-center gap-1 text-xs text-[#4B5320] bg-[#4B5320]/10 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
          </div>

          <div className="flex items-center gap-1 mb-3">
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
            <span className="text-sm text-gray-500 ml-1">{review.rating}/5</span>
          </div>

          {review.comment && (
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">{review.comment}</p>
          )}

          {review.ad && (
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
              <span>Re: {review.ad.title}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
            <button
              onClick={handleLike}
              disabled={isLikeLoading || !isAuthenticated}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isLiked
                  ? 'bg-red-500 text-white'
                  : isAuthenticated
                  ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } ${isLikeLoading ? 'opacity-50 cursor-wait' : ''}`}
              title={!isAuthenticated ? 'Login to like this review' : ''}
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
