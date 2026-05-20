import { createAdminClient } from '@/lib/supabase/admin'
import { SubmissionActions } from '@/components/admin/SubmissionActions'
import { Building2, Clock, ExternalLink } from 'lucide-react'
import type { ComplexSubmission } from '@/types'

export const metadata = { title: 'Complex Submissions' }

export default async function AdminSubmissionsPage() {
  const admin = createAdminClient()
  const { data: submissions } = await admin
    .from('complex_submissions')
    .select('*, profile:profiles(username, full_name)')
    .order('created_at', { ascending: false })

  const all = (submissions ?? []) as ComplexSubmission[]
  const pending  = all.filter(s => s.status === 'pending')
  const reviewed = all.filter(s => s.status !== 'pending')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-wide uppercase">Complex Submissions</h1>
        {pending.length > 0 && (
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
            {pending.length} pending
          </span>
        )}
      </div>

      {all.length === 0 && (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg mb-1">No submissions yet</p>
          <p className="text-muted-foreground text-sm">
            When users submit new complexes, they&apos;ll appear here for review.
          </p>
        </div>
      )}

      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Pending Review
          </h2>
          <div className="space-y-4">
            {pending.map(sub => (
              <SubmissionCard key={sub.id} submission={sub} showActions />
            ))}
          </div>
        </section>
      )}

      {reviewed.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Previously Reviewed
          </h2>
          <div className="space-y-4">
            {reviewed.map(sub => (
              <SubmissionCard key={sub.id} submission={sub} showActions={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SubmissionCard({
  submission: s,
  showActions,
}: {
  submission: ComplexSubmission
  showActions: boolean
}) {
  const statusStyle = {
    pending:  'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-green-50  text-green-700  border-green-200',
    rejected: 'bg-red-50    text-red-700    border-red-200',
  }[s.status]

  return (
    <div className="bg-white rounded-xl border p-5">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-base">{s.name}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyle}`}>
              {s.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {s.address}, {s.city}, {s.state}{s.zip ? ` ${s.zip}` : ''}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground shrink-0">
          <p className="font-medium">@{s.profile?.username ?? 'unknown'}</p>
          <p className="flex items-center gap-1 justify-end mt-0.5">
            <Clock className="h-3 w-3" />
            {new Date(s.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Contact row */}
      {(s.phone || s.website) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mb-3">
          {s.phone && (
            <span><span className="text-muted-foreground">Phone: </span>{s.phone}</span>
          )}
          {s.website && (
            <a
              href={s.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {s.website}
            </a>
          )}
        </div>
      )}

      {/* Description */}
      {s.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{s.description}</p>
      )}

      {/* Amenities */}
      {s.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {s.amenities.map(a => (
            <span key={a} className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">
              {a}
            </span>
          ))}
        </div>
      )}

      {/* Submitter notes */}
      {s.notes && (
        <div className="bg-zinc-50 rounded-lg px-3 py-2 text-sm mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Submitter notes:{' '}
          </span>
          {s.notes}
        </div>
      )}

      {/* Admin rejection notes */}
      {s.admin_notes && !showActions && (
        <div className="bg-red-50 rounded-lg px-3 py-2 text-sm mb-3 text-red-700">
          <span className="text-xs font-semibold uppercase tracking-wide">
            Admin notes:{' '}
          </span>
          {s.admin_notes}
        </div>
      )}

      {showActions && <SubmissionActions submissionId={s.id} />}
    </div>
  )
}
