-- Garde complémentaire : le mélange 1–5 doit être visible dans chacune des
-- 16 séries QCM d'un cours, pas seulement dans le total des 96 questions.

create or replace function public.assert_anesthesie_qcm_payload_series_mix(p_payload jsonb)
returns void
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_course jsonb;
  v_series jsonb;
  v_question jsonb;
  v_item jsonb;
  v_cardinality integer;
  v_cardinalities integer[];
  v_distinct integer;
  v_max_repeat integer;
  v_signature text;
  v_signature_key text;
  v_signatures jsonb;
  v_course_order text;
  v_series_order integer;
begin
  if jsonb_typeof(coalesce(p_payload->'courses', '[]'::jsonb)) <> 'array' then
    raise exception 'Mélange QCM : tableau courses requis';
  end if;
  for v_course in select value from jsonb_array_elements(p_payload->'courses') loop
    v_course_order := coalesce(v_course->>'numero', v_course->>'courseId', '?');
    v_signatures := '{}'::jsonb;
    v_series_order := 0;
    for v_series in select value from jsonb_array_elements(coalesce(v_course->'series', '[]'::jsonb)) loop
      v_series_order := v_series_order + 1;
      v_cardinalities := array[]::integer[];
      for v_question in select value from jsonb_array_elements(coalesce(v_series->'questions', '[]'::jsonb)) loop
        v_cardinality := 0;
        for v_item in select value from jsonb_array_elements(coalesce(v_question->'items', '[]'::jsonb)) loop
          if coalesce((v_item->>'is_correct')::boolean, false) then
            v_cardinality := v_cardinality + 1;
          end if;
        end loop;
        v_cardinalities := array_append(v_cardinalities, v_cardinality);
      end loop;
      select count(distinct value), max(n)
        into v_distinct, v_max_repeat
        from (
          select value, count(*)::integer as n
            from unnest(v_cardinalities) as values_in_series(value)
           group by value
        ) as frequencies;
      if coalesce(v_distinct, 0) < 3 or coalesce(v_max_repeat, 0) > 3 then
        raise exception 'Cours %, série % : cardinalités insuffisamment mélangées (%)',
          v_course_order, v_series_order, array_to_string(v_cardinalities, '-');
      end if;
      v_signature := array_to_string(v_cardinalities, '-');
      v_signature_key := cardinality(v_cardinalities)::text || ':' || v_signature;
      if v_signatures ? v_signature_key then
        raise exception 'Cours %, série % : séquence de cardinalités dupliquée (%)',
          v_course_order, v_series_order, v_signature;
      end if;
      v_signatures := jsonb_set(v_signatures, array[v_signature_key], 'true'::jsonb, true);
    end loop;
  end loop;
end;
$$;

create or replace function public.assert_anesthesie_qcm_db_series_mix()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invalid text;
begin
  with per_question as (
    select c.id as course_id, c.order_index as course_order,
           s.id as series_id, s.order_index as series_order,
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
    select pq.course_id, pq.course_order, pq.series_id, pq.series_order,
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
    into v_invalid
    from invalid_courses;
  if v_invalid is not null then
    raise exception 'Cardinalités insuffisamment mélangées dans les séries pour %', v_invalid;
  end if;
end;
$$;

do $$
begin
  if to_regprocedure('public.rebalance_anesthesie_qcm_before_series_mix(jsonb,boolean)') is null then
    execute 'alter function public.rebalance_anesthesie_qcm(jsonb, boolean) rename to rebalance_anesthesie_qcm_before_series_mix';
  end if;
  if to_regprocedure('public.activate_anesthesie_reanimation_before_series_mix(boolean)') is null then
    execute 'alter function public.activate_anesthesie_reanimation(boolean) rename to activate_anesthesie_reanimation_before_series_mix';
  end if;
end;
$$;

create or replace function public.rebalance_anesthesie_qcm(p_payload jsonb, p_dry_run boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result jsonb;
begin
  perform public.assert_anesthesie_qcm_payload_series_mix(p_payload);
  select public.rebalance_anesthesie_qcm_before_series_mix(p_payload, p_dry_run) into v_result;
  return v_result;
end;
$$;

create or replace function public.activate_anesthesie_reanimation(p_dry_run boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result jsonb;
begin
  perform public.assert_anesthesie_qcm_db_series_mix();
  select public.activate_anesthesie_reanimation_before_series_mix(p_dry_run) into v_result;
  return v_result;
end;
$$;

revoke all on function public.assert_anesthesie_qcm_payload_series_mix(jsonb) from public, anon, authenticated;
revoke all on function public.assert_anesthesie_qcm_db_series_mix() from public, anon, authenticated;
revoke all on function public.rebalance_anesthesie_qcm(jsonb, boolean) from public, anon, authenticated;
revoke all on function public.activate_anesthesie_reanimation(boolean) from public, anon, authenticated;
grant execute on function public.rebalance_anesthesie_qcm(jsonb, boolean) to service_role;
grant execute on function public.activate_anesthesie_reanimation(boolean) to service_role;
