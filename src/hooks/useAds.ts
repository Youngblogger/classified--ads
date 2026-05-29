'use client';

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { http } from '@/lib/http-client';
import { useDebounce } from './useDebounce';

function imgAbs(url: string | undefined | null): string {
  if (!url || url.startsWith('http://') || url.startsWith('https://')) return url || '';
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api$/, '');
  return url.startsWith('/') ? `${base}${url}` : url;
}

function fromLaravelAd(ad: any): any {
  if (!ad) return ad;
  const images = (ad.images || []).map((img: any) => ({
    id: img.id,
    url: imgAbs(img.url),
    thumbnail_url: imgAbs(img.thumbnail_url || img.thumbnail),
    medium_url: imgAbs(img.medium_url),
    is_primary: img.is_primary,
  }));
  const singleImage = images.length > 0 ? images[0] : (ad.image ? {
    id: ad.image.id,
    url: imgAbs(ad.image.url),
    thumbnail_url: imgAbs(ad.image.thumbnail_url || ad.image.thumbnail),
    medium_url: imgAbs(ad.image.medium_url),
    is_primary: true,
  } : null);

  return {
    id: ad.id,
    title: ad.title,
    slug: ad.slug,
    description: ad.short_description || '',
    short_description: ad.short_description || '',
    price: ad.price,
    currency: ad.currency || 'NGN',
    condition: ad.condition,
    status: ad.status || 'active',
    negotiable: ad.negotiable,
    views: ad.views || 0,
    views_count: ad.views || 0,
    favorites_count: 0,
    is_featured: false,
    is_boosted: ad.is_boosted || false,
    boost_type: ad.boost_type || null,
    whatsapp: ad.whatsapp || ad.phone || '',
    phone: ad.phone || '',
    sellerPhone: ad.phone || '',
    phone_number: ad.phone || '',
    state: ad.state || '',
    lga: ad.lga || '',
    city: '',
    location: ad.location?.name || ad.state || '',
    specifications: [],
    attributes: [],
    metadata: null,
    created_at: ad.created_at,
    updated_at: ad.updated_at || ad.created_at,
    expires_at: null,
    category_id: ad.category?.id,
    subcategory_id: ad.subcategory?.id,
    user_id: ad.user?.id,
    category: ad.category || null,
    subcategory: ad.subcategory || null,
    user: ad.user ? {
      id: ad.user.id,
      name: ad.user.name || '',
      full_name: ad.user.name || '',
      username: '',
      email: ad.user.email || '',
      phone: ad.user.phone || '',
      avatar: ad.user.avatar || ad.user.avatar_url || '',
      avatar_url: ad.user.avatar || ad.user.avatar_url || '',
      full_avatar_url: ad.user.avatar || ad.user.avatar_url || '',
      location: '',
      created_at: null,
      verified: ad.user.is_verified || false,
      is_verified_seller: ad.user.is_verified || false,
      is_verified_business: false,
      rating_avg: null,
      response_time: null,
      completed_transactions: null,
    } : undefined,
    image_url: singleImage?.url || imgAbs(ad.image_url) || null,
    images_count: images.length || (singleImage ? 1 : 0),
    images: images.length > 0 ? images : (singleImage ? [singleImage] : []),
  };
}

function fromDetailLaravelAd(ad: any): any {
  if (!ad) return ad;
  const base = fromLaravelAd(ad);
  base.description = ad.description || base.description;
  base.specifications = ad.specifications || ad.attributes || [];
  base.attributes = ad.attributes || [];
  if (ad.user) {
    base.user = {
      ...base.user,
      full_avatar_url: ad.user.full_avatar_url || ad.user.avatar || ad.user.avatar_url,
      google_avatar: ad.user.google_avatar,
      facebook_avatar: ad.user.facebook_avatar,
      location: ad.user.location || '',
      created_at: ad.user.created_at,
      is_verified_seller: ad.user.is_verified || false,
      is_verified_business: ad.user.is_verified_business || false,
    };
  }
  return base;
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
    return { data: ((res?.data?.data || []).map(fromLaravelAd)), meta: null };
  }

  if (endpoint.startsWith('search/trending')) {
    const res = await http.get('/ads', { params: { limit: 20, order_by: 'views' } });
    return { data: ((res?.data?.data || []).map(fromLaravelAd)), meta: null };
  }

  if (endpoint === 'homepage_data') {
    const [featuredRes, recentRes, boostedRes, catsRes] = await Promise.all([
      http.get('/ads/featured'),
      http.get('/ads/recent'),
      http.get('/ads', { params: { limit: 20, is_boosted: 1 } }),
      http.get('/categories'),
    ]);
    const featured = (featuredRes?.data?.data || []).map(fromLaravelAd);
    const recent = (recentRes?.data?.data || []).map(fromLaravelAd);
    const boosted = (boostedRes?.data?.data || []).filter((a: any) => a.is_boosted).map(fromLaravelAd);
    const categories = (catsRes?.data?.data || []);
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
    return ((res?.data?.data || []).filter((a: any) => a.is_boosted).map(fromLaravelAd));
  }

  if (endpoint.startsWith('ads?')) {
    const params = Object.fromEntries(new URLSearchParams(endpoint.replace('ads?', '')));
    const res = await http.get('/ads', { params: params as any });
    const responseData = res?.data || { data: [], meta: null };
    return {
      data: (responseData.data || []).map(fromLaravelAd),
      meta: responseData.meta || { total: 0, current_page: 1, per_page: 20, last_page: 1 },
    };
  }

  if (endpoint.startsWith('ads/')) {
    const slug = endpoint.replace('ads/', '');
    if (slug && slug.length > 0 && !slug.includes('?')) {
      const res = await http.get(`/ads/${slug}`);
      const ad = res?.data?.data || res?.data || null;
      if (!ad) return { data: null };
      return { data: fromDetailLaravelAd(ad) };
    }
    const params = Object.fromEntries(new URLSearchParams(slug));
    const res = await http.get('/ads', { params: params as any });
    const responseData = res?.data || { data: [], meta: null };
    return {
      data: (responseData.data || []).map(fromLaravelAd),
      meta: responseData.meta || { total: 0, current_page: 1, per_page: 20, last_page: 1 },
    };
  }

  if (endpoint.startsWith('search?')) {
    const params = Object.fromEntries(new URLSearchParams(endpoint.replace('search?', '')));
    const res = await http.get('/search', { params: params as any });
    const responseData = res?.data || { data: [], meta: null };
    return {
      data: (responseData.data || []).map(fromLaravelAd),
      meta: responseData.meta || { total: 0, current_page: 1, per_page: 20, last_page: 1 },
      related_ads: (responseData.related_ads || []).map(fromLaravelAd),
      autocomplete_suggestions: responseData.autocomplete_suggestions || [],
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
    return { data: ((res?.data?.data || []).map(fromLaravelAd)) };
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
  const { data, error, isLoading } = useSWR(
    'categories_data',
    fetchFromLaravel,
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

  return {
    ads, total, hasMore, isLoading, isLoadingMore, isValidating,
    isError: !!error, error,
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
