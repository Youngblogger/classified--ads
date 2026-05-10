'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Star,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Loader2,
  MoreHorizontal,
  Flag,
  Check,
  X
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Review {
  id: number;
  rating: number;
  comment: string;
  is_verified: boolean;
  helpful_count: number;
  status: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  ad: {
    id: number;
    title: string;
    slug: string;
  };
  reporter?: {
    id: number;
    name: string;
  };
  report_reason?: string;
  report_description?: string;
}

interface ReviewSummary {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  average: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'delete' | null>(null);
  const [actionReason, setActionReason] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  const STEALTH_PREFIX = '/secure-control-9ja';

  const getAdminToken = () => {
    const token = localStorage.getItem('admin_token');
    if (token) return token;
    try {
      const parsed = JSON.parse(localStorage.getItem('admin-auth-storage') || '{}');
      return parsed.state?.token || '';
    } catch {
      return '';
    }
  };

  const getImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const cleanUrl = url.replace(/^\/+/, '');
    return `${API_URL.replace('/api', '')}/storage/${cleanUrl}`;
  };

  const getAvatarUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    let avatarUrl = url;
    if (avatarUrl.startsWith('/storage/')) {
      avatarUrl = `http://127.0.0.1:8000${avatarUrl}`;
    }
    return avatarUrl;
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: currentPage,
        per_page: 15,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (ratingFilter) params.rating = ratingFilter;

      // Use direct fetch for admin reviews
      const response = await fetch(`${API_URL}${STEALTH_PREFIX}/reports`, {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`,
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to fetch');
      }
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data.data || data || []);
        if (data.last_page) setTotalPages(data.last_page);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, ratingFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReviews();
  };

  const openActionModal = (review: Review, action: 'approve' | 'reject' | 'delete') => {
    setSelectedReview(review);
    setActionType(action);
    setActionReason('');
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedReview || !actionType) return;

    setActionLoading(selectedReview.id);
    try {
      if (actionType === 'delete') {
        await adminApi.deleteReview(selectedReview.id);
        toast.success('Review deleted successfully');
      } else if (actionType === 'approve') {
        // Update review status via direct API
        await fetch(`${API_URL}/reviews/${selectedReview.id}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${getAdminToken()}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ status: 'approved' }),
        });
        toast.success('Review approved successfully');
      } else if (actionType === 'reject') {
        await fetch(`${API_URL}/reviews/${selectedReview.id}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${getAdminToken()}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ status: 'rejected', reason: actionReason }),
        });
        toast.success('Review rejected');
      }
      
      setShowActionModal(false);
      fetchReviews();
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Action failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const viewReviewDetails = (review: Review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        review.user?.name?.toLowerCase().includes(search) ||
        review.ad?.title?.toLowerCase().includes(search) ||
        review.comment?.toLowerCase().includes(search)
      );
    }
    if (ratingFilter && review.rating !== ratingFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
          <p className="text-gray-500 mt-1">Manage and moderate user reviews</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {filteredReviews.length} Total
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews by user, ad, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={ratingFilter || ''}
              onChange={(e) => {
                setRatingFilter(e.target.value ? Number(e.target.value) : null);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 w-20 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-24 bg-gray-200 rounded"></div>
                      <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-full bg-gray-100 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="lg:w-64 space-y-3">
                  <div className="h-4 w-16 bg-gray-100 rounded"></div>
                  <div className="h-10 w-full bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No Reviews Found</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm ? 'Try adjusting your search terms' : 'There are no reviews to display'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {review.user?.avatar ? (
                          <Image
                            src={getAvatarUrl(review.user.avatar)}
                            alt={review.user.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating, 'md')}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.rating >= 4 ? 'bg-green-100 text-green-700' :
                        review.rating >= 3 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {review.rating}/5
                      </span>
                      {review.is_verified && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-700">{review.comment}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-gray-500">For:</span>
                    <Link
                      href={`/ad/${review.ad?.slug && review.ad?.slug !== 'undefined' ? review.ad.slug : `ad-${review.ad?.id}`}`}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      {review.ad?.title || 'Unknown Ad'}
                    </Link>
                  </div>

                  {review.report_reason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <Flag className="w-4 h-4" />
                        <span className="font-medium text-sm">Reported</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">{review.report_reason}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:gap-2">
                  <button
                    onClick={() => viewReviewDetails(review)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  
                  <button
                    onClick={() => openActionModal(review, 'approve')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  
                  <button
                    onClick={() => openActionModal(review, 'reject')}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  
                  <button
                    onClick={() => openActionModal(review, 'delete')}
                    className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="px-4 py-2 text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Review Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {selectedReview.user?.avatar ? (
                    <Image
                      src={getAvatarUrl(selectedReview.user.avatar)}
                      alt={selectedReview.user.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedReview.user?.name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-500">{selectedReview.user?.email}</p>
                  <p className="text-sm text-gray-400 mt-1">{formatDate(selectedReview.created_at)}</p>
                </div>
                <div className="ml-auto">
                  {renderStars(selectedReview.rating, 'lg')}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700">{selectedReview.comment}</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Review for Ad</h3>
                <Link
                  href={`/ad/${selectedReview.ad?.slug && selectedReview.ad?.slug !== 'undefined' ? selectedReview.ad.slug : `ad-${selectedReview.ad?.id}`}`}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  {selectedReview.ad?.title || 'Unknown Ad'}
                </Link>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openActionModal(selectedReview, 'approve');
                  }}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openActionModal(selectedReview, 'reject');
                  }}
                  className="flex-1 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openActionModal(selectedReview, 'delete');
                  }}
                  className="flex-1 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && selectedReview && actionType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {actionType === 'approve' && 'Approve Review'}
                  {actionType === 'reject' && 'Reject Review'}
                  {actionType === 'delete' && 'Delete Review'}
                </h2>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {actionType === 'delete' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">
                    Are you sure you want to delete this review? This action cannot be undone.
                  </p>
                </div>
              )}

              {actionType === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (optional)
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Review by: <span className="font-medium text-gray-900">{selectedReview.user?.name}</span></p>
                <p className="text-sm text-gray-500 mt-1">Rating: {renderStars(selectedReview.rating)}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">&quot;{selectedReview.comment}&quot;</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={actionLoading === selectedReview.id}
                  className={`flex-1 py-3 text-white rounded-lg transition-colors disabled:opacity-50 ${
                    actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                    actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  {actionLoading === selectedReview.id ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    actionType === 'delete' ? 'Delete' :
                    actionType === 'approve' ? 'Approve' : 'Reject'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
