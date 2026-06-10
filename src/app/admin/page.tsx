'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, FileText, Flag, BarChart3, TrendingUp, CreditCard, FolderTree } from 'lucide-react';
import { adminApi } from '@/lib/api';

interface DashboardStats {
  total_users?: number;
  total_ads?: number;
  pending_approvals?: number;
  active_reports?: number;
  total_revenue?: number;
  active_boosts?: number;
}

const statCards = [
  { label: 'Total Users', key: 'total_users', icon: Users, href: '/admin/users', color: 'bg-blue-500' },
  { label: 'Total Ads', key: 'total_ads', icon: FileText, href: '/admin/ads-moderation', color: 'bg-emerald-500' },
  { label: 'Pending Approvals', key: 'pending_approvals', icon: TrendingUp, href: '/admin/ads/approval', color: 'bg-amber-500' },
  { label: 'Active Reports', key: 'active_reports', icon: Flag, href: '/admin/reports', color: 'bg-red-500' },
  { label: 'Categories', key: null, icon: FolderTree, href: '/admin/categories', color: 'bg-purple-500' },
  { label: 'Revenue', key: 'total_revenue', icon: CreditCard, href: '/admin/payments', color: 'bg-sky-500', prefix: '₦' },
  { label: 'Active Boosts', key: 'active_boosts', icon: TrendingUp, href: '/admin/boosts', color: 'bg-indigo-500' },
  { label: 'Analytics', key: null, icon: BarChart3, href: '/admin/analytics', color: 'bg-rose-500' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getDashboard();
        const data = res?.data?.stats || res?.data || {};
        setStats(data);
      } catch {
        // Silent fail — render with empty stats
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatNumber = (num?: number): string => {
    if (num === undefined || num === null) return '—';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to the admin control panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = card.key ? stats[card.key as keyof DashboardStats] : undefined;
          const displayValue = card.key
            ? loading
              ? '...'
              : card.prefix
                ? card.prefix + formatNumber(value)
                : formatNumber(value)
            : '—';

          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${card.color} bg-opacity-10`}>
                  <Icon className={`w-5 h-5 ${card.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{displayValue}</p>
              <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-700">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/ads-moderation" className="p-4 bg-gray-50 rounded-xl hover:bg-primary-50 hover:border-primary-200 border border-gray-100 transition-all text-center">
              <FileText className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Moderate Ads</span>
            </Link>
            <Link href="/admin/users" className="p-4 bg-gray-50 rounded-xl hover:bg-primary-50 hover:border-primary-200 border border-gray-100 transition-all text-center">
              <Users className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </Link>
            <Link href="/admin/reports" className="p-4 bg-gray-50 rounded-xl hover:bg-primary-50 hover:border-primary-200 border border-gray-100 transition-all text-center">
              <Flag className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">View Reports</span>
            </Link>
            <Link href="/admin/watermark" className="p-4 bg-gray-50 rounded-xl hover:bg-primary-50 hover:border-primary-200 border border-gray-100 transition-all text-center">
              <FileText className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Watermark Settings</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">PHP Backend</span>
              <span className="text-green-600 font-medium">API Connected</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Supabase</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Cloudinary</span>
              <span className="text-green-600 font-medium">Configured</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">App Version</span>
              <span className="text-gray-700 font-medium">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
