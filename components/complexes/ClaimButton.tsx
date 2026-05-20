'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Shield, Settings } from 'lucide-react'

interface Props {
  complexId: string
  complexName: string
  ownerId: string | null
  currentUserId: string | null
}

export function ClaimButton({ complexId, complexName, ownerId, currentUserId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const isOwner = ownerId === currentUserId
  const isClaimed = ownerId !== null

  // Owner sees Manage button — no dialog needed
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

  // Already claimed by someone else — show nothing
  if (isClaimed) return null

  // Not logged in — show nothing (write review button already prompts login)
  if (!currentUserId) return null

  async function handleClaim() {
    setLoading(true)
    const supabase = createClient()

    // Claim the complex
    const { error: complexError } = await supabase
      .from('complexes')
      .update({ owner_id: currentUserId })
      .eq('id', complexId)
      .is('owner_id', null)

    if (complexError) {
      toast.error('Failed to claim listing: ' + complexError.message)
      setLoading(false)
      return
    }

    // Upgrade role to owner
    await supabase
      .from('profiles')
      .update({ role: 'owner' })
      .eq('id', currentUserId)

    toast.success(`You're now the owner of ${complexName}!`)
    setOpen(false)
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-wide uppercase">Claim This Listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm">
            <p className="font-semibold text-primary mb-1">{complexName}</p>
            <p className="text-muted-foreground">
              By claiming this listing you confirm that you are the owner or an authorized
              manager of this facility. Infield Intel admins may verify ownership and can
              revoke access if the claim is inaccurate.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Once claimed you&apos;ll be able to:
          </p>
          <ul className="text-sm space-y-1.5 text-muted-foreground">
            {[
              'Edit your complex name, description, and amenities',
              'Upload a cover photo',
              'Post renovation plans, events, and announcements',
              'See all reviews in one place',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleClaim}
              disabled={loading}
            >
              {loading ? 'Claiming…' : 'Yes, I Own This Complex'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
