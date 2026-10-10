# Cockpit administrateur et messagerie administrative

CDC « Mon cockpit administrateur et messagerie administrative intelligente » (version consolidée du 08/10/2026), addendum « Cockpit de pilotage opérationnel » et rubrique « Réclamations & Améliorations ». Livré le 09/10/2026.

La maquette fournie fixe la **disposition des blocs**. Couleurs, typographie, menu et composants restent ceux de la plateforme.

## 1. Ce que voit l'administrateur

| Rubrique | Adresse | Contenu |
|---|---|---|
| Mon cockpit | `/admin/cockpit` | Page d'accueil par défaut de l'administrateur (`/admin` y redirige). Elle regroupe dix blocs : <ul><li>salutation et objectif du jour modifiable ;</li><li>citation, date et météo ;</li><li>six indicateurs ;</li><li>trois priorités du jour réordonnables ;</li><li>agenda Aujourd'hui / Semaine / Mois ;</li><li>mini-calendrier ;</li><li>tâches de la semaine (cases à cocher, actions rapides) ;</li><li>relances en attente de réponse et derniers messages ;</li><li>réclamations récentes et améliorations à piloter ;</li><li>assistant IA.</li></ul> |
| Mon agenda | `/admin/cockpit/agenda` | Vues jour, semaine et mois. On y trouve les rendez-vous personnels, les échéances, les cours de la plateforme et les entretiens de suivi. Les tâches se déplacent par glisser-déposer. On y fixe aussi les objectifs de la semaine et du mois. |
| Mes tâches | `/admin/cockpit/taches` | Création rapide (un titre suffit). Fiche détaillée : statuts, priorité, catégorie, échéance, heure, rappel, récurrence, notes, lien interne, affectation. S'y ajoutent le partage, les commentaires, l'historique et l'export CSV. |
| Messagerie | `/admin/cockpit/messagerie` | Boîtes : réception, envoyés, brouillons, suivies, archivées. Recherche par interlocuteur, mission, date, statut ou mot-clé. Fil de discussion avec pièces jointes, rédaction assistée par l'IA et statuts d'envoi. |
| Enseignants | `/admin/cockpit/enseignants` | Deux actions : « Créer une tâche » (le lien avec la fiche est conservé) et « Écrire ». |
| Réclamations & Améliorations | `/admin/cockpit/reclamations` | Deux vues reliées. Les réclamations sont traitées une à une. Les améliorations regroupent les reproches récurrents, avec le nombre de candidats concernés, la tâche de pilotage et la liste des personnes à recontacter. |
| Demandes clients / Suivi comptable | `/admin/cockpit/demandes` (`?nature=comptable`) | Appels et demandes : client recherché dans la base, motif, priorité, personne chargée du traitement, échéance, statut. Un bouton « Transformer en tâche » le fait en un clic. |
| Outils IA | `/admin/cockpit/assistant` | Assistant libre : rédiger, synthétiser, analyser, planifier. |
| Paramètres du cockpit | `/admin/cockpit/parametres` | Notifications (e-mail des rappels et des affectations, push), signature, notes personnelles, exports, journal des actions sensibles. |

Le bouton **« + Nouvelle action »** est présent sur toutes les pages de l'administration. Il ouvre au choix : tâche, rendez-vous, relance, appel, demande client, réclamation ou note personnelle. Chaque formulaire est prérempli quand le contexte est connu.

La fiche candidat du suivi individuel (`/admin/suivi/candidats/<id>`) affiche les réclamations et demandes du candidat, ainsi que les améliorations auxquelles elles sont rattachées.

## 2. Rôles et confidentialité (§4)

| Donnée | Qui la voit |
|---|---|
| Tâches, objectifs, notes, rendez-vous | **Le propriétaire seul** (même un autre administrateur ne les voit pas). S'y ajoutent la personne affectée, qui peut modifier la tâche, et les personnes avec qui la tâche est partagée, au droit choisi : consulter, commenter ou modifier. |
| Partage | Seul le propriétaire partage, révoque, archive ou réaffecte. Chaque partage et chaque révocation sont inscrits au journal d'audit. |
| Conversations administratives | Le propriétaire et l'enseignant interlocuteur, personne d'autre. Les élèves n'y ont jamais accès (C16). |
| Demandes clients, réclamations, améliorations | Les administrateurs, l'auteur et la personne affectée ou responsable. Une demande comptable porte la mention de confidentialité. |
| Recherche (⌘K) et exports CSV | Uniquement les données visibles par l'utilisateur (C18). |

**Technique.** Aucune policy RLS n'est ouverte sur les tables `cockpit_*`. Toutes les lectures et écritures passent par le serveur (service-role), qui applique les règles pures de `src/lib/cockpit/regles.ts` (`niveauAccesTache`, `roleDansConversation`, `peutVoirDemande`…). Ces règles sont testées dans `tests/cockpit-regles.test.ts`.

## 3. Messagerie : envois et double réception (§7, §8)

