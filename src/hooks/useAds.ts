'use client';

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { useEffect } from 'react';
import { http } from '@/lib/http-client';
import { supabase } from '@/lib/supabase';
import { useGlobalStore } from '@/lib/store';
import { useDebounce } from './useDebounce';
import { normalizeAd, normalizeAds } from '@/lib/normalize-ad';

async function fetchSupabaseListings(params: Record<string, string>, page: number = 1, perPage: number = 20, forUser?: string): Promise<{ data: any[], meta: any }> {
  try {
    const sp = new URLSearchParams();
    sp.set('page', String(page));
    sp.set('limit', String(perPage));

    for (const [key, value] of Object.entries(params)) {
      if (value) sp.set(key, value);
    }
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
    const { data } = await supabase
      .from('listings')
      .select('*, listing_images(*)')
      .eq('slug', slug)
      .maybeSingle();
    if (!data) return null;
    return normalizeAd({ ...data, images: data.listing_images || [], listing_images: data.listing_images || [] }, true);
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

    if (recent.length === 0 && featured.length === 0) {
      console.debug('[AdsFetch] Homepage Laravel returned 0 results — falling back to Supabase');
      const supabaseRecent = await fetchSupabaseListings({ status: 'active' }, 1, 20);
      if (supabaseRecent.data.length > 0) {
        recent = supabaseRecent.data;
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

  if (endpoint.startsWith('ads/')) {
    const slug = endpoint.replace('ads/', '');
    if (slug && slug.length > 0 && !slug.includes('?')) {
      const res = await http.get(`/ads/${slug}`);
      const ad = res?.data?.data || res?.data || null;
      if (ad?.id) return { data: normalizeAd(ad, true) };
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
    return { data: normalizeAds(res?.data?.data || []) };
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

export function useSimilarAds(adId: number | null, limit: number = 8) {
  const { data, error, isLoading } = useSWR(
    adId ? `ads/similar?ad_id=${adId}&limit=${limit}` : null,
    fetchFromLaravel,
    { revalidateOnFocus: false, dedupingInterval: 120000, errorRetryCount: 2 }
  );

  return { similarAds: data?.data || [], isLoading, isError: !!error };
}
