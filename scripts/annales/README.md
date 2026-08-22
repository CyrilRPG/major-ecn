# Annales EVC corrigées → onglet DP · QI

Chaîne d'intégration des annales de `Annales/` (sujets officiels EVC + corrigés
Major ECN / PAE Formation) sous forme de séries `qcm_series` publiées dans
l'onglet **DP · QI** de l'item « Révisions - <Collège> », sous la catégorie
ambre **Annales**.

## Principes

- **Seuls les sujets disposant d'un corrigé** sont intégrés.
- **Fidélité stricte** : on ne crée que les séries réellement présentes dans le
  sujet. Aucun QCM n'est dérivé, aucun contenu n'est inventé.
- **Une épreuve = UNE série**, dans l'ordre du sujet officiel, quitte à mêler
  QCM et questions rédactionnelles : l'EVCP 2019 de Médecine générale alterne,
  au sein d'un même sujet, QCM 1-3, rédactionnelles 4-5 puis QCM 6-10. Les
  séries ne portent donc jamais de suffixe de format ni de voie.
- **Aucune restriction de voie** : une annale est le sujet officiel d'une
  session, elle n'appartient ni à la voie interne ni à la voie externe
  (`qcm_series_voie_restrict` les exempte, cf.
  `supabase/migrations/20260823100000_annales_toutes_voies.sql`).
- **Aucune image omise**, des deux côtés :
  - `audit.mjs` échoue si une figure extraite d'un **corrigé** n'est ni citée par
    une question, ni déclarée ignorée avec un motif (`figuresIgnorees`) ;
  - `audit-sujets.mjs` fait de même pour les **sujets officiels**, dont le corrigé
    ne reprend pas toujours l'iconographie (« interprétez le tracé ECG suivant »
    sans que le tracé soit reproduit). Ce qu'il signale s'arbitre à l'œil, puis
    se solde soit par un rattachement, soit par un motif dans
    `sujetFiguresCouvertes`.
- **Pas de `allowed_voies`** sur les séries : renseigner la colonne masquerait
  la série aux élèves dont la voie n'est pas renseignée, alors même que les
  annales sont ouvertes aux deux voies.

## Convention de libellé

`Annales - <Collège> - <Année> - <Type>`, `Type ∈ {EVCF, EVCP}`, avec les
suffixes nécessaires :

- `Annales - Orthopédie - 2019 - EVCF`
- `Annales - Cardiologie - 2024 - EVCP - Sujet 3`

Le suffixe nomme un DOSSIER du sujet (« Sujet 3 », « Cas clinique 2 »,
« Session de novembre »), jamais un format ni une voie : les QCM et les
questions rédactionnelles d'une même épreuve cohabitent dans la même série.

