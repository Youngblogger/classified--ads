'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, ChevronRight, ChevronLeft, X, Check, Loader2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  children?: Category[];
}

interface CategorySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (categoryId: number, categoryName: string, breadcrumb: string) => void;
  selectedCategoryId?: number | null;
  selectedBreadcrumb?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Car: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h4m-6 8h6m-7-5a2 2 0 100-4 2 2 0 000 4zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v6m0 0v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2" />
    </svg>
  ),
  Home: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Smartphone: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  Monitor: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Shirt: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  Sofa: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12V8a4 4 0 014-4h8a4 4 0 014 4v4M4 12h16" />
    </svg>
  ),
  Briefcase: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Wrench: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Dog: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Heart: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Baby: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Dumbbell: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.5 6.5h11M6.5 17.5h11M4 9.5h2m12 0h2M4 14.5h2M17 9.5h2m-12 5h2" />
    </svg>
  ),
};

function getIcon(iconName?: string, className: string = 'w-5 h-5') {
  const IconComponent = iconMap[iconName || ''];
  if (IconComponent) return <IconComponent className={className} />;
  return <DefaultIcon className={className} />;
}

function DefaultIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2H4V6zM4 14a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z" />
    </svg>
  );
}

type Level = 'main' | 'sub' | 'child';

