-- Basculement final atomique du collège Anesthésie-Réanimation.
--
-- Les banques sont déjà remplacées cours par cours dans
-- replace_cours_generated_content(). Cette fonction ne rend le collège visible
-- qu'après une seconde validation en base des 43 paquets. Les 43 cours et leur
-- collège passent à `all` dans la même transaction PostgreSQL.

create or replace function public.activate_anesthesie_reanimation(
  p_dry_run boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_college_access text;
  v_course_count integer;
  v_restricted_courses integer;
  v_distinct_orders integer;
  v_min_order integer;
  v_max_order integer;
  v_invalid_courses text;
  v_invalid_series text;
  v_invalid_questions text;
  v_invalid_balance text;
  v_invalid_series_mix text;
begin
  select access_type
    into v_college_access
    from public.matieres
   where id = 'col-anesthesie-reanimation'
   for update;

  if v_college_access is null then
    raise exception 'Activation refusée : collège Anesthésie-Réanimation absent';
  end if;
  if v_college_access <> 'specific' then
    raise exception 'Activation refusée : collège non restreint (%)', v_college_access;
  end if;

  select count(*),
         count(*) filter (where access_type = 'specific'),
         count(distinct order_index), min(order_index), max(order_index)
    into v_course_count, v_restricted_courses, v_distinct_orders, v_min_order, v_max_order
    from public.cours
   where matiere_id = 'col-anesthesie-reanimation';

  if v_course_count <> 43 or v_restricted_courses <> 43
     or v_distinct_orders <> 43 or v_min_order <> 1 or v_max_order <> 43 then
    raise exception
      'Activation refusée : arborescence invalide (cours %, restreints %, ordres % [%–%])',
      v_course_count, v_restricted_courses, v_distinct_orders, v_min_order, v_max_order;
  end if;

  -- Comptages par cours, fiche canonique et HTML final sans jeton résiduel.
  select string_agg(c.id::text, ', ' order by c.order_index)
    into v_invalid_courses
    from public.cours c
    cross join lateral (
      select count(*)::integer as n
        from public.qcm_series s
       where s.cours_id = c.id and s.type = 'qcm'
    ) s
    cross join lateral (
      select count(*)::integer as n,
             count(*) filter (where q.format = 'qroc')::integer as qroc
        from public.qcm_questions q
        join public.qcm_series qs on qs.id = q.serie_id
       where qs.cours_id = c.id and qs.type = 'qcm'
    ) q
    cross join lateral (
      select count(*)::integer as n
        from public.qcm_items i
        join public.qcm_questions qi on qi.id = i.question_id
        join public.qcm_series si on si.id = qi.serie_id
       where si.cours_id = c.id and si.type = 'qcm'
    ) i
    cross join lateral (
      select count(*)::integer as n
        from public.flashcards fc
       where fc.cours_id = c.id
    ) fc
    cross join lateral (
      select count(*)::integer as n,
             min(f.pages)::integer as pages,
             bool_and(
               coalesce(f.storage_path, '') <> ''
               and coalesce(f.content_html, '') <> ''
               and position('__LOGO__' in coalesce(f.content_html, '')) = 0
               and position('__WATERMARK__' in coalesce(f.content_html, '')) = 0
               and position('__IMGFILE:' in coalesce(f.content_html, '')) = 0
             ) as complete
        from public.fiches f
       where f.cours_id = c.id
    ) f
   where c.matiere_id = 'col-anesthesie-reanimation'
     and (s.n <> 32 or q.n <> 192 or q.qroc <> 96 or i.n <> 480
          or fc.n < 100 or fc.n > 200 or f.n <> 1
          or coalesce(f.pages, 0) < 7 or coalesce(f.pages, 0) > 40 or not coalesce(f.complete, false));

  if v_invalid_courses is not null then
    raise exception 'Activation refusée : paquets incomplets pour %', v_invalid_courses;
  end if;

  -- Famille, voie et volume de chaque série.
  select string_agg(s.id::text, ', ' order by c.order_index, s.order_index)
    into v_invalid_series
    from public.qcm_series s
    join public.cours c on c.id = s.cours_id
    cross join lateral (
      select count(*)::integer as n from public.qcm_questions q where q.serie_id = s.id
    ) q
   where c.matiere_id = 'col-anesthesie-reanimation'
     and (
       s.type <> 'qcm'
       or case
        when s.label ~* '^DP[[:space:]]+QROC'
           then coalesce(s.kind, '') <> 'qroc' or coalesce(s.allowed_voies, '{}'::text[]) <> array['externe']::text[] or q.n <> 7
        when s.label ~* '^QROC'
           then coalesce(s.kind, '') <> 'qroc' or coalesce(s.allowed_voies, '{}'::text[]) <> array['externe']::text[] or q.n <> 5
        when s.label ~* '^DP[[:space:]]+QCM'
           then coalesce(s.kind, '') <> 'dp' or coalesce(s.allowed_voies, '{}'::text[]) <> array['interne']::text[] or q.n <> 7
        when s.label ~* '^QCM'
           then coalesce(s.kind, '') <> 'qcm' or coalesce(s.allowed_voies, '{}'::text[]) <> array['interne']::text[] or q.n <> 5
         else true
       end
     );

  if v_invalid_series is not null then
    raise exception 'Activation refusée : séries ou voies invalides pour %', v_invalid_series;
  end if;

  -- Structure finale de chaque question : 5 propositions QCM, zéro en QROC.
  select string_agg(q.id::text, ', ' order by c.order_index, s.order_index, q.order_index)
    into v_invalid_questions
    from public.qcm_questions q
    join public.qcm_series s on s.id = q.serie_id
    join public.cours c on c.id = s.cours_id
    cross join lateral (
      select count(*)::integer as n,
             count(*) filter (where i.is_correct)::integer as correct
        from public.qcm_items i
       where i.question_id = q.id
    ) i
   where c.matiere_id = 'col-anesthesie-reanimation'
     and (
       coalesce(btrim(q.enonce), '') = ''
       or coalesce(btrim(q.correction_generale), '') = ''
       or (q.format = 'qcm' and (i.n <> 5 or i.correct < 1 or i.correct > 5))
       or (q.format = 'qroc' and (i.n <> 0 or coalesce(btrim(q.reponse_attendue), '') = ''))
       or coalesce(q.format, '') not in ('qcm', 'qroc')
     );

  if v_invalid_questions is not null then
    raise exception 'Activation refusée : questions invalides pour %', v_invalid_questions;
  end if;

  -- Équilibre pédagogique des 96 QCM de chaque cours : 19 ou 20 questions
  -- pour chacune des cardinalités 1–5, avec rotation de la cardinalité à 20,
  -- et positions A–E quasi uniformes.
  with per_question as (
    select c.id as course_id,
           c.order_index as course_order,
           q.id as question_id,
           count(*) filter (where i.is_correct)::integer as correct
      from public.cours c
      join public.qcm_series s on s.cours_id = c.id and s.type = 'qcm'
      join public.qcm_questions q on q.serie_id = s.id and q.format = 'qcm'
      join public.qcm_items i on i.question_id = q.id
     where c.matiere_id = 'col-anesthesie-reanimation'
     group by c.id, c.order_index, q.id
  ), per_course as (
    select course_id, course_order,
           count(*) filter (where correct = 1)::integer as c1,
           count(*) filter (where correct = 2)::integer as c2,
           count(*) filter (where correct = 3)::integer as c3,
           count(*) filter (where correct = 4)::integer as c4,
           count(*) filter (where correct = 5)::integer as c5
      from per_question
     group by course_id, course_order
  ), per_letter as (
    select c.id as course_id,
           count(*) filter (where i.is_correct and i.lettre = 'A')::integer as a,
           count(*) filter (where i.is_correct and i.lettre = 'B')::integer as b,
           count(*) filter (where i.is_correct and i.lettre = 'C')::integer as cc,
           count(*) filter (where i.is_correct and i.lettre = 'D')::integer as d,
           count(*) filter (where i.is_correct and i.lettre = 'E')::integer as e
      from public.cours c
      join public.qcm_series s on s.cours_id = c.id and s.type = 'qcm'
      join public.qcm_questions q on q.serie_id = s.id and q.format = 'qcm'
      join public.qcm_items i on i.question_id = q.id
     where c.matiere_id = 'col-anesthesie-reanimation'
     group by c.id
  )
  select string_agg(pc.course_id::text, ', ' order by pc.course_order)
    into v_invalid_balance
    from per_course pc
    join per_letter pl on pl.course_id = pc.course_id
   where pc.c1 <> case when mod(pc.course_order - 1, 5) + 1 = 1 then 20 else 19 end
      or pc.c2 <> case when mod(pc.course_order - 1, 5) + 1 = 2 then 20 else 19 end
      or pc.c3 <> case when mod(pc.course_order - 1, 5) + 1 = 3 then 20 else 19 end
      or pc.c4 <> case when mod(pc.course_order - 1, 5) + 1 = 4 then 20 else 19 end
      or pc.c5 <> case when mod(pc.course_order - 1, 5) + 1 = 5 then 20 else 19 end
      or greatest(pl.a, pl.b, pl.cc, pl.d, pl.e) - least(pl.a, pl.b, pl.cc, pl.d, pl.e) > 2;

  if v_invalid_balance is not null then
    raise exception 'Activation refusée : distribution des réponses QCM déséquilibrée pour %', v_invalid_balance;
  end if;

  -- Le mélange doit aussi être perceptible à l'échelle de chaque série :
  -- au moins trois cardinalités, aucune répétée plus de trois fois, et aucune
  -- séquence 1–5 reproduite à l'identique dans deux séries de même longueur.
  with per_question as (
    select c.id as course_id,
           c.order_index as course_order,
           s.id as series_id,
           s.order_index as series_order,
           q.order_index as question_order,
           count(*) filter (where i.is_correct)::integer as correct
      from public.cours c
      join public.qcm_series s on s.cours_id = c.id and s.type = 'qcm' and s.order_index between 1 and 16
      join public.qcm_questions q on q.serie_id = s.id and q.format = 'qcm'
      join public.qcm_items i on i.question_id = q.id
     where c.matiere_id = 'col-anesthesie-reanimation'
     group by c.id, c.order_index, s.id, s.order_index, q.order_index
  ), frequencies as (
    select course_id, series_id, correct, count(*)::integer as n
      from per_question
     group by course_id, series_id, correct
  ), per_series as (
    select pq.course_id,
           pq.course_order,
           pq.series_id,
           pq.series_order,
           count(*)::integer as question_count,
           count(distinct pq.correct)::integer as distinct_cardinalities,
           max(f.n)::integer as max_repeat,
           string_agg(pq.correct::text, '-' order by pq.question_order) as signature
      from per_question pq
      join frequencies f on f.course_id = pq.course_id and f.series_id = pq.series_id and f.correct = pq.correct
     group by pq.course_id, pq.course_order, pq.series_id, pq.series_order
  ), duplicate_signatures as (
    select course_id, question_count, signature
      from per_series
     group by course_id, question_count, signature
    having count(*) > 1
  ), invalid_courses as (
    select distinct ps.course_id, ps.course_order
      from per_series ps
     where ps.distinct_cardinalities < 3
        or ps.max_repeat > 3
        or exists (
          select 1 from duplicate_signatures ds
           where ds.course_id = ps.course_id
             and ds.question_count = ps.question_count
             and ds.signature = ps.signature
        )
  )
  select string_agg(course_id::text, ', ' order by course_order)
    into v_invalid_series_mix
    from invalid_courses;

  if v_invalid_series_mix is not null then
    raise exception 'Activation refusée : cardinalités insuffisamment mélangées dans les séries pour %', v_invalid_series_mix;
  end if;

  if p_dry_run then
    return jsonb_build_object(
      'ready', true,
      'activated', false,
      'college', 'col-anesthesie-reanimation',
      'courses', v_course_count
    );
  end if;

  update public.cours
     set access_type = 'all'
   where matiere_id = 'col-anesthesie-reanimation';

  update public.matieres
     set access_type = 'all'
   where id = 'col-anesthesie-reanimation';

  return jsonb_build_object(
    'activated', true,
    'college', 'col-anesthesie-reanimation',
    'courses', v_course_count
  );
end;
$$;

revoke all on function public.activate_anesthesie_reanimation(boolean) from public, anon, authenticated;
grant execute on function public.activate_anesthesie_reanimation(boolean) to service_role;
