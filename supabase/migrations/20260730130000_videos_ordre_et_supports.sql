-- Gestion autonome des vidéos par l'administrateur.
--
-- 1) `order_index` : l'ordre des vidéos d'un item était l'ordre de création,
--    impossible à modifier. On le rend explicite, par (cours, type) — les
--    « Cours vidéo » et les « Séances approfondies » sont deux listes
--    indépendantes dans l'interface élève.
-- 2) Support de séance : un PDF facultatif attaché à UNE vidéo. Il est servi
--    exclusivement par /api/supports/[videoId]/pdf, watermarké au nom de
--    l'élève, jamais téléchargeable. Le bucket est privé et n'est lisible que
--    par le staff : les élèves n'y accèdent que via la route serveur.

alter table public.videos
  add column if not exists order_index integer not null default 0,
  add column if not exists support_path text,
  add column if not exists support_pages integer,
  add column if not exists support_updated_at timestamptz;

-- Reprise de l'ordre existant : on fige l'ordre d'affichage actuel
-- (création croissante) pour que rien ne bouge côté élève.
with ranked as (
  select id, (row_number() over (partition by cours_id, type order by created_at, id) - 1) as rn
  from public.videos
)
update public.videos v
set order_index = ranked.rn
from ranked
where ranked.id = v.id;

create index if not exists videos_cours_type_order_idx
  on public.videos (cours_id, type, order_index);

-- Bucket privé des supports de séance.
insert into storage.buckets (id, name, public)
values ('supports', 'supports', false)
on conflict (id) do nothing;

-- Écriture réservée au staff (admin + professeur), comme l'édition de contenu.
drop policy if exists storage_supports_staff_write on storage.objects;
create policy storage_supports_staff_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'supports' and public.current_role() in ('admin', 'professor'));

drop policy if exists storage_supports_staff_update on storage.objects;
create policy storage_supports_staff_update on storage.objects
  for update to authenticated
  using (bucket_id = 'supports' and public.current_role() in ('admin', 'professor'))
  with check (bucket_id = 'supports' and public.current_role() in ('admin', 'professor'));

drop policy if exists storage_supports_staff_delete on storage.objects;
create policy storage_supports_staff_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'supports' and public.current_role() in ('admin', 'professor'));

-- Lecture directe réservée au staff : l'élève passe par la route watermarkée.
drop policy if exists storage_supports_staff_read on storage.objects;
create policy storage_supports_staff_read on storage.objects
  for select to authenticated
  using (bucket_id = 'supports' and public.current_role() in ('admin', 'professor'));
