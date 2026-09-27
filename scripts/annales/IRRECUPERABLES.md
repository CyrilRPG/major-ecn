# Annales — questions dont les données manquent dans toutes les sources

Audit du 27/09/2026 (toutes les annales confrontées aux sujets officiels et aux
corrigés, `tmp/audit-dp-rev/journal-<collège>.md`) : ces questions demandent un
document ou des résultats qu'AUCUNE source de `Annales/` ne contient (pas de
sujet officiel pour la session, le corrigé ne donne que la réponse).

Le 28/09/2026, à la demande de Cyril (« si pour des annales il manque du contenu
même dans le dossier "contenus" fais la liste et dépublie les »), le dossier
`contenus/` a été fouillé à son tour. Rien n'y a été trouvé : les séries
concernées sont **dépubliées** (`allowed_offers = []`), séries entières, sans
rien supprimer (questions, tentatives et historique des élèves conservés).

## Restituées depuis contenus/

Aucune. Aucune donnée ni aucun document manquant n'existe dans `contenus/`.

Ce qui a été fouillé (index texte et recherches : `tmp/audit-dp-rev/contenus/`,
`extraire_texte.py`, `cherche.py`, `multi.py`, `requetes1.tsv`, `requetes2.tsv`) :

- les 1 497 PDF, DOCX et PPTX de `contenus/`, récursivement (texte PDF par
  pymupdf, DOCX/PPTX par le XML du zip) ; le sous-dossier `contenus/Annales/`
  est **vide** ; aucun document ne cite une session EVC (« EVC 2018 », « EVCP
  2021 »…) ni un sujet officiel ;
- ce que contient réellement `contenus/` : cours et fiches (Orthopédie EMC,
  anesthésie-réanimation, ORL, urologie, médecine interne, fiches pneumo,
  fiches radiologie), plateforme Gériatrie, séances PAE 2026 MG (Gériatrie,
  Psychiatrie, Endocrinologie), Parcours Major, banques de questions « EVC
  2025/2026 » et entraînements MG (pneumologie, hématologie, endocrinologie),
  Major odonto ;
- recherches par thème de chaque cas et par valeurs des corrigés (LCR à cocci
  Gram positif, gazométries, SCA ST+ inférieur/fibrinolyse SMUR, GEU rompue
  et espace de Morison, occlusion fébrile sous apixaban en EHPAD, asthme aigu
  grave fébrile régulé, schizophrénie résistante sous clozapine, mélancolie
  délirante et électroconvulsivothérapie, citalopram/irbésartan/SIADH,
  anémie microcytaire et cancer colorectal, tramadol/fluoxétine, CHA₂DS₂-VASc
  et Claeys-Leonetti, Amlor/Lasilix/Zolpidem/Rispéridone/Xanax, sulfamide et
  corps de Lewy, interdose de morphine à 200 mg/j, tronc basilaire et gaz du
  sang pH 7,34, STOP-BANG/Mallampati et carte de contrôle ultime, canal
  lombaire étroit, embolie pulmonaire du coureur de 42 ans au retour de TGV,
  TEP-scanner SUV 4, femme de ménage de 36 ans en asthme aigu grave, Louise
  drépanocytaire SS) : les seuls cas voisins (séances PAE Gériatrie et
  Psychiatrie, entraînements pneumologie « kt major ecn ») sont d'autres cas
  cliniques, jamais ceux des annales ;
