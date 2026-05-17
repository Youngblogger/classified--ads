'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/config';
import useSWR from 'swr';

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  ad_count?: number;
  children?: Subcategory[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  ad_count?: number;
  children?: Subcategory[];
}

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((r) => (Array.isArray(r) ? r : r.data || []));

const fallbackCategories: Category[] = [
  { id: 1, name: 'Vehicles', slug: 'vehicles', ad_count: 1500 },
  { id: 2, name: 'Mobile Phones & Tablets', slug: 'mobile-phones-tablets', ad_count: 2300 },
  { id: 3, name: 'Property', slug: 'property', ad_count: 980 },
  { id: 4, name: 'Electronics', slug: 'electronics', ad_count: 1800 },
  { id: 5, name: 'Fashion', slug: 'fashion', ad_count: 1400 },
  { id: 6, name: 'Home, Furniture & Appliances', slug: 'home-furniture', ad_count: 760 },
  { id: 7, name: 'Services', slug: 'services', ad_count: 620 },
  { id: 8, name: 'Jobs', slug: 'jobs', ad_count: 760 },
  { id: 9, name: 'Health & Beauty', slug: 'health-beauty', ad_count: 540 },
  { id: 10, name: 'Sports & Outdoors', slug: 'sports-outdoors', ad_count: 380 },
  { id: 11, name: 'Baby & Kids', slug: 'baby-kids', ad_count: 420 },
  { id: 12, name: 'Pets', slug: 'pets', ad_count: 290 },
];

const CATEGORY_ICONS: Record<string, string> = {
  'cars': '\u{1F697}', 'vehicles': '\u{1F697}', 'auto': '\u{1F697}',
  'mobile-phones-tablets': '\u{1F4F1}', 'phones': '\u{1F4F1}', 'mobile': '\u{1F4F1}', 'tablets': '\u{1F4F1}',
  'property': '\u{1F3E0}', 'real-estate': '\u{1F3E0}', 'houses': '\u{1F3E0}', 'apartments': '\u{1F3E0}',
  'electronics': '\u{1F4BB}', 'computers': '\u{1F4BB}', 'laptops': '\u{1F4BB}', 'tv': '\u{1F4FA}',
  'fashion': '\u{1F455}', 'clothing': '\u{1F455}', 'shoes': '\u{1F45F}', 'accessories': '\u{1F48D}',
  'home-furniture': '\u{1F6CF}', 'furniture': '\u{1F6CF}', 'home': '\u{1F3E1}', 'garden': '\u{1F331}',
  'services': '\u{1F6E0}', 'repair': '\u{1F527}', 'maintenance': '\u{1F6E0}',
  'jobs': '\u{1F4BC}', 'employment': '\u{1F4BC}', 'career': '\u{1F4BC}',
  'health-beauty': '\u{1F484}', 'health': '\u{2764}\u{FE0F}', 'beauty': '\u{1F484}', 'spa': '\u{1F9D6}',
  'sports': '\u{26BD}', 'fitness': '\u{1F3CB}', 'gym': '\u{1F3CB}',
  'baby-kids': '\u{1F476}', 'baby': '\u{1F476}', 'kids': '\u{1F9D2}', 'children': '\u{1F9D2}',
  'agriculture': '\u{1F33E}', 'farming': '\u{1F33E}', 'farm': '\u{1F33E}',
  'food': '\u{1F354}', 'restaurant': '\u{1F373}', 'catering': '\u{1F372}',
  'music': '\u{1F3B5}', 'instruments': '\u{1F3B9}', 'entertainment': '\u{1F3AC}',
  'pets': '\u{1F436}', 'animals': '\u{1F436}',
  'books': '\u{1F4DA}', 'education': '\u{1F393}', 'training': '\u{1F393}',
  'business': '\u{1F4BC}', 'industrial': '\u{1F3ED}',
  'travel': '\u{2708}\u{FE0F}', 'tourism': '\u{1F30D}',
  'tools': '\u{1F527}', 'equipment': '\u{1F4BF}',
  'other': '\u{1F4E6}', 'general': '\u{1F4E6}',
};

function getIcon(slug?: string, name?: string): string {
  if (slug) {
    const lower = slug.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
      if (lower === key || lower.includes(key)) return icon;
    }
  }
  if (name) {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
      if (lower === key || lower.includes(key)) return icon;
    }
  }
  return '\u{1F4E6}';
}

