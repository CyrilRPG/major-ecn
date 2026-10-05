-- =====================================================================
-- Planificateur adaptatif EVC — cahier des charges V4.1 finale (05/10/2026)
-- + complément « structure variable des référentiels » (HIERARCHICAL / FLAT)
-- + complément « calcul de la réalisation du planning » (unités validées).
-- ---------------------------------------------------------------------
-- Boucle : MATRICE + ACTIVITÉS RÉALISÉES → SIGNAUX → ORCHESTRATEUR →
-- learning_need → PLANIFICATEUR → planned_activity → RÉALISATION → SIGNAL.
-- L'orchestrateur, les signaux, l'état de maîtrise et les réactivations sont
-- ceux du MOTEUR PÉDAGOGIQUE CENTRAL (20261005100000 → 100500, Orchestrateur
-- V1.0 : « le CDC Orchestrateur prévaut », V4.1 §9). Le planificateur ne
-- tient que ce qui lui appartient : structure du référentiel, auto-évaluation,
-- activités planifiées et unités réellement validées, versions de journée,
-- mode prioritaire, plafond de nouveauté, coachings.
--
-- Migration ADDITIVE : aucune colonne existante n'est supprimée ni renommée,
-- les tables du modèle précédent (plan_sessions, plan_mastery…) restent en
-- place pour l'historique. Le code en production avant le déploiement
-- continue de fonctionner. Sans risque à relancer.
-- =====================================================================

