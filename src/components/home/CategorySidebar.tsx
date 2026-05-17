'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, ChevronRight, Menu, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/config';
import useSWR from 'swr';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  parent_id?: number;
  ad_count?: number;
  children?: Category[];
}

const fetcher = (url: string) =>
  fetch(url).then(r => r.json()).then(r => Array.isArray(r) ? r : r.data || []);

const fallbackCategories: Category[] = [
  { id: 1, name: 'Vehicles', slug: 'vehicles', ad_count: 2800, children: [
    { id: 101, name: 'Cars', slug: 'cars', parent_id: 1, ad_count: 1500, children: [
      { id: 1001, name: 'Toyota', slug: 'toyota', parent_id: 101 },
      { id: 1002, name: 'Honda', slug: 'honda', parent_id: 101 },
      { id: 1003, name: 'Mercedes-Benz', slug: 'mercedes-benz', parent_id: 101 },
      { id: 1004, name: 'BMW', slug: 'bmw', parent_id: 101 },
      { id: 1005, name: 'Lexus', slug: 'lexus', parent_id: 101 },
      { id: 1006, name: 'Ford', slug: 'ford', parent_id: 101 },
      { id: 1007, name: 'Hyundai', slug: 'hyundai', parent_id: 101 },
      { id: 1008, name: 'Kia', slug: 'kia', parent_id: 101 },
      { id: 1009, name: 'Volkswagen', slug: 'volkswagen', parent_id: 101 },
      { id: 1010, name: 'Nissan', slug: 'nissan', parent_id: 101 },
    ]},
    { id: 102, name: 'Motorcycles', slug: 'motorcycles', parent_id: 1, ad_count: 450, children: [
      { id: 1011, name: 'Honda', slug: 'honda-motorcycles', parent_id: 102 },
      { id: 1012, name: 'Yamaha', slug: 'yamaha', parent_id: 102 },
      { id: 1013, name: 'Suzuki', slug: 'suzuki', parent_id: 102 },
      { id: 1014, name: 'Bajaj', slug: 'bajaj', parent_id: 102 },
      { id: 1015, name: 'TVS', slug: 'tvs', parent_id: 102 },
    ]},
    { id: 103, name: 'Trucks & Trailers', slug: 'trucks-trailers', parent_id: 1, ad_count: 180 },
    { id: 104, name: 'Boats & Watercraft', slug: 'boats-watercraft', parent_id: 1, ad_count: 90 },
    { id: 105, name: 'Auto Parts & Accessories', slug: 'auto-parts', parent_id: 1, ad_count: 320 },
    { id: 106, name: 'Buses & Minivans', slug: 'buses-minivans', parent_id: 1, ad_count: 60 },
  ]},
  { id: 2, name: 'Mobile Phones & Tablets', slug: 'mobile-phones-tablets', ad_count: 3500, children: [
    { id: 201, name: 'Smartphones', slug: 'smartphones', parent_id: 2, ad_count: 2200, children: [
      { id: 2001, name: 'Apple iPhone', slug: 'iphone', parent_id: 201 },
      { id: 2002, name: 'Samsung Galaxy', slug: 'samsung-galaxy', parent_id: 201 },
      { id: 2003, name: 'Tecno', slug: 'tecno', parent_id: 201 },
      { id: 2004, name: 'Infinix', slug: 'infinix', parent_id: 201 },
      { id: 2005, name: 'Nokia', slug: 'nokia', parent_id: 201 },
      { id: 2006, name: 'Xiaomi', slug: 'xiaomi', parent_id: 201 },
      { id: 2007, name: 'Oppo', slug: 'oppo', parent_id: 201 },
      { id: 2008, name: 'Google Pixel', slug: 'google-pixel', parent_id: 201 },
    ]},
    { id: 202, name: 'Tablets', slug: 'tablets', parent_id: 2, ad_count: 450, children: [
      { id: 2009, name: 'iPad', slug: 'ipad', parent_id: 202 },
      { id: 2010, name: 'Samsung Tab', slug: 'samsung-tab', parent_id: 202 },
      { id: 2011, name: 'Huawei', slug: 'huawei', parent_id: 202 },
    ]},
    { id: 203, name: 'Phone Accessories', slug: 'phone-accessories', parent_id: 2, ad_count: 600 },
    { id: 204, name: 'SIM Cards & Plans', slug: 'sim-cards', parent_id: 2, ad_count: 120 },
  ]},
  { id: 3, name: 'Property', slug: 'property', ad_count: 1500, children: [
    { id: 301, name: 'Houses for Sale', slug: 'houses-sale', parent_id: 3, ad_count: 420, children: [
      { id: 3001, name: 'Duplex', slug: 'duplex', parent_id: 301 },
      { id: 3002, name: 'Bungalow', slug: 'bungalow', parent_id: 301 },
      { id: 3003, name: 'Terraced', slug: 'terraced', parent_id: 301 },
      { id: 3004, name: 'Detached', slug: 'detached', parent_id: 301 },
      { id: 3005, name: 'Semi-Detached', slug: 'semi-detached', parent_id: 301 },
    ]},
    { id: 302, name: 'Houses for Rent', slug: 'houses-rent', parent_id: 3, ad_count: 380, children: [
      { id: 3006, name: 'Apartment', slug: 'apartment', parent_id: 302 },
      { id: 3007, name: 'Flat', slug: 'flat', parent_id: 302 },
      { id: 3008, name: 'Self-Contained', slug: 'self-contained', parent_id: 302 },
      { id: 3009, name: 'Room & Parlour', slug: 'room-parlour', parent_id: 302 },
    ]},
    { id: 303, name: 'Land', slug: 'land', parent_id: 3, ad_count: 350, children: [
      { id: 3010, name: 'Residential Land', slug: 'residential-land', parent_id: 303 },
      { id: 3011, name: 'Commercial Land', slug: 'commercial-land', parent_id: 303 },
      { id: 3012, name: 'Agricultural Land', slug: 'agricultural-land', parent_id: 303 },
    ]},
    { id: 304, name: 'Commercial Property', slug: 'commercial-property', parent_id: 3, ad_count: 200 },
    { id: 305, name: 'Short Let', slug: 'short-let', parent_id: 3, ad_count: 150 },
  ]},
  { id: 4, name: 'Electronics', slug: 'electronics', ad_count: 2400, children: [
    { id: 401, name: 'Laptops', slug: 'laptops', parent_id: 4, ad_count: 700, children: [
      { id: 4001, name: 'Dell', slug: 'dell', parent_id: 401 },
      { id: 4002, name: 'HP', slug: 'hp', parent_id: 401 },
      { id: 4003, name: 'MacBook', slug: 'macbook', parent_id: 401 },
      { id: 4004, name: 'Lenovo', slug: 'lenovo', parent_id: 401 },
      { id: 4005, name: 'ASUS', slug: 'asus', parent_id: 401 },
      { id: 4006, name: 'Acer', slug: 'acer', parent_id: 401 },
      { id: 4007, name: 'Microsoft Surface', slug: 'microsoft-surface', parent_id: 401 },
    ]},
    { id: 402, name: 'TVs', slug: 'tvs', parent_id: 4, ad_count: 400, children: [
      { id: 4008, name: 'LED/LCD', slug: 'led-lcd', parent_id: 402 },
      { id: 4009, name: 'Smart TV', slug: 'smart-tv', parent_id: 402 },
      { id: 4010, name: 'OLED', slug: 'oled', parent_id: 402 },
      { id: 4011, name: 'Projectors', slug: 'projectors', parent_id: 402 },
    ]},
    { id: 403, name: 'Gaming Consoles', slug: 'gaming-consoles', parent_id: 4, ad_count: 300, children: [
      { id: 4012, name: 'PlayStation', slug: 'playstation', parent_id: 403 },
      { id: 4013, name: 'Xbox', slug: 'xbox', parent_id: 403 },
      { id: 4014, name: 'Nintendo', slug: 'nintendo', parent_id: 403 },
      { id: 4015, name: 'Games & Accessories', slug: 'games-accessories', parent_id: 403 },
    ]},
    { id: 404, name: 'Cameras & Photography', slug: 'cameras', parent_id: 4, ad_count: 250 },
    { id: 405, name: 'Audio & Headphones', slug: 'audio-headphones', parent_id: 4, ad_count: 200 },
    { id: 406, name: 'Computer Accessories', slug: 'computer-accessories', parent_id: 4, ad_count: 350 },
  ]},
  { id: 5, name: 'Fashion', slug: 'fashion', ad_count: 1900, children: [
    { id: 501, name: "Men's Fashion", slug: 'mens-fashion', parent_id: 5, ad_count: 600, children: [
      { id: 5001, name: 'Shirts', slug: 'shirts', parent_id: 501 },
      { id: 5002, name: 'Trousers', slug: 'trousers', parent_id: 501 },
      { id: 5003, name: 'Suits & Blazers', slug: 'suits', parent_id: 501 },
      { id: 5004, name: 'Shoes', slug: 'mens-shoes', parent_id: 501 },
      { id: 5005, name: 'Watches', slug: 'mens-watches', parent_id: 501 },
    ]},
    { id: 502, name: "Women's Fashion", slug: 'womens-fashion', parent_id: 5, ad_count: 800, children: [
      { id: 5006, name: 'Dresses', slug: 'dresses', parent_id: 502 },
      { id: 5007, name: 'Tops & Blouses', slug: 'tops', parent_id: 502 },
      { id: 5008, name: 'Skirts & Shorts', slug: 'skirts', parent_id: 502 },
      { id: 5009, name: 'Shoes', slug: 'womens-shoes', parent_id: 502 },
      { id: 5010, name: 'Bags & Handbags', slug: 'bags', parent_id: 502 },
      { id: 5011, name: 'Jewelry', slug: 'jewelry', parent_id: 502 },
    ]},
    { id: 503, name: 'Kids & Baby Fashion', slug: 'kids-fashion', parent_id: 5, ad_count: 250 },
    { id: 504, name: 'Accessories', slug: 'fashion-accessories', parent_id: 5, ad_count: 150 },
  ]},
  { id: 6, name: 'Home, Furniture & Appliances', slug: 'home-furniture', ad_count: 1100, children: [
    { id: 601, name: 'Furniture', slug: 'furniture', parent_id: 6, ad_count: 350, children: [
      { id: 6001, name: 'Sofas & Chairs', slug: 'sofas', parent_id: 601 },
      { id: 6002, name: 'Beds & Mattresses', slug: 'beds', parent_id: 601 },
      { id: 6003, name: 'Tables & Desks', slug: 'tables', parent_id: 601 },
      { id: 6004, name: 'Wardrobes & Storage', slug: 'wardrobes', parent_id: 601 },
    ]},
    { id: 602, name: 'Home Appliances', slug: 'home-appliances', parent_id: 6, ad_count: 300, children: [
      { id: 6005, name: 'Refrigerators', slug: 'refrigerators', parent_id: 602 },
      { id: 6006, name: 'Washing Machines', slug: 'washing-machines', parent_id: 602 },
      { id: 6007, name: 'Air Conditioners', slug: 'air-conditioners', parent_id: 602 },
      { id: 6008, name: 'Microwaves & Ovens', slug: 'microwaves', parent_id: 602 },
    ]},
    { id: 603, name: 'Kitchen & Dining', slug: 'kitchen-dining', parent_id: 6, ad_count: 200 },
    { id: 604, name: 'Home Decor & Garden', slug: 'home-decor', parent_id: 6, ad_count: 150 },
    { id: 605, name: 'Lighting & Fans', slug: 'lighting', parent_id: 6, ad_count: 100 },
  ]},
  { id: 7, name: 'Services', slug: 'services', ad_count: 850, children: [
    { id: 701, name: 'Home Services', slug: 'home-services', parent_id: 7, ad_count: 200 },
    { id: 702, name: 'IT & Tech Support', slug: 'it-tech', parent_id: 7, ad_count: 150 },
    { id: 703, name: 'Automotive Services', slug: 'automotive-services', parent_id: 7, ad_count: 120 },
    { id: 704, name: 'Health & Fitness', slug: 'health-fitness', parent_id: 7, ad_count: 100 },
    { id: 705, name: 'Event & Wedding', slug: 'event-planning', parent_id: 7, ad_count: 80 },
    { id: 706, name: 'Cleaning & Sanitation', slug: 'cleaning', parent_id: 7, ad_count: 90 },
    { id: 707, name: 'Tutoring & Classes', slug: 'tutoring', parent_id: 7, ad_count: 60 },
  ]},
  { id: 8, name: 'Jobs', slug: 'jobs', ad_count: 950, children: [
    { id: 801, name: 'IT & Software', slug: 'it-jobs', parent_id: 8, ad_count: 200 },
    { id: 802, name: 'Sales & Marketing', slug: 'sales-marketing', parent_id: 8, ad_count: 150 },
    { id: 803, name: 'Admin & Office', slug: 'admin-office', parent_id: 8, ad_count: 120 },
    { id: 804, name: 'Healthcare & Medical', slug: 'healthcare-jobs', parent_id: 8, ad_count: 90 },
    { id: 805, name: 'Education & Teaching', slug: 'education-jobs', parent_id: 8, ad_count: 80 },
    { id: 806, name: 'Hospitality & Tourism', slug: 'hospitality-jobs', parent_id: 8, ad_count: 70 },
    { id: 807, name: 'Construction & Trades', slug: 'construction-jobs', parent_id: 8, ad_count: 100 },
  ]},
  { id: 9, name: 'Health & Beauty', slug: 'health-beauty', ad_count: 700, children: [
    { id: 901, name: 'Skin Care', slug: 'skin-care', parent_id: 9, ad_count: 180 },
    { id: 902, name: 'Hair Care', slug: 'hair-care', parent_id: 9, ad_count: 150 },
    { id: 903, name: 'Makeup & Cosmetics', slug: 'makeup', parent_id: 9, ad_count: 120 },
    { id: 904, name: 'Supplements & Vitamins', slug: 'supplements', parent_id: 9, ad_count: 100 },
    { id: 905, name: 'Personal Care', slug: 'personal-care', parent_id: 9, ad_count: 80 },
    { id: 906, name: 'Fragrances', slug: 'fragrances', parent_id: 9, ad_count: 70 },
  ]},
  { id: 10, name: 'Sports & Outdoors', slug: 'sports-outdoors', ad_count: 550, children: [
    { id: 1001, name: 'Gym & Fitness', slug: 'gym-fitness', parent_id: 10, ad_count: 180, children: [
      { id: 10001, name: 'Treadmills', slug: 'treadmills', parent_id: 1001 },
      { id: 10002, name: 'Weights & Dumbbells', slug: 'weights', parent_id: 1001 },
      { id: 10003, name: 'Exercise Bikes', slug: 'exercise-bikes', parent_id: 1001 },
      { id: 10004, name: 'Yoga & Pilates', slug: 'yoga', parent_id: 1001 },
    ]},
    { id: 1002, name: 'Outdoor Recreation', slug: 'outdoor-recreation', parent_id: 10, ad_count: 120 },
    { id: 1003, name: 'Sports Equipment', slug: 'sports-equipment', parent_id: 10, ad_count: 150 },
    { id: 1004, name: 'Cycling', slug: 'cycling', parent_id: 10, ad_count: 80 },
  ]},
  { id: 11, name: 'Baby & Kids', slug: 'baby-kids', ad_count: 600, children: [
    { id: 1101, name: 'Baby Gear', slug: 'baby-gear', parent_id: 11, ad_count: 150 },
    { id: 1102, name: 'Toys & Games', slug: 'toys', parent_id: 11, ad_count: 180 },
    { id: 1103, name: "Kids' Clothing", slug: 'kids-clothing', parent_id: 11, ad_count: 120 },
    { id: 1104, name: 'School Supplies', slug: 'school-supplies', parent_id: 11, ad_count: 80 },
    { id: 1105, name: 'Nursery & Maternity', slug: 'nursery', parent_id: 11, ad_count: 70 },
  ]},
  { id: 12, name: 'Pets & Animals', slug: 'pets', ad_count: 400, children: [
    { id: 1201, name: 'Dogs', slug: 'dogs', parent_id: 12, ad_count: 120, children: [
      { id: 12001, name: 'Puppies', slug: 'puppies', parent_id: 1201 },
      { id: 12002, name: 'Adult Dogs', slug: 'adult-dogs', parent_id: 1201 },
      { id: 12003, name: 'Dog Supplies', slug: 'dog-supplies', parent_id: 1201 },
    ]},
    { id: 1202, name: 'Cats', slug: 'cats', parent_id: 12, ad_count: 80 },
    { id: 1203, name: 'Pet Supplies', slug: 'pet-supplies', parent_id: 12, ad_count: 100 },
    { id: 1204, name: 'Fish & Aquariums', slug: 'fish', parent_id: 12, ad_count: 50 },
    { id: 1205, name: 'Birds', slug: 'birds', parent_id: 12, ad_count: 30 },
  ]},
];

