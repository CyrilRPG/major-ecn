-- EVC Arena — visuel de tournoi, corrigés consultables en pages, prospects.
--
-- 1. `arena_tournaments.cover_image_path` : chemin (bucket public `arena-public`)
--    du visuel déposé à la création du tournoi, affiché sur la carte
--    « Choisissez votre tournoi ». Null = visuel par défaut de la spécialité.
-- 2. `arena_rounds.corrections_pages` : nombre de pages PNG rendues à partir
--    du corrigé PDF (fourni ou généré par IA), stockées dans le bucket privé
--    `arena` sous `<tournoi>/corrections-m<n>-pages/<k>.png`. Les participants
--    consultent ces pages dans la visionneuse de leur espace (filigrane
--    nominatif brûlé dans l'image, aucun fichier ni URL publique).
-- 3. `corrections_pdf_source` accepte 'ai' (corrigé rédigé par IA à partir
--    des corrigés de la base, facturé 1 € — voir BILLING_EUR.arena_corrections).
-- 4. Bucket public `arena-public` : visuels de tournoi (lecture publique,
--    écriture réservée aux administrateurs).
-- 5. `arena_news_leads` : adresses laissées dans l'encart « Autres spécialités
--    à venir » de la page d'accueil EVC Arena (consentement horodaté).

alter table public.arena_tournaments add column if not exists cover_image_path text;
comment on column public.arena_tournaments.cover_image_path is
  'Visuel de la carte du tournoi (bucket public arena-public). Null = visuel par défaut de la spécialité.';

alter table public.arena_rounds add column if not exists corrections_pages integer not null default 0;
comment on column public.arena_rounds.corrections_pages is
  'Nombre de pages PNG rendues à partir du corrigé PDF (bucket privé arena, <tournoi>/corrections-m<n>-pages/<k>.png). 0 = aucune.';

alter table public.arena_rounds drop constraint if exists arena_rounds_corrections_pdf_source_check;
alter table public.arena_rounds add constraint arena_rounds_corrections_pdf_source_check
  check (corrections_pdf_source is null or corrections_pdf_source in ('generated', 'uploaded', 'ai'));

insert into storage.buckets (id, name, public)
values ('arena-public', 'arena-public', true)
on conflict (id) do nothing;

drop policy if exists arena_public_storage_read on storage.objects;
create policy arena_public_storage_read on storage.objects for select
  using (bucket_id = 'arena-public');

drop policy if exists arena_public_storage_admin_write on storage.objects;
create policy arena_public_storage_admin_write on storage.objects for all to authenticated
  using (bucket_id = 'arena-public' and public.current_role() = 'admin')
  with check (bucket_id = 'arena-public' and public.current_role() = 'admin');

create table if not exists public.arena_news_leads (
  id          uuid primary key default gen_random_uuid(),
  faculte_id  text not null default 'major-ecn',
  email       text not null,
  consent_at  timestamptz not null default now(),
  source      text,
  created_at  timestamptz not null default now(),
  unique (faculte_id, email)
);
alter table public.arena_news_leads enable row level security;
drop policy if exists arena_news_leads_admin_all on public.arena_news_leads;
create policy arena_news_leads_admin_all on public.arena_news_leads for all
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
