'use client';

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { searchApi, categoriesApi as catsApi, adsApi, analyticsApi } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useDebounce } from './useDebounce';

async function fetchFromSupabase(endpoint: string): Promise<any> {
  if (endpoint === 'categories_data') {
    const { data } = await supabase.from('categories').select('*, subcategories(*)').is('parent_id', null).order('sort_order');
    const mapped = (data || []).map((cat: any) => ({
      ...cat,
      ad_count: 0,
      children: (cat.subcategories || []).map((s: any) => ({ ...s, parent_id: cat.id, ad_count: 0 })),
    }));
    return { data: mapped, meta: null };
  }

  if (endpoint === 'locations_data') {
    return { data: [] };
  }

  if (endpoint.startsWith('ads/featured')) {
    const { data: ads, error } = await supabase.from('listings').select('*, profiles(*)')
      .eq('is_featured', true).eq('status', 'active').order('created_at', { ascending: false }).limit(10);
    if (error) throw error;
    return { data: (ads || []).map(transformAd), meta: null };
  }

  if (endpoint.startsWith('search/trending')) {
    const { data: ads, error } = await supabase.from('listings').select('*, profiles(*)')
      .eq('status', 'active').order('views_count', { ascending: false }).limit(10);
    if (error) throw error;
    return { data: (ads || []).map(transformAd), meta: null };
  }

  if (endpoint === 'homepage_data') {
    const { data: featured } = await supabase.from('listings').select('*, profiles(*)').eq('is_featured', true).eq('status', 'active').limit(8);
    const { data: recent } = await supabase.from('listings').select('*, profiles(*)').eq('status', 'active').order('created_at', { ascending: false }).limit(20);
    const { data: boosted } = await supabase.from('listings').select('*, profiles(*)').eq('is_boosted', true).eq('status', 'active').limit(8);
    return {
      data: {
        featured: (featured || []).map(transformAd),
        recent: (recent || []).map(transformAd),
        latest: (recent || []).map(transformAd),
        boosted: (boosted || []).map(transformAd),
        categories: [],
        banners: [],
      }
    };
  }

  if (endpoint.startsWith('boosted_ads_listing')) {
    const { data: boosted } = await supabase.from('listings').select('*, profiles(*)').eq('is_boosted', true).eq('status', 'active').limit(10);
    return (boosted || []).map(transformAd);
  }

  if (endpoint.startsWith('ads?')) {
    const params = Object.fromEntries(new URLSearchParams(endpoint.replace('ads?', '')));
    return adsApi.getAll(params).then(r => r.data);
  }

  if (endpoint.startsWith('ads/')) {
    const slug = endpoint.replace('ads/', '');
    if (slug && slug.length > 0 && !slug.includes('?')) {
      const { data, error } = await supabase.from('listings').select('*, profiles(*), categories(*), subcategories(*)').eq('slug', slug).single();
      if (error) throw error;
      return { data: transformDetailAd(data) };
    }
    const params = Object.fromEntries(new URLSearchParams(slug));
    return adsApi.getAll(params).then(r => r.data);
  }

  if (endpoint.startsWith('search?')) {
    const params = Object.fromEntries(new URLSearchParams(endpoint.replace('search?', '')));
    return searchApi.search(params).then(r => r.data);
  }

  if (endpoint.startsWith('search/suggestions?')) {
    const q = new URLSearchParams(endpoint.replace('search/suggestions?', '')).get('q') || '';
    return searchApi.suggestions(q).then(r => r.data);
  }

  if (endpoint.startsWith('ads/similar?')) {
    const params = Object.fromEntries(new URLSearchParams(endpoint.replace('ads/similar?', '')));
    const { data } = await supabase.from('listings').select('*, profiles(*)')
      .eq('category_id', params.ad_id ? String(params.ad_id) : '').neq('id', String(params.ad_id || ''))
      .eq('status', 'active').limit(Number(params.limit) || 8);
    return { data: (data || []).map(transformAd) };
  }

  return { data: [], meta: null };
}

