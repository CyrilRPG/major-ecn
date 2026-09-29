-- Audit de lenteur (29/09/2026) — vivier des révisions transversales en un appel.
--
-- La page de session lisait les questions des cours étudiés par tranches de
-- 50 cours × pages OFFSET de 1 000 (jointures imbriquées sous RLS), plus les
-- séries avec leur nombre de questions, de la même façon : 1 070 lectures à
-- 2,2 s la semaine du 22/09. Une fonction SECURITY INVOKER (même RLS que
-- PostgREST) renvoie les deux listes en un seul jsonb ; les identifiants de
-- cours passent dans le corps de la requête (aucune limite d'URL).
create or replace function public.vivier_revisions_cours(p_cours_ids uuid[])
returns jsonb
language sql
stable
security invoker
set search_path to 'public'
as $function$
  select jsonb_build_object(
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', q.id, 'serie_id', q.serie_id, 'order_index', q.order_index, 'format', q.format,
        'n_items', (select count(*) from qcm_items i where i.question_id = q.id),
        'matiere_id', m.id, 'faculte_id', se.faculte_id
      ) order by q.id)
      from qcm_questions q
      join qcm_series s on s.id = q.serie_id
      join cours c on c.id = s.cours_id
      join matieres m on m.id = c.matiere_id
      join semestres se on se.id = m.semestre_id
      where s.cours_id = any(p_cours_ids)
    ), '[]'::jsonb),
    'series', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'label', s.label, 'type', s.type, 'vignette', s.vignette,
        'n_questions', (select count(*) from qcm_questions q where q.serie_id = s.id)
      ) order by s.id)
      from qcm_series s
      where s.cours_id = any(p_cours_ids)
    ), '[]'::jsonb)
  );
$function$;

revoke all on function public.vivier_revisions_cours(uuid[]) from public, anon;
grant execute on function public.vivier_revisions_cours(uuid[]) to authenticated, service_role;
