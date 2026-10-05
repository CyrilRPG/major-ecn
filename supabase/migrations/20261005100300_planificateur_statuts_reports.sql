-- ═══════════════════════════════════════════════════════════════════════════
-- Planificateur adaptatif — statuts, pause, désactivation, reports, raisons,
-- annulations, charge maximale, priorisation (cahier « Alertes pédagogiques
-- côté candidat … et planificateur adaptatif », §16 à §41) et branchement sur
-- le moteur pédagogique central (le planificateur devient l'AGENDA :
-- Orchestrateur §23).
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Migration ADDITIVE : colonnes nullable / avec défaut, nouvelles tables.
-- Sans risque à relancer.

-- ─── Profil du planificateur : statut et historique (§16 à §19) ───
alter table public.plan_profiles
  add column if not exists planner_status           text not null default 'actif',
  add column if not exists planner_activated_at     timestamptz,
  add column if not exists planner_paused_at        timestamptz,
  add column if not exists pause_until              date,
  add column if not exists pause_choice             text,
  add column if not exists planner_disabled_at      timestamptz,
  add column if not exists planner_disable_reason   text,
  add column if not exists planner_disable_comment  text,
  add column if not exists planner_reactivated_at   timestamptz,
  add column if not exists planner_recalculated_at  timestamptz,
  add column if not exists reconfigure_reason       text,
  -- « Adapter mon programme » : part de la disponibilité réellement programmée (§24, §29, §32).
  add column if not exists load_factor              numeric(3,2) not null default 1,
  -- Plafonds personnels (§33, §37) ; null = réglage de l'équipe.
  add column if not exists max_daily_minutes        int,
  add column if not exists max_daily_items          int,
  -- Disponibilité exceptionnellement réduite (garde, travail) : jour → minutes (§27).
  add column if not exists availability_overrides   jsonb not null default '{}'::jsonb,
  -- Planificateur ignoré (§31) : choix du candidat et date, pour ne pas reposer la question.
  add column if not exists low_adherence_choice     text,
  add column if not exists low_adherence_choice_at  timestamptz,
  add column if not exists overload_prompted_at     timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'plan_profiles_planner_status_check') then
    alter table public.plan_profiles add constraint plan_profiles_planner_status_check
      check (planner_status in ('actif', 'en_pause', 'a_reconfigurer', 'desactive'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'plan_profiles_load_factor_check') then
    alter table public.plan_profiles add constraint plan_profiles_load_factor_check check (load_factor >= 0.3 and load_factor <= 1);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'plan_profiles_low_adherence_choice_check') then
    alter table public.plan_profiles add constraint plan_profiles_low_adherence_choice_check
      check (low_adherence_choice is null or low_adherence_choice in ('adapter', 'conserver', 'desactiver'));
  end if;
end $$;

-- Un planning déjà créé est « actif » depuis sa création.
update public.plan_profiles set planner_activated_at = coalesce(planner_activated_at, first_plan_ack_at, created_at)
 where onboarding_done and planner_activated_at is null;

-- Historique de chaque changement de statut (§16 « Historiser chaque changement »).
create table if not exists public.plan_status_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  old_status  text,
  new_status  text not null,
  reason      text,
  comment     text,
  detail      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists plan_status_history_user_idx on public.plan_status_history (user_id, created_at desc);

-- ─── Séances : report, annulation, épinglage, besoin central ───
alter table public.plan_sessions
  add column if not exists defer_to        date,
  add column if not exists defer_reason    text,
  add column if not exists defer_comment   text,
  add column if not exists deferred_at     timestamptz,
  add column if not exists cancel_reason   text,
  add column if not exists cancel_comment  text,
  add column if not exists cancelled_at    timestamptz,
  add column if not exists pinned          boolean not null default false,
  add column if not exists need_id         uuid references public.candidate_active_need(id) on delete set null,
  add column if not exists source          text not null default 'planificateur';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'plan_sessions_source_check') then
    alter table public.plan_sessions add constraint plan_sessions_source_check
      check (source in ('planificateur', 'moteur_central'));
  end if;
end $$;

-- Reports épinglés à une date choisie (« demain », « dans 2 jours », date) :
-- le moteur de planning les place en premier ce jour-là, dans la limite de la
-- charge maximale (§21, §22).
create table if not exists public.plan_pins (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  item_id            uuid references public.plan_items(id) on delete cascade,
  kind               text not null,
  minutes            int not null check (minutes between 5 and 600),
  day                date not null,
  source_session_id  uuid references public.plan_sessions(id) on delete set null,
  reason             text,
  created_at         timestamptz not null default now()
);
create index if not exists plan_pins_user_day_idx on public.plan_pins (user_id, day);

