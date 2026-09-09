-- Chaque email garde son propre lien : un renvoi ne remplace plus le précédent.
create table if not exists public.arena_access_tokens (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.arena_participants(id) on delete cascade,
  kind text not null check (kind in ('login', 'confirmation')),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  used_at timestamptz,
  legacy boolean not null default false,
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sent', 'failed'))
);
create index if not exists arena_access_tokens_participant_idx
  on public.arena_access_tokens(participant_id, created_at desc);
alter table public.arena_access_tokens enable row level security;
revoke all on public.arena_access_tokens from public, anon, authenticated;
grant all on public.arena_access_tokens to service_role;

-- Les liens déjà envoyés restent valables pendant le déploiement.
insert into public.arena_access_tokens(participant_id, kind, token_hash, created_at, expires_at, delivery_status, legacy)
select id, 'login', login_token_hash, login_token_expires_at - interval '2 hours', login_token_expires_at, 'sent', true
from public.arena_participants where login_token_hash is not null and login_token_expires_at is not null
on conflict (token_hash) do nothing;
insert into public.arena_access_tokens(participant_id, kind, token_hash, created_at, delivery_status, legacy)
select id, 'confirmation', confirmation_token_hash, coalesce(confirmation_sent_at, now()), 'sent', true
from public.arena_participants where confirmation_token_hash is not null
on conflict (token_hash) do nothing;

-- Verrou par participant : même deux demandes simultanées respectent les 60 s.
create or replace function public.arena_reserve_access_token(p_participant_id uuid, p_kind text, p_token_hash text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  p public.arena_participants%rowtype;
  latest timestamptz;
  token_id uuid;
  expiry timestamptz;
begin
  if p_kind not in ('login', 'confirmation') then raise exception 'Invalid token kind'; end if;
  select * into p from public.arena_participants where id = p_participant_id for update;
  if not found or p.blocked_at is not null or p.anonymized_at is not null then
    return jsonb_build_object('ok', false, 'status', 'blocked');
  end if;
  select max(created_at) into latest from public.arena_access_tokens
    where participant_id = p.id and delivery_status <> 'failed' and used_at is null
      and (expires_at is null or expires_at > now());
  if latest > now() - interval '60 seconds' then
    return jsonb_build_object('ok', true, 'throttled', true,
      'retryAfter', greatest(1, ceil(extract(epoch from latest + interval '60 seconds' - now()))::int));
  end if;
  expiry := case when p_kind = 'login' then now() + interval '2 hours' else now() + interval '7 days' end;
  insert into public.arena_access_tokens(participant_id, kind, token_hash, expires_at)
    values (p.id, p_kind, p_token_hash, expiry) returning id into token_id;
  return jsonb_build_object('ok', true, 'tokenId', token_id, 'expiresAt', expiry);
end;
$$;

-- Validation et consommation atomiques. Un GET ne fait jamais appel à ce RPC.
create or replace function public.arena_consume_access_token(p_token_hash text, p_kind text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  tok public.arena_access_tokens%rowtype;
  p public.arena_participants%rowtype;
  has_token boolean;
  first_confirmation boolean;
begin
  if p_kind not in ('login', 'confirmation') then raise exception 'Invalid token kind'; end if;
  select * into tok from public.arena_access_tokens where token_hash = p_token_hash and kind = p_kind for update;
  has_token := found;
  if has_token then
    if tok.used_at is not null or tok.delivery_status = 'failed' then
      return jsonb_build_object('ok', false, 'status', 'unknown');
    end if;
    if tok.expires_at is not null and tok.expires_at <= now() then
      return jsonb_build_object('ok', false, 'status', 'expired');
    end if;
    select * into p from public.arena_participants where id = tok.participant_id for update;
  else
    -- Compatibilité avec les emails émis par une ancienne instance pendant le déploiement.
    select * into p from public.arena_participants
      where (p_kind = 'login' and login_token_hash = p_token_hash)
         or (p_kind = 'confirmation' and confirmation_token_hash = p_token_hash) for update;
    if not found then return jsonb_build_object('ok', false, 'status', 'unknown'); end if;
    if p_kind = 'login' and (p.login_token_expires_at is null or p.login_token_expires_at <= now()) then
      return jsonb_build_object('ok', false, 'status', 'expired');
    end if;
  end if;
  if p.id is null then return jsonb_build_object('ok', false, 'status', 'unknown'); end if;
  if has_token and tok.legacy and
     (case when p_kind = 'login' then p.login_token_hash else p.confirmation_token_hash end) is distinct from p_token_hash then
    return jsonb_build_object('ok', false, 'status', 'unknown');
  end if;
  if p.blocked_at is not null or p.anonymized_at is not null then
    return jsonb_build_object('ok', false, 'status', 'blocked');
  end if;
  first_confirmation := p.email_confirmed_at is null;
  if has_token then update public.arena_access_tokens set used_at = now() where id = tok.id; end if;
  update public.arena_participants set
    email_confirmed_at = coalesce(email_confirmed_at, now()), last_login_at = now(),
    login_token_expires_at = case when login_token_hash = p_token_hash then null else login_token_expires_at end,
    login_token_hash = case when login_token_hash = p_token_hash then null else login_token_hash end,
    confirmation_token_hash = case when confirmation_token_hash = p_token_hash then null else confirmation_token_hash end
    where id = p.id;
  return jsonb_build_object('ok', true, 'participantId', p.id, 'tournamentId', p.tournament_id, 'first', first_confirmation);
end;
$$;
revoke all on function public.arena_reserve_access_token(uuid, text, text) from public, anon, authenticated;
revoke all on function public.arena_consume_access_token(text, text) from public, anon, authenticated;
grant execute on function public.arena_reserve_access_token(uuid, text, text) to service_role;
grant execute on function public.arena_consume_access_token(text, text) to service_role;
