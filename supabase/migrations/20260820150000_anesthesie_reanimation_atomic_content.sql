-- Étend la publication atomique aux banques QROC et DP QROC tout en restant
-- compatible avec les paquets historiques 8 QCM + 8 DP.

-- Garde de compatibilité : ces colonnes existent dans la base courante et dans
-- les types applicatifs, mais les anciens historiques de migration ne les
-- créaient pas tous explicitement. La migration reste ainsi rejouable sur une
-- base reconstruite depuis zéro.
alter table public.qcm_series
  add column if not exists vignette text;
alter table public.qcm_questions
  add column if not exists format text not null default 'qcm',
  add column if not exists reponse_attendue text,
  add column if not exists correction_generale text;
alter table public.fiches
  add column if not exists content_html text,
  add column if not exists content_format text;

create or replace function public.replace_cours_generated_content(
  p_cours_id uuid,
  p_payload jsonb,
  p_replace boolean default false
)
returns jsonb
language plpgsql
security definer
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
  v_label text;
  v_format text;
  v_family text;
  v_expected integer;
  v_correct integer;
  v_questions integer := 0;
  v_items integer := 0;
  v_flash integer;
  v_qcm integer;
  v_dp_qcm integer;
  v_qroc integer;
  v_dp_qroc integer;
  v_text text;
  v_allowed_voies text[];
