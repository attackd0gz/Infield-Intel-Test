-- ─────────────────────────────────────────────────────────────────────────────
-- 017 Fix remaining Supabase security advisories
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Fix handle_new_user search_path ───────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- ── 2. Revoke RPC execution on all trigger functions ─────────────────────────
-- These functions are only meant to be called by database triggers, not
-- directly via the PostgREST API (/rest/v1/rpc/*). Revoking EXECUTE has no
-- effect on the triggers themselves — triggers run as superuser regardless.
revoke execute on function public.award_pioneer_bonus()          from anon, authenticated;
revoke execute on function public.handle_new_user()              from anon, authenticated;
revoke execute on function public.recalculate_badge(uuid)        from anon, authenticated;
revoke execute on function public.update_complex_rating()        from anon, authenticated;
revoke execute on function public.update_helpful_vote_counts()   from anon, authenticated;
revoke execute on function public.update_profile_on_photo()      from anon, authenticated;
revoke execute on function public.update_profile_on_review()     from anon, authenticated;

-- ── 3. Remove over-broad storage SELECT policies ─────────────────────────────
-- Public buckets in Supabase serve files by URL without requiring an RLS
-- SELECT policy. These broad policies were additionally allowing any client
-- to LIST all files in the bucket, which is unnecessary and exposes the
-- full contents. Dropping them does not affect image display — public URLs
-- continue to work via the bucket's public setting.
drop policy if exists "Public can read avatars"         on storage.objects;
drop policy if exists "Public can view complex photos"  on storage.objects;
