'use client';

import '../globals.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  FileText,
  FolderTree,
  Flag,
  Image,
  Star,
  BarChart3,
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
  AlertCircle,
  Building2,
  Share2,
  Mail,
  Zap,
} from 'lucide-react';
import { useAdminAuthStore } from '@/lib/admin-store';
import { api, adminApiClient } from '@/lib/api';
import { getCookie, deleteCookie, setCookie } from '@/lib/cookies';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Ad Quality & Moderation', href: '/admin/ads-moderation', icon: CheckCircle },
  { name: 'Ad Approval Settings', href: '/admin/ads/approval', icon: CheckCircle },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Subcategories', href: '/admin/subcategories', icon: FolderTree },
  { name: 'Category Fields', href: '/admin/category-fields', icon: FolderTree },
  { name: 'Reviews Management', href: '/admin/reviews', icon: Star },
  { name: 'Reports & Abuse', href: '/admin/reports', icon: Flag },
  { name: 'Banners & Ads', href: '/admin/banners', icon: Image },
  { name: 'Promotions', href: '/admin/promotions', icon: TrendingUp },
  { name: 'Bank Transfers', href: '/admin/bank-transfers', icon: Building2 },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Boost Management', href: '/admin/boosts', icon: Zap },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Search Analytics', href: '/admin/search-analytics', icon: Search },
  { name: 'Broadcasts', href: '/admin/broadcasts', icon: Send },
  { name: 'Social Posts', href: '/admin/social', icon: Share2 },
  { name: 'Social Settings', href: '/admin/social-settings', icon: Share2 },
  { name: 'Watermark Settings', href: '/admin/watermark', icon: Type },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
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
  const { logout: adminLogout, user: storeUser, token, setUser: setAdminUser, login: adminLogin } = useAdminAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<typeof storeUser>(null);
  const [initialTokenChecked, setInitialTokenChecked] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationModalRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Admin inactivity timeout - 2 hours (7,200,000 ms)
  const ADMIN_INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000;

  const handleLogout = useCallback(async () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/secure-control-9ja/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
    } catch (e) {
      console.log('Logout API error:', e);
    }

    adminLogout();

    window.location.href = '/admin/login';
  }, [token, adminLogout]);

  const resetInactivityTimer = useCallback(() => {
    if (!isVerified) return;
    
    localStorage.setItem('admin_last_activity', String(Date.now()));
    
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    inactivityTimerRef.current = setTimeout(() => {
      handleLogout();
    }, ADMIN_INACTIVITY_TIMEOUT);
  }, [isVerified, ADMIN_INACTIVITY_TIMEOUT, handleLogout]);

  useEffect(() => {
    if (!isVerified) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isVerified, resetInactivityTimer]);

  // Login form state - MUST be before any early returns
  const [loginEmail, setLoginEmail] = useState('admin@example.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Handle login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await api.post('/secure-control-9ja/auth/login', {
        login: loginEmail,
        password: loginPassword,
      });

      if (response.data.success) {
        const adminToken = response.data.token;
        const user = response.data.user;
        
        localStorage.setItem('admin_token', adminToken);
        localStorage.setItem('admin_user', JSON.stringify(user));
        
        setCookie('admin_token', adminToken, 7);
        
        adminLogin(user, adminToken);
        setIsVerified(true);
        setVerifiedUser(user);
        
            window.location.href = '/admin/ads-moderation';
      } else {
        setLoginError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      const retryAfter = err.response?.data?.retry_after;
      
      if (retryAfter) {
        const minutes = Math.ceil(retryAfter / 60);
        setLoginError(`Too many attempts. Please try again in ${minutes} minute(s).`);
      } else if (errorMessage?.includes('Invalid credentials')) {
        const remaining = err.response?.data?.attempts_remaining;
        setLoginError(remaining !== undefined 
          ? `Incorrect email or password. ${remaining} attempt(s) remaining.`
          : 'Incorrect email or password');
      } else if (err.response?.status === 403) {
        setLoginError(errorMessage || 'Access denied. Admin privileges required.');
      } else {
        setLoginError(errorMessage || 'Login failed. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (notificationModalRef.current && !notificationModalRef.current.contains(event.target as Node)) {
        setNotificationModalOpen(false);
        setSelectedNotification(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Skip auth check for login page - render without auth verification
  const isLoginPage = pathname === '/admin/login';

  // Verify auth with backend on mount
  useEffect(() => {
    // Skip auth check for login page - always show login form
    if (isLoginPage) {
      setInitialTokenChecked(true);
      setAuthChecked(true);
      
      // Clear any existing admin state on login page to force fresh login
      // This prevents auto-login from main site auth
      setVerifiedUser(null);
      setIsVerified(false);
      return;
    }
    
    const adminToken = localStorage.getItem('admin_token');
    const adminUserData = localStorage.getItem('admin_user');
    
    if (adminToken && adminUserData) {
      try {
        const user = JSON.parse(adminUserData);
        setVerifiedUser(user);
        setAdminUser(user);
        setIsVerified(true);
        setInitialTokenChecked(true);
        setAuthChecked(true);
        
        adminApiClient.get('/secure-control-9ja/auth/me').then(response => {
          if (response.data?.user?.role !== 'admin') {
            adminLogout();
            setIsVerified(false);
          }
        }).catch(() => {});
        
        return;
      } catch {}
    }
    
    setInitialTokenChecked(true);
    setAuthChecked(true);
  }, [pathname, adminLogout, setAdminUser, isLoginPage]);

  // Fetch admin notifications
  useEffect(() => {
    if (!isVerified || !verifiedUser) return;
    
    const fetchAdminNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const adminToken = localStorage.getItem('admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/secure-control-9ja/notifications`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Accept': 'application/json',
          },
        });
        const data = await res.json();
        if (data?.data) {
          setNotifications(data.data.slice(0, 10));
        } else if (Array.isArray(data)) {
          setNotifications(data.slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchAdminNotifications();
    
    // Poll more frequently for new notifications
    const interval = setInterval(fetchAdminNotifications, 10000);
    return () => clearInterval(interval);
  }, [isVerified, verifiedUser]);

  // Skip auth check for login page - render without auth verification
  // Show loading while verifying auth (except for login page)
  if (!isLoginPage && (!initialTokenChecked || !authChecked)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-8">
          <div className="h-16 w-16 bg-gray-200 rounded-2xl animate-pulse mx-auto"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated (on login page or when no token)
  if (!isVerified) {
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
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 space-y-6" autoComplete="off">
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
                autoComplete="off"
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
                  autoComplete="new-password"
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

  const admin = verifiedUser;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatNotificationTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
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
  };

  const handleMarkAsRead = async (notificationId: number) => {
    // These are admin-generated notifications, just update local state
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
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
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
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
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {item.name}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-primary-400" />
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
        {/* Header - Match user dashboard style */}
        <header className="sticky top-0 z-30 bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-xl text-white hover:bg-primary-500 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo - visible on mobile */}
            <Link href="/admin" className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-white font-bold text-lg">iList</span>
            </Link>

            {/* Page Title */}
            <div className="flex-1 lg:flex-none hidden lg:block">
              <h1 className="text-lg font-semibold text-white">
                {navigation.find(item => item.href === pathname || pathname.startsWith(item.href))?.name || 'Admin'}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  className="relative p-2 rounded-xl text-white hover:bg-primary-500 transition-colors"
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
                        <span className="text-xs text-primary-600">{unreadCount} unread</span>
                      )}
                    </div>
                    {notificationsLoading ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No notifications yet</p>
                        <p className="text-xs text-gray-400 mt-1">You&apos;ll receive alerts for new ads, reports, and more</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => {
                            setSelectedNotification(notification);
                            setNotificationModalOpen(true);
                            if (!notification.is_read) {
                              handleMarkAsRead(notification.id);
                            }
                          }}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-primary-50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            {!notification.is_read && (
                              <span className="w-2 h-2 mt-2 bg-primary-500 rounded-full flex-shrink-0" />
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
                      className="block px-4 py-2 text-sm text-center text-primary-600 hover:bg-gray-50 border-t border-gray-100"
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-primary-500 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <span className="text-primary-600 text-sm font-semibold">
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
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
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

        {/* Notification Detail Modal */}
        {notificationModalOpen && selectedNotification && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div 
              ref={notificationModalRef}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedNotification.title}</h3>
                    <p className="text-xs text-gray-500">{formatNotificationTime(selectedNotification.created_at)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNotificationModalOpen(false);
                    setSelectedNotification(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="px-6 py-4">
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedNotification.type === 'security' ? 'bg-red-100 text-red-800' :
                    selectedNotification.type === 'warning' ? 'bg-amber-100 text-amber-800' :
                    selectedNotification.type === 'success' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedNotification.type || 'info'}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedNotification.message}</p>
                
                {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-2">Additional Details</p>
                    <pre className="text-xs text-gray-600 overflow-x-auto">
                      {JSON.stringify(selectedNotification.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              
              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => {
                    setNotificationModalOpen(false);
                    setSelectedNotification(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
