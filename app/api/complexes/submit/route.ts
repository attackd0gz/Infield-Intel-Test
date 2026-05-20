import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    name: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    website: string
    description: string
    amenities: string[]
    notes: string
  }

  if (!body.name || !body.address || !body.city || !body.state) {
    return NextResponse.json(
      { error: 'name, address, city, and state are required' },
      { status: 400 },
    )
  }

  const { error } = await supabase.from('complex_submissions').insert({
    submitted_by: user.id,
    name:         body.name,
    address:      body.address,
    city:         body.city,
    state:        body.state,
    zip:          body.zip         || null,
    phone:        body.phone       || null,
    website:      body.website     || null,
    description:  body.description || null,
    amenities:    body.amenities   ?? [],
    notes:        body.notes       || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
