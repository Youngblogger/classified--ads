'use client';

import { supabase } from './supabase';
import type { Listing, ListingInsert, ListingUpdate } from '@/types/supabase';
import { cleanupListingStorage } from './supabase-storage';

const LISTING_SELECT = `
  *,
  category:categories(id, name, slug, icon),
  subcategory:subcategories(id, name, slug),
  images:listing_images(*),
  user:profiles(id, full_name, username, avatar_url, is_verified, verification_status)
`;

export async function getListings(params: {
  page?: number;
  perPage?: number;
  categoryId?: string;
  subcategoryId?: string;
  search?: string;
  state?: string;
  lga?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sortBy?: string;
  userId?: string;
  status?: string;
  includeBoosted?: boolean;
}) {
  const {
    page = 1,
    perPage = 12,
    categoryId,
    subcategoryId,
    search,
    state,
    lga,
    minPrice,
    maxPrice,
    condition,
    sortBy = 'created_at',
    userId,
    status = 'active',
    includeBoosted = true,
  } = params;

  let query = supabase
    .from('listings')
    .select(LISTING_SELECT, { count: 'exact' });

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.in('status', ['active', 'sold']);
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (subcategoryId) {
    query = query.eq('subcategory_id', subcategoryId);
  }

  if (search) {
    query = query.textSearch('title', search, { config: 'english' });
  }

  if (state) {
    query = query.eq('state', state);
  }

  if (lga) {
    query = query.eq('lga', lga);
  }

  if (minPrice !== undefined) {
    query = query.gte('price', minPrice);
  }

  if (maxPrice !== undefined) {
    query = query.lte('price', maxPrice);
  }

  if (condition) {
    query = query.eq('condition', condition);
  }

  const sortField = sortBy === 'price_asc' ? 'price' 
    : sortBy === 'price_desc' ? 'price' 
    : sortBy === 'oldest' ? 'created_at' 
    : 'created_at';
  
  const sortAsc = sortBy === 'price_asc' || sortBy === 'oldest';

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  query = query
    .order(sortField, { ascending: sortAsc })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (includeBoosted && !userId) {
    if (sortBy === 'created_at' || sortBy === 'newest') {
      query = query
        .order('boost_priority_score', { ascending: false });
    }
  }

  const { data, error, count } = await query;

  if (error) {
    return { listings: [], total: 0, error: { message: error.message } };
  }

  return {
    listings: (data as any[]) || [],
    total: count || 0,
    error: null,
  };
}

export async function getListingById(id: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    return { listing: null, error: { message: error.message } };
  }

  return { listing: data as any, error: null };
}

export async function getListingBySlug(slug: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('slug', slug)
    .single();

  if (error) {
    return { listing: null, error: { message: error.message } };
  }

  return { listing: data as any, error: null };
}

export async function createListing(listing: ListingInsert) {
  const { data, error } = await supabase
    .from('listings')
    .insert(listing)
    .select()
    .single();

  if (error) {
    return { listing: null, error: { message: error.message } };
  }

  return { listing: data as Listing, error: null };
}

export async function updateListing(id: string, updates: ListingUpdate) {
  const { data, error } = await supabase
    .from('listings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { listing: null, error: { message: error.message } };
  }

  return { listing: data as Listing, error: null };
}

export async function deleteListing(id: string) {
  await cleanupListingStorage(id);

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

export async function getUserListings(userId: string, params?: {
  page?: number;
  perPage?: number;
  status?: string;
}) {
  return getListings({ ...params, userId } as any);
}

export async function getFeaturedListings(limit = 8) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('is_featured', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { listings: [], error: { message: error.message } };
  }

  return { listings: (data as any[]) || [], error: null };
}

export async function getBoostedListings(limit = 50) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('is_boosted', true)
    .eq('boost_status', 'active')
    .eq('status', 'active')
    .order('boost_priority_score', { ascending: false })
    .limit(limit);

  if (error) {
    return { listings: [], error: { message: error.message } };
  }

  return { listings: (data as any[]) || [], error: null };
}

export async function incrementListingViews(listingId: string) {
  const { error } = await supabase.rpc('increment_listing_views', {
    listing_id: listingId,
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

export async function recordListingView(listingId: string, userId?: string, ipAddress?: string) {
  const { error } = await supabase
    .from('listing_views')
    .insert({
      listing_id: listingId,
      user_id: userId || null,
      ip_address: ipAddress || null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });

  if (error) {
    return { error: { message: error.message } };
  }

  await supabase.rpc('increment_listing_views', { listing_id: listingId });

  return { error: null };
}

export async function searchListings(
  searchTerm: string,
  params?: {
    page?: number;
    perPage?: number;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    state?: string;
  }
) {
  let query = supabase
    .from('listings')
    .select(LISTING_SELECT, { count: 'exact' })
    .eq('status', 'active');

  if (searchTerm) {
    query = query.textSearch('title', searchTerm, { config: 'english' });
  }

  if (params?.categoryId) {
    query = query.eq('category_id', params.categoryId);
  }

  if (params?.minPrice !== undefined) {
    query = query.gte('price', params.minPrice);
  }

  if (params?.maxPrice !== undefined) {
    query = query.lte('price', params.maxPrice);
  }

  if (params?.state) {
    query = query.eq('state', params.state);
  }

  const page = params?.page || 1;
  const perPage = params?.perPage || 12;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  query = query
    .order('is_boosted', { ascending: false })
    .order('boost_priority_score', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return { listings: [], total: 0, error: { message: error.message } };
  }

  return {
    listings: (data as any[]) || [],
    total: count || 0,
    error: null,
  };
}

export async function getSimilarListings(listingId: string, categoryId?: string, limit = 8) {
  let query = supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'active')
    .neq('id', listingId);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  query = query
    .order('created_at', { ascending: false })
    .limit(limit);

  const { data, error } = await query;

  if (error) {
    return { listings: [], error: { message: error.message } };
  }

  return { listings: (data as any[]) || [], error: null };
}

export async function getDashboardStats(userId: string) {
  const activeResult: any = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active');

  const totalResult: any = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  const viewsResult: any = await supabase
    .from('listing_views')
    .select('id', { count: 'exact', head: true })
    .in('listing_id', 
      supabase.from('listings').select('id').eq('user_id', userId) as any
    );

  const favResult: any = await supabase
    .from('listing_favorites')
    .select('id', { count: 'exact', head: true })
    .in('listing_id',
      supabase.from('listings').select('id').eq('user_id', userId) as any
    );

  const msgResult: any = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', userId);

  if (activeResult.error || totalResult.error) {
    return { stats: null, error: { message: 'Failed to load stats' } };
  }

  return {
    stats: {
      total_ads: totalResult.count || 0,
      active_ads: activeResult.count || 0,
      total_views: viewsResult.count || 0,
      total_favorites: favResult.count || 0,
      total_messages: msgResult.count || 0,
    },
    error: null,
  };
}
