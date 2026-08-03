-- Audit de vitesse — page « Élèves » de l'administration.
--
-- Constat. Pour afficher un simple drapeau « jamais connecté », la page
-- paginait l'API Auth de Supabase : `listUsers({ page, perPage: 200 })` dans
-- une boucle SÉQUENTIELLE allant jusqu'à 40 pages, soit jusqu'à 40 allers-
-- retours HTTP enchaînés vers un service externe. Et comme chaque action de la
-- page (activer, désactiver, renvoyer l'activation, modifier, assigner une
-- session…) appelle `router.refresh()`, la boucle entière était rejouée à
-- CHAQUE clic. C'est la cause directe du « je clique et il ne se passe rien »
-- signalé sur cette page.
--
-- La même boucle existait dans le cron de relance des inactifs.
--
-- Correctif. `last_sign_in_at` et `invited_at` vivent dans `auth.users`, dans
-- la même base : une seule requête SQL suffit. On expose une fonction dédiée
-- plutôt que d'ouvrir `auth.users` en lecture.

create or replace function public.admin_activite_auth()
returns table (user_id uuid, last_sign_in_at timestamptz, invited_at timestamptz)
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
begin
  -- SECURITY DEFINER lit `auth.users` : l'accès doit être verrouillé
  -- explicitement. Deux appelants légitimes seulement — un administrateur
  -- connecté, et les tâches serveur qui utilisent la clé de service.
  if coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') <> 'service_role'
     and coalesce(public."current_role"(), '') <> 'admin' then
    raise exception 'Réservé aux administrateurs.' using errcode = '42501';
  end if;

  return query
    select u.id, u.last_sign_in_at, u.invited_at
    from auth.users u;
end;
$function$;

revoke all on function public.admin_activite_auth() from public, anon;
grant execute on function public.admin_activite_auth() to authenticated, service_role;
