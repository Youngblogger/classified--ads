'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Loader2, BadgeCheck, Home } from 'lucide-react';
import { sellerReviewsApi } from '@/lib/api';
import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';

interface Review {
  id: number;
  seller_id: number;
  reviewer_id: number;
  reviewer?: {
    id?: number;
    name?: string;
    avatar?: string;
    google_avatar?: string;
    facebook_avatar?: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  rating: number;
  comment: string;
  is_verified_buyer: boolean;
  helpful_count: number;
  is_helpful?: boolean;
  created_at: string;
  updated_at: string;
}

interface SellerProfile {
  id: number;
  name: string;
  avatar_url?: string;
  rating: {
    average_rating: number;
    total_reviews: number;
  };
}

interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 14, md: 16, lg: 20 };
  const s = sizes[size];
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={s}
          height={s}
          viewBox="0 0 24 24"
          className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const reviewer = review.reviewer || {};
  const reviewerName = reviewer.name || 'Anonymous';
  const reviewerAvatar = reviewer.avatar_url || reviewer.avatar || reviewer.google_avatar || '';
  const reviewerInitial = reviewerName.charAt(0)?.toUpperCase() || 'U';
  
  return (
    <div className={`bg-white rounded-xl border p-4 ${
      review.is_verified_buyer ? 'border-l-4 border-l-green-500 border-gray-100' : 'border-gray-100'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {reviewerAvatar ? (
              <img 
                src={reviewerAvatar}
                alt={reviewerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary-600 font-bold">
                {reviewerInitial}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-dark">{reviewerName}</span>
              {review.is_verified_buyer && (
                <BadgeCheck className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
        {review.is_verified_buyer && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            Verified Buyer
          </span>
        )}
      </div>

      {/* Review Text */}
      <p className="text-gray-600 text-sm leading-relaxed">
        {review.comment || 'No comment provided.'}
      </p>

      {/* Helpful Count */}
      {review.helpful_count > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found this helpful
          </span>
        </div>
      )}
    </div>
  );
}

function RatingBreakdown({ distribution, total }: { distribution: RatingDistribution; total: number }) {
  const getPercentage = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;
  
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center gap-2">
          <span className="text-sm text-gray-600 w-8">{star} ★</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-400 rounded-full transition-all duration-300"
              style={{ width: `${getPercentage(distribution[star as keyof RatingDistribution])}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-10 text-right">
            {getPercentage(distribution[star as keyof RatingDistribution])}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SellerReviewsPage() {
  const params = useParams();
  const sellerId = Number(params.userId);
  
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [distribution, setDistribution] = useState<RatingDistribution>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadedIdsRef = useRef<Set<number>>(new Set());

  const fetchReviews = useCallback(async (pageNum: number, isInitial = false) => {
    if (!hasMore && !isInitial) return;
    
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const response = await sellerReviewsApi.getReviews(sellerId, {
        page: pageNum,
        sort: 'verified_first',
      });

      const newReviews = response.data.reviews || response.data.data || response.data || [];
      const meta = response.data.meta;
      
      const uniqueReviews = newReviews.filter((review: Review) => {
        if (loadedIdsRef.current.has(review.id)) return false;
        loadedIdsRef.current.add(review.id);
        return true;
      });

      if (isInitial) {
        setReviews(uniqueReviews);
      } else {
        setReviews(prev => [...prev, ...uniqueReviews]);
      }

      if (meta) {
        setTotalReviews(meta.total || 0);
        setHasMore(meta.current_page < meta.last_page);
      } else {
        setHasMore(uniqueReviews.length === 12);
      }
      
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sellerId, hasMore]);

  const fetchSellerProfile = async () => {
    try {
      const response = await sellerReviewsApi.getSellerProfile(sellerId);
      setSeller(response.data);
      if (response.data.rating?.distribution) {
        setDistribution(response.data.rating.distribution);
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error);
    }
  };

  useEffect(() => {
    fetchSellerProfile();
    fetchReviews(1, true);
  }, [sellerId]);

  useEffect(() => {
    if (loading || !hasMore) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchReviews(page + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loading, page, fetchReviews]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Link */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Seller Header */}
          <div className="bg-white rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {seller?.avatar_url ? (
                  <img 
                    src={seller.avatar_url} 
                    alt={seller.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary-600 font-bold text-2xl">
                    {seller?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark">{seller?.name || 'Seller'}</h1>
                <p className="text-gray-500">Seller Reviews</p>
              </div>
            </div>
          </div>

          {/* Rating Summary */}
          <div className="bg-white rounded-2xl p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="text-center md:border-r md:border-gray-100">
                <div className="text-5xl font-bold text-dark mb-2">
                  {seller?.rating?.average_rating?.toFixed(1) || '0.0'}
                </div>
                <StarRating rating={Math.round(seller?.rating?.average_rating || 0)} size="lg" />
                <p className="text-gray-500 mt-2">
                  {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Rating Breakdown */}
              <div>
                <h3 className="font-semibold text-dark mb-3">Rating Breakdown</h3>
                <RatingBreakdown distribution={distribution} total={totalReviews} />
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-dark">
              All Reviews {totalReviews > 0 && `(${totalReviews})`}
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-dark mb-2">No Reviews Yet</h3>
                <p className="text-gray-500">This seller has not received any reviews.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                <div ref={loadMoreRef} className="py-8 text-center">
                  {loadingMore && (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading more reviews...</span>
                    </div>
                  )}
                  {!hasMore && reviews.length > 0 && (
                    <p className="text-gray-400">You have reached the end of the reviews</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
