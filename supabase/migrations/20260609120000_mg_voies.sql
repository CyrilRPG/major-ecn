-- =============================================================================
-- Migration : Dédoublement Collège Médecine Générale
--   • Renomme le collège existant "Médecine générale" → "Médecine générale - Voie interne"
--   • Crée le collège "Médecine générale - Voie externe" (système de permissions
--     indépendant) qui partage fiches/vidéos/flashcards avec la voie interne
--   • La voie externe remplace ses séries DP / QI par des séries QROC (vides)
-- =============================================================================

-- 1) Élargir le type des séries QCM pour accepter le nouveau format QROC
alter table public.qcm_series drop constraint if exists qcm_series_type_check;
alter table public.qcm_series
  add constraint qcm_series_type_check
  check (type in ('qcm','annale','qroc'));

-- 2) Ajouter une colonne de liaison sur la table cours
--    Si linked_to_cours_id est non null, les ressources partagées (videos, fiches,
--    flashcards) sont résolues côté requête sur le cours source.
alter table public.cours
  add column if not exists linked_to_cours_id uuid references public.cours(id) on delete set null;

create index if not exists cours_linked_to_idx on public.cours(linked_to_cours_id);

-- 3) Renommer le collège existant en "Médecine générale - Voie interne"
update public.matieres
   set nom = 'Médecine générale - Voie interne'
 where lower(nom) = 'médecine générale'
    or lower(nom) = 'medecine generale';

-- 4) Créer le collège "Médecine générale - Voie externe" en clonant les
--    paramètres visuels du collège voie interne. Permissions indépendantes :
--    `access_type` est à 'all' par défaut, peut être restreint par admin.
do $$
declare
  v_interne record;
  v_externe_id text;
begin
  select id, semestre_id, icon_key, color_hex, order_index, access_type
    into v_interne
    from public.matieres
   where nom = 'Médecine générale - Voie interne'
   limit 1;

  if v_interne.id is null then
    raise notice 'Aucun collège "Médecine générale - Voie interne" trouvé, skip.';
    return;
  end if;

  v_externe_id := v_interne.id || '-voie-externe';

  -- Crée le collège voie externe s'il n'existe pas déjà
  insert into public.matieres (id, semestre_id, nom, icon_key, color_hex, order_index, access_type)
  values (
    v_externe_id,
    v_interne.semestre_id,
    'Médecine générale - Voie externe',
    v_interne.icon_key,
    v_interne.color_hex,
    coalesce(v_interne.order_index, 0) + 1,
    coalesce(v_interne.access_type, 'all')
  )
  on conflict (id) do nothing;

  -- 5) Dupliquer les cours de voie interne dans voie externe.
  --    Les nouveaux cours ont linked_to_cours_id = id du cours source.
  --    Ainsi videos/fiches/flashcards/qcm_series RESTENT attachés au cours
  --    source de voie interne, et la résolution côté requête utilise la liaison.
  insert into public.cours (matiere_id, titre, description, order_index, access_type, linked_to_cours_id)
  select v_externe_id, titre, description, order_index,
         coalesce(access_type, 'all'),
         id
    from public.cours
   where matiere_id = v_interne.id
     and not exists (
       select 1 from public.cours c2
        where c2.matiere_id = v_externe_id
          and c2.linked_to_cours_id = public.cours.id
     );

  -- 6) Pour la voie externe uniquement : créer des séries QROC vides
  --    (placeholder), une par cours, en remplacement conceptuel des DP/QI.
  insert into public.qcm_series (cours_id, type, label, annee, order_index)
  select c.id, 'qroc', 'QROC', null, 0
    from public.cours c
   where c.matiere_id = v_externe_id
     and not exists (
       select 1 from public.qcm_series qs
        where qs.cours_id = c.id and qs.type = 'qroc'
     );

end $$;

-- 7) Permissions indépendantes : aucune action requise au niveau schéma car
--    `profiles.permission_scope` (jsonb) traite déjà chaque matière_id
--    indépendamment. Les admins peuvent restreindre l'accès en mettant
--    `{"type":"colleges","colleges":["<id-voie-interne>"]}` ou
--    `{"type":"colleges","colleges":["<id-voie-externe>"]}`.

-- =============================================================================
-- ROLLBACK (manuel, à exécuter avec précaution) :
--   delete from public.qcm_series
--    where type = 'qroc' and cours_id in (
--      select id from public.cours where matiere_id like '%-voie-externe'
--    );
--   delete from public.cours where matiere_id like '%-voie-externe';
--   delete from public.matieres where id like '%-voie-externe';
--   update public.matieres set nom = 'Médecine générale'
--    where nom = 'Médecine générale - Voie interne';
--   alter table public.cours drop column if exists linked_to_cours_id;
--   alter table public.qcm_series drop constraint if exists qcm_series_type_check;
--   alter table public.qcm_series
--     add constraint qcm_series_type_check
--     check (type in ('qcm','annale'));
-- =============================================================================
