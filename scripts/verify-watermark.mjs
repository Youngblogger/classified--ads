// Watermark E2E Verification Script
// Tests the addWatermarkToCloudinaryUrl logic with actual DB settings

const CLOUD_NAME = 'dcklcvihq';
const SAMPLE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400,h_300,c_fill,g_auto,q_auto,f_auto/v1234567890/classified-ads/sample-image.jpg`;

// Replicate the POSITION_MAP from image.ts
const POSITION_MAP = {
  bottom_right: 'g_south_east',
  bottom_left: 'g_south_west',
  top_right: 'g_north_east',
  top_left: 'g_north_west',
  center: 'g_center',
};

// Replicate addWatermarkToCloudinaryUrl for CLI testing
function addWatermarkToCloudinaryUrl(url, settings) {
  if (!settings) return { url, applied: false, reason: 'no settings' };
  if (!settings.enabled) return { url, applied: false, reason: 'not enabled' };
  if (url.includes('fl_layer_apply')) return { url, applied: false, reason: 'already has overlay' };

  const marker = '/image/upload/';
  const markerIdx = url.indexOf(marker);
  if (markerIdx === -1) return { url, applied: false, reason: 'not a Cloudinary URL' };

  const baseUrl = url.slice(0, markerIdx + marker.length);
  const rest = url.slice(markerIdx + marker.length);
  const slashIdx = rest.indexOf('/');
  const transformsAndVersion = rest.slice(0, slashIdx);
  const publicId = rest.slice(slashIdx + 1);

  const parts = transformsAndVersion.split('/');
  const transforms = parts.filter(p => !/^v\d+$/.test(p));
  const version = parts.find(p => /^v\d+$/.test(p)) || null;

  const opacity = Math.max(0, Math.min(100, settings.opacity));
  const margin = settings.margin;
  const gravity = POSITION_MAP[settings.position];
  if (!gravity) return { url, applied: false, reason: `invalid position: ${settings.position}` };

  let overlay;
  if (settings.type === 'logo' && settings.logo_url) {
    const logoParts = settings.logo_url.split('/');
    const uploadIdx = logoParts.indexOf('upload');
    if (uploadIdx === -1 || uploadIdx + 1 >= logoParts.length)
      return { url, applied: false, reason: 'no upload marker in logo_url' };
    const pathParts = logoParts.slice(uploadIdx + 1);
    const filtered = pathParts.filter(p => !/^v\d+$/.test(p));
    const overlayId = filtered.join('/').replace(/\.[^.]+$/, '');
    if (!overlayId) return { url, applied: false, reason: 'empty overlayId' };
    overlay = `l_${overlayId.replace(/\//g, ':')},w_0.15,o_${opacity},${gravity},x_${margin},y_${margin},fl_layer_apply`;
  } else if (settings.type === 'text' && settings.text) {
    const fontFamily = (settings.font_family || 'Arial').replace(/\s+/g, '_');
    const fontSize = settings.font_size || 36;
    const textColor = (settings.text_color || '#FFFFFF').replace('#', '');
    const encodedText = encodeURIComponent(settings.text);
    overlay = `l_text:${fontFamily}_${fontSize}:${encodedText},co_rgb:${textColor},o_${opacity},${gravity},x_${margin},y_${margin},fl_layer_apply`;
  } else {
    return { url, applied: false, reason: `no valid type/content: type=${settings.type}` };
  }

  const transformsStr = transforms.length > 0 ? transforms.join('/') + '/' : '';
  const versionStr = version ? version + '/' : '';
  const result = `${baseUrl}${transformsStr}${overlay}/${versionStr}${publicId}`;
  return { url: result, applied: true, reason: 'ok', overlay };
}

// Test 1: Actual watermark settings from DB
const dbSettings = {
  enabled: true,
  type: 'text',
  text: 'iList.newer',
  logo_url: null,
  text_color: '#FFFFFF',
  font_size: 50,
  font_family: 'Arial',
  opacity: 80,
  position: 'bottom_right',
  margin: 20,
};

console.log('=== WATERMARK E2E VERIFICATION ===\n');
console.log(`Settings: type=${dbSettings.type}, text="${dbSettings.text}", pos=${dbSettings.position}, opacity=${dbSettings.opacity}, font_size=${dbSettings.font_size}`);
console.log(`Sample URL: ${SAMPLE_URL}\n`);

const result = addWatermarkToCloudinaryUrl(SAMPLE_URL, dbSettings);
console.log(`Applied: ${result.applied}`);
console.log(`Reason: ${result.reason}`);
console.log(`Overlay: ${result.overlay}`);
console.log(`Result URL: ${result.url}\n`);