Le préfixe `Annales` est ce qui déclenche la catégorie ambre, le bandeau
« Annale » côté élève et l'exemption de voie. L'`annee` de la série (à défaut,
l'année lue dans le libellé) est ce qui regroupe les annales par session dans
l'onglet DP · QI : l'élève choisit d'abord une année, puis l'épreuve.

## Le piège Médecine générale

`col-medecine-generale` est un collège PARENT dont les sous-collèges portent des
noms de spécialités (`col-mg-cardiologie`, `col-mg-orl`…). **Ce ne sont pas** les
collèges de spécialité autonomes (`col-cardiologie`…) : deux choses distinctes.

- Annales d'une spécialité → collège autonome.
- Annales de Médecine générale (code EVC 71) → item `Annales - Médecine générale`
  rattaché au collège parent, `order_index = 0`, donc affiché AVANT les
  sous-collèges.
- ORL est hors périmètre : il n'existe aucun collège ORL autonome.

## Enchaînement

```bash
# 1. Inventaire : quels corrigés portent quelles annales, et lesquels sont exclus
node scripts/annales/inventaire.mjs                       # tout le corpus
node scripts/annales/inventaire.mjs --college "ANNALES ORTHOPEDIE"
```

```bash
# 2. Atelier : texte paginé + figures dédupliquées, par corrigé
node scripts/annales/extraire.mjs --college "ANNALES ORTHOPEDIE"
```

```bash
# 3. Sujet officiel (contrôle de fidélité de l'énoncé), via LibreOffice
node scripts/annales/sujet-officiel.mjs --type EVCF --annee 2012 --code 53
```

```bash
# 4. Captures d'écran : repérage, planche-contact, recadrage, vérification
node scripts/annales/recadrer.mjs --lister --college annales-orthopedie
node scripts/annales/recadrer.mjs --planche --dossier annales-orthopedie/evcf2017
node scripts/annales/recadrer.mjs --auto --dossier annales-orthopedie/evcf2017 --boite 0.15,0.24,0.545,0.545
node scripts/annales/recadrer.mjs --verif --dossier annales-orthopedie/evcf2017
```

```bash
# 5. Contrôle puis publication
node scripts/annales/audit.mjs --data scripts/annales/data/orthopedie.json
node scripts/annales/publier.mjs --data scripts/annales/data/orthopedie.json --dry-run
node scripts/annales/publier.mjs --data scripts/annales/data/orthopedie.json
node scripts/annales/audit.mjs --data scripts/annales/data/orthopedie.json --db
```

```bash
# 6. Contrôles transverses (tout le corpus)
node scripts/annales/audit-sujets.mjs --extraire      # images des sujets officiels
node scripts/annales/audit-sujets.mjs --planches      # copies des orphelines à relire
node scripts/annales/audit-publie.mjs                 # base + téléchargement des images
npx tsx scripts/annales/audit-realisable.mts          # l'annale est-elle FAISABLE ?
```

`audit-realisable.mts` se place du côté de l'élève : item d'accueil, visibilité
pour treize profils (voie × formule, bonus Gériatrie) en important la règle
d'accès réelle, présence d'une année exploitable pour la navigation par session,
puis question par question — énoncé lisible, propositions jouables, corrigé
présent, images servies.

### Retoucher du contenu déjà publié

`publier.mjs --force` **supprime puis recrée** les questions : par cascade, il
efface les `qcm_attempts` des élèves. Pour une retouche ciblée, deux scripts
mettent à jour la seule colonne concernée, sans rien détruire :

```bash
node scripts/annales/sync-vignettes.mjs   [--ecrire]  # qcm_series.vignette
node scripts/annales/sync-images.mjs      [--ecrire]  # images des questions et propositions
node scripts/annales/fusionner-series.mjs [--ecrire]  # fusion/renommage de séries
```

## Format d'un fichier `data/<college>.json`

```jsonc
{
  "collegeId": "col-orthopedie",
  "nom": "Orthopédie",
  "coursTitre": "Révisions - Orthopédie",
  "coursOrderIndex": 134,
  "sources": {
    "ANNALES ORTHOPEDIE/EVCF.53 2012 correction.pdf": {
      "atelier": "annales-orthopedie/evcf-53-2012-correction",
      "sujetOfficiel": "Annales/Sujets/evcf_2012/EVCF.53.DOC",
      "figuresIgnorees": { "img-004-011.png": "logo du collège, sans contenu" },
      // Figures du SUJET officiel déjà couvertes par une figure du corrigé
      // (même planche recadrée, agrandie ou en miroir) : verdict d'arbitrage
      // visuel, lu par `audit-sujets.mjs`.
      "sujetFiguresCouvertes": { "source_html_1a2b.png": "même radiographie que img-003-012" }
    }
  },
  "series": [{
    "label": "Annales - Orthopédie - 2012 - EVCF",
    "annee": 2012, "type": "EVCF",
    "source": "ANNALES ORTHOPEDIE/EVCF.53 2012 correction.pdf",
    "orderIndex": 12,
    "vignette": null,                       // contexte clinique HTML, pour les EVCP
    "questions": [{
      "format": "qroc",                     // une série = UN seul format
      "enonce": "…HTML…",                   // porte le « Sujet n°N — contexte »
      "images": ["annales-orthopedie/…/figures/img-003-024.png"],
      "reponseAttendue": "…",               // réponse concise (pas de « | »)
      "correctionGenerale": "…HTML…",       // corrigé détaillé
      "items": []                           // propositions A→E si format 'qcm'
    }]
  }]
}
```

Balises autorisées au rendu : `<b> <strong> <i> <em> <u> <sub> <sup> <br>
<span style="color:…"> <img>` (`sanitizeFlashcardHtml`). Les sauts de ligne
simples sont conservés (`whitespace-pre-line`) : les listes se composent avec
« • ».

## Pièges rencontrés

- **Noms de fichiers en Unicode NFD** (corrigés Cardiologie) : `pdfinfo` /
  `pdftotext` Windows échouent dessus. `pdf.mjs` copie systématiquement le PDF
  sous un nom ASCII avant tout appel externe.
- **Gabarit de diapositive** : les decks PowerPoint répètent logo et bandeau sur
  chaque page, soit des centaines d'images parasites (855 images brutes pour 28
  figures réelles). Le tri se fait sur le SHA-1 du contenu, pas sur le numéro
  d'objet PDF — PowerPoint duplique l'objet à chaque diapositive.
- **Captures d'écran plein écran** : environ un tiers des figures d'Orthopédie.
  Elles embarquent barre d'onglets et favoris nominatifs, URL, barre des tâches,
  vignette webcam, voire une page Facebook ou YouTube complète. Elles sont
  recadrées sur le contenu médical (`recadrer.mjs`), les coordonnées étant
  consignées dans `figures/recadrages.json`. Attention : la géométrie n'est PAS
  constante d'une capture à l'autre au sein d'un même corrigé — vérifier chaque
  lot avec `--verif`.
- **Encodage de police cassé** dans certains corrigés (« Orienta5on » pour
  « Orientation », « a>einte » pour « atteinte ») : `pdftotext` est inexploitable,
  il faut lire les pages rendues en image.
