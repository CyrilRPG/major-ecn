-- T7 : totaux de contenu VOIE-AWARE et flashcards par cours.
-- qcm_counts inclut désormais n_qroc (questions des séries kind='qroc') pour que
-- l'accueil calcule le total accessible selon la voie (externe = qroc, interne =
-- non-qroc). fc_counts donne les flashcards PAR COURS pour scoper aux collèges
-- réellement accessibles (au lieu d'un total faculté agrégé).
create or replace function public.get_faculte_content_totals(p_faculte_id text default 'major-ecn'::text)
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
with
qcnt as (
  select s.cours_id,
    count(*)::int as n,
    count(*) filter (where coalesce(s.kind, 'qcm') = 'qroc')::int as n_qroc
  from qcm_questions q
  join qcm_series s on s.id = q.serie_id
  join cours c on c.id = s.cours_id
  join matieres m on m.id = c.matiere_id
  join semestres se on se.id = m.semestre_id
  where se.faculte_id = p_faculte_id and s.type = 'qcm'
  group by s.cours_id
),
fcnt as (
  select f.cours_id, count(*)::int as n
  from flashcards f
  join cours c on c.id = f.cours_id
  join matieres m on m.id = c.matiere_id
  join semestres se on se.id = m.semestre_id
  where se.faculte_id = p_faculte_id
  group by f.cours_id
),
flas_total as (
  select coalesce(sum(n), 0)::int as n from fcnt
)
select jsonb_build_object(
  'qcm_counts', coalesce((select jsonb_agg(jsonb_build_object('cours_id', cours_id, 'n', n, 'n_qroc', n_qroc)) from qcnt), '[]'::jsonb),
  'fc_counts', coalesce((select jsonb_agg(jsonb_build_object('cours_id', cours_id, 'n', n)) from fcnt), '[]'::jsonb),
  'flashcards_total', (select n from flas_total)
);
$function$;
