-- Règle produit : une vidéo est considérée comme VUE dès l'émargement signé.
--
-- Le CRM ne comptait que course_progress.video_watched, posé par le lecteur à
-- 80 % de lecture (ou au clic « Marquer comme terminé ») : sur des replays de
-- 2 h, quasi personne n'y arrive — « 0 vidéo vue » pour tout le monde. La
-- signature d'émargement (obligatoire dès 20 % de lecture) est la preuve de
-- visionnage qui fait foi (réglementation formation professionnelle).
--
-- 1. admin_crm_activity : « vidéos vues » = union dédupliquée de
--    course_progress.video_watched et des émargements SIGNÉS (une séance
--    approfondie signée compte comme une vidéo vue, distincte de la vidéo du
--    cours). L'API /api/emargement pose désormais aussi video_watched à la
--    signature d'un émargement vidéo.
-- 2. Rattrapage : video_watched = true pour les émargements vidéo déjà signés.

update public.course_progress cp
set video_watched = true
from public.course_attendances ca
where ca.user_id = cp.user_id
  and ca.cours_id = cp.cours_id
  and ca.kind = 'video'
  and ca.signed_at is not null
  and not cp.video_watched;

insert into public.course_progress (user_id, cours_id, video_watched, fiche_read, last_seen_at)
select ca.user_id, ca.cours_id, true, false, ca.signed_at
from public.course_attendances ca
where ca.kind = 'video' and ca.signed_at is not null
on conflict (user_id, cours_id) do nothing;

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
  with vids as (
    -- « Vidéo vue » : flag du lecteur OU émargement signé. L'union déduplique
    -- (cours, type de séance) : la vidéo du cours et la séance approfondie du
    -- même item comptent chacune une fois.
    select u.user_id, count(*) as videos_watched
    from (
      select cp.user_id, cp.cours_id, 'video'::text as kind
      from public.course_progress cp
      where cp.video_watched
      union
      select ca.user_id, ca.cours_id, ca.kind
      from public.course_attendances ca
      where ca.signed_at is not null
    ) u
    group by u.user_id
  ),
  prog as (
    select cp.user_id,
           count(*) filter (where cp.fiche_read) as fiches_read,
           max(cp.last_seen_at)                  as last_seen
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
    select ms.user_id, count(*) as epreuves_blanches
    from public.mock_exam_submissions ms
    join public.mock_exams me on me.id = ms.exam_id
    where ms.status in ('submitted', 'graded')
      and me.cours_id is null
      and me.specialite_id is null
    group by ms.user_id
  )
  select p.id,
         coalesce(vids.videos_watched, 0)::int,
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
  left join vids  on vids.user_id  = p.id
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