const categoryBgColors: Record<string, string> = {
  phone: 'bg-blue-100', mobile: 'bg-blue-100',
  vehicle: 'bg-emerald-100', car: 'bg-emerald-100',
  property: 'bg-purple-100', real: 'bg-purple-100',
  electronic: 'bg-amber-100', computer: 'bg-amber-100',
  fashion: 'bg-pink-100',
  furniture: 'bg-orange-100',
  service: 'bg-cyan-100', repair: 'bg-indigo-100',
  job: 'bg-slate-100',
  health: 'bg-rose-100', beauty: 'bg-rose-100',
  sport: 'bg-green-100', fitness: 'bg-green-100',
  baby: 'bg-yellow-100', kid: 'bg-yellow-100',
  pet: 'bg-lime-100',
  agriculture: 'bg-lime-100', farm: 'bg-lime-100',
  book: 'bg-violet-100', education: 'bg-violet-100',
  food: 'bg-red-100',
  music: 'bg-fuchsia-100', art: 'bg-fuchsia-100',
};

function getCategoryBg(name?: string): string {
  if (!name) return 'bg-gray-100';
  const lower = name.toLowerCase();
  for (const [key, bg] of Object.entries(categoryBgColors)) {
    if (lower.includes(key)) return bg;
  }
  return 'bg-gray-100';
}

function formatCount(count?: number): string {
  if (count == null) return '';
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return count.toLocaleString();
}

function SidebarSkeleton() {
  const widths = ['65%', '75%', '60%', '80%', '70%', '55%', '85%', '65%', '75%', '60%'];
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1 h-4 bg-gray-200 animate-pulse rounded" style={{ width: widths[i] }} />
        </div>
      ))}
    </div>
  );
}

