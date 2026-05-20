create table complex_submissions (
  id            uuid primary key default gen_random_uuid(),
  submitted_by  uuid references profiles(id) on delete set null,
  name          text not null,
  address       text not null,
  city          text not null,
  state         text not null,
  zip           text,
  phone         text,
  website       text,
  description   text,
  amenities     text[] not null default '{}',
  notes         text,                   -- submitter notes to admin
  status        text not null default 'pending'
                  constraint complex_submissions_status_check
                  check (status in ('pending', 'approved', 'rejected')),
  admin_notes   text,                   -- admin rejection reason
  reviewed_by   uuid references profiles(id) on delete set null,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

alter table complex_submissions enable row level security;

-- Authenticated users can insert their own submissions
create policy "Users can submit complexes"
  on complex_submissions for insert
  to authenticated
  with check (submitted_by = auth.uid());

-- Users can see only their own submissions
create policy "Users can view own submissions"
  on complex_submissions for select
  to authenticated
  using (submitted_by = auth.uid());
