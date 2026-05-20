'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { Star, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Complex } from '@/types'

interface Props {
  complexes: Complex[]
}

export function MapView({ complexes }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Complex | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapRef.current || complexes.length === 0) return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return

    setOptions({ key: apiKey })

    async function initMap() {
      const { Map } = await importLibrary('maps') as google.maps.MapsLibrary
      const { AdvancedMarkerElement } = await importLibrary('marker') as google.maps.MarkerLibrary

      const bounds = new google.maps.LatLngBounds()
      complexes.forEach(c => bounds.extend({ lat: c.lat, lng: c.lng }))

      const map = new Map(mapRef.current!, {
        mapId: 'infield-intel-map',
        center: bounds.getCenter(),
        zoom: 11,
        streetViewControl: false,
        mapTypeControl: false,
      })

      map.fitBounds(bounds, 40)

      complexes.forEach((complex) => {
        const pin = document.createElement('div')
        pin.className = 'bg-green-700 text-white text-xs font-bold px-2 py-1 rounded-full shadow cursor-pointer whitespace-nowrap'
        pin.textContent = complex.average_rating > 0
          ? `⚾ ${complex.average_rating.toFixed(1)}`
          : '⚾'

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: complex.lat, lng: complex.lng },
          title: complex.name,
          content: pin,
        })

        marker.addListener('click', () => setSelected(complex))
      })

      setMapLoaded(true)
    }

    initMap()
  }, [complexes])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Loading map...</p>
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
