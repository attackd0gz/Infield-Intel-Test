'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import { Pencil } from 'lucide-react'
import type { Profile } from '@/types'

export function AdminEditUserDialog({ user }: { user: Profile }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState(user.full_name ?? '')
  const [username, setUsername] = useState(user.username)
  const [bio, setBio] = useState(user.bio ?? '')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) { toast.error('Username is required'); return }
    setLoading(true)

    const res = await fetch('/api/admin/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        full_name: fullName.trim(),
        username: username.trim(),
        bio: bio.trim(),
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? 'Failed to update profile')
    } else {
      toast.success('Profile updated')
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold uppercase tracking-wide">Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div className="text-xs text-muted-foreground bg-zinc-50 border rounded-lg px-3 py-2">
            <span className="font-medium text-foreground">ID:</span> {user.id}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-fullname">Full Name</Label>
            <Input
              id="edit-fullname"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-username">Username <span className="text-destructive">*</span></Label>
            <Input
              id="edit-username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="username"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              placeholder="Bio text…"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
