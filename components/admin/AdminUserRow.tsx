'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { AdminEditUserDialog } from './AdminEditUserDialog'
import { AdminDeleteUser } from './AdminDeleteUser'
import type { Profile, UserRole } from '@/types'

const ROLES: UserRole[] = ['user', 'owner', 'admin']

const ROLE_STYLES: Record<UserRole, string> = {
  user: 'bg-zinc-100 text-zinc-700',
  owner: 'bg-blue-100 text-blue-700',
  admin: 'bg-amber-100 text-amber-700',
}

export function AdminUserRow({ user }: { user: Profile }) {
  const [role, setRole] = useState<UserRole>(user.role)
  const [saving, setSaving] = useState(false)

  async function handleRoleChange(newRole: UserRole) {
    if (newRole === role) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id)

    if (error) {
      toast.error('Failed to update role: ' + error.message)
    } else {
      setRole(newRole)
      toast.success(`${user.username} is now ${newRole}`)
    }
    setSaving(false)
  }

  return (
    <tr className="hover:bg-zinc-50 transition-colors">
      <td className="px-4 py-3">
        <a href={`/profile/${user.username}`} target="_blank" className="font-medium hover:underline text-primary">
          {user.full_name ?? user.username}
        </a>
        <p className="text-xs text-muted-foreground">@{user.username}</p>
      </td>
      <td className="px-4 py-3 text-xs">{user.badge_level}</td>
      <td className="px-4 py-3 text-xs">{user.points.toLocaleString()}</td>
      <td className="px-4 py-3 text-xs">{user.review_count}</td>
      <td className="px-4 py-3">
        <select
          value={role}
          disabled={saving}
          onChange={e => handleRoleChange(e.target.value as UserRole)}
          className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-1 focus:ring-ring ${ROLE_STYLES[role]}`}
        >
          {ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <AdminEditUserDialog user={user} />
          <AdminDeleteUser userId={user.id} username={user.username} />
        </div>
      </td>
    </tr>
  )
}
