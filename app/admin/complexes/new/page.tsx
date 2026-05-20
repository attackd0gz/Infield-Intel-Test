import { AdminComplexForm } from '@/components/admin/AdminComplexForm'

export const metadata = { title: 'Add Complex | Admin' }

export default function AdminNewComplexPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-wide uppercase">Add Complex</h1>
        <p className="text-sm text-muted-foreground mt-1">Create a new baseball complex listing.</p>
      </div>
      <AdminComplexForm />
    </div>
  )
}
