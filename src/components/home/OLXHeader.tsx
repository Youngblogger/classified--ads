'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, MapPin, Menu, X, ChevronDown, User, 
  Plus, Heart, MessageCircle, Settings, LogOut,
  LayoutDashboard, Package, Clock, Loader2, Check,
  Bell, CreditCard, TrendingUp, Shield, AlertTriangle,
  ThumbsUp, ThumbsDown, Megaphone, Ban, FileText,
  Star, ArrowRight, CheckCircle
} from 'lucide-react';
import { useAuthStore, useUIStore, useGlobalStore } from '@/lib/store';
import { nigeriaLocations, NigeriaLocation } from '@/lib/nigeriaLocations';
import { api, notificationsApi, messagesApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';

const RECENT_SEARCHES_KEY = 'olx_recent_searches';
const MAX_RECENT_SEARCHES = 5;

const NOTIFICATION_ICONS: Record<string, any> = {
  ad_approved: ThumbsUp,
  ad_rejected: ThumbsDown,
  ad_deleted: AlertTriangle,
  ad_published: CheckCircle,
  ad_pending: Clock,
  new_message: MessageCircle,
  new_ad_followed: Package,
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
  ad_published: 'bg-green-100 text-green-600',
  ad_pending: 'bg-yellow-100 text-yellow-600',
  new_message: 'bg-blue-100 text-blue-600',
  new_ad_followed: 'bg-violet-100 text-violet-600',
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

export default function OLXHeader() {
  const router = useRouter();
  const { isAuthenticated, user, logout, hasHydrated } = useAuthStore();
  const { toggleLoginModal, toggleRegisterModal } = useUIStore();
  const { selectedLocation } = useGlobalStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocationState, setSelectedLocationState] = useState<string>(selectedLocation?.name || 'All Nigeria');
  const [selectedLocationSlug, setSelectedLocationSlug] = useState<string | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<string | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showLGADropdown, setShowLGADropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  
  const searchRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  if (!hasHydrated) {
    return (
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container-app">
          <div className="h-16 flex items-center justify-between">
            <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults(null);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      setShowSearchDropdown(false);
      const params = new URLSearchParams();
      params.append('q', searchQuery.trim());
      if (selectedLocationSlug) {
        params.append('location', selectedLocationSlug);
      }
      if (selectedLGA) {
        params.append('lga', selectedLGA);
      }
      router.push(`/ads?${params.toString()}`);
    }
  };

  const handleSearchResultClick = (type: 'ad' | 'category', item: any) => {
    saveRecentSearch(item.title || item.name);
    setShowSearchDropdown(false);
    setSearchQuery('');
    
    if (type === 'ad') {
      router.push(`/ad/${item.slug}`);
    } else {
      router.push(`/ads?category=${item.slug}`);
    }
  };

  const handleLocationSelect = (location: NigeriaLocation | null) => {
    if (location) {
      setSelectedLocationState(location.name);
      setSelectedLocationSlug(location.slug);
      setSelectedLGA(null);
      // If state has LGAs, show LGA dropdown
      if (location.lgas && location.lgas.length > 0) {
        setShowLGADropdown(true);
      }
    } else {
      setSelectedLocationState('All Nigeria');
      setSelectedLocationSlug(null);
      setSelectedLGA(null);
    }
    setShowLocationDropdown(false);
  };

  const handleLGASelect = (lga: string | null) => {
    if (lga) {
      setSelectedLGA(lga);
    } else {
      setSelectedLGA(null);
    }
    setShowLGADropdown(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Backend logout failed');
    }
    
    localStorage.removeItem('auth-storage');
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.trim().split('=')[0];
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
    window.location.href = '/';
    setIsLoggingOut(false);
  };

  const handleRecentSearchClick = (term: string) => {
    setSearchQuery(term);
    setShowSearchDropdown(true);
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleNewNotification = useCallback((notification: any) => {
    console.log('New notification received:', notification);
    setRecentNotifications(prev => [notification, ...prev].slice(0, 10));
    setUnreadCount(prev => prev + 1);
    
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
  }, []);

  useSocket({
    userId: user?.id,
    onNotification: handleNewNotification,
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchRecentMessages();
    }
  }, [isAuthenticated]);

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
    
    switch (notif.type) {
      case 'ad_approved':
      case 'ad_rejected':
      case 'ad_deleted':
      case 'ad_published':
      case 'ad_pending':
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
      case 'new_review':
      case 'review_received':
        if (notif.data?.ad_id) {
          router.push(`/ad/${notif.data.ad_id}`);
        } else {
          router.push('/dashboard/reviews');
        }
        break;
      case 'new_favorite':
      case 'new_ad_followed':
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

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#4B5320] border-b border-gray-200 pb-2.5">
        <div className="container-app">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-[#4B5320] font-bold text-xl">i</span>
                </div>
                <span className="text-xl font-bold text-white hidden sm:block">iList</span>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="relative flex w-full items-center" ref={locationRef}>
                {/* Location Selector - Sleek Pill Design */}
                <button
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 bg-white/95 backdrop-blur-sm rounded-l-full border-r border-gray-200 transition-all duration-300 min-w-[130px] flex-shrink-0 z-20",
                    showLocationDropdown 
                      ? "rounded-b-full shadow-lg ring-2 ring-[#4B5320]/20" 
                      : "hover:bg-white hover:shadow-md"
                  )}
                >
                  <div className="w-7 h-7 bg-[#4B5320]/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-[#4B5320]" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm text-[#4B5320] font-medium truncate max-w-[100px]">
                      {selectedLGA ? selectedLGA : (selectedLocationState !== 'All Nigeria' ? selectedLocationState : 'All Nigeria')}
                    </span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-[#4B5320] transition-transform duration-300 ml-auto", showLocationDropdown && "rotate-180")} />
                </button>

                {/* Location Dropdown */}
                {showLocationDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white shadow-2xl border border-gray-100 z-[70] max-h-[350px] overflow-hidden animate-fade-in rounded-[15px]">
                    <div className="p-2.5 border-b border-gray-100 bg-gradient-to-r from-[#4B5320]/5 to-[#4B5320]/10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#4B5320] rounded-lg flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#4B5320]">Select Location</p>
                          <p className="text-[10px] text-gray-500">All 36 States + FCT</p>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-[280px] custom-scrollbar">
                      <button
                        onClick={() => handleLocationSelect(null)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 hover:bg-[#4B5320]/5 text-left transition-colors border-b border-gray-50",
                          selectedLocationState === 'All Nigeria' && "bg-[#4B5320]/10 border-l-4 border-l-[#4B5320]"
                        )}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-[#4B5320] to-[#6B7B30] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          🌍
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-sm text-gray-900">All Nigeria</span>
                          <p className="text-[10px] text-gray-500">Browse all locations</p>
                        </div>
                        {selectedLocationState === 'All Nigeria' && <div className="w-5 h-5 bg-[#4B5320] rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                      </button>
                      
                      {nigeriaLocations.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => handleLocationSelect(location)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#4B5320]/5 text-left transition-colors border-b border-gray-50 last:border-0",
                            selectedLocationState === location.name && "bg-[#4B5320]/10 border-l-4 border-l-[#4B5320]"
                          )}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-[#4B5320]/20 to-[#4B5320]/30 rounded-lg flex items-center justify-center text-[#4B5320] font-bold text-xs">
                            {location.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-sm text-gray-900">{location.name}</span>
                            <p className="text-xs text-gray-500">
                              {location.lgas ? `${location.lgas.length} LGAs` : 'All areas'}
                            </p>
                          </div>
                          {selectedLocationState === location.name && (
                            <div className="w-5 h-5 bg-[#4B5320] rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* LGA Dropdown */}
                {showLGADropdown && selectedLocationSlug && (
                  <div className="absolute top-full left-[130px] mt-2 w-72 bg-white rounded-[15px] shadow-2xl border border-gray-100 z-[80] max-h-[320px] overflow-hidden animate-fade-in">
                    <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-[#4B5320]/5 to-[#4B5320]/10">
                      <p className="text-xs font-bold text-[#4B5320] flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        Select LGA in {selectedLocationState}
                      </p>
                    </div>
                    <div className="overflow-y-auto max-h-[270px] custom-scrollbar">
                      <button
                        onClick={() => handleLGASelect(null)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#4B5320]/5 text-left border-b border-gray-50 last:border-0 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xs">🌍</span>
                        </div>
                        <span className="text-sm text-gray-700">All areas in {selectedLocationState}</span>
                      </button>
                      {nigeriaLocations.find(loc => loc.slug === selectedLocationSlug)?.lgas?.map((lga, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleLGASelect(lga)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 hover:bg-[#4B5320]/5 text-left border-b border-gray-50 last:border-0 transition-colors",
                            selectedLGA === lga && "bg-[#4B5320]/10 text-[#4B5320]"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                            selectedLGA === lga ? "bg-[#4B5320] text-white" : "bg-gray-100 text-gray-500"
                          )}>
                            {lga.charAt(0)}
                          </div>
                          <span className="text-sm">{lga}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Input - Modern Design */}
                <div className="relative flex-1" ref={searchRef}>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#4B5320] transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchDropdown(true);
                      }}
                      onFocus={() => setShowSearchDropdown(true)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search for cars, phones, properties..."
                      className="w-full pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm rounded-r-full border-0 focus:outline-none focus:ring-2 focus:ring-[#4B5320]/30 text-sm shadow-sm transition-all duration-300"
                    />
                    {isSearching && (
                      <div className="absolute inset-y-0 right-20 flex items-center">
                        <Loader2 className="w-5 h-5 text-[#4B5320] animate-spin" />
                      </div>
                    )}
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-20 flex items-center pr-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                  
                  {/* Search Dropdown - Enhanced */}
                  {showSearchDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                      <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                        {searchQuery.length >= 2 && searchResults ? (
                          <>
                            {searchResults.ads?.length > 0 && (
                              <div className="p-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-2 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-[#4B5320] rounded-full"></span>
                                  ADS
                                </p>
                                {searchResults.ads.slice(0, 5).map((ad: any) => (
                                  <button
                                    key={ad.id}
                                    onClick={() => handleSearchResultClick('ad', ad)}
                                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#4B5320]/5 rounded-xl transition-colors text-left"
                                  >
                                    {ad.thumbnail ? (
                                      <img src={ad.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{ad.title}</p>
                                      <p className="text-sm font-bold text-[#4B5320]">₦{ad.price?.toLocaleString()}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300" />
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            {searchResults.categories?.length > 0 && (
                              <div className="p-3 border-t border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-2 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-[#4B5320] rounded-full"></span>
                                  CATEGORIES
                                </p>
                                {searchResults.categories.slice(0, 5).map((cat: any) => (
                                  <button
                                    key={cat.id}
                                    onClick={() => handleSearchResultClick('category', cat)}
                                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#4B5320]/5 rounded-xl transition-colors text-left"
                                  >
                                    <span className="text-2xl">{cat.icon || '📦'}</span>
                                    <span className="text-sm text-gray-700 flex-1">{cat.name}</span>
                                    <ArrowRight className="w-4 h-4 text-gray-300" />
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            {!searchResults.ads?.length && !searchResults.categories?.length && (
                              <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Search className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
                              </div>
                            )}
                          </>
                        ) : searchQuery.length < 2 ? (
                          <div className="p-3">
                            {recentSearches.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-2 flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  Recent Searches
                                </p>
                                {recentSearches.map((term, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleRecentSearchClick(term)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#4B5320]/5 rounded-xl transition-colors text-left"
                                  >
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700 flex-1">{term}</span>
                                    <button
                                      onClick={(e) => removeRecentSearch(e, term)}
                                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      <X className="w-3 h-3 text-gray-400" />
                                    </button>
                                  </button>
                                ))}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-2 flex items-center gap-2">
                                <TrendingUp className="w-3 h-3" />
                                Trending
                              </p>
                              {['iPhone 15', 'Toyota Camry', 'Laptop', 'House for rent', 'Samsung Galaxy'].map((term) => (
                                <button
                                  key={term}
                                  onClick={() => {
                                    setSearchQuery(term);
                                    setShowSearchDropdown(true);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#4B5320]/5 rounded-xl transition-colors text-left"
                                >
                                  <TrendingUp className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-700">{term}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Button - Prominent CTA */}
                <button
                  onClick={handleSearch}
                  className="ml-2 px-6 py-3 bg-[#4B5320] hover:bg-[#3d4220] text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group flex-shrink-0 z-20"
                >
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="md:hidden px-4 py-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4B5320] text-sm"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-5 py-3 bg-[#4B5320] text-white rounded-full"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Desktop Auth */}
              <div className="hidden md:flex items-center gap-1">
                {isAuthenticated ? (
                  <>
                    {/* Notifications Bell */}
                    <div className="relative" ref={notificationRef}>
                      <button 
                        onClick={() => setNotificationOpen(!notificationOpen)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors relative"
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
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                          <User className="w-5 h-5 text-blue-600" />
                                        </div>
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
                    
                    <Link href="/dashboard/favorites" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                      <Heart className="w-5 h-5 text-white" />
                    </Link>
                    
                    {/* User Menu */}
                    <div className="relative ml-1" ref={userMenuRef}>
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-white flex items-center justify-center">
                          {user?.google_avatar || user?.avatar || user?.avatar_url ? (
                            <img 
                              src={user.google_avatar || user.avatar || user.avatar_url} 
                              alt={user.name || 'User'} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-[#4B5320] font-semibold text-sm">
                              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                      </button>
                      
                      {showUserMenu && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-dropdown border border-gray-100 py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                          <Link href="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-dark">My Account</span>
                          </Link>
                          <Link href="/dashboard/my-ads" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-dark">My Ads</span>
                          </Link>
                          <Link href="/dashboard/favorites" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                            <Heart className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-dark">Favorites</span>
                          </Link>
                          <Link href="/dashboard/messages" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                            <MessageCircle className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-dark">Messages</span>
                          </Link>
                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <LogOut className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-red-600">
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={toggleLoginModal}
                      className="px-4 py-2 text-white hover:text-gray-200 font-medium transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={toggleRegisterModal}
                      className="px-4 py-2 text-white hover:text-gray-200 font-medium transition-colors"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>

              {/* Sell Button */}
              <Link
                href={isAuthenticated ? "/post-ad" : "/post-ad"}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white text-[#4B5320] rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Sell</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[60] bg-white">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2" onClick={() => setShowMobileMenu(false)}>
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">i</span>
              </div>
              <span className="text-xl font-bold text-dark">iList</span>
            </Link>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-dark" />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for anything..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* Mobile Location Selector */}
            <div className="relative mt-3" ref={locationRef}>
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center gap-2 w-full px-4 py-3 bg-gray-100 rounded-xl transition-colors"
              >
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="flex-1 text-left text-gray-700">{selectedLocationState}</span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              
              {showLocationDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-dropdown border border-gray-100 z-50 max-h-[400px] overflow-hidden">
                  <div className="p-2 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-primary-100">
                    <p className="text-xs font-bold text-primary-700 px-2 py-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      All 36 States + FCT
                    </p>
                  </div>
                  <div className="overflow-y-auto max-h-[350px]">
                    <button
                      onClick={() => handleLocationSelect(null)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm">
                        🌍
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">All Nigeria</span>
                        <p className="text-xs text-gray-500">Browse all locations</p>
                      </div>
                    </button>
                    {nigeriaLocations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => handleLocationSelect(location)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
                      >
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm">
                          {location.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900">{location.name}</span>
                          <p className="text-xs text-gray-500">
                            {location.lgas ? `${location.lgas.length} LGAs` : 'All areas'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="p-2 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                      📍 All 36 Nigerian states + FCT (Abuja)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    toggleLoginModal();
                  }}
                  className="py-3 border-2 border-gray-200 rounded-xl font-semibold text-dark hover:border-gray-300 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    toggleRegisterModal();
                  }}
                  className="py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                    {user?.google_avatar || user?.avatar || user?.avatar_url ? (
                      <img 
                        src={user.google_avatar || user.avatar || user.avatar_url} 
                        alt={user.name || 'User'} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-primary-600 font-bold text-lg">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sell Button */}
            <Link
              href="/post-ad"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors mb-6"
            >
              <Plus className="w-5 h-5" />
              Post Your Ad
            </Link>

            {/* Navigation Links */}
            <nav className="space-y-1">
              <Link href="/" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-xl">🏠</span>
                <span className="font-medium">Home</span>
              </Link>
              <Link href="/ads" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-xl">📦</span>
                <span className="font-medium">All Categories</span>
              </Link>
              
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 my-3"></div>
                  <Link href="/dashboard" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <LayoutDashboard className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">My Account</span>
                  </Link>
                  <Link href="/dashboard/my-ads" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <Package className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">My Ads</span>
                  </Link>
                  <Link href="/dashboard/favorites" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <Heart className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Favorites</span>
                  </Link>
                  <Link href="/dashboard/messages" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <MessageCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Messages</span>
                  </Link>
                </>
              )}
              
              <div className="border-t border-gray-200 my-3"></div>
              
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
