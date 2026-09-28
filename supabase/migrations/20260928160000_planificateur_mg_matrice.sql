-- Planificateur EVC — matrice Médecine générale 2026 (voies interne / externe)
-- et file de travail adaptative (addendum du 28/09/2026).
--
-- A. Référentiel : une matrice maître, deux profils de pondération. Chaque
--    item garde ses six critères (0–5) ; le score /100 de chaque voie en est
--    déduit par les poids réglables (plan_settings.config.voie_weights), les
--    scores et priorités P1–P4 du fichier sont conservés pour contrôle.
-- B. Profil : niveau déclaré PAR SPÉCIALITÉ (Faible / Moyen / Bon), jours
--    d'indisponibilité, fenêtres d'information (première génération, temps
--    insuffisant), journée clôturée.
-- C. Candidat × item : origine du niveau (déclaré / observé), nombre
--    d'activités, résultats, temps réellement passé, prochaine réactivation.
-- D. Séances : approfondissement et entraînement, origine (planning, avance,
--    temps supplémentaire) et jour initialement prévu.

-- A. Référentiel
alter table public.plan_items add column if not exists criteres jsonb not null default '{}'::jsonb;
alter table public.plan_items add column if not exists score_interne numeric(5,2) check (score_interne is null or score_interne between 0 and 100);
alter table public.plan_items add column if not exists score_externe numeric(5,2) check (score_externe is null or score_externe between 0 and 100);
alter table public.plan_items add column if not exists etoiles_interne int check (etoiles_interne is null or etoiles_interne between 0 and 5);
alter table public.plan_items add column if not exists etoiles_externe int check (etoiles_externe is null or etoiles_externe between 0 and 5);
alter table public.plan_items add column if not exists priorite_interne text check (priorite_interne is null or priorite_interne in ('P1','P2','P3','P4'));
alter table public.plan_items add column if not exists priorite_externe text check (priorite_externe is null or priorite_externe in ('P1','P2','P3','P4'));
alter table public.plan_items add column if not exists mode_travail_interne text;
alter table public.plan_items add column if not exists mode_travail_externe text;
alter table public.plan_items add column if not exists note_plateforme int check (note_plateforme is null or note_plateforme between 0 and 5);

-- B. Profil
alter table public.plan_profiles add column if not exists specialty_levels jsonb not null default '{}'::jsonb;
alter table public.plan_profiles add column if not exists unavailable_days date[] not null default '{}';
alter table public.plan_profiles add column if not exists exam_date_source text check (exam_date_source is null or exam_date_source in ('fiche_concours','candidat'));
alter table public.plan_profiles add column if not exists first_plan_ack_at timestamptz;
alter table public.plan_profiles add column if not exists insufficient_ack_at timestamptz;
alter table public.plan_profiles add column if not exists day_closed_on date;

-- C. Candidat × item
alter table public.plan_mastery add column if not exists origin text not null default 'declare' check (origin in ('declare','observe'));
alter table public.plan_mastery add column if not exists activity_count int not null default 0;
alter table public.plan_mastery add column if not exists results_count int not null default 0;
alter table public.plan_mastery add column if not exists results_correct int not null default 0;
alter table public.plan_mastery add column if not exists last_result numeric(5,2);
alter table public.plan_mastery add column if not exists time_spent_minutes int not null default 0;
alter table public.plan_mastery add column if not exists next_reactivation_on date;

-- D. Séances
alter table public.plan_sessions drop constraint if exists plan_sessions_kind_check;
alter table public.plan_sessions add constraint plan_sessions_kind_check
  check (kind in ('apprentissage','consolidation','approfondissement','evaluation','reactivation','entrainement','revision_finale'));
alter table public.plan_sessions add column if not exists origin text not null default 'planning' check (origin in ('planning','avance','temps_supplementaire'));
alter table public.plan_sessions add column if not exists planned_day date;

alter table public.plan_activity drop constraint if exists plan_activity_kind_check;
alter table public.plan_activity add constraint plan_activity_kind_check
  check (kind in ('seance_terminee','seance_reportee','seance_sautee','seance_avancee','temps_supplementaire','journee_terminee',
                  'travail_libre','evaluation','disponibilites','onboarding','recalcul'));
