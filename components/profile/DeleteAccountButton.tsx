'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TriangleAlert } from 'lucide-react'

const CONFIRM_WORD = 'DELETE'

export function DeleteAccountButton() {
  const router = useRouter()
  const [open, setOpen]         = useState(false)
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)

  const canDelete = confirm === CONFIRM_WORD

  async function handleDelete() {
    if (!canDelete) return
    setLoading(true)

    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Something went wrong.')
        setLoading(false)
        return
      }

      // Sign out locally then redirect — the auth user is already gone server-side
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConfirm('') }}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-destructive bg-transparent px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive">
        Delete Account
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert className="h-5 w-5 shrink-0" />
            Delete your account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm space-y-1.5">
            <p className="font-semibold text-destructive">This cannot be undone.</p>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li>Your profile and all personal data will be erased</li>
              <li>All your reviews and review photos will be deleted</li>
              <li>Your points and badge history will be lost</li>
              <li>Any complexes you own will become unclaimed</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-delete">
              Type <span className="font-mono font-bold">{CONFIRM_WORD}</span> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete || loading}
            >
              {loading ? 'Deleting…' : 'Permanently delete account'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
