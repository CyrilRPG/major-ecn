-- Séance à venir : déposer les dossiers AVANT la vidéo (2026-09-24).
--
-- Demande de Cyril : avant une séance en direct, les élèves reçoivent les
-- dossiers à préparer. L'administration doit pouvoir créer la séance dans
-- Admin › Vidéos SANS lien Bunny, y attacher ses supports PDF, puis coller le
-- lien de la vidéo après la séance (crayon) — les supports restent attachés.
--
-- Rien à relâcher côté vidéo : `bunny_video_id` et `storage_path` sont déjà
-- facultatifs (aucun NOT NULL, aucune contrainte CHECK). Une ligne sans l'un
-- ni l'autre est une « séance à venir ». Les compteurs de contenu
-- (admin_content_counts, navigateur, progression) filtrent déjà
-- `storage_path is not null or bunny_video_id is not null` : une séance à
-- venir n'y compte pas comme une vidéo à regarder.
--
-- Seul ajout : la date (facultative) de la séance en direct, affichée aux
-- élèves (« Séance en direct à venir — le … »). Elle n'a AUCUN effet sur la
-- visibilité : la publication reste gouvernée par `status` / `publish_at`.
--
-- Idempotent : peut être rejoué sans risque dans l'éditeur SQL.

alter table public.videos add column if not exists live_at timestamptz null;

comment on column public.videos.live_at is
  'Date de la séance en direct (facultative). Sert à annoncer une « séance à venir » (vidéo pas encore déposée) ; sans effet sur la visibilité.';

-- Recharge le cache de schéma de PostgREST pour que la colonne soit servie
-- immédiatement par l'API.
notify pgrst, 'reload schema';
