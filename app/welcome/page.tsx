import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from '@/components/onboarding/OnboardingForm'
import { LogoIcon } from '@/components/ui/LogoIcon'
import type { Profile } from '@/types'

export const metadata = { title: 'Welcome' }

export default async function WelcomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signup')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/signup')

  // Already onboarded — send them home
  if (profile.onboarding_complete) redirect('/')

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-zinc-50">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoIcon size={64} />
          </div>
          <h1 className="text-3xl font-bold tracking-wide uppercase">
            Welcome to the dugout,{' '}
            <span className="text-primary">{profile.full_name?.split(' ')[0] ?? profile.username}</span>!
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Let&apos;s take 60 seconds to set up your baseball profile.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 sm:p-8">
          <OnboardingForm profile={profile as Profile} />
        </div>
      </div>
    </div>
  )
}
