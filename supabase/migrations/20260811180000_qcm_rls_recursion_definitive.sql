-- ============================================================================
-- URGENCE 2026-08-11 — 404 à l'ouverture des dossiers progressifs et des QCM
-- ============================================================================
--
-- Cause racine : la policy RESTRICTIVE `qcm_series_entrainement_voie_restrict`
-- (posée par 20260811120000) doit connaître le format des questions d'une série
-- pour trancher sa voie. Or `qcm_questions_read` autorise une question en
-- remontant à sa série (`exists (select 1 from qcm_series …)`) : dès qu'une
-- policy de `qcm_series` redescend vers `qcm_questions`, le cycle est fermé et
-- PostgreSQL refuse TOUTE lecture élève avec 42P17 (« infinite recursion
-- detected in policy for relation … »). Les pages Next.js traduisaient l'erreur
-- en `notFound()` → 404 sur tous les DP et QCM.
--
-- Le correctif 20260811143000 déplaçait ce sous-SELECT dans une fonction
-- SECURITY DEFINER, mais restait un appel de `qcm_questions` depuis une policy
-- de `qcm_series` : dépendance fragile, et sans effet sur les environnements où
-- la première version (sous-SELECT en ligne) était déjà en place.
--
-- Correctif définitif : la voie d'une série est désormais une DONNÉE portée par
-- `qcm_series.allowed_voies`, pas un calcul fait à la lecture. On la remplit une
-- fois pour toutes, puis la policy n'interroge plus que ses propres colonnes.
-- Plus aucune policy de `qcm_series` ne touche `qcm_questions` : le cycle est
-- rompu, quel que soit l'état antérieur de la base.
--
-- Miroir applicatif de ces règles : src/lib/data/qcm-access.ts
-- ============================================================================

-- 1. Suppression de TOUTE policy de `qcm_series` qui redescend vers
--    `qcm_questions` — par nom connu, puis dynamiquement, car la version
--    déployée à la main en production peut porter un autre nom.
drop policy if exists qcm_series_entrainement_voie_restrict on public.qcm_series;

do $$
declare
  r record;
begin
  for r in
    select policyname
      from pg_policies
     where schemaname = 'public'
       and tablename = 'qcm_series'
       and (coalesce(qual, '') || coalesce(with_check, '')) like '%qcm_questions%'
  loop
    raise notice 'Policy récursive supprimée : %', r.policyname;
    execute format('drop policy if exists %I on public.qcm_series', r.policyname);
  end loop;
end
$$;

-- 2. Matérialisation de la voie des entraînements : QCM → interne, QROC →
--    externe, série vide → interne. Exactement la classification que faisait
--    `qcm_series_default_allowed_voies()` à chaque lecture.
--    Idempotent : ne touche que les lignes dont la voie n'est pas déjà fixée.
update public.qcm_series s
   set allowed_voies = case
         when exists (
           select 1 from public.qcm_questions q
            where q.serie_id = s.id and q.format = 'qcm'
         ) then array['interne']::text[]
         when exists (
           select 1 from public.qcm_questions q
            where q.serie_id = s.id and q.format = 'qroc'
         ) then array['externe']::text[]
         else array['interne']::text[]
       end
 where s.allowed_voies is null
   and s.label ~* 'entra[iî]nement';

-- 3. Policy rétablie, sans aucune référence à `qcm_questions`.
--    `(select …)` autour des fonctions : évaluation une fois par requête et non
--    une fois par ligne (même optimisation que 20260803120000).
create policy qcm_series_entrainement_voie_restrict
  on public.qcm_series
  as restrictive for select to public
  using (
    (select public."current_role"()) is distinct from 'student'
    or label !~* 'entra[iî]nement'
    or (
      (allowed_voies is null or (select public.current_voie()) = any(allowed_voies))
      and (allowed_offers is null or allowed_offers && (select public.current_offers()))
    )
  );

-- 4. Nouvelles séries « Entraînement » : la voie est fixée à l'insertion de la
--    première question, au lieu d'être recalculée à chaque lecture. Un trigger
--    s'exécute hors du moteur de policies : aucun risque de récursion.
create or replace function public.qcm_series_sync_entrainement_voie()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.qcm_series s
     set allowed_voies = case
           when new.format = 'qroc' then array['externe']::text[]
           else array['interne']::text[]
         end
   where s.id = new.serie_id
     and s.allowed_voies is null
     and s.label ~* 'entra[iî]nement';
  return new;
end
$$;

drop trigger if exists qcm_questions_set_entrainement_voie on public.qcm_questions;
create trigger qcm_questions_set_entrainement_voie
  after insert on public.qcm_questions
  for each row execute function public.qcm_series_sync_entrainement_voie();

-- 5. L'ancienne fonction n'a plus d'appelant : on la retire pour qu'aucune policy
--    future ne la réintroduise dans le cycle. Le bloc protège la migration si
--    un objet inconnu en dépend encore (mieux vaut la laisser en place que de
--    faire échouer le correctif).
do $$
begin
  drop function if exists public.qcm_series_default_allowed_voies(uuid);
exception when others then
  raise notice 'qcm_series_default_allowed_voies conservée : %', sqlerrm;
end
$$;

-- 6. Cohérence des séries importées (workflow d'import d'exercices, 20260811100000).
--    `publish_exercise_import` insère `type = 'qcm'` sans renseigner `kind` :
--    une série destinée à la voie externe restait donc invisible pour ces mêmes
--    élèves (`qcm_series_voie_restrict` : externe ⇒ kind = 'qroc'). On aligne
--    `kind` sur la voie ciblée, dans les données puis dans la fonction.
update public.qcm_series
   set kind = 'qroc'
 where kind is null
   and type = 'qcm'
   and allowed_voies = array['externe']::text[];

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
    values (v_serie, v_q->>'format', v_q->>'enonce', v_order, coalesce(v_letters, ''), nullif(v_q->>'correction_generale', ''), '[]'::jsonb)
    returning id into v_question;
    v_order := v_order + 1;
    if v_q->>'format' = 'qcm' then
      for v_item in select value from jsonb_array_elements(coalesce(v_q->'items', '[]'::jsonb)) loop
        insert into public.qcm_items (question_id, lettre, enonce, is_correct, justification, images)
        values (v_question, v_item->>'lettre', v_item->>'enonce', coalesce((v_item->>'is_correct')::boolean, false), coalesce(v_item->>'justification', ''), '[]'::jsonb);
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

-- 7. Garde-fou : vérifie qu'aucune policy de `qcm_series` ne cite encore
--    `qcm_questions`. Sans cela, une régression identique repasserait
--    silencieusement en production.
do $$
declare
  offending text;
begin
  select string_agg(policyname, ', ')
    into offending
    from pg_policies
   where schemaname = 'public'
     and tablename = 'qcm_series'
     and (coalesce(qual, '') || coalesce(with_check, ''))
         similar to '%(qcm_questions|qcm_series_default_allowed_voies)%';
  if offending is not null then
    raise exception
      'Policies de qcm_series référençant qcm_questions (récursion RLS 42P17) : %',
      offending;
  end if;
end
$$;
