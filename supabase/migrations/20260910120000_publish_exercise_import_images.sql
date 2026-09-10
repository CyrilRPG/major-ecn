-- Publication d'un import d'exercices : les images du PDF (10/09/2026).
--
-- Jusqu'ici `publish_exercise_import` écrivait `images = '[]'::jsonb` en dur
-- sur chaque question et chaque proposition : l'outil /admin/import-exercices
-- ne tirait aucune image du PDF, le modèle les DÉCRIVAIT en texte
-- ({source_page, source_description, placement, item_letter}). Les élèves
-- recevaient des questions posées sur un document qu'ils ne voyaient pas
-- (12 documents cliniques perdus sur l'import Pédiatrie « REVISION GENERALE »).
--
-- Les images sont désormais découpées du PDF côté serveur, téléversées dans le
-- bucket public `qcm-images` (imports/<import>/p<page>-<n>.png) et leurs URL
-- écrites dans `result.questions[].images` / `result.questions[].items[].images`.
-- La fonction lit ces tableaux : une chaîne (l'URL nue) ou un objet {url}.
-- Les descriptions du modèle (objets sans `url`) sont ignorées sans erreur, ce
-- qui laisse les imports antérieurs se publier exactement comme avant.
--
-- Même signature, même comportement transactionnel et idempotent (cf.
-- 20260811180000_qcm_rls_recursion_definitive.sql §6) ; seules les deux
-- colonnes `images` changent de source.

-- 1. Normalisation d'un tableau d'images du JSON d'import en tableau d'URL.
create or replace function public.exercise_import_images_urls(p_images jsonb)
returns jsonb language sql immutable as $$
  select coalesce(jsonb_agg(u), '[]'::jsonb)
  from (
    select case
             when jsonb_typeof(e) = 'string' then e
             when jsonb_typeof(e) = 'object' and jsonb_typeof(e->'url') = 'string' then e->'url'
           end as u
    from jsonb_array_elements(case when jsonb_typeof(p_images) = 'array' then p_images else '[]'::jsonb end) as e
  ) s
  where u is not null and btrim(u #>> '{}') <> '';
$$;

comment on function public.exercise_import_images_urls(jsonb) is
  'Tableau d''URL (jsonb) à partir des images d''un import d''exercices : chaînes ou objets {url} ; le reste est ignoré.';

-- 2. La fonction de publication lit les images de chaque question et de
--    chaque proposition.
create or replace function public.publish_exercise_import(p_import_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_import public.exercise_imports%rowtype;
  v_serie uuid;
  v_question uuid;
  v_q jsonb;
  v_item jsonb;
  v_order integer := 0;
  v_letters text;
begin
  select * into v_import from public.exercise_imports where id = p_import_id for update;
  if not found then raise exception 'Import introuvable'; end if;
  if v_import.status = 'published' and v_import.published_serie_id is not null then return v_import.published_serie_id; end if;
  if v_import.status <> 'ready' then raise exception 'Cet import ne peut pas être publié'; end if;

  update public.exercise_imports set status = 'publishing', updated_at = now() where id = p_import_id;
  insert into public.qcm_series (cours_id, type, kind, label, order_index, allowed_voies, allowed_offers)
  values (
    v_import.cours_id, 'qcm',
    -- `kind` tranche QCM/QROC pour la voie de l'élève : sans lui, un import
    -- « voie externe » serait masqué aux élèves externes.
    case when v_import.voie = 'externe' then 'qroc' else 'qcm' end,
    v_import.title,
    coalesce((select max(order_index) + 1 from public.qcm_series where cours_id = v_import.cours_id and type = 'qcm'), 0),
    array[v_import.voie], v_import.allowed_offers
  ) returning id into v_serie;

  for v_q in select value from jsonb_array_elements(coalesce(v_import.result->'questions', '[]'::jsonb)) loop
    if v_q->>'format' = 'qcm' then
      select string_agg(value->>'lettre', '' order by value->>'lettre') into v_letters
      from jsonb_array_elements(coalesce(v_q->'items', '[]'::jsonb)) where coalesce((value->>'is_correct')::boolean, false);
    else
      v_letters := v_q->>'reponse_attendue';
    end if;
    insert into public.qcm_questions (serie_id, format, enonce, order_index, reponse_attendue, correction_generale, images)
    values (
      v_serie, v_q->>'format', v_q->>'enonce', v_order, coalesce(v_letters, ''), nullif(v_q->>'correction_generale', ''),
      public.exercise_import_images_urls(coalesce(v_q->'images', '[]'::jsonb))
    )
    returning id into v_question;
    v_order := v_order + 1;
    if v_q->>'format' = 'qcm' then
      for v_item in select value from jsonb_array_elements(coalesce(v_q->'items', '[]'::jsonb)) loop
        insert into public.qcm_items (question_id, lettre, enonce, is_correct, justification, images)
        values (
          v_question, v_item->>'lettre', v_item->>'enonce', coalesce((v_item->>'is_correct')::boolean, false), coalesce(v_item->>'justification', ''),
          public.exercise_import_images_urls(coalesce(v_item->'images', '[]'::jsonb))
        );
      end loop;
    end if;
  end loop;

  update public.exercise_imports
  set status = 'published', published_serie_id = v_serie, published_at = now(), updated_at = now()
  where id = p_import_id;
  return v_serie;
exception when others then
  update public.exercise_imports set status = 'ready', updated_at = now() where id = p_import_id;
  raise;
end;
$$;

-- 3. Vérification à coller après application :
--   select public.exercise_import_images_urls('[{"url":"https://a/1.png"},"https://a/2.png",{"source_page":3,"placement":"question"},"",null]'::jsonb);
--   → ["https://a/1.png", "https://a/2.png"]
