-- Consolidation Médecine générale : suppression du collège à plat
-- « Médecine générale - Voie externe » (col-medecine-generale-voie-externe),
-- redondant avec les sous-collèges de col-medecine-generale, et renommage de
-- ce dernier en « Médecine générale - Voie externe ». La distinction voie
-- interne / externe se fait désormais au niveau de l'accès étudiant (RLS).

delete from public.qcm_items where question_id in (
  select q.id from public.qcm_questions q
  join public.qcm_series s on s.id = q.serie_id
  join public.cours c on c.id = s.cours_id
  where c.matiere_id = 'col-medecine-generale-voie-externe');
delete from public.qcm_questions where serie_id in (
  select s.id from public.qcm_series s
  join public.cours c on c.id = s.cours_id
  where c.matiere_id = 'col-medecine-generale-voie-externe');
delete from public.qcm_series where cours_id in (
  select id from public.cours where matiere_id = 'col-medecine-generale-voie-externe');
delete from public.cours where matiere_id = 'col-medecine-generale-voie-externe';
delete from public.matieres where id = 'col-medecine-generale-voie-externe';

-- Retire l'ancien collège des périmètres de permission éventuels.
update public.profiles
  set permission_scope = jsonb_set(permission_scope, '{colleges}',
        (permission_scope->'colleges') - 'col-medecine-generale-voie-externe')
  where permission_scope ? 'colleges'
    and permission_scope->'colleges' ? 'col-medecine-generale-voie-externe';

update public.matieres set nom = 'Médecine générale - Voie externe' where id = 'col-medecine-generale';
