import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient, supabase as anonSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    let sb: any;
    try {
      sb = getServiceRoleClient();
    } catch {
      sb = anonSupabase;
    }

    const [
      totalListings,
      activeListings,
      pendingListings,
      rejectedListings,
      failedSync,
      totalImages,
      totalUsers,
      monthlyListings,
    ] = await Promise.all([
      sb.from('listings').select('*', { count: 'exact', head: true }),
      sb.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      sb.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      sb.from('listings').select('*', { count: 'exact', head: true }).eq('sync_status', 'failed_sync'),
      sb.from('listing_images').select('*', { count: 'exact', head: true }),
      sb.from('profiles').select('*', { count: 'exact', head: true }),
      sb.from('listings').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    return NextResponse.json({
      data: {
        listings: {
          total: totalListings.count ?? 0,
          active: activeListings.count ?? 0,
          pending: pendingListings.count ?? 0,
          rejected: rejectedListings.count ?? 0,
          failed_sync: failedSync.count ?? 0,
          last_30_days: monthlyListings.count ?? 0,
        },
        images: {
          total: totalImages.count ?? 0,
        },
        users: {
          total: totalUsers.count ?? 0,
        },
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (e: any) {
    console.error('[Health API] Error:', e);
    return NextResponse.json({ data: null, error: e.message, status: 'error' }, { status: 500 });
  }
}
