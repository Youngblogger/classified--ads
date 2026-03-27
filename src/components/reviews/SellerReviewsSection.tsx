'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Loader2, BadgeCheck } from 'lucide-react';
import { sellerReviewsApi } from '@/lib/api';
import WriteReviewModal from './WriteReviewModal';
import { useAuthStore, useUIStore } from '@/lib/store';

interface Review {
  id: number;
  seller_id: number;
  reviewer_id: number;
  reviewer?: {
    id?: number;
    name?: string;
    avatar?: string;
    google_avatar?: string;
    facebook_avatar?: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  rating?: number;
  comment?: string;
  is_verified_buyer?: boolean;
  helpful_count?: number;
  created_at?: string;
}

interface SellerRating {
  average_rating?: number;
  total_reviews?: number;
}

interface SellerReviewsSectionProps {
  sellerId?: number | string;
  sellerName?: string;
  sellerAvatar?: string;
}

function StarRating({ rating = 0, size = 'sm' }: { rating?: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 14, md: 16, lg: 20 };
  const s = sizes[size];
  const safeRating = typeof rating === 'number' ? rating : 0;
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={s}
          height={s}
          viewBox="0 0 24 24"
          className={star <= safeRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'N/A';
  }
}

function getSafeString(value: any): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

export default function SellerReviewsSection({ 
  sellerId, 
  sellerName,
  sellerAvatar
}: SellerReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<SellerRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { toggleLoginModal } = useUIStore();

  useEffect(() => {
    const numericId = typeof sellerId === 'string' ? parseInt(sellerId, 10) : sellerId;
    if (!numericId || isNaN(numericId)) {
      setLoading(false);
      return;
    }
    
    fetchData(numericId);
  }, [sellerId]);

  const fetchData = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const [reviewsRes, ratingRes] = await Promise.allSettled([
        sellerReviewsApi.getLatestReviews(id),
        sellerReviewsApi.getRatingSummary(id)
      ]);
      
      if (reviewsRes.status === 'fulfilled') {
        const responseData = reviewsRes.value.data;
        let reviewsData = [];
        
        if (Array.isArray(responseData)) {
          reviewsData = responseData;
        } else if (responseData && Array.isArray(responseData.data)) {
          reviewsData = responseData.data;
        } else if (responseData && Array.isArray(responseData.reviews)) {
          reviewsData = responseData.reviews;
        }
        
        setReviews(reviewsData);
      }
      
      if (ratingRes.status === 'fulfilled') {
        setRating(ratingRes.value.data || null);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      toggleLoginModal();
      return;
    }
    setShowWriteReview(true);
  };

  const handleReviewSuccess = () => {
    const numericId = typeof sellerId === 'string' ? parseInt(sellerId, 10) : sellerId;
    if (numericId) {
      fetchData(numericId);
    }
    setShowWriteReview(false);
  };

  if (sellerId === undefined || sellerId === null) {
    return null;
  }

  const numericId = typeof sellerId === 'string' ? parseInt(sellerId, 10) : sellerId;
  const reviewsArray = Array.isArray(reviews) ? reviews : [];
  const displayReviews = reviewsArray.slice(0, 3);
  const avgRating = typeof rating?.average_rating === 'number' ? rating.average_rating : 0;
  const totalReviews = typeof rating?.total_reviews === 'number' ? rating.total_reviews : 0;

  return (
    <div className="space-y-4">
      {/* Header with Rating Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-dark">{avgRating.toFixed(1)}</span>
            <StarRating rating={Math.round(avgRating)} size="lg" />
          </div>
          <div className="text-sm text-gray-500">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>
        <Link 
          href={`/seller/${sellerId}/reviews`}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View All
        </Link>
      </div>

      {/* Write Review Button */}
      <button
        onClick={handleWriteReview}
        className="w-full py-2 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 border-2 border-amber-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Star className="w-4 h-4" />
        Write a Review
      </button>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-2 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500 text-sm">
          {error}
        </div>
      ) : reviewsArray.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Star className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayReviews.map((review) => {
            const reviewerName = getSafeString(review.reviewer?.name) || 'Anonymous';
            const reviewerInitial = reviewerName.charAt(0).toUpperCase();
            const reviewRating = typeof review.rating === 'number' ? review.rating : 0;
            const reviewComment = getSafeString(review.comment) || 'No comment';
            
            return (
              <div 
                key={review.id || Math.random()}
                className={`bg-gray-50 rounded-xl p-3 ${
                  review.is_verified_buyer ? 'border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-xs">
                        {reviewerInitial}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-dark text-sm">{reviewerName}</span>
                        {review.is_verified_buyer && (
                          <BadgeCheck className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <StarRating rating={reviewRating} size="sm" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {reviewComment}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Reviews Button */}
      {reviewsArray.length > 3 && (
        <Link
          href={`/seller/${sellerId}/reviews`}
          className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors text-center"
        >
          View All {reviewsArray.length} Reviews
        </Link>
      )}

      {/* Write Review Modal */}
      {showWriteReview && (
        <WriteReviewModal
          sellerId={Number(sellerId)}
          sellerName={sellerName || 'this seller'}
          isOpen={showWriteReview}
          onClose={() => setShowWriteReview(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
