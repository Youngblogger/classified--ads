import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
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

    const items = (data || []).map((item: any) => {
      const images = (item.listing_images || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        thumbnail_url: img.thumbnail_url || img.url,
        medium_url: img.medium_url || img.url,
        is_primary: img.is_primary,
      }));
      const primaryImage = images.find((img: any) => img.is_primary) || images[0];
      const profile = item.profiles || {};

      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description || '',
        short_description: item.short_description || (item.description || '').substring(0, 120),
        price: item.price,
        currency: item.currency || 'NGN',
        condition: item.condition || '',
        status: item.status,
        negotiable: item.negotiable || false,
        views: item.views_count || 0,
        views_count: item.views_count || 0,
        favorites_count: item.favorites_count || 0,
        is_featured: item.is_featured || false,
        is_boosted: item.is_boosted || false,
        boost_type: item.boost_type || null,
        boost_status: item.boost_status || null,
        boost_expires_at: item.boost_expires_at || null,
        created_at: item.created_at,
        updated_at: item.updated_at || item.created_at,
        image: primaryImage ? { url: primaryImage.url, thumbnail_url: primaryImage.thumbnail_url, medium_url: primaryImage.medium_url } : null,
        images,
        image_url: primaryImage?.url || null,
        images_count: images.length,
        category: null,
        user: {
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
        },
        location: item.state || '',
        state: item.state || '',
        lga: item.lga || '',
      };
    });

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
