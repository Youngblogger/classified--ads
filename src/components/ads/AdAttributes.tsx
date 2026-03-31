'use client';

import { Check, X } from 'lucide-react';

interface AdAttributesProps {
  attributes: Record<string, any>;
  title?: string;
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(key: string, value: any): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    if (key.toLowerCase().includes('mileage') || key.toLowerCase().includes('km')) {
      return value.toLocaleString() + ' km';
    }
    if (key.toLowerCase().includes('year')) {
      return value.toString();
    }
    if (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount')) {
      return '₦' + value.toLocaleString();
    }
    return value.toLocaleString();
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return String(value);
}

function isBooleanValue(value: any): boolean {
  return typeof value === 'boolean';
}

export default function AdAttributes({ attributes, title = 'Specifications' }: AdAttributesProps) {
  const attrs = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
  
  if (!attrs || Object.keys(attrs).length === 0) {
    return null;
  }

  const entries = Object.entries(attrs).filter(
    ([, value]) => value !== null && value !== undefined && value !== ''
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
      {entries.map(([key, value]) => {
        const isBoolean = isBooleanValue(value);
        
        return (
          <div 
            key={key} 
            className="flex items-center justify-between py-1"
          >
            <span className="text-sm font-semibold text-gray-700">
              {formatLabel(key)}
            </span>
            
            {isBoolean ? (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                value 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {value ? (
                  <>
                    <Check className="w-3 h-3" />
                    Yes
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3" />
                    No
                  </>
                )}
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-900 text-right">
                {formatValue(key, value)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
