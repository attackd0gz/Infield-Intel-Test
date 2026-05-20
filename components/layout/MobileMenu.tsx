'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { LogoIcon } from '@/components/ui/LogoIcon'
import {
  Menu, Search, Map, Trophy, User, Pencil,
  ShieldCheck, LogOut, LogIn, UserPlus, Star,
} from 'lucide-react'
import type { Profile } from '@/types'

const NAV_LINKS = [
  { href: '/complexes', label: 'Browse Complexes', icon: Search },
  { href: '/map',       label: 'Map',              icon: Map    },
  { href: '/leaderboard', label: 'Leaderboard',    icon: Trophy },
]

export function MobileMenu() {
  const router   = useRouter()
  const pathname = usePathname()
  const [open, setOpen]       = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      } else {
        setProfile(null)
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-white hover:bg-white/10 transition-colors" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-72 p-0 bg-zinc-900 border-white/10 flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <LogoIcon size={32} />
          <span
            className="text-white text-base font-bold tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Infield <span className="text-amber-400">Intel</span>
          </span>
        </div>

        {/* User card */}
        {!loading && profile && (
          <div
            className="flex items-center gap-3 px-5 py-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => go(`/profile/${profile.username}`)}
          >
            <Avatar className="h-10 w-10 ring-2 ring-amber-400/40 shrink-0">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-white/10 text-white font-bold">
                {(profile.full_name ?? profile.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {profile.full_name ?? profile.username}
              </p>
              <p className="text-white/50 text-xs">
                {profile.badge_level} &middot; {profile.points.toLocaleString()} pts
              </p>
            </div>
          </div>
        )}

        {!loading && !profile && (
          <div className="flex flex-col gap-2 px-5 py-4 border-b border-white/10">
            <Button
              className="w-full"
              onClick={() => go('/login')}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Log in
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white"
              onClick={() => go('/signup')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Sign up free
            </Button>
          </div>
        )}

        {/* Main nav */}
        <nav className="flex flex-col px-3 py-3 border-b border-white/10">
          <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Explore
          </p>
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <button
              key={href}
              onClick={() => go(href)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left w-full"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Account nav (only when logged in) */}
        {profile && (
          <nav className="flex flex-col px-3 py-3 border-b border-white/10">
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
              Account
            </p>
            <button
              onClick={() => go(`/profile/${profile.username}`)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left w-full"
            >
              <User className="h-4 w-4 shrink-0" />
              My Profile
            </button>
            <button
              onClick={() => go('/profile/edit')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left w-full"
            >
              <Pencil className="h-4 w-4 shrink-0" />
              Edit Profile
            </button>
            <button
              onClick={() => go('/complexes')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left w-full"
            >
              <Star className="h-4 w-4 shrink-0" />
              Write a Review
            </button>
            {profile.role === 'admin' && (
              <button
                onClick={() => go('/admin')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10 transition-colors text-left w-full"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Admin Panel
              </button>
            )}
          </nav>
        )}

        {/* Sign out — pushed to bottom */}
        {profile && (
          <div className="mt-auto px-3 py-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-colors w-full text-left"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
