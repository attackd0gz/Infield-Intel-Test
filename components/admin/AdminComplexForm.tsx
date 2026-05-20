'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  const [loading, setLoading] = useState(false)
  const [amenities, setAmenities] = useState<string[]>(complex?.amenities ?? [])

  function toggleAmenity(a: string) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

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
