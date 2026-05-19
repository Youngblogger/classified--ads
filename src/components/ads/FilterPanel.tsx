'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { ChevronDown } from 'lucide-react';
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

  const isPriceActive = priceMin || priceMax;

  return (
    <div className={cn('space-y-4', className)}>
        {/* Price / Salary / Fee */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">{priceLabel}</h3>
            {isPriceActive && (
              <button
                onClick={() => { setPriceMin(''); setPriceMax(''); }}
                className="text-[10px] text-gray-400 hover:text-gray-600 uppercase tracking-wider font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Manual price input (top) */}
          <div className="flex items-end gap-1 mb-4">
            <div className="flex-1">
              <span className="text-[10px] text-gray-400 font-medium mb-1 block">Min</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-900 text-sm font-medium">₦</span>
                <input
                  type="text"
                  value={priceMin ? formatInputPrice(priceMin) : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setPriceMin(raw);
                  }}
                  onFocus={(e) => e.target.select()}
                  className={cn(
                    'w-full pl-6 pr-2 py-1.5 border rounded-md text-sm text-gray-900 transition-all duration-200',
                    priceMin
                      ? 'bg-white border-primary-300 ring-1 ring-primary-100'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  )}
                />
              </div>
            </div>
            <div className="flex items-center justify-center pb-2.5">
              <div className="w-2 h-px bg-gray-300" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-gray-400 font-medium mb-1 block">Max</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-900 text-sm font-medium">₦</span>
                <input
                  type="text"
                  value={priceMax ? formatInputPrice(priceMax) : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setPriceMax(raw);
                  }}
                  onFocus={(e) => e.target.select()}
                  className={cn(
                    'w-full pl-6 pr-2 py-1.5 border rounded-md text-sm text-gray-900 transition-all duration-200',
                    priceMax
                      ? 'bg-white border-primary-300 ring-1 ring-primary-100'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  )}
                />
              </div>
            </div>
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">OR browse by price</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Price range quick picks — Jiji style with radio buttons */}
          {(meta.price_distribution || []).filter(b => b.count > 0).length > 0 && (
            <div>
              {(meta.price_distribution || []).filter(b => b.count > 0).slice(0, 6).map((b, idx, arr) => {
                const isSelected = parseFloat(priceMin || '0') === b.min && parseFloat(priceMax || '0') === b.max;
                const isFirst = idx === 0;
                const isLast = idx === arr.length - 1;
                const label = isFirst
                  ? `Under ${formatPriceShort(b.max)}`
                  : isLast
                    ? `More than ${formatPriceShort(b.min)}`
                    : `${formatPriceShort(b.min)} - ${formatPriceShort(b.max)}`;
                return (
                  <label
                    key={b.bucket}
                    onClick={() => {
                      if (isSelected) {
                        setPriceMin('');
                        setPriceMax('');
                      } else {
                        setPriceMin(isFirst ? '0' : String(b.min));
                        setPriceMax(isLast ? '' : String(b.max));
                      }
                    }}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group',
                      isSelected
                        ? 'bg-primary-50'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      isSelected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300 group-hover:border-gray-400'
                    )}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className={cn(
                      'text-xs font-medium flex-1',
                      isSelected ? 'text-primary-700' : 'text-gray-600'
                    )}>
                      {label}
                    </span>
                    <span className={cn(
                      'text-[10px] tabular-nums',
                      isSelected ? 'text-primary-600' : 'text-gray-400'
                    )}>
                      {formatCount(b.count)} ads
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {(isPriceActive || hasData) && (
            <div className="mt-3 pt-3 border-t border-gray-50">
              <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 h-full bg-gradient-to-r from-primary-300 to-primary-500 rounded-full transition-all duration-300"
                  style={{ left: `${minPrice > 0 ? ((parseFloat(priceMin || String(minPrice)) - minPrice) / (maxPrice - minPrice || 1)) * 100 : 0}%`, width: `${sliderWidth}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>{formatPrice(minPrice || 0)}</span>
                <span>{formatPrice(maxPrice || (meta.price?.max || 0))}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Condition with Radio Buttons */}
      {conditions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Condition</h3>
          <div className="space-y-1.5">
            <label
              onClick={() => setCondition('')}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group',
                !condition
                  ? 'bg-primary-50 border border-primary-200'
                  : 'bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200'
              )}
            >
              <div className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                !condition
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300 group-hover:border-gray-400'
              )}>
                {!condition && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className={cn(
                'text-sm font-medium flex-1',
                !condition ? 'text-primary-700' : 'text-gray-600'
              )}>
                Any Condition
              </span>
            </label>
            {conditions.map(c => {
              const isSelected = condition === c.value;
              return (
                <label
                  key={c.value}
                  onClick={() => setCondition(isSelected ? '' : c.value)}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group',
                    isSelected
                      ? 'bg-primary-50 border border-primary-200'
                      : 'bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    isSelected
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300 group-hover:border-gray-400'
                  )}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={cn(
                    'text-sm font-medium flex-1',
                    isSelected ? 'text-primary-700' : 'text-gray-600'
                  )}>
                    {c.label}
                  </span>
                  <span className={cn(
                    'text-[11px] tabular-nums px-2 py-0.5 rounded-full',
                    isSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
                  )}>
                    {c.count}
                  </span>
                </label>
              );
            })}
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
