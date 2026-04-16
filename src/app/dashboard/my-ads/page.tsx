'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ImageIcon, MapPin, Star, X } from 'lucide-react';
import { adsApi } from '@/lib/api';
import { getAdImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const EditIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);


type StatusFilter = 'all' | 'active' | 'pending' | 'sold';

const statusConfig = {
  active: { label: 'Active', class: 'bg-green-100 text-green-800' },
  pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
  sold: { label: 'Sold', class: 'bg-gray-100 text-gray-800' },
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

  useEffect(() => {
    fetchAds();
  }, [statusFilter]);

  const fetchAds = async () => {
    const timeoutId = setTimeout(() => {
      console.log('MyAds fetch timeout - forcing loading to false');
      setLoading(false);
    }, 10000);
    
    try {
      setLoading(true);
      const params = statusFilter === 'all' ? {} : { status: statusFilter };
      const res = await adsApi.getMyAds(params);
      clearTimeout(timeoutId);
      setAds(res.data.data || res.data || []);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Failed to fetch ads:', error);
      setAds([]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

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
      await adsApi.delete(deleteModal.adSlug);
      toast.success('Ad deleted successfully');
    } catch (error) {
      setAds(previousAds);
      console.error('Failed to delete ad:', error);
      toast.error('Failed to delete ad');
    } finally {
      setDeleting(false);
    }
  };

  const handlePromote = (adId: number) => {
    router.push(`/dashboard/promotions?ad_id=${adId}`);
  };

  const getStatusCount = (status: StatusFilter) => {
    if (status === 'all') return ads.length;
    return ads.filter(ad => ad.status === status).length;
  };

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
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
            {(['all', 'active', 'pending', 'sold'] as StatusFilter[]).map((status) => (
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

      {/* Ads Grid */}
      {filteredAds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-100">
                {(() => {
                  const imagesArray = Array.isArray(ad.images) ? ad.images : [];
                  const primaryImage = imagesArray.find((img: any) => img?.is_primary) || imagesArray[0];
                  const imageUrl = primaryImage ? getAdImageUrl(primaryImage) : '';
                  return imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  );
                })()}
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
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{ad.title}</h3>
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
                    <EyeIcon className="w-4 h-4" />
                    <span>{ad.views || 0} views</span>
                  </div>
                  <span>{formatDate(ad.created_at)}</span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/ad/${ad.slug}`}
                    target="_blank"
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>Preview</span>
                  </Link>
                  <Link
                    href={`/ad/edit/${ad.id}`}
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <EditIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                  <button 
                    onClick={() => handleDeleteClick(ad.id, ad.slug, ad.title)}
                    className="flex items-center justify-center gap-1 px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                  <Link
                    href={`/dashboard/promotions?ad_id=${ad.id}`}
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
                  >
                    <ZapIcon className="w-4 h-4" />
                    <span>Promote</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center shadow-card">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="w-8 h-8 text-gray-400" />
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
    </div>
  );
}