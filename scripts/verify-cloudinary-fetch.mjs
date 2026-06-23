// Verify that watermarked Cloudinary URLs actually resolve
import https from 'https';
import http from 'http';

// Real ad images from DB (the most recent ones)
const REAL_URLS = [
  'https://res.cloudinary.com/dcklcvihq/image/upload/v1782078337/classified-ads/ad_1782146715653_51qqjw.jpg',
  'https://res.cloudinary.com/dcklcvihq/image/upload/v1782074115/classified-ads/ad_1782142494023_s9tov.jpg',
  'https://res.cloudinary.com/dcklcvihq/image/upload/v1782071516/classified-ads/ad_1782139897119_tby9af.jpg',
];

// Settings from DB
const SETTINGS = {
  enabled: true,
  type: 'text',
  text: 'iList.newer',
  text_color: '#FFFFFF',
  font_size: 50,
  font_family: 'Arial',
  opacity: 80,
  position: 'bottom_right',
  margin: 20,
};

function addWatermark(url) {
  const settings = SETTINGS;
  const marker = '/image/upload/';
  const idx = url.indexOf(marker);
  const baseUrl = url.slice(0, idx + marker.length);
  const rest = url.slice(idx + marker.length);
  const slashIdx = rest.indexOf('/');
  const twv = rest.slice(0, slashIdx);
  const pubId = rest.slice(slashIdx + 1);
  const parts = twv.split('/');
  const transforms = parts.filter(p => !/^v\d+$/.test(p));
  const version = parts.find(p => /^v\d+$/.test(p)) || null;
  const tStr = transforms.length > 0 ? transforms.join('/') + '/' : '';
  const vStr = version ? version + '/' : '';
  const encodedText = encodeURIComponent(settings.text);
  const textColor = settings.text_color.replace('#', '');
  const overlay = `l_text:${settings.font_family}_${settings.font_size}:${encodedText},co_rgb:${textColor},o_${settings.opacity},g_south_east,x_${settings.margin},y_${settings.margin},fl_layer_apply`;
  return `${baseUrl}${tStr}${overlay}/${vStr}${pubId}`;
}

function fetchUrl(url, label) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http;
    const start = Date.now();
    const req = proto.get(url, { timeout: 15000 }, (res) => {
      let data = [];
      res.on('data', (chunk) => {
        data.push(chunk);
        // Stop after first 64KB to avoid large downloads
        if (Buffer.concat(data).length > 65536) {
          req.destroy();
        }
      });
      res.on('end', () => {
        const elapsed = Date.now() - start;
        const totalSize = Buffer.concat(data).length;
        resolve({
          label,
          status: res.statusCode,
          headers: res.headers,
          elapsed,
          size: totalSize,
          ok: res.statusCode >= 200 && res.statusCode < 400,
        });
      });
    });
    req.on('error', (err) => resolve({ label, status: 0, error: err.message, ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ label, status: 0, error: 'timeout', ok: false }); });
  });
}

async function main() {
  console.log('=== CLOUDINARY WATERMARK URL VERIFICATION ===\n');

  for (const original of REAL_URLS) {
    const watermarked = addWatermark(original);
    console.log(`Original: ${original.slice(0, 120)}`);
    console.log(`Watermarked: ${watermarked.slice(0, 160)}`);
    console.log('');

    // Fetch original
    const origResult = await fetchUrl(original, 'Original');
    console.log(`  [${origResult.ok ? 'OK' : 'FAIL'}] Original: HTTP ${origResult.status}, ${origResult.size} bytes, ${origResult.elapsed}ms`);

    // Fetch watermarked
    const wmResult = await fetchUrl(watermarked, 'Watermarked');
    console.log(`  [${wmResult.ok ? 'OK' : 'FAIL'}] Watermarked: HTTP ${wmResult.status}, ${wmResult.size} bytes, ${wmResult.elapsed}ms`);

    if (wmResult.headers && wmResult.headers['content-type']) {
      console.log(`  Content-Type: ${wmResult.headers['content-type']}`);
    }

    // Verify it's actually an image
    if (wmResult.ok && wmResult.headers) {
      const ct = (wmResult.headers['content-type'] || '').toLowerCase();
      if (ct.startsWith('image/')) {
        console.log('  [PASS] Response is an image');
      } else {
        console.log('  [FAIL] Response is NOT an image (content-type: ' + ct + ')');
      }
    }

    // Check if watermarked is same size (if Sharp compositing failed)
    // If Sharp compositing succeeded, the watermarked image would be baked into pixels
    // If Sharp compositing failed, the Cloudinary overlay is the ONLY watermark
    // The watermarked URL should differ from the original in size
    if (origResult.ok && wmResult.ok) {
      console.log(`  [INFO] Size diff: ${wmResult.size - origResult.size} bytes (expect different if overlay applied)`);
    }

    console.log('');
  }
}

main().catch(e => console.error('Script error:', e));
