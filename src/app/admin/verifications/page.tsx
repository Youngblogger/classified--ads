'use client';
import { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/admin-store';
import { adminApiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { Shield, Building2, CheckCircle, XCircle, Clock, Filter, Search, ChevronLeft, ChevronRight, FileText, Download, Loader2, X, AlertTriangle, User, Phone, Mail, IdCard, Eye } from 'lucide-react';

const STEALTH_PREFIX = '/secure-control-9ja';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface Verification {
  id: number;
  user: User;
  type: 'phone' | 'email' | 'identity';
  status: 'pending' | 'approved' | 'rejected' | 'resubmission_required';
  document_url?: string;
  document_type?: string;
  document_number?: string;
  document_front?: string;
  document_back?: string;
  document_selfie?: string;
  reason?: string;
  created_at: string;
  updated_at?: string;
}

interface BusinessVerification {
  id: number;
  business_name: string;
  owner: User;
  cac_number: string;
  status: 'pending' | 'approved' | 'rejected';
  cac_document?: string;
  address_proof?: string;
  utility_bill?: string;
  tax_registration?: string;
  reason?: string;
  is_verified_seller?: boolean;
  created_at: string;
  updated_at?: string;
}

interface PersonalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  resubmission_required: number;
}

interface BusinessStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const typeLabels: Record<string, string> = {
  phone: 'Phone',
  email: 'Email',
  identity: 'Identity',
};

const typeIcons: Record<string, any> = {
  phone: Phone,
  email: Mail,
  identity: IdCard,
};

const personalStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  resubmission_required: 'bg-orange-100 text-orange-700',
};

const businessStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

type TabType = 'personal' | 'business';

