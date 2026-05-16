'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Bell, User, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useGlobalStore, useUIStore, useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { getUserAvatarUrl } from '@/lib/utils';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import MobileSearchPage from '@/components/ui/MobileSearchPage';

export default function MobileHeader() {
  const router = useRouter();
  const { selectedLocation } = useGlobalStore();
  const { toggleLocationModal } = useUIStore();
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

            <button className="relative p-2 rounded-lg active:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-white" />
            </button>

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
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-[9999] overflow-hidden animate-fade-in">
                    <div className="px-3.5 py-2.5 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email || ''}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/dashboard" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="w-4 h-4 text-gray-400" />
                        My Account
                      </Link>
                      <button onClick={handleLogout} disabled={isLoggingOut} className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                        <LogOut className="w-4 h-4" />
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </button>
                    </div>
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
