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
| Flashcards | **100 à 200** | `flashcards` |
| Fiche de cours + fiche éclair | 1 PDF | `fiches` |

Pas de QROC. Sur 133 chapitres : ~12 800 questions, ~64 000 items, ~20 000 cartes.

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

### ⚠️ Deux règles d'exécution, apprises à la dure

**1. Chaque agent travaille dans SON sous-dossier.** Le scratchpad de session est
partagé entre agents parallèles : un fichier de travail au nom générique
(`stripped.html`, `tmp.html`) est écrasé par l'agent voisin, et toute mesure
prise dessus devient fausse sans le moindre signal d'erreur. Imposer un
sous-dossier par chapitre dans le brief.

**2. Écrire en base par petits lots, et sauvegarder sur disque avant tout
rendu.** Une coupure d'API (limite de session, réseau) tue l'agent sans préavis.
Ce qui est en base est acquis ; ce qui n'est qu'en mémoire est perdu.

**3. Une série s'insère en UNE SEULE requête atomique** — CTE chaînant
`insert série … returning` → `insert questions … returning` → `insert items`.

C'est la parade structurelle au seul incident de données de cette production :
une coupure entre l'insertion des questions et celle des items avait laissé une
série de 5 questions **sans aucun item**, donc en ligne et injouable pour les
élèves. Une consigne du type « insère les items dans la foulée » repose sur la
discipline de l'agent ; la requête atomique rend le cas impossible quel que soit
le moment de la coupure. Les trois agents de reprise l'ont adoptée d'eux-mêmes.

Contrôle de rattrapage à passer après toute coupure, au cas où : la requête du
§9 détecte les questions n'ayant pas exactement 5 items. Une série incomplète se
**supprime et se régénère**, elle ne se rafistole pas.

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

`flashcards(cours_id, recto, verso, order_index)`, **100 à 200 par chapitre**.

Le mot d'ordre est *exhaustif* : une carte par notion vérifiable de la source.
Un chapitre dense en porte 200, un chapitre mince 100 — c'est la matière qui
décide, pas un quota.

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

### ⚠️ Une fiche CONDENSE, elle ne transcrit pas

**7 à 40 pages, jamais au-delà.** C'est la norme maison, mesurée : sur les 500
fiches Major ECN en ligne, 458 (92 %) tiennent dans cette fourchette.

Repères chiffrés du corpus de référence, à viser :

| Mesure | Médiane | 9e décile | Maximum observé |
|---|---|---|---|
| Texte du corps (hors balises) | **23 000 car.** | 38 400 car. | 63 700 car. |
| Pages | 16 | — | 52 |
| Figures | 1 | 8 | 62 |

**La contrainte dure porte sur les PAGES, pas sur les caractères.** Le compte de
caractères sert à estimer la pagination *avant* le rendu — c'est un indicateur,
pas un critère de conformité.

