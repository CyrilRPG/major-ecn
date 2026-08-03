# Gestion des fiches de cours

Un item peut porter **plusieurs fiches**. Elles s'affichent toutes dans le
**même onglet « Fiche de cours »** chez l'élève, sous forme de pastilles — la
première est ouverte par défaut.

## Côté administration

`Admin → Contenu → <item> → onglet Fiche`

Une seule zone de dépôt, qui accepte **PDF et HTML, plusieurs fichiers à la
fois**. Après la sélection (ou le glisser-déposer), chaque fichier apparaît avec
un champ **titre**, prérempli depuis le nom du fichier : c'est ce titre qui
s'affiche **au-dessus du document** côté élève. On corrige ce qu'on veut, puis
« Ajouter N fiches ».

- Un **PDF** part directement du navigateur vers le bucket `fiches` — aucune
  limite de taille de requête serveur.
- Un **HTML** est converti en PDF (charte Major ECN) par Chromium via
  `/api/fiches/<id>/render-html`, et la fiche reste modifiable dans l'éditeur
  WYSIWYG.

La liste au-dessus donne, pour chaque fiche :

- flèches ↑ ↓ pour changer l'ordre (c'est celui que voient les élèves) ;
- crayon pour **renommer**, **remplacer le fichier** (PDF ou HTML) et, pour une
  fiche non-PDF, **« Éditer en ligne »** (`/cours/<id>/fiche/edit?doc=<ficheId>`) ;
- corbeille pour supprimer (la ligne **et** le fichier).

Une fiche déposée en PDF **n'est pas éditable en ligne** : pour la modifier, on
remplace le fichier — par un PDF, ou par un HTML qui la rend à nouveau éditable.
C'est écrit dans l'interface.

## La « fiche principale »

C'est celle dont l'`order_index` est le plus bas. C'est la **cible par défaut**,
quand aucune fiche n'est désignée explicitement :

- l'éditeur en ligne (`/cours/<id>/fiche/edit`, ou `?doc=<ficheId>` pour une
  autre fiche) ;
- la conversion HTML → PDF (`/api/fiches/<id>/render-html`, qui accepte
  `ficheId` pour viser une fiche, ou `createNew: true` + `titre` pour en créer
  une à la suite) ;
- l'autosave `content_html` (`/api/fiches/<id>/html`, `?doc=` en GET et
  `ficheId` en POST) et `content_json` ;
- la **fiche éclair** (`/api/fiches/<id>/express`) — toujours la principale ;
- l'assistant (contexte pédagogique) et le manifeste mobile — toujours la
  principale.

Côté élève, le bouton « Éditer la fiche » n'apparaît que lorsque la fiche
principale est affichée ; pour les autres, l'accès à l'éditeur passe par le
crayon de l'onglet Contenu.

## Côté élève

`/cours/<id>/fiche` — le **titre de la fiche est affiché au-dessus du
document**, et une pastille par fiche apparaît dès qu'il y en a plus d'une,
`?doc=<ficheId>` pour choisir (le paramètre `embed` de la vue partagée est
conservé). Chaque PDF est servi **filigrané au nom de l'élève** par
`/api/fiches/<id>/pdf?doc=<ficheId>`, exactement comme avant.

Le téléchargement (staff uniquement, ou droit accordé par spécialité) porte sur
la fiche affichée : `/api/fiches/<id>/download?doc=<ficheId>`. Quand l'item
porte plusieurs fiches, le nom du document est ajouté au nom de fichier pour
éviter les collisions.

## Base de données

- `fiches.order_index` (`integer not null default 0`) — ordre d'affichage,
  0 = fiche principale. Index `fiches_cours_order_idx (cours_id, order_index)`.
- L'index unique `fiches_cours_id_unique (cours_id)`, qui verrouillait « une
  seule fiche par item », a été **supprimé** (migration
  `20260802140000_fiches_multiples.sql`). Aucun `upsert on_conflict` ne s'y
  appuyait.

Toute lecture qui doit désigner « la » fiche d'un item trie désormais par
`order_index asc, created_at asc` et prend la première — jamais « la plus
récente », qui pointerait sur le dernier PDF ajouté.
