'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewCard from './ReviewCard';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Review {
  id: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  is_verified: boolean;
  helpful_count: number;
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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/ads/${adId}/reviews/latest`);
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
    // Refresh reviews after reporting
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/ads/${adId}/reviews/latest`);
        setReviews(response.data?.data || response.data || []);
      } catch (error) {
        console.error('Error fetching latest reviews:', error);
      }
    };
    fetchReviews();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="text-lg font-bold text-dark mb-4">Latest Reviews</h3>
      
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
          See All Reviews
        </Link>
      </div>
    </div>
  );
}
