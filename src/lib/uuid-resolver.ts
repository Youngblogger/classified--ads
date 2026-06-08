import { supabase } from './supabase';

const ID_TO_SLUG: Record<number, string> = {
  1: 'vehicles', 101: 'cars', 102: 'motorcycles', 103: 'buses-vans', 104: 'trucks-trailers',
  2: 'property', 201: 'apartments-rent', 202: 'apartments-sale', 203: 'houses-rent', 204: 'houses-sale',
  3: 'mobile-phones', 301: 'smartphones', 302: 'tablets', 303: 'smartwatches', 304: 'phone-accessories',
  4: 'electronics', 401: 'laptops', 402: 'desktops', 403: 'tvs', 404: 'gaming',
  5: 'fashion', 501: 'men-clothing', 502: 'women-clothing', 503: 'shoes', 504: 'watches',
  6: 'home-furniture', 601: 'furniture', 602: 'home-decor', 603: 'kitchen-appliances', 604: 'bedding',
  7: 'jobs', 701: 'full-time-jobs', 702: 'part-time-jobs', 703: 'remote-jobs', 704: 'internship-jobs',
  8: 'services', 801: 'cleaning-services', 802: 'repair-services', 803: 'moving-services', 804: 'event-planning',
  9: 'pets', 901: 'dogs', 902: 'cats', 903: 'birds', 904: 'pet-food',
  10: 'health-beauty', 1001: 'skincare', 1002: 'haircare', 1003: 'makeup', 1004: 'fragrances',
};

const CHILD_TO_PARENT: Record<number, number> = {
  101: 1, 102: 1, 103: 1, 104: 1,
  201: 2, 202: 2, 203: 2, 204: 2,
  301: 3, 302: 3, 303: 3, 304: 3,
  401: 4, 402: 4, 403: 4, 404: 4,
  501: 5, 502: 5, 503: 5, 504: 5,
  601: 6, 602: 6, 603: 6, 604: 6,
  701: 7, 702: 7, 703: 7, 704: 7,
  801: 8, 802: 8, 803: 8, 804: 8,
  901: 9, 902: 9, 903: 9, 904: 9,
  1001: 10, 1002: 10, 1003: 10, 1004: 10,
};

const PARENT_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

let categoriesCache: Map<string, string> | null = null;
let subcategoriesCache: Map<string, string> | null = null;

async function getCategoriesMap(): Promise<Map<string, string>> {
  if (categoriesCache) return categoriesCache;
  const { data, error } = await supabase.from('categories').select('id, slug');
  if (error || !data || data.length === 0) {
    throw new Error(`Failed to fetch categories: ${error?.message || 'no data'}`);
  }
  categoriesCache = new Map(data.map(c => [c.slug, c.id]));
  return categoriesCache;
}

async function getSubcategoriesMap(): Promise<Map<string, string>> {
  if (subcategoriesCache) return subcategoriesCache;
  const { data, error } = await supabase.from('subcategories').select('id, slug');
  if (error || !data || data.length === 0) {
    throw new Error(`Failed to fetch subcategories: ${error?.message || 'no data'}`);
  }
  subcategoriesCache = new Map(data.map(s => [s.slug, s.id]));
  return subcategoriesCache;
}

export function invalidateUuidCache(): void {
  categoriesCache = null;
  subcategoriesCache = null;
}

export async function resolveCategoryUuid(intId: number | string, slugFallback?: string): Promise<string> {
  const id = typeof intId === 'string' ? parseInt(intId, 10) : intId;
  const slug = ID_TO_SLUG[id] || slugFallback;
  if (!slug) {
    throw new Error(`Unknown category ID: ${id}. No slug mapping found.`);
  }
  // Try categories table first
  const catMap = await getCategoriesMap();
  const catUuid = catMap.get(slug);
  if (catUuid) return catUuid;
  // Fallback: slug may live in subcategories
  const subMap = await getSubcategoriesMap();
  const subUuid = subMap.get(slug);
  if (subUuid) return subUuid;
  throw new Error(
    `Category slug "${slug}" (ID: ${id}) not found in Supabase categories or subcategories. ` +
    `Ensure the slug is seeded in the correct table.`
  );
}

export async function resolveSubcategoryUuid(intId: number | string, slugFallback?: string): Promise<string> {
  const id = typeof intId === 'string' ? parseInt(intId, 10) : intId;
  const slug = ID_TO_SLUG[id] || slugFallback;
  if (!slug) {
    throw new Error(`Unknown subcategory ID: ${id}. No slug mapping found.`);
  }
  // Try subcategories table first
  const subMap = await getSubcategoriesMap();
  const subUuid = subMap.get(slug);
  if (subUuid) return subUuid;
  // Fallback: API treats all categories as a single hierarchy, so the slug may
  // live in the categories table instead of subcategories.
  const catMap = await getCategoriesMap();
  const catUuid = catMap.get(slug);
  if (catUuid) return catUuid;
  throw new Error(
    `Subcategory slug "${slug}" (ID: ${id}) not found in Supabase subcategories or categories. ` +
    `Seed the subcategories table with this slug or add a mapping.`
  );
}

export function isChildId(id: number | string): boolean {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return !PARENT_IDS.has(numId) && !!CHILD_TO_PARENT[numId];
}

export function getParentId(childId: number | string): number | null {
  const numId = typeof childId === 'string' ? parseInt(childId, 10) : childId;
  return CHILD_TO_PARENT[numId] || null;
}
