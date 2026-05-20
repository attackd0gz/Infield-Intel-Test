import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const id = searchParams.get('id')
  const referer = request.headers.get('referer') ?? `${origin}/`

  if (!id) return NextResponse.redirect(referer)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`)

  await supabase
    .from('owner_announcements')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id) // RLS double-check

  return NextResponse.redirect(referer)
}
