-- Remove the instant-claim policy from migration 005 (approval now required)
drop policy if exists "Authenticated users can claim unclaimed complexes" on public.complexes;

-- Claim requests table
create table if not exists public.claim_requests (
  id              uuid primary key default gen_random_uuid(),
  complex_id      uuid references public.complexes(id) on delete cascade not null,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  contact_name    text not null,
  contact_email   text not null,
  contact_phone   text,
  role_at_complex text not null,
  notes           text,
  status          text not null default 'pending'
                  check (status in ('pending', 'approved', 'denied')),
  reviewed_by     uuid references public.profiles(id),
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now(),
  unique (complex_id, user_id)
);

alter table public.claim_requests enable row level security;

-- Users can submit claims and view their own
create policy "Users can submit claim requests"
  on public.claim_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own claim requests"
  on public.claim_requests for select
  using (auth.uid() = user_id);
