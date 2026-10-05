-- ═══════════════════════════════════════════════════════════════════════════
-- Moteur pédagogique central — fonctions SQL (collecte, empreintes, viviers)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Toutes renvoient UN document jsonb : PostgREST plafonne à 1 000 lignes les
-- fonctions qui renvoient une table, et tronque en silence.
--
-- SÉCURITÉ : ces fonctions prennent un identifiant de candidat en paramètre.
-- Elles sont réservées au service role (EXECUTE retiré à anon/authenticated) :
-- un élève ne peut pas les appeler avec l'identifiant d'un autre.

-- ─── Normalisation d'un texte (empreinte de contenu) ───
create or replace function public.pedago_norm(p text)
returns text
language sql
immutable
as $$
  select btrim(regexp_replace(lower(regexp_replace(coalesce(p, ''), '<[^>]+>', ' ', 'g')), '\s+', ' ', 'g'));
$$;

-- ─── Empreintes → identifiant canonique (Complément §20) ───
-- Traite au plus p_limit questions sans empreinte ou modifiées depuis, puis
-- recalcule l'identifiant canonique des empreintes touchées : la copie la plus
-- ancienne (created_at, puis id) fait foi. Renvoie le nombre de questions traitées.
create or replace function public.question_fingerprint_refresh(p_limit int default 5000)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  n int := 0;
  m int := 0;
begin
  create temporary table if not exists _qf_batch (question_id uuid primary key, fingerprint text) on commit drop;
  truncate _qf_batch;

  insert into _qf_batch (question_id, fingerprint)
  select q.id,
         md5(
           public.pedago_norm(s.vignette) || '§' || public.pedago_norm(q.enonce) || '§' ||
           coalesce((select string_agg(public.pedago_norm(i.lettre || ':' || i.enonce), '|' order by i.lettre) from public.qcm_items i where i.question_id = q.id), '') || '§' ||
           public.pedago_norm(q.reponse_attendue)
         )
    from public.qcm_questions q
    join public.qcm_series s on s.id = q.serie_id
    left join public.question_fingerprints f on f.question_id = q.id
   where f.question_id is null or q.updated_at > f.computed_at
   order by f.question_id nulls first, q.id
   limit greatest(1, least(p_limit, 20000));
  get diagnostics n = row_count;

  insert into public.question_fingerprints (question_id, fingerprint, canonical_question_id, computed_at)
  select b.question_id, b.fingerprint, b.question_id, now() from _qf_batch b
  on conflict (question_id) do update set fingerprint = excluded.fingerprint, computed_at = now();

  with touched as (select distinct fingerprint from _qf_batch),
  canon as (
    select f.fingerprint, (array_agg(f.question_id order by q.created_at, f.question_id))[1] as canon
      from public.question_fingerprints f
      join public.qcm_questions q on q.id = f.question_id
     where f.fingerprint in (select fingerprint from touched)
     group by f.fingerprint
  )
  update public.question_fingerprints f
     set canonical_question_id = c.canon
    from canon c
   where f.fingerprint = c.fingerprint and f.canonical_question_id is distinct from c.canon;
  get diagnostics m = row_count;

  return jsonb_build_object('processed', n, 'canonical_updated', m,
    'remaining', (select count(*) from public.qcm_questions q left join public.question_fingerprints f on f.question_id = q.id
                   where f.question_id is null));
end;
$$;