function transformAd(item: any): any {
  if (!item) return item;
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    price: item.price,
    currency: item.currency || 'NGN',
    condition: item.condition,
    status: item.status,
    negotiable: item.negotiable,
    views: item.views_count || 0,
    views_count: item.views_count || 0,
    favorites_count: item.favorites_count || 0,
    is_featured: item.is_featured,
    is_boosted: item.is_boosted,
    whatsapp: item.whatsapp_number,
    phone: item.phone_number,
    sellerPhone: item.phone_number,
    phone_number: item.phone_number,
    state: item.state,
    lga: item.lga,
    city: item.city,
    location: item.location,
    specifications: item.specifications,
    attributes: item.specifications,
    created_at: item.created_at,
    updated_at: item.updated_at,
    category_id: item.category_id,
    subcategory_id: item.subcategory_id,
    user_id: item.user_id,
    category: item.categories || item.category || null,
    subcategory: item.subcategories || item.subcategory || null,
    user: item.profiles || item.user ? {
      id: (item.profiles || item.user)?.id,
      name: (item.profiles || item.user)?.full_name || (item.profiles || item.user)?.username || '',
      full_name: (item.profiles || item.user)?.full_name,
      username: (item.profiles || item.user)?.username,
      email: (item.profiles || item.user)?.email,
      phone: (item.profiles || item.user)?.phone,
      avatar: (item.profiles || item.user)?.avatar_url,
      avatar_url: (item.profiles || item.user)?.avatar_url,
      location: (item.profiles || item.user)?.location,
      created_at: (item.profiles || item.user)?.created_at,
      verified: (item.profiles || item.user)?.is_verified || false,
      is_verified_seller: (item.profiles || item.user)?.is_verified || false,
      rating_avg: (item.profiles || item.user)?.rating_avg,
      response_time: (item.profiles || item.user)?.response_time_avg,
      completed_transactions: (item.profiles || item.user)?.completed_transactions,
    } : undefined,
  };
}

function transformDetailAd(item: any): any {
  const ad = transformAd(item);
  if (item.profiles) {
    ad.user = {
      id: item.profiles.id,
      name: item.profiles.full_name || item.profiles.username || '',
      full_name: item.profiles.full_name,
      username: item.profiles.username,
      phone: item.profiles.phone,
      avatar: item.profiles.avatar_url,
      avatar_url: item.profiles.avatar_url,
      full_avatar_url: item.profiles.avatar_url,
      location: item.profiles.location,
      created_at: item.profiles.created_at,
      verified: item.profiles.is_verified || false,
      is_verified_seller: item.profiles.is_verified || false,
      is_verified_business: (item.profiles as any)?.is_verified_business || false,
      rating_avg: item.profiles.rating_avg,
      response_time: item.profiles.response_time_avg,
      completed_transactions: item.profiles.completed_transactions,
    };
  }
  return ad;
}

export function useAdsList(params: Record<string, any> = {}) {
  const queryString = new URLSearchParams(params).toString();
  const cacheKey = `ads?${queryString}`;

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    cacheKey,
    fetchFromSupabase,
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
    fetchFromSupabase,
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
    fetchFromSupabase,
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
    fetchFromSupabase,
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
  const { data, error, isLoading } = useSWR(
    'categories_data',
    fetchFromSupabase,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
      refreshInterval: 300000,
      errorRetryCount: 2,
    }
  );

  return { categories: data?.data || [], isLoading, isError: !!error };
}

export function useLocations() {
  const { data, error, isLoading } = useSWR(
    'locations_data',
    fetchFromSupabase,
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
    fetchFromSupabase,
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
    fetchFromSupabase,
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
    fetchFromSupabase,
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
    fetchFromSupabase,
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
    fetchFromSupabase,
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

  return {
    ads, total, hasMore, isLoading, isLoadingMore, isValidating,
    isError: !!error, error,
    loadMore: () => setSize(size + 1), mutate,
  };
}

export function useSimilarAds(adId: number | null, limit: number = 8) {
  const { data, error, isLoading } = useSWR(
    adId ? `ads/similar?ad_id=${adId}&limit=${limit}` : null,
    fetchFromSupabase,
    { revalidateOnFocus: false, dedupingInterval: 120000, errorRetryCount: 2 }
  );

  return { similarAds: data?.data || [], isLoading, isError: !!error };
}
