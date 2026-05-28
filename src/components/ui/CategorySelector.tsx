'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, ChevronRight, ChevronLeft, X, Check, Loader2, Package } from 'lucide-react';
import { getCategoryIcon } from '@/lib/categoryIcons';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  children?: Category[];
}

interface CategorySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (categoryId: number, categoryName: string, breadcrumb: string) => void;
  selectedCategoryId?: number | null;
  selectedBreadcrumb?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function DefaultIcon({ className }: { className?: string }) {
  return <Package className={className || 'w-5 h-5'} />;
}

function getIcon(iconName?: string, className: string = 'w-5 h-5') {
  const IconComp = getCategoryIcon(iconName || '');
  return <IconComp className={className} />;
}

type Level = 'main' | 'sub' | 'child';



export default function CategorySelector({ isOpen, onClose, onSelect, selectedCategoryId, selectedBreadcrumb }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLevel, setCurrentLevel] = useState<Level>('main');
  const [selectedMainCategory, setSelectedMainCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const resetState = useCallback(() => {
    setSearchQuery('');
    setCurrentLevel('main');
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      if (data.success && data.data) {
        const cats = data.data.filter((c: any) => !c.parent_id);
        if (cats.length > 0) {
          setCategories(cats);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories from API:', error);
    }
    setCategories([]);
    setLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      resetState();
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, fetchCategories, resetState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const getCurrentCategories = useMemo(() => {
    if (currentLevel === 'main') {
      return categories;
    } else if (currentLevel === 'sub' && selectedMainCategory) {
      return selectedMainCategory.children || [];
    } else if (currentLevel === 'child' && selectedSubCategory) {
      return selectedSubCategory.children || [];
    }
    return [];
  }, [currentLevel, categories, selectedMainCategory, selectedSubCategory]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return getCurrentCategories;
    const query = searchQuery.toLowerCase();
    
    const filterRecursive = (cats: Category[]): Category[] => {
      return cats.reduce((acc: Category[], cat) => {
        const nameMatch = cat.name.toLowerCase().includes(query);
        const children = cat.children ? filterRecursive(cat.children) : [];
        if (nameMatch || children.length > 0) {
          acc.push({ ...cat, children: nameMatch ? cat.children : children });
        }
        return acc;
      }, []);
    };
    
    if (currentLevel === 'main') {
      return filterRecursive(categories);
    }
    return getCurrentCategories.filter(cat => cat.name.toLowerCase().includes(query));
  }, [getCurrentCategories, searchQuery, currentLevel, categories]);

  const handleMainCategoryClick = (category: Category) => {
    if (category.children && category.children.length > 0) {
      setSelectedMainCategory(category);
      setCurrentLevel('sub');
      setSearchQuery('');
    } else {
      handleSelect(category, null, null);
    }
  };

  const handleSubCategoryClick = (subCategory: Category) => {
    if (selectedMainCategory) {
      if (subCategory.children && subCategory.children.length > 0) {
        setSelectedSubCategory(subCategory);
        setCurrentLevel('child');
        setSearchQuery('');
      } else {
        handleSelect(subCategory, selectedMainCategory, null);
      }
    }
  };

  const handleChildCategoryClick = (childCategory: Category) => {
    if (selectedMainCategory && selectedSubCategory) {
      handleSelect(childCategory, selectedMainCategory, selectedSubCategory);
    }
  };

  const handleSelect = (category: Category, parent: Category | null, grandparent: Category | null) => {
    let breadcrumb = category.name;
    if (parent) {
      breadcrumb = `${parent.name} > ${category.name}`;
    }
    if (grandparent) {
      breadcrumb = `${grandparent.name} > ${parent!.name} > ${category.name}`;
    }
    onSelect(category.id, category.name, breadcrumb);
    onClose();
  };

  const handleBack = () => {
    if (currentLevel === 'child') {
      setCurrentLevel('sub');
      setSelectedSubCategory(null);
    } else if (currentLevel === 'sub') {
      setCurrentLevel('main');
      setSelectedMainCategory(null);
    }
    setSearchQuery('');
  };

  const handleBackToSub = () => {
    setCurrentLevel('sub');
    setSelectedSubCategory(null);
    setSearchQuery('');
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getLevelTitle = () => {
    switch (currentLevel) {
      case 'main': return 'Select Category';
      case 'sub': return selectedMainCategory?.name || 'Subcategory';
      case 'child': return selectedSubCategory?.name || 'Child Category';
    }
  };

  const getBreadcrumbDisplay = () => {
    if (!selectedBreadcrumb) return '';
    if (currentLevel === 'child' && selectedMainCategory && selectedSubCategory) {
      return `${selectedMainCategory.name} > ${selectedSubCategory.name}`;
    }
    if (currentLevel === 'sub' && selectedMainCategory) {
      return selectedMainCategory.name;
    }
    return selectedBreadcrumb;
  };

  const getCategoryCount = () => {
    switch (currentLevel) {
      case 'main': return `${filteredCategories.length} categories`;
      case 'sub': return `${filteredCategories.length} subcategories`;
      case 'child': return `${filteredCategories.length} child categories`;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4"
      onClick={handleOutsideClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(currentLevel === 'sub' || currentLevel === 'child') && (
                <button 
                  onClick={currentLevel === 'child' ? handleBackToSub : handleBack}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h3 id="category-modal-title" className="font-semibold text-lg">
                  {getLevelTitle()}
                </h3>
                {getBreadcrumbDisplay() && (
                  <p className="text-sm text-white/80 truncate max-w-[200px]">{getBreadcrumbDisplay()}</p>
                )}
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={currentLevel === 'main' ? 'Search categories...' : `Search ${getLevelTitle().toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-colors"
              aria-label="Search categories"
            />
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {(currentLevel === 'sub' || currentLevel === 'child') && (
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2 text-sm flex-wrap">
            <button 
              onClick={handleBack}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              All Categories
            </button>
            {currentLevel === 'sub' && selectedMainCategory && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{selectedMainCategory.name}</span>
              </>
            )}
            {currentLevel === 'child' && selectedMainCategory && selectedSubCategory && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <button 
                  onClick={handleBackToSub}
                  className="text-primary-600 hover:text-primary-700"
                >
                  {selectedMainCategory.name}
                </button>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{selectedSubCategory.name}</span>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2" role="listbox">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No categories found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-1">
              {currentLevel === 'main' && filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleMainCategoryClick(category)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                  role="option"
                  aria-selected={selectedCategoryId === category.id}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    {getIcon(category.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900 block truncate">{category.name}</span>
                    {category.children && category.children.length > 0 && (
                      <span className="text-sm text-gray-400">
                        {category.children.length} subcategories
                      </span>
                    )}
                  </div>
                  {category.children && category.children.length > 0 && (
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                  )}
                </button>
              ))}

              {currentLevel === 'sub' && (
                <>
                  {selectedMainCategory && (
                    <button
                      onClick={() => handleSelect(selectedMainCategory, null, null)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors text-left mb-2"
                      role="option"
                      aria-selected={selectedCategoryId === selectedMainCategory?.id}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                        {getIcon(selectedMainCategory.icon)}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-primary-700">{selectedMainCategory.name}</span>
                        <span className="text-sm text-primary-600 ml-2">(Select this category)</span>
                      </div>
                      <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    </button>
                  )}
                  
                  <div className="border-t my-2"></div>
                  
                  <p className="px-4 py-2 text-sm text-gray-500 font-medium">Subcategories</p>
                  
                  {filteredCategories.map((subCategory) => (
                    <button
                      key={subCategory.id}
                      onClick={() => handleSubCategoryClick(subCategory)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left ${
                        selectedCategoryId === subCategory.id ? 'bg-primary-50 border border-primary-200' : ''
                      }`}
                      role="option"
                      aria-selected={selectedCategoryId === subCategory.id}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                        {getIcon(subCategory.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900 block truncate">{subCategory.name}</span>
                        {subCategory.children && subCategory.children.length > 0 && (
                          <span className="text-sm text-gray-400">
                            {subCategory.children.length} child categories
                          </span>
                        )}
                      </div>
                      {subCategory.children && subCategory.children.length > 0 ? (
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : selectedCategoryId === subCategory.id ? (
                        <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      ) : null}
                    </button>
                  ))}
                </>
              )}

              {currentLevel === 'child' && selectedMainCategory && selectedSubCategory && (
                <>
                  <button
                    onClick={() => handleSelect(selectedSubCategory, selectedMainCategory, null)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors text-left mb-2"
                    role="option"
                    aria-selected={selectedCategoryId === selectedSubCategory?.id}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                      {getIcon(selectedSubCategory.icon)}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-primary-700">{selectedSubCategory.name}</span>
                      <span className="text-sm text-primary-600 ml-2">(Select this category)</span>
                    </div>
                    <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  </button>
                  
                  <div className="border-t my-2"></div>
                  
                  <p className="px-4 py-2 text-sm text-gray-500 font-medium">Child Categories</p>
                  
                  {filteredCategories.map((childCategory) => (
                    <button
                      key={childCategory.id}
                      onClick={() => handleChildCategoryClick(childCategory)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left ${
                        selectedCategoryId === childCategory.id ? 'bg-primary-50 border border-primary-200' : ''
                      }`}
                      role="option"
                      aria-selected={selectedCategoryId === childCategory.id}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                        {getIcon(childCategory.icon)}
                      </div>
                      <span className="flex-1 font-medium text-gray-900 truncate">{childCategory.name}</span>
                      {selectedCategoryId === childCategory.id && (
                        <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {getCategoryCount()}
            </span>
            {selectedBreadcrumb && (
              <span className="text-primary-600 font-medium truncate max-w-[200px]">{selectedBreadcrumb}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
