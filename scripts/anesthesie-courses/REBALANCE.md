# Rééquilibrer les réponses justes d'un chapitre

Objectif : que chaque cours propose autant de QCM à 1, 2, 3, 4 et 5 réponses
justes, avec des lettres A–E également sollicitées et des séries dont on ne
peut pas deviner la cardinalité. Le contenu médical prime sur la statistique :
un chapitre équilibré mais faux est un échec.

## Point de départ

```bash
node scripts/brief-anesthesie-qcm-rebalance.mjs --chapter=NN
```

Écrit `.corpus-anesthesie-reanimation/brief-rebalance-chNN.json`. Pour chacune
des 96 questions, le brief donne :

| Champ | Sens |
| --- | --- |
| `baseline` | `local` = état actuel du module ; `restauré-distant` = la question avait été altérée, `propositions` contient sa version d'origine publiée |
| `propositions` | la base **saine** de départ, lettre par lettre |
| `profilActuel` / `profilCible` | lettres justes avant et après |
| `aReecrire` | les seules propositions dont la vérité doit changer |

Les questions dont `aReecrire` est vide et dont `baseline` vaut `local` ne
doivent pas être touchées.

## La règle qui compte

**Changer la vérité d'une proposition, c'est écrire une autre proposition.**
Ce n'est jamais retoucher celle qui existe.

Une proposition à faire passer de juste à fausse est *remplacée* par un énoncé
nouveau, sur le même thème clinique, plausible pour un étudiant et réellement
faux ; sa justification explique l'erreur. Le chemin inverse suit la même règle :
un énoncé nouveau, exact, ancré dans la source du chapitre.

Sont exclus, et l'audit les refuse :

- fusionner deux propositions dans un même item, notamment avec un `;` —
  c'est la faute qui a corrompu 1 226 questions en août 2026 ;
- nier une proposition vraie (« ne… pas », « aucun », « jamais ») pour la rendre
  fausse : le distracteur devient grammatical, pas médical ;
- reprendre une proposition voisine en la sur-qualifiant si la question compte
  déjà ce procédé ;
- laisser deux propositions d'une même question partager l'essentiel de leurs
  mots, ou de leurs justifications.

Un bon distracteur est une erreur que l'on rencontre : une indication élargie à
tort, un seuil déplacé, un mécanisme attribué au mauvais agent, une mesure
confondue avec une autre.

## Ce qui ne bouge pas

L'énoncé de la question, les blocs `src(...)`, l'ordre et les lettres des
propositions, le nombre de propositions (cinq). La `correction_generale` n'est
reprise que si le nouveau profil de réponses la rend inexacte.

## Vérifier

```bash
node scripts/produce-anesthesie-reanimation.mjs --chapter=NN --dry-run
node scripts/audit-anesthesie-qcm-balance.mjs NN
```

L'audit doit répondre `"passed": true`. Il contrôle les cardinalités, les
profils, les lettres, la diversité des séries, les propositions fusionnées, les
redondances internes, les négations artificielles et les justifications qui
contredisent la proposition qu'elles accompagnent.

Tant qu'il refuse, le chapitre n'est pas fini — et l'on corrige le contenu,
jamais le contrôle.

## Deux pièges rencontrés

**La table `QCM_BALANCE_OVERRIDES`.** Les chapitres 19 à 28 en portent une : gelée
en fin de module, appliquée juste avant la validation, elle remplace à
l'exécution `is_correct`, `enonce` et `justification`. Les littéraux du module,
eux, sont restés sains. Supprimer la table, sa fonction d'application et son
appel suffit donc à restaurer les questions d'origine — inutile de les recopier.

**L'énoncé qui répète sa vignette.** Le helper `qcm()` préfixe lui-même
`newInformation` à l'énoncé. Si le littéral la contient déjà, la phrase paraît
deux fois dans le paquet livré et l'audit la refuse. Remède :

```bash
node scripts/fix-anesthesie-stem-duplication.mjs --chapter=NN [--write]
```

Il ne touche à aucun contenu médical : le texte rendu est identique, la phrase
n'y figure simplement plus qu'une fois.

## Fichiers de travail

Plusieurs auteurs travaillent en parallèle sur des chapitres différents. Nomme
tout fichier temporaire avec son numéro de chapitre (`patch-ch07.json`, pas
`patch-a.json`) : un nom générique se fait écraser par la session voisine.
