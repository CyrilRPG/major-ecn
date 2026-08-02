-- Plusieurs supports PDF par vidéo (séance approfondie ou cours vidéo).
-- La colonne videos.support_path n'en portait qu'un seul.
create table if not exists public.video_supports (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  titre text not null default 'Support',
  storage_path text not null,
  pages integer,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists video_supports_video_idx
  on public.video_supports (video_id, order_index);

-- Reprise des supports déjà déposés (un par vidéo) — aucun contenu perdu.
insert into public.video_supports (video_id, titre, storage_path, order_index)
select v.id, 'Support de la séance', v.support_path, 0
from public.videos v
where v.support_path is not null
  and not exists (select 1 from public.video_supports s where s.video_id = v.id);

alter table public.video_supports enable row level security;

-- Lecture : mêmes conditions que la vidéo dont le support dépend (la RLS de
-- `videos` porte déjà le périmètre faculté et l'expiration d'accès). Le fichier
-- lui-même reste dans un bucket privé, servi uniquement par la route
-- /api/supports/... qui vérifie la formule.
drop policy if exists video_supports_read on public.video_supports;
create policy video_supports_read on public.video_supports
  for select to authenticated
  using (exists (select 1 from public.videos v where v.id = video_supports.video_id));

drop policy if exists video_supports_admin on public.video_supports;
create policy video_supports_admin on public.video_supports
  for all to authenticated
  using (public."current_role"() = 'admin')
  with check (public."current_role"() = 'admin');
