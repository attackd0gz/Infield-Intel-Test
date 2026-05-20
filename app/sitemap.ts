import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { siteUrl } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl,                    lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${siteUrl}/complexes`,     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${siteUrl}/leaderboard`,   lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${siteUrl}/map`,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${siteUrl}/contact`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${siteUrl}/privacy`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/terms`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Dynamic complex routes
  const { data: complexes } = await supabase
    .from('complexes')
    .select('id, created_at')
    .order('created_at', { ascending: false })

  const complexRoutes: MetadataRoute.Sitemap = (complexes ?? []).map(c => ({
    url: `${siteUrl}/complexes/${c.id}`,
    lastModified: new Date(c.created_at),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  // Dynamic profile routes
  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, created_at')
    .order('points', { ascending: false })
    .limit(500) // cap to top reviewers

  const profileRoutes: MetadataRoute.Sitemap = (profiles ?? []).map(p => ({
    url: `${siteUrl}/profile/${p.username}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...complexRoutes, ...profileRoutes]
}
