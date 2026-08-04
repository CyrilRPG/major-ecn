# Production d'un collège à partir d'un fonds `.docx` — mode opératoire

Procédure suivie pour le collège **Orthopédie** (133 chapitres EMC en `.docx`).
Reproductible telle quelle pour un autre fonds livré au même format.

Ce document est écrit pour être **exécuté**, pas seulement lu : chaque étape
donne la commande, le contrôle qui prouve qu'elle a réussi, et le piège qu'elle
évite.

---

## 0. Ce que produit la chaîne, par chapitre

| Élément | Volume | Table |
|---|---|---|
| Séries QCM | 8, de 5 questions | `qcm_series` (`kind='qcm'`) |
| Séries DP | 8, de **7** questions | `qcm_series` (`kind='dp'`, avec `vignette`) |
| Questions | 96 | `qcm_questions` (`format='qcm'`) |
| Items A–E | 480 | `qcm_items` |
| Flashcards | 40 à 60 | `flashcards` |
| Fiche de cours + fiche éclair | 1 PDF | `fiches` |

Pas de QROC. Sur 133 chapitres : ~12 800 questions, ~64 000 items, ~7 000 cartes.

---

## 1. Extraction du fonds

```bash
node scripts/docx-extract-lot.mjs "<dossier .docx>" "<corpusDir>"
```

Un `.docx` est une archive ZIP : le script lit `word/document.xml` et
`word/media/*` sans dépendance, et produit par chapitre un `extract.json`
(blocs texte ordonnés + images) et un dossier `img/`.

**Ce qu'il garantit** : l'ordre des images dans le document est conservé, et une
image n'est légendée **que si** le document porte une légende à son endroit.
Aucune légende n'est fabriquée — une figure sans légende source ressort avec
`legende: null`.

Contrôle : `chapitres : N | echecs : 0` en fin de sortie.

---

## 2. Réparation et quarantaine

```bash
node scripts/corpus-reparer.mjs "<corpusDir>"
```

**Pourquoi cette étape existe.** Ces `.docx` viennent d'une conversion de PDF à
deux colonnes qui, sur une partie du fonds, a entrelacé les colonnes et
**détruit des valeurs chiffrées** :

> « perforation de l'os cortical comprise entre __ et __ **mm** »
> « accident de moto dans __ **%** des cas chez un adulte de __ à __ **ans** »

Le script répare ce qui est **prouvable** et met le reste en quarantaine.

- **Réparé** : mots scindés (`Arthrol yse` → `Arthrolyse`), sous trois garde-fous
  cumulatifs — la forme recollée doit être attestée ≥ 8 fois ailleurs dans le
  corpus, les deux fragments doivent être rares isolément, et aucun ne doit être
  un mot outil. Sans cette dernière condition, `la` + `tence` deviendrait
  `latence` au milieu d'une phrase correcte.
- **Non réparé, mis en quarantaine** : valeurs chiffrées disparues et textes
  dupliqués. Une phrase plausible mais fausse est pire qu'une phrase visiblement
  cassée : plus rien ne signale l'erreur au relecteur.

Résultat obtenu sur l'orthopédie : **97,3 % des paragraphes exploitables**,
568 en quarantaine (283 valeurs perdues, 285 duplications), 7 jointures réparées.

Le faible nombre de jointures est **voulu** : la règle privilégie la précision.

---

## 3. Dimensions des images

```bash
node scripts/corpus-dimensions.mjs "<corpusDir>"
```

La charte bascule une figure en pleine largeur au-delà de **700 px**. Sans la
largeur réelle, ce critère ne s'applique pas et tableaux et algorithmes partent
en 38 % de colonne, illisibles.

Le script enrichit `extract.json` **sur place** — une réextraction écraserait les
réparations et les quarantaines de l'étape 2.

Contrôle : `illisibles : 0`.

---

## 4. Création du collège et des items

```sql
-- Le collège, une seule fois
insert into public.matieres (id, nom, semestre_id, order_index, icon_key, color_hex)
values ('col-<slug>', '<Nom>', 'edn-prog', <rang>, '<Icone>', '#<couleur>');

-- Un item par chapitre
insert into public.cours (matiere_id, titre, order_index, importance)
values ('col-<slug>', '<Titre du chapitre>', <n>, 0);
```

⚠️ **`importance` reste à 0.** Le nombre d'étoiles est un arbitrage
pédagogique qui appartient au professeur, pas à la génération.

