const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept,
  bullets,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  ...(image ? { image } : {}),
});
const image = (path, caption, sourceCaption, extra = {}) => ({
  path,
  position: "after",
  size: "large",
  layout: "full_width",
  containsText: true,
  caption,
  sourceCaption,
  ...extra,
});
const I = {
  vce: image(
    "img/img_001.png",
    "Régulation du volume circulant efficace et de l’osmolarité",
    "Mécanismes de régulation du VCE et de l’osmolarité",
    { cropBottomMm: 9 },
  ),
  solutes: image(
    "img/img_002.png",
    "Distribution corporelle des principaux solutés intraveineux",
    "Répartition des solutions intraveineuses dans les compartiments",
  ),
  ira: image(
    "img/img_003.png",
    "Conséquences systémiques de l’IRA et réponses périopératoires",
    "Considérations et prise en charge périopératoire de l’IRA",
  ),
  risk: image(
    "img/img_004.png",
    "Facteurs de risque d’IRA postopératoire",
    "Facteurs de risque d’IRA postopératoire",
  ),
  rrt: image(
    "img/img_005.png",
    "Situations justifiant une suppléance rénale",
    "Indications de suppléance rénale",
    { cropBottomMm: 8 },
  ),
  ckd: image(
    "img/img_006.png",
    "Points de vigilance chez le patient insuffisant rénal chronique ou dialysé",
    "Considérations additionnelles pour l’IRC et l’IRT",
    { cropBottomMm: 7 },
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Comprendre la physiologie rénale utile à l’anesthésie",
      sections: [
        {
          title: "Relier anatomie, filtration et vulnérabilité",
          rows: [
            row(
              "Fonctions essentielles",
              [
                "Le rein ajuste eau, électrolytes et pH, excrète toxines et médicaments, et assure des fonctions endocrines.",
                {
                  text: "Une atteinte rénale retentit au-delà de la diurèse.",
                  children: [
                    "Rénine et médiateurs : contrôle hémodynamique",
                    "Erythropoïétine et calcitriol : hématopoïèse et métabolisme osseux",
                  ],
                },
              ],
              ["b00003", "b00006", "b00011", "b00012"],
            ),
            row(
              "Organisation",
              [
                "Cortex : majorité des glomérules ; médulla : anses de Henlé, interstitium et collecteurs.",
                "Calices, bassinet et uretères sont rétropéritonéaux ; vessie et urètre constituent les voies basses.",
              ],
              ["b00014", "b00016"],
            ),
            row(
              "Circulation",
              [
                "Les reins représentent 0,5 % du poids mais reçoivent 20–25 % du débit cardiaque.",
                "L’artère rénale se ramifie jusqu’aux artérioles afférentes, capillaires glomérulaires puis artérioles efférentes.",
              ],
              ["b00019", "b00020"],
            ),
            row(
              "Médulla vulnérable",
              [
                "La vascularisation en série transmet toute baisse de débit aux territoires d’aval.",
                {
                  text: "La médulla vit près de sa limite d’oxygénation.",
                  children: [
                    "Seulement 15 % du débit rénal, contre 85 % pour le cortex",
                    "Extraction d’oxygène proche de 79 %, contre 18 % dans le cortex",
                  ],
                },
              ],
              ["b00021"],
            ),
          ],
        },
        {
          title: "Maîtriser filtration, autorégulation et tubule",
          rows: [
            row(
              "Néphron",
              [
                "Chaque rein contient environ un million de néphrons ; plus de 1 700 L de sang sont filtrés chaque jour.",
                "Le volume urinaire final n’est que de 1–2 L grâce à une réabsorption tubulaire majeure.",
              ],
              ["b00023", "b00030"],
            ),
            row(
              "Filtration glomérulaire",
              [
                "La pression hydrostatique favorise l’ultrafiltration ; la pression oncotique plasmatique s’y oppose.",
                "Les cellules mésangiales modulent la surface filtrante et donc le DFG.",
              ],
              ["b00025"],
            ),
            row(
              "Autorégulation",
              [
                "Lorsque la perfusion baisse, les prostaglandines dilatent l’afférente et l’angiotensine II contracte l’efférente.",
                {
                  text: "Le DFG est préservé dans une fenêtre de pression.",
                  children: [
                    "Autorégulation habituelle pour une PAM d’environ 80–180 mmHg",
                    "Sous le seuil : baisse de pression glomérulaire, IRA prérénale puis NTA si l’agression persiste",
                  ],
                },
              ],
              ["b00026", "b00027"],
            ),
            row(
              "Médicaments à risque",
              [
                "Les AINS inhibent les prostaglandines et compromettent la dilatation afférente.",
                "IEC et ARA2 diminuent la vasoconstriction efférente ; l’association avec hypovolémie expose à une chute du DFG.",
              ],
              ["b00028"],
            ),
          ],
        },
        {
          title: "Raisonner sur eau, sodium, potassium et acide-base",
          rows: [
            row(
              "VCE et osmolarité",
              [
                "Le volume circulant efficace est la fraction plasmatique contribuant à la perfusion tissulaire et à la pression.",
                "Osmolarité calculée : 2 Na + glucose + urée, en mmol/L.",
              ],
              ["b00032", "b00033"],
              I.vce,
            ),
            row(
              "Réponses hormonales",
              [
                "Une baisse du VCE active sympathique, rénine-angiotensine-aldostérone et ADH.",
                {
                  text: "La priorité hémodynamique peut dégrader la natrémie.",
                  children: [
                    "Aldostérone : réabsorption distale de sodium et d’eau",
                    "ADH : réabsorption d’eau libre ; hyponatrémie possible en insuffisance cardiaque ou cirrhose",
                  ],
                },
              ],
              ["b00033"],
            ),
            row(
              "Compartiments",
              [
                "Chez un adulte de 70 kg : environ 28 L intracellulaires et 14 L extracellulaires, dont 4–5 L plasmatiques.",
                "Un cristalloïde diffuse rapidement vers l’interstitium ; seule une fraction demeure intravasculaire.",
              ],
              ["b00036", "b00039"],
              I.solutes,
            ),
            row(
              "K+ et acides",
              [
                "L’excrétion potassique dépend de la kaliémie, du pH, du débit tubulaire et de l’aldostérone.",
                {
                  text: "Le rein maintient l’équilibre acido-basique en deux temps.",
                  children: [
                    "Réabsorber le bicarbonate filtré, surtout au tubule proximal",
                    "Excréter les acides non volatils sous forme ammonium et acides titrables",
                  ],
                },
              ],
              ["b00051", "b00053", "b00055"],
            ),
          ],
        },
      ],
    },
    {
      title: "Evaluer et protéger la fonction rénale périopératoire",
      sections: [
        {
          title: "Interpréter DFG, créatinine et diurèse",
          rows: [
            row(
              "Utilité du DFG",
              [
                "Le DFG confirme et quantifie la dysfonction, oriente l’investigation et ajuste les doses.",
                "La créatinine est le marqueur courant, mais son augmentation est retardée.",
              ],
              ["b00041", "b00042", "b00043"],
            ),
            row(
              "Cockcroft-Gault",
              [
                "Clairance = 1,23 × (140 − âge) × poids × k / créatininémie.",
                {
                  text: "La formule exige des unités et un contexte corrects.",
                  children: [
                    "k = 1 chez l’homme et 0,85 chez la femme",
                    "Valide seulement lorsque la fonction rénale est stable",
                  ],
                },
              ],
              ["b00044", "b00045", "b00047", "b00048"],
            ),
            row(
              "Limites",
              [
                "Age, sexe, masse musculaire, alimentation et maladie chronique modifient la créatinine indépendamment du DFG.",
                "Une expansion hydrique dilue la créatinine ; celle-ci peut rester normale avant une baisse du DFG proche de 50 %.",
              ],
              ["b00049"],
            ),
            row(
              "Oligurie périopératoire",
              [
                "L’anesthésie diminue souvent transitoirement débit rénal, DFG et diurèse.",
                {
                  text: "Une diurèse basse isolée ne commande pas un remplissage aveugle.",
                  children: [
                    "Rechercher pression, VCE, obstruction et contexte chirurgical",
                    "Réévaluer après correction du mécanisme plutôt que viser un chiffre",
                  ],
                },
              ],
              ["b00065", "b00066", "b00067"],
            ),
          ],
        },
        {
          title: "Adapter anesthésie, médicaments et chirurgie",
          rows: [
            row(
              "Effets anesthésiques",
              [
                "Les effets rénaux sont surtout indirects : baisse de débit, vasodilatation, pression, réponse sympathique et endocrine.",
                "Le maintien du VCE et de la PA réduit le risque d’IRA ; la néphrotoxicité clinique du sévoflurane n’est pas démontrée.",
              ],
              ["b00066", "b00067", "b00068", "b00069", "b00070"],
            ),
            row(
              "Hypnotiques",
              [
                "Les agents volatils sont éliminés par le poumon ; propofol, barbituriques et étomidate sont peu modifiés.",
                "La kétamine est utilisable, mais certains métabolites peuvent s’accumuler.",
              ],
              ["b00072", "b00074", "b00076"],
            ),
            row(
              "Sédatifs et opioïdes",
              [
                "Hypoalbuminémie et métabolites actifs augmentent la sensibilité aux benzodiazépines.",
                {
                  text: "Choisir l’opioïde selon ses métabolites.",
                  children: [
                    "Eviter mépéridine ; morphine : M6G et dépression respiratoire",
                    "Fentanyl, sufentanil et rémifentanil : pharmacocinétique plus prévisible",
                  ],
                },
              ],
              ["b00078", "b00079"],
            ),
            row(
              "Curarisation",
              [
                "Succinylcholine possible si K+ < 5,5 mmol/L ; cisatracurium offre l’élimination la plus prévisible.",
                {
                  text: "La décurarisation doit intégrer la clairance.",
                  children: [
                    "Rocuronium : effet potentiellement prolongé, monitorage neuromusculaire requis",
                    "Sugammadex non recommandé si clairance < 30 mL/min ou dialyse",
                  ],
                },
              ],
              ["b00080", "b00081", "b00082", "b00083", "b00084"],
            ),
          ],
        },
        {
          title: "Prévenir l’agression rénale",
          rows: [
            row(
              "Stress chirurgical",
              [
                "Le pneumopéritoine comprime veines, rein et VCI, baisse le débit et provoque une oligurie proportionnelle à la pression.",
                "CEC, clampage aortique, dissection périrénale et troubles neuroendocriniens augmentent aussi le risque.",
              ],
              ["b00086"],
            ),
            row(
              "Perfusion",
              [
                "Maintenir un VCE suffisant et une PA compatible avec l’autorégulation individuelle.",
                {
                  text: "La correction hémodynamique suit une séquence.",
                  children: [
                    "Corriger une hypovolémie vraie avec un apport titré",
                    "Si le VCE est satisfaisant, utiliser un vasopresseur pour restaurer la pression",
                  ],
                },
              ],
              ["b00095", "b00123"],
            ),
            row(
              "Néphrotoxiques",
              [
                "Eviter AINS et colloïdes de synthèse chez le patient à risque ; aucune molécule n’a prouvé une prévention spécifique.",
                "Pour un contraste iodé indispensable : informer le radiologiste, limiter l’exposition et hydrater ; l’acétylcystéine n’est plus recommandée.",
              ],
              ["b00096", "b00098"],
            ),
            row(
              "Clampage et solutés",
              [
                "Raccourcir autant que possible un clampage aortique, surtout suprarénal.",
                "Les solutés balancés limitent l’acidose hyperchlorémique ; le choix reste guidé par VCE, ions et pertes.",
              ],
              ["b00099", "b00122"],
            ),
          ],
        },
      ],
    },
    {
      title: "Diagnostiquer et prendre en charge IRA, IRC et dialyse",
      sections: [
        {
          title: "Reconnaître l’IRA et son mécanisme",
          rows: [
            row(
              "Définition KDIGO",
              [
                "IRA si créatinine augmente de plus de 26,5 µmol/L en 48 h, ou d’au moins 50 % en 7 jours.",
                "Critère urinaire : diurèse < 0,5 mL/kg/h pendant plus de 6 h.",
              ],
              ["b00088", "b00089"],
            ),
            row(
              "Trois mécanismes",
              [
                "Prérénale 30–60 %, intrinsèque environ 40 %, postrénale environ 10 %.",
                {
                  text: "L’évaluation initiale recherche deux causes immédiatement réversibles.",
                  children: [
                    "Hypovolémie ou faible perfusion à corriger sans surcharge",
                    "Obstacle à exclure par sonde et/ou imagerie",
                  ],
                },
              ],
              ["b00090"],
            ),
            row(
              "Retentissement",
              [
                "L’IRA peut provoquer encéphalopathie, HTA, arythmie, péricardite, œdème pulmonaire, troubles digestifs et infectieux.",
                "Hyperkaliémie, acidose, anémie et dysfonction plaquettaire conditionnent directement l’anesthésie.",
              ],
              ["b00092", "b00102"],
              I.ira,
            ),
            row(
              "Traitement",
              [
                "Supprimer néphrotoxiques, ajuster doses, traiter causes et complications, suivre poids, bilan, ions, créatinine et diurèse.",
                "L’hyperkaliémie menaçante impose stabilisation membranaire, transfert intracellulaire du K+ puis élimination.",
              ],
              ["b00092", "b00102"],
            ),
          ],
        },
        {
          title: "Anticiper IRA postopératoire et suppléance",
          rows: [
            row(
              "Temporalité",
              [
                "L’IRA postopératoire apparaît typiquement dans les 48–72 h.",
                "Elle résulte le plus souvent d’une sommation de terrain, exposition préopératoire et agressions peropératoires.",
              ],
              ["b00094"],
            ),
            row(
              "Facteurs de risque",
              [
                "Age, diabète, IRC, HTA, insuffisance cardiaque ou hépatique augmentent le risque.",
                {
                  text: "Les agressions acquises sont souvent multiples.",
                  children: [
                    "Hypovolémie, choc, vasopresseurs, contraste, AINS ou trauma",
                    "Urgence, chirurgie majeure, clampage aortique, transfusion, rhabdomyolyse ou colloïdes",
                  ],
                },
              ],
              ["b00094", "b00103", "b00105"],
              I.risk,
            ),
            row(
              "Prévention",
              [
                "Opérer si possible lorsque la créatinine est revenue au niveau basal et optimiser toute cause active.",
                "Maintenir perfusion plutôt que forcer la diurèse ; surveiller dans les jours suivant le geste.",
              ],
              ["b00095", "b00096"],
            ),
            row(
              "Dialyse urgente",
              [
                "La suppléance ne repose pas sur un seuil isolé de créatinine.",
                {
                  text: "Retenir les complications réfractaires au traitement médical.",
                  children: [
                    "Anurie, hyperkaliémie, acidose ou surcharge pulmonaire",
                    "Urémie compliquée et certaines intoxications dialysables",
                  ],
                },
              ],
              ["b00107", "b00108"],
              I.rrt,
            ),
          ],
        },
        {
          title: "Sécuriser IRC, IRT et accès vasculaire",
          rows: [
            row(
              "Définition IRC",
              [
                "Dysfonction depuis plus de 3 mois, DFG < 60 mL/min et/ou marqueur structurel ou fonctionnel persistant.",
                "La classification associe cause, catégorie de DFG et albuminurie.",
              ],
              ["b00111", "b00113"],
            ),
            row(
              "Terrain",
              [
                "Diabète 45 %, HTA 27 % et glomérulonéphrites 8 % sont les principales causes.",
                "IRC et IRA s’entretiennent : chacune augmente le risque de l’autre.",
              ],
              ["b00116", "b00117"],
            ),
            row(
              "Evaluation préopératoire",
              [
                "Obtenir l’avis néphrologique, la stabilité, le poids sec, la dernière dialyse et l’état de l’accès.",
                {
                  text: "Chez le dialysé, viser une chirurgie élective après dialyse récente.",
                  children: [
                    "Idéalement moins de 24 h, avec K+ contrôlé",
                    "Protéger la fistule : pas de brassard, ponction ni compression",
                  ],
                },
              ],
              ["b00119", "b00120", "b00121"],
              I.ckd,
            ),
            row(
              "Accès et régionale",
              [
                "Les cathéters antérieurs peuvent thromboser les veines centrales ; revoir l’anatomie avant une nouvelle voie.",
                "Evaluer la coagulation avant régionale ; un bloc du plexus brachial peut améliorer le débit d’une fistule en création.",
              ],
              ["b00128", "b00129", "b00131"],
            ),
          ],
        },
      ],
    },
    {
      title: "Anticiper les complications des chirurgies urologiques",
      sections: [
        {
          title: "Maîtriser les approches transurétrales",
          rows: [
            row(
              "Principes",
              [
                "Résection sous irrigation continue, lithotomie, anesthésie générale ou neuraxiale avec niveau sensitif T10.",
                "La glycine 1,5 % est légèrement hypotonique et non électrolytique.",
              ],
              ["b00134"],
            ),
            row(
              "Syndrome RTUP",
              [
                "L’ouverture des sinus prostatiques absorbe l’irrigation ; risque accru si durée > 1 h, pression ou volume élevés.",
                {
                  text: "Une hyponatrémie hypoosmolaire sévère peut devenir neurologique et cardiovasculaire.",
                  children: [
                    "Céphalées, agitation, confusion, convulsions, désaturation et arythmie",
                    "Restriction, furosémide si surcharge ; NaCl 3 % si convulsions ou coma jusqu’à amélioration ou Na ≥ 125 mmol/L",
                  ],
                },
              ],
              ["b00136", "b00137", "b00138", "b00139"],
            ),
            row(
              "RTUP : autres risques",
              [
                "Une bactériurie peut provoquer une bactériémie : adapter l’antibioprophylaxie à la culture.",
                "L’irrigation dilue le sang perdu et fait sous-estimer l’hémorragie : contrôler l’hémoglobine si doute.",
              ],
              ["b00140"],
            ),
            row(
              "Tumeur vésicale",
              [
                "Perforation < 1 % : retour d’irrigation faible, douleur rétropubienne, signes vagaux ou instabilité.",
                {
                  text: "Une tumeur latérale expose au réflexe obturateur.",
                  children: [
                    "Electrocautère : adduction brutale et risque de perforation",
                    "Préférer anesthésie générale avec bloc neuromusculaire efficace",
                  ],
                },
              ],
              ["b00142", "b00143", "b00144"],
            ),
          ],
        },
        {
          title: "Préparer voies hautes et chirurgies majeures",
          rows: [
            row(
              "Voies urinaires hautes",
              [
                "Les gestes urétéraux exigent un niveau sensitif T6.",
                "Sepsis sur calcul obstructif : drainage urgent par sonde double J ou néphrostomie selon dilatation et coagulation.",
              ],
              ["b00146", "b00148"],
            ),
            row(
              "Prostatectomie robotique",
              [
                "Trendelenburg > 30° : œdème facial et laryngé, hausse des pressions intraoculaire et intracrânienne, risque compartimental.",
                {
                  text: "La fin de procédure exige une stratégie d’extubation.",
                  children: [
                    "Rechercher œdème des voies aériennes après longue position",
                    "Contrôler pression, ventilation, points d’appui et pertes sanguines",
                  ],
                },
              ],
              ["b00150", "b00151", "b00152", "b00153"],
            ),
            row(
              "Néphrectomie",
              [
                "Décubitus latéral, douleur sous-costale, tumeur parfois très vascularisée ou thrombus cave.",
                "Prévoir accès, pression invasive et sang ; protéger la fonction du rein restant.",
              ],
              ["b00155", "b00156", "b00157", "b00158", "b00159"],
            ),
            row(
              "Cystectomie",
              [
                "Intervention souvent > 6 h avec pertes > 1 000 mL : accès fiables, pression continue et analgésie multimodale.",
                "Une dérivation digestive peut entraîner troubles du sodium, chlore, potassium et acidose métabolique.",
              ],
              ["b00161", "b00162", "b00164", "b00165"],
            ),
          ],
        },
        {
          title: "Perfuser et surveiller un greffon rénal",
          rows: [
            row(
              "Bénéfice et donneur",
              [
                "La transplantation améliore qualité de vie et survie par rapport à la dialyse.",
                "Le greffon provient d’un donneur vivant, après décès cardiocirculatoire ou neurologique.",
              ],
              ["b00167", "b00168"],
            ),
            row(
              "Technique",
              [
                "Anesthésie générale, implantation iliaque, anastomoses veineuse puis artérielle et raccord urétéro-vésical.",
                "Durée habituelle 1,5–3 h, pertes le plus souvent < 200 mL ; appliquer toutes les mesures de l’IRT.",
              ],
              ["b00169", "b00171"],
            ),
            row(
              "Reperfusion",
              [
                "Optimiser le VCE et maintenir le plus souvent une PAM de 70–90 mmHg, avec petites doses de vasopresseur si besoin.",
                {
                  text: "Anticiper deux enjeux immédiats après déclampage.",
                  children: [
                    "Hyperkaliémie liée à la solution de conservation",
                    "Immunosuppresseurs et perfusion suffisante du greffon",
                  ],
                },
              ],
              ["b00172", "b00173", "b00174"],
            ),
            row(
              "Oligurie du greffon",
              [
                "Une diurèse précoce est rassurante, mais son absence ne prouve pas une hypovolémie.",
                "Avant de conclure au retard de fonction, échographie pour exclure hématome ou thrombose artérielle/veineuse.",
              ],
              ["b00175", "b00176"],
            ),
          ],
        },
      ],
    },
  ];
  const sourceBlocks = [
    ...new Set(
      parts.flatMap((p) =>
        p.sections.flatMap((s) => s.rows.flatMap((r) => r.sourceBlocks)),
      ),
    ),
  ];
  return {
    matiere: "Anesthésie-Réanimation",
    title: "Système rénal et anesthésie",
    year: "2025-2026",
    coverSubtitle:
      "Protéger le DFG, traiter les dysfonctions et anticiper la chirurgie urologique",
    imageOmissions: [],
    sourceBlocks,
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur"],
        rows: [
          ["Débit rénal", "20–25 % du DC"],
          ["Autorégulation PAM", "80–180 mmHg"],
          ["IRA créatinine", "+26,5 µmol/L/48 h ou +50 %/7 j"],
          ["IRA diurèse", "<0,5 mL/kg/h >6 h"],
          ["IRC", "DFG <60 mL/min >3 mois"],
          ["Succinylcholine", "K+ <5,5 mmol/L"],
          ["RTUP sévère", "Na <120 mmol/L"],
          ["Greffon : PAM", "70–90 mmHg"],
        ],
      },
      tables: [
        {
          title: "Décisions rapides",
          headers: ["Situation", "Conduite"],
          rows: [
            [
              "Oligurie peropératoire",
              "Mécanisme, VCE, PA, obstacle ; pas de remplissage aveugle",
            ],
            ["IRA", "Cause pré-, intra- ou postrénale et complications"],
            [
              "Hyperkaliémie",
              "Calcium, transfert intracellulaire, élimination",
            ],
            [
              "Dialysé électif",
              "Dialyse <24 h, K+, poids sec, fistule protégée",
            ],
            [
              "RTUP neurologique",
              "Arrêt irrigation, natrémie, NaCl 3 % si grave",
            ],
            ["Greffon oligurique", "Echo avant remplissage répété"],
          ],
        },
        {
          title: "Pièges",
          headers: ["Piège", "Réflexe"],
          rows: [
            [
              "Créatinine normale isolée",
              "Intégrer cinétique, masse musculaire et dilution",
            ],
            ["Diurèse comme cible unique", "Evaluer perfusion et obstruction"],
            [
              "Morphine ou mépéridine en IRC",
              "Préférer opioïde sans métabolite actif",
            ],
            [
              "Sugammadex si ClCr <30",
              "Eviter selon monographie et monitorer le bloc",
            ],
            ["NaCl 0,9 % par principe", "Considérer acidose hyperchlorémique"],
            [
              "Oligurie du greffon = hypovolémie",
              "Exclure thrombose et hématome",
            ],
          ],
        },
      ],
      keyPoints: [
        "Les reins reçoivent un fort débit mais la médulla reste très vulnérable à l’ischémie.",
        "VCE et pression, non la diurèse seule, guident la protection rénale.",
        "La créatinine est retardée et dépend de la masse musculaire et de la dilution.",
        "Une IRA impose une recherche prérénale, intrinsèque et obstructive.",
        "Les doses et les métabolites actifs doivent être revus en IRC.",
        "Dialyse urgente si complications réfractaires, non sur un seuil isolé de créatinine.",
        "Le syndrome RTUP associe absorption d’irrigation et hyponatrémie hypoosmolaire.",
        "Après transplantation, perfuser le greffon sans traiter aveuglément chaque oligurie.",
      ],
      eclair: [
        "DFG = perfusion glomérulaire + autorégulation afférente/efférente.",
        "PAM et VCE suffisants préviennent mieux l’IRA qu’un diurétique prophylactique.",
        "IRA : +26,5 µmol/L/48 h, +50 %/7 j ou DU <0,5 mL/kg/h >6 h.",
        "IRC : revoir chaque dose, métabolite et technique régionale.",
        "Dialysé : poids sec, K+, dernière dialyse et fistule protégée.",
        "RTUP : surveiller durée, irrigation, neurologie et natrémie.",
        "Greffon : PAM 70–90 mmHg, VCE optimisé, K+ anticipé.",
        "Oligurie isolée : vérifier mécanisme, perfusion et obstacle avant tout remplissage.",
      ],
    },
    imageException: {
      reason:
        "Le document source contient exactement six figures pédagogiquement utiles ; elles sont toutes intégrées sans ajout externe.",
    },
  };
}

const fc = (recto, verso, sourceBlocks) => ({
  recto,
  verso,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});
