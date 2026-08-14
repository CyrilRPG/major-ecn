-- Agrégats d'activité du CRM pédagogique, calculés en SQL.
--
-- POURQUOI. La page /admin/crm chargeait TOUTES les lignes de course_progress,
-- qcm_sessions et flashcard_reviews via PostgREST pour compter en JS. Or
-- PostgREST plafonne chaque requête à 1 000 lignes (db_max_rows) : au-delà,
-- les comptes étaient silencieusement tronqués — flashcard_reviews dépasse
-- 17 000 lignes, et les élèves récents apparaissaient à « 0 contenu ouvert »
-- alors qu'ils étaient actifs. Ici, l'agrégation se fait en base : UNE ligne
-- par élève, aucun plafond possible.
--
-- `last_sign_in` remplace aussi la boucle listUsers (40 pages) de la page.
-- SECURITY DEFINER : lit auth.users ; exécution réservée au service_role
-- (la page vérifie déjà requireAdmin() avant l'appel).
create or replace function public.admin_crm_activity()
returns table (
  user_id uuid,
  videos_watched integer,
  fiches_read integer,
  qcm_done integer,
  flashcards_done integer,
  last_activity timestamptz,
  last_revision timestamptz,
  revisions_30d integer,
  alerts_pending integer,
  red_specs integer,
  orange_specs integer,
  epreuves_blanches integer,
  last_sign_in timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with prog as (
    select cp.user_id,
           count(*) filter (where cp.video_watched) as videos_watched,
           count(*) filter (where cp.fiche_read)   as fiches_read,
           max(cp.last_seen_at)                    as last_seen
    from public.course_progress cp
    group by cp.user_id
  ),
  qcm as (
    select qs.user_id,
           count(*) filter (where qs.finished_at is not null) as qcm_done,
           max(qs.finished_at)                                as last_finished
    from public.qcm_sessions qs
    group by qs.user_id
  ),
  flash as (
    select fr.user_id,
           count(*)            as flashcards_done,
           max(fr.reviewed_at) as last_reviewed
    from public.flashcard_reviews fr
    group by fr.user_id
  ),
  trans as (
    select ts.user_id,
           max(ts.completed_at) as last_revision,
           count(*) filter (where ts.completed_at >= now() - interval '30 days') as revisions_30d
    from public.transversal_sessions ts
    where ts.completed_at is not null
    group by ts.user_id
  ),
  al as (
    select aa.user_id,
           count(*) filter (where aa.resolved_at is null) as alerts_pending
    from public.admin_alerts aa
    group by aa.user_id
  ),
  ev as (
    -- Statut le plus récent par (élève, spécialité), comme la page :
    -- seuls comptent les derniers verdicts « insuffisante » / « fragile ».
    select latest.user_id,
           count(*) filter (where latest.status = 'insuffisante') as red_specs,
           count(*) filter (where latest.status = 'fragile')      as orange_specs
    from (
      select distinct on (se.user_id, se.matiere_id) se.user_id, se.status
      from public.specialty_evaluations se
      order by se.user_id, se.matiere_id, se.created_at desc
    ) latest
    group by latest.user_id
  ),
  mock as (
    -- Épreuves blanches transversales uniquement (ni item, ni spécialité).
    select ms.user_id, count(*) as epreuves_blanches
    from public.mock_exam_submissions ms
    join public.mock_exams me on me.id = ms.exam_id
    where ms.status in ('submitted', 'graded')
      and me.cours_id is null
      and me.specialite_id is null
    group by ms.user_id
  )
  select p.id,
         coalesce(prog.videos_watched, 0)::int,
         coalesce(prog.fiches_read, 0)::int,
         coalesce(qcm.qcm_done, 0)::int,
         coalesce(flash.flashcards_done, 0)::int,
         greatest(prog.last_seen, qcm.last_finished, flash.last_reviewed) as last_activity,
         trans.last_revision,
         coalesce(trans.revisions_30d, 0)::int,
         coalesce(al.alerts_pending, 0)::int,
         coalesce(ev.red_specs, 0)::int,
         coalesce(ev.orange_specs, 0)::int,
         coalesce(mock.epreuves_blanches, 0)::int,
         u.last_sign_in_at
  from public.profiles p
  left join prog  on prog.user_id  = p.id
  left join qcm   on qcm.user_id   = p.id
  left join flash on flash.user_id = p.id
  left join trans on trans.user_id = p.id
  left join al    on al.user_id    = p.id
  left join ev    on ev.user_id    = p.id
  left join mock  on mock.user_id  = p.id
  left join auth.users u on u.id = p.id
  where p.role = 'student';
$$;

revoke all on function public.admin_crm_activity() from public;
revoke all on function public.admin_crm_activity() from anon;
revoke all on function public.admin_crm_activity() from authenticated;
grant execute on function public.admin_crm_activity() to service_role;
