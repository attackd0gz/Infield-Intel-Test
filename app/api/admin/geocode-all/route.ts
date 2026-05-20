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

export async function POST() {
  const caller = await verifyAdmin()
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()

  // Fetch all complexes that still have the default 0,0 coordinates
  const { data: complexes, error } = await admin
    .from('complexes')
    .select('id, name, address, city, state, zip')
    .eq('lat', 0)
    .eq('lng', 0)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!complexes || complexes.length === 0) {
    return NextResponse.json({ ok: true, updated: 0, failed: 0 })
  }

  let updated = 0
  let failed = 0

  for (const c of complexes) {
    const coords = await geocodeAddress(c.address, c.city, c.state, c.zip)
    if (!coords) {
      failed++
      continue
    }

    const { error: updateError } = await admin
      .from('complexes')
      .update({ lat: coords.lat, lng: coords.lng })
      .eq('id', c.id)

    if (updateError) {
      failed++
    } else {
      updated++
    }

    // Small delay to stay within Google's rate limit (50 req/s)
    await new Promise(r => setTimeout(r, 25))
  }

  return NextResponse.json({ ok: true, updated, failed, total: complexes.length })
}
