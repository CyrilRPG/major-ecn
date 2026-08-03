# Gestion des vidéos (onglet « Vidéos »)

Tout ce qui concerne les vidéos se gère depuis **Admin › Vidéos**. La page
Contenu n'en affiche plus qu'un récapitulatif en lecture seule.

## Le parcours

1. **Déposer la vidéo sur bunny.net** (Video Library → Stream) et copier son
   lien. Tous les formats sont acceptés : lien *embed*, lien *play*, URL du
   panneau (`…?videoId=…`) ou l'identifiant seul.
2. **Admin › Vidéos** : choisir le **collège**, puis le **sous-collège** (le
   sélecteur n'apparaît que pour la Médecine générale), puis l'**item**.
3. Choisir la **catégorie** : **Cours vidéo** ou **Séances approfondies**.
   Elle détermine l'onglet où la vidéo apparaît chez l'élève — plus le public,
   qui se choisit vidéo par vidéo (voir « Qui y a accès » ci-dessous).
4. **+ Ajouter** : nom affiché aux élèves, position dans la liste (vide = à la
   fin, 1 = en tête), lien Bunny, **voies** et **formules**, et éventuellement
   la case **Ajouter un support**.

Sur chaque ligne : **↑ ↓** pour l'ordre, **crayon** pour renommer / remplacer la
vidéo / changer son public / gérer les supports, **corbeille** pour supprimer.
Le public de chaque vidéo est rappelé sous son nom.

## Qui y a accès

Deux critères, cochés à l'ajout et modifiables à tout moment depuis le crayon.

### Voie de concours

**Voie interne** et **voie externe**, les deux cochées par défaut :

- **les deux cochées** = aucune restriction, tout le monde voit la vidéo — y
  compris un élève dont la voie n'est pas renseignée (hors médecine générale,
  elle ne l'est pas toujours) ;
- **une seule cochée** = restriction réelle : seuls les élèves de cette voie
  voient la vidéo. Un élève sans voie renseignée ne la voit pas.

On ne peut pas tout décocher : la base refuse un tableau vide (contrainte
`videos_voies_valides`), et l'interface empêche de retirer la dernière case.

### Formules

**Formule Essentielle**, **Formule Intensive**, **Programme Approfondi** — au
choix, une ou plusieurs. Un cours vidéo n'est donc plus lié d'office à la
Formule Intensive.

Ce choix **prime sur le droit global de la formule** (`formula_permissions`) :

- cocher une formule **ouvre** la vidéo à ses élèves même si le droit global
  « Résumé vidéo » y est désactivé — le bloc « Cours vidéo » s'affiche alors
  pour eux ;
- ne pas la cocher **ferme** la vidéo à ses élèves même si le droit global est
  actif.

Par défaut, un nouvel ajout reprend l'audience historique : *Formule Intensive*
pour un cours vidéo, *Programme Approfondi* pour une séance approfondie. Les
vidéos déjà en ligne ont été migrées à l'identique — rien n'a changé pour les
élèves tant qu'on ne coche rien de nouveau.

Le même filtrage s'applique partout : onglets et cartes de l'item, page
`/cours/<id>/video`, supports, vue partagée et manifeste de l'application
mobile. Les administrateurs voient tout.

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

Le support **hérite de l'audience de sa vidéo** — voies et formules cochées.
Changer le public de la vidéo change celui de ses supports, sans autre geste.

## Règles à connaître

- **La catégorie n'est pas modifiable après création** (cours vidéo ↔ séance
  approfondie) : elle détermine l'onglet où la vidéo apparaît. Pour en changer,
  supprimer et recréer. En revanche le **public** (voies, formules) se modifie
  librement depuis le crayon.
- **Créer un item est réservé aux administrateurs** (un professeur n'agit que
  sur les items de son périmètre).
- Le téléversement direct vers Bunny, sans passer par bunny.net, reste
  disponible sous « Autre méthode » : il ajoute une vidéo à la fin de la
  catégorie choisie.
- L'ordre affiché dans la page est exactement celui que voient les élèves.
