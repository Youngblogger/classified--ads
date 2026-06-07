import { assertValidListing, assertValidListings } from './dev-assert';
import { listingLogger } from './logger';

export interface NormalizedAd {
  id: number | string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  currency: string;
  condition: string;
  status: string;
  negotiable: boolean;
  views: number;
  views_count: number;
  favorites_count: number;
  is_featured: boolean;
  is_boosted: boolean;
  boost_type: string | null;
  boost_status: string | null;
  boost_expires_at: string | null;
  boost_end_time: string | null;
  boost_plan: string | null;
  badge_label: string | null;
  badge_icon: string | null;
  boost_priority_score: number;
  plan_name: string | null;
  whatsapp: string;
  phone: string;
  sellerPhone: string;
  phone_number: string;
  state: string;
  lga: string;
  city: string;
  location: string;
  specifications: any[];
  attributes: Record<string, any>;
  metadata: any;
  createdAt: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  category_id: number | null;
  subcategory_id: number | null;
  user_id: number | string | null;
  category: any;
  subcategory: any;
  user: any;
  image_url: string | null;
  images_count: number;
  images: any[];
  seller?: string;
  sellerName?: string;
  main_image?: string;
  slider_images?: any[];
}

// Maps legacy display-name keys to machine-name keys for backward compatibility
export const LEGACY_KEY_MAP: Record<string, string> = {
  'Year': 'year',
  'Fuel Type': 'fuel_type',
  'Transmission': 'transmission',
  'Mileage': 'mileage',
  'Engine Capacity': 'engine_capacity',
  'Drive Type': 'drive_type',
  'Body Type': 'body_type',
  'Color': 'color',
  'Interior Color': 'interior_color',
  'Condition': 'condition',
  'Make': 'brand',
  'Model': 'model',
  'Storage': 'storage',
  'RAM': 'ram',
  'Screen Size': 'screen_size',
  'Battery Capacity': 'battery_capacity',
  'Processor': 'processor',
  'Operating System': 'operating_system',
  'Camera': 'camera_megapixels',
  'Connectivity': 'connectivity',
  'SIM Type': 'sim_type',
  'Cellular': 'cellular',
  'Property Type': 'property_type',
  'Bedrooms': 'bedrooms',
  'Bathrooms': 'bathrooms',
  'Furnishing': 'furnishing',
  'Status': 'status',
  'Job Type': 'job_type',
  'Experience Level': 'experience_level',
  'Education Level': 'education_level',
  'Salary Range': 'salary_range',
  'Service Type': 'service_type',
  'Service Level': 'service_level',
  'Size': 'size',
  'Gender': 'gender',
  'Pet Type': 'pet_type',
  'Breed': 'breed',
  'Age': 'age',
  'Age Group': 'age_group',
  'Used For': 'used_for',
  'Category': 'subcategory',
  'Registration': 'registration',
  'VIN': 'vin',
  'Air Conditioning': 'air_conditioning',
  'Sunroof': 'sunroof',
  'Leather Seats': 'leather_seats',
  'Heated Seats': 'heated_seats',
  'Navigation': 'navigation',
  'Reverse Camera': 'reverse_camera',
  'Parking Sensors': 'parking_sensors',
  'Bluetooth': 'bluetooth',
  'ABS': 'abs',
  'Airbags': 'airbags',
};

export function normalizeAttributeKeys(attrs: Record<string, any>): Record<string, any> {
  if (!attrs) return {};
  const normalized: Record<string, any> = {};
  for (const [key, value] of Object.entries(attrs)) {
    normalized[LEGACY_KEY_MAP[key] ?? key] = value;
  }
  return normalized;
}

