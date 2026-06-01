import { QueryClient } from '@tanstack/react-query';
import { mutate as swrMutate } from 'swr';
import { adKeys } from './query-keys';

export function invalidateSwrCache(keyPattern: string | RegExp): void {
  if (typeof keyPattern === 'string') {
    swrMutate((key: string) => typeof key === 'string' && key.startsWith(keyPattern));
  } else {
    swrMutate((key: string) => typeof key === 'string' && keyPattern.test(key));
  }
}

export function invalidateSwrAdDetail(slug: string): void {
  swrMutate(`ads/${slug}`);
}

export function invalidateSwrExact(key: string): void {
  swrMutate(key);
}

export function syncAllCaches(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: adKeys.all });
  invalidateSwrCache(/^ads/);
  invalidateSwrCache('homepage_data');
  invalidateSwrCache('boosted_ads_listing');
  invalidateSwrCache('search');
  invalidateSwrCache(/^search/);
  invalidateSwrCache('categories');
}

export function syncAdListCaches(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: adKeys.lists() });
  queryClient.invalidateQueries({ queryKey: adKeys.infinite() });
  queryClient.invalidateQueries({ queryKey: adKeys.homepage() });
  queryClient.invalidateQueries({ queryKey: adKeys.trending() });
  queryClient.invalidateQueries({ queryKey: adKeys.boosted() });
  queryClient.invalidateQueries({ queryKey: adKeys.search() });
  queryClient.invalidateQueries({ queryKey: adKeys.similar(0) });
  invalidateSwrCache(/^ads\?/);
  invalidateSwrCache(/^ads\//);
  invalidateSwrCache(/^ads\/similar/);
  invalidateSwrCache('homepage_data');
  invalidateSwrCache('boosted_ads_listing');
  invalidateSwrCache(/^search\?/);
  invalidateSwrCache(/^search/);
}

export function syncAdDetailCache(queryClient: QueryClient, slug: string): void {
  queryClient.invalidateQueries({ queryKey: adKeys.detail(slug) });
  invalidateSwrAdDetail(slug);
  invalidateSwrCache(/^ads\//);
  invalidateSwrCache(/^ads\/similar/);
}

export function syncAdminCaches(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: adKeys.admin() });
  invalidateSwrCache(/^secure-control-9ja/);
}

export function updateAdInListCaches(queryClient: QueryClient, adId: number, updates: Partial<any>): void {
  if (isCosmeticOnly(updates)) return;

  for (const key of listMutationKeys) {
    const queries = queryClient.getQueriesData<any>({ queryKey: key });
    for (const [queryKey, data] of queries) {
      if (!data) continue;
      if (Array.isArray(data)) {
        queryClient.setQueryData(queryKey, (old: any[]) =>
          old?.map((item: any) =>
            (item.id === adId || item?.ad?.id === adId)
              ? (isStaleUpdate(item, updates) ? item : { ...item, ...updates, ad: item.ad ? { ...item.ad, ...updates } : undefined })
              : item
          )
        );
      } else if (data?.pages) {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data?.map((item: any) =>
                item.id === adId ? (isStaleUpdate(item, updates) ? item : { ...item, ...updates }) : item
              ),
            })),
          };
        });
      }
    }
  }
}

const listMutationKeys = [
  adKeys.lists(),
  adKeys.infinite(),
  adKeys.homepage(),
  adKeys.trending(),
  adKeys.boosted(),
  adKeys.user(0),
  adKeys.admin(),
];

export function removeAdFromListCaches(queryClient: QueryClient, adId: number): void {
  for (const key of listMutationKeys) {
    const queries = queryClient.getQueriesData<any>({ queryKey: key });
    for (const [queryKey, data] of queries) {
      if (!data) continue;
      if (Array.isArray(data)) {
        queryClient.setQueryData(queryKey, (old: any[]) =>
          old?.filter((item: any) => item.id !== adId && item?.ad?.id !== adId)
        );
      } else if (data?.pages) {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data?.filter((item: any) => item.id !== adId),
            })),
          };
        });
      }
    }
  }
}

// ── Event-driven cache (direct mutation, zero backend calls) ──

