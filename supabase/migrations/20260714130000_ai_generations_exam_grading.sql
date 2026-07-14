-- Épreuves Blanches — Phase 2 : autoriser le log du coût de la correction QROC
-- par IA (nouveau kind 'exam_grading' dans ai_generations).
alter table public.ai_generations drop constraint if exists ai_generations_kind_check;
alter table public.ai_generations
  add constraint ai_generations_kind_check check (kind in ('flashcards','qcm','exam_grading'));
