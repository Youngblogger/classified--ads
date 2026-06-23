import { FALLBACK_IMAGE } from './config';
import {
  WatermarkSettings,
  POSITION_MAP,
  DEFAULT_WATERMARK_SETTINGS,
} from './watermark-defaults';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

// =====================================================
//  WATERMARK SETTINGS (from admin DB, reactive client state)
// =====================================================

let clientWatermark: WatermarkSettings | null = null;
let watermarkListeners: Set<() => void> = new Set();

export function subscribeWatermark(cb: () => void): () => void {
  watermarkListeners.add(cb);
  return () => watermarkListeners.delete(cb);
}

export function setWatermarkSettings(settings: Partial<WatermarkSettings> | null): void {
  if (settings) {
    clientWatermark = { ...DEFAULT_WATERMARK_SETTINGS, ...settings };
  } else {
    clientWatermark = null;
  }
  urlCache = new LruCache(500);
  adMainCache = new LruCache(300);
  watermarkListeners.forEach(fn => fn());
}

export function getWatermarkSettings(): WatermarkSettings | null {
  return clientWatermark;
}

// =====================================================
//  CACHING LAYER
// =====================================================

interface CacheEntry {
  value: string;
  hits: number;
}

class LruCache {
  private max: number;
  private map: Map<string, CacheEntry>;
  private order: string[] = [];

  constructor(max = 500) {
    this.max = max;
    this.map = new Map();
  }

  get(key: string): string | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    entry.hits++;
    this.map.delete(key);
    this.map.set(key, entry);
    const idx = this.order.indexOf(key);
    if (idx > -1) this.order.splice(idx, 1);
    this.order.push(key);
    return entry.value;
  }

  set(key: string, value: string): void {
    if (this.map.has(key)) {
      this.map.delete(key);
      const idx = this.order.indexOf(key);
      if (idx > -1) this.order.splice(idx, 1);
    } else if (this.map.size >= this.max) {
      const oldest = this.order.shift();
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, { value, hits: 0 });
    this.order.push(key);
  }

  get stats() {
    let total = 0;
    let hitCount = 0;
    this.map.forEach((entry) => {
      total++;
      if (entry.hits > 0) hitCount++;
    });
    return { size: this.map.size, max: this.max, entriesWithHits: hitCount, totalEntries: total };
  }
}

let urlCache = new LruCache(500);

function cacheKey(img: unknown, adId?: number): string {
  if (typeof img === 'string') return `s:${img}|${adId ?? ''}`;
  if (img && typeof img === 'object') {
    const o = img as Record<string, unknown>;
    const id = (o.id as string | number) || (o.public_id as string) || (o.url as string) || (o.thumbnail_url as string) || '';
    return `o:${String(id)}|${adId ?? ''}`;
  }
  return `u:${String(img)}|${adId ?? ''}`;
}

// =====================================================
//  CORE FUNCTIONS
// =====================================================

function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

function parseCloudinaryUrl(url: string): { transforms: string[]; version: string; publicId: string } | null {
  const marker = '/image/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;

  const afterUpload = url.slice(idx + marker.length);
  const parts = afterUpload.split('/');
  if (parts.length === 0) return null;

  const transforms: string[] = [];
  let version = '';
  const publicIdParts: string[] = [];
  let phase: 'transform' | 'version' | 'publicId' = 'transform';

  for (const p of parts) {
    if (!p) continue;
    if (phase === 'transform') {
      if (p.includes('_') || p.startsWith('e_')) {
        transforms.push(p);
      } else if (/^v\d+$/.test(p)) {
        version = p;
        phase = 'publicId';
      } else {
        phase = 'publicId';
        publicIdParts.push(p);
      }
    } else {
      publicIdParts.push(p);
    }
  }

  if (publicIdParts.length === 0) return null;

  return { transforms, version, publicId: publicIdParts.join('/') };
}

