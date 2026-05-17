'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  UserPlus,
  FileText,
  DollarSign,
  Flag,
  Wallet,
  MessageSquare,
  CheckCircle,
  Check,
  Trash2,
  Loader2
} from 'lucide-react';
import { notificationsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read?: boolean;
  unread?: boolean;
  created_at: string;
}

const notificationIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  user: { icon: UserPlus, color: 'sky' },
  ad: { icon: FileText, color: 'purple' },
  payment: { icon: DollarSign, color: 'green' },
  report: { icon: Flag, color: 'red' },
  wallet: { icon: Wallet, color: 'amber' },
  message: { icon: MessageSquare, color: 'pink' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getAll();
      setNotifications(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, unread: false, is_read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, unread: false, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return n.unread || n.is_read === false;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 2) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    const isThisYear = date.getFullYear() === now.getFullYear();
    if (isThisYear) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">{unreadCount} unread notifications</p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-2 px-4 py-2 text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100"
        >
          <CheckCircle className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-4 overflow-x-auto">
        {['all', 'unread', 'user', 'ad', 'payment', 'report'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-sky-100 text-sky-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-48 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-full bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No notifications found
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filteredNotifications.map((notification) => {
            const iconConfig = notificationIcons[notification.type] || { icon: Bell, color: 'gray' };
            const Icon = iconConfig.icon;
            return (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 ${!notification.is_read ? 'bg-sky-50/50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-${iconConfig.color}-100`}>
                    <Icon className={`w-5 h-5 text-${iconConfig.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <span className="text-xs text-gray-400">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
