-- Trigger: keep reviews.helpful_count and profiles.helpful_votes in sync
-- when a row is inserted or deleted from helpful_votes.
-- Also awards/revokes 1 point per received helpful vote and recalculates badge.

create or replace function update_helpful_vote_counts()
returns trigger as $$
declare
  review_author_id uuid;
  new_points       integer;
  new_badge        badge_level;
begin
  if TG_OP = 'INSERT' then
    -- Bump the review's count
    update public.reviews
    set helpful_count = helpful_count + 1
    where id = new.review_id;

    -- Find who wrote the review
    select user_id into review_author_id
    from public.reviews where id = new.review_id;

    -- Award 1 point and bump helpful_votes on the author's profile
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

  -- Recalculate badge for the author
  select points into new_points
  from public.profiles where id = review_author_id;

  new_badge := case
    when new_points >= 1000 then 'Hall of Famer'
    when new_points >= 500  then 'MVP'
    when new_points >= 200  then 'All-Star'
    when new_points >= 100  then 'Major Leaguer'
    when new_points >= 50   then 'Triple-A'
    when new_points >= 25   then 'Double-A'
    when new_points >= 10   then 'Single-A'
    when new_points >= 3    then 'Minor Leaguer'
    else 'Rookie'
  end::badge_level;

  update public.profiles
  set badge_level = new_badge
  where id = review_author_id;

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger trg_update_helpful_vote_counts
after insert or delete on public.helpful_votes
for each row execute function update_helpful_vote_counts();