- sans texte exploitable : scans d'Odontologie pédiatrique, PDF de Chirurgie
  orale / Dentisterie / Prothèse (odontologie), DOCX d'images de
  `fiches_radiologie/images` (iconographie de cours de radiologie) et
  `annalesmajodonto` (concours d'odontologie) — hors sujet ; une image de cours
  ne peut pas tenir lieu du document d'une épreuve ;
- non exploités : les enregistrements vidéo (`.mp4`) des séances PAE 2026.

## Dépubliées le 28/09/2026

Plan appliqué : `scripts/annales/reprises/2026-09-28-contenus.json`
(`finaliser.mjs --apply` puis `--verify` ; sauvegarde des lignes dans
`tmp/annales-finalisation/backups/`). Dans les fichiers de données, chaque
série porte `"publication": "retiree"` : `publier.mjs` ne la republie pas.

Sources cherchées pour toutes : sujets officiels et corrigés de `Annales/`
(audit du 27/09, journaux par collège), puis `contenus/` (ci-dessus).
◆ : question que la garde `src/lib/qcm/donnees-manquantes.ts` sait détecter.

| Série | id | Ce qui manque |
|---|---|---|
| Médecine d’urgence 2018 EVCF | `e9e0034d-7bdd-49cd-97e6-d7f033e526ba` | Q5 ◆ : valeurs du LCR |
| Médecine d’urgence 2020 EVCF | `8e51f6be-e80c-48ed-be32-c9fbe1472b8c` | Q6 ◆ : valeurs de la gazométrie |
| Médecine d’urgence 2020 EVCP Sujet 1 | `da9a5181-55ba-4b90-8c57-eab227ab9d3c` | Q4 ◆ (Q5 en dépend) : tracé ECG |
| Médecine d’urgence 2020 EVCP Sujet 2 | `a4346952-0ad8-4d78-8237-0ce1ac00792d` | Q3, Q6 ◆ : résultats (biologie, β-hCG), image d’échographie |
| Médecine d’urgence 2021 EVCF | `fba102bf-0b13-4fed-9b41-44376993822b` | Q12 ◆ : tracé ECG |
| Médecine d’urgence 2021 EVCP Sujet 1 | `71cd312f-cd01-44ef-a265-c2171df84c71` | Q1 : observation (constantes, examen) |
| Médecine d’urgence 2021 EVCP Sujet 2 | `d27305ca-118a-43b9-8163-68ccb27b104b` | Q3, Q5 ◆ : constantes à l’arrivée, gaz du sang |
| Psychiatrie 2009 EVCP | `64f60e69-4dd1-4807-9799-2ec26828989b` | cas entier : observation clinique (« Analysez ce tableau clinique ») |
| Psychiatrie 2014 EVCP | `ecbd9793-049a-4cca-ab24-5a7f609d2328` | cas entier : observation clinique |
| Médecine générale 2014 EVCP | `04f7f004-0ba9-4e7c-9ca3-f82dea1cb909` | Q28 : posologie d’interdose proposée par le sujet |
| Gériatrie 2018 EVCF Sujet 1 | `80e91e13-5e36-4fc1-a888-4b1bc660a3e2` | Q1 à Q8 : vignette, ionogramme, traitement, évolution |
| Gériatrie 2018 EVCF Sujet 2 | `c53ba00e-4121-476d-9c02-79971633689e` | Q1 ◆, Q2, Q4 à Q6 : vignette, hémogramme |
| Gériatrie 2018 EVCF Sujet 3 | `3830de35-4f7f-42a2-b23e-4141e93114c1` | Q1 à Q3, Q5 : vignette, traitement |
| Gériatrie 2018 EVCF Sujet 4 | `a445e3cc-97a5-449d-bbc3-8c6f9764c8c9` | Q2, Q3 : âge, sexe, antécédents (CHA₂DS₂-VASc) |
| Gériatrie 2020 EVCP Sujet 1 | `10581313-53e4-41ac-a841-fac4aa6ee568` | Q1, Q2 : signes cliniques, biologie |
| Gériatrie 2021 EVCP | `32c4b29b-8f7a-4cd9-9cc2-de969cc27758` | Q5, Q11 ◆, Q9, Q10, Q12 : imagerie cérébrale, ECG, évolution |
| Anesthésie-Réanimation 2024 EVCP Cas clinique 1 | `d076114a-5b38-44de-ba95-b16e10b5f5d7` | Q3, Q7 : examen neurologique, hémocultures et cathéter |
| Anesthésie-Réanimation 2025 EVCP Dossier 1 | `d3e65958-b486-475a-ab08-aea589059fb0` | Q8 : photographie de la carte de contrôle ultime de l’épreuve (l’image rattachée contredit la réponse attendue) |
| Orthopédie 2023 EVCP Dossier canal lombaire étroit | `5f2204c9-e02b-40f3-bf30-dbdd2add3f5b` | Q2 ◆, Q3 ◆ : radiographie, IRM |
| Pneumologie 2023 EVCP Dossier 2 | `7d47b72d-f961-4e18-bc5b-39a940addf4a` | Q2 ◆ : bilan biologique « ci-joint », angioscanner |
| Pneumologie 2023 EVCF | `12eb683b-0a3a-4779-b137-eeb524f3b704` | Q6 : image du scanner |

Hors annales, mêmes causes, dépubliées par
`tmp/audit-dp-rev/depublication/depublier-hors-annales.mjs` (ancienne ligne
sauvegardée dans `tmp/audit-dp-rev/depublication/<id>.avant.json`) :

| Série | id | Ce qui manque | Ancienne valeur |
|---|---|---|---|
| Séance du professeur - Pneumologie · Asthme - Cas clinique Mme 36 ans | `98df267b-1f17-4fb5-b431-7c8a1f55e5a6` | Q2 ◆ : radiographie de thorax (absente des supports de séance, des buckets et de `contenus/`) | `null` |

REVISION GENERALE (Tour général de révision, 354 questions,
`c1561897-4a2e-42c7-905d-efc1679302c4`) : dépubliée puis **remise en ligne le
28/09/2026** (`["intensif","approfondi"]`) — la dépublication ne visait que les
annales, et une seule question manque de son document (« La radiographie
thoracique est la suivante », syndrome thoracique aigu de Louise). La garde
écarte la série des sessions de révision tant que la radiographie manque.

## Republier quand le document sera retrouvé

1. Se procurer le sujet officiel de la session (CNG) ou le document manquant.
2. Restituer selon `tmp/audit-dp-rev/CONSIGNE-ANNALES.md` : données texte
   recopiées mot pour mot dans l’énoncé ou la vignette (fichier de données +
   plan `scripts/annales/reprises/<date>-<collège>.json`, `finaliser.mjs`
   simulation → `--apply` → `--verify`) ; images rattachées dans le fichier de
   données puis `sync-images.mjs --data …` → `--ecrire`. Jamais
   `publier.mjs --force` (il efface les tentatives des élèves).
3. Retirer `"publication": "retiree"` de la série dans son fichier de données.
4. Remettre la série en ligne par un plan `finaliser.mjs` : opération
   `update qcm_series.allowed_offers`, `before: []`, `after: null` (pour les deux
   séries hors annales : la valeur d’origine, `null` pour la séance Asthme,
   `["intensif","approfondi"]` pour REVISION GENERALE).
5. Contrôler : `npx tsx scripts/audit-dossiers-incomplets.mts --visibles`
   (aucune ligne) et `cd scripts/annales && node verifier-editorial.mjs`.
