-- Usage des rubriques élève (05/10/2026) — lecture seule pour /admin/moteur-pedagogique.
-- Base : élèves actifs de Major ECN hors offre Découverte. Pour chaque rubrique,
-- élèves distincts l'ayant utilisée (activité réelle), au total / sur 30 j / sur 7 j ;
-- et ouvertures de rubriques mesurées par le menu (repères vu:<rubrique>, depuis le 05/10/2026).
-- SECURITY DEFINER (agrégats sur toutes les tables) : exécutable par la clé de service seulement.

create or replace function public.admin_usage_rubriques()
returns table (mesure text, rubrique text, total bigint, j30 bigint, j7 bigint)
language sql
stable
security definer
set search_path = public
as $$
  with base as (
    select p.id from profiles p
    where p.role = 'student'
      and coalesce(p.is_active, true)
      and coalesce(p.faculte_id, 'major-ecn') = 'major-ecn'
      and coalesce(p.permission_scope->>'offer', '') <> 'decouverte'
  ),
  activite(rubrique, user_id, at) as (
    select 'checkup', user_id, coalesce(completed_at, submitted_at, started_at) from checkup_sessions where status in ('completed', 'expired', 'pending_self_review')
    union all select 'planning', user_id, planner_activated_at from plan_profiles where onboarding_done
    union all select 'planning', user_id, completed_at from plan_activities where completed_at is not null
    union all select 'transversales', user_id, completed_at from transversal_sessions where completed_at is not null
    union all select case when origin = 'revision_ciblee' then 'revision-ciblee' else 'entrainement' end, user_id, attempted_at
      from qcm_attempts where origin in ('revision_ciblee', 'entrainement_cible')
    union all select 'epreuves', user_id, submitted_at from mock_exam_submissions where submitted_at is not null
    union all select 'parcours', user_id, completed_at from major_parcours_completions
    union all select 'notes', user_id, updated_at from course_notes
    union all select 'revoir', user_id, created_at from student_saved_questions
    union all select 'mes-entrainements', user_id, created_at from student_exercises
  ),
  ouvertures(rubrique, user_id, at) as (
    select substr(cle, 4), user_id, last_at from student_guide_marks where cle like 'vu:%'
  )
  select 'base', 'eleves', count(*), null::bigint, null::bigint from base
  union all
  select 'activite', a.rubrique, count(distinct a.user_id),
    count(distinct a.user_id) filter (where a.at >= now() - interval '30 days'),
    count(distinct a.user_id) filter (where a.at >= now() - interval '7 days')
  from activite a join base b on b.id = a.user_id
  group by a.rubrique
  union all
  select 'ouverture', o.rubrique, count(distinct o.user_id),
    count(distinct o.user_id) filter (where o.at >= now() - interval '30 days'),
    count(distinct o.user_id) filter (where o.at >= now() - interval '7 days')
  from ouvertures o join base b on b.id = o.user_id
  group by o.rubrique;
$$;

revoke all on function public.admin_usage_rubriques() from public;
revoke all on function public.admin_usage_rubriques() from anon, authenticated;
grant execute on function public.admin_usage_rubriques() to service_role;

comment on function public.admin_usage_rubriques() is 'Usage des rubriques élève (activité réelle + ouvertures mesurées par le menu), élèves actifs hors Découverte. Lecture seule, clé de service.';
