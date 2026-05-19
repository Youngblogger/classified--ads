'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  X, ChevronRight, Menu, ChevronLeft, Search, TrendingUp, Star,
  Clock, Sparkles, Zap, Award, Flame, Eye, History,
  ArrowUpDown, Hash, Tag, Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/config';
import { getCategoryIcon } from '@/lib/categoryIcons';
import useSWR from 'swr';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  parent_id?: number | null;
  ad_count?: number;
  level?: number;
  is_featured?: boolean;
  is_trending?: boolean;
  category_badge?: string;
  children?: Category[];
  active_children?: Category[];
}

interface MegaMenuData {
  tree: Category[];
  featured: Category[];
  trending: Category[];
  recently_added: Category[];
}

const fetcher = (url: string) =>
  fetch(url).then(r => r.json()).then(r => r.data || []);

const STORAGE_KEY = 'recently_viewed_cats';
const MAX_RECENT = 8;

function getRecentlyViewed(): Category[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function addRecentlyViewed(cat: Category): void {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentlyViewed().filter(c => c.id !== cat.id);
    recent.unshift(cat);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch { /* ignore */ }
}

const CATEGORY_ICONS: Record<string, string> = {
  vehicles: '\u{1F697}', cars: '\u{1F697}', suvs: '\u{1F697}', sedans: '\u{1F697}',
  'mobile-phones': '\u{1F4F1}', smartphones: '\u{1F4F1}', tablets: '\u{1F4FA}',
  property: '\u{1F3E0}',
  electronics: '\u{1F4BB}', laptops: '\u{1F4BB}', tvs: '\u{1F4FA}', cameras: '\u{1F4F7}',
  fashion: '\u{1F455}',
  'home-furniture': '\u{1F6CF}', furniture: '\u{1F6CF}',
  services: '\u{1F6E0}',
  jobs: '\u{1F4BC}',
  'health-beauty': '\u{1F484}',
  sports: '\u{26BD}',
  'baby-kids': '\u{1F476}',
  pets: '\u{1F436}', dogs: '\u{1F436}', cats: '\u{1F431}',
};

const CATEGORY_BG: Record<string, string> = {
  vehicles: 'bg-emerald-50', 'mobile-phones': 'bg-blue-50',
  property: 'bg-violet-50', electronics: 'bg-amber-50',
  fashion: 'bg-pink-50', 'home-furniture': 'bg-orange-50',
  services: 'bg-cyan-50', jobs: 'bg-slate-50',
  'health-beauty': 'bg-rose-50', sports: 'bg-green-50',
  'baby-kids': 'bg-yellow-50', pets: 'bg-lime-50',
};

function getIcon(slug?: string, name?: string): string {
  if (slug) {
    const lower = slug.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS))
      if (lower === key || lower.includes(key)) return icon;
  }
  if (name) {
    for (const [key, icon] of Object.entries(CATEGORY_ICONS))
      if (name.toLowerCase().includes(key)) return icon;
  }
  return '\u{1F4E6}';
}

function getBg(name?: string): string {
  if (!name) return 'bg-gray-50';
  const lower = name.toLowerCase();
  for (const [key, bg] of Object.entries(CATEGORY_BG))
    if (lower.includes(key)) return bg;
  return 'bg-gray-50';
}

function formatCount(count?: number): string {
  if (count == null) return '';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toLocaleString();
}

function getChildren(cat: Category): Category[] {
  return cat.active_children || cat.children || [];
}

function flattenTree(cats: Category[], depth = 0, maxDepth = 10): Category[] {
  if (depth >= maxDepth || !cats) return [];
  const result: Category[] = [];
  for (const c of cats) {
    result.push(c);
    const kids = getChildren(c);
    if (kids.length > 0) result.push(...flattenTree(kids, depth + 1, maxDepth));
  }
  return result;
}

function searchTree(cats: Category[], query: string): Category[] {
  if (!query) return [];
  const q = query.toLowerCase();
  const flat = flattenTree(cats, 0, 10);
  return flat.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.slug.toLowerCase().includes(q)
  );
}

