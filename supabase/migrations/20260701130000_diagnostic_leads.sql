-- Table des leads du diagnostic « Profil EVC »
create table if not exists public.diagnostic_leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null default '',
  last_name text not null default '',
  email text not null,
  phone text not null default '',
  specialty text not null default '',
  voie text not null default '',
  session_evc text not null default '',
  score integer not null default 0,
  max_score integer not null default 163,
  profile_key text not null default '',
  profile_label text not null default '',
  obstacle text not null default '',
  answers jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_diagnostic_leads_created_at on public.diagnostic_leads (created_at desc);

-- RLS : seul le service role lit/écrit (pas de policy publique)
alter table public.diagnostic_leads enable row level security;

-- Aligne guide_leads avec la prod (colonne active déjà présente en prod,
-- absente des anciens fichiers de migration).
alter table public.guide_leads add column if not exists active boolean not null default true;