export default function VerificationsPage() {
  const { user: admin } = useAdminAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  const [personalVerifications, setPersonalVerifications] = useState<Verification[]>([]);
  const [personalStats, setPersonalStats] = useState<PersonalStats>({ total: 0, pending: 0, approved: 0, rejected: 0, resubmission_required: 0 });
  const [personalStatusFilter, setPersonalStatusFilter] = useState('pending');
  const [personalTypeFilter, setPersonalTypeFilter] = useState('all');
  const [personalPage, setPersonalPage] = useState(1);
  const [personalTotalPages, setPersonalTotalPages] = useState(1);
  const [personalLoading, setPersonalLoading] = useState(true);

  const [businessVerifications, setBusinessVerifications] = useState<BusinessVerification[]>([]);
  const [businessStats, setBusinessStats] = useState<BusinessStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [businessStatusFilter, setBusinessStatusFilter] = useState('pending');
  const [businessPage, setBusinessPage] = useState(1);
  const [businessTotalPages, setBusinessTotalPages] = useState(1);
  const [businessLoading, setBusinessLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [showDocModal, setShowDocModal] = useState(false);
  const [docVerification, setDocVerification] = useState<Verification | null>(null);
  const [docBusiness, setDocBusiness] = useState<BusinessVerification | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ type: 'personal' | 'business'; id: number; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPersonalVerifications = async () => {
    try {
      setPersonalLoading(true);
      const params: Record<string, any> = { page: personalPage, per_page: 15 };
      if (personalStatusFilter !== 'all') params.status = personalStatusFilter;
      if (personalTypeFilter !== 'all') params.type = personalTypeFilter;
      const [listRes, statsRes] = await Promise.all([
        adminApiClient.get(`${STEALTH_PREFIX}/verifications`, { params }),
        adminApiClient.get(`${STEALTH_PREFIX}/verifications/stats`),
      ]);
      const data = (listRes.data as any) || {};
      setPersonalVerifications(data.data || []);
      if (data.last_page) setPersonalTotalPages(data.last_page);
      const statsData = (statsRes.data as any) || {};
      setPersonalStats(statsData.data || statsData);
    } catch (error: any) {
      console.error('Failed to fetch verifications:', error);
      toast.error('Failed to load verifications');
      setPersonalVerifications([]);
    } finally {
      setPersonalLoading(false);
    }
  };

  const fetchBusinessVerifications = async () => {
    try {
      setBusinessLoading(true);
      const params: Record<string, any> = { page: businessPage, per_page: 15 };
      if (businessStatusFilter !== 'all') params.status = businessStatusFilter;
      const [listRes, statsRes] = await Promise.all([
        adminApiClient.get(`${STEALTH_PREFIX}/business-verifications`, { params }),
        adminApiClient.get(`${STEALTH_PREFIX}/business-verifications/stats`),
      ]);
      const data = (listRes.data as any) || {};
      setBusinessVerifications(data.data || []);
      if (data.last_page) setBusinessTotalPages(data.last_page);
      const statsData = (statsRes.data as any) || {};
      setBusinessStats(statsData.data || statsData);
    } catch (error: any) {
      console.error('Failed to fetch business verifications:', error);
      toast.error('Failed to load business verifications');
      setBusinessVerifications([]);
    } finally {
      setBusinessLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalVerifications();
  }, [personalStatusFilter, personalTypeFilter, personalPage]);

  useEffect(() => {
    setPersonalPage(1);
  }, [personalStatusFilter, personalTypeFilter]);

  useEffect(() => {
    fetchBusinessVerifications();
  }, [businessStatusFilter, businessPage]);

  useEffect(() => {
    setBusinessPage(1);
  }, [businessStatusFilter]);

  const handleApprovePersonal = async (verification: Verification) => {
    setActionLoading(verification.id);
    try {
      await adminApiClient.post(`${STEALTH_PREFIX}/verifications/${verification.id}/approve`);
      toast.success('Verification approved');
      setPersonalVerifications(prev => prev.map(v => v.id === verification.id ? { ...v, status: 'approved' } : v));
      setPersonalStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1,
      }));
    } catch {
      toast.error('Failed to approve verification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveBusiness = async (bv: BusinessVerification) => {
    setActionLoading(bv.id);
    try {
      await adminApiClient.post(`${STEALTH_PREFIX}/business-verifications/${bv.id}/approve`);
      toast.success('Business verification approved');
      setBusinessVerifications(prev => prev.map(v => v.id === bv.id ? { ...v, status: 'approved' } : v));
      setBusinessStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1,
      }));
    } catch {
      toast.error('Failed to approve business verification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setActionLoading(rejectTarget.id);
    try {
      const endpoint = rejectTarget.type === 'personal'
        ? `${STEALTH_PREFIX}/verifications/${rejectTarget.id}/reject`
        : `${STEALTH_PREFIX}/business-verifications/${rejectTarget.id}/reject`;
      await adminApiClient.post(endpoint, { reason: rejectReason });
      toast.success('Verification rejected');

      if (rejectTarget.type === 'personal') {
        setPersonalVerifications(prev => prev.map(v => v.id === rejectTarget.id ? { ...v, status: 'rejected', reason: rejectReason } : v));
        setPersonalStats(prev => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          rejected: prev.rejected + 1,
        }));
      } else {
        setBusinessVerifications(prev => prev.map(v => v.id === rejectTarget.id ? { ...v, status: 'rejected', reason: rejectReason } : v));
        setBusinessStats(prev => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          rejected: prev.rejected + 1,
        }));
      }

      setShowRejectModal(false);
      setRejectReason('');
      setRejectTarget(null);
    } catch {
      toast.error('Failed to reject verification');
    } finally {
      setActionLoading(null);
    }
  };

  const openDocModal = (v: Verification) => {
    setDocVerification(v);
    setDocBusiness(null);
    setShowDocModal(true);
  };

  const openBusinessDocModal = (bv: BusinessVerification) => {
    setDocBusiness(bv);
    setDocVerification(null);
    setShowDocModal(true);
  };

  const openRejectModal = (type: 'personal' | 'business', id: number, name: string) => {
    setRejectTarget({ type, id, name });
    setRejectReason('');
    setShowRejectModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const personalStatusTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'resubmission_required', label: 'Resubmission Required' },
  ];

  const businessStatusTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const personalStatCards = [
    { label: 'Total', value: personalStats.total, color: 'bg-sky-100 text-sky-700', icon: Shield },
    { label: 'Pending', value: personalStats.pending, color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    { label: 'Approved', value: personalStats.approved, color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { label: 'Rejected', value: personalStats.rejected, color: 'bg-red-100 text-red-700', icon: XCircle },
  ];

  const businessStatCards = [
    { label: 'Total', value: businessStats.total, color: 'bg-sky-100 text-sky-700', icon: Building2 },
    { label: 'Pending', value: businessStats.pending, color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    { label: 'Approved', value: businessStats.approved, color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { label: 'Rejected', value: businessStats.rejected, color: 'bg-red-100 text-red-700', icon: XCircle },
  ];

  const SkeletonRow = () => (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );

  const renderPersonalTable = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">#</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">User</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Document Type</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Risk</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Submitted</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {personalLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : personalVerifications.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No verifications found</p>
                </td>
              </tr>
            ) : (
              personalVerifications.map((v, idx) => {
                const TypeIcon = typeIcons[v.type] || Shield;
                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{(personalPage - 1) * 15 + idx + 1}</td>
                    <td className="px-4 py-3">
                      <a href={`/admin/users/${v.user.id}`} className="group">
                        <p className="font-medium text-gray-900 group-hover:text-sky-600">{v.user?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{v.user?.email}</p>
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <TypeIcon className="w-3.5 h-3.5" />
                        {typeLabels[v.type] || v.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {v.type === 'identity' ? (v.document_type || 'N/A') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${personalStatusColors[v.status] || 'bg-gray-100 text-gray-700'}`}>
                        {v.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {v.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-green-700 bg-green-50 rounded-full">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Auto-verify candidate
                        </span>
                      ) : v.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-red-700 bg-red-50 rounded-full" title={v.reason || 'Manual review failed'}>
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Flagged
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(v.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDocModal(v)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        {v.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprovePersonal(v)}
                              disabled={actionLoading === v.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all disabled:opacity-50"
                            >
                              {actionLoading === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectModal('personal', v.id, v.user?.name || 'Unknown')}
                              disabled={actionLoading === v.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBusinessTable = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">#</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Business Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Owner</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">CAC Number</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Risk</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Submitted</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {businessLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : businessVerifications.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No business verifications found</p>
                </td>
              </tr>
            ) : (
              businessVerifications.map((bv, idx) => (
                <tr key={bv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{(businessPage - 1) * 15 + idx + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{bv.business_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/admin/users/${bv.owner.id}`} className="group">
                      <p className="font-medium text-gray-900 group-hover:text-sky-600">{bv.owner?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{bv.owner?.email}</p>
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{bv.cac_number}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${businessStatusColors[bv.status] || 'bg-gray-100 text-gray-700'}`}>
                      {bv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {bv.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-green-700 bg-green-50 rounded-full">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Auto-verify candidate
                      </span>
                    ) : bv.status === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-red-700 bg-red-50 rounded-full" title={bv.reason || 'Manual review failed'}>
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Flagged
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(bv.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openBusinessDocModal(bv)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      {bv.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveBusiness(bv)}
                            disabled={actionLoading === bv.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all disabled:opacity-50"
                          >
                            {actionLoading === bv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal('business', bv.id, bv.business_name)}
                            disabled={actionLoading === bv.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPagination = (page: number, totalPages: number, setPage: (p: number) => void) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="px-4 py-2 text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verifications</h1>
        <p className="text-gray-500 mt-1">Manage user and business verification requests</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'personal'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          Personal Verification
        </button>
        <button
          onClick={() => setActiveTab('business')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'business'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Business Verification
        </button>
      </div>

      {activeTab === 'personal' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {personalStatCards.map(card => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {personalStatusTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setPersonalStatusFilter(tab.key); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${
                    personalStatusFilter === tab.key
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={personalTypeFilter}
                onChange={e => setPersonalTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="all">All Types</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="identity">Identity</option>
              </select>
            </div>
          </div>

          {renderPersonalTable()}
          {renderPagination(personalPage, personalTotalPages, setPersonalPage)}
        </div>
      )}

      {activeTab === 'business' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {businessStatCards.map(card => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {businessStatusTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setBusinessStatusFilter(tab.key); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                  businessStatusFilter === tab.key
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {renderBusinessTable()}
          {renderPagination(businessPage, businessTotalPages, setBusinessPage)}
        </div>
      )}

      {showDocModal && docVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDocModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Verification Documents
              </h2>
              <button onClick={() => setShowDocModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium text-gray-900">{docVerification.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{docVerification.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verification Type</p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 mt-1">
                    {(typeIcons[docVerification.type] || Shield)({ className: 'w-3.5 h-3.5' })}
                    {typeLabels[docVerification.type] || docVerification.type}
                  </span>
                </div>
                {docVerification.document_type && (
                  <div>
                    <p className="text-sm text-gray-500">Document Type</p>
                    <p className="font-medium text-gray-900">{docVerification.document_type}</p>
                  </div>
                )}
                {docVerification.document_number && (
                  <div>
                    <p className="text-sm text-gray-500">Document Number</p>
                    <p className="font-medium text-gray-900 font-mono">{docVerification.document_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="font-medium text-gray-900">{formatDate(docVerification.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${personalStatusColors[docVerification.status] || 'bg-gray-100 text-gray-700'}`}>
                    {docVerification.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {docVerification.document_front && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Front</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img src={docVerification.document_front} alt="Document front" className="w-full h-48 object-contain" />
                      </div>
                      <a
                        href={docVerification.document_front}
                        download
                        className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  )}
                  {docVerification.document_back && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Back</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img src={docVerification.document_back} alt="Document back" className="w-full h-48 object-contain" />
                      </div>
                      <a
                        href={docVerification.document_back}
                        download
                        className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  )}
                  {docVerification.document_selfie && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Selfie</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img src={docVerification.document_selfie} alt="Selfie" className="w-full h-48 object-contain" />
                      </div>
                      <a
                        href={docVerification.document_selfie}
                        download
                        className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  )}
                  {!docVerification.document_front && !docVerification.document_back && !docVerification.document_selfie && (
                    <p className="text-sm text-gray-400 col-span-full">No documents uploaded</p>
                  )}
                </div>
              </div>

              {docVerification.reason && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Rejection Reason</h3>
                  <p className="text-sm text-gray-600 bg-red-50 border border-red-100 rounded-lg p-3">{docVerification.reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDocModal && docBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDocModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-500" />
                Business Documents
              </h2>
              <button onClick={() => setShowDocModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="font-medium text-gray-900">{docBusiness.business_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-medium text-gray-900">{docBusiness.owner?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CAC Number</p>
                  <p className="font-medium text-gray-900 font-mono">{docBusiness.cac_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="font-medium text-gray-900">{formatDate(docBusiness.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${businessStatusColors[docBusiness.status] || 'bg-gray-100 text-gray-700'}`}>
                    {docBusiness.status}
                  </span>
                </div>
                {docBusiness.is_verified_seller !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Personal Verified</p>
                    {docBusiness.is_verified_seller ? (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Not Verified
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {docBusiness.cac_document && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">CAC Document</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img src={docBusiness.cac_document} alt="CAC document" className="w-full h-48 object-contain" />
                      </div>
                      <a href={docBusiness.cac_document} download className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  )}
                  {docBusiness.address_proof && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address Proof</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img src={docBusiness.address_proof} alt="Address proof" className="w-full h-48 object-contain" />
                      </div>
                      <a href={docBusiness.address_proof} download className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  )}
                  {docBusiness.utility_bill && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Utility Bill</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img src={docBusiness.utility_bill} alt="Utility bill" className="w-full h-48 object-contain" />
                      </div>
                      <a href={docBusiness.utility_bill} download className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  )}
                  {docBusiness.tax_registration && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tax Registration</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img src={docBusiness.tax_registration} alt="Tax registration" className="w-full h-48 object-contain" />
                      </div>
                      <a href={docBusiness.tax_registration} download className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  )}
                  {!docBusiness.cac_document && !docBusiness.address_proof && !docBusiness.utility_bill && !docBusiness.tax_registration && (
                    <p className="text-sm text-gray-400 col-span-full">No documents uploaded</p>
                  )}
                </div>
              </div>

              {docBusiness.reason && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Rejection Reason</h3>
                  <p className="text-sm text-gray-600 bg-red-50 border border-red-100 rounded-lg p-3">{docBusiness.reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRejectModal && rejectTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Reject Verification</h2>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectTarget(null); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-500">
                Reject verification for <strong>{rejectTarget.name}</strong>?
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[100px] text-sm resize-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectTarget(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading === rejectTarget.id || !rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1 text-sm"
                >
                  {actionLoading === rejectTarget.id && <Loader2 className="w-3 h-3 animate-spin" />}
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
