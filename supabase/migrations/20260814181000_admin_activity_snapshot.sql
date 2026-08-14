-- Dernière activité par élève, agrégée en SQL — pour le cron des alertes
-- pédagogiques (/api/cron/pedagogical-alerts).
--
-- POURQUOI. Le cron chargeait course_progress, qcm_attempts, flashcard_reviews
-- et transversal_sessions EN ENTIER pour calculer la dernière activité en JS.
-- PostgREST plafonne chaque requête à 1 000 lignes : au-delà, la dernière
-- activité de la plupart des élèves était invisible → fausses alertes
-- « X jours sans activité globale » (P1). Même famille de bug que le CRM
-- (cf. admin_crm_activity()).
--
-- `has_completed_transversal` remplace aussi le SELECT plein de
-- transversal_sessions qui listait les élèves à recalculer.
create or replace function public.admin_activity_snapshot()
returns table (
  user_id uuid,
  last_activity timestamptz,
  has_completed_transversal boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with acts as (
    select cp.user_id, max(cp.last_seen_at) as t
    from public.course_progress cp
    where cp.last_seen_at is not null
    group by cp.user_id
    union all
    select qa.user_id, max(qa.attempted_at)
    from public.qcm_attempts qa
    group by qa.user_id
    union all
    select fr.user_id, max(fr.reviewed_at)
    from public.flashcard_reviews fr
    group by fr.user_id
    union all
    select ts.user_id, max(ts.completed_at)
    from public.transversal_sessions ts
    where ts.completed_at is not null
    group by ts.user_id
  ),
  agg as (
    select acts.user_id, max(acts.t) as last_activity
    from acts
    group by acts.user_id
  ),
  trans as (
    select distinct ts.user_id
    from public.transversal_sessions ts
    where ts.completed_at is not null
  )
  select agg.user_id,
         agg.last_activity,
         (trans.user_id is not null) as has_completed_transversal
  from agg
  left join trans on trans.user_id = agg.user_id;
$$;

revoke all on function public.admin_activity_snapshot() from public;
revoke all on function public.admin_activity_snapshot() from anon;
revoke all on function public.admin_activity_snapshot() from authenticated;
grant execute on function public.admin_activity_snapshot() to service_role;
