import { NextResponse } from 'next/server';
import { supabase as anonSupabase, getServiceRoleClient } from '@/lib/supabase';
import { cloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

interface WatermarkConfig {
  enabled: boolean;
  type: string;
  text: string;
  logo_url: string | null;
  text_color: string;
  position: string;
  opacity: number;
  font_size: number;
  font_family: string;
  margin: number;
  rotation: number;
  show_ad_id: boolean;
}

const FONT_FAMILY_MAP: Record<string, string> = {
  arial: 'Arial',
  arial_black: 'Arial Black',
  algerian: 'Algerian',
  castellar: 'Castellar',
  gill_sans_ultra: 'Gill Sans Ultra Bold',
  imprint_mt_shadow: 'Imprint MT Shadow',
  century_gothic: 'Century Gothic',
  rockwell: 'Rockwell',
  copperplate: 'Copperplate',
  impact: 'Impact',
  georgia: 'Georgia',
  times_new_roman: 'Times New Roman',
  verdana: 'Verdana',
  tahoma: 'Tahoma',
  trebuchet_ms: 'Trebuchet MS',
  courier_new: 'Courier New',
  comic_sans_ms: 'Comic Sans MS',
  lucida_console: 'Lucida Console',
  palatino: 'Palatino Linotype',
  book_antiqua: 'Book Antiqua',
  garamond: 'Garamond',
};

function getSb() {
  try {
    return getServiceRoleClient();
  } catch {
    return anonSupabase;
  }
}

function extractPublicId(url: string): string | null {
  const marker = '/image/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const after = url.slice(idx + marker.length);
  const parts = after.split('/');
  const versionIdx = parts.findIndex((p) => /^v\d+$/.test(p));
  const startIdx = versionIdx >= 0 ? versionIdx + 1 : 0;
  const pidParts = parts.slice(startIdx);
  return pidParts.join('/').replace(/\.[^.]+$/, '');
}

function resolveFontFamily(value: string): string {
  return FONT_FAMILY_MAP[value] || value.replace(/_/g, ' ') || 'Arial';
}

function extractLogoOverlay(logoUrl: string): string | null {
  const idx = logoUrl.indexOf('/upload/');
  if (idx === -1) return null;
  const afterUpload = logoUrl.slice(idx + '/upload/'.length);
  const parts = afterUpload.split('/');
  const versionIdx = parts.findIndex((p) => /^v\d+$/.test(p));
  const startIdx = versionIdx >= 0 ? versionIdx + 1 : 0;
  const publicId = parts.slice(startIdx).join('/').replace(/\.[^.]+$/, '');
  if (!publicId) return null;
  return publicId.replace(/\//g, ':');
}

function buildRegenerateEagerTransform(wm: WatermarkConfig, listingId: number | string) {
  const opacity = Math.round((wm.opacity / 100) * 100);
  const positionMap: Record<string, string> = {
    bottom_right: 'south_east',
    bottom_left: 'south_west',
    top_right: 'north_east',
    top_left: 'north_west',
    center: 'center',
  };
  const gravity = positionMap[wm.position] || 'south_east';

  if (wm.type === 'text') {
    let textStr = wm.text;
    if (wm.show_ad_id && listingId) {
      textStr += ` | Ad ID: ${listingId}`;
    }
    const transform: Record<string, unknown> = {
      quality: 'auto',
      fetch_format: 'auto',
      overlay: {
        text: {
          font_family: resolveFontFamily(wm.font_family || 'arial'),
          font_size: wm.font_size || 36,
          text: textStr,
        },
      },
      color: wm.text_color || '#FFFFFF',
      opacity,
      gravity,
      x: wm.margin || 20,
      y: wm.margin || 20,
    };
    if (wm.rotation) {
      transform.angle = wm.rotation;
    }
    return transform;
  }

  if (wm.type === 'logo' && wm.logo_url) {
    const logoOverlay = extractLogoOverlay(wm.logo_url);
    if (!logoOverlay) return null;
    const transform: Record<string, unknown> = {
      quality: 'auto',
      fetch_format: 'auto',
      overlay: logoOverlay,
      opacity,
      gravity,
      x: wm.margin || 20,
      y: wm.margin || 20,
    };
    if (wm.rotation) {
      transform.angle = wm.rotation;
    }
    return transform;
  }

  return null;
}

export async function POST() {
  try {
    const sb = getSb() as any;

    const { data: wmData, error: wmError } = await sb
      .from('watermark_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (wmError || !wmData?.enabled) {
      return NextResponse.json({ message: 'Watermark is disabled. No regeneration needed.' });
    }

    const wm = wmData as WatermarkConfig;

    const { data: images, error } = await sb
      .from('listing_images')
      .select('id, url, listing_id')
      .not('url', 'is', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results: { id: string; status: string; error?: string }[] = [];
    let processed = 0;
    let failed = 0;

    for (const img of images || []) {
      const publicId = extractPublicId(img.url);
      if (!publicId) {
        results.push({ id: img.id, status: 'skipped', error: 'Not a Cloudinary URL' });
        continue;
      }

      const eagerTransform = buildRegenerateEagerTransform(wm, img.listing_id || '');
      if (!eagerTransform) {
        results.push({ id: img.id, status: 'skipped', error: 'No watermark transform' });
        continue;
      }

      try {
        await new Promise<void>((resolve, reject) => {
          cloudinary.uploader.explicit(
            publicId,
            {
              type: 'upload',
              eager: [eagerTransform as Record<string, unknown>],
              eager_async: false,
            },
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        results.push({ id: img.id, status: 'regenerated' });
        processed++;
      } catch (e: any) {
        results.push({ id: img.id, status: 'failed', error: e?.message });
        failed++;
      }
    }

    return NextResponse.json({
      message: `Regenerated ${processed} images${failed ? `, ${failed} failed` : ''}`,
      total: images?.length || 0,
      processed,
      failed,
      results,
    });
  } catch (e: any) {
    console.error('[Watermark Regenerate] Error:', e);
    return NextResponse.json({ error: e?.message || 'Regeneration failed' }, { status: 500 });
  }
}
