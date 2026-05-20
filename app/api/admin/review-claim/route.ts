import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  // Verify caller is an admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { claimId, complexId, userId, action } = await request.json() as {
    claimId: string
    complexId: string
    userId: string
    action: 'approve' | 'deny'
  }

  const admin = createAdminClient()

  if (action === 'approve') {
    // Grant ownership
    const { error: complexErr } = await admin
      .from('complexes')
      .update({ owner_id: userId })
      .eq('id', complexId)

    if (complexErr) return NextResponse.json({ error: complexErr.message }, { status: 500 })

    // Upgrade role
    await admin.from('profiles').update({ role: 'owner' }).eq('id', userId)

    // Mark claim approved
    await admin
      .from('claim_requests')
      .update({ status: 'approved', reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq('id', claimId)
  } else {
    // Mark claim denied
    await admin
      .from('claim_requests')
      .update({ status: 'denied', reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq('id', claimId)
  }

  return NextResponse.json({ ok: true })
}
