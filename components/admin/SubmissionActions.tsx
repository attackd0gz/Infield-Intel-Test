'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
  submissionId: string
}

export function SubmissionActions({ submissionId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')

  async function act(action: 'approve' | 'reject') {
    setLoading(action)
    const res = await fetch('/api/admin/review-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, action, adminNotes }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? 'Action failed')
    } else {
      toast.success(action === 'approve' ? 'Complex approved and added!' : 'Submission rejected.')
      router.refresh()
    }
    setLoading(null)
    setShowRejectForm(false)
    setAdminNotes('')
  }

  if (!showRejectForm) {
    return (
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          onClick={() => act('approve')}
          disabled={!!loading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
          {loading === 'approve' ? 'Approving…' : 'Approve'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowRejectForm(true)}
          disabled={!!loading}
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <XCircle className="h-3.5 w-3.5 mr-1.5" />
          Reject
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2 pt-1">
      <Textarea
        rows={2}
        placeholder="Rejection reason (optional)"
        value={adminNotes}
        onChange={e => setAdminNotes(e.target.value)}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => act('reject')}
          disabled={!!loading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {loading === 'reject' ? 'Rejecting…' : 'Confirm Reject'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { setShowRejectForm(false); setAdminNotes('') }}
          disabled={!!loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
