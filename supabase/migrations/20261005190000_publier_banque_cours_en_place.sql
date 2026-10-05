-- Remplace EN PLACE la banque générée d'un cours (16 séries : 8 QCM de 5
-- questions et 8 DP de 7 questions, 5 propositions A-E) et ses flashcards.
--
-- replace_cours_generated_content supprime puis réinsère : les identifiants
-- changent et tout ce qui pointe vers les questions part en cascade (favoris,
-- étiquettes du planificateur, empreintes, constats d'audit, tentatives).
-- Ici, chaque série, question et proposition garde son identifiant ; seul
-- le contenu est réécrit, dans une transaction unique. Les questions sont
-- datées (updated_at) pour que question_fingerprint_refresh recalcule leur
-- empreinte, et les constats d'audit encore ouverts sur l'ancien contenu
-- sont clos (« corrige_manuellement »).
--
-- Flashcards : les cartes existantes sont réécrites dans l'ordre, les
-- surnuméraires supprimées, les manquantes ajoutées.
--
-- p_payload : { "series": [16 × { label, kind, vignette?, questions: [
--   { enonce, correction_generale, items: [5 × { lettre, enonce, is_correct, justification }] } ] }],
--   "flashcards": [{ recto, verso }] }
-- p_dry_run (défaut) : contrôle payload et structure distante, n'écrit rien.

create or replace function public.publier_banque_cours_en_place(
  p_cours_id uuid,
  p_payload jsonb,
  p_dry_run boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_series jsonb := coalesce(p_payload->'series', '[]'::jsonb);
  v_flash jsonb := coalesce(p_payload->'flashcards', '[]'::jsonb);
  v_serie jsonb;
  v_question jsonb;
  v_item jsonb;
  v_serie_ordinal integer;
  v_question_ordinal integer;
  v_item_ordinal integer;
  v_dp boolean;
  v_attendu integer;
  v_serie_id uuid;
  v_question_id uuid;
  v_ids uuid[];
  v_count integer;
  v_questions integer := 0;
  v_items integer := 0;
  v_flash_old integer;
  v_flash_new integer;
  v_constats integer := 0;
begin
  if not exists (select 1 from public.cours where id = p_cours_id) then
    raise exception 'Cours inconnu : %', p_cours_id;
  end if;
  if jsonb_typeof(v_series) <> 'array' or jsonb_array_length(v_series) <> 16 then
    raise exception 'Banque refusée : 16 séries attendues';
  end if;
  v_flash_new := jsonb_array_length(v_flash);
  if jsonb_typeof(v_flash) <> 'array' or v_flash_new < 100 or v_flash_new > 200 then
    raise exception 'Banque refusée : 100 à 200 flashcards attendues (%)', v_flash_new;
  end if;
  if exists (
    select 1 from jsonb_array_elements(v_flash) as cards(card)
     where btrim(coalesce(card->>'recto', '')) = '' or btrim(coalesce(card->>'verso', '')) = ''
  ) then
    raise exception 'Banque refusée : flashcard vide';
  end if;

  -- Structure distante : 16 séries QCM numérotées 1 à 16.
  select array_agg(id order by order_index), count(*)
    into v_ids, v_count
    from public.qcm_series
   where cours_id = p_cours_id and type = 'qcm';
  if v_count <> 16 then
    raise exception 'Structure distante inattendue : % séries QCM', v_count;
  end if;

  -- Contrôle complet avant toute écriture.
  for v_serie, v_serie_ordinal in
    select value, ordinality::integer from jsonb_array_elements(v_series) with ordinality
  loop
    v_dp := v_serie_ordinal > 8;
    v_attendu := case when v_dp then 7 else 5 end;
    if coalesce(v_serie->>'label', '') !~ ('^' || case when v_dp then 'DP ' || (v_serie_ordinal - 8) else 'QCM ' || v_serie_ordinal end || ' — ') then
      raise exception 'Série % : libellé inattendu (%)', v_serie_ordinal, v_serie->>'label';
    end if;
    if v_dp and length(btrim(coalesce(v_serie->>'vignette', ''))) < 180 then
      raise exception 'Série % : vignette de DP insuffisante', v_serie_ordinal;
    end if;
    if jsonb_array_length(coalesce(v_serie->'questions', '[]'::jsonb)) <> v_attendu then
      raise exception 'Série % : % questions attendues', v_serie_ordinal, v_attendu;
    end if;
    select count(*) into v_count from public.qcm_questions where serie_id = v_ids[v_serie_ordinal];
    if v_count <> v_attendu then
      raise exception 'Série distante % : % questions au lieu de %', v_serie_ordinal, v_count, v_attendu;
    end if;
    for v_question, v_question_ordinal in
      select value, ordinality::integer from jsonb_array_elements(v_serie->'questions') with ordinality
    loop
      if length(btrim(coalesce(v_question->>'enonce', ''))) < 20
         or length(btrim(coalesce(v_question->>'correction_generale', ''))) < 40 then
        raise exception 'Série %, Q% : énoncé ou correction insuffisant', v_serie_ordinal, v_question_ordinal;
      end if;
      if jsonb_array_length(coalesce(v_question->'items', '[]'::jsonb)) <> 5 then
        raise exception 'Série %, Q% : 5 propositions attendues', v_serie_ordinal, v_question_ordinal;
      end if;
      if not exists (select 1 from jsonb_array_elements(v_question->'items') as items(item) where (item->>'is_correct')::boolean) then
        raise exception 'Série %, Q% : aucune réponse juste', v_serie_ordinal, v_question_ordinal;
      end if;
      for v_item, v_item_ordinal in
        select value, ordinality::integer from jsonb_array_elements(v_question->'items') with ordinality
      loop
        if v_item->>'lettre' is distinct from substr('ABCDE', v_item_ordinal, 1)
           or length(btrim(coalesce(v_item->>'enonce', ''))) = 0
           or length(btrim(coalesce(v_item->>'justification', ''))) = 0
           or jsonb_typeof(v_item->'is_correct') <> 'boolean' then
          raise exception 'Série %, Q%, proposition % invalide', v_serie_ordinal, v_question_ordinal, v_item_ordinal;
        end if;
      end loop;
      select id into v_question_id from public.qcm_questions
       where serie_id = v_ids[v_serie_ordinal] order by order_index, id offset v_question_ordinal - 1 limit 1;
      if (select string_agg(lettre, '' order by lettre) from public.qcm_items where question_id = v_question_id) is distinct from 'ABCDE' then
        raise exception 'Série distante %, Q% : propositions A-E attendues', v_serie_ordinal, v_question_ordinal;
      end if;
    end loop;
  end loop;

  if p_dry_run then
    return jsonb_build_object('pret', true, 'series', 16, 'flashcards', v_flash_new);
  end if;

  for v_serie, v_serie_ordinal in
    select value, ordinality::integer from jsonb_array_elements(v_series) with ordinality
  loop
    v_serie_id := v_ids[v_serie_ordinal];
    update public.qcm_series
       set label = v_serie->>'label',
           vignette = case when v_serie_ordinal > 8 then v_serie->>'vignette' else null end,
           kind = case when v_serie_ordinal > 8 then 'dp' else 'qcm' end
     where id = v_serie_id;
    for v_question, v_question_ordinal in
      select value, ordinality::integer from jsonb_array_elements(v_serie->'questions') with ordinality
    loop
      select id into v_question_id from public.qcm_questions
       where serie_id = v_serie_id order by order_index, id offset v_question_ordinal - 1 limit 1;
      update public.qcm_questions
         set enonce = v_question->>'enonce',
             correction_generale = v_question->>'correction_generale',
             reponse_attendue = null,
             format = 'qcm',
             -- Images et commentaire portaient sur l'ancien contenu.
             images = '[]'::jsonb,
             commentaire_enseignant = null,
             updated_at = now()
       where id = v_question_id;
      v_questions := v_questions + 1;
      for v_item in select value from jsonb_array_elements(v_question->'items')
      loop
        update public.qcm_items
           set enonce = v_item->>'enonce',
               is_correct = (v_item->>'is_correct')::boolean,
               justification = v_item->>'justification',
               images = '[]'::jsonb
         where question_id = v_question_id and lettre = v_item->>'lettre';
        v_items := v_items + 1;
      end loop;
    end loop;
  end loop;

  update public.qcm_audit_findings f
     set statut = 'corrige_manuellement', resolved_at = now()
    from public.qcm_questions q
    join public.qcm_series s on s.id = q.serie_id
   where f.question_id = q.id and s.cours_id = p_cours_id and s.type = 'qcm' and f.statut = 'ouvert';
  get diagnostics v_constats = row_count;

  -- Flashcards : réécriture dans l'ordre, ajout ou suppression du reliquat.
  create temp table _cartes_existantes on commit drop as
    select id, row_number() over (order by order_index, id) as rang
      from public.flashcards where cours_id = p_cours_id;
  select count(*) into v_flash_old from _cartes_existantes;
  update public.flashcards f
     set recto = cards.card->>'recto', verso = cards.card->>'verso', order_index = cards.rang
    from (select value as card, ordinality::integer as rang from jsonb_array_elements(v_flash) with ordinality) cards
    join _cartes_existantes e on e.rang = cards.rang
   where f.id = e.id;
  insert into public.flashcards (cours_id, recto, verso, order_index)
  select p_cours_id, value->>'recto', value->>'verso', ordinality::integer
    from jsonb_array_elements(v_flash) with ordinality
   where ordinality > v_flash_old;
  delete from public.flashcards f using _cartes_existantes e
   where f.id = e.id and e.rang > v_flash_new;

  return jsonb_build_object(
    'series', 16, 'questions', v_questions, 'items', v_items,
    'flashcards_avant', v_flash_old, 'flashcards', v_flash_new, 'constats_clos', v_constats
  );
end;
$$;

revoke all on function public.publier_banque_cours_en_place(uuid, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.publier_banque_cours_en_place(uuid, jsonb, boolean) to service_role;
