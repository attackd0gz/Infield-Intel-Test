-- ─────────────────────────────────────────────────────────────────────────────
-- 018  Fix RLS performance warnings from Supabase Performance Advisor
-- ─────────────────────────────────────────────────────────────────────────────
-- Issue 1 (auth_rls_initplan): bare auth.uid() / auth.role() calls are
-- re-evaluated for every row scanned.  Wrapping in (select auth.uid()) causes
-- Postgres to evaluate the expression once as an InitPlan and cache the result.
--
-- Issue 2 (multiple_permissive_policies): reviews.DELETE has two separate
-- permissive policies — Postgres must evaluate both for every DELETE.
-- Merging them into one with OR eliminates the redundancy.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── profiles ─────────────────────────────────────────────────────────────────
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can update their own profile" on public.profiles
  for update
  using ((select auth.uid()) = id)
  with check (
    (select auth.uid()) = id
    and role         = (select role         from public.profiles where id = (select auth.uid()))
    and points       = (select points       from public.profiles where id = (select auth.uid()))
    and badge_level  = (select badge_level  from public.profiles where id = (select auth.uid()))
    and review_count = (select review_count from public.profiles where id = (select auth.uid()))
    and photo_count  = (select photo_count  from public.profiles where id = (select auth.uid()))
    and helpful_votes= (select helpful_votes from public.profiles where id = (select auth.uid()))
    and is_subscribed= (select is_subscribed from public.profiles where id = (select auth.uid()))
  );


-- ── complexes ────────────────────────────────────────────────────────────────
drop policy if exists "Admins can insert complexes" on public.complexes;

create policy "Admins can insert complexes" on public.complexes
  for insert
  with check (
    exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
  );


-- ── reviews ──────────────────────────────────────────────────────────────────
drop policy if exists "Authenticated users can create reviews" on public.reviews;
drop policy if exists "Users can update their own reviews"     on public.reviews;
drop policy if exists "Users can delete their own reviews"     on public.reviews;
drop policy if exists "Admins can delete any review"           on public.reviews;

create policy "Authenticated users can create reviews" on public.reviews
  for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own reviews" on public.reviews
  for update
  using ((select auth.uid()) = user_id);

-- Merged: replaces both "Users can delete their own reviews" and
-- "Admins can delete any review" to eliminate the multiple-permissive-policies
-- warning while preserving identical access control.
create policy "Users or admins can delete reviews" on public.reviews
  for delete
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );


-- ── review_photos ─────────────────────────────────────────────────────────────
drop policy if exists "Authenticated users can upload photos" on public.review_photos;
drop policy if exists "Users can delete their own photos"     on public.review_photos;

create policy "Authenticated users can upload photos" on public.review_photos
  for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own photos" on public.review_photos
  for delete
  using ((select auth.uid()) = user_id);


-- ── helpful_votes ─────────────────────────────────────────────────────────────
drop policy if exists "Authenticated users can vote"  on public.helpful_votes;
drop policy if exists "Users can remove their vote"   on public.helpful_votes;

create policy "Authenticated users can vote" on public.helpful_votes
  for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their vote" on public.helpful_votes
  for delete
  using ((select auth.uid()) = user_id);


-- ── complex_submissions ───────────────────────────────────────────────────────
drop policy if exists "Users can submit complexes"    on public.complex_submissions;
drop policy if exists "Users can view own submissions" on public.complex_submissions;

create policy "Users can submit complexes" on public.complex_submissions
  for insert
  with check (submitted_by = (select auth.uid()));

create policy "Users can view own submissions" on public.complex_submissions
  for select
  using (submitted_by = (select auth.uid()));


-- ── owner_announcements ───────────────────────────────────────────────────────
drop policy if exists "Owners can create announcements for their complex" on public.owner_announcements;
drop policy if exists "Owners can delete their own announcements"         on public.owner_announcements;

create policy "Owners can create announcements for their complex"
  on public.owner_announcements for insert
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.complexes
      where id = complex_id and owner_id = (select auth.uid())
    )
  );

create policy "Owners can delete their own announcements"
  on public.owner_announcements for delete
  using ((select auth.uid()) = owner_id);


-- ── claim_requests ────────────────────────────────────────────────────────────
drop policy if exists "Users can submit claim requests"          on public.claim_requests;
drop policy if exists "Users can view their own claim requests"  on public.claim_requests;

create policy "Users can submit claim requests" on public.claim_requests
  for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can view their own claim requests" on public.claim_requests
  for select
  using ((select auth.uid()) = user_id);


-- ── contact_messages ──────────────────────────────────────────────────────────
drop policy if exists "Admins can read contact messages" on public.contact_messages;

create policy "Admins can read contact messages" on public.contact_messages
  for select
  using (
    exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
  );
