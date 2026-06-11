import sharp from 'sharp';

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

export interface WatermarkConfig {
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

function resolveFont(value: string): string {
  return FONT_MAP[value] || value.replace(/_/g, ' ') || 'Arial';
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildTextOverlaySvg(
  text: string,
  fontFamily: string,
  fontSize: number,
  color: string,
  opacity: number,
  position: string,
  margin: number,
  rotation: number,
  w: number,
  h: number
): string {
  let x: number, y: number, anchor: string;

  switch (position) {
    case 'bottom_right':
      x = w - margin;
      y = h - margin;
      anchor = 'end';
      break;
    case 'bottom_left':
      x = margin;
      y = h - margin;
      anchor = 'start';
      break;
    case 'top_right':
      x = w - margin;
      y = margin + fontSize;
      anchor = 'end';
      break;
    case 'top_left':
      x = margin;
      y = margin + fontSize;
      anchor = 'start';
      break;
    case 'center':
      x = w / 2;
      y = h / 2;
      anchor = 'middle';
      break;
    default:
      x = w - margin;
      y = h - margin;
      anchor = 'end';
  }

  const rot = rotation ? ` transform="rotate(${rotation},${x},${y})"` : '';
  const escaped = escapeXml(text);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
<text x="${x}" y="${y}" font-family="${fontFamily}" font-size="${fontSize}" fill="${color}" opacity="${opacity}" text-anchor="${anchor}"${rot}>${escaped}</text>
</svg>`;
}

export async function applyWatermarkSharp(
  buffer: Buffer,
  wm: WatermarkConfig,
  adId?: number
): Promise<Buffer> {
  if (wm.type !== 'text') return buffer;

  const meta = await sharp(buffer).metadata();
  const w = meta.width || 800;
  const h = meta.height || 600;

  let text = wm.text;
  if (wm.show_ad_id && adId) {
    text += ` | Ad ID: ${adId}`;
  }

  const svg = buildTextOverlaySvg(
    text,
    resolveFont(wm.font_family || 'arial'),
    wm.font_size || 36,
    wm.text_color || '#FFFFFF',
    wm.opacity / 100,
    wm.position || 'bottom_right',
    wm.margin || 20,
    wm.rotation || 0,
    w,
    h,
  );

  return sharp(buffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toBuffer();
}

export async function applyLogoWatermarkSharp(
  buffer: Buffer,
  wm: WatermarkConfig,
  fetchLogo: (url: string) => Promise<Buffer>
): Promise<Buffer> {
  if (wm.type !== 'logo' || !wm.logo_url) return buffer;

  const meta = await sharp(buffer).metadata();
  const w = meta.width || 800;
  const h = meta.height || 600;

  const logoBuffer = await fetchLogo(wm.logo_url);
  const logoMeta = await sharp(logoBuffer).metadata();
  const maxLogoW = Math.round(w * 0.2);
  const logoResized = (logoMeta.width || 0) > maxLogoW
    ? await sharp(logoBuffer).resize(maxLogoW).toBuffer()
    : logoBuffer;

  const margin = wm.margin || 20;
  let left: number, top: number;

  switch (wm.position || 'bottom_right') {
    case 'bottom_left':
      left = margin;
      top = h - margin - (logoMeta.height || 100);
      break;
    case 'top_right':
      left = w - margin - maxLogoW;
      top = margin;
      break;
    case 'top_left':
      left = margin;
      top = margin;
      break;
    case 'center':
      left = (w - maxLogoW) / 2;
      top = (h - (logoMeta.height || 100)) / 2;
      break;
    default:
      left = w - margin - maxLogoW;
      top = h - margin - (logoMeta.height || 100);
  }

  const logoWithAlpha = await applyOpacity(logoResized, wm.opacity / 100);

  return sharp(buffer)
    .composite([{ input: logoWithAlpha, top: Math.round(top), left: Math.round(left) }])
    .toBuffer();
}

async function applyOpacity(buf: Buffer, factor: number): Promise<Buffer> {
  if (factor >= 1) return buf;
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const clamped = Math.max(0, Math.min(1, factor));
  for (let i = 3; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * clamped);
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}
