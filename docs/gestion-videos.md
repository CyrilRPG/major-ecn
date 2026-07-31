# Gestion des vidéos (onglet « Vidéos »)

Tout ce qui concerne les vidéos se gère depuis **Admin › Vidéos**. La page
Contenu n'en affiche plus qu'un récapitulatif en lecture seule.

## Le parcours

1. **Déposer la vidéo sur bunny.net** (Video Library → Stream) et copier son
   lien. Tous les formats sont acceptés : lien *embed*, lien *play*, URL du
   panneau (`…?videoId=…`) ou l'identifiant seul.
2. **Admin › Vidéos** : choisir le **collège**, puis le **sous-collège** (le
   sélecteur n'apparaît que pour la Médecine générale), puis l'**item**.
3. Choisir la **catégorie** :
   - **Cours vidéo** → visible par la **Formule Intensive** ;
   - **Séances approfondies** → visible par le **Programme Approfondi**.
4. **+ Ajouter** : nom affiché aux élèves, position dans la liste (vide = à la
   fin, 1 = en tête), lien Bunny, et éventuellement la case **Ajouter un
   support**.

Sur chaque ligne : **↑ ↓** pour l'ordre, **crayon** pour renommer / remplacer la
vidéo / gérer le support, **corbeille** pour supprimer.

## L'item « Révisions - <Collège> »

Pour les collèges **hors Médecine générale**, le sélecteur d'item propose
« Révisions - <Collège> — à créer » tant que cet item n'existe pas. En ajoutant
une vidéo dessus, l'item est créé automatiquement **en tête du collège** et la
vidéo y est placée. L'item n'est jamais créé « à vide » : le lien Bunny est
validé avant toute création.

## Les supports de séance

La case **Ajouter un support** attache un PDF à une vidéo. Côté élève, cela crée
un onglet **« Support de la séance <nom> »** juste après l'onglet de la vidéo,
disponible aussi en *split view*. Le PDF est filigrané au prénom, nom et e-mail
de l'élève, rendu en `<canvas>` (donc **non téléchargeable**) et stocké dans un
bucket privé : seule la route `/api/supports/[videoId]/pdf` peut le servir.

Le support **hérite de la permission de sa vidéo** : support d'une séance
approfondie → Programme Approfondi ; support d'un cours vidéo → Formule
Intensive.

## Règles à connaître

- **La catégorie n'est pas modifiable après création.** C'est elle qui porte le
  public : pour changer, supprimer et recréer. Un contenu ne doit jamais changer
  d'audience en silence.
- **Créer un item est réservé aux administrateurs** (un professeur n'agit que
  sur les items de son périmètre).
- Le téléversement direct vers Bunny, sans passer par bunny.net, reste
  disponible sous « Autre méthode » : il ajoute une vidéo à la fin de la
  catégorie choisie.
- L'ordre affiché dans la page est exactement celui que voient les élèves.