function addWatermarkToCloudinaryUrl(url: string, _adId?: number): string {
  if (!CLOUD_NAME || !clientWatermark || !clientWatermark.enabled) return url;
  if (url.includes('fl_layer_apply')) return url;

  // Only apply client-side overlays for LOGO type watermarks.
  // Text watermarks are applied server-side (Sharp) during upload — adding
  // a client-side text overlay (l_text:) duplicates the watermark and can
  // trigger 400 errors from Cloudinary's text renderer.
  if (clientWatermark.type !== 'logo' || !clientWatermark.logo_url) return url;

  const parsed = parseCloudinaryUrl(url);
  if (!parsed) return url;

  if (typeof clientWatermark.opacity !== 'number' || typeof clientWatermark.margin !== 'number') {
    return url;
  }

  const gravity = POSITION_MAP[clientWatermark.position];
  if (!gravity) return url;

  try {
    const marker = '/image/upload/';
    const baseUrl = url.slice(0, url.indexOf(marker) + marker.length);

    const opacity = Math.max(0, Math.min(100, clientWatermark.opacity));
    const margin = clientWatermark.margin;

    const parts = clientWatermark.logo_url.split('/');
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx === -1 || uploadIdx + 1 >= parts.length) return url;
    const pathParts = parts.slice(uploadIdx + 1);
    const filtered = pathParts.filter(p => !/^v\d+$/.test(p));
    const overlayId = filtered.join('/').replace(/\.[^.]+$/, '');
    if (!overlayId) return url;
    const overlay = `l_${overlayId.replace(/\//g, ':')},w_${clientWatermark.logo_scale},o_${opacity},${gravity},x_${margin},y_${margin},fl_layer_apply`;

    const transformsStr = parsed.transforms.length > 0 ? parsed.transforms.join('/') + '/' : '';
    const versionStr = parsed.version ? parsed.version + '/' : '';

    return `${baseUrl}${transformsStr}${overlay}/${versionStr}${parsed.publicId}`;
  } catch {
    return url;
  }
}

function resolveSingleUrl(img: unknown, adId?: number): string {
  const key = cacheKey(img, adId);
  const cached = urlCache.get(key);
  if (cached !== undefined) return cached;

  let url = '';

  if (typeof img === 'string') {
    url = img;
  } else if (typeof img === 'object' && img !== null) {
    const o = img as Record<string, unknown>;
    url = (o.thumbnail_url as string) || (o.listing_url as string) || (o.thumbnail as string) ||
          (o.full_thumbnail_url as string) || (o.display_url as string) || (o.url as string) ||
          (o.full_url as string) || (o.src as string) || (o.original_url as string) ||
          (o.image as string) || (o.path as string) || (o.file as string) || '';
  }

  if (!url || url === 'null' || url === 'undefined') {
    urlCache.set(key, '');
    return '';
  }

  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (isCloudinaryUrl(url)) {
        const result = addWatermarkToCloudinaryUrl(url, adId);
        urlCache.set(key, result);
        return result;
      }
      urlCache.set(key, url);
      return url;
    }

    if (url.startsWith('/')) {
      urlCache.set(key, url);
      return url;
    }

    urlCache.set(key, url);
    return url;
  } catch {
    urlCache.set(key, url || FALLBACK_IMAGE);
    return url || FALLBACK_IMAGE;
  }
}

function extractImageObjects(ad: unknown): { images: Record<string, unknown>[]; image: Record<string, unknown> | null; imageUrl: string } {
  const a = ad as Record<string, unknown> | null;
  if (!a) return { images: [], image: null, imageUrl: '' };

  const rawImages = (a.images as unknown[]) || [];
  const images: Record<string, unknown>[] = Array.isArray(rawImages)
    ? rawImages.filter(Boolean).map((img) => (typeof img === 'object' ? img as Record<string, unknown> : { url: img as string }))
    : [];

  const image = (a.image && typeof a.image === 'object' ? a.image as Record<string, unknown> : null);
  const imageUrl = typeof a.image_url === 'string' ? a.image_url : '';

  return { images, image, imageUrl };
}

// =====================================================
//  PUBLIC API
// =====================================================

export function getAdImageUrl(img: unknown, adId?: number): string {
  return resolveSingleUrl(img, adId);
}

export function getAdThumbnailUrl(img: unknown, adId?: number): string {
  const key = `thumb:${cacheKey(img, adId)}`;
  const cached = urlCache.get(key);
  if (cached !== undefined) return cached;

  const url = resolveSingleUrl(img, adId);
  if (!url || url === FALLBACK_IMAGE) {
    urlCache.set(key, url);
    return url;
  }

  if (isCloudinaryUrl(url)) {
    const uploadIdx = url.indexOf('/image/upload/');
    if (uploadIdx !== -1) {
      const afterUpload = url.slice(uploadIdx + '/image/upload/'.length);
      const preOverlay = afterUpload.split('/l_')[0];
      const hasWidth = /w_\d{2,}/.test(preOverlay);
      if (!hasWidth) {
        try {
          const thumbUrl = url.replace('/image/upload/', '/image/upload/w_400,h_300,c_fill,g_auto,q_auto,f_auto/');
          urlCache.set(key, thumbUrl);
          return thumbUrl;
        } catch {
          urlCache.set(key, url);
          return url;
        }
      }
    }
  }
  urlCache.set(key, url);
  return url;
}

let adMainCache = new LruCache(300);

