'use client';

import {
  Car, Settings, Gauge, Fuel, Cog, Calendar, Palette, Shield,
  Smartphone, Monitor, Tv, Shirt, Home, Briefcase, Wrench,
  Dog, Heart, Baby, Dumbbell, Ruler, Weight, Hash, Check,
  X, Star, Zap, Droplets, Wind, Thermometer, Camera, Volume2,
  Sun, Moon, BookOpen, Tag, Layers, Menu, Package
} from 'lucide-react';

interface SpecItem {
  name: string;
  label: string;
  value: string;
  raw_value: any;
  type: string;
  options: string[];
  group_name: string | null;
  sort_order: number;
}

interface AdSpecificationsProps {
  specifications: SpecItem[];
}

const FIELD_ICONS: Record<string, React.FC<{ className?: string }>> = {
  make: Car, model: Settings, year: Calendar, mileage: Gauge,
  transmission: Cog, fuel_type: Fuel, engine_capacity: Weight,
  drive_type: Settings, body_type: Car, color: Palette,
  interior_color: Palette, condition: Tag, registration: Shield,
  vin: Hash, air_conditioning: Wind, sunroof: Sun,
  leather_seats: Star, heated_seats: Thermometer,
  navigation: MapIcon, reverse_camera: Camera, parking_sensors: Settings,
  bluetooth: Volume2, abs: Shield, airbags: Shield,
  brand: Tag, ram: Hash, storage: Package,
  battery_capacity: Zap, screen_size: Ruler, operating_system: Monitor,
  processor: Zap, connectivity: Wifi, size: Ruler, material: Layers,
  gender: Menu, bedrooms: Home, bathrooms: Droplets,
  furnishing: Settings, parking: Car, square_meters: Ruler,
  property_type: Home, job_type: Briefcase, salary: Tag,
  work_mode: Monitor, experience_level: Star,
  price: Tag, currency: Tag, location: MapIcon,
};

function getFieldIcon(name: string): React.FC<{ className?: string }> {
  const key = name.toLowerCase().replace(/[\s_-]+/g, '_');
  for (const [k, Icon] of Object.entries(FIELD_ICONS)) {
    if (key === k || key.includes(k) || k.includes(key)) return Icon;
  }
  return Tag;
}

const GROUP_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'Basic Info': Car, 'Specifications': Settings, 'Appearance': Palette,
  'Features': Star, 'Safety': Shield, 'Legal': BookOpen, 'Dimensions': Ruler,
  'Performance': Gauge, 'Battery': Zap, 'Connectivity': Wifi,
  'Display': Monitor, 'Camera': Camera, 'Audio': Volume2,
};

function getGroupIcon(group: string | null): React.FC<{ className?: string }> {
  if (!group) return Menu;
  const key = group.toLowerCase();
  for (const [k, Icon] of Object.entries(GROUP_ICONS)) {
    if (key === k.toLowerCase()) return Icon;
  }
  return Package;
}

function formatValue(value: string, type: string): { text: string; isBoolean: boolean; boolValue: boolean } {
  if (type === 'boolean') {
    const boolVal = value === 'Yes' || value === 'true' || value === '1';
    return { text: boolVal ? 'Yes' : 'No', isBoolean: true, boolValue: boolVal };
  }
  return { text: value, isBoolean: false, boolValue: false };
}

const GROUP_COLORS: Record<string, string> = {
  'Basic Info': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  'Specifications': 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  'Appearance': 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  'Features': 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
  'Safety': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  'Legal': 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300',
};

function getGroupColors(group: string | null): string {
  if (!group) return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
  const key = group.toLowerCase();
  for (const [k, colors] of Object.entries(GROUP_COLORS)) {
    if (key === k.toLowerCase()) return colors;
  }
  return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
}

export default function AdSpecifications({ specifications }: AdSpecificationsProps) {
  if (!specifications || specifications.length === 0) return null;

  const grouped: Record<string, SpecItem[]> = {};
  const ungrouped: SpecItem[] = [];

  for (const spec of specifications) {
    if (spec.group_name) {
      if (!grouped[spec.group_name]) grouped[spec.group_name] = [];
      grouped[spec.group_name].push(spec);
    } else {
      ungrouped.push(spec);
    }
  }

  const hasGroups = Object.keys(grouped).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-primary-500 rounded-full" />
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Specifications</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {specifications.length}
        </span>
      </div>

      {hasGroups ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(grouped).map(([groupName, items]) => {
            const GroupIcon = getGroupIcon(groupName);
            const colors = getGroupColors(groupName);
            return (
              <div key={groupName} className={`rounded-xl border ${colors.split(' ').slice(0, 2).join(' ')} overflow-hidden bg-white dark:bg-gray-800 shadow-sm`}>
                <div className={`px-4 py-2.5 border-b ${colors.split(' ')[1]} bg-opacity-30 flex items-center gap-2`}>
                  <GroupIcon className={`w-4 h-4 ${colors.split(' ')[2]}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${colors.split(' ')[2]}`}>
                    {groupName}
                  </span>
                </div>
                <div className="p-1">
                  {items.map((spec, idx) => {
                    const Icon = getFieldIcon(spec.name);
                    const { text, isBoolean, boolValue } = formatValue(spec.value, spec.type);
                    return (
                      <div key={spec.name} className={`flex items-center gap-3 px-3 py-2 ${idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-700/30' : ''} rounded-lg mx-0.5`}>
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                            {spec.label}
                          </span>
                          {isBoolean ? (
                            <span className={`inline-flex items-center gap-1 text-sm font-semibold ${boolValue ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                              {boolValue ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                              )}
                              {text}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate block">
                              {text}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {ungrouped.length > 0 && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm sm:col-span-2">
              <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Details</span>
              </div>
              <div className="p-1">
                {ungrouped.map((spec, idx) => {
                  const Icon = getFieldIcon(spec.name);
                  const { text, isBoolean, boolValue } = formatValue(spec.value, spec.type);
                  return (
                    <div key={spec.name} className={`flex items-center gap-3 px-3 py-2 ${idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-700/30' : ''} rounded-lg mx-0.5`}>
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider block">{spec.label}</span>
                        {isBoolean ? (
                          <span className={`inline-flex items-center gap-1 text-sm font-semibold ${boolValue ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {boolValue ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <X className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />}
                            {text}
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate block">{text}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {specifications.map((spec, idx) => {
              const Icon = getFieldIcon(spec.name);
              const { text, isBoolean, boolValue } = formatValue(spec.value, spec.type);
              return (
                <div key={spec.name} className={`flex items-center gap-3 px-4 py-2.5 ${idx % 2 === 0 ? 'bg-gray-50/30 dark:bg-gray-700/20' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-baseline justify-between gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{spec.label}</span>
                    {isBoolean ? (
                      <span className={`inline-flex items-center gap-1 text-sm font-semibold flex-shrink-0 ${boolValue ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {boolValue ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <X className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />}
                        {text}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0">{text}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function Wifi({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
    </svg>
  );
}
