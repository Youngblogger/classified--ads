'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AdCard from '@/components/ui/AdCard';
import { ArrowRight } from 'lucide-react';
import { adsApi, categoriesApi } from '@/lib/api';
import { AdGridSkeleton, CategoryGridSkeleton } from '@/components/ui/Skeleton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const fetcher = (url: string) => fetch(url).then(r => r.json()).catch(() => null);

export default function HomePage() {
  const { data: featuredData, isLoading: featuredLoading } = useSWR(
    `${API_URL}/ads/featured?limit=4`,
    fetcher,
    { revalidateOnFocus: true, revalidateOnReconnect: true, fallbackData: [] }
  );
  
  const { data: recentData, isLoading: recentLoading } = useSWR(
    `${API_URL}/ads/recent?limit=4`,
    fetcher,
    { revalidateOnFocus: true, revalidateOnReconnect: true, fallbackData: [] }
  );
  
  const { data: categoriesData, isLoading: categoriesLoading } = useSWR(
    `${API_URL}/categories`,
    fetcher,
    { revalidateOnFocus: true, revalidateOnReconnect: true, fallbackData: [] }
  );

  const featuredAds = featuredData?.data || featuredData || [];
  const recentAds = recentData?.data || recentData || [];
  const categories = categoriesData?.data || categoriesData || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 py-16 md:py-24">
          <div className="container-app text-center text-white">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Find What You Need, Sell What You Don't
            </h1>
            <p className="text-primary-100 text-lg max-w-2xl mx-auto">
              The best marketplace to buy and sell items locally. Safe, fast, and trusted by millions.
            </p>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container-app">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Ads</h2>
              <a href="/ads" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            
            {featuredAds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredAds.slice(0, 4).map((ad: any, idx: number) => (
                  <AdCard key={ad.id} ad={ad} priority={idx < 4} />
                ))}
              </div>
            ) : (
              <AdGridSkeleton count={4} />
            )}
          </div>
        </section>

        <section className="py-12">
          <div className="container-app">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Categories</h2>
            {categories.length > 0 ? (
              <div className="overflow-hidden">
                <div className="flex gap-4 animate-marquee" style={{ width: 'fit-content', animation: 'marquee 40s linear infinite' }}>
                  {categories.slice(0, 10).map((category: any) => (
                    <a
                      key={category.id}
                      href={`/ads?category=${category.slug}`}
                      className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all text-center group flex-shrink-0 w-40"
                    >
                      <div className="text-3xl mb-2">{category.icon || '📦'}</div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 text-sm">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.ad_count || 0} ads</p>
                    </a>
                  ))}
                  {/* Duplicate for seamless marquee */}
                  {categories.slice(0, 10).map((category: any) => (
                    <a
                      key={`dup-${category.id}`}
                      href={`/ads?category=${category.slug}`}
                      className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all text-center group flex-shrink-0 w-40"
                    >
                      <div className="text-3xl mb-2">{category.icon || '📦'}</div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 text-sm">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.ad_count || 0} ads</p>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <CategoryGridSkeleton count={8} />
            )}
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container-app">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Ads</h2>
              <a href="/ads" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            
            {recentAds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentAds.slice(0, 4).map((ad: any, idx: number) => (
                  <AdCard key={ad.id} ad={ad} priority={idx < 4} />
                ))}
              </div>
            ) : (
              <AdGridSkeleton count={4} />
            )}
          </div>
        </section>

        <section className="py-16 bg-primary-600">
          <div className="container-app text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Start Selling Today</h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of happy users who are buying and selling on our platform every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/post-ad" className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Post an Ad
              </a>
              <a href="/register" className="bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-800 transition-colors">
                Create Account
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
