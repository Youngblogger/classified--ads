'use client';

import { useState, useEffect } from 'react';
import { Star, Award } from 'lucide-react';
import { sellerReviewsApi } from '@/lib/api';
import type { SellerRatingSummary as SellerRatingSummaryType } from '@/types';

interface SellerRatingSummaryProps {
  sellerId: number;
  refreshKey?: number;
  variant?: 'card' | 'compact';
}

export default function SellerRatingSummary({ 
  sellerId, 
  refreshKey = 0, 
  variant = 'card' 
}: SellerRatingSummaryProps) {
  const [summary, setSummary] = useState<SellerRatingSummaryType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await sellerReviewsApi.getRatingSummary(sellerId);
        setSummary((response.data as any)?.data ?? null);
      } catch (error) {
        console.error('Error fetching seller rating summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [sellerId, refreshKey]);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-4 animate-pulse ${variant === 'compact' ? '' : 'border border-gray-100'}`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary || summary.total_reviews === 0) {
    return (
      <div className={`bg-white rounded-xl p-4 ${variant === 'compact' ? '' : 'border border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">No reviews yet</p>
            <p className="text-xs text-gray-400">Be the first to review</p>
          </div>
        </div>
      </div>
    );
  }

  const { average_rating, total_reviews, distribution } = summary;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-dark">{average_rating.toFixed(1)}</span>
        </div>
        <span className="text-sm text-gray-500">({total_reviews} reviews)</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#4B5320]" />
          <h3 className="text-base font-bold text-dark">Seller Rating</h3>
        </div>
        {average_rating >= 4.5 && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Top Seller
          </span>
        )}
      </div>

      <div className="flex items-center gap-6 mb-5">
        <div className="text-center">
          <div className="text-4xl font-bold text-dark">{average_rating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= average_rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : star - 0.5 <= average_rating
                    ? 'fill-yellow-400/50 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">{total_reviews} reviews</p>
        </div>

        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-4">{rating}★</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${distribution[rating as keyof typeof distribution]}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">
                {distribution[rating as keyof typeof distribution]}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
