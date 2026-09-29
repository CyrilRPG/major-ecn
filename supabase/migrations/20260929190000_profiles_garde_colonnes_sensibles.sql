-- Faille corrigée le 29/09/2026 : un élève pouvait, en principe, modifier
-- n'importe quelle colonne de SON profil par l'API (permission_scope,
-- can_download, access_end, is_active…) — `authenticated` a le droit UPDATE
-- sur toutes les colonnes et la policy `profiles_self_update` ne gardait que
-- `role`. Seule une récursion (42P17) de cette policy l'en empêchait, par
-- accident — et cassait du même coup le changement de pseudo (web) et la
-- modification nom/téléphone (app mobile), qui écrivent avec la session.
--
-- 1. Trigger de garde : hors administrateur, hors service-role et hors
--    fonctions SECURITY DEFINER (qui s'exécutent sous leur propriétaire),
--    toute modification d'une colonne sensible est refusée. Restent libres
--    pour l'élève : prénom, nom, téléphone, adresse, pseudo, avatar et ses
--    justificatifs (cv, certificat de scolarité, carte pro).
-- 2. Policy `profiles_self_update` sans récursion : le rôle est comparé à
--    `current_role()` (SECURITY DEFINER) au lieu d'une sous-requête sur
--    `profiles`.

create or replace function public.profiles_garde_colonnes_sensibles()
returns trigger
language plpgsql
-- SECURITY INVOKER (défaut) : `current_user` doit être le rôle APPELANT.
set search_path to 'public'
as $function$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if (select public."current_role"()) = 'admin' then
    return new;
  end if;
  if new.id is distinct from old.id
     or new.role is distinct from old.role
     or new.email is distinct from old.email
     or new.permission_scope is distinct from old.permission_scope
     or new.promotion is distinct from old.promotion
     or new.faculte_id is distinct from old.faculte_id
     or new.is_active is distinct from old.is_active
     or new.trial_until is distinct from old.trial_until
     or new.access_start is distinct from old.access_start
     or new.access_end is distinct from old.access_end
     or new.evc_session_id is distinct from old.evc_session_id
     or new.can_download is distinct from old.can_download
     or new.download_colleges is distinct from old.download_colleges
     or new.can_download_supports is distinct from old.can_download_supports
     or new.active_session_id is distinct from old.active_session_id
     or new.last_relance_at is distinct from old.last_relance_at
     or new.created_at is distinct from old.created_at
     or new.deactivation_reason is distinct from old.deactivation_reason
     or new.deactivation_note is distinct from old.deactivation_note
     or new.deactivated_at is distinct from old.deactivated_at
     or new.deactivated_by is distinct from old.deactivated_by
  then
    raise exception 'Modification refusée : ces informations du profil sont gérées par l''administration.'
      using errcode = '42501';
  end if;
  return new;
end;
$function$;

drop trigger if exists profiles_garde_colonnes_sensibles on public.profiles;
create trigger profiles_garde_colonnes_sensibles
  before update on public.profiles
  for each row execute function public.profiles_garde_colonnes_sensibles();

alter policy profiles_self_update on public.profiles
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = (select public."current_role"()));
