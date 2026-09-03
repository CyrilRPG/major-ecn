-- Erreurs survenues dans le navigateur des élèves, rapportées par
-- app/error.tsx via POST /api/client-errors (03/09/2026).
--
-- Jusqu'ici l'écran « Cette page n'a pas pu s'afficher » ne laissait aucune
-- trace côté serveur. Cette table garde la page, le message, la pile et le
-- navigateur, pour diagnostiquer après coup. Écriture par le service role
-- uniquement (la route API) ; lecture réservée aux administrateurs.

create table if not exists public.client_errors (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text,
  message     text,
  stack       text,
  digest      text,
  url         text,
  user_agent  text,
  auto_reload boolean not null default false
);

create index if not exists client_errors_created_at_idx on public.client_errors (created_at desc);

alter table public.client_errors enable row level security;

drop policy if exists client_errors_admin_read on public.client_errors;
create policy client_errors_admin_read on public.client_errors
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Purge : au-delà de 90 jours, les rapports n'ont plus d'intérêt.
comment on table public.client_errors is
  'Rapports d''erreurs client (app/error.tsx). Purger les lignes de plus de 90 jours.';
