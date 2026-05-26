'use client';

import { supabase } from './supabase';

export async function createReview(data: {
  reviewer_id: string;
  listing_id?: string;
  target_user_id: string;
  rating: number;
  comment?: string;
}) {
  const { data: review, error } = await supabase
    .from('reviews')
    .insert(data)
    .select('*, reviewer:profiles(id, full_name, username, avatar_url)')
    .single();

  if (error) {
    return { review: null, error: { message: error.message } };
  }

  return { review, error: null };
}

export async function getUserReviews(userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles(id, full_name, username, avatar_url)')
    .eq('target_user_id', userId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    return { reviews: [], error: { message: error.message } };
  }

  return { reviews: data || [], error: null };
}

export async function getListingReviews(listingId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles(id, full_name, username, avatar_url)')
    .eq('listing_id', listingId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    return { reviews: [], error: { message: error.message } };
  }

  return { reviews: data || [], error: null };
}

export async function getReviewSummary(targetUserId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('target_user_id', targetUserId)
    .eq('is_approved', true);

  if (error) {
    return { summary: null, error: { message: error.message } };
  }

  if (!data || data.length === 0) {
    return {
      summary: {
        average_rating: 0,
        total_reviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      error: null,
    };
  }

  const total = data.length;
  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  data.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });

  return {
    summary: {
      average_rating: Math.round((sum / total) * 10) / 10,
      total_reviews: total,
      distribution,
      counts: distribution,
    },
    error: null,
  };
}