const BADGE_STYLES: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-700',
  trending: 'bg-orange-100 text-orange-700',
  popular: 'bg-blue-100 text-blue-700',
  verified: 'bg-purple-100 text-purple-700',
};

const BADGE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  new: Sparkles, trending: TrendingUp, popular: Award, verified: Star,
};

function Badge({ type }: { type: string }) {
  const Icon = BADGE_ICONS[type] || Sparkles;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider',
      BADGE_STYLES[type] || 'bg-gray-100 text-gray-600'
    )}>
      <Icon className="w-2.5 h-2.5" />
      {type}
    </span>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200/70 text-gray-900 rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-0.5 p-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse" />
          <div className="flex-1 h-3.5 bg-gray-100 animate-pulse rounded" style={{ width: `${65 + (i % 4) * 8}%` }} />
        </div>
      ))}
    </div>
  );
}

function RecursiveCategoryList({
  cats, level = 0, maxLevel = 4, onSelect, searchQuery = '',
}: {
  cats: Category[]; level?: number; maxLevel?: number;
  onSelect?: (cat: Category) => void; searchQuery?: string;
}) {
  if (level >= maxLevel || !cats.length) return null;
  return (
    <div className={cn(level > 0 && 'ml-3 border-l-2 border-gray-100 pl-2')}>
      {cats.map(cat => {
        const children = getChildren(cat);
        const hasChildren = children.length > 0;
        return (
          <div key={cat.id}>
            <Link
              href={`/ads?category=${cat.slug}`}
              onClick={() => onSelect?.(cat)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
              <span className="flex-1 truncate">
                <Highlight text={cat.name} query={searchQuery} />
              </span>
              {cat.ad_count != null && (
                <span className="text-[10px] text-gray-400 tabular-nums">{formatCount(cat.ad_count)}</span>
              )}
              {hasChildren && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
            </Link>
            {hasChildren && (
              <RecursiveCategoryList
                cats={children}
                level={level + 1}
                maxLevel={maxLevel}
                onSelect={onSelect}
                searchQuery={searchQuery}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function EnterpriseSidebar() {
  const [hoveredCat, setHoveredCat] = useState<Category | null>(null);
  const [hoveredSub, setHoveredSub] = useState<Category | null>(null);
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [activeSub, setActiveSub] = useState<Category | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabletOpen, setTabletOpen] = useState(false);
  const [mobileBreadcrumbs, setMobileBreadcrumbs] = useState<Category[]>([]);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, maxHeight: 400, panelLeft: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Category[]>([]);
  const [focusedCatIndex, setFocusedCatIndex] = useState(-1);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const subPanelRef = useRef<HTMLDivElement>(null);
  const childPanelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: apiData, isLoading } = useSWR<MegaMenuData>(
    `${API_URL}/categories/mega-menu`,
    (url: string) => fetch(url).then(r => r.json()).then(r => r.data as MegaMenuData),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  useEffect(() => { setRecentlyViewed(getRecentlyViewed()); }, []);

  const tree = useMemo(() => apiData?.tree || [], [apiData]);
  const featured = apiData?.featured || [];
  const trending = apiData?.trending || [];

  const rootCats = useMemo(() => {
    if (!Array.isArray(tree)) return [];
    return tree;
  }, [tree]);

  const isActiveCat = (cat: Category) => (hoveredCat || activeCat)?.id === cat.id;
  const isActiveSub = (sub: Category) => (hoveredSub || activeSub)?.id === sub.id;

  const displayCat = hoveredCat || activeCat;
  const displaySub = hoveredSub || activeSub;
  const subs = displayCat ? getChildren(displayCat) : [];
  const children = displaySub ? getChildren(displaySub) : [];
  const childHasItems = !!displaySub && getChildren(displaySub).length > 0;
  const mainPanelWidth = Math.min(panelPos.panelLeft || 260, (typeof window !== 'undefined' ? window.innerWidth : 1200) - panelPos.left - 16);
  const childPanelLeft = Math.min(panelPos.left + mainPanelWidth + 8, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 248);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchTree(tree, searchQuery).slice(0, 50);
  }, [searchQuery, tree]);

  const showCatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideCatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showSubTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInPanelRef = useRef(false);

  const clearAllTimers = useCallback(() => {
    if (showCatTimer.current) { clearTimeout(showCatTimer.current); showCatTimer.current = null; }
    if (hideCatTimer.current) { clearTimeout(hideCatTimer.current); hideCatTimer.current = null; }
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); showSubTimer.current = null; }
  }, []);

  const closeAll = useCallback(() => {
    clearAllTimers();
    setHoveredCat(null);
    setHoveredSub(null);
    setActiveCat(null);
    setActiveSub(null);
  }, [clearAllTimers]);

  const scheduleCatHide = useCallback(() => {
    if (hideCatTimer.current) { clearTimeout(hideCatTimer.current); }
    hideCatTimer.current = setTimeout(() => {
      setHoveredCat(null);
      setHoveredSub(null);
    }, 400);
  }, []);

  const cancelCatHide = useCallback(() => {
    if (hideCatTimer.current) { clearTimeout(hideCatTimer.current); hideCatTimer.current = null; }
  }, []);

  const handleCatEnter = useCallback((cat: Category, index: number) => {
    cancelCatHide();
    if (showCatTimer.current) { clearTimeout(showCatTimer.current); }
    showCatTimer.current = setTimeout(() => {
      setHoveredSub(null);
      setActiveSub(null);
      setHoveredCat(cat);
      const el = itemRefs.current[index];
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const headerH = 112;
        const maxAvail = vh - headerH - 16;
        const availBelow = vh - rect.top - 16;
        let top = Math.max(headerH, rect.top);
        let maxHeight = Math.min(maxAvail, availBelow);
        if (maxHeight < 300) {
          maxHeight = maxAvail;
          top = Math.max(headerH, vh - maxHeight - 16);
        }
        const sidebarW = 248;
        const panelLeft = rect.right;
        const vw = window.innerWidth;
        const maxPanelW = Math.min(260, vw - panelLeft - 16);
        setPanelPos({ top: rect.top, left: panelLeft, maxHeight: Math.min(maxHeight, vh - headerH - 16), panelLeft: maxPanelW });
      }
    }, 100);
  }, [cancelCatHide]);

  const handleCatLeave = useCallback(() => {
    if (showCatTimer.current) { clearTimeout(showCatTimer.current); showCatTimer.current = null; }
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); showSubTimer.current = null; }
    if (!activeCat && !isInPanelRef.current) scheduleCatHide();
  }, [activeCat, scheduleCatHide]);

  const handleCatClick = useCallback((cat: Category) => {
    if (activeCat?.id === cat.id) { closeAll(); return; }
    const subs = getChildren(cat);
    clearAllTimers();
    setActiveCat(cat);
    setActiveSub(null);
    setHoveredCat(cat);
    setHoveredSub(subs.length > 0 ? subs[0] : null);
    addRecentlyViewed(cat);
    setRecentlyViewed(getRecentlyViewed());
    const idx = rootCats.findIndex(c => c.id === cat.id);
    if (idx >= 0) {
      const el = itemRefs.current[idx];
      if (el) {
        const rect = el.getBoundingClientRect();
        setPanelPos({ top: rect.top, left: rect.right, maxHeight: 500, panelLeft: 260 });
      }
    }
  }, [activeCat, closeAll, clearAllTimers, rootCats]);

  const handleSubEnter = useCallback((sub: Category) => {
    cancelCatHide();
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); }
    showSubTimer.current = setTimeout(() => {
      setHoveredSub(sub);
    }, 50);
  }, [cancelCatHide]);

  const handleSubLeave = useCallback(() => {
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); }
  }, []);

  const handleSubClick = useCallback((sub: Category) => {
    addRecentlyViewed(sub);
    setRecentlyViewed(getRecentlyViewed());
    window.location.href = `/ads?category=${sub.slug}`;
  }, []);

  const handlePanelEnter = useCallback(() => {
    isInPanelRef.current = true;
    cancelCatHide();
  }, [cancelCatHide]);
  const handlePanelLeave = useCallback(() => {
    isInPanelRef.current = false;
    if (!activeCat) scheduleCatHide();
  }, [activeCat, scheduleCatHide]);

  const handleMobileSelect = useCallback((cat: Category) => {
    const children = getChildren(cat);
    if (children.length > 0) {
      setMobileBreadcrumbs(prev => [...prev, cat]);
    } else {
      window.location.href = `/ads?category=${cat.slug}`;
    }
  }, []);
  const handleMobileBack = useCallback(() => setMobileBreadcrumbs(prev => prev.slice(0, -1)), []);
  const handleSearchResult = useCallback((cat: Category) => {
    setSearchQuery('');
    setShowSearch(false);
    closeAll();
  }, [closeAll]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeAll(); setMobileOpen(false); setTabletOpen(false); setShowSearch(false); setSearchQuery(''); }
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault(); setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && displayCat) {
        e.preventDefault();
        const items = rootCats;
        setFocusedCatIndex(prev => {
          const delta = e.key === 'ArrowDown' ? 1 : -1;
          return Math.max(0, Math.min(items.length - 1, prev + delta));
        });
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeAll, displayCat, rootCats]);

  useEffect(() => {
    if (!hoveredCat && !activeCat) return;
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (sidebarRef.current?.contains(t)) return;
      if (subPanelRef.current?.contains(t)) return;
      if (childPanelRef.current?.contains(t)) return;
      closeAll();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hoveredCat, activeCat, closeAll]);

  useEffect(() => {
    if (focusedCatIndex >= 0 && focusedCatIndex < rootCats.length) {
      const cat = rootCats[focusedCatIndex];
      handleCatEnter(cat, focusedCatIndex);
    }
  }, [focusedCatIndex, rootCats, handleCatEnter]);

  const mbCats = mobileBreadcrumbs.length === 0
    ? rootCats
    : getChildren(mobileBreadcrumbs[mobileBreadcrumbs.length - 1]);

  const renderIcon = (cat: Category, size: 'sm' | 'md' = 'md') => {
    const dim = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
    if (cat.image) {
      return (
        <span className={cn('flex-shrink-0 flex items-center justify-center rounded-lg overflow-hidden', dim)}>
          <img src={cat.image} alt="" className="w-full h-full object-cover" loading="lazy" />
        </span>
      );
    }
    const IconComp = getCategoryIcon(cat.icon);
    return (
      <span className={cn('flex-shrink-0 flex items-center justify-center rounded-lg', dim, getBg(cat.name))}>
        <IconComp className="w-4 h-4 text-gray-600" />
      </span>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] bg-black/40 lg:hidden" onClick={() => { setMobileOpen(false); setMobileBreadcrumbs([]); }} />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        'fixed top-0 left-0 bottom-0 z-[201] w-[300px] max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out lg:hidden flex flex-col',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
          {mobileBreadcrumbs.length > 0 && (
            <button onClick={handleMobileBack} className="p-1 -ml-1 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
          )}
          <span className="font-semibold text-gray-900 text-sm flex-1">
            {mobileBreadcrumbs.length === 0 ? 'Categories' : mobileBreadcrumbs[mobileBreadcrumbs.length - 1].name}
          </span>
          <button onClick={() => { setMobileOpen(false); setMobileBreadcrumbs([]); }} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto flex-1 pb-20">
          {isLoading && !tree.length ? <SidebarSkeleton /> : !mbCats.length ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">No categories</div>
          ) : (
            <div className="py-1">
              {mbCats.map(cat => {
                const hasChildren = getChildren(cat).length > 0;
                return (
                  <div key={cat.id} onClick={() => handleMobileSelect(cat)} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleMobileSelect(cat); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer border-b border-gray-50 last:border-b-0"
                  >
                    {renderIcon(cat)}
                    <span className="flex-1 text-sm font-medium text-gray-800 truncate">{cat.name}</span>
                    {cat.ad_count != null && <span className="text-xs text-gray-400">{formatCount(cat.ad_count)}</span>}
                    {hasChildren && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tablet toggle */}
      <button onClick={() => setTabletOpen(!tabletOpen)}
        className="hidden md:flex lg:hidden fixed left-3 z-40 w-10 h-10 bg-white rounded-xl shadow-md border border-gray-200 items-center justify-center hover:bg-gray-50 transition-colors"
        style={{ top: '130px' }} aria-label="Categories">
        <Menu className="w-5 h-5 text-gray-700" />
      </button>
      {tabletOpen && <div className="fixed inset-0 z-[200] bg-black/40 hidden md:block lg:hidden" onClick={() => setTabletOpen(false)} />}
      <div className={cn(
        'fixed top-0 left-0 bottom-0 z-[201] w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-out hidden md:block lg:hidden',
        tabletOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-semibold text-gray-900">Categories</span>
          <button onClick={() => setTabletOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {isLoading && !tree.length ? <SidebarSkeleton /> : !rootCats.length ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">No categories</div>
          ) : (
            <div className="py-1">
              {rootCats.map(cat => (
                <Link key={cat.id} href={`/ads?category=${cat.slug}`} onClick={() => setTabletOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  {renderIcon(cat)}
                  <span className="flex-1 font-medium truncate">{cat.name}</span>
                  {getChildren(cat).length > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        ref={sidebarRef}
        onMouseLeave={handleCatLeave}
        className="hidden lg:block w-[220px] flex-shrink-0 self-start z-40"
        style={{
          position: 'sticky',
          top: 'calc(104px + 8px)',
        }}
      >
        <div className="bg-white rounded-xl border border-gray-100/80 shadow-sm flex flex-col overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 104px - 32px)' }}
        >
          {/* Header with search toggle */}
          <div className="px-3 py-2.5 border-b border-gray-50 flex items-center justify-between flex-shrink-0">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">All Categories</h3>
            <button
              onClick={() => { setShowSearch(!showSearch); if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 100); }}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              title="Search categories (/)"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Inline search */}
          {showSearch && (
            <div className="px-3 py-2 border-b border-gray-50 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-300 focus:ring-1 focus:ring-primary-200 outline-none transition-all"
                  onKeyDown={e => {
                    if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); }
                  }}
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Search results */}
              {searchQuery && (
                <div className="mt-2 max-h-48 overflow-y-auto space-y-0.5">
                  {searchResults.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2 text-center">No categories found</p>
                  ) : (
                    searchResults.map(cat => (
                      <Link
                        key={cat.id}
                        href={`/ads?category=${cat.slug}`}
                        onClick={() => handleSearchResult(cat)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        {renderIcon(cat, 'sm')}
                        <span className="flex-1 truncate">
                          <Highlight text={cat.name} query={searchQuery} />
                        </span>
                        <span className="text-[10px] text-gray-400">{cat.level ? `Lv${cat.level}` : ''}</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Category list - fills remaining space */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
          >
            {isLoading && !tree.length ? <SidebarSkeleton /> : !rootCats.length ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">No categories</div>
            ) : (
              <div className="py-1">
                {rootCats.map((cat, index) => {
                  const active = isActiveCat(cat);
                  const hasSubs = getChildren(cat).length > 0;
                  const badge = (cat as any).category_badge;
                  return (
                    <div
                      key={cat.id}
                      ref={el => { itemRefs.current[index] = el; }}
                      onMouseEnter={() => { setFocusedCatIndex(index); handleCatEnter(cat, index); }}
                      onMouseLeave={handleCatLeave}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = `/ads?category=${cat.slug}`; }
                        if (e.key === 'ArrowRight' && hasSubs) { handleCatEnter(cat, index); }
                      }}
                      className={cn(
                        'relative flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-all duration-100 border-l-[3px] select-none',
                        active
                          ? 'bg-primary-50/70 border-l-primary-500 text-primary-700'
                          : 'border-l-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-l-gray-200'
                      )}
                    >
                      <Link href={`/ads?category=${cat.slug}`} className="flex items-center gap-2.5 flex-1 min-w-0" onClick={() => addRecentlyViewed(cat)}>
                        {renderIcon(cat)}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate leading-tight block">{cat.name}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            {badge && <Badge type={badge} />}
                            {(cat as any).is_featured && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-semibold uppercase">
                                <Star className="w-2.5 h-2.5" />
                                Popular
                              </span>
                            )}
                            {(cat as any).is_trending && !badge && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[9px] font-semibold uppercase">
                                <Flame className="w-2.5 h-2.5" />
                                Hot
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-gray-400 tabular-nums">{formatCount(cat.ad_count)}</span>
                      </Link>
                      {hasSubs && (
                        <ChevronRight className={cn('w-3.5 h-3.5 flex-shrink-0 transition-all duration-200', active ? 'text-primary-400 translate-x-px' : 'text-gray-300')} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* Mega Panel - Level 2 (vertical nav list) */}
      {displayCat && subs.length > 0 && (
        <div
          ref={subPanelRef}
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
          className="fixed z-50 bg-white border border-gray-200/80 shadow-lg"
          style={{
            top: `${Math.max(112, Math.min(panelPos.top, window.innerHeight - panelPos.maxHeight - 16))}px`,
            left: `${panelPos.left}px`,
            width: `${Math.min(panelPos.panelLeft || 260, window.innerWidth - panelPos.left - 16)}px`,
            maxHeight: `${Math.min(panelPos.maxHeight, window.innerHeight - 128)}px`,
          }}
        >
          {/* Header */}
          <Link
            href={`/ads?category=${displayCat.slug}`}
            onClick={() => addRecentlyViewed(displayCat)}
            className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-gray-50/80 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {renderIcon(displayCat)}
              <span className="text-sm font-semibold text-gray-800">{displayCat.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {(displayCat as any).is_trending && (
                <span className="text-[10px] text-orange-600 font-medium">Trending</span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </Link>

          {/* Vertical nav list */}
          <div className="overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
            {subs.map(sub => {
              const childCount = getChildren(sub).length;
              const isSelected = isActiveSub(sub);
              return (
                <Link
                  key={sub.id}
                  href={`/ads?category=${sub.slug}`}
                  onMouseEnter={() => handleSubEnter(sub)}
                  onMouseLeave={handleSubLeave}
                  onClick={() => addRecentlyViewed(sub)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 border-b border-gray-50/80 transition-colors',
                    isSelected
                      ? 'bg-primary-50/50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {renderIcon(sub, 'sm')}
                  <span className="flex-1 text-sm truncate">{sub.name}</span>
                  {childCount > 0 && (
                    <ChevronRight className={cn('w-3 h-3 flex-shrink-0', isSelected ? 'text-primary-400' : 'text-gray-300')} />
                  )}
                </Link>
              );
            })}

            {/* Trending */}
            {trending.length > 0 && (
              <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/40">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Trending</span>
                </div>
                <div className="space-y-0.5">
                  {trending.slice(0, 4).map(cat => (
                    <Link
                      key={cat.id}
                      href={`/ads?category=${cat.slug}`}
                      onClick={() => { addRecentlyViewed(cat); closeAll(); }}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs text-orange-700 hover:bg-orange-50/50 transition-colors rounded"
                    >
                      <Flame className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Level 3 - Child panel (vertical nav list) */}
      {displaySub && childHasItems && (
        <div
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
          className="fixed z-50 bg-white border border-gray-200/80 shadow-lg"
          style={{
            top: `${Math.max(112, Math.min(panelPos.top, window.innerHeight - panelPos.maxHeight - 16))}px`,
            left: `${panelPos.left + mainPanelWidth - 1}px`,
            width: '220px',
            maxHeight: `${Math.min(panelPos.maxHeight, window.innerHeight - 128)}px`,
          }}
        >
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/80">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{displaySub.name}</span>
          </div>
          <div className="overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
            {getChildren(displaySub).map(child => (
              <Link
                key={child.id}
                href={`/ads?category=${child.slug}`}
                onClick={() => { addRecentlyViewed(child); setRecentlyViewed(getRecentlyViewed()); closeAll(); }}
                className="flex items-center gap-2.5 px-3 py-2 border-b border-gray-50/80 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                {renderIcon(child, 'sm')}
                <span className="flex-1 truncate">{child.name}</span>
              </Link>
            ))}
            {getChildren(displaySub).length > 15 && (
              <Link
                href={`/ads?category=${displaySub.slug}`}
                onClick={() => { addRecentlyViewed(displaySub); closeAll(); }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-primary-600 hover:bg-primary-50 transition-colors font-medium"
              >
                View all {getChildren(displaySub).length}
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}

    </>
  );
}
