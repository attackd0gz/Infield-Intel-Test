import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Map, Star, Trophy } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            The Inside Scoop on Baseball Complexes
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Real reviews from real players and families. Find the best complexes,
            see what amenities they offer, and share your experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/complexes">
              <Button size="lg" className="bg-white text-green-900 hover:bg-green-50">
                Browse Complexes
              </Button>
            </Link>
            <Link href="/map">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Map
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Infield Intel?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Search,
                title: 'Find Any Complex',
                description: 'Search and filter complexes by location, amenities, and rating.',
              },
              {
                icon: Star,
                title: 'Honest Reviews',
                description: 'Read reviews from players and families who have been there.',
              },
              {
                icon: Map,
                title: 'Interactive Map',
                description: 'Explore complexes visually with our full map view.',
              },
              {
                icon: Trophy,
                title: 'Earn Your Stripes',
                description: 'Level up from Rookie to Hall of Famer as you contribute reviews.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Badge levels teaser */}
      <section className="py-16 px-4 bg-green-50">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-3">Climb the Ranks</h2>
          <p className="text-muted-foreground mb-8">
            Every review and photo you submit earns points. Level up through the ranks,
            from Rookie all the way to Hall of Famer.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Rookie', 'Minor Leaguer', 'Single-A', 'Double-A', 'Triple-A', 'Major Leaguer', 'All-Star', 'MVP', 'Hall of Famer'].map((level, i) => (
              <span
                key={level}
                className="px-3 py-1 rounded-full text-sm font-medium border"
                style={{ opacity: 0.4 + (i / 8) * 0.6 }}
              >
                {level}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/signup">
              <Button>Start Reviewing — It&apos;s Free</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
