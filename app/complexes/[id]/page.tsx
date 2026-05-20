import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Globe, Star } from 'lucide-react'
import { ReviewList } from '@/components/reviews/ReviewList'
import { WriteReviewButton } from '@/components/reviews/WriteReviewButton'
import { ClaimButton } from '@/components/complexes/ClaimButton'
import type { Complex } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('complexes').select('name').eq('id', id).single()
  return { title: data ? `${data.name} | Infield Intel` : 'Complex | Infield Intel' }
}

export default async function ComplexPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: complex } = await supabase
    .from('complexes')
    .select('*')
    .eq('id', id)
    .single()

  if (!complex) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profile:profiles(*), photos:review_photos(*)')
    .eq('complex_id', id)
    .order('created_at', { ascending: false })

  const { data: announcements } = await supabase
    .from('owner_announcements')
    .select('*')
    .eq('complex_id', id)
    .order('created_at', { ascending: false })

  // Check if current user already has a pending claim for this complex
  const { data: existingClaim } = user
    ? await supabase
        .from('claim_requests')
        .select('status')
        .eq('complex_id', id)
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null }

  // Fetch which reviews this user has already voted helpful
  const { data: userVotes } = user && reviews
    ? await supabase
        .from('helpful_votes')
        .select('review_id')
        .eq('user_id', user.id)
        .in('review_id', reviews.map(r => r.id))
    : { data: [] }
  const votedReviewIds = new Set((userVotes ?? []).map(v => v.review_id))

  const c = complex as Complex

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        {c.cover_photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.cover_photo_url}
            alt={c.name}
            className="w-full h-56 object-cover rounded-xl mb-6"
          />
        )}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{c.name}</h1>
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span>{c.address}, {c.city}, {c.state} {c.zip}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <Star
                    key={n}
                    className={`h-5 w-5 ${n <= Math.round(c.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <span className="font-semibold">{c.average_rating > 0 ? c.average_rating.toFixed(1) : '—'}</span>
              <span className="text-muted-foreground text-sm">({c.review_count} {c.review_count === 1 ? 'review' : 'reviews'})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClaimButton
              complexId={c.id}
              complexName={c.name}
              ownerId={c.owner_id}
              currentUserId={user?.id ?? null}
              hasPendingClaim={existingClaim?.status === 'pending'}
            />
            <WriteReviewButton complexId={c.id} userId={user?.id ?? null} existingReview={reviews?.find(r => r.user_id === user?.id) ?? null} />
          </div>
        </div>
      </div>

      <Tabs defaultValue="reviews">
        <TabsList className="mb-6">
          <TabsTrigger value="reviews">Reviews ({c.review_count})</TabsTrigger>
          <TabsTrigger value="info">Info & Amenities</TabsTrigger>
          {announcements && announcements.length > 0 && (
            <TabsTrigger value="updates">Owner Updates ({announcements.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="reviews">
          <ReviewList reviews={reviews ?? []} currentUserId={user?.id ?? null} votedReviewIds={votedReviewIds} />
        </TabsContent>

        <TabsContent value="info">
          <div className="space-y-6">
            {c.description && (
              <div>
                <h2 className="font-semibold text-lg mb-2">About</h2>
                <p className="text-muted-foreground">{c.description}</p>
              </div>
            )}
            <div>
              <h2 className="font-semibold text-lg mb-3">Amenities</h2>
              {c.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {c.amenities.map(a => (
                    <Badge key={a} variant="secondary">{a}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No amenities listed yet.</p>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-3">Contact</h2>
              <div className="space-y-2">
                {c.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a>
                  </div>
                )}
                {c.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={c.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                      {c.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {!c.phone && !c.website && (
                  <p className="text-muted-foreground text-sm">No contact info available.</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {announcements && announcements.length > 0 && (
          <TabsContent value="updates">
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="capitalize">{a.announcement_type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{a.title}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.body}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
