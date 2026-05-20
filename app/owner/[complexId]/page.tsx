import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Star, ArrowLeft, Megaphone, Pencil, Trash2 } from 'lucide-react'
import { EditComplexForm } from '@/components/owner/EditComplexForm'
import { PostAnnouncementForm } from '@/components/owner/PostAnnouncementForm'
import type { Complex } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ complexId: string }> }) {
  const { complexId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('complexes').select('name').eq('id', complexId).single()
  return { title: data ? `Manage ${data.name} | Infield Intel` : 'Owner Dashboard' }
}

export default async function OwnerDashboardPage({ params }: { params: Promise<{ complexId: string }> }) {
  const { complexId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: complex } = await supabase
    .from('complexes')
    .select('*')
    .eq('id', complexId)
    .single()

  if (!complex) notFound()

  // Only the owner of this specific complex can access this page
  if (complex.owner_id !== user.id) redirect(`/complexes/${complexId}`)

  const { data: announcements } = await supabase
    .from('owner_announcements')
    .select('*')
    .eq('complex_id', complexId)
    .order('created_at', { ascending: false })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profile:profiles(username, full_name, avatar_url, badge_level)')
    .eq('complex_id', complexId)
    .order('created_at', { ascending: false })

  const c = complex as Complex

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/complexes/${complexId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to listing
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-wide uppercase">{c.name}</h1>
            <p className="text-muted-foreground text-sm">{c.city}, {c.state}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500 text-black font-semibold">Owner</Badge>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Avg Rating', value: c.average_rating > 0 ? `★ ${c.average_rating.toFixed(1)}` : '—' },
            { label: 'Total Reviews', value: c.review_count },
            { label: 'Announcements', value: announcements?.length ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-zinc-50 rounded-lg border px-4 py-3">
              <p className="text-lg font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="edit">
        <TabsList className="mb-6">
          <TabsTrigger value="edit" className="gap-2">
            <Pencil className="h-3.5 w-3.5" />
            Edit Listing
          </TabsTrigger>
          <TabsTrigger value="announce" className="gap-2">
            <Megaphone className="h-3.5 w-3.5" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <Star className="h-3.5 w-3.5" />
            Reviews ({c.review_count})
          </TabsTrigger>
        </TabsList>

        {/* Edit listing */}
        <TabsContent value="edit">
          <EditComplexForm complex={c} />
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announce">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="font-semibold text-lg mb-4">Post an Announcement</h2>
              <PostAnnouncementForm complexId={complexId} userId={user.id} />
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-4">
                Previous Announcements
                <span className="text-muted-foreground font-normal text-sm ml-2">({announcements?.length ?? 0})</span>
              </h2>
              {announcements && announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((a: {
                    id: string
                    title: string
                    body: string
                    announcement_type: string
                    created_at: string
                  }) => (
                    <div key={a.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize text-xs">{a.announcement_type}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                        </div>
                        <form action="/api/owner/delete-announcement" method="POST">
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="complexId" value={complexId} />
                          <button
                            type="submit"
                            className="text-muted-foreground hover:text-red-600 transition-colors"
                            title="Delete announcement"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                      <p className="font-semibold text-sm">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No announcements yet. Post your first one!</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews">
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((r: {
                id: string
                rating: number
                title: string
                body: string
                created_at: string
                profile: { username: string; full_name: string | null; badge_level: string } | null
              }) => (
                <div key={r.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-sm">{r.profile?.full_name ?? r.profile?.username}</p>
                      <p className="text-xs text-muted-foreground">@{r.profile?.username} · {r.profile?.badge_level}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`h-4 w-4 ${n <= r.rating ? 'fill-amber-400' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="font-medium text-sm mb-1">{r.title}</p>
                  <p className="text-sm text-muted-foreground">{r.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No reviews yet for this complex.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
