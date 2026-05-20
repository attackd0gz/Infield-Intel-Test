import { createAdminClient } from '@/lib/supabase/admin'
import { AdminUserRow } from '@/components/admin/AdminUserRow'
import { AdminAddUserDialog } from '@/components/admin/AdminAddUserDialog'
import type { Profile } from '@/types'

export const metadata = { title: 'Users | Admin' }

export default async function AdminUsersPage() {
  const supabase = createAdminClient()
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-wide uppercase">
          Users <span className="text-muted-foreground font-normal text-base ml-2">({users?.length ?? 0})</span>
        </h1>
        <AdminAddUserDialog />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-zinc-50 text-left">
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">User</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Badge</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Points</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Reviews</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Role</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Joined</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users?.map(user => (
              <AdminUserRow key={user.id} user={user as Profile} />
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <p className="px-4 py-8 text-center text-muted-foreground">No users yet.</p>
        )}
      </div>
    </div>
  )
}
