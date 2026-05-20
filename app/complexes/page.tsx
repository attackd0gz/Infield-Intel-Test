import { createClient } from '@/lib/supabase/server'
import { ComplexCard } from '@/components/complexes/ComplexCard'
import { ComplexSearch } from '@/components/complexes/ComplexSearch'
import type { Complex } from '@/types'

export const metadata = { title: 'Browse Complexes | Infield Intel' }

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

  if (params.q) {
    query = query.ilike('name', `%${params.q}%`)
  }
  if (params.city) {
    query = query.ilike('city', `%${params.city}%`)
  }
  if (params.min_rating) {
    query = query.gte('average_rating', parseFloat(params.min_rating))
  }

  const { data: complexes } = await query.limit(50)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Baseball Complexes</h1>
      <ComplexSearch />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {complexes && complexes.length > 0 ? (
          (complexes as Complex[]).map((complex) => (
            <ComplexCard key={complex.id} complex={complex} />
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-16">
            No complexes found. Try adjusting your search.
          </p>
        )}
      </div>
    </div>
  )
}