const localCategories: Category[] = [
    { id: 1, name: 'Vehicles', slug: 'vehicles', icon: 'Car', children: [
      { id: 101, name: 'Cars', slug: 'cars', children: [
        { id: 10101, name: 'Toyota', slug: 'toyota' }, { id: 10102, name: 'Honda', slug: 'honda' },
        { id: 10103, name: 'Lexus', slug: 'lexus' }, { id: 10104, name: 'Mercedes-Benz', slug: 'mercedes-benz' },
        { id: 10105, name: 'BMW', slug: 'bmw' }, { id: 10106, name: 'Hyundai', slug: 'hyundai' },
        { id: 10107, name: 'Nissan', slug: 'nissan' }, { id: 10108, name: 'Ford', slug: 'ford' },
      ]},
      { id: 102, name: 'SUVs', slug: 'suvs' },
      { id: 103, name: 'Sedans', slug: 'sedans' },
      { id: 104, name: 'Hatchbacks', slug: 'hatchbacks' },
      { id: 105, name: 'Pick-Up Trucks', slug: 'pickup-trucks' },
      { id: 106, name: 'Trucks & Trailers', slug: 'trucks-trailers' },
      { id: 107, name: 'Motorcycles', slug: 'motorcycles' },
      { id: 108, name: 'Scooters', slug: 'scooters' },
      { id: 109, name: 'Tricycles', slug: 'tricycles' },
      { id: 110, name: 'Heavy Equipment', slug: 'heavy-equipment' },
      { id: 111, name: 'Vehicle Parts', slug: 'vehicle-parts' },
      { id: 112, name: 'Vehicle Accessories', slug: 'vehicle-accessories' },
      { id: 113, name: 'Tires & Rims', slug: 'tires-rims' },
      { id: 114, name: 'Watercraft & Boats', slug: 'watercraft-boats' },
      { id: 115, name: 'Auto Repair Services', slug: 'auto-repair' },
      { id: 116, name: 'Car Rentals', slug: 'car-rentals' },
    ]},
    { id: 2, name: 'Property', slug: 'property', icon: 'Home', children: [
      { id: 201, name: 'Apartments for Rent', slug: 'apartments-rent' },
      { id: 202, name: 'Apartments for Sale', slug: 'apartments-sale' },
      { id: 203, name: 'Houses for Rent', slug: 'houses-rent' },
      { id: 204, name: 'Houses for Sale', slug: 'houses-sale' },
      { id: 205, name: 'Lands & Plots', slug: 'land-plots' },
      { id: 206, name: 'Commercial Property', slug: 'commercial-property' },
      { id: 207, name: 'Office Spaces', slug: 'office-spaces' },
      { id: 208, name: 'Shops', slug: 'shops' },
      { id: 209, name: 'Warehouses', slug: 'warehouses' },
      { id: 210, name: 'Short Let', slug: 'short-let' },
      { id: 211, name: 'Hotels', slug: 'hotels' },
      { id: 212, name: 'Hostels', slug: 'hostels' },
      { id: 213, name: 'Luxury Property', slug: 'luxury-property' },
      { id: 214, name: 'Property Services', slug: 'property-services' },
    ]},
    { id: 3, name: 'Mobile Phones & Tablets', slug: 'mobile-phones', icon: 'Smartphone', children: [
      { id: 301, name: 'Smartphones', slug: 'smartphones' },
      { id: 302, name: 'Android Phones', slug: 'android-phones' },
      { id: 303, name: 'iPhones', slug: 'iphones' },
      { id: 304, name: 'Tablets', slug: 'tablets' },
      { id: 305, name: 'iPads', slug: 'ipads' },
      { id: 306, name: 'Smartwatches', slug: 'smartwatches' },
      { id: 307, name: 'Phone Accessories', slug: 'phone-accessories' },
      { id: 308, name: 'Power Banks', slug: 'power-banks' },
      { id: 309, name: 'Earbuds', slug: 'earbuds' },
      { id: 310, name: 'Bluetooth Speakers', slug: 'bluetooth-speakers' },
      { id: 311, name: 'Phone Cases', slug: 'phone-cases' },
      { id: 312, name: 'Screen Protectors', slug: 'screen-protectors' },
      { id: 313, name: 'Gaming Phones', slug: 'gaming-phones' },
      { id: 314, name: 'Foldable Phones', slug: 'foldable-phones' },
    ]},
    { id: 4, name: 'Electronics', slug: 'electronics', icon: 'Monitor', children: [
      { id: 401, name: 'TVs', slug: 'tvs' },
      { id: 402, name: 'Smart TVs', slug: 'smart-tvs' },
      { id: 403, name: 'Home Audio', slug: 'home-audio' },
      { id: 404, name: 'Headphones', slug: 'headphones' },
      { id: 405, name: 'Laptops', slug: 'laptops' },
      { id: 406, name: 'Desktop Computers', slug: 'desktops' },
      { id: 407, name: 'Monitors', slug: 'monitors' },
      { id: 408, name: 'Printers', slug: 'printers' },
      { id: 409, name: 'CCTV Cameras', slug: 'cctv-cameras' },
      { id: 410, name: 'Gaming Consoles', slug: 'gaming-consoles' },
      { id: 411, name: 'Cameras', slug: 'cameras' },
      { id: 412, name: 'Drones', slug: 'drones' },
      { id: 413, name: 'Smart Home Devices', slug: 'smart-home' },
    ]},
    { id: 5, name: 'Fashion', slug: 'fashion', icon: 'Shirt', children: [
      { id: 501, name: "Men's Clothing", slug: 'men-clothing' },
      { id: 502, name: "Women's Clothing", slug: 'women-clothing' },
      { id: 503, name: 'Native Wear', slug: 'native-wear' },
      { id: 504, name: 'Shoes', slug: 'shoes' },
      { id: 505, name: 'Sneakers', slug: 'sneakers' },
      { id: 506, name: 'Bags', slug: 'bags' },
      { id: 507, name: 'Watches', slug: 'watches' },
      { id: 508, name: 'Jewelry', slug: 'jewelry' },
      { id: 509, name: 'Wedding Wear', slug: 'wedding-wear' },
      { id: 510, name: 'Sunglasses', slug: 'sunglasses' },
      { id: 511, name: 'Sportswear', slug: 'sportswear' },
      { id: 512, name: 'Luxury Fashion', slug: 'luxury-fashion' },
    ]},
    { id: 6, name: 'Home, Furniture & Appliances', slug: 'home-furniture', icon: 'Sofa', children: [
      { id: 601, name: 'Furniture', slug: 'furniture' },
      { id: 602, name: 'Home Decor', slug: 'home-decor' },
      { id: 603, name: 'Kitchen Appliances', slug: 'kitchen-appliances' },
      { id: 604, name: 'Large Appliances', slug: 'large-appliances' },
      { id: 605, name: 'Bedding', slug: 'bedding' },
      { id: 606, name: 'Lighting', slug: 'lighting' },
      { id: 607, name: 'Cookware', slug: 'cookware' },
      { id: 608, name: 'Home Improvement', slug: 'home-improvement' },
    ]},
    { id: 7, name: 'Jobs', slug: 'jobs', icon: 'Briefcase', children: [
      { id: 701, name: 'Technology Jobs', slug: 'tech-jobs' },
      { id: 702, name: 'Driver Jobs', slug: 'driver-jobs' },
      { id: 703, name: 'Healthcare Jobs', slug: 'healthcare-jobs' },
      { id: 704, name: 'Sales Jobs', slug: 'sales-jobs' },
      { id: 705, name: 'Remote Jobs', slug: 'remote-jobs' },
      { id: 706, name: 'Part-Time Jobs', slug: 'part-time-jobs' },
      { id: 707, name: 'Internships', slug: 'internship-jobs' },
      { id: 708, name: 'Freelance Jobs', slug: 'freelance-jobs' },
      { id: 709, name: 'Teaching Jobs', slug: 'teaching-jobs' },
      { id: 710, name: 'Engineering Jobs', slug: 'engineering-jobs' },
    ]},
    { id: 8, name: 'Services', slug: 'services', icon: 'Wrench', children: [
      { id: 801, name: 'Cleaning Services', slug: 'cleaning-services' },
      { id: 802, name: 'Repair Services', slug: 'repair-services' },
      { id: 803, name: 'Plumbing Services', slug: 'plumbing-services' },
      { id: 804, name: 'Electrical Services', slug: 'electrical-services' },
      { id: 805, name: 'Digital Services', slug: 'digital-services' },
      { id: 806, name: 'Web Design', slug: 'web-design' },
      { id: 807, name: 'Graphic Design', slug: 'graphic-design' },
      { id: 808, name: 'Photography Services', slug: 'photography-services' },
      { id: 809, name: 'Delivery Services', slug: 'delivery-services' },
      { id: 810, name: 'Event Planning', slug: 'event-planning' },
      { id: 811, name: 'Moving Services', slug: 'moving-services' },
      { id: 812, name: 'Consulting Services', slug: 'consulting-services' },
    ]},
    { id: 9, name: 'Pets', slug: 'pets', icon: 'Dog', children: [
      { id: 901, name: 'Dogs', slug: 'dogs' },
      { id: 902, name: 'Puppies', slug: 'puppies' },
      { id: 903, name: 'Cats', slug: 'cats' },
      { id: 904, name: 'Kittens', slug: 'kittens' },
      { id: 905, name: 'Birds', slug: 'birds' },
      { id: 906, name: 'Fish', slug: 'fish' },
      { id: 907, name: 'Pet Food', slug: 'pet-food' },
      { id: 908, name: 'Pet Accessories', slug: 'pet-accessories' },
      { id: 909, name: 'Veterinary Services', slug: 'vet-services' },
    ]},
    { id: 10, name: 'Health & Beauty', slug: 'health-beauty', icon: 'Heart', children: [
      { id: 1001, name: 'Skincare', slug: 'skincare' },
      { id: 1002, name: 'Face Care', slug: 'face-care' },
      { id: 1003, name: 'Makeup', slug: 'makeup' },
      { id: 1004, name: 'Hair Products', slug: 'haircare' },
      { id: 1005, name: 'Fragrances', slug: 'fragrances' },
      { id: 1006, name: 'Personal Care', slug: 'personal-care' },
      { id: 1007, name: 'Vitamins & Supplements', slug: 'supplements' },
      { id: 1008, name: 'Beauty Tools', slug: 'beauty-tools' },
    ]},
    { id: 11, name: 'Baby & Kids', slug: 'baby-kids', icon: 'Baby', children: [
      { id: 1101, name: 'Baby Clothing', slug: 'baby-clothing' },
      { id: 1102, name: 'Kids Clothing', slug: 'kids-clothing' },
      { id: 1103, name: 'Toys', slug: 'toys' },
      { id: 1104, name: 'Educational Toys', slug: 'educational-toys' },
      { id: 1105, name: 'Baby Gear', slug: 'baby-gear' },
      { id: 1106, name: 'Strollers', slug: 'strollers' },
      { id: 1107, name: 'Car Seats', slug: 'car-seats' },
      { id: 1108, name: 'Baby Feeding', slug: 'baby-feeding' },
      { id: 1109, name: 'Diapers', slug: 'diapers' },
      { id: 1110, name: 'School Supplies', slug: 'school-supplies' },
      { id: 1111, name: 'Baby Furniture', slug: 'baby-furniture' },
      { id: 1112, name: 'Maternity Products', slug: 'maternity' },
    ]},
    { id: 12, name: 'Sports & Outdoors', slug: 'sports', icon: 'Dumbbell', children: [
      { id: 1201, name: 'Gym Equipment', slug: 'gym-equipment' },
      { id: 1202, name: 'Fitness Accessories', slug: 'fitness-accessories' },
      { id: 1203, name: 'Treadmills', slug: 'treadmills' },
      { id: 1204, name: 'Bicycles', slug: 'bicycles' },
      { id: 1205, name: 'Camping Gear', slug: 'camping-gear' },
      { id: 1206, name: 'Football Equipment', slug: 'football-equipment' },
      { id: 1207, name: 'Swimming Equipment', slug: 'swimming-equipment' },
      { id: 1208, name: 'Boxing Equipment', slug: 'boxing-equipment' },
      { id: 1209, name: 'Yoga Equipment', slug: 'yoga-equipment' },
      { id: 1210, name: 'Fishing Equipment', slug: 'fishing-equipment' },
      { id: 1211, name: 'Sports Shoes', slug: 'sports-shoes' },
    ]},
  ];