Repère : **≈ 1 350 caractères par page**, mais le ratio dépend du nombre de
figures et varie de 1 220 à 1 570 (mesuré sur les fiches d'Orthopédie) :

| Figures | 15 | 13 | 12 | 8 | 5 |
|---|---|---|---|---|---|
| Car./page | 1 246 | 1 222 | 1 348 / 1 319 | 1 302 | **1 567** |

Une fiche pauvre en figures loge donc **jusqu'à 30 % de texte en plus** pour la
même pagination. Estimer avec le ratio correspondant au nombre de figures
retenues, viser **20 000 à 35 000 caractères**, et **trancher sur les pages
après rendu** : une fiche à 33 000 caractères et 21 pages est conforme ; une
fiche à 30 000 caractères et 45 pages ne l'est pas.

Plafond dur de sécurité : 50 000 caractères — au-delà, aucune configuration de
figures ne tient dans 40 pages.

> **Erreur commise, à ne pas refaire.** La version précédente de ce paragraphe
> disait « la longueur découle de la source, et d'elle seule ». Les quatre
> premières fiches ont donc été écrites à **80 000 caractères** pour des
> chapitres EMC de 95 000 : une réécriture du chapitre, pas une fiche. Résultat :
> 57 à 65 pages, au-dessus du maximum absolu du corpus existant. La densité de
> mise en page n'y était pour rien (1 410 car./page contre 1 329 en référence) —
> c'était bien un excès de matière.

### ⚠️ Le critère de sélection est le concours, pas la source

**Ces fiches servent à faire réussir les EVC.** La question à se poser devant
chaque paragraphe n'est donc pas « est-ce dans la source ? » mais **« est-ce
nécessaire pour réussir l'épreuve ? »**. L'exhaustivité n'est pas l'objectif —
la couverture de ce qui tombe l'est.

| À garder | À écarter |
|---|---|
| Définitions | Détail des temps opératoires |
| Indications, contre-indications | Nomenclature d'ancillaire |
| Classifications | Variantes techniques marginales |
| Valeurs seuils et chiffres-clés | Historique au-delà de ce qui éclaire la technique actuelle |
| Complications et leur prévention | Redites entre parties |
| Principes qui expliquent le geste | |
| Conduite à tenir | |

Ces sources sont des chapitres de **techniques chirurgicales** EMC : elles
consacrent l'essentiel de leur volume au compagnonnage opératoire, qui n'est pas
interrogé. C'est ce qui explique le rapport de 1 à 3 entre le chapitre et la
fiche attendue.

Second volet de la consigne : **« toutes les notions bien organisées
nécessaires à la réussite »**. Donc aucun trou sur une notion qui tombe, et une
organisation qui se révise. **Le plan de l'EMC n'a pas à être respecté** s'il
n'est pas l'ordre le plus utile à un candidat : regrouper, comparer en tableau,
remonter les indications avant la technique sont des choix légitimes.

Le travail attendu est donc un travail de **sélection et de condensation** :
fusionner les redites, préférer un tableau à trois paragraphes. Un chapitre
pauvre donne une fiche courte — mais aucun chapitre ne justifie de dépasser
40 pages.

Ce qui doit passer **intégralement** dans les flashcards (100 à 200 par
chapitre) et les séries n'a pas à figurer dans la fiche : les trois supports se
répartissent la matière, ils ne la répètent pas.

Corollaire : **zéro contenu hors programme**. Pas de rappel général, pas de mise
en contexte ajoutée de mémoire, pas de complément « utile ». Ce qui n'est pas
dans l'input n'entre pas dans la fiche.

### ⚠️ Une cellule de détail est une LISTE À PUCES, jamais un paragraphe

C'est le défaut le plus visible qu'ait produit cette chaîne. Mesuré :

| | Fiches Major ECN exemplaires | Les 8 premières fiches d'Orthopédie |
|---|---|---|
| `<li>` par fiche | **270** | 37 |
| Listes imbriquées | **72** | 6 |
| Marqueurs `fmark` | 39 (sélectifs) | 0 |

À pagination et volume de texte identiques (18-22 pages, ~30 000 caractères),
les fiches de référence découpent en **sept fois plus de puces**. Un pavé de
prose dans une cellule est illisible et ne se révise pas.

**Le balisage de référence, à reproduire tel quel :**

```html
<tr>
  <td class="ft-concept">Réponse ventriculaire</td>
  <td class="ft-detail content"><ul>
    <li>Sous la dépendance du <strong>nœud atrioventriculaire (AV)</strong></li>
    <li>Capacité de filtration variable selon :<ul>
      <li>État du système nerveux autonome</li>
      <li>Imprégnation en médicaments bradycardisants</li>
    </ul></li>
  </ul></td>
</tr>
```

Règles qui en découlent :

- **`<td class="ft-detail content">`** — la classe `content` est obligatoire,
  c'est elle qui porte les règles de puces. Sans elle, rien ne s'applique.
- **Aucun `<p>` dans une cellule de détail.** Une idée = un `<li>`.
- **Une puce tient en une à deux lignes.** Si elle en fait quatre, elle contient
  plusieurs idées : la scinder, ou l'éclater en sous-liste.
- **Sous-listes par `<ul>` imbriqué dans le `<li>` parent** : la charte rend le
  niveau 1 en **disque plein** et les niveaux 2+ en **cercle creux indenté**
  (`.content ul { list-style-type: disc }`, `.content ul ul { circle }`). C'est
  le rendu attendu ; ne le simule jamais avec des caractères tapés.
- **`<strong>` sur les mots-clés et les valeurs chiffrées**, pas sur des phrases
  entières.

**Marqueurs `fmark` — sémantiques et sélectifs.** `<span class="fmark m-ecn">★</span>`
(ocre, tombe à l'examen), `m-yield` (bleu nuit, haut rendement), `m-trap`
(bordeaux, piège). Ils se placent **après** le libellé du concept, sur une
minorité de lignes.

> **Erreur commise, à ne pas refaire.** Les 8 premières fiches préfixaient
> **chaque** concept d'un `◆` tapé en dur, sans classe. Un marqueur présent
> partout n'informe plus ; et écrit en littéral, il perd la couleur qui porte
> son sens.

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
Filtres : ≥ 200×200 px, ratio ≤ 5:1. **8 à 20 par fiche**, pas de plancher
au-delà de 8. Trier par utilité pédagogique — privilégier tableaux, algorithmes,
classifications et schémas explicatifs ; écarter les photos peropératoires
redondantes, et **toute figure dont le texte d'accompagnement a disparu à la
condensation**.

Repère du corpus de référence : médiane **1** figure par fiche, 9e décile **8**.
Ces chapitres de techniques chirurgicales justifient nettement plus, mais 25 est
un chiffre de transcription, pas de synthèse.

> **Erreur commise, à ne pas refaire.** Un plancher à 12 avait été imposé aux
> agents de condensation : trois sur quatre s'y sont arrêtés exactement, en
> déclarant ne plus pouvoir descendre sans entamer du contenu interrogeable.
> C'était donc le plancher qui décidait du tri, et non l'utilité pédagogique.
> Un plancher doit rester assez bas pour ne jamais être la contrainte active.

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

À passer systématiquement, avant d'enchaîner.

**Contrôle de longueur des fiches** — celui qui manquait, et sans lequel les
quatre premières fiches sont parties à 65 pages :

```sql
select c.titre, f.pages,
       length(regexp_replace(f.content_html,'<[^>]+>',' ','g')) as texte,
       round(length(regexp_replace(f.content_html,'<[^>]+>',' ','g'))::numeric
             / nullif(f.pages,0)) as car_par_page
from cours c join fiches f on f.cours_id = c.id
where c.matiere_id = 'col-orthopedie'
order by f.pages desc;
```

`pages` doit être **entre 7 et 40**, `texte` sous **50 000**. Une fiche hors
fourchette se refait — elle ne se republie pas telle quelle.

Puis les contrôles de contenu :

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

## 9 bis. Chapitre trop pauvre pour 8 QCM + 8 DP (consigne du commanditaire, 2026-08-04)

Certains chapitres du fonds sont trop minces (ex. `bilan-articulaire-main`,
8,9 k car — un cours d'ergothérapie de goniométrie) pour produire honnêtement
**8 séries QCM ET 8 séries DP** sans inventer. Le quota n'est jamais un motif de
remplissage : **on ne bourre pas, on n'hallucine pas**. Règle arbitrée :

- **QCM** : deux leviers, au choix ou combinés —
  1. **Aller dans le détail** : un chapitre mince mais précis (valeurs normales,
     repères chiffrés, technique de mesure) permet des QCM pointus ; on descend
     d'un cran dans la finesse plutôt que de rester en surface.
  2. **Réduire le nombre de séries** : si même en détaillant la matière ne suffit
     pas, produire **moins de 8 séries QCM** (ce que la source soutient
     réellement) plutôt que des questions creuses.

- **DP** : un DP exige un cas clinique qui progresse — souvent impossible à bâtir
  sur un chapitre purement technique/métrologique. Solution : **construire les DP
  autour de chapitres voisins plus importants**, en y **intégrant certaines
  notions du chapitre pauvre**. Le DP « appartient » alors au chapitre riche (cas
  clinique réaliste) et fait apparaître, comme éléments testés, les notions du
  chapitre mince. Rien n'est inventé : les autres chapitres sont aussi sourcés.

**Traçabilité** : quand un chapitre reçoit moins de 8/8, le noter (worklist ou
compte rendu) avec la raison, pour ne pas le relire comme « incomplet par
accident ». Insertion : `_ins-chapter.mjs … --thin` autorise < 8 séries tout en
gardant les contrôles de structure (5 items/Q, vignette DP, « Nouvel élément »,
100-200 flashcards).

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
| Écrire « la longueur de la fiche découle de la source, et d'elle seule » | Les 4 premières fiches à 80-94 k caractères, soit 57 à 65 pages, pour des chapitres de 95 k : des copies remises en page | Fourchette **7-40 pages**, texte **< 50 000 car.**, contrôle SQL avant publication (§8, §9) |
| Soupçonner la charte (`thead` répété, grandes figures) devant des fiches trop longues | Temps perdu à optimiser des sauts de page ; un agent a scindé 18 lignes pour rien | **Mesurer d'abord** : `car./page` était à 1 410 contre 1 329 en référence — la mise en page était bonne, c'était un excès de matière |
| Nom de fichier de travail générique dans le scratchpad partagé | `stripped.html` écrasé deux fois par des agents voisins ; mesures faussées sans erreur visible | Un **sous-dossier par chapitre**, imposé dans le brief |
| Repérer les chapitres déjà traités par mot-clé (`slug.includes('scoliose')`) | Confond « Traitement **chirurgical** des scolioses » et « Traitement **orthopédique** des scolioses » : un chapitre saute | Liste figée dans `.corpus-orthopedie/worklist.json`, appariement par slug **exact** |
| Bannière de partie dans la seule première table | Le titre de partie disparaît des pages de continuation | `--repeat` sur les tables suivantes |
| Interdire la sous-chaîne `entra` dans les titres | « pivot central » rejeté à tort | La regex vise le mot entier |
| Renseigner `importance` | Arbitrage pédagogique qui n'appartient pas à la génération | Toujours 0 |
| Transformer une phrase contenant « : » en puce N+2 | Hiérarchie artificielle, illisible et non éditoriale | Une sous-liste n'existe que si le modèle source déclare explicitement une relation parent-enfant |
| Fabriquer des concepts « Repère 1 », un plan générique ou un sous-titre « Synthèse issue de… » | Fiche structurellement valide mais pédagogiquement vide | Titres, parties et concepts médicaux nommés ; bannir ces gabarits au validateur |
| Positionner le logo indépendamment du gabarit de couverture ou faire flotter une image sous les puces | Logo rogné / titre cassé, puis grands vides dans les cellules | Appliquer la règle de couverture centralisée : logo en position absolue dans la zone imprimable, en haut à droite ; réserver une colonne de titre à gauche. Dans une cellule, une petite image peut accompagner le texte ; tout schéma annoté ou grand visuel est placé sous le texte, pleine largeur |
| Rendre ou publier le squelette HTML contenant encore `__IMGFILE:…__` | Images vides dans le PDF et dans l’éditeur | Toujours exécuter `_fiche-build.mjs`, auditer le HTML autoportant puis publier ce même HTML avec ses data-URI |
| Retoucher un paquet généré mécaniquement sans remplacer ses séries, items et cartes | Des gabarits ou répétitions survivent en base malgré une fiche corrigée | Sauvegarder, supprimer transactionnellement le paquet complet puis republier un lot neuf et sourcé ; audit final par signatures des anciens gabarits |
| Transformer automatiquement une flashcard en énoncé de QCM et ses autres versos en distracteurs | Questions hors-sujet, réponses répétitives et justifications interchangeables | Les cartes et les évaluations sont deux productions distinctes : chaque QCM est rédigé par sous-thème avec cinq propositions médicalement cohérentes et une justification propre à chaque proposition ; tout helper qui effectue cette conversion est interdit |
| Utiliser un exemple illustratif comme carte ou question | Apprentissage de détails non transférables | Les exemples restent dans la fiche ; QCM, DP et cartes testent le principe transférable uniquement |
| Appeler « DP » une succession de QCM techniques sans patient ni suivi | Pas de raisonnement clinique progressif | Vignette : patient, motif, données initiales, décision, geste et point de suivi ; les questions 2–7 apportent chacune un nouvel élément clinique ou de suivi |
| Évaluer une couverture depuis un screenshot limité au viewport imprimable | Faux logo « rogné » et corrections CSS contradictoires | Les aperçus QA capturent désormais la feuille A4 complète ; valider la position logo/titre sur cet aperçu avant chaque publication |
| Déduire un cours depuis un numéro de script ou `cours.order_index` | Les numéros historiques de base ne correspondent pas à l’ordre de `worklist.json` ; un contenu peut être publié sur le mauvais cours | Toute tâche porte le triplet explicite `slug` + `coursId` + titre de la worklist ; vérifier ce triplet avant snapshot et juste avant publication ; bannir les générateurs `produce-orthopedie-NNN` comme sélecteurs de cible |
| Écrire un rapport d’audit sur `worklist.json` | La file des sources et identifiants est perdue, puis les agents ciblent des cours erronés | `worklist.json` est protégé dans l’auditeur ; tous les rapports vont dans `audit-production-*.json` et une copie de secours est conservée |
| Auditer des énoncés HTML sans retirer les balises | Un DP valide commençant par `<p><em>Nouvel élément</em>` est faussement rejeté | Toujours convertir le HTML en texte avant les tests de début d’énoncé, de patient et de suivi ; conserver un test automatisé de cette forme éditable |
| Corriger seulement une vignette DP sans refaire passer la banque par le validateur | Des cartes sur un exemple ou un ancien gabarit peuvent survivre | Toute republication, même limitée aux DP, repasse le validateur intégral : 100–200 rectos spécifiques, aucun « exemple » testable, QCM et DP distincts des cartes |
| Exiger une liste dans une cellule qui contient uniquement un tableau comparatif éditable | Faux positif `listless-detail` sur une synthèse utile et déjà structurée | Une cellule est conforme si elle contient une liste pédagogique, une figure autonome, ou un tableau comparatif éditable ; une phrase narrative seule reste bloquante |
| Afficher une étoile « tombé aux EVC/annales » sans annale fournie et traçable | Fausse autorité, information non sourcée | Les fiches Orthopédie n'affichent aucune étoile ni mention d'annale/EVC, sauf source explicitement fournie, référencée et validée |
| Considérer un `<img>` ou une data-URI comme valide sans vérifier son décodage dans Chromium | Légende visible au-dessus d'un cadre blanc ou d'une image cassée | Auditer `naturalWidth`/`naturalHeight` de chaque figure, rendre le PDF et inspecter les pages concernées ; sinon supprimer la figure et tracer l'exception source |
| Laisser « QCM — Série », « sous-thème », « Question : » ou « Nouvel élément : » dans un énoncé | Formulation artificielle qui montre la mécanique de production | Les QCM sont des questions directes ; les DP progressent par les données cliniques rédigées naturellement, sans étiquette de série, de cours, de question ni de nouvel élément |
| Propager des séquences mojibake (`Ã©`, `â€™`…) d'un script ou d'un export | Accents français dégradés et lecture difficile | Lire/écrire systématiquement en UTF-8, contrôler les chaînes publiées avec le détecteur mojibake et corriger depuis `extract.json`, jamais par translittération approximative |
| Aplatir toutes les puces ou créer une sous-liste après chaque deux-points | Fiche soit plate, soit artificiellement indentée | Ajouter une liste N+2 uniquement lorsqu'une relation parent-enfant est explicitement portée par la source ; auditer les listes imbriquées au rendu |
