'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  MoreVertical,
  Grid,
  List,
  Loader2
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Ad {
  id: number;
  title: string;
  slug: string;
  price: number;
  currency?: string;
  status: string;
  is_verified: boolean;
  is_featured?: boolean;
  category: { name: string; slug: string };
  location: { name: string } | null;
  user: { name: string; verified: boolean };
  images: { url: string; is_primary: boolean }[];
  views: number;
  created_at: string;
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchAds();
  }, [statusFilter]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await adminApi.getAds(params);
      setAds(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adId: number) => {
    try {
      setActionLoading(adId);
      await adminApi.approveAd(adId);
      toast.success('Ad approved successfully! The ad is now live and visible to users.');
      fetchAds();
    } catch (error) {
      toast.error('Failed to approve ad');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (adId: number) => {
    try {
      setActionLoading(adId);
      await adminApi.rejectAd(adId);
      toast.success('Ad rejected');
      fetchAds();
    } catch (error) {
      toast.error('Failed to reject ad');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify = async (adId: number) => {
    try {
      setActionLoading(adId);
      await adminApi.verifyAd(adId);
      toast.success('Ad verified');
      fetchAds();
    } catch (error) {
      toast.error('Failed to verify ad');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (adId: number) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    try {
      setActionLoading(adId);
      await adminApi.deleteAd(adId);
      toast.success('Ad deleted');
      fetchAds();
    } catch (error) {
      toast.error('Failed to delete ad');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const statusCounts = {
    all: ads.length,
    active: ads.filter(a => a.status === 'active').length,
    pending: ads.filter(a => a.status === 'pending').length,
    rejected: ads.filter(a => a.status === 'rejected').length,
  };

  const getImageUrl = (url: string | undefined): string => {
    if (!url) return '/placeholder.jpg';
    
    // If already a full URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Remove leading slash if present
    const cleanUrl = url.replace(/^\/+/, '');
    
    // Use the storage rewrite for Laravel files
    return `/storage/${cleanUrl}`;
  };

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-sky-100 text-sky-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full sm:w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Filter */}
          <select className="py-2.5 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Vehicles</option>
            <option>Real Estate</option>
            <option>Fashion</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
          >
            <List className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
          >
            <Grid className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ad</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Seller</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Verified</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Views</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Created</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-600" />
                    <p className="text-sm text-gray-500 mt-2">Loading ads...</p>
                  </td>
                </tr>
              ) : filteredAds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No ads found
                  </td>
                </tr>
              ) : (
                filteredAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={getImageUrl(ad.images?.[0]?.url)}
                            alt={ad.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ad.title}</p>
                          <p className="text-sm text-gray-500">{ad.category?.name}</p>
                          <p className="text-sm font-semibold text-sky-600">${ad.price?.toLocaleString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{ad.user?.name}</p>
                      <p className="text-sm text-gray-500">{ad.location?.name || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        ad.status === 'active' ? 'bg-green-100 text-green-700' :
                        ad.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ad.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          <Shield className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ad.views?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(ad.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* Verification */}
                        {ad.is_verified ? (
                          <button 
                            onClick={() => handleVerify(ad.id)} 
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" 
                            title="Remove Verification"
                            disabled={actionLoading === ad.id}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleVerify(ad.id)} 
                            className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg" 
                            title="Verify Ad"
                            disabled={actionLoading === ad.id}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Status Actions */}
                        {ad.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(ad.id)} 
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" 
                              title="Approve"
                              disabled={actionLoading === ad.id}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleReject(ad.id)} 
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" 
                              title="Reject"
                              disabled={actionLoading === ad.id}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        <button 
                          onClick={() => handleDelete(ad.id)} 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" 
                          title="Delete"
                          disabled={actionLoading === ad.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredAds.length} of {ads.length} ads
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
