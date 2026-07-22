-- 1) Items de QCM : autoriser les propositions A à K (certaines banques de
--    questions — hémato MG, EVC 2025 — comportent 6 à 11 propositions).
alter table qcm_items drop constraint qcm_items_lettre_check;
alter table qcm_items add constraint qcm_items_lettre_check
  check (lettre = any (array['A','B','C','D','E','F','G','H','I','J','K']));

-- 2) Vidéos de séance approfondie sans séance du professeur associée :
--    accès direct (sans terminer de séance) quand unlock_direct est vrai.
alter table videos add column if not exists unlock_direct boolean not null default false;
