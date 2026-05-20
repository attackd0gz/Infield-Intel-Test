'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ComplexSearch() {
  const router = useRouter()
  const sp = useSearchParams()
  const [q, setQ] = useState(sp.get('q') ?? '')
  const [city, setCity] = useState(sp.get('city') ?? '')
  const [minRating, setMinRating] = useState(sp.get('min_rating') ?? '')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (city) params.set('city', city)
    if (minRating) params.set('min_rating', minRating)
    router.push(`/complexes?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name..."
          className="pl-9"
        />
      </div>
      <Input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City"
        className="sm:w-40"
      />
      <Select value={minRating} onValueChange={(v) => setMinRating(v ?? '')}>
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Min rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Any rating</SelectItem>
          <SelectItem value="3">3+ stars</SelectItem>
          <SelectItem value="4">4+ stars</SelectItem>
          <SelectItem value="4.5">4.5+ stars</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">Search</Button>
    </form>
  )
}
