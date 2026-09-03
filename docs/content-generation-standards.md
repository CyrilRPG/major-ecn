# Standards de génération de contenu — Major ECN

> **Règle d'or** : zéro hallucination médicale. Toute génération s'appuie
> exclusivement sur les sources fournies (fiche PDF + annales du cours).
> En l'absence de source, on ne génère pas — on demande la source.

## Standard canonique de production par collège (2026)

Le standard ci-dessous remplace les anciens volumes 4 + 4 encore mentionnés
dans les descriptions historiques des actions admin :

| Banque | Séries | Questions par série | Format |
|---|---:|---:|---|
| QCM | 8 | 5 | 5 propositions A-E, 1 à 4 exactes |
| DP QCM | 8 | 7 | vignette commune et progression clinique naturelle |
| QROC | 8 | 5 | réponse attendue obligatoire, aucun item |
| DP QROC | 8 | 7 | vignette commune et progression clinique naturelle |

Un cours standard contient donc **32 séries, 192 questions et 480 items QCM**,
ainsi que **100 à 200 flashcards**. Les QCM/DP QCM portent
`allowed_voies=['interne']`; les QROC/DP QROC portent
`allowed_voies=['externe']`. Le staff voit les quatre banques.

### Fiche Major ECN et figures source

- La fiche est une synthèse pédagogique inédite : aucun assemblage de blocs
  copiés-collés du document source.
- Le niveau N+2 est réservé aux dépendances réelles d'un N+1 ; il n'est ni
  systématique, ni décoratif, et les lignes N+1 simples restent majoritaires.
- Une image contenant du texte est toujours placée après le texte, dans une
  ligne pleine largeur. Elle n'est jamais réduite dans une troisième colonne.
- Les numéros éditoriaux du document source ne sont jamais affichés. Lorsqu'ils
  sont incrustés dans le raster, utiliser un recadrage ou un masque blanc ciblé,
  sans génération ni altération du contenu médical de l'image.
- Le PDF final est rendu intégralement en PNG et chaque page est contrôlée :
  page blanche, contenu rogné, débordement, tableau tronqué, figure illisible,
  répétition de bandeau et page anormalement creuse.

Les questions 2 à 7 d'un DP apportent une donnée clinique, biologique,
thérapeutique ou évolutive nouvelle dans une phrase naturelle. Les étiquettes
visibles telles que « Nouvel élément : » ou « Question : » sont interdites.
La vignette reste stockée dans `qcm_series.vignette` et n'est jamais répétée
dans les énoncés.

La publication de masse passe par `replace_cours_generated_content` dans sa
version QCM/QROC ou par le publieur de collège avec rollback et audit de lecture
par cours. Un collège en production reste `specific` jusqu'à réussite de
l'audit global, puis seulement il peut passer à `all`.

---

## Banques d'entraînement — 32 séries par cours

À chaque demande « génère des QCM pour le cours X » :

Ne jamais dériver les propositions d'une flashcard, ni utiliser les versos de
cartes comme distracteurs. Les QCM sont une rédaction indépendante, organisée
par sous-thème, avec des propositions plausibles, spécifiques et justifiées une
à une depuis la source.

### Découpage obligatoire

| Banque | Séries | Questions/série | Contraintes |
|---|---:|---:|---|
| QCM isolés | 8 | 5 | cinq propositions A-E, une à quatre exactes |
| DP QCM | 8 | 7 | vignette commune et progression clinique |
| QROC isolés | 8 | 5 | réponse courte, objectivable, sans proposition |
| DP QROC | 8 | 7 | vignette distincte et progression clinique |

**Total : 32 séries, 192 questions et 480 propositions QCM.**

### Nomenclature des séries (champ `label` dans `qcm_series`)

- QCM : `QCM — Série 1 · <sous-thème>` à `QCM — Série 8 · …`.
- DP QCM : `DP QCM 1 · <titre court du cas>` à `DP QCM 8 · …`.
- QROC : `QROC — Série 1 · <sous-thème>` à `QROC — Série 8 · …`.
- DP QROC : `DP QROC 1 · <titre court du cas>` à `DP QROC 8 · …`.
- Les 32 intitulés sont uniques et les sous-thèmes complémentaires.

### Style des questions

**Questions isolées** : connaissances et raisonnement sur les points utiles aux
EVC :
- énoncé court, factuel
- 5 items A à E
- 1 à 4 bonnes réponses possibles
- justification médicale par item (validée par la fiche ou les annales)

**Dossiers progressifs** : 8 DP QCM et 8 DP QROC de sept questions chacun :
- énoncé clinique unique en tête (vignette de 8-15 lignes : patient, motif,
  examen, première para-clinique)
- la vignette décrit également la décision initiale et un point de suivi ; un
  DP technique reste un cas patient, jamais une liste de questions de cours
- les questions 2 à 7 apportent naturellement une donnée clinique, biologique,
  opératoire, thérapeutique ou évolutive réellement utile au raisonnement ;
