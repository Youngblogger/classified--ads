import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, getOptimizedImageUrl } from '@/lib/cloudinary';
import { supabase as anonSupabase, getServiceRoleClient } from '@/lib/supabase';

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

function getSb() {
  try {
    return getServiceRoleClient();
  } catch {
    return anonSupabase;
  }
}

async function getWatermarkSettings(): Promise<WatermarkConfig | null> {
  try {
    const sb = getSb() as any;
    const { data, error } = await sb
      .from('watermark_settings')
      .select('*')
      .eq('id', 'default')
      .single();
    if (!error && data?.enabled) return data;
    return null;
  } catch {
    return null;
  }
}

function buildWatermarkTransform(wm: WatermarkConfig, adId?: number) {
  const transforms: Record<string, unknown>[] = [];

  const opacity = Math.round((wm.opacity / 100) * 100);

  if (wm.type === 'text') {
    let textStr = wm.text;
    if (wm.show_ad_id && adId) {
      textStr += ` | Ad ID: ${adId}`;
    }
    const encodedText = textStr.replace(/ /g, '%20').replace(/,/g, '%252C');
    const fontName = wm.font_family?.replace(/_/g, '%20') || 'Arial';
    const overlay = `l_text:${fontName}_${wm.font_size}:${encodedText}/co_rgb:${wm.text_color.replace('#', '')}/fl_layer_apply/so_${opacity}`;

    const positionMap: Record<string, string> = {
      bottom_right: 'se',
      bottom_left: 'sw',
      top_right: 'ne',
      top_left: 'nw',
      center: 'center',
    };
    const gravity = positionMap[wm.position] || 'se';

    transforms.push({
      overlay: `text:${fontName}_${wm.font_size}:${encodedText}`,
      color: wm.text_color,
      opacity,
      gravity,
      x: wm.margin,
      y: wm.margin,
    });
  } else if (wm.type === 'logo' && wm.logo_url) {
    const logoPid = wm.logo_url.split('/').pop()?.split('.')[0] || '';
    if (logoPid) {
      const positionMap: Record<string, string> = {
        bottom_right: 'se',
        bottom_left: 'sw',
        top_right: 'ne',
        top_left: 'nw',
        center: 'center',
      };
      const gravity = positionMap[wm.position] || 'se';

      transforms.push({
        overlay: `watermarks:${logoPid}`,
        opacity,
        gravity,
        x: wm.margin,
        y: wm.margin,
      });
    }
  }

  return transforms.length > 0 ? transforms : undefined;
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
    const maxSize = 10 * 1024 * 1024; // 10MB

    const watermark = await getWatermarkSettings();

    const uploadPromises = files.map(async (file) => {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
      }

      if (file.size > maxSize) {
        throw new Error(`File ${file.name} exceeds 10MB limit`);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const publicId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const wmTransform = watermark ? buildWatermarkTransform(watermark, adId) : undefined;

      const result = await uploadToCloudinary(buffer, {
        folder,
        public_id: publicId,
        resource_type: 'image',
        transformation: wmTransform,
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        optimized_url: getOptimizedImageUrl(result.public_id),
        thumbnail_url: getOptimizedImageUrl(result.public_id, { width: 400, height: 300, crop: 'fill', gravity: 'auto' }),
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
    console.error('Upload error:', error);
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
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
