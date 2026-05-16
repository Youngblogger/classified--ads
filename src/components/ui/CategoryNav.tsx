'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Loader2, ChevronRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

const iconEmojis: Record<string, string> = {
  smartphone: '\uD83D\uDCF1', phone: '\uD83D\uDCF1', mobile: '\uD83D\uDCF1',
  telecommunications: '\uD83D\uDCF1', 'phones-tablets': '\uD83D\uDCF1', 'mobile-phones-tablets': '\uD83D\uDCF1',
  car: '\uD83D\uDE97', vehicle: '\uD83D\uDE97', vehicles: '\uD83D\uDE97', automotive: '\uD83D\uDE97', 'cars-vehicles': '\uD83D\uDE97',
  property: '\uD83C\uDFE0', home: '\uD83C\uDFE0', 'real-estate': '\uD83C\uDFE0', properties: '\uD83C\uDFE0',
  electronics: '\uD83D\uDCBB', laptop: '\uD83D\uDCBB', computer: '\uD83D\uDCBB', 'computers-laptops': '\uD83D\uDCBB',
  fashion: '\uD83D\uDC55', clothing: '\uD83D\uDC55', apparel: '\uD83D\uDC55', 'fashion-style': '\uD83D\uDC55',
  services: '\uD83D\uDEE0\uFE0F', service: '\uD83D\uDEE0\uFE0F', 'consulting-professional': '\uD83D\uDEE0\uFE0F', jobs: '\uD83D\uDCBC',
  furniture: '\uD83D\uDECB\uFE0F', 'home-furniture': '\uD83D\uDECB\uFE0F', 'home-furniture-appliances': '\uD83D\uDECB\uFE0F',
  repair: '\uD83D\uDD27', repairs: '\uD83D\uDD27', tools: '\uD83D\uDD27', 'tools-equipment': '\uD83D\uDD27', 'repair-services': '\uD83D\uDD27',
  beauty: '\uD83D\uDC84', health: '\u2764\uFE0F', 'wellness-spa': '\uD83D\uDC86', 'hair-beauty': '\uD83D\uDC87',
  baby: '\uD83D\uDC76', 'babies-kids': '\uD83D\uDC76', kids: '\uD83D\uDC76',
  sports: '\uD83C\uDFCB\uFE0F', fitness: '\uD83C\uDFCB\uFE0F', 'sports-fitness': '\uD83C\uDFCB\uFE0F',
  books: '\uD83D\uDCDA', 'books-media': '\uD83D\uDCDA', education: '\uD83C\uDF93',
  pets: '\uD83D\uDC3E', animals: '\uD83D\uDC3E', 'pets-animals': '\uD83D\uDC3E',
  garden: '\uD83C\uDF33', outdoor: '\uD83C\uDF33', agriculture: '\uD83C\uDF3E', 'agriculture-farming': '\uD83C\uDF3E',
  gaming: '\uD83C\uDFAE',
  shopping: '\uD83D\uDED2',
  food: '\uD83C\uDF7D\uFE0F', catering: '\uD83C\uDF7D\uFE0F',
  music: '\uD83C\uDFB5', entertainment: '\uD83C\uDFAD',
  travel: '\u2708\uFE0F',
  construction: '\uD83C\uDFD7\uFE0F', art: '\uD83C\uDFA8', 'art-collectibles': '\uD83C\uDFA8',
  transport: '\uD83D\uDE9A', logistics: '\uD83D\uDE9A',
  medical: '\uD83C\uDFE5', healthcare: '\uD83C\uDFE5',
};

function getCategoryEmoji(slug?: string, name?: string): string {
  if (!slug && !name) return '\uD83D\uDCC1';
  const slugKey = slug?.toLowerCase().replace(/[^a-z0-9]/g, '-');
  if (slugKey && iconEmojis[slugKey]) return iconEmojis[slugKey];
  const nameKey = name?.toLowerCase().split(' ')[0];
  if (nameKey && iconEmojis[nameKey]) return iconEmojis[nameKey];
  return '\uD83D\uDCC1';
}

const colorMap: Record<string, { bg: string }> = {
  phone: { bg: 'bg-blue-100' },
  vehicle: { bg: 'bg-emerald-100' },
  property: { bg: 'bg-purple-100' },
  electronic: { bg: 'bg-amber-100' },
  fashion: { bg: 'bg-pink-100' },
  service: { bg: 'bg-cyan-100' },
  furniture: { bg: 'bg-orange-100' },
  repair: { bg: 'bg-indigo-100' },
  baby: { bg: 'bg-yellow-100' },
  sport: { bg: 'bg-green-100' },
  pet: { bg: 'bg-teal-100' },
  health: { bg: 'bg-rose-100' },
  book: { bg: 'bg-violet-100' },
  food: { bg: 'bg-red-100' },
  music: { bg: 'bg-fuchsia-100' },
  agriculture: { bg: 'bg-lime-100' },
};

