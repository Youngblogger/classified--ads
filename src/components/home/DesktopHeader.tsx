'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, X, Loader2, Bell, MessageCircle } from 'lucide-react';
import { useGlobalStore, useAuthStore } from '@/lib/store';
import { useSocket } from '@/hooks/useSocket';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface ApiLocation {
  id: number;
  name: string;
  slug: string;
  children?: { name: string; slug: string }[];
}

export default function DesktopHeader() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { selectedLocation, setSelectedLocation } = useGlobalStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempSelectedState, setTempSelectedState] = useState<ApiLocation | null>(null);
  const [tempSelectedLGA, setTempSelectedLGA] = useState<string | null>(null);
  const [apiLocations, setApiLocations] = useState<ApiLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const locationDisplay = selectedLocation 
    ? selectedLocation.lga 
      ? `${selectedLocation.name}, ${selectedLocation.lga}`
      : selectedLocation.name
    : 'All Nigeria';

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`${API_URL}/locations`);
        const data = await res.json();
        if (data.data) setApiLocations(data.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useSocket({
    userId: user?.id,
    onNotification: (notification: any) => {
      toast.custom((t) => (
        <div className={`bg-white shadow-lg rounded-xl border border-slate-100 p-4 flex items-start gap-3 max-w-sm ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">{notification.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
          </div>
        </div>
      ));
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append('q', searchQuery.trim());
      if (selectedLocation?.slug) {
        params.append('location', selectedLocation.slug);
      }
      if (selectedLocation?.lga) {
        params.append('lga', selectedLocation.lga);
      }
      router.push(`/ads?${params.toString()}`);
      setSearchQuery('');
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

  const applyLocationSelection = () => {
    if (tempSelectedState) {
      setSelectedLocation({
        name: tempSelectedState.name,
        slug: tempSelectedState.slug,
        lga: tempSelectedLGA
      });
      setShowLocationModal(false);
    } else {
      setSelectedLocation(null);
      setShowLocationModal(false);
    }
  };

  const openLocationModal = () => {
    if (selectedLocation) {
      const currentState = apiLocations.find(l => l.slug === selectedLocation.slug);
      setTempSelectedState(currentState || null);
      setTempSelectedLGA(selectedLocation.lga);
    } else {
      setTempSelectedState(null);
      setTempSelectedLGA(null);
    }
    setShowLocationModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-storage');
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.trim().split('=')[0];
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    logout();
    window.location.href = '/';
  };

  return (
    <>
      <style jsx>{`
        .desktop-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .search-input::placeholder {
          color: #9ca3af;
        }
        .action-btn:active {
          transform: scale(0.95);
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }
      `}</style>

      <header className="desktop-header hidden md:block w-full">
        <div className="flex items-center justify-between h-16 px-[15px] gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-1">
            <span className="text-xl sm:text-2xl font-bold text-primary-600">i</span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">List</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-2xl relative" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search..."
                className="search-input w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-20 p-1"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button
                onClick={handleSearch}
                className="action-btn ml-2 px-4 sm:px-5 py-2 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium transition-colors text-xs sm:text-sm"
              >
                Search
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Location */}
            <button
              onClick={openLocationModal}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <MapPin className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium hidden lg:inline">{locationDisplay}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard/messages" className="action-btn p-2 hover:bg-gray-100 rounded-full">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                </Link>
                <Link href="/dashboard/notifications" className="action-btn p-2 hover:bg-gray-100 rounded-full relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                </Link>
                <Link href="/dashboard" className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-1">
                  <div className="user-avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden lg:inline">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/login" className="text-gray-600 hover:text-primary-600 font-medium text-xs sm:text-sm">
                  Login
                </Link>
                <Link href="/register" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium text-xs sm:text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Location Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowLocationModal(false)}></div>
            <div className="relative w-full max-w-4xl mx-auto mt-20 bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Select Location</h3>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="flex max-h-96">
                <div className="w-1/2 border-r border-gray-100 overflow-y-auto p-2">
                  <button
                    onClick={() => handleLocationSelect(null)}
                    className={`w-full p-3 rounded-xl text-left hover:bg-gray-50 ${!tempSelectedState ? 'bg-primary-50 border border-primary-200' : ''}`}
                  >
                    <span className="font-medium text-gray-900">All Nigeria</span>
                  </button>
                  {apiLocations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleLocationSelect(location)}
                      className={`w-full p-3 rounded-xl text-left hover:bg-gray-50 ${tempSelectedState?.id === location.id ? 'bg-primary-50 border border-primary-200' : ''}`}
                    >
                      <span className="font-medium text-gray-900">{location.name}</span>
                    </button>
                  ))}
                </div>
                
                <div className="w-1/2 overflow-y-auto p-2 bg-white">
                  {tempSelectedState ? (
                    <>
                      <button
                        onClick={() => setTempSelectedLGA(null)}
                        className={`w-full p-3 rounded-xl text-left hover:bg-gray-50 ${!tempSelectedLGA ? 'bg-primary-50 border border-primary-200' : ''}`}
                      >
                        <span className="text-gray-700">All areas in {tempSelectedState.name}</span>
                      </button>
                      {tempSelectedState.children?.map((lga) => (
                        <button
                          key={lga.slug}
                          onClick={() => setTempSelectedLGA(lga.name)}
                          className={`w-full p-3 rounded-xl text-left hover:bg-gray-50 ${tempSelectedLGA === lga.name ? 'bg-primary-50 border border-primary-200' : ''}`}
                        >
                          <span className={`font-medium ${tempSelectedLGA === lga.name ? 'text-primary-600' : 'text-gray-700'}`}>
                            {lga.name}
                          </span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 p-8">
                      <p className="text-sm">Select a state to see areas</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border-t border-gray-100">
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={applyLocationSelection}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}