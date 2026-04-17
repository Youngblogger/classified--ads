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
  Hammer, Palette, Truck, Stethoscope, ChevronRight, MoreHorizontal, Loader2
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

const iconComponents: Record<string, any> = {
  'smartphone': Smartphone, 'phone': Smartphone, 'mobile': Smartphone,
  'telecommunications': Smartphone, 'phones-tablets': Smartphone, 'mobile-phones-tablets': Smartphone,
  'car': Car, 'vehicle': Car, 'vehicles': Car, 'automotive': Car, 'cars-vehicles': Car,
  'property': Home, 'home': Home, 'real-estate': Home, 'properties': Home,
  'electronics': Laptop, 'laptop': Laptop, 'computer': Laptop, 'computers-laptops': Laptop,
  'fashion': Shirt, 'clothing': Shirt, 'apparel': Shirt, 'fashion-style': Shirt,
  'services': Briefcase, 'service': Briefcase, 'consulting-professional': Briefcase, 'jobs': Briefcase,
  'furniture': Sofa, 'home-furniture': Sofa, 'home-furniture-appliances': Sofa,
  'repair': Wrench, 'repairs': Wrench, 'tools': Wrench, 'tools-equipment': Wrench, 'repair-services': Wrench,
  'beauty': Heart, 'health': Heart, 'wellness-spa': Heart, 'hair-beauty': Heart,
  'baby': Baby, 'babies-kids': Baby, 'kids': Baby,
  'sports': Dumbbell, 'fitness': Dumbbell, 'sports-fitness': Dumbbell,
  'books': BookOpen, 'books-media': BookOpen, 'education': GraduationCap,
  'pets': Dog, 'animals': Dog, 'pets-animals': Dog,
  'garden': TreePine, 'outdoor': TreePine, 'agriculture': TreePine, 'agriculture-farming': TreePine,
  'gaming': Gamepad2,
  'shopping': ShoppingBag,
  'food': UtensilsCrossed, 'catering': UtensilsCrossed,
  'music': Music, 'entertainment': Music,
  'travel': Plane,
  'construction': Hammer, 'art': Palette, 'art-collectibles': Palette,
  'transport': Truck, 'logistics': Truck,
  'medical': Stethoscope, 'healthcare': Stethoscope,
};

