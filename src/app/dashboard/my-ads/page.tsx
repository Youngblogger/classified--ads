'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ImageIcon, MapPin, Eye, Zap, X, Ban, RefreshCw, Pencil, Trash2, ExternalLink, Search, Play, PauseCircle } from 'lucide-react';
import { adsApi } from '@/lib/api';
import { getAdImageUrl, FALLBACK_IMAGE } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import BoostAdModal from '@/components/ui/BoostAdModal';
import PremiumBadge from '@/components/ui/PremiumBadge';
import { getBoostCardClasses, getBoostConfig } from '@/lib/boost-config';
import { Clock, ShieldCheck } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCloseAd, useDeleteAd, usePauseAd, useReactivateAd, useRenewAd, useBoostAd } from '@/hooks/mutations/useAdMutations';

type StatusFilter = 'all' | 'active' | 'paused' | 'pending' | 'sold' | 'expired';

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: 'Active', class: 'bg-green-100 text-green-800' },
  paused: { label: 'Paused', class: 'bg-amber-100 text-amber-800' },
  pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
  sold: { label: 'Sold', class: 'bg-gray-100 text-gray-800' },
  expired: { label: 'Expired', class: 'bg-red-100 text-red-800' },
  rejected: { label: 'Rejected', class: 'bg-red-100 text-red-800' },
  suspended: { label: 'Suspended', class: 'bg-red-100 text-red-800' },
};

