import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeAd, normalizeAds } from '@/lib/normalize-ad';
import { RateLimiter, getClientIp } from '@/lib/rate-limiter';

const searchLimiter = new RateLimiter({ windowMs: 60000, max: 30 });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rateCheck = await searchLimiter.check(ip);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: searchLimiter.getMessage() },
      { status: searchLimiter.getStatusCode(), headers: { 'Retry-After': String(Math.ceil((rateCheck.resetTime - Date.now()) / 1000)) } }
    );
  }
  try {
    const q = request.nextUrl.searchParams.get('q')?.trim() || '';
    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1', 10));
    const perPage = Math.min(50, Math.max(1, parseInt(request.nextUrl.searchParams.get('per_page') || '20', 10)));
    const offset = (page - 1) * perPage;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let query = supabase
      .from('listings')
      .select('*, listing_images(*), profiles(*)', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1);

    if (q) {
      const pattern = `%${q}%`;
      query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Search API] Supabase error:', error);
      return NextResponse.json({ data: [], meta: { total: 0, current_page: page, per_page: perPage, last_page: 0 }, error: error.message }, { status: 200 });
    }

    const items = normalizeAds(data || []).map((item: any) => ({
      ...item,
      user: item.user || (() => {
        const profile = (data || []).find((d: any) => d.id === item.id)?.profiles || {};
        return {
          id: profile.id || item.user_id,
          name: profile.full_name || '',
          full_name: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          avatar: profile.avatar_url || '',
          avatar_url: profile.avatar_url || '',
          is_verified: profile.is_verified || false,
          rating_avg: profile.rating_avg || null,
          response_time: profile.response_time_avg || null,
          completed_transactions: profile.completed_transactions || null,
        };
      })(),
    }));

    const total = count || 0;
    const lastPage = Math.ceil(total / perPage) || 1;

    return NextResponse.json({
      data: items,
      meta: {
        total,
        current_page: page,
        per_page: perPage,
        last_page: lastPage,
        from: offset + 1,
        to: Math.min(offset + perPage, total),
        engine: 'supabase-ilike',
      },
    });
  } catch (error) {
    console.error('[Search API] Unhandled error:', error);
    return NextResponse.json({ data: [], meta: { total: 0, current_page: 1, per_page: 20, last_page: 0 }, error: 'Internal server error' }, { status: 500 });
  }
}
