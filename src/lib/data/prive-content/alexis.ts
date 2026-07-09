import type { PriveCourseContent } from '../prive-courses';

// Banque d'annales corrigées UE5 — Physiologie & Sémiologie.
// Généré à partir des sujets d'annales corrigées (dossier Annales/UE5).
// Chaque QCM : corrigé officiel (champ correction) + rappel de cours débutant (champ rappel_cours).

const content: PriveCourseContent = {
  "fiche": {
    "parties": [
      {
        "numero": "I",
        "titre": "Banque d’annales corrigées — Physiologie & Sémiologie",
        "sous_parties": [
          {
            "titre": "Comment utiliser ce cours",
            "rows": [
              {
                "concept": "◆ Onglet QCM",
                "detail_md": "Toutes les annales sont dans l’onglet **QCM** ci-dessus.\n· 87 QCM d’annales de **Physiologie** et de **Sémiologie** (UE5), avec le **corrigé officiel** et un **rappel de cours** expliqué simplement, item par item.\n· Chaque question rappelle sa matière, son cours et son année.",
                "kind": "a_retenir"
              },
              {
                "concept": "Fonctionnement",
                "detail_md": "Coche la ou les propositions exactes puis **Valider**.\n· Après validation : le **corrigé officiel** (bleu) puis le **rappel de cours débutant** (vert).\n· « Facile » = acquise · « Difficile » = la question réapparaît plus loin.",
                "kind": "normal"
              },
              {
                "concept": "⚠ Piège « SAUF UNE »",
                "detail_md": "Quand l’énoncé dit « toutes exactes **SAUF UNE** », la bonne réponse à cocher est la **proposition FAUSSE** (la seule intruse).",
                "kind": "piege"
              }
            ]
          }
        ]
      }
    ],
    "points_cles": [
      "Physiologie : clairance rénale, filtration glomérulaire, bilan du sodium, du potassium, de l’eau, équilibre acido-basique, miction.",
      "Sémiologie : PA / protéinurie / hématurie, insuffisance rénale chronique.",
      "Chaque QCM : corrigé officiel + rappel de cours expliqué comme à un débutant.",
      "Total : 87 QCM d’annales corrigées."
    ]
  },
  "flashcards": [],
  "annales": [
    {
      "titre": "Physiologie — Clairance rénale — 2021-2022 (QCM 1)",
      "annee": "2021-2022",
      "rappel_cours": "La **clairance rénale** d'une substance, c'est le volume (ou débit) de plasma que le rein « nettoie » complètement de cette substance par unité de temps. On peut la voir comme le débit de plasma virtuellement débarrassé de la substance.\n\nTrois destins possibles pour une substance dans le rein : elle est **filtrée** (elle passe du sang vers l'urine au niveau du glomérule), **réabsorbée** (elle repart de l'urine vers le sang dans le tubule) ou **sécrétée** (elle est ajoutée dans l'urine par le tubule).\n\nOn compare la clairance au **DFG** (débit de filtration glomérulaire) :\n\n**A. FAUX** — La définition parle de débit **volumique** de plasma épuré, pas de débit « massique ». La formulation est incorrecte.\n\n**B. FAUX** — Une clairance nulle ne veut pas forcément dire « filtrée puis entièrement réabsorbée ». Une substance qui n'est **pas du tout filtrée** (comme l'**albumine**, trop grosse) a aussi une clairance nulle.\n\n**C. VRAI** — Si la clairance est nulle, la substance n'apparaît pas dans les urines : rien n'est éliminé.\n\n**D. VRAI** — Si une substance est librement filtrée mais que sa clairance est **inférieure au DFG**, c'est qu'une partie a été récupérée : elle est donc **réabsorbée**.\n\n**E. FAUX** — Si la clairance est **supérieure au DFG**, c'est que le rein en élimine plus qu'il n'en filtre : la substance est **sécrétée** (ajoutée), pas réabsorbée.",
      "questions": [
        {
          "enonce": "**[Physiologie · Clairance rénale · 2021-2022 — QCM 1]**\n\nA propos des clairances rénales, indiquez la ou les proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "La clairance rénale d'une substance est le débit massique de cette substance virtuellement éliminé du plasma par le rein",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Une substance dont la clairance rénale est nulle est toujours filtrée puis entièrement réabsorbée par le tubule rénal.",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Une substance dont la clairance rénale est nulle n'est jamais retrouvée dans les urines",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Une substance librement filtrée dont la clairance rénale est inférieure au débit de filtration glomérulaire est obligatoirement réabsorbée au niveau du tubule rénal",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Une substance librement filtrée dont la clairance rénale est supérieure au débit de filtration glomérulaire est obligatoirement réabsorbée au niveau du tubule rénal.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : CD**\n\nA. FAUX\n\nB. FAUX, si la substance n'est pas filtrée comme l'albumine par exemple sa clairance sera aussi nulle\n\nC. VRAI\n\nD. VRAI\n\nE. FAUX, si clairance > DFG => substance sécrétée et pas réabsorbée"
        }
      ]
    },
    {
      "titre": "Physiologie — Clairance rénale — 2021-2022 (QCM 10)",
      "annee": "2021-2022",
      "rappel_cours": "Le corps est fait de **compartiments liquidiens** : le plasma (dans les vaisseaux), le liquide interstitiel (entre les cellules) et le liquide intracellulaire (dans les cellules). Pour mesurer le volume d'un compartiment, on utilise des **traceurs** qui se répartissent seulement dans le compartiment voulu.\n\n**A. FAUX** — L'**inuline** (sucre non métabolisé qui reste hors des cellules) sert à mesurer le **volume extracellulaire total**, pas le volume plasmatique seul.\n\n**B. VRAI** — Dans l'interstitium, la concentration de **Na⁺** est très légèrement plus basse que dans l'eau du plasma. Cela vient de l'**effet Gibbs-Donnan** : les protéines chargées négativement du plasma retiennent un peu plus de cations de leur côté.\n\n**C. VRAI** — La **membrane cellulaire** (bicouche de lipides) laisse mal passer les substances hydrosolubles (ions, sucres, acides aminés) : il leur faut des transporteurs.\n\n**D. FAUX** — Au contraire, la **paroi des capillaires** est **très perméable** aux petites molécules hydrosolubles, qui passent facilement entre plasma et interstitium.\n\n**E. VRAI** — L'eau ne peut pas être pompée activement : ses mouvements entre les compartiments se font **passivement**, par osmose (elle suit le sel).",
      "questions": [
        {
          "enonce": "**[Physiologie · Clairance rénale · 2021-2022 — QCM 10]**\n\nA propos des compartiments liquidiens, indiquez la ou les propositions exactes :",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'inuline peut être utilisée pour mesurer précisément le volume plasmatique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La concentration en cation Na+ du milieu interstitiel est légèrement inférieure à sa concentration dans l'eau plasmatique",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La membrane cellulaire est peu perméable aux substances dissoutes hydrosolubles telles que les ions, les sucres et les acides aminés",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "La paroi capillaire est peu perméable aux substances dissoutes hydrosolubles telles que les ions, les sucres et les acides aminés",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Les mouvements d'eau entre compartiment extracellulaire et compartiment intracellulaire sont toujours passifs",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCE**\n\nA. FAUX, l'inuline permet de mesurer le volume extracellulaire total et non le volume plasmatique\n\nB. VRAI\n\nC. VRAI\n\nD. FAUX, la paroi capillaire est très perméable aux petites molécules hydrosolubles\n\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Clairance rénale — 2021-2022 (QCM 11)",
      "annee": "2021-2022",
      "rappel_cours": "Les cellules font entrer et sortir des substances grâce à différents **transports membranaires** :\n\n- **Diffusion facilitée** : passage à travers un transporteur, dans le sens du gradient (du plus concentré vers le moins concentré), sans dépense d'énergie.\n- **Transport actif** : utilise de l'énergie (ATP) pour aller contre le gradient.\n- **Co-transport** : une substance profite du gradient d'une autre (souvent le Na⁺) pour être transportée avec elle.\n\n**A. VRAI** — La diffusion facilitée suit le gradient, donc elle est **passive** (pas d'énergie dépensée).\n\n**B. VRAI** — Un **co-transport** peut faire entrer une substance **contre son propre gradient**, en utilisant l'énergie du gradient d'une autre molécule.\n\n**C. VRAI** — La diffusion facilitée passe par des transporteurs en nombre limité : quand ils sont tous occupés, le débit plafonne. Elle est donc **saturable**.\n\n**D. VRAI** — La **Na⁺,K⁺-ATPase** (pompe qui sort le Na⁺ de la cellule) tourne plus vite quand il y a plus de Na⁺ à l'intérieur à évacuer.\n\n**E. FAUX** — Dans les cellules principales du canal collecteur, les **canaux potassiques** (qui laissent sortir le K⁺ vers l'urine) sont surtout à la face **apicale** (côté urine), pas baso-latérale.",
      "questions": [
        {
          "enonce": "**[Physiologie · Clairance rénale · 2021-2022 — QCM 11]**\n\nA propos des transports de solutés, indiquez la ou les propositions exactes :",
          "items": [
            {
              "lettre": "A",
              "enonce": "La diffusion facilitée d'une substance à travers la membrane cellulaire est un phénomène passif",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Les co-transports membranaires peuvent permettre à une substance d'entrer dans les cellules malgré un gradient de concentration défavorable",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La diffusion facilitée d'une substance à travers la membrane cellulaire est un phénomène saturable",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "L'activité de la Na+,K+-ATPase des cellules principales du canal collecteur augmente lorsque la concentration intracellulaire de Na+ augmente",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Dans les cellules principales du canal collecteur, les conductances potassiques sont majoritairement situées à la face baso-latérale des cellules.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : ABCD**\n\nA. VRAI\n\nB. VRAI\n\nC. VRAI\n\nD. VRAI\n\nE. FAUX, les canaux potassiques sont majoritairement sur la membrane apicale"
        }
      ]
    },
    {
      "titre": "Physiologie — Clairance rénale — 2020-2021 (QCM 3)",
      "annee": "2020-2021",
      "rappel_cours": "Rappel sur les **compartiments liquidiens** et les traceurs qui servent à mesurer leur volume.\n\n**A. FAUX** — L'**inuline** mesure le **volume extracellulaire total**, pas le volume plasmatique.\n\n**B. VRAI** — La concentration de **Na⁺** de l'interstitium est un peu plus basse que dans l'eau plasmatique (effet Gibbs-Donnan lié aux protéines du plasma).\n\n**C. VRAI** — La **membrane cellulaire** laisse mal passer les ions, sucres et acides aminés (il faut des transporteurs).\n\n**D. FAUX** — La **paroi des capillaires** est au contraire **très perméable** aux petites molécules hydrosolubles.\n\n**E. VRAI** — Les mouvements d'eau entre les compartiments sont toujours **passifs** (osmose).",
      "questions": [
        {
          "enonce": "**[Physiologie · Clairance rénale · 2020-2021 — QCM 3]**\n\nA propos des compartiments liquidiens, indiquez la ou les propositions exactes :",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'inuline peut être utilisée pour mesurer précisément le volume plasmatique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La concentration en cation Na+ du milieu interstitiel est légèrement inférieure à sa concentration dans l'eau plasmatique",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La membrane cellulaire est peu perméable aux substances dissoutes hydrosolubles telles que les ions, les sucres et les acides aminés",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "La paroi capillaire est peu perméable aux substances dissoutes hydrosolubles telles que les ions, les sucres et les acides aminés",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Les mouvements d'eau entre compartiment extracellulaire et compartiment intracellulaire sont toujours passifs",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCE**\n\nA. FAUX, l'inuline sert à mesurer le volume extracellulaire total et non le volume plasmatique\n\nB. VRAI\n\nC. VRAI\n\nD. FAUX, la paroi du capillaire est très perméable aux petites molécules hydrosolubles\n\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Clairance rénale — 2019 session 1 (QCM 6)",
      "annee": "2019 session 1",
      "rappel_cours": "On compare la **clairance** d'une substance au **DFG** (débit de filtration glomérulaire) pour deviner son comportement dans le rein :\n\n- Clairance **< DFG** : la substance est en partie réabsorbée.\n- Clairance **= DFG** : elle est seulement filtrée (ex. inuline).\n- Clairance **> DFG** : elle est **sécrétée** en plus de la filtration.\n\nLa question demande la substance dont la clairance est **toujours supérieure au DFG**.\n\n**A. VRAI** — Le **PAH** (acide para-amino-hippurique) est filtré ET fortement **sécrété** par le tubule : le rein l'élimine quasi totalement en un passage, donc sa clairance est la plus élevée (elle approche le débit plasmatique rénal). Elle est toujours > DFG.\n\n**B, C, D, E** — L'eau libre, l'inuline, le sodium et le glucose ont des clairances inférieures ou égales au DFG (l'inuline = DFG, les autres < DFG car réabsorbés). Aucune n'est supérieure au DFG.",
      "questions": [
        {
          "enonce": "**[Physiologie · Clairance rénale · 2019 session 1 — QCM 6]**\n\nParmi les substances suivantes, indiquez celle dont la clairance rénale est toujours supérieure au débit de filtration glomérulaire :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Acide para-amino-hippurique (PAH)",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Eau libre",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Inuline",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Sodium",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Glucose",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : A**\n\nLa seule substance dont la clairance rénale est toujours supérieure au débit de filtration glomérulaire est l'acide para-amino-hippurique (PAH)."
        }
      ]
    },
    {
      "titre": "Physiologie — Clairance rénale — 2017 session 2 (QCM 6)",
      "annee": "2017 session 2",
      "rappel_cours": "Une **clairance rénale nulle** signifie que la substance n'est pas éliminée dans les urines. Deux cas donnent une clairance nulle : soit la substance est filtrée puis **entièrement réabsorbée**, soit elle n'est **pas filtrée du tout** (trop grosse pour passer le glomérule).\n\n**A. Sodium** — filtré et éliminé partiellement : clairance non nulle.\n\n**B. Potassium** — filtré, sécrété/éliminé : clairance non nulle.\n\n**C. Créatinine** — filtrée et éliminée (elle sert justement à estimer le DFG) : clairance non nulle.\n\n**D. Albumine — VRAI** — L'**albumine** est une grosse protéine qui ne passe pas le filtre glomérulaire chez le sujet sain : elle n'apparaît pas dans les urines, donc sa **clairance est nulle** (sauf maladie rénale).\n\n**E. Urée** — filtrée puis partiellement réabsorbée mais tout de même éliminée : clairance non nulle.",
      "questions": [
        {
          "enonce": "**[Physiologie · Clairance rénale · 2017 session 2 — QCM 6]**\n\nParmi les substances suivantes, indiquez celle dont la clairance rénale est nulle chez un sujet en bonne santé :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Sodium",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Potassium",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Créatinine",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Albumine",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Urée",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nD. La clairance de l'albumine est nulle sauf situation pathologique."
        }
      ]
    },
    {
      "titre": "Physiologie — Clairance rénale — 2016 session 2 (QCM 28)",
      "annee": "2016 session 2",
      "rappel_cours": "Exercice d'**association** : à chaque substance correspond un comportement de clairance, selon qu'elle est filtrée, réabsorbée ou sécrétée. On situe sa clairance par rapport au **DFG** (débit de filtration glomérulaire) et au **débit plasmatique rénal** (le débit total de plasma qui traverse le rein).\n\n- **A. Clairance nulle** : substance non éliminée (non filtrée, ou totalement réabsorbée).\n- **B. Clairance entre 0 et le DFG** : substance filtrée puis en grande partie réabsorbée.\n- **C. Clairance égale au DFG** : substance seulement filtrée (ex. inuline).\n- **D. Clairance entre le DFG et le débit plasmatique rénal** : substance filtrée ET en partie sécrétée.\n- **E. Clairance égale au débit plasmatique rénal** : substance filtrée ET fortement sécrétée (quasi tout épuré en un passage, ex. PAH).\n\nIci : une substance **filtrée et partiellement sécrétée**. La sécrétion ajoute de la substance dans l'urine, donc la clairance dépasse le DFG ; mais comme la sécrétion n'est que partielle, elle n'atteint pas le débit plasmatique rénal. La bonne réponse est donc **D** (clairance entre le DFG et le débit plasmatique rénal).",
      "questions": [
        {
          "enonce": "**[Physiologie · Clairance rénale · 2016 session 2 — QCM 28]**\n\nAssocier la clairance rénale correspondant au comportement rénal de la substance suivante.\n\nLégende des comportements de clairance :\nA. Clairance nulle\nB. Clairance comprise entre 0 et le débit de filtration glomérulaire (DFG)\nC. Clairance égale au DFG\nD. Clairance comprise entre le DFG et le débit plasmatique rénal\nE. Clairance égale au débit plasmatique rénal\n\nSubstance filtrée et partiellement sécrétée",
          "items": [
            {
              "lettre": "A",
              "enonce": "Clairance nulle",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Clairance comprise entre 0 et le débit de filtration glomérulaire (DFG)",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Clairance égale au DFG",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Clairance comprise entre le DFG et le débit plasmatique rénal",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Clairance égale au débit plasmatique rénal",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nQuand une substance est filtrée et partiellement sécrétée => clairance > DFG mais < débit plasmatique rénal."
        }
      ]
    },
    {
      "titre": "Physiologie — Clairance rénale — 2016 session 2 (QCM 29)",
      "annee": "2016 session 2",
      "rappel_cours": "Exercice d'**association** : à chaque substance correspond un comportement de clairance, selon qu'elle est filtrée, réabsorbée ou sécrétée. On situe sa clairance par rapport au **DFG** (débit de filtration glomérulaire) et au **débit plasmatique rénal**.\n\n- **A. Clairance nulle** : substance non éliminée.\n- **B. Clairance entre 0 et le DFG** : substance filtrée puis en grande partie réabsorbée.\n- **C. Clairance égale au DFG** : substance seulement filtrée.\n- **D. Clairance entre le DFG et le débit plasmatique rénal** : substance filtrée ET partiellement sécrétée.\n- **E. Clairance égale au débit plasmatique rénal** : substance filtrée ET fortement sécrétée.\n\nIci : le **glucose** pour une glycémie de 15 mmol/L. Le glucose est **filtré** au glomérule puis **presque totalement réabsorbé** dans le tubule proximal chez le sujet sain. Il n'en reste presque rien dans l'urine, donc sa clairance est très basse mais pas nulle : elle est **comprise entre 0 et le DFG**. La bonne réponse est **B**.",
      "questions": [
        {
          "enonce": "**[Physiologie · Clairance rénale · 2016 session 2 — QCM 29]**\n\nAssocier la clairance rénale correspondant au comportement rénal de la substance suivante.\n\nLégende des comportements de clairance :\nA. Clairance nulle\nB. Clairance comprise entre 0 et le débit de filtration glomérulaire (DFG)\nC. Clairance égale au DFG\nD. Clairance comprise entre le DFG et le débit plasmatique rénal\nE. Clairance égale au débit plasmatique rénal\n\nGlucose pour une concentration plasmatique de 15 mmol/L",
          "items": [
            {
              "lettre": "A",
              "enonce": "Clairance nulle",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Clairance comprise entre 0 et le débit de filtration glomérulaire (DFG)",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Clairance égale au DFG",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Clairance comprise entre le DFG et le débit plasmatique rénal",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Clairance égale au débit plasmatique rénal",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B**\n\nLe glucose est filtré au glomérule mais presque totalement réabsorbé dans le tubule proximal chez un sujet sain, donc seule une très faible quantité (proche de zéro) atteint l'urine, ce qui fait que sa clairance est comprise entre 0 et le débit de filtration glomérulaire."
        }
      ]
    },
    {
      "titre": "Physiologie — Clairance rénale — 2016 session 2 (QCM 30)",
      "annee": "2016 session 2",
      "rappel_cours": "Exercice d'**association** : à chaque substance correspond un comportement de clairance, selon qu'elle est filtrée, réabsorbée ou sécrétée. On situe sa clairance par rapport au **DFG** (débit de filtration glomérulaire) et au **débit plasmatique rénal**.\n\n- **A. Clairance nulle** : substance non éliminée.\n- **B. Clairance entre 0 et le DFG** : substance filtrée puis en grande partie réabsorbée.\n- **C. Clairance égale au DFG** : substance seulement filtrée.\n- **D. Clairance entre le DFG et le débit plasmatique rénal** : substance filtrée ET partiellement sécrétée.\n- **E. Clairance égale au débit plasmatique rénal** : substance filtrée ET fortement sécrétée.\n\nIci : le **PAH** (acide para-aminohippurique). Il est **filtré** puis **fortement sécrété** par le tubule : le rein l'épure quasi totalement en un seul passage. Sa clairance est donc la plus élevée possible et **égale au débit plasmatique rénal** (c'est d'ailleurs pour cela qu'on l'utilise pour mesurer ce débit). La bonne réponse est **E**.",
      "questions": [
        {
          "enonce": "**[Physiologie · Clairance rénale · 2016 session 2 — QCM 30]**\n\nAssocier la clairance rénale correspondant au comportement rénal de la substance suivante.\n\nLégende des comportements de clairance :\nA. Clairance nulle\nB. Clairance comprise entre 0 et le débit de filtration glomérulaire (DFG)\nC. Clairance égale au DFG\nD. Clairance comprise entre le DFG et le débit plasmatique rénal\nE. Clairance égale au débit plasmatique rénal\n\nAcide paraaminohippurique (PAH)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Clairance nulle",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Clairance comprise entre 0 et le débit de filtration glomérulaire (DFG)",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Clairance égale au DFG",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Clairance comprise entre le DFG et le débit plasmatique rénal",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Clairance égale au débit plasmatique rénal",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : E**\n\nL'acide para-aminohippurique (PAH) est filtré et fortement sécrété dans les tubules, ce qui fait que sa clairance rénale est égale au débit plasmatique rénal."
        }
      ]
    },
    {
      "titre": "Physiologie — Clairance rénale — 2015 session 1 (QCM 10)",
      "annee": "2015 session 1",
      "rappel_cours": "Rappel des repères de **clairance** : on compare toujours la clairance d'une substance au **DFG** (débit de filtration glomérulaire) et au **débit plasmatique rénal**.\n\n**A. FAUX** — La clairance de l'**inuline** mesure le **DFG**, pas le débit plasmatique rénal (c'est le PAH qui mesure ce dernier).\n\n**B. FAUX** — La clairance du glucose n'est pas toujours nulle : chez le **diabétique**, si la glycémie dépasse le seuil de réabsorption, le glucose apparaît dans les urines (**glycosurie**) et la clairance devient > 0.\n\n**C. FAUX** — Une substance filtrée et **partiellement réabsorbée** a une clairance comprise **entre 0 et le DFG** (on en récupère une partie), et non entre le DFG et le débit plasmatique rénal.\n\n**D. VRAI** — Une substance **ni filtrée ni sécrétée** n'arrive jamais dans l'urine : sa **clairance est nulle**.\n\n**E. FAUX** — Une **clairance de l'eau libre positive** signifie qu'on élimine plus d'eau que de soluté : les urines sont **hypotoniques** (diluées), pas hypertoniques.",
      "questions": [
        {
          "enonce": "**[Physiologie · Clairance rénale · 2015 session 1 — QCM 10]**\n\nA propos des clairances, indiquez la proposition exacte :",
          "items": [
            {
              "lettre": "A",
              "enonce": "La clairance de l'inuline permet de mesurer le débit plasmatique rénal",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La clairance du glucose est toujours nulle même chez le patient diabétique",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Une substance librement filtrée et partiellement réabsorbée a une clairance comprise entre le débit de filtration glomérulaire et le débit plasmatique rénal.",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Une substance ni filtrée ni sécrétée a une clairance nulle",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Une clairance de l'eau libre positive correspond à des urines hypertoniques.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nA. FAUX, la clairance de l'inuline mesure le débit de filtration glomérulaire (DFG), et non le débit plasmatique rénal.\n\nB. FAUX, chez les patients diabétiques, si le glucose dépasse le seuil de réabsorption il apparaît dans les urines (glycosurie) donc la clairance > 0\n\nC. FAUX, une substance librement filtrée et partiellement réabsorbée a une clairance comprise entre 0 et le DFG et non entre le DFG et le débit plasmatique rénal\n\nD. VRAI\n\nE. FAUX, une clairance positive d'eau libre correspond à une excrétion d'eau plus importante que le soluté, les urines sont donc hypotoniques et non hypertoniques"
        }
      ]
    },
    {
      "titre": "Physiologie — Filtration glomérulaire — 2022-2023 (QCM 5)",
      "annee": "2022-2023",
      "rappel_cours": "La **filtration glomérulaire** est le passage du plasma à travers le filtre du glomérule (le petit peloton de capillaires du rein) pour former l'urine primitive. C'est un phénomène **passif** : il ne consomme pas d'énergie (pas d'ATP), il est poussé par la **pression** du sang, comme un filtre à café.\n\nA. **FAUX** : c'est un processus **passif**, pas actif (aucune pompe ne consomme d'énergie).\nB. **VRAI** : le glucose passe librement le filtre, donc sa concentration est la **même** dans le filtrat et dans le sang qui repart (artériole efférente).\nC. **FAUX** : la pression d'ultrafiltration **diminue** le long du capillaire, car au fur et à mesure que l'eau part, les protéines se concentrent et la **pression oncotique** (qui retient l'eau) augmente.\nD. **VRAI** : serrer l'artériole de sortie (efférente) fait monter la pression **en amont**, dans le glomérule, donc on filtre plus.\nE. **VRAI** : si la pression monte trop dans l'artériole d'entrée (afférente), elle se **contracte par réflexe** (mécanisme myogénique) pour protéger le glomérule.",
      "questions": [
        {
          "enonce": "**[Physiologie · Filtration glomérulaire · 2022-2023 — QCM 5]**\n\nA propos de la filtration glomérulaire, indiquez la ou les réponse(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "La filtration glomérulaire est un processus actif",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La concentration plasmatique de glucose dans l'artériole efférente du glomérule est identique à la concentration de glucose dans le filtrat glomérulaire",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La pression d'ultrafiltration est identique sur toute la longueur du capillaire glomérulaire",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "La vasoconstriction de l'artériole efférente du glomérule (sans autre modification par ailleurs) favorise la filtration glomérulaire",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Une augmentation de pression sanguine dans l'artériole afférente du glomérule induit une vasoconstriction « réflexe » de celle-ci.",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BDE**\n\nA. FAUX, c'est un processus passif.\nB. VRAI.\nC. FAUX, la pression d'ultrafiltration diminue le long du capillaire glomérulaire.\nD. VRAI.\nE. VRAI."
        }
      ]
    },
    {
      "titre": "Physiologie — Filtration glomérulaire — 2021-2022 (Question 4)",
      "annee": "2021-2022",
      "rappel_cours": "Le **débit de filtration glomérulaire (DFG)** est le volume de plasma filtré par les reins chaque minute (normalement ≈ **100-120 mL/min** chez l'adulte). C'est l'indicateur principal du bon fonctionnement du rein.\n\nA. **VRAI** : la filtration est **purement passive**, poussée par la pression du sang.\nB. **VRAI** : on ne peut pas filtrer plus de plasma qu'il n'en arrive au rein ; le DFG reste donc toujours **inférieur** au débit plasmatique rénal (fraction filtrée ≈ 20 %).\nC. **VRAI** : le DFG normal est ≈ 100 mL/min ; à **10 mL/min** (insuffisance rénale sévère), le rein n'épure plus assez.\nD. **FAUX** (c'est le piège) : quand le **système rénine-angiotensine** est stimulé, l'angiotensine II serre l'artériole **efférente** (de sortie), ce qui augmente la pression dans le glomérule, **augmente** le DFG et donc **augmente** la fraction filtrée (elle ne diminue pas).\nE. **VRAI** : c'est la **balance glomérulo-tubulaire** : si on filtre plus, le tube proximal réabsorbe plus de sodium et d'eau pour compenser.",
      "questions": [
        {
          "enonce": "**[Physiologie · Filtration glomérulaire · 2021-2022 — Question 4]**\n\nA propos de la filtration glomérulaire, indiquez la ou les proposition(s) exacte(s). Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Il s'agit d'un phénomène purement passif",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Le débit de filtration glomérulaire ne peut en aucun cas excéder le débit plasmatique rénal",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Un débit de filtration glomérulaire de 10 mL/min est insuffisant pour permettre les fonctions d'épuration du rein",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "La fraction filtrée diminue en cas de stimulation du système rénine-angiotensine intrarénal",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Une augmentation du débit de filtration glomérulaire entraine une augmentation de la réabsorption proximale de sodium et d'eau.",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ABCE**\n\nA. VRAI.\nB. VRAI.\nC. VRAI (normal = 100 mL/min chez l'adulte).\nD. FAUX, la stimulation du système rénine-angiotensine provoque une vasoconstriction de l'artériole efférente, ce qui augmente le DFG et fait augmenter la fraction filtrée initialement.\nE. VRAI."
        }
      ]
    },
    {
      "titre": "Physiologie — Filtration glomérulaire — 2021-2022 (Question 13)",
      "annee": "2021-2022",
      "rappel_cours": "L'**autorégulation** permet au rein de garder un débit sanguin et un DFG **stables** même si la pression artérielle change. Deux mécanismes : le **mécanisme myogénique** (le muscle de l'artériole afférente se contracte quand la pression monte) et le **rétrocontrôle tubuloglomérulaire (TGF)** (la macula densa, capteur dans le tube, ajuste l'artériole afférente).\n\nA. **FAUX** : le TGF agit surtout sur l'artériole **afférente** (d'entrée), pas efférente.\nB. **VRAI** : la macula densa libère de l'**adénosine**, qui contracte l'artériole afférente et baisse le DFG.\nC. **FAUX** : le mécanisme myogénique est une **contraction** (vasoconstriction) de l'artériole afférente en réponse à une hausse de pression, jamais une vasodilatation.\nD. **FAUX** : le mécanisme myogénique se déclenche quand la pression **augmente** (pas quand elle diminue).\nE. **FAUX** : le mécanisme myogénique **ne diminue pas** le DFG : il ajuste la résistance de l'afférente pour **maintenir le DFG stable**.",
      "questions": [
        {
          "enonce": "**[Physiologie · Filtration glomérulaire · 2021-2022 — Question 13]**\n\nA propos de l'autorégulation du débit sanguin rénal. Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le rétrocontrôle tubuloglomérulaire joue sur les résistances de l'artériole efférente du glomérule",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Le rétrocontrôle tubuloglomérulaire fait intervenir la libération d'adénosine par les cellules de la macula",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La mise en jeu du mécanisme myogénique induit une vasodilatation de l'artériole afférente",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le mécanisme myogénique est mis en jeu en cas de diminution de pression dans l'artériole afférente",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "La mise en jeu du mécanisme myogénique induit une diminution du débit de filtration glomérulaire",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B**\n\nA. FAUX, le TGF agit principalement sur l'artériole afférente et non efférente pour réguler le débit sanguin et le DFG.\nB. VRAI.\nC. FAUX, le mécanisme myogénique correspond à la contraction réflexe des cellules musculaires lisses de l'artériole afférente en réponse à une augmentation de pression ; il ne provoque donc pas de vasodilatation.\nD. FAUX.\nE. FAUX, le mécanisme myogénique ne diminue pas le débit de filtration glomérulaire ; il ajuste automatiquement la résistance de l'artériole afférente pour maintenir le DFG stable, que la pression augmente ou diminue."
        }
      ]
    },
    {
      "titre": "Physiologie — Filtration glomérulaire — 2020-2021 (QCM 6)",
      "annee": "2020-2021",
      "rappel_cours": "Même thème que la question précédente : l'**autorégulation du débit sanguin rénal**, qui maintient débit et DFG stables via le **mécanisme myogénique** (contraction de l'artériole afférente) et le **rétrocontrôle tubuloglomérulaire (TGF)** faisant intervenir la **macula densa**.\n\nA. **FAUX** : le TGF agit sur l'artériole **afférente** (d'entrée), pas efférente.\nB. **VRAI** : la **macula densa** libère de l'**adénosine** pour ajuster l'artériole afférente.\nC. **FAUX** : le mécanisme myogénique = **vasoconstriction** de l'afférente, pas vasodilatation.\nD. **FAUX** : il se déclenche quand la pression **augmente**, pas quand elle diminue.\nE. **VRAI** (selon la correction officielle de cette session) : en contractant l'afférente, le mécanisme myogénique peut réduire le DFG face à une hausse de pression, ce qui le ramène à sa valeur stable.\n\nNote : la même proposition E a été comptée FAUSSE dans l'annale 2021-2022 ; retiens surtout l'idée que le myogénique sert à **stabiliser** le DFG.",
      "questions": [
        {
          "enonce": "**[Physiologie · Filtration glomérulaire · 2020-2021 — QCM 6]**\n\nA propos de l'autorégulation du débit sanguin rénal :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le rétrocontrôle tubuloglomérulaire joue sur les résistances de l'artériole efférente du glomérule",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Le rétrocontrôle tubuloglomérulaire fait intervenir la libération d'adénosine par les cellules de la macula densa",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La mise en jeu du mécanisme myogénique induit une vasodilatation de l'artériole afférente",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le mécanisme myogénique est mis en jeu en cas de diminution de pression dans l'artériole afférente",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "La mise en jeu du mécanisme myogénique induit une diminution du débit de filtration glomérulaire",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BE**\n\nA. FAUX, sur l'artériole afférente et non efférente.\nB. VRAI.\nC. FAUX.\nD. FAUX.\nE. VRAI."
        }
      ]
    },
    {
      "titre": "Physiologie — Filtration glomérulaire — 2019 session 1 (Question 25)",
      "annee": "2019 (session 1)",
      "rappel_cours": "Le **débit sanguin rénal (DSR)** est la quantité de sang qui traverse les reins par minute. Il est **autorégulé** : il reste à peu près constant tant que la pression artérielle moyenne reste dans une fourchette normale.\n\nA. **VRAI** : grâce à l'autorégulation, le DSR est **stable** entre environ **80 et 140 mmHg** de pression artérielle moyenne.\nB. **FAUX** : le DSR représente environ **20-25 %** du débit cardiaque, pas 80 %.\nC. **FAUX** : la majeure partie du sang va à la **corticale** (l'écorce du rein, où sont les glomérules), pas à la médullaire.\nD. **FAUX** : si le DSR **diminue**, le DFG **diminue** aussi (moins de sang = moins de filtration) ; ils varient dans le **même sens**.\nE. **FAUX** : la proposition A étant exacte, « aucune n'est exacte » est fausse.",
      "questions": [
        {
          "enonce": "**[Physiologie · Filtration glomérulaire · 2019 session 1 — Question 25]**\n\nParmi les propositions suivantes concernant le débit sanguin rénal (DSR), indiquez la (les) réponse(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le DSR est relativement constant lorsque la pression artérielle systémique moyenne est comprise entre 80 et 140 mmHg",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Le DSR représente 80% du débit cardiaque",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La majeure partie du DSR est distribuée dans la médullaire rénale",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Une diminution du DSR induit une augmentation du débit de filtration glomérulaire",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Aucune de ces propositions précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : A**\n\nA. VRAI.\nB. FAUX.\nC. FAUX, dans la corticale.\nD. FAUX, une diminution du DSR induit une diminution du débit de filtration glomérulaire.\nE. FAUX."
        }
      ]
    },
    {
      "titre": "Physiologie — Filtration glomérulaire — 2018 session 2 (QCM 4)",
      "annee": "2018 (session 2)",
      "rappel_cours": "Attention, question **« toutes exactes SAUF UNE »** : la bonne réponse à cocher est la proposition **FAUSSE** (l'intrus). Ici c'est **B**.\n\nRappel : le long du capillaire glomérulaire, la **pression hydrostatique** (celle du sang qui pousse) varie **peu**, mais la **pression oncotique** (celle des protéines qui retiennent l'eau) **augmente** car l'eau part dans le filtrat et les protéines se concentrent.\n\nA. VRAI : la pression hydrostatique varie **peu** le long du capillaire.\nB. **FAUX = la réponse à cocher** : la pression oncotique plasmatique **ne reste pas constante**, elle **augmente** le long du capillaire (le piège consiste à dire qu'elle « ne varie pas »).\nC. VRAI : la pression hydrostatique est plus élevée dans les capillaires **glomérulaires** (où l'on filtre) que dans les capillaires **péritubulaires** (où l'on réabsorbe).\nD. VRAI : les **cellules mésangiales** peuvent se contracter et modifier la surface de filtration, donc le DFG.\nE. VRAI : le DFG **diminue** physiologiquement avec l'**âge**.",
      "questions": [
        {
          "enonce": "**[Physiologie · Filtration glomérulaire · 2018 session 2 — QCM 4]**\n\nToutes les propositions suivantes concernant la filtration glomérulaire sont exactes, SAUF UNE. Laquelle ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "La pression hydrostatique varie peu entre le début et la fin du capillaire glomérulaire",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La pression oncotique plasmatique ne varie pas entre le début et la fin du capillaire glomérulaire",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La pression hydrostatique dans les capillaires glomérulaires est plus élevée que la pression hydrostatique dans les capillaires péritubulaires",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "La contraction des cellules mésangiales peut modifier le débit de filtration glomérulaire",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Le débit de filtration glomérulaire diminue avec l'âge.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B**\n\nLa proposition fausse (donc à cocher) est B.\nA. VRAI, la pression hydrostatique varie peu le long du capillaire.\nB. FAUX, la pression oncotique augmente le long du capillaire (elle ne reste pas constante).\nC. VRAI.\nD. VRAI.\nE. VRAI."
        }
      ]
    },
    {
      "titre": "Physiologie — Filtration glomérulaire — 2017 session 2 (Question 20)",
      "annee": "2017 (session 2)",
      "rappel_cours": "Cette question mêle la filtration glomérulaire et le bilan du sodium. Une **sténose de l'artère rénale** (rétrécissement) fait arriver **moins de sang** au rein : celui-ci « croit » que la pression est basse et déclenche le **système rénine-angiotensine-aldostérone (SRAA)**.\n\nA. VRAI : l'**aldostérone** fait réabsorber le sodium, donc la **natriurèse** (sodium éliminé dans l'urine) **diminue**.\nB. **FAUX = piège** : l'aldostérone est ici **secondaire** (déclenchée par le rein/la rénine) → on parle d'**hyperaldostéronisme secondaire**, et non primaire (qui viendrait d'une tumeur de la surrénale).\nC. VRAI : l'aldostérone fait perdre du potassium dans l'urine → **hypokaliémie** (potassium sanguin bas).\nD. VRAI : le SRAA et la rétention de sodium provoquent une **hypertension artérielle** (HTA rénovasculaire).\nE. VRAI : l'**angiotensine II** contracte l'artériole **efférente** pour maintenir le DFG malgré la baisse de débit.",
      "questions": [
        {
          "enonce": "**[Physiologie · Filtration glomérulaire · 2017 session 2 — Question 20]**\n\nUne sténose importante d'une artère rénale peut induire (une ou plusieurs réponses exactes) : (question mélangeant le cours de FG et du bilan de sodium)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Une réduction de la natriurèse",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Un hyperaldostéronisme primaire",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Une hypokaliémie",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Une hypertension artérielle",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Une vasoconstriction de l'artériole efférente du glomérule",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ACDE**\n\nA. VRAI.\nB. FAUX, ici l'aldostérone est secondaire => aldostéronisme secondaire et non primaire.\nC. VRAI.\nD. VRAI.\nE. VRAI."
        }
      ]
    },
    {
      "titre": "Physiologie — Filtration glomérulaire — 2015 session 1 (Question 13)",
      "annee": "2015 (session 1)",
      "rappel_cours": "Question **« toutes exactes SAUF UNE »** : la bonne réponse à cocher est la proposition **FAUSSE** (l'intrus). Ici c'est **C**.\n\nRappel : le long du capillaire glomérulaire, la **pression hydrostatique** varie **peu**, mais la **pression oncotique** (protéines) **augmente** au fur et à mesure que l'eau est filtrée.\n\nA. VRAI : la pression hydrostatique varie **peu** le long du capillaire.\nB. VRAI : la pression hydrostatique est plus élevée dans les capillaires **glomérulaires** que dans les capillaires **péritubulaires**.\nC. **FAUX = la réponse à cocher** : la pression oncotique plasmatique **ne reste pas constante**, elle **augmente** le long du capillaire (piège identique à l'annale 2018).\nD. VRAI : les **cellules mésangiales** peuvent se contracter et modifier le DFG.\nE. VRAI : le DFG **diminue** avec l'**âge**.",
      "questions": [
        {
          "enonce": "**[Physiologie · Filtration glomérulaire · 2015 session 1 — Question 13]**\n\nToutes les propositions suivantes concernant la filtration glomérulaire sont exactes, SAUF UNE. Laquelle ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "La pression hydrostatique varie peu entre le début et la fin du capillaire glomérulaire",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La pression hydrostatique dans les capillaires glomérulaires est plus élevée que la pression hydrostatique dans les capillaires péritubulaires",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La pression oncotique plasmatique ne varie pas entre le début et la fin du capillaire glomérulaire",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "La contraction des cellules mésangiales peut modifier le débit de filtration glomérulaire",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Le débit de filtration glomérulaire diminue avec l'âge.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : C**\n\nLa proposition fausse (donc à cocher) est C.\nA. VRAI, la pression hydrostatique varie peu le long du capillaire.\nB. VRAI, la pression hydrostatique glomérulaire est supérieure à la pression péritubulaire.\nC. FAUX, la pression oncotique plasmatique augmente le long du capillaire (elle ne reste pas constante).\nD. VRAI.\nE. VRAI."
        }
      ]
    },
    {
      "titre": "Physiologie — Filtration glomérulaire — 2015 session 1 (Question 23)",
      "annee": "2015 (session 1)",
      "rappel_cours": "La **régulation du DFG** repose sur le contrôle du calibre des artérioles afférente (entrée) et efférente (sortie) du glomérule.\n\nA. **VRAI** : le **mécanisme myogénique** se déclenche quand la pression **augmente** dans l'artériole **afférente** (l'artériole se contracte pour protéger le glomérule).\nB. **FAUX** : le **rétrocontrôle tubuloglomérulaire** agit sur l'artériole **afférente**, pas efférente.\nC. **FAUX** : l'**angiotensine II** contracte surtout l'artériole **efférente** (de sortie), pas l'afférente.\nD. **FAUX** : la **rénine** est libérée quand la pression **diminue** (et non augmente) dans l'artériole afférente.\nE. **FAUX** : l'**enzyme de conversion de l'angiotensine (ECA)** est produite surtout par le **poumon** (endothélium), pas par la macula densa.",
      "questions": [
        {
          "enonce": "**[Physiologie · Filtration glomérulaire · 2015 session 1 — Question 23]**\n\nParmi les propositions suivantes concernant la régulation du débit de filtration glomérulaire (DFG), indiquez celle ou celles qui est (sont) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le mécanisme myogénique est mis en jeu par l'augmentation de pression dans l'artériole afférente du glomérule",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Le rétrocontrôle tubuloglomérulaire aboutit à une vasoconstriction de l'artériole efférente du glomérule",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "L'angiotensine II est responsable d'une vasoconstriction prédominant sur l'artériole afférente du glomérule",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "L'augmentation de pression dans l'artériole afférente du glomérule induit la libération de rénine par les cellules juxta-glomérulaires",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Les cellules de la Macula Densa produisent l'enzyme de conversion de l'angiotensine",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : A**\n\nA. VRAI.\nB. FAUX, l'artériole afférente.\nC. FAUX, sur l'artériole efférente.\nD. FAUX, la rénine est libérée lorsque la pression diminue.\nE. FAUX."
        }
      ]
    },
    {
      "titre": "Physiologie — Filtration glomérulaire — 2015 session 2 (Question 10)",
      "annee": "2015 (session 2)",
      "rappel_cours": "Question **« toutes exactes SAUF UNE »** : la bonne réponse à cocher est la proposition **FAUSSE** (l'intrus). Ici c'est **D**.\n\nPour **mesurer le DFG**, il faut une substance qui soit **uniquement filtrée** par le glomérule (ni réabsorbée, ni sécrétée) : c'est le principe de la **clairance**.\n\nA. VRAI : la substance idéale doit être **uniquement et librement filtrée**.\nB. VRAI : la méthode de **référence** est la clairance de l'**inuline** (mesure la plus exacte).\nC. VRAI : la clairance de la **créatinine** est **facile** à mesurer en pratique courante.\nD. **FAUX = la réponse à cocher** : estimer le DFG à partir de la seule **créatinine plasmatique** n'est **PAS aussi fiable** que la mesure de la clairance (la créatinine sanguine dépend aussi de la masse musculaire, de l'âge, etc.).\nE. VRAI : la formule **MDRD** est plus juste chez le **sujet âgé** que celle de **Cockcroft et Gault**.",
      "questions": [
        {
          "enonce": "**[Physiologie · Filtration glomérulaire · 2015 session 2 — Question 10]**\n\nA propos de la mesure du débit de filtration glomérulaire (DFG), toutes sont exactes sauf une. Laquelle ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "La mesure du DFG nécessite une substance qui soit uniquement et librement filtrée",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La méthode de référence est la clairance de l'inuline",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La clairance de la créatinine est facile à mesurer en pratique.",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "L'estimation du DFG à partir de la concentration plasmatique de créatinine est tout aussi fiable que la mesure de sa clairance.",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "La formule de MDRD est plus juste chez les sujets âgés que celle de Cockcroft et Gault.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nLa proposition fausse (donc à cocher) est D.\nA. VRAI, il faut une substance uniquement et librement filtrée.\nB. VRAI, la méthode de référence est la clairance de l'inuline.\nC. VRAI, la clairance de la créatinine est facile à mesurer en pratique.\nD. FAUX, l'estimation par la seule créatinine plasmatique n'est pas aussi fiable que la mesure de sa clairance.\nE. VRAI, la formule MDRD est plus juste que celle de Cockcroft et Gault chez le sujet âgé."
        }
      ]
    },
    {
      "titre": "Physiologie — Filtration glomérulaire — Annales classées (Question 26)",
      "annee": "Annales classées",
      "rappel_cours": "Question de synthèse sur la **filtration glomérulaire**, phénomène **passif** qui trie le plasma selon la pression et la taille des molécules.\n\nA. **VRAI** : la **balance glomérulo-tubulaire** ajuste la réabsorption proximale de sodium et d'eau au DFG (si on filtre plus, on réabsorbe plus).\nB. **FAUX** : la filtration s'arrête quand la pression **hydrostatique dans la capsule de Bowman** dépasse la **pression hydrostatique** du capillaire (les forces qui poussent). La proposition confond avec la pression oncotique.\nC. **FAUX** : le DFG représente environ **20 % du débit plasmatique rénal** (la fraction filtrée), ce qui correspond à seulement ≈ **10 % du débit sanguin rénal**, pas 20 %.\nD. **VRAI** : la filtration glomérulaire est bien un phénomène **passif**.\nE. **FAUX** : chez un sujet non diabétique, le glucose **est intégralement filtré** puis totalement réabsorbé ; le débit **filtré** (massique) de glucose n'est donc **pas nul** (c'est le débit **excrété** dans l'urine qui est nul).",
      "questions": [
        {
          "enonce": "**[Physiologie · Filtration glomérulaire · Annales classées — Question 26]**\n\nParmi les propositions suivantes concernant la filtration glomérulaire, indiquez la (les) réponse(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "La balance glomérulo-tubulaire permet d'adapter la réabsorption tubulaire proximale de sodium et d'eau au débit de filtration glomérulaire",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Le processus de filtration glomérulaire s'interrompt lorsque la pression hydrostatique dans la capsule de Bowman devient supérieure à la pression oncotique dans le capillaire glomérulaire",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Chez l'Homme, le débit de filtration glomérulaire représente normalement 20% du débit sanguin rénal",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le processus de filtration glomérulaire est un phénomène passif",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Chez un sujet non diabétique, le débit massique de filtration glomérulaire du glucose est nul",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : AD**\n\nA. VRAI.\nB. FAUX.\nC. FAUX.\nD. VRAI.\nE. FAUX."
        }
      ]
    },
    {
      "titre": "Physiologie — Filtration glomérulaire — Annales classées (Question 18)",
      "annee": "Annales classées",
      "rappel_cours": "Le **facteur natriurétique auriculaire (ANF ou ANP)** est une hormone libérée par les **oreillettes du cœur** quand le **volume sanguin augmente** (le cœur est trop rempli). Son but : faire **éliminer du sel et de l'eau** pour faire baisser le volume.\n\nA. **VRAI** : l'ANF dilate l'artériole **afférente** (d'entrée) du glomérule.\nB. **VRAI** : en dilatant l'afférente (et en contractant l'efférente), il **augmente le DFG**, donc la filtration.\nC. **FAUX** (piège) : l'ANF **augmente** la **natriurèse** (il fait éliminer plus de sodium), il ne la diminue pas — c'est même tout son intérêt.\nD. **VRAI** : il est libéré quand le **volume sanguin circulant augmente** (étirement des oreillettes).\nE. **FAUX** : l'ANF **inhibe** la libération de **rénine** (il s'oppose au système rénine-angiotensine-aldostérone qui, lui, retient le sel).",
      "questions": [
        {
          "enonce": "**[Physiologie · Filtration glomérulaire · Annales classées — Question 18]**\n\nLe facteur natriurétique auriculaire (ANF) (une ou plusieurs réponses exactes) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Induit une vasodilatation de l'artériole afférente du glomérule",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Augmente le débit de filtration glomérulaire",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Diminue la natriurèse",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Est libéré en cas d'augmentation du volume sanguin circulant",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Stimule la libération de rénine",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : ABD**\n\nA. VRAI.\nB. VRAI.\nC. FAUX, augmente la natriurèse.\nD. VRAI.\nE. FAUX, l'ANF inhibe la libération de rénine."
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2021-2022 (QCM 2)",
      "annee": "2021-2022",
      "rappel_cours": "Une **hémorragie sévère** fait chuter le volume sanguin, c'est une **hypovolémie**. Le corps réagit pour économiser l'eau et le sel (le sodium, Na⁺) afin de remonter la pression.\n**A** : la baisse de volume déclenche la **soif** → VRAI.\n**B** : le rein retient le Na⁺ (urines pauvres en Na⁺) et élimine du K⁺, donc le rapport [Na⁺]urinaire/[K⁺]urinaire devient **< 1** → VRAI.\n**C** : l'**ADH** (hormone anti-diurétique, qui fait retenir l'eau) est libérée davantage → VRAI.\n**D** : une entrée d'eau depuis les tissus vers le sang peut diluer transitoirement le Na⁺ → **hyponatrémie transitoire** → VRAI.\n**E** : le rein fait peu d'urine (**oligurie**) et la concentre fortement (urines **hyperosmolaires**) pour garder l'eau → VRAI.\nIci toutes les propositions sont exactes.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2021-2022 — QCM 2]**\n\nUne hémorragie sévère peut induire (indiquez la ou les réponse(s) exacte(s)). Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Une sensation de soif",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Un rapport [Na+]urinaire / [K+]urinaire < 1",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Une augmentation de la libération d'ADH",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Une hyponatrémie transitoire",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Une oligurie avec des urines hyperosmolaires par rapport au plasma",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ABCDE**\n\nA. VRAI\nB. VRAI\nC. VRAI\nD. VRAI\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2021-2022 (QCM 5)",
      "annee": "2021-2022",
      "rappel_cours": "L'**aldostérone** est une hormone qui fait **réabsorber le Na⁺** et **excréter le K⁺** par le rein. L'**hyperaldostéronisme** = trop d'aldostérone.\n**A** : puisqu'elle fait éliminer le K⁺, on a une **hypokaliémie** (K⁺ bas), pas une hyperkaliémie → FAUX.\n**B** : une **diarrhée profuse** fait perdre de l'eau et du sel → hypovolémie → activation du système rénine-angiotensine-aldostérone (SRAA) → hyperaldostéronisme secondaire → VRAI.\n**C** : une **sténose de l'artère rénale** diminue la perfusion du rein → sécrétion de rénine → hyperaldostéronisme secondaire → VRAI.\n**D** : l'hyperaldostéronisme donne une **alcalose métabolique** (perte de H⁺ dans les urines), pas ventilatoire → FAUX.\n**E** : faux puisque B et C sont vrais.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2021-2022 — QCM 5]**\n\nA propos de l'hyperaldostéronisme, indiquez la ou les proposition(s) exacte(s) : Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Il peut être responsable d'une hyperkaliémie",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Il peut survenir en cas de diarrhée profuse",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Il peut être induit par une sténose de l'artère rénale gauche",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Il peut être responsable d'une alcalose d'origine ventilatoire",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Aucune des réponses précédentes n'est exacte.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : BC**\n\nA. FAUX, l'aldostérone ↑ la sécrétion rénale de K⁺ → hypokaliémie, pas hyperkaliémie\nB. VRAI\nC. VRAI\nD. FAUX, l'hyperaldostéronisme entraîne une alcalose métabolique (perte de H⁺ rénale), pas ventilatoire\nE. FAUX"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2021-2022 (QCM 10)",
      "annee": "2021-2022",
      "rappel_cours": "Le corps est divisé en **compartiments liquidiens** : le plasma (sang), le liquide **interstitiel** (entre les cellules) et le liquide **intracellulaire** (dans les cellules). Le liquide extracellulaire regroupe plasma + interstitiel.\n**A** : l'**inuline** est une molécule traceur qui reste dans le secteur extracellulaire ; elle mesure le **volume extracellulaire**, pas le volume plasmatique → FAUX.\n**B** : dans l'interstitiel il y a un peu moins de protéines chargées négativement, donc légèrement moins de Na⁺ (équilibre de Donnan) → VRAI.\n**C** : la **membrane cellulaire** laisse mal passer les ions, sucres et acides aminés (transport contrôlé) → VRAI.\n**D** : la **paroi des capillaires** est au contraire **très perméable** à ces petites molécules ; elle ne retient surtout que les protéines → FAUX.\n**E** : l'eau se déplace entre l'intérieur et l'extérieur des cellules toujours de façon **passive**, par osmose → VRAI.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2021-2022 — QCM 10]**\n\nA propos des compartiments liquidiens, indiquez la ou les propositions exactes : Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'inuline peut être utilisée pour mesurer précisément le volume plasmatique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La concentration en cation Na+ du milieu interstitiel est légèrement inférieure à sa concentration dans l'eau plasmatique",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La membrane cellulaire est peu perméable aux substances dissoutes hydrosolubles telles que les ions, les sucres et les acides aminés",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "La paroi capillaire est peu perméable aux substances dissoutes hydrosolubles telles que les ions, les sucres et les acides aminés",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Les mouvements d'eau entre compartiment extracellulaire et compartiment intracellulaire sont toujours passifs",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCE**\n\nA. FAUX, l'inuline mesure le volume extracellulaire\nB. VRAI\nC. VRAI\nD. FAUX, la paroi capillaire est très perméable aux petites molécules hydrosolubles, elle est surtout peu perméable aux protéines plasmatiques\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2021-2022 (QCM 12)",
      "annee": "2021-2022",
      "rappel_cours": "Le **facteur atrial natriurétique (ANF)** est une hormone libérée par les oreillettes du cœur quand le **volume sanguin augmente** (elles sont étirées). Son but : faire éliminer de l'eau et du sel pour baisser la pression. « Natriurétique » = qui fait excréter le Na⁺ dans les urines.\n**A** : libéré quand le volume sanguin augmente → VRAI.\n**B** : il **dilate** (et non contracte) l'artériole afférente du glomérule → FAUX.\n**C** : il augmente l'élimination urinaire de Na⁺ (**natriurèse**) → VRAI.\n**D** : en dilatant l'artériole afférente, il augmente le **débit de filtration glomérulaire** (quantité de sang filtrée) → VRAI.\n**E** : il **inhibe la rénine**, donc freine le système qui retient le sel → VRAI.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2021-2022 — QCM 12]**\n\nLe facteur atrial natriurétique (ANF) : Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Est libéré dans la circulation sanguine lorsque le volume sanguin circulant augmente",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Vasoconstricte l'artériole afférente du glomérule",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Augmente la natriurèse",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Augmente le débit de filtration glomérulaire",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Inhibe la libération de rénine par les cellules de l'artériole afférente",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ACDE**\n\nA. VRAI\nB. FAUX, l'ANF provoque au contraire une vasodilatation de l'artériole afférente\nC. VRAI\nD. VRAI\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2021-2022 (QCM 15)",
      "annee": "2021-2022",
      "rappel_cours": "L'**hyperaldostéronisme secondaire** = trop d'aldostérone parce que le rein est mal perfusé et libère beaucoup de **rénine** (activation du SRAA). À distinguer du primaire (problème dans la glande surrénale, rénine basse).\n**A** : ici la rénine est **élevée** (elle stimule l'aldostérone), pas faible → FAUX.\n**B** : la rétention de sel et d'eau favorise les **œdèmes** → VRAI.\n**C** : il résulte souvent d'une **perfusion rénale insuffisante** (le rein croit manquer de volume) → VRAI.\n**D** : le rein retient le Na⁺ et élimine le K⁺, donc le rapport [Na⁺]urinaire/[K⁺]urinaire est **< 1**, pas > 1 → FAUX.\n**E** : la fuite urinaire de K⁺ donne une **hypokaliémie** → VRAI.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2021-2022 — QCM 15]**\n\nL'hyperaldostéronisme secondaire : Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "S'accompagne d'une activité rénine plasmatique faible ou nulle",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Peut contribuer à la formation d'oedèmes périphériques",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Résulte d'une perfusion rénale insuffisante",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "S'accompagne d'un rapport [Na+]urinaire / [K+]urinaire > 1",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Peut induire une hypokaliémie",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCE**\n\nA. FAUX, dans l'hyperaldostéronisme secondaire, l'aldostérone est stimulée par une augmentation de la rénine (activation du SRAA). Donc la rénine est élevée, pas basse.\nB. VRAI\nC. VRAI\nD. FAUX, rapport Na⁺/K⁺ < 1\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2020-2021 (QCM 5)",
      "annee": "2020-2021",
      "rappel_cours": "Le **facteur atrial natriurétique (ANF)** est libéré par le cœur quand le volume sanguin augmente ; il fait éliminer eau et sel.\n**A** : libéré quand le volume sanguin augmente → VRAI.\n**B** : il **dilate** l'artériole afférente (ne la contracte pas) → FAUX.\n**C** : il augmente la **natriurèse** (élimination de Na⁺) → VRAI.\n**D** : la dilatation de l'afférente augmente le **débit de filtration glomérulaire** → VRAI.\n**E** : il **inhibe la rénine** → VRAI.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2020-2021 — QCM 5]**\n\nLe facteur atrial natriurétique (ANF) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Est libéré dans la circulation sanguine lorsque le volume sanguin circulant augmente",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Vasoconstricte l'artériole afférente du glomérule",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Augmente la natriurèse",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Augmente le débit de filtration glomérulaire",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Inhibe la libération de rénine par les cellules de l'artériole afférente",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ACDE**\n\nA. VRAI\nB. FAUX, l'ANF provoque une vasodilatation de l'artériole afférente\nC. VRAI\nD. VRAI\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2020-2021 (QCM 8)",
      "annee": "2020-2021",
      "rappel_cours": "L'**hyperaldostéronisme secondaire** : le rein mal perfusé libère beaucoup de **rénine**, ce qui augmente l'aldostérone.\n**A** : la rénine est **augmentée** ici (rénine basse = forme primaire) → FAUX.\n**B** : rétention d'eau et de sel → **œdèmes** périphériques → VRAI.\n**C** : cause fréquente = **perfusion rénale insuffisante** → VRAI.\n**D** : le rein garde le Na⁺ et rejette le K⁺ → rapport [Na⁺]urinaire/[K⁺]urinaire **< 1**, pas > 1 → FAUX.\n**E** : fuite urinaire de K⁺ → **hypokaliémie** → VRAI.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2020-2021 — QCM 8]**\n\nL'hyperaldostéronisme secondaire :",
          "items": [
            {
              "lettre": "A",
              "enonce": "S'accompagne d'une activité rénine plasmatique faible ou nulle",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Peut contribuer à la formation d'oedèmes périphériques",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Résulte d'une perfusion rénale insuffisante",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "S'accompagne d'un rapport [Na+]urinaire / [K+]urinaire > 1",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Peut induire une hypokaliémie",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCE**\n\nA. FAUX, dans la forme secondaire, il existe une augmentation de la rénine (activation du SRAA), rénine basse = hyperaldostéronisme primaire.\nB. VRAI\nC. VRAI\nD. FAUX, rapport < 1\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2019 session 1 (QCM 10)",
      "annee": "2019 session 1",
      "rappel_cours": "Rappel des acteurs du **bilan du sodium** : l'ANF fait éliminer le sel, l'aldostérone le fait retenir. Le contenu total en Na⁺ du corps règle le **volume extracellulaire**.\n**A** : l'ANF **inhibe** le SRAA (↓ rénine, ↓ aldostérone), il ne le stimule pas → FAUX.\n**B** : la très grande partie du Na⁺ filtré est réabsorbée **avant** le canal collecteur (surtout tube proximal et anse de Henlé) → VRAI.\n**C** : l'aldostérone **augmente** la réabsorption de Na⁺ (ne la diminue pas) → FAUX.\n**D** : le Na⁺ échangeable détermine le volume **extracellulaire**, pas intracellulaire → FAUX.\n**E** : le rein adapte l'excrétion de Na⁺ au **volume extracellulaire**, pas directement à la natrémie → FAUX.\nUne seule réponse exacte : B.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2019 session 1 — QCM 10]**\n\nParmi les propositions suivantes concernant le bilan du sodium, indiquez la réponse exacte :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le facteur atrial natriurétique stimule le système rénine-angiotensine-aldostérone",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La majorité du sodium filtré est réabsorbée avant le canal collecteur",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "L'aldostérone diminue la réabsorption rénale de sodium",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le contenu en sodium échangeable du milieu extracellulaire détermine le volume intracellulaire",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Le rein adapte l'excrétion urinaire de sodium à la natrémie.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B**\n\nA. FAUX, le facteur atrial natriurétique (ANF) inhibe le SRAA (↓ rénine, ↓ aldostérone)\nB. VRAI\nC. FAUX, l'aldostérone augmente la réabsorption de Na⁺ (et augmente l'excrétion de K⁺)\nD. FAUX, le sodium est le principal cation du secteur extracellulaire et le contenu en Na+ échangeable détermine le volume extracellulaire, pas intracellulaire\nE. FAUX, le rein adapte l'excrétion de Na+ au volume extracellulaire, pas directement à la natrémie et la natrémie reflète surtout l'équilibre hydrique"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2019 session 1 (QCM 28)",
      "annee": "2019 session 1",
      "rappel_cours": "L'**aldostérone** est une hormone **minéralocorticoïde** fabriquée par la surrénale à partir du **cholestérol**. Elle agit sur le rein pour retenir le Na⁺ et éliminer le K⁺ et les H⁺.\n**A** : elle fait **réabsorber** le Na⁺, donc **diminue** son excrétion urinaire (ne l'augmente pas) → FAUX.\n**B** : elle agit sur les **cellules principales** du canal collecteur (réabsorption de Na⁺, sécrétion de K⁺) → VRAI.\n**C** : elle augmente l'excrétion urinaire de **H⁺** (via les cellules intercalaires) → VRAI.\n**D** : c'est bien une hormone minéralocorticoïde issue du cholestérol → VRAI.\n**E** : elle agit aussi sur les **cellules intercalaires** du canal collecteur (sécrétion d'H⁺) → VRAI.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2019 session 1 — QCM 28]**\n\nParmi les propositions suivantes concernant l'aldostérone, quelle(s) est (sont) la (les) réponse(s) exacte(s) ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'aldostérone augmente l'excrétion urinaire d'ions Na+.",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "L'aldostérone a une action sur les cellules principales du canal collecteur",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "L'aldostérone augmente l'excrétion urinaire d'ions H+",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "L'aldostérone est une hormone minéralocorticoïde synthétisée à partir du cholestérol",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "L'aldostérone a une action sur les cellules intercalaires du canal collecteur",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCDE**\n\nA. FAUX, l'aldostérone augmente la réabsorption de Na⁺ au niveau du tube distal et du canal collecteur → donc diminue l'excrétion urinaire de Na⁺\nB. VRAI\nC. VRAI\nD. VRAI\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2018 session 2 (QCM 5)",
      "annee": "2018 session 2",
      "rappel_cours": "Le tube rénal a plusieurs segments. Le **tube contourné proximal** est le champion **quantitatif** : il réabsorbe la plus grosse part du Na⁺, de l'eau, du K⁺ et récupère tout le glucose. Mais la **régulation fine** (qualitative) du sel se fait plus loin, au tube distal et au canal collecteur, sous l'effet de l'aldostérone.\nQuestion « toutes exactes SAUF UNE » → il faut cocher l'item **faux**.\n**A** : le tube proximal est bien le plus important quantitativement pour le Na⁺ → cette phrase est correcte, DONC l'énoncé « SAUF UNE » indique qu'ici la source considère A comme l'item faux à cocher.\n**B** : la régulation fine (qualitative) du bilan sodé se fait surtout au **tube distal et canal collecteur**, pas au proximal → VRAI.\n**C** : le proximal réabsorbe le plus d'eau → VRAI.\n**D** : le glucose est entièrement réabsorbé au proximal → VRAI.\n**E** : le proximal réabsorbe le plus de K⁺ → VRAI.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2018 session 2 — QCM 5]**\n\nToutes les propositions suivantes sont exactes, SAUF UNE, laquelle ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "La zone la plus importante quantitativement pour la réabsorption du sodium est le tube contourné proximal.",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "La zone la plus importante qualitativement pour la régulation du bilan sodé est le tube contourné proximal.",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La zone la plus importante quantitativement pour la réabsorption d'eau est le tube contourné proximal.",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le glucose est normalement réabsorbé en totalité dans le tube contourné proximal.",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "La zone la plus importante quantitativement pour la réabsorption du potassium est le tube contourné proximal.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : A**\n\nQuestion « toutes exactes SAUF UNE » : l'item faux (donc à cocher) est celui qui rend la phrase incorrecte.\nA. FAUX (item à cocher selon la correction)\nB. VRAI, la régulation fine du bilan sodé se fait surtout au tubule distal et canal collecteur, sous l'influence de l'aldostérone\nC. VRAI (source : FAUX)\nD. VRAI (source : FAUX)\nE. VRAI (source : FAUX)"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2018 session 2 (QCM 17)",
      "annee": "2018 session 2",
      "rappel_cours": "Le **tube proximal** récupère l'essentiel de ce qui est filtré chez un sujet sain. Repères utiles : ~80–90 % des **bicarbonates** (HCO3⁻), la **totalité du glucose**, environ **60–70 %** du **Na⁺, de l'eau et du K⁺**.\n**A** : il réabsorbe la quasi-totalité des bicarbonates mais pas exactement 100 % (~80–90 %) → FAUX.\n**B** : tout le **glucose** filtré est réabsorbé au proximal → VRAI.\n**C** : environ **60–70 % du Na⁺ et de l'eau** filtrés sont réabsorbés au proximal → VRAI.\n**D** : il existe bien une réabsorption proximale de **K⁺** (60–70 %, passivement avec l'eau) → FAUX.\n**E** : la réabsorption proximale est **obligatoire** et non réglée par l'aldostérone (qui agit distalement) → FAUX.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2018 session 2 — QCM 17]**\n\nParmi les propositions suivantes concernant la réabsorption tubulaire proximale chez un sujet sain, indiquez la ou les proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "La totalité des bicarbonates filtrés est réabsorbée par le tube proximal",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La totalité du glucose filtré est réabsorbée par le tube proximal",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "60 à 70% du Na+ et de l'eau filtrés sont réabsorbés par le tube proximal",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Il n'existe pas de réabsorption proximale de K+",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "La réabsorption proximale de Na+ est régulée par l'aldostérone.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : BC**\n\nA. FAUX, en réalité, ~80–90 % des bicarbonates filtrés sont réabsorbés par le tubule proximal.\nB. VRAI\nC. VRAI\nD. FAUX, le tubule proximal réabsorbe 60–70 % du K⁺ filtré, passivement avec l'eau\nE. FAUX, la réabsorption proximale est obligatoire et non régulée par l'aldostérone, surtout que l'aldostérone agit sur le tubule distal et le canal collecteur"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2017 session 2 (QCM 18)",
      "annee": "2017 session 2",
      "rappel_cours": "Le **facteur natriurétique auriculaire (ANF)** est l'hormone du cœur qui, en cas de volume sanguin élevé, fait éliminer le sel et l'eau.\n**A** : il **dilate** l'artériole afférente du glomérule → VRAI.\n**B** : cette dilatation augmente le **débit de filtration glomérulaire** → VRAI.\n**C** : il **augmente** la natriurèse (élimination de Na⁺), il ne la diminue pas → FAUX.\n**D** : il est libéré quand le **volume sanguin augmente** → VRAI.\n**E** : il **inhibe** la rénine, il ne la stimule pas → FAUX.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2017 session 2 — QCM 18]**\n\nLe facteur natriurétique auriculaire (ANF) (une ou plusieurs réponses exactes) — question mélangeant le cours de filtration glomérulaire et du bilan du sodium :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Induit une vasodilatation de l'artériole afférente du glomérule",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Augmente le débit de filtration glomérulaire",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Diminue la natriurèse",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Est libéré en cas d'augmentation du volume sanguin circulant",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Stimule la libération de rénine",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : ABD**\n\nA. VRAI\nB. VRAI\nC. FAUX, l'ANF augmente la natriurèse\nD. VRAI\nE. FAUX, l'ANF inhibe la rénine"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2016 session 2 (QCM 16)",
      "annee": "2016 session 2",
      "rappel_cours": "La **réabsorption du Na⁺** se fait tout au long du tube rénal. Au total, ~99 % du Na⁺ filtré est réabsorbé, mais c'est le **tube proximal** qui en fait le plus (quantitativement). La **régulation fine** dépend de l'aldostérone (canal collecteur), pas de l'ADH.\n**A** : la branche ascendante large de l'anse de Henlé réabsorbe beaucoup de Na⁺ (~25 %), mais le **tube proximal** reste le plus important quantitativement → FAUX.\n**B** : au total ~**99 %** du Na⁺ filtré est réabsorbé → VRAI.\n**C** : la régulation fine du Na⁺ se fait par l'**aldostérone**, pas par l'ADH (l'ADH règle surtout l'eau) → FAUX.\n**D** : le Na⁺ n'est pas toujours réabsorbé avec l'eau : dans la branche ascendante large, il est réabsorbé **sans eau** → FAUX.\n**E** : ce n'est pas toujours un transport transcellulaire actif « pur » : dans l'anse ascendante c'est un transport actif **secondaire** (Na⁺/K⁺/2Cl⁻) → FAUX.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2016 session 2 — QCM 16]**\n\nA propos de la réabsorption tubulaire rénale d'ions sodium (Na+), indiquez la ou les réponse(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Elle est quantitativement la plus importante au niveau de la branche ascendante large de l'anse de Henlé",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Elle représente environ 99% des ions Na+ filtrés",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Elle est finement régulée au niveau du canal collecteur par l'hormone anti diurétique",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Elle s'accompagne d'une réabsorption d'eau dans tous les segments du tubule rénal",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Elle est toujours due à un mécanisme transcellulaire actif",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B**\n\nA. FAUX, la branche ascendante large de l'anse de Henlé réabsorbe beaucoup de Na⁺ (≈25 %), mais le tubule proximal reste le plus important quantitativement\nB. VRAI\nC. FAUX, la régulation fine du Na⁺ se fait par l'aldostérone\nD. FAUX, dans le tubule proximal, oui (solvent drag) mais dans la branche ascendante large de l'anse de Henlé, Na⁺ est réabsorbé sans eau\nE. FAUX, dans le tubule proximal, majoritairement actif transcellulaire et dans l'anse de Henlé ascendante large, c'est surtout transport actif secondaire (Na⁺/K⁺/2Cl⁻)"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2016 session 2 (QCM 18)",
      "annee": "2016 session 2",
      "rappel_cours": "L'**aldostérone** agit surtout **distalement** (cellules principales et intercalaires du **canal collecteur**). Elle est stimulée par l'hypovolémie, l'hyperkaliémie et l'activation du SRAA, et favorise la sécrétion d'H⁺ (donc une alcalose).\n**A** : l'aldostérone est stimulée surtout par **hypovolémie, hyperkaliémie ou SRAA** (l'énoncé lié à l'acidose est donc inexact) → FAUX.\n**B** : elle n'augmente pas la sécrétion acide **proximale** ; elle agit **distalement** → FAUX.\n**C** : sa mise en jeu explique l'**alcalose de contraction** associée à une hypovolémie sévère → VRAI.\n**D** : elle stimule les **cellules du canal collecteur** → VRAI.\n**E** : en réabsorbant le Na⁺, elle rend le fluide tubulaire **électronégatif**, ce qui favorise la sécrétion acide distale (H⁺) → VRAI.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2016 session 2 — QCM 18]**\n\nL'aldostérone (ces items ne sont pas vus en cours mais une correction est fournie) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Est mise en jeu en cas d'acidose par l'augmentation de la kaliémie",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Augmente la sécrétion acide proximale",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Sa mise en jeu explique l'alcalose associée à une hypovolémie sévère (alcalose de contraction)",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Stimule les cellules du canal collecteur",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Favorise la sécrétion acide distale en entraînant une électronégativité du fluide tubulaire",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : CDE**\n\nA. FAUX, l'aldostérone est surtout stimulée par hypovolémie, hyperkaliémie ou activation du SRAA\nB. FAUX, l'aldostérone agit surtout distalement, sur les cellules principales et intercalaires du canal collecteur\nC. VRAI\nD. VRAI\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2015 session 1 (QCM 25)",
      "annee": "2015 session 1",
      "rappel_cours": "Points clés sur le **Na⁺** : la masse de Na⁺ échangeable règle le **volume extracellulaire** ; la **natrémie** (concentration de Na⁺ dans le sang) reflète surtout l'**équilibre hydrique** (eau), pas le stock total de sel. Au canal collecteur, réabsorption de Na⁺ et sécrétion de K⁺ sont couplées.\n**A** : même **sans aldostérone**, le proximal et l'anse réabsorbent >90 % du Na⁺ filtré, donc on n'excrète pas 25 % → FAUX.\n**B** : la masse de Na⁺ échangeable détermine bien le **volume extracellulaire** → VRAI.\n**C** : la natrémie n'est **pas** un bon reflet du volume extracellulaire (elle reflète l'eau) → FAUX.\n**D** : dans les **cellules principales** du canal collecteur, réabsorption de Na⁺ et sécrétion de K⁺ sont **couplées** → VRAI.\n**E** : l'aldostérone **augmente la réabsorption** de Na⁺, donc **diminue** son excrétion urinaire → FAUX.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2015 session 1 — QCM 25]**\n\nParmi les propositions suivantes concernant les ions Na+, indiquez celle ou celles qui est (sont) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "En l'absence d'aldostérone, l'excrétion urinaire quotidienne d'ions Na+ représente environ 25% des ions Na+ filtrés quotidiennement",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La masse de Na+ échangeable détermine le volume extracellulaire",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La natrémie est un bon reflet du volume extracellulaire",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Dans les cellules principales du tube collecteur, réabsorption de Na+ et sécrétion de K+ sont fonctionnellement couplées",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "L'aldostérone augmente l'excrétion rénale de Na+.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : BD**\n\nA. FAUX, même en l'absence d'aldostérone, la réabsorption proximale et anse de Henlé réabsorbe >90 % du Na⁺ filtré\nB. VRAI\nC. FAUX, la natrémie reflète surtout la concentration en Na+ par rapport à l'eau, donc l'équilibre hydrique, pas le stock total de Na⁺ / volume extracellulaire\nD. VRAI\nE. FAUX, l'aldostérone augmente la réabsorption de Na+, donc diminue l'excrétion urinaire"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du sodium — 2015 session 1 (QCM 28)",
      "annee": "2015 session 1",
      "rappel_cours": "Une **hémorragie massive** avec chute de pression = **hypovolémie**. Le corps veut garder l'eau et le sel : soif, moins d'urines, plus d'ADH, rénine élevée. L'ANF, lui, est libéré dans le cas inverse (hypervolémie).\n**A** : la baisse de volume déclenche la **soif** → VRAI.\n**B** : le rein fait peu d'urine (**oligurie**) pour garder le volume → VRAI.\n**C** : le rein retient le Na⁺, donc Na⁺ urinaire très bas et rapport [Na⁺]urinaire/[K⁺]urinaire **< 1**, pas > 1 → FAUX.\n**D** : l'**ADH augmente** pour retenir l'eau (elle ne diminue pas) → FAUX.\n**E** : l'**ANF** est libéré en cas d'**hypervolémie** (distension des oreillettes), donc pas ici → FAUX.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du sodium · 2015 session 1 — QCM 28]**\n\nUne hémorragie massive avec chute de la pression artérielle chez un sujet bien portant induit habituellement (une ou plusieurs réponses exactes) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Une sensation de soif",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Une oligurie",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Un rapport [Na+]urinaire/[K+]urinaire > 1",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Une diminution de la concentration plasmatique d'hormone anti-diurétique",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Une augmentation de la concentration plasmatique d'ANF.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : AB**\n\nA. VRAI\nB. VRAI\nC. FAUX, dans l'hypovolémie, le rein retient le Na⁺ pour conserver le volume → Na⁺ urinaire très faible donc le rapport [Na⁺]urinaire / [K⁺]urinaire est < 1\nD. FAUX, au contraire l'ADH augmente\nE. FAUX, l'ANF est libéré en cas d'hypervolémie / distension des oreillettes donc dans ce cas d'hypovolémie non"
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du potassium — 2022-2023 (QCM 9)",
      "annee": "2022-2023",
      "rappel_cours": "Le **potassium (K⁺)** est le principal ion à l'intérieur des cellules. La **kaliémie** est sa concentration dans le sang (normale ≈ 3,5–5 mmol/L). Trop de K⁺ dans le sang = **hyperkaliémie** ; pas assez = **hypokaliémie**. Le rein règle l'excrétion du K⁺, surtout dans le **néphron distal** (partie finale du tube rénal), sous l'effet de l'**aldostérone** (hormone qui fait éliminer le K⁺ dans les urines).\n\nA. **FAUX** : l'**onde U** sur l'ECG est le signe de l'**hypo**kaliémie, pas de l'hyperkaliémie.\nB. **VRAI** : le rein élimine le K⁺ surtout en le **sécrétant** dans le néphron distal.\nC. **VRAI** : quand le K⁺ monte, le corps libère de l'**aldostérone** pour en éliminer plus (boucle de régulation).\nD. **FAUX** : un pH à 7,60 = **alcalose** ; le K⁺ entre alors dans les cellules → **hypo**kaliémie, pas hyperkaliémie.\nE. **VRAI** : l'**insuline** pousse le K⁺ à entrer dans les cellules, ce qui peut faire baisser la kaliémie.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du potassium · 2022-2023 — QCM 9]**\n\nA propos du potassium et de la kaliémie, indiquez la ou les propositions exactes :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Une kaliémie à 6 mmol/L induit l'apparition d'une onde U sur l'ECG",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "L'essentiel de l'excrétion rénale de potassium est due à une sécrétion de potassium dans le néphron distal",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "L'hyperkaliémie stimule la production d'aldostérone",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Un pH artériel à 7,60 s'accompagne en règle générale d'une hyperkaliémie",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Un traitement par l'insuline peut induire une hypokaliémie",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCE**\n\nA. FAUX, une onde U est typique de l'hypokaliémie.\nB. VRAI.\nC. VRAI.\nD. FAUX, un pH à 7,60 = alcalose : les ions H⁺ sortent des cellules et le K⁺ entre dans les cellules → cela entraîne une hypokaliémie, pas une hyperkaliémie.\nE. VRAI."
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du potassium — 2020-2021 (QCM 10)",
      "annee": "2020-2021",
      "rappel_cours": "Ici la kaliémie est mesurée à **6,1 mmol/L**, c'est-à-dire une **hyperkaliémie** (trop de potassium dans le sang, valeur normale ≈ 3,5–5 mmol/L). Il faut repérer les situations qui font **monter** le K⁺ sanguin. Le K⁺ étant surtout **intracellulaire**, tout ce qui détruit des cellules (hémolyse, écrasement musculaire) libère du K⁺ dans le sang. À l'inverse, une perte digestive (diarrhée) fait **baisser** le K⁺.\n\nA. **FAUX** : l'**onde U** signe l'hypokaliémie, pas l'hyperkaliémie.\nB. **FAUX** : la **diarrhée** fait perdre du K⁺ par les selles → hypokaliémie.\nC. **VRAI** : une **hémolyse** du prélèvement (globules rouges éclatés dans le tube) libère leur K⁺ → fausse hyperkaliémie de laboratoire.\nD. **VRAI** : l'**insuffisance surrénale** = manque d'aldostérone → le rein élimine moins de K⁺ → hyperkaliémie.\nE. **VRAI** : un **écrasement musculaire** (rhabdomyolyse) libère le K⁺ des cellules musculaires → hyperkaliémie.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du potassium · 2020-2021 — QCM 10]**\n\nUne kaliémie mesurée à 6,1 mmol/L de plasma :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Peut induire l'apparition d'une onde U sur l'électrocardiogramme",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Peut résulter d'une diarrhée abondante",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Peut être due à une hémolyse du prélèvement sanguin utilisé pour le dosage",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Peut être due à une insuffisance surrénale aiguë",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Peut être due à un écrasement musculaire",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : CDE**\n\nA. FAUX, l'onde U est typique de l'hypokaliémie, pas de l'hyperkaliémie.\nB. FAUX, la diarrhée entraîne une perte digestive de potassium → hypokaliémie.\nC. VRAI.\nD. VRAI, dans l'insuffisance surrénale (aiguë ou chronique), il y a déficit en aldostérone → ↓ sécrétion rénale de K⁺ → hyperkaliémie.\nE. VRAI, les traumatismes musculaires massifs ou le syndrome de rhabdomyolyse libèrent du K⁺ intracellulaire → hyperkaliémie."
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du potassium — 2019 session 1 (QCM 8)",
      "annee": "2019 session 1",
      "rappel_cours": "Question à format **« toutes exactes SAUF UNE »** : quatre propositions sont vraies, une seule est fausse — c'est cette **fausse** qu'il faut cocher. Rappels : les **diurétiques de l'anse** (furosémide) font perdre du K⁺ ; l'**aldostérone** fait éliminer le K⁺ dans les urines (kaliurèse) ; l'**insuline** fait entrer le K⁺ dans les cellules.\n\nA. **Exacte** : les diurétiques de l'anse peuvent induire une hypokaliémie.\nB. **Exacte** : l'aldostérone augmente la kaliurèse (élimination urinaire de K⁺).\nC. **Exacte** : l'insuline favorise l'entrée du K⁺ dans les cellules musculaires.\nD. **INEXACTE (à cocher)** : la **torsade de pointe** est caractéristique de l'**hypo**kaliémie, pas de l'hyperkaliémie.\nE. **Exacte** : les carences d'apport alimentaire en K⁺ sont très rares (le K⁺ est présent dans presque tous les aliments).",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du potassium · 2019 session 1 — QCM 8]**\n\nToutes les propositions suivantes concernant l'ion K⁺ sont exactes, SAUF UNE. Laquelle ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Les diurétiques de l'anse peuvent induire une hypokaliémie",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "L'aldostérone augmente la kaliurèse",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "L'insuline favorise l'entrée des ions K⁺ dans les cellules musculaires",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "L'hyperkaliémie peut induire une torsade de pointe",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Les carences d'apport alimentaire en K⁺ sont très rares.",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nToutes les propositions sont exactes sauf D, qui est la réponse à cocher.\nA. Exacte : les diurétiques de l'anse peuvent induire une hypokaliémie.\nB. Exacte : l'aldostérone augmente la kaliurèse.\nC. Exacte : l'insuline favorise l'entrée du K⁺ dans les cellules musculaires.\nD. INEXACTE : la torsade de pointe est caractéristique de l'hypokaliémie, pas de l'hyperkaliémie.\nE. Exacte : les carences d'apport alimentaire en K⁺ sont très rares."
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du potassium — 2019 session 1 (QCM 30)",
      "annee": "2019 session 1",
      "rappel_cours": "On cherche les situations qui provoquent une **hypokaliémie** (K⁺ sanguin bas). Deux grands mécanismes font baisser le K⁺ : soit on en **perd** (digestif : laxatifs, diarrhée), soit il **entre dans les cellules** (alcalose). À l'inverse, tout ce qui **libère** du K⁺ des cellules (rhabdomyolyse) ou **réduit son élimination rénale** (insuffisance rénale, manque d'aldostérone) donne une **hyper**kaliémie.\n\nA. **FAUX** : l'insuffisance rénale chronique élimine mal le K⁺ → hyperkaliémie.\nB. **VRAI** : les laxatifs font perdre du K⁺ dans les selles → hypokaliémie.\nC. **FAUX** : la rhabdomyolyse (destruction musculaire) libère du K⁺ → hyperkaliémie.\nD. **VRAI** : en alcalose, le K⁺ entre dans les cellules → hypokaliémie.\nE. **FAUX** : l'insuffisance surrénale (manque d'aldostérone) fait retenir le K⁺ → hyperkaliémie.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du potassium · 2019 session 1 — QCM 30]**\n\nParmi les situations suivantes, laquelle (lesquelles) peu(ven)t induire une hypokaliémie ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Une insuffisance rénale chronique par réduction néphronique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La prise de laxatifs",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Une rhabdomyolyse",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Une alcalose aiguë",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Une insuffisance surrénale aiguë",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : BD**\n\nA. FAUX, l'insuffisance rénale chronique entraîne généralement une hyperkaliémie car la capacité d'excrétion du potassium est réduite.\nB. VRAI.\nC. FAUX, la rhabdomyolyse libère du K⁺ intracellulaire dans le plasma → hyperkaliémie.\nD. VRAI.\nE. FAUX, l'insuffisance surrénale (déficit en aldostérone) entraîne une hyperkaliémie car la sécrétion rénale de K⁺ diminue."
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du potassium — 2019 session 1 (QCM 31)",
      "annee": "2019 session 1",
      "rappel_cours": "L'**hyperkaliémie** = trop de K⁺ dans le sang. Le corps réagit pour la corriger : il libère de l'**aldostérone** et de l'**insuline**, deux hormones qui aident à faire baisser le K⁺ (l'aldostérone en l'éliminant par le rein, l'insuline en le faisant entrer dans les cellules). Sur l'**ECG**, l'hyperkaliémie donne des **ondes T amples et pointues**.\n\nA. **VRAI** : l'hyperkaliémie stimule la libération d'aldostérone.\nB. **FAUX** : au contraire, l'hyperkaliémie **stimule** (n'inhibe pas) la sécrétion de K⁺ dans le tube collecteur.\nC. **VRAI** : ondes T amples et pointues = signe ECG classique de l'hyperkaliémie.\nD. **VRAI** : l'hyperkaliémie stimule aussi la libération d'insuline.\nE. **FAUX** : l'hyperkaliémie correspond à une augmentation du K⁺ **extra**cellulaire, pas à sa sortie de la cellule.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du potassium · 2019 session 1 — QCM 31]**\n\nA propos de l'hyperkaliémie, indiquez la (les) proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Elle induit la libération d'aldostérone",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Elle inhibe la sécrétion de K⁺ au niveau du canal collecteur",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Elle s'accompagne d'ondes T amples et pointues sur l'ECG",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Elle induit la libération d'insuline",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Elle provoque la sortie des ions K⁺ de la cellule",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : ACD**\n\nA. VRAI.\nB. FAUX, au contraire, l'hyperkaliémie stimule la sécrétion de K⁺ dans le tube collecteur via les cellules principales.\nC. VRAI.\nD. VRAI.\nE. FAUX, l'hyperkaliémie correspond à une augmentation du K⁺ extracellulaire."
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du potassium — 2015 session 1 (QCM 27)",
      "annee": "2015 session 1",
      "rappel_cours": "On cherche les causes d'**hypokaliémie** (K⁺ bas). Attention aux pièges sur les médicaments : le **furosémide** (diurétique de l'anse) fait perdre du K⁺ → hypokaliémie, mais la **spironolactone** est un **épargneur de potassium** (elle bloque l'aldostérone) → elle **retient** le K⁺ → risque d'hyperkaliémie. L'**alcalose** fait entrer le K⁺ dans les cellules → hypokaliémie. L'**hyperaldostéronisme** (trop d'aldostérone) fait éliminer beaucoup de K⁺ → hypokaliémie.\n\nA. **FAUX** : la spironolactone épargne le K⁺ → plutôt hyperkaliémie.\nB. **VRAI** : le furosémide fait perdre du K⁺ → hypokaliémie.\nC. **FAUX** : l'écrasement musculaire libère du K⁺ → hyperkaliémie.\nD. **VRAI** : l'alcalose fait entrer le K⁺ dans les cellules → hypokaliémie.\nE. **VRAI** : l'hyperaldostéronisme primaire augmente l'élimination rénale de K⁺ → hypokaliémie.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du potassium · 2015 session 1 — QCM 27]**\n\nParmi les circonstances suivantes, indiquez celle ou celles qui peut (peuvent) être la cause d'une hypokaliémie :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Prise de spironolactone",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Prise de furosémide",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Ecrasement musculaire",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Alcalose",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Hyperaldostéronisme primaire.",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BDE**\n\nA. FAUX, la spironolactone est un antagoniste de l'aldostérone (diurétique épargneur de K⁺) → protège du K⁺ → risque d'hyperkaliémie, pas d'hypokaliémie.\nB. VRAI.\nC. FAUX, la rhabdomyolyse libère du K⁺ intracellulaire → hyperkaliémie.\nD. VRAI.\nE. VRAI."
        }
      ]
    },
    {
      "titre": "Physiologie — Bilan du potassium — 2014 session 1 (QCM 28)",
      "annee": "2014 session 1",
      "rappel_cours": "Ce QCM mélange les liens entre **pH sanguin et kaliémie** et quelques pièges cliniques. Règle clé : en **acidose**, les ions H⁺ entrent dans les cellules et le K⁺ en sort → **hyperkaliémie** (le K⁺ **monte**, il ne baisse pas). Le **furosémide** fait perdre du K⁺ → hypokaliémie. L'**insuline** fait entrer le K⁺ dans les cellules. Le **chocolat**, riche en K⁺, est déconseillé en insuffisance rénale sévère (rein qui élimine mal le K⁺).\n\nA. **FAUX** : l'acidose fait **monter** la kaliémie (hyperkaliémie), elle ne la diminue pas.\nB. **VRAI** : le chocolat est riche en K⁺, à éviter en insuffisance rénale chronique sévère.\nC. **VRAI** : le furosémide peut induire une hypokaliémie.\nD. **FAUX** : les **torsades de pointe** sont caractéristiques de l'**hypo**kaliémie ; une kaliémie à 7 mmol/L est une hyperkaliémie.\nE. **VRAI** : l'insuline favorise l'entrée du K⁺ dans les cellules.",
      "questions": [
        {
          "enonce": "**[Physiologie · Bilan du potassium · 2014 session 1 — QCM 28]**\n\nA propos du potassium (K⁺), indiquez la (les) proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'acidose plasmatique induit une diminution de la kaliémie",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "L'excès de chocolat n'est pas recommandé en cas d'insuffisance rénale chronique sévère",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Le traitement par furosémide peut induire une hypokaliémie",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Une kaliémie à 7 mmol/L peut favoriser la survenue de torsades de pointe",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "L'insuline favorise l'entrée du K⁺ dans les cellules.",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCE**\n\nA. FAUX, en acidose métabolique, H⁺ pénètre dans les cellules et K⁺ sort → hyperkaliémie.\nB. VRAI.\nC. VRAI.\nD. FAUX, les torsades de pointe sont caractéristiques de l'hypokaliémie.\nE. VRAI."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2022-2023 (QCM 6)",
      "annee": "2022-2023",
      "rappel_cours": "Le **gradient osmotique corticopapillaire** est la différence de concentration en solutés (surtout **Na⁺, Cl⁻ et urée**) qui augmente du cortex (dilué) vers la papille (très concentré) dans la médullaire du rein. C'est ce gradient qui permet au canal collecteur de réabsorber l'eau et de **concentrer les urines**. Il est fabriqué par l'**anse de Henlé** (multiplication à contre-courant) et entretenu par un débit sanguin lent dans les vasa recta.\n\n**A. FAUX** : l'aldostérone agit sur le tube distal et le canal collecteur (réglage fin du Na⁺ et du K⁺), pas sur la fabrication du gradient médullaire.\n**B. VRAI** : un régime végétarien est **pauvre en protéines**, donc peu d'urée est produite, or l'urée participe au gradient → il est limité.\n**C. VRAI** : le **furosémide** bloque le cotransporteur Na⁺/K⁺/2Cl⁻ de l'anse ascendante, moteur du gradient → il empêche sa constitution.\n**D. FAUX** : les thiazidiques agissent plus loin (tube distal), sur un gradient déjà établi → effet minime.\n**E. FAUX** : l'ADH sert à sortir l'eau du collecteur, elle n'empêche pas la construction du gradient.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2022-2023 — QCM 6]**\n\nParmi les circonstances suivantes, laquelle ou lesquelles limite(nt) la constitution du gradient osmotique interstitiel corticopapillaire ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Un hyperaldostéronisme secondaire",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Un régime strictement végétarien",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Un traitement par furosémide",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Un traitement par diurétique thiazidique",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Une hypersécrétion d'ADH",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : BC**\n\nA. FAUX — l'aldostérone agit sur le tubule distal et le canal collecteur (régulation fine du Na⁺ et du K⁺), donc pas d'effet significatif sur le gradient corticopapillaire médullaire.\nB. VRAI\nC. VRAI\nD. FAUX — les thiazidiques agissent sur le tubule distal, où le gradient corticopapillaire est déjà établi : effet minime sur le gradient médullaire.\nE. FAUX — l'ADH favorise la réabsorption d'eau dans le canal collecteur, mais n'empêche pas la constitution du gradient."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2022-2023 (QCM 7)",
      "annee": "2022-2023",
      "rappel_cours": "Une **polyurie** = uriner beaucoup. On la classe selon la concentration des urines par rapport au plasma :\n- **hypo-osmotique** (urines diluées) → problème d'ADH (l'hormone qui réabsorbe l'eau) : diabète insipide.\n- **iso-osmotique** (urines à la même concentration que le sang) → **diurèse osmotique** : un soluté non réabsorbé (glucose, mannitol) tire l'eau avec lui.\n\n**A. FAUX** : diabète insipide neurogénique = manque d'ADH → urines très diluées (hypo-osmotiques).\n**B. FAUX** : l'acidose stimule surtout la réabsorption de bicarbonate/K⁺, pas de polyurie iso-osmotique typique.\n**C. FAUX** : diabète insipide néphrogénique = rein ne répond pas à l'ADH → urines diluées.\n**D. VRAI** : glycémie à 20 mmol/L → glucose dépasse le seuil rénal → **glucosurie** → diurèse osmotique iso-osmotique.\n**E. FAUX** : insuffisance surrénale = manque d'aldostérone → perte de Na⁺ et déshydratation, urines plutôt hypotoniques.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2022-2023 — QCM 7]**\n\nParmi les circonstances suivantes, laquelle ou lesquelles peut (peuvent) induire une polyurie iso-osmotique au plasma ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Un diabète insipide neurogénique",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Une acidose plasmatique",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Un diabète insipide néphrogénique",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Un diabète sucré mal équilibré avec une glycémie à 20 mmol/L",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Une insuffisance surrénale aiguë",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nA. FAUX — donne une polyurie hypo-osmotique (urines très diluées) par déficit en ADH.\nB. FAUX — l'acidose stimule la réabsorption tubulaire de bicarbonate et de K⁺ ; pas directement une polyurie iso-osmotique.\nC. FAUX — comme le neurogénique : polyurie hypo-osmotique (défaut de réponse à l'ADH).\nD. VRAI\nE. FAUX — déficit en aldostérone → perte de Na⁺ → parfois urine hypotonique, mais surtout déshydratation."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2021-2022 (QCM 3)",
      "annee": "2021-2022",
      "rappel_cours": "Le **gradient osmotique corticopapillaire** est ce qui rend possible la concentration des urines. Points clés :\n- Il dépend du **débit dans les vasa recta** (vaisseaux en épingle de la médullaire) : un débit lent le préserve, un débit rapide le \"lave\".\n- Il dépend de la **longueur de l'anse de Henlé** (plus elle est longue, plus le gradient peut être grand).\n- L'**ADH** favorise la réabsorption de l'**urée** dans le collecteur, ce qui renforce le gradient.\n\n**A. VRAI** : son importance dépend du débit des vasa recta.\n**B. FAUX** : une diurèse osmotique (ex. hyperglycémie) fait perdre de l'eau et **diminue** le gradient.\n**C. VRAI** : l'ADH augmente la réabsorption d'urée dans le collecteur → renforce le gradient.\n**D. VRAI** : dépend de la longueur de l'anse de Henlé.\n**E. VRAI** : sans ce gradient, impossible de concentrer les urines.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2021-2022 — QCM 3]**\n\nÀ propos du gradient osmotique interstitiel cortico-papillaire, indiquez la ou les proposition(s) exacte(s). Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Son importance dépend du débit sanguin dans les vasa recta",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Il est augmenté en cas de diurèse osmotique",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Sa formation est favorisée par l'hormone anti-diurétique via la réabsorption de l'urée dans le tube collecteur",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Son importance dépend structurellement de la longueur de l'anse de Henlé",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Il est strictement indispensable pour concentrer les urines",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ACDE**\n\nA. VRAI\nB. FAUX — diurèse osmotique (ex. hyperglycémie) → perte d'eau → gradient interstitiel diminué.\nC. VRAI\nD. VRAI\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2021-2022 (QCM 7)",
      "annee": "2021-2022",
      "rappel_cours": "La **perméabilité à l'eau** varie le long du néphron :\n- **Tube proximal** et **branche descendante fine** de Henlé : très perméables à l'eau (l'eau suit librement).\n- **Branche ascendante large** de Henlé : **imperméable à l'eau en toutes circonstances** (elle ne réabsorbe que des ions Na⁺/Cl⁻ → segment \"diluteur\").\n- **Tube distal** : imperméable à l'eau (l'aquaporine n'y est pas régulée par l'ADH).\n- **Canal collecteur** : perméable à l'eau **seulement si l'ADH est présente** (elle insère des aquaporines).\n\n**A. VRAI** : tube contourné distal imperméable à l'eau.\n**B. FAUX** : le tube proximal est au contraire très perméable.\n**C. VRAI** : branche ascendante large toujours imperméable.\n**D. FAUX** : le collecteur devient perméable sous ADH.\n**E. FAUX** : la branche descendante fine est très perméable à l'eau.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2021-2022 — QCM 7]**\n\nParmi les segments du néphron suivants, lequel ou lesquels est (sont) en toutes circonstances imperméable(s) à l'eau ? Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Tube contourné distal",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Tube contourné proximal",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Branche ascendante large de l'anse de Henlé",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Canal collecteur",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Branche descendante fine de l'anse de Henlé",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : AC**\n\nA. VRAI\nB. FAUX — très perméable à l'eau.\nC. VRAI\nD. FAUX — perméable à l'eau uniquement sous l'effet de l'ADH.\nE. FAUX — très perméable à l'eau."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2021-2022 (QCM 14)",
      "annee": "2021-2022",
      "rappel_cours": "Chez un diabétique à **20 mmol/L**, il y a trop de glucose dans le sang. Conséquences :\n- **Hyperosmolalité plasmatique** : le glucose est un osmole qui augmente la concentration du plasma.\n- Cette hyperosmolalité **stimule l'ADH** au maximum (l'organisme veut retenir l'eau) et déclenche la **soif**.\n- Le glucose dépasse le **seuil rénal** (~10 mmol/L) → il passe dans l'urine (**glucosurie**) → il tire l'eau avec lui = **diurèse osmotique** → **polyurie** avec urines **diluées**.\n\n**A. VRAI** : hyperosmolalité plasmatique.\n**B. FAUX** : à 20 mmol/L, glucosurie massive → la clairance rénale du glucose n'est pas nulle.\n**C. VRAI** : ADH maximale (hyperosmolalité).\n**D. VRAI** : polyurie osmotique très probable.\n**E. FAUX** : l'urine est diluée par le glucose non réabsorbé → osmolalité urinaire souvent < 600 mosm/kg.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2021-2022 — QCM 14]**\n\nChez un sujet diabétique dont la glycémie est de 20 mmol/L : Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Il existe une hyperosmolalité plasmatique",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "La clairance rénale du glucose est nulle",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La concentration plasmatique d'hormone anti-diurétique (ADH) est maximale",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Il existe très vraisemblablement une polyurie",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "L'osmolalité urinaire est supérieure à 600 mosm/kg H2O",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : ACD**\n\nA. VRAI\nB. FAUX — à 20 mmol/L → glucosurie massive, donc clairance non nulle.\nC. VRAI\nD. VRAI\nE. FAUX — l'urine contient beaucoup de glucose → urine diluée par l'osmole non réabsorbée ; l'osmolalité urinaire peut être inférieure à 600 mOsm/kg."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2020-2021 (QCM 9)",
      "annee": "2020-2021",
      "rappel_cours": "Rappel sur le **gradient osmotique corticopapillaire** (concentration croissante de solutés du cortex vers la papille) :\n- Il est **indispensable pour concentrer les urines**.\n- Il est fabriqué à partir de Na⁺, Cl⁻ et **urée** ; un régime **végétarien** (pauvre en protéines) fournit peu d'urée → gradient diminué.\n- Une **diurèse osmotique** (glucose, mannitol) fait perdre de l'eau et **abolit/diminue** le gradient.\n- Un **débit lent** dans les vasa recta le **préserve** ; s'il diminue, le gradient est mieux maintenu.\n\n**A. VRAI** : indispensable à la concentration des urines.\n**B. VRAI** : diminué si alimentation végétarienne (peu d'urée).\n**C. FAUX** : les thiazidiques agissent sur un gradient déjà établi → ne l'inhibent pas.\n**D. VRAI** : aboli par une diurèse osmotique.\n**E. FAUX** : si le débit des vasa recta diminue, le gradient est au contraire mieux maintenu.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2020-2021 — QCM 9]**\n\nÀ propos du gradient osmotique interstitiel corticopapillaire :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Il est indispensable à la concentration des urines",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Il est diminué en cas d'alimentation végétarienne",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Il est inhibé par les diurétiques thiazidiques",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Il est aboli en cas de diurèse osmotique",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Il diminue lorsque le débit dans les vasa recta diminue",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : ABD**\n\nA. VRAI\nB. VRAI\nC. FAUX — les thiazidiques agissent sur le tubule distal et le gradient corticopapillaire est déjà établi dans la médullaire → ils n'inhibent pas le gradient.\nD. VRAI\nE. FAUX — si le débit diminue → gradient mieux maintenu."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2019 session 1 (QCM 9)",
      "annee": "2019 (session 1)",
      "rappel_cours": "L'**osmolalité** = nombre de particules osmotiquement actives par **kilogramme d'eau** (solvant). L'**osmolarité** = par litre de solution ; les deux valeurs sont très proches.\n- À l'équilibre, l'**osmolalité extracellulaire** renseigne sur l'état d'hydratation du secteur **intracellulaire** (l'eau se déplace pour égaliser les osmolalités).\n- La **natrémie** reflète le rapport Na⁺/eau, donc plutôt l'hydratation ; ce n'est pas un bon reflet du **volume** extracellulaire.\n- Les osmoles intracellulaires (protéines, K⁺, phosphates) varient **lentement**.\n\n**A. VRAI** : c'est la définition exacte de l'osmolalité (particules par kg d'eau).\n**B. VRAI** : l'osmolalité extracellulaire apprécie l'hydratation intracellulaire.\n**C. FAUX** : la natrémie reflète la concentration, pas le volume extracellulaire.\n**D. FAUX** : les osmoles intracellulaires varient lentement, pas selon les repas.\n**E. FAUX** : osmolalité et osmolarité sont proches, pas \"toujours inférieure\".",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2019 session 1 — QCM 9]**\n\nParmi les propositions suivantes concernant l'osmolalité, indiquez la (les) réponse(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'osmolalité correspond au nombre de particules osmotiquement actives par unité de poids de solvant (kg H2O)",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "À l'équilibre, l'osmolalité extracellulaire permet d'apprécier l'état d'hydratation du secteur intracellulaire",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La natrémie est un bon reflet de l'état d'hydratation du secteur extracellulaire",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le nombre d'osmoles contenues dans le secteur intracellulaire varie rapidement en fonction des entrées alimentaires",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "L'osmolalité plasmatique est toujours inférieure à l'osmolarité plasmatique",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : AB**\n\nA. VRAI — l'osmolalité est bien le nombre de particules osmotiquement actives par kg d'eau : c'est la définition correcte.\nB. VRAI\nC. FAUX — la natrémie reflète la concentration de Na⁺ par rapport à l'eau, pas le volume total du compartiment extracellulaire.\nD. FAUX — les osmoles intracellulaires (protéines, ions K⁺, phosphates) varient lentement, pas en quelques heures selon l'alimentation.\nE. FAUX — les deux valeurs sont proches, parfois l'osmolalité est légèrement supérieure ; pas \"toujours inférieure\"."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2019 session 1 (QCM 26)",
      "annee": "2019 (session 1)",
      "rappel_cours": "L'eau totale du corps ≈ **60 % du poids**. Elle se répartit en deux secteurs :\n- **Intracellulaire (ICF)** ≈ **2/3** de l'eau totale.\n- **Extracellulaire (ECF)** ≈ **1/3** (soit ~20 % du poids), lui-même divisé en plasma et interstitium.\n\nPour un sujet de **70 kg** : eau totale ≈ 42 L, dont ICF ≈ 28 L et ECF ≈ 14 L.\nLes mouvements d'eau entre plasma et interstitium dépendent des pressions **hydrostatique** ET **oncotique** (loi de Starling), pas seulement de l'osmose. À l'état stable, les osmolalités ICF et ECF sont **égales**, et l'organisme ajuste ses entrées/sorties d'eau pour garder l'osmolalité constante.\n\n**A. FAUX** : l'ECF = ~1/3 de l'eau (~20 % du poids), pas 40 %.\n**B. FAUX** : mouvements dus aussi à la pression hydrostatique, pas uniquement osmotique.\n**C. FAUX** : l'ICF d'un sujet de 70 kg ≈ 28 L, pas 42 L.\n**D. VRAI** : osmolalités ICF/ECF égales à l'état stable.\n**E. VRAI** : régulation pour maintenir l'osmolalité constante.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2019 session 1 — QCM 26]**\n\nParmi les propositions suivantes concernant le contenu en eau de l'organisme, indiquez la (les) réponse(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'eau du secteur extracellulaire représente 40% du contenu total d'eau de l'organisme",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Les mouvements d'eau entre le secteur vasculaire et le secteur interstitiel sont uniquement dus aux variations de pressions osmotiques",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Pour un sujet de 70 kg, le volume d'eau du secteur intracellulaire est de 42 L",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "À l'état stable, les osmolalités extracellulaire et intracellulaire sont égales",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "L'organisme ajuste ses entrées et sorties d'eau pour maintenir l'osmolalité du milieu intérieur constante",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : DE**\n\nA. FAUX — secteur extracellulaire = ~1/3 de l'eau totale → environ 20 % du poids corporel, pas 40 %.\nB. FAUX — l'eau passe entre plasma et interstitium par pression hydrostatique (pression capillaire) et pression oncotique (protéines) : pas uniquement par osmose, la pression hydrostatique joue un rôle majeur.\nC. FAUX — eau totale ≈ 60 % de 70 kg → 42 L, et le secteur intracellulaire ≈ 2/3 de l'eau totale → 28 L, pas 42 L.\nD. VRAI\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2019 session 1 (QCM 29)",
      "annee": "2019 (session 1)",
      "rappel_cours": "**Concentrer les urines** nécessite : un bon **gradient corticopapillaire** + de l'**ADH** + un collecteur perméable. Tout ce qui casse un de ces éléments **inhibe** la concentration des urines.\n- Une **glycémie à 20 mmol/L** → diurèse osmotique → urines diluées.\n- Un **régime pauvre en protides** → peu d'urée → gradient plus faible.\n- Un **diabète insipide neurogénique** (manque d'ADH) ou **néphrogénique** (rein insensible à l'ADH) → pas de réabsorption d'eau.\n- Le **furosémide** bloque le cotransporteur de l'anse → détruit le gradient.\n\n**A. VRAI** : glycémie 20 mmol/L → diurèse osmotique.\n**B. VRAI** : peu de protides → gradient diminué.\n**C. VRAI** : diabète insipide neurogénique (déficit ADH).\n**D. VRAI** : diabète insipide néphrogénique (résistance à l'ADH).\n**E. VRAI** : furosémide → gradient aboli.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2019 session 1 — QCM 29]**\n\nParmi les situations suivantes, laquelle (lesquelles) est (sont) susceptible(s) d'inhiber la concentration des urines ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Une glycémie à 20 mmol/L",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Un régime pauvre en protides",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Un diabète insipide neurogénique",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Un diabète insipide néphrogénique",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "La prise de furosémide",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ABCDE**\n\nA. VRAI\nB. VRAI\nC. VRAI\nD. VRAI\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2019 session 2 (QCM 8)",
      "annee": "2019 (session 2)",
      "rappel_cours": "La **soif** est déclenchée par deux signaux :\n1. Une **hyperosmolalité plasmatique** (au-delà de ~290 mosm/kg, des capteurs cérébraux la détectent).\n2. Une **baisse de la volémie** (hypovolémie), relayée notamment par l'**angiotensine II**.\nChez le **sujet âgé**, la sensation de soif est souvent **émoussée** (risque de déshydratation).\n\nAttention : c'est un QCM \"SAUF UNE\" → il faut cocher la proposition **fausse**.\n\n**A** (soif si osmolalité > 290) : vrai.\n**B** (soif si baisse sévère de la volémie) : vrai.\n**C** (soif induite par l'angiotensine II) : vrai.\n**D** (soif émoussée chez le sujet âgé) : vrai.\n**E** (soif = signe d'hyperhydratation intracellulaire) : **FAUX** → l'hyperhydratation intracellulaire baisse l'osmolalité et **n'induit pas** la soif. C'est donc la réponse à cocher.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2019 session 2 — QCM 8]**\n\nÀ propos de la sensation de soif, toutes les propositions suivantes sont exactes, SAUF UNE. Laquelle ? (cochez la proposition fausse)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Elle apparaît lorsque l'osmolalité plasmatique dépasse 290 mosm/kg H2O",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Elle peut être présente en cas de diminution sévère de la volémie",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Elle peut être induite par des concentrations plasmatiques élevées d'angiotensine II",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Elle est souvent émoussée chez les sujets âgés",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Elle est le signe d'une hyperhydratation du volume intracellulaire",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : E** (proposition fausse à cocher)\n\nA. Exacte — la soif apparaît lorsque l'osmolalité plasmatique dépasse ~290 mosm/kg H2O.\nB. Exacte — la soif peut être présente en cas d'hypovolémie sévère.\nC. Exacte — l'angiotensine II élevée stimule la soif.\nD. Exacte — la soif est souvent émoussée chez le sujet âgé.\nE. FAUSSE (réponse) — l'hyperhydratation intracellulaire → baisse de l'osmolalité intracellulaire → aucune stimulation de la soif. La soif reflète une hyperosmolalité extracellulaire ou une hypovolémie, pas une hyperhydratation intracellulaire."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2019 session 2 (QCM 20)",
      "annee": "2019 (session 2)",
      "rappel_cours": "Notions d'osmolalité et de mouvements d'eau :\n- Pour un contenu en osmoles constant, l'organisme ajuste ses **entrées/sorties d'eau** pour garder l'**osmolalité** stable.\n- **Osmolalité plasmatique calculée** ≈ **2 × [Na⁺] + [glucose] + [urée]** ≈ 285-290 mosm/kg H2O (le Na⁺ est multiplié par 2 pour tenir compte des anions qui l'accompagnent).\n- Quand l'osmolalité extracellulaire change, l'eau se déplace entre ICF et ECF **jusqu'à égalisation** des osmolalités.\n- À l'état stable, osmolalités ICF et ECF **égales**.\n\n**A. VRAI** : régulation de l'eau pour osmolalité constante.\n**B. VRAI** : formule 2×[Na⁺]+[glucose]+[urée].\n**C. VRAI** : mouvement d'eau jusqu'à égalisation.\n**D. VRAI** : osmolalités égales à l'état stable.\n**E. FAUX** : au moins une réponse (A-D) est correcte.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2019 session 2 — QCM 20]**\n\nParmi les propositions suivantes, indiquez la ou les réponse(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Pour un contenu en osmoles constant, l'organisme ajuste ses entrées et ses sorties d'eau pour maintenir l'osmolalité du milieu intérieur constante",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "L'osmolalité plasmatique calculée est égale à 2 x [Na+] + [glucose] + [urée] ≈ 285-290 mosm/kg H2O",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La modification de l'osmolalité extracellulaire entraîne un mouvement d'eau entre le compartiment intra et extra cellulaire jusqu'à ce que les osmolalités des deux compartiments s'égalisent",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "À l'état stable, les osmolalités extra- et intracellulaires sont égales",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Aucune réponse n'est correcte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : ABCD**\n\nA. VRAI\nB. VRAI\nC. VRAI\nD. VRAI\nE. FAUX"
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2018 session 2 (QCM 3)",
      "annee": "2018 (session 2)",
      "rappel_cours": "Une **hyperglycémie à 25 mmol/L** provoque une cascade d'effets. Le glucose est un osmole : il augmente l'osmolalité plasmatique et passe dans l'urine.\n- Hyperosmolalité → **soif** + **déshydratation intracellulaire** (l'eau sort des cellules) + **ADH élevée**.\n- Glucosurie → **diurèse osmotique** → **polyurie** avec urines **diluées**.\n\nQCM \"SAUF UN\" → il faut cocher l'effet qui **n'est PAS** induit (la proposition fausse).\n\n**A** (soif) : effet réel.\n**B** (osmolalité urinaire à 1200 mosm/kg) : **FAUX** → au contraire, la diurèse osmotique donne des urines **diluées**, l'osmolalité urinaire ne peut pas atteindre 1200. C'est la réponse à cocher.\n**C** (polyurie) : effet réel.\n**D** (déshydratation intracellulaire) : effet réel.\n**E** (ADH élevée) : effet réel.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2018 session 2 — QCM 3]**\n\nUne hyperglycémie à 25 mmol/L chez un sujet diabétique induit tous les phénomènes suivants, SAUF UN. Lequel ? (cochez la proposition fausse)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Une sensation de soif",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Une osmolalité urinaire à 1200 mosm/kg d'H2O",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Une polyurie",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Une déshydratation intracellulaire",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Une concentration plasmatique d'hormone anti-diurétique élevée",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B** (proposition fausse à cocher)\n\nA. Exacte — l'hyperglycémie induit une sensation de soif.\nB. FAUSSE (réponse) — hyperglycémie → glucosurie → diurèse osmotique → urine diluée par rapport à l'osmolalité maximale : elle ne peut pas atteindre 1200 mosm/kg.\nC. Exacte — polyurie osmotique.\nD. Exacte — déshydratation intracellulaire.\nE. Exacte — ADH élevée (hyperosmolalité)."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2018 session 2 (QCM 5)",
      "annee": "2018 (session 2)",
      "rappel_cours": "Le **tube contourné proximal (TCP)** est le \"gros ouvrier\" du néphron : il réabsorbe **quantitativement** le plus de Na⁺, d'eau, de K⁺, et **tout le glucose** (normalement). Mais cette réabsorption est **automatique** (proportionnelle à la filtration), non réglée finement.\nLa **régulation fine (qualitative) du bilan sodé** se fait plus loin : **tube distal + canal collecteur**, sous contrôle de l'**aldostérone**.\n\nQCM \"SAUF UNE\" → cocher la proposition **fausse**.\n\n**A** (TCP = plus grosse réabsorption de Na⁺, quantitatif) : vrai.\n**B** (TCP = zone la plus importante pour la **régulation** du bilan sodé) : **FAUX** → la régulation fine se fait au tube distal/collecteur, pas au TCP. Réponse à cocher.\n**C** (TCP = plus grosse réabsorption d'eau, quantitatif) : vrai.\n**D** (glucose réabsorbé en totalité au TCP) : vrai.\n**E** (TCP = plus grosse réabsorption de K⁺, quantitatif) : vrai.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2018 session 2 — QCM 5]**\n\nToutes les propositions suivantes sont exactes, SAUF UNE. Laquelle ? (cochez la proposition fausse)",
          "items": [
            {
              "lettre": "A",
              "enonce": "La zone la plus importante quantitativement pour la réabsorption du sodium est le tube contourné proximal",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La zone la plus importante qualitativement pour la régulation du bilan sodé est le tube contourné proximal",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "La zone la plus importante quantitativement pour la réabsorption d'eau est le tube contourné proximal",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le glucose est normalement réabsorbé en totalité dans le tube contourné proximal",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "La zone la plus importante quantitativement pour la réabsorption du potassium est le tube contourné proximal",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B** (proposition fausse à cocher)\n\nA. Exacte — le TCP réabsorbe quantitativement le plus de sodium.\nB. FAUSSE (réponse) — la régulation fine du sodium (bilan sodé) se fait surtout au niveau du canal collecteur et du tube distal, sous contrôle de l'aldostérone ; le TCP réabsorbe beaucoup mais de manière automatique.\nC. Exacte — le TCP réabsorbe quantitativement le plus d'eau.\nD. Exacte — le glucose est normalement réabsorbé en totalité dans le TCP.\nE. Exacte — le TCP réabsorbe quantitativement le plus de potassium."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2017 session 2 (QCM 17)",
      "annee": "2017 (session 2)",
      "rappel_cours": "Une **diurèse osmotique** survient quand un **soluté non réabsorbé** reste dans le tubule et **retient l'eau** avec lui (par osmose) → l'urine est abondante et diluée.\nCauses classiques : **glucose** (diabète mal équilibré), **mannitol**, **produits de contraste** iodés.\nÀ distinguer :\n- Le **furosémide** donne une diurèse par blocage d'un transporteur ionique (Na⁺/K⁺/2Cl⁻), pas par soluté osmotique → ce n'est pas une diurèse osmotique.\n- Le **diabète insipide** donne une diurèse **aqueuse** (manque d'ADH), pas osmotique.\n\n**A. VRAI** : diabète sucré (glucose).\n**B. FAUX** : furosémide = diurèse par inhibition du cotransporteur, pas osmotique.\n**C. VRAI** : mannitol.\n**D. VRAI** : produits de contraste.\n**E. FAUX** : diabète insipide = diurèse aqueuse (déficit/insensibilité à l'ADH).",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2017 session 2 — QCM 17]**\n\nUne diurèse osmotique peut être induite par (une ou plusieurs réponses exactes) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Un diabète sucré mal équilibré",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Un traitement par furosémide",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Une perfusion de mannitol",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Une injection d'agents de contraste radiologique",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Un diabète insipide",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : ACD**\n\nA. VRAI\nB. FAUX — le furosémide → diurèse de type soluté par inhibition du cotransporteur Na⁺/K⁺/2Cl⁻, pas une diurèse osmotique.\nC. VRAI\nD. VRAI\nE. FAUX — diabète insipide → déficit en ADH ou insensibilité rénale : diurèse aqueuse, pas osmotique."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2016 session 2 (QCM 5)",
      "annee": "2016 (session 2)",
      "rappel_cours": "Pour **concentrer les urines**, le **canal collecteur** a besoin de plusieurs éléments :\n- Un **gradient corticopapillaire** (fabriqué par l'anse de Henlé via le cotransport Na⁺/K⁺/2Cl⁻).\n- De l'**ADH** (pour ouvrir la perméabilité à l'eau).\n- Des **aquaporines** à la surface apicale (canaux à eau insérés par l'ADH).\nL'**aldostérone**, elle, gère le bilan de **sodium et potassium**, pas directement la concentration de l'urine.\n\nQCM \"SAUF UN\" → cocher l'élément qui **n'est PAS nécessaire** (la proposition fausse).\n\n**A** (gradient corticopapillaire) : nécessaire.\n**B** (sécrétion d'aldostérone) : **FAUX** → pas nécessaire à la concentration de l'urine. Réponse à cocher.\n**C** (ADH) : nécessaire.\n**D** (aquaporines apicales) : nécessaire.\n**E** (cotransport Na/K/2Cl de l'anse) : nécessaire.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2016 session 2 — QCM 5]**\n\nTous les éléments suivants sont nécessaires pour la concentration des urines par le canal collecteur, SAUF UN. Lequel ? (cochez la proposition fausse)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Gradient osmotique interstitiel corticopapillaire",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Sécrétion d'aldostérone",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Sécrétion d'hormone anti-diurétique",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Présence d'aquaporines à la surface apicale des cellules épithéliales du canal collecteur",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Activité du co-transport Na/K/2Cl dans la branche ascendante large de l'anse de Henlé",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B** (proposition fausse à cocher)\n\nA. Nécessaire — le gradient corticopapillaire est indispensable.\nB. FAUSSE (réponse) — l'aldostérone agit surtout sur le bilan sodé et potassique, pas directement sur la concentration de l'urine ; celle-ci dépend de l'ADH, du gradient et des aquaporines.\nC. Nécessaire — l'ADH.\nD. Nécessaire — les aquaporines apicales.\nE. Nécessaire — le cotransport Na/K/2Cl de l'anse ascendante large (fabrique le gradient)."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2016 session 2 (QCM 6)",
      "annee": "2016 (session 2)",
      "rappel_cours": "La **diurèse osmotique** = un soluté non réabsorbé (glucose, mannitol, produit de contraste) reste dans le tubule et retient l'eau → urine **abondante** mais **diluée**.\n- Causes : produits de contraste, diabète mal équilibré, mannitol.\n- La diurèse peut être très importante (plusieurs litres/jour).\n- Point clé : comme un soluté empêche l'urine d'atteindre une forte concentration, l'**osmolalité urinaire reste basse** (souvent < 500 mOsm/L).\n\nQCM \"SAUF UNE\" → cocher la proposition **fausse**.\n\n**A** (causée par produits de contraste) : vrai.\n**B** (causée par diabète mal équilibré) : vrai.\n**C** (diurèse jusqu'à 5 L/jour) : vrai.\n**D** (osmolalité urinaire > 500 mOsm/L) : **FAUX** → au contraire, l'urine est diluée, osmolalité souvent < 500. Réponse à cocher.\n**E** (accompagnée d'une stimulation de l'ADH) : vrai.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2016 session 2 — QCM 6]**\n\nÀ propos de la diurèse osmotique, toutes les propositions suivantes sont exactes, SAUF UNE. Laquelle ? (cochez la proposition fausse)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Elle peut être causée par l'injection de produits de contraste utilisés en radiologie",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Elle peut être causée par un diabète mal équilibré",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La diurèse peut atteindre 5 litres/jour",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "L'osmolalité urinaire est supérieure à 500 mOsm/litre",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Elle s'accompagne d'une stimulation de la sécrétion d'hormone anti-diurétique",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D** (proposition fausse à cocher)\n\nA. Exacte — produits de contraste radiologiques.\nB. Exacte — diabète mal équilibré.\nC. Exacte — la diurèse peut atteindre plusieurs litres/jour.\nD. FAUSSE (réponse) — la diurèse osmotique donne une urine diluée : la présence d'un soluté non réabsorbé (glucose, mannitol, contraste) empêche l'urine d'atteindre les fortes osmolalités (~>1000 mOsm/kg). L'osmolalité est inférieure à celle maximale que peut produire le rein, souvent < 500 mOsm/kg H₂O.\nE. Exacte — stimulation de l'ADH (déshydratation)."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2015 session 1 (QCM 11)",
      "annee": "2015 (session 1)",
      "rappel_cours": "Le **gradient osmotique corticopapillaire** est constitué par l'accumulation de certains solutés dans l'interstitium de la médullaire : **Na⁺**, **Cl⁻**, **urée** et **ammoniac (NH3)**.\nLe **glucose**, lui, est **entièrement réabsorbé dans le tube proximal** (chez le sujet sain) → il n'arrive pas dans la médullaire et ne participe donc **pas** au gradient.\n\nQCM \"SAUF UNE\" → cocher la substance qui **ne s'accumule PAS** (la proposition fausse).\n\n**A** (ammoniac) : participe au gradient → vrai.\n**B** (Na⁺) : participe → vrai.\n**C** (urée) : participe → vrai.\n**D** (glucose) : **FAUX** → réabsorbé en totalité au tube proximal, il ne participe pas au gradient. Réponse à cocher.\n**E** (Cl⁻) : participe → vrai.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2015 session 1 — QCM 11]**\n\nToutes les substances suivantes s'accumulent dans l'interstitium de la médullaire rénale pour constituer le gradient osmotique cortico-papillaire, SAUF UNE. Laquelle ? (cochez la proposition fausse)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Ammoniac",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Na+",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Urée",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Glucose",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Cl-",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D** (proposition fausse à cocher)\n\nA. S'accumule — l'ammoniac participe au gradient.\nB. S'accumule — le Na⁺ participe au gradient.\nC. S'accumule — l'urée participe au gradient.\nD. FAUSSE (réponse) — le glucose est réabsorbé complètement dans le tube proximal → il ne s'accumule pas dans l'interstitium médullaire → il ne participe pas au gradient osmotique.\nE. S'accumule — le Cl⁻ participe au gradient."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2015 session 1 (QCM 26)",
      "annee": "2015 (session 1)",
      "rappel_cours": "L'**ADH (hormone anti-diurétique)** est libérée en cas d'**hyperosmolalité plasmatique** (≥ 285-290 mosm/kg) ou d'hypovolémie. Elle agit sur le **canal collecteur** : elle y insère des **aquaporines** → l'eau est réabsorbée → urines concentrées.\nAttention à ne pas confondre : l'ADH **utilise** le gradient corticopapillaire, mais ne le **crée** pas (le gradient est fait par le Na⁺, Cl⁻, l'urée et l'ammoniac via l'anse de Henlé).\nUne **sécrétion inappropriée d'ADH (SIADH)**, par ex. par une tumeur, retient trop d'eau → **hyponatrémie de dilution**.\n\n**A. FAUX** : l'ADH ne crée pas le gradient, elle permet seulement à l'eau de sortir du collecteur.\n**B. FAUX** : l'ADH est maximale en hyperosmolalité (≥ 285-290), pas à 280 mosm/kg (basse).\n**C. FAUX** : un déficit en ADH donne une diurèse **aqueuse** (urine diluée), pas osmotique.\n**D. VRAI** : une sécrétion inappropriée d'ADH (SIADH) induit une hyponatrémie.\n**E. FAUX** : l'hyperkaliémie n'a pas d'effet direct sur l'ADH.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2015 session 1 — QCM 26]**\n\nParmi les propositions suivantes concernant l'hormone anti-diurétique (ADH), indiquez celle ou celles qui est (sont) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'ADH favorise la constitution du gradient osmotique interstitiel cortico-papillaire",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La concentration plasmatique d'ADH est maximale lorsque l'osmolalité plasmatique est inférieure à 280 mosm/kg H2O",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Le déficit en ADH est à l'origine d'une diurèse osmotique",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "La sécrétion inappropriée d'ADH par une tumeur peut induire une hyponatrémie",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "La sécrétion d'ADH est induite par l'hyperkaliémie",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nA. FAUX — le gradient corticopapillaire est principalement constitué par le Na⁺, le Cl⁻, l'urée et l'ammoniac via l'anse de Henlé. L'ADH ne crée pas le gradient, elle permet uniquement à l'eau de sortir du canal collecteur grâce aux aquaporines.\nB. FAUX — l'ADH est stimulée par l'hyperosmolalité (≥ 285-290 mOsm/kg H₂O) et inhibée par une hypo-osmolalité. À 280 mOsm/kg H₂O → ADH basse, pas maximale.\nC. FAUX — déficit en ADH → diurèse aqueuse (urine diluée), appelée diurèse aquosélective.\nD. VRAI\nE. FAUX — l'hyperkaliémie n'a pas d'effet direct sur l'ADH."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans le bilan de l'eau — 2015 session 2 (QCM 11)",
      "annee": "2015 (session 2)",
      "rappel_cours": "Rappel de la **perméabilité à l'eau** du tubule rénal :\n- **Tube proximal** et **branche descendante** de Henlé : très perméables à l'eau.\n- **Branche ascendante large** de Henlé : **toujours imperméable** à l'eau, quel que soit le taux d'ADH (segment diluteur, réabsorbe Na⁺/Cl⁻ activement → crée le gradient).\n- **Tube distal** : imperméable à l'eau.\n- **Tube collecteur** : perméable à l'eau **seulement sous ADH**.\n\nQCM \"SAUF UNE\" → cocher la proposition **fausse**.\n\n**A** (TCP très perméable à l'eau) : vrai.\n**B** (branche ascendante large perméable à l'eau sous ADH) : **FAUX** → elle est **toujours imperméable** à l'eau, quel que soit l'ADH. Réponse à cocher.\n**C** (tube distal toujours imperméable) : vrai.\n**D** (collecteur perméable sous ADH) : vrai.\n**E** (branche descendante perméable à l'eau) : vrai.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans le bilan de l'eau · 2015 session 2 — QCM 11]**\n\nToutes les propositions suivantes concernant le tubule rénal sont exactes, SAUF UNE. Laquelle ? (cochez la proposition fausse)",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le tube contourné proximal est très perméable à l'eau",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La branche ascendante large de l'anse de Henlé est perméable à l'eau en présence d'hormone anti-diurétique (ADH)",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Le tube contourné distal est toujours imperméable à l'eau",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le tube collecteur est perméable à l'eau en présence d'ADH",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "La branche descendante de l'anse de Henlé est perméable à l'eau",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B** (proposition fausse à cocher)\n\nA. Exacte — le tube contourné proximal est très perméable à l'eau.\nB. FAUSSE (réponse) — la branche ascendante large est toujours imperméable à l'eau, quel que soit le niveau d'ADH. Elle participe à la réabsorption active de Na⁺ et Cl⁻ pour créer le gradient corticopapillaire.\nC. Exacte — le tube contourné distal est toujours imperméable à l'eau.\nD. Exacte — le tube collecteur est perméable à l'eau en présence d'ADH.\nE. Exacte — la branche descendante de l'anse de Henlé est perméable à l'eau."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans l'équilibre acido-basique — 2022-2023 (QCM 10)",
      "annee": "2022-2023",
      "rappel_cours": "Quand on lit une **gazométrie artérielle**, on regarde d'abord le **pH** (normal ≈ 7,38–7,42), puis le **CO2** (poumons) et les **bicarbonates HCO3-** (rein).\nIci : pH = 7,38 (bas-normal), pCO2 = 59 mmHg (**élevé**, normal ≈ 40) et HCO3- = 33 mmol/L (**élevé**, normal ≈ 24). La pO2 est basse (63 mmHg).\nUn CO2 élevé = trop d'acide d'origine **respiratoire** → c'est une **acidose respiratoire**. Comme le pH est revenu normal, le rein a compensé en gardant beaucoup de bicarbonates : on parle d'acidose respiratoire **compensée**.\n**A. VRAI** : en cas d'hypercapnie (CO2↑) chronique, le rein augmente sa capacité maximale à réabsorber les bicarbonates (Tm HCO3-↑), ce qui explique le HCO3- à 33.\n**B. FAUX** : une **alcalose** métabolique donnerait un pH > 7,45. Ici le pH est normal (7,38) : ce n'est donc pas une alcalose.\n**C. VRAI** : si le CO2 est élevé, c'est que le patient élimine mal le CO2 → la **ventilation alvéolaire est diminuée**.\n**D. VRAI** : acidose **respiratoire** (CO2↑) avec pH ramené à la normale = acidose respiratoire **parfaitement compensée**.\n**E. VRAI** : pour compenser, le rein **augmente son excrétion d'acide** (sécrétion de H+ et fabrication d'ammonium).",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans l'équilibre acido-basique · 2022-2023 — QCM 10]**\n\nUne femme de 50 ans présente la gazométrie artérielle suivante : pH = 7,38, pO2 = 63 mmHg, pCO2 = 59 mmHg, [HCO3-] = 33 mmol/L de plasma. Indiquez la ou les proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Le transport maximal d'[HCO3-] par le tubule rénal est augmenté",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Cette femme présente une alcalose métabolique",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La ventilation alvéolaire de cette femme est diminuée",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Cette femme présente une acidose respiratoire parfaitement compensée",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "L'excrétion rénale acide de cette femme est augmentée",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : ACDE**\n\nA. VRAI\nB. FAUX, l'alcalose métabolique → pH > 7,45 et HCO₃⁻↑. Ici pH est normal → pas une alcalose.\nC. VRAI\nD. VRAI\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans l'équilibre acido-basique — 2019 session 1 (QCM 32)",
      "annee": "2019 session 1",
      "rappel_cours": "Les **bicarbonates (HCO3-)** sont la principale réserve tampon de l'organisme. Un tampon, c'est une molécule qui absorbe les excès d'acide ou de base pour stabiliser le pH.\n**A. FAUX** : les bicarbonates sont le principal tampon **extracellulaire** (dans le sang), pas intracellulaire (à l'intérieur des cellules, c'est plutôt les protéines et les phosphates).\n**B. VRAI** : petite molécule non liée, le HCO3- passe **librement** le filtre du glomérule rénal.\n**C. FAUX** : la majeure partie (~80 %) des bicarbonates filtrés est réabsorbée dans le **tube contourné proximal**, et non dans l'anse de Henlé.\n**D. VRAI** : en cas d'**hypercapnie chronique** (CO2 élevé longtemps), le rein augmente sa capacité maximale (Tm) de réabsorption des bicarbonates pour compenser.\n**E. VRAI** : normalement le rein réabsorbe presque tout le bicarbonate filtré, donc il n'en reste quasiment pas dans l'urine : la **bicarbonaturie est nulle ou quasi-nulle**.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans l'équilibre acido-basique · 2019 session 1 — QCM 32]**\n\nA propos des bicarbonates (HCO3-), indiquez la (les) proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Ils constituent le principal tampon intracellulaire",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Ils sont librement filtrés par le rein",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Les bicarbonates filtrés sont principalement réabsorbés au niveau de l'anse de Henlé",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Le transport maximal des bicarbonates par le tubule rénal est augmenté en cas d'hypercapnie chronique",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "La bicarbonaturie est habituellement nulle ou quasi-nulle",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BDE**\n\nA. FAUX, les bicarbonates sont le principal tampon extracellulaire.\nB. VRAI\nC. FAUX, la majorité des bicarbonates filtrés (~80%) est réabsorbée dans le tube contourné proximal.\nD. VRAI\nE. VRAI"
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans l'équilibre acido-basique — 2018 session 2 (QCM 19)",
      "annee": "2018 session 2",
      "rappel_cours": "Le rein élimine les acides produits chaque jour par l'alimentation et le métabolisme. Il ne peut pas rejeter les H+ « tout seuls » dans l'urine (ça la rendrait bien trop acide) : il les **tamponne** avec des transporteurs comme l'**ammonium (NH4+)** et les **phosphates** (acidité titrable).\n**A. FAUX** : l'essentiel des H+ est éliminé **tamponné** (sous forme d'ammonium ou d'acidité titrable), pas sous forme libre.\n**B. FAUX** : l'**aldostérone** (hormone surrénalienne) stimule la sécrétion de H+ par les cellules intercalaires α du canal collecteur → elle **augmente** l'excrétion d'acide.\n**C. VRAI** : dans le tube proximal, réabsorber un bicarbonate est **couplé** à la réabsorption de sodium (Na+), via l'échangeur Na+/H+.\n**D. VRAI** : quand le corps est trop acide (acidose chronique), le rein fabrique plus d'ammonium : l'**ammoniogénèse est stimulée**.\n**E. FAUX** : quand le pH urinaire **baisse** (urine plus acide), c'est qu'on a sécrété et tamponné **plus** de H+ → l'acidité titrable **augmente**.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans l'équilibre acido-basique · 2018 session 2 — QCM 19]**\n\nA propos du rôle du rein dans l'équilibre acide-base, indiquez la ou les proposition(s) exacte(s) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'essentiel des ions H+ produits quotidiennement par l'alimentation et le métabolisme sont éliminés sous forme libre dans l'urine",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "L'aldostérone diminue l'excrétion urinaire d'acides",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La réabsorption proximale de bicarbonates est couplée à la réabsorption de sodium",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "L'ammoniogénèse rénale est stimulée par l'acidose chronique",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "L'acidité titrable diminue lorsque le pH de l'urine diminue",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : CD**\n\nA. FAUX, la majorité des H⁺ est excrétée sous forme de tampon.\nB. FAUX, l'aldostérone stimule la sécrétion de H⁺ par les cellules intercalaires α du canal collecteur, donc augmente l'excrétion acide.\nC. VRAI\nD. VRAI\nE. FAUX, quand le pH de l'urine diminue, l'acidité titrable augmente, car plus de H⁺ est sécrété et tamponné."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans l'équilibre acido-basique — 2016 session 2 (QCM 4)",
      "annee": "2016 session 2",
      "rappel_cours": "Le **pH urinaire** peut varier selon les besoins du corps. Le rein peut acidifier l'urine pour éliminer les acides, mais il existe une **limite basse** : il ne peut pas descendre indéfiniment.\nChez l'Homme, le **pH urinaire minimal** est d'environ **4** (l'urine ne devient pas plus acide que ça, sinon la différence de concentration en H+ deviendrait trop grande à franchir).\nC'est pourquoi le rein ne peut pas éliminer les H+ « libres » sans les tamponner : à pH 4, la quantité de H+ libre reste minuscule. Il doit donc utiliser des tampons (ammonium, phosphates).\n**A, B, C. FAUX** : pH 1, 2 ou 3 seraient trop acides, impossibles à atteindre pour le rein.\n**D. VRAI** : le pH urinaire minimal est d'environ **4**.\n**E. FAUX** : pH 5 est trop élevé pour être la valeur minimale.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans l'équilibre acido-basique · 2016 session 2 — QCM 4]**\n\nQuelle est la valeur du pH urinaire minimal chez l'Homme ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "1",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "2",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "3",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "4",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "5",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nA. FAUX\nB. FAUX\nC. FAUX\nD. VRAI\nE. FAUX"
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans l'équilibre acido-basique — 2016 session 2 (QCM 7)",
      "annee": "2016 session 2",
      "rappel_cours": "Le rein élimine les acides par plusieurs moyens, mais le **principal mécanisme** d'excrétion rénale d'acides est l'**excrétion d'ammonium (NH4+)**. Le rein fabrique de l'ammoniac (NH3) à partir de la glutamine, qui capte un H+ pour devenir NH4+, éliminé dans l'urine.\n**A. FAUX** : l'**acidité titrable** (H+ tamponné par les phosphates) participe à l'excrétion des acides, mais ce n'est pas le mécanisme **principal**.\n**B. FAUX** : réabsorber les **bicarbonates** ne fait pas éliminer d'acide ; ça sert seulement à **conserver** le stock de bicarbonate.\n**C. FAUX** : l'excrétion de H+ **libre** est très faible (< 5 %), car le H+ est toujours tamponné dans l'urine.\n**D. VRAI** : l'**excrétion d'ammonium (NH4+)** est le principal mécanisme d'excrétion rénale des acides.\n**E. FAUX** : le **PAH** (acide paraaminohippurique) sert à **mesurer le débit sanguin rénal**, il n'a rien à voir avec l'élimination des H+.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans l'équilibre acido-basique · 2016 session 2 — QCM 7]**\n\nLe principal mécanisme d'excrétion rénale d'acides est :",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'acidité titrable",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La réabsorption proximale de bicarbonates",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "L'excrétion urinaire d'ions H+ sous forme libre",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "L'excrétion d'ions ammonium (NH4+)",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "L'excrétion d'acide paraaminohippurique (PAH)",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nA. FAUX, l'acidité titrable (H⁺ tamponné par phosphate) participe à l'excrétion des acides mais ce n'est pas le principal mécanisme.\nB. FAUX, la réabsorption de HCO₃⁻ ne constitue pas une excrétion d'acide, elle permet seulement de préserver le bicarbonate.\nC. FAUX, l'excrétion de H⁺ libre est très faible (<5%) car le H⁺ est toujours tamponné dans l'urine.\nD. VRAI\nE. FAUX, le PAH est utilisé pour mesurer le débit sanguin rénal (DSR), pas pour excréter des H⁺."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans l'équilibre acido-basique — 2016 session 2 (QCM 17)",
      "annee": "2016 session 2",
      "rappel_cours": "Même thème que le QCM 19 : comment le rein élimine les acides. La règle : les H+ ne partent presque jamais « libres », ils sont **tamponnés** (ammonium NH4+, acidité titrable).\n**A. FAUX** : l'essentiel des H+ est excrété **tamponné**, sous forme d'ammonium (NH4+) ou d'acides titrables, pas sous forme libre.\n**B. FAUX** : l'**aldostérone** stimule la sécrétion de H+ dans les cellules intercalaires α → elle **augmente** l'excrétion urinaire d'acide.\n**C. VRAI** : la réabsorption proximale des bicarbonates est **couplée** à celle du sodium (échangeur Na+/H+).\n**D. VRAI** : l'**acidose chronique stimule l'ammoniogénèse** (fabrication d'ammonium par le rein).\n**E. FAUX** : quand le pH urinaire **baisse**, on a sécrété plus de H+ → l'acidité titrable **augmente**.",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans l'équilibre acido-basique · 2016 session 2 — QCM 17]**\n\nA propos du rôle du rein dans l'équilibre acide-base, indiquez la ou les propositions exactes :",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'essentiel des ions H+ produits quotidiennement par l'alimentation et le métabolisme sont éliminés sous forme libre dans l'urine",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "L'aldostérone diminue l'excrétion urinaire d'acides",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "La réabsorption proximale de bicarbonates est couplée à la réabsorption de sodium",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "L'ammoniogénèse rénale est stimulée par l'acidose chronique",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "L'acidité titrable diminue lorsque le pH de l'urine diminue",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : CD**\n\nA. FAUX, la majorité des H⁺ est excrétée tamponnée, sous forme d'ions ammonium (NH₄⁺) ou d'acides titrables.\nB. FAUX, l'aldostérone stimule la sécrétion de H⁺ dans les cellules intercalaires α → augmente l'excrétion urinaire d'acide.\nC. VRAI\nD. VRAI\nE. FAUX, quand le pH urinaire diminue, plus de H⁺ est sécrété → acidité titrable augmente."
        }
      ]
    },
    {
      "titre": "Physiologie — Rôle du rein dans l'équilibre acido-basique — 2015 session 2 (QCM 9)",
      "annee": "2015 session 2",
      "rappel_cours": "La **sécrétion acide rénale**, c'est le fait que les cellules du tubule rejettent des H+ dans l'urine. Attention : sécréter des H+ ne veut pas toujours dire les **excréter** (les perdre définitivement) : une partie sert juste à récupérer les bicarbonates filtrés.\n**A. FAUX** : la sécrétion de H+ ne se traduit pas **toujours** par une excrétion acide libre, car les H+ sont souvent tamponnés (phosphate, ammonium) ou servent à réabsorber le bicarbonate.\n**B. VRAI** : en sécrétant des H+ dans le tube proximal, le rein **réabsorbe les bicarbonates filtrés** (le H+ se combine au HCO3- pour former du CO2 réabsorbable).\n**C. FAUX** : l'acidose extracellulaire stimule la sécrétion acide plutôt de façon **indirecte**, pas directement.\n**D. FAUX** : l'**aldostérone** stimule surtout la sécrétion de H+ dans les cellules intercalaires α du canal collecteur **distal**, pas au niveau proximal.\n**E. FAUX** : la sécrétion totale de H+ est plutôt de l'ordre de **~40–50 mmol/jour**, majoritairement tamponnée par NH4+ et acides titrables (et non 60–80).",
      "questions": [
        {
          "enonce": "**[Physiologie · Rôle du rein dans l'équilibre acido-basique · 2015 session 2 — QCM 9]**\n\nConcernant la sécrétion acide rénale, quelle est la réponse exacte ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Elle aboutit toujours à une excrétion acide",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Elle permet la réabsorption des bicarbonates filtrés",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Elle est stimulée directement par l'acidose extracellulaire",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "L'aldostérone stimule la sécrétion acide proximale et distale",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Elle est normalement de l'ordre de 60 à 80 mmoles d'H+ par jour",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : B**\n\nA. FAUX, la sécrétion de H⁺ dans le tubule ne se traduit pas toujours par excrétion libre, car le H⁺ est tamponné par le phosphate ou l'ammonium.\nB. VRAI\nC. FAUX, plutôt indirectement.\nD. FAUX, l'aldostérone stimule surtout la sécrétion de H⁺ dans les cellules intercalaires α du canal collecteur distal.\nE. FAUX, la sécrétion totale d'H⁺ est plutôt ~40–50 mmol/jour, majoritairement tamponnée par NH₄⁺ et acides titrables."
        }
      ]
    },
    {
      "titre": "Physiologie — Miction — 2021-2022 (QCM 39)",
      "annee": "2021-2022",
      "rappel_cours": "Le **détrusor** est le muscle de la paroi de la vessie : c'est un **muscle lisse** (involontaire), donc commandé par le **système nerveux autonome**, pas par la volonté.\n\nCe muscle se contracte grâce au **système parasympathique**, qui libère un neurotransmetteur appelé **acétylcholine**. Cette acétylcholine agit sur des récepteurs **muscariniques** (et non nicotiniques). Retiens : détrusor = muscle lisse = récepteurs **muscariniques**.\n\n**A. FAUX** : l'acétylcholine contracte bien le détrusor, mais via des récepteurs **muscariniques**, pas nicotiniques.\n**B. FAUX** : la **noradrénaline** n'agit pas sur des récepteurs muscariniques (ceux-ci répondent à l'acétylcholine) ; elle agit sur des récepteurs **adrénergiques**.\n**C. VRAI** : le détrusor est bien un **muscle lisse**.\n**D. FAUX** : le **nerf pudendal** commande des muscles **striés** (comme le sphincter externe), pas le détrusor.\n**E. FAUX** : puisque C est vrai, cette réponse est fausse.",
      "questions": [
        {
          "enonce": "**[Physiologie · Miction · 2021-2022 — QCM 39]**\n\nConcernant le détrusor, quelle(s) est(sont) la(les) proposition(s) exacte(s) ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "L'acétylcholine se fixant sur des récepteurs nicotiniques favorise sa contraction",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "La noradrénaline se fixant sur des récepteurs muscariniques favorise sa contraction",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Il s'agit d'un muscle lisse",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Il est innervé par le nerf pudendal",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Aucune des réponses précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : C**\n\nA. FAUX, le détrusor est un muscle lisse, il se contracte via l'acétylcholine agissant sur des récepteurs muscariniques.\nB. FAUX, les récepteurs muscariniques répondent à l'acétylcholine, pas à la noradrénaline ; la noradrénaline agit sur des récepteurs adrénergiques.\nC. VRAI.\nD. FAUX, le nerf pudendal innerve les muscles striés.\nE. FAUX."
        }
      ]
    },
    {
      "titre": "Physiologie — Miction — 2021-2022 (QCM 40)",
      "annee": "2021-2022",
      "rappel_cours": "La miction (vider la vessie) est réglée par deux systèmes autonomes opposés. Le **système sympathique** correspond au mode « stockage/continence » : il garde la vessie pleine sans fuite. À l'inverse, le **parasympathique** déclenche la miction.\n\nConcrètement, le **sympathique** relâche le détrusor (la vessie reste détendue) et contracte le **sphincter interne** (le verrou involontaire du col vésical) : résultat, on retient les urines.\n\nAttention : le **sphincter externe** est un muscle **strié** commandé par le système **somatique** (volontaire) via le **nerf pudendal**, pas par le sympathique.\n\n**A. VRAI** : le sympathique favorise la **continence** (on retient).\n**B. FAUX** : il provoque plutôt la **relaxation** du détrusor, pas sa contraction.\n**C. FAUX** : le **sphincter externe** est strié et dépend du système **somatique**, pas du sympathique.\n**D. VRAI** : le sympathique contracte le **sphincter interne**.\n**E. FAUX** : puisque A et D sont vrais.",
      "questions": [
        {
          "enonce": "**[Physiologie · Miction · 2021-2022 — QCM 40]**\n\nConcernant les effets du système nerveux sympathique sur la miction, quelle(s) est(sont) la(les) réponse(s) exacte(s) ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Il favorise la continence",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Il favorise la contraction du détrusor",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Il favorise la contraction du sphincter externe",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Il favorise la contraction du sphincter interne",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Aucune des réponses précédentes n'est exacte",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : AD**\n\nA. VRAI.\nB. FAUX, c'est plutôt la relaxation.\nC. FAUX, le sphincter externe est un muscle strié, sous contrôle somatique via le nerf pudendal.\nD. VRAI.\nE. FAUX."
        }
      ]
    },
    {
      "titre": "Physiologie — Miction — 2020-2021 (QCM 1)",
      "annee": "2020-2021",
      "rappel_cours": "Le **système nerveux sympathique** est le système de la **continence** : il aide la vessie à rester pleine sans fuir. Il agit à l'opposé du parasympathique, qui lui déclenche la miction.\n\nDeux actions clés du sympathique : il **relâche le détrusor** (le muscle de la vessie reste détendu) et il **contracte le sphincter interne** (le verrou involontaire), donc on retient les urines.\n\nLe **sphincter externe** n'est pas concerné ici : c'est un muscle **strié**, sous contrôle **somatique** (volontaire).\n\n**A. FAUX** : le sympathique favorise la **continence**, pas la miction.\n**B. FAUX** : la contraction du détrusor dépend du **parasympathique**, pas du sympathique.\n**C. FAUX** : le **sphincter externe** dépend du système **somatique**.\n**D. VRAI** : le sympathique contracte le **sphincter interne**.",
      "questions": [
        {
          "enonce": "**[Physiologie · Miction · 2020-2021 — QCM 1]**\n\nConcernant les effets du système nerveux sympathique sur la miction, quelle(s) est(sont) la(les) réponse(s) exacte(s) ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Il favorise la miction",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Il favorise la contraction du détrusor",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Il favorise la contraction du sphincter externe",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Il favorise la contraction du sphincter interne",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : D**\n\nA. FAUX, il favorise la continence.\nB. FAUX, la contraction du détrusor dépend du parasympathique.\nC. FAUX, le sphincter externe dépend du système somatique.\nD. VRAI."
        }
      ]
    },
    {
      "titre": "Physiologie — Miction — 2020-2021 (QCM 2)",
      "annee": "2020-2021",
      "rappel_cours": "Le **sphincter urétral externe** est le verrou **volontaire** de la vessie : c'est un muscle **strié** que l'on commande consciemment pour retenir ou laisser passer les urines. Il est innervé par le **nerf pudendal**, qui appartient au système **somatique** (volontaire).\n\nAu bout de ce nerf, le neurotransmetteur libéré est l'**acétylcholine**. Point important : sur un **muscle strié** (comme tous les muscles squelettiques), l'acétylcholine agit sur des récepteurs de type **nicotinique**.\n\nÀ ne pas confondre : sur le **muscle lisse** (détrusor), l'acétylcholine agit sur des récepteurs **muscariniques**. Ici, comme il s'agit d'un muscle strié commandé par le nerf pudendal, la réponse est **nicotinique**.\n\n**Récepteur nicotinique = VRAI** : c'est le récepteur de l'acétylcholine sur le muscle strié.\n**Récepteur muscarinique = FAUX** : ce serait le cas pour le muscle lisse (détrusor), pas pour le sphincter externe strié.",
      "questions": [
        {
          "enonce": "**[Physiologie · Miction · 2020-2021 — QCM 2]**\n\nSur quel type de récepteur se fixe l'acétylcholine libérée par le nerf pudendal au niveau du sphincter urétral externe ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Un récepteur nicotinique",
              "is_correct": true
            },
            {
              "lettre": "B",
              "enonce": "Un récepteur muscarinique",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : A**\n\nLe type de récepteur est **nicotinique**. Le sphincter urétral externe est un muscle strié innervé par le nerf pudendal (système somatique) ; sur le muscle strié, l'acétylcholine agit sur des récepteurs nicotiniques.\n\nA. VRAI, récepteur nicotinique.\nB. FAUX, les récepteurs muscariniques concernent le muscle lisse (détrusor), pas le sphincter externe strié."
        }
      ]
    },
    {
      "titre": "Physiologie — Miction — 2019 session 1 (QCM 5)",
      "annee": "2019",
      "rappel_cours": "Le **système nerveux sympathique** assure la **continence** : il permet à la vessie de se remplir sans fuir. Il s'oppose au parasympathique qui, lui, déclenche la miction.\n\nDeux actions à retenir : le sympathique **relâche le détrusor** (la vessie reste détendue) et **contracte le sphincter interne** (le verrou involontaire du col vésical). Résultat : on retient les urines.\n\nLe **sphincter externe** échappe au sympathique : c'est un muscle **strié** commandé par le système **somatique** (volontaire).\n\n**A. FAUX** : le sympathique favorise la **continence**, pas la miction.\n**B. FAUX** : il provoque plutôt la **relaxation** du détrusor.\n**C. VRAI** : le sympathique contracte le **sphincter interne**.\n**D. FAUX** : la contraction du **sphincter externe** dépend du système **somatique**.\n**E** : d'après la correction officielle, marquée VRAI (contradiction apparente avec C dans la source).",
      "questions": [
        {
          "enonce": "**[Physiologie · Miction · 2019 session 1 — QCM 5]**\n\nConcernant les effets du système nerveux sympathique sur la miction, quelle est la réponse exacte ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Il favorise la miction",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Il favorise la contraction du détrusor",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Il favorise la contraction du sphincter interne",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Il favorise la contraction du sphincter externe",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Aucune des réponses précédentes",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : CE**\n\nA. FAUX, c'est la continence.\nB. FAUX, plutôt la relaxation.\nC. VRAI.\nD. FAUX, la contraction du sphincter externe dépend du système nerveux somatique.\nE. VRAI."
        }
      ]
    },
    {
      "titre": "Sémiologie — PA, protéinurie, hématurie — 2022-2023 (QCM 16)",
      "annee": "2022-2023",
      "rappel_cours": "Une **hématurie** est la présence de vrais **globules rouges** (hématies) dans les urines. Le problème : plusieurs situations colorent les urines en rouge ou rendent la bandelette « positive » SANS qu'il y ait de globules rouges à l'examen microscopique (ECBU).\n**A. FAUX** — la **betterave** colore les urines mais ne contient pas de sang : la bandelette reste NÉGATIVE (c'est un simple pigment alimentaire).\n**B. FAUX** — une **tumeur de vessie** saigne vraiment : on trouverait des globules rouges à l'ECBU, ce n'est donc pas le bon exemple.\n**C. VRAI** — la **rhabdomyolyse** (destruction musculaire) libère de la **myoglobine**, qui fait réagir la bandelette « sang » sans qu'il y ait d'hématies.\n**D. VRAI** — l'**hémolyse intravasculaire** libère de l'**hémoglobine** libre, qui rend la bandelette positive sans globules rouges intacts.\n**E. VRAI** — une **compression musculaire prolongée** provoque une rhabdomyolyse, donc de la myoglobine dans les urines.",
      "questions": [
        {
          "enonce": "**[Sémiologie · PA, protéinurie, hématurie · 2022-2023 — QCM 16]**\n\nDans quelle(s) circonstance(s), pouvez-vous observer des urines rouges, une bandelette urinaire « hématurie » +++, sans présence de globules rouges à l'examen cyto-bactériologique des urines :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Consommation de betterave",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Tumeur de vessie",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Rhabdomyolyse",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Hémolyse intravasculaire",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Compression musculaire prolongée",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : CDE**\n\nA) FAUX : la bandelette urinaire est négative si la coloration est due à une consommation de betterave.\nB) FAUX : dans le cas de la tumeur de la vessie on devrait retrouver des globules rouges à l'ECBU.\nC) VRAI\nD) VRAI\nE) VRAI"
        }
      ]
    },
    {
      "titre": "Sémiologie — PA, protéinurie, hématurie — 2022-2023 (QCM 17)",
      "annee": "2022-2023",
      "rappel_cours": "La **pression artérielle (PA)** normale n'a pas les mêmes seuils selon le moment de la journée et la méthode de mesure. En **MAPA** (mesure ambulatoire sur 24h), les seuils « normaux » sont plus bas qu'en consultation.\nRepères à retenir : **PAS moyenne / 24h < 130 mmHg** ; **PAS diurne < 135 mmHg** ; **PAD diurne < 85 mmHg** ; **PAD nocturne < 70 mmHg** ; en consultation **< 140/90 mmHg**.\n**A. FAUX** — 135 mmHg de PAS moyenne / 24h est trop haut : la limite est **< 130 mmHg**.\n**B. VRAI** — 68 mmHg de PAD nocturne est bien **< 70 mmHg**.\n**C. VRAI** — 130 mmHg de PAS diurne est bien **< 135 mmHg**.\n**D. VRAI** — 75 mmHg de PAD moyenne est bien **< 80 mmHg**.\n**E. VRAI** — 85 mmHg de PAD en consultation est bien **< 90 mmHg**.",
      "questions": [
        {
          "enonce": "**[Sémiologie · PA, protéinurie, hématurie · 2022-2023 — QCM 17]**\n\nQuelles sont les valeurs de pression artérielle normale chez un homme de 20 ans ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Pression artérielle systolique moyenne sur 24h : 135 mmHg",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Pression diastolique nocturne moyenne : 68 mmHg",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Pression artérielle systolique diurne moyenne : 130 mmHg",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Pression artérielle moyenne diastolique /24h : 75 mmHg",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Pression diastolique en consultation : 85 mmHg",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCDE**\n\nA) FAUX : PAS moyenne sur 24h doit être inférieure à 130 mmHg.\nB) VRAI : PAD nocturne moyenne doit être < 70 mmHg.\nC) VRAI : PAS diurne moyenne doit être < 135 mmHg.\nD) VRAI : PAD moyenne doit être < 80.\nE) VRAI : PAD en consultation doit être < 90 mmHg."
        }
      ]
    },
    {
      "titre": "Sémiologie — PA, protéinurie, hématurie — 2021-2022 (QCM 24)",
      "annee": "2021-2022",
      "rappel_cours": "Mêmes idées qu'au QCM 16 : des **urines rouges sans vraies hématies** en quantité excessive. La bandelette « sang » réagit à l'**hème** (hémoglobine et myoglobine), pas seulement aux globules rouges intacts.\n**A. FAUX** — une **sécrétion excessive de chaînes légères libres d'immunoglobuline** (myélome) peut s'accompagner d'une **hématurie macroscopique**, donc de vraies hématies en grande quantité : ce n'est pas le bon exemple.\n**B. VRAI** — la **rhabdomyolyse** libère de la **myoglobine** : urines rouges sans hématies.\n**C. FAUX** — une **infection urinaire** peut donner de vraies hématies dans les urines.\n**D. VRAI** — l'**hémolyse intravasculaire** libère de l'**hémoglobine** libre : coloration sans hématies.\n**E. VRAI** — la **betterave** est un simple pigment : urines rouges, mais pas d'hématies (et bandelette négative).",
      "questions": [
        {
          "enonce": "**[Sémiologie · PA, protéinurie, hématurie · 2021-2022 — QCM 24]**\n\nDans quelles circonstances peuvent être observées des urines rouges sans présence d'hématie en quantité excessive dans les urines ? Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Sécrétion excessive de chaines légères libres d'immunoglobuline",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Rhabdomyolyse",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Infection urinaire",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Hémolyse intravasculaire",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Consommation de betterave",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BDE**\n\nA) FAUX : une sécrétion excessive de chaines légères libres d'immunoglobuline peut être accompagnée par une hématurie macroscopique = hématies en grande quantité.\nB) VRAI\nC) FAUX : une infection urinaire peut être accompagnée de la présence d'hématies en quantité excessive dans les urines.\nD) VRAI\nE) VRAI"
        }
      ]
    },
    {
      "titre": "Sémiologie — PA, protéinurie, hématurie — 2021-2022 (QCM 29)",
      "annee": "2021-2022",
      "rappel_cours": "En **MAPA sur 24h**, pour dire que la PA est normale (et écarter une **HTA**), il faut respecter des seuils bas selon jour/nuit.\nRepères : **PAS nocturne moyenne < 120 mmHg** ; **PAS diurne < 135 mmHg** ; **PAS moyenne / 24h < 130 mmHg** ; **PAD moyenne < 80 mmHg** ; **PAD nocturne < 70 mmHg**.\n**A. FAUX** — 130 mmHg de PAS nocturne est trop haut : il faut **< 120 mmHg**.\n**B. VRAI** — 130 mmHg de PAS diurne est **< 135 mmHg**.\n**C. VRAI** — 125 mmHg de PAS moyenne est **< 130 mmHg**.\n**D. FAUX** — 84 mmHg de PAD moyenne dépasse **80 mmHg**.\n**E. FAUX** — 75 mmHg de PAD nocturne dépasse **70 mmHg**.",
      "questions": [
        {
          "enonce": "**[Sémiologie · PA, protéinurie, hématurie · 2021-2022 — QCM 29]**\n\nUn sujet de 25 ans présente une pression artérielle élevée en médecine du travail. Il est prescrit une mesure ambulatoire de la pression artérielle sur 24h. Quelles valeurs permettent d'affirmer que la pression artérielle est normale (et donc exclure le diagnostic d'HTA) ? Veuillez choisir au moins une réponse.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Pression artérielle systolique nocturne 130 mmHg",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Pression artérielle systolique diurne 130 mmHg",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Pression artérielle systolique moyenne 125 mmHg",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Pression artérielle diastolique moyenne 84 mmHg",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Pression artérielle (diastolique) nocturne 75 mmHg",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : BC**\n\nA) FAUX : la PAS nocturne moyenne doit être < 120 mmHg.\nB) VRAI\nC) VRAI\nD) FAUX : la PAD moyenne doit être < 80 mmHg.\nE) FAUX : la PAD nocturne doit être < 70 mmHg."
        }
      ]
    },
    {
      "titre": "Sémiologie — PA, protéinurie, hématurie — 2020-2021 (QCM 19)",
      "annee": "2020-2021",
      "rappel_cours": "La **bandelette urinaire** ne détecte PAS toutes les protéines : elle réagit surtout à l'**albumine** en grande quantité. C'est pour ça qu'elle peut donner des **faux négatifs** : d'autres protéines (chaînes légères, β2-microglobuline) passent inaperçues.\n**A. FAUX** — la **β2-microglobuline** (protéine de petit poids) n'est pas détectée par la bandelette.\n**B. FAUX** — les **chaînes légères libres d'immunoglobulines** (protéinurie de Bence-Jones) ne sont pas détectées : c'est le piège classique du myélome.\n**C. FAUX** — la **myoglobine** fait réagir la zone « sang », pas la zone « protéines ».\n**D. VRAI** — la bandelette détecte surtout l'**albumine** (en grande quantité).\n**E. FAUX** — l'**hémoglobine** est détectée par la zone « sang », pas « protéines ».",
      "questions": [
        {
          "enonce": "**[Sémiologie · PA, protéinurie, hématurie · 2020-2021 — QCM 19]**\n\nQuelle est ou quelles sont la(les) protéine(s) détectée(s) par la bandelette urinaire ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Béta2 microglobuline",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Chaines légères libres d'immunoglobulines",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Myoglobine",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Albumine",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Hémoglobine",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nLa bandelette urinaire ne détecte uniquement les grandes quantités d'albumine, d'où le souci des « faux négatifs ». La bandelette est négative malgré la présence de ces protéines dans l'urine."
        }
      ]
    },
    {
      "titre": "Sémiologie — PA, protéinurie, hématurie — 2020-2021 (QCM 20)",
      "annee": "2020-2021",
      "rappel_cours": "L'**hypotension orthostatique** = chute de la PA quand on passe de la position **allongée (décubitus)** à **debout (orthostatisme)**.\nDéfinition officielle : baisse de la **PAS > 20 mmHg** ET/OU baisse de la **PAD > 10 mmHg** entre décubitus et orthostatisme. Une simple valeur basse debout ne suffit pas : c'est la **différence** qui compte.\n**A. FAUX** — une PAS de 100 mmHg debout, sans notion de baisse, ne définit pas l'hypotension orthostatique.\n**B. FAUX** — même chose pour une PAD de 50 mmHg debout.\n**C. FAUX** — une différence de PAS de **15 mmHg** est inférieure au seuil de **20 mmHg**.\n**D. VRAI** — une différence de PAD de **12 mmHg** dépasse le seuil de **10 mmHg** : critère rempli.\n**E. FAUX** — l'augmentation de la fréquence cardiaque n'entre pas dans la définition.",
      "questions": [
        {
          "enonce": "**[Sémiologie · PA, protéinurie, hématurie · 2020-2021 — QCM 20]**\n\nQuelles valeurs permettent d'affirmer la présence d'une hypotension orthostatique ? Question à réponses multiples.",
          "items": [
            {
              "lettre": "A",
              "enonce": "Pression artérielle systolique de 100 mmHg en orthostatisme",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Pression artérielle diastolique de 50 mmHg en orthostatisme",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Différence de pression artérielle systolique entre décubitus et orthostatisme = 15 mmHg",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Différence de pression artérielle diastolique entre décubitus et orthostatisme = 12 mmHg",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Augmentation de la fréquence cardiaque entre décubitus et orthostatisme de 30 battements / min",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nDéfinitions du cours : hypotension orthostatique = baisse de la PAS > 20 mmHg entre la valeur mesurée en décubitus et en orthostatisme et/ou baisse de la PAD > 10 mmHg entre la valeur mesurée en décubitus et en orthostatisme."
        }
      ]
    },
    {
      "titre": "Sémiologie — PA, protéinurie, hématurie — 2019 (QCM 34)",
      "annee": "2019",
      "rappel_cours": "Encore les seuils de **PA normale en MAPA sur 24h** (mesure ambulatoire). Chaque proposition donne une fourchette : elle est fausse dès que la borne haute dépasse le seuil normal.\nRepères : **PAS diurne < 135 mmHg** ; **PAD diurne < 85 mmHg** ; **PAS nocturne < 120 mmHg** ; **PAD nocturne 60-69 mmHg** (soit < 70) ; **PAS moyenne / 24h < 130 mmHg**.\n**A. FAUX** — 120-140 mmHg de PAS diurne dépasse **135 mmHg**.\n**B. FAUX** — 80-89 mmHg de PAD diurne dépasse **85 mmHg**.\n**C. FAUX** — 110-129 mmHg de PAS nocturne dépasse **120 mmHg**.\n**D. VRAI** — 60-69 mmHg de PAD nocturne reste **< 70 mmHg**.\n**E. FAUX** — 120-140 mmHg de PAS moyenne / 24h dépasse **130 mmHg**.",
      "questions": [
        {
          "enonce": "**[Sémiologie · PA, protéinurie, hématurie · 2019 — QCM 34]**\n\nQuelle(s) est (sont) la (les) valeur(s) normale(s) de la pression artérielle lors d'une mesure ambulatoire sur 24 h ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "En période diurne, pression artérielle systolique (PAS) : 120-140 mmHg",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "En période diurne, pression artérielle diastolique (PAD) : 80-89 mmHg",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "En période nocturne, PAS : 110-129 mmHg",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "En période nocturne, PAD : 60-69 mmHg",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "En moyenne sur 24h, PAS : 120-140 mmHg",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : D**\n\nA) FAUX : en période diurne, PAS < 135 mmHg.\nB) FAUX : en période diurne, PAD < 85 mmHg.\nC) FAUX : en période nocturne, PAS < 120 mmHg.\nD) VRAI\nE) FAUX : en moyenne, sur 24h, PAS < 130 mmHg."
        }
      ]
    },
    {
      "titre": "Sémiologie — PA, protéinurie, hématurie — 2019 (QCM 35)",
      "annee": "2019",
      "rappel_cours": "Situation classique : bandelette « **hématurie** » positive mais **examen cytologique** des urines SANS hématies. Cela arrive quand un pigment de type **hème** (hémoglobine, myoglobine) fait réagir la bandelette sans qu'il y ait de globules rouges.\n**A. FAUX** — la **betterave** est un pigment alimentaire : le test bandelette « sang » est **négatif**.\n**B. FAUX** — la **rifampicine** (antibiotique) colore les urines en orange mais le test « sang » reste **négatif**.\n**C. VRAI** — la **rhabdomyolyse** libère de la **myoglobine** : bandelette positive sans hématies.\n**D. VRAI** — l'**hémolyse intravasculaire** libère de l'**hémoglobine** libre : bandelette positive sans hématies.\n**E. FAUX** — l'**hépatite** ne rend pas la bandelette « sang » positive.",
      "questions": [
        {
          "enonce": "**[Sémiologie · PA, protéinurie, hématurie · 2019 — QCM 35]**\n\nDans quelle(s) circonstance(s) peut-on observer une hématurie positive à la bandelette alors que l'examen cytologique des urines ne montre pas d'hématurie ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Consommation de betterave",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Traitement par rifampicine",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Rhabdomyolyse",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Hémolyse intra-vasculaire",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Hépatite",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : CD**\n\nA) FAUX : le test est négatif.\nB) FAUX : le test est négatif.\nC) VRAI\nD) VRAI\nE) FAUX : le test est négatif."
        }
      ]
    },
    {
      "titre": "Sémiologie — PA, protéinurie, hématurie — 2019 session 2 (QCM 23)",
      "annee": "2019 session 2",
      "rappel_cours": "Rappel de la **définition de l'hypotension orthostatique** : baisse de la **PAS > 20 mmHg** ET/OU baisse de la **PAD > 10 mmHg** entre la position allongée (décubitus) et debout (orthostatisme). C'est la **variation** entre les deux positions qui compte, pas une valeur isolée.\n**A. FAUX** — « PA < 130/80 mmHg debout » est une valeur absolue, sans notion de baisse : hors définition.\n**B. FAUX** — « PAS < 100 mmHg debout » est aussi une valeur isolée, pas une chute mesurée.\n**C. FAUX** — une baisse de PAS d'**au moins 15 mmHg** n'atteint pas le seuil de **> 20 mmHg**.\n**D. FAUX** — item non retenu par la correction officielle.\n**E. VRAI** — une baisse de **PAD d'au moins 10 mmHg** correspond au critère diastolique de la définition.",
      "questions": [
        {
          "enonce": "**[Sémiologie · PA, protéinurie, hématurie · 2019 session 2 — QCM 23]**\n\nUne hypotension orthostatique est définie par (une ou plusieurs réponses exactes) :",
          "items": [
            {
              "lettre": "A",
              "enonce": "Une PA < 130/80 mmHg en position debout",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Une PAS < 100 mmHg en position debout",
              "is_correct": false
            },
            {
              "lettre": "C",
              "enonce": "Une baisse de PAS d'au moins 15 mmHg en position debout par rapport à la position allongée",
              "is_correct": false
            },
            {
              "lettre": "D",
              "enonce": "Une baisse de PAS d'au moins 30 mmHg en position debout par rapport à la position allongée",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Une baisse de PAD d'au moins 10 mmHg en position debout par rapport à la position allongée",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : E**\n\nCe sont les définitions du cours : hypotension orthostatique = baisse de la PAS > 20 mmHg entre la valeur mesurée en décubitus et en orthostatisme et/ou baisse de la PAD > 10 mmHg entre la valeur mesurée en décubitus et en orthostatisme."
        }
      ]
    },
    {
      "titre": "Sémiologie — PA, protéinurie, hématurie — 2019 session 2 (QCM 25)",
      "annee": "2019 session 2",
      "rappel_cours": "La zone « **protéines** » de la bandelette peut être **faussement positive** dans certaines conditions, en dehors d'une vraie protéinurie pathologique.\n**A. FAUX** — les **chaînes légères libres d'immunoglobuline** ne sont PAS détectées par la bandelette (au contraire, elles donnent des faux NÉGATIFS).\n**B. VRAI** — des **urines très alcalines** (pH élevé) faussent la réaction et rendent le test faussement positif.\n**C. VRAI** — une **hématurie macroscopique** apporte des protéines sanguines qui font positiver le test protéines.\n**D. FAUX** — la **rhabdomyolyse** concerne la zone « sang » (myoglobine), pas la zone « protéines ».\n**E. FAUX** — l'**hémolyse** concerne aussi la zone « sang » (hémoglobine), pas les protéines.",
      "questions": [
        {
          "enonce": "**[Sémiologie · PA, protéinurie, hématurie · 2019 session 2 — QCM 25]**\n\nDans quelle(s) circonstance(s) peut-on observer une « bandelette urinaire » faussement positive pour la détection d'une protéinurie ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Présence de chaines légères libres d'immunoglobuline dans les urines",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Urines alcalines",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Hématurie macroscopique",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Rhabdomyolyse",
              "is_correct": false
            },
            {
              "lettre": "E",
              "enonce": "Hémolyse",
              "is_correct": false
            }
          ],
          "correction": "**Réponse : BC**\n\nA) FAUX\nB) VRAI\nC) VRAI\nD) FAUX\nE) FAUX"
        }
      ]
    },
    {
      "titre": "Sémiologie — Insuffisance rénale chronique (IRC) — 2019 (QCM 26)",
      "annee": "2019",
      "rappel_cours": "Le **débit de filtration glomérulaire (DFG)** mesure l'efficacité de filtration des reins. On l'**estime** (eDFG) par des équations comme **MDRD** ou **CKD-EPI**, à partir de la **créatinine plasmatique** (déchet musculaire filtré par le rein) corrigée selon des caractéristiques du patient.\nFormule voisine (Cockcroft) : **Clairance créatinine = (140 − âge) × poids × coefficient / [créatinine]plasmatique**.\n**A. FAUX** — on utilise la créatinine **plasmatique** (sang), et non urinaire, pour ces équations d'estimation.\n**B. VRAI** — la **créatinine plasmatique** est le paramètre central.\n**C. VRAI** — le **poids** intervient (masse musculaire, production de créatinine).\n**D. VRAI** — le **sexe** sert à choisir le bon **coefficient** (homme/femme).\n**E. VRAI** — l'**âge** est nécessaire car la fonction rénale diminue avec l'âge.",
      "questions": [
        {
          "enonce": "**[Sémiologie · Insuffisance rénale chronique (IRC) · 2019 — QCM 26]**\n\nQuel(s) est(sont) le(s) paramètre(s) indispensable(s) pour estimer le débit de filtration glomérulaire (eDFG) selon l'équation MDRD ?",
          "items": [
            {
              "lettre": "A",
              "enonce": "Concentration urinaire de créatinine",
              "is_correct": false
            },
            {
              "lettre": "B",
              "enonce": "Concentration plasmatique de créatinine",
              "is_correct": true
            },
            {
              "lettre": "C",
              "enonce": "Poids",
              "is_correct": true
            },
            {
              "lettre": "D",
              "enonce": "Sexe",
              "is_correct": true
            },
            {
              "lettre": "E",
              "enonce": "Age",
              "is_correct": true
            }
          ],
          "correction": "**Réponse : BCDE**\n\nNB : Clairance en créatinine = (140 − âge) × poids × coeff / [créatinine]p.\nA) FAUX : concentration plasmatique et non urinaire de créatinine.\nB) VRAI\nC) VRAI\nD) VRAI : pour savoir quel coefficient utiliser.\nE) VRAI"
        }
      ]
    }
  ]
};

export default content;