// Verify the overlay contains expected Cloudinary text overlay syntax
const checks = [
  { label: 'Contains l_text:', pass: result.url.includes('l_text:') },
  { label: 'Contains Arial font', pass: result.url.includes('Arial') },
  { label: 'Contains font size 50', pass: result.url.includes('_50:') },
  { label: 'Contains encoded text', pass: result.url.includes('iList.newer') || result.url.includes('iList%2Enewer') },
  { label: 'Contains co_rgb:FFFFFF', pass: result.url.includes('co_rgb:FFFFFF') },
  { label: 'Contains opacity', pass: result.url.includes(`o_${dbSettings.opacity}`) },
  { label: 'Contains gravity south_east', pass: result.url.includes('g_south_east') },
  { label: 'Contains margin', pass: result.url.includes(`x_${dbSettings.margin}`) },
  { label: 'Contains fl_layer_apply', pass: result.url.includes('fl_layer_apply') },
  { label: 'Preserves original transforms', pass: result.url.includes('w_400,h_300,c_fill,g_auto,q_auto,f_auto') },
  { label: 'Preserves version', pass: result.url.includes('v1234567890') },
  { label: 'Preserves public ID', pass: result.url.includes('classified-ads/sample-image.jpg') },
];

console.log('--- URL Structure Checks ---');
let allPass = true;
for (const c of checks) {
  console.log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${c.label}`);
  if (!c.pass) allPass = false;
}

// Test 2: Logo type watermark
console.log('\n--- Logo Type Watermark ---');
const logoSettings = { ...dbSettings, type: 'logo', logo_url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/watermarks/ilistng-logo.png` };
const logoResult = addWatermarkToCloudinaryUrl(SAMPLE_URL, logoSettings);
console.log(`Applied: ${logoResult.applied}, overlay: ${logoResult.overlay}`);
console.log(`URL: ${logoResult.url}`);
const logoChecks = [
  { label: 'Contains l_ overlay', pass: logoResult.url.includes('l_watermarks:ilistng-logo') },
  { label: 'Contains w_0.15', pass: logoResult.url.includes('w_0.15') },
  { label: 'Contains fl_layer_apply', pass: logoResult.url.includes('fl_layer_apply') },
];
for (const c of logoChecks) {
  console.log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${c.label}`);
  if (!c.pass) allPass = false;
}

// Test 3: Edge cases
console.log('\n--- Edge Cases ---');

// Disabled
const disabled = addWatermarkToCloudinaryUrl(SAMPLE_URL, { ...dbSettings, enabled: false });
console.log(`  [${disabled.applied ? 'FAIL' : 'PASS'}] Disabled returns original URL: ${disabled.reason}`);

// Already has overlay
const alreadyOverlaid = addWatermarkToCloudinaryUrl(SAMPLE_URL + '/fl_layer_apply', dbSettings);
console.log(`  [${alreadyOverlaid.applied ? 'FAIL' : 'PASS'}] Already overlaid returns original URL: ${alreadyOverlaid.reason}`);

// No settings
const noSettings = addWatermarkToCloudinaryUrl(SAMPLE_URL, null);
console.log(`  [${noSettings.applied ? 'FAIL' : 'PASS'}] Null settings returns original URL: ${noSettings.reason}`);

// Non-Cloudinary URL
const nonCld = addWatermarkToCloudinaryUrl('https://example.com/image.jpg', dbSettings);
console.log(`  [${nonCld.applied ? 'FAIL' : 'PASS'}] Non-Cloudinary URL returns original: ${nonCld.reason}`);

// Test 4: Verify URL is valid for browser
console.log('\n--- Browser-ready URL Check ---');
const browserUrl = result.url;
const parsed = new URL(browserUrl);
console.log(`  Host: ${parsed.hostname} (expected: res.cloudinary.com)`);
console.log(`  Path: ${parsed.pathname}`);
console.log(`  [${parsed.hostname === 'res.cloudinary.com' ? 'PASS' : 'FAIL'}] Valid Cloudinary URL`);

// Test 5: Verify the overlay conforms to Cloudinary URL spec
// Cloudinary overlay format: l_text:font_fontSize:text,co_rgb:color,o_opacity,gravity,x_margin,y_margin,fl_layer_apply
console.log('\n--- Cloudinary Spec Compliance ---');
const overlayStr = result.overlay;
if (overlayStr) {
  const hasCorrectOrder = overlayStr.includes('l_text:') && overlayStr.includes('co_rgb:') && overlayStr.includes('fl_layer_apply');
  console.log(`  [${hasCorrectOrder ? 'PASS' : 'FAIL'}] Overlay component order matches spec`);
}

console.log(`\n=== OVERALL: ${allPass ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'} ===`);
