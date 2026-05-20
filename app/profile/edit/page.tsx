import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import type { Profile } from '@/types'

export const metadata = { title: 'Edit Profile' }

export default async function EditProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-wide uppercase">Edit Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Update your public profile information.</p>
      </div>
      <EditProfileForm profile={profile as Profile} />
    </div>
  )
}
