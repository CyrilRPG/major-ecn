-- =====================================================================
-- Planificateur V4.1 — qualification des 42 coachings existants du Parcours
-- du Major (§23-§27). Un coaching est une RESSOURCE, jamais un item : il peut
-- avoir 0, 1 ou plusieurs items ; un coaching méthodologique n'en a aucun ; un
-- coaching mixte est découpé en blocs (cours, cas clinique, QCM, correction),
-- chacun avec ses propres items — le coaching n'hérite pas des items du cas.
-- Les rattachements sont résolus par le nom de l'item dans la matrice MG
-- (corrigeables au back-office). Ne modifie jamais une qualification déjà
-- faite à la main (qualified_at non nul). Sans risque à relancer.
-- =====================================================================

create or replace function pg_temp.mg_items(names text[]) returns uuid[] language sql stable as $$
  select coalesce(array_agg(i.id order by i.nom_item), '{}')
    from public.plan_items i
    join public.matieres m on m.id = i.specialite_id
   where (m.id = 'col-medecine-generale' or m.parent_matiere_id = 'col-medecine-generale')
     and i.nom_item = any(names)
$$;

with taxonomy(numero, primary_type, secondary_types, linked, related, functions, ie, phase, prio, can_replace) as (values
  (1,  'methodologie', '{}'::text[], '{}'::text[], '{}'::text[], '{METHODOLOGY}'::text[], 'mixte', 'debut', 4, false),
  (2,  'methodologie', '{}', '{}', '{}', '{METHODOLOGY}', 'mixte', 'debut', 4, false),
  (3,  'methodologie', '{cas_clinique}', '{}', '{}', '{METHODOLOGY}', 'mixte', 'debut', 4, false),
  (4,  'methodologie', '{}', '{}', '{}', '{METHODOLOGY}', 'interne', 'debut', 4, false),
  (5,  'methodologie', '{}', '{}', '{}', '{METHODOLOGY}', 'externe', 'debut', 4, false),
  (6,  'methodologie', '{}', '{}', '{}', '{METHODOLOGY}', 'externe', 'debut', 4, false),
  (7,  'connaissance', '{cas_clinique}', '{"Sémiologie et urgences respiratoires"}', '{"Asthme","BPCO","Pneumonies aiguës de l''adulte"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (8,  'imagerie', '{cas_clinique}', '{"Imagerie et EFR"}', '{"Pneumonies aiguës de l''adulte","Épanchement pleural et pneumothorax"}', '{LEARN,CONSOLIDATE,EXAM_PRACTICE}', 'mixte', 'toutes', 3, true),
  (9,  'outil_transversal', '{cas_clinique}', '{"Désordres de l''équilibre acide-base"}', '{"Détresse respiratoire aiguë et SDRA","BPCO","Troubles hydroélectrolytiques"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (10, 'outil_transversal', '{cas_clinique}', '{"Hémogramme et interprétation"}', '{"Thrombopénie","Anémies : orientation diagnostique"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (11, 'connaissance', '{cas_clinique}', '{"Anémies : orientation diagnostique","Anémie et carence martiale"}', '{"Hémogramme et interprétation"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (12, 'connaissance', '{cas_clinique}', '{"Myélome multiple"}', '{}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (13, 'connaissance', '{cas_clinique}', '{"Thrombopénie","Prescription et surveillance des anticoagulants"}', '{"Purpuras"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (14, 'connaissance', '{cas_clinique}', '{"Diabète de type 2 et complications"}', '{"Diabète de type 1"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (15, 'connaissance', '{cas_clinique}', '{"Diabète de type 1"}', '{"Désordres de l''équilibre acide-base"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (16, 'connaissance', '{}', '{"Syndrome de Cushing et insuffisance surrénale","Hypothyroïdie","Hyperthyroïdie"}', '{}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (17, 'connaissance', '{cas_clinique}', '{"Urgences et pathologies fonctionnelles digestives"}', '{"Pathologie biliaire et pancréatique"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (18, 'connaissance', '{cas_clinique}', '{"Pathologie gastro-duodénale et RGO"}', '{}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (19, 'imagerie', '{outil_transversal}', '{}', '{}', '{}', 'mixte', 'toutes', 3, false),
  (20, 'connaissance', '{cas_clinique}', '{"Addictions et alcoolisme"}', '{"Cirrhose"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (21, 'connaissance', '{cas_clinique}', '{}', '{"Prurit","Purpuras","Urticaire","Psoriasis"}', '{}', 'mixte', 'toutes', 3, false),
  (22, 'outil_transversal', '{prescription}', '{"Méthodologie de la prescription"}', '{"Diurétiques","Inhibiteurs du SRAA","Hypolipémiants et risque cardiovasculaire","Anti-inflammatoires et immunosuppresseurs"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (23, 'connaissance', '{prescription,cas_clinique}', '{"Douleur et thérapeutiques antalgiques"}', '{}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (24, 'prescription', '{cas_clinique}', '{"Douleur et thérapeutiques antalgiques"}', '{}', '{CONSOLIDATE,EXAM_PRACTICE}', 'mixte', 'toutes', 3, true),
  (25, 'connaissance', '{cas_clinique}', '{"Insuffisance rénale aiguë"}', '{"Néphropathies spécifiques et iatrogénie"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (26, 'connaissance', '{cas_clinique}', '{"Néphropathies glomérulaires","Rappels physiologiques et outils diagnostiques"}', '{"Néphropathies spécifiques et iatrogénie"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (27, 'connaissance', '{cas_clinique}', '{"HTA secondaire endocrine et hypoglycémie","Hypertension artérielle"}', '{}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (28, 'outil_transversal', '{connaissance,cas_clinique}', '{"Personne âgée malade et fragilité","Autonomie et dépendance"}', '{"Démences et maladie d''Alzheimer","Troubles de la marche et chutes du sujet âgé","Dénutrition du sujet âgé"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (29, 'connaissance', '{cas_clinique}', '{"Angor d''effort","Syndromes coronariens aigus"}', '{}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (30, 'prescription', '{cas_clinique}', '{"Méthodologie de la prescription"}', '{}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (31, 'prescription', '{}', '{}', '{}', '{}', 'mixte', 'toutes', 3, false),
  (32, 'prescription', '{}', '{}', '{}', '{}', 'mixte', 'toutes', 3, false),
  (33, 'connaissance', '{prescription,cas_clinique}', '{"Psychotropes et TCA"}', '{}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (34, 'connaissance', '{cas_clinique}', '{"Fibrillation atriale"}', '{}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (35, 'methodologie', '{}', '{}', '{}', '{METHODOLOGY}', 'externe', 'toutes', 4, false),
  (36, 'methodologie', '{}', '{}', '{}', '{METHODOLOGY}', 'interne', 'toutes', 4, false),
  (37, 'outil_transversal', '{}', '{}', '{"Hémogramme et interprétation","Troubles hydroélectrolytiques"}', '{}', 'mixte', 'toutes', 3, false),
  (38, 'outil_transversal', '{}', '{}', '{"Infections urinaires","Néphropathies glomérulaires","Maladie rénale chronique"}', '{}', 'mixte', 'toutes', 3, false),
  (39, 'outil_transversal', '{cas_clinique}', '{"Méningites et méningo-encéphalites"}', '{"Méningites bactériennes de l''enfant"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (40, 'methodologie', '{cas_clinique}', '{}', '{}', '{METHODOLOGY}', 'mixte', 'toutes', 4, false),
  (41, 'prevention', '{cas_clinique}', '{"Vaccinations","Vaccinations de l''enfant"}', '{}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true),
  (42, 'mixte', '{prevention,cas_clinique}', '{"Vaccinations"}', '{"Maladie de Horton et PPR","Artérite à cellules géantes et PPR"}', '{LEARN,CONSOLIDATE}', 'mixte', 'toutes', 3, true)
),
questions as (
  select q.parcours_id, q.section, count(*) as n, array_agg(q.id order by q.ordre) as ids
    from public.major_parcours_questions q group by q.parcours_id, q.section
)
insert into public.plan_coachings (parcours_id, speciality_id, numero, title, primary_type, secondary_types, linked_item_ids, related_item_ids,
                                   learning_functions, internal_external, estimated_duration_minutes, recommended_phase, editorial_priority,
                                   can_be_planned, can_replace_activity, produces_mastery_signal, is_featured, active)
select p.id, 'col-medecine-generale', p.numero, p.titre, t.primary_type, t.secondary_types, pg_temp.mg_items(t.linked), pg_temp.mg_items(t.related),
       t.functions, t.ie,
       least(240, 20 + coalesce((select n from questions where parcours_id = p.id and section = 'qcm'), 0) * 2
                     + coalesce((select n from questions where parcours_id = p.id and section = 'cas_clinique'), 0) * 3),
       t.phase, t.prio,
       (cardinality(t.functions) > 0), t.can_replace, false, false, p.active
  from public.major_parcours p
  join taxonomy t on t.numero = p.numero
on conflict (parcours_id) do update set
  title = excluded.title, numero = excluded.numero
  where public.plan_coachings.qualified_at is null;

-- Blocs : cours (principal), cas clinique, QCM — chacun avec ses items.
insert into public.plan_coaching_blocks (coaching_id, block_type, title, linked_item_ids, estimated_duration_minutes, evaluative, question_ids, order_index)
select c.id, 'cours', 'Le rappel du coach', c.linked_item_ids, 20, false, '{}', 0
  from public.plan_coachings c
 where c.qualified_at is null and not exists (select 1 from public.plan_coaching_blocks b where b.coaching_id = c.id);

insert into public.plan_coaching_blocks (coaching_id, block_type, title, linked_item_ids, estimated_duration_minutes, evaluative, question_ids, order_index)
select c.id, 'cas_clinique', 'Cas clinique de la semaine',
       case when c.numero = 42 then pg_temp.mg_items(array['Maladie de Horton et PPR','Artérite à cellules géantes et PPR']) else c.linked_item_ids end,
       greatest(5, least(120, q.n * 3)), true, q.ids, 1
  from public.plan_coachings c
  join (select parcours_id, count(*) n, array_agg(id order by ordre) ids from public.major_parcours_questions where section = 'cas_clinique' group by parcours_id) q on q.parcours_id = c.parcours_id
 where c.qualified_at is null and not exists (select 1 from public.plan_coaching_blocks b where b.coaching_id = c.id and b.block_type = 'cas_clinique');

insert into public.plan_coaching_blocks (coaching_id, block_type, title, linked_item_ids, estimated_duration_minutes, evaluative, question_ids, order_index)
select c.id, 'qcm', 'QCM', c.linked_item_ids, greatest(5, least(120, q.n * 2)), true, q.ids, 2
  from public.plan_coachings c
  join (select parcours_id, count(*) n, array_agg(id order by ordre) ids from public.major_parcours_questions where section = 'qcm' group by parcours_id) q on q.parcours_id = c.parcours_id
 where c.qualified_at is null and not exists (select 1 from public.plan_coaching_blocks b where b.coaching_id = c.id and b.block_type = 'qcm');
