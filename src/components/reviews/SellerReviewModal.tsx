'use client';

import { useState, useEffect } from 'react';
import { Star, X, Loader2, MessageCircle } from 'lucide-react';
import { sellerReviewsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { CanReviewResponse, SellerReview } from '@/types';

interface SellerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: number;
  sellerName: string;
  adId?: number;
  onSuccess?: () => void;
}

export default function SellerReviewModal({
  isOpen,
  onClose,
  sellerId,
  sellerName,
  adId,
  onSuccess,
}: SellerReviewModalProps) {
  const { isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canReview, setCanReview] = useState<CanReviewResponse | null>(null);
  const [loadingPermission, setLoadingPermission] = useState(true);
  const [existingReview, setExistingReview] = useState<SellerReview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      checkPermission();
      loadExistingReview();
    }
  }, [isOpen, isAuthenticated, sellerId]);

  const checkPermission = async () => {
    setLoadingPermission(true);
    try {
      const response = await sellerReviewsApi.canReview(sellerId);
      setCanReview(response.data);
    } catch (error) {
      console.error('Error checking review permission:', error);
      setCanReview({ allowed: false, reason: 'Unable to check review permissions', requires: [] });
    } finally {
      setLoadingPermission(false);
    }
  };

  const loadExistingReview = async () => {
    try {
      const response = await sellerReviewsApi.getMyReview(sellerId);
      if (response.data && response.data.review) {
        setExistingReview(response.data.review);
        setRating(response.data.review.rating);
        setComment(response.data.review.comment || '');
      }
    } catch (error) {
      console.error('Error loading existing review:', error);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const data = {
        rating,
        comment: comment.trim() || undefined,
        ad_id: adId,
      };

      if (existingReview) {
        await sellerReviewsApi.updateReview(existingReview.id, data);
      } else {
        await sellerReviewsApi.submitReview(sellerId, data);
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      setError(error.response?.data?.error || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-fade-in">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-dark">
                {existingReview ? 'Edit Your Review' : 'Write a Review'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Review for {sellerName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loadingPermission ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#4B5320] animate-spin" />
            </div>
          ) : !isAuthenticated ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-dark mb-2">Login Required</h3>
              <p className="text-sm text-gray-500 mb-4">
                Please login to write a review for this seller.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#4B5320] text-white rounded-lg hover:bg-[#3d4220] transition-colors"
              >
                Close
              </button>
            </div>
          ) : !canReview || !canReview.allowed ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-dark mb-2">Cannot Review Yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                {canReview?.reason || 'You cannot review this seller at this time.'}
              </p>
              {canReview?.requires && canReview.requires.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-xs text-gray-500 mb-2">To review this seller, you need to:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {canReview.requires.includes('chatted') && (
                      <li className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#4B5320] text-white rounded-full flex items-center justify-center text-xs">1</span>
                        Start a conversation with this seller
                      </li>
                    )}
                  </ul>
                </div>
              )}
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                  {rating === 0 && 'Tap to rate'}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this seller..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B5320]/30 focus:border-[#4B5320] resize-none"
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {comment.length}/1000
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {isAuthenticated && canReview?.allowed && (
          <div className="p-5 border-t border-gray-100">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="flex-1 px-4 py-3 bg-[#4B5320] text-white rounded-xl hover:bg-[#3d4220] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  existingReview ? 'Update Review' : 'Submit Review'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
