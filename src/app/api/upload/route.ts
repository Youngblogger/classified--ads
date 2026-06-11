import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, getOptimizedImageUrl } from '@/lib/cloudinary';
import { applyWatermarkSharp, applyLogoWatermarkSharp } from '@/lib/watermark-sharp';
import type { WatermarkConfig } from '@/lib/watermark-sharp';
import { supabase as anonSupabase, getServiceRoleClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function getSb() {
  try {
    return getServiceRoleClient();
  } catch {
    return anonSupabase;
  }
}

async function getWatermarkSettingsLive(): Promise<WatermarkConfig | null> {
  try {
    const sb = getSb() as any;
    const { data, error } = await sb
      .from('watermark_settings')
      .select('*')
      .eq('id', 'default')
      .single();
    if (!error && data?.enabled) return data as WatermarkConfig;
    return null;
  } catch {
    return null;
  }
}

async function fetchLogoBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch logo: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const folder = (formData.get('folder') as string) || 'classified-ads';
    const adId = formData.get('ad_id') ? Number(formData.get('ad_id')) : undefined;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024;

    const watermark = await getWatermarkSettingsLive();

    const uploadPromises = files.map(async (file) => {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
      }

      if (file.size > maxSize) {
        throw new Error(`File ${file.name} exceeds 10MB limit`);
      }

      const rawBuffer = Buffer.from(await file.arrayBuffer());
      const publicId = `ad_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      let uploadBuffer: Buffer = rawBuffer;

      if (watermark) {
        if (watermark.type === 'text') {
          uploadBuffer = await applyWatermarkSharp(rawBuffer, watermark, adId);
        } else if (watermark.type === 'logo' && watermark.logo_url) {
          uploadBuffer = await applyLogoWatermarkSharp(rawBuffer, watermark, fetchLogoBuffer);
        }
      }

      const result = await uploadToCloudinary(uploadBuffer, {
        folder,
        public_id: publicId,
        resource_type: 'image',
      });

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
