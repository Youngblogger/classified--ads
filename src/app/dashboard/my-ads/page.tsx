'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ImageIcon, MapPin, Eye, Zap, X, Ban, RefreshCw, Pencil, Trash2, ExternalLink, Search } from 'lucide-react';
import { adsApi } from '@/lib/api';
import { getAdImageUrl, FALLBACK_IMAGE } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import BoostPlansModal from '@/components/ui/BoostPlansModal';
import PremiumBadge from '@/components/ui/PremiumBadge';
import { getAuthToken } from '@/lib/cookies';
import { getBoostCardClasses } from '@/lib/boost-config';

type StatusFilter = 'all' | 'active' | 'pending' | 'sold' | 'expired';

const statusConfig = {
  active: { label: 'Active', class: 'bg-green-100 text-green-800' },
  pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
  sold: { label: 'Closed', class: 'bg-gray-100 text-gray-800' },
  expired: { label: 'Expired', class: 'bg-red-100 text-red-800' },
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
  const [boostModal, setBoostModal] = useState<{ show: boolean; adId: number | null; adTitle: string | null }>({
    show: false,
    adId: null,
    adTitle: null
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const params = statusFilter === 'all' ? {} : { status: statusFilter };
      const res = await adsApi.getMyAds(params);
      setAds(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleDeleteClick = (adId: number, adSlug: string, adTitle: string) => {
    setDeleteModal({ show: true, adId, adSlug, adTitle });
  };

  const confirmDelete = async () => {
    if (!deleteModal.adId || !deleteModal.adSlug) return;
    
    setDeleting(true);
    const previousAds = [...ads];
    setAds(prev => prev.filter(ad => ad.id !== deleteModal.adId));
    setDeleteModal({ show: false, adId: null, adSlug: null, adTitle: null });
    
    try {
      try {
        await adsApi.delete(deleteModal.adSlug);
      } catch {
        await adsApi.deleteById(deleteModal.adId);
      }
      toast.success('Ad deleted successfully');
    } catch (error) {
      setAds(previousAds);
      console.error('Failed to delete ad:', error);
      toast.error('Failed to delete ad');
    } finally {
      setDeleting(false);
    }
  };

  const handlePromote = (adId: number, adTitle: string) => {
    setBoostModal({ show: true, adId, adTitle });
  };

  const handleCloseClick = (adId: number, adTitle: string) => {
    setCloseModal({ show: true, adId, adTitle });
  };

  const confirmClose = async () => {
    if (!closeModal.adId) return;
    setClosing(true);
    setCloseModal({ show: false, adId: null, adTitle: null });
    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/ads/${closeModal.adId}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to close ad');
      toast.success('Ad closed successfully');
      fetchAds();
    } catch {
      toast.error('Failed to close ad');
      fetchAds();
    } finally {
      setClosing(false);
    }
  };

  const handleRenewClick = (adId: number, adTitle: string) => {
    setRenewModal({ show: true, adId, adTitle });
  };

  const confirmRenew = async () => {
    if (!renewModal.adId) return;
    setRenewing(true);
    setRenewModal({ show: false, adId: null, adTitle: null });
    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/ads/${renewModal.adId}/renew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to renew ad');
      toast.success('Ad submitted for re-approval');
      fetchAds();
    } catch {
      toast.error('Failed to renew ad');
      fetchAds();
    } finally {
      setRenewing(false);
    }
  };

  const getStatusCount = (status: StatusFilter) => {
    if (status === 'all') return ads.length;
    return ads.filter(ad => ad.status === status).length;
  };

  if (isInitialLoad) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
            {(['all', 'active', 'pending', 'sold', 'expired'] as StatusFilter[]).map((status) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <AdSkeleton key={i} />
          ))}
        </div>
      ) : filteredAds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                  
                  if (Array.isArray(ad.images) && ad.images.length > 0) {
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
                        <span>{ad.images?.length || 1}</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  );
                })()}
                <PremiumBadge boostType={(ad as any).boost_type} size="sm" />
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[ad.status as keyof typeof statusConfig].class}`}>
                    {statusConfig[ad.status as keyof typeof statusConfig].label}
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
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover/link:text-primary-600 transition-colors">{ad.title}</h3>
                </Link>
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
                
                <p className="text-xl font-bold text-primary-600 mb-3">
                  {formatPrice(ad.price)}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{ad.views || 0} views</span>
                  </div>
                  <span>{formatDate(ad.created_at)}</span>
                </div>

                {/* Actions - Jiji/OLX style */}
                <div className="border-t border-gray-100 pt-3">
                  {ad.status === 'active' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/ad/${ad.slug || `ad-${ad.id}`}`)}
                        className="flex items-center gap-1.5 flex-1 justify-center px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <Link
                        href={`/ad/edit/${ad.id}`}
                        className="flex items-center gap-1.5 flex-1 justify-center px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handlePromote(ad.id, ad.title)}
                        className="flex items-center gap-1.5 flex-1 justify-center px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Boost</span>
                      </button>
                      <button
                        onClick={() => handleCloseClick(ad.id, ad.title)}
                        className="flex items-center gap-1.5 flex-1 justify-center px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-all"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Close</span>
                      </button>
                    </div>
                  )}
                  {ad.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/ad/edit/${ad.id}`}
                        className="flex items-center gap-1.5 flex-1 justify-center px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(ad.id, ad.slug || `ad-${ad.id}`, ad.title)}
                        className="flex items-center gap-1.5 flex-1 justify-center px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-red-500 hover:border-red-300 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                  {ad.status === 'sold' && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/ad/edit/${ad.id}`}
                        className="flex items-center gap-1.5 flex-1 justify-center px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleRenewClick(ad.id, ad.title)}
                        className="flex items-center gap-1.5 flex-1 justify-center px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Renew</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(ad.id, ad.slug || `ad-${ad.id}`, ad.title)}
                        className="flex items-center gap-1.5 flex-1 justify-center px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-red-500 hover:border-red-300 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                  {ad.status === 'expired' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRenewClick(ad.id, ad.title)}
                        className="flex items-center gap-1.5 flex-1 justify-center px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-xs font-semibold hover:from-emerald-600 hover:to-green-600 transition-all shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Renew</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(ad.id, ad.slug || `ad-${ad.id}`, ad.title)}
                        className="flex items-center gap-1.5 flex-1 justify-center px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-red-500 hover:border-red-300 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
        <div className="bg-white rounded-2xl p-12 text-center shadow-card">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : "You don't have any ads yet"}
          </p>
          <Link
            href="/dashboard/post-ad"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Post Your First Ad
          </Link>
        </div>
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
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
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
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClose}
                disabled={closing}
                className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
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
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRenew}
                disabled={renewing}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
              >
                {renewing ? 'Renewing...' : 'Renew Ad'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BoostPlansModal
        adId={boostModal.adId ?? 0}
        adTitle={boostModal.adTitle ?? ''}
        isOpen={boostModal.show}
        onClose={() => setBoostModal({ show: false, adId: null, adTitle: null })}
      />
    </div>
  );
}
