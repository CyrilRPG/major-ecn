-- Rubrique d'affichage d'une vidéo (cours vidéo ou séance approfondie).
--
-- Une élève du Programme Approfondi suit aussi les séances de la Préparation
-- intensive : sans intitulé de section, elle voyait une liste plate mêlant
-- « SEANCE 1 … 9 » (type = cours) et les « Séance approfondie N ». La rubrique
-- regroupe les vidéos sous un titre de section dans l'espace élève, pour
-- qu'elle sache quoi travailler et dans quel ordre.
--
-- NULL = libellé par défaut du type (cf. src/lib/videos/rubriques.ts).
alter table public.videos add column if not exists rubrique text null;

comment on column public.videos.rubrique is
  'Intitulé de rubrique affiché à l''élève (texte libre, ex. « Dernier tour de révision »). NULL = libellé par défaut du type de vidéo.';
