/** @type {import('next').NextConfig} */

const isProduction = process.env.NODE_ENV === 'production';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const backendHost = new URL(apiUrl).hostname;
const backendPort = new URL(apiUrl).port || '8000';
const backendOrigin = `${new URL(apiUrl).protocol}//${backendHost}${backendPort ? ':' + backendPort : ''}`;

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://connect.facebook.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://source.unsplash.com https://lh3.googleusercontent.com https://platform-lookaside.fbsbx.com ${backendOrigin} http://127.0.0.1:8000;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' ${backendOrigin} https://accounts.google.com;
  frame-src https://accounts.google.com https://connect.facebook.net;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  ${isProduction ? '' : 'upgrade-insecure-requests;'}
`;

const nextConfig = {
  reactStrictMode: !isProduction,
  eslint: {
    ignoreDuringBuilds: false,
  },
  poweredByHeader: false,
  compress: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/ad/ad-undefined',
        destination: '/',
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/**' },
    ],
    localPatterns: [
      { pathname: '/images/**' },
      { pathname: '/icons/**' },
    ],
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    unoptimized: isProduction ? false : false,
  },
  generateEtags: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
    scrollRestoration: true,
  },
};

module.exports = nextConfig;