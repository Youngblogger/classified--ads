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
  Star, ArrowRight, Grid3X3, HelpCircle, Globe,
  BellOff, ChevronRight, Smartphone, Laptop, Car,
  Home, Briefcase, Shirt, Sofa, TreePine, Gamepad2,
  BookOpen, Dog, Wrench, Building2, GraduationCap, Baby,
  CheckCircle, UserPlus, UserMinus, Dumbbell
} from 'lucide-react';
import { useAuthStore, useUIStore, useGlobalStore } from '@/lib/store';
import { api, notificationsApi, messagesApi } from '@/lib/api';
import { cn, BACKEND_URL } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

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

const categoryIconMap: Record<string, any> = {
  Car,
  Home,
  Smartphone,
  Laptop,
  Shirt,
  Sofa,
  Briefcase,
  Wrench,
  Dog,
  Heart,
  Baby,
  Dumbbell,
};

function getCategoryIcon(iconName?: string) {
  if (!iconName) return Car;
  return categoryIconMap[iconName] || Car;
}

const RECENT_SEARCHES_KEY = 'ilist_recent_searches';
const MAX_RECENT_SEARCHES = 5;

const ICON_MAP: Record<string, any> = {
  Car,
  Home,
  Smartphone,
  Laptop,
  Shirt,
  Sofa,
  Briefcase,
  Wrench,
  Dog,
  Heart,
  Baby,
  Dumbbell,
  TreePine,
  Gamepad2,
  BookOpen,
  Building2,
  GraduationCap,
};

function getIconComponent(iconName?: string): any {
  return ICON_MAP[iconName || 'Car'] || Car;
}

