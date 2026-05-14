'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Smartphone, Car, Home, Laptop, Shirt, Briefcase,
  Sofa, Wrench, Heart, Baby, Dumbbell, BookOpen,
  Dog, TreePine, Gamepad2, GraduationCap,
  ShoppingBag, UtensilsCrossed, Music, Plane,
  Hammer, Palette, Truck, Stethoscope, MoreHorizontal, Loader2
} from 'lucide-react';
import CategoryModal from './CategoryModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  parent_id?: number | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

const iconMap: Record<string, any> = {
  smartphone: Smartphone, phone: Smartphone, mobile: Smartphone,
  telecommunications: Smartphone, 'phones-tablets': Smartphone, 'mobile-phones-tablets': Smartphone,
  car: Car, vehicle: Car, vehicles: Car, automotive: Car, 'cars-vehicles': Car,
  property: Home, 'real-estate': Home, properties: Home,
  electronics: Laptop, laptop: Laptop, computer: Laptop, 'computers-laptops': Laptop,
  fashion: Shirt, clothing: Shirt, apparel: Shirt, 'fashion-style': Shirt,
  services: Briefcase, service: Briefcase, 'consulting-professional': Briefcase, jobs: Briefcase,
  furniture: Sofa, 'home-furniture': Sofa, 'home-furniture-appliances': Sofa,
  repair: Wrench, repairs: Wrench, tools: Wrench, 'tools-equipment': Wrench, 'repair-services': Wrench,
  beauty: Heart, health: Heart, 'wellness-spa': Heart, 'hair-beauty': Heart,
  baby: Baby, 'babies-kids': Baby, kids: Baby,
  sports: Dumbbell, fitness: Dumbbell, 'sports-fitness': Dumbbell,
  books: BookOpen, 'books-media': BookOpen, education: GraduationCap,
  pets: Dog, animals: Dog, 'pets-animals': Dog,
  garden: TreePine, outdoor: TreePine, agriculture: TreePine, 'agriculture-farming': TreePine,
  gaming: Gamepad2,
  shopping: ShoppingBag,
  food: UtensilsCrossed, catering: UtensilsCrossed,
  music: Music, entertainment: Music,
  travel: Plane,
  construction: Hammer, art: Palette, 'art-collectibles': Palette,
  transport: Truck, logistics: Truck,
  medical: Stethoscope, healthcare: Stethoscope,
};

function getIcon(slug?: string, name?: string) {
  if (!slug && !name) return Briefcase;
  const key = slug?.toLowerCase().replace(/[^a-z0-9]/g, '-');
  if (key && iconMap[key]) return iconMap[key];
  const nameKey = name?.toLowerCase().split(' ')[0];
  if (nameKey && iconMap[nameKey]) return iconMap[nameKey];
  return Briefcase;
}

const fallbackCategories = [
  { name: 'Phones & Tablets', slug: 'mobile-phones-tablets' },
  { name: 'Vehicles', slug: 'vehicles' },
  { name: 'Property', slug: 'property' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Services', slug: 'services' },
  { name: 'Furniture', slug: 'home-furniture' },
  { name: 'Repairs', slug: 'repair-services' },
  { name: 'Health & Beauty', slug: 'health-beauty' },
  { name: 'Sports', slug: 'sports-fitness' },
  { name: 'Babies & Kids', slug: 'babies-kids' },
  { name: 'Jobs', slug: 'jobs' },
];

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  phone: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-200' },
  vehicle: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200' },
  property: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-200' },
  electronic: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200' },
  fashion: { bg: 'bg-pink-50', text: 'text-pink-600', ring: 'ring-pink-200' },
  service: { bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'ring-cyan-200' },
  furniture: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-200' },
  repair: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-200' },
  baby: { bg: 'bg-yellow-50', text: 'text-yellow-600', ring: 'ring-yellow-200' },
  sport: { bg: 'bg-green-50', text: 'text-green-600', ring: 'ring-green-200' },
  pet: { bg: 'bg-teal-50', text: 'text-teal-600', ring: 'ring-teal-200' },
  health: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-200' },
  book: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-200' },
  food: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-200' },
  music: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', ring: 'ring-fuchsia-200' },
  agriculture: { bg: 'bg-lime-50', text: 'text-lime-600', ring: 'ring-lime-200' },
};