begin
  if not exists (select 1 from public.cours where id = p_cours_id) then
    raise exception 'Cours inconnu : %', p_cours_id;
  end if;
  if jsonb_typeof(v_series) <> 'array' or jsonb_typeof(v_flashcards) <> 'array' then
    raise exception 'Le payload doit contenir deux tableaux : series et flashcards';
  end if;

  select
    count(*) filter (where coalesce(value->>'label', '') ~* '^QCM'),
    count(*) filter (where coalesce(value->>'label', '') ~* '^DP([[:space:]]+QCM)?[[:space:]]+[0-9]'),
    count(*) filter (where coalesce(value->>'label', '') ~* '^QROC'),
    count(*) filter (where coalesce(value->>'label', '') ~* '^DP[[:space:]]+QROC[[:space:]]+[0-9]')
  into v_qcm, v_dp_qcm, v_qroc, v_dp_qroc
  from jsonb_array_elements(v_series);
  v_flash := jsonb_array_length(v_flashcards);

  if v_thin then
    if v_qcm < 1 or v_qcm > 8 or v_dp_qcm > 8 or v_qroc > 8 or v_dp_qroc > 8 or v_flash < 100 or v_flash > 200 then
      raise exception 'Volume thin invalide : % QCM, % DP QCM, % QROC, % DP QROC, % flashcards', v_qcm, v_dp_qcm, v_qroc, v_dp_qroc, v_flash;
    end if;
  elsif not ((v_qcm = 8 and v_dp_qcm = 8 and v_qroc = 0 and v_dp_qroc = 0)
          or (v_qcm = 8 and v_dp_qcm = 8 and v_qroc = 8 and v_dp_qroc = 8))
        or v_flash < 100 or v_flash > 200 then
    raise exception 'Volume standard invalide : % QCM, % DP QCM, % QROC, % DP QROC, % flashcards', v_qcm, v_dp_qcm, v_qroc, v_dp_qroc, v_flash;
  end if;

  for v_series_entry, v_series_ordinal in
    select value, ordinality::integer from jsonb_array_elements(v_series) with ordinality
  loop
    v_label := coalesce(v_series_entry->>'label', '');
    v_family := case
      when v_label ~* '^DP[[:space:]]+QROC' then 'dp_qroc'
      when v_label ~* '^QROC' then 'qroc'
      when v_label ~* '^DP' then 'dp_qcm'
      when v_label ~* '^QCM' then 'qcm'
      else null
    end;
    if v_family is null or v_label ~* 'entra[iî]nement' then raise exception 'Libellé interdit ou inconnu : %', v_label; end if;
    v_expected := case when v_family in ('dp_qcm', 'dp_qroc') then 7 else 5 end;
    if jsonb_array_length(coalesce(v_series_entry->'questions', '[]'::jsonb)) <> v_expected then
      raise exception 'Série % : % questions requises', v_label, v_expected;
    end if;
    if v_family in ('dp_qcm', 'dp_qroc') and length(btrim(coalesce(v_series_entry->>'vignette', ''))) < 80 then
      raise exception 'DP sans vignette clinique suffisante : %', v_label;
    end if;
  end loop;

  if p_replace then
    delete from public.flashcards where cours_id = p_cours_id;
    -- Le paquet publié est la banque canonique complète du cours. Supprimer
    -- aussi les anciennes séries d'autres types évite de conserver des restes
    -- de pilotes/entraînements antérieurs qui rendraient la garde globale
    -- incohérente. L'instantané de staging contient ces lignes et permet leur
    -- restauration intégrale en cas d'échec.
    delete from public.qcm_series where cours_id = p_cours_id;
  elsif exists (select 1 from public.qcm_series where cours_id = p_cours_id)
     or exists (select 1 from public.flashcards where cours_id = p_cours_id) then
    raise exception 'Le cours contient déjà du contenu généré : utiliser p_replace=true après snapshot';
  end if;

  for v_series_entry, v_series_ordinal in
    select value, ordinality::integer from jsonb_array_elements(v_series) with ordinality
  loop
    v_label := v_series_entry->>'label';
    v_family := case when v_label ~* '^DP[[:space:]]+QROC' then 'dp_qroc' when v_label ~* '^QROC' then 'qroc' when v_label ~* '^DP' then 'dp_qcm' else 'qcm' end;
    v_allowed_voies := array(select jsonb_array_elements_text(coalesce(v_series_entry->'allowed_voies', case when v_family in ('qroc','dp_qroc') then '["externe"]'::jsonb else '["interne"]'::jsonb end)));
    insert into public.qcm_series (cours_id, type, kind, label, vignette, order_index, allowed_voies)
    values (p_cours_id, 'qcm', case when v_family in ('qroc','dp_qroc') then 'qroc' when v_family = 'dp_qcm' then 'dp' else 'qcm' end,
      v_label, nullif(v_series_entry->>'vignette', ''), v_series_ordinal, v_allowed_voies)
    returning id into v_serie_id;

    for v_question_entry, v_question_ordinal in
      select value, ordinality::integer from jsonb_array_elements(v_series_entry->'questions') with ordinality
    loop
      v_format := case when v_family in ('qroc','dp_qroc') then 'qroc' else 'qcm' end;
      v_text := regexp_replace(regexp_replace(coalesce(v_question_entry->>'enonce', ''), '<[^>]*>', ' ', 'g'), '[[:space:]]+', ' ', 'g');
      if length(btrim(v_text)) < 20 then raise exception 'Question % de % : énoncé insuffisant', v_question_ordinal, v_label; end if;
      if length(btrim(coalesce(v_question_entry->>'correction_generale', ''))) = 0 then raise exception 'Question % de % : correction absente', v_question_ordinal, v_label; end if;
      if v_format = 'qcm' then
        if jsonb_array_length(coalesce(v_question_entry->'items', '[]'::jsonb)) <> 5 then raise exception 'Question % de % : cinq items requis', v_question_ordinal, v_label; end if;
        select count(*) into v_correct from jsonb_array_elements(v_question_entry->'items') item where coalesce((item->>'is_correct')::boolean, false);
        if v_correct < 1 or v_correct > 5 then raise exception 'Question % de % : une à cinq réponses justes requises', v_question_ordinal, v_label; end if;
      else
        if jsonb_array_length(coalesce(v_question_entry->'items', '[]'::jsonb)) <> 0 then raise exception 'Question QROC % de % : aucun item permis', v_question_ordinal, v_label; end if;
        if length(btrim(coalesce(v_question_entry->>'reponse_attendue', ''))) = 0 then raise exception 'Question QROC % de % : réponse attendue absente', v_question_ordinal, v_label; end if;
      end if;

      insert into public.qcm_questions (serie_id, enonce, order_index, format, reponse_attendue, correction_generale)
      values (v_serie_id, v_text, v_question_ordinal, v_format,
        case when v_format = 'qroc' then v_question_entry->>'reponse_attendue' else null end,
        v_question_entry->>'correction_generale')
      returning id into v_question_id;
      v_questions := v_questions + 1;
      if v_format = 'qcm' then
        for v_item_entry in select value from jsonb_array_elements(v_question_entry->'items') loop
          if length(btrim(coalesce(v_item_entry->>'justification', ''))) = 0 then raise exception 'Item sans justification dans %', v_label; end if;
          insert into public.qcm_items (question_id, lettre, enonce, is_correct, justification)
          values (v_question_id, v_item_entry->>'lettre', v_item_entry->>'enonce', coalesce((v_item_entry->>'is_correct')::boolean, false), v_item_entry->>'justification');
          v_items := v_items + 1;
        end loop;
      end if;
    end loop;
  end loop;

  insert into public.flashcards (cours_id, recto, verso, order_index)
  select p_cours_id, value->>'recto', value->>'verso', ordinality::integer
  from jsonb_array_elements(v_flashcards) with ordinality;
  return jsonb_build_object('series', jsonb_array_length(v_series), 'questions', v_questions, 'items', v_items, 'flashcards', v_flash);
end;
$$;

revoke all on function public.replace_cours_generated_content(uuid, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.replace_cours_generated_content(uuid, jsonb, boolean) to service_role;
