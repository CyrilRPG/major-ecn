-- Le rééquilibrage des banques QCM d'Anesthésie-Réanimation réécrit 4 128
-- questions et 20 640 propositions dans une transaction unique, afin qu'un échec
-- ne laisse jamais un cours à moitié corrigé. Ce volume dépasse le
-- statement_timeout appliqué aux appels PostgREST, qui annule la transaction.
--
-- On relève ce délai pour le seul rôle service_role, utilisé par les scripts
-- d'administration côté serveur. Les rôles anon et authenticated, qui portent le
-- trafic des élèves, conservent leur limite : une requête étudiante lente reste
-- interrompue comme avant.
--
-- Après la publication, revenir au réglage d'origine avec :
--   alter role service_role reset statement_timeout;

alter role service_role set statement_timeout = '600s';
