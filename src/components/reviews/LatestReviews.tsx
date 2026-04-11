'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewCard from './ReviewCard';
import WriteAdReviewModal from './WriteAdReviewModal';
import { Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore, useUIStore } from '@/lib/store';
import toast from 'react-hot-toast';

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
  sellerId?: number;
  refreshKey?: number;
}

export default function LatestReviews({ adId, adSlug, sellerId, refreshKey = 0 }: LatestReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { toggleLoginModal } = useUIStore();

  const isAdOwner = user && sellerId && sellerId > 0 && user.id === sellerId;

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
    if (isAdOwner) {
      toast.error("You can't review your own ad");
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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-900">Customer Reviews</h3>
        {!isAdOwner && (
          <button
            onClick={handleWriteReviewClick}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <Star className="w-4 h-4 fill-white" />
            <span>Write a Review</span>
          </button>
        )}
      </div>
      
      {reviews.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">No reviews yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} onReport={handleReport} />
            ))}
          </div>

          <div className="text-center mt-3">
            <Link
              href={`/ad/${adSlug}/reviews`}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 text-primary-600 text-sm rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              View All
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
