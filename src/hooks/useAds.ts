'use client';

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { useEffect } from 'react';
import { http } from '@/lib/http-client';
import { supabase } from '@/lib/supabase';
import { useGlobalStore } from '@/lib/store';
import { useDebounce } from './useDebounce';

function imgAbs(url: string | undefined | null): string {
  if (!url || url.startsWith('http://') || url.startsWith('https://')) return url || '';
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
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
    boost_status: ad.boost_status || null,
    boost_expires_at: ad.boost_expires_at || null,
    boost_end_time: ad.boost_end_time || null,
    boost_plan: ad.boost_plan || null,
    badge_label: ad.badge_label || null,
    badge_icon: ad.badge_icon || null,
    boost_priority_score: ad.boost_priority_score || 0,
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

function fromSupabaseListing(listing: any, images: any[] = []): any {
  if (!listing) return listing;
  const sorted = [...images].sort((a, b) => (a.is_primary ? -1 : b.is_primary ? 1 : (a.sort_order || 0) - (b.sort_order || 0)));
  const firstImage = sorted[0];

  return {
    id: listing.id,
    title: listing.title,
    slug: listing.slug,
    description: listing.description || '',
    short_description: listing.short_description || (listing.description || '').slice(0, 200),
    price: listing.price,
    currency: listing.currency || 'NGN',
    condition: listing.condition,
    status: listing.status || 'active',
    negotiable: listing.negotiable,
    views: listing.views_count || 0,
    views_count: listing.views_count || 0,
    favorites_count: listing.favorites_count || 0,
    is_featured: listing.is_featured || false,
    is_boosted: listing.is_boosted || false,
    boost_type: listing.boost_type || null,
    boost_status: listing.boost_status || null,
    boost_expires_at: listing.boost_expires_at || null,
    boost_end_time: listing.boost_end_time || listing.boost_expires_at || null,
    boost_plan: listing.boost_plan || null,
    badge_label: listing.badge_label || null,
    badge_icon: listing.badge_icon || null,
    boost_priority_score: listing.boost_priority_score || 0,
    whatsapp: listing.whatsapp_number || listing.phone_number || '',
    phone: listing.phone_number || '',
    sellerPhone: listing.phone_number || '',
    phone_number: listing.phone_number || '',
    state: listing.state || '',
    lga: listing.lga || '',
    city: listing.city || '',
    location: listing.location || listing.state || '',
    specifications: [],
    attributes: [],
    metadata: listing.metadata || null,
    created_at: listing.created_at,
    updated_at: listing.updated_at || listing.created_at,
    expires_at: listing.expires_at || null,
    category_id: listing.category_id,
    subcategory_id: listing.subcategory_id,
    user_id: listing.user_id,
    category: null,
    subcategory: null,
    user: undefined,
    image_url: firstImage?.url || null,
    images_count: images.length,
    images: sorted.map((img: any) => ({
      id: img.id,
      url: img.url,
      thumbnail_url: img.thumbnail_url || img.url,
      medium_url: img.medium_url || img.url,
      is_primary: img.is_primary,
    })),
  };
}

async function fetchSupabaseListings(params: Record<string, string>, page: number = 1, perPage: number = 20, forUser?: string): Promise<{ data: any[], meta: any }> {
  try {
    let query = supabase
      .from('listings')
      .select('*, listing_images(*)', { count: 'estimated' });

    if (params.status) {
      query = query.eq('status', params.status);
    } else {
      query = query.eq('status', 'active');
    }

    if (params.category) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', params.category).maybeSingle();
      if (cat) query = query.eq('category_id', cat.id);
    }

    if (params.category_id) query = query.eq('category_id', params.category_id);
    if (params.subcategory_id) query = query.eq('subcategory_id', params.subcategory_id);
    if (params.state) query = query.eq('state', params.state);
    if (params.lga) query = query.eq('lga', params.lga);
    if (params.location) query = query.eq('location', params.location);
    if (params.condition) query = query.eq('condition', params.condition);
    if (params.min_price) query = query.gte('price', params.min_price);
    if (params.max_price) query = query.lte('price', params.max_price);
    if (forUser) query = query.eq('user_id', forUser);
    if (params.user_id) query = query.eq('user_id', params.user_id);

    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, count } = await query;

    if (!data || data.length === 0) {
      return { data: [], meta: { total: 0, current_page: page, per_page: perPage, last_page: 1 } };
    }

    const mapped = data.map((listing: any) => {
      const images = listing.listing_images || [];
      return fromSupabaseListing(listing, images);
    });

    return {
      data: mapped,
      meta: {
        total: count || mapped.length,
        current_page: page,
        per_page: perPage,
        last_page: Math.ceil((count || mapped.length) / perPage),
        engine: 'supabase-ilike',
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
    const images = data.listing_images || [];
    return fromSupabaseListing(data, images);
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
    let featured = (featuredRes?.data?.data || []).map(fromLaravelAd);
    let recent = (recentRes?.data?.data || []).map(fromLaravelAd);
    let boosted = (boostedRes?.data?.data || []).filter((a: any) => a.is_boosted).map(fromLaravelAd);
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
    return ((res?.data?.data || []).filter((a: any) => a.is_boosted).map(fromLaravelAd));
  }

  if (endpoint.startsWith('ads?')) {
    const params = Object.fromEntries(new URLSearchParams(endpoint.replace('ads?', '')));
    const res = await http.get('/ads', { params: params as any });
    let responseData = res?.data || { data: [], meta: null };
    let mapped = (responseData.data || []).map(fromLaravelAd);

    if (mapped.length === 0) {
      console.debug('[AdsFetch] Laravel returned 0 results — falling back to Supabase', params);
      const page = parseInt(params.page || '1', 10);
      const perPage = parseInt(params.limit || params.per_page || '20', 10);
      const supabaseResult = await fetchSupabaseListings(params, page, perPage);
      if (supabaseResult.data.length > 0) {
        return { data: supabaseResult.data, meta: supabaseResult.meta };
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
      if (ad) return { data: fromDetailLaravelAd(ad) };
      console.debug('[AdsFetch] Laravel ad detail returned null — falling back to Supabase', slug);
      const supabaseAd = await fetchSupabaseAdDetail(slug);
      if (supabaseAd) return { data: supabaseAd };
      return { data: null };
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
    const hasQuery = !!params.q;
    if (hasQuery) {
      let responseData: any = { data: [], meta: null };
      try {
        const res = await http.get('/search', { params: params as any });
        responseData = res?.data || { data: [], meta: null };
      } catch (e) {
        console.warn('[AdsFetch] Laravel search failed, trying Supabase fallback', e);
      }
      const mapped = (responseData.data || []).map(fromLaravelAd);
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
        related_ads: (responseData.related_ads || []).map(fromLaravelAd),
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
      data: (responseData.data || []).map(fromLaravelAd),
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
