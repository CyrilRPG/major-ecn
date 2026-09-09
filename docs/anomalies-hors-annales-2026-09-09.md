# Finalisation des autres banques de QCM — 9 septembre 2026

L'utilisateur a autorisé l'extension de la reprise aux autres banques de QCM. Le lot final a été appliqué en production : **26 437 opérations en place**, dont **277 retraits de séries complètes** et **26 160 lignes de contenu corrigées**. Les dossiers dont l'énoncé ou le corrigé ne pouvait pas être rétabli de façon fiable restent exclus de la publication.

## Contenu repris

- 8 360 lignes de questions : énoncés restaurés, introductions répétées et remarques de fabrication retirées, attributions génériques corrigées. Les restaurations s'appuient notamment sur les sauvegardes du même cours et de la même vignette, rapprochées par le contenu et les réponses des propositions.
- 17 365 justifications : retrait des commentaires de fabrication ou reformulation des attributions génériques, en conservant l'explication autonome lorsqu'elle existe.
- 435 lignes de séries : libellés répétés et mentions éditoriales dans les vignettes corrigés.
- 277 séries retirées en entier : 88 dans le premier lot, puis 189 dans le lot complémentaire. Motifs : énoncés irrécupérables, questions ou choix manquants, QROC sans corrigé, mélange de questions, grille contradictoire ou verdict reposant uniquement sur l'absence de mention dans un document.

Les identifiants, propositions, bonnes réponses et images n'ont pas été remplacés. Les valeurs chiffrées des énoncés et les images intégrées ont été contrôlées lors de la préparation du plan. Les mots « source », « document » ou « extraction » restent présents lorsqu'ils ont un sens médical ou désignent un document utile.

Cette intervention corrige les défauts établis lors de l'audit éditorial et structurel ; elle ne constitue pas une certification médicale indépendante de chaque réponse de l'ensemble du catalogue.

## Publication et historique

Le retrait utilise `allowed_offers = []`, déjà protégé par la règle restrictive en base. Les contenus restent disponibles à l'administration. Aucun avertissement de fabrication ou de contenu en chantier n'est ajouté à l'espace élève.

Les anciennes pages de résultats conservent les scores et l'historique, mais ne chargent plus les énoncés ni les liens de reprise d'une série devenue inaccessible. La page de révision vérifie les droits actuels avant de charger les questions, y compris lorsqu'une ancienne session appartient à l'élève.

Contrôle des UUID avant/après : les **74 084 tentatives et 17 591 sessions** de l'instantané initial sont toutes conservées. Les **71 tentatives et 23 sessions** relevées avant le premier retrait sont également présentes. Les nouvelles tentatives survenues pendant l'intervention sont autorisées et ne sont pas interprétées comme une divergence.

## Vérifications et traçabilité

- TypeScript complet et ESLint ciblé : réussis dans le worktree isolé de vérification.
- 16 tests des règles d'accès et 10 tests de publication/nettoyage : réussis.
- API réelle sur 12 profils étudiants (3 états de voie × 4 offres) : 277 séries retirées et leurs questions inaccessibles ; annale complète témoin accessible ; lecture administrative conservée.
- Relecture des 26 437 opérations conforme au plan ; comparaison des 26 349 lignes de la sauvegarde initiale du lot final : aucune disparition et aucun changement inattendu hors des champs prévus (horodatages des triggers exclus).
- Déploiement applicatif `b55eff391e24828b9afa3eb135161cfde679eecd` : statut Vercel réussi. Contrôle HTTP authentifié sur `https://www.major-ecn.fr` : série retirée et révision en état 404 (marqueur Next.js dans le flux), ancien résultat accessible sans énoncé ni lien de reprise, annale complète témoin et DP d'orthopédie corrigé accessibles. L'énoncé restauré est présent et son préambule artificiel absent.
- Compte de contrôle et ses deux lignes d'historique temporaires supprimés après les tests ; absence du compte confirmée dans Auth. Les 281 annales complètes restent publiées.
- Plan exact versionné : `scripts/banques/reprises/2026-09-09-finalisation.json`.
- Motifs complémentaires : `scripts/banques/reprises/2026-09-09-motifs-retrait.json` ; premier retrait : `2026-09-09-retraits.json`.
- Sauvegardes intégrales avant écriture, résultats de contrôle et historique : répertoire local ignoré `tmp/banques-reprise/` ; aucun identifiant d'authentification n'est versionné.

Le script applique uniquement les champs autorisés, compare toutes les valeurs avant écriture, contrôle les écritures concurrentes, puis relit les données. Une interruption liée à l'actualisation automatique d'un horodatage parent a été traitée sans forcer de valeur : la reprise a vérifié l'absence de changement de contenu et appliqué uniquement les 549 opérations encore en attente.

Le contrôle d'import de `_ins-chapter.mjs` refuse désormais les principaux défauts structurels et remarques de fabrication identifiés, sans interdire les consignes QCM ordinaires telles que « Concernant… ».
