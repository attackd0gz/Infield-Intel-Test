-- Add amenity ratings to reviews (stored as flexible JSONB)
alter table public.reviews
  add column if not exists amenity_ratings jsonb;
