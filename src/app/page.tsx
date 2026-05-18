'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Zap, Star, Search, Plus, ArrowUp } from 'lucide-react';
import ResponsiveHeader from '@/components/home/ResponsiveHeader';
import CategorySidebar from '@/components/home/CategorySidebar';
import Footer from '@/components/layout/Footer';
import { AdGridSkeleton } from '@/components/ui/Skeleton';
import LoadMoreButton from '@/components/ui/LoadMoreButton';

import { useAuthStore } from '@/lib/store';
import { useInfiniteAds } from '@/hooks/useAds';
import AdCard from '@/components/ui/AdCard';
import { getBoostPlan, isBoostExpired, calculateBoostScore } from '@/lib/boost-config';

function buildUnifiedFeed(ads: any[]): any[] {
  const boosted = ads.filter((ad: any) => {
    const plan = getBoostPlan(ad.boost_type);
    return plan && ad.boost_status === 'active' && !isBoostExpired(ad);
  });
  const normal = ads.filter((ad: any) => {
    const plan = getBoostPlan(ad.boost_type);
    const isActiveBoost = plan && ad.boost_status === 'active' && !isBoostExpired(ad);
    return !isActiveBoost;
  });

  const scoredBoosted = boosted
    .map(ad => ({ ad, score: calculateBoostScore(ad) }))
    .sort((a, b) => b.score - a.score);

  const result: any[] = [];
  let bi = 0;
  let ni = 0;

  const pattern = [2, 2, 1, 2];
  let pi = 0;

  while (bi < scoredBoosted.length || ni < normal.length) {
    const count = pattern[pi % pattern.length];
    const isBoost = pi % 2 === 0;

    if (isBoost) {
      for (let i = 0; i < count && bi < scoredBoosted.length; i++) {
        result.push(scoredBoosted[bi].ad);
        bi++;
      }
    } else {
      for (let i = 0; i < count && ni < normal.length; i++) {
        result.push(normal[ni]);
        ni++;
      }
    }

    pi++;

    if (bi >= scoredBoosted.length && ni < normal.length) {
      while (ni < normal.length) {
        result.push(normal[ni]);
        ni++;
      }
      break;
    }
    if (ni >= normal.length && bi < scoredBoosted.length) {
      while (bi < scoredBoosted.length) {
        result.push(scoredBoosted[bi].ad);
        bi++;
      }
      break;
    }
  }

  return result;
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

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 1200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadMore = useCallback(() => {
    loadMore();
    setTimeout(() => {
      setShowBackToTop(true);
    }, 500);
  }, [loadMore]);

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#F5F7FA' }} suppressHydrationWarning>
      <ResponsiveHeader />
      <div className="flex flex-1 max-w-screen-xl mx-auto w-full px-4 md:px-6 gap-4 mt-[48px] md:mt-[112px]">
        <CategorySidebar />
        <main className="flex-1 min-w-0 relative pt-0" suppressHydrationWarning>
          {/* Hero Section - Hidden on mobile */}
          <section className="hidden md:block w-full relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden rounded-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative py-5 sm:py-6 md:py-8 lg:py-10 px-4">
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



        {/* Unified Latest Ads Feed */}
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
              <AdGridSkeleton count={8} />
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
                  {buildUnifiedFeed(recentAds).map((ad: any) => (
                    <AdCard key={`ad-${ad.id}`} ad={ad} />
                  ))}
                </div>
                {!isLoading && !adsError && (
                  <LoadMoreButton
                    onClick={handleLoadMore}
                    loading={isLoadingMore}
                    hasMore={hasMore}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-5">
                  <span className="text-4xl text-gray-400">📭</span>
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

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-white border-2 border-primary-500 text-primary-600 rounded-full shadow-lg hover:shadow-xl hover:bg-primary-50 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center animate-fade-in"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      <Footer />
    </div>
  );
}
