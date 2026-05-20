'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImagePlus } from 'lucide-react'
import type { Complex } from '@/types'

const AMENITY_OPTIONS = [
  'Concession Stand', 'Restrooms', 'Parking', 'Batting Cages',
  'Covered Dugouts', 'Field Lighting', 'Scoreboard', 'Press Box',
  'Bleacher Seating', 'Field House', 'Pitching Machines',
  'Training Facilities', 'Playground', 'ADA Accessible',
  'WiFi', 'Equipment Storage', 'Snack Bar',
]

export function EditComplexForm({ complex }: { complex: Complex }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(complex.cover_photo_url)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [amenities, setAmenities] = useState<string[]>(complex.amenities ?? [])

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  function toggleAmenity(a: string) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    let cover_photo_url = complex.cover_photo_url

    if (coverFile) {
      const ext = coverFile.name.split('.').pop()
      const path = `${complex.id}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('complex-covers')
        .upload(path, coverFile, { upsert: true })

      if (uploadErr) {
        toast.error('Cover upload failed: ' + uploadErr.message)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('complex-covers').getPublicUrl(path)
      cover_photo_url = publicUrl
    }

    const { error } = await supabase
      .from('complexes')
      .update({
        name: (form.get('name') as string).trim(),
        description: (form.get('description') as string).trim() || null,
        phone: (form.get('phone') as string).trim() || null,
        website: (form.get('website') as string).trim() || null,
        amenities,
        cover_photo_url,
      })
      .eq('id', complex.id)

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Listing updated!')
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Cover photo */}
      <div>
        <Label className="mb-2 block">Cover Photo</Label>
        <div
          className="relative w-full h-48 rounded-xl border-2 border-dashed border-input bg-muted flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImagePlus className="h-8 w-8" />
              <p className="text-sm">Click to upload a cover photo</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        {coverPreview && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs text-primary underline underline-offset-4 mt-1 hover:text-primary/80"
          >
            Change photo
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Complex Name</Label>
        <Input id="name" name="name" defaultValue={complex.name} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Textarea id="description" name="description" rows={4} defaultValue={complex.description ?? ''} placeholder="Tell visitors about your facility…" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={complex.phone ?? ''} placeholder="(210) 555-0100" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" type="url" defaultValue={complex.website ?? ''} placeholder="https://yourcomplex.com" />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Amenities</Label>
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

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
