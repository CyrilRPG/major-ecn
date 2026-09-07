-- Journal de provisioning Stripe : mémoriser les ventes privées.
--
-- Une vente privée (scripts/creer-lien-paiement-prive.mjs) est un Payment Link
-- volontairement SANS `metadata.formule` : rien à provisionner, pas de compte
-- à créer. Le cron /api/cron/stripe-reconcile ne connaissait pas ce cas et
-- signalait la session chaque heure, pendant sept jours, comme un ÉCHEC
-- « metadata.formule absente » (alerte du 06/09/2026, 4× de 598,75 €).
--
-- Le cron inscrit désormais ces sessions au journal avec `source =
-- 'vente-privee'` pour qu'elles ne reviennent plus. La contrainte CHECK
-- n'autorisait que 'webhook' et 'merci' : on l'élargit. `user_id` est déjà
-- nullable (vérifié en production le 06/09/2026) ; `email` reste NOT NULL,
-- le cron fournit un repli lisible si le client n'en a pas saisi.
--
-- À APPLIQUER À LA MAIN dans l'éditeur SQL Supabase (aucun exécuteur SQL
-- n'est exposé à l'application). Tant qu'elle n'est pas appliquée, le cron
-- ignore silencieusement les ventes privées au lieu d'alerter.

alter table public.stripe_provisioning_log
  drop constraint if exists stripe_provisioning_log_source_check;

alter table public.stripe_provisioning_log
  add constraint stripe_provisioning_log_source_check
  check (source in ('webhook', 'merci', 'vente-privee'));
