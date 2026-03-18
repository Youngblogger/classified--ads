'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, Search } from 'lucide-react';

const mockReviews = [
  { id: 1, reviewer: 'John Doe', ad: 'iPhone 15 Pro Max', rating: 5, comment: 'Great seller! Item exactly as described.', date: 'Jan 15, 2026', helpful: 12 },
  { id: 2, reviewer: 'Sarah Wilson', ad: 'Toyota Camry 2023', rating: 4, comment: 'Good experience overall. Would recommend.', date: 'Jan 14, 2026', helpful: 8 },
  { id: 3, reviewer: 'Mike Johnson', ad: 'MacBook Pro M3', rating: 2, comment: 'Item had issues not mentioned in the listing.', date: 'Jan 13, 2026', helpful: 5 },
  { id: 4, reviewer: 'Emily Brown', ad: 'Samsung Galaxy S24', rating: 5, comment: 'Excellent seller, fast delivery!', date: 'Jan 12, 2026', helpful: 15 },
  { id: 5, reviewer: 'David Lee', ad: '4 Bedroom Apartment', rating: 3, comment: 'Average experience. Could be better.', date: 'Jan 11, 2026', helpful: 3 },
];

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = review.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.reviewer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'positive' && review.rating >= 4) ||
                         (filter === 'neutral' && review.rating === 3) ||
                         (filter === 'negative' && review.rating <= 2);
    return matchesSearch && matchesFilter;
  });

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
          <p className="text-2xl font-bold text-gray-900">{mockReviews.length}</p>
          <p className="text-sm text-gray-500">Total Reviews</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-green-600">{mockReviews.filter(r => r.rating >= 4).length}</p>
          <p className="text-sm text-gray-500">Positive</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-amber-600">{mockReviews.filter(r => r.rating === 3).length}</p>
          <p className="text-sm text-gray-500">Neutral</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-2xl font-bold text-red-600">{mockReviews.filter(r => r.rating <= 2).length}</p>
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
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {review.reviewer.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.reviewer}</p>
                  <p className="text-sm text-gray-500">{review.ad}</p>
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
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">{review.date}</p>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful})
                </button>
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600">
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
