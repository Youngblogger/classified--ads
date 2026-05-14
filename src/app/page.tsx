'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Image as ImageIcon, Shield, Zap, Star, Search, Plus, Bookmark } from 'lucide-react';
import ResponsiveHeader from '@/components/home/ResponsiveHeader';
import CategoryNav from '@/components/ui/CategoryNav';
import CategorySidebar from '@/components/home/CategorySidebar';
import Footer from '@/components/layout/Footer';
import LoadMoreButton from '@/components/ui/LoadMoreButton';
import { AdCardSkeleton } from '@/components/ui/Skeleton';

import { formatPrice, formatRelativeTime, FALLBACK_IMAGE, getAdImageUrl, getAdImage } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { useInfiniteAds } from '@/hooks/useAds';
import Image from 'next/image';
import toast from 'react-hot-toast';
import PremiumBadge from '@/components/ui/PremiumBadge';
import BoostedAdsCarousel from '@/components/ui/BoostedAdsCarousel';
import { getBoostCardClasses, getBoostConfig, getBoostPlan, isBoostExpired } from '@/lib/boost-config';
import { API_URL } from '@/lib/config';

function AdCardWithImage({ ad, index }: { ad: any; index: number }) {
  const [imgError, setImgError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const boostCardClasses = getBoostCardClasses(ad.boost_type);
  
  const getImageUrl = () => {
    if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
      return getAdImageUrl(ad.images[0]) || FALLBACK_IMAGE;
    }
    if (ad.image) {
      return getAdImageUrl(ad.image) || FALLBACK_IMAGE;
    }
    return getAdImage(ad) || FALLBACK_IMAGE;
  };
  
  const imageUrl = getImageUrl();
  const imageCount = ad.images ? (Array.isArray(ad.images) ? ad.images.length : 0) : 0;

  const getLocationDisplay = () => {
    const stateName = ad.state || (typeof ad.location === 'object' ? ad.location?.name : ad.location) || '';
    const lgaName = ad.lga || '';
    if (stateName && lgaName && stateName !== lgaName) {
      return `${lgaName}, ${stateName}`;
    }
    return stateName || lgaName || 'No location';
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favoriteLoading) return;
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) { toast.error('Please login to save ads'); return; }
    setFavoriteLoading(true);
    try {
      const token = useAuthStore.getState().token;
      if (!token) { toast.error('Please login to save ads'); return; }
      if (isFavorited) {
        await fetch(`${API_URL}/favorites/${ad.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
      } else {
        await fetch(`${API_URL}/favorites`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ ad_id: ad.id }) });
      }
      setIsFavorited(!isFavorited);
      if (!isFavorited) toast.success('Ad saved to favorites');
    } catch { } finally { setFavoriteLoading(false); }
  };

  const handleAdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const targetSlug = (ad.slug && ad.slug !== 'undefined') ? ad.slug : `ad-${ad.id}`;
    window.location.href = `/ad/${targetSlug}`;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(e);
  };

  return (
    <div onClick={handleAdClick} className={`group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer ${boostCardClasses}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {imageUrl && !imgError ? (
          <Image
            src={imageUrl}
            alt={ad.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <Image src={FALLBACK_IMAGE} alt="No image" fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover" />
        )}
        <PremiumBadge boostType={ad.boost_type} size="sm" />
        <button
          onClick={handleFavoriteClick}
          disabled={favoriteLoading}
          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-150 disabled:opacity-50 active:scale-90"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFavorited ? 'text-primary-600 fill-primary-600' : 'text-gray-500'}`} />
        </button>
        {imageCount > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            {imageCount}
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-sm sm:text-base font-bold text-primary-600 leading-tight">
          {formatPrice(ad.price, ad.currency)}
        </p>
        <h3 className="font-medium text-gray-900 text-xs sm:text-sm leading-snug line-clamp-2 mt-0.5">
          {ad.title}
        </h3>
        <div className="flex items-center gap-1 mt-1.5 text-[10px] sm:text-xs text-gray-400">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{getLocationDisplay()}</span>
          {ad.created_at && (
            <>
              <span className="text-gray-300">·</span>
              <span className="whitespace-nowrap">{formatRelativeTime(ad.created_at)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const FEATURED_CATEGORIES = [
  { name: 'Mobile Phones', icon: '📱', count: '2.3k' },
  { name: 'Vehicles', icon: '🚗', count: '1.5k' },
  { name: 'Property', icon: '🏠', count: '980' },
  { name: 'Electronics', icon: '💻', count: '1.8k' },
  { name: 'Fashion', icon: '👗', count: '1.4k' },
  { name: 'Jobs', icon: '💼', count: '760' },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const ITEMS_PER_PAGE = 12;

  const {
    ads: recentAds,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    isError: adsError,
    loadMore,
  } = useInfiniteAds({}, ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#F5F7FA' }} suppressHydrationWarning>
      <ResponsiveHeader />
      <CategoryNav />
      <div className="flex flex-1 max-w-screen-xl mx-auto w-full px-4 md:px-6 gap-6">
        <CategorySidebar />
        <main className="flex-1 min-w-0 relative pt-0 md:pt-[130px]" suppressHydrationWarning>
          {/* Hero Section - Hidden on mobile */}
          <section className="hidden md:block w-full relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden rounded-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative py-6 sm:py-8 md:py-10 lg:py-14 px-4">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Hero Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                  Find Anything,<br />
                  <span className="text-accent-400">Sell Everything</span>
                </h1>
                <p className="text-sm sm:text-base text-primary-100 mb-4 sm:mb-6 max-w-lg mx-auto lg:mx-0">
                  Nigeria&apos;s trusted marketplace. Connect with buyers and sellers near you.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center lg:justify-start">
                  <Link
                    href="/ads"
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-primary-600 rounded-full font-medium hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-xs sm:text-sm"
                  >
                    <Search className="w-4 h-4" />
                    <span>Browse Ads</span>
                  </Link>
                  <Link
                    href="/post-ad"
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-accent-600 text-white rounded-full font-medium hover:bg-accent-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-xs sm:text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Free Ad</span>
                  </Link>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-primary-500/30">
                  <div className="text-center lg:text-left">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">50K+</p>
                    <p className="text-[10px] sm:text-xs text-primary-200">Active Ads</p>
                  </div>
                  <div className="w-px h-6 sm:h-8 bg-primary-500/30" />
                  <div className="text-center lg:text-left">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">100K+</p>
                    <p className="text-[10px] sm:text-xs text-primary-200">Happy Users</p>
                  </div>
                  <div className="w-px h-6 sm:h-8 bg-primary-500/30" />
                  <div className="text-center lg:text-left">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">36</p>
                    <p className="text-[10px] sm:text-xs text-primary-200">States</p>
                  </div>
                </div>
              </div>
              
              {/* Hero Image / Illustration */}
              <div className="hidden lg:block relative">
                <div className="relative">
                  {/* Floating Cards */}
                  <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-2xl p-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">100% Safe</p>
                        <p className="text-xs text-slate-500">Verified transactions</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-1/4 -right-4 bg-white rounded-2xl shadow-2xl p-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Quick Sale</p>
                        <p className="text-xs text-slate-500">Sell in 24 hours</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-8 bg-white rounded-2xl shadow-2xl p-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">4.8/5 Rating</p>
                        <p className="text-xs text-slate-500">10k+ reviews</p>
                      </div>
                    </div>
                  </div>
                  

                </div>
              </div>
            </div>
          </div>
          
          {/* Wave Bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F8FAFC"/>
            </svg>
          </div>
        </section>



        {/* Boosted Ads Carousel */}
        <BoostedAdsCarousel />

        {/* Diamond Top Boosted */}
        {!isLoading && !adsError && recentAds.filter((ad: any) => {
          const plan = getBoostPlan(ad.boost_type);
          return plan === 'diamond' && ad.boost_status === 'active' && !isBoostExpired(ad);
        }).length > 0 && (
          <section className="py-3 sm:py-4 bg-gradient-to-b from-indigo-50/40 to-transparent">
            <div className="px-2 sm:px-4 md:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="text-lg sm:text-xl">💎</span>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Top Boosted Ads</h2>
                <span className="text-[10px] sm:text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Premium</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
                {recentAds
                  .filter((ad: any) => {
                    const plan = getBoostPlan(ad.boost_type);
                    return plan === 'diamond' && ad.boost_status === 'active' && !isBoostExpired(ad);
                  })
                  .slice(0, 4)
                  .map((ad: any, index: number) => (
                    <AdCardWithImage key={`diamond-${ad.id}`} ad={ad} index={index} />
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Platinum + Gold Featured */}
        {!isLoading && !adsError && recentAds.filter((ad: any) => {
          const plan = getBoostPlan(ad.boost_type);
          return (plan === 'platinum' || plan === 'gold') && ad.boost_status === 'active' && !isBoostExpired(ad);
        }).length > 0 && (
          <section className="py-3 sm:py-4 bg-white">
            <div className="px-2 sm:px-4 md:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="text-lg sm:text-xl">⭐</span>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Featured Boost</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
                {recentAds
                  .filter((ad: any) => {
                    const plan = getBoostPlan(ad.boost_type);
                    return (plan === 'platinum' || plan === 'gold') && ad.boost_status === 'active' && !isBoostExpired(ad);
                  })
                  .slice(0, 4)
                  .map((ad: any, index: number) => (
                    <AdCardWithImage key={`featured-${ad.id}`} ad={ad} index={index} />
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Latest Ads */}
        <section className="py-4 bg-white">
          <div className="px-2 sm:px-4 md:px-6 lg:px-8">
            <div className="flex flex-nowrap items-center justify-between mb-3 sm:mb-4 gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 whitespace-nowrap">
                Latest Ads
              </h2>
              <Link href="/ads" className="text-xs sm:text-sm text-primary-600 hover:underline font-medium whitespace-nowrap">
                View All
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <AdCardSkeleton key={i} />
                ))}
              </div>
            ) : adsError ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-dark mb-2">Unable to load ads from server</h3>
                <p className="text-gray-500 mb-4">Please try again later.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  <span>Try Again</span>
                </button>
              </div>
            ) : recentAds.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
                  {recentAds
                    .filter((ad: any) => {
                      const plan = getBoostPlan(ad.boost_type);
                      const isActiveBoost = plan && ad.boost_status === 'active' && !isBoostExpired(ad);
                      return !isActiveBoost;
                    })
                    .map((ad: any, index: number) => (
                      <AdCardWithImage key={`${ad.id}-${index}`} ad={ad} index={index} />
                    ))}
                </div>
                {hasMore && (
                  <LoadMoreButton 
                    loading={isLoadingMore} 
                    hasMore={hasMore} 
                    onLoadMore={loadMore} 
                  />
                )}
                {isLoadingMore && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 mt-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <AdCardSkeleton key={i} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-5">
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-dark mb-2">No ads yet</h3>
                <p className="text-gray-500 mb-5">Be the first to post an ad in your area!</p>
                <Link href="/post-ad" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors">
                  <Plus className="w-5 h-5" />
                  <span>Post Your First Ad</span>
                </Link>
              </div>
            )}
          </div>
        </section>




      </main>
      </div>

      <Footer />
    </div>
  );
}
