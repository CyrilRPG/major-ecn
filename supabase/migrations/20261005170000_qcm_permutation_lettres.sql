-- Permutation des lettres des propositions de QCM, pour que chaque lettre ait
-- la même probabilité d'être juste (scripts/equilibrer-lettres-qcm.mjs).
--
-- Le contenu n'est jamais réécrit : chaque proposition garde son identifiant,
-- son énoncé, sa justification et sa valeur de vérité, seule sa lettre change.
-- Les traces qui désignent les propositions par leur lettre suivent la même
-- permutation dans la même transaction :
--   - qcm_attempts.selected_items (sessions web, mobile, planificateur) ;
--   - plan_evaluations.answers -> <question_id> -> selected ;
--   - qcm_audit_findings.lettre (recopiée depuis l'item, identifiant stable).
-- Les épreuves blanches, l'EVC Arena et l'EVC Check-up conservent leur propre
-- copie des propositions : leurs réponses ne sont pas concernées.
--
-- p_permutations : [{ "question_id": uuid, "lettres": { "A": "C", "B": "A", … } }]
-- Chaque permutation couvre exactement les lettres de la question, de A à E.

create or replace function public.permuter_lettres_qcm(p_permutations jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_questions integer;
  v_items integer;
  v_attempts integer;
  v_evaluations integer;
  v_findings integer;
begin
  if jsonb_typeof(p_permutations) <> 'array' then
    raise exception 'Permutations : tableau attendu';
  end if;

  create temp table _permutation (
    question_id uuid not null,
    ancienne text not null,
    nouvelle text not null,
    primary key (question_id, ancienne)
  ) on commit drop;

  insert into _permutation (question_id, ancienne, nouvelle)
  select (entry->>'question_id')::uuid, letters.key, letters.value
    from jsonb_array_elements(p_permutations) as entries(entry)
    cross join lateral jsonb_each_text(entry->'lettres') as letters(key, value);

  if exists (select 1 from _permutation where ancienne !~ '^[A-E]$' or nouvelle !~ '^[A-E]$') then
    raise exception 'Permutations : seules les lettres A à E sont permutables';
  end if;

  -- Chaque question : lettres de départ = lettres de ses propositions, et
  -- lettres d'arrivée = même ensemble (bijection).
  if exists (
    select 1
      from (select distinct question_id from _permutation) as questions
     where (select array_agg(i.lettre order by i.lettre) from public.qcm_items i where i.question_id = questions.question_id)
             is distinct from (select array_agg(p.ancienne order by p.ancienne) from _permutation p where p.question_id = questions.question_id)
        or (select array_agg(p.nouvelle order by p.nouvelle) from _permutation p where p.question_id = questions.question_id)
             is distinct from (select array_agg(p.ancienne order by p.ancienne) from _permutation p where p.question_id = questions.question_id)
  ) then
    raise exception 'Permutations : une permutation ne correspond pas aux propositions de sa question';
  end if;

  select count(distinct question_id) into v_questions from _permutation;

  -- La contrainte unique (question_id, lettre) n'est pas différable : on passe
  -- par des lettres temporaires F à J (A+5 … E+5), admises par la contrainte
  -- de lettres, puis on pose les lettres définitives.
  update public.qcm_items i
     set lettre = chr(ascii(i.lettre) + 5)
    from (select distinct question_id from _permutation) as questions
   where i.question_id = questions.question_id;

  update public.qcm_items i
     set lettre = p.nouvelle
    from _permutation p
   where i.question_id = p.question_id
     and i.lettre = chr(ascii(p.ancienne) + 5);
  get diagnostics v_items = row_count;

  update public.qcm_attempts a
     set selected_items = (
       select coalesce(jsonb_agg(to_jsonb(coalesce(p.nouvelle, picked.value)) order by coalesce(p.nouvelle, picked.value)), '[]'::jsonb)
         from jsonb_array_elements_text(a.selected_items) as picked(value)
         left join _permutation p on p.question_id = a.question_id and p.ancienne = picked.value
     )
   where a.question_id in (select distinct question_id from _permutation)
     and jsonb_typeof(a.selected_items) = 'array'
     and jsonb_array_length(a.selected_items) > 0;
  get diagnostics v_attempts = row_count;

  update public.plan_evaluations e
     set answers = (
       select jsonb_object_agg(
                answer.key,
                case
                  when jsonb_typeof(answer.value) = 'object'
                   and jsonb_typeof(answer.value->'selected') = 'array'
                   and exists (select 1 from _permutation p where p.question_id::text = answer.key)
                  then jsonb_set(answer.value, '{selected}', (
                    select coalesce(jsonb_agg(to_jsonb(coalesce(p.nouvelle, picked.value)) order by coalesce(p.nouvelle, picked.value)), '[]'::jsonb)
                      from jsonb_array_elements_text(answer.value->'selected') as picked(value)
                      left join _permutation p on p.question_id::text = answer.key and p.ancienne = picked.value
                  ))
                  else answer.value
                end)
         from jsonb_each(e.answers) as answer(key, value)
     )
   where jsonb_typeof(e.answers) = 'object'
     and exists (
       select 1 from jsonb_object_keys(e.answers) as keys(key)
         join (select distinct question_id from _permutation) as questions on questions.question_id::text = keys.key
     );
  get diagnostics v_evaluations = row_count;

  update public.qcm_audit_findings f
     set lettre = i.lettre
    from public.qcm_items i
   where f.item_id = i.id
     and f.question_id in (select distinct question_id from _permutation)
     and f.lettre is distinct from i.lettre;
  get diagnostics v_findings = row_count;

  return jsonb_build_object(
    'questions', v_questions,
    'items', v_items,
    'tentatives', v_attempts,
    'evaluations', v_evaluations,
    'constats', v_findings
  );
end;
$$;

revoke all on function public.permuter_lettres_qcm(jsonb) from public, anon, authenticated;
grant execute on function public.permuter_lettres_qcm(jsonb) to service_role;