-- A. Préparations : structure du référentiel pilotée par les données.
create table if not exists public.plan_preparations (
  specialite_id         text primary key references public.matieres(id) on delete cascade,
  faculte_id            text not null default 'major-ecn',
  label                 text,
  curriculum_structure  text not null default 'FLAT' check (curriculum_structure in ('HIERARCHICAL','FLAT')),
  structure_source      text not null default 'auto' check (structure_source in ('auto','admin')),
  student_enabled       boolean not null default false,
  coaching_enabled      boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Domaines d'un référentiel hiérarchique (jamais créés pour un référentiel plat).
create table if not exists public.plan_domains (
  id             uuid primary key default gen_random_uuid(),
  specialite_id  text not null references public.matieres(id) on delete cascade,
  matiere_id     text references public.matieres(id) on delete set null,
  label          text not null,
  order_index    int not null default 0,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (specialite_id, label)
);
create index if not exists plan_domains_spe_idx on public.plan_domains(specialite_id, order_index);

-- B. Matrice : champs V4.1 de l'item.
alter table public.plan_items add column if not exists domain_id uuid references public.plan_domains(id) on delete set null;
alter table public.plan_items add column if not exists display_order int;
alter table public.plan_items add column if not exists hard_priority boolean not null default false;
alter table public.plan_items add column if not exists pertinence_2026 numeric(3,1) check (pertinence_2026 is null or pertinence_2026 between 0 and 5);
alter table public.plan_items add column if not exists pertinence_2026_active boolean not null default false;
alter table public.plan_items add column if not exists notions_incontournables text[] not null default '{}';
alter table public.plan_items add column if not exists difficulte int check (difficulte is null or difficulte between 1 and 5);
alter table public.plan_items add column if not exists besoin_entrainement int check (besoin_entrainement is null or besoin_entrainement between 0 and 5);
alter table public.plan_items add column if not exists occurrence_details jsonb not null default '[]'::jsonb;
create index if not exists plan_items_domain_idx on public.plan_items(domain_id);

-- Prérequis : recommandation forte, bloquante seulement si blocking = true (§17).
alter table public.plan_prerequisites add column if not exists blocking boolean;
update public.plan_prerequisites set blocking = (type = 'indispensable') where blocking is null;
alter table public.plan_prerequisites alter column blocking set default false;
alter table public.plan_prerequisites add column if not exists force int check (force is null or force between 1 and 5);

-- Origine d'une tentative (révision transversale / entraînement ciblé / planificateur / Check-up).
alter table public.qcm_attempts add column if not exists origin text;

-- D. Profil candidat V4.1.
alter table public.plan_profiles add column if not exists engine_version text;
alter table public.plan_profiles add column if not exists v41_migrated_at timestamptz;
alter table public.plan_profiles add column if not exists timezone text;
alter table public.plan_profiles add column if not exists preferences jsonb not null default '{}'::jsonb;
alter table public.plan_profiles add column if not exists global_self_level text;
alter table public.plan_profiles add column if not exists domain_levels jsonb not null default '{}'::jsonb;
alter table public.plan_profiles add column if not exists self_assessed_at timestamptz;
alter table public.plan_profiles add column if not exists item_precision_done boolean not null default false;
alter table public.plan_profiles add column if not exists novelty_factor numeric(5,3) not null default 1;
alter table public.plan_profiles add column if not exists novelty_adjusted_on date;
alter table public.plan_profiles add column if not exists novelty_recalibrated boolean not null default false;
alter table public.plan_profiles add column if not exists priority_mode boolean not null default false;
alter table public.plan_profiles add column if not exists priority_mode_since date;
alter table public.plan_profiles add column if not exists priority_mode_reasons text[] not null default '{}';
alter table public.plan_profiles add column if not exists priority_mode_evaluated_on date;
alter table public.plan_profiles add column if not exists last_closed_day date;
alter table public.plan_profiles add column if not exists signals_synced_at timestamptz;
alter table public.plan_profiles add column if not exists parameter_set_version int;
alter table public.plan_profiles add column if not exists v41_invite_dismissed_at timestamptz;

-- E. Données du planificateur par item (jamais un second statut de maîtrise : celui-ci
-- est tenu par le moteur central, candidate_item_state). Auto-évaluation V4.1
-- (§5 : SPECIALTY_INHERITED / ITEM_EXPLICIT), acquisition faite, préférence,
-- retrait / version courte / difficulté (cahier « Alertes » §26, §40).
create table if not exists public.plan_item_states (
  user_id                   uuid not null references auth.users(id) on delete cascade,
  item_id                   uuid not null references public.plan_items(id) on delete cascade,
  self_assessment_level     text not null default 'NOT_EVALUATED'
    check (self_assessment_level in ('NOT_WORKED','WEAK','TO_CONSOLIDATE','GOOD','VERY_GOOD','NOT_EVALUATED')),
  self_assessment_source    text check (self_assessment_source is null or self_assessment_source in ('SPECIALTY_INHERITED','ITEM_EXPLICIT')),
  self_assessed_at          timestamptz,
  worked_hint               text check (worked_hint is null or worked_hint in ('YES','NO','UNSURE')),
  acquisition_completed_at  timestamptz,
  learn_minutes_done        int not null default 0,
  user_preference_weight    numeric(4,3) not null default 0,
  excluded_at               timestamptz,
  excluded_reason           text,
  excluded_comment          text,
  short_version             boolean not null default false,
  difficulty_at             timestamptz,
  difficulty_count          int not null default 0,
  computed_at               timestamptz not null default now(),
  primary key (user_id, item_id)
);
create index if not exists plan_item_states_item_idx on public.plan_item_states(item_id);

-- H. planned_activity (§7.3) — statut de l'activité, jamais de l'item.
create table if not exists public.plan_activities (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references auth.users(id) on delete cascade,
  central_need_ids            uuid[] not null default '{}',
  need_keys                   text[] not null default '{}',
  item_id                     uuid references public.plan_items(id) on delete set null,
  item_ids                    uuid[] not null default '{}',
  domain_id                   uuid,
  scheduled_date              date not null,
  planned_day                 date,
  order_index                 int not null default 0,
  estimated_duration_minutes  int not null check (estimated_duration_minutes between 1 and 600),
  reference_minutes           int,
  activity_type               text not null check (activity_type in ('LEARN','CONSOLIDATE','REACTIVATE','ERROR_REVIEW','DIAGNOSTIC','EXAM_PRACTICE','METHODOLOGY','CHECKUP','MOCK_EXAM')),
  block_kind                  text not null,
  badges                      text[] not null default '{}',
  reason                      text not null default '',
  resource_ids                jsonb not null default '{}'::jsonb,
  unit_kind                   text check (unit_kind is null or unit_kind in ('QUESTION','FLASHCARD','DP_QUESTION','COACHING_QUESTION','MOCK_QUESTION')),
  planned_units               int check (planned_units is null or planned_units >= 0),
  validated_units             int not null default 0,
  completion_rate             numeric(5,4),
  measurable                  boolean not null default false,
  planned_workload_weight     numeric(7,2) not null default 0,
  target_tags                 text[] not null default '{}',
  target_question_ids         uuid[] not null default '{}',
  status                      text not null default 'PLANNED' check (status in ('PENDING','PLANNED','DUE','IN_PROGRESS','PARTIALLY_COMPLETED','OVERDUE','POSTPONED','COMPLETED','CANCELLED')),
  cancellation_reason         text,
  origin                      text not null default 'PLAN' check (origin in ('PLAN','ADDED','REPLACEMENT','ADVANCE','EXTRA')),
  progression                 boolean not null default false,
  priority_score              numeric(6,2),
  part                        int,
  parts                       int,
  daily_plan_version          int,
  generation_id               uuid,
  started_at                  timestamptz,
  completed_at                timestamptz,
  closed_at                   timestamptz,
  checkpoint_at               timestamptz,
  actual_minutes              int,
  worked_hint                 text,
  defer_reason                text,
  defer_comment               text,
  deferred_to                 date,
  cancel_reason               text,
  cancel_comment              text,
  pinned                      boolean not null default false,
  short_version               boolean not null default false,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create index if not exists plan_activities_user_day_idx on public.plan_activities(user_id, scheduled_date, order_index);
create index if not exists plan_activities_open_idx on public.plan_activities(user_id) where status in ('PENDING','PLANNED','DUE','IN_PROGRESS','PARTIALLY_COMPLETED');
create index if not exists plan_activities_item_idx on public.plan_activities(item_id);

-- Unités réellement validées (complément « réalisation ») : une unité par activité, une source une seule fois.
create table if not exists public.plan_activity_units (
  id            uuid primary key default gen_random_uuid(),
  activity_id   uuid not null references public.plan_activities(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  unit_key      text not null,
  source_key    text not null,
  validated_at  timestamptz not null,
  result        numeric(5,4),
  detail        jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  unique (activity_id, unit_key),
  unique (user_id, source_key)
);
create index if not exists plan_activity_units_user_time_idx on public.plan_activity_units(user_id, validated_at);

-- Versions du plan de la journée (daily_plan_version) : toutes conservées pour audit.
create table if not exists public.plan_day_plans (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  day                   date not null,
  version               int not null,
  status                text not null default 'ACTIVE' check (status in ('ACTIVE','CLOSED','SUPERSEDED')),
  availability_minutes  int not null default 0,
  off                   boolean not null default false,
  phase                 int,
  target_progression    numeric(4,3),
  entries               jsonb not null default '[]'::jsonb,
  reason                text,
  generation_id         uuid,
  created_at            timestamptz not null default now(),
  closed_at             timestamptz,
  unique (user_id, day, version)
);
create index if not exists plan_day_plans_user_day_idx on public.plan_day_plans(user_id, day desc, version desc);

-- Journées clôturées (réalisation, régularité, mode prioritaire, analytics §35).
create table if not exists public.plan_day_metrics (
  user_id               uuid not null references auth.users(id) on delete cascade,
  day                   date not null,
  off                   boolean not null default false,
  availability_minutes  int not null default 0,
  completion_rate       numeric(5,4),
  planned_weight        numeric(8,2) not null default 0,
  validated_weight      numeric(8,2) not null default 0,
  activities_planned    int not null default 0,
  activities_completed  int not null default 0,
  worked                boolean not null default false,
  progression_weight    numeric(8,2) not null default 0,
  revision_weight       numeric(8,2) not null default 0,
  minutes_planned       int not null default 0,
  actual_minutes        int,
  extra_units           int not null default 0,
  projected_coverage    numeric(5,4),
  p1_backlog_minutes    int,
  p1_capacity_minutes   int,
  p1_absorbable         boolean,
  evaluable             boolean not null default false,
  conforming            boolean,
  priority_mode         boolean not null default false,
  postponements         int not null default 0,
  day_plan_version      int,
  closed_at             timestamptz not null default now(),
  primary key (user_id, day)
);

-- J. Coachings du Parcours du Major = ressources, jamais des items (§24-§27).
create table if not exists public.plan_coachings (
  id                          uuid primary key default gen_random_uuid(),
  parcours_id                 uuid unique references public.major_parcours(id) on delete cascade,
  speciality_id               text not null references public.matieres(id) on delete cascade,
  numero                      int,
  title                       text not null,
  primary_type                text not null default 'connaissance' check (primary_type in ('methodologie','connaissance','cas_clinique','annale','imagerie','outil_transversal','prescription','prevention','mixte')),
  secondary_types             text[] not null default '{}',
  linked_item_ids             uuid[] not null default '{}',
  related_item_ids            uuid[] not null default '{}',
  learning_functions          text[] not null default '{}',
  internal_external           text not null default 'mixte' check (internal_external in ('interne','externe','mixte')),
  estimated_duration_minutes  int not null default 30 check (estimated_duration_minutes between 5 and 240),
  recommended_phase           text not null default 'toutes' check (recommended_phase in ('debut','milieu','fin','toutes')),
  editorial_priority          int not null default 3 check (editorial_priority between 1 and 5),
  can_be_planned              boolean not null default true,
  can_replace_activity        boolean not null default false,
  produces_mastery_signal     boolean not null default false,
  is_featured                 boolean not null default false,
  active                      boolean not null default true,
  qualified_at                timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create table if not exists public.plan_coaching_blocks (
  id                          uuid primary key default gen_random_uuid(),
  coaching_id                 uuid not null references public.plan_coachings(id) on delete cascade,
  block_type                  text not null check (block_type in ('cours','cas_clinique','correction','qcm','methodologie')),
  title                       text not null,
  linked_item_ids             uuid[] not null default '{}',
  estimated_duration_minutes  int not null default 10 check (estimated_duration_minutes between 1 and 240),
  evaluative                  boolean not null default false,
  question_ids                uuid[] not null default '{}',
  order_index                 int not null default 0,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create index if not exists plan_coaching_blocks_coaching_idx on public.plan_coaching_blocks(coaching_id, order_index);

-- L. Paramètres versionnés (parameter_set_version) et journal des générations.
create table if not exists public.plan_parameter_sets (
  version     int primary key,
  faculte_id  text not null default 'major-ecn',
  params      jsonb not null,
  note        text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
alter table public.plan_generations add column if not exists orchestrator_spec_version text;
alter table public.plan_generations add column if not exists planner_spec_version text;
alter table public.plan_generations add column if not exists matrix_version text;
alter table public.plan_generations add column if not exists parameter_set_version int;
alter table public.plan_generations add column if not exists daily_plan_version int;
alter table public.plan_generations add column if not exists duration_ms int;

-- Journal d'activité : événements V4.1 (analytics §35), en plus de ceux de 20261005100300 (union, jamais de retrait).
alter table public.plan_activity drop constraint if exists plan_activity_kind_check;
alter table public.plan_activity add constraint plan_activity_kind_check check (kind in (
  'seance_terminee','seance_reportee','seance_sautee','seance_avancee','temps_supplementaire','journee_terminee',
  'travail_libre','evaluation','disponibilites','onboarding','recalcul',
  'activite_commencee','activite_terminee','activite_reportee','activite_avancee','activite_ajoutee','activite_remplacee',
  'activite_cloturee','journee_cloturee','journee_off','mode_prioritaire_entree','mode_prioritaire_sortie','nouveaute_ajustee',
  'auto_evaluation','preferences','changement_specialite','coaching_vu','coaching_planifie','coaching_ignore','coaching_termine',
  'checkup','migration_v41','point_de_controle',
  -- Types de la migration 20261005100300 (statuts, reports, annulations : cahier « Alertes… et planificateur adaptatif »).
  'pause','reprise','desactivation','reactivation','reconfiguration','report','repartition','annulation',
  'retrait_item','remise_item','version_courte','difficulte','indisponibilite','adaptation','journee_incomplete',
  'ajout_moteur_central'
));

-- M. Protection de l'historique : un item portant du travail V4.1 ne peut pas être supprimé (on le retire).
create or replace function public.plan_items_protect_history()
returns trigger
language plpgsql
as $$
begin
  if exists (select 1 from public.plan_sessions where item_id = old.id and status in ('terminee','en_cours'))
     or exists (select 1 from public.plan_evaluations where item_id = old.id and completed_at is not null)
     or exists (select 1 from public.plan_mastery where item_id = old.id
                  and (activity_count > 0 or time_spent_minutes > 0 or results_count > 0 or reactivation_count > 0 or learning_minutes_done > 0))
     or exists (select 1 from public.plan_activities where item_id = old.id and status in ('IN_PROGRESS','PARTIALLY_COMPLETED','COMPLETED'))
  then
    raise exception 'Item « % » : du travail d''élève y est rattaché. Retirez-le de la matrice au lieu de le supprimer.', old.nom_item
      using errcode = 'P0001';
  end if;
  return old;
end;
$$;

-- updated_at automatique
do $$
declare t text;
begin
  foreach t in array array['plan_preparations','plan_domains','plan_activities','plan_coachings','plan_coaching_blocks']
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.plan_touch_updated_at()', t, t);
  end loop;
end $$;

-- N. RLS : administration ; chaque candidat lit SES lignes ; le référentiel est lisible par tout compte connecté.
-- Toutes les écritures passent par le serveur (service-role). Fonctions enveloppées dans (select …).
do $$
declare t text;
begin
  foreach t in array array['plan_preparations','plan_domains','plan_item_states','plan_activities','plan_activity_units','plan_day_plans',
                           'plan_day_metrics','plan_coachings','plan_coaching_blocks','plan_parameter_sets']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_admin_all on public.%I', t, t);
    execute format('create policy %I_admin_all on public.%I for all using ((select public.current_role()) = ''admin'') with check ((select public.current_role()) = ''admin'')', t, t);
  end loop;
  foreach t in array array['plan_preparations','plan_domains','plan_coachings','plan_coaching_blocks']
  loop
    execute format('drop policy if exists %I_auth_read on public.%I', t, t);
    execute format('create policy %I_auth_read on public.%I for select using ((select auth.uid()) is not null)', t, t);
  end loop;
  foreach t in array array['plan_item_states','plan_activities','plan_activity_units','plan_day_plans','plan_day_metrics']
  loop
    execute format('drop policy if exists %I_self_read on public.%I', t, t);
    execute format('create policy %I_self_read on public.%I for select using (user_id = (select auth.uid()))', t, t);
  end loop;
end $$;

-- O. Reprise : préparations existantes et domaines de la Médecine générale (sous-collèges réels portant des items).
insert into public.plan_preparations (specialite_id, label, curriculum_structure, structure_source, student_enabled, coaching_enabled)
select m.id, m.nom,
       case when exists (select 1 from public.plan_items i join public.matieres s on s.id = i.specialite_id where s.parent_matiere_id = m.id) then 'HIERARCHICAL' else 'FLAT' end,
       'auto',
       m.id = 'col-medecine-generale',
       m.id = 'col-medecine-generale'
  from public.matieres m
 where m.parent_matiere_id is null
   and exists (select 1 from public.plan_items i left join public.matieres s on s.id = i.specialite_id where i.specialite_id = m.id or s.parent_matiere_id = m.id)
on conflict (specialite_id) do nothing;

insert into public.plan_domains (specialite_id, matiere_id, label, order_index)
select s.parent_matiere_id, s.id, s.nom, coalesce(s.order_index, 0)
  from public.matieres s
 where s.parent_matiere_id in (select specialite_id from public.plan_preparations where curriculum_structure = 'HIERARCHICAL')
   and exists (select 1 from public.plan_items i where i.specialite_id = s.id)
on conflict (specialite_id, label) do nothing;

update public.plan_items i
   set domain_id = d.id
  from public.plan_domains d
 where d.matiere_id = i.specialite_id and i.domain_id is null;

update public.plan_items i
   set display_order = x.rn
  from (select id, row_number() over (partition by coalesce(domain_id::text, specialite_id) order by nom_item) as rn from public.plan_items) x
 where x.id = i.id and i.display_order is null;
