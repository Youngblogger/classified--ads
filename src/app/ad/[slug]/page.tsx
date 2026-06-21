'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ResponsiveHeader from '@/components/home/ResponsiveHeader';
import Footer from '@/components/layout/Footer';
import SellerProfileCard from '@/components/ui/SellerProfileCard';
import RelatedAds from '@/components/ads/RelatedAds';
import LatestReviews from '@/components/reviews/LatestReviews';
import AdSpecifications from '@/components/ads/AdSpecifications';
import ReportAdModal from '@/components/ui/ReportAdModal';
import BoostAdModal from '@/components/ui/BoostAdModal';
import { SafeImage } from '@/components/ui/SafeImage';
import { DynamicChatModal } from '@/lib/dynamicImports';
import { copyToClipboard } from '@/lib/share';
import { useAuthStore } from '@/lib/store';
import { requireAuth } from '@/lib/require-auth';
import { Heart, Phone, ChevronRight, MessageCircle, Home, CheckCircle, Flag, ImageIcon, Zap, Ban, X } from 'lucide-react';
import VerifiedSellerBadge from '@/components/verification/VerifiedSellerBadge';
import BusinessVerifiedBadge from '@/components/verification/BusinessVerifiedBadge';
import toast from 'react-hot-toast';
import { formatPrice, getAdGalleryUrls, getAdImageUrl, FALLBACK_IMAGE } from '@/lib/utils';
import { normalizeAd } from '@/lib/normalize-ad';
import type { NormalizedAd } from '@/lib/normalize-ad';
import { favoritesApi } from '@/lib/api';
import { useAdDetail } from '@/hooks/useAds';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.218 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const EmailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

function getImageUrls(ad: NormalizedAd | null): string[] {
  if (!ad?.images || ad.images.length === 0) return [FALLBACK_IMAGE];
  return getAdGalleryUrls(ad);
}

function getConditionBadge(condition: string): { label: string; className: string } {
  const c = condition.toLowerCase();
  if (c === 'new' || c === 'brand_new' || c === 'brand new') return { label: 'New', className: 'bg-green-50 text-green-700' };
  if (c === 'like_new' || c === 'like new') return { label: 'Like New', className: 'bg-blue-50 text-blue-700' };
  if (c === 'good') return { label: 'Used', className: 'bg-amber-50 text-amber-700' };
  if (c === 'fair') return { label: 'Refurbished', className: 'bg-yellow-50 text-yellow-800' };
  return { label: condition.charAt(0).toUpperCase() + condition.slice(1), className: 'bg-gray-50 text-gray-600' };
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  sold: { label: 'Sold', className: 'bg-gray-900/80 text-white' },
  paused: { label: 'Paused', className: 'bg-amber-500/90 text-white' },
  expired: { label: 'Expired', className: 'bg-red-500/90 text-white' },
  rejected: { label: 'Rejected', className: 'bg-red-500/90 text-white' },
  suspended: { label: 'Suspended', className: 'bg-red-600/90 text-white' },
  draft: { label: 'Draft', className: 'bg-gray-500/90 text-white' },
};

function formatNigerianPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('234')) return clean;
  if (clean.startsWith('0')) return '234' + clean.substring(1);
  return clean;
}

function formatPhoneDisplay(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('234') && clean.length === 13) {
    return `+234 ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
  }
  if (clean.length === 11 && clean.startsWith('0')) {
    const national = '234' + clean.slice(1);
    return `+234 ${national.slice(3, 6)} ${national.slice(6, 9)} ${national.slice(9)}`;
  }
  if (clean.length >= 10) {
    const national = clean.length > 10 ? clean.slice(-10) : clean;
    return `+234 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
  }
  return phone;
}

