import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/profile/edit',
          '/owner/',
          '/welcome',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
