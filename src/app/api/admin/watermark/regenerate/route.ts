import { NextResponse } from 'next/server';
import { supabase as anonSupabase, getServiceRoleClient } from '@/lib/supabase';
import { cloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

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

export async function POST() {
  try {
    const sb = getSb() as any;
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

      try {
        await new Promise<void>((resolve, reject) => {
          cloudinary.uploader.explicit(
            publicId,
            {
              type: 'upload',
              eager: [
                {
                  quality: 'auto',
                  fetch_format: 'auto',
                  overlay: {
                    text: {
                      font_family: 'Arial',
                      font_size: 28,
                      text: 'iList | ID:' + (img.listing_id || ''),
                    },
                  },
                  color: '#FFFFFF',
                  opacity: 60,
                  gravity: 'south_east',
                  x: 15,
                  y: 15,
                },
              ],
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
