# Rapport de recette du cockpit administrateur (CDC §12, cas C01 à C18)

- **Date :** 10/10/2026.
- **Version :** commit `c35dd131`.
- **Base :** base de production. Les comptes fictifs `qa-cockpit-*` sont supprimés après la recette.
- **E-mails :** en mode dry-run (`EMAIL_DRY_RUN=1`) : la route d'envoi est exécutée de bout en bout, mais Resend n'est pas appelé.

Script : `tmp/_qa-cockpit/recette.mts`. Il rejoue les fonctions serveur réelles et les routes HTTP du serveur de développement.

| Cas | Attendu | Résultat |
|---|---|---|
| C01 | Un autre administrateur ne voit aucune tâche privée | ✔ Liste et accès direct refusés |
| C02 | Le partage volontaire puis la révocation fonctionnent | ✔ Droit « commentaire » pendant le partage, aucun accès après la révocation |
| C03 | Une tâche créée depuis une fiche enseignant garde son lien | ✔ `lien_type = enseignant`, `lien_id` = la fiche |
| C04 | Le bouton Écrire vise le bon destinataire et le bon fil | ✔ L'enseignant voit le fil ; un autre administrateur ne le voit pas |
| C05 | L'IA produit un brouillon modifiable, sans envoi automatique | ⚠ Logique vérifiée : aucun message n'est créé par l'IA et l'envoi exige un clic. L'appel réel au modèle reste à confirmer en production : la clé Anthropic est chiffrée sur Vercel et n'est pas lisible en local. |
| C06 | Un message envoyé est visible immédiatement par l'enseignant | ✔ |
| C07 | L'e-mail à l'enseignant a le bon contenu et un lien direct | ✔ Objet `[MAJOR ECN] <sujet>`, bouton vers `/admin/cockpit/messagerie/<id>` |
| C08 | Un push n'est envoyé que s'il est disponible et autorisé | ✔ Statut « non disponible » (aucun service de push raccordé) |
| C09 | La réponse de l'enseignant apparaît dans la messagerie du propriétaire | ✔ |
| C10 | Le propriétaire reçoit une copie e-mail complète de la réponse | ✔ Envoi « envoyé » à l'adresse du propriétaire |
| C11 | L'objet de l'e-mail est stable et filtrable | ✔ `[MAJOR ECN - MESSAGERIE INTERNE] Réponse de Thomas - <sujet>` |
| C12 | Un retry ne crée ni double message ni double e-mail | ✔ Doublon détecté : 1 message, 1 envoi, la nouvelle tentative est ignorée |
| C13 | La tâche passe à « Réponse reçue », jamais à « Terminée » sans validation | ✔ |
| C14 | Une reconnexion ramène à la conversation exacte | ✔ 307 vers `/login?next=/admin/cockpit/messagerie/<id>` |
| C15 | En cas d'échec de l'e-mail, la réponse est conservée et l'erreur tracée | ✔ Statut « échec » avec son motif ; le message reste dans Major ECN |
| C16 | Un élève n'a pas accès aux conversations administratives | ✔ Aucun rôle dans le fil ; l'export renvoie HTTP 403 |
| C17 | Si l'IA est en panne, la rédaction et l'envoi manuels restent possibles | ✔ Message « assistant indisponible » affiché, envoi manuel réussi |
| C18 | La recherche et les exports respectent la confidentialité | ✔ L'export CSV et la recherche d'un autre administrateur ne contiennent aucune tâche privée |
| Notif. | Prise de rendez-vous visible dans la cloche, alertes répétées regroupées | ✔ ×2 regroupées, non lues |

Résultat : **18 cas conformes sur 19**. C05 attend l'essai en production.

Règles pures : `tests/cockpit-regles.test.ts`, **12 tests sur 12** réussis.

Contrôle visuel : captures pleine page à 1536 px du cockpit, des tâches, de l'agenda, de la messagerie, des réclamations et des demandes (`tmp/_qa-cockpit/captures.mjs`). La disposition suit la maquette. Les couleurs, la police et le menu sont ceux de la plateforme.