-- ─── Maîtrise par item : retrait du planning, version courte, difficulté ───
alter table public.plan_mastery
  add column if not exists excluded_at       timestamptz,
  add column if not exists excluded_reason   text,
  add column if not exists excluded_comment  text,
  add column if not exists short_version     boolean not null default false,
  add column if not exists difficulty_at     timestamptz,
  add column if not exists difficulty_count  int not null default 0;

-- ─── Bilan quotidien du programme (§20, §23, §28, §29, §51) ───
create table if not exists public.plan_day_reports (
  user_id            uuid not null references auth.users(id) on delete cascade,
  day                date not null,
  planned            int not null default 0,
  completed          int not null default 0,
  deferred           int not null default 0,
  cancelled          int not null default 0,
  done_in_advance    int not null default 0,
  planned_minutes    int not null default 0,
  completed_minutes  int not null default 0,
  completion_rate    numeric(5,2),
  choice             text check (choice is null or choice in ('continuer', 'reporter', 'impossible')),
  reason             text check (reason is null or reason in ('manque_temps', 'garde_travail', 'activite_longue', 'difficulte_items', 'fatigue', 'planning_trop_charge', 'autre')),
  comment            text,
  difficult_item_ids uuid[] not null default '{}',
  j1_alert_shown_at  timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  primary key (user_id, day)
);

drop trigger if exists plan_day_reports_touch on public.plan_day_reports;
create trigger plan_day_reports_touch before update on public.plan_day_reports
  for each row execute function public.plan_touch_updated_at();

-- ─── Journal : nouveaux types d'activité ───
alter table public.plan_activity drop constraint if exists plan_activity_kind_check;
alter table public.plan_activity add constraint plan_activity_kind_check check (kind in (
  'seance_terminee', 'seance_reportee', 'seance_sautee', 'seance_avancee', 'temps_supplementaire', 'journee_terminee',
  'travail_libre', 'evaluation', 'disponibilites', 'onboarding', 'recalcul',
  'pause', 'reprise', 'desactivation', 'reactivation', 'reconfiguration', 'report', 'repartition', 'annulation',
  'retrait_item', 'remise_item', 'version_courte', 'difficulte', 'indisponibilite', 'adaptation', 'journee_incomplete',
  'ajout_moteur_central'
));

-- ─── Remplacement atomique du planning futur : colonnes nouvelles ───
-- Même contrat qu'au 28/09 (verrou par candidat, une seule transaction),
-- avec l'épinglage, le besoin central d'origine et la source de la séance.
create or replace function public.plan_replace_future_sessions(p_user uuid, p_from date, p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  n integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('plan_sessions:' || p_user::text, 0));

  update public.plan_sessions
     set status = 'sautee'
   where user_id = p_user and day < p_from and status in ('planifiee', 'en_cours');

  delete from public.plan_sessions
   where user_id = p_user and day >= p_from and status in ('planifiee', 'sautee');

  insert into public.plan_sessions (user_id, item_id, day, order_index, minutes, kind, status, priority_score, priority_tier, reason, plan_version, part, parts, origin, planned_day, pinned, need_id, source)
  select p_user, r.item_id, r.day, r.order_index, r.minutes, r.kind, 'planifiee', r.priority_score, r.priority_tier, coalesce(r.reason, ''), r.plan_version, r.part, r.parts,
         coalesce(r.origin, 'planning'), r.planned_day, coalesce(r.pinned, false),
         case when r.need_id is not null and exists (select 1 from public.candidate_active_need n2 where n2.id = r.need_id) then r.need_id else null end,
         coalesce(r.source, 'planificateur')
    from jsonb_to_recordset(coalesce(p_rows, '[]'::jsonb)) as r(
      item_id uuid, day date, order_index int, minutes int, kind text, priority_score numeric, priority_tier text, reason text,
      plan_version int, part int, parts int, origin text, planned_day date, pinned boolean, need_id uuid, source text
    );
  get diagnostics n = row_count;
  return n;
end;
$function$;

-- RLS des nouvelles tables (mêmes règles que plan_*).
do $$
declare t text;
begin
  foreach t in array array['plan_status_history', 'plan_pins', 'plan_day_reports']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_admin_all on public.%I', t, t);
    execute format('create policy %I_admin_all on public.%I for all using ((select public.current_role()) = ''admin'') with check ((select public.current_role()) = ''admin'')', t, t);
    execute format('drop policy if exists %I_self_read on public.%I', t, t);
    execute format('create policy %I_self_read on public.%I for select using (user_id = (select auth.uid()))', t, t);
  end loop;
end $$;
