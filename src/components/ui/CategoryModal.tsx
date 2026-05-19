'use client';

import { useState } from 'react';
import { X, ChevronRight, Loader2, Search } from 'lucide-react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  parent_id?: number | null;
  children_count?: number;
  children?: Category[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

const iconEmojis: Record<string, string> = {
  'smartphone': '📱', 'phone': '📱', 'mobile': '📱',
  'telecommunications': '📱', 'mobile-phones': '📱',
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

function getCategoryIcon(slug?: string, name?: string): string {
  if (!slug && !name) return '📁';
  const slugKey = slug?.toLowerCase().replace(/[^a-z0-9]/g, '-');
  if (slugKey && iconEmojis[slugKey]) return iconEmojis[slugKey];
  const nameKey = name?.toLowerCase().split(' ')[0];
  if (nameKey && iconEmojis[nameKey]) return iconEmojis[nameKey];
  return '📁';
}

const colorMap: Record<string, { bg: string }> = {
  'blue': { bg: 'bg-blue-100' },
  'emerald': { bg: 'bg-emerald-100' },
  'purple': { bg: 'bg-purple-100' },
  'amber': { bg: 'bg-amber-100' },
  'pink': { bg: 'bg-pink-100' },
  'cyan': { bg: 'bg-cyan-100' },
  'orange': { bg: 'bg-orange-100' },
  'indigo': { bg: 'bg-indigo-100' },
  'rose': { bg: 'bg-rose-100' },
  'green': { bg: 'bg-green-100' },
  'yellow': { bg: 'bg-yellow-100' },
  'slate': { bg: 'bg-slate-100' },
  'lime': { bg: 'bg-lime-100' },
  'violet': { bg: 'bg-violet-100' },
  'red': { bg: 'bg-red-100' },
  'fuchsia': { bg: 'bg-fuchsia-100' },
};

function getCategoryColor(name: string) {
  const nameLower = name.toLowerCase();
  let colorKey = 'slate';
  
  if (nameLower.includes('phone') || nameLower.includes('mobile')) colorKey = 'blue';
  else if (nameLower.includes('vehicle') || nameLower.includes('car')) colorKey = 'emerald';
  else if (nameLower.includes('property') || nameLower.includes('estate')) colorKey = 'purple';
  else if (nameLower.includes('electronic') || nameLower.includes('computer')) colorKey = 'amber';
  else if (nameLower.includes('fashion') || nameLower.includes('clothing')) colorKey = 'pink';
  else if (nameLower.includes('service')) colorKey = 'cyan';
  else if (nameLower.includes('furniture')) colorKey = 'orange';
  else if (nameLower.includes('repair')) colorKey = 'indigo';
  else if (nameLower.includes('baby') || nameLower.includes('kid')) colorKey = 'yellow';
  else if (nameLower.includes('sport') || nameLower.includes('fitness')) colorKey = 'green';
  else if (nameLower.includes('pet')) colorKey = 'lime';
  else if (nameLower.includes('health') || nameLower.includes('beauty')) colorKey = 'rose';
  else if (nameLower.includes('book') || nameLower.includes('education')) colorKey = 'violet';
  else if (nameLower.includes('food') || nameLower.includes('catering')) colorKey = 'red';
  else if (nameLower.includes('music') || nameLower.includes('art')) colorKey = 'fuchsia';
  
  return colorMap[colorKey];
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory?: string;
}

export default function CategoryModal({ isOpen, onClose, selectedCategory }: CategoryModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParentCategory, setSelectedParentCategory] = useState<Category | null>(null);

  const { data, error, isLoading } = useSWR(
    `${API_URL}/categories`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const categories: Category[] = data?.data || [];

  // Filter parent categories
  const parentCategories = categories.filter(c => !c.parent_id);

  // Filter by search
  const filteredCategories = parentCategories.filter(c => 
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get subcategories for selected parent
  const subcategories = selectedParentCategory?.children || 
    categories.filter(c => c.parent_id === selectedParentCategory?.id);

  const handleCategoryClick = (category: Category) => {
    // Check if this category has children (subcategories)
    const hasChildren = categories.some(c => c.parent_id === category.id) || 
                        (category.children && category.children.length > 0);
    
    if (hasChildren) {
      setSelectedParentCategory(category);
    } else {
      // No children, go directly to ads
      router.push(`/ads?category=${category.slug}`);
      onClose();
    }
  };

  const handleSubcategoryClick = (slug: string) => {
    router.push(`/ads?category=${slug}`);
    onClose();
  };

  const handleAllAds = () => {
    router.push('/ads');
    onClose();
  };

  const handleBack = () => {
    setSelectedParentCategory(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[-1]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[200] flex flex-col justify-start md:justify-center md:items-center">
        <div 
          className="bg-white w-full rounded-b-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '85vh', marginTop: '100px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle - Mobile only */}
          <div className="flex justify-center pt-2 pb-1 md:hidden">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {selectedParentCategory && (
                <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded-lg -ml-1">
                  <ChevronRight className="w-4 h-4 text-gray-600 rotate-180" />
                </button>
              )}
              <h2 className="text-base font-semibold text-gray-900">
                {selectedParentCategory ? selectedParentCategory.name : 'All Categories'}
              </h2>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Search - Only show on main categories */}
          {!selectedParentCategory && (
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                <span className="ml-2 text-gray-500 text-sm">Loading...</span>
              </div>
            ) : selectedParentCategory ? (
              // Show subcategories
              subcategories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-3">No subcategories available</p>
                  <button
                    onClick={() => {
                      router.push(`/ads?category=${selectedParentCategory.slug}`);
                      onClose();
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium"
                  >
                    View all in {selectedParentCategory.name}
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Back to categories */}
                  <button
                    onClick={handleBack}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-gray-600 rotate-180" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">All Categories</span>
                  </button>
                  
                  {subcategories.map((subcat) => {
                    const emoji = getCategoryIcon(subcat.slug, subcat.name);
                    return (
                    <button
                      key={subcat.id}
                      onClick={() => handleSubcategoryClick(subcat.slug)}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                          {emoji}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{subcat.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  )})}
                </div>
              )
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No categories found
              </div>
            ) : (
              // Show main categories
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {/* All Ads Button */}
                <button
                  onClick={handleAllAds}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                    !selectedCategory 
                      ? 'bg-primary-50 border-primary-200' 
                      : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    !selectedCategory ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    📋
                  </div>
                  <span className="text-[11px] font-medium text-gray-900 text-center leading-tight">All Ads</span>
                </button>

                {filteredCategories.map((category) => {
                  const emoji = getCategoryIcon(category.slug, category.name);
                  const colors = getCategoryColor(category.name);
                  const isSelected = selectedCategory === category.slug;
                  const hasChildren = categories.some(c => c.parent_id === category.id);

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                        isSelected 
                          ? 'bg-primary-50 border-primary-200' 
                          : 'bg-white border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center relative text-xl ${
                        isSelected ? 'bg-primary-100' : colors.bg
                      }`}>
                        {emoji}
                        {hasChildren && (
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary-500 rounded-full flex items-center justify-center">
                            <span className="text-[6px] text-white">▼</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-gray-900 text-center leading-tight line-clamp-2">
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
