'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  onClose: () => void;
}

const iconEmojis = [
  { name: 'car', emoji: '🚗' },
  { name: 'truck', emoji: '🚚' },
  { name: 'bus', emoji: '🚌' },
  { name: 'bike', emoji: '🚲' },
  { name: 'house', emoji: '🏠' },
  { name: 'building', emoji: '🏢' },
  { name: 'laptop', emoji: '💻' },
  { name: 'tv', emoji: '📺' },
  { name: 'camera', emoji: '📷' },
  { name: 'watch', emoji: '⌚' },
  { name: 'cpu', emoji: '💾' },
  { name: 'database', emoji: '🗄️' },
  { name: 'cloud', emoji: '☁️' },
  { name: 'bed', emoji: '🛏️' },
  { name: 'table', emoji: '🪑' },
  { name: 'lamp', emoji: '💡' },
  { name: 'shirt', emoji: '👕' },
  { name: 'dress', emoji: '👗' },
  { name: 'briefcase', emoji: '💼' },
  { name: 'backpack', emoji: '🎒' },
  { name: 'graduation', emoji: '🎓' },
  { name: 'book', emoji: '📖' },
  { name: 'users', emoji: '👥' },
  { name: 'user', emoji: '👤' },
  { name: 'clock', emoji: '⏰' },
  { name: 'star', emoji: '⭐' },
  { name: 'target', emoji: '🎯' },
  { name: 'medal', emoji: '🏅' },
  { name: 'dog', emoji: '🐕' },
  { name: 'cat', emoji: '🐱' },
  { name: 'fish', emoji: '🐟' },
  { name: 'bird', emoji: '🐦' },
  { name: 'heart', emoji: '❤️' },
  { name: 'trophy', emoji: '🏆' },
  { name: 'football', emoji: '🏈' },
  { name: 'basketball', emoji: '🏀' },
  { name: 'tree', emoji: '🌳' },
  { name: 'pill', emoji: '💊' },
  { name: 'brain', emoji: '🧠' },
  { name: 'bank', emoji: '🏦' },
  { name: 'dollar', emoji: '💵' },
  { name: 'credit-card', emoji: '💳' },
  { name: 'wallet', emoji: '👛' },
  { name: 'chart', emoji: '📊' },
  { name: 'utensils', emoji: '🍴' },
  { name: 'coffee', emoji: '☕' },
  { name: 'beer', emoji: '🍺' },
  { name: 'wine', emoji: '🍷' },
  { name: 'pizza', emoji: '🍕' },
  { name: 'burger', emoji: '🍔' },
  { name: 'cake', emoji: '🎂' },
  { name: 'cookie', emoji: '🍪' },
  { name: 'palette', emoji: '🎨' },
  { name: 'image', emoji: '🖼️' },
  { name: 'video', emoji: '🎬' },
  { name: 'music', emoji: '🎵' },
  { name: 'code', emoji: '💻' },
  { name: 'terminal', emoji: '⌨️' },
  { name: 'tag', emoji: '🏷️' },
  { name: 'flag', emoji: '🚩' },
  { name: 'bell', emoji: '🔔' },
  { name: 'settings', emoji: '⚙️' },
  { name: 'lock', emoji: '🔒' },
  { name: 'key', emoji: '🔑' },
  { name: 'shield', emoji: '🛡️' },
  { name: 'zap', emoji: '⚡' },
  { name: 'power', emoji: '🔌' },
  { name: 'map', emoji: '🗺️' },
  { name: 'globe', emoji: '🌍' },
  { name: 'search', emoji: '🔍' },
];

export default function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = useMemo(() => {
    if (!searchTerm) return iconEmojis;
    return iconEmojis.filter((icon) =>
      icon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Select Icon</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b">
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
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {filteredIcons.map((icon) => (
              <button
                key={icon.name}
                onClick={() => { onChange(icon.emoji); onClose(); }}
                className={`aspect-square p-3 rounded-xl flex items-center justify-center text-2xl transition ${
                  value === icon.emoji ? 'bg-sky-100 ring-2 ring-sky-500' : 'hover:bg-gray-100'
                }`}
                title={icon.name}
              >
                {icon.emoji}
              </button>
            ))}
          </div>
          {filteredIcons.length === 0 && (
            <p className="text-center text-gray-500 py-8">No icons found</p>
          )}
        </div>

        {value && (
          <div className="p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-500 mb-2">Selected: {value}</p>
          </div>
        )}
      </div>
    </div>
  );
}
