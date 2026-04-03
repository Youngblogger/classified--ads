'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewCard from './ReviewCard';
import WriteAdReviewModal from './WriteAdReviewModal';
import { Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore, useUIStore } from '@/lib/store';

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
  created_at: string;
}

interface LatestReviewsProps {
  adId: number;
  adSlug: string;
  refreshKey?: number;
}

export default function LatestReviews({ adId, adSlug, refreshKey = 0 }: LatestReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [canWriteReview, setCanWriteReview] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { toggleLoginModal } = useUIStore();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/ads/${adId}/reviews/latest`, {
          params: { limit: 3 }
        });
        setReviews(response.data?.data || response.data || []);
      } catch (error) {
        console.error('Error fetching latest reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [adId, refreshKey]);

  const handleReport = () => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/ads/${adId}/reviews/latest`, {
          params: { limit: 3 }
        });
        setReviews(response.data?.data || response.data || []);
      } catch (error) {
        console.error('Error fetching latest reviews:', error);
      }
    };
    fetchReviews();
  };

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      toggleLoginModal();
      return;
    }
    setShowWriteReview(true);
  };

  const handleReviewSubmitSuccess = () => {
    handleReport();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 rounded-xl"></div>
        <div className="h-24 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Customer Reviews</h3>
        <button
          onClick={handleWriteReviewClick}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center shadow-sm hover:shadow"
        >
          <Star className="w-4 h-4 fill-white" />
          <span className="ml-1">Write a Review</span>
        </button>
      </div>
      
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No reviews yet</p>
          <p className="text-gray-400 text-xs mt-1">Be the first to review this ad</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} onReport={handleReport} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href={`/ad/${adSlug}/reviews`}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition-colors"
            >
              View All Reviews
            </Link>
          </div>
        </>
      )}

      <WriteAdReviewModal
        adId={adId}
        isOpen={showWriteReview}
        onClose={() => setShowWriteReview(false)}
        onSuccess={handleReviewSubmitSuccess}
      />
    </div>
  );
}
