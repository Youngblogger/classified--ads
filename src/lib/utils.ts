import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';

export const FALLBACK_IMAGE = '/placeholder-image.svg';

export const CATEGORY_FALLBACK_IMAGES: Record<string, string[]> = {
  Vehicles: [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1580273916550-e323be2ed5f6?w=800&h=600&fit=crop',
  ],
  Cars: [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1580273916550-e323be2ed5f6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
  ],
  Motorcycles: [
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&h=600&fit=crop',
  ],
  'Mobile Phones': [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=800&h=600&fit=crop',
  ],
  'Mobile Phones & Tablets': [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff70?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600&fit=crop',
  ],
  Electronics: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=600&fit=crop',
  ],
  Laptops: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1588702547923-b3c1859b71fa?w=800&h=600&fit=crop',
  ],
  TVs: [
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&h=600&fit=crop',
  ],
  Gaming: [
    'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&h=600&fit=crop',
  ],
  Fashion: [
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=600&fit=crop',
  ],
  Shoes: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=600&fit=crop',
  ],
  Property: [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  ],
  Apartments: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  ],
  Land: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1623854767748-1d9fd5bc3c60?w=800&h=600&fit=crop',
  ],
  Furniture: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&h=600&fit=crop',
  ],
  Appliances: [
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&h=600&fit=crop',
  ],
  Refrigerators: [
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&h=600&fit=crop',
  ],
  Cameras: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
  ],
  Tablets: [
    'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&h=600&fit=crop',
  ],
  Sports: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop',
  ],
  'Gym Equipment': [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
  ],
  'Baby & Kids': [
    'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1596461404969-9ae70f3bf014?w=800&h=600&fit=crop',
  ],
  Toys: [
    'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1596461404969-9ae70f3bf014?w=800&h=600&fit=crop',
  ],
  Baby: [
    'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=800&h=600&fit=crop',
  ],
  'Health & Beauty': [
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&h=600&fit=crop',
  ],
  Services: [
    'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
  ],
  Pets: [
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop',
  ],
  Generators: [
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=800&h=600&fit=crop',
  ],
};

export function getCategoryFallback(category: string | { name?: string; slug?: string } | null | undefined): string {
  if (!category) return FALLBACK_IMAGE;
  
  const catName = typeof category === 'string' ? category : (category.name || category.slug || '');
  const normalizedCat = catName.toLowerCase().trim();
  
  for (const [key, images] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (normalizedCat.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedCat)) {
      return images[Math.floor(Math.random() * images.length)];
    }
  }
  
  const phoneMatch = normalizedCat.match(/phone|mobile|smartphone|tablet|ipad|android|iphone|samsung|tecno|infinix|oppo|vivo|xiaomi/);
  if (phoneMatch) {
    return CATEGORY_FALLBACK_IMAGES['Mobile Phones'][Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES['Mobile Phones'].length)];
  }
  
  const carMatch = normalizedCat.match(/car|vehicle|motor|toyota|honda|mercedes|bmw|lexus|ford|jeep|suv/);
  if (carMatch) {
    return CATEGORY_FALLBACK_IMAGES['Cars'][Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES['Cars'].length)];
  }
  
  const laptopMatch = normalizedCat.match(/laptop|macbook|notebook|computer|asus|dell|hp|lenovo/);
  if (laptopMatch) {
    return CATEGORY_FALLBACK_IMAGES['Laptops'][Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES['Laptops'].length)];
  }
  
  const tvMatch = normalizedCat.match(/tv|television|samsung tv|smart tv|led|lcd/);
  if (tvMatch) {
    return CATEGORY_FALLBACK_IMAGES['TVs'][Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES['TVs'].length)];
  }
  
  const gamingMatch = normalizedCat.match(/ps5|ps4|playstation|xbox|gaming|console|nintendo/);
  if (gamingMatch) {
    return CATEGORY_FALLBACK_IMAGES['Gaming'][Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES['Gaming'].length)];
  }
  
  const fashionMatch = normalizedCat.match(/fashion|shoe|clothing|shirt|dress|ankara|fabric|wear/);
  if (fashionMatch) {
    return CATEGORY_FALLBACK_IMAGES['Fashion'][Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES['Fashion'].length)];
  }
  
  const propertyMatch = normalizedCat.match(/property|house|apartment|land|rent|sale|estate|flat/);
  if (propertyMatch) {
    return CATEGORY_FALLBACK_IMAGES['Property'][Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES['Property'].length)];
  }
  
  const furnitureMatch = normalizedCat.match(/furniture|sofa|chair|table|bed|desk|cabinet/);
  if (furnitureMatch) {
    return CATEGORY_FALLBACK_IMAGES['Furniture'][Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES['Furniture'].length)];
  }
  
  const applianceMatch = normalizedCat.match(/fridge|refrigerator|freezer|ac|air.?condition|washer|washing|microwave|oven/);
  if (applianceMatch) {
    return CATEGORY_FALLBACK_IMAGES['Appliances'][Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES['Appliances'].length)];
  }
  
  const cameraMatch = normalizedCat.match(/camera|canon|nikon|sony|photo|dslr/);
  if (cameraMatch) {
    return CATEGORY_FALLBACK_IMAGES['Cameras'][Math.floor(Math.random() * CATEGORY_FALLBACK_IMAGES['Cameras'].length)];
  }
  
  return FALLBACK_IMAGE;
}

