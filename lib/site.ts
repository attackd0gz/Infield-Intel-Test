const FALLBACK_URL = 'https://infieldintel.com'

function resolvedSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL
  if (!raw) return FALLBACK_URL
  try {
    new URL(raw)   // validate — throws if not a fully-qualified URL
    return raw
  } catch {
    return FALLBACK_URL
  }
}

export const siteUrl = resolvedSiteUrl()

/** Default 1200×630 OG image used when a page has no specific cover photo */
export const defaultOgImage =
  'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=1200&h=630&q=80&auto=format&fit=crop'
