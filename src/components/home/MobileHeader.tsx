'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { useGlobalStore, useAuthStore, useUIStore } from '@/lib/store';
import CategoryModal from '@/components/ui/CategoryModal';

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
  const { isAuthenticated } = useAuthStore();
  const { selectedLocation, setSelectedLocation } = useGlobalStore();
  const { toggleLocationModal } = useUIStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
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
    setShowCategoryModal(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] w-full bg-gradient-to-r from-primary-600 to-primary-700 shadow-md">
      <div className="flex items-center justify-between h-14 px-3 gap-2">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex-shrink-0 flex items-center gap-1"
        >
          <div className="relative h-8 w-[96px]">
            <Image 
              src="/icons/iList-white.png" 
              alt="iList" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Location Selector */}
        <button
          onClick={openLocationModal}
          className="flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <MapPin className="w-3 h-3 text-white" />
          <span className="text-[10px] text-white font-medium max-w-[60px] sm:max-w-[80px] truncate capitalize">
            {locationDisplay.toLowerCase()}
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

      {/* Category Section */}
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-thin whitespace-nowrap">
          {CATEGORIES.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleCategoryClick(category.slug)}
              className="flex flex-col items-center gap-0.5 flex-shrink-0 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-base leading-none">{getCategoryEmoji(category.slug, category.name)}</span>
              <span className="text-[10px] text-gray-700 font-medium text-center max-w-[60px] truncate">
                {category.name}
              </span>
            </button>
          ))}
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex flex-col items-center gap-0.5 flex-shrink-0 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-base leading-none">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </span>
            <span className="text-[10px] text-gray-500 font-medium">See All</span>
          </button>
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal 
        isOpen={showCategoryModal} 
        onClose={() => setShowCategoryModal(false)} 
      />
    </header>
  );
}
