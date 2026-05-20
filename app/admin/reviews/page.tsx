import { createAdminClient } from '@/lib/supabase/admin'
import { AdminDeleteReview } from '@/components/admin/AdminDeleteReview'

export const metadata = { title: 'Reviews | Admin' }

export default async function AdminReviewsPage() {
  const supabase = createAdminClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profile:profiles(username, full_name), complex:complexes(id, name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-wide uppercase mb-6">
        Reviews <span className="text-muted-foreground font-normal text-base ml-2">({reviews?.length ?? 0})</span>
      </h1>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-zinc-50 text-left">
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Review</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Complex</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">User</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Rating</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Date</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reviews?.map((r: {
              id: string
              title: string
              body: string
              rating: number
              created_at: string
              profile: { username: string; full_name: string | null } | null
              complex: { id: string; name: string } | null
            }) => (
              <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3 max-w-xs">
                  <p className="font-medium truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{r.body}</p>
                </td>
                <td className="px-4 py-3">
                  {r.complex && (
                    <a href={`/complexes/${r.complex.id}`} target="_blank" className="text-primary hover:underline text-xs">
                      {r.complex.name}
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">
                  @{r.profile?.username}
                </td>
                <td className="px-4 py-3 text-amber-500 font-medium">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <AdminDeleteReview reviewId={r.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!reviews || reviews.length === 0) && (
          <p className="px-4 py-8 text-center text-muted-foreground">No reviews yet.</p>
        )}
      </div>
    </div>
  )
}
