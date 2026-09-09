-- Stable character + private cumulative ranking checkpoints (09/09/2026).
alter table public.arena_rounds add column if not exists ranking_snapshot_at timestamptz;

create table public.arena_rank_history (
  round_id uuid not null references public.arena_rounds(id) on delete cascade,
  participant_id uuid not null references public.arena_participants(id) on delete cascade,
  round_number int not null,
  rank int check (rank > 0),
  total_score numeric not null,
  total_max numeric not null,
  recorded_at timestamptz not null,
  is_final boolean not null,
  reconstructed boolean not null default false,
  primary key (round_id, participant_id)
);
create index arena_rank_history_participant_idx on public.arena_rank_history(participant_id, recorded_at);
alter table public.arena_rank_history enable row level security;
revoke all on public.arena_rank_history from anon, authenticated;
grant all on public.arena_rank_history to service_role;

create function public.arena_keep_avatar_identity() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.avatar_seed is distinct from old.avatar_seed then
    raise exception 'Le personnage choisi est conservé pendant toute l''Arena.' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger arena_keep_avatar_identity before update of avatar_seed on public.arena_participants
  for each row execute function public.arena_keep_avatar_identity();

-- Only the trusted server supplies standings, using the shared TS ranking engine.
-- Lock the tournament so concurrent manual/cron publications cannot race.
create function public.arena_publish_ranking_snapshot(
  p_round_id uuid, p_expected_published_ids uuid[], p_recorded_at timestamptz,
  p_is_final boolean, p_reconstructed boolean, p_entries jsonb
) returns boolean language plpgsql security invoker set search_path = public as $$
declare
  v_tournament uuid;
  v_round public.arena_rounds%rowtype;
  v_published uuid[];
  v_expected uuid[];
begin
  select tournament_id into strict v_tournament from public.arena_rounds where id = p_round_id;
  perform 1 from public.arena_tournaments where id = v_tournament for update;
  select * into strict v_round from public.arena_rounds where id = p_round_id for update;
  if v_round.ranking_snapshot_at is not null then return true; end if;
  select coalesce(array_agg(id order by id), '{}'::uuid[]) into v_published
    from public.arena_rounds where tournament_id = v_tournament and results_published_at is not null;
  select coalesce(array_agg(id order by id), '{}'::uuid[]) into v_expected from unnest(p_expected_published_ids) id;
  if v_published is distinct from v_expected then return false; end if;
  if v_round.closes_at is null or v_round.closes_at > now() then
    raise exception 'La manche doit être clôturée avant publication.';
  end if;
  if exists (select 1 from public.arena_attempts where round_id = p_round_id and status = 'in_progress') then
    raise exception 'Des tentatives sont encore ouvertes.';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_entries) as e(participant_id uuid)
    left join public.arena_participants p on p.id = e.participant_id
    where p.id is null or p.tournament_id <> v_tournament
  ) then raise exception 'Participant étranger au tournoi.'; end if;

  insert into public.arena_rank_history(round_id, participant_id, round_number, rank, total_score, total_max, recorded_at, is_final, reconstructed)
    select p_round_id, e.participant_id, v_round.number, e.rank, e.total_score, e.total_max,
      coalesce(v_round.results_published_at, p_recorded_at), p_is_final, p_reconstructed
    from jsonb_to_recordset(p_entries) as e(participant_id uuid, rank int, total_score numeric, total_max numeric);
  update public.arena_rounds set results_published_at = coalesce(results_published_at, p_recorded_at), ranking_snapshot_at = now()
    where id = p_round_id;
  return true;
end;
$$;
revoke all on function public.arena_publish_ranking_snapshot(uuid, uuid[], timestamptz, boolean, boolean, jsonb) from public, anon, authenticated;
grant execute on function public.arena_publish_ranking_snapshot(uuid, uuid[], timestamptz, boolean, boolean, jsonb) to service_role;
