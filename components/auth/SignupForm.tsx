'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export function SignupForm() {
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!agreed) {
      toast.error('You must accept the Terms of Service and Privacy Policy to continue.')
      return
    }

    setLoading(true)
    const form = new FormData(e.currentTarget)
    const password = form.get('password') as string
    const confirm = form.get('confirm') as string

    if (password !== confirm) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.get('email') as string,
      password,
      options: {
        data: {
          full_name: form.get('full_name') as string,
          username: (form.get('email') as string).split('@')[0],
          terms_accepted_at: new Date().toISOString(),
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setDone(true)
  }

  async function handleGoogleSignup() {
    if (!agreed) {
      toast.error('You must accept the Terms of Service and Privacy Policy to continue.')
      return
    }
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  if (done) {
    return (
      <div className="text-center space-y-2 p-6 border rounded-lg">
        <p className="font-semibold">Check your email</p>
        <p className="text-muted-foreground text-sm">
          We sent a confirmation link to your inbox. Click it to activate your account.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignup}
        disabled={googleLoading}
      >
        {googleLoading ? 'Redirecting...' : 'Sign up with Google'}
      </Button>

      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" type="text" required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" name="confirm" type="password" required autoComplete="new-password" />
        </div>

        {/* Terms acceptance */}
        <div className="flex items-start gap-3 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary cursor-pointer"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
            I agree to the{' '}
            <Link
              href="/terms"
              target="_blank"
              className="font-semibold text-foreground underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              target="_blank"
              className="font-semibold text-foreground underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={loading || !agreed}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </div>
  )
}
