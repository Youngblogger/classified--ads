'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Star, Loader2, MessageCircle, BadgeCheck, ThumbsUp, Flag, ChevronRight } from 'lucide-react';
import { sellerReviewsApi } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';

interface Review {
  id: number;
  seller_id: number;
  reviewer_id: number;
  reviewer: {
    id: number;
    name: string;
    avatar?: string;
    google_avatar?: string;
    facebook_avatar?: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  rating: number;
  comment: string;
  is_verified_buyer: boolean;
  helpful_count: number;
  is_helpful?: boolean;
  created_at: string;
  updated_at: string;
}

interface SellerRating {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface SellerReviewsSectionProps {
  sellerId: number;
  sellerName: string;
  sellerAvatar?: string;
  showFullSection?: boolean;
  onShowAllReviews?: () => void;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 14, md: 16, lg: 20 };
  const s = sizes[size];
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={s}
          height={s}
          viewBox="0 0 24 24"
          className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review, size = 'md' }: { review: Review; size?: 'sm' | 'md' }) {
  const [helpfulLoading, setHelpfulLoading] = useState(false);

  const handleHelpful = async () => {
    if (review.is_helpful) return;
    setHelpfulLoading(true);
    try {
      await sellerReviewsApi.markHelpful(review.id);
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    } finally {
      setHelpfulLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-${size === 'sm' ? '3' : '4'} ${
      review.is_verified_buyer ? 'border-l-4 border-l-green-500' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          {/* Reviewer Avatar */}
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {review.reviewer.avatar_url || review.reviewer.avatar || review.reviewer.google_avatar || review.reviewer.facebook_avatar ? (
              <img 
                src={review.reviewer.avatar_url || review.reviewer.avatar || review.reviewer.google_avatar || ''}
                alt={review.reviewer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary-600 font-bold text-sm">
                {review.reviewer.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-dark text-sm">{review.reviewer.name}</span>
              {review.is_verified_buyer && (
                <BadgeCheck className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={review.rating} size="sm" />
              {review.is_verified_buyer && (
                <span className="text-xs text-green-600 font-medium">Verified Buyer</span>
              )}
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {formatRelativeTime(review.created_at)}
        </span>
      </div>

      {/* Review Text */}
      <p className={`text-gray-600 ${size === 'sm' ? 'text-sm' : 'text-sm leading-relaxed'}`}>
        {review.comment}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={handleHelpful}
          disabled={helpfulLoading || review.is_helpful}
          className={`flex items-center gap-1.5 text-xs ${
            review.is_helpful 
              ? 'text-primary-600' 
              : 'text-gray-400 hover:text-primary-600'
          } transition-colors`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${review.is_helpful ? 'fill-primary-600' : ''}`} />
          <span>Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}</span>
        </button>
      </div>
    </div>
  );
}

export default function SellerReviewsSection({ 
  sellerId, 
  sellerName,
  sellerAvatar,
  showFullSection = false,
  onShowAllReviews
}: SellerReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<SellerRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [writeReviewLoading, setWriteReviewLoading] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchRating();
  }, [sellerId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await sellerReviewsApi.getLatestReviews(sellerId);
      setReviews(response.data.reviews || response.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRating = async () => {
    try {
      const response = await sellerReviewsApi.getRatingSummary(sellerId);
      setRating(response.data);
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (reviewData.rating === 0) return;
    
    try {
      setSubmitting(true);
      await sellerReviewsApi.submitReview(sellerId, {
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      setShowWriteReview(false);
      setReviewData({ rating: 0, comment: '' });
      fetchReviews();
      fetchRating();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const displayReviews = showFullSection ? reviews : reviews.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Header with Rating Summary */}
      {rating && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-dark">{rating.average_rating.toFixed(1)}</span>
              <StarRating rating={Math.round(rating.average_rating)} size="lg" />
            </div>
            <div className="text-sm text-gray-500">
              {rating.total_reviews} {rating.total_reviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>
          <Link 
            href={`/seller/${sellerId}/reviews`}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Write Review Button */}
      <button
        onClick={() => setShowWriteReview(true)}
        className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 border-2 border-amber-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
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
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No reviews yet</p>
          <p className="text-sm">Be the first to review this seller!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayReviews.map((review) => (
            <ReviewCard key={review.id} review={review} size={showFullSection ? 'md' : 'sm'} />
          ))}
        </div>
      )}

      {/* View All Reviews Button */}
      {!showFullSection && reviews.length > 3 && (
        <Link
          href={`/seller/${sellerId}/reviews`}
          className="block w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors text-center"
        >
          View All {reviews.length} Reviews
        </Link>
      )}

      {/* Write Review Modal */}
      {showWriteReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark">Write a Review</h3>
              <button 
                onClick={() => setShowWriteReview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                {sellerAvatar ? (
                  <img src={sellerAvatar} alt={sellerName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary-600 font-bold">{sellerName?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="font-medium text-dark">{sellerName}</p>
                <p className="text-sm text-gray-500">Seller</p>
              </div>
            </div>

            {/* Rating Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <svg
                      width={32}
                      height={32}
                      viewBox="0 0 24 24"
                      className={star <= reviewData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review (optional)
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                placeholder="Share your experience with this seller..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none resize-none h-32"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitReview}
              disabled={reviewData.rating === 0 || submitting}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
