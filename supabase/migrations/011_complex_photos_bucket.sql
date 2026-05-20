-- Storage bucket for complex cover photos (admin-managed)
insert into storage.buckets (id, name, public)
values ('complex-photos', 'complex-photos', true)
on conflict (id) do nothing;

-- Public read
create policy "Public can view complex photos"
  on storage.objects for select
  using (bucket_id = 'complex-photos');

-- Authenticated users can upload (form is admin-only at app level)
create policy "Authenticated users can upload complex photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'complex-photos');

-- Authenticated users can replace (upsert)
create policy "Authenticated users can update complex photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'complex-photos');

-- Authenticated users can delete
create policy "Authenticated users can delete complex photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'complex-photos');
