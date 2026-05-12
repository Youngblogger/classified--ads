'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, User } from 'lucide-react';
import { useGlobalStore, useAuthStore, useUIStore } from '@/lib/store';
import Image from 'next/image';

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
  const { isAuthenticated, user } = useAuthStore();
  const { selectedLocation } = useGlobalStore();
  const { toggleLocationModal, toggleLoginModal } = useUIStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  
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

  const handleCategoryClick = (slug: string) => {
    router.push(`/ads?category=${slug}`);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] w-full bg-gradient-to-r from-primary-600 to-primary-700 shadow-md">
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

          {/* Profile / Login */}
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center">
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
            </Link>
          ) : (
            <button
              onClick={() => toggleLoginModal()}
              className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 transition-colors text-white"
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Login</span>
            </button>
          )}
        </div>
      </header>

      {/* Search Bar Below Header */}
      <div className="fixed top-14 left-0 right-0 z-[99] bg-gradient-to-r from-primary-600 to-primary-700 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Location Selector */}
          <button
            onClick={openLocationModal}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-white" />
            <span className="text-xs text-white font-medium max-w-[70px] truncate capitalize">
              {locationDisplay.toLowerCase()}
            </span>
          </button>

          {/* Search Bar */}
          <div ref={searchRef} className="flex-1 min-w-0">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-full text-[13px] border-0 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header + search */}
      <div className="h-[6.5rem]" />

      {/* Category Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex flex-wrap gap-2 px-3 py-3">
          {CATEGORIES.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleCategoryClick(category.slug)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              <span className="text-sm leading-none">{getCategoryEmoji(category.slug, category.name)}</span>
              <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
