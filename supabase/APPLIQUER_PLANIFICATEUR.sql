-- =====================================================================
-- A APPLIQUER UNE FOIS dans Supabase : Dashboard > SQL Editor > coller > Run
-- Suivi individuel (relances auto paramétrables) + Planificateur adaptatif EVC
-- (16 septembre 2026). Sans risque à relancer (if not exists / drop policy if exists).
-- Vérifier ensuite avec : node --env-file=.env.local tmp/_probe-planificateur.mjs
-- =====================================================================

-- ==================== 20260916100000_suivi_relances_auto.sql ====================
-- =====================================================================
-- Suivi individuel — relances automatiques paramétrables (§14, cahier V4)
-- ---------------------------------------------------------------------
-- Le délai et le nombre maximal de relances automatiques « invité sans
-- réservation » étaient codés en dur dans le cron (3 jours, 2 relances).
-- Ils deviennent des réglages du module, comme le rappel avant rendez-vous.
-- Sans risque à relancer.
-- =====================================================================
alter table public.suivi_settings
  add column if not exists auto_relance_enabled boolean not null default true,
  add column if not exists auto_relance_days    int     not null default 3 check (auto_relance_days between 1 and 60),
  add column if not exists auto_relance_max     int     not null default 2 check (auto_relance_max between 0 and 10);

-- ==================== 20260916110000_planificateur.sql ====================
-- =====================================================================
-- Planificateur adaptatif et personnalisé de préparation aux EVC
-- (cahier des charges + complément « couverture du programme », 09/2026)
-- ---------------------------------------------------------------------
-- A. Référentiel pédagogique (matrice)      : plan_items
-- B. Prérequis                              : plan_prerequisites
-- C. Profil pédagogique candidat            : plan_profiles, plan_mastery,
--                                             plan_mastery_history
-- D/E/F. Moteurs (priorité, planning, révision) : plan_sessions,
--                                             plan_generations
-- G. Assessment                             : plan_evaluations,
--                                             plan_question_uses, plan_question_tags
-- H. Analytics / historisation              : plan_activity
-- Réglages moteur (coefficients, seuils, intervalles) : plan_settings
-- Sans risque à relancer (if not exists / drop policy if exists).
-- =====================================================================

