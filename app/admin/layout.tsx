import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { LayoutDashboard, Users, MessageSquare, Star, Building2, LogOut, Shield, Inbox, BarChart2 } from 'lucide-react'

const NAV = [
  { href: '/admin',             label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/admin/analytics',   label: 'Analytics',        icon: BarChart2 },
  { href: '/admin/submissions', label: 'Submissions',       icon: Inbox },
  { href: '/admin/claims',      label: 'Claim Requests',    icon: Shield },
  { href: '/admin/complexes',   label: 'Complexes',         icon: Building2 },
  { href: '/admin/users',       label: 'Users',             icon: Users },
  { href: '/admin/reviews',     label: 'Reviews',           icon: Star },
  { href: '/admin/contacts',    label: 'Contact Messages',  icon: MessageSquare },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  const adminDb = createAdminClient()
  const { count: pendingSubmissions } = await adminDb
    .from('complex_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-zinc-950 text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400">Admin Panel</p>
          <p className="text-sm text-white/60 mt-0.5">{profile.full_name ?? profile.username}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {href === '/admin/submissions' && (pendingSubmissions ?? 0) > 0 && (
                <span className="ml-auto bg-amber-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {pendingSubmissions}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-zinc-50 overflow-auto">
        {children}
      </main>
    </div>
  )
}
