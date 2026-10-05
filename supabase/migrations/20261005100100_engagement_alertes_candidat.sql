-- ═══════════════════════════════════════════════════════════════════════════
-- Alertes pédagogiques côté candidat, engagement et adhérence au planificateur
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Cahier des charges « Alertes pédagogiques côté candidat, engagement,
-- révisions transversales et planificateur adaptatif ».
--
-- Deux moteurs complémentaires (§2) :
--   A. engagement pédagogique — actif pour TOUS les candidats ;
--   B. adhérence au planificateur — seulement s'il est utilisé.
-- Deux statuts distincts sont conservés : activité et adhérence au planning.
--
-- Les données sont préparées pour le futur suivi pédagogique individuel
-- administrateur (§69) : épisodes horodatés, motifs stockés, identifiants
-- stables, historique jamais écrasé (§52).
--
-- Migration ADDITIVE. Sans risque à relancer.

-- État courant (pré-calculé : le tableau de bord ne recalcule rien, §57).
create table if not exists public.engagement_state (
  user_id                         uuid primary key references auth.users(id) on delete cascade,
  faculte_id                      text not null default 'major-ecn',
  engagement_score                numeric(5,2),
  engagement_level                text check (engagement_level is null or engagement_level in ('vert', 'jaune', 'orange', 'rouge')),
  escalation_level                smallint not null default 0 check (escalation_level between 0 and 3),
  vigilance                       boolean not null default false,
  vigilance_reason                text,
  last_login_at                   timestamptz,
  last_significant_activity_at    timestamptz,
  inactivity_days                 int,
  active_days_7d                  int,
  active_days_14d                 int,
  active_days_30d                 int,
  transversal_reviews_assigned    int,
  transversal_reviews_completed   int,
  counters                        jsonb not null default '{}'::jsonb,
  components                      jsonb not null default '{}'::jsonb,
  baseline                        jsonb not null default '{}'::jsonb,
  rhythm_drop_pct                 numeric(6,2),
  recovery_status                 text not null default 'none' check (recovery_status in ('none', 'detected', 'confirmed')),
  activity_resumed_at             timestamptz,
  recovery_confirmed_at           timestamptz,
  grace_until                     date,
  suppressed_reason               text,
  planner                         jsonb not null default '{}'::jsonb,
  explanation                     text,
  computed_at                     timestamptz not null default now()
);

-- Épisodes d'alerte (§43, §51, §52) : un épisode par période de décrochage ;
-- une rechute crée un NOUVEL épisode, l'ancien n'est jamais réutilisé.
create table if not exists public.engagement_alert_episodes (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references auth.users(id) on delete cascade,
  kind                      text not null check (kind in ('engagement', 'planner')),
  alert_level               smallint not null check (alert_level between 0 and 3),
  max_level                 smallint not null check (max_level between 0 and 3),
  alert_trigger             text not null,
  motif                     text not null,
  status                    text not null default 'open' check (status in ('open', 'recovering', 'resolved')),
  alert_started_at          timestamptz not null default now(),
  alert_last_updated_at     timestamptz not null default now(),
  alert_displayed_at        timestamptz,
  popup_displayed_at        timestamptz,
  popup_levels              int[] not null default '{}',
  alert_acknowledged_at     timestamptz,
  last_notified_at          timestamptz,
  activity_resumed_at       timestamptz,
  recovery_confirmed_at     timestamptz,
  alert_resolved_at         timestamptz,
  resolution                text,
  engagement_score_at_start numeric(5,2),
  engagement_score_last     numeric(5,2),
  facts                     jsonb not null default '{}'::jsonb,
  history                   jsonb not null default '[]'::jsonb,
  created_at                timestamptz not null default now()
);
create unique index if not exists engagement_alert_episodes_one_open
  on public.engagement_alert_episodes (user_id, kind) where status <> 'resolved';
create index if not exists engagement_alert_episodes_user_idx on public.engagement_alert_episodes (user_id, alert_started_at desc);
create index if not exists engagement_alert_episodes_open_idx on public.engagement_alert_episodes (status, alert_level) where status <> 'resolved';

-- Photographie quotidienne (courbe d'engagement du futur suivi individuel).
create table if not exists public.engagement_history (
  user_id           uuid not null references auth.users(id) on delete cascade,
  day               date not null,
  engagement_score  numeric(5,2),
  engagement_level  text,
  escalation_level  smallint,
  active            boolean not null default false,
  counters          jsonb not null default '{}'::jsonb,
  planner           jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  primary key (user_id, day)
);

-- RLS
do $$
declare t text;
begin
  foreach t in array array['engagement_state', 'engagement_alert_episodes', 'engagement_history']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_admin_all on public.%I', t, t);
    execute format('create policy %I_admin_all on public.%I for all using ((select public.current_role()) = ''admin'') with check ((select public.current_role()) = ''admin'')', t, t);
    execute format('drop policy if exists %I_self_read on public.%I', t, t);
    execute format('create policy %I_self_read on public.%I for select using (user_id = (select auth.uid()))', t, t);
  end loop;
end $$;
