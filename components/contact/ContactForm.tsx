'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle } from 'lucide-react'

const SUBJECTS = [
  'General Question',
  'Report a Bug',
  'Claim a Complex Listing',
  'Partnership Inquiry',
  'Other',
]

export function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase.from('contact_messages').insert({
      name: form.get('name') as string,
      email: form.get('email') as string,
      subject: form.get('subject') as string,
      message: form.get('message') as string,
    })

    if (error) {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle className="h-12 w-12 text-green-600" />
        <h2 className="text-xl font-bold tracking-wide uppercase">Message Sent</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Thanks for reaching out. We&apos;ll get back to you as soon as we can.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required autoComplete="name" placeholder="Your name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <select
          id="subject"
          name="subject"
          required
          defaultValue=""
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="" disabled>Select a subject…</option>
          {SUBJECTS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={20}
          rows={5}
          placeholder="Tell us what's on your mind…"
        />
      </div>

      <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
        {loading ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