function buildFlashcards() {
  return [
    fc(
      "Quelles sont les trois grandes fonctions rénales ?",
      "Homéostasie hydrique-ionique, excrétion des déchets et fonctions endocrines.",
      ["b00006", "b00011"],
    ),
    fc(
      "Quelle hormone rénale stimule la production de globules rouges ?",
      "L’érythropoïétine, dont le déficit contribue à l’anémie de l’IRC.",
      "b00011",
    ),
    fc(
      "Quel métabolite rénal participe au métabolisme phosphocalcique ?",
      "Le calcitriol, forme active de la vitamine D.",
      "b00011",
    ),
    fc(
      "Où se trouvent la majorité des glomérules ?",
      "Dans le cortex rénal.",
      "b00014",
    ),
    fc(
      "Quelles structures dominent dans la médulla rénale ?",
      "Anses de Henlé, interstitium et tubules collecteurs.",
      "b00014",
    ),
    fc(
      "Quelle part du débit cardiaque reçoivent les reins ?",
      "Environ 20 à 25 % dans des conditions normales.",
      "b00019",
    ),
    fc(
      "Pourquoi la vascularisation rénale en série est-elle vulnérable ?",
      "Toute baisse de débit en amont retentit systématiquement sur les territoires d’aval.",
      "b00021",
    ),
    fc(
      "Quelle fraction du débit rénal atteint la médulla ?",
      "Environ 15 %, contre 85 % pour le cortex.",
      "b00021",
    ),
    fc(
      "Quel est le taux d’extraction d’oxygène médullaire ?",
      "Environ 79 %, expliquant une faible réserve face à l’ischémie.",
      "b00021",
    ),
    fc(
      "Combien de néphrons contient approximativement chaque rein ?",
      "Environ un million chez l’adulte.",
      "b00023",
    ),
    fc(
      "Quel volume de sang les néphrons filtrent-ils quotidiennement ?",
      "Plus de 1 700 L pour produire 1 à 2 L d’urine.",
      "b00023",
    ),
    fc(
      "Quelle pression favorise l’ultrafiltration glomérulaire ?",
      "La pression hydrostatique capillaire glomérulaire.",
      "b00025",
    ),
    fc(
      "Quelle force s’oppose à la filtration glomérulaire ?",
      "La pression oncotique des protéines plasmatiques.",
      "b00025",
    ),
    fc(
      "Quelles cellules modulent la surface filtrante glomérulaire ?",
      "Les cellules mésangiales par contraction ou relâchement.",
      "b00025",
    ),
    fc(
      "Comment réagit l’artériole afférente lorsque la perfusion baisse ?",
      "Elle se dilate sous l’effet des prostaglandines.",
      "b00026",
    ),
    fc(
      "Comment réagit l’artériole efférente lorsque la perfusion baisse ?",
      "Elle se contracte sous l’effet de l’angiotensine II.",
      "b00026",
    ),
    fc(
      "Dans quelle plage de PAM l’autorégulation rénale est-elle habituellement efficace ?",
      "Environ 80 à 180 mmHg chez un sujet sans déplacement de la courbe.",
      "b00026",
    ),
    fc(
      "Que provoque une PAM sous le seuil d’autorégulation ?",
      "Baisse de pression glomérulaire et du DFG, puis NTA si l’agression persiste.",
      "b00027",
    ),
    fc(
      "Pourquoi les AINS menacent-ils le DFG en hypovolémie ?",
      "Ils inhibent les prostaglandines nécessaires à la dilatation afférente.",
      "b00028",
    ),
    fc(
      "Pourquoi les IEC ou ARA2 exposent-ils à l’IRA fonctionnelle ?",
      "Ils diminuent la constriction efférente qui maintient la pression glomérulaire.",
      "b00028",
    ),
    fc(
      "Quelle proportion de l’ultrafiltrat est réabsorbée par les tubules ?",
      "Environ 99 %.",
      "b00030",
    ),
    fc(
      "Comment définir le volume circulant efficace ?",
      "La fraction du volume plasmatique contribuant à la perfusion tissulaire et à la PA.",
      "b00032",
    ),
    fc(
      "Quelle formule estime l’osmolarité plasmatique en mmol/L ?",
      "2 Na + glucose + urée.",
      ["b00032", "b00033"],
    ),
    fc(
      "Quels systèmes s’activent lorsque le VCE diminue ?",
      "Sympathique, rénine-angiotensine-aldostérone, ADH et soif.",
      "b00033",
    ),
    fc(
      "Où l’aldostérone augmente-t-elle la réabsorption sodée ?",
      "Au tubule collecteur.",
      "b00033",
    ),
    fc(
      "Quel est l’effet rénal principal de l’ADH ?",
      "Augmenter la perméabilité à l’eau du tubule collecteur.",
      "b00033",
    ),
    fc(
      "Pourquoi une baisse du VCE peut-elle causer une hyponatrémie ?",
      "L’ADH retient préférentiellement l’eau afin de soutenir la circulation.",
      "b00033",
    ),
    fc(
      "Quels sont les volumes intra- et extracellulaires d’un adulte de 70 kg ?",
      "Environ 28 L intracellulaires et 14 L extracellulaires.",
      "b00036",
    ),
    fc(
      "Quel volume plasmatique contient approximativement un adulte de 70 kg ?",
      "Environ 4 à 5 L.",
      "b00036",
    ),
    fc(
      "Pourquoi un cristalloïde crée-t-il facilement un œdème interstitiel ?",
      "La majeure partie diffuse rapidement hors du compartiment intravasculaire.",
      "b00039",
    ),
    fc(
      "Pourquoi le DFG est-il utile avant une anesthésie ?",
      "Il quantifie la dysfonction et permet d’ajuster les doses de médicaments.",
      ["b00041", "b00042"],
    ),
    fc(
      "Quel marqueur sanguin estime couramment la fonction rénale ?",
      "La créatinine sérique.",
      ["b00043", "b00044"],
    ),
    fc(
      "Quel facteur correctif de Cockcroft-Gault utiliser chez la femme ?",
      "k = 0,85, contre 1 chez l’homme.",
      ["b00045", "b00047"],
    ),
    fc(
      "Quand une formule fondée sur la créatinine devient-elle peu fiable ?",
      "Lorsque la fonction rénale n’est pas stable.",
      "b00048",
    ),
    fc(
      "Quels facteurs non rénaux modifient la créatininémie ?",
      "Age, sexe, musculature, alimentation, maladie chronique et dilution.",
      "b00049",
    ),
    fc(
      "A partir de quelle baisse du DFG la créatinine augmente-t-elle souvent ?",
      "Après une diminution proche de 50 %, ce qui en fait un marqueur tardif.",
      "b00049",
    ),
    fc(
      "Quels facteurs augmentent l’excrétion urinaire du potassium ?",
      "Kaliémie, débit tubulaire, aldostérone et charges négatives luminales élevés.",
      "b00051",
    ),
    fc(
      "Quelles fonctions rénales préviennent l’acidose ?",
      "Réabsorption du bicarbonate et excrétion des acides non volatils.",
      ["b00053", "b00055"],
    ),
    fc(
      "Quelle pression dans les voies hautes peut faire chuter le DFG ?",
      "Une pression supérieure à environ 15 mmHg.",
      "b00058",
    ),
    fc(
      "Quel volume peut contenir une vessie adulte normale ?",
      "Environ 300 à 700 mL.",
      "b00059",
    ),
    fc(
      "Quels segments médullaires commandent la vidange parasympathique ?",
      "S2 à S4, par contraction du détrusor.",
      "b00061",
    ),
    fc(
      "Quel effet rénal transitoire est fréquent sous anesthésie ?",
      "Une diminution réversible du débit rénal, du DFG et de la diurèse.",
      "b00065",
    ),
    fc(
      "Quels mécanismes indirects expliquent l’oligurie anesthésique ?",
      "Baisse de DC ou PA, vasodilatation, sympathique et réponses endocrines.",
      "b00066",
    ),
    fc(
      "Quelle mesure hémodynamique diminue le risque d’IRA périopératoire ?",
      "Maintenir un VCE et une pression artérielle suffisants.",
      ["b00067", "b00068"],
    ),
    fc(
      "La néphrotoxicité clinique du sévoflurane est-elle prouvée ?",
      "Non, les signaux animaux n’ont pas été confirmés cliniquement.",
      "b00069",
    ),
    fc(
      "Quels anesthésiques ont peu d’effet direct sur le rein ?",
      "Le propofol et les opioïdes ont un effet mineur ou nul.",
      "b00070",
    ),
    fc(
      "Pourquoi les agents volatils conviennent-ils en insuffisance rénale ?",
      "Leur élimination est principalement pulmonaire et non rénale.",
      "b00074",
    ),
    fc(
      "Quels hypnotiques IV sont peu modifiés par l’IRC ?",
      "Propofol, barbituriques et étomidate.",
      "b00076",
    ),
    fc(
      "Pourquoi titrer prudemment le midazolam en IRC ?",
      "Hypoalbuminémie et accumulation de métabolites actifs prolongent son effet.",
      "b00078",
    ),
    fc(
      "Quel métabolite de la morphine s’accumule lorsque la clairance est basse ?",
      "La morphine-6-glucuronide, responsable de dépression respiratoire.",
      "b00079",
    ),
    fc(
      "Pourquoi faut-il éviter la mépéridine en IRC ?",
      "La normépéridine s’accumule et peut provoquer myoclonies, confusion ou convulsions.",
      "b00079",
    ),
    fc(
      "Quels opioïdes ne produisent pas de métabolites actifs rénaux ?",
      "Fentanyl et sufentanil ; le rémifentanil est hydrolysé rapidement dans le sang.",
      "b00079",
    ),
    fc(
      "Sous quel seuil de kaliémie la succinylcholine est-elle utilisable en IRC ?",
      "Sous 5,5 mmol/L au moment de l’induction.",
      "b00080",
    ),
    fc(
      "Quel curare a le métabolisme le plus prévisible en IRC ?",
      "Le cisatracurium, dégradé par élimination de Hofmann.",
      "b00080",
    ),
    fc(
      "Pourquoi monitorer le rocuronium en insuffisance rénale sévère ?",
      "Jusqu’à 40 % sont éliminés dans l’urine et l’effet peut se prolonger.",
      "b00080",
    ),
    fc(
      "Quand le sugammadex n’est-il pas recommandé ?",
      "Si la clairance est inférieure à 30 mL/min ou chez le patient dialysé.",
      "b00081",
    ),
    fc(
      "Pourquoi les anticholinestérasiques durent-ils plus longtemps en IRC ?",
      "Edrophonium, néostigmine et pyridostigmine sont surtout éliminés par le rein.",
      "b00082",
    ),
    fc(
      "Quel réflexe médicamenteux appliquer devant toute IRC ?",
      "Réviser l’ensemble des prescriptions, notamment antibiotiques et métabolites actifs.",
      "b00084",
    ),
    fc(
      "Pourquoi le pneumopéritoine provoque-t-il une oligurie ?",
      "Compression rénale et veineuse, baisse du DC et réponse endocrine.",
      "b00086",
    ),
    fc(
      "Quels gestes augmentent particulièrement le risque d’IRA ?",
      "CEC, clampage aortique, dissection près des artères rénales et chirurgie majeure.",
      "b00086",
    ),
    fc(
      "Quels sont les trois critères diagnostiques d’IRA ?",
      "Créatinine +26,5 µmol/L/48 h, +50 %/7 j ou DU <0,5 mL/kg/h >6 h.",
      "b00089",
    ),
    fc(
      "Quelles sont les trois catégories d’IRA ?",
      "Prérénale, intrinsèque rénale et postrénale obstructive.",
      "b00090",
    ),
    fc(
      "Quelle proportion des IRA est prérénale ?",
      "Environ 30 à 60 %.",
      "b00090",
    ),
    fc(
      "Comment exclure rapidement une cause postrénale ?",
      "Sonde urinaire et/ou imagerie adaptée, notamment échographie.",
      "b00090",
    ),
    fc(
      "Quand apparaît habituellement l’IRA postopératoire ?",
      "Dans les 48 à 72 heures suivant l’intervention.",
      "b00094",
    ),
    fc(
      "Quel est le mécanisme habituel de l’IRA postopératoire ?",
      "La sommation de plusieurs facteurs de terrain et agressions acquises.",
      "b00094",
    ),
    fc(
      "Quels terrains augmentent le risque d’IRA postopératoire ?",
      "Age, diabète, IRC, HTA, insuffisance cardiaque ou hépatique.",
      ["b00094", "b00103"],
    ),
    fc(
      "Quels facteurs peropératoires favorisent l’IRA ?",
      "Urgence, chirurgie majeure, clampage, transfusion, choc et vasopresseurs.",
      ["b00094", "b00103"],
    ),
    fc(
      "Quel objectif hémodynamique prévient le mieux l’IRA ?",
      "Maintenir le VCE et la PA dans la zone d’autorégulation du patient.",
      "b00095",
    ),
    fc(
      "Existe-t-il un médicament préventif prouvé contre l’IRA postopératoire ?",
      "Non, aucune molécule n’a montré d’efficacité concluante.",
      "b00096",
    ),
    fc(
      "Quels colloïdes faut-il éviter chez le patient critique à risque rénal ?",
      "Les colloïdes de synthèse.",
      "b00096",
    ),
    fc(
      "L’acétylcystéine prévient-elle encore la néphropathie au contraste ?",
      "Non, elle n’est plus recommandée comme prévention.",
      "b00098",
    ),
    fc(
      "Quelle précaution prendre si un contraste iodé est indispensable ?",
      "Informer le radiologiste, limiter la dose et appliquer une hydratation IV adaptée.",
      "b00098",
    ),
    fc(
      "Quel facteur technique du clampage aortique réduit le risque rénal ?",
      "Raccourcir sa durée, surtout si le clamp est suprarénal.",
      "b00099",
    ),
    fc(
      "Quelles complications de l’IRA peuvent imposer une dialyse ?",
      "Anurie, K+ ou acidose réfractaires, surcharge, urémie compliquée ou intoxication.",
      ["b00107", "b00109"],
    ),
    fc(
      "Un seuil isolé de créatinine indique-t-il une dialyse urgente ?",
      "Non, la suppléance dépend surtout des complications réfractaires.",
      "b00107",
    ),
    fc(
      "Quel site de cathéter de dialyse est préféré en premier ?",
      "La veine jugulaire interne droite.",
      "b00108",
    ),
    fc(
      "Quel site veineux faut-il préserver pour une future fistule ?",
      "Le membre supérieur non dominant et, si possible, sa veine sous-clavière.",
      "b00108",
    ),
    fc(
      "Comment définir une insuffisance rénale chronique ?",
      "Atteinte >3 mois, DFG <60 mL/min et/ou marqueur rénal persistant.",
      "b00113",
    ),
    fc(
      "Quels axes composent la classification de l’IRC ?",
      "Cause, catégorie de DFG et catégorie d’albuminurie.",
      ["b00113", "b00114"],
    ),
    fc(
      "Quelles sont les trois causes principales d’IRC ?",
      "Diabète 45 %, HTA 27 % et glomérulonéphrites 8 %.",
      "b00116",
    ),
    fc(
      "Quelle relation unit IRA et IRC ?",
      "L’IRC favorise l’IRA et une IRA augmente le risque ultérieur d’IRC.",
      "b00117",
    ),
    fc(
      "Quel avis doit être récent avant chirurgie chez un patient IRC ?",
      "Celui du néphrologue, confirmant stabilité et traitements optimisés.",
      ["b00119", "b00120"],
    ),
    fc(
      "Quand programmer idéalement une chirurgie élective chez un dialysé ?",
      "Dans les 24 heures suivant une dialyse, avec K+ et poids sec contrôlés.",
      "b00124",
    ),
    fc(
      "Comment protéger une fistule artérioveineuse au bloc ?",
      "Aucun brassard, ponction, garrot ou compression sur le membre concerné.",
      "b00124",
    ),
    fc(
      "Pourquoi préférer parfois un soluté balancé en IRC ?",
      "Le NaCl 0,9 % peut provoquer une acidose hyperchlorémique et augmenter le K+ indirectement.",
      "b00122",
    ),
    fc(
      "Quand un vasopresseur est-il approprié pour soutenir la perfusion rénale ?",
      "Lorsque le VCE est satisfaisant mais que la PA reste sous la cible.",
      "b00123",
    ),
    fc(
      "Pourquoi les accès veineux centraux peuvent-ils être difficiles en IRT ?",
      "Les cathéters antérieurs favorisent thromboses et anomalies du réseau veineux.",
      "b00128",
    ),
    fc(
      "Quel prérequis rechercher avant une anesthésie régionale en IRT ?",
      "Une hémostase compatible, car une coagulopathie peut être présente.",
      "b00129",
    ),
    fc(
      "Quel avantage offre un bloc brachial lors d’une création de fistule ?",
      "La sympathectomie régionale peut augmenter le débit sanguin de la fistule.",
      "b00131",
    ),
    fc(
      "Quelle solution irrigue le plus souvent une RTUP monopolaire ?",
      "La glycine 1,5 %, légèrement hypotonique et non électrolytique.",
      "b00134",
    ),
    fc(
      "Quel niveau sensitif minimal faut-il pour une résection transurétrale ?",
      "T10.",
      "b00134",
    ),
    fc(
      "Quels facteurs augmentent l’absorption lors d’une RTUP ?",
      "Durée >1 h, hauteur du sac élevée, forte pression et nombreux sacs.",
      "b00139",
    ),
    fc(
      "Quelle natrémie caractérise un syndrome RTUP sévère ?",
      "Une hyponatrémie hypoosmolaire souvent inférieure à 120 mmol/L.",
      "b00139",
    ),
    fc(
      "Quels signes neurologiques évoquent un syndrome RTUP ?",
      "Céphalées, agitation, confusion, convulsions ou coma.",
      "b00139",
    ),
    fc(
      "Quand utiliser du NaCl 3 % dans un syndrome RTUP ?",
      "En cas de convulsions ou coma, jusqu’à amélioration ou Na ≥125 mmol/L.",
      "b00139",
    ),
    fc(
      "Quelle toxicité rare peut provoquer la glycine absorbée ?",
      "Une cécité transitoire par effet inhibiteur sur le SNC.",
      "b00139",
    ),
    fc(
      "Pourquoi les pertes sanguines sont-elles sous-estimées pendant une RTUP ?",
      "Le sang est dilué dans la grande quantité de liquide d’irrigation.",
      "b00140",
    ),
    fc(
      "Quel signe suggère une perforation vésicale pendant une RTU-TV ?",
      "Un retour d’irrigation insuffisant avec douleur rétropubienne ou instabilité.",
      "b00143",
    ),
    fc(
      "Pourquoi une tumeur vésicale latérale change-t-elle l’anesthésie ?",
      "L’électrocautère peut stimuler l’obturateur et provoquer une adduction brutale.",
      "b00144",
    ),
    fc(
      "Quelle anesthésie privilégier pour une tumeur vésicale latérale ?",
      "Une anesthésie générale avec bloc neuromusculaire efficace.",
      "b00144",
    ),
    fc(
      "Quel niveau sensitif faut-il pour une procédure urétérale ?",
      "T6.",
      "b00146",
    ),
    fc(
      "Comment drainer un sepsis sur calcul obstructif ?",
      "Sonde double J urgente ou néphrostomie percutanée selon dilatation et coagulation.",
      "b00148",
    ),
    fc(
      "Quels risques crée un Trendelenburg robotique supérieur à 30 degrés ?",
      "Oedèmes facial et laryngé, hausse PIO/PIC et risque de compartiment.",
      "b00152",
    ),
    fc(
      "Quel thrombus complique 5 à 10 % des tumeurs rénales ?",
      "Une extension dans la veine rénale et/ou la VCI, parfois jusqu’à l’oreillette droite.",
      "b00156",
    ),
    fc(
      "Quels moyens anticiper pour une tumeur rénale très vascularisée ?",
      "Accès veineux fiables, pression invasive et disponibilité de produits sanguins.",
      "b00157",
    ),
    fc(
      "Quel objectif rénal suit une néphrectomie ?",
      "Prévenir toute agression du rein restant et ajuster les traitements au nouveau DFG.",
      "b00159",
    ),
    fc(
      "Quelle durée et quel saignement caractérisent souvent une cystectomie ?",
      "Plus de 6 heures et parfois plus de 1 000 mL de pertes.",
      ["b00161", "b00162"],
    ),
    fc(
      "Quels troubles provoque une dérivation urinaire digestive ?",
      "Troubles Na/Cl/K et acidose métabolique par contact prolongé urine-muqueuse.",
      "b00165",
    ),
    fc(
      "Quel avantage principal offre la transplantation face à la dialyse ?",
      "Elle améliore qualité de vie et survie et réduit les coûts chez la plupart des patients.",
      "b00167",
    ),
    fc(
      "Quelles origines de greffon rénal sont possibles ?",
      "Donneur vivant, après décès cardiocirculatoire ou après décès neurologique.",
      "b00168",
    ),
    fc(
      "Quelle PAM viser habituellement lors de la reperfusion d’un greffon ?",
      "Environ 70 à 90 mmHg, avec VCE optimisé.",
      "b00172",
    ),
    fc(
      "Quel trouble ionique anticiper après déclampage du greffon ?",
      "Une hyperkaliémie issue de la solution de conservation.",
      ["b00173", "b00174"],
    ),
    fc(
      "Une oligurie précoce du greffon prouve-t-elle une hypovolémie ?",
      "Non, elle peut traduire un retard de fonction ou une complication vasculaire.",
      "b00175",
    ),
    fc(
      "Quel examen demander devant une oligurie du greffon ?",
      "Une échographie pour rechercher hématome ou thrombose artérielle/veineuse.",
      "b00175",
    ),
  ];
}

const T = (enonce, justification) => ({
    enonce,
    is_correct: true,
    justification,
  }),
  F = (enonce, justification) => ({ enonce, is_correct: false, justification });
