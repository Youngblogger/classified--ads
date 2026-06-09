import { assertValidListing, assertValidListings } from './dev-assert';
import { listingLogger } from './logger';

export interface NormalizedAdImage {
  id: number | undefined;
  url: string;
  thumbnail_url: string;
  medium_url: string;
  is_primary: boolean;
}

export interface NormalizedAdUser {
  id: number | string | null;
  name: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  avatar_url: string;
  full_avatar_url: string;
  google_avatar: string;
  facebook_avatar: string;
  location: string;
  created_at: string | null;
  verified: boolean;
  is_verified: boolean;
  is_verified_seller: boolean;
  is_verified_business: boolean;
  rating_avg: number | null;
  response_time: number | null;
  completed_transactions: number | null;
}

export interface NormalizedAdCategory {
  id: number | string | undefined;
  name: string;
  slug: string;
}

export interface NormalizedAdSpecification {
  name: string;
  label: string;
  value: string;
  raw_value: unknown;
  type: string;
  options: string[];
  group_name: string | null;
  sort_order: number;
}

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
  favorites_count: number;
  is_featured: boolean;
  is_boosted: boolean;
  boost_type: string | null;
  boost_status: string | null;
  boost_expires_at: string | null;
  boost_plan: string | null;
  badge_label: string | null;
  badge_icon: string | null;
  boost_priority_score: number;
  whatsapp: string;
  phone: string;
  sellerPhone: string;
  state: string;
  lga: string;
  city: string;
  location: string;
  specifications: NormalizedAdSpecification[];
  attributes: Record<string, unknown>;
  metadata: unknown;
  createdAt: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  category_id: number | null;
  subcategory_id: number | null;
  user_id: number | string | null;
  category: NormalizedAdCategory | null;
  subcategory: unknown;
  user: NormalizedAdUser | undefined;
  image_url: string | null;
  images_count: number;
  images: NormalizedAdImage[];
  seller: string;
  sellerName: string;
  main_image: string | undefined;
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

