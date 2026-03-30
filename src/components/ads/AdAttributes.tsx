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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header - More subtle and elegant */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
          <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </span>
          {title}
        </h3>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {entries.map(([key, value]) => {
            const isBoolean = isBooleanValue(value);
            
            return (
              <div 
                key={key} 
                className={`group relative flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:shadow-md ${
                  isBoolean 
                    ? value 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50 border border-gray-100'
                    : 'bg-gray-50 border border-gray-100 hover:border-primary-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {!isBoolean && (
                    <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                  )}
                  <span className={`text-sm font-medium ${isBoolean ? 'text-gray-600' : 'text-gray-600'}`}>
                    {formatLabel(key)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {isBoolean ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
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
                    <span className="text-sm font-bold text-gray-900">
                      {formatValue(key, value)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer decoration - Subtle line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary-300 to-transparent"></div>
    </div>
  );
}