const qcm = (
  enonce,
  sourceBlocks,
  correction_generale,
  items,
  newInformation = null,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qcm",
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  items: items.map((x, i) => ({ ...x, lettre: "ABCDE"[i] })),
  ...(newInformation ? { newInformation } : {}),
});
const ISOLATED_QCM = [
  {
    title: "Physiologie et perfusion",
    questions: [
      qcm(
        "Quels rôles appartiennent directement au système rénal ?",
        ["b00006", "b00011"],
        "Le rein associe homéostasie du milieu intérieur, épuration et fonctions endocrines indispensables.",
        [
          T(
            "Ajuster l’excrétion d’eau et d’électrolytes.",
            "Cette régulation maintient volume, osmolarité et composition du milieu intérieur.",
          ),
          F(
            "Assurer seul l’élimination du dioxyde de carbone.",
            "Les poumons constituent l’organe principal d’élimination du CO2 volatil.",
          ),
          T(
            "Eliminer l’urée et certains médicaments.",
            "La filtration et la sécrétion participent à l’épuration endogène et exogène.",
          ),
          T(
            "Produire de l’érythropoïétine.",
            "Cette hormone rénale soutient la production médullaire des globules rouges.",
          ),
          T(
            "Participer au métabolisme phosphocalcique.",
            "La formation de calcitriol contribue à l’homéostasie osseuse et minérale.",
          ),
        ],
      ),
      qcm(
        "Quels éléments expliquent la vulnérabilité ischémique de la médulla ?",
        "b00021",
        "La médulla reçoit peu de débit tout en extrayant beaucoup d’oxygène dans un réseau disposé en série.",
        [
          T(
            "Elle ne reçoit qu’environ 15 % du débit rénal.",
            "Le cortex capte l’essentiel du flux, laissant une faible réserve médullaire.",
          ),
          F(
            "Elle reçoit 85 % du débit rénal.",
            "Cette proportion concerne le cortex et non le compartiment médullaire.",
          ),
          T(
            "Son extraction d’oxygène approche 79 %.",
            "Une extraction déjà élevée limite l’adaptation à une nouvelle baisse d’apport.",
          ),
          F(
            "Elle n’a aucun besoin énergétique pour les transports tubulaires.",
            "Les transports actifs imposent au contraire une consommation d’oxygène importante.",
          ),
          T(
            "La circulation rénale est distribuée en série.",
            "Une diminution en amont transmet ses conséquences aux territoires plus distaux.",
          ),
        ],
      ),
      qcm(
        "Comment le glomérule maintient-il la filtration lorsque la perfusion baisse ?",
        ["b00025", "b00026"],
        "L’autorégulation associe dilatation afférente par prostaglandines et constriction efférente par angiotensine II.",
        [
          F(
            "L’artériole efférente se dilate fortement.",
            "Une dilatation efférente ferait chuter la pression hydrostatique de filtration.",
          ),
          T(
            "L’artériole afférente se dilate.",
            "Cette réponse diminue la résistance d’entrée et soutient le flux glomérulaire.",
          ),
          T(
            "Les prostaglandines participent à la réponse afférente.",
            "Leur effet vasodilatateur protège la pression capillaire en hypoperfusion.",
          ),
          F(
            "La pression oncotique disparaît complètement.",
            "Les protéines plasmatiques continuent de s’opposer au mouvement d’eau filtrée.",
          ),
          T(
            "L’angiotensine II contracte l’artériole efférente.",
            "Cette vasoconstriction d’aval aide à conserver la pression glomérulaire.",
          ),
        ],
      ),
      qcm(
        "Quels effets des médicaments compromettent l’autorégulation rénale ?",
        "b00028",
        "AINS et blocage du SRAA retirent les adaptations artériolaires protectrices, surtout en hypovolémie.",
        [
          F(
            "Les AINS dilatent systématiquement l’artériole afférente.",
            "Ils bloquent au contraire la voie vasodilatatrice dépendante des prostaglandines.",
          ),
          T(
            "Les AINS inhibent la production de prostaglandines.",
            "La dilatation afférente devient insuffisante lorsque la perfusion rénale diminue.",
          ),
          F(
            "Le risque est indépendant du volume circulant.",
            "L’hypovolémie amplifie fortement l’effet de ces médicaments sur le DFG.",
          ),
          T(
            "Les IEC diminuent la constriction efférente.",
            "Le gradient hydrostatique glomérulaire peut alors chuter en situation de bas débit.",
          ),
          T(
            "Les ARA2 exposent au même mécanisme fonctionnel.",
            "Le blocage du récepteur de l’angiotensine empêche la compensation efférente.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations décrivent le volume circulant efficace ?",
        ["b00032", "b00033"],
        "Le VCE correspond au volume plasmatique fonctionnel et sa baisse active des systèmes de rétention hydrosodée.",
        [
          F(
            "Il est toujours identique au volume extracellulaire total.",
            "Une grande partie du liquide extracellulaire est interstitielle et non circulante.",
          ),
          T(
            "Il contribue à la perfusion tissulaire.",
            "Sa définition est fonctionnelle et repose sur le volume participant réellement à la circulation.",
          ),
          T(
            "Sa baisse stimule le système sympathique.",
            "Les barorécepteurs déclenchent une réponse adrénergique de conservation.",
          ),
          T(
            "Sa baisse active le système rénine-angiotensine.",
            "La diminution de perfusion rénale augmente la sécrétion de rénine.",
          ),
          T(
            "Sa baisse peut stimuler l’ADH malgré une hypoosmolarité.",
            "La priorité circulatoire peut l’emporter sur la régulation osmolaire.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Eau, ions et évaluation",
    questions: [
      qcm(
        "Quelles conséquences suivent une activation d’ADH ?",
        "b00033",
        "L’ADH augmente la perméabilité du collecteur à l’eau, concentre l’urine et peut diluer le sodium.",
        [
          T(
            "La réabsorption d’eau augmente au tubule collecteur.",
            "Les aquaporines permettent le retour de l’eau vers le compartiment vasculaire.",
          ),
          T(
            "La diurèse d’eau libre diminue.",
            "Une plus grande fraction de l’eau filtrée est conservée par l’organisme.",
          ),
          F(
            "L’osmolarité urinaire diminue toujours.",
            "L’urine devient généralement plus concentrée sous l’action de l’ADH.",
          ),
          T(
            "Une hyponatrémie de dilution peut apparaître.",
            "La rétention d’eau disproportionnée par rapport au sodium abaisse la natrémie.",
          ),
          F(
            "La sécrétion d’ADH ne dépend que du sodium.",
            "L’osmolarité et le volume circulant efficace régulent tous deux sa libération.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs rendent la créatininémie imparfaite pour estimer le DFG ?",
        "b00049",
        "La créatinine dépend de la production musculaire, de la dilution et augmente tardivement après une perte de DFG.",
        [
          T(
            "Une faible masse musculaire peut masquer une dysfonction.",
            "Une production réduite maintient une valeur basse malgré une filtration altérée.",
          ),
          F(
            "Elle est totalement indépendante de l’âge.",
            "La masse musculaire et la production de créatinine diminuent souvent avec l’âge.",
          ),
          T(
            "Une expansion hydrique peut diluer la concentration.",
            "L’augmentation d’eau corporelle fait sous-estimer la gravité de l’atteinte.",
          ),
          T(
            "La hausse est souvent retardée.",
            "La créatinine peut rester peu modifiée avant une baisse importante du DFG.",
          ),
          F(
            "Elle mesure directement la perfusion médullaire.",
            "Elle reflète indirectement la filtration globale et non un territoire particulier.",
          ),
        ],
      ),
      qcm(
        "Quelles conditions sont nécessaires pour interpréter Cockcroft-Gault ?",
        ["b00044", "b00045", "b00047", "b00048"],
        "La formule combine âge, poids, sexe et créatinine mais suppose une fonction rénale stable.",
        [
          T(
            "Connaître l’âge du patient.",
            "Le terme 140 moins l’âge intervient directement dans le calcul de clairance.",
          ),
          T(
            "Disposer d’un poids pertinent.",
            "Le poids est un multiplicateur de la formule et exige une interprétation clinique.",
          ),
          T(
            "Appliquer un coefficient lié au sexe.",
            "Le coefficient indiqué est 1 chez l’homme et 0,85 chez la femme.",
          ),
          F(
            "L’utiliser sans réserve pendant une IRA rapidement progressive.",
            "La créatinine non stable invalide l’équilibre supposé par la formule.",
          ),
          T(
            "Vérifier les unités de créatininémie.",
            "Une unité inadéquate produit une estimation numérique totalement erronée.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs modulent l’excrétion urinaire de potassium ?",
        "b00051",
        "Kaliémie, pH, débit tubulaire, aldostérone et charges luminales régulent la kaliurèse.",
        [
          T(
            "La concentration plasmatique de potassium.",
            "Une kaliémie plus forte stimule normalement l’élimination rénale.",
          ),
          T(
            "Le débit de liquide dans le tubule distal.",
            "Un débit suffisant facilite la sécrétion et l’évacuation du potassium.",
          ),
          T(
            "La quantité d’aldostérone.",
            "Cette hormone augmente la réabsorption sodée et la sécrétion potassique.",
          ),
          T(
            "Le pH sanguin.",
            "Les variations acido-basiques modifient les échanges cellulaires et l’excrétion rénale.",
          ),
          F(
            "La couleur de l’urine comme seul déterminant.",
            "Cet aspect macroscopique ne commande pas la sécrétion tubulaire du potassium.",
          ),
        ],
      ),
      qcm(
        "Quels mécanismes rénaux corrigent une charge acide ?",
        ["b00053", "b00055"],
        "Le rein conserve le bicarbonate et excrète les protons avec l’ammonium et les acides titrables.",
        [
          T(
            "Réabsorber le bicarbonate filtré.",
            "Le tubule proximal assure la majeure partie de cette conservation alcaline.",
          ),
          T(
            "Augmenter l’excrétion d’ammonium.",
            "Le NH4+ permet d’éliminer des protons sans abaisser excessivement le pH urinaire.",
          ),
          T(
            "Utiliser les phosphates comme acides titrables.",
            "Les tampons urinaires lient les ions hydrogène destinés à l’excrétion.",
          ),
          F(
            "Eliminer les acides non volatils uniquement par les poumons.",
            "La ventilation traite le CO2 mais le rein excrète la charge acide fixe.",
          ),
          F(
            "Excréter tout le bicarbonate en situation d’acidose.",
            "La compensation exige au contraire une réabsorption accrue du bicarbonate.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Pharmacologie en insuffisance rénale",
    questions: [
      qcm(
        "Quels agents ont une pharmacocinétique relativement prévisible en IRC ?",
        ["b00074", "b00076", "b00079", "b00080"],
        "Les agents pulmonaires, certaines molécules IV et les médicaments sans métabolite rénal actif sont privilégiés.",
        [
          T(
            "Les anesthésiques volatils modernes.",
            "Leur élimination pulmonaire dépend peu du DFG résiduel.",
          ),
          T(
            "Le propofol en dose titrée.",
            "Sa pharmacocinétique est minimalement modifiée par l’atteinte rénale.",
          ),
          T(
            "Le rémifentanil.",
            "Son hydrolyse rapide par les estérases sanguines évite un métabolite actif accumulé.",
          ),
          T(
            "Le cisatracurium.",
            "L’élimination de Hofmann rend son comportement plus prédictible.",
          ),
          F(
            "La mépéridine répétée.",
            "Son métabolite neurotoxique s’accumule lorsque l’élimination rénale diminue.",
          ),
        ],
      ),
      qcm(
        "Quels risques sont associés aux opioïdes en IRC sévère ?",
        "b00079",
        "Le choix dépend des métabolites : M6G et normépéridine imposent d’éviter morphine et mépéridine répétées.",
        [
          T(
            "La morphine peut provoquer une dépression respiratoire prolongée.",
            "La morphine-6-glucuronide active s’accumule lorsque la clairance est basse.",
          ),
          T(
            "La mépéridine peut provoquer des convulsions.",
            "La normépéridine est un métabolite neuroexcitant dépendant du rein.",
          ),
          T(
            "L’hydromorphone reste à titrer prudemment.",
            "Son métabolite H3G peut aussi provoquer des effets neuroexcitateurs.",
          ),
          F(
            "Le fentanyl forme un métabolite rénal actif majeur.",
            "Il ne produit pas le même type de métabolite actif que la morphine.",
          ),
          F(
            "Le rémifentanil est exclusivement éliminé par filtration glomérulaire.",
            "Il est rapidement hydrolysé dans le sang par des estérases non spécifiques.",
          ),
        ],
      ),
      qcm(
        "Quels principes concernent les benzodiazépines en IRC ?",
        "b00078",
        "Métabolites actifs et diminution de liaison protéique peuvent prolonger et intensifier la sédation.",
        [
          T(
            "Le midazolam doit être titré avec prudence.",
            "Des métabolites conjugués peuvent persister lorsque la fonction rénale est altérée.",
          ),
          T(
            "L’hypoalbuminémie peut augmenter la fraction libre.",
            "Une liaison protéique moindre accroît l’effet pharmacologique initial.",
          ),
          F(
            "La durée d’effet est toujours raccourcie.",
            "L’accumulation des métabolites tend plutôt à prolonger la sédation.",
          ),
          T(
            "Le diazépam peut accumuler des métabolites actifs.",
            "Son métabolisme hépatique ne supprime pas la dépendance rénale des produits conjugués.",
          ),
          F(
            "Aucune surveillance respiratoire n’est nécessaire.",
            "Une sensibilité accrue expose à une hypoventilation et impose une observation clinique.",
          ),
        ],
      ),
      qcm(
        "Comment gérer les curares chez un patient insuffisant rénal ?",
        ["b00080", "b00081"],
        "Le monitorage neuromusculaire guide le choix et la dose ; cisatracurium est prévisible et le sugammadex pose un problème d’élimination.",
        [
          T(
            "Vérifier le potassium avant succinylcholine.",
            "La molécule est considérée utilisable si la kaliémie est inférieure à 5,5 mmol/L.",
          ),
          T(
            "Monitorer le rocuronium quantitativement.",
            "Son effet peut être prolongé en atteinte rénale sévère.",
          ),
          T(
            "Privilégier le cisatracurium lorsque la prévisibilité est essentielle.",
            "Sa dégradation de Hofmann dépend peu de la filtration glomérulaire.",
          ),
          F(
            "Utiliser le sugammadex sans réserve chez le dialysé.",
            "La monographie ne le recommande pas lorsque la clairance est inférieure à 30 mL/min.",
          ),
          T(
            "Contrôler la récupération avant extubation.",
            "La prolongation du bloc expose à une faiblesse respiratoire résiduelle.",
          ),
        ],
      ),
      qcm(
        "Quels réflexes s’appliquent aux traitements non anesthésiques ?",
        ["b00072", "b00084"],
        "Toute la pharmacopée doit être revue selon DFG, liaison protéique, métabolites et dialysabilité.",
        [
          T(
            "Ajuster les antibiotiques dépendants du rein.",
            "Une dose non adaptée augmente la toxicité ou compromet l’efficacité anti-infectieuse.",
          ),
          T(
            "Identifier les métabolites actifs à élimination urinaire.",
            "Un métabolite peut s’accumuler même si la molécule mère est métabolisée par le foie.",
          ),
          T(
            "Considérer l’hypoalbuminémie.",
            "La hausse de fraction libre peut augmenter l’effet d’une molécule fortement liée.",
          ),
          F(
            "Conserver toutes les doses habituelles quel que soit le DFG.",
            "La baisse de clairance impose des adaptations de dose ou d’intervalle pour plusieurs agents.",
          ),
          F(
            "Limiter la revue aux médicaments administrés au bloc.",
            "Les prescriptions chroniques et postopératoires participent aussi au risque cumulé.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Insuffisance rénale aiguë",
    questions: [
      qcm(
        "Quels critères permettent de diagnostiquer une IRA ?",
        "b00089",
        "KDIGO retient une variation rapide de créatinine ou une oligurie pondérale prolongée.",
        [
          T(
            "Hausse de créatinine supérieure à 26,5 µmol/L en 48 heures.",
            "Cette variation absolue rapide constitue l’un des critères diagnostiques.",
          ),
          T(
            "Augmentation de créatinine d’au moins 50 % en sept jours.",
            "Le critère relatif détecte une dégradation significative sur une semaine.",
          ),
          T(
            "Diurèse inférieure à 0,5 mL/kg/h pendant plus de six heures.",
            "Une oligurie pondérale prolongée suffit à répondre au critère urinaire.",
          ),
          F(
            "Créatinine stable pendant un mois.",
            "L’absence de variation aiguë ne répond pas aux critères temporels de l’IRA.",
          ),
          F(
            "Diurèse de 2 mL/kg/h isolée.",
            "Cette diurèse est supérieure au seuil d’oligurie diagnostique.",
          ),
        ],
      ),
      qcm(
        "Quelles étapes sont prioritaires après le diagnostic d’IRA ?",
        "b00090",
        "L’évaluation recherche le mécanisme, corrige l’hypoperfusion et exclut rapidement une obstruction.",
        [
          T(
            "Rechercher une cause prérénale.",
            "Hypovolémie, vasoplégie ou bas débit constituent des causes rapidement réversibles.",
          ),
          T(
            "Evaluer une atteinte intrinsèque du parenchyme.",
            "Une NTA, inflammation ou toxicité peut expliquer une persistance après correction du débit.",
          ),
          T(
            "Exclure un obstacle sur les voies urinaires.",
            "Sonde et imagerie peuvent identifier une cause postrénale nécessitant un drainage.",
          ),
          F(
            "Administrer plusieurs litres sans examen clinique.",
            "Un remplissage aveugle expose à la surcharge si le VCE est déjà suffisant.",
          ),
          T(
            "Traiter rapidement les complications ioniques.",
            "Hyperkaliémie et acidose graves menacent le pronostic avant même le diagnostic étiologique complet.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs favorisent une IRA postopératoire ?",
        ["b00094", "b00103"],
        "Le risque est cumulatif et associe terrain fragile, agressions préopératoires et événements peropératoires.",
        [
          T(
            "Une insuffisance rénale chronique préexistante.",
            "La faible réserve fonctionnelle augmente la sensibilité à toute nouvelle agression.",
          ),
          T(
            "Une hypovolémie avant l’intervention.",
            "La diminution du VCE compromet la perfusion et l’autorégulation glomérulaire.",
          ),
          T(
            "Un clampage aortique prolongé.",
            "La réduction du débit rénal est plus importante, surtout au-dessus des artères rénales.",
          ),
          T(
            "Une transfusion massive ou une rhabdomyolyse.",
            "Ces situations ajoutent hémolyse, pigments et instabilité au risque rénal.",
          ),
          F(
            "Une chirurgie mineure sans variation hémodynamique.",
            "Ce contexte isolé n’appartient pas aux principaux facteurs de haut risque.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures préviennent raisonnablement l’IRA postopératoire ?",
        ["b00095", "b00096", "b00098"],
        "La prévention repose sur l’optimisation des facteurs modifiables et non sur un médicament protecteur spécifique.",
        [
          T(
            "Restaurer une créatinine proche du niveau basal avant un geste électif.",
            "Traiter une atteinte active avant la chirurgie augmente la réserve disponible.",
          ),
          T(
            "Maintenir un VCE suffisant sans surcharge.",
            "Une perfusion adéquate protège le glomérule et la médulla.",
          ),
          T(
            "Conserver une pression compatible avec l’autorégulation.",
            "Un vasopresseur peut être utile après correction de l’hypovolémie.",
          ),
          F(
            "Prescrire systématiquement de l’acétylcystéine.",
            "Cette molécule n’est plus recommandée pour prévenir l’atteinte au contraste.",
          ),
          F(
            "Utiliser un colloïde de synthèse chez tout patient critique.",
            "Ces solutions sont à éviter en raison de leur association aux complications rénales.",
          ),
        ],
      ),
      qcm(
        "Quelles situations justifient une suppléance rénale urgente ?",
        ["b00107", "b00109"],
        "La dialyse devient nécessaire lorsque les complications vitales résistent aux mesures médicales appropriées.",
        [
          T(
            "Hyperkaliémie sévère réfractaire.",
            "L’élimination extracorporelle retire le potassium lorsque les mesures temporaires échouent.",
          ),
          T(
            "Acidose métabolique profonde non corrigée.",
            "Une acidémie persistante peut compromettre contractilité, tonus vasculaire et rythme.",
          ),
          T(
            "Oedème pulmonaire ne répondant pas aux diurétiques.",
            "L’ultrafiltration permet de retirer le volume lorsque le traitement habituel est insuffisant.",
          ),
          T(
            "Péricardite urémique.",
            "Cette complication d’urémie constitue une indication de suppléance.",
          ),
          F(
            "Créatinine isolée à un seuil arbitraire sans complication.",
            "Aucune valeur unique de fonction rénale ne commande à elle seule l’initiation.",
          ),
        ],
      ),
    ],
  },
  {
    title: "IRC, IRT et dialyse",
    questions: [
      qcm(
        "Quels éléments définissent une IRC ?",
        ["b00113", "b00114"],
        "L’IRC associe chronicité supérieure à trois mois et baisse du DFG ou marqueur persistant d’atteinte rénale.",
        [
          T(
            "Une durée de plus de trois mois.",
            "La chronicité distingue cette atteinte d’une insuffisance rénale aiguë.",
          ),
          T(
            "Un DFG inférieur à 60 mL/min.",
            "Ce seuil prolongé constitue un critère même sans autre anomalie.",
          ),
          T(
            "Une albuminurie persistante.",
            "Elle témoigne d’une atteinte fonctionnelle glomérulaire chronique.",
          ),
          T(
            "Une anomalie structurelle durable à l’imagerie.",
            "Un dommage anatomique persistant peut définir l’IRC malgré un DFG conservé.",
          ),
          F(
            "Une oligurie de deux heures après induction.",
            "Ce phénomène bref ne répond pas au critère de chronicité.",
          ),
        ],
      ),
      qcm(
        "Quelles associations caractérisent l’épidémiologie de l’IRC ?",
        ["b00111", "b00116", "b00117"],
        "L’IRC est dominée par diabète et HTA, accompagne un risque vasculaire élevé et favorise les épisodes aigus.",
        [
          T(
            "Le diabète représente environ 45 % des causes.",
            "La néphropathie diabétique constitue l’étiologie dominante citée.",
          ),
          T(
            "L’HTA représente environ 27 % des causes.",
            "La maladie hypertensive contribue fortement à la perte néphronique chronique.",
          ),
          T(
            "Les patients ont souvent un risque cardiovasculaire associé.",
            "Diabète et HTA favorisent aussi coronaropathie et maladie artérielle périphérique.",
          ),
          T(
            "L’IRC augmente le risque d’IRA.",
            "La faible réserve rend le rein plus sensible aux agressions périopératoires.",
          ),
          F(
            "Une IRA ne peut jamais conduire à une IRC.",
            "Les deux entités sont interreliées et l’IRA peut accélérer une atteinte chronique.",
          ),
        ],
      ),
      qcm(
        "Que faut-il vérifier chez un patient dialysé avant chirurgie ?",
        ["b00119", "b00120", "b00124"],
        "L’évaluation précise stabilité, dialyse récente, poids sec, ions et protection de l’accès vasculaire.",
        [
          T(
            "La date et la tolérance de la dernière dialyse.",
            "Une dialyse récente optimise volume, potassium et acidose avant un geste électif.",
          ),
          T(
            "Le poids sec et le poids actuel.",
            "L’écart aide à distinguer surcharge, euvolémie et déplétion.",
          ),
          T(
            "La kaliémie préopératoire.",
            "Une hyperkaliémie significative modifie le calendrier et la stratégie anesthésique.",
          ),
          T(
            "L’état de la fistule ou du cathéter.",
            "L’accès doit rester fonctionnel et être protégé de toute compression.",
          ),
          F(
            "Une dialyse systématique pendant toute chirurgie mineure.",
            "Le besoin dépend du statut clinique et non de la seule présence d’une IRT.",
          ),
        ],
      ),
      qcm(
        "Comment protéger une fistule artérioveineuse ?",
        ["b00124", "b00128", "b00129"],
        "Le membre de fistule doit être identifié, libre de compression et préservé des gestes vasculaires.",
        [
          T(
            "Eviter un brassard de pression sur ce membre.",
            "Les compressions répétées peuvent compromettre le débit et favoriser la thrombose.",
          ),
          T(
            "Ne pas poser de voie veineuse dans le membre concerné.",
            "Les ponctions exposent à hématome, infection et altération du capital vasculaire.",
          ),
          T(
            "Vérifier la présence du thrill avant et après.",
            "La vibration palpable confirme un débit persistant dans l’accès.",
          ),
          F(
            "Comprimer la fistule sous l’appui de table.",
            "Une pression prolongée peut interrompre le flux et thromboser l’accès.",
          ),
          F(
            "Utiliser la fistule pour administrer les médicaments anesthésiques.",
            "Elle est réservée à la dialyse et ne constitue pas une voie veineuse ordinaire.",
          ),
        ],
      ),
      qcm(
        "Quels principes guident les solutés et vasopresseurs en IRC ?",
        ["b00122", "b00123"],
        "Les solutés balancés évitent l’acidose hyperchlorémique et les vasopresseurs suivent la correction du VCE.",
        [
          T(
            "Le NaCl 0,9 % peut provoquer une acidose hyperchlorémique.",
            "Une charge chlorée importante diminue le bicarbonate et peut aggraver la kaliémie.",
          ),
          T(
            "Le lactate de Ringer contient une faible quantité de potassium.",
            "Cette concentration n’entraîne pas à elle seule une hausse cliniquement majeure.",
          ),
          T(
            "Un soluté balancé peut être préféré.",
            "Il limite l’acidose hyperchlorémique potentiellement délétère.",
          ),
          T(
            "Un vasopresseur est titré après correction d’une hypovolémie.",
            "Une vasoconstriction forte sur VCE bas peut diminuer davantage la perfusion rénale.",
          ),
          F(
            "Une forte dose alpha-agoniste compense toujours un VCE insuffisant.",
            "La pression peut remonter tandis que le débit rénal reste compromis par la déplétion.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Résections transurétrales",
    questions: [
      qcm(
        "Quels principes concernent une résection transurétrale ?",
        "b00134",
        "Le geste combine lithotomie, irrigation continue et niveau anesthésique permettant la manipulation des voies urinaires basses.",
        [
          T(
            "La position habituelle est la lithotomie.",
            "L’accès transurétral nécessite l’installation gynécologique avec protection des appuis.",
          ),
          T(
            "Une irrigation gravitaire maintient la visualisation.",
            "Le liquide distend la cavité et évacue sang et fragments pendant la résection.",
          ),
          T(
            "La glycine 1,5 % peut être utilisée en monopolaire.",
            "Cette solution légèrement hypotonique est non électrolytique.",
          ),
          T(
            "Un niveau sensitif T10 est requis en neuraxiale.",
            "Ce niveau couvre les afférences du geste sur prostate ou vessie.",
          ),
          F(
            "Aucune surveillance liquidienne n’est utile.",
            "Le volume et la pression d’irrigation conditionnent absorption et complications.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs favorisent le syndrome RTUP ?",
        ["b00138", "b00139"],
        "L’absorption des sinus prostatiques augmente avec la durée, la pression d’irrigation et le volume utilisé.",
        [
          T(
            "Une intervention de plus d’une heure.",
            "La durée augmente le temps d’exposition des sinus ouverts au liquide hypotonique.",
          ),
          T(
            "Un sac d’irrigation placé très haut.",
            "La hauteur augmente la pression hydrostatique et le passage intravasculaire.",
          ),
          T(
            "Un grand nombre de sacs consommés.",
            "Un volume important signale une exposition et une absorption potentiellement élevées.",
          ),
          T(
            "L’ouverture de nombreux sinus veineux prostatiques.",
            "Ces communications vasculaires constituent la voie d’entrée systémique du liquide.",
          ),
          F(
            "Une courte RTU-TV sans sinus prostatique ouvert.",
            "Ce contexte expose beaucoup moins au syndrome classique d’absorption prostatique.",
          ),
        ],
      ),
      qcm(
        "Quels signes évoquent une hyponatrémie du syndrome RTUP ?",
        "b00139",
        "L’hypoosmolarité provoque d’abord des signes neurologiques puis respiratoires et cardiovasculaires potentiellement mortels.",
        [
          T(
            "Céphalées et agitation.",
            "Ces manifestations précoces traduisent l’œdème cérébral hypoosmolaire.",
          ),
          T(
            "Confusion ou convulsions.",
            "Une baisse sévère de sodium perturbe le fonctionnement neuronal.",
          ),
          T(
            "Désaturation et surcharge pulmonaire.",
            "L’absorption de volume peut s’associer au trouble osmolaire.",
          ),
          T(
            "Arythmie et instabilité tensionnelle.",
            "Les perturbations électrolytiques et volémiques retentissent sur le système cardiovasculaire.",
          ),
          F(
            "Hypernatrémie hyperosmolaire constante.",
            "Le syndrome classique associe au contraire une hyponatrémie hypoosmolaire de dilution.",
          ),
        ],
      ),
      qcm(
        "Comment traiter un syndrome RTUP symptomatique ?",
        "b00139",
        "Le traitement arrête l’absorption, traite la surcharge et corrige prudemment l’hyponatrémie neurologique grave.",
        [
          T(
            "Interrompre la résection et l’irrigation.",
            "Supprimer la source empêche la poursuite de l’absorption hypotonique.",
          ),
          T(
            "Mesurer rapidement natrémie et osmolarité.",
            "Le bilan quantifie la gravité et guide la correction du sodium.",
          ),
          T(
            "Restreindre les apports si une surcharge est présente.",
            "L’absorption a déjà augmenté l’eau corporelle et le volume circulant.",
          ),
          T(
            "Administrer du NaCl 3 % en cas de convulsions ou coma.",
            "Des bolus sont poursuivis jusqu’à amélioration ou sodium au moins à 125 mmol/L.",
          ),
          F(
            "Corriger brutalement toute hyponatrémie asymptomatique jusqu’à 150 mmol/L.",
            "Une surcorrection non contrôlée expose à une complication osmotique neurologique.",
          ),
        ],
      ),
      qcm(
        "Quelles complications spécifiques concernent la RTU de tumeur vésicale ?",
        ["b00142", "b00143", "b00144"],
        "La RTU-TV expose à la perforation et, sur la paroi latérale, à une contraction obturatrice brutale.",
        [
          T(
            "Une perforation peut diminuer le retour d’irrigation.",
            "Le liquide quitte la vessie vers les tissus plutôt que de revenir par le résectoscope.",
          ),
          T(
            "Une douleur rétropubienne peut signaler une perforation extrapéritonéale.",
            "L’extravasation basse irrite les tissus pelviens autour de la vessie.",
          ),
          T(
            "Une bradycardie vagale peut accompagner une perforation importante.",
            "La distension ou l’irritation péritonéale peut déclencher un réflexe vagal.",
          ),
          T(
            "Une tumeur latérale expose à la stimulation obturatrice.",
            "Le courant provoque une adduction qui peut pousser le résectoscope dans la paroi.",
          ),
          F(
            "Le bloc neuromusculaire augmente le réflexe obturateur.",
            "Une curarisation efficace supprime la contraction et réduit le risque de perforation.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Chirurgies urologiques majeures",
    questions: [
      qcm(
        "Quels principes concernent un sepsis sur calcul obstructif ?",
        ["b00146", "b00148"],
        "L’obstruction infectée est une urgence de drainage, avec risque de dégradation hémodynamique lors des manipulations.",
        [
          T(
            "La levée de l’obstacle est urgente.",
            "Les antibiotiques seuls diffusent mal dans un système obstrué et ne contrôlent pas la source.",
          ),
          T(
            "Une sonde double J peut assurer le drainage.",
            "La voie naturelle permet de franchir l’obstacle et de décomprimer les cavités.",
          ),
          T(
            "Une néphrostomie est une alternative.",
            "Le drainage percutané convient si les voies sont dilatées et la coagulation compatible.",
          ),
          T(
            "Une bactériémie peut aggraver l’état pendant le geste.",
            "La manipulation du foyer infecté libère des bactéries dans la circulation.",
          ),
          F(
            "Le drainage doit attendre plusieurs semaines de traitement antibiotique.",
            "Le contrôle urgent de la source conditionne le pronostic septique.",
          ),
        ],
      ),
      qcm(
        "Quels risques accompagnent une prostatectomie robotique en Trendelenburg marqué ?",
        ["b00151", "b00152"],
        "La position prolongée et le pneumopéritoine augmentent pressions céphalique, oculaire et tissulaire.",
        [
          T(
            "Oedème facial et des voies aériennes.",
            "La stase veineuse céphalique peut rendre l’extubation dangereuse après une longue intervention.",
          ),
          T(
            "Augmentation de la pression intraoculaire.",
            "La déclivité et la pression veineuse favorisent une hausse parfois importante.",
          ),
          T(
            "Augmentation de la pression intracrânienne.",
            "Le retour veineux cérébral est entravé par l’inclinaison et le pneumopéritoine.",
          ),
          T(
            "Syndrome compartimental d’un membre inférieur.",
            "Une position extrême et prolongée peut diminuer perfusion et augmenter pression tissulaire.",
          ),
          F(
            "Diminution garantie de toutes les pressions céphaliques.",
            "Le Trendelenburg profond produit habituellement l’effet opposé sur le drainage veineux.",
          ),
        ],
      ),
      qcm(
        "Quels enjeux caractérisent une néphrectomie pour tumeur volumineuse ?",
        ["b00155", "b00156", "b00157", "b00159"],
        "Le geste associe position latérale, hémorragie possible, extension veineuse et protection du capital rénal restant.",
        [
          T(
            "Un thrombus peut s’étendre dans la VCI.",
            "Cinq à dix pour cent des tumeurs ont une extension veineuse parfois jusqu’à l’oreillette.",
          ),
          T(
            "Des accès veineux fiables sont nécessaires.",
            "Une tumeur très vascularisée peut provoquer des pertes sanguines rapides et abondantes.",
          ),
          T(
            "Une pression artérielle invasive peut être indiquée.",
            "La mesure continue guide la réanimation pendant les variations hémodynamiques.",
          ),
          T(
            "La fonction du rein restant doit être protégée.",
            "Le DFG postopératoire dépend de la contribution du parenchyme conservé.",
          ),
          F(
            "La position n’a aucun risque propre.",
            "Le décubitus latéral exige une protection des appuis et de la ventilation.",
          ),
        ],
      ),
      qcm(
        "Quelles conséquences anticiper pendant une cystectomie radicale ?",
        ["b00161", "b00162", "b00164", "b00165"],
        "La cystectomie est longue et hémorragique ; la dérivation digestive ajoute des troubles métaboliques postopératoires.",
        [
          T(
            "Des pertes sanguines supérieures à un litre sont possibles.",
            "La dissection pelvienne et la durée peuvent imposer transfusion et monitorage continu.",
          ),
          T(
            "L’intervention dépasse souvent six heures.",
            "La durée accroît les enjeux de température, pression, position et remplissage.",
          ),
          T(
            "Une péridurale peut améliorer l’analgésie de laparotomie.",
            "La technique réduit la douleur d’une incision médiane lorsqu’elle est compatible avec l’hémostase.",
          ),
          T(
            "Une diversion intestinale peut provoquer une acidose métabolique.",
            "Les échanges prolongés entre urine et muqueuse digestive modifient ions et bicarbonate.",
          ),
          F(
            "Aucun contrôle électrolytique n’est utile après diversion.",
            "Sodium, chlore, potassium et équilibre acide-base peuvent se dégrader.",
          ),
        ],
      ),
      qcm(
        "Quels principes guident l’analgésie des chirurgies rénales ouvertes ?",
        ["b00158", "b00164"],
        "Les incisions sous-costales ou médianes sont douloureuses et justifient une analgésie multimodale adaptée à l’hémostase.",
        [
          T(
            "Une péridurale peut être utile après néphrectomie ouverte.",
            "Elle contrôle la douleur sous-costale et facilite ventilation et mobilisation.",
          ),
          T(
            "Les anesthésiques locaux sont introduits après la phase hémorragique si une combinée est choisie.",
            "Cette chronologie limite l’hypotension sympathique pendant les pertes actives.",
          ),
          T(
            "Une ACP IV peut suffire après laparoscopie.",
            "Le traumatisme pariétal plus limité nécessite souvent une technique moins invasive.",
          ),
          F(
            "La fonction rénale n’influence jamais le choix des opioïdes.",
            "Les métabolites actifs imposent un choix et une titration spécifiques.",
          ),
          F(
            "Une douleur sous-costale n’altère pas la ventilation.",
            "La douleur inhibe l’inspiration profonde et favorise les complications pulmonaires.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Transplantation rénale",
    questions: [
      qcm(
        "Quels principes décrivent la transplantation rénale ?",
        ["b00167", "b00168", "b00169"],
        "Le greffon est implanté sur les vaisseaux iliaques sous anesthésie générale, les reins natifs restant en place.",
        [
          T(
            "Elle améliore la survie par rapport à la dialyse.",
            "Pour la plupart des patients, la transplantation réduit mortalité et coûts à long terme.",
          ),
          T(
            "Le donneur peut être vivant ou décédé.",
            "Les greffons proviennent notamment de donneurs après décès circulatoire ou neurologique.",
          ),
          T(
            "Les anastomoses utilisent habituellement les vaisseaux iliaques externes.",
            "La veine et l’artère du greffon sont raccordées dans la fosse iliaque.",
          ),
          F(
            "Les reins natifs sont systématiquement retirés.",
            "Ils demeurent habituellement en place pendant la transplantation standard.",
          ),
          T(
            "Une anastomose relie l’uretère du greffon à la vessie.",
            "Cette étape assure le drainage urinaire du nouveau rein.",
          ),
        ],
      ),
      qcm(
        "Quels objectifs hémodynamiques protègent le greffon ?",
        "b00172",
        "La reperfusion exige un VCE satisfaisant et une PAM généralement entre 70 et 90 mmHg.",
        [
          T(
            "Optimiser le volume circulant efficace.",
            "Une précharge adéquate soutient le débit dans l’artère rénale nouvellement anastomosée.",
          ),
          T(
            "Maintenir une PAM de 70 à 90 mmHg chez la plupart des patients.",
            "Cette plage fournit une pression de perfusion compatible avec la reprise du greffon.",
          ),
          T(
            "Utiliser de petites doses de vasopresseur si le VCE est suffisant.",
            "Une pression basse persistante peut nécessiter un soutien vasculaire titré.",
          ),
          F(
            "Tolérer une PAM prolongée à 40 mmHg après déclampage.",
            "Une pression très basse compromet directement la perfusion du greffon.",
          ),
          F(
            "Forcer une surcharge massive sans réévaluation.",
            "Un excès liquidien expose à l’œdème sans garantir une meilleure perfusion.",
          ),
        ],
      ),
      qcm(
        "Quels événements anticiper au déclampage du greffon ?",
        ["b00172", "b00173", "b00174"],
        "La reperfusion modifie la pression et peut libérer du potassium contenu dans la solution de conservation.",
        [
          T(
            "Une baisse de pression artérielle peut survenir.",
            "La redistribution et la reperfusion du lit vasculaire du greffon peuvent abaisser la PAM.",
          ),
          T(
            "La kaliémie peut augmenter.",
            "La solution de conservation contient une quantité non négligeable de potassium.",
          ),
          T(
            "Le rythme cardiaque doit être surveillé.",
            "Une hyperkaliémie aiguë peut entraîner des anomalies de conduction ou une arythmie.",
          ),
          T(
            "Le VCE et le soutien vasopresseur doivent être préparés.",
            "Une anticipation permet de restaurer rapidement la pression de perfusion du greffon.",
          ),
          F(
            "La solution de conservation ne contient jamais d’électrolytes.",
            "Sa composition peut justement apporter une charge potassique au moment de la reperfusion.",
          ),
        ],
      ),
      qcm(
        "Comment interpréter une oligurie précoce du greffon ?",
        ["b00175", "b00176"],
        "L’oligurie n’est pas synonyme d’hypovolémie ; retard de fonction, thrombose et hématome doivent être recherchés.",
        [
          T(
            "Une reprise retardée de fonction est possible.",
            "Certains greffons ne produisent pas immédiatement une diurèse abondante malgré une perfusion correcte.",
          ),
          T(
            "Une thrombose artérielle doit être exclue.",
            "L’occlusion de l’artère du greffon menace rapidement sa viabilité.",
          ),
          T(
            "Une thrombose veineuse ou un hématome peut être en cause.",
            "Une obstruction du drainage ou une compression altère la perfusion rénale.",
          ),
          T(
            "Une échographie Doppler est indiquée.",
            "L’imagerie évalue flux vasculaires et collections avant de modifier le remplissage.",
          ),
          F(
            "Il faut administrer plusieurs litres sans examen.",
            "Le remplissage aveugle peut provoquer une surcharge sans corriger une complication mécanique.",
          ),
        ],
      ),
      qcm(
        "Quels principes concernent les suites de transplantation ?",
        ["b00171", "b00172", "b00175", "b00176"],
        "Le suivi combine fonction du greffon, immunosuppression, ions, volume, douleur et recherche précoce de complications.",
        [
          T(
            "Les mesures périopératoires de l’IRT restent applicables.",
            "Le patient conserve ses comorbidités et sa dysfonction jusqu’à reprise effective du greffon.",
          ),
          T(
            "Les immunosuppresseurs doivent être administrés selon le protocole.",
            "La prévention du rejet commence autour de la transplantation et doit être coordonnée.",
          ),
          T(
            "Une diurèse précoce est rassurante sans être le seul critère.",
            "Elle suggère une reprise mais ne remplace pas les bilans biologique et vasculaire.",
          ),
          T(
            "Une ACP ou un TAP bloc peut participer à l’analgésie.",
            "Une analgésie efficace favorise ventilation et mobilisation après l’incision iliaque.",
          ),
          F(
            "Toute oligurie signifie un rejet aigu certain.",
            "Les diagnostics incluent retard de fonction, perfusion insuffisante et complication vasculaire.",
          ),
        ],
      ),
    ],
  },
];
function buildIsolatedQcm() {
  return ISOLATED_QCM.map((s, i) => ({
    label: `QCM — Série ${i + 1} · ${s.title}`,
    allowed_voies: ["interne"],
    questions: s.questions,
  }));
}

const DP_QCM = [
  {
    title: "Oligurie sous cœlioscopie",
    vignette:
      "La patiente Anaïs R., 46 ans, sans maladie rénale connue, est opérée d’une colectomie laparoscopique. Sa créatinine préopératoire est normale, la pression est stable et la diurèse mesurée par sonde diminue après l’installation du pneumopéritoine. Le champ est sec et aucun incident chirurgical n’est signalé.",
    questions: [
      qcm(
        "Quels mécanismes peuvent expliquer cette baisse initiale de diurèse ?",
        ["b00065", "b00066", "b00086"],
        "L’anesthésie et le pneumopéritoine diminuent temporairement perfusion et filtration sans prouver une lésion rénale.",
        [
          T(
            "Compression des veines rénales par la pression abdominale.",
            "Une hausse intra-abdominale réduit le drainage veineux et la perfusion effective du rein.",
          ),
          T(
            "Diminution du débit cardiaque sous pneumopéritoine.",
            "La compression cave peut diminuer le retour veineux et donc le flux rénal.",
          ),
          T(
            "Réponse endocrine avec ADH et activation du SRAA.",
            "Le stress chirurgical favorise la rétention d’eau et de sodium et diminue la diurèse.",
          ),
          F(
            "Nécrose corticale certaine après quelques minutes.",
            "Une oligurie transitoire isolée ne permet pas de conclure à un dommage structurel.",
          ),
          F(
            "Production rénale massive de glucose.",
            "Ce mécanisme n’explique pas la baisse temporellement liée à l’insufflation.",
          ),
        ],
      ),
      qcm(
        "Quelles vérifications sont prioritaires avant un remplissage ?",
        ["b00058", "b00065", "b00095"],
        "Une oligurie impose de confirmer la mesure, d’examiner VCE et pression et de rechercher une obstruction simple.",
        [
          T(
            "Vérifier la coudure et la perméabilité de la sonde.",
            "Un obstacle mécanique au drainage produit une fausse oligurie immédiatement réversible.",
          ),
          T(
            "Réévaluer pression artérielle et perfusion périphérique.",
            "Une pression insuffisante peut placer le rein sous son seuil d’autorégulation.",
          ),
          T(
            "Estimer le VCE à partir de l’ensemble clinique.",
            "Le volume ne se déduit pas de la seule quantité d’urine produite.",
          ),
          F(
            "Injecter deux litres sans examiner la patiente.",
            "Une charge aveugle expose à l’œdème sans garantie de réponse rénale.",
          ),
          F(
            "Considérer toute sonde comme toujours fonctionnelle.",
            "Une obstruction du circuit est fréquente et doit être écartée en premier.",
          ),
        ],
        "La diurèse est de 10 mL en une heure, tandis que la PAM reste à 75 mmHg et la perte sanguine est minime.",
      ),
      qcm(
        "Quelle interprétation est la plus cohérente ?",
        ["b00039", "b00065", "b00086"],
        "Un VCE cliniquement satisfaisant et la relation à la pression d’insufflation orientent vers une oligurie fonctionnelle de cœlioscopie.",
        [
          T(
            "Le pneumopéritoine demeure une cause plausible.",
            "L’oligurie est typiquement proportionnelle à la pression intra-abdominale.",
          ),
          T(
            "Une hypovolémie majeure est moins probable.",
            "La stabilité hémodynamique et l’absence de pertes importantes affaiblissent cette hypothèse.",
          ),
          F(
            "La créatinine normale exclut toute atteinte ultérieure.",
            "Ce marqueur augmente tardivement et ne prédit pas la suite d’une agression.",
          ),
          T(
            "Il faut limiter une pression d’insufflation inutilement élevée.",
            "Une baisse techniquement possible peut restaurer retour veineux et débit rénal.",
          ),
          F(
            "La diurèse impose un diurétique prophylactique immédiat.",
            "Aucun traitement pharmacologique n’a prouvé la prévention d’une IRA dans ce contexte.",
          ),
        ],
        "La sonde est perméable, le VCE paraît satisfaisant et l’oligurie a commencé exactement après une insufflation à pression élevée.",
      ),
      qcm(
        "Quelles actions sont raisonnables à ce stade ?",
        ["b00086", "b00095", "b00123"],
        "La stratégie corrige les facteurs mécaniques et hémodynamiques puis réévalue, sans forcer artificiellement la diurèse.",
        [
          T(
            "Demander une diminution de pression du pneumopéritoine si possible.",
            "La réduction de compression peut améliorer le retour veineux et le flux rénal.",
          ),
          T(
            "Maintenir la PAM dans la cible individuelle.",
            "Une pression suffisante préserve le gradient de perfusion lorsque l’autorégulation est sollicitée.",
          ),
          T(
            "Titrer un vasopresseur si le VCE est suffisant et la pression baisse.",
            "Le soutien vasculaire est préférable à un excès de soluté chez une patiente euvolémique.",
          ),
          F(
            "Administrer du furosémide uniquement pour atteindre un chiffre urinaire.",
            "Une diurèse pharmacologique ne corrige pas nécessairement le débit ni la lésion.",
          ),
          F(
            "Suspendre toute surveillance jusqu’au lendemain.",
            "La tendance hémodynamique et biologique doit être suivie après l’agression.",
          ),
        ],
        "Le chirurgien peut diminuer la pression d’insufflation sans compromettre l’exposition, et la PAM reste proche de la cible.",
      ),
      qcm(
        "Quels éléments doivent faire rechercher une IRA postopératoire ?",
        ["b00089", "b00094"],
        "La persistance de l’oligurie et une hausse dynamique de créatinine dans les 48 à 72 heures répondent aux critères d’IRA.",
        [
          T(
            "Une diurèse <0,5 mL/kg/h pendant plus de six heures.",
            "Cette durée et ce seuil pondéral correspondent au critère KDIGO urinaire.",
          ),
          T(
            "Une hausse de créatinine >26,5 µmol/L en 48 heures.",
            "La variation absolue rapide suffit au diagnostic d’insuffisance aiguë.",
          ),
          T(
            "Une augmentation de créatinine d’au moins 50 % en sept jours.",
            "Ce changement relatif est un autre critère diagnostique reconnu.",
          ),
          F(
            "Une diurèse normale exclut toute IRA non oligurique.",
            "Une atteinte peut être diagnostiquée par la créatinine malgré une diurèse préservée.",
          ),
          F(
            "Une créatinine inchangée dix minutes après l’agression suffit à rassurer.",
            "La cinétique du marqueur est retardée et doit être contrôlée ultérieurement.",
          ),
        ],
        "Après dégonflage, la diurèse reprend partiellement ; l’équipe planifie néanmoins un contrôle biologique et urinaire.",
      ),
      qcm(
        "Quelle étiologie doit être recherchée en premier ?",
        ["b00090", "b00098"],
        "Une baisse retardée de fonction impose de reprendre l’analyse prérénale, intrinsèque et postrénale, en ciblant les nouvelles expositions.",
        [
          T(
            "Une hypoperfusion périopératoire prolongée.",
            "Une pression ou un débit insuffisant peut conduire d’une atteinte fonctionnelle à une NTA.",
          ),
          T(
            "Une exposition médicamenteuse néphrotoxique.",
            "AINS, contraste et autres agents doivent être revus dans la chronologie.",
          ),
          T(
            "Une obstruction urinaire postopératoire.",
            "La sonde ou les voies peuvent s’obstruer et créer une cause postrénale.",
          ),
          F(
            "Une néphropathie chronique certaine sans antériorité.",
            "La dynamique postopératoire et la valeur basale normale orientent d’abord vers une cause aiguë.",
          ),
          F(
            "Une cause unique doit être imposée avant l’examen.",
            "L’IRA postopératoire est souvent multifactorielle et exige une analyse systématique.",
          ),
        ],
        "A 48 heures, la créatinine augmente de 35 µmol/L et la patiente a reçu un AINS en SSPI.",
      ),
      qcm(
        "Quelles mesures complètent la prise en charge ?",
        ["b00092", "b00095", "b00096"],
        "Le traitement supprime l’agression, ajuste les doses, maintient perfusion et surveille complications et récupération.",
        [
          T(
            "Arrêter l’AINS et revoir les autres néphrotoxiques.",
            "La suppression de l’inhibition des prostaglandines restaure une part de la capacité d’autorégulation.",
          ),
          T(
            "Adapter les posologies au DFG actuel.",
            "La clairance diminuée expose à l’accumulation des traitements prescrits.",
          ),
          T(
            "Suivre poids, bilan hydrique, ions et créatinine.",
            "Ces paramètres détectent surcharge, hyperkaliémie et progression de l’IRA.",
          ),
          F(
            "Prescrire un colloïde de synthèse pour protéger le rein.",
            "Ces solutions sont à éviter chez le patient critique ou à risque rénal.",
          ),
          F(
            "Ignorer l’épisode dès que la diurèse augmente.",
            "Une diurèse isolée ne remplace pas la surveillance biologique et clinique.",
          ),
        ],
        "L’échographie exclut un obstacle, la pression est correcte et la patiente demeure sans surcharge clinique.",
      ),
    ],
  },
  {
    title: "IRA après contraste et AINS",
    vignette:
      "Le patient Bernard T., 72 ans, diabétique, hypertendu et porteur d’une IRC avec DFG estimé à 38 mL/min, doit subir une chirurgie vasculaire programmée. Il prend un ARA2 et a consommé de l’ibuprofène pour une douleur. Un angioscanner iodé est demandé avant le geste.",
    questions: [
      qcm(
        "Quels facteurs préexistants augmentent son risque d’IRA ?",
        ["b00028", "b00103", "b00116"],
        "IRC, diabète, âge, blocage du SRAA et AINS cumulent faible réserve et altération d’autorégulation.",
        [
          T(
            "Une IRC avec DFG à 38 mL/min.",
            "La réserve néphronique réduite augmente la sensibilité à toute nouvelle agression.",
          ),
          T(
            "Le diabète.",
            "Cette comorbidité est à la fois cause fréquente d’IRC et facteur d’IRA.",
          ),
          T(
            "La prise récente d’AINS.",
            "L’inhibition des prostaglandines empêche la vasodilatation afférente protectrice.",
          ),
          T(
            "Le traitement par ARA2.",
            "La diminution de constriction efférente peut faire chuter le DFG lorsque la perfusion baisse.",
          ),
          F(
            "Une excellente réserve rénale documentée.",
            "Le DFG à 38 mL/min indique au contraire une atteinte chronique significative.",
          ),
        ],
      ),
      qcm(
        "Comment raisonner sur l’angioscanner iodé ?",
        ["b00098", "b00103"],
        "Le contraste n’est pas automatiquement interdit mais son indication et les alternatives sans iode doivent être discutées.",
        [
          T(
            "Vérifier si le résultat modifiera la chirurgie.",
            "Une exploration à risque doit avoir une conséquence décisionnelle claire.",
          ),
          T(
            "Rechercher une modalité sans contraste iodé.",
            "Une échographie ou une autre technique peut parfois fournir l’information nécessaire.",
          ),
          T(
            "Informer le radiologiste du DFG réduit.",
            "Le protocole et la quantité de contraste peuvent être adaptés au risque.",
          ),
          F(
            "Administrer le contraste sans connaître la fonction rénale.",
            "Le niveau de DFG conditionne les précautions et le suivi.",
          ),
          F(
            "Considérer l’examen comme toujours sans risque rénal.",
            "Le contraste figure parmi les expositions à prendre en compte chez un patient fragile.",
          ),
        ],
        "Le chirurgien confirme que l’imagerie est indispensable, mais accepte une concertation avec radiologie.",
      ),
      qcm(
        "Quelles mesures préventives sont cohérentes ?",
        ["b00095", "b00096", "b00098"],
        "La prévention corrige le VCE, retire les néphrotoxiques et adapte le contraste ; l’acétylcystéine n’est pas indiquée.",
        [
          T(
            "Arrêter l’ibuprofène.",
            "Supprimer l’AINS restaure la voie des prostaglandines nécessaire en hypoperfusion.",
          ),
          T(
            "Assurer une hydratation IV adaptée sans surcharge.",
            "Un VCE suffisant soutient le débit rénal pendant l’exposition iodée.",
          ),
          T(
            "Utiliser la plus faible dose de contraste utile.",
            "Limiter la charge iodée réduit une exposition potentiellement délétère.",
          ),
          F(
            "Ajouter de l’acétylcystéine comme protection obligatoire avant cet angioscanner.",
            "Cette mesure n’est plus recommandée pour prévenir l’atteinte rénale au contraste.",
          ),
          F(
            "Provoquer une déshydratation avant l’examen.",
            "Un VCE bas diminue la perfusion et augmente le risque d’IRA.",
          ),
        ],
        "L’examen est maintenu pour le lendemain ; le patient est cliniquement euvolémique sans insuffisance cardiaque décompensée.",
      ),
      qcm(
        "Comment interpréter cette variation de créatinine ?",
        ["b00048", "b00089"],
        "Une hausse de 32 µmol/L en moins de 48 heures satisfait le critère absolu d’IRA.",
        [
          T(
            "Le critère KDIGO de variation absolue est atteint.",
            "L’augmentation dépasse 26,5 µmol/L dans la fenêtre de 48 heures.",
          ),
          T(
            "La fonction n’est plus stable pour une formule de clairance.",
            "Une estimation fondée sur un état d’équilibre devient peu fiable pendant la cinétique aiguë.",
          ),
          F(
            "La variation est trop faible pour avoir une signification.",
            "Le seuil diagnostique est inférieur à cette hausse mesurée.",
          ),
          T(
            "Des dosages sériés préciseront le pic puis la récupération éventuelle.",
            "La tendance et le niveau basal permettent de suivre l’évolution de l’épisode.",
          ),
          F(
            "La seule valeur permet d’affirmer une obstruction.",
            "Le diagnostic d’IRA ne précise pas encore son mécanisme.",
          ),
        ],
        "Trente-six heures après le contraste, la créatinine passe de 160 à 192 µmol/L, avec une diurèse encore préservée.",
      ),
      qcm(
        "Quelles causes doivent encore être examinées ?",
        ["b00090", "b00103"],
        "L’exposition iodée est plausible mais ne dispense pas de rechercher perfusion, obstacle et autres néphrotoxiques.",
        [
          T(
            "Une hypovolémie intercurrente.",
            "Une baisse du VCE peut s’associer au contraste et au blocage de l’autorégulation.",
          ),
          T(
            "Une obstruction des voies urinaires.",
            "Une cause postrénale reste possible et peut être rapidement diagnostiquée par imagerie.",
          ),
          T(
            "La poursuite accidentelle d’un AINS.",
            "Une nouvelle prise maintiendrait l’inhibition de la vasodilatation afférente.",
          ),
          T(
            "Un sepsis ou une hypotension non rapportée.",
            "Ces agressions peuvent expliquer ou amplifier l’insuffisance aiguë.",
          ),
          F(
            "Une étiologie unique doit être retenue sans examen.",
            "Le risque cumulatif rend une origine multifactorielle fréquente.",
          ),
        ],
        "Le patient a vomi deux fois après l’examen et sa pression est plus basse que sa valeur habituelle.",
      ),
      qcm(
        "Quelle conduite adopter pour la chirurgie programmée ?",
        ["b00095", "b00120"],
        "Une chirurgie élective est reportée si possible jusqu’à stabilisation et retour proche de la fonction basale.",
        [
          T(
            "Différer le geste si le risque chirurgical le permet.",
            "Le rein traverse une atteinte active dont l’agression opératoire pourrait aggraver la gravité.",
          ),
          T(
            "Corriger la déplétion hydrique de manière titrée.",
            "La restauration du VCE traite une composante prérénale probable sans provoquer de surcharge.",
          ),
          T(
            "Obtenir un avis néphrologique.",
            "L’IRC compliquée d’IRA justifie une coordination spécialisée avant reprogrammation.",
          ),
          F(
            "Maintenir la date sans tenir compte de l’évolution.",
            "Une atteinte aiguë modifiable augmente le risque périopératoire et doit être stabilisée.",
          ),
          F(
            "Administrer un diurétique pour normaliser artificiellement la diurèse.",
            "Le traitement de la cause et de la perfusion prime sur le volume d’urine isolé.",
          ),
        ],
        "L’intervention vasculaire est élective et peut être repoussée de deux semaines sans perte de chance.",
      ),
      qcm(
        "Quels éléments valident la reprogrammation ?",
        ["b00095", "b00117", "b00120"],
        "La reprise suppose une fonction stabilisée, un VCE normal, des traitements revus et un plan de surveillance renforcé.",
        [
          T(
            "La créatinine est revenue près du niveau basal.",
            "L’absence de progression indique une récupération suffisante avant une nouvelle agression.",
          ),
          T(
            "Le patient est euvolémique et la PA habituelle restaurée.",
            "Ces conditions protègent la perfusion rénale au moment de l’induction.",
          ),
          T(
            "Les AINS ont été retirés du plan antalgique.",
            "La réexposition à une molécule néphrotoxique doit être évitée.",
          ),
          T(
            "Un contrôle postopératoire de la fonction est planifié.",
            "L’IRC et l’IRA récente justifient une détection précoce d’une récidive.",
          ),
          F(
            "Le risque rénal est désormais identique à celui d’un sujet sain.",
            "L’IRC et l’épisode aigu antérieur maintiennent un risque supérieur.",
          ),
        ],
        "Dix jours plus tard, la créatinine est à 164 µmol/L, le poids est stable et aucun nouveau néphrotoxique n’a été administré.",
      ),
    ],
  },
  {
    title: "Dialysé hyperkaliémique",
    vignette:
      "Le patient Christian V., 61 ans, hémodialysé chronique par fistule huméro-céphalique gauche, doit subir une cure de hernie élective. Sa dernière dialyse date de trois jours en raison d’un problème de transport. Il se dit dyspnéique et pèse 3,5 kg au-dessus de son poids sec.",
    questions: [
      qcm(
        "Quelles données initiales imposent de reconsidérer le calendrier ?",
        ["b00119", "b00120", "b00124"],
        "Dialyse ancienne, surcharge et possible trouble ionique rendent une chirurgie élective dangereuse avant optimisation.",
        [
          T(
            "La dialyse remonte à trois jours.",
            "L’intervalle augmente le risque d’accumulation de potassium, acides et volume.",
          ),
          T(
            "Le poids dépasse le poids sec de 3,5 kg.",
            "Cet écart suggère une surcharge hydrosodée cliniquement significative.",
          ),
          T(
            "Une dyspnée est présente.",
            "Elle peut traduire une congestion pulmonaire liée à la surcharge.",
          ),
          F(
            "La fistule fonctionnelle supprime tout risque métabolique.",
            "L’accès permet la dialyse mais ne remplace pas une séance manquée.",
          ),
          F(
            "Le caractère électif impose d’opérer aujourd’hui.",
            "Un geste non urgent peut être reporté afin de corriger des facteurs majeurs.",
          ),
        ],
      ),
      qcm(
        "Quelles conséquences peut avoir cette kaliémie ?",
        ["b00051", "b00124"],
        "Une hyperkaliémie à 6,2 mmol/L expose à des anomalies ECG et rend l’induction élective inacceptable sans traitement.",
        [
          T(
            "Des troubles de conduction peuvent apparaître.",
            "Le potentiel de membrane devient anormal et ralentit la propagation cardiaque.",
          ),
          T(
            "Une arythmie ventriculaire est possible.",
            "Une hyperkaliémie importante peut conduire à une tachyarythmie ou un arrêt.",
          ),
          T(
            "La succinylcholine doit être évitée.",
            "Le seuil de sécurité cité en maladie rénale est inférieur à 5,5 mmol/L.",
          ),
          F(
            "La valeur est normale chez tout dialysé.",
            "L’adaptation chronique ne supprime pas le risque électrique d’une kaliémie élevée.",
          ),
          T(
            "Un ECG doit être obtenu rapidement.",
            "Le tracé recherche des signes de gravité qui modifient l’urgence du traitement.",
          ),
        ],
        "Le bilan retrouve un potassium à 6,2 mmol/L et une acidose métabolique modérée.",
      ),
      qcm(
        "Quelle stratégie est la plus adaptée avant le geste ?",
        ["b00107", "b00120", "b00124"],
        "La chirurgie élective est reportée et une dialyse corrige volume, potassium et acidose.",
        [
          T(
            "Reporter la cure de hernie.",
            "Aucune urgence ne justifie d’exposer le patient à l’induction dans cet état.",
          ),
          T(
            "Organiser une hémodialyse avant reprogrammation.",
            "La séance retire potassium, acides et excès de volume de manière efficace.",
          ),
          T(
            "Réévaluer les ions après la dialyse.",
            "Le contrôle confirme l’efficacité et l’absence de rebond significatif.",
          ),
          F(
            "Corriger uniquement par un litre de NaCl 0,9 %.",
            "Le patient est déjà en surcharge et le soluté n’élimine pas le potassium.",
          ),
          F(
            "Poursuivre en comptant sur l’anesthésie pour dialyser.",
            "L’anesthésie ne remplace aucune fonction d’épuration extracorporelle.",
          ),
        ],
        "Le chirurgien confirme que la hernie n’est ni étranglée ni douloureuse et accepte un report.",
      ),
      qcm(
        "Quelles précautions protègent la fistule ?",
        ["b00124", "b00128"],
        "La fistule gauche est identifiée et soustraite aux ponctions, pressions et compressions pendant toute la trajectoire.",
        [
          T(
            "Placer le brassard sur le bras droit.",
            "Le membre controlatéral évite les compressions répétées de l’accès.",
          ),
          T(
            "Interdire les voies veineuses sur le bras gauche.",
            "Une ponction risque hématome, infection et perte du capital vasculaire.",
          ),
          T(
            "Vérifier le thrill avant et après l’intervention.",
            "Cette vibration confirme la persistance d’un débit dans la fistule.",
          ),
          F(
            "Fixer le bras gauche sous le thorax.",
            "Une compression prolongée peut thromboser l’accès de dialyse.",
          ),
          F(
            "Prélever le bilan directement dans la fistule.",
            "L’accès n’est manipulé que par l’équipe entraînée de dialyse.",
          ),
        ],
        "Après dialyse, le potassium est à 4,8 mmol/L, le patient est au poids sec et la fistule présente un thrill normal.",
      ),
      qcm(
        "Quels choix anesthésiques sont cohérents ?",
        ["b00074", "b00079", "b00080", "b00081"],
        "Le plan privilégie agents prévisibles, monitorage du bloc et opioïdes sans métabolite actif accumulé.",
        [
          T(
            "Utiliser un agent volatil moderne.",
            "Son élimination pulmonaire dépend peu de la fonction rénale.",
          ),
          T(
            "Choisir fentanyl ou rémifentanil en titration.",
            "Ces opioïdes n’accumulent pas de métabolite rénal actif majeur.",
          ),
          T(
            "Utiliser le cisatracurium si une curarisation est nécessaire.",
            "L’élimination de Hofmann offre une durée plus prévisible en IRT.",
          ),
          F(
            "Planifier une forte dose de morphine prolongée.",
            "La M6G s’accumule et expose à une dépression respiratoire tardive.",
          ),
          F(
            "Compter systématiquement sur le sugammadex.",
            "Son usage n’est pas recommandé chez le dialysé du fait de l’élimination rénale.",
          ),
        ],
        "Une anesthésie générale courte est retenue car la chirurgie ne se prête pas à une technique locale seule.",
      ),
      qcm(
        "Quel soluté d’entretien peut être envisagé ?",
        ["b00122", "b00123"],
        "Un faible volume de soluté balancé est acceptable ; le NaCl 0,9 % n’est pas protecteur du potassium en raison de l’acidose.",
        [
          T(
            "Un soluté balancé en quantité titrée.",
            "Le faible potassium contenu n’augmente pas significativement la kaliémie en pratique.",
          ),
          T(
            "Eviter une charge chlorée massive.",
            "L’acidose hyperchlorémique peut faire sortir le potassium des cellules.",
          ),
          T(
            "Limiter les apports au besoin hémodynamique réel.",
            "Le patient anurique ne peut éliminer rapidement un excès liquidien.",
          ),
          F(
            "Perfuser plusieurs litres pour forcer une diurèse.",
            "L’IRT ne répond pas à cette stratégie et la surcharge menacerait les poumons.",
          ),
          F(
            "Considérer tout soluté contenant du potassium comme absolument interdit.",
            "Les solutions balancées augmentent peu la kaliémie et évitent l’acidose chlorée.",
          ),
        ],
        "Le patient est anurique, hémodynamiquement stable et ne présente plus aucun signe de surcharge.",
      ),
      qcm(
        "Quelles surveillances organiser après l’intervention ?",
        ["b00121", "b00124"],
        "Le suivi porte sur potassium, volume, douleur, bloc résiduel et maintien de l’accès, avec reprise du programme de dialyse.",
        [
          T(
            "Contrôler la kaliémie selon les apports et l’évolution.",
            "Un rebond ou une charge tissulaire peut réélever le potassium après la séance.",
          ),
          T(
            "Vérifier l’absence de curarisation résiduelle.",
            "Une durée prolongée expose à une hypoventilation et une faiblesse postopératoire.",
          ),
          T(
            "Réexaminer la fistule.",
            "La présence du thrill confirme qu’aucune compression ou thrombose n’est survenue.",
          ),
          T(
            "Planifier la prochaine dialyse avec la néphrologie.",
            "La continuité du programme contrôle volume, ions et élimination de certains médicaments.",
          ),
          F(
            "Autoriser les AINS sans restriction.",
            "Le terrain rénal et les effets systémiques rendent ce choix antalgique inadapté.",
          ),
        ],
        "La chirurgie se termine sans hypotension ni saignement ; le patient reste en observation pour la première nuit.",
      ),
    ],
  },
  {
    title: "Syndrome RTUP progressif",
    vignette:
      "Le patient Daniel P., 78 ans, doit subir une résection transurétrale de prostate pour obstruction symptomatique. Une anesthésie rachidienne avec niveau T10 est choisie afin de permettre une surveillance clinique. La natrémie initiale est à 139 mmol/L et la fonction cardiaque est conservée.",
    questions: [
      qcm(
        "Quels paramètres doivent être suivis pendant la RTUP ?",
        ["b00134", "b00136", "b00139"],
        "Durée, hauteur et volume d’irrigation, état neurologique et hémodynamique permettent de détecter l’absorption.",
        [
          T(
            "La durée depuis le début de la résection.",
            "Le risque d’absorption significative augmente lorsque le geste dépasse une heure.",
          ),
          T(
            "La hauteur des sacs d’irrigation.",
            "Une pression hydrostatique plus grande favorise le passage dans les sinus veineux.",
          ),
          T(
            "Le nombre de sacs utilisés.",
            "Un volume consommé important signale une exposition et un risque d’absorption accrus.",
          ),
          T(
            "L’état mental et la saturation.",
            "Les premiers signes du syndrome peuvent être neurologiques ou respiratoires.",
          ),
          F(
            "La couleur des murs de la salle.",
            "Cet élément n’a aucune relation avec le passage systémique de l’irrigation.",
          ),
        ],
      ),
      qcm(
        "Quels signes sont compatibles avec un début de syndrome RTUP ?",
        ["b00134", "b00139"],
        "La symptomatologie neurologique apparaissant après une longue irrigation doit faire suspecter une hyponatrémie de dilution.",
        [
          T(
            "Céphalée nouvelle.",
            "L’hypoosmolarité provoque un œdème cellulaire cérébral symptomatique.",
          ),
          T(
            "Agitation et confusion.",
            "Une dysfonction neurologique progressive constitue une alerte caractéristique.",
          ),
          T(
            "Nausées dans ce contexte prolongé.",
            "Elles peuvent accompagner l’hyponatrémie et la surcharge liquidienne.",
          ),
          F(
            "Amélioration nette de la vigilance.",
            "Une vigilance meilleure ne soutient pas l’hypothèse d’une encéphalopathie hypoosmolaire.",
          ),
          T(
            "Modification inexpliquée de la pression artérielle.",
            "L’absorption volémique et le trouble osmolaire peuvent déstabiliser la pression.",
          ),
        ],
        "Après soixante-quinze minutes, le patient se plaint de céphalées puis devient agité et nauséeux.",
      ),
      qcm(
        "Quelles actions immédiates sont justifiées ?",
        ["b00139", "b00140"],
        "La priorité est d’arrêter l’absorption, d’obtenir les bilans et de traiter les défaillances respiratoires ou circulatoires.",
        [
          T(
            "Demander l’arrêt de la résection et de l’irrigation.",
            "La source de liquide hypotonique doit être supprimée sans attendre la biologie.",
          ),
          T(
            "Prélever natrémie, osmolarité et hémoglobine.",
            "Le bilan quantifie le syndrome et recherche une hémorragie masquée par l’irrigation.",
          ),
          T(
            "Administrer de l’oxygène et surveiller l’ECG.",
            "Désaturation et arythmie peuvent compliquer les formes importantes.",
          ),
          F(
            "Augmenter la hauteur des sacs.",
            "Une pression supplémentaire accroît encore l’absorption systémique.",
          ),
          F(
            "Attendre la fin du programme opératoire avant d’agir.",
            "L’évolution neurologique peut devenir rapidement convulsive et mortelle.",
          ),
        ],
        "L’urologue annonce que de nombreux sinus sont ouverts et que neuf litres d’irrigation ont été utilisés.",
      ),
      qcm(
        "Comment interpréter la biologie ?",
        ["b00036", "b00139"],
        "Une baisse rapide de sodium à 121 mmol/L avec hypoosmolarité confirme une absorption importante proche du seuil sévère.",
        [
          T(
            "Il s’agit d’une hyponatrémie aiguë.",
            "Le sodium a chuté de 18 mmol/L pendant l’intervention.",
          ),
          T(
            "L’hypoosmolarité explique les signes neurologiques.",
            "L’eau entre dans les cellules cérébrales et provoque une encéphalopathie.",
          ),
          T(
            "La surcharge peut coexister avec l’hyponatrémie.",
            "Le liquide d’irrigation apporte simultanément eau libre et expansion volémique.",
          ),
          F(
            "La situation correspond à une hypernatrémie chronique.",
            "La concentration a diminué rapidement et non augmenté sur plusieurs jours.",
          ),
          F(
            "L’osmolarité élevée protège le cerveau.",
            "Le résultat est hypoosmolaire et favorise l’œdème cérébral.",
          ),
        ],
        "La natrémie revient à 121 mmol/L avec osmolarité plasmatique basse et hémoglobine modérément diminuée.",
      ),
      qcm(
        "Quelles mesures sont adaptées avant toute convulsion ?",
        ["b00139", "b00140"],
        "Une forme symptomatique sans coma impose arrêt de l’apport, restriction et traitement de surcharge sous surveillance rapprochée.",
        [
          T(
            "Restreindre les apports d’eau libre.",
            "Le patient a déjà absorbé une quantité importante de liquide hypotonique.",
          ),
          T(
            "Administrer du furosémide si la surcharge est significative.",
            "Une diurèse préservée permet d’éliminer eau et sodium sous contrôle.",
          ),
          T(
            "Répéter fréquemment la natrémie.",
            "La vitesse de correction et l’évolution neurologique guident la suite du traitement.",
          ),
          F(
            "Perfuser une grande quantité de glucose 5 %.",
            "Ce soluté apporte de l’eau libre et peut aggraver l’hypoosmolarité.",
          ),
          F(
            "Quitter la zone monitorée immédiatement.",
            "Une aggravation neurologique ou cardiovasculaire reste possible dans les minutes suivantes.",
          ),
        ],
        "Le patient reste agité, présente des crépitants discrets mais n’a encore ni convulsion ni coma.",
      ),
      qcm(
        "Quel traitement devient prioritaire ?",
        ["b00053", "b00139", "b00140"],
        "Une convulsion sur hyponatrémie aiguë impose des bolus de NaCl 3 % et un anticonvulsivant sous contrôle rapproché.",
        [
          T(
            "Administrer des bolus de NaCl hypertonique à 3 %.",
            "La gravité neurologique justifie une remontée contrôlée et rapide du sodium.",
          ),
          T(
            "Poursuivre jusqu’à amélioration clinique ou Na au moins 125 mmol/L.",
            "Ces repères limitent l’exposition tout en traitant l’œdème cérébral menaçant.",
          ),
          T(
            "Traiter la convulsion par une benzodiazépine adaptée.",
            "Le midazolam est cité pour interrompre et potentiellement prévenir les crises.",
          ),
          F(
            "Corriger instantanément la natrémie à 150 mmol/L.",
            "Une surcorrection extrême créerait un risque neurologique osmotique majeur.",
          ),
          F(
            "Administrer uniquement du NaCl 0,45 %.",
            "Une solution hypotonique ajouterait encore de l’eau libre au compartiment extracellulaire.",
          ),
        ],
        "Quelques minutes plus tard, une crise convulsive généralisée survient alors que la natrémie de contrôle est à 119 mmol/L.",
      ),
      qcm(
        "Quelles suites sont indispensables après stabilisation ?",
        ["b00139", "b00140"],
        "Le patient reste monitoré jusqu’à correction neurologique, respiratoire, sodée et hématologique stable.",
        [
          T(
            "Surveiller la vitesse de correction du sodium.",
            "Une remontée trop rapide après la phase urgente peut provoquer une démyélinisation osmotique.",
          ),
          T(
            "Contrôler l’état respiratoire et la surcharge.",
            "L’œdème pulmonaire peut persister au-delà de l’amélioration neurologique.",
          ),
          T(
            "Réévaluer l’hémoglobine.",
            "Le sang perdu dans l’irrigation peut avoir été sous-estimé pendant la résection.",
          ),
          T(
            "Documenter le volume d’irrigation et la chronologie.",
            "Ces informations expliquent le diagnostic et permettent l’analyse de l’événement.",
          ),
          F(
            "Autoriser une sortie immédiate après la première remontée du sodium.",
            "Une récidive convulsive ou une complication retardée impose une surveillance continue.",
          ),
        ],
        "Après les bolus, les convulsions cessent et le sodium atteint 125 mmol/L ; les crépitants persistent toutefois.",
      ),
    ],
  },
  {
    title: "RTU vésicale latérale",
    vignette:
      "La patiente Elsa M., 67 ans, doit subir une résection transurétrale d’une tumeur de la paroi latérale droite de la vessie. Elle n’a pas de coagulopathie, la fonction rénale est stable et l’intervention est annoncée comme courte. Une stimulation du nerf obturateur est redoutée.",
    questions: [
      qcm(
        "Pourquoi la localisation latérale modifie-t-elle le plan anesthésique ?",
        "b00144",
        "Le courant peut stimuler l’obturateur, provoquer une adduction brutale et pousser le résectoscope à travers la paroi.",
        [
          T(
            "Le nerf obturateur chemine près de la paroi latérale.",
            "La proximité rend la stimulation électrique possible pendant la résection.",
          ),
          T(
            "Une adduction brutale peut survenir.",
            "La contraction des adducteurs mobilise soudainement la cuisse malgré l’installation.",
          ),
          T(
            "Le mouvement augmente le risque de perforation.",
            "Le résectoscope peut pénétrer la paroi lorsque le bassin ou la jambe bouge.",
          ),
          F(
            "La localisation supprime toute interaction neuromusculaire.",
            "Elle crée au contraire l’interaction classique avec le nerf obturateur.",
          ),
          F(
            "La complication principale est une thrombose de fistule.",
            "Aucune fistule n’est décrite et le risque spécifique est vésical.",
          ),
        ],
      ),
      qcm(
        "Quelle anesthésie réduit le mieux ce risque ?",
        ["b00079", "b00144"],
        "Une anesthésie générale avec bloc neuromusculaire efficace empêche la contraction des adducteurs.",
        [
          T(
            "Anesthésie générale avec curarisation.",
            "Le bloc neuromusculaire supprime la réponse motrice à la stimulation obturatrice.",
          ),
          T(
            "Monitorage quantitatif du bloc.",
            "La profondeur de curarisation doit être suffisante pendant le temps de résection latérale.",
          ),
          F(
            "Sédation légère sans contrôle moteur.",
            "Une contraction brutale resterait possible sous simple sédation.",
          ),
          T(
            "Concertation explicite avec l’urologue avant l’incision.",
            "La localisation tumorale doit être connue pour anticiper le temps à risque.",
          ),
          F(
            "Absence de tout moyen de ventilation.",
            "Une anesthésie générale curarisée impose une ventilation contrôlée sûre.",
          ),
        ],
        "L’urologue confirme qu’une électrocautérisation profonde sera nécessaire sur la paroi latérale.",
      ),
      qcm(
        "Quels signes font suspecter une perforation ?",
        "b00143",
        "Une fuite d’irrigation hors de la vessie se manifeste par retour diminué, douleur, signes vagaux ou instabilité.",
        [
          T(
            "Un retour d’irrigation inférieur au volume injecté.",
            "Le liquide s’extravase dans les tissus au lieu de revenir par le circuit.",
          ),
          T(
            "Une douleur abdominale basse ou rétropubienne.",
            "L’irritation pelvienne est caractéristique d’une perforation extrapéritonéale.",
          ),
          T(
            "Une bradycardie vagale inexpliquée.",
            "Une perforation importante peut stimuler le péritoine et déclencher un réflexe vagal.",
          ),
          T(
            "Une hypotension ou hypertension inhabituelle.",
            "Les formes significatives peuvent retentir sur l’hémodynamique.",
          ),
          F(
            "Une augmentation certaine du retour d’irrigation.",
            "La fuite diminue plutôt la quantité de liquide récupérée.",
          ),
        ],
        "Pendant la résection, le retour d’irrigation diminue brutalement et l’abdomen paraît plus tendu.",
      ),
      qcm(
        "Quelles actions sont prioritaires ?",
        ["b00142", "b00143"],
        "Il faut interrompre la résection, limiter l’irrigation et évaluer rapidement le type et le retentissement de la perforation.",
        [
          T(
            "Avertir immédiatement l’urologue.",
            "La progression du geste doit cesser pour ne pas agrandir la brèche.",
          ),
          T(
            "Arrêter ou réduire fortement l’irrigation.",
            "La poursuite de pression aggrave l’extravasation et la distension.",
          ),
          T(
            "Réévaluer pression, fréquence et abdomen.",
            "Le retentissement clinique distingue une fuite limitée d’une complication majeure.",
          ),
          F(
            "Augmenter la pression du sac pour restaurer le retour.",
            "Une pression supplémentaire force davantage de liquide à travers la perforation.",
          ),
          F(
            "Ignorer la discordance des volumes.",
            "La baisse de retour est l’un des signaux les plus utiles de perforation.",
          ),
        ],
        "La pression devient instable et une bradycardie à 42 par minute apparaît sans saignement important.",
      ),
      qcm(
        "Comment interpréter la bradycardie ?",
        ["b00053", "b00143"],
        "La bradycardie peut être vagale par irritation ou distension, mais les autres causes d’instabilité doivent être exclues.",
        [
          T(
            "Un mécanisme vagal est plausible.",
            "La stimulation péritonéale ou vésicale peut ralentir brutalement le rythme.",
          ),
          T(
            "La source chirurgicale doit être supprimée.",
            "Arrêter distension et manipulation constitue la première correction mécanistique.",
          ),
          T(
            "Une instabilité persistante justifie un traitement chronotrope.",
            "Une bradycardie mal tolérée doit être corrigée après l’arrêt du stimulus.",
          ),
          F(
            "Le phénomène confirme une hyperkaliémie certaine.",
            "Aucun dosage ni signe spécifique ne permet d’imposer ce diagnostic.",
          ),
          F(
            "La bradycardie prouve que la vessie est intacte.",
            "Elle est au contraire décrite lors de perforations significatives.",
          ),
        ],
        "L’irrigation est stoppée ; la fréquence remonte partiellement mais la douleur abdominale persiste au réveil.",
      ),
      qcm(
        "Quelle distinction anatomique influence la suite ?",
        "b00143",
        "Les perforations extrapéritonéales sont souvent limitées, tandis que les formes intrapéritonéales sont plus symptomatiques et instables.",
        [
          T(
            "Une perforation extrapéritonéale peut rester peu symptomatique.",
            "L’extravasation pelvienne limitée provoque souvent des signes locaux modérés.",
          ),
          T(
            "Une perforation intrapéritonéale peut donner une douleur généralisée.",
            "Le liquide irrite une grande surface péritonéale et distend l’abdomen.",
          ),
          T(
            "Une instabilité augmente la probabilité d’une forme importante.",
            "Hypotension, hypertension ou bradycardie accompagnent les perforations significatives.",
          ),
          F(
            "Les deux formes ont toujours une expression identique.",
            "L’extension anatomique conditionne intensité des symptômes et traitement.",
          ),
          F(
            "Aucune imagerie ne peut aider.",
            "Une imagerie ou une exploration permet de préciser fuite et distribution du liquide.",
          ),
        ],
        "L’imagerie retrouve une extravasation intrapéritonéale importante nécessitant une prise en charge chirurgicale.",
      ),
      qcm(
        "Quels éléments doivent être transmis en postopératoire ?",
        ["b00143", "b00144"],
        "La surveillance suit douleur, abdomen, hémodynamique, bilan liquidien et correction de la perforation avec traçabilité du réflexe.",
        [
          T(
            "Le volume d’irrigation non récupéré.",
            "Cette estimation renseigne sur la quantité potentiellement extravasée.",
          ),
          T(
            "La chronologie de la bradycardie et de la pression.",
            "Le lien avec la distension documente le retentissement physiologique.",
          ),
          T(
            "Le site tumoral latéral et le risque obturateur.",
            "Cette information explique la stratégie de curarisation et l’incident potentiel.",
          ),
          T(
            "Les constatations de l’imagerie et le traitement réalisé.",
            "L’équipe d’aval doit connaître l’extension et les gestes correcteurs.",
          ),
          F(
            "Aucune surveillance abdominale après réparation.",
            "Une fuite persistante, un iléus ou une instabilité peuvent se manifester secondairement.",
          ),
        ],
        "La perforation est réparée, la patiente retrouve une pression stable et doit être transférée en surveillance continue.",
      ),
    ],
  },
  {
    title: "Néphrectomie avec thrombus cave",
    vignette:
      "Le patient François K., 65 ans, présente une volumineuse tumeur rénale droite avec thrombus remontant dans la veine cave inférieure sous les veines hépatiques. Une néphrectomie ouverte en décubitus latéral est programmée. Le rein gauche assure environ 60 % de la fonction globale.",
    questions: [
      qcm(
        "Quels risques doivent être anticipés ?",
        ["b00155", "b00156", "b00157"],
        "La tumeur vascularisée et l’extension cave exposent à hémorragie, instabilité et embolisation du thrombus.",
        [
          T(
            "Une hémorragie massive.",
            "Les tumeurs volumineuses peuvent être très vascularisées et la dissection cave est à haut risque.",
          ),
          T(
            "Une embolisation du thrombus.",
            "La mobilisation veineuse peut détacher une portion et obstruer la circulation pulmonaire.",
          ),
          T(
            "Une diminution du retour veineux lors du contrôle cave.",
            "La manipulation ou le clampage de la VCI réduit la précharge cardiaque.",
          ),
          T(
            "Une baisse postopératoire de la fonction rénale.",
            "Le retrait d’un rein diminue la masse néphronique et sollicite le rein restant.",
          ),
          F(
            "Une absence garantie de douleur pariétale.",
            "L’incision sous-costale ou du flanc est au contraire souvent très douloureuse.",
          ),
        ],
      ),
      qcm(
        "Quels moyens préparer avant l’induction ?",
        ["b00151", "b00157"],
        "Une chirurgie hémorragique avec variations rapides justifie accès de gros calibre, pression invasive et produits sanguins disponibles.",
        [
          T(
            "Plusieurs accès veineux fiables de gros calibre.",
            "Ils permettent transfusion et remplissage rapide si une veine majeure est ouverte.",
          ),
          T(
            "Un cathéter artériel avant la phase à risque.",
            "La mesure battement par battement détecte immédiatement une chute de pression.",
          ),
          T(
            "Une stratégie transfusionnelle préparée.",
            "Groupage, compatibilité et disponibilité évitent un délai pendant l’hémorragie.",
          ),
          F(
            "Aucun moyen de réchauffement.",
            "Une longue chirurgie et la transfusion exposent à une hypothermie et une coagulopathie.",
          ),
          T(
            "Une coordination explicite lors de la manipulation du thrombus.",
            "L’équipe doit annoncer les temps de contrôle cave et le risque embolique.",
          ),
        ],
        "L’imagerie montre aussi une tumeur très vascularisée et le chirurgien estime une perte possible de plusieurs litres.",
      ),
      qcm(
        "Quels points de positionnement sont importants ?",
        "b00155",
        "Le décubitus latéral exige alignement, protection des appuis, liberté ventilatoire et absence de compression du rein restant.",
        [
          T(
            "Protéger les points d’appui et le plexus brachial.",
            "La durée et la traction peuvent provoquer neuropathie ou lésion cutanée.",
          ),
          T(
            "Vérifier la ventilation après la mise en position.",
            "Le décubitus latéral modifie compliance, rapports ventilation-perfusion et position de la sonde.",
          ),
          T(
            "Eviter une compression abdominale excessive.",
            "Une pression inutile compromet retour veineux et perfusion du rein restant.",
          ),
          F(
            "Laisser le bras déclive sans support.",
            "Cette position expose à une traction nerveuse et une compression vasculaire.",
          ),
          F(
            "Considérer le positionnement comme sans effet hémodynamique.",
            "Le retour veineux et la ventilation peuvent changer après l’installation.",
          ),
        ],
        "Après induction, le patient est installé en décubitus latéral gauche pour exposer le flanc droit.",
      ),
      qcm(
        "Comment interpréter cette hypotension brutale ?",
        ["b00156", "b00157"],
        "Pendant la dissection cave, une baisse de retour ou une hémorragie doit être supposée jusqu’à preuve du contraire.",
        [
          T(
            "Une ouverture veineuse peut provoquer une hémorragie rapide.",
            "La VCI et les collatérales peuvent perdre un volume important en quelques instants.",
          ),
          T(
            "Une obstruction ou un clampage de la VCI diminue la précharge.",
            "Le retour veineux des membres inférieurs ne rejoint plus normalement le cœur.",
          ),
          T(
            "Une embolie du thrombus doit être envisagée.",
            "Une obstruction pulmonaire aiguë peut donner hypotension et défaillance droite.",
          ),
          F(
            "Il faut attendre plusieurs minutes avant d’alerter le chirurgien.",
            "La correction exige une communication immédiate sur le temps opératoire en cours.",
          ),
          F(
            "La pression invasive est inutile pendant cet épisode.",
            "La mesure continue guide la réanimation et objecte la réponse aux gestes correcteurs.",
          ),
        ],
        "Pendant la mobilisation du thrombus, la PAM chute à 45 mmHg et le champ se remplit soudainement de sang.",
      ),
      qcm(
        "Quelles mesures sont prioritaires pendant l’hémorragie ?",
        ["b00095", "b00157"],
        "Le contrôle chirurgical, la transfusion guidée et la restauration de pression protègent simultanément cerveau, cœur et rein restant.",
        [
          T(
            "Obtenir un contrôle chirurgical immédiat de la source.",
            "Aucun soluté ne peut compenser durablement une veine majeure encore ouverte.",
          ),
          T(
            "Activer la transfusion préparée.",
            "Les pertes rapides exigent globules et correction de l’hémostase selon le bilan.",
          ),
          T(
            "Maintenir une pression compatible avec la perfusion rénale.",
            "Une hypotension prolongée menace la médulla et le rein qui restera fonctionnel.",
          ),
          T(
            "Prévenir hypothermie, acidose et coagulopathie.",
            "Ces trois facteurs entretiennent le saignement et aggravent la défaillance d’organes.",
          ),
          F(
            "Forcer uniquement une diurèse par furosémide.",
            "Le diurétique ne restaure ni le volume sanguin perdu ni la pression de filtration.",
          ),
        ],
        "Le chirurgien contrôle la VCI après une perte estimée à 1 800 mL ; la pression remonte sous transfusion.",
      ),
      qcm(
        "Quels principes d’analgésie s’appliquent ?",
        ["b00079", "b00158"],
        "L’incision ouverte justifie une analgésie forte, mais la technique neuraxiale et les opioïdes dépendent de l’hémostase et du DFG.",
        [
          T(
            "Une péridurale peut être utile si l’hémostase est compatible.",
            "Le contrôle de douleur sous-costale favorise ventilation profonde et mobilisation.",
          ),
          T(
            "Reporter l’activation des anesthésiques locaux après la phase hémorragique.",
            "Une sympathectomie pendant les pertes peut aggraver une hypotension difficile.",
          ),
          T(
            "Préférer un opioïde sans métabolite actif rénal majeur.",
            "La fonction diminuée après néphrectomie augmente le risque d’accumulation.",
          ),
          F(
            "Utiliser de la mépéridine répétée.",
            "La normépéridine neurotoxique peut s’accumuler si le DFG baisse.",
          ),
          F(
            "Considérer cette incision comme indolore.",
            "La douleur sous-costale est importante et peut altérer la fonction respiratoire.",
          ),
        ],
        "L’hémostase est obtenue, mais le bilan montre une coagulopathie transitoire et le rein gauche doit désormais assurer toute la fonction.",
      ),
      qcm(
        "Quelles surveillances protègent le rein restant ?",
        ["b00159", "b00089", "b00095"],
        "Le suivi associe pression, VCE, diurèse, créatinine, ions et retrait des néphrotoxiques sans surcharger le patient.",
        [
          T(
            "Maintenir une pression artérielle adéquate.",
            "Le rein unique doit conserver une perfusion suffisante pendant la phase de récupération.",
          ),
          T(
            "Suivre la cinétique de créatinine.",
            "Une hausse rapide permet de diagnostiquer précocement une IRA postopératoire.",
          ),
          T(
            "Surveiller diurèse et bilan hydrique sans viser un chiffre isolé.",
            "La tendance renseigne mais doit rester confrontée au VCE et à la fonction biologique.",
          ),
          T(
            "Eviter les AINS postopératoires.",
            "La suppression de dilatation afférente serait dangereuse pour le rein restant.",
          ),
          F(
            "Tolérer une hypotension prolongée puisque l’autre rein a été retiré.",
            "La perte de réserve rend au contraire la protection hémodynamique encore plus importante.",
          ),
        ],
        "En soins continus, la diurèse est modérée et la créatinine augmente légèrement dans les premières heures.",
      ),
    ],
  },
  {
    title: "Transplantation et oligurie du greffon",
    vignette:
      "La patiente Gisèle W., 55 ans, dialysée pour polykystose rénale, reçoit un greffon provenant d’un donneur décédé. Elle a été dialysée la veille, pèse son poids sec et sa kaliémie est à 4,7 mmol/L. L’anesthésie générale est planifiée avec implantation iliaque.",
    questions: [
      qcm(
        "Quels objectifs initiaux sont pertinents ?",
        ["b00169", "b00171", "b00172"],
        "La préparation d’IRT reste applicable et vise un VCE suffisant, une pression adaptée et une pharmacologie prévisible.",
        [
          T(
            "Protéger l’accès de dialyse.",
            "La fistule reste indispensable tant que la fonction du greffon n’est pas durablement établie.",
          ),
          T(
            "Vérifier poids sec et potassium.",
            "Ces données confirment l’optimisation volumique et ionique avant l’implantation.",
          ),
          T(
            "Préparer le protocole d’immunosuppression.",
            "Les traitements doivent être administrés selon la chronologie de transplantation.",
          ),
          T(
            "Planifier une PAM compatible avec la perfusion du greffon.",
            "Une cible anticipée permet de réagir rapidement au déclampage.",
          ),
          F(
            "Retirer systématiquement les reins natifs.",
            "Ils restent habituellement en place pendant l’implantation standard.",
          ),
        ],
      ),
      qcm(
        "Quelles étapes techniques sont attendues ?",
        "b00169",
        "Le greffon est raccordé aux vaisseaux iliaques puis son uretère à la vessie avant fermeture.",
        [
          T(
            "Anastomose de la veine rénale à la veine iliaque externe.",
            "Ce raccord assure le drainage veineux du greffon dans le réseau pelvien.",
          ),
          T(
            "Anastomose de l’artère rénale à l’artère iliaque externe.",
            "La levée du clamp permet ensuite la perfusion du nouveau rein.",
          ),
          T(
            "Raccord de l’uretère du greffon à la vessie.",
            "Cette étape crée la voie d’évacuation de l’urine produite.",
          ),
          F(
            "Ablation obligatoire des deux reins natifs.",
            "La procédure décrite laisse les reins d’origine en place.",
          ),
          F(
            "Implantation habituelle dans le thorax.",
            "Le greffon est placé dans une fosse iliaque du quadrant abdominal inférieur.",
          ),
        ],
        "L’équipe commence l’anastomose veineuse puis prépare le raccord artériel sur les vaisseaux iliaques externes.",
      ),
      qcm(
        "Quels paramètres optimiser avant le déclampage ?",
        ["b00122", "b00123", "b00172"],
        "Avant reperfusion, VCE, PAM, potassium et traitement vasoactif sont préparés pour perfuser le greffon sans surcharge.",
        [
          T(
            "Un VCE jugé satisfaisant.",
            "Une précharge adéquate soutient le débit dans le lit vasculaire nouvellement ouvert.",
          ),
          T(
            "Une PAM proche de la cible de 70 à 90 mmHg.",
            "Cette pression est recommandée chez la plupart des receveurs au moment de la reperfusion.",
          ),
          T(
            "Une mesure récente du potassium.",
            "La solution de conservation peut ajouter une charge potassique au déclampage.",
          ),
          T(
            "Un vasopresseur titrable disponible.",
            "Une baisse de pression peut nécessiter un soutien rapide après optimisation du volume.",
          ),
          F(
            "Une hypovolémie volontaire pour prévenir la diurèse.",
            "Un VCE insuffisant compromet directement la perfusion et la reprise du greffon.",
          ),
        ],
        "La PAM est à 68 mmHg, l’échographie ne montre pas de surcharge et le chirurgien annonce un déclampage dans cinq minutes.",
      ),
      qcm(
        "Comment gérer cette baisse de pression ?",
        ["b00123", "b00172"],
        "La correction associe réévaluation du VCE et petites doses de vasopresseur pour restaurer rapidement la perfusion du greffon.",
        [
          T(
            "Administrer un vasopresseur titré si le VCE est suffisant.",
            "Une faible dose restaure la PAM sans imposer une charge liquidienne excessive.",
          ),
          T(
            "Vérifier l’absence d’hémorragie ou d’obstacle au retour.",
            "Une cause mécanique doit être corrigée plutôt que masquée par les médicaments.",
          ),
          T(
            "Maintenir la cible plutôt que tolérer 48 mmHg.",
            "Une faible pression après reperfusion expose le greffon à une hypoperfusion immédiate.",
          ),
          F(
            "Perfuser aveuglément plusieurs litres.",
            "Une surcharge peut provoquer un œdème pulmonaire sans améliorer la fonction du greffon.",
          ),
          F(
            "Considérer que la pression n’influence pas le nouveau rein.",
            "La perfusion du greffon dépend directement du gradient artériel disponible.",
          ),
        ],
        "A la reperfusion, la PAM chute à 48 mmHg alors que le champ reste sec et le VCE paraît encore satisfaisant.",
      ),
      qcm(
        "Quels risques explique cette hyperkaliémie ?",
        ["b00173", "b00174", "b00051"],
        "Le potassium de la solution de conservation peut rejoindre brutalement la circulation et provoquer des anomalies électriques.",
        [
          T(
            "La solution de conservation est une source plausible.",
            "Elle contient une quantité non négligeable de potassium libéré à la reperfusion.",
          ),
          T(
            "Une anomalie ECG peut précéder l’arythmie.",
            "Les ondes T et la conduction se modifient lorsque le potassium extracellulaire augmente.",
          ),
          T(
            "Une prise en charge rapide est nécessaire si le tracé change.",
            "Le calcium stabilise la membrane tandis que d’autres mesures transfèrent ou éliminent le potassium.",
          ),
          F(
            "Le déclampage ne peut jamais modifier la kaliémie.",
            "La charge de la solution de conservation rend cette complication prévisible.",
          ),
          F(
            "Une hyperkaliémie sévère est sans effet cardiaque.",
            "Elle expose à des troubles de conduction et à un arrêt cardiaque.",
          ),
        ],
        "Quelques minutes après le déclampage, le potassium passe à 5,9 mmol/L et l’onde T devient plus ample.",
      ),
      qcm(
        "Comment interpréter l’absence de diurèse immédiate ?",
        "b00175",
        "Une oligurie initiale peut être un retard de fonction, mais il faut d’abord exclure perfusion insuffisante et complication vasculaire.",
        [
          T(
            "Elle ne prouve pas à elle seule une hypovolémie.",
            "Certains greffons reprennent tardivement malgré un volume et une pression adéquats.",
          ),
          T(
            "Une thrombose artérielle doit être recherchée.",
            "L’occlusion prive le greffon de perfusion et constitue une urgence de sauvetage.",
          ),
          T(
            "Une thrombose veineuse peut aussi réduire la fonction.",
            "L’obstacle au drainage augmente la pression et compromet le flux intrarénal.",
          ),
          T(
            "Un hématome compressif est un diagnostic possible.",
            "Une collection autour du greffon peut altérer les vaisseaux ou l’uretère.",
          ),
          F(
            "Il faut conclure immédiatement au rejet chronique.",
            "Le délai et le contexte imposent d’abord les causes périopératoires aiguës.",
          ),
        ],
        "Malgré une PAM restaurée à 78 mmHg et un VCE correct, aucune urine n’apparaît dans l’heure suivant la reperfusion.",
      ),
      qcm(
        "Quelle conduite est adaptée avant d’ajouter du volume ?",
        ["b00175", "b00176"],
        "Une échographie Doppler recherche flux et collections ; le remplissage n’est justifié que si une déplétion est objectivée.",
        [
          T(
            "Réaliser une échographie du greffon.",
            "L’examen montre perfusion artérielle, drainage veineux et collections périrénales.",
          ),
          T(
            "Contrôler la perméabilité de la sonde urinaire.",
            "Un obstacle distal simple peut simuler une absence de production.",
          ),
          T(
            "Maintenir la pression de perfusion pendant l’investigation.",
            "Le diagnostic ne doit pas s’accompagner d’une nouvelle hypoperfusion du greffon.",
          ),
          F(
            "Injecter des litres jusqu’à apparition d’urines.",
            "Une surcharge ne corrige ni thrombose ni retard de fonction et menace les poumons.",
          ),
          F(
            "Retirer toute surveillance biologique.",
            "Potassium, acidose et créatinine restent pertinents tant que le greffon ne fonctionne pas.",
          ),
        ],
        "La patiente est déjà à l’équilibre liquidien et commence à présenter des crépitants après plusieurs apports.",
      ),
    ],
  },
  {
    title: "Sepsis sur calcul obstructif",
    vignette:
      "Le patient Henri S., 58 ans, est admis pour fièvre à 40 °C, douleur lombaire droite, hypotension et confusion. Le scanner montre un calcul urétéral obstructif avec dilatation des cavités. Une antibiothérapie est débutée et l’urologue demande un drainage urgent sous anesthésie.",
    questions: [
      qcm(
        "Quels éléments rendent le drainage urgent ?",
        ["b00058", "b00148"],
        "L’association infection, choc et obstacle à haute pression impose un contrôle rapide de la source.",
        [
          T(
            "La dilatation traduit une obstruction des voies hautes.",
            "Une pression accrue dans l’espace de Bowman diminue la filtration et aggrave l’IRA.",
          ),
          T(
            "L’hypotension indique une atteinte systémique grave.",
            "Le choc septique compromet la perfusion rénale et le pronostic vital.",
          ),
          T(
            "Les antibiotiques seuls ne lèvent pas l’obstacle.",
            "La source infectée sous pression nécessite un drainage mécanique.",
          ),
          T(
            "La confusion est un signe de dysfonction d’organe.",
            "Une encéphalopathie septique traduit la gravité du tableau.",
          ),
          F(
            "L’absence de douleur thoracique autorise un report prolongé.",
            "Le pronostic est dominé par le sepsis urinaire obstructif, indépendamment d’une douleur coronaire.",
          ),
        ],
      ),
      qcm(
        "Quelles options de drainage sont possibles ?",
        "b00148",
        "Une sonde double J par voie naturelle ou une néphrostomie percutanée décomprime les cavités selon anatomie et coagulation.",
        [
          T(
            "Une sonde urétérale double J.",
            "Le dispositif franchit l’obstacle et permet l’écoulement vers la vessie.",
          ),
          T(
            "Une néphrostomie percutanée.",
            "Le drainage direct du bassinet est possible lorsque les cavités sont dilatées.",
          ),
          T(
            "Le choix dépend notamment de la coagulation.",
            "La voie percutanée devient dangereuse en cas de coagulopathie non corrigée.",
          ),
          F(
            "Une prostatectomie radicale immédiate.",
            "Ce geste n’a aucune indication dans un calcul urétéral infecté.",
          ),
          F(
            "Une simple observation sans drainage.",
            "L’obstacle entretient le foyer et l’instabilité septique.",
          ),
        ],
        "L’imagerie confirme une dilatation importante, mais le bilan d’hémostase montre une coagulopathie modérée.",
      ),
      qcm(
        "Quels objectifs précèdent l’induction ?",
        ["b00090", "b00095", "b00123"],
        "Une réanimation courte optimise oxygénation, VCE et pression sans retarder le contrôle de source.",
        [
          T(
            "Corriger une hypovolémie par apports titrés.",
            "Le sepsis diminue le VCE efficace et la perfusion glomérulaire.",
          ),
          T(
            "Débuter un vasopresseur si la pression reste basse après volume.",
            "Une vasoplégie persistante exige un soutien pour restaurer la perfusion des organes.",
          ),
          T(
            "Poursuivre une antibiothérapie adaptée.",
            "Le drainage contrôle la source mais ne remplace pas le traitement antimicrobien systémique.",
          ),
          T(
            "Préparer une induction hémodynamiquement titrée.",
            "Les hypnotiques peuvent précipiter un collapsus chez un patient déjà vasoplégique.",
          ),
          F(
            "Retarder le drainage jusqu’à normalisation complète de tous les bilans.",
            "Une optimisation interminable laisse persister la source et aggrave le choc.",
          ),
        ],
        "Après 1 000 mL de cristalloïde balancé, la PAM reste à 55 mmHg et le lactate est élevé.",
      ),
      qcm(
        "Pourquoi l’état peut-il s’aggraver pendant le drainage ?",
        "b00148",
        "La manipulation d’urines infectées sous pression peut provoquer une bactériémie brutale et accentuer la vasoplégie.",
        [
          T(
            "Des bactéries peuvent être libérées dans le sang.",
            "Le franchissement et la décompression mobilisent le contenu infecté des cavités.",
          ),
          T(
            "La vasoplégie peut augmenter.",
            "La réponse inflammatoire systémique s’intensifie lors de la bactériémie.",
          ),
          T(
            "Un besoin accru de vasopresseur est possible.",
            "La baisse des résistances nécessite un soutien plus important pour conserver la PAM.",
          ),
          F(
            "Le drainage garantit une stabilité immédiate.",
            "Une dégradation transitoire pendant et dans les premières heures est décrite.",
          ),
          F(
            "L’antibiotique supprime tout risque de bactériémie.",
            "La charge infectieuse et la manipulation peuvent dépasser la protection initiale.",
          ),
        ],
        "Lors du passage de la sonde double J, la pression chute brutalement et le besoin en noradrénaline double.",
      ),
      qcm(
        "Quelles mesures guident la stabilisation ?",
        ["b00092", "b00095"],
        "Le traitement combine contrôle de source, antibiothérapie, pression, oxygénation et suivi des complications rénales et métaboliques.",
        [
          T(
            "Confirmer la perméabilité du drainage.",
            "Une décompression efficace est nécessaire pour obtenir le contrôle de source.",
          ),
          T(
            "Titrer le vasopresseur vers une PAM adaptée.",
            "Le soutien maintient perfusion rénale et cérébrale pendant la vasoplégie.",
          ),
          T(
            "Réévaluer lactate, diurèse et perfusion périphérique.",
            "La tendance de ces paramètres mesure la réponse globale à la réanimation.",
          ),
          T(
            "Adapter l’antibiothérapie aux prélèvements.",
            "Une documentation microbiologique permet une couverture efficace puis ciblée.",
          ),
          F(
            "Administrer un AINS pour protéger le rein.",
            "L’inhibition des prostaglandines aggrave l’autorégulation dans le choc.",
          ),
        ],
        "La sonde draine une urine purulente ; des prélèvements sont envoyés et le patient reste intubé.",
      ),
      qcm(
        "Comment diagnostiquer une IRA associée ?",
        ["b00089", "b00090"],
        "Le diagnostic utilise cinétique de créatinine et oligurie, tandis que le mécanisme associe prérénal, sepsis et obstacle.",
        [
          T(
            "Comparer la créatinine à une valeur basale.",
            "Une hausse absolue ou relative dans les fenêtres KDIGO permet de poser le diagnostic.",
          ),
          T(
            "Mesurer la diurèse en mL/kg/h et sa durée.",
            "Le critère urinaire exige moins de 0,5 mL/kg/h pendant plus de six heures.",
          ),
          T(
            "Reconnaître une origine probablement multifactorielle.",
            "Hypoperfusion, inflammation septique et obstruction ont pu agir simultanément.",
          ),
          F(
            "Une diurèse après drainage exclut toute lésion.",
            "Une atteinte intrinsèque peut persister malgré la levée de l’obstacle.",
          ),
          F(
            "Une seule valeur de créatinine indique la durée exacte de l’atteinte.",
            "La cinétique et l’historique sont indispensables pour dater la dégradation.",
          ),
        ],
        "A douze heures, la diurèse reste à 0,3 mL/kg/h et la créatinine a augmenté de 40 µmol/L.",
      ),
      qcm(
        "Quelles complications doivent faire discuter une dialyse ?",
        ["b00107", "b00109"],
        "La suppléance est discutée si hyperkaliémie, acidose, surcharge, anurie ou urémie restent réfractaires au traitement.",
        [
          T(
            "Une hyperkaliémie menaçante persistante.",
            "La dialyse élimine le potassium lorsque calcium, insuline-glucose et autres mesures ne suffisent pas.",
          ),
          T(
            "Une acidose sévère réfractaire.",
            "Une acidémie prolongée altère fonction cardiovasculaire et réponse aux catécholamines.",
          ),
          T(
            "Un œdème pulmonaire ne répondant pas au traitement.",
            "L’ultrafiltration retire le volume lorsqu’une diurèse efficace ne peut être obtenue.",
          ),
          T(
            "Une péricardite ou encéphalopathie urémique.",
            "Ces complications d’accumulation toxique sont des indications classiques de suppléance.",
          ),
          F(
            "Une créatinine isolée sans retentissement.",
            "Aucun seuil unique ne remplace l’évaluation des complications et de leur réponse.",
          ),
        ],
        "Malgré la stabilisation du choc, le potassium monte à 6,4 mmol/L et l’acidose s’aggrave sous traitement médical.",
      ),
    ],
  },
];
function buildDpQcm() {
  return DP_QCM.map((s, i) => ({
    label: `DP QCM ${i + 1} · ${s.title}`,
    allowed_voies: ["interne"],
    vignette: s.vignette,
    questions: s.questions,
  }));
}

const qroc = (
  enonce,
  reponse_attendue,
  sourceBlocks,
  correction_generale,
  newInformation = null,
) => ({
  format: "qroc",
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  reponse_attendue,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
});

const ISOLATED_QROC = [
  {
    title: "Physiologie rénale",
    questions: [
      qroc(
        "Quel pourcentage du débit cardiaque les reins reçoivent-ils au repos ?",
        "20 à 25 %|environ un quart du débit cardiaque",
        ["b00014", "b00016"],
        "Le débit sanguin rénal très élevé soutient filtration, régulation hydroélectrolytique et fonctions endocrines.",
      ),
      qroc(
        "Quelle pression détermine directement la filtration glomérulaire ?",
        "la pression nette de filtration|le gradient transcapillaire glomérulaire",
        ["b00023", "b00025"],
        "Elle résulte de l’équilibre entre pression hydrostatique capillaire et forces opposées dans Bowman et le plasma.",
      ),
      qroc(
        "Quel segment du néphron réabsorbe la plus grande part du filtrat ?",
        "le tubule proximal|tube contourné proximal",
        ["b00026", "b00027"],
        "Le tubule proximal récupère la majorité de l’eau, du sodium, du bicarbonate et des nutriments filtrés.",
      ),
      qroc(
        "Dans quelle plage de pression l’autorégulation rénale maintient-elle habituellement le débit ?",
        "PAM 80 à 180 mmHg|80-180 mmHg",
        ["b00028", "b00030"],
        "Dans cette plage, réponse myogène et rétrocontrôle tubuloglomérulaire stabilisent débit rénal et DFG.",
      ),
      qroc(
        "Quelle hormone augmente directement la perméabilité du tube collecteur à l’eau ?",
        "ADH|vasopressine|hormone antidiurétique",
        ["b00032", "b00033"],
        "L’ADH recrute les aquaporines du collecteur et concentre l’urine en réponse à l’osmolarité et au volume.",
      ),
    ],
  },
  {
    title: "Evaluation et équilibre",
    questions: [
      qroc(
        "Quelle mesure reste la référence pratique de filtration malgré ses limites ?",
        "la créatinine sérique|créatininémie",
        ["b00041", "b00042"],
        "La créatinine varie avec masse musculaire et sécrétion tubulaire ; sa cinétique importe plus qu’une valeur isolée.",
      ),
      qroc(
        "Quelle formule estime la clairance de créatinine pour ajuster de nombreux médicaments ?",
        "Cockcroft-Gault|formule de Cockcroft et Gault",
        ["b00043", "b00044"],
        "Cockcroft-Gault intègre âge, poids, sexe et créatinine, avec prudence aux extrêmes de morphologie.",
      ),
      qroc(
        "Quel ion est le principal déterminant de l’osmolarité extracellulaire ?",
        "le sodium|Na+",
        ["b00036", "b00039"],
        "Le sodium et ses anions associés déterminent l’osmolarité efficace et la distribution de l’eau extracellulaire.",
      ),
      qroc(
        "Quel mécanisme cellulaire protège rapidement d’une hyperkaliémie après insuline ?",
        "entrée intracellulaire du potassium|transfert intracellulaire du potassium",
        ["b00051", "b00053"],
        "L’insuline active la Na/K-ATPase : elle temporise le danger électrique sans éliminer le potassium total.",
      ),
      qroc(
        "Quel examen simple recherche une obstruction vésicale devant une oligurie ?",
        "échographie vésicale|bladder scan|mesure du résidu vésical",
        ["b00058", "b00061"],
        "Le contrôle du globe et de la sonde élimine une cause postrénale rapidement réversible avant explorations complexes.",
      ),
    ],
  },
  {
    title: "Anesthésie et médicaments",
    questions: [
      qroc(
        "Quel effet hémodynamique anesthésique menace principalement la perfusion rénale ?",
        "l’hypotension|baisse de la pression artérielle",
        ["b00065", "b00066"],
        "Vasodilatation, dépression myocardique et pertes volémiques peuvent abaisser la pression sous la zone d’autorégulation.",
      ),
      qroc(
        "Pourquoi la morphine expose-t-elle à un réveil prolongé en insuffisance rénale ?",
        "accumulation du morphine-6-glucuronide|accumulation de métabolites actifs",
        ["b00072", "b00074"],
        "Son métabolite actif éliminé par le rein prolonge analgésie, sédation et dépression respiratoire.",
      ),
      qroc(
        "Quel curare non dépolarisant est privilégié car son élimination est indépendante du rein ?",
        "cisatracurium|atracurium",
        ["b00078", "b00079"],
        "La dégradation de Hofmann rend cisatracurium ou atracurium plus prévisibles lorsque le DFG est très diminué.",
      ),
      qroc(
        "Quel antalgique faut-il éviter pour préserver la vasodilatation artériolaire afférente ?",
        "les AINS|anti-inflammatoires non stéroïdiens",
        ["b00080", "b00081"],
        "L’inhibition des prostaglandines contracte l’artériole afférente, surtout en hypovolémie, sepsis ou maladie rénale.",
      ),
      qroc(
        "Quel phénomène explique l’oligurie sous pneumopéritoine malgré une fonction initiale normale ?",
        "baisse du débit sanguin rénal|compression rénale et activation neurohormonale",
        ["b00086"],
        "Pression intra-abdominale, baisse du retour veineux et activation sympathique réduisent transitoirement débit et diurèse.",
      ),
    ],
  },
  {
    title: "Insuffisance rénale aiguë",
    questions: [
      qroc(
        "Quel seuil de créatinine absolu en 48 heures définit une IRA selon KDIGO ?",
        "augmentation d’au moins 26,5 µmol/L|hausse ≥ 26,5 µmol/L",
        ["b00088", "b00089"],
        "Une hausse d’au moins 0,3 mg/dL en 48 heures suffit, même si la valeur finale reste dans la norme.",
      ),
      qroc(
        "Quel seuil urinaire KDIGO définit l’oligurie ?",
        "moins de 0,5 mL/kg/h pendant au moins 6 heures|diurèse < 0,5 mL/kg/h sur 6 h",
        ["b00089"],
        "Le débit urinaire doit être rapporté au poids et à la durée ; un chiffre ponctuel ne suffit pas.",
      ),
      qroc(
        "Quelle grande catégorie d’IRA correspond à une hypoperfusion sans lésion initiale ?",
        "IRA prérénale|cause prérénale",
        ["b00090"],
        "Elle devient une nécrose tubulaire si l’hypoperfusion persiste ; la réversibilité dépend de la correction précoce.",
      ),
      qroc(
        "Quel examen recherche en priorité une cause postrénale d’IRA ?",
        "échographie rénale et des voies urinaires|échographie réno-vésicale",
        ["b00090", "b00098"],
        "L’échographie détecte dilatation et globe, mais une obstruction très récente peut ne pas dilater immédiatement.",
      ),
      qroc(
        "Quel objectif préventif prime chez un patient à risque d’IRA périopératoire ?",
        "maintenir perfusion et euvolémie|éviter hypotension et hypovolémie",
        ["b00094", "b00095"],
        "Une hémodynamique personnalisée, l’arrêt des néphrotoxiques et une surveillance rapprochée réduisent les agressions évitables.",
      ),
    ],
  },
  {
    title: "Suppléance rénale",
    questions: [
      qroc(
        "Quel trouble ionique réfractaire impose classiquement une épuration urgente ?",
        "hyperkaliémie réfractaire|hyperkaliémie menaçante",
        ["b00107", "b00109"],
        "Une hyperkaliémie persistante avec anomalies ECG exige une élimination extracorporelle après stabilisation membranaire.",
      ),
      qroc(
        "Quel trouble respiratoire lié au volume peut imposer une ultrafiltration urgente ?",
        "œdème aigu pulmonaire réfractaire|surcharge pulmonaire réfractaire",
        ["b00107", "b00109"],
        "Quand oxygène, ventilation et diurétiques échouent, l’ultrafiltration retire directement l’excès de volume.",
      ),
      qroc(
        "Quel site veineux est généralement préféré pour un cathéter temporaire de dialyse ?",
        "veine jugulaire interne droite|jugulaire interne droite",
        ["b00108", "b00109"],
        "Son trajet direct vers la veine cave offre bon débit et moins de sténose que la voie sous-clavière.",
      ),
      qroc(
        "Quel site faut-il éviter pour préserver les futurs accès vasculaires ?",
        "veine sous-clavière|abord sous-clavier",
        ["b00108"],
        "La sténose veineuse centrale après cathéter sous-clavier peut compromettre une future fistule artérioveineuse.",
      ),
      qroc(
        "Quelle complication urémique neurologique constitue une indication de dialyse ?",
        "encéphalopathie urémique|troubles neurologiques urémiques",
        ["b00107"],
        "Confusion, convulsions ou baisse de vigilance attribuables à l’urémie imposent une suppléance sans attendre un seuil de créatinine.",
      ),
    ],
  },
  {
    title: "Maladie rénale chronique",
    questions: [
      qroc(
        "Quelle durée minimale définit la chronicité d’une maladie rénale ?",
        "au moins 3 mois|plus de trois mois",
        ["b00111", "b00113"],
        "Une anomalie structurelle ou fonctionnelle persistante trois mois distingue MRC et atteinte rénale aiguë.",
      ),
      qroc(
        "Quelle est la cause la plus fréquente de MRC dans les pays développés ?",
        "diabète sucré|néphropathie diabétique",
        ["b00116", "b00117"],
        "Le diabète, puis l’hypertension, dominent les causes et s’accompagnent d’un risque cardiovasculaire majeur.",
      ),
      qroc(
        "Quel poids préopératoire vise-t-on chez un patient hémodialysé ?",
        "le poids sec|poids postdialyse sans surcharge",
        ["b00119", "b00120"],
        "Le poids sec correspond à l’euvolémie clinique ; s’en écarter expose à surcharge ou hypotension.",
      ),
      qroc(
        "Quand programmer idéalement la dernière hémodialyse avant une chirurgie élective ?",
        "la veille|dans les 24 heures précédentes",
        ["b00120", "b00121"],
        "Une séance la veille optimise potassium et volume tout en laissant diminuer l’effet anticoagulant.",
      ),
      qroc(
        "Quel examen clinique doit être fait sur une fistule après l’intervention ?",
        "vérifier le thrill|palper le frémissement de la fistule",
        ["b00124", "b00126"],
        "La persistance du thrill confirme la perméabilité ; compression, hypotension et ponctions inappropriées la menacent.",
      ),
    ],
  },
  {
    title: "Endourologie",
    questions: [
      qroc(
        "Quel mécanisme produit le syndrome de résection transurétrale de prostate ?",
        "absorption systémique du liquide d’irrigation|passage intravasculaire du liquide d’irrigation",
        ["b00134", "b00139"],
        "Les sinus veineux ouverts absorbent le liquide, causant hypoosmolarité, hyponatrémie et surcharge.",
      ),
      qroc(
        "Quel signe neurologique précoce doit alerter pendant une RTUP sous rachianesthésie ?",
        "confusion|agitation|céphalées",
        ["b00139"],
        "Céphalées, nausées, agitation puis confusion traduisent l’encéphalopathie hypoosmolaire avant convulsions.",
      ),
      qroc(
        "Quel soluté traite une hyponatrémie aiguë avec convulsions lors d’une RTUP ?",
        "NaCl hypertonique à 3 %|chlorure de sodium 3 %",
        ["b00139", "b00140"],
        "Des bolus titrés de NaCl 3 % réduisent l’œdème cérébral sous contrôles rapprochés de la natrémie.",
      ),
      qroc(
        "Quel nerf peut provoquer une adduction brutale pendant une RTU de paroi vésicale latérale ?",
        "nerf obturateur|obturateur",
        ["b00144"],
        "Le courant stimule l’obturateur voisin ; l’adduction peut entraîner perforation par le résectoscope.",
      ),
      qroc(
        "Quel indice opératoire suggère une perforation vésicale pendant la résection ?",
        "retour d’irrigation inférieur au volume injecté|déficit de liquide d’irrigation",
        ["b00142", "b00143"],
        "Une discordance croissante indique une extravasation, à confronter à douleur, distension, bradycardie et pression.",
      ),
    ],
  },
  {
    title: "Chirurgie majeure et transplantation",
    questions: [
      qroc(
        "Quelle urgence associe obstacle urinaire haut et sepsis ?",
        "drainage urgent des voies urinaires|décompression urgente",
        ["b00146", "b00148"],
        "Antibiothérapie et réanimation ne remplacent pas le contrôle de source par double J ou néphrostomie.",
      ),
      qroc(
        "Quelle installation robotique favorise œdème facial et pression intracrânienne lors d’une prostatectomie ?",
        "Trendelenburg prononcé|Trendelenburg raide",
        ["b00150", "b00151"],
        "L’inclinaison tête basse prolongée et le pneumopéritoine augmentent pression veineuse céphalique et œdème.",
      ),
      qroc(
        "Quel risque hémodynamique majeur accompagne une néphrectomie avec thrombus cave ?",
        "embolie ou obstruction du retour veineux|migration du thrombus cave",
        ["b00155", "b00158"],
        "La manipulation peut libérer le thrombus ou diminuer brutalement le retour cave, imposant préparation multidisciplinaire.",
      ),
      qroc(
        "Quel trouble acido-basique tardif peut suivre une dérivation urinaire digestive ?",
        "acidose métabolique hyperchlorémique|acidose hyperchlorémique",
        ["b00161", "b00164"],
        "Le contact urine-muqueuse digestive favorise réabsorption de chlorure et ammonium avec perte de bicarbonate.",
      ),
      qroc(
        "Quelle PAM vise-t-on habituellement à la reperfusion d’un greffon rénal ?",
        "70 à 90 mmHg|PAM 70-90 mmHg",
        ["b00171", "b00172"],
        "Une pression et un VCE adaptés favorisent le débit du greffon sans imposer une surcharge liquidienne aveugle.",
      ),
    ],
  },
];
function buildIsolatedQroc() {
  return ISOLATED_QROC.map((s, i) => ({
    label: `QROC ${i + 1} · ${s.title}`,
    allowed_voies: ["externe"],
    questions: s.questions,
  }));
}

const DP_QROC = [
  {
    title: "Fracture de hanche sur MRC",
    vignette:
      "La patiente Mme Alice R., 84 ans, est hospitalisée pour fracture du col fémoral. Elle présente une MRC de stade avancé, une hypertension et une insuffisance cardiaque stable. Son traitement comprend ramipril, furosémide et ibuprofène pris depuis trois jours. La chirurgie est prévue dans la journée.",
    questions: [
      qroc(
        "Quel médicament antalgique récent augmente directement son risque rénal ?",
        "ibuprofène|AINS",
        "b00081",
        "L’AINS bloque les prostaglandines afférentes et fragilise la filtration chez cette patiente âgée et déplétée.",
      ),
      qroc(
        "Quel syndrome rénal doit être diagnostiqué ?",
        "insuffisance rénale aiguë|IRA",
        ["b00088", "b00089"],
        "Une hausse de créatinine de 55 µmol/L en 24 heures dépasse le seuil KDIGO absolu de 26,5 µmol/L.",
        "La créatinine est passée de 150 à 205 µmol/L en vingt-quatre heures et la diurèse diminue.",
      ),
      qroc(
        "Quel mécanisme hémodynamique médicamenteux est probable ?",
        "baisse des pressions afférente et efférente|altération de l’autorégulation glomérulaire",
        ["b00030", "b00081"],
        "L’AINS contracte l’afférente tandis que l’IEC dilate l’efférente, réduisant conjointement la pression glomérulaire.",
        "L’examen montre des muqueuses sèches, sans crépitants ni œdèmes ; la pression est à 92/54 mmHg.",
      ),
      qroc(
        "Quelle mesure thérapeutique immédiate est indiquée ?",
        "arrêter AINS et IEC|suspendre ibuprofène et ramipril",
        ["b00095", "b00099"],
        "La suppression des deux agressions réversibles précède un remplissage prudent guidé par l’état de volume.",
        "Le dossier confirme l’absence d’autre néphrotoxique et l’échographie vésicale ne montre aucun globe.",
      ),
      qroc(
        "Quel objectif anesthésique protège sa filtration ?",
        "éviter l’hypotension|maintenir une PAM adaptée",
        ["b00065", "b00095"],
        "La pression doit rester proche de la valeur habituelle, avec titration anesthésique et vasopresseur si nécessaire.",
        "Après 250 mL de cristalloïde balancé, la pression remonte à 112/64 mmHg sans signe de surcharge.",
      ),
      qroc(
        "Quel curare offre l’élimination la plus prévisible ?",
        "cisatracurium|atracurium",
        "b00079",
        "La dégradation de Hofmann limite l’accumulation liée à la baisse du DFG, contrairement aux curares rénodépendants.",
        "Une anesthésie générale est finalement retenue ; la clairance calculée reste très diminuée.",
      ),
      qroc(
        "Quels deux paramètres suivent l’évolution rénale précoce ?",
        "créatinine et diurèse|cinétique de créatinine et débit urinaire",
        ["b00089", "b00098"],
        "La tendance de créatinine et la diurèse pondérale détectent persistance ou aggravation après correction des causes.",
        "En postopératoire, la pression est stable ; une sonde urinaire est maintenue pour les premières heures.",
      ),
    ],
  },
  {
    title: "IRA après chirurgie aortique",
    vignette:
      "Le patient M. Benoît L., 69 ans, subit une chirurgie ouverte d’anévrisme aortique avec clampage sus-rénal. La fonction rénale était normale. Une hémorragie de 1 500 mL et plusieurs épisodes de PAM inférieure à 55 mmHg surviennent malgré la réanimation.",
    questions: [
      qroc(
        "Quelle agression opératoire menace directement le débit rénal ?",
        "clampage sus-rénal|ischémie rénale par clampage",
        "b00086",
        "Le clampage au-dessus des artères rénales interrompt ou réduit la perfusion et crée une agression ischémique.",
      ),
      qroc(
        "Quel critère urinaire d’IRA est déjà présent ?",
        "oligurie < 0,5 mL/kg/h pendant plus de 6 h|critère urinaire KDIGO",
        "b00089",
        "Une diurèse de 0,2 mL/kg/h pendant huit heures satisfait le critère KDIGO et signale une atteinte sévère.",
        "Huit heures après déclampage, la diurèse moyenne n’est que de 0,2 mL/kg/h malgré une sonde perméable.",
      ),
      qroc(
        "Quelle lésion intrinsèque est la plus probable ?",
        "nécrose tubulaire aiguë ischémique|atteinte tubulaire aiguë",
        "b00090",
        "Hypotension prolongée et ischémie de clampage font évoluer l’hypoperfusion vers une atteinte tubulaire intrinsèque.",
        "La créatinine double en vingt-quatre heures et le sédiment contient des cylindres granuleux.",
      ),
      qroc(
        "Quel examen élimine une cause obstructive associée ?",
        "échographie rénale|échographie des voies urinaires",
        "b00098",
        "L’imagerie vérifie l’absence de dilatation et complète le contrôle de la sonde sans retarder la réanimation.",
        "La pression et le volume sont corrigés mais la diurèse ne reprend pas ; aucun globe n’est palpable.",
      ),
      qroc(
        "Faut-il administrer du furosémide pour guérir l’IRA ?",
        "non|non, seulement pour surcharge",
        "b00092",
        "Le diurétique peut contrôler une surcharge mais ne raccourcit pas l’atteinte tubulaire ni ne restaure le DFG.",
        "L’échographie ne montre pas d’obstacle ; des crépitants apparaissent après plusieurs remplissages.",
      ),
      qroc(
        "Quelle indication de suppléance apparaît ici ?",
        "œdème pulmonaire réfractaire|surcharge réfractaire",
        ["b00107", "b00109"],
        "Une hypoxémie avec surcharge ne répondant pas aux diurétiques justifie ultrafiltration et épuration rénale.",
        "Sous oxygène et forte dose de diurétique, l’hypoxémie persiste avec œdème pulmonaire diffus.",
      ),
      qroc(
        "Quel abord vasculaire temporaire privilégier ?",
        "jugulaire interne droite|veine jugulaire interne droite",
        "b00108",
        "La jugulaire interne droite offre un trajet efficace et préserve les veines sous-clavières pour les accès futurs.",
        "Le néphrologue confirme une épuration urgente et demande la pose immédiate d’un cathéter de dialyse.",
      ),
    ],
  },
  {
    title: "Hyperkaliémie réfractaire",
    vignette:
      "La patiente Mme Chloé S., 63 ans, dialysée trois fois par semaine, consulte après avoir manqué deux séances. Elle est dyspnéique, confuse et présente des œdèmes. La kaliémie est à 7,1 mmol/L et l’ECG montre un élargissement du QRS. Son accès habituel est une fistule brachiocéphalique gauche et elle ne conserve aucune diurèse résiduelle.",
    questions: [
      qroc(
        "Quel traitement protège immédiatement le myocarde ?",
        "calcium intraveineux|gluconate de calcium IV",
        "b00053",
        "Le calcium stabilise la membrane cardiaque sans diminuer la kaliémie ; son effet est rapide et transitoire.",
      ),
      qroc(
        "Quel traitement transfère rapidement le potassium dans les cellules ?",
        "insuline avec glucose|insuline-glucose",
        "b00053",
        "L’insuline active la Na/K-ATPase ; le glucose prévient l’hypoglycémie et impose une surveillance répétée.",
        "Après calcium, le QRS se rétrécit mais la kaliémie reste à 7,0 mmol/L.",
      ),
      qroc(
        "Quel traitement élimine réellement le potassium dans cette situation ?",
        "hémodialyse urgente|dialyse",
        "b00107",
        "L’anurie et l’absence de séances rendent l’épuration extracorporelle indispensable après les mesures temporaires.",
        "La patiente est anurique et la kaliémie remonte une heure après insuline-glucose et bêta-2 mimétique.",
      ),
      qroc(
        "Quel autre trouble biologique renforce l’indication ?",
        "acidose métabolique sévère|acidose réfractaire",
        "b00107",
        "Une acidémie sévère réfractaire altère la contractilité et la réponse vasopressive, constituant une indication autonome.",
        "Le pH artériel est à 7,08 avec bicarbonate à 10 mmol/L malgré la stabilisation circulatoire.",
      ),
      qroc(
        "Quel accès existant faut-il examiner avant la séance ?",
        "fistule artérioveineuse|FAV",
        "b00124",
        "La palpation du thrill et l’auscultation du souffle confirment que la fistule peut être utilisée sans délai.",
        "La patiente possède une fistule brachiocéphalique gauche, jamais ponctionnée pendant cette admission.",
      ),
      qroc(
        "Quel objectif volumique doit accompagner l’épuration ?",
        "retour au poids sec|ultrafiltration vers l’euvolémie",
        ["b00119", "b00122"],
        "L’ultrafiltration vise la surcharge clinique sans provoquer une hypotension qui compromettrait cœur et cerveau.",
        "Son poids dépasse de six kilogrammes son poids sec et la radiographie montre un œdème pulmonaire.",
      ),
      qroc(
        "Quelle surveillance métabolique persiste après la séance ?",
        "kaliémie et glycémie|contrôle du potassium et du glucose",
        ["b00053", "b00121"],
        "Un rebond potassique et une hypoglycémie retardée après insuline exigent des contrôles même après amélioration ECG.",
        "La dialyse corrige le QRS et retire quatre litres ; la patiente a reçu deux protocoles insuline-glucose.",
      ),
    ],
  },
  {
    title: "RTUP sous rachianesthésie",
    vignette:
      "Le patient M. Denis V., 76 ans, doit subir une résection transurétrale de prostate pour une obstruction symptomatique. Sa natrémie est à 140 mmol/L et son cœur est stable. Une rachianesthésie est choisie pour conserver la vigilance pendant l’irrigation. L’urologue prévoit une résection volumineuse avec plusieurs poches de liquide disponibles.",
    questions: [
      qroc(
        "Quel niveau sensitif minimal est habituellement recherché ?",
        "T10|niveau T10",
        "b00136",
        "Un niveau T10 couvre les afférences vésicales et permet une intervention confortable tout en gardant le patient éveillé.",
      ),
      qroc(
        "Quel facteur technique augmente ici l’absorption d’irrigation ?",
        "durée prolongée|hauteur élevée des sacs|sinus veineux ouverts",
        ["b00134", "b00139"],
        "Une intervention longue avec pression hydrostatique élevée favorise le passage du liquide dans les sinus prostatiques.",
        "Après soixante-dix minutes, les sacs restent placés très haut et plusieurs sinus veineux sont ouverts.",
      ),
      qroc(
        "Quel diagnostic explique les premiers symptômes ?",
        "syndrome de RTUP|syndrome de résection transurétrale",
        ["b00134", "b00139"],
        "Céphalées, nausées et agitation pendant une irrigation prolongée évoquent une hypoosmolarité par absorption.",
        "Le patient décrit une céphalée brutale, devient nauséeux puis peine à répondre aux questions simples.",
      ),
      qroc(
        "Quel dosage biologique doit être obtenu en urgence ?",
        "natrémie|sodium plasmatique",
        ["b00036", "b00139"],
        "Le sodium quantifie la dilution aiguë et guide la stratégie avec osmolarité, hémoglobine et gaz du sang.",
        "La résection et l’irrigation sont interrompues ; de l’oxygène est administré pendant le prélèvement.",
      ),
      qroc(
        "Quel traitement est indiqué si une convulsion survient ?",
        "bolus de NaCl 3 %|sérum salé hypertonique 3 %",
        "b00140",
        "L’hyponatrémie aiguë symptomatique impose une correction hypertonique titrée et un anticonvulsivant.",
        "La natrémie est à 118 mmol/L ; une crise tonico-clonique débute malgré l’arrêt du geste.",
      ),
      qroc(
        "Quel médicament peut contrôler la surcharge si la diurèse est conservée ?",
        "furosémide|diurétique de l’anse",
        ["b00092", "b00140"],
        "Le furosémide favorise l’élimination d’eau et de sodium, sous contrôle de pression et de la correction sodée.",
        "Après la crise, des crépitants bilatéraux apparaissent tandis que la sonde ramène encore des urines.",
      ),
      qroc(
        "Quel risque impose de limiter la vitesse de correction ultérieure ?",
        "démyélinisation osmotique|myélinolyse centropontine",
        "b00140",
        "Après le sauvetage neurologique initial, une correction excessive expose à une démyélinisation osmotique retardée.",
        "La vigilance s’améliore lorsque le sodium atteint 125 mmol/L ; le patient est transféré en soins intensifs.",
      ),
    ],
  },
  {
    title: "Prostatectomie robotique",
    vignette:
      "Le patient M. Émile G., 66 ans, est programmé pour prostatectomie radicale robot-assistée. Il est obèse, présente un reflux gastro-œsophagien et une fonction rénale normale. Le geste nécessite pneumopéritoine et Trendelenburg prononcé pendant plusieurs heures.",
    questions: [
      qroc(
        "Quel risque d’induction est majoré par le reflux et l’obésité ?",
        "inhalation pulmonaire|aspiration gastrique",
        "b00150",
        "Le risque d’aspiration conduit à sécuriser rapidement les voies aériennes selon l’évaluation individuelle.",
      ),
      qroc(
        "Quel effet ventilatoire du pneumopéritoine faut-il anticiper ?",
        "diminution de compliance pulmonaire|augmentation des pressions ventilatoires",
        ["b00086", "b00151"],
        "Diaphragme céphalique et pression abdominale réduisent compliance, augmentent pressions et favorisent atélectasie.",
        "A 15 mmHg de pneumopéritoine, la pression de plateau augmente et la compliance diminue nettement.",
      ),
      qroc(
        "Quel trouble acido-basique peut résulter de l’absorption du gaz ?",
        "acidose respiratoire|hypercapnie",
        "b00151",
        "L’absorption de CO2 augmente la PaCO2 ; la ventilation minute doit être adaptée en surveillant l’acidose.",
        "La capnographie monte progressivement à 55 mmHg malgré un volume courant inchangé.",
      ),
      qroc(
        "Quel phénomène explique l’oligurie peropératoire ?",
        "baisse du débit rénal sous pression intra-abdominale|effet du pneumopéritoine",
        "b00086",
        "Compression vasculaire et activation neurohormonale diminuent transitoirement le débit urinaire sans prouver une déplétion.",
        "La diurèse tombe à 0,3 mL/kg/h, mais la pression, le VCE et le champ opératoire restent satisfaisants.",
      ),
      qroc(
        "Pourquoi éviter un remplissage massif en réponse isolée à l’oligurie ?",
        "risque d’œdème sans corriger le mécanisme|oligurie non liée à l’hypovolémie",
        ["b00086", "b00152"],
        "Le volume excessif aggrave œdème facial et pulmonaire alors que la pression abdominale reste la cause de l’oligurie.",
        "Le chirurgien annonce encore deux heures en tête basse ; le visage commence déjà à être œdématié.",
      ),
      qroc(
        "Quel test simple aide à évaluer l’œdème laryngé avant extubation ?",
        "test de fuite du ballonnet|cuff leak test",
        "b00152",
        "Une fuite absente après Trendelenburg prolongé suggère un œdème et conduit à différer une extubation risquée.",
        "En fin de geste, la langue est gonflée et aucune fuite n’est audible ballonnet dégonflé.",
      ),
      qroc(
        "Quelle conduite respiratoire est alors la plus sûre ?",
        "maintenir l’intubation et réévaluer|extubation différée",
        "b00152",
        "La ventilation contrôlée est poursuivie jusqu’à régression de l’œdème et obtention de critères d’extubation sûrs.",
        "Le patient est stable, mais l’examen des voies aériennes reste défavorable malgré le retour en décubitus horizontal.",
      ),
    ],
  },
  {
    title: "Cystectomie et dérivation",
    vignette:
      "La patiente Mme Farah K., 71 ans, doit subir une cystectomie radicale avec dérivation urinaire iléale. Elle a une MRC modérée, une anémie et a reçu une chimiothérapie néoadjuvante. Une chirurgie longue avec pertes sanguines est anticipée.",
    questions: [
      qroc(
        "Quel enjeu hématologique doit être corrigé avant l’intervention ?",
        "anémie|optimisation de l’hémoglobine",
        "b00162",
        "L’anémie réduit la réserve face aux pertes attendues ; cause et possibilités de correction doivent être évaluées.",
      ),
      qroc(
        "Quel objectif hémodynamique protège le rein pendant les pertes ?",
        "maintenir euvolémie et pression|éviter hypovolémie et hypotension",
        ["b00095", "b00163"],
        "Remplacement titré des pertes et vasopresseur raisonné préservent la perfusion sans surcharge interstitielle.",
        "Après deux heures, les pertes atteignent 900 mL et la PAM descend à 58 mmHg.",
      ),
      qroc(
        "Quel type d’analgésie régionale peut améliorer la récupération si elle est possible ?",
        "analgésie péridurale|péridurale thoracique",
        "b00163",
        "La péridurale procure une analgésie dynamique efficace mais exige bilan de coagulation et anticipation hémodynamique.",
        "La coagulation est normale et aucune anticoagulation thérapeutique n’est prévue avant le soir suivant.",
      ),
      qroc(
        "Quel trouble électrolytique faut-il surveiller avec des transfusions importantes ?",
        "hyperkaliémie|élévation du potassium",
        "b00051",
        "Le potassium du sang stocké peut s’ajouter à une élimination rénale limitée, surtout lors de transfusion rapide.",
        "Une hémorragie impose quatre concentrés érythrocytaires rapides ; la diurèse diminue parallèlement.",
      ),
      qroc(
        "Quelle cause mécanique de faible diurèse doit être vérifiée avant de conclure à l’IRA ?",
        "perméabilité des sondes ou de la dérivation|obstruction du drainage urinaire",
        ["b00061", "b00164"],
        "Coudure, obstruction ou mauvais positionnement du drainage peut simuler une anurie et se corrige immédiatement.",
        "La pression est restaurée, mais aucun débit n’apparaît dans le dispositif de dérivation depuis trente minutes.",
      ),
      qroc(
        "Quel trouble acido-basique peut survenir à distance ?",
        "acidose métabolique hyperchlorémique|acidose hyperchlorémique",
        "b00164",
        "La muqueuse intestinale au contact de l’urine réabsorbe chlorure et ammonium avec perte nette de bicarbonate.",
        "Au suivi, le chlore est élevé et les bicarbonates sont bas avec trou anionique normal.",
      ),
      qroc(
        "Quel autre déficit nutritionnel peut apparaître avec certains segments intestinaux ?",
        "carence en vitamine B12|déficit en cobalamine",
        "b00165",
        "La résection ou dérivation utilisant l’iléon terminal peut diminuer l’absorption de vitamine B12 à long terme.",
        "Plusieurs mois plus tard, une macrocytose et des paresthésies conduisent à rechercher une complication nutritionnelle.",
      ),
    ],
  },
  {
    title: "Fistule chez un dialysé",
    vignette:
      "Le patient M. Georges N., 59 ans, hémodialysé chronique, est programmé pour création d’une fistule radio-céphalique gauche. Il a été dialysé la veille, se situe à son poids sec et sa kaliémie est à 4,9 mmol/L. Son membre droit porte un ancien accès thrombosé.",
    questions: [
      qroc(
        "Quel membre doit être protégé de toute ponction et compression ?",
        "le bras gauche|membre de la future fistule",
        "b00124",
        "Le membre destiné à la fistule ne doit recevoir ni brassard, ni cathéter, ni prélèvement susceptible de léser ses veines.",
      ),
      qroc(
        "Quel type d’anesthésie favorise débit et vasodilatation du membre ?",
        "bloc régional du plexus brachial|anesthésie locorégionale",
        "b00127",
        "Le bloc procure analgésie et sympathectomie, améliorant le calibre vasculaire tout en évitant une anesthésie générale.",
        "Le chirurgien juge les vaisseaux fins et souhaite maximiser le débit après l’anastomose.",
      ),
      qroc(
        "Quel contrôle biologique récent reste indispensable ?",
        "kaliémie|dosage du potassium",
        "b00120",
        "Une séance la veille ne garantit pas l’absence de rebond ; la kaliémie conditionne sécurité cardiaque et anesthésique.",
        "Le matin de l’intervention, le tracé ECG montre des ondes T un peu plus amples qu’à l’habitude.",
      ),
      qroc(
        "Quel traitement doit être évité pour l’analgésie postopératoire ?",
        "AINS|anti-inflammatoires non stéroïdiens",
        "b00081",
        "Les AINS ajoutent risques rénal, cardiovasculaire et hémorragique sans avantage indispensable chez ce patient.",
        "Le patient demande à reprendre l’ibuprofène qu’il utilisait avant la dialyse pour ses douleurs articulaires.",
      ),
      qroc(
        "Quel signe confirme immédiatement la perméabilité de la fistule ?",
        "thrill palpable|frémissement palpable",
        "b00124",
        "Le thrill continu traduit le flux dans l’anastomose ; sa disparition impose une réévaluation chirurgicale rapide.",
        "Après déclampage, le chirurgien demande une vérification clinique avant le pansement.",
      ),
      qroc(
        "Quel facteur hémodynamique postopératoire menace précocement l’accès ?",
        "hypotension|pression artérielle trop basse",
        "b00126",
        "Une faible pression réduit le débit dans la fistule récente et favorise sa thrombose avant maturation.",
        "En salle de réveil, la pression tombe à 78/42 mmHg et le thrill devient plus faible.",
      ),
      qroc(
        "Quelle action accompagne la correction de pression ?",
        "desserrer toute compression et réexaminer le thrill|contrôler le pansement et la fistule",
        "b00126",
        "Le membre est libéré de toute compression, la perfusion corrigée et le chirurgien alerté si le thrill ne revient pas.",
        "Un pansement circulaire serré est découvert autour du poignet alors que le patient reste asymptomatique.",
      ),
    ],
  },
  {
    title: "Oligurie après transplantation",
    vignette:
      "La patiente Mme Hélène C., 48 ans, dialysée pour néphropathie glomérulaire, reçoit un rein de donneur décédé après une longue ischémie froide. Elle est au poids sec, sa kaliémie est à 4,6 mmol/L et l’implantation iliaque se déroule sans hémorragie importante. La fistule reste fonctionnelle et l’équipe a préparé une surveillance biologique rapprochée.",
    questions: [
      qroc(
        "Quelle structure vasculaire reçoit habituellement l’artère du greffon ?",
        "artère iliaque externe|vaisseaux iliaques externes",
        "b00169",
        "L’artère et la veine rénales sont anastomosées aux vaisseaux iliaques, les reins natifs restant habituellement en place.",
      ),
      qroc(
        "Quelle cible de pression faut-il restaurer avant reperfusion ?",
        "PAM 70 à 90 mmHg|au moins 70 mmHg",
        "b00172",
        "Une pression de 70 à 90 mmHg avec VCE adéquat soutient le débit initial du greffon sans surcharge aveugle.",
        "Juste avant déclampage, la PAM est à 62 mmHg et l’évaluation ne montre ni surcharge ni déplétion majeure.",
      ),
      qroc(
        "Quelle complication ionique peut suivre le déclampage ?",
        "hyperkaliémie|élévation aiguë du potassium",
        ["b00173", "b00174"],
        "Le potassium contenu dans la solution de conservation rejoint la circulation et peut modifier rapidement l’ECG.",
        "Cinq minutes après reperfusion, les ondes T s’accentuent et la kaliémie atteint 6,0 mmol/L.",
      ),
      qroc(
        "Quel examen vérifie d’abord la perfusion d’un greffon oligurique ?",
        "échographie Doppler du greffon|Doppler rénal",
        "b00175",
        "Le Doppler recherche thrombose artérielle ou veineuse, flux anormal et collection compressive autour du greffon.",
        "Une heure plus tard, aucune urine n’est recueillie malgré une PAM à 78 mmHg et un VCE satisfaisant.",
      ),
      qroc(
        "Quelle cause simple doit être exclue en parallèle ?",
        "obstruction ou coudure de la sonde urinaire|sonde vésicale non perméable",
        "b00175",
        "La perméabilité du drainage est vérifiée avant d’attribuer l’anurie au parenchyme ou aux vaisseaux du greffon.",
        "Le Doppler montre des flux présents, mais la vessie paraît distendue à l’échographie sus-pubienne.",
      ),
      qroc(
        "Pourquoi ne pas perfuser plusieurs litres pour obtenir une diurèse ?",
        "risque de surcharge sans bénéfice|absence d’hypovolémie",
        "b00176",
        "Un remplissage sans déplétion ne traite pas un obstacle ni un retard de fonction et provoque un œdème pulmonaire.",
        "Après remise en place de la sonde, la diurèse reste faible et des crépitants débutent après des apports supplémentaires.",
      ),
      qroc(
        "Quel diagnostic fonctionnel reste possible si le Doppler et le drainage sont normaux ?",
        "retard de fonction du greffon|delayed graft function",
        "b00175",
        "Un greffon de donneur décédé peut reprendre tardivement ; surveillance et dialyse transitoire sont parfois nécessaires.",
        "Le nouveau Doppler est normal, aucune collection n’est visible et l’équipe confirme une ischémie froide prolongée.",
      ),
    ],
  },
];
function buildDpQroc() {
  return DP_QROC.map((s, i) => ({
    label: `DP QROC ${i + 1} · ${s.title}`,
    allowed_voies: ["externe"],
    vignette: s.vignette,
    questions: s.questions,
  }));
}

function validateSourceBlocks(value, valid, path = "chapter26") {
  if (Array.isArray(value)) {
    value.forEach((v, i) => validateSourceBlocks(v, valid, `${path}[${i}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value.sourceBlocks))
    for (const id of value.sourceBlocks)
      if (!valid.has(id)) throw new Error(`${path}: sourceBlock inconnu ${id}`);
  for (const [key, child] of Object.entries(value))
    validateSourceBlocks(child, valid, `${path}.${key}`);
}

const QCM_BALANCE_OVERRIDES = Object.freeze({
  "1A": {
    "is_correct": false,
    "enonce": "Elle n’a aucun besoin énergétique pour les transports tubulaires ; Elle ne reçoit qu’environ 15 % du débit rénal.",
    "justification": "Les transports actifs imposent au contraire une consommation d’oxygène importante. Le cortex capte l’essentiel du flux, laissant une faible réserve médullaire."
  },
  "1C": {
    "is_correct": false,
    "enonce": "Elle n’a aucun besoin énergétique pour les transports tubulaires ; Son extraction d’oxygène approche 79 %.",
    "justification": "Les transports actifs imposent au contraire une consommation d’oxygène importante. Une extraction déjà élevée limite l’adaptation à une nouvelle baisse d’apport."
  },
  "2B": {
    "is_correct": false,
    "enonce": "La pression oncotique disparaît complètement ; L’artériole afférente se dilate.",
    "justification": "Les protéines plasmatiques continuent de s’opposer au mouvement d’eau filtrée. Cette réponse diminue la résistance d’entrée et soutient le flux glomérulaire."
  },
  "2C": {
    "is_correct": false,
    "enonce": "L’artériole efférente se dilate fortement ; Les prostaglandines participent à la réponse afférente.",
    "justification": "Une dilatation efférente ferait chuter la pression hydrostatique de filtration. Leur effet vasodilatateur protège la pression capillaire en hypoperfusion."
  },
  "3B": {
    "is_correct": false,
    "enonce": "Les AINS dilatent systématiquement l’artériole afférente ; Les AINS inhibent la production de prostaglandines.",
    "justification": "Ils bloquent au contraire la voie vasodilatatrice dépendante des prostaglandines. La dilatation afférente devient insuffisante lorsque la perfusion rénale diminue."
  },
  "4C": {
    "is_correct": false,
    "enonce": "Il est toujours identique au volume extracellulaire total ; Sa baisse stimule le système sympathique.",
    "justification": "Une grande partie du liquide extracellulaire est interstitielle et non circulante. Les barorécepteurs déclenchent une réponse adrénergique de conservation."
  },
  "5A": {
    "is_correct": false,
    "enonce": "La sécrétion d’ADH ne dépend que du sodium ; La réabsorption d’eau augmente au tubule collecteur.",
    "justification": "L’osmolarité et le volume circulant efficace régulent tous deux sa libération. Les aquaporines permettent le retour de l’eau vers le compartiment vasculaire."
  },
  "6C": {
    "is_correct": false,
    "enonce": "Elle est totalement indépendante de l’âge ; Une expansion hydrique peut diluer la concentration.",
    "justification": "La masse musculaire et la production de créatinine diminuent souvent avec l’âge. L’augmentation d’eau corporelle fait sous-estimer la gravité de l’atteinte."
  },
  "7C": {
    "is_correct": false,
    "enonce": "L’utiliser sans réserve pendant une IRA rapidement progressive ; Appliquer un coefficient lié au sexe.",
    "justification": "La créatinine non stable invalide l’équilibre supposé par la formule. Le coefficient indiqué est 1 chez l’homme et 0,85 chez la femme."
  },
  "8E": {
    "is_correct": true,
    "enonce": "La concentration plasmatique de potassium ; Le débit de liquide dans le tubule distal.",
    "justification": "Une kaliémie plus forte stimule normalement l’élimination rénale. Un débit suffisant facilite la sécrétion et l’évacuation du potassium."
  },
  "9B": {
    "is_correct": false,
    "enonce": "Eliminer les acides non volatils uniquement par les poumons ; Augmenter l’excrétion d’ammonium.",
    "justification": "La ventilation traite le CO2 mais le rein excrète la charge acide fixe. Le NH4+ permet d’éliminer des protons sans abaisser excessivement le pH urinaire."
  },
  "9C": {
    "is_correct": false,
    "enonce": "Excréter tout le bicarbonate en situation d’acidose ; Utiliser les phosphates comme acides titrables.",
    "justification": "La compensation exige au contraire une réabsorption accrue du bicarbonate. Les tampons urinaires lient les ions hydrogène destinés à l’excrétion."
  },
  "10E": {
    "is_correct": true,
    "enonce": "Le rémifentanil ; Le cisatracurium.",
    "justification": "Son hydrolyse rapide par les estérases sanguines évite un métabolite actif accumulé. L’élimination de Hofmann rend son comportement plus prédictible."
  },
  "11A": {
    "is_correct": false,
    "enonce": "Le rémifentanil est exclusivement éliminé par filtration glomérulaire ; La morphine peut provoquer une dépression respiratoire prolongée.",
    "justification": "Il est rapidement hydrolysé dans le sang par des estérases non spécifiques. La morphine-6-glucuronide active s’accumule lorsque la clairance est basse."
  },
  "11B": {
    "is_correct": false,
    "enonce": "Le fentanyl forme un métabolite rénal actif majeur ; La mépéridine peut provoquer des convulsions.",
    "justification": "Il ne produit pas le même type de métabolite actif que la morphine. La normépéridine est un métabolite neuroexcitant dépendant du rein."
  },
  "13B": {
    "is_correct": false,
    "enonce": "Utiliser le sugammadex sans réserve chez le dialysé ; Monitorer le rocuronium quantitativement.",
    "justification": "La monographie ne le recommande pas lorsque la clairance est inférieure à 30 mL/min. Son effet peut être prolongé en atteinte rénale sévère."
  },
  "13D": {
    "is_correct": true,
    "enonce": "Vérifier le potassium avant succinylcholine ; Monitorer le rocuronium quantitativement.",
    "justification": "La molécule est considérée utilisable si la kaliémie est inférieure à 5,5 mmol/L. Son effet peut être prolongé en atteinte rénale sévère."
  },
  "14B": {
    "is_correct": false,
    "enonce": "Limiter la revue aux médicaments administrés au bloc ; Identifier les métabolites actifs à élimination urinaire.",
    "justification": "Les prescriptions chroniques et postopératoires participent aussi au risque cumulé. Un métabolite peut s’accumuler même si la molécule mère est métabolisée par le foie."
  },
  "14C": {
    "is_correct": false,
    "enonce": "Conserver toutes les doses habituelles quel que soit le DFG ; Considérer l’hypoalbuminémie.",
    "justification": "La baisse de clairance impose des adaptations de dose ou d’intervalle pour plusieurs agents. La hausse de fraction libre peut augmenter l’effet d’une molécule fortement liée."
  },
  "15D": {
    "is_correct": true,
    "enonce": "Hausse de créatinine supérieure à 26,5 µmol/L en 48 heures ; Augmentation de créatinine d’au moins 50 % en sept jours.",
    "justification": "Cette variation absolue rapide constitue l’un des critères diagnostiques. Le critère relatif détecte une dégradation significative sur une semaine."
  },
  "15E": {
    "is_correct": true,
    "enonce": "Augmentation de créatinine d’au moins 50 % en sept jours ; Diurèse inférieure à 0,5 mL/kg/h pendant plus de six heures.",
    "justification": "Le critère relatif détecte une dégradation significative sur une semaine. Une oligurie pondérale prolongée suffit à répondre au critère urinaire."
  },
  "17B": {
    "is_correct": false,
    "enonce": "Une chirurgie mineure sans variation hémodynamique ; Une hypovolémie avant l’intervention.",
    "justification": "Ce contexte isolé n’appartient pas aux principaux facteurs de haut risque. La diminution du VCE compromet la perfusion et l’autorégulation glomérulaire."
  },
  "18B": {
    "is_correct": false,
    "enonce": "Utiliser un colloïde de synthèse chez tout patient critique ; Maintenir un VCE suffisant sans surcharge.",
    "justification": "Ces solutions sont à éviter en raison de leur association aux complications rénales. Une perfusion adéquate protège le glomérule et la médulla."
  },
  "19A": {
    "is_correct": false,
    "enonce": "Créatinine isolée à un seuil arbitraire sans complication ; Hyperkaliémie sévère réfractaire.",
    "justification": "Aucune valeur unique de fonction rénale ne commande à elle seule l’initiation. L’élimination extracorporelle retire le potassium lorsque les mesures temporaires échouent."
  },
  "19B": {
    "is_correct": false,
    "enonce": "Créatinine isolée à un seuil arbitraire sans complication ; Acidose métabolique profonde non corrigée.",
    "justification": "Aucune valeur unique de fonction rénale ne commande à elle seule l’initiation. Une acidémie persistante peut compromettre contractilité, tonus vasculaire et rythme."
  },
  "19C": {
    "is_correct": false,
    "enonce": "Créatinine isolée à un seuil arbitraire sans complication ; Oedème pulmonaire ne répondant pas aux diurétiques.",
    "justification": "Aucune valeur unique de fonction rénale ne commande à elle seule l’initiation. L’ultrafiltration permet de retirer le volume lorsque le traitement habituel est insuffisant."
  },
  "20E": {
    "is_correct": true,
    "enonce": "Une durée de plus de trois mois ; Un DFG inférieur à 60 mL/min.",
    "justification": "La chronicité distingue cette atteinte d’une insuffisance rénale aiguë. Ce seuil prolongé constitue un critère même sans autre anomalie."
  },
  "21E": {
    "is_correct": true,
    "enonce": "L’HTA représente environ 27 % des causes ; Les patients ont souvent un risque cardiovasculaire associé.",
    "justification": "La maladie hypertensive contribue fortement à la perte néphronique chronique. Diabète et HTA favorisent aussi coronaropathie et maladie artérielle périphérique."
  },
  "22A": {
    "is_correct": false,
    "enonce": "Une dialyse systématique pendant toute chirurgie mineure ; La date et la tolérance de la dernière dialyse.",
    "justification": "Le besoin dépend du statut clinique et non de la seule présence d’une IRT. Une dialyse récente optimise volume, potassium et acidose avant un geste électif."
  },
  "22E": {
    "is_correct": true,
    "enonce": "La kaliémie préopératoire ; L’état de la fistule ou du cathéter.",
    "justification": "Une hyperkaliémie significative modifie le calendrier et la stratégie anesthésique. L’accès doit rester fonctionnel et être protégé de toute compression."
  },
  "23C": {
    "is_correct": false,
    "enonce": "Utiliser la fistule pour administrer les médicaments anesthésiques ; Vérifier la présence du thrill avant et après.",
    "justification": "Elle est réservée à la dialyse et ne constitue pas une voie veineuse ordinaire. La vibration palpable confirme un débit persistant dans l’accès."
  },
  "23E": {
    "is_correct": true,
    "enonce": "Eviter un brassard de pression sur ce membre ; Ne pas poser de voie veineuse dans le membre concerné.",
    "justification": "Les compressions répétées peuvent compromettre le débit et favoriser la thrombose. Les ponctions exposent à hématome, infection et altération du capital vasculaire."
  },
  "24E": {
    "is_correct": true,
    "enonce": "Le NaCl 0,9 % peut provoquer une acidose hyperchlorémique ; Le lactate de Ringer contient une faible quantité de potassium.",
    "justification": "Une charge chlorée importante diminue le bicarbonate et peut aggraver la kaliémie. Cette concentration n’entraîne pas à elle seule une hausse cliniquement majeure."
  },
  "25E": {
    "is_correct": true,
    "enonce": "Une irrigation gravitaire maintient la visualisation ; La glycine 1,5 % peut être utilisée en monopolaire.",
    "justification": "Le liquide distend la cavité et évacue sang et fragments pendant la résection. Cette solution légèrement hypotonique est non électrolytique."
  },
  "26C": {
    "is_correct": false,
    "enonce": "Une courte RTU-TV sans sinus prostatique ouvert ; Un grand nombre de sacs consommés.",
    "justification": "Ce contexte expose beaucoup moins au syndrome classique d’absorption prostatique. Un volume important signale une exposition et une absorption potentiellement élevées."
  },
  "26E": {
    "is_correct": true,
    "enonce": "Un grand nombre de sacs consommés ; L’ouverture de nombreux sinus veineux prostatiques.",
    "justification": "Un volume important signale une exposition et une absorption potentiellement élevées. Ces communications vasculaires constituent la voie d’entrée systémique du liquide."
  },
  "27A": {
    "is_correct": false,
    "enonce": "Hypernatrémie hyperosmolaire constante ; Céphalées et agitation.",
    "justification": "Le syndrome classique associe au contraire une hyponatrémie hypoosmolaire de dilution. Ces manifestations précoces traduisent l’œdème cérébral hypoosmolaire."
  },
  "28E": {
    "is_correct": true,
    "enonce": "Interrompre la résection et l’irrigation ; Mesurer rapidement natrémie et osmolarité.",
    "justification": "Supprimer la source empêche la poursuite de l’absorption hypotonique. Le bilan quantifie la gravité et guide la correction du sodium."
  },
  "29C": {
    "is_correct": false,
    "enonce": "Le bloc neuromusculaire augmente le réflexe obturateur ; Une bradycardie vagale peut accompagner une perforation importante.",
    "justification": "Une curarisation efficace supprime la contraction et réduit le risque de perforation. La distension ou l’irritation péritonéale peut déclencher un réflexe vagal."
  },
  "30E": {
    "is_correct": true,
    "enonce": "Une néphrostomie est une alternative ; Une bactériémie peut aggraver l’état pendant le geste.",
    "justification": "Le drainage percutané convient si les voies sont dilatées et la coagulation compatible. La manipulation du foyer infecté libère des bactéries dans la circulation."
  },
  "31B": {
    "is_correct": false,
    "enonce": "Diminution garantie de toutes les pressions céphaliques ; Augmentation de la pression intraoculaire.",
    "justification": "Le Trendelenburg profond produit habituellement l’effet opposé sur le drainage veineux. La déclivité et la pression veineuse favorisent une hausse parfois importante."
  },
  "31E": {
    "is_correct": true,
    "enonce": "Syndrome compartimental d’un membre inférieur ; Oedème facial et des voies aériennes.",
    "justification": "Une position extrême et prolongée peut diminuer perfusion et augmenter pression tissulaire. La stase veineuse céphalique peut rendre l’extubation dangereuse après une longue intervention."
  },
  "32A": {
    "is_correct": false,
    "enonce": "La position n’a aucun risque propre ; Un thrombus peut s’étendre dans la VCI.",
    "justification": "Le décubitus latéral exige une protection des appuis et de la ventilation. Cinq à dix pour cent des tumeurs ont une extension veineuse parfois jusqu’à l’oreillette."
  },
  "33E": {
    "is_correct": true,
    "enonce": "L’intervention dépasse souvent six heures ; Une péridurale peut améliorer l’analgésie de laparotomie.",
    "justification": "La durée accroît les enjeux de température, pression, position et remplissage. La technique réduit la douleur d’une incision médiane lorsqu’elle est compatible avec l’hémostase."
  },
  "34A": {
    "is_correct": false,
    "enonce": "La fonction rénale n’influence jamais le choix des opioïdes ; Une péridurale peut être utile après néphrectomie ouverte.",
    "justification": "Les métabolites actifs imposent un choix et une titration spécifiques. Elle contrôle la douleur sous-costale et facilite ventilation et mobilisation."
  },
  "35D": {
    "is_correct": true,
    "enonce": "Les anastomoses utilisent habituellement les vaisseaux iliaques externes ; Une anastomose relie l’uretère du greffon à la vessie.",
    "justification": "La veine et l’artère du greffon sont raccordées dans la fosse iliaque. Cette étape assure le drainage urinaire du nouveau rein."
  },
  "36C": {
    "is_correct": false,
    "enonce": "Tolérer une PAM prolongée à 40 mmHg après déclampage ; Utiliser de petites doses de vasopresseur si le VCE est suffisant.",
    "justification": "Une pression très basse compromet directement la perfusion du greffon. Une pression basse persistante peut nécessiter un soutien vasculaire titré."
  },
  "37E": {
    "is_correct": true,
    "enonce": "La kaliémie peut augmenter ; Le rythme cardiaque doit être surveillé.",
    "justification": "La solution de conservation contient une quantité non négligeable de potassium. Une hyperkaliémie aiguë peut entraîner des anomalies de conduction ou une arythmie."
  },
  "38E": {
    "is_correct": true,
    "enonce": "Une thrombose veineuse ou un hématome peut être en cause ; Une échographie Doppler est indiquée.",
    "justification": "Une obstruction du drainage ou une compression altère la perfusion rénale. L’imagerie évalue flux vasculaires et collections avant de modifier le remplissage."
  },
  "39A": {
    "is_correct": false,
    "enonce": "Toute oligurie signifie un rejet aigu certain ; Les mesures périopératoires de l’IRT restent applicables.",
    "justification": "Les diagnostics incluent retard de fonction, perfusion insuffisante et complication vasculaire. Le patient conserve ses comorbidités et sa dysfonction jusqu’à reprise effective du greffon."
  },
  "39B": {
    "is_correct": false,
    "enonce": "Toute oligurie signifie un rejet aigu certain ; Les immunosuppresseurs doivent être administrés selon le protocole.",
    "justification": "Les diagnostics incluent retard de fonction, perfusion insuffisante et complication vasculaire. La prévention du rejet commence autour de la transplantation et doit être coordonnée."
  },
  "40A": {
    "is_correct": false,
    "enonce": "Nécrose corticale certaine après quelques minutes ; Compression des veines rénales par la pression abdominale.",
    "justification": "Une oligurie transitoire isolée ne permet pas de conclure à un dommage structurel. Une hausse intra-abdominale réduit le drainage veineux et la perfusion effective du rein."
  },
  "40C": {
    "is_correct": false,
    "enonce": "Nécrose corticale certaine après quelques minutes ; Réponse endocrine avec ADH et activation du SRAA.",
    "justification": "Une oligurie transitoire isolée ne permet pas de conclure à un dommage structurel. Le stress chirurgical favorise la rétention d’eau et de sodium et diminue la diurèse."
  },
  "41B": {
    "is_correct": false,
    "enonce": "Injecter deux litres sans examiner la patiente ; Réévaluer pression artérielle et perfusion périphérique.",
    "justification": "Une charge aveugle expose à l’œdème sans garantie de réponse rénale. Une pression insuffisante peut placer le rein sous son seuil d’autorégulation."
  },
  "41C": {
    "is_correct": false,
    "enonce": "Considérer toute sonde comme toujours fonctionnelle ; Estimer le VCE à partir de l’ensemble clinique.",
    "justification": "Une obstruction du circuit est fréquente et doit être écartée en premier. Le volume ne se déduit pas de la seule quantité d’urine produite."
  },
  "42E": {
    "is_correct": true,
    "enonce": "Une hypovolémie majeure est moins probable ; Il faut limiter une pression d’insufflation inutilement élevée.",
    "justification": "La stabilité hémodynamique et l’absence de pertes importantes affaiblissent cette hypothèse. Une baisse techniquement possible peut restaurer retour veineux et débit rénal."
  },
  "44A": {
    "is_correct": false,
    "enonce": "Une diurèse normale exclut toute IRA non oligurique ; Une diurèse <0,5 mL/kg/h pendant plus de six heures.",
    "justification": "Une atteinte peut être diagnostiquée par la créatinine malgré une diurèse préservée. Cette durée et ce seuil pondéral correspondent au critère KDIGO urinaire."
  },
  "44B": {
    "is_correct": false,
    "enonce": "Une créatinine inchangée dix minutes après l’agression suffit à rassurer ; Une hausse de créatinine >26,5 µmol/L en 48 heures.",
    "justification": "La cinétique du marqueur est retardée et doit être contrôlée ultérieurement. La variation absolue rapide suffit au diagnostic d’insuffisance aiguë."
  },
  "45A": {
    "is_correct": false,
    "enonce": "Une cause unique doit être imposée avant l’examen ; Une hypoperfusion périopératoire prolongée.",
    "justification": "L’IRA postopératoire est souvent multifactorielle et exige une analyse systématique. Une pression ou un débit insuffisant peut conduire d’une atteinte fonctionnelle à une NTA."
  },
  "45C": {
    "is_correct": false,
    "enonce": "Une cause unique doit être imposée avant l’examen ; Une obstruction urinaire postopératoire.",
    "justification": "L’IRA postopératoire est souvent multifactorielle et exige une analyse systématique. La sonde ou les voies peuvent s’obstruer et créer une cause postrénale."
  },
  "46A": {
    "is_correct": false,
    "enonce": "Prescrire un colloïde de synthèse pour protéger le rein ; Arrêter l’AINS et revoir les autres néphrotoxiques.",
    "justification": "Ces solutions sont à éviter chez le patient critique ou à risque rénal. La suppression de l’inhibition des prostaglandines restaure une part de la capacité d’autorégulation."
  },
  "46C": {
    "is_correct": false,
    "enonce": "Prescrire un colloïde de synthèse pour protéger le rein ; Suivre poids, bilan hydrique, ions et créatinine.",
    "justification": "Ces solutions sont à éviter chez le patient critique ou à risque rénal. Ces paramètres détectent surcharge, hyperkaliémie et progression de l’IRA."
  },
  "47E": {
    "is_correct": true,
    "enonce": "Le traitement par ARA2 ; Une IRC avec DFG à 38 mL/min.",
    "justification": "La diminution de constriction efférente peut faire chuter le DFG lorsque la perfusion baisse. La réserve néphronique réduite augmente la sensibilité à toute nouvelle agression."
  },
  "48A": {
    "is_correct": false,
    "enonce": "Administrer le contraste sans connaître la fonction rénale ; Vérifier si le résultat modifiera la chirurgie.",
    "justification": "Le niveau de DFG conditionne les précautions et le suivi. Une exploration à risque doit avoir une conséquence décisionnelle claire."
  },
  "48C": {
    "is_correct": false,
    "enonce": "Administrer le contraste sans connaître la fonction rénale ; Informer le radiologiste du DFG réduit.",
    "justification": "Le niveau de DFG conditionne les précautions et le suivi. Le protocole et la quantité de contraste peuvent être adaptés au risque."
  },
  "48E": {
    "is_correct": true,
    "enonce": "Rechercher une modalité sans contraste iodé ; Informer le radiologiste du DFG réduit.",
    "justification": "Une échographie ou une autre technique peut parfois fournir l’information nécessaire. Le protocole et la quantité de contraste peuvent être adaptés au risque."
  },
  "49C": {
    "is_correct": false,
    "enonce": "Provoquer une déshydratation avant l’examen ; Utiliser la plus faible dose de contraste utile.",
    "justification": "Un VCE bas diminue la perfusion et augmente le risque d’IRA. Limiter la charge iodée réduit une exposition potentiellement délétère."
  },
  "50A": {
    "is_correct": false,
    "enonce": "La variation est trop faible pour avoir une signification ; Le critère KDIGO de variation absolue est atteint.",
    "justification": "Le seuil diagnostique est inférieur à cette hausse mesurée. L’augmentation dépasse 26,5 µmol/L dans la fenêtre de 48 heures."
  },
  "50B": {
    "is_correct": false,
    "enonce": "La seule valeur permet d’affirmer une obstruction ; La fonction n’est plus stable pour une formule de clairance.",
    "justification": "Le diagnostic d’IRA ne précise pas encore son mécanisme. Une estimation fondée sur un état d’équilibre devient peu fiable pendant la cinétique aiguë."
  },
  "51E": {
    "is_correct": true,
    "enonce": "Un sepsis ou une hypotension non rapportée ; Une hypovolémie intercurrente.",
    "justification": "Ces agressions peuvent expliquer ou amplifier l’insuffisance aiguë. Une baisse du VCE peut s’associer au contraste et au blocage de l’autorégulation."
  },
  "52E": {
    "is_correct": true,
    "enonce": "Obtenir un avis néphrologique ; Différer le geste si le risque chirurgical le permet.",
    "justification": "L’IRC compliquée d’IRA justifie une coordination spécialisée avant reprogrammation. Le rein traverse une atteinte active dont l’agression opératoire pourrait aggraver la gravité."
  },
  "53A": {
    "is_correct": false,
    "enonce": "Le risque rénal est désormais identique à celui d’un sujet sain ; La créatinine est revenue près du niveau basal.",
    "justification": "L’IRC et l’épisode aigu antérieur maintiennent un risque supérieur. L’absence de progression indique une récupération suffisante avant une nouvelle agression."
  },
  "53B": {
    "is_correct": false,
    "enonce": "Le risque rénal est désormais identique à celui d’un sujet sain ; Le patient est euvolémique et la PA habituelle restaurée.",
    "justification": "L’IRC et l’épisode aigu antérieur maintiennent un risque supérieur. Ces conditions protègent la perfusion rénale au moment de l’induction."
  },
  "54B": {
    "is_correct": false,
    "enonce": "Le caractère électif impose d’opérer aujourd’hui ; Le poids dépasse le poids sec de 3,5 kg.",
    "justification": "Un geste non urgent peut être reporté afin de corriger des facteurs majeurs. Cet écart suggère une surcharge hydrosodée cliniquement significative."
  },
  "55B": {
    "is_correct": false,
    "enonce": "La valeur est normale chez tout dialysé ; Une arythmie ventriculaire est possible.",
    "justification": "L’adaptation chronique ne supprime pas le risque électrique d’une kaliémie élevée. Une hyperkaliémie importante peut conduire à une tachyarythmie ou un arrêt."
  },
  "56B": {
    "is_correct": false,
    "enonce": "Poursuivre en comptant sur l’anesthésie pour dialyser ; Organiser une hémodialyse avant reprogrammation.",
    "justification": "L’anesthésie ne remplace aucune fonction d’épuration extracorporelle. La séance retire potassium, acides et excès de volume de manière efficace."
  },
  "56C": {
    "is_correct": false,
    "enonce": "Corriger uniquement par un litre de NaCl 0,9 % ; Réévaluer les ions après la dialyse.",
    "justification": "Le patient est déjà en surcharge et le soluté n’élimine pas le potassium. Le contrôle confirme l’efficacité et l’absence de rebond significatif."
  },
  "57A": {
    "is_correct": false,
    "enonce": "Prélever le bilan directement dans la fistule ; Placer le brassard sur le bras droit.",
    "justification": "L’accès n’est manipulé que par l’équipe entraînée de dialyse. Le membre controlatéral évite les compressions répétées de l’accès."
  },
  "57E": {
    "is_correct": true,
    "enonce": "Interdire les voies veineuses sur le bras gauche ; Vérifier le thrill avant et après l’intervention.",
    "justification": "Une ponction risque hématome, infection et perte du capital vasculaire. Cette vibration confirme la persistance d’un débit dans la fistule."
  },
  "58B": {
    "is_correct": false,
    "enonce": "Compter systématiquement sur le sugammadex ; Choisir fentanyl ou rémifentanil en titration.",
    "justification": "Son usage n’est pas recommandé chez le dialysé du fait de l’élimination rénale. Ces opioïdes n’accumulent pas de métabolite rénal actif majeur."
  },
  "58E": {
    "is_correct": true,
    "enonce": "Utiliser le cisatracurium si une curarisation est nécessaire ; Utiliser un agent volatil moderne.",
    "justification": "L’élimination de Hofmann offre une durée plus prévisible en IRT. Son élimination pulmonaire dépend peu de la fonction rénale."
  },
  "59A": {
    "is_correct": false,
    "enonce": "Considérer tout soluté contenant du potassium comme absolument interdit ; Un soluté balancé en quantité titrée.",
    "justification": "Les solutions balancées augmentent peu la kaliémie et évitent l’acidose chlorée. Le faible potassium contenu n’augmente pas significativement la kaliémie en pratique."
  },
  "59B": {
    "is_correct": false,
    "enonce": "Perfuser plusieurs litres pour forcer une diurèse ; Eviter une charge chlorée massive.",
    "justification": "L’IRT ne répond pas à cette stratégie et la surcharge menacerait les poumons. L’acidose hyperchlorémique peut faire sortir le potassium des cellules."
  },
  "60E": {
    "is_correct": true,
    "enonce": "Contrôler la kaliémie selon les apports et l’évolution ; Vérifier l’absence de curarisation résiduelle.",
    "justification": "Un rebond ou une charge tissulaire peut réélever le potassium après la séance. Une durée prolongée expose à une hypoventilation et une faiblesse postopératoire."
  },
  "61E": {
    "is_correct": true,
    "enonce": "La hauteur des sacs d’irrigation ; Le nombre de sacs utilisés.",
    "justification": "Une pression hydrostatique plus grande favorise le passage dans les sinus veineux. Un volume consommé important signale une exposition et un risque d’absorption accrus."
  },
  "62A": {
    "is_correct": false,
    "enonce": "Amélioration nette de la vigilance ; Céphalée nouvelle.",
    "justification": "Une vigilance meilleure ne soutient pas l’hypothèse d’une encéphalopathie hypoosmolaire. L’hypoosmolarité provoque un œdème cellulaire cérébral symptomatique."
  },
  "62D": {
    "is_correct": true,
    "enonce": "Agitation et confusion ; Nausées dans ce contexte prolongé.",
    "justification": "Une dysfonction neurologique progressive constitue une alerte caractéristique. Elles peuvent accompagner l’hyponatrémie et la surcharge liquidienne."
  },
  "63B": {
    "is_correct": false,
    "enonce": "Augmenter la hauteur des sacs ; Prélever natrémie, osmolarité et hémoglobine.",
    "justification": "Une pression supplémentaire accroît encore l’absorption systémique. Le bilan quantifie le syndrome et recherche une hémorragie masquée par l’irrigation."
  },
  "63C": {
    "is_correct": false,
    "enonce": "Attendre la fin du programme opératoire avant d’agir ; Administrer de l’oxygène et surveiller l’ECG.",
    "justification": "L’évolution neurologique peut devenir rapidement convulsive et mortelle. Désaturation et arythmie peuvent compliquer les formes importantes."
  },
  "63E": {
    "is_correct": true,
    "enonce": "Prélever natrémie, osmolarité et hémoglobine ; Administrer de l’oxygène et surveiller l’ECG.",
    "justification": "Le bilan quantifie le syndrome et recherche une hémorragie masquée par l’irrigation. Désaturation et arythmie peuvent compliquer les formes importantes."
  },
  "64A": {
    "is_correct": false,
    "enonce": "La situation correspond à une hypernatrémie chronique ; Il s’agit d’une hyponatrémie aiguë.",
    "justification": "La concentration a diminué rapidement et non augmenté sur plusieurs jours. Le sodium a chuté de 18 mmol/L pendant l’intervention."
  },
  "64B": {
    "is_correct": false,
    "enonce": "L’osmolarité élevée protège le cerveau ; L’hypoosmolarité explique les signes neurologiques.",
    "justification": "Le résultat est hypoosmolaire et favorise l’œdème cérébral. L’eau entre dans les cellules cérébrales et provoque une encéphalopathie."
  },
  "64E": {
    "is_correct": true,
    "enonce": "La surcharge peut coexister avec l’hyponatrémie ; Il s’agit d’une hyponatrémie aiguë.",
    "justification": "Le liquide d’irrigation apporte simultanément eau libre et expansion volémique. Le sodium a chuté de 18 mmol/L pendant l’intervention."
  },
  "65A": {
    "is_correct": false,
    "enonce": "Quitter la zone monitorée immédiatement ; Restreindre les apports d’eau libre.",
    "justification": "Une aggravation neurologique ou cardiovasculaire reste possible dans les minutes suivantes. Le patient a déjà absorbé une quantité importante de liquide hypotonique."
  },
  "65B": {
    "is_correct": false,
    "enonce": "Perfuser une grande quantité de glucose 5 % ; Administrer du furosémide si la surcharge est significative.",
    "justification": "Ce soluté apporte de l’eau libre et peut aggraver l’hypoosmolarité. Une diurèse préservée permet d’éliminer eau et sodium sous contrôle."
  },
  "66A": {
    "is_correct": false,
    "enonce": "Corriger instantanément la natrémie à 150 mmol/L ; Administrer des bolus de NaCl hypertonique à 3 %.",
    "justification": "Une surcorrection extrême créerait un risque neurologique osmotique majeur. La gravité neurologique justifie une remontée contrôlée et rapide du sodium."
  },
  "66D": {
    "is_correct": true,
    "enonce": "Administrer des bolus de NaCl hypertonique à 3 % ; Poursuivre jusqu’à amélioration clinique ou Na au moins 125 mmol/L.",
    "justification": "La gravité neurologique justifie une remontée contrôlée et rapide du sodium. Ces repères limitent l’exposition tout en traitant l’œdème cérébral menaçant."
  },
  "66E": {
    "is_correct": true,
    "enonce": "Poursuivre jusqu’à amélioration clinique ou Na au moins 125 mmol/L ; Traiter la convulsion par une benzodiazépine adaptée.",
    "justification": "Ces repères limitent l’exposition tout en traitant l’œdème cérébral menaçant. Le midazolam est cité pour interrompre et potentiellement prévenir les crises."
  },
  "68B": {
    "is_correct": false,
    "enonce": "La complication principale est une thrombose de fistule ; Une adduction brutale peut survenir.",
    "justification": "Aucune fistule n’est décrite et le risque spécifique est vésical. La contraction des adducteurs mobilise soudainement la cuisse malgré l’installation."
  },
  "68C": {
    "is_correct": false,
    "enonce": "La localisation supprime toute interaction neuromusculaire ; Le mouvement augmente le risque de perforation.",
    "justification": "Elle crée au contraire l’interaction classique avec le nerf obturateur. Le résectoscope peut pénétrer la paroi lorsque le bassin ou la jambe bouge."
  },
  "68E": {
    "is_correct": true,
    "enonce": "Le nerf obturateur chemine près de la paroi latérale ; Une adduction brutale peut survenir.",
    "justification": "La proximité rend la stimulation électrique possible pendant la résection. La contraction des adducteurs mobilise soudainement la cuisse malgré l’installation."
  },
  "69E": {
    "is_correct": true,
    "enonce": "Monitorage quantitatif du bloc ; Concertation explicite avec l’urologue avant l’incision.",
    "justification": "La profondeur de curarisation doit être suffisante pendant le temps de résection latérale. La localisation tumorale doit être connue pour anticiper le temps à risque."
  },
  "70A": {
    "is_correct": false,
    "enonce": "Une augmentation certaine du retour d’irrigation ; Un retour d’irrigation inférieur au volume injecté.",
    "justification": "La fuite diminue plutôt la quantité de liquide récupérée. Le liquide s’extravase dans les tissus au lieu de revenir par le circuit."
  },
  "70C": {
    "is_correct": false,
    "enonce": "Une augmentation certaine du retour d’irrigation ; Une bradycardie vagale inexpliquée.",
    "justification": "La fuite diminue plutôt la quantité de liquide récupérée. Une perforation importante peut stimuler le péritoine et déclencher un réflexe vagal."
  },
  "72A": {
    "is_correct": false,
    "enonce": "Le phénomène confirme une hyperkaliémie certaine ; Un mécanisme vagal est plausible.",
    "justification": "Aucun dosage ni signe spécifique ne permet d’imposer ce diagnostic. La stimulation péritonéale ou vésicale peut ralentir brutalement le rythme."
  },
  "73A": {
    "is_correct": false,
    "enonce": "Aucune imagerie ne peut aider ; Une perforation extrapéritonéale peut rester peu symptomatique.",
    "justification": "Une imagerie ou une exploration permet de préciser fuite et distribution du liquide. L’extravasation pelvienne limitée provoque souvent des signes locaux modérés."
  },
  "73C": {
    "is_correct": false,
    "enonce": "Aucune imagerie ne peut aider ; Une instabilité augmente la probabilité d’une forme importante.",
    "justification": "Une imagerie ou une exploration permet de préciser fuite et distribution du liquide. Hypotension, hypertension ou bradycardie accompagnent les perforations significatives."
  },
  "73E": {
    "is_correct": true,
    "enonce": "Une instabilité augmente la probabilité d’une forme importante ; Une perforation extrapéritonéale peut rester peu symptomatique.",
    "justification": "Hypotension, hypertension ou bradycardie accompagnent les perforations significatives. L’extravasation pelvienne limitée provoque souvent des signes locaux modérés."
  },
  "74B": {
    "is_correct": false,
    "enonce": "Aucune surveillance abdominale après réparation ; La chronologie de la bradycardie et de la pression.",
    "justification": "Une fuite persistante, un iléus ou une instabilité peuvent se manifester secondairement. Le lien avec la distension documente le retentissement physiologique."
  },
  "75E": {
    "is_correct": true,
    "enonce": "Une baisse postopératoire de la fonction rénale ; Une hémorragie massive.",
    "justification": "Le retrait d’un rein diminue la masse néphronique et sollicite le rein restant. Les tumeurs volumineuses peuvent être très vascularisées et la dissection cave est à haut risque."
  },
  "76A": {
    "is_correct": false,
    "enonce": "Aucun moyen de réchauffement ; Plusieurs accès veineux fiables de gros calibre.",
    "justification": "Une longue chirurgie et la transfusion exposent à une hypothermie et une coagulopathie. Ils permettent transfusion et remplissage rapide si une veine majeure est ouverte."
  },
  "76D": {
    "is_correct": true,
    "enonce": "Une coordination explicite lors de la manipulation du thrombus ; Plusieurs accès veineux fiables de gros calibre.",
    "justification": "L’équipe doit annoncer les temps de contrôle cave et le risque embolique. Ils permettent transfusion et remplissage rapide si une veine majeure est ouverte."
  },
  "77A": {
    "is_correct": false,
    "enonce": "Considérer le positionnement comme sans effet hémodynamique ; Protéger les points d’appui et le plexus brachial.",
    "justification": "Le retour veineux et la ventilation peuvent changer après l’installation. La durée et la traction peuvent provoquer neuropathie ou lésion cutanée."
  },
  "77C": {
    "is_correct": false,
    "enonce": "Considérer le positionnement comme sans effet hémodynamique ; Eviter une compression abdominale excessive.",
    "justification": "Le retour veineux et la ventilation peuvent changer après l’installation. Une pression inutile compromet retour veineux et perfusion du rein restant."
  },
  "77D": {
    "is_correct": true,
    "enonce": "Eviter une compression abdominale excessive ; Protéger les points d’appui et le plexus brachial.",
    "justification": "Une pression inutile compromet retour veineux et perfusion du rein restant. La durée et la traction peuvent provoquer neuropathie ou lésion cutanée."
  },
  "77E": {
    "is_correct": true,
    "enonce": "Protéger les points d’appui et le plexus brachial ; Vérifier la ventilation après la mise en position.",
    "justification": "La durée et la traction peuvent provoquer neuropathie ou lésion cutanée. Le décubitus latéral modifie compliance, rapports ventilation-perfusion et position de la sonde."
  },
  "78B": {
    "is_correct": false,
    "enonce": "La pression invasive est inutile pendant cet épisode ; Une obstruction ou un clampage de la VCI diminue la précharge.",
    "justification": "La mesure continue guide la réanimation et objecte la réponse aux gestes correcteurs. Le retour veineux des membres inférieurs ne rejoint plus normalement le cœur."
  },
  "78D": {
    "is_correct": true,
    "enonce": "Une ouverture veineuse peut provoquer une hémorragie rapide ; Une obstruction ou un clampage de la VCI diminue la précharge.",
    "justification": "La VCI et les collatérales peuvent perdre un volume important en quelques instants. Le retour veineux des membres inférieurs ne rejoint plus normalement le cœur."
  },
  "78E": {
    "is_correct": true,
    "enonce": "Une obstruction ou un clampage de la VCI diminue la précharge ; Une embolie du thrombus doit être envisagée.",
    "justification": "Le retour veineux des membres inférieurs ne rejoint plus normalement le cœur. Une obstruction pulmonaire aiguë peut donner hypotension et défaillance droite."
  },
  "79B": {
    "is_correct": false,
    "enonce": "Forcer uniquement une diurèse par furosémide ; Activer la transfusion préparée.",
    "justification": "Le diurétique ne restaure ni le volume sanguin perdu ni la pression de filtration. Les pertes rapides exigent globules et correction de l’hémostase selon le bilan."
  },
  "79C": {
    "is_correct": false,
    "enonce": "Forcer uniquement une diurèse par furosémide ; Maintenir une pression compatible avec la perfusion rénale.",
    "justification": "Le diurétique ne restaure ni le volume sanguin perdu ni la pression de filtration. Une hypotension prolongée menace la médulla et le rein qui restera fonctionnel."
  },
  "80A": {
    "is_correct": false,
    "enonce": "Utiliser de la mépéridine répétée ; Une péridurale peut être utile si l’hémostase est compatible.",
    "justification": "La normépéridine neurotoxique peut s’accumuler si le DFG baisse. Le contrôle de douleur sous-costale favorise ventilation profonde et mobilisation."
  },
  "80C": {
    "is_correct": false,
    "enonce": "Utiliser de la mépéridine répétée ; Préférer un opioïde sans métabolite actif rénal majeur.",
    "justification": "La normépéridine neurotoxique peut s’accumuler si le DFG baisse. La fonction diminuée après néphrectomie augmente le risque d’accumulation."
  },
  "81A": {
    "is_correct": false,
    "enonce": "Tolérer une hypotension prolongée puisque l’autre rein a été retiré ; Maintenir une pression artérielle adéquate.",
    "justification": "La perte de réserve rend au contraire la protection hémodynamique encore plus importante. Le rein unique doit conserver une perfusion suffisante pendant la phase de récupération."
  },
  "81B": {
    "is_correct": false,
    "enonce": "Tolérer une hypotension prolongée puisque l’autre rein a été retiré ; Suivre la cinétique de créatinine.",
    "justification": "La perte de réserve rend au contraire la protection hémodynamique encore plus importante. Une hausse rapide permet de diagnostiquer précocement une IRA postopératoire."
  },
  "81C": {
    "is_correct": false,
    "enonce": "Tolérer une hypotension prolongée puisque l’autre rein a été retiré ; Surveiller diurèse et bilan hydrique sans viser un chiffre isolé.",
    "justification": "La perte de réserve rend au contraire la protection hémodynamique encore plus importante. La tendance renseigne mais doit rester confrontée au VCE et à la fonction biologique."
  },
  "82A": {
    "is_correct": false,
    "enonce": "Retirer systématiquement les reins natifs ; Protéger l’accès de dialyse.",
    "justification": "Ils restent habituellement en place pendant l’implantation standard. La fistule reste indispensable tant que la fonction du greffon n’est pas durablement établie."
  },
  "82B": {
    "is_correct": false,
    "enonce": "Retirer systématiquement les reins natifs ; Vérifier poids sec et potassium.",
    "justification": "Ils restent habituellement en place pendant l’implantation standard. Ces données confirment l’optimisation volumique et ionique avant l’implantation."
  },
  "82E": {
    "is_correct": true,
    "enonce": "Préparer le protocole d’immunosuppression ; Planifier une PAM compatible avec la perfusion du greffon.",
    "justification": "Les traitements doivent être administrés selon la chronologie de transplantation. Une cible anticipée permet de réagir rapidement au déclampage."
  },
  "83D": {
    "is_correct": true,
    "enonce": "Raccord de l’uretère du greffon à la vessie ; Anastomose de la veine rénale à la veine iliaque externe.",
    "justification": "Cette étape crée la voie d’évacuation de l’urine produite. Ce raccord assure le drainage veineux du greffon dans le réseau pelvien."
  },
  "84B": {
    "is_correct": false,
    "enonce": "Une hypovolémie volontaire pour prévenir la diurèse ; Une PAM proche de la cible de 70 à 90 mmHg.",
    "justification": "Un VCE insuffisant compromet directement la perfusion et la reprise du greffon. Cette pression est recommandée chez la plupart des receveurs au moment de la reperfusion."
  },
  "84C": {
    "is_correct": false,
    "enonce": "Une hypovolémie volontaire pour prévenir la diurèse ; Une mesure récente du potassium.",
    "justification": "Un VCE insuffisant compromet directement la perfusion et la reprise du greffon. La solution de conservation peut ajouter une charge potassique au déclampage."
  },
  "84E": {
    "is_correct": true,
    "enonce": "Un VCE jugé satisfaisant ; Une PAM proche de la cible de 70 à 90 mmHg.",
    "justification": "Une précharge adéquate soutient le débit dans le lit vasculaire nouvellement ouvert. Cette pression est recommandée chez la plupart des receveurs au moment de la reperfusion."
  },
  "85A": {
    "is_correct": false,
    "enonce": "Considérer que la pression n’influence pas le nouveau rein ; Administrer un vasopresseur titré si le VCE est suffisant.",
    "justification": "La perfusion du greffon dépend directement du gradient artériel disponible. Une faible dose restaure la PAM sans imposer une charge liquidienne excessive."
  },
  "85B": {
    "is_correct": false,
    "enonce": "Perfuser aveuglément plusieurs litres ; Vérifier l’absence d’hémorragie ou d’obstacle au retour.",
    "justification": "Une surcharge peut provoquer un œdème pulmonaire sans améliorer la fonction du greffon. Une cause mécanique doit être corrigée plutôt que masquée par les médicaments."
  },
  "85C": {
    "is_correct": false,
    "enonce": "Considérer que la pression n’influence pas le nouveau rein ; Maintenir la cible plutôt que tolérer 48 mmHg.",
    "justification": "La perfusion du greffon dépend directement du gradient artériel disponible. Une faible pression après reperfusion expose le greffon à une hypoperfusion immédiate."
  },
  "85D": {
    "is_correct": true,
    "enonce": "Vérifier l’absence d’hémorragie ou d’obstacle au retour ; Maintenir la cible plutôt que tolérer 48 mmHg.",
    "justification": "Une cause mécanique doit être corrigée plutôt que masquée par les médicaments. Une faible pression après reperfusion expose le greffon à une hypoperfusion immédiate."
  },
  "86E": {
    "is_correct": true,
    "enonce": "La solution de conservation est une source plausible ; Une anomalie ECG peut précéder l’arythmie.",
    "justification": "Elle contient une quantité non négligeable de potassium libéré à la reperfusion. Les ondes T et la conduction se modifient lorsque le potassium extracellulaire augmente."
  },
  "87A": {
    "is_correct": false,
    "enonce": "Il faut conclure immédiatement au rejet chronique ; Elle ne prouve pas à elle seule une hypovolémie.",
    "justification": "Le délai et le contexte imposent d’abord les causes périopératoires aiguës. Certains greffons reprennent tardivement malgré un volume et une pression adéquats."
  },
  "87B": {
    "is_correct": false,
    "enonce": "Il faut conclure immédiatement au rejet chronique ; Une thrombose artérielle doit être recherchée.",
    "justification": "Le délai et le contexte imposent d’abord les causes périopératoires aiguës. L’occlusion prive le greffon de perfusion et constitue une urgence de sauvetage."
  },
  "87E": {
    "is_correct": true,
    "enonce": "Un hématome compressif est un diagnostic possible ; Elle ne prouve pas à elle seule une hypovolémie.",
    "justification": "Une collection autour du greffon peut altérer les vaisseaux ou l’uretère. Certains greffons reprennent tardivement malgré un volume et une pression adéquats."
  },
  "88A": {
    "is_correct": false,
    "enonce": "Injecter des litres jusqu’à apparition d’urines ; Réaliser une échographie du greffon.",
    "justification": "Une surcharge ne corrige ni thrombose ni retard de fonction et menace les poumons. L’examen montre perfusion artérielle, drainage veineux et collections périrénales."
  },
  "88B": {
    "is_correct": false,
    "enonce": "Retirer toute surveillance biologique ; Contrôler la perméabilité de la sonde urinaire.",
    "justification": "Potassium, acidose et créatinine restent pertinents tant que le greffon ne fonctionne pas. Un obstacle distal simple peut simuler une absence de production."
  },
  "88E": {
    "is_correct": true,
    "enonce": "Maintenir la pression de perfusion pendant l’investigation ; Réaliser une échographie du greffon.",
    "justification": "Le diagnostic ne doit pas s’accompagner d’une nouvelle hypoperfusion du greffon. L’examen montre perfusion artérielle, drainage veineux et collections périrénales."
  },
  "89B": {
    "is_correct": false,
    "enonce": "L’absence de douleur thoracique autorise un report prolongé ; L’hypotension indique une atteinte systémique grave.",
    "justification": "Le pronostic est dominé par le sepsis urinaire obstructif, indépendamment d’une douleur coronaire. Le choc septique compromet la perfusion rénale et le pronostic vital."
  },
  "89C": {
    "is_correct": false,
    "enonce": "L’absence de douleur thoracique autorise un report prolongé ; Les antibiotiques seuls ne lèvent pas l’obstacle.",
    "justification": "Le pronostic est dominé par le sepsis urinaire obstructif, indépendamment d’une douleur coronaire. La source infectée sous pression nécessite un drainage mécanique."
  },
  "89E": {
    "is_correct": true,
    "enonce": "L’hypotension indique une atteinte systémique grave ; Les antibiotiques seuls ne lèvent pas l’obstacle.",
    "justification": "Le choc septique compromet la perfusion rénale et le pronostic vital. La source infectée sous pression nécessite un drainage mécanique."
  },
  "90A": {
    "is_correct": false,
    "enonce": "Une prostatectomie radicale immédiate ; Une sonde urétérale double J.",
    "justification": "Ce geste n’a aucune indication dans un calcul urétéral infecté. Le dispositif franchit l’obstacle et permet l’écoulement vers la vessie."
  },
  "90B": {
    "is_correct": false,
    "enonce": "Une simple observation sans drainage ; Une néphrostomie percutanée.",
    "justification": "L’obstacle entretient le foyer et l’instabilité septique. Le drainage direct du bassinet est possible lorsque les cavités sont dilatées."
  },
  "90C": {
    "is_correct": false,
    "enonce": "Une prostatectomie radicale immédiate ; Le choix dépend notamment de la coagulation.",
    "justification": "Ce geste n’a aucune indication dans un calcul urétéral infecté. La voie percutanée devient dangereuse en cas de coagulopathie non corrigée."
  },
  "90E": {
    "is_correct": true,
    "enonce": "Une néphrostomie percutanée ; Le choix dépend notamment de la coagulation.",
    "justification": "Le drainage direct du bassinet est possible lorsque les cavités sont dilatées. La voie percutanée devient dangereuse en cas de coagulopathie non corrigée."
  },
  "91E": {
    "is_correct": true,
    "enonce": "Préparer une induction hémodynamiquement titrée ; Corriger une hypovolémie par apports titrés.",
    "justification": "Les hypnotiques peuvent précipiter un collapsus chez un patient déjà vasoplégique. Le sepsis diminue le VCE efficace et la perfusion glomérulaire."
  },
  "92E": {
    "is_correct": true,
    "enonce": "Des bactéries peuvent être libérées dans le sang ; La vasoplégie peut augmenter.",
    "justification": "Le franchissement et la décompression mobilisent le contenu infecté des cavités. La réponse inflammatoire systémique s’intensifie lors de la bactériémie."
  },
  "93C": {
    "is_correct": false,
    "enonce": "Administrer un AINS pour protéger le rein ; Réévaluer lactate, diurèse et perfusion périphérique.",
    "justification": "L’inhibition des prostaglandines aggrave l’autorégulation dans le choc. La tendance de ces paramètres mesure la réponse globale à la réanimation."
  },
  "93E": {
    "is_correct": true,
    "enonce": "Titrer le vasopresseur vers une PAM adaptée ; Réévaluer lactate, diurèse et perfusion périphérique.",
    "justification": "Le soutien maintient perfusion rénale et cérébrale pendant la vasoplégie. La tendance de ces paramètres mesure la réponse globale à la réanimation."
  },
  "94A": {
    "is_correct": false,
    "enonce": "Une diurèse après drainage exclut toute lésion ; Comparer la créatinine à une valeur basale.",
    "justification": "Une atteinte intrinsèque peut persister malgré la levée de l’obstacle. Une hausse absolue ou relative dans les fenêtres KDIGO permet de poser le diagnostic."
  },
  "94B": {
    "is_correct": false,
    "enonce": "Une seule valeur de créatinine indique la durée exacte de l’atteinte ; Mesurer la diurèse en mL/kg/h et sa durée.",
    "justification": "La cinétique et l’historique sont indispensables pour dater la dégradation. Le critère urinaire exige moins de 0,5 mL/kg/h pendant plus de six heures."
  },
  "94C": {
    "is_correct": false,
    "enonce": "Une diurèse après drainage exclut toute lésion ; Reconnaître une origine probablement multifactorielle.",
    "justification": "Une atteinte intrinsèque peut persister malgré la levée de l’obstacle. Hypoperfusion, inflammation septique et obstruction ont pu agir simultanément."
  },
  "94E": {
    "is_correct": true,
    "enonce": "Reconnaître une origine probablement multifactorielle ; Comparer la créatinine à une valeur basale.",
    "justification": "Hypoperfusion, inflammation septique et obstruction ont pu agir simultanément. Une hausse absolue ou relative dans les fenêtres KDIGO permet de poser le diagnostic."
  }
});

function applyQcmBalance(series) {
  let qcmIndex = 0;
  for (const serie of series) {
    for (const question of serie.questions || []) {
      if (question.format !== "qcm") continue;
      for (const item of question.items) {
        const override = QCM_BALANCE_OVERRIDES[`${qcmIndex}${item.lettre}`];
        if (override) Object.assign(item, override);
      }
      qcmIndex += 1;
    }
  }
  return series;
}

export function buildChapter26(extract) {
  const chapter = {
    fiche: buildFiche(),
    flashcards: buildFlashcards(),
    series: [
      ...buildIsolatedQcm(),
      ...buildDpQcm(),
      ...buildIsolatedQroc(),
      ...buildDpQroc(),
    ],
  };
  applyQcmBalance(chapter.series);
  validateSourceBlocks(
    chapter,
    new Set((extract.blocs || []).map((b) => b.id)),
  );
  return chapter;
}
export default buildChapter26;
