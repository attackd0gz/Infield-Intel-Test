'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  claimId: string
  complexId: string
  userId: string
  complexName: string
  applicantName: string
}

export function AdminClaimActions({ claimId, complexId, userId, complexName, applicantName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'deny' | null>(null)

  async function handle(action: 'approve' | 'deny') {
    setLoading(action)
    const res = await fetch('/api/admin/review-claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimId, complexId, userId, action }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? 'Something went wrong')
    } else {
      toast.success(
        action === 'approve'
          ? `${applicantName} is now the owner of ${complexName}`
          : `Claim for ${complexName} denied`
      )
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
        disabled={loading !== null}
        onClick={() => handle('approve')}
      >
        <CheckCircle className="h-3.5 w-3.5" />
        {loading === 'approve' ? 'Approving…' : 'Approve'}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
        disabled={loading !== null}
        onClick={() => handle('deny')}
      >
        <XCircle className="h-3.5 w-3.5" />
        {loading === 'deny' ? 'Denying…' : 'Deny'}
      </Button>
    </div>
  )
}
