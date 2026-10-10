-- ============================================================================
-- « Mes Post-it » — notes autocollantes personnelles de l'élève (CDC Post-it,
-- avenant §22-35 et complément §36-50 « dates, heures, agenda »).
--
-- Modèle :
--  · postits            : la note (titre, contenu, couleur, taille, statut) et
--                         son ORIGINE figée (§25 : spécialité, item, ressource,
--                         chemin exact) — identifiants techniques + libellés.
--  · postit_placements  : où la note est affichée (§24). Une même note peut être
--                         affichée à plusieurs endroits SANS duplication : une
--                         ligne par emplacement, avec sa position et sa taille.
--  · postit_taches      : les tâches cochables (§23), avec date / heure
--                         facultatives (§37). C'est la SOURCE UNIQUE lue par
--                         l'agenda (§38-41, R13) : aucune copie dans
--                         user_agenda_events, donc jamais deux versions.
--  · postit_rappels_envoyes : marqueurs d'idempotence du cron des rappels (§45).
--  · postit_preferences : « rappels de mes tâches Post-it » activés ou non,
--                         indépendamment des notifications de cours / Zoom.
--
-- Données PERSONNELLES : tout est borné par user_id (RLS propriétaire). Le
-- projet Supabase est partagé avec Major Odontologie : aucune donnée de contenu
-- n'est dupliquée ici, seulement des identifiants et des libellés.
-- Indépendant du planificateur (§48) : aucune écriture vers pedago_*, plan_*…
-- ============================================================================

create table if not exists public.postits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titre text not null default '' check (char_length(titre) <= 200),
  contenu text not null default '' check (char_length(contenu) <= 20000),
  couleur text not null default 'jaune'
    check (couleur in ('jaune', 'rose', 'vert', 'bleu', 'orange', 'violet')),
  taille text not null default 'moyen'
    check (taille in ('petit', 'moyen', 'grand', 'libre')),
  statut text not null default 'actif'
    check (statut in ('actif', 'archive', 'supprime')),
  -- Statut à rétablir en sortant de la corbeille (actif ou archivé).
  statut_avant_suppression text
    check (statut_avant_suppression is null or statut_avant_suppression in ('actif', 'archive')),
  -- Origine (§22, §25) : figée à la création, jamais modifiée.
  origine_cle text not null,
  origine_type text not null,
  origine_chemin text,
  origine_matiere_id text,
  origine_matiere_nom text,
  origine_cours_id uuid,
  origine_cours_titre text,
  origine_ressource_id text,
  origine_ressource_titre text,
  archive_le timestamptz,
  supprime_le timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Cible des clés étrangères composites (placements, tâches) : une ligne
  -- enfant ne peut appartenir qu'au propriétaire de la note.
  unique (id, user_id)
);

create index if not exists postits_user_statut_idx on public.postits (user_id, statut, updated_at desc);
create index if not exists postits_user_cours_idx on public.postits (user_id, origine_cours_id) where origine_cours_id is not null;
create index if not exists postits_corbeille_idx on public.postits (supprime_le) where statut = 'supprime';

create table if not exists public.postit_placements (
  id uuid primary key default gen_random_uuid(),
  postit_id uuid not null,
  user_id uuid not null,
  -- Clé d'emplacement : 'accueil', 'matiere:<id>', 'cours:<uuid>',
  -- 'cours:<uuid>:fiche', 'cours:<uuid>:qcm:<serie>'… (lib/postits/emplacements).
  cle text not null check (char_length(cle) between 1 and 200),
  type text not null,
  matiere_id text,
  matiere_nom text,
  cours_id uuid,
  cours_titre text,
  ressource_id text,
  ressource_titre text,
  x integer not null default 0 check (x between -10000 and 10000),
  y integer not null default 0 check (y between -10000 and 10000),
  w integer not null default 260 check (w between 140 and 1400),
  h integer not null default 240 check (h between 110 and 1400),
  z integer not null default 0,
  reduit boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key (postit_id, user_id) references public.postits (id, user_id) on delete cascade,
  unique (postit_id, cle)
);

create index if not exists postit_placements_user_cle_idx on public.postit_placements (user_id, cle);
create index if not exists postit_placements_user_cours_idx on public.postit_placements (user_id, cours_id) where cours_id is not null;

create table if not exists public.postit_taches (
  id uuid primary key default gen_random_uuid(),
  postit_id uuid not null,
  user_id uuid not null,
  texte text not null check (char_length(texte) between 1 and 500),
  fait boolean not null default false,
  fait_le timestamptz,
  ordre integer not null default 0,
  -- §37 : date et heure facultatives (heure de Paris, murale). Pas d'heure
  -- sans date.
  echeance_date date,
  echeance_heure time,
  -- §45 : rappels facultatifs, seulement utiles avec date ET heure.
  rappels text[] not null default '{}'
    check (rappels <@ array['heure', '15min', '1h', 'veille']::text[]),
  -- §47 : « Archiver également les tâches » retire les tâches de l'agenda.
  dans_agenda boolean not null default true,
  -- Dernière modification de l'échéance ou des rappels : un rappel dont
  -- l'instant est antérieur n'est jamais envoyé (pas de rappel « en retard »
  -- à la création d'une tâche imminente).
  echeance_modifiee_le timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (postit_id, user_id) references public.postits (id, user_id) on delete cascade,
  check (echeance_heure is null or echeance_date is not null)
);

create index if not exists postit_taches_postit_idx on public.postit_taches (postit_id, ordre);
create index if not exists postit_taches_agenda_idx on public.postit_taches (user_id, echeance_date) where echeance_date is not null;
create index if not exists postit_taches_rappels_idx on public.postit_taches (echeance_date)
  where echeance_date is not null and echeance_heure is not null and fait = false and rappels <> '{}';

create table if not exists public.postit_rappels_envoyes (
  tache_id uuid not null references public.postit_taches (id) on delete cascade,
  rappel text not null,
  -- 'AAAA-MM-JJTHH:MM' : un report de la tâche réarme les rappels.
  echeance text not null,
  envoye_le timestamptz not null default now(),
  primary key (tache_id, rappel, echeance)
);

create table if not exists public.postit_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rappels_actifs boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS : chaque élève ne voit et n'écrit que ses lignes. Les marqueurs de
-- rappels ne sont accessibles qu'au service (cron) : RLS sans politique.
-- ---------------------------------------------------------------------------
alter table public.postits enable row level security;
alter table public.postit_placements enable row level security;
alter table public.postit_taches enable row level security;
alter table public.postit_rappels_envoyes enable row level security;
alter table public.postit_preferences enable row level security;

drop policy if exists postits_proprietaire on public.postits;
create policy postits_proprietaire on public.postits
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists postit_placements_proprietaire on public.postit_placements;
create policy postit_placements_proprietaire on public.postit_placements
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists postit_taches_proprietaire on public.postit_taches;
create policy postit_taches_proprietaire on public.postit_taches
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists postit_preferences_proprietaire on public.postit_preferences;
create policy postit_preferences_proprietaire on public.postit_preferences
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.postit_rappels_envoyes from anon, authenticated;