`icon_key` doit exister dans `src/lib/icons.ts` (`Bone` pour l'orthopédie).

---

## 5. Génération des questions et flashcards

Un sous-agent `general-purpose` par chapitre, **4 en parallèle** — au-delà, les
écritures concurrentes saturent le MCP. Insertion directe via `execute_sql`,
dollar-quoting `$c$…$c$` obligatoire (les apostrophes françaises sont partout).

Le brief doit contenir, sans rien omettre :

1. **Le chemin de `extract.json`** et la consigne d'**ignorer tout bloc portant
   un champ `quarantaine`**.
2. **« N'invente rien »**, avec la raison : ce sont des médecins qui réviseront
   dessus. Si la source ne dit pas, la question ne porte pas dessus.
3. Le `coursId`.
4. Les formats exacts (voir §6).
5. La contrainte de lisibilité des flashcards (voir §7).
6. **L'ordre de signaler l'échec plutôt que de remplir** : « si tu n'as pas pu
   produire 8 séries de qualité, dis-le ».

---

## 6. Formats exacts

### Série QCM
`qcm_series` : `label` = `QCM — Série N · <Titre>`, `type='qcm'`, `vignette=null`.
5 questions, `order_index` 1..5.

### Série DP
`qcm_series` : `label` = `DP N · <Titre>`, `type='qcm'`, `vignette` = cas
clinique en HTML (`<p>`, `<strong>` sur les éléments clés).
**7 questions**, `order_index` 1..7.

**Structure « nouveaux éléments »** — c'est ce qui distingue ces DP :

```html
<!-- Question 1 -->
<p><em>Question :</em> …</p>

<!-- Questions 2 à 7 -->
<p><em>Nouvel élément :</em> [donnée clinique, imagerie, évolution…]</p>
<p><em>Question :</em> …</p>
```

Le cas doit **progresser** : examen → imagerie → geste → complication → suivi.

### Question et items (les deux formats)
`qcm_questions` : `format='qcm'`, `reponse_attendue=null` (la vérité est portée
par les items), `correction_generale` renseignée.
`qcm_items` : 5 items A–E, `is_correct`, `justification` sur chacun.
Entre 1 et 4 bonnes réponses, réparties.

### Titres de séries
Dérivés du **contenu réel** : les 5 énoncés pour un QCM, la vignette pour un DP.
3 à 8 mots.

⚠️ La plateforme classe les séries par expression régulière sur le libellé :
`/^dp\b/i`, `/^qroc/i`, `/entra[iî]nement/i`. Le mot **entraînement** dans un
titre reclasserait la série. En revanche « central », « centromédullaire » ou
« concentrique » sont **sans danger** : la regex vise le mot entier, pas la
sous-chaîne `entra`.

---

## 7. Flashcards

`flashcards(cours_id, recto, verso, order_index)`, 40 à 60 par chapitre.

Le verso s'affiche en grande police dans une carte à **hauteur fixe**
(`overflow-hidden`) : un verso trop long est **coupé à l'écran**.

- **90 à 110 caractères**, jamais plus
- **toujours** des retours à la ligne (`<br>` ou `<ul><li>`), 3 à 6 lignes courtes
- jamais un pavé ; recto court

---

## 8. Fiche de cours

```bash
node scripts/render-mg-fiche.mjs <coursId> <fichierHtml> "<nom du cours>"
```

Rend le PDF via Chrome local, l'upload dans le bucket `fiches`, met à jour la
ligne `fiches`. Exige `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`.

### Structure
4 à 7 parties, 2 à 5 sous-parties, synthèse et **fiche éclair** en fin.
Marqueurs `__LOGO__` et `__WATERMARK__` laissés tels quels : le script les
remplace par les data-URI.

### ⚠️ Le piège du `<thead>`
`thead { display: table-header-group }` fait **répéter l'en-tête en haut de
chaque page**. Donc : **une seule sous-partie par `<table class="fiche-table">`**,
avec son `ft-head-row` dans son propre `<thead>`. Mettre A, B et C dans la même
table fait apparaître « A. » au-dessus du contenu de B sur les pages suivantes.

### Bannière de partie
`ft-banner-row` dans le thead, **avec `partie-banner-title--repeat` sur les
tables de continuation**. Cette classe ne supprime que le *signet PDF*, pas la
bannière visible : sans elle, le titre de la grande partie disparaît des pages
de continuation.

### Images
Filtres : ≥ 200×200 px, ratio ≤ 5:1, **25 maximum par fiche**. Au-delà, trier par
utilité pédagogique — privilégier tableaux, algorithmes, classifications et
schémas explicatifs ; écarter les photos peropératoires redondantes.

Taille de rendu :

```
is_large = type ∈ (tableau, algorithme, imagerie, classification)
        OU description contenant (algorithme|tableau|classification|score|arbre|stratégie)
        OU (largeur ≥ 700 ET type ∉ (photo_clinique, schema))
```

- grande → `<figure class="ft-figure ft-figure--large">`, **après** le détail
- petite → `<figure class="ft-figure ft-figure--small">`, **avant** le détail

Images en **data-URI base64** : la fiche doit être autonome.

### Légendes
Reformulées en description médicale, **15 mots maximum**, jamais « Figure X ».

**Une légende source tronquée ne se publie pas.** La conversion en a détruit un
grand nombre (« Figure Abord tion », « Figure Muscles 3. ») : environ 430 sur
1 706. Règle : **moins de 25 caractères ⇒ traiter comme absente**. Sur une
légende partiellement tronquée, ne garder que la portion grammaticalement close.
Une image sans légende exploitable reste publiable si elle a une valeur
pédagogique propre — mais **sans légende inventée**.

---

## 9. Contrôles après chaque lot

À passer systématiquement, avant d'enchaîner :

```sql
select c.titre,
       count(distinct s.id) filter (where s.kind='qcm') as qcm,
       count(distinct s.id) filter (where s.kind='dp')  as dp,
       count(distinct q.id) as questions,
       count(i.id)          as items,
       (select count(*) from flashcards f where f.cours_id=c.id) as flash
from cours c
left join qcm_series s    on s.cours_id  = c.id
left join qcm_questions q on q.serie_id  = s.id
left join qcm_items i     on i.question_id = q.id
where c.matiere_id = 'col-<slug>'
group by c.id, c.titre, c.order_index
order by c.order_index;
```

Attendu par chapitre : **8 / 8 / 96 / 480 / 40-60**.

Contrôles d'intégrité :

```sql
-- doivent tous valoir 0
select
  (select count(*) from qcm_questions q join qcm_series s on s.id=q.serie_id
     join cours c on c.id=s.cours_id where c.matiere_id='col-<slug>'
     and (select count(*) from qcm_items i where i.question_id=q.id) <> 5)      as q_sans_5_items,
  (select count(*) from qcm_questions q join qcm_series s on s.id=q.serie_id
     join cours c on c.id=s.cours_id where c.matiere_id='col-<slug>'
     and not exists (select 1 from qcm_items i where i.question_id=q.id and i.is_correct)) as q_sans_bonne_reponse,
  (select count(*) from qcm_questions q join qcm_series s on s.id=q.serie_id
     join cours c on c.id=s.cours_id where c.matiere_id='col-<slug>'
     and s.kind='dp' and q.order_index between 2 and 7
     and q.enonce not ilike '%Nouvel élément%')                                 as dp_sans_nouvel_element,
  (select count(*) from qcm_series s join cours c on c.id=s.cours_id
     where c.matiere_id='col-<slug>' and s.kind='dp' and s.vignette is null)    as dp_sans_vignette,
  (select count(*) from qcm_series s join cours c on c.id=s.cours_id
     where c.matiere_id='col-<slug>' and s.label ~ '^(QCM|DP) [0-9]+$')         as labels_sans_titre;
```

⚠️ **Ne jamais vérifier les marqueurs avec `ilike '%__LOGO__%'`** : `_` est un
joker SQL, le motif matche `cover-logo` et produit un faux positif. Utiliser
`regexp_matches(content_html, '__LOGO__', 'g')`.

**Toujours vérifier en base, jamais sur la déclaration d'un agent.**

---

## 10. Facturation

Aucune action. `admin_facturation_lines()` balaie tous les collèges de la
faculté : un collège hors médecine générale et hors Découverte est facturé au
forfait dès que le contenu existe — 10 € la fiche, 5 € les QCM, 3 € les
flashcards, soit **18 € par item**.

---

## 11. Erreurs commises pendant cette production, à ne pas refaire

| Erreur | Conséquence | Prévention |
|---|---|---|
| Conclure « aucune fiche n'a d'image » depuis `scripts/mg-fiches-data/` | Dossier partiel : la base a 502/502 fiches illustrées | Interroger la **base**, pas un dossier local |
| `ilike '%__LOGO__%'` | `_` est un joker : faux positif sur `cover-logo` | `regexp_matches` |
| Détecteur de mots collés par motif `[a-z]{4,}(de|la|le)[a-z]{3,}` | Matche « grandement », « profondeur » : 133/133 faussement signalés | Détecter par **hapax du corpus**, pas par forme |
| Bannière de partie dans la seule première table | Le titre de partie disparaît des pages de continuation | `--repeat` sur les tables suivantes |
| Interdire la sous-chaîne `entra` dans les titres | « pivot central » rejeté à tort | La regex vise le mot entier |
| Renseigner `importance` | Arbitrage pédagogique qui n'appartient pas à la génération | Toujours 0 |
