-- =============================================
-- Périodes d'accès (sessions EVC), appareils, idempotence synchro mobile
--
-- Modèle : l'accès d'un étudiant expire à `profiles.access_end` si défini,
-- sinon à `evc_sessions.default_access_end` de sa session, sinon jamais
-- (NULL/NULL = comportement historique — aucun backfill nécessaire).
-- =============================================

-- ---------------------------------------------
-- Sessions EVC (promotions à échéance fixe)
-- ---------------------------------------------
create table public.evc_sessions (
  id                 text primary key,                 -- slug, ex. 'evc-2026'
  label              text not null,                    -- 'Session EVC 2026'
  default_access_end timestamptz not null,
  is_default         boolean not null default false,   -- session affectée aux nouveaux achats
  created_at         timestamptz not null default now()
);

alter table public.evc_sessions enable row level security;
create policy evc_sessions_read on public.evc_sessions
  for select using (true);
create policy evc_sessions_admin_write on public.evc_sessions
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- Une seule session par défaut à la fois
create unique index evc_sessions_one_default on public.evc_sessions (is_default) where is_default;

-- ---------------------------------------------
-- Colonnes de période d'accès sur profiles
-- ---------------------------------------------
alter table public.profiles
  add column evc_session_id text references public.evc_sessions(id) on delete set null,
  add column access_start   timestamptz,
  add column access_end     timestamptz;  -- override individuel ; null = hérite de la session

-- Fin d'accès effective d'un étudiant (override individuel sinon défaut de session).
-- NULL pour les non-étudiants et les étudiants sans session ⇒ pas d'expiration.
create or replace function public.effective_access_end(p_user uuid)
returns timestamptz language sql stable security definer set search_path = public as $$
  select coalesce(p.access_end, s.default_access_end)
  from public.profiles p
  left join public.evc_sessions s on s.id = p.evc_session_id
  where p.id = p_user and p.role = 'student';
$$;

create or replace function public.access_expired()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.effective_access_end(auth.uid()) < now(), false);
$$;

-- ---------------------------------------------
-- Historique des appareils (audit de la session unique)
-- `id` = la valeur écrite dans profiles.active_session_id au moment de
-- l'enregistrement ; une seule ligne non révoquée par utilisateur en pratique.
-- ---------------------------------------------
create table public.devices (
  id            uuid primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  platform      text not null check (platform in ('web', 'ios', 'android')),
  model         text,
  name          text,
  app_version   text,
  registered_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  revoked_at    timestamptz
);

create index devices_user_idx on public.devices (user_id, registered_at desc);

alter table public.devices enable row level security;
create policy devices_self_read on public.devices
  for select using (user_id = auth.uid() or public.current_role() = 'admin');
-- écritures : service-role uniquement (aucune policy insert/update)

-- ---------------------------------------------
-- Idempotence de la synchro mobile (dédup des op_id clients)
-- ---------------------------------------------
create table public.sync_ops (
  op_id      uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  applied_at timestamptz not null default now()
);

create index sync_ops_applied_idx on public.sync_ops (applied_at);

alter table public.sync_ops enable row level security;
-- accès service-role uniquement (aucune policy)