function getColors(name: string) {
  const lower = name.toLowerCase();
  for (const [key, colors] of Object.entries(colorMap)) {
    if (lower.includes(key)) return colors;
  }
  return { bg: 'bg-gray-100', text: 'text-gray-600', ring: 'ring-gray-200' };
}

interface CategoryNavProps {
  selectedCategory?: string;
  onCategorySelect?: (slug: string) => void;
  className?: string;
}

export default function CategoryNav({ selectedCategory, onCategorySelect, className = '' }: CategoryNavProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { data, error, isLoading } = useSWR(
    `${API_URL}/categories`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  const categories: Category[] = data?.data || [];
  const source = categories.length > 0 ? categories : fallbackCategories;
  const processed = (Array.isArray(source) ? source : [])
    .filter((c: any) => !c.parent_id || !('parent_id' in c))
    .slice(0, 12)
    .map((cat: any) => ({
      name: cat.name,
      slug: cat.slug,
      colors: getColors(cat.name),
    }));

  const handleCategoryClick = (slug: string) => {
    if (onCategorySelect) {
      onCategorySelect(slug);
    } else {
      router.push(`/ads?category=${slug}`);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      setIsScrolled(scrollRef.current.scrollLeft > 0);
    }
  };

  return (
    <div className={`bg-white border-b border-gray-100 shadow-sm ${className}`}>
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 xl:container xl:mx-auto">
        <div className="relative">
          {isLoading ? (
            <div className="flex items-center gap-4 py-3 px-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse" />
                  <div className="w-14 h-2.5 rounded bg-gray-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex items-center gap-1 sm:gap-2 py-2.5 sm:py-3 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
              >
                <button
                  onClick={() => handleCategoryClick('')}
                  className={`flex flex-col items-center gap-1.5 flex-shrink-0 px-2 py-1 rounded-xl transition-all duration-200 group ${
                    !selectedCategory ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ring-1 ${
                    !selectedCategory
                      ? 'bg-primary-600 text-white ring-primary-600 shadow-md scale-105'
                      : 'bg-gray-100 text-gray-500 ring-gray-100 group-hover:bg-gray-200 group-hover:ring-gray-200 group-hover:shadow-md'
                  }`}>
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="6" r="4" />
                      <path d="M20 21a8 8 0 1 0-16 0" />
                    </svg>
                  </div>
                  <span className={`text-[11px] sm:text-xs font-semibold text-center leading-tight transition-colors duration-200 ${
                    !selectedCategory ? 'text-primary-600' : 'text-gray-600 group-hover:text-gray-900'
                  }`}>
                    All
                  </span>
                </button>

                {processed.map((category, index) => {
                  const IconComponent = getIcon(category.slug, category.name);
                  const isSelected = selectedCategory === category.slug;

                  return (
                    <button
                      key={`${category.slug}-${index}`}
                      onClick={() => handleCategoryClick(category.slug)}
                      className={`flex flex-col items-center gap-1.5 flex-shrink-0 px-2 py-1 rounded-xl transition-all duration-200 group ${
                        isSelected ? 'scale-105' : 'hover:scale-105'
                      }`}
                    >
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ring-1 ${
                        isSelected
                          ? `${category.colors.bg} ${category.colors.text} ring-2 ${category.colors.ring} shadow-md`
                          : `${category.colors.bg} ${category.colors.text} ring-transparent group-hover:ring-1 ${category.colors.ring} group-hover:shadow-md`
                      }`}>
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={isSelected ? 2.5 : 1.8} />
                      </div>
                      <span className={`text-[11px] sm:text-xs font-semibold text-center leading-tight transition-colors duration-200 max-w-[56px] sm:max-w-[72px] truncate ${
                        isSelected ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                      }`}>
                        {category.name}
                      </span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 px-2 py-1 rounded-xl transition-all duration-200 group hover:scale-105"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center transition-all duration-200 shadow-sm ring-1 ring-gray-100 group-hover:bg-gray-100 group-hover:ring-gray-200 group-hover:shadow-md">
                    <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-gray-500 text-center leading-tight group-hover:text-gray-700 transition-colors duration-200">
                    More
                  </span>
                </button>
              </div>

              {isScrolled && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
              )}
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        selectedCategory={selectedCategory}
      />
    </div>
  );
}
