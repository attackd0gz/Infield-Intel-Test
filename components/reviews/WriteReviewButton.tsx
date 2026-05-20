'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ReviewForm } from './ReviewForm'
import type { Review } from '@/types'

interface Props {
  complexId: string
  userId: string | null
  existingReview: Review | null
}

export function WriteReviewButton({ complexId, userId, existingReview }: Props) {
  const [open, setOpen] = useState(false)

  if (!userId) {
    return (
      <Link href="/login">
        <Button>Log in to Review</Button>
      </Link>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>{existingReview ? 'Edit Your Review' : 'Write a Review'}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingReview ? 'Edit Your Review' : 'Write a Review'}</DialogTitle>
        </DialogHeader>
        <ReviewForm
          complexId={complexId}
          userId={userId}
          existingReview={existingReview}
          onSuccess={() => { setOpen(false); window.location.reload() }}
        />
      </DialogContent>
    </Dialog>
  )
}
