'use client';

import { useState } from 'react';
import { Star, ThumbsUp, Flag, User, CheckCircle, Heart } from 'lucide-react';
import axios from 'axios';
import { getAuthToken } from '@/lib/cookies';

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
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count ?? 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [likeCount, setLikeCount] = useState(review.like_count ?? 0);
  const [isLiked, setIsLiked] = useState(review.is_liked_by_user ?? false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleHelpful = async () => {
    if (hasVoted) return;
    
    const token = getAuthToken();
    if (!token) {
      alert('Please login to mark review as helpful');
      return;
    }

    try {
      const token = getAuthToken();
      await axios.post(`${API_URL}/reviews/${review.id}/helpful`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setHelpfulCount((prev) => prev + 1);
      setHasVoted(true);
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

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

  const handleReport = async () => {
    const token = getAuthToken();
    if (!token) {
      alert('Please login to report a review');
      return;
    }

    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting');
      return;
    }

    try {
      await axios.post(`${API_URL}/reviews/${review.id}/report`, { reason: reportReason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowReportModal(false);
      setReportReason('');
      alert('Review reported successfully');
      onReport();
    } catch (error) {
      console.error('Error reporting review:', error);
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
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {review.user.avatar ? (
              <img
                src={review.user.avatar}
                alt={review.user.name}
                className="w-12 h-12 rounded-full object-cover"
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
                onClick={handleLike}
                disabled={isLikeLoading}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isLiked
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${isLikeLoading ? 'opacity-50 cursor-wait' : ''}`}
              >
                <svg 
                  className="w-4 h-4"
                  fill={isLiked ? "currentColor" : "none"}
                  stroke={isLiked ? "currentColor" : "currentColor"}
                  viewBox="0 0 24 24" 
                  strokeWidth="2"
                >
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
                {likeCount > 0 && (
                  <span className="text-xs">
                    {formatLikeCount(likeCount)}
                  </span>
                )}
              </button>

              <button
                onClick={handleHelpful}
                disabled={hasVoted}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  hasVoted
                    ? 'text-primary-600 cursor-default'
                    : 'text-gray-500 hover:text-primary-600'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Helpful</span>
                {helpfulCount > 0 && <span className="text-gray-400">({helpfulCount})</span>}
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                <Flag className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReportModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-bold text-dark mb-4">Report Review</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for reporting this review.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Enter your reason..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
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
