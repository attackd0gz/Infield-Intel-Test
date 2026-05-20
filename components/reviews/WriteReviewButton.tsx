'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ReviewForm } from './ReviewForm'
import type { Review } from '@/types'
import type { ReviewResult } from './ReviewForm'

interface Props {
  complexId: string
  userId: string | null
  existingReview: Review | null
  isFirstReview: boolean
}

// Floating points badge — pure CSS transition, zero server cost
function PointsBadge({ result, onDone }: { result: ReviewResult; onDone: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'rise' | 'done'>('enter')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('rise'), 80)
    const t2 = setTimeout(() => { setPhase('done'); onDone() }, 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  if (phase === 'done') return null

  const breakdown: string[] = []
  if (result.points >= 10 || (result.points > 0 && !result.isPioneer && result.photoCount === 0)) {
    breakdown.push('+10 review')
  }
  if (result.isPioneer) breakdown.push('+5 pioneer ⚾')
  if (result.photoCount > 0) breakdown.push(`+${result.photoCount * 5} photo${result.photoCount > 1 ? 's' : ''}`)

  return (
    <div
      className="fixed bottom-24 right-6 z-50 pointer-events-none"
      style={{
        transition: 'transform 1800ms cubic-bezier(0.16,1,0.3,1), opacity 1800ms ease-out',
        transform: phase === 'rise' ? 'translateY(-64px)' : 'translateY(0)',
        opacity: phase === 'rise' ? 0 : 1,
      }}
    >
      <div className="bg-zinc-900 text-white rounded-2xl shadow-2xl px-6 py-4 text-center min-w-[160px]">
        <p className="text-3xl font-black text-amber-400 leading-none">+{result.points}</p>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mt-0.5">points earned</p>
        {breakdown.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {breakdown.map(line => (
              <p key={line} className="text-xs text-white/70">{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function WriteReviewButton({ complexId, userId, existingReview, isFirstReview }: Props) {
  const router = useRouter()
  const [open, setOpen]           = useState(false)
  const [animation, setAnimation] = useState<ReviewResult | null>(null)

  function handleSuccess(result: ReviewResult) {
    setOpen(false)
    if (result.points > 0) setAnimation(result)
    router.refresh()
  }

  if (!userId) {
    return (
      <Link href="/login">
        <Button>Log in to Review</Button>
      </Link>
    )
  }

  return (
    <>
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
            isFirstReview={isFirstReview}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

      {animation && (
        <PointsBadge result={animation} onDone={() => setAnimation(null)} />
      )}
    </>
  )
}
