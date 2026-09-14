-- Un nouvel item d'un collège rejoint automatiquement la liste `cours` des
-- élèves qui avaient accès à TOUT ce collège.
--
-- Constaté le 14/09/2026 : l'item « Annales - Gériatrie », créé par la
-- scission des items d'annales (20260914100000), était invisible pour les
-- 42 élèves de Gériatrie. Leur périmètre porte une liste explicite de cours
-- (bonus Médecine générale, cf. lib/auth/geriatrie-mg-bonus.ts) et, dès
-- qu'une telle liste existe, `canAccessCours()` et la policy
-- `exact_college_course_rls` n'ouvrent que les cours listés — un item ajouté
-- après coup n'y figure jamais. Le même piège avait déjà frappé les annales de
-- Médecine générale (20260822090000). Les 42 listes ont été complétées par
-- script le jour même ; ce fichier rend le rattrapage automatique.
--
-- Règle : à l'insertion d'un cours dans un collège M, tout élève dont le
-- périmètre (type 'college') liste M dans `colleges`, porte une liste `cours`
-- non vide, et contenait déjà TOUS les autres cours de M (il avait donc M en
-- entier) reçoit le nouvel identifiant. Un élève qui n'avait qu'une partie de
-- M (bonus) n'est pas touché.

create or replace function public.cours_nouveau_item_listes_eleves()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  autres text[];
begin
  select coalesce(array_agg(c.id::text), '{}')
    into autres
  from public.cours c
  where c.matiere_id = new.matiere_id and c.id <> new.id;

  update public.profiles p
  set permission_scope = jsonb_set(
        p.permission_scope, '{cours}',
        (p.permission_scope->'cours') || to_jsonb(new.id::text), true)
  where p.role = 'student'
    and p.permission_scope->>'type' = 'college'
    and p.permission_scope->'colleges' @> to_jsonb(new.matiere_id::text)
    and jsonb_typeof(p.permission_scope->'cours') = 'array'
    and jsonb_array_length(p.permission_scope->'cours') > 0
    and not (p.permission_scope->'cours' @> to_jsonb(new.id::text))
    and (p.permission_scope->'cours') @> to_jsonb(autres);

  return new;
end;
$$;

drop trigger if exists cours_nouveau_item_listes_eleves on public.cours;
create trigger cours_nouveau_item_listes_eleves
  after insert on public.cours
  for each row execute function public.cours_nouveau_item_listes_eleves();

-- Rattrapage idempotent des items déjà créés (Gériatrie comprise) : même règle,
-- appliquée à tout cours absent d'une liste qui contenait le reste du collège.
update public.profiles p
set permission_scope = jsonb_set(
      p.permission_scope, '{cours}',
      (p.permission_scope->'cours') || to_jsonb(c.id::text), true)
from public.cours c
where p.role = 'student'
  and p.permission_scope->>'type' = 'college'
  and p.permission_scope->'colleges' @> to_jsonb(c.matiere_id::text)
  and jsonb_typeof(p.permission_scope->'cours') = 'array'
  and jsonb_array_length(p.permission_scope->'cours') > 0
  and not (p.permission_scope->'cours' @> to_jsonb(c.id::text))
  and (p.permission_scope->'cours') @> (
    select coalesce(jsonb_agg(o.id::text), '[]'::jsonb)
    from public.cours o
    where o.matiere_id = c.matiere_id and o.id <> c.id
  );