export default function AdDetailPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  
  const [ad, setAd] = useState<NormalizedAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImageError, setCurrentImageError] = useState(false);
  const [thumbnailErrors, setThumbnailErrors] = useState<Record<number, boolean>>({});
  const [showChat, setShowChat] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [favoriteAnimating, setFavoriteAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseDown, setMouseDown] = useState<number | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostButtonLoading, setBoostButtonLoading] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const { user } = useAuthStore();
  
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextImage();
    else if (distance < -minSwipeDistance) prevImage();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setMouseDown(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (mouseDown === null) return;
    const distance = mouseDown - e.clientX;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) nextImage();
      else prevImage();
      setMouseDown(null);
    }
  };

  const onMouseUp = () => {
    setMouseDown(null);
  };

  const { ad: fetchedAd, isLoading: adLoading, isError: adError, error: adFetchError } = useAdDetail(
    slug && slug !== '[slug]' && slug !== 'undefined' && slug !== 'ad-undefined' && slug !== 'null' && slug !== 'ad-null' ? slug : ''
  );

  const isValidSlug = slug && slug !== '[slug]' && slug !== 'undefined' && slug !== 'ad-undefined' && slug !== 'null' && slug !== 'ad-null';

  useEffect(() => {
    if (!isValidSlug) {
      setLoading(false);
      setError('Invalid ad URL');
    }
  }, [isValidSlug]);

  useEffect(() => {
    if (isValidSlug) {
      setCurrentImageIndex(0);
      setCurrentImageError(false);
      setThumbnailErrors({});
    }
  }, [isValidSlug]);

  useEffect(() => {
    if (adLoading) {
      setLoading(true);
      setError(null);
    } else if (adError) {
      setLoading(false);
      setError(adFetchError?.message || 'Ad not found');
    } else if (!fetchedAd) {
      setLoading(false);
      setError('Ad not found');
    } else if (fetchedAd) {
      const normalized = normalizeAd(fetchedAd, true);
      setAd(normalized);
      setLoading(false);
      setError(null);
    }
  }, [fetchedAd, adLoading, adError, adFetchError]);

  useEffect(() => {
    document.title = 'iList - Your Trusted Classified Marketplace';
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.self === window.top && window.location.href) {
        setCurrentUrl(window.location.href);
      }
    } catch (e) {
      // Ignore cross-origin iframe context errors
    }
  }, []);

  const images = useMemo(() => getImageUrls(ad), [ad]);
  const showArrows = images.length > 1;

  const currentImageUrl = currentImageError ? FALLBACK_IMAGE : (images[currentImageIndex] || images[0] || FALLBACK_IMAGE);

  // Auto-slide images
  const userInteracted = useRef(false);
  useEffect(() => {
    if (!ad || images.length <= 1) return;
    const interval = setInterval(() => {
      if (!userInteracted.current) {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [ad, images.length]);

  const pauseAutoplay = useCallback(() => {
    userInteracted.current = true;
    setTimeout(() => { userInteracted.current = false; }, 8000);
  }, []);

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleImageLoad = useCallback((_e: React.SyntheticEvent<HTMLImageElement>) => {
  }, []);

  const toggleFavorite = async () => {
    if (!requireAuth(window.location.pathname)) return;
    if (favoriteLoading || !ad) return;
    
    if (!isFavorited) {
      setFavoriteAnimating(true);
      setTimeout(() => setFavoriteAnimating(false), 500);
    }
    
    setFavoriteLoading(true);
    setIsFavorited(!isFavorited);
    try {
      if (isFavorited) {
        await favoritesApi.remove(ad.id);
        toast.success('Removed from favorites', { id: 'fav-toast' });
      } else {
        await favoritesApi.add(ad.id);
        toast.success('Added to favorites', { id: 'fav-toast' });
      }
    } catch {
      setIsFavorited(isFavorited);
      toast.error('Failed to update favorite', { id: 'fav-toast' });
    }
    setFavoriteLoading(false);
  };

  const handleWhatsApp = () => {
    if (!ad) return;
    const sellerPhone = ad.user?.phone || ad.sellerPhone;
    const adPhone = ad.whatsapp || ad.phone;
    const phone = sellerPhone || adPhone;
    
    if (!phone) {
      toast.error('WhatsApp number not available');
      return;
    }
    
    const formattedPhone = formatNigerianPhone(phone);
    const message = `Hi, I'm interested in: ${ad.title} - ${formatPrice(ad.price, ad.currency)}`;
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleCall = () => {
    if (!ad?.phone && !ad?.sellerPhone) return;
    const phone = ad.phone || ad.sellerPhone;
    window.location.href = `tel:${phone}`;
  };

  const handleChat = () => {
    if (!requireAuth(window.location.pathname)) return;
    if (!ad?.user) {
      toast.error('Cannot start chat');
      return;
    }
    if (ad.user.id && user?.id && Number(ad.user.id) === Number(user.id)) {
      toast.error("You can't message yourself");
      return;
    }
    setShowChat(true);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ResponsiveHeader />
      <main className="flex-1 container mx-auto px-4 pb-12 md:pb-6 md:pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="aspect-video max-h-[500px] bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </main>
    </div>
  );

  if (error || adError) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ResponsiveHeader />
      <main className="flex-1 container mx-auto px-4 pb-12 md:pb-6 md:pt-24">
        <div className="max-w-6xl mx-auto text-center py-16">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Ad Not Found</h1>
          <p className="mb-8 text-gray-600">{error || 'This ad may have been removed or does not exist.'}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
            <Home className="w-5 h-5" />Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

  if (!ad) return null;

  const contactPhone = ad.user?.phone || ad.phone || ad.sellerPhone;
  const displayPhone = showPhone ? formatPhoneDisplay(formatNigerianPhone(contactPhone)) : '';
  const categoryName = ad.category?.name;
  const categorySlug = ad.category?.slug || ad.category_id;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ResponsiveHeader />
      <main className="flex-1 container mx-auto px-3 sm:px-4 md:pb-6 md:pt-24 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="pt-2 mb-1 sm:mb-4 md:pt-4 flex items-center gap-1 text-xs text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-primary-600 flex items-center gap-0.5"><Home className="w-3 h-3" />Home</Link>
            <ChevronRight className="w-3 h-3" />
            {categoryName ? (
              <Link href={`/category/${categorySlug || ''}`} className="hover:text-primary-600">
                {categoryName}
              </Link>
            ) : (
              <span className="text-gray-900">Category</span>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 truncate max-w-[150px]">{ad.title}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-3 md:gap-6">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2 space-y-px min-w-0">
              {/* Image Gallery */}
              <div className="bg-white rounded-t-2xl shadow-sm border-t-8 border-primary-600 overflow-hidden">
                <div 
                  className="relative bg-gray-100 select-none cursor-pointer w-full flex items-center justify-center max-sm:min-h-[305px] min-h-[300px] lg:min-h-[450px]"
                  style={{ maxHeight: 'calc(100vh - 80px)' }}
                  onTouchStart={(e) => { pauseAutoplay(); onTouchStart(e); }}
                  onTouchMove={onTouchMove}
                  onTouchEnd={(e) => { pauseAutoplay(); onTouchEnd(); }}
                  onMouseDown={(e) => { pauseAutoplay(); onMouseDown(e); }}
                  onMouseMove={onMouseMove}
                  onMouseUp={(e) => { pauseAutoplay(); onMouseUp(); }}
                  onMouseLeave={onMouseUp}
                  onClick={() => setShowFullscreen(true)}
                >
                  {images.length > 0 ? (
                    <Image 
                      key={`${ad.id}-img-${currentImageIndex}`}
                      src={`${currentImageUrl}${currentImageUrl.includes('?') ? '&' : '?'}_cb=${ad.updated_at || ad.created_at || Date.now()}`}
                      alt={ad.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className="object-cover"
                      onError={() => setCurrentImageError(true)}
                      onLoad={handleImageLoad}
                      priority={currentImageIndex === 0}
                    />
                  ) : (
                    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-gray-100">
                      <ImageIcon className="w-16 h-16 text-gray-300 mb-2" />
                      <span className="text-gray-400 text-sm">No image available</span>
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-3 flex flex-col gap-1.5">
                    {ad.condition && (
                      <span className={`px-2 py-0.5 rounded-[5px] text-xs font-medium ${getConditionBadge(ad.condition).className}`}>
                        {getConditionBadge(ad.condition).label}
                      </span>
                    )}
                    {ad.status && !['active', 'pending'].includes(ad.status) && (
                      <span className={`px-2 py-0.5 rounded-[5px] text-xs font-medium ${(STATUS_CONFIG[ad.status] || STATUS_CONFIG.draft).className}`}>
                        {(STATUS_CONFIG[ad.status] || STATUS_CONFIG.draft).label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {showArrows && (
                  <div
                    className="flex gap-2 sm:gap-3 p-3 sm:p-4 pb-3 overflow-x-auto scrollbar-thumb snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 #e2e8f0', WebkitOverflowScrolling: 'touch' }}
                  >
                    {images.map((imgUrl: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentImageIndex(idx);
                          setCurrentImageError(false);
                        }}
                        className={`relative flex-shrink-0 snap-start w-[72px] sm:w-24 h-[72px] sm:h-24 rounded-lg overflow-hidden border-2 ${currentImageIndex === idx ? 'border-primary-500' : 'border-transparent'}`}
                      >
                        <SafeImage
                          src={imgUrl}
                          alt=""
                          className="object-cover w-full h-full"
                          containerClassName="w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price, Title, Description - All in One Card */}
              <div className="bg-white rounded-2xl shadow-sm px-4 sm:px-6 pt-1 pb-3 -mt-2 space-y-[2px]">
                {/* Price + Desktop Actions */}
                <div className="flex flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-bold text-primary-600">{formatPrice(ad.price, ad.currency)}</span>
                    {ad.negotiable && (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-[5px] whitespace-nowrap">Negotiable</span>
                    )}
                  </div>

                  {/* Mobile buttons */}
                  <div className="flex sm:hidden items-center gap-1">
                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Report this ad"
                    >
                      <Flag className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={toggleFavorite} 
                      className={`relative p-2 rounded-lg transition-all duration-300 ${
                        isFavorited 
                          ? 'text-red-500' 
                          : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                      } ${favoriteAnimating ? 'scale-125' : 'scale-100'}`}
                    >
                      <Heart 
                        className={`w-5 h-5 transition-all duration-300 ${
                          isFavorited ? 'fill-current' : ''
                        } ${favoriteAnimating ? 'animate-heartbeat' : ''}`} 
                      />
                      {favoriteAnimating && (
                        <>
                          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></span>
                          <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-75"></span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => setShowSharePopup(!showSharePopup)} 
                      className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>

                  {/* Desktop buttons */}
                  <div className="hidden sm:flex items-center gap-2">
                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="p-2 sm:p-3 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Report this ad"
                    >
                      <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button 
                      onClick={toggleFavorite} 
                      className={`relative p-2 sm:p-3 rounded-full transition-all duration-300 ${
                        isFavorited 
                          ? 'bg-red-100 text-red-500' 
                          : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'
                      } ${favoriteAnimating ? 'scale-125' : 'scale-100'}`}
                    >
                      <Heart 
                        className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                          isFavorited ? 'fill-current' : ''
                        } ${favoriteAnimating ? 'animate-heartbeat' : ''}`} 
                      />
                      {favoriteAnimating && (
                        <>
                          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></span>
                          <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-75"></span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => setShowSharePopup(!showSharePopup)} 
                      className="p-2 sm:p-3 rounded-full bg-gray-100 text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{ad.title}</h1>

                {/* Description */}
                <div className="text-gray-600 whitespace-pre-wrap break-words pt-2 text-xs sm:text-sm md:text-base">
                  {ad.description ? (
                    <>
                      <p className={`${showFullDescription ? '' : 'line-clamp-2 sm:line-clamp-3'} transition-all duration-300`}>
                        {ad.description}
                      </p>
                      <div className="flex justify-end">
                        <button 
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="text-primary-600 hover:text-primary-700 active:scale-95 font-medium inline-flex items-center mt-1 gap-0.5 text-[10px] sm:text-xs md:text-sm transition-all duration-150"
                        >
                          {showFullDescription ? 'Show less' : 'Show more'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p>No description provided.</p>
                  )}
                </div>

                {/* Separator */}
                <hr className="border-gray-200 my-4" />

                {/* Additional Info Card */}
                <div className="py-2">
                  {/* Verification Badges */}
                  <div className="flex items-center gap-3 mb-4">
                    {ad.user?.is_verified_seller && <VerifiedSellerBadge size="md" showLabel />}
                    {ad.user?.is_verified_business && <BusinessVerifiedBadge size="md" showLabel />}
                  </div>

                  {/* Location, Views */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-600">
                    {ad.location && (
                      <div>
                        <span className="text-gray-400">Location: </span>
                        <span className="font-medium text-gray-900">{ad.location || 'N/A'}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400">Views: </span>
                      <span className="font-medium text-gray-900">{ad.views || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Specifications */}
                {ad.specifications && ad.specifications.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <AdSpecifications specifications={ad.specifications} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Seller & Contact */}
            <div className="space-y-2 sm:space-y-px lg:max-w-sm min-w-0">
              {/* Boost Ad Card - Owner Only */}
              {user && ad.user && user.id === ad.user.id && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm p-5 border border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-gray-900">Boost this Ad</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">Get more views and sell faster by boosting your ad to the top.</p>
                  <button
                    onClick={() => {
                      setBoostButtonLoading(true);
                      setTimeout(() => {
                        setShowBoostModal(true);
                        setBoostButtonLoading(false);
                      }, 400);
                    }}
                    disabled={boostButtonLoading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-80 text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Zap className={`w-4 h-4 ${boostButtonLoading ? 'animate-spin' : ''}`} />
                    <span>{boostButtonLoading ? 'Opening...' : 'Boost Now'}</span>
                  </button>
                </div>
              )}

              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Contact Seller</h2>
                
                {ad.status && !['active', 'pending'].includes(ad.status) ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Ban className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {ad.status === 'sold' ? 'This item has been sold' : 
                       ad.status === 'paused' ? 'This ad is paused' : 
                       ad.status === 'suspended' ? 'This ad is suspended' : 
                       'This ad is no longer active'}
                    </p>
                    <p className="text-xs text-gray-500">Contact is disabled for this listing</p>
                  </div>
                ) : (
                  <>
                    {contactPhone ? (
                      showPhone ? (
                        <div className="mb-3">
                          <a href={`tel:${contactPhone}`} className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm sm:text-lg tracking-wide transition-colors flex items-center justify-center gap-3">
                            <Phone className="w-5 h-5 flex-shrink-0" /><span className="truncate">{displayPhone}</span>
                          </a>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            if (!requireAuth(window.location.pathname)) return;
                            setShowPhone(true);
                          }} 
                          className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 mb-3"
                        >
                          <Phone className="w-4 h-4" />Show Phone Number
                        </button>
                      )
                    ) : (
                      <p className="text-sm text-gray-500 mb-3 text-center">No phone number available</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      {contactPhone ? (
                        <button onClick={handleWhatsApp} className="py-2.5 px-2 sm:px-3 bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm">
                          <WhatsAppIcon className="w-4 h-4 flex-shrink-0" /><span className="truncate">WhatsApp</span>
                        </button>
                      ) : (
                        <button disabled className="py-2.5 px-2 sm:px-3 bg-gray-200 text-gray-400 rounded-xl font-medium text-xs sm:text-sm cursor-not-allowed flex items-center justify-center gap-1.5">
                          <WhatsAppIcon className="w-4 h-4 flex-shrink-0" /><span className="truncate">WhatsApp</span>
                        </button>
                      )}
                      <button onClick={handleChat} className="py-2.5 px-2 sm:px-3 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm">
                        <MessageCircle className="w-4 h-4 flex-shrink-0" /><span className="truncate">Chat Seller</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Seller Card */}
              {ad.user?.id || ad.user?.name ? (
                <SellerProfileCard
                  seller={{
                    id: ad.user?.id && typeof ad.user.id === 'number' ? ad.user.id : 0,
                    name: ad.user?.name || ad.sellerName || 'Unknown Seller',
                    avatar: ad.user?.avatar || null,
                    full_avatar_url: ad.user?.full_avatar_url || null,
                    google_avatar: ad.user?.google_avatar || null,
                    facebook_avatar: ad.user?.facebook_avatar || null,
                    verified: ad.user?.verified || false,
                    created_at: ad.user?.created_at || ad.createdAt,
                    phone: ad.user?.phone || ad.sellerPhone,
                    location: ad.user?.location,
                    is_verified: ad.user?.is_verified || false,
                    rating: ad.user?.rating_avg || undefined,
                  }}
                  showFollowButton={true}
                  showLocation={false}
                  showPhone={false}
                />
              ) : null}

              {/* Latest Reviews */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <LatestReviews adId={Number(ad.id)} adSlug={ad.slug} sellerId={ad.user?.id ? Number(ad.user.id) : undefined} />
              </div>

              {/* Safety Tips */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 text-base mb-3">Safety Tips</h3>
                <ul className="space-y-2">
                  {[
                    { text: 'Always meet in a secure, public location' },
                    { text: 'Inspect items carefully before payment' },
                    { text: 'Be cautious with delivery payments' },
                    { text: 'Report suspicious users immediately' },
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{tip.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Related Ads - Full Width */}
          <div className="-mx-3 sm:-mx-4 md:mx-0 overflow-hidden">
            <RelatedAds
              currentAdId={ad.id}
              categoryId={ad.category?.id ? Number(ad.category.id) : undefined}
              subcategoryId={ad.subcategory_id ? Number(ad.subcategory_id) : undefined}
              locationId={ad.category_id ? Number(ad.category_id) : undefined}
            />
          </div>
        </div>
      </main>
      <Footer />

      {/* Chat Modal */}
      {ad.user && (
        <DynamicChatModal
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          adId={Number(ad.id)}
          adTitle={ad.title}
          sellerId={ad.user.id ? Number(ad.user.id) : 0}
          sellerName={ad.user.name || ad.sellerName || 'Seller'}
          sellerVerified={ad.user.verified || false}
          isVerifiedSeller={ad.user.is_verified_seller || false}
          sellerRating={ad.user.rating_avg ?? undefined}
          sellerResponseTime={ad.user.response_time != null ? String(ad.user.response_time) : undefined}
          sellerTotalSales={ad.user.completed_transactions ?? undefined}
        />
      )}

      {/* Share Popup */}
      {showSharePopup && (
        <>
          <div 
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowSharePopup(false)}
          />
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-300">
              <div className="px-6 pt-6 pb-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-gray-900">Share this ad</h4>
                  <button 
                    onClick={() => setShowSharePopup(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4 grid grid-cols-4 gap-4">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this "${ad.title}" - ${formatPrice(ad.price, ad.currency)}\n${currentUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-green-50 hover:bg-green-100 transition-all group"
                >
                  <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <WhatsAppIcon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">WhatsApp</span>
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-all group"
                >
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <FacebookIcon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">Facebook</span>
                </a>
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this "${ad.title}"`)}&url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all group"
                >
                  <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <XIcon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">X</span>
                </a>
                <a 
                  href={`mailto:?subject=${encodeURIComponent(`Check out this: ${ad.title}`)}&body=${encodeURIComponent(`Check out this "${ad.title}" - ${formatPrice(ad.price, ad.currency)}\n${currentUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-50 hover:bg-red-100 transition-all group"
                >
                  <div className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <EmailIcon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">Email</span>
                </a>
              </div>
              
              <div className="px-6 pb-6">
                <button
                  onClick={async () => {
                    await copyToClipboard(currentUrl, 'Link copied!');
                    setShowSharePopup(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-2xl transition-all group shadow-lg"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-sm font-bold text-white">Copy Link</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fullscreen Image Viewer */}
      {showFullscreen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[200] bg-black flex flex-col"
          onClick={() => setShowFullscreen(false)}
        >
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <div className="text-white/70 text-sm font-medium">
              {currentImageIndex + 1} / {images.length}
            </div>
            <button
              onClick={() => setShowFullscreen(false)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center">
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); pauseAutoplay(); }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30"
              disabled={images.length <= 1}
            >
              <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 rotate-180" />
            </button>
            <div
              className="relative w-full h-full"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => { pauseAutoplay(); onTouchStart(e); }}
              onTouchMove={onTouchMove}
              onTouchEnd={() => { pauseAutoplay(); onTouchEnd(); }}
            >
              <Image
                key={`fs-${ad.id}-img-${currentImageIndex}`}
                src={`${currentImageUrl}${currentImageUrl.includes('?') ? '&' : '?'}_cb=${ad.updated_at || ad.created_at || Date.now()}`}
                alt={ad.title}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); pauseAutoplay(); }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30"
              disabled={images.length <= 1}
            >
              <ChevronRight className="w-7 h-7 sm:w-8 h-8" />
            </button>
          </div>
        </div>
      )}

      {/* Report Ad Modal */}
      <ReportAdModal
        adId={Number(ad.id)}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      {/* Boost Ad Modal */}
      <BoostAdModal
        adId={ad.id}
        adTitle={ad.title}
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        adCategory={ad.category}
        adPrice={ad.price}
      />
    </div>
  );
}