export default function CategorySidebar() {
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [panelTop, setPanelTop] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [tabletOpen, setTabletOpen] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const showTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [sidebarRect, setSidebarRect] = useState({ right: 0 });

  const { data: apiCategories, error, isLoading } = useSWR<Category[]>(
    `${API_URL}/categories`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000, fallbackData: fallbackCategories }
  );

  const categories = apiCategories && apiCategories.length > 0 ? apiCategories : fallbackCategories;

  const validCategories = useCallback(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter((c: any) => !c.parent_id);
  }, [categories]);

  const getSubcategories = useCallback((cat: Category): Subcategory[] => {
    if (cat.children && cat.children.length > 0) return cat.children;
    if (!Array.isArray(categories)) return [];
    return categories.filter((c: any) => c.parent_id === cat.id);
  }, [categories]);

  useEffect(() => {
    const updateRect = () => {
      if (sidebarRef.current) {
        setSidebarRect({ right: sidebarRef.current.getBoundingClientRect().right });
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  }, []);

  const handleCategoryHover = useCallback((cat: Category, index: number) => {
    clearTimers();
    showTimerRef.current = setTimeout(() => {
      const itemEl = itemRefs.current[index];
      if (itemEl) {
        const rect = itemEl.getBoundingClientRect();
        setPanelTop(rect.top);
      }
      setHoveredCategory(cat);
    }, 100);
  }, [clearTimers]);

  const handleCategoryLeave = useCallback(() => {
    clearTimers();
    hideTimerRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  }, [clearTimers]);

  const handlePanelEnter = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const handlePanelLeave = useCallback(() => {
    clearTimers();
    hideTimerRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  }, [clearTimers]);

  const handleCategoryClick = useCallback((slug: string) => {
    setHoveredCategory(null);
    setMobileDrawerOpen(false);
    router.push(`/ads?category=${slug}`);
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        hoveredCategory &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setHoveredCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hoveredCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHoveredCategory(null);
        setMobileDrawerOpen(false);
        setTabletOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!hoveredCategory) return;
    const handleScroll = () => {
      const index = validCategories().findIndex(c => c.id === hoveredCategory.id);
      if (index >= 0) {
        const itemEl = itemRefs.current[index];
        if (itemEl) {
          const rect = itemEl.getBoundingClientRect();
          setPanelTop(rect.top);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hoveredCategory, validCategories]);

  const rootCategories = validCategories();

  const renderCategoryIcon = (slug?: string, name?: string) => (
    <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center text-base rounded-lg ${getCategoryBg(name)}`}>
      {getIcon(slug, name)}
    </span>
  );

  return (
    <>
      {/* Mobile drawer overlay */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/40 lg:hidden animate-fade-in"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 z-[201] w-[300px] bg-white shadow-2xl transform transition-transform duration-300 ease-out lg:hidden',
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-semibold text-gray-900">Categories</span>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {isLoading && !categories.length ? (
            <SidebarSkeleton />
          ) : !categories.length ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">No categories available</div>
          ) : (
            <div className="py-1">
              {rootCategories.map((cat) => {
                const subcategories = getSubcategories(cat);
                return (
                  <div key={cat.id} className="relative">
                    <Link
                      href={`/ads?category=${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                      onClick={() => setMobileDrawerOpen(false)}
                    >
                      {renderCategoryIcon(cat.slug, cat.name)}
                      <span className="flex-1 font-medium truncate">{cat.name}</span>
                      {cat.ad_count != null && (
                        <span className="text-xs text-gray-400">{formatCount(cat.ad_count)}</span>
                      )}
                      {subcategories.length > 0 && (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tablet toggle */}
      <button
        onClick={() => setTabletOpen(!tabletOpen)}
        className="hidden md:block lg:hidden fixed left-3 z-40 mt-1 w-10 h-10 bg-white rounded-xl shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        style={{ top: '130px' }}
        aria-label="Toggle categories"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Tablet sidebar overlay */}
      {tabletOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/40 hidden md:block lg:hidden animate-fade-in"
          onClick={() => setTabletOpen(false)}
        />
      )}

      {/* Tablet sidebar drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 z-[201] w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-out hidden md:block lg:hidden',
          tabletOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-semibold text-gray-900">Categories</span>
          <button
            onClick={() => setTabletOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {isLoading && !categories.length ? (
            <SidebarSkeleton />
          ) : !categories.length ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">No categories available</div>
          ) : (
            <div className="py-1">
              {rootCategories.map((cat) => {
                const subcategories = getSubcategories(cat);
                return (
                  <div key={cat.id} className="relative">
                    <Link
                      href={`/ads?category=${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                      onClick={() => setTabletOpen(false)}
                    >
                      {renderCategoryIcon(cat.slug, cat.name)}
                      <span className="flex-1 font-medium truncate">{cat.name}</span>
                      {cat.ad_count != null && (
                        <span className="text-xs text-gray-400">{formatCount(cat.ad_count)}</span>
                      )}
                      {subcategories.length > 0 && (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        ref={sidebarRef}
        onMouseLeave={handleCategoryLeave}
        className="hidden lg:block w-[260px] flex-shrink-0 self-start"
        style={{
          position: 'sticky',
          top: '110px',
          maxHeight: 'calc(100vh - 130px)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <nav>
          {isLoading && !categories.length ? (
            <SidebarSkeleton />
          ) : !categories.length ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">No categories available</div>
          ) : (
            <div className="py-1">
              {rootCategories.map((cat, index) => {
                const isActive = hoveredCategory?.id === cat.id;
                const subcategories = getSubcategories(cat);
                const hasSubs = subcategories.length > 0;

                return (
                  <div
                    key={cat.id}
                    ref={(el) => { itemRefs.current[index] = el; }}
                    onMouseEnter={() => handleCategoryHover(cat, index)}
                    onMouseLeave={handleCategoryLeave}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-150 text-sm',
                      isActive
                        ? 'bg-primary-50/70 text-primary-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    onClick={() => handleCategoryClick(cat.slug)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCategoryClick(cat.slug);
                      }
                    }}
                  >
                    {renderCategoryIcon(cat.slug, cat.name)}
                    <span className="flex-1 font-medium truncate">{cat.name}</span>
                    {cat.ad_count != null && (
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatCount(cat.ad_count)}</span>
                    )}
                    {hasSubs && (
                      <ChevronRight
                        className={cn(
                          'w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200',
                          isActive ? 'text-primary-400 translate-x-0.5' : 'text-gray-300'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* Subcategory panel */}
        {hoveredCategory && (
          <div
            ref={panelRef}
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
            className="fixed z-50 w-[280px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in"
            style={{
              top: `${panelTop}px`,
              left: `${sidebarRect.right + 8}px`,
            }}
          >
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <Link
                href={`/ads?category=${hoveredCategory.slug}`}
                onClick={() => setHoveredCategory(null)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors"
              >
                {renderCategoryIcon(hoveredCategory.slug, hoveredCategory.name)}
                <span>{hoveredCategory.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 ml-auto" />
              </Link>
            </div>
            <div className="max-h-[400px] overflow-y-auto py-1">
              {getSubcategories(hoveredCategory).length > 0 ? (
                getSubcategories(hoveredCategory).map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/ads?category=${sub.slug}`}
                    onClick={() => setHoveredCategory(null)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors border-b border-gray-50 last:border-b-0"
                  >
                    <span className="flex-1 truncate">{sub.name}</span>
                    {sub.ad_count != null && (
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatCount(sub.ad_count)}</span>
                    )}
                  </Link>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">
                  No subcategories
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </aside>
    </>
  );
}
