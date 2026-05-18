'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Bell, User, ChevronDown, Menu, X } from 'lucide-react';
import { useGlobalStore, useUIStore, useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { getUserAvatarUrl } from '@/lib/utils';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import MobileSearchPage from '@/components/ui/MobileSearchPage';

export default function MobileHeader() {
  const router = useRouter();
  const { selectedLocation } = useGlobalStore();
  const { toggleLocationModal, toggleLoginModal } = useUIStore();
  const { isAuthenticated, user, isLoading: authLoading, hasHydrated, logout } = useAuthStore();
  const { isAtTop, scrollY } = useScrollDirection({ threshold: 5, throttleMs: 50 });

  const [searchOpen, setSearchOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const locationDisplay = selectedLocation
    ? selectedLocation.lga
      ? `${selectedLocation.name}, ${selectedLocation.lga}`
      : selectedLocation.name
    : 'All Nigeria';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try { await api.post('/auth/logout'); } catch {}
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
    setShowProfileMenu(false);
    setIsLoggingOut(false);
    router.push('/');
  };

  const hasShadow = scrollY > 5;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[100] transition-shadow duration-300"
        style={{
          background: 'linear-gradient(135deg, #00B53F 0%, #009E38 50%, #008C31 100%)',
          boxShadow: hasShadow ? '0 4px 20px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Top Row */}
        <div className="flex items-center justify-between h-12 px-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/icons/iList-white.png" alt="iList" className="h-7 w-auto" />
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={toggleLocationModal}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg active:bg-white/10 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-white/80" />
              <span className="text-[11px] font-medium text-white/90 max-w-[65px] truncate capitalize">
                {locationDisplay.toLowerCase()}
              </span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </button>

            {isAuthenticated && (
              <button className="relative p-2 rounded-lg active:bg-white/10 transition-colors">
                <Bell className="w-5 h-5 text-white" />
              </button>
            )}

            {hasHydrated && (
              <div className="relative animate-fade-in" ref={profileRef}>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      toggleLoginModal();
                    } else {
                      setShowProfileMenu(!showProfileMenu);
                    }
                  }}
                  className="p-1 rounded-lg active:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                    {isAuthenticated ? (
                      <>
                        {(() => {
                          const avatarUrl = getUserAvatarUrl(user);
                          return avatarUrl ? (
                            <img src={avatarUrl} alt="" className="object-cover w-full h-full" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <span className="text-white font-semibold text-xs">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                          );
                        })()}
                      </>
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                </button>

                {isAuthenticated && showProfileMenu && (
                  <div
                    className="absolute right-0 top-full mt-1.5 w-48 py-1.5 bg-white dark:bg-gray-800 rounded-[7px] shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700 z-[9999] overflow-hidden"
                    style={{ animation: 'fadeSlideIn 0.15s ease-out' }}
                  >
                    <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-6px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
                    <Link href="/dashboard" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      Dashboard
                    </Link>
                    <Link href="/dashboard/my-ads" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      My Ads
                    </Link>
                    <Link href="/dashboard/wallet" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Wallet
                    </Link>
                    <Link href="/dashboard/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Settings
                    </Link>
                    <div className="mx-3 my-1 border-t border-gray-100 dark:border-gray-700" />
                    <button onClick={handleLogout} disabled={isLoggingOut} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 w-full px-3 py-2.5 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 active:bg-white/25 transition-colors cursor-pointer text-left"
          >
            <Search className="w-4 h-4 text-white/70 flex-shrink-0" />
            <span className="text-[13px] text-white/60 flex-1">Search phones, cars, properties...</span>
          </button>
        </div>
      </header>

      <div className="h-[6.5rem]" />

      {/* Mobile Search Page */}
      <MobileSearchPage isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
