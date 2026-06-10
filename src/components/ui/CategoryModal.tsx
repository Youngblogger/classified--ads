'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CATEGORIES, type CategoryItem, type SubcategoryItem } from '@/config/categories';
import { searchCategories } from '@/lib/category-utils';
import { Search, ChevronLeft, ChevronRight, X, Clock, Car, Home, Smartphone, Monitor, Shirt, Sofa, Briefcase, Wrench, Dog, Heart, Baby, Trophy, Book, Coffee, Sprout } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Car, Home, Smartphone, Monitor, Shirt, Sofa, Briefcase, Wrench, Dog, Heart, Baby, Trophy, Book, Coffee, Sprout,
};

const RECENT_KEY = 'ilist_recent_categories';

function getRecentCategories(): Array<{ id: number; name: string; slug: string; parentSlug: string }> {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveRecentCategory(cat: { id: number; name: string; slug: string; parentSlug: string }) {
  try {
    const recent = getRecentCategories().filter(r => r.id !== cat.id).slice(0, 4);
    recent.unshift(cat);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {}
}

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: number, name: string, breadcrumb: string, slug: string, parentSlug?: string) => void;
  currentCategoryId?: number | string | null;
}

export default function CategoryModal({ isOpen, onClose, onSelect, currentCategoryId }: CategoryModalProps) {
  const [step, setStep] = useState<'main' | 'sub'>('main');
  const [selectedParent, setSelectedParent] = useState<CategoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('main');
      setSelectedParent(null);
      setSearchQuery('');
      setFocusedIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (step === 'sub' && !searchQuery) {
          setStep('main');
          setSelectedParent(null);
        } else {
          onClose();
        }
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, searchQuery, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    setFocusedIndex(0);
  }, [searchQuery, step, selectedParent]);

  const recentCategories = useMemo(() => getRecentCategories(), [isOpen]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchCategories(searchQuery);
  }, [searchQuery]);

  const handleSelectMain = (cat: CategoryItem) => {
    setSelectedParent(cat);
    setStep('sub');
    setSearchQuery('');
    setFocusedIndex(0);
  };

  const handleSelectSub = (sub: SubcategoryItem) => {
    if (!selectedParent) return;
    saveRecentCategory({ id: sub.id, name: sub.name, slug: sub.slug, parentSlug: selectedParent.slug });
    onSelect(sub.id, sub.name, `${selectedParent.name} > ${sub.name}`, sub.slug, selectedParent.slug);
    onClose();
  };

  const handleSearchSelect = (parent: CategoryItem, sub: SubcategoryItem) => {
    saveRecentCategory({ id: sub.id, name: sub.name, slug: sub.slug, parentSlug: parent.slug });
    onSelect(sub.id, sub.name, `${parent.name} > ${sub.name}`, sub.slug, parent.slug);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const items = searchResults
    ? searchResults.map(r => ({ ...r.sub, parent: r.parent }))
    : step === 'main'
    ? CATEGORIES
    : selectedParent?.children || [];

  const handleKeyNav = useCallback((e: React.KeyboardEvent) => {
    const count = Array.isArray(items) ? items.length : 0;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(i => Math.min(i + 1, count - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      const item = items[focusedIndex];
      if (!item) return;
      if (searchResults) {
        const r = searchResults[focusedIndex];
        if (r) handleSearchSelect(r.parent, r.sub);
      } else if (step === 'main') {
        handleSelectMain(item as CategoryItem);
      } else {
        handleSelectSub(item as SubcategoryItem);
      }
    }
  }, [items, focusedIndex, searchResults, step, selectedParent]);

  useEffect(() => {
    if (listRef.current && focusedIndex >= 0) {
      const el = listRef.current.children[focusedIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  if (!isOpen) return null;

  const CatIcon = selectedParent ? ICON_MAP[selectedParent.icon] : null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Select category"
    >
      <div className="fixed inset-0 bg-black/50 transition-opacity" />

      <div
        ref={modalRef}
        className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] sm:max-h-[70vh] flex flex-col animate-slide-up"
        onKeyDown={handleKeyNav}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            {step === 'sub' && !searchQuery && (
              <button
                onClick={() => { setStep('main'); setSelectedParent(null); }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to categories"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {searchQuery ? 'Search Results' : step === 'main' ? 'Choose a Category' : selectedParent?.name || 'Select Subcategory'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-4 py-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              aria-label="Search categories"
            />
          </div>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin" role="listbox" tabIndex={-1}>
          {searchQuery && searchResults && searchResults.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-sm">
              No categories found for &quot;{searchQuery}&quot;
            </div>
          )}

          {!searchQuery && step === 'main' && recentCategories.length > 0 && (
            <div className="px-2 pt-1 pb-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                <Clock className="w-3 h-3" />
                <span>Recent</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentCategories.map(rc => {
                  const cat = CATEGORIES.find(c => c.slug === rc.parentSlug);
                  const Icon = cat ? ICON_MAP[cat.icon] : null;
                  return (
                    <button
                      key={rc.id}
                      onClick={() => {
                        onSelect(rc.id, rc.name, getBreadcrumb(rc.slug), rc.slug, rc.parentSlug);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-600 rounded-full text-xs font-medium transition-colors border border-gray-100"
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {rc.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {searchResults
            ? searchResults.map((r, i) => (
                <button
                  key={`${r.parent.id}-${r.sub.id}`}
                  onClick={() => handleSearchSelect(r.parent, r.sub)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                    i === focusedIndex ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  role="option"
                  aria-selected={i === focusedIndex}
                >
                  <span className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-lg">
                    {ICON_MAP[r.parent.icon] ? (
                      (() => { const Icon = ICON_MAP[r.parent.icon]; return <Icon className="w-5 h-5 text-gray-600" />; })()
                    ) : '📦'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.sub.name}</div>
                    <div className="text-xs text-gray-400 truncate">{r.parent.name}</div>
                  </div>
                </button>
              ))
            : step === 'main'
            ? CATEGORIES.map((cat, i) => {
                const Icon = ICON_MAP[cat.icon];
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectMain(cat)}
                    className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-left transition-colors ${
                      i === focusedIndex ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    role="option"
                    aria-selected={i === focusedIndex}
                  >
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center shrink-0">
                      {Icon ? <Icon className="w-5 h-5 text-primary-600" /> : <span className="text-lg">📦</span>}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{cat.name}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </button>
                );
              })
            : selectedParent?.children.map((sub, i) => (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSub(sub)}
                  className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-left transition-colors ${
                    i === focusedIndex ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  role="option"
                  aria-selected={i === focusedIndex}
                >
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shrink-0">
                    {CatIcon ? <CatIcon className="w-5 h-5 text-gray-600" /> : <span className="text-lg">📄</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{sub.name}</div>
                  </div>
                </button>
              ))
          }
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (min-width: 640px) {
          .animate-slide-up {
            animation: fadeIn 0.15s ease-out;
          }
        }
        @media (max-width: 639px) {
          .animate-slide-up {
            animation: slideUp 0.25s ease-out;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function getBreadcrumb(slug: string): string {
  for (const cat of CATEGORIES) {
    const sub = cat.children.find(s => s.slug === slug);
    if (sub) return `${cat.name} > ${sub.name}`;
  }
  return slug;
}