export default function CategorySelector({ isOpen, onClose, onSelect, selectedCategoryId, selectedBreadcrumb }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLevel, setCurrentLevel] = useState<Level>('main');
  const [selectedMainCategory, setSelectedMainCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const resetState = useCallback(() => {
    setSearchQuery('');
    setCurrentLevel('main');
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      if (data.success && data.data) {
        const cats = data.data.filter((c: any) => !c.parent_id);
        if (cats.length > 0) {
          setCategories(cats);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories, using local fallback:', error);
    }
    setCategories(localCategories);
    setLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      resetState();
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, fetchCategories, resetState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const getCurrentCategories = useMemo(() => {
    if (currentLevel === 'main') {
      return categories;
    } else if (currentLevel === 'sub' && selectedMainCategory) {
      return selectedMainCategory.children || [];
    } else if (currentLevel === 'child' && selectedSubCategory) {
      return selectedSubCategory.children || [];
    }
    return [];
  }, [currentLevel, categories, selectedMainCategory, selectedSubCategory]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return getCurrentCategories;
    const query = searchQuery.toLowerCase();
    
    const filterRecursive = (cats: Category[]): Category[] => {
      return cats.reduce((acc: Category[], cat) => {
        const nameMatch = cat.name.toLowerCase().includes(query);
        const children = cat.children ? filterRecursive(cat.children) : [];
        if (nameMatch || children.length > 0) {
          acc.push({ ...cat, children: nameMatch ? cat.children : children });
        }
        return acc;
      }, []);
    };
    
    if (currentLevel === 'main') {
      return filterRecursive(categories);
    }
    return getCurrentCategories.filter(cat => cat.name.toLowerCase().includes(query));
  }, [getCurrentCategories, searchQuery, currentLevel, categories]);

  const handleMainCategoryClick = (category: Category) => {
    if (category.children && category.children.length > 0) {
      setSelectedMainCategory(category);
      setCurrentLevel('sub');
      setSearchQuery('');
    } else {
      handleSelect(category, null, null);
    }
  };

  const handleSubCategoryClick = (subCategory: Category) => {
    if (selectedMainCategory) {
      if (subCategory.children && subCategory.children.length > 0) {
        setSelectedSubCategory(subCategory);
        setCurrentLevel('child');
        setSearchQuery('');
      } else {
        handleSelect(subCategory, selectedMainCategory, null);
      }
    }
  };

  const handleChildCategoryClick = (childCategory: Category) => {
    if (selectedMainCategory && selectedSubCategory) {
      handleSelect(childCategory, selectedMainCategory, selectedSubCategory);
    }
  };

  const handleSelect = (category: Category, parent: Category | null, grandparent: Category | null) => {
    let breadcrumb = category.name;
    if (parent) {
      breadcrumb = `${parent.name} > ${category.name}`;
    }
    if (grandparent) {
      breadcrumb = `${grandparent.name} > ${parent!.name} > ${category.name}`;
    }
    onSelect(category.id, category.name, breadcrumb);
    onClose();
  };

  const handleBack = () => {
    if (currentLevel === 'child') {
      setCurrentLevel('sub');
      setSelectedSubCategory(null);
    } else if (currentLevel === 'sub') {
      setCurrentLevel('main');
      setSelectedMainCategory(null);
    }
    setSearchQuery('');
  };

  const handleBackToSub = () => {
    setCurrentLevel('sub');
    setSelectedSubCategory(null);
    setSearchQuery('');
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getLevelTitle = () => {
    switch (currentLevel) {
      case 'main': return 'Select Category';
      case 'sub': return selectedMainCategory?.name || 'Subcategory';
      case 'child': return selectedSubCategory?.name || 'Child Category';
    }
  };

  const getBreadcrumbDisplay = () => {
    if (!selectedBreadcrumb) return '';
    if (currentLevel === 'child' && selectedMainCategory && selectedSubCategory) {
      return `${selectedMainCategory.name} > ${selectedSubCategory.name}`;
    }
    if (currentLevel === 'sub' && selectedMainCategory) {
      return selectedMainCategory.name;
    }
    return selectedBreadcrumb;
  };

  const getCategoryCount = () => {
    switch (currentLevel) {
      case 'main': return `${filteredCategories.length} categories`;
      case 'sub': return `${filteredCategories.length} subcategories`;
      case 'child': return `${filteredCategories.length} child categories`;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4"
      onClick={handleOutsideClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(currentLevel === 'sub' || currentLevel === 'child') && (
                <button 
                  onClick={currentLevel === 'child' ? handleBackToSub : handleBack}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h3 id="category-modal-title" className="font-semibold text-lg">
                  {getLevelTitle()}
                </h3>
                {getBreadcrumbDisplay() && (
                  <p className="text-sm text-white/80 truncate max-w-[200px]">{getBreadcrumbDisplay()}</p>
                )}
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={currentLevel === 'main' ? 'Search categories...' : `Search ${getLevelTitle().toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-colors"
              aria-label="Search categories"
            />
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {(currentLevel === 'sub' || currentLevel === 'child') && (
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2 text-sm flex-wrap">
            <button 
              onClick={handleBack}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              All Categories
            </button>
            {currentLevel === 'sub' && selectedMainCategory && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{selectedMainCategory.name}</span>
              </>
            )}
            {currentLevel === 'child' && selectedMainCategory && selectedSubCategory && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <button 
                  onClick={handleBackToSub}
                  className="text-primary-600 hover:text-primary-700"
                >
                  {selectedMainCategory.name}
                </button>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{selectedSubCategory.name}</span>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2" role="listbox">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No categories found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-1">
              {currentLevel === 'main' && filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleMainCategoryClick(category)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                  role="option"
                  aria-selected={selectedCategoryId === category.id}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    {getIcon(category.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900 block truncate">{category.name}</span>
                    {category.children && category.children.length > 0 && (
                      <span className="text-sm text-gray-400">
                        {category.children.length} subcategories
                      </span>
                    )}
                  </div>
                  {category.children && category.children.length > 0 && (
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                  )}
                </button>
              ))}

              {currentLevel === 'sub' && (
                <>
                  {selectedMainCategory && (
                    <button
                      onClick={() => handleSelect(selectedMainCategory, null, null)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors text-left mb-2"
                      role="option"
                      aria-selected={selectedCategoryId === selectedMainCategory?.id}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                        {getIcon(selectedMainCategory.icon)}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-primary-700">{selectedMainCategory.name}</span>
                        <span className="text-sm text-primary-600 ml-2">(Select this category)</span>
                      </div>
                      <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    </button>
                  )}
                  
                  <div className="border-t my-2"></div>
                  
                  <p className="px-4 py-2 text-sm text-gray-500 font-medium">Subcategories</p>
                  
                  {filteredCategories.map((subCategory) => (
                    <button
                      key={subCategory.id}
                      onClick={() => handleSubCategoryClick(subCategory)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left ${
                        selectedCategoryId === subCategory.id ? 'bg-primary-50 border border-primary-200' : ''
                      }`}
                      role="option"
                      aria-selected={selectedCategoryId === subCategory.id}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                        {getIcon(subCategory.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900 block truncate">{subCategory.name}</span>
                        {subCategory.children && subCategory.children.length > 0 && (
                          <span className="text-sm text-gray-400">
                            {subCategory.children.length} child categories
                          </span>
                        )}
                      </div>
                      {subCategory.children && subCategory.children.length > 0 ? (
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : selectedCategoryId === subCategory.id ? (
                        <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      ) : null}
                    </button>
                  ))}
                </>
              )}

              {currentLevel === 'child' && selectedMainCategory && selectedSubCategory && (
                <>
                  <button
                    onClick={() => handleSelect(selectedSubCategory, selectedMainCategory, null)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors text-left mb-2"
                    role="option"
                    aria-selected={selectedCategoryId === selectedSubCategory?.id}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                      {getIcon(selectedSubCategory.icon)}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-primary-700">{selectedSubCategory.name}</span>
                      <span className="text-sm text-primary-600 ml-2">(Select this category)</span>
                    </div>
                    <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  </button>
                  
                  <div className="border-t my-2"></div>
                  
                  <p className="px-4 py-2 text-sm text-gray-500 font-medium">Child Categories</p>
                  
                  {filteredCategories.map((childCategory) => (
                    <button
                      key={childCategory.id}
                      onClick={() => handleChildCategoryClick(childCategory)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left ${
                        selectedCategoryId === childCategory.id ? 'bg-primary-50 border border-primary-200' : ''
                      }`}
                      role="option"
                      aria-selected={selectedCategoryId === childCategory.id}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                        {getIcon(childCategory.icon)}
                      </div>
                      <span className="flex-1 font-medium text-gray-900 truncate">{childCategory.name}</span>
                      {selectedCategoryId === childCategory.id && (
                        <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {getCategoryCount()}
            </span>
            {selectedBreadcrumb && (
              <span className="text-primary-600 font-medium truncate max-w-[200px]">{selectedBreadcrumb}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
