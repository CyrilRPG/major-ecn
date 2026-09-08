-- EVC Arena — minutage par QUESTION plutôt qu'une durée unique de manche.
--
-- Jusqu'ici une manche portait une durée globale (`round_duration_minutes`,
-- 12 min par défaut) et le participant répartissait ce temps comme il voulait.
-- L'arbitrage du 08/09/2026 : garder 12 questions, mais donner à chaque
-- question sa propre durée, fixée par l'administration.
--
-- Deux colonnes :
--   - `arena_tournaments.seconds_per_question` : la valeur par défaut du
--     tournoi, appliquée à toute question qui n'en définit pas ;
--   - `arena_questions.duration_seconds` : la durée propre d'une question,
--     `null` = « celle du tournoi ».
--
-- `round_duration_minutes` et `arena_rounds.duration_minutes` sont CONSERVÉS :
-- ils deviennent un plafond de sécurité pour la manche entière, et les
-- tournois déjà joués gardent leur minutage d'origine.

alter table public.arena_tournaments
  add column if not exists seconds_per_question integer not null default 60;

alter table public.arena_tournaments
  drop constraint if exists arena_tournaments_seconds_per_question_check;
alter table public.arena_tournaments
  add constraint arena_tournaments_seconds_per_question_check
  check (seconds_per_question between 5 and 3600);

alter table public.arena_questions
  add column if not exists duration_seconds integer;

alter table public.arena_questions
  drop constraint if exists arena_questions_duration_seconds_check;
alter table public.arena_questions
  add constraint arena_questions_duration_seconds_check
  check (duration_seconds is null or duration_seconds between 5 and 3600);

comment on column public.arena_tournaments.seconds_per_question is
  'Durée par défaut d''une question, en secondes. Utilisée quand arena_questions.duration_seconds est null.';
comment on column public.arena_questions.duration_seconds is
  'Durée propre à cette question, en secondes. null = valeur du tournoi.';
