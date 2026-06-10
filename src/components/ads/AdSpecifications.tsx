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

const GROUP_STYLE: Record<string, { header: string; icon: string; text: string; border: string }> = {
  'Basic Info': { header: 'bg-blue-50 border-blue-200', icon: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'Specifications': { header: 'bg-emerald-50 border-emerald-200', icon: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Appearance': { header: 'bg-purple-50 border-purple-200', icon: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  'Features': { header: 'bg-amber-50 border-amber-200', icon: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'Safety': { header: 'bg-red-50 border-red-200', icon: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'Legal': { header: 'bg-slate-50 border-slate-200', icon: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  'Performance': { header: 'bg-orange-50 border-orange-200', icon: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  'Battery': { header: 'bg-yellow-50 border-yellow-200', icon: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Display': { header: 'bg-cyan-50 border-cyan-200', icon: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Connectivity': { header: 'bg-indigo-50 border-indigo-200', icon: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Storage': { header: 'bg-teal-50 border-teal-200', icon: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  'Material': { header: 'bg-rose-50 border-rose-200', icon: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  'Size': { header: 'bg-pink-50 border-pink-200', icon: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  'Gender': { header: 'bg-violet-50 border-violet-200', icon: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
  'Software': { header: 'bg-sky-50 border-sky-200', icon: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
  'Pricing': { header: 'bg-lime-50 border-lime-200', icon: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200' },
  'Condition': { header: 'bg-teal-50 border-teal-200', icon: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  'Listing Type': { header: 'bg-stone-50 border-stone-200', icon: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-200' },
  'Property Details': { header: 'bg-blue-50 border-blue-200', icon: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
};

function getGroupStyle(group: string | null) {
  if (!group) return {
    header: 'bg-gray-50 border-gray-200',
    icon: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  };
  return GROUP_STYLE[group] || GROUP_STYLE['Specifications'];
}

function formatValue(value: string, type: string): { text: string; isBoolean: boolean; boolValue: boolean } {
  if (type === 'boolean') {
    const boolVal = value === 'Yes' || value === 'true' || value === '1';
    return { text: boolVal ? 'Yes' : 'No', isBoolean: true, boolValue: boolVal };
  }
  return { text: value, isBoolean: false, boolValue: false };
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
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-primary-500 rounded-full" />
        <h3 className="text-lg font-bold text-gray-900">Specifications</h3>
        <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2.5 py-0.5 rounded-full">
          {specifications.length}
        </span>
      </div>

      {hasGroups ? (
        <div className="sm:columns-2 gap-6 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {Object.entries(grouped).map(([groupName, items]) => {
            const GroupIcon = getGroupIcon(groupName);
            const style = getGroupStyle(groupName);
            return (
              <div key={groupName} className={`bg-white rounded-2xl border ${style.border} shadow-sm overflow-hidden`}>
                <div className={`px-5 py-3 border-b ${style.border} ${style.header} flex items-center gap-2.5`}>
                  <div className={`w-8 h-8 rounded-xl ${style.icon} flex items-center justify-center`}>
                    <GroupIcon className={`w-4 h-4 ${style.text}`} />
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>
                    {groupName}
                  </span>
                </div>
                <div className="p-2">
                  {items.map((spec, idx) => {
                    const Icon = getFieldIcon(spec.name);
                    const { text, isBoolean, boolValue } = formatValue(spec.value, spec.type);
                    return (
                      <div
                        key={spec.name}
                        className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-colors hover:bg-gray-50"
                      >
                        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4.5 h-4.5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-0.5">
                            {spec.label}
                          </span>
                          {isBoolean ? (
                            <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${boolValue ? 'text-emerald-600' : 'text-gray-400'}`}>
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center ${boolValue ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                                {boolValue ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <X className="w-3 h-3 text-gray-400" />
                                )}
                              </span>
                              {text}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-gray-800 truncate block">
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Details</span>
              </div>
              <div className="p-2">
                {ungrouped.map((spec, idx) => {
                  const Icon = getFieldIcon(spec.name);
                  const { text, isBoolean, boolValue } = formatValue(spec.value, spec.type);
                  return (
                    <div
                      key={spec.name}
                      className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-colors hover:bg-gray-50"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4.5 h-4.5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-0.5">{spec.label}</span>
                        {isBoolean ? (
                          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${boolValue ? 'text-emerald-600' : 'text-gray-400'}`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center ${boolValue ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                              {boolValue ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-gray-400" />}
                            </span>
                            {text}
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-gray-800 truncate block">{text}</span>
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-2">
            {specifications.map((spec) => {
              const Icon = getFieldIcon(spec.name);
              const { text, isBoolean, boolValue } = formatValue(spec.value, spec.type);
              return (
                <div
                  key={spec.name}
                  className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-colors hover:bg-gray-50"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-baseline justify-between gap-4">
                    <span className="text-sm text-gray-500 truncate">{spec.label}</span>
                    {isBoolean ? (
                      <span className={`inline-flex items-center gap-1.5 text-sm font-semibold flex-shrink-0 ${boolValue ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center ${boolValue ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                          {boolValue ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-gray-400" />}
                        </span>
                        {text}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-800 flex-shrink-0">{text}</span>
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
