import Link from 'next/link'
import { LogoIcon } from '@/components/ui/LogoIcon'

const SOCIAL = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/infieldintel',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    viewBox: '0 0 24 24',
  },
  {
    label: 'X',
    href: 'https://x.com/infieldintel',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    viewBox: '0 0 24 24',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@infield.intel',
    path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.18 8.18 0 0 0 4.83 1.54V6.78a4.85 4.85 0 0 1-1.07-.09z',
    viewBox: '0 0 24 24',
  },
]

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-white">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand col */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <LogoIcon size={44} />
              <span
                className="text-white text-xl font-bold tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                Infield <span className="text-amber-400">Intel</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Real reviews from real players and families. Discover baseball
              complexes, check amenities, and share your experience.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-1">
              {SOCIAL.map(({ label, href, path, viewBox }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-amber-500 transition-colors"
                >
                  <svg viewBox={viewBox} className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>

            <p className="text-white/30 text-xs mt-auto">
              &copy; {new Date().getFullYear()} Infield Intel. All rights reserved.
            </p>
          </div>

          {/* Explore col */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-1">
              Explore
            </p>
            {[
              { href: '/complexes', label: 'Browse Complexes' },
              { href: '/map', label: 'Map View' },
              { href: '/leaderboard', label: 'Leaderboard' },
              { href: '/contact', label: 'Contact Us' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Account col */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-1">
              Account
            </p>
            {[
              { href: '/login', label: 'Log In' },
              { href: '/signup', label: 'Sign Up Free' },
              { href: '/signup?owner=1', label: 'Owner Account' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <span>Starting in San Antonio, TX — expanding soon.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
