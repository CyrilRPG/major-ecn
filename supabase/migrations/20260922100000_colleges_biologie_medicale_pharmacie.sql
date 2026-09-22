-- =====================================================================
-- Deux nouveaux collèges du programme EDN : Biologie médicale, Pharmacie
-- ---------------------------------------------------------------------
-- Demandés le 22/09/2026. Les collèges sont créés VIDES, avec pour seul
-- item le « Replays - Révisions » habituel (libellé unique depuis le
-- 16/09/2026, cf. 20260916150000_replays_revisions.sql et
-- src/lib/videos/revisions.ts) en tête de collège (`order_index = 0`).
--
-- Rien d'autre à écrire : toute l'administration de ces collèges est déjà
-- générique et alimentée par la table `matieres`.
--   · /admin/arborescence  — renommer, trier, ajouter/dupliquer/supprimer des
--                            items, régler le périmètre et la formule minimale
--   · /admin/contenu       — déposer fiches, QCM, flashcards
--   · /admin/videos        — déposer vidéos et supports (le sélecteur propose
--                            l'item de révisions automatiquement)
--   · /admin/eleves        — inviter un élève (le sélecteur de collèges lit
--                            `matieres` : les deux nouveaux y apparaissent)
--
-- `access_type = 'specific'` : un collège encore vide ne doit s'ouvrir qu'aux
-- élèves nommément invités dessus (même règle que col-imagerie-medicale).
-- Le basculer en « toute l'offre » est un clic dans /admin/arborescence.
--
-- Ces collèges ne sont PAS ajoutés au tunnel de vente
-- (src/lib/data/enrollable-colleges.ts) : leur mise en vente est une décision
-- distincte, à prendre quand les contenus existent.
--
-- Sans risque à relancer (idempotent).
-- =====================================================================

insert into public.matieres (id, semestre_id, nom, icon_key, color_hex, order_index, access_type)
values
  ('col-biologie-medicale', 'edn-prog', 'Biologie médicale', 'FlaskConical', '#15803D', 19, 'specific'),
  ('col-pharmacie',         'edn-prog', 'Pharmacie',         'Pill',         '#A21CAF', 20, 'specific')
on conflict (id) do nothing;

-- Item « Replays - Révisions » en tête de chaque collège. Aucun
-- `cours_content_slots` : comme les 28 items de révisions déjà en base, cet
-- item ne porte que des replays (cf. `chargerReplays`), pas les 4 contenus
-- par défaut d'un item de programme.
insert into public.cours (matiere_id, titre, order_index, access_type)
select m.id, 'Replays - Révisions', 0, 'all'
from public.matieres m
where m.id in ('col-biologie-medicale', 'col-pharmacie')
  and not exists (
    select 1 from public.cours c
    where c.matiere_id = m.id and c.titre = 'Replays - Révisions'
  );
