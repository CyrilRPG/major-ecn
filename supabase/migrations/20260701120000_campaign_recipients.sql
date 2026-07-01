-- Drip campaign: per-user enrollment with individual send tracking.
-- Each recipient has their own J1/J3/J5/J7 timeline starting from enrolled_at.
create table if not exists public.campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text not null default '',
  source text not null default 'explicit',
  enrolled_at timestamptz not null default now(),
  j1_sent_at timestamptz,
  j3_sent_at timestamptz,
  j5_sent_at timestamptz,
  j7_sent_at timestamptz,
  unsubscribed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_campaign_recipients_pending
  on public.campaign_recipients (enrolled_at)
  where unsubscribed = false;

alter table public.campaign_recipients enable row level security;
