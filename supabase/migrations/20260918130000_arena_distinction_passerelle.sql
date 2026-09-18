-- EVC Arena — cahier des charges complémentaire du 18/09/2026 :
-- gestion des scores faibles, classement, distinctions et passerelle Major ECN.
--
--  * `threshold_pct` (existant)   = RANKING_THRESHOLD, seuil d'intégration au classement (50 % par défaut) ;
--  * `distinction_pct` (nouveau)  = DISTINCTION_THRESHOLD, seuil des trophées Or / Argent / Bronze (70 % par défaut) ;
--  * passerelle Major ECN administrable : affichage, URL par spécialité, texte du CTA ;
--  * statut candidat forçable : élève Major ECN / prospect / détection automatique par l'adresse.
--
-- À appliquer sur le projet Supabase (SQL Editor ou `SBP=<jeton> node tmp/_sql-run.mjs <fichier>`).
-- Le code applicatif tolère l'absence de ces colonnes (valeurs par défaut en lecture,
-- message explicite à l'enregistrement) : il peut être déployé avant la migration.

alter table public.arena_tournaments
  add column if not exists distinction_pct    numeric not null default 70 check (distinction_pct between 0 and 100),
  add column if not exists passerelle_enabled boolean not null default true,
  add column if not exists passerelle_url     text,
  add column if not exists passerelle_cta     text;

comment on column public.arena_tournaments.threshold_pct is
  'RANKING_THRESHOLD : seuil (%) d''intégration au classement. Sous ce seuil : aucun rang, aucune apparition publique, aucune médaille.';
comment on column public.arena_tournaments.distinction_pct is
  'DISTINCTION_THRESHOLD : seuil (%) des distinctions Or / Argent / Bronze (podium ET score ≥ seuil). Jamais inférieur à threshold_pct à l''affichage.';
comment on column public.arena_tournaments.passerelle_enabled is
  'Afficher la passerelle Major ECN après les résultats (score → rang → motivation → correction → prochain objectif → passerelle).';
comment on column public.arena_tournaments.passerelle_url is
  'URL Major ECN de la spécialité pour les prospects ; null = page de la spécialité du tournoi (sinon annuaire).';
comment on column public.arena_tournaments.passerelle_cta is
  'Texte du bouton de la passerelle (prospects) ; null = texte du niveau (progresser / franchir un cap / se perfectionner).';

alter table public.arena_participants
  add column if not exists major_ecn_status text not null default 'auto'
    check (major_ecn_status in ('auto', 'student', 'prospect'));

comment on column public.arena_participants.major_ecn_status is
  'Statut Major ECN forcé par l''administration : auto (détection par l''adresse e-mail : élève actif à formule payante), student, prospect.';
