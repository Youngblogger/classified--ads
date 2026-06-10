'use client';

import { ChevronDown } from 'lucide-react';
import type { SpecField } from '@/config/category-fields';

interface DynamicSpecFieldsProps {
  fields: SpecField[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  className?: string;
}

export default function DynamicSpecFields({ fields, values, onChange, className = '' }: DynamicSpecFieldsProps) {
  const groups = groupBy(fields, f => f.group_name || 'General');

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(groups).map(([groupName, groupFields]) => (
        <fieldset key={groupName}>
          {groupName !== 'General' && (
            <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {groupName}
            </legend>
          )}
          <div className="space-y-4">
            {groupFields.map(field => (
              <FieldRenderer
                key={field.name}
                field={field}
                value={values[field.name] ?? ''}
                onChange={(v) => onChange(field.name, v)}
              />
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function FieldRenderer({ field, value, onChange }: { field: SpecField; value: any; onChange: (v: any) => void }) {
  if (field.type === 'select') {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="relative group">
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl bg-white text-gray-900 appearance-none cursor-pointer transition-all group-focus-within:border-primary-500 group-hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200 text-sm"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform group-focus-within:rotate-180" />
        </div>
      </div>
    );
  }

  if (field.type === 'multi_select') {
    const selected = Array.isArray(value) ? value : value ? [value] : [];
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {field.options?.map(opt => {
            const isSelected = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const next = isSelected ? selected.filter((s: string) => s !== opt) : [...selected, opt];
                  onChange(next);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  isSelected
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === 'boolean') {
    return (
      <div className="flex items-center gap-3 py-1">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-primary-500 peer-checked:after:translate-x-[18px] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
        </label>
        <span className="text-sm font-medium text-gray-700">{field.label}</span>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all bg-white resize-none text-sm"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={e => onChange(field.type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value)}
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all bg-white text-sm"
      />
    </div>
  );
}

function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const key = fn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}
