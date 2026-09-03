-- Rééquilibrage éditorial des QCM d'Anesthésie-Réanimation sans supprimer
-- les séries, questions ou propositions existantes. Les identifiants restent
-- donc stables et les sessions/tentatives déjà enregistrées sont préservées.

create or replace function public.rebalance_anesthesie_qcm(
  p_payload jsonb,
  p_dry_run boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_course_entry jsonb;
  v_series_entry jsonb;
  v_question_entry jsonb;
  v_item_entry jsonb;
  v_courses jsonb := coalesce(p_payload->'courses', '[]'::jsonb);
  v_series jsonb;
  v_course_id uuid;
  v_course_order integer;
  v_course_access text;
  v_series_id uuid;
  v_question_id uuid;
  v_item_id uuid;
  v_course_ordinal integer;
  v_series_ordinal integer;
  v_question_ordinal integer;
  v_item_ordinal integer;
  v_expected_questions integer;
  v_question_total integer;
  v_item_total integer;
  v_correct integer;
  v_correct_pattern text;
  v_extra_count integer;
  v_expected_count integer;
  v_count integer;
  v_letter text;
  v_letter_index integer;
  v_answer_counts integer[];
  v_letter_counts integer[];
  v_pattern_counts jsonb;
  v_combinations text[];
  v_combination text;
  v_pattern_count integer;
  v_pattern_min integer;
  v_pattern_max integer;
  v_letter_min integer;
  v_letter_max integer;
  v_text text;
  v_seen_ids integer;
  v_series_cardinalities integer[];
  v_series_distinct integer;
  v_series_max_repeat integer;
  v_series_signature text;
  v_series_signature_key text;
  v_series_signatures jsonb;
begin
  if jsonb_typeof(v_courses) <> 'array' or jsonb_array_length(v_courses) <> 43 then
    raise exception 'Rééquilibrage refusé : 43 cours requis';
  end if;

  select count(distinct value->>'courseId')
    into v_seen_ids
    from jsonb_array_elements(v_courses);
  if v_seen_ids <> 43 then
    raise exception 'Rééquilibrage refusé : identifiants de cours absents ou dupliqués';
  end if;

  if not exists (
    select 1 from public.matieres
     where id = 'col-anesthesie-reanimation' and access_type = 'specific'
  ) then
    raise exception 'Rééquilibrage refusé : le collège doit être en accès restreint';
  end if;

  for v_course_entry, v_course_ordinal in
    select value, ordinality::integer
      from jsonb_array_elements(v_courses) with ordinality
  loop
    begin
      v_course_id := (v_course_entry->>'courseId')::uuid;
    exception when others then
      raise exception 'Cours % : identifiant UUID invalide', v_course_ordinal;
    end;

    select order_index, access_type
      into v_course_order, v_course_access
      from public.cours
     where id = v_course_id and matiere_id = 'col-anesthesie-reanimation'
     for update;
    if v_course_order is null or v_course_access <> 'specific' then
      raise exception 'Cours % : absent du collège ou non restreint', v_course_id;
    end if;

    v_series := coalesce(v_course_entry->'series', '[]'::jsonb);
    if jsonb_typeof(v_series) <> 'array' or jsonb_array_length(v_series) <> 16 then
      raise exception 'Cours % : 16 séries QCM requises', v_course_order;
    end if;

    select
      (select count(*) from public.qcm_series s where s.cours_id = v_course_id and s.type = 'qcm' and s.order_index between 1 and 16),
      (select count(*) from public.qcm_questions q join public.qcm_series s on s.id = q.serie_id where s.cours_id = v_course_id and s.order_index between 1 and 16 and q.format = 'qcm'),
      (select count(*) from public.qcm_items i join public.qcm_questions q on q.id = i.question_id join public.qcm_series s on s.id = q.serie_id where s.cours_id = v_course_id and s.order_index between 1 and 16 and q.format = 'qcm')
      into v_series_ordinal, v_question_total, v_item_total;
    if v_series_ordinal <> 16 or v_question_total <> 96 or v_item_total <> 480 then
      raise exception 'Cours % : structure distante invalide (% séries, % questions, % propositions)',
        v_course_order, v_series_ordinal, v_question_total, v_item_total;
    end if;

    v_answer_counts := array[0, 0, 0, 0, 0];
    v_letter_counts := array[0, 0, 0, 0, 0];
    v_pattern_counts := '{}'::jsonb;
    v_series_signatures := '{}'::jsonb;
    v_question_total := 0;
    v_item_total := 0;

    for v_series_entry, v_series_ordinal in
      select value, ordinality::integer
        from jsonb_array_elements(v_series) with ordinality
    loop
      v_series_cardinalities := array[]::integer[];
      if v_series_ordinal <= 8 then
        if coalesce(v_series_entry->>'label', '') !~* '^QCM' then
          raise exception 'Cours %, série % : libellé QCM attendu', v_course_order, v_series_ordinal;
        end if;
        v_expected_questions := 5;
      else
        if coalesce(v_series_entry->>'label', '') !~* '^DP[[:space:]]+QCM' then
          raise exception 'Cours %, série % : libellé DP QCM attendu', v_course_order, v_series_ordinal;
        end if;
        v_expected_questions := 7;
        if length(btrim(regexp_replace(coalesce(v_series_entry->>'vignette', ''), '<[^>]*>', ' ', 'g'))) < 180 then
          raise exception 'Cours %, série % : vignette DP insuffisante', v_course_order, v_series_ordinal;
        end if;
      end if;
      if jsonb_array_length(coalesce(v_series_entry->'questions', '[]'::jsonb)) <> v_expected_questions then
        raise exception 'Cours %, série % : % questions requises', v_course_order, v_series_ordinal, v_expected_questions;
      end if;

      select id into v_series_id
        from public.qcm_series
       where cours_id = v_course_id and type = 'qcm' and order_index = v_series_ordinal
       for update;
      if v_series_id is null then
        raise exception 'Cours %, série % : série distante absente', v_course_order, v_series_ordinal;
      end if;

      if not p_dry_run then
        update public.qcm_series
           set label = v_series_entry->>'label',
               vignette = nullif(v_series_entry->>'vignette', ''),
               kind = case when v_series_ordinal <= 8 then 'qcm' else 'dp' end,
               allowed_voies = array['interne']::text[]
         where id = v_series_id;
      end if;

      for v_question_entry, v_question_ordinal in
        select value, ordinality::integer
          from jsonb_array_elements(v_series_entry->'questions') with ordinality
      loop
        if coalesce(v_question_entry->>'format', '') <> 'qcm' then
          raise exception 'Cours %, série %, Q% : format QCM requis', v_course_order, v_series_ordinal, v_question_ordinal;
        end if;
        v_text := btrim(regexp_replace(regexp_replace(coalesce(v_question_entry->>'enonce', ''), '<[^>]*>', ' ', 'g'), '[[:space:]]+', ' ', 'g'));
        if length(v_text) < 20 or length(btrim(coalesce(v_question_entry->>'correction_generale', ''))) = 0 then
          raise exception 'Cours %, série %, Q% : énoncé ou correction insuffisant', v_course_order, v_series_ordinal, v_question_ordinal;
        end if;
        if jsonb_array_length(coalesce(v_question_entry->'items', '[]'::jsonb)) <> 5 then
          raise exception 'Cours %, série %, Q% : cinq propositions requises', v_course_order, v_series_ordinal, v_question_ordinal;
        end if;

        select count(*)::integer,
               coalesce(string_agg(item->>'lettre', '' order by ordinality) filter (where coalesce((item->>'is_correct')::boolean, false)), '')
          into v_correct, v_correct_pattern
          from jsonb_array_elements(v_question_entry->'items') with ordinality as entries(item, ordinality)
         where coalesce((item->>'is_correct')::boolean, false);
        if v_correct < 1 or v_correct > 5 then
          raise exception 'Cours %, série %, Q% : une à cinq réponses justes requises', v_course_order, v_series_ordinal, v_question_ordinal;
        end if;
        v_answer_counts[v_correct] := v_answer_counts[v_correct] + 1;
        v_series_cardinalities := array_append(v_series_cardinalities, v_correct);
        v_pattern_counts := jsonb_set(
          v_pattern_counts,
          array[v_correct_pattern],
          to_jsonb(coalesce((v_pattern_counts->>v_correct_pattern)::integer, 0) + 1),
          true
        );

        select id into v_question_id
          from public.qcm_questions
         where serie_id = v_series_id and order_index = v_question_ordinal and format = 'qcm'
         for update;
        if v_question_id is null then
          raise exception 'Cours %, série %, Q% : question distante absente', v_course_order, v_series_ordinal, v_question_ordinal;
        end if;

        if not p_dry_run then
          update public.qcm_questions
             set enonce = v_text,
                 correction_generale = v_question_entry->>'correction_generale',
                 reponse_attendue = null
           where id = v_question_id;
        end if;

        for v_item_entry, v_item_ordinal in
          select value, ordinality::integer
            from jsonb_array_elements(v_question_entry->'items') with ordinality
        loop
          v_letter := v_item_entry->>'lettre';
          if v_letter <> substr('ABCDE', v_item_ordinal, 1) then
            raise exception 'Cours %, série %, Q% : lettres ABCDE ordonnées requises', v_course_order, v_series_ordinal, v_question_ordinal;
          end if;
          if length(btrim(coalesce(v_item_entry->>'enonce', ''))) = 0
             or length(btrim(coalesce(v_item_entry->>'justification', ''))) = 0 then
            raise exception 'Cours %, série %, Q%, % : proposition ou justification vide', v_course_order, v_series_ordinal, v_question_ordinal, v_letter;
          end if;
          if coalesce((v_item_entry->>'is_correct')::boolean, false) then
            v_letter_index := position(v_letter in 'ABCDE');
            v_letter_counts[v_letter_index] := v_letter_counts[v_letter_index] + 1;
          end if;

          select id into v_item_id
            from public.qcm_items
           where question_id = v_question_id and lettre = v_letter
           for update;
          if v_item_id is null then
            raise exception 'Cours %, série %, Q%, % : proposition distante absente', v_course_order, v_series_ordinal, v_question_ordinal, v_letter;
          end if;
          if not p_dry_run then
            update public.qcm_items
               set enonce = v_item_entry->>'enonce',
                   is_correct = coalesce((v_item_entry->>'is_correct')::boolean, false),
                   justification = v_item_entry->>'justification'
             where id = v_item_id;
          end if;
          v_item_total := v_item_total + 1;
        end loop;
        v_question_total := v_question_total + 1;
      end loop;

      select count(distinct value), max(cardinality_count)
        into v_series_distinct, v_series_max_repeat
        from (
          select value, count(*)::integer as cardinality_count
            from unnest(v_series_cardinalities) as values_in_series(value)
           group by value
        ) as cardinalities;
      if v_series_distinct < 3 or v_series_max_repeat > 3 then
        raise exception 'Cours %, série % : cardinalités insuffisamment mélangées (%)',
          v_course_order, v_series_ordinal, array_to_string(v_series_cardinalities, '-');
      end if;
      v_series_signature := array_to_string(v_series_cardinalities, '-');
      v_series_signature_key := v_expected_questions::text || ':' || v_series_signature;
      if v_series_signatures ? v_series_signature_key then
        raise exception 'Cours %, série % : séquence de cardinalités dupliquée (%)',
          v_course_order, v_series_ordinal, v_series_signature;
      end if;
      v_series_signatures := jsonb_set(v_series_signatures, array[v_series_signature_key], 'true'::jsonb, true);
    end loop;

    if v_question_total <> 96 or v_item_total <> 480 then
      raise exception 'Cours % : payload incomplet (% questions, % propositions)', v_course_order, v_question_total, v_item_total;
    end if;
    v_extra_count := mod(v_course_order - 1, 5) + 1;
    for v_count in 1..5 loop
      v_expected_count := case when v_count = v_extra_count then 20 else 19 end;
      if v_answer_counts[v_count] <> v_expected_count then
        raise exception 'Cours % : % QCM à % réponse(s) juste(s), attendu %', v_course_order, v_answer_counts[v_count], v_count, v_expected_count;
      end if;
      v_combinations := case v_count
        when 1 then array['A','B','C','D','E']
        when 2 then array['AB','AC','AD','AE','BC','BD','BE','CD','CE','DE']
        when 3 then array['ABC','ABD','ABE','ACD','ACE','ADE','BCD','BCE','BDE','CDE']
        when 4 then array['ABCD','ABCE','ABDE','ACDE','BCDE']
        else array['ABCDE']
      end;
      v_pattern_min := 2147483647;
      v_pattern_max := 0;
      foreach v_combination in array v_combinations loop
        v_pattern_count := coalesce((v_pattern_counts->>v_combination)::integer, 0);
        v_pattern_min := least(v_pattern_min, v_pattern_count);
        v_pattern_max := greatest(v_pattern_max, v_pattern_count);
      end loop;
      if v_pattern_max - v_pattern_min > 1 then
        raise exception 'Cours % : profils de réponses déséquilibrés pour la cardinalité %', v_course_order, v_count;
      end if;
    end loop;
    select min(value), max(value) into v_letter_min, v_letter_max from unnest(v_letter_counts) as letters(value);
    if v_letter_max - v_letter_min > 2 then
      raise exception 'Cours % : lettres justes déséquilibrées (A %, B %, C %, D %, E %)',
        v_course_order, v_letter_counts[1], v_letter_counts[2], v_letter_counts[3], v_letter_counts[4], v_letter_counts[5];
    end if;
  end loop;

  return jsonb_build_object(
    'ready', true,
    'updated', not p_dry_run,
    'courses', jsonb_array_length(v_courses),
    'questions', 43 * 96,
    'items', 43 * 480,
    'preservedIdentifiers', true
  );
end;
$$;

revoke all on function public.rebalance_anesthesie_qcm(jsonb, boolean) from public, anon, authenticated;
grant execute on function public.rebalance_anesthesie_qcm(jsonb, boolean) to service_role;
