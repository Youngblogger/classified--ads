// =====================================================
//  SINGLE SOURCE OF TRUTH — Watermark configuration
//  All watermark behavior is driven from the DB table
//  `watermark_settings`. This file provides the shared
//  interface, defaults, and runtime lookup maps.
// =====================================================

// --- Shared type -----------------------------------------------------------

export interface WatermarkSettings {
  enabled: boolean;
  type: 'text' | 'logo';
  text: string;
  logo_url: string | null;
  text_color: string;
  shadow_color: string;
  shadow_opacity: number;
  position: string;
  opacity: number;
  font_size: number;
  font_family: string;
  font_path: string | null;
  margin: number;
  rotation: number;
  logo_scale: number;
  show_ad_id: boolean;
  apply_to_original: boolean;
  apply_to_medium: boolean;
  apply_to_thumbnail: boolean;
}

// --- Canonical defaults (mirrors DB schema defaults) -----------------------
// Used as fallback when no DB row exists. All pipeline code reads
// run-time DB values only — these defaults exist solely for the
// initial-form state and the API fallback response.

export const DEFAULT_WATERMARK_SETTINGS: WatermarkSettings = {
  enabled: false,
  type: 'text',
  text: 'iList',
  logo_url: null,
  text_color: '#FFFFFF',
  shadow_color: '#000000',
  shadow_opacity: 50,
  position: 'bottom_right',
  opacity: 80,
  font_size: 36,
  font_family: 'Arial',
  font_path: null,
  margin: 20,
  rotation: 0,
  logo_scale: 0.15,
  show_ad_id: true,
  apply_to_original: true,
  apply_to_medium: true,
  apply_to_thumbnail: false,
};

// --- Cloudinary gravity lookup ---------------------------------------------

export const POSITION_MAP: Record<string, string> = {
  bottom_right: 'g_south_east',
  bottom_left: 'g_south_west',
  top_right: 'g_north_east',
  top_left: 'g_north_west',
  center: 'g_center',
};

// --- Cloudinary-supported fonts for text overlays --------------------------

export const CLOUDINARY_SUPPORTED_FONTS = new Set([
  'Arial', 'Arial Black', 'Verdana', 'Georgia', 'Impact',
  'Times New Roman', 'Courier New', 'Comic Sans MS', 'Trebuchet MS',
  'Lucida Console', 'Open Sans', 'Roboto', 'Lato', 'Montserrat',
  'Noto Sans', 'Poppins', 'Raleway', 'Ubuntu', 'PT Sans',
]);

// --- Runtime config type for Sharp pipeline (subset used by upload route) ---

export type WatermarkConfig = Pick<
  WatermarkSettings,
  'enabled' | 'type' | 'text' | 'logo_url' | 'text_color' | 'position' |
  'opacity' | 'font_size' | 'font_family' | 'margin' | 'rotation' | 'logo_scale' | 'show_ad_id'
>;

// --- Font resolution map (server-side Sharp / regeneration) ----------------

const FONT_MAP: Record<string, string> = {
  arial: 'Arial',
  arial_black: 'Arial Black',
  algerian: 'Algerian',
  castellar: 'Castellar',
  gill_sans_ultra: 'Gill Sans Ultra Bold',
  imprint_mt_shadow: 'Imprint MT Shadow',
  century_gothic: 'Century Gothic',
  rockwell: 'Rockwell',
  copperplate: 'Copperplate',
  impact: 'Impact',
  georgia: 'Georgia',
  times_new_roman: 'Times New Roman',
  verdana: 'Verdana',
  tahoma: 'Tahoma',
  trebuchet_ms: 'Trebuchet MS',
  courier_new: 'Courier New',
  comic_sans_ms: 'Comic Sans MS',
  lucida_console: 'Lucida Console',
  palatino: 'Palatino Linotype',
  book_antiqua: 'Book Antiqua',
  garamond: 'Garamond',
};

export function resolveFontFamily(value: string): string {
  if (!value) return '';
  return FONT_MAP[value] || value.replace(/_/g, ' ');
}
