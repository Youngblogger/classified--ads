'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { storeApi, followApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { getAdImageUrl, formatPrice } from '@/lib/utils';
import Header from '@/components/home/Header';
import toast from 'react-hot-toast';
import {
  MapPin, Globe, Users, ImageIcon, Eye, Heart,
  Mail, Phone, ExternalLink, Calendar, Loader2,
  AlertCircle, ChevronDown, ChevronUp, Share2, Copy,
  Check, Store, Instagram, Twitter, Facebook
} from 'lucide-react';
import VerifiedSellerBadge from '@/components/verification/VerifiedSellerBadge';
import BusinessVerifiedBadge from '@/components/verification/BusinessVerifiedBadge';

interface StoreImage {
  url?: string;
  display_url?: string;
  thumbnail_url?: string;
  full_url?: string;
  is_primary?: boolean;
}

interface StoreAd {
  id: number;
  title: string;
  slug: string;
  price: number;
  currency: string;
  images: StoreImage[];
  location?: { id: number; name: string };
  lga?: string;
  state?: string;
  created_at: string;
}

interface StoreData {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  description: string;
  logo?: StoreImage;
  banner?: StoreImage;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  followers_count: number;
  ads_count: number;
  location?: string;
  is_verified?: boolean;
  is_verified_business?: boolean;
  created_at: string;
  ads: StoreAd[];
}

export default function StoreProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user: authUser, isAuthenticated } = useAuthStore();

  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const fetchStore = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      setError('');
      const res = await storeApi.getBySlug(slug);
      const data = (res.data as any)?.data ?? null;
      setStore(data);
      setFollowerCount(data.followers_count || 0);

      if (isAuthenticated && data.user_id !== authUser?.id) {
        try {
          const followRes = await storeApi.checkFollow(data.id);
          setIsFollowing((followRes.data as any)?.data?.is_following || (followRes.data as any)?.data?.following || false);
        } catch {}
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load store';
      setError(msg);
      setStore(null);
    } finally {
      setLoading(false);
    }
  }, [slug, isAuthenticated, authUser?.id]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  useEffect(() => {
    const onInvalidate = () => fetchStore();
    window.addEventListener('ilist:cache-invalidate', onInvalidate);
    return () => window.removeEventListener('ilist:cache-invalidate', onInvalidate);
  }, [fetchStore]);

  const handleFollowToggle = async () => {
    if (!store || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await storeApi.unfollow(store.id);
        setIsFollowing(false);
        setFollowerCount(c => Math.max(0, c - 1));
        toast.success('Unfollowed store', { id: 'follow-toast' });
      } else {
        await storeApi.follow(store.id);
        setIsFollowing(true);
        setFollowerCount(c => c + 1);
        toast.success('Following store', { id: 'follow-toast' });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Action failed';
      toast.error(msg, { id: 'follow-toast' });
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied');
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getImageSrc = (img: StoreImage | undefined | null): string => {
    if (!img) return '';
    return getAdImageUrl(img);
  };

  const isOwnStore = store && authUser && store.user_id === authUser.id;

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-48 sm:h-64 bg-gray-200 rounded-2xl" />
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-20 px-4 sm:px-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-300 rounded-2xl border-4 border-white" />
              <div className="flex-1 space-y-3 pt-4 sm:pt-0">
                <div className="h-8 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-72 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !store) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-2xl p-12 text-center shadow-card">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Store Not Found</h3>
            <p className="text-gray-500 mb-6">{error || 'This store does not exist or has been removed.'}</p>
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
              Browse Ads
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl overflow-hidden">
          {getImageSrc(store.banner) ? (
            <Image
              src={getImageSrc(store.banner)}
              alt={store.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-16 h-16 text-primary-300" />
            </div>
          )}
        </div>

        {/* Store Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-20 px-4 sm:px-6 relative z-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-card overflow-hidden border-4 border-white flex-shrink-0">
            {getImageSrc(store.logo) ? (
              <Image
                src={getImageSrc(store.logo)}
                alt={store.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
                <span className="text-white text-3xl font-bold">{store.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-2 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-2">
                {store.name}
                {store.is_verified_business && <BusinessVerifiedBadge size="md" />}
              </h1>
              <div className="flex items-center gap-2">
                {!isOwnStore && isAuthenticated && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {followLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                    )}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                <button
                  onClick={handleCopyUrl}
                  className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                  title="Copy store link"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{followerCount} followers</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{store.ads_count} ads</span>
              </div>
              {store.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{store.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(store.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description + Contact */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
              {store.description ? (
                <div>
                  <p className={`text-gray-600 whitespace-pre-line ${!showMore ? 'line-clamp-3' : ''}`}>
                    {store.description}
                  </p>
                  {store.description.length > 200 && (
                    <button
                      onClick={() => setShowMore(!showMore)}
                      className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-2 font-medium"
                    >
                      {showMore ? <>Show less <ChevronUp className="w-4 h-4" /></> : <>Read more <ChevronDown className="w-4 h-4" /></>}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 italic">No description provided.</p>
              )}
            </div>

            {/* Ads Grid */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Listings ({store.ads?.length || 0})</h2>
              {store.ads && store.ads.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {store.ads.map((ad) => {
                    const imagesArray = Array.isArray(ad.images) ? ad.images : [];
                    const primaryImage = imagesArray.find(img => img?.is_primary) || imagesArray[0];
                    const imageUrl = primaryImage ? getAdImageUrl(primaryImage) : '';

                    return (
                      <Link
                        key={ad.id}
                        href={`/ad/${ad.slug && ad.slug !== 'undefined' ? ad.slug : `ad-${ad.id}`}`}
                        className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 group"
                      >
                        <div className="relative aspect-square bg-gray-100">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={ad.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <ImageIcon className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {ad.title}
                          </h3>
                          <p className="text-xl font-bold text-primary-600 mb-2">
                            {formatPrice(ad.price, ad.currency)}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">
                                {ad.location?.name || ad.state || ad.lga || 'N/A'}
                              </span>
                            </div>
                            <span>{formatDate(ad.created_at)}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center shadow-card">
                  <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No listings yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Contact</h3>
              <div className="space-y-3">
                {store.email && (
                  <a href={`mailto:${store.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{store.email}</span>
                  </a>
                )}
                {store.phone && (
                  <a href={`tel:${store.phone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{store.phone}</span>
                  </a>
                )}
                {store.website && (
                  <a href={store.website.startsWith('http') ? store.website : `https://${store.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{store.website}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                )}
                {store.address && (
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{store.address}</span>
                  </div>
                )}
                {!store.email && !store.phone && !store.website && !store.address && (
                  <p className="text-gray-400 text-sm italic">No contact info available.</p>
                )}
              </div>

              {/* Social */}
              {(store.instagram || store.twitter || store.facebook) && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  {store.instagram && (
                    <a href={store.instagram.startsWith('http') ? store.instagram : `https://instagram.com/${store.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-pink-100 hover:text-pink-600 transition-all">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {store.twitter && (
                    <a href={store.twitter.startsWith('http') ? store.twitter : `https://twitter.com/${store.twitter}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-blue-100 hover:text-blue-500 transition-all">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {store.facebook && (
                    <a href={store.facebook.startsWith('http') ? store.facebook : `https://facebook.com/${store.facebook}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Followers</span>
                  <span className="text-sm font-semibold text-gray-900">{followerCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Active Listings</span>
                  <span className="text-sm font-semibold text-gray-900">{store.ads_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Member Since</span>
                  <span className="text-sm font-semibold text-gray-900">{formatDate(store.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
