'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import ResponsiveHeader from '@/components/home/ResponsiveHeader';
import Footer from '@/components/layout/Footer';
import AdCard from '@/components/ui/AdCard';
import { AdMasonrySkeleton } from '@/components/ui/Skeleton';
import MasonryGrid from '@/components/ui/MasonryGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSearchInfinite } from '@/hooks/useAds';
import { getCategoryBySlug, getSubcategoryBySlug, getCategoryBreadcrumb, getImageSuggestionForCategory } from '@/lib/category-utils';
import { CATEGORIES } from '@/config/categories';
import { ChevronRight, Home } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) return { data: [], meta: {} };
    return response.json();
  } catch {
    return { data: [], meta: {} };
  }
};

function CategoryPageContent() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const category = getCategoryBySlug(slug);
  const subcategoryInfo = getSubcategoryBySlug(slug);
  const breadcrumb = getCategoryBreadcrumb(slug);
  const displayName = subcategoryInfo?.sub.name || category?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const queryParams = useMemo(() => ({
    category: slug,
    sort_by: 'created_at',
    sort_order: 'desc',
  }), [slug]);

  const { ads, isLoading, isLoadingMore, hasMore, isError, loadMore, fallbackLevel } = useSearchInfinite(queryParams);

  // Load more ref for infinite scroll
  const [loadMoreRef, setLoadMoreRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef || !hasMore || isLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore, loadMoreRef]);

  const parentCategory = category ? null : subcategoryInfo?.parent;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ResponsiveHeader />
      <main className="flex-1 w-full px-4 pb-6 md:px-6 md:pt-24 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 py-3 md:py-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            {parentCategory && (
              <>
                <Link href={`/category/${parentCategory.slug}`} className="hover:text-primary-600 transition-colors">
                  {parentCategory.name}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              </>
            )}
            <span className="text-gray-800 font-medium truncate">{displayName}</span>
          </nav>

          {/* Category Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {displayName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {breadcrumb}{ads.length > 0 ? ` \u2022 ${ads.length} ads found` : ''}
            </p>
          </div>

          {/* Subcategories */}
          {category && category.children.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {category.children.map(sub => (
                <Link
                  key={sub.id}
                  href={`/category/${sub.slug}`}
                  className="px-4 py-2 bg-white border border-gray-200 hover:border-primary-300 hover:text-primary-600 text-gray-700 rounded-full text-sm font-medium transition-colors shadow-sm"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}

          {/* Ads Grid */}
          {isLoading ? (
            <AdMasonrySkeleton count={12} />
          ) : isError ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">!</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load ads</h3>
              <p className="text-gray-500 text-sm">Something went wrong. Please try again.</p>
            </div>
          ) : ads.length > 0 ? (
            <>
              <MasonryGrid>
                {ads.map((ad: any) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </MasonryGrid>
              {/* Load More */}
              {hasMore && (
                <div ref={setLoadMoreRef} className="h-20 flex items-center justify-center">
                  {isLoadingMore && (
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center">
              <EmptyState
                icon="search"
                title="No ads in this category yet"
                description="Be the first to post an ad in this category."
                actionLabel="Post an Ad"
                onAction={() => window.location.href = '/post-ad'}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-1 py-6">
        <AdMasonrySkeleton count={12} />
      </div>
    }>
      <CategoryPageContent />
    </Suspense>
  );
}
