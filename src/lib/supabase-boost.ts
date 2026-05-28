'use client';

import { supabase } from './supabase';

export async function getBoostPlans() {
  const { data, error } = await supabase
    .from('boost_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return { plans: [], error: { message: error.message } };
  }

  return { plans: data || [], error: null };
}

export async function getBoostPlanById(planId: string) {
  const { data, error } = await supabase
    .from('boost_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) {
    return { plan: null, error: { message: error.message } };
  }

  return { plan: data, error: null };
}

export async function boostListing(data: {
  listing_id: string;
  user_id: string;
  plan_id: string;
  boost_type: 'gold' | 'platinum' | 'diamond';
  payment_amount: number;
  payment_reference?: string;
}) {
  const { data: plan } = await supabase
    .from('boost_plans')
    .select('duration_days, priority_score')
    .eq('id', data.plan_id)
    .single();

  if (!plan) {
    return { boosted: null, error: { message: 'Invalid boost plan' } };
  }

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);

  const { data: boosted, error } = await supabase
    .from('boosted_listings')
    .insert({
      listing_id: data.listing_id,
      user_id: data.user_id,
      plan_id: data.plan_id,
      boost_type: data.boost_type,
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      payment_amount: data.payment_amount,
      payment_reference: data.payment_reference || null,
      payment_status: data.payment_reference ? 'completed' : 'pending',
    })
    .select()
    .single();

  if (error) {
    return { boosted: null, error: { message: error.message } };
  }

  const planMap = { gold: 'Gold', platinum: 'Platinum', diamond: 'Diamond' };
  await supabase
    .from('listings')
    .update({
      is_boosted: true,
      boost_type: data.boost_type,
      boost_plan: planMap[data.boost_type],
      boost_status: 'active',
      boost_expires_at: endDate.toISOString(),
      boost_priority_score: plan.priority_score,
    })
    .eq('id', data.listing_id);

  return { boosted, error: null };
}

export async function getUserBoostedListings(userId: string) {
  const { data, error } = await supabase
    .from('boosted_listings')
    .select(`
      *,
      plan:boost_plans(*),
      listing:listings(id, title, slug, price, images:listing_images(*), status)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return { boosts: [], error: { message: error.message } };
  }

  return { boosts: data || [], error: null };
}

export async function getActiveBoostForListing(listingId: string) {
  const { data, error } = await supabase
    .from('boosted_listings')
    .select('*')
    .eq('listing_id', listingId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    return { boost: null, error: { message: error.message } };
  }

  return { boost: data || null, error: null };
}

export async function deactivateBoost(boostId: string) {
  const { data: boost, error: fetchError } = await supabase
    .from('boosted_listings')
    .select('listing_id')
    .eq('id', boostId)
    .single();

  if (fetchError) {
    return { error: { message: fetchError.message } };
  }

  const { error } = await supabase
    .from('boosted_listings')
    .update({ status: 'expired' })
    .eq('id', boostId);

  if (error) {
    return { error: { message: error.message } };
  }

  await supabase
    .from('listings')
    .update({
      is_boosted: false,
      boost_status: 'expired',
      boost_priority_score: 0,
    })
    .eq('id', boost.listing_id);

  return { error: null };
}

export async function checkExpiredBoosts() {
  const now = new Date().toISOString();
  
  const { data: expired, error } = await supabase
    .from('boosted_listings')
    .select('id, listing_id')
    .eq('status', 'active')
    .lt('end_date', now);

  if (error) {
    return { count: 0, error: { message: error.message } };
  }

  if (!expired || expired.length === 0) {
    return { count: 0, error: null };
  }

  const expiredIds = expired.map(e => e.id);
  const listingIds = expired.map(e => e.listing_id);

  await supabase
    .from('boosted_listings')
    .update({ status: 'expired' })
    .in('id', expiredIds);

  await supabase
    .from('listings')
    .update({
      is_boosted: false,
      boost_status: 'expired',
      boost_priority_score: 0,
    })
    .in('id', listingIds);

  return { count: expired.length, error: null };
}
