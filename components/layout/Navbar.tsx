'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, Map, Trophy, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NavbarUser } from './NavbarUser'

export function Navbar() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/complexes', label: 'Browse', icon: Search },
    { href: '/map', label: 'Map', icon: Map },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-green-700">⚾</span>
          <span>Infield Intel</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="flex flex-col gap-4 mt-8">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
              <hr />
              <NavbarUser />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
