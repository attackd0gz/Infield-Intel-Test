'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { X, ChevronLeft, ChevronRight, Camera, ZoomIn } from 'lucide-react'

export interface GalleryPhoto {
  id: string
  url: string
  caption: string | null
  reviewerName: string
  reviewerUsername: string | null
  createdAt: string
}

interface Props {
  photos: GalleryPhoto[]
}

export function PhotoGallery({ photos }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const isOpen = lightboxIndex !== null
  const current = isOpen ? photos[lightboxIndex] : null

  const close = useCallback(() => setLightboxIndex(null), [])

  const prev = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i - 1 + photos.length) % photos.length))
  }, [photos.length])

  const next = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i + 1) % photos.length))
  }, [photos.length])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape')      close()
      if (e.key === 'ArrowLeft')   prev()
      if (e.key === 'ArrowRight')  next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, close, prev, next])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <Camera className="h-10 w-10 opacity-30" />
        <p className="text-lg font-medium">No photos yet</p>
        <p className="text-sm">Write a review and upload the first photos!</p>
      </div>
    )
  }

  return (
    <>
      {/* Grid */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 space-y-2">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-lg bg-zinc-100"
            onClick={() => setLightboxIndex(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption ?? `Photo by ${photo.reviewerName}`}
              className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-7 w-7 drop-shadow-lg" />
            </div>
            {/* Caption strip */}
            {photo.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-white text-xs line-clamp-2">{photo.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {isOpen && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={close}
        >
          {/* Stop click-through on the inner container */}
          <div
            className="relative max-w-5xl w-full mx-4 flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={close}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Counter */}
            <span className="absolute -top-12 left-0 text-white/50 text-sm">
              {lightboxIndex! + 1} / {photos.length}
            </span>

            {/* Image */}
            <div className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.url}
                alt={current.caption ?? `Photo by ${current.reviewerName}`}
                className="w-full max-h-[75vh] object-contain rounded-lg"
              />

              {/* Prev arrow */}
              {photos.length > 1 && (
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Next arrow */}
              {photos.length > 1 && (
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Caption + reviewer */}
            <div className="mt-3 text-center space-y-0.5 px-4">
              {current.caption && (
                <p className="text-white text-sm">{current.caption}</p>
              )}
              <p className="text-white/50 text-xs">
                Photo by{' '}
                {current.reviewerUsername ? (
                  <Link
                    href={`/profile/${current.reviewerUsername}`}
                    className="hover:text-white/80 transition-colors underline underline-offset-2"
                    onClick={close}
                  >
                    {current.reviewerName}
                  </Link>
                ) : (
                  current.reviewerName
                )}{' '}
                &middot;{' '}
                {new Date(current.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="flex gap-1.5 mt-4 overflow-x-auto max-w-full pb-1 px-1">
                {photos.map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.id}
                    src={p.url}
                    alt=""
                    onClick={() => setLightboxIndex(i)}
                    className={`h-14 w-14 object-cover rounded shrink-0 cursor-pointer transition-all ${
                      i === lightboxIndex
                        ? 'ring-2 ring-amber-400 opacity-100'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
