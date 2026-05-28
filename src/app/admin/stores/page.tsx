'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAdminAuthStore } from '@/lib/admin-store';
import { adminApiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { Store, CheckCircle, XCircle, Clock, Search, Trash2, ChevronLeft, ChevronRight, AlertTriangle, Loader2, X } from 'lucide-react';

const STEALTH_PREFIX = '/secure-control-9ja';

interface StoreUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface StoreItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  status: 'active' | 'suspended';
  is_verified: boolean;
  ads_count: number;
  followers_count: number;
  owner: StoreUser;
  created_at: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { per_page: 20, page: currentPage };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (verifiedFilter !== 'all') params.is_verified = verifiedFilter === 'verified' ? true : false;
      const res: any = await adminApiClient.get(`${STEALTH_PREFIX}/stores`, { params });
      const data = res.data || { data: [] };
      setStores(data.data || []);
      if (data.last_page) setTotalPages(data.last_page);
    } catch (error: any) {
      console.error('Failed to fetch stores:', error);
      toast.error('Failed to load stores');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [statusFilter, verifiedFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, verifiedFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStores();
  };

  const handleVerify = async (store: StoreItem) => {
    setActionLoading(store.id);
    try {
      await adminApiClient.post(`${STEALTH_PREFIX}/stores/${store.id}/verify`);
      toast.success('Store verified');
      setStores(prev => prev.map(s => s.id === store.id ? { ...s, is_verified: true } : s));
    } catch {
      toast.error('Failed to verify store');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (store: StoreItem) => {
    setActionLoading(store.id);
    try {
      if (store.status === 'active') {
        await adminApiClient.post(`${STEALTH_PREFIX}/stores/${store.id}/suspend`);
        toast.success('Store suspended');
        setStores(prev => prev.map(s => s.id === store.id ? { ...s, status: 'suspended' } : s));
      } else {
        await adminApiClient.post(`${STEALTH_PREFIX}/stores/${store.id}/activate`);
        toast.success('Store activated');
        setStores(prev => prev.map(s => s.id === store.id ? { ...s, status: 'active' } : s));
      }
    } catch {
      toast.error('Failed to update store status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedStore) return;
    setActionLoading(selectedStore.id);
    try {
      await adminApiClient.delete(`${STEALTH_PREFIX}/stores/${selectedStore.id}`);
      toast.success('Store deleted');
      setStores(prev => prev.filter(s => s.id !== selectedStore.id));
      setShowDeleteModal(false);
    } catch {
      toast.error('Failed to delete store');
    } finally {
      setActionLoading(null);
    }
  };

  const getImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '');
    return `${baseUrl}/storage/${url.replace(/^\/+/, '')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-500 mt-1">Manage all stores on the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {stores.length} Stores
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search stores by name or slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={verifiedFilter}
              onChange={e => { setVerifiedFilter(e.target.value); }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Verified</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Store</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Owner</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Verified</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Ads</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Followers</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Joined</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <Store className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No stores found</p>
                  </td>
                </tr>
              ) : (
                stores.map(store => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                          {store.logo ? (
                            <Image
                              src={getImageUrl(store.logo)}
                              alt={store.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Store className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[150px]">{store.name}</p>
                          <p className="text-xs text-gray-500">/{store.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{store.owner?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{store.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[store.status] || 'bg-gray-100 text-gray-700'}`}>
                        {store.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {store.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          <XCircle className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{store.ads_count ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{store.followers_count ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(store.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!store.is_verified && (
                          <button
                            onClick={() => handleVerify(store)}
                            disabled={actionLoading === store.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition-all disabled:opacity-50"
                          >
                            {actionLoading === store.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(store)}
                          disabled={actionLoading === store.id}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded transition-all disabled:opacity-50 ${
                            store.status === 'active' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {store.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => { setSelectedStore(store); setShowDeleteModal(true); }}
                          disabled={actionLoading === store.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {showDeleteModal && selectedStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Delete Store</h2>
                  <p className="text-xs text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to permanently delete <strong>{selectedStore.name}</strong>?
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  All store data, ads, and associated content will be permanently removed.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading === selectedStore.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1 text-sm"
                >
                  {actionLoading === selectedStore.id && <Loader2 className="w-3 h-3 animate-spin" />}
                  Delete Store
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
