'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { useGlobalStore, useAuthStore, useUIStore } from '@/lib/store';

export default function MobileHeader() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { selectedLocation, setSelectedLocation } = useGlobalStore();
  const { toggleLocationModal } = useUIStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  
  const locationDisplay = selectedLocation 
    ? selectedLocation.lga 
      ? `${selectedLocation.lga}, ${selectedLocation.name}`
      : selectedLocation.name
    : 'All Nigeria';

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

  const openLocationModal = () => {
    toggleLocationModal();
  };

  return (
    <header className="w-full bg-gradient-to-r from-primary-600 to-primary-700">
      <div className="flex items-center justify-between h-14 px-3 gap-2">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex-shrink-0 flex items-center gap-0.5"
        >
          <span className="text-base font-bold text-white">i</span>
          <span className="text-base font-bold text-white">List</span>
        </Link>

        {/* Location Selector */}
        <button
          onClick={openLocationModal}
          className="flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <MapPin className="w-4 h-4 text-white" />
          <span className="text-[10px] text-white font-medium max-w-[60px] sm:max-w-[80px] truncate">
            {locationDisplay}
          </span>
        </button>

        {/* Search Bar */}
        <div ref={searchRef} className="flex-1 min-w-0">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-8 pr-3 py-1.5 bg-white rounded-full text-sm border-0 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-400"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
