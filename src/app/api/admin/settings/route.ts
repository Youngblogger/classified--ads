import { NextRequest, NextResponse } from 'next/server';
import { supabase as anonSupabase, getServiceRoleClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  auto_approval_enabled: false,
  approval_duration_minutes: 2,
  max_images_per_ad: 10,
  ad_expiration_days: 30,
};

export async function GET() {
  try {
    let sb: any;
    try {
      sb = getServiceRoleClient();
    } catch {
      sb = anonSupabase;
    }
    const { data, error } = await sb
      .from('admin_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: DEFAULT_SETTINGS });
      }
      console.error('[Settings API] Fetch error:', error);
      return NextResponse.json({ data: DEFAULT_SETTINGS });
    }

    return NextResponse.json({ data });
  } catch (e) {
    console.error('[Settings API] GET error:', e);
    return NextResponse.json({ data: DEFAULT_SETTINGS });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    let sb: any;
    try {
      sb = getServiceRoleClient();
    } catch {
      sb = anonSupabase;
    }

    const updateData: Record<string, unknown> = {
      auto_approval_enabled: Boolean(body.auto_approval_enabled),
      approval_duration_minutes: Number(body.approval_duration_minutes) || 2,
      max_images_per_ad: Number(body.max_images_per_ad) || 10,
      ad_expiration_days: Number(body.ad_expiration_days) || 30,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (sb as any)
      .from('admin_settings')
      .upsert({ id: 'default', ...updateData })
      .select()
      .single();

    if (error) {
      console.error('[Settings API] Update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Settings saved' });
  } catch (e: any) {
    console.error('[Settings API] PUT error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to save settings' }, { status: 500 });
  }
}
