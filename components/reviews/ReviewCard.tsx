'use client'

import { useState } from 'react'
import { Star, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Review } from '@/types'

interface Props {
  review: Review
  currentUserId: string | null
}

export function ReviewCard({ review, currentUserId }: Props) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count)
  const [voted, setVoted] = useState(false)

  async function handleHelpful() {
    if (!currentUserId) { toast.error('Sign in to mark reviews as helpful'); return }
    if (voted) return
    const supabase = createClient()
    const { error } = await supabase.from('helpful_votes').insert({ user_id: currentUserId, review_id: review.id })
    if (!error) {
      setHelpfulCount(c => c + 1)
      setVoted(true)
    }
  }

  const profile = review.profile
  const initials = (profile?.full_name ?? profile?.username ?? '?').charAt(0).toUpperCase()

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{profile?.full_name ?? profile?.username}</p>
            {profile?.badge_level && (
              <Badge variant="secondary" className="text-xs">{profile.badge_level}</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {[1,2,3,4,5].map(n => (
            <Star
              key={n}
              className={`h-4 w-4 ${n <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
            />
          ))}
        </div>
      </div>

      <h3 className="font-semibold mb-1">{review.title}</h3>
      <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{review.body}</p>

      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {review.photos.map(photo => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.caption ?? 'Review photo'}
              className="h-20 w-20 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{review.visit_date ? `Visited ${new Date(review.visit_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : new Date(review.created_at).toLocaleDateString()}</span>
        <button
          onClick={handleHelpful}
          className={`flex items-center gap-1 hover:text-foreground transition-colors ${voted ? 'text-green-600' : ''}`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>Helpful ({helpfulCount})</span>
        </button>
      </div>
    </div>
  )
}
