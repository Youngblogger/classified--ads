'use client';

import { useState } from 'react';
import { Star, ThumbsUp, Flag, User, CheckCircle } from 'lucide-react';
import { sellerReviewsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { SellerReview } from '@/types';

interface SellerReviewCardProps {
  review: SellerReview;
  onUpdate?: () => void;
}

export default function SellerReviewCard({ review, onUpdate }: SellerReviewCardProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count ?? 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const { isAuthenticated } = useAuthStore();

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

  const handleHelpful = async () => {
    if (hasVoted || !isAuthenticated) return;

    try {
      const response = await sellerReviewsApi.markHelpful(review.id);
      setHelpfulCount(response.data.helpful_count);
      setHasVoted(true);
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated) {
      alert('Please login to report a review');
      return;
    }

    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting');
      return;
    }

    try {
      await sellerReviewsApi.reportReview(review.id, reportReason);
      setShowReportModal(false);
      setReportReason('');
      alert('Review reported successfully. Thank you for your feedback.');
    } catch (error) {
      console.error('Error reporting review:', error);
      alert('Failed to report review. Please try again.');
    }
  };

  const avatarUrl = getAvatarUrl(review.user?.avatar || review.user?.google_avatar || review.user?.facebook_avatar);

  return (
    <>
      <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-colors">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={review.user?.name || 'User'}
                className="w-12 h-12 rounded-full object-cover"
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

            <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
              <button
                onClick={handleHelpful}
                disabled={hasVoted || !isAuthenticated}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  hasVoted
                    ? 'text-[#4B5320] cursor-default'
                    : isAuthenticated
                    ? 'text-gray-500 hover:text-[#4B5320]'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title={!isAuthenticated ? 'Login to mark as helpful' : ''}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Helpful</span>
                {helpfulCount > 0 && <span className="text-gray-400">({helpfulCount})</span>}
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                <Flag className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-dark mb-2">Report Review</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for reporting this review. We will review it shortly.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Why are you reporting this review?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
