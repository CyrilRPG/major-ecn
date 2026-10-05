-- Collecte des tentatives : l'origine déclarée de la tentative (`qcm_attempts.origin`,
-- colonne ajoutée par la refonte du planificateur) est renvoyée au collecteur.
-- Une tentative émise par un module qui envoie lui-même ses signaux au moteur
-- central (planificateur, révision ciblée) n'est pas collectée une seconde
-- fois ; une tentative marquée « transversal » est classée sans attendre la
-- clôture de la session.

alter table public.qcm_attempts add column if not exists origin text;

create or replace function public.pedago_collect_attempts(p_user uuid, p_since timestamptz, p_limit int default 500)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  with me as (select lower(email) as email from public.profiles where id = p_user),
  mine as (
    select a.id, a.question_id, a.attempted_at, a.is_correct, a.session_id, a.selected_items, a.text_answer, a.origin,
           coalesce(m.canonical_question_id, f.canonical_question_id, a.question_id) as canon
      from public.qcm_attempts a
      left join public.question_fingerprints f on f.question_id = a.question_id
      left join public.question_bank_meta m on m.question_id = a.question_id
     where a.user_id = p_user
    -- Autres expositions (Check-up, EVC Arena) : elles comptent pour « récemment vue »
    -- mais ne sont pas des tentatives à collecter (id null).
    union all
    select null::uuid, null::uuid, coalesce(cq.presented_at, cs.started_at), null::boolean, null::uuid, null::jsonb, null::text, null::text, cq.canonical_question_id
      from public.checkup_questions cq
      join public.checkup_sessions cs on cs.id = cq.session_id
     where cs.user_id = p_user and cs.status <> 'cancelled_technical' and cq.presented_at is not null
    union all
    select null::uuid, null::uuid, coalesce(aa.validated_at, at2.started_at), null::boolean, null::uuid, null::jsonb, null::text, null::text,
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
    'session_id', b.session_id, 'prev_at', b.prev_at, 'origin', b.origin,
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

revoke all on function public.pedago_collect_attempts(uuid, timestamptz, int) from public;
revoke all on function public.pedago_collect_attempts(uuid, timestamptz, int) from anon;
revoke all on function public.pedago_collect_attempts(uuid, timestamptz, int) from authenticated;
grant execute on function public.pedago_collect_attempts(uuid, timestamptz, int) to service_role;
