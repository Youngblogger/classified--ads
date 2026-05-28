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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, is_verified, trust_score, rating_avg, review_count, completed_transactions, response_rate, response_time_avg, created_at, account_age_days')
      .eq('id', params.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
        user_id: profile.id,
        full_name: profile.full_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        is_verified: profile.is_verified,
        trust_score: trustScore,
        rating_avg: profile.rating_avg ?? 0,
        review_count: profile.review_count ?? 0,
        completed_transactions: profile.completed_transactions ?? 0,
        response_rate: profile.response_rate ?? 0,
        response_time_avg: profile.response_time_avg,
        account_age_days: accountAgeDays,
      },
    });
  } catch (error) {
    console.error('[TrustScore] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
