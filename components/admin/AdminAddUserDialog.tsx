'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import { UserPlus } from 'lucide-react'

export function AdminAddUserDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: (form.get('email') as string).trim(),
        password: (form.get('password') as string),
        full_name: (form.get('full_name') as string).trim(),
        username: (form.get('username') as string).trim(),
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? 'Failed to create user')
    } else {
      toast.success('User created')
      setOpen(false)
      ;(e.target as HTMLFormElement).reset()
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold uppercase tracking-wide">Add User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="add-fullname">Full Name</Label>
              <Input id="add-fullname" name="full_name" placeholder="John Smith" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-username">Username <span className="text-destructive">*</span></Label>
              <Input id="add-username" name="username" required placeholder="jsmith" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-email">Email <span className="text-destructive">*</span></Label>
            <Input id="add-email" name="email" type="email" required placeholder="john@example.com" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-password">Temporary Password <span className="text-destructive">*</span></Label>
            <Input id="add-password" name="password" type="password" required minLength={8} placeholder="Min 8 characters" />
          </div>

          <p className="text-xs text-muted-foreground">
            The account will be created with email confirmed. The user can change their password after logging in.
          </p>

          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creating…' : 'Create User'}
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
