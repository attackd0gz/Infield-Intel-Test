'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Trophy, Search } from 'lucide-react'
import { NavbarUser } from './NavbarUser'
import { MobileMenu } from './MobileMenu'
import { LogoIcon } from '@/components/ui/LogoIcon'

const links = [
  { href: '/complexes',   label: 'Browse',      icon: Search },
  { href: '/map',         label: 'Map',          icon: Map    },
  { href: '/leaderboard', label: 'Leaderboard',  icon: Trophy },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-primary text-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <LogoIcon size={76} />
          <span
            className="hidden xs:block text-white text-xl font-bold tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Infield <span className="text-amber-400">Intel</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop user */}
        <div className="hidden md:flex items-center gap-2">
          <NavbarUser />
        </div>

        {/* Mobile hamburger — MobileMenu owns the Sheet */}
        <MobileMenu />
      </div>
    </header>
  )
}