export async function validateImageUrl(url: string): Promise<boolean> {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    return true;
  } catch {
    return false;
  }
}

export function getValidImages(images: any[], category?: string | { name?: string; slug?: string } | null): string[] {
  if (!images || !Array.isArray(images) || images.length === 0) {
    const fallback = getCategoryFallback(category);
    return fallback ? [fallback] : [];
  }
  
  const validUrls: string[] = [];
  
  for (const img of images) {
    if (!img || img === null || img === undefined) continue;
    const url = getAdImageUrl(img);
    if (url) {
      validUrls.push(url);
    }
  }
  
  if (validUrls.length === 0) {
    const fallback = getCategoryFallback(category);
    return fallback ? [fallback] : [];
  }
  
  return validUrls;
}

export function getAdImageUrl(img: any): string {
  if (!img || img === null || img === undefined) return '';
  
  let url = '';
  
  if (typeof img === 'string') {
    url = img;
  } else if (typeof img === 'object') {
    url = img.full_url || img.full_thumbnail_url || img.display_url || img.thumbnail_url || img.thumbnail || img.url || img.src || img.original_url || img.image || img.path || img.file || '';
  }
  
  if (!url || url === 'null' || url === 'undefined') return '';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('/storage/')) {
    return `${BACKEND_URL}${url}`;
  }
  
  if (url.startsWith('storage/')) {
    return `${BACKEND_URL}/${url}`;
  }
  
  return `${BACKEND_URL}/storage/${url}`;
}

export function getPrimaryImageUrl(images: any[]): string {
  if (!images || !Array.isArray(images) || images.length === 0) return '';
  
  const validImages = images.filter(img => img && img !== null && img !== undefined);
  if (validImages.length === 0) return '';
  
  const primary = validImages.find((img: any) => img?.is_primary);
  const img = primary || validImages[0];
  
  return getAdImageUrl(img);
}

export function getAdImage(ad: any, img?: any): string {
  if (!ad) return '';
  
  // If img is provided, extract URL from it
  if (img !== undefined) {
    if (typeof img === 'string') return img;
    return getAdImageUrl(img);
  }
  
  // Get first image from getAdImages
  const images = getAdImages(ad);
  return images[0] || '';
}

export function getAdImages(ad: any): string[] {
  if (!ad) return [];
  
  let images: string[] = [];
  
  // Handle main_image + slider_images format
  if (ad.slider_images && Array.isArray(ad.slider_images) && ad.slider_images.length > 0) {
    images = ad.slider_images.map((img: any) => {
      if (typeof img === 'string') return img;
      return getAdImageUrl(img);
    }).filter(Boolean);
  }
  
  // Fallback to main_image
  if (images.length === 0 && ad.main_image) {
    if (typeof ad.main_image === 'string') {
      images = [ad.main_image];
    } else {
      images = [getAdImageUrl(ad.main_image)].filter(Boolean);
    }
  }
  
  // Fallback to images array (standard format)
  if (images.length === 0 && ad.images && Array.isArray(ad.images)) {
    images = ad.images.filter((img: any) => img && img !== null && img !== undefined)
      .map((img: any) => {
        if (typeof img === 'string') return img;
        return getAdImageUrl(img);
      }).filter(Boolean);
  }
  
  return images;
}

