'use client';

import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SpecField } from '@/config/category-fields';

interface DynamicSpecFieldsProps {
  fields: SpecField[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  className?: string;
}

function validateField(field: SpecField, value: any): string | null {
  if (field.is_required && (value === '' || value === null || value === undefined)) {
    return `${field.label} is required`;
  }
  if (!field.validation) return null;
  const { min, max, minLength, maxLength, pattern, message } = field.validation;
  if (field.type === 'number' || field.type === 'text') {
    const num = Number(value);
    if (min !== undefined && num < min) return message || `Minimum value is ${min}`;
    if (max !== undefined && num > max) return message || `Maximum value is ${max}`;
  }
  const str = String(value ?? '');
  if (minLength !== undefined && str.length < minLength) return message || `Minimum ${minLength} characters`;
  if (maxLength !== undefined && str.length > maxLength) return message || `Maximum ${maxLength} characters`;
  if (pattern && str) {
    try {
      if (!new RegExp(pattern).test(str)) return message || `Invalid format for ${field.label}`;
    } catch {}
  }
  return null;
}

export default function DynamicSpecFields({ fields, values, onChange, className = '' }: DynamicSpecFieldsProps) {
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const handleChange = useCallback((name: string, value: any) => {
    onChange(name, value);
    const field = fields.find(f => f.name === name);
    if (field) {
      setErrors(prev => ({ ...prev, [name]: validateField(field, value) }));
    }
  }, [onChange, fields]);

  const groups = groupBy(fields, f => f.group_name || 'General');

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(groups).map(([groupName, groupFields]) => (
        <fieldset key={groupName}>
          {groupName !== 'General' && (
            <legend className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-0">
              {groupName}
            </legend>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupFields.map(field => (
              <div key={field.name}>
                <FieldRenderer
                  field={field}
                  value={values[field.name] ?? ''}
                  onChange={(v) => handleChange(field.name, v)}
                  error={errors[field.name]}
                />
              </div>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function FieldRenderer({ field, value, onChange, error }: { field: SpecField; value: any; onChange: (v: any) => void; error?: string | null }) {
  const inputClass = `w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm transition-all focus:outline-none focus:ring-2 ${
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-200 dark:focus:border-primary-400'
  }`;

  if (field.type === 'select') {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {field.label}
          {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="relative group">
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`${inputClass} pr-12 appearance-none cursor-pointer`}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none transition-transform group-focus-within:rotate-180" />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  if (field.type === 'multi_select') {
    const selected = Array.isArray(value) ? value : value ? [value] : [];
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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
          <div className="w-10 h-5 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:bg-primary-500 dark:peer-checked:bg-primary-600 peer-checked:after:translate-x-[18px] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
        </label>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</span>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {field.label}
          {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          rows={3}
          className={`${inputClass} resize-none`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
        {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={e => onChange(field.type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value)}
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        className={inputClass}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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