// Extracts only the scalar fields from a Supabase `listings` row that are safe
// to merge into a cached Ad without overwriting joined data (user, category, images).
export function extractAdUpdates(row: any): Record<string, any> {
  if (!row) return {};
  const m: Record<string, any> = {};
  const scalarFields = [
    'title', 'slug', 'description', 'short_description',
    'price', 'currency', 'condition', 'status',
    'negotiable', 'is_featured', 'is_boosted',
    'boost_type', 'boost_status', 'boost_expires_at',
    'views_count', 'favorites_count',
    'whatsapp_number', 'phone_number',
    'state', 'lga', 'city', 'location',
    'updated_at', 'expires_at', 'metadata',
  ];
  for (const f of scalarFields) {
    if (f in row) m[f] = row[f];
  }
  if ('whatsapp_number' in row) m.whatsapp = row.whatsapp_number;
  if ('phone_number' in row) {
    m.phone = row.phone_number;
    m.sellerPhone = row.phone_number;
    m.phone_number = row.phone_number;
  }
  if ('views_count' in row) m.views = row.views_count;
  return m;
}

// Transforms a Supabase `listings` row into the Ad-like shape expected by caches.
// Joined data (user, category, images) is unavailable from Realtime — the ad
// is marked `_fromRealtime: true` so UI can show a placeholder if needed.
export function fromSupabaseRow(row: any): any {
  if (!row) return row;
  return {
    id: row.id ? Number(row.id) : row.id,
    title: row.title || '',
    slug: row.slug || '',
    description: row.short_description || row.description || '',
    short_description: row.short_description || '',
    price: row.price || 0,
    currency: row.currency || 'NGN',
    condition: row.condition || '',
    status: row.status || 'active',
    negotiable: !!row.negotiable,
    views: row.views_count || 0,
    views_count: row.views_count || 0,
    favorites_count: row.favorites_count || 0,
    is_featured: !!row.is_featured,
    is_boosted: !!row.is_boosted,
    boost_type: row.boost_type || null,
    boost_status: row.boost_status || null,
    boost_expires_at: row.boost_expires_at || null,
    whatsapp: row.whatsapp_number || '',
    phone: row.phone_number || '',
    sellerPhone: row.phone_number || '',
    phone_number: row.phone_number || '',
    state: row.state || '',
    lga: row.lga || '',
    city: row.city || '',
    location: row.location || '',
    specifications: [],
    metadata: row.metadata || null,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
    expires_at: row.expires_at || null,
    category_id: row.category_id ? Number(row.category_id) : null,
    subcategory_id: row.subcategory_id ? Number(row.subcategory_id) : null,
    user_id: row.user_id,
    category: null,
    subcategory: null,
    user: undefined,
    image_url: null,
    images_count: 0,
    images: [],
    _fromRealtime: true,
  };
}

function swrAdMatcher(key: string): boolean {
  return (
    key.startsWith('ads?') ||
    key.startsWith('ads/') ||
    key === 'homepage_data' ||
    key === 'boosted_ads_listing' ||
    key.startsWith('search?') ||
    key === 'search/trending'
  );
}

function isStaleUpdate(cachedAd: any, updates: Record<string, any>): boolean {
  if (cachedAd?.updated_at && updates?.updated_at) {
    return new Date(updates.updated_at) <= new Date(cachedAd.updated_at);
  }
  return false;
}

const COSMETIC_FIELDS = new Set(['views_count', 'favorites_count', 'views', 'favorites_count']);

export function isCosmeticOnly(row: Record<string, any>): boolean {
  const relevantFields = ['title', 'slug', 'description', 'short_description',
    'price', 'currency', 'condition', 'status', 'negotiable',
    'is_featured', 'is_boosted', 'boost_type', 'boost_status', 'boost_expires_at',
    'whatsapp_number', 'phone_number', 'state', 'lga', 'city', 'location',
    'updated_at', 'expires_at', 'metadata'];

  for (const f of relevantFields) {
    if (f in row) return false;
  }
  return true;
}

