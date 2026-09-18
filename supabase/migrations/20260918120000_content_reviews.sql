-- Relecture des contenus par les professeurs (retours des correcteurs, 18/09/2026).
--
-- Deux marques, posées depuis la vue élève :
--  - scope 'serie' : « cette série de QCM / DP / QROC a été relue » ;
--  - scope 'cours' : « j'ai fini de tout relire pour cet item » (fiche,
--    flashcards, QCM).
-- Une marque = qui, quand. La retirer = supprimer la ligne (une série
-- retouchée se remarque à la main). Aucun élève ne lit ni n'écrit ici : la
-- table est réservée au personnel (RLS), et l'application passe par le client
-- service-role après contrôle du périmètre du professeur.

create table if not exists public.content_reviews (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('serie', 'cours')),
  cours_id uuid not null references public.cours(id) on delete cascade,
  serie_id uuid references public.qcm_series(id) on delete cascade,
  reviewed_by uuid not null references public.profiles(id) on delete cascade,
  reviewed_by_name text,
  reviewed_at timestamptz not null default now(),
  constraint content_reviews_serie_coherente
    check ((scope = 'serie') = (serie_id is not null))
);

-- Une seule marque par série, une seule par item.
create unique index if not exists content_reviews_serie_unique
  on public.content_reviews (serie_id) where scope = 'serie';
create unique index if not exists content_reviews_cours_unique
  on public.content_reviews (cours_id) where scope = 'cours';
create index if not exists content_reviews_cours_idx on public.content_reviews (cours_id);

alter table public.content_reviews enable row level security;

drop policy if exists content_reviews_staff_read on public.content_reviews;
create policy content_reviews_staff_read on public.content_reviews
  for select
  using ((select public.current_role()) in ('admin', 'professor'));

drop policy if exists content_reviews_staff_write on public.content_reviews;
create policy content_reviews_staff_write on public.content_reviews
  for all
  using ((select public.current_role()) in ('admin', 'professor'))
  with check ((select public.current_role()) in ('admin', 'professor'));

comment on table public.content_reviews is
  'Marques de relecture posées par les professeurs : une par série (scope serie) ou par item entier (scope cours).';
