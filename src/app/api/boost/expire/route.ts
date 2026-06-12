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
    const listings = sb.from('listings');
    const boosted = sb.from('boosted_listings');

    const now = new Date().toISOString();

    const { data: expiredListings, error: fetchError } = await (listings as any)
      .select('id, user_id')
      .eq('is_boosted', true)
      .not('boost_expires_at', 'is', null)
      .lt('boost_expires_at', now);

    if (fetchError) {
      console.error('[Boost Expire] Failed to fetch expired boosts:', fetchError);
      return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }

    const { error: updateError } = await (listings as any)
      .update({
        is_boosted: false,
        boost_type: null,
        boost_plan: null,
        boost_status: 'expired',
        boost_priority_score: 0,
        updated_at: now,
      })
      .eq('is_boosted', true)
      .not('boost_expires_at', 'is', null)
      .lt('boost_expires_at', now);

    if (updateError) {
      console.error('[Boost Expire] Failed to update listings:', updateError);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    const { error: boostedListingsError } = await (boosted as any)
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('end_date', now);

    if (boostedListingsError) {
      console.error('[Boost Expire] Failed to update boosted_listings:', boostedListingsError);
    }

    const expiredRows: { id: number; user_id: string | null }[] = expiredListings || [];
    const notifications = sb.from('notifications');
    for (const listing of expiredRows) {
      if (!listing.user_id) continue;
      await (notifications as any).insert({
        user_id: listing.user_id,
        type: 'boost_expired',
        title: 'Boost Expired',
        message: `The boost for your listing #${listing.id} has expired. Renew it to keep your ad visible.`,
        data: { ad_id: listing.id, type: 'boost_expired' },
        is_read: false,
      }).maybeSingle();
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
