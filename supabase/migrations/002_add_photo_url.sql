-- Add public URL column to review_photos
alter table public.review_photos add column if not exists url text;