// ── UPDATE (zero backend calls) ──
// Mutate SWR cache entries for an ad update by ID.
export function updateAdInSwrCaches(adId: number, updates: Record<string, any>): void {
  if (isCosmeticOnly(updates)) return;

  const id = Number(adId);
  swrMutate(
    swrAdMatcher,
    (currentData: any) => {
      if (!currentData) return currentData;

      // { data: Ad[] } — paginated list or detail wrapper
      if (currentData.data && Array.isArray(currentData.data)) {
        return {
          ...currentData,
          data: currentData.data.map((ad: any) =>
            Number(ad.id) === id ? (isStaleUpdate(ad, updates) ? ad : { ...ad, ...updates }) : ad
          ),
        };
      }

      // homepage_data: { featured, recent, boosted } sections
      if ('featured' in currentData || 'recent' in currentData || 'boosted' in currentData || 'trending' in currentData) {
        const next = { ...currentData };
        for (const section of ['featured', 'recent', 'boosted', 'trending'] as const) {
          if (Array.isArray(next[section])) {
            next[section] = next[section].map((ad: any) =>
              Number(ad.id) === id ? (isStaleUpdate(ad, updates) ? ad : { ...ad, ...updates }) : ad
            );
          }
        }
        return next;
      }

      // Flat Ad[]
      if (Array.isArray(currentData)) {
        return currentData.map((ad: any) =>
          Number(ad.id) === id ? (isStaleUpdate(ad, updates) ? ad : { ...ad, ...updates }) : ad
        );
      }

      return currentData;
    },
    false
  );
}

// ── DELETE (zero backend calls) ──
// Remove an ad from all SWR cache entries by ID.
export function removeAdFromSwrCaches(adId: number): void {
  const id = Number(adId);
  swrMutate(
    swrAdMatcher,
    (currentData: any) => {
      if (!currentData) return currentData;

      if (currentData.data && Array.isArray(currentData.data)) {
        return {
          ...currentData,
          data: currentData.data.filter((ad: any) => Number(ad.id) !== id),
        };
      }

      if ('featured' in currentData || 'recent' in currentData || 'boosted' in currentData || 'trending' in currentData) {
        const next = { ...currentData };
        for (const section of ['featured', 'recent', 'boosted', 'trending'] as const) {
          if (Array.isArray(next[section])) {
            next[section] = next[section].filter((ad: any) => Number(ad.id) !== id);
          }
        }
        return next;
      }

      if (Array.isArray(currentData)) {
        return currentData.filter((ad: any) => Number(ad.id) !== id);
      }

      return currentData;
    },
    false
  );
}

// ── INSERT (light invalidate — only list caches, never detail) ──
// New ads have no detail cache yet (no one has visited them), so we skip
// detail invalidation entirely.  This is much cheaper than syncAdListCaches
// which also invalidates every matching detail page.
export function invalidateListCachesOnly(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: adKeys.lists() });
  queryClient.invalidateQueries({ queryKey: adKeys.infinite() });
  queryClient.invalidateQueries({ queryKey: adKeys.homepage() });
  queryClient.invalidateQueries({ queryKey: adKeys.trending() });
  queryClient.invalidateQueries({ queryKey: adKeys.boosted() });
  queryClient.invalidateQueries({ queryKey: adKeys.search() });
  invalidateSwrCache(/^ads\?/);
  invalidateSwrCache('homepage_data');
  invalidateSwrCache('boosted_ads_listing');
  invalidateSwrCache(/^search\?/);
}

const BROADCAST_CHANNEL = 'ilist-cache-sync';

export function broadcastCacheInvalidation(eventType: string = 'cache-invalidate'): void {
  if (typeof window === 'undefined') return;
  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL);
    channel.postMessage({ type: eventType, timestamp: Date.now() });
    channel.close();
  } catch {
  }
}

export function listenForCrossTabSync(onInvalidate: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL);
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'cache-invalidate') {
        onInvalidate();
      }
    };
    channel.addEventListener('message', handler);
    return () => {
      channel.removeEventListener('message', handler);
      channel.close();
    };
  } catch {
    return () => {};
  }
}

export function syncAcrossTabs(queryClient: QueryClient): void {
  broadcastCacheInvalidation();
  syncAllCaches(queryClient);
}

export function notifyCacheInvalidation(): void {
  broadcastCacheInvalidation();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ilist:cache-invalidate'));
  }
}
