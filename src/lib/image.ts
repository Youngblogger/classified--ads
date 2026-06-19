import { FALLBACK_IMAGE } from './config';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

function diag(...args: any[]) {
  if (process.env.NODE_ENV === 'development') console.warn('[DIAG][IMG]', ...args);
}

function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

function addWatermarkToCloudinaryUrl(url: string, adId?: number): string {
  if (!CLOUD_NAME) {
    diag('WATERMARK SKIPPED: CLOUD_NAME not set');
    return url;
  }

  const marker = `/image/upload/`;
  const idx = url.indexOf(marker);
  if (idx === -1) {
    diag('WATERMARK SKIPPED: not a Cloudinary upload URL', url.slice(0, 60));
    return url;
  }

  if (url.includes('fl_layer_apply')) {
    return url;
  }

  const afterUpload = url.slice(idx + marker.length);
  const baseUrl = url.slice(0, idx + marker.length);
  const parts = afterUpload.split('/');
  const publicIdIndex = parts.findIndex((p) => !p.includes('_'));
  const publicId = publicIdIndex >= 0 ? parts.slice(publicIdIndex).join('/') : afterUpload;

  let textStr = 'iList';
  if (adId) textStr += ` | ID:${adId}`;
  const encodedText = textStr.replace(/ /g, '%20').replace(/,/g, '%252C').replace(/\|/g, '%7C');

  const overlay = `l_text:Arial_28:${encodedText},co_rgb:FFFFFF,o_60,g_se,x_15,y_15,fl_layer_apply`;

  const result = `${baseUrl}${overlay}/${publicId}`;
  diag('WATERMARK APPLIED:', { adId, resultLen: result.length });
  return result;
}

function resolveSingleUrl(img: unknown, adId?: number): string {
  if (!img) return '';

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

  if (!url || url === 'null' || url === 'undefined') return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (isCloudinaryUrl(url)) {
      return addWatermarkToCloudinaryUrl(url, adId);
    }
    return url;
  }

  if (url.startsWith('/')) return url;

  return url;
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

export function getAdImageUrl(img: unknown, adId?: number): string {
  return resolveSingleUrl(img, adId);
}

export function getAdThumbnailUrl(img: unknown, adId?: number): string {
  const url = resolveSingleUrl(img, adId);
  if (!url || url === FALLBACK_IMAGE) return url;

  if (isCloudinaryUrl(url) && !url.includes('w_')) {
    return url.replace('/image/upload/', '/image/upload/w_400,h_300,c_fill,g_auto,q_auto,f_auto/');
  }
  return url;
}

export function getAdMainImage(ad: unknown, adId?: number): string {
  if (!ad || typeof ad !== 'object') return FALLBACK_IMAGE;

  const { images, image, imageUrl } = extractImageObjects(ad);

  if (images.length > 0) {
    for (const img of images) {
      const url = resolveSingleUrl(img, adId);
      if (url) return url;
    }
  }

  if (image) {
    const url = resolveSingleUrl(image, adId);
    if (url) return url;
  }

  if (imageUrl) {
    const url = resolveSingleUrl(imageUrl, adId);
    if (url) return url;
  }

  if (typeof (ad as Record<string, unknown>).image === 'string') {
    const url = resolveSingleUrl((ad as Record<string, unknown>).image as string, adId);
    if (url) return url;
  }

  return FALLBACK_IMAGE;
}

export function getAdImages(ad: unknown, adId?: number): string[] {
  if (!ad || typeof ad !== 'object') return [FALLBACK_IMAGE];

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
}

export function getAdGalleryUrls(ad: unknown, adId?: number): string[] {
  if (!ad || typeof ad !== 'object') return [FALLBACK_IMAGE];

  const { images } = extractImageObjects(ad);
  if (images.length === 0) return [getAdMainImage(ad, adId)];

  return images
    .map((img) => resolveSingleUrl(img, adId))
    .filter(Boolean);
}

export function getPrimaryImageUrl(images: unknown[], adId?: number): string {
  if (!images || !Array.isArray(images) || images.length === 0) return '';

  const validImages = images.filter(Boolean);
  if (validImages.length === 0) return '';

  const primary = validImages.find((img: any) => img?.is_primary);
  const img = primary || validImages[0];

  return resolveSingleUrl(img, adId);
}

export function getValidImages(images: unknown[], adId?: number): string[] {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [FALLBACK_IMAGE];
  }

  const validUrls: string[] = [];

  for (const img of images) {
    if (!img) continue;
    const url = resolveSingleUrl(img, adId);
    if (url) validUrls.push(url);
  }

  if (validUrls.length === 0) return [FALLBACK_IMAGE];
  return validUrls;
}

export function getAdMainImageWithCacheBust(ad: unknown, adId?: number): string {
  const url = getAdMainImage(ad, adId);
  if (!url || url === FALLBACK_IMAGE || url.startsWith('/')) return url;
  const ts = (ad as Record<string, unknown>)?.updated_at || (ad as Record<string, unknown>)?.created_at || Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_cb=${ts}`;
}

export { FALLBACK_IMAGE };
