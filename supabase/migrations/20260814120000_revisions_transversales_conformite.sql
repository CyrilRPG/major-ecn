-- ============================================================================
-- Révisions transversales — mise en conformité cahier des charges (14/08/2026)
--
-- 100 % ADDITIF : aucune donnée existante n'est modifiée ni supprimée.
--
-- 1. transversal_sessions : CREATE TABLE IF NOT EXISTS (la table vivait
--    uniquement en base, créée à la main — on la rend reproductible) +
--    colonne matiere_scores (scores par spécialité = matière, en plus des
--    scores par cours historiques).
-- 2. user_revision_stats : compteurs de maintien des acquis EXIGÉS par le
--    cahier des charges (section 5) — enregistrés, pas seulement recalculés :
--    last_transversal_revision_date, transversal_revisions_last_30_days,
--    current_consecutive_transversal_revisions,
--    best_consecutive_transversal_revisions, total_transversal_revisions.
--    Maintenus par trigger sur transversal_sessions + recalcul quotidien (cron).
-- 3. Politiques admin manquantes : le CRM lit specialty_evaluations,
--    consolidation_sessions et renforcement_progress avec le client
--    utilisateur (RLS) — sans policy admin, les compteurs rouges/oranges
--    étaient toujours vides côté admin.
-- 4. mock_exams.specialite_id : interrogation officielle de fin de spécialité
--    composée par l'équipe pédagogique (section 9) — réutilise le moteur
--    d'épreuve existant, comme les interrogations d'item (cours_id).
-- 5. Index de déduplication des alertes admin.
-- ============================================================================

-- ── 1a. transversal_sessions : reproductibilité ─────────────────────────────
create table if not exists public.transversal_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  qcm_count integer not null default 0,
  score_correct integer not null default 0,
  kind text not null default 'daily',
  specialty_scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.transversal_sessions enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public'
      and tablename = 'transversal_sessions' and policyname = 'transversal_sessions_self') then
    create policy "transversal_sessions_self" on public.transversal_sessions
      for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
  end if;
end $$;

-- ── 1b. Scores par matière (spécialité) ─────────────────────────────────────
alter table public.transversal_sessions
  add column if not exists matiere_scores jsonb not null default '{}'::jsonb;

-- ── 2. Compteurs de maintien des acquis (section 5) ─────────────────────────
create table if not exists public.user_revision_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_transversal_revision_date date,
  transversal_revisions_last_30_days integer not null default 0,
  current_consecutive_transversal_revisions integer not null default 0,
  best_consecutive_transversal_revisions integer not null default 0,
  total_transversal_revisions integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_revision_stats enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public'
      and tablename = 'user_revision_stats' and policyname = 'revision_stats_self_read') then
    create policy "revision_stats_self_read" on public.user_revision_stats
      for select using (user_id = (select auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public'
      and tablename = 'user_revision_stats' and policyname = 'revision_stats_admin_read') then
    create policy "revision_stats_admin_read" on public.user_revision_stats
      for select using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.role = 'admin'
      ));
  end if;
end $$;

-- Recalcul complet des compteurs d'un élève. SECURITY DEFINER : le trigger
-- s'exécute dans la transaction d'insert de l'élève, qui n'a pas le droit
-- d'écrire dans user_revision_stats.
create or replace function public.recompute_user_revision_stats(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last date;
  v_30d integer;
  v_total integer;
  v_cur integer := 0;
  v_best integer := 0;
  d date;
  prev date := null;
  run integer := 0;
begin
  select max(completed_at)::date,
         count(*) filter (where completed_at >= now() - interval '30 days'),
         count(*)
    into v_last, v_30d, v_total
    from transversal_sessions
   where user_id = p_user_id and completed_at is not null;

  -- Meilleure période : plus longue série de jours consécutifs avec ≥1 session.
  for d in
    select distinct completed_at::date
      from transversal_sessions
     where user_id = p_user_id and completed_at is not null
     order by 1
  loop
    if prev is not null and d = prev + 1 then run := run + 1; else run := 1; end if;
    if run > v_best then v_best := run; end if;
    prev := d;
  end loop;

  -- Série EN COURS : jours consécutifs jusqu'à aujourd'hui (ou hier — rater
  -- « aujourd'hui » avant le soir ne casse pas la série, conformément à la
  -- section 5 : pas de remise à zéro brutale affichée).
  if v_last is not null and v_last >= current_date - 1 then
    d := v_last;
    while exists (
      select 1 from transversal_sessions
       where user_id = p_user_id and completed_at is not null and completed_at::date = d
    ) loop
      v_cur := v_cur + 1;
      d := d - 1;
    end loop;
  end if;

  insert into user_revision_stats as s (
    user_id, last_transversal_revision_date, transversal_revisions_last_30_days,
    current_consecutive_transversal_revisions, best_consecutive_transversal_revisions,
    total_transversal_revisions, updated_at
  ) values (
    p_user_id, v_last, coalesce(v_30d, 0), v_cur, v_best, coalesce(v_total, 0), now()
  )
  on conflict (user_id) do update set
    last_transversal_revision_date = excluded.last_transversal_revision_date,
    transversal_revisions_last_30_days = excluded.transversal_revisions_last_30_days,
    current_consecutive_transversal_revisions = excluded.current_consecutive_transversal_revisions,
    best_consecutive_transversal_revisions = excluded.best_consecutive_transversal_revisions,
    total_transversal_revisions = excluded.total_transversal_revisions,
    updated_at = now();
end
$$;

create or replace function public.trg_transversal_sessions_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform recompute_user_revision_stats(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end
$$;

drop trigger if exists transversal_sessions_stats on public.transversal_sessions;
create trigger transversal_sessions_stats
  after insert or update or delete on public.transversal_sessions
  for each row execute function public.trg_transversal_sessions_stats();

-- Backfill des élèves ayant déjà des sessions (idempotent).
select public.recompute_user_revision_stats(user_id)
  from (select distinct user_id from public.transversal_sessions) t;

-- ── 3. Politiques admin manquantes (CRM) ────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public'
      and tablename = 'specialty_evaluations' and policyname = 'Admin read all evaluations') then
    create policy "Admin read all evaluations" on public.specialty_evaluations
      for select using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.role = 'admin'
      ));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public'
      and tablename = 'consolidation_sessions' and policyname = 'Admin read all consolidation') then
    create policy "Admin read all consolidation" on public.consolidation_sessions
      for select using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.role = 'admin'
      ));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public'
      and tablename = 'renforcement_progress' and policyname = 'Admin read all renforcement') then
    create policy "Admin read all renforcement" on public.renforcement_progress
      for select using (exists (
        select 1 from public.profiles
        where profiles.id = (select auth.uid()) and profiles.role = 'admin'
      ));
  end if;
end $$;

-- ── 4. Interrogation officielle de fin de spécialité (section 9) ────────────
-- Une mock_exams avec specialite_id = collège : composée par l'équipe
-- pédagogique (15 QCM + 2 questions ouvertes + mini-cas clinique éventuel).
-- Jamais listée dans les épreuves blanches (filtre .is('specialite_id', null)).
alter table public.mock_exams
  add column if not exists specialite_id text references public.matieres(id);

create index if not exists mock_exams_specialite_idx
  on public.mock_exams (specialite_id) where specialite_id is not null;

-- ── 5. Déduplication des alertes ────────────────────────────────────────────
create index if not exists admin_alerts_user_motif_idx
  on public.admin_alerts (user_id, motif, created_at desc);
