import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  const { submissionId, action, adminNotes } = await request.json() as {
    submissionId: string
    action: 'approve' | 'reject'
    adminNotes?: string
  }

  if (!submissionId || !action) {
    return NextResponse.json({ error: 'submissionId and action are required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch the submission
  const { data: sub, error: fetchError } = await admin
    .from('complex_submissions')
    .select('*')
    .eq('id', submissionId)
    .single()

  if (fetchError || !sub) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  if (sub.status !== 'pending') {
    return NextResponse.json({ error: 'Submission has already been reviewed' }, { status: 409 })
  }

  if (action === 'approve') {
    // Create the complex (lat/lng default to 0 — admin can geocode later)
    const { error: insertError } = await admin.from('complexes').insert({
      name:        sub.name,
      address:     sub.address,
      city:        sub.city,
      state:       sub.state,
      zip:         sub.zip         ?? null,
      phone:       sub.phone       ?? null,
      website:     sub.website     ?? null,
      description: sub.description ?? null,
      amenities:   sub.amenities   ?? [],
      lat: 0,
      lng: 0,
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }
  }

  // Mark submission as reviewed
  const { error: updateError } = await admin
    .from('complex_submissions')
    .update({
      status:      action === 'approve' ? 'approved' : 'rejected',
      admin_notes: adminNotes || null,
      reviewed_by: caller.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', submissionId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
