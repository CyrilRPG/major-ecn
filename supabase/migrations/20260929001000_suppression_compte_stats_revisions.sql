-- =============================================================================
-- Suppression de compte : ne plus recalculer les statistiques d'un compte
-- en cours de suppression (29/09/2026)
-- =============================================================================
-- Constaté en supprimant un compte de test : `delete from auth.users` échouait
-- (« Database error deleting user ») pour TOUT élève ayant fait au moins une
-- révision transversale. La cascade supprime ses `transversal_sessions` ; le
-- trigger `trg_transversal_sessions_stats` recalcule alors ses statistiques
-- et réinsère une ligne `user_revision_stats` pour un utilisateur qui n'existe
-- plus → violation de clé étrangère (23503) → toute la suppression est annulée.
-- Conséquence : la suppression de compte (web, app, admin) était impossible
-- pour ces élèves — exigence App Store 5.1.1(v) et droit RGPD à l'effacement.
--
-- Correctif : sur DELETE, si l'utilisateur n'existe plus (suppression en
-- cascade), on ne recalcule rien ; ses statistiques partent avec lui (FK en
-- cascade). Les autres cas (insert, update, suppression d'une session isolée)
-- sont inchangés. Idempotente.
-- =============================================================================

create or replace function public.trg_transversal_sessions_stats()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if tg_op = 'DELETE' and not exists (select 1 from auth.users u where u.id = old.user_id) then
    return old;
  end if;
  perform recompute_user_revision_stats(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end
$$;
