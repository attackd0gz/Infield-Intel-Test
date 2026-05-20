'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const TYPES = [
  { value: 'update', label: '📢 General Update' },
  { value: 'renovation', label: '🔨 Renovation' },
  { value: 'event', label: '🏆 Event' },
  { value: 'hours', label: '🕐 Hours / Closure' },
]

interface Props {
  complexId: string
  userId: string
}

export function PostAnnouncementForm({ complexId, userId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('update')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase.from('owner_announcements').insert({
      complex_id: complexId,
      owner_id: userId,
      title: (form.get('title') as string).trim(),
      body: (form.get('body') as string).trim(),
      announcement_type: type,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Announcement posted!')
    ;(e.target as HTMLFormElement).reset()
    setType('update')
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div>
        <Label className="mb-2 block">Type</Label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                type === t.value
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="e.g. Field 3 resurfacing this weekend" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Details</Label>
        <Textarea
          id="body"
          name="body"
          required
          rows={5}
          placeholder="Give visitors all the details they need to know…"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Posting…' : 'Post Announcement'}
      </Button>
    </form>
  )
}
