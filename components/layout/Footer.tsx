import Link from 'next/link'
import { LogoIcon } from '@/components/ui/LogoIcon'

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
