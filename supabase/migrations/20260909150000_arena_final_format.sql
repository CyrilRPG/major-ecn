alter table public.arena_tournaments
  add column if not exists afficher_effectif_general boolean not null default false;
alter table public.arena_tournaments alter column questions_per_round set default 20;
alter table public.arena_tournaments alter column min_rounds_final set default 3;
alter table public.arena_tournaments alter column round_duration_minutes set default 20;
update public.arena_tournaments set min_rounds_final = 3;

-- Preserve the recorded format of already-played tournaments. Unstarted
-- tournaments use 20 questions; integrity validation requires the full content.
update public.arena_tournaments t set questions_per_round = 20, round_duration_minutes = 20
where not exists (
  select 1 from public.arena_rounds r join public.arena_attempts a on a.round_id = r.id
  where r.tournament_id = t.id and not a.is_preview
);
comment on column public.arena_tournaments.afficher_effectif_general is
  'Individual final screens only: rank and general denominator shown together. Public full leaderboard always shows its effectif.';
