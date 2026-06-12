import { clsx, type ClassValue } from 'clsx';
import { config, FALLBACK_IMAGE, CLOUDINARY_CLOUD_NAME, BACKEND_URL } from './config';

export { BACKEND_URL, FALLBACK_IMAGE, CLOUDINARY_CLOUD_NAME } from './config';

let _imageVersionCounter = 0;
export function getImageVersionBuster(): string {
  _imageVersionCounter++;
  return `_v=${_imageVersionCounter}_${Date.now()}`;
}

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getCloudinaryUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  quality?: string | number;
}): string {
  if (!publicId) return FALLBACK_IMAGE;

  const transformations: string[] = [];

  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.crop) transformations.push(`c_${options.crop}`);
  if (options?.gravity) transformations.push(`g_${options.gravity}`);
  transformations.push(`q_${options?.quality ?? 'auto'}`);
  transformations.push('f_auto');

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations.join(',')}/${publicId}`;
}

export function getCloudinaryThumbnail(publicId: string, size = 300): string {
  return getCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'auto',
    quality: 80,
  });
}

export function getCloudinaryBlurUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, {
    width: 50,
    quality: 1,
  }).replace('/upload/', '/upload/e_blur:500,');
}

export function getCloudinarySrcset(publicId: string, breakpoints = [320, 640, 768, 1024, 1280]): string {
  if (!publicId) return '';
  return breakpoints
    .map((w) => `${getCloudinaryUrl(publicId, { width: w, crop: 'scale' })} ${w}w`)
    .join(', ');
}

export function getCloudinarySizes(defaultWidth = 800): string {
  return `(max-width: 640px) 320px, (max-width: 768px) 640px, (max-width: 1024px) 768px, ${defaultWidth}px`;
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

export function getValidImages(images: any[]): string[] {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [FALLBACK_IMAGE];
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
    return [FALLBACK_IMAGE];
  }
  
  return validUrls;
}

export function getAdImageUrl(img: any, adId?: number): string {
  if (!img || img === null || img === undefined) return '';
  
  let url = '';
  
  if (typeof img === 'string') {
    url = img;
  } else if (typeof img === 'object') {
    url = img.thumbnail_url || img.listing_url || img.thumbnail || img.full_thumbnail_url || img.display_url || img.url || img.full_url || img.src || img.original_url || img.image || img.path || img.file || '';
  }
  
  if (!url || url === 'null' || url === 'undefined') return '';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('/')) {
    return url;
  }
  
  return url;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

function addWatermarkToCloudinaryUrl(url: string, adId?: number): string {
  if (!CLOUD_NAME) return url;

  const marker = `/image/upload/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  if (url.includes('fl_layer_apply')) return url;

  const afterUpload = url.slice(idx + marker.length);
  const baseUrl = url.slice(0, idx + marker.length);
  const parts = afterUpload.split('/');
  const publicIdIndex = parts.findIndex((p) => !p.includes('_'));
  const publicId = publicIdIndex >= 0 ? parts.slice(publicIdIndex).join('/') : afterUpload;

  let textStr = 'iList';
  if (adId) textStr += ` | ID:${adId}`;
  const encodedText = textStr.replace(/ /g, '%20').replace(/,/g, '%252C').replace(/\|/g, '%7C');

  const overlay = `l_text:Arial_28:${encodedText},co_rgb:FFFFFF,o_60,g_se,x_15,y_15,fl_layer_apply`;

  return `${baseUrl}${overlay}/${publicId}`;
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
  
  if (img !== undefined) {
    if (typeof img === 'string') return img;
    return getAdImageUrl(img);
  }
  
  const images = getAdImages(ad);
  return images[0] || '';
}

export function getAdImages(ad: any): string[] {
  if (!ad) return [];
  
  let images: string[] = [];
  
  if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
    images = ad.images
      .filter((img: any) => img && img !== null && img !== undefined)
      .map((img: any) => {
        if (typeof img === 'string') {
          if (img.startsWith('/') || img.startsWith('http')) return img;
          return `/images/${img}`;
        }
        return getAdImageUrl(img);
      })
      .filter(Boolean);
  }
  
  if (images.length === 0 && ad.image && typeof ad.image === 'object') {
    const url = getAdImageUrl(ad.image);
    if (url) images = [url];
  }
  
  if (images.length === 0 && typeof ad.image_url === 'string' && ad.image_url) {
    const url = getAdImageUrl(ad.image_url);
    if (url) images = [url];
  }
  
  return images;
}

function getImageTimestamp(ad: any): string {
  const ts = ad?.updated_at || ad?.created_at || Date.now();
  const d = new Date(ts);
  return isNaN(d.getTime()) ? String(Date.now()) : String(d.getTime());
}

export function getAdMainImage(ad: any): string {
  if (!ad) return FALLBACK_IMAGE;

  if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
    for (const img of ad.images) {
      const url = getAdImageUrl(img);
      if (url) return url;
    }
  }

  if (ad.image && typeof ad.image === 'object') {
    const url = getAdImageUrl(ad.image);
    if (url) return url;
  }

  if (typeof ad.image_url === 'string' && ad.image_url) {
    const url = getAdImageUrl(ad.image_url);
    if (url) return url;
  }

  if (typeof ad.image === 'string' && ad.image) {
    const url = getAdImageUrl(ad.image);
    if (url) return url;
  }

  return FALLBACK_IMAGE;
}

export function getAdMainImageWithCacheBust(ad: any): string {
  const url = getAdMainImage(ad);
  if (!url || url === FALLBACK_IMAGE || url.startsWith('/')) return url;
  const ts = getImageTimestamp(ad);
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_cb=${ts}`;
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

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₦0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
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
  if (diffInSeconds < 172800) return 'Yesterday';
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  const isThisYear = d.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
