'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { Star, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Complex } from '@/types'

// Default center: continental US
const US_CENTER = { lat: 39.5, lng: -98.35 }
const US_ZOOM = 4

interface Props {
  complexes: Complex[]
}

export function MapView({ complexes }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Complex | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setError('Google Maps API key is not configured.')
      return
    }

    setOptions({ key: apiKey })

    async function initMap() {
      try {
        const { Map } = await importLibrary('maps') as google.maps.MapsLibrary

        // Only plot complexes with real coordinates (not the 0,0 default)
        const valid = complexes.filter(c => c.lat !== 0 || c.lng !== 0)

        const map = new Map(mapRef.current!, {
          center: US_CENTER,
          zoom: US_ZOOM,
          streetViewControl: false,
          mapTypeControl: false,
        })

        if (valid.length > 0) {
          const bounds = new google.maps.LatLngBounds()
          valid.forEach(c => bounds.extend({ lat: c.lat, lng: c.lng }))
          map.fitBounds(bounds, 60)
        }

        valid.forEach((complex) => {
          const marker = new google.maps.Marker({
            map,
            position: { lat: complex.lat, lng: complex.lng },
            title: complex.name,
            label: {
              text: complex.average_rating > 0
                ? `⚾ ${complex.average_rating.toFixed(1)}`
                : '⚾',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 'bold',
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 18,
              fillColor: '#15803d',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          })

          marker.addListener('click', () => setSelected(complex))
        })

        setMapLoaded(true)
      } catch (err) {
        console.error('Map init error:', err)
        setError('Failed to load map. Check the browser console for details.')
      }
    }

    initMap()
  }, [complexes])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {!mapLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Loading map…</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {selected && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-10">
          <Card className="p-4 shadow-lg">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-3 text-muted-foreground hover:text-foreground text-lg leading-none"
            >
              ×
            </button>
            <h3 className="font-semibold text-base pr-4 mb-1">{selected.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>{selected.city}, {selected.state}</span>
            </div>
            <div className="flex items-center gap-1 mb-3">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-sm">
                {selected.average_rating > 0 ? selected.average_rating.toFixed(1) : '—'}
              </span>
              <span className="text-xs text-muted-foreground">
                ({selected.review_count} {selected.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            {selected.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {selected.amenities.slice(0, 4).map(a => (
                  <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                ))}
              </div>
            )}
            <Link href={`/complexes/${selected.id}`}>
              <Button size="sm" className="w-full">View Complex</Button>
            </Link>
          </Card>
        </div>
      )}
    </div>
  )
}
