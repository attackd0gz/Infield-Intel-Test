'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Profile } from '@/types'

export function NavbarUser() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, bio, role, badge_level, points, review_count, photo_count, helpful_votes, player_type, age_group, favorite_teams, onboarding_complete, created_at')
          .eq('id', user.id)
          .single()
        setProfile(data)
      } else {
        setProfile(null)
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null)
        setLoading(false)
      } else {
        getUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)   // clear UI immediately — don't wait for onAuthStateChange
    router.push('/')
    router.refresh()
  }

  if (loading) return <div className="w-20 h-8 rounded bg-muted animate-pulse" />

  if (!profile) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => router.push('/login')}>Log in</Button>
        <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold" onClick={() => router.push('/signup')}>Sign up</Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback>
            {(profile.full_name ?? profile.username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden sm:block">
          {profile.full_name ?? profile.username}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">{profile.badge_level}</p>
          <p className="text-xs font-medium">{profile.points.toLocaleString()} pts</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/profile/${profile.username}`)}>
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/profile/edit')}>
          Edit Profile
        </DropdownMenuItem>
        {profile.role === 'admin' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/admin')}>
              Admin Panel
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
