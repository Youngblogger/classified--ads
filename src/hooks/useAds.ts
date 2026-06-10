'use client';

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { useEffect } from 'react';
import { http } from '@/lib/http-client';
import { useGlobalStore } from '@/lib/store';
import { useDebounce } from './useDebounce';
import { normalizeAd, normalizeAds } from '@/lib/normalize-ad';

// Mapping from integer category_id to slug (for Supabase fallback queries)
const CATEGORY_ID_TO_SLUG: Record<string, string> = {
  '1': 'vehicles', '101': 'cars', '102': 'motorcycles', '103': 'buses-vans', '104': 'trucks-trailers',
  '2': 'property', '201': 'apartments-rent', '202': 'apartments-sale', '203': 'houses-rent', '204': 'houses-sale',
  '3': 'mobile-phones', '301': 'smartphones', '302': 'tablets', '303': 'smartwatches', '304': 'phone-accessories',
  '4': 'electronics', '401': 'laptops', '402': 'desktops', '403': 'tvs', '404': 'gaming',
  '5': 'fashion', '501': 'men-clothing', '502': 'women-clothing', '503': 'shoes', '504': 'watches',
  '6': 'home-furniture', '601': 'furniture', '602': 'home-decor', '603': 'kitchen-appliances', '604': 'bedding',
  '7': 'jobs', '701': 'full-time-jobs', '702': 'part-time-jobs', '703': 'remote-jobs', '704': 'internship-jobs',
  '8': 'services', '801': 'cleaning-services', '802': 'repair-services', '803': 'moving-services', '804': 'event-planning',
  '9': 'pets', '901': 'dogs', '902': 'cats', '903': 'birds', '904': 'pet-food',
  '10': 'health-beauty', '1001': 'skincare', '1002': 'haircare', '1003': 'makeup', '1004': 'fragrances',
};

async function fetchSupabaseListings(params: Record<string, string>, page: number = 1, perPage: number = 20, forUser?: string): Promise<{ data: any[], meta: any }> {
  try {
    const sp = new URLSearchParams();
    sp.set('page', String(page));
    sp.set('limit', String(perPage));

    // Determine category slug for Supabase query
    let categorySlug = '';
    if (params.category) {
      categorySlug = params.category;
    } else if (params.category_id && CATEGORY_ID_TO_SLUG[params.category_id]) {
      categorySlug = CATEGORY_ID_TO_SLUG[params.category_id];
    }
    // If we have a subcategory_id, use its slug as the category param for Supabase
    if (params.subcategory_id && CATEGORY_ID_TO_SLUG[params.subcategory_id]) {
      categorySlug = CATEGORY_ID_TO_SLUG[params.subcategory_id];
    }

    for (const [key, value] of Object.entries(params)) {
      if (value && key !== 'category' && key !== 'category_id' && key !== 'subcategory_id') {
        sp.set(key, value);
      }
    }
    if (categorySlug) sp.set('category', categorySlug);
    if (forUser) sp.set('user_id', forUser);

    const res = await fetch(`/api/listings?${sp.toString()}`, { cache: 'no-store' });
    if (!res.ok) {
      console.warn('[SupabaseFallback] API route returned', res.status);
      return { data: [], meta: { total: 0, current_page: page, per_page: perPage, last_page: 1 } };
    }
    const json = await res.json();
    const raw = json?.data || [];

    if (raw.length === 0) {
      return { data: [], meta: json?.meta || { total: 0, current_page: page, per_page: perPage, last_page: 1 } };
    }

    const mapped = raw.map((listing: any) => {
      const images = listing.listing_images || [];
      return normalizeAd({ ...listing, images, listing_images: images });
    });

    return {
      data: mapped,
      meta: json?.meta || {
        total: mapped.length,
        current_page: page,
        per_page: perPage,
        last_page: Math.ceil(mapped.length / perPage),
      },
    };
  } catch (e) {
    console.warn('[SupabaseFallback] Query failed:', e);
    return { data: [], meta: { total: 0, current_page: page, per_page: perPage, last_page: 1 } };
  }
}