- les libellés artificiels « Nouvel élément », « À l'étape », « Question » et
  les annonces de génération sont interdits ;
- les exemples illustratifs du cours ne deviennent ni le sujet d’une carte ni
  le cœur d’une question : on teste la règle générale transférable
- **La vignette est stockée dans `qcm_series.vignette` (colonne dédiée)
  PAS dans le `enonce` des questions.** Le composant `QcmSession` l'affiche
  automatiquement dans un encadré séparé bordé bordeaux au-dessus de chaque
  question. Ne JAMAIS la dupliquer dans `qcm_questions.enonce`.
- chaque `qcm_questions.enonce` contient uniquement la question spécifique
  (sans la vignette)
- les sept questions suivent un raisonnement cohérent : analyse initiale,
  diagnostic ou risque, examens, décision, traitement, surveillance et
  complication/adaptation ;
- **inspiration directe des annales du cours** : style, longueur, niveau de
  pertinence des distracteurs
- **pas trop faciles** : viser le niveau réel des EVC, pas un exercice scolaire
- les distracteurs sont plausibles et spécifiques. Les formulations « toutes
  les réponses ci-dessus » et les inversions mécaniques sont interdites.

Idem pour les **annales** (`qcm_series.type = 'annale'`) qui ont une vignette
commune : on remplit `qcm_series.vignette` et les `qcm_questions.enonce` ne
contiennent que la question.

### Sources

- **Fiche PDF du cours** = source primaire pour le contenu théorique
- **Annales du cours** (table `qcm_series` type = `annale`, et la table
  `cours_chunks` qui les indexe) = référence de style obligatoire pour les DP
- Aucune connaissance externe : si un point n'est pas dans la fiche ou les
  annales, on ne crée pas de question dessus

---

## Flashcards — 100 à 200 par cours, exhaustives

À chaque demande « génère des flashcards exhaustifs pour X » :

### Volume

- **Minimum 100** cartes
- **Maximum 200** cartes
- Cible : ~1 carte par notion essentielle de la fiche + 1 carte par item piège
  des annales du cours

### Format

Champ `recto` : question courte, claire, **mémorisable**.
Champ `verso` : réponse concise (1-3 lignes max), **structurée** quand
plusieurs éléments (puces ou triade type :).

**Contraintes d'affichage NON négociables** (le verso est rendu en GROSSE
police centrée dans une carte à hauteur fixe avec `overflow-hidden` — un verso
trop long ou en bloc est COUPÉ / illisible) :

