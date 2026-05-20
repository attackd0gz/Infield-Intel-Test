/**
 * Run once to seed baseball complexes from Google Places API.
 * Usage: npx tsx lib/google/seed-complexes.ts
 *
 * Requires env vars:
 *   GOOGLE_PLACES_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const SEARCH_QUERIES = [
  'baseball complex San Antonio Texas',
  'baseball field San Antonio Texas',
  'youth baseball complex San Antonio',
  'softball complex San Antonio Texas',
]

interface PlaceResult {
  place_id: string
  name: string
  vicinity: string
  geometry: { location: { lat: number; lng: number } }
  rating?: number
  formatted_phone_number?: string
  website?: string
  types: string[]
}

async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
  url.searchParams.set('query', query)
  url.searchParams.set('key', PLACES_API_KEY)

  const res = await fetch(url.toString())
  const data = await res.json()
  return data.results ?? []
}

async function getPlaceDetails(placeId: string): Promise<Partial<PlaceResult>> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'name,formatted_address,geometry,formatted_phone_number,website,types')
  url.searchParams.set('key', PLACES_API_KEY)

  const res = await fetch(url.toString())
  const data = await res.json()
  return data.result ?? {}
}

function parseAddress(address: string) {
  const parts = address.split(',').map(s => s.trim())
  const street = parts[0] ?? ''
  const city = parts[1] ?? 'San Antonio'
  const stateZip = (parts[2] ?? 'TX').trim().split(' ')
  const state = stateZip[0] ?? 'TX'
  const zip = stateZip[1] ?? null
  return { street, city, state, zip }
}

async function seed() {
  const seenPlaceIds = new Set<string>()

  for (const query of SEARCH_QUERIES) {
    console.log(`Searching: "${query}"`)
    const results = await searchPlaces(query)

    for (const place of results) {
      if (seenPlaceIds.has(place.place_id)) continue
      seenPlaceIds.add(place.place_id)

      const details = await getPlaceDetails(place.place_id)
      const address = (details as { formatted_address?: string }).formatted_address ?? place.vicinity
      const { street, city, state, zip } = parseAddress(address)

      const row = {
        google_place_id: place.place_id,
        name: place.name,
        address: street,
        city,
        state,
        zip,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        phone: (details as { formatted_phone_number?: string }).formatted_phone_number ?? null,
        website: (details as { website?: string }).website ?? null,
        amenities: [],
      }

      const { error } = await supabase
        .from('complexes')
        .upsert(row, { onConflict: 'google_place_id' })

      if (error) {
        console.error(`Failed to insert ${place.name}:`, error.message)
      } else {
        console.log(`  ✓ ${place.name} — ${city}, ${state}`)
      }

      // Stay within Places API rate limits
      await new Promise(r => setTimeout(r, 200))
    }
  }

  console.log('\nSeeding complete.')
}

seed().catch(console.error)
