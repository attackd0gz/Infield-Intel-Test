import { createClient } from '@/lib/supabase/server'
import { MapView } from '@/components/map/MapView'
import type { Complex } from '@/types'

export const metadata = { title: 'Map | Infield Intel' }

export default async function MapPage() {
  const supabase = await createClient()
  const { data: complexes } = await supabase
    .from('complexes')
    .select('id, name, address, city, state, lat, lng, average_rating, review_count, cover_photo_url, amenities')
    .order('name')

  return (
    <div className="h-[calc(100vh-4rem)]">
      <MapView complexes={(complexes as Complex[]) ?? []} />
    </div>
  )
}
