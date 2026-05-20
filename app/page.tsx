import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Map, Star, Trophy, ChevronRight } from 'lucide-react'

const BADGE_LEVELS = [
  'Rookie', 'Minor Leaguer', 'Single-A', 'Double-A', 'Triple-A',
  'Major Leaguer', 'All-Star', 'MVP', 'Hall of Famer'
]

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1508344928928-7165b67de128?w=1920&q=80&auto=format&fit=crop"
          alt="Baseball field"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

        {/* Content */}
        <div className="relative z-10 container mx-auto max-w-4xl px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="text-amber-400">⚾</span>
            San Antonio &amp; Beyond
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4 text-balance leading-tight">
            The Inside Scoop on<br />
            <span className="text-amber-400">Baseball Complexes</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto text-balance">
            Real reviews from real players and families. Discover complexes,
            check amenities, and share your experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/complexes">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 w-full sm:w-auto">
                Browse Complexes
              </Button>
            </Link>
            <Link href="/map">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-8 w-full sm:w-auto">
                <Map className="h-4 w-4 mr-2" />
                View Map
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section className="bg-primary text-white py-4">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-3 divide-x divide-white/20 text-center">
            {[
              { value: 'San Antonio', label: 'Now Live' },
              { value: 'Free', label: 'To Review' },
              { value: '9 Levels', label: 'To Earn' },
            ].map(({ value, label }) => (
              <div key={label} className="px-4 py-2">
                <p className="font-black text-lg text-amber-400">{value}</p>
                <p className="text-xs text-white/70 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-3">Everything You Need to Know Before You Go</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Stop guessing. Infield Intel gives you the real picture of every complex — from parking to pitching mounds.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Search,
                title: 'Find Any Complex',
                description: 'Search and filter complexes by location, amenities, and star rating.',
              },
              {
                icon: Star,
                title: 'Honest Reviews',
                description: 'Read candid reviews from players and families who have been there.',
              },
              {
                icon: Map,
                title: 'Interactive Map',
                description: 'Explore all complexes visually with our full San Antonio map view.',
              },
              {
                icon: Trophy,
                title: 'Earn Your Stripes',
                description: 'Level up from Rookie to Hall of Famer as you contribute.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col items-start gap-3 p-6 rounded-xl border hover:border-primary/30 hover:shadow-md transition-all">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Image strip ──────────────────────────────────────── */}
      <section className="relative h-64 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=1920&q=80&auto=format&fit=crop"
          alt="Baseball field aerial"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-primary/80 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <p className="text-3xl font-black mb-2">Know Before You Play</p>
            <p className="text-white/80">Amenities, fields, parking, and more — all in one place.</p>
          </div>
        </div>
      </section>

      {/* ── Badge progression ────────────────────────────────── */}
      <section className="py-20 px-4 bg-zinc-950 text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <Trophy className="h-10 w-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black mb-3">Climb the Ranks</h2>
          <p className="text-white/60 mb-10 max-w-lg mx-auto">
            Every review and photo earns points. Level up from Rookie all the way to
            Hall of Famer and claim your spot on the leaderboard.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {BADGE_LEVELS.map((level, i) => (
              <span
                key={level}
                className="px-3 py-1.5 rounded-full text-sm font-semibold border transition-all"
                style={{
                  borderColor: `oklch(0.55 0.12 158 / ${0.3 + (i / 8) * 0.7})`,
                  backgroundColor: `oklch(0.28 0.08 158 / ${0.1 + (i / 8) * 0.4})`,
                  color: i >= 6 ? '#fbbf24' : 'white',
                }}
              >
                {level}
              </span>
            ))}
          </div>
          <Link href="/signup">
            <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8">
              Start Reviewing Free
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=1920&q=80&auto=format&fit=crop"
          alt="Baseball diamond"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 container mx-auto max-w-2xl text-center text-white">
          <h2 className="text-3xl font-black mb-3">Own or Manage a Complex?</h2>
          <p className="text-white/75 mb-6">
            Claim your listing, respond to reviews, and post renovation plans or upcoming events.
          </p>
          <Link href="/signup">
            <Button variant="outline" className="border-white/50 text-white hover:bg-white/10 font-semibold">
              Get a Free Owner Account
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}
