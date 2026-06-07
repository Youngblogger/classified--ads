'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, ChevronRight, Menu, ChevronLeft, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  parent_id?: string;
  ad_count?: number;
  children?: Category[];
}

const CATEGORY_BG: Record<string, string> = {
  vehicles: 'bg-emerald-50', cars: 'bg-emerald-50',
  'mobile-phones': 'bg-blue-50', smartphones: 'bg-blue-50',
  property: 'bg-violet-50',
  electronics: 'bg-amber-50', laptops: 'bg-amber-50',
  fashion: 'bg-pink-50',
  'home-furniture': 'bg-orange-50', furniture: 'bg-orange-50',
  services: 'bg-cyan-50',
  jobs: 'bg-slate-50',
  'health-beauty': 'bg-rose-50',
  sports: 'bg-green-50',
  'baby-kids': 'bg-yellow-50',
  pets: 'bg-lime-50',
};

function getCategoryBg(name?: string): string {
  if (!name) return 'bg-gray-50';
  const lower = name.toLowerCase();
  for (const [key, bg] of Object.entries(CATEGORY_BG))
    if (lower.includes(key)) return bg;
  return 'bg-gray-50';
}

/* count formatting removed */

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

export default function CategorySidebar() {
  const [hoveredCat, setHoveredCat] = useState<Category | null>(null);
  const [hoveredSub, setHoveredSub] = useState<Category | null>(null);
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [activeSub, setActiveSub] = useState<Category | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabletOpen, setTabletOpen] = useState(false);
  const [mobileBreadcrumbs, setMobileBreadcrumbs] = useState<Category[]>([]);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, maxHeight: 400 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const subPanelRef = useRef<HTMLDivElement>(null);
  const childPanelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/categories`);
        const json = await res.json();
        const parents = (json?.data || []) as any[];
        if (!mounted) return;
        const allCats: Category[] = parents.map((parent: any) => ({
          id: parent.id,
          name: parent.name,
          slug: parent.slug,
          icon: parent.icon || undefined,
          image: parent.image || undefined,
          ad_count: parent.ad_count || 0,
          children: (parent.activeChildren || []).map((s: any) => ({
            id: s.id, name: s.name, slug: s.slug, parent_id: parent.id, ad_count: s.ad_count || 0,
          })),
        }));
        if (mounted) {
          setCategories(allCats);
          setIsLoading(false);
        }
      } catch {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const rootCats = useCallback(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(c => !c.parent_id);
  }, [categories]);

  const getChildren = useCallback((cat: Category): Category[] => {
    if (cat.children && cat.children.length > 0) return cat.children;
    if (!Array.isArray(categories)) return [];
    return categories.filter(c => c.parent_id === cat.id);
  }, [categories]);

  const isActiveCat = (cat: Category) => (hoveredCat || activeCat)?.id === cat.id;
  const isActiveSub = (sub: Category) => (hoveredSub || activeSub)?.id === sub.id;

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
    }, 600);
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
        let top = rect.top;
        let maxHeight = Math.min(maxAvail, availBelow);
        if (maxHeight < 200) {
          maxHeight = maxAvail;
          top = Math.max(headerH, vh - maxHeight - 16);
        }
        setPanelPos({ top, left: rect.right - 2, maxHeight });
      }
    }, 80);
  }, [cancelCatHide]);

  const handleCatLeave = useCallback(() => {
    if (showCatTimer.current) { clearTimeout(showCatTimer.current); showCatTimer.current = null; }
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); showSubTimer.current = null; }
    if (!activeCat && !isInPanelRef.current) {
      scheduleCatHide();
    }
  }, [activeCat, scheduleCatHide]);

  const handleCatClick = useCallback((cat: Category) => {
    if (activeCat?.id === cat.id) {
      closeAll();
      return;
    }
    const subs = getChildren(cat);
    clearAllTimers();
    setActiveCat(cat);
    setActiveSub(null);
    setHoveredCat(cat);
    setHoveredSub(subs.length > 0 ? subs[0] : null);
    const idx = rootCats().findIndex(c => c.id === cat.id);
    if (idx >= 0) {
      const el = itemRefs.current[idx];
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const headerH = 112;
        const maxAvail = vh - headerH - 16;
        const availBelow = vh - rect.top - 16;
        let top = rect.top;
        let maxHeight = Math.min(maxAvail, availBelow);
        if (maxHeight < 200) {
          maxHeight = maxAvail;
          top = Math.max(headerH, vh - maxHeight - 16);
        }
        setPanelPos({ top, left: rect.right - 2, maxHeight });
      }
    }
  }, [activeCat, closeAll, clearAllTimers, getChildren, rootCats]);

  const handleSubEnter = useCallback((sub: Category) => {
    cancelCatHide();
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); }
    showSubTimer.current = setTimeout(() => {
      setHoveredSub(sub);
    }, 60);
  }, [cancelCatHide]);

  const handleSubLeave = useCallback(() => {
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); }
  }, []);

  const handleSubClick = useCallback((sub: Category) => {
    if (activeSub?.id === sub.id) {
      setActiveSub(null);
      setHoveredSub(null);
    } else {
      setActiveSub(sub);
      setHoveredSub(sub);
    }
  }, [activeSub]);

  const handlePanelEnter = useCallback(() => {
    isInPanelRef.current = true;
    cancelCatHide();
  }, [cancelCatHide]);
  const handlePanelLeave = useCallback(() => {
    isInPanelRef.current = false;
    if (!activeCat) {
      scheduleCatHide();
    }
  }, [activeCat, scheduleCatHide]);

  const handleMobileSelect = useCallback((cat: Category) => {
    const children = getChildren(cat);
    if (children.length > 0) {
      setMobileBreadcrumbs(prev => [...prev, cat]);
    }
  }, [getChildren]);

  const handleMobileBack = useCallback(() => {
    setMobileBreadcrumbs(prev => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeAll(); setMobileOpen(false); setTabletOpen(false); }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeAll]);

  useEffect(() => {
    if (!hoveredCat && !activeCat) return;
    const handleScroll = () => {
      const target = hoveredCat || activeCat;
      if (!target) return;
      const idx = rootCats().findIndex(c => c.id === target.id);
      if (idx < 0) return;
      const el = itemRefs.current[idx];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const headerH = 112;
      const maxAvail = vh - headerH - 16;
      const availBelow = vh - rect.top - 16;
      let top = rect.top;
      let maxHeight = Math.min(maxAvail, availBelow);
      if (maxHeight < 200) {
        maxHeight = maxAvail;
        top = Math.max(headerH, vh - maxHeight - 16);
      }
      requestAnimationFrame(() => setPanelPos({ top, left: rect.right - 2, maxHeight }));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hoveredCat, activeCat, rootCats]);

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

  const displayCat = hoveredCat || activeCat;
  const displaySub = hoveredSub || activeSub;
  const subs = displayCat ? getChildren(displayCat) : [];
  const children = displaySub ? getChildren(displaySub) : [];

  const mbCats = mobileBreadcrumbs.length === 0
    ? rootCats()
    : getChildren(mobileBreadcrumbs[mobileBreadcrumbs.length - 1]);

  const renderIcon = (cat: Category) => {
    const IconComp = getCategoryIcon(cat.icon);
    return (
      <span className={cn('flex-shrink-0 w-7 h-7 flex items-center justify-center text-sm rounded-lg', getCategoryBg(cat.name))}>
        <IconComp className="w-4 h-4" />
      </span>
    );
  };

  const renderPanelItem = (item: Category, isSub?: boolean) => (
    <div
      key={item.id}
      onMouseEnter={() => isSub ? handleSubEnter(item) : undefined}
      onMouseLeave={() => isSub ? handleSubLeave() : undefined}
      onClick={() => isSub ? handleSubClick(item) : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && isSub) { e.preventDefault(); handleSubClick(item); } }}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-md transition-all duration-100',
        (!isSub || isActiveSub(item))
          ? 'bg-primary-50/60 text-primary-700 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <span className="flex-1 text-sm truncate">{item.name}</span>
      {getChildren(item).length > 0 && (
        <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
      )}
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] bg-black/40 lg:hidden" onClick={() => { setMobileOpen(false); setMobileBreadcrumbs([]); }} />
      )}

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
          {isLoading && !categories.length ? <SidebarSkeleton /> : !mbCats.length ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">No categories</div>
          ) : (
            <div className="py-1">
              {mbCats.map(cat => {
                const hasChildren = getChildren(cat).length > 0;
                return (
                  <div key={cat.id} onClick={() => handleMobileSelect(cat)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleMobileSelect(cat); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer border-b border-gray-50 last:border-b-0"
                  >
                    {renderIcon(cat)}
                    <span className="flex-1 text-sm font-medium text-gray-800 truncate">{cat.name}</span>
                    {hasChildren && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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
          {isLoading && !categories.length ? <SidebarSkeleton /> : !rootCats().length ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">No categories</div>
          ) : (
            <div className="py-1">
              {rootCats().map(cat => (
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

      <aside
        ref={sidebarRef}
        onMouseLeave={handleCatLeave}
        className="hidden lg:block w-[248px] flex-shrink-0 self-start z-40"
        style={{
          position: 'sticky',
          top: 'calc(104px + 8px)',
          maxHeight: 'calc(100vh - 104px - 16px)',
        }}
      >
        <div className="bg-white rounded-xl border border-gray-100/80 shadow-sm overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-50">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">All Categories</h3>
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 104px - 16px - 40px)', scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
          >
            {isLoading && !categories.length ? <SidebarSkeleton /> : !rootCats().length ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">No categories</div>
            ) : (
              <div className="py-1">
                {rootCats().map((cat, index) => {
                  const active = isActiveCat(cat);
                  const hasSubs = getChildren(cat).length > 0;
                  return (
                    <div
                      key={cat.id}
                      ref={el => { itemRefs.current[index] = el; }}
                      onMouseEnter={() => handleCatEnter(cat, index)}
                      onMouseLeave={handleCatLeave}
                      onClick={() => handleCatClick(cat)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCatClick(cat); } }}
                      className={cn(
                        'relative flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-all duration-100 border-l-[3px] select-none',
                        active
                          ? 'bg-primary-50/70 border-l-primary-500 text-primary-700'
                          : 'border-l-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-l-gray-200'
                      )}
                    >
                      {renderIcon(cat)}
                      <span className="flex-1 text-sm font-medium truncate leading-tight">{cat.name}</span>
                      <span className="hidden">{/* count removed */}</span>
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

      {displayCat && subs.length > 0 && (
        <div
          ref={subPanelRef}
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
          className="fixed z-50 bg-white rounded-xl border border-gray-100/80 shadow-lg overflow-hidden animate-fade-in"
          style={{
            top: `${panelPos.top}px`,
            left: `${panelPos.left}px`,
            minWidth: '220px',
            maxWidth: '300px',
            maxHeight: `${panelPos.maxHeight}px`,
          }}
        >
          <Link
            href={`/ads?category=${displayCat.slug}`}
            className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
          >
            {renderIcon(displayCat)}
            <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">{displayCat.name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto flex-shrink-0 group-hover:text-primary-400" />
          </Link>
          <div className="overflow-y-auto" style={{ maxHeight: `${panelPos.maxHeight - 48}px`, scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
            <div className="py-1.5 px-1.5">
              {subs.map(sub => renderPanelItem(sub, true))}
            </div>
          </div>
        </div>
      )}

      {displaySub && children.length > 0 && (
        <div
          ref={childPanelRef}
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
          className="fixed z-50 bg-white rounded-xl border border-gray-100/80 shadow-lg overflow-hidden animate-fade-in"
          style={{
            top: `${panelPos.top}px`,
            left: `${panelPos.left + 218}px`,
            minWidth: '200px',
            maxWidth: '260px',
            maxHeight: `${panelPos.maxHeight}px`,
          }}
        >
          <div className="px-4 py-2.5 border-b border-gray-50">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate block">{displaySub.name}</span>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: `${panelPos.maxHeight - 44}px`, scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
            <div className="py-1.5 px-1.5">
              {children.map(child => (
                <Link
                  key={child.id}
                  href={`/ads?category=${child.slug}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-100"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                  <span className="flex-1 truncate">{child.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
