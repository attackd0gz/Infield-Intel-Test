'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera } from 'lucide-react'
import type { Profile } from '@/types'

interface Props {
  profile: Profile
}

export function EditProfileForm({ profile }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    let avatar_url = profile.avatar_url

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${profile.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })

      if (uploadError) {
        toast.error('Avatar upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      avatar_url = publicUrl
    }

    const username = (form.get('username') as string).trim().toLowerCase()
    const full_name = (form.get('full_name') as string).trim()
    const bio = (form.get('bio') as string).trim()

    // Check username uniqueness if changed
    if (username !== profile.username) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      if (existing) {
        toast.error('That username is already taken.')
        setLoading(false)
        return
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name, username, bio: bio || null, avatar_url })
      .eq('id', profile.id)

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Profile updated!')
    router.push(`/profile/${username}`)
    router.refresh()
  }

  const initials = (profile.full_name ?? profile.username).charAt(0).toUpperCase()

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarPreview ?? undefined} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
            aria-label="Change avatar"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <p className="text-sm font-semibold">Profile Photo</p>
          <p className="text-xs text-muted-foreground">JPG, PNG or GIF — max 5 MB</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs text-primary underline underline-offset-4 mt-1 hover:text-primary/80"
          >
            Change photo
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={profile.full_name ?? ''}
          required
          autoComplete="name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <div className="flex items-center">
          <span className="h-10 px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm flex items-center">@</span>
          <Input
            id="username"
            name="username"
            defaultValue={profile.username}
            required
            pattern="[a-zA-Z0-9_]{3,30}"
            title="3–30 characters: letters, numbers, underscores only"
            className="rounded-l-none"
          />
        </div>
        <p className="text-xs text-muted-foreground">3–30 characters. Letters, numbers, and underscores only.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ''}
          rows={3}
          maxLength={200}
          placeholder="Tell the community a bit about yourself…"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save Changes'}
        </Button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