const CATEGORY_ICONS: Record<string, string> = {
  vehicles: '\u{1F697}', cars: '\u{1F697}', motorcycles: '\u{1F3CD}',
  'mobile-phones-tablets': '\u{1F4F1}', smartphones: '\u{1F4F1}', tablets: '\u{1F4FA}',
  property: '\u{1F3E0}', houses: '\u{1F3E0}', land: '\u{1F3D4}',
  electronics: '\u{1F4BB}', laptops: '\u{1F4BB}',
  fashion: '\u{1F455}',
  'home-furniture': '\u{1F6CF}', furniture: '\u{1F6CF}',
  services: '\u{1F6E0}',
  jobs: '\u{1F4BC}',
  'health-beauty': '\u{1F484}',
  'sports-outdoors': '\u{26BD}',
  'baby-kids': '\u{1F476}',
  pets: '\u{1F436}', dogs: '\u{1F436}', cats: '\u{1F431}',
};

const CATEGORY_BG: Record<string, string> = {
  vehicles: 'bg-emerald-50', cars: 'bg-emerald-50',
  'mobile-phones-tablets': 'bg-blue-50', smartphones: 'bg-blue-50',
  property: 'bg-violet-50',
  electronics: 'bg-amber-50', laptops: 'bg-amber-50',
  fashion: 'bg-pink-50',
  'home-furniture': 'bg-orange-50', furniture: 'bg-orange-50',
  services: 'bg-cyan-50',
  jobs: 'bg-slate-50',
  'health-beauty': 'bg-rose-50',
  'sports-outdoors': 'bg-green-50',
  'baby-kids': 'bg-yellow-50',
  pets: 'bg-lime-50',
};

