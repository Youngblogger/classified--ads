import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, getOptimizedImageUrl } from '@/lib/cloudinary';
import { RateLimiter, getClientIp } from '@/lib/rate-limiter';
import { getServiceRoleClient } from '@/lib/supabase';
import { applyWatermarkSharp, applyLogoWatermarkSharp } from '@/lib/watermark-sharp';
import type { WatermarkConfig } from '@/lib/watermark-sharp';

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

    // Fetch watermark settings once (server-side, bypasses RLS)
    let watermarkConfig: WatermarkConfig | null = null;
    try {
      const sb = getServiceRoleClient();
      const { data } = await sb
        .from('watermark_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (data?.enabled) {
        watermarkConfig = {
          enabled: true,
          type: data.type,
          text: data.text,
          logo_url: data.logo_url,
          text_color: data.text_color,
          position: data.position,
          opacity: data.opacity,
          font_size: data.font_size,
          font_family: data.font_family,
          margin: data.margin,
          rotation: data.rotation,
          show_ad_id: data.show_ad_id,
        };
      }
    } catch {
      // Watermark settings unavailable — upload originals without watermarking
    }

    const fetchLogoFn = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch logo: ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    };

    const uploadPromises = files.map(async (file) => {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
      }

      if (file.size > maxSize) {
        throw new Error(`File ${file.name} exceeds 10MB limit`);
      }

      let buffer = Buffer.from(await file.arrayBuffer());

      // Apply watermark server-side BEFORE upload — irreversible after storage
      if (watermarkConfig) {
        try {
          buffer = await applyWatermarkSharp(buffer, watermarkConfig);
          buffer = await applyLogoWatermarkSharp(buffer, watermarkConfig, fetchLogoFn);
        } catch (wmErr) {
          console.warn('[Upload] Watermark compositing failed, uploading original:', wmErr);
        }
      }

      const publicId = `ad_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const result = await uploadToCloudinary(buffer, {
        folder,
        public_id: publicId,
        resource_type: 'image',
      });
      console.log(`[Upload][Cloudinary] Uploaded ${publicId} -> ${result.secure_url} (${result.width}x${result.height}, ${(result.bytes / 1024).toFixed(1)}KB)`);

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
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
