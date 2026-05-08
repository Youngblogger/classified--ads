import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/ads`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/auth/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/auth/register`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  return staticRoutes
}
