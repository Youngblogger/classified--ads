'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserX,
  Ban,
  Trash2,
  Loader2
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { invalidateSwrCache } from '@/lib/cache-sync';
import toast from 'react-hot-toast';

interface Report {
  id: number;
  ad: {
    id: number;
    title: string;
    image?: string;
    price?: string;
    seller?: string;
  };
  reason: string;
  description: string;
  reporter?: string;
  status: string;
  created_at: string;
  date?: string;
}

export default function ReportsPage() {
  const triggerCacheSync = useCallback(() => {
    invalidateSwrCache(/^ads\?/);
    invalidateSwrCache('homepage_data');
    invalidateSwrCache('boosted_ads_listing');
    invalidateSwrCache(/^search/);
    invalidateSwrCache(/^secure-control-9ja/);
  }, []);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await adminApi.getReports(params);
      setReports(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [statusFilter, fetchReports]);

  const handleResolve = async (id: number) => {
    try {
      setActionLoading(id);
      await adminApi.resolveReport(id);
      toast.success('Report resolved');
      fetchReports();
    } catch (error) {
      console.error('Failed to resolve report:', error);
      toast.error('Failed to resolve report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (id: number) => {
    try {
      setActionLoading(id);
      await adminApi.dismissReport(id);
      toast.success('Report dismissed');
      fetchReports();
    } catch (error) {
      console.error('Failed to dismiss report:', error);
      toast.error('Failed to dismiss report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAd = async (reportId: number, adId: number) => {
    if (!confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      return;
    }
    try {
      setActionLoading(reportId);
      await adminApi.deleteAd(adId);
      toast.success('Ad deleted successfully');
      triggerCacheSync();
      fetchReports();
    } catch (error) {
      console.error('Failed to delete ad:', error);
      toast.error('Failed to delete ad');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = (report.ad?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2.5 w-full sm:w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex gap-4 lg:w-1/3">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-4 w-full bg-gray-100 rounded"></div>
                  <div className="h-3 w-48 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No reports found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex gap-4 lg:w-1/3">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                    {report.ad?.image ? (
                      <Image
                        src={report.ad.image}
                        alt={report.ad.title || 'Ad'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{report.ad?.title || 'Unknown Ad'}</p>
                    <p className="text-sm text-sky-600 font-semibold">{report.ad?.price || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Seller: {report.ad?.seller || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      {report.reason}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      report.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <p className="text-xs text-gray-400">
                    {report.reporter && `Reported by ${report.reporter} on `}
                    {formatDate(report.created_at || report.date || new Date().toISOString())}
                  </p>
                </div>

                <div className="flex flex-col gap-2 lg:items-end">
                  {report.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleResolve(report.id)}
                        disabled={actionLoading === report.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === report.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Resolve
                      </button>
                      <button 
                        onClick={() => handleDismiss(report.id)}
                        disabled={actionLoading === report.id}
                        className="flex items-center gap-1 px-3 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Dismiss
                      </button>
                      <button 
                        onClick={() => handleDeleteAd(report.id, report.ad?.id)}
                        disabled={actionLoading === report.id}
                        className="flex items-center gap-1 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Ad
                      </button>
                    </>
                  )}
                  <button className="flex items-center gap-1 px-3 py-2 text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
