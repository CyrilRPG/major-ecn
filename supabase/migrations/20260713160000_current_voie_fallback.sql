-- INCIDENT VOIE EXTERNE (suite) : l'application et l'admin lisent la voie via
-- parseScope() = permission_scope.paid_voie ?? permission_scope.voie. Or
-- current_voie() (utilisée par la RLS qcm_series_voie_restrict) ne lisait QUE
-- paid_voie. Résultat : un élève dont la voie est stockée dans `voie` (mais pas
-- `paid_voie`) apparaît bien « externe/interne » côté admin, MAIS la RLS voyait
-- null → `else true` → accès à TOUS les QCM/DP au lieu des seuls QROC.
--
-- Correctif : current_voie() applique la MÊME résolution que parseScope :
--   paid_voie → voie → signup.voie, normalisée en 'externe'/'interne'.
create or replace function public.current_voie()
 returns text
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select case
           when v in ('externe', 'voie externe') then 'externe'
           when v in ('interne', 'voie interne') then 'interne'
           else nullif(v, '')
         end
  from (
    select lower(trim(coalesce(
      nullif(permission_scope->>'paid_voie', ''),
      nullif(permission_scope->>'voie', ''),
      permission_scope->'signup'->>'voie'
    ))) as v
    from public.profiles
    where id = auth.uid()
  ) t;
$function$;
