import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { geocodeAddress } from '@/lib/geocode'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

export async function POST(request: Request) {
  const caller = await verifyAdmin()
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json() as {
    complexId?: string
    name: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    website: string
    description: string
    amenities: string[]
    cover_photo_url: string | null
  }

  const { complexId, ...fields } = body

  if (!fields.name || !fields.address || !fields.city || !fields.state) {
    return NextResponse.json({ error: 'name, address, city, and state are required' }, { status: 400 })
  }

  // Geocode the address — best-effort, non-blocking on failure
  const coords = await geocodeAddress(fields.address, fields.city, fields.state, fields.zip || null)

  const admin = createAdminClient()

  if (complexId) {
    // Update — only overwrite lat/lng if geocoding succeeded
    const locationFields = coords ? { lat: coords.lat, lng: coords.lng } : {}
    const { error } = await admin
      .from('complexes')
      .update({
        name: fields.name,
        address: fields.address,
        city: fields.city,
        state: fields.state,
        zip: fields.zip || null,
        phone: fields.phone || null,
        website: fields.website || null,
        description: fields.description || null,
        amenities: fields.amenities ?? [],
        cover_photo_url: fields.cover_photo_url ?? null,
        ...locationFields,
      })
      .eq('id', complexId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, complexId, geocoded: !!coords })
  } else {
    // Insert
    const { data, error } = await admin
      .from('complexes')
      .insert({
        name: fields.name,
        address: fields.address,
        city: fields.city,
        state: fields.state,
        zip: fields.zip || null,
        phone: fields.phone || null,
        website: fields.website || null,
        description: fields.description || null,
        amenities: fields.amenities ?? [],
        cover_photo_url: fields.cover_photo_url ?? null,
        lat: coords?.lat ?? 0,
        lng: coords?.lng ?? 0,
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, complexId: data.id, geocoded: !!coords })
  }
}
