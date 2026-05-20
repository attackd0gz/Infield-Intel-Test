import { createAdminClient } from '@/lib/supabase/admin'
import { AdminClaimActions } from '@/components/admin/AdminClaimActions'
import { Badge } from '@/components/ui/badge'

export const metadata = { title: 'Claim Requests | Admin' }

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  denied: 'bg-red-100 text-red-800 border-red-200',
}

export default async function AdminClaimsPage() {
  const supabase = createAdminClient()

  const { data: claims } = await supabase
    .from('claim_requests')
    .select(`
      *,
      complex:complexes(id, name, city, state),
      profile:profiles(id, username, full_name, email)
    `)
    .order('created_at', { ascending: false })

  const pending = claims?.filter(c => c.status === 'pending') ?? []
  const reviewed = claims?.filter(c => c.status !== 'pending') ?? []

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-wide uppercase mb-2">Claim Requests</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Review and approve or deny ownership claims submitted by users.
      </p>

      {/* Pending */}
      <section className="mb-10">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-amber-600 mb-4">
          Pending Review ({pending.length})
        </h2>
        {pending.length > 0 ? (
          <div className="space-y-4">
            {pending.map((claim: {
              id: string
              complex_id: string
              user_id: string
              contact_name: string
              contact_email: string
              contact_phone: string | null
              role_at_complex: string
              notes: string | null
              status: string
              created_at: string
              complex: { id: string; name: string; city: string; state: string } | null
              profile: { id: string; username: string; full_name: string | null } | null
            }) => (
              <div key={claim.id} className="bg-white rounded-xl border shadow-sm p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    {/* Complex */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Complex</p>
                      <a
                        href={`/complexes/${claim.complex?.id}`}
                        target="_blank"
                        className="font-bold text-primary hover:underline"
                      >
                        {claim.complex?.name}
                      </a>
                      <p className="text-xs text-muted-foreground">{claim.complex?.city}, {claim.complex?.state}</p>
                    </div>

                    {/* Submitted by */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Submitted By</p>
                      <p className="text-sm font-medium">{claim.contact_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Infield Intel account: @{claim.profile?.username}
                        {claim.profile?.full_name && ` (${claim.profile.full_name})`}
                      </p>
                    </div>

                    {/* Contact details */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <a href={`mailto:${claim.contact_email}`} className="text-primary hover:underline text-xs">
                          {claim.contact_email}
                        </a>
                      </div>
                      {claim.contact_phone && (
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <a href={`tel:${claim.contact_phone}`} className="text-xs hover:underline">
                            {claim.contact_phone}
                          </a>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Role</p>
                        <p className="text-xs font-medium">{claim.role_at_complex}</p>
                      </div>
                    </div>

                    {claim.notes && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Notes</p>
                        <p className="text-sm bg-zinc-50 rounded-lg p-3 border">{claim.notes}</p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(claim.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="lg:shrink-0">
                    <AdminClaimActions
                      claimId={claim.id}
                      complexId={claim.complex_id}
                      userId={claim.user_id}
                      complexName={claim.complex?.name ?? ''}
                      applicantName={claim.contact_name}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-8 text-center text-muted-foreground text-sm">
            No pending claims. You&apos;re all caught up.
          </div>
        )}
      </section>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <section>
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">
            Previously Reviewed ({reviewed.length})
          </h2>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-zinc-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Complex</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Applicant</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reviewed.map((claim: {
                  id: string
                  contact_name: string
                  role_at_complex: string
                  status: string
                  created_at: string
                  complex: { name: string } | null
                  profile: { username: string } | null
                }) => (
                  <tr key={claim.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium">{claim.complex?.name}</td>
                    <td className="px-4 py-3 text-xs">
                      <p>{claim.contact_name}</p>
                      <p className="text-muted-foreground">@{claim.profile?.username}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{claim.role_at_complex}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border capitalize ${STATUS_STYLES[claim.status]}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
