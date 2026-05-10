'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, Search, Clock, CheckCircle, XCircle, Calendar, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Boost {
  id: number;
  ad_id: number;
  user_id: number;
  boost_type: 'top' | 'featured' | 'highlight';
  start_time: string;
  end_time: string;
  status: 'active' | 'expired' | 'cancelled';
  payment_reference: string;
  created_at: string;
  ad?: {
    id: number;
    title: string;
    slug: string;
    images?: Array<{ url: string; thumbnail_url?: string }>;
    category?: { name: string };
  };
  user?: {
    name: string;
    email: string;
  };
}

export default function BoostsPage() {
  const [boosts, setBoosts] = useState<Boost[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [extendModal, setExtendModal] = useState<{ open: boolean; boostId: number | null }>({ open: false, boostId: null });
  const [extendDays, setExtendDays] = useState(7);
  const [extending, setExtending] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.boost_type = typeFilter;
      params.limit = '20';
      params.page = String(page);

      const res = await adminApi.getBoosts(params);
      const data = res.data;
      setBoosts(data.data || []);
      setTotalPages(data.meta?.last_page || 1);

      const statsRes = await adminApi.getDashboard();
      const s = statsRes.data.stats;
      setStats({
        total: s.active_boosts || 0,
        active: s.active_boosts || 0,
        expired: 0,
        cancelled: 0,
      });
    } catch {
      toast.error('Failed to load boosts');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, page]);

  useEffect(() => {
    fetchData();
  }, [statusFilter, typeFilter, page, fetchData]);

  const handleDeactivate = async (id: number) => {
    if (!confirm('Deactivate this boost?')) return;
    try {
      await adminApi.deactivateBoost(id);
      toast.success('Boost deactivated');
      fetchData();
    } catch {
      toast.error('Failed to deactivate boost');
    }
  };

  const handleExtend = async () => {
    if (!extendModal.boostId) return;
    setExtending(true);
    try {
      await adminApi.extendBoost(extendModal.boostId, extendDays);
      toast.success(`Boost extended by ${extendDays} days`);
      setExtendModal({ open: false, boostId: null });
      fetchData();
    } catch {
      toast.error('Failed to extend boost');
    } finally {
      setExtending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getBoostTypeColor = (type: string) => {
    switch (type) {
      case 'top': return 'bg-purple-100 text-purple-700';
      case 'featured': return 'bg-blue-100 text-blue-700';
      case 'highlight': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-white/80" />
            <span className="text-white/80">Active Boosts</span>
          </div>
          <p className="text-2xl font-bold">{stats.active}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2 border border-gray-300 rounded-lg">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="px-4 py-2 border border-gray-300 rounded-lg">
          <option value="">All Types</option>
          <option value="top">Top</option>
          <option value="featured">Featured</option>
          <option value="highlight">Highlight</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /></div>
        ) : boosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No boosts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {boosts.map((boost) => (
                  <tr key={boost.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{boost.ad?.title || `Ad #${boost.ad_id}`}</p>
                      <p className="text-xs text-gray-500">{boost.ad?.category?.name || ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{boost.user?.name || `User #${boost.user_id}`}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getBoostTypeColor(boost.boost_type)}`}>
                        {boost.boost_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(boost.status)}`}>
                        {getStatusIcon(boost.status)}
                        {boost.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(boost.start_time)} - {formatDate(boost.end_time)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {boost.status === 'active' && (
                        <div className="flex gap-2">
                          <button onClick={() => setExtendModal({ open: true, boostId: boost.id })} className="text-xs text-blue-600 hover:text-blue-800">Extend</button>
                          <button onClick={() => handleDeactivate(boost.id)} className="text-xs text-red-600 hover:text-red-800">Deactivate</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Prev</button>
          <span className="px-4 py-2">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Extend Modal */}
      {extendModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Extend Boost</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Days to extend</label>
              <input type="number" min={1} max={365} value={extendDays} onChange={(e) => setExtendDays(Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setExtendModal({ open: false, boostId: null })} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleExtend} disabled={extending} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                {extending ? 'Extending...' : 'Extend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