-- Réglages du moteur (une ligne par faculté) — tout est modifiable depuis
-- l'administration, rien n'est codé en dur (§8, §14, §16, §22).
create table if not exists public.plan_settings (
  faculte_id  text primary key default 'major-ecn',
  config      jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
insert into public.plan_settings (faculte_id) values ('major-ecn') on conflict (faculte_id) do nothing;

-- A. Matrice pédagogique (§4). `specialite_id` = collège (ou sous-collège) de
-- la plateforme ; `cours_id` = item de la plateforme quand il existe (relie
-- l'item aux questions, fiches et à la progression réelle).
create table if not exists public.plan_items (
  id                 uuid primary key default gen_random_uuid(),
  faculte_id         text not null default 'major-ecn',
  specialite_id      text not null references public.matieres(id) on delete cascade,
  cours_id           uuid references public.cours(id) on delete set null,
  code               text,
  nom_item           text not null,
  importance         int not null default 3 check (importance between 1 and 5),
  volume             int not null default 3 check (volume between 1 and 5),
  temps_reference    int check (temps_reference is null or temps_reference between 5 and 3000),
  transversalite     int not null default 1 check (transversalite between 1 and 5),
  frequence_annales  int not null default 0 check (frequence_annales >= 0),
  annees_occurrence  int[] not null default '{}'::int[],
  recence            int not null default 1 check (recence between 1 and 5),
  actif              boolean not null default true,
  priorite_forcee    int check (priorite_forcee is null or priorite_forcee between 1 and 5),
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (faculte_id, specialite_id, nom_item)
);
create index if not exists plan_items_specialite_idx on public.plan_items(specialite_id) where actif;
create index if not exists plan_items_cours_idx on public.plan_items(cours_id);

-- B. Prérequis (§5, §6) — indispensable (bloquant) ou recommandé.
create table if not exists public.plan_prerequisites (
  id                    uuid primary key default gen_random_uuid(),
  item_id               uuid not null references public.plan_items(id) on delete cascade,
  prerequisite_item_id  uuid not null references public.plan_items(id) on delete cascade,
  type                  text not null default 'indispensable' check (type in ('indispensable','recommande')),
  seuil_maitrise        int check (seuil_maitrise is null or seuil_maitrise between 0 and 100),
  created_at            timestamptz not null default now(),
  unique (item_id, prerequisite_item_id),
  check (item_id <> prerequisite_item_id)
);
create index if not exists plan_prerequisites_item_idx on public.plan_prerequisites(item_id);

-- C. Profil du candidat (§3) : spécialité, voie, dates, disponibilités,
-- information obligatoire acceptée (complément §2).
create table if not exists public.plan_profiles (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  faculte_id          text not null default 'major-ecn',
  specialite_id       text references public.matieres(id) on delete set null,
  voie                text check (voie is null or voie in ('interne','externe')),
  exam_date           date,
  start_date          date not null default current_date,
  -- minutes disponibles par jour ISO (1 = lundi … 7 = dimanche)
  availability        jsonb not null default '{"1":60,"2":60,"3":60,"4":60,"5":60,"6":120,"7":120}'::jsonb,
  consent_accepted_at timestamptz,
  consent_version     int,
  onboarding_done     boolean not null default false,
  last_generated_at   timestamptz,
  last_synced_at      timestamptz,
  plan_version        int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Niveau du candidat par item (§7) — valeur courante.
create table if not exists public.plan_mastery (
  user_id               uuid not null references auth.users(id) on delete cascade,
  item_id               uuid not null references public.plan_items(id) on delete cascade,
  declared_level        text check (declared_level is null or declared_level in ('faible','moyen','aise','inconnu')),
  mastery_score         numeric(5,2) not null default 0 check (mastery_score between 0 and 100),
  confidence            numeric(4,3) not null default 0 check (confidence between 0 and 1),
  source                text,
  status                text not null default 'non_evalue'
    check (status in ('non_evalue','a_travailler','programme','en_cours','a_consolider','maitrise','a_reactiver')),
  learning_minutes_done int not null default 0,
  reactivation_count    int not null default 0,
  last_evaluated_at     timestamptz,
  last_worked_at        timestamptz,
  updated_at            timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- Historisation (§23) : chaque évolution du niveau est conservée.
create table if not exists public.plan_mastery_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     uuid not null references public.plan_items(id) on delete cascade,
  score       numeric(5,2) not null,
  confidence  numeric(4,3) not null,
  source      text not null,
  detail      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists plan_mastery_history_user_idx on public.plan_mastery_history(user_id, item_id, created_at desc);

-- E. Séances du planning (§12, §17, §18).
create table if not exists public.plan_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  item_id         uuid references public.plan_items(id) on delete cascade,
  day             date not null,
  order_index     int not null default 0,
  minutes         int not null check (minutes between 5 and 600),
  kind            text not null check (kind in ('apprentissage','consolidation','evaluation','reactivation','revision_finale')),
  status          text not null default 'planifiee'
    check (status in ('planifiee','en_cours','terminee','reportee','sautee','annulee')),
  priority_score  numeric(5,2),
  priority_tier   text,
  reason          text not null default '',
  plan_version    int not null default 0,
  part            int,
  parts           int,
  started_at      timestamptz,
  completed_at    timestamptz,
  actual_minutes  int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists plan_sessions_user_day_idx on public.plan_sessions(user_id, day, order_index);

-- Historique des générations (§23) : résumé de chaque (re)calcul.
create table if not exists public.plan_generations (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  plan_version int not null,
  trigger      text not null,
  summary      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists plan_generations_user_idx on public.plan_generations(user_id, created_at desc);

-- G. Évaluations courtes (§13, §14, §15).
create table if not exists public.plan_evaluations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  item_id       uuid not null references public.plan_items(id) on delete cascade,
  kind          text not null default 'validation' check (kind in ('positionnement','validation','concours_blanc')),
  question_ids  uuid[] not null default '{}'::uuid[],
  answers       jsonb not null default '{}'::jsonb,
  n_questions   int not null default 0,
  score         numeric(5,2),
  result        text check (result is null or result in ('maitrise','consolidation','reprogrammer')),
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);
create index if not exists plan_evaluations_user_idx on public.plan_evaluations(user_id, item_id, created_at desc);

-- Questions déjà utilisées pour MESURER un candidat (§13) — jamais réutilisées
-- pour une validation du même candidat.
create table if not exists public.plan_question_uses (
  user_id      uuid not null references auth.users(id) on delete cascade,
  question_id  uuid not null references public.qcm_questions(id) on delete cascade,
  usage        text not null check (usage in ('entrainement','positionnement','validation','concours_blanc')),
  created_at   timestamptz not null default now(),
  primary key (user_id, question_id, usage)
);

-- Rattachement explicite question → item(s) (§13), en complément du lien
-- implicite par `cours_id`. Une question peut concerner plusieurs items.
create table if not exists public.plan_question_tags (
  question_id  uuid not null references public.qcm_questions(id) on delete cascade,
  item_id      uuid not null references public.plan_items(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (question_id, item_id)
);

-- H. Activité libre et journal (§9 complément, §23) : travail hors planning,
-- séances réalisées, reports.
create table if not exists public.plan_activity (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     uuid references public.plan_items(id) on delete cascade,
  session_id  uuid references public.plan_sessions(id) on delete set null,
  kind        text not null check (kind in ('seance_terminee','seance_reportee','seance_sautee','travail_libre','evaluation','disponibilites','onboarding','recalcul')),
  minutes     int,
  detail      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists plan_activity_user_idx on public.plan_activity(user_id, created_at desc);

-- updated_at automatique
create or replace function public.plan_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

do $$
declare t text;
begin
  foreach t in array array['plan_settings','plan_items','plan_profiles','plan_mastery','plan_sessions']
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.plan_touch_updated_at()', t, t);
  end loop;
end $$;

-- RLS : administration par défaut ; référentiel lisible par tout compte
-- connecté ; chaque candidat lit SES lignes (jamais celles d'un autre).
do $$
declare t text;
begin
  foreach t in array array['plan_settings','plan_items','plan_prerequisites','plan_profiles','plan_mastery','plan_mastery_history',
                           'plan_sessions','plan_generations','plan_evaluations','plan_question_uses','plan_question_tags','plan_activity']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_admin_all on public.%I', t, t);
    execute format('create policy %I_admin_all on public.%I for all using (public.current_role() = ''admin'') with check (public.current_role() = ''admin'')', t, t);
  end loop;
  foreach t in array array['plan_settings','plan_items','plan_prerequisites','plan_question_tags']
  loop
    execute format('drop policy if exists %I_auth_read on public.%I', t, t);
    execute format('create policy %I_auth_read on public.%I for select using (auth.uid() is not null)', t, t);
  end loop;
  foreach t in array array['plan_profiles','plan_mastery','plan_mastery_history','plan_sessions','plan_generations','plan_evaluations','plan_question_uses','plan_activity']
  loop
    execute format('drop policy if exists %I_self_read on public.%I', t, t);
    execute format('create policy %I_self_read on public.%I for select using (user_id = auth.uid())', t, t);
  end loop;
end $$;
