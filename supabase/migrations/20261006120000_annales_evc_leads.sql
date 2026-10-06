-- Annales EVC offertes (/annales-evc) : demandes de recueil par spécialité.
-- Le visiteur choisit sa spécialité, laisse ses coordonnées et reçoit le PDF par e-mail.
-- Les PDF sont rangés dans le bucket privé `annales-evc` ; le lien envoyé passe par
-- /api/annales-evc/telecharger, qui contrôle une signature et redirige vers une URL signée.

create table if not exists public.annales_leads (
  id uuid primary key default gen_random_uuid(),
  faculte_id text not null default 'major-ecn' references public.facultes(id) on update cascade,
  first_name text not null,
  last_name text not null default '',
  email text not null,
  phone text not null default '',
  specialty_code text not null,          -- code CNG de la spécialité (« 36 »)
  specialty text not null,               -- libellé affiché (« Pédiatrie »)
  consent_at timestamptz not null default now(),
  email_sent boolean not null default false,
  email_error text,
  download_count integer not null default 0,
  last_download_at timestamptz,
  utm jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_annales_leads_created_at on public.annales_leads (created_at desc);
create index if not exists idx_annales_leads_email on public.annales_leads (lower(email));

-- Lecture et écriture : service role uniquement (aucune policy).
alter table public.annales_leads enable row level security;

-- Bucket privé des recueils (PDF jusqu'à 40 Mo)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('annales-evc', 'annales-evc', false, 41943040, array['application/pdf'])
on conflict (id) do nothing;
