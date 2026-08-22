-- Annales EVC corrigées — items d'accueil manquants.
--
-- Les annales EVC (sujets officiels + corrigés Major ECN, cf. `Annales/`) sont
-- publiées comme des séries `qcm_series` de type 'qcm' libellées
-- « Annales - <Collège> - <Année> - <Type> », dans l'onglet DP · QI de l'item
-- transversal « Révisions - <Collège> ». Quatre collèges n'avaient pas cet
-- item ; il est créé ici, en fin de liste de leur programme.
--
-- ATTENTION AU PIÈGE MÉDECINE GÉNÉRALE : `col-cardiologie` n'est pas
-- `col-mg-cardiologie`, qui possède déjà son propre « Révisions - Cardiologie »
-- en tant que sous-collège de Médecine générale. Ce sont deux choses distinctes.
--
-- Aucune restriction n'est posée sur les séries : la voie de concours est déjà
-- tranchée par `qcm_series.kind` sur les seuls items de Médecine générale
-- (policy `qcm_series_voie_restrict`), et poser `allowed_voies` masquerait les
-- séries aux élèves dont la voie n'est pas renseignée.

insert into public.cours (matiere_id, titre, order_index)
select v.matiere_id, v.titre,
       coalesce((select max(c.order_index) + 1 from public.cours c where c.matiere_id = v.matiere_id), 0)
from (values
  ('col-orthopedie',              'Révisions - Orthopédie'),
  ('col-anesthesie-reanimation',  'Révisions - Anesthésie-Réanimation'),
  ('col-cardiologie',             'Révisions - Cardiologie'),
  ('col-gynecologie',             'Révisions - Gynécologie-obstétrique')
) as v(matiere_id, titre)
where not exists (
  select 1 from public.cours c where c.matiere_id = v.matiere_id and c.titre = v.titre
);

-- Médecine générale : collège PARENT, sans cours propre jusqu'ici. L'item est
-- placé en `order_index = 0` pour s'afficher AVANT ses sous-collèges dans le
-- navigateur (`getNavigatorTree` rend `college.cours` avant `college.children`).
insert into public.cours (matiere_id, titre, order_index)
select 'col-medecine-generale', 'Annales - Médecine générale', 0
where not exists (
  select 1 from public.cours
  where matiere_id = 'col-medecine-generale' and titre = 'Annales - Médecine générale'
);

-- Élèves de Médecine générale dont le périmètre liste explicitement des cours :
-- sans cet ajout, `canAccessCours()` leur cacherait le nouvel item.
update public.profiles p
set permission_scope = jsonb_set(
      p.permission_scope, '{cours}',
      (p.permission_scope->'cours') || to_jsonb(mg.id::text), true)
from (
  select id from public.cours
  where matiere_id = 'col-medecine-generale' and titre = 'Annales - Médecine générale'
  limit 1
) mg
where p.role = 'student'
  and p.permission_scope->'colleges' @> '"col-medecine-generale"'::jsonb
  and jsonb_array_length(coalesce(p.permission_scope->'cours', '[]'::jsonb)) > 0
  and not (p.permission_scope->'cours' @> to_jsonb(mg.id::text));
