'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORY_ICON_MAP } from '@/lib/categoryIcons';

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  onClose: () => void;
}

const ICON_ENTRIES = Object.entries(CATEGORY_ICON_MAP).map(([name, Icon]) => ({ name, Icon }));

export default function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = useMemo(() => {
    if (!searchTerm) return ICON_ENTRIES;
    const q = searchTerm.toLowerCase();
    return ICON_ENTRIES.filter((entry) =>
      entry.name.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold">Select Icon</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search icons..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-sky-500"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {filteredIcons.map(({ name, Icon }) => (
              <button
                key={name}
                onClick={() => { onChange(name); onClose(); }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  value === name
                    ? 'bg-sky-100 ring-2 ring-sky-500'
                    : 'hover:bg-gray-100'
                }`}
                title={name}
              >
                <Icon className="w-6 h-6 text-gray-700" />
                <span className="text-[9px] text-gray-500 truncate w-full text-center leading-tight">{name}</span>
              </button>
            ))}
          </div>
          {filteredIcons.length === 0 && (
            <p className="text-center text-gray-500 py-8">No icons found</p>
          )}
        </div>

        {value && (
          <div className="p-4 border-t bg-gray-50 flex items-center gap-3 flex-shrink-0">
            <span className="text-sm text-gray-500">Selected:</span>
            {(() => {
              const Icon = CATEGORY_ICON_MAP[value];
              return Icon ? <Icon className="w-5 h-5 text-sky-600" /> : <span className="text-sm">{value}</span>;
            })()}
            <span className="text-sm font-mono text-gray-600">{value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
