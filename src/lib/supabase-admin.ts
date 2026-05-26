'use client';

import { supabase } from './supabase';

export async function adminGetUsers(params?: {
  page?: number;
  perPage?: number;
  search?: string;
  isVerified?: boolean;
}) {
  const page = params?.page || 1;
  const perPage = params?.perPage || 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' });

  if (params?.search) {
    query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%,username.ilike.%${params.search}%`);
  }

  if (params?.isVerified !== undefined) {
    query = query.eq('is_verified', params.isVerified);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return { users: [], total: 0, error: { message: error.message } };
  }

  return { users: data || [], total: count || 0, error: null };
}

export async function adminGetAllListings(params?: {
  page?: number;
  perPage?: number;
  status?: string;
  search?: string;
}) {
  const page = params?.page || 1;
  const perPage = params?.perPage || 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('listings')
    .select('*, user:profiles(id, full_name, username, email), category:categories(name, slug)', { count: 'exact' });

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  if (params?.search) {
    query = query.ilike('title', `%${params.search}%`);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return { listings: [], total: 0, error: { message: error.message } };
  }

  return { listings: data || [], total: count || 0, error: null };
}

export async function adminUpdateListingStatus(
  listingId: string,
  status: string,
  adminNote?: string
) {
  const { error } = await supabase
    .from('listings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', listingId);

  if (error) {
    return { error: { message: error.message } };
  }

  await supabase
    .from('audit_logs')
    .insert({
      action: `listing_${status}`,
      entity_type: 'listing',
      entity_id: listingId,
      new_values: { status, note: adminNote },
    });

  return { error: null };
}

export async function adminGetAnalytics() {
  const { data, error } = await supabase.rpc('get_admin_analytics');

  if (error || !data) {
    return { analytics: null, error: { message: error?.message || 'Failed to load analytics' } };
  }

  const result = data as any;

  return {
    analytics: {
      total_users: Number(result.total_users) || 0,
      total_listings: Number(result.total_listings) || 0,
      active_listings: Number(result.active_listings) || 0,
      pending_listings: Number(result.pending_listings) || 0,
      total_views: Number(result.total_views) || 0,
      total_favorites: Number(result.total_favorites) || 0,
      pending_verifications: Number(result.pending_verifications) || 0,
      pending_reports: Number(result.pending_reports) || 0,
      total_revenue: Number(result.total_revenue) || 0,
    },
    error: null,
  };
}

export async function adminGetNotifications() {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return { logs: [], error: { message: error.message } };
  }

  return { logs: data || [], error: null };
}
