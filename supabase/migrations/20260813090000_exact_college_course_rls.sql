-- Sécurité : un scope `college` ne doit jamais être traité comme un accès
-- intégral au contenu. Les fonctions optimisées historiques ouvraient toute la
-- faculté puis déléguaient le filtrage à l'application, ce qui était fail-open.

create or replace function public.accessible_matiere_ids()
returns setof text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select m.id
  from public.matieres m
  join public.profiles p on p.id = auth.uid()
  where p.role = 'admin'
     or p.permission_scope->>'type' = 'all'
     or (
       p.permission_scope->>'type' = 'college'
       and case
         when jsonb_typeof(p.permission_scope->'colleges') = 'array'
           then p.permission_scope->'colleges' ? m.id
         else false
       end
     );
$$;

create or replace function public.accessible_cours_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select c.id
  from public.cours c
  join public.profiles p on p.id = auth.uid()
  where p.role = 'admin'
     or p.permission_scope->>'type' = 'all'
     or (
       p.permission_scope->>'type' = 'college'
       and case
         when jsonb_typeof(p.permission_scope->'colleges') = 'array'
           then p.permission_scope->'colleges' ? c.matiere_id
         else false
       end
       and (
         jsonb_typeof(p.permission_scope->'cours') is distinct from 'array'
         or jsonb_array_length(p.permission_scope->'cours') = 0
         or p.permission_scope->'cours' ? c.id::text
       )
     );
$$;

grant execute on function public.accessible_matiere_ids() to authenticated, anon;
grant execute on function public.accessible_cours_ids() to authenticated, anon;

drop policy if exists matieres_read on public.matieres;
create policy matieres_read on public.matieres
  for select
  using (id in (select * from public.accessible_matiere_ids()));

drop policy if exists cours_read on public.cours;
create policy cours_read on public.cours
  for select
  using (id in (select * from public.accessible_cours_ids()));

drop policy if exists videos_read on public.videos;
create policy videos_read on public.videos
  for select
  using (cours_id in (select * from public.accessible_cours_ids()));

drop policy if exists fiches_read on public.fiches;
create policy fiches_read on public.fiches
  for select
  using (cours_id in (select * from public.accessible_cours_ids()));

drop policy if exists flashcards_read on public.flashcards;
create policy flashcards_read on public.flashcards
  for select
  using (cours_id in (select * from public.accessible_cours_ids()));

drop policy if exists cours_content_slots_read on public.cours_content_slots;
create policy cours_content_slots_read on public.cours_content_slots
  for select
  using (cours_id in (select * from public.accessible_cours_ids()));

drop policy if exists qcm_series_read on public.qcm_series;
create policy qcm_series_read on public.qcm_series
  for select
  using (cours_id in (select * from public.accessible_cours_ids()));

comment on function public.accessible_matiere_ids() is
  'Collèges strictement autorisés par permission_scope ; jamais fail-open.';
comment on function public.accessible_cours_ids() is
  'Cours strictement autorisés par permission_scope.colleges et permission_scope.cours.';
