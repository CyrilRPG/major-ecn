-- ============================================================================
-- Calendrier EVC — source UNIQUE des dates d'épreuve, périodes d'inscription et
-- postes par spécialité (brief développeur du 30/09/2026, point B1).
--
-- Tout ce qui affiche une de ces informations la lit ici : bandeau compte à
-- rebours de l'accueil, carte de la capture du hero, section des postes, texte
-- de fond, pages spécialités, fiches concours de l'espace élève et date d'EVC
-- du planificateur. Éditable depuis /admin/calendrier-evc, sans toucher au code.
--
-- Données publiques (calendrier officiel du CNG) : lecture ouverte à tous,
-- écriture réservée au service-role (actions d'administration).
-- Migration ADDITIVE : aucune table existante n'est modifiée.
-- ============================================================================

create table if not exists public.evc_calendrier (
  id uuid primary key default gen_random_uuid(),
  session integer not null,
  slug text not null,
  nom text not null,
  -- Date de l'épreuve écrite (jour calendaire, heure de Paris). Null = à paraître.
  date_epreuve date,
  postes_interne integer check (postes_interne is null or postes_interne >= 0),
  postes_externe integer check (postes_externe is null or postes_externe >= 0),
  -- Page de la spécialité (page dédiée, sinon sa carte dans l'annuaire).
  url_page text,
  -- Période d'inscription : deux instants distincts (saisis à l'heure de Paris).
  inscription_debut timestamptz,
  inscription_fin timestamptz,
  -- Collège de la plateforme correspondant (ex. col-medecine-generale) : relie la
  -- ligne aux fiches concours de l'espace élève et au planificateur.
  college_id text,
  lieu text not null default 'Espace Jean Monnet, Rungis',
  -- Mention courte affichée sur l'accueil (ex. « Nouvelle spécialité 2026 »).
  note text,
  ordre integer not null default 0,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evc_calendrier_session_slug_uniq unique (session, slug),
  constraint evc_calendrier_inscription_ordre check (
    inscription_debut is null or inscription_fin is null or inscription_debut <= inscription_fin
  )
);

create index if not exists evc_calendrier_date_idx on public.evc_calendrier (session, date_epreuve);
create index if not exists evc_calendrier_college_idx on public.evc_calendrier (college_id) where college_id is not null;

-- Réglages de session : UNE seule ligne (id = true).
create table if not exists public.evc_calendrier_sessions (
  id boolean primary key default true check (id),
  session_en_cours integer not null default 2026,
  libelle text not null default 'EVC — Session 2026',
  -- Période d'inscription de la session suivante, dès qu'elle est connue.
  prochaine_inscription_debut timestamptz,
  prochaine_inscription_fin timestamptz,
  -- Le calendrier de la session suivante est-il publié (lignes session + 1 visibles) ?
  prochaine_session_publiee boolean not null default false,
  -- Lien « Consulter le déroulé de la session en cours » (bandeau, après la dernière épreuve).
  url_deroule text not null default '/blog/calendrier-evc-2026-dates-epreuves-specialites',
  -- Spécialité présentée dans la capture du hero (slug d'une ligne du calendrier).
  slug_capture_hero text not null default 'medecine-generale',
  -- Totaux officiels (la voie interne compte plus de quarante spécialités, que
  -- le calendrier ne liste pas toutes) et leur source.
  postes_total_interne integer check (postes_total_interne is null or postes_total_interne >= 0),
  postes_total_externe integer check (postes_total_externe is null or postes_total_externe >= 0),
  source_postes text default 'Arrêté du 12 juin 2026',
  updated_at timestamptz not null default now(),
  constraint evc_calendrier_sessions_inscription_ordre check (
    prochaine_inscription_debut is null or prochaine_inscription_fin is null
    or prochaine_inscription_debut <= prochaine_inscription_fin
  )
);

alter table public.evc_calendrier enable row level security;
alter table public.evc_calendrier_sessions enable row level security;

drop policy if exists evc_calendrier_lecture_publique on public.evc_calendrier;
create policy evc_calendrier_lecture_publique on public.evc_calendrier
  for select to anon, authenticated using (true);

drop policy if exists evc_calendrier_sessions_lecture_publique on public.evc_calendrier_sessions;
create policy evc_calendrier_sessions_lecture_publique on public.evc_calendrier_sessions
  for select to anon, authenticated using (true);

grant select on public.evc_calendrier to anon, authenticated;
grant select on public.evc_calendrier_sessions to anon, authenticated;

-- ── Données initiales : session 2026 ────────────────────────────────────────
-- Les treize spécialités de la voie externe (dates CNG, postes de l'arrêté du
-- 12 juin 2026) + la chirurgie orthopédique (voie interne seule, 8 janvier 2027).
-- Inscriptions : du 17 juin 2026 à 14 h au 16 juillet 2026 à 17 h, heure de Paris.
insert into public.evc_calendrier
  (session, slug, nom, date_epreuve, postes_externe, postes_interne, url_page, college_id, note, ordre,
   inscription_debut, inscription_fin)
select v.session, v.slug, v.nom, v.date_epreuve::date, v.externe, v.interne, v.url_page, v.college_id, v.note, v.ordre,
       timestamptz '2026-06-17 14:00:00 Europe/Paris', timestamptz '2026-07-16 17:00:00 Europe/Paris'
from (values
  (2026, 'medecine-du-travail', 'Médecine et santé au travail', '2026-11-10', 61, null::int, '/specialites#medecine-du-travail', 'col-medecine-du-travail', null, 10),
  (2026, 'anesthesie-reanimation', 'Anesthésie-réanimation', '2026-11-13', 64, 201, '/specialites/anesthesie-reanimation', 'col-anesthesie-reanimation', null, 20),
  (2026, 'medecine-d-urgence', 'Médecine d’urgence', '2026-11-19', 72, 270, '/specialites/medecine-d-urgence', 'col-mir', null, 30),
  (2026, 'oncologie', 'Oncologie', '2026-11-20', 29, null, '/specialites#oncologie', 'col-oncologie', null, 40),
  (2026, 'medecine-physique-et-de-readaptation', 'Médecine physique et de réadaptation', '2026-12-01', 37, null, '/specialites#medecine-physique-et-de-readaptation', 'col-medecine-physique-readaptation', null, 50),
  (2026, 'pneumologie', 'Pneumologie', '2026-12-02', 17, 40, '/specialites#pneumologie', 'col-pneumologie', null, 60),
  (2026, 'cardiologie-et-maladies-vasculaires', 'Médecine cardiovasculaire', '2026-12-03', 20, 146, '/specialites/cardiologie-et-maladies-vasculaires', 'col-cardiologie', null, 70),
  (2026, 'radiodiagnostic-et-imagerie-medicale', 'Radiologie et imagerie médicale', '2026-12-08', 72, 116, '/specialites/radiologie-et-imagerie-medicale', 'col-imagerie-medicale', null, 80),
  (2026, 'pediatrie', 'Pédiatrie', '2026-12-09', 75, 91, '/specialites/pediatrie', 'col-pediatrie', null, 90),
  (2026, 'psychiatrie', 'Psychiatrie', '2026-12-10', 198, 450, '/specialites/psychiatrie', 'col-psychiatrie', 'Nouvelle spécialité 2026', 100),
  (2026, 'chirurgie-orthopedique-et-traumatologie', 'Chirurgie orthopédique et traumatologique', '2027-01-08', null, 101, '/specialites/chirurgie-orthopedique-et-traumatologie', 'col-orthopedie', null, 105),
  (2026, 'geriatrie', 'Gériatrie', '2027-01-12', 110, 236, '/specialites#geriatrie', 'col-geriatrie', null, 110),
  (2026, 'medecine-interne', 'Médecine interne polyvalente et immunologie clinique', '2027-01-13', 213, 564, '/specialites#medecine-interne', 'col-medecine-interne', 'MIPIC — nouvelle spécialité 2026', 120),
  (2026, 'medecine-generale', 'Médecine générale', '2027-01-15', 35, 89, '/specialites/medecine-generale', 'col-medecine-generale', null, 130)
) as v(session, slug, nom, date_epreuve, externe, interne, url_page, college_id, note, ordre)
on conflict (session, slug) do nothing;

insert into public.evc_calendrier_sessions (id, postes_total_interne, postes_total_externe)
values (true, 2896, 1003)
on conflict (id) do nothing;
