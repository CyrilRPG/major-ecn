-- ============================================================================
-- Refonte des notifications de la plateforme (09/10/2026) : la cloche de
-- l'équipe (`cockpit_notifications`, affichée dans tout /admin pour les
-- administrateurs et les professeurs) reçoit désormais les évènements de
-- toute la plateforme — rendez-vous réservés, questions d'élèves, inscriptions,
-- paiements, prospects, formulaires, contenus à valider, alertes…
-- Le genre reste contrôlé, avec la liste élargie.
-- ============================================================================
alter table public.cockpit_notifications drop constraint if exists cockpit_notifications_genre_check;
alter table public.cockpit_notifications add constraint cockpit_notifications_genre_check check (genre in (
  'reponse', 'rappel', 'echeance', 'partage', 'affectation', 'message', 'demande', 'reclamation',
  'rendez_vous', 'question', 'contenu', 'inscription', 'paiement', 'prospect', 'formulaire', 'alerte', 'signalement', 'compte'
));
