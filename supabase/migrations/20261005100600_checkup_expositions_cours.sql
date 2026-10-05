-- EVC Check-up : expositions d'un candidat aux questions d'un périmètre d'items.
--
-- Variante de `pedago_exposures` qui reçoit les ITEMS (cours) du périmètre au
-- lieu de milliers d'identifiants de questions : les questions déjà vues
-- (tentatives, Check-up, EVC Arena — copies comprises via l'identifiant
-- canonique) sont ramenées à celles du vivier. Un seul document jsonb
-- (pas de plafond de 1 000 lignes). Réservée au service role.

create or replace function public.pedago_exposures_cours(p_user uuid, p_cours_ids uuid[])
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  with wanted as (
    select distinct coalesce(m.canonical_question_id, f.canonical_question_id, q.id) as canon
      from public.qcm_questions q
      join public.qcm_series s on s.id = q.serie_id
      left join public.question_fingerprints f on f.question_id = q.id
      left join public.question_bank_meta m on m.question_id = q.id
     where s.cours_id = any(p_cours_ids)
  ),
  me as (select lower(email) as email from public.profiles where id = p_user),
  expo as (
    select coalesce(m.canonical_question_id, f.canonical_question_id, a.question_id) as canon, a.attempted_at as at, 'plateforme'::text as src
      from public.qcm_attempts a
      left join public.question_fingerprints f on f.question_id = a.question_id
      left join public.question_bank_meta m on m.question_id = a.question_id
     where a.user_id = p_user
    union all
    select cq.canonical_question_id, coalesce(cq.presented_at, cs.started_at), 'checkup'
      from public.checkup_questions cq
      join public.checkup_sessions cs on cs.id = cq.session_id
     where cs.user_id = p_user and cs.status <> 'cancelled_technical' and cq.presented_at is not null
    union all
    select coalesce(m.canonical_question_id, f.canonical_question_id, aq.source_question_id), coalesce(aa.validated_at, at2.started_at), 'arena'
      from public.arena_answers aa
      join public.arena_attempts at2 on at2.id = aa.attempt_id and not at2.is_preview
      join public.arena_participants ap on ap.id = at2.participant_id and ap.email_confirmed_at is not null
      join public.arena_questions aq on aq.id = aa.question_id and aq.source_question_id is not null
      left join public.question_fingerprints f on f.question_id = aq.source_question_id
      left join public.question_bank_meta m on m.question_id = aq.source_question_id
     where lower(ap.email) = (select email from me)
  )
  select coalesce(jsonb_object_agg(canon, jsonb_build_object(
           'last', extract(epoch from last_at)::bigint,
           'checkup', case when checkup_at is null then null else extract(epoch from checkup_at)::bigint end,
           'n', n)), '{}'::jsonb)
    from (
      select e.canon, max(e.at) as last_at, max(e.at) filter (where e.src = 'checkup') as checkup_at, count(*) as n
        from expo e
       where e.canon in (select canon from wanted)
       group by e.canon
    ) x;
$$;

revoke all on function public.pedago_exposures_cours(uuid, uuid[]) from public;
revoke all on function public.pedago_exposures_cours(uuid, uuid[]) from anon;
revoke all on function public.pedago_exposures_cours(uuid, uuid[]) from authenticated;
grant execute on function public.pedago_exposures_cours(uuid, uuid[]) to service_role;
