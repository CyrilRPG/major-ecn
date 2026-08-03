-- Troisième volet de l'audit de vitesse (après 20260803120000 et …130000).
--
-- Constat. `semestres` et `matieres` n'avaient JAMAIS été analysés
-- (`pg_stat_user_tables.last_analyze` et `last_autoanalyze` à null, `n_live_tup`
-- à 0 pour `semestres`). Sans statistiques, le planificateur inversait l'ordre
-- des jointures : pour l'accueil élève, il parcourait l'arbre de contenu entier
-- — 510 items → 9 721 séries → 51 341 questions — puis sondait `qcm_attempts`
-- 51 341 fois pour retrouver les ~800 tentatives de l'élève, au lieu de partir
-- des 800 tentatives. Coût de `get_accueil_stats` : 288 898 blocs lus.
--
-- Après ANALYZE : 4 940 blocs, 57 ms au lieu de 343 ms — 58 fois moins d'I/O.
--
-- Pourquoi l'autoanalyse ne s'était jamais déclenchée : son seuil est
-- `autovacuum_analyze_threshold + scale_factor × nb_lignes`, soit 50 + 10 %.
-- `semestres` (1 ligne) et `matieres` (26 lignes) n'atteignent jamais 50
-- modifications — elles seraient restées sans statistiques indéfiniment. On
-- abaisse donc le seuil sur les tables de référence, et le facteur d'échelle
-- sur les grosses tables de contenu, qui grossissent par imports en masse
-- (`qcm_questions` n'avait pas été analysée depuis trois semaines).

analyze public.semestres;
analyze public.matieres;
analyze public.facultes;
analyze public.cours;
analyze public.qcm_series;
analyze public.qcm_questions;
analyze public.qcm_items;
analyze public.qcm_attempts;
analyze public.qcm_sessions;
analyze public.flashcards;
analyze public.flashcard_reviews;
analyze public.fiches;
analyze public.videos;
analyze public.video_supports;
analyze public.profiles;

-- Tables de référence, petites et rarement modifiées : sans seuil bas, elles
-- ne franchissent jamais la barre des 50 modifications.
alter table public.facultes  set (autovacuum_analyze_threshold = 5,  autovacuum_analyze_scale_factor = 0.05);
alter table public.semestres set (autovacuum_analyze_threshold = 5,  autovacuum_analyze_scale_factor = 0.05);
alter table public.matieres  set (autovacuum_analyze_threshold = 5,  autovacuum_analyze_scale_factor = 0.05);
alter table public.cours     set (autovacuum_analyze_threshold = 20, autovacuum_analyze_scale_factor = 0.05);

-- Grosses tables de contenu : 10 % de 51 000 lignes = 5 100 modifications avant
-- réanalyse, trop tardif quand un import ajoute quelques centaines de questions.
alter table public.qcm_series    set (autovacuum_analyze_scale_factor = 0.02);
alter table public.qcm_questions set (autovacuum_analyze_scale_factor = 0.02);
alter table public.qcm_items     set (autovacuum_analyze_scale_factor = 0.02);
alter table public.flashcards    set (autovacuum_analyze_scale_factor = 0.02);
