-- Ciblage des vidéos : voie de concours + formules
-- ---------------------------------------------------------------------------
-- Jusqu'ici l'audience d'une vidéo était déduite de son SEUL type :
--   `cours`              → formula_permissions.video              (Intensive)
--   `seance_approfondie` → formula_permissions.seance_approfondie (Approfondi)
-- Donc aucune vidéo ne pouvait viser la Formule Essentielle, ni être réservée à
-- une voie de concours.
--
-- Deux colonnes de ciblage, sur le modèle de `platform_events.voies` et
-- `mock_exams.voies` :
--   `voies`  — voies concernées. Les DEUX = aucune restriction (défaut).
--   `offers` — formules qui y ont accès. Non vide : c'est ce ciblage qui fait
--              foi pour la vidéo, par-dessus le droit global de la formule.

alter table public.videos
  add column if not exists voies text[] not null default array['interne', 'externe'],
  add column if not exists offers text[] not null default array[]::text[];

-- Rétro-compatibilité stricte : les cours vidéo existants gardent EXACTEMENT
-- l'audience qu'ils avaient, c'est-à-dire les formules dont le droit « video »
-- est actif dans formula_permissions (aujourd'hui la seule Formule Intensive).
update public.videos v
set offers = coalesce(
  (select array_agg(fp.offer order by fp.offer)
   from public.formula_permissions fp
   where fp.video and fp.offer <> 'decouverte'),
  array['intensif']
)
where v.type = 'cours'
  and coalesce(array_length(v.offers, 1), 0) = 0;

-- Les séances approfondies restent portées par le Programme Approfondi.
update public.videos
set offers = array['approfondi']
where type = 'seance_approfondie'
  and coalesce(array_length(offers, 1), 0) = 0;

-- Valeurs admises, et au moins une case cochée de chaque côté : une vidéo sans
-- voie ni formule serait invisible pour tout le monde.
alter table public.videos
  drop constraint if exists videos_voies_valides,
  add constraint videos_voies_valides check (
    voies <@ array['interne', 'externe']
    and coalesce(array_length(voies, 1), 0) >= 1
  );

alter table public.videos
  drop constraint if exists videos_offers_valides,
  add constraint videos_offers_valides check (
    offers <@ array['essentiel', 'intensif', 'approfondi']
    and coalesce(array_length(offers, 1), 0) >= 1
  );

comment on column public.videos.voies is
  'Voies de concours concernées. Les deux = aucune restriction.';
comment on column public.videos.offers is
  'Formules ayant accès à cette vidéo. Prime sur le droit global de la formule.';