async function fetchSupabaseAdDetail(slug: string): Promise<any> {
  try {
    const res = await fetch(`/api/listings?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data || null;
    if (!data) return null;
    return normalizeAd({
      ...data,
      images: data.listing_images || [],
      listing_images: data.listing_images || [],
    }, true);
  } catch {
    return null;
  }
}

async function fetchFromLaravel(endpoint: string): Promise<any> {
  if (endpoint === 'categories_data') {
    const [catsRes] = await Promise.all([
      http.get('/categories'),
    ]);
    const cats = (catsRes?.data?.data || []);
    return { data: cats, meta: null };
  }

  if (endpoint === 'locations_data') {
    const [locRes] = await Promise.all([
      http.get('/locations'),
    ]);
    return { data: (locRes?.data?.data || []) };
  }

  if (endpoint.startsWith('ads/featured')) {
    const res = await http.get('/ads/featured');
    return { data: normalizeAds(res?.data?.data || []), meta: null };
  }

  if (endpoint.startsWith('search/trending')) {
    const res = await http.get('/ads', { params: { limit: 20, order_by: 'views' } });
    return { data: normalizeAds(res?.data?.data || []), meta: null };
  }

  if (endpoint === 'homepage_data') {
    const [featuredRes, recentRes, boostedRes, catsRes] = await Promise.all([
      http.get('/ads/featured'),
      http.get('/ads/recent'),
      http.get('/ads', { params: { limit: 20, is_boosted: 1 } }),
      http.get('/categories'),
    ]);
    let featured = normalizeAds(featuredRes?.data?.data || []);
    let recent = normalizeAds(recentRes?.data?.data || []);
    let boosted = normalizeAds((boostedRes?.data?.data || []).filter((a: any) => a.is_boosted));
    const categories = (catsRes?.data?.data || []);

    const supabaseRecent = await fetchSupabaseListings({ status: 'active' }, 1, 20);
    if (supabaseRecent.data.length > 0) {
      const recentIds = new Set(recent.map((a: any) => a.id));
      const mergedRecent = supabaseRecent.data.filter((a: any) => !recentIds.has(a.id));
      if (mergedRecent.length > 0) {
        recent = [...mergedRecent, ...recent].sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      if (featured.length === 0) {
        featured = supabaseRecent.data.slice(0, 10);
      }
    }

    return {
      data: {
        featured,
        recent,
        latest: recent,
        boosted: boosted.length > 0 ? boosted : featured.slice(0, 10),
        categories,
        banners: [],
      }
    };
  }

  if (endpoint.startsWith('boosted_ads_listing')) {
    const res = await http.get('/ads', { params: { limit: 50 } });
    return normalizeAds((res?.data?.data || []).filter((a: any) => a.is_boosted));
  }

  if (endpoint.startsWith('ads?')) {
    const params = Object.fromEntries(new URLSearchParams(endpoint.replace('ads?', '')));
    const page = parseInt(params.page || '1', 10);
    const perPage = parseInt(params.limit || params.per_page || '20', 10);

    // Convert category slug to integer category_id for Laravel API
    if (params.category && !params.category_id) {
      const slugToId: Record<string, number> = {
        'vehicles': 1, 'cars': 101, 'motorcycles': 102, 'buses-vans': 103, 'trucks-trailers': 104,
        'property': 2, 'apartments-rent': 201, 'apartments-sale': 202, 'houses-rent': 203, 'houses-sale': 204,
        'mobile-phones': 3, 'smartphones': 301, 'tablets': 302, 'smartwatches': 303, 'phone-accessories': 304,
        'electronics': 4, 'laptops': 401, 'desktops': 402, 'tvs': 403, 'gaming': 404,
        'fashion': 5, 'men-clothing': 501, 'women-clothing': 502, 'shoes': 503, 'watches': 504,
        'home-furniture': 6, 'furniture': 601, 'home-decor': 602, 'kitchen-appliances': 603, 'bedding': 604,
        'jobs': 7, 'full-time-jobs': 701, 'part-time-jobs': 702, 'remote-jobs': 703, 'internship-jobs': 704,
        'services': 8, 'cleaning-services': 801, 'repair-services': 802, 'moving-services': 803, 'event-planning': 804,
        'pets': 9, 'dogs': 901, 'cats': 902, 'birds': 903, 'pet-food': 904,
        'health-beauty': 10, 'skincare': 1001, 'haircare': 1002, 'makeup': 1003, 'fragrances': 1004,
        'baby-kids': 11, 'sports': 12, 'books-music-movies': 13, 'food-drinks': 14, 'agriculture': 15,
      };
      const id = slugToId[params.category];
      if (id) {
        // If it's a subcategory ID (>= 100), resolve parent
        if (id >= 100) {
          const parentMap: Record<number, number> = {
            101:1,102:1,103:1,104:1, 201:2,202:2,203:2,204:2,
            301:3,302:3,303:3,304:3, 401:4,402:4,403:4,404:4,
            501:5,502:5,503:5,504:5, 601:6,602:6,603:6,604:6,
            701:7,702:7,703:7,704:7, 801:8,802:8,803:8,804:8,
            901:9,902:9,903:9,904:9, 1001:10,1002:10,1003:10,1004:10,
          };
          params.category_id = String(parentMap[id] || id);
          params.subcategory_id = String(id);
        } else {
          params.category_id = String(id);
        }
      }
      delete params.category;
    }

    const res = await http.get('/ads', { params: params as any });
    let responseData = res?.data || { data: [], meta: null };
    let mapped = normalizeAds(responseData.data || []);

    const supabaseResult = await fetchSupabaseListings(params, page, perPage);

    if (mapped.length === 0 && supabaseResult.data.length > 0) {
      return { data: supabaseResult.data, meta: supabaseResult.meta };
    }

    if (supabaseResult.data.length > 0) {
      const existingIds = new Set(mapped.map((a: any) => a.id));
      const newAds = supabaseResult.data.filter((a: any) => !existingIds.has(a.id));
      if (newAds.length > 0) {
        mapped = [...mapped, ...newAds].sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    }

    return {
      data: mapped,
      meta: responseData.meta || { total: 0, current_page: 1, per_page: 20, last_page: 1 },
    };
  }

  if (endpoint.startsWith('ads/similar?')) {
    const params = Object.fromEntries(new URLSearchParams(endpoint.replace('ads/similar?', '')));
    const adId = params.ad_id;
    const limit = parseInt(params.limit || '8', 10);
    if (adId) {
      try {
        const res = await http.get('/ads/similar', { params: { ad_id: adId, limit } as any });
        const ads = res?.data?.data || [];
        if (Array.isArray(ads) && ads.length > 0) {
          return { data: normalizeAds(ads), meta: null };
        }
      } catch {}
      try {
        const fbRes = await fetch(`/api/listings?limit=${limit}&status=active`, { cache: 'no-store' });
        const fbJson = await fbRes.json();
        const fbAds = (fbJson?.data || []).map((item: any) => normalizeAd({ ...item, images: item.listing_images || [], listing_images: item.listing_images || [] }));
        if (fbAds.length > 0) return { data: fbAds.filter(Boolean), meta: null };
      } catch {}
    }
    return { data: [], meta: null };
  }

  if (endpoint.startsWith('ads/')) {
    const slug = endpoint.replace('ads/', '');
    if (slug && slug.length > 0 && !slug.includes('?')) {
      const res = await http.get(`/ads/${slug}`);
      const raw = res?.data?.data || res?.data || null;
      const ad = raw?.id ? raw : null;
      if (ad) return { data: normalizeAd(ad, true) };
      console.debug('[AdsFetch] Laravel ad detail returned null — falling back to Supabase', slug);
      const supabaseAd = await fetchSupabaseAdDetail(slug);
      if (supabaseAd) return { data: supabaseAd };
      return { data: null };
    }
    const params = Object.fromEntries(new URLSearchParams(slug));
    const res = await http.get('/ads', { params: params as any });
    const responseData = res?.data || { data: [], meta: null };
    return {
      data: normalizeAds(responseData.data || []),
      meta: responseData.meta || { total: 0, current_page: 1, per_page: 20, last_page: 1 },
    };
  }

  if (endpoint.startsWith('search?')) {
    const params = Object.fromEntries(new URLSearchParams(endpoint.replace('search?', '')));
    const hasQuery = !!params.q;
    if (hasQuery) {
      let responseData: any = { data: [], meta: null };
      try {
        const res = await http.get('/search', { params: params as any });
        responseData = res?.data || { data: [], meta: null };
      } catch (e) {
        console.warn('[AdsFetch] Laravel search failed, trying Supabase fallback', e);
      }
      const mapped = normalizeAds(responseData.data || []);
      if (mapped.length === 0 && params.q) {
        console.debug('[AdsFetch] Laravel search returned 0 results — falling back to Supabase ILIKE', { q: params.q });
        try {
          const origin = window.location.origin;
          const fallbackParams = new URLSearchParams({ q: params.q, page: params.page || '1', per_page: params.per_page || '20' });
          const fbRes = await fetch(`${origin}/api/ads/search?${fallbackParams}`);
          const fbData = await fbRes.json();
          if (fbData?.data?.length > 0) {
            console.debug('[AdsFetch] Supabase fallback returned', fbData.data.length, 'results');
            const fbMeta = fbData.meta || { total: fbData.data.length, current_page: 1, per_page: 20, last_page: 1 };
            fbMeta.engine = 'supabase-ilike';
            return {
              data: fbData.data,
              meta: fbMeta,
              related_ads: [],
              autocomplete_suggestions: [],
            };
          }
        } catch (fbErr) {
          console.warn('[AdsFetch] Supabase fallback also failed', fbErr);
        }
      }
      return {
        data: mapped,
        meta: responseData.meta || { total: 0, current_page: 1, per_page: 20, last_page: 1 },
        related_ads: normalizeAds(responseData.related_ads || []),
        autocomplete_suggestions: responseData.autocomplete_suggestions || [],
      };
    }
    /* [DEBUG] ads endpoint — /ads (AdListResource, full boost metadata) */
    console.debug('[AdsFetch] Using /ads endpoint (browsing)');
    const adParams: Record<string, string> = {};
    if (params.category_id) adParams.category_id = params.category_id;
    if (params.subcategory_id) adParams.subcategory_id = params.subcategory_id;
    if (params.location) adParams.location = params.location;
    if (params.lga) adParams.lga = params.lga;
    if (params.min_price) adParams.min_price = params.min_price;
    if (params.max_price) adParams.max_price = params.max_price;
    if (params.condition) adParams.condition = params.condition;
    if (params.sort_by) adParams.sort_by = params.sort_by;
    if (params.sort_order) adParams.sort_order = params.sort_order;
    adParams.page = params.page || '1';
    adParams.limit = params.per_page || '20';
    for (const [k, v] of Object.entries(params)) {
      if (k.startsWith('attr_')) adParams[k] = v as string;
    }
    const res = await http.get('/ads', { params: adParams as any });
    const responseData = res?.data || { data: [], meta: null };
    return {
      data: normalizeAds(responseData.data || []),
      meta: responseData.meta || { total: 0, current_page: 1, per_page: 20, last_page: 1 },
      related_ads: [],
      autocomplete_suggestions: [],
    };
  }

  if (endpoint.startsWith('search/suggestions?')) {
    const q = new URLSearchParams(endpoint.replace('search/suggestions?', '')).get('q') || '';
    const res = await http.get('/search/suggestions', { params: { q } as any });
    return res?.data || { categories: [], ads: [] };
  }

  if (endpoint.startsWith('ads/similar?')) {
    const params = Object.fromEntries(new URLSearchParams(endpoint.replace('ads/similar?', '')));
    const res = await http.get('/ads/similar', { params: params as any });
    const laravelData = normalizeAds(res?.data?.data || []);
    if (laravelData.length > 0) return { data: laravelData };
    // Fallback to Supabase
    try {
      const { data: supabaseData } = await fetchSupabaseListings({ status: 'active' }, 1, 8);
      if (supabaseData.length > 0) return { data: supabaseData };
    } catch {}
    return { data: [] };
  }

  return { data: [], meta: null };
}

export function useAdsList(params: Record<string, any> = {}) {
  const queryString = new URLSearchParams(params).toString();
  const cacheKey = `ads?${queryString}`;

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    cacheKey,
    fetchFromLaravel,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      refreshInterval: 60000,
      errorRetryCount: 2,
    }
  );

  return {
    ads: data?.data || [],
    meta: data?.meta || null,
    isLoading,
    isValidating,
    isError: !!error,
    error,
    mutate,
  };
}

export function useInfiniteAds(params: Record<string, any> = {}, pageSize: number = 20) {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.data?.length) return null;
    return `ads?limit=${pageSize}&page=${pageIndex + 1}&${new URLSearchParams(params).toString()}`;
  };

  const { data, error, isLoading, isValidating, setSize, size, mutate } = useSWRInfinite(
    getKey,
    fetchFromLaravel,
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000,
      revalidateFirstPage: false,
      errorRetryCount: 2,
    }
  );

  const ads = data?.flatMap(page => page.data || []) || [];
  const total = data?.[0]?.meta?.total || 0;
  const hasMore = ads.length < total;
  const isLoadingMore: boolean = !!(isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined'));

  return {
    ads,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    isValidating,
    isError: !!error,
    error,
    loadMore: () => setSize(size + 1),
    mutate,
  };
}

export function useAdDetail(slug: string) {
  const { data, error, isLoading } = useSWR(
    slug ? `ads/${slug}` : null,
    fetchFromLaravel,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      refreshInterval: 120000,
      errorRetryCount: 2,
    }
  );

  return {
    ad: data?.data || null,
    isLoading,
    isError: !!error,
    error,
  };
}

export function useHomepage() {
  const { data, error, isLoading } = useSWR(
    'homepage_data',
    fetchFromLaravel,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      refreshInterval: 120000,
      errorRetryCount: 2,
    }
  );

  return { data: data || {}, isLoading, isError: !!error, error };
}

export function useCategories() {
  const globalCategories = useGlobalStore((s) => s.categories);
  const setGlobalCategories = useGlobalStore((s) => s.setCategories);

  const { data, error, isLoading } = useSWR(
    'categories_data',
    fetchFromLaravel,
    {
      revalidateOnFocus: false,
      dedupingInterval: 86400000,
      revalidateIfStale: false,
      errorRetryCount: 2,
    }
  );

  const live = data?.data || [];

  useEffect(() => {
    if (live.length > 0) {
      setGlobalCategories(live);
    }
  }, [live, setGlobalCategories]);

  const categories = live.length > 0 ? live : globalCategories;

  return { categories, isLoading: isLoading && categories.length === 0, isError: !!error };
}

export function useLocations() {
  const { data, error, isLoading } = useSWR(
    'locations_data',
    fetchFromLaravel,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
      errorRetryCount: 2,
    }
  );

  return { locations: data || [], isLoading, isError: !!error };
}

export function useTrendingAds() {
  const { data, error, isLoading } = useSWR(
    'search/trending',
    fetchFromLaravel,
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000,
      refreshInterval: 300000,
      errorRetryCount: 2,
    }
  );

  return { trending: data?.data || [], isLoading, isError: !!error };
}

export function useBoostedAds() {
  const { data, error, isLoading } = useSWR(
    'boosted_ads_listing',
    fetchFromLaravel,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      refreshInterval: 60000,
      errorRetryCount: 2,
    }
  );

  return { boostedAds: data || [], isLoading, isError: !!error };
}

export function useSearch(query: string, params: Record<string, any> = {}) {
  const debouncedQuery = useDebounce(query, 400);

  const { data, error, isLoading } = useSWR(
    debouncedQuery ? `search?q=${encodeURIComponent(debouncedQuery)}&${new URLSearchParams(params).toString()}` : null,
    fetchFromLaravel,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      errorRetryCount: 1,
    }
  );

  return {
    results: data?.data || [],
    meta: data?.meta || null,
    relatedAds: (data as any)?.related_ads || [],
    suggestions: (data as any)?.autocomplete_suggestions || [],
    isLoading,
    isError: !!error,
    query: debouncedQuery,
  };
}

export function useSearchSuggestions(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  const { data, error, isLoading } = useSWR(
    debouncedQuery ? `search/suggestions?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetchFromLaravel,
    {
      revalidateOnFocus: false,
      dedupingInterval: 15000,
      errorRetryCount: 1,
    }
  );

  return { suggestions: data || { categories: [], ads: [] }, isLoading, isError: !!error };
}

export function useSearchInfinite(params: Record<string, any> = {}, pageSize: number = 20) {
  const buildParams = (pageNum: number) => {
    const p: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) p[k] = String(v);
    p.page = String(pageNum);
    p.per_page = String(pageSize);
    return new URLSearchParams(p).toString();
  };

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.data?.length) return null;
    return `search?${buildParams(pageIndex + 1)}`;
  };

  const { data, error, isLoading, isValidating, setSize, size, mutate } = useSWRInfinite(
    getKey,
    fetchFromLaravel,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      revalidateFirstPage: false,
      errorRetryCount: 2,
    }
  );

  const ads = data?.flatMap(page => page.data || []) || [];
  const total = data?.[0]?.meta?.total || 0;
  const hasMore = ads.length < total;
  const isLoadingMore: boolean = !!(isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined'));
  const fallbackLevel: number = data?.[0]?.meta?.fallback_level ?? 0;
  const searchQuery: string = data?.[0]?.meta?.query || '';
  const searchEngine: string = data?.[0]?.meta?.engine || '';

  return {
    ads, total, hasMore, isLoading, isLoadingMore, isValidating,
    isError: !!error, error, fallbackLevel, searchQuery, searchEngine,
    loadMore: () => setSize(size + 1), mutate,
  };
}

export function useSimilarAds(adId: string | number | null, limit: number = 8) {
  const { data, error, isLoading } = useSWR(
    adId ? `ads/similar?ad_id=${adId}&limit=${limit}` : null,
    fetchFromLaravel,
    { revalidateOnFocus: false, dedupingInterval: 120000, errorRetryCount: 2 }
  );

  return { similarAds: data?.data || [], isLoading, isError: !!error };
}
