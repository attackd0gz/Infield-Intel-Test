import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminDeleteComplex } from '@/components/admin/AdminDeleteComplex'
import { Button } from '@/components/ui/button'
import { Plus, Pencil } from 'lucide-react'
import type { Complex } from '@/types'

export const metadata = { title: 'Complexes | Admin' }

export default async function AdminComplexesPage() {
  const supabase = createAdminClient()
  const { data: complexes } = await supabase
    .from('complexes')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-wide uppercase">
          Complexes <span className="text-muted-foreground font-normal text-base ml-2">({complexes?.length ?? 0})</span>
        </h1>
        <Link href="/admin/complexes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Complex
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-zinc-50 text-left">
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Name</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">City</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Rating</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Reviews</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Owner</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(complexes as Complex[])?.map(c => (
              <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{c.city}, {c.state}</td>
                <td className="px-4 py-3">
                  {c.average_rating > 0 ? (
                    <span className="text-amber-500 font-medium">★ {c.average_rating.toFixed(1)}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">No ratings</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">{c.review_count}</td>
                <td className="px-4 py-3 text-xs">
                  {c.owner_id ? (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Claimed</span>
                  ) : (
                    <span className="text-muted-foreground">Unclaimed</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <a href={`/complexes/${c.id}`} target="_blank" className="text-xs text-primary hover:underline mr-1">
                      View
                    </a>
                    <Link href={`/admin/complexes/${c.id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <AdminDeleteComplex complexId={c.id} name={c.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!complexes || complexes.length === 0) && (
          <p className="px-4 py-8 text-center text-muted-foreground">No complexes yet.</p>
        )}
      </div>
    </div>
  )
}
