'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  CreditCard,
  Filter,
  Zap,
  TrendingUp,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Payment {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  payment_method: string;
  reference: string;
  status: string;
  type: string;
  gateway: string;
  created_at: string;
  completed_at: string | null;
  gateway_response?: any;
  metadata?: any;
  user?: {
    name: string;
    email: string;
  };
  ad?: {
    id: number;
    title: string;
  };
}

interface FinancialSummary {
  admin_balance: number;
  total_revenue: number;
  total_withdrawals: number;
  total_user_balance: number;
  total_user_credits: number;
  total_user_debits: number;
  completed_payments_count: number;
  completed_payments_sum: number;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  boost: <Zap className="w-3.5 h-3.5" />,
  promotion: <TrendingUp className="w-3.5 h-3.5" />,
  wallet: <Wallet className="w-3.5 h-3.5" />,
};

const TYPE_COLORS: Record<string, string> = {
  boost: 'bg-amber-100 text-amber-700',
  promotion: 'bg-sky-100 text-sky-700',
  wallet: 'bg-purple-100 text-purple-700',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (methodFilter) params.payment_method = methodFilter;

      const [paymentsRes, summaryRes] = await Promise.all([
        adminApi.getPayments(params),
        adminApi.getFinancialSummary(),
      ]);

      const payments = paymentsRes.data?.data || paymentsRes.data || [];
      setPayments(Array.isArray(payments) ? payments : []);
      if (summaryRes.data?.summary) {
        setSummary(summaryRes.data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, methodFilter]);

  useEffect(() => {
    fetchData();
  }, [statusFilter, typeFilter, methodFilter, fetchData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPayments = payments.filter(p => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        p.reference?.toLowerCase().includes(search) ||
        p.user?.name?.toLowerCase().includes(search) ||
        p.user?.email?.toLowerCase().includes(search) ||
        p.ad?.title?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-white/80" />
              <span className="text-white/80">Admin Balance</span>
            </div>
            <p className="text-2xl font-bold">₦{Number(summary.admin_balance || 0).toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-500">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₦{Number(summary.total_revenue || 0).toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-sky-600" />
              <span className="text-gray-500">Completed Payments</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.completed_payments_count || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-gray-500">User Wallet Funds</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₦{Number(summary.total_user_balance || 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference, user, ad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
          >
            <option value="">All Types</option>
            <option value="boost">Boost</option>
            <option value="promotion">Promotion</option>
            <option value="wallet">Wallet Fund</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm"
          >
            <option value="">All Methods</option>
            <option value="card">Card</option>
            <option value="bank">Bank Transfer</option>
            <option value="ussd">USSD</option>
          </select>
          <button
            onClick={fetchData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-3"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-3"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-3"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div></th>
                  <th className="px-6 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></th>
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
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        <div className="h-3 w-8 bg-gray-100 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-6 w-14 bg-gray-200 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{payment.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{payment.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">
                        ₦{Number(payment.amount || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{payment.currency}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full capitalize ${TYPE_COLORS[payment.type] || 'bg-gray-100 text-gray-700'}`}>
                        {TYPE_ICONS[payment.type]}
                        {payment.type || 'payment'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">
                        {payment.gateway || payment.payment_method || 'paystack'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500 font-mono truncate max-w-[120px]" title={payment.reference}>
                        {payment.reference}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500">{formatDate(payment.created_at)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
