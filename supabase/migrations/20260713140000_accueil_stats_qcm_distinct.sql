-- Fiabilise les pourcentages (tâche 4) :
--   • per_cours expose `distinct_done` = nombre de questions QCM DISTINCTES tentées
--     (dédoublonné par question_id, séries type='qcm' uniquement) → plus gonflé
--     par les re-tentatives ni par les annales.
--   • qcm_counts (dénominateur) ne compte QUE les séries type='qcm' (exclut annales).
create or replace function public.get_accueil_stats(p_faculte_id text default 'major-ecn')
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
with
uid as (select auth.uid() as id),
att as (
  select a.is_correct, a.attempted_at, a.question_id, s.cours_id, s.type
  from qcm_attempts a
  join qcm_questions q on q.id = a.question_id
  join qcm_series s on s.id = q.serie_id
  join cours c on c.id = s.cours_id
  join matieres m on m.id = c.matiere_id
  join semestres se on se.id = m.semestre_id
  where a.user_id = (select id from uid) and se.faculte_id = p_faculte_id
),
rev as (
  select r.flashcard_id, r.difficulty, r.reviewed_at, f.cours_id, c.titre
  from flashcard_reviews r
  join flashcards f on f.id = r.flashcard_id
  join cours c on c.id = f.cours_id
  join matieres m on m.id = c.matiere_id
  join semestres se on se.id = m.semestre_id
  where r.user_id = (select id from uid) and se.faculte_id = p_faculte_id
),
ses as (
  select ss.finished_at, c.titre
  from qcm_sessions ss
  join qcm_series s on s.id = ss.serie_id
  join cours c on c.id = s.cours_id
  join matieres m on m.id = c.matiere_id
  join semestres se on se.id = m.semestre_id
  where ss.user_id = (select id from uid) and ss.finished_at is not null
    and se.faculte_id = p_faculte_id
),
fc_score as (
  select flashcard_id,
    sum(case difficulty
      when 'tres_facile' then 5 when 'facile' then 3
      when 'difficile' then -3 when 'tres_difficile' then -5 else 0 end) as score
  from rev group by flashcard_id
),
pc_att as (
  select cours_id, count(*)::int as attempts,
         count(*) filter (where is_correct)::int as correct,
         count(distinct question_id) filter (where type = 'qcm')::int as distinct_done
  from att group by cours_id
),
pc_fc as (select distinct cours_id from rev),
per_cours as (
  select coalesce(a.cours_id, f.cours_id) as cours_id,
    coalesce(a.attempts, 0) as attempts,
    coalesce(a.correct, 0) as correct,
    coalesce(a.distinct_done, 0) as distinct_done,
    (f.cours_id is not null) as has_fc
  from pc_att a full outer join pc_fc f on f.cours_id = a.cours_id
),
qcnt as (
  select s.cours_id, count(*)::int as n
  from qcm_questions q
  join qcm_series s on s.id = q.serie_id
  join cours c on c.id = s.cours_id
  join matieres m on m.id = c.matiere_id
  join semestres se on se.id = m.semestre_id
  where se.faculte_id = p_faculte_id and s.type = 'qcm'
  group by s.cours_id
),
daily as (
  select to_char(attempted_at at time zone 'UTC', 'YYYY-MM-DD') as d, count(*)::int as n
  from att where attempted_at >= now() - interval '30 days'
  group by 1
),
recent as (
  select kind, titre, ts from (
    (select 'QCM'::text as kind, titre, finished_at as ts from ses
     order by finished_at desc limit 6)
    union all
    (select 'Flashcards'::text as kind, titre, reviewed_at as ts from rev
     order by reviewed_at desc limit 4)
  ) u
  order by ts desc limit 10
),
flas_total as (
  select count(*)::int as n
  from flashcards f
  join cours c on c.id = f.cours_id
  join matieres m on m.id = c.matiere_id
  join semestres se on se.id = m.semestre_id
  where se.faculte_id = p_faculte_id
),
ptime as (
  select coalesce(sum(total_seconds), 0)::int as s
  from platform_time_tracking
  where user_id = (select id from uid) and session_date >= (current_date - 7)
)
select jsonb_build_object(
  'totals', jsonb_build_object(
    'attempts_total',    (select count(*) from att),
    'attempts_distinct', (select count(distinct question_id) from att where type = 'qcm'),
    'attempts_correct',  (select count(*) from att where is_correct),
    'attempts_week',     (select count(*) from att where attempted_at >= now() - interval '7 days'),
    'sessions_total',    (select count(*) from ses),
    'sessions_week',     (select count(*) from ses where finished_at >= now() - interval '7 days'),
    'reviews_total',     (select count(*) from rev),
    'reviews_week',      (select count(*) from rev where reviewed_at >= now() - interval '7 days'),
    'fc_mastered',       (select count(*) from fc_score where score >= 5),
    'flashcards_total',  (select n from flas_total),
    'platform_seconds_week', (select s from ptime),
    'cours_touched_week', (
      select count(distinct cid) from (
        select cours_id as cid from att where attempted_at >= now() - interval '7 days'
        union
        select cours_id as cid from rev where reviewed_at >= now() - interval '7 days'
      ) t
    )
  ),
  'per_cours', coalesce((select jsonb_agg(jsonb_build_object(
      'cours_id', cours_id, 'attempts', attempts, 'correct', correct,
      'distinct_done', distinct_done, 'has_fc', has_fc)) from per_cours), '[]'::jsonb),
  'qcm_counts', coalesce((select jsonb_agg(jsonb_build_object('cours_id', cours_id, 'n', n)) from qcnt), '[]'::jsonb),
  'daily', coalesce((select jsonb_agg(jsonb_build_object('d', d, 'n', n)) from daily), '[]'::jsonb),
  'recent', coalesce((select jsonb_agg(jsonb_build_object('kind', kind, 'titre', titre, 'at', ts)) from recent), '[]'::jsonb)
);
$$;

grant execute on function public.get_accueil_stats(text) to authenticated;
