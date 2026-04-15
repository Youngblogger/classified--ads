'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, MapPin, ChevronDown, X, Bell, MessageCircle,
  Heart, LogOut, LayoutDashboard, Package, Clock,
  CreditCard, TrendingUp, Shield, AlertTriangle, ThumbsUp, 
  ThumbsDown, Megaphone, Star, Loader2, Check, BellOff,
  Settings, User, CheckCircle
} from 'lucide-react';
import { useAuthStore, useUIStore, useGlobalStore } from '@/lib/store';
import { api, notificationsApi, messagesApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';
import CategoryModal from '@/components/ui/CategoryModal';

const iconEmojis: Record<string, string> = {
  'smartphone': '📱', 'phone': '📱', 'mobile': '📱',
  'telecommunications': '📱', 'phones-tablets': '📱', 'mobile-phones-tablets': '📱',
  'car': '🚗', 'vehicle': '🚗', 'vehicles': '🚗', 'automotive': '🚗', 'cars-vehicles': '🚗',
  'property': '🏠', 'home': '🏠', 'real-estate': '🏠', 'properties': '🏠',
  'electronics': '💻', 'laptop': '💻', 'computer': '💻', 'computers-laptops': '💻',
  'fashion': '👕', 'clothing': '👕', 'apparel': '👕', 'fashion-style': '👕',
  'services': '🛠️', 'service': '🛠️', 'consulting-professional': '🛠️', 'jobs': '💼',
  'furniture': '🛋️', 'home-furniture': '🛋️', 'home-furniture-appliances': '🛋️',
  'repair': '🔧', 'repairs': '🔧', 'tools': '🔧', 'tools-equipment': '🔧', 'repair-services': '🔧',
  'beauty': '💄', 'health': '❤️', 'wellness-spa': '💆', 'hair-beauty': '💇',
  'baby': '👶', 'babies-kids': '👶', 'kids': '👶',
  'sports': '🏋️', 'fitness': '🏋️', 'sports-fitness': '🏋️',
  'books': '📚', 'books-media': '📚', 'education': '🎓',
  'pets': '🐾', 'animals': '🐾', 'pets-animals': '🐾',
  'garden': '🌳', 'outdoor': '🌳', 'agriculture': '🌾', 'agriculture-farming': '🌾',
  'gaming': '🎮', 'shopping': '🛒', 'food': '🍽️', 'catering': '🍽️',
  'music': '🎵', 'entertainment': '🎭', 'travel': '✈️',
  'construction': '🏗️', 'art': '🎨', 'art-collectibles': '🎨',
  'transport': '🚚', 'logistics': '🚚', 'medical': '🏥', 'healthcare': '🏥',
};

function getCategoryEmoji(slug?: string, name?: string): string {
  if (!slug && !name) return '📁';
  const slugKey = slug?.toLowerCase().replace(/[^a-z0-9]/g, '-');
  if (slugKey && iconEmojis[slugKey]) return iconEmojis[slugKey];
  const nameKey = name?.toLowerCase().split(' ')[0];
  if (nameKey && iconEmojis[nameKey]) return iconEmojis[nameKey];
  return '📁';
}

const CATEGORIES = [
  { slug: 'vehicles', name: 'Vehicles' },
  { slug: 'mobile-phones-tablets', name: 'Mobile Phones' },
  { slug: 'property', name: 'Property' },
  { slug: 'electronics', name: 'Electronics' },
  { slug: 'fashion', name: 'Fashion' },
  { slug: 'home-furniture', name: 'Furniture' },
  { slug: 'services', name: 'Services' },
  { slug: 'repair-services', name: 'Repairs' },
  { slug: 'health-beauty', name: 'Health' },
  { slug: 'sports-fitness', name: 'Sports' },
  { slug: 'babies-kids', name: 'Kids' },
  { slug: 'jobs', name: 'Jobs' },
];

const NOTIFICATION_ICONS: Record<string, any> = {
  ad_approved: ThumbsUp, ad_rejected: ThumbsDown, ad_deleted: AlertTriangle,
  ad_published: CheckCircle, ad_pending: Clock, new_message: MessageCircle,
  new_ad_followed: Package, payment_received: CreditCard, payment_approved: CreditCard,
  payment_rejected: CreditCard, promotion_activated: TrendingUp, promotion_expired: TrendingUp,
  account_verified: Shield, new_review: Star, admin_broadcast: Megaphone,
  new_favorite: Heart, system_notice: AlertTriangle,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  ad_approved: 'bg-emerald-100 text-emerald-600', ad_rejected: 'bg-red-100 text-red-600',
  ad_deleted: 'bg-red-100 text-red-600', ad_published: 'bg-emerald-100 text-emerald-600',
  ad_pending: 'bg-amber-100 text-amber-600', new_message: 'bg-blue-100 text-blue-600',
  new_ad_followed: 'bg-violet-100 text-violet-600', payment_received: 'bg-emerald-100 text-emerald-600',
  payment_approved: 'bg-emerald-100 text-emerald-600', payment_rejected: 'bg-red-100 text-red-600',
  promotion_activated: 'bg-purple-100 text-purple-600', promotion_expired: 'bg-slate-100 text-slate-600',
  account_verified: 'bg-emerald-100 text-emerald-600', new_review: 'bg-amber-100 text-amber-600',
  admin_broadcast: 'bg-purple-100 text-purple-600', new_favorite: 'bg-red-100 text-red-600',
  system_notice: 'bg-slate-100 text-slate-600',
};

export default function DesktopHeader() {
  const router = useRouter();
  const { isAuthenticated, user, logout, hasHydrated } = useAuthStore();
  const { toggleLoginModal, toggleRegisterModal, toggleLocationModal } = useUIStore();
  const { selectedLocation } = useGlobalStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('ilist_recent_searches');
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch { setRecentSearches([]); }
    }
  }, []);

  const locationDisplay = selectedLocation 
    ? selectedLocation.lga ? `${selectedLocation.lga}, ${selectedLocation.name}` : selectedLocation.name
    : 'All Nigeria';

  const isLoading = !hasHydrated && !isMounted;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearchDropdown(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) setNotificationOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('ilist_recent_searches', JSON.stringify(updated));
  }, [recentSearches]);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) { setSearchResults(null); return; }
    setIsSearching(true);
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch { setSearchResults(null); } finally { setIsSearching(false); }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => performSearch(searchQuery), 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, performSearch]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      setShowSearchDropdown(false);
      const params = new URLSearchParams({ q: searchQuery.trim() });
      if (selectedLocation?.slug) params.append('location', selectedLocation.slug);
      if (selectedLocation?.lga) params.append('lga', selectedLocation.lga);
      router.push(`/ads?${params.toString()}`);
    }
  };

  const handleCategoryClick = (slug: string) => router.push(`/ads?category=${slug}`);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('auth-storage');
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.trim().split('=')[0];
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    logout();
    setShowUserMenu(false);
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
    localStorage.setItem('ilist_recent_searches', JSON.stringify(updated));
  };

  const handleNewNotification = useCallback((notification: any) => {
    setRecentNotifications(prev => [notification, ...prev].slice(0, 10));
    setUnreadCount(prev => prev + 1);
    const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;
    toast.custom((t) => (
      <div className={`bg-white shadow-lg rounded-xl border p-4 flex items-start gap-3 max-w-sm ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", NOTIFICATION_COLORS[notification.type] || 'bg-gray-100')}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
        </div>
      </div>
    ), { duration: 5000, position: 'top-right' });
  }, []);

  useSocket({ userId: user?.id, onNotification: handleNewNotification });

  useEffect(() => {
    if (isAuthenticated) { fetchNotifications(); fetchRecentMessages(); }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const [countRes, allRes] = await Promise.all([notificationsApi.getUnreadCount(), notificationsApi.getAll()]);
      setUnreadCount(countRes.data?.count || 0);
      const all = allRes.data?.data || allRes.data || [];
      setRecentNotifications(all.filter((n: any) => !n.read_at).slice(0, 10));
    } catch {}
  };

  const fetchRecentMessages = async () => {
    try {
      const res = await messagesApi.getConversations();
      const conversations = res.data?.data || res.data || [];
      setRecentMessages(conversations.slice(0, 5));
      setUnreadMessagesCount(conversations.filter((c: any) => c.unread_count > 0).length);
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setRecentNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch {}
  };

  const handleNotificationClick = (notif: any) => {
    switch (notif.type) {
      case 'ad_approved': case 'ad_rejected': case 'ad_published':
        router.push(notif.data?.ad_slug ? `/ad/${notif.data.ad_slug}` : '/dashboard/my-ads'); break;
      case 'new_message':
        router.push(notif.data?.conversation_id ? `/dashboard/messages?conversation=${notif.data.conversation_id}` : '/dashboard/messages'); break;
      case 'payment_received': case 'payment_approved': case 'payment_rejected':
        router.push('/dashboard/wallet'); break;
      default:
        router.push('/dashboard/notifications');
    }
    setNotificationOpen(false);
  };

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="h-20 animate-pulse bg-gray-100" />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top Bar */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-10 text-sm">
            <button onClick={toggleLocationModal} className="flex items-center gap-2 text-white hover:text-primary-100 transition-colors">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">{locationDisplay}</span>
              <ChevronDown className="w-3 h-3 hidden sm:inline" />
            </button>
            <div className="flex items-center gap-6">
              {isAuthenticated ? (
                <Link href="/dashboard" className="text-white hover:text-primary-100 transition-colors font-medium">
                  {user?.name?.split(' ')[0]}
                </Link>
              ) : (
                <>
                  <button onClick={toggleLoginModal} className="text-white hover:text-primary-100 transition-colors">Login</button>
                  <button onClick={toggleRegisterModal} className="text-white hover:text-primary-100 font-medium transition-colors">Register</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-1">
              <img src="/icons/iList-green.png" alt="iList" className="h-10 w-auto" onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }} />
              <span className="hidden text-2xl font-bold text-primary-600">iList</span>
            </Link>

            {/* Search Bar */}
            <div ref={searchRef} className="flex-1 max-w-2xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                  onFocus={() => setShowSearchDropdown(true)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for anything..."
                  className="w-full pl-12 pr-32 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                />
                {isSearching && <Loader2 className="absolute right-32 w-5 h-5 text-primary-600 animate-spin" />}
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-32 p-1 hover:bg-gray-200 rounded-full">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                <button onClick={handleSearch} className="absolute right-1 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium transition-colors text-sm">
                  Search
                </button>
              </div>

              {/* Search Dropdown */}
              {showSearchDropdown && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {searchQuery.length >= 2 && searchResults ? (
                      <>
                        {searchResults.ads?.length > 0 && (
                          <div className="p-3">
                            <p className="text-xs font-bold text-gray-400 uppercase px-2 py-2">ADS</p>
                            {searchResults.ads.slice(0, 5).map((ad: any) => (
                              <button key={ad.id} onClick={() => { router.push(`/ad/${ad.slug}`); setShowSearchDropdown(false); setSearchQuery(''); }}
                                className="w-full flex items-center gap-3 px-2 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                                <Package className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{ad.title}</p>
                                  <p className="text-sm font-bold text-primary-600">₦{ad.price?.toLocaleString()}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.categories?.length > 0 && (
                          <div className="p-3 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase px-2 py-2">CATEGORIES</p>
                            {searchResults.categories.slice(0, 5).map((cat: any) => (
                              <button key={cat.id} onClick={() => { router.push(`/ads?category=${cat.slug}`); setShowSearchDropdown(false); setSearchQuery(''); }}
                                className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left">
                                <span className="text-xl">{getCategoryEmoji(cat.slug, cat.name)}</span>
                                <span className="text-sm text-gray-700">{cat.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : searchQuery.length < 2 && (
                      <div className="p-3">
                        {recentSearches.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-bold text-gray-400 uppercase px-2 py-2 flex items-center gap-2"><Clock className="w-3 h-3" /> Recent</p>
                            {recentSearches.map((term, idx) => (
                              <button key={idx} onClick={() => handleRecentSearchClick(term)} className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700 flex-1">{term}</span>
                                <button onClick={(e) => removeRecentSearch(e, term)} className="p-1 hover:bg-gray-100 rounded"><X className="w-3 h-3 text-gray-400" /></button>
                              </button>
                            ))}
                          </div>
                        )}
                        <p className="text-xs font-bold text-gray-400 uppercase px-2 py-2 flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Trending</p>
                        {['iPhone 15', 'Toyota Camry', 'Laptop', 'House for rent'].map((term) => (
                          <button key={term} onClick={() => { setSearchQuery(term); setShowSearchDropdown(true); }}
                            className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{term}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/post-ad" className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium transition-colors text-sm">
                    Post Ad
                  </Link>
                  <Link href="/dashboard/favorites" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </Link>
                  <div className="relative" ref={notificationRef}>
                    <button onClick={() => setNotificationOpen(!notificationOpen)} className="p-2 hover:bg-gray-100 rounded-full relative transition-colors">
                      <Bell className="w-5 h-5 text-gray-600" />
                      {(unreadCount + unreadMessagesCount) > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {(unreadCount + unreadMessagesCount) > 9 ? '9+' : (unreadCount + unreadMessagesCount)}
                        </span>
                      )}
                    </button>
                    {notificationOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                        <div className="flex border-b border-gray-100">
                          <button onClick={() => setActiveTab('notifications')}
                            className={cn("flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2", activeTab === 'notifications' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500')}>
                            <Bell className="w-4 h-4" /> Notifications
                          </button>
                          <button onClick={() => setActiveTab('messages')}
                            className={cn("flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2", activeTab === 'messages' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500')}>
                            <MessageCircle className="w-4 h-4" /> Messages
                          </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {activeTab === 'notifications' && (
                            recentNotifications.length === 0 ? (
                              <div className="px-4 py-8 text-center text-gray-500"><BellOff className="w-8 h-8 mx-auto mb-2 text-gray-300" />No notifications</div>
                            ) : (
                              <>
                                <div className="px-4 py-2 border-b border-gray-50 text-right">
                                  <button onClick={handleMarkAllAsRead} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 ml-auto"><Check className="w-3 h-3" />Mark all read</button>
                                </div>
                                {recentNotifications.slice(0, 5).map((notif: any) => {
                                  const IconComponent = NOTIFICATION_ICONS[notif.type] || Bell;
                                  return (
                                    <div key={notif.id} onClick={() => handleNotificationClick(notif)} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                                      <div className="flex items-start gap-3">
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", NOTIFICATION_COLORS[notif.type] || 'bg-gray-100')}>
                                          <IconComponent className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.message}</p>
                                        </div>
                                        {!notif.read_at && <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />}
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            )
                          )}
                          {activeTab === 'messages' && (
                            recentMessages.length === 0 ? (
                              <div className="px-4 py-8 text-center text-gray-500"><MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />No messages</div>
                            ) : (
                              recentMessages.map((conv: any) => (
                                <div key={conv.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">{conv.sender?.name || conv.receiver?.name || 'User'}</p>
                                    {conv.unread_count > 0 && <span className="bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded-full">{conv.unread_count}</span>}
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">{conv.last_message?.content || 'No messages'}</p>
                                </div>
                              ))
                            )
                          )}
                        </div>
                        <div className="px-4 py-3 border-t border-gray-100">
                          <Link href={activeTab === 'notifications' ? "/dashboard/notifications" : "/dashboard/messages"} onClick={() => setNotificationOpen(false)}
                            className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative ml-1" ref={userMenuRef}>
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                      </div>
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <Link href="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"><LayoutDashboard className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-700">My Account</span></Link>
                        <Link href="/dashboard/my-ads" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"><Package className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-700">My Ads</span></Link>
                        <Link href="/dashboard/favorites" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"><Heart className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-700">Favorites</span></Link>
                        <Link href="/dashboard/wallet" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"><CreditCard className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-700">Wallet</span></Link>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button onClick={handleLogout} disabled={isLoggingOut} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left"><LogOut className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-700">{isLoggingOut ? 'Logging out...' : 'Logout'}</span></button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/post-ad" className="hidden lg:flex items-center px-4 py-2 border border-gray-300 hover:border-primary-600 hover:text-primary-600 rounded-full font-medium transition-colors text-sm">
                    Post Ad
                  </Link>
                  <button onClick={toggleLoginModal} className="text-gray-600 hover:text-primary-600 font-medium text-sm">Login</button>
                  <button onClick={toggleRegisterModal} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium text-sm transition-colors">Register</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Nav Pills */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-3 py-2.5 overflow-x-auto scrollbar-thin">
            {CATEGORIES.map((category) => (
              <button key={category.slug} onClick={() => handleCategoryClick(category.slug)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 hover:bg-primary-50 text-gray-700 hover:text-primary-700 transition-colors text-sm font-medium whitespace-nowrap">
                <span className="text-base">{getCategoryEmoji(category.slug, category.name)}</span>
                <span>{category.name}</span>
              </button>
            ))}
            <button onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors text-sm font-medium whitespace-nowrap">
              <span className="text-base">📁</span>
              <span>See All</span>
            </button>
          </div>
        </div>
      </div>

      <CategoryModal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} />
    </header>
  );
}
