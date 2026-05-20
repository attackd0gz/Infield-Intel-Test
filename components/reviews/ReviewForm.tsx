'use client'

import { useState } from 'react'
import { Star, X, ImagePlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Review, ReviewPhoto } from '@/types'

const MAX_PHOTOS = 5

interface Props {
  complexId: string
  userId: string
  existingReview: Review | null
  onSuccess: () => void
}

export function ReviewForm({ complexId, userId, existingReview, onSuccess }: Props) {
  const [rating, setRating]       = useState(existingReview?.rating ?? 0)
  const [hovered, setHovered]     = useState(0)
  const [title, setTitle]         = useState(existingReview?.title ?? '')
  const [body, setBody]           = useState(existingReview?.body ?? '')
  const [visitDate, setVisitDate] = useState(existingReview?.visit_date ?? '')
  const [loading, setLoading]     = useState(false)

  // Existing photos (from DB) — user can remove them
  const [existingPhotos, setExistingPhotos] = useState<ReviewPhoto[]>(
    existingReview?.photos ?? []
  )
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<Set<string>>(new Set())

  // New photos selected by the user (not yet uploaded)
  const [newFiles, setNewFiles]       = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  const keptExisting  = existingPhotos.filter(p => !deletedPhotoIds.has(p.id))
  const totalSlots    = keptExisting.length + newFiles.length
  const slotsLeft     = MAX_PHOTOS - keptExisting.length

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    const allowed = picked.slice(0, slotsLeft)
    if (picked.length > slotsLeft) {
      toast.warning(`Only ${slotsLeft} more photo${slotsLeft !== 1 ? 's' : ''} allowed (max ${MAX_PHOTOS} total)`)
    }
    // Merge with existing new files, cap at slotsLeft
    const merged = [...newFiles, ...allowed].slice(0, slotsLeft)
    setNewFiles(merged)
    setNewPreviews(merged.map(f => URL.createObjectURL(f)))
    // Reset input so same file can be re-picked
    e.target.value = ''
  }

  function removeNewPhoto(i: number) {
    setNewFiles(prev => prev.filter((_, idx) => idx !== i))
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  function markExistingForDeletion(photo: ReviewPhoto) {
    setDeletedPhotoIds(prev => new Set([...prev, photo.id]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a star rating'); return }
    if (!title.trim()) { toast.error('Please add a title'); return }
    if (!body.trim())  { toast.error('Please write your review'); return }

    setLoading(true)
    const supabase = createClient()

    try {
      let reviewId = existingReview?.id

      if (existingReview) {
        // Update the review text fields
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            title: title.trim(),
            body: body.trim(),
            visit_date: visitDate || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReview.id)
        if (error) throw error

        // Delete photos marked for removal
        for (const photoId of deletedPhotoIds) {
          const photo = existingPhotos.find(p => p.id === photoId)
          if (!photo) continue
          // Delete from storage
          await supabase.storage.from('review-photos').remove([photo.storage_path])
          // Delete from DB (trigger decrements photo_count + points)
          await supabase.from('review_photos').delete().eq('id', photoId)
        }
      } else {
        // Insert new review
        const { data, error } = await supabase
          .from('reviews')
          .insert({
            complex_id: complexId,
            user_id: userId,
            rating,
            title: title.trim(),
            body: body.trim(),
            visit_date: visitDate || null,
          })
          .select('id')
          .single()
        if (error) throw error
        reviewId = data.id
      }

      // Upload new photos
      let uploadedCount = 0
      for (const file of newFiles) {
        const ext  = file.name.split('.').pop() ?? 'jpg'
        const path = `${userId}/${reviewId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('review-photos')
          .upload(path, file, { upsert: false })

        if (uploadError) {
          toast.warning(`Couldn't upload one photo: ${uploadError.message}`)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('review-photos')
          .getPublicUrl(path)

        // Single insert with all fields including url
        await supabase.from('review_photos').insert({
          review_id: reviewId,
          user_id: userId,
          storage_path: path,
          url: publicUrl,
          caption: null,
        })
        uploadedCount++
      }

      const pointsMsg = !existingReview
        ? ` +10 pts${uploadedCount > 0 ? ` +${uploadedCount * 5} photo pts` : ''}`
        : ''
      toast.success(existingReview ? 'Review updated!' : `Review submitted!${pointsMsg}`)
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Star rating */}
      <div className="space-y-1.5">
        <Label>Rating <span className="text-destructive">*</span></Label>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  n <= (hovered || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/30 hover:text-amber-200'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 self-center text-sm text-muted-foreground">
              {['','Terrible','Poor','OK','Good','Excellent'][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="r-title">Title <span className="text-destructive">*</span></Label>
        <Input
          id="r-title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          required
        />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <Label htmlFor="r-body">Your Review <span className="text-destructive">*</span></Label>
        <Textarea
          id="r-body"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="How were the fields, facilities, parking, staff? Would you come back?"
          rows={5}
          required
        />
      </div>

      {/* Visit date */}
      <div className="space-y-1.5">
        <Label htmlFor="r-date">Visit Date <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input
          id="r-date"
          type="month"
          value={visitDate}
          onChange={e => setVisitDate(e.target.value)}
          max={new Date().toISOString().slice(0, 7)}
        />
      </div>

      {/* Photos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Photos <span className="text-muted-foreground font-normal">(optional, up to {MAX_PHOTOS})</span></Label>
          <span className="text-xs text-muted-foreground">{totalSlots}/{MAX_PHOTOS}</span>
        </div>

        {/* Existing photos */}
        {keptExisting.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {keptExisting.map(photo => (
              <div key={photo.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt="Review photo"
                  className="h-20 w-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => markExistingForDeletion(photo)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove photo"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute inset-0 rounded-lg ring-2 ring-primary/0 group-hover:ring-destructive/30 transition-all pointer-events-none" />
              </div>
            ))}
          </div>
        )}

        {/* New photo previews */}
        {newPreviews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {newPreviews.map((src, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-20 w-20 object-cover rounded-lg border border-primary/30" />
                <button
                  type="button"
                  onClick={() => removeNewPhoto(i)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
                <span className="absolute bottom-1 left-1 text-[9px] bg-black/50 text-white px-1 rounded">new</span>
              </div>
            ))}
          </div>
        )}

        {/* Upload button — only shown when slots remain */}
        {totalSlots < MAX_PHOTOS && (
          <label className="flex items-center gap-2.5 border-2 border-dashed border-muted-foreground/25 rounded-xl p-4 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors group">
            <ImagePlus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                Add photos
              </p>
              <p className="text-xs text-muted-foreground/70">
                {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} remaining · JPG, PNG, WEBP
              </p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}

        {/* Points hint */}
        {!existingReview && (
          <p className="text-xs text-muted-foreground">
            📸 Each photo earns <span className="font-semibold text-primary">+5 pts</span>
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading
          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {existingReview ? 'Updating…' : 'Submitting…'}</>
          : existingReview ? 'Update Review' : 'Submit Review'
        }
      </Button>
    </form>
  )
}
