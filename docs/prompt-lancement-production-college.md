# Prompt de lancement — production d'un collège

À coller tel quel dans une session neuve pour lancer ou **reprendre** la
production. Il est conçu pour qu'une session qui ne sait rien du passé se
réoriente seule, en mesurant l'état réel plutôt qu'en croyant un compte rendu.

Adapter uniquement le bloc **REPÈRES** si le collège change.

---

```
Tu reprends la production d'un collège pour Major ECN. Tout le mode opératoire
est déjà écrit et éprouvé : ta première tâche est de le lire, pas de le
réinventer.

## REPÈRES

- Mode opératoire (À LIRE EN ENTIER AVANT TOUTE ACTION) :
  `C:\Users\Admin\Desktop\Major-ecn-projects\major-ecn\docs\production-college-orthopedie.md`
- Projet Supabase : `mrrgfnirpwsknuyiwcqy` (production, MCP `execute_sql`)
- Collège : `matiere_id = 'col-orthopedie'`
- Corpus extrait : `C:\Users\Admin\Desktop\Major-ecn-projects\.corpus-orthopedie\`
  (un dossier par chapitre, contenant `extract.json` et `img/`)
- Liste de production figée : `.corpus-orthopedie\worklist.json`
  — 133 chapitres, triés, avec `slug`, `titre`, `caracteres`, `images`,
  `imagesLegendees` et le `coursId` une fois l'item créé.
  **C'est la seule source de vérité pour savoir ce qui reste.** Ne repère jamais
  un chapitre déjà traité par mot-clé : « Traitement chirurgical des scolioses »
  et « Traitement orthopédique des scolioses » sont deux chapitres distincts.
- Rendu des fiches : `major-ecn\scripts\render-mg-fiche.mjs`
  (exige `SUPABASE_SERVICE_ROLE_KEY` dans `major-ecn\.env.local`)

## PREMIÈRE ACTION, OBLIGATOIRE

1. Lis le mode opératoire en entier.
2. **Mesure l'état réel en base**, ne te fie à aucun compte rendu :

```sql
select c.order_index as n, c.titre, c.importance,
  count(distinct s.id) filter (where s.label like 'QCM%') as qcm,
  count(distinct s.id) filter (where s.label like 'DP %')  as dp,
  count(distinct q.id) as questions,
  (select count(*) from qcm_items i
     join qcm_questions q2 on q2.id = i.question_id
     join qcm_series s2 on s2.id = q2.serie_id
     where s2.cours_id = c.id) as items,
  (select count(*) from flashcards f where f.cours_id = c.id) as flash,
  fi.pages,
  length(regexp_replace(regexp_replace(fi.content_html,'src="data:[^"]*"',' ','g'),
                        '<[^>]+>',' ','g')) as texte_fiche
