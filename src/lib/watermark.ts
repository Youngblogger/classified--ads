import { supabase } from '@/lib/supabase';

interface WatermarkSettings {
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
  apply_to_original: boolean;
  apply_to_medium: boolean;
  apply_to_thumbnail: boolean;
}

let cachedSettings: WatermarkSettings | null = null;
let lastFetch = 0;

export async function getWatermarkSettings(): Promise<WatermarkSettings | null> {
  if (cachedSettings && Date.now() - lastFetch < 30000) return cachedSettings;
  try {
    const { data, error } = await supabase
      .from('watermark_settings')
      .select('*')
      .eq('id', 'default')
      .single();
    if (!error && data) {
      cachedSettings = data as WatermarkSettings;
      lastFetch = Date.now();
      return cachedSettings.enabled ? cachedSettings : null;
    }
  } catch {}
  return null;
}

export function clearWatermarkCache() {
  cachedSettings = null;
  lastFetch = 0;
}

/**
 * Apply watermark overlay transformation to a Cloudinary image URL.
 * Uses image-based overlay (l_{logoPublicId}) — NO l_text, NO font rendering.
 * If settings specify 'text' type or no logo_url is provided, watermark is skipped.
 */
export function applyWatermarkToUrl(url: string, wm: WatermarkSettings, _adId?: number): string {
  if (!url || !wm.enabled) return url;
  if (!wm.apply_to_original && !wm.apply_to_medium && !wm.apply_to_thumbnail) return url;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return url;

  const uploadIndex = url.indexOf('/image/upload/');
  if (uploadIndex === -1) return url;
  const markerLen = '/image/upload/'.length;
  const afterUpload = url.slice(uploadIndex + markerLen);
  const baseUrl = url.slice(0, uploadIndex + markerLen);

  let logoPath: string | null = null;

  if (wm.type === 'logo' && wm.logo_url) {
    const parts = wm.logo_url.split('/');
    const folderIdx = parts.indexOf('upload') + 1;
    if (folderIdx > 0 && folderIdx < parts.length) {
      logoPath = parts.slice(folderIdx).join('/').replace(/\.[^.]+$/, '');
    }
  }

  if (!logoPath) return url;

  const opacity = Math.round((wm.opacity / 100) * 100);
  const positionMap: Record<string, string> = {
    bottom_right: 'se',
    bottom_left: 'sw',
    top_right: 'ne',
    top_left: 'nw',
    center: 'center',
  };
  const gravity = positionMap[wm.position] || 'se';
  const margin = wm.margin || 20;

  const wmTransform = `l_${logoPath.replace(/\//g, ':')},w_0.15,o_${opacity},g_${gravity},x_${margin},y_${margin},fl_layer_apply`;

  const existingTransforms = afterUpload.split('/');
  const publicIdParts: string[] = [];
  let foundPublicId = false;
  for (const part of existingTransforms) {
    if (foundPublicId) {
      publicIdParts.push(part);
    } else if (part.includes('.')) {
      publicIdParts.push(part);
      foundPublicId = true;
    } else if (!part.includes('_')) {
      publicIdParts.push(part);
      foundPublicId = true;
    }
  }
  const publicId = publicIdParts.join('/');

  return `${baseUrl}${wmTransform}/${publicId}`;
}
