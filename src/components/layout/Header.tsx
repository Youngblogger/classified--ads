'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, MapPin, Bell, Heart, User, LogOut, Plus, Phone, MessageCircle, Check, Star, CreditCard, TrendingUp, Shield, AlertTriangle, ThumbsUp, ThumbsDown, Megaphone, Ban, Mail, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { useAuthStore, useUIStore, useGlobalStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { api, notificationsApi, messagesApi } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import SearchBar from '@/components/ui/SearchBar';

function getAvatarUrl(url: string | null | undefined): string {
  if (!url) return '';
  let avatarUrl = url;
  if (avatarUrl.startsWith('/storage/')) {
    avatarUrl = `http://127.0.0.1:8000${avatarUrl}`;
  }
  return avatarUrl;
}

const NOTIFICATION_ICONS: Record<string, any> = {
  ad_approved: ThumbsUp,
  ad_rejected: ThumbsDown,
  ad_deleted: AlertTriangle,
  new_message: MessageCircle,
  payment_received: CreditCard,
  payment_approved: CreditCard,
  payment_rejected: CreditCard,
  promotion_activated: TrendingUp,
  promotion_expired: TrendingUp,
  account_verified: Shield,
  account_suspended: AlertTriangle,
  account_banned: Ban,
  account_unsuspended: ThumbsUp,
  new_review: Star,
  review_received: Star,
  report_received: FileText,
  report_actioned: FileText,
  admin_broadcast: Megaphone,
  new_favorite: Heart,
  system_notice: AlertTriangle,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  ad_approved: 'bg-green-100 text-green-600',
  ad_rejected: 'bg-red-100 text-red-600',
  ad_deleted: 'bg-red-100 text-red-600',
  new_message: 'bg-blue-100 text-blue-600',
  payment_received: 'bg-green-100 text-green-600',
  payment_approved: 'bg-green-100 text-green-600',
  payment_rejected: 'bg-red-100 text-red-600',
  promotion_activated: 'bg-purple-100 text-purple-600',
  promotion_expired: 'bg-gray-100 text-gray-600',
  account_verified: 'bg-green-100 text-green-600',
  account_suspended: 'bg-yellow-100 text-yellow-600',
  account_banned: 'bg-red-100 text-red-600',
  account_unsuspended: 'bg-green-100 text-green-600',
  new_review: 'bg-yellow-100 text-yellow-600',
  review_received: 'bg-yellow-100 text-yellow-600',
  report_received: 'bg-blue-100 text-blue-600',
  report_actioned: 'bg-blue-100 text-blue-600',
  admin_broadcast: 'bg-purple-100 text-purple-600',
  new_favorite: 'bg-red-100 text-red-600',
  system_notice: 'bg-gray-100 text-gray-600',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const fetcher = (url: string) => fetch(url).then(r => r.json()).catch(() => null);

function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, user, logout, updateAuth } = useAuthStore();
  const { isMobileMenuOpen, toggleMobileMenu, toggleLoginModal, toggleRegisterModal, toggleLocationModal } = useUIStore();
  const { selectedLocation, addNotification } = useGlobalStore();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch categories for search bar
  const { data: categoriesData } = useSWR(
    `${API_URL}/categories`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000, fallbackData: [] }
  );

  const categories = categoriesData?.data || categoriesData || [];

  const handleNewNotification = useCallback((notification: any) => {
    console.log('New notification received:', notification);
    setRecentNotifications(prev => [notification, ...prev].slice(0, 10));
    setUnreadCount(prev => prev + 1);
    addNotification(notification);
    
    const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;
    toast.custom(
      (t) => (
        <div
          className={`bg-white shadow-lg rounded-xl border border-gray-100 p-4 flex items-start gap-3 max-w-sm ${
            t.visible ? 'animate-enter' : 'animate-leave'
          }`}
        >
          <div className={`w-10 h-10 rounded-full ${NOTIFICATION_COLORS[notification.type] || 'bg-gray-100 text-gray-600'} flex items-center justify-center flex-shrink-0`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  }, [addNotification]);

  const { socket } = useSocket({
    userId: user?.id,
    onNotification: handleNewNotification,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchRecentMessages();
    }
  }, [isAuthenticated]);

  // Sync auth state from backend on mount
  useEffect(() => {
    setMounted(true);
    const syncAuth = async () => {
      const storedToken = localStorage.getItem('auth-storage');
      if (storedToken) {
        try {
          const parsed = JSON.parse(storedToken);
          const token = parsed.state?.token;
          if (token) {
            // Verify token is still valid and get fresh user data
            const res = await api.get('/auth/me');
            if (res.data) {
              // Token is valid, update user data with fresh info including avatar
              updateAuth({ 
                user: { ...parsed.state.user, ...res.data }, 
                token, 
                isAuthenticated: true 
              });
            }
          }
        } catch (error) {
          // Token invalid or expired - clear auth state
          logout();
        }
      }
    };
    syncAuth();
  }, [logout, updateAuth]);

  const fetchNotifications = async () => {
    try {
      const [countRes, unreadRes] = await Promise.all([
        api.get('/notifications/unread-count'),
        api.get('/notifications/unread'),
      ]);
      setUnreadCount(countRes.data.count || 0);
      setRecentNotifications(unreadRes.data?.data || unreadRes.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchRecentMessages = async () => {
    try {
      const res = await messagesApi.getConversations();
      const conversations = res.data?.data || res.data || [];
      setRecentMessages(conversations.slice(0, 5));
      const unreadCount = conversations.filter((c: any) => c.unread_count > 0).length;
      setUnreadMessagesCount(unreadCount);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setRecentNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setRecentNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.read_at) {
      handleMarkAsRead(notif.id);
    }
    
    // Handle different notification types
    switch (notif.type) {
      case 'ad_approved':
      case 'ad_rejected':
      case 'ad_deleted':
        if (notif.data?.ad_slug) {
          router.push(`/ad/${notif.data.ad_slug}`);
        } else if (notif.data?.ad_id) {
          router.push(`/ad/${notif.data.ad_id}`);
        } else {
          router.push('/dashboard/my-ads');
        }
        break;
      case 'new_message':
        if (notif.data?.conversation_id) {
          router.push(`/dashboard/messages?conversation=${notif.data.conversation_id}`);
        } else {
          router.push('/dashboard/messages');
        }
        break;
      case 'payment_received':
      case 'payment_approved':
      case 'payment_rejected':
        router.push('/dashboard/payments');
        break;
      case 'promotion_activated':
      case 'promotion_expired':
        if (notif.data?.ad_id) {
          router.push(`/dashboard/my-ads?highlight=${notif.data.ad_id}`);
        } else {
          router.push('/dashboard/promotions');
        }
        break;
      case 'account_verified':
      case 'account_suspended':
      case 'account_banned':
      case 'account_unsuspended':
        router.push('/dashboard');
        break;
      case 'new_review':
      case 'review_received':
        if (notif.data?.ad_id) {
          router.push(`/ad/${notif.data.ad_id}`);
        } else {
          router.push('/dashboard/reviews');
        }
        break;
      case 'report_received':
      case 'report_actioned':
        router.push('/dashboard/reports');
        break;
      case 'new_favorite':
        if (notif.data?.ad_slug) {
          router.push(`/ad/${notif.data.ad_slug}`);
        } else if (notif.data?.ad_id) {
          router.push(`/ad/${notif.data.ad_id}`);
        }
        break;
      default:
        router.push('/dashboard/notifications');
    }
    setNotificationOpen(false);
  };

  const handleMessageClick = (conversation: any) => {
    router.push(`/dashboard/messages?conversation=${conversation.id}`);
    setNotificationOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Call backend logout
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Backend logout failed, proceeding with local logout');
    }
    
    // Clear local storage
    localStorage.removeItem('auth-storage');
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.trim().split('=')[0];
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
    });
    
    // Clear store state
    logout();
    
    // Full page reload to clear all state
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 bg-[#4B5320] shadow-sm pb-2.5">
      {/* Top Bar */}
      <div className="bg-[#3a3f18] text-white py-2 px-4">
        <div className="container-app flex justify-between items-center text-sm">
          <div className="hidden md:flex items-center gap-4">
            <span>Buy & Sell locally on iList</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <a href="tel:+234813371XXXX" className="hidden lg:flex items-center gap-1 hover:text-gray-300 transition-colors">
              <Phone className="w-4 h-4" />
              <span>+234 813 371 XXXX</span>
            </a>
            <Link href="/help" className="hover:text-gray-300 transition-colors">
              Help
            </Link>
            <Link href="/about" className="hover:text-gray-300 transition-colors">
              About
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-app py-4">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className="text-[#4B5320] font-bold text-xl">i</span>
              </div>
              <span className="text-2xl font-display font-bold text-white">iList</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <SearchBar 
              categories={categories} 
              variant="header" 
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2.5 hover:bg-white/10 rounded-xl transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-white" />
                  {(unreadCount + unreadMessagesCount) > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {(unreadCount + unreadMessagesCount) > 9 ? '9+' : (unreadCount + unreadMessagesCount)}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-gray-100 animate-fade-in z-50">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                      <button
                        onClick={() => setActiveTab('notifications')}
                        className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                          activeTab === 'notifications' 
                            ? 'text-primary-600 border-b-2 border-primary-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab('messages')}
                        className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                          activeTab === 'messages' 
                            ? 'text-primary-600 border-b-2 border-primary-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Messages
                        {unreadMessagesCount > 0 && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-80 overflow-y-auto">
                      {activeTab === 'notifications' && (
                        <>
                          {recentNotifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500">
                              No notifications
                            </div>
                          ) : (
                            <>
                              <div className="px-4 py-2 border-b border-gray-50 text-right">
                                <button 
                                  onClick={handleMarkAllAsRead}
                                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 ml-auto"
                                >
                                  <Check className="w-3 h-3" />
                                  Mark all as read
                                </button>
                              </div>
                              {recentNotifications.slice(0, 5).map((notif: any) => {
                                const IconComponent = NOTIFICATION_ICONS[notif.type] || Bell;
                                const iconColor = NOTIFICATION_COLORS[notif.type] || 'bg-gray-100 text-gray-600';
                                return (
                                  <div 
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer ${
                                      !notif.read_at ? 'bg-blue-50' : ''
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`w-10 h-10 rounded-full ${iconColor} flex items-center justify-center flex-shrink-0`}>
                                        <IconComponent className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                        {notif.created_at && (
                                          <p className="text-xs text-gray-400 mt-1">
                                            {formatNotificationTime(notif.created_at)}
                                          </p>
                                        )}
                                      </div>
                                      {!notif.read_at && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </>
                      )}

                          {activeTab === 'messages' && (
                        <>
                          {recentMessages.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500">
                              No messages
                            </div>
                          ) : (
                            recentMessages.map((conversation: any) => (
                              <div 
                                key={conversation.id}
                                onClick={() => handleMessageClick(conversation)}
                                className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer"
                              >
                                <div className="flex items-start gap-3">
                                  {conversation.sender?.avatar || conversation.receiver?.avatar ? (
                                    <img 
                                      src={getAvatarUrl((conversation.sender || conversation.receiver)?.avatar_url || (conversation.sender || conversation.receiver)?.avatar)} 
                                      alt="" 
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-gray-900">
                                        {conversation.sender?.name || conversation.receiver?.name || 'User'}
                                      </p>
                                      {conversation.unread_count > 0 && (
                                        <span className="bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                                          {conversation.unread_count}
                                        </span>
                                      )}
                                    </div>
                                    {conversation.ad && (
                                      <p className="text-xs text-primary-600 truncate">
                                        Re: {conversation.ad.title}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                      {conversation.last_message?.content || conversation.last_message?.substring(0, 50) || 'No messages yet'}
                                    </p>
                                    {conversation.last_message_at && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        {formatNotificationTime(conversation.last_message_at)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </>
                      )}
                    </div>

                    <div className="px-4 py-3 border-t border-gray-100">
                      <Link 
                        href={activeTab === 'notifications' ? "/dashboard/notifications" : "/dashboard/messages"}
                        className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                        onClick={() => setNotificationOpen(false)}
                      >
                        View all {activeTab === 'notifications' ? 'notifications' : 'messages'}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Favorites */}
            {isAuthenticated && (
              <Link 
                href="/dashboard/favorites"
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <Heart className="w-5 h-5 text-white" />
              </Link>
            )}

            {/* Profile */}
            {mounted && isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  {/* Profile Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                    {user?.google_avatar || user?.avatar || user?.avatar_url ? (
                      <img 
                        src={getAvatarUrl(user.google_avatar || user.avatar || user.avatar_url)} 
                        alt={user.name || 'User'} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[#4B5320] font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-dropdown border border-gray-100 py-2 animate-fade-in z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center">
                          {user?.google_avatar || user?.avatar || user?.avatar_url ? (
                            <img 
                              src={getAvatarUrl(user.google_avatar || user.avatar || user.avatar_url)} 
                              alt={user.name || 'User'} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-[#4B5320] font-bold text-lg">
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-dark">My Account</span>
                    </Link>
                    <Link
                      href="/dashboard/my-ads"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-dark">My Ads</span>
                    </Link>
                    <Link
                      href="/dashboard/favorites"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Heart className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-dark">Favorites</span>
                    </Link>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-red-600">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                    <button
                      onClick={toggleLoginModal}
                      className="px-4 py-2 text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={toggleRegisterModal}
                      className="px-4 py-2 bg-white text-[#4B5320] hover:bg-gray-100 rounded-xl font-medium transition-colors"
                    >
                  Register
                </button>
              </div>
            )}

            {/* Post Ad Button */}
            {isAuthenticated ? (
              <Link
                href="/post-ad"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white text-[#4B5320] hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Post Ad
              </Link>
            ) : (
              <Link
                href="/post-ad"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white text-[#4B5320] hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Post Ad
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2.5 hover:bg-white/10 rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Browse Categories Navigation */}
      <div className="border-t border-white/20 bg-[#3d4220]">
        <div className="container-app py-2">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-thin text-sm">
            <Link href="/categories" className="flex items-center gap-1.5 text-white hover:text-gray-200 font-medium whitespace-nowrap">
              <span>☰</span> All Categories
            </Link>
            {categories.slice(0, 16).map((category: any) => (
              <Link 
                key={category.id} 
                href={`/ads?category=${category.slug}`}
                className="text-white/80 hover:text-white whitespace-nowrap transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-slide-down">
          <div className="container-app py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Mobile Location */}
            <button onClick={toggleLocationModal} className="flex items-center gap-2 w-full p-3 bg-gray-100 rounded-xl">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">{selectedLocation?.name || 'Select Location'}</span>
            </button>

            {/* Mobile Actions */}
            <div className="grid grid-cols-2 gap-3">
              {!isAuthenticated && (
                <>
                  <button
                    onClick={toggleLoginModal}
                    className="py-3 border-2 border-gray-200 rounded-xl font-medium text-dark hover:border-gray-300 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={toggleRegisterModal}
                    className="py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                  >
                    Register
                  </button>
                </>
              )}
            </div>

            {isAuthenticated && (
              <Link
                href="/post-ad"
                className="flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Post Your Ad
              </Link>
            )}

            {/* Mobile Nav Links */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              {isAuthenticated && (
                <>
                  <Link href="/dashboard" className="block py-2 text-dark font-medium">
                    My Account
                  </Link>
                  <Link href="/dashboard/my-ads" className="block py-2 text-dark font-medium">
                    My Ads
                  </Link>
                  <Link href="/dashboard/favorites" className="block py-2 text-dark font-medium">
                    Favorites
                  </Link>
                  <Link href="/dashboard/messages" className="block py-2 text-dark font-medium">
                    Messages
                  </Link>
                </>
              )}
              <Link href="/categories" className="block py-2 text-dark font-medium">
                All Categories
              </Link>
              <button onClick={handleLogout} className="block py-2 text-error font-medium w-full text-left">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
