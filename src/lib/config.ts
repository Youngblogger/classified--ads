const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const config = {
  api: {
    baseUrl: apiUrl,
    backendUrl: apiUrl.replace('/api', ''),
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
  socket: {
    url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3006',
    enabled: process.env.NEXT_PUBLIC_ENABLE_SOCKET !== 'false',
  },
  production: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',
};

export const API_URL = config.api.baseUrl;
export const BACKEND_URL = config.api.backendUrl;
export const SOCKET_URL = config.socket.url;
export const CLOUDINARY_CLOUD_NAME = config.images.cloudinaryCloudName;
export const FALLBACK_IMAGE = config.images.fallback;
export const ADS_PER_PAGE = config.pagination.adsPerPage;
