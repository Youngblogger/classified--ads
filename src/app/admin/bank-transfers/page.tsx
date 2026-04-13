'use client';

import { useState, useEffect } from 'react';
import { api, adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  Loader2
} from 'lucide-react';

interface Transaction {
  id: number;
  user_id: number;
  type: string;
  amount: string;
  reference: string;
  status: string;
  payment_method: string;
  proof_image_url: string | null;
  is_suspicious: boolean;
  admin_note: string | null;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function BankTransfersPage() {
  const [transfers, setTransfers] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    suspicious: 0,
    total_amount_pending: 0,
    total_amount_approved: 0
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransfer, setSelectedTransfer] = useState<Transaction | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchTransfers();
    fetchStats();
  }, [page, statusFilter]);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (search) {
        params.append('search', search);
      }
      
      const res = await api.get(`/secure-control-9ja/bank-transfers?${params.toString()}`);
      setTransfers(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
    } catch (error) {
      console.error('Failed to fetch transfers:', error);
      toast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/secure-control-9ja/bank-transfers/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await api.post(`/secure-control-9ja/bank-transfers/${id}/approve`);
      toast.success('Transfer approved successfully');
      fetchTransfers();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve transfer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectNote.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setActionLoading(id);
    try {
      const res = await api.post(`/secure-control-9ja/bank-transfers/${id}/reject`, {
        admin_note: rejectNote
      });
      toast.success('Transfer rejected');
      setShowRejectModal(false);
      setRejectNote('');
      fetchTransfers();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject transfer');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (transfer: Transaction) => {
    setSelectedTransfer(transfer);
    setShowRejectModal(true);
  };

  const formatAmount = (amount: string | number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(Number(amount));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-NG', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getStatusBadge = (status: string, suspicious: boolean) => {
    if (suspicious) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          <AlertTriangle className="w-3 h-3" />
          Suspicious
        </span>
      );
    }

    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bank Transfer Requests</h1>
        <p className="text-gray-600">Review and manage wallet funding requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-700">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-800 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700">Approved</span>
          </div>
          <p className="text-2xl font-bold text-green-800 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700">Rejected</span>
          </div>
          <p className="text-2xl font-bold text-red-800 mt-1">{stats.rejected}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-orange-700">Suspicious</span>
          </div>
          <p className="text-2xl font-bold text-orange-800 mt-1">{stats.suspicious}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTransfers()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="success">Approved</option>
          <option value="failed">Rejected</option>
        </select>
        <button
          onClick={fetchTransfers}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-3"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-3"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-3"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 w-32 bg-gray-100 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-200 rounded"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No transfer requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transfers.map((transfer) => (
                  <tr key={transfer.id} className={`hover:bg-gray-50 ${transfer.is_suspicious ? 'bg-orange-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{transfer.user?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{transfer.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{formatAmount(transfer.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{transfer.reference}</code>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(transfer.status, transfer.is_suspicious)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(transfer.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTransfer(transfer)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {transfer.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(transfer.id)}
                              disabled={actionLoading === transfer.id}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                            >
                              {actionLoading === transfer.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectModal(transfer)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
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
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTransfer && !showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Transfer Details</h2>
                <button onClick={() => setSelectedTransfer(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">User</label>
                    <p className="font-medium">{selectedTransfer.user?.name}</p>
                    <p className="text-sm text-gray-500">{selectedTransfer.user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Amount</label>
                    <p className="text-2xl font-bold text-primary-600">{formatAmount(selectedTransfer.amount)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Reference</label>
                  <code className="block bg-gray-100 px-3 py-2 rounded mt-1">{selectedTransfer.reference}</code>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedTransfer.status, selectedTransfer.is_suspicious)}</div>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Submitted</label>
                  <p>{formatDate(selectedTransfer.created_at)}</p>
                </div>

                {selectedTransfer.admin_note && (
                  <div>
                    <label className="text-sm text-gray-500">Admin Note</label>
                    <p className="bg-gray-100 p-3 rounded mt-1">{selectedTransfer.admin_note}</p>
                  </div>
                )}

                {selectedTransfer.proof_image_url && (
                  <div>
                    <label className="text-sm text-gray-500">Payment Proof</label>
                    <div className="mt-2">
                      <img 
                        src={`/storage/${selectedTransfer.proof_image_url}`} 
                        alt="Payment proof"
                        className="max-w-full h-auto rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                )}

                {selectedTransfer.is_suspicious && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-orange-700">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">This transaction has been flagged as suspicious</span>
                    </div>
                  </div>
                )}
              </div>

              {selectedTransfer.status === 'pending' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleApprove(selectedTransfer.id)}
                    disabled={actionLoading === selectedTransfer.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === selectedTransfer.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(selectedTransfer)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Reject Transfer</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject this transfer of <strong>{formatAmount(selectedTransfer.amount)}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectNote('');
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedTransfer.id)}
                disabled={actionLoading === selectedTransfer.id}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === selectedTransfer.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Confirm Rejection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
