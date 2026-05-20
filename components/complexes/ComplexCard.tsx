import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Complex } from '@/types'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&q=70&auto=format&fit=crop'

interface Props {
  complex: Complex
}

export function ComplexCard({ complex }: Props) {
  const rating = complex.average_rating

  return (
    <Link href={`/complexes/${complex.id}`} className="group block">
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        {/* Image */}
        <div className="relative h-44 bg-muted overflow-hidden">
          <Image
            src={complex.cover_photo_url ?? FALLBACK_IMAGE}
            alt={complex.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Rating chip */}
          {rating > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-full">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-base leading-tight mb-1 group-hover:text-primary transition-colors">
            {complex.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{complex.city}, {complex.state}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(n => (
                <Star
                  key={n}
                  className={`h-3.5 w-3.5 ${n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                ({complex.review_count})
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>

          {complex.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
              {complex.amenities.slice(0, 3).map(a => (
                <Badge key={a} variant="secondary" className="text-xs font-normal">{a}</Badge>
              ))}
              {complex.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal">+{complex.amenities.length - 3}</Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
