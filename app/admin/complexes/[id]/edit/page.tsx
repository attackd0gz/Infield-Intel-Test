import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminComplexForm } from '@/components/admin/AdminComplexForm'
import type { Complex } from '@/types'

export const metadata = { title: 'Edit Complex | Admin' }

export default async function AdminEditComplexPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: complex } = await supabase
    .from('complexes')
    .select('*')
    .eq('id', id)
    .single()

  if (!complex) notFound()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-wide uppercase">Edit Complex</h1>
        <p className="text-sm text-muted-foreground mt-1">{complex.name}</p>
      </div>
      <AdminComplexForm complex={complex as Complex} />
    </div>
  )
}
