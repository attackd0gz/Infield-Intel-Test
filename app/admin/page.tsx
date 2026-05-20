import { createAdminClient } from '@/lib/supabase/admin'
import { Users, Building2, Star, MessageSquare, Inbox } from 'lucide-react'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  const [
    { count: userCount },
    { count: complexCount },
    { count: reviewCount },
    { count: contactCount },
    { count: pendingSubmissions },
    { data: recentContacts },
    { data: recentReviews },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('complexes').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
    supabase.from('complex_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('reviews').select('*, profile:profiles(username), complex:complexes(name)').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Total Users',         value: userCount          ?? 0, icon: Users,         color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Complexes',           value: complexCount        ?? 0, icon: Building2,     color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Reviews',             value: reviewCount         ?? 0, icon: Star,          color: 'text-amber-600',  bg: 'bg-amber-50' },
    { label: 'Contact Messages',    value: contactCount        ?? 0, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Submissions', value: pendingSubmissions  ?? 0, icon: Inbox,         color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-wide uppercase mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border p-5 flex items-center gap-4">
            <div className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent contacts */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-sm uppercase tracking-wide">Recent Contact Messages</h2>
            <a href="/admin/contacts" className="text-xs text-primary hover:underline">View all</a>
          </div>
          <div className="divide-y">
            {recentContacts && recentContacts.length > 0 ? recentContacts.map((msg: { id: string; name: string; subject: string; email: string; created_at: string }) => (
              <div key={msg.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{msg.name}</p>
                    <p className="text-xs text-muted-foreground">{msg.subject}</p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) : (
              <p className="px-5 py-4 text-sm text-muted-foreground">No messages yet.</p>
            )}
          </div>
        </div>

        {/* Recent reviews */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-sm uppercase tracking-wide">Recent Reviews</h2>
            <a href="/admin/reviews" className="text-xs text-primary hover:underline">View all</a>
          </div>
          <div className="divide-y">
            {recentReviews && recentReviews.length > 0 ? recentReviews.map((r: { id: string; title: string; rating: number; profile: { username: string } | null; complex: { name: string } | null; created_at: string }) => (
              <div key={r.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      @{r.profile?.username} · {r.complex?.name} · {'★'.repeat(r.rating)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) : (
              <p className="px-5 py-4 text-sm text-muted-foreground">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
