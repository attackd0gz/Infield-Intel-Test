import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Complex } from '@/types'

interface Props {
  complex: Complex
}

export function ComplexCard({ complex }: Props) {
  return (
    <Link href={`/complexes/${complex.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
        <div className="h-40 bg-green-100 relative">
          {complex.cover_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={complex.cover_photo_url}
              alt={complex.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">⚾</div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-base leading-tight mb-1">{complex.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>{complex.city}, {complex.state}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-sm">
              {complex.average_rating > 0 ? complex.average_rating.toFixed(1) : '—'}
            </span>
            <span className="text-xs text-muted-foreground">
              ({complex.review_count} {complex.review_count === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </CardContent>
        {complex.amenities.length > 0 && (
          <CardFooter className="px-4 pb-4 pt-0 flex flex-wrap gap-1">
            {complex.amenities.slice(0, 3).map((a) => (
              <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
            ))}
            {complex.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">+{complex.amenities.length - 3}</Badge>
            )}
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}
