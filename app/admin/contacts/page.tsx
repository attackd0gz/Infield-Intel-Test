import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = { title: 'Contact Messages | Admin' }

export default async function AdminContactsPage() {
  const supabase = createAdminClient()
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-wide uppercase mb-6">Contact Messages</h1>

      {messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((msg: { id: string; name: string; email: string; subject: string; message: string; created_at: string }) => (
            <div key={msg.id} className="bg-white rounded-xl border p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold">{msg.name}</p>
                  <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline">{msg.email}</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-1 rounded-full">{msg.subject}</span>
                  <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.message}</p>
              <div className="mt-3">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reply via email →
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-10 text-center text-muted-foreground">
          No contact messages yet.
        </div>
      )}
    </div>
  )
}
