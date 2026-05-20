'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

export function AdminDeleteReview({ reviewId }: { reviewId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)

    if (error) {
      toast.error('Failed to delete: ' + error.message)
      setLoading(false)
      setConfirming(false)
      return
    }

    toast.success('Review deleted')
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {loading ? 'Deleting…' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
      title="Delete review"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
