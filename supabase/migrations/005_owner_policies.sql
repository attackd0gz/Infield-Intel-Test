-- Allow authenticated users to claim an unclaimed complex (owner_id must be null first, new value must be themselves)
create policy "Authenticated users can claim unclaimed complexes"
  on public.complexes for update
  to authenticated
  using (owner_id is null)
  with check (owner_id = auth.uid());

-- Allow owners to update their own complex details
create policy "Owners can update their own complex"
  on public.complexes for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Allow owners to update their own announcements
create policy "Owners can update their own announcements"
  on public.owner_announcements for update
  using (auth.uid() = owner_id);

-- Allow owners to delete their own announcements
create policy "Owners can delete their own announcements"
  on public.owner_announcements for delete
  using (auth.uid() = owner_id);

-- Complex cover photos storage bucket
insert into storage.buckets (id, name, public)
values ('complex-covers', 'complex-covers', true)
on conflict (id) do nothing;

create policy "Owners can upload complex cover photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'complex-covers');

create policy "Public can view complex cover photos"
  on storage.objects for select
  using (bucket_id = 'complex-covers');

create policy "Owners can update complex cover photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'complex-covers');