function getCategoryIcon(slug?: string, name?: string) {
  if (!slug && !name) return Briefcase;
  const slugKey = slug?.toLowerCase().replace(/[^a-z0-9]/g, '-');
  if (slugKey && iconComponents[slugKey]) return iconComponents[slugKey];
  const nameKey = name?.toLowerCase().split(' ')[0];
  if (nameKey && iconComponents[nameKey]) return iconComponents[nameKey];
  return Briefcase;
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
  
  const { data, error, isLoading } = useSWR(
    `${API_URL}/categories`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  const categories: Category[] = data?.data || [];

  const handleCategoryClick = (slug: string) => {
    if (onCategorySelect) {
      onCategorySelect(slug);
    } else {
      router.push(`/ads?category=${slug}`);
    }
  };

  const handleSeeAll = () => {
    setShowCategoryModal(true);
  };

  // Categories to hide on desktop
  const hideOnDesktop = ['pets-animals', 'pets', 'animals', 'garden', 'agriculture', 'agriculture-farming', 'food-catering', 'food', 'catering'];
  
  // Fallback categories using getEmojiForCategory (same as mobile view)
  const fallbackCategories = [
    { name: 'Phones & Tablets', slug: 'mobile-phones-tablets' },
    { name: 'Vehicles', slug: 'vehicles' },
    { name: 'Property', slug: 'property' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Services', slug: 'services' },
    { name: 'Furniture', slug: 'home-furniture' },
    { name: 'Repairs', slug: 'repair-services' },
    { name: 'Health & Beauty', slug: 'health-beauty' },
    { name: 'Sports', slug: 'sports-fitness' },
    { name: 'Babies & Kids', slug: 'babies-kids' },
    { name: 'Jobs', slug: 'jobs' },
  ];
  
  // Process categories from API with emoji from mobile view, or use fallback
  const categorySource = categories.length > 0 ? categories : fallbackCategories;
  const processedCategories = (Array.isArray(categorySource) ? categorySource : [])
    .filter((c: any) => !c.parent_id || !('parent_id' in c))
    .slice(0, 12)
    .map((cat: any) => {
      const emoji = getEmojiForCategory(cat.name);
      return {
        name: cat.name,
        slug: cat.slug,
        emoji: emoji,
        color: getColorForCategory(cat.name).bg,
        iconColor: getColorForCategory(cat.name).text,
        hideOnDesktop: hideOnDesktop.includes(String(cat.slug).toLowerCase()),
      };
    });

  return (
    <div 
      className={`bg-white border-b border-gray-100 relative z-[50] ${className}`}
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 xl:container xl:mx-auto">
        <div className="relative">
          {/* Scrollable Container */}
          <div 
            ref={scrollRef}
            className="flex gap-1 sm:gap-2 py-2 sm:py-3 overflow-x-auto scrollbar-visible"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center gap-2 px-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-400">Loading...</span>
              </div>
            )}

            {/* All Button with Globe Emoji */}
            {!isLoading && (
              <button
                onClick={() => handleCategoryClick('')}
                className={`
                  flex flex-col items-center gap-1 flex-shrink-0
                  px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl
                  transition-all duration-200
                  ${!selectedCategory 
                    ? 'bg-primary-50 ring-2 ring-primary-200' 
                    : 'hover:bg-gray-50 active:scale-95'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center
                  transition-all duration-200 shadow-sm
                  ${!selectedCategory ? 'bg-primary-100' : 'bg-gray-100'}
                `}>
                  <span style={{ fontSize: '24px', lineHeight: 1 }}>🌐</span>
                </div>
                <span className={`
                  text-[10px] sm:text-xs font-medium text-center leading-tight
                  ${!selectedCategory ? 'text-primary-600' : 'text-gray-700'}
                  max-w-[50px] sm:max-w-[70px] truncate
                `}>
                  All
                </span>
              </button>
            )}

            {/* Category Items */}
            {!isLoading && processedCategories.map((category, index) => {
              const IconComponent = getCategoryIcon(category.slug, category.name);
              const isSelected = selectedCategory === category.slug;

              return (
                <button
                  key={`${category.slug}-${index}`}
                  onClick={() => handleCategoryClick(category.slug)}
                  className={`
                    flex flex-col items-center gap-1 flex-shrink-0
                    px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl
                    transition-all duration-200
                    ${category.hideOnDesktop ? 'lg:hidden' : ''}
                    ${isSelected 
                      ? 'bg-primary-50 ring-2 ring-primary-200' 
                      : 'hover:bg-gray-50 active:scale-95'
                    }
                  `}
                >
                  {/* Icon Container */}
                  <div className={`
                    w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center
                    transition-all duration-200 shadow-sm
                    ${isSelected 
                      ? 'bg-primary-100' 
                      : category.color
                    }
                  `}>
                    {category.emoji ? (
                      <span style={{ fontSize: '24px', lineHeight: 1 }}>
                        {category.emoji}
                      </span>
                    ) : (
                      <IconComponent 
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          isSelected ? 'text-primary-600' : category.iconColor
                        }`} 
                      />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={`
                    text-[10px] sm:text-xs font-medium text-center leading-tight
                    ${isSelected ? 'text-primary-600' : 'text-gray-700'}
                    max-w-[50px] sm:max-w-[70px] truncate
                  `}>
                    {category.name}
                  </span>
                </button>
              );
            })}

            {/* See All Button - Hidden on Desktop */}
            {!isLoading && (
              <button
                onClick={handleSeeAll}
                className="hidden max-md:flex flex-col items-center gap-1 flex-shrink-0 px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl hover:bg-gray-50 active:scale-95 transition-all duration-200"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                  <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-gray-600 text-center leading-tight max-w-[50px] sm:max-w-[70px]">
                  See All
                </span>
              </button>
            )}
          </div>

          {/* Fade Gradient (Right Edge) */}
          <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-r from-transparent to-white pointer-events-none" />
        </div>
      </div>

      {/* Scrollbar CSS */}
      <style jsx global>{`
        .scrollbar-visible::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-visible::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .scrollbar-visible::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .scrollbar-visible::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      {/* Category Modal */}
      <CategoryModal 
        isOpen={showCategoryModal} 
        onClose={() => setShowCategoryModal(false)} 
        selectedCategory={selectedCategory}
      />
    </div>
  );
}

// Helper function to get emoji for category
function getEmojiForCategory(name: string): string | undefined {
  if (!name) return undefined;
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('phone') || nameLower.includes('mobile') || nameLower.includes('tablet')) return '📱';
  if (nameLower.includes('vehicle') || nameLower.includes('car') || nameLower.includes('automotive') || nameLower.includes('bicycle')) return '🚗';
  if (nameLower.includes('property') || nameLower.includes('estate') || nameLower.includes('real estate') || nameLower.includes('land') || nameLower.includes('house')) return '🏠';
  if (nameLower.includes('electronic') || nameLower.includes('computer') || nameLower.includes('laptop') || nameLower.includes('tv') || nameLower.includes('camera')) return '💻';
  if (nameLower.includes('fashion') || nameLower.includes('clothing') || nameLower.includes('apparel') || nameLower.includes('shoe') || nameLower.includes('bag')) return '👕';
  if (nameLower.includes('service') || nameLower.includes('professional')) return '🛠️';
  if (nameLower.includes('furniture') || nameLower.includes('home')) return '🛋️';
  if (nameLower.includes('repair') || nameLower.includes('maintenance')) return '🔧';
  if (nameLower.includes('health') || nameLower.includes('beauty') || nameLower.includes('spa')) return '💄';
  if (nameLower.includes('sport') || nameLower.includes('fitness') || nameLower.includes('gym')) return '⚽';
  if (nameLower.includes('baby') || nameLower.includes('kid') || nameLower.includes('children')) return '👶';
  if (nameLower.includes('job') || nameLower.includes('employment')) return '💼';
  if (nameLower.includes('agriculture') || nameLower.includes('farm') || nameLower.includes('garden')) return '🌾';
  if (nameLower.includes('shop') || nameLower.includes('store')) return '🛒';
  if (nameLower.includes('food') || nameLower.includes('catering') || nameLower.includes('restaurant')) return '🍔';
  if (nameLower.includes('music') || nameLower.includes('instrument')) return '🎵';
  
  return undefined;
}

// Helper function to assign colors
function getColorForCategory(name: string): { bg: string; text: string } {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('phone') || nameLower.includes('mobile')) return { bg: 'bg-blue-50', text: 'text-blue-600' };
  if (nameLower.includes('vehicle') || nameLower.includes('car')) return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
  if (nameLower.includes('property') || nameLower.includes('estate')) return { bg: 'bg-purple-50', text: 'text-purple-600' };
  if (nameLower.includes('electronic') || nameLower.includes('computer')) return { bg: 'bg-amber-50', text: 'text-amber-600' };
  if (nameLower.includes('fashion') || nameLower.includes('clothing')) return { bg: 'bg-pink-50', text: 'text-pink-600' };
  if (nameLower.includes('service')) return { bg: 'bg-cyan-50', text: 'text-cyan-600' };
  if (nameLower.includes('furniture')) return { bg: 'bg-orange-50', text: 'text-orange-600' };
  if (nameLower.includes('repair')) return { bg: 'bg-indigo-50', text: 'text-indigo-600' };
  if (nameLower.includes('baby') || nameLower.includes('kid')) return { bg: 'bg-yellow-50', text: 'text-yellow-600' };
  if (nameLower.includes('sport') || nameLower.includes('fitness')) return { bg: 'bg-green-50', text: 'text-green-600' };
  if (nameLower.includes('pet')) return { bg: 'bg-teal-50', text: 'text-teal-600' };
  if (nameLower.includes('health') || nameLower.includes('beauty')) return { bg: 'bg-rose-50', text: 'text-rose-600' };
  if (nameLower.includes('book') || nameLower.includes('education')) return { bg: 'bg-violet-50', text: 'text-violet-600' };
  if (nameLower.includes('food') || nameLower.includes('catering')) return { bg: 'bg-red-50', text: 'text-red-600' };
  if (nameLower.includes('music') || nameLower.includes('art')) return { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600' };
  if (nameLower.includes('job')) return { bg: 'bg-slate-100', text: 'text-slate-600' };
  if (nameLower.includes('agriculture')) return { bg: 'bg-lime-50', text: 'text-lime-600' };
  if (nameLower.includes('shop')) return { bg: 'bg-violet-50', text: 'text-violet-600' };
  
  return { bg: 'bg-gray-100', text: 'text-gray-600' };
}