function getCategoryColor(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('phone') || lower.includes('mobile')) return colorMap.phone;
  if (lower.includes('vehicle') || lower.includes('car')) return colorMap.vehicle;
  if (lower.includes('property') || lower.includes('estate')) return colorMap.property;
  if (lower.includes('electronic') || lower.includes('computer')) return colorMap.electronic;
  if (lower.includes('fashion') || lower.includes('clothing')) return colorMap.fashion;
  if (lower.includes('service')) return colorMap.service;
  if (lower.includes('furniture')) return colorMap.furniture;
  if (lower.includes('repair')) return colorMap.repair;
  if (lower.includes('baby') || lower.includes('kid')) return colorMap.baby;
  if (lower.includes('sport') || lower.includes('fitness')) return colorMap.sport;
  if (lower.includes('pet')) return colorMap.pet;
  if (lower.includes('health') || lower.includes('beauty')) return colorMap.health;
  if (lower.includes('book') || lower.includes('education')) return colorMap.book;
  if (lower.includes('food') || lower.includes('catering')) return colorMap.food;
  if (lower.includes('music') || lower.includes('art')) return colorMap.music;
  return { bg: 'bg-gray-100' };
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

interface CategoryNavProps {
  selectedCategory?: string;
  onCategorySelect?: (slug: string) => void;
  className?: string;
}

export default function CategoryNav({ selectedCategory, onCategorySelect, className = '' }: CategoryNavProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, error, isLoading } = useSWR(
    `${API_URL}/categories`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  const categories: Category[] = data?.data || [];
  const source = categories.length > 0 ? categories : fallbackCategories;
  const processed = (Array.isArray(source) ? source : [])
    .filter((c: any) => !c.parent_id || !('parent_id' in c))
    .map((cat: any) => ({
      name: cat.name,
      slug: cat.slug,
      emoji: getCategoryEmoji(cat.slug, cat.name),
      color: getCategoryColor(cat.name),
    }));

  const handleCategoryClick = (slug: string) => {
    if (onCategorySelect) {
      onCategorySelect(slug);
    } else {
      router.push(`/ads?category=${slug}`);
    }
  };

  return (
    <div className={`bg-white border-b border-gray-100 shadow-sm ${className}`}>
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 xl:container xl:mx-auto">
        {isLoading ? (
          <div className="flex items-center gap-4 py-3 px-2 overflow-x-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse" />
                <div className="w-14 h-2.5 rounded bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex items-center gap-1 sm:gap-2 py-2.5 sm:py-3 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            <button
              onClick={() => handleCategoryClick('')}
              className={`flex flex-col items-center gap-1 flex-shrink-0 px-2 py-1 rounded-xl transition-all duration-200 group ${
                !selectedCategory ? 'scale-105' : 'hover:scale-105'
              }`}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ring-1 text-xl ${
                !selectedCategory
                  ? 'bg-primary-600 text-white ring-primary-600 shadow-md scale-105'
                  : 'bg-gray-100 ring-gray-100 group-hover:bg-gray-200 group-hover:ring-gray-200 group-hover:shadow-md'
              }`}>
                📋
              </div>
              <span className={`text-[11px] sm:text-xs font-semibold text-center leading-tight transition-colors duration-200 ${
                !selectedCategory ? 'text-primary-600' : 'text-gray-600 group-hover:text-gray-900'
              }`}>
                All
              </span>
            </button>

            {processed.map((category, index) => (
              <button
                key={`${category.slug}-${index}`}
                onClick={() => handleCategoryClick(category.slug)}
                className={`flex flex-col items-center gap-1 flex-shrink-0 px-2 py-1 rounded-xl transition-all duration-200 group ${
                  selectedCategory === category.slug ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ring-1 text-xl ${
                  selectedCategory === category.slug
                    ? 'bg-primary-100 ring-primary-200 shadow-md'
                    : `${category.color.bg} ring-transparent group-hover:ring-1 group-hover:shadow-md`
                }`}>
                  {category.emoji}
                </div>
                <span className={`text-[11px] sm:text-xs font-semibold text-center leading-tight transition-colors duration-200 max-w-[56px] sm:max-w-[72px] truncate ${
                  selectedCategory === category.slug ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                }`}>
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
