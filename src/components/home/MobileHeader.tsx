'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, X, Loader2 } from 'lucide-react';
import { useGlobalStore, useAuthStore } from '@/lib/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface ApiLocation {
  id: number;
  name: string;
  slug: string;
  children?: { name: string; slug: string }[];
}

export default function MobileHeader() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { selectedLocation, setSelectedLocation } = useGlobalStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempSelectedState, setTempSelectedState] = useState<ApiLocation | null>(null);
  const [tempSelectedLGA, setTempSelectedLGA] = useState<string | null>(null);
  const [apiLocations, setApiLocations] = useState<ApiLocation[]>([] as ApiLocation[]);
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
        if (data.data && Array.isArray(data.data)) {
          setApiLocations(data.data as any);
        }
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
      const locationName = tempSelectedLGA 
        ? `${tempSelectedState.name}, ${tempSelectedLGA}` 
        : tempSelectedState.name;
      
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

  return (
    <>
      <style jsx>{`
        .mobile-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }
        .search-input::placeholder {
          color: #9ca3af;
        }
        .location-btn:active {
          opacity: 0.7;
        }
        .search-btn:active {
          transform: scale(0.95);
        }
      `}</style>

      <header className="mobile-header md:hidden" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
        <div className="flex items-center justify-between h-14 px-3 md:px-4 gap-2 md:gap-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-1">
            <span className="text-xl font-bold text-white">i</span>
            <span className="text-xl font-bold text-white">List</span>
          </Link>

          {/* Location Selector - Icon only */}
          <button
            onClick={openLocationModal}
            className="location-btn flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
          >
            <MapPin className="w-5 h-5 text-white" />
          </button>

          {/* Search Bar */}
          <div className="flex-1 relative" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for anything..."
                className="search-input w-full pl-9 pr-20 py-2.5 bg-white rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-white text-sm"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-10 p-1"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              ) : (
                <button
                  onClick={handleSearch}
                  className="absolute right-2 p-1.5 bg-primary-600 rounded-full"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Location Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowLocationModal(false)}></div>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Select Location</h3>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Mobile: Vertical stack instead of side-by-side */}
              <div className="flex flex-col" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                {!tempSelectedState ? (
                  /* States List */
                  <div className="overflow-y-auto flex-1">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => handleLocationSelect(null)}
                        className={`w-full p-3 rounded-xl text-left hover:bg-gray-50 transition-colors ${
                          !tempSelectedState ? 'bg-primary-50 border border-primary-200' : ''
                        }`}
                      >
                        <span className="font-medium text-gray-900">All Nigeria</span>
                      </button>
                      {apiLocations.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => handleLocationSelect(location as any)}
                          className={`w-full p-3 rounded-xl text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                            tempSelectedState && (tempSelectedState as any).id === location.id ? 'bg-primary-50 border border-primary-200' : ''
                          }`}
                        >
                          <span className="font-medium text-gray-900">{location.name}</span>
                          {location.children && location.children.length > 0 && (
                            <span className="text-xs text-gray-400">{location.children.length} areas</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* LGA List - with back button */
                  <div className="overflow-y-auto flex-1">
                    <button
                      onClick={() => setTempSelectedState(null)}
                      className="w-full p-3 text-left text-primary-600 hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2"
                    >
                      ← Back to states
                    </button>
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setSelectedLocation({
                            name: tempSelectedState.name,
                            slug: tempSelectedState.slug,
                            lga: null
                          });
                          setShowLocationModal(false);
                        }}
                        className="w-full p-3 rounded-xl text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-700">All areas in {tempSelectedState.name}</span>
                      </button>
                      {tempSelectedState.children?.map((lga) => (
                        <button
                          key={lga.slug}
                          onClick={() => {
                            setSelectedLocation({
                              name: tempSelectedState.name,
                              slug: tempSelectedState.slug,
                              lga: lga.name
                            });
                            setShowLocationModal(false);
                          }}
                          className="w-full p-3 rounded-xl text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-700">{lga.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 border-t border-gray-100">
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}