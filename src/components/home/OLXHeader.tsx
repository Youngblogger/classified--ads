'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, MapPin, Menu, X, ChevronDown, User, 
  Plus, Heart, MessageCircle, Settings, LogOut,
  LayoutDashboard, Package, Clock, Loader2, Check
} from 'lucide-react';
import { useAuthStore, useUIStore, useGlobalStore } from '@/lib/store';
import { nigeriaLocations, NigeriaLocation } from '@/lib/nigeriaLocations';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const RECENT_SEARCHES_KEY = 'olx_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export default function OLXHeader() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { toggleLoginModal, toggleRegisterModal } = useUIStore();
  const { selectedLocation } = useGlobalStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocationState, setSelectedLocationState] = useState<string>(selectedLocation?.name || 'All Nigeria');
  const [selectedLocationSlug, setSelectedLocationSlug] = useState<string | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
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
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
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
      router.push(`/ads?q=${encodeURIComponent(searchQuery)}${selectedLocationSlug ? `&location=${selectedLocationSlug}` : ''}`);
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

  const handleLocationSelect = (location: NigeriaLocation | null) => {
    if (location) {
      setSelectedLocationState(location.name);
      setSelectedLocationSlug(location.slug);
    } else {
      setSelectedLocationState('All Nigeria');
      setSelectedLocationSlug(null);
    }
    setShowLocationDropdown(false);
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
    setShowSearchDropdown(true);
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container-app">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">i</span>
                </div>
                <span className="text-xl font-bold text-dark hidden sm:block">iList</span>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="flex w-full">
                {/* Location Selector */}
                <div className="relative" ref={locationRef}>
                  <button
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-l-xl border-r border-gray-200 transition-colors min-w-[140px]"
                  >
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="flex-1 text-sm text-gray-700 truncate">{selectedLocationState}</span>
                    <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", showLocationDropdown && "rotate-180")} />
                  </button>
                  
                  {showLocationDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-dropdown border border-gray-100 z-50 max-h-[400px] overflow-hidden flex flex-col">
                      <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-500 px-2 py-1">SELECT LOCATION</p>
                      </div>
                      <div className="overflow-y-auto flex-1">
                        <button
                          onClick={() => handleLocationSelect(null)}
                          className={cn(
                            "w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors",
                            selectedLocationState === 'All Nigeria' && "bg-primary-50 text-primary-600"
                          )}
                        >
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium text-sm">All Nigeria</span>
                          {selectedLocationState === 'All Nigeria' && <Check className="w-4 h-4 ml-auto" />}
                        </button>
                        {nigeriaLocations.map((location) => (
                          <button
                            key={location.id}
                            onClick={() => handleLocationSelect(location)}
                            className={cn(
                              "w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors",
                              selectedLocationState === location.name && "bg-primary-50 text-primary-600"
                            )}
                          >
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="flex-1 text-sm">{location.name}</span>
                            {location.lgas && (
                              <span className="text-xs text-gray-400">{location.lgas.length} LGAs</span>
                            )}
                            {selectedLocationState === location.name && <Check className="w-4 h-4 ml-auto" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Input */}
                <div className="relative flex-1" ref={searchRef}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchDropdown(true);
                      }}
                      onFocus={() => setShowSearchDropdown(true)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Find cars, phones, properties and more..."
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-r-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                    )}
                  </div>
                  
                  {/* Search Dropdown */}
                  {showSearchDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-dropdown border border-gray-100 z-50 overflow-hidden">
                      <div className="max-h-[400px] overflow-y-auto">
                        {searchQuery.length >= 2 && searchResults ? (
                          <>
                            {/* Ads Results */}
                            {searchResults.ads?.length > 0 && (
                              <div className="p-2">
                                <p className="text-xs font-semibold text-gray-500 px-3 py-2">ADS</p>
                                {searchResults.ads.slice(0, 5).map((ad: any) => (
                                  <button
                                    key={ad.id}
                                    onClick={() => handleSearchResultClick('ad', ad)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                  >
                                    {ad.thumbnail ? (
                                      <img src={ad.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                    ) : (
                                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-5 h-5 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{ad.title}</p>
                                      <p className="text-xs text-primary-600">₦{ad.price?.toLocaleString()}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            {/* Categories Results */}
                            {searchResults.categories?.length > 0 && (
                              <div className="p-2 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 px-3 py-2">CATEGORIES</p>
                                {searchResults.categories.slice(0, 5).map((cat: any) => (
                                  <button
                                    key={cat.id}
                                    onClick={() => handleSearchResultClick('category', cat)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                  >
                                    <span className="text-xl">{cat.icon || '📦'}</span>
                                    <span className="text-sm text-gray-700">{cat.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            {/* No Results */}
                            {!searchResults.ads?.length && !searchResults.categories?.length && (
                              <div className="p-6 text-center text-gray-500">
                                <p className="text-sm">No results found for "{searchQuery}"</p>
                              </div>
                            )}
                          </>
                        ) : searchQuery.length < 2 ? (
                          /* Recent Searches */
                          <div className="p-2">
                            {recentSearches.length > 0 && (
                              <div className="mb-2">
                                <div className="flex items-center justify-between px-3 py-2">
                                  <p className="text-xs font-semibold text-gray-500">RECENT SEARCHES</p>
                                </div>
                                {recentSearches.map((term, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleRecentSearchClick(term)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                  >
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700 flex-1">{term}</span>
                                    <button
                                      onClick={(e) => removeRecentSearch(e, term)}
                                      className="p-1 hover:bg-gray-200 rounded"
                                    >
                                      <X className="w-3 h-3 text-gray-400" />
                                    </button>
                                  </button>
                                ))}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 px-3 py-2">POPULAR</p>
                              {['iPhone 15', 'Toyota Camry', 'Laptop', 'House for rent', 'Samsung Galaxy'].map((term) => (
                                <button
                                  key={term}
                                  onClick={() => {
                                    setSearchQuery(term);
                                    setShowSearchDropdown(true);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                >
                                  <Search className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-700">{term}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="ml-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Desktop Auth */}
              <div className="hidden md:flex items-center gap-1">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard/messages" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <MessageCircle className="w-5 h-5 text-gray-600" />
                    </Link>
                    <Link href="/dashboard/favorites" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </Link>
                    
                    {/* User Menu */}
                    <div className="relative ml-1" ref={userMenuRef}>
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                          {user?.google_avatar || user?.avatar || user?.avatar_url ? (
                            <img 
                              src={user.google_avatar || user.avatar || user.avatar_url} 
                              alt={user.name || 'User'} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-primary-600 font-semibold text-sm">
                              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                      </button>
                      
                      {showUserMenu && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-dropdown border border-gray-100 py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                          <Link href="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-dark">Dashboard</span>
                          </Link>
                          <Link href="/dashboard/my-ads" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-dark">My Ads</span>
                          </Link>
                          <Link href="/dashboard/favorites" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                            <Heart className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-dark">Favorites</span>
                          </Link>
                          <Link href="/dashboard/messages" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                            <MessageCircle className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-dark">Messages</span>
                          </Link>
                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <LogOut className="w-4 h-4 text-gray-500" />
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
                      className="px-4 py-2 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={toggleRegisterModal}
                      className="px-4 py-2 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>

              {/* Sell Button */}
              <Link
                href={isAuthenticated ? "/post-ad" : "/post-ad"}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-900 text-gray-900 rounded-full font-semibold hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Sell</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6 text-dark" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[60] bg-white">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2" onClick={() => setShowMobileMenu(false)}>
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">i</span>
              </div>
              <span className="text-xl font-bold text-dark">iList</span>
            </Link>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-dark" />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for anything..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* Mobile Location Selector */}
            <div className="relative mt-3" ref={locationRef}>
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center gap-2 w-full px-4 py-3 bg-gray-100 rounded-xl transition-colors"
              >
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="flex-1 text-left text-gray-700">{selectedLocationState}</span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              
              {showLocationDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-dropdown border border-gray-100 z-50 max-h-[300px] overflow-hidden">
                  <div className="overflow-y-auto">
                    <button
                      onClick={() => handleLocationSelect(null)}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100"
                    >
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">All Nigeria</span>
                    </button>
                    {nigeriaLocations.slice(0, 20).map((location) => (
                      <button
                        key={location.id}
                        onClick={() => handleLocationSelect(location)}
                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
                      >
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span>{location.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    toggleLoginModal();
                  }}
                  className="py-3 border-2 border-gray-200 rounded-xl font-semibold text-dark hover:border-gray-300 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    toggleRegisterModal();
                  }}
                  className="py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                    {user?.google_avatar || user?.avatar || user?.avatar_url ? (
                      <img 
                        src={user.google_avatar || user.avatar || user.avatar_url} 
                        alt={user.name || 'User'} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-primary-600 font-bold text-lg">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sell Button */}
            <Link
              href="/post-ad"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors mb-6"
            >
              <Plus className="w-5 h-5" />
              Post Your Ad
            </Link>

            {/* Navigation Links */}
            <nav className="space-y-1">
              <Link href="/" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-xl">🏠</span>
                <span className="font-medium">Home</span>
              </Link>
              <Link href="/ads" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-xl">📦</span>
                <span className="font-medium">All Categories</span>
              </Link>
              
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 my-3"></div>
                  <Link href="/dashboard" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <LayoutDashboard className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <Link href="/dashboard/my-ads" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <Package className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">My Ads</span>
                  </Link>
                  <Link href="/dashboard/favorites" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <Heart className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Favorites</span>
                  </Link>
                  <Link href="/dashboard/messages" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <MessageCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Messages</span>
                  </Link>
                </>
              )}
              
              <div className="border-t border-gray-200 my-3"></div>
              
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
