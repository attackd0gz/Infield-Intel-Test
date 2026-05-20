-- ─────────────────────────────────────────────────────────────────────────────
-- 014 Security hardening
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Admin delete policy for reviews ──────────────────────────────────────
-- Previously admins could only delete via anon client (relying on their own
-- user_id match). This adds an explicit admin bypass.
create policy "Admins can delete any review"
  on public.reviews for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 2. Restrict complex-photos bucket to admins only ────────────────────────
-- Previously any authenticated user could upload/update/delete in this bucket.
drop policy if exists "Authenticated users can upload complex photos"  on storage.objects;
drop policy if exists "Authenticated users can update complex photos"  on storage.objects;
drop policy if exists "Authenticated users can delete complex photos"  on storage.objects;

create policy "Admins can upload complex photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'complex-photos'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update complex photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'complex-photos'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete complex photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'complex-photos'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 3. Restrict complex-covers bucket to the complex owner ──────────────────
-- Previously any authenticated user could upload to any complex's cover path.
-- File path pattern: {complexId}.{ext} — we verify the uploader owns that complex.
drop policy if exists "Owners can upload complex cover photos"  on storage.objects;
drop policy if exists "Owners can update complex cover photos"  on storage.objects;

create policy "Owners can upload their complex cover photo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'complex-covers'
    and exists (
      select 1 from public.complexes
      where id::text = split_part(name, '.', 1)
        and owner_id = auth.uid()
    )
  );

create policy "Owners can update their complex cover photo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'complex-covers'
    and exists (
      select 1 from public.complexes
      where id::text = split_part(name, '.', 1)
        and owner_id = auth.uid()
    )
  );

-- ── 4. Username format constraint ────────────────────────────────────────────
-- NOT VALID = applies to new rows only; won't fail if existing usernames differ.
alter table public.profiles
  add constraint username_format
  check (username ~ '^[a-zA-Z0-9_]{3,30}$')
  not valid;

-- ── 5. Review length constraints ─────────────────────────────────────────────
alter table public.reviews
  add constraint review_title_length
  check (char_length(title) between 1 and 200)
  not valid;

alter table public.reviews
  add constraint review_body_length
  check (char_length(body) between 30 and 10000)
  not valid;

-- ── 6. Contact message constraints ───────────────────────────────────────────
alter table public.contact_messages
  add constraint contact_name_length
  check (char_length(name) between 1 and 100)
  not valid;

alter table public.contact_messages
  add constraint contact_message_length
  check (char_length(message) between 20 and 5000)
  not valid;

alter table public.contact_messages
  add constraint contact_subject_enum
  check (subject in (
    'General Question',
    'Report a Bug',
    'Claim a Complex Listing',
    'Partnership Inquiry',
    'Other'
  ))
  not valid;
