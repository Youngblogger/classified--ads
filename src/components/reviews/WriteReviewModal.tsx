'use client';

import { useState, useEffect } from 'react';
import { Star, X, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { sellerReviewsApi } from '@/lib/api';

interface WriteReviewModalProps {
  sellerId: number;
  sellerName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WriteReviewModal({ sellerId, sellerName, isOpen, onClose, onSuccess }: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [checkError, setCheckError] = useState('');
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isOpen && sellerId) {
      setCanReview(null);
      setCheckError('');
      setError('');
      setExistingReview(null);
      setRating(0);
      setComment('');

      const checkEligibility = async () => {
        if (!isAuthenticated || !user) {
          setCanReview(false);
          setCheckError('Please login to write a review');
          return;
        }

        try {
          console.log('Checking eligibility for seller:', sellerId);
          const eligibility = await sellerReviewsApi.canReview(sellerId);
          console.log('Eligibility response:', eligibility.data);
          setCanReview(eligibility.data.allowed);
          setCheckError(eligibility.data.allowed ? '' : eligibility.data.reason);
          
          if (eligibility.data.allowed) {
            try {
              const review = await sellerReviewsApi.getMyReview(sellerId);
              console.log('Review response:', review.data);
              if (review.data?.review) {
                setExistingReview(review.data.review);
                setRating(review.data.review.rating);
                setComment(review.data.review.comment || '');
              }
            } catch (reviewErr: any) {
              console.log('No existing review or error:', reviewErr);
              if (reviewErr.response?.status !== 404) {
                console.error('Error fetching existing review:', reviewErr);
              }
            }
          }
        } catch (err: any) {
          console.error('Error checking eligibility:', err);
          setCanReview(false);
          if (err.response?.status === 401) {
            setCheckError('Session expired. Please login again.');
          } else if (err.response?.status === 404) {
            setCheckError('Seller not found.');
          } else {
            setCheckError(err.response?.data?.message || 'Unable to check review eligibility. Please try again.');
          }
        }
      };

      checkEligibility();
    }
  }, [isOpen, sellerId, isAuthenticated, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (existingReview) {
        await sellerReviewsApi.updateReview(existingReview.id, { rating, comment });
      } else {
        await sellerReviewsApi.submitReview(sellerId, { rating, comment });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Review error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[rating] || 'Select rating';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-dark">
            {existingReview ? 'Update Your Review' : 'Write a Review'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            Reviewing: <span className="font-semibold">{sellerName}</span>
          </p>
        </div>

        {canReview === null && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Checking eligibility...</p>
          </div>
        )}

        {canReview === false && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600 font-medium">Unable to write review</p>
              <p className="text-xs text-gray-500 mt-1">
                {checkError || 'You can only review sellers you have chatted with. Start a conversation with this seller first.'}
              </p>
            </div>
          </div>
        )}

        {canReview === true && (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating <span className="text-red-500">*</span>
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
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {getRatingLabel(hoverRating || rating)}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review {existingReview && <span className="text-gray-400">(optional to update)</span>}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience buying from this seller. Was the item as described? Was the seller responsive and trustworthy?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 mt-1">{comment.length}/1000 characters</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
