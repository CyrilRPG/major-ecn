-- =====================================================================
-- Planificateur V4.1 — alignement sur le MOTEUR PÉDAGOGIQUE CENTRAL.
-- ---------------------------------------------------------------------
-- La première version de 20261005140000 (appliquée le 05/10/2026 vers 18 h)
-- donnait au planificateur ses propres signaux, besoins, erreurs, Check-up et
-- statuts de maîtrise. Le moteur central (Orchestrateur V1.0, migrations
-- 20261005100000 → 100500) les tient de façon UNIQUE pour toute la
-- plateforme ; le CDC V4.1 §9 impose que « le CDC Orchestrateur prévaut » et
-- que le planificateur n'en contienne aucune copie. Cette migration ramène la
-- base au schéma final de 20261005140000 :
--  - suppression des tables plan_signals, plan_needs, plan_errors,
--    plan_checkups, plan_question_competencies — UNIQUEMENT si elles sont
--    vides (elles l'étaient à la création de cette migration) ;
--  - plan_item_states ne garde que les données propres au planificateur ;
--  - plan_activities : besoins centraux et champs de report / annulation.
-- Sans risque à relancer.
-- =====================================================================

-- Protection de l'historique : sans plan_signals (retirée ci-dessous).
create or replace function public.plan_items_protect_history()
returns trigger
language plpgsql
as $$
begin
  if exists (select 1 from public.plan_sessions where item_id = old.id and status in ('terminee','en_cours'))
     or exists (select 1 from public.plan_evaluations where item_id = old.id and completed_at is not null)
     or exists (select 1 from public.plan_mastery where item_id = old.id
                  and (activity_count > 0 or time_spent_minutes > 0 or results_count > 0 or reactivation_count > 0 or learning_minutes_done > 0))
     or exists (select 1 from public.plan_activities where item_id = old.id and status in ('IN_PROGRESS','PARTIALLY_COMPLETED','COMPLETED'))
  then
    raise exception 'Item « % » : du travail d''élève y est rattaché. Retirez-le de la matrice au lieu de le supprimer.', old.nom_item
      using errcode = 'P0001';
  end if;
  return old;
end;
$$;

-- plan_activities : besoins du moteur central, report et annulation motivés.
alter table public.plan_activities drop column if exists need_id;
alter table public.plan_activities add column if not exists central_need_ids uuid[] not null default '{}';
alter table public.plan_activities add column if not exists defer_reason text;
alter table public.plan_activities add column if not exists defer_comment text;
alter table public.plan_activities add column if not exists deferred_to date;
alter table public.plan_activities add column if not exists cancel_reason text;
alter table public.plan_activities add column if not exists cancel_comment text;
alter table public.plan_activities add column if not exists pinned boolean not null default false;
alter table public.plan_activities add column if not exists short_version boolean not null default false;

-- Tables de maîtrise locales : retirées si vides.
do $$
declare t text; n bigint;
begin
  foreach t in array array['plan_signals','plan_needs','plan_errors','plan_checkups','plan_question_competencies']
  loop
    if to_regclass('public.' || t) is not null then
      execute format('select count(*) from public.%I', t) into n;
      if n = 0 then
        execute format('drop table public.%I', t);
      else
        raise notice 'Table % non vide (% lignes) : conservée.', t, n;
      end if;
    end if;
  end loop;
end $$;

-- Compétences par item : retirées (la couverture est l'affaire du moteur central).
alter table public.plan_items drop column if exists competencies;
alter table public.plan_items drop column if exists competencies_source;

-- plan_item_states : seulement ce qui appartient au planificateur.
alter table public.plan_item_states
  drop column if exists level_source,
  drop column if exists mastery_status,
  drop column if exists mastery_score,
  drop column if exists mastery_confidence,
  drop column if exists assessment_coverage,
  drop column if exists competency_coverage_json,
  drop column if exists last_result,
  drop column if exists last_result_source,
  drop column if exists last_activity_at,
  drop column if exists next_review_at,
  drop column if exists positive_count,
  drop column if exists partial_count,
  drop column if exists negative_count,
  drop column if exists consecutive_successes,
  drop column if exists consecutive_failures,
  drop column if exists recent_error_at,
  drop column if exists mastery_confirmed_at,
  drop column if exists exploitable_count,
  drop column if exists successful_retrievals,
  drop column if exists target_tags,
  drop column if exists chain_step;
alter table public.plan_item_states add column if not exists learn_minutes_done int not null default 0;
alter table public.plan_item_states add column if not exists excluded_at timestamptz;
alter table public.plan_item_states add column if not exists excluded_reason text;
alter table public.plan_item_states add column if not exists excluded_comment text;
alter table public.plan_item_states add column if not exists short_version boolean not null default false;
alter table public.plan_item_states add column if not exists difficulty_at timestamptz;
alter table public.plan_item_states add column if not exists difficulty_count int not null default 0;
