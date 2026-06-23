import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { resolveFontFamily } from '@/lib/watermark-defaults';
import type { WatermarkConfig } from '@/lib/watermark-defaults';
import { getActiveWatermarkSettings, getSb } from '@/lib/watermark-db';
import { RateLimiter, getClientIp } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

const regenerateLimiter = new RateLimiter({ windowMs: 60000, max: 3 });

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
          font_family: resolveFontFamily(wm.font_family),
          font_size: wm.font_size,
          text: textStr,
        },
      },
      color: wm.text_color,
      opacity,
      gravity,
      x: wm.margin,
      y: wm.margin,
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
      width: wm.logo_scale ?? 0.15,
      opacity,
      gravity,
      x: wm.margin,
      y: wm.margin,
    };
    if (wm.rotation) {
      transform.angle = wm.rotation;
    }
    return transform;
  }

  return null;
}

async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return false;
  const backends = [
    process.env.NEXT_PUBLIC_API_URL,
    'http://localhost:8000/api',
  ].filter(Boolean) as string[];
  for (const base of backends) {
    try {
      const res = await fetch(`${base}/secure-control-9ja/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data?.role === 'admin' || json?.role === 'admin';
      }
    } catch {}
  }
  return false;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[Watermark Regenerate] WATERMARK_REGENERATE_START');

  const rateCheck = await regenerateLimiter.check(getClientIp(request));
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: regenerateLimiter.getMessage() },
      { status: regenerateLimiter.getStatusCode(), headers: { 'Retry-After': String(Math.ceil((rateCheck.resetTime - Date.now()) / 1000)) } }
    );
  }

  const isAdmin = await verifyAdminAuth(request);
  if (!isAdmin) {
    console.warn('[Watermark Regenerate] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const wm = await getActiveWatermarkSettings();
    if (!wm?.enabled) {
      console.log('[Watermark Regenerate] Watermark disabled or no settings — no regeneration needed');
      return NextResponse.json({ message: 'Watermark is disabled. No regeneration needed.' });
    }
    console.log('[Watermark Regenerate] WATERMARK_SETTINGS_USED:', JSON.stringify(wm));
    const sb = getSb() as any;

    const { data: images, error } = await sb
      .from('listing_images')
      .select('id, url, listing_id')
      .not('url', 'is', null);

    if (error) {
      console.error('[Watermark Regenerate] Failed to fetch listing images:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[Watermark Regenerate] Fetched', images?.length || 0, 'images to process');

    const results: { id: string; status: string; error?: string; listing_id?: string; processing_time_ms?: number }[] = [];
    let processed = 0;
    let failed = 0;
    let skipped = 0;

    for (const img of images || []) {
      const imageStartTime = Date.now();
      const imgId = img.id;
      const listingId = img.listing_id || '';
      const imgUrl = img.url || '';

      console.log('[Watermark Regenerate] WATERMARK_REGENERATE_IMAGE_START:', JSON.stringify({
        image_id: imgId, listing_id: listingId, image_url: imgUrl,
      }));

      const publicId = extractPublicId(imgUrl);
      if (!publicId) {
        console.log('[Watermark Regenerate] Skipped (not Cloudinary URL):', imgId);
        results.push({ id: imgId, status: 'skipped', error: 'Not a Cloudinary URL', listing_id: String(listingId) });
        skipped++;
        continue;
      }

      const eagerTransform = buildRegenerateEagerTransform(wm, listingId);
      if (!eagerTransform) {
        console.log('[Watermark Regenerate] Skipped (no transform):', imgId);
        results.push({ id: imgId, status: 'skipped', error: 'No watermark transform', listing_id: String(listingId) });
        skipped++;
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

        const processingTime = Date.now() - imageStartTime;
        console.log('[Watermark Regenerate] Success:', JSON.stringify({
          image_id: imgId, listing_id: String(listingId), processing_time_ms: processingTime,
        }));
        console.log('[Watermark Regenerate] WATERMARK_REGENERATE_IMAGE_SUCCESS:', imgId);
        results.push({ id: imgId, status: 'regenerated', listing_id: String(listingId), processing_time_ms: processingTime });
        processed++;
      } catch (e: any) {
        const processingTime = Date.now() - imageStartTime;
        console.error('[Watermark Regenerate] Failed:', JSON.stringify({
          image_id: imgId, listing_id: String(listingId), error: e?.message, processing_time_ms: processingTime,
        }));
        console.error('[Watermark Regenerate] WATERMARK_REGENERATE_IMAGE_FAILED:', imgId, e?.message);
        results.push({ id: imgId, status: 'failed', error: e?.message, listing_id: String(listingId), processing_time_ms: processingTime });
        failed++;
      }
    }

    const totalTime = Date.now() - startTime;
    console.log('[Watermark Regenerate] WATERMARK_REGENERATE_SUCCESS:', JSON.stringify({
      total: images?.length || 0,
      processed,
      failed,
      skipped,
      total_time_ms: totalTime,
    }));

    return NextResponse.json({
      message: `Regenerated ${processed} images${failed ? `, ${failed} failed` : ''}${skipped ? `, ${skipped} skipped` : ''}`,
      total: images?.length || 0,
      processed,
      failed,
      skipped,
      duration_ms: totalTime,
      results,
    });
  } catch (e: any) {
    const totalTime = Date.now() - startTime;
    console.error('[Watermark Regenerate] WATERMARK_REGENERATE_FAILED:', JSON.stringify({
      error: e?.message || 'Unknown error',
      total_time_ms: totalTime,
    }));
    return NextResponse.json({ error: e?.message || 'Regeneration failed' }, { status: 500 });
  }
}
