import { supabase as anonSupabase, getServiceRoleClient } from '@/lib/supabase';
import type { WatermarkSettings } from '@/lib/watermark-defaults';

function getSb() {
  try {
    return getServiceRoleClient();
  } catch {
    return anonSupabase;
  }
}

function toNum(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function toStr(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function toBool(value: unknown): boolean {
  return Boolean(value);
}

export async function getActiveWatermarkSettings(): Promise<WatermarkSettings | null> {
  try {
    const sb = getSb() as any;
    const { data, error } = await sb
      .from('watermark_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('[WatermarkDB] No DB row found — watermark not configured');
      } else {
        console.warn('[WatermarkDB] Fetch error:', error.code, error.message);
      }
      return null;
    }

    const row = data as Record<string, unknown>;

    const settings: WatermarkSettings = {
      enabled: toBool(row.enabled),
      type: row.type === 'logo' ? 'logo' : 'text',
      text: toStr(row.text),
      logo_url: row.logo_url ? String(row.logo_url) : null,
      text_color: toStr(row.text_color),
      shadow_color: toStr(row.shadow_color),
      shadow_opacity: toNum(row.shadow_opacity),
      position: toStr(row.position),
      opacity: toNum(row.opacity),
      font_size: toNum(row.font_size),
      font_family: toStr(row.font_family),
      font_path: row.font_path ? String(row.font_path) : null,
      margin: toNum(row.margin),
      rotation: toNum(row.rotation),
      logo_scale: toNum(row.logo_scale),
      show_ad_id: toBool(row.show_ad_id),
      apply_to_original: toBool(row.apply_to_original),
      apply_to_medium: toBool(row.apply_to_medium),
      apply_to_thumbnail: toBool(row.apply_to_thumbnail),
    };

    console.log('[WatermarkDB] WATERMARK_SETTINGS_USED (DB only, no fallbacks):', JSON.stringify(settings, null, 0));

    return settings;
  } catch (e) {
    console.warn('[WatermarkDB] Settings unavailable:', (e as Error)?.message || e);
    return null;
  }
}

export { getSb };
