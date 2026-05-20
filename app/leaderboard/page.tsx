import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'
import type { Profile } from '@/types'

export const metadata = { title: 'Leaderboard | Infield Intel' }

const RANK_COLORS: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-zinc-400',
  3: 'text-amber-600',
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('points', { ascending: false })
    .limit(50)

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-7 w-7 text-yellow-500" />
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[3rem_1fr_auto_auto] gap-4 px-4 py-2 bg-muted text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span>Rank</span>
          <span>Reviewer</span>
          <span className="text-center">Reviews</span>
          <span className="text-right">Points</span>
        </div>

        {profiles && profiles.length > 0 ? (
          (profiles as Profile[]).map((profile, i) => {
            const rank = i + 1
            return (
              <div
                key={profile.id}
                className="grid grid-cols-[3rem_1fr_auto_auto] gap-4 items-center px-4 py-3 border-t hover:bg-muted/40 transition-colors"
              >
                <span className={`font-bold text-lg ${RANK_COLORS[rank] ?? 'text-muted-foreground'}`}>
                  {rank}
                </span>
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {profile.full_name?.charAt(0) ?? profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {profile.full_name ?? profile.username}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-0.5">
                      {profile.badge_level}
                    </Badge>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground text-center">{profile.review_count}</span>
                <span className="font-semibold text-sm text-right">{profile.points.toLocaleString()}</span>
              </div>
            )
          })
        ) : (
          <p className="text-center text-muted-foreground py-16">
            No reviewers yet. Be the first!
          </p>
        )}
      </div>
    </div>
  )
}
