'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, MapPin, Menu, X, ChevronDown, User, 
  Plus, Heart, MessageSquare, Settings, LogOut,
  LayoutDashboard, Package, Clock, Loader2, Check,
  Bell, CreditCard, TrendingUp, Shield, AlertTriangle,
  ThumbsUp, ThumbsDown, Megaphone, Ban, FileText,
  Star, ArrowRight, Grid3X3, HelpCircle, Globe,
  BellOff, ChevronRight, Smartphone, Laptop, Car,
  Home, Briefcase, Shirt, Sofa, TreePine, Gamepad2,
  BookOpen, Dog, Wrench, Building2, GraduationCap, Baby,
  CheckCircle, UserPlus, UserMinus, Dumbbell
} from 'lucide-react';
import { useAuthStore, useUIStore, useGlobalStore } from '@/lib/store';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { api, notificationsApi, messagesApi } from '@/lib/api';
import { cn, BACKEND_URL } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { safeArray, normalizeNotificationArray, safeSlice } from '@/lib/safe-data';

import Image from 'next/image';
import toast from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiLocation {
  id: number;
  name: string;
  slug: string;
  children?: { name: string; slug: string }[];
}

interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  children?: ApiCategory[];
}

const RECENT_SEARCHES_KEY = 'ilist_recent_searches';
const MAX_RECENT_SEARCHES = 5;

function getFullAvatarUrl(user: any): string | null {
  if (!user) return null;
  
  const raw = user.full_avatar_url || user.avatar_url || user.avatar || user.google_avatar || user.facebook_avatar;
  if (!raw) return null;
  
  const avatar = raw.trim();
  
  if (/^https?:\/\//i.test(avatar)) {
    return avatar;
  }
  if (avatar.startsWith('/storage/')) {
    return `${BACKEND_URL}${avatar}`;
  }
  return `${BACKEND_URL}/storage/${avatar}`;
}

function truncateEmail(email: string | null | undefined, maxLength: number = 25): string {
  if (!email) return '';
  if (email.length <= maxLength) return email;
  
  const [localPart, domain] = email.split('@');
  if (!domain) return email.slice(0, maxLength);
  
  // Get first part of local + first few chars of domain
  const truncatedLocal = localPart.slice(0, 8);
  const truncatedDomain = domain.slice(0, 8);
  
  return `${truncatedLocal}...@${truncatedDomain}...`;
}

const NOTIFICATION_ICONS: Record<string, any> = {
  ad_approved: ThumbsUp,
  ad_rejected: ThumbsDown,
  ad_deleted: AlertTriangle,
  ad_published: CheckCircle,
  ad_pending: Clock,
  new_message: MessageSquare,
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
  ad_approved: 'bg-emerald-100 text-emerald-600',
  ad_rejected: 'bg-red-100 text-red-600',
  ad_deleted: 'bg-red-100 text-red-600',
  ad_published: 'bg-emerald-100 text-emerald-600',
  ad_pending: 'bg-amber-100 text-amber-600',
  new_message: 'bg-blue-100 text-blue-600',
  new_ad_followed: 'bg-violet-100 text-violet-600',
  payment_received: 'bg-emerald-100 text-emerald-600',
  payment_approved: 'bg-emerald-100 text-emerald-600',
  payment_rejected: 'bg-red-100 text-red-600',
  promotion_activated: 'bg-purple-100 text-purple-600',
  promotion_expired: 'bg-slate-100 text-slate-600',
  account_verified: 'bg-emerald-100 text-emerald-600',
  account_suspended: 'bg-amber-100 text-amber-600',
  account_banned: 'bg-red-100 text-red-600',
  account_unsuspended: 'bg-emerald-100 text-emerald-600',
  new_review: 'bg-amber-100 text-amber-600',
  review_received: 'bg-amber-100 text-amber-600',
  report_received: 'bg-blue-100 text-blue-600',
  report_actioned: 'bg-blue-100 text-blue-600',
  admin_broadcast: 'bg-purple-100 text-purple-600',
  new_favorite: 'bg-red-100 text-red-600',
  system_notice: 'bg-slate-100 text-slate-600',
};

function formatNotificationTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 2) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Header({ variant = 'home', onMenuToggle }: { variant?: 'home' | 'dashboard'; onMenuToggle?: () => void }) {
  const router = useRouter();
  const { user, logout, hasHydrated, isAuthenticated } = useAuthStore();
  const { toggleLoginModal, toggleRegisterModal, toggleLocationModal } = useUIStore();
  const { selectedLocation, setSelectedLocation } = useGlobalStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocationState, setSelectedLocationState] = useState<string>('All Nigeria');
  const [selectedLocationSlug, setSelectedLocationSlug] = useState<string | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<string | null>(null);

  // Sync with global store on mount and when it changes
  useEffect(() => {
    if (selectedLocation) {
      // Display as "State, LGA" format
      const stateName = selectedLocation.name || '';
      const lgaName = selectedLocation.lga || '';
      setSelectedLocationState(lgaName ? `${stateName}, ${lgaName}` : stateName);
      setSelectedLocationSlug(selectedLocation.slug);
      setSelectedLGA(selectedLocation.lga || null);
    } else {
      setSelectedLocationState('All Nigeria');
      setSelectedLocationSlug(null);
      setSelectedLGA(null);
    }
  }, [selectedLocation]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [mobileNotificationsOpen, setMobileNotificationsOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const mobileChatRef = useRef<HTMLDivElement>(null);
  const mobileNotificationsRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [apiLocations, setApiLocations] = useState<ApiLocation[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);
  const [placeholderKey, setPlaceholderKey] = useState(0);
  const placeholderWords = [
    'Cars',
    'Mobile Phones',
    'Properties',
    'Laptops',
    'Furniture',
    'Vehicles',
    'Sports',
    'Health & Beauty',
    'Tech Skills',
    'Educational',
    'Baby & Kids',
    'Jobs',
    'Fashion',
    'Electronics',
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholderWords.length);
        setPlaceholderKey(prev => prev + 1);
        setIsPlaceholderVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholderWords.length]);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, locationsRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/locations`),
        ]);
        
        const categoriesData = await categoriesRes.json();
        const locationsData = await locationsRes.json();
        
        if (categoriesData.data) {
          setApiCategories(categoriesData.data);
        }
        if (locationsData.data) {
          setApiLocations(locationsData.data);
        }
      } catch (error) {
        console.error('Error fetching categories/locations:', error);
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, []);

  const { authState } = useAuthContext();
  const isLoading = authState === 'loading' || !hasHydrated || !isMounted;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
        setChatOpen(false);
      }
      if (mobileChatRef.current && !mobileChatRef.current.contains(e.target as Node)) {
        setMobileChatOpen(false);
      }
      if (mobileNotificationsRef.current && !mobileNotificationsRef.current.contains(e.target as Node)) {
        setMobileNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
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
      const respData = response.data;
      const adsList = respData?.data || respData?.results || [];
      setSearchResults({
        ads: adsList.map((ad: any) => ({
          id: ad.id,
          title: ad.title,
          slug: ad.slug,
          price: ad.price,
          currency: ad.currency || 'NGN',
          thumbnail: ad.thumbnail_url || ad.image_url,
          location: ad.location?.name || ad.state || '',
        })),
        categories: [],
        locations: [],
        trending: respData?.trending || [],
        typo_correction: respData?.typo_correction || null,
      });
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

  const openLocationModal = () => {
    toggleLocationModal();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
    }
    
    await supabase.auth.signOut();
    
    logout();
    
    if (typeof window !== 'undefined') {
      ['token', 'admin_token'].forEach((name) => {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      sessionStorage.clear();
    }
    
    setProfileMenuOpen(false);
    setIsLoggingOut(false);
    router.push('/');
  };

  const handleRecentSearchClick = (term: string) => {
    setSearchQuery(term);
    saveRecentSearch(term);
    setShowSearchDropdown(false);
    router.push(`/ads?q=${encodeURIComponent(term)}`);
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleNewNotification = useCallback((notification: any) => {
    setRecentNotifications(prev => {
      const safe = Array.isArray(prev) ? prev : [];
      return [notification, ...safe].slice(0, 10);
    });
    setUnreadCount(prev => prev + 1);
    
    const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;
    toast.custom(
      (t) => (
        <div
          className={`bg-white shadow-lg rounded-xl border border-slate-100 p-4 flex items-start gap-3 max-w-sm ${
            t.visible ? 'animate-enter' : 'animate-leave'
          }`}
        >
          <div className={`w-10 h-10 rounded-full ${NOTIFICATION_COLORS[notification.type] || 'bg-slate-100 text-slate-600'} flex items-center justify-center flex-shrink-0`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">{notification.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.message}</p>
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

  const hasValidToken = useCallback(() => {
    if (typeof window === 'undefined') return false;
    let token: string | null = null;
    const stored = localStorage.getItem('user-auth-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        token = parsed?.state?.token || null;
      } catch {}
    }
    if (!token) {
      const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
      token = match ? match[1] : null;
    }
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) return false;
    } catch {}
    return true;
  }, []);

  useEffect(() => {
    if (authState === 'authenticated' && hasValidToken()) {
      fetchNotifications();
      fetchRecentMessages();
    }
  }, [authState, hasValidToken]);

  const fetchNotifications = async () => {
    try {
      const [countRes, unreadRes] = await Promise.all([
        api.get('/notifications/unread-count'),
        api.get('/notifications/unread'),
      ]);
      setUnreadCount(countRes?.data?.count || 0);
      const normalized = normalizeNotificationArray(unreadRes?.data);
      setRecentNotifications(normalized);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setRecentNotifications([]);
    }
  };

  const fetchRecentMessages = async () => {
    try {
      const res = await messagesApi.getConversations();
      const conversations = safeArray((res as any)?.data?.data ?? (res as any)?.data ?? []);
      setRecentMessages(safeSlice(conversations, 0, 5));
      const unreadCount = conversations.filter((c: any) => c.unread_count > 0).length;
      setUnreadMessagesCount(unreadCount);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setRecentNotifications(prev => {
        const safe = Array.isArray(prev) ? prev : [];
        return safe.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n);
      });
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setRecentNotifications(prev => {
        const safe = Array.isArray(prev) ? prev : [];
        return safe.map(n => ({ ...n, read_at: new Date().toISOString() }));
      });
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

  if (isLoading) {
    return (
      <header className="sticky top-0 z-[100] w-full bg-primary-600">
        <div className="container-app">
          <div className="h-12 flex items-center justify-between">
            <div className="h-8 w-24 bg-white/20 rounded animate-pulse" />
            <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] w-full bg-primary-600">
      {/* TOP BAR */}
      {variant === 'home' && (
        <div className="bg-primary-600">
          <div className="container-app">
            <div className="flex items-center justify-between h-10 text-sm">
              {/* Left - Location */}
              <div className="flex items-center gap-4">
                <button
                  onClick={openLocationModal}
                  className="flex items-center gap-1.5 text-white hover:text-primary-100 transition-colors"
                >
                  📍
                  <span className="hidden sm:inline capitalize">{selectedLocationState.toLowerCase()}</span>
                </button>
              </div>

              {/* Right - Links */}
              <div className="flex items-center gap-4">
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN HEADER */}
      <div className={cn('bg-primary-600 shadow-header', variant === 'home' ? 'h-14' : 'h-12')}>
        <div className="container-app">
          <div className={cn('flex items-center justify-between gap-4', variant === 'home' ? 'h-14' : 'h-12')}>
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image 
                src="/icons/iList-white.png" 
                alt="iList" 
                width={120} 
                height={40} 
                className="h-10 w-auto" 
                priority
              />
            </Link>

            {/* Desktop Search Bar */}
            {variant === 'home' && (
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="relative flex w-full items-center" ref={searchRef}>
                <div className="relative group w-full">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchDropdown(true);
                      }}
                      onFocus={() => setShowSearchDropdown(true)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-14 py-2.5 md:py-3 bg-white rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-400 text-[15px] shadow-sm transition-all duration-300"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                    {!searchQuery && (
                      <span 
                        className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none"
                      >
                        Search{' '}
                        {isMounted ? (
                          <span 
                            key={placeholderKey}
                            className={`inline-block transition-opacity duration-300 ${
                              isPlaceholderVisible ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            {placeholderWords[placeholderIndex]}
                          </span>
                        ) : null}
                      </span>
                    )}
                  </div>
                  {isSearching && (
                    <div className="absolute inset-y-0 right-28 flex items-center">
                      <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                    </div>
                  )}
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      type="button"
                      className="absolute inset-y-0 right-28 flex items-center pr-2 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSearch}
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center pr-1 rounded-full transition-colors"
                    >
                      <Search className="w-5 h-5 text-slate-400" />
                    </button>
                  )}
                </div>
                
                {/* Search Dropdown */}
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[9999] overflow-hidden animate-fade-in">
                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                      {searchQuery.length >= 2 && searchResults ? (
                        <>
                              {safeArray(searchResults?.ads).length > 0 && (
                            <div className="p-3">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-accent-600 rounded-full"></span>
                                ADS
                              </p>
                              {safeSlice(safeArray(searchResults?.ads), 0, 5).map((ad: any) => (
                                <button
                                  key={ad.id}
                                  onClick={() => handleSearchResultClick('ad', ad)}
                                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-primary-50 rounded-xl transition-colors text-left"
                                >
                                  {ad.thumbnail ? (
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                                      <Image src={ad.thumbnail} alt="" fill sizes="48px" className="object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                                      <Package className="w-6 h-6 text-slate-400" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{ad.title}</p>
                                    <p className="text-sm font-bold text-primary-600">₦{ad.price?.toLocaleString()}</p>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-slate-300" />
                                </button>
                              ))}
                            </div>
                          )}
                          
                              {safeArray(searchResults?.categories).length > 0 && (
                            <div className="p-3 border-t border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-accent-600 rounded-full"></span>
                                CATEGORIES
                              </p>
                              {safeSlice(safeArray(searchResults?.categories), 0, 5).map((cat: any) => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleSearchResultClick('category', cat)}
                                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-accent-50 rounded-xl transition-colors text-left"
                                >
                                  {(() => { const Icon = getCategoryIcon(cat.icon); return <Icon className="w-5 h-5 text-primary-600" />; })()}
                                  <span className="text-sm text-slate-700 flex-1">{cat.name}</span>
                                  <ArrowRight className="w-4 h-4 text-slate-300" />
                                </button>
                              ))}
                            </div>
                          )}
                          
                           {safeArray(searchResults?.ads).length > 0 || safeArray(searchResults?.categories).length > 0 ? (
                            <div className="border-t border-slate-100 p-2">
                              <button
                                onClick={() => {
                                  saveRecentSearch(searchQuery.trim());
                                  setShowSearchDropdown(false);
                                  router.push(`/ads?q=${encodeURIComponent(searchQuery)}`);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                              >
                                View all results for &quot;{searchQuery}&quot;
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="p-8 text-center">
                              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Search className="w-8 h-8 text-slate-300" />
                              </div>
                              <p className="text-sm text-slate-500">No results found for &quot;{searchQuery}&quot;</p>
                              <button
                                onClick={() => {
                                  saveRecentSearch(searchQuery.trim());
                                  setShowSearchDropdown(false);
                                  router.push(`/ads?q=${encodeURIComponent(searchQuery)}`);
                                }}
                                className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                              >
                                View all ads
                              </button>
                            </div>
                          )}
                        </>
                      ) : searchQuery.length < 2 ? (
                        <div className="p-3">
                          {recentSearches.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-2 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                Recent Searches
                              </p>
                              {recentSearches.map((term, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleRecentSearchClick(term)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
                                >
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-700 flex-1">{term}</span>
                                  <button
                                    onClick={(e) => removeRecentSearch(e, term)}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                  >
                                    <X className="w-3 h-3 text-slate-400" />
                                  </button>
                                </button>
                              ))}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-2 flex items-center gap-2">
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
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
                              >
                                <TrendingUp className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-700">{term}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile hamburger for dashboard */}
              {variant === 'dashboard' && (
                <button
                  onClick={() => onMenuToggle?.()}
                  className="lg:hidden p-2 rounded-xl text-white"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-1">
                {(authState === 'authenticated' || isAuthenticated) ? (
                  <>
                    {/* Notifications Bell with Tabs */}
                    {variant === 'home' && (
                    <div className="relative" ref={notificationRef}>
                      <button 
                        onClick={() => setNotificationOpen(!notificationOpen)}
                        className="p-2.5 rounded-xl relative"
                      >
                        <Bell className="w-5 h-5 text-white" />
                        {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>

                      {notificationOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-slate-100 animate-fade-in z-[9999]">
                          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                              <button 
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Mark all read
                              </button>
                            )}
                          </div>

                          <div className="max-h-80 overflow-y-auto">
                            {!Array.isArray(recentNotifications) || recentNotifications.length === 0 ? (
                              <div className="px-4 py-8 text-center text-slate-500">
                                <BellOff className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                No notifications
                              </div>
                            ) : (
                              safeSlice(recentNotifications, 0, 5).map((notif: any) => {
                                const IconComponent = NOTIFICATION_ICONS[notif.type] || Bell;
                                const iconColor = NOTIFICATION_COLORS[notif.type] || 'bg-slate-100 text-slate-600';
                                return (
                                  <div 
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={cn(
                                      "px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer transition-colors",
                                      !notif.read_at && "bg-primary-50/50"
                                    )}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", iconColor)}>
                                        <IconComponent className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                        {notif.created_at && (
                                          <p className="text-xs text-slate-400 mt-1">
                                            {formatNotificationTime(notif.created_at)}
                                          </p>
                                        )}
                                      </div>
                                      {!notif.read_at && (
                                        <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          <div className="px-4 py-3 border-t border-slate-100">
                            <Link 
                              href="/dashboard/notifications"
                              className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                              onClick={() => setNotificationOpen(false)}
                            >
                              View all notifications
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                    )}
                    
                    {variant === 'home' && (
                    <div className="relative" ref={chatRef}>
                      <button
                        onClick={() => setChatOpen(!chatOpen)}
                        className="p-2.5 rounded-xl relative"
                      >
                        <MessageSquare className="w-5 h-5 text-white" />
                        {unreadMessagesCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                            {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                          </span>
                        )}
                      </button>

                      {chatOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-slate-100 animate-fade-in z-[9999]">
                          <div className="px-4 py-3 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-slate-900">Messages</h3>
                              <Link
                                href="/dashboard/messages"
                                onClick={() => setChatOpen(false)}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                              >
                                View all
                              </Link>
                            </div>
                          </div>

                          <div className="max-h-80 overflow-y-auto">
                            {recentMessages.length === 0 ? (
                              <div className="px-4 py-8 text-center text-slate-500">
                                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="text-sm">No messages yet</p>
                                <p className="text-xs text-slate-400 mt-1">When buyers message you, they will appear here</p>
                              </div>
                            ) : (
                              safeSlice(recentMessages, 0, 5).map((conversation: any) => (
                                <div
                                  key={conversation.id}
                                  onClick={() => {
                                    setChatOpen(false);
                                    router.push(`/dashboard/messages?conversation=${conversation.id}`);
                                  }}
                                  className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                      <User className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                          {conversation.sender?.name || conversation.receiver?.name || 'User'}
                                        </p>
                                        {conversation.unread_count > 0 && (
                                          <span className="bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded-full ml-2">
                                            {conversation.unread_count}
                                          </span>
                                        )}
                                      </div>
                                      {conversation.ad && (
                                        <p className="text-xs text-primary-600 truncate">
                                          Re: {conversation.ad.title}
                                        </p>
                                      )}
                                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                                        {conversation.last_message?.content || conversation.last_message?.substring(0, 50) || 'No messages yet'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {recentMessages.length > 0 && (
                            <div className="px-4 py-3 border-t border-slate-100">
                              <Link
                                href="/dashboard/messages"
                                onClick={() => setChatOpen(false)}
                                className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                              >
                                View all messages
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    )}
                    
                    {/* User Menu */}
                    <div className="relative ml-1" ref={profileRef}>
                      <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white flex items-center justify-center">
                          {(() => {
                            const avatarUrl = getFullAvatarUrl(user);
                            return avatarUrl ? (
                              <Image 
                                src={avatarUrl} 
                                alt={user?.name || 'User'} 
                                fill
                                sizes="36px"
                                className="object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-primary-600 font-semibold text-sm">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            );
                          })()}
                        </div>
                      </button>

                      {profileMenuOpen && (
                        <div
                          className="absolute right-0 mt-2 w-52 py-1.5 bg-white dark:bg-gray-800 rounded-[7px] shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700 z-[9999] overflow-hidden animate-fade-in"
                          style={{ animation: 'fadeSlideIn 0.15s ease-out' }}
                        >
                          <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-6px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
                          <Link
                            href="/dashboard"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/my-ads"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                          >
                            <Package className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            My Ads
                          </Link>
                          <Link
                            href="/dashboard/wallet"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                          >
                            <CreditCard className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            Wallet
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            Settings
                          </Link>
                          <div className="mx-3 my-1 border-t border-gray-100 dark:border-gray-700" />
                          <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={toggleLoginModal}
                      className="md:px-3 lg:px-4 md:py-2 lg:py-2 text-white hover:text-primary-100 font-medium transition-colors text-sm"
                    >
                      Login
                    </button>
                    <button
                      onClick={toggleRegisterModal}
                      className="md:px-3 lg:px-4 md:py-2 lg:py-2 text-white hover:text-primary-100 font-medium transition-colors text-sm"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>

              {/* Post Ad Button */}
              {variant === 'home' && (
              <Link
                href="/post-ad"
                className="hidden md:flex items-center px-4 py-2 ml-1 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-700 hover:to-accent-600 text-white rounded-lg font-semibold text-sm transition-all duration-200 border-2 border-accent-400/50"
              >
                SELL
              </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      </header>
  );
}
