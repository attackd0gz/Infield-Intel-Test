import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Image as ImageIcon, ThumbsUp, Trophy } from 'lucide-react'
import { BADGE_THRESHOLDS } from '@/types'
import type { BadgeLevel, Profile, Review } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return { title: `${username} | Infield Intel` }
}

const BADGE_ORDER: BadgeLevel[] = [
  'Rookie', 'Minor Leaguer', 'Single-A', 'Double-A', 'Triple-A',
  'Major Leaguer', 'All-Star', 'MVP', 'Hall of Famer'
]

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, complex:complexes(id, name, city, state)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  const p = profile as Profile
  const currentBadgeIndex = BADGE_ORDER.indexOf(p.badge_level)
  const nextBadge = BADGE_ORDER[currentBadgeIndex + 1] as BadgeLevel | undefined
  const nextThreshold = nextBadge ? BADGE_THRESHOLDS[nextBadge] : null
  const progress = nextThreshold ? Math.min((p.points / nextThreshold) * 100, 100) : 100

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <Avatar className="h-24 w-24">
          <AvatarImage src={p.avatar_url ?? undefined} />
          <AvatarFallback className="text-2xl">
            {(p.full_name ?? p.username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold">{p.full_name ?? p.username}</h1>
          <p className="text-muted-foreground text-sm mb-2">@{p.username}</p>
          <Badge className="mb-3">{p.badge_level}</Badge>
          {p.bio && <p className="text-sm text-muted-foreground">{p.bio}</p>}

          {/* Progress to next badge */}
          {nextBadge && (
            <div className="mt-3 max-w-xs">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{p.points} pts</span>
                <span>{nextThreshold} pts → {nextBadge}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Star, label: 'Reviews', value: p.review_count },
          { icon: ImageIcon, label: 'Photos', value: p.photo_count },
          { icon: ThumbsUp, label: 'Helpful', value: p.helpful_votes },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex flex-col items-center py-4">
              <Icon className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-2xl font-bold">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Badge progression */}
      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Badge Progress
        </h2>
        <div className="flex flex-wrap gap-2">
          {BADGE_ORDER.map((level, i) => {
            const earned = i <= currentBadgeIndex
            return (
              <span
                key={level}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  earned ? 'bg-green-700 text-white border-green-700' : 'text-muted-foreground border-muted'
                }`}
              >
                {level}
              </span>
            )
          })}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="font-semibold text-lg mb-4">Reviews ({p.review_count})</h2>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {(reviews as (Review & { complex: { id: string; name: string; city: string; state: string } | null })[]).map(review => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {review.complex && (
                      <a href={`/complexes/${review.complex.id}`} className="font-medium hover:underline">
                        {review.complex.name}
                      </a>
                    )}
                    <p className="text-xs text-muted-foreground">{review.complex?.city}, {review.complex?.state}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`h-4 w-4 ${n <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                </div>
                <p className="font-semibold text-sm mb-1">{review.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{review.body}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No reviews yet.</p>
        )}
      </div>
    </div>
  )
}
