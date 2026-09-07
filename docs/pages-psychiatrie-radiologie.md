# Pages Psychiatrie et Radiologie — 6 septembre 2026

## Pages et sources

- `/specialites/psychiatrie` : `templates/psychiatrie/template1.png`, `template2.png` et `hero.jpg`.
- `/specialites/radiologie-et-imagerie-medicale` : `templates/radiologie/4ca28ca6-ca06-4bb6-b466-db1efac66fd1.png` et `hero.jpg`.
- Les héros sont des versions WebP des photographies fournies. Les deux petites illustrations de cours sont extraites des maquettes. Aucune image générée pour cette intégration.
- Les pictogrammes décoratifs sont remplacés par des numéros et des filets. Les quatre domaines de psychiatrie gardent leur disposition, avec des en-têtes typographiques à la place des illustrations et symboles de la maquette.
- Les FAQ sont dans `src/lib/data/faq-psychiatrie.json` et `faq-radiologie.json`. Les 14 questions et réponses de chaque fichier joint sont conservées, paragraphes et mises en gras compris. Les notes éditoriales ne sont pas publiées.
- En psychiatrie, le comparatif de gain de temps suit la méthode et précède le programme, conformément à la première pièce jointe. Le reste suit la maquette.
- En radiologie, la FAQ précède le comparatif de gain de temps et les formules, conformément aux instructions de la seconde pièce jointe.
- Les dates et nombres de postes figurent dans le hero et dans un bandeau de session : psychiatrie 10 décembre 2026 / 198 postes externes ; radiologie 8 décembre 2026 / 72 postes externes. Source des postes : [arrêté du 12 juin 2026](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054245644).

## Tunnel d'inscription

- Le choix d'une spécialité ouvre ses propres tarifs pour les neuf pages de spécialité existantes.
- Chaque carte conserve la spécialité de sa page, même en accès direct sans paramètre URL ou avec un paramètre provenant d'une autre spécialité.
- Le Programme Approfondi présélectionne la spécialité et l'offre de base. Les alias historiques des spécialités sont reconnus.
- Le formulaire existant conserve les coordonnées, la voie du concours, le paiement comptant/en 3 ou 4 fois et les consentements requis.
- La fenêtre de choix gère Tab, Maj+Tab, Échap et le retour du focus au bouton d'ouverture.
- Le bouton mobile « Voir les formules » vise les tarifs. Le diagnostic automatique ne s'interpose plus sur le tunnel, une fenêtre de choix déjà ouverte, ou des tarifs visibles.
- Le paiement, la confirmation, la création/activation du compte et l'email restent pris en charge par l'API Stripe et le provisioning existants. Aucun paiement réel, compte candidat ou email de test n'a été créé.

## Vérifications effectuées

- Comparaison du texte effectivement rendu dans le navigateur avec les FAQ : les 28 réponses sont identiques. Comparaison des JSON reconstitués avec les deux pièces jointes : identiques.
- Les neuf routes de spécialité répondent en HTTP 200, portent l'ancre `formules` et transmettent leur spécialité sur toutes leurs cartes tarifaires.
- Navigation effective depuis « S’inscrire » vers les tarifs Radiologie, puis vers l'offre Approfondie : spécialité et offre à 2 295 € sélectionnées, formulaire de coordonnées affiché.
- Présélections également vérifiées dans les formulaires Essentielle Radiologie, Intensive Psychiatrie et Approfondie Psychiatrie à 2 095 €.
- Contrôle navigateur à 1440, 768, 390 et 320 pixels ; pas de débordement horizontal de la page. Le grand tableau comparatif défile dans son propre cadre sur mobile. FAQ ouvrable au clic ; focus du dialogue testé au clavier.
- Aucun message d'erreur JavaScript remonté par le navigateur sur les parcours vérifiés.
- `pnpm exec tsx --test tests/tunnel-inscription.test.ts` : 3 tests réussis.
- ESLint sur les nouveaux composants et les composants du tunnel modifiés : aucune erreur.
- TypeScript sur l'ensemble de `src` et le nouveau test : réussi, avec une configuration temporaire qui exclut les autres tests et scripts de `tmp`.
- Le contrôle TypeScript global reste bloqué par des fichiers étrangers à cette intervention : `tests/arena-ranking.test.ts` (propriété `excluded`) et trois imports `.ts` dans `tmp/_replay-brigitte.mts` et `tmp/_test-signature.mts`.

## Éléments à compléter avant une vente Radiologie avec accès immédiat

1. Le volume de questions manque dans le texte fourni : les deux `[…]` des réponses 8 et 13 ont été conservés à l'identique. Aucun nombre n'a été inventé.
2. Aucun collège de radiologie n'a été trouvé lors de la lecture de la table `matieres`. La spécialité utilise donc `contentPending: true` avec un collège nul, comme le mécanisme de préinscription existant. L'indisponibilité est annoncée dans le formulaire avant paiement et transmise à Stripe. Aucun accès à un autre collège ne doit être accordé par défaut.
3. L'offre Approfondie Radiologie est déclarée à 229 500 centimes et attend `STRIPE_PRICE_APPRO_RADIO`. Cette variable n'est pas présente dans l'environnement local. Le prix Stripe devra correspondre exactement à 2 295 €. La configuration de production n'a pas été modifiée ni vérifiée.
4. La mise en ligne des cours permettra de remplacer le collège nul par son identifiant réel et de retirer `contentPending` dans les deux catalogues (`enrollable-colleges.ts` et `stripe/approfondi.ts`).
5. Les spécialités sans offre Approfondie dans le catalogue, notamment la cardiologie, gardent le parcours de rappel existant. Aucun tarif ni programme non fourni n'a été inventé pour elles.

Les changements sont locaux ; aucun déploiement n'a été effectué.
