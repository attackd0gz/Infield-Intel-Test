'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function AdminDeleteUser({ userId, username }: { userId: string; username: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? 'Failed to delete user')
      setLoading(false)
      setConfirm(false)
    } else {
      toast.success(`@${username} deleted`)
      router.refresh()
    }
  }

  if (confirm) {
    return (
      <span className="inline-flex items-center gap-1">
        <Button
          size="sm"
          variant="destructive"
          className="h-7 text-xs px-2"
          disabled={loading}
          onClick={handleDelete}
        >
          {loading ? '…' : 'Confirm'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs px-2"
          onClick={() => setConfirm(false)}
        >
          Cancel
        </Button>
      </span>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={() => setConfirm(true)}
      title={`Delete @${username}`}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  )
}
