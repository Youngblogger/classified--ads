const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const config = {
  api: {
    baseUrl: supabaseUrl,
    backendUrl: supabaseUrl,
    timeout: 30000,
    retryCount: 2,
  },
  app: {
    url: appUrl,
    name: 'iList',
  },
  images: {
    cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dcklcvihq',
    fallback: '/placeholder-image.svg',
    maxUploadSize: 5 * 1024 * 1024,
    compressionEnabled: process.env.NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION !== 'false',
  },
  pagination: {
    adsPerPage: parseInt(process.env.NEXT_PUBLIC_ADS_PER_PAGE || '12', 10),
  },
  production: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',
};

export const API_URL = config.api.baseUrl;
export const BACKEND_URL = config.api.backendUrl;
export const CLOUDINARY_CLOUD_NAME = config.images.cloudinaryCloudName;
export const FALLBACK_IMAGE = config.images.fallback;
export const ADS_PER_PAGE = config.pagination.adsPerPage;
