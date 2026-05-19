'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { X, ChevronDown, GripVertical, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/config';

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
}

export default function FilterPanel({ categorySlug, subcategorySlug, onFilterChange, className }: FilterPanelProps) {
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [condition, setCondition] = useState('');
  const [attrFilters, setAttrFilters] = useState<Record<string, string>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
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

  // Reset filters when category changes
  useEffect(() => {
    setPriceMin('');
    setPriceMax('');
    setCondition('');
    setAttrFilters({});
  }, [categorySlug, subcategorySlug]);

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

  // Compute slider percentage for visual bar
  const sliderWidth = useMemo(() => {
    if (!hasData) return 50;
    const range = maxPrice - minPrice || 1;
    const low = priceMin ? Math.max(parseFloat(priceMin), minPrice) : minPrice;
    const high = priceMax ? Math.min(parseFloat(priceMax), maxPrice) : maxPrice;
    return ((high - low) / range) * 100;
  }, [minPrice, maxPrice, priceMin, priceMax, hasData]);

  if (isLoading || !meta) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="h-5 bg-gray-200 animate-pulse rounded w-24" />
        <div className="h-8 bg-gray-200 animate-pulse rounded" />
        <div className="h-8 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-5', className)}>
      {/* Price / Salary / Fee */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">{priceLabel}</h3>
        {hasData && (
          <div className="mb-3">
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute top-0 h-full bg-primary-200 rounded-full"
                style={{ left: '0%', width: `${sliderWidth}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatPrice(minPrice)}</span>
              <span className="font-medium text-gray-600">{formatPrice(meta.price?.avg || 0)} avg</span>
              <span>{formatPrice(maxPrice)}</span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{meta?.currency || '₦'}</span>
            <input
              type="text"
              value={priceMin}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setPriceMin(raw);
              }}
              placeholder="Min"
              className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <span className="text-gray-300 text-xs">—</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{meta?.currency || '₦'}</span>
            <input
              type="text"
              value={priceMax}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setPriceMax(raw);
              }}
              placeholder="Max"
              className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Price distribution */}
        {(meta.price_distribution || []).length > 0 && (
          <div className="mt-3 space-y-0.5">
            {(meta.price_distribution || []).filter(b => b.count > 0).slice(0, 6).map(b => {
              const pct = maxPrice > 0 ? ((b.max - b.min) / (maxPrice - minPrice || 1)) * 100 : 0;
              const priceTotal = meta.price?.total || 0;
              const countPct = priceTotal > 0 ? (b.count / priceTotal) * 100 : 0;
              return (
                <button
                  key={b.bucket}
                  onClick={() => { setPriceMin(String(b.min)); setPriceMax(String(b.max)); }}
                  className="flex items-center gap-2 w-full group"
                >
                  <div className="flex-1 h-3 bg-gray-100 rounded-sm overflow-hidden relative">
                    <div
                      className="h-full bg-primary-100 group-hover:bg-primary-200 transition-colors rounded-sm"
                      style={{ width: `${Math.max(countPct, 2)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 w-12 text-right tabular-nums">{b.count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Condition */}
      {conditions.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Condition</h3>
          <div className="space-y-1">
            <button
              onClick={() => setCondition('')}
              className={cn(
                'w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors',
                !condition ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-500 hover:bg-gray-50'
              )}
            >
              Any Condition
            </button>
            {conditions.map(c => (
              <button
                key={c.value}
                onClick={() => setCondition(condition === c.value ? '' : c.value)}
                className={cn(
                  'w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between',
                  condition === c.value ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-500 hover:bg-gray-50'
                )}
              >
                <span>{c.label}</span>
                <span className="text-[10px] text-gray-400">{c.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic fields from CategoryField */}
      {Object.keys(groups).length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Details</h3>
          {Object.entries(groups).map(([groupName, fields]) => {
            const isExpanded = expandedGroups[groupName] !== false;
            return (
              <div key={groupName} className="mb-2 last:mb-0">
                {Object.keys(groups).length > 1 && (
                  <button
                    onClick={() => toggleGroup(groupName)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1.5 w-full text-left"
                  >
                    <ChevronDown className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-180')} />
                    {groupName}
                  </button>
                )}
                {isExpanded && (
                  <div className="space-y-2.5">
                    {fields.map(field => (
                      <div key={field.name}>
                        <label className="text-xs text-gray-500 block mb-1">{field.label}</label>
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
  );
}

function renderFieldControl(field: FilterField, value: string, onChange: (v: string) => void) {
  switch (field.filter_type) {
    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
        >
          <option value="">Any</option>
          {(field.options || []).map((opt: any) => {
            const optValue = typeof opt === 'string' ? opt : (opt.value ?? opt.label ?? '');
            const optLabel = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? '');
            return (
              <option key={optValue} value={optValue}>{optLabel}</option>
            );
          })}
        </select>
      );
    case 'multi_select':
      return (
        <div className="flex flex-wrap gap-1.5">
          {(field.options || []).map((opt: any) => {
            const optValue = typeof opt === 'string' ? opt : (opt.value ?? opt.label ?? '');
            const optLabel = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? '');
            const selected = value.split(',').includes(optValue);
            return (
              <button
                key={optValue}
                onClick={() => {
                  const parts = value ? value.split(',') : [];
                  const next = selected ? parts.filter(p => p !== optValue) : [...parts, optValue];
                  onChange(next.join(','));
                }}
                className={cn(
                  'px-2 py-1 rounded-lg text-xs border transition-colors',
                  selected ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                {optLabel}
              </button>
            );
          })}
        </div>
      );
    case 'boolean':
      return (
        <button
          onClick={() => onChange(value === '1' ? '' : '1')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs border transition-colors',
            value === '1' ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
          )}
        >
          {value === '1' ? 'Yes' : 'No'}
        </button>
      );
    case 'range':
      return (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '');
              onChange(raw);
            }}
            placeholder="Value"
            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
          />
        </div>
      );
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Filter by ${field.label.toLowerCase()}`}
          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
        />
      );
  }
}

function formatPrice(amount: number): string {
  if (amount >= 1_000_000) return '₦' + (amount / 1_000_000).toFixed(1) + 'M';
  if (amount >= 1_000) return '₦' + (amount / 1_000).toFixed(0) + 'K';
  return '₦' + amount.toFixed(0);
}
