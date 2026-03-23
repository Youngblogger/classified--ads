'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';
import RelatedAds from '@/components/ads/RelatedAds';
import ShareModal from '@/components/ui/ShareModal';
import WriteReviewModal from '@/components/reviews/WriteReviewModal';
import ChatModal from '@/components/chat/ChatModal';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Heart, Share2, Flag, MapPin, Eye, Clock, Phone, ChevronLeft, ChevronRight, CheckCircle, User, Home, X, Check, Star, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.218 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { getAuthToken } from '@/lib/cookies';
import { sellerReviewsApi } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getImageUrl(url: string): string {
  if (!url) return '';
  // If already a full URL, return as-is
  if (url.startsWith('http')) {
    return url;
  }
  // If it's a storage path, prepend the API URL
  if (url.startsWith('/storage/')) {
    const API_BASE = API_URL.replace('/api', '');
    return `${API_BASE}${url}`;
  }
  // If it's just a path, prepend API URL
  return `${API_URL.replace('/api', '')}/storage/${url}`;
}

function WatermarkBadge({ adId }: { adId: number }) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-600/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm shadow-lg">
      <CheckCircle className="w-5 h-5" />
      <span className="text-sm font-semibold">Verified</span>
      <span className="text-xs opacity-75">#{adId}</span>
    </div>
  );
}

function isApprovedAd(ad: any): boolean {
  // Show watermark for active/approved ads that are also verified
  return (ad?.status === 'active' || ad?.status === 'approved') && ad?.is_verified === true;
}