-- ─── Expositions d'un candidat aux questions (anti-répétition, « déjà vue ») ───
-- Toutes sources confondues (Interconnexion §45) : tentatives de la plateforme,
-- questions présentées en Check-up, questions vues en EVC Arena (rattachées au
-- compte par l'adresse confirmée). Clé = identifiant canonique.
create or replace function public.pedago_exposures(p_user uuid, p_question_ids uuid[])
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  with wanted as (
    select distinct coalesce(m.canonical_question_id, f.canonical_question_id, w.qid) as canon
      from unnest(p_question_ids) as w(qid)
      left join public.question_fingerprints f on f.question_id = w.qid
      left join public.question_bank_meta m on m.question_id = w.qid
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

-- ─── Tentatives à collecter (signaux d'entraînement / de révision) ───
-- Tentatives de p_user postérieures à p_since (strictement), au plus p_limit,
-- dans l'ordre. Pour chaque tentative : contexte de la série et de l'item,
-- discordances (QRM), et date de la dernière exposition ANTÉRIEURE à la même
-- question (toutes copies confondues) pour la règle « question récemment vue ».
create or replace function public.pedago_collect_attempts(p_user uuid, p_since timestamptz, p_limit int default 500)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  with me as (select lower(email) as email from public.profiles where id = p_user),
  mine as (
    select a.id, a.question_id, a.attempted_at, a.is_correct, a.session_id, a.selected_items, a.text_answer,
           coalesce(m.canonical_question_id, f.canonical_question_id, a.question_id) as canon
      from public.qcm_attempts a
      left join public.question_fingerprints f on f.question_id = a.question_id
      left join public.question_bank_meta m on m.question_id = a.question_id
     where a.user_id = p_user
    -- Autres expositions (Check-up, EVC Arena) : elles comptent pour « récemment vue »
    -- mais ne sont pas des tentatives à collecter (id null).
    union all
    select null::uuid, null::uuid, coalesce(cq.presented_at, cs.started_at), null::boolean, null::uuid, null::jsonb, null::text, cq.canonical_question_id
      from public.checkup_questions cq
      join public.checkup_sessions cs on cs.id = cq.session_id
     where cs.user_id = p_user and cs.status <> 'cancelled_technical' and cq.presented_at is not null
    union all
    select null::uuid, null::uuid, coalesce(aa.validated_at, at2.started_at), null::boolean, null::uuid, null::jsonb, null::text,
           coalesce(m.canonical_question_id, f.canonical_question_id, aq.source_question_id)
      from public.arena_answers aa
      join public.arena_attempts at2 on at2.id = aa.attempt_id and not at2.is_preview
      join public.arena_participants ap on ap.id = at2.participant_id and ap.email_confirmed_at is not null
      join public.arena_questions aq on aq.id = aa.question_id and aq.source_question_id is not null
      left join public.question_fingerprints f on f.question_id = aq.source_question_id
      left join public.question_bank_meta m on m.question_id = aq.source_question_id
     where lower(ap.email) = (select email from me)
  ),
  lagged as (
    select x.*, lag(x.attempted_at) over (partition by x.canon order by x.attempted_at, x.id nulls first) as prev_at
      from mine x
  ),
  batch as (
    select * from lagged where id is not null and attempted_at > p_since order by attempted_at, id limit greatest(1, least(p_limit, 2000))
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', b.id, 'question_id', b.question_id, 'canonical_id', b.canon, 'at', b.attempted_at, 'is_correct', b.is_correct,
    'session_id', b.session_id, 'prev_at', b.prev_at,
    'has_text', (b.text_answer is not null and length(btrim(b.text_answer)) > 0),
    'selected', case when jsonb_typeof(b.selected_items) = 'array' then b.selected_items else '[]'::jsonb end,
    'format', coalesce(q.format, 'qcm'),
    'n_items', (select count(*) from public.qcm_items i where i.question_id = b.question_id),
    'n_correct', (select count(*) from public.qcm_items i where i.question_id = b.question_id and i.is_correct),
    'discordances', case when jsonb_typeof(b.selected_items) = 'array' then
        (select count(*) from public.qcm_items i where i.question_id = b.question_id and (b.selected_items ? i.lettre) <> i.is_correct)
      else null end,
    'serie_id', s.id, 'serie_type', s.type, 'serie_kind', s.kind, 'serie_label', s.label, 'serie_annee', s.annee,
    'has_vignette', (s.vignette is not null and btrim(s.vignette) <> ''),
    'cours_id', c.id, 'cours_titre', c.titre, 'importance', c.importance,
    'matiere_id', mt.id, 'parent_matiere_id', mt.parent_matiere_id, 'semestre_id', mt.semestre_id,
    'meta_source', coalesce(qm.content_source, sm.content_source), 'meta_item_id', coalesce(qm.item_id, sm.item_id),
    'meta_category_id', coalesce(qm.category_id, sm.category_id)
  ) order by b.attempted_at, b.id), '[]'::jsonb)
  from batch b
  join public.qcm_questions q on q.id = b.question_id
  join public.qcm_series s on s.id = q.serie_id
  join public.cours c on c.id = s.cours_id
  join public.matieres mt on mt.id = c.matiere_id
  left join public.question_bank_meta qm on qm.question_id = b.question_id
  left join public.qcm_series_meta sm on sm.serie_id = s.id;
$$;

-- ─── Vivier d'une spécialité pour le Check-up (sans énoncés) ───
-- Questions et séries des items donnés, avec ce qu'il faut pour composer :
-- format, nombre de propositions et de bonnes réponses (QRU/QRM), indice
-- « une seule réponse » de l'énoncé, empreinte canonique, métadonnées.
create or replace function public.checkup_vivier(p_cours_ids uuid[])
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select jsonb_build_object(
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', q.id, 's', q.serie_id, 'o', q.order_index, 'f', coalesce(q.format, 'qcm'),
        'n', (select count(*) from public.qcm_items i where i.question_id = q.id),
        'nc', (select count(*) from public.qcm_items i where i.question_id = q.id and i.is_correct),
        'qru', (q.enonce ~* '(une seule (bonne )?r[ée]ponse|r[ée]ponse unique|\mQRU\M)'),
        'ra', (q.reponse_attendue is not null and btrim(q.reponse_attendue) <> ''),
        'cg', (q.correction_generale is not null and btrim(q.correction_generale) <> ''),
        'c', coalesce(qm.canonical_question_id, f.canonical_question_id, q.id),
        'ms', qm.content_source, 'mi', qm.item_id, 'mc', qm.category_id, 'mt', qm.question_type,
        'mx', qm.is_extractable, 'my', qm.annale_year, 'ex', coalesce(qm.checkup_excluded, false)
      ) order by q.id)
      from public.qcm_questions q
      join public.qcm_series s on s.id = q.serie_id
      left join public.question_fingerprints f on f.question_id = q.id
      left join public.question_bank_meta qm on qm.question_id = q.id
      where s.cours_id = any(p_cours_ids) and s.type in ('qcm', 'qroc')
    ), '[]'::jsonb),
    'series', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'cours_id', s.cours_id, 'label', s.label, 'type', s.type, 'kind', s.kind, 'annee', s.annee,
        'vig', (s.vignette is not null and btrim(s.vignette) <> ''),
        'av', s.allowed_voies, 'ao', s.allowed_offers, 'mg', s.mg_series, 'rev', s.is_revisions,
        'nq', (select count(*) from public.qcm_questions q2 where q2.serie_id = s.id),
        'ms', sm.content_source, 'mi', sm.item_id, 'mc', sm.category_id, 'mx', sm.is_extractable, 'ex', coalesce(sm.checkup_excluded, false)
      ) order by s.id)
      from public.qcm_series s
      left join public.qcm_series_meta sm on sm.serie_id = s.id
      where s.cours_id = any(p_cours_ids) and s.type in ('qcm', 'qroc')
    ), '[]'::jsonb)
  );
