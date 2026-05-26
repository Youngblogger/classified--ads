'use client';

import { supabase } from './supabase';

export async function addFavorite(userId: string, listingId: string) {
  const { error } = await supabase
    .from('listing_favorites')
    .insert({ user_id: userId, listing_id: listingId });

  if (error) {
    if (error.code === '23505') {
      return { error: null };
    }
    return { error: { message: error.message } };
  }

  await supabase.rpc('increment_favorites_count', { listing_id: listingId });

  return { error: null };
}

export async function removeFavorite(userId: string, listingId: string) {
  const { error } = await supabase
    .from('listing_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId);

  if (error) {
    return { error: { message: error.message } };
  }

  const countResult: any = await supabase
    .from('listing_favorites')
    .select('id', { count: 'exact', head: true })
    .eq('listing_id', listingId);

  await supabase
    .from('listings')
    .update({ favorites_count: countResult.count || 0 })
    .eq('id', listingId);

  return { error: null };
}

export async function isFavorited(userId: string, listingId: string) {
  const { data, error } = await supabase
    .from('listing_favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .maybeSingle();

  if (error) {
    return { isFavorited: false, error: { message: error.message } };
  }

  return { isFavorited: !!data, error: null };
}

export async function getUserFavorites(userId: string, page = 1, perPage = 12) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('listing_favorites')
    .select(`
      id,
      created_at,
      listing:listings!inner(
        *,
        category:categories(id, name, slug, icon),
        images:listing_images(*),
        user:profiles(id, full_name, username, avatar_url, is_verified)
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return { favorites: [], total: 0, error: { message: error.message } };
  }

  return {
    favorites: data?.map(f => ({
      id: f.id,
      ad: f.listing,
      created_at: f.created_at,
    })) || [],
    total: count || 0,
    error: null,
  };
}

export async function getFavoritesCount(listingId: string) {
  const { count, error } = await supabase
    .from('listing_favorites')
    .select('id', { count: 'exact', head: true })
    .eq('listing_id', listingId);

  if (error) {
    return { count: 0, error: { message: error.message } };
  }

  return { count: count || 0, error: null };
}
