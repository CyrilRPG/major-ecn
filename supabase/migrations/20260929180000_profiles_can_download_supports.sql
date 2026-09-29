-- Droit de TÉLÉCHARGER les supports des vidéos (PDF filigranés au nom de
-- l'élève), accordé élève par élève depuis l'administration (29/09/2026).
--
-- Volontairement DISTINCT de `can_download` / `download_colleges`, qui règlent
-- l'impression des fiches de cours : accorder les supports n'ouvre ni les
-- fiches de cours ni les fiches éclairs. Sans ce droit, un support reste
-- consultable en ligne uniquement.
alter table public.profiles
  add column if not exists can_download_supports boolean not null default false;

comment on column public.profiles.can_download_supports is
  'Téléchargement des supports vidéo (PDF filigranés). Indépendant de can_download (fiches).';