$$;

-- ─── Activité significative par jour (moteur d'engagement, §3) ───
-- Pour une liste de candidats, depuis p_since (jour de Paris) : réponses QCM /
-- QROC / dossiers / annales, flashcards, révisions transversales terminées,
-- épreuves blanches remises, Check-up, séances du planificateur terminées,
-- vidéos réellement suivies, temps d'étude mesuré, réponses EVC Arena.
create or replace function public.engagement_activity_days(p_user_ids uuid[], p_since date)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  with users as (select unnest(p_user_ids) as user_id),
  since as (select (p_since::timestamp at time zone 'Europe/Paris') as ts),
  att as (
    select a.user_id, (a.attempted_at at time zone 'Europe/Paris')::date as day,
           count(*) filter (where coalesce(q.format, 'qcm') = 'qcm' and coalesce(s.kind, 'qcm') <> 'dp' and s.label !~* '^annales?') as qcm,
           count(*) filter (where q.format = 'qroc' and s.label !~* '^annales?') as qroc,
           count(*) filter (where (s.kind = 'dp' or s.label ~* '^dp\M' or (s.vignette is not null and btrim(s.vignette) <> '')) and s.label !~* '^annales?') as dossiers,
           count(*) filter (where s.label ~* '^annales?') as annales
      from public.qcm_attempts a
      join public.qcm_questions q on q.id = a.question_id
      join public.qcm_series s on s.id = q.serie_id
     where a.user_id in (select user_id from users) and a.attempted_at >= (select ts from since)
     group by 1, 2
  ),
  fc as (
    select f.user_id, (f.reviewed_at at time zone 'Europe/Paris')::date as day, count(*) as flashcards
      from public.flashcard_reviews f
     where f.user_id in (select user_id from users) and f.reviewed_at >= (select ts from since)
     group by 1, 2
  ),
  tr as (
    select t.user_id, (t.completed_at at time zone 'Europe/Paris')::date as day, count(*) as transversal
      from public.transversal_sessions t
     where t.user_id in (select user_id from users) and t.completed_at >= (select ts from since)
     group by 1, 2
  ),
  mk as (
    select m.user_id, (m.submitted_at at time zone 'Europe/Paris')::date as day, count(*) as concours_blancs
      from public.mock_exam_submissions m
     where m.user_id in (select user_id from users) and m.submitted_at >= (select ts from since) and m.status in ('submitted', 'graded')
     group by 1, 2
  ),
  ck as (
    select c.user_id, (coalesce(c.submitted_at, c.completed_at) at time zone 'Europe/Paris')::date as day, count(*) as checkups
      from public.checkup_sessions c
     where c.user_id in (select user_id from users) and coalesce(c.submitted_at, c.completed_at) >= (select ts from since)
       and c.status in ('expired', 'pending_self_review', 'completed')
     group by 1, 2
  ),
  pl as (
    select p.user_id, (p.completed_at at time zone 'Europe/Paris')::date as day, count(*) as plan_done
      from public.plan_sessions p
     where p.user_id in (select user_id from users) and p.status = 'terminee' and p.completed_at >= (select ts from since)
     group by 1, 2
  ),
  vd as (
    select v.user_id, (coalesce(v.signed_at, v.required_at) at time zone 'Europe/Paris')::date as day,
           count(*) filter (where coalesce(v.watched_ratio, 0) >= 0.8) as videos
      from public.course_attendances v
     where v.user_id in (select user_id from users) and coalesce(v.signed_at, v.required_at) >= (select ts from since)
     group by 1, 2
  ),
  tm as (
    select t.user_id, t.session_date as day, sum(t.total_seconds)::int as active_seconds, max(t.last_heartbeat) as last_beat
      from public.platform_time_tracking t
     where t.user_id in (select user_id from users) and t.session_date >= p_since
     group by 1, 2
  ),
  emails as (
    select p.id as user_id, lower(p.email) as email from public.profiles p where p.id in (select user_id from users) and p.email is not null
  ),
  ar as (
    select e.user_id, (aa.validated_at at time zone 'Europe/Paris')::date as day, count(*) as arena
      from public.arena_answers aa
      join public.arena_attempts at2 on at2.id = aa.attempt_id and not at2.is_preview
      join public.arena_participants ap on ap.id = at2.participant_id and ap.email_confirmed_at is not null
      join emails e on e.email = lower(ap.email)
     where aa.validated_at >= (select ts from since)
     group by 1, 2
  ),
  days as (
    select user_id, day from att union select user_id, day from fc union select user_id, day from tr
    union select user_id, day from mk union select user_id, day from ck union select user_id, day from pl
    union select user_id, day from vd union select user_id, day from tm union select user_id, day from ar
  ),
  logins as (
    select u.id as user_id, u.last_sign_in_at from auth.users u where u.id in (select user_id from users)
  )
  select jsonb_build_object(
    'days', coalesce((
      select jsonb_object_agg(d.user_id::text, d.rows) from (
        select dd.user_id, jsonb_agg(jsonb_build_object(
          'day', dd.day,
          'qcm', coalesce(att.qcm, 0), 'qroc', coalesce(att.qroc, 0), 'dossiers', coalesce(att.dossiers, 0), 'annales', coalesce(att.annales, 0),
          'flashcards', coalesce(fc.flashcards, 0), 'transversal', coalesce(tr.transversal, 0), 'concours_blancs', coalesce(mk.concours_blancs, 0),
          'checkups', coalesce(ck.checkups, 0), 'plan_done', coalesce(pl.plan_done, 0), 'videos', coalesce(vd.videos, 0),
          'active_seconds', coalesce(tm.active_seconds, 0), 'arena', coalesce(ar.arena, 0)
        ) order by dd.day) as rows
        from days dd
        left join att on att.user_id = dd.user_id and att.day = dd.day
        left join fc on fc.user_id = dd.user_id and fc.day = dd.day
        left join tr on tr.user_id = dd.user_id and tr.day = dd.day
        left join mk on mk.user_id = dd.user_id and mk.day = dd.day
        left join ck on ck.user_id = dd.user_id and ck.day = dd.day
        left join pl on pl.user_id = dd.user_id and pl.day = dd.day
        left join vd on vd.user_id = dd.user_id and vd.day = dd.day
        left join tm on tm.user_id = dd.user_id and tm.day = dd.day
        left join ar on ar.user_id = dd.user_id and ar.day = dd.day
        group by dd.user_id
      ) d
    ), '{}'::jsonb),
    'logins', coalesce((
      select jsonb_object_agg(l.user_id::text, jsonb_build_object(
        'auth', l.last_sign_in_at,
        'beat', (select max(t.last_heartbeat) from public.platform_time_tracking t where t.user_id = l.user_id),
        'device', (select max(dv.last_seen_at) from public.devices dv where dv.user_id = l.user_id)
      )) from logins l
    ), '{}'::jsonb)
  );
$$;

-- ─── Sécurité : réservées au service role ───
do $$
declare f text;
begin
  foreach f in array array[
    'public.question_fingerprint_refresh(int)',
    'public.pedago_exposures(uuid, uuid[])',
    'public.pedago_collect_attempts(uuid, timestamptz, int)',
    'public.checkup_vivier(uuid[])',
    'public.engagement_activity_days(uuid[], date)'
  ]
  loop
    execute format('revoke all on function %s from public', f);
    execute format('revoke all on function %s from anon', f);
    execute format('revoke all on function %s from authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
