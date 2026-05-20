'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MailCheck } from 'lucide-react'

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/api/auth/callback?type=recovery`,
    })

    // Always show success — don't leak whether an email exists
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mx-auto">
          <MailCheck className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="font-bold text-lg">Check your inbox</p>
          <p className="text-sm text-muted-foreground mt-1">
            If <span className="font-medium text-foreground">{email}</span> is registered, you&apos;ll
            get a reset link shortly. Check your spam folder if it doesn&apos;t arrive.
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-sm"
          onClick={() => { setSent(false); setEmail('') }}
        >
          Try a different email
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  )
}
