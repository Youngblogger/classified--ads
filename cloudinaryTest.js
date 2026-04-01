// cloudinaryTest.js
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dcklcvihq',
  api_key: '555892159851476',
  api_secret: 'GgrMlKkydfZYpJnFkrqOBfgvi_I',
});

// Test upload using a local image
cloudinary.uploader.upload('testImage.jpg', { public_id: 'test_upload' })
  .then(result => console.log('Upload successful:', result.secure_url))
  .catch(error => console.error('Cloudinary setup error:', error));