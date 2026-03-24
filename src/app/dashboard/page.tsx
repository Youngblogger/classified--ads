'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { adsApi, notificationsApi, messagesApi } from '@/lib/api';
import { Heart, MessageCircle, Eye, CheckCircle, Clock, Plus, FileText } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    sold: 0,
    favorites: 0,
    unreadMessages: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [adsRes, notificationsRes] = await Promise.all([
          adsApi.getMyAds().catch(() => ({ data: { data: [] } })),
          notificationsApi.getAll().catch(() => ({ data: { data: [] } })),
        ]);

        const ads = adsRes.data?.data || adsRes.data || [];
        
        setStats({
          active: ads.filter((a: any) => a.status === 'active').length,
          pending: ads.filter((a: any) => a.status === 'pending').length,
          sold: ads.filter((a: any) => a.status === 'sold').length,
          favorites: 0,
          unreadMessages: 0,
        });

        const notifications = notificationsRes.data?.data || notificationsRes.data || [];
        setRecentActivity(notifications.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const statCards = [
    {
      title: 'Active Ads',
      value: stats.active,
      change: 'Currently live',
      changeType: 'positive',
      icon: FileText,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      href: '/dashboard/my-ads?status=active',
    },
    {
      title: 'Pending Ads',
      value: stats.pending,
      change: 'Awaiting approval',
      changeType: 'neutral',
      icon: Clock,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      href: '/dashboard/my-ads?status=pending',
    },
    {
      title: 'Sold Ads',
      value: stats.sold,
      change: 'Completed sales',
      changeType: 'positive',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      href: '/dashboard/my-ads?status=sold',
    },
    {
      title: 'Favorites',
      value: stats.favorites,
      change: 'Saved items',
      changeType: 'positive',
      icon: Heart,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      href: '/dashboard/favorites',
    },
    {
      title: 'Messages',
      value: stats.unreadMessages,
      change: 'Unread',
      changeType: 'warning',
      icon: MessageCircle,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      href: '/dashboard/messages',
    },
  ];

  const quickActions = [
    {
      title: 'Post New Ad',
      description: 'List your item for sale',
      href: '/dashboard/post-ad',
      icon: Plus,
      buttonText: 'Create Ad',
      buttonVariant: 'primary',
    },
    {
      title: 'View Messages',
      description: 'Check your inbox',
      href: '/dashboard/messages',
      icon: MessageCircle,
      buttonText: 'Open Messages',
      buttonVariant: 'outline',
    },
    {
      title: 'Manage Ads',
      description: 'Edit or delete listings',
      href: '/dashboard/my-ads',
      icon: FileText,
      buttonText: 'View All Ads',
      buttonVariant: 'outline',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 sm:p-8 text-white">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.name || 'User'}!</h2>
        <p className="text-primary-100">Here&apos;s what&apos;s happening with your listings today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 shadow-card animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
          ))
        ) : (
          statCards.map((stat, index) => (
            <Link
              key={index}
              href={stat.href}
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className={`text-xs ${
                stat.changeType === 'positive' ? 'text-green-600' :
                stat.changeType === 'warning' ? 'text-yellow-600' :
                'text-gray-500'
              }`}>
                {stat.change}
              </p>
            </Link>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {quickActions.map((action, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gray-100">
                <action.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </div>
            <Link
              href={action.href}
              className={`inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                action.buttonVariant === 'primary'
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              {action.buttonText}
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 px-6 py-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-blue-100">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.message}</p>
                </div>
                <p className="text-xs text-gray-400 whitespace-nowrap">
                  {getTimeAgo(activity.created_at)}
                </p>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <Link
            href="/dashboard/notifications"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all activity →
          </Link>
        </div>
      </div>
    </div>
  );
}
