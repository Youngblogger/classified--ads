import { NextRequest, NextResponse } from 'next/server';
import { supabase as anonSupabase, getServiceRoleClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const perPage = parseInt(searchParams.get('per_page') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    let sb: any;
    try {
      sb = getServiceRoleClient();
    } catch {
      sb = anonSupabase;
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = sb
      .from('listings')
      .select('*, listing_images(*)', { count: 'estimated' });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('[Admin Ads API] Fetch error:', error);
      return NextResponse.json({ data: [], error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [], total: count || 0 });
  } catch (e: any) {
    console.error('[Admin Ads API] GET error:', e);
    return NextResponse.json({ data: [], error: e.message }, { status: 500 });
  }
}
