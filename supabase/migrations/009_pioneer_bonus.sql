-- Award +5 bonus points when a user writes the first review on a complex

create or replace function award_pioneer_bonus()
returns trigger as $$
declare
  complex_review_count integer;
  new_points           integer;
  new_badge            badge_level;
begin
  -- Count reviews for this complex after the insert (includes the new row)
  select count(*) into complex_review_count
  from public.reviews
  where complex_id = new.complex_id;

  -- Only award the bonus if this is the very first review
  if complex_review_count = 1 then
    update public.profiles
    set points = points + 5
    where id = new.user_id;

    -- Recalculate badge
    select points into new_points
    from public.profiles where id = new.user_id;

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
    where id = new.user_id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Runs after the review insert (and after update_profile_on_review fires)
create trigger trg_award_pioneer_bonus
after insert on public.reviews
for each row execute function award_pioneer_bonus();
