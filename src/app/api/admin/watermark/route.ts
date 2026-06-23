import { NextRequest, NextResponse } from 'next/server';
import { supabase as anonSupabase, getServiceRoleClient } from '@/lib/supabase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { DEFAULT_WATERMARK_SETTINGS } from '@/lib/watermark-defaults';

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
        return NextResponse.json({ data: DEFAULT_WATERMARK_SETTINGS });
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

    const updateData: Record<string, unknown> = {
      enabled: Boolean(body.enabled),
      type: body.type === 'logo' ? 'logo' : 'text',
      text: String(body.text || 'iList'),
      logo_url: body.logo_url || null,
      text_color: String(body.text_color || '#FFFFFF'),
      shadow_color: String(body.shadow_color || '#000000'),
      shadow_opacity: Number(body.shadow_opacity) ?? 50,
      position: String(body.position || 'bottom_right'),
      opacity: Number(body.opacity) ?? 80,
      font_size: Number(body.font_size) || 36,
      font_family: String(body.font_family || 'Arial'),
      font_path: body.font_path || null,
      margin: Number(body.margin) || 20,
      rotation: Number(body.rotation) || 0,
      logo_scale: Number(body.logo_scale) || 0.15,
      show_ad_id: Boolean(body.show_ad_id),
      apply_to_original: Boolean(body.apply_to_original),
      apply_to_medium: Boolean(body.apply_to_medium),
      apply_to_thumbnail: Boolean(body.apply_to_thumbnail),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await sb
      .from('watermark_settings')
      .upsert({ id: 'default', ...updateData })
      .select()
      .single();

    if (error) {
      console.error('[Watermark API] Update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
