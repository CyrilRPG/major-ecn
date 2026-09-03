const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept,
  bullets,
  sourceBlocks,
  ...(image ? { image } : {}),
});
const fullImage = (path, caption, sourceCaption, extra = {}) => ({
  path,
  position: "after",
  size: "large",
  layout: "full_width",
  containsText: true,
  caption,
  sourceCaption,
  ...extra,
});

const images = {
  partitions: fullImage(
    "img/img_001.png",
    "Coefficients de partition sang/gaz",
    "TABLEAU 14.1 Coefficient de partition sang/gaz des agents anesthésiques halogénés, du protoxyde d’azote et du xénon",
  ),
  uptake: fullImage(
    "img/img_002.png",
    "Montée de la fraction alvéolaire selon la solubilité",
    "FIGURE 14.1 Ratios FA/Fi des agents anesthésiques d’inhalation et du protoxyde d’azote en fonction du temps",
  ),
  washout: fullImage(
    "img/img_003.png",
    "Élimination pulmonaire selon la solubilité",
    "FIGURE 14.2 Élimination des agents anesthésiques halogénés et du protoxyde d’azote en fonction du temps",
  ),
  structures: fullImage(
    "img/img_004.png",
    "Principaux agents inhalés et structures chimiques",
    "FIGURE 14.3 Structure chimique des agents volatils avec leur première utilisation clinique",
  ),
  mac: fullImage(
    "img/img_005.png",
    "CAM des principaux agents inhalés",
    "TABLEAU 14.2 Concentration alvéolaire minimale des agents anesthésiques, du protoxyde d’azote et du xénon",
  ),
  macFactors: fullImage(
    "img/img_006.png",
    "Facteurs augmentant ou diminuant la CAM",
    "TABLEAU 14.3 Facteurs modifiant la concentration alvéolaire minimale",
    { cropBottomMm: 8 },
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Piloter la pression partielle jusqu’au cerveau",
      sections: [
        {
          title: "Du vaporisateur à l’organe cible",
          rows: [
            row(
              "Principe de la voie inhalée",
              [
                "Les halogénés sont stockés sous forme liquide puis vaporisés avant administration.",
                "L’effet dépend de la pression partielle atteinte dans le système nerveux central.",
              ],
              ["b00007", "b00009", "b00013"],
            ),
            row(
              "Concentration du mélange",
              [
                {
                  text: "Le volume pour cent décrit la proportion relative d’un gaz dans 100 volumes.",
                  children: [
                    "1 % de sévoflurane correspond à une unité pour 100 unités du mélange",
                    "La composition inspirée se répartit entre agent, oxygène et gaz vecteurs",
                  ],
                },
                "La pression partielle fournit une mesure absolue utile dans le sang et les tissus.",
              ],
              ["b00010", "b00011", "b00012"],
            ),
            row(
              "Équilibre des compartiments",
              [
                "À l’équilibre, les pressions partielles alvéolaire, sanguine et cérébrale s’égalisent.",
                "Une montée alvéolaire rapide accélère donc l’installation de l’anesthésie.",
              ],
              ["b00012", "b00013"],
            ),
          ],
        },
        {
          title: "Faire monter la fraction alvéolaire",
          rows: [
            row(
              "Concentration inspirée",
              [
                "Une concentration inspiratoire élevée accélère l’augmentation de la fraction alvéolaire.",
                "Ce levier est utilisé pendant une induction au sévoflurane.",
              ],
              ["b00016", "b00017", "b00018"],
            ),
            row(
              "Ventilation alvéolaire",
              [
                {
                  text: "Une ventilation plus importante augmente l’apport de vapeur aux alvéoles.",
                  children: [
                    "L’hypoventilation ralentit la montée alvéolaire",
                    "La dépression ventilatoire des halogénés peut freiner leur propre captage",
                  ],
                },
                "Le protoxyde d’azote et le xénon dépriment peu la ventilation.",
              ],
              ["b00019", "b00020"],
            ),
            row(
              "Lecture du ratio FA/Fi",
              [
                "Le ratio augmente d’abord rapidement avant que le captage tissulaire ne devienne important.",
                "Il tend ensuite vers 1 à mesure que les compartiments tissulaires se saturent.",
              ],
              ["b00027", "b00029", "b00030", "b00031"],
              images.uptake,
            ),
          ],
        },
      ],
    },
    {
      title: "Comprendre captage tissulaire et réveil",
      sections: [
        {
          title: "Trois déterminants du captage",
          rows: [
            row(
              "Solubilité sanguine",
              [
                {
                  text: "Le coefficient sang/gaz quantifie la quantité dissoute dans le sang à l’équilibre.",
                  children: [
                    "Coefficient faible : pression alvéolaire et cérébrale montent vite",
                    "Coefficient élevé : le sang sert de réservoir et retarde l’équilibre",
                  ],
                },
                "La rapidité du début et de la fin d’action est inversement proportionnelle à cette solubilité.",
              ],
              ["b00022", "b00023", "b00024", "b00037"],
              images.partitions,
            ),
            row(
              "Débit cardiaque",
              [
                {
                  text: "Le débit cardiaque module le captage sanguin depuis l’alvéole.",
                  children: [
                    "Débit élevé : prélèvement accru et montée de FA ralentie",
                    "Débit abaissé : captage moindre et élévation alvéolaire accélérée",
                  ],
                },
                "Un faible débit accélère la montée alvéolaire et expose à une profondeur rapide.",
              ],
              ["b00038", "b00039"],
            ),
            row(
              "Gradient alvéolo-veineux",
              [
                "Au début, le sang veineux dépourvu d’agent entretient un captage tissulaire important.",
                "Quand les tissus se saturent, le gradient diminue et devient négligeable.",
              ],
              ["b00040", "b00041"],
            ),
          ],
        },
        {
          title: "Élimination pulmonaire",
          rows: [
            row(
              "Voie principale",
              [
                {
                  text: "L’arrêt de l’administration inverse le transfert vers les poumons.",
                  children: [
                    "Le sang ramène l’agent dissous vers les alvéoles",
                    "L’expiration élimine la majeure partie de l’agent inchangé",
                  ],
                },
                "Ventilation, débit, gradient et solubilité influencent aussi le réveil.",
              ],
              ["b00042", "b00043", "b00044"],
            ),
            row(
              "Wash-out",
              [
                "Les agents peu solubles quittent rapidement le sang et le cerveau après l’arrêt.",
                "Le desflurane et le sévoflurane décroissent plus vite que l’isoflurane et l’halothane.",
              ],
              ["b00024", "b00033", "b00035", "b00037"],
              images.washout,
            ),
            row(
              "Conséquence clinique",
              [
                "Une accumulation tissulaire importante prolonge la récupération après une administration longue.",
                "Le choix de l’agent doit intégrer durée, terrain et objectif de réveil.",
              ],
              ["b00022", "b00024", "b00035", "b00043"],
            ),
          ],
        },
      ],
    },
    {
      title: "Doser la puissance avec la CAM",
      sections: [
        {
          title: "Définition et utilisation",
          rows: [
            row(
              "Définition",
              [
                "La CAM est la concentration alvéolaire abolissant la réponse motrice à l’incision chez 50 % des sujets.",
                "Elle mesure la puissance et non la vitesse d’action.",
              ],
              ["b00050", "b00051", "b00052"],
            ),
            row(
              "Puissance",
              [
                "Une forte solubilité lipidique correspond à une grande puissance et à une CAM faible.",
                "L’halothane est plus puissant que le desflurane ou le protoxyde d’azote.",
              ],
              ["b00051", "b00053"],
              images.mac,
            ),
            row(
              "Repères pratiques",
              [
                {
                  text: "Environ 1,3 CAM abolit la réponse motrice chez 95 % des patients.",
                  children: [
                    "Les contributions de plusieurs agents s’additionnent",
                    "70 % de N2O apporte environ 0,7 CAM",
                  ],
                },
                "La CAM ne garantit pas à elle seule inconscience, analgésie ni stabilité.",
              ],
              ["b00055"],
            ),
          ],
        },
        {
          title: "Adapter la CAM au patient",
          rows: [
            row(
              "Facteurs qui l’augmentent",
              [
                "Hyperthermie, prise chronique d’alcool et substances stimulant le système nerveux central augmentent les besoins.",
                "Le jeune âge est associé à une CAM plus élevée que l’âge avancé.",
              ],
              ["b00057"],
            ),
            row(
              "Facteurs qui la diminuent",
              [
                {
                  text: "Hypothermie, âge, grossesse, hypotension profonde et hypoxie réduisent la CAM.",
                  children: [
                    "Opioïdes, benzodiazépines, propofol et curares diminuent les besoins",
                    "Une intoxication alcoolique aiguë diminue la CAM, contrairement à l’alcoolisme chronique",
                  ],
                },
                "L’ajustement se fonde sur l’ensemble du contexte physiologique et pharmacologique.",
              ],
              ["b00057"],
              images.macFactors,
            ),
            row(
              "Structures et familles",
              [
                "Le protoxyde d’azote et le xénon sont des gaz, tandis que les halogénés usuels sont des liquides volatils.",
                "Les structures éthérées du sévoflurane, desflurane et isoflurane n’impliquent pas la même solubilité.",
              ],
              ["b00045", "b00046", "b00047"],
              images.structures,
            ),
          ],
        },
      ],
    },
    {
      title: "Choisir un agent et anticiper ses risques",
      sections: [
        {
          title: "Protoxyde d’azote et xénon",
          rows: [
            row(
              "Protoxyde d’azote",
              [
                "Le N2O est analgésique, peu soluble et rapide, mais sa CAM de 104 % interdit une anesthésie complète en normoxie.",
                "Il est rarement dépassé à 70 % afin d’éviter un mélange hypoxique.",
              ],
              ["b00059", "b00060"],
            ),
            row(
              "Deuxième gaz",
              [
                "Le captage massif initial du N2O concentre transitoirement un second agent dans l’alvéole.",
                "La pertinence clinique de cet effet reste discutée.",
              ],
              ["b00061"],
            ),
            row(
              "Hypoxie de diffusion",
              [
                "À l’arrêt, le N2O retourne rapidement du sang vers l’alvéole et dilue l’oxygène.",
                "Administrer de l’oxygène pendant 5 à 10 minutes prévient cette hypoxie.",
              ],
              ["b00062"],
            ),
            row(
              "Espaces clos",
              [
                {
                  text: "Le N2O diffuse dans les cavités aériennes plus vite que l’azote n’en sort.",
                  children: [
                    "Éviter pneumothorax, embolie gazeuse, pneumoencéphalie et occlusion intestinale",
                    "Éviter la tympanoplastie en raison de la pression dans l’oreille moyenne",
                  ],
                },
                "Une hypertension intracrânienne sévère constitue aussi une situation défavorable.",
              ],
              ["b00064", "b00065"],
            ),
            row(
              "Xénon",
              [
                "Le xénon est très peu soluble, non irritant, non métabolisé et stable sur le plan cardiovasculaire.",
                "Sa rareté et son coût limitent son utilisation malgré ces qualités.",
              ],
              ["b00068", "b00069", "b00070", "b00071"],
            ),
          ],
        },
        {
          title: "Effets communs des halogénés",
          rows: [
            row(
              "Respiration",
              [
                {
                  text: "Les halogénés diminuent le volume courant et la réponse ventilatoire au CO2.",
                  children: [
                    "La fréquence respiratoire augmente souvent",
                    "La réponse à l’hypoxie est déjà très diminuée à 0,1 CAM",
                  ],
                },
                "Ils exercent un effet bronchodilatateur direct.",
              ],
              ["b00077", "b00078"],
            ),
            row(
              "Circulation et muscle",
              [
                "L’hypotension dépend d’une baisse de contractilité ou des résistances selon l’agent.",
                "Les halogénés potentialisent la relaxation musculaire et réduisent souvent les besoins en curare.",
              ],
              ["b00079", "b00085", "b00096", "b00098"],
            ),
            row(
              "Utérus",
              [
                "Tous les halogénés relâchent la musculature utérine.",
                "Cet effet augmente le risque hémorragique obstétrical mais peut faciliter une inversion utérine ou une rétention placentaire.",
              ],
              ["b00080"],
            ),
          ],
        },
      ],
    },
    {
      title: "Comparer les halogénés et réduire leur impact",
      sections: [
        {
          title: "Profils distinctifs",
          rows: [
            row(
              "Halothane",
              [
                {
                  text: "Puissant et non irritant, il induit lentement en raison d’un coefficient sang/gaz élevé.",
                  children: [
                    "Dépression myocardique, bradycardie et sensibilisation aux catécholamines",
                    "Métabolisme hépatique d’environ 20 % et hépatite immuno-allergique rare",
                  ],
                },
                "Son usage clinique est devenu exceptionnel.",
              ],
              [
                "b00073",
                "b00074",
                "b00075",
                "b00076",
                "b00079",
                "b00081",
                "b00082",
              ],
            ),
            row(
              "Desflurane",
              [
                {
                  text: "Sa faible solubilité assure un réveil rapide, mais sa CAM de 6 % traduit une faible puissance.",
                  children: [
                    "Vaporisateur chauffé et pressurisé du fait du point d’ébullition à 23,5 °C",
                    "Irritant : éviter l’induction inhalée et les augmentations brutales",
                  ],
                },
                "Il est très peu métabolisé, mais favorise le monoxyde de carbone avec un absorbeur desséché.",
              ],
              ["b00083", "b00084", "b00085", "b00086"],
            ),
            row(
              "Sévoflurane",
              [
                {
                  text: "Peu irritant et peu soluble, il convient à l’induction inhalée, y compris par inspiration unique.",
                  children: [
                    "Début et fin rapides avec coefficient sang/gaz de 0,65",
                    "Métabolisme voisin de 3 % avec fluorure transitoire",
                  ],
                },
                "Le composé A n’impose plus de restriction de débit de gaz frais.",
              ],
              [
                "b00087",
                "b00088",
                "b00089",
                "b00090",
                "b00091",
                "b00092",
                "b00093",
              ],
            ),
            row(
              "Isoflurane",
              [
                "Puissant, relativement rapide mais irritant, il convient mal à une induction inhalée.",
                "Il préserve mieux le débit cardiaque que l’halothane, potentialise les curares et n’est métabolisé qu’à 0,2 %.",
              ],
              [
                "b00094",
                "b00095",
                "b00096",
                "b00097",
                "b00098",
                "b00099",
                "b00100",
              ],
            ),
          ],
        },
        {
          title: "Sécurité et environnement",
          rows: [
            row(
              "Monoxyde de carbone",
              [
                "Un absorbeur de CO2 desséché favorise la production de CO par les halogénés.",
                "Le risque décroît dans l’ordre desflurane, isoflurane, puis halothane et sévoflurane.",
              ],
              ["b00086"],
            ),
            row(
              "Empreinte climatique",
              [
                {
                  text: "Le desflurane et le N2O ont l’impact environnemental le plus défavorable.",
                  children: [
                    "Le desflurane a une empreinte environ 20 fois supérieure au sévoflurane dans les conditions comparées",
                    "Le propofol présente une empreinte environ quatre fois moindre que les agents inhalés",
                  ],
                },
                "Réserver ces gaz aux indications cliniques précises et limiter les débits inutiles.",
              ],
              ["b00101", "b00102"],
            ),
            row(
              "Choix raisonné",
              [
                "Sévoflurane : induction douce ; desflurane : cinétique rapide mais irritante ; isoflurane : puissant mais moins maniable.",
                "Solubilité, puissance, physiologie, sécurité du circuit et impact climatique guident ensemble la décision.",
              ],
              [
                "b00084",
                "b00085",
                "b00088",
                "b00095",
                "b00102",
                "b00104",
                "b00105",
              ],
            ),
          ],
        },
      ],
    },
  ];

  return {
    matiere: "Anesthésie-Réanimation",
    title: "Les agents anesthésiques par inhalation",
    year: "2026-2027",
    coverSubtitle:
      "De la pression alvéolaire au choix clinique et environnemental",
    imageOmissions: [],
    imageException: {
      reason:
        "Les six visuels pédagogiques disponibles sont tous intégrés ; aucun autre média source exploitable n’existe.",
    },
    sourceBlocks: [
      ...new Set(
        parts.flatMap((part) =>
          part.sections.flatMap((section) =>
            section.rows.flatMap((item) => item.sourceBlocks),
          ),
        ),
      ),
    ],
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur"],
        rows: [
          ["CAM", "Réponse motrice abolie chez 50 %"],
          ["1,3 CAM", "Absence de mouvement chez environ 95 %"],
          ["N2O", "CAM 104 % ; oxygène 5–10 min à l’arrêt"],
          ["Xénon", "Sang/gaz 0,115 ; CAM 71 %"],
          ["Halothane", "CAM 0,77 ; métabolisme 20 %"],
          ["Desflurane", "CAM 6 % ; métabolisme 0,02 %"],
          ["Sévoflurane", "Sang/gaz 0,65 ; métabolisme 3 %"],
          ["Isoflurane", "CAM 1,15 ; métabolisme 0,2 %"],
        ],
      },
      tables: [
        {
          title: "Cinétique",
          headers: ["Facteur", "Conséquence"],
          rows: [
            ["Faible solubilité", "Induction et réveil rapides"],
            ["Ventilation élevée", "FA augmente plus vite"],
            ["Débit cardiaque élevé", "FA monte plus lentement"],
            ["Gradient AV élevé", "Captage tissulaire accru"],
          ],
        },
        {
          title: "Choix clinique",
          headers: ["Situation", "Orientation"],
          rows: [
            ["Induction inhalée", "Sévoflurane"],
            ["Cavité aérienne close", "Éviter N2O"],
            ["Absorbeur desséché", "Risque de CO, surtout desflurane"],
            [
              "Impact climatique",
              "Éviter desflurane et N2O sans indication précise",
            ],
          ],
        },
      ],
      keyPoints: [
        "La pression partielle cérébrale détermine l’effet.",
        "Une faible solubilité accélère induction et réveil.",
        "La CAM mesure la puissance, pas la vitesse.",
        "Les CAM de plusieurs agents sont additives.",
        "Le N2O dilate les espaces aériens clos.",
        "Le sévoflurane est l’agent de choix pour une induction inhalée.",
        "Le desflurane irrite les voies aériennes.",
        "Le desflurane et le N2O ont une forte empreinte climatique.",
      ],
      eclair: [
        "Relier l’effet à la pression partielle cérébrale.",
        "Augmenter Fi et ventilation accélère la montée alvéolaire.",
        "Un débit cardiaque élevé ralentit la montée de FA.",
        "Retenir : faible sang/gaz = début et fin rapides.",
        "Définir la CAM par l’absence de mouvement chez 50 % des sujets.",
        "Additionner les CAM lors d’associations.",
        "Administrer O2 pendant 5–10 min après N2O.",
        "Éviter N2O en pneumothorax, embolie gazeuse et occlusion.",
        "Choisir le sévoflurane pour l’induction inhalée.",
        "Limiter desflurane et N2O pour réduire l’impact climatique.",
      ],
    },
  };
}

const card = (recto, verso, sourceBlocks) => ({
  recto,
  verso,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});

