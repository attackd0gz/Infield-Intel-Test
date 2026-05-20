import { ReviewCard } from './ReviewCard'
import type { Review } from '@/types'

interface Props {
  reviews: Review[]
  currentUserId: string | null
}

export function ReviewList({ reviews, currentUserId }: Props) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg mb-1">No reviews yet</p>
        <p className="text-sm">Be the first to review this complex!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} currentUserId={currentUserId} />
      ))}
    </div>
  )
}
