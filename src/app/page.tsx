'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, ArrowUp } from 'lucide-react';
import ResponsiveHeader from '@/components/home/ResponsiveHeader';
import EnterpriseSidebar from '@/components/home/EnterpriseSidebar';
import Footer from '@/components/layout/Footer';
import { AdMasonrySkeleton } from '@/components/ui/Skeleton';
import MasonryGrid from '@/components/ui/MasonryGrid';
import LoadMoreButton from '@/components/ui/LoadMoreButton';

import { useAuthStore } from '@/lib/store';
import { useInfiniteAds, useCategories } from '@/hooks/useAds';
import { useRealtimeHomepage } from '@/hooks/useRealtime';
import AdCard from '@/components/ui/AdCard';
import { getBoostPlan, isBoostExpired, calculateBoostScore } from '@/lib/boost-config';
import { safeArray } from '@/lib/safe-data';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

function buildUnifiedFeed(ads: any[]): any[] {
  const safeAds = safeArray<any>(ads);
  const seen = new Set<number | string>();
  const deduped = safeAds.filter((ad: any) => {
    if (!ad || ad.id == null) return true;
    if (seen.has(ad.id)) return false;
    seen.add(ad.id);
    return true;
  });
  const boosted = deduped.filter((ad: any) => {
    if (!ad || !ad.id) return false;
    const plan = getBoostPlan(ad.boost_type);
    return plan && ad.boost_status === 'active' && !isBoostExpired(ad);
  });
  const normal = deduped.filter((ad: any) => {
    const plan = getBoostPlan(ad?.boost_type);
    const isActiveBoost = plan && ad?.boost_status === 'active' && !isBoostExpired(ad);
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

const FALLBACK_IMG = '/fallback-category.svg';

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'mobile-phones': 'Mobile-phone',
  'baby-kids': 'babyandKids',
  'home-furniture': 'furniture',
  'health-beauty': 'healthandbeuty',
  'jobs': 'job',
  'sports': 'sportandfitness',
  'sports-fitness': 'sportandfitness',
  'vehicles': 'vehicles',
  'pets': 'pets',
  'property': 'property',
  'services': 'services',
  'electronics': 'Electronics',
  'fashion': 'fashion',
  'laptops': 'laptop',
  'pet-food': 'Petfood',
  'smartwatches': 'smartwatch',
  'accessories': 'accessories',
};

function getCategoryImageSrc(slug: string) {
  const name = CATEGORY_IMAGE_MAP[slug] || slug;
  return `/categoryPictures/${name}.webp`;
}

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  (e.target as HTMLImageElement).src = FALLBACK_IMG;
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const { categories: supabaseCategories, isLoading: catLoading } = useCategories();
  useRealtimeHomepage();
  const ITEMS_PER_PAGE = 24;

  const {
    ads: recentAds,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    isError: adsError,
    loadMore,
  } = useInfiniteAds({ status: 'active' }, ITEMS_PER_PAGE);

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
      <ErrorBoundary>
        <ResponsiveHeader />
      </ErrorBoundary>
      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full px-0 md:px-4 gap-4 mt-[8px] md:mt-[104px]">
        <ErrorBoundary>
          <EnterpriseSidebar />
        </ErrorBoundary>
        <main className="flex-1 min-w-0 relative pt-0">
          <ErrorBoundary>
          {/* Hero + Category Grid - Hidden on mobile */}
          <section className="hidden md:block w-full">
            {/* Compact Hero Banner */}
            <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden rounded-b-[5px] mb-6">
              <div className="relative px-6 py-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                      Find Anything,{' '}
                      <span className="text-accent-400">Sell Everything</span>
                    </h1>
                    <p className="text-primary-100 text-sm mt-1">
                      Nigeria&apos;s trusted marketplace
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href="/ads"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      Browse Ads
                    </Link>
                    <Link
                      href="/post-ad"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:bg-accent-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Post Free Ad
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Grid */}
            <div>
              {catLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 bg-white rounded-lg p-2 border border-gray-100 animate-pulse">
                      <div className="w-14 h-14 rounded-full bg-gray-200" />
                      <div className="h-2.5 bg-gray-200 rounded w-14" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {safeArray(supabaseCategories).filter((cat: any) => cat && !cat.parent_id).slice(0, 12).map((cat: any) => (
                    <Link
                      key={cat.id}
                      href={`/ads?category=${cat.slug}`}
                      className="flex flex-col items-center gap-1 bg-white rounded-lg p-2 border border-gray-100 hover:border-gray-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <img
                        src={getCategoryImageSrc(cat.slug)}
                        alt={cat.name}
                        className="w-14 h-14 object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={handleImgError}
                      />
                      <span className="text-[11px] font-medium text-gray-700 text-center leading-snug line-clamp-2">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

        {/* Mobile Hero + Category Grid */}
        <section className="block md:hidden">
          {/* Compact Hero */}
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden rounded-b-[5px] mb-4">
            <div className="relative px-4 py-4">
              <h1 className="text-lg font-bold text-white">
                Find Anything,{' '}
                <span className="text-accent-400">Sell Everything</span>
              </h1>
              <p className="text-primary-100 text-xs mt-0.5 mb-3">
                Nigeria&apos;s trusted marketplace
              </p>
              <div className="flex gap-2">
                <Link
                  href="/ads"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-primary-600 rounded-lg text-xs font-medium"
                >
                  <Search className="w-3.5 h-3.5" />
                  Browse Ads
                </Link>
                <Link
                  href="/post-ad"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent-600 text-white rounded-lg text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Post Free Ad
                </Link>
              </div>
            </div>
          </div>

          {/* Category Grid */}
          <div className="mb-2">
            {catLoading ? (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 bg-white rounded-lg py-2 px-1.5 border border-gray-100 animate-pulse">
                    <div className="w-11 h-11 bg-gray-200" />
                    <div className="h-2 bg-gray-200 rounded w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {safeArray(supabaseCategories).filter((cat: any) => cat && !cat.parent_id).slice(0, 12).map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/ads?category=${cat.slug}`}
                    className="flex flex-col items-center gap-1 bg-white rounded-lg py-2 px-1.5 border border-gray-100 active:scale-95 transition-all duration-150"
                  >
                    <img
                        src={getCategoryImageSrc(cat.slug)}
                        alt={cat.name}
                        className="w-11 h-11 object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={handleImgError}
                      />
                    <span className="text-[10px] font-medium text-gray-700 text-center leading-snug line-clamp-2">{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Unified Latest Ads Feed */}
        <section className="py-5 sm:py-6 bg-white">
          <div className="px-1 sm:px-3 md:px-4">
            <div className="flex flex-nowrap items-center justify-between mb-3 sm:mb-4 gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 whitespace-nowrap">
                Fresh Listings
              </h2>
              <Link href="/ads" className="text-xs sm:text-sm text-primary-600 hover:underline font-medium whitespace-nowrap">
                View All
              </Link>
            </div>
            
            {isLoading ? (
              <AdMasonrySkeleton count={8} />
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
                <MasonryGrid>
                  {buildUnifiedFeed(recentAds).filter((ad: any) => {
                    if (!ad || !ad.id) {
                      if (process.env.NODE_ENV === 'development') {
                        console.warn('[HomePage] Skipping invalid ad in feed:', ad);
                      }
                      return false;
                    }
                    return true;
                  }).map((ad: any) => (
                    <AdCard key={`ad-${ad.id}`} ad={ad} />
                  ))}
                </MasonryGrid>
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

          </ErrorBoundary>
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