function buildFlashcards() {
  return [
    card(
      "Sous quelle forme les halogénés sont-ils stockés ?",
      "Sous forme liquide, puis vaporisés pour l’administration.",
      "b00009",
    ),
    card(
      "Quel paramètre détermine l’effet anesthésique cérébral ?",
      "La pression partielle de l’agent dans le cerveau.",
      ["b00012", "b00013"],
    ),
    card(
      "Que décrit un volume pour cent ?",
      "Le volume de gaz présent dans 100 volumes de mélange.",
      "b00011",
    ),
    card(
      "Comment calculer la pression partielle d’un gaz ?",
      "Pression totale multipliée par sa fraction dans le mélange.",
      "b00012",
    ),
    card(
      "Que deviennent les pressions partielles à l’équilibre ?",
      "Elles s’égalisent entre alvéole, sang et cerveau.",
      "b00012",
    ),
    card(
      "Quel effet produit une Fi élevée ?",
      "Elle accélère la montée de la fraction alvéolaire.",
      ["b00016", "b00017"],
    ),
    card(
      "Quel effet produit une ventilation alvéolaire élevée ?",
      "Elle accélère l’apport et la montée alvéolaire.",
      "b00020",
    ),
    card(
      "Quel effet produit une hypoventilation sur l’induction ?",
      "Elle ralentit l’augmentation de la fraction alvéolaire.",
      "b00020",
    ),
    card(
      "Quels gaz dépriment peu la ventilation ?",
      "Le protoxyde d’azote et le xénon.",
      "b00020",
    ),
    card(
      "Que signifie FA/Fi ?",
      "Fraction alvéolaire divisée par fraction inspirée.",
      ["b00027", "b00029"],
    ),
    card(
      "Vers quelle valeur tend FA/Fi ?",
      "Vers 1 lorsque les tissus sont saturés.",
      ["b00029", "b00030"],
    ),
    card(
      "Qu’est-ce que le coefficient sang/gaz ?",
      "La solubilité sanguine de l’agent à l’équilibre.",
      ["b00023", "b00024"],
    ),
    card(
      "Quelle cinétique donne un faible coefficient sang/gaz ?",
      "Une induction et un réveil rapides.",
      ["b00024", "b00037"],
    ),
    card(
      "Pourquoi un agent très soluble agit-il lentement ?",
      "Le sang en dissout beaucoup avant la montée de pression.",
      "b00024",
    ),
    card("Quel agent a un coefficient sang/gaz de 0,115 ?", "Le xénon.", [
      "b00025",
      "b00069",
    ]),
    card(
      "Quel agent halogéné est le moins soluble ?",
      "Le desflurane, avec un coefficient proche de 0,42.",
      ["b00025", "b00084"],
    ),
    card(
      "Quel est le coefficient sang/gaz du sévoflurane ?",
      "Environ 0,65.",
      "b00088",
    ),
    card(
      "Quel effet a un débit cardiaque élevé sur FA ?",
      "Il ralentit l’augmentation de la fraction alvéolaire.",
      "b00039",
    ),
    card(
      "Quel effet a un faible débit cardiaque sur FA ?",
      "Il accélère la montée alvéolaire et l’effet.",
      "b00039",
    ),
    card(
      "Pourquoi le gradient alvéolo-veineux est-il initialement élevé ?",
      "Le sang veineux ne contient initialement aucun agent.",
      "b00041",
    ),
    card(
      "Quand le gradient alvéolo-veineux devient-il faible ?",
      "Après saturation progressive des tissus.",
      "b00041",
    ),
    card(
      "Quelle est la principale voie d’élimination des halogénés ?",
      "L’expiration pulmonaire sous forme inchangée.",
      "b00043",
    ),
    card(
      "Quel facteur accélère le wash-out pulmonaire ?",
      "Une faible solubilité sanguine.",
      ["b00035", "b00037"],
    ),
    card(
      "Que mesure la CAM ?",
      "La puissance anesthésique d’un agent inhalé.",
      "b00051",
    ),
    card(
      "Comment définir une CAM ?",
      "Concentration abolissant le mouvement à l’incision chez 50 %.",
      "b00051",
    ),
    card(
      "Une CAM faible traduit-elle une forte puissance ?",
      "Oui, puissance et CAM varient en sens inverse.",
      "b00051",
    ),
    card(
      "Quel niveau prévient le mouvement chez environ 95 % ?",
      "Environ 1,3 CAM.",
      "b00055",
    ),
    card(
      "Les CAM de deux agents peuvent-elles s’additionner ?",
      "Oui, leurs contributions sont additives.",
      "b00055",
    ),
    card("Quelle CAM apporte 70 % de N2O ?", "Environ 0,7 CAM.", "b00055"),
    card("Quelle est la CAM de l’halothane ?", "Environ 0,77 %.", [
      "b00053",
      "b00074",
    ]),
    card("Quelle est la CAM de l’isoflurane ?", "Environ 1,15 %.", "b00053"),
    card("Quelle est la CAM du sévoflurane ?", "Environ 2 %.", "b00053"),
    card("Quelle est la CAM du desflurane ?", "Environ 6 %.", [
      "b00053",
      "b00084",
    ]),
    card("Quelle est la CAM du N2O ?", "Environ 104 %.", ["b00053", "b00060"]),
    card("Quelle est la CAM du xénon ?", "Environ 71 %.", ["b00053", "b00069"]),
    card(
      "Quel effet l’hyperthermie a-t-elle sur la CAM ?",
      "Elle augmente la CAM.",
      "b00057",
    ),
    card(
      "Quel effet l’hypothermie a-t-elle sur la CAM ?",
      "La grossesse abaisse les besoins en agent inhalé.",
      "b00057",
    ),
    card(
      "Quel effet l’âge avancé a-t-il sur la CAM ?",
      "Il diminue les besoins en agent inhalé.",
      "b00057",
    ),
    card(
      "Quel effet la grossesse a-t-elle sur la CAM ?",
      "L’alcoolisation aiguë abaisse transitoirement la CAM.",
      "b00057",
    ),
    card(
      "Quel effet l’alcoolisme chronique a-t-il sur la CAM ?",
      "Il augmente la CAM.",
      "b00057",
    ),
    card(
      "Quel effet l’alcoolisation aiguë a-t-elle sur la CAM ?",
      "Une hypotension profonde réduit la concentration requise.",
      "b00057",
    ),
    card(
      "Quel effet les opioïdes ont-ils sur la CAM ?",
      "Ils diminuent la CAM requise.",
      "b00057",
    ),
    card(
      "Quel effet une hypotension profonde a-t-elle sur la CAM ?",
      "Elle diminue la CAM.",
      "b00057",
    ),
    card(
      "Quelle propriété utile possède le N2O ?",
      "Une analgésie rapide permettant d’épargner les halogénés.",
      "b00060",
    ),
    card(
      "Pourquoi le N2O ne peut-il assurer seul une anesthésie ?",
      "Sa CAM de 104 % imposerait un mélange hypoxique.",
      "b00060",
    ),
    card(
      "Quelle concentration de N2O dépasse-t-on rarement ?",
      "70 %.",
      "b00060",
    ),
    card(
      "Qu’est-ce que l’effet du deuxième gaz ?",
      "Le N2O concentre transitoirement un second agent alvéolaire.",
      "b00061",
    ),
    card(
      "Qu’est-ce que l’hypoxie de diffusion ?",
      "Une dilution alvéolaire de l’O2 lors du retour rapide du N2O.",
      "b00062",
    ),
    card(
      "Comment prévenir l’hypoxie de diffusion ?",
      "Administrer de l’oxygène pendant 5 à 10 minutes.",
      "b00062",
    ),
    card(
      "Pourquoi le N2O augmente-t-il une cavité aérienne ?",
      "Il y entre bien plus vite que l’azote n’en sort.",
      "b00065",
    ),
    card(
      "Le N2O est-il recommandé lors d’un pneumothorax ?",
      "Non, il augmente le volume et la pression de la cavité.",
      "b00065",
    ),
    card(
      "Le N2O est-il recommandé lors d’une embolie gazeuse ?",
      "Non, il peut agrandir les bulles.",
      "b00065",
    ),
    card(
      "Le N2O est-il recommandé lors d’une occlusion intestinale ?",
      "Non, il distend les anses aérées.",
      "b00065",
    ),
    card(
      "Le N2O est-il recommandé lors d’une tympanoplastie ?",
      "Non, il modifie la pression de l’oreille moyenne.",
      "b00065",
    ),
    card(
      "Quel effet cérébral majeur produit le N2O ?",
      "Une hausse d’environ 10 % du débit sanguin cérébral.",
      "b00064",
    ),
    card(
      "Le N2O est-il métabolisé de façon significative ?",
      "Non, son métabolisme est négligeable.",
      "b00066",
    ),
    card(
      "Pourquoi le xénon induit-il rapidement ?",
      "Son coefficient sang/gaz est très faible.",
      "b00069",
    ),
    card(
      "Quel effet myocardique possède le xénon ?",
      "Il ne déprime pas significativement la fonction myocardique.",
      "b00070",
    ),
    card(
      "Pourquoi le xénon est-il peu utilisé ?",
      "En raison de sa rareté et de son coût élevé.",
      "b00071",
    ),
    card(
      "Comment les halogénés modifient-ils le volume courant ?",
      "Ils le diminuent de façon dose-dépendante.",
      "b00077",
    ),
    card(
      "Comment les halogénés modifient-ils la réponse au CO2 ?",
      "Ils la diminuent avec la profondeur anesthésique.",
      "b00077",
    ),
    card(
      "À quelle faible concentration la réponse hypoxique baisse-t-elle ?",
      "Dès environ 0,1 CAM.",
      "b00077",
    ),
    card(
      "Quel effet bronchique commun ont les halogénés ?",
      "Une bronchodilatation directe.",
      "b00078",
    ),
    card(
      "Quel effet utérin commun ont les halogénés ?",
      "Une relaxation de la musculature utérine.",
      "b00080",
    ),
    card(
      "Quel risque obstétrical vient de la relaxation utérine ?",
      "Une hémorragie accrue pendant l’accouchement.",
      "b00080",
    ),
    card("Quel halogéné est le plus puissant ?", "L’halothane.", "b00074"),
    card(
      "Pourquoi l’halothane induit-il lentement ?",
      "Son coefficient sang/gaz élevé retarde l’équilibre.",
      "b00074",
    ),
    card(
      "Quel effet cardiaque domine avec l’halothane ?",
      "Une dépression de contractilité avec baisse du débit.",
      "b00079",
    ),
    card(
      "Quel effet chronotrope a l’halothane ?",
      "Un effet négatif avec bradycardie.",
      "b00079",
    ),
    card(
      "Pourquoi éviter l’adrénaline sous halothane ?",
      "Elle augmente le risque d’arythmie ventriculaire.",
      "b00079",
    ),
    card(
      "Quelle fraction d’halothane est métabolisée ?",
      "Environ 20 %.",
      "b00081",
    ),
    card(
      "Quels signes évoquent l’hépatite à l’halothane ?",
      "Fièvre, éosinophilie et ictère après réexposition.",
      "b00082",
    ),
    card(
      "Quel terrain classique favorise l’hépatite à l’halothane ?",
      "Une femme obèse d’environ 40 ans réexposée en quatre semaines.",
      "b00082",
    ),
    card("Quel halogéné est le moins puissant ?", "Le desflurane.", "b00084"),
    card(
      "Pourquoi le desflurane requiert-il un vaporisateur spécial ?",
      "Son point d’ébullition est proche de la température ambiante.",
      "b00084",
    ),
    card(
      "Peut-on induire par inhalation avec le desflurane ?",
      "Non, son irritation favorise toux et laryngospasme.",
      "b00085",
    ),
    card(
      "Que provoque une hausse brutale de desflurane ?",
      "Une stimulation sympathique avec tachycardie et HTA.",
      "b00085",
    ),
    card(
      "Quelle fraction de desflurane est métabolisée ?",
      "Environ 0,02 %.",
      "b00085",
    ),
    card(
      "Quel agent favorise le plus le CO avec absorbeur desséché ?",
      "Le desflurane est le plus producteur dans cette situation.",
      "b00086",
    ),
    card(
      "Quel facteur de circuit favorise le monoxyde de carbone ?",
      "La déshydratation de l’absorbeur de CO2.",
      "b00086",
    ),
    card(
      "Pourquoi le sévoflurane convient-il à l’induction ?",
      "Il est peu irritant, agréable et faiblement soluble.",
      "b00088",
    ),
    card(
      "Peut-on réaliser une induction à inspiration unique ?",
      "Oui, avec le sévoflurane, même chez l’adulte.",
      "b00088",
    ),
    card(
      "Quelle fraction de sévoflurane est métabolisée ?",
      "Environ 3 %.",
      "b00091",
    ),
    card(
      "Pourquoi le fluorure du sévoflurane est-il peu néphrotoxique ?",
      "Son élévation est brève grâce à l’élimination pulmonaire.",
      "b00091",
    ),
    card(
      "Le composé A impose-t-il encore un débit minimal ?",
      "Non, les restrictions de débit ne sont plus retenues.",
      ["b00092", "b00093"],
    ),
    card(
      "Pourquoi l’isoflurane convient-il mal à l’induction ?",
      "Son odeur est désagréable et irrite les voies aériennes.",
      "b00095",
    ),
    card(
      "Quel effet l’isoflurane a-t-il sur le débit cardiaque à 1 CAM ?",
      "Il le modifie peu.",
      "b00096",
    ),
    card(
      "L’isoflurane sensibilise-t-il fortement aux catécholamines ?",
      "Non, beaucoup moins que l’halothane.",
      ["b00096", "b00097"],
    ),
    card(
      "Quel effet l’isoflurane a-t-il sur les curares ?",
      "Il les potentialise et diminue les doses nécessaires.",
      "b00098",
    ),
    card(
      "Quelle fraction d’isoflurane est métabolisée ?",
      "Environ 0,2 %.",
      "b00098",
    ),
    card(
      "Quel usage persiste pour l’isoflurane ?",
      "Un usage surtout vétérinaire.",
      ["b00099", "b00100"],
    ),
    card(
      "Quels agents inhalés ont la plus forte empreinte climatique ?",
      "Le desflurane et le protoxyde d’azote.",
      "b00102",
    ),
    card(
      "Quelle empreinte du desflurane face au sévoflurane ?",
      "Environ vingt fois plus élevée dans les conditions comparées.",
      "b00102",
    ),
    card(
      "Quelle empreinte du desflurane face à l’isoflurane ?",
      "Environ quinze fois plus élevée.",
      "b00102",
    ),
    card(
      "Quelle empreinte du propofol face aux agents inhalés ?",
      "Environ quatre fois moindre.",
      "b00102",
    ),
    card(
      "Comment réduire l’impact des agents inhalés ?",
      "Limiter débits, desflurane et N2O aux indications précises.",
      "b00102",
    ),
    card(
      "Quel agent inhalé choisir pour une induction pédiatrique ?",
      "Le sévoflurane.",
      ["b00076", "b00088"],
    ),
    card(
      "Quel agent choisir pour un réveil rapide mais irritant ?",
      "Le desflurane, rapide mais irritant.",
      ["b00084", "b00085"],
    ),
    card(
      "Quel agent inhalé est stable mais très coûteux ?",
      "Le xénon, rare et hémodynamiquement stable.",
      ["b00069", "b00070", "b00071"],
    ),
    card(
      "Quel agent historique expose à une hépatite immune ?",
      "L’halothane après une réexposition rapprochée.",
      "b00082",
    ),
    card(
      "Quel risque accompagne tous les halogénés avec absorbeur sec ?",
      "Une production possible de monoxyde de carbone.",
      "b00086",
    ),
  ];
}

const T = (text, why) => [true, text, why];
const F = (text, why) => [false, text, why];
const qcm = (
  enonce,
  sourceBlocks,
  correction_generale,
  entries,
  newInformation = null,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qcm",
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
  items: entries.map(([is_correct, item, justification], index) => ({
    lettre: "ABCDE"[index],
    enonce: item,
    is_correct,
    justification,
  })),
});
const qroc = (
  enonce,
  reponse_attendue,
  sourceBlocks,
  correction_generale,
  newInformation = null,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qroc",
  reponse_attendue,
  items: [],
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
});

