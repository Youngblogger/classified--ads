'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderTree,
  Flag,
  Image,
  Star,
  Wallet,
  BarChart3,
  MessageSquare,
  Send,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Shield,
  CheckCircle,
  ChevronRight,
  Type,
  CreditCard,
  TrendingUp,
  Search,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { api, notificationsApi } from '@/lib/api';
import { getCookie, deleteCookie } from '@/lib/cookies';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Ads Management', href: '/admin/ads', icon: FileText },
  { name: 'Ad Approval Settings', href: '/admin/ads/approval', icon: CheckCircle },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Subcategories', href: '/admin/subcategories', icon: FolderTree },
  { name: 'Reviews Management', href: '/admin/reviews', icon: Star },
  { name: 'Reports & Abuse', href: '/admin/reports', icon: Flag },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Banners & Ads', href: '/admin/banners', icon: Image },
  { name: 'Promotions', href: '/admin/promotions', icon: TrendingUp },
  { name: 'Wallets', href: '/admin/wallets', icon: Wallet },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Search Analytics', href: '/admin/search-analytics', icon: Search },
  { name: 'Broadcasts', href: '/admin/broadcasts', icon: Send },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Watermark Settings', href: '/admin/watermark', icon: Type },
  { name: 'Custom Fonts', href: '/admin/fonts', icon: FileText },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  data?: Record<string, any>;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user: storeUser, token, isAuthenticated, setUser, login } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<typeof storeUser>(null);
  const [initialTokenChecked, setInitialTokenChecked] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Login form state - MUST be before any early returns
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Skip auth check for login page - render without auth verification
  const isLoginPage = pathname === '/admin-login';

  // Get token from store or directly from localStorage (for initial hydration)
  const getInitialToken = () => {
    if (token) return token;
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.state?.token || null;
      } catch {
        return null;
      }
    }
    return null;
  };

  // Verify auth with backend on mount
  useEffect(() => {
    if (isLoginPage) {
      setInitialTokenChecked(true);
      setAuthChecked(true);
      return;
    }
    
    const initialToken = getInitialToken();
    setInitialTokenChecked(true);
    
    if (!initialToken) {
      console.log('Layout: No token, showing login form');
      setAuthChecked(true);
      return;
    }
    
    let isMounted = true;
    const controller = new AbortController();
    
    const verifyAuth = async () => {
      console.log('Layout verifyAuth running, token:', initialToken ? 'present' : 'null');
      
      if (!initialToken) {
        console.log('Layout: No token, showing login form');
        if (isMounted) {
          setAuthChecked(true);
        }
        return;
      }
      
      try {
        const response = await api.get('/auth/me', { signal: controller.signal });
        console.log('Layout: Token is valid', response.data);
        
        // Ensure authChecked is set even if there's an error below
        if (!isMounted) return;
        
        if (!isMounted) return;
        
        const user = response.data.user || response.data;
        const userRole = user?.role || user?.user_type || user?.type;
        console.log('Layout: Checking role, found:', userRole);
        
        if (user && (userRole === 'admin' || userRole === 'Admin' || userRole === 'administrator')) {
          console.log('Layout: Admin verified, setting state...');
          setVerifiedUser(user);
          setUser(user);
          setIsVerified(true);
          console.log('Layout: isVerified set to true');
        } else {
          console.log('Layout: User is not admin');
          logout();
          setIsVerified(false);
        }
      } catch (err: any) {
        console.log('Layout: Auth error:', err);
        if (!isMounted) {
          setAuthChecked(true);
          return;
        }
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          setAuthChecked(true);
          return;
        }
        console.log('Layout: Token is invalid, clearing auth');
        logout();
        setIsVerified(false);
        setAuthChecked(true);
      }
      
      if (isMounted) {
        setAuthChecked(true);
        console.log('Layout: Auth check complete');
      }
    };
    
    const timeoutId = setTimeout(() => {
      controller.abort();
      if (isMounted) {
        console.log('Layout: Timeout, but not logging out automatically');
        setAuthChecked(true);
      }
    }, 5000);
    
    verifyAuth();
    
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [pathname, logout, router, setUser, isLoginPage]);

  // Fetch notifications
  useEffect(() => {
    if (!token || !isVerified) return;
    
    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const res = await notificationsApi.getAll();
        if (res.data?.data) {
          setNotifications(res.data.data.slice(0, 10));
        } else if (Array.isArray(res.data)) {
          setNotifications(res.data.slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, isVerified]);

  // Skip auth check for login page - render without auth verification
  // Show loading while verifying auth (except for login page)
  if (!isLoginPage && (!initialTokenChecked || !authChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  // Allow login page to render without auth
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await api.post('/auth/login', {
        login: loginEmail,
        password: loginPassword,
      });

      if (response.data.user && response.data.user.role === 'admin') {
        login(response.data.user, response.data.token);
        setIsVerified(true);
        setVerifiedUser(response.data.user);
      } else {
        setLoginError('Access denied. Admin credentials required.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      if (errorMessage?.includes('Invalid credentials')) {
        setLoginError('Incorrect email or password');
      } else {
        setLoginError(errorMessage || 'Login failed');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Show login form if not authenticated
  if (!isVerified && !isLoginPage) {
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
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {loginError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{loginError}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={loginShowPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setLoginShowPassword(!loginShowPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {loginShowPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loginLoading} className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium disabled:opacity-50">
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="text-center">
              <a href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Homepage</a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const tokenFromCookie = getCookie('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenFromCookie || token}`,
          'Accept': 'application/json',
        },
      });
    } catch (e) {
      console.log('Logout API error:', e);
    }
    
    // Clear cookies
    deleteCookie('token');
    
    // Clear localStorage
    localStorage.removeItem('auth-storage');
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.trim().split('=')[0];
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
    });
    
    // Call logout from store
    logout();
    
    // Full page redirect
    window.location.href = '/';
  };

  const admin = verifiedUser;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">iList Admin</span>
            </Link>
            <button
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-gray-400'}`} />
                  {item.name}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-sky-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info at bottom */}
          <div className="p-3 border-t border-gray-200">
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <Settings className="w-5 h-5 text-gray-400" />
              Settings
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full mt-1"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page Title */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => item.href === pathname || (item.href !== '/admin' && pathname.startsWith(item.href)))?.name || 'Dashboard'}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs text-sky-600">{unreadCount} unread</span>
                      )}
                    </div>
                    {notificationsLoading ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <div className="animate-spin w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full mx-auto" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleMarkAsRead(notification.id)}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-sky-50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            {!notification.is_read && (
                              <span className="w-2 h-2 mt-2 bg-sky-500 rounded-full flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatNotificationTime(notification.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <Link
                      href="/admin/notifications"
                      className="block px-4 py-2 text-sm text-center text-sky-600 hover:bg-gray-50 border-t border-gray-100"
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {admin?.name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                    </span>
                  </div>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{admin?.name || 'Admin'}</p>
                      <p className="text-xs text-gray-500">{admin?.email || 'admin@example.com'}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 mt-1">
                        Admin
                      </span>
                    </div>
                    <Link
                      href="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
