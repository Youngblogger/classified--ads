'use client';

import Link from 'next/link';
import { Category } from '@/types';
import { useState } from 'react';
import CategoryPopup from './CategoryPopup';

interface CategoryNavProps {
  categories: Category[];
}

// Map of category slugs to emoji icons as fallback
const categoryIcons: Record<string, string> = {
  'electronics': '📱',
  'computers-laptops': '💻',
  'vehicles': '🚗',
  'property': '🏠',
  'jobs': '💼',
  'fashion': '👕',
  'phones-accessories': '📞',
  'home-furniture': '🛋️',
  'beauty-health': '💄',
  'babies-kids': '👶',
  'gaming': '🎮',
  'agriculture': '🌾',
  'services': '🔧',
  'industrial-equipment': '🏭',
  'education': '📚',
  'events-entertainment': '🎉',
  'food-catering': '🍽️',
  'logistics-delivery': '🚚',
  'freelance-remote-work': '💻',
  'sports-fitness': '🏋️',
  'music-instruments': '🎵',
  'pets-animals': '🐾',
  'repair-services': '🛠️',
  'travel-tourism': '✈️',
  'books-media': '📖',
  'office-products': '📎',
  'automotive': '🚙',
  'real-estate': '🏢',
  'agriculture-farming': '🌱',
  'music-entertainment': '🎧',
  'insurance-finance': '💰',
  'telecommunications': '📡',
  'security-safety': '🛡️',
  'art-collectibles': '🎨',
  'wedding-events': '💒',
  'religious-items': '✝️',
  'veterinary-pet-care': '🏥',
  'medical-healthcare': '⚕️',
  'legal-services': '⚖️',
  'media-advertising': '📢',
  'energy-utilities': '⚡',
  'construction-building': '🏗️',
  'hair-beauty': '💅',
  'printing-publishing': '🖨️',
  'car-rentals-transport': '🚌',
  'ngo-charity': '❤️',
  'wholesale-bulk': '📦',
  'movers-storage': '🏠',
  'catering-restaurants': '🍴',
  'photography-video': '📷',
  'cleaning-services': '🧹',
  'maintenance-services': '🔨',
  'import-export': '🚢',
  'wellness-spa': '🧖',
  'consulting-professional': '👔',
  'hobbies-interests': '🎯',
  'technology-it': '🤖',
  'fashion-style': '👔',
  'business-opportunities': '💡',
  'tools-equipment': '🔧',
  'wine-spirits': '🍷',
  'coffee-tea': '☕',
  'supermarkets-groceries': '🛒',
  'laundry-dry-cleaning': '👔',
  'petrol-gas': '⛽',
  'marine-boats': '⚓',
  'aviation-aerospace': '🛫',
  'mining-quarrying': '⛏️',
  'oil-gas': '🛢️',
  'textiles-fabrics': '🧵',
  'leather-goods': '👜',
  'packaging-labels': '📦',
  'chemicals-industrial': '🧪',
};

export default function CategoryNav({ categories }: CategoryNavProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  // Reorder categories to show popular ones first
  const popularOrder: Record<string, number> = {
    'mobile-phones-tablets': 1,
    'vehicles': 2,
    'property': 3,
    'electronics': 4,
    'fashion': 5,
    'jobs': 6,
    'services': 7,
    'home-furniture-appliances': 8,
    'agriculture-food': 9,
    'education': 10,
    'health-beauty': 11,
    'other': 12,
  };
  
  const mainCategories = categories
    .filter(c => !c.parent_id)
    .sort((a, b) => {
      const orderA = popularOrder[a.slug] ?? 999;
      const orderB = popularOrder[b.slug] ?? 999;
      return orderA - orderB;
    });

  const getCategoryIcon = (category: Category) => {
    // Use stored icon if it looks like an emoji (has non-ASCII characters)
    if (category.icon && /[^\u0000-\u007F]/.test(category.icon)) {
      return category.icon;
    }
    // Fallback to mapped icons based on slug
    return categoryIcons[category.slug] || '📁';
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100">
        <div className="container-app">
          {/* Search bar - only visible on mobile, under category cards */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex gap-1 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setIsPopupOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
            >
              <span className="text-lg">📋</span>
              <span>All Categories</span>
            </button>
            {mainCategories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <span className="text-lg">{getCategoryIcon(category)}</span>
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    <CategoryPopup 
      isOpen={isPopupOpen} 
      onClose={() => setIsPopupOpen(false)} 
    />
    </>
  );
}
