-- =============================================
-- Commentaire de l'enseignant sur une question
--
-- `correction_generale` porte déjà le corrigé lui-même (rempli sur la totalité
-- des QROC existantes). Le commentaire est une rubrique DISTINCTE, facultative :
-- rappel, remise en contexte, schéma… ajoutée par l'enseignant en plus du
-- corrigé, et affichée à l'étudiant sous « Réponse attendue ».
--
-- Même format que les autres champs éditoriaux : HTML restreint à la liste
-- blanche de `sanitizeFlashcardHtml` (gras / italique / souligné / couleur /
-- image), assainie côté serveur avant écriture.
--
-- La colonne suit les policies RLS existantes de `qcm_questions` et le trigger
-- `qcm_questions_touch` (updated_at + propagation vers la série).
-- =============================================

alter table public.qcm_questions
  add column if not exists commentaire_enseignant text;

comment on column public.qcm_questions.commentaire_enseignant is
  'Commentaire libre de l''enseignant affiché au corrigé, en plus de correction_generale. HTML restreint (sanitizeFlashcardHtml).';
