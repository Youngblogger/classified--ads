import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { calculateTrustScore } from '@/lib/trust-engine';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set() {},
          remove() {},
        },
      }
    );

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*, buyer:profiles!reviews_buyer_id_fkey(id, full_name, username, avatar_url)')
      .eq('seller_id', params.id)
      .order('created_at', { ascending: false });

    const { data: listings } = await supabase
      .from('listings')
      .select('id, title, slug, price, status, created_at')
      .eq('user_id', params.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    const accountAgeDays = profile.account_age_days ?? Math.floor(
      (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    const trustScore = profile.trust_score ?? calculateTrustScore({
      is_verified: profile.is_verified ?? false,
      rating_avg: profile.rating_avg ?? 0,
      completed_transactions: profile.completed_transactions ?? 0,
      response_rate: profile.response_rate ?? 0,
      account_age_days: accountAgeDays,
    });

    return NextResponse.json({
      success: true,
      data: {
        seller: {
          id: profile.id,
          full_name: profile.full_name,
          username: profile.username,
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          created_at: profile.created_at,
        },
        trust: {
          is_verified: profile.is_verified ?? false,
          trust_score: trustScore,
          rating_avg: profile.rating_avg ?? 0,
          review_count: profile.review_count ?? 0,
          completed_transactions: profile.completed_transactions ?? 0,
          response_rate: profile.response_rate ?? 0,
          response_time_avg: profile.response_time_avg,
          account_age_days: accountAgeDays,
        },
        reviews: (reviews ?? []).map(r => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          buyer: r.buyer ? {
            id: r.buyer.id,
            full_name: r.buyer.full_name,
            username: r.buyer.username,
            avatar_url: r.buyer.avatar_url,
          } : null,
          created_at: r.created_at,
        })),
        active_listings: listings?.length ?? 0,
      },
    });
  } catch (error) {
    console.error('[Seller Profile] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
