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
  const [isSearching, setIsSearching] = useState(false);
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
    <header className="mobile-header md:hidden w-full" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}>
      <div className="flex items-center justify-between h-14 px-[15px] gap-2 md:gap-3">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-1">
          <span className="text-lg font-bold text-white">i</span>
          <span className="text-lg font-bold text-white">List</span>
        </Link>

        {/* Location Selector */}
        <button
          onClick={openLocationModal}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <MapPin className="w-4 h-4 text-white" />
          <span className="text-xs text-white font-medium max-w-[80px] truncate">
            {locationDisplay}
          </span>
        </button>

        {/* Search Bar */}
        <div ref={searchRef} className="flex-1 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-full text-sm border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
