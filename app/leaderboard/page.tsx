import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Star, Image as ImageIcon, FileText, Camera, ThumbsUp, Medal } from 'lucide-react'
import type { Profile } from '@/types'
import { BADGE_THRESHOLDS } from '@/types'

export const metadata = { title: 'Leaderboard' }

const BADGE_COLORS: Record<string, string> = {
  'Rookie':        'bg-zinc-100 text-zinc-600',
  'Minor Leaguer': 'bg-zinc-100 text-zinc-600',
  'Single-A':      'bg-green-100 text-green-700',
  'Double-A':      'bg-green-100 text-green-700',
  'Triple-A':      'bg-blue-100 text-blue-700',
  'Major Leaguer': 'bg-blue-100 text-blue-700',
  'All-Star':      'bg-purple-100 text-purple-700',
  'MVP':           'bg-amber-100 text-amber-700',
  'Hall of Famer': 'bg-amber-100 text-amber-700',
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .gt('points', 0)
    .order('points', { ascending: false })
    .limit(50)

  if (!profiles || profiles.length === 0) {
    return (
      <div className="flex flex-col">
        <LeaderboardHero count={0} />
        <div className="container mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
          No reviewers yet. Be the first!
        </div>
      </div>
    )
  }

  const top3 = profiles.slice(0, 3) as Profile[]
  const rest  = profiles.slice(3)  as Profile[]

  // Podium order: 2nd, 1st, 3rd
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean)

  const PODIUM_STYLES = [
    { rank: 2, ring: 'ring-zinc-300',  bg: 'bg-zinc-50',   label: 'text-zinc-400',  height: 'h-24', trophy: '🥈' },
    { rank: 1, ring: 'ring-yellow-400', bg: 'bg-amber-50',  label: 'text-yellow-500', height: 'h-32', trophy: '🥇' },
    { rank: 3, ring: 'ring-amber-600', bg: 'bg-orange-50',  label: 'text-amber-600', height: 'h-20', trophy: '🥉' },
  ]

  return (
    <div className="flex flex-col">
      <LeaderboardHero count={profiles.length} />

      <div className="container mx-auto max-w-3xl px-4 py-10">

        {/* Top 3 podium */}
        {top3.length >= 1 && (
          <div className="flex items-end justify-center gap-3 mb-10">
            {podium.map((profile, podiumIdx) => {
              const style = PODIUM_STYLES[podiumIdx]
              const trueRank = style.rank
              return (
                <Link
                  key={profile.id}
                  href={`/profile/${profile.username}`}
                  className={`flex-1 max-w-[180px] flex flex-col items-center gap-2 rounded-xl border-2 p-4 ${style.bg} ${style.ring} ring-2 hover:shadow-lg transition-all text-center`}
                >
                  <span className="text-2xl">{style.trophy}</span>
                  <Avatar className={`${trueRank === 1 ? 'h-16 w-16' : 'h-12 w-12'} ring-2 ${style.ring}`}>
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="text-lg font-bold">
                      {(profile.full_name ?? profile.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={`font-bold ${trueRank === 1 ? 'text-base' : 'text-sm'} leading-tight`}>
                      {profile.full_name ?? profile.username}
                    </p>
                    <p className="text-xs text-muted-foreground">@{profile.username}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_COLORS[profile.badge_level] ?? 'bg-zinc-100 text-zinc-600'}`}>
                    {profile.badge_level}
                  </span>
                  <p className={`font-black text-lg ${style.label}`}>
                    {profile.points.toLocaleString()}
                    <span className="text-xs font-medium ml-0.5">pts</span>
                  </p>
                </Link>
              )
            })}
          </div>
        )}

        {/* How It Works */}
        <HowItWorks />

        {/* Rest of the list */}
        {rest.length > 0 && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="grid grid-cols-[3rem_1fr_auto_auto_auto] gap-4 px-4 py-2.5 bg-zinc-50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>#</span>
              <span>Reviewer</span>
              <span className="text-center hidden sm:block"><Star className="h-3.5 w-3.5 inline" /></span>
              <span className="text-center hidden sm:block"><ImageIcon className="h-3.5 w-3.5 inline" /></span>
              <span className="text-right">Points</span>
            </div>
            {rest.map((profile, i) => {
              const rank = i + 4
              return (
                <Link
                  key={profile.id}
                  href={`/profile/${profile.username}`}
                  className="grid grid-cols-[3rem_1fr_auto_auto_auto] gap-4 items-center px-4 py-3 border-t hover:bg-zinc-50 transition-colors"
                >
                  <span className="font-bold text-muted-foreground text-sm">{rank}</span>
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={profile.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {(profile.full_name ?? profile.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{profile.full_name ?? profile.username}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${BADGE_COLORS[profile.badge_level] ?? 'bg-zinc-100 text-zinc-600'}`}>
                        {profile.badge_level}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground text-center hidden sm:block">{profile.review_count}</span>
                  <span className="text-sm text-muted-foreground text-center hidden sm:block">{profile.photo_count}</span>
                  <span className="font-bold text-sm text-right text-primary">{profile.points.toLocaleString()}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const BADGE_ORDER: BadgeLevel[] = [
  'Rookie', 'Minor Leaguer', 'Single-A', 'Double-A', 'Triple-A',
  'Major Leaguer', 'All-Star', 'MVP', 'Hall of Famer',
]

const BADGE_STYLES: Record<string, { pill: string; dot: string }> = {
  'Rookie':        { pill: 'bg-zinc-100 text-zinc-600 border-zinc-200',       dot: 'bg-zinc-300' },
  'Minor Leaguer': { pill: 'bg-zinc-100 text-zinc-600 border-zinc-200',       dot: 'bg-zinc-400' },
  'Single-A':      { pill: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500' },
  'Double-A':      { pill: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-600' },
  'Triple-A':      { pill: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  'Major Leaguer': { pill: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-600' },
  'All-Star':      { pill: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  'MVP':           { pill: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  'Hall of Famer': { pill: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-400' },
}

import type { BadgeLevel } from '@/types'

function HowItWorks() {
  return (
    <div className="mb-10">
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-500" />
        How It Works
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Earn points */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-sm mb-4">Earn Points By…</h3>
          <div className="space-y-3">
            {[
              {
                icon: FileText,
                color: 'bg-amber-50 text-amber-600',
                label: 'Writing a review',
                value: '15 pts',
              },
              {
                icon: Camera,
                color: 'bg-blue-50 text-blue-600',
                label: 'Including photos in your review',
                value: '+5 pts',
              },
              {
                icon: ThumbsUp,
                color: 'bg-green-50 text-green-600',
                label: 'Receiving a helpful vote',
                value: '1 pt each',
              },
              {
                icon: Medal,
                color: 'bg-purple-50 text-purple-600',
                label: 'Being first to review a complex',
                value: '+10 pts',
              },
            ].map(({ icon: Icon, color, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm flex-1">{label}</p>
                <span className="text-sm font-bold text-primary tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badge levels */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-sm mb-4">Badge Levels</h3>
          <div className="space-y-2">
            {BADGE_ORDER.map((level) => {
              const s = BADGE_STYLES[level]
              const pts = BADGE_THRESHOLDS[level]
              return (
                <div key={level} className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border w-36 shrink-0 ${s.pill}`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} />
                    {level}
                  </span>
                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.dot}`}
                      style={{ width: `${(pts / 1000) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums w-16 text-right">
                    {pts === 0 ? 'Start' : `${pts.toLocaleString()} pts`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

function LeaderboardHero({ count }: { count: number }) {
  return (
    <section className="relative h-52 flex items-center justify-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1508344928928-7165b67de128?w=1920&q=80&auto=format&fit=crop"
        alt="Baseball field"
        fill
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-primary/85" />
      <div className="relative z-10 text-center text-white px-4">
        <Trophy className="h-8 w-8 text-amber-400 mx-auto mb-2" />
        <h1 className="text-4xl font-bold tracking-wide uppercase">Leaderboard</h1>
        <p className="text-white/70 mt-1 text-sm">
          {count > 0 ? `Top ${count} reviewer${count === 1 ? '' : 's'} — ranked by points` : 'Be the first to earn points'}
        </p>
      </div>
    </section>
  )
}
