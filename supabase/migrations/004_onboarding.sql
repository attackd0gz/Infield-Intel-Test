-- Add onboarding fields to profiles
alter table public.profiles
  add column if not exists onboarding_complete boolean not null default false,
  add column if not exists player_type text check (player_type in ('player', 'parent', 'coach', 'fan')),
  add column if not exists age_group text,
  add column if not exists favorite_teams text[] not null default '{}';
