import { createAdminClient } from '@/lib/supabase/admin'
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'
import type {
  ActivityPoint, RatingPoint, ComplexPoint,
  StatePoint, BadgePoint, PlayerTypePoint,
} from '@/components/admin/AnalyticsCharts'

export const metadata = { title: 'Analytics' }

const BADGE_ORDER = [
  'Rookie', 'Minor Leaguer', 'Single-A', 'Double-A', 'Triple-A',
  'Major Leaguer', 'All-Star', 'MVP', 'Hall of Famer',
]

// Short labels for the x-axis (keeps chart readable)
const BADGE_SHORT: Record<string, string> = {
  'Rookie':        'Rookie',
  'Minor Leaguer': 'Minor',
  'Single-A':      'Single-A',
  'Double-A':      'Double-A',
  'Triple-A':      'Triple-A',
  'Major Leaguer': 'Major',
  'All-Star':      'All-Star',
  'MVP':           'MVP',
  'Hall of Famer': 'HOF',
}

/** Returns the last `count` months as { key: 'YYYY-MM', label: 'Jan 25' } */
function buildMonthBuckets(count = 12) {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1)
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    }
  })
}

export default async function AnalyticsPage() {
  const db = createAdminClient()

  const [
    { data: reviews },
    { data: profiles },
    { data: complexes },
  ] = await Promise.all([
    db.from('reviews').select('created_at, rating'),
    db.from('profiles').select('created_at, badge_level, player_type'),
    db.from('complexes').select('name, state, average_rating, review_count'),
  ])

  const months = buildMonthBuckets(12)

  // ── Activity over time ─────────────────────────────────────────────────────
  const activityData: ActivityPoint[] = months.map(({ key, label }) => ({
    month:   label,
    reviews: (reviews  ?? []).filter(r => r.created_at.slice(0, 7) === key).length,
    signups: (profiles ?? []).filter(p => p.created_at.slice(0, 7) === key).length,
  }))

  // ── Rating distribution ────────────────────────────────────────────────────
  const ratingDist: RatingPoint[] = [1, 2, 3, 4, 5].map(n => ({
    rating: `${n}★`,
    count: (reviews ?? []).filter(r => r.rating === n).length,
  }))

  // ── Top complexes by average rating ───────────────────────────────────────
  const topComplexes: ComplexPoint[] = (complexes ?? [])
    .filter(c => (c.review_count ?? 0) >= 1 && c.average_rating != null)
    .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0))
    .slice(0, 10)
    .map(c => ({
      name:        c.name.length > 28 ? c.name.slice(0, 28) + '…' : c.name,
      avgRating:   Math.round((c.average_rating ?? 0) * 10) / 10,
      reviewCount: c.review_count ?? 0,
    }))

  // ── Complexes by state ─────────────────────────────────────────────────────
  const stateMap: Record<string, number> = {}
  for (const c of complexes ?? []) {
    if (c.state) stateMap[c.state] = (stateMap[c.state] ?? 0) + 1
  }
  const complexesByState: StatePoint[] = Object.entries(stateMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([state, count]) => ({ state, count }))

  // ── Badge level distribution ───────────────────────────────────────────────
  const badgeMap: Record<string, number> = {}
  for (const p of profiles ?? []) {
    if (p.badge_level) badgeMap[p.badge_level] = (badgeMap[p.badge_level] ?? 0) + 1
  }
  const badgeDist: BadgePoint[] = BADGE_ORDER.map(b => ({
    badge:      b,
    shortBadge: BADGE_SHORT[b] ?? b,
    count:      badgeMap[b] ?? 0,
  }))

  // ── Player / user type breakdown ───────────────────────────────────────────
  const typeMap: Record<string, number> = {}
  for (const p of profiles ?? []) {
    const t = p.player_type ?? 'unknown'
    typeMap[t] = (typeMap[t] ?? 0) + 1
  }
  const playerTypeDist: PlayerTypePoint[] = Object.entries(typeMap)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      type:  type.charAt(0).toUpperCase() + type.slice(1),
      count,
    }))

  // ── Summary counts for the header strip ───────────────────────────────────
  const totalReviews   = reviews?.length  ?? 0
  const totalUsers     = profiles?.length ?? 0
  const totalComplexes = complexes?.length ?? 0
  const avgRating = totalReviews > 0
    ? (reviews!.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(2)
    : '—'

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-wide uppercase mb-6">Analytics</h1>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users',     value: totalUsers.toLocaleString() },
          { label: 'Total Reviews',   value: totalReviews.toLocaleString() },
          { label: 'Total Complexes', value: totalComplexes.toLocaleString() },
          { label: 'Avg Review Rating', value: avgRating === '—' ? '—' : `${avgRating} / 5` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border px-5 py-4">
            <p className="text-2xl font-black text-amber-500">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <AnalyticsCharts
        activityData={activityData}
        ratingDist={ratingDist}
        topComplexes={topComplexes}
        complexesByState={complexesByState}
        badgeDist={badgeDist}
        playerTypeDist={playerTypeDist}
      />
    </div>
  )
}