export function normalizeAttributeKeys(attrs: Record<string, unknown>): Record<string, unknown> {
  if (!attrs) return {};
  const normalized: Record<string, unknown> = {};
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

function extractImageUrl(img: unknown): string {
  if (!img) return '';
  if (typeof img === 'string') return imgAbs(img);
  if (typeof img === 'object' && img !== null) {
    const o = img as Record<string, unknown>;
    return ensureAbs(
      String(o.url || o.display_url || o.image_url || o.full_url ||
        o.thumbnail || o.thumbnail_url || o.full_thumbnail_url ||
        o.medium_url || o.original_url || o.src || o.image ||
        o.path || o.file || o.listing_url || '')
    );
  }
  return '';
}

function imgUrl(img: unknown): string {
  if (!img || typeof img !== 'object') return '';
  const o = img as Record<string, unknown>;
  return ensureAbs(String(o.url || o.display_url || o.image_url || o.full_url || ''));
}

function imgThumbUrl(img: unknown): string {
  if (!img || typeof img !== 'object') return '';
  const o = img as Record<string, unknown>;
  return ensureAbs(String(o.thumbnail_url || o.thumbnail || o.url || o.display_url || o.image_url || o.full_url || o.full_thumbnail_url || ''));
}

function imgMediumUrl(img: unknown): string {
  if (!img || typeof img !== 'object') return '';
  const o = img as Record<string, unknown>;
  return ensureAbs(String(o.medium_url || o.url || o.display_url || o.image_url || o.full_url || ''));
}

function extractImages(src: unknown): NormalizedAdImage[] {
  if (!src) return [];

  if (Array.isArray(src)) {
    return src
      .filter(Boolean)
      .map((img: unknown) => {
        if (typeof img === 'string') {
          return { id: undefined, url: imgAbs(img), thumbnail_url: imgAbs(img), medium_url: imgAbs(img), is_primary: false };
        }
        if (typeof img === 'object' && img !== null) {
          const o = img as Record<string, unknown>;
          return {
            id: o.id as number | undefined,
            url: imgUrl(img),
            thumbnail_url: imgThumbUrl(img),
            medium_url: imgMediumUrl(img),
            is_primary: o.is_primary === true,
          };
        }
        return { id: undefined, url: '', thumbnail_url: '', medium_url: '', is_primary: false };
      })
      .filter((i) => i.url !== '');
  }

  if (typeof src === 'string') {
    return [{ id: undefined, url: imgAbs(src), thumbnail_url: imgAbs(src), medium_url: imgAbs(src), is_primary: true }];
  }

  return [];
}

function extractSpecifications(src: unknown): NormalizedAdSpecification[] {
  if (!src) return [];

  if (Array.isArray(src)) {
    return src.filter(Boolean).map((item: unknown) => {
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>;
        if (o.name) {
          const machineName = LEGACY_KEY_MAP[String(o.name)] ?? String(o.name);
          return {
            ...o,
            name: machineName,
          } as unknown as NormalizedAdSpecification;
        }
      }
      return item as NormalizedAdSpecification;
    });
  }

  if (typeof src === 'object') {
    const entries = Object.entries(src as Record<string, unknown>).filter(([, v]) => v != null && v !== '');
    if (entries.length === 0) return [];

    const hasGroups = Object.values(src as Record<string, unknown>).some(
      (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
    );

    if (hasGroups) {
      const result: NormalizedAdSpecification[] = [];
      for (const [groupName, fields] of Object.entries(src as Record<string, unknown>)) {
        if (fields && typeof fields === 'object' && !Array.isArray(fields)) {
          for (const [key, value] of Object.entries(fields as Record<string, unknown>)) {
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
                options: [],
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
        options: [],
      };
    });
  }

  return [];
}

function extractCategory(ad: Record<string, unknown>): NormalizedAdCategory | null {
  if (!ad) return null;
  if (ad.category && typeof ad.category === 'object') {
    const c = ad.category as Record<string, unknown>;
    return { id: c.id as number | undefined, name: String(c.name || ''), slug: String(c.slug || '') };
  }
  if (ad.category_id && typeof ad.category_id === 'string' && String(ad.category_id).includes('-')) {
    return null;
  }
  if (ad.category_id) return { id: ad.category_id as number | undefined, name: String(ad.category_id), slug: String(ad.category_id) };
  if (ad.category && typeof ad.category === 'string') return { id: undefined, name: ad.category as string, slug: (ad.category as string).toLowerCase().replace(/\s+/g, '-') };
  if (ad.subcategory && typeof ad.subcategory === 'object') {
    const s = ad.subcategory as Record<string, unknown>;
    return { id: s.id as number | undefined, name: String(s.name || ''), slug: String(s.slug || '') };
  }
  return null;
}

function extractUser(ad: Record<string, unknown>): NormalizedAdUser | undefined {
  if (!ad) return undefined;

  if (ad.user && typeof ad.user === 'object' && Object.keys(ad.user as Record<string, unknown>).length > 0) {
    const u = ad.user as Record<string, unknown>;
    return {
      id: (u.id as number | string | null) ?? null,
      name: String(u.name || u.full_name || u.username || ''),
      full_name: String(u.full_name || u.name || ''),
      username: String(u.username || ''),
      email: String(u.email || ''),
      phone: String(u.phone || ''),
      avatar: ensureAbs(String(u.full_avatar_url || u.avatar_url || u.avatar || '')),
      avatar_url: ensureAbs(String(u.avatar_url || u.avatar || '')),
      full_avatar_url: ensureAbs(String(u.full_avatar_url || u.avatar_url || u.avatar || '')),
      google_avatar: String(u.google_avatar || ''),
      facebook_avatar: String(u.facebook_avatar || ''),
      location: String(u.location || ''),
      created_at: u.created_at ? String(u.created_at) : null,
      verified: !!(u.verified || u.is_verified || u.is_verified_seller),
      is_verified: !!(u.is_verified || u.verified),
      is_verified_seller: !!(u.is_verified_seller || u.is_verified || u.verified),
      is_verified_business: !!u.is_verified_business,
      rating_avg: (u.rating_avg as number) ?? null,
      response_time: (u.response_time || u.response_time_avg) as number ?? null,
      completed_transactions: (u.completed_transactions as number) ?? null,
    };
  }

  if (ad.profiles && typeof ad.profiles === 'object') {
    const p = ad.profiles as Record<string, unknown>;
    return {
      id: (p.id as number | string | null) ?? null,
      name: String(p.full_name || p.username || ''),
      full_name: String(p.full_name || ''),
      username: String(p.username || ''),
      email: String(p.email || ''),
      phone: String(p.phone || ''),
      avatar: ensureAbs(String(p.avatar_url || '')),
      avatar_url: ensureAbs(String(p.avatar_url || '')),
      full_avatar_url: ensureAbs(String(p.avatar_url || '')),
      google_avatar: String(p.google_avatar || ''),
      facebook_avatar: String(p.facebook_avatar || ''),
      location: String(p.location || ''),
      created_at: p.created_at ? String(p.created_at) : null,
      verified: !!p.is_verified,
      is_verified: !!p.is_verified,
      is_verified_seller: !!p.is_verified,
      is_verified_business: !!(p as Record<string, unknown>).is_verified_business,
      rating_avg: (p.rating_avg as number) ?? null,
      response_time: (p.response_time_avg as number) ?? null,
      completed_transactions: (p.completed_transactions as number) ?? null,
    };
  }

  if (ad.sellerName || ad.seller) {
    return {
      id: (ad.user_id as number | string | null) ?? (ad.id as number | string | null) ?? null,
      name: String(ad.sellerName || ad.seller || 'Unknown Seller'),
      full_name: String(ad.sellerName || ad.seller || ''),
      username: '',
      email: '',
      phone: String(ad.sellerPhone || ad.phone || ''),
      avatar: '',
      avatar_url: '',
      full_avatar_url: '',
      google_avatar: '',
      facebook_avatar: '',
      location: '',
      created_at: null,
      verified: !!ad.is_verified,
      is_verified: !!ad.is_verified,
      is_verified_seller: !!ad.is_verified,
      is_verified_business: false,
      rating_avg: null,
      response_time: null,
      completed_transactions: null,
    };
  }

  return undefined;
}

function extractLocation(ad: Record<string, unknown>): string {
  if (typeof ad.location === 'string') return ad.location;
  if (ad.location && typeof ad.location === 'object') {
    const loc = ad.location as Record<string, unknown>;
    if (loc.name) return String(loc.name);
  }
  if (ad.state && ad.lga) return `${ad.lga}, ${ad.state}`;
  if (ad.state) return String(ad.state);
  if (ad.lga) return String(ad.lga);
  if (ad.city) return String(ad.city);
  return '';
}

export function normalizeAd(ad: unknown, isDetail = false): NormalizedAd | null {
  assertValidListing(ad, 'normalizeAd');
  if (!ad || typeof ad !== 'object') return null;

  const a = ad as Record<string, unknown>;

  const images = extractImages(a.images || a.image_urls || a.photos || a.gallery || a.listing_images || []);
  const singleImage = images.length > 0 ? images[0] : null;

  const primaryImageUrl = singleImage?.url || ensureAbs(String(a.image_url || (typeof a.image === 'object' ? (a.image as Record<string, unknown>)?.url || (a.image as Record<string, unknown>)?.full_url : a.image || ''))) || null;

  if (images.length === 0 && a.image && typeof a.image === 'object') {
    const img = a.image as Record<string, unknown>;
    images.push({
      id: img.id as number | undefined,
      url: imgUrl(a.image),
      thumbnail_url: imgThumbUrl(a.image),
      medium_url: imgMediumUrl(a.image),
      is_primary: true,
    });
  }

  if (images.length === 0 && a.main_image) {
    const mainUrl = extractImageUrl(a.main_image);
    if (mainUrl) {
      images.push({ id: undefined, url: mainUrl, thumbnail_url: mainUrl, medium_url: mainUrl, is_primary: true });
    }
  }

  if (a.slider_images && Array.isArray(a.slider_images)) {
    for (const si of a.slider_images) {
      const siUrl = extractImageUrl(si);
      if (siUrl && !images.some((i) => i.url === siUrl)) {
        images.push({ id: undefined, url: siUrl, thumbnail_url: siUrl, medium_url: siUrl, is_primary: images.length === 0 });
      }
    }
  }

  const specsInput = a.specifications || a.attrs || (isDetail ? (a.attributes || null) : null);
  const specifications = extractSpecifications(specsInput);

  const description = String(a.description || a.full_description || '');
  const createdAt = String(a.created_at || a.createdAt || a.created || '');

  const normalized: NormalizedAd = {
    id: a.id as number | string,
    title: String(a.title || ''),
    slug: String(a.slug || ''),
    description,
    short_description: String(a.short_description || description.slice(0, 150) || ''),
    price: typeof a.price === 'string' ? parseFloat(a.price) : ((a.price as number) || 0),
    currency: String(a.currency || 'NGN'),
    condition: String(a.condition || ''),
    status: String(a.status || 'active'),
    negotiable: a.negotiable === true,
    views: (a.views as number) || (a.views_count as number) || 0,
    favorites_count: (a.favorites_count as number) || 0,
    is_featured: !!(a.is_featured || a.featured),
    is_boosted: !!a.is_boosted,
    boost_type: a.boost_type ? String(a.boost_type) : null,
    boost_status: a.boost_status ? String(a.boost_status) : null,
    boost_expires_at: a.boost_expires_at ? String(a.boost_expires_at) : null,
    boost_plan: a.boost_plan ? String(a.boost_plan) : null,
    badge_label: a.badge_label ? String(a.badge_label) : null,
    badge_icon: a.badge_icon ? String(a.badge_icon) : null,
    boost_priority_score: (a.boost_priority_score as number) || 0,
    whatsapp: String(a.whatsapp || a.whatsapp_number || a.phone || a.sellerPhone || ''),
    phone: String(a.phone || a.phone_number || a.sellerPhone || ''),
    sellerPhone: String(a.sellerPhone || a.phone || a.phone_number || ''),
    state: String(a.state || ''),
    lga: String(a.lga || ''),
    city: String(a.city || ''),
    location: extractLocation(a),
    specifications,
    attributes: (a.attributes || a.attrs || {}) as Record<string, unknown>,
    metadata: a.metadata || null,
    createdAt,
    created_at: createdAt,
    updated_at: String(a.updated_at || createdAt),
    expires_at: a.expires_at ? String(a.expires_at) : null,
    category_id: (a.category_id as number) || ((a.category as Record<string, unknown>)?.id as number) || null,
    subcategory_id: (a.subcategory_id as number) || ((a.subcategory as Record<string, unknown>)?.id as number) || null,
    user_id: (a.user_id as number | string) || ((a.user as Record<string, unknown>)?.id as number | string) || null,
    category: extractCategory(a),
    subcategory: a.subcategory || null,
    user: extractUser(a),
    image_url: primaryImageUrl,
    images_count: images.length,
    images,
    seller: String(a.seller || a.sellerName || ''),
    sellerName: String(a.sellerName || a.seller || ''),
    main_image: a.main_image ? extractImageUrl(a.main_image) : (primaryImageUrl || undefined),
  };

  if (isDetail && normalized.specifications.length === 0) {
    listingLogger.warn('Detail ad has NO specifications', { rawAttributes: a?.attributes, specificationsField: a?.specifications, adId: a?.id });
  }

  if (normalized.images.length === 0) {
    listingLogger.warn('Ad has NO images', { rawImages: a?.images, rawImageUrls: a?.image_urls, rawImage: a?.image, rawImageUrl: a?.image_url, rawMainImage: a?.main_image, rawListingImages: a?.listing_images, adId: a?.id });
  }

  return normalized;
}

export function normalizeAds(ads: unknown[], isDetail = false): NormalizedAd[] {
  assertValidListings(ads, 'normalizeAds');
  return (ads || []).filter(Boolean).map((ad: unknown) => normalizeAd(ad, isDetail)).filter(Boolean) as NormalizedAd[];
}

/**
 * Explicit mapper for Supabase/database ads to the NormalizedAd shape.
 * Use this when you want a clear, explicit transformation from DB fields to UI fields.
 */
export function mapDbAdToUiAd(dbAd: Record<string, unknown>): NormalizedAd | null {
  if (!dbAd) return null;

  const userRaw = dbAd.user || dbAd.profiles || null;
  const userObj = userRaw && typeof userRaw === 'object' ? userRaw as Record<string, unknown> : null;

  const imagesRaw = dbAd.listing_images || dbAd.images || [];
  const imagesArr = Array.isArray(imagesRaw) ? imagesRaw : [];

  const categoryRaw = dbAd.category || null;
  const categoryObj = categoryRaw && typeof categoryRaw === 'object' ? categoryRaw as Record<string, unknown> : null;

  return {
    id: dbAd.id as number | string,
    title: String(dbAd.title || ''),
    slug: String(dbAd.slug || ''),
    description: String(dbAd.description || ''),
    short_description: String(dbAd.short_description || String(dbAd.description || '').slice(0, 150)),
    price: typeof dbAd.price === 'string' ? parseFloat(dbAd.price) : ((dbAd.price as number) || 0),
    currency: String(dbAd.currency || 'NGN'),
    condition: String(dbAd.condition || ''),
    status: String(dbAd.status || 'active'),
    negotiable: dbAd.negotiable === true,
    views: (dbAd.views as number) || 0,
    favorites_count: (dbAd.favorites_count as number) || 0,
    is_featured: !!dbAd.is_featured,
    is_boosted: !!dbAd.is_boosted,
    boost_type: dbAd.boost_type ? String(dbAd.boost_type) : null,
    boost_status: dbAd.boost_status ? String(dbAd.boost_status) : null,
    boost_expires_at: dbAd.boost_expires_at ? String(dbAd.boost_expires_at) : null,
    boost_plan: dbAd.boost_plan ? String(dbAd.boost_plan) : null,
    badge_label: dbAd.badge_label ? String(dbAd.badge_label) : null,
    badge_icon: dbAd.badge_icon ? String(dbAd.badge_icon) : null,
    boost_priority_score: (dbAd.boost_priority_score as number) || 0,
    whatsapp: String(dbAd.whatsapp || dbAd.phone || ''),
    phone: String(dbAd.phone || ''),
    sellerPhone: String(dbAd.sellerPhone || dbAd.phone || ''),
    state: String(dbAd.state || ''),
    lga: String(dbAd.lga || ''),
    city: String(dbAd.city || ''),
    location: extractLocation(dbAd),
    specifications: extractSpecifications(dbAd.specifications || dbAd.attributes || dbAd.attrs || {}),
    attributes: (dbAd.attributes || dbAd.attrs || {}) as Record<string, unknown>,
    metadata: dbAd.metadata || null,
    createdAt: String(dbAd.created_at || dbAd.createdAt || ''),
    created_at: String(dbAd.created_at || dbAd.createdAt || ''),
    updated_at: String(dbAd.updated_at || dbAd.created_at || ''),
    expires_at: dbAd.expires_at ? String(dbAd.expires_at) : null,
    category_id: (dbAd.category_id as number) || (categoryObj?.id as number) || null,
    subcategory_id: (dbAd.subcategory_id as number) || null,
    user_id: (dbAd.user_id as number | string) || (userObj?.id as number | string) || null,
    category: categoryObj ? { id: categoryObj.id as number | undefined, name: String(categoryObj.name || ''), slug: String(categoryObj.slug || '') } : null,
    subcategory: dbAd.subcategory || null,
    user: userObj ? {
      id: (userObj.id as number | string | null) ?? null,
      name: String(userObj.name || userObj.full_name || userObj.username || ''),
      full_name: String(userObj.full_name || userObj.name || ''),
      username: String(userObj.username || ''),
      email: String(userObj.email || ''),
      phone: String(userObj.phone || ''),
      avatar: ensureAbs(String(userObj.full_avatar_url || userObj.avatar_url || userObj.avatar || '')),
      avatar_url: ensureAbs(String(userObj.avatar_url || userObj.avatar || '')),
      full_avatar_url: ensureAbs(String(userObj.full_avatar_url || userObj.avatar_url || userObj.avatar || '')),
      google_avatar: String(userObj.google_avatar || ''),
      facebook_avatar: String(userObj.facebook_avatar || ''),
      location: String(userObj.location || ''),
      created_at: userObj.created_at ? String(userObj.created_at) : null,
      verified: !!(userObj.verified || userObj.is_verified),
      is_verified: !!(userObj.is_verified || userObj.verified),
      is_verified_seller: !!(userObj.is_verified_seller || userObj.is_verified || userObj.verified),
      is_verified_business: !!userObj.is_verified_business,
      rating_avg: (userObj.rating_avg as number) ?? null,
      response_time: (userObj.response_time || userObj.response_time_avg) as number ?? null,
      completed_transactions: (userObj.completed_transactions as number) ?? null,
    } : undefined,
    image_url: ensureAbs(String(dbAd.image_url || '')),
    images_count: imagesArr.length,
    images: extractImages(imagesArr),
    seller: String(dbAd.seller || dbAd.sellerName || ''),
    sellerName: String(dbAd.sellerName || dbAd.seller || ''),
    main_image: extractImageUrl(imagesArr[0]) || ensureAbs(String(dbAd.image_url || '')) || undefined,
  };
}

export { extractImages as extractAdImages, extractSpecifications as normalizeSpecifications };
