'use client'

import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export type ActivityPoint    = { month: string; reviews: number; signups: number }
export type RatingPoint      = { rating: string; count: number }
export type ComplexPoint     = { name: string; avgRating: number; reviewCount: number }
export type StatePoint       = { state: string; count: number }
export type BadgePoint       = { badge: string; shortBadge: string; count: number }
export type PlayerTypePoint  = { type: string; count: number }

interface Props {
  activityData:    ActivityPoint[]
  ratingDist:      RatingPoint[]
  topComplexes:    ComplexPoint[]
  complexesByState: StatePoint[]
  badgeDist:       BadgePoint[]
  playerTypeDist:  PlayerTypePoint[]
}

const AMBER  = '#f59e0b'
const BLUE   = '#3b82f6'
const GREEN  = '#22c55e'
const PURPLE = '#a855f7'
const ZINC   = '#71717a'

const BADGE_COLORS = [ZINC, ZINC, GREEN, GREEN, BLUE, BLUE, PURPLE, AMBER, AMBER]

export function AnalyticsCharts({
  activityData,
  ratingDist,
  topComplexes,
  complexesByState,
  badgeDist,
  playerTypeDist,
}: Props) {
  return (
    <div className="space-y-6">

      {/* ── Activity over time ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-sm uppercase tracking-wide mb-5">
          Activity — Last 12 Months
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={activityData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={30} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone" dataKey="reviews"
              stroke={AMBER} strokeWidth={2} dot={false} name="Reviews"
            />
            <Line
              type="monotone" dataKey="signups"
              stroke={BLUE} strokeWidth={2} dot={false} name="New Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Rating dist + Player type ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wide mb-5">
            Rating Distribution
          </h2>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={ratingDist} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="rating" tick={{ fontSize: 13 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={30} />
              <Tooltip />
              <Bar dataKey="count" fill={AMBER} name="Reviews" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wide mb-5">
            User Type Breakdown
          </h2>
          {playerTypeDist.length === 0 ? (
            <p className="text-sm text-muted-foreground py-16 text-center">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={playerTypeDist} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={30} />
                <Tooltip />
                <Bar dataKey="count" name="Users" radius={[4, 4, 0, 0]}>
                  {playerTypeDist.map((_, i) => (
                    <Cell key={i} fill={[AMBER, BLUE, GREEN, PURPLE][i % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Top complexes by avg rating ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-sm uppercase tracking-wide mb-5">
          Top Complexes by Rating
        </h2>
        {topComplexes.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No reviewed complexes yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, topComplexes.length * 38)}>
            <BarChart
              data={topComplexes}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
              <XAxis type="number" domain={[0, 5]} tickCount={6} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null
                  const d = payload[0].payload as ComplexPoint
                  return (
                    <div className="bg-white border rounded shadow-sm text-xs px-3 py-2 space-y-0.5">
                      <p className="font-semibold">{d.name}</p>
                      <p className="text-muted-foreground">
                        {d.avgRating} / 5 &middot; {d.reviewCount} review{d.reviewCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="avgRating" fill={GREEN} name="Avg Rating" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── State coverage + Badge dist ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wide mb-5">
            Complexes by State
          </h2>
          {complexesByState.length === 0 ? (
            <p className="text-sm text-muted-foreground py-16 text-center">No complexes yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={complexesByState} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="state" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={30} />
                <Tooltip />
                <Bar dataKey="count" fill={BLUE} name="Complexes" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wide mb-5">
            Badge Level Distribution
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={badgeDist} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="shortBadge" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={30} />
              <Tooltip
                content={({ payload, label }) => {
                  if (!payload?.length) return null
                  const d = payload[0].payload as BadgePoint
                  return (
                    <div className="bg-white border rounded shadow-sm text-xs px-3 py-2 space-y-0.5">
                      <p className="font-semibold">{d.badge}</p>
                      <p className="text-muted-foreground">{d.count} user{d.count !== 1 ? 's' : ''}</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="count" name="Users" radius={[4, 4, 0, 0]}>
                {badgeDist.map((_, i) => (
                  <Cell key={i} fill={BADGE_COLORS[i] ?? ZINC} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
