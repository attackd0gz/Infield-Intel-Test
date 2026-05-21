-- ─────────────────────────────────────────────────────────────────────────────
-- 015 Points & badge system overhaul
-- ─────────────────────────────────────────────────────────────────────────────
-- Changes from the original (001 / 007 / 009) triggers:
--   • Review points:   10  → 15
--   • Photo points:    +5 per photo → flat +5 for first photo on a review
--   • Pioneer bonus:   +5  → +10
--   • Badge thresholds updated and centralised in one shared helper
--     Old: 3 / 10 / 25 / 50 / 100 / 200 / 500 / 1000
--     New: 15 / 50 / 100 / 225 / 375 / 550 / 750 / 1000

-- ── 1. Shared badge recalculation helper ─────────────────────────────────────
-- All triggers call this so thresholds only live in one place.
create or replace function recalculate_badge(p_id uuid)
returns void as $$
declare
  p integer;
  b badge_level;
begin
  select points into p from public.profiles where id = p_id;
  b := case
    when p >= 1000 then 'Hall of Famer'::badge_level
    when p >= 750  then 'MVP'::badge_level
    when p >= 550  then 'All-Star'::badge_level
    when p >= 375  then 'Major Leaguer'::badge_level
    when p >= 225  then 'Triple-A'::badge_level
    when p >= 100  then 'Double-A'::badge_level
    when p >= 50   then 'Single-A'::badge_level
    when p >= 15   then 'Minor Leaguer'::badge_level
    else                'Rookie'::badge_level
  end;
  update public.profiles set badge_level = b where id = p_id;
end;
$$ language plpgsql security definer;


-- ── 2. Review trigger: 10 → 15 pts ───────────────────────────────────────────
create or replace function update_profile_on_review()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles
    set review_count = review_count + 1,
        points       = points + 15
    where id = new.user_id;
    perform recalculate_badge(new.user_id);

  elsif TG_OP = 'DELETE' then
    update public.profiles
    set review_count = greatest(review_count - 1, 0),
        points       = greatest(points - 15, 0)
    where id = old.user_id;
    perform recalculate_badge(old.user_id);
  end if;

  return coalesce(new, old);
end;
$$ language plpgsql security definer;


-- ── 3. Photo trigger: per-photo 5 pts → flat 5 pts for first photo only ──────
-- photo_count still tracks total photos; points only move on first/last photo.
create or replace function update_profile_on_photo()
returns trigger as $$
declare
  existing_photos integer;
begin
  if TG_OP = 'INSERT' then
    -- How many photos existed for this review before this one? (AFTER trigger,
    -- new row is already in the table, so exclude it.)
    select count(*) into existing_photos
    from public.review_photos
    where review_id = new.review_id
      and id        != new.id;

    update public.profiles
    set photo_count = photo_count + 1
    where id = new.user_id;

    -- Award the flat bonus only on the first photo
    if existing_photos = 0 then
      update public.profiles
      set points = points + 5
      where id = new.user_id;
      perform recalculate_badge(new.user_id);
    end if;

  elsif TG_OP = 'DELETE' then
    -- How many photos remain for this review after this deletion? (AFTER trigger,
    -- old row is already gone, so a plain count is correct.)
    select count(*) into existing_photos
    from public.review_photos
    where review_id = old.review_id;

    update public.profiles
    set photo_count = greatest(photo_count - 1, 0)
    where id = old.user_id;

    -- Revoke the flat bonus only when the last photo is removed
    if existing_photos = 0 then
      update public.profiles
      set points = greatest(points - 5, 0)
      where id = old.user_id;
      perform recalculate_badge(old.user_id);
    end if;
  end if;

  return coalesce(new, old);
end;
$$ language plpgsql security definer;


-- ── 4. Helpful vote trigger: same logic, new thresholds via shared helper ─────
create or replace function update_helpful_vote_counts()
returns trigger as $$
declare
  review_author_id uuid;
begin
  if TG_OP = 'INSERT' then
    update public.reviews
    set helpful_count = helpful_count + 1
    where id = new.review_id;

    select user_id into review_author_id
    from public.reviews where id = new.review_id;

    update public.profiles
    set helpful_votes = helpful_votes + 1,
        points        = points + 1
    where id = review_author_id;

  elsif TG_OP = 'DELETE' then
    update public.reviews
    set helpful_count = greatest(helpful_count - 1, 0)
    where id = old.review_id;

    select user_id into review_author_id
    from public.reviews where id = old.review_id;

    update public.profiles
    set helpful_votes = greatest(helpful_votes - 1, 0),
        points        = greatest(points - 1, 0)
    where id = review_author_id;
  end if;

  perform recalculate_badge(review_author_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;


-- ── 5. Pioneer bonus: 5 → 10 pts ─────────────────────────────────────────────
create or replace function award_pioneer_bonus()
returns trigger as $$
declare
  complex_review_count integer;
begin
  select count(*) into complex_review_count
  from public.reviews
  where complex_id = new.complex_id;

  if complex_review_count = 1 then
    update public.profiles
    set points = points + 10
    where id = new.user_id;
    perform recalculate_badge(new.user_id);
  end if;

  return new;
end;
$$ language plpgsql security definer;


-- ── 6. Back-fill badge levels for all existing users ─────────────────────────
-- Recalculates every profile's badge_level using the new thresholds.
-- Safe to run more than once.
update public.profiles
set badge_level = case
  when points >= 1000 then 'Hall of Famer'::badge_level
  when points >= 750  then 'MVP'::badge_level
  when points >= 550  then 'All-Star'::badge_level
  when points >= 375  then 'Major Leaguer'::badge_level
  when points >= 225  then 'Triple-A'::badge_level
  when points >= 100  then 'Double-A'::badge_level
  when points >= 50   then 'Single-A'::badge_level
  when points >= 15   then 'Minor Leaguer'::badge_level
  else                     'Rookie'::badge_level
end;
