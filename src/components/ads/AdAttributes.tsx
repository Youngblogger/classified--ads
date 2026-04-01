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

export default function AdAttributes({ attributes, title }: AdAttributesProps) {
  let attrs = attributes;
  if (typeof attributes === 'string') {
    try {
      attrs = JSON.parse(attributes);
    } catch (e) {
      return null;
    }
  }
  
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
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Specifications</h3>
      </div>
      <table className="w-full">
        <tbody>
          {entries.map(([key, value], index) => {
            const isBoolean = isBooleanValue(value);
            const isEven = index % 2 === 0;
            
            return (
              <tr key={key} className={isEven ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm font-medium text-gray-600 w-1/2 border-r border-gray-100">
                  {formatLabel(key)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 w-1/2">
                  <div className="flex items-center gap-2">
                    {isBoolean ? (
                      <>
                        {value ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={value ? 'text-emerald-700' : 'text-gray-500'}>
                          {value ? 'Yes' : 'No'}
                        </span>
                      </>
                    ) : (
                      <span>{formatValue(key, value)}</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
