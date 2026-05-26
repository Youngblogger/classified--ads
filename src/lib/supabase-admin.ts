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

export async function adminGetAnalytics(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const { data: totalUsers, error: usersErr } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  const { data: totalListings, error: listingsErr } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true });

  const { data: activeListings, error: activeErr } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  const { data: pendingListings, error: pendingErr } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { data: totalViews, error: viewsErr } = await supabase
    .from('listing_views')
    .select('id', { count: 'exact', head: true });

  const { data: totalFavorites, error: favErr } = await supabase
    .from('listing_favorites')
    .select('id', { count: 'exact', head: true });

  const { data: pendingVerifications, error: verErr } = await supabase
    .from('verification_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { data: pendingReports, error: repErr } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { data: totalRevenue, error: revErr } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'credit')
    .eq('status', 'completed');

  if (usersErr || listingsErr) {
    return { analytics: null, error: { message: 'Failed to load analytics' } };
  }

  const totalRevenueAmount = ((totalRevenue as any[]) || []).reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  return {
    analytics: {
      total_users: (totalUsers as any)?.count || 0,
      total_listings: (totalListings as any)?.count || 0,
      active_listings: (activeListings as any)?.count || 0,
      pending_listings: (pendingListings as any)?.count || 0,
      total_views: (totalViews as any)?.count || 0,
      total_favorites: (totalFavorites as any)?.count || 0,
      pending_verifications: (pendingVerifications as any)?.count || 0,
      pending_reports: (pendingReports as any)?.count || 0,
      total_revenue: totalRevenueAmount,
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
