import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, getOptimizedImageUrl } from '@/lib/cloudinary';
import { RateLimiter, getClientIp } from '@/lib/rate-limiter';
import { applyWatermarkSharp, applyLogoWatermarkSharp } from '@/lib/watermark-sharp';
import { getActiveWatermarkSettings } from '@/lib/watermark-db';
import type { WatermarkConfig } from '@/lib/watermark-defaults';

const uploadLimiter = new RateLimiter({ windowMs: 60000, max: 20 });

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

    // Fetch watermark settings — always fresh from DB, never stale
    let watermarkConfig: WatermarkConfig | null = null;
    const wmSettings = await getActiveWatermarkSettings();
    if (wmSettings?.enabled) {
      watermarkConfig = {
        enabled: true,
        type: wmSettings.type,
        text: wmSettings.text,
        logo_url: wmSettings.logo_url,
        text_color: wmSettings.text_color,
        position: wmSettings.position,
        opacity: wmSettings.opacity,
        font_size: wmSettings.font_size,
        font_family: wmSettings.font_family,
        margin: wmSettings.margin,
        rotation: wmSettings.rotation,
        logo_scale: wmSettings.logo_scale,
        show_ad_id: wmSettings.show_ad_id,
      };
      console.log('[Upload] WATERMARK_SETTINGS_USED:', JSON.stringify(watermarkConfig));
    } else {
      console.log('[Upload] Watermark disabled or no settings — skipping Sharp compositing');
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
