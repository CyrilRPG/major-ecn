-- Table storing guide methodology download leads
create table if not exists public.guide_leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null default '',
  email text not null,
  phone text not null default '',
  specialty text not null default '',
  voie text not null default '',
  ab_variant text not null default 'A',
  cta_variant text not null default '',
  created_at timestamptz not null default now()
);

-- Index for admin listing (most recent first)
create index if not exists idx_guide_leads_created_at on public.guide_leads (created_at desc);

-- RLS: only service role can insert/read
alter table public.guide_leads enable row level security;
