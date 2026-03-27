'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, Calendar, CheckCircle, MessageCircle, Phone, ChevronLeft, Loader2 } from 'lucide-react';
import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';
import SellerRatingSummary from '@/components/reviews/SellerRatingSummary';
import SellerReviewCard from '@/components/reviews/SellerReviewCard';
import SellerReviewModal from '@/components/reviews/SellerReviewModal';
import AdCard from '@/components/ui/AdCard';
import { sellerReviewsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { SellerProfile, SellerReview } from '@/types';

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId = parseInt(params.userId as string);
  const { isAuthenticated } = useAuthStore();

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsMeta, setReviewsMeta] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'reviews' | 'ads'>('reviews');
  const [reviewSort, setReviewSort] = useState('newest');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchSellerProfile();
  }, [sellerId]);

  useEffect(() => {
    if (seller) {
      fetchReviews();
    }
  }, [sellerId, reviewSort, refreshKey]);

  const fetchSellerProfile = async () => {
    try {
      const profileRes = await sellerReviewsApi.getSellerProfile(sellerId);
      setSeller(profileRes.data);
      
      const adsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/ads?user_id=${sellerId}&status=active`);
      if (adsRes.ok) {
        const adsData = await adsRes.json();
        setAds(adsData.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching seller profile:', error);
      if (error?.response?.status === 404) {
        setSeller(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await sellerReviewsApi.getReviews(sellerId, { sort: reviewSort });
      setReviews(response.data.data || []);
      setReviewsMeta(response.data.meta || {});
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      if (error?.response?.status !== 404) {
        setReviews([]);
      }
    } finally {
      setReviewsLoading(false);
    }
  };

  const getAvatarUrl = (img: any): string => {
    if (!img) return '';
    let url = typeof img === 'string' ? img : img.url || img.avatar || img.google_avatar || img.facebook_avatar || '';
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';
    return url.startsWith('/storage/') ? `${baseUrl}${url}` : `${baseUrl}/storage/${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#4B5320] animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-dark mb-2">Seller Not Found</h2>
            <p className="text-gray-500 mb-4">The seller you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/" className="text-[#4B5320] hover:underline">
              Go back home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(seller.seller?.avatar || seller.seller?.google_avatar || seller.seller?.facebook_avatar);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 w-full px-4 py-6 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-[#4B5320] mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={seller.seller?.name || 'Seller'}
                        className="w-24 h-24 rounded-full object-cover mx-auto"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-[#4B5320]/10 flex items-center justify-center mx-auto">
                        <span className="text-3xl font-bold text-[#4B5320]">
                          {seller.seller?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </span>
                      </div>
                    )}
                    {seller.seller?.verified && (
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#4B5320] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-dark mt-4">{seller.seller?.name}</h1>
                  {seller.seller?.verified && (
                    <span className="inline-flex items-center gap-1 text-sm text-[#4B5320] mt-1">
                      <CheckCircle className="w-4 h-4" />
                      Verified Seller
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  {seller.seller?.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{seller.seller.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {seller.member_since}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-gray-400">|</span>
                    <span>{seller.ads_count} active ads</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <SellerRatingSummary sellerId={sellerId} refreshKey={refreshKey} />
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4B5320] text-white rounded-xl hover:bg-[#3d4220] transition-colors font-medium"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Write a Review
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'reviews'
                        ? 'text-[#4B5320] border-b-2 border-[#4B5320]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Reviews ({seller.rating.total_reviews})
                  </button>
                  <button
                    onClick={() => setActiveTab('ads')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'ads'
                        ? 'text-[#4B5320] border-b-2 border-[#4B5320]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Ads ({seller.ads_count})
                  </button>
                </div>

                <div className="p-4">
                  {activeTab === 'reviews' && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-dark">Customer Reviews</h3>
                        <select
                          value={reviewSort}
                          onChange={(e) => setReviewSort(e.target.value)}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4B5320]/30"
                        >
                          <option value="newest">Newest First</option>
                          <option value="highest">Highest Rating</option>
                          <option value="lowest">Lowest Rating</option>
                        </select>
                      </div>

                      {reviewsLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-6 h-6 text-[#4B5320] animate-spin" />
                        </div>
                      ) : reviews.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8 text-gray-300" />
                          </div>
                          <h3 className="text-lg font-semibold text-dark mb-2">No Reviews Yet</h3>
                          <p className="text-gray-500 mb-4">This seller hasn&apos;t received any reviews.</p>
                          <button
                            onClick={() => setShowReviewModal(true)}
                            className="px-4 py-2 bg-[#4B5320] text-white rounded-lg hover:bg-[#3d4220] transition-colors"
                          >
                            Be the first to review
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reviews.map((review) => (
                            <SellerReviewCard
                              key={review.id}
                              review={review}
                              onUpdate={() => setRefreshKey(k => k + 1)}
                            />
                          ))}

                          {reviewsMeta.last_page > 1 && (
                            <div className="flex justify-center gap-2 pt-4">
                              {Array.from({ length: reviewsMeta.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                  key={page}
                                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                    page === reviewsMeta.current_page
                                      ? 'bg-[#4B5320] text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'ads' && (
                    <>
                      {ads.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📦</span>
                          </div>
                          <h3 className="text-lg font-semibold text-dark mb-2">No Active Ads</h3>
                          <p className="text-gray-500">This seller doesn&apos;t have any active ads.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {ads.map((ad) => (
                            <AdCard key={ad.id} ad={ad} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <SellerReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        sellerId={sellerId}
        sellerName={seller?.seller?.name || 'this seller'}
        onSuccess={() => setRefreshKey(k => k + 1)}
      />
    </div>
  );
}