from cours c
left join qcm_series s on s.cours_id = c.id
left join qcm_questions q on q.serie_id = s.id
left join fiches fi on fi.cours_id = c.id
where c.matiere_id = 'col-orthopedie'
group by c.id, c.titre, c.order_index, c.importance, fi.pages, fi.content_html
order by c.order_index;
```

3. Cherche les dégâts d'une éventuelle coupure : toute question n'ayant pas
   exactement 5 items appartient à une série **injouable en ligne**. Elle se
   supprime et se régénère, elle ne se rafistole pas.

```sql
select s.label, q.id, count(i.id) as items
from cours c
join qcm_series s on s.cours_id = c.id
join qcm_questions q on q.serie_id = s.id
left join qcm_items i on i.question_id = q.id
where c.matiere_id = 'col-orthopedie'
group by s.label, q.id having count(i.id) <> 5;
```

## CE QUE TU PRODUIS, PAR CHAPITRE

1. **8 séries QCM** — `label` = `QCM — Série N · <Titre>`, 5 questions chacune
2. **8 séries DP** — `label` = `DP N · <Titre>`, vignette clinique HTML,
   **7 questions**, structure « Nouvel élément » (§6 du mode opératoire)
3. **100 à 200 flashcards** — verso 90 à 110 caractères, **toujours** des retours
   à la ligne, sinon le verso est coupé à l'écran
4. **1 fiche de cours** — 7 à 40 pages, avec synthèse et fiche éclair

Formats exacts au §6, flashcards au §7, fiche au §8. N'improvise aucun format.

## RÈGLES NON NÉGOCIABLES

- **Le but est de faire réussir le concours des EVC, pas d'être exhaustif.**
  Le critère de tri est « est-ce nécessaire pour réussir l'épreuve ? », jamais
  « est-ce dans la source ? ». Ces chapitres EMC sont des textes de technique
  chirurgicale : l'essentiel de leur volume est du compagnonnage opératoire, qui
  n'est pas interrogé. Détail au §8.
- **Fiches : 7 à 40 pages, texte du corps sous 50 000 caractères.** Norme mesurée
  sur les 500 fiches en ligne (médiane 16 pages, 23 000 caractères). La
  pagination se déduit du texte à ≈ 1 350 car./page : compte-le avant de rendre.
  Une fiche hors fourchette se refait, elle ne se publie pas.
- **N'invente rien.** Des médecins réviseront dessus. Aucune valeur chiffrée de
  mémoire. Si la source ne le dit pas, la question ne porte pas dessus.
- **Ignore tout bloc portant un champ `quarantaine`** dans `extract.json` : la
  conversion à deux colonnes y a détruit des données. Ne reconstitue jamais un
  arbre décisionnel dégradé — n'en garde que les branches confirmées par le texte
  courant.
- **Légendes d'images** : uniquement si la source en porte une. Moins de
  25 caractères ⇒ traitée comme absente. Jamais de légende inventée.
- **`cours.importance` reste à 0.** Ce n'est pas à toi de décider du nombre
  d'étoiles d'un item.
- **Aucun libellé ne contient le mot « entraînement »** : la plateforme
  reclasserait la série. « central » ou « concentrique » sont sans danger.
- SQL : **dollar-quoting `$c$…$c$` obligatoire**, les apostrophes françaises sont
  partout.

## MÉTHODE DE TRAVAIL

- **Lots de 4 chapitres**, 4 sous-agents `general-purpose` en parallèle maximum —
  au-delà les écritures concurrentes saturent le MCP.
- Un agent = un chapitre. Chaque agent travaille dans **son propre sous-dossier**
  du scratchpad : il est partagé, un nom de fichier générique y est écrasé par le
  voisin sans le moindre signal d'erreur.
- **Une série s'insère en UNE SEULE requête atomique** (CTE chaînant
  série → questions → items). Une coupure entre deux insertions a déjà produit
  une série en ligne sans aucune réponse.
- **Sauvegarde sur disque avant tout rendu de fiche.** Une limite d'API tue
  l'agent sans préavis ; ce qui n'est qu'en mémoire est perdu.
- Après chaque lot, **contrôles du §9 passés toi-même en SQL**. Ne rapporte
  jamais un chiffre venant d'un compte rendu d'agent : vérifie-le en base.
- Enchaîne les lots **sans demander d'autorisation** : la consigne permanente du
  commanditaire est de produire tout le collège avec sauvegarde après chaque lot.

## RÉFLEXE À AVOIR

Sur ce projet, **avant de conclure à un défaut, compare au corpus existant**.
Trois soupçons successifs — la charte trop gourmande en pages, les images mal
gérées, les QCM trop faciles — ont tous été invalidés par une simple requête de
comparaison aux 500 fiches et 28 000 questions déjà en ligne. Le seul défaut réel
(des fiches 3 fois trop longues) n'a été trouvé que par cette mesure.

Rends compte en chiffres relevés en base, et signale ce que tu n'as pas pu faire
plutôt que de le combler.
```
