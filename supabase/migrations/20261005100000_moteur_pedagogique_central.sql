-- ═══════════════════════════════════════════════════════════════════════════
-- Moteur pédagogique central (Orchestrateur V1.0 + Interconnexion pédagogique)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Cahiers des charges : « Orchestrateur pédagogique central — version de
-- référence V1.0 » et « Interconnexion pédagogique — EVC Check-up ×
-- Révisions transversales × Planificateur adaptatif × EVC Arena ».
--
-- La clé centrale est l'ITEM (`cours.id`). Tous les modules émettent des
-- SIGNAUX standardisés vers un moteur unique qui tient l'état de chaque item
-- par candidat (`candidate_item_state`), l'historique (`pedago_events`), les
-- besoins fusionnés (`candidate_active_need`) et les réactivations
-- (`candidate_review_schedule`). Le planificateur reste l'agenda
-- (`plan_sessions` = candidate_planner_activity).
--
-- Migration ADDITIVE : aucune table existante n'est modifiée. Sans risque à
-- relancer (if not exists / drop policy if exists).

-- ─── Réglages administrables (aucun paramètre codé en dur) ───
create table if not exists public.pedago_settings (
  faculte_id  text not null default 'major-ecn',
  module      text not null check (module in ('orchestrateur', 'engagement', 'checkup')),
  config      jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null,
  primary key (faculte_id, module)
);

