import { NextRequest, NextResponse } from 'next/server';
import { supabase as anonSupabase, getServiceRoleClient } from '@/lib/supabase';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

function getSb() {
  try {
    return getServiceRoleClient();
  } catch {
    return anonSupabase;
  }
}

export async function GET() {
  try {
    const sb = getSb() as any;
    const { data, error } = await sb
      .from('watermark_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null, message: 'No watermark settings configured yet' });
      }
      console.error('[Watermark API] Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch watermark settings' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e) {
    console.error('[Watermark API] GET error:', e);
    return NextResponse.json({ error: 'Failed to fetch watermark settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const sb = getSb() as any;

    // Only accept fields explicitly sent by the admin page — no hardcoded fallbacks.
    // Every value comes from the DB or the user's form, never from this code.
    const updateData: Record<string, unknown> = {};

    if (Object.hasOwn(body, 'enabled')) updateData.enabled = Boolean(body.enabled);
    if (Object.hasOwn(body, 'type')) updateData.type = body.type === 'logo' ? 'logo' : 'text';
    if (Object.hasOwn(body, 'text')) updateData.text = String(body.text);
    if (Object.hasOwn(body, 'logo_url')) updateData.logo_url = body.logo_url || null;
    if (Object.hasOwn(body, 'text_color')) updateData.text_color = String(body.text_color);
    if (Object.hasOwn(body, 'shadow_color')) updateData.shadow_color = String(body.shadow_color);
    if (Object.hasOwn(body, 'shadow_opacity')) updateData.shadow_opacity = Number(body.shadow_opacity);
    if (Object.hasOwn(body, 'position')) updateData.position = String(body.position);
    if (Object.hasOwn(body, 'opacity')) updateData.opacity = Number(body.opacity);
    if (Object.hasOwn(body, 'font_size')) updateData.font_size = Number(body.font_size);
    if (Object.hasOwn(body, 'font_family')) updateData.font_family = String(body.font_family);
    if (Object.hasOwn(body, 'font_path')) updateData.font_path = body.font_path || null;
    if (Object.hasOwn(body, 'margin')) updateData.margin = Number(body.margin);
    if (Object.hasOwn(body, 'rotation')) updateData.rotation = Number(body.rotation);
    if (Object.hasOwn(body, 'logo_scale')) updateData.logo_scale = Number(body.logo_scale);
    if (Object.hasOwn(body, 'show_ad_id')) updateData.show_ad_id = Boolean(body.show_ad_id);
    if (Object.hasOwn(body, 'apply_to_original')) updateData.apply_to_original = Boolean(body.apply_to_original);
    if (Object.hasOwn(body, 'apply_to_medium')) updateData.apply_to_medium = Boolean(body.apply_to_medium);
    if (Object.hasOwn(body, 'apply_to_thumbnail')) updateData.apply_to_thumbnail = Boolean(body.apply_to_thumbnail);

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await sb
      .from('watermark_settings')
      .upsert({ id: 'default', ...updateData })
      .select()
      .single();

    if (error) {
      console.error('[Watermark API] Update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[Watermark API] WATERMARK_SETTINGS_SAVED (no fallbacks):', JSON.stringify(updateData));

    return NextResponse.json({ data, message: 'Watermark settings saved' });
  } catch (e: any) {
    console.error('[Watermark API] PUT error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to save settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No logo file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Logo must be PNG, GIF, or WebP' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicId = `watermark-logo-${Date.now()}`;

    const result = await uploadToCloudinary(buffer, {
      folder: 'watermarks',
      public_id: publicId,
      transformation: [],
    });

    return NextResponse.json({
      data: { url: result.secure_url, public_id: result.public_id },
      message: 'Logo uploaded',
    });
  } catch (e: any) {
    console.error('[Watermark API] Upload error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to upload logo' }, { status: 500 });
  }
}
