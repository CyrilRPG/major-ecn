-- Équipe & Permissions : un enseignant peut désormais avoir une spécialité
-- ouverte EN ENTIER et une autre limitée à certains items (07/10/2026).
--
-- La RLS (`accessible_cours_ids`) ne connaît qu'une liste `cours`, valable
-- pour tous ses collèges : à l'enregistrement, cette liste reçoit les items
-- choisis ET tous les items des spécialités ouvertes en entier
-- (lib/auth/collaborateurs.ts, `coursDuPerimetre`). Un item créé ensuite dans
-- une spécialité ouverte en entier n'y figurerait jamais : ce déclencheur l'y
-- ajoute, comme 20260914130000 le fait pour les élèves.
--
-- Règle, pour un enseignant (role 'professor', type 'college', liste `cours`
-- non vide, collège de l'item dans `colleges`) :
--   - périmètre avec `perimetre.items` : ajouté si ni le collège ni son
--     parent n'est une clé de `perimetre.items` (spécialité limitée) ;
--   - sinon (liste historique) : ajouté s'il avait déjà tous les autres items
--     du collège, même règle que pour les élèves.
-- La fonction des élèves est conservée telle quelle ; celle-ci s'y ajoute.

create or replace function public.cours_nouveau_item_listes_enseignants()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  parent text;
  autres text[];
begin
  select m.parent_matiere_id into parent from public.matieres m where m.id = new.matiere_id;
  select coalesce(array_agg(c.id::text), '{}')
    into autres
  from public.cours c
  where c.matiere_id = new.matiere_id and c.id <> new.id;

  update public.profiles p
  set permission_scope = jsonb_set(
        p.permission_scope, '{cours}',
        (p.permission_scope->'cours') || to_jsonb(new.id::text), true)
  where p.role = 'professor'
    and p.permission_scope->>'type' = 'college'
    and p.permission_scope->'colleges' @> to_jsonb(new.matiere_id::text)
    and jsonb_typeof(p.permission_scope->'cours') = 'array'
    and jsonb_array_length(p.permission_scope->'cours') > 0
    and not (p.permission_scope->'cours' @> to_jsonb(new.id::text))
    and case
      when jsonb_typeof(p.permission_scope->'perimetre'->'items') = 'object' then
        not (p.permission_scope->'perimetre'->'items' ? new.matiere_id)
        and (parent is null or not (p.permission_scope->'perimetre'->'items' ? parent))
      else (p.permission_scope->'cours') @> to_jsonb(autres)
    end;
  return new;
end;
$$;

drop trigger if exists cours_nouveau_item_listes_enseignants on public.cours;
create trigger cours_nouveau_item_listes_enseignants
  after insert on public.cours
  for each row execute function public.cours_nouveau_item_listes_enseignants();
