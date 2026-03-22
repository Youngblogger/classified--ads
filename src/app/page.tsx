'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Image as ImageIcon, Eye, Shield, Zap, Users, Star, Search, Plus, ChevronRight } from 'lucide-react';
import Header from '@/components/home/Header';
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
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400 mt-2">No Image</p>
            </div>
          </div>
        )}
        {ad.condition === 'new' && (
          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded">New</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {ad.title}
        </h3>
        {(ad.short_description || ad.description) && (
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
            {ad.short_description || ad.description}
          </p>
        )}
        <p className="text-xl font-bold text-primary-600 mt-2">
          {formatPrice(ad.price, ad.currency)}
        </p>
        <div className="flex items-center gap-2 mt-3 text-slate-500 text-sm">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{ad.location?.name || 'N/A'}</span>
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

const TRUST_FEATURES = [
  { icon: Shield, title: 'Verified Sellers', description: 'All sellers are verified for your safety' },
  { icon: Zap, title: 'Fast & Easy', description: 'Post your ad in under 5 minutes' },
  { icon: Users, title: 'Trusted by Millions', description: "Nigeria's most loved marketplace" },
  { icon: Star, title: '5-Star Support', description: "We're here to help 24/7" },
];

export default function HomePage() {
  const [recentAds, setRecentAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const recentRes = await fetch(`${API_URL}/ads/recent?limit=8`);
        const recentJson = await recentRes.json();
        setRecentAds(recentJson.data?.data || recentJson.data || recentJson || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1">
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
                  Nigeria's trusted marketplace for buying and selling. Connect with thousands of buyers and sellers near you.
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
                  
                  {/* Main Card */}
                  <div className="bg-white rounded-3xl shadow-2xl p-6 ml-12">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                        <span className="text-3xl">🚗</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">Toyota Camry 2023</p>
                        <p className="text-sm text-slate-500">Lagos, Nigeria</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-primary-600">₦25,000,000</p>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">Verified</span>
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

        {/* Trust Section */}
        <section className="py-12 bg-slate-50">
          <div className="container-app">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {TRUST_FEATURES.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
                      <IconComponent className="w-7 h-7 text-primary-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-slate-500">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-12 bg-white">
          <div className="container-app">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Browse Categories</h2>
                <p className="text-slate-600 mt-1">Find what you're looking for</p>
              </div>
              <Link href="/ads" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {FEATURED_CATEGORIES.map((category, index) => (
                <Link
                  key={index}
                  href={`/ads?category=${category.name.toLowerCase().replace(/ /g, '-')}`}
                  className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl hover:bg-primary-50 hover:shadow-md transition-all duration-300 group"
                >
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</span>
                  <p className="font-medium text-slate-900 text-center mb-1">{category.name}</p>
                  <p className="text-xs text-slate-500">{category.count} ads</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Ads */}
        <section className="py-12 bg-slate-50">
          <div className="container-app">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Recent Ads</h2>
                <p className="text-slate-600 mt-1">Fresh listings from sellers near you</p>
              </div>
              <Link href="/ads" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-slate-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-5 bg-slate-200 rounded w-1/2" />
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentAds.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {recentAds.slice(0, 8).map((ad: any) => (
                  <AdCardWithImage key={ad.id} ad={ad} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 mb-4">No recent ads available</p>
                <Link href="/post-ad" className="btn-primary inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Post the First Ad</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="container-app relative text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Start Selling?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
              Join thousands of sellers already growing their business on iList. It's free, fast, and easy!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/post-ad"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                <span>Post Your Ad Free</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Users className="w-5 h-5" />
                <span>Create Account</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
