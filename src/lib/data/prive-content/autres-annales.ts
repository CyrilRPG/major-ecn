import type { PriveCourseContent } from '../prive-courses';

// « Autres annales » UE5 — matières hors physiologie/sémiologie/andrologie
// (histologie, anatomie, pharmacologie, médecine nucléaire). Schémas intégrés en <img>.

const content: PriveCourseContent = {
  "fiche": {
    "parties": [
      {
        "numero": "I",
        "titre": "Autres annales — matières hors physiologie / sémiologie",
        "sous_parties": [
          {
            "titre": "Comment utiliser ce cours",
            "rows": [
              {
                "concept": "◆ Onglet QCM",
                "detail_md": "Toutes les annales sont dans l’onglet **QCM** ci-dessus.\n· 56 QCM d’annales UE5 de **Histologie**, **Anatomie**, **Pharmacologie** (diurétiques) et **Médecine nucléaire** — c’est-à-dire toutes les matières **qui ne sont pas** dans le cours Alexis (physiologie / sémiologie / andrologie).\n· Sources : fichiers d’annales classées + les examens complets DFG2-UE5 (avril 2023, mars 2024, juillet 2024, mars 2025).\n· Les **schémas** (coupes, microscopie, schémas anatomiques) sont intégrés dans les questions concernées.",
                "kind": "a_retenir"
              },
              {
                "concept": "Correction",
                "detail_md": "Après validation : le **corrigé** (bleu) puis un **rappel de cours** expliqué simplement (vert).\n· Pour les examens, la bonne réponse correspond à ce qui était marqué **« Valide »** dans le corrigé officiel (indépendamment de ce que l’étudiant avait coché).",
                "kind": "normal"
              }
            ]
          }
        ]
      }
    ],
    "points_cles": [
      "Histologie : appareil génital masculin (testicule, épididyme, prostate, vésicules séminales), microscopie électronique et schémas du glomérule / néphron.",
      "Anatomie : anatomie topographique du pelvis (femme/homme), anatomie rénale et des voies spermatiques.",
      "Pharmacologie : diurétiques (thiazidiques, de l’anse, épargneurs de potassium, acétazolamide) — sites d’action, effets indésirables, interactions.",
      "Médecine nucléaire : scintigraphie rénale (MAG3, DMSA, DTPA), néphrogramme, tests au Lasilix / Captopril.",
      "Total : 56 QCM d’annales corrigées, schémas inclus."
    ]
  },
  "flashcards": [],
  "annales": [
    {
      "titre": "Histologie — Appareil génital masculin — 2021-2022 (Q16)",
      "annee": "2021-2022",
      "rappel_cours": "Le **testicule** est entouré d'une capsule conjonctive dense appelée **albuginée**. Le **corps d'Highmore** (ou médiastin testiculaire) est simplement un épaississement de cette albuginée au niveau du hile : ce n'est pas la capsule elle-même.\n\nLe testicule a une **double fonction** :\n- **exocrine** : la spermatogenèse (fabrication des spermatozoïdes dans les tubes séminifères) ;\n- **endocrine** : la sécrétion d'androgènes (testostérone) par les **cellules de Leydig**.\n\nDeux types cellulaires à ne pas confondre :\n- les **cellules de Sertoli** sont DANS l'épithélium séminifère (elles soutiennent les cellules germinales) ;\n- les **cellules de Leydig** sont DANS l'interstitium (tissu conjonctif entre les tubes), et non dans l'épithélium.\n\nÀ la naissance, les testicules ont normalement déjà migré et se trouvent dans le **scrotum** (bourses). S'ils restent en position inguinale, on parle de cryptorchidie.",
      "questions": [
        {
          "enonce": "**[Histologie · Appareil génital masculin · 2021-2022]**\n\nParmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s). Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le testicule est enveloppé d'une capsule conjonctive appelée corps de Highmore",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Le testicule a uniquement une fonction exocrine",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Les cellules de Leydig font parties de l'épithélium séminifère",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "A la naissance les testicules sont situés normalement dans le scrotum",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Aucune des propositions précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nA. **Faux** — Le testicule est enveloppé de l'**albuginée** ; le corps d'Highmore est seulement un épaississement de cette albuginée.\nB. **Faux** — Le testicule a une fonction exocrine (spermatogenèse) ET endocrine (sécrétion d'androgènes).\nC. **Faux** — Les cellules de Leydig font partie de l'**interstitium**, pas de l'épithélium séminifère.\nD. **VRAI** — À la naissance, les testicules sont normalement situés dans le scrotum.\nE. **Faux** — La proposition D est exacte."
        }
      ]
    },
    {
      "titre": "Histologie — Appareil génital masculin — 2021-2022 (Q17)",
      "annee": "2021-2022",
      "rappel_cours": "Les **voies spermatiques** s'enchaînent dans cet ordre : tubes séminifères → tubes droits → rete testis → cônes efférents → **canal épididymaire** (épididyme) → **canal déférent**. Donc le canal déférent fait suite au canal épididymaire, et non l'inverse.\n\nL'**épithélium de l'épididyme** est **prismatique (cylindrique) pseudo-stratifié** : toutes les cellules reposent sur la lame basale mais n'atteignent pas toutes la lumière, ce qui donne un faux aspect de plusieurs couches.\n\nLes **cellules principales** de cet épithélium portent à leur pôle apical de longues **stéréocils** (microvillosités très longues et immobiles, à ne pas confondre avec des cils vibratiles). Elles servent à la réabsorption et à la maturation des spermatozoïdes.\n\nLa **musculeuse** de l'épididyme **s'épaissit** progressivement de la tête vers la queue : plus on avance, plus la couche musculaire est développée (utile pour propulser les spermatozoïdes lors de l'éjaculation).",
      "questions": [
        {
          "enonce": "**[Histologie · Appareil génital masculin · 2021-2022]**\n\nParmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s). Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le canal épididymaire fait suite au canal déférent",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "L'épithélium de l'épididyme est prismatique pseudo-stratifié",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Les cellules principales de l'épithélium épididymaire sont caractérisées par la présence de microvillosités",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "La musculeuse de l'épididyme s'épaissit progressivement de la tête vers la queue",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Aucune des propositions précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : BD**\n\nA. **Faux** — C'est l'inverse : le **canal déférent** fait suite au canal épididymaire.\nB. **VRAI** — L'épithélium de l'épididyme est bien prismatique pseudo-stratifié.\nC. **Faux** — Les cellules principales sont caractérisées par la présence de **stéréocils** (et non de simples microvillosités).\nD. **VRAI** — La musculeuse s'épaissit de la tête vers la queue.\nE. **Faux** — Les propositions B et D sont exactes."
        }
      ]
    },
    {
      "titre": "Histologie — Appareil génital masculin — 2021-2022 (Q18)",
      "annee": "2021-2022",
      "rappel_cours": "La **prostate** est une **glande exocrine** tubulo-alvéolaire. Son organisation en coupe :\n- elle est entourée d'une **capsule** conjonctivo-musculaire (attention : ce n'est pas une « albuginée », terme réservé au testicule) ;\n- le **stroma** conjonctif qui sépare les glandes est particulièrement **riche en fibres musculaires lisses** (caractéristique de la prostate) ;\n- les glandes forment des **alvéoles** (acini) dont la lumière peut contenir des concrétions appelées **sympexions** (corps amylacés) ;\n- l'**épithélium glandulaire** qui borde les alvéoles est fait de **cellules prismatiques ou cubiques** (épithélium souvent bistratifié).\n\nLe **corps de Robin** est une petite formation observée dans certaines annotations de coupe prostatique. L'albuginée, elle, n'appartient pas à la prostate.",
      "questions": [
        {
          "enonce": "**[Histologie · Appareil génital masculin · 2021-2022]**\n\nSur cette coupe prostatique, parmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s). Veuillez choisir au moins une réponse.\n<img src=\"/prive-images/autres-annales/histo-prostate.png\" alt=\"Coupe histologique de prostate\" style=\"display:block;max-width:100%;height:auto;margin:10px auto;border:1px solid #e5e7eb;border-radius:8px;background:#fff;\" />",
          "items": [
            {
              "lettre": "A",
              "enonce": "1 représente l'albuginée",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "2 représente le stroma conjonctif riche en fibres musculaires lisses",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "3 représente une alvéole",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "4 représente un corps de Robin",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "5 représente un épithélium glandulaire constitué de cellules prismatiques ou cubiques",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCDE**\n\nA. **Faux** — La prostate n'est pas entourée d'une albuginée (ce terme est réservé au testicule).\nB. **VRAI** — Le repère 2 correspond au stroma conjonctif riche en fibres musculaires lisses, caractéristique de la prostate.\nC. **VRAI** — Le repère 3 est bien une alvéole (acinus) glandulaire.\nD. **VRAI** — Le repère 4 correspond à un corps de Robin.\nE. **VRAI** — Le repère 5 est l'épithélium glandulaire fait de cellules prismatiques ou cubiques."
        }
      ]
    },
    {
      "titre": "Histologie — Appareil génital masculin — 2021-2022 (Q19)",
      "annee": "2021-2022",
      "rappel_cours": "La **barrière de filtration glomérulaire** (vue en microscopie électronique) comporte, de l'intérieur du capillaire vers la chambre urinaire, trois couches :\n1. l'**endothélium capillaire fenêtré** du floculus : il est percé de nombreux pores (fenêtres), mais ces pores sont **non diaphragmés** (pas de fin diaphragme obturant les pores, contrairement à d'autres endothélies) ;\n2. la **lame basale glomérulaire** : il s'agit de la **fusion** des lames basales de l'endothélium et des podocytes ;\n3. les **podocytes**, dont les prolongements (**pédicelles**) s'interdigitent. Entre deux pédicelles voisins subsiste un espace appelé **fente de filtration**, fermée par un diaphragme de fente.\n\nRepères utiles pour l'annotation : un **pore** correspond à une fenêtre de la cellule endothéliale ; un **pédicelle** est un pied de podocyte ; la **fente de filtration** est l'espace entre deux pédicelles.",
      "questions": [
        {
          "enonce": "**[Histologie · Appareil génital masculin · 2021-2022]**\n\nParmi les propositions d'annotations pour cette photographie de microscopie électronique, laquelle ou lesquelles sont EXACTES ? Veuillez choisir au moins une réponse.\n<img src=\"/prive-images/autres-annales/histo-microscopie.png\" alt=\"Microscopie électronique de la barrière glomérulaire\" style=\"display:block;max-width:100%;height:auto;margin:10px auto;border:1px solid #e5e7eb;border-radius:8px;background:#fff;\" />",
          "items": [
            {
              "lettre": "A",
              "enonce": "La flèche A indique le feuillet pariétal de la chambre glomérulaire",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La flèche B indique un pore d'une cellule endothéliale",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La flèche C indique l'endothélium capillaire fenêtré et diaphragmé du floculus",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "La flèche D indique un pédicelle de podocyte",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "La flèche E indique la fente de filtration glomérulaire",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BDE**\n\nA. **Faux** — La flèche A indique les lames basales fusionnées de la barrière glomérulaire, et non le feuillet pariétal.\nB. **VRAI** — La flèche B indique bien un pore d'une cellule endothéliale.\nC. **Faux** — L'endothélium capillaire du floculus est fenêtré mais **non diaphragmé**.\nD. **VRAI** — La flèche D indique un pédicelle de podocyte.\nE. **VRAI** — La flèche E indique la fente de filtration glomérulaire."
        }
      ]
    },
    {
      "titre": "Histologie — Appareil génital masculin — 2021-2022 (Q20)",
      "annee": "2021-2022",
      "rappel_cours": "Le **glomérule rénal** et son appareil juxta-glomérulaire s'annotent sur schéma. Points clés :\n- l'**artériole afférente** amène le sang au glomérule, l'**artériole efférente** l'en évacue (elles entrent/sortent au **pôle vasculaire**) ;\n- le **pôle urinaire** est le point opposé, d'où part le **tube contourné proximal** ;\n- la **capsule de Bowman** entoure le glomérule (feuillet pariétal externe) ;\n- la **barrière de filtration glomérulaire** est la paroi à travers laquelle le plasma est filtré ;\n- les **cellules mésangiales** sont situées entre les anses capillaires (mésangium), avec un rôle de soutien et de contraction.\n\nSur ce schéma (flèches 1 à 5), il faut relier chaque flèche à la bonne structure : flèche 1 = tube contourné distal, 2 = artériole afférente, 3 = capsule de Bowman, 4 = cellule mésangiale, 5 = tube contourné proximal.",
      "questions": [
        {
          "enonce": "**[Histologie · Appareil génital masculin · 2021-2022]**\n\nParmi les propositions d'annotations du schéma laquelle ou lesquelles sont EXACTES ? Veuillez choisir au moins une réponse.\n<img src=\"/prive-images/autres-annales/histo-schema-glomerule.png\" alt=\"Schéma du glomérule rénal\" style=\"display:block;max-width:100%;height:auto;margin:10px auto;border:1px solid #e5e7eb;border-radius:8px;background:#fff;\" />",
          "items": [
            {
              "lettre": "A",
              "enonce": "La flèche n°1 indique l'artériole efférente",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La flèche n°2 indique le pôle urinaire du glomérule",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La flèche n°3 indique la barrière de filtration glomérulaire",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "La flèche n°4 indique une cellule mésangiale",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "La flèche n°5 indique le tube contourné proximal",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : DE**\n\nA. **Faux** — La flèche n°1 indique le **tube contourné distal**.\nB. **Faux** — La flèche n°2 indique l'**artériole afférente**.\nC. **Faux** — La flèche n°3 indique la **capsule de Bowman**.\nD. **VRAI** — La flèche n°4 indique une cellule mésangiale.\nE. **VRAI** — La flèche n°5 indique le tube contourné proximal."
        }
      ]
    },
    {
      "titre": "Histologie — Appareil génital masculin — 2021-2022 (Q21)",
      "annee": "2021-2022",
      "rappel_cours": "Suite de l'annotation du **même schéma du glomérule** (flèches 6 à 10). Structures à connaître :\n- la **macula densa** est une zone spécialisée du tube contourné distal, au contact du pôle vasculaire ; elle fait partie de l'appareil juxta-glomérulaire et détecte la composition de l'urine ;\n- le **mésangium** est le tissu de soutien situé entre les anses capillaires (à ne pas confondre avec un « urothélium », qui tapisse les voies urinaires et n'existe pas dans le glomérule) ;\n- l'**artériole efférente** sort du glomérule au pôle vasculaire ;\n- le **podocyte** est la cellule du feuillet viscéral de la capsule de Bowman, avec ses pédicelles ;\n- le **floculus** désigne le peloton de capillaires glomérulaires (le « glomérule » proprement dit).\n\nCorrespondances : flèche 6 = macula densa, 7 = mésangium, 8 = artériole efférente, 9 = podocyte, 10 = floculus.",
      "questions": [
        {
          "enonce": "**[Histologie · Appareil génital masculin · 2021-2022]**\n\nParmi les propositions d'annotations du schéma laquelle ou lesquelles sont EXACTES ? Veuillez choisir au moins une réponse.\n<img src=\"/prive-images/autres-annales/histo-schema-glomerule.png\" alt=\"Schéma du glomérule rénal\" style=\"display:block;max-width:100%;height:auto;margin:10px auto;border:1px solid #e5e7eb;border-radius:8px;background:#fff;\" />",
          "items": [
            {
              "lettre": "A",
              "enonce": "La flèche n°6 indique la macula densa",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "La flèche n°7 indique l'urothélium",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La flèche n°8 indique l'artériole afférente",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "La flèche n°9 indique un podocyte",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "La flèche n°10 indique le floculus",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ADE**\n\nA. **VRAI** — La flèche n°6 indique la macula densa.\nB. **Faux** — La flèche n°7 indique le **mésangium**, pas un urothélium.\nC. **Faux** — La flèche n°8 indique l'**artériole efférente**.\nD. **VRAI** — La flèche n°9 indique un podocyte.\nE. **VRAI** — La flèche n°10 indique le floculus."
        }
      ]
    },
    {
      "titre": "Médecine nucléaire — Scintigraphie dynamique MAG3 / test au Lasilix — 2019 (Q10)",
      "annee": "2019",
      "rappel_cours": "La **scintigraphie rénale dynamique au 99mTc-MAG3** suit en temps réel le passage du traceur dans les reins puis les voies excrétrices.\n\n**Points clés :**\n- Le **MAG3** est un traceur **sécrété** par les cellules des **tubules proximaux** (c'est un bon reflet du flux plasmatique rénal).\n- L'acquisition d'images commence **juste après l'injection** et dure environ **40 minutes** (et non plusieurs heures).\n- Le **test au Lasilix (furosémide)** est un diurétique qui force le drainage : il permet de distinguer une **dilatation simple** d'une **véritable obstruction** des cavités.\n- À partir des courbes (rénogrammes) des deux reins, on obtient la **fonction rénale différentielle** (part de chaque rein) et l'analyse du **drainage**.",
      "questions": [
        {
          "enonce": "**[Médecine nucléaire · Scintigraphie dynamique MAG3 / Lasilix · 2019]**\n\nToutes les propositions suivantes concernant la scintigraphie rénale dynamique au 99mTc-MAG3 avec test au Lasilix sont exactes, SAUF UNE. Laquelle ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Il s'agit d'un examen dynamique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "L'examen consiste à réaliser des images six heures après injection du radiopharmaceutique",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Le MAG3 est sécrété dans les tubules proximaux",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "À partir des rénogrammes des deux reins, il est possible de déterminer la fonction rénale différentielle et le drainage des cavités excrétrices",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Plusieurs méthodes d'analyse des rénogrammes ont été proposées pour mieux affirmer l'existence d'une obstruction",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B** (question « SAUF UNE » : la proposition à cocher est la seule fausse)\n\nA. **VRAI** — C'est bien un examen dynamique (suivi image par image dans le temps).\nB. **Faux (réponse à cocher)** — Une scintigraphie dynamique se déroule **juste après l'injection**, pendant environ **40 minutes**, et non six heures après.\nC. **VRAI** — Le MAG3 est sécrété au niveau des tubules proximaux.\nD. **VRAI** — On obtient la fonction rénale différentielle et l'analyse du drainage.\nE. **VRAI** — Plusieurs méthodes d'analyse existent pour affirmer une obstruction."
        }
      ]
    },
    {
      "titre": "Médecine nucléaire — Scintigraphie MAG3 sensibilisée au Captopril — 2019 (Q11)",
      "annee": "2019",
      "rappel_cours": "La **scintigraphie au MAG3 sensibilisée par le Captopril (IEC)** recherche une **hypertension artérielle rénovasculaire** (liée à une sténose de l'artère rénale).\n\n**Points clés :**\n- Examen **non invasif**, réalisé en **2 temps** : condition **basale**, puis après prise orale de **captopril 50 mg**.\n- Le **MAG3** est **sécrété** par les tubules (bon marqueur du flux plasmatique). Attention : le traceur **filtré** par le glomérule est le **DTPA**, pas le MAG3.\n- En cas de sténose, l'IEC lève la vasoconstriction de l'artériole efférente : la filtration chute du côté sténosé, ce qui **retarde/diminue** le signal de ce côté après captopril.",
      "questions": [
        {
          "enonce": "**[Médecine nucléaire · Scintigraphie MAG3 / Captopril · 2019]**\n\nToutes les propositions suivantes concernant la scintigraphie rénale au MAG3 sensibilisée par le Captopril sont exactes, SAUF UNE. Laquelle ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "C'est un examen non invasif",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Le MAG3 est un radiopharmaceutique qui est éliminé principalement par filtration glomérulaire",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "C'est un examen réalisé en 2 temps, en condition basale et après prise orale d'un comprimé de 50 mg de captopril",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Ce test est utilisé dans le diagnostic de l'hypertension artérielle rénovasculaire",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Une sténose fonctionnelle d'une artère rénale va se traduire par une baisse du taux de captation rénale du côté de la sténose, après administration du captopril",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B** (question « SAUF UNE » : la proposition à cocher est la seule fausse)\n\nA. **VRAI** — Examen non invasif.\nB. **Faux (réponse à cocher)** — C'est le **DTPA** qui est éliminé principalement par **filtration glomérulaire**. Le MAG3 est, lui, **sécrété** par les tubules.\nC. **VRAI** — Examen en 2 temps : basal puis après captopril 50 mg per os.\nD. **VRAI** — Utilisé pour le diagnostic d'HTA rénovasculaire.\nE. **VRAI** — Après captopril, la captation baisse du côté de la sténose."
        }
      ]
    },
    {
      "titre": "Médecine nucléaire — Traceurs de la fonction rénale — 2017 Session 2 (Q30)",
      "annee": "2017 (Session 2)",
      "rappel_cours": "Les **traceurs** de scintigraphie rénale se répartissent selon ce qu'ils explorent :\n\n- **99mTc-MAG3** : traceur **sécrété** → scintigraphie **dynamique**, évalue la **fonction** et le **drainage**.\n- **99mTc-DMSA** : traceur qui se **fixe** au cortex rénal → scintigraphie **statique**, évalue la **masse néphronique fonctionnelle** (fonction relative de chaque rein).\n- **99mTc-DTPA** : traceur **filtré** par le glomérule → mesure du DFG.\n- **99mTc-HMDP** : traceur **osseux** (scintigraphie du squelette), pas rénal.\n- **99mTc-MIBI** : traceur **cardiaque** (perfusion myocardique) / parathyroïdien, pas rénal.",
      "questions": [
        {
          "enonce": "**[Médecine nucléaire · Traceurs de la fonction rénale · 2017 Session 2]**\n\nQuels est (sont) le ou les traceur(s) qui permet(tent) d'évaluer la fonction rénale en scintigraphie ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "99mTc-MAG3",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "99mTc-DMSA",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "99mTc-HMDP",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "99mTc-MIBI",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Aucun de ces traceurs",
              "is_correct": false
            }
          ],
          "correction": "**Réponses : AB**\n\nA. **VRAI** — MAG3 : scintigraphies **dynamiques** (fonction et drainage).\nB. **VRAI** — DMSA : scintigraphies **statiques** (masse néphronique / fonction relative).\nC. **Faux** — HMDP est un traceur **osseux**.\nD. **Faux** — MIBI est un traceur **cardiaque**.\nE. **Faux** — Deux traceurs conviennent (MAG3 et DMSA)."
        }
      ]
    },
    {
      "titre": "Médecine nucléaire — Néphrogramme au MAG3 — 2015 Session 1 (Q32)",
      "annee": "2015 (Session 1)",
      "rappel_cours": "Le **néphrogramme** est la **courbe** de radioactivité d'un rein au cours du temps lors d'une scintigraphie **dynamique** au MAG3.\n\n**Points clés :**\n- Chez le sujet **normal**, on distingue 3 phases : montée vasculaire, **pic de captation dans les 5 premières minutes**, puis phase d'**excrétion descendante**.\n- La scintigraphie n'est **PAS couplée à l'ECG** (ce couplage existe en cardiologie, pas ici).\n- Le MAG3 évalue surtout la **fonction rénale relative** (part de chaque rein), pas la fonction **absolue**.\n- Une phase d'excrétion **en plateau** est **anormale** (elle traduit une rétention / obstruction).",
      "questions": [
        {
          "enonce": "**[Médecine nucléaire · Néphrogramme MAG3 · 2015 Session 1]**\n\nL'étude du néphrogramme obtenue par la scintigraphie rénale au MAG3 (une ou plusieurs réponses exactes) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "nécessite l'acquisition d'une série d'images dynamiques couplées à l'électrocardiogramme",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "permet d'évaluer la fonction rénale absolue",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "permet d'évaluer la fonction rénale relative",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "comporte chez le sujet normal un maximum de radioactivité dans les 5 premières minutes",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "comporte chez le sujet normal une phase d'excrétion en plateau",
              "is_correct": false
            }
          ],
          "correction": "**Réponses : CD**\n\nA. **Faux** — L'acquisition n'est **pas couplée à l'ECG**.\nB. **Faux** — Elle évalue la fonction rénale **relative**, pas absolue.\nC. **VRAI** — Elle donne la fonction rénale relative (part de chaque rein).\nD. **VRAI** — Chez le sujet normal, le pic de radioactivité survient dans les 5 premières minutes.\nE. **Faux** — Chez un sujet normal, la phase d'excrétion est une **portion descendante**, pas un plateau."
        }
      ]
    },
    {
      "titre": "Médecine nucléaire — Scintigraphie au DMSA — 2015 Session 2 (Q20)",
      "annee": "2015 (Session 2)",
      "rappel_cours": "La **scintigraphie statique au 99mTc-DMSA** explore la **structure** et la **masse néphronique fonctionnelle** du cortex rénal.\n\n**Points clés :**\n- Le DMSA se **fixe** au cortex : il visualise les **altérations structurelles** (cicatrices, pyélonéphrites, reins fonctionnels).\n- Il **quantifie la masse des néphrons** fonctionnels de chaque rein.\n- Il ne s'**élimine pas** dans l'urine → on **ne peut pas** calculer une **clairance** (qui nécessite un traceur éliminé, comme l'EDTA ou l'inuline).\n- Les **sténoses rénovasculaires** s'explorent en **dynamique** (MAG3 / DTPA + test au Captopril).\n- Les **reflux vésico-urétéraux** s'explorent par **cystographie isotopique**.",
      "questions": [
        {
          "enonce": "**[Médecine nucléaire · Scintigraphie DMSA · 2015 Session 2]**\n\nLa scintigraphie rénale au 99mTc-DMSA permet :",
          "items": [
            {
              "lettre": "A",
              "enonce": "De visualiser des altérations structurelles des reins",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "De quantifier la masse des néphrons de chaque rein",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "De calculer la clairance rénale de chaque rein",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "D'explorer les sténoses réno-vasculaires",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "D'explorer les reflux vésico-urétéraux",
              "is_correct": false
            }
          ],
          "correction": "**Réponses : AB**\n\nA. **VRAI** — Le DMSA visualise les altérations structurelles.\nB. **VRAI** — Il quantifie la masse néphronique de chaque rein.\nC. **Faux** — Le DMSA se **fixe** et ne s'élimine pas : on ne peut pas calculer de clairance. Les clairances se mesurent avec des traceurs filtrés/sécrétés (inuline, EDTA, créatinine).\nD. **Faux** — Les sténoses rénovasculaires s'explorent en **dynamique** (MAG3 ou DTPA) avec test au Captopril.\nE. **Faux** — Les reflux vésico-urétéraux s'explorent par **cystographie isotopique**."
        }
      ]
    },
    {
      "titre": "Médecine nucléaire — Sténose rénovasculaire sous IEC — 2014 Session 1 (Q12)",
      "annee": "2014 (Session 1)",
      "rappel_cours": "En cas de **sténose de l'artère rénale**, la filtration glomérulaire est maintenue grâce à la **vasoconstriction de l'artériole efférente** (médiée par l'angiotensine II).\n\n**Effet d'un IEC (inhibiteur de l'enzyme de conversion) :**\n- L'IEC **bloque l'angiotensine II** → **relâche l'artériole efférente** → la pression de filtration chute → le **DFG baisse** du côté sténosé.\n- Le **DTPA** (filtré par le glomérule) voit donc son excrétion **ralentie** sous IEC : c'est le principe du test.\n- Le **MAG3** (sécrété, reflet du flux plasmatique) n'est **pas systématiquement ralenti** : dans une sténose unilatérale, le DFG baisse mais le flux plasmatique ne s'effondre pas forcément.",
      "questions": [
        {
          "enonce": "**[Médecine nucléaire · Sténose rénovasculaire sous IEC · 2014 Session 1]**\n\nL'administration d'un inhibiteur de l'enzyme de conversion sera désignée par l'expression « sous IEC ». En cas de sténose réno-vasculaire, toutes les propositions suivantes sont exactes, SAUF UNE. Laquelle ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le débit de filtration glomérulaire est conservé",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Sous IEC, la vasoconstriction de l'artériole efférente diminue",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Sous IEC, le débit de filtration glomérulaire est diminué",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Sous IEC, l'excrétion du DTPA est ralentie",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Sous IEC, l'excrétion du MAG3 est ralentie",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : E** (question « SAUF UNE » : la proposition à cocher est la seule fausse)\n\nA. **VRAI** — Sans IEC, le DFG est conservé (compensation par l'artériole efférente).\nB. **VRAI** — L'IEC diminue la vasoconstriction de l'artériole efférente.\nC. **VRAI** — Cette baisse de tonus fait chuter le DFG sous IEC.\nD. **VRAI** — Le DTPA, filtré, voit son excrétion ralentie sous IEC.\nE. **Faux (réponse à cocher)** — Le **MAG3 n'est pas systématiquement ralenti** : dans une sténose unilatérale, le DFG baisse mais le flux plasmatique rénal ne chute pas forcément significativement."
        }
      ]
    },
    {
      "titre": "Médecine nucléaire — Scintigraphie au DMSA — 2014 Session 1 (Q35)",
      "annee": "2014 (Session 1)",
      "rappel_cours": "La **scintigraphie statique au 99mTc-DMSA** explore la **structure** et la **masse néphronique fonctionnelle** du cortex rénal.\n\n**Points clés :**\n- Le DMSA se **fixe** au cortex : il visualise les **altérations structurelles** des reins.\n- Il **quantifie la masse des néphrons** fonctionnels de chaque rein.\n- Il ne s'**élimine pas** → pas de **clairance** possible (il faut un traceur éliminé : inuline, EDTA, créatinine).\n- Sténoses rénovasculaires → scintigraphie **dynamique** (MAG3 / DTPA + Captopril).\n- Reflux vésico-urétéraux → **cystographie isotopique**.",
      "questions": [
        {
          "enonce": "**[Médecine nucléaire · Scintigraphie DMSA · 2014 Session 1]**\n\nLa scintigraphie rénale au 99mTc-DMSA permet :",
          "items": [
            {
              "lettre": "A",
              "enonce": "De visualiser des altérations structurelles des reins",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "De quantifier la masse des néphrons de chaque rein",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "De calculer la clairance rénale de chaque rein",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "D'explorer les sténoses réno-vasculaires",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "D'explorer les reflux vésico-urétéraux",
              "is_correct": false
            }
          ],
          "correction": "**Réponses : AB**\n\nA. **VRAI** — Le DMSA visualise les altérations structurelles.\nB. **VRAI** — Il quantifie la masse néphronique de chaque rein.\nC. **Faux** — Le DMSA se fixe et ne s'élimine pas : pas de clairance possible. Les clairances se mesurent avec des traceurs filtrés/sécrétés (inuline, EDTA, créatinine).\nD. **Faux** — Les sténoses rénovasculaires s'explorent en dynamique (MAG3 ou DTPA) avec test au Captopril.\nE. **Faux** — Les reflux vésico-urétéraux s'explorent par cystographie isotopique."
        }
      ]
    },
    {
      "titre": "Médecine nucléaire — Traceur filtré par le glomérule (DTPA) — 2014 Session 2 (Q6)",
      "annee": "2014 (Session 2)",
      "rappel_cours": "Le mode d'élimination distingue les traceurs rénaux :\n\n- **DMSA-99mTc** : se **fixe** au cortex (statique).\n- **DTPA-99mTc** : **exclusivement filtré** par le glomérule → mesure du DFG.\n- **HMDP-99mTc** : traceur **osseux**.\n- **MAG3-99mTc** : **sécrété** par les tubules (dynamique).\n- **MIBI-99mTc** : traceur **cardiaque** / parathyroïdien.",
      "questions": [
        {
          "enonce": "**[Médecine nucléaire · Traceur filtré par le glomérule · 2014 Session 2]**\n\nQuel est le radiotraceur exclusivement filtré par le glomérule ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "DMSA-99mTc",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "DTPA-99mTc",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "HMDP-99mTc",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "MAG3-99mTc",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "MIBI-99mTc",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B**\n\nA. **Faux** — Le DMSA se **fixe** au cortex, il n'est pas filtré.\nB. **VRAI** — Le **DTPA** est **exclusivement filtré** par le glomérule (mesure du DFG).\nC. **Faux** — L'HMDP est un traceur **osseux**.\nD. **Faux** — Le MAG3 est **sécrété** par les tubules, non filtré.\nE. **Faux** — Le MIBI est un traceur **cardiaque**."
        }
      ]
    },
    {
      "titre": "Médecine nucléaire — Syndrome de jonction et obstruction (scintigraphie dynamique) — 2014 Session 2 (Q24)",
      "annee": "2014 (Session 2)",
      "rappel_cours": "Le **syndrome de jonction pyélo-urétérale** peut comporter un **obstacle organique** (fixe) sur l'uretère, à distinguer d'une simple dilatation fonctionnelle.\n\n**En scintigraphie dynamique (MAG3) avec test au Lasilix :**\n- Sur un obstacle **organique**, le **néphrogramme du rein atteint est pathologique** (courbe ascendante qui ne redescend pas).\n- La **captation** du rein bloqué sur l'examen de base est **souvent anormale**.\n- Après **Lasilix**, l'excrétion **reste anormale** en cas d'obstacle organique (le diurétique ne parvient pas à vider les cavités).\n- À l'inverse, si l'excrétion **se normalise** sous Lasilix, il s'agit d'une **dilatation fonctionnelle** sans obstacle vrai.",
      "questions": [
        {
          "enonce": "**[Médecine nucléaire · Syndrome de jonction / obstruction · 2014 Session 2]**\n\nQue peut-on observer dans l'exploration d'un syndrome de jonction avec obstacle organique de l'uretère droit avec une scintigraphie rénale dynamique ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le néphrogramme de l'examen de base de chaque rein toujours normal",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La captation du rein droit sur l'examen de base est toujours normale",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La captation du rein droit sur l'examen de base est souvent anormale",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "L'excrétion du rein droit après injection de Lasilix reste anormale",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "L'excrétion du rein droit après injection de Lasilix se normalise",
              "is_correct": false
            }
          ],
          "correction": "**Réponses : CD**\n\nA. **Faux** — En présence d'un obstacle organique, le néphrogramme du rein atteint est **pathologique**.\nB. **Faux** — La captation du rein droit est souvent anormale (voir item C).\nC. **VRAI** — La captation du rein droit sur l'examen de base est souvent anormale.\nD. **VRAI** — Sous Lasilix, l'excrétion du rein droit **reste anormale** (obstacle organique).\nE. **Faux** — Une normalisation sous Lasilix signerait une dilatation **fonctionnelle**, pas un obstacle organique."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Diurétiques — Mécanismes d'action (Q11)",
      "annee": "Mécanismes d'action",
      "rappel_cours": "Les **diurétiques thiazidiques** agissent au niveau du **tube contourné distal (TCD)**, pas au niveau du tube contourné proximal ni du tube collecteur.\n\nLeur cible est le **cotransporteur Na+/Cl-** (à ne pas confondre avec le cotransporteur Na+/K+/2Cl- qui est la cible des diurétiques de l'anse).\n\nComme ils agissent en aval de l'anse de Henlé, ils **n'altèrent pas le gradient cortico-papillaire** et **ne modifient donc pas la capacité de concentration des urines**.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques · Mécanismes d'action]**\n\nParmi les propositions suivantes, laquelle ou lesquelles correspondent au mécanisme d'action des diurétiques thiazidiques :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Ils agissent au niveau du tube contourné proximal",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Ils agissent au niveau du tube collecteur",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Ils bloquent un cotransporteur Na+/Cl-",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Ils bloquent un cotransporteur Na+/K+/Cl-",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Ils ne modifient pas la capacité de concentration des urines",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : CE**\n\nA. **Faux** — ils agissent au niveau du tube contourné distal.\nB. **Faux** — ils agissent au niveau du tube contourné distal.\nC. **Valide** — ils bloquent un cotransporteur Na+/Cl-.\nD. **Faux** — le cotransporteur Na+/K+/2Cl- est la cible des diurétiques de l'anse, pas des thiazidiques.\nE. **Valide** — ils ne modifient pas la capacité de concentration des urines."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Diurétiques — Mécanismes d'action (Q12)",
      "annee": "Mécanismes d'action",
      "rappel_cours": "Les **diurétiques d'épargne potassique** agissent en fin de tubule, au niveau du **tube distal terminal et du tube collecteur**, pas au niveau de l'anse de Henlé.\n\nDeux familles existent, avec des cibles différentes :\n\n- les **anti-aldostérone** (ex. spironolactone) : ils **s'opposent aux effets de l'aldostérone** en bloquant son récepteur ;\n- les **inhibiteurs directs du canal sodé épithélial (ENaC)** (ex. amiloride).\n\nIls **n'ont donc pas tous la même cible pharmacologique**, mais aboutissent tous à une épargne du potassium.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques · Mécanismes d'action]**\n\nParmi les propositions suivantes, laquelle ou lesquelles correspondent au mécanisme d'action des diurétiques d'épargne potassique :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Ils agissent au niveau de l'Anse de Henlé",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Ils agissent au niveau du tube collecteur",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Ils agissent au niveau du tube distal terminal",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Ils s'opposent aux effets de l'aldostérone",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Ils n'ont pas tous la même cible pharmacologique",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCDE**\n\nA. **Faux** — ils agissent au niveau du tube contourné distal terminal et du tube collecteur, pas de l'anse de Henlé.\nB. **Valide** — ils agissent au niveau du tube collecteur.\nC. **Valide** — ils agissent au niveau du tube distal terminal.\nD. **Valide** — les anti-aldostérone s'opposent aux effets de l'aldostérone.\nE. **Valide** — ils n'ont pas tous la même cible pharmacologique (anti-aldostérone vs inhibiteurs directs d'ENaC)."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Diurétiques — Mécanismes d'action (Q13)",
      "annee": "Mécanismes d'action",
      "rappel_cours": "L'**acétazolamide** est un **inhibiteur de l'anhydrase carbonique**. Il agit au niveau du **tube contourné proximal** (et non de l'anse de Henlé).\n\nEn inhibant l'anhydrase carbonique, il **diminue la réabsorption des ions bicarbonates** (HCO3-), ce qui entraîne une bicarbonaturie.\n\nCe n'est **pas un traitement de l'HTA** (il est même contre-indiqué dans ce cadre). Son indication classique est le **glaucome**, y compris par **voie locale**, car l'anhydrase carbonique intervient dans la production d'humeur aqueuse.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques · Mécanismes d'action]**\n\nParmi les propositions suivantes, laquelle ou lesquelles concernent l'acétazolamide :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Il agit au niveau de l'Anse de Henlé",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Il agit en inhibant l'anhydrase carbonique",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Il agit en diminuant l'absorption des ions bicarbonates",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Il est indiqué pour le traitement de l'hypertension artérielle",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Il est indiqué par voie locale pour le traitement du glaucome",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCE**\n\nA. **Faux** — il agit au niveau du tube contourné proximal.\nB. **Valide** — il agit en inhibant l'anhydrase carbonique.\nC. **Valide** — il agit en diminuant l'absorption des ions bicarbonates.\nD. **Faux** — il est contre-indiqué pour le traitement de l'hypertension artérielle.\nE. **Valide** — il est indiqué par voie locale pour le traitement du glaucome."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Diurétiques — 2021/2022 Session 1 (Q28)",
      "annee": "2021/2022 Session 1",
      "rappel_cours": "En cas d'insuffisance rénale, pour réduire la **protéinurie**, on cible le **système rénine-angiotensine-aldostérone (SRAA)** car il réduit la pression intraglomérulaire (dilatation de l'artériole efférente).\n\nLes deux classes qui diminuent le plus la protéinurie sont :\n\n- les **IEC** (inhibiteurs de l'enzyme de conversion) ;\n- les **ARA2** (antagonistes des récepteurs de l'angiotensine 2).\n\nLes **diurétiques**, les **inhibiteurs alpha-adrénergiques** et les **inhibiteurs calciques** n'ont pas cet effet néphroprotecteur antiprotéinurique majeur.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques · 2021/2022 Session 1]**\n\nParmi les traitements pharmacologiques suivants, quels sont ceux diminuant le plus le débit de protéinurie en cas d'insuffisance rénale expérimentale ? Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Diurétiques",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Inhibiteurs des récepteurs alpha-adrénergiques",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Inhibiteurs de l'enzyme de conversion",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Inhibiteurs calciques",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Antagonistes des récepteurs de l'angiotensine 2",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : CE**\n\nA. **Faux** — les diurétiques ne réduisent pas la protéinurie de façon prépondérante.\nB. **Faux** — les inhibiteurs alpha-adrénergiques n'ont pas cet effet.\nC. **VRAI** — les IEC réduisent la protéinurie (effet néphroprotecteur via le SRAA).\nD. **Faux** — les inhibiteurs calciques n'ont pas cet effet antiprotéinurique majeur.\nE. **VRAI** — les ARA2 réduisent la protéinurie (effet néphroprotecteur via le SRAA)."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Diurétiques — 2021/2022 Session 1 (Q30)",
      "annee": "2021/2022 Session 1",
      "rappel_cours": "Les **diurétiques de l'anse** (ex. furosémide) agissent au niveau de la **branche ascendante de l'anse de Henlé**, en bloquant le **cotransporteur Na+/K+/2Cl-** (et non l'anhydrase carbonique).\n\nCe sont les diurétiques les plus puissants : leur **efficacité salidiurétique est supérieure** à celle des thiazidiques.\n\nEffets et complications : ils peuvent entraîner une **alcalose métabolique** et une **hypocalcémie** (ils augmentent l'excrétion urinaire de calcium). L'**hypercalcémie**, à l'inverse, est un effet des **thiazidiques**.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques · 2021/2022 Session 1]**\n\nParmi les propositions suivantes concernant les diurétiques de l'anse, laquelle ou lesquelles est/sont exacte(s) ? Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Ils agissent au niveau de la branche ascendante de l'Anse de Henlé",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Ils ont pour cible pharmacologique l'anhydrase carbonique",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Ils ont une efficacité salidiurétique supérieure à celle des diurétiques thiazidiques",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Ils peuvent entrainer une alcalose métabolique",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Ils peuvent entrainer une hypercalcémie",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : ACD**\n\nA. **VRAI** — ils agissent au niveau de la branche ascendante de l'anse de Henlé.\nB. **Faux** — leur cible est le cotransporteur Na/K/2Cl ; l'anhydrase carbonique est la cible des inhibiteurs de l'anhydrase carbonique.\nC. **VRAI** — leur efficacité salidiurétique est supérieure à celle des thiazidiques.\nD. **VRAI** — ils peuvent entraîner une alcalose métabolique.\nE. **Faux** — ils entraînent une hypocalcémie ; l'hypercalcémie est un effet des thiazidiques."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Diurétiques — 2021/2022 Session 1 (Q31)",
      "annee": "2021/2022 Session 1",
      "rappel_cours": "Les **diurétiques anti-aldostérone** (ex. spironolactone) sont des **épargneurs de potassium**. Ils agissent au niveau du **tube collecteur** (et non du tube contourné distal).\n\nMécanisme : ils bloquent le récepteur de l'aldostérone, ce qui **diminue la synthèse des canaux sodés épithéliaux (ENaC)** — ils ne bloquent pas directement l'ENaC (ça, c'est le mode d'action de l'amiloride).\n\nConséquences : ils **diminuent l'excrétion rénale du potassium** (risque d'hyperkaliémie), peuvent provoquer une **acidose métabolique**, et — par effet antiandrogénique — une **gynécomastie**.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques · 2021/2022 Session 1]**\n\nParmi les propositions suivantes concernant les diurétiques de type anti-aldostérone, laquelle ou lesquelles est/sont exacte(s) ? Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Ils agissent au niveau du tube contourné distal",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Ils agissent en bloquant le canal sodé épithélial (ENaC)",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Ils diminuent l'excrétion rénale du potassium",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Ils peuvent entrainer une acidose métabolique",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Ils peuvent provoquer une gynécomastie",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : CDE**\n\nA. **Faux** — ils agissent au niveau du tube collecteur (ce sont des épargneurs de K+).\nB. **Faux** — ils agissent en diminuant la synthèse des canaux ENaC, ils ne les bloquent pas directement.\nC. **VRAI** — ils diminuent l'excrétion rénale du potassium.\nD. **VRAI** — ils peuvent entraîner une acidose métabolique.\nE. **VRAI** — ils peuvent provoquer une gynécomastie."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Diurétiques — 2021/2022 Session 1 (Q32)",
      "annee": "2021/2022 Session 1",
      "rappel_cours": "Effets indésirables des **diurétiques thiazidiques** à connaître :\n\n- **hyponatrémie** (perte de sodium) ;\n- **hypokaliémie** (et non hyperkaliémie — l'hyperkaliémie est l'effet des épargneurs de potassium) ;\n- **alcalose métabolique** ;\n- **hypercalcémie** (les thiazidiques diminuent l'excrétion urinaire de calcium — à l'inverse des diurétiques de l'anse) ;\n- **hyperuricémie** (risque de crise de goutte).",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques · 2021/2022 Session 1]**\n\nParmi les effets indésirables suivants, lequel ou lesquels peut/peuvent être induits par les diurétiques thiazidiques ? Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Une hyponatrémie",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Une hyperkaliémie",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Une alcalose métabolique",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Une hypercalcémie",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Une hyperuricémie",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ACDE**\n\nA. **VRAI** — une hyponatrémie.\nB. **Faux** — les thiazidiques donnent une hypokaliémie ; l'hyperkaliémie est un effet des épargneurs de K+.\nC. **VRAI** — une alcalose métabolique.\nD. **VRAI** — une hypercalcémie.\nE. **VRAI** — une hyperuricémie."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Diurétiques — 2021/2022 Session 1 (Q33)",
      "annee": "2021/2022 Session 1",
      "rappel_cours": "Précautions et interactions des **diurétiques** :\n\n- ils ne doivent **pas être prescrits chez la femme enceinte, sauf nécessité absolue** ;\n- l'association d'un **thiazidique à un digitalique** augmente le risque d'**arythmie** (l'hypokaliémie potentialise la toxicité des digitaliques) ;\n- ce sont les **diurétiques de l'anse et les thiazidiques** (pas les épargneurs de K+) qui augmentent la toxicité du **lithium** ;\n- l'**ototoxicité des aminosides** est majorée par les **diurétiques de l'anse** (pas les thiazidiques) ;\n- l'association **épargneur de K+ + IEC** augmente le risque d'**hyperkaliémie** (double action hyperkaliémiante).",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques · 2021/2022 Session 1]**\n\nParmi les affirmations suivantes concernant les diurétiques, laquelle ou lesquelles est/sont exactes ? Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Ils ne doivent pas être prescrits chez la femme enceinte, sauf en cas de nécessité absolue",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "L'association d'un diurétique thiazidique à un digitalique augmente le risque d'arythmie",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Les diurétiques d'épargne potassique augmentent le risque de toxicité dû au lithium",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Les diurétiques thiazidiques augmentent l'ototoxicité des aminosides",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "L'association d'un diurétique d'épargne potassique à un inhibiteur de l'enzyme de conversion augmente le risque d'hyperkaliémie",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ABE**\n\nA. **VRAI** — ils ne doivent pas être prescrits chez la femme enceinte, sauf en cas de nécessité absolue.\nB. **VRAI** — l'association thiazidique + digitalique augmente le risque d'arythmie.\nC. **Faux** — ce sont les diurétiques de l'anse et les thiazidiques qui peuvent augmenter la toxicité du lithium.\nD. **Faux** — ce sont les diurétiques de l'anse qui augmentent l'ototoxicité des aminosides.\nE. **VRAI** — l'association épargneur de K+ + IEC augmente le risque d'hyperkaliémie."
        }
      ]
    },
    {
      "titre": "Histologie — Testicule (structure et fonctions) — Avril 2023 (Q1)",
      "annee": "Avril 2023 (2022-2023)",
      "rappel_cours": "Le **testicule** est entouré d'une capsule conjonctive dense appelée l'**albuginée**. De cette albuginée partent des cloisons (**septa** ou cloisons radiaires) qui rejoignent le **corps d'Highmore** (mediastinum testis) et découpent le testicule en lobules contenant les **tubes séminifères**.\n\nLe testicule a une **double fonction** :\n- **Exocrine** : production de spermatozoïdes (spermatogenèse) dans les tubes séminifères.\n- **Endocrine** : sécrétion de testostérone par les **cellules de Leydig**, situées dans le tissu **interstitiel** (entre les tubes).\n\nLes **cellules de Sertoli**, elles, sont **à l'intérieur des tubes séminifères** : ce sont des cellules de soutien de la spermatogenèse (\"cellules nourricières\").\n\nÀ la naissance, les testicules ont normalement déjà migré dans le **scrotum** (la migration se fait pendant la vie fœtale). Un testicule resté en position inguinale correspond à une cryptorchidie (anomalie).",
      "questions": [
        {
          "enonce": "**[Histologie · Testicule · Avril 2023]**\n\nParmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s).",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le testicule est enveloppé d'une capsule conjonctive appelée l'albuginée",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Le testicule a une fonction uniquement exocrine",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Entre albuginée et corps d'Highmore sont tendues des cloisons radiaires ou septa",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "À la naissance les testicules sont situés dans la région inguinale",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Les cellules de Sertoli se situent dans l'espace interstitiel",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : AC**\n\nA. **Valide/VRAI** — L'albuginée est bien la capsule conjonctive du testicule.\nB. **Faux** — Le testicule a deux fonctions : exocrine (production de spermatozoïdes) et endocrine (sécrétion de testostérone par les cellules de Leydig).\nC. **Valide/VRAI** — Les septa (cloisons radiaires) sont tendus entre l'albuginée et le corps d'Highmore.\nD. **Faux** — Normalement, à la naissance, les testicules sont déjà descendus dans le scrotum.\nE. **Faux** — Les cellules de Sertoli sont dans les tubes séminifères ; l'espace interstitiel contient surtout les cellules de Leydig."
        }
      ]
    },
    {
      "titre": "Histologie — Épididyme — Avril 2023 (Q2)",
      "annee": "Avril 2023 (2022-2023)",
      "rappel_cours": "L'**épididyme** est une voie génitale **extra-testiculaire** (il est appliqué contre le testicule mais en dehors de lui). Il fait suite aux cônes/canaux efférents et se termine par le canal déférent.\n\nSon épithélium est un **épithélium cylindrique (prismatique) pseudostratifié** portant des **stéréocils** : ce sont de longues microvillosités **immobiles** (à ne pas confondre avec les cils vibratiles, qui eux sont mobiles).\n\nLa **partie terminale** (queue de l'épididyme) est un lieu de **stockage** et de maturation des spermatozoïdes.\n\nLa **musculeuse** (couche de muscle lisse) s'**épaissit** progressivement de la tête vers la queue (elle passe de fine à plus épaisse, pour propulser les spermatozoïdes lors de l'éjaculation).",
      "questions": [
        {
          "enonce": "**[Histologie · Épididyme · Avril 2023]**\n\nQuelle est la réponse exacte ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'épididyme est une voie intra-testiculaire",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "L'épididyme a un épithélium cubique simple",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La partie terminale de l'épididyme est un lieu de stockage des spermatozoïdes",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "La cellule de l'épithélium épididymaire est caractérisée par la présence de cils vibratiles",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "La musculeuse de l'épididyme s'amincit progressivement de la tête à la queue avec une organisation en 1 couche dans sa partie terminale",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : C**\n\nA. **Faux** — L'épididyme est une voie génitale extra-testiculaire.\nB. **Faux** — Son épithélium est cylindrique pseudostratifié avec stéréocils.\nC. **Valide/VRAI** — La queue de l'épididyme sert de stockage aux spermatozoïdes.\nD. **Faux** — Les cellules portent des stéréocils (microvillosités immobiles), pas des cils vibratiles.\nE. **Faux** — C'est l'inverse : la musculeuse s'épaissit de la tête vers la queue."
        }
      ]
    },
    {
      "titre": "Histologie — Voies spermatiques et glandes annexes — Avril 2023 (Q3)",
      "annee": "Avril 2023 (2022-2023)",
      "rappel_cours": "Le trajet des spermatozoïdes suit un ordre précis : **tubes séminifères → tubes droits → rete testis → canaux (cônes) efférents → canal épididymaire → canal déférent**. Le **canal épididymaire fait donc suite aux cônes efférents** (et le canal déférent fait suite à l'épididyme, pas aux tubes droits).\n\nLes **vésicules séminales** ont un **épithélium glandulaire** (prismatique) : elles sécrètent la majeure partie du liquide séminal (riche en fructose).\n\nLa **prostate** est une **glande exocrine** (elle déverse ses sécrétions dans l'urètre, participant au liquide séminal) — ce n'est PAS une glande endocrine.\n\nLe **sphincter interne (lisse) de la prostate** est formé de **fibres musculaires lisses** (contrôle involontaire), contrairement au sphincter externe strié.",
      "questions": [
        {
          "enonce": "**[Histologie · Voies spermatiques et glandes annexes · Avril 2023]**\n\nParmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s).",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le canal épididymaire fait suite aux cônes efférents",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "L'épithélium des vésicules séminales est un épithélium glandulaire",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La prostate est une glande endocrine",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le sphincter interne de la prostate est formé de fibres musculaires lisses",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Le canal déférent fait suite aux tubes droits",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : ABD**\n\nA. **Valide/VRAI** — Le canal épididymaire fait suite aux cônes efférents.\nB. **Valide/VRAI** — Les vésicules séminales ont un épithélium glandulaire.\nC. **Faux** — La prostate est une glande exocrine, sécrétant un liquide participant au liquide séminal.\nD. **Valide/VRAI** — Le sphincter interne prostatique est constitué de fibres musculaires lisses.\nE. **Faux** — L'ordre est : tubes séminifères → tubes droits → rete testis → canaux efférents → épididyme → canal déférent."
        }
      ]
    },
    {
      "titre": "Anatomie — Rein et voie excrétrice supérieure — Avril 2023 (Q4)",
      "annee": "Avril 2023 (2022-2023)",
      "rappel_cours": "L'urine formée dans le rein est collectée par un système de cavités : **papilles rénales → calices mineurs → calices majeurs → pelvis (bassinet) → uretère**.\n\n- Les **papilles rénales** sont au **sommet des pyramides rénales (de Malpighi)** et déversent l'urine dans les calices mineurs.\n- Les **calices mineurs** sont dans le **sinus rénal** ; **plusieurs** calices mineurs fusionnent pour former un **calice majeur**. Il y a donc **moins** de calices majeurs que de papilles (attention : leur nombre n'est pas égal).\n- La **capsule rénale** (fibreuse) recouvre le rein, se réfléchit au niveau du sinus et s'interrompt au niveau des papilles.\n- La **voie excrétrice supérieure** (calices, bassinet, uretère) possède un **péristaltisme** (contractions propulsives) sous contrôle du **système nerveux végétatif (autonome)**.",
      "questions": [
        {
          "enonce": "**[Anatomie · Rein et voie excrétrice · Avril 2023]**\n\nQRM d'anatomie. Parmi les propositions suivantes concernant le rein et la voie excrétrice supérieure, laquelle (lesquelles) est (sont) exacte(s) ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Les calices mineurs sont situés dans le sinus rénal et fusionnent pour former les calices majeurs.",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "La capsule rénale recouvre le sinus rénal et s'interrompt au niveau des papilles rénales.",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Les papilles rénales sont situées au sommet des pyramides rénales.",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Il existe autant de calices majeurs que de papilles rénales.",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "La voie excrétrice supérieure a un péristaltisme commandé par le système nerveux végétatif.",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ABCE**\n\nA. **Valide/VRAI** — Les calices mineurs, dans le sinus rénal, fusionnent en calices majeurs.\nB. **Valide/VRAI** — La capsule recouvre le sinus et s'interrompt aux papilles.\nC. **Valide/VRAI** — Les papilles sont au sommet des pyramides rénales.\nD. **Faux** — Plusieurs calices mineurs (donc plusieurs papilles) se jettent dans un même calice majeur : il y a moins de calices majeurs que de papilles.\nE. **Valide/VRAI** — Le péristaltisme de la voie excrétrice est commandé par le système nerveux végétatif."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Site d'action du furosémide — Avril 2023 (Q11)",
      "annee": "Avril 2023 (2022-2023)",
      "rappel_cours": "Le **furosémide** est un **diurétique de l'anse**. Son site d'action est la **branche ascendante large de l'anse de Henlé**, où il **bloque le cotransporteur Na-K-2Cl (NKCC2)**.\n\nEn bloquant ce transporteur, il empêche la réabsorption du sodium à ce niveau → forte élimination d'eau et de sel (diurétique puissant). Cela réduit aussi le gradient osmotique cortico-papillaire.\n\nRepères des autres classes pour comparaison :\n- **Diurétiques thiazidiques** → tube contourné distal (cotransporteur Na-Cl).\n- **Diurétiques épargneurs de potassium / anti-aldostérone** → tube collecteur.\n- Le tube contourné proximal et la branche descendante ne sont PAS le site du furosémide.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques · Avril 2023]**\n\nQuel est le site d'action du furosémide ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le tubule contourné proximal",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La branche descendante de l'anse de Henlé",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La branche ascendante de l'anse de Henlé",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Le tubule contourné distal",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Le tubule collecteur",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : C**\n\nA. **Faux** — Le proximal n'est pas le site du furosémide.\nB. **Faux** — La branche descendante (perméable à l'eau) n'est pas concernée.\nC. **Valide/VRAI** — Le furosémide agit sur la branche ascendante de l'anse de Henlé (blocage du cotransporteur Na-K-2Cl).\nD. **Faux** — C'est le site des thiazidiques.\nE. **Faux** — C'est le site des épargneurs de potassium / anti-aldostérone."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Effets indésirables des diurétiques (anse vs thiazidiques) — Avril 2023 (Q12)",
      "annee": "Avril 2023 (2022-2023)",
      "rappel_cours": "Cette question compare les **effets indésirables communs** aux diurétiques de l'anse et aux diurétiques thiazidiques.\n\n**Point commun** : les deux entraînent une **hypokaliémie** (perte de potassium dans les urines), et aussi une hyponatrémie, une alcalose métabolique, une hyperuricémie.\n\n**Différences (donc NON communs)** :\n- **Calcémie** : les **thiazidiques** diminuent l'élimination du calcium → tendance à l'**hypercalcémie** ; les **diurétiques de l'anse** augmentent l'élimination du calcium → **hypocalcémie**. L'effet sur le calcium est donc opposé, pas commun.\n- **Ototoxicité** : propre aux **diurétiques de l'anse** (surtout à forte dose), pas aux thiazidiques.\n\n(Note : l'item E « hypertriglycéridémie » était neutralisé et a été retiré.)",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques · Avril 2023]**\n\nParmi les effets indésirables suivants, quels sont ceux communs entre les diurétiques de l'anse et les diurétiques thiazidiques ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'hypokaliémie",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "L'hypokaliémie",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "L'hypercalcémie",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Une ototoxicité",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : AB**\n\nA. **Valide/VRAI** — L'hypokaliémie est un effet indésirable commun aux deux classes.\nB. **Valide/VRAI** — Idem (item identique à A).\nC. **Faux** — Les thiazidiques donnent plutôt une hypercalcémie et les diurétiques de l'anse une hypocalcémie : effet non commun.\nD. **Faux** — L'ototoxicité est propre aux diurétiques de l'anse, pas aux thiazidiques.\n\n(Item E « hypertriglycéridémie » neutralisé, retiré.)"
        }
      ]
    },
    {
      "titre": "Anatomie — Anatomie rénale (néphron, vascularisation) — Mars 2024 (2023-2024) (Q1)",
      "annee": "Mars 2024 (2023-2024)",
      "rappel_cours": "L'**anatomie du rein** distingue deux zones : le **cortex** (en périphérie) et la **médullaire** (au centre, organisée en pyramides de Malpighi).\n\n**Où sont les glomérules ?** Les glomérules (unités de filtration) sont **toujours situés dans le cortex**, jamais dans la médullaire — y compris ceux des néphrons profonds (juxta-médullaires).\n\n**Nombre de néphrons** : chaque rein en contient environ **1 million**.\n\n**Pyramides de Malpighi** : elles contiennent les tubules rénaux et les tubes collecteurs.\n\n**Système porte artériel rénal** : la circulation rénale est particulière car le sang traverse **deux réseaux de capillaires en série** (capillaires glomérulaires puis capillaires péritubulaires), séparés par l'artériole efférente. C'est un système « porte » artériel.\n\n**Vasa recta** : ce sont de longs vaisseaux qui plongent dans la médullaire ; ils accompagnent les **anses de Henlé longues**, donc celles des néphrons **profonds (juxta-médullaires)**, et non des néphrons superficiels.",
      "questions": [
        {
          "enonce": "**[Anatomie · Anatomie rénale · Mars 2024]**\n\nA propos de l'anatomie rénale, indiquez la ou les propositions exactes :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Les glomérules des néphrons profonds sont situés dans la médullaire rénale externe",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Chaque rein contient environ un million de néphrons",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Les tubules rénaux sont situés dans les pyramides de Malpighi",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "La circulation sanguine rénale constitue un système porte artériel",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Les vasa recta irriguent les anses de Henlé des néphrons superficiels",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : BCD**\n\nA. **Faux** — Les glomérules sont toujours situés dans le cortex rénal, jamais dans la médullaire.\nB. **Valide** — Environ un million de néphrons par rein.\nC. **Valide** — Les tubules sont situés dans les pyramides de Malpighi.\nD. **Valide** — Le rein possède un système porte artériel (deux réseaux capillaires en série).\nE. **Faux** — Les vasa recta irriguent la médullaire et accompagnent les anses de Henlé longues, donc celles des néphrons juxta-médullaires (profonds)."
        }
      ]
    },
    {
      "titre": "Histologie — Schéma du glomérule rénal — Mars 2024 (2023-2024) (Q2)",
      "annee": "Mars 2024 (2023-2024)",
      "rappel_cours": "Cette question demande d'**annoter un schéma de glomérule rénal**.\n\n**Deux pôles du glomérule** :\n- Le **pôle vasculaire** : là où entrent/sortent l'artériole afférente et l'artériole efférente.\n- Le **pôle urinaire** : là où commence le tube contourné proximal, qui recueille l'urine primitive.\n\n**Capsule de Bowman** : elle entoure le glomérule et comporte deux feuillets :\n- Le **feuillet pariétal** (externe).\n- Le **feuillet viscéral** (interne), formé par les **podocytes**.\n\n**Podocytes** : cellules à prolongements (pédicelles) qui entourent les capillaires glomérulaires ; ils participent à la barrière de filtration.\n\n**Flocculus** : nom donné au peloton de capillaires glomérulaires.\n\n**Chambre glomérulaire (chambre urinaire)** : espace situé entre les deux feuillets de la capsule de Bowman, où s'accumule l'ultrafiltrat.",
      "questions": [
        {
          "enonce": "**[Histologie · Schéma du glomérule rénal · Mars 2024]**\n\nParmi les légendes proposées pour le schéma de glomérule rénal ci-dessous, cocher la ou les réponse(s) exactes :\n\n<img src=\"/prive-images/autres-annales/mars2024-q2.png\" alt=\"Schéma du glomérule rénal\" style=\"display:block;max-width:100%;height:auto;margin:10px auto;border:1px solid #e5e7eb;border-radius:8px;background:#fff;\" />",
          "items": [
            {
              "lettre": "A",
              "enonce": "Pôle vasculaire",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Feuillet viscéral de la capsule de Bowman",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Podocyte",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Flocculus",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Chambre glomérulaire",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : CDE**\n\nA. **Faux** — Il s'agit plutôt du pôle urinaire.\nB. **Faux** — C'est le feuillet pariétal.\nC. **Valide** — Podocyte.\nD. **Valide** — Flocculus (peloton capillaire).\nE. **Valide** — Chambre glomérulaire."
        }
      ]
    },
    {
      "titre": "Anatomie — Structure du testicule (albuginée, tubes séminifères) — Mars 2024 (2023-2024) (Q3)",
      "annee": "Mars 2024 (2023-2024)",
      "rappel_cours": "**Structure générale du testicule** :\n\n**Albuginée** : capsule conjonctive fibreuse, épaisse et résistante, qui enveloppe le testicule.\n\n**Corps d'Highmore (médiastin testiculaire)** : épaississement de l'albuginée situé au pôle postéro-supérieur du testicule, par où passent les vaisseaux et les canaux.\n\n**Fonctions du testicule** : il a une double fonction :\n- **Exocrine** : production des spermatozoïdes (spermatogenèse).\n- **Endocrine** : sécrétion de la testostérone (par les cellules de Leydig).\n\n**Lobules testiculaires** : le testicule est cloisonné en lobules par des septa partant de l'albuginée. Chaque lobule contient **1 à 3 tubes séminifères** (et non un seul).",
      "questions": [
        {
          "enonce": "**[Anatomie · Structure du testicule · Mars 2024]**\n\nParmi les propositions suivantes, indiquez celle(s) qui est (sont) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le testicule est enveloppé d'une capsule conjonctive appelée l'albuginée",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Le testicule a une fonction uniquement exocrine",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Le corps d'Highmore correspond à un épaississement de l'albuginée",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Chaque lobule testiculaire ne contient qu'un seul tube séminifère",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Aucune des propositions précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : AC**\n\nA. **Valide** — Le testicule est enveloppé par l'albuginée.\nB. **Faux** — Fonction à la fois exocrine et endocrine.\nC. **Valide** — Le corps d'Highmore est un épaississement de l'albuginée.\nD. **Faux** — Chaque lobule contient 1 à 3 tubes séminifères.\nE. **Faux**"
        }
      ]
    },
    {
      "titre": "Histologie — Épithélium séminifère (cellules de Sertoli et Leydig) — Mars 2024 (2023-2024) (Q4)",
      "annee": "Mars 2024 (2023-2024)",
      "rappel_cours": "**Histologie du tube séminifère** :\n\n**Épithélium séminifère** : c'est un épithélium **stratifié** (plusieurs couches) qui tapisse le tube séminifère et contient les cellules germinales à différents stades ainsi que les cellules de Sertoli. Ce n'est PAS un épithélium pavimenteux simple.\n\n**Cellules de Sertoli** : situées **dans le tube séminifère**, au sein de l'épithélium séminifère. Elles soutiennent et nourrissent les cellules germinales (cellules « nourricières »).\n\n**Cellules de Leydig** : situées dans l'**espace interstitiel** (entre les tubes séminifères), avec les vaisseaux et le tissu conjonctif. Elles sécrètent la **testostérone**.\n\n**Spermiogenèse** : dernière étape de la spermatogenèse, elle transforme les spermatides (issues de la **méiose**) en spermatozoïdes. Elle suit donc la méiose.",
      "questions": [
        {
          "enonce": "**[Histologie · Épithélium séminifère · Mars 2024]**\n\nParmi les propositions suivantes, indiquez celle(s) qui est (sont) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'épithélium séminifère est un épithélium pavimenteux simple",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La cellule de Sertoli se situe dans l'espace interstitiel testiculaire",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La cellule de Leydig sécrète la testostérone",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "La spermiogénèse suit la méiose",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Aucune des propositions précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : CD**\n\nA. **Faux** — C'est un épithélium stratifié.\nB. **Faux** — Les cellules de Sertoli se trouvent dans les tubes séminifères, au sein de l'épithélium séminifère. L'espace interstitiel contient surtout les cellules de Leydig, les vaisseaux et le tissu conjonctif.\nC. **Valide** — La cellule de Leydig sécrète la testostérone.\nD. **Valide** — La spermiogenèse suit la méiose.\nE. **Faux**"
        }
      ]
    },
    {
      "titre": "Pharmacologie — Diurétiques thiazidiques — Mars 2024 (2023-2024) (Q11)",
      "annee": "Mars 2024 (2023-2024)",
      "rappel_cours": "Les **diurétiques thiazidiques** (ex. hydrochlorothiazide) sont une classe de diurétiques importante.\n\n**Site d'action** : le **tube contourné distal** (et non le tube proximal ni le tube collecteur).\n\n**Mécanisme** : ils bloquent le **cotransporteur Na+/Cl-** situé dans le tube contourné distal, ce qui augmente l'élimination du sodium (effet diurétique et antihypertenseur).\n\n**À ne pas confondre** :\n- Le cotransporteur **Na+/K+/2Cl-** est bloqué par les **diurétiques de l'anse** (ex. furosémide), dans l'anse de Henlé.\n- Le tube collecteur est le site des **diurétiques épargneurs de potassium**.\n\n**Effet sur la concentration des urines** : les thiazidiques agissant dans le tube distal, ils **ne modifient pas** le pouvoir de concentration des urines (qui dépend surtout de l'anse de Henlé et du gradient médullaire).",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques thiazidiques · Mars 2024]**\n\nParmi les propositions suivantes, laquelle ou lesquelles correspondent au mécanisme d'action des diurétiques thiazidiques :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Ils agissent au niveau du tube contourné proximal",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Ils agissent au niveau du tube collecteur",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Ils bloquent un cotransporteur Na+/Cl-",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Ils bloquent un cotransporteur Na+/K+/Cl-",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Ils ne modifient pas la capacité de concentration des urines",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : CE**\n\nA. **Faux** — Les thiazidiques agissent au tube contourné distal.\nB. **Faux** — Le tube collecteur est le site des épargneurs de potassium et des antagonistes de l'aldostérone.\nC. **Valide** — Ils bloquent le cotransporteur Na+/Cl-.\nD. **Faux** — Ce cotransporteur (Na+/K+/2Cl-) est bloqué par les diurétiques de l'anse (furosémide) dans l'anse de Henlé.\nE. **Valide** — Ils ne modifient pas la capacité de concentration des urines."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Diurétiques d'épargne potassique — Mars 2024 (2023-2024) (Q12)",
      "annee": "Mars 2024 (2023-2024)",
      "rappel_cours": "Les **diurétiques d'épargne potassique** évitent la perte de potassium (contrairement aux thiazidiques et diurétiques de l'anse).\n\n**Site d'action** : la partie **distale du néphron**, c'est-à-dire le **tube distal terminal** et le **tube collecteur**. Ils n'agissent PAS dans l'anse de Henlé (site des diurétiques de l'anse comme le furosémide, qui bloque le cotransporteur Na+/K+/2Cl-).\n\n**Deux mécanismes différents (cibles distinctes)** :\n- Les **antagonistes de l'aldostérone** (ex. spironolactone) : ils **s'opposent aux effets de l'aldostérone** en bloquant son récepteur.\n- Les **bloqueurs du canal sodique épithélial (ENaC)** (ex. amiloride) : ils bloquent directement le canal sodique, sans passer par l'aldostérone.\n\nDonc tous les épargneurs de potassium **n'ont pas la même cible pharmacologique**.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques d'épargne potassique · Mars 2024]**\n\nParmi les propositions suivantes, laquelle ou lesquelles correspondent au mécanisme d'action des diurétiques d'épargne potassique :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Ils agissent au niveau de l'Anse de Henlé",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Ils agissent au niveau du tube collecteur",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Ils agissent au niveau du tube distal terminal",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Ils s'opposent aux effets de l'aldostérone",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Ils n'ont pas tous la même cible pharmacologique",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCDE**\n\nA. **Faux** — Les diurétiques de l'anse (ex. furosémide) agissent sur le cotransporteur Na+/K+/2Cl- ; les épargneurs de potassium n'agissent pas dans l'anse de Henlé.\nB. **Valide** — Ils agissent au niveau du tube collecteur.\nC. **Valide** — Ils agissent au niveau du tube distal terminal.\nD. **Valide** — Ils s'opposent aux effets de l'aldostérone (pour les antagonistes de l'aldostérone).\nE. **Valide** — Ils n'ont pas tous la même cible (antagonistes de l'aldostérone vs bloqueurs du canal sodique)."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Acétazolamide (inhibiteur de l'anhydrase carbonique) — Mars 2024 (2023-2024) (Q13)",
      "annee": "Mars 2024 (2023-2024)",
      "rappel_cours": "L'**acétazolamide** est un diurétique **inhibiteur de l'anhydrase carbonique**.\n\n**Site d'action** : le **tube contourné proximal** (et non l'anse de Henlé).\n\n**Mécanisme** : il **inhibe l'anhydrase carbonique**, enzyme nécessaire à la réabsorption des **bicarbonates (HCO3-)**. En bloquant cette enzyme, il **diminue la réabsorption des bicarbonates**, qui sont alors éliminés dans les urines (effet diurétique et alcalinisation des urines).\n\n**Indications** :\n- **Glaucome** (par voie locale/générale) : réduit la production d'humeur aqueuse.\n- Mal aigu des montagnes, certaines épilepsies, alcalinisation des urines.\n- **Pas d'indication dans l'HTA** (contrairement aux thiazidiques).",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Acétazolamide · Mars 2024]**\n\nParmi les propositions suivantes, laquelle ou lesquelles concernent l'acétazolamide :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Il agit au niveau de l'Anse de Henlé",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Il agit en inhibant l'anhydrase carbonique",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Il agit en diminuant l'absorption des ions bicarbonates",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Il est indiqué pour le traitement de l'hypertension artérielle",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Il est indiqué par voie locale pour le traitement du glaucome",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCE**\n\nA. **Faux** — L'acétazolamide agit surtout au tube proximal, pas dans l'anse de Henlé.\nB. **Valide** — Il inhibe l'anhydrase carbonique.\nC. **Valide** — Il diminue la réabsorption des bicarbonates.\nD. **Faux** — Il n'est pas utilisé pour l'HTA.\nE. **Valide** — Il est indiqué dans le glaucome."
        }
      ]
    },
    {
      "titre": "Biophysique/Imagerie — TDM vs IRM, colique néphrétique (calcul urétéral) — Mars 2024 (2023-2024) (Q20)",
      "annee": "Mars 2024 (2023-2024)",
      "rappel_cours": "Cette question demande de **reconnaître la technique d'imagerie** et d'analyser les images.\n\n**Comment différencier un TDM (scanner) d'une IRM ?** Regarder l'aspect de l'os :\n- Sur un **TDM (scanner)** : l'**os apparaît très blanc** (dense aux rayons X). Un TDM **sans injection** montre déjà bien les calculs (spontanément hyperdenses).\n- Sur une **IRM** : l'**os cortical apparaît noir** (peu de signal). Donc si les os sont blancs, ce n'est pas une IRM T1.\n\n**Signes à repérer sur ces images** :\n- **Dilatation du pyélon (bassinet)** : signe d'un obstacle en aval sur les voies urinaires.\n- **Calcul urétéral** : hyperdensité dans l'uretère, cause typique de la dilatation.\n- Un aspect **homogène** du rein = pas d'argument pour une masse rénale.",
      "questions": [
        {
          "enonce": "**[Biophysique/Imagerie · TDM et colique néphrétique · Mars 2024]**\n\nConcernant les images ci-dessous, indiquez la ou les proposition(s) exacte(s) :\n\n<img src=\"/prive-images/autres-annales/mars2024-q20.png\" alt=\"Coupes TDM abdomino-pelviennes\" style=\"display:block;max-width:100%;height:auto;margin:10px auto;border:1px solid #e5e7eb;border-radius:8px;background:#fff;\" />",
          "items": [
            {
              "lettre": "A",
              "enonce": "Il s'agit d'une IRM pondérée en T1",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Il s'agit d'un TDM sans injection",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Il existe une masse rénale gauche",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Il existe une dilatation du pyélon droit",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Il existe un calcul urétéral droit",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BDE**\n\nA. **Faux** — Ce n'est pas une IRM : les os sont très blancs, typique d'un TDM, alors que sur une IRM l'os apparaîtrait noir.\nB. **Valide** — TDM sans injection.\nC. **Faux** — Pas de masse : le rein paraît homogène.\nD. **Valide** — Il existe une dilatation du pyélon droit.\nE. **Valide** — Il existe un calcul urétéral droit."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Classes de diurétiques (efficacité salidiurétique) — Rattrapage juillet 2024 (Q1)",
      "annee": "Rattrapage juillet 2024",
      "rappel_cours": "On distingue 4 grandes classes de diurétiques, classées selon leur puissance (capacité à faire éliminer du sel et de l'eau) :\n\n**Diurétiques de l'anse** (furosémide) : ils agissent sur la branche ascendante large de l'anse de Henlé en bloquant le co-transporteur Na-K-2Cl. C'est le segment qui réabsorbe le plus de sodium (~25 %), donc ce sont **les diurétiques les plus puissants** (forte efficacité salidiurétique).\n\n**Diurétiques thiazidiques** : agissent sur le tube contourné distal (~5-10 % du Na), puissance moyenne.\n\n**Anti-aldostérones** (spironolactone) et **inhibiteurs du canal ENaC** (amiloride) : agissent sur le tube collecteur (~2-3 % du Na), ce sont des diurétiques faibles dits « épargneurs de potassium ».\n\nDonc la classe la plus salidiurétique = les diurétiques de l'anse.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Classes de diurétiques · Rattrapage juillet 2024]**\n\nParmi les 4 principales classes de diurétiques, laquelle possède la plus forte efficacité salidiurétique ? (QRU)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Les diurétiques thiazidiques",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Les diurétiques de l'anse de Henlé",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Les anti-aldostérones",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Les inhibiteurs du canal sodé épithélial (ENaC)",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B**\n\nA. **Faux** — Les thiazidiques (tube contourné distal) ont une puissance moyenne.\nB. **Valide** — Les diurétiques de l'anse bloquent le co-transporteur Na-K-2Cl sur la branche ascendante large, segment qui réabsorbe le plus de sodium : ce sont les plus salidiurétiques.\nC. **Faux** — Les anti-aldostérones sont des diurétiques faibles (tube collecteur).\nD. **Faux** — Les inhibiteurs du canal ENaC sont des diurétiques faibles, épargneurs de potassium."
        }
      ]
    },
    {
      "titre": "Anatomie/Histologie — Voies spermatiques intratesticulaires — Rattrapage juillet 2024 (Q2)",
      "annee": "Rattrapage juillet 2024",
      "rappel_cours": "Le trajet des spermatozoïdes se divise en voies **intratesticulaires** (à l'intérieur du testicule) et **extratesticulaires** (en dehors).\n\n**Voies intratesticulaires** (dans l'ordre) :\n- **Tubes séminifères** : lieu de fabrication des spermatozoïdes.\n- **Tubes droits** : courts segments rectilignes qui font la jonction.\n- **Rete testis** (réseau de Haller) : réseau de canaux dans le médiastin testiculaire.\n\n**Voies extratesticulaires** :\n- **Cônes efférents** puis **épididyme** (maturation), puis **canal déférent**, **vésicules séminales**, **canal éjaculateur**, urètre.\n\nLa question demande ce qui N'EST PAS une voie intratesticulaire : le **déférent** et le **canal éjaculateur** sont extratesticulaires.",
      "questions": [
        {
          "enonce": "**[Anatomie/Histologie · Voies spermatiques · Rattrapage juillet 2024]**\n\nLe(s)quel(s) des éléments suivants n'est (ne sont) pas une voie spermatique intratesticulaire ? (QRM)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le tube droit",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Le déférent",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Le rete testis",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le tube séminifère",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Le canal éjaculateur",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BE**\n\nA. **Faux** — Le tube droit est bien une voie intratesticulaire.\nB. **Valide** — Le canal déférent est une voie extratesticulaire : il n'est donc PAS intratesticulaire (réponse attendue).\nC. **Faux** — Le rete testis est intratesticulaire (situé dans le médiastin testiculaire).\nD. **Faux** — Le tube séminifère est intratesticulaire (lieu de la spermatogenèse).\nE. **Valide** — Le canal éjaculateur est extratesticulaire : il n'est donc PAS intratesticulaire (réponse attendue)."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Diurétiques thiazidiques (mécanisme et effets) — Rattrapage juillet 2024 (Q3)",
      "annee": "Rattrapage juillet 2024",
      "rappel_cours": "Les **diurétiques thiazidiques** (ex : hydrochlorothiazide) :\n\n- **Site d'action** : le **tube contourné distal**.\n- **Mécanisme** : ils inhibent le co-transporteur **sodium-chlore (Na-Cl)**, PAS le Na-K-2Cl (ça, c'est le diurétique de l'anse).\n- **Sur la concentration des urines** : le tube contourné distal ne participe pas au mécanisme de concentration/dilution médullaire ; les thiazidiques ne modifient donc pas la capacité de concentration des urines (contrairement aux diurétiques de l'anse qui, eux, l'altèrent).\n- **Effet sur le calcium** : ils AUGMENTENT la réabsorption de calcium → **hypercalcémie** (et baisse de la calciurie ; d'où leur intérêt dans les lithiases calciques).\n- **Effet sur le potassium** : comme ils amènent plus de sodium au tube collecteur, ils favorisent la fuite de K+ → **hypokaliémie**.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques thiazidiques · Rattrapage juillet 2024]**\n\nParmi les propositions suivantes concernant les diurétiques thiazidiques, la(les)quelle(s) est(sont) exacte(s) ? (QRM)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Ils agissent au niveau du tube contourné distal",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Ils agissent en inhibant un co-transport sodium-potassium-chlore",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Ils ne modifient pas la capacité de concentration des urines",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Ils peuvent provoquer une hypercalcémie",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Ils peuvent provoquer une hypokaliémie",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ACDE**\n\nA. **Valide** — Site d'action = tube contourné distal.\nB. **Faux** — Ils inhibent le co-transport sodium-chlore (Na-Cl), et non le sodium-potassium-chlore (Na-K-2Cl, propre aux diurétiques de l'anse).\nC. **Valide** — Le tube contourné distal n'intervient pas dans la concentration des urines ; les thiazidiques ne l'altèrent donc pas.\nD. **Valide** — Ils augmentent la réabsorption de calcium et peuvent provoquer une hypercalcémie.\nE. **Valide** — En augmentant l'arrivée de sodium au tube collecteur, ils favorisent la fuite de potassium (hypokaliémie)."
        }
      ]
    },
    {
      "titre": "Histologie — Épithéliums des voies spermatiques (question neutralisée) — Rattrapage juillet 2024 (Q4)",
      "annee": "Rattrapage juillet 2024",
      "rappel_cours": "**Question neutralisée** par le jury (elle ne compte pas dans la note), mais elle reste un bon rappel histologique.\n\nÉpithéliums des différents segments des voies spermatiques :\n- **Épididyme** : épithélium **prismatique (cylindrique) pseudostratifié** avec stéréocils.\n- **Tubes droits** : épithélium **cubique simple**.\n- **Rete testis** : épithélium **pavimenteux/cubique simple** (aplati).\n- **Canal déférent** : épithélium **prismatique pseudostratifié** avec stéréocils, entouré d'une épaisse musculeuse.\n\nAttention : les coches de correction de cette question sont incohérentes (plusieurs items marqués « Valide » se contredisent avec « Aucune des propositions »), ce qui explique probablement la neutralisation.",
      "questions": [
        {
          "enonce": "**[Histologie · Épithéliums des voies spermatiques · Rattrapage juillet 2024]**\n\n_Question neutralisée._\n\nParmi les propositions suivantes, indiquez la(les) proposition(s) exacte(s) : (QRM)",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'épididyme a un épithélium prismatique pseudostratifié",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Les tubes droits ont un épithélium cubique simple",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Le rete testis a un épithélium pavimenteux simple",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Le canal déférent a un épithélium prismatique pseudostratifié",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Aucune des propositions précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Question neutralisée** (ne compte pas dans la notation).\n\nA. **Valide** — L'épididyme présente un épithélium prismatique pseudostratifié avec stéréocils.\nB. **Valide** — Les tubes droits ont un épithélium cubique simple.\nC. **Valide** — Le rete testis a un épithélium pavimenteux (aplati) simple.\nD. **Valide** — Le canal déférent a un épithélium prismatique pseudostratifié.\nE. **Faux** — Plusieurs propositions ci-dessus sont exactes."
        }
      ]
    },
    {
      "titre": "Anatomie/Histologie — Vésicules séminales et prostate — Rattrapage juillet 2024 (Q5)",
      "annee": "Rattrapage juillet 2024",
      "rappel_cours": "Rappels sur les glandes annexes de l'appareil génital masculin :\n\n**Vésicules séminales** :\n- Elles sont **androgéno-dépendantes** (leur activité dépend de la testostérone).\n- Elles produisent un liquide riche en **fructose** (énergie pour les spermatozoïdes) et représentent la plus grande partie du sperme.\n\n**Prostate** :\n- Les glandes prostatiques sont organisées en **3 groupes concentriques** autour de l'urètre : glandes muqueuses (péri-urétrales, internes), sous-muqueuses (intermédiaires) et principales (externes).\n- Les sécrétions prostatiques représentent environ **15-30 %** du volume de l'éjaculat (pas seulement 5 %).",
      "questions": [
        {
          "enonce": "**[Anatomie/Histologie · Vésicules séminales et prostate · Rattrapage juillet 2024]**\n\nParmi les propositions suivantes, indiquez la proposition exacte : (QRU)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Les vésicules séminales ne sont pas androgénodépendantes",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Les vésicules séminales sont entourées d'une capsule fibro-élastique",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Les glandes prostatiques sont réparties en 3 groupes de glandes concentriques",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Le liquide séminal est formé par seulement 5% des sécrétions prostatiques",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Aucune des propositions précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : C**\n\nA. **Faux** — Les vésicules séminales sont au contraire androgéno-dépendantes.\nB. **Faux** — Ce n'est pas la caractéristique retenue (la capsule fibro-élastique n'est pas l'élément exact ici).\nC. **Valide** — Les glandes prostatiques sont bien organisées en 3 groupes de glandes concentriques autour de l'urètre.\nD. **Faux** — Les sécrétions prostatiques représentent environ 15-30 % de l'éjaculat, pas 5 %.\nE. **Faux** — La proposition C est exacte."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Effets indésirables des diurétiques de l'anse — Rattrapage juillet 2024 (Q11)",
      "annee": "Rattrapage juillet 2024",
      "rappel_cours": "Les **diurétiques de l'anse** (furosémide) sont très puissants ; leurs effets indésirables découlent de la forte perte d'eau et d'électrolytes :\n\n- **Mictions impérieuses / polyurie** : effet direct de la forte diurèse.\n- **Hypokaliémie** (et non hyperkaliémie) : ils font FUIR le potassium (comme les thiazidiques).\n- **Hypocalcémie** : contrairement aux thiazidiques, ils AUGMENTENT l'élimination urinaire de calcium → hypocalcémie et hypercalciurie.\n- **Hyponatrémie** : perte de sodium.\n- **Alcalose métabolique** (dite « de contraction ») : perte d'H+ et de chlore, et contraction volémique.\n\nMoyen mnémo : diurétique de l'anse = perte de tout (Na, K, Ca, Cl, H2O) → hypoNa, hypoK, hypoCa, alcalose.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Effets indésirables des diurétiques de l'anse · Rattrapage juillet 2024]**\n\nQuel(s) effet(s) indésirable(s) parmi les suivants peut(peuvent) être observé(s) lors d'un traitement par diurétiques de l'anse ? (QRM)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Des mictions impérieuses",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Une hyperkaliémie",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Une hypocalcémie",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Une hyponatrémie",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Une alcalose métabolique",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ACDE**\n\nA. **Valide** — La forte diurèse peut provoquer des mictions impérieuses.\nB. **Faux** — Les diurétiques de l'anse font FUIR le potassium : ils donnent une hypokaliémie, pas une hyperkaliémie.\nC. **Valide** — Ils augmentent l'élimination urinaire de calcium → hypocalcémie.\nD. **Valide** — La perte de sodium peut entraîner une hyponatrémie.\nE. **Valide** — Ils provoquent une alcalose métabolique dite de contraction (perte d'H+ et de Cl-)."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Indications des diurétiques thiazidiques (question neutralisée) — Rattrapage juillet 2024 (Q12)",
      "annee": "Rattrapage juillet 2024",
      "rappel_cours": "**Question neutralisée** par le jury (elle ne compte pas), mais utile à réviser.\n\n**Indications des diurétiques thiazidiques :**\n- **Hypertension artérielle (HTA)** : indication de première ligne (ils diminuent la volémie et ont un effet vasodilatateur au long cours).\n- **Lithiases urinaires calciques récidivantes avec hypercalciurie idiopathique** : ils diminuent la calciurie, ce qui réduit la formation de calculs de calcium.\n\n**NE sont PAS des indications des thiazidiques :**\n- L'hypertension intracrânienne, l'insuffisance cardiaque aiguë et l'œdème aigu du poumon (OAP) : ces situations d'urgence relèvent des **diurétiques de l'anse** (action rapide et puissante), pas des thiazidiques.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Indications des thiazidiques · Rattrapage juillet 2024]**\n\n_Question neutralisée._\n\nQuelle(s) indication(s) parmi les suivantes concerne(nt) les diurétiques thiazidiques ? (QRM)",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'hypertension artérielle",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "L'hypertension intracrânienne",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "L'insuffisance cardiaque aigüe",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "L'œdème aigu du poumon",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Les lithiases urinaires récidivantes avec hypercalciurie idiopathique",
              "is_correct": true
            }
          ],
          "correction": "**Question neutralisée** (ne compte pas dans la notation).\n\nA. **Valide** — L'HTA est une indication de première ligne des thiazidiques.\nB. **Faux** — L'hypertension intracrânienne n'est pas une indication des thiazidiques.\nC. **Faux** — L'insuffisance cardiaque aiguë relève des diurétiques de l'anse.\nD. **Faux** — L'OAP relève des diurétiques de l'anse (action rapide).\nE. **Valide** — Les thiazidiques diminuent la calciurie, indiqués dans les lithiases calciques récidivantes avec hypercalciurie idiopathique."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Interactions/toxicités des diurétiques thiazidiques (question neutralisée) — Rattrapage juillet 2024 (Q13)",
      "annee": "Rattrapage juillet 2024",
      "rappel_cours": "**Question neutralisée** par le jury (elle ne compte pas), mais importante pour les interactions médicamenteuses.\n\nComme les thiazidiques provoquent une **hypokaliémie** et peuvent altérer la fonction rénale, les associations à risque sont :\n- **+ Digitaliques** : l'hypokaliémie majore la toxicité des digitaliques → risque d'**arythmies**.\n- **+ Lithium** : les thiazidiques diminuent l'élimination rénale du lithium → **augmentation de la lithémie** et risque de toxicité.\n- **+ AINS (anti-inflammatoires non stéroïdiens)** : baisse de la perfusion rénale → risque d'**insuffisance rénale aiguë**.\n\nÀ l'inverse :\n- L'**ototoxicité avec les aminosides** est plutôt liée aux diurétiques de **l'anse** (pas aux thiazidiques).\n- Le **risque d'hyperkaliémie avec les IEC** concerne les diurétiques **épargneurs de potassium** (anti-aldostérones), pas les thiazidiques (qui font baisser le K+).",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Toxicités d'association des thiazidiques · Rattrapage juillet 2024]**\n\n_Question neutralisée._\n\nQuelle(s) toxicité(s) peut(peuvent) être observée(s) en cas d'association avec les diurétiques thiazidiques ? (QRM)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Une augmentation du risque d'arythmies avec les digitaliques",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Une augmentation du risque de toxicité du lithium",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Une augmentation du risque d'insuffisance rénale aigüe en cas d'association avec des anti-inflammatoires non stéroïdiens",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Une augmentation du risque d'ototoxicité en cas d'association avec des aminosides",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Une augmentation du risque d'hyperkaliémie en cas d'association avec des inhibiteurs de l'enzyme de conversion",
              "is_correct": false
            }
          ],
          "correction": "**Question neutralisée** (ne compte pas dans la notation).\n\nA. **Valide** — L'hypokaliémie induite majore la toxicité des digitaliques (arythmies).\nB. **Valide** — Les thiazidiques diminuent l'élimination du lithium → augmentation de sa toxicité.\nC. **Valide** — Association aux AINS = risque d'insuffisance rénale aiguë (baisse de perfusion rénale).\nD. **Faux** — L'ototoxicité avec les aminosides est propre aux diurétiques de l'anse, pas aux thiazidiques.\nE. **Faux** — Le risque d'hyperkaliémie avec les IEC concerne les épargneurs de potassium ; les thiazidiques font baisser le potassium."
        }
      ]
    },
    {
      "titre": "Anatomie — Pelvis féminin (schéma 1) — Mars 2025 (Q2)",
      "annee": "Mars 2025",
      "rappel_cours": "Le **pelvis féminin** en coupe sagittale médiane montre, d'avant en arrière, la vessie, l'utérus et le rectum.\n\n**Le péritoine** est la séreuse qui tapisse la cavité pelvienne. Il descend derrière la vessie, remonte sur la face antérieure de l'utérus (formant le **cul-de-sac vésico-utérin**), recouvre le fond utérin, puis redescend derrière l'utérus et le vagin pour tapisser la **face ventrale (antérieure) de l'ampoule rectale** (formant le **cul-de-sac recto-utérin ou de Douglas**, point le plus déclive de la cavité).\n\n- Le **périnée** est la région située SOUS le plancher pelvien (muscles élévateurs de l'anus) : ce n'est pas ce que montre un schéma de coupe pelvienne topographique haute.\n- La **ligne de réflexion** du péritoine est l'endroit où la séreuse « se replie » d'un organe à l'autre.\n- Les **annexes utérines** (trompes + ovaires) soulèvent le péritoine et forment le **ligament large**.",
      "questions": [
        {
          "enonce": "**[Anatomie · Pelvis féminin · Mars 2025]**\n\nA propos de l'anatomie topographique du pelvis chez la femme (schéma 1), indiquez la ou les propositions exactes :\n<img src=\"/prive-images/autres-annales/mars2025-q2.png\" alt=\"Schéma 1 — pelvis féminin\" style=\"display:block;max-width:100%;height:auto;margin:10px auto;border:1px solid #e5e7eb;border-radius:8px;background:#fff;\" />",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le schéma 1 identifie les structures du périnée",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Le péritoine est figuré avec sa ligne de réflexion latérale",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Le péritoine est soulevé par les annexes utérins",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Le péritoine tapisse la face ventrale de l'ampoule rectale",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Aucune des propositions précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : BCD**\n\nA. **Faux** — Le schéma est une coupe topographique du pelvis, il ne détaille pas les structures du périnée (situé plus bas, sous le plancher pelvien).\nB. **Valide** — Le péritoine y est représenté avec sa ligne de réflexion latérale.\nC. **Valide** — Les annexes utérines (trompes et ovaires) soulèvent le péritoine (ligament large).\nD. **Valide** — Le péritoine descend tapisser la face ventrale (antérieure) de l'ampoule rectale, formant le cul-de-sac recto-utérin.\nE. **Faux** — Plusieurs propositions sont exactes."
        }
      ]
    },
    {
      "titre": "Anatomie — Pelvis féminin (schéma 2) — Mars 2025 (Q3)",
      "annee": "Mars 2025",
      "rappel_cours": "Question d'annotation d'un **schéma du pelvis féminin** où l'étudiant doit reconnaître les structures numérotées de 1 à 4.\n\nDans cette question, **toutes les correspondances proposées (1, 2, 3, 4) sont fausses** : la seule réponse exacte est donc « Aucune des propositions précédentes n'est exacte ».\n\nPoints de repère utiles pour ce type de schéma :\n- Le **plexus hypogastrique** est un réseau nerveux végétatif situé de part et d'autre du rectum.\n- L'**artère iliaque interne (hypogastrique)** naît de la bifurcation de l'artère iliaque commune et vascularise le pelvis.\n- Le **muscle transverse profond du périnée** appartient au plan profond du périnée antérieur.\n- Il faut toujours relire l'orientation du schéma avant de valider une flèche.",
      "questions": [
        {
          "enonce": "**[Anatomie · Pelvis féminin · Mars 2025]**\n\nA propos de l'anatomie topographique du pelvis chez la femme (schéma 2), indiquez la ou les propositions exactes :\n<img src=\"/prive-images/autres-annales/mars2025-q3.png\" alt=\"Schéma 2 — pelvis féminin\" style=\"display:block;max-width:100%;height:auto;margin:10px auto;border:1px solid #e5e7eb;border-radius:8px;background:#fff;\" />",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le 1 indique une branche nerveuse du plexus hypogastrique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "L'artère iliaque interne (artère hypogastrique) est indiquée en 2",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Le 3 indique le muscle transverse profond du périnée",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le 4 indique le péritoine",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Aucune des propositions précédentes n'est exacte",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : E**\n\nA. **Faux** — Le repère 1 ne correspond pas à une branche nerveuse du plexus hypogastrique.\nB. **Faux** — Le repère 2 n'indique pas l'artère iliaque interne.\nC. **Faux** — Le repère 3 n'indique pas le muscle transverse profond du périnée.\nD. **Faux** — Le repère 4 n'indique pas le péritoine.\nE. **Valide** — Toutes les correspondances proposées étant fausses, la seule réponse exacte est « Aucune des propositions précédentes »."
        }
      ]
    },
    {
      "titre": "Anatomie — Pelvis masculin (schéma 3) — Mars 2025 (Q4)",
      "annee": "Mars 2025",
      "rappel_cours": "Le **pelvis masculin** en coupe sagittale montre, d'avant en arrière, la vessie, la prostate et le rectum, avec les conduits déférents et les vésicules séminales en arrière de la vessie.\n\n- Le **cul-de-sac recto-vésical** (de Douglas de l'homme) est le repli péritonéal le plus déclive, situé entre la vessie et le rectum.\n- Le **conduit (canal) déférent** transporte les spermatozoïdes de l'épididyme vers l'urètre ; sa portion terminale dilatée est l'**ampoule du conduit déférent**.\n- L'**ampoule rectale** est la partie dilatée du rectum juste au-dessus du canal anal.\n\nDans cette question, les repères 1 (cul-de-sac recto-vésical) et 4 (conduit déférent) sont correctement identifiés ; les repères 2 et 3 sont mal attribués.",
      "questions": [
        {
          "enonce": "**[Anatomie · Pelvis masculin · Mars 2025]**\n\nA propos de l'anatomie topographique du pelvis chez l'homme (schéma 3), indiquez la ou les propositions exactes :\n<img src=\"/prive-images/autres-annales/mars2025-q4.png\" alt=\"Schéma 3 — pelvis masculin\" style=\"display:block;max-width:100%;height:auto;margin:10px auto;border:1px solid #e5e7eb;border-radius:8px;background:#fff;\" />",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le 1 situe le cul-de-sac recto-vésical",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Le 2 indique l'ampoule du conduit déférent",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Le 3 indique l'ampoule rectale",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le 4 indique le conduit déférent",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Aucune des propositions précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : AD**\n\nA. **Valide** — Le repère 1 situe bien le cul-de-sac recto-vésical, repli péritonéal le plus déclive entre vessie et rectum.\nB. **Faux** — Le repère 2 ne correspond pas à l'ampoule du conduit déférent.\nC. **Faux** — Le repère 3 ne correspond pas à l'ampoule rectale.\nD. **Valide** — Le repère 4 indique le conduit (canal) déférent.\nE. **Faux** — Deux propositions sont exactes."
        }
      ]
    },
    {
      "titre": "Anatomie — Testicule, albuginée et corps d'Highmore — Mars 2025 (Q5)",
      "annee": "Mars 2025",
      "rappel_cours": "Le **testicule** est l'organe génital masculin, à la fois exocrine (production de spermatozoïdes) et endocrine (sécrétion de testostérone par les cellules de Leydig).\n\n- L'**albuginée** est la capsule conjonctive fibreuse et résistante qui enveloppe le testicule.\n- Le **corps (ou médiastinum) d'Highmore** correspond à un **épaississement de l'albuginée** au pôle postéro-supérieur, où convergent les canaux (rete testis).\n- Le testicule a **deux fonctions** : exocrine ET endocrine (donc « uniquement exocrine » est faux).\n- C'est le **pôle inférieur** du testicule qui est relié au scrotum par le **gubernaculum testis** (ligament scrotal), et non le pôle supérieur.",
      "questions": [
        {
          "enonce": "**[Anatomie · Testicule · Mars 2025]**\n\nParmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le testicule est enveloppé d'une capsule conjonctive appelée l'albuginée",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Le testicule a une fonction uniquement exocrine",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Le corps d'Highmore correspond à un épaississement de l'albuginée",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Le pôle supérieur du testicule est fixé au scrotum",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Aucune des propositions précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : AC**\n\nA. **Valide** — Le testicule est entouré de l'albuginée, capsule conjonctive fibreuse.\nB. **Faux** — Le testicule a une double fonction : exocrine (spermatogenèse) ET endocrine (testostérone).\nC. **Valide** — Le corps d'Highmore (médiastinum testis) est un épaississement de l'albuginée où converge le rete testis.\nD. **Faux** — C'est le pôle inférieur qui est fixé au scrotum par le gubernaculum testis, pas le pôle supérieur.\nE. **Faux** — Deux propositions sont exactes."
        }
      ]
    },
    {
      "titre": "Histologie — Épithélium séminifère, cellules de Leydig et Sertoli — Mars 2025 (Q6)",
      "annee": "Mars 2025",
      "rappel_cours": "Le **tube séminifère** est bordé par l'**épithélium séminifère**, un épithélium **complexe (pluristratifié)** contenant les cellules germinales à différents stades et les cellules de Sertoli — ce n'est PAS un épithélium pavimenteux simple.\n\n- La **cellule de Leydig** se situe dans le **tissu interstitiel** (entre les tubes séminifères) et sécrète la **testostérone**.\n- La **cellule de Sertoli** est une cellule de soutien intratubulaire : elle nourrit et protège les cellules germinales, forme la barrière hémato-testiculaire et sécrète l'inhibine et l'ABP — mais **pas** la testostérone.\n- Le **spermatozoïde testiculaire n'est pas encore fécondant** : il acquiert sa mobilité et son pouvoir fécondant lors de la maturation dans l'épididyme puis de la capacitation dans les voies génitales féminines.",
      "questions": [
        {
          "enonce": "**[Histologie · Testicule · Mars 2025]**\n\nParmi les propositions suivantes, indiquez la ou les proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'épithélium séminifère est un épithélium pavimenteux simple",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La cellule de Leydig se situe dans l'espace interstitiel testiculaire",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La cellule de Sertoli sécrète la testostérone",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le spermatozoïde testiculaire est fécondant",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Aucune des propositions précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B**\n\nA. **Faux** — L'épithélium séminifère est un épithélium complexe (pluristratifié), pas pavimenteux simple.\nB. **Valide** — La cellule de Leydig siège dans le tissu interstitiel entre les tubes séminifères et sécrète la testostérone.\nC. **Faux** — C'est la cellule de Leydig qui sécrète la testostérone ; la cellule de Sertoli sécrète notamment l'inhibine et l'ABP.\nD. **Faux** — Le spermatozoïde testiculaire n'est pas encore fécondant (maturation épididymaire puis capacitation nécessaires).\nE. **Faux** — La proposition B est exacte."
        }
      ]
    },
    {
      "titre": "Histologie/Anatomie — Voies spermatiques intratesticulaires — Mars 2025 (Q7)",
      "annee": "Mars 2025",
      "rappel_cours": "Les **voies spermatiques** conduisent les spermatozoïdes du testicule vers l'urètre. On distingue les voies **intratesticulaires** et **extratesticulaires**.\n\nVoies **intratesticulaires** (DANS le testicule) :\n- les **tubes droits** (tubuli recti),\n- le **rete testis** (réseau de Haller) dans le corps d'Highmore.\n\nVoies **extratesticulaires** (HORS du testicule) :\n- les cônes efférents, l'**épididyme**, le **canal (conduit) déférent**, puis le **canal éjaculateur**.\n\nLa question demande celles qui NE SONT PAS intratesticulaires : ce sont donc le **canal déférent** et le **canal éjaculateur** (réponses exactes). Le tube droit et le rete testis sont, eux, bien intratesticulaires.",
      "questions": [
        {
          "enonce": "**[Histologie/Anatomie · Voies spermatiques · Mars 2025]**\n\nLa ou lesquelle(s) n'est ou ne sont pas une voie spermatique intratesticulaire, indiquez la ou les proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le tube droit",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Le canal déférent",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Le rete testis",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le canal éjaculateur",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Aucune des propositions précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : BD**\n\nLa question demande les voies qui NE sont PAS intratesticulaires.\nA. **Faux** — Le tube droit est une voie intratesticulaire.\nB. **Valide** — Le canal déférent est extratesticulaire.\nC. **Faux** — Le rete testis (dans le corps d'Highmore) est intratesticulaire.\nD. **Valide** — Le canal éjaculateur est extratesticulaire.\nE. **Faux** — Deux propositions sont exactes."
        }
      ]
    },
    {
      "titre": "Histologie — Appareil juxta-glomérulaire (schéma) — Mars 2025 (Q8)",
      "annee": "Mars 2025",
      "rappel_cours": "Question d'**annotation d'un schéma de l'appareil juxta-glomérulaire** et du glomérule ; l'étudiant doit identifier les structures désignées par les flèches 1 à 5.\n\nRepères clés du glomérule et de l'appareil juxta-glomérulaire :\n- Les **podocytes** sont les cellules du feuillet viscéral de la capsule de Bowman, appliquées sur les capillaires.\n- La **barrière de filtration glomérulaire** comprend l'endothélium fenêtré, la membrane basale et les pédicelles des podocytes.\n- L'**espace (chambre) glomérulaire** est l'espace de Bowman où se collecte l'urine primitive.\n- L'**artériole afférente** amène le sang au glomérule (repère n°4, exact ici).\n- Le **tube contourné proximal** fait suite au pôle urinaire du glomérule.\n\nSeule la flèche n°4 (artériole afférente) est correctement annotée.",
      "questions": [
        {
          "enonce": "**[Histologie · Appareil juxta-glomérulaire · Mars 2025]**\n\nParmi les propositions d'annotations du schéma ci-dessous (Schéma de l'appareil juxta-glomérulaire), laquelle ou lesquelles sont EXACTES ?\n<img src=\"/prive-images/autres-annales/mars2025-q8.png\" alt=\"Schéma de l'appareil juxta-glomérulaire\" style=\"display:block;max-width:100%;height:auto;margin:10px auto;border:1px solid #e5e7eb;border-radius:8px;background:#fff;\" />",
          "items": [
            {
              "lettre": "A",
              "enonce": "La flèche n°1 indique les podocytes",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La flèche n°2 indique la barrière de filtration glomérulaire",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La flèche n°3 indique l'espace glomérulaire",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "La flèche n°4 indique l'artériole afférente",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "La flèche n°5 indique le tube contourné proximal",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nA. **Faux** — La flèche n°1 n'indique pas les podocytes.\nB. **Faux** — La flèche n°2 n'indique pas la barrière de filtration glomérulaire.\nC. **Faux** — La flèche n°3 n'indique pas l'espace glomérulaire.\nD. **Valide** — La flèche n°4 indique bien l'artériole afférente, qui amène le sang au glomérule.\nE. **Faux** — La flèche n°5 n'indique pas le tube contourné proximal."
        }
      ]
    },
    {
      "titre": "Histologie — Barrière glomérulaire en microscopie électronique — Mars 2025 (Q9)",
      "annee": "Mars 2025",
      "rappel_cours": "**Photographie de microscopie électronique de la barrière de filtration glomérulaire** à annoter (flèches A à E).\n\nLa **barrière de filtration** est constituée de trois couches, de la lumière capillaire vers l'espace urinaire :\n- l'**endothélium capillaire fenêtré** du floculus (flèche C, exacte),\n- la **membrane basale glomérulaire**,\n- les **pédicelles des podocytes** (flèche D, exacte), séparés par les **fentes de filtration** fermées par un diaphragme (flèche E, exacte).\n\nAttention aux pièges : il n'y a **pas de cellule urothéliale** dans le glomérule (l'urothélium tapisse les voies urinaires excrétrices), et le **feuillet pariétal** de la capsule de Bowman n'est pas la structure pointée par A ici.",
      "questions": [
        {
          "enonce": "**[Histologie · Barrière glomérulaire · Mars 2025]**\n\nParmi les propositions d'annotations pour la photographie de microscopie électronique ci-dessous (barrière glomérulaire), laquelle ou lesquelles sont EXACTES ?\n<img src=\"/prive-images/autres-annales/mars2025-q9.png\" alt=\"Microscopie électronique de la barrière glomérulaire\" style=\"display:block;max-width:100%;height:auto;margin:10px auto;border:1px solid #e5e7eb;border-radius:8px;background:#fff;\" />",
          "items": [
            {
              "lettre": "A",
              "enonce": "La flèche A indique le feuillet pariétal de la chambre glomérulaire",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La flèche B indique un pore d'une cellule urothéliale",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La flèche C indique l'endothélium capillaire du floculus",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "La flèche D indique un pédicelle de podocyte",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "La flèche E indique la fente de filtration glomérulaire",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : CDE**\n\nA. **Faux** — La flèche A n'indique pas le feuillet pariétal de la chambre glomérulaire.\nB. **Faux** — Il n'y a pas de cellule urothéliale dans le glomérule ; l'urothélium tapisse les voies excrétrices.\nC. **Valide** — La flèche C indique l'endothélium capillaire fenêtré du floculus.\nD. **Valide** — La flèche D indique un pédicelle de podocyte.\nE. **Valide** — La flèche E indique la fente de filtration entre deux pédicelles."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Site d'action des diurétiques d'épargne potassique — Mars 2025 (Q11)",
      "annee": "Mars 2025",
      "rappel_cours": "Les **diurétiques d'épargne potassique** (anti-aldostérone comme la spironolactone, ou inhibiteurs directs du canal ENaC comme l'amiloride) agissent sur la partie **terminale du néphron**.\n\nLeur site d'action est le **tube contourné distal** et le **tube collecteur**, au niveau des **cellules principales**, là où l'aldostérone stimule la réabsorption de Na⁺ (via ENaC) et la sécrétion de K⁺.\n\nEn bloquant ce mécanisme, ils augmentent l'élimination du Na⁺ tout en **retenant le potassium** (d'où le nom « épargne potassique » et le risque d'**hyperkaliémie**).\n\n- La **branche descendante de l'anse** de Henlé n'a pas de rôle actif dans le transport de Na⁺ (perméable à l'eau).\n- La branche **ascendante** est la cible des diurétiques de l'anse.\n- Le **tube contourné proximal** est la cible des inhibiteurs de l'anhydrase carbonique.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques d'épargne potassique · Mars 2025]**\n\nQuel est ou quels sont le/les site(s) d'action des diurétiques d'épargne potassique ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "La branche descendante de l'anse de Henlé",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La branche ascendante de l'anse de Henlé",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Le tube contourné proximal",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le tube contourné distal",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Le tube collecteur",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : DE**\n\nA. **Faux** — La branche descendante de l'anse (perméable à l'eau) n'est pas leur site d'action.\nB. **Faux** — La branche ascendante est la cible des diurétiques de l'anse.\nC. **Faux** — Le tube contourné proximal est la cible des inhibiteurs de l'anhydrase carbonique.\nD. **Valide** — Le tube contourné distal fait partie de leur site d'action.\nE. **Valide** — Le tube collecteur (cellules principales) est leur site d'action principal, là où agit l'aldostérone."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Diurétiques de l'anse — Mars 2025 (Q12)",
      "annee": "Mars 2025",
      "rappel_cours": "Les **diurétiques de l'anse** (furosémide, bumétanide) sont les diurétiques les plus puissants.\n\n- Ils agissent sur la **branche large ascendante de l'anse de Henlé** en bloquant le **co-transporteur Na⁺/K⁺/2Cl⁻ (NKCC2)**.\n- En bloquant la réabsorption de NaCl à ce niveau, ils **dissipent le gradient cortico-papillaire** et **empêchent la concentration des urines**.\n- Ils **augmentent l'excrétion de calcium** (risque d'**hypocalcémie**, PAS d'hypercalcémie) — à l'inverse des thiazidiques.\n- Ils **conservent leur efficacité en cas d'insuffisance rénale**, ce qui les rend précieux chez ces patients.\n\nLa branche **descendante** de l'anse n'est pas leur cible (elle est imperméable au Na⁺).",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques de l'anse · Mars 2025]**\n\nParmi les propositions suivantes, laquelle ou lesquelles est/sont exacte(s) ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Les diurétiques de l'anse ont pour cible un transporteur sodium/potassium/chlorure",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Les diurétiques de l'anse empêchent la concentration des urines",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Les diurétiques de l'anse peuvent provoquer une hypercalcémie",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Les diurétiques de l'anse agissent au niveau de la branche descendante de l'anse de Henlé",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Les diurétiques de l'anse conservent une activité chez les patients insuffisants rénaux",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ABE**\n\nA. **Valide** — Ils bloquent le co-transporteur Na⁺/K⁺/2Cl⁻ (NKCC2).\nB. **Valide** — En dissipant le gradient cortico-papillaire, ils empêchent la concentration des urines.\nC. **Faux** — Ils augmentent l'excrétion de calcium et exposent à une hypocalcémie, pas à une hypercalcémie (c'est le contraire des thiazidiques).\nD. **Faux** — Ils agissent sur la branche large ASCENDANTE, pas descendante.\nE. **Valide** — Ils gardent leur efficacité chez l'insuffisant rénal."
        }
      ]
    },
    {
      "titre": "Pharmacologie — Effets indésirables communs anse/thiazidiques — Mars 2025 (Q13)",
      "annee": "Mars 2025",
      "rappel_cours": "Les **diurétiques de l'anse** et les **diurétiques thiazidiques** partagent plusieurs effets indésirables car tous deux augmentent l'arrivée de Na⁺ dans le tube collecteur, ce qui accroît la sécrétion de K⁺ et de H⁺ :\n\n- **Hypokaliémie** (perte urinaire de potassium) — commun.\n- **Alcalose métabolique** (perte de H⁺ et contraction volémique) — commun.\n- **Hyponatrémie** (déplétion sodée) — commun.\n\nEffets qui les DISTINGUENT :\n- Les **thiazidiques** donnent une **hypercalcémie** (rétention de calcium), alors que les diurétiques de l'anse donnent plutôt une hypocalcémie : donc l'hypercalcémie n'est PAS un effet commun.\n- L'**ototoxicité** est propre aux **diurétiques de l'anse** (à forte dose), pas aux thiazidiques : donc non commune.",
      "questions": [
        {
          "enonce": "**[Pharmacologie · Diurétiques · Mars 2025]**\n\nQuels sont les effets indésirables communs entre les diurétiques de l'anse et les diurétiques thiazidiques ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'hypercalcémie",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "L'hypokaliémie",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "L'alcalose métabolique",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "L'hyponatrémie",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "L'ototoxicité",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : BCD**\n\nA. **Faux** — L'hypercalcémie est propre aux thiazidiques (les diurétiques de l'anse donnent plutôt une hypocalcémie) : non commune.\nB. **Valide** — L'hypokaliémie est un effet indésirable commun aux deux classes.\nC. **Valide** — L'alcalose métabolique est commune aux deux.\nD. **Valide** — L'hyponatrémie est commune aux deux.\nE. **Faux** — L'ototoxicité est propre aux diurétiques de l'anse (fortes doses) : non commune."
        }
      ]
    }
  ]
};

export default content;
