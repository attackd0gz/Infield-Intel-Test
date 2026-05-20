'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Shield, Settings, Clock } from 'lucide-react'

const ROLES = ['Owner', 'General Manager', 'Facility Manager', 'Head Coach', 'Other']

interface Props {
  complexId: string
  complexName: string
  ownerId: string | null
  currentUserId: string | null
  hasPendingClaim?: boolean
}

export function ClaimButton({ complexId, complexName, ownerId, currentUserId, hasPendingClaim }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [role, setRole] = useState('Owner')

  const isOwner = ownerId === currentUserId
  const isClaimed = ownerId !== null

  // Owner sees Manage button
  if (isOwner) {
    return (
      <a href={`/owner/${complexId}`}>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Manage Listing
        </Button>
      </a>
    )
  }

  // Claimed by someone else — nothing to show
  if (isClaimed) return null

  // Not logged in — nothing (write review button already handles this)
  if (!currentUserId) return null

  // Already submitted a claim — show pending badge
  if (hasPendingClaim && !submitted) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm font-medium">
        <Clock className="h-4 w-4" />
        Claim Pending Review
      </div>
    )
  }

  // Just submitted this session
  if (submitted) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm font-medium">
        <Clock className="h-4 w-4" />
        Claim Submitted — Pending Review
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase.from('claim_requests').insert({
      complex_id: complexId,
      user_id: currentUserId,
      contact_name: (form.get('contact_name') as string).trim(),
      contact_email: (form.get('contact_email') as string).trim(),
      contact_phone: (form.get('contact_phone') as string).trim() || null,
      role_at_complex: role,
      notes: (form.get('notes') as string).trim() || null,
    })

    if (error) {
      // Unique constraint = already submitted
      if (error.code === '23505') {
        toast.error('You have already submitted a claim for this complex.')
      } else {
        toast.error('Something went wrong: ' + error.message)
      }
      setLoading(false)
      return
    }

    setSubmitted(true)
    setOpen(false)
    toast.success('Claim submitted! We\'ll review it and be in touch shortly.')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" className="gap-2">
          <Shield className="h-4 w-4" />
          Claim This Listing
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-wide uppercase">Claim This Listing</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm">
            <p className="font-semibold text-primary mb-1">{complexName}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Fill out the form below and our team will verify your ownership before granting
              access. You&apos;ll be notified once your claim is reviewed — usually within
              1–2 business days.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact_name">Your Name</Label>
                <Input id="contact_name" name="contact_name" required autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_phone">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input id="contact_phone" name="contact_phone" type="tel" autoComplete="tel" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input id="contact_email" name="contact_email" type="email" required autoComplete="email" />
            </div>

            <div className="space-y-1.5">
              <Label>Your Role at This Complex</Label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      role === r
                        ? 'bg-primary text-white border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">
                Additional Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Website, social media links, or anything that helps us verify your claim…"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Claim Request'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
