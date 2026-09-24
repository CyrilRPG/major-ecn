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

## Séance à venir : déposer les dossiers avant la vidéo

Avant une séance en direct, les élèves doivent pouvoir préparer leurs dossiers
alors que la vidéo n'existe pas encore. Pas besoin de lien Bunny pour cela :

1. **Admin › Vidéos** : collège, item, catégorie, puis **Séance à venir
   (dossiers d'abord)** — ou, dans le formulaire d'ajout, la case **Séance à
   venir — pas encore de vidéo**.
2. Renseigner le **nom**, les **voies** et **formules**, la **date de la séance
   en direct** (facultative) et glisser les PDF dans **Dossiers à préparer**.
   Le lien Bunny reste vide. **Enregistrer tout**.
3. La ligne porte le badge **« Vidéo à venir »** (avec la date). On peut
   prévenir les élèves : le dossier de la séance est en ligne.
4. **Après la séance** : crayon sur la même ligne, champ **Ajouter la vidéo
   (après la séance)**, coller le lien Bunny, **Enregistrer**. Les dossiers
   restent attachés, rien à refaire ; la séance devient une vidéo ordinaire.

Côté élève, la séance apparaît dans la liste de sa catégorie avec un bouton
**Préparer** et, à la place du lecteur, l'annonce « Séance en direct à venir —
le … : préparez les documents ci-dessous ; la vidéo sera ajoutée après la
séance », suivie de ses supports (onglet **« Support de la séance <nom> »**
compris). Mêmes règles d'audience que pour une vidéo (voies, formules, listes
nominatives, statut « À valider » / programmation).

À savoir :

- une séance à venir n'est montrée aux élèves que si **au moins un dossier**
  leur est visible (une ligne sans vidéo ni document reste cachée) ;
- elle ne compte **pas** comme une vidéo à regarder : ni dans les compteurs de
  contenu, ni dans la progression, ni dans le manifeste de l'application
  mobile (qui ne liste que des vidéos lisibles) ;
- la date est **indicative** : elle ne publie ni ne masque rien. Elle se
  modifie depuis le crayon ;
- la date est stockée dans `videos.live_at`, ajoutée par la migration
  `20260924100000_videos_seance_a_venir.sql`. Sans cette migration, tout
  fonctionne sauf la date (l'ajout avec une date est refusé avec un message
  explicite).

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