export function getAdMainImage(ad: unknown, adId?: number): string {
  if (!ad || typeof ad !== 'object') return FALLBACK_IMAGE;

  const rawId = (ad as Record<string, unknown>)?.id;
  const cacheKeyStr = `main:${String(rawId ?? '')}|${adId ?? ''}`;
  const cached = adMainCache.get(cacheKeyStr);
  if (cached !== undefined) return cached;

  try {
    const { images, image, imageUrl } = extractImageObjects(ad);

    if (images.length > 0) {
      for (const img of images) {
        const url = resolveSingleUrl(img, adId);
        if (url) {
          adMainCache.set(cacheKeyStr, url);
          return url;
        }
      }
    }

    if (image) {
      const url = resolveSingleUrl(image, adId);
      if (url) {
        adMainCache.set(cacheKeyStr, url);
        return url;
      }
    }

    if (imageUrl) {
      const url = resolveSingleUrl(imageUrl, adId);
      if (url) {
        adMainCache.set(cacheKeyStr, url);
        return url;
      }
    }

    if (typeof (ad as Record<string, unknown>).image === 'string') {
      const url = resolveSingleUrl((ad as Record<string, unknown>).image as string, adId);
      if (url) {
        adMainCache.set(cacheKeyStr, url);
        return url;
      }
    }
  } catch {
    adMainCache.set(cacheKeyStr, FALLBACK_IMAGE);
    return FALLBACK_IMAGE;
  }

  adMainCache.set(cacheKeyStr, FALLBACK_IMAGE);
  return FALLBACK_IMAGE;
}

export function getAdImages(ad: unknown, adId?: number): string[] {
  if (!ad || typeof ad !== 'object') return [FALLBACK_IMAGE];

  try {
    const { images, image, imageUrl } = extractImageObjects(ad);
    const result: string[] = [];

    for (const img of images) {
      const url = resolveSingleUrl(img, adId);
      if (url) result.push(url);
    }

    if (result.length === 0 && image) {
      const url = resolveSingleUrl(image, adId);
      if (url) result.push(url);
    }

    if (result.length === 0 && imageUrl) {
      const url = resolveSingleUrl(imageUrl, adId);
      if (url) result.push(url);
    }

    if (result.length === 0) return [FALLBACK_IMAGE];
    return result;
  } catch {
    return [FALLBACK_IMAGE];
  }
}

export function getAdGalleryUrls(ad: unknown, adId?: number): string[] {
  if (!ad || typeof ad !== 'object') return [FALLBACK_IMAGE];

  try {
    const { images } = extractImageObjects(ad);
    if (images.length === 0) return [getAdMainImage(ad, adId)];

    return images
      .map((img) => resolveSingleUrl(img, adId))
      .filter(Boolean);
  } catch {
    return [FALLBACK_IMAGE];
  }
}

export function getPrimaryImageUrl(images: unknown[], adId?: number): string {
  if (!images || !Array.isArray(images) || images.length === 0) return '';

  try {
    const validImages = images.filter(Boolean);
    if (validImages.length === 0) return '';

    const primary = validImages.find((img: any) => img?.is_primary);
    const img = primary || validImages[0];

    return resolveSingleUrl(img, adId);
  } catch {
    return '';
  }
}

export function getValidImages(images: unknown[], adId?: number): string[] {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [FALLBACK_IMAGE];
  }

  try {
    const validUrls: string[] = [];

    for (const img of images) {
      if (!img) continue;
      const url = resolveSingleUrl(img, adId);
      if (url) validUrls.push(url);
    }

    if (validUrls.length === 0) return [FALLBACK_IMAGE];
    return validUrls;
  } catch {
    return [FALLBACK_IMAGE];
  }
}

export function getAdMainImageWithCacheBust(ad: unknown, adId?: number): string {
  try {
    const url = getAdMainImage(ad, adId);
    if (!url || url === FALLBACK_IMAGE || url.startsWith('/')) return url;
    const ts = (ad as Record<string, unknown>)?.updated_at || (ad as Record<string, unknown>)?.created_at || Date.now();
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_cb=${ts}`;
  } catch {
    return FALLBACK_IMAGE;
  }
}

// =====================================================
//  DIMENSION HELPERS (CLS prevention)
// =====================================================

export interface ImageDimensions {
  width: number;
  height: number;
}

const DEFAULT_AD_ASPECT = { width: 4, height: 3 };

export function getAdImageDimensions(img: unknown): ImageDimensions {
  const o = img as Record<string, unknown> | null;
  if (o?.width && o?.height) {
    return { width: Number(o.width), height: Number(o.height) };
  }
  return DEFAULT_AD_ASPECT;
}

export function getAspectRatioStyle(dimensions: ImageDimensions): string {
  return `${dimensions.width} / ${dimensions.height}`;
}

// =====================================================
//  WATERMARK CONFIG CHECK (for diagnostics)
// =====================================================

export function isWatermarkConfigured(): boolean {
  if (!clientWatermark || !clientWatermark.enabled) return false;
  if (clientWatermark.type === 'logo') return !!clientWatermark.logo_url;
  return clientWatermark.type === 'text' && !!clientWatermark.text;
}

export { FALLBACK_IMAGE };
