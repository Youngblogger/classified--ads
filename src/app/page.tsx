'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Image as ImageIcon, Eye, Shield, Zap, Users, Star, Search, Plus, Heart, Bookmark } from 'lucide-react';
import ResponsiveHeader from '@/components/home/ResponsiveHeader';
import Footer from '@/components/layout/Footer';
import LoadMoreButton from '@/components/ui/LoadMoreButton';

import { formatPrice, formatRelativeTime, FALLBACK_IMAGE } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';
const BACKEND_URL = API_URL.replace('/api', '');

function getImageUrl(img: any): string {
  if (!img) return '';
  let url = '';
  if (typeof img === 'string') {
    url = img;
  } else if (typeof img === 'object') {
    url = img.full_url || img.full_thumbnail_url || img.display_url || img.thumbnail_url || img.thumbnail || img.url || img.src || img.original_url || img.image || img.path || img.file || '';
  }
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/storage/')) {
    return `${BACKEND_URL}${url}`;
  }
  if (url.startsWith('storage/')) {
    return `${BACKEND_URL}/${url}`;
  }
  return `${BACKEND_URL}/storage/${url}`;
}

function LazyImage({ src, alt, className, style, onError }: { src: string; alt: string; className?: string; style?: React.CSSProperties; onError?: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className="relative w-full h-full">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="w-full h-full animate-pulse" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={style}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
      />
    </div>
  );
}

