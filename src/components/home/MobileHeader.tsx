'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, LogOut, User, ChevronDown } from 'lucide-react';
import { useGlobalStore, useUIStore, useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

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
  'gaming': '🎮',
  'shopping': '🛒',
  'food': '🍽️', 'catering': '🍽️',
  'music': '🎵', 'entertainment': '🎭',
  'travel': '✈️',
  'construction': '🏗️', 'art': '🎨', 'art-collectibles': '🎨',
  'transport': '🚚', 'logistics': '🚚',
  'medical': '🏥', 'healthcare': '🏥',
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
  { slug: 'mobile-phones-tablets', name: 'Mobile Phones & Tablets' },
  { slug: 'property', name: 'Property' },
  { slug: 'electronics', name: 'Electronics' },
  { slug: 'fashion', name: 'Fashion' },
  { slug: 'home-furniture', name: 'Home, Furniture & Appliances' },
  { slug: 'services', name: 'Services' },
  { slug: 'repair-services', name: 'Repairs' },
  { slug: 'health-beauty', name: 'Health & Beauty' },
  { slug: 'sports-fitness', name: 'Sports & Fitness' },
  { slug: 'babies-kids', name: 'Babies & Kids' },
  { slug: 'jobs', name: 'Jobs' },
];

export default function MobileHeader() {
  const router = useRouter();
  const { selectedLocation } = useGlobalStore();
  const { toggleLocationModal } = useUIStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  
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
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchQuery('');
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
    }
    
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

  const openLocationModal = () => {
    toggleLocationModal();
  };

  const handleCategoryClick = (slug: string) => {
    router.push(`/ads?category=${slug}`);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-primary-600 to-primary-700 shadow-md">
        {/* Logo Bar */}
        <div className="flex items-center justify-between h-14 px-3">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex-shrink-0 flex items-center gap-1"
          >
            <img 
              src="/icons/iList-white.png" 
              alt="iList" 
              width={96}
              height={32}
              className="h-8 w-auto"
            />
          </Link>

          {/* Profile Image with Dropdown */}
          {isAuthenticated && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1 p-1 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center ring-2 ring-white/30">
                  {(() => {
                    const avatarUrl = user?.full_avatar_url || user?.avatar_url || user?.avatar || user?.google_avatar || user?.facebook_avatar;
                    return avatarUrl ? (
                      <img
                        src={avatarUrl.startsWith('http') ? avatarUrl : `http://127.0.0.1:8000${avatarUrl.startsWith('/') ? '' : '/storage/'}${avatarUrl}`}
                        alt={user?.name || 'User'}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-primary-600 font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    );
                  })()}
                </div>
                <ChevronDown className={`w-3 h-3 text-white transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-dropdown border border-slate-100 animate-fade-in z-[9999] overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      My Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Bar Below Header */}
        <div className="px-4 pt-2.5 pb-2">
          <div className="text-center mb-2">
            <p className="text-white text-sm sm:text-base font-bold tracking-wide">
              What are you looking for today?
            </p>
            <p className="text-primary-200 text-[10px] sm:text-xs font-medium mt-0.5">
              Search from thousands of ads near you
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Location Selector */}
            <button
              onClick={openLocationModal}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <MapPin className="w-3 h-3 text-white" />
              <span className="text-[10px] text-white font-medium max-w-[60px] truncate capitalize">
                {locationDisplay.toLowerCase()}
              </span>
            </button>

            {/* Search Bar */}
            <div ref={searchRef} className="flex-1 min-w-0">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search for anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-8 pr-3 py-1.5 bg-white rounded-full text-[12px] border-0 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header + search */}
      <div className="h-[9.5rem]" />

      {/* Category Section - OLX/Jiji Style */}
      <div className="bg-white border-b border-gray-200">
        <div className="grid grid-cols-4 gap-y-1">
          {CATEGORIES.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleCategoryClick(category.slug)}
              className="flex flex-col items-center gap-0.5 py-2.5 px-1 hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl leading-none">{getCategoryEmoji(category.slug, category.name)}</span>
              <span className="text-[10px] text-gray-700 font-medium text-center leading-tight">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
