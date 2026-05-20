-- ============================================================
-- Migration 010: Security hardening
-- ============================================================

-- 1. Fix profiles UPDATE policy — prevent privilege escalation
-- ---------------------------------------------------------------
-- The original policy had no WITH CHECK, meaning an authenticated
-- user could directly set role='admin', points=99999, etc. via the
-- Supabase client.  The new policy requires that all system-managed
-- columns keep their current values.  Only display fields
-- (username, full_name, avatar_url, bio) can be changed by users.
-- Points, badges, counts, and role are ONLY updated by DB triggers
-- or the service-role admin client.
-- ---------------------------------------------------------------
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can update their own profile" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Prevent role escalation
    and role = (select role from public.profiles where id = auth.uid())
    -- Prevent points manipulation
    and points = (select points from public.profiles where id = auth.uid())
    and badge_level = (select badge_level from public.profiles where id = auth.uid())
    -- Prevent stat manipulation
    and review_count = (select review_count from public.profiles where id = auth.uid())
    and photo_count = (select photo_count from public.profiles where id = auth.uid())
    and helpful_votes = (select helpful_votes from public.profiles where id = auth.uid())
    -- Prevent subscription spoofing
    and is_subscribed = (select is_subscribed from public.profiles where id = auth.uid())
  );


-- 2. Add missing DELETE policy on owner_announcements
-- ---------------------------------------------------------------
-- No DELETE policy existed, so the delete-announcement route was
-- silently failing even after fixing the HTTP method.
-- ---------------------------------------------------------------
create policy "Owners can delete their own announcements" on public.owner_announcements
  for delete
  using (auth.uid() = owner_id);


-- 3. Add admin read policy on contact_messages
-- ---------------------------------------------------------------
-- Only an INSERT policy existed; admins had to rely on the
-- service-role client to read messages.  This makes intent explicit.
-- ---------------------------------------------------------------
drop policy if exists "Admins can read contact messages" on public.contact_messages;

create policy "Admins can read contact messages" on public.contact_messages
  for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
