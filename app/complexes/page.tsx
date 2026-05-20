import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ComplexCard } from '@/components/complexes/ComplexCard'
import { ComplexSearch } from '@/components/complexes/ComplexSearch'
import { MapPin, PlusCircle } from 'lucide-react'
import type { Complex } from '@/types'

export const metadata = { title: 'Browse Complexes' }

export default async function ComplexesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; min_rating?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('complexes')
    .select('*')
    .order('average_rating', { ascending: false })

  if (params.q)          query = query.ilike('name', `%${params.q}%`)
  if (params.city)       query = query.ilike('city', `%${params.city}%`)
  if (params.min_rating) query = query.gte('average_rating', parseFloat(params.min_rating))

  const { data: complexes } = await query.limit(50)

  const isFiltered = params.q || params.city || params.min_rating
  const resultCount = complexes?.length ?? 0

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative h-52 flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=1920&q=80&auto=format&fit=crop"
          alt="Baseball field aerial"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-medium mb-3">
            <MapPin className="h-3 w-3 text-amber-400" />
            San Antonio, TX &amp; Surrounding Area
          </div>
          <h1 className="text-4xl font-bold tracking-wide uppercase">Browse Complexes</h1>
          <p className="text-white/70 mt-1 text-sm">
            {resultCount} {resultCount === 1 ? 'complex' : 'complexes'}{isFiltered ? ' matching your search' : ' across the area'}
          </p>
        </div>
      </section>

      {/* Search bar + submit link */}
      <div className="bg-zinc-50 border-b">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <div className="flex-1">
            <ComplexSearch />
          </div>
          <Link
            href="/complexes/submit"
            className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Submit a Complex</span>
          </Link>
        </div>
      </div>

      {/* Results grid */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {complexes && complexes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(complexes as Complex[]).map((complex) => (
              <ComplexCard key={complex.id} complex={complex} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">⚾</p>
            <p className="font-bold text-lg mb-1">No complexes found</p>
            <p className="text-muted-foreground text-sm">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
