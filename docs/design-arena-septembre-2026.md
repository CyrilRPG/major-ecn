# EVC Arena — intégration des maquettes du 9 septembre 2026

Les quatre références du client sont intégrées aux composants du tournoi existant : avant la manche, question en cours avec confirmation, résultats et manche manquée. L’espace participant, les corrections, les règles et le classement partagent la nouvelle navigation et le décor.

## Parcours et données

- `/arena/[slug]/manche/[n]` choisit le bon écran selon la programmation et la tentative du participant. Une manche clôturée sans tentative, ou une tentative expirée sans réponse enregistrée, affiche l’écran de manche manquée.
- Le barème, les questions, les durées, les scores, les statistiques, les dates et le participant proviennent des données existantes. Les chiffres et le classement illustratifs des images ne sont jamais appliqués à un participant réel.
- Le chronomètre reste **par question**, conformément au moteur en service ; le texte sous l’anneau le précise. Les délais serveur, la validation irréversible, la reprise et la sauvegarde existants sont conservés.
- La confirmation apparaît jusqu’à la première validation réussie. Elle conserve les choix en cas d’annulation et se ferme si la question change. L’annulation reçoit le focus initial ; Échap ferme la fenêtre.
- Le marquage est conservé pour la tentative dans la session du navigateur et signalé sur les corrections correspondantes. Il ne permet pas de revenir sur une question validée.
- Les corrections restent soumises à la clôture et à la publication, sauf prévisualisation autorisée du personnel. Aucun seuil de classement n’a été modifié.
- « Ajouter la date au calendrier » télécharge un fichier ICS local. Le bouton de prochaine manche mène à son écran d’accueil ; l’inscription au tournoi reste commune aux manches.
- Les avatars proviennent du catalogue existant d’EVC Arena et du choix enregistré de chaque participant. Aucun portrait des maquettes n’est utilisé comme avatar.

## Éléments visuels

Les originaux restent inchangés dans Downloads. Les copies suivantes sont embarquées dans `public/arena/` :

- `reference-interface-2026.png` : référence du 01:32:18. Le logo horizontal est affiché par cadrage CSS de cette image, conservant les pixels fournis. Les bordures du décor d’accueil sont également reprises directement. Cette image ne fournit aucun avatar.
- `reference-results-2026.png` : référence du 01:48:44, utilisée uniquement sur les bords visibles du décor des écrans centraux. Les panneaux masquent le centre ; aucun texte de questionnaire n’est incorporé à l’interface réelle sous forme d’image.
- `colosseum-2026.png` : fond reconstitué par l’outil intégré `image_gen`, à partir de la référence du 01:32:18. Il complète les zones cachées par l’interface originale et fournit le décor mobile.

Les titres, textes, boutons, panneaux, anneaux et pictogrammes sont des éléments d’interface. La composition s’adapte aux petits écrans, avec navigation compacte, panneaux empilés et chronomètre qui reste visible pendant le défilement. Les détails du décor reconstitué et le rendu des polices ne constituent pas une identité pixel à pixel avec les images raster. Les dates sont formatées à partir des données, ce qui évite notamment de reprendre « lundi 15 septembre 2026 » (le 15 est un mardi).

Prompt utilisé avec l’outil intégré pour le fond :

> Use case: precise-object-edit. Input image is the edit target. Create a clean website BACKGROUND PLATE by removing ALL foreground website UI from this exact screenshot: remove header/navbar, profile portrait, all floating text, timeline, cards, buttons and footer. Reconstruct the amphitheatre behind removed UI. Preserve the exact dark photorealistic torch-lit Roman amphitheatre, its original camera viewpoint, architecture, warm orange torches, wet dark stone floor, and the two hanging red velvet banners with gold edging at far left and far right. Preserve their lettering: left EVC ARENA / APPRENDRE S’ÉVALUER PROGRESSER and golden helmet, right SAISON 2026 and golden laurel. Banners hang from top to around 44% height. Keep the middle dark and atmospheric for UI to be overlaid. Output same landscape aspect ratio, high resolution. No foreground people, no UI, no cards, no buttons, no additional words outside the two banners. This is extraction/restoration of the original design background, not a redesign.

## Recette

L’aperçu `/arena-preview/design?state=lobby` est disponible **uniquement en développement**. Les valeurs `question`, `results` et `missed` présentent les trois autres états. Il utilise les composants réels et un jeu de données illustratif séparé, sans appels de participation à la base. Le précédent `/arena-preview` conserve sa redirection vers le tournoi de démonstration.

Vérifications effectuées :

- 26 tests réussis : barème, classement, import et ventilation des réponses (dont questions non répondues et neutralisées).
- ESLint réussi sur les composants et routes modifiés.
- TypeScript du code applicatif réussi. La commande globale `pnpm typecheck` rencontre les erreurs préexistantes de `tmp/_replay-brigitte.mts`, `tmp/_test-signature.mts` et `tmp/_test-verite.mts`. La vérification applicative utilise un tsconfig temporaire héritant du projet et excluant uniquement `tmp` et `node_modules`.
- Rendu et interactions contrôlés avec `agent-browser`, à 1599 × 984, 1557 × 1010 et 390 × 844 : sélection, annulation, validation, absence de seconde confirmation, marquage, navigation de recette, fenêtres mobiles et export ICS.
- Aucun débordement horizontal, aucune image cassée ni erreur JavaScript détectée dans les écrans contrôlés.
- Les routes du tournoi de démonstration renvoient toujours 404 sans session autorisée, conformément au mode privé actuel. Aucune participation réelle n’a été effectuée ; aucune mutation de score ou de configuration du tournoi n’a servi à la recette.

Les captures sont dans `tmp/arena-*-desktop.png`, `tmp/arena-*-mobile.png` et `tmp/arena-confirmation-mobile.png`. L’intégration est locale ; aucune mise en production n’a été effectuée.
