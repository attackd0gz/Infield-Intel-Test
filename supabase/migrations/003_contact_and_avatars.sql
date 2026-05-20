-- Contact messages table
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null,
  message    text not null,
  created_at timestamptz default now()
);

alter table public.contact_messages enable row level security;

-- Anyone can submit; only service role can read
create policy "Anyone can submit contact messages"
  on public.contact_messages
  for insert
  with check (true);

-- Avatars storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload their own avatar
create policy "Users can upload their own avatar"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read of all avatars
create policy "Public can read avatars"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

-- Allow users to update/replace their own avatar
create policy "Users can update their own avatar"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
