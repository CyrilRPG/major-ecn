# Modules éditoriaux Anesthésie-Réanimation

Chaque chapitre possède un module `chapter-NN.mjs` rédigé et relu séparément.
Le générateur de collège ne contient plus aucun repli automatique : un module
absent ou incomplet bloque la production.

## Interface

```js
export function buildChapterNN(extract) {
  return { fiche, flashcards, series };
}
```

- `fiche` suit le modèle `major-ecn-fiche` compilé par
  `scripts/lib/orthopedie-fiche.mjs` ;
- `flashcards` contient 100 à 200 cartes ;
- `series` contient exactement 8 QCM, 8 DP QCM, 8 QROC et 8 DP QROC ;
- chaque contenu médical porte un tableau `sourceBlocks` composé uniquement
  d'identifiants réellement présents dans `extract.json`.

## Règles éditoriales

- Réécrire et hiérarchiser la source : ne jamais concaténer ses paragraphes.
- Une puce N+2 n'est créée que si elle précise, illustre, limite ou met en
  œuvre la puce N+1 qui la précède. Les lignes N+1 simples restent majoritaires.
- Une image contenant du texte occupe une ligne pleine largeur après
  l'explication correspondante. Les numéros de tableau/figure du DOCX ne sont
  pas repris dans la fiche.
- Les QCM ont cinq propositions plausibles et cinq justifications spécifiques.
  Les distracteurs sont rédigés médicalement, jamais obtenus par simple
  négation ou multiplication d'un chiffre.
- Chaque cours répartit ses 96 QCM de façon quasi uniforme entre une, deux,
  trois, quatre et cinq réponses exactes (19 ou 20 questions par cardinalité).
  Les combinaisons de lettres A–E sont également équilibrées : aucune position
  ne doit constituer un indice sur la correction. Dans chaque série, au moins
  trois cardinalités différentes sont présentes, aucune ne revient plus de
  trois fois et deux séries de même longueur ne reproduisent pas la même suite.
- Chaque proposition, justification et correction générale est propre à sa
  question : aucun recyclage textuel n'est admis dans un même cours.
- Les QROC sont des questions courtes et objectivables, pas des phrases à trous.
- Les DP partent d'un patient concret. Les questions 2 à 7 contiennent une
  `newInformation` naturelle, également présente dans l'énoncé, et font évoluer
  le raisonnement sans annoncer une « étape » ou un « nouvel élément ».
- Les flashcards ont un recto interrogatif direct et un verso de 150 caractères
  visibles au maximum. Elles sont rédigées indépendamment des banques.
- Le texte destiné à l'étudiant énonce directement les faits : les références
  éditoriales telles que « le corpus », « la source indique » ou « le chapitre
  décrit » sont interdites.

## Contrôles

```powershell
node scripts/plan-anesthesie-qcm-balance.mjs --chapter=NN
node scripts/produce-anesthesie-reanimation.mjs --chapter=NN --dry-run
node scripts/audit-anesthesie-qcm-balance.mjs NN
node scripts/render-anesthesie-fiche.mjs .corpus-anesthesie-reanimation/<slug>
node scripts/audit-anesthesie-editorial-quality.mjs
```

Le planificateur est strictement en lecture seule : il attribue des profils
équilibrés et indique les changements à rédiger, sans fabriquer ni modifier
aucun fait médical.

Un chapitre qui ne passe pas les validateurs ou le contrôle visuel complet de
son PDF reste exclu de la publication.
