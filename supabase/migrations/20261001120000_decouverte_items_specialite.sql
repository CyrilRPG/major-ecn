-- Offre Découverte par spécialité (01/10/2026).
--
-- Le collège `col-decouverte` porte désormais un item par spécialité
-- (Pédiatrie, Gynécologie-obstétrique, Médecine d'urgence) en plus de
-- « Pneumologie » (Médecine générale et toute autre spécialité) et de
-- « Méthodologie EVC ». Un candidat ne doit voir que l'item de SA spécialité.
--
-- Mécanisme : `permission_scope.decouverte_cours` (tableau d'identifiants) liste
-- les items du collège Découverte ouverts au compte. Il ne restreint QUE ce
-- collège — contrairement à `permission_scope.cours`, qui s'applique à tous les
-- collèges du scope et survivrait à un passage en formule payante (le compte
-- n'aurait alors vu que deux items de sa spécialité achetée).
--   - clé présente : seuls les items listés du collège Découverte ;
--   - clé absente  : les items du collège Découverte qui ne sont pas en accès
--                    restreint (`access_type = 'specific'`), c'est-à-dire
--                    « Pneumologie » et « Méthodologie EVC » — comportement
--                    inchangé pour la Médecine générale, les autres spécialités
--                    et les anciens découverte passés en formule payante.
-- Les items de spécialité sont en `access_type = 'specific'`.
--
-- Miroir applicatif : `canAccessCours()` (src/lib/auth/permissions.ts).
-- Administration et professeurs : non concernés.

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
  where (
       p.role = 'admin'
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
    )
  )
  and (
       c.matiere_id is distinct from 'col-decouverte'
    or p.role in ('admin', 'professor')
    or case
         when jsonb_typeof(p.permission_scope->'decouverte_cours') = 'array'
           then p.permission_scope->'decouverte_cours' ? c.id::text
         else c.access_type is distinct from 'specific'
       end
  );
$$;

grant execute on function public.accessible_cours_ids() to authenticated, anon;

comment on function public.accessible_cours_ids() is
  'Cours strictement autorisés par permission_scope.colleges et permission_scope.cours ; collège Découverte filtré par permission_scope.decouverte_cours (sinon items non restreints).';
