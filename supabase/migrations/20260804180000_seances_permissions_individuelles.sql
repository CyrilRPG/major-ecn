-- Permissions individuelles des séances + permissions par support
-- ---------------------------------------------------------------------------
-- 1) Denylist par vidéo (« séance ») : liste d'élèves à qui on RETIRE l'accès,
--    même si leur formule/voie les rendrait éligibles. C'est une exclusion
--    nominative, cumulée par-dessus le ciblage voies/formules existant.
--
-- 2) Permissions PROPRES à un support : jusqu'ici chaque support héritait de
--    l'audience de sa vidéo. On permet à un support de porter ses PROPRES
--    voies + formules (« permissions différentes »). NULL = hérite de la vidéo.

alter table public.videos
  add column if not exists denied_user_ids uuid[] not null default array[]::uuid[];

comment on column public.videos.denied_user_ids is
  'Élèves explicitement privés d''accès à cette vidéo/séance (exclusion nominative), en plus du ciblage voies/formules.';

alter table public.video_supports
  add column if not exists voies text[],
  add column if not exists offers text[];

comment on column public.video_supports.voies is
  'Voies de concours propres au support. NULL = hérite de la vidéo.';
comment on column public.video_supports.offers is
  'Formules propres au support. NULL = hérite de la vidéo. Non NULL : prime sur l''audience de la vidéo pour CE support.';

-- Un support ciblé doit rester visible par au moins une voie et une formule ;
-- NULL reste autorisé (= héritage de la vidéo).
alter table public.video_supports
  drop constraint if exists video_supports_voies_valides,
  add constraint video_supports_voies_valides check (
    voies is null
    or (voies <@ array['interne', 'externe'] and coalesce(array_length(voies, 1), 0) >= 1)
  );

alter table public.video_supports
  drop constraint if exists video_supports_offers_valides,
  add constraint video_supports_offers_valides check (
    offers is null
    or (offers <@ array['essentiel', 'intensif', 'approfondi'] and coalesce(array_length(offers, 1), 0) >= 1)
  );
