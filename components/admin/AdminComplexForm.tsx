'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImagePlus, X } from 'lucide-react'
import type { Complex } from '@/types'

const AMENITY_OPTIONS = [
  'Concessions', 'Restrooms', 'Parking', 'Lights', 'Covered Seating',
  'Scoreboard', 'Batting Cages', 'Bullpen Mounds', 'Wi-Fi', 'Bleachers',
  'Dugouts', 'Fenced Fields', 'Equipment Storage', 'Handicap Accessible',
  'First Aid Station', 'Pro Shop', 'Turf Fields',
]

interface Props {
  complex?: Complex
}

export function AdminComplexForm({ complex }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [amenities, setAmenities] = useState<string[]>(complex?.amenities ?? [])
  const [photoPreview, setPhotoPreview] = useState<string | null>(complex?.cover_photo_url ?? null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function removePhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function toggleAmenity(a: string) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    // Upload cover photo if a new file was selected
    let cover_photo_url = complex?.cover_photo_url ?? null
    if (photoFile) {
      const supabase = createClient()
      const ext = photoFile.name.split('.').pop()
      const path = `${complex?.id ?? crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('complex-photos')
        .upload(path, photoFile, { upsert: true })

      if (uploadError) {
        toast.error('Photo upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('complex-photos').getPublicUrl(path)
      cover_photo_url = publicUrl
    } else if (!photoPreview) {
      // User explicitly removed the photo
      cover_photo_url = null
    }

    const body = {
      complexId: complex?.id,
      name: (form.get('name') as string).trim(),
      address: (form.get('address') as string).trim(),
      city: (form.get('city') as string).trim(),
      state: (form.get('state') as string).trim(),
      zip: (form.get('zip') as string).trim(),
      phone: (form.get('phone') as string).trim(),
      website: (form.get('website') as string).trim(),
      description: (form.get('description') as string).trim(),
      amenities,
      cover_photo_url,
    }

    const res = await fetch('/api/admin/save-complex', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? 'Failed to save complex')
      setLoading(false)
      return
    }

    toast.success(complex ? 'Complex updated' : 'Complex created')
    router.push('/admin/complexes')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Basic info */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Basic Info</h2>

        <div className="space-y-1.5">
          <Label htmlFor="name">Complex Name <span className="text-destructive">*</span></Label>
          <Input id="name" name="name" required defaultValue={complex?.name} placeholder="e.g. Brooks City Base Sports Complex" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Street Address <span className="text-destructive">*</span></Label>
          <Input id="address" name="address" required defaultValue={complex?.address} placeholder="123 Main St" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1 space-y-1.5">
            <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
            <Input id="city" name="city" required defaultValue={complex?.city} placeholder="San Antonio" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
            <Input id="state" name="state" required defaultValue={complex?.state} placeholder="TX" maxLength={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zip">ZIP</Label>
            <Input id="zip" name="zip" defaultValue={complex?.zip ?? ''} placeholder="78220" />
          </div>
        </div>
      </div>

      {/* Cover Photo */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Cover Photo</h2>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />

        {photoPreview ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Cover preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={removePhoto}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-48 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-zinc-50 hover:bg-zinc-100 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
          >
            <ImagePlus className="h-8 w-8" />
            <span className="text-sm font-medium">Click to upload cover photo</span>
            <span className="text-xs">JPG, PNG or WebP — recommended 1200×630</span>
          </button>
        )}
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Contact</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={complex?.phone ?? ''} placeholder="(210) 555-0100" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" type="url" defaultValue={complex?.website ?? ''} placeholder="https://example.com" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Description</h2>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={complex?.description ?? ''}
          placeholder="Describe the complex, number of fields, special features…"
        />
      </div>

      {/* Amenities */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map(a => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                amenities.includes(a)
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="min-w-[140px]">
          {loading ? 'Saving…' : complex ? 'Save Changes' : 'Create Complex'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/complexes')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