function AdCardWithImage({ ad, index }: { ad: any; index: number }) {
  const [imgError, setImgError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // Extract image URL from various possible formats
  const getImageUrl = () => {
    // Check for images array
    if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
      const firstImg = ad.images[0];
      // If it's a string, use it directly
      if (typeof firstImg === 'string') return firstImg;
      // If it's an object, try various URL fields
      return firstImg.url || firstImg.full_url || firstImg.original_url || firstImg.thumbnail || FALLBACK_IMAGE;
    }
    // Check for single image field
    if (ad.image || ad.main_image) {
      const img = ad.image || ad.main_image;
      if (typeof img === 'string') return img;
      return img.url || img.full_url || FALLBACK_IMAGE;
    }
    return FALLBACK_IMAGE;
  };
  
  const imageUrl = getImageUrl();
  const imageCount = ad.images ? (Array.isArray(ad.images) ? ad.images.length : 0) : 0;
  const sellerName = ad.seller?.name || ad.sellerName || 'Unknown Seller';
  const verified = ad.seller?.verified || ad.is_verified || false;

  const getLocationDisplay = () => {
    if (!ad.location && !ad.state && !ad.lga) return 'N/A';
    
    // Use state field if available, otherwise derive from location
    const stateName = ad.state || (typeof ad.location === 'object' ? ad.location?.name : ad.location) || '';
    const lgaName = ad.lga || '';
    
    if (stateName && lgaName) {
      return `${stateName}, ${lgaName}`;
    }
    return stateName || lgaName || 'N/A';
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (favoriteLoading) return;
    
    setFavoriteLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to save ads');
        return;
      }
      
      if (isFavorited) {
        await fetch(`${API_URL}/favorites/${ad.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
      } else {
        await fetch(`${API_URL}/favorites`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ ad_id: ad.id })
        });
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const getConditionBadge = () => {
    if (!ad.condition) return null;
    const condition = ad.condition.toLowerCase();
    const badgeClasses = condition === 'new' || condition === 'brand_new' || condition === 'brand new' ? 'bg-green-50 text-green-700' :
                         condition === 'like_new' || condition === 'like new' ? 'bg-blue-50 text-blue-700' :
                         condition === 'good' ? 'bg-amber-50 text-amber-700' :
                         condition === 'fair' ? 'bg-orange-50 text-orange-700' :
                         'bg-gray-50 text-gray-600';
    const label = condition === 'new' || condition === 'brand_new' || condition === 'brand new' ? 'Brand New' :
                  condition === 'like_new' || condition === 'like new' ? 'Like New' :
                  condition === 'good' ? 'Good' :
                  condition === 'fair' ? 'Fair' : condition.charAt(0).toUpperCase() + condition.slice(1);
    return <span className={`absolute top-1.5 sm:top-2 left-1.5 sm:left-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${badgeClasses}`}>{label}</span>;
  };
  
  return (
    <Link href={`/ad/${ad.slug || ad.id}`} className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200">
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
        {imageUrl && !imgError ? (
          <LazyImage
            src={imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <img
            src={FALLBACK_IMAGE}
            alt="No image"
            className="w-full h-full object-cover"
          />
        )}
        
        {getConditionBadge()}
        
        <button 
          onClick={toggleFavorite}
          disabled={favoriteLoading}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white hover:bg-gray-50 rounded-full shadow-md transition-all duration-200 disabled:opacity-50 z-20 border border-gray-200"
        >
          <Bookmark 
            className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors ${
              isFavorited 
                ? 'text-primary-600 fill-primary-600' 
                : 'text-gray-600 hover:text-primary-600'
            }`} 
          />
        </button>
        
        {imageCount > 1 && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-black/70 text-white text-[10px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded flex items-center gap-0.5 sm:gap-1">
            <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {imageCount}
          </div>
        )}
      </div>
      
      <div className="p-2 sm:p-3">
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
          {formatPrice(ad.price, ad.currency)}
        </p>
        
        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-primary-600 transition-colors text-sm sm:text-base md:text-lg leading-snug mt-1">
          {ad.title}
        </h3>
        
        {(ad.short_description || ad.description) && (
          <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2 line-clamp-1 sm:line-clamp-2">
            {ad.short_description || ad.description}
          </p>
        )}
        
        <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3 text-gray-500 text-xs sm:text-sm">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{getLocationDisplay()}</span>
        </div>
      </div>
    </Link>
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
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [recentAds, setRecentAds] = useState<any[]>([]);
  const [allAds, setAllAds] = useState<any[]>([]);
  const [latestAds, setLatestAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [adsError, setAdsError] = useState<null | boolean>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Seeded ads will be merged with API ads in fetchAds
  }, []);
  
  const ITEMS_PER_PAGE = 12;

  const fetchAds = useCallback(async (pageNum: number = 1) => {
    if (isFetching) return;
    setIsFetching(true);
    
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const res = await fetch(`${API_URL}/ads?limit=${ITEMS_PER_PAGE}&page=${pageNum}&_t=${Date.now()}`, {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      
      const json = await res.json();
      
      let newAds: any[] = [];
      if (Array.isArray(json)) {
        newAds = json;
      } else if (json?.data && Array.isArray(json.data)) {
        newAds = json.data;
      }
      
      // Normalize ads to have images array
      newAds = newAds.map((ad: any) => {
        if (ad.slider_images && Array.isArray(ad.slider_images) && ad.slider_images.length > 0) {
          const mainImg = ad.main_image || ad.slider_images[0];
          return {
            ...ad,
            images: [mainImg, ...ad.slider_images.filter((_: any, i: number) => i > 0)]
          };
        }
        return ad;
      });
      
      // Use functional update to avoid dependency on recentAds
      setRecentAds((prevAds) => {
        const mergedAds = pageNum === 1 ? newAds : [...prevAds, ...newAds];
        // Remove duplicates by ID
        const uniqueAds = mergedAds.filter((ad: any, index: number, self: any[]) => 
          self.findIndex((a: any) => a.id === ad.id) === index
        );
        return uniqueAds;
      });
      setHasMore(newAds.length >= ITEMS_PER_PAGE);
      setAdsError(false);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      }
      setAdsError(true);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsFetching(false);
    }
  }, [isFetching]);

  useEffect(() => {
    fetchAds(1);
    
    const timeout = setTimeout(() => {
      if (loading && recentAds.length === 0) {
        console.log('Loading timeout - forcing loading to false');
        setLoading(false);
      }
    }, 15000);
    
    return () => clearTimeout(timeout);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || isFetching) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAds(nextPage);
  }, [loadingMore, hasMore, page, isFetching]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f6f7' }} suppressHydrationWarning>
      <div className="sticky top-0 z-[1001]">
        <ResponsiveHeader />
      </div>
      
      <main className="flex-1 pt-[56px] pb-16 md:pt-0 md:pb-0" suppressHydrationWarning>
        {/* Hero Section - Hidden on mobile */}
        <section className="hidden md:block w-full relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
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



        {/* Top Categories */}
        <section className="py-4 bg-white">
          <div className="px-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Top Categories
              </h2>
              <Link href="/ads" className="text-xs sm:text-sm text-primary-600 hover:underline font-medium">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
              {FEATURED_CATEGORIES.map((cat, index) => (
                <Link 
                  key={index} 
                  href={`/ads?category=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center p-3 bg-gray-50 hover:bg-primary-50 rounded-xl transition-colors border border-gray-100 hover:border-primary-200"
                >
                  <span className="text-2xl sm:text-3xl mb-1">{cat.icon}</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">{cat.name}</span>
                  <span className="text-[10px] sm:text-xs text-gray-400">{cat.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Ads - jiji.ng style */}
        <section className="py-4 bg-white">
          <div className="px-4">
            <div className="flex flex-nowrap items-center justify-between mb-2 sm:mb-3 gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 whitespace-nowrap">
                Latest Ads
              </h2>
              <Link href="/ads" className="text-xs sm:text-sm text-primary-600 hover:underline font-medium whitespace-nowrap">
                View All
              </Link>
            </div>
            
            {!mounted || loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-[8px]">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse shadow-md border border-gray-200">
                    <div className="aspect-[3/2] bg-gray-200" />
                    <div className="p-2 sm:p-5 space-y-2 sm:space-y-3">
                      <div className="h-4 sm:h-5 bg-gray-200 rounded w-full" />
                      <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : adsError ? (
              <>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-dark mb-2">Unable to load ads from server</h3>
                  <p className="text-gray-500 mb-4">Showing sample ads instead.</p>
                  <button 
                    onClick={() => fetchAds(1)} 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    <span>Try Again</span>
                  </button>
                </div>
              </>
            ) : recentAds.length > 0 ? (
              <>
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-[8px]">
                  {recentAds.map((ad: any, index: number) => (
                    <AdCardWithImage key={ad.id} ad={ad} index={index} />
                  ))}
                </div>
                <LoadMoreButton 
                  loading={loadingMore} 
                  hasMore={hasMore} 
                  onLoadMore={handleLoadMore} 
                />
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

      <Footer />
    </div>
  );
}
