-- Permissions individuelles des séances : allowlist en plus de la denylist.
--
-- Symétrie de `videos.denied_user_ids` : liste d'élèves à qui l'on ACCORDE
-- nominativement l'accès à la vidéo, MÊME S'ILS n'ont pas la formule / la voie
-- / le collège nécessaire (l'exclusion nominative reste prioritaire — un élève
-- à la fois « denied » et « allowed » ne voit pas la vidéo).

alter table public.videos
  add column if not exists allowed_user_ids uuid[] not null default array[]::uuid[];

comment on column public.videos.allowed_user_ids is
  'Élèves explicitement AUTORISÉS à voir cette vidéo/séance, même s''ils n''ont pas la formule/voie/collège requis. La denylist (denied_user_ids) prime toujours.';
