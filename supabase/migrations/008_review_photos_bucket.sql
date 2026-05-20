-- review-photos storage bucket (public reads, auth writes scoped to user folder)
insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

-- Authenticated users can upload to their own folder (path: userId/reviewId/filename)
create policy "Users can upload review photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'review-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can read review photos
create policy "Public can view review photos"
  on storage.objects for select
  using (bucket_id = 'review-photos');

-- Users can delete their own review photos
create policy "Users can delete their own review photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'review-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