function getFullAvatarUrl(user: any): string | null {
  if (!user) return null;
  
  const avatar = user.full_avatar_url || user.avatar_url || user.avatar || user.google_avatar || user.facebook_avatar;
  if (!avatar) return null;
  
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  if (avatar.startsWith('/storage/')) {
    return `${BACKEND_URL}${avatar}`;
  }
  return `${BACKEND_URL}/storage/${avatar}`;
}

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
  const { isAuthenticated, user, logout, hasHydrated } = useAuthStore();
  const { toggleLoginModal, toggleRegisterModal } = useUIStore();
  const { selectedLocation } = useGlobalStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocationState, setSelectedLocationState] = useState<string>(selectedLocation?.name || 'All Nigeria');
  const [selectedLocationSlug, setSelectedLocationSlug] = useState<string | null>(null);
  const [selectedLGA, setSelectedLGA] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempSelectedState, setTempSelectedState] = useState<ApiLocation | null>(null);
  const [tempSelectedLGA, setTempSelectedLGA] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [apiLocations, setApiLocations] = useState<ApiLocation[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [megaMenuSearch, setMegaMenuSearch] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredMegaMenuCategories = megaMenuSearch.trim() === '' 
    ? apiCategories 
    : apiCategories.filter(cat => 
        cat.name.toLowerCase().includes(megaMenuSearch.toLowerCase()) ||
        cat.slug.toLowerCase().includes(megaMenuSearch.toLowerCase()) ||
        cat.children?.some(child => 
          child.name.toLowerCase().includes(megaMenuSearch.toLowerCase())
        )
      );

  interface MegaMenuSearchItem {
    type: 'category' | 'subcategory';
    categorySlug: string;
    categoryName: string;
    categoryIcon?: string;
    slug: string;
    name: string;
  }

  const megaMenuSearchResults: MegaMenuSearchItem[] = megaMenuSearch.trim() === '' 
    ? []
    : apiCategories.flatMap(cat => {
        const results: MegaMenuSearchItem[] = [];
        
        if (cat.name.toLowerCase().includes(megaMenuSearch.toLowerCase()) || 
            cat.slug.toLowerCase().includes(megaMenuSearch.toLowerCase())) {
          results.push({
            type: 'category',
            categorySlug: cat.slug,
            categoryName: cat.name,
            categoryIcon: cat.icon,
            slug: cat.slug,
            name: cat.name,
          });
        }
        
        cat.children?.forEach(child => {
          if (child.name.toLowerCase().includes(megaMenuSearch.toLowerCase()) ||
              child.slug.toLowerCase().includes(megaMenuSearch.toLowerCase())) {
            results.push({
              type: 'subcategory',
              categorySlug: cat.slug,
              categoryName: cat.name,
              categoryIcon: cat.icon,
              slug: child.slug,
              name: child.name,
            });
          }
        });
        
        return results;
      });
  
  const searchRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
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

  const isLoading = !hasHydrated || !isMounted;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node) && showLocationModal) {
        setShowLocationModal(false);
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
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setShowMegaMenu(false);
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

  const handleLocationSelect = (location: ApiLocation | null) => {
    if (location) {
      setTempSelectedState(location);
      setTempSelectedLGA(null);
    } else {
      setTempSelectedState(null);
      setTempSelectedLGA(null);
    }
  };

  const handleLGASelect = (lga: string | null) => {
    setTempSelectedLGA(lga);
  };

  const applyLocationSelection = () => {
    if (tempSelectedState) {
      setSelectedLocationState(tempSelectedLGA ? `${tempSelectedState.name}, ${tempSelectedLGA}` : tempSelectedState.name);
      setSelectedLocationSlug(tempSelectedState.slug);
      setSelectedLGA(tempSelectedLGA);
      
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }
      params.append('location', tempSelectedState.slug);
      if (tempSelectedLGA) {
        params.append('lga', tempSelectedLGA);
      }
      router.push(`/ads?${params.toString()}`);
    } else {
      setSelectedLocationState('All Nigeria');
      setSelectedLocationSlug(null);
      setSelectedLGA(null);
      router.push('/ads');
    }
    setShowLocationModal(false);
  };

  const openLocationModal = () => {
    if (selectedLocationSlug) {
      const currentState = apiLocations.find(l => l.slug === selectedLocationSlug);
      setTempSelectedState(currentState || null);
      setTempSelectedLGA(selectedLGA);
    } else {
      setTempSelectedState(null);
      setTempSelectedLGA(null);
    }
    setShowLocationModal(true);
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
    console.log('New notification received:', notification);
    setRecentNotifications(prev => [notification, ...prev].slice(0, 10));
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

  if (isLoading) {
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

  return (
    <header className="sticky top-0 z-50">
      {/* TOP BAR */}
      <div className="bg-slate-100 border-b border-slate-200">
        <div className="container-app">
          <div className="flex items-center justify-between h-10 text-sm">
            {/* Left - Location */}
            <div className="flex items-center gap-4">
              <button
                onClick={openLocationModal}
                className="flex items-center gap-1.5 text-slate-600 hover:text-primary-600 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">{selectedLocationState}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Right - Links */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-slate-600 hover:text-primary-600 transition-colors">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">English</span>
              </button>
              <Link href="/help" className="text-slate-600 hover:text-primary-600 transition-colors hidden md:block">
                Help
              </Link>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">|</span>
                  <Link href="/dashboard" className="text-slate-600 hover:text-primary-600 transition-colors">
                    {user?.name?.split(' ')[0]}
                  </Link>
                </div>
              ) : (
                <>
                  <span className="text-slate-400 hidden sm:block">|</span>
                  <button
                    onClick={toggleLoginModal}
                    className="text-slate-600 hover:text-primary-600 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={toggleRegisterModal}
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Location Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowLocationModal(false)}></div>
            <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Select Location</h3>
                  {tempSelectedState && (
                    <p className="text-sm text-slate-500">
                      {tempSelectedLGA ? `${tempSelectedState.name} > ${tempSelectedLGA}` : tempSelectedState.name}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="flex" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <div className="w-1/2 border-r border-slate-200 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => handleLocationSelect(null)}
                      className={cn(
                        "w-full p-3 rounded-xl text-left hover:bg-slate-50 transition-colors flex items-center justify-between",
                        !tempSelectedState && "bg-primary-50 border border-primary-200"
                      )}
                    >
                      <span className="font-medium text-slate-900">All Nigeria</span>
                      <ChevronRight className={cn("w-4 h-4 text-slate-400", tempSelectedState && "opacity-0")} />
                    </button>
                    {apiLocations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => handleLocationSelect(location)}
                        className={cn(
                          "w-full p-3 rounded-xl text-left hover:bg-slate-50 transition-colors flex items-center justify-between",
                          tempSelectedState?.id === location.id && "bg-primary-50 border border-primary-200"
                        )}
                      >
                        <div>
                          <span className="font-medium text-slate-900">{location.name}</span>
                          <span className="text-xs text-slate-500 ml-2">({location.children?.length || 0})</span>
                        </div>
                        <ChevronRight className={cn("w-4 h-4 text-slate-400", tempSelectedState?.id !== location.id && "opacity-0")} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="w-1/2 overflow-y-auto bg-white">
                  {tempSelectedState ? (
                    <div className="p-2">
                      <button
                        onClick={() => handleLGASelect(null)}
                        className={cn(
                          "w-full p-3 rounded-xl text-left hover:bg-slate-50 transition-colors",
                          !tempSelectedLGA && "bg-primary-50 border border-primary-200"
                        )}
                      >
                        <span className="text-slate-700">All areas in {tempSelectedState.name}</span>
                      </button>
                      {tempSelectedState.children?.map((lga) => (
                        <button
                          key={lga.slug}
                          onClick={() => handleLGASelect(lga.name)}
                          className={cn(
                            "w-full p-3 rounded-xl text-left hover:bg-slate-50 transition-colors",
                            tempSelectedLGA === lga.name && "bg-primary-50 border border-primary-200"
                          )}
                        >
                          <span className={cn(
                            "font-medium",
                            tempSelectedLGA === lga.name ? "text-primary-600" : "text-slate-700"
                          )}>
                            {lga.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 p-8 text-center">
                      <div>
                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Select a state to see LGAs</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
                <div className="text-sm text-slate-500">
                  {tempSelectedState ? (
                    <span>
                      Selected: <span className="font-medium text-slate-700">
                        {tempSelectedLGA ? `${tempSelectedState.name}, ${tempSelectedLGA}` : tempSelectedState.name}
                      </span>
                    </span>
                  ) : (
                    <span>All Nigeria</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowLocationModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyLocationSelection}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN HEADER */}
      <div className="bg-primary-600 shadow-header">
        <div className="container-app">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <img 
                src="/icons/iList-white.png" 
                alt="iList" 
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-2xl">
              <div className="relative flex w-full items-center" ref={searchRef}>
                <div className="relative group w-full">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
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
                    className="w-full pl-12 pr-24 py-3 bg-white rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm shadow-sm transition-all duration-300"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  {isSearching && (
                    <div className="absolute inset-y-0 right-24 flex items-center">
                      <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                    </div>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-24 flex items-center pr-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>
                
                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="ml-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group flex-shrink-0 z-20"
                >
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Search</span>
                </button>
                
                {/* Search Dropdown */}
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                      {searchQuery.length >= 2 && searchResults ? (
                        <>
                          {searchResults.ads?.length > 0 && (
                            <div className="p-3">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                                ADS
                              </p>
                              {searchResults.ads.slice(0, 5).map((ad: any) => (
                                <button
                                  key={ad.id}
                                  onClick={() => handleSearchResultClick('ad', ad)}
                                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-primary-50 rounded-xl transition-colors text-left"
                                >
                                  {ad.thumbnail ? (
                                    <img src={ad.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
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
                          
                          {searchResults.categories?.length > 0 && (
                            <div className="p-3 border-t border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-accent-600 rounded-full"></span>
                                CATEGORIES
                              </p>
                              {searchResults.categories.slice(0, 5).map((cat: any) => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleSearchResultClick('category', cat)}
                                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-accent-50 rounded-xl transition-colors text-left"
                                >
                                  <span className="text-2xl">{cat.icon || '📦'}</span>
                                  <span className="text-sm text-slate-700 flex-1">{cat.name}</span>
                                  <ArrowRight className="w-4 h-4 text-slate-300" />
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {searchResults.ads?.length > 0 || searchResults.categories?.length > 0 ? (
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

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-1">
                {isAuthenticated ? (
                  <>
                    {/* Notifications Bell */}
                    <div className="relative" ref={notificationRef}>
                      <button 
                        onClick={() => setNotificationOpen(!notificationOpen)}
                        className="p-2.5 hover:bg-primary-700 rounded-xl transition-colors relative"
                      >
                        <Bell className="w-5 h-5 text-white" />
                        {(unreadCount + unreadMessagesCount) > 0 && (
                          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {(unreadCount + unreadMessagesCount) > 9 ? '9+' : (unreadCount + unreadMessagesCount)}
                          </span>
                        )}
                      </button>

                      {notificationOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-slate-100 animate-fade-in z-50">
                          <div className="flex border-b border-slate-100">
                            <button
                              onClick={() => setActiveTab('notifications')}
                              className={cn(
                                "flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                                activeTab === 'notifications' 
                                  ? 'text-primary-600 border-b-2 border-primary-600' 
                                  : 'text-slate-500 hover:text-slate-700'
                              )}
                            >
                              <Bell className="w-4 h-4" />
                              Notifications
                              {unreadCount > 0 && (
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                            </button>
                            <button
                              onClick={() => setActiveTab('messages')}
                              className={cn(
                                "flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                                activeTab === 'messages' 
                                  ? 'text-primary-600 border-b-2 border-primary-600' 
                                  : 'text-slate-500 hover:text-slate-700'
                              )}
                            >
                              <MessageCircle className="w-4 h-4" />
                              Messages
                              {unreadMessagesCount > 0 && (
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                            </button>
                          </div>

                          <div className="max-h-80 overflow-y-auto">
                            {activeTab === 'notifications' && (
                              <>
                                {recentNotifications.length === 0 ? (
                                  <div className="px-4 py-8 text-center text-slate-500">
                                    <BellOff className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    No notifications
                                  </div>
                                ) : (
                                  <>
                                    <div className="px-4 py-2 border-b border-slate-50 text-right">
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
                                    })}
                                  </>
                                )}
                              </>
                            )}

                            {activeTab === 'messages' && (
                              <>
                                {recentMessages.length === 0 ? (
                                  <div className="px-4 py-8 text-center text-slate-500">
                                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    No messages
                                  </div>
                                ) : (
                                  recentMessages.map((conversation: any) => (
                                    <div 
                                      key={conversation.id}
                                      onClick={() => handleMessageClick(conversation)}
                                      className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer transition-colors"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                          <User className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-slate-900">
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
                                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                                            {conversation.last_message?.content || conversation.last_message?.substring(0, 50) || 'No messages yet'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </>
                            )}
                          </div>

                          <div className="px-4 py-3 border-t border-slate-100">
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
                    
                    <Link href="/dashboard/favorites" className="p-2.5 hover:bg-primary-700 rounded-xl transition-colors">
                      <Heart className="w-5 h-5 text-white" />
                    </Link>
                    
                    {/* User Menu */}
                    <div className="relative ml-1" ref={userMenuRef}>
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-1.5 hover:bg-primary-700 rounded-xl transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-white flex items-center justify-center">
                          {(() => {
                            const avatarUrl = getFullAvatarUrl(user);
                            return avatarUrl ? (
                              <img 
                                src={avatarUrl} 
                                alt={user?.name || 'User'} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
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
                      
                      {showUserMenu && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-dropdown border border-slate-100 py-2 z-50">
                          <div className="px-4 py-3 border-b border-slate-100">
                            <p className="font-semibold text-slate-900 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                          </div>
                          <Link href="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-700">My Account</span>
                          </Link>
                          <Link href="/dashboard/my-ads" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                            <Package className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-700">My Ads</span>
                          </Link>
                          <Link href="/dashboard/favorites" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                            <Heart className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-700">Favorites</span>
                          </Link>
                          <Link href="/dashboard/messages" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                            <MessageCircle className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-700">Messages</span>
                          </Link>
                          <div className="border-t border-slate-100 mt-2 pt-2">
                            <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors w-full text-left"
                            >
                              <LogOut className="w-4 h-4 text-slate-500" />
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
                      className="px-4 py-2 text-white hover:text-primary-100 font-medium transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={toggleRegisterModal}
                      className="px-4 py-2 text-white hover:text-primary-100 font-medium transition-colors"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>

              {/* Post Ad Button */}
              <Link
                href="/post-ad"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Post Ad</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2.5 hover:bg-primary-700 rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY NAVIGATION BAR */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-app">
          <div className="flex items-center gap-2 py-3">
            {/* All Categories Button */}
            <div className="relative" ref={megaMenuRef}>
              <button
                onClick={() => setShowMegaMenu(!showMegaMenu)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200",
                  showMegaMenu 
                    ? "bg-accent-600 text-white shadow-md" 
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>All Categories</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", showMegaMenu && "rotate-180")} />
              </button>

              {/* Mega Menu */}
              {showMegaMenu && (
                <div className="absolute top-full left-0 mt-2 w-[800px] max-h-[70vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-fade-in">
                  <div className="p-4 border-b border-slate-100 sticky top-0 bg-white">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={megaMenuSearch}
                        onChange={(e) => setMegaMenuSearch(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm text-slate-900 placeholder-slate-400 transition-all"
                      />
                      {megaMenuSearch && (
                        <button
                          onClick={() => setMegaMenuSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full"
                        >
                          <X className="w-3 h-3 text-slate-400" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 p-4">
                    {megaMenuSearch ? (
                      megaMenuSearchResults.length > 0 ? (
                        <>
                          {megaMenuSearchResults.map((item) => {
                            const IconComponent = getIconComponent(item.categoryIcon);
                            return (
                              <Link
                                key={`${item.type}-${item.slug}`}
                                href={item.type === 'category' 
                                  ? `/ads?category=${item.slug}` 
                                  : `/ads?category=${item.categorySlug}&sub=${item.slug}`
                                }
                                onClick={() => { setShowMegaMenu(false); setMegaMenuSearch(''); }}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                              >
                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                  <IconComponent className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="font-semibold text-slate-900 block truncate">{item.name}</span>
                                  <span className="text-xs text-slate-500">
                                    {item.type === 'category' ? 'Category' : `in ${item.categoryName}`}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </>
                      ) : (
                        <div className="col-span-4 text-center py-8 text-slate-500">
                          No results found for "{megaMenuSearch}"
                        </div>
                      )
                    ) : (
                      apiCategories.map((category) => {
                        const IconComponent = getIconComponent(category.icon);
                        return (
                          <div key={category.slug} className="space-y-2">
                            <Link
                              href={`/ads?category=${category.slug}`}
                              onClick={() => setShowMegaMenu(false)}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                            >
                              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                <IconComponent className="w-5 h-5 text-primary-600" />
                              </div>
                              <span className="font-semibold text-slate-900">{category.name}</span>
                            </Link>
                            <div className="pl-12 space-y-1">
                              {category.children?.slice(0, 4).map((item) => (
                                <Link
                                  key={item.slug}
                                  href={`/ads?category=${category.slug}&sub=${item.slug}`}
                                  onClick={() => setShowMegaMenu(false)}
                                  className="block py-1 text-sm text-slate-600 hover:text-primary-600 transition-colors"
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="px-4 py-3 bg-slate-50 rounded-b-2xl border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">Trending:</span>
                      {['iPhone 15', 'Toyota Camry', 'MacBook Pro', 'Duplex'].map((term) => (
                        <Link
                          key={term}
                          href={`/ads?q=${encodeURIComponent(term)}`}
                          onClick={() => setShowMegaMenu(false)}
                          className="px-2.5 py-1 bg-white rounded-full text-xs text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors border border-slate-200"
                        >
                          {term}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
              {apiCategories.map((category) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <Link
                    key={category.slug}
                    href={`/ads?category=${category.slug}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden md:inline">{category.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 p-4">
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for cars, phones, properties..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              autoFocus
            />
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* MOBILE MENU */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[60] bg-white overflow-y-auto lg:hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 bg-primary-600">
            <Link href="/" className="flex items-center gap-2" onClick={() => setShowMobileMenu(false)}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className="text-primary-600 font-bold text-2xl">i</span>
              </div>
              <span className="text-xl font-bold text-white">iList</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="p-2.5 hover:bg-primary-700 rounded-xl transition-colors"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2.5 hover:bg-primary-700 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="p-4 bg-slate-50">
            <div className="relative flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for anything..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Mobile Categories */}
          <div className="p-4 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Categories</p>
            <div className="grid grid-cols-3 gap-2">
              {apiCategories.slice(0, 9).map((category) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <Link
                    key={category.slug}
                    href={`/ads?category=${category.slug}`}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-primary-50 transition-colors"
                  >
                    <IconComponent className="w-6 h-6 text-slate-600" />
                    <span className="text-xs font-medium text-slate-700 text-center">{category.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Menu</p>
            <div className="space-y-1">
              <Link href="/" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                <Home className="w-5 h-5 text-slate-500" />
                <span className="font-medium text-slate-700">Home</span>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <LayoutDashboard className="w-5 h-5 text-slate-500" />
                    <span className="font-medium text-slate-700">My Account</span>
                  </Link>
                  <Link href="/dashboard/my-ads" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <Package className="w-5 h-5 text-slate-500" />
                    <span className="font-medium text-slate-700">My Ads</span>
                  </Link>
                  <Link href="/dashboard/favorites" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <Heart className="w-5 h-5 text-slate-500" />
                    <span className="font-medium text-slate-700">Favorites</span>
                  </Link>
                  <Link href="/dashboard/messages" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <MessageCircle className="w-5 h-5 text-slate-500" />
                    <span className="font-medium text-slate-700">Messages</span>
                  </Link>
                  <Link href="/help" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <HelpCircle className="w-5 h-5 text-slate-500" />
                    <span className="font-medium text-slate-700">Help & Support</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-600">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      toggleLoginModal();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors w-full"
                  >
                    <User className="w-5 h-5 text-slate-500" />
                    <span className="font-medium text-slate-700">Login</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      toggleRegisterModal();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors w-full"
                  >
                    <User className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-primary-600">Create Account</span>
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Post Ad CTA */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
            <Link
              href="/post-ad"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Post Your Ad</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
