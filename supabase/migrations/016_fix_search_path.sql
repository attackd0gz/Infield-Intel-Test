-- ─────────────────────────────────────────────────────────────────────────────
-- 016 Fix mutable search_path on all trigger functions
-- ─────────────────────────────────────────────────────────────────────────────
-- Adds SET search_path = '' to every function so PostgreSQL cannot be tricked
-- into resolving schema objects through an attacker-controlled search_path.
-- All table references already use fully-qualified names (public.*) so this
-- change is safe with no other modifications needed.

-- ── 1. recalculate_badge ─────────────────────────────────────────────────────
create or replace function public.recalculate_badge(p_id uuid)
returns void as $$
declare
  p integer;
  b public.badge_level;
begin
  select points into p from public.profiles where id = p_id;
  b := case
    when p >= 1000 then 'Hall of Famer'::public.badge_level
    when p >= 750  then 'MVP'::public.badge_level
    when p >= 550  then 'All-Star'::public.badge_level
    when p >= 375  then 'Major Leaguer'::public.badge_level
    when p >= 225  then 'Triple-A'::public.badge_level
    when p >= 100  then 'Double-A'::public.badge_level
    when p >= 50   then 'Single-A'::public.badge_level
    when p >= 15   then 'Minor Leaguer'::public.badge_level
    else                'Rookie'::public.badge_level
  end;
  update public.profiles set badge_level = b where id = p_id;
end;
$$ language plpgsql security definer set search_path = '';

-- ── 2. update_complex_rating ─────────────────────────────────────────────────
create or replace function public.update_complex_rating()
returns trigger as $$
begin
  update public.complexes
  set
    average_rating = (
      select coalesce(avg(rating), 0)
      from public.reviews
      where complex_id = coalesce(new.complex_id, old.complex_id)
    ),
    review_count = (
      select count(*)
      from public.reviews
      where complex_id = coalesce(new.complex_id, old.complex_id)
    )
  where id = coalesce(new.complex_id, old.complex_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = '';

-- ── 3. update_profile_on_review ──────────────────────────────────────────────
create or replace function public.update_profile_on_review()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles
    set review_count = review_count + 1,
        points       = points + 15
    where id = new.user_id;
    perform public.recalculate_badge(new.user_id);
  elsif TG_OP = 'DELETE' then
    update public.profiles
    set review_count = greatest(review_count - 1, 0),
        points       = greatest(points - 15, 0)
    where id = old.user_id;
    perform public.recalculate_badge(old.user_id);
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = '';

-- ── 4. update_profile_on_photo ───────────────────────────────────────────────
create or replace function public.update_profile_on_photo()
returns trigger as $$
declare
  existing_photos integer;
begin
  if TG_OP = 'INSERT' then
    select count(*) into existing_photos
    from public.review_photos
    where review_id = new.review_id
      and id        != new.id;

    update public.profiles
    set photo_count = photo_count + 1
    where id = new.user_id;

    if existing_photos = 0 then
      update public.profiles
      set points = points + 5
      where id = new.user_id;
      perform public.recalculate_badge(new.user_id);
    end if;

  elsif TG_OP = 'DELETE' then
    select count(*) into existing_photos
    from public.review_photos
    where review_id = old.review_id;

    update public.profiles
    set photo_count = greatest(photo_count - 1, 0)
    where id = old.user_id;

    if existing_photos = 0 then
      update public.profiles
      set points = greatest(points - 5, 0)
      where id = old.user_id;
      perform public.recalculate_badge(old.user_id);
    end if;
  end if;

  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = '';

-- ── 5. update_helpful_vote_counts ────────────────────────────────────────────
create or replace function public.update_helpful_vote_counts()
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

  perform public.recalculate_badge(review_author_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = '';

-- ── 6. award_pioneer_bonus ───────────────────────────────────────────────────
create or replace function public.award_pioneer_bonus()
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
    perform public.recalculate_badge(new.user_id);
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';
