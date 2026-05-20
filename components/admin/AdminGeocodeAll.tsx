'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MapPin, Loader2 } from 'lucide-react'

interface Props {
  ungeocodedCount: number
}

export function AdminGeocodeAll({ ungeocodedCount }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (ungeocodedCount === 0) return null

  async function handleGeocode() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/geocode-all', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Geocoding failed')
      } else {
        toast.success(
          `Geocoded ${json.updated} of ${json.total} complexes` +
          (json.failed > 0 ? ` (${json.failed} failed — check addresses)` : '')
        )
        router.refresh()
      }
    } catch {
      toast.error('Geocoding request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleGeocode}
      disabled={loading}
      className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MapPin className="h-4 w-4" />
      )}
      {loading ? 'Geocoding…' : `Geocode ${ungeocodedCount} missing`}
    </Button>
  )
}
