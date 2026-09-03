-- Les DP progressifs restent obligatoires. L'ancien contrôle imposait
-- littéralement « Nouvel élément », ce qui exposait une étiquette de
-- fabrication à l'étudiant. Il vérifie désormais seulement une étape non vide.

create or replace function public.replace_cours_generated_content(
  p_cours_id uuid,
  p_payload jsonb,
  p_replace boolean default false
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_series jsonb := coalesce(p_payload->'series', '[]'::jsonb);
  v_flashcards jsonb := coalesce(p_payload->'flashcards', '[]'::jsonb);
  v_thin boolean := coalesce((p_payload->>'thin')::boolean, false);
  v_series_entry jsonb;
  v_question_entry jsonb;
  v_item_entry jsonb;
  v_serie_id uuid;
  v_question_id uuid;
  v_series_ordinal integer;
  v_question_ordinal integer;
  v_qcm integer;
  v_dp integer;
  v_questions integer := 0;
  v_items integer := 0;
  v_flash integer;
  v_text text;
begin
  if not exists (select 1 from public.cours where id = p_cours_id) then
    raise exception 'Cours inconnu : %', p_cours_id;
  end if;
  if jsonb_typeof(v_series) <> 'array' or jsonb_typeof(v_flashcards) <> 'array' then
    raise exception 'Le payload doit contenir deux tableaux : series et flashcards';
  end if;

  select count(*) filter (where coalesce(value->>'label', '') ~* '^QCM'),
         count(*) filter (where coalesce(value->>'label', '') ~* '^DP[[:space:]]+[0-9]')
    into v_qcm, v_dp
    from jsonb_array_elements(v_series);
  v_flash := jsonb_array_length(v_flashcards);
  if v_thin then
    if v_qcm < 1 or v_qcm > 8 or v_dp > 8 or v_flash < 100 or v_flash > 200 then
      raise exception 'Volume thin invalide : % QCM, % DP, % flashcards', v_qcm, v_dp, v_flash;
    end if;
  elsif v_qcm <> 8 or v_dp <> 8 or v_flash < 100 or v_flash > 200 then
    raise exception 'Volume standard invalide : % QCM, % DP, % flashcards', v_qcm, v_dp, v_flash;
  end if;

  for v_series_entry, v_series_ordinal in
    select value, ordinality::integer from jsonb_array_elements(v_series) with ordinality
  loop
    if coalesce(v_series_entry->>'label', '') ~* 'entra[iî]nement' then
      raise exception 'Libellé interdit : %', v_series_entry->>'label';
    end if;
    if coalesce(v_series_entry->>'label', '') ~* '^DP[[:space:]]+[0-9]' and coalesce(v_series_entry->>'vignette', '') = '' then
      raise exception 'DP sans vignette : %', v_series_entry->>'label';
    end if;
    if jsonb_array_length(coalesce(v_series_entry->'questions', '[]'::jsonb)) < 5 then
      raise exception 'Série trop courte : %', v_series_entry->>'label';
    end if;
  end loop;

  if p_replace then
    delete from public.flashcards where cours_id = p_cours_id;
    delete from public.qcm_series where cours_id = p_cours_id and type = 'qcm';
  elsif exists (select 1 from public.qcm_series where cours_id = p_cours_id and type = 'qcm')
     or exists (select 1 from public.flashcards where cours_id = p_cours_id) then
    raise exception 'Le cours contient déjà du contenu généré : utiliser p_replace=true après snapshot';
  end if;

  for v_series_entry, v_series_ordinal in
    select value, ordinality::integer from jsonb_array_elements(v_series) with ordinality
  loop
    insert into public.qcm_series (cours_id, type, kind, label, vignette, order_index)
    values (
      p_cours_id,
      'qcm',
      case when coalesce(v_series_entry->>'label', '') ~* '^DP[[:space:]]+[0-9]' then 'dp' else 'qcm' end,
      v_series_entry->>'label',
      nullif(v_series_entry->>'vignette', ''),
      v_series_ordinal
    ) returning id into v_serie_id;

    for v_question_entry, v_question_ordinal in
      select value, ordinality::integer from jsonb_array_elements(v_series_entry->'questions') with ordinality
    loop
      if jsonb_array_length(coalesce(v_question_entry->'items', '[]'::jsonb)) <> 5 then
        raise exception 'Question % de « % » : 5 items requis', v_question_ordinal, v_series_entry->>'label';
      end if;
      if not exists (select 1 from jsonb_array_elements(v_question_entry->'items') item where coalesce((item->>'is_correct')::boolean, false)) then
        raise exception 'Question % de « % » : aucune réponse juste', v_question_ordinal, v_series_entry->>'label';
      end if;

      v_text := regexp_replace(regexp_replace(coalesce(v_question_entry->>'enonce', ''), '<[^>]*>', ' ', 'g'), '[[:space:]]+', ' ', 'g');
      if coalesce(v_series_entry->>'label', '') ~* '^DP[[:space:]]+[0-9]'
         and v_question_ordinal between 2 and 7
         and length(btrim(v_text)) = 0 then
        raise exception 'DP « % », question % sans étape clinique', v_series_entry->>'label', v_question_ordinal;
      end if;

      insert into public.qcm_questions (serie_id, enonce, order_index, format, reponse_attendue, correction_generale)
      values (v_serie_id, v_text, v_question_ordinal, 'qcm', null, nullif(v_question_entry->>'correction_generale', ''))
      returning id into v_question_id;
      v_questions := v_questions + 1;
      for v_item_entry in select value from jsonb_array_elements(v_question_entry->'items')
      loop
        insert into public.qcm_items (question_id, lettre, enonce, is_correct, justification)
        values (v_question_id, v_item_entry->>'lettre', v_item_entry->>'enonce', coalesce((v_item_entry->>'is_correct')::boolean, false), coalesce(v_item_entry->>'justification', ''));
        v_items := v_items + 1;
      end loop;
    end loop;
  end loop;

  insert into public.flashcards (cours_id, recto, verso, order_index)
  select p_cours_id, value->>'recto', value->>'verso', ordinality::integer
  from jsonb_array_elements(v_flashcards) with ordinality;
  return jsonb_build_object('series', jsonb_array_length(v_series), 'questions', v_questions, 'items', v_items, 'flashcards', v_flash);
end;
$$;