export function buildImageQuery(ad: any): string {
  if (!ad) return '';
  
  const category = ad.category?.name || ad.category?.slug || ad.category || '';
  const title = ad.title || '';
  
  return `${category} ${title} real photo`.trim();
}

export function getUserAvatarUrl(user: any): string | null {
  if (!user) return null;
  
  const avatar = user.full_avatar_url || user.avatar_url || user.avatar || 
                 user.google_avatar || user.facebook_avatar;
  if (!avatar) return null;
  
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  if (avatar.startsWith('/storage/')) {
    return `${BACKEND_URL}${avatar}`;
  }
  return `${BACKEND_URL}/storage/${avatar}`;
}

export function formatPrice(price: number | string, currency: string = 'NGN'): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) return '₦0';
  
  return '₦' + numericPrice.toLocaleString('en-US');
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return 'Recently';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Recently';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateStarRating(rating: number): string[] {
  const stars: string[] = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push('full');
    } else if (i - 0.5 <= rating) {
      stars.push('half');
    } else {
      stars.push('empty');
    }
  }
  return stars;
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

const VALID_NIGERIAN_PREFIXES = [
  '0803', '0806', '0810', '0813', '0814', '0903', '0906',
  '0802', '0808', '0812', '0701', '0902',
  '0805', '0807', '0815', '0811', '0705',
  '0809', '0817', '0818', '0909',
];

export function validatePhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  if (!/^\d{11}$/.test(clean)) return false;
  if (!clean.startsWith('0')) return false;
  const prefix = clean.substring(0, 4);
  if (!VALID_NIGERIAN_PREFIXES.includes(prefix)) return false;
  for (let i = 0; i <= clean.length - 6; i++) {
    if (/^(\d)\1{5,}$/.test(clean.slice(i, i + 6))) return false;
  }
  const suffix = clean.slice(-4);
  if (/^0{3}[0-9]$/.test(suffix)) return false;
  if (/^(\d)\1{3}$/.test(suffix)) return false;
  if (['0123', '1234', '2345', '3456', '4567', '5678', '6789'].includes(suffix)) return false;
  return true;
}

export function getPhoneValidationError(phone: string): string | null {
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  if (!clean) return 'Phone number is required';
  if (!/^\d+$/.test(clean)) return 'Phone number must contain digits only';
  if (clean.length !== 11) return 'Phone number must be exactly 11 digits';
  if (!clean.startsWith('0')) return 'Phone number must start with 0';
  const prefix = clean.substring(0, 4);
  if (!VALID_NIGERIAN_PREFIXES.includes(prefix)) {
    return 'Invalid network prefix. Use MTN (0803, 0806, 0810...), Airtel (0802, 0808...), Glo (0805, 0807...), or 9mobile (0809, 0817...)';
  }
  for (let i = 0; i <= clean.length - 6; i++) {
    if (/^(\d)\1{5,}$/.test(clean.slice(i, i + 6))) {
      return 'Phone number has too many repeating digits';
    }
  }
  const suffix = clean.slice(-4);
  if (/^0{3}[0-9]$/.test(suffix) || /^(\d)\1{3}$/.test(suffix)) {
    return 'Phone number ending looks unrealistic';
  }
  return null;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): (number | string)[] {
  const pages: (number | string)[] = [];
  
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  const half = Math.floor(maxVisible / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    start = 1;
    end = maxVisible;
  }

  if (end > totalPages) {
    end = totalPages;
    start = totalPages - maxVisible + 1;
  }

  if (start > 1) pages.push(1);
  if (start > 2) pages.push('...');

  for (let i = start; i <= end; i++) pages.push(i);

  if (end < totalPages - 1) pages.push('...');
  if (end < totalPages) pages.push(totalPages);

  return pages;
}
