-- Parcours du Major — section pédagogique premium (« chemin de niveaux »).
-- ---------------------------------------------------------------------------
-- 42 parcours qui se suivent : il faut terminer le précédent pour ouvrir le
-- suivant. Deux nouveaux s'ouvrent chaque lundi 10h (Europe/Paris) ; les deux
-- premiers sont ouverts dès maintenant. Chaque parcours = un rappel méthodo
-- (« Bonjour… »), un cas clinique (QROC en auto-évaluation) et des QCM
-- auto-corrigés. Note /10 : < 6 « à retravailler », 6–8 « en bonne voie »,
-- > 8 « maîtrisé ».
--
-- L'onglet est réservé aux admins pour l'instant (gating applicatif), mais la
-- RLS ci-dessous est déjà prête pour une ouverture aux élèves : un élève ne lit
-- que les parcours déjà ouverts (available_at <= now()).

-- 1) Le parcours (le « niveau »).
create table if not exists public.major_parcours (
  id uuid primary key default gen_random_uuid(),
  numero integer not null unique,
  titre text not null,
  sous_titre text,
  -- Rappel méthodo mis en page (HTML riche, images en data-URI possibles).
  intro_html text not null default '',
  -- Contexte du cas clinique (vignette), affiché avant ses QROC.
  vignette_html text,
  -- Ouverture programmée. Modifiable par l'admin.
  available_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists major_parcours_numero_idx on public.major_parcours (numero);

-- 2) Les questions d'un parcours (QCM auto-corrigés + QROC auto-évalués).
create table if not exists public.major_parcours_questions (
  id uuid primary key default gen_random_uuid(),
  parcours_id uuid not null references public.major_parcours(id) on delete cascade,
  -- Regroupement d'affichage : 'qcm' (série de QCM) ou 'cas_clinique' (QROC).
  section text not null default 'qcm' check (section in ('qcm', 'cas_clinique')),
  format text not null check (format in ('qcm', 'qroc')),
  ordre integer not null default 0,
  enonce_html text not null default '',
  -- QCM : [{ "lettre": "A", "texte": "...", "correct": true }]. Vide pour QROC.
  items jsonb not null default '[]'::jsonb,
  -- QROC : réponse attendue / correction type (auto-évaluation par l'élève).
  reponse_attendue text,
  explication_html text,
  image_path text,
  created_at timestamptz not null default now()
);

create index if not exists major_parcours_questions_parcours_idx
  on public.major_parcours_questions (parcours_id, section, ordre);

-- 3) Complétion d'un parcours par un élève (note /10 + bande).
create table if not exists public.major_parcours_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parcours_id uuid not null references public.major_parcours(id) on delete cascade,
  score numeric(4, 2) not null default 0,
  band text not null default 'a_retravailler'
    check (band in ('a_retravailler', 'en_bonne_voie', 'maitrise')),
  answers jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now(),
  unique (user_id, parcours_id)
);

create index if not exists major_parcours_completions_user_idx
  on public.major_parcours_completions (user_id);

-- Touch updated_at à chaque modification du parcours.
drop trigger if exists major_parcours_touch on public.major_parcours;
create trigger major_parcours_touch
  before update on public.major_parcours
  for each row execute function public.touch_updated_at();

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table public.major_parcours enable row level security;
alter table public.major_parcours_questions enable row level security;
alter table public.major_parcours_completions enable row level security;

-- Catalogue : le staff voit tout ; un élève ne voit que les parcours ouverts.
drop policy if exists major_parcours_read on public.major_parcours;
create policy major_parcours_read on public.major_parcours
  for select to authenticated
  using (
    public.current_role() in ('admin', 'professor')
    or (active and available_at <= now())
  );

drop policy if exists major_parcours_admin on public.major_parcours;
create policy major_parcours_admin on public.major_parcours
  for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Questions : lisibles si le parcours parent l'est (staff, ou ouvert).
drop policy if exists major_parcours_questions_read on public.major_parcours_questions;
create policy major_parcours_questions_read on public.major_parcours_questions
  for select to authenticated
  using (exists (
    select 1 from public.major_parcours p
    where p.id = major_parcours_questions.parcours_id
      and (public.current_role() in ('admin', 'professor') or (p.active and p.available_at <= now()))
  ));

drop policy if exists major_parcours_questions_admin on public.major_parcours_questions;
create policy major_parcours_questions_admin on public.major_parcours_questions
  for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Complétions : chaque élève gère les siennes ; le staff les lit toutes.
drop policy if exists major_parcours_completions_own on public.major_parcours_completions;
create policy major_parcours_completions_own on public.major_parcours_completions
  for all to authenticated
  using (user_id = auth.uid() or public.current_role() in ('admin', 'professor'))
  with check (user_id = auth.uid());

-- ── Amorçage des 42 parcours ────────────────────────────────────────────────
-- Ouverture : la paire p = ceil(numero/2). Paire 1 (parcours 1 & 2) ouverte
-- maintenant ; paire p≥2 le lundi 2026-08-11 10h (Europe/Paris) + (p-2) semaines.
-- Le titre est un libellé provisoire, remplacé à l'intégration du contenu.
insert into public.major_parcours (numero, titre, available_at)
select
  n,
  'Parcours n°' || n,
  case
    when ((n + 1) / 2) = 1 then timestamp '2026-08-04 00:00:00' at time zone 'Europe/Paris'
    else (timestamp '2026-08-11 10:00:00' + (((n + 1) / 2) - 2) * interval '7 days') at time zone 'Europe/Paris'
  end
from generate_series(1, 42) as n
on conflict (numero) do nothing;

comment on table public.major_parcours is
  'Parcours du Major : niveaux séquentiels (2 ouverts chaque lundi 10h). Onglet réservé aux admins pour l''instant.';
