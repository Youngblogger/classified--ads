'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  MessageCircle, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Heart, 
  Bell, 
  Loader2,
  Settings,
  Trash2,
  CheckSquare
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read_at: string | null;
  created_at: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message':
    case 'App\\Notifications\\NewMessage':
      return { icon: MessageCircle, bg: 'bg-purple-100', color: 'text-purple-600' };
    case 'ad_approved':
    case 'App\\Notifications\\AdApproved':
      return { icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600' };
    case 'ad_expiring':
    case 'App\\Notifications\\AdExpiring':
      return { icon: AlertTriangle, bg: 'bg-yellow-100', color: 'text-yellow-600' };
    case 'new_view':
    case 'App\\Notifications\\NewAdView':
      return { icon: Eye, bg: 'bg-blue-100', color: 'text-blue-600' };
    case 'favorite':
    case 'App\\Notifications\\NewFavorite':
      return { icon: Heart, bg: 'bg-red-100', color: 'text-red-600' };
    case 'promotion':
    case 'App\\Notifications\\PromotionActivated':
      return { icon: CheckCircle, bg: 'bg-emerald-100', color: 'text-emerald-600' };
    case 'payment':
    case 'App\\Notifications\\PaymentReceived':
      return { icon: Bell, bg: 'bg-indigo-100', color: 'text-indigo-600' };
    default:
      return { icon: Bell, bg: 'bg-gray-100', color: 'text-gray-600' };
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function NotificationsContent() {
  const searchParams = useSearchParams();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [readFilter, setReadFilter] = useState(searchParams.get('read') || 'all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [typeFilter, readFilter, page]);

  const fetchNotifications = async () => {
    const timeoutId = setTimeout(() => {
      console.log('Notifications fetch timeout - forcing loading to false');
      setLoading(false);
    }, 10000);
    
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: page.toString(),
      };
      
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      if (readFilter === 'unread') {
        params.unread = 'true';
      }
      
      const res = await api.get('/notifications', { params });
      clearTimeout(timeoutId);
      const data = res.data;
      
      if (page === 1) {
        setNotifications(data.data || []);
      } else {
        setNotifications(prev => [...prev, ...(data.data || [])]);
      }
      
      setHasMore((data.data?.length || 0) >= 20);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
      setNotifications([]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: number) => {
    if (!confirm('Delete this notification?')) return;
    
    setDeleting(id);
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete notification');
    } finally {
      setDeleting(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'message', label: 'Messages' },
    { value: 'ad_approved', label: 'Ad Approved' },
    { value: 'ad_expiring', label: 'Expiring' },
    { value: 'new_view', label: 'Views' },
    { value: 'favorite', label: 'Favorites' },
    { value: 'promotion', label: 'Promotions' },
    { value: 'payment', label: 'Payments' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            Mark all as read
          </button>
          <Link
            href="/dashboard/notifications/preferences"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
            Preferences
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => { setTypeFilter(option.value); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                typeFilter === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200 w-fit">
          {[
            { value: 'all', label: 'All' },
            { value: 'unread', label: 'Unread' },
            { value: 'read', label: 'Read' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => { setReadFilter(option.value); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                readFilter === option.value
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading && page === 1 ? (
          <div className="p-4 sm:p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500">
              {readFilter === 'unread' ? "You've read all your notifications" : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const iconConfig = getNotificationIcon(notification.type);
              const IconComponent = iconConfig.icon;
              const isRead = !!notification.read_at;
              
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 sm:p-6 hover:bg-gray-50 transition-colors ${
                    !isRead ? 'bg-primary-50/50' : ''
                  }`}
                >
                  <div className={`p-3 rounded-xl ${iconConfig.bg}`}>
                    <IconComponent className={`w-5 h-5 ${iconConfig.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      {!isRead && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs text-gray-400">{formatTime(notification.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      disabled={deleting === notification.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === notification.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {notifications.length > 0 && hasMore && (
          <div className="p-4 text-center">
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsLoading />}>
      <NotificationsContent />
    </Suspense>
  );
}
