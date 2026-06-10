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

const FONT_FAMILY_MAP: Record<string, string> = {
  arial: 'Arial',
  arial_black: 'Arial%20Black',
  algerian: 'Algerian',
  castellar: 'Castellar',
  gill_sans_ultra: 'Gill%20Sans%20Ultra%20Bold',
  imprint_mt_shadow: 'Imprint%20MT%20Shadow',
  century_gothic: 'Century%20Gothic',
  rockwell: 'Rockwell',
  copperplate: 'Copperplate',
  impact: 'Impact',
  georgia: 'Georgia',
  times_new_roman: 'Times%20New%20Roman',
  verdana: 'Verdana',
  tahoma: 'Tahoma',
  trebuchet_ms: 'Trebuchet%20MS',
  courier_new: 'Courier%20New',
  comic_sans_ms: 'Comic%20Sans%20MS',
  lucida_console: 'Lucida%20Console',
  palatino: 'Palatino%20Linotype',
  book_antiqua: 'Book%20Antiqua',
  garamond: 'Garamond',
};

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
    if (!error && data?.enabled) return data;
    return null;
  } catch {
    return null;
  }
}

function resolveFontFamily(value: string): string {
  return FONT_FAMILY_MAP[value] || value.replace(/_/g, '%20') || 'Arial';
}

function buildWatermarkOverlayUrl(wm: WatermarkConfig, adId?: number): string {
  const opacity = Math.round((wm.opacity / 100) * 100);

  if (wm.type === 'text') {
    let textStr = wm.text;
    if (wm.show_ad_id && adId) {
      textStr += ` | Ad ID: ${adId}`;
    }
    const fontName = resolveFontFamily(wm.font_family || 'arial');
    const encodedText = textStr
      .replace(/%/g, '%25')
      .replace(/ /g, '%20')
      .replace(/,/g, '%252C')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\|/g, '%7C');
    return `l_text:${fontName}_${wm.font_size}:${encodedText},co_rgb:${wm.text_color.replace('#', '')},o_${opacity}`;
  }

  if (wm.type === 'logo' && wm.logo_url) {
    const logoOverlay = extractLogoOverlay(wm.logo_url);
    if (logoOverlay) {
      return `l_${logoOverlay},o_${opacity}`;
    }
  }

  return '';
}

function buildWatermarkPostfix(wm: WatermarkConfig): string {
  const positionMap: Record<string, string> = {
    bottom_right: 'se',
    bottom_left: 'sw',
    top_right: 'ne',
    top_left: 'nw',
    center: 'center',
  };
  const gravity = positionMap[wm.position] || 'se';
  const margin = wm.margin || 20;
  const rotation = wm.rotation || 0;

  let postfix = `g_${gravity},x_${margin},y_${margin},fl_layer_apply`;
  if (rotation !== 0) {
    postfix = `a_${rotation},${postfix}`;
  }
  return postfix;
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

function buildWatermarkTransform(wm: WatermarkConfig, adId?: number) {
  const transforms: Record<string, unknown>[] = [];
  const opacity = Math.round((wm.opacity / 100) * 100);
  const positionMap: Record<string, string> = {
    bottom_right: 'se',
    bottom_left: 'sw',
    top_right: 'ne',
    top_left: 'nw',
    center: 'center',
  };
  const gravity = positionMap[wm.position] || 'se';

  if (wm.type === 'text') {
    let textStr = wm.text;
    if (wm.show_ad_id && adId) {
      textStr += ` | Ad ID: ${adId}`;
    }
    const fontName = resolveFontFamily(wm.font_family || 'arial').replace(/%20/g, '_');
    const encodedText = textStr
      .replace(/,/g, '\\,')
      .replace(/\n/g, ' ');

    const transform: Record<string, unknown> = {
      overlay: {
        font_family: fontName.replace(/_/g, ' '),
        font_size: wm.font_size,
        text: encodedText,
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
    transforms.push(transform);
  } else if (wm.type === 'logo' && wm.logo_url) {
    const logoOverlay = extractLogoOverlay(wm.logo_url);
    if (logoOverlay) {
      const transform: Record<string, unknown> = {
        overlay: logoOverlay,
        opacity,
        gravity,
        x: wm.margin,
        y: wm.margin,
      };
      if (wm.rotation) {
        transform.angle = wm.rotation;
      }
      transforms.push(transform);
    }
  }

  return transforms.length > 0 ? transforms : undefined;
}

/**
 * Build a watermark overlay string to append to a Cloudinary URL transformation.
 * This is used for optimized and thumbnail URLs so they include the watermark.
 */
function buildWatermarkUrlTransform(wm: WatermarkConfig, adId?: number): string {
  const overlay = buildWatermarkOverlayUrl(wm, adId);
  if (!overlay) return '';
  const postfix = buildWatermarkPostfix(wm);
  return `${overlay},${postfix}`;
}

/**
 * Return optimized URL with watermark overlay included.
 */
function getWatermarkedOptimizedUrl(
  publicId: string,
  wm: WatermarkConfig,
  wmTransform: string,
  options?: { width?: number; height?: number; crop?: string; gravity?: string }
): string {
  const base = getOptimizedImageUrl(publicId, options);
  if (!wmTransform) return base;

  const uploadIdx = base.indexOf('/image/upload/');
  if (uploadIdx === -1) return base;
  const markerLen = '/image/upload/'.length;
  const afterUpload = base.slice(uploadIdx + markerLen);

  const existingTransforms = afterUpload.split('/');
  const publicIdFromUrl = existingTransforms.pop() || publicId;

  const parts: string[] = [];
  const wmParts = wmTransform.split(',');
  const existingParts = existingTransforms.length > 0
    ? existingTransforms[0].split(',')
    : [];

  const seen = new Set<string>();
  for (const p of wmParts) {
    const key = p.split('_')[0];
    if (!seen.has(key)) {
      parts.push(p);
      seen.add(key);
    }
  }
  for (const p of existingParts) {
    const key = p.split('_')[0];
    if (!seen.has(key)) {
      parts.push(p);
      seen.add(key);
    }
  }

  const baseUrl = base.slice(0, uploadIdx + markerLen);
  return `${baseUrl}${parts.join(',')}/${publicIdFromUrl}`;
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
    const watermarkUrlTransform = watermark ? buildWatermarkUrlTransform(watermark, adId) : '';

    const uploadPromises = files.map(async (file) => {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
      }

      if (file.size > maxSize) {
        throw new Error(`File ${file.name} exceeds 10MB limit`);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const publicId = `ad_${Date.now()}_${Math.random().toString(36).substring(7)}`;

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
        optimized_url: watermark
          ? getWatermarkedOptimizedUrl(result.public_id, watermark!, watermarkUrlTransform)
          : getOptimizedImageUrl(result.public_id),
        thumbnail_url: watermark
          ? getWatermarkedOptimizedUrl(result.public_id, watermark!, watermarkUrlTransform, {
              width: 400,
              height: 300,
              crop: 'fill',
              gravity: 'auto',
            })
          : getOptimizedImageUrl(result.public_id, {
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
