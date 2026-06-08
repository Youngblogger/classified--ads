import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient, supabase as anonSupabase } from '@/lib/supabase';
import { listingLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const category = searchParams.get('category');
    const category_id = searchParams.get('category_id');
    const subcategory_id = searchParams.get('subcategory_id');
    const state = searchParams.get('state');
    const lga = searchParams.get('lga');
    const condition = searchParams.get('condition');
    const min_price = searchParams.get('min_price');
    const max_price = searchParams.get('max_price');
    const user_id = searchParams.get('user_id');
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const search = searchParams.get('search');
    const slug = searchParams.get('slug');

    let sb;
    try {
      sb = getServiceRoleClient();
    } catch {
      sb = anonSupabase;
    }

    let query = sb
      .from('listings')
      .select('*, listing_images(*)', { count: 'estimated' });

    if (status && status !== 'all') {
      if (['active', 'sold'].includes(status)) {
        query = query.eq('status', status);
      } else if (user_id) {
        query = query.eq('status', status);
      } else {
        query = query.eq('status', 'active');
      }
    }

    if (category) {
      const { data: cat } = await sb.from('categories').select('id').eq('slug', category).maybeSingle();
      if (cat) query = query.eq('category_id', (cat as any).id);
    }
    if (category_id) query = query.eq('category_id', String(category_id));
    if (subcategory_id) query = query.eq('subcategory_id', String(subcategory_id));
    if (state) query = query.eq('state', state);
    if (lga) query = query.eq('lga', lga);
    if (condition) query = query.eq('condition', condition);
    if (min_price) query = query.gte('price', Number(min_price));
    if (max_price) query = query.lte('price', Number(max_price));
    if (user_id) query = query.eq('user_id', user_id);
    if (search) query = query.ilike('title', `%${search}%`);
    if (slug) query = query.eq('slug', slug);

    const isSingle = !!slug;

    if (!isSingle) {
      query = query.order(sort_by, { ascending: sort_order === 'asc' });
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    if (isSingle) {
      const { data: single } = await query.maybeSingle();
      return NextResponse.json({ data: single || null });
    }

    const { data, count } = await query;

    if (!data || data.length === 0) {
      return NextResponse.json({
        data: [],
        meta: { total: 0, current_page: page, per_page: limit, last_page: 1 },
      });
    }

    return NextResponse.json({
      data,
      meta: {
        total: count || data.length,
        current_page: page,
        per_page: limit,
        last_page: Math.ceil((count || data.length) / limit),
      },
    });
  } catch (e) {
    listingLogger.error('Listings API error', { error: (e as Error)?.message });
    return NextResponse.json({ data: [], meta: null }, { status: 200 });
  }
}
