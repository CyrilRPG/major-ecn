-- Fiabilise les pourcentages (tâche 4) : le dénominateur « QCM totaux » ne doit
-- compter QUE les séries de type 'qcm' (exclut les annales), pour être cohérent
-- avec le numérateur « QCM distincts faits ».
create or replace function public.get_faculte_content_totals(p_faculte_id text default 'major-ecn')
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
with
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
flas_total as (
  select count(*)::int as n
  from flashcards f
  join cours c on c.id = f.cours_id
  join matieres m on m.id = c.matiere_id
  join semestres se on se.id = m.semestre_id
  where se.faculte_id = p_faculte_id
)
select jsonb_build_object(
  'qcm_counts', coalesce((select jsonb_agg(jsonb_build_object('cours_id', cours_id, 'n', n)) from qcnt), '[]'::jsonb),
  'flashcards_total', (select n from flas_total)
);
$$;

grant execute on function public.get_faculte_content_totals(text) to authenticated;
