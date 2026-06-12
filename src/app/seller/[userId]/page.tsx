'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, Calendar, CheckCircle, MessageCircle, Phone, ChevronLeft, Loader2, UserPlus, UserMinus, BadgeCheck, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import ResponsiveHeader from '@/components/home/ResponsiveHeader';
import Footer from '@/components/layout/Footer';
import SellerRatingSummary from '@/components/reviews/SellerRatingSummary';
import SellerReviewCard from '@/components/reviews/SellerReviewCard';
import SellerReviewModal from '@/components/reviews/SellerReviewModal';
import AdCard from '@/components/ui/AdCard';
import SellerTrustCard from '@/components/verification/SellerTrustCard';
import FraudRiskIndicator from '@/components/verification/FraudRiskIndicator';
import { sellerReviewsApi, followApi } from '@/lib/api';
import { normalizeAds } from '@/lib/normalize-ad';
import toast from 'react-hot-toast';
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const { user } = useAuthStore();

  const fetchSellerProfile = useCallback(async () => {
    try {
      const profileRes = await sellerReviewsApi.getSellerProfile(sellerId);
      setSeller((profileRes.data as any)?.data ?? null);
      
      const adsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/ads?user_id=${sellerId}&status=active`);
      if (adsRes.ok) {
        const adsData = await adsRes.json();
        setAds(normalizeAds(adsData.data || []));
      }
    } catch (error: any) {
      console.error('Error fetching seller profile:', error);
      if (error?.response?.status === 404) {
        setSeller(null);
      }
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const response = await sellerReviewsApi.getReviews(sellerId, { sort: reviewSort });
      setReviews((response.data as any)?.data ?? []);
      setReviewsMeta((response.data as any)?.meta ?? {});
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      if (error?.response?.status !== 404) {
        setReviews([]);
      }
    } finally {
      setReviewsLoading(false);
    }
  }, [sellerId, reviewSort]);

  const fetchFollowStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await followApi.getUserStats(sellerId);
      setIsFollowing((response.data as any)?.data?.is_following ?? false);
      setFollowersCount((response.data as any)?.data?.followers_count ?? 0);
      setFollowingCount((response.data as any)?.data?.following_count ?? 0);
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  }, [sellerId, isAuthenticated]);

  useEffect(() => {
    fetchSellerProfile();
    fetchFollowStatus();
  }, [sellerId, isAuthenticated, fetchSellerProfile, fetchFollowStatus]);

  useEffect(() => {
    const onInvalidate = () => { fetchSellerProfile(); fetchReviews(); };
    window.addEventListener('ilist:cache-invalidate', onInvalidate);
    return () => window.removeEventListener('ilist:cache-invalidate', onInvalidate);
  }, [fetchSellerProfile, fetchReviews]);

  useEffect(() => {
    if (seller) {
      fetchReviews();
    }
  }, [sellerId, reviewSort, refreshKey, seller, fetchReviews]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow sellers');
      return;
    }
    
    if (String(user?.id) === String(sellerId)) {
      toast.error("You can't follow yourself");
      return;
    }
    
    setFollowLoading(true);
    try {
      const response = await followApi.follow(sellerId);
      setIsFollowing((response.data as any)?.data?.is_following ?? false);
      setFollowersCount((response.data as any)?.data?.followers_count ?? 0);
      if ((response.data as any)?.data?.is_following) {
        toast.success(`You're now following ${seller?.seller?.name}`);
      } else {
        toast.success(`Unfollowed ${seller?.seller?.name}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const getAvatarUrl = (img: any): string => {
    if (!img) return '';
    let url = typeof img === 'string' ? img : img.url || img.avatar || img.google_avatar || img.facebook_avatar || '';
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
    return url.startsWith('/storage/') ? `${baseUrl}${url}` : `${baseUrl}/storage/${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <ResponsiveHeader variant="default" />
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
        <ResponsiveHeader variant="default" />
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
      <ResponsiveHeader variant="default" />

      <main className="flex-1 w-full px-4 pt-[48px] md:pt-[112px] pb-6 md:px-6 lg:px-8">
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
                    {avatarUrl && !avatarError ? (
                      <Image
                        src={avatarUrl}
                        alt={seller.seller?.name || 'Seller'}
                        width={96}
                        height={96}
                        className="rounded-full object-cover mx-auto"
                        unoptimized
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-[#4B5320]/10 flex items-center justify-center mx-auto">
                        <span className="text-3xl font-bold text-[#4B5320]">
                          {seller.seller?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </span>
                      </div>
                    )}
                    {(seller.seller?.is_verified_seller || seller.seller?.verified) && (
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1d9bf0] rounded-full flex items-center justify-center border-2 border-white shadow-lg" style={{ filter: 'drop-shadow(0 0 4px rgba(29,155,240,0.5))' }}>
                        <CheckCircle className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-dark mt-4 flex items-center justify-center gap-1.5">
                    {seller.seller?.name}
                    {(seller.seller?.is_verified_seller || seller.seller?.verified) && (
                      <BadgeCheck className="w-5 h-5 text-[#1d9bf0]" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 3px rgba(29,155,240,0.5))' }} />
                    )}
                  </h1>
                  {(seller.seller?.is_verified_seller || seller.seller?.verified) && (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1d9bf0] mt-1" style={{ filter: 'drop-shadow(0 0 2px rgba(29,155,240,0.3))' }}>
                      <BadgeCheck className="w-4 h-4" strokeWidth={2.5} />
                      Verified Seller
                    </span>
                  )}
                  {/* Follow Stats */}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="font-medium text-gray-700">
                      {followersCount.toLocaleString()} follower{followersCount !== 1 ? 's' : ''}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600">
                      {followingCount.toLocaleString()} following
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
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
                    <ShoppingBag className="w-4 h-4" />
                    <span>{seller.ads_count} active ads</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>{seller.rating?.average_rating > 0 ? `${seller.rating.average_rating.toFixed(1)} / 5` : 'No ratings yet'}</span>
                    <span className="text-gray-400">({seller.rating?.total_reviews || 0} reviews)</span>
                  </div>
                  <div className="pt-2">
                    <FraudRiskIndicator
                      seller={seller.seller || {}}
                      stats={{
                        total_reviews: seller.rating?.total_reviews,
                        active_ads: seller.ads_count,
                      }}
                      compact
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <SellerTrustCard
                    seller={seller.seller || {}}
                    stats={{
                      average_rating: seller.rating?.average_rating,
                      total_reviews: seller.rating?.total_reviews,
                      active_ads: seller.ads_count,
                    }}
                  />
                </div>

                <div className="mt-6 space-y-3">
                  {user && user.id !== sellerId && (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      } ${followLoading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                      {followLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserMinus className="w-5 h-5" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
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
