-- Facturation IA : les corrigés EVC Arena rédigés par IA (1 € le document,
-- feature 'arena_corrections_generation') s'enregistrent dans ai_generations
-- avec kind = 'arena_corrections'. La contrainte de kind ne le prévoyait pas :
-- l'insertion échouait en silence (console.error) et le document n'était pas
-- facturé.
alter table public.ai_generations drop constraint if exists ai_generations_kind_check;
alter table public.ai_generations add constraint ai_generations_kind_check
  check (kind in ('flashcards', 'qcm', 'exam_grading', 'exam_generation', 'blog_article', 'arena_corrections'));