function getIcon(slug?: string, name?: string): string {
  if (slug) {
    const lower = slug.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS))
      if (lower === key || lower.includes(key)) return icon;
  }
  if (name) {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS))
      if (lower === key || lower.includes(key)) return icon;
  }
  return '\u{1F4E6}';
}

function getCategoryBg(name?: string): string {
  if (!name) return 'bg-gray-50';
  const lower = name.toLowerCase();
  for (const [key, bg] of Object.entries(CATEGORY_BG))
    if (lower.includes(key)) return bg;
  return 'bg-gray-50';
}

function formatCount(count?: number): string {
  if (count == null) return '';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return count.toLocaleString();
}

function SidebarSkeleton() {
  return (
    <div className="space-y-0.5 p-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse" />
          <div className="flex-1 h-3.5 bg-gray-100 animate-pulse rounded" style={{ width: `${65 + (i % 4) * 8}%` }} />
        </div>
      ))}
    </div>
  );
}

export default function CategorySidebar() {
  const [hoveredCat, setHoveredCat] = useState<Category | null>(null);
  const [hoveredSub, setHoveredSub] = useState<Category | null>(null);
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [activeSub, setActiveSub] = useState<Category | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabletOpen, setTabletOpen] = useState(false);
  const [mobileBreadcrumbs, setMobileBreadcrumbs] = useState<Category[]>([]);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, maxHeight: 400 });

  const sidebarRef = useRef<HTMLDivElement>(null);
  const subPanelRef = useRef<HTMLDivElement>(null);
  const childPanelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { data: apiCats, isLoading } = useSWR<Category[]>(
    `${API_URL}/categories`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000, fallbackData: fallbackCategories }
  );

  const categories = apiCats && apiCats.length > 0 ? apiCats : fallbackCategories;

  const rootCats = useCallback(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(c => c.parent_id == null);
  }, [categories]);

  const getChildren = useCallback((cat: Category): Category[] => {
    if (cat.children && cat.children.length > 0) return cat.children;
    if (!Array.isArray(categories)) return [];
    return categories.filter(c => c.parent_id === cat.id);
  }, [categories]);

  const isActiveCat = (cat: Category) => (hoveredCat || activeCat)?.id === cat.id;
  const isActiveSub = (sub: Category) => (hoveredSub || activeSub)?.id === sub.id;

  const showCatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideCatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showSubTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInPanelRef = useRef(false);

  const clearAllTimers = useCallback(() => {
    if (showCatTimer.current) { clearTimeout(showCatTimer.current); showCatTimer.current = null; }
    if (hideCatTimer.current) { clearTimeout(hideCatTimer.current); hideCatTimer.current = null; }
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); showSubTimer.current = null; }
  }, []);

  const closeAll = useCallback(() => {
    clearAllTimers();
    setHoveredCat(null);
    setHoveredSub(null);
    setActiveCat(null);
    setActiveSub(null);
  }, [clearAllTimers]);

  const scheduleCatHide = useCallback(() => {
    if (hideCatTimer.current) { clearTimeout(hideCatTimer.current); }
    hideCatTimer.current = setTimeout(() => {
      setHoveredCat(null);
      setHoveredSub(null);
    }, 600);
  }, []);

  const cancelCatHide = useCallback(() => {
    if (hideCatTimer.current) { clearTimeout(hideCatTimer.current); hideCatTimer.current = null; }
  }, []);

  const handleCatEnter = useCallback((cat: Category, index: number) => {
    cancelCatHide();
    if (showCatTimer.current) { clearTimeout(showCatTimer.current); }
    showCatTimer.current = setTimeout(() => {
      setHoveredSub(null);
      setActiveSub(null);
      setHoveredCat(cat);
      const el = itemRefs.current[index];
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const headerH = 112;
        const maxAvail = vh - headerH - 16;
        const availBelow = vh - rect.top - 16;
        let top = rect.top;
        let maxHeight = Math.min(maxAvail, availBelow);
        if (maxHeight < 200) {
          maxHeight = maxAvail;
          top = Math.max(headerH, vh - maxHeight - 16);
        }
        setPanelPos({ top, left: rect.right - 2, maxHeight });
      }
    }, 80);
  }, [cancelCatHide]);

  const handleCatLeave = useCallback(() => {
    if (showCatTimer.current) { clearTimeout(showCatTimer.current); showCatTimer.current = null; }
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); showSubTimer.current = null; }
    if (!activeCat && !isInPanelRef.current) {
      scheduleCatHide();
    }
  }, [activeCat, scheduleCatHide]);

  const handleCatClick = useCallback((cat: Category) => {
    if (activeCat?.id === cat.id) {
      closeAll();
      return;
    }
    const subs = getChildren(cat);
    clearAllTimers();
    setActiveCat(cat);
    setActiveSub(null);
    setHoveredCat(cat);
    setHoveredSub(subs.length > 0 ? subs[0] : null);
    const idx = rootCats().findIndex(c => c.id === cat.id);
    if (idx >= 0) {
      const el = itemRefs.current[idx];
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const headerH = 112;
        const maxAvail = vh - headerH - 16;
        const availBelow = vh - rect.top - 16;
        let top = rect.top;
        let maxHeight = Math.min(maxAvail, availBelow);
        if (maxHeight < 200) {
          maxHeight = maxAvail;
          top = Math.max(headerH, vh - maxHeight - 16);
        }
        setPanelPos({ top, left: rect.right - 2, maxHeight });
      }
    }
  }, [activeCat, closeAll, clearAllTimers, getChildren, rootCats]);

  const handleSubEnter = useCallback((sub: Category) => {
    cancelCatHide();
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); }
    showSubTimer.current = setTimeout(() => {
      setHoveredSub(sub);
    }, 60);
  }, [cancelCatHide]);

  const handleSubLeave = useCallback(() => {
    if (showSubTimer.current) { clearTimeout(showSubTimer.current); }
  }, []);

  const handleSubClick = useCallback((sub: Category) => {
    if (activeSub?.id === sub.id) {
      setActiveSub(null);
      setHoveredSub(null);
    } else {
      setActiveSub(sub);
      setHoveredSub(sub);
    }
  }, [activeSub]);

  const handlePanelEnter = useCallback(() => {
    isInPanelRef.current = true;
    cancelCatHide();
  }, [cancelCatHide]);
  const handlePanelLeave = useCallback(() => {
    isInPanelRef.current = false;
    if (!activeCat) {
      scheduleCatHide();
    }
  }, [activeCat, scheduleCatHide]);

  const handleMobileSelect = useCallback((cat: Category) => {
    const children = getChildren(cat);
    if (children.length > 0) {
      setMobileBreadcrumbs(prev => [...prev, cat]);
    }
  }, [getChildren]);

  const handleMobileBack = useCallback(() => {
    setMobileBreadcrumbs(prev => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeAll(); setMobileOpen(false); setTabletOpen(false); }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeAll]);

  useEffect(() => {
    if (!hoveredCat && !activeCat) return;
    const handleScroll = () => {
      const target = hoveredCat || activeCat;
      if (!target) return;
      const idx = rootCats().findIndex(c => c.id === target.id);
      if (idx < 0) return;
      const el = itemRefs.current[idx];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const headerH = 112;
      const maxAvail = vh - headerH - 16;
      const availBelow = vh - rect.top - 16;
      let top = rect.top;
      let maxHeight = Math.min(maxAvail, availBelow);
      if (maxHeight < 200) {
        maxHeight = maxAvail;
        top = Math.max(headerH, vh - maxHeight - 16);
      }
      requestAnimationFrame(() => setPanelPos({ top, left: rect.right - 2, maxHeight }));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hoveredCat, activeCat, rootCats]);

  useEffect(() => {
    if (!hoveredCat && !activeCat) return;
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (sidebarRef.current?.contains(t)) return;
      if (subPanelRef.current?.contains(t)) return;
      if (childPanelRef.current?.contains(t)) return;
      closeAll();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hoveredCat, activeCat, closeAll]);

  const displayCat = hoveredCat || activeCat;
  const displaySub = hoveredSub || activeSub;
  const subs = displayCat ? getChildren(displayCat) : [];
  const children = displaySub ? getChildren(displaySub) : [];

  const mbCats = mobileBreadcrumbs.length === 0
    ? rootCats()
    : getChildren(mobileBreadcrumbs[mobileBreadcrumbs.length - 1]);

  const renderIcon = (cat: Category) => (
    <span className={cn('flex-shrink-0 w-7 h-7 flex items-center justify-center text-sm rounded-lg', getCategoryBg(cat.name))}>
      {getIcon(cat.slug, cat.name)}
    </span>
  );

  const renderPanelItem = (item: Category, isSub?: boolean) => (
    <div
      key={item.id}
      onMouseEnter={() => isSub ? handleSubEnter(item) : undefined}
      onMouseLeave={() => isSub ? handleSubLeave() : undefined}
      onClick={() => isSub ? handleSubClick(item) : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && isSub) { e.preventDefault(); handleSubClick(item); } }}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-md transition-all duration-100',
        (!isSub || isActiveSub(item))
          ? 'bg-primary-50/60 text-primary-700 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <span className="flex-1 text-sm truncate">{item.name}</span>
      {item.ad_count != null && (
        <span className="text-[11px] text-gray-400 tabular-nums">{formatCount(item.ad_count)}</span>
      )}
      {getChildren(item).length > 0 && (
        <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] bg-black/40 lg:hidden" onClick={() => { setMobileOpen(false); setMobileBreadcrumbs([]); }} />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        'fixed top-0 left-0 bottom-0 z-[201] w-[300px] max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out lg:hidden flex flex-col',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
          {mobileBreadcrumbs.length > 0 && (
            <button onClick={handleMobileBack} className="p-1 -ml-1 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
          )}
          <span className="font-semibold text-gray-900 text-sm flex-1">
            {mobileBreadcrumbs.length === 0 ? 'Categories' : mobileBreadcrumbs[mobileBreadcrumbs.length - 1].name}
          </span>
          <button onClick={() => { setMobileOpen(false); setMobileBreadcrumbs([]); }} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto flex-1 pb-20">
          {isLoading && !categories.length ? <SidebarSkeleton /> : !mbCats.length ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">No categories</div>
          ) : (
            <div className="py-1">
              {mbCats.map(cat => {
                const hasChildren = getChildren(cat).length > 0;
                return (
                  <div key={cat.id} onClick={() => handleMobileSelect(cat)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleMobileSelect(cat); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer border-b border-gray-50 last:border-b-0"
                  >
                    {renderIcon(cat)}
                    <span className="flex-1 text-sm font-medium text-gray-800 truncate">{cat.name}</span>
                    {cat.ad_count != null && <span className="text-xs text-gray-400">{formatCount(cat.ad_count)}</span>}
                    {hasChildren && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tablet toggle */}
      <button onClick={() => setTabletOpen(!tabletOpen)}
        className="hidden md:flex lg:hidden fixed left-3 z-40 w-10 h-10 bg-white rounded-xl shadow-md border border-gray-200 items-center justify-center hover:bg-gray-50 transition-colors"
        style={{ top: '130px' }} aria-label="Categories">
        <Menu className="w-5 h-5 text-gray-700" />
      </button>
      {tabletOpen && <div className="fixed inset-0 z-[200] bg-black/40 hidden md:block lg:hidden" onClick={() => setTabletOpen(false)} />}
      <div className={cn(
        'fixed top-0 left-0 bottom-0 z-[201] w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-out hidden md:block lg:hidden',
        tabletOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-semibold text-gray-900">Categories</span>
          <button onClick={() => setTabletOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {isLoading && !categories.length ? <SidebarSkeleton /> : !rootCats().length ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">No categories</div>
          ) : (
            <div className="py-1">
              {rootCats().map(cat => (
                <Link key={cat.id} href={`/ads?category=${cat.slug}`} onClick={() => setTabletOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  {renderIcon(cat)}
                  <span className="flex-1 font-medium truncate">{cat.name}</span>
                  {getChildren(cat).length > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        ref={sidebarRef}
        onMouseLeave={handleCatLeave}
        className="hidden lg:block w-[248px] flex-shrink-0 self-start z-40"
        style={{
          position: 'sticky',
          top: 'calc(104px + 8px)',
          maxHeight: 'calc(100vh - 104px - 16px)',
        }}
      >
        <div className="bg-white rounded-xl border border-gray-100/80 shadow-sm overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-50">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">All Categories</h3>
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 104px - 16px - 40px)', scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
          >
            {isLoading && !categories.length ? <SidebarSkeleton /> : !rootCats().length ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">No categories</div>
            ) : (
              <div className="py-1">
                {rootCats().map((cat, index) => {
                  const active = isActiveCat(cat);
                  const hasSubs = getChildren(cat).length > 0;
                  return (
                    <div
                      key={cat.id}
                      ref={el => { itemRefs.current[index] = el; }}
                      onMouseEnter={() => handleCatEnter(cat, index)}
                      onMouseLeave={handleCatLeave}
                      onClick={() => handleCatClick(cat)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCatClick(cat); } }}
                      className={cn(
                        'relative flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-all duration-100 border-l-[3px] select-none',
                        active
                          ? 'bg-primary-50/70 border-l-primary-500 text-primary-700'
                          : 'border-l-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-l-gray-200'
                      )}
                    >
                      {renderIcon(cat)}
                      <span className="flex-1 text-sm font-medium truncate leading-tight">{cat.name}</span>
                      <span className="text-[11px] font-medium text-gray-400 tabular-nums">{formatCount(cat.ad_count)}</span>
                      {hasSubs && (
                        <ChevronRight className={cn('w-3.5 h-3.5 flex-shrink-0 transition-all duration-200', active ? 'text-primary-400 translate-x-px' : 'text-gray-300')} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Level 2 - Subcategory panel */}
      {displayCat && subs.length > 0 && (
        <div
          ref={subPanelRef}
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
          className="fixed z-50 bg-white rounded-xl border border-gray-100/80 shadow-lg overflow-hidden animate-fade-in"
          style={{
            top: `${panelPos.top}px`,
            left: `${panelPos.left}px`,
            minWidth: '220px',
            maxWidth: '300px',
            maxHeight: `${panelPos.maxHeight}px`,
          }}
        >
          <Link
            href={`/ads?category=${displayCat.slug}`}
            className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
          >
            {renderIcon(displayCat)}
            <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">{displayCat.name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto flex-shrink-0 group-hover:text-primary-400" />
          </Link>
          <div className="overflow-y-auto" style={{ maxHeight: `${panelPos.maxHeight - 48}px`, scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
            <div className="py-1.5 px-1.5">
              {subs.map(sub => renderPanelItem(sub, true))}
            </div>
          </div>
        </div>
      )}

      {/* Level 3 - Child panel */}
      {displaySub && children.length > 0 && (
        <div
          ref={childPanelRef}
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
          className="fixed z-50 bg-white rounded-xl border border-gray-100/80 shadow-lg overflow-hidden animate-fade-in"
          style={{
            top: `${panelPos.top}px`,
            left: `${panelPos.left + 218}px`,
            minWidth: '200px',
            maxWidth: '260px',
            maxHeight: `${panelPos.maxHeight}px`,
          }}
        >
          <div className="px-4 py-2.5 border-b border-gray-50">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate block">{displaySub.name}</span>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: `${panelPos.maxHeight - 44}px`, scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
            <div className="py-1.5 px-1.5">
              {children.map(child => (
                <Link
                  key={child.id}
                  href={`/ads?category=${child.slug}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-100"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                  <span className="flex-1 truncate">{child.name}</span>
                  {child.ad_count != null && <span className="text-[11px] text-gray-400 tabular-nums">{formatCount(child.ad_count)}</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
