'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  FileText,
  FolderTree,
  MessageSquare,
  DollarSign,
  Flag,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { adminApi, api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { StatsCardSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

function AdminLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        login: email,
        password: password,
      });

      if (response.data.user && response.data.user.role === 'admin') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onSuccess();
      } else {
        setError('Access denied. Admin credentials required.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      if (errorMessage?.includes('Invalid credentials')) {
        setError('Incorrect email or password');
      } else {
        setError(errorMessage || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-purple-50">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-purple-500 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 mt-2">Sign in to access the admin dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-gray-900 placeholder-gray-400"
              placeholder="admin@ilist.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 pr-10 bg-white text-gray-900 placeholder-gray-400"
                placeholder="Enter password"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-medium disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div className="text-center">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Homepage</a>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DashboardStats {
  total_users: number;
  total_ads: number;
  active_ads: number;
  pending_ads: number;
  reported_ads: number;
  total_categories: number;
  total_messages: number;
  financial?: {
    admin_balance: number;
    total_revenue: number;
    total_withdrawals: number;
    total_user_balance: number;
    completed_payments_count: number;
    completed_payments_sum: number;
  };
}

interface WalletStats {
  admin_wallet?: {
    balance: number;
    pending_balance: number;
  };
  today_revenue?: number;
  today_withdrawals?: number;
  recent_transactions?: Transaction[];
  recent_payments?: Payment[];
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

interface Payment {
  id: number;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  user?: { name: string; email: string };
}

interface RecentAd {
  id: number;
  title: string;
  price: string;
  status: string;
  location: { name: string } | string | null;
  lga?: string;
  created_at: string;
}

interface RecentUser {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { token, isAuthenticated, user, hasHydrated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [recentAds, setRecentAds] = useState<RecentAd[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    
    const fetchDashboardData = async () => {
      const currentToken = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (!currentToken) {
        if (!isCancelled) setLoading(false);
        return;
      }
      
      try {
        const [statsRes, walletRes, adsRes, usersRes] = await Promise.all([
          adminApi.getDashboard().catch(() => ({ data: null })),
          adminApi.getPaymentStats().catch(() => ({ data: {} })),
          adminApi.getAds({ per_page: 5 }).catch(() => ({ data: { data: [] } })),
          adminApi.getUsers({ per_page: 5 }).catch(() => ({ data: { data: [] } })),
        ]);
        
        if (!isCancelled) {
          if (statsRes.data) setStats(statsRes.data);
          if (walletRes.data) setWalletStats(walletRes.data);
          if (adsRes.data?.data) setRecentAds(adsRes.data.data);
          if (usersRes.data?.data) setRecentUsers(usersRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        if (!isCancelled) setError('Failed to load dashboard data');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchDashboardData();
    
    const timer = setTimeout(() => {
      if (!isCancelled) setLoading(false);
    }, 5000);
    
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [hasHydrated]);

  const formatNumber = (num: number | undefined | null) => {
    if (num == null) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount == null) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (hasHydrated || !isAuthenticated) {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (storedUser && storedToken) {
        setIsAuthChecked(true);
      } else if (hasHydrated) {
        setIsAuthChecked(true);
      }
    }
  }, [hasHydrated, isAuthenticated]);

  const checkIsAdmin = () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token') || localStorage.getItem('admin_token') || token;
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        return userData?.role === 'admin';
      } catch {
        return false;
      }
    }
    return isAuthenticated && user?.role === 'admin';
  };

  const isAdmin = checkIsAdmin();

  if (!hasHydrated && !isAuthChecked) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLoginForm onSuccess={() => window.location.reload()} />;
  }

  const statsData = stats ? [
    { name: 'Total Users', value: formatNumber(stats.total_users), change: '+12.5%', changeType: 'increase' as const, icon: Users, color: 'sky' as const },
    { name: 'Total Ads', value: formatNumber(stats.total_ads), change: '+8.2%', changeType: 'increase' as const, icon: FileText, color: 'purple' as const },
    { name: 'Active Ads', value: formatNumber(stats.active_ads), change: '+5.4%', changeType: 'increase' as const, icon: CheckCircle, color: 'green' as const },
    { name: 'Pending Ads', value: formatNumber(stats.pending_ads), change: '-2.1%', changeType: 'decrease' as const, icon: Clock, color: 'amber' as const },
  ] : [];

  const walletStatsData = walletStats ? [
    { name: 'Admin Balance', value: formatCurrency(walletStats.admin_wallet?.balance || stats?.financial?.admin_balance || 0), icon: DollarSign, color: 'emerald' as const },
    { name: 'Total Revenue', value: formatCurrency(stats?.financial?.total_revenue || 0), icon: TrendingUp, color: 'green' as const },
    { name: 'User Wallets', value: formatCurrency(stats?.financial?.total_user_balance || 0), icon: Users, color: 'blue' as const },
    { name: 'Withdrawals', value: formatCurrency(stats?.financial?.total_withdrawals || 0), icon: TrendingDown, color: 'red' as const },
  ] : [];

  const colorClasses = {
    sky: 'bg-sky-100 text-sky-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    pink: 'bg-pink-100 text-pink-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}. Please ensure the backend is running.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Stats - Financial Overview */}
      {walletStatsData.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Financial Overview</h2>
            <a href="/admin/wallets" className="text-sm text-white/80 hover:text-white flex items-center gap-1">
              Manage Wallets <DollarSign className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {walletStatsData.map((stat) => (
              <div key={stat.name} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className="w-5 h-5 text-white/80" />
                  <span className="text-sm text-white/80">{stat.name}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'increase' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Ads */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Ads</h2>
            <a href="/admin/ads" className="text-sm text-sky-600 hover:text-sky-700">View all</a>
          </div>
          <div className="divide-y divide-gray-100">
            {recentAds.map((ad) => (
              <div key={ad.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ad.title}</p>
                    <p className="text-sm text-gray-500">{typeof ad.location === 'object' ? (ad.lga ? `${ad.location?.name}, ${ad.lga}` : ad.location?.name) || 'N/A' : ad.location || 'N/A'} • {timeAgo(ad.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                      {ad.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{ad.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <a href="/admin/users" className="text-sm text-sky-600 hover:text-sky-700">View all</a>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{timeAgo(user.created_at)}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
            <a href="/admin/wallets" className="text-sm text-sky-600 hover:text-sky-700">View all</a>
          </div>
          <div className="divide-y divide-gray-100">
            {stats && (stats.financial?.total_revenue || 0) > 0 ? (
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Recent Transactions</p>
                    <p className="text-xs text-gray-500">Wallet activity</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(stats.financial?.total_revenue || 0)}</p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Total
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p className="text-sm">No recent payments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <a href="/admin/ads?status=pending" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-sky-500 hover:bg-sky-50 transition-colors">
            <Clock className="w-8 h-8 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">Pending Ads</span>
            <span className="text-xs text-gray-500">{stats ? formatNumber(stats.pending_ads) : 0} ads</span>
          </a>
          <a href="/admin/reports" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-colors">
            <Flag className="w-8 h-8 text-red-500" />
            <span className="text-sm font-medium text-gray-700">Reports</span>
            <span className="text-xs text-gray-500">{stats ? formatNumber(stats.reported_ads) : 0} reports</span>
          </a>
          <a href="/admin/categories" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <FolderTree className="w-8 h-8 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Categories</span>
            <span className="text-xs text-gray-500">{stats ? formatNumber(stats.total_categories) : 0}</span>
          </a>
          <a href="/admin/users" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
            <Users className="w-8 h-8 text-emerald-500" />
            <span className="text-sm font-medium text-gray-700">View Users</span>
            <span className="text-xs text-gray-500">{stats ? formatNumber(stats.total_users) : 0} users</span>
          </a>
        </div>
      </div>
    </div>
  );
}
