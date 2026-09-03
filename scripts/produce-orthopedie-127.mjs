/** Chapitre 127 — fiche source-only, modèle éditable. */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { compileFicheModel } from "./lib/orthopedie-fiche.mjs";
const d = resolve(
    process.argv[2] ||
      "../.corpus-orthopedie/tumeurs-benignes-epiphysometaphysaires",
  ),
  o = resolve(process.argv[3] || join(d, "delivery", "quality-v1"));
mkdirSync(o, { recursive: true });
const F = (n) => ({
    path: `img/img_${String(n).padStart(3, "0")}.png`,
    position: "after",
    size: "large",
  }),
  R = (concept, bullets, x = {}) => ({ concept, bullets, ...x }),
  N = (kind, bullets) => ({ kind, bullets });
const fiche = {
  title: "Tumeurs bénignes épiphysométaphysaires",
  year: "2025-2026",
  sourceBlocks: [
    2, 5, 7, 9, 12, 13, 14, 15, 16, 20, 25, 27, 29, 32, 38, 40, 41, 43, 45, 47,
    49, 50, 53, 55, 59, 61, 70, 78, 81, 84, 86, 91, 93, 96, 98, 101, 102, 103,
    104, 105, 106, 107, 108, 109, 110, 112, 113, 115, 118, 119, 123, 127,
  ],
  parts: [
    {
      title: "Évaluer une lésion épiphysométaphysaire",
      sections: [
        {
          title: "Définition et agressivité",
          rows: [
            R("Territoire", [
              "La région épiphysométaphysaire s’étend de l’os sous-chondral à l’origine de l’isthme cortical diaphysaire.",
              "Elle comporte une zone juxta-articulaire incluse dans les insertions capsulaires et ligamentaires.",
              "La proximité articulaire conditionne le risque mécanique et la reconstruction.",
            ]),
            R(
              "Bénignité",
              [
                "Une tumeur bénigne est définie par son tissu prolifératif osseux, cartilagineux ou fibreux.",
                "Elle ne présente pas les caractéristiques histologiques et cytologiques de malignité.",
                "L’agressivité se juge par confrontation radiographique et évolutive, non par une gradation microscopique.",
              ],
              { image: F(1) },
            ),
            N("a_retenir", [
              "Bénin ne signifie pas indolore ou non fragilisant : localisation, douleur et évolution guident la décision.",
            ]),
          ],
        },
        {
          title: "Biopsie et imagerie",
          rows: [
            R("Décision de biopsie", [
              "La biopsie préalable n’est pas une règle absolue.",
              "Elle est discutée selon symptômes, caractère radiographique, évolution et données scintigraphiques.",
              "Aucun critère isolé n’a de valeur absolue.",
            ]),
            R("Règles de biopsie", [
              "La biopsie diagnostique peut être radioguidée au trocart ou chirurgicale.",
              "Elle suit les règles des biopsies de tumeurs osseuses lorsqu’elle est indiquée.",
              "La biopsie-exérèse emporte la totalité de la lésion.",
            ]),
            R(
              "Imagerie",
              [
                "Radiographie standard et tomodensitométrie règlent la majorité des situations.",
                "Elles analysent la destruction corticale, l’évolutivité et planifient le geste.",
                "L’IRM est centrale si extension aux parties molles ou sous-chondrale est suspectée.",
              ],
              { image: F(3) },
            ),
          ],
        },
      ],
    },
    {
      title: "Décider un traitement conservateur ou une exérèse",
      sections: [
        {
          title: "Indications et marges",
          rows: [
            R("Surveillance", [
              "Après certitude diagnostique, une lésion de grade 1 peut relever d’une simple surveillance radiographique.",
              "Le traitement conservateur est possible contrairement à l’exérèse quasi systématique d’une tumeur maligne.",
              "Une stabilité documentée est une donnée décisionnelle.",
            ]),
            R("Pourquoi opérer ?", [
              "La douleur peut traduire activité tumorale ou fragilisation osseuse.",
              "Une fracture ou un risque de fracture justifie une prise en charge.",
              "L’exérèse dépend aussi de l’évolutivité et de l’agressivité locale.",
            ]),
            R("Marges", [
              "L’intervention est intracompartimentale.",
              "La résection est le plus souvent intralésionnelle ou périlésionnelle.",
              "Une exérèse extralésionnelle est rare dans les tumeurs bénignes.",
            ]),
          ],
        },
        {
          title: "Destruction radioguidée et curetage",
          rows: [
            R(
              "Destruction radioguidée",
              [
                "Elle repose sur forage transosseux d’une lésion repérée sous amplificateur ou surtout scanner.",
                "Elle est réalisée par un radiologue spécialisé.",
                "Elle est adaptée à certaines tumeurs accessibles et bien localisées.",
              ],
              { image: F(4) },
            ),
            R("Curetage", [
              "Le curetage-évidement est une exérèse intralésionnelle qui doit retirer tout tissu tumoral en conservant l’environnement cortical.",
              "Il ne doit pas être considéré comme un geste mineur.",
              "Une exérèse incomplète expose à la persistance ou à la récidive.",
            ]),
            R(
              "Fenêtre corticale",
              [
                "Sa position et sa taille sont planifiées sur les radiographies préopératoires.",
                "Les curettes doivent atteindre toute la paroi de la cavité.",
                "Une fenêtre trop limitée laisse du tissu tumoral en place.",
              ],
              { image: F(5) },
            ),
          ],
        },
      ],
    },
    {
      title: "Reconstruire sans fragiliser l’articulation",
      sections: [
        {
          title: "Curetage complet et adjuvants",
          rows: [
            R("Instrumentation", [
              "Des curettes de formes et tailles différentes retirent volume central et parois.",
              "Les curettes droites de gros diamètre travaillent le centre.",
              "Les curettes petites atteignent les zones périphériques.",
            ]),
            R("Adjuvants", [
              "Les parois corticales peuvent recevoir des adjuvants cytotoxiques.",
              "Les options physiques comprennent chaleur par ciment ou bistouri et refroidissement par cryothérapie.",
              "Les adjuvants complètent le curetage mais ne compensent pas un abord insuffisant.",
            ]),
            R("Comblement", [
              "Autogreffe spongieuse et parfois allogreffe morcelée comblent les cavités volumineuses.",
              "Les substituts de phosphate tricalcique sont utilisables injectables ou solides.",
              "Le choix dépend du volume, du soutien et du projet de consolidation.",
            ]),
          ],
        },
        {
          title: "Renforcement",
          rows: [
            R("Indication mécanique", [
              "Le renforcement n’est pas systématique.",
              "Il dépend de l’état cortical péritumoral et de la classification de Lodwick.",
              "Les stades IC, II et III font discuter un renfort selon topographie.",
            ]),
            R(
              "Soutien sous-chondral",
              [
                "Une extension épiphysaire peut diminuer le soutien du cartilage.",
                "Le renfort doit alors être placé sous l’os sous-chondral.",
                "Un étai osseux ou une plaque à extension endo-osseuse peut être nécessaire.",
              ],
              { image: F(7) },
            ),
            R("Cortex métaphysaire", [
              "Une tumeur volumineuse ou ostéolytique peut imposer un renforcement cortical.",
              "La stratégie protège le risque de fracture postopératoire.",
              "La reconstruction est dimensionnée à la fragilité résiduelle.",
            ]),
          ],
        },
      ],
    },
    {
      title: "Adapter le geste au type tissulaire",
      sections: [
        {
          title: "Tumeurs ostéoformatrices",
          rows: [
            R("Ostéome ostéoïde", [
              "Le nidus mesure par définition quelques millimètres et au plus 10 mm.",
              "La chirurgie est préférée lorsqu’elle permet prélèvement et identification du nidus.",
              "La destruction radioguidée dépend de l’accessibilité et de la sécurité du trajet.",
            ]),
            R("Ostéoblastome", [
              "Son diamètre, supérieur à celui de l’ostéome ostéoïde, est de 10 à 20 mm dans le corpus.",
              "Cette taille conduit le plus souvent à l’exérèse chirurgicale plutôt qu’à la destruction radioguidée.",
              "Un diagnostic histologique est souhaitable.",
            ]),
            N("piege", [
              "Le repérage précis du nidus conditionne l’exérèse ou la destruction radioguidée.",
            ]),
          ],
        },
        {
          title: "Tumeurs chondroformatrices",
          rows: [
            R("Enchondrome", [
              "Les chondromes des os plats, notamment coxaux, restent suspects.",
              "Les localisations proximales des os tubulaires imposent une vigilance accrue devant un possible chondrosarcome.",
              "La biopsie doit être représentative lorsque le doute persiste.",
            ]),
            R(
              "Chondroblastome",
              [
                "La géode épiphysaire volumineuse doit être curetée et comblée.",
                "Un curetage insuffisant expose particulièrement à la récidive.",
                "Le curetage dépasse la condensation périphérique selon la technique décrite.",
              ],
              { image: F(13) },
            ),
            R("Exostose et fibrome chondromyxoïde", [
              "L’exostose est opérée surtout pour gêne de volume ou conflit tendineux.",
              "Le fibrome chondromyxoïde souffle la corticale sans nécessairement la rompre.",
              "Son curetage peut être complété par étai cortical ou renforcement.",
            ]),
          ],
        },
      ],
    },
    {
      title: "Gérer les lésions à risque de récidive",
      sections: [
        {
          title: "Tumeur à cellules géantes",
          rows: [
            R("Planification", [
              "Le risque de récidive peut atteindre 35 %, souvent lié à une exérèse initiale incomplète.",
              "La prise en charge est confiée à un centre rompu aux tumeurs et complications.",
              "L’IRM guide la planification devant l’extension aux parties molles et sous-chondrale.",
            ]),
            R("Forme peu agressive", [
              "Elle est peu douloureuse, confinée, sans effraction corticale et peu évolutive.",
              "Le curetage-comblement doit être minutieux.",
              "Si l’os sous-chondral est mince, éviter le ciment seul et privilégier un comblement protecteur.",
            ]),
            R(
              "Forme agressive et récidive",
              [
                "Une forme agressive se rapproche du traitement des tumeurs malignes sur le plan technique.",
                "Une récidive ne condamne pas nécessairement la chirurgie conservatrice.",
                "L’exérèse d’une récidive obéit aux mêmes règles que la chirurgie première.",
              ],
              { image: F(15) },
            ),
          ],
        },
        {
          title: "Kystes et dysplasie fibreuse",
          rows: [
            R("Kyste anévrysmal", [
              "Le curetage-comblement est le traitement habituel.",
              "Le risque de récidive élevé peut conduire à un adjuvant par phénol ou cryothérapie.",
              "Une embolisation préopératoire est discutée pour certains kystes volumineux ou proximaux.",
            ]),
            R("Fibrome non ossifiant", [
              "Son aspect est souvent typique et n’impose pas de biopsie.",
              "Sa localisation métaphysaire épargne l’épiphyse.",
              "Il est exceptionnellement fragilisant et ne nécessite généralement pas de chirurgie.",
            ]),
            R("Dysplasie fibreuse", [
              "La forme monostotique est souvent fortuite et n’impose pas d’exérèse systématique.",
              "Le traitement dépend de la localisation et de l’atteinte corticale.",
              "Les formes polyostotiques se compliquent de fissures ou fractures selon la déformation.",
            ]),
            N("a_retenir", [
              "Toute tumeur bénigne doit être traitée dans une stratégie diagnostique, oncologique et mécanique cohérente.",
            ]),
          ],
        },
      ],
    },
  ],
  synthesis: {
    chiffres: {
      headers: ["Situation", "Donnée", "Conduite"],
      rows: [
        [
          "Nidus ostéome ostéoïde",
          "≤ 10 mm",
          "Repérage précis et prélèvement si chirurgie",
        ],
        ["Ostéoblastome", "10–20 mm", "Exérèse chirurgicale habituelle"],
        ["TCG", "Récidive jusqu’à 35 %", "Curetage minutieux et suivi"],
        ["Os sous-chondral TCG", "< 7 mm", "Éviter ciment seul"],
      ],
    },
    tables: [
      {
        title: "Décider la biopsie",
        headers: ["Domaine", "Question", "Conséquence"],
        rows: [
          [
            "Clinique",
            "Douleur ou découverte fortuite ?",
            "Pondérer l’indication",
          ],
          [
            "Radiographie",
            "Image typique et stable ?",
            "Surveillance possible",
          ],
          [
            "Scintigraphie",
            "Fixation isolée ou multiple ?",
            "Compléter l’analyse",
          ],
          ["Doute", "Diagnostic incertain", "Biopsie selon règles tumorales"],
        ],
      },
      {
        title: "Curetage et reconstruction",
        headers: ["Temps", "But", "Piège"],
        rows: [
          ["Fenêtre", "Atteindre toute la cavité", "Fenêtre trop limitée"],
          ["Curettes", "Centre puis parois", "Curetage incomplet"],
          ["Adjuvant", "Compléter destruction", "Ne remplace pas le curetage"],
          ["Renfort", "Prévenir fracture", "Indication non systématique"],
        ],
      },
      {
        title: "Situations particulières",
        headers: ["Lésion", "Option", "Vigilance"],
        rows: [
          [
            "Chondroblastome",
            "Curetage-comblement",
            "Récidive si curetage insuffisant",
          ],
          ["TCG", "IRM et curetage minutieux", "Parties molles/sous-chondral"],
          ["Kyste anévrysmal", "Curetage + adjuvant possible", "Récidive"],
          ["Fibrome non ossifiant", "Surveillance", "Aspect typique"],
        ],
      },
    ],
    keyPoints: [
      "L’agressivité est radioclinique et évolutive.",
      "La biopsie n’est pas systématique mais répond à une stratégie.",
      "Curetage complet exige une fenêtre adaptée et des curettes variées.",
      "Les adjuvants complètent mais ne remplacent pas l’exérèse.",
      "Le renforcement est mécanique et dépend du cortex et du soutien sous-chondral.",
      "TCG : IRM, information du patient et prévention des récidives.",
      "Kystes et dysplasies imposent une décision proportionnée au risque de fracture.",
    ],
    eclair: [
      "Confirmer le diagnostic avant tout geste ; biopsie raisonnée.",
      "Radio/TDM analysent cortex et planifient ; IRM si extension des parties molles ou sous-chondrale.",
      "Curetage = geste oncologique précis : fenêtre large et parois accessibles.",
      "Autogreffe, allogreffe ou substitut selon la cavité ; renfort seulement si fragilité.",
      "Ostéome ostéoïde : nidus ≤ 10 mm ; ostéoblastome : 10–20 mm.",
      "Chondroblastome et TCG : curetage minutieux, risque de récidive.",
      "Os sous-chondral mince : protection structurale, pas de ciment isolé.",
    ],
  },
};
writeFileSync(join(o, "fiche.model.json"), JSON.stringify(fiche, null, 2));
writeFileSync(join(o, "fiche.body.html"), compileFicheModel(fiche, d));
console.log(JSON.stringify({ o, parts: 5, sections: 10 }));
