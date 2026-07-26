-- Programme Approfondi : accès aux QCM d'entraînement.
--
-- Le Programme Approfondi doit donner accès, en plus des séances du professeur,
-- à l'ensemble des QCM / DP / QROC des autres formules — entraînements compris —
-- toujours filtrés selon la voie du candidat (interne = QCM/DP, externe =
-- QROC/DP-QROC) par la RLS existante (qcm_series_voie_restrict).
--
-- La colonne `qcm` (QCM/DP/QROC) était déjà à true ; seule `entrainement` était
-- restée à false. On l'active ici pour aligner la config DB sur le comportement
-- attendu (et sur le fallback hardcodé getContentAccess('approfondi')).
--
-- Idempotent : ne fait rien si la ligne est déjà correcte.

update public.formula_permissions
set entrainement = true
where offer = 'approfondi' and entrainement is distinct from true;
