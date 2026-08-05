-- Corrige le bonus Gériatrie → MG (20260805150000) : `col-medecine-generale`
-- est un collège PARENT sans cours propres — tous ses cours vivent dans des
-- sous-collèges (col-mg-cardiologie, col-dermatologie, …). Le navigateur
-- élève (getNavigatorTree) filtre CHAQUE sous-collège individuellement via
-- canAccessCollege : sans les lister explicitement dans `colleges`, aucun
-- sous-collège (donc aucun cours bonus) n'apparaissait dans le menu, alors
-- même que `permission_scope.cours` les autorisait déjà.
--
-- Ajoute les matiere_id des cours bonus (dérivés dynamiquement, pas de liste
-- en dur) aux `colleges` des élèves Gériatrie déjà migrés.
do $$
declare
  r record;
  subcolleges jsonb;
  merged_colleges jsonb;
begin
  for r in
    select id, permission_scope
    from public.profiles
    where role = 'student'
      and permission_scope->'colleges' @> '"col-geriatrie"'::jsonb
  loop
    select coalesce(jsonb_agg(distinct to_jsonb(c.matiere_id)), '[]'::jsonb) into subcolleges
    from public.cours c
    where c.id::text in (
      select jsonb_array_elements_text(r.permission_scope->'cours')
    )
    and c.matiere_id in (
      select id from public.matieres where parent_matiere_id = 'col-medecine-generale'
      union all select 'col-medecine-generale'
    );

    select (
      select jsonb_agg(distinct v)
      from jsonb_array_elements(r.permission_scope->'colleges' || subcolleges) v
    ) into merged_colleges;

    update public.profiles
    set permission_scope = jsonb_set(r.permission_scope, '{colleges}', merged_colleges, true)
    where id = r.id;
  end loop;
end $$;
