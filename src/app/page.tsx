'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Image as ImageIcon, Eye, Shield, Zap, Users, Star, Search, Plus, Heart, Bookmark } from 'lucide-react';
import Header from '@/components/home/Header';
import Footer from '@/components/layout/Footer';
import LoadMoreButton from '@/components/ui/LoadMoreButton';
import { formatPrice, formatRelativeTime, FALLBACK_IMAGE } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import seededAds from './seededAds.json';

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
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          imgRef.current.src = src;
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <img
      ref={imgRef}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      style={style}
      onLoad={() => setIsLoaded(true)}
      onError={handleError}
      loading="lazy"
    />
  );
}

function AdCardWithImage({ ad, index }: { ad: any; index: number }) {
  const [imgError, setImgError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // Handle new seeded ads structure (location as string) vs API (location as object)
  const imageUrl = ad.images && ad.images.length > 0 
    ? (typeof ad.images[0] === 'string' ? ad.images[0] : ad.images[0].url || ad.images[0].full_url)
    : FALLBACK_IMAGE;
  const imageCount = Array.isArray(ad.images) ? ad.images.length : 0;
  const sellerName = ad.seller?.name || ad.sellerName || 'Unknown Seller';
  const verified = ad.seller?.verified || ad.is_verified || false;

  const getLocationDisplay = () => {
    if (!ad.location) return 'N/A';
    if (typeof ad.location === 'string') return ad.lga ? `${ad.location}, ${ad.lga}` : ad.location;
    return ad.lga ? `${ad.location.name || ad.location}, ${ad.lga}` : ad.location.name || ad.location;
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
    const badgeClasses = condition === 'new' ? 'bg-green-50 text-green-700' :
                         condition === 'like_new' || condition === 'like new' ? 'bg-blue-50 text-blue-700' :
                         condition === 'good' ? 'bg-gray-50 text-gray-600' :
                         condition === 'used' ? 'bg-amber-50 text-amber-700' :
                         'bg-amber-50 text-amber-700';
    const label = condition === 'new' ? 'New' :
                  condition === 'like_new' || condition === 'like new' ? 'Like New' :
                  condition === 'good' ? 'Good' :
                  condition === 'used' ? 'Used' : 'Fair';
    return <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded-full ${badgeClasses}`}>{label}</span>;
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
          className="absolute top-3 right-3 p-2 bg-white hover:bg-gray-50 rounded-full shadow-md transition-all duration-200 disabled:opacity-50 z-20 border border-gray-200"
        >
          <Bookmark 
            className={`w-5 h-5 transition-colors ${
              isFavorited 
                ? 'text-primary-600 fill-primary-600' 
                : 'text-gray-600 hover:text-primary-600'
            }`} 
          />
        </button>
        
        {imageCount > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" />
            {imageCount}
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-primary-600 transition-colors text-lg leading-snug">
          {ad.title}
        </h3>
        
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {formatPrice(ad.price, ad.currency)}
        </p>
        
        {(ad.short_description || ad.description) && (
          <p className="text-gray-500 text-sm mt-2 line-clamp-2">
            {ad.short_description || ad.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
          <MapPin className="w-4 h-4 flex-shrink-0" />
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
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [adsError, setAdsError] = useState<null | boolean>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Seeded ads will be merged with API ads in fetchAds
  }, []);
  
  const ITEMS_PER_PAGE = 12;

  const fetchAds = useCallback(async (pageNum: number = 1, forceRefresh = false) => {
    if (isFetching) return;
    
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setIsFetching(true);
    
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
      } else {
        newAds = [];
      }
      
      // Normalize ads to have images array
      newAds = newAds.map((ad: any) => {
        if (ad.slider_images && Array.isArray(ad.slider_images) && ad.slider_images.length > 0) {
          // Convert main_image + slider_images format to images array
          const mainImg = ad.main_image || ad.slider_images[0];
          return {
            ...ad,
            images: [mainImg, ...ad.slider_images.filter((_: any, i: number) => i > 0)]
          };
        }
        return ad;
      });
      
      // Use API ads only, merge with seeded if any
      const mergedAds = pageNum === 1 
        ? [...seededAds, ...newAds]  // Seeded (if any) first, then API
        : [...recentAds, ...newAds];
      
      // Remove duplicates by ID
      const uniqueAds = mergedAds.filter((ad: any, index: number, self: any[]) => 
        self.findIndex((a: any) => a.id === ad.id) === index
      );
      
      setRecentAds(uniqueAds);
      setHasMore(newAds.length === ITEMS_PER_PAGE);
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
    fetchAds(1, true);
    
    const timeout = setTimeout(() => {
      if (loading && recentAds.length === 0) {
        console.log('Loading timeout - forcing loading to false');
        setLoading(false);
      }
    }, 15000);
    
    return () => clearTimeout(timeout);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAds(nextPage);
    }
  }, [loadingMore, hasMore, page]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f6f7' }} suppressHydrationWarning>
      <Header />
      
      <main className="flex-1" suppressHydrationWarning>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="container-app relative py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  Find Anything,<br />
                  <span className="text-accent-400">Sell Everything</span>
                </h1>
                <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-lg mx-auto lg:mx-0">
                  Nigeria&apos;s trusted marketplace for buying and selling. Connect with thousands of buyers and sellers near you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/ads"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Search className="w-5 h-5" />
                    <span>Browse Ads</span>
                  </Link>
                  <Link
                    href="/post-ad"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-600 text-white rounded-full font-semibold hover:bg-accent-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Post Free Ad</span>
                  </Link>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-center lg:justify-start gap-8 mt-10 pt-8 border-t border-primary-500/30">
                  <div className="text-center lg:text-left">
                    <p className="text-2xl md:text-3xl font-bold text-white">50K+</p>
                    <p className="text-sm text-primary-200">Active Ads</p>
                  </div>
                  <div className="w-px h-12 bg-primary-500/30" />
                  <div className="text-center lg:text-left">
                    <p className="text-2xl md:text-3xl font-bold text-white">100K+</p>
                    <p className="text-sm text-primary-200">Happy Users</p>
                  </div>
                  <div className="w-px h-12 bg-primary-500/30" />
                  <div className="text-center lg:text-left">
                    <p className="text-2xl md:text-3xl font-bold text-white">36</p>
                    <p className="text-sm text-primary-200">States Covered</p>
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

        {/* Latest Ads - jiji.ng style */}
        <section className="py-4 bg-white">
          <div className="px-[15px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Latest Ads
                </h2>
              </div>
              <Link href="/ads" className="text-sm text-primary-600 hover:underline font-medium">
                View All
              </Link>
            </div>
            
            {!mounted || loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-[8px]">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse shadow-md border border-gray-200">
                    <div className="aspect-[3/2] bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-full" />
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-6 bg-gray-200 rounded w-1/2" />
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
                    onClick={() => fetchAds(1, true)} 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    <span>Try Again</span>
                  </button>
                </div>
                {seededAds.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-[8px]">
                    {seededAds.map((ad: any, index: number) => (
                      <AdCardWithImage key={`seeded-${index}`} ad={ad} index={index} />
                    ))}
                  </div>
                )}
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
