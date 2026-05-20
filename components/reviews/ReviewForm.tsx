'use client'

import { useState } from 'react'
import { Star, X, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Review } from '@/types'

interface Props {
  complexId: string
  userId: string
  existingReview: Review | null
  onSuccess: () => void
}

export function ReviewForm({ complexId, userId, existingReview, onSuccess }: Props) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState(existingReview?.title ?? '')
  const [body, setBody] = useState(existingReview?.body ?? '')
  const [visitDate, setVisitDate] = useState(existingReview?.visit_date ?? '')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5)
    setPhotos(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  function removePhoto(i: number) {
    setPhotos(p => p.filter((_, idx) => idx !== i))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a star rating'); return }
    if (!title.trim()) { toast.error('Please add a title'); return }
    if (!body.trim()) { toast.error('Please write your review'); return }

    setLoading(true)
    const supabase = createClient()

    try {
      let reviewId = existingReview?.id

      if (existingReview) {
        const { error } = await supabase
          .from('reviews')
          .update({ rating, title: title.trim(), body: body.trim(), visit_date: visitDate || null, updated_at: new Date().toISOString() })
          .eq('id', existingReview.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('reviews')
          .insert({ complex_id: complexId, user_id: userId, rating, title: title.trim(), body: body.trim(), visit_date: visitDate || null })
          .select('id')
          .single()
        if (error) throw error
        reviewId = data.id
      }

      // Upload photos
      for (const file of photos) {
        const ext = file.name.split('.').pop()
        const path = `${userId}/${reviewId}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('review-photos')
          .upload(path, file, { upsert: false })

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('review-photos').getPublicUrl(path)
          await supabase.from('review_photos').insert({
            review_id: reviewId,
            user_id: userId,
            storage_path: path,
            caption: null,
          })
          // Update the url field via a separate update since we need the public URL
          await supabase.from('review_photos').update({ url: publicUrl }).eq('storage_path', path)
        }
      }

      toast.success(existingReview ? 'Review updated!' : 'Review submitted! +10 points earned.')
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star rating */}
      <div className="space-y-1.5">
        <Label>Rating</Label>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
            >
              <Star
                className={`h-8 w-8 transition-colors ${n <= (hovered || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Your Review</Label>
        <Textarea
          id="body"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="What did you think of the facilities, fields, staff, and overall experience?"
          rows={5}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="visitDate">Visit Date (optional)</Label>
        <Input
          id="visitDate"
          type="month"
          value={visitDate}
          onChange={e => setVisitDate(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Photos (up to 5)</Label>
        <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-3 cursor-pointer hover:bg-muted/40 transition-colors">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Click to upload photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoChange}
          />
        </label>
        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-16 w-16 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full h-4 w-4 flex items-center justify-center"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
      </Button>
    </form>
  )
}
