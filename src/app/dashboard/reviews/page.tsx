'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Search, Loader2 } from 'lucide-react';
import { reviewsApi, adsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Review {
  id: number;
  user_id: number;
  ad_id: number;
  reviewer_name: string;
  reviewer_avatar?: string;
  rating: number;
  comment: string;
  is_helpful: boolean;
  helpful_count: number;
  created_at: string;
  ad?: {
    id: number;
    title: string;
    slug: string;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const timeoutId = setTimeout(() => {
      console.log('Reviews fetch timeout - forcing loading to false');
      setLoading(false);
    }, 10000);
    
    try {
      setLoading(true);
      const res = await reviewsApi.getMyReviews();
      clearTimeout(timeoutId);
      const data = (res.data as any)?.data ?? [];
      setReviews(data);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
      setReviews([]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const adTitle = review.ad?.title || '';
    const reviewerName = review.reviewer_name || '';
    const matchesSearch = adTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reviewerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'positive' && review.rating >= 4) ||
                         (filter === 'neutral' && review.rating === 3) ||
                         (filter === 'negative' && review.rating <= 2);
    return matchesSearch && matchesFilter;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-500 mt-1">Reviews from buyers on your listings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
          <p className="text-sm text-gray-500">Total Reviews</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-green-600">{reviews.filter(r => r.rating >= 4).length}</p>
          <p className="text-sm text-gray-500">Positive</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-amber-600">{reviews.filter(r => r.rating === 3).length}</p>
          <p className="text-sm text-gray-500">Neutral</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-red-600">{reviews.filter(r => r.rating <= 2).length}</p>
          <p className="text-sm text-gray-500">Negative</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">All Reviews</option>
          <option value="positive">Positive (4-5 stars)</option>
          <option value="neutral">Neutral (3 stars)</option>
          <option value="negative">Negative (1-2 stars)</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center">
                    {review.reviewer_avatar ? (
                      <Image src={review.reviewer_avatar} alt={review.reviewer_name} width={48} height={48} className="rounded-full object-cover" unoptimized />
                    ) : (
                      <span className="text-white font-semibold">
                        {(review.reviewer_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.reviewer_name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{review.ad?.title || 'Unknown Ad'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-gray-600">{review.comment}</p>
              <div className="mt-4 flex items-center justify-end">
                <p className="text-sm text-gray-400">{getTimeAgo(review.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