1. **Message de l'administrateur.** Il est enregistré dans le fil, qui est la source de vérité. L'e-mail part ensuite à l'enseignant : objet `[MAJOR ECN] <sujet>`, bouton « Répondre dans Major ECN » qui ouvre le fil exact, même après connexion. La tâche liée passe à **En attente de réponse**.
2. **Réponse de l'enseignant.** Elle est enregistrée dans le fil et la tâche passe à **Réponse reçue**, jamais « Terminée » sans validation. Le propriétaire est notifié dans la cloche. Il reçoit aussi une **copie e-mail complète**, obligatoire et non désactivable, avec un objet stable : `[MAJOR ECN - MESSAGERIE INTERNE] Réponse de <Prénom> - <Sujet>`. Exemple de filtre Gmail : `subject:"[MAJOR ECN - MESSAGERIE INTERNE]"`.
3. **Idempotence.** Le client envoie une clé unique par message (`cle_idempotence`). Un rejeu ne crée ni un second message ni un second e-mail : il n'y a qu'une ligne `cockpit_envois` par message, par canal et par rôle, et la même clé d'idempotence est transmise à Resend à chaque tentative.
4. **Échecs.** Le statut passe à « Échec », avec l'erreur tracée et une nouvelle tentative automatique par le cron `/api/cron/cockpit` (2, 4, 8, 16 puis 32 minutes, 6 tentatives au plus). Le message reste toujours dans Major ECN.
5. **Push.** Aucun service de push n'est encore raccordé à la messagerie administrative. Le statut affiché est donc « non disponible » : rien n'est présenté comme envoyé (C08).

## 4. IA (§6)

- **Modèle.** `callClaude` (`src/lib/ai/anthropic.ts`), modèle par défaut du projet.
- **Contexte transmis.** Uniquement le contexte autorisé : prénom, mission, échéance, six derniers messages du fil, résumé du dossier. Jamais d'adresse e-mail, de téléphone ni de champ financier.
- **Rôle de l'IA.** Elle propose un brouillon. **Elle n'envoie rien** : l'envoi exige un clic de l'administrateur. Si elle est indisponible, un message l'indique et la rédaction manuelle reste possible.
- **Coût externe.** Chaque appel est facturé par Anthropic au tarif du modèle, quelques centimes pour un brouillon. Les appels sont inscrits au journal d'audit (`ia_*`).
- **Suggestion après une réponse (§9).** L'IA peut repérer une date annoncée et proposer de déplacer l'échéance. Le déplacement n'a lieu qu'après confirmation.

## 5. Notifications de la plateforme (refonte du 09/10/2026)

Façade unique : `src/lib/notifications/plateforme.ts`.

- `notifierEquipe` alimente la cloche de l'administration (`cockpit_notifications`). Elle concerne les administrateurs et les professeurs.
- `notifierEleve` alimente la cloche de l'élève (`pedago_notifications`), sur le web et dans l'application.
- Les alertes répétitives sont regroupées par clé : un compteur s'incrémente et la notification redevient non lue.
- Une notification ratée ne fait jamais échouer l'action d'origine. Les e-mails existants sont conservés.

| Évènement | Destinataire (cloche) |
|---|---|
| Rendez-vous de suivi réservé, déplacé ou annulé | L'intervenant, plus le créateur du créneau et le créateur de la campagne, ou à défaut les administrateurs. L'élève reçoit la confirmation. |
| Rendez-vous attribué, élève confié en suivi | La personne concernée |
| Nouvelle question d'élève (Q&R) | Les enseignants référents, ou à défaut les administrateurs |
| Réponse d'un enseignant (Q&R, forum) | L'élève |
| Signalement sur le forum | Les administrateurs |
| Nouvelle inscription (Stripe), inscription à l'Espace Découverte | Les administrateurs (regroupé par jour) |
| Paiement échoué | Les administrateurs |
| Prospects : diagnostic, guide, annales, demande de rappel, contact, recrutement | Les administrateurs (regroupé par jour et par type) |
| Réponse à un formulaire (web et application) | Les administrateurs (regroupé par formulaire) |
| Vidéo ou article à valider, contenu proposé | Les administrateurs |
| Alerte pédagogique P1 ou P2 | Les administrateurs (regroupé par jour) |
| Accès individuel à une épreuve blanche | L'élève |
| Exercice d'élève publié ou écarté | L'élève |
| Cockpit : réponse reçue, rappel, échéances du jour, partage, affectation, commentaire, tâche terminée | Les personnes concernées |

## 6. Paramètres, sauvegarde, restauration

- **Migrations.** Elles sont appliquées le 09/10/2026 :
  - `20261009220000_cockpit_administrateur.sql` : tables `cockpit_*` et seau privé `cockpit` pour les pièces jointes (15 Mo au plus) ;
  - `20261009230500_notifications_equipe.sql` : genres de notification élargis.
- **Cron.** `/api/cron/cockpit` tourne toutes les 15 minutes (`vercel.json`) et gère les rappels, les échéances et la reprise des e-mails.
- **Sauvegarde.** Les tables `cockpit_*` sont incluses dans les sauvegardes quotidiennes de Supabase (plan du projet). L'administrateur peut exporter lui-même ses tâches et ses conversations en CSV (Paramètres du cockpit).
- **Restauration.** Supabase propose une restauration à un instant donné (PITR, selon le plan) ou depuis une sauvegarde quotidienne. Les pièces jointes sont dans le seau `cockpit` du Storage, sauvegardé avec le projet.
- **Services tiers.** Resend (e-mails), Anthropic (IA) et Open-Meteo (météo de l'accueil, sans clé, mise en cache 30 minutes).
- **Conservation.** Les durées de conservation et de purge restent à fixer dans la politique RGPD (§11). Rien n'est purgé automatiquement aujourd'hui.

## 7. Recette

- **Règles pures** : `npx tsx --test tests/cockpit-regles.test.ts`.
- **Recette serveur C01 à C18 et notifications**, contre la base, avec des comptes fictifs :
  ```
  node tmp/_qa-cockpit/qa.mjs create
  EMAIL_DRY_RUN=1 node --conditions=react-server --env-file=.env.local --import tsx tmp/_qa-cockpit/recette.mts
  node tmp/_qa-cockpit/qa.mjs delete
  ```
  Le rapport est dans [recette.md](recette.md).
