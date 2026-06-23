import { resolveFontFamily } from '@/lib/watermark-defaults';
import type { WatermarkConfig } from '@/lib/watermark-defaults';

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

let _sharp: any = null;

async function getSharp(): Promise<any> {
  if (_sharp) return _sharp;
  try {
    _sharp = (await import('sharp')).default;
    return _sharp;
  } catch {
    throw new Error('sharp module not available');
  }
}

export async function applyWatermarkSharp(
  buffer: Buffer,
  wm: WatermarkConfig,
  adId?: number
): Promise<Buffer> {
  if (wm.type !== 'text') return buffer;

  const sharp = await getSharp();
  const meta = await sharp(buffer).metadata();
  const w = meta.width || 800;
  const h = meta.height || 600;

  let text = wm.text;
  if (wm.show_ad_id && adId) {
    text += ` | Ad ID: ${adId}`;
  }

  const svg = buildTextOverlaySvg(
    text,
    resolveFontFamily(wm.font_family),
    wm.font_size,
    wm.text_color,
    wm.opacity / 100,
    wm.position,
    wm.margin,
    wm.rotation,
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

  const sharp = await getSharp();
  const meta = await sharp(buffer).metadata();
  const w = meta.width || 800;
  const h = meta.height || 600;

  const logoBuffer = await fetchLogo(wm.logo_url);
  const logoMeta = await sharp(logoBuffer).metadata();
  const logoW = logoMeta.width || 1;
  const logoH = logoMeta.height || 1;
  const scale = wm.logo_scale ?? 0.15;
  const maxLogoW = Math.round(w * scale);
  const maxLogoH = Math.round(h * scale);
  const logoResized = (logoW > maxLogoW || logoH > maxLogoH)
    ? await sharp(logoBuffer).resize(maxLogoW, maxLogoH, { fit: 'outside', withoutEnlargement: true, kernel: 'lanczos3' }).toBuffer()
    : logoBuffer;

  const resizedMeta = await sharp(logoResized).metadata();
  const resizedW = resizedMeta.width || logoW;
  const resizedH = resizedMeta.height || logoH;

  const margin = wm.margin;
  let left: number, top: number;

  switch (wm.position) {
    case 'bottom_left':
      left = margin;
      top = h - margin - resizedH;
      break;
    case 'top_right':
      left = w - margin - resizedW;
      top = margin;
      break;
    case 'top_left':
      left = margin;
      top = margin;
      break;
    case 'center':
      left = (w - resizedW) / 2;
      top = (h - resizedH) / 2;
      break;
    default:
      left = w - margin - resizedW;
      top = h - margin - resizedH;
  }

  const logoWithAlpha = await applyOpacity(sharp, logoResized, wm.opacity / 100);

  return sharp(buffer)
    .composite([{ input: logoWithAlpha, top: Math.round(top), left: Math.round(left) }])
    .toBuffer();
}

async function applyOpacity(sharp: any, buf: Buffer, factor: number): Promise<Buffer> {
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
