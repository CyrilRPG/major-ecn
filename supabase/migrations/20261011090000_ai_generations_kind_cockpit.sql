-- Facturation IA : deux usages n'étaient jamais enregistrés, faute d'être
-- admis par la contrainte `ai_generations_kind_check` :
--   - l'import IA de l'agenda (kind 'agenda_import', livré le 10/10/2026) —
--     l'insertion échouait en silence (« facturation non enregistrée ») ;
--   - l'Assistant IA Major ECN du cockpit administrateur (kind
--     'cockpit_assistant'), facturé 0,10 € la question comme l'assistant élève.
alter table public.ai_generations drop constraint if exists ai_generations_kind_check;
alter table public.ai_generations add constraint ai_generations_kind_check
  check (kind in ('flashcards', 'qcm', 'exam_grading', 'exam_generation', 'blog_article', 'arena_corrections', 'agenda_import', 'cockpit_assistant'));
