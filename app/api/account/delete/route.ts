import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Remove avatar from storage (path is stored in profile.avatar_url)
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (profile?.avatar_url) {
      // URL pattern: .../storage/v1/object/public/avatars/<path>
      const match = profile.avatar_url.match(/\/storage\/v1\/object\/public\/avatars\/(.+)/)
      if (match) {
        await supabase.storage.from('avatars').remove([decodeURIComponent(match[1])])
      }
    }

    // 2. Remove all review photos from storage (user folder = review-photos/<userId>/*)
    const { data: photoFiles } = await supabase.storage
      .from('review-photos')
      .list(user.id)

    if (photoFiles && photoFiles.length > 0) {
      const paths = photoFiles.map(f => `${user.id}/${f.name}`)
      await supabase.storage.from('review-photos').remove(paths)
    }

    // 3. Delete the auth user — cascades to profiles, reviews, photos, votes, claims, etc.
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Account deletion error:', err)
    return NextResponse.json({ error: 'Deletion failed. Please try again.' }, { status: 500 })
  }
}
