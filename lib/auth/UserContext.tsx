'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface UserContextValue {
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  loading: true,
  signOut: async () => {},
})

const PROFILE_SELECT =
  'id, username, full_name, avatar_url, bio, role, badge_level, points, ' +
  'review_count, photo_count, helpful_votes, player_type, age_group, ' +
  'favorite_teams, onboarding_complete, created_at'

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function loadProfile(session: Session | null) {
      if (!session?.user) {
        setProfile(null)
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select(PROFILE_SELECT)
        .eq('id', session.user.id)
        .single()
      setProfile(data as Profile | null)
      setLoading(false)
    }

    // onAuthStateChange fires INITIAL_SESSION immediately with the current
    // session from local storage — no network call to /auth/v1/user needed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setLoading(false)
        } else if (
          event === 'INITIAL_SESSION' ||
          event === 'SIGNED_IN' ||
          event === 'USER_UPDATED'
        ) {
          // session is already verified locally — fetch profile from DB
          loadProfile(session)
        }
        // TOKEN_REFRESHED: JWT rotated but profile unchanged — skip
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
    window.location.href = '/'
  }

  return (
    <UserContext.Provider value={{ profile, loading, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
