-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- Profiles (extends Supabase auth.users)
create type user_role as enum ('user', 'owner', 'admin');
create type badge_level as enum (
  'Rookie', 'Minor Leaguer', 'Single-A', 'Double-A', 'Triple-A',
  'Major Leaguer', 'All-Star', 'MVP', 'Hall of Famer'
);

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  role user_role not null default 'user',
  badge_level badge_level not null default 'Rookie',
  points integer not null default 0,
  review_count integer not null default 0,
  photo_count integer not null default 0,
  helpful_votes integer not null default 0,
  stripe_customer_id text,
  is_subscribed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Complexes
create table public.complexes (
  id uuid primary key default uuid_generate_v4(),
  google_place_id text unique,
  name text not null,
  address text not null,
  city text not null,
  state text not null,
  zip text,
  lat double precision not null,
  lng double precision not null,
  phone text,
  website text,
  description text,
  amenities text[] not null default '{}',
  cover_photo_url text,
  average_rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Reviews
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  complex_id uuid references public.complexes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  title text not null,
  body text not null,
  visit_date date,
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(complex_id, user_id)
);

-- Review photos
create table public.review_photos (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid references public.reviews(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

-- Helpful votes (users marking reviews as helpful)
create table public.helpful_votes (
  user_id uuid references public.profiles(id) on delete cascade,
  review_id uuid references public.reviews(id) on delete cascade,
  primary key (user_id, review_id)
);

-- Owner announcements (renovation plans, updates)
create table public.owner_announcements (
  id uuid primary key default uuid_generate_v4(),
  complex_id uuid references public.complexes(id) on delete cascade not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  body text not null,
  announcement_type text not null default 'update', -- 'renovation', 'update', 'event'
  created_at timestamptz not null default now()
);

-- Function: update complex rating after review insert/update/delete
create or replace function update_complex_rating()
returns trigger as $$
begin
  update public.complexes
  set
    average_rating = (select coalesce(avg(rating), 0) from public.reviews where complex_id = coalesce(new.complex_id, old.complex_id)),
    review_count = (select count(*) from public.reviews where complex_id = coalesce(new.complex_id, old.complex_id))
  where id = coalesce(new.complex_id, old.complex_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger trg_update_complex_rating
after insert or update or delete on public.reviews
for each row execute function update_complex_rating();

-- Function: update profile stats and badge after review
create or replace function update_profile_on_review()
returns trigger as $$
declare
  new_points integer;
  new_badge badge_level;
begin
  if TG_OP = 'INSERT' then
    update public.profiles
    set
      review_count = review_count + 1,
      points = points + 10
    where id = new.user_id;
  elsif TG_OP = 'DELETE' then
    update public.profiles
    set
      review_count = greatest(review_count - 1, 0),
      points = greatest(points - 10, 0)
    where id = old.user_id;
  end if;

  -- Recalculate badge
  select points into new_points from public.profiles where id = coalesce(new.user_id, old.user_id);
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

  update public.profiles set badge_level = new_badge where id = coalesce(new.user_id, old.user_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger trg_update_profile_on_review
after insert or delete on public.reviews
for each row execute function update_profile_on_review();

-- Function: award points for photo uploads
create or replace function update_profile_on_photo()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles
    set photo_count = photo_count + 1, points = points + 5
    where id = new.user_id;
  elsif TG_OP = 'DELETE' then
    update public.profiles
    set
      photo_count = greatest(photo_count - 1, 0),
      points = greatest(points - 5, 0)
    where id = old.user_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger trg_update_profile_on_photo
after insert or delete on public.review_photos
for each row execute function update_profile_on_photo();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.complexes enable row level security;
alter table public.reviews enable row level security;
alter table public.review_photos enable row level security;
alter table public.helpful_votes enable row level security;
alter table public.owner_announcements enable row level security;

-- Profiles RLS
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Complexes RLS
create policy "Complexes are viewable by everyone" on public.complexes for select using (true);
create policy "Admins can insert complexes" on public.complexes for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Reviews RLS
create policy "Reviews are viewable by everyone" on public.reviews for select using (true);
create policy "Authenticated users can create reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update their own reviews" on public.reviews for update using (auth.uid() = user_id);
create policy "Users can delete their own reviews" on public.reviews for delete using (auth.uid() = user_id);

-- Review photos RLS
create policy "Photos are viewable by everyone" on public.review_photos for select using (true);
create policy "Authenticated users can upload photos" on public.review_photos for insert with check (auth.uid() = user_id);
create policy "Users can delete their own photos" on public.review_photos for delete using (auth.uid() = user_id);

-- Helpful votes RLS
create policy "Helpful votes viewable by everyone" on public.helpful_votes for select using (true);
create policy "Authenticated users can vote" on public.helpful_votes for insert with check (auth.uid() = user_id);
create policy "Users can remove their vote" on public.helpful_votes for delete using (auth.uid() = user_id);

-- Owner announcements RLS
create policy "Announcements viewable by everyone" on public.owner_announcements for select using (true);
create policy "Owners can create announcements for their complex" on public.owner_announcements for insert with check (
  auth.uid() = owner_id and
  exists (select 1 from public.complexes where id = complex_id and owner_id = auth.uid())
);

-- Auto-create profile on signup
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
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Indexes for performance
create index idx_complexes_city_state on public.complexes(city, state);
create index idx_complexes_location on public.complexes(lat, lng);
create index idx_reviews_complex on public.reviews(complex_id);
create index idx_reviews_user on public.reviews(user_id);
create index idx_photos_review on public.review_photos(review_id);
create index idx_profiles_points on public.profiles(points desc);