const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'number' ? price : parseFloat(String(price) || '0');
  return `₦${numPrice.toLocaleString('en-US')}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

function AdSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MyAdsPage() {
  const router = useRouter();
  const { user: authUser, hasHydrated } = useAuthStore();
  const currentUserId = authUser?.id;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; adId: number | null; adSlug: string | null; adTitle: string | null }>({
    show: false,
    adId: null,
    adSlug: null,
    adTitle: null
  });
  const [deleting, setDeleting] = useState(false);
  const [boostModal, setBoostModal] = useState<{ show: boolean; adId: number | null; adTitle: string | null; adCategory?: any; adPrice?: any }>({
    show: false,
    adId: null,
    adTitle: null,
    adCategory: null,
    adPrice: null,
  });
  const [closeModal, setCloseModal] = useState<{ show: boolean; adId: number | null; adTitle: string | null }>({
    show: false,
    adId: null,
    adTitle: null
  });
  const [closing, setClosing] = useState(false);
  const [renewModal, setRenewModal] = useState<{ show: boolean; adId: number | null; adTitle: string | null }>({
    show: false,
    adId: null,
    adTitle: null
  });
  const [renewing, setRenewing] = useState(false);
  const [pauseModal, setPauseModal] = useState<{ show: boolean; adId: number | null; adTitle: string | null }>({
    show: false,
    adId: null,
    adTitle: null
  });
  const [pausing, setPausing] = useState(false);
  const [reactivateModal, setReactivateModal] = useState<{ show: boolean; adId: number | null; adTitle: string | null }>({
    show: false,
    adId: null,
    adTitle: null
  });
  const [reactivating, setReactivating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const closeAdMutation = useCloseAd();
  const deleteAdMutation = useDeleteAd();
  const pauseAdMutation = usePauseAd();
  const reactivateAdMutation = useReactivateAd();
  const renewAdMutation = useRenewAd();
  const boostAdMutation = useBoostAd();

  const fetchAds = useCallback(async () => {
    if (!hasHydrated || currentUserId === undefined) return;
    try {
      setLoading(true);
      const params = statusFilter === 'all' ? {} : { status: statusFilter };
      const res = await adsApi.getMyAds(params);
      const fetchedAds = (res.data as any)?.data ?? [];
      const ownedAds = fetchedAds.filter((ad: any) => {
        const adUserId = ad.user_id ?? ad.user?.id ?? null;
        if (adUserId === null) return false;
        return String(adUserId) === String(currentUserId);
      });
      if (ownedAds.length !== fetchedAds.length) {
        console.warn(`Filtered out ${fetchedAds.length - ownedAds.length} ad(s) not owned by current user`);
      }
      setAds(ownedAds);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [statusFilter, currentUserId, hasHydrated]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const filteredAds = ads.filter(ad => {
    const title = (ad.title || '').toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

  const handleDeleteClick = (adId: number, adSlug: string, adTitle: string) => {
    setDeleteModal({ show: true, adId, adSlug, adTitle });
  };

  const confirmDelete = async () => {
    if (!deleteModal.adId || !deleteModal.adSlug) return;
    setDeleting(true);
    setDeleteModal({ show: false, adId: null, adSlug: null, adTitle: null });
    deleteAdMutation.mutate(
      { slug: deleteModal.adSlug, id: deleteModal.adId },
      {
        onSettled: () => {
          setDeleting(false);
          fetchAds();
        },
      }
    );
  };

  const handlePromote = (adId: number, adTitle: string, adCategory?: any, adPrice?: any) => {
    setBoostModal({ show: true, adId, adTitle, adCategory, adPrice });
  };

  const handleCloseClick = (adId: number, adTitle: string) => {
    setCloseModal({ show: true, adId, adTitle });
  };

  const confirmClose = async () => {
    if (!closeModal.adId) return;
    setClosing(true);
    setCloseModal({ show: false, adId: null, adTitle: null });
    closeAdMutation.mutate(closeModal.adId, {
      onSettled: () => {
        setClosing(false);
        fetchAds();
      },
    });
  };

  const handlePauseClick = (adId: number, adTitle: string) => {
    setPauseModal({ show: true, adId, adTitle });
  };

  const confirmPause = async () => {
    if (!pauseModal.adId) return;
    setPausing(true);
    setPauseModal({ show: false, adId: null, adTitle: null });
    pauseAdMutation.mutate(pauseModal.adId, {
      onSettled: () => {
        setPausing(false);
        fetchAds();
      },
    });
  };

  const handleReactivateClick = (adId: number, adTitle: string) => {
    setReactivateModal({ show: true, adId, adTitle });
  };

  const confirmReactivate = async () => {
    if (!reactivateModal.adId) return;
    setReactivating(true);
    setReactivateModal({ show: false, adId: null, adTitle: null });
    reactivateAdMutation.mutate(reactivateModal.adId, {
      onSettled: () => {
        setReactivating(false);
        fetchAds();
      },
    });
  };

  const handleRenewClick = (adId: number, adTitle: string) => {
    setRenewModal({ show: true, adId, adTitle });
  };

  const confirmRenew = async () => {
    if (!renewModal.adId) return;
    setRenewing(true);
    setRenewModal({ show: false, adId: null, adTitle: null });
    renewAdMutation.mutate(renewModal.adId, {
      onSettled: () => {
        setRenewing(false);
        fetchAds();
      },
    });
  };

  const getStatusCount = (status: StatusFilter) => {
    if (status === 'all') return ads.length;
    return ads.filter(ad => ad.status === status).length;
  };

  if (isInitialLoad || !hasHydrated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <div className="flex gap-4">
            <div className="flex-1 h-10 bg-gray-200 rounded-xl animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-10 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <AdSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Ads</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track your listings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your ads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {(['all', 'active', 'paused', 'pending', 'sold', 'expired'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className={`ml-1.5 ${statusFilter === status ? 'text-primary-200' : 'text-gray-400'}`}>
                  ({getStatusCount(status)})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <AdSkeleton key={i} />
          ))}
        </div>
      ) : filteredAds.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredAds.map((ad) => {
            const boostCardClasses = getBoostCardClasses((ad as any).boost_type);
            return (
            <div
              key={ad.id}
              className={`bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 group ${boostCardClasses}`}
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-100">
                {(() => {
                  let imageUrl = '';
                  
                  if (ad.image) {
                    imageUrl = getAdImageUrl(ad.image);
                  }
                  
                  if (!imageUrl && Array.isArray(ad.images) && ad.images.length > 0) {
                    const primaryImage = ad.images.find((img: any) => img?.is_primary) || ad.images[0];
                    imageUrl = getAdImageUrl(primaryImage);
                  }
                  
                  if (!imageUrl && ad.main_image) {
                    imageUrl = getAdImageUrl(ad.main_image);
                  }
                  
                  if (!imageUrl && Array.isArray(ad.slider_images) && ad.slider_images.length > 0) {
                    imageUrl = getAdImageUrl(ad.slider_images[0]);
                  }
                  
                  return imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt={ad.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== FALLBACK_IMAGE) {
                            target.src = FALLBACK_IMAGE;
                          }
                        }}
                      />
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        <ImageIcon className="w-3 h-3" />
                        <span>{ad.images_count || 1}</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  );
                })()}
                <PremiumBadge boostType={(ad as any).boost_type} badgeIcon={(ad as any).badge_icon} size="sm" />
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${(statusConfig[ad.status as keyof typeof statusConfig]?.class) || 'bg-gray-100 text-gray-800'}`}>
                    {(statusConfig[ad.status as keyof typeof statusConfig]?.label) || ad.status || 'Unknown'}
                  </span>
                </div>
                {ad.status === 'pending' && (
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Awaiting admin approval
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <Link href={`/ad/${ad.slug || `ad-${ad.id}`}`} className="block group/link">
                  <h3 className="text-lg sm:text-base font-semibold text-gray-900 mb-1 line-clamp-1 group-hover/link:text-primary-600 transition-colors">{ad.title}</h3>
                </Link>

                <p className="text-2xl sm:text-xl font-bold text-primary-600 mb-2">
                  {formatPrice(ad.price)}
                </p>

                {ad.short_description && (
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{ad.short_description}</p>
                )}
                
                {/* Location */}
                {(ad.location?.name || ad.state || ad.lga) && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {(() => {
                        const state = ad.state || ad.location?.name || '';
                        const lga = ad.lga || '';
                        return state && lga ? `${state}, ${lga}` : (state || lga || 'N/A');
                      })()}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{ad.views || 0} views</span>
                  </div>
                  <span>{formatDate(ad.created_at)}</span>
                </div>

                {/* Lifecycle / Boost Status */}
                {ad.is_boosted && ad.boost_status === 'active' && (
                  <div className={`mb-3 px-3 py-2 rounded-lg border ${ad.boost_type === 'platinum' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : ad.boost_type === 'gold' ? 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Zap className={`w-3.5 h-3.5 ${ad.boost_type === 'platinum' ? 'text-blue-600' : ad.boost_type === 'gold' ? 'text-slate-500' : 'text-amber-600'}`} />
                        <span className={`text-xs font-semibold ${ad.boost_type === 'platinum' ? 'text-blue-800' : ad.boost_type === 'gold' ? 'text-slate-800' : 'text-amber-800'}`}>
                          {getBoostConfig(ad.boost_type)?.displayName || ad.plan_name || 'Boosted'} • Active
                        </span>
                      </div>
                      {ad.boost_end_time && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-600">
                          <Clock className="w-3 h-3" />
                          <span>Expires {formatDate(ad.boost_end_time)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions - Jiji/OLX style */}
                <div className="border-t border-gray-100 pt-3">
                  {ad.status === 'active' && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => router.push(`/ad/${ad.slug || `ad-${ad.id}`}`)}
                        className="group flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-sm sm:text-xs font-semibold text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100 active:scale-95 transition-all duration-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>View</span>
                      </button>
                      <Link
                        href={`/ad/edit/${ad.id}`}
                        className="group flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 rounded-xl text-sm sm:text-xs font-semibold text-sky-700 hover:from-sky-100 hover:to-cyan-100 hover:border-sky-300 hover:shadow-md hover:shadow-sky-100 active:scale-95 transition-all duration-200"
                      >
                        <Pencil className="w-3.5 h-3.5 shrink-0 group-hover:rotate-12 transition-transform duration-200" />
                        <span>Edit</span>
                      </Link>
                      <div className="col-span-2 grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handlePromote(ad.id, ad.title, ad.category, ad.price)}
                          className={`group col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm sm:text-xs font-bold tracking-wide active:scale-95 transition-all duration-200 shadow-sm ${
                            ad.is_boosted
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-200'
                              : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 hover:shadow-lg hover:shadow-amber-200'
                          }`}
                        >
                          <Zap className="w-4 h-4 shrink-0 group-hover:scale-110 group-hover:animate-pulse transition-transform" />
                          <span>{ad.is_boosted ? 'Manage Boost' : 'Boost Ad'}</span>
                        </button>
                      </div>
                      <button
                        onClick={() => handlePauseClick(ad.id, ad.title)}
                        className="group flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl text-sm sm:text-xs font-semibold text-amber-700 hover:from-amber-100 hover:to-yellow-100 hover:border-amber-300 hover:shadow-md hover:shadow-amber-100 active:scale-95 transition-all duration-200"
                      >
                        <PauseCircle className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Pause</span>
                      </button>
                      <button
                        onClick={() => handleCloseClick(ad.id, ad.title)}
                        className="group flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 rounded-xl text-sm sm:text-xs font-semibold text-gray-700 hover:from-gray-100 hover:to-slate-200 hover:border-gray-300 hover:shadow-md hover:shadow-gray-100 active:scale-95 transition-all duration-200"
                      >
                        <Ban className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Sold</span>
                      </button>
                    </div>
                  )}
                  {ad.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <Link
                        href={`/ad/edit/${ad.id}`}
                        className="group flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 rounded-xl text-sm sm:text-xs font-semibold text-sky-700 hover:from-sky-100 hover:to-cyan-100 hover:border-sky-300 hover:shadow-md hover:shadow-sky-100 active:scale-95 transition-all duration-200"
                      >
                        <Pencil className="w-3.5 h-3.5 shrink-0 group-hover:rotate-12 transition-transform" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(ad.id, ad.slug || `ad-${ad.id}`, ad.title)}
                        className="group flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl text-sm sm:text-xs font-semibold text-red-600 hover:from-red-100 hover:to-rose-100 hover:border-red-300 hover:shadow-md hover:shadow-red-100 active:scale-95 transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                  {ad.status === 'paused' && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleReactivateClick(ad.id, ad.title)}
                        className="group col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm sm:text-xs font-bold tracking-wide hover:from-emerald-600 hover:to-green-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-95 transition-all duration-200 shadow-sm"
                      >
                        <Play className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Reactivate</span>
                      </button>
                      <Link
                        href={`/ad/edit/${ad.id}`}
                        className="group flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 rounded-xl text-sm sm:text-xs font-semibold text-sky-700 hover:from-sky-100 hover:to-cyan-100 hover:border-sky-300 hover:shadow-md hover:shadow-sky-100 active:scale-95 transition-all duration-200"
                      >
                        <Pencil className="w-3.5 h-3.5 shrink-0 group-hover:rotate-12 transition-transform" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(ad.id, ad.slug || `ad-${ad.id}`, ad.title)}
                        className="group flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl text-sm sm:text-xs font-semibold text-red-600 hover:from-red-100 hover:to-rose-100 hover:border-red-300 hover:shadow-md hover:shadow-red-100 active:scale-95 transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => handleCloseClick(ad.id, ad.title)}
                        className="group col-span-2 flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 rounded-xl text-sm sm:text-xs font-semibold text-gray-700 hover:from-gray-100 hover:to-slate-200 hover:border-gray-300 hover:shadow-md hover:shadow-gray-100 active:scale-95 transition-all duration-200"
                      >
                        <Ban className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Mark as Sold</span>
                      </button>
                    </div>
                  )}
                  {ad.status === 'sold' && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleRenewClick(ad.id, ad.title)}
                        className="group col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm sm:text-xs font-bold tracking-wide hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-95 transition-all duration-200 shadow-sm"
                      >
                        <RefreshCw className="w-4 h-4 shrink-0 group-hover:rotate-180 transition-transform duration-500" />
                        <span>Renew Ad</span>
                      </button>
                      <Link
                        href={`/ad/edit/${ad.id}`}
                        className="group flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 rounded-xl text-sm sm:text-xs font-semibold text-sky-700 hover:from-sky-100 hover:to-cyan-100 hover:border-sky-300 hover:shadow-md hover:shadow-sky-100 active:scale-95 transition-all duration-200"
                      >
                        <Pencil className="w-3.5 h-3.5 shrink-0 group-hover:rotate-12 transition-transform" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(ad.id, ad.slug || `ad-${ad.id}`, ad.title)}
                        className="group flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl text-sm sm:text-xs font-semibold text-red-600 hover:from-red-100 hover:to-rose-100 hover:border-red-300 hover:shadow-md hover:shadow-red-100 active:scale-95 transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                  {ad.status === 'rejected' && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <Link
                        href={`/ad/edit/${ad.id}`}
                        className="group flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 rounded-xl text-sm sm:text-xs font-semibold text-sky-700 hover:from-sky-100 hover:to-cyan-100 hover:border-sky-300 hover:shadow-md hover:shadow-sky-100 active:scale-95 transition-all duration-200"
                      >
                        <Pencil className="w-3.5 h-3.5 shrink-0 group-hover:rotate-12 transition-transform" />
                        <span>Edit & Resubmit</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(ad.id, ad.slug || `ad-${ad.id}`, ad.title)}
                        className="group flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl text-sm sm:text-xs font-semibold text-red-600 hover:from-red-100 hover:to-rose-100 hover:border-red-300 hover:shadow-md hover:shadow-red-100 active:scale-95 transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                  {ad.status === 'expired' && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleRenewClick(ad.id, ad.title)}
                        className="group col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm sm:text-xs font-bold tracking-wide hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-95 transition-all duration-200 shadow-sm"
                      >
                        <RefreshCw className="w-4 h-4 shrink-0 group-hover:rotate-180 transition-transform duration-500" />
                        <span>Renew Ad</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(ad.id, ad.slug || `ad-${ad.id}`, ad.title)}
                        className="group col-span-2 flex items-center justify-center gap-1.5 px-2.5 py-2 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl text-sm sm:text-xs font-semibold text-red-600 hover:from-red-100 hover:to-rose-100 hover:border-red-300 hover:shadow-md hover:shadow-red-100 active:scale-95 transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="search"
          title="No ads found"
          description={searchQuery ? `No results for "${searchQuery}"` : "You don't have any ads yet"}
          actionLabel="Post Your First Ad"
          onAction={() => window.location.href = '/dashboard/post-ad'}
          className="bg-white rounded-2xl shadow-card"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Ad</h3>
              <button 
                onClick={() => setDeleteModal({ show: false, adId: null, adSlug: null, adTitle: null })}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">&quot;{deleteModal.adTitle}&quot;</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, adId: null, adSlug: null, adTitle: null })}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 hover:shadow-md active:scale-95 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium hover:from-red-700 hover:to-rose-700 hover:shadow-lg hover:shadow-red-200 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Confirmation Modal */}
      {closeModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Close Ad</h3>
              <button 
                onClick={() => setCloseModal({ show: false, adId: null, adTitle: null })}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-2">
              Are you sure you want to close <span className="font-semibold">&quot;{closeModal.adTitle}&quot;</span>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The ad will be marked as sold and any active boost will expire. You can renew it later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCloseModal({ show: false, adId: null, adTitle: null })}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 hover:shadow-md active:scale-95 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmClose}
                disabled={closing}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-700 to-slate-800 text-white rounded-xl font-medium hover:from-gray-800 hover:to-slate-900 hover:shadow-lg hover:shadow-gray-200 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {closing ? 'Closing...' : 'Close Ad'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Confirmation Modal */}
      {renewModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Renew Ad</h3>
              <button 
                onClick={() => setRenewModal({ show: false, adId: null, adTitle: null })}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-2">
              Reactivate <span className="font-semibold">&quot;{renewModal.adTitle}&quot;</span>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The ad will be submitted for re-approval. Once approved, it will be visible again.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRenewModal({ show: false, adId: null, adTitle: null })}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 hover:shadow-md active:scale-95 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRenew}
                disabled={renewing}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {renewing ? 'Renewing...' : 'Renew Ad'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Confirmation Modal */}
      {pauseModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pause Ad</h3>
              <button 
                onClick={() => setPauseModal({ show: false, adId: null, adTitle: null })}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-2">
              Pause <span className="font-semibold">&quot;{pauseModal.adTitle}&quot;</span>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The ad will be hidden from search results. You can reactivate it anytime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPauseModal({ show: false, adId: null, adTitle: null })}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 hover:shadow-md active:scale-95 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmPause}
                disabled={pausing}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 hover:shadow-lg hover:shadow-amber-200 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pausing ? 'Pausing...' : 'Pause Ad'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Confirmation Modal */}
      {reactivateModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reactivate Ad</h3>
              <button 
                onClick={() => setReactivateModal({ show: false, adId: null, adTitle: null })}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-2">
              Reactivate <span className="font-semibold">&quot;{reactivateModal.adTitle}&quot;</span>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The ad will become visible to buyers again immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setReactivateModal({ show: false, adId: null, adTitle: null })}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 hover:shadow-md active:scale-95 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmReactivate}
                disabled={reactivating}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reactivating ? 'Reactivating...' : 'Reactivate Ad'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BoostAdModal
        adId={boostModal.adId ?? 0}
        adTitle={boostModal.adTitle ?? ''}
        isOpen={boostModal.show}
        onClose={() => setBoostModal({ show: false, adId: null, adTitle: null, adCategory: null, adPrice: null })}
        adCategory={boostModal.adCategory}
        adPrice={boostModal.adPrice}
      />
    </div>
  );
}
