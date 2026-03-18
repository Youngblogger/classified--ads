'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, User } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ReviewSummaryProps {
  adId: number;
  onWriteReview: () => void;
}

interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function ReviewSummary({ adId, onWriteReview }: ReviewSummaryProps) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`${API_URL}/ads/${adId}/reviews/summary`);
        setSummary(response.data);
      } catch (error) {
        console.error('Error fetching review summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [adId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!summary || summary.total_reviews === 0) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-dark">Reviews</h3>
          <button
            onClick={onWriteReview}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Write a Review
          </button>
        </div>
        <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  const { average_rating, total_reviews, distribution } = summary;

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-dark">Reviews</h3>
        <button
          onClick={onWriteReview}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Write a Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Average Rating */}
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-500 mb-1">Average Rating</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-4xl font-bold text-dark">{average_rating}</span>
            <span className="text-2xl text-gray-400">/ 5</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= average_rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : star - 0.5 <= average_rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">Based on {total_reviews} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-8">{rating}★</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${distribution[rating as keyof typeof distribution]}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8">
                {distribution[rating as keyof typeof distribution]}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
