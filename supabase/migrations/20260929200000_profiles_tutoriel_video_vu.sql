-- Tutoriel vidéo élève : affiché automatiquement UNE seule fois par compte
-- (et non par navigateur). Renseigné par le serveur (service-role) à la
-- première ouverture automatique ; le bouton « Tutoriel » le rouvre à volonté.
alter table public.profiles add column if not exists tutoriel_video_vu_at timestamptz;
