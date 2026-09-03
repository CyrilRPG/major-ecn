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
          F(
            "Sécréter l’insuline en réponse à une hyperglycémie.",
            "Cette sécrétion endocrine appartient aux cellules bêta du pancréas et non au parenchyme rénal.",
          ),
          T(
            "Sécréter la rénine à partir de l’appareil juxtaglomérulaire.",
            "Cette enzyme initie la cascade angiotensine-aldostérone qui régule l’hémodynamique.",
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
          F(
            "Sa consommation d’oxygène est la plus faible du parenchyme rénal.",
            "Le transport actif intense de la branche ascendante large y impose une demande métabolique élevée.",
          ),
          F(
            "Elle reçoit 85 % du débit rénal.",
            "Cette proportion concerne le cortex et non le compartiment médullaire.",
          ),
          F(
            "Son extraction d’oxygène reste proche de 18 %.",
            "Cette valeur correspond au cortex, dont la marge d’oxygénation demeure bien plus confortable.",
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
          F(
            "L’artériole afférente se contracte sous l’effet des prostaglandines.",
            "Les prostaglandines exercent une action vasodilatatrice sur l’artériole d’entrée.",
          ),
          F(
            "L’inhibition de l’enzyme de conversion renforce la constriction efférente.",
            "Le blocage de la formation d’angiotensine II diminue justement cette constriction d’aval.",
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
          F(
            "Les IEC augmentent la production pulmonaire d’angiotensine II.",
            "Ils bloquent l’enzyme de conversion et réduisent donc la formation d’angiotensine II.",
          ),
          F(
            "Les ARA2 agissent en stimulant la synthèse rénale de prostaglandines.",
            "Leur cible est le récepteur AT1 de l’angiotensine, sans effet direct sur cette voie.",
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
          F(
            "Sa baisse freine la sécrétion de rénine par l’appareil juxtaglomérulaire.",
            "La chute de perfusion rénale augmente au lieu de réduire la libération de rénine.",
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
          F(
            "L’ADH ouvre les aquaporines de la branche ascendante large de Henlé.",
            "Ce segment reste imperméable à l’eau et les aquaporines concernées siègent dans le tubule collecteur.",
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
          F(
            "Une créatininémie normale garantit un DFG supérieur à 90 mL/min.",
            "Une valeur dans les normes peut coexister avec une perte de filtration de près de moitié.",
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
          F(
            "Appliquer un coefficient de 0,85 chez l’homme.",
            "Ce facteur correctif s’applique à la femme, l’homme conservant un coefficient de 1.",
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
          T(
            "La présence de charges négatives dans la lumière tubulaire.",
            "Un anion peu réabsorbé comme le bicarbonate favorise la sécrétion de potassium.",
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
          F(
            "Sécréter l’ammonium au niveau du glomérule.",
            "L’ammoniogenèse et la sécrétion de NH4+ sont des fonctions tubulaires et non glomérulaires.",
          ),
          F(
            "Utiliser l’albumine filtrée comme principal acide titrable.",
            "Les tampons urinaires sont surtout les phosphates, l’albumine n’étant normalement pas filtrée.",
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
          T(
            "Le fentanyl en titration.",
            "Il ne forme pas de métabolite actif à élimination urinaire, ce qui rend son effet prévisible.",
          ),
        ],
      ),
      qcm(
        "Quels risques sont associés aux opioïdes en IRC sévère ?",
        "b00079",
        "Le choix dépend des métabolites : M6G et normépéridine imposent d’éviter morphine et mépéridine répétées.",
        [
          F(
            "La morphine-6-glucuronide est un métabolite inactif éliminé par le foie.",
            "Ce dérivé est actif et son élimination urinaire explique son accumulation en insuffisance rénale.",
          ),
          F(
            "La normépéridine provient de l’hydrolyse plasmatique du rémifentanil.",
            "Elle dérive de la mépéridine, le rémifentanil donnant un produit sans activité clinique.",
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
          T(
            "Réserver le sugammadex aux patients dont la clairance dépasse 30 mL/min.",
            "La monographie déconseille son usage sous ce seuil et chez le dialysé, les complexes étant éliminés par le rein.",
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
          F(
            "Réduire la dose de rifampicine proportionnellement à la baisse du DFG.",
            "Cet antituberculeux suit une élimination biliaire et hépatique qui ne dépend pas de la filtration.",
          ),
          F(
            "Considérer qu’une hypoalbuminémie abaisse la fraction libre des molécules fortement liées.",
            "Une albumine basse laisse davantage de molécule libre et augmente l’effet pharmacologique.",
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
          T(
            "Comparer la valeur à une créatinine basale connue.",
            "La référence antérieure permet de mesurer la variation absolue ou relative exigée par KDIGO.",
          ),
          T(
            "Une anurie de plus de douze heures.",
            "Elle correspond au stade le plus sévère du critère urinaire des recommandations KDIGO.",
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
          F(
            "Une pression artérielle peropératoire maintenue au-dessus de la limite d’autorégulation.",
            "Conserver la pression dans cette zone protège le rein plutôt que de l’exposer.",
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
          F(
            "Administrer du mannitol en prévention chez tout opéré à risque.",
            "Aucun diurétique osmotique n’a démontré de prévention de l’IRA et il peut aggraver la surcharge.",
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
          F(
            "Toute kaliémie supérieure à 5,0 mmol/L impose une épuration extracorporelle immédiate.",
            "Ce niveau se corrige habituellement par le traitement médical lorsque la diurèse est préservée.",
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
          T(
            "Une hématurie microscopique persistante d’origine glomérulaire.",
            "Un marqueur durable d’atteinte rénale participe à la définition même si le DFG dépasse 60 mL/min.",
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
          T(
            "Un épisode d’IRA peut accélérer l’évolution vers une IRC.",
            "Les deux entités sont interreliées et une agression aiguë laisse souvent une perte néphronique définitive.",
          ),
        ],
      ),
      qcm(
        "Que faut-il vérifier chez un patient dialysé avant chirurgie ?",
        ["b00119", "b00120", "b00124"],
        "L’évaluation précise stabilité, dialyse récente, poids sec, ions et protection de l’accès vasculaire.",
        [
          F(
            "Fixer la dernière séance de dialyse à plus de 72 heures avant un geste électif.",
            "Un intervalle aussi long favorise surcharge, hyperkaliémie et acidose au moment de l’induction.",
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
          T(
            "La nécessité d’une épuration peropératoire jugée cas par cas.",
            "Le besoin dépend du statut clinique, de la durée et du type de geste programmé.",
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
          F(
            "Ponctionner la fistule pour réaliser le bilan sanguin préopératoire.",
            "L’accès est réservé à l’équipe de dialyse et toute ponction menace sa perméabilité.",
          ),
          F(
            "Comprimer la fistule sous l’appui de table.",
            "Une pression prolongée peut interrompre le flux et thromboser l’accès.",
          ),
          T(
            "Signaler le membre porteur au chirurgien et à l’équipe d’installation.",
            "L’identification explicite évite brassard, garrot et appui pendant toute la trajectoire.",
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
          F(
            "Une solution salée isotonique est utilisée pour l’irrigation en résection monopolaire.",
            "Le courant monopolaire impose un liquide non électrolytique comme la glycine 1,5 %.",
          ),
          T(
            "La glycine 1,5 % peut être utilisée en monopolaire.",
            "Cette solution légèrement hypotonique est non électrolytique.",
          ),
          T(
            "Un niveau sensitif T10 est requis en neuraxiale.",
            "Ce niveau couvre les afférences du geste sur prostate ou vessie.",
          ),
          T(
            "Le volume d’irrigation consommé doit être suivi tout au long du geste.",
            "La quantité et la pression conditionnent l’absorption systémique et le risque de syndrome RTUP.",
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
          T(
            "Une pression d’irrigation dépassant celle des sinus veineux ouverts.",
            "Le gradient pousse le liquide hypotonique vers la circulation prostatique.",
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
          T(
            "Troubles visuels transitoires et nausées.",
            "La glycine absorbée peut altérer temporairement la vision et provoquer des vomissements.",
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
          T(
            "Contrôler la vitesse de remontée de la natrémie.",
            "Une correction trop rapide expose à une démyélinisation osmotique centrale.",
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
          F(
            "Le premier signe est une élévation isolée de la créatinine.",
            "La perforation se traduit d’abord par un retour d’irrigation diminué, des douleurs et des signes vagaux.",
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
          T(
            "Une antibiothérapie systémique doit accompagner le geste de drainage.",
            "Contrôle de source et traitement antimicrobien sont complémentaires dans le sepsis urinaire.",
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
          T(
            "Une neuropathie par étirement du plexus brachial sur appui scapulaire.",
            "Les supports d’épaule nécessaires à l’inclinaison peuvent comprimer ou tracter les racines nerveuses.",
          ),
        ],
      ),
      qcm(
        "Quels enjeux caractérisent une néphrectomie pour tumeur volumineuse ?",
        ["b00155", "b00156", "b00157", "b00159"],
        "Le geste associe position latérale, hémorragie possible, extension veineuse et protection du capital rénal restant.",
        [
          F(
            "L’extension veineuse concerne plus de la moitié des carcinomes rénaux.",
            "Un thrombus cave est décrit dans environ cinq à dix pour cent des cas.",
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
          T(
            "Une hypothermie peropératoire par exposition prolongée.",
            "La durée, la laparotomie et les apports non réchauffés abaissent la température centrale.",
          ),
        ],
      ),
      qcm(
        "Quels principes guident l’analgésie des chirurgies rénales ouvertes ?",
        ["b00158", "b00164"],
        "Les incisions sous-costales ou médianes sont douloureuses et justifient une analgésie multimodale adaptée à l’hémostase.",
        [
          F(
            "La voie péridurale est contre-indiquée après toute néphrectomie ouverte.",
            "Elle est souvent proposée pour l’incision sous-costale lorsque l’hémostase le permet.",
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
          F(
            "Le greffon provient exclusivement de donneurs vivants apparentés.",
            "Les greffons proviennent aussi de donneurs décédés, après décès neurologique ou circulatoire.",
          ),
          T(
            "Les anastomoses utilisent habituellement les vaisseaux iliaques externes.",
            "La veine et l’artère du greffon sont raccordées dans la fosse iliaque.",
          ),
          T(
            "Les reins natifs restent habituellement en place.",
            "La procédure standard implante le greffon en fosse iliaque sans néphrectomie d’origine.",
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
          F(
            "Instaurer une hypotension contrôlée à 55 mmHg pour limiter le saignement du greffon.",
            "La plage recommandée à la reperfusion se situe entre 70 et 90 mmHg chez la plupart des receveurs.",
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
          T(
            "Du calcium intraveineux doit être immédiatement disponible.",
            "Il stabilise la membrane myocardique si l’hyperkaliémie de reperfusion modifie l’ECG.",
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
          F(
            "Une oligurie précoce impose de conclure à un rejet hyperaigu.",
            "Le retard de reprise et les complications vasculaires sont bien plus fréquents à ce stade.",
          ),
          F(
            "Une diurèse obtenue par mannitol confirme la perméabilité artérielle.",
            "Seule l’imagerie vasculaire renseigne sur le flux ; un diurétique ne l’explore pas.",
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
          F(
            "La dysfonction préexistante disparaît dès la fin de l’anastomose artérielle.",
            "Comorbidités et retentissement de l’insuffisance terminale persistent jusqu’à reprise effective.",
          ),
          F(
            "L’immunosuppression débute seulement au septième jour postopératoire.",
            "La prévention du rejet commence autour de la transplantation, dès la période périopératoire.",
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
          F(
            "Blocage du cotransporteur Na-K-2Cl de l’anse de Henlé par le pneumopéritoine.",
            "Ce transporteur est la cible des diurétiques de l’anse et non de la pression abdominale.",
          ),
          T(
            "Réponse endocrine avec ADH et activation du SRAA.",
            "Le stress chirurgical favorise la rétention d’eau et de sodium et diminue la diurèse.",
          ),
          T(
            "Compression du parenchyme rénal par la pression d’insufflation.",
            "La pression transmise écrase les capillaires péritubulaires et diminue la filtration.",
          ),
          T(
            "Diminution du débit cardiaque secondaire à la compression cave.",
            "Un retour veineux réduit abaisse le débit et donc le flux sanguin rénal.",
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
          T(
            "Une réévaluation de la diurèse après décompression est justifiée.",
            "La reprise du débit urinaire conforte l’origine mécanique du phénomène observé.",
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
          F(
            "Une diurèse inférieure à 0,5 mL/kg/h pendant deux heures.",
            "Le critère urinaire exige une durée supérieure à six heures.",
          ),
          F(
            "Une hausse de créatinine supérieure à 26,5 µmol/L en sept jours.",
            "La variation absolue s’apprécie dans une fenêtre de 48 heures, le délai de sept jours servant au critère relatif.",
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
          F(
            "Une hypoperfusion peropératoire produit systématiquement une nécrose corticale bilatérale.",
            "L’atteinte habituelle est une nécrose tubulaire aiguë, souvent réversible.",
          ),
          T(
            "Une exposition médicamenteuse néphrotoxique.",
            "AINS, contraste et autres agents doivent être revus dans la chronologie.",
          ),
          F(
            "Une obstruction urinaire est écartée par la seule persistance d’une diurèse.",
            "Une obstruction partielle ou une sonde en partie perméable laisse persister un débit urinaire.",
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
          F(
            "Remplacer l’AINS par un inhibiteur sélectif de COX-2 sans autre précaution.",
            "L’inhibition des prostaglandines rénales persiste avec les coxibs et le risque demeure.",
          ),
          T(
            "Adapter les posologies au DFG actuel.",
            "La clairance diminuée expose à l’accumulation des traitements prescrits.",
          ),
          F(
            "Prescrire un diurétique de l’anse pour convertir l’oligurie en forme protectrice.",
            "Le furosémide augmente le volume urinaire sans améliorer la récupération ni le pronostic.",
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
          T(
            "L’âge avancé du patient.",
            "La perte néphronique liée au vieillissement réduit la marge fonctionnelle disponible.",
          ),
        ],
      ),
      qcm(
        "Comment raisonner sur l’angioscanner iodé ?",
        ["b00098", "b00103"],
        "Le contraste n’est pas automatiquement interdit mais son indication et les alternatives sans iode doivent être discutées.",
        [
          F(
            "Un DFG à 38 mL/min contre-indique formellement toute injection iodée.",
            "L’examen reste possible si son résultat est déterminant, avec précautions et dose minimale.",
          ),
          T(
            "Rechercher une modalité sans contraste iodé.",
            "Une échographie ou une autre technique peut parfois fournir l’information nécessaire.",
          ),
          F(
            "Le risque disparaît si l’injection est fractionnée en deux temps.",
            "La charge totale d’iode et le terrain déterminent le danger, pas le fractionnement.",
          ),
          F(
            "Administrer le contraste sans connaître la fonction rénale.",
            "Le niveau de DFG conditionne les précautions et le suivi.",
          ),
          T(
            "Prévoir un contrôle de créatinine 48 à 72 heures après l’injection.",
            "L’atteinte au produit de contraste se manifeste par une hausse retardée du marqueur.",
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
          F(
            "Fixer un volume de contraste indépendant du poids et du DFG.",
            "La charge iodée doit être réduite et adaptée au terrain pour limiter l’exposition.",
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
          F(
            "Le critère relatif de 50 % en sept jours est ici satisfait.",
            "La progression de 160 à 192 µmol/L représente environ 20 %, en deçà de ce critère.",
          ),
          F(
            "Une formule de Cockcroft-Gault appliquée maintenant donnera une clairance fiable.",
            "Ces équations supposent une créatinine stable, ce que la phase aiguë interdit.",
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
          T(
            "Une néphrotoxicité associée, par exemple un aminoside.",
            "Ces antibiotiques s’accumulent et provoquent une atteinte tubulaire dose-dépendante.",
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
          T(
            "Reprogrammer après retour de la créatinine près de sa valeur basale.",
            "Une fonction stabilisée diminue le risque d’aggravation lors d’une nouvelle agression.",
          ),
        ],
        "L’intervention vasculaire est élective et peut être repoussée de deux semaines sans perte de chance.",
      ),
      qcm(
        "Quels éléments valident la reprogrammation ?",
        ["b00095", "b00117", "b00120"],
        "La reprise suppose une fonction stabilisée, un VCE normal, des traitements revus et un plan de surveillance renforcé.",
        [
          F(
            "La créatinine à 164 µmol/L correspond à une fonction rénale normale.",
            "Cette valeur reste celle d’une atteinte chronique avancée, simplement revenue au niveau habituel.",
          ),
          F(
            "Un poids stable suffit à affirmer que les ions sont corrects.",
            "Le poids renseigne sur le volume mais ne remplace ni ionogramme ni examen clinique.",
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
          F(
            "Le poids sec est atteint puisque l’écart mesuré reste inférieur à 5 kg.",
            "Un excès de 3,5 kg au-dessus du poids sec traduit déjà une surcharge hydrosodée significative.",
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
          F(
            "Une bradycardie est écartée tant que le potassium reste sous 7 mmol/L.",
            "Des anomalies électriques sont décrites dès 6 mmol/L environ, bien avant ce seuil.",
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
          F(
            "Organiser une hémofiltration continue au bloc pendant la cure de hernie.",
            "Une séance d’hémodialyse programmée avant le geste corrige plus simplement volume et ions.",
          ),
          T(
            "Réévaluer les ions après la dialyse.",
            "Le contrôle confirme l’efficacité et l’absence de rebond significatif.",
          ),
          T(
            "Contrôler l’ECG avant de reprogrammer l’intervention.",
            "Le tracé objective le retentissement de la kaliémie et guide l’urgence du traitement.",
          ),
          T(
            "Revoir avec la néphrologie le rythme des séances autour de la chirurgie.",
            "La coordination fixe la séance préopératoire et la reprise du programme habituel.",
          ),
        ],
        "Le chirurgien confirme que la hernie n’est ni étranglée ni douloureuse et accepte un report.",
      ),
      qcm(
        "Quelles précautions protègent la fistule ?",
        ["b00124", "b00128"],
        "La fistule gauche est identifiée et soustraite aux ponctions, pressions et compressions pendant toute la trajectoire.",
        [
          F(
            "Placer le brassard sur le bras gauche pour libérer la veine du bras droit.",
            "Le membre porteur de la fistule doit rester libre de toute compression répétée.",
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
          T(
            "Documenter le côté de la fistule sur la feuille d’anesthésie.",
            "L’information écrite protège l’accès pendant l’installation et le transfert.",
          ),
        ],
        "Après dialyse, le potassium est à 4,8 mmol/L, le patient est au poids sec et la fistule présente un thrill normal.",
      ),
      qcm(
        "Quels choix anesthésiques sont cohérents ?",
        ["b00074", "b00079", "b00080", "b00081"],
        "Le plan privilégie agents prévisibles, monitorage du bloc et opioïdes sans métabolite actif accumulé.",
        [
          F(
            "Choisir le desflurane pour son élimination rénale prévisible.",
            "Les halogénés quittent l’organisme par voie pulmonaire, indépendamment de la filtration glomérulaire.",
          ),
          F(
            "Utiliser la mépéridine en titration car ses métabolites sont inactifs.",
            "La normépéridine est neuroexcitante et s’accumule quand la clairance chute.",
          ),
          T(
            "Utiliser le cisatracurium si une curarisation est nécessaire.",
            "L’élimination de Hofmann offre une durée plus prévisible en IRT.",
          ),
          F(
            "Planifier une forte dose de morphine prolongée.",
            "La M6G s’accumule et expose à une dépression respiratoire tardive.",
          ),
          T(
            "Prévoir une antagonisation par néostigmine plutôt que par sugammadex.",
            "Les complexes sugammadex-rocuronium sont éliminés par le rein et déconseillés chez le dialysé.",
          ),
        ],
        "Une anesthésie générale courte est retenue car la chirurgie ne se prête pas à une technique locale seule.",
      ),
      qcm(
        "Quel soluté d’entretien peut être envisagé ?",
        ["b00122", "b00123"],
        "Un faible volume de soluté balancé est acceptable ; le NaCl 0,9 % n’est pas protecteur du potassium en raison de l’acidose.",
        [
          F(
            "Choisir le NaCl 0,9 % parce qu’il évite toute acidose.",
            "Une charge chlorée importante favorise justement une acidose métabolique hyperchlorémique.",
          ),
          F(
            "Préférer un glucosé 5 % comme entretien chez ce patient anurique.",
            "Ce soluté apporte de l’eau libre et expose à une hyponatrémie sans soutenir la volémie.",
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
          T(
            "Adapter l’antalgie en écartant les molécules néphrotoxiques.",
            "Le terrain d’insuffisance terminale impose paracétamol et opioïdes prudemment titrés.",
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
          T(
            "La natrémie devant tout signe neurologique nouveau.",
            "Le dosage confirme rapidement une dilution par absorption du liquide d’irrigation.",
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
          F(
            "Une bradycardie isolée suffit à affirmer le syndrome.",
            "Le tableau associe surtout des signes neurologiques et une hyponatrémie documentée.",
          ),
          F(
            "Une soif intense constitue le signe le plus caractéristique.",
            "La symptomatologie initiale est dominée par céphalées, agitation et vomissements.",
          ),
          T(
            "Vision trouble transitoire.",
            "La glycine absorbée peut provoquer une perturbation visuelle réversible.",
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
          F(
            "Poursuivre la résection en accélérant le geste pour terminer plus vite.",
            "Chaque minute supplémentaire augmente le volume passé dans les sinus ouverts.",
          ),
          F(
            "Perfuser rapidement un litre de glucosé 5 % pour soutenir la pression.",
            "Ce soluté hypotonique aggraverait l’hyponatrémie déjà installée.",
          ),
          F(
            "Augmenter la hauteur des sacs.",
            "Une pression supplémentaire accroît encore l’absorption systémique.",
          ),
          T(
            "Prévenir l’équipe et anticiper une aggravation neurologique.",
            "Une convulsion ou un coma peuvent survenir vite et exigent des moyens immédiats.",
          ),
        ],
        "L’urologue annonce que de nombreux sinus sont ouverts et que neuf litres d’irrigation ont été utilisés.",
      ),
      qcm(
        "Comment interpréter la biologie ?",
        ["b00036", "b00139"],
        "Une baisse rapide de sodium à 121 mmol/L avec hypoosmolarité confirme une absorption importante proche du seuil sévère.",
        [
          F(
            "Une natrémie à 121 mmol/L reste dans la zone d’adaptation cérébrale.",
            "Une chute rapide de 18 mmol/L provoque un œdème cérébral et des signes neurologiques.",
          ),
          T(
            "L’hypoosmolarité explique les signes neurologiques.",
            "L’eau entre dans les cellules cérébrales et provoque une encéphalopathie.",
          ),
          F(
            "L’hémoglobine abaissée s’explique uniquement par une hémolyse.",
            "La dilution par le liquide absorbé et le saignement de résection expliquent d’abord cette baisse.",
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
          F(
            "Augmenter les apports d’eau libre pour diluer la glycine absorbée.",
            "Un supplément d’eau abaisserait encore la natrémie déjà effondrée.",
          ),
          F(
            "Administrer un thiazidique pour éliminer l’excès de volume.",
            "Les thiazidiques agissent au tubule contourné distal et aggravent classiquement l’hyponatrémie.",
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
          F(
            "Restreindre uniquement les apports et attendre une correction spontanée.",
            "Une convulsion sur hyponatrémie aiguë impose une remontée rapide par soluté salé hypertonique.",
          ),
          T(
            "Poursuivre jusqu’à amélioration clinique ou Na au moins 125 mmol/L.",
            "Ces repères limitent l’exposition tout en traitant l’œdème cérébral menaçant.",
          ),
          T(
            "Traiter la convulsion par une benzodiazépine adaptée.",
            "Le midazolam est cité pour interrompre et potentiellement prévenir les crises.",
          ),
          T(
            "Poursuivre une surveillance neurologique et biologique rapprochée.",
            "La récidive convulsive et la vitesse de remontée doivent être détectées sans délai.",
          ),
          T(
            "Sécuriser les voies aériennes et l’oxygénation pendant la crise.",
            "Une convulsion généralisée compromet la ventilation et expose à l’hypoxémie.",
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
          F(
            "Le nerf obturateur assure l’abduction de la cuisse.",
            "Il commande les adducteurs, dont la contraction brutale déplace le membre en dedans.",
          ),
          F(
            "La stimulation obturatrice est supprimée par une rachianesthésie seule.",
            "Le bloc médullaire laisse persister la réponse directe du nerf au courant de résection.",
          ),
          F(
            "La localisation supprime toute interaction neuromusculaire.",
            "Elle crée au contraire l’interaction classique avec le nerf obturateur.",
          ),
          T(
            "Une curarisation profonde évite la réponse motrice pendant la résection.",
            "Le bloc neuromusculaire empêche la contraction des adducteurs déclenchée par le courant.",
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
          T(
            "Vérifier le niveau de curarisation juste avant le temps latéral.",
            "Un train-de-quatre sans réponse au moment du geste supprime tout mouvement d’adduction.",
          ),
        ],
        "L’urologue confirme qu’une électrocautérisation profonde sera nécessaire sur la paroi latérale.",
      ),
      qcm(
        "Quels signes font suspecter une perforation ?",
        "b00143",
        "Une fuite d’irrigation hors de la vessie se manifeste par retour diminué, douleur, signes vagaux ou instabilité.",
        [
          F(
            "Une distension vésicale croissante à la palpation.",
            "La perforation laisse fuir le liquide hors de la vessie au lieu de la distendre.",
          ),
          T(
            "Une douleur abdominale basse ou rétropubienne.",
            "L’irritation pelvienne est caractéristique d’une perforation extrapéritonéale.",
          ),
          F(
            "Une tachycardie sinusale rapide est le signe cardiaque caractéristique.",
            "Les perforations importantes s’accompagnent classiquement d’une bradycardie d’origine vagale.",
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
          F(
            "Poursuivre la résection jusqu’à l’ablation complète de la tumeur.",
            "La progression du geste agrandirait la brèche et aggraverait l’extravasation.",
          ),
          F(
            "Maintenir l’irrigation à haut débit pour laver le champ.",
            "Un débit élevé augmente encore le volume extravasé dans l’abdomen.",
          ),
          F(
            "Administrer de l’atropine avant tout examen clinique de l’abdomen.",
            "L’évaluation du retentissement précède un traitement symptomatique du rythme.",
          ),
          F(
            "Augmenter la pression du sac pour restaurer le retour.",
            "Une pression supplémentaire force davantage de liquide à travers la perforation.",
          ),
          T(
            "Demander une évaluation chirurgicale immédiate de la vessie.",
            "Le siège et l’étendue de la brèche déterminent une réparation ouverte ou un drainage.",
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
          T(
            "Une distension abdominale persistante entretient le réflexe.",
            "Tant que le liquide extravasé distend le péritoine, la stimulation vagale se prolonge.",
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
          F(
            "Une perforation extrapéritonéale impose systématiquement une laparotomie.",
            "Les formes extrapéritonéales limitées sont souvent traitées par drainage vésical prolongé.",
          ),
          T(
            "Une perforation intrapéritonéale peut donner une douleur généralisée.",
            "Le liquide irrite une grande surface péritonéale et distend l’abdomen.",
          ),
          F(
            "Une bradycardie écarte une perforation intrapéritonéale.",
            "Le réflexe vagal accompagne justement les brèches ouvertes dans le péritoine.",
          ),
          F(
            "Les deux formes ont toujours une expression identique.",
            "L’extension anatomique conditionne intensité des symptômes et traitement.",
          ),
          T(
            "Le siège de la brèche oriente le choix entre réparation et drainage.",
            "Une extravasation intrapéritonéale importante conduit à une exploration chirurgicale.",
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
          F(
            "La consigne de perfuser trois litres dès l’arrivée en surveillance continue.",
            "Le volume est titré sur l’hémodynamique et le bilan, une charge fixe exposant à la surcharge.",
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
          T(
            "Une embolie gazeuse lors de l’ouverture veineuse.",
            "Une veine ouverte au-dessus du niveau du cœur peut aspirer de l’air pendant la dissection.",
          ),
        ],
      ),
      qcm(
        "Quels moyens préparer avant l’induction ?",
        ["b00151", "b00157"],
        "Une chirurgie hémorragique avec variations rapides justifie accès de gros calibre, pression invasive et produits sanguins disponibles.",
        [
          F(
            "Un seul cathéter périphérique de 22 G suffit pour cette intervention.",
            "Un débit aussi limité interdit la transfusion rapide exigée par ce type d’hémorragie.",
          ),
          F(
            "Un brassard non invasif toutes les cinq minutes détecte les chutes brutales.",
            "La mesure intermittente laisse passer plusieurs minutes d’hypotension pendant la dissection cave.",
          ),
          F(
            "Une commande de produits sanguins passée après la première perte importante.",
            "Le délai d’obtention retarderait la transfusion au moment où elle devient vitale.",
          ),
          T(
            "Des dispositifs de réchauffement et de perfusion rapide.",
            "La durée et la transfusion massive exposent à l’hypothermie et à la coagulopathie.",
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
          T(
            "Réévaluer la pression artérielle après le changement de position.",
            "Le retour veineux et la précharge peuvent chuter lors du passage en décubitus latéral.",
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
          F(
            "Une hypotension à ce moment traduit habituellement une réaction anaphylactique.",
            "Le contexte de dissection cave rend l’hémorragie et la baisse de précharge bien plus probables.",
          ),
          T(
            "Une communication immédiate avec le chirurgien est nécessaire.",
            "Seul l’opérateur peut comprimer la source ou relâcher le contrôle cave.",
          ),
          T(
            "La pression invasive guide la réanimation battement par battement.",
            "La mesure continue objective la réponse au remplissage et aux vasopresseurs.",
          ),
        ],
        "Pendant la mobilisation du thrombus, la PAM chute à 45 mmHg et le champ se remplit soudainement de sang.",
      ),
      qcm(
        "Quelles mesures sont prioritaires pendant l’hémorragie ?",
        ["b00095", "b00157"],
        "Le contrôle chirurgical, la transfusion guidée et la restauration de pression protègent simultanément cerveau, cœur et rein restant.",
        [
          F(
            "Différer le contrôle chirurgical jusqu’à normalisation de la pression.",
            "Tant que la veine reste ouverte, aucun remplissage ne rétablit durablement la pression.",
          ),
          F(
            "Transfuser uniquement des cristalloïdes tant que l’hémoglobine dépasse 60 g/L.",
            "Une perte active impose des globules rouges et la correction de l’hémostase sans attendre ce seuil.",
          ),
          F(
            "Abaisser volontairement la pression moyenne à 45 mmHg pour limiter le saignement.",
            "Une hypotension profonde prolongée compromet la perfusion du rein qui devra assurer seul la fonction.",
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
          F(
            "Une péridurale doit être posée avant la correction de la coagulopathie.",
            "Un trouble de l’hémostase interdit la ponction neuraxiale tant qu’il persiste.",
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
          F(
            "Viser une pression moyenne inférieure à 55 mmHg pour ménager le rein.",
            "Une perfusion basse aggrave l’ischémie médullaire du rein devenu unique.",
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
          T(
            "Rechercher une obstruction du drainage urinaire avant de conclure.",
            "Une sonde coudée ou bouchée peut simuler une chute du débit après néphrectomie.",
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
          F(
            "Retirer la fistule dès l’implantation du greffon.",
            "L’accès est conservé tant que la fonction du greffon n’est pas durablement établie.",
          ),
          F(
            "Viser un poids inférieur au poids sec avant l’induction.",
            "Une déplétion excessive compromet la perfusion du greffon au moment du déclampage.",
          ),
          T(
            "Préparer le protocole d’immunosuppression.",
            "Les traitements doivent être administrés selon la chronologie de transplantation.",
          ),
          T(
            "Planifier une PAM compatible avec la perfusion du greffon.",
            "Une cible anticipée permet de réagir rapidement au déclampage.",
          ),
          T(
            "Anticiper la disponibilité d’un vasopresseur titrable.",
            "La reperfusion peut s’accompagner d’une baisse brutale de pression à corriger sans délai.",
          ),
        ],
      ),
      qcm(
        "Quelles étapes techniques sont attendues ?",
        "b00169",
        "Le greffon est raccordé aux vaisseaux iliaques puis son uretère à la vessie avant fermeture.",
        [
          F(
            "Anastomose de la veine du greffon sur la veine cave inférieure.",
            "L’implantation en fosse iliaque utilise la veine iliaque externe comme site de drainage.",
          ),
          F(
            "Anastomose artérielle réalisée sur l’aorte sous-rénale.",
            "Le raccord artériel se fait habituellement sur l’artère iliaque externe du receveur.",
          ),
          T(
            "Raccord de l’uretère du greffon à la vessie.",
            "Cette étape crée la voie d’évacuation de l’urine produite.",
          ),
          F(
            "Ablation obligatoire des deux reins natifs.",
            "La procédure décrite laisse les reins d’origine en place.",
          ),
          T(
            "Implantation du greffon dans la fosse iliaque.",
            "Cette localisation facilite l’abord des vaisseaux pelviens et la surveillance ultérieure.",
          ),
        ],
        "L’équipe commence l’anastomose veineuse puis prépare le raccord artériel sur les vaisseaux iliaques externes.",
      ),
      qcm(
        "Quels paramètres optimiser avant le déclampage ?",
        ["b00122", "b00123", "b00172"],
        "Avant reperfusion, VCE, PAM, potassium et traitement vasoactif sont préparés pour perfuser le greffon sans surcharge.",
        [
          F(
            "Une PAM cible de 55 mmHg jugée suffisante au déclampage.",
            "La plage recommandée à la reperfusion se situe entre 70 et 90 mmHg.",
          ),
          F(
            "Un potassium mesuré uniquement en fin d’intervention.",
            "La charge potassique du liquide de conservation impose une valeur récente avant l’ouverture des clamps.",
          ),
          F(
            "Un remplissage massif systématique juste avant la reperfusion.",
            "La surcharge expose à l’œdème pulmonaire sans améliorer la perfusion du greffon.",
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
          F(
            "Approfondir l’anesthésie pour laisser la pression se corriger seule.",
            "Un approfondissement aggraverait la vasoplégie et prolongerait l’hypoperfusion du greffon.",
          ),
          F(
            "Attendre trente minutes avant toute intervention thérapeutique.",
            "Chaque minute d’hypoperfusion compromet la reprise de fonction du nouveau rein.",
          ),
          F(
            "Poser l’indication d’une transfusion malgré un champ opératoire sec.",
            "Sans saignement objectivé, la transfusion ne corrige pas une vasoplégie de reperfusion.",
          ),
          T(
            "Informer le chirurgien afin qu’il vérifie l’anastomose.",
            "Une torsion ou une sténose du raccord artériel peut expliquer la baisse observée.",
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
          F(
            "Une hyperkaliémie aiguë élargit le QRS avant de modifier l’onde T.",
            "L’onde T ample et pointue est la première anomalie décrite, l’élargissement survenant plus tard.",
          ),
          F(
            "Le traitement de première intention est un diurétique thiazidique.",
            "L’urgence associe calcium intraveineux, transfert intracellulaire et épuration, pas un agent distal.",
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
          F(
            "Une diurèse nulle après reperfusion impose un remplissage de deux litres.",
            "Le volume ne se déduit pas du débit urinaire et une surcharge menacerait la fonction respiratoire.",
          ),
          F(
            "Une échographie Doppler normale élimine toute cause de retard de fonction.",
            "Un retard de reprise peut exister malgré des flux artériels et veineux normaux.",
          ),
          T(
            "Une thrombose veineuse peut aussi réduire la fonction.",
            "L’obstacle au drainage augmente la pression et compromet le flux intrarénal.",
          ),
          T(
            "Un hématome compressif est un diagnostic possible.",
            "Une collection autour du greffon peut altérer les vaisseaux ou l’uretère.",
          ),
          T(
            "Une nécrose tubulaire du greffon liée à l’ischémie froide.",
            "La durée de conservation explique une part des retards de reprise.",
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
          F(
            "Une sonde urinaire perméable écarte toute complication vasculaire.",
            "La perméabilité du drainage ne renseigne pas sur le flux artériel ou veineux du greffon.",
          ),
          T(
            "Maintenir la pression de perfusion pendant l’investigation.",
            "Le diagnostic ne doit pas s’accompagner d’une nouvelle hypoperfusion du greffon.",
          ),
          F(
            "Injecter des litres jusqu’à apparition d’urines.",
            "Une surcharge ne corrige ni thrombose ni retard de fonction et menace les poumons.",
          ),
          T(
            "Réévaluer l’auscultation et la saturation avant tout nouvel apport.",
            "Les crépitants signalent une surcharge que le remplissage aggraverait.",
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
          F(
            "L’hypotension septique se corrige par le seul drainage.",
            "La vasoplégie nécessite un soutien vasculaire pendant et après le contrôle de source.",
          ),
          F(
            "Une antibiothérapie efficace autorise à différer le geste de 48 heures.",
            "Les antibiotiques diffusent mal dans un système obstrué et l’urgence demeure.",
          ),
          T(
            "La confusion est un signe de dysfonction d’organe.",
            "Une encéphalopathie septique traduit la gravité du tableau.",
          ),
          T(
            "L’obstacle entretient la pression et l’infection tant qu’il persiste.",
            "La décompression conditionne le contrôle de source dans une pyélonéphrite obstructive.",
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
          F(
            "Une néphrostomie percutanée reste le premier choix malgré la coagulopathie.",
            "La ponction percutanée expose à un saignement lorsque l’hémostase est perturbée.",
          ),
          F(
            "Le choix du drainage dépend uniquement de la taille du calcul.",
            "Anatomie, hémostase, plateau technique et état septique interviennent tous dans la décision.",
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
          T(
            "Prévoir une induction en séquence rapide si l’estomac est plein.",
            "Le sepsis, la douleur et l’urgence retardent la vidange gastrique.",
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
          T(
            "Une majoration transitoire de la fièvre et des frissons est possible.",
            "La libération bactérienne au moment du geste peut déclencher une réaction systémique.",
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
          F(
            "Viser une diurèse horaire supérieure à 2 mL/kg/h grâce au furosémide.",
            "Forcer le débit urinaire ne restaure pas la perfusion rénale et masque l’évaluation volémique.",
          ),
          T(
            "Adapter l’antibiothérapie aux prélèvements.",
            "Une documentation microbiologique permet une couverture efficace puis ciblée.",
          ),
          T(
            "Surveiller la kaliémie et l’équilibre acide-base.",
            "Le sepsis et l’obstruction exposent à l’hyperkaliémie et à l’acidose métabolique.",
          ),
        ],
        "La sonde draine une urine purulente ; des prélèvements sont envoyés et le patient reste intubé.",
      ),
      qcm(
        "Comment diagnostiquer une IRA associée ?",
        ["b00089", "b00090"],
        "Le diagnostic utilise cinétique de créatinine et oligurie, tandis que le mécanisme associe prérénal, sepsis et obstacle.",
        [
          F(
            "Retenir le diagnostic seulement si la créatinine double en 24 heures.",
            "Le critère absolu de 26,5 µmol/L en 48 heures suffit, sans exiger un doublement.",
          ),
          F(
            "Exiger une diurèse sous 0,3 mL/kg/h pendant douze heures pour le critère urinaire.",
            "Le seuil retenu est de 0,5 mL/kg/h pendant plus de six heures.",
          ),
          F(
            "Attribuer l’atteinte à la néphrotoxicité du sévoflurane utilisé.",
            "Aucune néphrotoxicité clinique du sévoflurane n’a été rapportée et le tableau est septique et obstructif.",
          ),
          F(
            "Une diurèse après drainage exclut toute lésion.",
            "Une atteinte intrinsèque peut persister malgré la levée de l’obstacle.",
          ),
          T(
            "Répéter les dosages pour établir la cinétique de la créatinine.",
            "La pente et le pic renseignent sur la gravité et sur le moment de la dégradation.",
          ),
        ],
        "A douze heures, la diurèse reste à 0,3 mL/kg/h et la créatinine a augmenté de 40 µmol/L.",
      ),
      qcm(
        "Quelles complications doivent faire discuter une dialyse ?",
        ["b00107", "b00109"],
        "La suppléance est discutée si hyperkaliémie, acidose, surcharge, anurie ou urémie restent réfractaires au traitement.",
        [
          F(
            "Une kaliémie à 6,4 mmol/L corrigée par une seule dose de calcium.",
            "Le calcium stabilise la membrane sans retirer le potassium de l’organisme.",
          ),
          T(
            "Une acidose sévère réfractaire.",
            "Une acidémie prolongée altère fonction cardiovasculaire et réponse aux catécholamines.",
          ),
          F(
            "Un œdème pulmonaire répondant bien aux diurétiques de l’anse.",
            "Une réponse diurétique satisfaisante rend l’ultrafiltration inutile à ce stade.",
          ),
          T(
            "Une péricardite ou encéphalopathie urémique.",
            "Ces complications d’accumulation toxique sont des indications classiques de suppléance.",
          ),
          T(
            "Une anurie prolongée malgré la levée de l’obstacle.",
            "La persistance durable sans diurèse fait discuter l’épuration quand le traitement médical échoue.",
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
  validateSourceBlocks(
    chapter,
    new Set((extract.blocs || []).map((b) => b.id)),
  );
  return chapter;
}
export default buildChapter26;
