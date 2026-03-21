'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Image as ImageIcon, Eye } from 'lucide-react';
import OLXHeader from '@/components/home/OLXHeader';
import Footer from '@/components/layout/Footer';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getImageUrl(img: any): string {
  if (!img) return '';
  let url = '';
  if (typeof img === 'string') {
    url = img;
  } else if (typeof img === 'object') {
    url = img.url || img.src || img.display_url || img.original_url || img.thumbnail_url || img.thumbnail || img.image || img.path || img.file || '';
  }
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = API_URL.replace('/api', '');
  if (url.startsWith('/storage/')) {
    return `${baseUrl}${url}`;
  }
  return `${baseUrl}/storage/${url}`;
}

function AdCardWithImage({ ad }: { ad: any }) {
  const [imgError, setImgError] = useState(false);
  
  const imagesArray = Array.isArray(ad.images) ? ad.images : [];
  let primaryImage = imagesArray.find((img: any) => img?.is_primary);
  if (!primaryImage && imagesArray.length > 0) {
    primaryImage = imagesArray[0];
  }
  const imageUrl = primaryImage ? getImageUrl(primaryImage) : '';
  
  return (
    <Link href={`/ad/${ad.slug}`} className="card card-hover group">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-400 mt-2">No Image</p>
            </div>
          </div>
        )}
        {ad.condition === 'new' && (
          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded">New</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-dark line-clamp-2 group-hover:text-primary-600 transition-colors">
          {ad.title}
        </h3>
        <p className="text-xl font-bold text-primary-600 mt-2">
          {formatPrice(ad.price, ad.currency)}
        </p>
        <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{ad.location?.name || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
          <span>{formatRelativeTime(ad.created_at)}</span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {ad.views || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [recentAds, setRecentAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recentRes, catsRes] = await Promise.all([
          fetch(`${API_URL}/ads/recent?limit=8`),
          fetch(`${API_URL}/categories`)
        ]);
        
        const recentJson = await recentRes.json();
        const catsJson = await catsRes.json();
        
        setRecentAds(recentJson.data?.data || recentJson.data || recentJson || []);
        setCategories(catsJson.data?.data || catsJson.data || catsJson || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <OLXHeader />
      
      <main className="flex-1">
        {/* Browse Categories */}
        <section className="py-8 bg-white border-b border-gray-100">
          <div className="container-app">
            {loading ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category: any) => (
                  <a
                    key={category.id}
                    href={`/ads?category=${category.slug}`}
                    className="flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-50 transition-colors w-20"
                    title={category.name}
                  >
                    <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                      {category.icon || '📦'}
                    </div>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {/* Recent Ads */}
        <section className="py-10 bg-gray-50">
          <div className="container-app">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Ads</h2>
              <a href="/ads" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm">
                View All <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-5 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentAds.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {recentAds.slice(0, 8).map((ad: any) => (
                  <AdCardWithImage key={ad.id} ad={ad} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No recent ads available</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-primary-600">
          <div className="container-app text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Start Selling Today</h2>
            <p className="text-primary-100 text-sm md:text-base mb-6 max-w-xl mx-auto">
              Join thousands of users buying and selling on our platform every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/post-ad" className="bg-white text-primary-600 px-6 py-2.5 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Post an Ad
              </a>
              <a href="/register" className="bg-primary-700 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary-800 transition-colors">
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
