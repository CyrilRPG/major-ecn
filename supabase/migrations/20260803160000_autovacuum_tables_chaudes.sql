-- Suite de l'audit de vitesse (après 20260803120000/130000/140000).
--
-- Constat. Les petites tables lues en permanence — elles interviennent dans
-- presque toutes les policies RLS et sur toutes les pages — accumulaient les
-- lignes mortes sans jamais être nettoyées :
--
--   cours          510 vivantes / 151 mortes  (29,6 %)   dernier autovacuum 01/08
--   fiches         515 vivantes / 110 mortes  (21,4 %)   JAMAIS
--   qcm_series   9 721 vivantes / 1 156 mortes (11,9 %)  14/07
--
-- Et `qcm_questions`, non nettoyée depuis le 7 juillet, avait une carte de
-- visibilité périmée : son parcours « index only » retombait sur le tas
-- 12 850 fois pour 51 341 lignes. Après VACUUM : 0 accès au tas, et le
-- balayage passe de 4 011 à 995 blocs — quatre fois moins d'entrées/sorties.
--
-- Pourquoi l'autovacuum ne se déclenchait pas : son seuil est
-- `autovacuum_vacuum_threshold + scale_factor × nb_lignes`, soit 50 + 20 %.
-- Une table de 510 lignes doit donc accumuler ~152 lignes mortes avant d'être
-- nettoyée — c'est-à-dire rester durablement à 30 % de déchet. Sur une table
-- lue à chaque requête, ce déchet se paie en permanence.
--
-- On abaisse le seuil sur ces tables-là. Elles sont minuscules : le nettoyage
-- coûte quelques millisecondes, très en dessous de ce qu'il fait gagner.

alter table public.cours       set (autovacuum_vacuum_threshold = 20, autovacuum_vacuum_scale_factor = 0.05);
alter table public.fiches      set (autovacuum_vacuum_threshold = 20, autovacuum_vacuum_scale_factor = 0.05);
alter table public.matieres    set (autovacuum_vacuum_threshold = 10, autovacuum_vacuum_scale_factor = 0.05);
alter table public.semestres   set (autovacuum_vacuum_threshold = 10, autovacuum_vacuum_scale_factor = 0.05);
alter table public.videos      set (autovacuum_vacuum_threshold = 20, autovacuum_vacuum_scale_factor = 0.05);

-- Grosses tables de contenu : 20 % de 51 000 lignes = 10 200 lignes mortes
-- tolérées avant nettoyage, et surtout une carte de visibilité qui reste
-- périmée longtemps — ce qui annule le bénéfice des parcours « index only ».
alter table public.qcm_series    set (autovacuum_vacuum_scale_factor = 0.05);
alter table public.qcm_questions set (autovacuum_vacuum_scale_factor = 0.05);
alter table public.qcm_items     set (autovacuum_vacuum_scale_factor = 0.05);
alter table public.flashcards    set (autovacuum_vacuum_scale_factor = 0.05);

-- Le VACUUM (ANALYZE) initial a été passé à la main sur cours, fiches,
-- qcm_series, qcm_questions : il ne peut pas figurer ici, VACUUM ne pouvant
-- pas s'exécuter dans un bloc de transaction.
