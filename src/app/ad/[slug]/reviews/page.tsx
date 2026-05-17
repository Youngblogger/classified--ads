'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';
import ReviewCard from '@/components/reviews/ReviewCard';
import WriteReviewModal from '@/components/reviews/WriteReviewModal';
import { Star, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

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
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
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

export default function AdReviewsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [adId, setAdId] = useState<number | null>(null);
  const [sellerInfo, setSellerInfo] = useState<{ id: number; name: string } | null>(null);

  const fetchAdId = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/ads/${slug}`);
      const adData = response.data.data || response.data;
      setAdId(adData.id);
      if (adData.user) {
        setSellerInfo({ id: adData.user.id, name: adData.user.name });
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
    }
  }, [slug]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: 10,
        sort: sortBy,
      };
      if (filterRating) {
        params.rating = filterRating;
      }
      
      const response = await axios.get(`${API_URL}/ads/${adId}/reviews`, { params });
      setReviews(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, filterRating, adId]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/ads/${adId}/reviews/summary`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, [adId]);

  useEffect(() => {
    fetchAdId();
  }, [fetchAdId, slug]);

  useEffect(() => {
    if (adId) {
      fetchReviews();
      fetchSummary();
    }
  }, [adId, currentPage, sortBy, filterRating, fetchReviews, fetchSummary]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (rating: number | null) => {
    setFilterRating(rating);
    setCurrentPage(1);
  };

  if (!adId) {
    return (
      <>
        <Header />
        <div className="container-app py-12 text-center">
          <p>Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container-app pt-[48px] md:pt-[112px] pb-8">
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/ad/${slug}`} className="hover:text-primary-600">Ad</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-dark">Reviews</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-dark">Reviews</h1>
              <button
                onClick={() => setShowWriteReview(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Write a Review
              </button>
            </div>

            {/* Filters & Sorting */}
            <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterChange(null)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      filterRating === null 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange(rating)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                        filterRating === rating 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {rating} <Star className="w-3 h-3 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="newest">Newest</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Reviews ({reviews.length})
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                          <div className="h-16 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} onReport={() => fetchReviews()} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 text-center">
                  <p className="text-gray-500">No reviews found.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === i + 1
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-dark mb-4">Rating Summary</h3>
              
              {summary && summary.total_reviews > 0 ? (
                <>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-dark">{summary.average_rating}</div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= summary.average_rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">{summary.total_reviews} reviews</p>
                  </div>

                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-8">{rating}★</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${summary.distribution[rating as keyof typeof summary.distribution]}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8">
                          {summary.distribution[rating as keyof typeof summary.distribution]}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Write Review Modal */}
      {showWriteReview && sellerInfo && (
        <WriteReviewModal
          sellerId={sellerInfo.id}
          sellerName={sellerInfo.name}
          isOpen={showWriteReview}
          onClose={() => setShowWriteReview(false)}
          onSuccess={() => {
            fetchReviews();
            fetchSummary();
          }}
        />
      )}
    </>
  );
}
