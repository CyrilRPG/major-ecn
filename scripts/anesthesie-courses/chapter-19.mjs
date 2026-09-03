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

const IMAGES = {
  altemeier: image(
    "img/img_001.png",
    "Classes de contamination et risque infectieux opératoire",
    "TABLEAU 19.1 Classification de Polk-Altemeier",
  ),
  germs: image(
    "img/img_002.png",
    "Micro-organismes retrouvés dans les infections du site opératoire",
    "FIGURE 19.1 Répartition des germes trouvés dans les infections du site opératoire",
    { cropBottomMm: 7 },
  ),
  specialties: image(
    "img/img_003.png",
    "Profil microbiologique des infections selon la spécialité",
    "FIGURE 19.2 Répartition des germes trouvés dans les infections du site opératoire selon la spécialité chirurgicale",
    { cropBottomMm: 8 },
  ),
  kinetics: image(
    "img/img_004.png",
    "Doses, demi-vies et rythmes usuels de réinjection",
    "TABLEAU 19.3 Propriétés pharmacocinétiques des principaux antibiotiques utilisés en prophylaxie",
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Décider une prophylaxie sans la confondre avec un traitement",
      sections: [
        {
          title: "Inscrire l’antibioprophylaxie dans une prévention globale",
          rows: [
            row(
              "Objectif limité",
              [
                {
                  text: "L’antibioprophylaxie prévient une infection du site opératoire sans prétendre stériliser le patient.",
                  children: [
                    "Cible : inoculum commensal introduit pendant le geste",
                    "Résultat attendu : empêcher sa multiplication locale",
                  ],
                },
                "Elle n’est ni le traitement d’une infection déjà présente ni un substitut à l’asepsie.",
              ],
              ["b00005", "b00006", "b00015"],
            ),
            row(
              "Fenêtre de protection",
              [
                "La concentration tissulaire doit dépasser la concentration inhibitrice dès l’incision.",
                "Cette protection doit persister jusqu’à la fermeture cutanée, lorsque cesse l’exposition opératoire.",
              ],
              ["b00006", "b00025", "b00026"],
            ),
            row(
              "Mesures associées",
              [
                {
                  text: "La prévention dépend d’un faisceau de mesures périopératoires complémentaires.",
                  children: [
                    "Préparation cutanée, hygiène des mains et maîtrise de l’environnement",
                    "Contrôle glycémique et maintien de la normothermie",
                  ],
                },
                "Une prescription correcte ne compense jamais une rupture d’asepsie.",
              ],
              "b00006",
            ),
            row(
              "Enjeu collectif",
              [
                "Cette indication représente près d’un tiers des antibiotiques utilisés à l’hôpital.",
                "Son encadrement protège à la fois le patient opéré et l’écologie bactérienne du service.",
              ],
              ["b00007", "b00023", "b00054", "b00056", "b00057"],
            ),
          ],
        },
        {
          title: "Classer le geste avant de prescrire",
          rows: [
            row(
              "Chirurgie propre",
              [
                "Une chirurgie propre expose spontanément à un faible risque infectieux.",
                "Une prophylaxie reste justifiée si une infection rare aurait une morbidité majeure, notamment avec matériel.",
              ],
              "b00007",
            ),
            row(
              "Propre-contaminée",
              [
                {
                  text: "L’ouverture contrôlée d’un appareil colonisé définit la chirurgie propre-contaminée.",
                  children: [
                    "Risque spontané généralement supérieur au seuil de 5 %",
                    "Indication habituelle d’une prophylaxie adaptée à la flore exposée",
                  ],
                },
              ],
              "b00007",
              IMAGES.altemeier,
            ),
            row(
              "Contaminée ou sale",
              [
                "Une contamination importante, une infection ou une perforation fait basculer vers une antibiothérapie curative.",
                "Prolonger une prophylaxie ne transforme pas une stratégie préventive en traitement adapté.",
              ],
              "b00007",
            ),
            row(
              "Risque NNISS",
              [
                {
                  text: "Le score NNISS combine trois dimensions du risque opératoire.",
                  children: [
                    "État général résumé par la classe ASA",
                    "Classe de contamination et durée prévisible du geste",
                  ],
                },
                "Il éclaire le risque mais ne remplace ni le protocole actualisé ni l’analyse du geste.",
              ],
              ["b00007", "b00010"],
            ),
          ],
        },
        {
          title: "Cibler la flore réellement exposée",
          rows: [
            row(
              "Peau et tissus",
              [
                {
                  text: "Une incision cutanée expose surtout aux bactéries à Gram positif commensales.",
                  children: [
                    "Staphylocoques à coagulase négative et corynébactéries",
                    "Staphylocoque doré en cas de colonisation transitoire",
                  ],
                },
              ],
              "b00012",
            ),
            row(
              "Aérodigestif supérieur",
              [
                "La flore oropharyngée associe staphylocoques, streptocoques, pneumocoque, Haemophilus et anaérobies buccaux.",
                "L’arbre respiratoire inférieur reste normalement stérile hors pathologie respiratoire chronique.",
              ],
              "b00012",
            ),
            row(
              "Tube digestif",
              [
                {
                  text: "La densité et le rapport aérobies-anaérobies changent le long du tube digestif.",
                  children: [
                    "Estomac et grêle : aérobies et entérobactéries plus représentés",
                    "Côlon et rectum : prédominance des bactéries anaérobies",
                  ],
                },
              ],
              "b00013",
            ),
            row(
              "Flore et procédure",
              [
                "Staphylocoques et entérobactéries dominent globalement, mais leur poids varie selon la spécialité.",
                "Le choix doit intégrer l’anatomie, le geste, le portage du patient et l’écologie locale.",
              ],
              ["b00014", "b00015", "b00016", "b00017", "b00019", "b00022"],
              IMAGES.germs,
            ),
          ],
        },
      ],
    },
    {
      title: "Choisir une molécule sobre et administrer au bon moment",
      sections: [
        {
          title: "Construire le choix antibiotique préopératoire",
          rows: [
            row(
              "Spectre utile",
              [
                {
                  text: "La molécule doit couvrir les bactéries attendues avec le spectre le plus étroit possible.",
                  children: [
                    "Activité cohérente avec la flore du site opératoire",
                    "Faible toxicité, coût maîtrisé et faible pression de sélection",
                  ],
                },
              ],
              ["b00022", "b00023"],
            ),
            row(
              "Molécules privilégiées",
              [
                "Les céphalosporines de première ou deuxième génération occupent une place centrale selon la flore visée.",
                "La rifampicine et les fluoroquinolones sont écartées de la prophylaxie systémique en raison du risque de résistance.",
              ],
              ["b00023", "b00024"],
            ),
            row(
              "Évaluation anticipée",
              [
                "La consultation préopératoire confronte intervention prévue, écologie locale, portages et fonction du patient.",
                "Elle permet de choisir une alternative argumentée avant l’arrivée au bloc.",
              ],
              "b00024",
            ),
            row(
              "Allergie documentée",
              [
                {
                  text: "Une étiquette d’allergie doit être reconstruite avant d’exclure une bêta-lactamine.",
                  children: [
                    "Décrire délai, symptômes, durée et traitements de la réaction",
                    "Distinguer effet indésirable, réaction virale et hypersensibilité IgE",
                  ],
                },
                "La réactivité croisée dépend surtout des chaînes latérales et paraît inférieure à 1 % dans les données récentes citées.",
              ],
              "b00024",
            ),
          ],
        },
        {
          title: "Garantir une concentration efficace avant l’incision",
          rows: [
            row(
              "Voie de référence",
              [
                "La voie intraveineuse garantit habituellement l’exposition rapide et prévisible recherchée.",
                "Les stratégies orale ou intracamérulaire concernent des situations ophtalmologiques précises.",
              ],
              "b00027",
            ),
            row(
              "Délai optimal",
              [
                {
                  text: "La première dose doit être terminée dans la fenêtre qui précède l’incision.",
                  children: [
                    "Repère général : 30 à 60 minutes avant l’incision",
                    "Sous garrot : injection achevée avant sa mise en place",
                  ],
                },
                "Une administration trop précoce laisse décroître la concentration avant l’exposition bactérienne.",
              ],
              "b00028",
            ),
            row(
              "Traçabilité anesthésique",
              [
                "Décaler l’injection de l’induction aide à identifier le responsable d’une éventuelle anaphylaxie.",
                "Cette séparation ne doit jamais conduire à dépasser l’incision.",
              ],
              "b00029",
            ),
            row(
              "Césarienne",
              [
                "L’administration dans les 30 minutes avant l’incision réduit les complications maternelles.",
                "Attendre le clampage du cordon n’améliore pas le devenir néonatal dans les données rapportées.",
              ],
              "b00030",
            ),
          ],
        },
        {
          title: "Adapter la dose puis réinjecter avec méthode",
          rows: [
            row(
              "Dose initiale",
              [
                "Chez l’adulte, la première dose prophylactique correspond habituellement au double de la dose usuelle.",
                "Une posologie standardisée limite les erreurs de calcul jusqu’à environ 100 kg.",
              ],
              "b00031",
            ),
            row(
              "Obésité et exceptions",
              [
                {
                  text: "Certains terrains imposent une adaptation explicite de la quantité administrée.",
                  children: [
                    "Au-delà de 100 kg avec IMC supérieur à 35 : doubler les bêta-lactamines",
                    "Vancomycine et gentamicine : calculer sur le poids réel",
                  ],
                },
                "La pédiatrie conserve une adaptation pondérale spécifique.",
              ],
              "b00031",
            ),
            row(
              "Règle des deux demi-vies",
              [
                "Une chirurgie prolongée nécessite une réinjection toutes les deux demi-vies de l’antibiotique.",
                "Le chronomètre part de la première injection, non de l’incision.",
              ],
              "b00032",
              IMAGES.kinetics,
            ),
            row(
              "Dose de rappel",
              [
                {
                  text: "Chaque réinjection restaure l’exposition avant la fermeture sans répéter la charge initiale.",
                  children: [
                    "Dose de rappel : moitié de la première dose",
                    "Objectif : maintenir une concentration tissulaire protectrice",
                  ],
                },
              ],
              "b00032",
            ),
          ],
        },
      ],
    },
    {
      title: "Limiter la durée et personnaliser les situations à risque",
      sections: [
        {
          title: "Arrêter dès que l’exposition opératoire cesse",
          rows: [
            row(
              "Durée minimale",
              [
                "Une dose unique suffit pour de nombreux gestes courts lorsque la concentration couvre toute l’intervention.",
                "La fermeture cutanée marque en principe la fin du besoin préventif.",
              ],
              ["b00032", "b00033", "b00036"],
            ),
            row(
              "Matériel implanté",
              [
                "Une prothèse augmente la gravité potentielle d’une infection mais ne justifie pas une prolongation postopératoire.",
                "La qualité du timing et des réinjections prime sur la durée après fermeture.",
              ],
              ["b00006", "b00036"],
            ),
            row(
              "Drains et cathéters",
              [
                {
                  text: "Les dispositifs laissés en place ne prolongent pas l’indication prophylactique.",
                  children: [
                    "Drain ou redon : pas de couverture jusqu’au retrait",
                    "Accès vasculaire : pas d’antibiotique préventif continu",
                  ],
                },
              ],
              "b00036",
            ),
            row(
              "Risque écologique",
              [
                "La prolongation inutile sélectionne des bactéries multirésistantes sans bénéfice infectieux démontré.",
                "Toute dose postopératoire doit donc répondre à une indication curative explicite.",
              ],
              ["b00036", "b00038"],
            ),
          ],
        },
        {
          title: "Raisonner devant un portage multirésistant",
          rows: [
            row(
              "Pression de sélection",
              [
                {
                  text: "Même une exposition prophylactique ponctuelle peut modifier l’écologie bactérienne.",
                  children: [
                    "Quinolones et vancomycine sélectionnent des portages résistants",
                    "Une vancomycine prolongée au-delà de 48 heures accroît encore ce risque",
                  ],
                },
              ],
              "b00038",
            ),
            row(
              "Portage non synonyme d’infection",
              [
                "Le portage d’une bactérie résistante ne prouve pas un risque infectieux opératoire globalement supérieur.",
                "L’écart au protocole standard reste exceptionnel et doit être argumenté.",
              ],
              "b00039",
            ),
            row(
              "Décision individualisée",
              [
                {
                  text: "Quatre éléments relient le portage au risque de contamination du site.",
                  children: [
                    "Germe et profil de résistance",
                    "Procédure, incision et proximité du réservoir colonisé",
                  ],
                },
              ],
              "b00039",
            ),
            row(
              "Exemples ciblés",
              [
                "Un portage de SARM peut faire choisir la vancomycine lors d’une chirurgie avec ouverture cutanée et prothèse.",
                "Un portage de BLSE peut être discuté si le tube digestif est ouvert, avec le spectre efficace le plus étroit.",
              ],
              "b00039",
            ),
          ],
        },
        {
          title: "Décontaminer seulement lorsque le bénéfice est plausible",
          rows: [
            row(
              "Portage nasal",
              [
                "Le portage nasal de staphylocoque doré concerne environ 20 à 30 % de la population.",
                "Il multiplie par dix le risque d’infection du site opératoire ; les souches concordent dans 90 % des infections associées.",
              ],
              "b00041",
            ),
            row(
              "Mupirocine ciblée",
              [
                {
                  text: "La décolonisation nasale efficace repose sur un patient dépisté et une cure complète.",
                  children: [
                    "Écouvillonnage nasal antérieur avec culture et antibiogramme",
                    "Mupirocine deux fois par jour pendant cinq jours",
                  ],
                },
              ],
              "b00041",
            ),
            row(
              "Chirurgies prioritaires",
              [
                "Le bénéfice paraît surtout pertinent en chirurgie cardiothoracique, neurochirurgie et orthopédie prothétique.",
                "En chirurgie générale, Gram négatif et anaérobies réduisent la pertinence d’une stratégie centrée sur le staphylocoque.",
              ],
              ["b00042", "b00044"],
              IMAGES.specialties,
            ),
            row(
              "Éviter le systématique",
              [
                {
                  text: "Une décontamination universelle cumule deux effets défavorables.",
                  children: [
                    "Sélection de résistances à la mupirocine",
                    "Coût sans rentabilité démontrée hors indications ciblées",
                  ],
                },
                "La préparation colique seule ne prévient pas les infections ; l’antibiothérapie orale colorectale reste discutée.",
              ],
              ["b00043", "b00045"],
            ),
          ],
        },
      ],
    },
    {
      title: "Gérer les indications particulières et améliorer les pratiques",
      sections: [
        {
          title: "Reconnaître la prophylaxie de l’endocardite infectieuse",
          rows: [
            row(
              "Patients à haut risque",
              [
                {
                  text: "La prophylaxie d’endocardite est réservée à quelques cardiopathies à conséquences sévères.",
                  children: [
                    "Valve ou réparation valvulaire prothétique et antécédent d’endocardite",
                    "Certaines cardiopathies congénitales cyanogènes ou réparées",
                  ],
                },
              ],
              "b00047",
            ),
            row(
              "Cardiopathies congénitales",
              [
                "Sont concernées les cardiopathies cyanogènes non réparées, avec fuite résiduelle ou dérivation.",
                "Après réparation prothétique, le risque est retenu pendant six mois ou plus longtemps si une fuite persiste.",
              ],
              "b00047",
            ),
            row(
              "Gestes concernés",
              [
                "Seuls les gestes dentaires manipulant la gencive, la région périapicale ou perforant la muqueuse orale sont visés.",
                "Pour les autres procédures, on applique la prophylaxie chirurgicale habituelle si elle est indiquée.",
              ],
              "b00047",
            ),
            row(
              "Schéma antibiotique",
              [
                {
                  text: "La dose unique précède le geste dentaire à risque.",
                  children: [
                    "Amoxicilline : 2 g per os ou intraveineux",
                    "Allergie : clindamycine 600 mg per os ou intraveineux",
                  ],
                },
              ],
              ["b00047", "b00048"],
            ),
          ],
        },
        {
          title: "Auditer une prescription du bloc opératoire",
          rows: [
            row(
              "Cinq critères",
              [
                {
                  text: "Un audit utile reconstitue toute la séquence de prophylaxie.",
                  children: [
                    "Indication, molécule, dose et délai avant incision",
                    "Réinjections, heure d’arrêt et justification des écarts",
                  ],
                },
              ],
              ["b00050", "b00051", "b00052"],
            ),
            row(
              "Niveau observé",
              [
                "Une enquête canadienne de 2016 portant sur 2 082 procédures dans 52 centres retrouvait 91 % de conformité.",
                "Ce résultat global n’exclut pas des défauts ciblés de timing ou de réinjection.",
              ],
              ["b00050", "b00051"],
            ),
            row(
              "Boucle d’amélioration",
              [
                "Les audits doivent être répétés pour mesurer l’adhésion et corriger les écarts.",
                "Le retour aux équipes transforme un indicateur en amélioration réelle.",
              ],
              "b00052",
            ),
            row(
              "Protocoles vivants",
              [
                {
                  text: "Un protocole sûr doit rester utilisable et cohérent avec l’écologie actuelle.",
                  children: [
                    "Accès immédiat au bloc et validation médicochirurgicale locale",
                    "Révision selon les infections, résistances et techniques opératoires",
                  ],
                },
              ],
              ["b00054", "b00064", "b00065"],
            ),
          ],
        },
        {
          title: "Sécuriser la check-list du jour de l’intervention",
          rows: [
            row(
              "Avant le bloc",
              [
                "Confirmer l’indication, la flore visée, l’allergie réelle, le poids et les portages pertinents.",
                "Choisir et préparer la dose initiale ainsi que l’alternative documentée.",
              ],
              ["b00022", "b00024", "b00031"],
            ),
            row(
              "Avant l’incision",
              [
                {
                  text: "Trois vérifications garantissent une exposition tissulaire correcte.",
                  children: [
                    "Injection terminée dans la fenêtre de 30 à 60 minutes",
                    "Dose adaptée au poids extrême et garrot non encore gonflé",
                    "Heure exacte consignée pour calculer les rappels",
                  ],
                },
              ],
              ["b00028", "b00031", "b00032"],
            ),
            row(
              "Pendant le geste",
              [
                "Anticiper chaque échéance de deux demi-vies plutôt que réagir après dépassement.",
                "Réadministrer la moitié de la dose initiale si l’intervention se prolonge.",
              ],
              "b00032",
            ),
            row(
              "À la fermeture",
              [
                "Vérifier que la dernière concentration couvre la fermeture, puis arrêter la prophylaxie.",
                "Tracer tout changement vers une antibiothérapie curative comme une décision distincte.",
              ],
              ["b00025", "b00026", "b00033", "b00036"],
            ),
          ],
        },
      ],
    },
  ];

  const sourceBlocks = [
    ...new Set(
      parts.flatMap((part) =>
        part.sections.flatMap((section) =>
          section.rows.flatMap((entry) => entry.sourceBlocks),
        ),
      ),
    ),
  ];

  return {
    title: "Les principes d’antibioprophylaxie",
    matiere: "Anesthésie-Réanimation",
    color: "#7C3AED",
    sourceBlocks,
    imageException: {
      reason:
        "Les quatre figures pédagogiques disponibles sont toutes reprises en pleine largeur.",
    },
    imageOmissions: [],
    cover: {
      kicker: "ANESTHÉSIE-RÉANIMATION",
      year: "2026-2027",
      subtitle:
        "INDICATION, CIBLES BACTÉRIENNES, TIMING, RÉINJECTION, RÉSISTANCES ET AUDIT DES PRATIQUES",
    },
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur utile"],
        rows: [
          ["Fenêtre avant incision", "30 à 60 min"],
          ["Dose initiale adulte", "En général 2 × dose usuelle"],
          ["Rappel peropératoire", "Toutes les 2 demi-vies"],
          ["Dose de rappel", "Moitié de la dose initiale"],
          ["Bêta-lactamine si obésité", "Doubler si > 100 kg et IMC > 35"],
          ["Portage nasal S. aureus", "20 à 30 % de la population"],
          ["Mupirocine ciblée", "2 applications/j pendant 5 j"],
          ["Endocardite — amoxicilline", "2 g PO ou IV"],
        ],
      },
      tables: [
        {
          title: "Décision rapide",
          headers: ["Situation", "Conduite"],
          rows: [
            ["Chirurgie propre-contaminée", "Prophylaxie adaptée à la flore"],
            ["Infection ou chirurgie sale", "Antibiothérapie curative"],
            ["Garrot", "Injection terminée avant gonflage"],
            ["Geste long", "Rappel à deux demi-vies"],
            ["Drain ou prothèse", "Pas de prolongation postopératoire"],
          ],
        },
        {
          title: "Pièges à éviter",
          headers: ["Piège", "Réflexe sûr"],
          rows: [
            [
              "Stériliser toutes les flores",
              "Couvrir seulement les germes attendus",
            ],
            [
              "Injecter pendant l’induction",
              "Séparer les expositions allergéniques",
            ],
            [
              "Allergie pénicilline non documentée",
              "Reconstituer précisément la réaction",
            ],
            [
              "Portage multirésistant = large spectre",
              "Individualiser et garder le spectre étroit",
            ],
            [
              "Décontamination universelle",
              "Dépister et cibler les indications",
            ],
          ],
        },
      ],
      keyPoints: [
        "L’antibioprophylaxie complète l’asepsie et ne traite pas une infection constituée.",
        "Le choix dépend du geste, de la flore exposée, de l’écologie locale et du patient.",
        "La concentration doit être efficace dès l’incision et jusqu’à la fermeture.",
        "La première dose est injectée 30 à 60 minutes avant l’incision.",
        "Une chirurgie longue impose un rappel à deux demi-vies, à demi-dose.",
        "Prothèse, drain ou cathéter ne justifient pas une prolongation.",
        "Portages résistants et décontamination imposent une décision ciblée.",
        "L’audit régulier maintient les protocoles accessibles et adaptés à l’écologie.",
      ],
      eclair: [
        "Indication avant molécule : classer le geste et distinguer prévention et traitement.",
        "Spectre étroit : viser la flore probable sans pression écologique inutile.",
        "Timing : dose terminée 30 à 60 minutes avant incision, avant tout garrot.",
        "Dose : charge adulte habituellement doublée, adaptation des poids extrêmes.",
        "Rappel : toutes les deux demi-vies, à la moitié de la dose initiale.",
        "Arrêt : fermeture cutanée, sans prolongation pour drain ou matériel.",
        "Portage : adapter seulement si germe, réservoir et chirurgie sont cohérents.",
        "Qualité : tracer puis auditer indication, timing, dose, rappels et arrêt.",
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
      "Quel est le but de l’antibioprophylaxie chirurgicale ?",
      "Réduire les infections du site opératoire en contrôlant l’inoculum introduit pendant le geste.",
      "b00005",
    ),
    card(
      "L’antibioprophylaxie vise-t-elle à stériliser le site ?",
      "Non. Elle empêche la multiplication des germes attendus sans éradiquer toute la flore.",
      "b00015",
    ),
    card(
      "Quand la concentration tissulaire doit-elle être efficace ?",
      "Dès l’incision et jusqu’à la fermeture cutanée.",
      ["b00006", "b00025", "b00026"],
    ),
    card(
      "Quelle place occupe l’asepsie face à la prophylaxie ?",
      "Elle reste indispensable : l’antibiotique complète préparation cutanée, hygiène et maîtrise thermique.",
      "b00006",
    ),
    card(
      "Quelle part des prescriptions hospitalières représente la prophylaxie ?",
      "Environ un tiers du volume d’antibiotiques hospitaliers.",
      ["b00007", "b00023"],
    ),
    card(
      "Quel inoculum cible la prophylaxie ?",
      "Un inoculum faible, souvent commensal, déposé dans un milieu opératoire favorable à sa croissance.",
      "b00006",
    ),
    card(
      "Quel risque infectieux justifie habituellement une prophylaxie ?",
      "Un risque spontané supérieur à 5 %, ou faible mais associé à une morbidité majeure.",
      "b00007",
    ),
    card(
      "Quelle classe d’Altemeier correspond à une chirurgie propre ?",
      "La classe I, avec faible risque spontané d’infection.",
      "b00007",
    ),
    card(
      "Quelle classe d’Altemeier est propre-contaminée ?",
      "La classe II, typiquement éligible à une prophylaxie.",
      "b00007",
    ),
    card(
      "Que nécessitent les classes contaminée et sale ?",
      "Une antibiothérapie curative plutôt qu’une simple prophylaxie.",
      "b00007",
    ),
    card(
      "Quels paramètres composent le score NNISS ?",
      "Classe ASA, classe de contamination et durée opératoire prévisible.",
      "b00007",
    ),
    card(
      "Pourquoi le NNISS doit-il être interprété avec prudence ?",
      "Il date de 1992 et reflète imparfaitement les techniques mini-invasives et durées actuelles.",
      "b00007",
    ),
    card(
      "Quels germes dominent la flore cutanée ?",
      "Surtout staphylocoques commensaux, corynébactéries et autres bactéries à Gram positif.",
      "b00012",
    ),
    card(
      "Quel germe pathogène peut coloniser transitoirement la peau ?",
      "Staphylococcus aureus, notamment lors d’un portage nasal associé.",
      "b00012",
    ),
    card(
      "Quelle flore caractérise l’oropharynx ?",
      "Staphylocoques, streptocoques, pneumocoque, Haemophilus et anaérobies buccaux.",
      "b00012",
    ),
    card(
      "Quelle est normalement la flore respiratoire inférieure ?",
      "Elle est stérile, hors colonisation liée à certaines maladies respiratoires chroniques.",
      "b00012",
    ),
    card(
      "Comment évolue la flore digestive vers le côlon ?",
      "La densité augmente et les anaérobies deviennent prépondérants au niveau colique et rectal.",
      "b00013",
    ),
    card(
      "Quels germes sont fréquents dans l’intestin grêle ?",
      "Entérobactéries, streptocoques et entérocoques, avec aérobies et anaérobies en proportions proches.",
      "b00013",
    ),
    card(
      "Quels germes dominent globalement les ISO rapportées ?",
      "Les staphylocoques et les entérobactéries, avec variation selon le site opératoire.",
      "b00016",
    ),
    card(
      "Pourquoi l’écologie locale modifie-t-elle le protocole ?",
      "Des résistances ou flores spécifiques peuvent rendre la recommandation standard inadaptée.",
      "b00015",
    ),
    card(
      "Quel spectre choisir en prophylaxie ?",
      "Le spectre le plus étroit couvrant les bactéries plausibles du geste.",
      ["b00022", "b00023"],
    ),
    card(
      "Quelles qualités doit avoir l’antibiotique prophylactique ?",
      "Efficace, peu toxique, peu coûteux et peu sélectionnant pour les résistances.",
      "b00023",
    ),
    card(
      "Pourquoi éviter la rifampicine en prophylaxie systémique ?",
      "Son risque élevé de mutation et de sélection rapide de résistances.",
      "b00023",
    ),
    card(
      "Pourquoi éviter les fluoroquinolones en prophylaxie systémique ?",
      "Elles sélectionnent facilement des résistances, hors indications ophtalmologiques spécifiques.",
      ["b00023", "b00027"],
    ),
    card(
      "Quelles céphalosporines sont préférées en prophylaxie ?",
      "Celles de première ou deuxième génération, selon la flore ciblée.",
      "b00024",
    ),
    card(
      "Quand choisir l’alternative au protocole standard ?",
      "Lors de l’évaluation préopératoire, après analyse du geste, de l’écologie et de l’allergie.",
      "b00024",
    ),
    card(
      "Quels éléments décrire devant une allergie antibiotique ?",
      "Délai, symptômes objectivés, durée, traitement et relation temporelle avec l’administration.",
      "b00024",
    ),
    card(
      "Quel déterminant explique surtout la réactivité croisée des bêta-lactamines ?",
      "La similarité de la chaîne latérale R1, plutôt que le seul cycle bêta-lactame.",
      "b00024",
    ),
    card(
      "Quel taux récent de réaction croisée pénicilline-céphalosporine est cité ?",
      "Moins de 1 % dans les données récentes rapportées.",
      "b00024",
    ),
    card(
      "Quelle voie est préférée pour l’antibioprophylaxie ?",
      "La voie intraveineuse, pour une exposition rapide et prévisible.",
      "b00027",
    ),
    card(
      "Quelle exception ophtalmologique peut utiliser la voie orale ?",
      "Une fluoroquinolone la veille puis 2 à 4 heures avant la chirurgie.",
      "b00027",
    ),
    card(
      "Que permet une injection intracamérulaire en ophtalmologie ?",
      "Réduire le risque d’endophtalmie avec une forme galénique adaptée, sans prophylaxie systémique associée.",
      "b00027",
    ),
    card(
      "Quelle fenêtre précède idéalement l’incision ?",
      "La première dose est administrée 30 à 60 minutes avant l’incision.",
      "b00028",
    ),
    card(
      "Pourquoi une administration trop précoce est-elle défavorable ?",
      "La concentration peut décroître avant l’incision et augmenter le risque d’ISO.",
      "b00028",
    ),
    card(
      "Quand injecter si un garrot pneumatique est utilisé ?",
      "Terminer l’antibiotique 30 à 60 minutes avant la mise en place du garrot.",
      "b00028",
    ),
    card(
      "Pourquoi séparer prophylaxie et induction anesthésique ?",
      "Pour mieux identifier le médicament responsable en cas d’anaphylaxie.",
      "b00029",
    ),
    card(
      "Quand administrer la prophylaxie d’une césarienne ?",
      "Dans les 30 minutes précédant l’incision, sans attendre le clampage du cordon.",
      "b00030",
    ),
    card(
      "Quel bénéfice maternel est associé au timing pré-incision en césarienne ?",
      "Moins de complications maternelles sans altération démontrée du devenir de l’enfant.",
      "b00030",
    ),
    card(
      "Quelle est la dose initiale prophylactique adulte habituelle ?",
      "En général le double de la dose usuelle hors prophylaxie.",
      "b00031",
    ),
    card(
      "Jusqu’à quel poids la dose adulte standard est-elle jugée fiable ?",
      "Jusqu’à environ 100 kg dans les données pharmacocinétiques citées.",
      "b00031",
    ),
    card(
      "Quand doubler les bêta-lactamines chez l’adulte obèse ?",
      "Si le poids dépasse 100 kg et l’IMC 35 kg/m².",
      "b00031",
    ),
    card(
      "Sur quel poids calculer vancomycine et gentamicine ?",
      "Sur le poids réel du patient.",
      "b00031",
    ),
    card(
      "Quand réinjecter pendant une chirurgie longue ?",
      "Toutes les deux demi-vies de l’antibiotique.",
      "b00032",
    ),
    card(
      "À partir de quelle heure calcule-t-on les rappels ?",
      "À partir de la première injection, et non de l’incision.",
      "b00032",
    ),
    card(
      "Quelle dose utiliser lors d’une réinjection ?",
      "La moitié de la dose initiale.",
      "b00032",
    ),
    card(
      "Quel lien existe entre concentration à la fermeture et ISO ?",
      "Une concentration tissulaire insuffisante à la fermeture augmente le risque d’infection.",
      "b00032",
    ),
    card(
      "Une dose unique peut-elle suffire ?",
      "Oui, si le geste est assez court pour rester couvert jusqu’à la fermeture.",
      "b00032",
    ),
    card(
      "Faut-il prolonger après implantation d’une prothèse ?",
      "Non. Le matériel implanté ne justifie pas une prophylaxie postopératoire prolongée.",
      ["b00033", "b00036"],
    ),
    card(
      "Un drain justifie-t-il la poursuite de la prophylaxie ?",
      "Non. Drain, redon ou accès vasculaire ne prolongent pas l’indication.",
      "b00036",
    ),
    card(
      "Quel effet a une prophylaxie excessivement prolongée ?",
      "Elle sélectionne des germes multirésistants sans bénéfice démontré.",
      "b00036",
    ),
    card(
      "Quel facteur populationnel suit la consommation antibiotique ?",
      "La prévalence de résistance augmente avec la proportion de patients exposés.",
      "b00038",
    ),
    card(
      "Une dose de quinolone peut-elle sélectionner une résistance ?",
      "Oui, même une dose prophylactique unique augmente le portage de bactéries résistantes.",
      "b00038",
    ),
    card(
      "Quel effet a une vancomycine prolongée au-delà de 48 h ?",
      "En pontage coronarien, le risque de portage résistant cité est multiplié par 1,6.",
      "b00038",
    ),
    card(
      "Le portage multirésistant augmente-t-il toujours le risque d’ISO ?",
      "Aucune donnée générale ne l’établit ; la décision dépend du germe et de la chirurgie.",
      "b00039",
    ),
    card(
      "Quels critères relient un portage résistant au geste ?",
      "Germe, profil de résistance, procédure et proximité entre incision et réservoir de portage.",
      "b00039",
    ),
    card(
      "Quand discuter la vancomycine chez un porteur de SARM ?",
      "Pour une chirurgie cutanée à risque avec implantation de matériel prothétique.",
      "b00039",
    ),
    card(
      "Quand un portage de BLSE peut-il influencer la prophylaxie ?",
      "Lors d’une chirurgie ouvrant le tube digestif, après discussion individualisée.",
      "b00039",
    ),
    card(
      "Quelle règle encadre l’écart au protocole pour un portage ?",
      "Il doit rester exceptionnel, ciblé et employer le spectre efficace le plus étroit.",
      "b00039",
    ),
    card(
      "Quelle fréquence a le portage nasal de S. aureus ?",
      "Environ 20 à 30 % de la population.",
      "b00041",
    ),
    card(
      "De combien le portage nasal augmente-t-il le risque d’ISO ?",
      "Il multiplie le risque par dix.",
      "b00041",
    ),
    card(
      "Quelle concordance souche nasale-ISO est rapportée ?",
      "Environ 90 % lorsque l’ISO à S. aureus survient chez un porteur nasal.",
      "b00041",
    ),
    card(
      "Comment dépister le portage nasal de S. aureus ?",
      "Par écouvillonnage nasal antérieur correctement réalisé, puis culture et antibiogramme.",
      "b00041",
    ),
    card(
      "Quel schéma de mupirocine nasale est cité ?",
      "Deux applications par jour pendant cinq jours.",
      "b00041",
    ),
    card(
      "Quelle bactérie cible principalement la mupirocine ?",
      "Les bactéries à Gram positif, notamment Staphylococcus aureus.",
      "b00041",
    ),
    card(
      "La mupirocine seule prouve-t-elle tout le bénéfice observé ?",
      "Non, beaucoup d’études l’associent à une décontamination cutanée par chlorhexidine.",
      "b00042",
    ),
    card(
      "Quelles chirurgies semblent le plus bénéficier de la décolonisation nasale ?",
      "Cardiothoracique, neurochirurgie et orthopédie prothétique.",
      ["b00042", "b00044"],
    ),
    card(
      "Pourquoi le bénéfice est-il moindre en chirurgie générale ?",
      "Les bacilles à Gram négatif et les anaérobies y jouent un rôle plus important.",
      "b00042",
    ),
    card(
      "Pourquoi bannir une décontamination nasale systématique ?",
      "Elle sélectionne des résistances, coûte cher et n’est rentable que dans certaines indications.",
      "b00043",
    ),
    card(
      "La préparation colique seule prévient-elle les ISO ?",
      "Non, son efficacité isolée n’est pas démontrée.",
      "b00045",
    ),
    card(
      "Quelle association colorectale a montré un bénéfice ?",
      "Antibiotiques oraux la veille associés à la prophylaxie IV peropératoire.",
      "b00045",
    ),
    card(
      "Pourquoi la décontamination digestive reste-t-elle controversée ?",
      "Les études mêlent souvent antibiotiques oraux et préparation colique, avec risque écologique incertain.",
      "b00045",
    ),
    card(
      "Quels patients relèvent d’une prophylaxie d’endocardite ?",
      "Valve prothétique, antécédent d’endocardite et certaines cardiopathies congénitales.",
      "b00047",
    ),
    card(
      "Quelle cardiopathie cyanogène est à haut risque ?",
      "Une cardiopathie non opérée, avec fuite résiduelle ou dérivation chirurgicale.",
      "b00047",
    ),
    card(
      "Combien de temps après réparation prothétique cardiaque ?",
      "Jusqu’à six mois, ou davantage si une fuite résiduelle persiste.",
      "b00047",
    ),
    card(
      "Quels gestes dentaires nécessitent cette prophylaxie ?",
      "Ceux touchant gencive, région périapicale ou perforant la muqueuse orale.",
      "b00047",
    ),
    card(
      "Quelle dose d’amoxicilline pour la prophylaxie d’endocardite ?",
      "2 g par voie orale ou intraveineuse.",
      "b00047",
    ),
    card(
      "Quelle alternative et dose en cas d’allergie ?",
      "Clindamycine 600 mg par voie orale ou intraveineuse.",
      ["b00047", "b00048"],
    ),
    card(
      "Combien de centres participaient à l’audit canadien de 2016 ?",
      "52 centres.",
      "b00050",
    ),
    card(
      "Combien de procédures comportait cet audit ?",
      "2 082 procédures chirurgicales.",
      ["b00050", "b00051"],
    ),
    card(
      "Quel taux de prophylaxies adaptées y était rapporté ?",
      "91 % selon les critères molécule, délai, dose et réinjections.",
      ["b00050", "b00051"],
    ),
    card(
      "Pourquoi répéter les audits ?",
      "Pour mesurer l’adhésion, repérer les dérives et corriger les protocoles ou leur application.",
      "b00052",
    ),
    card(
      "Quelles données doivent actualiser un protocole local ?",
      "ISO par chirurgie, résistances du service, littérature et évolution des techniques.",
      "b00054",
    ),
    card(
      "Où les protocoles doivent-ils être accessibles ?",
      "Immédiatement au bloc opératoire, sous une forme validée et régulièrement mise à jour.",
      "b00054",
    ),
    card(
      "Quels critères vérifier avant l’incision ?",
      "Indication, molécule, allergie, dose, heure de fin d’injection et présence d’un garrot.",
      ["b00024", "b00028", "b00031"],
    ),
    card(
      "Que vérifier pendant une chirurgie longue ?",
      "L’échéance de deux demi-vies et la réalisation du rappel à demi-dose.",
      "b00032",
    ),
    card(
      "Que vérifier à la fermeture ?",
      "Couverture tissulaire encore active puis arrêt de la prophylaxie.",
      ["b00025", "b00032", "b00036"],
    ),
    card(
      "Quel antibiotique de l’image a une demi-vie de 2 h ?",
      "La céfazoline et la clindamycine.",
      "b00034",
    ),
    card(
      "Quel rythme de rappel est indiqué pour la céfazoline ?",
      "La clindamycine est réinjectée toutes les 4 heures.",
      "b00034",
    ),
    card(
      "Quel rythme de rappel est indiqué pour le céfuroxime ?",
      "Toutes les 3 heures.",
      "b00034",
    ),
    card(
      "Quel rythme de rappel est indiqué pour le céfotaxime ?",
      "L’amoxicilline-acide clavulanique est réinjectée toutes les 2 heures.",
      "b00034",
    ),
    card(
      "Quel rythme de rappel est indiqué pour la clindamycine ?",
      "Toutes les 4 heures.",
      "b00034",
    ),
    card(
      "Quel rythme de rappel est indiqué pour amoxicilline-acide clavulanique ?",
      "Toutes les 2 heures.",
      "b00034",
    ),
    card(
      "Quel antibiotique du tableau ne nécessite pas de rappel ?",
      "Le métronidazole, grâce à sa demi-vie de 6 heures.",
      "b00034",
    ),
    card(
      "Quelle dose de céfazoline figure dans le tableau ?",
      "2 g pour la dose recommandée.",
      "b00034",
    ),
    card(
      "Quelle dose de céfuroxime figure dans le tableau ?",
      "1,5 g pour la dose recommandée.",
      "b00034",
    ),
    card(
      "Quelle dose de clindamycine figure dans le tableau ?",
      "600 mg pour la dose recommandée.",
      "b00034",
    ),
    card(
      "Quelle dose de métronidazole figure dans le tableau ?",
      "1 g pour la dose recommandée.",
      "b00034",
    ),
    card(
      "Quel principe distingue prophylaxie et antibiothérapie curative ?",
      "La première prévient la croissance d’un faible inoculum ; la seconde traite une infection constituée.",
      "b00006",
    ),
    card(
      "Pourquoi le sang et le matériel favorisent-ils une ISO ?",
      "Ils créent un milieu local propice à la croissance malgré un inoculum initial faible.",
      "b00006",
    ),
    card(
      "Que faire si une infection est découverte pendant l’intervention ?",
      "Requalifier la stratégie en antibiothérapie curative, avec indication et durée propres.",
      ["b00007", "b00036"],
    ),
    card(
      "Pourquoi tracer l’heure de première injection ?",
      "Elle détermine les échéances de réinjection et permet d’auditer la couverture de l’incision.",
      "b00032",
    ),
    card(
      "Pourquoi une dose standard adulte réduit-elle les erreurs ?",
      "Elle évite des calculs inutiles tout en assurant l’exposition chez l’adulte jusqu’à environ 100 kg.",
      "b00031",
    ),
    card(
      "Quel risque accompagne une anaphylaxie si tout est injecté ensemble ?",
      "L’identification du médicament causal devient difficile, compliquant les anesthésies futures.",
      "b00029",
    ),
    card(
      "Quel est le rôle d’un protocole local ?",
      "Adapter les recommandations nationales à la flore, aux résistances et aux procédures du service.",
      ["b00015", "b00054"],
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
    title: "Indication et classifications",
    questions: [
      qcm(
        "Quels énoncés définissent correctement l’antibioprophylaxie chirurgicale ?",
        ["b00005", "b00006", "b00015"],
        "La prophylaxie réduit les infections liées au faible inoculum opératoire ; elle complète l’asepsie sans stériliser le site ni traiter une infection constituée.",
        [
          T(
            "Elle vise les infections du site opératoire.",
            "Son objectif est de réduire les infections directement liées à l’acte chirurgical.",
          ),
          F(
            "Elle vise à obtenir un pic sérique après la fermeture cutanée.",
            "La concentration doit être efficace dès l’incision puis maintenue jusqu’à la fermeture, et non obtenue après elle.",
          ),
          T(
            "Elle complète les mesures d’asepsie.",
            "Préparation cutanée, hygiène et maîtrise physiologique restent indispensables.",
          ),
          F(
            "Elle stérilise durablement toutes les flores.",
            "Elle limite la multiplication de germes ciblés sans éradiquer les flores commensales.",
          ),
          F(
            "Elle traite seule une infection déjà collectée.",
            "Une infection constituée relève d’une antibiothérapie curative.",
          ),
        ],
      ),
      qcm(
        "Quelles situations relèvent habituellement d’une prophylaxie plutôt que d’un traitement curatif ?",
        "b00007",
        "La classe II et certaines classes I à forte morbidité relèvent d’une prophylaxie ; contamination importante, perforation ou infection nécessitent un traitement.",
        [
          F(
            "Chirurgie contaminée avec plaie traumatique souillée.",
            "Ce niveau de contamination relève d’une antibiothérapie curative.",
          ),
          T(
            "Chirurgie propre avec implantation à haut risque.",
            "Une infection rare peut avoir une morbidité majeure autour d’un matériel.",
          ),
          F(
            "Abcès déjà constitué au site opératoire.",
            "La présence d’une infection impose une antibiothérapie curative.",
          ),
          F(
            "Péritonite par perforation digestive.",
            "La contamination et l’infection dépassent le cadre préventif.",
          ),
          T(
            "Geste dont le risque spontané d’ISO dépasse 5 %.",
            "Ce seuil est cité pour justifier une prophylaxie.",
          ),
        ],
      ),
      qcm(
        "Quels paramètres participent au score NNISS ?",
        "b00007",
        "Le NNISS associe état général ASA, classe de contamination et durée opératoire attendue ; il ne repose pas sur l’âge ou la seule antibiothérapie.",
        [
          F(
            "Taux d’hémoglobine préopératoire.",
            "Le score retient l’ASA, la classe de Polk-Altemeier et la durée prévisible, sans paramètre biologique.",
          ),
          F(
            "Âge civil pris isolément.",
            "L’âge n’est pas l’un des trois paramètres constitutifs du score.",
          ),
          T(
            "Classe de Polk-Altemeier.",
            "Elle traduit le niveau de contamination du geste.",
          ),
          T(
            "Durée prévisible de l’intervention.",
            "Le dépassement de la durée de référence participe au risque.",
          ),
          F(
            "Nombre de doses postopératoires.",
            "Le score prédit le risque et ne mesure pas la prolongation antibiotique.",
          ),
        ],
      ),
      qcm(
        "Quelles conditions rendent le site opératoire favorable à la croissance d’un faible inoculum ?",
        "b00006",
        "Sang, hypoperfusion locale, défenses perturbées et matériel inerte facilitent la prolifération ; une bonne oxygénation ne constitue pas un facteur aggravant cité.",
        [
          F(
            "Absence complète de sang dans le site.",
            "Le sang présent dans le champ, et non son absence, favorise le développement bactérien.",
          ),
          T(
            "Vascularisation locale perturbée.",
            "Une perfusion diminuée réduit les défenses et la diffusion antibiotique.",
          ),
          T(
            "Défenses immunitaires locales altérées.",
            "Le traumatisme opératoire dérègle la réponse locale.",
          ),
          T(
            "Hématome résiduel dans le site opératoire.",
            "Un épanchement sanguin fournit un milieu de culture au faible inoculum.",
          ),
          T(
            "Présence de matériel inerte.",
            "Une prothèse fournit un support propice à l’infection.",
          ),
        ],
      ),
      qcm(
        "Quels principes complètent l’antibioprophylaxie pour prévenir une ISO ?",
        "b00006",
        "La prévention est multimodale : asepsie, préparation cutanée, contrôle glycémique et normothermie complètent la bonne prescription.",
        [
          F(
            "Antisepsie cutanée réalisée après l’incision.",
            "La préparation cutanée précède l’ouverture afin d’abaisser la charge microbienne avant le geste.",
          ),
          T(
            "Hygiène rigoureuse des mains et des locaux.",
            "Elle limite l’apport exogène de bactéries.",
          ),
          F(
            "Hyperglycémie peropératoire tolérée.",
            "Le contrôle glycémique fait partie des mesures de prévention.",
          ),
          T(
            "Normothermie peropératoire.",
            "L’hypothermie compromet les défenses et la cicatrisation.",
          ),
          T(
            "Maîtrise du nombre de personnes en salle.",
            "Le contrôle de l’environnement participe à l’asepsie du bloc.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Flores et bactéries cibles",
    questions: [
      qcm(
        "Quelles bactéries appartiennent fréquemment à la flore cutanée ciblée ?",
        "b00012",
        "La peau porte surtout des bactéries à Gram positif commensales, avec un portage possible de staphylocoque doré ; les anaérobies coliques ne dominent pas.",
        [
          T(
            "Staphylocoques à coagulase négative.",
            "Ils font partie des commensaux cutanés usuels.",
          ),
          T(
            "Corynébactéries.",
            "Ces bacilles à Gram positif colonisent fréquemment la peau.",
          ),
          T(
            "Staphylococcus aureus chez un porteur.",
            "Le staphylocoque doré peut coloniser transitoirement la peau.",
          ),
          T(
            "Propionibacterium.",
            "Ce bacille anaérobie appartient aux commensaux habituels de la peau.",
          ),
          T(
            "Micrococcus.",
            "Ce genre est cité parmi les bactéries cutanées peu pathogènes.",
          ),
        ],
      ),
      qcm(
        "Quels micro-organismes peuvent être rencontrés dans l’oropharynx ?",
        "b00012",
        "L’oropharynx possède une flore abondante associant cocci à Gram positif, Haemophilus, Moraxella et anaérobies buccaux.",
        [
          F(
            "Bacteroides fragilis comme espèce dominante.",
            "Cette espèce caractérise la flore colique et non la sphère oropharyngée.",
          ),
          F(
            "Flore obligatoirement stérile.",
            "L’arbre aérodigestif supérieur est fortement colonisé.",
          ),
          T(
            "Haemophilus influenzae.",
            "Cette espèce est citée dans la flore de la sphère supérieure.",
          ),
          T(
            "Anaérobies de la plaque dentaire.",
            "La plaque et la muqueuse orale hébergent des anaérobies.",
          ),
          T(
            "Staphylococcus aureus.",
            "Le staphylocoque doré peut être présent dans cette flore.",
          ),
        ],
      ),
      qcm(
        "Quels énoncés décrivent l’évolution de la flore digestive ?",
        "b00013",
        "La densité bactérienne augmente vers le côlon et le rapport aérobies-anaérobies s’inverse ; l’estomac n’a pas la même flore que le rectum.",
        [
          F(
            "L’estomac héberge la densité bactérienne la plus élevée du tube digestif.",
            "Son acidité gastrique maintient une population pauvre, essentiellement aérobie d’origine oropharyngée.",
          ),
          F(
            "Le grêle est colonisé exclusivement par des anaérobies stricts.",
            "L’intestin grêle comporte autant d’aérobies que d’anaérobies, avec entérobactéries, streptocoques et entérocoques.",
          ),
          F(
            "Les anaérobies disparaissent dans le côlon.",
            "Ils deviennent au contraire prépondérants au niveau colique et rectal.",
          ),
          T(
            "Le rapport aérobies-anaérobies varie selon le segment.",
            "Les populations changent progressivement le long du tube digestif.",
          ),
          F(
            "La flore rectale est moins dense que la flore gastrique.",
            "La flore digestive distale est la plus abondante.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs doivent guider la cible microbiologique d’une prophylaxie ?",
        ["b00015", "b00016", "b00022"],
        "La cible dépend de l’anatomie, de la procédure, du portage et de l’écologie locale ; une couverture universelle serait inutilement large.",
        [
          F(
            "Une flore identique pour toutes les spécialités.",
            "La répartition des germes varie fortement selon la chirurgie.",
          ),
          T(
            "Site anatomique opéré.",
            "Chaque région expose à une flore commensale différente.",
          ),
          T(
            "Type précis de geste.",
            "L’ouverture d’un organe colonisé détermine les bactéries plausibles.",
          ),
          T(
            "Écologie du service.",
            "Des particularités locales de résistance peuvent nécessiter une adaptation.",
          ),
          T(
            "Portages connus du patient.",
            "Un portage pertinent peut modifier une décision ciblée.",
          ),
        ],
      ),
      qcm(
        "Quels énoncés résument les germes des ISO observées dans les figures ?",
        ["b00016", "b00017", "b00019"],
        "Staphylocoques et entérobactéries dominent globalement, mais leur proportion change selon la spécialité ; le graphique n’impose pas un protocole unique.",
        [
          F(
            "Les entérobactéries représentent la totalité des germes isolés.",
            "Staphylocoques dorés et à coagulase négative figurent aussi parmi les principaux germes.",
          ),
          F(
            "Staphylococcus aureus est absent des ISO.",
            "Il compte au contraire parmi les principaux germes retrouvés.",
          ),
          F(
            "Toutes les spécialités ont exactement le même profil.",
            "Le graphique comparatif montre des distributions distinctes.",
          ),
          T(
            "Les anaérobies ont un poids variable selon la chirurgie.",
            "Leur part augmente lorsque la flore digestive est exposée.",
          ),
          T(
            "Le profil microbiologique doit être relié au geste.",
            "La figure soutient une adaptation par spécialité.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Choix de la molécule et allergie",
    questions: [
      qcm(
        "Quelles propriétés sont recherchées pour une molécule prophylactique ?",
        "b00023",
        "L’agent doit être actif sur la flore attendue, peu toxique, peu coûteux, à spectre étroit et peu sélectionnant.",
        [
          T(
            "Spectre aussi étroit que possible.",
            "Une couverture ciblée réduit la pression écologique.",
          ),
          T(
            "Faible toxicité.",
            "Le bénéfice préventif ne justifie pas une toxicité importante.",
          ),
          T(
            "Coût raisonnable.",
            "Le volume élevé de prescriptions rend le coût collectif pertinent.",
          ),
          T(
            "Faible risque de sélection résistante.",
            "La prophylaxie doit préserver l’efficacité future des antibiotiques.",
          ),
          T(
            "Molécule réservée à l’usage prophylactique.",
            "Son emploi thérapeutique courant ferait émerger des résistances et compromettrait la prévention.",
          ),
        ],
      ),
      qcm(
        "Quelles molécules ou familles occupent une place cohérente dans les principes décrits ?",
        ["b00023", "b00024", "b00027"],
        "Les céphalosporines précoces sont privilégiées ; rifampicine et fluoroquinolones ne sont pas des choix systémiques usuels, sauf cadre ophtalmologique spécifique.",
        [
          T(
            "Céphalosporine de première génération selon le geste.",
            "Son spectre peut convenir à une flore cutanée attendue.",
          ),
          T(
            "Céphalosporine de deuxième génération selon la cible.",
            "Elle peut élargir de façon mesurée la couverture nécessaire.",
          ),
          F(
            "Rifampicine systématique en monothérapie.",
            "Son risque de sélection rapide interdit cet usage prophylactique routinier.",
          ),
          F(
            "Fluoroquinolone IV pour toute chirurgie.",
            "Leur pression de sélection les exclut de la prophylaxie systémique générale.",
          ),
          T(
            "Fluoroquinolone orale dans un protocole ophtalmologique précis.",
            "Cette exception repose sur une exposition tissulaire oculaire documentée.",
          ),
        ],
      ),
      qcm(
        "Quels éléments permettent de caractériser une allergie antibiotique rapportée ?",
        "b00024",
        "L’analyse repose sur une chronologie et des symptômes objectivés, afin de distinguer une hypersensibilité réelle d’un effet indésirable.",
        [
          T(
            "Délai après l’administration.",
            "La temporalité oriente le mécanisme de la réaction.",
          ),
          T(
            "Signes et symptômes observés.",
            "La nature clinique distingue anaphylaxie, exanthème et effet secondaire.",
          ),
          F(
            "Couleur de la boîte du médicament.",
            "Cet élément n’aide pas à caractériser le mécanisme allergique.",
          ),
          T(
            "Durée et évolution de la réaction.",
            "La cinétique complète l’évaluation allergologique.",
          ),
          T(
            "Contexte viral ou digestif associé.",
            "Il peut expliquer une éruption ou une diarrhée non allergique.",
          ),
        ],
      ),
      qcm(
        "Quels énoncés concernent la réactivité croisée pénicilline-céphalosporine ?",
        "b00024",
        "La crainte historique était surestimée ; la chaîne latérale R1 est déterminante et les données récentes citées suggèrent moins de 1 % de croisements.",
        [
          F(
            "Le cycle bêta-lactame explique toujours la réaction.",
            "Les épitopes déterminants se situent surtout sur les chaînes latérales.",
          ),
          T(
            "Une chaîne R1 commune peut favoriser le croisement.",
            "La similarité structurale latérale peut être reconnue par les IgE.",
          ),
          F(
            "Le taux récent cité atteint systématiquement 15 %.",
            "Les données anciennes étaient probablement gonflées par les contaminations de fabrication.",
          ),
          T(
            "Les procédés modernes de purification ont réduit une confusion historique.",
            "Les premières céphalosporines pouvaient contenir des traces de pénicillines.",
          ),
          T(
            "Une céphalosporine ne doit pas être exclue sans analyse.",
            "L’alternative dépend de la molécule et de la réaction réellement décrite.",
          ),
        ],
      ),
      qcm(
        "Quelles décisions appartiennent à l’évaluation préopératoire ?",
        "b00024",
        "La consultation anticipe protocole, alternative, portages, terrain et geste ; improviser après l’incision compromet timing et sécurité.",
        [
          T(
            "Identifier le geste et sa flore cible.",
            "L’anatomie détermine le spectre nécessaire.",
          ),
          T(
            "Rechercher l’écologie particulière du service.",
            "Elle peut révéler une inadéquation du protocole standard.",
          ),
          F(
            "Reporter l’analyse d’une allergie alléguée au jour de l’intervention.",
            "L’évaluation préopératoire est le moment adapté pour caractériser la réaction et préparer une alternative.",
          ),
          F(
            "Attendre l’incision pour choisir la molécule.",
            "La concentration doit déjà être efficace au début du geste.",
          ),
          F(
            "Choisir toujours le spectre le plus large disponible.",
            "Le spectre étroit pertinent est le principe écologique majeur.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Timing, dose et réinjection",
    questions: [
      qcm(
        "Quels énoncés décrivent le bon timing de la première dose ?",
        ["b00028", "b00029"],
        "L’antibiotique est administré 30 à 60 minutes avant l’incision, séparé si possible de l’induction et achevé avant un garrot.",
        [
          F(
            "Administration la veille au soir pour anticiper le geste.",
            "Une injection trop précoce augmente le risque d’infection du site opératoire dans l’étude citée.",
          ),
          F(
            "Injection systématique deux heures après l’incision.",
            "Une administration tardive ne protège pas la contamination initiale.",
          ),
          T(
            "Administration terminée avant le gonflage du garrot.",
            "Le garrot empêcherait ensuite une diffusion adéquate dans le membre.",
          ),
          T(
            "Heure exacte tracée.",
            "Elle permet de contrôler la fenêtre et de calculer les rappels.",
          ),
          T(
            "Séparation de l’induction lorsque possible.",
            "Elle facilite l’identification d’un éventuel allergène.",
          ),
        ],
      ),
      qcm(
        "Quels principes concernent la dose initiale chez l’adulte ?",
        "b00031",
        "La charge est généralement doublée, standardisée jusqu’à environ 100 kg, puis adaptée dans l’obésité et pour certains antibiotiques pondéraux.",
        [
          T(
            "Double de la dose usuelle hors prophylaxie.",
            "Une charge élevée permet d’atteindre rapidement le tissu.",
          ),
          T(
            "Standardisation utile jusqu’à environ 100 kg.",
            "Elle assure l’exposition tout en évitant des calculs sources d’erreur.",
          ),
          F(
            "Réduction systématique chez tout adulte de 90 kg.",
            "La dose standard reste pharmacocinétiquement satisfaisante sous le seuil cité.",
          ),
          T(
            "Doublement des bêta-lactamines si poids > 100 kg et IMC > 35.",
            "L’augmentation du volume de distribution expose à une concentration insuffisante.",
          ),
          F(
            "Gentamicine calculée sur le poids idéal dans tous les cas.",
            "Le texte demande un calcul sur le poids réel pour gentamicine et vancomycine.",
          ),
        ],
      ),
      qcm(
        "Quelles règles gouvernent les réinjections peropératoires ?",
        "b00032",
        "Les rappels suivent deux demi-vies depuis la première injection et utilisent la moitié de la charge, afin de couvrir la fermeture.",
        [
          F(
            "Rappel déclenché par la reprise du saignement.",
            "La réinjection suit la pharmacocinétique de la molécule, pas un événement chirurgical.",
          ),
          F(
            "Calcul redémarré à chaque changement d’équipe chirurgicale.",
            "L’intervalle se compte depuis la première injection, indépendamment de l’organisation de la salle.",
          ),
          T(
            "Dose égale à la moitié de la dose initiale.",
            "La réinjection restaure la concentration sans répéter toute la charge.",
          ),
          F(
            "Rappel uniquement après la fermeture.",
            "Il doit intervenir pendant l’exposition opératoire si le seuil est atteint.",
          ),
          F(
            "Même intervalle pour toutes les molécules.",
            "Le rythme dépend de la demi-vie propre à l’antibiotique.",
          ),
        ],
      ),
      qcm(
        "Quels couples molécule-rythme de réinjection correspondent au tableau ?",
        "b00034",
        "Le tableau propose 4 h pour céfazoline et clindamycine, 3 h pour céfuroxime, 2 h pour céfotaxime et amoxicilline-clavulanate, sans rappel du métronidazole.",
        [
          T(
            "Céfazoline : 4 heures.",
            "Sa demi-vie de 2 heures conduit au rappel à deux demi-vies.",
          ),
          F(
            "Céfuroxime : 8 heures.",
            "Avec une demi-vie de 1,5 heure, le céfuroxime doit être réinjecté après 3 heures.",
          ),
          T(
            "Céfotaxime : 2 heures.",
            "Sa demi-vie d’une heure justifie ce rappel.",
          ),
          F(
            "Métronidazole : toutes les heures.",
            "Le tableau indique qu’aucune réinjection n’est nécessaire.",
          ),
          T(
            "Clindamycine : 4 heures.",
            "Cette lincosamide impose le même intervalle de rappel que la céfazoline.",
          ),
        ],
      ),
      qcm(
        "Quels énoncés concernent la prophylaxie d’une césarienne ?",
        "b00030",
        "L’administration avant l’incision améliore le résultat maternel sans effet néonatal défavorable démontré ; attendre le clampage est un ancien dogme.",
        [
          F(
            "L’injection doit toujours attendre le clampage du cordon.",
            "Les recommandations citées privilégient la fenêtre précédant l’incision.",
          ),
          T(
            "La dose peut être donnée dans les 30 minutes avant l’incision.",
            "Cette fenêtre assure la protection maternelle au début du geste.",
          ),
          T(
            "Les complications maternelles diminuent avec le timing pré-incision.",
            "Plusieurs études rapportent ce bénéfice.",
          ),
          T(
            "Le devenir de l’enfant n’est pas modifié dans les données citées.",
            "L’exposition pré-incision n’a pas montré de signal néonatal défavorable.",
          ),
          T(
            "La mise en place de cette pratique a réduit d’environ 67 % les ISO après césarienne.",
            "Administrer l’antibiotique avant l’incision, et non après le clampage du cordon, explique ce gain considérable.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Durée et résistances",
    questions: [
      qcm(
        "Quelles situations ne justifient pas une prolongation postopératoire ?",
        ["b00033", "b00036"],
        "La prophylaxie s’arrête avec le geste ; prothèse, drain, redon ou cathéter ne justifient pas une couverture continue.",
        [
          T(
            "Implantation de matériel prothétique seule.",
            "La gravité potentielle n’apporte aucun bénéfice démontré à une prolongation.",
          ),
          T(
            "Présence d’un drain chirurgical.",
            "Un drain ne constitue pas une indication de prophylaxie jusqu’à son retrait.",
          ),
          T(
            "Redon laissé plusieurs jours.",
            "La poursuite favoriserait surtout la sélection bactérienne.",
          ),
          T(
            "Accès vasculaire maintenu.",
            "Le cathéter n’étend pas la fenêtre de contamination opératoire.",
          ),
          T(
            "Chirurgie propre de longue durée déjà couverte par des réinjections.",
            "Les rappels peropératoires suffisent et la couverture s’achève à la fermeture.",
          ),
        ],
      ),
      qcm(
        "Quels effets écologiques suivent une exposition antibiotique excessive ?",
        ["b00036", "b00038"],
        "Plus l’exposition est fréquente ou longue, plus la sélection de portages résistants augmente, sans gain préventif après fermeture.",
        [
          T(
            "Sélection de bactéries multirésistantes.",
            "La pression antibiotique favorise les souches capables de survivre.",
          ),
          F(
            "Éradication définitive de toutes les résistances.",
            "L’exposition augmente plutôt leur prévalence.",
          ),
          T(
            "Augmentation du portage résistant après quinolone.",
            "Même une dose prophylactique peut modifier le portage.",
          ),
          T(
            "Risque accru avec vancomycine prolongée.",
            "Au-delà de 48 heures, un sur-risque de portage résistant est rapporté.",
          ),
          F(
            "Bénéfice systématique tant qu’un drain reste en place.",
            "Aucun bénéfice n’est démontré pour cette prolongation.",
          ),
        ],
      ),
      qcm(
        "Quels principes encadrent un portage de bactérie multirésistante ?",
        "b00039",
        "Le portage appelle une analyse du germe, de son réservoir et du geste ; il ne déclenche ni large spectre automatique ni règle générale.",
        [
          T(
            "Analyser le profil de résistance.",
            "L’activité de la molécule éventuelle dépend du phénotype précis.",
          ),
          T(
            "Relier le réservoir colonisé à l’incision.",
            "Un portage éloigné du site peut être sans pertinence opératoire.",
          ),
          F(
            "Élargir automatiquement le spectre pour tout porteur.",
            "L’écart au protocole doit rester exceptionnel et ciblé.",
          ),
          T(
            "Considérer la procédure réalisée.",
            "L’ouverture cutanée ou digestive modifie la probabilité d’exposition au germe.",
          ),
          T(
            "Retenir que les données manquent pour affirmer un surrisque d’ISO chez ces porteurs.",
            "Aucune donnée ne montre que les porteurs de germes multirésistants développent davantage d’ISO.",
          ),
        ],
      ),
      qcm(
        "Quelles adaptations peuvent être discutées chez un porteur résistant ?",
        "b00039",
        "La vancomycine peut être cohérente pour SARM et prothèse cutanée ; une BLSE peut compter en chirurgie digestive, sans généralisation faute d’études.",
        [
          F(
            "Céfazoline maintenue seule chez un porteur de SARM avec prothèse.",
            "La méticillino-résistance rend la céphalosporine inactive et fait discuter la vancomycine.",
          ),
          F(
            "Carbapénème pour tout portage de BLSE, quel que soit le geste.",
            "Aucune règle générale ne justifie un élargissement universel.",
          ),
          T(
            "Molécule active à spectre étroit si tube digestif ouvert.",
            "Le portage digestif peut être pertinent lorsque son réservoir est exposé.",
          ),
          F(
            "Aucune discussion multidisciplinaire nécessaire.",
            "L’incertitude impose au contraire une décision documentée.",
          ),
          T(
            "Écart au protocole considéré comme exceptionnel.",
            "Les données sont insuffisantes pour une adaptation systématique.",
          ),
        ],
      ),
      qcm(
        "Quels messages résument l’arrêt de l’antibioprophylaxie ?",
        ["b00032", "b00033", "b00036"],
        "La prophylaxie couvre l’intervention jusqu’à la fermeture et s’arrête ; au-delà, toute poursuite nécessite une indication curative distincte.",
        [
          F(
            "La prescription doit être poursuivie tant qu’un redon draine le site.",
            "Le drainage postopératoire ne prolonge aucune indication prophylactique.",
          ),
          F(
            "La prophylaxie doit durer jusqu’à cicatrisation complète.",
            "La fenêtre ciblée se termine avec la fermeture, pas avec la cicatrisation.",
          ),
          T(
            "Une chirurgie longue peut nécessiter des rappels.",
            "Les réinjections maintiennent l’exposition avant la fermeture.",
          ),
          T(
            "Une infection découverte change la nature de la prescription.",
            "Elle impose une antibiothérapie avec objectif curatif.",
          ),
          F(
            "Un cathéter impose au moins cinq jours de prophylaxie.",
            "Aucun argument ne soutient cette prolongation.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Décontamination ciblée",
    questions: [
      qcm(
        "Quels énoncés concernent le portage nasal de Staphylococcus aureus ?",
        "b00041",
        "Le portage est fréquent, fortement associé au risque d’ISO et peut être dépisté par écouvillonnage nasal avec caractérisation de la souche.",
        [
          T(
            "Il concerne environ 20 à 30 % de la population.",
            "Cette fréquence justifie un dépistage dans certaines chirurgies.",
          ),
          T(
            "Il multiplie par dix le risque d’ISO.",
            "Le portage constitue un déterminant majeur des infections staphylococciques.",
          ),
          T(
            "Un écouvillonnage nasal antérieur permet le dépistage.",
            "La culture et l’antibiogramme caractérisent ensuite la souche.",
          ),
          T(
            "Le portage cutané suit l’importance du portage nasal.",
            "La peau et les mains se recolonisent depuis les fosses nasales, d’où la proportion entre les deux réservoirs.",
          ),
          T(
            "La souche d’ISO concorde souvent avec la souche nasale.",
            "Une concordance de 90 % est rapportée chez les porteurs infectés.",
          ),
        ],
      ),
      qcm(
        "Quels principes décrivent une décolonisation nasale par mupirocine ?",
        ["b00041", "b00042", "b00043"],
        "La mupirocine cible les porteurs, s’administre deux fois par jour pendant cinq jours et ne doit pas devenir universelle en raison des résistances.",
        [
          T(
            "Deux applications nasales quotidiennes.",
            "Le nombre d’applications conditionne le taux d’éradication.",
          ),
          F(
            "Cure unique de vingt-quatre heures.",
            "Le schéma décrit comporte cinq jours d’application nasale.",
          ),
          F(
            "Traitement de tous les opérés sans dépistage.",
            "Une utilisation non ciblée sélectionne des résistances et augmente les coûts.",
          ),
          F(
            "Activité principalement dirigée contre les anaérobies buccaux.",
            "La mupirocine est un topique actif sur les bactéries à Gram positif.",
          ),
          F(
            "Garantie d’absence d’ISO digestive à Gram négatif.",
            "La mupirocine ne couvre ni entérobactéries ni anaérobies.",
          ),
        ],
      ),
      qcm(
        "Quelles chirurgies semblent les plus pertinentes pour une décolonisation ciblée ?",
        ["b00042", "b00043", "b00044"],
        "Le bénéfice et la rentabilité paraissent plus solides en cardiothoracique, neurochirurgie et orthopédie prothétique qu’en chirurgie générale.",
        [
          T(
            "Chirurgie cardiothoracique.",
            "Les infections staphylococciques y ont une forte gravité.",
          ),
          F(
            "Toute chirurgie dermatologique mineure sans matériel.",
            "Le bénéfice économique et infectieux n’est pas établi pour une stratégie universelle.",
          ),
          T(
            "Neurochirurgie.",
            "Elle figure parmi les spécialités non générales où l’impact est plus marqué.",
          ),
          T(
            "Orthopédie avec prothèse.",
            "Une infection du matériel justifie une prévention ciblée chez le porteur.",
          ),
          T(
            "Chirurgie vasculaire prothétique.",
            "Les modèles médicoéconomiques retiennent cette spécialité parmi les indications rentables.",
          ),
        ],
      ),
      qcm(
        "Quelles limites compliquent l’interprétation des études de décontamination ?",
        ["b00042", "b00045"],
        "Les cointerventions empêchent d’attribuer le bénéfice à un seul composant, et les effets écologiques restent insuffisamment connus.",
        [
          F(
            "Toutes les études utilisent la mupirocine seule.",
            "Elle est souvent associée à la chlorhexidine, rendant l’effet propre difficile à isoler.",
          ),
          T(
            "Association fréquente à une décontamination cutanée.",
            "La chlorhexidine peut contribuer au résultat observé.",
          ),
          T(
            "Préparation colique souvent associée aux antibiotiques oraux.",
            "Cette cointervention brouille l’analyse en chirurgie colorectale.",
          ),
          T(
            "Impact des résistances encore incertain.",
            "L’exposition topique ou digestive peut sélectionner des souches résistantes.",
          ),
          T(
            "Résultats discordants sur la réduction des ISO à S. aureus.",
            "Les données de la littérature concernant la mupirocine restent contradictoires.",
          ),
        ],
      ),
      qcm(
        "Quels énoncés concernent la stratégie colorectale orale ?",
        "b00045",
        "Les antibiotiques oraux la veille peuvent compléter la prophylaxie IV, tandis que la préparation colique seule est inefficace ; la stratégie reste discutée.",
        [
          F(
            "La préparation colique isolée réduit à elle seule les infections du site opératoire.",
            "Réalisée seule, la préparation colique a montré son inefficacité sur les ISO.",
          ),
          T(
            "Les antibiotiques oraux peuvent compléter la prophylaxie IV.",
            "Cette association a réduit les ISO dans plusieurs études.",
          ),
          F(
            "La prophylaxie IV devient inutile si un antibiotique oral est donné.",
            "Les données favorables reposent sur une association, non un remplacement automatique.",
          ),
          F(
            "L’impact écologique est parfaitement connu.",
            "L’émergence de résistances demeure une interrogation.",
          ),
          F(
            "Les études disponibles apportent une conclusion définitive sur cette stratégie.",
            "Ces données restent sujettes à controverse et peu de travaux isolent l’effet des antibiotiques oraux.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Endocardite et situations particulières",
    questions: [
      qcm(
        "Quels patients font partie des groupes à haut risque d’endocardite ?",
        "b00047",
        "La prophylaxie dentaire concerne valve ou réparation prothétique, antécédent d’endocardite et cardiopathies congénitales précisément définies.",
        [
          T(
            "Porteur d’une valve prothétique.",
            "Le risque de complication d’une endocardite sur matériel est majeur.",
          ),
          F(
            "Antécédent de rhumatisme articulaire aigu sans séquelle valvulaire.",
            "Les recommandations de 2008-2009 ont restreint la liste aux valves prothétiques, antécédents d’endocardite et cardiopathies congénitales précisées.",
          ),
          F(
            "Hypertension artérielle isolée.",
            "Elle ne figure pas parmi les cardiopathies à haut risque.",
          ),
          F(
            "Prolapsus mitral sans antécédent d’endocardite.",
            "Cette valvulopathie a été retirée des groupes retenus depuis 2008.",
          ),
          F(
            "Communication interauriculaire réparée sans fuite depuis dix ans.",
            "Une réparation ancienne complète sans fuite ne correspond pas au groupe décrit.",
          ),
        ],
      ),
      qcm(
        "Quels gestes dentaires sont concernés par la prophylaxie d’endocardite ?",
        "b00047",
        "Seuls les gestes provoquant une bactériémie par manipulation gingivale, périapicale ou perforation muqueuse sont visés.",
        [
          T(
            "Manipulation de la muqueuse gingivale.",
            "Ce geste peut provoquer une bactériémie orale.",
          ),
          F(
            "Radiographie dentaire simple.",
            "Elle ne traumatise pas la muqueuse et ne relève pas de la prophylaxie.",
          ),
          T(
            "Intervention sur la région périapicale.",
            "La manipulation périapicale fait partie des gestes retenus.",
          ),
          T(
            "Perforation de la muqueuse orale.",
            "Elle expose directement à la flore buccale.",
          ),
          T(
            "Extraction dentaire avec effraction gingivale.",
            "L’extraction traverse la gencive et entre dans les actes retenus.",
          ),
        ],
      ),
      qcm(
        "Quels schémas correspondent à la prophylaxie d’endocardite décrite ?",
        ["b00047", "b00048"],
        "Une dose d’amoxicilline 2 g, orale ou IV, précède le geste ; la clindamycine 600 mg est l’alternative citée en cas d’allergie.",
        [
          T(
            "Amoxicilline 2 g par voie orale.",
            "La voie orale permet une exposition suffisante pour le geste dentaire.",
          ),
          F(
            "Amoxicilline 3 g renouvelée six heures après le geste.",
            "La prophylaxie de l’endocardite se limite à une prise unique précédant l’acte dentaire.",
          ),
          F(
            "Amoxicilline 200 mg pendant dix jours.",
            "Le protocole est une dose prophylactique unique de 2 g.",
          ),
          T(
            "Clindamycine 600 mg en cas d’allergie.",
            "La clindamycine 600 mg est l’alternative prévue en cas d’allergie aux bêtalactamines.",
          ),
          T(
            "Dose unique administrée avant le geste dentaire.",
            "Le schéma prophylactique repose sur une administration ponctuelle précédant l’acte.",
          ),
        ],
      ),
      qcm(
        "Quels énoncés concernent une cardiopathie réparée par matériel prothétique ?",
        "b00047",
        "La période à risque dure six mois après réparation et persiste si une fuite résiduelle demeure ; elle ne s’étend pas automatiquement à vie.",
        [
          T(
            "Les six premiers mois après implantation sont concernés.",
            "L’endothélialisation du matériel n’est pas encore complète.",
          ),
          T(
            "Une fuite résiduelle maintient l’indication.",
            "Le flux anormal au contact du matériel prolonge le risque.",
          ),
          F(
            "Toute réparation complète impose une prophylaxie à vie.",
            "Sans fuite, l’indication liée au matériel cesse après six mois.",
          ),
          F(
            "Aucun geste dentaire ne nécessite de prévention.",
            "Les gestes gingivaux, périapicaux ou perforants restent concernés.",
          ),
          T(
            "Le type de cardiopathie doit être documenté avant prescription.",
            "L’indication dépend de critères anatomiques précis.",
          ),
        ],
      ),
      qcm(
        "Quelles distinctions évitent une confusion entre prophylaxie d’endocardite et prophylaxie chirurgicale ?",
        "b00047",
        "L’endocardite vise quelques cardiopathies lors de gestes dentaires bactériémiants ; les autres interventions suivent leurs protocoles chirurgicaux propres.",
        [
          F(
            "La prophylaxie d’endocardite s’applique à toute valvulopathie connue.",
            "Seules les cardiopathies listées, comme la valve prothétique ou l’antécédent d’endocardite, sont concernées.",
          ),
          T(
            "Le geste dentaire doit être bactériémiant.",
            "Seules certaines manipulations orales sont retenues.",
          ),
          F(
            "Tout acte chirurgical relève de l’amoxicilline 2 g.",
            "Les autres gestes obéissent à une prophylaxie adaptée à leur flore.",
          ),
          F(
            "La prévention de l’endocardite remplace l’antibioprophylaxie chirurgicale habituelle.",
            "Chaque intervention conserve son propre protocole de prévention des infections du site opératoire.",
          ),
          F(
            "Un antécédent d’endocardite dispense de toute asepsie.",
            "L’antibiotique ne remplace jamais les mesures de prévention locales.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Audit et sécurisation",
    questions: [
      qcm(
        "Quels critères doivent figurer dans un audit d’antibioprophylaxie ?",
        ["b00050", "b00051", "b00052"],
        "L’audit évalue indication, molécule, dose, timing, réinjections et arrêt, puis relie les écarts aux mesures correctives.",
        [
          T(
            "Adéquation de la molécule au geste.",
            "Le spectre doit correspondre à la flore exposée.",
          ),
          T(
            "Délai entre injection et incision.",
            "Une bonne molécule donnée trop tôt ou trop tard devient inefficace.",
          ),
          T(
            "Dose administrée.",
            "Une sous-dose compromet la concentration tissulaire.",
          ),
          T(
            "Réalisation des rappels nécessaires.",
            "Une chirurgie longue doit rester couverte jusqu’à la fermeture.",
          ),
          T(
            "Arrêt de la prescription à la fermeture.",
            "La durée est un critère majeur puisque la prolongation reste la dérive la plus fréquente.",
          ),
        ],
      ),
      qcm(
        "Quels résultats décrivent l’enquête canadienne de 2016 ?",
        ["b00050", "b00051"],
        "L’enquête rassemblait 52 centres, 2 082 procédures et retrouvait 91 % de prophylaxies adaptées selon plusieurs critères.",
        [
          T(
            "Participation de 52 centres.",
            "Ce nombre décrit l’ampleur multicentrique de l’enquête.",
          ),
          F(
            "Analyse de seulement 20 procédures.",
            "L’échantillon comptait 2 082 interventions.",
          ),
          F(
            "Enquête limitée à un seul centre universitaire.",
            "L’enquête a réuni 52 établissements répartis à travers le Canada.",
          ),
          T(
            "Conformité globale de 91 %.",
            "La majorité des prescriptions remplissait les critères examinés.",
          ),
          F(
            "Conformité définie uniquement par la molécule.",
            "Dose, délai et réinjections entraient aussi dans l’évaluation.",
          ),
        ],
      ),
      qcm(
        "Quels principes rendent un protocole local réellement opérationnel ?",
        ["b00015", "b00054"],
        "Le protocole est validé localement, immédiatement accessible, lié à l’écologie et révisé par les audits et la surveillance des ISO.",
        [
          T(
            "Accès simple au bloc opératoire.",
            "Une recommandation introuvable ne peut guider une décision urgente.",
          ),
          T(
            "Adaptation aux résistances du service.",
            "L’écologie locale peut modifier l’efficacité du standard.",
          ),
          F(
            "Document figé sans date de révision.",
            "Les techniques et profils de résistance évoluent.",
          ),
          T(
            "Validation médicochirurgicale.",
            "Le protocole doit être partagé par prescripteurs et opérateurs.",
          ),
          T(
            "Réévaluation par audits réguliers.",
            "La mesure des écarts permet de corriger la pratique.",
          ),
        ],
      ),
      qcm(
        "Quelles vérifications appartiennent à la check-list avant incision ?",
        ["b00024", "b00028", "b00031", "b00032"],
        "Avant l’ouverture, l’équipe confirme indication, allergie, molécule, dose, timing, garrot et heure de référence des rappels.",
        [
          T(
            "Indication cohérente avec la classe du geste.",
            "Une prophylaxie inutile expose sans bénéfice.",
          ),
          T(
            "Allergie caractérisée et alternative préparée.",
            "L’anticipation évite un remplacement improvisé et trop tardif.",
          ),
          T(
            "Dose adaptée au poids extrême.",
            "L’obésité peut conduire à doubler certaines bêta-lactamines.",
          ),
          F(
            "Garrot gonflé avant toute injection.",
            "L’antibiotique doit diffuser dans le membre avant l’ischémie.",
          ),
          T(
            "Heure de première dose tracée.",
            "Elle commande les échéances de réinjection.",
          ),
        ],
      ),
      qcm(
        "Quels événements doivent déclencher une analyse de pratique ?",
        ["b00050", "b00052", "b00054"],
        "Une ISO, un retard, une sous-dose, un rappel omis ou une prolongation injustifiée révèlent un écart à analyser collectivement.",
        [
          T(
            "Incision avant la fin de l’injection.",
            "La concentration protectrice n’était pas garantie au début du geste.",
          ),
          T(
            "Rappel omis lors d’une chirurgie prolongée.",
            "La concentration peut tomber sous le seuil efficace avant fermeture.",
          ),
          F(
            "Arrêt correct à la fermeture sans infection.",
            "Cette conduite correspond au principe attendu.",
          ),
          T(
            "Poursuite plusieurs jours pour un drain seul.",
            "Cette prolongation favorise la résistance sans bénéfice démontré.",
          ),
          T(
            "ISO par un germe non couvert de façon répétée.",
            "Le signal peut indiquer une évolution de l’écologie ou une cible inadéquate.",
          ),
        ],
      ),
    ],
  },
];

function buildIsolatedQcm() {
  return ISOLATED_QCM.map((serie, index) => ({
    label: `QCM — Série ${index + 1} · ${serie.title}`,
    allowed_voies: ["interne"],
    questions: serie.questions,
  }));
}

const DP_QCM = [
  {
    title: "Arthroplastie sous garrot chez une patiente obèse",
    vignette:
      "Une femme de 68 ans, 112 kg pour un IMC de 39 kg/m², doit recevoir une prothèse totale de genou. Une céfazoline est prévue et le chirurgien souhaite gonfler le garrot dès l’entrée en salle. La consultation n’a retrouvé ni infection active, ni allergie, ni insuffisance rénale.",
    questions: [
      qcm(
        "Quels éléments imposent de préparer soigneusement la prophylaxie ?",
        ["b00007", "b00028", "b00031"],
        "Le matériel implanté, le garrot et l’obésité exposent respectivement à une forte morbidité infectieuse, un défaut de diffusion et une sous-exposition.",
        [
          T(
            "Implantation d’une prothèse articulaire.",
            "Une infection du matériel aurait des conséquences fonctionnelles majeures.",
          ),
          T(
            "Garrot pneumatique programmé.",
            "L’injection doit être terminée avant l’interruption de la perfusion du membre.",
          ),
          T(
            "Poids supérieur à 100 kg.",
            "Ce seuil participe à l’adaptation des bêta-lactamines.",
          ),
          T(
            "IMC supérieur à 35 kg/m².",
            "L’association poids-IMC justifie ici le doublement de dose.",
          ),
          T(
            "Antécédent de portage nasal de staphylocoque doré.",
            "Le portage multiplie par dix le risque d’ISO et peut justifier une décolonisation ciblée avant prothèse.",
          ),
        ],
      ),
      qcm(
        "Quelle organisation temporelle est correcte ?",
        "b00028",
        "La céfazoline doit être terminée 30 à 60 minutes avant le gonflage du garrot afin d’être déjà présente dans les tissus.",
        [
          F(
            "Poser le garrot dès l’installation puis perfuser la céfazoline.",
            "Le membre exsangue reçoit ensuite très mal la molécule injectée.",
          ),
          T(
            "Viser la fenêtre de 30 à 60 minutes.",
            "Elle assure une concentration efficace à l’ouverture.",
          ),
          F(
            "Injecter après le gonflage pour prolonger l’effet.",
            "Le garrot empêcherait l’antibiotique d’atteindre correctement le site.",
          ),
          T(
            "Tracer l’heure de fin d’administration.",
            "Cette donnée vérifie la fenêtre et servira au calcul du rappel.",
          ),
          F(
            "Attendre la fermeture pour administrer la première dose.",
            "La contamination survient dès l’incision.",
          ),
        ],
        "Le programme confirme une incision à 8 h 30 et un gonflage du garrot à 8 h 20.",
      ),
      qcm(
        "Quels principes guident la dose de céfazoline ?",
        "b00031",
        "Le poids et l’IMC dépassent les deux seuils cités : la bêta-lactamine doit être doublée par rapport à la dose adulte standard.",
        [
          T(
            "Doubler la bêta-lactamine dans ce terrain.",
            "Le poids > 100 kg et l’IMC > 35 exposent à une sous-concentration.",
          ),
          F(
            "Réduire la dose pour prévenir toute toxicité.",
            "Une réduction compromettrait l’exposition tissulaire recherchée.",
          ),
          T(
            "Conserver une stratégie standardisée et tracée.",
            "La dose adaptée doit rester simple à vérifier par l’équipe.",
          ),
          F(
            "Calculer la céfazoline comme la gentamicine au poids réel exact.",
            "Le texte distingue le doublement des bêta-lactamines du calcul pondéral de gentamicine.",
          ),
          T(
            "Vérifier que le poids est récent.",
            "Une donnée erronée pourrait conduire à une adaptation inadéquate.",
          ),
        ],
        "Le dossier affiche encore un ancien poids de 89 kg, alors que la pesée préopératoire confirme 112 kg.",
      ),
      qcm(
        "Quels événements justifient une réinjection ?",
        ["b00032", "b00034"],
        "La céfazoline est rappelée à deux demi-vies, soit quatre heures dans le tableau, en prenant pour origine la première injection.",
        [
          F(
            "Atteinte de deux heures depuis la première dose.",
            "La céfazoline est rappelée toutes les quatre heures selon le tableau, soit deux demi-vies.",
          ),
          T(
            "Intervention encore en cours à l’échéance.",
            "Le site doit rester couvert jusqu’à la fermeture.",
          ),
          F(
            "Calcul de quatre heures depuis l’incision seulement.",
            "Le point de départ est l’administration initiale.",
          ),
          T(
            "Dose de rappel égale à la moitié de la charge.",
            "La réinjection restaure la concentration sans répéter la dose initiale.",
          ),
          F(
            "Présence de la prothèse après fermeture.",
            "Le matériel n’impose pas de rappel postopératoire continu.",
          ),
        ],
        "Une complication vasculaire prolonge l’intervention ; quatre heures se sont écoulées depuis la fin de la première perfusion.",
      ),
      qcm(
        "Quelles conduites restent adaptées après la fermeture ?",
        ["b00033", "b00036"],
        "La prophylaxie s’arrête avec la fermeture ; ni prothèse ni drain ne justifient une poursuite en l’absence d’infection.",
        [
          T(
            "Arrêter la céfazoline après couverture de la fermeture.",
            "La fenêtre de contamination opératoire est terminée.",
          ),
          F(
            "Poursuivre jusqu’à ablation du drain.",
            "Le drain n’est pas une indication de prolongation.",
          ),
          F(
            "Maintenir sept jours à cause de la prothèse.",
            "Aucun bénéfice n’est démontré pour le matériel implanté.",
          ),
          T(
            "Tracer la dose de rappel réalisée.",
            "La chronologie complète permet l’audit de la couverture.",
          ),
          T(
            "Surveiller cliniquement sans antibiotique préventif continu.",
            "La surveillance postopératoire ne nécessite pas une exposition inutile.",
          ),
        ],
        "La fermeture est obtenue, une prothèse est en place et un drain aspiratif est laissé pour 48 heures.",
      ),
      qcm(
        "Quels constats soutiennent une analyse de l’événement ?",
        ["b00050", "b00052", "b00054"],
        "L’audit doit vérifier timing réel, poids saisi, dose adaptée, rappel et arrêt, puis corriger les barrières du système.",
        [
          T(
            "Ancien poids conservé dans le dossier.",
            "La donnée obsolète aurait pu provoquer une sous-dose.",
          ),
          T(
            "Heure du garrot proche de l’injection.",
            "La diffusion tissulaire pouvait être incomplète.",
          ),
          T(
            "Rappel rendu nécessaire par la prolongation.",
            "L’échéance doit être anticipée et documentée.",
          ),
          T(
            "Vérification de la dose reçue au regard du poids corrigé.",
            "Une correction tardive expose à une administration calculée sur une valeur erronée.",
          ),
          T(
            "Mise à jour de la check-list pondérale.",
            "Une barrière système prévient la répétition de l’erreur.",
          ),
        ],
        "La revue de dossier montre que l’équipe a corrigé le poids juste avant l’injection et a retardé le garrot de dix minutes.",
      ),
      qcm(
        "Quels messages doivent apparaître dans le compte rendu ?",
        ["b00028", "b00031", "b00032", "b00036"],
        "Le compte rendu relie indication, poids, dose, timing avant garrot, rappel et arrêt à la fermeture sans créer une fausse indication prolongée.",
        [
          T(
            "Dose adaptée à 112 kg et IMC 39.",
            "Le terrain explique la majoration de bêta-lactamine.",
          ),
          T(
            "Injection terminée avant gonflage du garrot.",
            "Cette donnée prouve la diffusion préalable.",
          ),
          T(
            "Heure et demi-dose de réinjection.",
            "La chirurgie longue a nécessité le maintien pharmacocinétique.",
          ),
          T(
            "Arrêt à la fermeture malgré le drain.",
            "Cette conduite respecte la durée minimale.",
          ),
          T(
            "Motif prophylactique clairement distingué d’une antibiothérapie curative.",
            "La distinction évite qu’une prescription préventive soit poursuivie comme un traitement.",
          ),
        ],
        "La patiente quitte la salle de réveil sans complication ; le dossier est complété pour l’audit trimestriel.",
      ),
    ],
  },
  {
    title: "Allergie ancienne avant chirurgie colorectale",
    vignette:
      "Un homme de 57 ans doit subir une colectomie réglée. Son dossier mentionne « allergie pénicilline » après une éruption survenue dans l’enfance, sans autre précision. Il est apyrétique, son bilan infectieux est négatif et le geste comporte une ouverture colique contrôlée.",
    questions: [
      qcm(
        "Quels éléments doivent être recherchés avant de choisir l’antibiotique ?",
        ["b00013", "b00024"],
        "La chirurgie expose à entérobactéries et anaérobies ; l’étiquette allergique doit être reconstruite par sa chronologie et sa sémiologie.",
        [
          T(
            "Délai entre prise et éruption.",
            "La temporalité aide à distinguer une hypersensibilité immédiate d’une réaction retardée.",
          ),
          T(
            "Signes respiratoires ou circulatoires associés.",
            "Ils rechercheraient une anaphylaxie vraie.",
          ),
          T(
            "Contexte viral au moment de l’éruption.",
            "Une virose peut expliquer une éruption non allergique.",
          ),
          T(
            "Flore colique attendue.",
            "La procédure expose aux entérobactéries et aux anaérobies.",
          ),
          T(
            "Nature exacte de la molécule incriminée.",
            "La réactivité croisée dépend de la chaîne latérale R1 plus que de la famille.",
          ),
        ],
      ),
      qcm(
        "Comment interpréter cette information ?",
        "b00024",
        "Une éruption isolée tardive en contexte viral ne suffit pas à prouver une allergie IgE ; l’étiquette doit être nuancée.",
        [
          F(
            "Le délai de cinq jours plaide pour un mécanisme IgE immédiat.",
            "Une hypersensibilité immédiate survient dans les minutes suivant l’administration.",
          ),
          F(
            "Une éruption isolée suffit à établir le diagnostic d’allergie médicamenteuse.",
            "Un exanthème tardif en contexte viral impose des explorations avant toute conclusion.",
          ),
          F(
            "Une anaphylaxie certaine doit être inscrite.",
            "Aucune détresse respiratoire ou circulatoire n’a été rapportée.",
          ),
          T(
            "L’alternative doit être choisie avant le bloc.",
            "La consultation est le temps de sécuriser le protocole.",
          ),
          F(
            "Toute céphalosporine est définitivement interdite.",
            "Les croisements modernes sont faibles et liés aux chaînes latérales.",
          ),
        ],
        "La famille décrit un exanthème apparu au cinquième jour d’amoxicilline pendant une mononucléose, sans dyspnée ni malaise.",
      ),
      qcm(
        "Quels énoncés expliquent la réactivité croisée ?",
        "b00024",
        "La chaîne latérale R1, davantage que le noyau bêta-lactame, porte le risque ; les données modernes citées sont inférieures à 1 %.",
        [
          F(
            "Le degré de purification actuel supprime tout risque de réaction croisée.",
            "Des épitopes de chaîne latérale communs peuvent encore être reconnus malgré une purification améliorée.",
          ),
          F(
            "Le cycle bêta-lactame provoque toujours le croisement.",
            "Le texte réfute ce mécanisme unique.",
          ),
          F(
            "Les anciens taux de 15 % sont confirmés par les études récentes.",
            "Les travaux modernes rapportent une réactivité croisée inférieure à 1 %.",
          ),
          T(
            "Le taux récent cité est inférieur à 1 %.",
            "Cette estimation réduit l’exclusion automatique des céphalosporines.",
          ),
          F(
            "Aucune analyse de la molécule n’est utile.",
            "La structure de la chaîne latérale participe au choix.",
          ),
        ],
        "L’anesthésiste explique que les réactions croisées ne dépendent pas simplement de l’appartenance à la famille bêta-lactamine.",
      ),
      qcm(
        "Quels objectifs microbiologiques doivent rester couverts ?",
        ["b00013", "b00022", "b00023"],
        "Le protocole doit couvrir la flore colorectale, notamment entérobactéries et anaérobies, avec le spectre efficace le plus étroit.",
        [
          T(
            "Entérobactéries.",
            "Elles sont largement représentées dans le tube digestif.",
          ),
          F(
            "Levures du genre Candida.",
            "Le spectre antibactérien du protocole colorectal ignore les champignons.",
          ),
          F(
            "Virus respiratoires exclusivement.",
            "Ils ne constituent pas la cible de cette prophylaxie antibiotique.",
          ),
          T(
            "Spectre limité aux germes plausibles.",
            "Un élargissement inutile augmente la pression de sélection.",
          ),
          F(
            "Stérilisation de toute la flore digestive.",
            "Le but est d’empêcher la multiplication de l’inoculum opératoire.",
          ),
        ],
        "Le chirurgien confirme une ouverture colique avec anastomose et absence de perforation ou d’infection constituée.",
      ),
      qcm(
        "Quels principes concernent le timing de l’administration ?",
        ["b00028", "b00029"],
        "La dose doit précéder l’incision de 30 à 60 minutes et rester identifiable par rapport aux produits d’induction.",
        [
          F(
            "Débuter la perfusion au moment de l’ouverture cutanée.",
            "La concentration protectrice doit déjà être atteinte lorsque le bistouri entame les tissus.",
          ),
          F(
            "Retenir une fenêtre de trois à quatre heures avant l’incision.",
            "Le délai recommandé se situe entre 30 et 60 minutes, une injection trop précoce augmentant le risque d’ISO.",
          ),
          T(
            "Séparer autant que possible de l’induction.",
            "Cette organisation aide à identifier un éventuel allergène.",
          ),
          F(
            "Administrer seulement après l’anastomose.",
            "La contamination aurait déjà eu lieu.",
          ),
          F(
            "Omettre la surveillance car la réaction ancienne était bénigne.",
            "Toute administration IV impose une préparation aux réactions immédiates.",
          ),
        ],
        "L’équipe choisit un protocole validé après revue de l’allergie et programme l’injection avant l’arrivée au bloc.",
      ),
      qcm(
        "Quelles conduites sont adaptées si une urticaire apparaît pendant la perfusion ?",
        ["b00024", "b00029"],
        "La perfusion est interrompue, la réaction évaluée et traitée ; la chronologie séparée de l’induction facilite l’imputabilité.",
        [
          T(
            "Interrompre l’antibiotique suspect.",
            "La poursuite pourrait aggraver une hypersensibilité.",
          ),
          T(
            "Évaluer respiration et circulation.",
            "Une urticaire peut précéder une anaphylaxie systémique.",
          ),
          T(
            "Tracer l’heure et les symptômes.",
            "Une documentation précise guidera l’exploration allergologique.",
          ),
          T(
            "Préparer le traitement d’une anaphylaxie éventuelle.",
            "Adrénaline et remplissage doivent être immédiatement disponibles si la réaction s’aggrave.",
          ),
          T(
            "Choisir une alternative compatible avec la flore colique.",
            "La protection doit rester microbiologiquement cohérente si le geste est maintenu.",
          ),
        ],
        "Dix minutes après le début de la perfusion, une urticaire diffuse apparaît sans hypotension ni bronchospasme ; aucun agent d’induction n’a encore été injecté.",
      ),
      qcm(
        "Quels éléments doivent figurer dans la transmission finale ?",
        "b00024",
        "La transmission distingue l’ancienne éruption non prouvée de la réaction actuelle, précise la molécule et évite les étiquettes globales.",
        [
          T(
            "Nom exact de l’antibiotique administré.",
            "L’allergologie nécessite l’identification moléculaire précise.",
          ),
          F(
            "Diagnostic d’allergie affirmé sans exploration ultérieure.",
            "Le courrier doit orienter vers un bilan allergologique et non clore la question.",
          ),
          T(
            "Absence d’hypotension et de bronchospasme.",
            "La sévérité réelle doit être documentée.",
          ),
          T(
            "Alternative reçue sans réaction.",
            "Cette tolérance peut guider une prise en charge future.",
          ),
          F(
            "Mention vague « allergique à tous les antibiotiques ».",
            "Cette formulation empêcherait des choix ciblés et sûrs.",
          ),
        ],
        "L’intervention est reportée pour exploration ; le patient récupère et reçoit un courrier détaillé.",
      ),
    ],
  },
  {
    title: "Colectomie prolongée avec rappels omis",
    vignette:
      "Une femme de 72 ans est opérée d’une colectomie. L’amoxicilline-acide clavulanique est injectée à 7 h 30 ; l’incision a lieu à 8 h et la fermeture est prévue vers midi. Aucune infection n’est présente, mais le bloc ne dispose ni d’alerte de rappel ni d’horaire de réinjection prescrit.",
    questions: [
      qcm(
        "Quels objectifs pharmacologiques doivent être atteints ?",
        ["b00025", "b00026", "b00032"],
        "La concentration doit dépasser les CMI des germes ciblés dès l’incision et rester suffisante jusqu’à la fermeture.",
        [
          T(
            "Concentration efficace à 8 h.",
            "L’incision ouvre la fenêtre de contamination.",
          ),
          F(
            "Maintien de l’exposition pendant les cinq jours postopératoires.",
            "Le besoin préventif prend fin avec la fermeture cutanée.",
          ),
          T(
            "Couverture des bactéries colorectales attendues.",
            "Le spectre doit correspondre à l’ouverture digestive.",
          ),
          F(
            "Éradication de toute la flore après l’hospitalisation.",
            "La prophylaxie ne vise pas une stérilisation durable.",
          ),
          F(
            "Concentration uniquement urinaire.",
            "Le site cible est le tissu opératoire.",
          ),
        ],
      ),
      qcm(
        "Quand faut-il programmer le premier rappel ?",
        ["b00032", "b00034"],
        "L’association a une demi-vie d’une heure et un rythme de rappel de deux heures depuis la première injection, soit 9 h 30.",
        [
          T(
            "À 9 h 30.",
            "Deux heures se sont écoulées depuis la dose initiale de 7 h 30.",
          ),
          F(
            "À 10 h, deux heures après l’incision.",
            "Le calcul part de l’injection, non de l’incision.",
          ),
          F(
            "Après la fermeture cutanée pour prolonger la couverture.",
            "Le rappel protège la période opératoire et perd son objet une fois le site refermé.",
          ),
          F(
            "Seulement si une fièvre apparaît.",
            "La réinjection est pharmacocinétique, pas déclenchée par une infection.",
          ),
          T(
            "Avec une alerte anticipée de la check-list.",
            "La programmation prévient l’oubli pendant un temps opératoire complexe.",
          ),
        ],
        "Le tableau opératoire indique une demi-vie d’une heure et un rythme de réinjection toutes les deux heures.",
      ),
      qcm(
        "Quelle dose de rappel est attendue ?",
        "b00032",
        "Chaque rappel utilise la moitié de la dose initiale, sans répéter la charge complète.",
        [
          T(
            "La moitié de la dose donnée à 7 h 30.",
            "Cette quantité restaure l’exposition attendue.",
          ),
          F(
            "Le double de la dose initiale.",
            "Une nouvelle charge complète serait inutile.",
          ),
          T(
            "Une dose consignée avec son heure.",
            "La traçabilité permet de calculer l’échéance suivante.",
          ),
          T(
            "Une dose calculée depuis l’administration précédente.",
            "L’intervalle de rappel se compte à partir de l’injection antérieure, non de l’incision.",
          ),
          T(
            "Une dose conforme au protocole local.",
            "Le tableau doit être traduit en prescription opérationnelle.",
          ),
        ],
        "La première dose était de 2 g et l’intervention se poursuit sans signe infectieux.",
      ),
      qcm(
        "Quels risques crée l’omission de ce rappel ?",
        "b00032",
        "L’oubli expose à une concentration tissulaire basse avant fermeture et à une augmentation du risque d’ISO.",
        [
          F(
            "Concentration tissulaire encore supérieure à la CMI après quatre heures.",
            "Deux demi-vies écoulées font chuter la concentration sous le seuil efficace.",
          ),
          T(
            "Protection insuffisante de la fermeture.",
            "La concentration finale est corrélée au risque infectieux.",
          ),
          F(
            "Résistance évitée avec certitude par l’omission.",
            "Ne pas couvrir le geste n’est pas une stratégie écologique sûre.",
          ),
          F(
            "Indication devenue curative du fait de l’omission.",
            "L’absence de rappel crée un défaut de couverture, pas une infection à traiter.",
          ),
          F(
            "Transformation automatique en allergie.",
            "L’omission n’a aucun mécanisme hypersensible.",
          ),
        ],
        "À 10 h 45, l’équipe découvre qu’aucun rappel n’a été administré et que la chirurgie se prolongera encore une heure.",
      ),
      qcm(
        "Quelles actions immédiates sont cohérentes ?",
        ["b00025", "b00032"],
        "L’équipe corrige le retard selon le protocole, documente l’écart et maintient une exposition jusqu’à la fermeture sans prolongation arbitraire.",
        [
          T(
            "Administrer le rappel indiqué dès l’identification.",
            "Le site reste ouvert et doit retrouver une concentration efficace.",
          ),
          T(
            "Tracer le retard réel.",
            "La chronologie permettra l’analyse de causalité et de processus.",
          ),
          T(
            "Recalculer l’échéance si la chirurgie continue.",
            "Toute dose devient un nouveau repère pharmacocinétique.",
          ),
          F(
            "Programmer sept jours systématiques.",
            "Une erreur de timing ne justifie pas une prolongation postopératoire.",
          ),
          T(
            "Informer le chirurgien et l’anesthésiste responsables.",
            "La décision et la surveillance doivent être partagées.",
          ),
        ],
        "La patiente reste stable et aucune contamination macroscopique nouvelle n’est constatée.",
      ),
      qcm(
        "Quels facteurs système expliquent plausiblement l’oubli ?",
        ["b00050", "b00052"],
        "Une alerte absente, une prescription non horodatée et une responsabilité floue sont des causes corrigibles par l’organisation.",
        [
          T(
            "Aucune alerte automatique à deux heures.",
            "L’échéance dépendait de la mémoire de l’équipe.",
          ),
          T(
            "Heure de première dose mal visible.",
            "Le calcul devenait difficile au milieu de l’intervention.",
          ),
          T(
            "Responsabilité du rappel non attribuée.",
            "Une tâche sans responsable identifié est facilement omise.",
          ),
          T(
            "Absence d’affichage du tableau des rythmes de réinjection en salle.",
            "Sans support visible, la conversion de la demi-vie en horaire dépend de la mémoire individuelle.",
          ),
          T(
            "Absence de contrôle dans la check-list.",
            "Un point de vérification aurait révélé l’échéance.",
          ),
        ],
        "La revue montre que la prescription mentionnait « réinjecter si besoin » sans heure ni alerte.",
      ),
      qcm(
        "Quelles mesures de prévention doivent être retenues ?",
        ["b00050", "b00052", "b00054"],
        "Le protocole doit convertir la demi-vie en horaires explicites, afficher l’heure initiale et intégrer un contrôle partagé.",
        [
          T(
            "Prescription horodatée des rappels.",
            "Elle transforme une règle abstraite en action planifiée.",
          ),
          T(
            "Alerte calculée depuis la première dose.",
            "Le bon point de départ devient automatique.",
          ),
          T(
            "Vérification avant fermeture.",
            "Elle confirme que la concentration finale a été couverte.",
          ),
          T(
            "Audit périodique des rappels omis.",
            "La mesure vérifie l’efficacité des corrections.",
          ),
          T(
            "Formation de l’équipe au calcul des deux demi-vies.",
            "Comprendre la règle pharmacocinétique rend la vérification plus fiable qu’une consigne mémorisée.",
          ),
        ],
        "La patiente ne développe pas d’ISO ; le cas est présenté à la réunion qualité du bloc.",
      ),
    ],
  },
  {
    title: "Portage de SARM avant chirurgie prothétique",
    vignette:
      "Un homme de 74 ans porteur nasal de SARM doit bénéficier d’un remplacement valvulaire avec implantation de matériel prothétique. Il n’a pas d’infection active. Le dépistage a été réalisé dix jours avant le geste et l’antibiogramme est disponible pour la réunion médicochirurgicale.",
    questions: [
      qcm(
        "Quels éléments rendent le portage pertinent pour le geste ?",
        "b00039",
        "Le réservoir nasal-cutané, l’ouverture cutanée et le matériel prothétique relient directement le SARM au risque opératoire.",
        [
          T(
            "Portage d’un staphylocoque résistant.",
            "Le germe peut contaminer une incision cutanée.",
          ),
          T(
            "Ouverture cutanée.",
            "Le réservoir cutané devient anatomiquement pertinent.",
          ),
          T(
            "Implantation de matériel.",
            "Une infection prothétique aurait une gravité majeure.",
          ),
          T(
            "Proximité entre le réservoir nasal et le site d’incision.",
            "Une incision voisine des fosses nasales reçoit un inoculum plus direct que la chirurgie d’un membre.",
          ),
          T(
            "Profil de résistance connu.",
            "Il permet de choisir une molécule active si adaptation retenue.",
          ),
        ],
      ),
      qcm(
        "Quelle adaptation peut être discutée ?",
        "b00039",
        "La vancomycine peut être intégrée pour ce portage de SARM lors d’une chirurgie cutanée avec prothèse.",
        [
          T(
            "Vancomycine adaptée au portage SARM.",
            "La vancomycine couvre le SARM identifié lors d’une chirurgie cutanée avec implantation prothétique.",
          ),
          F(
            "Fluoroquinolone systématique en monothérapie.",
            "Elle ne cible pas de façon fiable ce SARM et sélectionne des résistances.",
          ),
          T(
            "Décision documentée comme écart ciblé.",
            "L’adaptation repose sur un germe, un réservoir et un geste cohérents.",
          ),
          T(
            "Dose de vancomycine calculée sur le poids réel.",
            "Vancomycine et gentamicine sont toujours posologiées selon le poids réel du patient.",
          ),
          T(
            "Maintien du spectre le plus étroit possible.",
            "L’élargissement doit se limiter au risque identifié.",
          ),
        ],
        "La réunion médicochirurgicale confirme que la souche est sensible à la vancomycine.",
      ),
      qcm(
        "Quels principes concernent une décolonisation nasale ?",
        ["b00041", "b00043", "b00044"],
        "Le dépistage positif et la chirurgie cardiaque rendent une cure ciblée de mupirocine pertinente, sans en faire un protocole universel.",
        [
          T(
            "Mupirocine deux fois par jour.",
            "Le schéma cité dépend du nombre d’applications.",
          ),
          T(
            "Durée de cinq jours.",
            "Cette durée est associée à l’éradication du portage.",
          ),
          T(
            "Indication ciblée en chirurgie cardiaque.",
            "Cette spécialité figure parmi les situations les plus pertinentes.",
          ),
          F(
            "Décontamination de tous les patients sans dépistage.",
            "L’usage universel favorise résistance et surcoût.",
          ),
          F(
            "Remplacement de la prophylaxie IV par la mupirocine seule.",
            "La décolonisation complète, mais ne remplace pas, la protection opératoire.",
          ),
        ],
        "Le dépistage a été réalisé dix jours avant l’opération et permet de commencer une cure complète.",
      ),
      qcm(
        "Quels paramètres doivent être surveillés pendant l’administration adaptée ?",
        ["b00028", "b00031", "b00038"],
        "L’équipe surveille timing, dose pondérale de vancomycine, tolérance et évite toute prolongation écologique inutile.",
        [
          F(
            "Dose forfaitaire identique quel que soit le poids.",
            "La vancomycine fait partie des molécules dont la posologie suit toujours le poids réel.",
          ),
          T(
            "Administration achevée avant l’incision.",
            "La concentration tissulaire doit être protectrice à l’ouverture.",
          ),
          T(
            "Réaction d’hypersensibilité ou de perfusion.",
            "Toute administration IV nécessite une surveillance clinique.",
          ),
          F(
            "Poursuite automatique au-delà de 48 heures.",
            "Une vancomycine prolongée augmente le portage résistant.",
          ),
          T(
            "Traçabilité du motif SARM-prothèse.",
            "L’écart au standard doit être compréhensible lors de l’audit.",
          ),
        ],
        "Le patient pèse 86 kg et la perfusion de vancomycine est programmée avant l’entrée en salle.",
      ),
      qcm(
        "Quelles conduites sont adaptées après fermeture ?",
        ["b00036", "b00038"],
        "L’antibiotique prophylactique est arrêté ; la présence de matériel ne justifie pas une vancomycine continue.",
        [
          F(
            "Prescription d’une dose supplémentaire à l’arrivée en réanimation.",
            "La contamination opératoire s’achève à la fermeture et aucune dose postopératoire n’est justifiée.",
          ),
          F(
            "Vancomycine jusqu’à cicatrisation sternale.",
            "Cette prolongation sélectionne les résistances sans bénéfice démontré.",
          ),
          T(
            "Surveillance clinique de l’infection.",
            "Le risque prothétique justifie une vigilance, non une exposition permanente.",
          ),
          F(
            "Assimilation du portage à une endocardite.",
            "Aucune infection valvulaire n’est diagnostiquée.",
          ),
          T(
            "Traçabilité de la décolonisation réalisée.",
            "Elle permettra d’évaluer la stratégie ciblée.",
          ),
        ],
        "La chirurgie est terminée sans contamination ni signe infectieux ; une prothèse valvulaire est en place.",
      ),
      qcm(
        "Quels éléments doivent faire suspecter un échec de décolonisation ?",
        ["b00041", "b00043"],
        "Une observance incomplète ou une résistance à la mupirocine peut maintenir le portage ; un contrôle microbiologique peut le montrer.",
        [
          T(
            "Applications nasales manquées.",
            "L’efficacité dépend du nombre d’administrations.",
          ),
          F(
            "Souche sensible à la mupirocine documentée avant la cure.",
            "Une sensibilité conservée oriente vers un défaut d’application plutôt que vers un échec microbiologique.",
          ),
          F(
            "Écouvillonnage de contrôle revenu négatif.",
            "Un contrôle négatif témoigne d’une éradication obtenue et non d’un échec.",
          ),
          F(
            "Absence de fièvre postopératoire immédiate.",
            "Elle ne prouve pas l’éradication microbiologique.",
          ),
          F(
            "Dose IV correcte de vancomycine.",
            "La prophylaxie systémique n’assure pas une décolonisation nasale durable.",
          ),
        ],
        "Le contrôle nasal réalisé à l’admission reste positif malgré une cure annoncée complète.",
      ),
      qcm(
        "Quels enseignements qualité ressortent de ce dossier ?",
        ["b00039", "b00043", "b00052"],
        "La stratégie doit relier dépistage, observance, résistance, adaptation prophylactique et arrêt, puis être évaluée dans les indications ciblées.",
        [
          T(
            "Vérifier l’observance de la mupirocine.",
            "Un protocole prescrit mais non réalisé ne peut être évalué correctement.",
          ),
          T(
            "Conserver l’adaptation au SARM comme décision ciblée.",
            "Le lien anatomique et prothétique justifie l’écart.",
          ),
          T(
            "Éviter d’étendre le protocole à tous les opérés.",
            "La généralisation augmenterait résistances et coûts.",
          ),
          T(
            "Auditer les infections et les résistances locales.",
            "Ces résultats déterminent la pertinence future du protocole.",
          ),
          F(
            "Conclure que tout portage exige un traitement curatif.",
            "La colonisation ne constitue pas une infection active.",
          ),
        ],
        "Le comité d’antibiotiques revoit le protocole après plusieurs échecs d’observance identifiés dans le service.",
      ),
    ],
  },
  {
    title: "Césarienne et timing retardé",
    vignette:
      "Une femme de 32 ans doit subir une césarienne programmée. L’équipe prévoit encore d’attendre le clampage du cordon pour administrer l’antibiotique. La patiente est apyrétique, les membranes sont intactes et aucune infection maternelle ou fœtale n’est suspectée.",
    questions: [
      qcm(
        "Quels arguments soutiennent une administration avant l’incision ?",
        "b00030",
        "Les recommandations et études citées montrent moins de complications maternelles sans altération du devenir néonatal.",
        [
          F(
            "Réduction démontrée de la mortalité néonatale.",
            "Les études citées portent sur les complications maternelles, sans bénéfice néonatal démontré.",
          ),
          F(
            "Nécessité d’attendre le clampage du cordon avant d’injecter.",
            "Les sociétés savantes citées recommandent l’administration dans les 30 minutes précédant l’incision.",
          ),
          T(
            "Protection présente dès l’ouverture.",
            "La contamination maternelle commence à l’incision.",
          ),
          F(
            "Preuve d’une toxicité néonatale systématique.",
            "Aucune dégradation du devenir de l’enfant n’est décrite.",
          ),
          F(
            "Absence totale de bénéfice maternel.",
            "L’amélioration maternelle est précisément l’argument du changement.",
          ),
        ],
      ),
      qcm(
        "Quelle fenêtre doit être retenue ?",
        ["b00028", "b00030"],
        "La dose est administrée dans les 30 minutes précédant l’incision pour la césarienne, à l’intérieur de la fenêtre générale de 60 minutes.",
        [
          T(
            "Dans les 30 minutes avant l’incision.",
            "C’est le repère spécifique cité pour la césarienne.",
          ),
          F(
            "Uniquement après le clampage.",
            "Cette pratique retarde la protection maternelle.",
          ),
          F(
            "Avec une dose répétée toutes les heures jusqu’à l’extraction.",
            "Une césarienne courte relève d’une dose unique administrée avant l’incision.",
          ),
          F(
            "La veille au soir sans nouvelle dose.",
            "Une administration trop précoce ne couvrerait pas l’incision.",
          ),
          T(
            "Avant toute diminution de perfusion locale.",
            "La diffusion tissulaire doit précéder l’exposition opératoire.",
          ),
        ],
        "L’incision est planifiée à 9 h et l’enfant devrait être extrait quelques minutes plus tard.",
      ),
      qcm(
        "Pourquoi ne pas injecter simultanément tous les agents d’induction ?",
        "b00029",
        "Séparer l’antibiotique améliore l’identification du médicament causal si une anaphylaxie survient.",
        [
          F(
            "Effet pharmacologique renforcé par l’association aux hypnotiques.",
            "La séparation vise l’imputabilité allergique et non une potentialisation de l’antibiotique.",
          ),
          F(
            "Réduction du risque allergique lié à l’antibiotique.",
            "Le risque de réaction demeure identique, seule son identification devient plus simple.",
          ),
          F(
            "Suppression de toute surveillance.",
            "Une réaction peut toujours survenir malgré la séparation.",
          ),
          F(
            "Autorisation d’injecter après l’incision.",
            "La séparation ne doit pas compromettre la fenêtre préopératoire.",
          ),
          T(
            "Traçabilité plus claire des expositions.",
            "Chaque produit possède une heure identifiable.",
          ),
        ],
        "Le protocole du bloc propose désormais une injection dans l’unité préopératoire, avant les produits anesthésiques.",
      ),
      qcm(
        "Quelles conduites sont adaptées devant une hypotension pendant l’injection ?",
        ["b00024", "b00029"],
        "L’équipe interrompt le médicament, traite une possible anaphylaxie et documente la chronologie avant de rediscuter la chirurgie.",
        [
          T(
            "Interrompre l’antibiotique.",
            "La poursuite pourrait aggraver la réaction.",
          ),
          T(
            "Évaluer voies aériennes, ventilation et circulation.",
            "L’hypotension peut traduire une anaphylaxie sévère.",
          ),
          T(
            "Tracer l’absence d’autre médicament injecté.",
            "Cette information renforce l’imputabilité de l’antibiotique.",
          ),
          T(
            "Administrer de l’adrénaline si l’anaphylaxie est confirmée.",
            "Le traitement de première intention d’une réaction sévère est adrénergique.",
          ),
          T(
            "Reporter l’incision si l’état l’exige.",
            "Une chirurgie programmée ne doit pas débuter chez une patiente instable.",
          ),
        ],
        "Avant l’induction, la patiente développe urticaire, toux et chute tensionnelle pendant la perfusion.",
      ),
      qcm(
        "Quels éléments doivent être recueillis pour l’exploration allergologique ?",
        "b00024",
        "Le dossier précise molécule, délai, signes, durée, traitements et évolution pour distinguer une hypersensibilité réelle.",
        [
          T(
            "Nom et dose de l’antibiotique.",
            "L’identification exacte est indispensable à l’analyse.",
          ),
          T(
            "Délai d’apparition des signes.",
            "La réaction immédiate oriente vers un mécanisme IgE ou apparenté.",
          ),
          T(
            "Manifestations cutanées, respiratoires et circulatoires.",
            "La sévérité doit être objectivée par systèmes.",
          ),
          T(
            "Traitement administré et réponse.",
            "L’évolution complète la caractérisation.",
          ),
          F(
            "Étiquette vague sans compte rendu.",
            "Une mention imprécise compromettrait les futures anesthésies.",
          ),
        ],
        "La césarienne est reprogrammée après stabilisation et une consultation d’allergo-anesthésie est organisée.",
      ),
      qcm(
        "Quels principes guident l’alternative lors de la nouvelle intervention ?",
        ["b00022", "b00023", "b00024"],
        "L’alternative doit couvrir la flore de la césarienne, rester étroite, être préparée en amont et respecter le même timing.",
        [
          T(
            "Activité sur les bactéries attendues.",
            "Le changement pour allergie ne doit pas sacrifier l’efficacité microbiologique.",
          ),
          T(
            "Spectre le plus étroit efficace.",
            "Une allergie ne justifie pas un élargissement non ciblé.",
          ),
          T(
            "Décision avant le jour du bloc.",
            "L’anticipation sécurise dose et disponibilité.",
          ),
          T(
            "Traçabilité de la molécule retenue dans le dossier.",
            "Le protocole substitutif doit rester lisible pour les équipes suivantes.",
          ),
          T(
            "Administration avant l’incision.",
            "L’alternative suit la même exigence de concentration tissulaire.",
          ),
        ],
        "Les explorations identifient la molécule responsable et une alternative validée est inscrite dans le dossier.",
      ),
      qcm(
        "Quels indicateurs peuvent mesurer l’amélioration du protocole ?",
        ["b00050", "b00052"],
        "L’audit suit le taux d’injections pré-incision, les réactions documentées, les complications maternelles et les écarts au protocole.",
        [
          F(
            "Délai moyen entre l’incision et la fermeture cutanée.",
            "La durée opératoire mesure l’activité chirurgicale et non l’adoption du nouveau timing.",
          ),
          T(
            "Conformité de la fenêtre temporelle.",
            "Une dose pré-incision mais trop précoce reste imparfaite.",
          ),
          T(
            "Qualité des comptes rendus allergiques.",
            "La traçabilité réduit les étiquettes injustifiées.",
          ),
          F(
            "Nombre de prophylaxies prolongées jusqu’à sortie.",
            "La prolongation ne constitue pas un objectif de qualité.",
          ),
          T(
            "Taux d’ISO après césarienne.",
            "Le résultat clinique complète l’indicateur de processus.",
          ),
        ],
        "Six mois plus tard, le service souhaite vérifier l’adoption du nouveau timing par un audit dédié.",
      ),
    ],
  },
  {
    title: "Prophylaxie d’endocardite avant extraction dentaire",
    vignette:
      "Un homme de 45 ans porteur d’une valve aortique mécanique doit subir une extraction dentaire avec manipulation gingivale. Il peut prendre un traitement oral. Le cardiologue confirme l’absence d’allergie, une fonction rénale normale et l’absence de signe d’endocardite active.",
    questions: [
      qcm(
        "Quels éléments rendent la prophylaxie d’endocardite indiquée ?",
        "b00047",
        "La valve prothétique et le geste gingival bactériémiant réunissent le terrain et la procédure à haut risque.",
        [
          F(
            "Stimulateur cardiaque implanté depuis dix ans.",
            "Le matériel de stimulation figure hors des cardiopathies retenues pour cette prophylaxie.",
          ),
          T(
            "Manipulation de la gencive.",
            "Ce geste dentaire peut provoquer une bactériémie.",
          ),
          F("Âge de 45 ans isolé.", "L’âge ne constitue pas l’indication."),
          F(
            "Capacité à prendre un médicament oral.",
            "Elle guide la voie, pas la nécessité de prophylaxie.",
          ),
          T(
            "Risque de conséquence sévère d’une endocardite.",
            "La sélection des patients repose sur la gravité potentielle.",
          ),
        ],
      ),
      qcm(
        "Quel schéma standard est cohérent ?",
        ["b00031", "b00047"],
        "L’amoxicilline 2 g par voie orale constitue le schéma cité lorsque la prise orale est possible.",
        [
          F(
            "Céfazoline intraveineuse une heure avant les soins dentaires.",
            "Le schéma cité pour l’endocardite repose sur l’amoxicilline 2 g, ou la clindamycine en cas d’allergie.",
          ),
          F(
            "Amoxicilline 200 mg quotidienne pendant dix jours.",
            "La prophylaxie repose sur une dose unique adaptée.",
          ),
          F(
            "Administration débutée le lendemain du geste.",
            "L’exposition antibiotique doit précéder la bactériémie provoquée par l’acte dentaire.",
          ),
          F(
            "Vancomycine prolongée après extraction.",
            "Ce n’est pas le schéma standard et la prolongation serait inutile.",
          ),
          T(
            "Traçabilité du terrain valvulaire.",
            "Le motif précis doit être visible dans le dossier.",
          ),
        ],
        "Le cardiologue confirme l’absence d’allergie à l’amoxicilline et la bonne fonction digestive.",
      ),
      qcm(
        "Quels gestes ne relèvent pas de cette prophylaxie spécifique ?",
        ["b00038", "b00047"],
        "Les actes sans manipulation gingivale, périapicale ou perforation muqueuse ne relèvent pas du protocole d’endocardite.",
        [
          F(
            "Chirurgie parodontale avec décollement gingival.",
            "Ce geste manipule la muqueuse gingivale et relève du protocole d’endocardite.",
          ),
          F(
            "Perforation de la muqueuse orale lors d’un implant.",
            "La perforation muqueuse figure explicitement parmi les gestes retenus.",
          ),
          F(
            "Extraction avec manipulation gingivale.",
            "C’est précisément un geste concerné.",
          ),
          T(
            "Examen visuel sans effraction.",
            "Le geste n’entre pas dans la liste ciblée.",
          ),
          F(
            "Chirurgie périapicale.",
            "La région périapicale fait partie des indications.",
          ),
        ],
        "Le patient demande si le même antibiotique sera nécessaire pour une future radiographie et un détartrage sans saignement.",
      ),
      qcm(
        "Quelle alternative est citée en cas d’allergie vraie ?",
        ["b00047", "b00048"],
        "La clindamycine 600 mg, orale ou intraveineuse, est l’alternative explicitement mentionnée.",
        [
          F(
            "Céphalosporine de première génération en relais.",
            "Après une anaphylaxie vraie à l’amoxicilline, l’alternative citée est la clindamycine 600 mg.",
          ),
          F(
            "Amoxicilline maintenue sous couvert d’un antihistaminique.",
            "Une anaphylaxie authentique contre-indique la réintroduction de la molécule responsable.",
          ),
          F(
            "Clindamycine 60 mg pendant un mois.",
            "La dose prophylactique citée est dix fois plus élevée et ponctuelle.",
          ),
          F(
            "Rifampicine seule pour tout patient.",
            "Son risque de résistance l’exclut d’un usage prophylactique routinier.",
          ),
          T(
            "Choix préparé avant le rendez-vous dentaire.",
            "L’anticipation évite une improvisation ou une omission.",
          ),
        ],
        "Une ancienne lettre est retrouvée : le patient avait en réalité présenté une anaphylaxie immédiate à l’amoxicilline.",
      ),
      qcm(
        "Quels éléments doivent être distingués si le patient est hospitalisé pour une autre chirurgie ?",
        ["b00022", "b00047"],
        "La prophylaxie d’endocardite dentaire ne remplace pas le protocole chirurgical adapté à la flore du futur geste.",
        [
          T(
            "Type de nouvelle chirurgie.",
            "Le spectre dépendra du site opératoire exposé.",
          ),
          T(
            "Indication propre de prophylaxie d’ISO.",
            "Chaque geste doit être classé selon son risque.",
          ),
          F(
            "Amoxicilline 2 g universelle pour toute chirurgie.",
            "Ce schéma appartient au geste dentaire à risque.",
          ),
          T(
            "Allergie désormais documentée.",
            "Elle guidera l’alternative du protocole chirurgical.",
          ),
          F(
            "Valve mécanique dispensant d’asepsie.",
            "Le terrain cardiaque ne remplace aucune mesure de prévention.",
          ),
        ],
        "Six mois plus tard, une cholécystectomie est programmée et le patient présente sa carte d’allergie.",
      ),
      qcm(
        "Quels événements feraient évoquer une infection plutôt qu’une simple prophylaxie ?",
        ["b00006", "b00007"],
        "Fièvre, hémocultures positives ou signes valvulaires feraient passer d’une prévention ponctuelle à une démarche diagnostique et curative.",
        [
          T(
            "Fièvre persistante avec frissons.",
            "Une infection systémique doit être recherchée.",
          ),
          T(
            "Hémocultures positives.",
            "Elles objectivent une bactériémie et orientent le traitement.",
          ),
          F(
            "Douleur dentaire résiduelle après le soin.",
            "Une gêne locale postopératoire traduit rarement une infection systémique.",
          ),
          F(
            "Geste dentaire futur sans symptôme.",
            "Il s’agit encore d’un contexte préventif.",
          ),
          F(
            "Prise correcte d’une dose prophylactique.",
            "Elle ne constitue pas un diagnostic d’infection.",
          ),
        ],
        "Après une autre intervention dentaire réalisée sans prophylaxie, le patient consulte pour fièvre et asthénie depuis dix jours.",
      ),
      qcm(
        "Quels messages doivent être remis au patient après résolution du dossier ?",
        ["b00024", "b00047"],
        "Le patient doit connaître son terrain, les seuls gestes concernés, le schéma validé et son allergie précise.",
        [
          T(
            "Mention de la valve prothétique.",
            "Le professionnel dentaire doit identifier le haut risque.",
          ),
          T(
            "Liste des gestes oraux bactériémiants concernés.",
            "Elle évite prophylaxies inutiles et omissions dangereuses.",
          ),
          T(
            "Alternative clindamycine 600 mg validée.",
            "Le schéma doit être immédiatement disponible.",
          ),
          T(
            "Description de l’anaphylaxie à l’amoxicilline.",
            "Une allergie précise est plus utile qu’une étiquette de classe vague.",
          ),
          T(
            "Rappel que l’asepsie des soins reste indispensable.",
            "L’antibiotique complète les mesures de prévention sans les remplacer.",
          ),
        ],
        "L’infection est exclue ; une fiche synthétique est préparée pour les futurs soins dentaires.",
      ),
    ],
  },
  {
    title: "Décolonisation avant neurochirurgie",
    vignette:
      "Une femme de 61 ans porteuse nasale de Staphylococcus aureus sensible à la méticilline doit subir une craniotomie avec implantation de matériel. L’intervention est programmée dans sept jours, sans infection active, et le service dispose d’un protocole de décolonisation ciblée.",
    questions: [
      qcm(
        "Quels arguments soutiennent une décolonisation ciblée ?",
        ["b00041", "b00042", "b00044"],
        "Le portage prouvé, la neurochirurgie et le matériel relient un réservoir staphylococcique fréquent à une infection potentiellement grave.",
        [
          T(
            "Écouvillonnage nasal positif.",
            "La stratégie cible une colonisation objectivée.",
          ),
          T(
            "Geste neurochirurgical avec ouverture cutanée.",
            "Cette spécialité semble davantage bénéficier de la décolonisation.",
          ),
          T(
            "Pose d’un implant intracrânien.",
            "Une infection du dispositif aurait une forte morbidité.",
          ),
          F(
            "Absence de portage documenté.",
            "Le dépistage est au contraire positif.",
          ),
          T(
            "Germe à Gram positif sensible à la mupirocine.",
            "Le spectre topique correspond à la bactérie isolée.",
          ),
        ],
      ),
      qcm(
        "Quel schéma de mupirocine est approprié ?",
        "b00041",
        "La mupirocine est appliquée dans les narines deux fois par jour pendant cinq jours, avec observance vérifiée.",
        [
          F(
            "Une application hebdomadaire dans chaque narine.",
            "Le taux d’éradication dépend du nombre d’applications, fixé à deux par jour.",
          ),
          T(
            "Cinq jours de traitement.",
            "Cette durée est associée à l’éradication décrite.",
          ),
          F(
            "Une application unique après l’incision.",
            "Le réservoir doit être réduit avant la chirurgie.",
          ),
          F(
            "Début de la cure le matin de l’intervention.",
            "Les cinq jours de traitement doivent être achevés avant l’admission.",
          ),
          F(
            "Remplacement de toute prophylaxie IV.",
            "La décolonisation complète le protocole opératoire.",
          ),
        ],
        "L’intervention est prévue dans sept jours, ce qui permet une cure complète avant l’admission.",
      ),
      qcm(
        "Pourquoi une décontamination cutanée associée complique-t-elle l’évaluation ?",
        "b00042",
        "Lorsque mupirocine et chlorhexidine sont combinées, le bénéfice observé ne peut être attribué avec certitude à l’un ou l’autre composant.",
        [
          T(
            "Deux interventions sont réalisées simultanément.",
            "Leur effet propre ne peut être séparé sans groupe comparateur adapté.",
          ),
          F(
            "La chlorhexidine agit uniquement sur le portage nasal.",
            "La douche antiseptique cible la peau, tandis que la mupirocine traite les narines.",
          ),
          F(
            "La mupirocine devient inactive par principe.",
            "La coadministration n’annule pas son effet nasal.",
          ),
          F(
            "Le résultat global s’attribue entièrement à la mupirocine.",
            "L’association des deux mesures empêche justement d’isoler la part de chaque produit.",
          ),
          F(
            "Aucune infection staphylococcique n’est mesurable.",
            "Les études évaluent précisément ces infections.",
          ),
        ],
        "Le protocole local associe également des douches à la chlorhexidine et l’équipe souhaite interpréter ses résultats.",
      ),
      qcm(
        "Quels facteurs exposent à l’échec d’éradication ?",
        "b00043",
        "Une observance incomplète et une résistance à la mupirocine peuvent maintenir le portage ; l’usage non ciblé favorise ce phénomène.",
        [
          F(
            "Application réalisée deux fois par jour pendant cinq jours.",
            "Un schéma complet correspond au protocole efficace décrit, pas à un facteur d’échec.",
          ),
          F(
            "Dépistage nasal réalisé avant la prescription.",
            "L’identification préalable du porteur conditionne le protocole ciblé et favorise sa réussite.",
          ),
          T(
            "Protocole universel répété dans le service.",
            "La pression topique sélectionne des résistances.",
          ),
          F(
            "Culture initiale sensible correctement traitée.",
            "Cette situation favorise plutôt le succès.",
          ),
          F(
            "Prophylaxie IV administrée au bon moment.",
            "Elle ne détermine pas à elle seule l’éradication nasale.",
          ),
        ],
        "Le contrôle réalisé la veille de la chirurgie reste positif et l’interrogatoire révèle plusieurs applications oubliées.",
      ),
      qcm(
        "Quelles décisions sont cohérentes devant ce portage persistant ?",
        ["b00015", "b00022", "b00043"],
        "L’équipe réévalue l’observance et la sensibilité, conserve une prophylaxie opératoire active et évite une extension non argumentée.",
        [
          F(
            "Considérer le portage persistant comme une infection à traiter.",
            "Aucune infection active n’est retrouvée, et la colonisation reste distincte de l’infection.",
          ),
          T(
            "Maintenir une prophylaxie IV adaptée au geste.",
            "Le portage persistant renforce la nécessité d’une couverture staphylococcique.",
          ),
          T(
            "Documenter l’échec de cure.",
            "La future stratégie doit intégrer l’observance réelle.",
          ),
          F(
            "Prescrire une mupirocine indéfiniment.",
            "Une exposition prolongée sélectionnerait davantage de résistances.",
          ),
          F(
            "Élargir à tous les bacilles à Gram négatif sans indication.",
            "Le germe identifié est un staphylocoque sensible.",
          ),
        ],
        "La souche reste sensible à la mupirocine et aucune infection active n’est retrouvée.",
      ),
      qcm(
        "Quels éléments justifient une surveillance économique et écologique ?",
        "b00043",
        "La décolonisation ciblée peut être rentable dans certaines chirurgies, tandis que l’usage universel ajoute coûts et résistances.",
        [
          T(
            "Coût du dépistage et de la cure.",
            "Il doit être comparé aux infections évitées.",
          ),
          T(
            "Incidence locale des ISO staphylococciques.",
            "Le bénéfice attendu dépend du risque de base.",
          ),
          T(
            "Taux de résistance à la mupirocine.",
            "Une résistance croissante réduit l’efficacité future.",
          ),
          T(
            "Sélection des indications où le modèle est rentable.",
            "Les analyses retiennent surtout les chirurgies cardiaque, vasculaire et orthopédique prothétique.",
          ),
          T(
            "Coût des infections de matériel évitées.",
            "Ces complications lourdes déterminent la valeur de la stratégie.",
          ),
        ],
        "Le comité qualité envisage d’étendre la décolonisation à toutes les chirurgies ambulatoires.",
      ),
      qcm(
        "Quels indicateurs permettent d’auditer ce protocole ?",
        ["b00041", "b00043", "b00052"],
        "L’audit relie dépistage, observance, éradication, résistance, ISO et coûts pour décider du maintien de l’indication ciblée.",
        [
          F(
            "Nombre de doses de vancomycine délivrées en pharmacie.",
            "Cet indicateur mesure une consommation systémique, sans rapport avec l’éradication nasale.",
          ),
          T(
            "Achèvement des dix applications prévues.",
            "Deux doses quotidiennes pendant cinq jours mesurent l’observance.",
          ),
          T(
            "Taux de cultures négatives après cure.",
            "Il mesure l’éradication microbiologique.",
          ),
          T(
            "ISO à S. aureus dans la spécialité.",
            "Le résultat clinique valide ou non la stratégie.",
          ),
          F(
            "Nombre d’antibiotiques prolongés après fermeture.",
            "La prolongation n’est pas un objectif de la décolonisation.",
          ),
        ],
        "Après un an, le service prépare une évaluation formelle de la stratégie neurochirurgicale.",
      ),
    ],
  },
  {
    title: "Audit d’un protocole trop prolongé",
    vignette:
      "Un établissement constate que les antibiotiques prophylactiques sont souvent maintenus jusqu’au retrait des drains après chirurgie digestive, parfois pendant quatre jours. Un patient de 64 ans, opéré sans infection constituée, illustre cette reconduction automatique malgré une fermeture sans contamination.",
    questions: [
      qcm(
        "Quels constats rendent cette pratique inadaptée ?",
        ["b00033", "b00036", "b00038"],
        "La prolongation pour drains n’apporte pas de bénéfice, sort de la fenêtre opératoire et sélectionne des résistances.",
        [
          F(
            "Les drains laissés en place imposent une couverture continue.",
            "La prolonger pour un drain, un redon ou un accès vasculaire sélectionne des résistances sans réduire les infections.",
          ),
          T(
            "La prophylaxie doit être la plus courte possible.",
            "Son objectif se termine avec la fermeture.",
          ),
          T(
            "Une exposition de quatre jours augmente la pression de sélection.",
            "Les bactéries résistantes sont favorisées par la durée.",
          ),
          F(
            "La pratique est nécessaire pour toute chirurgie digestive.",
            "Aucun argument général ne soutient cette prolongation.",
          ),
          F(
            "Le maintien transforme automatiquement la prescription en traitement curatif adapté.",
            "Une antibiothérapie curative nécessite une infection et un schéma propres.",
          ),
        ],
      ),
      qcm(
        "Quels critères faut-il extraire des dossiers ?",
        ["b00050", "b00051"],
        "L’audit reconstitue indication, molécule, timing, dose, rappels, fermeture, arrêt et justification d’une éventuelle poursuite.",
        [
          T(
            "Heure de la première dose.",
            "Elle permet d’évaluer le timing pré-incision.",
          ),
          T(
            "Heures des réinjections.",
            "Elles montrent si la chirurgie longue est restée couverte.",
          ),
          T(
            "Heure de fermeture et d’arrêt.",
            "L’écart postopératoire devient quantifiable.",
          ),
          T(
            "Motif documenté de poursuite.",
            "Une infection curative doit être distinguée d’une habitude.",
          ),
          F(
            "Uniquement le nom du chirurgien.",
            "L’identité seule ne mesure aucun critère de prescription.",
          ),
        ],
        "Le comité décide d’examiner cent dossiers consécutifs de chirurgie digestive.",
      ),
      qcm(
        "Quels indicateurs de conformité sont pertinents ?",
        ["b00050", "b00052"],
        "La conformité doit mesurer la chaîne complète, notamment le taux d’arrêt à la fermeture et les prolongations sans indication.",
        [
          T(
            "Molécule adaptée à la procédure.",
            "Le spectre doit couvrir la flore exposée.",
          ),
          T(
            "Dose correcte au poids du patient.",
            "L’obésité peut nécessiter une adaptation.",
          ),
          T(
            "Injection dans la fenêtre pré-incision.",
            "Le timing conditionne l’efficacité.",
          ),
          T(
            "Arrêt après fermeture en absence d’infection.",
            "Ce critère cible précisément la dérive observée.",
          ),
          T(
            "Part des prescriptions poursuivies sans indication curative.",
            "Cet indicateur isole les prolongations injustifiées repérées dans l’audit.",
          ),
        ],
        "Les premiers dossiers montrent une bonne molécule mais un arrêt conforme dans seulement 38 % des cas.",
      ),
      qcm(
        "Quelles causes organisationnelles doivent être recherchées ?",
        ["b00052", "b00054"],
        "Une prescription sans arrêt, un protocole ambigu, une habitude liée aux drains et l’absence de retour d’audit entretiennent la dérive.",
        [
          T(
            "Ordonnance postopératoire sans date de fin.",
            "Le traitement se poursuit par défaut.",
          ),
          T(
            "Protocole mentionnant à tort le retrait du drain.",
            "Une consigne erronée institutionnalise la prolongation.",
          ),
          T(
            "Absence de réévaluation pharmaceutique.",
            "Aucune barrière ne détecte la dose inutile.",
          ),
          F(
            "Rappel peropératoire correctement réalisé.",
            "Ce geste est conforme et distinct de la prolongation.",
          ),
          T(
            "Résultats d’audit non communiqués.",
            "Sans retour, les équipes ne perçoivent pas l’écart collectif.",
          ),
        ],
        "Les prescriptions postopératoires sont automatiquement recopiées pendant 96 heures par le logiciel.",
      ),
      qcm(
        "Quelles corrections système sont adaptées ?",
        ["b00036", "b00052", "b00054"],
        "Le logiciel doit arrêter par défaut à la fermeture, exiger une indication curative pour poursuivre et restituer les résultats aux équipes.",
        [
          F(
            "Durée par défaut portée à sept jours dans le logiciel.",
            "Une durée par défaut prolongée reproduirait exactement la dérive constatée.",
          ),
          T(
            "Justification obligatoire pour toute poursuite.",
            "Elle distingue infection traitée et prophylaxie inutile.",
          ),
          T(
            "Alerte pharmaceutique au-delà du geste.",
            "Une seconde barrière intercepte les ordonnances prolongées.",
          ),
          T(
            "Retour des indicateurs par service.",
            "La comparaison permet de cibler l’accompagnement.",
          ),
          F(
            "Vancomycine ajoutée à toutes les prolongations.",
            "Cette molécule augmenterait encore la pression de résistance.",
          ),
        ],
        "Le groupe informatique propose de supprimer la durée automatique de quatre jours.",
      ),
      qcm(
        "Quels résultats secondaires doivent être surveillés après correction ?",
        ["b00038", "b00050", "b00052"],
        "La réduction d’exposition doit être suivie par les ISO, la consommation, les résistances et les reprises curatives appropriées.",
        [
          T(
            "Taux d’ISO par type de chirurgie.",
            "Il vérifie l’absence de perte d’efficacité clinique.",
          ),
          T(
            "Journées d’antibiotiques évitées.",
            "Cet indicateur mesure la baisse d’exposition.",
          ),
          T(
            "Évolution des portages résistants.",
            "La pression écologique devrait diminuer.",
          ),
          T(
            "Délai de reprise chirurgicale pour infection du site.",
            "Un recours accru au bloc pour sepsis traduirait un défaut de couverture.",
          ),
          T(
            "Proportion de traitements curatifs correctement justifiés.",
            "Une infection réelle doit continuer à être traitée sans confusion.",
          ),
        ],
        "Trois mois après le changement, la consommation prophylactique a diminué de moitié.",
      ),
      qcm(
        "Quels messages concluent l’audit ?",
        ["b00036", "b00052", "b00054"],
        "La qualité repose sur une bonne concentration pendant le geste, un arrêt immédiat ensuite et une boucle d’audit régulière.",
        [
          T(
            "Le drain n’est pas une indication antibiotique.",
            "La présence du dispositif ne prolonge pas la contamination initiale.",
          ),
          T(
            "La couverture peropératoire doit rester rigoureuse.",
            "Réduire la durée ne signifie pas négliger timing et rappels.",
          ),
          T(
            "Une poursuite nécessite un diagnostic curatif.",
            "L’objectif et la durée doivent alors être redéfinis.",
          ),
          T(
            "L’audit doit être répété.",
            "La pérennité de la correction doit être mesurée.",
          ),
          F(
            "Une conformité initiale dispense de toute réévaluation.",
            "Les pratiques, techniques et résistances évoluent.",
          ),
        ],
        "L’établissement valide un nouveau protocole et planifie un nouvel audit à six mois.",
      ),
    ],
  },
];

function buildDpQcm() {
  return DP_QCM.map((serie, index) => ({
    label: `DP QCM ${index + 1} · ${serie.title}`,
    allowed_voies: ["interne"],
    vignette: serie.vignette,
    questions: serie.questions,
  }));
}

const ISOLATED_QROC = [
  {
    title: "Indication et risque infectieux",
    questions: [
      qroc(
        "Quel type d’infection l’antibioprophylaxie chirurgicale cherche-t-elle à réduire ?",
        "infection du site opératoire|ISO",
        "b00005",
        "La prophylaxie cible les infections directement liées à la contamination du champ opératoire.",
      ),
      qroc(
        "Quelle classe de Polk-Altemeier relève habituellement d’une prophylaxie ?",
        "classe II|chirurgie propre-contaminée",
        "b00007",
        "L’ouverture contrôlée d’un appareil colonisé expose à un risque justifiant habituellement une prophylaxie.",
      ),
      qroc(
        "Quel type d’antibiothérapie faut-il devant une infection déjà constituée ?",
        "antibiothérapie curative|traitement curatif",
        ["b00007", "b00015"],
        "Une infection présente avant l’incision ne relève plus de la prévention mais d’un traitement documenté.",
      ),
      qroc(
        "Quel score associe ASA, contamination et durée opératoire ?",
        "NNISS|score NNISS",
        "b00007",
        "Le NNISS combine terrain, classe de Polk-Altemeier et durée attendue de l’intervention.",
      ),
      qroc(
        "Au-dessus de quel risque spontané d’ISO une prophylaxie est-elle généralement justifiée ?",
        "5 %|5 pour cent",
        "b00007",
        "Un risque spontané supérieur à 5 % constitue le seuil usuel de bénéfice prophylactique.",
      ),
    ],
  },
  {
    title: "Flore cible et choix de la molécule",
    questions: [
      qroc(
        "Quelle flore constitue la première cible d’une antibioprophylaxie ?",
        "flore commensale|flore du site opératoire",
        "b00012",
        "La molécule est choisie contre les commensaux susceptibles d’être inoculés pendant le geste.",
      ),
      qroc(
        "Quelle famille bactérienne domine la cible d’une chirurgie cutanée propre ?",
        "staphylocoques|staphylocoques cutanés",
        "b00012",
        "Les staphylocoques, notamment à coagulase négative et S. aureus, dominent la flore cutanée.",
      ),
      qroc(
        "Quel groupe bactérien doit être couvert lors d’une chirurgie colique ?",
        "anaérobies digestifs|anaérobies",
        "b00013",
        "La flore colique abondante comprend des anaérobies qui doivent être couverts avec les bacilles à Gram négatif.",
      ),
      qroc(
        "Quel niveau de spectre faut-il privilégier pour la prophylaxie ?",
        "spectre étroit|spectre le plus étroit possible",
        ["b00022", "b00023"],
        "Le spectre doit couvrir la flore attendue tout en limitant toxicité et pression écologique.",
      ),
      qroc(
        "Quelles céphalosporines sont habituellement privilégiées ?",
        "première ou deuxième génération|C1G ou C2G",
        "b00023",
        "Les céphalosporines de première ou deuxième génération offrent un spectre adapté à de nombreux gestes.",
      ),
    ],
  },
  {
    title: "Allergie et administration",
    questions: [
      qroc(
        "Quel moment de la prise en charge permet d’anticiper une alternative pour allergie ?",
        "évaluation préopératoire|consultation préanesthésique",
        "b00024",
        "La consultation préopératoire permet de caractériser la réaction et de planifier une molécule adaptée.",
      ),
      qroc(
        "Quelle structure des bêtalactamines explique surtout les réactions croisées ?",
        "chaîne latérale R1|R1",
        "b00024",
        "Une chaîne R1 proche est plus prédictive de réactivité croisée que le seul noyau bêtalactame.",
      ),
      qroc(
        "Quelle voie d’administration est préférée en prophylaxie chirurgicale ?",
        "voie intraveineuse|IV",
        "b00027",
        "La voie IV fournit rapidement une concentration plasmatique et tissulaire prévisible.",
      ),
      qroc(
        "Quelle spécialité constitue l’exception principale à la voie intraveineuse ?",
        "ophtalmologie|chirurgie ophtalmologique",
        "b00027",
        "La chirurgie ophtalmologique peut utiliser une administration locale, intracamerulaire ou parfois orale selon le protocole.",
      ),
      qroc(
        "Pourquoi faut-il dissocier l’injection antibiotique de l’induction anesthésique ?",
        "identifier une anaphylaxie|attribuer une réaction allergique",
        "b00029",
        "Des injections simultanées compliquent l’identification du médicament responsable d’une réaction immédiate.",
      ),
    ],
  },
  {
    title: "Timing et posologie",
    questions: [
      qroc(
        "Dans quelle fenêtre faut-il administrer la première dose avant l’incision ?",
        "30 à 60 minutes|dans l’heure précédant l’incision",
        "b00028",
        "La dose doit être perfusée assez tôt pour assurer une concentration efficace au moment de l’incision.",
      ),
      qroc(
        "Quand injecter la prophylaxie lorsqu’un garrot est utilisé ?",
        "avant le gonflage du garrot|avant la pose du garrot",
        "b00028",
        "L’antibiotique doit atteindre les tissus du membre avant l’interruption de la circulation.",
      ),
      qroc(
        "Quel repère opératoire fixe l’injection lors d’une césarienne ?",
        "avant l’incision|avant l’incision cutanée",
        "b00030",
        "L’injection pré-incision réduit mieux les infections maternelles que l’attente du clampage du cordon.",
      ),
      qroc(
        "Quel multiple de la dose usuelle constitue habituellement la dose initiale ?",
        "double dose|deux fois la dose usuelle",
        "b00031",
        "La dose de charge prophylactique est habituellement le double de la dose usuelle hors prophylaxie.",
      ),
      qroc(
        "Quel seuil associe poids et IMC pour doubler une bêtalactamine ?",
        "poids supérieur à 100 kg et IMC supérieur à 35|plus de 100 kg avec IMC > 35",
        "b00031",
        "La dose de bêtalactamine est doublée lorsque ces deux critères d’obésité sont réunis.",
      ),
    ],
  },
  {
    title: "Réinjection et arrêt",
    questions: [
      qroc(
        "Après combien de demi-vies faut-il réinjecter en peropératoire ?",
        "deux demi-vies|2 demi-vies",
        "b00032",
        "Une nouvelle dose est administrée toutes les deux demi-vies à partir de la première injection.",
      ),
      qroc(
        "Quelle fraction de la dose initiale utiliser pour une réinjection ?",
        "moitié de la dose initiale|simple dose",
        "b00032",
        "La réinjection correspond à la dose usuelle, soit la moitié de la double dose initiale.",
      ),
      qroc(
        "Quel est l’intervalle de réinjection de la céfazoline ?",
        "4 heures|quatre heures",
        ["b00032", "b00033"],
        "Avec une demi-vie d’environ deux heures, la céfazoline est réinjectée toutes les quatre heures.",
      ),
      qroc(
        "Quel est l’intervalle de réinjection du céfotaxime ?",
        "2 heures|deux heures",
        ["b00032", "b00033"],
        "La demi-vie d’environ une heure conduit à une réinjection toutes les deux heures.",
      ),
      qroc(
        "À quel moment faut-il arrêter une prophylaxie sans complication infectieuse ?",
        "à la fermeture cutanée|fin de l’intervention",
        ["b00033", "b00036"],
        "La protection est requise pendant l’exposition opératoire et ne doit pas être prolongée pour un drain ou une prothèse.",
      ),
    ],
  },
  {
    title: "Bactéries multirésistantes",
    questions: [
      qroc(
        "Quel effet collectif augmente avec la durée d’exposition antibiotique ?",
        "sélection de bactéries résistantes|pression de sélection",
        "b00038",
        "Une exposition plus longue et plus large favorise la sélection et la diffusion de résistances.",
      ),
      qroc(
        "Quel antibiotique peut être discuté chez un porteur de SARM avant implantation prothétique ?",
        "vancomycine",
        "b00039",
        "La vancomycine peut compléter ou remplacer le schéma selon le geste et le protocole local chez un porteur de SARM.",
      ),
      qroc(
        "Quel type de décision prendre devant un portage d’entérobactérie BLSE avant chirurgie digestive ?",
        "décision individualisée|discussion au cas par cas",
        "b00039",
        "Aucun élargissement systématique n’est justifié ; l’écologie, le geste et le protocole local guident la décision.",
      ),
      qroc(
        "Quel type de molécule faut-il éviter de banaliser en prophylaxie ?",
        "antibiotique à très large spectre|molécule de dernier recours",
        ["b00023", "b00038"],
        "Préserver les molécules curatives et limiter le spectre réduit la pression écologique.",
      ),
      qroc(
        "La présence isolée d’un drain justifie-t-elle une prolongation antibiotique ?",
        "non|aucune prolongation",
        "b00036",
        "Un drain n’allonge pas la fenêtre de contamination et ne justifie pas une prophylaxie postopératoire.",
      ),
    ],
  },
  {
    title: "Décolonisation et endocardite",
    questions: [
      qroc(
        "Quel antibiotique local est utilisé pour éradiquer un portage nasal de S. aureus ?",
        "mupirocine",
        "b00041",
        "La mupirocine nasale est proposée dans certaines stratégies ciblées de décolonisation.",
      ),
      qroc(
        "Quelle durée habituelle comporte une cure nasale de mupirocine ?",
        "5 jours|cinq jours",
        ["b00041", "b00044"],
        "Le protocole cité associe deux applications quotidiennes pendant cinq jours.",
      ),
      qroc(
        "Quelle proportion de la population porte S. aureus dans le nez ?",
        "20 à 30 %|20-30 %",
        "b00041",
        "Le portage nasal concerne environ un cinquième à un tiers de la population.",
      ),
      qroc(
        "Quel antibiotique administrer avant geste dentaire à haut risque d’endocardite sans allergie ?",
        "amoxicilline 2 g|2 g d’amoxicilline",
        "b00047",
        "Chez un patient à haut risque et pour un geste dentaire invasif, l’amoxicilline 2 g est le schéma cité.",
      ),
      qroc(
        "Quel antécédent infectieux cardiaque classe un patient à haut risque ?",
        "antécédent d’endocardite infectieuse|endocardite infectieuse antérieure",
        "b00047",
        "Une endocardite antérieure fait partie des rares situations à haut risque justifiant une prophylaxie dentaire ciblée.",
      ),
    ],
  },
  {
    title: "Qualité des pratiques",
    questions: [
      qroc(
        "Quel outil mesure l’adhésion aux protocoles d’antibioprophylaxie ?",
        "audit de pratiques|audit clinique",
        ["b00049", "b00052"],
        "L’audit confronte les prescriptions réelles aux critères de molécule, dose, timing, rappel et durée.",
      ),
      qroc(
        "Quelle fréquence de réévaluation faut-il appliquer aux protocoles ?",
        "régulièrement|réévaluation régulière",
        ["b00052", "b00064"],
        "Les protocoles doivent être diffusés, accessibles et réévalués par des audits répétés.",
      ),
      qroc(
        "Quel taux global de conformité rapportait l’audit canadien cité ?",
        "91 %|91 pour cent",
        "b00050",
        "L’audit de 52 centres et 2 082 procédures rapportait une conformité globale de 91 %.",
      ),
      qroc(
        "Quel élément logiciel évite une prolongation par défaut ?",
        "arrêt automatique|date de fin automatique",
        ["b00033", "b00052"],
        "Un ordre prophylactique avec arrêt programmé à la fin du geste empêche la reconduction postopératoire passive.",
      ),
      qroc(
        "Quels deux temps doivent être comparés pour auditer le timing initial ?",
        "heure d’injection et heure d’incision|injection-incision",
        ["b00028", "b00050"],
        "L’intervalle entre administration et incision détermine si la concentration était efficace à l’ouverture.",
      ),
    ],
  },
];

function buildIsolatedQroc() {
  return ISOLATED_QROC.map((serie, index) => ({
    label: `QROC — Série ${index + 1} · ${serie.title}`,
    allowed_voies: ["externe"],
    questions: serie.questions,
  }));
}

const DP_QROC = [
  {
    title: "Prostatectomie chez un patient obèse",
    vignette:
      "Un homme de 66 ans, 122 kg pour 1,78 m, doit subir une prostatectomie avec incision à 8 h 30. Il n’a ni infection urinaire ni allergie connue. Le protocole local retient une bêtalactamine IV. La durée prévue est de trois heures et une sonde ainsi qu’un drain seront laissés après fermeture.",
    questions: [
      qroc(
        "Quel est l’objectif de la prescription antibiotique dans ce contexte ?",
        "prévenir une infection du site opératoire|prévenir une ISO",
        ["b00005", "b00015"],
        "En l’absence d’infection constituée, l’antibiotique réduit le risque lié à l’inoculum du geste.",
      ),
      qroc(
        "Quelle voie faut-il privilégier ?",
        "voie intraveineuse|IV",
        "b00027",
        "La voie IV assure une concentration prévisible avant l’incision.",
        "L’intervention est confirmée et aucune exception ophtalmologique n’est en cause.",
      ),
      qroc(
        "Dans quelle fenêtre horaire doit commencer l’administration ?",
        "entre 7 h 30 et 8 h|30 à 60 minutes avant l’incision",
        "b00028",
        "La première dose est administrée dans l’heure précédant l’incision.",
        "Le programme fixe finalement l’incision à 8 h 30.",
      ),
      qroc(
        "Quels deux critères anthropométriques justifient ici une majoration de bêtalactamine ?",
        "poids supérieur à 100 kg et IMC supérieur à 35|poids > 100 kg et IMC > 35",
        "b00031",
        "Le patient réunit le seuil pondéral et celui d’IMC cités pour doubler la dose de bêtalactamine.",
        "Son IMC calculé est de 38,5 kg/m².",
      ),
      qroc(
        "Quelle donnée temporelle faut-il tracer pour décider des rappels ?",
        "heure de la première dose|heure de l’injection initiale",
        "b00032",
        "Les réinjections sont calculées à partir de la première administration.",
        "La chirurgie se prolonge au-delà de la durée prévue.",
      ),
      qroc(
        "Après combien de demi-vies faut-il réinjecter ?",
        "deux demi-vies|2 demi-vies",
        "b00032",
        "Une nouvelle dose maintient la concentration tissulaire toutes les deux demi-vies.",
        "Aucune hémorragie massive ne modifie la pharmacocinétique.",
      ),
      qroc(
        "Quand arrêter la prophylaxie en l’absence de complication ?",
        "à la fermeture cutanée|fin de l’intervention",
        ["b00033", "b00036"],
        "La sonde et les drains ne justifient pas une exposition après fermeture.",
        "Une sonde urinaire et un drain sont laissés en place.",
      ),
    ],
  },
  {
    title: "Allergie ancienne avant arthrodèse",
    vignette:
      "Une femme de 54 ans doit bénéficier d’une arthrodèse avec matériel. Son dossier porte la mention « allergie à la pénicilline » depuis l’enfance, sans autre précision. Elle est apyrétique, n’a jamais reçu de carte d’allergie et souhaite savoir si une céphalosporine reste possible.",
    questions: [
      qroc(
        "Quel temps de la prise en charge doit caractériser cette allergie ?",
        "évaluation préopératoire|consultation préanesthésique",
        "b00024",
        "L’anticipation évite un changement improvisé au bloc et permet de documenter le phénotype réactionnel.",
      ),
      qroc(
        "Quelle information clinique faut-il rechercher en priorité dans l’ancien épisode ?",
        "nature de la réaction|symptômes de la réaction",
        "b00024",
        "Le type, la chronologie et la gravité de la réaction conditionnent l’interprétation.",
        "La patiente ne se souvient que d’une éruption apparue plusieurs jours après le traitement.",
      ),
      qroc(
        "Quelle partie moléculaire prédit surtout une réaction croisée entre bêtalactamines ?",
        "chaîne latérale R1|R1",
        "b00024",
        "La similarité de la chaîne R1 est l’élément structural le plus informatif.",
        "Le protocole propose une céphalosporine dont la chaîne diffère de celle du produit ancien.",
      ),
      qroc(
        "Quel avantage écologique offre le maintien d’une molécule ciblée si elle est jugée sûre ?",
        "spectre plus étroit|moindre pression de sélection",
        ["b00022", "b00023"],
        "Une prophylaxie ciblée évite une alternative inutilement large et préserve l’écologie.",
        "L’allergologue ne retrouve aucun argument pour une hypersensibilité immédiate grave.",
      ),
      qroc(
        "Pourquoi faut-il administrer l’antibiotique séparément des produits d’induction ?",
        "identifier le responsable d’une anaphylaxie|attribuer une réaction allergique",
        "b00029",
        "Une injection distincte facilite l’imputabilité si une réaction immédiate survient.",
        "Le jour de l’intervention, plusieurs médicaments doivent être injectés avant l’intubation.",
      ),
      qroc(
        "Quel paramètre biologique et clinique faut-il surveiller pendant l’administration ?",
        "signes d’hypersensibilité immédiate|signes d’anaphylaxie",
        ["b00024", "b00029"],
        "Hypotension, bronchospasme et signes cutanés doivent être reconnus sans délai.",
        "La perfusion est réalisée avant l’induction sous monitorage.",
      ),
      qroc(
        "Quel élément doit figurer dans le compte rendu après une administration tolérée ?",
        "nom de la molécule tolérée|tolérance de la céphalosporine",
        ["b00024", "b00050"],
        "La traçabilité d’une exposition tolérée améliore la précision des prescriptions futures.",
        "Aucune réaction ne survient pendant ni après l’intervention.",
      ),
    ],
  },
  {
    title: "Péritonite lors d’une urgence digestive",
    vignette:
      "Un homme de 71 ans est admis pour douleur abdominale, fièvre et défense. Le scanner montre une perforation colique avec pneumopéritoine et épanchement diffus. Une laparotomie urgente est décidée. Il est tachycarde, hyperleucocytaire et a reçu plusieurs antibiotiques au cours des trois derniers mois.",
    questions: [
      qroc(
        "Cette prescription relève-t-elle d’une prophylaxie ou d’un traitement ?",
        "traitement curatif|antibiothérapie curative",
        ["b00007", "b00015"],
        "La perforation avec infection intra-abdominale constituée correspond à une chirurgie sale et impose un traitement curatif.",
      ),
      qroc(
        "Quelle classe de Polk-Altemeier correspond à une infection déjà présente ?",
        "classe IV|chirurgie sale",
        "b00007",
        "Une infection patente ou une perforation ancienne classe le geste en chirurgie sale.",
        "Du pus franc est retrouvé dès l’ouverture.",
      ),
      qroc(
        "Quel groupe de bactéries digestives doit notamment être couvert ?",
        "anaérobies|anaérobies digestifs",
        "b00013",
        "La flore colique associe de nombreux anaérobies aux bacilles à Gram négatif.",
        "La perforation siège au sigmoïde.",
      ),
      qroc(
        "Quel examen microbiologique faut-il réaliser avant adaptation secondaire ?",
        "prélèvement peropératoire|cultures du liquide péritonéal",
        ["b00022", "b00039"],
        "Des prélèvements documentent les bactéries responsables et permettent une adaptation curative.",
        "Le patient a reçu plusieurs antibiotiques au cours des trois derniers mois.",
      ),
      qroc(
        "Quel objectif distingue ici la durée postopératoire d’une simple prophylaxie ?",
        "traiter l’infection constituée|traitement curatif de la péritonite",
        ["b00015", "b00033"],
        "La poursuite est justifiée par l’infection et non par le drain ou l’incision.",
        "Un drainage abdominal est laissé après contrôle de la source.",
      ),
      qroc(
        "Quel principe doit guider la réduction du spectre après cultures ?",
        "désescalade|adapter au germe et à l’antibiogramme",
        ["b00022", "b00038"],
        "Une documentation microbiologique permet de revenir au spectre efficace le plus étroit.",
        "Les cultures identifient une entérobactérie sensible à une molécule plus ciblée.",
      ),
      qroc(
        "Quel libellé faut-il inscrire dans le dossier pour éviter une confusion d’audit ?",
        "antibiothérapie curative pour péritonite|traitement curatif documenté",
        ["b00050", "b00052"],
        "L’indication curative et son diagnostic doivent être distingués explicitement d’une prolongation prophylactique.",
        "Le pharmacien examine la prescription au troisième jour.",
      ),
    ],
  },
  {
    title: "Césarienne non programmée",
    vignette:
      "Une patiente primipare de 29 ans à terme doit subir une césarienne non programmée pour anomalies persistantes du rythme fœtal. Elle est apyrétique, sans infection suspectée et sans allergie. Une voie veineuse est disponible et l’équipe prévoit une incision dans vingt minutes.",
    questions: [
      qroc(
        "Quel moment faut-il choisir pour administrer la prophylaxie ?",
        "avant l’incision|avant l’incision cutanée",
        "b00030",
        "La prophylaxie pré-incision protège mieux la mère sans attendre la naissance.",
      ),
      qroc(
        "Quel ancien repère obstétrical ne faut-il plus attendre ?",
        "clampage du cordon|clampage ombilical",
        "b00030",
        "Attendre le clampage laisse la contamination initiale sans concentration antibiotique suffisante.",
        "L’obstétricien propose d’injecter seulement après l’extraction fœtale.",
      ),
      qroc(
        "Quel objectif pharmacologique doit être atteint dès l’ouverture cutanée ?",
        "concentration tissulaire efficace|concentration supérieure à la CMI",
        ["b00025", "b00028"],
        "Le tissu exposé doit contenir l’antibiotique avant l’inoculation bactérienne.",
        "Le bloc annonce une incision dans vingt minutes.",
      ),
      qroc(
        "Quelle voie permet l’obtention la plus prévisible de cette concentration ?",
        "voie intraveineuse|IV",
        "b00027",
        "La voie IV est la référence hors exceptions ophtalmologiques.",
        "Une voie veineuse périphérique fonctionnelle est disponible.",
      ),
      qroc(
        "Quel statut de la patiente faut-il recontrôler avant le choix final ?",
        "allergies médicamenteuses|allergie aux bêtalactamines",
        "b00024",
        "L’allergie et sa nature modifient le choix sans justifier une alternative large par défaut.",
        "La patiente confirme n’avoir jamais réagi à un antibiotique.",
      ),
      qroc(
        "Quelle information doit être tracée pour prouver la conformité du timing ?",
        "heure d’injection et heure d’incision|intervalle injection-incision",
        ["b00028", "b00050"],
        "Les deux horaires permettent de vérifier rétrospectivement la fenêtre pré-incision.",
        "L’enfant naît dix minutes après l’incision, sans complication.",
      ),
      qroc(
        "Quel moment fixe l’arrêt si aucune infection n’apparaît ?",
        "fermeture cutanée|fin de l’intervention",
        ["b00033", "b00036"],
        "La césarienne non infectée ne justifie pas une poursuite postopératoire de la prophylaxie.",
        "La fermeture est obtenue et la patiente reste apyrétique.",
      ),
    ],
  },
  {
    title: "Portage de SARM avant pose de prothèse",
    vignette:
      "Un homme de 72 ans doit recevoir une prothèse totale de hanche. Un dépistage récent retrouve un portage nasal de SARM, sans infection active. L’intervention peut être planifiée. Le patient pèse 108 kg, la souche est sensible à la vancomycine et une cure nasale peut être achevée avant le geste.",
    questions: [
      qroc(
        "Quel germe identifié doit être pris en compte dans la stratégie ?",
        "SARM|Staphylococcus aureus résistant à la méticilline",
        "b00039",
        "Le portage connu avant implantation de matériel modifie la discussion de couverture anti-staphylococcique.",
      ),
      qroc(
        "Quel antibiotique systémique peut être discuté pour couvrir ce germe ?",
        "vancomycine",
        "b00039",
        "La vancomycine est une option ciblée chez certains porteurs de SARM selon le protocole local.",
        "L’antibiogramme confirme la sensibilité à la vancomycine.",
      ),
      qroc(
        "Sur quel poids calculer la dose de vancomycine ?",
        "poids réel|poids total",
        "b00031",
        "La dose de vancomycine est calculée sur le poids réel afin d’obtenir une exposition prophylactique adaptée.",
        "La pesée préopératoire confirme un poids réel de 108 kg.",
      ),
      qroc(
        "Pourquoi faut-il débuter suffisamment tôt sa perfusion ?",
        "terminer avant l’incision|assurer une concentration efficace à l’incision",
        ["b00025", "b00028"],
        "Une perfusion plus longue doit être anticipée pour que le tissu soit protégé dès l’ouverture.",
        "Le protocole local prévoit une perfusion lente de la molécule.",
      ),
      qroc(
        "Quel traitement local peut être proposé pour le portage nasal ?",
        "mupirocine nasale|mupirocine",
        ["b00041", "b00044"],
        "Une décolonisation ciblée est pertinente dans certaines chirurgies à matériel.",
        "L’intervention est repoussée de cinq jours pour appliquer le protocole local.",
      ),
      qroc(
        "Quel risque collectif impose d’éviter une mupirocine universelle ?",
        "résistance à la mupirocine|sélection de résistances",
        "b00043",
        "L’exposition topique répétée peut sélectionner des souches résistantes.",
        "Le comité souhaite étendre la cure à tous les opérés sans dépistage.",
      ),
      qroc(
        "La prothèse justifie-t-elle de poursuivre la prophylaxie après fermeture ?",
        "non|aucune prolongation",
        ["b00033", "b00036"],
        "La présence du matériel ne prolonge pas l’exposition opératoire et n’autorise pas des doses postopératoires.",
        "La pose se déroule sans contamination ni infection.",
      ),
    ],
  },
  {
    title: "Extraction dentaire sur valve prothétique",
    vignette:
      "Une femme de 63 ans porte une valve aortique mécanique. Elle doit subir l’extraction d’une molaire avec manipulation gingivale. Elle n’a pas d’infection active et ne rapporte aucune allergie. Sa fonction digestive est normale, elle peut avaler des comprimés et demande quels futurs soins nécessiteront la même prévention.",
    questions: [
      qroc(
        "Quel statut cardiaque la classe à haut risque d’endocardite ?",
        "valve prothétique|prothèse valvulaire",
        "b00047",
        "Une valve prothétique fait partie des indications cardiaques à haut risque retenues.",
      ),
      qroc(
        "Quel caractère du geste dentaire justifie la prophylaxie ?",
        "manipulation gingivale|effraction de la muqueuse orale",
        ["b00046", "b00047"],
        "Seuls les gestes dentaires invasifs touchant gencive, région périapicale ou muqueuse sont concernés.",
        "Le dentiste confirme une incision gingivale et une effraction muqueuse.",
      ),
      qroc(
        "Quel antibiotique proposer en l’absence d’allergie ?",
        "amoxicilline|amoxicilline 2 g",
        ["b00047", "b00048"],
        "L’amoxicilline constitue le schéma de référence cité.",
        "La patiente tolère habituellement les pénicillines.",
      ),
      qroc(
        "Quelle dose adulte administrer ?",
        "2 g|deux grammes",
        ["b00031", "b00047"],
        "La prophylaxie dentaire repose sur une dose unique de 2 g d’amoxicilline.",
        "Le poids de la patiente est de 67 kg et la fonction rénale est normale.",
      ),
      qroc(
        "Quelle voie non injectable est possible si la patiente peut avaler ?",
        "voie orale|per os",
        ["b00027", "b00047"],
        "L’amoxicilline peut être administrée par voie orale avant le geste.",
        "La patiente peut prendre ses comprimés normalement.",
      ),
      qroc(
        "Quel antibiotique est cité comme alternative en cas d’allergie ?",
        "clindamycine 600 mg|clindamycine",
        ["b00024", "b00047"],
        "La clindamycine 600 mg constitue l’alternative adulte prévue lorsqu’une allergie empêche l’amoxicilline.",
        "Le dossier d’un futur patient comporte une allergie immédiate documentée.",
      ),
      qroc(
        "Faut-il appliquer ce schéma à tout soin dentaire sans effraction ?",
        "non|pas de prophylaxie systématique",
        ["b00038", "b00047"],
        "La simplification des recommandations limite la prophylaxie aux patients cardiaques et gestes dentaires à haut risque.",
        "Un simple contrôle radiographique est prévu six mois plus tard.",
      ),
    ],
  },
  {
    title: "Décolonisation nasale avant neurochirurgie",
    vignette:
      "Une patiente de 49 ans doit recevoir un implant neurochirurgical. Le protocole local recherche S. aureus ; son prélèvement nasal est positif à une souche sensible à la méticilline. L’intervention est prévue dans une semaine et aucune infection active n’est retrouvée lors de la consultation.",
    questions: [
      qroc(
        "Quel facteur microbiologique propre à la patiente augmente son risque d’ISO ?",
        "portage nasal de S. aureus|portage de staphylocoque doré",
        "b00041",
        "Le portage nasal est fortement associé aux infections staphylococciques du site opératoire.",
      ),
      qroc(
        "Quel antibiotique local proposer ?",
        "mupirocine nasale|mupirocine",
        ["b00041", "b00044"],
        "La mupirocine nasale est utilisée dans une stratégie ciblée sur les porteurs.",
        "L’intervention est programmée dans une semaine.",
      ),
      qroc(
        "Quel rythme d’application est recommandé dans le protocole cité ?",
        "deux fois par jour|2 applications quotidiennes",
        ["b00041", "b00044"],
        "La cure comporte deux applications nasales quotidiennes.",
        "La prescription est remise pour cinq jours.",
      ),
      qroc(
        "Quel indicateur simple évalue l’observance de la cure complète ?",
        "dix applications réalisées|nombre d’applications effectuées",
        ["b00041", "b00050"],
        "Deux applications quotidiennes pendant cinq jours correspondent à dix administrations attendues.",
        "La patiente reconnaît avoir oublié trois applications.",
      ),
      qroc(
        "Quelle cause microbiologique rechercher si le portage persiste malgré une bonne observance ?",
        "résistance à la mupirocine|souche résistante",
        "b00043",
        "Une résistance topique, encore rare mais décrite, peut expliquer l’échec d’éradication.",
        "Un contrôle reste positif après une seconde cure correctement suivie.",
      ),
      qroc(
        "Pourquoi ne pas étendre aveuglément ce traitement à tous les opérés ?",
        "sélection de résistances|efficacité non démontrée dans toutes les chirurgies",
        ["b00042", "b00043", "b00044"],
        "Les résultats sont variables selon les chirurgies et l’usage universel augmente la pression de sélection.",
        "Le service discute une décolonisation sans dépistage de tous les patients ambulatoires.",
      ),
      qroc(
        "Quel résultat clinique principal faut-il suivre pour juger le protocole ?",
        "taux d’ISO à S. aureus|infections du site opératoire à staphylocoque doré",
        ["b00042", "b00052"],
        "La baisse des infections staphylococciques, et pas seulement la négativation nasale, mesure le bénéfice clinique.",
        "Le protocole ciblé est maintenu un an avant réévaluation.",
      ),
    ],
  },
  {
    title: "Audit d’un service de chirurgie vasculaire",
    vignette:
      "Le comité des anti-infectieux examine cinquante pontages vasculaires. Les molécules sont conformes, mais les heures d’incision et d’injection sont rarement tracées ; des doses sont souvent poursuivies pendant 48 heures. Un patient de 69 ans sans infection active illustre une prescription automatiquement recopiée deux jours après fermeture.",
    questions: [
      qroc(
        "Quel outil d’amélioration des pratiques est engagé ?",
        "audit clinique|audit de pratiques",
        ["b00049", "b00052"],
        "L’audit mesure la conformité, restitue les écarts et guide les actions correctrices.",
      ),
      qroc(
        "Quel intervalle faut-il reconstruire pour juger la première injection ?",
        "intervalle injection-incision|temps entre injection et incision",
        ["b00028", "b00050"],
        "Les deux horaires déterminent si la dose a été administrée dans la fenêtre efficace.",
        "Le dossier informatisé permet de retrouver l’heure de délivrance mais pas celle de l’incision.",
      ),
      qroc(
        "Quel critère de durée doit devenir la cible prioritaire ?",
        "arrêt à la fermeture|absence de prolongation postopératoire",
        ["b00033", "b00036"],
        "Une chirurgie non infectée ne justifie pas 48 heures de prophylaxie.",
        "Aucune infection constituée n’est documentée dans les dossiers prolongés.",
      ),
      qroc(
        "Quel risque écologique accompagne cette prolongation ?",
        "sélection de bactéries résistantes|pression de sélection",
        "b00038",
        "La durée inutile augmente l’exposition collective et favorise les résistances.",
        "Le laboratoire signale une hausse des entérobactéries résistantes dans le service.",
      ),
      qroc(
        "Quel réglage informatique prévient la reconduction passive ?",
        "arrêt automatique en fin d’intervention|date de fin automatique",
        ["b00033", "b00052"],
        "La prescription prophylactique doit s’interrompre par défaut, avec justification exigée pour toute poursuite.",
        "Le logiciel recopie actuellement l’ordre pendant deux jours.",
      ),
      qroc(
        "Quel indicateur clinique faut-il surveiller après réduction de la durée ?",
        "taux d’infections du site opératoire|taux d’ISO",
        ["b00050", "b00052"],
        "La baisse d’exposition doit être confrontée au taux d’ISO pour confirmer la sécurité de la correction.",
        "Six mois après l’arrêt automatique, la consommation a diminué de 45 %.",
      ),
      qroc(
        "À quelle fréquence organisationnelle faut-il reconduire l’évaluation ?",
        "régulièrement|audit régulier",
        ["b00052", "b00064"],
        "Des audits répétés vérifient l’adhésion durable et détectent de nouvelles dérives.",
        "Le taux d’ISO reste stable et le comité planifie le suivi suivant.",
      ),
    ],
  },
];

function buildDpQroc() {
  return DP_QROC.map((serie, index) => ({
    label: `DP QROC ${index + 1} · ${serie.title}`,
    allowed_voies: ["externe"],
    vignette: serie.vignette,
    questions: serie.questions,
  }));
}

function validateSourceBlocks(extract, content) {
  const valid = new Set(
    (extract.blocs || []).map((block) => block.id).filter(Boolean),
  );
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value.sourceBlocks)) {
      for (const id of value.sourceBlocks) {
        if (!valid.has(id))
          throw new Error(`Chapitre 19 : bloc source inconnu ${id}`);
      }
    }
    if (Array.isArray(value)) value.forEach(visit);
    else Object.values(value).forEach(visit);
  };
  visit(content);
}

export function buildChapter19(extract) {
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

export default buildChapter19;
