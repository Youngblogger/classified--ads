'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Sparkles, Zap, ChevronRight, ShoppingBag } from 'lucide-react';

type RecommendationItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  location?: string;
  isFeatured?: boolean;
  isBoosted?: boolean;
  category?: string;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

const fallbackImage = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image';

const MOCK_ITEMS: RecommendationItem[] = [
  { id: '1', title: 'iPhone 14 Pro Max 256GB', price: 850000, image: 'https://picsum.photos/seed/iphone14/400/300', location: 'Lagos', isFeatured: true, isBoosted: true, category: 'Mobile Phones' },
  { id: '2', title: 'Toyota Camry 2020 Sport Edition', price: 4500000, image: 'https://picsum.photos/seed/camry/400/300', location: 'Abuja', isFeatured: true, category: 'Vehicles' },
  { id: '3', title: '3-Bedroom Flat for Rent in Ikeja', price: 1500000, image: 'https://picsum.photos/seed/apartment/400/300', location: 'Lagos', category: 'Property' },
  { id: '4', title: 'MacBook Pro M3 16-inch 32GB RAM', price: 2100000, image: 'https://picsum.photos/seed/macbook/400/300', location: 'Lagos', isBoosted: true, category: 'Laptops' },
  { id: '5', title: 'Nike Air Max 90 Premium Sneakers', price: 85000, image: 'https://picsum.photos/seed/nike/400/300', category: 'Fashion' },
  { id: '6', title: 'Samsung 65" 4K Smart TV', price: 620000, image: 'https://picsum.photos/seed/tv/400/300', location: 'Port Harcourt', isFeatured: true, category: 'Electronics' },
  { id: '7', title: 'LG Standing Fan 16-inch', price: 32000, image: 'https://picsum.photos/seed/fan/400/300', location: 'Ibadan', category: 'Home & Furniture' },
  { id: '8', title: 'German Shepherd Puppies for Sale', price: 180000, image: 'https://picsum.photos/seed/puppy/400/300', location: 'Abuja', isBoosted: true, category: 'Pets' },
];

function RecommendationCard({ item }: { item: RecommendationItem }) {
  return (
    <Link
      href={`/ad/${item.id}`}
      className="group flex-shrink-0 w-[180px] sm:w-[200px] snap-start bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={item.image || fallbackImage}
          alt={item.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="200px"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.isFeatured && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] font-bold rounded-full shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
          {item.isBoosted && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[9px] font-bold rounded-full shadow-sm">
              <Zap className="w-2.5 h-2.5" />
              Boosted
            </span>
          )}
        </div>
        <div className="absolute bottom-2 right-2">
          <div className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-primary-600 shadow-sm">
            {formatPrice(item.price)}
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <h3 className="text-[11px] font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.2em]">
          {item.title}
        </h3>
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400">
          <ShoppingBag className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{item.category || 'General'}</span>
          <span className="mx-1">·</span>
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{item.location || 'Nigeria'}</span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[200px] sm:w-[220px] snap-start bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-2.5 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-2.5 bg-gray-200 rounded w-2/3" />
        <div className="h-2 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function RecommendationFeed() {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canScrollLeftRef = useRef(false);
  const canScrollRightRef = useRef(true);
  const [, forceRender] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchRecommendations() {
      try {
        // Simulate API call — replace with real endpoint when available
        await new Promise((r) => setTimeout(r, 600));
        if (!mounted) return;

        const sorted = [...MOCK_ITEMS].sort((a, b) => {
          const aScore = (a.isFeatured ? 3 : 0) + (a.isBoosted ? 2 : 0);
          const bScore = (b.isFeatured ? 3 : 0) + (b.isBoosted ? 2 : 0);
          return bScore - aScore;
        });

        setItems(sorted);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchRecommendations();
    return () => { mounted = false; };
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    canScrollLeftRef.current = el.scrollLeft > 8;
    canScrollRightRef.current = el.scrollLeft < el.scrollWidth - el.clientWidth - 8;
    forceRender((n) => n + 1);
  };

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section className="w-full mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-50">
            <Sparkles className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Recommended for you</h2>
            <p className="text-[10px] text-gray-500">Based on popular listings</p>
          </div>
        </div>
        <Link
          href="/ads"
          className="flex items-center gap-0.5 text-[11px] font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="relative">
        {canScrollLeftRef.current && (
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#F5F7FA]/50 to-transparent z-10 pointer-events-none" />
        )}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((item) => <RecommendationCard key={item.id} item={item} />)
          }
        </div>
        {canScrollRightRef.current && (
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#F5F7FA]/50 to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </section>
  );
}