function imgAbs(url: string | undefined | null): string {
  if (!url || url.startsWith('http://') || url.startsWith('https://')) return url || '';
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

function ensureAbs(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return imgAbs(url);
}

function extractImageUrl(img: any): string {
  if (!img) return '';
  if (typeof img === 'string') return imgAbs(img);
  return ensureAbs(
    img.url || img.display_url || img.image_url || img.full_url ||
    img.thumbnail || img.thumbnail_url || img.full_thumbnail_url ||
    img.medium_url || img.original_url || img.src || img.image ||
    img.path || img.file || img.listing_url || ''
  );
}

function imgUrl(img: any): string {
  return ensureAbs(img.url || img.display_url || img.image_url || img.full_url || '');
}

function imgThumbUrl(img: any): string {
  return ensureAbs(img.thumbnail_url || img.thumbnail || img.url || img.display_url || img.image_url || img.full_url || img.full_thumbnail_url || '');
}

function imgMediumUrl(img: any): string {
  return ensureAbs(img.medium_url || img.url || img.display_url || img.image_url || img.full_url || '');
}

function extractImages(src: any): any[] {
  if (!src) return [];

  if (Array.isArray(src)) {
    return src
      .filter(Boolean)
      .map((img: any) => {
        if (typeof img === 'string') {
          return { id: undefined, url: imgAbs(img), thumbnail_url: imgAbs(img), medium_url: imgAbs(img), is_primary: false };
        }
        return {
          id: img.id,
          url: imgUrl(img),
          thumbnail_url: imgThumbUrl(img),
          medium_url: imgMediumUrl(img),
          is_primary: img.is_primary ?? false,
        };
      });
  }

  if (typeof src === 'string') {
    return [{ id: undefined, url: imgAbs(src), thumbnail_url: imgAbs(src), medium_url: imgAbs(src), is_primary: true }];
  }

  return [];
}

function extractSpecifications(src: any): any[] {
  if (!src) return [];

  if (Array.isArray(src)) {
    return src.filter(Boolean).map((item: any) => {
      if (item && item.name) {
        const machineName = LEGACY_KEY_MAP[item.name] ?? item.name;
        return item.name !== machineName ? { ...item, name: machineName } : item;
      }
      return item;
    });
  }

  if (typeof src === 'object') {
    const entries = Object.entries(src).filter(([, v]) => v != null && v !== '');
    if (entries.length === 0) return [];

    const hasGroups = Object.values(src).some(
      (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
    );

    if (hasGroups) {
      const result: any[] = [];
      for (const [groupName, fields] of Object.entries(src)) {
        if (fields && typeof fields === 'object' && !Array.isArray(fields)) {
          for (const [key, value] of Object.entries(fields as Record<string, any>)) {
            if (value != null && value !== '') {
              const machineName = LEGACY_KEY_MAP[key] ?? key;
              result.push({
                name: machineName,
                label: machineName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                value: String(value),
                raw_value: value,
                type: typeof value === 'boolean' ? 'boolean' : 'text',
                group_name: groupName,
                sort_order: 0,
              });
            }
          }
        }
      }
      return result;
    }

    return entries.map(([key, value]) => {
      const machineName = LEGACY_KEY_MAP[key] ?? key;
      return {
        name: machineName,
        label: machineName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: String(value),
        raw_value: value,
        type: typeof value === 'boolean' ? 'boolean' : 'text',
        group_name: null,
        sort_order: 0,
      };
    });
  }

  return [];
}

function extractCategory(ad: any): any {
  if (!ad) return null;
  if (ad.category && typeof ad.category === 'object') return ad.category;
  if (ad.category_id && typeof ad.category_id === 'string' && ad.category_id.includes('-')) {
    return null;
  }
  if (ad.category_id) return { id: ad.category_id, name: String(ad.category_id), slug: String(ad.category_id) };
  if (ad.category && typeof ad.category === 'string') return { id: undefined, name: ad.category, slug: ad.category.toLowerCase().replace(/\s+/g, '-') };
  if (ad.subcategory && typeof ad.subcategory === 'object') return ad.subcategory;
  return null;
}

function extractUser(ad: any): any {
  if (!ad) return undefined;
  if (ad.user && typeof ad.user === 'object' && Object.keys(ad.user).length > 0) {
    const u = ad.user;
    return {
      id: u.id,
      name: u.name || u.full_name || u.username || '',
      full_name: u.full_name || u.name || '',
      username: u.username || '',
      email: u.email || '',
      phone: u.phone || '',
      avatar: ensureAbs(u.full_avatar_url || u.avatar_url || u.avatar || ''),
      avatar_url: ensureAbs(u.avatar_url || u.avatar || ''),
      full_avatar_url: ensureAbs(u.full_avatar_url || u.avatar_url || u.avatar || ''),
      google_avatar: u.google_avatar || '',
      facebook_avatar: u.facebook_avatar || '',
      location: u.location || '',
      created_at: u.created_at || null,
      verified: u.verified || u.is_verified || u.is_verified_seller || false,
      is_verified: u.is_verified || u.verified || false,
      is_verified_seller: u.is_verified_seller || u.is_verified || u.verified || false,
      is_verified_business: u.is_verified_business || false,
      rating_avg: u.rating_avg || null,
      response_time: u.response_time || u.response_time_avg || null,
      completed_transactions: u.completed_transactions || null,
    };
  }

  if (ad.profiles && typeof ad.profiles === 'object') {
    const p = ad.profiles;
    return {
      id: p.id,
      name: p.full_name || p.username || '',
      full_name: p.full_name || '',
      username: p.username || '',
      email: p.email || '',
      phone: p.phone || '',
      avatar: ensureAbs(p.avatar_url || ''),
      avatar_url: ensureAbs(p.avatar_url || ''),
      full_avatar_url: ensureAbs(p.avatar_url || ''),
      google_avatar: p.google_avatar || '',
      facebook_avatar: p.facebook_avatar || '',
      location: p.location || '',
      created_at: p.created_at || null,
      verified: p.is_verified || false,
      is_verified: p.is_verified || false,
      is_verified_seller: p.is_verified || false,
      is_verified_business: (p as any).is_verified_business || false,
      rating_avg: p.rating_avg || null,
      response_time: p.response_time_avg || null,
      completed_transactions: p.completed_transactions || null,
    };
  }

  if (ad.sellerName || ad.seller) {
    return {
      id: ad.user_id || ad.id || null,
      name: ad.sellerName || ad.seller || 'Unknown Seller',
      full_name: ad.sellerName || ad.seller || '',
      phone: ad.sellerPhone || ad.phone || '',
      avatar: '',
      avatar_url: '',
      full_avatar_url: '',
      verified: ad.is_verified || false,
    };
  }

  return undefined;
}

function extractLocation(ad: any): string {
  if (typeof ad.location === 'string') return ad.location;
  if (ad.location?.name) return ad.location.name;
  if (ad.state && ad.lga) return `${ad.lga}, ${ad.state}`;
  if (ad.state) return ad.state;
  if (ad.lga) return ad.lga;
  if (ad.city) return ad.city;
  return '';
}

export function normalizeAd(ad: any, isDetail = false): NormalizedAd | null {
  assertValidListing(ad, 'normalizeAd');
  if (!ad) return null;

  const images = extractImages(ad.images || ad.image_urls || ad.photos || ad.gallery || ad.listing_images || []);
  const singleImage = images.length > 0 ? images[0] : null;

  const primaryImageUrl = singleImage?.url || ensureAbs(ad.image_url || ad.image?.url || ad.image?.full_url || '') || null;

  if (images.length === 0 && ad.image && typeof ad.image === 'object') {
    images.push({
      id: ad.image.id,
      url: imgUrl(ad.image),
      thumbnail_url: imgThumbUrl(ad.image),
      medium_url: imgMediumUrl(ad.image),
      is_primary: true,
    });
  }

  if (images.length === 0 && ad.main_image) {
    const mainUrl = extractImageUrl(ad.main_image);
    if (mainUrl) {
      images.push({ id: undefined, url: mainUrl, thumbnail_url: mainUrl, medium_url: mainUrl, is_primary: true });
    }
  }

  if (ad.slider_images && Array.isArray(ad.slider_images)) {
    for (const si of ad.slider_images) {
      const siUrl = extractImageUrl(si);
      if (siUrl && !images.some((i) => i.url === siUrl)) {
        images.push({ id: undefined, url: siUrl, thumbnail_url: siUrl, medium_url: siUrl, is_primary: images.length === 0 });
      }
    }
  }

  const specsInput = ad.specifications || ad.attrs || (isDetail ? (ad.attributes || null) : null);
  const specifications = extractSpecifications(specsInput);

  const description = ad.description || ad.full_description || '';
  const createdAt = ad.created_at || ad.createdAt || ad.created || '';

  const normalized = {
    id: ad.id,
    title: ad.title || '',
    slug: ad.slug || '',
    description,
    short_description: ad.short_description || description.slice(0, 150) || '',
    price: typeof ad.price === 'string' ? parseFloat(ad.price) : (ad.price || 0),
    currency: ad.currency || 'NGN',
    condition: ad.condition || '',
    status: ad.status || 'active',
    negotiable: ad.negotiable ?? false,
    views: ad.views || ad.views_count || 0,
    views_count: ad.views_count || ad.views || 0,
    favorites_count: ad.favorites_count || 0,
    is_featured: ad.is_featured || ad.featured || false,
    is_boosted: ad.is_boosted || false,
    boost_type: ad.boost_type || null,
    boost_status: ad.boost_status || null,
    boost_expires_at: ad.boost_expires_at || null,
    boost_end_time: ad.boost_end_time || ad.boost_expires_at || null,
    boost_plan: ad.boost_plan || null,
    badge_label: ad.badge_label || null,
    badge_icon: ad.badge_icon || null,
    boost_priority_score: ad.boost_priority_score || 0,
    plan_name: ad.plan_name || null,
    whatsapp: ad.whatsapp || ad.whatsapp_number || ad.phone || ad.sellerPhone || '',
    phone: ad.phone || ad.phone_number || ad.sellerPhone || '',
    sellerPhone: ad.sellerPhone || ad.phone || ad.phone_number || '',
    phone_number: ad.phone_number || ad.phone || '',
    state: ad.state || '',
    lga: ad.lga || '',
    city: ad.city || '',
    location: extractLocation(ad),
    specifications,
    attributes: ad.attributes || ad.attrs || {},
    metadata: ad.metadata || null,
    createdAt,
    created_at: createdAt,
    updated_at: ad.updated_at || createdAt,
    expires_at: ad.expires_at || null,
    category_id: ad.category_id || ad.category?.id || null,
    subcategory_id: ad.subcategory_id || ad.subcategory?.id || null,
    user_id: ad.user_id || ad.user?.id || null,
    category: extractCategory(ad),
    subcategory: ad.subcategory || null,
    user: extractUser(ad),
    image_url: primaryImageUrl,
    images_count: images.length,
    images,
    seller: ad.seller || ad.sellerName || '',
    sellerName: ad.sellerName || ad.seller || '',
    main_image: ad.main_image ? extractImageUrl(ad.main_image) : primaryImageUrl || undefined,
    slider_images: ad.slider_images || (images.length > 0 ? images.map((i) => i.url) : undefined),
  };

  if (isDetail && normalized.specifications.length === 0) {
    listingLogger.warn('Detail ad has NO specifications', { rawAttributes: ad?.attributes, specificationsField: ad?.specifications, adId: ad?.id });
  }

  if (normalized.images.length === 0) {
    listingLogger.warn('Ad has NO images', { rawImages: ad?.images, rawImageUrls: ad?.image_urls, rawImage: ad?.image, rawImageUrl: ad?.image_url, rawMainImage: ad?.main_image, rawListingImages: ad?.listing_images, adId: ad?.id });
  }

  return normalized;
}

export function normalizeAds(ads: any[], isDetail = false): NormalizedAd[] {
  assertValidListings(ads, 'normalizeAds');
  return (ads || []).filter(Boolean).map((ad: any) => normalizeAd(ad, isDetail)).filter(Boolean) as NormalizedAd[];
}

export { extractImages as extractAdImages, extractSpecifications as normalizeSpecifications };