const ISOLATED_QCM = [
  {
    title: "Pression partielle",
    questions: [
      qcm(
        "Quels principes relient l’administration inhalée à l’effet cérébral ?",
        ["b00009", "b00012", "b00013"],
        "La vapeur franchit successivement alvéole, sang et tissus ; sa pression partielle cérébrale gouverne l’effet.",
        [
          T(
            "Les halogénés liquides doivent être vaporisés avant administration.",
            "La vaporisation transforme le liquide en vapeur respirable.",
          ),
          T(
            "La pression partielle cérébrale détermine la profondeur anesthésique.",
            "Elle représente la force motrice pharmacodynamique au site d’action.",
          ),
          F(
            "Le volume pour cent tissulaire suffit à prédire l’effet.",
            "Dans les tissus, la pression partielle est le repère absolu pertinent.",
          ),
          T(
            "L’équilibre égalise les pressions entre alvéole, sang et cerveau.",
            "Les compartiments tendent vers une même pression partielle.",
          ),
          F(
            "La concentration alvéolaire n’influence pas la vitesse d’induction.",
            "Une montée alvéolaire rapide accélère précisément l’apparition de l’effet.",
          ),
        ],
      ),
      qcm(
        "Comment interpréter la composition d’un mélange gazeux ?",
        ["b00010", "b00011", "b00012"],
        "La fraction décrit une composition relative, alors que la pression partielle combine cette fraction à la pression totale.",
        [
          T(
            "Un volume pour cent est une proportion sur cent volumes.",
            "Cette convention décrit simplement un mélange inspiré.",
          ),
          T(
            "La pression partielle est égale à la pression totale multipliée par la fraction.",
            "La loi relie quantité relative et valeur absolue.",
          ),
          F(
            "Un mélange à 1 % exerce toujours 1 mmHg.",
            "La valeur dépend aussi de la pression barométrique totale.",
          ),
          T(
            "À 760 mmHg, 1 % correspond à 7,6 mmHg.",
            "Un centième de 760 donne cette pression.",
          ),
          T(
            "La pression partielle fournit une valeur absolue adaptée à la quantification tissulaire.",
            "Le sang et les tissus se quantifient mieux par cette mesure absolue que par un pourcentage.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs accélèrent la montée de la fraction alvéolaire ?",
        ["b00016", "b00017", "b00019", "b00020"],
        "Une concentration inspirée et une ventilation élevées augmentent rapidement l’apport alvéolaire.",
        [
          T(
            "Une fraction inspirée élevée.",
            "Le gradient vers l’alvéole est plus important.",
          ),
          T(
            "Une ventilation alvéolaire augmentée.",
            "Plus de gaz frais atteint chaque minute les unités ventilées.",
          ),
          F(
            "Une hypoventilation marquée.",
            "Elle réduit l’apport de vapeur et ralentit l’induction.",
          ),
          T(
            "Une administration au masque avec étanchéité correcte.",
            "Elle évite la dilution de la concentration programmée.",
          ),
          F(
            "Une interruption répétée de la ventilation.",
            "Elle diminue la livraison et retarde la montée de FA.",
          ),
        ],
      ),
      qcm(
        "Que montre l’évolution du ratio FA/Fi ?",
        ["b00029", "b00030", "b00031"],
        "La fraction alvéolaire rejoint progressivement la fraction inspirée à mesure que le captage tissulaire s’épuise.",
        [
          T(
            "La montée initiale précède le captage tissulaire maximal.",
            "Les premières inspirations remplissent rapidement le compartiment alvéolaire.",
          ),
          T(
            "La pente ralentit lorsque le sang prélève l’agent.",
            "Le captage soustrait une partie de la vapeur aux alvéoles.",
          ),
          F(
            "Les tissus faiblement vascularisés se saturent avant le groupe richement vascularisé.",
            "L’ordre réel place les organes richement perfusés en premier, puis les muscles.",
          ),
          F(
            "Un agent très soluble atteint 1 avant un agent peu soluble.",
            "La forte solubilité retarde au contraire l’équilibre.",
          ),
          F(
            "FA/Fi mesure directement la puissance anesthésique.",
            "La CAM, non ce ratio cinétique, quantifie la puissance.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations distinguent vitesse et puissance ?",
        ["b00013", "b00024", "b00051"],
        "La vitesse dépend surtout de la montée de pression et de la solubilité ; la puissance se lit par la CAM.",
        [
          F(
            "Le coefficient de partition sang/gaz classe les agents selon leur puissance.",
            "Cette valeur commande la vitesse d’installation, tandis que la CAM mesure la puissance.",
          ),
          F(
            "Une CAM de 6 % désigne le sévoflurane comme l’halogéné le moins puissant.",
            "La valeur de 6 % appartient au desflurane, le sévoflurane se situant vers 2 %.",
          ),
          F(
            "Le desflurane agit lentement parce que sa CAM est élevée.",
            "Sa faible solubilité lui donne au contraire une cinétique rapide.",
          ),
          F(
            "L’halothane est rapide parce qu’il est puissant.",
            "Sa forte solubilité ralentit son induction malgré sa puissance.",
          ),
          T(
            "Deux propriétés indépendantes doivent être considérées.",
            "Un agent peut être peu puissant mais très rapide.",
          ),
        ],
      ),
    ],
  },
];

const ISOLATED_QCM_FINAL = [
  {
    title: "Choix raisonné et empreinte",
    questions: [
      qcm(
        "Quels éléments plaident contre l’emploi routinier du desflurane ?",
        ["b00084", "b00085", "b00102"],
        "La rapidité du desflurane doit être mise en balance avec son irritation et une empreinte climatique très supérieure.",
        [
          F(
            "Son coût d’achat le rend inaccessible dans la plupart des blocs.",
            "La rareté et le prix limitent le xénon, non le desflurane d’usage courant.",
          ),
          F(
            "Sa cinétique lente prolonge tous les réveils.",
            "Sa faible solubilité lui donne au contraire une cinétique très rapide.",
          ),
          F(
            "Il déclenche une hépatite immuno-allergique après réexposition rapprochée.",
            "L’hépatite immune survient après une réexposition à l’halothane.",
          ),
          F(
            "Son métabolisme hépatique atteint 20 %.",
            "Seuls environ 0,02 % du desflurane sont métabolisés.",
          ),
          T(
            "Une indication clinique précise doit justifier son choix.",
            "L’avantage attendu doit compenser les impacts respiratoire et environnemental.",
          ),
        ],
      ),
      qcm(
        "Quelles pratiques diminuent les rejets sans sacrifier la qualité anesthésique ?",
        ["b00043", "b00088", "b00102"],
        "Une technique adaptée, un débit frais raisonné et la suppression des gaz sans bénéfice réduisent l’impact.",
        [
          F(
            "Maintenir un haut débit pendant tout l’entretien.",
            "Un débit excessif augmente directement la consommation et le rejet atmosphérique.",
          ),
          T(
            "Limiter le gaz frais après stabilisation.",
            "Un débit ajusté diminue la quantité de vapeur nécessaire.",
          ),
          F(
            "Ajouter systématiquement du N2O au mélange.",
            "Le protoxyde d’azote accroît significativement l’empreinte climatique.",
          ),
          F(
            "Choisir l’agent le plus émetteur pour gagner quelques secondes.",
            "Le bénéfice clinique réel doit primer sur une rapidité théorique marginale.",
          ),
          T(
            "Envisager le propofol lorsque la technique est pertinente.",
            "Son empreinte comparative est environ quatre fois moindre que celle des agents inhalés.",
          ),
        ],
      ),
      qcm(
        "Quelles propriétés rendent le sévoflurane polyvalent ?",
        ["b00088", "b00090", "b00091"],
        "Le sévoflurane associe faible solubilité, bonne tolérance respiratoire et métabolisme minoritaire.",
        [
          T(
            "Un coefficient sang/gaz voisin de 0,65.",
            "Cette valeur permet une installation et une fin d’effet rapides.",
          ),
          T(
            "Une induction possible par inspiration maximale unique.",
            "L’odeur agréable autorise cette technique, y compris chez l’adulte.",
          ),
          F(
            "Une absence complète d’effet cardiovasculaire.",
            "Ses effets hémodynamiques ressemblent à ceux du desflurane.",
          ),
          T(
            "Une excrétion surtout pulmonaire.",
            "Le métabolisme ne représente qu’environ 3 % de l’élimination.",
          ),
          T(
            "Une irritation faible des voies aériennes supérieures.",
            "Cette tolérance le distingue du desflurane et de l’isoflurane.",
          ),
        ],
      ),
      qcm(
        "Quels faits distinguent le xénon du protoxyde d’azote ?",
        ["b00060", "b00063", "b00069", "b00070"],
        "Les deux gaz sont rapides et peu puissants, mais le xénon préserve davantage le myocarde et reste rare et coûteux.",
        [
          F(
            "Le xénon est fortement soluble dans le sang.",
            "Son coefficient de 0,115 est l’un des plus faibles.",
          ),
          F(
            "Le N2O est plus puissant que l’halothane.",
            "Sa CAM de 104 % traduit au contraire une puissance très faible.",
          ),
          T(
            "Le xénon ne déprime pas la fonction myocardique.",
            "Son profil circulatoire est particulièrement stable.",
          ),
          T(
            "Le N2O exerce un effet inotrope négatif direct.",
            "Une stimulation autonome le compense habituellement chez le sujet sain.",
          ),
          T(
            "Le coût limite l’usage du xénon.",
            "Sa rareté et son prix restreignent fortement son emploi clinique.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures sécurisent l’emploi d’un halogéné avec absorbeur ?",
        ["b00086"],
        "La prévention du CO repose sur l’hydratation, le choix et la surveillance de l’absorbeur ainsi que sur l’agent utilisé.",
        [
          F(
            "Réserver la surveillance aux seules anesthésies au sévoflurane.",
            "Le sévoflurane produit le moins de monoxyde, le desflurane le plus.",
          ),
          F(
            "Privilégier le baralyme sec.",
            "Le baralyme favorise davantage la production de CO que la chaux sodée.",
          ),
          F(
            "Ignorer une élévation de température du canister.",
            "La chaleur de l’absorbeur augmente la réaction de dégradation.",
          ),
          T(
            "Être particulièrement vigilant avec le desflurane.",
            "Il occupe le premier rang de la hiérarchie de production de CO.",
          ),
          T(
            "Contrôler les conditions de stockage du circuit.",
            "Un débit sec prolongé pendant l’inactivité peut déshydrater l’absorbeur.",
          ),
        ],
      ),
    ],
  },
];

const DP_QROC_EXTRA = [
  {
    title: "Halothane et adrénaline",
    vignette:
      "Mme Costa, patiente de 35 ans sans cardiopathie connue, est anesthésiée à l’halothane dans un hôpital disposant encore de cet agent. Une infiltration d’anesthésique local adrénaliné est prévue au cours d’une chirurgie ORL. La capnographie montre parallèlement une augmentation progressive du CO2 expiré.",
    questions: [
      qroc(
        "Quel effet cardiaque direct de l’halothane favorise l’hypotension ?",
        "Diminution de la contractilité myocardique|effet inotrope négatif",
        ["b00079", "b00077"],
        "L’hypotension sous halothane provient surtout d’une baisse du débit cardiaque.",
      ),
      qroc(
        "Quel trouble de fréquence accompagne son effet chronotrope ?",
        "Bradycardie",
        ["b00079", "b00074"],
        "L’halothane ralentit le cœur et peut favoriser un rythme jonctionnel.",
        "La fréquence cardiaque diminue à 48/min avant l’infiltration.",
      ),
      qroc(
        "Quel risque ventriculaire augmente avec l’adrénaline ?",
        "Extrasystoles ventriculaires pouvant évoluer vers une fibrillation|arythmie ventriculaire",
        ["b00079", "b00076"],
        "L’halothane sensibilise le myocarde aux catécholamines.",
        "Le chirurgien annonce une dose d’adrénaline susceptible d’atteindre 1,5 µg/kg.",
      ),
      qroc(
        "Quel désordre ventilatoire renforce la sensibilisation aux catécholamines ?",
        "Hypercapnie",
        "b00079",
        "L’augmentation des catécholamines circulantes sous hypercapnie accroît le risque d’arythmie.",
        "La mesure du CO2 expiré confirme une hypercapnie.",
      ),
      qroc(
        "Quelle décision anesthésique supprime le risque spécifique ?",
        "Changer d’agent et éviter l’halothane|arrêter l’halothane",
        ["b00079", "b00088"],
        "Un halogéné moderne moins arythmogène peut remplacer l’halothane après correction de la ventilation.",
        "L’infiltration est différée pendant la modification du plan.",
      ),
      qroc(
        "Quelle part importante de l’halothane subit un métabolisme hépatique ?",
        "Environ 20 %|20 pour cent",
        "b00081",
        "Cette biotransformation le distingue des agents modernes beaucoup moins métabolisés.",
        "La patiente avait reçu de l’halothane plusieurs années auparavant sans symptôme.",
      ),
      qroc(
        "Quels signes retardés justifieraient un bilan hépatique ?",
        "Fièvre, éosinophilie et ictère|fièvre|éosinophilie|ictère",
        "b00082",
        "Cette triade après exposition évoque la rare hépatite immune à l’halothane.",
        "Mme Costa récupère sans arythmie après changement d’agent et normalisation du CO2.",
      ),
    ],
  },
  {
    title: "Sévoflurane et crainte rénale",
    vignette:
      "M. Fischer, patient de 67 ans avec maladie rénale chronique modérée stable, doit subir une intervention de deux heures. Le sévoflurane est envisagé pour l’entretien. Il a lu que cet agent pouvait produire du fluorure et un composé toxique dans les circuits avec absorbeur de CO2.",
    questions: [
      qroc(
        "Quelle proportion du sévoflurane est métabolisée ?",
        "Environ 3 %|3 pour cent",
        "b00091",
        "La majeure partie de l’agent est éliminée inchangée par les poumons.",
      ),
      qroc(
        "Quel ion peut atteindre transitoirement 50 µmol/L après biotransformation ?",
        "Fluorure inorganique|fluor sérique",
        "b00091",
        "La valeur peut atteindre l’ancien seuil de toxicité retenu pour le méthoxyflurane.",
        "Le patient demande la signification du dosage de fluorure.",
      ),
      qroc(
        "Pourquoi cette élévation expose-t-elle peu le rein avec le sévoflurane ?",
        "Elle est brève grâce à la faible solubilité et à l’élimination pulmonaire rapide|augmentation transitoire",
        "b00091",
        "Le wash-out rapide limite la durée d’exposition au fluorure.",
        "La fonction rénale reste stable pendant l’intervention.",
      ),
      qroc(
        "Quel produit se forme au contact de la chaux sodée ?",
        "Composé A",
        "b00092",
        "Cette réaction avait fait craindre une nécrose tubulaire lors de l’emploi en circuit fermé.",
        "L’équipe vérifie l’absorbeur du circuit.",
      ),
      qroc(
        "Quelle restriction actuelle de débit est imposée par ce composé ?",
        "Aucune restriction actuelle|pas de restriction de débit",
        ["b00092", "b00093"],
        "Les données disponibles ne maintiennent plus l’ancienne contrainte de débit frais.",
        "Une technique à débit raisonné est programmée.",
      ),
      qroc(
        "Quelle propriété permet une fin d’action rapide ?",
        "Coefficient sang/gaz faible de 0,65|faible solubilité sanguine",
        "b00088",
        "Le faible réservoir sanguin accélère le retour de l’agent vers les alvéoles.",
        "La fermeture commence après quatre-vingt-dix minutes d’entretien.",
      ),
      qroc(
        "Quelle surveillance reste indispensable malgré le faible risque spécifique ?",
        "Surveillance clinique et biologique de la fonction rénale|créatininémie et diurèse",
        ["b00091", "b00093"],
        "Le terrain rénal préexistant justifie le suivi périopératoire habituel sans interdire le sévoflurane.",
        "M. Fischer se réveille rapidement avec une diurèse conservée.",
      ),
    ],
  },
  {
    title: "Isoflurane et bloc neuromusculaire",
    vignette:
      "Mme Petit, patiente de 60 ans, est anesthésiée à l’isoflurane pour une chirurgie abdominale dans un contexte de disponibilité limitée des autres halogénés. Un curare non dépolarisant est administré. Le monitorage neuromusculaire montre un bloc plus profond et plus prolongé que prévu.",
    questions: [
      qroc(
        "Pourquoi l’isoflurane n’a-t-il pas été utilisé pour l’induction au masque ?",
        "Odeur désagréable et irritation des voies aériennes|vapeur irritante",
        "b00095",
        "Sa mauvaise tolérance chez le patient éveillé le rend peu propice à l’induction inhalée.",
      ),
      qroc(
        "Quel effet direct l’isoflurane exerce-t-il sur les muscles squelettiques ?",
        "Relaxation musculaire directe|myorelaxation",
        ["b00098", "b00077"],
        "Cet effet propre s’ajoute à celui du bloqueur neuromusculaire.",
        "Le chirurgien constate une excellente relaxation abdominale.",
      ),
      qroc(
        "Comment modifie-t-il la sensibilité aux curares ?",
        "Il l’augmente|potentialisation des curares",
        ["b00098", "b00051"],
        "Une même dose de bloqueur produit un effet plus important sous isoflurane.",
        "Le train-de-quatre reste profond avant toute nouvelle injection.",
      ),
      qroc(
        "Comment adapter les doses suivantes de curare ?",
        "Les diminuer et les titrer au monitorage|réduire les besoins en curare",
        ["b00098", "b00043"],
        "La potentialisation impose d’espacer ou de réduire les réinjections.",
        "La réinjection programmée est annulée.",
      ),
      qroc(
        "Quel effet l’isoflurane exerce-t-il sur le débit cardiaque à 1 CAM ?",
        "Il le modifie peu|débit cardiaque globalement conservé",
        "b00096",
        "La contractilité est moins déprimée qu’avec l’halothane.",
        "La pression baisse modérément mais le débit estimé reste stable.",
      ),
      qroc(
        "Quelle fraction de l’isoflurane est éliminée par métabolisme oxydatif ?",
        "0,2 %|0.2 %",
        "b00098",
        "Son métabolisme est très minoritaire devant l’élimination pulmonaire.",
        "La chirurgie se termine et la vapeur est arrêtée.",
      ),
      qroc(
        "Quel point doit être vérifié avant extubation ?",
        "Récupération complète du bloc neuromusculaire|décurarisation documentée",
        "b00098",
        "La potentialisation par l’isoflurane expose à une curarisation résiduelle si le bloc n’est pas objectivé.",
        "Le monitorage confirme finalement une récupération suffisante après antagonisation.",
      ),
    ],
  },
  {
    title: "Plan de réduction des gaz à effet de serre",
    vignette:
      "M. Morel, patient de 29 ans sans comorbidité, est programmé pour une chirurgie ambulatoire courte. Le bloc opératoire compare ses pratiques : usage fréquent du desflurane, ajout routinier de N2O et débits de gaz frais élevés. L’équipe veut conserver un réveil rapide tout en diminuant l’empreinte du soin.",
    questions: [
      qroc(
        "Quel agent inhalé doit être prioritairement réduit ?",
        "Desflurane",
        ["b00102", "b00084"],
        "Son empreinte dépasse largement celle des autres halogénés comparés.",
      ),
      qroc(
        "Quel est son ordre de grandeur d’impact face au sévoflurane ?",
        "Environ vingt fois supérieur|20 fois",
        ["b00102", "b00060"],
        "L’écart observé justifie de le réserver à une indication clinique précise.",
        "Aucune indication spécifique au desflurane n’est identifiée pour M. Morel.",
      ),
      qroc(
        "Quel gaz adjuvant routinier faut-il aussi limiter ?",
        "Protoxyde d’azote|N2O",
        ["b00102", "b00043"],
        "Le N2O augmente significativement l’empreinte de la technique.",
        "Le chirurgien confirme qu’une analgésie multimodale sans N2O est possible.",
      ),
      qroc(
        "Quel halogéné rapide et moins émetteur peut le remplacer ?",
        "Sévoflurane",
        ["b00088", "b00102"],
        "Sa cinétique reste rapide et son empreinte est nettement inférieure à celle du desflurane.",
        "Une technique inhalée est finalement conservée pour ce cas.",
      ),
      qroc(
        "Quel réglage du circuit diminue la consommation de vapeur ?",
        "Réduction du débit de gaz frais|bas débit adapté",
        "b00102",
        "Limiter le gaz frais réduit directement la quantité d’agent rejetée.",
        "Après stabilisation, le débit est abaissé dans les limites de sécurité.",
      ),
      qroc(
        "Quelle option intraveineuse a une empreinte environ quatre fois moindre ?",
        "Propofol|anesthésie intraveineuse au propofol",
        "b00102",
        "Elle peut être discutée lorsque son profil clinique convient au patient et au geste.",
        "La réunion prépare également un protocole pour les futurs cas.",
      ),
      qroc(
        "Quel double résultat doit valider la nouvelle pratique ?",
        "Réveil sûr et réduction de la consommation de gaz|qualité clinique et baisse des émissions",
        ["b00043", "b00102"],
        "L’écoresponsabilité s’évalue sans compromis sur la ventilation, l’hémodynamique ou la récupération.",
        "M. Morel se réveille sans incident avec une consommation de vapeur documentée plus faible.",
      ),
    ],
  },
];

function buildDpQroc() {
  return [...DP_QROC, ...DP_QROC_EXTRA].map((serie, index) => ({
    label: `DP QROC ${index + 1} · ${serie.title}`,
    allowed_voies: ["externe"],
    vignette: serie.vignette,
    questions: serie.questions,
  }));
}

function validateSourceBlocks(extract, content) {
  const valid = new Set((extract.blocs || []).map((block) => block.id));
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value.sourceBlocks)) {
      for (const id of value.sourceBlocks)
        if (!valid.has(id))
          throw new Error(
            `Chapitre 14 : sourceBlock absent de l'extraction : ${id}`,
          );
    }
    if (Array.isArray(value)) value.forEach(visit);
    else Object.values(value).forEach(visit);
  };
  visit(content);
}

export function buildChapter14(extract) {
  const result = {
    fiche: buildFiche(),
    flashcards: buildFlashcards(),
    series: [
      ...buildIsolatedQcm(),
      ...buildDpQcm(),
      ...buildIsolatedQroc(),
      ...buildDpQroc(),
    ],
  };
  validateSourceBlocks(extract, result);
  return result;
}

export default buildChapter14;

const ISOLATED_QROC = [
  {
    title: "Du vaporisateur au cerveau",
    questions: [
      qroc(
        "Quelle grandeur au niveau cérébral détermine l’effet d’un anesthésique inhalé ?",
        "Pression partielle cérébrale|pression partielle dans le cerveau",
        ["b00012", "b00013"],
        "La pression partielle, et non le seul pourcentage inspiré, constitue la force pharmacodynamique au site d’action.",
      ),
      qroc(
        "Combien vaut la pression partielle d’un gaz à 1 % sous 760 mmHg ?",
        "7,6 mmHg|7.6 mmHg",
        "b00012",
        "La pression partielle est le produit de la fraction 0,01 par la pression totale de 760 mmHg.",
      ),
      qroc(
        "Quelle transformation rend un halogéné liquide administrable par inhalation ?",
        "Vaporisation|passage de l’état liquide à l’état gazeux",
        "b00009",
        "Le vaporisateur produit la vapeur incorporée au mélange respiratoire.",
      ),
      qroc(
        "Quel paramètre ventilatoire accélère l’apport alvéolaire de vapeur ?",
        "Augmentation de la ventilation alvéolaire|ventilation alvéolaire élevée",
        ["b00019", "b00020"],
        "Une ventilation alvéolaire plus forte renouvelle plus rapidement le gaz des alvéoles.",
      ),
      qroc(
        "Vers quelle valeur tend le rapport FA/Fi après saturation tissulaire ?",
        "1|unité",
        ["b00029", "b00030", "b00031"],
        "FA rejoint progressivement Fi lorsque le captage tissulaire devient négligeable.",
      ),
    ],
  },
  {
    title: "Solubilité et circulation",
    questions: [
      qroc(
        "Quel coefficient quantifie la solubilité d’un agent volatil dans le sang ?",
        "Coefficient de partition sang/gaz|coefficient sang-gaz",
        ["b00022", "b00024"],
        "Il compare la quantité dissoute dans le sang à celle présente dans la phase gazeuse à l’équilibre.",
      ),
      qroc(
        "Comment une faible solubilité sanguine modifie-t-elle le début d’action ?",
        "Elle l’accélère|début d’action plus rapide",
        ["b00024", "b00037"],
        "Un petit réservoir sanguin permet à la pression alvéolaire puis cérébrale de monter vite.",
      ),
      qroc(
        "Quel effet un débit cardiaque élevé exerce-t-il sur la montée alvéolaire initiale ?",
        "Il la ralentit|montée plus lente de FA",
        ["b00038", "b00039"],
        "Le sang prélève davantage d’agent dans les alvéoles par unité de temps.",
      ),
      qroc(
        "Pourquoi le gradient alvéolo-veineux est-il maximal au début ?",
        "Le sang veineux ne contient pas encore d’agent|concentration veineuse initiale nulle",
        ["b00040", "b00041"],
        "Le retour veineux initial accepte une grande quantité de vapeur avant saturation des tissus.",
      ),
      qroc(
        "Quelle voie élimine principalement les halogénés inchangés ?",
        "Poumons|voie pulmonaire|expiration",
        ["b00042", "b00043"],
        "L’arrêt de l’apport inverse le gradient et permet l’expiration de la majeure partie de l’agent.",
      ),
    ],
  },
  {
    title: "Puissance anesthésique",
    questions: [
      qroc(
        "Quelle réponse clinique sert à définir la CAM ?",
        "Réponse motrice à l’incision|mouvement à l’incision",
        ["b00050", "b00051"],
        "La CAM abolit le mouvement provoqué par une incision chez la moitié des sujets.",
      ),
      qroc(
        "Quelle fraction de patients ne bouge approximativement plus à 1,3 CAM ?",
        "95 %|95 pour cent",
        "b00055",
        "Une concentration supérieure de 30 % à la CAM prévient le mouvement chez environ 95 % des sujets.",
      ),
      qroc(
        "Comment combiner deux agents inhalés exprimés en fractions de CAM ?",
        "Additionner leurs fractions de CAM|somme des fractions de CAM",
        "b00055",
        "Les contributions des agents inhalés à l’immobilité sont additives.",
      ),
      qroc(
        "Que traduit une valeur de CAM faible ?",
        "Une puissance anesthésique élevée|agent puissant",
        "b00051",
        "Une faible concentration suffit alors à supprimer la réponse motrice.",
      ),
      qroc(
        "Citez un facteur thermique qui diminue la CAM.",
        "Hypothermie|température corporelle basse",
        "b00057",
        "Le refroidissement déprime le système nerveux central et réduit le besoin en agent inhalé.",
      ),
    ],
  },
  {
    title: "Protoxyde d’azote",
    questions: [
      qroc(
        "Pourquoi le N2O ne peut-il pas assurer seul une anesthésie chirurgicale ?",
        "CAM de 104 %|puissance insuffisante",
        "b00060",
        "La concentration requise dépasserait ce qui permet d’administrer un mélange suffisamment oxygéné.",
      ),
      qroc(
        "Quel nom porte l’accélération d’un agent associé par captage massif du N2O ?",
        "Effet du deuxième gaz|second gas effect",
        "b00061",
        "Le retrait rapide du N2O concentre transitoirement le second agent dans l’alvéole.",
      ),
      qroc(
        "Combien de temps faut-il administrer de l’oxygène après arrêt du N2O ?",
        "5 à 10 minutes|cinq à dix minutes",
        "b00062",
        "Cette supplémentation prévient l’hypoxie de diffusion pendant le retour initial du N2O vers les alvéoles.",
      ),
      qroc(
        "Quel effet le N2O exerce-t-il sur le débit sanguin cérébral ?",
        "Augmentation d’environ 10 %|hausse de 10 %",
        "b00064",
        "Cette augmentation motive son éviction en cas d’hypertension intracrânienne sévère.",
      ),
      qroc(
        "Quelle propriété explique l’aggravation d’un pneumothorax par le N2O ?",
        "Diffusion rapide dans les espaces aériens clos|expansion des cavités gazeuses",
        ["b00065", "b00060"],
        "Le N2O entre environ trente fois plus vite que l’azote ne quitte la cavité.",
      ),
    ],
  },
  {
    title: "Xénon et halothane",
    questions: [
      qroc(
        "Quel est approximativement le coefficient sang/gaz du xénon ?",
        "0,115|0.115",
        "b00069",
        "Cette très faible valeur explique sa cinétique extrêmement rapide.",
      ),
      qroc(
        "Quelle contrainte limite surtout l’utilisation clinique du xénon ?",
        "Son coût élevé et sa rareté|coût et rareté",
        ["b00070", "b00071"],
        "Ses qualités hémodynamiques ne compensent pas une disponibilité très limitée.",
      ),
      qroc(
        "Quelle est approximativement la CAM de l’halothane ?",
        "0,77 %|0.77 %",
        "b00074",
        "Cette valeur basse place l’halothane parmi les agents inhalés les plus puissants.",
      ),
      qroc(
        "Quelle arythmie fréquente peut survenir sous halothane ?",
        "Rythme jonctionnel|rythme nodal",
        "b00079",
        "L’halothane ralentit le cœur et favorise ce trouble du rythme.",
      ),
      qroc(
        "Quels trois signes caractérisent l’hépatite grave à l’halothane ?",
        "Fièvre, éosinophilie et ictère|fièvre|éosinophilie|ictère",
        "b00082",
        "La survenue après réexposition rapprochée doit faire rechercher cette complication immunitaire rare.",
      ),
    ],
  },
  {
    title: "Desflurane",
    questions: [
      qroc(
        "Quelle est approximativement la CAM du desflurane ?",
        "6 %|six pour cent",
        "b00084",
        "Cette CAM élevée en fait le moins puissant des halogénés usuels.",
      ),
      qroc(
        "Pourquoi le vaporisateur du desflurane doit-il être chauffé et pressurisé ?",
        "Point d’ébullition bas et pression de vapeur élevée|point d’ébullition de 23,5 °C",
        "b00084",
        "Ses propriétés physiques empêchent l’emploi d’un vaporisateur conventionnel.",
      ),
      qroc(
        "Quel réflexe des voies aériennes contre-indique l’induction au desflurane ?",
        "Laryngospasme|spasme laryngé",
        "b00085",
        "Son odeur âcre provoque une irritation importante chez le patient éveillé.",
      ),
      qroc(
        "Quel effet hémodynamique peut suivre une hausse rapide du desflurane ?",
        "Tachycardie et hypertension|stimulation sympathique",
        "b00085",
        "Une augmentation brutale de la concentration stimule transitoirement le système autonome sympathique.",
      ),
      qroc(
        "Quel absorbeur favorise le plus la production de CO : baralyme ou chaux sodée ?",
        "Baralyme",
        "b00086",
        "La production de monoxyde de carbone est plus importante avec le baralyme, surtout s’il est desséché.",
      ),
    ],
  },
  {
    title: "Sévoflurane et isoflurane",
    questions: [
      qroc(
        "Quel halogéné est privilégié pour l’induction inhalée actuelle ?",
        "Sévoflurane",
        "b00088",
        "Sa faible solubilité, son odeur agréable et l’absence d’irritation permettent une induction rapide.",
      ),
      qroc(
        "Quelle part du sévoflurane est approximativement métabolisée ?",
        "3 %|trois pour cent",
        "b00091",
        "La majeure partie est éliminée inchangée par voie pulmonaire.",
      ),
      qroc(
        "Quel produit naît de la réaction du sévoflurane avec la chaux sodée ?",
        "Composé A|compound A",
        "b00092",
        "La crainte historique de toxicité tubulaire n’impose plus de restriction de débit.",
      ),
      qroc(
        "Pourquoi l’isoflurane convient-il mal à l’induction chez un patient éveillé ?",
        "Odeur désagréable et irritation des voies aériennes|irritation respiratoire",
        "b00095",
        "La mauvaise tolérance de la vapeur limite son administration initiale au masque.",
      ),
      qroc(
        "Comment l’isoflurane modifie-t-il les besoins en curare ?",
        "Il les diminue|diminution des besoins en bloqueur neuromusculaire",
        "b00098",
        "La relaxation musculaire directe et la potentialisation du bloc augmentent la sensibilité aux curares.",
      ),
    ],
  },
  {
    title: "Risques et environnement",
    questions: [
      qroc(
        "Quel halogéné produit le plus de CO au contact d’un absorbeur desséché ?",
        "Desflurane",
        "b00086",
        "La hiérarchie de production place le desflurane devant l’isoflurane, puis halothane et sévoflurane.",
      ),
      qroc(
        "Quel halogéné a une empreinte environ vingt fois supérieure au sévoflurane ?",
        "Desflurane",
        "b00102",
        "Cette différence justifie de le réserver aux indications cliniques précises.",
      ),
      qroc(
        "Quel gaz analgésique augmente significativement l’empreinte de l’anesthésie ?",
        "Protoxyde d’azote|N2O",
        "b00102",
        "Le N2O est un gaz à effet de serre dont l’usage doit être limité.",
      ),
      qroc(
        "Quelle technique citée a une empreinte environ quatre fois moindre que les agents inhalés ?",
        "Anesthésie au propofol|propofol",
        "b00102",
        "Cette comparaison peut orienter la technique lorsque la sécurité et les objectifs cliniques sont équivalents.",
      ),
      qroc(
        "Quel principe réduit simultanément consommation et rejets de vapeur ?",
        "Limiter le débit de gaz frais|utiliser un bas débit adapté",
        "b00102",
        "Un débit raisonné diminue la quantité d’agent rejetée sans modifier l’objectif anesthésique.",
      ),
    ],
  },
];

function buildIsolatedQroc() {
  return ISOLATED_QROC.map((entry, index) => ({
    label: `QROC ${index + 1} · ${entry.title}`,
    allowed_voies: ["externe"],
    questions: entry.questions,
  }));
}

const DP_QCM_EXTRA = [
  {
    title: "Hépatite après réexposition à l’halothane",
    vignette:
      "Mme Girard, patiente de 46 ans avec obésité, doit subir une reprise chirurgicale quatre semaines après une première anesthésie réalisée à l’halothane dans un autre établissement. L’agent est encore disponible localement. Le bilan hépatique préopératoire est normal et aucune allergie n’est connue.",
    questions: [
      qcm(
        "Quels éléments caractérisent l’halothane ?",
        ["b00074", "b00076", "b00081"],
        "L’halothane est puissant, agréable à inhaler, fortement soluble et largement métabolisé parmi les halogénés.",
        [
          T(
            "Chez cette patiente, une CAM d’halothane proche de 0,77 % confirme sa grande puissance.",
            "Cette faible concentration alvéolaire suffit à supprimer le mouvement chez la moitié des sujets.",
          ),
          T(
            "Son coefficient sang/gaz est voisin de 2,4.",
            "Cette solubilité importante ralentit l’équilibre des pressions.",
          ),
          T(
            "Son odeur fruitée irrite peu les voies aériennes.",
            "Ce profil a permis son utilisation pour l’induction inhalée.",
          ),
          T(
            "Environ 20 % de la dose inspirée est métabolisée.",
            "Cette biotransformation hépatique est élevée pour un halogéné.",
          ),
          T(
            "Son emploi clinique actuel est devenu exceptionnel.",
            "L’halothane est pratiquement absent des blocs opératoires modernes.",
          ),
        ],
      ),
      qcm(
        "Pourquoi une nouvelle exposition est-elle particulièrement risquée ?",
        ["b00082"],
        "Le terrain, le sexe, l’âge et l’intervalle rapproché correspondent au profil classique de l’hépatite immune.",
        [
          T(
            "La réexposition survient environ quatre semaines plus tard.",
            "Cet intervalle est typique du tableau rapporté.",
          ),
          T(
            "La patiente est une femme d’âge moyen.",
            "Le profil classique concerne une quadragénaire.",
          ),
          F(
            "Une hépatite virale antérieure explique ce tableau.",
            "Le mécanisme décrit est immuno-allergique et lié au métabolite de l’halothane.",
          ),
          F(
            "Un bilan initial normal supprime le danger.",
            "L’atteinte survient après l’exposition chez un foie auparavant normal.",
          ),
          F(
            "Seule une première exposition peut déclencher la forme grave.",
            "La réexposition rapprochée est au contraire caractéristique.",
          ),
        ],
        "Le dossier confirme une première exposition sans complication apparente vingt-huit jours plus tôt.",
      ),
      qcm(
        "Quel mécanisme explique cette complication ?",
        ["b00081", "b00082"],
        "Des métabolites trifluoroacétylés peuvent susciter une réponse immune, à laquelle s’ajoute une baisse du débit hépatique.",
        [
          F(
            "Une toxicité directe dose-dépendante du bromure libéré.",
            "Le bromure est excrété dans l’urine sans provoquer cette atteinte hépatique.",
          ),
          T(
            "L’acide trifluoroacétique participe à l’antigénicité.",
            "Il provient de la biotransformation de l’halothane.",
          ),
          T(
            "Une composante ischémique hépatique est possible.",
            "L’agent altère le débit sanguin du foie.",
          ),
          F(
            "Une accumulation rénale de composé A en est la cause.",
            "Le composé A concerne l’interaction du sévoflurane avec la chaux.",
          ),
          F(
            "Le monoxyde de carbone explique seul l’ictère retardé.",
            "Le tableau décrit une atteinte immuno-hépatique spécifique.",
          ),
        ],
        "L’équipe discute la physiopathologie avant de choisir un autre agent.",
      ),
      qcm(
        "Quels signes doivent faire rechercher cette hépatite ?",
        ["b00082"],
        "Fièvre, éosinophilie et ictère après exposition forment l’association d’alerte.",
        [
          F(
            "Une éruption cutanée urticarienne isolée.",
            "La triade rapportée associe fièvre, éosinophilie et ictère.",
          ),
          F(
            "Une insuffisance rénale aiguë oligoanurique.",
            "L’atteinte redoutée après halothane est hépatique et non rénale.",
          ),
          T(
            "Un ictère d’apparition postopératoire.",
            "Cette coloration traduit l’atteinte hépatique grave recherchée.",
          ),
          F(
            "Une toux isolée pendant l’induction.",
            "Elle n’identifie pas cette complication retardée.",
          ),
          F(
            "Une hypertension transitoire sans cytolyse.",
            "Elle évoque plutôt une stimulation sympathique que l’hépatite.",
          ),
        ],
        "La patiente demande quels symptômes auraient justifié une consultation après la première anesthésie.",
      ),
      qcm(
        "Quel choix d’entretien est cohérent ?",
        ["b00082", "b00088", "b00091"],
        "L’halothane doit être écarté ; un agent moderne peu métabolisé permet une cinétique plus prévisible.",
        [
          F(
            "Préférer l’isoflurane, agent de référence pour l’induction inhalée.",
            "L’odeur désagréable de l’isoflurane le rend impropre à l’endormissement au masque.",
          ),
          T(
            "Le sévoflurane constitue une alternative inhalée rapide.",
            "Son coefficient sang/gaz est faible et son métabolisme limité.",
          ),
          F(
            "Réduire simplement l’halothane à 0,3 CAM.",
            "Une faible dose ne supprime pas le risque immunologique de réexposition.",
          ),
          T(
            "Tracer l’agent reçu dans le dossier.",
            "L’historique conditionne les choix anesthésiques futurs.",
          ),
          T(
            "Le desflurane constitue aussi une option d’entretien peu métabolisée.",
            "Son métabolisme de 0,02 % est le plus bas des agents halogénés.",
          ),
        ],
        "Le plan est modifié avant l’entrée en salle.",
      ),
      qcm(
        "Quels effets cardiovasculaires auraient compliqué l’emploi d’halothane ?",
        ["b00079"],
        "L’halothane déprime débit et fréquence cardiaques et sensibilise le ventricule aux catécholamines.",
        [
          T(
            "Une diminution de la contractilité.",
            "L’effet inotrope négatif est concentration-dépendant.",
          ),
          T(
            "Un ralentissement sinusal ou jonctionnel sous halothane.",
            "L’action chronotrope négative de l’agent explique cette baisse de fréquence.",
          ),
          T(
            "Un rythme jonctionnel.",
            "Cette arythmie est fréquemment décrite avec l’halothane.",
          ),
          T(
            "Des extrasystoles avec adrénaline.",
            "La sensibilisation myocardique peut conduire à une fibrillation.",
          ),
          T(
            "Une hypotension liée à la chute du débit plus qu’aux résistances.",
            "Les résistances vasculaires périphériques restent peu modifiées sous halothane.",
          ),
        ],
        "Une infiltration chirurgicale adrénalinée est finalement annoncée.",
      ),
      qcm(
        "Quelle surveillance postopératoire reste adaptée ?",
        ["b00043", "b00077", "b00082"],
        "La surveillance habituelle du réveil s’associe à une information ciblée sur les signes hépatiques retardés.",
        [
          T(
            "Contrôler ventilation et oxygénation en SSPI.",
            "Les halogénés dépriment les réponses ventilatoires.",
          ),
          T(
            "Documenter l’absence de réexposition à l’halothane.",
            "Cette information évite une attribution erronée ultérieure.",
          ),
          T(
            "Expliquer de consulter devant fièvre ou ictère.",
            "Ces symptômes imposent un bilan hépatique.",
          ),
          F(
            "Programmer une nouvelle dose test d’halothane.",
            "Une provocation serait dangereuse et sans bénéfice.",
          ),
          F(
            "Supprimer toute surveillance car le risque est rare.",
            "La rareté ne dispense pas de prévenir une complication grave.",
          ),
        ],
        "Mme Girard se réveille sans incident après un entretien au sévoflurane.",
      ),
    ],
  },
  {
    title: "CAM, âge et hypothermie",
    vignette:
      "M. Benali, patient de 83 ans, est opéré d’une prothèse de hanche. Il reçoit un opioïde et du sévoflurane. La salle est froide, sa température centrale diminue progressivement et la pression artérielle devient basse alors que la concentration expirée reste proche de celle habituellement utilisée chez un adulte jeune.",
    questions: [
      qcm(
        "Comment interpréter la CAM chez ce patient ?",
        ["b00051", "b00055", "b00057"],
        "La CAM est une valeur populationnelle d’immobilité qui doit être ajustée aux facteurs diminuant le besoin.",
        [
          T(
            "Elle correspond à l’absence de mouvement chez 50 % des sujets.",
            "La réponse à l’incision définit ce repère.",
          ),
          F(
            "Elle mesure la vitesse d’installation de l’agent.",
            "La CAM quantifie la puissance, pas la cinétique de montée.",
          ),
          F(
            "Elle s’exprime en millimètres de mercure dans le sang artériel.",
            "La CAM se lit en pourcentage de la concentration alvéolaire.",
          ),
          F(
            "Une CAM élevée signifie une puissance forte.",
            "La puissance varie inversement à la CAM.",
          ),
          F(
            "La solubilité sanguine définit directement la CAM.",
            "Elle règle surtout la vitesse, tandis que la solubilité lipidique est liée à la puissance.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs diminuent ici la concentration requise ?",
        ["b00057"],
        "L’âge, l’opioïde, l’hypothermie et l’hypotension s’additionnent pour réduire la CAM.",
        [
          T(
            "Les 83 ans de M. Benali.",
            "Les besoins en agent inhalé diminuent avec le vieillissement.",
          ),
          T(
            "Le bolus opioïde reçu pendant l’entretien.",
            "Ce morphinique exerce un effet d’épargne sur la concentration de sévoflurane.",
          ),
          T(
            "La température centrale mesurée à 35,0 °C.",
            "La dépression du système nerveux central abaisse la CAM.",
          ),
          T(
            "La chute de pression artérielle peropératoire.",
            "La diminution de perfusion réduit la concentration nécessaire.",
          ),
          T(
            "Une benzodiazépine de prémédication aurait le même effet d’épargne.",
            "Les hypnotiques intraveineux abaissent aussi la concentration alvéolaire requise.",
          ),
        ],
        "La température atteint 35,0 °C et un bolus d’opioïde vient d’être administré.",
      ),
      qcm(
        "Quels signes suggèrent un excès d’halogéné ?",
        ["b00077", "b00090"],
        "Une profondeur excessive majore la dépression ventilatoire et cardiovasculaire.",
        [
          T(
            "Une baisse du volume courant.",
            "Les halogénés dépriment la ventilation.",
          ),
          T(
            "Une diminution de la réponse au CO2.",
            "Elle s’accentue avec la profondeur.",
          ),
          T(
            "Une hypotension par baisse des résistances.",
            "Le sévoflurane partage cet effet avec le desflurane.",
          ),
          F(
            "Une réponse hypoxique renforcée.",
            "Elle est au contraire fortement inhibée.",
          ),
          T(
            "Une abolition de la réaction motrice à la stimulation chirurgicale.",
            "L’immobilité complète accompagne une concentration alvéolaire élevée.",
          ),
        ],
        "La ventilation spontanée devient superficielle et la pression chute à 78/42 mmHg.",
      ),
      qcm(
        "Quelles mesures corrigent rationnellement la situation ?",
        ["b00013", "b00020", "b00057"],
        "La titration à la baisse, le réchauffement et le soutien des fonctions vitales traitent les facteurs réversibles.",
        [
          T(
            "Réduire la concentration inspirée.",
            "La pression cérébrale doit être adaptée au besoin abaissé.",
          ),
          F(
            "Ajouter du protoxyde d’azote pour renforcer l’analgésie.",
            "Ajouter un agent approfondirait l’anesthésie chez un patient déjà instable.",
          ),
          T(
            "Soutenir la ventilation si nécessaire.",
            "L’hypoventilation expose à l’hypercapnie et à l’hypoxémie.",
          ),
          T(
            "Traiter l’hypotension.",
            "La perfusion d’organe reste prioritaire.",
          ),
          F(
            "Augmenter la cible à 1,3 CAM sans réévaluation.",
            "Ce repère d’immobilité ne justifie pas un surdosage individuel.",
          ),
        ],
        "Aucun mouvement n’est observé et l’équipe décide de titrer l’entretien.",
      ),
      qcm(
        "Comment interpréter une absence de mouvement après réduction ?",
        ["b00051", "b00055"],
        "L’immobilité reflète l’effet cumulé des agents et du terrain, sans exiger une concentration standard.",
        [
          T(
            "Les contributions anesthésiques sont additives.",
            "L’opioïde diminue le besoin en vapeur.",
          ),
          F(
            "L’immobilité obtenue prouve qu’une CAM entière est atteinte.",
            "La valeur populationnelle ne décrit pas la concentration atteinte chez ce sujet.",
          ),
          F(
            "L’absence de mouvement prouve une conscience absente.",
            "La CAM ne mesure pas directement la mémorisation.",
          ),
          T(
            "La surveillance clinique et instrumentale doit continuer.",
            "Une observation ponctuelle ne garantit pas toute la suite de l’intervention.",
          ),
          T(
            "Revenir à la concentration antérieure exposerait à une nouvelle instabilité.",
            "Ce réglage avait précisément provoqué la chute de pression artérielle.",
          ),
        ],
        "La pression se corrige et le chirurgien poursuit sans réaction motrice.",
      ),
      qcm(
        "Quels facteurs pourraient au contraire augmenter la CAM ?",
        ["b00057"],
        "Hyperthermie, alcoolisation chronique, stimulants centraux, catécholamines et natrémie élevée relèvent tous la concentration alvéolaire nécessaire.",
        [
          T(
            "Une élévation importante de la température centrale.",
            "L’hyperthermie accroît le besoin en agent volatil de ce patient.",
          ),
          T(
            "Une tolérance acquise par alcoolisation chronique.",
            "Cette exposition prolongée augmente la CAM par rapport à un sujet non consommateur.",
          ),
          T(
            "La prise de substances stimulant le système nerveux central.",
            "Ces substances antagonisent l’effet dépresseur de l’agent volatil.",
          ),
          T(
            "Une administration de sympathomimétiques peropératoires.",
            "Les catécholamines circulantes relèvent la concentration alvéolaire nécessaire.",
          ),
          T(
            "Une natrémie élevée.",
            "L’hypernatrémie figure parmi les états qui relèvent le besoin anesthésique.",
          ),
        ],
        "Une discussion d’équipe compare ce patient à d’autres contextes physiologiques.",
      ),
      qcm(
        "Quels éléments favorisent un réveil prévisible ?",
        ["b00035", "b00043", "b00088"],
        "Le sévoflurane peu soluble s’élimine rapidement si la ventilation est restaurée, mais le terrain reste déterminant.",
        [
          T(
            "Arrêter l’apport de vapeur en fin de geste.",
            "Le gradient d’élimination s’inverse vers l’alvéole.",
          ),
          F(
            "Approfondir l’anesthésie juste avant la fermeture cutanée.",
            "Une charge alvéolaire accrue en fin de geste retarde le réveil.",
          ),
          T(
            "Poursuivre le réchauffement.",
            "L’hypothermie peut retarder la récupération globale.",
          ),
          F(
            "Attendre une élimination rénale majoritaire.",
            "L’expiration constitue la voie principale.",
          ),
          T(
            "Une dépression ventilatoire résiduelle reste possible malgré la cinétique rapide.",
            "La rapidité pharmacocinétique ne supprime pas les effets respiratoires observés.",
          ),
        ],
        "La chirurgie se termine une fois la température remontée à 36,1 °C.",
      ),
    ],
  },
  {
    title: "Neurochirurgie et choix d’un gaz",
    vignette:
      "Mme Novak, patiente de 39 ans, est prise en charge pour drainage d’un hématome intracrânien avec hypertension intracrânienne sévère. Une petite pneumoencéphalie est visible sur le scanner préopératoire. L’équipe cherche un agent rapide, stable sur le plan cardiovasculaire et compatible avec les contraintes neurologiques.",
    questions: [
      qcm(
        "Pourquoi le N2O est-il inadapté ?",
        ["b00064", "b00065"],
        "Il augmente le débit cérébral et diffuse rapidement dans la cavité gazeuse intracrânienne.",
        [
          F(
            "Sa dégradation par la chaux sodée libère du composé A.",
            "Ce produit de dégradation provient du sévoflurane, pas du protoxyde.",
          ),
          T(
            "Il peut agrandir la pneumoencéphalie.",
            "Il entre plus vite que l’azote ne sort de l’espace clos.",
          ),
          T(
            "La pression de la cavité peut augmenter.",
            "L’expansion gazeuse se poursuit jusqu’à l’équilibration.",
          ),
          T(
            "Il est déconseillé en cas d’hypertension intracrânienne sévère.",
            "La hausse du débit cérébral aggrave une pression déjà élevée.",
          ),
          T(
            "Sa faible puissance, avec une CAM de 104 %, interdit son usage isolé.",
            "Une concentration supérieure à 70 % créerait déjà un mélange hypoxique.",
          ),
        ],
      ),
      qcm(
        "Quelles autres contre-indications reposent sur l’expansion d’air ?",
        ["b00065"],
        "Le N2O doit être évité lorsqu’une cavité gazeuse fermée ne peut pas se décomprimer.",
        [
          T(
            "Une collection pleurale gazeuse laissée sans drainage.",
            "Le volume pleural gazeux peut augmenter.",
          ),
          T(
            "Des anses intestinales occluses et déjà distendues.",
            "Les anses distendues captent rapidement le N2O.",
          ),
          T(
            "Des bulles intravasculaires lors d’une embolie gazeuse.",
            "Les bulles intravasculaires risquent de grossir.",
          ),
          T(
            "Une reconstruction tympanique avec oreille moyenne fermée.",
            "L’augmentation de pression dans l’oreille moyenne compromettrait la réparation.",
          ),
          F(
            "Une plaie crânienne largement ouverte.",
            "Un espace communiquant n’a pas le même comportement qu’une cavité close.",
          ),
        ],
        "Le neurochirurgien demande une liste des situations partageant ce mécanisme.",
      ),
      qcm(
        "Quel profil théorique rend le xénon attractif ?",
        ["b00069", "b00070", "b00071"],
        "Le xénon est très peu soluble, non irritant et hémodynamiquement stable, mais peu puissant et coûteux.",
        [
          F(
            "Son coefficient sang/gaz de 1,4 explique une installation progressive.",
            "Le xénon affiche 0,115, la valeur la plus basse du tableau.",
          ),
          T(
            "Il ne déprime pas la fonction myocardique.",
            "La stabilité circulatoire est un avantage majeur.",
          ),
          F(
            "Son métabolisme hépatique de 3 % impose une surveillance.",
            "Le xénon traverse l’organisme sans subir de biotransformation.",
          ),
          F(
            "Sa CAM de 0,71 % montre une puissance extrême.",
            "Sa CAM est de 71 %, donc sa puissance est faible.",
          ),
          T(
            "Sa rareté limite sa disponibilité.",
            "Le coût élevé restreint l’usage clinique.",
          ),
        ],
        "Un appareil au xénon est évoqué mais n’est pas disponible dans l’établissement.",
      ),
      qcm(
        "Comment distinguer rapidité et puissance dans ce choix ?",
        ["b00024", "b00051", "b00069"],
        "Le coefficient sang/gaz prédit la vitesse, tandis que la CAM compare la puissance.",
        [
          T(
            "Une faible solubilité sanguine accélère l’équilibre.",
            "Peu de gaz doit se dissoudre avant la montée de pression.",
          ),
          F(
            "Le coefficient sang/gaz du xénon, à 0,115, traduit sa faible puissance.",
            "Cette valeur annonce une cinétique rapide, la CAM de 71 % disant la puissance.",
          ),
          F(
            "La CAM prédit à elle seule la vitesse de réveil.",
            "Elle ne quantifie pas la taille des réservoirs sanguins et tissulaires.",
          ),
          T(
            "Le xénon combine rapidité et faible puissance.",
            "Ses deux valeurs illustrent l’indépendance des concepts.",
          ),
          F(
            "Un agent puissant est nécessairement lent.",
            "Aucune relation obligatoire n’unit ces deux propriétés.",
          ),
        ],
        "L’interne confond la CAM du xénon avec sa cinétique.",
      ),
      qcm(
        "Quels avantages et limites présente le sévoflurane ?",
        ["b00088", "b00090", "b00091"],
        "Le sévoflurane est rapide et non irritant, mais ses effets respiratoires et cardiovasculaires imposent une titration.",
        [
          T(
            "Son coefficient sang/gaz de 0,65 permet des ajustements rapides.",
            "Sa faible solubilité limite le réservoir sanguin.",
          ),
          T(
            "Il provoque peu d’irritation des voies aériennes.",
            "Son odeur est compatible avec une induction inhalée.",
          ),
          T(
            "Il peut diminuer les résistances vasculaires.",
            "Ses effets circulatoires ressemblent à ceux du desflurane.",
          ),
          T(
            "Son métabolisme représente environ 3 %.",
            "La majeure partie est éliminée par le poumon.",
          ),
          T(
            "Il peut être employé en présence d’une cavité aérienne close.",
            "L’expansion des espaces clos reste propre au protoxyde d’azote.",
          ),
        ],
        "Le sévoflurane est retenu à faible concentration dans une technique multimodale.",
      ),
      qcm(
        "Quels paramètres doivent guider sa titration ?",
        ["b00013", "b00039", "b00051", "b00057"],
        "La concentration expirée, le terrain, l’hémodynamique et les coagents permettent d’adapter la pression cérébrale.",
        [
          T(
            "La fraction alvéolaire mesurée.",
            "Elle approche la pression partielle au site d’action.",
          ),
          F(
            "La diurèse horaire mesurée pendant le drainage.",
            "L’élimination rénale ne participe pas à la cinétique des agents inhalés.",
          ),
          T(
            "L’âge de la patiente.",
            "La CAM varie avec les caractéristiques individuelles.",
          ),
          T(
            "Les opioïdes associés.",
            "Ils diminuent la concentration d’halogéné nécessaire.",
          ),
          T(
            "La pression artérielle, qui module le besoin réel.",
            "Une pression effondrée réduit le besoin en agent volatil.",
          ),
        ],
        "Une hypotension survient pendant le drainage et le débit cardiaque diminue.",
      ),
      qcm(
        "Quelles priorités encadrent le réveil ?",
        ["b00035", "b00043", "b00077"],
        "L’arrêt de l’agent et une ventilation efficace permettent une évaluation neurologique rapide sans négliger l’oxygénation.",
        [
          T(
            "Interrompre le sévoflurane au moment approprié.",
            "Le wash-out commence dès l’arrêt de l’apport.",
          ),
          F(
            "Compter sur le métabolisme hépatique du sévoflurane pour l’éveil.",
            "Seuls 3 % subissent une transformation, le poumon faisant le reste.",
          ),
          F(
            "Prolonger l’entretien jusqu’à la suture cutanée pour éviter tout mouvement.",
            "Une concentration élevée retarderait l’examen neurologique attendu.",
          ),
          F(
            "Administrer du N2O pour accélérer l’éveil.",
            "Il exposerait à l’expansion de la pneumoencéphalie.",
          ),
          T(
            "Miser sur une excrétion pulmonaire de l’agent inchangé.",
            "Les halogénés sont exhalés en très grande majorité sans transformation.",
          ),
        ],
        "Le scanner peropératoire montre la persistance de la cavité aérienne avant la fermeture.",
      ),
    ],
  },
  {
    title: "Anesthésie ambulatoire à faible empreinte",
    vignette:
      "M. Louis, patient de 31 ans sans comorbidité, est programmé pour arthroscopie ambulatoire. Le service souhaite un réveil rapide tout en réduisant ses émissions. Le desflurane, le sévoflurane et une anesthésie intraveineuse au propofol sont disponibles ; aucune difficulté prévisible de ventilation n’est identifiée.",
    questions: [
      qcm(
        "Quels critères comparer avant de choisir la technique ?",
        ["b00024", "b00051", "b00102"],
        "Le choix associe cinétique, effets physiologiques, contexte clinique et empreinte environnementale.",
        [
          F(
            "La date de première utilisation clinique de l’agent.",
            "L’ancienneté d’un agent ne dit rien de sa tolérance ni de son impact.",
          ),
          F(
            "Le nombre d’atomes de fluor de la molécule.",
            "La formule chimique seule ne prédit ni la puissance ni la cinétique.",
          ),
          T(
            "La tolérance respiratoire et circulatoire.",
            "Un réveil rapide ne compense pas une mauvaise tolérance.",
          ),
          T(
            "L’empreinte climatique de l’agent.",
            "Elle doit être intégrée lorsque plusieurs options sont sûres.",
          ),
          F(
            "La couleur de la bouteille comme critère pharmacologique.",
            "Elle n’informe ni sur la puissance ni sur l’impact environnemental.",
          ),
        ],
      ),
      qcm(
        "Comment comparer desflurane et sévoflurane ?",
        ["b00084", "b00085", "b00088"],
        "Tous deux sont rapides, mais le sévoflurane est mieux toléré par les voies aériennes et le desflurane plus irritant.",
        [
          T(
            "Le desflurane a le coefficient sang/gaz le plus faible des deux.",
            "Sa cinétique est particulièrement rapide.",
          ),
          T(
            "Le sévoflurane permet une induction inhalée.",
            "Son odeur agréable et l’absence d’irritation s’y prêtent.",
          ),
          T(
            "Le desflurane peut provoquer toux ou laryngospasme.",
            "Son odeur âcre irrite les voies respiratoires.",
          ),
          T(
            "Le desflurane impose un vaporisateur chauffé, contrairement au sévoflurane.",
            "Son point d’ébullition bas rend le vaporisateur classique inutilisable.",
          ),
          F(
            "Le desflurane est le plus puissant des halogénés.",
            "Sa CAM élevée en fait le moins puissant du groupe.",
          ),
        ],
        "Le patient demande pourquoi l’agent au réveil le plus rapide n’est pas automatiquement retenu.",
      ),
      qcm(
        "Que montre la comparaison environnementale ?",
        ["b00102"],
        "Le desflurane domine nettement l’empreinte des halogénés, tandis que le propofol a l’impact comparatif le plus faible.",
        [
          T(
            "Le desflurane a une empreinte environ vingt fois celle du sévoflurane.",
            "La comparaison est faite avec les débits de gaz frais indiqués.",
          ),
          F(
            "L’isoflurane émet davantage que le desflurane.",
            "Le desflurane pèse environ quinze fois plus que l’isoflurane.",
          ),
          F(
            "Le propofol émet autant qu’un halogéné à débit réduit.",
            "L’estimation situe le propofol quatre fois en dessous des agents inhalés.",
          ),
          F(
            "Le N2O réduit l’impact global du mélange.",
            "Son utilisation augmente significativement l’empreinte.",
          ),
          F(
            "Les trois options ont une empreinte identique.",
            "Les différences sont suffisamment grandes pour orienter le choix.",
          ),
        ],
        "La réunion d’écoresponsabilité demande une estimation comparative.",
      ),
      qcm(
        "Quelle stratégie est raisonnable pour ce patient ?",
        ["b00088", "b00102"],
        "En l’absence d’indication spécifique au desflurane, sévoflurane à bas débit ou propofol sont cohérents.",
        [
          T(
            "Écarter l’usage routinier du desflurane.",
            "Son bénéfice marginal ne justifie pas ici l’empreinte majeure.",
          ),
          T(
            "Envisager le propofol si la technique est adaptée.",
            "Son impact comparatif est plus faible.",
          ),
          T(
            "Utiliser le sévoflurane à débit raisonné si une vapeur est choisie.",
            "Il offre une cinétique rapide avec une empreinte moindre.",
          ),
          F(
            "Ajouter du N2O pour diminuer obligatoirement les émissions.",
            "Le N2O augmente au contraire l’impact climatique.",
          ),
          T(
            "Vérifier la sécurité de l’oxygénation avant toute réduction de débit.",
            "Un bas débit ne se conçoit qu’avec une surveillance de la FiO2.",
          ),
        ],
        "L’équipe retient finalement le sévoflurane sans N2O avec limitation du débit frais.",
      ),
      qcm(
        "Quels éléments permettent un réglage individualisé ?",
        ["b00013", "b00051", "b00055", "b00057"],
        "Le réglage individuel combine la CAM corrigée pour l’âge, la dose d’opioïde reçue et l’état hémodynamique du moment.",
        [
          F(
            "La pression de vapeur affichée sur le vaporisateur.",
            "Cette donnée physique ne renseigne pas sur la profondeur atteinte.",
          ),
          F(
            "Le poids du patient exprimé en kilogrammes.",
            "La titration inhalée repose sur des concentrations, non sur des milligrammes par kilo.",
          ),
          T("La dose d’opioïde.", "Elle réduit les besoins en halogéné."),
          T(
            "La valeur de CAM corrigée pour l’âge et les coagents.",
            "Un repère individualisé remplace la CAM standard du jeune adulte.",
          ),
          T(
            "L’état hémodynamique.",
            "Une hypotension profonde abaisse les besoins.",
          ),
        ],
        "Un opioïde est administré et la concentration expirée est suivie en continu.",
      ),
      qcm(
        "Comment favoriser un réveil rapide ?",
        ["b00035", "b00037", "b00043"],
        "L’arrêt de l’apport et une ventilation efficace exploitent la faible solubilité du sévoflurane.",
        [
          F(
            "Ajouter un morphinique de longue durée juste avant la fermeture.",
            "Un opioïde prolongé retarde la reprise ventilatoire en ambulatoire.",
          ),
          F(
            "Réduire la fréquence respiratoire pour limiter les rejets.",
            "Un renouvellement alvéolaire abaissé freine l’expiration de la vapeur.",
          ),
          T(
            "Limiter l’accumulation par une concentration adaptée.",
            "Une charge tissulaire plus faible raccourcit le wash-out.",
          ),
          F(
            "Compter sur un métabolisme hépatique complet.",
            "La voie pulmonaire assure l’essentiel de l’élimination.",
          ),
          T(
            "Bénéficier de la faible solubilité du sévoflurane.",
            "Un coefficient de 0,65 accélère le lavage pulmonaire à l’arrêt.",
          ),
        ],
        "La fermeture cutanée commence et la sortie ambulatoire est prévue le jour même.",
      ),
      qcm(
        "Quels indicateurs concluent la démarche ?",
        ["b00043", "b00077", "b00102"],
        "La qualité associe récupération clinique, absence de complication et réduction mesurable de la consommation de gaz.",
        [
          T(
            "Un réveil ventilatoire satisfaisant.",
            "La dépression respiratoire doit être levée avant la sortie de SSPI.",
          ),
          T(
            "Une stabilité hémodynamique.",
            "La vasodilatation résiduelle peut retarder la récupération.",
          ),
          T(
            "Une consommation moindre de sévoflurane.",
            "Elle traduit l’effet de la limitation du débit et de la titration.",
          ),
          T(
            "L’absence de desflurane et de N2O sans indication.",
            "Cette décision diminue l’empreinte sans compromettre la sécurité.",
          ),
          T(
            "Une reprise complète des réflexes de protection des voies aériennes.",
            "Toux et déglutition efficaces protègent contre l’inhalation après extubation.",
          ),
        ],
        "M. Louis est éveillé, stable et prêt à quitter la SSPI après l’évaluation habituelle.",
      ),
    ],
  },
];

function buildDpQcm() {
  return [...DP_QCM, ...DP_QCM_EXTRA].map((serie, index) => ({
    label: `DP QCM ${index + 1} · ${serie.title}`,
    allowed_voies: ["interne"],
    vignette: serie.vignette,
    questions: serie.questions,
  }));
}

const ISOLATED_QCM_REST = [
  {
    title: "Captage et élimination",
    questions: [
      qcm(
        "Comment la solubilité sanguine modifie-t-elle la cinétique ?",
        ["b00022", "b00023", "b00024", "b00037"],
        "Le sang est un réservoir : plus il dissout l’agent, plus la pression alvéolaire et cérébrale évolue lentement.",
        [
          F(
            "Un coefficient sang/gaz de 0,42 caractérise l’halothane.",
            "L’halothane se situe vers 2,4 quand le desflurane occupe la valeur de 0,42.",
          ),
          T(
            "Un coefficient faible accélère le réveil.",
            "L’agent ressort rapidement du sang vers l’alvéole.",
          ),
          F(
            "La solubilité n’intervient qu’après plusieurs heures.",
            "Elle influence dès les premières minutes de l’administration.",
          ),
          T(
            "Le desflurane est plus rapide que l’halothane.",
            "Leur différence de coefficient explique cette hiérarchie.",
          ),
          F(
            "Le méthoxyflurane très soluble se lave rapidement.",
            "Sa forte solubilité favorise au contraire l’accumulation.",
          ),
        ],
      ),
      qcm(
        "Quel effet le débit cardiaque exerce-t-il sur l’induction ?",
        ["b00038", "b00039"],
        "Le débit cardiaque règle la quantité d’agent retirée des alvéoles vers les tissus.",
        [
          T(
            "Un débit élevé ralentit la montée alvéolaire.",
            "Le sang prélève davantage de vapeur par minute.",
          ),
          T(
            "Un faible débit accélère l’augmentation de FA.",
            "Le captage sanguin de vapeur depuis les alvéoles est alors réduit.",
          ),
          F(
            "Un choc protège d’un surdosage inhalé.",
            "La pression cérébrale peut monter brutalement lorsque le débit chute.",
          ),
          T(
            "Une induction doit être prudente en bas débit.",
            "Une concentration programmée peut produire rapidement un effet profond.",
          ),
          T(
            "Le débit cardiaque figure parmi les trois déterminants du captage tissulaire.",
            "Solubilité sanguine, débit cardiaque et gradient alvéolo-veineux commandent ce captage.",
          ),
        ],
      ),
      qcm(
        "Que devient le gradient alvéolo-veineux au cours du temps ?",
        ["b00040", "b00041"],
        "Il est maximal au début puis s’efface lorsque les compartiments tissulaires se rapprochent de l’équilibre.",
        [
          F(
            "Le sang veineux mêlé contient dès la première minute autant d’agent que l’alvéole.",
            "Le retour veineux part d’une concentration nulle, d’où un gradient maximal au début.",
          ),
          F(
            "Un gradient alvéolo-veineux large accélère la montée de la fraction alvéolaire.",
            "Un captage tissulaire intense freine l’élévation alvéolaire pendant l’induction.",
          ),
          F(
            "Il augmente indéfiniment pendant l’entretien.",
            "Il diminue au fur et à mesure de la saturation.",
          ),
          T(
            "Son influence devient faible après équilibrage.",
            "Les pressions alvéolaire et veineuse se rapprochent.",
          ),
          F(
            "Il est indépendant de la perfusion tissulaire.",
            "La distribution aux organes conditionne le retour veineux mêlé.",
          ),
        ],
      ),
      qcm(
        "Quels principes gouvernent le réveil après un halogéné ?",
        ["b00035", "b00042", "b00043"],
        "L’arrêt de l’apport inverse les gradients ; la ventilation et la faible solubilité favorisent l’élimination pulmonaire.",
        [
          T(
            "L’expiration constitue la voie principale d’élimination.",
            "La majorité de l’agent quitte l’organisme inchangée.",
          ),
          F(
            "L’élimination pulmonaire obéit à des facteurs distincts de ceux qui gouvernent le captage.",
            "Les mêmes déterminants, solubilité, ventilation et débit, règlent captage et lavage.",
          ),
          T(
            "Une faible solubilité limite le réservoir tissulaire.",
            "Moins d’agent doit revenir vers les poumons.",
          ),
          F(
            "Le foie assure toujours la majorité de l’élimination.",
            "Le métabolisme est minoritaire pour les agents modernes.",
          ),
          F(
            "L’halothane décroît plus vite que le desflurane.",
            "Sa forte solubilité prolonge sa décroissance.",
          ),
        ],
      ),
      qcm(
        "Quels agents ont la cinétique la plus rapide ?",
        ["b00025", "b00035", "b00069", "b00084", "b00088"],
        "La hiérarchie des coefficients sang/gaz sépare les agents rapides comme le desflurane des agents nettement plus solubles.",
        [
          F(
            "L’isoflurane, dont le coefficient sang/gaz avoisine 1,4.",
            "Cette valeur intermédiaire le place derrière sévoflurane, desflurane et xénon.",
          ),
          T(
            "Le desflurane.",
            "Son coefficient proche de 0,42 soutient une montée rapide.",
          ),
          F(
            "Le sévoflurane, plus soluble dans le sang que l’halothane.",
            "Le coefficient du sévoflurane, voisin de 0,65, est très inférieur à celui de l’halothane.",
          ),
          F(
            "L’halothane.",
            "Son coefficient proche de 2,3 ralentit les changements de profondeur.",
          ),
          F(
            "Le méthoxyflurane.",
            "Sa valeur très élevée en fait le plus soluble du tableau.",
          ),
        ],
      ),
    ],
  },
  {
    title: "CAM et interactions",
    questions: [
      qcm(
        "Que signifie la concentration alvéolaire minimale ?",
        ["b00050", "b00051", "b00055"],
        "La CAM est un repère populationnel de puissance fondé sur le mouvement à l’incision.",
        [
          F(
            "Elle se déduit de la solubilité de l’agent dans le sang.",
            "La puissance suit la solubilité dans l’huile, quand le sang commande la vitesse.",
          ),
          F(
            "Elle garantit l’amnésie chez tous les patients.",
            "La définition ne porte que sur la réponse motrice.",
          ),
          T(
            "Elle varie selon l’âge et la physiologie.",
            "De nombreux facteurs déplacent le besoin individuel.",
          ),
          F(
            "Une CAM élevée signifie un agent puissant.",
            "La puissance est inverse de la valeur de CAM.",
          ),
          T(
            "Environ 1,3 CAM bloque le mouvement chez 95 %.",
            "Ce repère augmente la probabilité d’immobilité.",
          ),
        ],
      ),
      qcm(
        "Comment associer plusieurs agents inhalés ?",
        ["b00055"],
        "Les fractions de CAM sont additives et permettent d’estimer la puissance totale du mélange.",
        [
          T(
            "0,7 CAM de N2O peut s’additionner à 0,3 CAM de sévoflurane.",
            "La somme de leurs contributions atteint approximativement une CAM.",
          ),
          T(
            "Une association réduit la concentration requise de chaque agent.",
            "Chaque composant contribue à l’effet global.",
          ),
          F(
            "Les CAM s’annulent lorsqu’un gaz et une vapeur sont mélangés.",
            "Les contributions des deux agents s’ajoutent au lieu de s’annuler.",
          ),
          F(
            "Deux agents à 1 CAM chacun donnent seulement 0,5 CAM.",
            "La somme atteindrait approximativement 2 CAM.",
          ),
          T(
            "L’addition ne dispense pas de surveiller les effets propres.",
            "Dépression ventilatoire et risques spécifiques persistent.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs augmentent la CAM ?",
        ["b00057"],
        "Une activation du système nerveux central ou certains états physiologiques élèvent les besoins.",
        [
          T(
            "L’hyperthermie.",
            "Elle augmente l’activité métabolique et le besoin anesthésique.",
          ),
          F(
            "Une hypothermie modérée peropératoire.",
            "Le refroidissement abaisse les besoins et diminue donc la concentration nécessaire.",
          ),
          T(
            "Des stimulants du système nerveux central.",
            "Ils s’opposent à la dépression anesthésique.",
          ),
          T(
            "Le jeune âge, comparé à celui d’un sujet âgé.",
            "Les besoins anesthésiques culminent chez le nourrisson puis déclinent avec les années de vie.",
          ),
          F(
            "Une hypotension très profonde.",
            "Une perfusion basse réduit les besoins.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs diminuent la CAM ?",
        ["b00057"],
        "La dépression du système nerveux central, l’âge et plusieurs états critiques diminuent la concentration requise.",
        [
          T(
            "L’hypothermie.",
            "Le refroidissement réduit l’activité du système nerveux central.",
          ),
          F(
            "Un alcoolisme chronique ancien.",
            "La tolérance acquise relève les besoins au lieu de les abaisser.",
          ),
          T(
            "L’âge avancé.",
            "La sensibilité anesthésique augmente avec les années.",
          ),
          T(
            "Une alcoolisation aiguë.",
            "L’effet dépresseur réduit les besoins immédiats.",
          ),
          T(
            "Une grossesse en cours.",
            "Les modifications hormonales de la gestation réduisent la concentration requise.",
          ),
        ],
      ),
      qcm(
        "Quels repères de puissance sont corrects ?",
        ["b00053", "b00060", "b00069", "b00074", "b00084"],
        "Les valeurs de CAM permettent de comparer la puissance indépendamment de la vitesse.",
        [
          F(
            "L’isoflurane affiche une CAM de 0,77 %, la plus basse des halogénés.",
            "La valeur de 0,77 revient à l’halothane, l’isoflurane se situant vers 1,15 %.",
          ),
          T(
            "Le sévoflurane a une CAM voisine de 2 %.",
            "Cette valeur est intermédiaire parmi les halogénés.",
          ),
          T(
            "Le desflurane a une CAM proche de 6 %.",
            "Il est le moins puissant des halogénés usuels.",
          ),
          F(
            "Le N2O à 104 % peut être utilisé seul en air ambiant.",
            "La concentration nécessaire est incompatible avec une oxygénation sûre.",
          ),
          T(
            "Le xénon à 71 % est peu puissant.",
            "Sa CAM élevée contraste avec sa grande rapidité.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Protoxyde d’azote",
    questions: [
      qcm(
        "Quelles caractéristiques expliquent l’usage du N2O comme adjuvant ?",
        ["b00059", "b00060"],
        "Le N2O apporte une analgésie rapide et épargne les autres agents sans pouvoir assurer seul une anesthésie complète.",
        [
          T(
            "Il est peu soluble dans le sang.",
            "Cette propriété donne un début et une fin rapides.",
          ),
          T(
            "Il possède une action analgésique.",
            "Il peut réduire les concentrations d’halogéné nécessaires.",
          ),
          T(
            "Sa CAM de 104 % impose de l’associer à un autre agent.",
            "Une puissance aussi faible empêche d’atteindre seule la profondeur chirurgicale.",
          ),
          T(
            "Il est conservé liquéfié sous pression.",
            "À température ambiante, le gaz se liquéfie lorsqu’il est comprimé.",
          ),
          T(
            "Il est rarement employé au-delà de 70 % en raison du risque de mélange hypoxique.",
            "Au-dessus de ce seuil, la fraction d’oxygène restante devient insuffisante.",
          ),
        ],
      ),
      qcm(
        "Que faut-il savoir sur l’effet du deuxième gaz ?",
        ["b00061"],
        "Le captage rapide du N2O réduit le volume alvéolaire et concentre transitoirement un second agent.",
        [
          T(
            "Il débute par un captage massif de N2O.",
            "La grande quantité absorbée crée l’effet de concentration.",
          ),
          F(
            "L’effet de concentration décrit l’accélération du captage par une hausse du débit cardiaque.",
            "Le captage du protoxyde réduit le volume alvéolaire et concentre la vapeur restante.",
          ),
          T(
            "Un apport inspiré supplémentaire accompagne le phénomène.",
            "La réduction du volume alvéolaire favorise l’entrée de gaz frais.",
          ),
          F(
            "Il ne concerne qu’un mélange sans N2O.",
            "Le N2O est précisément le moteur du phénomène.",
          ),
          F(
            "Son importance clinique est unanimement démontrée.",
            "Sa pertinence réelle reste discutée.",
          ),
        ],
      ),
      qcm(
        "Comment prévenir l’hypoxie après arrêt du N2O ?",
        ["b00062"],
        "Le retour massif du N2O dans les alvéoles dilue l’oxygène ; une supplémentation transitoire prévient la désaturation.",
        [
          F(
            "Administrer de l’oxygène pendant les trente premières secondes seulement.",
            "La diffusion se poursuit bien au-delà, sur cinq à dix minutes après l’arrêt.",
          ),
          F(
            "Réduire la ventilation minute pour ralentir le retour du gaz vers l’alvéole.",
            "Une hypoventilation aggrave la désaturation au lieu de protéger le patient.",
          ),
          F(
            "Laisser systématiquement le patient en air ambiant dès l’arrêt.",
            "Une FiO2 à 0,21 favorise l’hypoxie de diffusion.",
          ),
          T(
            "Surveiller la saturation pendant le réveil.",
            "Une baisse confirme un besoin prolongé d’oxygène.",
          ),
          F(
            "Réintroduire du N2O pour corriger l’hypoxie.",
            "Cela entretient le mécanisme et n’apporte pas davantage d’oxygène.",
          ),
        ],
      ),
      qcm(
        "Dans quelles situations faut-il éviter le N2O ?",
        ["b00064", "b00065"],
        "Le N2O augmente le volume des cavités aériennes et le débit sanguin cérébral.",
        [
          T(
            "Un pneumothorax non drainé.",
            "Le gaz peut agrandir la collection pleurale.",
          ),
          F(
            "Une analgésie obstétricale par mélange équimolaire oxygène-protoxyde.",
            "L’Entonox est justement proposé pour l’analgésie du travail obstétrical.",
          ),
          T(
            "Une occlusion intestinale.",
            "La distension digestive peut s’aggraver.",
          ),
          T(
            "Une tympanoplastie.",
            "La pression dans l’oreille moyenne devient difficile à contrôler.",
          ),
          T(
            "Un air résiduel intracrânien après craniotomie.",
            "L’air enfermé dans la boîte crânienne se dilate sous protoxyde d’azote.",
          ),
        ],
      ),
      qcm(
        "Quels effets systémiques du N2O sont attendus ?",
        ["b00063", "b00064", "b00066"],
        "La dépression ventilatoire reste discrète, l’inotropisme négatif est compensé, le débit cérébral augmente et le gaz échappe au métabolisme.",
        [
          F(
            "Une dépression ventilatoire aussi marquée que sous halogéné.",
            "Le retentissement respiratoire du protoxyde reste léger comparé aux halogénés.",
          ),
          T(
            "Un effet inotrope négatif.",
            "La contractilité baisse directement.",
          ),
          T(
            "Une compensation sympathique chez le sujet sain.",
            "Elle limite l’impact circulatoire clinique.",
          ),
          T(
            "Une hausse d’environ 10 % du débit cérébral.",
            "Cet effet défavorise l’hypertension intracrânienne sévère.",
          ),
          T(
            "Une excrétion pulmonaire quasi exclusive du gaz inhalé.",
            "Le protoxyde traverse l’organisme presque intégralement sans être transformé.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Halothane",
    questions: [
      qcm(
        "Quel profil cinétique possède l’halothane ?",
        ["b00074", "b00076"],
        "L’halothane est puissant et non irritant, mais sa forte solubilité ralentit l’induction et la récupération.",
        [
          T(
            "Sa CAM est proche de 0,77 %.",
            "Cette valeur faible traduit une grande puissance.",
          ),
          T(
            "Son coefficient sang/gaz est élevé.",
            "Le sang dissout beaucoup d’agent avant l’équilibre.",
          ),
          T(
            "Son odeur fruitée permet une induction inhalée.",
            "L’absence d’irritation facilite la technique.",
          ),
          T(
            "Sa vitesse d’induction est moindre que celle des halogénés récents.",
            "Le coefficient sang/gaz de 2,4 retarde l’équilibre des pressions partielles.",
          ),
          T(
            "Il reste la référence historique de comparaison des halogénés.",
            "Les autres agents halogénés se décrivent encore par rapport à ce jalon.",
          ),
        ],
      ),
      qcm(
        "Quels effets respiratoires ont les halogénés ?",
        ["b00077", "b00078"],
        "Ils dépriment la ventilation et les réponses au CO2 et à l’hypoxie, tout en bronchodilatant.",
        [
          F(
            "Les halogénés épargnent la ventilation alvéolaire comme le font le xénon et le protoxyde d’azote.",
            "Seuls le xénon et le protoxyde échappent à cette dépression ventilatoire.",
          ),
          T(
            "La fréquence respiratoire augmente souvent.",
            "Elle compense partiellement la baisse du volume courant.",
          ),
          T(
            "La réponse au CO2 diminue avec la profondeur.",
            "La commande ventilatoire devient moins sensible.",
          ),
          T(
            "La bronchodilatation est directe.",
            "Les fibres musculaires bronchiques se relâchent directement sous l’effet de l’halogéné.",
          ),
          T(
            "La stimulation des chémorécepteurs périphériques est fortement émoussée même à faible dose.",
            "Une concentration de 0,1 CAM suffit à effondrer la réponse ventilatoire à l’hypoxie.",
          ),
        ],
      ),
      qcm(
        "Quels effets cardiovasculaires sont propres à l’halothane ?",
        ["b00079"],
        "L’halothane diminue surtout débit et fréquence cardiaques et sensibilise le myocarde aux catécholamines.",
        [
          T(
            "Une baisse de contractilité proportionnelle à la concentration.",
            "L’effet inotrope négatif réduit le débit.",
          ),
          T("Une bradycardie.", "Son action chronotrope est négative."),
          T(
            "Un rythme jonctionnel peut apparaître.",
            "Cette arythmie est décrite comme fréquente.",
          ),
          F(
            "L’hypotension vient surtout d’une vasodilatation majeure.",
            "Les résistances périphériques sont relativement peu modifiées.",
          ),
          T(
            "L’hypercapnie augmente le risque d’arythmie.",
            "Les catécholamines circulantes favorisent l’excitabilité ventriculaire.",
          ),
        ],
      ),
      qcm(
        "Pourquoi limiter l’adrénaline avec l’halothane ?",
        ["b00079"],
        "La sensibilisation myocardique aux catécholamines expose aux extrasystoles et à la fibrillation ventriculaire.",
        [
          F(
            "Le seuil de risque se situe au-delà de 15 µg/kg d’adrénaline chez l’adulte.",
            "Le repère retenu commence vers 1,5 µg/kg, dix fois plus bas que cette valeur.",
          ),
          T(
            "Une dose d’environ 1,5 µg/kg ou plus est préoccupante chez l’adulte.",
            "Ce repère est associé au risque rythmique décrit.",
          ),
          T(
            "Une infiltration chirurgicale adrénalinée peut être dangereuse.",
            "La dose locale passe dans la circulation.",
          ),
          F(
            "L’halothane prévient la fibrillation ventriculaire.",
            "Il augmente au contraire la sensibilité aux catécholamines.",
          ),
          F(
            "La bradycardie exclut toute extrasystole.",
            "Plusieurs troubles du rythme peuvent coexister.",
          ),
        ],
      ),
      qcm(
        "Quels éléments évoquent une hépatite à l’halothane ?",
        ["b00081", "b00082"],
        "Le métabolisme hépatique important peut déclencher une atteinte immune rare après réexposition rapprochée.",
        [
          T(
            "Une fièvre postopératoire.",
            "Elle fait partie de la triade classique.",
          ),
          T(
            "Une éosinophilie.",
            "Elle soutient le mécanisme immuno-allergique.",
          ),
          T("Un ictère.", "Il révèle l’atteinte hépatocellulaire sévère."),
          T(
            "Une seconde exposition dans un délai d’environ quatre semaines.",
            "La réexposition favorise la réponse anticorps.",
          ),
          F(
            "Un métabolisme limité à 0,02 %.",
            "Environ 20 % de l’halothane inspiré est métabolisé.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Desflurane et sévoflurane",
    questions: [
      qcm(
        "Quelles particularités techniques possède le desflurane ?",
        ["b00084"],
        "Ses propriétés physiques imposent un vaporisateur chauffé et pressurisé, et sa faible solubilité explique sa cinétique très rapide.",
        [
          T(
            "Son point d’ébullition est proche de 23,5 °C.",
            "Il est voisin de la température des salles.",
          ),
          T(
            "Sa pression de vapeur atteint environ 660 mmHg.",
            "Cette valeur rend un vaporisateur conventionnel imprécis.",
          ),
          T(
            "Le dispositif doit être chauffé et pressurisé.",
            "Il stabilise la délivrance malgré les propriétés physiques.",
          ),
          T(
            "Chaque agent exige un vaporisateur calibré pour ses propriétés physiques.",
            "L’étalonnage dépend de la pression de vapeur propre à chaque halogéné.",
          ),
          T(
            "Sa faible solubilité sanguine autorise des changements de profondeur très rapides.",
            "Le coefficient sang/gaz voisin de 0,42 accélère montée et décroissance alvéolaires.",
          ),
        ],
      ),
      qcm(
        "Pourquoi le desflurane convient-il mal à l’induction inhalée ?",
        ["b00085"],
        "Son odeur âcre irrite les voies aériennes et les variations brusques stimulent le système sympathique.",
        [
          F(
            "Son odeur fruitée le rapproche de l’halothane pour l’induction au masque.",
            "L’odeur fruitée appartient à l’halothane, quand le desflurane est âcre.",
          ),
          T(
            "Une hausse rapide peut provoquer tachycardie.",
            "La stimulation sympathique accélère la fréquence.",
          ),
          F(
            "Sa montée rapide provoque une bradycardie par stimulation vagale.",
            "L’élévation brusque active le sympathique et accélère la fréquence cardiaque.",
          ),
          F(
            "Il est dépourvu d’odeur et parfaitement doux.",
            "Son caractère âcre est une limite majeure.",
          ),
          F(
            "Il doit être privilégié pour l’induction pédiatrique.",
            "Le sévoflurane est beaucoup mieux toléré au masque.",
          ),
        ],
      ),
      qcm(
        "Quels risques sont associés au desflurane et au circuit ?",
        ["b00085", "b00086"],
        "Le desflurane est très peu métabolisé mais peut produire du CO en présence d’un absorbeur desséché.",
        [
          T(
            "Son métabolisme est proche de 0,02 %.",
            "L’élimination est presque entièrement pulmonaire.",
          ),
          T(
            "Un absorbeur desséché augmente la formation de CO.",
            "La réaction chimique est favorisée par la déshydratation.",
          ),
          T(
            "Le baralyme produit davantage de CO que la chaux sodée.",
            "Le type d’absorbeur influence la réaction.",
          ),
          T(
            "Une température élevée de l’absorbeur majore la production.",
            "La réaction chimique s’accélère avec la chaleur.",
          ),
          T(
            "Le desflurane produit plus de monoxyde de carbone que le sévoflurane.",
            "La hiérarchie place le desflurane en tête et le sévoflurane au dernier rang.",
          ),
        ],
      ),
      qcm(
        "Pourquoi le sévoflurane est-il adapté à l’induction ?",
        ["b00088"],
        "Sa faible solubilité s’associe à une odeur agréable et à une faible irritation des voies aériennes.",
        [
          F(
            "Son coefficient sang/gaz de 0,115 explique sa rapidité.",
            "La valeur de 0,115 revient au xénon, le sévoflurane se situant à 0,65.",
          ),
          T(
            "Il irrite peu les voies aériennes supérieures.",
            "La respiration spontanée au masque est mieux tolérée.",
          ),
          T(
            "Une inspiration maximale unique est possible chez l’adulte.",
            "La concentration alvéolaire peut monter rapidement.",
          ),
          F(
            "Il déclenche plus de laryngospasmes que le desflurane.",
            "Son profil est au contraire plus doux.",
          ),
          T(
            "Une odeur agréable facilite l’acceptation du masque.",
            "Une odeur bien tolérée limite les réactions de refus à l’induction.",
          ),
        ],
      ),
      qcm(
        "Quels éléments décrivent le métabolisme du sévoflurane ?",
        ["b00091", "b00092", "b00093"],
        "Une petite fraction est métabolisée ; fluorure et composé A n’imposent pas les restrictions historiques dans l’usage actuel.",
        [
          F(
            "Son métabolisme atteint environ 20 % de la dose inhalée.",
            "La proportion de 20 % caractérise l’halothane, le sévoflurane restant vers 3 %.",
          ),
          T(
            "Le fluorure sérique peut s’élever transitoirement.",
            "La biotransformation libère du fluor inorganique.",
          ),
          F(
            "Cette élévation entraîne constamment une insuffisance rénale.",
            "Sa brièveté limite le risque clinique observé.",
          ),
          T(
            "Le composé A naît d’une réaction avec la chaux sodée.",
            "Ce produit avait suscité une inquiétude néphrotoxique.",
          ),
          T(
            "Le fluor inorganique peut approcher 50 mmol/L chez certains patients.",
            "Ce seuil correspond à la limite de toxicité rénale retenue pour le méthoxyflurane.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Isoflurane et sécurité",
    questions: [
      qcm(
        "Quel profil clinique possède l’isoflurane ?",
        ["b00094", "b00095", "b00096"],
        "L’isoflurane est puissant et relativement peu soluble, mais son irritation limite l’induction chez le patient éveillé.",
        [
          T(
            "Son odeur désagréable gêne l’induction.",
            "Elle provoque une mauvaise tolérance respiratoire.",
          ),
          F(
            "Son excitabilité ventriculaire aux catécholamines dépasse celle de l’halothane.",
            "L’isoflurane sensibilise beaucoup moins le myocarde aux catécholamines que l’halothane.",
          ),
          F(
            "Son métabolisme oxydatif représente près de 3 % de son élimination.",
            "La fraction oxydée de l’isoflurane avoisine 0,2 %, celle du sévoflurane 3 %.",
          ),
          F(
            "Il provoque toujours une bradycardie profonde chez le jeune.",
            "La fréquence augmente plutôt chez le sujet jeune.",
          ),
          F(
            "Il est actuellement l’agent humain le plus utilisé.",
            "Son usage clinique humain est devenu rare.",
          ),
        ],
      ),
      qcm(
        "Comment l’isoflurane interagit-il avec le système neuromusculaire ?",
        ["b00098"],
        "L’isoflurane relâche directement le muscle et potentialise les bloqueurs neuromusculaires.",
        [
          T(
            "Il induit une relaxation musculaire directe.",
            "Le muscle squelettique répond au halogéné.",
          ),
          T(
            "Il augmente la sensibilité aux curares.",
            "Une même dose produit un bloc plus marqué.",
          ),
          T(
            "Les besoins en bloqueurs peuvent diminuer.",
            "La potentialisation autorise une réduction posologique.",
          ),
          T(
            "Une dose habituelle de curare risque de prolonger le bloc.",
            "L’effet renforcé fait durer le blocage au-delà de la durée attendue.",
          ),
          T(
            "L’effet myorelaxant persiste tant que l’agent est administré.",
            "L’arrêt de l’halogéné lève progressivement cette composante de relâchement.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs favorisent le monoxyde de carbone dans le circuit ?",
        ["b00086"],
        "La nature de l’agent, la sécheresse, le type et la température de l’absorbeur déterminent la production.",
        [
          T(
            "Un absorbeur fortement déshydraté.",
            "La sécheresse est le facteur de circuit majeur.",
          ),
          T(
            "L’utilisation du desflurane.",
            "Il produit davantage de CO que les autres agents cités.",
          ),
          T(
            "Une température élevée de la chaux.",
            "Elle accélère la dégradation chimique.",
          ),
          T(
            "L’emploi de baralyme plutôt que de chaux sodée.",
            "Le baralyme favorise davantage la réaction.",
          ),
          T(
            "Une concentration élevée d’halogéné dans le circuit.",
            "La quantité de monoxyde formée croît avec la concentration délivrée.",
          ),
        ],
      ),
      qcm(
        "Comment réduire l’empreinte des anesthésiques ?",
        ["b00101", "b00102"],
        "Le choix de l’agent et le débit de gaz frais doivent limiter les gaz les plus persistants sans compromettre les soins.",
        [
          F(
            "Préférer systématiquement le desflurane au sévoflurane pour l’entretien.",
            "L’empreinte du desflurane dépasse de vingt fois celle du sévoflurane.",
          ),
          T(
            "Éviter le N2O sans bénéfice clinique attendu.",
            "Il augmente nettement l’impact climatique.",
          ),
          T(
            "Réduire les débits de gaz frais lorsque la sécurité le permet.",
            "Moins de gaz rejeté diminue les émissions.",
          ),
          T(
            "Envisager une technique intraveineuse adaptée.",
            "Le propofol a une empreinte plus faible dans la comparaison fournie.",
          ),
          F(
            "Augmenter le débit pour éliminer plus vite le gaz dans l’atmosphère.",
            "Cela accroît directement la consommation et les rejets.",
          ),
        ],
      ),
      qcm(
        "Quelles comparaisons environnementales sont correctes ?",
        ["b00102"],
        "Le desflurane domine l’empreinte des agents comparés, tandis que le propofol est nettement moins émetteur.",
        [
          T(
            "Le desflurane est environ quinze fois plus impactant que l’isoflurane.",
            "Cette différence est rapportée pour les débits comparés.",
          ),
          F(
            "Le débit de gaz frais retenu pour la comparaison est de 5 L/min pour le sévoflurane.",
            "La comparaison repose sur 2 L/min pour le sévoflurane et 1 L/min pour le desflurane.",
          ),
          T(
            "Le N2O augmente significativement l’empreinte.",
            "Sa persistance atmosphérique contribue à l’effet de serre.",
          ),
          F(
            "Le sévoflurane a toujours une empreinte supérieure au desflurane.",
            "La comparaison va nettement dans le sens inverse.",
          ),
          T(
            "Le propofol est environ quatre fois moins impactant que les agents inhalés.",
            "Cette estimation soutient une réflexion de technique anesthésique.",
          ),
        ],
      ),
    ],
  },
];

function buildIsolatedQcm() {
  return [...ISOLATED_QCM, ...ISOLATED_QCM_REST, ...ISOLATED_QCM_FINAL].map(
    (entry, index) => ({
      label: `QCM ${index + 1} · ${entry.title}`,
      allowed_voies: ["interne"],
      questions: entry.questions,
    }),
  );
}

const DP_QCM = [
  {
    title: "Induction inhalée pédiatrique",
    vignette:
      "Lina, patiente de 5 ans pesant 19 kg, doit être opérée d’une hernie inguinale. Elle refuse toute ponction avant l’endormissement, ne présente ni cardiopathie ni anomalie respiratoire et a respecté le jeûne. L’équipe prévoit une induction inhalée au masque, puis une voie veineuse après perte de conscience, avec maintien d’une ventilation spontanée initiale.",
    questions: [
      qcm(
        "Quels éléments soutiennent le choix initial du sévoflurane ?",
        ["b00076", "b00087", "b00088"],
        "L’induction par inhalation se conçoit avec le sévoflurane ou l’halothane, les repères de métabolisme, d’odeur et de solubilité cités ici visant d’autres agents.",
        [
          F(
            "Son métabolisme hépatique de 20 % expose l’enfant à une hépatite.",
            "Le sévoflurane est métabolisé à 3 % seulement, l’hépatite décrite visant l’halothane.",
          ),
          F(
            "Son odeur âcre oblige à masquer le circuit avant l’application.",
            "L’odeur âcre caractérise le desflurane, le sévoflurane restant bien toléré.",
          ),
          F(
            "Sa forte solubilité sanguine allonge le délai avant la perte de conscience.",
            "Un coefficient de 0,65 place le sévoflurane parmi les agents peu solubles.",
          ),
          F(
            "Une CAM de 0,77 % rend le sévoflurane le plus puissant.",
            "Sa CAM est proche de 2 % ; 0,77 % correspond à l’halothane.",
          ),
          T(
            "Le sévoflurane figure avec l’halothane parmi les agents utilisables au masque.",
            "Ces deux agents sont les seuls retenus pour endormir un enfant par voie inhalée.",
          ),
        ],
      ),
      qcm(
        "Comment accélérer l’induction sans changer d’agent ?",
        ["b00016", "b00017", "b00019", "b00020"],
        "Une fraction inspirée suffisante et une ventilation alvéolaire efficace augmentent rapidement la fraction alvéolaire.",
        [
          T(
            "Assurer l’étanchéité du masque.",
            "Une fuite diluerait la concentration réellement inspirée.",
          ),
          T(
            "Utiliser une concentration inspiratoire élevée adaptée.",
            "Le gradient plus grand accélère la montée de FA.",
          ),
          T(
            "Maintenir une ventilation alvéolaire efficace.",
            "Chaque cycle apporte davantage de vapeur.",
          ),
          T(
            "La faible solubilité du sévoflurane rend cette accélération possible.",
            "Un coefficient bas laisse la fraction alvéolaire rejoindre vite la fraction inspirée.",
          ),
          T(
            "Surveiller la concentration expirée pour suivre la montée alvéolaire.",
            "La mesure télé-expiratoire approche la pression alvéolaire réellement atteinte.",
          ),
        ],
        "Lina accepte le masque, mais sa respiration devient superficielle après quelques cycles.",
      ),
      qcm(
        "Comment interpréter le rôle du coefficient sang/gaz ?",
        ["b00023", "b00024", "b00088"],
        "La faible solubilité du sévoflurane limite son captage sanguin et rapproche rapidement FA de Fi.",
        [
          T(
            "Le sang constitue un réservoir limité pour cet agent.",
            "Peu de vapeur doit se dissoudre avant la hausse de pression.",
          ),
          T(
            "La pression cérébrale suit assez vite la pression alvéolaire.",
            "Les compartiments s’équilibrent rapidement.",
          ),
          F(
            "Une solubilité élevée expliquerait ce réveil rapide.",
            "La relation entre solubilité et vitesse est inverse.",
          ),
          T(
            "Une modification de concentration produit un effet rapide.",
            "Le faible coefficient rend l’anesthésie maniable.",
          ),
          T(
            "La CAM du sévoflurane, proche de 2 %, mesure sa puissance et non sa vitesse.",
            "Puissance et cinétique reposent sur deux propriétés physiques distinctes.",
          ),
        ],
        "Après deux minutes, la fraction alvéolaire se rapproche rapidement de la fraction inspirée.",
      ),
      qcm(
        "Quels effets respiratoires doivent être anticipés ?",
        ["b00077", "b00078"],
        "Même non irritant, le sévoflurane appartient aux halogénés dépresseurs de la ventilation et de la réponse hypoxique.",
        [
          T(
            "Une diminution du volume courant.",
            "La dépression ventilatoire apparaît avec la profondeur.",
          ),
          T(
            "Une réponse au CO2 atténuée.",
            "La commande centrale devient moins sensible.",
          ),
          F(
            "Une dépression ventilatoire moindre que sous protoxyde d’azote.",
            "Le protoxyde déprime peu la ventilation, bien moins que les halogénés.",
          ),
          F(
            "Une réponse hypoxique préservée à faible dose.",
            "Elle est très diminuée dès environ 0,1 CAM.",
          ),
          T(
            "Une accélération de la fréquence respiratoire.",
            "Les halogénés augmentent la fréquence tout en réduisant l’amplitude.",
          ),
        ],
        "À 1 CAM, Lina respire plus vite mais avec un volume courant réduit.",
      ),
      qcm(
        "Quels facteurs pourraient diminuer la concentration requise ?",
        ["b00057"],
        "Seule une hypotension profonde abaisse ici la concentration requise, alors que natrémie élevée, jeune âge, hyperthermie et stimulants la relèvent.",
        [
          F(
            "Une hypernatrémie associée.",
            "Une natrémie élevée déplace la CAM vers le haut plutôt que vers le bas.",
          ),
          F(
            "Un jeune âge chez le nourrisson.",
            "Le nourrisson exige une concentration alvéolaire supérieure à celle de l’adulte.",
          ),
          T(
            "Une hypotension profonde.",
            "La faible perfusion réduit les besoins anesthésiques.",
          ),
          F(
            "Une hyperthermie.",
            "L’hyperthermie augmente au contraire les besoins et la valeur de CAM.",
          ),
          F(
            "Une consommation chronique de stimulants.",
            "Une stimulation centrale chronique tend à accroître les besoins en halogéné.",
          ),
        ],
        "Une dose de morphinique est administrée et la température chute à 35,2 °C.",
      ),
      qcm(
        "Quelles données rassurent sur le risque rénal ?",
        ["b00091", "b00092", "b00093"],
        "Le métabolisme du sévoflurane est faible, le fluorure est transitoire et le composé A n’impose plus les anciennes restrictions.",
        [
          T(
            "Seuls environ 3 % sont métabolisés.",
            "L’expiration élimine la majorité de l’agent.",
          ),
          F(
            "Le fluorure sérique dépasse habituellement 200 mmol/L après sévoflurane.",
            "Les valeurs rapportées atteignent au plus 50 mmol/L, seuil de toxicité du méthoxyflurane.",
          ),
          F(
            "Toute utilisation en circuit fermé provoque une nécrose tubulaire.",
            "Cette toxicité historique n’est pas retenue en clinique actuelle.",
          ),
          T(
            "Aucune restriction actuelle de débit n’est imposée pour le composé A.",
            "Les données ont levé la contrainte ancienne.",
          ),
          F(
            "Une créatinine normale interdit toute surveillance clinique.",
            "La fonction rénale reste intégrée au suivi périopératoire global.",
          ),
        ],
        "La mère demande si le sévoflurane peut léser les reins de sa fille.",
      ),
      qcm(
        "Quels éléments favorisent un réveil rapide ?",
        ["b00035", "b00037", "b00043", "b00088"],
        "L’arrêt de l’agent, une ventilation efficace et sa faible solubilité accélèrent l’élimination pulmonaire.",
        [
          F(
            "Maintenir 0,5 CAM jusqu’au transfert en salle de réveil.",
            "Poursuivre l’apport entretient la pression alvéolaire et retarde le réveil.",
          ),
          T(
            "Ventiler efficacement Lina jusqu’à disparition de la vapeur expirée.",
            "Le renouvellement alvéolaire expulse le sévoflurane encore présent.",
          ),
          F(
            "Compter sur la solubilité élevée du sévoflurane pour vider les tissus.",
            "Le sévoflurane se caractérise par une faible solubilité, gage d’un lavage rapide.",
          ),
          F(
            "Compter sur une élimination hépatique majoritaire.",
            "La voie pulmonaire domine largement.",
          ),
          F(
            "Ajouter du N2O pendant tout le réveil.",
            "Cela maintiendrait une charge anesthésique et nécessiterait ensuite de l’oxygène.",
          ),
        ],
        "L’intervention dure trente minutes et l’équipe prépare l’extubation.",
      ),
    ],
  },
  {
    title: "Bas débit cardiaque et montée rapide",
    vignette:
      "M. Robert, patient de 72 ans avec cardiomyopathie dilatée et fraction d’éjection à 25 %, est opéré en urgence d’une fracture du fémur. Après induction intraveineuse, l’anesthésie est entretenue par sévoflurane. Son débit cardiaque baisse pendant un épisode hémorragique, alors que le vaporisateur reste réglé sur la même concentration inspirée.",
    questions: [
      qcm(
        "Quels paramètres influencent immédiatement la pression cérébrale ?",
        ["b00012", "b00013", "b00022"],
        "La pression cérébrale suit la pression alvéolaire, elle-même modulée par apport ventilatoire et captage sanguin.",
        [
          F(
            "La quantité d’agent métabolisée par le foie.",
            "La biotransformation reste marginale devant les échanges alvéolaires.",
          ),
          T(
            "La ventilation alvéolaire.",
            "Elle détermine le renouvellement du gaz.",
          ),
          T(
            "Le débit cardiaque.",
            "Il règle la quantité prélevée par le sang.",
          ),
          T(
            "La solubilité sang/gaz.",
            "Elle définit la taille du réservoir sanguin.",
          ),
          T(
            "La pression partielle atteinte dans l’alvéole.",
            "Le cerveau s’aligne sur la valeur régnant dans le compartiment alvéolaire.",
          ),
        ],
      ),
      qcm(
        "Quel effet la chute du débit aura-t-elle sur FA ?",
        ["b00038", "b00039"],
        "Un débit cardiaque bas retire moins de vapeur des alvéoles, de sorte que FA augmente rapidement.",
        [
          F(
            "Le vaporisateur doit être réglé plus haut pour compenser le bas débit.",
            "Un débit effondré fait déjà monter la fraction alvéolaire à réglage constant.",
          ),
          F(
            "Une concentration expirée croissante signale une fuite du circuit.",
            "La hausse expirée traduit ici un captage sanguin réduit par le bas débit.",
          ),
          F(
            "L’induction devient nécessairement plus lente.",
            "Le bas débit accélère plutôt l’équilibre alvéolaire.",
          ),
          T(
            "Une surveillance rapprochée de la concentration expirée est nécessaire.",
            "Elle objective le changement de pression alvéolaire.",
          ),
          F(
            "Le choc empêche tout effet des halogénés.",
            "Il peut au contraire favoriser un surdosage relatif.",
          ),
        ],
        "Le débit cardiaque estimé chute à 2 L/min et la concentration expirée augmente.",
      ),
      qcm(
        "Quels signes peuvent traduire une profondeur excessive ?",
        ["b00077", "b00079", "b00090"],
        "Une concentration trop élevée majore dépression ventilatoire et vasodilatation, aggravant l’instabilité.",
        [
          F(
            "Une bradycardie sinusale marquée typique du sévoflurane.",
            "L’effet chronotrope négatif marqué caractérise l’halothane, non le sévoflurane.",
          ),
          T(
            "Une dépression ventilatoire.",
            "Les halogénés réduisent le volume courant et la réponse au CO2.",
          ),
          F(
            "Une hyperréactivité motrice constante.",
            "Une profondeur accrue supprime plutôt le mouvement.",
          ),
          T(
            "Une moindre réponse à l’hypoxie.",
            "Cette réponse est très sensible aux halogénés.",
          ),
          F(
            "Une hausse obligatoire du débit cardiaque.",
            "L’effet circulatoire tend au contraire vers la dépression.",
          ),
        ],
        "La pression chute à 72/40 mmHg et la ventilation spontanée devient insuffisante.",
      ),
      qcm(
        "Quelles adaptations sont cohérentes ?",
        ["b00013", "b00039", "b00057"],
        "La concentration doit être réduite et titrée au contexte de bas débit et d’hypotension.",
        [
          T(
            "Diminuer la fraction inspirée de sévoflurane.",
            "Le besoin diminue lorsque la pression cérébrale monte rapidement.",
          ),
          T(
            "Traiter la cause hémorragique.",
            "Restaurer perfusion et débit corrige le mécanisme.",
          ),
          T(
            "Réévaluer la CAM effective.",
            "L’hypotension profonde diminue les besoins.",
          ),
          T(
            "Compenser la volémie avant d’approfondir l’anesthésie.",
            "Le remplissage restaure la perfusion avant toute majoration de la vapeur.",
          ),
          T(
            "Retenir qu’un bas débit cardiaque majore la pression alvéolaire à réglage constant.",
            "Moins de sang traverse le poumon, donc moins de vapeur quitte l’alvéole.",
          ),
        ],
        "L’hémoglobine chute et une hémorragie du foyer opératoire est confirmée.",
      ),
      qcm(
        "Comment une transfusion et le contrôle du saignement modifient-ils la cinétique ?",
        ["b00039", "b00041"],
        "La restauration du débit augmente le captage sanguin et peut ralentir la montée alvéolaire, sans justifier une hausse automatique.",
        [
          F(
            "La restauration du débit fait monter plus vite la fraction alvéolaire.",
            "Un débit rétabli prélève davantage de vapeur et freine la montée alvéolaire.",
          ),
          T(
            "FA peut diminuer transitoirement à réglage constant.",
            "Le sang prélève plus de vapeur après restauration.",
          ),
          F(
            "Le gradient alvéolo-veineux devient toujours nul immédiatement.",
            "Les tissus nécessitent du temps pour se rééquilibrer.",
          ),
          F(
            "Le retour à la normovolémie annule l’effet de la solubilité sanguine.",
            "Le coefficient sang/gaz reste un déterminant permanent de la cinétique.",
          ),
          F(
            "Le vaporisateur doit être doublé systématiquement.",
            "L’ajustement dépend du niveau clinique, pas d’une règle fixe.",
          ),
        ],
        "Après transfusion, le débit cardiaque remonte et la pression se stabilise.",
      ),
      qcm(
        "Quels éléments favorisent ensuite l’élimination ?",
        ["b00035", "b00043"],
        "L’arrêt de l’apport et une ventilation adéquate permettent un wash-out rapide du sévoflurane peu soluble.",
        [
          T(
            "Une ventilation minute suffisante.",
            "Elle chasse la vapeur des alvéoles.",
          ),
          T(
            "Une faible solubilité de l’agent.",
            "Le réservoir tissulaire est limité.",
          ),
          T(
            "Une circulation rétablie vers les poumons.",
            "Elle ramène l’agent dissous pour expiration.",
          ),
          T(
            "Une voie pulmonaire qui assure l’essentiel de l’excrétion.",
            "Seuls 3 % environ du sévoflurane subissent une biotransformation hépatique.",
          ),
          T(
            "Un arrêt effectif de l’apport au vaporisateur.",
            "Couper la délivrance inverse le gradient entre alvéole et sang.",
          ),
        ],
        "La chirurgie s’achève après stabilisation hémodynamique.",
      ),
      qcm(
        "Quelles informations transmettre en SSPI ?",
        ["b00013", "b00039", "b00077", "b00091"],
        "Le relais insiste sur le besoin de ventilation assistée et sur la surveillance résiduelle, sans se fier au faible métabolisme de l’agent.",
        [
          F(
            "Le sévoflurane s’élimine par le rein, ce qui impose un contrôle de la diurèse.",
            "L’excrétion du sévoflurane est pulmonaire et non urinaire.",
          ),
          F(
            "Une hépatite immune est à redouter dans les quatre semaines.",
            "Ce risque de réexposition concerne l’halothane et non le sévoflurane.",
          ),
          T(
            "Le besoin de ventilation assistée.",
            "La dépression respiratoire peut persister au réveil.",
          ),
          T(
            "Le faible métabolisme du sévoflurane ne dispense pas de surveillance.",
            "La pharmacocinétique rapide n’annule pas les effets physiologiques.",
          ),
          F(
            "L’hémorragie peut être omise après transfusion.",
            "Elle reste un risque de récidive et d’instabilité.",
          ),
        ],
        "M. Robert rejoint la SSPI encore somnolent mais ventilé.",
      ),
    ],
  },
  {
    title: "N2O et occlusion intestinale",
    vignette:
      "Mme Lopez, patiente de 64 ans, est admise pour laparotomie urgente devant une occlusion intestinale avec anses très distendues. Elle n’a pas de pneumothorax connu mais présente des vomissements et un risque d’inhalation. Un mélange contenant du protoxyde d’azote est proposé pour diminuer la concentration d’halogéné.",
    questions: [
      qcm(
        "Quels bénéfices théoriques apporterait le N2O ?",
        ["b00059", "b00060", "b00061"],
        "La rapidité d’installation est le seul bénéfice listé, car le protoxyde élève le débit cérébral et expose à l’hypoxie de diffusion.",
        [
          F(
            "Une protection contre l’hypoxie de diffusion au réveil.",
            "Le retour du protoxyde vers l’alvéole provoque justement cette hypoxie.",
          ),
          F(
            "Une réduction du débit sanguin cérébral utile en neurochirurgie.",
            "Le protoxyde élève le débit cérébral d’environ dix pour cent.",
          ),
          T(
            "Une montée alvéolaire rapide.",
            "Sa faible solubilité produit un captage initial important.",
          ),
          F(
            "Une anesthésie complète à 50 % sans autre agent.",
            "Sa CAM de 104 % interdit une puissance suffisante.",
          ),
          F(
            "Une décompression des anses intestinales.",
            "Il diffuse dans les cavités et risque de les distendre.",
          ),
        ],
      ),
      qcm(
        "Pourquoi le N2O doit-il être évité ici ?",
        ["b00065"],
        "Le gaz entre rapidement dans les anses occluses et augmente leur volume et leur pression.",
        [
          T(
            "L’occlusion crée des espaces aériens clos.",
            "L’azote y sort beaucoup plus lentement que le N2O n’y entre.",
          ),
          T(
            "La distension peut gêner la chirurgie.",
            "Le volume intestinal augmente au cours de l’exposition.",
          ),
          T(
            "La pression intraluminale peut s’accroître.",
            "L’équilibration gazeuse se fait au prix d’une expansion.",
          ),
          T(
            "L’azote quitte l’anse trente fois moins vite que le N2O n’y pénètre.",
            "Ce rapport de diffusion explique l’expansion progressive du volume.",
          ),
          T(
            "Le risque persiste tant que le protoxyde est administré.",
            "Le volume continue de croître tant que le gaz est délivré.",
          ),
        ],
        "Le chirurgien confirme des anses fermées en amont d’un obstacle complet.",
      ),
      qcm(
        "Quelles autres situations reposent sur le même mécanisme ?",
        ["b00065"],
        "Toute cavité aérienne non communicante peut augmenter de volume sous N2O.",
        [
          T(
            "Un pneumothorax.",
            "La collection pleurale gazeuse peut s’agrandir.",
          ),
          T(
            "Une embolie gazeuse.",
            "Les bulles intravasculaires peuvent augmenter.",
          ),
          T(
            "Une pneumoencéphalie.",
            "L’air intracrânien constitue une cavité fermée.",
          ),
          T(
            "Une chirurgie tympanique où la pression de l’oreille moyenne doit rester stable.",
            "L’expansion du gaz dans l’oreille moyenne perturberait directement ce geste.",
          ),
          T(
            "Une bulle d’emphysème sans communication bronchique.",
            "Une cavité aérienne fermée obéit à la même règle d’expansion.",
          ),
        ],
        "L’anesthésiste recherche des contre-indications associées avant de modifier le plan.",
      ),
      qcm(
        "Comment maintenir une profondeur suffisante sans N2O ?",
        ["b00051", "b00055", "b00088"],
        "Le sévoflurane peut être titré selon sa fraction de CAM et associé à des agents intraveineux.",
        [
          T(
            "Utiliser la concentration expirée comme repère.",
            "La concentration expirée reflète la pression alvéolaire utile à la titration.",
          ),
          T(
            "Additionner les effets des opioïdes et hypnotiques.",
            "Ces coagents diminuent la fraction de CAM de sévoflurane requise.",
          ),
          T(
            "Adapter la cible à l’âge et à l’hémodynamique.",
            "La CAM individuelle varie avec le terrain.",
          ),
          F(
            "Rechercher automatiquement 2 CAM de sévoflurane.",
            "Une telle cible n’est ni nécessaire ni individualisée.",
          ),
          T(
            "Prévoir l’effet vasodilatateur du sévoflurane sur la pression artérielle.",
            "La baisse des résistances périphériques accompagne l’approfondissement.",
          ),
        ],
        "Le N2O est supprimé et l’entretien se poursuit au sévoflurane avec opioïde.",
      ),
      qcm(
        "Quel phénomène surviendrait si du N2O avait été utilisé puis arrêté ?",
        ["b00062"],
        "Le retour massif du N2O vers les alvéoles diluerait transitoirement l’oxygène.",
        [
          F(
            "Une accumulation de N2O dans le sang après l’arrêt.",
            "Le gaz quitte le sang vers l’alvéole dès l’interruption de l’apport.",
          ),
          T(
            "Un besoin d’oxygène pendant 5 à 10 minutes.",
            "La supplémentation couvre la phase à risque.",
          ),
          T(
            "Une surveillance de la SpO2 au réveil.",
            "Elle détecte une désaturation transitoire.",
          ),
          T(
            "Une dilution transitoire de l’oxygène alvéolaire.",
            "Le flux sortant de protoxyde abaisse la fraction alvéolaire d’oxygène.",
          ),
          F(
            "Une élimination rénale rapide du N2O.",
            "Le protoxyde d’azote est exhalé par les poumons et non filtré par les reins.",
          ),
        ],
        "L’équipe discute des précautions qui auraient été nécessaires après une exposition.",
      ),
      qcm(
        "Quels effets du N2O peuvent aussi être défavorables ?",
        ["b00063", "b00064"],
        "Sa faible dépression respiratoire n’exclut ni effet inotrope négatif ni hausse du débit cérébral.",
        [
          F(
            "Une vasodilatation périphérique majeure abaissant les résistances.",
            "L’effet circulatoire du protoxyde porte sur la contractilité, pas sur les résistances.",
          ),
          F(
            "Une abolition de la réponse ventilatoire au CO2.",
            "Le protoxyde déprime seulement de façon légère la ventilation alvéolaire.",
          ),
          T(
            "Une hausse du débit sanguin cérébral.",
            "L’augmentation du débit sanguin cérébral avoisine dix pour cent.",
          ),
          F(
            "Une forte bronchodilatation utilisée comme traitement principal.",
            "Cet effet est attribué aux halogénés, pas comme propriété majeure du N2O.",
          ),
          F(
            "Une absence totale d’effet cardiovasculaire.",
            "Une action myocardique directe est décrite.",
          ),
        ],
        "Mme Lopez développe une hypotension qui impose de réévaluer tous les agents dépresseurs.",
      ),
      qcm(
        "Quel argument environnemental renforce la décision ?",
        ["b00102"],
        "Le N2O est un gaz à effet de serre et ne doit pas être utilisé sans bénéfice clinique clair.",
        [
          F(
            "Son empreinte est comparable à celle du propofol.",
            "Le propofol pèse environ quatre fois moins que les agents anesthésiques.",
          ),
          F(
            "Seul le dioxyde de carbone expiré compte dans le bilan du bloc.",
            "Les gaz anesthésiques halogénés et le protoxyde contribuent aussi au réchauffement.",
          ),
          F(
            "Son impact est nul car il n’est pas métabolisé.",
            "L’absence de métabolisme favorise justement son rejet atmosphérique.",
          ),
          T(
            "Une technique sans N2O réduit les émissions.",
            "Moins de gaz est relâché dans le système d’évacuation.",
          ),
          F(
            "L’environnement justifie de sacrifier l’oxygénation.",
            "La sécurité clinique reste toujours prioritaire.",
          ),
        ],
        "L’hôpital suit une politique de réduction des gaz à fort effet de serre.",
      ),
    ],
  },
  {
    title: "Monoxyde de carbone au réveil",
    vignette:
      "M. Chen, patient de 48 ans sans antécédent respiratoire, est anesthésié au desflurane pour une chirurgie abdominale de trois heures. La machine est restée inutilisée pendant le week-end avec un débit de gaz frais continu, pouvant avoir desséché l’absorbeur de CO2. Au réveil, il présente céphalées, tachycardie et une saturation affichée à 99 %.",
    questions: [
      qcm(
        "Quels éléments rendent une intoxication au CO plausible ?",
        ["b00084", "b00086"],
        "Le desflurane et un absorbeur desséché constituent l’association la plus favorable à la production de CO.",
        [
          T(
            "L’utilisation prolongée de desflurane.",
            "Cet agent produit le plus de CO dans la hiérarchie fournie.",
          ),
          F(
            "Un absorbeur remplacé le matin même et bien hydraté.",
            "Une chaux fraîchement hydratée limite fortement la dégradation en monoxyde.",
          ),
          T(
            "Une température élevée du canister.",
            "Une température élevée accélère la dégradation chimique dans l’absorbeur.",
          ),
          T(
            "Une oxymétrie de pouls rassurante malgré des symptômes neurologiques.",
            "La carboxyhémoglobine est lue comme de l’oxyhémoglobine par la sonde.",
          ),
          T(
            "Un circuit fermé utilisé pendant plusieurs heures.",
            "Le contact prolongé entre vapeur et absorbeur favorise la formation du toxique.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs du circuit faut-il vérifier ?",
        ["b00086"],
        "Agent, concentration, sécheresse, composition et température de l’absorbeur déterminent la production.",
        [
          T(
            "Le type de matériau absorbant.",
            "Le baralyme est plus favorable que la chaux sodée.",
          ),
          T(
            "La date et les conditions de remplacement.",
            "Une cartouche ancienne peut être desséchée.",
          ),
          T(
            "La température du canister.",
            "Une chaleur anormale suggère une réaction importante.",
          ),
          T(
            "Le débit laissé pendant l’inactivité.",
            "Un gaz sec continu peut déshydrater l’absorbeur.",
          ),
          T(
            "L’agent halogéné employé sur cette machine.",
            "Le desflurane dégrade davantage que l’isoflurane, l’halothane ou le sévoflurane.",
          ),
        ],
        "Le canister est chaud et la cartouche n’a pas été remplacée après l’inactivité.",
      ),
      qcm(
        "Quelles actions immédiates sont pertinentes ?",
        ["b00043", "b00086"],
        "Il faut interrompre l’exposition, oxygéner le patient et retirer du service le circuit suspect.",
        [
          T(
            "Arrêter le desflurane.",
            "La source de dégradation doit être supprimée.",
          ),
          T(
            "Administrer une forte concentration d’oxygène.",
            "Elle accélère l’élimination du CO fixé à l’hémoglobine.",
          ),
          T(
            "Remplacer l’absorbeur et contrôler la machine.",
            "La cause matérielle doit être corrigée avant réutilisation.",
          ),
          T(
            "Vérifier la carboxyhémoglobine par co-oxymétrie.",
            "Seul ce dosage établit la part d’hémoglobine liée au monoxyde.",
          ),
          T(
            "Poursuivre l’oxygénation jusqu’à normalisation de la carboxyhémoglobine.",
            "La demi-vie du monoxyde raccourcit tant que la FiO2 reste élevée.",
          ),
        ],
        "Les symptômes persistent malgré l’arrêt de la chirurgie.",
      ),
      qcm(
        "Quel prélèvement confirme l’exposition ?",
        ["b00086"],
        "Une co-oxymétrie mesure directement la carboxyhémoglobine, contrairement à l’oxymétrie pulsée.",
        [
          T(
            "Un gaz du sang avec co-oxymétrie.",
            "Il distingue les différentes formes d’hémoglobine.",
          ),
          F(
            "Une mesure de la SpO2 au doigt suffit au diagnostic.",
            "L’oxymètre de pouls confond carboxyhémoglobine et oxyhémoglobine.",
          ),
          F(
            "Une seule mesure de PaO2 normale.",
            "L’oxygène dissous peut être normal malgré le CO lié.",
          ),
          F(
            "Une créatinine comme test spécifique.",
            "Elle ne mesure pas l’intoxication au CO.",
          ),
          T(
            "Un ECG si tachycardie ou douleur.",
            "Le myocarde peut souffrir d’hypoxie tissulaire.",
          ),
        ],
        "La SpO2 reste à 99 %, mais le patient devient confus.",
      ),
      qcm(
        "Pourquoi le desflurane avait-il été choisi ?",
        ["b00084"],
        "Sa faible solubilité permet un ajustement rapide de la profondeur et un réveil prévisible après une chirurgie longue.",
        [
          T(
            "Son coefficient sang/gaz est faible.",
            "Le compartiment sanguin accumule peu de vapeur.",
          ),
          F(
            "Sa forte solubilité tissulaire garantit une profondeur stable.",
            "Le desflurane se distingue justement par un très faible captage tissulaire.",
          ),
          F(
            "Sa CAM de 0,77 % témoigne d’une grande puissance.",
            "La CAM du desflurane est proche de six pour cent, et non de 0,77 %.",
          ),
          T(
            "Son métabolisme est extrêmement faible.",
            "Environ 0,02 % subit une biotransformation.",
          ),
          T(
            "Son administration exige un dispositif chauffé sous pression.",
            "Un point d’ébullition de 23,5 °C impose cette technologie particulière.",
          ),
        ],
        "Après stabilisation, l’équipe analyse le choix anesthésique initial.",
      ),
      qcm(
        "Quelles limites propres au desflurane doivent être rappelées ?",
        ["b00085"],
        "L’irritation et la stimulation sympathique lors d’une hausse rapide limitent son emploi malgré sa cinétique.",
        [
          T(
            "Il est inadapté à une induction inhalée.",
            "L’odeur âcre favorise toux et laryngospasme.",
          ),
          F(
            "Une hausse brusque provoque une chute des résistances vasculaires immédiate.",
            "L’élévation rapide déclenche une poussée tensionnelle par voie sympathique.",
          ),
          F(
            "Son métabolisme atteint 3 % et impose une surveillance rénale.",
            "Le desflurane est le moins métabolisé des halogénés, à 0,02 % environ.",
          ),
          F(
            "Il supprime toujours le réflexe laryngé sans irritation.",
            "Il peut au contraire déclencher un spasme.",
          ),
          F(
            "Il diminue exclusivement le débit sans vasodilatation.",
            "Son hypotension repose surtout sur la baisse des résistances.",
          ),
        ],
        "Le patient avait toussé lors d’une hausse rapide de la concentration en début d’intervention.",
      ),
      qcm(
        "Quelles mesures préviennent une récidive ?",
        ["b00086", "b00102"],
        "Une gestion rigoureuse de l’absorbeur et un choix raisonné du desflurane réduisent risques toxique et climatique.",
        [
          T(
            "Remplacer les absorbants desséchés avant usage.",
            "Une chaux correctement hydratée produit moins de CO.",
          ),
          T(
            "Fermer les débits inutiles pendant l’inactivité.",
            "Cela évite la déshydratation prolongée.",
          ),
          T(
            "Réserver le desflurane aux bénéfices cliniques établis.",
            "Son impact environnemental est très élevé.",
          ),
          T(
            "Tracer l’incident technique.",
            "La maintenance et les équipes doivent prévenir une nouvelle exposition.",
          ),
          F(
            "Conserver la cartouche suspecte jusqu’à épuisement.",
            "Elle doit être retirée immédiatement.",
          ),
        ],
        "La co-oxymétrie confirme une carboxyhémoglobine élevée et le patient récupère sous oxygène.",
      ),
    ],
  },
];

const DP_QROC = [
  {
    title: "Masque chez une enfant anxieuse",
    vignette:
      "Inès, patiente de 7 ans pesant 24 kg, doit être opérée d’une fracture du poignet. Elle refuse la pose d’une voie veineuse à l’état éveillé, ne présente aucune affection respiratoire et a respecté le jeûne. L’anesthésiste propose une induction au masque avant l’abord veineux.",
    questions: [
      qroc(
        "Quel agent inhalé moderne faut-il privilégier pour l’induction ?",
        "Sévoflurane",
        ["b00076", "b00088"],
        "Sa faible solubilité et sa bonne tolérance des voies aériennes permettent une induction inhalée rapide.",
      ),
      qroc(
        "Quelle propriété sensorielle facilite l’acceptation du masque ?",
        "Odeur agréable|absence d’odeur âcre",
        "b00088",
        "Le sévoflurane n’irrite pas les voies respiratoires supérieures.",
        "Inès accepte de respirer spontanément dans un masque étanche.",
      ),
      qroc(
        "Quel réglage accélère directement la montée alvéolaire ?",
        "Augmenter la concentration inspirée|fraction inspirée élevée",
        ["b00016", "b00017"],
        "Une Fi plus élevée augmente le gradient et raccourcit le délai d’installation.",
        "La perte de conscience tarde alors que la ventilation reste régulière.",
      ),
      qroc(
        "Quel coefficient explique la rapidité du sévoflurane ?",
        "Coefficient sang/gaz de 0,65|0,65",
        ["b00024", "b00088"],
        "La faible solubilité limite le captage sanguin avant l’augmentation de pression cérébrale.",
        "La concentration expirée rejoint rapidement la valeur inspirée.",
      ),
      qroc(
        "Quelle grandeur expirée sert de repère de puissance ?",
        "Fraction de CAM|CAM expirée|concentration alvéolaire minimale",
        ["b00051", "b00055"],
        "La concentration alvéolaire est interprétée comme une fraction de CAM adaptée à l’âge.",
        "Une voie veineuse est posée et un opioïde est administré.",
      ),
      qroc(
        "Comment l’opioïde modifie-t-il le besoin en sévoflurane ?",
        "Il diminue la CAM|il réduit le besoin en sévoflurane",
        "b00057",
        "L’association a un effet d’épargne et impose de retitrer la vapeur.",
        "La pression artérielle baisse légèrement après l’association.",
      ),
      qroc(
        "Quelle voie assure l’essentiel de l’élimination au réveil ?",
        "Voie pulmonaire|expiration",
        ["b00043", "b00091"],
        "Une ventilation efficace élimine rapidement la majeure partie du sévoflurane inchangé.",
        "Le geste se termine et l’administration de vapeur est interrompue.",
      ),
    ],
  },
  {
    title: "Choc hémorragique et fraction alvéolaire",
    vignette:
      "M. Diallo, patient de 58 ans, est anesthésié au sévoflurane pour une chirurgie hépatique. Un saignement brutal entraîne hypotension, diminution du débit cardiaque et baisse du retour veineux. Le vaporisateur conserve initialement le même réglage tandis que la concentration expirée augmente.",
    questions: [
      qroc(
        "Quel compartiment prélève moins d’agent lorsque le débit cardiaque chute ?",
        "Le sang|compartiment sanguin",
        ["b00038", "b00039"],
        "Un flux sanguin plus faible retire moins de vapeur des alvéoles.",
      ),
      qroc(
        "Comment évolue la vitesse de montée de FA ?",
        "Elle augmente|FA monte plus rapidement",
        "b00039",
        "Le captage diminué rapproche rapidement la fraction alvéolaire de la fraction inspirée.",
        "Le débit cardiaque est estimé à 2,2 L/min.",
      ),
      qroc(
        "Quel risque anesthésique résulte d’une FA plus élevée ?",
        "Surdosage relatif|profondeur anesthésique excessive",
        ["b00013", "b00039"],
        "La pression partielle cérébrale suit la hausse alvéolaire malgré un réglage inchangé.",
        "La pression chute à 68/36 mmHg sans mouvement du patient.",
      ),
      qroc(
        "Quelle adaptation immédiate du vaporisateur est logique ?",
        "Diminuer la concentration inspirée|réduire le sévoflurane",
        ["b00013", "b00057"],
        "L’hypotension et la montée rapide de pression réduisent le besoin et imposent une titration à la baisse.",
        "L’équipe traite simultanément l’hémorragie.",
      ),
      qroc(
        "Comment la restauration du débit modifie-t-elle le captage alvéolaire ?",
        "Elle l’augmente|augmentation du captage sanguin",
        "b00039",
        "Un flux sanguin restauré emporte davantage d’agent vers les tissus.",
        "Après transfusion, le débit cardiaque revient à 4,8 L/min.",
      ),
      qroc(
        "Quel gradient diminue à mesure que les tissus s’équilibrent ?",
        "Gradient alvéolo-veineux",
        ["b00040", "b00041"],
        "Les pressions du sang veineux et de l’alvéole se rapprochent progressivement.",
        "L’entretien se prolonge après stabilisation circulatoire.",
      ),
      qroc(
        "Quel facteur ventilatoire accélère le wash-out final ?",
        "Ventilation alvéolaire efficace|augmentation de la ventilation alvéolaire",
        ["b00020", "b00043"],
        "Le renouvellement du gaz alvéolaire augmente l’élimination pulmonaire.",
        "La chirurgie s’achève et la vapeur est arrêtée.",
      ),
    ],
  },
  {
    title: "Pneumothorax méconnu",
    vignette:
      "Mme Renaud, patiente de 44 ans, est opérée en urgence après un traumatisme thoracique. Une anesthésie associant sévoflurane et protoxyde d’azote est envisagée. La radiographie initiale était difficile à interpréter et une petite collection pleurale gazeuse non drainée est finalement suspectée.",
    questions: [
      qroc(
        "Quel agent doit être retiré du mélange ?",
        "Protoxyde d’azote|N2O",
        ["b00065", "b00064"],
        "Le N2O diffuse rapidement dans une cavité pleurale fermée et en augmente le volume.",
      ),
      qroc(
        "Quel rapport de vitesse de diffusion explique l’expansion ?",
        "Le N2O diffuse 30 fois plus vite que l’azote|trente fois plus vite",
        "b00065",
        "L’entrée du N2O dépasse largement la sortie de l’azote contenu dans l’espace.",
        "L’échographie confirme un pneumothorax antérieur non drainé.",
      ),
      qroc(
        "Quel autre espace intracrânien contre-indique le N2O par le même mécanisme ?",
        "Pneumoencéphalie|air intracrânien|air dans la boîte crânienne",
        "b00065",
        "Toute cavité aérienne close peut augmenter de volume et de pression.",
        "L’interne recherche les autres situations à risque avant l’induction.",
      ),
      qroc(
        "Quel bénéfice anesthésique du N2O faut-il remplacer ?",
        "Son effet analgésique et d’épargne en halogéné|analgésie",
        ["b00060", "b00055"],
        "Un opioïde ou une autre composante multimodale peut fournir l’analgésie sans expansion gazeuse.",
        "Le N2O est supprimé et un opioïde est ajouté.",
      ),
      qroc(
        "Pourquoi le N2O ne pourrait-il de toute façon pas être utilisé seul ?",
        "CAM de 104 %|puissance insuffisante",
        "b00060",
        "Une concentration anesthésique complète serait incompatible avec une oxygénation sûre.",
        "La patiente reste immobile sous une association sans N2O.",
      ),
      qroc(
        "Quel effet cérébral du N2O peut aussi être indésirable ?",
        "Augmentation du débit sanguin cérébral d’environ 10 %|hausse du débit cérébral",
        "b00064",
        "Cette propriété limite son utilisation en hypertension intracrânienne sévère.",
        "Un traumatisme crânien associé est finalement exclu.",
      ),
      qroc(
        "Quel gain environnemental accompagne son éviction ?",
        "Réduction de l’empreinte climatique|diminution des gaz à effet de serre",
        "b00102",
        "Le N2O augmente significativement l’empreinte de l’anesthésie.",
        "La prise en charge se poursuit sans aggravation du pneumothorax.",
      ),
    ],
  },
  {
    title: "Stimulation sympathique au desflurane",
    vignette:
      "M. Armand, patient de 52 ans hypertendu bien contrôlé, est anesthésié pour une colectomie. Le desflurane a été choisi pour sa cinétique rapide après une induction intraveineuse. Au moment d’une stimulation chirurgicale, la concentration inspirée est augmentée brutalement.",
    questions: [
      qroc(
        "Quelle caractéristique cinétique motive le choix du desflurane ?",
        "Faible coefficient sang/gaz|faible solubilité sanguine",
        "b00084",
        "Son petit réservoir sanguin permet un changement rapide de profondeur et un réveil bref.",
      ),
      qroc(
        "Quel couple hémodynamique peut suivre l’augmentation brutale ?",
        "Tachycardie et hypertension artérielle",
        ["b00085", "b00077"],
        "La hausse rapide stimule le système nerveux autonome sympathique.",
        "La fréquence passe à 125/min et la pression à 190/105 mmHg.",
      ),
      qroc(
        "Quel mode d’augmentation aurait limité cette réponse ?",
        "Augmentation progressive|titration progressive",
        ["b00085", "b00084"],
        "Une variation graduelle évite le pic de stimulation sympathique lié à la hausse brusque.",
        "L’équipe réduit la concentration puis traite la stimulation nociceptive.",
      ),
      qroc(
        "Pourquoi cet agent ne devait-il pas servir à l’induction au masque ?",
        "Risque de laryngospasme lié à son odeur âcre|irritation des voies aériennes",
        ["b00085", "b00043"],
        "Le desflurane irrite les voies aériennes du patient éveillé.",
        "L’anesthésiste rappelle que l’induction avait été intraveineuse.",
      ),
      qroc(
        "Quel type de vaporisateur est nécessaire ?",
        "Vaporisateur chauffé et pressurisé",
        "b00084",
        "Le point d’ébullition bas et la pression de vapeur élevée exigent ce dispositif.",
        "Un contrôle technique de la machine est effectué.",
      ),
      qroc(
        "Quelle part du desflurane est approximativement métabolisée ?",
        "0,02 %|0.02 %",
        "b00085",
        "Il s’agit du halogéné le moins métabolisé parmi les agents d’inhalation.",
        "L’intervention se prolonge sans nouvel épisode hémodynamique.",
      ),
      qroc(
        "Quel argument environnemental doit être discuté avant un prochain cas comparable ?",
        "Empreinte environ vingt fois celle du sévoflurane|forte empreinte du desflurane",
        "b00102",
        "L’absence d’indication précise doit conduire à envisager une option moins émettrice.",
        "M. Armand se réveille rapidement et le choix de l’agent est revu en réunion.",
      ),
    ],
  },
];
