'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { ChevronDown, Search, MapPin, X, SlidersHorizontal, Star, Shield, Zap, TrendingUp, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/config';
import { useGlobalStore, useUIStore } from '@/lib/store';

const fetcher = (url: string) =>
  fetch(url).then(r => r.json()).then(r => r.data || {});

interface FilterField {
  name: string;
  label: string;
  type: string;
  filter_type: string;
  options: { label: string; value: string }[] | string[];
  group_name?: string;
}

interface FilterMeta {
  filter_type?: string;
  price_label?: string;
  currency?: string;
  price?: { min: number; max: number; avg: number; total: number };
  price_distribution?: { bucket: number; count: number; label: string; min: number; max: number }[];
  conditions?: { value: string; label: string; count: number }[];
  fields?: FilterField[];
  category?: { id: number; name: string; slug: string } | null;
  subcategory?: { id: number; name: string; slug: string } | null;
}

interface FilterState {
  priceMin: string;
  priceMax: string;
  condition: string;
  attrs: Record<string, string>;
}

interface FilterPanelProps {
  categorySlug?: string;
  subcategorySlug?: string;
  onFilterChange: (state: FilterState) => void;
  className?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSearch?: () => void;
  locationSlug?: string;
  lgaParam?: string;
  onLocationChange?: (slug: string, lga: string) => void;
  selectedLocationState?: string;
  onToggleLocationModal?: () => void;
}

type SectionKey = 'price' | 'location' | 'condition' | 'trust' | 'details';

