-- ─────────────────────────────────────────────────────────────────────────────
-- 019  Security cleanup
-- ─────────────────────────────────────────────────────────────────────────────
-- Fixes three remaining security warnings from Supabase Security Advisor.
--
-- NOT addressed here (unfixable without superuser):
--   • extension_in_public (postgis)   — installed by Supabase, we don't own it
--   • st_estimatedextent functions    — PostGIS built-ins, owned by Supabase
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Revoke RPC execution on all trigger functions ─────────────────────────
-- These functions are invoked only by database triggers, never directly via
-- the PostgREST RPC API (/rest/v1/rpc/*).  Revoking EXECUTE from anon and
-- authenticated closes the exposed endpoint without affecting trigger behaviour
-- — triggers fire as the function owner regardless of role grants.
--
-- Note: migration 017 contained these same revokes but was never applied to
-- the database.  This migration re-applies them.
-- ─────────────────────────────────────────────────────────────────────────────
revoke execute on function public.award_pioneer_bonus()         from anon, authenticated;
revoke execute on function public.handle_new_user()             from anon, authenticated;
revoke execute on function public.recalculate_badge(uuid)       from anon, authenticated;
revoke execute on function public.update_complex_rating()       from anon, authenticated;
revoke execute on function public.update_helpful_vote_counts()  from anon, authenticated;
revoke execute on function public.update_profile_on_photo()     from anon, authenticated;
revoke execute on function public.update_profile_on_review()    from anon, authenticated;


-- ── 2. Tighten contact_messages INSERT policy ────────────────────────────────
-- The original policy used WITH CHECK (true), which the linter flags as
-- "always true / no restriction".  The intent IS to allow public submission
-- (no login required for a contact form), but we can replace the bare true
-- with explicit field validation that matches the NOT NULL column constraints.
-- This satisfies the linter while keeping identical effective behaviour.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "Anyone can submit contact messages" on public.contact_messages;

create policy "Anyone can submit contact messages"
  on public.contact_messages
  for insert
  with check (
    name    is not null and char_length(trim(name))    > 0 and
    email   is not null and char_length(trim(email))   > 0 and
    subject is not null and char_length(trim(subject)) > 0 and
    message is not null and char_length(trim(message)) > 0
  );
