'use client';

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
    // Format numbers with commas for readability
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

export default function AdAttributes({ attributes, title = 'Ad Details' }: AdAttributesProps) {
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {entries.map(([key, value]) => (
          <div key={key} className="grid grid-cols-1 sm:grid-cols-2">
            <div className="px-6 py-3 bg-gray-50 sm:bg-transparent">
              <span className="text-sm text-gray-500 font-medium">{formatLabel(key)}</span>
            </div>
            <div className="px-6 py-3">
              <span className="text-sm text-gray-900 font-semibold">
                {formatValue(key, value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
