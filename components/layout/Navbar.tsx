'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, Map, Trophy, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NavbarUser } from './NavbarUser'
import { LogoIcon } from '@/components/ui/LogoIcon'

export function Navbar() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/complexes', label: 'Browse', icon: Search },
    { href: '/map', label: 'Map', icon: Map },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-primary text-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoIcon size={38} />
          <span className="text-white text-xl font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
            Infield <span className="text-amber-400">Intel</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <NavbarUser />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-primary text-white border-white/10">
            <div className="flex items-center gap-2.5 mb-8">
              <LogoIcon size={34} />
              <span className="text-white text-lg font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
                Infield <span className="text-amber-400">Intel</span>
              </span>
            </div>
            <nav className="flex flex-col gap-1">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
              <hr className="border-white/10 my-3" />
              <NavbarUser />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
