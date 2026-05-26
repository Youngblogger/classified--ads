'use client';

import { supabase } from './supabase';

export async function createReport(data: {
  reporter_id: string;
  listing_id?: string;
  reported_user_id?: string;
  reason: string;
  description?: string;
}) {
  const { data: report, error } = await supabase
    .from('reports')
    .insert(data)
    .select()
    .single();

  if (error) {
    return { report: null, error: { message: error.message } };
  }

  return { report, error: null };
}

export async function getUserReports(userId: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { reports: [], error: { message: error.message } };
  }

  return { reports: data || [], error: null };
}

export async function adminGetAllReports(params?: {
  status?: string;
  page?: number;
  perPage?: number;
}) {
  const page = params?.page || 1;
  const perPage = params?.perPage || 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('reports')
    .select('*, reporter:profiles!reports_reporter_id_fkey(id, full_name, username), listing:listings(id, title, slug)', { count: 'exact' });

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return { reports: [], total: 0, error: { message: error.message } };
  }

  return { reports: data || [], total: count || 0, error: null };
}

export async function adminUpdateReport(
  reportId: string,
  status: 'resolved' | 'dismissed',
  adminUserId: string,
  notes?: string
) {
  const { error } = await supabase
    .from('reports')
    .update({
      status,
      reviewed_by: adminUserId,
      admin_notes: notes || null,
    })
    .eq('id', reportId);

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}
