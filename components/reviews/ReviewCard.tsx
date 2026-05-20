'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { amenityLabel, amenityValueColor } from '@/lib/amenities'
import type { Review } from '@/types'

interface Props {
  review: Review
  currentUserId: string | null
  initialVoted?: boolean
}

export function ReviewCard({ review, currentUserId, initialVoted = false }: Props) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count)
  const [voted, setVoted] = useState(initialVoted)
  const [pending, setPending] = useState(false)

  const isOwnReview = currentUserId === review.user_id
  const profile = review.profile
  const initials = (profile?.full_name ?? profile?.username ?? '?').charAt(0).toUpperCase()

  async function handleHelpful() {
    if (!currentUserId) {
      toast.error('Sign in to mark reviews as helpful')
      return
    }
    if (isOwnReview || pending) return

    setPending(true)
    const supabase = createClient()

    if (voted) {
      // Remove vote
      const { error } = await supabase
        .from('helpful_votes')
        .delete()
        .match({ user_id: currentUserId, review_id: review.id })

      if (error) {
        toast.error('Could not remove vote')
      } else {
        setVoted(false)
        setHelpfulCount(c => Math.max(c - 1, 0))
      }
    } else {
      // Add vote
      const { error } = await supabase
        .from('helpful_votes')
        .insert({ user_id: currentUserId, review_id: review.id })

      if (error) {
        toast.error('Could not save vote')
      } else {
        setVoted(true)
        setHelpfulCount(c => c + 1)
      }
    }
    setPending(false)
  }

  return (
    <div className="bg-white border rounded-xl p-5 hover:shadow-sm transition-shadow">
      {/* Reviewer row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          {profile?.username ? (
            <Link href={`/profile/${profile.username}`}>
              <Avatar className="h-9 w-9 hover:ring-2 hover:ring-primary/30 transition-all">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <p className="font-semibold text-sm leading-tight">
              {profile?.username ? (
                <Link href={`/profile/${profile.username}`} className="hover:text-primary transition-colors">
                  {profile.full_name ?? profile.username}
                </Link>
              ) : (profile?.full_name ?? profile?.username ?? 'Anonymous')}
            </p>
            {profile?.badge_level && (
              <Badge variant="secondary" className="text-xs mt-0.5">{profile.badge_level}</Badge>
            )}
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5 shrink-0">
          {[1,2,3,4,5].map(n => (
            <Star
              key={n}
              className={`h-4 w-4 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/25'}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <h3 className="font-bold mb-1">{review.title}</h3>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed mb-3">
        {review.body}
      </p>

      {/* Amenity ratings */}
      {review.amenity_ratings && Object.keys(review.amenity_ratings).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(review.amenity_ratings).map(([key, entry]) => {
            if (!entry?.value) return null
            return (
              <span
                key={key}
                title={entry.comment ? `${amenityLabel(key)}: ${entry.value} — ${entry.comment}` : undefined}
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${amenityValueColor(entry.value)}`}
              >
                <span className="text-[10px] opacity-60">{amenityLabel(key)}:</span>
                {entry.value}
                {entry.comment && <span className="opacity-60 truncate max-w-[80px]" title={entry.comment}> — {entry.comment}</span>}
              </span>
            )
          })}
        </div>
      )}

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {review.photos.map(photo => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.caption ?? 'Review photo'}
              className="h-20 w-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
        <span className="text-xs text-muted-foreground">
          {review.visit_date
            ? `Visited ${new Date(review.visit_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
            : new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>

        <button
          onClick={handleHelpful}
          disabled={isOwnReview || pending}
          title={isOwnReview ? "You can't vote on your own review" : voted ? 'Remove helpful vote' : 'Mark as helpful'}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
            border transition-all select-none
            ${isOwnReview
              ? 'border-transparent text-muted-foreground/40 cursor-default'
              : voted
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                : 'bg-zinc-50 border-zinc-200 text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-primary'
            }
            ${pending ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          <ThumbsUp className={`h-3.5 w-3.5 ${voted && !isOwnReview ? 'fill-green-600' : ''}`} />
          <span>Helpful{helpfulCount > 0 ? ` (${helpfulCount})` : ''}</span>
        </button>
      </div>
    </div>
  )
}
