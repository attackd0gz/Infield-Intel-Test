import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { origin } = new URL(request.url)

  const formData = await request.formData()
  const id = formData.get('id') as string | null
  const complexId = formData.get('complexId') as string | null

  if (!id || !complexId) {
    return NextResponse.redirect(`${origin}/`, { status: 303 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`, { status: 303 })

  await supabase
    .from('owner_announcements')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id) // belt-and-suspenders; RLS delete policy enforces this too

  // Redirect back to the owner dashboard (safe — we construct the URL ourselves)
  return NextResponse.redirect(`${origin}/owner/${complexId}`, { status: 303 })
}
