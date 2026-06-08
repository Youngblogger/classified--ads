import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient, supabase as anonSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    let sb: any;
    try {
      sb = getServiceRoleClient();
    } catch {
      sb = anonSupabase;
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await sb
      .from('listings')
      .select('id, title, slug, sync_status, sync_error, sync_retry_count, last_sync_attempt_at, updated_at', { count: 'estimated' })
      .or('sync_status.eq.failed_sync,sync_status.eq.pending_sync')
      .order('last_sync_attempt_at', { ascending: false, nullsFirst: true })
      .range(from, to);

    if (error) {
      return NextResponse.json({ data: [], error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (e: any) {
    console.error('[Sync Recovery API] GET error:', e);
    return NextResponse.json({ data: [], error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let sb: any;
    try {
      sb = getServiceRoleClient();
    } catch {
      sb = anonSupabase;
    }

    const body = await request.json().catch(() => ({}));
    const listingId = body.id;
    const action = body.action || 'retry';

    if (!listingId) {
      return NextResponse.json({ error: 'Missing listing id' }, { status: 400 });
    }

    if (action === 'retry') {
      const { data: listing, error: fetchError } = await sb
        .from('listings')
        .select('id, sync_retry_count')
        .eq('id', listingId)
        .single();

      if (fetchError || !listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }

      const retryCount = (listing.sync_retry_count || 0) + 1;

      const { error: updateError } = await sb
        .from('listings')
        .update({
          sync_status: 'pending_sync',
          sync_retry_count: retryCount,
          last_sync_attempt_at: new Date().toISOString(),
          sync_error: null,
        })
        .eq('id', listingId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Listing ${listingId} queued for retry (attempt ${retryCount})`,
      });
    }

    if (action === 'reset') {
      const { error: updateError } = await sb
        .from('listings')
        .update({
          sync_status: 'synced',
          sync_error: null,
          sync_retry_count: 0,
          last_sync_attempt_at: new Date().toISOString(),
        })
        .eq('id', listingId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Listing ${listingId} sync status reset to synced`,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (e: any) {
    console.error('[Sync Recovery API] POST error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let sb: any;
    try {
      sb = getServiceRoleClient();
    } catch {
      sb = anonSupabase;
    }

    const body = await request.json().catch(() => ({}));
    const listingId = body.id;

    if (!listingId) {
      return NextResponse.json({ error: 'Missing listing id' }, { status: 400 });
    }

    const { error: updateError } = await sb
      .from('listings')
      .update({
        sync_status: 'synced',
        sync_error: null,
        sync_retry_count: 0,
        last_sync_attempt_at: new Date().toISOString(),
      })
      .eq('id', listingId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Sync error cleared for listing ${listingId}` });
  } catch (e: any) {
    console.error('[Sync Recovery API] DELETE error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
