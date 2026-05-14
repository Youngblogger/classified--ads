'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Bell, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useGlobalStore, useUIStore, useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { getUserAvatarUrl } from '@/lib/utils';

export default function MobileHeader() {
  const router = useRouter();
  const { selectedLocation } = useGlobalStore();
  const { toggleLocationModal, toggleLoginModal } = useUIStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append('q', searchQuery.trim());
      if (selectedLocation?.slug) params.append('location', selectedLocation.slug);
      if (selectedLocation?.lga) params.append('lga', selectedLocation.lga);
      router.push(`/ads?${params.toString()}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-100 shadow-sm">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-12 px-3">
          {/* Left: Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/icons/iList-logo.png" alt="iList" className="h-7 w-auto" />
          </Link>

          {/* Right: Location + Notifications + Profile */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleLocationModal}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-[11px] font-medium text-gray-700 max-w-[70px] truncate capitalize">
                {locationDisplay.toLowerCase()}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            <button className="relative p-2 rounded-lg active:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-1 rounded-lg active:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center">
                    {(() => {
                      const avatarUrl = getUserAvatarUrl(user);
                      return avatarUrl ? (
                        <img src={avatarUrl} alt="" className="object-cover w-full h-full" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <span className="text-white font-semibold text-xs">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                      );
                    })()}
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-[9999] overflow-hidden animate-fade-in">
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
            ) : (
              <button onClick={toggleLoginModal} className="p-1.5 rounded-lg active:bg-gray-100 transition-colors">
                <User className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2.5">
          <div
            ref={searchRef}
            onClick={() => router.push('/ads')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-[13px] text-gray-400 flex-1">Search phones, cars, properties...</span>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-200/60 rounded-md">
              <MapPin className="w-3 h-3 text-gray-500" />
              <span className="text-[10px] font-medium text-gray-600 capitalize">{locationDisplay.toLowerCase()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[7rem]" />
    </>
  );
}
