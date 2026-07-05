-- INCIDENT ACCÈS VOIE EXTERNE :
-- current_voie() renvoyait la valeur brute de permission_scope->>'paid_voie'.
-- Or l'inscription stocke tantôt 'externe'/'interne' (checkout), tantôt le
-- LIBELLÉ 'Voie externe'/'Voie interne' (formulaires espace découverte / profil).
-- La policy RLS qcm_series_voie_restrict compare à 'externe'/'interne' : toute
-- valeur au format libellé tombait dans le `else true` du CASE → accès TOTAL
-- (DP + QCM) au lieu de « QROC uniquement ». Cas constaté : une étudiante MG
-- voie externe voyait tous les DP/QCM.
--
-- Correctif durable : current_voie() normalise n'importe quel format en
-- 'externe'/'interne' (unique point de lecture de la voie côté enforcement).
-- Ainsi, quelle que soit la valeur écrite par les formulaires (passée ou
-- future), la RLS applique correctement la restriction. Aucun autre objet
-- (policy, colonnes précalculées) n'est modifié.

create or replace function public.current_voie()
 returns text
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select case
           when v in ('externe', 'voie externe') then 'externe'
           when v in ('interne', 'voie interne') then 'interne'
           else nullif(v, '')            -- inconnu → null → `else true` de la policy (comportement inchangé)
         end
  from (
    select lower(trim(permission_scope->>'paid_voie')) as v
    from public.profiles
    where id = auth.uid()
  ) t;
$function$;