export default function FilterPanel({
  categorySlug, subcategorySlug, onFilterChange, className,
  searchQuery: externalSearchQuery, onSearchChange: externalSearchChange, onSearch: externalSearchFn,
  locationSlug, lgaParam, onLocationChange, selectedLocationState, onToggleLocationModal,
}: FilterPanelProps) {
  const { selectedLocation } = useGlobalStore();
  const { toggleLocationModal } = useUIStore();

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [condition, setCondition] = useState('');
  const [attrFilters, setAttrFilters] = useState<Record<string, string>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<SectionKey, boolean>>({
    price: false, location: false, condition: false, trust: false, details: false,
  });
  const [localSearch, setLocalSearch] = useState(externalSearchQuery || '');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const metaUrl = categorySlug
    ? `${API_URL}/filters/meta?category=${categorySlug}${subcategorySlug ? `&subcategory=${subcategorySlug}` : ''}`
    : null;

  const { data: meta, isLoading } = useSWR<FilterMeta>(
    metaUrl,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000, fallbackData: {} as FilterMeta }
  );

  const syncFilters = useCallback(() => {
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      onFilterChange({ priceMin, priceMax, condition, attrs: attrFilters });
    }, 300);
  }, [priceMin, priceMax, condition, attrFilters, onFilterChange]);

  useEffect(() => {
    syncFilters();
    return () => { if (syncTimeout.current) clearTimeout(syncTimeout.current); };
  }, [syncFilters]);

  useEffect(() => {
    setPriceMin('');
    setPriceMax('');
    setCondition('');
    setAttrFilters({});
  }, [categorySlug, subcategorySlug]);

  useEffect(() => {
    setLocalSearch(externalSearchQuery || '');
  }, [externalSearchQuery]);

  const toggleSection = (key: SectionKey) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const groups = useMemo(() => {
    if (!meta?.fields?.length) return {};
    const g: Record<string, FilterField[]> = {};
    for (const f of (meta.fields || [])) {
      const gn = f.group_name || 'Other';
      if (!g[gn]) g[gn] = [];
      g[gn].push(f);
    }
    return g;
  }, [meta]);

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleAttrChange = (name: string, value: string) => {
    setAttrFilters(prev => {
      const next = { ...prev };
      if (value === '' || value === null) {
        delete next[name];
      } else {
        next[name] = value;
      }
      return next;
    });
  };

  const maxPrice = meta?.price?.max || 0;
  const minPrice = meta?.price?.min || 0;
  const priceLabel = meta?.price_label || 'Price';
  const hasData = meta?.price?.total && meta.price.total > 0;
  const conditions = meta?.conditions || [];
  const isPriceActive = priceMin || priceMax;

  const sliderWidth = useMemo(() => {
    if (!hasData) return 50;
    const range = maxPrice - minPrice || 1;
    const low = priceMin ? Math.max(parseFloat(priceMin), minPrice) : minPrice;
    const high = priceMax ? Math.min(parseFloat(priceMax), maxPrice) : maxPrice;
    return ((high - low) / range) * 100;
  }, [minPrice, maxPrice, priceMin, priceMax, hasData]);

  const sliderLeft = useMemo(() => {
    if (!hasData) return 0;
    const range = maxPrice - minPrice || 1;
    const low = priceMin ? Math.max(parseFloat(priceMin), minPrice) : minPrice;
    return ((low - minPrice) / range) * 100;
  }, [minPrice, maxPrice, priceMin, hasData]);

  const activeChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (priceMin && priceMax) chips.push({ label: `${formatPriceShort(parseFloat(priceMin))} - ${formatPriceShort(parseFloat(priceMax))}`, onRemove: () => { setPriceMin(''); setPriceMax(''); } });
    else if (priceMin) chips.push({ label: `From ${formatPriceShort(parseFloat(priceMin))}`, onRemove: () => setPriceMin('') });
    else if (priceMax) chips.push({ label: `Under ${formatPriceShort(parseFloat(priceMax))}`, onRemove: () => setPriceMax('') });
    if (condition) {
      const c = conditions.find(c => c.value === condition);
      if (c) chips.push({ label: c.label, onRemove: () => setCondition('') });
    }
    if (locationSlug) chips.push({ label: selectedLocationState || locationSlug, onRemove: () => onLocationChange?.('', '') });
    if (verifiedOnly) chips.push({ label: 'Verified only', onRemove: () => setVerifiedOnly(false) });
    if (premiumOnly) chips.push({ label: 'Premium ads', onRemove: () => setPremiumOnly(false) });
    return chips;
  }, [priceMin, priceMax, condition, locationSlug, selectedLocationState, verifiedOnly, premiumOnly, conditions, onLocationChange]);

  const hasAnyFilter = priceMin || priceMax || condition || locationSlug || lgaParam || verifiedOnly || premiumOnly;

  if (isLoading || !meta) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
            <div className="h-8 bg-gray-200 animate-pulse rounded" />
            <div className="h-8 bg-gray-200 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => { setLocalSearch(e.target.value); externalSearchChange?.(e.target.value); }}
              onKeyDown={(e) => e.key === 'Enter' && externalSearchFn?.()}
              placeholder="Search ads..."
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {localSearch && (
              <button onClick={() => { setLocalSearch(''); externalSearchChange?.(''); externalSearchFn?.(); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded-full">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <div className="flex flex-wrap gap-1.5">
            {activeChips.map((chip, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-[11px] font-medium">
                {chip.label}
                <button onClick={chip.onRemove} className="hover:text-primary-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {activeChips.length > 1 && (
              <button onClick={() => { setPriceMin(''); setPriceMax(''); setCondition(''); onLocationChange?.('', ''); setVerifiedOnly(false); setPremiumOnly(false); }} className="text-[11px] text-gray-400 hover:text-gray-600 underline px-1">
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Price Section */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full px-4 py-3 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{priceLabel}</span>
            {isPriceActive && <span className="w-2 h-2 rounded-full bg-primary-500" />}
          </div>
          <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', !collapsedSections.price && 'rotate-180')} />
        </button>
        {!collapsedSections.price && (
          <div className="px-4 pb-4 space-y-3">
            {/* Price insights */}
            {hasData && (
              <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
                <span>Avg: <strong className="text-gray-700">{formatPrice(meta.price?.avg || 0)}</strong></span>
                <span className="text-gray-300">|</span>
                <span>Min: <strong className="text-gray-700">{formatPrice(minPrice)}</strong></span>
                <span className="text-gray-300">|</span>
                <span>Max: <strong className="text-gray-700">{formatPrice(maxPrice)}</strong></span>
              </div>
            )}

            {/* Manual input */}
            <div className="flex items-end gap-1.5">
              <div className="flex-1">
                <span className="text-[10px] text-gray-400 mb-0.5 block">Min</span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">₦</span>
                  <input
                    type="text" value={priceMin ? formatInputPrice(priceMin) : ''}
                    onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ''); setPriceMin(raw); }}
                    onFocus={(e) => e.target.select()}
                    className={cn('w-full pl-6 pr-2 py-1.5 border rounded-lg text-xs text-gray-900 transition-all', priceMin ? 'bg-white border-primary-300 ring-1 ring-primary-100' : 'bg-gray-50 border-gray-200 hover:border-gray-300')}
                  />
                </div>
              </div>
              <div className="flex items-center justify-center pb-2"><div className="w-2 h-px bg-gray-300" /></div>
              <div className="flex-1">
                <span className="text-[10px] text-gray-400 mb-0.5 block">Max</span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">₦</span>
                  <input
                    type="text" value={priceMax ? formatInputPrice(priceMax) : ''}
                    onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ''); setPriceMax(raw); }}
                    onFocus={(e) => e.target.select()}
                    className={cn('w-full pl-6 pr-2 py-1.5 border rounded-lg text-xs text-gray-900 transition-all', priceMax ? 'bg-white border-primary-300 ring-1 ring-primary-100' : 'bg-gray-50 border-gray-200 hover:border-gray-300')}
                  />
                </div>
              </div>
            </div>

            {/* Slider bar */}
            {(isPriceActive || hasData) && (
              <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="absolute top-0 h-full bg-gradient-to-r from-primary-300 to-primary-500 rounded-full transition-all duration-300" style={{ left: `${sliderLeft}%`, width: `${sliderWidth}%` }} />
              </div>
            )}

            {/* Quick select with radio */}
            {(meta.price_distribution || []).filter(b => b.count > 0).length > 0 && (
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Quick select</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="space-y-0.5">
                  {(meta.price_distribution || []).filter(b => b.count > 0).slice(0, 6).map((b, idx, arr) => {
                    const isSelected = parseFloat(priceMin || '0') === b.min && parseFloat(priceMax || '0') === b.max;
                    const isFirst = idx === 0;
                    const isLast = idx === arr.length - 1;
                    const label = isFirst ? `Under ${formatPriceShort(b.max)}` : isLast ? `More than ${formatPriceShort(b.min)}` : `${formatPriceShort(b.min)} - ${formatPriceShort(b.max)}`;
                    return (
                      <label key={b.bucket} onClick={() => { if (isSelected) { setPriceMin(''); setPriceMax(''); } else { setPriceMin(isFirst ? '0' : String(b.min)); setPriceMax(isLast ? '' : String(b.max)); } }}
                        className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all group', isSelected ? 'bg-primary-50' : 'hover:bg-gray-50')}>
                        <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all', isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300 group-hover:border-gray-400')}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={cn('text-xs flex-1', isSelected ? 'text-primary-700 font-medium' : 'text-gray-600')}>{label}</span>
                        <span className={cn('text-[10px] tabular-nums', isSelected ? 'text-primary-600' : 'text-gray-400')}>{formatCount(b.count)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location Section */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button onClick={() => toggleSection('location')} className="flex items-center justify-between w-full px-4 py-3 text-left">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-900">Location</span>
            {locationSlug && <span className="w-2 h-2 rounded-full bg-primary-500" />}
          </div>
          <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', !collapsedSections.location && 'rotate-180')} />
        </button>
        {!collapsedSections.location && (
          <div className="px-4 pb-4">
            <button onClick={onToggleLocationModal || toggleLocationModal}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="flex-1 text-left truncate capitalize text-xs">
                {selectedLocationState?.toLowerCase() || 'All Nigeria'}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
            </button>
          </div>
        )}
      </div>

      {/* Condition Section */}
      {conditions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button onClick={() => toggleSection('condition')} className="flex items-center justify-between w-full px-4 py-3 text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">Condition</span>
              {condition && <span className="w-2 h-2 rounded-full bg-primary-500" />}
            </div>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', !collapsedSections.condition && 'rotate-180')} />
          </button>
          {!collapsedSections.condition && (
            <div className="px-4 pb-4 space-y-1">
              <label onClick={() => setCondition('')}
                className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all group', !condition ? 'bg-primary-50' : 'hover:bg-gray-50')}>
                <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all', !condition ? 'border-primary-500 bg-primary-500' : 'border-gray-300 group-hover:border-gray-400')}>
                  {!condition && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className={cn('text-xs flex-1', !condition ? 'text-primary-700 font-medium' : 'text-gray-600')}>Any Condition</span>
              </label>
              {conditions.map(c => {
                const isSelected = condition === c.value;
                return (
                  <label key={c.value} onClick={() => setCondition(isSelected ? '' : c.value)}
                    className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all group', isSelected ? 'bg-primary-50' : 'hover:bg-gray-50')}>
                    <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all', isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300 group-hover:border-gray-400')}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className={cn('text-xs flex-1', isSelected ? 'text-primary-700 font-medium' : 'text-gray-600')}>{c.label}</span>
                    <span className={cn('text-[10px] tabular-nums px-1.5 py-0.5 rounded', isSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400')}>{c.count}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Trust & Verification Section */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button onClick={() => toggleSection('trust')} className="flex items-center justify-between w-full px-4 py-3 text-left">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-900">Trust</span>
            {(verifiedOnly || premiumOnly) && <span className="w-2 h-2 rounded-full bg-primary-500" />}
          </div>
          <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', !collapsedSections.trust && 'rotate-180')} />
        </button>
        {!collapsedSections.trust && (
          <div className="px-4 pb-4 space-y-2">
            <label className="flex items-center justify-between py-1.5 cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <Shield className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-xs text-gray-600 group-hover:text-gray-900">Verified sellers only</span>
              </div>
              <button onClick={() => setVerifiedOnly(!verifiedOnly)} className={cn('relative w-8 h-4 rounded-full transition-colors', verifiedOnly ? 'bg-primary-500' : 'bg-gray-200')}>
                <div className={cn('absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform', verifiedOnly ? 'translate-x-4' : 'translate-x-0.5')} />
              </button>
            </label>
            <label className="flex items-center justify-between py-1.5 cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs text-gray-600 group-hover:text-gray-900">Premium ads only</span>
              </div>
              <button onClick={() => setPremiumOnly(!premiumOnly)} className={cn('relative w-8 h-4 rounded-full transition-colors', premiumOnly ? 'bg-primary-500' : 'bg-gray-200')}>
                <div className={cn('absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform', premiumOnly ? 'translate-x-4' : 'translate-x-0.5')} />
              </button>
            </label>
          </div>
        )}
      </div>

      {/* Dynamic Fields Section */}
      {Object.keys(groups).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button onClick={() => toggleSection('details')} className="flex items-center justify-between w-full px-4 py-3 text-left">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-900">More Filters</span>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', !collapsedSections.details && 'rotate-180')} />
          </button>
          {!collapsedSections.details && (
            <div className="px-4 pb-4 space-y-3">
              {Object.entries(groups).map(([groupName, fields]) => {
                const isExpanded = expandedGroups[groupName] !== false;
                return (
                  <div key={groupName}>
                    {Object.keys(groups).length > 1 && (
                      <button onClick={() => toggleGroup(groupName)} className="flex items-center gap-1 text-[11px] font-medium text-gray-500 mb-1.5 w-full text-left">
                        <ChevronDown className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-180')} />
                        {groupName}
                      </button>
                    )}
                    {isExpanded && (
                      <div className="space-y-2">
                        {fields.map(field => (
                          <div key={field.name}>
                            <label className="text-[11px] text-gray-500 block mb-1">{field.label}</label>
                            {renderFieldControl(field, attrFilters[field.name] || '', (v) => handleAttrChange(field.name, v))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Smart tags */}
      {hasData && (
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-2">Marketplace Insights</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-[10px] font-medium"><Sparkles className="w-3 h-3" /> Hot Deal</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-medium"><Zap className="w-3 h-3" /> Fast Selling</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-md text-[10px] font-medium"><TrendingUp className="w-3 h-3" /> Trending</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-600 rounded-md text-[10px] font-medium"><Check className="w-3 h-3" /> Newly Posted</span>
          </div>
        </div>
      )}

      {/* Saved filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <button className="flex items-center gap-2 w-full text-left">
          <Star className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 font-medium">Save this search</span>
        </button>
      </div>
    </div>
  );
}

function renderFieldControl(field: FilterField, value: string, onChange: (v: string) => void) {
  switch (field.filter_type) {
    case 'select':
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900">
          <option value="">Any</option>
          {(field.options || []).map((opt: any) => {
            const optValue = typeof opt === 'string' ? opt : (opt.value ?? opt.label ?? '');
            const optLabel = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? '');
            return <option key={optValue} value={optValue}>{optLabel}</option>;
          })}
        </select>
      );
    case 'multi_select':
      return (
        <div className="flex flex-wrap gap-1">
          {(field.options || []).map((opt: any) => {
            const optValue = typeof opt === 'string' ? opt : (opt.value ?? opt.label ?? '');
            const optLabel = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? '');
            const selected = value.split(',').includes(optValue);
            return (
              <button key={optValue} onClick={() => { const parts = value ? value.split(',') : []; const next = selected ? parts.filter(p => p !== optValue) : [...parts, optValue]; onChange(next.join(',')); }}
                className={cn('px-2 py-1 rounded-lg text-[11px] border transition-colors', selected ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300')}>
                {optLabel}
              </button>
            );
          })}
        </div>
      );
    case 'boolean':
      return (
        <button onClick={() => onChange(value === '1' ? '' : '1')}
          className={cn('px-3 py-1.5 rounded-lg text-[11px] border transition-colors', value === '1' ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300')}>
          {value === '1' ? 'Yes' : 'No'}
        </button>
      );
    case 'range':
      return <input type="text" value={value} onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ''); onChange(raw); }} placeholder="Value" className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900" />;
    default:
      return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`Filter by ${field.label.toLowerCase()}`} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900" />;
  }
}

function formatPrice(amount: number): string {
  if (amount >= 1_000_000) return '₦' + (amount / 1_000_000).toFixed(1) + 'M';
  if (amount >= 1_000) return '₦' + (amount / 1_000).toFixed(0) + 'K';
  return '₦' + amount.toFixed(0);
}

function formatInputPrice(raw: string): string {
  if (!raw) return '';
  const num = parseInt(raw, 10);
  if (isNaN(num)) return raw;
  return num.toLocaleString();
}

function formatPriceShort(amount: number): string {
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1) + ' M';
  if (amount >= 1_000) return (amount / 1_000).toFixed(0) + ' K';
  return String(amount);
}

function formatCount(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
