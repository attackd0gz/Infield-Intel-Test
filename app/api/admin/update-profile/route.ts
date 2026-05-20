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

  const { userId, full_name, username, bio } = await request.json() as {
    userId: string
    full_name: string
    username: string
    bio: string
  }

  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

  const admin = createAdminClient()

  // Check username uniqueness if changed
  if (username) {
    const { data: existing } = await admin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', userId)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 400 })
    }
  }

  const { error } = await admin
    .from('profiles')
    .update({
      full_name: full_name || null,
      username: username || undefined,
      bio: bio || null,
    })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
