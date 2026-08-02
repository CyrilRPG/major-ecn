# Gestion des fiches de cours

Un item peut porter **plusieurs fiches**. Elles s'affichent toutes dans le
**même onglet « Fiche de cours »** chez l'élève, sous forme de pastilles — la
première est ouverte par défaut.

## Côté administration

`Admin → Contenu → <item> → onglet Fiche`

Deux blocs :

1. **Fiche principale (HTML → PDF, éditable en ligne)** — le flux historique :
   on dépose un `.html`, il est converti en PDF (charte Major ECN) par Chromium
   et reste modifiable dans l'éditeur WYSIWYG.
2. **Toutes les fiches de cet item** — la liste ordonnée :
   - flèches ↑ ↓ pour changer l'ordre (c'est celui que voient les élèves) ;
   - crayon pour **renommer** (le nom est l'étiquette de la pastille) ou
     **remplacer le fichier** PDF ;
   - corbeille pour supprimer (la ligne **et** le fichier) ;
   - « Ajouter une ou plusieurs fiches PDF » : sélection multiple, chaque
     fichier devient une fiche placée à la suite.

Une fiche déposée en PDF **n'est pas éditable en ligne** : pour la modifier, on
remplace le fichier. C'est écrit dans l'interface.

## La « fiche principale »

C'est celle dont l'`order_index` est le plus bas. Elle seule est visée par :

- l'éditeur en ligne (`/cours/<id>/fiche/edit`) ;
- la conversion HTML → PDF (`/api/fiches/<id>/render-html`) ;
- l'autosave `content_html` / `content_json` ;
- la **fiche éclair** (`/api/fiches/<id>/express`) ;
- l'assistant (contexte pédagogique) et le manifeste mobile.

Les fiches suivantes sont des documents supplémentaires. Le bouton « Éditer la
fiche » n'apparaît donc que lorsque la fiche principale est affichée.

## Côté élève

`/cours/<id>/fiche` — une pastille par fiche dès qu'il y en a plus d'une,
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
