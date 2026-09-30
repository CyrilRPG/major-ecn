-- ============================================================================
-- Relances Découverte — correction du J0 de la reprise du stock (30/09/2026).
--
-- La première synchronisation a pris auth.users.invited_at comme date de
-- l'accès initial. Or l'ancien cron « relance-inactifs » régénérait une
-- invitation tous les 7 jours : invited_at porte la date de la DERNIÈRE
-- relance automatique, pas celle de l'e-mail d'activation. 132 candidats
-- avaient ainsi un J0 artificiellement récent (anciens accès classés « en
-- attente »). J0 de reprise = création du compte (date approchée, marquée).
--
-- Ne touche QUE les lignes de reprise (acces_initial_approx = true, envois
-- « initial » d'origine ancien_systeme, événements source = reprise). La
-- correction des événements de reprise est la seule exception à l'ajout seul :
-- le trigger est suspendu le temps de l'UPDATE, dans la même transaction.
-- Rejouable.
-- ============================================================================
update public.decouverte_candidats c
   set acces_initial_at = coalesce(c.compte_cree_at, c.demande_at), updated_at = now()
 where c.acces_initial_approx
   and c.acces_initial_at is distinct from coalesce(c.compte_cree_at, c.demande_at);

update public.decouverte_envois e
   set envoye_at = c.acces_initial_at, created_at = c.acces_initial_at, updated_at = now()
  from public.decouverte_candidats c
 where e.candidat_id = c.id and e.type = 'initial' and e.origine = 'ancien_systeme'
   and c.acces_initial_approx and e.envoye_at is distinct from c.acces_initial_at;

alter table public.decouverte_evenements disable trigger decouverte_evenements_append_only;
update public.decouverte_evenements ev
   set survenu_at = c.acces_initial_at
  from public.decouverte_candidats c
 where ev.candidat_id = c.id and ev.type = 'acces_initial' and ev.details->>'source' = 'reprise'
   and c.acces_initial_approx and ev.survenu_at is distinct from c.acces_initial_at;
alter table public.decouverte_evenements enable trigger decouverte_evenements_append_only;
