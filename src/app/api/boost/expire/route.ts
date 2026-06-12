import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sb = getServiceRoleClient();

    const now = new Date().toISOString();

    const { data: expiredListings, error: fetchError } = await sb
      .from('listings')
      .select('id, user_id')
      .eq('is_boosted', true)
      .not('boost_expires_at', 'is', null)
      .lt('boost_expires_at', now) as any;

    if (fetchError) {
      console.error('[Boost Expire] Failed to fetch expired boosts:', fetchError);
      return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }

    const { error: updateError } = await sb
      .from('listings')
      .update({
        is_boosted: false,
        boost_type: null,
        boost_plan: null,
        boost_status: 'expired',
        boost_priority_score: 0,
        updated_at: now,
      } as any)
      .eq('is_boosted', true)
      .not('boost_expires_at', 'is', null)
      .lt('boost_expires_at', now) as any;

    if (updateError) {
      console.error('[Boost Expire] Failed to update listings:', updateError);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    const { error: boostedListingsError } = await sb
      .from('boosted_listings')
      .update({ status: 'expired' } as any)
      .eq('status', 'active')
      .lt('end_date', now) as any;

    if (boostedListingsError) {
      console.error('[Boost Expire] Failed to update boosted_listings:', boostedListingsError);
    }

    const expiredRows: { id: number; user_id: string | null }[] = expiredListings || [];
    for (const listing of expiredRows) {
      if (!listing.user_id) continue;
      await sb.from('notifications').insert({
        user_id: listing.user_id,
        type: 'boost_expired',
        title: 'Boost Expired',
        message: `The boost for your listing #${listing.id} has expired. Renew it to keep your ad visible.`,
        data: { ad_id: listing.id, type: 'boost_expired' },
        is_read: false,
      } as any).maybeSingle();
    }

    return NextResponse.json({
      success: true,
      expired_count: expiredRows.length,
    });
  } catch (err) {
    console.error('[Boost Expire] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
