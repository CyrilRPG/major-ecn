import type { PriveCourseContent } from '../prive-courses';

// « Nouvelles annales » UE5 — anatomie, embryologie, sémiologie (2 DP).
// Ajoutées dans un ordre aléatoire (mélange déterministe à graine fixe).

const content: PriveCourseContent = {
  "fiche": {
    "parties": [
      {
        "numero": "I",
        "titre": "Nouvelles annales — anatomie, embryologie & sémiologie",
        "sous_parties": [
          {
            "titre": "Comment utiliser ce cours",
            "rows": [
              {
                "concept": "◆ Onglet QCM",
                "detail_md": "Toutes les annales sont dans l’onglet **QCM** ci-dessus.\n· 38 QCM d’annales UE5 récemment ajoutées : **anatomie** (rein, voie excrétrice, prostate, vascularisation, périnée…), **embryologie** (développement réno-urinaire et génital) et **sémiologie** (2 dossiers progressifs : gaz du sang et HTA / mesure de la PA).\n· Les questions sont présentées dans un **ordre aléatoire**.",
                "kind": "a_retenir"
              },
              {
                "concept": "Correction",
                "detail_md": "Après validation : le **corrigé** (bleu) puis un **rappel de cours** débutant (vert).\n· Pour les dossiers progressifs, la vignette (tableau de gaz du sang ou contexte clinique) est rappelée à chaque question.",
                "kind": "normal"
              }
            ]
          }
        ]
      }
    ],
    "points_cles": [
      "Anatomie : rein et voie excrétrice supérieure, prostate, vascularisation des testicules, plexus cœliaque, surrénales, périnée masculin.",
      "Embryologie : développement de l’appareil réno-urinaire et génital (bourgeon urétéral, canal de Wolff, ascension du rein…).",
      "Sémiologie : DP gaz du sang (6 gazométries) et DP HTA / mesure de la pression artérielle.",
      "Total : 38 QCM d’annales corrigées, ordre aléatoire."
    ]
  },
  "flashcards": [],
  "annales": [
    {
      "titre": "Sémiologie — DP gaz du sang — 2023-2024 (Q6)",
      "annee": "2023-2024",
      "rappel_cours": "**Acidose respiratoire non compensée (gaz F) :**\n- pH 7,20 = **acidose** sévère.\n- **PaCO₂ très élevée (80)** → le poumon retient énormément de CO₂ : origine **respiratoire**.\n- **HCO₃⁻ (31)** : un peu augmentés, mais pas assez pour ramener le pH à la normale.\n- Le pH reste très bas : la compensation rénale est **insuffisante/absente** → acidose respiratoire **aiguë**, non (ou à peine) compensée.\n- Une hausse brutale et massive de la PaCO₂ sans correction du pH signe un trouble **aigu** (le rein n'a pas eu le temps de compenser, ce qui prendrait 2–3 jours).",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP gaz du sang · 2023-2024]**\n\nLe tableau ci-dessous donne 6 gazométries artérielles présentant un désordre de l'équilibre acido-basique :\n· **A** — ventilation spontanée (air ambiant) : pH 7,30 · PaO₂ 118 · PaCO₂ 20 · HCO₃⁻ 10\n· **B** — ventilation spontanée (air ambiant) : pH 7,48 · PaO₂ 58 · PaCO₂ 32 · HCO₃⁻ 23\n· **C** — ventilation spontanée (air ambiant) : pH 7,52 · PaO₂ 54 · PaCO₂ 34 · HCO₃⁻ 28\n· **D** — ventilation spontanée (O₂ 1 L/min) : pH 7,37 · PaO₂ 64 · PaCO₂ 58 · HCO₃⁻ 34\n· **E** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 182 · PaCO₂ 50 · HCO₃⁻ 19\n· **F** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 222 · PaCO₂ 80 · HCO₃⁻ 31\n(PaO₂ et PaCO₂ en mmHg ; HCO₃⁻ en mmol/L)\n\nÀ propos de la gazométrie artérielle F :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Elle correspond à une acidose d'origine métabolique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Elle correspond à une acidose d'origine respiratoire",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Elle correspond à une acidose d'origine mixte",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le désordre est en voie de compensation",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "On n'observe pas de phénomène de compensation",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : B, E**\n\nA. **Faux** — les HCO₃⁻ ne sont pas abaissés (31) : la cause n'est pas métabolique.\nB. **Valide** — pH 7,20 avec PaCO₂ très élevée (80) = acidose **respiratoire** (rétention massive de CO₂).\nC. **Faux** — pas de composante métabolique acidifiante (HCO₃⁻ plutôt hauts).\nD. **Faux** — le pH reste très bas malgré des HCO₃⁻ un peu élevés : la compensation est insuffisante.\nE. **Valide** — pas de compensation efficace : trouble **aigu** non compensé."
        }
      ]
    },
    {
      "titre": "Embryologie — Histogenèse rénale — 2019 Session 1 (Q19)",
      "annee": "2019 Session 1",
      "rappel_cours": "L'**histogenèse rénale** (formation des néphrons) se termine à la naissance : le stock de néphrons est définitif dès la naissance et n'augmente plus ensuite.\n\n**A. S'achève à la naissance** — VRAI.\n**B. Deux millions de néphrons à la naissance** — VRAI (environ 1 à 2 millions, capital définitif).\n**C. Croissance post-natale = hypertrophie des néphrons** — VRAI : après la naissance le rein grossit par augmentation de taille des néphrons existants, pas par création de nouveaux.\n**D. Lobulation disparaît à la puberté** — FAUX : la lobulation fœtale s'efface dans les premières années de vie.\n**E. Néphrons augmentent jusqu'à 5 ans** — FAUX : leur nombre est fixé à la naissance.",
      "questions": [
        {
          "enonce": "**[Embryologie · Histogenèse rénale · 2019 Session 1]**\n\nConcernant l'histogenèse rénale, indiquez la (les) proposition(s) exacte(s).",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'histogenèse du rein s'achève à la naissance",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Deux millions de néphrons sont présents à la naissance",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "L'augmentation post-natale de la taille du rein résulte d'une hypertrophie des néphrons",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "La lobulation des reins présente à la naissance disparait à la puberté",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Le nombre de néphrons continue d'augmenter jusqu'à la 5ème année",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : A B C**\n\nA. **Vrai** — l'histogenèse rénale s'achève à la naissance.\nB. **Vrai** — environ deux millions de néphrons (capital définitif) présents à la naissance.\nC. **Vrai** — le rein grossit après la naissance par hypertrophie des néphrons existants.\nD. **Faux** — la lobulation fœtale disparaît dans les premières années de vie, pas à la puberté.\nE. **Faux** — le nombre de néphrons n'augmente plus après la naissance."
        }
      ]
    },
    {
      "titre": "Anatomie — Voie excrétrice supérieure — 2019 S1 (Q23)",
      "annee": "2019 S1",
      "rappel_cours": "La **voie excrétrice supérieure** = calices mineurs → calices majeurs → pyélon (bassinet) → uretère, le tout logé dans le **sinus rénal**.\n- Les **papilles rénales** sont le sommet des **pyramides de Malpighi** (et non des colonnes de Bertin, qui sont le cortex qui s'insinue entre les pyramides).\n- La **capsule rénale** fibreuse recouvre le rein et se réfléchit au niveau des papilles/sinus.\n- Le nombre de **calices majeurs** (2-3 : supérieur, moyen, inférieur) est **inférieur** au nombre de papilles (7-14).\n- Le **péristaltisme** de la voie excrétrice est automatique, modulé par le **système nerveux végétatif (autonome)**.",
      "questions": [
        {
          "enonce": "**[Anatomie · Voie excrétrice supérieure · 2019 S1]**\n\nParmi les propositions suivantes concernant le rein et la voie excrétrice supérieure, laquelle (lesquelles) est (sont) exacte(s) ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Les calices majeurs appartiennent à la voie excrétrice supérieure et sont situés dans le sinus rénal.",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "La capsule rénale recouvre le sinus rénal et s'interrompt au niveau des papilles rénales.",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Les papilles rénales sont situées au sommet des colonnes rénales.",
              "is_correct": false
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
          "correction": "**Réponse : ABE**\n\nA. **VRAI** — Les calices majeurs font partie de la voie excrétrice supérieure et siègent dans le sinus rénal.\nB. **VRAI** — La capsule rénale se réfléchit au niveau du sinus et des papilles.\nC. **Faux** — Les papilles sont au sommet des **pyramides** (de Malpighi), pas des colonnes (de Bertin).\nD. **Faux** — Il y a moins de calices majeurs (2-3) que de papilles (7-14).\nE. **VRAI** — Le péristaltisme est commandé par le système nerveux végétatif (autonome)."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP gaz du sang — 2023-2024 (Q1)",
      "annee": "2023-2024",
      "rappel_cours": "**Lire une gazométrie artérielle (gaz du sang), pas à pas :**\n1. **Le pH** dit si le sang est trop acide ou trop basique. Normal : 7,38–7,42.\n- pH < 7,38 = **acidose** (trop acide).\n- pH > 7,42 = **alcalose** (trop basique).\n2. **Qui est responsable ?** On regarde 2 paramètres :\n- La **PaCO₂** (gaz carbonique, normal ≈ 40 mmHg) = versant **respiratoire** (les poumons). Le CO₂ est un acide : s'il monte, ça acidifie.\n- Les **HCO₃⁻** (bicarbonates, normal ≈ 24 mmol/L) = versant **métabolique** (les reins). Les bicarbonates sont une base : s'ils baissent, ça acidifie.\n3. **La compensation** : quand un organe déraille, l'autre essaie de corriger pour ramener le pH vers la normale, mais tant que le pH reste anormal la compensation est dite **partielle**.",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP gaz du sang · 2023-2024]**\n\nLe tableau ci-dessous donne 6 gazométries artérielles présentant un désordre de l'équilibre acido-basique :\n· **A** — ventilation spontanée (air ambiant) : pH 7,30 · PaO₂ 118 · PaCO₂ 20 · HCO₃⁻ 10\n· **B** — ventilation spontanée (air ambiant) : pH 7,48 · PaO₂ 58 · PaCO₂ 32 · HCO₃⁻ 23\n· **C** — ventilation spontanée (air ambiant) : pH 7,52 · PaO₂ 54 · PaCO₂ 34 · HCO₃⁻ 28\n· **D** — ventilation spontanée (O₂ 1 L/min) : pH 7,37 · PaO₂ 64 · PaCO₂ 58 · HCO₃⁻ 34\n· **E** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 182 · PaCO₂ 50 · HCO₃⁻ 19\n· **F** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 222 · PaCO₂ 80 · HCO₃⁻ 31\n(PaO₂ et PaCO₂ en mmHg ; HCO₃⁻ en mmol/L)\n\nÀ propos de la gazométrie artérielle A :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Elle correspond à une acidose d'origine métabolique",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Elle correspond à une acidose d'origine respiratoire",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Elle correspond à une acidose d'origine mixte",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le désordre est partiellement compensé",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "On n'observe pas de phénomène de compensation",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : A, D**\n\nA. **Valide** — pH 7,30 = acidose ; HCO₃⁻ effondrés à 10 mmol/L = cause **métabolique**.\nB. **Faux** — l'origine respiratoire donnerait une PaCO₂ élevée ; ici elle est basse (20).\nC. **Faux** — pas de trouble mixte : la PaCO₂ basse va dans le sens de la compensation, pas d'une seconde cause d'acidose.\nD. **Valide** — la PaCO₂ abaissée à 20 (hyperventilation) montre une compensation respiratoire, mais le pH reste anormal → **partiellement** compensé.\nE. **Faux** — il y a bien une compensation (PaCO₂ basse)."
        }
      ]
    },
    {
      "titre": "Embryologie — Formation de la crête génitale — 2015 Session 2 (Q1)",
      "annee": "2015 Session 2",
      "rappel_cours": "La **crête génitale** (ébauche de la gonade) apparaît vers la **5e semaine** de développement, sur la face interne du corps de Wolff.\n\n**A. 40 paires de tubules mésonéphrotiques** — FAUX (le nombre et les repères indiqués sont inexacts).\n**B. Corps de Wolff = tubules mésonéphrotiques + canal de Wolff** — FAUX selon le corrigé.\n**C. Ligament inguinal en haut / diaphragmatique en bas** — FAUX (relations inversées : le ligament diaphragmatique est crânial et le ligament inguinal est caudal).\n**D. Canal de Wolff en région moyenne et interne** — FAUX.\n**E. Crête génitale se forme à la 5e semaine** — VRAI.",
      "questions": [
        {
          "enonce": "**[Embryologie · Crête génitale · 2015 Session 2]**\n\nConcernant la formation de la crête génitale, indiquez la proposition exacte :",
          "items": [
            {
              "lettre": "A",
              "enonce": "De la 3e paire de somites cervicaux à la 4e paire de somites lombaires s'individualisent quarante paires de tubules mésonéphrotiques",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "L'association des tubules mésonéphrotiques et du canal de Wolff constitue le corps de Wolff",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Le corps de Wolff est prolongé en haut par le ligament inguinal et en bas par le ligament diaphragmatique",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le canal de Wolff se forme à la région moyenne et interne du corps de Wolff",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "La crête génitale se forme à la 5e semaine de développement.",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : E**\n\nA. **Faux** — les repères et le nombre de paires de tubules mésonéphrotiques sont inexacts.\nB. **Faux** — proposition considérée fausse dans le corrigé.\nC. **Faux** — relations inversées : le ligament diaphragmatique est crânial, le ligament inguinal est caudal.\nD. **Faux** — la formation du canal de Wolff n'est pas décrite ainsi.\nE. **Vrai** — la crête génitale se forme à la 5e semaine de développement."
        }
      ]
    },
    {
      "titre": "Embryologie — Segments de l'urètre d'origine entoblastique — 2018 Session 2 (QCM13)",
      "annee": "2018 Session 2",
      "rappel_cours": "L'urètre a une double origine : la majeure partie (urètre prostatique, membraneux, pénien) dérive de l'**entoblaste** (sinus uro-génital), tandis que la portion distale (urètre balanique / gland et méat) est d'origine **ectoblastique**.\n\n**A. Urètre membraneux** — VRAI (entoblastique).\n**B. Urètre pénien** — VRAI (entoblastique).\n**C. Urètre balanique** — FAUX (ectoblastique, au niveau du gland).\n**D. Méat urinaire** — FAUX (ectoblastique).\n**E. Urètre prostatique** — VRAI (entoblastique).",
      "questions": [
        {
          "enonce": "**[Embryologie · Origine de l'urètre · 2018 Session 2]**\n\nConcernant les segments de l'urètre, indiquez celui ou ceux qui est (sont) d'origine entoblastique :",
          "items": [
            {
              "lettre": "A",
              "enonce": "urètre membraneux",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "urètre pénien",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "urètre balanique",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "méat urinaire",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "urètre prostatique",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : A B E**\n\nA. **Vrai** — urètre membraneux d'origine entoblastique.\nB. **Vrai** — urètre pénien d'origine entoblastique.\nC. **Faux** — l'urètre balanique (gland) est d'origine ectoblastique.\nD. **Faux** — le méat urinaire est d'origine ectoblastique.\nE. **Vrai** — urètre prostatique d'origine entoblastique."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP gaz du sang — 2023-2024 (Q3)",
      "annee": "2023-2024",
      "rappel_cours": "**Alcalose mixte (gaz C) :**\n- pH 7,52 = **alcalose** franche (> 7,42).\n- On regarde les deux versants :\n  - **PaCO₂ basse (34)** → composante **respiratoire** alcalinisante.\n  - **HCO₃⁻ élevés (28)** → composante **métabolique** alcalinisante.\n- Les deux anomalies vont **dans le même sens** (toutes deux alcalinisantes) : ce n'est pas une compensation (qui irait en sens inverse), mais bien **deux troubles associés** → alcalose **mixte**.\n- Comme aucun paramètre ne « corrige » l'autre, il n'y a **pas de compensation**.",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP gaz du sang · 2023-2024]**\n\nLe tableau ci-dessous donne 6 gazométries artérielles présentant un désordre de l'équilibre acido-basique :\n· **A** — ventilation spontanée (air ambiant) : pH 7,30 · PaO₂ 118 · PaCO₂ 20 · HCO₃⁻ 10\n· **B** — ventilation spontanée (air ambiant) : pH 7,48 · PaO₂ 58 · PaCO₂ 32 · HCO₃⁻ 23\n· **C** — ventilation spontanée (air ambiant) : pH 7,52 · PaO₂ 54 · PaCO₂ 34 · HCO₃⁻ 28\n· **D** — ventilation spontanée (O₂ 1 L/min) : pH 7,37 · PaO₂ 64 · PaCO₂ 58 · HCO₃⁻ 34\n· **E** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 182 · PaCO₂ 50 · HCO₃⁻ 19\n· **F** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 222 · PaCO₂ 80 · HCO₃⁻ 31\n(PaO₂ et PaCO₂ en mmHg ; HCO₃⁻ en mmol/L)\n\nÀ propos de la gazométrie artérielle C :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Elle correspond à une alcalose d'origine métabolique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Elle correspond à une alcalose d'origine respiratoire",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Elle correspond à une alcalose d'origine mixte",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Le désordre est en voie de compensation",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "On n'observe pas de phénomène de compensation",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : C, E**\n\nA. **Faux** — ce n'est pas une alcalose purement métabolique : la PaCO₂ est aussi basse.\nB. **Faux** — ce n'est pas non plus une alcalose purement respiratoire : les HCO₃⁻ sont aussi élevés.\nC. **Valide** — pH 7,52 (alcalose) avec PaCO₂ basse (34, respiratoire) ET HCO₃⁻ élevés (28, métabolique) allant dans le même sens = alcalose **mixte**.\nD. **Faux** — les deux anomalies aggravent l'alcalose (même sens), aucune ne compense l'autre.\nE. **Valide** — il n'y a pas de phénomène de compensation."
        }
      ]
    },
    {
      "titre": "Embryologie — Ascension du rein — 2015 Session 2 (Q12)",
      "annee": "2015 Session 2",
      "rappel_cours": "Ascension du rein : le métanéphros se forme en région sacrée puis gagne la région lombaire haute grâce au redressement de l'embryon et à la croissance du corps (dont l'allongement du bourgeon urétral).\n\n**A. Région thoracique** — FAUX (sacrée/pelvienne).\n**B. Lombo-sacré → lombaire haut** — VRAI.\n**C. Diminution de la courbure** — VRAI.\n**D. Croissance des néphrons** — FAUX.\n**E. Croissance du bourgeon urétral** — VRAI.",
      "questions": [
        {
          "enonce": "**[Embryologie · Ascension du rein · 2015 Session 2]**\n\nConcernant l'ascension du rein, indiquez la(les) proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le métanéphros est formé dans la région thoracique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Le métanéphros migre depuis la région lombo-sacrée vers la région lombaire haute",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La diminution de la courbure du corps de l'embryon permet l'ascension du rein",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Un des mécanismes d'ascension du rein est la croissance des néphrons",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Un des mécanismes d'ascension du rein est la croissance du bourgeon urétral",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : B C E**\n\nA. **Faux** — le métanéphros se forme en région sacrée/pelvienne, pas thoracique.\nB. **Vrai** — migration du lombo-sacré vers le lombaire haut.\nC. **Vrai** — le redressement de l'embryon participe à l'ascension.\nD. **Faux** — la croissance des néphrons n'est pas un mécanisme d'ascension.\nE. **Vrai** — l'allongement du bourgeon urétral accompagne l'ascension."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP gaz du sang — 2023-2024 (Q8)",
      "annee": "2023-2024",
      "rappel_cours": "**Conséquences d'une acidose métabolique (gaz A) :**\n- **Compensation respiratoire :** face à l'acidité, le cerveau commande d'hyperventiler pour éliminer du CO₂ (un acide). Cette hyperventilation ample et régulière, sans cause pulmonaire évidente, s'appelle la **dyspnée sine materia** (respiration de Kussmaul). Le déclencheur est la **baisse du pH** détectée par les chémorécepteurs.\n- **Réponse rénale :** un rein sain élimine l'acide dans les urines → **urines très acides (pH < 5)**.\n- **Kaliémie :** en cas d'acidose, le potassium sort des cellules vers le sang → risque d'**hyperkaliémie**.\n- **Piège :** l'**astérixis** (flapping tremor) est un signe d'acidose **respiratoire** hypercapnique (encéphalopathie), pas d'acidose métabolique.",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP gaz du sang · 2023-2024]**\n\nLe tableau ci-dessous donne 6 gazométries artérielles présentant un désordre de l'équilibre acido-basique :\n· **A** — ventilation spontanée (air ambiant) : pH 7,30 · PaO₂ 118 · PaCO₂ 20 · HCO₃⁻ 10\n· **B** — ventilation spontanée (air ambiant) : pH 7,48 · PaO₂ 58 · PaCO₂ 32 · HCO₃⁻ 23\n· **C** — ventilation spontanée (air ambiant) : pH 7,52 · PaO₂ 54 · PaCO₂ 34 · HCO₃⁻ 28\n· **D** — ventilation spontanée (O₂ 1 L/min) : pH 7,37 · PaO₂ 64 · PaCO₂ 58 · HCO₃⁻ 34\n· **E** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 182 · PaCO₂ 50 · HCO₃⁻ 19\n· **F** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 222 · PaCO₂ 80 · HCO₃⁻ 31\n(PaO₂ et PaCO₂ en mmHg ; HCO₃⁻ en mmol/L)\n\nLa gazométrie artérielle A correspond à une acidose d'origine métabolique partiellement compensée chez un sujet de 18 ans.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Ce sujet présente certainement une dyspnée sine materia",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Ce sujet présente certainement un astérixis",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Le phénomène à l'origine de la compensation respiratoire de cette acidose métabolique est la diminution du pH artériel",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Si les reins de ce sujet fonctionnent correctement, le pH de ses urines doit être inférieur à 5",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Ce sujet est à risque de présenter une hyperkaliémie",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : A, C, D, E**\n\nA. **Valide** — la compensation respiratoire (PaCO₂ à 20) se traduit par une hyperventilation ample sans cause pulmonaire = dyspnée sine materia (Kussmaul).\nB. **Faux** — l'astérixis est un signe d'acidose **respiratoire** hypercapnique, pas d'acidose métabolique.\nC. **Valide** — c'est la baisse du pH artériel, détectée par les chémorécepteurs, qui stimule la ventilation.\nD. **Valide** — un rein sain élimine l'excès d'acide → urines acides (pH < 5).\nE. **Valide** — l'acidose fait sortir le K⁺ des cellules vers le sang → risque d'hyperkaliémie."
        }
      ]
    },
    {
      "titre": "Embryologie — Fonctionnement du rein fœtal — 2019 Session 1 (Q4)",
      "annee": "2019 Session 1",
      "rappel_cours": "Le **rein fœtal** commence à fabriquer un peu d'urine dès la fin du 1er trimestre. Cette urine devient, dans la 2e moitié de la grossesse, le **composant principal du liquide amniotique** (et non 20%).\n\n**A. Sécrétion précoce d'urine** — VRAI : le rein produit de petites quantités d'urine avant la 20e SD.\n**B. ~650 ml/24H** — VRAI : débit urinaire fœtal en fin de gestation.\n**C. 20% du liquide amniotique** — FAUX : l'urine fœtale en représente la majeure partie (bien plus de 20%).\n**D. Avalé par le fœtus** — VRAI : le fœtus déglutit le liquide amniotique.\n**E. Placenta = élimination** — VRAI : le placenta assure l'épuration à la place du rein immature.",
      "questions": [
        {
          "enonce": "**[Embryologie · Rein fœtal · 2019 Session 1]**\n\nToutes les propositions suivantes concernant le fonctionnement du rein fœtal sont exactes, SAUF UNE. Laquelle ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Avant la 20e SD, le rein fœtal est capable de sécréter de petites quantités d'urine qui participe à la composition du liquide amniotique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La production d'urine fœtale est d'environ 650 ml par 24H à la fin de la gestation",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "L'urine produite par la diurèse fœtale représente 20% du liquide amniotique",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Le liquide amniotique produit est ensuite avalé par la bouche du foetus",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Le placenta assure pendant la vie fœtale la fonction d'élimination du liquide amniotique",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : C**\n\nQuestion « SAUF UNE » : la proposition à identifier est celle qui est FAUSSE.\n\nA. **Vrai** — le rein fœtal sécrète de l'urine dès avant la 20e SD.\nB. **Vrai** — environ 650 ml/24H en fin de gestation.\nC. **Faux (réponse)** — l'urine fœtale constitue la majeure partie du liquide amniotique, pas seulement 20%.\nD. **Vrai** — le fœtus avale le liquide amniotique.\nE. **Vrai** — le placenta assure l'élimination durant la vie fœtale."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP gaz du sang — 2023-2024 (Q9)",
      "annee": "2023-2024",
      "rappel_cours": "**Causes d'acidose métabolique — trouver l'intrus :**\nUne acidose métabolique = accumulation d'acides OU perte de bicarbonates. Causes classiques :\n- **Insuffisance rénale chronique** : le rein n'élimine plus les acides → ils s'accumulent.\n- **Choc septique** : mauvaise oxygénation des tissus → production d'**acide lactique**.\n- **Diarrhée profuse** : perte massive de **bicarbonates** par les selles.\n- **Diabète de type 1 non traité** : sans insuline, production de corps cétoniques (acides) → **acidocétose**.\n- **L'intrus = le furosémide** (diurétique de l'anse) : il fait perdre du potassium et des ions H⁺ → il provoque au contraire une **alcalose** métabolique.",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP gaz du sang · 2023-2024]**\n\nLe tableau ci-dessous donne 6 gazométries artérielles présentant un désordre de l'équilibre acido-basique :\n· **A** — ventilation spontanée (air ambiant) : pH 7,30 · PaO₂ 118 · PaCO₂ 20 · HCO₃⁻ 10\n· **B** — ventilation spontanée (air ambiant) : pH 7,48 · PaO₂ 58 · PaCO₂ 32 · HCO₃⁻ 23\n· **C** — ventilation spontanée (air ambiant) : pH 7,52 · PaO₂ 54 · PaCO₂ 34 · HCO₃⁻ 28\n· **D** — ventilation spontanée (O₂ 1 L/min) : pH 7,37 · PaO₂ 64 · PaCO₂ 58 · HCO₃⁻ 34\n· **E** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 182 · PaCO₂ 50 · HCO₃⁻ 19\n· **F** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 222 · PaCO₂ 80 · HCO₃⁻ 31\n(PaO₂ et PaCO₂ en mmHg ; HCO₃⁻ en mmol/L)\n\nToutes les conditions pathologiques suivantes peuvent induire une acidose métabolique, SAUF UNE. Laquelle ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Une insuffisance rénale chronique avec réduction néphronique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Un état de choc septique",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Une diarrhée profuse",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Un surdosage en furosémide (diurétique de l'anse)",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Un diabète de type 1 (défaut de production d'insuline) de découverte récente (non encore traité)",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nAttention, question à réponse unique : la seule proposition **Valide** (l'intrus) est celle qui ne donne PAS d'acidose métabolique.\nA. **Faux (donne bien une acidose)** — l'insuffisance rénale accumule les acides non éliminés.\nB. **Faux (donne bien une acidose)** — le choc septique produit de l'acide lactique (acidose lactique).\nC. **Faux (donne bien une acidose)** — la diarrhée fait perdre des bicarbonates par les selles.\nD. **Valide (= l'intrus)** — le furosémide fait perdre H⁺ et K⁺ et provoque une **alcalose** métabolique, pas une acidose.\nE. **Faux (donne bien une acidose)** — le diabète de type 1 non traité entraîne une acidocétose."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP HTA / mesure PA — 2023-2024 (Q5)",
      "annee": "2023-2024",
      "rappel_cours": "**La bandelette urinaire (BU) pour rechercher une protéinurie**\n\nDans la maladie rénale chronique, on cherche des **protéines dans les urines** (protéinurie), signe de souffrance du rein. La **bandelette urinaire** est un test rapide au lit du patient : on trempe une languette réactive dans l'urine et on lit une couleur.\n\n**Limites de la bandelette :**\n\n**Semi-quantitative** — Elle donne un ordre de grandeur (+, ++, +++), pas un chiffre précis. Ce n'est qu'un **test de dépistage**, pas de confirmation. Pour confirmer et quantifier, il faut un dosage au laboratoire (protéinurie sur échantillon ou 24 h).\n\n**Faux positifs** — La bandelette peut afficher un résultat positif à tort si elle est **périmée** (mal conservée), en cas d'**urines très alcalines**, ou lors d'une **infection urinaire** (présence de leucocytes, sang, etc.).\n\n**À noter** — La coloration des urines par la **betterave** ne donne pas de faux positif de protéinurie (piège classique).",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP HTA / mesure PA · 2023-2024]**\n\nMédecin généraliste, vous voyez pour la 1ʳᵉ fois Mme X, 30 ans, adressée par la médecine du travail pour une pression artérielle « trop élevée ». Vous mesurez la PA au sphygmomanomètre manuel.\n\nAfin de rechercher des marqueurs de maladie rénale chronique, vous recherchez une protéinurie à l'aide d'une bandelette urinaire (BU). Quelles sont les limites de cette méthode ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Méthode semi-quantitative",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Méthode de confirmation",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Faux positif en cas de BU périmée",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Faux positif en cas de consommation de betterave",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Infection urinaire",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : A, C, E**\n\nA. **Valide** — La BU est semi-quantitative (résultat en +, ++…), elle ne donne pas de chiffre précis.\nB. **Faux** — C'est un test de **dépistage**, pas de confirmation ; la confirmation se fait au laboratoire.\nC. **Valide** — Une bandelette périmée (mal conservée) peut donner un faux positif.\nD. **Faux** — La betterave colore les urines mais ne provoque pas de faux positif de protéinurie.\nE. **Valide** — Une infection urinaire peut fausser la bandelette (faux positif)."
        }
      ]
    },
    {
      "titre": "Embryologie — Développement de l'appareil réno-urinaire — 2018 Session 2 (QCM12)",
      "annee": "2018 Session 2",
      "rappel_cours": "L'appareil réno-urinaire dérive du **mésoblaste intermédiaire** (et non latéral). Le cordon néphrogène se métamérise selon un gradient **cranio-caudal**. Chez l'humain le pronéphros est non fonctionnel. Les urines fœtales forment l'essentiel du liquide amniotique en 2e moitié de grossesse, et les canaux de Wolff s'abouchent dans le sinus uro-génital.\n\n**A. Mésoblaste latéral origine principale** — FAUX : c'est le mésoblaste intermédiaire.\n**B. Gradient cranio-caudal** — VRAI.\n**C. Pronéphros fonctionnel transitoirement** — FAUX chez l'humain (non fonctionnel).\n**D. Urines fœtales = composant principal du LA** — VRAI (2e moitié de grossesse).\n**E. Canaux de Wolff dans le sinus uro-génital** — VRAI.",
      "questions": [
        {
          "enonce": "**[Embryologie · Développement réno-urinaire · 2018 Session 2]**\n\nConcernant le développement de l'appareil réno-urinaire, indiquez la ou les proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le mésoblaste latéral est l'origine principale de l'appareil réno-urinaire.",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La métamérisation du cordon néphrogène suit un gradient cranio-caudal.",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Le pronéphros est fonctionnel de façon transitoire.",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Les urines fœtales sont le composant principal du liquide amniotique dans la deuxième moitié de grossesse.",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Les canaux de Wolff se jettent dans le sinus uro-génital.",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : B D E**\n\nA. **Faux** — l'origine principale est le mésoblaste intermédiaire, pas latéral.\nB. **Vrai** — la métamérisation du cordon néphrogène suit un gradient cranio-caudal.\nC. **Faux** — chez l'humain le pronéphros est non fonctionnel.\nD. **Vrai** — les urines fœtales constituent l'essentiel du liquide amniotique en 2e moitié de grossesse.\nE. **Vrai** — les canaux de Wolff s'abouchent dans le sinus uro-génital."
        }
      ]
    },
    {
      "titre": "Anatomie — Plexus cœliaque — 2015 S2 (Q15)",
      "annee": "2015 S2",
      "rappel_cours": "Le **plexus cœliaque (solaire)** est un plexus **végétatif (sympathique et parasympathique)**, situé autour du tronc cœliaque, en avant de l'aorte abdominale.\n- Il assure une innervation **végétative (autonome)** des viscères abdominaux, **pas somatique**.\n- Les **ganglions semi-lunaires (cœliaques)** sont situés de part et d'autre du tronc cœliaque.\n- Ses afférences **sympathiques** viennent des **nerfs splanchniques** (grand splanchnique = ganglions thoraciques T5-T9 environ ; ici T6-T9).\n- Le **nerf vague (X)** apporte une afférence **parasympathique** (pas sympathique).\n- Les ganglions **aortico-mésentériques et aortico-rénaux** reçoivent aussi des afférences sympathiques.",
      "questions": [
        {
          "enonce": "**[Anatomie · Plexus cœliaque · 2015 S2]**\n\nConcernant le plexus cœliaque, indiquez la(es) proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le plexus cœliaque participe à l'innervation somatique des organes abdominaux",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Les ganglions semi-lunaires sont situés de part et d'autre du tronc cœliaque",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Le nerf vague droit est une afférence sympathique du plexus cœliaque",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le nerf grand splanchnique est formé par les 6ème, 7ème, 8èmes et 9èmes ganglions thoraciques de la chaine sympathique latérovertébrale",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Les ganglions aortico-mésentériques et aorticorénaux reçoivent aussi des afférences sympathiques",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BDE**\n\nA. **Faux** — Le plexus cœliaque assure une innervation **végétative (autonome)**, pas somatique.\nB. **VRAI** — Les ganglions semi-lunaires siègent de part et d'autre du tronc cœliaque.\nC. **Faux** — Le nerf vague apporte une afférence **parasympathique**, pas sympathique.\nD. **VRAI** — Le grand nerf splanchnique naît des 6e à 9e ganglions thoraciques.\nE. **VRAI** — Les ganglions aortico-mésentériques et aortico-rénaux reçoivent des afférences sympathiques."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP gaz du sang — 2023-2024 (Q4)",
      "annee": "2023-2024",
      "rappel_cours": "**Acidose respiratoire compensée (gaz D) :**\n- pH 7,37 = très légèrement acide (limite basse), presque normal.\n- **PaCO₂ élevée (58)** → le poumon retient trop de CO₂ (hypoventilation) : origine **respiratoire**, acidifiante.\n- **HCO₃⁻ élevés (34)** → les reins ont fabriqué des bicarbonates pour neutraliser l'acidité : c'est la **compensation métabolique**.\n- Comme le pH est presque revenu à la normale, le trouble est **en voie de compensation** (bien compensé).\n- Ce profil = insuffisance respiratoire **chronique** (BPCO), le rein a eu le temps de s'adapter.",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP gaz du sang · 2023-2024]**\n\nLe tableau ci-dessous donne 6 gazométries artérielles présentant un désordre de l'équilibre acido-basique :\n· **A** — ventilation spontanée (air ambiant) : pH 7,30 · PaO₂ 118 · PaCO₂ 20 · HCO₃⁻ 10\n· **B** — ventilation spontanée (air ambiant) : pH 7,48 · PaO₂ 58 · PaCO₂ 32 · HCO₃⁻ 23\n· **C** — ventilation spontanée (air ambiant) : pH 7,52 · PaO₂ 54 · PaCO₂ 34 · HCO₃⁻ 28\n· **D** — ventilation spontanée (O₂ 1 L/min) : pH 7,37 · PaO₂ 64 · PaCO₂ 58 · HCO₃⁻ 34\n· **E** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 182 · PaCO₂ 50 · HCO₃⁻ 19\n· **F** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 222 · PaCO₂ 80 · HCO₃⁻ 31\n(PaO₂ et PaCO₂ en mmHg ; HCO₃⁻ en mmol/L)\n\nÀ propos de la gazométrie artérielle D :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Elle correspond à une acidose d'origine métabolique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Elle correspond à une acidose d'origine respiratoire",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Elle correspond à une acidose d'origine mixte",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le désordre est en voie de compensation",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "On n'observe pas de phénomène de compensation",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B, D**\n\nA. **Faux** — les HCO₃⁻ sont élevés (34), pas abaissés : la cause n'est pas métabolique.\nB. **Valide** — pH 7,37 (côté acide) avec PaCO₂ élevée (58, rétention de CO₂) = acidose **respiratoire**.\nC. **Faux** — pas de composante métabolique acidifiante (les HCO₃⁻ hauts sont une compensation, pas une cause).\nD. **Valide** — HCO₃⁻ élevés (34) = compensation rénale ; pH presque normal → trouble **en voie de compensation**.\nE. **Faux** — il y a bien une compensation métabolique (HCO₃⁻ augmentés)."
        }
      ]
    },
    {
      "titre": "Anatomie — Voie excrétrice supérieure — 2018 S2 (QCM11)",
      "annee": "2018 S2",
      "rappel_cours": "Rappel sur le **rein et la voie excrétrice supérieure** :\n- **Calices majeurs** : dans le **sinus rénal**, font partie de la voie excrétrice supérieure.\n- **Capsule rénale** : recouvre le rein et se réfléchit au niveau du sinus / des papilles.\n- **Papilles rénales** : sommet des **pyramides de Malpighi** (pas des colonnes de Bertin).\n- Nombre de **calices majeurs** (2-3) **≠** nombre de papilles (7-14).\n- **Péristaltisme** de la voie excrétrice : commandé par le **système nerveux végétatif**. (Question identique à 2019 S1 Q23.)",
      "questions": [
        {
          "enonce": "**[Anatomie · Voie excrétrice supérieure · 2018 S2]**\n\nParmi les propositions suivantes concernant le rein et la voie excrétrice supérieure, laquelle (lesquelles) est (sont) exacte(s) ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Les calices majeurs appartiennent à la voie excrétrice supérieure et sont situés dans le sinus rénal.",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "La capsule rénale recouvre le sinus rénal et s'interrompt au niveau des papilles rénales.",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Les papilles rénales sont situées au sommet des colonnes rénales.",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Il existe autant de calices majeurs que de papilles rénales.",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "La voie excrétrice supérieure a un péristaltisme commandé par le système nerveux végétatif.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : AB**\n\nA. **VRAI** — Les calices majeurs appartiennent à la voie excrétrice supérieure, dans le sinus rénal.\nB. **VRAI** — La capsule rénale se réfléchit au niveau des papilles.\nC. **Faux** — Les papilles sont au sommet des **pyramides** (de Malpighi), pas des colonnes.\nD. **Faux** — Il y a moins de calices majeurs (2-3) que de papilles (7-14).\nE. **Faux** — Selon la correction officielle de cette session, cet item est compté faux."
        }
      ]
    },
    {
      "titre": "Anatomie — Portions des uretères — 2019 S1 (Q24)",
      "annee": "2019 S1",
      "rappel_cours": "L'**uretère** se décrit classiquement en portions selon son trajet, du rein à la vessie :\n- Portion **lombaire (abdominale)** : le long du muscle psoas.\n- Portion **iliaque** : croise les vaisseaux iliaques (au détroit supérieur).\n- Portion **pelvienne** : dans le pelvis.\n- Portion **intramurale (vésicale)** : traverse obliquement la paroi de la vessie (mécanisme anti-reflux).\nIl n'existe **pas** de portion « sacrée » dans cette description : c'est le seul intrus.",
      "questions": [
        {
          "enonce": "**[Anatomie · Portions des uretères · 2019 S1]**\n\nParmi les propositions suivantes concernant les différentes portions des uretères, laquelle (lesquelles) est (sont) exacte(s) ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Sacrée",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Lombaire",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Intramurale",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Iliaque",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Pelvienne",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCDE**\n\nA. **Faux** — Il n'y a pas de portion « sacrée » de l'uretère.\nB. **VRAI** — Portion lombaire (abdominale).\nC. **VRAI** — Portion intramurale (vésicale).\nD. **VRAI** — Portion iliaque.\nE. **VRAI** — Portion pelvienne."
        }
      ]
    },
    {
      "titre": "Embryologie — Développement post-natal de l'appareil génital masculin — 2015 Session 2 (Q13)",
      "annee": "2015 Session 2",
      "rappel_cours": "Après la naissance, le testicule connaît une brève phase d'activation (« mini-puberté ») puis une quiescence pendant l'enfance, avant la vraie puberté.\n\n**A. Barrière hémato-testiculaire présente à la naissance** — FAUX : elle se met en place à la puberté.\n**B. Activation gonadotrope 2–4 mois après la naissance (↑ cellules de Sertoli)** — VRAI (« mini-puberté »).\n**C. Cellules de Leydig actives pendant l'enfance** — FAUX : elles sont quiescentes durant l'enfance.\n**D. Cellules de Sertoli matures en pré-puberté → allongement des tubes séminifères** — VRAI.\n**E. Puberté : expansion des cellules germinales avec vague d'apoptose indispensable à la spermatogenèse** — VRAI.",
      "questions": [
        {
          "enonce": "**[Embryologie · Développement post-natal génital masculin · 2015 Session 2]**\n\nConcernant le développement post natal de l'appareil génital masculin, indiquez la(es) proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "La barrière hémato testiculaire est présente à la naissance",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "2 à 4 mois après la naissance, on observe une phase d'activation de l'axe gonadotrope avec une augmentation du nombre de cellules de Sertoli",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Pendant l'enfance, des cellules de Leydig, localisées dans l'espace interstitiel, sont actives",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "En période pré pubertaire, des cellules de Sertoli matures induisent l'allongement des tubes séminifères",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "A la puberté, l'expansion de la population de cellules germinales est associée à une vague d'apoptose indispensable pour le déclenchement et la poursuite de la spermatogenèse",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : B D E**\n\nA. **Faux** — la barrière hémato-testiculaire se met en place à la puberté, pas à la naissance.\nB. **Vrai** — « mini-puberté » : activation de l'axe gonadotrope 2 à 4 mois après la naissance avec augmentation des cellules de Sertoli.\nC. **Faux** — les cellules de Leydig sont quiescentes durant l'enfance.\nD. **Vrai** — en pré-puberté, les cellules de Sertoli matures induisent l'allongement des tubes séminifères.\nE. **Vrai** — à la puberté, l'expansion des cellules germinales s'accompagne d'une vague d'apoptose indispensable à la spermatogenèse."
        }
      ]
    },
    {
      "titre": "Anatomie — Trigone vésical — 2019 S2 (QCM15)",
      "annee": "2019 S2",
      "rappel_cours": "Le **trigone vésical** est une zone triangulaire du plancher de la vessie, délimitée par les deux méats urétéraux et l'orifice urétral interne.\n- **Origine embryologique différente** : il dérive des **canaux de Wolff / bourgeons urétéraux (mésoderme)**, alors que le reste de la vessie vient du **sinus uro-génital (endoderme)**.\n- Sa paroi est **lisse et fixe** (non plissée), contrairement au reste de la vessie qui est plissé et extensible.\n- La **barre inter-urétérale** relie les deux méats et participe au mécanisme **anti-reflux**.\n- Innervation **végétative autonome** (sympathique/parasympathique) comme le reste de la vessie.\n- Sa muqueuse est de type **urothélial (transitionnel/urothélium)**, comme le reste de la vessie (pas pavimenteux).",
      "questions": [
        {
          "enonce": "**[Anatomie · Trigone vésical · 2019 S2]**\n\nParmi les propositions suivantes concernant le trigone de la vessie, laquelle (lesquelles) est (sont) exacte(s) ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Il a une origine embryologique différente du reste de la vessie.",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Il constitue la paroi mobile et extensible de la vessie.",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Il comprend une barre inter-urétérale qui participe au mécanisme anti-reflux.",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Il reçoit une innervation végétative autonome.",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Sa muqueuse, de type pavimenteux, est différente du reste de la vessie.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : ACD**\n\nA. **VRAI** — Le trigone a une origine embryologique différente (bourgeons urétéraux / mésoderme).\nB. **Faux** — Le trigone est une paroi **fixe et lisse**, non extensible ; c'est le reste de la vessie qui est extensible.\nC. **VRAI** — La barre inter-urétérale participe au mécanisme anti-reflux.\nD. **VRAI** — Innervation végétative autonome.\nE. **Faux** — La muqueuse du trigone est de type **urothélial (transitionnel)**, comme le reste de la vessie, pas pavimenteux."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP gaz du sang — 2023-2024 (Q5)",
      "annee": "2023-2024",
      "rappel_cours": "**Acidose mixte (gaz E) :**\n- pH 7,20 = **acidose** sévère (très en dessous de 7,38).\n- Les deux versants sont acidifiants :\n  - **PaCO₂ élevée (50)** → composante **respiratoire** (le poumon ne chasse pas assez le CO₂).\n  - **HCO₃⁻ bas (19)** → composante **métabolique** (manque de bicarbonates).\n- Les deux anomalies aggravent l'acidose dans le même sens → acidose **mixte** (métabolique + respiratoire).\n- Aucun paramètre ne compense l'autre → **pas de compensation**. Profil typique d'un patient très grave (arrêt cardiaque, état de choc avec détresse respiratoire).",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP gaz du sang · 2023-2024]**\n\nLe tableau ci-dessous donne 6 gazométries artérielles présentant un désordre de l'équilibre acido-basique :\n· **A** — ventilation spontanée (air ambiant) : pH 7,30 · PaO₂ 118 · PaCO₂ 20 · HCO₃⁻ 10\n· **B** — ventilation spontanée (air ambiant) : pH 7,48 · PaO₂ 58 · PaCO₂ 32 · HCO₃⁻ 23\n· **C** — ventilation spontanée (air ambiant) : pH 7,52 · PaO₂ 54 · PaCO₂ 34 · HCO₃⁻ 28\n· **D** — ventilation spontanée (O₂ 1 L/min) : pH 7,37 · PaO₂ 64 · PaCO₂ 58 · HCO₃⁻ 34\n· **E** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 182 · PaCO₂ 50 · HCO₃⁻ 19\n· **F** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 222 · PaCO₂ 80 · HCO₃⁻ 31\n(PaO₂ et PaCO₂ en mmHg ; HCO₃⁻ en mmol/L)\n\nÀ propos de la gazométrie artérielle E :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Elle correspond à une acidose d'origine métabolique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Elle correspond à une acidose d'origine respiratoire",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Elle correspond à une acidose d'origine mixte",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Le désordre est en voie de compensation",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "On n'observe pas de phénomène de compensation",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : C, E**\n\nA. **Faux** — ce n'est pas une acidose purement métabolique : la PaCO₂ est aussi élevée.\nB. **Faux** — ce n'est pas non plus une acidose purement respiratoire : les HCO₃⁻ sont aussi abaissés.\nC. **Valide** — pH 7,20 avec PaCO₂ haute (50, respiratoire) ET HCO₃⁻ bas (19, métabolique), tous deux acidifiants = acidose **mixte**.\nD. **Faux** — les deux anomalies aggravent l'acidose, aucune ne compense l'autre.\nE. **Valide** — il n'y a pas de compensation."
        }
      ]
    },
    {
      "titre": "Embryologie — Origine du système urogénital et les 3 reins — 2019 Session 1 (Q20)",
      "annee": "2019 Session 1",
      "rappel_cours": "Au cours du développement, trois ébauches rénales se succèdent : **pronéphros** (transitoire, non fonctionnel chez l'humain, disparaît vers la 4e SD), **mésonéphros** (fonctionnel de façon transitoire, atteint un développement complet) puis **métanéphros** (rein définitif).\n\n**A. Pronéphros disparaît à la 4e SD** — VRAI.\n**B. Mésonéphros = développement complet** — VRAI.\n**C. Seul le mésonéphros est métamérisé** — FAUX : le pronéphros aussi est métamérisé.\n**D. Les 3 reins coexistent à la 4e semaine** — FAUX : ils se succèdent, ne coexistent pas tous à la 4e semaine.\n**E. Pronéphros = rein des batraciens** — FAUX : le pronéphros est le rein fonctionnel des poissons primitifs, pas des batraciens.",
      "questions": [
        {
          "enonce": "**[Embryologie · Les 3 reins · 2019 Session 1]**\n\nConcernant l'origine embryologique du système urogénital et la formation des 3 reins, indiquez la (les) proposition(s) exacte(s).",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le pronéphros, rudimentaire et non fonctionnel, disparaît à la 4e SD",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Le mésonéphros atteint un développement complet",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Seul le mésonéphros présente une métamérisation",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Les trois reins coexistent à la 4e semaine de développement",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Le pronéphros est le rein des batraciens",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : A B**\n\nA. **Vrai** — pronéphros rudimentaire, non fonctionnel, régresse vers la 4e SD.\nB. **Vrai** — le mésonéphros atteint un développement complet.\nC. **Faux** — le pronéphros est également métamérisé.\nD. **Faux** — les trois reins se succèdent dans le temps, ils ne coexistent pas tous à la 4e semaine.\nE. **Faux** — le pronéphros correspond au rein des poissons primitifs, pas des batraciens."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP gaz du sang — 2023-2024 (Q10)",
      "annee": "2023-2024",
      "rappel_cours": "**Acidose respiratoire chronique compensée (gaz D) :**\nGaz D = acidose **respiratoire** (PaCO₂ haute) **presque parfaitement compensée** (pH quasi normal grâce aux reins). Une compensation aussi complète prouve que le trouble est **chronique** (il a fallu ≥ 2–3 jours au rein pour s'adapter, donc pas « aigu »).\n- **Comment le rein compense ?** Il fabrique et réabsorbe plus de **bicarbonates** :\n  - il augmente l'**ammoniogenèse** dans le **tube proximal** (fabrication de NH₄⁺ qui permet d'éliminer les acides et de régénérer du bicarbonate) ;\n  - il augmente le **transport maximal de réabsorption des HCO₃⁻** (il en garde davantage).\n- **Conséquences sur les urines :** le rein élimine des acides → **urines acides (pH bas, pas > 7)** et **pas de bicarbonaturie** (il garde ses bicarbonates).",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP gaz du sang · 2023-2024]**\n\nLe tableau ci-dessous donne 6 gazométries artérielles présentant un désordre de l'équilibre acido-basique :\n· **A** — ventilation spontanée (air ambiant) : pH 7,30 · PaO₂ 118 · PaCO₂ 20 · HCO₃⁻ 10\n· **B** — ventilation spontanée (air ambiant) : pH 7,48 · PaO₂ 58 · PaCO₂ 32 · HCO₃⁻ 23\n· **C** — ventilation spontanée (air ambiant) : pH 7,52 · PaO₂ 54 · PaCO₂ 34 · HCO₃⁻ 28\n· **D** — ventilation spontanée (O₂ 1 L/min) : pH 7,37 · PaO₂ 64 · PaCO₂ 58 · HCO₃⁻ 34\n· **E** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 182 · PaCO₂ 50 · HCO₃⁻ 19\n· **F** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 222 · PaCO₂ 80 · HCO₃⁻ 31\n(PaO₂ et PaCO₂ en mmHg ; HCO₃⁻ en mmol/L)\n\nLa gazométrie artérielle D correspond à une acidose d'origine respiratoire presque parfaitement compensée. On peut en déduire :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Que le pH des urines de ce sujet est supérieur à 7",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Que le trouble respiratoire est aigu (moins de 48 heures)",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Que ce sujet présente une bicarbonaturie",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Que ce sujet présente une ammoniogénèse augmentée dans le tube proximal",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Que le transport maximal d'HCO₃⁻ dans le tubule rénal a augmenté",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : D, E**\n\nA. **Faux** — le rein élimine des acides pour compenser → les urines sont **acides** (pH bas), pas > 7.\nB. **Faux** — une compensation rénale presque parfaite demande plusieurs jours : le trouble est **chronique**, pas aigu.\nC. **Faux** — le rein réabsorbe et retient ses bicarbonates pour compenser : il n'y a **pas** de bicarbonaturie.\nD. **Valide** — la compensation passe par une **ammoniogenèse augmentée** dans le tube proximal (excrétion d'acide + régénération de HCO₃⁻).\nE. **Valide** — le rein augmente le **transport maximal de réabsorption des HCO₃⁻** pour élever les bicarbonates plasmatiques."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP HTA / mesure PA — 2023-2024 (Q1)",
      "annee": "2023-2024",
      "rappel_cours": "**Comment mesure-t-on correctement la pression artérielle (PA) ?**\n\nLa PA est la pression du sang dans les artères. On la mesure avec un **brassard** relié à un manomètre (sphygmomanomètre) et un **stéthoscope** posé sur l'artère au pli du coude.\n\n**Conditions de validité :**\n\n**Position** — Le patient doit être au repos, allongé (**décubitus**) ou assis, après quelques minutes de calme. Le bras doit être au niveau du cœur.\n\n**Stéthoscope** — On le place sur l'artère **humérale**, au bord **antéro-interne** du bras (côté du coude, pas côté externe).\n\n**Taille du brassard** — Le brassard doit recouvrir environ **80 %** de la circonférence du bras. Un brassard trop petit fausse la mesure (surestimation).\n\n**Gonflage** — On gonfle juste au-dessus de la pression qui fait disparaître le pouls, pas systématiquement à une valeur fixe comme 200 mmHg.\n\n**Éviter les excitants** — Le **café**, le tabac, l'effort ou le stress augmentent transitoirement la PA : il faut être à distance de leur prise.",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP HTA / mesure PA · 2023-2024]**\n\nMédecin généraliste, vous voyez pour la 1ʳᵉ fois Mme X, 30 ans, adressée par la médecine du travail pour une pression artérielle « trop élevée ». Vous mesurez la PA au sphygmomanomètre manuel.\n\nQuelle est ou quelles sont la ou les conditions à respecter pour considérer comme valide la mesure ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Mesure de la pression artérielle en décubitus",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Placer le stéthoscope au bord antéro-externe du bras",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Un brassard recouvrant 50 % du bras",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Gonfler le brassard systématiquement jusqu'à 200 mmHg",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Être à distance de la prise de café",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : A, E**\n\nA. **Valide** — La mesure doit se faire au repos, le patient allongé (décubitus) ou assis, bras au niveau du cœur.\nB. **Faux** — Le stéthoscope se place au bord antéro-**interne** du bras, sur l'artère humérale, pas antéro-externe.\nC. **Faux** — Le brassard doit recouvrir environ **80 %** de la circonférence du bras ; un brassard trop petit surestime la PA.\nD. **Faux** — On gonfle juste au-dessus de la disparition du pouls, pas systématiquement à 200 mmHg.\nE. **Valide** — Le café (comme le tabac ou l'effort) élève transitoirement la PA : il faut être à distance de sa prise."
        }
      ]
    },
    {
      "titre": "Anatomie — Prostate (zones) — 2019 S2 (QCM14)",
      "annee": "2019 S2",
      "rappel_cours": "Rappel des **zones de la prostate** (McNeal) :\n- **Zone de transition** : autour de l'**urètre** (siège de l'HBP).\n- **Zone centrale** : autour des **conduits éjaculateurs / vésicules séminales**.\n- **Zone périphérique** : la plus **volumineuse** (~70 %), siège du cancer.\n- **Stroma fibromusculaire** : **antérieur (ventral)**.\n- **Colliculus séminal** : sur la face **dorsale (postérieure)** de l'urètre prostatique.",
      "questions": [
        {
          "enonce": "**[Anatomie · Prostate · 2019 S2]**\n\nParmi les propositions suivantes concernant la prostate, laquelle (lesquelles) est (sont) exacte(s) ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "La zone de transition est autour de l'urètre.",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "La zone centrale est autour des vésicules séminales.",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La zone périphérique est la plus volumineuse.",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "La zone fibromusculaire est postérieure.",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Le colliculus séminal est situé sur la face ventrale (antérieure) de l'urètre prostatique.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : AC**\n\nA. **VRAI** — La zone de transition entoure l'urètre.\nB. **Faux** — Selon la réponse officielle, cet item est compté faux (la zone centrale entoure surtout les conduits éjaculateurs).\nC. **VRAI** — La zone périphérique est la plus volumineuse.\nD. **Faux** — Le stroma fibromusculaire est **antérieur (ventral)**, pas postérieur.\nE. **Faux** — Le colliculus séminal est sur la face **dorsale (postérieure)** de l'urètre, pas ventrale."
        }
      ]
    },
    {
      "titre": "Anatomie — Vascularisation des testicules — 2019 S2 (QCM2)",
      "annee": "2019 S2",
      "rappel_cours": "Vascularisation du **testicule** :\n- **Artères testiculaires** : naissent directement de l'**aorte abdominale** (sous les artères rénales).\n- **Drainage veineux** : le **plexus pampiniforme** se draine dans la veine testiculaire. À **droite**, elle se jette dans la **veine cave inférieure** ; à **gauche**, elle se jette dans la **veine rénale gauche** (angle droit → varicocèle plus fréquente à gauche).\n- **Artère crémastérique** (branche de l'épigastrique inférieure) : vascularise les enveloppes du cordon.\n- **Artère du conduit déférent** : s'anastomose avec l'artère testiculaire.",
      "questions": [
        {
          "enonce": "**[Anatomie · Vascularisation des testicules · 2019 S2]**\n\nToutes les propositions suivantes concernant la vascularisation des testicules sont exactes, SAUF UNE. Laquelle ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Les artères testiculaires ont pour origine l'aorte abdominale.",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La veine testiculaire gauche se draine directement dans la veine cave inférieure.",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "L'artère épididymaire postérieure, branche collatérale de l'artère testiculaire, s'anastomose avec l'artère du conduit déférent.",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "L'artère crémastérique est destinée aux enveloppes du cordon spermatique.",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Le plexus pampiniforme, organisé autour de l'artère testiculaire, donne la veine testiculaire.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B** (proposition fausse à cocher)\n\nA. **VRAI** — Les artères testiculaires naissent de l'aorte abdominale.\nB. **Faux (à cocher)** — La veine testiculaire **gauche** se draine dans la **veine rénale gauche**, pas directement dans la veine cave inférieure (c'est la droite qui rejoint la VCI).\nC. **VRAI** — L'artère épididymaire postérieure s'anastomose avec l'artère du conduit déférent.\nD. **VRAI** — L'artère crémastérique vascularise les enveloppes du cordon.\nE. **VRAI** — Le plexus pampiniforme donne la veine testiculaire."
        }
      ]
    },
    {
      "titre": "Embryologie — Ascension du rein — 2019 Session 2 (QCM16)",
      "annee": "2019 Session 2",
      "rappel_cours": "Même thème que l'ascension du rein : le métanéphros se forme bas (région sacrée) et gagne la région lombaire haute grâce au redressement de l'embryon et à la croissance du corps. Ici l'item E évoque la **croissance du bourgeon urétral** (qui, en s'allongeant, participe à l'ascension).\n\n**A. Région thoracique** — FAUX (région sacrée/pelvienne).\n**B. Lombo-sacré → lombaire haut** — VRAI.\n**C. Diminution de la courbure** — VRAI.\n**D. Croissance des néphrons** — FAUX.\n**E. Croissance du bourgeon urétral** — VRAI : l'allongement du bourgeon urétral accompagne l'ascension.",
      "questions": [
        {
          "enonce": "**[Embryologie · Ascension du rein · 2019 Session 2]**\n\nA propos de l'ascension du rein, indiquez la ou les propositions exactes :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le métanéphros est formé dans la région thoracique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Le métanéphros migre depuis la région lombo-sacrée vers la région lombaire haute",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La diminution de la courbure du corps de l'embryon permet l'ascension du rein",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Un des mécanismes d'ascension du rein est la croissance des néphrons",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Un des mécanismes d'ascension du rein est la croissance du bourgeon urétral",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : B C E**\n\nA. **Faux** — le métanéphros se forme en région sacrée/pelvienne, pas thoracique.\nB. **Vrai** — migration du lombo-sacré vers le lombaire haut.\nC. **Vrai** — le redressement de l'embryon participe à l'ascension.\nD. **Faux** — la croissance des néphrons n'est pas un mécanisme d'ascension.\nE. **Vrai** — l'allongement du bourgeon urétral accompagne l'ascension du rein."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP gaz du sang — 2023-2024 (Q2)",
      "annee": "2023-2024",
      "rappel_cours": "**Alcalose respiratoire (gaz B) :**\n- pH 7,48 = **alcalose** (sang trop basique, pH > 7,42).\n- La cause : la **PaCO₂ est basse (32)**. Comme le CO₂ est un acide, en manquer rend le sang basique → l'origine est **respiratoire** (hyperventilation : le patient élimine trop de CO₂).\n- Les **HCO₃⁻ sont normaux (23)** : les reins n'ont pas encore réagi.\n- Donc **pas de compensation** visible : alcalose respiratoire **aiguë, non compensée**.\n- Exemples typiques : crise d'angoisse, embolie pulmonaire, altitude.",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP gaz du sang · 2023-2024]**\n\nLe tableau ci-dessous donne 6 gazométries artérielles présentant un désordre de l'équilibre acido-basique :\n· **A** — ventilation spontanée (air ambiant) : pH 7,30 · PaO₂ 118 · PaCO₂ 20 · HCO₃⁻ 10\n· **B** — ventilation spontanée (air ambiant) : pH 7,48 · PaO₂ 58 · PaCO₂ 32 · HCO₃⁻ 23\n· **C** — ventilation spontanée (air ambiant) : pH 7,52 · PaO₂ 54 · PaCO₂ 34 · HCO₃⁻ 28\n· **D** — ventilation spontanée (O₂ 1 L/min) : pH 7,37 · PaO₂ 64 · PaCO₂ 58 · HCO₃⁻ 34\n· **E** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 182 · PaCO₂ 50 · HCO₃⁻ 19\n· **F** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 222 · PaCO₂ 80 · HCO₃⁻ 31\n(PaO₂ et PaCO₂ en mmHg ; HCO₃⁻ en mmol/L)\n\nÀ propos de la gazométrie artérielle B :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Elle correspond à une alcalose d'origine métabolique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Elle correspond à une alcalose d'origine respiratoire",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Elle correspond à une alcalose d'origine mixte",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le désordre est en voie de compensation",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "On n'observe pas de phénomène de compensation",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : B, E**\n\nA. **Faux** — une alcalose métabolique donnerait des HCO₃⁻ élevés ; ici ils sont normaux (23).\nB. **Valide** — pH 7,48 = alcalose ; PaCO₂ basse (32) = origine **respiratoire** (hyperventilation).\nC. **Faux** — pas de composante métabolique associée (HCO₃⁻ normaux).\nD. **Faux** — les reins n'ont pas encore réagi (HCO₃⁻ normaux) : pas de compensation.\nE. **Valide** — effectivement aucune compensation métabolique : trouble aigu non compensé."
        }
      ]
    },
    {
      "titre": "Embryologie — Origine du système urogénital — 2019 Session 2 (QCM3)",
      "annee": "2019 Session 2",
      "rappel_cours": "L'appareil **urogénital** dérive du **mésoblaste intermédiaire** (cordon néphrogène), situé entre le mésoblaste para-axial (somites) et le mésoblaste latéral (lame latérale).\n\n**A. La chorde** — FAUX (origine axiale, donne le nucleus pulposus).\n**B. Mésoblaste para-axial** — FAUX (donne les somites : muscles, vertèbres…).\n**C. Mésoblaste intermédiaire** — VRAI : c'est la bonne origine.\n**D. Mésoblaste latéral** — FAUX.\n**E. Cœlome intra-embryonnaire** — FAUX (cavité, non un tissu formateur du rein).",
      "questions": [
        {
          "enonce": "**[Embryologie · Origine urogénitale · 2019 Session 2]**\n\nQuelle est l'origine embryologique du système urogénital ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "La chorde",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Le mésoblaste para axial",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Le mésoblaste intermédiaire",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Le mésoblaste latéral",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Le cœlome intra embryonnaire",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : C**\n\nA. **Faux** — la chorde est une structure axiale, pas à l'origine du rein.\nB. **Faux** — le mésoblaste para-axial donne les somites.\nC. **Vrai** — le mésoblaste intermédiaire (cordon néphrogène) est à l'origine du système urogénital.\nD. **Faux** — le mésoblaste latéral donne les lames latérales, pas le rein.\nE. **Faux** — le cœlome est une cavité, pas un tissu formateur du rein."
        }
      ]
    },
    {
      "titre": "Embryologie — Origine du système urogénital — 2015 Session 2 (Q2)",
      "annee": "2015 Session 2",
      "rappel_cours": "L'appareil **urogénital** dérive du **mésoblaste intermédiaire** (cordon néphrogène).\n\n**A. La chorde** — FAUX.\n**B. Mésoblaste para-axial** — FAUX (somites).\n**C. Mésoblaste intermédiaire** — VRAI.\n**D. Mésoblaste latéral** — FAUX.\n**E. Cœlome intra-embryonnaire** — FAUX (cavité).",
      "questions": [
        {
          "enonce": "**[Embryologie · Origine urogénitale · 2015 Session 2]**\n\nConcernant l'origine embryologique du système urogénital, indiquez la proposition exacte :",
          "items": [
            {
              "lettre": "A",
              "enonce": "La chorde",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Le mésoblaste para axial",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Le mésoblaste intermédiaire",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Le mésoblaste latéral",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Le cœlome intra embryonnaire",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : C**\n\nA. **Faux** — la chorde n'est pas à l'origine du système urogénital.\nB. **Faux** — le mésoblaste para-axial donne les somites.\nC. **Vrai** — le mésoblaste intermédiaire est à l'origine du système urogénital.\nD. **Faux** — le mésoblaste latéral donne les lames latérales.\nE. **Faux** — le cœlome est une cavité, pas un tissu formateur."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP HTA / mesure PA — 2023-2024 (Q2)",
      "annee": "2023-2024",
      "rappel_cours": "**Quelles sont les valeurs « normales » de PA en consultation ?**\n\nLa PA s'écrit sous forme de deux chiffres, par exemple 120/80 mmHg :\n\n**PAS** (pression artérielle **systolique**) = le chiffre du **haut**, quand le cœur se contracte et éjecte le sang.\n\n**PAD** (pression artérielle **diastolique**) = le chiffre du **bas**, quand le cœur se relâche entre deux battements.\n\n**Seuils en consultation (au cabinet) :**\nOn parle d'hypertension artérielle (HTA) au cabinet quand **PAS ≥ 140 mmHg et/ou PAD ≥ 90 mmHg**.\n\nDonc une PA est considérée comme « normale » en consultation si :\n- PAS **strictement inférieure à 140** mmHg (ex : 135 → normal)\n- PAD **strictement inférieure à 90** mmHg (ex : 75 ou 85 → normal ; 90 → déjà pathologique)",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP HTA / mesure PA · 2023-2024]**\n\nMédecin généraliste, vous voyez pour la 1ʳᵉ fois Mme X, 30 ans, adressée par la médecine du travail pour une pression artérielle « trop élevée ». Vous mesurez la PA au sphygmomanomètre manuel.\n\nQuelles valeurs de pressions artérielles permettraient, en consultation, de considérer que la pression artérielle est « normale » ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Pression artérielle systolique à 135 mmHg",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Pression artérielle systolique à 140 mmHg",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Pression diastolique 75 mmHg",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Pression diastolique 85 mmHg",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Pression diastolique 90 mmHg",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : A, C, D**\n\nA. **Valide** — PAS à 135 mmHg est < 140 : c'est normal en consultation.\nB. **Faux** — PAS à 140 mmHg atteint le seuil d'HTA (≥ 140) : ce n'est pas « normal ».\nC. **Valide** — PAD à 75 mmHg est < 90 : normal.\nD. **Valide** — PAD à 85 mmHg est < 90 : normal.\nE. **Faux** — PAD à 90 mmHg atteint le seuil d'HTA (≥ 90) : ce n'est pas « normal »."
        }
      ]
    },
    {
      "titre": "Anatomie — Périnée masculin — 2015 S2 (Q17)",
      "annee": "2015 S2",
      "rappel_cours": "Vascularisation et drainage du **périnée masculin** :\n- **Artère pudendale (honteuse) interne** : branche de l'artère iliaque interne ; elle chemine dans le **canal pudendal (d'Alcock)** et vascularise les **corps érectiles** et le périnée profond.\n- **Artères pudendales externes** : branches de l'artère **fémorale** ; vascularisent le périnée superficiel.\n- **Drainage veineux profond** : par les **veines pudendales internes**.\n- **Drainage lymphatique** : le périnée **superficiel** draine vers les **lymphonœuds inguinaux (trigone fémoral)** ; le drainage **profond** se fait vers les nœuds **iliaques internes / pelviens** (et non le trigone fémoral).",
      "questions": [
        {
          "enonce": "**[Anatomie · Périnée masculin · 2015 S2]**\n\nConcernant le périnée masculin, indiquez la(es) proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Les corps érectiles sont vascularisés par des branches de l'artère pudendale interne",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Le périnée est vascularisé en superficie par les artères pudendales externes, branches de l'artère fémorale",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Le drainage veineux profond du périnée se fait par les veines pudendales internes",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "L'artère pudendale interne chemine au niveau périnéal dans le canal pudendal",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Le drainage lymphatique profond du périnée se fait vers les lymphonœuds du trigone fémoral",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : ABCD**\n\nA. **VRAI** — Les corps érectiles sont vascularisés par des branches de l'artère pudendale interne.\nB. **VRAI** — Les artères pudendales externes (branches de la fémorale) vascularisent le périnée superficiel.\nC. **VRAI** — Le drainage veineux profond se fait par les veines pudendales internes.\nD. **VRAI** — L'artère pudendale interne chemine dans le canal pudendal (d'Alcock).\nE. **Faux** — Le drainage lymphatique **profond** se fait vers les nœuds **pelviens (iliaques internes)** ; c'est le drainage superficiel qui va au trigone fémoral (inguinal)."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP HTA / mesure PA — 2023-2024 (Q4)",
      "annee": "2023-2024",
      "rappel_cours": "**Seuils d'HTA en automesure (à domicile)**\n\nEn **automesure** (le patient mesure lui-même sa PA chez lui, plusieurs fois par jour pendant quelques jours), les seuils sont **plus bas** qu'au cabinet, car il n'y a pas l'effet « blouse blanche ».\n\n**Seuils d'HTA en automesure : PAS ≥ 135 mmHg et/ou PAD ≥ 85 mmHg.**\n\n(Au cabinet, on retenait ≥ 140 / ≥ 90 ; à domicile c'est ≥ 135 / ≥ 85.)\n\nDonc affirment une HTA permanente en automesure :\n- une **PAS ≥ 135** mmHg (ex : 140 → oui ; 130 ou 125 → non)\n- une **PAD ≥ 85** mmHg (ex : 90 → oui ; 80 → non)",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP HTA / mesure PA · 2023-2024]**\n\nMédecin généraliste, vous voyez pour la 1ʳᵉ fois Mme X, 30 ans, adressée par la médecine du travail pour une pression artérielle « trop élevée ». Vous mesurez la PA au sphygmomanomètre manuel.\n\nQuelles valeurs de pression artérielle, évaluée par automesure, permettent d'affirmer une hypertension artérielle permanente ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Pression artérielle systolique : 140 mmHg",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Pression artérielle systolique : 130 mmHg",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Pression artérielle systolique : 125 mmHg",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Pression artérielle diastolique : 90 mmHg",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Pression artérielle diastolique : 80 mmHg",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : A, D**\n\nA. **Valide** — PAS à 140 mmHg est ≥ 135 : seuil d'HTA en automesure atteint.\nB. **Faux** — PAS à 130 mmHg est < 135 : pas d'HTA en automesure.\nC. **Faux** — PAS à 125 mmHg est < 135 : pas d'HTA.\nD. **Valide** — PAD à 90 mmHg est ≥ 85 : seuil d'HTA en automesure atteint.\nE. **Faux** — PAD à 80 mmHg est < 85 : pas d'HTA."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP HTA / mesure PA — 2023-2024 (Q3)",
      "annee": "2023-2024",
      "rappel_cours": "**Que conclure d'une PA élevée mesurée au cabinet ?**\n\nUne seule consultation avec une PA élevée ne suffit pas à affirmer une HTA **permanente**. La PA au cabinet peut être faussement élevée à cause du stress de la consultation.\n\n**HTA « blouse blanche »** — La PA est élevée au cabinet mais **normale** à domicile. C'est l'effet du stress de la visite médicale.\n\n**HTA masquée** — L'inverse : PA normale au cabinet mais **élevée** à domicile.\n\n**Mesure ambulatoire** — Pour trancher, on confirme par une mesure en dehors du cabinet : **automesure** (le patient prend sa PA chez lui) ou **MAPA** (Holter tensionnel sur 24 h). C'est indispensable avant d'affirmer une HTA permanente.\n\nDevant 158/100 mmHg au cabinet chez une patiente asymptomatique, on ne peut donc pas encore affirmer l'HTA permanente : il faut confirmer par une mesure ambulatoire.",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP HTA / mesure PA · 2023-2024]**\n\nMédecin généraliste, vous voyez pour la 1ʳᵉ fois Mme X, 30 ans, adressée par la médecine du travail pour une pression artérielle « trop élevée ». Vous mesurez la PA au sphygmomanomètre manuel.\n\nLors de cette consultation, la pression artérielle est mesurée à 3 reprises avec une moyenne de 158/100 mmHg. Mme X ne présente pas de symptômes. Quelle(s) conclusion(s) en tirez-vous ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'hypertension artérielle est confirmée",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Possible hypertension blouse blanche",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Possible hypertension artérielle masquée",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Il n'est pas possible à ce stade d'affirmer la présence d'une HTA permanente",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "L'hypertension doit être confirmée par une mesure ambulatoire de la pression artérielle",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : B, C, E**\n\nA. **Faux** — Une PA élevée sur une seule consultation ne confirme pas l'HTA ; il faut une confirmation ambulatoire.\nB. **Valide** — La PA élevée au cabinet peut n'être qu'un effet « blouse blanche » (normale à domicile).\nC. **Valide** — On évoque aussi la possibilité d'une HTA masquée à ce stade.\nD. **Faux** — (item retenu comme faux dans la clé) — la confirmation par mesure ambulatoire reste nécessaire.\nE. **Valide** — La confirmation passe par une mesure ambulatoire (automesure ou MAPA).\n\n_(Question neutralisée)_"
        }
      ]
    },
    {
      "titre": "Anatomie — Prostate (rapports) — 2019 S2 (QCM1)",
      "annee": "2019 S2",
      "rappel_cours": "Rapports et données de base de la **prostate** :\n- **Apex (sommet)** : en bas, en rapport avec le muscle **sphincter strié de l'urètre**.\n- **Base** : en haut, en rapport avec le **col vésical**.\n- **Faces latérales** : en rapport avec les **lames / nerfs caverneux** (bandelettes neurovasculaires).\n- **Volume normal** de l'adulte jeune ≈ **20 cc** (et non 150 cc, qui serait une prostate très pathologique).\n- Les **conduits éjaculateurs** naissent de l'union du conduit déférent et de la vésicule séminale, et traversent la prostate.",
      "questions": [
        {
          "enonce": "**[Anatomie · Prostate · 2019 S2]**\n\nToutes les propositions suivantes concernant la prostate sont exactes, SAUF UNE. Laquelle ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'apex de la prostate est en rapport avec le muscle sphincter de l'urètre.",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La base de la prostate est en rapport avec le col de la vessie.",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Les faces latérales de la prostate sont en rapport avec les nerfs caverneux du pénis.",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le volume normal de la prostate d'un adulte jeune est de 150 cc.",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Les conduits éjaculateurs sont le prolongement intraprostatique des conduits déférents.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D** (proposition fausse à cocher)\n\nA. **VRAI** — L'apex est en rapport avec le sphincter strié de l'urètre.\nB. **VRAI** — La base répond au col vésical.\nC. **VRAI** — Les faces latérales répondent aux nerfs caverneux.\nD. **Faux (à cocher)** — Le volume normal chez l'adulte jeune est d'environ **20 cc**, pas 150 cc.\nE. **VRAI** — Les conduits éjaculateurs prolongent les conduits déférents dans la prostate."
        }
      ]
    },
    {
      "titre": "Sémiologie — DP gaz du sang — 2023-2024 (Q7)",
      "annee": "2023-2024",
      "rappel_cours": "**Interpréter une alcalose mixte (gaz C) :**\nLe gaz C est une **alcalose mixte** : composante **respiratoire** (hyperventilation, PaCO₂ basse) + composante **métabolique** (HCO₃⁻ élevés).\n- **Pourquoi hyperventile-t-on ?** Souvent à cause d'un manque d'oxygène (hypoxémie) : une **maladie pulmonaire hypoxémiante** ou un **séjour en altitude** (l'air y est pauvre en O₂) poussent à respirer plus → alcalose respiratoire.\n- **Le versant métabolique (HCO₃⁻ hauts) :** si le rein fonctionne bien et qu'il y a trop de bicarbonates dans le sang, il en **élimine dans les urines** → urines contenant des bicarbonates.\n- **Pièges :** une **hypoventilation** donnerait une acidose respiratoire (contraire). Des **vomissements abondants** donnent une alcalose métabolique **pure** (perte d'acide gastrique), pas une composante respiratoire hypoxémiante.",
      "questions": [
        {
          "enonce": "**[Sémiologie · DP gaz du sang · 2023-2024]**\n\nLe tableau ci-dessous donne 6 gazométries artérielles présentant un désordre de l'équilibre acido-basique :\n· **A** — ventilation spontanée (air ambiant) : pH 7,30 · PaO₂ 118 · PaCO₂ 20 · HCO₃⁻ 10\n· **B** — ventilation spontanée (air ambiant) : pH 7,48 · PaO₂ 58 · PaCO₂ 32 · HCO₃⁻ 23\n· **C** — ventilation spontanée (air ambiant) : pH 7,52 · PaO₂ 54 · PaCO₂ 34 · HCO₃⁻ 28\n· **D** — ventilation spontanée (O₂ 1 L/min) : pH 7,37 · PaO₂ 64 · PaCO₂ 58 · HCO₃⁻ 34\n· **E** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 182 · PaCO₂ 50 · HCO₃⁻ 19\n· **F** — ventilation assistée (FiO₂ 100%) : pH 7,20 · PaO₂ 222 · PaCO₂ 80 · HCO₃⁻ 31\n(PaO₂ et PaCO₂ en mmHg ; HCO₃⁻ en mmol/L)\n\nLa gazométrie artérielle C correspond à une alcalose d'origine mixte chez une femme de 50 ans à fonction rénale normale.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Il est possible que cette femme souffre d'une maladie pulmonaire hypoxémiante",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Il est possible que cette femme fasse depuis quelques jours un séjour en altitude",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Il est possible que cette femme souffre d'une hypoventilation alvéolaire chronique",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Les urines de cette femme contiennent certainement des bicarbonates",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Il est possible que cette femme ait présenté des vomissements abondants",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : A, B, D**\n\nA. **Valide** — une maladie pulmonaire hypoxémiante entraîne une hyperventilation réflexe → alcalose respiratoire, compatible avec la composante respiratoire du gaz C.\nB. **Valide** — l'altitude (air pauvre en O₂) provoque une hyperventilation → alcalose respiratoire, plausible.\nC. **Faux** — une hypoventilation retiendrait le CO₂ et donnerait une **acidose** respiratoire, l'inverse d'une alcalose.\nD. **Valide** — avec un rein normal et des bicarbonates sanguins élevés, le rein en élimine dans les urines (bicarbonaturie).\nE. **Faux** — des vomissements abondants donnent une alcalose **métabolique** pure (perte de HCl), sans la composante respiratoire hypoxémiante observée."
        }
      ]
    },
    {
      "titre": "Anatomie — Prostate — 2019 S1 (Q22)",
      "annee": "2019 S1",
      "rappel_cours": "La prostate est classiquement divisée en **zones** (McNeal) :\n- **Zone de transition** : entoure l'**urètre** prostatique (siège de l'hypertrophie bénigne / HBP).\n- **Zone centrale** : entoure les **conduits éjaculateurs** et est en rapport avec les **vésicules séminales**.\n- **Zone périphérique** : la plus **volumineuse** (~70 % du tissu prostatique), siège de la majorité des cancers.\n- **Stroma fibromusculaire antérieur** : situé en **avant (ventral)**, non glandulaire.\nLe **colliculus (verumontanum)** est un relief situé sur la face **dorsale (postérieure)** de l'urètre prostatique, où s'abouchent les conduits éjaculateurs.",
      "questions": [
        {
          "enonce": "**[Anatomie · Prostate · 2019 S1]**\n\nParmi les propositions suivantes concernant la prostate, laquelle (lesquelles) est (sont) exacte(s) ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "La zone de transition est autour des vésicules séminales.",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La zone centrale est autour de l'urètre.",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La zone périphérique est la plus volumineuse (70 % du tissu prostatique).",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "La zone fibromusculaire est dorsale (postérieure).",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Le collicule séminal est situé sur la face dorsale (postérieure) de l'urètre prostatique.",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : CE**\n\nA. **Faux** — La zone de transition entoure l'**urètre**, pas les vésicules séminales.\nB. **Faux** — La zone centrale entoure les conduits éjaculateurs / vésicules séminales, pas l'urètre.\nC. **VRAI** — La zone périphérique est la plus volumineuse (~70 %).\nD. **Faux** — Le stroma fibromusculaire est **ventral (antérieur)**, pas postérieur.\nE. **VRAI** — Le colliculus séminal siège sur la face dorsale (postérieure) de l'urètre prostatique."
        }
      ]
    },
    {
      "titre": "Anatomie — Glandes surrénales — 2015 S2 (Q16)",
      "annee": "2015 S2",
      "rappel_cours": "Les **glandes surrénales** coiffent le pôle supérieur de chaque rein.\n- **Vascularisation artérielle** : triple, par des artères surrénaliennes **supérieure** (de l'artère diaphragmatique inférieure), **moyenne** (de l'aorte) et **inférieure** (de l'artère rénale).\n- **Drainage veineux** : la veine surrénalienne **droite** se jette directement dans la **veine cave inférieure** ; la **gauche** se jette dans la **veine rénale gauche** (comme la veine gonadique gauche).\n- La veine **diaphragmatique inférieure gauche** est souvent reliée à la veine surrénalienne gauche.",
      "questions": [
        {
          "enonce": "**[Anatomie · Glandes surrénales · 2015 S2]**\n\nConcernant les glandes surrénales, indiquez la(es) proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "La vascularisation artérielle des glandes surrénales se fait par trois branches artérielles",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "La glande surrénale droite se draine dans la veine rénale droite",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La glande surrénale gauche se draine par une veine directement dans la veine cave inférieure",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "L'artère rénale donne une branche surrénalienne inférieure",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "La veine diaphragmatique inférieure gauche est reliée à la veine surrénalienne gauche dans la majorité des cas.",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ADE**\n\nA. **VRAI** — Vascularisation par trois artères surrénaliennes (supérieure, moyenne, inférieure).\nB. **Faux** — La surrénale **droite** se draine dans la **veine cave inférieure**, pas dans la veine rénale droite.\nC. **Faux** — La surrénale **gauche** se draine dans la **veine rénale gauche**, pas directement dans la VCI.\nD. **VRAI** — L'artère rénale donne l'artère surrénalienne inférieure.\nE. **VRAI** — La veine diaphragmatique inférieure gauche est reliée à la veine surrénalienne gauche dans la majorité des cas."
        }
      ]
    },
    {
      "titre": "Embryologie — Ascension du rein — 2019 Session 1 (Q21)",
      "annee": "2019 Session 1",
      "rappel_cours": "Le **métanéphros** (rein définitif) se forme dans la région pelvienne/sacrée puis « monte » vers la région lombaire haute. Cette **ascension** est surtout apparente : elle résulte du redressement de l'embryon (diminution de la courbure) et de la croissance différentielle du corps du fœtus, plus que d'un déplacement actif du rein.\n\n**A. Formé en région thoracique** — FAUX : il se forme en région sacrée/pelvienne.\n**B. Migre du lombo-sacré vers le lombaire haut** — VRAI.\n**C. Diminution de la courbure du corps** — VRAI : le redressement de l'embryon participe à l'ascension.\n**D. Croissance des néphrons** — FAUX : ce n'est pas un mécanisme d'ascension.\n**E. Croissance du fœtus** — VRAI : la croissance du corps « éloigne » le rein de la région caudale.",
      "questions": [
        {
          "enonce": "**[Embryologie · Ascension du rein · 2019 Session 1]**\n\nConcernant l'ascension du rein, indiquez la (les) proposition(s) exacte(s).",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le métanéphros est formé dans la région thoracique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Le métanéphros migre depuis la région lombo-sacrée vers la région lombaire haute",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La diminution de la courbure du corps de l'embryon permet l'ascension du rein",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Un des mécanismes d'ascension du rein est la croissance des néphrons",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Un des mécanismes d'ascension du rein est la croissance du foetus",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : B C E**\n\nA. **Faux** — le métanéphros se forme dans la région sacrée/pelvienne, pas thoracique.\nB. **Vrai** — il migre de la région lombo-sacrée vers la région lombaire haute.\nC. **Vrai** — le redressement de l'embryon (diminution de la courbure) contribue à l'ascension.\nD. **Faux** — la croissance des néphrons n'est pas un mécanisme d'ascension.\nE. **Vrai** — la croissance du fœtus participe à l'ascension apparente du rein."
        }
      ]
    }
  ]
};

export default content;