-- ─── Profil pédagogique du candidat (date d'EVC pertinente, temps du jour) ───
create table if not exists public.candidate_pedago_profile (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  main_specialite_id    text references public.matieres(id) on delete set null,
  exam_date             date,
  exam_date_source      text check (exam_date_source is null or exam_date_source in ('calendrier', 'planificateur', 'candidat')),
  daily_minutes         int check (daily_minutes is null or (daily_minutes between 10 and 600)),
  exam_invite_dismissed_at timestamptz,
  updated_at            timestamptz not null default now()
);

-- ─── Signaux : format unique (§3) ───
-- `signal_id` = clé d'idempotence (ex. « checkup:<session>:<question> ») :
-- un signal déjà traité n'a aucun effet supplémentaire (§10, §47).
create table if not exists public.pedago_signals (
  signal_id                  text primary key,
  user_id                    uuid not null references auth.users(id) on delete cascade,
  item_id                    uuid references public.cours(id) on delete set null,
  source                     text not null check (source in ('checkup', 'evc_arena', 'transversal_review', 'planner_activity', 'training', 'concours_blanc')),
  content_source             text check (content_source is null or content_source in ('structured_item', 'des_bank', 'transversal_bank', 'evc_annale', 'arena_dedicated', 'concours_blanc_dedicated')),
  source_strength            text check (source_strength is null or source_strength in ('strong', 'intermediate', 'weak')),
  result_type                text not null check (result_type in ('positive', 'partial', 'incorrect', 'review_due', 'completed', 'other')),
  need_type                  text not null check (need_type in ('review', 'consolidate', 'reactivate', 'evaluate', 'none')),
  origin_activity_id         text not null,
  origin_question_id         uuid,
  estimated_duration_minutes int,
  metadata                   jsonb not null default '{}'::jsonb,
  created_at                 timestamptz not null default now(),
  expires_at                 timestamptz,
  received_at                timestamptz not null default now(),
  processed_at               timestamptz,
  status                     text not null default 'pending' check (status in ('pending', 'processed', 'rejected')),
  error                      text
);
create index if not exists pedago_signals_user_idx on public.pedago_signals (user_id, created_at desc);
create index if not exists pedago_signals_user_item_idx on public.pedago_signals (user_id, item_id, created_at desc);
create index if not exists pedago_signals_pending_idx on public.pedago_signals (received_at) where status = 'pending';

-- Signaux mal formés : rejetés ET journalisés (§3), sans contrainte de clé.
create table if not exists public.pedago_signal_rejects (
  id          uuid primary key default gen_random_uuid(),
  signal_id   text,
  user_id     uuid,
  payload     jsonb not null default '{}'::jsonb,
  reason      text not null,
  created_at  timestamptz not null default now()
);
create index if not exists pedago_signal_rejects_created_idx on public.pedago_signal_rejects (created_at desc);

-- ─── État central par item (Interconnexion §3) ───
create table if not exists public.candidate_item_state (
  user_id                    uuid not null references auth.users(id) on delete cascade,
  item_id                    uuid not null references public.cours(id) on delete cascade,
  speciality_id              text,
  category_id                text,
  mastery_status             text not null default 'non_evalue'
                               check (mastery_status in ('non_evalue', 'a_revoir', 'a_consolider', 'en_bonne_voie', 'maitrise_consolidee')),
  status_reason              text,
  status_changed_at          timestamptz,
  last_activity_at           timestamptz,
  last_result                text check (last_result is null or last_result in ('positive', 'partial', 'incorrect')),
  last_result_source         text,
  last_result_strength       text,
  last_result_at             timestamptz,
  priority_level             smallint,
  priority_score             numeric(5,2),
  last_priority_calculated_at timestamptz,
  next_review_at             date,
  positive_count             int not null default 0,
  partial_count              int not null default 0,
  negative_count             int not null default 0,
  recent_error_at            timestamptz,
  recent_strong_error_at     timestamptz,
  mastery_confirmed_at       timestamptz,
  needs_review               boolean not null default false,
  planner_priority           numeric(5,2),
  control_pending            boolean not null default false,
  control_reason             text,
  control_requested_at       timestamptz,
  -- Erreurs faibles DISTINCTES (question_id + date) sur 14 jours glissants.
  weak_errors                jsonb not null default '[]'::jsonb,
  -- Fenêtres utiles aux règles « En bonne voie » / « Maîtrise consolidée ».
  positives                  jsonb not null default '[]'::jsonb,
  errors                     jsonb not null default '[]'::jsonb,
  last_signal_ids            text[] not null default '{}',
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  primary key (user_id, item_id)
);
create index if not exists candidate_item_state_status_idx on public.candidate_item_state (user_id, mastery_status);

-- ─── Historique / moteur d'événements (Interconnexion §33, §40 ; Orchestrateur §29) ───
-- `event_key` unique : le même événement n'est jamais traité deux fois.
create table if not exists public.pedago_events (
  id          uuid primary key default gen_random_uuid(),
  event_key   text not null unique,
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     uuid references public.cours(id) on delete set null,
  event_type  text not null,
  source      text,
  old_status  text,
  new_status  text,
  trigger     text,
  signal_id   text,
  activity_id text,
  question_id uuid,
  result      text,
  detail      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists pedago_events_user_idx on public.pedago_events (user_id, created_at desc);
create index if not exists pedago_events_user_item_idx on public.pedago_events (user_id, item_id, created_at desc);
create index if not exists pedago_events_type_idx on public.pedago_events (event_type, created_at desc);

-- ─── Besoins pédagogiques fusionnés (Orchestrateur §9) ───
-- Un seul besoin ACTIF par item et objectif compatible (index unique partiel).
create table if not exists public.candidate_active_need (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references auth.users(id) on delete cascade,
  item_id                     uuid not null references public.cours(id) on delete cascade,
  objective                   text not null check (objective in ('travail', 'reactivation', 'controle')),
  need_type                   text not null check (need_type in ('review', 'consolidate', 'reactivate', 'evaluate')),
  state                       text not null default 'active' check (state in ('active', 'done', 'cancelled', 'superseded')),
  priority_score              numeric(5,2) not null default 0,
  arbitration_rank            smallint not null default 5,
  control_pending             boolean not null default false,
  signal_ids                  text[] not null default '{}',
  reasons                     jsonb not null default '[]'::jsonb,
  estimated_minutes           int not null default 15,
  due_at                      date,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  last_priority_calculated_at timestamptz,
  closed_at                   timestamptz,
  closed_by                   text,
  close_reason                text
);
create unique index if not exists candidate_active_need_one_active
  on public.candidate_active_need (user_id, item_id, objective) where state = 'active';
create index if not exists candidate_active_need_user_idx on public.candidate_active_need (user_id, state, priority_score desc);

-- ─── Réactivations J+7 / J+14 / J+30 / J+60 (Interconnexion §18, Orchestrateur §22) ───
create table if not exists public.candidate_review_schedule (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  item_id             uuid not null references public.cours(id) on delete cascade,
  step                smallint not null default 0,
  interval_days       smallint not null,
  due_on              date not null,
  theoretical_due_on  date not null,
  adjusted            text,
  status              text not null default 'scheduled' check (status in ('scheduled', 'done', 'cancelled', 'superseded')),
  origin              text not null,
  source_signal_id    text,
  created_at          timestamptz not null default now(),
  completed_at        timestamptz,
  result              text
);
create unique index if not exists candidate_review_schedule_one_scheduled
  on public.candidate_review_schedule (user_id, item_id) where status = 'scheduled';
create index if not exists candidate_review_schedule_due_idx on public.candidate_review_schedule (user_id, due_on) where status = 'scheduled';

-- ─── Moteur de notifications unique (Orchestrateur §33, Interconnexion §39) ───
-- `group_key` regroupe les événements similaires (une ligne par groupe).
create table if not exists public.pedago_notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  kind          text not null,
  group_key     text not null,
  title         text not null,
  body          text,
  cta_label     text,
  cta_href      text,
  channel       text not null default 'dashboard' check (channel in ('dashboard', 'popup', 'email', 'push')),
  payload       jsonb not null default '{}'::jsonb,
  count         int not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  displayed_at  timestamptz,
  dismissed_at  timestamptz,
  unique (user_id, group_key)
);
create index if not exists pedago_notifications_user_idx on public.pedago_notifications (user_id, created_at desc);

-- ─── Collecteur : curseurs par candidat (tentatives, concours blancs, Arena…) ───
create table if not exists public.pedago_collector_state (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  attempts_cursor      timestamptz,
  mock_cursor          timestamptz,
  plan_eval_cursor     timestamptz,
  arena_cursor         timestamptz,
  last_refresh_at      timestamptz,
  last_engagement_at   timestamptz,
  backfilled_at        timestamptz,
  updated_at           timestamptz not null default now()
);

-- ─── Métadonnées de la banque (Complément Check-up §5, §20, §23) ───
-- Enrichissement PROGRESSIF : tout est facultatif ; à défaut, la famille et
-- l'item sont déduits de la série et de l'item qui la porte.
create table if not exists public.qcm_series_meta (
  serie_id          uuid primary key references public.qcm_series(id) on delete cascade,
  content_source    text check (content_source is null or content_source in ('structured_item', 'des_bank', 'transversal_bank', 'evc_annale')),
  item_id           uuid references public.cours(id) on delete set null,
  category_id       text references public.matieres(id) on delete set null,
  is_extractable    boolean,
  annale_type       text,
  checkup_excluded  boolean not null default false,
  updated_by        uuid references auth.users(id) on delete set null,
  updated_at        timestamptz not null default now()
);

create table if not exists public.question_bank_meta (
  question_id            uuid primary key references public.qcm_questions(id) on delete cascade,
  content_source         text check (content_source is null or content_source in ('structured_item', 'des_bank', 'transversal_bank', 'evc_annale')),
  item_id                uuid references public.cours(id) on delete set null,
  category_id            text references public.matieres(id) on delete set null,
  question_type          text check (question_type is null or question_type in ('QRU', 'QRM')),
  is_extractable         boolean,
  annale_year            int,
  annale_type            text,
  canonical_question_id  uuid,
  checkup_excluded       boolean not null default false,
  updated_by             uuid references auth.users(id) on delete set null,
  updated_at             timestamptz not null default now()
);

-- Empreinte de contenu → identifiant canonique (§20 : toutes les copies d'une
-- même question partagent le même canonical_question_id).
create table if not exists public.question_fingerprints (
  question_id            uuid primary key references public.qcm_questions(id) on delete cascade,
  fingerprint            text not null,
  canonical_question_id  uuid not null,
  computed_at            timestamptz not null default now()
);
create index if not exists question_fingerprints_fp_idx on public.question_fingerprints (fingerprint);
create index if not exists question_fingerprints_canonical_idx on public.question_fingerprints (canonical_question_id);

-- ─── updated_at automatique ───
create or replace function public.pedago_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

do $$
declare t text;
begin
  foreach t in array array['pedago_settings', 'candidate_pedago_profile', 'candidate_item_state', 'candidate_active_need',
                           'pedago_notifications', 'pedago_collector_state', 'qcm_series_meta', 'question_bank_meta']
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.pedago_touch_updated_at()', t, t);
  end loop;
end $$;

-- ─── RLS : tout passe par le serveur (service role) ; chaque candidat lit
-- SES lignes, l'administrateur lit tout. Aucune écriture directe d'un élève. ───
do $$
declare t text;
begin
  foreach t in array array['pedago_settings', 'candidate_pedago_profile', 'pedago_signals', 'pedago_signal_rejects', 'candidate_item_state',
                           'pedago_events', 'candidate_active_need', 'candidate_review_schedule', 'pedago_notifications',
                           'pedago_collector_state', 'qcm_series_meta', 'question_bank_meta', 'question_fingerprints']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_admin_all on public.%I', t, t);
    execute format('create policy %I_admin_all on public.%I for all using ((select public.current_role()) = ''admin'') with check ((select public.current_role()) = ''admin'')', t, t);
  end loop;
  foreach t in array array['candidate_pedago_profile', 'pedago_signals', 'candidate_item_state', 'pedago_events', 'candidate_active_need',
                           'candidate_review_schedule', 'pedago_notifications']
  loop
    execute format('drop policy if exists %I_self_read on public.%I', t, t);
    execute format('create policy %I_self_read on public.%I for select using (user_id = (select auth.uid()))', t, t);
  end loop;
end $$;
