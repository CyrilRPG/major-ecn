-- Étape 1/2 du retrait de `videos.bunny_video_id` aux rôles élèves.
--
-- Les pages (web, application mobile) n'ont besoin, côté élève, que de SAVOIR
-- si une vidéo Bunny existe (séance « à venir » ou non, carte vidéo affichée).
-- Cette colonne générée le dit sans révéler le GUID, qui suffit à intégrer le
-- lecteur Bunny (librairie 691475, pas d'authentification par token).
--
-- Sans effet sur l'existant : à appliquer AVANT le déploiement du code qui la
-- lit. L'étape 2 (20261001150100) retire ensuite le GUID aux rôles élèves.

alter table public.videos
  add column if not exists bunny_disponible boolean
  generated always as (bunny_video_id is not null) stored;

comment on column public.videos.bunny_disponible is
  'Vrai si la vidéo a un GUID Bunny. Lisible par les élèves, contrairement à bunny_video_id (service-role seulement).';
