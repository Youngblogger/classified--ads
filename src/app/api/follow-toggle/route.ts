import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    let accessToken: string | null = null;

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      accessToken = authHeader.slice(7);
    }

    if (!accessToken) {
      const cookie = request.cookies.get('ilist-supabase-auth-token');
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

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Not authenticated - invalid token' }, { status: 401 });
    }

    if (user.id !== follower_id) {
      return NextResponse.json({ error: 'follower_id must match authenticated user' }, { status: 403 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', following_id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: 'User to follow not found' }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', follower_id)
      .eq('following_id', following_id)
      .maybeSingle();

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
    console.error('Follow toggle error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