export default function AdDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [ad, setAd] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);
  const [reportLoading, setReportLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { toggleLoginModal } = useUIStore();
  const [sellerRating, setSellerRating] = useState<{ average_rating: number; total_reviews: number } | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Fetch ad from API
  useEffect(() => {
    const fetchAd = async () => {
      console.log('[AdDetail] Starting fetch for slug:', slug);
      console.log('[AdDetail] API URL:', `${API_URL}/ads/${slug}`);
      setIsLoading(true);
      setError(null);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('[AdDetail] Request timeout, aborting');
          controller.abort();
        }, 15000); // Increased timeout to 15 seconds

        console.log('[AdDetail] Making fetch request...');
        const response = await fetch(`${API_URL}/ads/${slug}`, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        clearTimeout(timeoutId);
        
        console.log('[AdDetail] Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Ad not found (HTTP ${response.status})`);
        }
        const data = await response.json();
        console.log('[AdDetail] Received data:', data ? 'success' : 'empty');
        console.log('[AdDetail] Full API response:', JSON.stringify(data));
        // Handle both formats: { data: ad } or just { ad }
        const adData = data.data || data;
        console.log('[AdDetail] Ad data keys:', Object.keys(adData));
        console.log('[AdDetail] Ad images raw:', adData.images);
        setAd(adData);
        setIsFavorited(adData.is_favorited || false);
      } catch (err: any) {
        console.error('[AdDetail] Error fetching ad:', err);
        if (err.name === 'AbortError') {
          setError('Request timed out. Please check your connection and try again.');
        } else if (err.message.includes('Ad not found')) {
          setError(err.message);
        } else {
          setError('Failed to load ad. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAd();
  }, [slug]);

  // Fetch seller rating
  const fetchSellerRating = () => {
    if (ad?.user?.id) {
      setRatingLoading(true);
      sellerReviewsApi.getRatingSummary(ad.user.id)
        .then(res => setSellerRating(res.data))
        .catch(err => console.error('Error fetching seller rating:', err))
        .finally(() => setRatingLoading(false));
    }
  };

  useEffect(() => {
    fetchSellerRating();
  }, [ad?.user?.id]);

  // Auto-slide every 2 seconds
  useEffect(() => {
    if (!ad?.images?.length || isPaused || currentImageIndex === undefined) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        if (prev === undefined || !ad?.images?.length) return 0;
        return (prev + 1) % ad.images.length;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [ad?.images?.length, isPaused, currentImageIndex]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    // Swipe left - next image
    if (diff > 50) {
      nextImage();
    }
    // Swipe right - previous image  
    else if (diff < -50) {
      prevImage();
    }
    
    setTouchStartX(null);
    setIsPaused(false);
  };

  const nextImage = () => {
    if (ad?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % ad.images.length);
    }
  };

  const prevImage = () => {
    if (ad?.images?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toggleLoginModal();
      return;
    }

    if (favoriteLoading) return;
    setFavoriteLoading(true);

    const previousState = isFavorited;
    setIsFavorited(!isFavorited);

    try {
      const token = getAuthToken();
      if (isFavorited) {
        await fetch(`${API_URL}/favorites/${ad.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        toast.success('Removed from favorites');
      } else {
        await fetch(`${API_URL}/favorites`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ad_id: ad.id })
        });
        toast.success('Added to favorites');
      }
    } catch (err) {
      setIsFavorited(previousState);
      toast.error('Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad?.title || 'Ad',
          text: `Check out this ${ad?.title || 'ad'} for ${formatPrice(ad?.price, ad?.currency)}`,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated) {
      toggleLoginModal();
      return;
    }

    if (!reportReason) {
      toast.error('Please select a reason');
      return;
    }

    setReportLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ad_id: ad.id,
          reason: reportReason,
          description: reportDescription
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      setReportSubmitted(true);
      toast.success('Report submitted. Thank you for your feedback.');
      setTimeout(() => {
        setShowReportModal(false);
        setReportSubmitted(false);
        setReportReason('');
        setReportDescription('');
      }, 2000);
    } catch (err) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  // Use real ad data - no mock data
  // The loading and error states handle null ad cases, so we can safely use ad directly
  const displayAd = ad;

  // Build image list - try all possible URL fields regardless of status
  const adImages = displayAd?.images || [];
  const currentImages = adImages.length > 0 ? adImages.map((img: any) => {
    const rawUrl = img.url || img.original_url || img.display_url || img.thumbnail_url || img.thumbnail || img.src || img.image || img.path || img.file || '';
    const resolvedUrl = getImageUrl(rawUrl);
    return { ...img, url: resolvedUrl };
  }) : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-app">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading ad...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-red-500 text-lg mb-4">{error}</p>
                <Link href="/" className="text-primary-600 hover:text-primary-700">
                  ← Back to Home
                </Link>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link href="/" className="hover:text-primary-600 flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <ChevronRight className="w-4 h-4" />
                <Link href={`/categories/${displayAd.category?.slug}`} className="hover:text-primary-600">
                  {displayAd.category?.name}
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-dark truncate max-w-[200px]">{displayAd.title}</span>
              </nav>

              {/* Image Gallery */}
              <div className="card overflow-hidden">
                <div 
                  className="relative aspect-[4/3] bg-gray-100 touch-pan-y"
                  style={{ height: '100%' }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={currentImages[currentImageIndex]?.url || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27800%27 height=%27600%27 viewBox=%270 0 800 600%27%3E%3Crect width=%27800%27 height=%27600%27 fill=%27%23f3f4f6%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27Arial%27 font-size=%2724%27 fill=%27%236b7280%27%3ENo Image Available%3C/text%3E%3C/svg%3E'}
                    alt={displayAd?.title || 'Ad Image'}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  {currentImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6 text-dark" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-6 h-6 text-dark" />
                      </button>
                    </>
                  )}

                  {/* Condition Badge */}
                  {displayAd.condition && (
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
                      displayAd.condition === 'new' ? 'bg-green-500 text-white' :
                      displayAd.condition === 'like_new' ? 'bg-blue-500 text-white' :
                      displayAd.condition === 'good' ? 'bg-yellow-500 text-white' :
                      'bg-orange-500 text-white'
                    }`}>
                      {displayAd.condition === 'new' ? 'New' :
                       displayAd.condition === 'like_new' ? 'Like New' :
                       displayAd.condition === 'good' ? 'Good' : 'Fair'}
                    </span>
                  )}
                  
                  {/* Watermark for approved ads */}
                  {isApprovedAd(displayAd) && displayAd.id && (
                    <WatermarkBadge adId={displayAd.id} />
                  )}
                </div>

                {/* Thumbnail Strip */}
                {currentImages.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto scrollbar-thin">
                    {currentImages.map((image: any, index: number) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex ? 'border-primary-500' : 'border-transparent'
                        }`}
                      >
                        <img src={image.url || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%2780%27 viewBox=%270 0 80 80%27%3E%3Crect width=%2780%27 height=%2780%27 fill=%27%23f3f4f6%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-family=%27Arial%27 font-size=%2710%27 fill=%27%236b7280%27%3EN/A%3C/text%3E%3C/svg%3E'} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ad Info */}
              <div className="card p-4 lg:p-6 space-y-4 lg:space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge-primary">{displayAd.category?.name}</span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatRelativeTime(displayAd.created_at)}
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-dark">
                      {displayAd.title}
                    </h1>
                    <p className="text-3xl font-bold text-primary-600 mt-3">
                      {formatPrice(displayAd.price, displayAd.currency)}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={toggleFavorite}
                      className={`px-4 py-2 rounded-xl border-2 transition-colors font-medium ${
                        isFavorited 
                          ? 'border-error bg-error/10 text-error' 
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {isFavorited ? 'Saved' : 'Save'}
                    </button>
                    <button 
                      onClick={() => setShowShareModal(true)}
                      className="px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-colors font-medium"
                    >
                      Share
                    </button>
                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-colors font-medium"
                    >
                      Report
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {displayAd.location?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {displayAd.views} views
                  </span>
                </div>

                {/* Description */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold text-dark mb-4">Description</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 whitespace-pre-line">
                      {displayAd.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 lg:space-y-6">
              {/* Seller Card */}
              <div className="card p-4 lg:p-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                      {(() => {
                        // Try all possible avatar fields
                        const avatarFields = [
                          displayAd.user?.avatar_url,
                          displayAd.user?.google_avatar,
                          displayAd.user?.facebook_avatar,
                          displayAd.user?.avatar,
                          displayAd.user?.profile_image,
                          displayAd.user?.image
                        ];
                        const avatarSrc = avatarFields.find(f => f && f.trim() !== '');
                        
                        if (avatarSrc) {
                          const imgUrl = getImageUrl(avatarSrc);
                          if (imgUrl) {
                            return (
                              <img 
                                src={imgUrl} 
                                alt={displayAd.user?.name || 'Seller'} 
                                className="w-full h-full object-cover"
                              />
                            );
                          }
                        }
                        // Show default avatar with initials
                        const nameInitials = displayAd.user?.name 
                          ? displayAd.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                          : '?';
                        return (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-500 text-white font-bold text-2xl">
                            {nameInitials}
                          </div>
                        );
                      })()}
                    </div>
                    {displayAd.user?.verified === 1 || displayAd.user?.role === 'verified' ? (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                        <CheckCircle className="w-5 h-5 text-success fill-white" />
                      </div>
                    ) : null}
                  </div>
                  <div className="text-center mt-2">
                    <h3 className="font-semibold text-dark flex items-center justify-center gap-1">
                      {displayAd.user?.name || 'Unknown Seller'}
                      {displayAd.user?.verified === 1 || displayAd.user?.role === 'verified' ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : null}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Member since {displayAd.user?.created_at 
                        ? new Date(displayAd.user.created_at).getFullYear().toString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Seller Meta Info */}
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{sellerRating?.average_rating?.toFixed(1) || '0.0'}</span>
                    <span>({sellerRating?.total_reviews || 0} reviews)</span>
                  </div>
                </div>

                {/* View All Ads Link */}
                <Link
                  href={`/seller/${displayAd.user?.id}`}
                  className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all ads by this seller →
                </Link>

                {/* Write Review Button */}
                <button
                  onClick={() => setShowWriteReview(true)}
                  className="w-full mt-3 py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 border-2 border-amber-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Write a Review
                </button>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toggleLoginModal();
                        return;
                      }
                      const phoneNumber = displayAd.phone || displayAd.user?.phone;
                      if (!phoneNumber) {
                        toast.error('No phone number available');
                        return;
                      }
                      if (showPhone) {
                        window.location.href = `tel:${phoneNumber}`;
                      } else {
                        setShowPhone(true);
                      }
                    }}
                    className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    {isAuthenticated ? (
                      showPhone ? (
                        <span>{displayAd.phone || displayAd.user?.phone}</span>
                      ) : (
                        'Show Phone Number'
                      )
                    ) : (
                      'Login to View Phone'
                    )}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          toggleLoginModal();
                          return;
                        }
                        const whatsappNumber = displayAd.whatsapp || displayAd.user?.whatsapp;
                        if (!whatsappNumber) {
                          toast.error('WhatsApp number not available for this ad');
                          return;
                        }
                        window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Hi, I'm interested in your ad: ${encodeURIComponent(displayAd.title || '')}`, '_blank');
                      }}
                      className="flex-1 py-2.5 px-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          toggleLoginModal();
                          return;
                        }
                        setShowChat(true);
                      }}
                      className="flex-1 py-2.5 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat Seller</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="card p-4 lg:p-6">
                <h3 className="font-semibold text-dark mb-4">Safety Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                    Meet in a public place
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                    Check the item before paying
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                    Never wire funds or use gift cards
                  </li>
                </ul>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Related Ads Section */}
        {ad && (
          <div className="mt-6">
            <RelatedAds currentAdId={ad.id} categoryId={ad.category_id} />
          </div>
        )}
      </main>

      <Footer />

      {/* Mobile Sticky Chat Button */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden z-40">
        <button
          onClick={() => {
            if (!isAuthenticated) {
              toggleLoginModal();
              return;
            }
            setShowChat(true);
          }}
          className="w-full py-4 bg-[#00B53F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-[#00a035] transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Chat Seller
        </button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark">Report Ad</h3>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {reportSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <p className="text-lg font-semibold text-dark">Thank you for your report</p>
                <p className="text-gray-500">We will review this ad shortly. Our team will take appropriate action.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">Why are you reporting this ad?</p>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none mb-4"
                >
                  <option value="">Select a reason</option>
                  <option value="spam">Spam or misleading</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="scam">Suspected scam</option>
                  <option value="duplicate">Duplicate ad</option>
                  <option value="wrong_category">Wrong category</option>
                  <option value="fake">Fake listing</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide additional details (optional)"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none mb-4"
                  rows={3}
                />
                <button
                  onClick={handleReport}
                  disabled={!reportReason || reportLoading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {reportLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {showWriteReview && ad && displayAd.user && (
        <WriteReviewModal
          sellerId={displayAd.user.id}
          sellerName={displayAd.user.name || 'this seller'}
          isOpen={showWriteReview}
          onClose={() => setShowWriteReview(false)}
          onSuccess={() => {
            setReviewsRefreshKey(prev => prev + 1);
            fetchSellerRating();
          }}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={ad?.title || ''}
        price={ad?.price}
        currency={ad?.currency}
      />

      {/* Chat Modal */}
      {showChat && ad && displayAd.user && (
        <ChatModal
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          adId={ad.id}
          adTitle={ad.title}
          sellerId={displayAd.user.id}
          sellerName={displayAd.user.name || 'Seller'}
          sellerAvatar={(() => {
            // Check all possible avatar sources in order of priority
            const avatarSrc = displayAd.user?.avatar || 
                            displayAd.user?.google_avatar || 
                            displayAd.user?.facebook_avatar || 
                            displayAd.user?.profile_image || 
                            displayAd.user?.image;
            return avatarSrc ? getImageUrl(avatarSrc) : undefined;
          })()}
        />
      )}
    </div>
  );
}
