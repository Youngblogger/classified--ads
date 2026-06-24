import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Supabase request timed out')), ms)),
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { follower_id, following_id } = body;

    if (!follower_id || !following_id) {
      return NextResponse.json({ error: 'follower_id and following_id are required' }, { status: 400 });
    }

    if (follower_id === following_id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    if (!UUID_REGEX.test(follower_id) || !UUID_REGEX.test(following_id)) {
      return NextResponse.json({ error: 'Invalid UUID format' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    let accessToken: string | null = null;

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      accessToken = authHeader.slice(7);
    }

    if (!accessToken) {
      const cookie = request.cookies.get('ilist-supabase-auth');
      if (cookie?.value) {
        try {
          const parsed = JSON.parse(cookie.value);
          accessToken = parsed.access_token || null;
        } catch {
          accessToken = cookie.value;
        }
      }
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated - no session token' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: { user }, error: userError } = await withTimeout(
      supabase.auth.getUser(accessToken) as Promise<any>,
      5000
    );
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Not authenticated - invalid token' }, { status: 401 });
    }

    if (user.id !== follower_id) {
      return NextResponse.json({ error: 'follower_id must match authenticated user' }, { status: 403 });
    }

    const existingResult: any = await withTimeout(
      (supabase
        .from('follows')
        .select('id')
        .eq('follower_id', follower_id)
        .eq('following_id', following_id)
        .maybeSingle() as any) as Promise<any>,
      5000
    );
    const existing = existingResult?.data ?? null;

    if (existing) {
      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('id', existing.id);

      if (deleteError) throw deleteError;
      return NextResponse.json({ status: 'unfollowed' });
    }

    const { error: insertError } = await supabase
      .from('follows')
      .insert({ follower_id, following_id });

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ status: 'followed' });
      }
      throw insertError;
    }

    return NextResponse.json({ status: 'followed' });
  } catch (error: any) {
    const message = error?.message || 'Internal server error';
    if (message.includes('timed out') || message.includes('fetch failed')) {
      return NextResponse.json({ error: 'Supabase is currently unavailable, try again later' }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
