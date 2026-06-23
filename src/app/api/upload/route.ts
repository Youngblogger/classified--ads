import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, getOptimizedImageUrl } from '@/lib/cloudinary';
import { RateLimiter, getClientIp } from '@/lib/rate-limiter';
import { supabase as anonSupabase, getServiceRoleClient } from '@/lib/supabase';
import { applyWatermarkSharp, applyLogoWatermarkSharp } from '@/lib/watermark-sharp';
import type { WatermarkConfig } from '@/lib/watermark-defaults';

interface WatermarkRow {
  enabled: boolean;
  type: 'text' | 'logo';
  text: string;
  logo_url: string | null;
  text_color: string;
  position: string;
  opacity: number;
  font_size: number;
  font_family: string;
  margin: number;
  rotation: number;
  logo_scale: number;
  show_ad_id: boolean;
}

const uploadLimiter = new RateLimiter({ windowMs: 60000, max: 20 });

function getSb() {
  try {
    return getServiceRoleClient();
  } catch {
    return anonSupabase;
  }
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateCheck = await uploadLimiter.check(ip);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: uploadLimiter.getMessage() },
      { status: uploadLimiter.getStatusCode(), headers: { 'Retry-After': String(Math.ceil((rateCheck.resetTime - Date.now()) / 1000)) } }
    );
  }
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const folder = (formData.get('folder') as string) || 'classified-ads';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024;

    // Fetch watermark settings once (server-side, bypasses RLS)
    let watermarkConfig: WatermarkConfig | null = null;
    try {
      const sb = getSb() as any;
      const { data, error } = await sb
        .from('watermark_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (error) {
        console.warn('[Upload] Watermark settings DB error:', error.code, error.message);
      }
      const wmRow = data as WatermarkRow | null;
      if (wmRow?.enabled) {
        watermarkConfig = {
          enabled: true,
          type: wmRow.type,
          text: wmRow.text,
          logo_url: wmRow.logo_url,
          text_color: wmRow.text_color,
          position: wmRow.position,
          opacity: wmRow.opacity,
          font_size: wmRow.font_size,
          font_family: wmRow.font_family,
          margin: wmRow.margin,
          rotation: wmRow.rotation,
          logo_scale: wmRow.logo_scale ?? 0.15,
          show_ad_id: wmRow.show_ad_id,
        };
        console.log(`[Upload] Watermark settings loaded: type=${wmRow.type}, enabled=true, logo_url=${wmRow.logo_url ? 'set' : 'null'}`);
      } else {
        console.log(`[Upload] Watermark settings: enabled=${wmRow?.enabled ?? 'N/A'}, skipping Sharp compositing`);
      }
    } catch (e) {
      console.warn('[Upload] Watermark settings unavailable — uploading originals without watermark:', (e as Error)?.message || e);
    }

    const fetchLogoFn = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch logo: ${res.status}`);
      return Buffer.from(await res.arrayBuffer()) as unknown as Buffer;
    };

    const uploadPromises = files.map(async (file) => {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
      }

      if (file.size > maxSize) {
        throw new Error(`File ${file.name} exceeds 10MB limit`);
      }

      const rawBuffer = Buffer.from(await file.arrayBuffer()) as unknown as Buffer;
      let buffer = rawBuffer;
      const publicId = `ad_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // ==================================================================
      //  STEP 1 — Apply watermark via Sharp (pixel-level compositing)
      //  This embeds the watermark into the image pixels BEFORE it ever
      //  reaches Cloudinary. The Cloudinary URL then points to a
      //  permanently watermarked image — no URL transformation needed.
      // ==================================================================
      let watermarkApplied = false;

      if (watermarkConfig) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`[Upload] Sharp attempt ${attempt}/2 for ${publicId}: type=${watermarkConfig.type}`);
            buffer = await applyWatermarkSharp(buffer, watermarkConfig);
            buffer = await applyLogoWatermarkSharp(buffer, watermarkConfig, fetchLogoFn);
            watermarkApplied = true;
            console.log(`[Upload] Sharp watermark succeeded for ${publicId} (attempt ${attempt})`);
            break;
          } catch (wmErr) {
            const msg = wmErr instanceof Error ? wmErr.message : String(wmErr);
            console.warn(`[Upload] Sharp attempt ${attempt}/2 failed for ${publicId}: ${msg}`);
            if (attempt < 2) {
              buffer = rawBuffer;            // restore original buffer before retry
            }
          }
        }
      }

      // ==================================================================
      //  STEP 2 — Block save if watermark is required but failed
      //  We NEVER silently store a raw image. If Sharp could not apply
      //  the watermark the upload is rejected so the caller can retry.
      // ==================================================================
      if (watermarkConfig && !watermarkApplied) {
        console.error(`[Upload] WATERMARK_APPLIED: false — both Sharp attempts failed for ${publicId}. Blocking save.`);
        throw new Error('Watermark processing failed after 2 attempts. Upload rejected to prevent storing raw image.');
      }

      // ==================================================================
      //  STEP 3 — Upload to Cloudinary
      //  The buffer is either the watermarked pixels (Sharp succeeded) or
      //  the raw pixels (watermark disabled or not configured).
      // ==================================================================
      console.log(`[Upload] RAW_UPLOAD_URL: (embedded in buffer, public_id=${publicId})`);
      const result = await uploadToCloudinary(buffer, {
        folder,
        public_id: publicId,
        resource_type: 'image',
      });
      const finalUrl = result.secure_url;
      console.log(`[Upload] WATERMARK_APPLIED: ${watermarkApplied} for ${publicId}`);
      console.log(`[Upload] FINAL_SAVED_URL: ${finalUrl}`);

      return {
        public_id: result.public_id,
        secure_url: finalUrl,
        optimized_url: getOptimizedImageUrl(result.public_id),
        thumbnail_url: getOptimizedImageUrl(result.public_id, {
          width: 400,
          height: 300,
          crop: 'fill',
          gravity: 'auto',
        }),
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({
      message: 'Files uploaded successfully',
      data: results,
    });
  } catch (error) {
    console.error('[Upload API] Error:', error);
    return NextResponse.json(
      {
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      return NextResponse.json(
        { error: 'public_id is required' },
        { status: 400 }
      );
    }

    const { deleteFromCloudinary } = await import('@/lib/cloudinary');
    const result = await deleteFromCloudinary(publicId);

    return NextResponse.json({
      message: 'Image deleted successfully',
      data: result,
    });
  } catch (error) {
    console.error('[Upload API] Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
