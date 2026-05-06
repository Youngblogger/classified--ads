// cloudinaryTest.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary Configuration:');
console.log('- Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('- API Key:', process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'MISSING');
console.log('- API Secret:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'MISSING');
console.log('');

// Verify config
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('ERROR: Missing Cloudinary environment variables');
  console.error('Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in .env');
  process.exit(1);
}

const testImagePath = path.join(__dirname, 'testImage.jpg');

if (!fs.existsSync(testImagePath)) {
  console.error('ERROR: testImage.jpg not found in project root');
  process.exit(1);
}

console.log('Testing upload with optimizations (f_auto, q_auto)...');

// Test upload with automatic format and quality optimization
cloudinary.uploader.upload(testImagePath, {
  public_id: `test_upload_${Date.now()}`,
  folder: 'classified-ads',
  transformation: [
    { quality: 'auto' },
    { fetch_format: 'auto' },
  ],
  resource_type: 'image',
})
  .then(result => {
    console.log('\n=== Upload Successful ===');
    console.log('Public ID:', result.public_id);
    console.log('Secure URL:', result.secure_url);
    console.log('Original URL:', result.url);
    console.log('Format:', result.format);
    console.log('Width:', result.width);
    console.log('Height:', result.height);
    console.log('Bytes:', result.bytes);
    console.log('');

    // Generate optimized URLs
    const optimizedUrl = cloudinary.url(result.public_id, {
      quality: 'auto',
      fetch_format: 'auto',
    });
    console.log('Optimized URL (f_auto, q_auto):', optimizedUrl);

    const thumbnailUrl = cloudinary.url(result.public_id, {
      width: 400,
      height: 300,
      crop: 'fill',
      gravity: 'auto',
      quality: '80',
      fetch_format: 'auto',
    });
    console.log('Thumbnail URL (400x300):', thumbnailUrl);

    console.log('\n=== Verification ===');
    console.log('Secure URL starts with https:', result.secure_url.startsWith('https'));
    console.log('URL contains cloudinary domain:', result.secure_url.includes('res.cloudinary.com'));
    console.log('Image uploaded successfully to Cloudinary dashboard');
  })
  .catch(error => {
    console.error('\n=== Upload Failed ===');
    console.error('Error:', error.message);
    process.exit(1);
  });
