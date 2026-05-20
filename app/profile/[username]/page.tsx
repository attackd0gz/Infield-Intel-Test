import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { defaultOgImage } from '@/lib/site'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Image as ImageIcon, ThumbsUp, Trophy, Pencil, ChevronRight } from 'lucide-react'
import { BADGE_THRESHOLDS } from '@/types'
import type { BadgeLevel, Profile, Review } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('full_name, username, bio, avatar_url, badge_level, review_count')
    .eq('username', username)
    .single()

  if (!data) return { title: username }

  const displayName = data.full_name ?? data.username
  const title = `${displayName} (@${data.username})`
  const description =
    data.bio ||
    `${displayName} is a ${data.badge_level} on Infield Intel with ${data.review_count} review${data.review_count !== 1 ? 's' : ''}.`
  const image = data.avatar_url || defaultOgImage

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Infield Intel`,
      description,
      images: [{ url: image, width: 400, height: 400, alt: displayName }],
    },
    twitter: {
      card: data.avatar_url ? 'summary' : 'summary_large_image',
      title: `${title} | Infield Intel`,
      description,
      images: [image],
    },
  }
}

const BADGE_ORDER: BadgeLevel[] = [
  'Rookie', 'Minor Leaguer', 'Single-A', 'Double-A', 'Triple-A',
  'Major Leaguer', 'All-Star', 'MVP', 'Hall of Famer'
]

const BADGE_COLORS: Record<BadgeLevel, { pill: string; dot: string }> = {
  'Rookie':        { pill: 'bg-zinc-100 text-zinc-600 border-zinc-200',      dot: 'bg-zinc-300' },
  'Minor Leaguer': { pill: 'bg-zinc-100 text-zinc-600 border-zinc-200',      dot: 'bg-zinc-400' },
  'Single-A':      { pill: 'bg-green-100 text-green-700 border-green-200',   dot: 'bg-green-500' },
  'Double-A':      { pill: 'bg-green-100 text-green-700 border-green-200',   dot: 'bg-green-600' },
  'Triple-A':      { pill: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-500' },
  'Major Leaguer': { pill: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-600' },
  'All-Star':      { pill: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  'MVP':           { pill: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  'Hall of Famer': { pill: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-400' },
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

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
  const isOwnProfile = user?.id === p.id
  const currentBadgeIndex = BADGE_ORDER.indexOf(p.badge_level)
  const nextBadge = BADGE_ORDER[currentBadgeIndex + 1] as BadgeLevel | undefined
  const nextThreshold = nextBadge ? BADGE_THRESHOLDS[nextBadge] : null
  const currentThreshold = BADGE_THRESHOLDS[p.badge_level]
  const progress = nextThreshold
    ? Math.min(((p.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100)
    : 100
  const colors = BADGE_COLORS[p.badge_level]

  return (
    <div className="flex flex-col">
      {/* Profile header band */}
      <div className="bg-primary text-white">
        <div className="container mx-auto max-w-4xl px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 ring-4 ring-white/20">
                <AvatarImage src={p.avatar_url ?? undefined} />
                <AvatarFallback className="text-3xl font-bold bg-white/10 text-white">
                  {(p.full_name ?? p.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name + info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
                <h1 className="text-2xl font-bold">{p.full_name ?? p.username}</h1>
                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    title="Edit profile"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              <p className="text-white/60 text-sm mb-3">@{p.username}</p>

              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${colors.pill}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                {p.badge_level}
              </span>

              {p.bio && <p className="text-white/70 text-sm mt-3 max-w-md">{p.bio}</p>}
            </div>

            {/* Points */}
            <div className="text-center sm:text-right shrink-0">
              <p className="text-3xl font-black text-amber-400">{p.points.toLocaleString()}</p>
              <p className="text-white/60 text-xs uppercase tracking-wide">points</p>
            </div>
          </div>

          {/* Progress to next badge */}
          {nextBadge && (
            <div className="mt-6 max-w-sm">
              <div className="flex justify-between text-xs text-white/50 mb-1.5">
                <span>{p.badge_level}</span>
                <span>{nextBadge} — {nextThreshold?.toLocaleString()} pts</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${Math.max(progress, 2)}%` }}
                />
              </div>
            </div>
          )}
          {!nextBadge && (
            <div className="mt-4 inline-flex items-center gap-2 text-amber-400 text-sm font-semibold">
              <Trophy className="h-4 w-4" />
              Hall of Famer — Maximum rank achieved
            </div>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-zinc-900 text-white">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
            {[
              { icon: Star, label: 'Reviews', value: p.review_count },
              { icon: ImageIcon, label: 'Photos', value: p.photo_count },
              { icon: ThumbsUp, label: 'Helpful Votes', value: p.helpful_votes },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="px-4 py-4">
                <p className="text-xl font-black text-amber-400">{value}</p>
                <p className="text-xs text-white/50 uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Badge progression */}
          <div className="lg:col-span-1">
            <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Badge Progress
            </h2>
            <div className="space-y-2">
              {BADGE_ORDER.map((level, i) => {
                const earned = i <= currentBadgeIndex
                const current = i === currentBadgeIndex
                const c = BADGE_COLORS[level]
                return (
                  <div
                    key={level}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                      current
                        ? 'bg-primary/5 border-primary/20'
                        : earned
                        ? 'bg-white border-transparent'
                        : 'bg-zinc-50 border-transparent opacity-40'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full shrink-0 ${earned ? c.dot : 'bg-zinc-300'}`} />
                    <span className={`text-sm font-medium flex-1 ${earned ? '' : 'text-muted-foreground'}`}>
                      {level}
                    </span>
                    {current && (
                      <span className="text-xs font-semibold text-primary">Current</span>
                    )}
                    {earned && !current && (
                      <span className="text-xs text-green-600">✓</span>
                    )}
                    {!earned && (
                      <span className="text-xs text-muted-foreground">
                        {BADGE_THRESHOLDS[level]}pts
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reviews */}
          <div className="lg:col-span-2">
            <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-4">
              Reviews ({p.review_count})
            </h2>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {(reviews as (Review & { complex: { id: string; name: string; city: string; state: string } | null })[]).map(review => (
                  <div key={review.id} className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <div>
                        {review.complex && (
                          <Link
                            href={`/complexes/${review.complex.id}`}
                            className="font-bold text-sm hover:text-primary transition-colors flex items-center gap-1 group"
                          >
                            {review.complex.name}
                            <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        )}
                        <p className="text-xs text-muted-foreground">{review.complex?.city}, {review.complex?.state}</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`h-4 w-4 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="font-semibold text-sm mb-1">{review.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{review.body}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No reviews yet.</p>
                {isOwnProfile && (
                  <Link href="/complexes" className="text-sm text-primary hover:underline mt-1 block">
                    Browse complexes to get started →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
