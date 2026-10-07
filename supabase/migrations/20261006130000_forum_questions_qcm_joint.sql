-- =============================================
-- Forum : question d'élève posée DEPUIS un QCM / QROC
--
-- L'élève qui bute sur une question d'entraînement l'envoie directement à un
-- professeur, question jointe : le professeur sait exactement quel QCM pose
-- souci, sans avoir à le chercher.
--
--   - qcm_question_id : la question (lien vers le lecteur, ?q=<id>) ;
--   - qcm_contexte    : instantané au moment de l'envoi (énoncé, propositions
--     et corrigé, réponse de l'élève, série, item) — la question peut être
--     corrigée ou supprimée ensuite, la discussion doit rester lisible.
-- =============================================

alter table public.forum_questions
  add column if not exists qcm_question_id uuid references public.qcm_questions(id) on delete set null,
  add column if not exists qcm_contexte jsonb;

comment on column public.forum_questions.qcm_question_id is
  'Question QCM/QROC jointe par l''élève (bouton « Question au professeur » des lecteurs de QCM).';
comment on column public.forum_questions.qcm_contexte is
  'Instantané de la question jointe au moment de l''envoi (lib/forum/qcm-joint.ts, type QcmJoint).';

create index if not exists forum_questions_qcm_question_idx
  on public.forum_questions (qcm_question_id) where qcm_question_id is not null;