- **Longueur du verso : viser ≤ 110 caractères de texte visible, maximum
  absolu 150.** (Moyenne des autres decks ≈ 90 caractères — c'est la cible.)
- **TOUJOURS des retours à la ligne** : dès qu'il y a plusieurs éléments,
  utiliser `<ul><li>…</li></ul>` (2-3 items courts) OU des `<br>` entre lignes.
  **JAMAIS un pavé de texte compact**, jamais deux phrases collées (« …bulbe.La
  voie… » interdit — mettre un `<br>` ou au moins un espace après le point).
- Idéalement 3-6 lignes courtes, une idée par ligne.
- Balises autorisées uniquement : `<strong>`, `<em>`, `<br>`, `<ul>`, `<li>`
  (voir « Affichage & rendu HTML » plus bas).

Exemples :
- ✅ `recto`: « Triade de l'insuffisance cardiaque droite ? »
       `verso`: « Œdèmes des membres inférieurs<br>turgescence jugulaire<br>hépatalgie d'effort »
- ✅ `verso`: « <strong>Vermis</strong> = statique/équilibre.<br><strong>Hémisphères</strong> = coordination des membres. »
- ❌ Carte trop longue, ouverte, en bloc sans retour à la ligne, ou nécessitant
  un raisonnement.

### Couverture

Le set doit couvrir **tous les points essentiels** :
1. Définitions / épidémiologie clés
2. Mécanismes physiopath obligatoires
3. Signes cliniques pathognomoniques / triades
4. Critères diagnostiques chiffrés (seuils, scores)
5. Para-clinique : examens à demander en 1re intention
6. Diagnostics différentiels indispensables
7. Thérapeutique : 1re intention, posologies clés, contre-indications
8. Complications à connaître
9. Suivi / pronostic / facteurs de mauvais pronostic
10. Points piégeants identifiés dans les annales (justifications des items
    faux ou faux amis fréquents)

### Sources

- **Fiche PDF du cours** = source primaire pour 80 % des cartes
- **Annales du cours** = source pour les ~20 % de cartes ciblant les pièges
  réellement tombés au concours
- Aucune extrapolation hors source

---

## Procédure côté Claude Code

Quand l'utilisateur demande une génération :

1. **Vérifier que le PDF de fiche est attaché à la demande** (ou présent dans
   le stockage Supabase). Sinon, refuser et demander le PDF.
2. **Récupérer les annales existantes du cours** depuis la DB
   (`qcm_series.type = 'annale'` + `qcm_questions` + `qcm_items`).
3. **Générer le contenu** strictement à partir des deux sources ci-dessus.
4. **Insérer en DB** via Supabase (`apply_migration` ou `execute_sql`) :
   - `qcm_series` : créer 8 lignes (4 type='qcm' label='Cours — Série N · …',
     4 type='qcm' label='DP N · …'). Pour les DP : remplir
     `qcm_series.vignette` avec la vignette clinique commune.
   - `qcm_questions` : 5 lignes par série. **Pour les DP : `enonce` ne
     contient que la question spécifique (sans la vignette).**
   - `qcm_items` : 5 items A-E par question avec `is_correct` et `justification`
   - `flashcards` : 100-200 lignes
5. **Déclencher la réindexation RAG** (`reindexCoursAction`) après insertion
   pour mettre à jour `cours_chunks`.

## Procédure côté admin de la plateforme

L'admin peut aussi déclencher la génération automatique :
- Onglet « Flashcards » → bouton **Générer flashcards exhaustifs** (action
  `generateFlashcardsAction`)
- L'ancien bouton « Générer 4 séries de 5 QCM » ne respecte pas le standard
  collège 2026 et ne doit pas être utilisé pour cette production.

Les deux actions appellent Claude Sonnet 4.6 avec le contexte fiche + annales
et respectent les standards ci-dessus.

---

## Affichage & rendu HTML — pour que le contenu s'affiche TOUJOURS correctement

Le contenu riche (énoncés, corrections, **vignettes**, flashcards) est nettoyé
par une **liste blanche stricte** (`src/lib/flashcards/rich-text.ts`) avant
rendu. Toute balise hors liste est retirée et, si un champ était affiché en
texte brut, ses balises apparaîtraient EN CLAIR à l'écran (bug classique).

### Balises autorisées (les seules qui s'affichent)

`<b> <strong> <i> <em> <u> <sub> <sup> <br> <span style="color:…"> <img>`
plus, dans les **vignettes ET les flashcards** (recto/verso), `<ul> <li> <p>`
sont tolérés car le rendu passe par `sanitizeBlockHtml` qui les convertit en
`<br>` / puces. Partout ailleurs (énoncés/corrections QCM via
`sanitizeFlashcardHtml`), ces balises de bloc sont retirées et le texte se
colle : y utiliser `<br>` pour les sauts de ligne.

**Interdits partout ailleurs** : `<p>`, `<div>`, `<ul>`, `<li>`, `<table>`,
`<h1-6>`… → utiliser `<br>` pour les sauts de ligne et `<strong>` pour le gras.

### Vignettes de dossier (`qcm_series.vignette`)

- Rédiger la vignette en **texte + `<strong>` + `<br>`** (ou `<p>`/`<ul>` qui
  seront convertis en `<br>`). Ne jamais compter sur `<p>`/`<ul>` pour la mise
  en forme finale.
- Elle est affichée via **`sanitizeVignetteHtml`** dans `QcmSession` et
  `ExamRunner` (encadré « Contexte clinique »). **Ne jamais** afficher une
  vignette (ni aucun champ HTML) en texte brut `{vignette}` — toujours
  `dangerouslySetInnerHTML={{ __html: sanitizeVignetteHtml(...) }}`.

### Fiche PDF (charte `major-ecn-fiche`) — cohérence du plan

Voir aussi `major-ecn-fiche/CLAUDE.md`. Règle critique de mise en page :

- `thead { display: table-header-group }` ⇒ **le `<thead>` d'une `.fiche-table`
  se répète en haut de CHAQUE page**. Donc **une seule sous-partie (A, B, C…)
  par `<table class="fiche-table">`** : son `ft-head-row` (« A. … ») va dans SON
  propre thead. Mettre plusieurs sous-parties dans une même table (head-rows en
  `tbody`) fait répéter « A. » au-dessus du contenu de B/C sur les pages
  suivantes → **plan incohérent** (bug vu en prod).
- La bannière sombre `ft-banner-row` n'est mise QUE dans le thead de la 1re
  table de chaque grande partie.
- Chaque grande partie = `<section class="partie-page partie-page--first">`
  (nouvelle page). Sous-parties = tables successives dans cette section.
- **Vérification obligatoire avant publication** : extraire le texte page par
  page (`pdfjs-dist/legacy/build/pdf.mjs`, dispo dans le repo) et contrôler que
  l'en-tête en haut de chaque page coiffe bien SON contenu, et qu'aucune
  sous-partie n'a été perdue.

---

## Anti-hallucination — règles non négociables

1. **Pas de PDF → pas de génération**. On répond : « PDF manquant. Téléverse
   d'abord la fiche dans l'onglet Fiche ou joins-la à la demande. »
2. **Pas d'annale → DP simplifié**. Si le cours n'a pas encore d'annale
   indexée, prévenir l'utilisateur et générer les DP en s'inspirant
   uniquement de la fiche (qualité dégradée).
3. **Posologies, scores, seuils** : reproduction textuelle de la fiche, jamais
   recopiés de mémoire.
4. **Disclaimer permanent** dans l'UI étudiant pour toute génération IA.
