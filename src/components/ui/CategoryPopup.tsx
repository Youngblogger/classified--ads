'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { Category } from '@/types';
import { categoriesApi } from '@/lib/api'; 

interface CategoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryPopup({ isOpen, onClose }: CategoryPopupProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Category[]>([]);
  const popupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(null);
      setSearchQuery('');
      if (categories.length === 0) {
        setLoading(true);
        const fetchCategories = async () => {
          try {
            const data = await categoriesApi.getAll();
            const categoriesArray = (data.data as any)?.data ?? [];
            setCategories(categoriesArray);
            setFilteredCategories(categoriesArray);
          } catch (error) {
            console.error('Failed to fetch categories:', error);
          } finally {
            setLoading(false);
          }
        };
        fetchCategories();
      } else {
        setFilteredCategories(categories);
      }
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const getSubcategories = useCallback((parentId: number): Category[] => {
    const parent = categories.find(c => c.id === parentId);
    if (parent?.children && parent.children.length > 0) {
      return parent.children;
    }
    if ((parent as any)?.subcategories && (parent as any).subcategories.length > 0) {
      return (parent as any).subcategories;
    }
    return categories.filter(c => c.parent_id === parentId);
  }, [categories]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
      setFilteredSubcategories([]);
    } else {
      const query = searchQuery.toLowerCase();
      
      if (selectedCategory) {
        const subs = getSubcategories(selectedCategory.id);
        const filtered = subs.filter(sub => 
          sub.name.toLowerCase().includes(query) || 
          sub.slug.toLowerCase().includes(query)
        );
        setFilteredSubcategories(filtered);
      }
      
      const filtered = categories.filter(cat => 
        cat.name.toLowerCase().includes(query) || 
        cat.slug.toLowerCase().includes(query)
      );
      setFilteredCategories(filtered);
      
      if (filtered.length === 1 && filtered[0].children && filtered[0].children.length > 0) {
        setSelectedCategory(filtered[0]);
      }
    }
  }, [searchQuery, categories, selectedCategory, getSubcategories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const mainCategories = filteredCategories.filter(c => !c.parent_id || (c.children && c.children.length > 0 && !c.parent_id));
  
  const popularOrder: Record<string, number> = {
    'vehicles': 1,
    'property': 2,
    'mobile-phones': 3,
    'electronics': 4,
    'fashion': 5,
    'home-furniture': 6,
    'jobs': 7,
    'services': 8,
    'pets': 9,
    'health-beauty': 10,
    'baby-kids': 11,
    'sports': 12,
  };
  
  const sortedCategories = [...mainCategories].sort((a, b) => {
    const orderA = popularOrder[a.slug] ?? 999;
    const orderB = popularOrder[b.slug] ?? 999;
    return orderA - orderB;
  });

  const getCategoryIcon = (slug: string, icon?: string) => {
    if (icon) return icon;
    return '📁';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:justify-center pt-0 md:pt-16">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Popup */}
      <div 
        ref={popupRef}
        className="relative bg-white rounded-none md:rounded-2xl shadow-2xl w-full md:w-[95%] md:max-w-5xl h-full md:h-auto md:max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">All Categories</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 md:px-6 py-3 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-gray-500 mt-2">
              {filteredCategories.length} results for &quot;{searchQuery}&quot;
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row max-h-[calc(100vh-80px)] md:max-h-[calc(80vh-80px)]">
          {/* Categories List */}
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 overflow-y-auto max-h-[35vh] md:max-h-none">
            {loading ? (
              <div className="py-4 px-4 space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg animate-pulse">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-2">
                {sortedCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 text-left transition-all ${
                      selectedCategory?.id === category.id 
                        ? 'bg-white border-l-4 border-l-primary-600 shadow-sm' 
                        : 'hover:bg-white hover:shadow-sm border-l-4 border-l-transparent'
                    }`}
                  >
                    <span className="text-xl">{getCategoryIcon(category.slug, category.icon)}</span>
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <svg 
                      className="w-4 h-4 ml-auto text-gray-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subcategories Panel */}
          <div className="w-full md:w-2/3 overflow-y-auto bg-white">
            {selectedCategory ? (
              <div className="p-6 animate-in slide-in-from-right-4 duration-200 fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{getCategoryIcon(selectedCategory.slug, selectedCategory.icon)}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedCategory.name}</h3>
                    <p className="text-sm text-gray-500">
                      {getSubcategories(selectedCategory.id).length} subcategories
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(searchQuery.trim() !== '' ? filteredSubcategories : getSubcategories(selectedCategory.id)).map((sub: Category, index: number) => (
                    <Link
                      key={sub.id}
                      href={`/category/${selectedCategory.slug}/${sub.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-primary-50 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all group animate-in slide-in-from-right-4 duration-200"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <span className="text-gray-700 group-hover:text-primary-700 font-medium">
                        {sub.name}
                      </span>
                    </Link>
                  ))}
                  {searchQuery.trim() !== '' && filteredSubcategories.length === 0 && (
                    <p className="col-span-2 text-center text-gray-500 py-4">No subcategories found for &quot;{searchQuery}&quot;</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link
                    href={`/category/${selectedCategory.slug}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View all {selectedCategory.name}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                <div className="text-6xl mb-4 animate-bounce">📋</div>
                <p className="text-gray-500">Select a category to see subcategories</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
