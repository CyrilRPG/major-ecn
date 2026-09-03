const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept,
  bullets,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
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
  nsaids: fullImage(
    "img/img_001.png",
    "Prescrire un AINS en réduisant les risques",
    "TABLEAU 17.1 Règles de prescription des AINS et coxibs",
  ),
  opioidClasses: fullImage(
    "img/img_002.png",
    "Classes pharmacologiques des opioïdes",
    "TABLEAU 17.3 Puissance analgésique relative des opioïdes",
  ),
  opioidPower: fullImage(
    "img/img_003.png",
    "Puissance relative de plusieurs opioïdes",
    "TABLEAU 17.3 Puissance analgésique relative des opioïdes",
  ),
  gabapentinoids: fullImage(
    "img/img_005.png",
    "Gabapentine et prégabaline : comparaison pratique",
    "TABLEAU 17.5 Comparaison entre la gabapentine et la prégabaline",
  ),
  antidepressantMechanisms: fullImage(
    "img/img_006.png",
    "Mécanismes antalgiques des antidépresseurs",
    "TABLEAU 17.6 Mécanismes d’action de différents antidépresseurs",
  ),
  antidepressantProfiles: fullImage(
    "img/img_007.png",
    "Profils pharmacologiques des antidépresseurs",
    "TABLEAU 17.7 Tableau comparatif des antidépresseurs",
  ),
  antidepressantEffects: fullImage(
    "img/img_008.png",
    "Effets indésirables comparés des antidépresseurs",
    "TABLEAU 17.8 Tableau comparatif des principaux effets secondaires des antidépresseurs",
  ),
  cannabinoidEffects: fullImage(
    "img/img_009.png",
    "Effets indésirables potentiels des cannabinoïdes",
    "TABLEAU 17.10 Comparaison des produits à base de cannabinoïdes",
  ),
  cannabinoidProducts: fullImage(
    "img/img_010.png",
    "Produits cannabinoïdes et usages",
    "TABLEAU 17.10 Comparaison des produits à base de cannabinoïdes",
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Construire une analgésie multimodale",
      sections: [
        {
          title: "Paracétamol : socle non opioïde",
          rows: [
            row(
              "Place thérapeutique",
              [
                {
                  text: "Le paracétamol traite la douleur légère à modérée et réduit le recours aux opioïdes.",
                  children: [
                    "Utilisable chez l’enfant, l’adulte, le sujet âgé et la femme enceinte",
                    "Association possible avec un AINS si le terrain l’autorise",
                  ],
                },
                "Son excellent profil de tolérance en fait un composant habituel de l’analgésie balancée.",
              ],
              ["b00003", "b00005", "b00010", "b00011"],
            ),
            row(
              "Mécanismes centraux proposés",
              [
                "L’action exacte reste plurielle : inhibition inflammatoire centrale, voies sérotoninergiques descendantes et système endocannabinoïde.",
                "Un antagonisme NMDA et une inhibition de la synthèse du monoxyde d’azote participent aussi aux hypothèses.",
              ],
              ["b00007"],
            ),
            row(
              "Posologie usuelle",
              [
                {
                  text: "Chez l’adulte, administrer 1 000 mg par voie orale toutes les 6 heures.",
                  children: [
                    "Maximum habituel : 4 g/j",
                    "Privilégier la voie orale, idéalement une heure avant la chirurgie",
                  ],
                },
                "Chez l’enfant : 60 mg/kg/j, répartis en quatre prises de 15 mg/kg.",
              ],
              ["b00009", "b00114", "b00115"],
            ),
            row(
              "Métabolisme et toxicité",
              [
                "La sulfatation assure environ 30 % du métabolisme et la glucuronidation environ 60 %.",
                "Le NAPQI formé par les CYP est neutralisé par le glutathion ; son accumulation provoque une nécrose hépatique centrolobulaire.",
              ],
              ["b00008"],
            ),
            row(
              "Quand plafonner à 2 g/j",
              [
                "Réduire la dose en dysfonction hépatique ou rénale, insuffisance cardiaque, grand âge, dénutrition ou immunosuppression.",
                "L’association à la warfarine impose également cette prudence.",
              ],
              ["b00009", "b00115"],
            ),
          ],
        },
        {
          title: "AINS et coxibs : efficacité sous conditions",
          rows: [
            row(
              "Cibles enzymatiques",
              [
                {
                  text: "L’inhibition des cyclooxygénases réduit la synthèse des prostaglandines inflammatoires.",
                  children: [
                    "COX-1 est constitutive dans rein, plaquettes et tube digestif",
                    "COX-2 est induite par douleur, inflammation et fièvre, mais reste constitutive au rein et au cerveau",
                  ],
                },
                "La sélectivité COX-2 ne supprime donc pas le risque rénal.",
              ],
              ["b00012", "b00013"],
            ),
            row(
              "Balance digestive et vasculaire",
              [
                "Les coxibs diminuent le risque de saignement digestif seulement en l’absence d’aspirine ou d’autre antiagrégant.",
                "La sélectivité COX-2 expose à un risque thrombotique, particulièrement en maladie cardiovasculaire.",
              ],
              ["b00013", "b00014", "b00015", "b00016"],
            ),
            row(
              "Contre-indications majeures",
              [
                {
                  text: "Ne pas prescrire en contexte cardiovasculaire, digestif ou rénal à haut risque.",
                  children: [
                    "Maladie cardiovasculaire active, insuffisance cardiaque ou HTA non contrôlée",
                    "Hémorragie digestive antérieure ou clairance de créatinine < 30 mL/min",
                    "Association à un corticostéroïde ou un antiagrégant plaquettaire",
                  ],
                },
                "Le grand âge impose une évaluation rénale et une dose minimale, sans constituer seul une interdiction absolue.",
              ],
              ["b00020", "b00021"],
              images.nsaids,
            ),
            row(
              "Options injectables",
              [
                "Le kétorolac se prescrit habituellement à 30 mg IV quatre fois par jour pendant cinq jours au maximum.",
                "Après 65 ans ou sous 50 kg, réduire à 15 mg IV quatre fois par jour ; le kétoprofène peut être administré à 100 mg IV sur 20 minutes.",
              ],
              ["b00022", "b00116", "b00117"],
            ),
          ],
        },
      ],
    },
    {
      title: "Maîtriser les opioïdes sans banaliser leurs risques",
      sections: [
        {
          title: "Récepteurs, classification et titration",
          renderChunks: [3, 1],
          rows: [
            row(
              "Définition fonctionnelle",
              [
                "Le terme opioïde regroupe les ligands exogènes ou endogènes, naturels ou synthétiques, reproduisant les effets de la morphine.",
                "L’analgésie reste indissociable d’effets indésirables, dont la dépression respiratoire est le plus redouté.",
              ],
              ["b00023", "b00024", "b00118", "b00119"],
            ),
            row(
              "Trois récepteurs",
              [
                {
                  text: "Les récepteurs μ, κ et δ sont présents aux sites centraux et périphériques.",
                  children: [
                    "Les endorphines ciblent surtout μ",
                    "Les dynorphines ciblent surtout κ",
                    "Les enképhalines ciblent surtout δ",
                  ],
                },
                "Leur activation présynaptique bloque la libération de neurotransmetteurs et hyperpolarise les fibres nociceptives Aδ et C.",
              ],
              ["b00031", "b00032", "b00033"],
            ),
            row(
              "Classer pour anticiper",
              [
                "Distinguer agonistes purs, activité mixte, agonistes-antagonistes et antagonistes.",
                "La puissance relative guide les conversions, sans remplacer la titration clinique et la surveillance.",
              ],
              ["b00025", "b00026", "b00027", "b00029"],
              images.opioidClasses,
            ),
            row(
              "Morphine en SSPI et ACP",
              [
                {
                  text: "Titrer la morphine IV par bolus espacés jusqu’au soulagement.",
                  children: [
                    "Repère en SSPI : 2 à 3 mg IV toutes les 5 minutes",
                    "En ACP : bolus ajustés avec intervalle de verrouillage de 5 à 7 minutes",
                  ],
                },
                "Réévaluer simultanément douleur, vigilance et ventilation.",
              ],
              ["b00035"],
              images.opioidPower,
            ),
          ],
        },
        {
          title: "Choisir un agoniste selon la cinétique",
          rows: [
            row(
              "Codéine et oxycodone",
              [
                "La codéine dépend du CYP2D6 pour former environ 10 % de morphine : inefficacité chez le métaboliseur lent, toxicité chez l’ultrarapide.",
                "L’oxycodone orale est 1,5 à 2 fois plus puissante que la morphine et agit 4 à 5 heures.",
              ],
              ["b00036", "b00037", "b00038", "b00039"],
            ),
            row(
              "Hydromorphone et méthadone",
              [
                {
                  text: "L’hydromorphone est 5 à 7 fois plus puissante que la morphine.",
                  children: [
                    "Son principal métabolite est inactif",
                    "Elle existe par voies orale, sous-cutanée et IV selon les pays",
                  ],
                },
                "La méthadone associe agonisme opioïde, antagonisme NMDA et inhibition de recapture monoaminergique ; au-delà de 80 mg/j, surveiller le QT.",
              ],
              ["b00040", "b00041", "b00042", "b00043"],
            ),
            row(
              "Fentanyl",
              [
                "Le fentanyl est environ 100 fois plus puissant que la morphine, très liposoluble et stable sur le plan hémodynamique.",
                "Administrer 1,5 à 3 µg/kg à l’induction, idéalement 3 à 5 minutes avant la laryngoscopie ; une dose élevée peut provoquer apnée et rigidité musculaire.",
              ],
              ["b00046", "b00047", "b00048", "b00049"],
            ),
            row(
              "Sufentanil",
              [
                "Le sufentanil est 5 à 10 fois plus puissant que le fentanyl et s’équilibre rapidement avec le cerveau.",
                "Sa redistribution permet une perfusion prolongée jusqu’à environ 8 heures, mais les doses d’induction peuvent provoquer une rigidité, surtout chez le sujet âgé.",
              ],
              ["b00050", "b00051"],
            ),
            row(
              "Rémifentanil",
              [
                {
                  text: "Les estérases sanguines et plasmatiques assurent une fin d’action ultracourte.",
                  children: [
                    "Demi-vie contextuelle proche de 4 minutes, indépendante de la durée de perfusion",
                    "Absence de couverture analgésique environ cinq minutes après l’arrêt",
                  ],
                },
                "Planifier un relais avant l’arrêt et prévenir l’hyperalgésie favorisée par les fortes doses.",
              ],
              ["b00052", "b00053"],
            ),
          ],
        },
      ],
    },
    {
      title: "Gérer les profils opioïdes particuliers et l’antagonisation",
      sections: [
        {
          title: "Molécules à indications ciblées",
          rows: [
            row(
              "Mépéridine",
              [
                "La normépéridine, active et éliminée par le rein, s’accumule et expose aux convulsions.",
                "La mépéridine n’est plus un analgésique de routine ; à 0,35 mg/kg, elle peut traiter les frissons postopératoires.",
              ],
              ["b00044", "b00045"],
            ),
            row(
              "Nalbuphine",
              [
                {
                  text: "L’agonisme partiel produit un effet plafond analgésique et respiratoire vers 30 mg.",
                  children: [
                    "Dose adulte usuelle : 10 mg IV, renouvelable toutes les 3 heures",
                    "Une dose de 5 à 10 mg traite le prurit neuraxial induit par un opioïde",
                  ],
                },
                "Elle préserve mieux la ventilation mais ne fournit qu’une analgésie limitée.",
              ],
              ["b00054", "b00055", "b00056"],
            ),
            row(
              "Buprénorphine",
              [
                "Cet agoniste partiel μ à très forte affinité est 30 fois plus puissant que la morphine IV et agit environ 12 heures.",
                "Son élimination biliaire rend le timbre à faible dose intéressant en insuffisance rénale sévère, mais son effet résiste à la naloxone.",
              ],
              ["b00057", "b00058", "b00059"],
            ),
            row(
              "Tramadol et tapentadol",
              [
                {
                  text: "Ces antalgiques associent une action opioïde à une modulation des voies monoaminergiques descendantes.",
                  children: [
                    "Tramadol : recapture sérotonine et noradrénaline, métabolite actif CYP2D6",
                    "Tapentadol : recapture surtout noradrénergique, glucuronidation sans métabolite actif",
                  ],
                },
                "Le polymorphisme CYP2D6 rend le tramadol peu fiable chez les métaboliseurs lents.",
              ],
              ["b00060", "b00061", "b00062", "b00063", "b00064"],
            ),
          ],
        },
        {
          title: "Renverser sans supprimer toute analgésie",
          rows: [
            row(
              "Naloxone titrée",
              [
                {
                  text: "Administrer 0,5 à 1 µg/kg toutes les 5 minutes pour restaurer ventilation ou vigilance.",
                  children: [
                    "Pic d’effet : 1 à 2 minutes",
                    "Durée : 30 à 45 minutes, souvent plus courte que celle de l’opioïde",
                  ],
                },
                "Une antagonisation brutale expose à douleur, HTA, tachycardie, arythmie et œdème pulmonaire.",
              ],
              ["b00065", "b00066"],
            ),
            row(
              "Perfusion et récurrence",
              [
                "Une intoxication ou une formulation opioïde prolongée peut justifier une perfusion de naloxone à 3–10 µg/h.",
                "Poursuivre la surveillance après l’amélioration initiale pour détecter une renarcotisation.",
              ],
              ["b00066"],
            ),
            row(
              "Antagonistes périphériques",
              [
                "Méthylnaltrexone et naltrexone périphérique traitent constipation ou iléus sans franchir la barrière hémato-encéphalique.",
                "Le naloxégol, faiblement biodisponible par voie orale, contrôle la constipation avec un faible risque de sevrage.",
              ],
              ["b00067", "b00068"],
            ),
          ],
        },
      ],
    },
    {
      title: "Ajouter des coanalgésiques périopératoires",
      sections: [
        {
          title: "Kétamine et lidocaïne IV",
          rows: [
            row(
              "Kétamine : double fonction",
              [
                {
                  text: "La kétamine est le seul hypnotique anesthésique doté d’une analgésie puissante.",
                  children: [
                    "Antagonisme non spécifique des récepteurs NMDA",
                    "Norkétamine active, trois fois moins puissante, prolongeant l’analgésie",
                  ],
                },
                "Elle n’entraîne pas la dépression respiratoire caractéristique des opioïdes.",
              ],
              ["b00069", "b00070", "b00071", "b00120"],
            ),
            row(
              "Effets psychodysleptiques",
              [
                "Délirium, agitation, dysphorie ou euphorie peuvent limiter l’emploi, alors que bronchodilatation et stimulation sympathique peuvent être utiles.",
                "Le midazolam réduit les phénomènes d’émergence.",
              ],
              ["b00071", "b00120"],
            ),
            row(
              "Dose subanesthésique",
              [
                "Un bolus de 0,5 à 1 mg/kg puis une perfusion de 0,2 à 0,8 mg/kg permet une stratégie antihyperalgésique.",
                "Elle est particulièrement utile lors de douleur complexe ou d’exposition importante aux opioïdes.",
              ],
              ["b00072", "b00120"],
            ),
            row(
              "Lidocaïne systémique",
              [
                "La lidocaïne IV constitue une alternative non opioïde dans des situations ciblées.",
                "Elle peut diminuer douleur, consommation d’opioïdes, iléus et durée de séjour.",
              ],
              ["b00073", "b00074", "b00120"],
            ),
          ],
        },
        {
          title: "Gabapentinoïdes",
          rows: [
            row(
              "Mécanisme",
              [
                {
                  text: "Gabapentine et prégabaline modulent la sous-unité α2δ des canaux calciques.",
                  children: [
                    "Diminution de la libération synaptique de neurotransmetteurs",
                    "Effet antalgique et antihyperalgésique",
                  ],
                },
                "Ce mécanisme ne correspond pas à une action directe sur les récepteurs GABA.",
              ],
              ["b00075", "b00076", "b00080", "b00081"],
            ),
            row(
              "Comparer les deux agents",
              [
                "La prégabaline possède une biodisponibilité supérieure à 90 % et proportionnelle à la dose.",
                "Les deux molécules sont éliminées par le rein et nécessitent un ajustement si la clairance est inférieure à 30 mL/min.",
              ],
              ["b00077", "b00079", "b00080"],
              images.gabapentinoids,
            ),
            row(
              "Place clinique et vigilance",
              [
                "Les gabapentinoïdes sont des traitements de première ligne de nombreuses douleurs neuropathiques chroniques.",
                "Somnolence, étourdissement, ataxie, confusion, diplopie et œdèmes imposent une titration prudente.",
              ],
              ["b00081", "b00082", "b00120"],
            ),
          ],
        },
      ],
    },
    {
      title: "Traiter la douleur neuropathique par les voies descendantes",
      sections: [
        {
          title: "Antidépresseurs : mécanismes antalgiques",
          renderChunks: [1, 2],
          rows: [
            row(
              "Renforcer l’inhibition descendante",
              [
                {
                  text: "L’inhibition de recapture augmente noradrénaline et sérotonine dans la moelle et le tronc cérébral.",
                  children: [
                    "Tricycliques : effets monoaminergiques et blocage de canaux sodiques",
                    "IRSN : inhibition conjointe des recaptures sérotoninergique et noradrénergique",
                  ],
                },
              ],
              ["b00083", "b00084", "b00085", "b00086", "b00088"],
              images.antidepressantMechanisms,
            ),
            row(
              "Mobiliser des cibles complémentaires",
              [
                "Selon la molécule, le blocage des canaux sodiques ou calciques limite l’hypersensibilisation périphérique ou centrale.",
                "Un antagonisme NMDA et une faible affinité μ peuvent compléter la modulation monoaminergique.",
              ],
              ["b00088"],
            ),
            row(
              "Indication dominante",
              [
                "L’efficacité est surtout établie dans les douleurs chroniques neuropathiques.",
                "Ces médicaments n’ont pas une place démontrée dans la douleur aiguë postopératoire.",
              ],
              ["b00084", "b00089", "b00120"],
            ),
          ],
        },
        {
          title: "Choisir selon la tolérance",
          renderChunks: [2, 1],
          rows: [
            row(
              "Tricycliques",
              [
                "Amitriptyline et imipramine, amines tertiaires, exposent fortement aux effets anticholinergiques, antihistaminiques et antiadrénergiques.",
                "Nortriptyline et désipramine, amines secondaires, sont souvent mieux tolérées chez le sujet âgé.",
              ],
              ["b00088", "b00090", "b00093"],
            ),
            row(
              "ISRS et IRSN",
              [
                {
                  text: "L’absence d’effets anticholinergiques améliore souvent la tolérance.",
                  children: [
                    "Effets sérotoninergiques : nausées, céphalées, asthénie, dysfonction sexuelle",
                    "Effets adrénergiques : tremblements, tachycardie, sueurs, insomnie",
                  ],
                },
                "L’association de plusieurs agents sérotoninergiques expose au syndrome sérotoninergique.",
              ],
              [
                "b00088",
                "b00090",
                "b00092",
                "b00094",
                "b00095",
                "b00097",
                "b00098",
                "b00099",
                "b00100",
              ],
              images.antidepressantProfiles,
            ),
            row(
              "Contre-indications à retenir",
              [
                "Les IMAO contre-indiquent globalement ces associations ; glaucome et prostatisme limitent les tricycliques.",
                "Le bupropion est contre-indiqué en épilepsie et devient convulsivant à dose élevée.",
              ],
              ["b00092", "b00093", "b00094"],
              images.antidepressantEffects,
            ),
          ],
        },
      ],
    },
    {
      title: "Positionner les cannabinoïdes sans extrapoler",
      sections: [
        {
          title: "Système endocannabinoïde",
          rows: [
            row(
              "Deux familles de récepteurs",
              [
                {
                  text: "CB1 prédomine dans le cerveau et les voies nociceptives ; CB2 est surtout immunitaire.",
                  children: [
                    "CB1 participe aux effets centraux, limbiques et antiémétiques",
                    "CB2 contribue aux effets périphériques et anti-inflammatoires",
                  ],
                },
                "Plus de cent cannabinoïdes sont décrits, dont le THC et le CBD sont les plus étudiés.",
              ],
              ["b00101", "b00102", "b00103", "b00104", "b00105"],
            ),
            row(
              "Signal rétrograde",
              [
                "Les endocannabinoïdes sont synthétisés postsynaptiquement à partir de l’acide arachidonique.",
                "Ils reviennent activer les récepteurs présynaptiques et modulent glutamate, substance P, noradrénaline et sérotonine.",
              ],
              ["b00106"],
            ),
            row(
              "Effets indésirables",
              [
                "La distribution centrale et périphérique explique troubles cognitifs, somnolence, confusion, dysphorie et effets cardiovasculaires.",
                "La voie inhalée ajoute bronchite, atteinte obstructive et risque néoplasique respiratoire.",
              ],
              ["b00106", "b00107", "b00109"],
              images.cannabinoidEffects,
            ),
          ],
        },
        {
          title: "THC, CBD et place clinique",
          rows: [
            row(
              "Différencier les composés",
              [
                {
                  text: "Le THC active CB1 et partiellement CB2 ; il est psychoactif.",
                  children: [
                    "Effets antalgiques, anxiolytiques, antiémétiques et orexigènes",
                    "Risque d’euphorie, dysphorie, altération cognitive et dépendance",
                  ],
                },
                "Le CBD ne se lie pas directement à ces récepteurs et n’est pas psychoactif ; il possède des effets anti-inflammatoires et antiépileptiques.",
              ],
              ["b00103", "b00111"],
            ),
            row(
              "Produits disponibles",
              [
                "Nabilone est un analogue synthétique du THC ; nabiximols associe THC et CBD.",
                "Les phytocannabinoïdes présentent des concentrations variables et des formulations hétérogènes.",
              ],
              ["b00109", "b00111"],
            ),
            row(
              "Ne pas transposer la douleur chronique",
              [
                "Les cannabinoïdes peuvent avoir une place dans certaines douleurs chroniques réfractaires.",
                "Les essais en douleur aiguë postopératoire ne montrent pas de bénéfice concluant.",
              ],
              ["b00111", "b00112", "b00120"],
              images.cannabinoidProducts,
            ),
          ],
        },
      ],
    },
  ];

  return {
    matiere: "Anesthésie-Réanimation",
    title: "Les médicaments de la douleur",
    year: "2026-2027",
    coverSubtitle: "Construire une analgésie efficace, multimodale et sûre",
    imageOmissions: [
      {
        path: "img/img_004.png",
        reason: "unreadable",
        justification:
          "Le tableau source est vide sous ses en-têtes et ne transmet aucune information pédagogique exploitable.",
      },
    ],
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
          ["Paracétamol adulte", "1 g toutes les 6 h ; maximum habituel 4 g/j"],
          ["Paracétamol fragile", "Maximum 2 g/j"],
          ["Kétorolac", "30 mg IV QID, 5 jours maximum"],
          ["Morphine en SSPI", "2–3 mg IV toutes les 5 min"],
          ["Fentanyl", "≈ 100 fois la puissance de la morphine"],
          ["Rémifentanil", "Demi-vie contextuelle ≈ 4 min"],
          ["Naloxone", "0,5–1 µg/kg toutes les 5 min"],
          ["Kétamine", "Bolus subanesthésique 0,5–1 mg/kg"],
        ],
      },
      tables: [
        {
          title: "Stratégie",
          headers: ["Situation", "Orientation"],
          rows: [
            [
              "Douleur postopératoire courante",
              "Paracétamol ± AINS si absence de contre-indication",
            ],
            [
              "Insuffisance rénale sévère",
              "Éviter AINS ; ajuster gabapentinoïdes",
            ],
            [
              "Opioïde ultracourt",
              "Programmer le relais avant l’arrêt du rémifentanil",
            ],
            [
              "Dépression respiratoire opioïde",
              "Naloxone titrée et surveillance prolongée",
            ],
            [
              "Douleur neuropathique",
              "Gabapentinoïde ou antidépresseur selon terrain",
            ],
          ],
        },
        {
          title: "Pièges",
          headers: ["Médicament", "Risque distinctif"],
          rows: [
            ["Paracétamol", "NAPQI et nécrose hépatique"],
            ["Coxib", "Thrombose vasculaire"],
            ["Codéine / tramadol", "Variabilité CYP2D6"],
            ["Méthadone", "QT prolongé, surtout > 80 mg/j"],
            ["Mépéridine", "Normépéridine et convulsions"],
            ["Fentanyl / sufentanil", "Rigidité musculaire à forte dose"],
          ],
        },
      ],
      keyPoints: [
        "Associer des mécanismes différents réduit l’exposition aux opioïdes.",
        "Adapter paracétamol et AINS au foie, au rein et au risque cardiovasculaire.",
        "La dépression respiratoire reste le risque majeur de tous les opioïdes.",
        "Le rémifentanil exige un relais analgésique anticipé.",
        "La naloxone doit être titrée et sa courte durée impose une surveillance.",
        "Kétamine et gabapentinoïdes ciblent l’hyperalgésie par des voies distinctes.",
        "Les antidépresseurs traitent surtout la douleur neuropathique chronique.",
        "Les cannabinoïdes n’ont pas d’efficacité démontrée en douleur aiguë postopératoire.",
      ],
      eclair: [
        "Paracétamol : 1 g toutes les 6 h ; 2 g/j chez le patient fragile.",
        "AINS : rechercher risque digestif, rénal et cardiovasculaire avant toute prescription.",
        "Morphine : titrer par petits bolus avec surveillance respiratoire.",
        "Rémifentanil : relais obligatoire avant l’arrêt.",
        "Naloxone : 0,5–1 µg/kg, répéter toutes les 5 minutes.",
        "Kétamine : antagoniste NMDA analgésique sans dépression respiratoire opioïde.",
        "Gabapentinoïdes : ajuster à la fonction rénale et surveiller la somnolence.",
        "Antidépresseurs : arbitrer efficacité neuropathique et effets anticholinergiques.",
        "THC psychoactif ; CBD non psychoactif.",
        "Pas de bénéfice concluant des cannabinoïdes en douleur aiguë.",
      ],
    },
  };
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

const card = (recto, verso, sourceBlocks) => ({
  recto,
  verso,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});

function buildFlashcards() {
  return [
    card(
      "Quel principe définit l’analgésie multimodale ?",
      "Associer des antalgiques de mécanismes différents.",
      "b00003",
    ),
    card(
      "Quelle intensité de douleur relève du paracétamol ?",
      "Une douleur légère à modérée.",
      "b00010",
    ),
    card(
      "Quel bénéfice périopératoire apporte le paracétamol ?",
      "Il réduit la consommation d’opioïdes.",
      "b00010",
    ),
    card(
      "Quelle dose unitaire adulte de paracétamol utiliser ?",
      "1 000 mg par voie orale.",
      "b00009",
    ),
    card(
      "À quel intervalle donner le paracétamol adulte ?",
      "Toutes les 6 heures.",
      "b00009",
    ),
    card(
      "Quelle dose quotidienne pédiatrique de paracétamol ?",
      "60 mg/kg/j en quatre prises de 15 mg/kg.",
      "b00009",
    ),
    card(
      "Quand administrer le paracétamol oral avant chirurgie ?",
      "Idéalement une heure avant l’intervention.",
      "b00009",
    ),
    card(
      "Quelle biodisponibilité orale a le paracétamol ?",
      "Environ 70 à 80 %.",
      "b00009",
    ),
    card(
      "Quel plafond quotidien retenir chez un patient fragile ?",
      "2 g par jour.",
      "b00009",
    ),
    card(
      "Quelles conjugaisons dominent le métabolisme du paracétamol ?",
      "Glucuronidation 60 % et sulfatation 30 %.",
      "b00008",
    ),
    card(
      "Quel métabolite réactif du paracétamol est hépatotoxique ?",
      "Le NAPQI.",
      "b00008",
    ),
    card(
      "Quelle molécule neutralise normalement le NAPQI ?",
      "Le glutathion.",
      "b00008",
    ),
    card(
      "Quelle lésion hépatique provoque l’accumulation de NAPQI ?",
      "Une nécrose centrolobulaire.",
      "b00008",
    ),
    card(
      "Quel effet a l’association paracétamol-AINS ?",
      "Elle peut améliorer l’analgésie et épargner les opioïdes.",
      ["b00011", "b00117"],
    ),
    card(
      "Quelle enzyme les AINS inhibent-ils ?",
      "La cyclooxygénase.",
      "b00013",
    ),
    card(
      "Où la COX-1 est-elle constitutive ?",
      "Reins, plaquettes et tractus gastro-intestinal.",
      "b00013",
    ),
    card(
      "Dans quels états la COX-2 est-elle fortement induite ?",
      "Douleur, inflammation et fièvre.",
      "b00013",
    ),
    card(
      "Pourquoi les coxibs restent-ils néphrotoxiques ?",
      "La COX-2 est aussi constitutive dans le rein.",
      "b00013",
    ),
    card(
      "Quel avantage digestif offrent les coxibs ?",
      "Moins de saignements digestifs sans antiagrégant associé.",
      "b00013",
    ),
    card(
      "Quel risque vasculaire accompagne les coxibs ?",
      "Un risque thrombotique artériel.",
      "b00014",
    ),
    card("Quel coxib a été retiré du marché ?", "Le rofécoxib.", "b00015"),
    card(
      "Quelle dose aiguë de célécoxib est citée ?",
      "200 mg par voie orale deux fois par jour.",
      "b00016",
    ),
    card(
      "À quelle clairance les AINS sont-ils contre-indiqués ?",
      "Clairance de créatinine inférieure à 30 mL/min.",
      "b00021",
    ),
    card(
      "Le grand âge interdit-il absolument les AINS ?",
      "Non, mais il impose une prudence rénale renforcée.",
      "b00021",
    ),
    card(
      "Quelle dose usuelle de kétorolac IV chez l’adulte ?",
      "30 mg IV quatre fois par jour.",
      "b00022",
    ),
    card(
      "Quelle durée maximale pour le kétorolac injectable ?",
      "Cinq jours.",
      "b00022",
    ),
    card(
      "Quelle dose de kétorolac après 65 ans ou sous 50 kg ?",
      "15 mg IV quatre fois par jour.",
      "b00022",
    ),
    card(
      "Quelle dose de kétoprofène IV est citée ?",
      "100 mg sur 20 minutes, une à trois fois par jour.",
      "b00022",
    ),
    card(
      "Quel effet indésirable opioïde est le plus redouté ?",
      "La dépression respiratoire.",
      ["b00024", "b00119"],
    ),
    card(
      "Quels sont les trois principaux récepteurs opioïdes ?",
      "μ, κ et δ.",
      "b00032",
    ),
    card(
      "Quel ligand endogène cible surtout le récepteur μ ?",
      "Les endorphines.",
      "b00032",
    ),
    card(
      "Quelle famille de peptides endogènes présente une affinité préférentielle pour κ ?",
      "Les dynorphines.",
      "b00032",
    ),
    card(
      "À quel peptide endogène le récepteur δ répond-il préférentiellement ?",
      "Les enképhalines.",
      "b00032",
    ),
    card(
      "Comment les récepteurs opioïdes bloquent-ils la nociception ?",
      "Ils inhibent la libération synaptique et hyperpolarisent la membrane.",
      "b00032",
    ),
    card(
      "Quelle dose de morphine IV titrer en SSPI ?",
      "2 à 3 mg toutes les 5 minutes.",
      "b00035",
    ),
    card(
      "Quel opioïde est le plus utilisé en ACP IV ?",
      "La morphine.",
      "b00035",
    ),
    card(
      "Quelle part de codéine est transformée en morphine ?",
      "Environ 10 %.",
      "b00037",
    ),
    card(
      "Quelle enzyme active la codéine en morphine ?",
      "Le CYP2D6.",
      "b00037",
    ),
    card(
      "Pourquoi la codéine est-elle peu fiable chez le métaboliseur lent ?",
      "Il forme peu de morphine et obtient peu d’analgésie.",
      "b00037",
    ),
    card(
      "Quel risque existe chez le métaboliseur ultrarapide de codéine ?",
      "Une production excessive de morphine et une toxicité.",
      "b00037",
    ),
    card(
      "Quelle puissance orale a l’oxycodone face à la morphine ?",
      "Environ 1,5 à 2 fois celle de la morphine.",
      "b00039",
    ),
    card(
      "Quelle durée d’action a l’oxycodone ?",
      "Environ 4 à 5 heures.",
      "b00039",
    ),
    card(
      "Quel métabolite actif produit l’oxycodone ?",
      "L’oxymorphone via le CYP2D6.",
      "b00039",
    ),
    card(
      "Quelle puissance a l’hydromorphone face à la morphine ?",
      "Environ 5 à 7 fois celle de la morphine.",
      "b00041",
    ),
    card(
      "Le métabolite principal de l’hydromorphone est-il actif ?",
      "Non, l’hydromorphone-3-glucuronide est inactif.",
      "b00041",
    ),
    card(
      "Quelle demi-vie caractérise la méthadone ?",
      "Une longue demi-vie de 18 à 45 heures.",
      "b00043",
    ),
    card(
      "Quel récepteur non opioïde la méthadone antagonise-t-elle ?",
      "NMDA, cible impliquée dans la sensibilisation centrale.",
      "b00043",
    ),
    card(
      "À partir de quelle dose de méthadone le QT inquiète-t-il surtout ?",
      "Au-delà de 80 mg par jour.",
      "b00043",
    ),
    card(
      "Quel métabolite de la mépéridine est neurotoxique ?",
      "La normépéridine.",
      "b00045",
    ),
    card(
      "Quelle complication expose la normépéridine accumulée ?",
      "Des convulsions.",
      "b00045",
    ),
    card(
      "Quelle dose de mépéridine traite les frissons postopératoires ?",
      "0,35 mg/kg.",
      "b00045",
    ),
    card(
      "Quelle puissance a le fentanyl face à la morphine ?",
      "Environ 100 fois celle de la morphine.",
      "b00047",
    ),
    card(
      "Quand injecter le fentanyl avant laryngoscopie ?",
      "Trois à cinq minutes avant.",
      "b00047",
    ),
    card(
      "Quelle dose d’induction du fentanyl est citée ?",
      "1,5 à 3 µg/kg.",
      "b00047",
    ),
    card(
      "Quel avantage circulatoire a le fentanyl ?",
      "Il ne déprime pas le myocarde et ne libère pas d’histamine.",
      "b00047",
    ),
    card(
      "Quel effet musculaire peut suivre une forte dose de fentanyl ?",
      "Une rigidité pouvant gêner la ventilation.",
      "b00048",
    ),
    card(
      "Quel traitement rapide corrige une rigidité au fentanyl ?",
      "Un bloqueur neuromusculaire.",
      "b00048",
    ),
    card(
      "Quelle puissance a le sufentanil face au fentanyl ?",
      "Environ 5 à 10 fois celle du fentanyl.",
      "b00051",
    ),
    card(
      "Quel délai d’équilibre cérébral a le sufentanil ?",
      "Environ 6 minutes.",
      "b00051",
    ),
    card(
      "Jusqu’à quelle durée le sufentanil convient-il en perfusion ?",
      "Environ 8 heures.",
      "b00051",
    ),
    card(
      "Quelle liaison rend le rémifentanil sensible aux estérases ?",
      "Une liaison ester.",
      "b00053",
    ),
    card(
      "Quelle demi-vie contextuelle a le rémifentanil ?",
      "Environ 4 minutes, indépendante de la perfusion.",
      "b00053",
    ),
    card(
      "Quel relais faut-il avant d’arrêter le rémifentanil ?",
      "Une analgésie postopératoire d’une autre classe ou durée.",
      "b00053",
    ),
    card(
      "Quel risque favorisent de fortes doses de rémifentanil ?",
      "Une hyperalgésie aiguë aux opioïdes.",
      "b00053",
    ),
    card(
      "À quelle dose l’effet plafond respiratoire de la nalbuphine apparaît-il ?",
      "Environ 30 mg.",
      "b00056",
    ),
    card(
      "Quelle dose adulte usuelle de nalbuphine ?",
      "10 mg IV, renouvelable toutes les 3 heures.",
      "b00056",
    ),
    card(
      "Quelle dose de nalbuphine traite un prurit neuraxial ?",
      "5 à 10 mg.",
      "b00056",
    ),
    card(
      "Quel profil récepteur a la buprénorphine ?",
      "Agoniste partiel μ à forte affinité et antagoniste κ.",
      "b00058",
    ),
    card(
      "Quelle durée d’action a la buprénorphine ?",
      "Environ 12 heures.",
      "b00058",
    ),
    card(
      "Pourquoi la buprénorphine convient-elle à l’insuffisance rénale ?",
      "Son élimination dépend surtout des voies biliaires.",
      ["b00058", "b00059"],
    ),
    card(
      "Quelles monoamines le tramadol recapture-t-il moins ?",
      "La sérotonine et la noradrénaline.",
      ["b00061", "b00062"],
    ),
    card(
      "Quel métabolite actif porte l’analgésie du tramadol ?",
      "L’O-desméthyl-tramadol ou M1.",
      "b00062",
    ),
    card(
      "Quelle monoamine le tapentadol cible-t-il surtout ?",
      "La noradrénaline.",
      "b00063",
    ),
    card(
      "Le tapentadol possède-t-il un métabolite actif ?",
      "Non, il est glucuronidé sans métabolite actif.",
      "b00063",
    ),
    card(
      "Quel antagoniste renverse rapidement un surdosage opioïde ?",
      "La naloxone.",
      "b00066",
    ),
    card(
      "Quelle microdose de naloxone restaure ventilation ou vigilance ?",
      "0,5 à 1 µg/kg toutes les 5 minutes.",
      "b00066",
    ),
    card(
      "Quel est le pic d’effet de la naloxone ?",
      "Une à deux minutes.",
      "b00066",
    ),
    card(
      "Combien de temps agit la naloxone ?",
      "Environ 30 à 45 minutes.",
      "b00066",
    ),
    card(
      "Quelle perfusion de naloxone est citée en intoxication ?",
      "3 à 10 µg/h.",
      "b00066",
    ),
    card(
      "Quel risque cause une antagonisation opioïde brutale ?",
      "Une décharge sympathique avec HTA, tachycardie ou arythmie.",
      "b00066",
    ),
    card(
      "Quels antagonistes traitent la constipation sans perdre l’analgésie ?",
      "Méthylnaltrexone, naltrexone périphérique ou naloxégol.",
      ["b00067", "b00068"],
    ),
    card(
      "Quel est le principal récepteur ciblé par la kétamine ?",
      "Le récepteur NMDA.",
      "b00071",
    ),
    card(
      "Quel métabolite actif prolonge l’effet de la kétamine ?",
      "La norkétamine.",
      "b00070",
    ),
    card(
      "Quelle benzodiazépine limite l’agitation à la kétamine ?",
      "Le midazolam.",
      "b00071",
    ),
    card(
      "Quelle dose subanesthésique de kétamine en bolus ?",
      "0,5 à 1 mg/kg.",
      "b00072",
    ),
    card(
      "Quelle perfusion subanesthésique de kétamine est citée ?",
      "0,2 à 0,8 mg/kg.",
      "b00072",
    ),
    card(
      "Quels bénéfices postopératoires vise la lidocaïne IV ?",
      "Moins de douleur, d’opioïdes, d’iléus et de séjour.",
      "b00074",
    ),
    card(
      "Quelle sous-unité calcique ciblent les gabapentinoïdes ?",
      "La sous-unité α2δ.",
      ["b00076", "b00080"],
    ),
    card(
      "Comment les gabapentinoïdes diminuent-ils la douleur ?",
      "Ils réduisent la libération synaptique de neurotransmetteurs.",
      "b00080",
    ),
    card(
      "Quelle biodisponibilité caractérise la prégabaline ?",
      "Plus de 90 %, proportionnelle à la dose.",
      "b00077",
    ),
    card(
      "Quelle fonction d’organe élimine les gabapentinoïdes ?",
      "La fonction rénale.",
      "b00077",
    ),
    card(
      "Quand ajuster gabapentine et prégabaline ?",
      "Si la clairance de créatinine est inférieure à 30 mL/min.",
      "b00077",
    ),
    card(
      "Quels effets neurologiques surveiller sous prégabaline ?",
      "Somnolence, étourdissement, ataxie, confusion et diplopie.",
      "b00077",
    ),
    card(
      "Quelle douleur chronique est une indication majeure des gabapentinoïdes ?",
      "La douleur neuropathique.",
      "b00082",
    ),
    card(
      "Quelles monoamines expliquent l’analgésie des antidépresseurs ?",
      "La noradrénaline et la sérotonine.",
      ["b00085", "b00088"],
    ),
    card(
      "Où les antidépresseurs renforcent-ils les voies descendantes ?",
      "Dans la moelle épinière et le tronc cérébral.",
      "b00088",
    ),
    card(
      "Quels tricycliques tertiaires sont les plus anticholinergiques ?",
      "Amitriptyline et imipramine.",
      "b00088",
    ),
    card(
      "Quels tricycliques secondaires sont mieux tolérés ?",
      "Nortriptyline et désipramine.",
      "b00088",
    ),
    card(
      "Quelle association expose au syndrome sérotoninergique ?",
      "Plusieurs antidépresseurs sérotoninergiques associés.",
      "b00094",
    ),
    card(
      "Quelles contre-indications concernent les tricycliques ?",
      "Glaucome et prostatisme.",
      "b00093",
    ),
    card(
      "Quel antidépresseur est contre-indiqué en épilepsie ?",
      "Le bupropion.",
      "b00094",
    ),
    card(
      "Quels effets anticholinergiques typiques surveiller ?",
      "Confusion, constipation, rétention urinaire, xérostomie et vision trouble.",
      "b00097",
    ),
    card(
      "Quels effets sérotoninergiques typiques surveiller ?",
      "Nausées, diarrhée, céphalées, asthénie et dysfonction sexuelle.",
      "b00100",
    ),
    card(
      "Quel récepteur cannabinoïde prédomine dans le cerveau ?",
      "Le récepteur CB1.",
      "b00104",
    ),
    card(
      "Quel récepteur cannabinoïde prédomine dans l’immunité ?",
      "Le récepteur CB2.",
      "b00105",
    ),
    card(
      "Quel précurseur membranaire forme les endocannabinoïdes ?",
      "L’acide arachidonique.",
      "b00106",
    ),
    card(
      "Quel cannabinoïde est principalement psychoactif ?",
      "Le delta-9-THC.",
      ["b00103", "b00111"],
    ),
    card(
      "Le CBD se lie-t-il directement aux récepteurs CB1 et CB2 ?",
      "Non, il agit par d’autres cibles et n’est pas psychoactif.",
      "b00111",
    ),
    card("Quel produit associe THC et CBD ?", "Le nabiximols.", [
      "b00109",
      "b00111",
    ]),
    card("Quel produit est un analogue synthétique du THC ?", "La nabilone.", [
      "b00109",
      "b00111",
    ]),
    card(
      "Quelle atteinte respiratoire menace le cannabis inhalé ?",
      "Bronchite, obstruction et risque néoplasique respiratoire.",
      "b00107",
    ),
    card(
      "Les cannabinoïdes soulagent-ils la douleur aiguë postopératoire ?",
      "Aucun bénéfice concluant n’est démontré.",
      "b00112",
    ),
  ];
}

const ISOLATED_QCM = [
  {
    title: "Paracétamol",
    questions: [
      qcm(
        "Quels éléments justifient la place du paracétamol en périopératoire ?",
        ["b00003", "b00009", "b00010"],
        "Le paracétamol associe efficacité sur la douleur modérée, bonne tolérance et effet d’épargne opioïde.",
        [
          T(
            "Il soulage la douleur légère à modérée.",
            "Son spectre antalgique correspond à ces intensités lorsqu’il est utilisé seul.",
          ),
          F(
            "Son mécanisme repose sur l’agonisme des récepteurs opioïdes μ.",
            "Le paracétamol n’est pas un opioïde et n’exerce pas son effet antalgique par agonisme μ.",
          ),
          F(
            "Son administration orale est inefficace avant une chirurgie.",
            "Sa biodisponibilité orale de 70 à 80 % rend cette voie pertinente.",
          ),
          F(
            "La grossesse constitue une contre-indication absolue aux doses usuelles.",
            "Le paracétamol peut être utilisé pendant la grossesse lorsque sa prescription est adaptée.",
          ),
          F(
            "Son administration périopératoire augmente habituellement les besoins en morphiniques.",
            "Son intérêt périopératoire réside notamment dans la réduction de la consommation d’opioïdes.",
          ),
        ],
      ),
      qcm(
        "Quelle prescription de paracétamol est conforme chez un adulte sans facteur de risque ?",
        ["b00009", "b00115"],
        "La prescription standard est de 1 g toutes les six heures, avec une voie orale privilégiée lorsque possible.",
        [
          T(
            "Une prise de 1 000 mg par voie orale.",
            "Cette dose unitaire correspond au repère adulte habituel.",
          ),
          F(
            "Un intervalle fixe de deux heures entre les prises.",
            "L’intervalle recommandé est de six heures et non de deux.",
          ),
          T(
            "Une administration environ une heure avant l’intervention.",
            "Cette anticipation exploite l’excellente absorption digestive.",
          ),
          F(
            "Une voie intrarectale prioritaire malgré une absorption erratique.",
            "La voie orale doit être préférée quand elle est disponible.",
          ),
          T(
            "Un maximum quotidien habituel de 4 g.",
            "Quatre prises de 1 g constituent le plafond standard chez l’adulte sain.",
          ),
        ],
      ),
      qcm(
        "Dans quels contextes faut-il plafonner le paracétamol à 2 g/j ?",
        ["b00009", "b00115"],
        "La réduction concerne les situations augmentant la toxicité ou modifiant l’élimination et les interactions.",
        [
          F(
            "Une douleur légère chez un adulte jeune sans comorbidité.",
            "Ce profil ne comporte aucun facteur justifiant le plafond abaissé.",
          ),
          F(
            "Une hypertension artérielle isolée et contrôlée.",
            "L’hypertension contrôlée ne fait pas partie des motifs cités pour limiter systématiquement le paracétamol à 2 g/j.",
          ),
          T(
            "Une insuffisance rénale.",
            "Le terrain rénal fait partie des conditions citées pour limiter la dose.",
          ),
          F(
            "Une prise postopératoire unique de 1 g chez un adulte sain.",
            "Une dose isolée conforme au schéma usuel ne justifie pas un plafond quotidien abaissé.",
          ),
          T(
            "Une prise concomitante de warfarine.",
            "L’interaction métabolique impose de limiter la dose quotidienne.",
          ),
        ],
      ),
      qcm(
        "Que faut-il retenir du métabolisme du paracétamol ?",
        ["b00008"],
        "Les voies de conjugaison dominent, tandis que la voie CYP produit un métabolite réactif normalement détoxifié.",
        [
          F(
            "La glucuronidation assure moins de 5 % du métabolisme du paracétamol.",
            "Elle représente environ 60 % du métabolisme et constitue sa principale voie de conjugaison.",
          ),
          F(
            "Le glutathion transforme le NAPQI en dérivé plus hépatotoxique.",
            "Le glutathion neutralise normalement ce métabolite réactif.",
          ),
          F(
            "Le NAPQI est un métabolite protecteur.",
            "Il s’agit d’un composé hautement réactif et hépatotoxique.",
          ),
          T(
            "Le glutathion neutralise normalement le NAPQI.",
            "La conjugaison au glutathion empêche l’attaque des hépatocytes.",
          ),
          T(
            "La toxicité peut produire une nécrose centrolobulaire.",
            "Cette lésion caractérise l’atteinte hépatique liée au métabolite réactif.",
          ),
        ],
      ),
      qcm(
        "Quels mécanismes centraux sont proposés pour son action antalgique ?",
        ["b00007"],
        "Plusieurs voies centrales, monoaminergiques, NMDA et endocannabinoïdes sont impliquées sans mécanisme unique certain.",
        [
          T(
            "Une activation des voies sérotoninergiques descendantes.",
            "Ces voies inhibitrices réduisent la transmission nociceptive.",
          ),
          F(
            "Une inhibition irréversible des plaquettes par COX-1.",
            "Ce mécanisme caractérise l’aspirine et non l’action antalgique centrale proposée.",
          ),
          T(
            "Un antagonisme des récepteurs NMDA.",
            "Cette hypothèse peut limiter la sensibilisation centrale.",
          ),
          T(
            "Une activation du système cannabinoïde endogène.",
            "La modulation endocannabinoïde figure parmi les voies envisagées.",
          ),
          T(
            "Une inhibition de la synthèse du monoxyde d’azote.",
            "La diminution de ce précurseur inflammatoire est une autre hypothèse.",
          ),
        ],
      ),
    ],
  },
  {
    title: "AINS et coxibs",
    questions: [
      qcm(
        "Comment distinguer les fonctions de COX-1 et COX-2 ?",
        ["b00013"],
        "COX-1 assure des fonctions constitutives, tandis que COX-2 est fortement induite par l’inflammation mais existe aussi au rein et au cerveau.",
        [
          T(
            "COX-1 est constitutive dans les plaquettes.",
            "Elle participe à la fonction plaquettaire et explique une partie du risque hémorragique.",
          ),
          F(
            "COX-1 apparaît uniquement après une stimulation inflammatoire.",
            "COX-1 est une enzyme constitutive, notamment dans les plaquettes et la muqueuse digestive.",
          ),
          T(
            "COX-2 augmente lors d’une inflammation.",
            "Son induction accompagne douleur, inflammation et fièvre.",
          ),
          F(
            "COX-2 est totalement absente du rein normal.",
            "Elle y est constitutive, ce qui maintient un risque rénal sous coxib.",
          ),
          F(
            "COX-1 n’intervient dans aucun tissu rénal.",
            "Cette isoforme est aussi constitutive au niveau des reins.",
          ),
        ],
      ),
      qcm(
        "Quels risques persistent ou apparaissent avec un coxib ?",
        ["b00013", "b00014", "b00016"],
        "La sélectivité COX-2 réduit certains saignements digestifs mais ne supprime pas la néphrotoxicité et augmente la vigilance vasculaire.",
        [
          T(
            "Une toxicité rénale comparable à celle des AINS classiques.",
            "La présence constitutive de COX-2 dans le rein explique ce risque.",
          ),
          F(
            "La sélectivité COX-2 protège le rein en situation d’hypovolémie.",
            "COX-2 est constitutive dans le rein, si bien que le risque rénal persiste sous coxib.",
          ),
          F(
            "Une protection digestive maintenue avec aspirine associée.",
            "L’antiagrégant annule l’avantage digestif attendu du coxib.",
          ),
          F(
            "Une absence absolue d’effet sur la pression artérielle.",
            "Le risque cardiovasculaire impose une évaluation de la pression artérielle.",
          ),
          T(
            "Une nécessité d’évaluer la maladie cardiovasculaire active.",
            "Ce terrain rend la prescription particulièrement dangereuse.",
          ),
        ],
      ),
      qcm(
        "Quelles situations contre-indiquent un AINS ?",
        ["b00020", "b00021"],
        "Une atteinte cardiovasculaire active, une fragilité digestive, une insuffisance rénale sévère ou certaines associations rendent le risque excessif.",
        [
          T(
            "Une clairance de créatinine à 25 mL/min.",
            "Une valeur inférieure à 30 mL/min constitue une contre-indication absolue.",
          ),
          T(
            "Un antécédent d’hémorragie digestive.",
            "La récidive hémorragique est un risque majeur sous AINS.",
          ),
          T(
            "Une insuffisance cardiaque congestive.",
            "La rétention hydrosodée et le risque rénal peuvent décompenser le patient.",
          ),
          T(
            "Une hypertension artérielle non contrôlée.",
            "Ce terrain appartient aux contre-indications cardiovasculaires citées.",
          ),
          T(
            "La prise concomitante d’un antiagrégant plaquettaire.",
            "Cette association augmente le risque hémorragique et figure parmi les situations à éviter.",
          ),
        ],
      ),
      qcm(
        "Quelle utilisation du kétorolac IV respecte les repères proposés ?",
        ["b00022"],
        "Le kétorolac impose une durée courte et une réduction de dose chez le sujet âgé ou de faible poids.",
        [
          T(
            "30 mg IV quatre fois par jour chez un adulte jeune.",
            "Cette dose correspond au schéma usuel cité.",
          ),
          F(
            "Un traitement continu pendant trois semaines.",
            "L’administration doit rester limitée à cinq jours en raison du risque rénal.",
          ),
          T(
            "15 mg IV quatre fois par jour après 65 ans.",
            "La dose réduite diminue l’exposition du sujet âgé.",
          ),
          T(
            "15 mg IV quatre fois par jour chez un patient de 45 kg.",
            "Un poids inférieur à 50 kg justifie la même réduction.",
          ),
          T(
            "La durée d’administration reste limitée à cinq jours.",
            "Ce plafond réduit l’exposition aux complications rénales, digestives et hémorragiques.",
          ),
        ],
      ),
      qcm(
        "Quels principes sécurisent une prescription courte d’AINS ?",
        ["b00017", "b00020", "b00021"],
        "Une indication justifiée, la dose minimale, la durée la plus courte et la recherche d’interactions réduisent le risque.",
        [
          F(
            "Une dose initiale élevée est préférable à la plus faible dose efficace.",
            "La sécurité repose sur la dose minimale efficace pendant la durée la plus courte.",
          ),
          T(
            "Employer la plus faible dose efficace.",
            "La toxicité augmente avec l’exposition et doit être minimisée.",
          ),
          F(
            "Associer deux AINS pour obtenir un effet additif.",
            "Le cumul augmente la toxicité sans justification antalgique acceptable.",
          ),
          T(
            "Limiter la durée au strict nécessaire.",
            "Une exposition brève réduit les complications rénales et digestives.",
          ),
          T(
            "Vérifier l’absence d’antiagrégant ou d’antivitamine K.",
            "Ces traitements associés majorent le risque hémorragique.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Principes opioïdes",
    questions: [
      qcm(
        "Quels faits décrivent l’action des récepteurs opioïdes ?",
        ["b00024", "b00032"],
        "Les récepteurs μ, κ et δ inhibent la transmission nociceptive à plusieurs niveaux mais partagent des effets indésirables.",
        [
          T(
            "Ils sont présents dans des structures centrales et périphériques.",
            "Cette distribution explique une analgésie spinale, supraspinale et périphérique.",
          ),
          T(
            "Leur activation présynaptique diminue la libération de neurotransmetteurs.",
            "Le signal nociceptif est moins transmis depuis les fibres Aδ et C.",
          ),
          T(
            "Ils provoquent une hyperpolarisation membranaire.",
            "La membrane devient moins excitable et la propagation douloureuse diminue.",
          ),
          T(
            "Les dynorphines présentent une affinité préférentielle pour le récepteur κ.",
            "Cette correspondance complète celle des endorphines avec μ et des enképhalines avec δ.",
          ),
          T(
            "Les endorphines ont une affinité préférentielle pour μ.",
            "Cette correspondance relie un ligand endogène au récepteur mu.",
          ),
        ],
      ),
      qcm(
        "Comment conduire une titration de morphine en SSPI ?",
        ["b00035"],
        "La titration fractionnée recherche le soulagement tout en surveillant vigilance et ventilation après chaque bolus.",
        [
          F(
            "Les bolus de morphine peuvent être rapprochés à moins d’une minute en routine.",
            "Un délai d’environ cinq minutes permet d’évaluer l’effet avant le bolus suivant.",
          ),
          T(
            "Respecter environ cinq minutes entre les bolus.",
            "Le délai permet d’observer l’effet avant une nouvelle injection.",
          ),
          F(
            "Administrer d’emblée toute la dose quotidienne prévue.",
            "Un bolus massif expose à une sédation et une dépression respiratoire brutales.",
          ),
          T(
            "Réévaluer simultanément la douleur et la respiration.",
            "Le bénéfice antalgique doit rester compatible avec une ventilation sûre.",
          ),
          F(
            "Poursuivre automatiquement malgré une somnolence croissante.",
            "La baisse de vigilance signale une accumulation et impose l’arrêt de la titration.",
          ),
        ],
      ),
      qcm(
        "Pourquoi la codéine procure-t-elle une réponse imprévisible ?",
        ["b00037"],
        "La formation CYP2D6-dépendante de morphine varie fortement selon le phénotype métabolique.",
        [
          T(
            "Elle a une faible affinité intrinsèque pour les récepteurs opioïdes.",
            "Son effet dépend largement de la morphine formée.",
          ),
          F(
            "La codéine est directement active sans biotransformation préalable.",
            "Son effet antalgique dépend largement de sa conversion en morphine par le CYP2D6.",
          ),
          T(
            "Un métaboliseur lent peut ne pas être soulagé.",
            "La faible production de morphine rend l’analgésie insuffisante.",
          ),
          T(
            "Un métaboliseur ultrarapide risque une toxicité.",
            "La production abondante de morphine majore les effets respiratoires et neurologiques.",
          ),
          F(
            "L’échec chez le métaboliseur lent traduit une absence d’absorption digestive.",
            "L’inefficacité provient surtout de la faible formation de morphine, et non d’un défaut d’absorption.",
          ),
        ],
      ),
      qcm(
        "Quels repères permettent de comparer les agonistes usuels ?",
        ["b00039", "b00041", "b00047", "b00051"],
        "Les puissances relatives diffèrent fortement et doivent être combinées à la cinétique et au terrain.",
        [
          F(
            "L’oxycodone orale est dix fois moins puissante que la morphine.",
            "Elle est environ 1,5 à 2 fois plus puissante que la morphine orale.",
          ),
          F(
            "L’hydromorphone est moins puissante que la codéine.",
            "Elle est cinq à sept fois plus puissante que la morphine.",
          ),
          T(
            "Le fentanyl est environ cent fois plus puissant que la morphine.",
            "Une dose en microgrammes produit un effet opioïde majeur.",
          ),
          T(
            "Le sufentanil dépasse encore la puissance du fentanyl.",
            "Son affinité mu le rend cinq à dix fois plus puissant que le fentanyl.",
          ),
          F(
            "La puissance relative dispense de toute titration clinique.",
            "Les conversions ne remplacent jamais la surveillance de l’effet individuel.",
          ),
        ],
      ),
      qcm(
        "Quels effets indésirables communs imposent une surveillance opioïde ?",
        ["b00024", "b00048", "b00119"],
        "La ventilation, la vigilance, le transit et les effets centraux doivent être suivis tout au long de l’exposition.",
        [
          F(
            "La bradypnée sous opioïde indique une analgésie optimale sans toxicité.",
            "Une baisse de fréquence respiratoire signale un effet opioïde excessif potentiellement grave.",
          ),
          T(
            "Une sédation croissante.",
            "La baisse de vigilance précède parfois l’insuffisance ventilatoire.",
          ),
          F(
            "Une bronchodilatation obligatoire pour tous les agents.",
            "Ce n’est pas un effet de classe des opioïdes.",
          ),
          T(
            "Une constipation ou un iléus.",
            "L’action périphérique digestive ralentit le transit.",
          ),
          T(
            "Un prurit parfois intolérable.",
            "Cet effet peut nécessiter une antagonisation titrée ou un agoniste-antagoniste.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Agonistes puissants",
    questions: [
      qcm(
        "Quel usage du fentanyl est cohérent à l’induction ?",
        ["b00047", "b00048"],
        "Le fentanyl doit être anticipé avant la laryngoscopie, dosé selon le terrain et surveillé pour apnée ou rigidité.",
        [
          T(
            "Administrer 1,5 à 3 µg/kg avec l’hypnotique.",
            "Cette plage correspond au repère d’induction proposé.",
          ),
          T(
            "L’injecter trois à cinq minutes avant la laryngoscopie.",
            "Le délai optimise le contrôle des réponses hémodynamiques.",
          ),
          T(
            "Sa forte liposolubilité favorise une installation centrale rapide.",
            "Cette propriété permet au fentanyl d’atteindre rapidement ses sites d’action cérébraux.",
          ),
          T(
            "Prévoir une ventilation assistée en cas d’apnée.",
            "Une forte sédation peut supprimer la respiration spontanée.",
          ),
          T(
            "Traiter une rigidité majeure par bloqueur neuromusculaire.",
            "La curarisation restaure rapidement la possibilité de ventiler.",
          ),
        ],
      ),
      qcm(
        "Quelles propriétés caractérisent le sufentanil ?",
        ["b00051"],
        "Le sufentanil associe forte puissance, équilibre cérébral rapide et aptitude aux perfusions prolongées.",
        [
          F(
            "Le sufentanil est moins puissant que la morphine.",
            "Il est beaucoup plus puissant que la morphine et cinq à dix fois plus puissant que le fentanyl.",
          ),
          F(
            "Son délai d’équilibre cérébral dépasse une heure.",
            "L’équilibre est obtenu en environ six minutes.",
          ),
          T(
            "Une perfusion peut être poursuivie jusqu’à environ huit heures.",
            "Sa redistribution le rend adapté à une administration continue prolongée.",
          ),
          T(
            "Une forte dose peut provoquer une rigidité musculaire.",
            "Cet effet est particulièrement observé chez le sujet âgé.",
          ),
          F(
            "Il est dépourvu des effets secondaires du fentanyl.",
            "À dose équivalente, son profil indésirable reste comparable.",
          ),
        ],
      ),
      qcm(
        "Pourquoi le rémifentanil est-il hautement titrable ?",
        ["b00053"],
        "Son hydrolyse rapide par les estérases rend sa fin d’action brève et indépendante de la durée de perfusion.",
        [
          T(
            "Sa liaison ester est hydrolysée dans le sang et le plasma.",
            "Le métabolisme survient sans dépendre d’une redistribution lente.",
          ),
          T(
            "Sa demi-vie contextuelle reste proche de quatre minutes.",
            "La durée de perfusion modifie peu cette valeur.",
          ),
          F(
            "Il s’accumule massivement après chaque bolus.",
            "Son métabolisme rapide empêche l’accumulation significative.",
          ),
          T(
            "Le retour à la respiration spontanée est prévisible.",
            "La disparition rapide de l’effet rend le réveil fiable.",
          ),
          T(
            "Son action peut être ajustée par perfusion ou objectif de concentration.",
            "La cinétique ultracourte autorise une modulation fine de l’effet.",
          ),
        ],
      ),
      qcm(
        "Quelles précautions accompagnent l’arrêt du rémifentanil ?",
        ["b00053"],
        "L’absence de persistance antalgique et le risque d’hyperalgésie imposent un relais précoce et une stratégie multimodale.",
        [
          T(
            "Administrer un antalgique de relais avant la fin de perfusion.",
            "L’effet du rémifentanil disparaît en quelques minutes.",
          ),
          F(
            "Attendre la douleur intense pour commencer le relais.",
            "Une telle attente crée une rupture prévisible de couverture antalgique.",
          ),
          T(
            "Éviter les doses excessives prolongées.",
            "Les fortes expositions favorisent une hyperalgésie aiguë.",
          ),
          T(
            "Prévoir une analgésie postopératoire non ultracourte.",
            "Une autre molécule doit couvrir la période suivant l’arrêt.",
          ),
          T(
            "Transmettre à la SSPI le risque d’hyperalgésie après une forte exposition.",
            "Les doses élevées de rémifentanil peuvent favoriser une sensibilisation douloureuse aiguë.",
          ),
        ],
      ),
      qcm(
        "Quels profils distinguent méthadone et hydromorphone ?",
        ["b00041", "b00043"],
        "L’hydromorphone est un agoniste puissant à métabolite inactif ; la méthadone a une longue demi-vie et plusieurs cibles.",
        [
          F(
            "L’hydromorphone est éliminée sans formation de glucuronide.",
            "Elle forme notamment un hydromorphone-3-glucuronide dépourvu d’activité antalgique.",
          ),
          F(
            "Son glucuronide principal prolonge fortement l’analgésie.",
            "L’hydromorphone-3-glucuronide est inactif et ne renforce pas l’effet antalgique.",
          ),
          T(
            "La méthadone antagonise les récepteurs NMDA.",
            "Cette action peut être utile dans l’hyperalgésie.",
          ),
          T(
            "La méthadone inhibe la recapture de monoamines.",
            "Cette propriété complète son agonisme opioïde.",
          ),
          T(
            "Une dose quotidienne élevée de méthadone expose au QT long.",
            "Le risque devient particulièrement signalé au-delà de 80 mg/j.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Opioïdes particuliers",
    questions: [
      qcm(
        "Pourquoi la mépéridine n’est-elle plus un analgésique de routine ?",
        ["b00045"],
        "Sa faible puissance et l’accumulation d’un métabolite neurotoxique rendent le rapport bénéfice-risque défavorable.",
        [
          T(
            "La normépéridine est un métabolite actif.",
            "Son activité participe à la toxicité neurologique.",
          ),
          T(
            "Ce métabolite dépend de l’élimination rénale.",
            "Une insuffisance rénale augmente son accumulation.",
          ),
          T(
            "Des convulsions peuvent survenir à dose thérapeutique.",
            "La neurotoxicité n’est pas limitée au surdosage massif.",
          ),
          T(
            "Son abandon comme antalgique courant tient à la toxicité neurologique de son métabolite.",
            "L’accumulation de normépéridine expose notamment aux convulsions.",
          ),
          T(
            "Son indication particulière reste le frisson postopératoire.",
            "Une dose de 0,35 mg/kg peut supprimer ce symptôme.",
          ),
        ],
      ),
      qcm(
        "Quels faits décrivent l’effet plafond de la nalbuphine ?",
        ["b00056"],
        "L’agonisme partiel limite simultanément l’analgésie et la dépression respiratoire au-delà d’une certaine dose.",
        [
          T(
            "Le plateau respiratoire apparaît vers 30 mg.",
            "Au-delà, l’augmentation de dose n’accentue plus autant la dépression ventilatoire.",
          ),
          T(
            "L’analgésie atteint aussi un plateau.",
            "L’effet plafond ne concerne pas uniquement la respiration.",
          ),
          F(
            "L’augmentation indéfinie de dose augmente toujours le soulagement.",
            "La pharmacologie agoniste partielle limite précisément cet accroissement.",
          ),
          T(
            "Une dose de 5 à 10 mg peut traiter un prurit neuraxial.",
            "Cette indication exploite les propriétés mixtes de la nalbuphine.",
          ),
          T(
            "Une dose adulte usuelle est de 10 mg IV.",
            "Cette dose peut être renouvelée toutes les trois heures selon l’effet.",
          ),
        ],
      ),
      qcm(
        "Quelles particularités possède la buprénorphine ?",
        ["b00058", "b00059"],
        "La buprénorphine combine agonisme partiel mu, très forte affinité, longue action et élimination biliaire.",
        [
          F(
            "Son effet disparaît complètement en moins de dix minutes.",
            "La buprénorphine agit environ douze heures et ne possède pas une cinétique ultracourte.",
          ),
          T(
            "Son antagonisation par naloxone peut être difficile.",
            "La forte affinité mu rend l’effet résistant.",
          ),
          T(
            "Son élimination est surtout biliaire.",
            "Cette voie la rend intéressante en insuffisance rénale avancée.",
          ),
          F(
            "Sa courbe dose-réponse reste strictement linéaire.",
            "Une forme en cloche est décrite, avec baisse d’analgésie à forte dose.",
          ),
          T(
            "Un timbre à 5 µg/h peut initier le traitement d’un patient naïf.",
            "La plus faible formulation transdermique est prévue dans cette situation.",
          ),
        ],
      ),
      qcm(
        "Comment distinguer tramadol et tapentadol ?",
        ["b00061", "b00062", "b00063", "b00064"],
        "Les deux associent agonisme opioïde et modulation monoaminergique, mais diffèrent par la cible de recapture et le métabolisme.",
        [
          T(
            "Le tramadol inhibe la recapture de sérotonine et noradrénaline.",
            "Sa composante monoaminergique implique les deux voies.",
          ),
          F(
            "Le tramadol agit uniquement par recapture noradrénergique, sans composante sérotoninergique.",
            "Le tramadol inhibe la recapture de sérotonine et de noradrénaline.",
          ),
          F(
            "Le tapentadol forme un métabolite actif par CYP2D6.",
            "Il est glucuronidé et ne possède pas de métabolite actif.",
          ),
          T(
            "Le tapentadol inhibe surtout la recapture de noradrénaline.",
            "Son profil monoaminergique est plus noradrénergique.",
          ),
          T(
            "Ces mécanismes peuvent être utiles en douleur neuropathique.",
            "Les voies descendantes inhibitrices participent à ce type de douleur.",
          ),
        ],
      ),
      qcm(
        "Quels risques ou limites pharmacogénétiques concernent le tramadol ?",
        ["b00062"],
        "Le tramadol partage la variabilité CYP2D6 de la codéine et peut être inefficace chez les métaboliseurs lents.",
        [
          F(
            "Un métaboliseur lent produit davantage de métabolite actif du tramadol.",
            "La faible activité du CYP2D6 réduit la formation du métabolite M1.",
          ),
          T(
            "L’effet dépend fortement du métabolite O-desméthylé.",
            "Ce composé M1 porte une part importante de la puissance opioïde.",
          ),
          T(
            "Un métaboliseur lent peut être insuffisamment soulagé.",
            "La formation insuffisante de M1 réduit l’effet analgésique.",
          ),
          F(
            "Il remplace toujours efficacement la codéine chez ce phénotype.",
            "Les deux molécules dépendent du CYP2D6 et partagent cette limite.",
          ),
          T(
            "La variabilité individuelle doit guider le changement d’antalgique.",
            "Un échec attendu justifie une molécule ne dépendant pas de cette activation.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Antagonistes opioïdes",
    questions: [
      qcm(
        "Comment titrer la naloxone devant une dépression respiratoire ?",
        ["b00066"],
        "Une microtitration restaure la ventilation sans supprimer brutalement toute analgésie.",
        [
          T(
            "Injecter 0,5 à 1 µg/kg.",
            "Cette faible dose constitue le palier initial proposé.",
          ),
          T(
            "Répéter toutes les cinq minutes selon l’effet.",
            "La réévaluation guide chaque nouvelle injection.",
          ),
          T(
            "Viser une ventilation suffisante plutôt qu’un réveil complet et brutal.",
            "Cette cible corrige le danger respiratoire tout en limitant la perte d’analgésie.",
          ),
          T(
            "Suivre simultanément fréquence respiratoire et vigilance.",
            "L’objectif est la restauration fonctionnelle, non l’annulation de tout opioïde.",
          ),
          T(
            "Conserver une surveillance après l’amélioration.",
            "La courte action de la naloxone expose à une renarcotisation.",
          ),
        ],
      ),
      qcm(
        "Quels repères cinétiques expliquent la renarcotisation ?",
        ["b00066"],
        "La naloxone agit vite mais seulement trente à quarante-cinq minutes, souvent moins longtemps que l’opioïde responsable.",
        [
          T(
            "Son pic d’effet survient en une à deux minutes.",
            "L’amélioration respiratoire initiale est donc rapide.",
          ),
          F(
            "Un bolus de naloxone conserve son effet antagoniste pendant douze heures.",
            "Sa durée d’action est généralement limitée à 30–45 minutes.",
          ),
          F(
            "L’antagonisation par naloxone élimine simultanément l’agoniste de la circulation.",
            "La naloxone déplace temporairement l’effet au récepteur sans accélérer l’élimination de l’opioïde.",
          ),
          F(
            "Le pic d’effet de la naloxone IV survient environ deux heures après l’injection.",
            "Le pic apparaît en une à deux minutes, ce qui impose une réévaluation précoce.",
          ),
          F(
            "La surveillance peut cesser dès le premier réveil.",
            "La récurrence de la sédation reste possible après disparition de la naloxone.",
          ),
        ],
      ),
      qcm(
        "Quels effets peuvent suivre un renversement brutal par naloxone ?",
        ["b00066"],
        "Une libération intense de catécholamines peut provoquer complications cardiovasculaires et pulmonaires.",
        [
          F(
            "La naloxone injectée brutalement réduit le risque d’œdème pulmonaire.",
            "Une antagonisation brutale peut déclencher cette complication.",
          ),
          T(
            "Une tachycardie.",
            "La décharge catécholaminergique accélère le rythme.",
          ),
          T(
            "Des arythmies ventriculaires.",
            "Des troubles graves, dont une fibrillation, ont été rapportés.",
          ),
          T(
            "Un œdème pulmonaire.",
            "Cette complication fait partie des effets sévères décrits.",
          ),
          F(
            "Une protection certaine contre toute douleur aiguë.",
            "La suppression brutale de l’analgésie provoque une douleur intense.",
          ),
        ],
      ),
      qcm(
        "Quand envisager une perfusion de naloxone ?",
        ["b00066"],
        "Une exposition prolongée ou une intoxication nécessite parfois une perfusion ajustée pour prévenir la récidive.",
        [
          F(
            "Une perfusion de naloxone potentialise l’analgésie d’un opioïde ultracourt.",
            "La naloxone antagonise les opioïdes et sert à maintenir la correction d’une intoxication prolongée.",
          ),
          F(
            "Le débit continu standard se règle en milligrammes par kilogramme et par minute.",
            "Le repère proposé est de quelques microgrammes par heure.",
          ),
          F(
            "Pour traiter une douleur sans exposition opioïde.",
            "La naloxone n’a aucune indication antalgique propre.",
          ),
          T(
            "Avec un repère de 3 à 10 µg/h.",
            "Cette plage de perfusion est citée pour les situations spécifiques.",
          ),
          T(
            "Avec une surveillance de l’analgésie et de l’hémodynamique.",
            "Une dose excessive peut déclencher douleur et activation sympathique.",
          ),
        ],
      ),
      qcm(
        "Quel est l’intérêt des antagonistes opioïdes périphériques ?",
        ["b00067", "b00068"],
        "Ils corrigent surtout les effets digestifs sans franchir le système nerveux central ni supprimer l’analgésie.",
        [
          T(
            "La méthylnaltrexone peut traiter une constipation induite.",
            "Son action périphérique restaure le transit sous opioïde.",
          ),
          F(
            "La méthylnaltrexone traite la dépression respiratoire par un passage cérébral rapide.",
            "Son faible passage central la destine aux effets digestifs périphériques, pas à la dépression respiratoire.",
          ),
          F(
            "Ils traversent largement la barrière hémato-encéphalique.",
            "Leur faible passage central préserve précisément l’analgésie.",
          ),
          T(
            "Le naloxégol a une biodisponibilité orale voisine de 2 %.",
            "Sa faible absorption contribue au faible risque de sevrage.",
          ),
          T(
            "Le risque de sevrage reste faible avec le naloxégol oral.",
            "L’exposition systémique et centrale demeure minime.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Coanalgésiques",
    questions: [
      qcm(
        "Quels mécanismes expliquent les effets de la kétamine ?",
        ["b00070", "b00071"],
        "La kétamine associe antagonisme NMDA, effets cholinergiques et sympathomimétiques, avec un métabolite actif.",
        [
          F(
            "L’analgésie kétaminique résulte d’un agonisme exclusif des récepteurs GABA-A.",
            "Son mécanisme majeur est un antagonisme des récepteurs NMDA.",
          ),
          T(
            "La norkétamine prolonge l’analgésie.",
            "Ce métabolite actif persiste après la molécule mère.",
          ),
          F(
            "La norkétamine est trois fois plus puissante que la kétamine.",
            "Ce métabolite actif est environ trois fois moins puissant que la molécule mère.",
          ),
          F(
            "Elle déprime la respiration comme un opioïde pur.",
            "Elle est justement distinguée par l’absence de dépression respiratoire opioïde.",
          ),
          T(
            "Elle peut produire dysphorie ou agitation à l’émergence.",
            "Les effets psychodysleptiques limitent parfois son emploi.",
          ),
        ],
      ),
      qcm(
        "Quelle utilisation subanesthésique de kétamine est proposée ?",
        ["b00072"],
        "Les faibles doses en bolus ou perfusion visent l’analgésie et l’antihyperalgésie sans rechercher une anesthésie dissociative complète.",
        [
          T(
            "Un bolus compris entre 0,5 et 1 mg/kg.",
            "Cette plage correspond au repère subanesthésique cité.",
          ),
          T(
            "Une perfusion comprise entre 0,2 et 0,8 mg/kg.",
            "L’administration continue prolonge l’effet antalgique.",
          ),
          F(
            "Une contre-indication absolue chez tout patient exposé aux opioïdes.",
            "Elle est utile pour diminuer l’hyperalgésie liée aux opioïdes.",
          ),
          T(
            "Une indication possible lors d’une analgésie complexe.",
            "Les réinterventions et fortes consommations préopératoires sont des contextes ciblés.",
          ),
          T(
            "Une association possible au midazolam pour limiter l’émergence.",
            "La benzodiazépine réduit agitation et hallucinations.",
          ),
        ],
      ),
      qcm(
        "Quels objectifs justifient une perfusion IV de lidocaïne ?",
        ["b00074", "b00120"],
        "La lidocaïne systémique vise une analgésie non opioïde et une meilleure récupération digestive et fonctionnelle.",
        [
          T(
            "Diminuer la douleur postopératoire.",
            "L’effet antalgique systémique est l’objectif principal.",
          ),
          T(
            "Réduire la consommation d’opioïdes.",
            "L’épargne morphinique limite nausées, sédation et iléus.",
          ),
          T(
            "Favoriser une reprise digestive plus rapide.",
            "Une diminution de l’iléus est un bénéfice recherché.",
          ),
          T(
            "Intégrer un mécanisme antalgique systémique non opioïde.",
            "La lidocaïne IV offre une option complémentaire sans agonisme des récepteurs μ.",
          ),
          T(
            "Raccourcir potentiellement le séjour hospitalier.",
            "Une meilleure récupération peut réduire la durée d’hospitalisation.",
          ),
        ],
      ),
      qcm(
        "Comment agissent les gabapentinoïdes ?",
        ["b00076", "b00080"],
        "Gabapentine et prégabaline modulent les canaux calciques présynaptiques et diminuent la libération de neurotransmetteurs.",
        [
          T(
            "Ils ciblent la sous-unité α2δ des canaux calciques.",
            "Cette liaison réduit l’entrée calcique présynaptique.",
          ),
          F(
            "Les gabapentinoïdes ouvrent les canaux calciques présynaptiques et augmentent la libération de médiateurs.",
            "Leur liaison à la sous-unité α2δ réduit la libération synaptique de neurotransmetteurs.",
          ),
          F(
            "Ils agissent comme agonistes directs des récepteurs GABA-A.",
            "Leur analogie structurale au GABA ne correspond pas à ce mécanisme.",
          ),
          T(
            "Ils possèdent un effet antihyperalgésique.",
            "La diminution de sensibilisation complète leur action antalgique.",
          ),
          F(
            "Ils augmentent systématiquement la consommation d’opioïdes.",
            "Leur emploi cherche une épargne opioïde.",
          ),
        ],
      ),
      qcm(
        "Quelles précautions concernent gabapentine et prégabaline ?",
        ["b00077", "b00082"],
        "L’élimination rénale et les effets neurocognitifs imposent ajustement de dose, titration et surveillance.",
        [
          T(
            "Réduire la dose si la clairance est inférieure à 30 mL/min.",
            "Les deux molécules s’éliminent par le rein.",
          ),
          T(
            "Rechercher une somnolence.",
            "Cet effet peut compromettre vigilance et autonomie.",
          ),
          T(
            "Surveiller étourdissements et ataxie.",
            "Ces symptômes augmentent le risque de chute.",
          ),
          T(
            "Informer du risque de diplopie ou vision embrouillée.",
            "Les troubles visuels appartiennent au profil indésirable.",
          ),
          F(
            "Considérer la prégabaline comme entièrement hépatique.",
            "Son élimination est rénale comme celle de la gabapentine.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Douleur neuropathique et cannabinoïdes",
    questions: [
      qcm(
        "Quels mécanismes expliquent l’effet antalgique des antidépresseurs ?",
        ["b00085", "b00086", "b00088"],
        "La modulation monoaminergique descendante domine, complétée selon les agents par des actions sur canaux et récepteurs.",
        [
          F(
            "L’effet antalgique des antidépresseurs dépend exclusivement de la correction d’un épisode dépressif.",
            "Le renforcement des voies descendantes explique un effet propre sur la douleur neuropathique.",
          ),
          T(
            "Une inhibition de la recapture de sérotonine.",
            "La voie sérotoninergique participe aussi à l’inhibition nociceptive.",
          ),
          T(
            "Un blocage possible de canaux sodiques.",
            "Cette action peut diminuer l’hypersensibilisation périphérique.",
          ),
          T(
            "Un antagonisme NMDA pour certaines molécules.",
            "La modulation de ce récepteur peut limiter la sensibilisation centrale.",
          ),
          F(
            "Une place démontrée comme traitement immédiat de toute douleur aiguë.",
            "Leur indication antalgique est surtout la douleur chronique neuropathique.",
          ),
        ],
      ),
      qcm(
        "Pourquoi préférer parfois une amine secondaire chez le sujet âgé ?",
        ["b00088"],
        "Nortriptyline et désipramine exposent moins aux effets anticholinergiques que les tricycliques tertiaires.",
        [
          T(
            "Elles causent moins de confusion anticholinergique.",
            "La moindre charge anticholinergique améliore la tolérance cognitive.",
          ),
          T(
            "Elles provoquent moins de rétention urinaire.",
            "Cet effet périphérique est lié au bloc muscarinique.",
          ),
          T(
            "Le moindre blocage α1 réduit le risque d’hypotension orthostatique.",
            "La meilleure tolérance vasculaire peut préserver la sécurité au lever du sujet âgé.",
          ),
          T(
            "Le profil antihistaminique plus léger limite la somnolence.",
            "Une moindre sédation facilite le maintien de l’autonomie.",
          ),
          T(
            "Le choix doit tenir compte du glaucome et du prostatisme.",
            "Ces terrains aggravent les risques liés à l’anticholinergie.",
          ),
        ],
      ),
      qcm(
        "Quels effets indésirables différencient les profils antidépresseurs ?",
        ["b00095", "b00097", "b00099", "b00100"],
        "Chaque cible non antalgique crée un ensemble d’effets : anticholinergiques, antihistaminiques, antiadrénergiques ou sérotoninergiques.",
        [
          T(
            "La xérostomie évoque une activité anticholinergique.",
            "Le blocage muscarinique réduit les sécrétions salivaires.",
          ),
          T(
            "L’hypotension orthostatique évoque un effet anti-α1.",
            "Le blocage adrénergique altère l’adaptation vasculaire au lever.",
          ),
          T(
            "La somnolence peut traduire une action antihistaminique.",
            "Le blocage H1 favorise sédation et prise de poids.",
          ),
          T(
            "Nausées et dysfonction sexuelle peuvent être sérotoninergiques.",
            "Ces effets sont fréquents sous ISRS et IRSN.",
          ),
          T(
            "Une prise de poids peut traduire un blocage des récepteurs H1.",
            "L’activité antihistaminique associe volontiers sédation et prise pondérale.",
          ),
        ],
      ),
      qcm(
        "Comment distinguer THC et CBD ?",
        ["b00103", "b00104", "b00105", "b00111"],
        "Le THC active surtout CB1 et produit l’effet psychoactif ; le CBD ne se lie pas directement aux récepteurs cannabinoïdes classiques.",
        [
          F(
            "Le CBD produit la même euphorie par agonisme CB1",
            "Il n’est pas psychoactif et ne se lie pas directement à CB1.",
          ),
          T(
            "Le THC peut stimuler l’appétit.",
            "L’effet orexigène accompagne ses actions centrales.",
          ),
          T(
            "Le THC est le principal composé psychoactif du cannabis",
            "Son agonisme CB1 explique les effets centraux et cognitifs.",
          ),
          T(
            "Le CBD possède des effets anti-inflammatoires et antiépileptiques.",
            "Ses actions passent par d’autres cibles pharmacologiques.",
          ),
          T(
            "CB2 est particulièrement représenté dans le système immunitaire.",
            "Cette distribution soutient les effets périphériques anti-inflammatoires.",
          ),
        ],
      ),
      qcm(
        "Quelle place clinique attribuer aux cannabinoïdes antalgiques ?",
        ["b00107", "b00109", "b00111", "b00112"],
        "Les produits diffèrent par composition et voie ; leur place concerne certaines douleurs chroniques, pas la douleur aiguë postopératoire.",
        [
          T(
            "La nabilone est un analogue synthétique du THC.",
            "Ce produit pharmaceutique possède une composition standardisée.",
          ),
          F(
            "Le nabiximols est une préparation de CBD pur dépourvue de THC.",
            "Cette formulation oromucosale associe les deux cannabinoïdes, THC et CBD.",
          ),
          T(
            "Le cannabis inhalé expose à des risques respiratoires.",
            "Bronchite, obstruction et risque néoplasique doivent être considérés.",
          ),
          F(
            "Les études concluent à une forte efficacité postopératoire aiguë.",
            "Les essais disponibles n’ont pas montré de bénéfice concluant.",
          ),
          T(
            "Une douleur chronique réfractaire peut justifier une discussion spécialisée.",
            "C’est dans ce cadre que les cannabinoïdes ont surtout été évalués.",
          ),
        ],
      ),
    ],
  },
];

function buildIsolatedQcm() {
  return ISOLATED_QCM.map((entry, index) => ({
    label: `QCM ${index + 1} · ${entry.title}`,
    allowed_voies: ["interne"],
    questions: entry.questions,
  }));
}

const DP_QCM = [
  {
    title: "Analgésie après colectomie et insuffisance rénale",
    vignette:
      "Mme Laurent, patiente de 76 ans pesant 54 kg, doit subir une colectomie. Elle présente une insuffisance rénale chronique avec clairance de créatinine à 26 mL/min, une hypertension contrôlée et une dénutrition récente. Elle reçoit de la warfarine pour une indication ancienne et l’équipe souhaite limiter les opioïdes postopératoires.",
    questions: [
      qcm(
        "Quels objectifs structurent son analgésie ?",
        ["b00003", "b00010", "b00117"],
        "Une stratégie multimodale doit soulager, réduire les opioïdes et respecter les risques rénal, hépatique et hémorragique.",
        [
          F(
            "La multimodalité consiste à utiliser plusieurs opioïdes de même mécanisme.",
            "Elle associe des classes aux mécanismes complémentaires.",
          ),
          T(
            "Réduire l’exposition aux opioïdes.",
            "La diminution des doses limite dépression respiratoire, nausées et iléus.",
          ),
          T(
            "Adapter chaque agent aux comorbidités.",
            "Une prescription standard ignorerait ici rein, nutrition et anticoagulation.",
          ),
          F(
            "Supprimer toute analgésie non opioïde.",
            "Les non-opioïdes constituent la base de l’épargne morphinique.",
          ),
          F(
            "Garantir une absence totale de douleur au prix d’une sédation profonde.",
            "L’objectif associe confort et sécurité, sans surdosage sédatif.",
          ),
        ],
      ),
      qcm(
        "Quelle prescription de paracétamol est la plus prudente ?",
        ["b00009", "b00115"],
        "Le cumul du grand âge, de la dénutrition, de l’atteinte rénale et de la warfarine impose un plafond de 2 g/j.",
        [
          T(
            "Limiter la dose quotidienne totale à 2 g.",
            "Plusieurs facteurs de fragilité justifient le plafond abaissé.",
          ),
          T(
            "Privilégier la voie orale si elle est disponible.",
            "L’absorption orale est bonne et plus prévisible que la voie rectale.",
          ),
          F(
            "Prescrire 1 g toutes les quatre heures.",
            "Ce schéma atteindrait 6 g/j et exposerait à une toxicité hépatique.",
          ),
          T(
            "Tracer l’association à la warfarine.",
            "Cette interaction appartient aux circonstances imposant la réduction de dose.",
          ),
          T(
            "Respecter un intervalle d’environ six heures entre les prises.",
            "L’espacement usuel évite un cumul excessif tout en maintenant l’effet antalgique.",
          ),
        ],
        "Le bilan préopératoire confirme une albumine basse et la poursuite récente de la warfarine.",
      ),
      qcm(
        "Pourquoi un AINS est-il inadapté ?",
        ["b00020", "b00021"],
        "La clairance inférieure à 30 mL/min et l’anticoagulation rendent les risques rénal et hémorragique excessifs.",
        [
          F(
            "Une clairance à 26 mL/min autorise le kétorolac à dose normale.",
            "Une clairance inférieure à 30 mL/min contre-indique cet AINS.",
          ),
          T(
            "La warfarine augmente le risque de saignement.",
            "L’association d’un AINS à un antivitamine K doit être évitée.",
          ),
          F(
            "Un coxib supprimerait tout risque rénal.",
            "COX-2 est constitutive dans le rein et sa sélectivité ne protège pas la fonction rénale.",
          ),
          F(
            "Un coxib restaure la sécurité digestive malgré la poursuite de la warfarine.",
            "La sélectivité COX-2 ne neutralise pas le risque hémorragique lié à l’anticoagulation.",
          ),
          F(
            "Une dose unique de kétorolac serait sans aucun risque.",
            "La contre-indication rénale persiste même pour une exposition courte.",
          ),
        ],
        "Le chirurgien propose du kétorolac IV pour diminuer les nausées liées aux opioïdes.",
      ),
      qcm(
        "Quels coanalgésiques peuvent être discutés sans ignorer le terrain ?",
        ["b00069", "b00072", "b00074", "b00077"],
        "Kétamine ou lidocaïne peuvent contribuer à l’épargne opioïde ; un gabapentinoïde nécessiterait une forte adaptation rénale.",
        [
          T(
            "Une kétamine à dose subanesthésique.",
            "Son antagonisme NMDA peut réduire douleur et hyperalgésie sans dépression respiratoire opioïde.",
          ),
          T(
            "Une lidocaïne IV dans un protocole adapté.",
            "Elle peut améliorer analgésie, transit et consommation de morphiniques.",
          ),
          T(
            "Une prégabaline uniquement avec ajustement rénal.",
            "Son élimination rénale impose une réduction marquée sous 30 mL/min.",
          ),
          F(
            "Une gabapentine à dose maximale standard.",
            "Une dose non ajustée s’accumulerait et majorerait somnolence et confusion.",
          ),
          F(
            "Une association automatique de tous ces agents.",
            "La multimodalité reste individualisée et ne signifie pas empiler toutes les classes.",
          ),
        ],
        "L’équipe cherche une option supplémentaire en raison d’une chirurgie abdominale majeure.",
      ),
      qcm(
        "Quels signes imposent de réduire un gabapentinoïde ?",
        ["b00077", "b00082"],
        "L’accumulation neurologique se traduit par somnolence, troubles de l’équilibre, confusion et atteintes visuelles.",
        [
          T(
            "Une somnolence croissante.",
            "Cet effet dose-dépendant peut révéler une exposition excessive.",
          ),
          F(
            "L’ataxie apparue sous prégabaline justifie une augmentation immédiate de dose.",
            "Ce signe neurologique impose de réduire ou réévaluer le gabapentinoïde.",
          ),
          T(
            "Une diplopie.",
            "Les perturbations visuelles appartiennent aux effets indésirables des gabapentinoïdes.",
          ),
          T(
            "Une confusion postopératoire.",
            "Le grand âge et l’insuffisance rénale renforcent ce signal d’alerte.",
          ),
          F(
            "Une amélioration stable de la douleur sans effet neurologique.",
            "Ce profil ne justifie pas à lui seul une diminution urgente de dose.",
          ),
        ],
        "Après une première faible dose, Mme Laurent devient somnolente et instable à la verticalisation.",
      ),
      qcm(
        "Comment titrer un opioïde si la douleur reste intense ?",
        ["b00035", "b00119"],
        "De petits bolus de morphine, espacés et réévalués, permettent de rechercher l’effet minimal efficace.",
        [
          T(
            "Administrer 2 à 3 mg IV par bolus.",
            "Cette fraction correspond au schéma de titration proposé en SSPI.",
          ),
          T(
            "Attendre environ cinq minutes entre les injections.",
            "L’intervalle permet de mesurer l’effet avant une nouvelle dose.",
          ),
          F(
            "La titration morphinique s’appuie uniquement sur le score douloureux, sans surveillance ventilatoire.",
            "Chaque bolus doit être suivi d’une évaluation conjointe de la douleur, de la vigilance et de la respiration.",
          ),
          F(
            "Injecter une dose massive pour éviter les réévaluations.",
            "Une injection importante expose à une accumulation rapide et imprévisible.",
          ),
          T(
            "Arrêter la titration si la somnolence précède le soulagement.",
            "La baisse de vigilance est un signal de surdosage et non un objectif thérapeutique.",
          ),
        ],
        "En SSPI, la douleur est à 8/10 malgré le paracétamol et la lidocaïne IV.",
      ),
      qcm(
        "Quels éléments doivent figurer dans le relais postopératoire ?",
        ["b00009", "b00021", "b00035", "b00077"],
        "Le plan doit tracer les plafonds, les contre-indications, les doses reçues et les critères de surveillance.",
        [
          T(
            "Le plafond de paracétamol à 2 g/j.",
            "Cette limite prévient une prescription ultérieure standard inadaptée.",
          ),
          T(
            "La contre-indication aux AINS liée à la clairance.",
            "Le risque rénal persiste au-delà de la SSPI.",
          ),
          T(
            "La dose cumulée de morphine administrée.",
            "La connaissance du cumul permet d’anticiper sédation et dépression ventilatoire.",
          ),
          T(
            "Les effets neurologiques apparus sous gabapentinoïde.",
            "Cette intolérance doit empêcher une nouvelle dose non réévaluée.",
          ),
          T(
            "Les modalités de surveillance respiratoire après la titration morphinique.",
            "Le relais doit préciser comment dépister une sédation ou une hypoventilation retardée.",
          ),
        ],
        "La douleur diminue à 3/10 et Mme Laurent quitte la SSPI sous surveillance rapprochée.",
      ),
    ],
  },
  {
    title: "Dépression respiratoire après morphine",
    vignette:
      "M. Pereira, patient de 68 ans, est admis en SSPI après arthroplastie. Il a reçu plusieurs bolus de morphine pour une douleur initiale à 9/10. Il devient progressivement somnolent, respire à 6 cycles par minute et sa saturation baisse malgré l’oxygène. La dernière injection date de quelques minutes.",
    questions: [
      qcm(
        "Quels éléments orientent vers un surdosage opioïde ?",
        ["b00024", "b00035", "b00066"],
        "La chronologie après titration, la somnolence et la bradypnée constituent un tableau typique de dépression respiratoire opioïde.",
        [
          T(
            "Une baisse progressive de la vigilance.",
            "La sédation accompagne l’effet central excessif des opioïdes.",
          ),
          T(
            "Une fréquence respiratoire à 6/min.",
            "Cette bradypnée traduit une dépression ventilatoire sévère.",
          ),
          T(
            "La proximité temporelle des bolus de morphine.",
            "Le cumul récent rend l’imputabilité pharmacologique forte.",
          ),
          T(
            "Une ventilation devenue irrégulière après des bolus récents.",
            "La chronologie et l’altération du rythme ventilatoire renforcent l’imputabilité opioïde.",
          ),
          T(
            "Une désaturation malgré l’oxygène.",
            "L’hypoventilation peut altérer les échanges même sous supplémentation.",
          ),
        ],
      ),
      qcm(
        "Quelles actions doivent être entreprises immédiatement ?",
        ["b00066", "b00119"],
        "La priorité est ventilatoire : interrompre l’opioïde, stimuler, assister la ventilation et préparer une naloxone titrée.",
        [
          T(
            "Arrêter toute nouvelle dose de morphine.",
            "Poursuivre l’agoniste aggraverait la dépression respiratoire.",
          ),
          T(
            "Assurer l’ouverture des voies aériennes et ventiler si nécessaire.",
            "La correction de l’hypoventilation précède toute autre considération.",
          ),
          F(
            "Une saturation correcte sous oxygène exclut une hypoventilation menaçante.",
            "L’oxygène peut masquer un défaut de ventilation, qui doit être évalué et traité.",
          ),
          F(
            "Attendre spontanément la fin d’action sans monitorage.",
            "L’apnée et l’hypoxémie menacent le pronostic vital.",
          ),
          T(
            "Maintenir une surveillance continue de l’oxygénation.",
            "La tendance de saturation permet de juger la réponse aux mesures ventilatoires.",
          ),
        ],
        "M. Pereira ne répond plus qu’à une stimulation vigoureuse et la ventilation devient irrégulière.",
      ),
      qcm(
        "Quelle stratégie de naloxone préserve le mieux l’analgésie ?",
        ["b00035", "b00066"],
        "La microtitration de 0,5 à 1 µg/kg toutes les cinq minutes cherche une ventilation adéquate sans antagonisme complet.",
        [
          F(
            "Le naloxégol restaure rapidement la commande ventilatoire centrale.",
            "Cet antagoniste périphérique traite la constipation et ne corrige pas le surdosage central.",
          ),
          T(
            "Répéter selon la réponse toutes les cinq minutes.",
            "Chaque palier est guidé par vigilance et ventilation.",
          ),
          F(
            "Viser d’emblée une suppression totale de tout effet opioïde.",
            "Une antagonisation complète provoquerait douleur intense et activation sympathique.",
          ),
          F(
            "Une antagonisation complète est recherchée avant toute évaluation de la ventilation.",
            "La naloxone est titrée jusqu’au retour d’une respiration suffisante afin de préserver l’analgésie.",
          ),
          F(
            "Une perfusion continue de naloxone est indispensable dès le premier bolus.",
            "Elle se discute surtout lorsque la dépression récidive sous un opioïde prolongé.",
          ),
        ],
        "La ventilation au masque restaure la saturation et une antagonisation pharmacologique est commencée.",
      ),
      qcm(
        "Quel délai d’effet attendre après naloxone ?",
        ["b00024", "b00066"],
        "L’effet atteint son pic en une à deux minutes, ce qui permet une réévaluation rapide après chaque palier.",
        [
          T(
            "Une première amélioration peut apparaître en quelques minutes.",
            "Le pic d’effet survient entre une et deux minutes.",
          ),
          F(
            "Le premier effet de la naloxone IV survient après quatre à six heures.",
            "Son effet débute en quelques minutes et atteint rapidement son pic.",
          ),
          F(
            "Une seconde dose doit précéder toute évaluation du pic du premier bolus.",
            "Le pic survient en une à deux minutes et doit être observé avant de poursuivre la titration.",
          ),
          T(
            "La vigilance peut s’améliorer avec la ventilation.",
            "La correction de l’effet opioïde central restaure respiration et réponse.",
          ),
          F(
            "Le pic tardif autorise l’abandon du support ventilatoire immédiat.",
            "La ventilation doit être maintenue jusqu’à une réponse clinique sûre.",
          ),
        ],
        "Après le premier palier, la fréquence respiratoire passe à 10/min et le patient ouvre les yeux.",
      ),
      qcm(
        "Pourquoi le risque de renarcotisation persiste-t-il ?",
        ["b00035", "b00066", "b00119"],
        "La naloxone agit seulement trente à quarante-cinq minutes, alors que la morphine et ses effets peuvent durer davantage.",
        [
          T(
            "La durée de la naloxone est courte.",
            "Son antagonisme peut disparaître avant l’élimination de la morphine.",
          ),
          T(
            "Les bolus cumulés prolongent l’exposition à l’agoniste.",
            "La quantité totale administrée maintient un réservoir pharmacologique.",
          ),
          F(
            "Une réponse initiale élimine définitivement l’opioïde.",
            "La naloxone déplace temporairement l’agoniste sans accélérer sa clairance.",
          ),
          T(
            "Une surveillance prolongée reste nécessaire.",
            "Elle détecte une nouvelle baisse de vigilance ou de ventilation.",
          ),
          F(
            "La douleur empêche toute réapparition de sédation.",
            "Une stimulation nociceptive ne neutralise pas durablement l’effet pharmacologique.",
          ),
        ],
        "Trente minutes plus tard, M. Pereira redevient somnolent et sa fréquence respiratoire diminue à nouveau.",
      ),
      qcm(
        "Quand une perfusion continue devient-elle pertinente ?",
        ["b00066", "b00119"],
        "Une récidive après bolus ou une exposition prolongée justifie une perfusion de naloxone titrée.",
        [
          F(
            "La perfusion de naloxone devient pertinente après un seul bolus efficace sans récidive.",
            "Elle se discute lorsque l’opioïde persiste et que la dépression respiratoire récidive.",
          ),
          F(
            "Le débit de naloxone est fixé une fois pour toutes malgré les variations ventilatoires.",
            "Il doit être ajusté à la respiration, à la vigilance et au maintien de l’analgésie.",
          ),
          T(
            "Sous surveillance continue du confort et de la respiration.",
            "La dose doit être assez forte pour ventiler mais assez faible pour conserver une analgésie.",
          ),
          F(
            "Pour remplacer toute stratégie antalgique pendant plusieurs jours.",
            "La naloxone traite le surdosage et non la douleur chirurgicale.",
          ),
          F(
            "Une formulation opioïde prolongée rend la perfusion de naloxone inutile.",
            "La persistance de l’agoniste est précisément une situation où l’administration continue peut être nécessaire.",
          ),
        ],
        "Un deuxième bolus restaure la ventilation, mais l’équipe anticipe une nouvelle récidive.",
      ),
      qcm(
        "Quels effets d’une antagonisation excessive faut-il rechercher ?",
        ["b00024", "b00066", "b00119"],
        "Une inversion trop brutale de l’analgésie libère des catécholamines et peut provoquer douleur, instabilité cardiovasculaire et œdème pulmonaire.",
        [
          T(
            "Une poussée hypertensive.",
            "L’activation sympathique augmente brutalement la pression artérielle.",
          ),
          T(
            "Une tachycardie ou une arythmie ventriculaire.",
            "La décharge catécholaminergique accroît l’excitabilité cardiaque.",
          ),
          T(
            "Une douleur aiguë réapparue.",
            "La suppression de l’agonisme retire simultanément l’analgésie.",
          ),
          T(
            "Des crépitants avec hypoxémie aiguë évoquant un œdème pulmonaire.",
            "Une décharge catécholaminergique intense peut provoquer cette complication respiratoire rare.",
          ),
          T(
            "Une agitation aiguë liée à la suppression trop rapide de l’effet opioïde.",
            "Le réveil brutal de la douleur et l’activation sympathique peuvent rendre le patient agité.",
          ),
        ],
        "Sous perfusion faible, le patient ventile correctement mais signale une recrudescence douloureuse et sa pression augmente.",
      ),
    ],
  },
  {
    title: "Relais antalgique après rémifentanil",
    vignette:
      "Mme Ndiaye, patiente de 44 ans sans comorbidité majeure, bénéficie d’une arthrodèse lombaire sous anesthésie intraveineuse associant propofol et rémifentanil. La perfusion opioïde a été augmentée pendant les temps les plus stimulants. À l’approche de la fermeture, aucun antalgique de durée prolongée n’a encore été administré.",
    questions: [
      qcm(
        "Quelles propriétés rendent le rémifentanil adapté à cette intervention ?",
        ["b00053"],
        "Son métabolisme par des estérases et sa demi-vie contextuelle très courte permettent un ajustement rapide à l’intensité chirurgicale.",
        [
          F(
            "La demi-vie contextuelle du rémifentanil augmente de plusieurs heures après une perfusion prolongée.",
            "Elle reste proche de quatre minutes, indépendamment de la durée de perfusion.",
          ),
          F(
            "Le rémifentanil procure une couverture antalgique durable après son arrêt.",
            "Son effet disparaît en quelques minutes et exige un relais anticipé.",
          ),
          T(
            "Sa concentration peut être modulée selon la stimulation.",
            "La cinétique rapide autorise une titration fine pendant chaque temps opératoire.",
          ),
          F(
            "Les estérases sanguines cessent d’hydrolyser le rémifentanil après une perfusion prolongée.",
            "Le métabolisme par les estérases reste efficace quelle que soit la durée de perfusion.",
          ),
          F(
            "Son élimination dépend principalement de la fonction rénale.",
            "Les estérases sanguines et tissulaires assurent son métabolisme principal.",
          ),
        ],
      ),
      qcm(
        "Quelle décision antalgique doit précéder l’arrêt de la perfusion ?",
        ["b00003", "b00053"],
        "Un relais de durée suffisante, intégré à une analgésie multimodale, doit être administré avant la fin du rémifentanil.",
        [
          T(
            "Administrer un opioïde de relais avant la fermeture.",
            "Son délai d’action doit anticiper la disparition quasi immédiate du rémifentanil.",
          ),
          F(
            "Le relais doit commencer seulement après disparition complète de l’effet du rémifentanil.",
            "Cette attente crée une rupture antalgique prévisible au réveil.",
          ),
          F(
            "Attendre l’apparition d’une douleur intense en SSPI.",
            "Cette attente créerait une rupture antalgique prévisible et évitable.",
          ),
          F(
            "Un antalgique oral administré après le réveil prévient la douleur de l’extubation.",
            "Le délai d’action impose une administration suffisamment précoce avant l’arrêt.",
          ),
          F(
            "Prolonger le rémifentanil seul après extubation.",
            "Une perfusion opioïde ultracourte sans ventilation contrôlée expose à l’apnée.",
          ),
        ],
        "La fermeture débute et l’anesthésiste prépare l’arrêt de la perfusion dans vingt minutes.",
      ),
      qcm(
        "Quels phénomènes expliquent une douleur disproportionnée au réveil ?",
        ["b00053", "b00070"],
        "Une rupture de couverture et une hyperalgésie liée à une forte exposition au rémifentanil peuvent se cumuler.",
        [
          T(
            "L’absence d’antalgique persistant après l’arrêt.",
            "La demi-vie très courte laisse rapidement la patiente sans couverture opioïde.",
          ),
          T(
            "Une sensibilisation facilitée par les fortes doses.",
            "Une exposition importante au rémifentanil peut favoriser une hyperalgésie aiguë.",
          ),
          F(
            "Une accumulation prolongée du rémifentanil dans le tissu adipeux.",
            "Son hydrolyse rapide empêche une telle persistance pharmacologique.",
          ),
          T(
            "La stimulation nociceptive majeure de l’arthrodèse.",
            "L’intensité du geste accroît les besoins lors du réveil.",
          ),
          F(
            "Une action antagoniste directe sur les récepteurs mu.",
            "Le rémifentanil est un agoniste mu et non un antagoniste.",
          ),
        ],
        "À l’arrivée en SSPI, Mme Ndiaye décrit une douleur diffuse à 9/10 et réagit vivement au moindre contact.",
      ),
      qcm(
        "Quelle place peut avoir la kétamine dans cette situation ?",
        ["b00070", "b00072"],
        "À dose subanesthésique, la kétamine peut limiter sensibilisation et besoins opioïdes grâce à son antagonisme NMDA.",
        [
          F(
            "La kétamine antihyperalgésique agit principalement comme agoniste des récepteurs μ.",
            "Son action utile repose surtout sur l’antagonisme NMDA.",
          ),
          T(
            "Elle contribue à l’épargne morphinique.",
            "Son mécanisme distinct complète l’analgésie opioïde.",
          ),
          F(
            "Elle doit obligatoirement provoquer une anesthésie profonde.",
            "Une dose subanesthésique est recherchée pour l’effet antalgique.",
          ),
          T(
            "Elle préserve mieux la ventilation qu’un renforcement opioïde massif.",
            "Aux doses antalgiques, elle n’entraîne pas la dépression respiratoire des opioïdes.",
          ),
          F(
            "Elle corrige une douleur uniquement par blocage COX-2.",
            "La cible pertinente est le récepteur NMDA et non la cyclo-oxygénase.",
          ),
        ],
        "La titration morphinique soulage peu et l’équipe suspecte une hyperalgésie induite par les opioïdes.",
      ),
      qcm(
        "Quels effets doivent être surveillés pendant une perfusion de kétamine ?",
        ["b00070", "b00071"],
        "La surveillance recherche surtout manifestations psychodysleptiques, hypersécrétion, effets sympathiques et troubles du réveil.",
        [
          T(
            "Des hallucinations ou rêves désagréables.",
            "Les effets psychotomimétiques sont liés à l’action centrale de la kétamine.",
          ),
          T(
            "Une tachycardie ou une hypertension.",
            "La stimulation sympathique peut modifier l’hémodynamique.",
          ),
          T(
            "Une hypersalivation.",
            "L’augmentation des sécrétions fait partie des effets attendus.",
          ),
          F(
            "Une constipation paralytique constante.",
            "Ce n’est pas l’effet limitant caractéristique de la kétamine antalgique.",
          ),
          T(
            "Une agitation au réveil.",
            "Une réaction d’émergence doit être distinguée d’une douleur insuffisamment traitée.",
          ),
        ],
        "Une faible perfusion est commencée ; la douleur diminue mais la patiente rapporte des perceptions inhabituelles.",
      ),
      qcm(
        "Comment consolider l’analgésie au cours des heures suivantes ?",
        ["b00003", "b00009", "b00010", "b00053"],
        "La stratégie associe médicaments de mécanismes différents, réévaluation répétée et réduction des expositions opioïdes excessives.",
        [
          F(
            "Le paracétamol doit être interrompu dès que la douleur réapparaît à la mobilisation.",
            "Il reste un socle compatible de l’analgésie multimodale.",
          ),
          F(
            "Une douleur provoquée impose d’augmenter l’opioïde jusqu’à obtenir une somnolence.",
            "La sédation n’est pas un objectif et la dose doit rester au plus faible niveau efficace.",
          ),
          F(
            "La réévaluation fonctionnelle devient inutile lorsque la douleur au repos est contrôlée.",
            "La douleur à la mobilisation doit être mesurée pour guider le traitement.",
          ),
          F(
            "Réintroduire une forte perfusion de rémifentanil en secteur conventionnel.",
            "Sa cinétique et son risque ventilatoire exigent un environnement anesthésique contrôlé.",
          ),
          T(
            "Associer une approche régionale si elle est indiquée.",
            "Un mécanisme local complète utilement les traitements systémiques.",
          ),
        ],
        "Deux heures plus tard, la douleur est contrôlée au repos mais réapparaît lors de la mobilisation.",
      ),
      qcm(
        "Quels éléments doivent être transmis à l’équipe postopératoire ?",
        ["b00053", "b00070", "b00119"],
        "La forte exposition au rémifentanil, l’hyperalgésie suspectée, les doses de relais et les effets de kétamine conditionnent la surveillance.",
        [
          T(
            "La dose cumulée de l’opioïde de relais.",
            "Elle permet d’anticiper une dépression respiratoire retardée.",
          ),
          T(
            "L’hyperalgésie observée dès le réveil.",
            "Ce phénomène explique une réponse inhabituelle et guide les adaptations.",
          ),
          T(
            "Les manifestations perceptives sous kétamine.",
            "Leur traçabilité évite une nouvelle exposition non réévaluée.",
          ),
          T(
            "Les objectifs de mobilisation et de douleur.",
            "Le suivi fonctionnel aide à ajuster sans rechercher une sédation excessive.",
          ),
          T(
            "L’heure du dernier bolus de l’opioïde de relais.",
            "Cette donnée aide à anticiper la sédation et la dépression respiratoire retardées.",
          ),
        ],
        "Mme Ndiaye rejoint l’unité de soins avec une analgésie multimodale et une surveillance respiratoire.",
      ),
    ],
  },
  {
    title: "Rigidité thoracique après fentanyl",
    vignette:
      "M. Ben Salem, patient de 79 ans, est anesthésié pour remplacement valvulaire. Lors de l’induction, une dose élevée de fentanyl est injectée rapidement afin d’atténuer la réponse hémodynamique. Peu après, la ventilation au masque devient très difficile malgré une position correcte et l’absence d’obstacle visible.",
    questions: [
      qcm(
        "Quelles propriétés du fentanyl guident son emploi à l’induction ?",
        ["b00047", "b00048"],
        "Le fentanyl est un agoniste mu très puissant, rapide et lipophile, utile pour contrôler la réponse à la laryngoscopie mais exposant à l’apnée.",
        [
          T(
            "Sa puissance est proche de cent fois celle de la morphine.",
            "Une faible masse injectée produit donc un effet opioïde majeur.",
          ),
          F(
            "La puissance du fentanyl lui permet de remplacer l’hypnotique à l’induction.",
            "Un opioïde puissant ne garantit pas à lui seul une hypnose complète.",
          ),
          F(
            "Le fentanyl s’équilibre avec le cerveau plusieurs heures après l’injection.",
            "Sa liposolubilité permet une action centrale rapide.",
          ),
          F(
            "Le fentanyl assure à lui seul le bloc neuromusculaire requis pour l’intubation.",
            "Il ne remplace pas un curare lorsqu’une relaxation musculaire est nécessaire.",
          ),
          F(
            "Le fentanyl provoque systématiquement une instabilité hémodynamique majeure.",
            "Il est habituellement stable sur le plan hémodynamique malgré sa grande puissance.",
          ),
        ],
      ),
      qcm(
        "Quel diagnostic pharmacologique évoque la difficulté ventilatoire brutale ?",
        ["b00048"],
        "Une rigidité musculaire induite par une forte dose de fentanyl peut bloquer la paroi thoracique et rendre la ventilation impossible.",
        [
          F(
            "La rigidité thoracique opioïde s’accompagne habituellement de sibilants diffus.",
            "L’absence de sibilants et le thorax figé orientent vers une rigidité musculaire.",
          ),
          F(
            "Une pression d’insufflation élevée après fentanyl témoigne d’une analgésie insuffisante.",
            "Elle peut traduire une rigidité thoracique favorisée par la dose élevée.",
          ),
          T(
            "Une complication plus préoccupante chez le sujet âgé.",
            "La sensibilité du terrain renforce les conséquences ventilatoires.",
          ),
          F(
            "Une action attendue du fentanyl sur les muscles lisses bronchiques uniquement.",
            "Le mécanisme décrit concerne surtout la rigidité des muscles squelettiques.",
          ),
          F(
            "Une preuve que le patient est insuffisamment opioïdisé.",
            "Augmenter encore le fentanyl risquerait d’aggraver la rigidité.",
          ),
        ],
        "Le thorax paraît figé, la pression d’insufflation augmente et l’auscultation ne retrouve pas de sibilants.",
      ),
      qcm(
        "Quelle mesure corrige le plus directement cette rigidité ?",
        ["b00048"],
        "Un bloqueur neuromusculaire lève rapidement la contraction et permet de reprendre une ventilation contrôlée.",
        [
          F(
            "La rigidité thoracique disparaît immédiatement après une nouvelle dose de fentanyl.",
            "Une nouvelle exposition risque d’aggraver le mécanisme causal.",
          ),
          T(
            "Un curare adapté lève directement la rigidité musculaire.",
            "Le bloc neuromusculaire relâche la paroi thoracique et permet de rétablir la ventilation.",
          ),
          F(
            "Un bronchodilatateur inhalé isolé lève la rigidité thoracique opioïde.",
            "Le mécanisme concerne le muscle strié et répond au bloc neuromusculaire, pas à une bronchodilatation isolée.",
          ),
          F(
            "Différer tout traitement jusqu’à l’exclusion exhaustive des causes mécaniques.",
            "La désaturation et l’impossibilité de ventiler imposent une correction immédiate de la rigidité.",
          ),
          T(
            "Assurer immédiatement l’oxygénation et une ventilation assistée.",
            "Le support ventilatoire ne peut attendre la disparition spontanée de la rigidité.",
          ),
        ],
        "La saturation diminue malgré l’oxygène pur et l’équipe dispose déjà d’un accès veineux fiable.",
      ),
      qcm(
        "Quel rôle peut avoir la naloxone si la curarisation n’est pas souhaitée ?",
        ["b00048", "b00066"],
        "La naloxone peut antagoniser l’effet opioïde, mais sa titration doit tenir compte de la perte d’analgésie et de la réponse sympathique.",
        [
          F(
            "La naloxone relâche directement le muscle strié par bloc neuromusculaire.",
            "Elle antagonise les récepteurs opioïdes centraux sans agir comme un curare.",
          ),
          F(
            "Une dose élevée de naloxone préserve l’intégralité de l’analgésie.",
            "Une antagonisation excessive supprime aussi l’effet antalgique du fentanyl.",
          ),
          F(
            "Le passage central de la naloxone est insuffisant pour antagoniser le fentanyl.",
            "La naloxone atteint les récepteurs opioïdes centraux et peut lever un effet μ excessif.",
          ),
          T(
            "Sa durée peut être plus courte que celle du fentanyl.",
            "Une récidive impose donc une surveillance après amélioration.",
          ),
          F(
            "Son injection autorise l’arrêt immédiat de la ventilation assistée.",
            "Le support ventilatoire doit être maintenu jusqu’au retour d’une respiration spontanée sûre.",
          ),
        ],
        "La ventilation est rétablie après curarisation ; l’équipe discute la conduite à tenir si l’effet opioïde reste excessif.",
      ),
      qcm(
        "Quels paramètres surveiller après la stabilisation ?",
        ["b00048", "b00066", "b00119"],
        "La ventilation, la vigilance, l’hémodynamique et une éventuelle récidive doivent être suivies pendant la poursuite anesthésique.",
        [
          T(
            "La capnographie et les volumes ventilés.",
            "Ils objectivent la qualité de la ventilation contrôlée.",
          ),
          T(
            "La pression artérielle et le rythme cardiaque.",
            "L’équilibre entre stimulation chirurgicale et antagonisme peut les modifier.",
          ),
          T(
            "La réapparition d’une rigidité après fin de curarisation.",
            "La durée du fentanyl peut dépasser celle du bloqueur neuromusculaire.",
          ),
          T(
            "L’évolution de la saturation après la stabilisation.",
            "Elle complète la capnographie pour vérifier l’efficacité de l’oxygénation et de la ventilation.",
          ),
          T(
            "La dose totale de fentanyl administrée.",
            "Le cumul aide à prévoir la durée des effets résiduels.",
          ),
        ],
        "Le geste se poursuit sous ventilation contrôlée et l’équipe réduit l’exposition opioïde supplémentaire.",
      ),
      qcm(
        "Comment prévenir la même complication lors d’une prochaine induction ?",
        ["b00047", "b00048"],
        "Une dose individualisée, administrée moins brutalement, avec anticipation de la ventilation et du bloc neuromusculaire réduit le risque.",
        [
          F(
            "Considérer la rigidité comme une allergie définitive aux morphiniques",
            "Il s’agit d’un effet pharmacodynamique dose-dépendant et non d’une réaction allergique.",
          ),
          T(
            "Éviter une injection massive trop rapide.",
            "La vitesse et la forte dose favorisent la rigidité thoracique.",
          ),
          T(
            "Préparer les moyens de ventilation avant l’opioïde.",
            "L’apnée reste un effet prévisible du fentanyl anesthésique.",
          ),
          T(
            "Adapter la dose de fentanyl au grand âge et au contexte clinique.",
            "La vulnérabilité du patient âgé impose une exposition plus prudente.",
          ),
          T(
            "Coordonner l’administration avec l’hypnotique et le curare.",
            "Cette séquence sécurise l’induction et la maîtrise des voies aériennes.",
          ),
        ],
        "La feuille d’anesthésie mentionne l’épisode afin de préparer les procédures futures.",
      ),
      qcm(
        "Quelle transmission postopératoire est pertinente ?",
        ["b00048", "b00119"],
        "L’épisode de rigidité, les doses reçues, la curarisation et les risques respiratoires résiduels doivent être explicitement tracés.",
        [
          T(
            "Décrire la difficulté ventilatoire et son mécanisme retenu.",
            "L’équipe de SSPI doit comprendre la cause de l’événement.",
          ),
          T(
            "Indiquer la dose cumulée de fentanyl.",
            "Le cumul conditionne le risque de sédation et de dépression respiratoire.",
          ),
          T(
            "Tracer le traitement neuromusculaire administré.",
            "Une curarisation résiduelle peut aussi compromettre la ventilation.",
          ),
          T(
            "Prévoir une surveillance rapprochée de la vigilance.",
            "Une sédation croissante peut annoncer une complication respiratoire.",
          ),
          T(
            "Signaler toute antagonisation opioïde et son horaire.",
            "La durée brève de la naloxone impose d’anticiper une récidive de l’effet opioïde.",
          ),
        ],
        "M. Ben Salem est transféré intubé en réanimation après l’intervention.",
      ),
    ],
  },
  {
    title: "Méthadone chronique et chirurgie",
    vignette:
      "Mme Dupuis, patiente de 52 ans traitée depuis plusieurs années par méthadone 90 mg par jour, doit être opérée d’une fracture de cheville. Elle reçoit aussi un antidépresseur sérotoninergique. Son ECG préopératoire montre un QTc allongé et elle signale une douleur chronique mal contrôlée malgré son traitement habituel.",
    questions: [
      qcm(
        "Quelles propriétés de la méthadone sont pertinentes ici ?",
        ["b00043"],
        "La méthadone associe agonisme mu, antagonisme NMDA, inhibition de recapture monoaminergique et longue demi-vie variable.",
        [
          T(
            "Elle active les récepteurs mu.",
            "Cette action explique l’analgésie opioïde et la dépendance physique.",
          ),
          T(
            "Elle antagonise les récepteurs NMDA.",
            "Cette propriété peut moduler hyperalgésie et douleur neuropathique.",
          ),
          T(
            "Elle inhibe la recapture de sérotonine et noradrénaline.",
            "Cette action ajoute un risque d’interaction monoaminergique.",
          ),
          T(
            "Sa demi-vie est longue et variable.",
            "L’accumulation et la persistance des effets sont donc difficiles à prévoir.",
          ),
          T(
            "Au-delà de 80 mg/j, la surveillance du QT devient particulièrement importante.",
            "Les fortes doses quotidiennes de méthadone majorent la vigilance électrocardiographique.",
          ),
        ],
      ),
      qcm(
        "Pourquoi l’ECG impose-t-il une vigilance particulière ?",
        ["b00043"],
        "Une dose quotidienne supérieure à 80 mg est associée à un allongement du QT et à un risque rythmique.",
        [
          T(
            "La patiente dépasse le seuil de 80 mg/j signalé.",
            "Son traitement à 90 mg/j appartient à la zone de vigilance accrue.",
          ),
          T(
            "Un QTc déjà long augmente le risque de torsade.",
            "La repolarisation prolongée favorise une arythmie ventriculaire grave.",
          ),
          F(
            "Le risque de QT long diminue lorsque la dose quotidienne dépasse 80 mg.",
            "Les fortes doses renforcent la vigilance requise sur le QT.",
          ),
          F(
            "L’allongement du QT prouve une insuffisance d’analgésie.",
            "Il s’agit d’un signal cardiaque, sans mesurer l’intensité douloureuse.",
          ),
          F(
            "Une dose élevée de méthadone raccourcit systématiquement le QT.",
            "L’effet décrit est un allongement dose-dépendant.",
          ),
        ],
        "Le cardiologue confirme un QTc à 510 ms sans trouble électrolytique évident.",
      ),
      qcm(
        "Quelle interaction doit être anticipée avec l’antidépresseur ?",
        ["b00043", "b00094", "b00099"],
        "Le cumul d’actions sérotoninergiques expose à un syndrome sérotoninergique et impose une revue complète du traitement.",
        [
          T(
            "Une agitation nouvelle doit alerter.",
            "Elle peut constituer une manifestation neurologique d’excès sérotoninergique.",
          ),
          T(
            "Une hyperréflexie ou un clonus sont évocateurs.",
            "Ces signes neuromusculaires orientent vers le syndrome sérotoninergique.",
          ),
          T(
            "Une hyperthermie peut apparaître dans une forme grave.",
            "L’activation autonome et musculaire augmente la température.",
          ),
          T(
            "La triade associe manifestations neuropsychiatriques, autonomes et neuromusculaires.",
            "Cette association clinique caractérise le syndrome sérotoninergique.",
          ),
          T(
            "Les associations périopératoires sérotoninergiques doivent être limitées.",
            "Réduire les coexpositions diminue le risque d’interaction toxique.",
          ),
        ],
        "La patiente rapporte depuis la veille des tremblements et une agitation inhabituelle après une modification de traitement.",
      ),
      qcm(
        "Comment concevoir l’analgésie chirurgicale malgré la tolérance opioïde ?",
        ["b00003", "b00043", "b00119"],
        "Le traitement chronique ne couvre pas à lui seul la douleur opératoire ; une stratégie multimodale individualisée évite l’escalade aveugle.",
        [
          F(
            "Augmenter la méthadone sans ECG ni réévaluation",
            "Le QT long et la demi-vie prolongée rendent cette escalade dangereuse.",
          ),
          T(
            "Prévoir que les besoins aigus peuvent être supérieurs.",
            "La tolérance diminue la réponse aux doses habituelles.",
          ),
          T(
            "Le traitement chronique seul ne couvre pas la douleur chirurgicale aiguë.",
            "La tolérance peut même augmenter les besoins antalgiques périopératoires.",
          ),
          T(
            "Utiliser une technique locorégionale si elle est appropriée.",
            "Le bloc périphérique procure une analgésie sans ajouter d’effet cardiorespiratoire systémique.",
          ),
          T(
            "Maintenir une approche multimodale",
            "Des mécanismes complémentaires réduisent l’augmentation des opioïdes.",
          ),
        ],
        "Le syndrome sérotoninergique est écarté et l’intervention est maintenue sous surveillance renforcée.",
      ),
      qcm(
        "Quelle place peut avoir la kétamine chez cette patiente ?",
        ["b00043", "b00070", "b00072"],
        "Son antagonisme NMDA peut compléter celui de la méthadone et réduire les besoins opioïdes chez une patiente tolérante.",
        [
          F(
            "La kétamine est contre-indiquée uniquement parce que la patiente reçoit de la méthadone.",
            "L’association n’est pas une interdiction automatique et doit être évaluée selon le terrain.",
          ),
          F(
            "La stimulation sympathique de la kétamine dispense de monitorage tensionnel.",
            "Elle justifie une surveillance hémodynamique.",
          ),
          F(
            "Elle allonge nécessairement le QT de façon majeure.",
            "Ce n’est pas le risque principal décrit pour la kétamine antalgique.",
          ),
          T(
            "Ses effets psychotomimétiques doivent être surveillés.",
            "Hallucinations et agitation peuvent survenir au réveil.",
          ),
          F(
            "Une faible dose de kétamine supprime tout risque psychodysleptique.",
            "Hallucinations, agitation ou dysphorie restent possibles même lors d’un usage antalgique.",
          ),
        ],
        "Malgré le bloc périphérique, une douleur importante persiste lors de la réduction de la fracture.",
      ),
      qcm(
        "Quels éléments surveiller en postopératoire ?",
        ["b00043", "b00094", "b00119"],
        "Le risque associe accumulation opioïde, trouble rythmique et interaction sérotoninergique ; la surveillance doit couvrir ces trois axes.",
        [
          F(
            "La surveillance respiratoire peut s’arrêter en SSPI si le bloc périphérique est efficace.",
            "La méthadone et le complément opioïde peuvent encore déprimer la ventilation.",
          ),
          F(
            "Un ECG normal isolé autorise l’arrêt de toute surveillance rythmique.",
            "La méthadone à demi-vie longue et les interactions imposent une surveillance prolongée.",
          ),
          F(
            "La télémétrie remplace l’évaluation régulière de la vigilance.",
            "Le monitorage cardiaque ne dépiste pas à lui seul la sédation opioïde.",
          ),
          T(
            "La fréquence respiratoire et la vigilance.",
            "La méthadone persiste longtemps et peut s’ajouter aux opioïdes périopératoires.",
          ),
          F(
            "La dose chronique de méthadone peut être omise de l’exposition opioïde totale.",
            "Son effet prolongé s’ajoute au complément périopératoire et contribue au risque respiratoire.",
          ),
        ],
        "En SSPI, Mme Dupuis reçoit un faible complément opioïde et son traitement chronique est documenté.",
      ),
      qcm(
        "Quelle transmission sécurise son retour en unité ?",
        ["b00043", "b00094"],
        "Le plan doit préciser la dose habituelle, le QT long, les interactions évitées et la stratégie de secours antalgique.",
        [
          T(
            "Tracer la méthadone quotidienne de 90 mg.",
            "Une omission exposerait à un sevrage ou à une double administration.",
          ),
          T(
            "Signaler le QTc à 510 ms.",
            "Cette donnée guide le choix des médicaments et la surveillance.",
          ),
          T(
            "Lister les agents sérotoninergiques administrés ou évités.",
            "La traçabilité permet de reconnaître une interaction retardée.",
          ),
          T(
            "Définir les critères d’appel en cas de sédation.",
            "Une baisse de vigilance sous opioïde prolongé impose une évaluation rapide.",
          ),
          T(
            "Transmettre l’heure de la dernière prise de méthadone et celle prévue pour la suivante.",
            "Cette information sécurise la continuité du traitement sans cumul involontaire.",
          ),
        ],
        "La douleur est contrôlée et la patiente quitte la SSPI avec télémétrie.",
      ),
    ],
  },
  {
    title: "Échec de codéine et variabilité CYP2D6",
    vignette:
      "M. Robert, patient de 36 ans, consulte après une chirurgie ambulatoire de la main. Malgré des prises correctes de paracétamol associé à la codéine, sa douleur reste à 7/10. Il ne présente ni somnolence ni nausée. Un antécédent familial suggère une faible réponse à plusieurs médicaments dépendant du CYP2D6.",
    questions: [
      qcm(
        "Pourquoi la codéine peut-elle être inefficace malgré une bonne observance ?",
        ["b00037"],
        "La codéine a peu d’affinité opioïde propre et dépend de sa conversion CYP2D6 en morphine, variable selon le phénotype.",
        [
          F(
            "L’augmentation répétée de codéine corrige le défaut de métabolisation lente.",
            "Elle augmente l’exposition sans restaurer correctement la formation de morphine.",
          ),
          F(
            "La présence de nausées confirme l’efficacité antalgique de la codéine.",
            "Un effet digestif ne permet pas de conclure au soulagement de la douleur.",
          ),
          F(
            "La tolérance digestive permet d’attribuer la plainte douloureuse à une simulation.",
            "Les effets digestifs ne permettent pas de juger l’authenticité de la douleur.",
          ),
          T(
            "Le polymorphisme génétique du CYP2D6 modifie la réponse.",
            "La variabilité enzymatique crée des profils lents ou ultrarapides.",
          ),
          F(
            "L’échec antalgique sous codéine démontre une dépendance aux opioïdes.",
            "Une réponse insuffisante peut simplement refléter une faible activation par le CYP2D6.",
          ),
        ],
      ),
      qcm(
        "Quel risque opposé existe chez un métaboliseur ultrarapide ?",
        ["b00037"],
        "Une conversion abondante et rapide en morphine expose à une toxicité opioïde, notamment respiratoire.",
        [
          T(
            "Une sédation disproportionnée peut apparaître.",
            "La quantité élevée de morphine renforce l’effet central.",
          ),
          T(
            "Une dépression respiratoire devient possible.",
            "L’excès d’agonisme mu diminue la commande ventilatoire.",
          ),
          T(
            "Une formation accrue de morphine explique le surdosage.",
            "Le métaboliseur ultrarapide produit davantage de métabolite actif à dose identique.",
          ),
          T(
            "Une surveillance respiratoire renforcée reste nécessaire après une dose usuelle.",
            "La production excessive de morphine peut rendre cette dose dangereuse chez le métaboliseur ultrarapide.",
          ),
          F(
            "Le phénotype ultrarapide protège contre toute constipation.",
            "Les effets périphériques opioïdes augmentent avec l’exposition à la morphine.",
          ),
        ],
        "Le patient demande si une réponse familiale inverse pourrait rendre la codéine dangereuse.",
      ),
      qcm(
        "Pourquoi le tramadol n’est-il pas un remplacement assuré dans ce contexte ?",
        ["b00062"],
        "Son métabolite opioïde actif M1 dépend lui aussi du CYP2D6, ce qui reproduit le risque d’inefficacité chez un métaboliseur lent.",
        [
          F(
            "Le tramadol contourne le CYP2D6 grâce à un métabolite actif formé par le rein.",
            "Son métabolite M1 dépend lui aussi du CYP2D6.",
          ),
          F(
            "L’affinité μ intrinsèque du tramadol égale celle de la morphine.",
            "Elle est très faible et une part importante de l’effet dépend du métabolite M1.",
          ),
          T(
            "Le même phénotype lent peut réduire la formation du métabolite M1.",
            "Une faible production d’O-desméthyltramadol diminue alors la composante opioïde.",
          ),
          F(
            "La glucuronidation du tramadol produit le métabolite M1 sans intervention du CYP2D6.",
            "La formation du métabolite opioïde actif dépend de l’O-déméthylation par le CYP2D6.",
          ),
          F(
            "Son remplacement résout automatiquement toute douleur neuropathique.",
            "Le choix dépend du mécanisme douloureux et de la réponse clinique individuelle.",
          ),
        ],
        "Une ordonnance de tramadol est proposée sans tenir compte de l’échec de codéine.",
      ),
      qcm(
        "Quelle alternative évite cette activation CYP2D6 obligatoire ?",
        ["b00039", "b00041", "b00064"],
        "Une molécule active sans bioactivation CYP2D6, choisie selon l’intensité et le terrain, est plus rationnelle.",
        [
          F(
            "Une association codéine-tramadol supprime la variabilité liée au CYP2D6.",
            "Les deux molécules partagent cette voie d’activation et peuvent échouer chez le même patient.",
          ),
          T(
            "L’hydromorphone possède une activité agoniste propre.",
            "Elle ne nécessite pas la conversion CYP2D6 de la codéine.",
          ),
          F(
            "La réponse à l’oxycodone dépend exclusivement de sa conversion par le CYP2D6.",
            "L’oxycodone possède une activité propre qui évite cette activation obligatoire.",
          ),
          F(
            "Le tapentadol exige une activation par le CYP2D6 avant de devenir antalgique.",
            "Il est directement actif et sa glucuronidation ne forme pas de métabolite actif.",
          ),
          F(
            "La mépéridine au long cours.",
            "Son métabolite neurotoxique et sa faible puissance rendent ce choix défavorable.",
          ),
        ],
        "La douleur reste nociceptive et aucun signe de complication chirurgicale n’est retrouvé.",
      ),
      qcm(
        "Comment conserver une approche multimodale ?",
        ["b00003", "b00009", "b00020"],
        "Un opioïde éventuel complète, sans remplacer, les antalgiques non opioïdes adaptés et la réévaluation de la cause.",
        [
          T(
            "Poursuivre le paracétamol dans la limite quotidienne adaptée.",
            "Son mécanisme distinct demeure utile malgré l’échec de la codéine.",
          ),
          F(
            "La sédation constitue le critère principal d’efficacité d’un relais opioïde.",
            "L’objectif est un soulagement fonctionnel sans altération de la vigilance.",
          ),
          T(
            "Utiliser des mesures locales et fonctionnelles appropriées.",
            "La multimodalité ne se limite pas aux médicaments systémiques.",
          ),
          F(
            "Une fonction rénale normale contre-indique encore tout AINS de courte durée.",
            "En l’absence de risque rénal, digestif ou hémorragique, un AINS court peut être discuté.",
          ),
          F(
            "Attribuer toute douleur persistante au génotype sans examen.",
            "Une complication chirurgicale doit toujours être recherchée cliniquement.",
          ),
        ],
        "Le bilan confirme une fonction rénale normale et l’absence d’anticoagulant ou d’antécédent digestif.",
      ),
      qcm(
        "Quels critères évaluent l’efficacité de la nouvelle stratégie ?",
        ["b00003", "b00119"],
        "L’évaluation associe intensité douloureuse, récupération fonctionnelle et absence d’effets opioïdes limitants.",
        [
          T(
            "La douleur au repos et lors du mouvement.",
            "Le soulagement fonctionnel est plus informatif qu’une mesure unique.",
          ),
          F(
            "La baisse des nausées suffit à conclure à une analgésie fonctionnelle.",
            "Ce critère de tolérance ne mesure ni la douleur ni la capacité de mobilisation.",
          ),
          F(
            "La somnolence croissante confirme que la dose antalgique est adaptée.",
            "Elle signale une exposition excessive.",
          ),
          F(
            "Une mesure unique de la douleur au repos suffit à valider la récupération fonctionnelle.",
            "L’évaluation doit aussi porter sur le mouvement et l’utilisation de la main.",
          ),
          T(
            "Le besoin de doses de secours.",
            "Une consommation répétée signale une stratégie de fond insuffisante.",
          ),
        ],
        "Après changement d’antalgique, la douleur diminue à 3/10 sans somnolence.",
      ),
      qcm(
        "Quelle information remettre au patient ?",
        ["b00037", "b00062"],
        "L’inefficacité probable des prodrogues CYP2D6 doit être tracée sans transformer une suspicion clinique en diagnostic génétique certain.",
        [
          F(
            "L’échec de codéine prouve une allergie à tous les opioïdes.",
            "Des agonistes directement actifs peuvent rester efficaces avec une surveillance adaptée.",
          ),
          T(
            "Signaler que le tramadol peut partager cette variabilité.",
            "Les deux molécules dépendent de la formation d’un métabolite actif par CYP2D6.",
          ),
          T(
            "Recommander une réévaluation plutôt qu’une augmentation autonome.",
            "L’escalade non supervisée peut devenir toxique ou masquer une complication.",
          ),
          F(
            "Affirmer un génotype précis sans test ni preuve.",
            "La réponse clinique suggère un mécanisme sans établir formellement le génotype.",
          ),
          F(
            "Le patient peut doubler seul la dose après un soulagement insuffisant.",
            "Une inefficacité doit conduire à une réévaluation plutôt qu’à une augmentation autonome.",
          ),
        ],
        "M. Robert rentre à domicile avec un plan écrit et un contrôle rapproché.",
      ),
    ],
  },
  {
    title: "Douleur neuropathique et insuffisance rénale",
    vignette:
      "Mme Caron, patiente de 71 ans atteinte de diabète et d’insuffisance rénale chronique, décrit depuis plusieurs mois des brûlures symétriques des pieds avec décharges électriques nocturnes. Sa clairance de créatinine est à 24 mL/min. Elle prend déjà plusieurs médicaments et craint la somnolence ainsi que les chutes.",
    questions: [
      qcm(
        "Quels éléments orientent vers une douleur neuropathique ?",
        ["b00075", "b00084"],
        "Brûlures, décharges électriques et chronicité distale évoquent une lésion ou un dysfonctionnement du système somatosensoriel.",
        [
          T(
            "La qualité brûlante de la douleur.",
            "Cette description est fréquemment associée à une composante neuropathique.",
          ),
          T(
            "Les décharges électriques nocturnes.",
            "Ces accès paroxystiques renforcent l’hypothèse neuropathique.",
          ),
          T(
            "La distribution distale symétrique chez une diabétique.",
            "Ce territoire correspond à une polyneuropathie périphérique probable.",
          ),
          F(
            "Une douleur exclusivement liée à une inflammation aiguë postopératoire.",
            "Le tableau chronique distal ne correspond pas à ce mécanisme.",
          ),
          T(
            "La nécessité d’une prise en charge différente des douleurs nociceptives simples.",
            "Les coanalgésiques centraux y occupent une place importante.",
          ),
        ],
      ),
      qcm(
        "Comment agissent gabapentine et prégabaline ?",
        ["b00076"],
        "Elles se fixent sur la sous-unité α2δ des canaux calciques et réduisent la libération de neurotransmetteurs excitateurs.",
        [
          T(
            "Elles se lient à la sous-unité α2δ.",
            "Cette cible module les canaux calciques voltage-dépendants.",
          ),
          T(
            "Elles diminuent la libération de glutamate.",
            "La transmission excitatrice nociceptive est ainsi réduite.",
          ),
          T(
            "Elles diminuent aussi la substance P et la noradrénaline.",
            "Plusieurs médiateurs présynaptiques sont moins libérés.",
          ),
          F(
            "Elles stimulent directement les récepteurs opioïdes mu.",
            "Leur mécanisme est indépendant de l’agonisme opioïde.",
          ),
          F(
            "Elles inhibent irréversiblement COX-1.",
            "Elles n’appartiennent pas à la classe des anti-inflammatoires non stéroïdiens.",
          ),
        ],
        "L’équipe propose un gabapentinoïde comme premier coanalgésique.",
      ),
      qcm(
        "Quelle adaptation impose la clairance à 24 mL/min ?",
        ["b00077", "b00082"],
        "L’élimination rénale des deux molécules impose une forte réduction de dose et une titration lente sous 30 mL/min.",
        [
          F(
            "Une clairance à 24 mL/min autorise la dose standard de prégabaline.",
            "Cette insuffisance rénale sévère impose une réduction ou un espacement.",
          ),
          T(
            "Espacer ou réduire les prises selon le produit.",
            "L’ajustement limite l’accumulation entre les administrations.",
          ),
          F(
            "L’accumulation rénale réduit le risque de somnolence sous gabapentinoïde.",
            "L’exposition accrue majore les effets neurologiques.",
          ),
          F(
            "L’insuffisance rénale accélère l’élimination de la prégabaline.",
            "La baisse de clairance ralentit son élimination et augmente l’exposition.",
          ),
          F(
            "Considérer la gabapentine comme exclusivement éliminée par le foie.",
            "Son élimination est rénale et dépend de la fonction glomérulaire.",
          ),
        ],
        "La prescription informatique propose par défaut une dose prévue pour une fonction rénale normale.",
      ),
      qcm(
        "Quels effets indésirables menacent particulièrement son autonomie ?",
        ["b00077", "b00082"],
        "Somnolence, étourdissements, ataxie et troubles visuels augmentent le risque de chute chez cette patiente âgée.",
        [
          T(
            "Une somnolence diurne.",
            "La baisse de vigilance compromet la marche et les activités quotidiennes.",
          ),
          T(
            "Une démarche instable avec défaut de coordination.",
            "Cette ataxie médicamenteuse augmente directement le risque de chute.",
          ),
          T(
            "Une diplopie ou une vision embrouillée.",
            "Une altération visuelle perturbe l’équilibre et le repérage.",
          ),
          T(
            "Des étourdissements au lever.",
            "Ce symptôme peut rendre les déplacements dangereux.",
          ),
          T(
            "Un œdème périphérique susceptible de gêner la marche.",
            "Cet effet indésirable peut aggraver l’instabilité et limiter l’autonomie.",
          ),
        ],
        "Après trois jours, Mme Caron se sent instable et manque de tomber la nuit.",
      ),
      qcm(
        "Quelle alternative antidépressive peut être envisagée avec prudence ?",
        ["b00085", "b00088"],
        "Un tricyclique ou un IRSN peut traiter la douleur neuropathique, mais le choix dépend des effets anticholinergiques et cardiovasculaires.",
        [
          T(
            "La nortriptyline a moins d’effets anticholinergiques que l’amitriptyline.",
            "Cette amine secondaire peut être mieux tolérée chez le sujet âgé.",
          ),
          T(
            "La duloxétine renforce les voies descendantes monoaminergiques.",
            "L’inhibition de recapture de sérotonine et noradrénaline soutient l’analgésie.",
          ),
          F(
            "L’amitriptyline est dépourvue de risque de confusion.",
            "Son activité anticholinergique peut altérer les fonctions cognitives.",
          ),
          F(
            "Un tricyclique doit être débuté directement à dose maximale chez cette patiente âgée.",
            "Le grand âge et les comorbidités imposent une faible dose initiale et une titration prudente.",
          ),
          F(
            "Les antidépresseurs procurent une analgésie immédiate en quelques minutes.",
            "Leur effet antalgique nécessite une titration et un délai clinique.",
          ),
        ],
        "Le gabapentinoïde est réduit et une autre classe est discutée en raison de la douleur persistante.",
      ),
      qcm(
        "Quels signes traduiraient une charge anticholinergique excessive ?",
        ["b00095"],
        "Xérostomie, constipation, vision trouble, rétention urinaire et confusion composent le profil antimuscarinique.",
        [
          T(
            "Une bouche sèche marquée.",
            "La diminution des sécrétions salivaires résulte du bloc muscarinique.",
          ),
          T(
            "Une rétention urinaire.",
            "Le trouble de contraction vésicale peut être particulièrement gênant chez le sujet âgé.",
          ),
          T(
            "Une confusion nouvelle.",
            "L’effet anticholinergique central peut provoquer un syndrome cognitif aigu.",
          ),
          F(
            "Une diarrhée sécrétoire profuse.",
            "L’effet attendu est plutôt un ralentissement intestinal avec constipation.",
          ),
          T(
            "Une vision trouble.",
            "Les effets oculaires antimuscariniques peuvent altérer l’accommodation.",
          ),
        ],
        "Une faible dose de tricyclique est commencée ; sa famille signale une confusion et une bouche très sèche.",
      ),
      qcm(
        "Comment réévaluer le plan thérapeutique ?",
        ["b00075", "b00077", "b00085"],
        "Le traitement doit équilibrer soulagement, sommeil et fonction sans accepter une toxicité neurologique ou anticholinergique.",
        [
          T(
            "Mesurer l’effet sur les brûlures et les décharges.",
            "Les symptômes cibles permettent de juger le bénéfice réel.",
          ),
          T(
            "Documenter chutes, confusion et somnolence.",
            "Ces événements peuvent rendre le rapport bénéfice-risque défavorable.",
          ),
          T(
            "Réduire ou arrêter l’agent mal toléré.",
            "La persistance d’effets graves n’est pas justifiée par une efficacité partielle.",
          ),
          F(
            "Additionner tous les coanalgésiques à pleine dose.",
            "L’empilement augmente les interactions et la toxicité chez cette patiente fragile.",
          ),
          T(
            "Associer des mesures non pharmacologiques adaptées.",
            "La prise en charge neuropathique gagne à rester multimodale et fonctionnelle.",
          ),
        ],
        "La douleur baisse légèrement, mais les effets indésirables limitent désormais la marche et l’autonomie.",
      ),
    ],
  },
  {
    title: "Consommation de cannabis et douleur postopératoire",
    vignette:
      "M. Giraud, patient de 47 ans, est admis pour chirurgie abdominale programmée. Il consomme quotidiennement du cannabis inhalé pour une lombalgie chronique et affirme qu’il n’aura besoin d’aucun autre antalgique. Il tousse fréquemment, décrit des épisodes d’anxiété et ne connaît pas précisément la teneur en THC de ses produits.",
    questions: [
      qcm(
        "Quelles données doivent être précisées avant l’intervention ?",
        ["b00102", "b00109", "b00112"],
        "L’évaluation distingue produit, voie, dose, fréquence, dernier usage, effets recherchés et complications respiratoires ou psychiques.",
        [
          T(
            "La voie inhalée et la fréquence quotidienne.",
            "Elles conditionnent l’exposition pulmonaire et la tolérance.",
          ),
          T(
            "Le moment de la dernière consommation.",
            "Une intoxication récente peut modifier vigilance et comportement.",
          ),
          T(
            "La composition en THC et CBD si elle est connue.",
            "Ces cannabinoïdes ont des effets pharmacologiques différents.",
          ),
          T(
            "Les symptômes bronchiques et anxieux.",
            "Ils peuvent révéler des effets indésirables pertinents pour l’anesthésie.",
          ),
          F(
            "Uniquement la marque commerciale du papier utilisé.",
            "Cette information ne suffit pas à caractériser l’exposition pharmacologique.",
          ),
        ],
      ),
      qcm(
        "Comment distinguer les effets du THC et du CBD ?",
        ["b00103", "b00104", "b00105"],
        "Le THC est psychoactif par agonisme CB1 ; le CBD n’active pas directement CB1 et possède d’autres cibles.",
        [
          F(
            "Le CBD est l’agoniste CB1 responsable des effets psychotiques du cannabis.",
            "Le CBD est non psychoactif et ne se lie pas directement au récepteur CB1.",
          ),
          F(
            "Le THC est dépourvu d’effet sur la mémoire et la cognition.",
            "Son activation centrale de CB1 peut altérer ces fonctions.",
          ),
          F(
            "Le THC agit uniquement sur les récepteurs CB2 périphériques et reste non psychoactif.",
            "Son agonisme central CB1 explique euphorie et troubles cognitifs.",
          ),
          F(
            "Le CBD stimule l’appétit par une euphorie comparable à celle du THC.",
            "L’effet orexigène et l’euphorie relèvent surtout du THC.",
          ),
          T(
            "CB2 est davantage représenté dans le système immunitaire.",
            "Sa distribution soutient une modulation inflammatoire périphérique.",
          ),
        ],
        "Le patient apporte une huile annoncée riche en CBD et un produit inhalé riche en THC.",
      ),
      qcm(
        "Quels risques sont liés à la voie inhalée chronique ?",
        ["b00109", "b00112"],
        "La combustion et l’inhalation répétées exposent à bronchite, obstruction, atteinte respiratoire et risque néoplasique.",
        [
          T(
            "Une bronchite chronique.",
            "La fumée irrite durablement les voies aériennes.",
          ),
          T(
            "Une obstruction des voies respiratoires.",
            "L’exposition inhalée peut altérer la fonction ventilatoire.",
          ),
          T(
            "Un risque de cancer pulmonaire.",
            "La combustion expose à des substances potentiellement cancérogènes.",
          ),
          T(
            "Une hyperréactivité bronchique susceptible de compliquer la ventilation.",
            "Les sibilants et la toux chronique imposent d’anticiper ce risque.",
          ),
          T(
            "Une évaluation respiratoire préopératoire plus attentive.",
            "La toux quotidienne signale une possible complication pulmonaire.",
          ),
        ],
        "L’examen retrouve une toux productive et des sibilants intermittents sans détresse aiguë.",
      ),
      qcm(
        "Pourquoi le cannabis ne remplace-t-il pas l’analgésie postopératoire prévue ?",
        ["b00111", "b00112"],
        "L’efficacité dans la douleur aiguë postopératoire n’est pas démontrée et les effets indésirables peuvent compliquer la récupération.",
        [
          T(
            "Les essais aigus postopératoires n’ont pas montré de bénéfice concluant.",
            "Les données ne permettent pas d’en faire un traitement de référence.",
          ),
          F(
            "Le THC possède une efficacité supérieure certaine à la morphine après chirurgie",
            "Une telle supériorité n’est pas établie dans la douleur aiguë postopératoire.",
          ),
          T(
            "Les troubles cognitifs peuvent gêner l’évaluation de la douleur.",
            "Les effets centraux du THC compliquent communication et surveillance.",
          ),
          T(
            "La consommation chronique ne fournit pas une couverture fiable de la douleur d’incision.",
            "Une lombalgie habituelle et une chirurgie abdominale ont des besoins antalgiques différents.",
          ),
          T(
            "Une stratégie multimodale conventionnelle reste nécessaire.",
            "Des antalgiques validés et adaptés au terrain doivent être planifiés.",
          ),
        ],
        "M. Giraud refuse initialement le paracétamol et souhaite reprendre immédiatement son produit inhalé après l’extubation.",
      ),
      qcm(
        "Quels effets indésirables cannabinoïdes rechercher en SSPI ?",
        ["b00111"],
        "La surveillance porte sur cognition, anxiété, psychose, tachycardie, hypotension orthostatique et symptômes digestifs.",
        [
          F(
            "Une paralysie neuromusculaire pharmacologique attendue",
            "Ce n’est pas un effet caractéristique des cannabinoïdes décrits.",
          ),
          T(
            "Une anxiété ou des symptômes psychotiques.",
            "Le THC peut déclencher des manifestations psychiatriques aiguës.",
          ),
          T(
            "Une accélération inexpliquée de la fréquence cardiaque.",
            "La tachycardie appartient aux manifestations cardiovasculaires des cannabinoïdes.",
          ),
          T(
            "Une hypotension orthostatique.",
            "La vasodilatation peut compromettre la mobilisation.",
          ),
          T(
            "Des troubles cognitifs ou mnésiques susceptibles de gêner le réveil.",
            "Les effets centraux du THC peuvent perturber l’orientation et l’évaluation postopératoire.",
          ),
        ],
        "Au réveil, le patient est anxieux, tachycarde et demande son cannabis malgré une saturation correcte.",
      ),
      qcm(
        "Comment proposer une analgésie sûre et acceptable ?",
        ["b00003", "b00009", "b00111"],
        "Une décision partagée explique les limites des cannabinoïdes et propose des traitements validés, titrés et surveillés.",
        [
          F(
            "L’inhalation de cannabis en SSPI prévient la dépression respiratoire des opioïdes.",
            "La fumée aggrave le risque respiratoire et ne remplace pas la surveillance.",
          ),
          F(
            "Le refus initial du patient impose d’abandonner toute analgésie non inhalée.",
            "Une information factuelle permet de construire une stratégie multimodale acceptable.",
          ),
          T(
            "Titrer un opioïde si nécessaire sous surveillance.",
            "Une douleur chirurgicale intense peut nécessiter un agoniste mu contrôlé.",
          ),
          F(
            "Un produit cannabinoïde inhalé fournit une dose postopératoire reproductible.",
            "La composition et la quantité délivrée par un produit inhalé non standardisé restent incertaines.",
          ),
          T(
            "Réévaluer régulièrement douleur, fonction et effets centraux.",
            "Le suivi permet d’adapter sans surtraiter ni méconnaître une complication.",
          ),
        ],
        "Après explications, M. Giraud accepte une analgésie multimodale et renonce à inhaler pendant l’hospitalisation.",
      ),
      qcm(
        "Que transmettre avant la sortie ?",
        ["b00109", "b00111", "b00112"],
        "Le plan de sortie doit distinguer traitement aigu, consommation chronique, risques respiratoires et signes nécessitant une consultation.",
        [
          F(
            "Les effets cognitifs du THC disparaissent avant la sortie quelle que soit la dose consommée.",
            "Leur intensité et leur durée varient avec l’exposition et doivent être prises en compte dans les consignes.",
          ),
          F(
            "Le suivi peut ignorer la toux chronique liée à la fumée.",
            "Ce symptôme justifie une évaluation respiratoire et un accompagnement.",
          ),
          F(
            "Les antalgiques prescrits peuvent être associés librement à tout sédatif.",
            "Le cumul avec d’autres dépresseurs centraux augmente le risque de surdosage.",
          ),
          F(
            "La garantie que tout produit vendu contient une dose stable de THC.",
            "La composition des produits non standardisés peut rester incertaine.",
          ),
          T(
            "La nécessité d’éviter un mélange non encadré avec des sédatifs.",
            "Les effets centraux combinés peuvent altérer vigilance et sécurité.",
          ),
        ],
        "La douleur est contrôlée et le patient prépare son retour à domicile avec un suivi de sa consommation chronique.",
      ),
    ],
  },
  // __DPQCM_APPEND__
];

function buildDpQcm() {
  return DP_QCM.map((entry, index) => ({
    label: `DP QCM ${index + 1} · ${entry.title}`,
    vignette: entry.vignette,
    allowed_voies: ["interne"],
    questions: entry.questions,
  }));
}

const ISOLATED_QROC = [
  {
    title: "Paracétamol",
    questions: [
      qroc(
        "Quel métabolite toxique apparaît lorsque les voies usuelles du paracétamol sont saturées ?",
        "NAPQI|N-acétyl-p-benzoquinone imine",
        ["b00008"],
        "Le NAPQI s’accumule quand glucuronidation et sulfoconjugaison sont débordées.",
      ),
      qroc(
        "Quelle dose quotidienne maximale retenir chez un adulte fragile ?",
        "2 g/j|2 grammes par jour",
        ["b00009", "b00115"],
        "Dénutrition, grand âge, atteinte rénale, hépatique ou warfarine justifient ce plafond.",
      ),
      qroc(
        "Quelle voie de paracétamol présente une absorption très variable ?",
        "Voie rectale|Administration rectale",
        ["b00009"],
        "La biodisponibilité rectale imprévisible rend cette voie moins fiable.",
      ),
      qroc(
        "Quelle enzyme participe à la formation du métabolite hépatotoxique ?",
        "CYP2E1|Cytochrome P450 2E1",
        ["b00008"],
        "Le CYP2E1 oxyde une faible fraction du paracétamol en NAPQI.",
      ),
      qroc(
        "Quel est l’intérêt périopératoire principal du paracétamol ?",
        "Épargne opioïde|Réduction de la consommation d’opioïdes",
        ["b00010"],
        "Son association aux autres modalités diminue les besoins morphiniques.",
      ),
    ],
  },
  {
    title: "Anti-inflammatoires",
    questions: [
      qroc(
        "Sous quelle clairance de créatinine un AINS est-il contre-indiqué ?",
        "< 30 mL/min|Clairance inférieure à 30 mL/min",
        ["b00020"],
        "Une clairance sous 30 mL/min correspond à une insuffisance rénale sévère.",
      ),
      qroc(
        "Quelle isoforme de cyclo-oxygénase est fortement induite par l’inflammation ?",
        "COX-2|Cyclo-oxygénase 2",
        ["b00013"],
        "COX-2 augmente lors de la douleur, de la fièvre et de l’inflammation.",
      ),
      qroc(
        "Quelle durée maximale respecter avec le kétorolac ?",
        "5 jours|Cinq jours",
        ["b00022"],
        "La toxicité rénale impose de limiter strictement la durée du kétorolac.",
      ),
      qroc(
        "Quelle dose IV de kétorolac utiliser après 65 ans ?",
        "15 mg quatre fois par jour|15 mg IV x 4/j",
        ["b00022"],
        "La dose réduite s’applique aussi lorsque le poids est inférieur à 50 kg.",
      ),
      qroc(
        "Quel risque cardiovasculaire est augmenté par les coxibs ?",
        "Thrombose|Événement thrombotique",
        ["b00014"],
        "Le déséquilibre entre thromboxane et prostacycline favorise les thromboses.",
      ),
    ],
  },
  {
    title: "Morphiniques usuels",
    questions: [
      qroc(
        "Quel intervalle sépare deux bolus de morphine lors d’une titration en SSPI ?",
        "5 minutes|Cinq minutes",
        ["b00035"],
        "Cet intervalle permet de juger l’effet avant une nouvelle injection.",
      ),
      qroc(
        "Quelle fraction de codéine est approximativement transformée en morphine ?",
        "10 %|Environ dix pour cent",
        ["b00037"],
        "La conversion CYP2D6 produit le métabolite responsable de l’essentiel de l’analgésie.",
      ),
      qroc(
        "Quelle est la puissance orale approximative de l’oxycodone par rapport à la morphine ?",
        "Deux fois|2 fois",
        ["b00039"],
        "Sa biodisponibilité explique une puissance orale proche du double.",
      ),
      qroc(
        "Quel métabolite de l’hydromorphone est pharmacologiquement inactif ?",
        "Hydromorphone-3-glucuronide|H3G",
        ["b00041"],
        "Le principal glucuronide n’apporte pas d’effet antalgique.",
      ),
      qroc(
        "Au-delà de quelle dose quotidienne de méthadone le QT devient-il particulièrement préoccupant ?",
        "80 mg/j|Plus de 80 mg par jour",
        ["b00043"],
        "Les doses supérieures à 80 mg/j sont associées à un QT prolongé.",
      ),
    ],
  },
  {
    title: "Opioïdes d’anesthésie",
    questions: [
      qroc(
        "Combien de fois le fentanyl est-il environ plus puissant que la morphine ?",
        "100 fois|Cent fois",
        ["b00047"],
        "La grande puissance explique l’utilisation de doses exprimées en microgrammes.",
      ),
      qroc(
        "Quel traitement lève rapidement une rigidité thoracique majeure liée au fentanyl ?",
        "Curare|Bloqueur neuromusculaire",
        ["b00048"],
        "Le bloc neuromusculaire relâche la paroi et permet la ventilation.",
      ),
      qroc(
        "Quel délai d’équilibre cérébral caractérise approximativement le sufentanil ?",
        "6 minutes|Six minutes",
        ["b00051"],
        "L’équilibre rapide contribue à son emploi en perfusion anesthésique.",
      ),
      qroc(
        "Quelle demi-vie contextuelle caractérise le rémifentanil ?",
        "Environ 4 minutes|Quatre minutes",
        ["b00053"],
        "Elle reste très courte, même après une perfusion prolongée.",
      ),
      qroc(
        "Quel risque douloureux peut suivre une forte exposition au rémifentanil ?",
        "Hyperalgésie aiguë|Hyperalgésie induite par les opioïdes",
        ["b00053"],
        "Les doses élevées favorisent une sensibilisation nécessitant un relais multimodal.",
      ),
    ],
  },
  {
    title: "Opioïdes atypiques",
    questions: [
      qroc(
        "Quel métabolite neurotoxique limite l’emploi de la mépéridine ?",
        "Normépéridine",
        ["b00045"],
        "Son accumulation, surtout rénale, peut provoquer agitation et convulsions.",
      ),
      qroc(
        "Quelle indication particulière persiste pour la mépéridine ?",
        "Frisson postopératoire|Traitement du frisson postopératoire",
        ["b00045"],
        "Une faible dose peut supprimer efficacement ce symptôme.",
      ),
      qroc(
        "Quel opioïde agoniste-antagoniste possède un effet plafond vers 30 mg ?",
        "Nalbuphine",
        ["b00056"],
        "L’analgésie et la dépression respiratoire plafonnent au-delà de cette dose.",
      ),
      qroc(
        "Quelle voie d’élimination rend la buprénorphine intéressante en insuffisance rénale ?",
        "Voie biliaire|Élimination biliaire",
        ["b00059"],
        "Son élimination majoritairement biliaire limite la dépendance au rein.",
      ),
      qroc(
        "Quel médiateur de recapture est surtout ciblé par le tapentadol ?",
        "Noradrénaline",
        ["b00064"],
        "Le tapentadol associe agonisme mu et inhibition surtout noradrénergique.",
      ),
    ],
  },
  {
    title: "Antagonisation",
    questions: [
      qroc(
        "Quelle dose initiale de naloxone permet une microtitration ?",
        "0,5 à 1 µg/kg|0.5–1 microgramme par kilogramme",
        ["b00066"],
        "Cette faible dose cherche à restaurer la ventilation sans abolir toute analgésie.",
      ),
      qroc(
        "Quel est le délai du pic d’effet de la naloxone ?",
        "1 à 2 minutes|Une à deux minutes",
        ["b00066"],
        "La réponse respiratoire doit être réévaluée rapidement après chaque palier.",
      ),
      qroc(
        "Combien de temps dure généralement l’effet de la naloxone ?",
        "30 à 45 minutes|Trente à quarante-cinq minutes",
        ["b00066"],
        "Cette brièveté explique la possibilité d’une renarcotisation.",
      ),
      qroc(
        "Quel antagoniste périphérique traite l’iléus postopératoire sans annuler l’analgésie centrale ?",
        "Alvimopan",
        ["b00067"],
        "L’alvimopan bloque les récepteurs digestifs et franchit peu la barrière hématoencéphalique.",
      ),
      qroc(
        "Quel antagoniste périphérique est utilisé dans la constipation liée aux opioïdes ?",
        "Méthylnaltrexone",
        ["b00068"],
        "Son action périphérique restaure le transit en préservant l’analgésie centrale.",
      ),
    ],
  },
  {
    title: "Coanalgésiques",
    questions: [
      qroc(
        "Quel récepteur est antagonisé par la kétamine ?",
        "Récepteur NMDA|NMDA",
        ["b00070"],
        "Le blocage NMDA diminue la sensibilisation centrale et l’hyperalgésie.",
      ),
      qroc(
        "Quel anesthésique local IV peut réduire l’iléus et la consommation d’opioïdes ?",
        "Lidocaïne",
        ["b00074"],
        "Une perfusion encadrée peut favoriser transit et récupération après chirurgie abdominale.",
      ),
      qroc(
        "Sur quelle sous-unité se fixent gabapentine et prégabaline ?",
        "Sous-unité α2δ|Alpha-2-delta",
        ["b00076"],
        "La cible appartient aux canaux calciques voltage-dépendants présynaptiques.",
      ),
      qroc(
        "Quelle fonction physiologique commande l’adaptation des gabapentinoïdes ?",
        "Fonction rénale|Clairance de créatinine",
        ["b00077", "b00082"],
        "Leur élimination rénale expose à une accumulation en cas d’insuffisance.",
      ),
      qroc(
        "Quel gabapentinoïde a une biodisponibilité orale linéaire ?",
        "Prégabaline",
        ["b00080"],
        "Sa pharmacocinétique plus prévisible la distingue de la gabapentine.",
      ),
    ],
  },
  {
    title: "Douleur neuropathique et cannabinoïdes",
    questions: [
      qroc(
        "Quelle amine secondaire est mieux tolérée que l’amitriptyline chez le sujet âgé ?",
        "Nortriptyline|Désipramine",
        ["b00088"],
        "Les amines secondaires exercent moins d’effets anticholinergiques.",
      ),
      qroc(
        "Quel antidépresseur est contre-indiqué chez un patient épileptique ?",
        "Bupropion",
        ["b00097"],
        "Le bupropion abaisse le seuil convulsif et augmente le risque de crise.",
      ),
      qroc(
        "Quel récepteur cannabinoïde prédomine dans le système nerveux central ?",
        "CB1",
        ["b00103"],
        "L’activation de CB1 explique les effets psychoactifs du THC.",
      ),
      qroc(
        "Quel cannabinoïde n’est pas psychoactif ?",
        "CBD|Cannabidiol",
        ["b00105"],
        "Le CBD ne produit pas l’euphorie liée à l’agonisme central CB1.",
      ),
      qroc(
        "Quelle formulation associe THC et CBD en pulvérisation oromucosale ?",
        "Nabiximols",
        ["b00107"],
        "Le nabiximols fournit une combinaison standardisée des deux cannabinoïdes.",
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

const DP_QROC = [
  {
    title: "Paracétamol chez une patiente dénutrie",
    vignette:
      "Mme Aït Ali, patiente de 83 ans pesant 43 kg, est hospitalisée après une fracture costale. Elle mange très peu depuis plusieurs semaines, reçoit de la warfarine et présente une insuffisance rénale modérée. Une prescription automatique de paracétamol à dose adulte standard apparaît dans son dossier.",
    questions: [
      qroc(
        "Quelle dose quotidienne maximale faut-il programmer ?",
        "2 g/j|Deux grammes par jour",
        ["b00009", "b00115"],
        "Son âge, son poids, la dénutrition, la fonction rénale et la warfarine justifient le plafond réduit.",
      ),
      qroc(
        "Quelle voie faut-il privilégier si la déglutition est possible ?",
        "Voie orale|Administration orale",
        ["b00009"],
        "La voie orale offre une absorption plus fiable que l’administration rectale.",
        "Mme Aït Ali peut avaler et ne vomit pas.",
      ),
      qroc(
        "Quel métabolite explique la toxicité hépatique en cas de surdosage ?",
        "NAPQI|N-acétyl-p-benzoquinone imine",
        ["b00008"],
        "L’épuisement du glutathion laisse le NAPQI léser les hépatocytes.",
        "Une erreur de saisie délivre plusieurs doses supplémentaires pendant la nuit.",
      ),
      qroc(
        "Quelle enzyme produit principalement ce métabolite ?",
        "CYP2E1|Cytochrome P450 2E1",
        ["b00008", "b00114"],
        "Cette voie oxydative minoritaire devient dangereuse lorsque les voies de conjugaison saturent.",
        "Le médecin analyse le mécanisme du surdosage.",
      ),
      qroc(
        "Quel organe doit être évalué en priorité ?",
        "Foie|Fonction hépatique",
        ["b00008", "b00114", "b00115"],
        "La toxicité majeure du NAPQI est une nécrose hépatocellulaire.",
        "La patiente signale des nausées et une douleur de l’hypochondre droit.",
      ),
      qroc(
        "Quel bénéfice justifie de conserver le paracétamol à dose corrigée ?",
        "Épargne opioïde|Réduction des besoins en opioïdes",
        ["b00003", "b00010"],
        "À dose sûre, il contribue à la multimodalité et limite les morphiniques.",
        "Le bilan ne montre pas de cytolyse et l’erreur reste sous le seuil toxique retenu.",
      ),
      qroc(
        "Quelle donnée doit être inscrite dans la transmission ?",
        "Plafond de 2 g/j|Dose maximale de deux grammes par jour",
        ["b00009", "b00010", "b00115"],
        "La traçabilité évite le retour à une dose standard inadaptée.",
        "Mme Aït Ali quitte l’unité aiguë avec un plan antalgique écrit.",
      ),
    ],
  },
  {
    title: "Choix d’un anti-inflammatoire à haut risque",
    vignette:
      "M. Kovacs, patient de 66 ans, souffre d’une crise douloureuse inflammatoire après une chirurgie orthopédique. Il a un antécédent d’ulcère hémorragique, une cardiopathie ischémique active et une hypertension mal contrôlée. Sa clairance de créatinine est mesurée à 28 mL/min.",
    questions: [
      qroc(
        "Quelle classe antalgique faut-il écarter ?",
        "AINS|Anti-inflammatoires non stéroïdiens",
        ["b00020", "b00021"],
        "Les risques rénal, digestif et cardiovasculaire se cumulent chez ce patient.",
      ),
      qroc(
        "Quel seuil rénal est franchi ?",
        "Clairance < 30 mL/min|Insuffisance rénale sévère",
        ["b00020"],
        "Une clairance inférieure à 30 mL/min constitue une contre-indication.",
        "Le laboratoire confirme une clairance à 28 mL/min.",
      ),
      qroc(
        "Quel antécédent digestif renforce l’interdiction ?",
        "Ulcère hémorragique|Hémorragie digestive",
        ["b00021"],
        "Un saignement digestif antérieur expose à une récidive grave.",
        "Le dossier retrouve une hospitalisation pour hématémèse deux ans auparavant.",
      ),
      qroc(
        "Quel risque des coxibs demeure malgré leur sélectivité ?",
        "Risque thrombotique|Thrombose cardiovasculaire",
        ["b00014"],
        "L’inhibition sélective de COX-2 déséquilibre prostacycline et thromboxane.",
        "Le chirurgien suggère de remplacer le kétoprofène par un coxib.",
      ),
      qroc(
        "Quel organe reste exposé sous coxib ?",
        "Rein|Fonction rénale",
        ["b00013", "b00016"],
        "COX-2 est constitutive dans le rein, donc la sélectivité ne supprime pas la néphrotoxicité.",
        "Le prescripteur pense que la sélectivité digestive protège aussi la fonction rénale.",
      ),
      qroc(
        "Quel principe de prescription doit remplacer cette escalade ?",
        "Analgésie multimodale individualisée|Association d’antalgiques compatibles",
        ["b00003"],
        "Des mécanismes complémentaires sont choisis selon les contre-indications réelles.",
        "L’équipe renonce aux AINS et recherche une combinaison plus sûre.",
      ),
      qroc(
        "Quelle contre-indication doit figurer dans la lettre de sortie ?",
        "AINS contre-indiqués|Contre-indication aux anti-inflammatoires",
        ["b00020", "b00021"],
        "Une mention explicite prévient une réintroduction ambulatoire dangereuse.",
        "La douleur diminue avec une autre stratégie et M. Kovacs prépare sa sortie.",
      ),
    ],
  },
  {
    title: "PCA morphine et renarcotisation",
    vignette:
      "Mme Silva, patiente de 59 ans, utilise une PCA morphine après hystérectomie. Elle devient somnolente après plusieurs demandes rapprochées ; sa fréquence respiratoire chute à 7/min. L’équipe interrompt la pompe, soutient la ventilation et prépare un antagoniste.",
    questions: [
      qroc(
        "Quel antagoniste faut-il administrer ?",
        "Naloxone",
        ["b00066"],
        "La naloxone antagonise rapidement les récepteurs opioïdes responsables de la bradypnée.",
      ),
      qroc(
        "Quelle dose initiale permet une correction titrée ?",
        "0,5 à 1 µg/kg|0.5–1 microgramme par kilogramme",
        ["b00035", "b00066"],
        "La microdose recherche une ventilation correcte sans supprimer toute analgésie.",
        "Mme Silva reste douloureuse malgré sa somnolence.",
      ),
      qroc(
        "Après quel délai faut-il juger le pic d’effet ?",
        "1 à 2 minutes|Une à deux minutes",
        ["b00024", "b00066"],
        "Le pic rapide permet une réévaluation respiratoire précoce.",
        "Un premier palier est injecté sous monitorage continu.",
      ),
      qroc(
        "Quel intervalle peut séparer deux paliers ?",
        "5 minutes|Cinq minutes",
        ["b00035", "b00066", "b00119"],
        "L’espacement évite une antagonisation cumulative excessive.",
        "La fréquence respiratoire monte à 9/min mais la vigilance reste faible.",
      ),
      qroc(
        "Combien de temps dure généralement l’antagonisme ?",
        "30 à 45 minutes|Trente à quarante-cinq minutes",
        ["b00066", "b00119"],
        "La durée est souvent inférieure à celle de la morphine reçue.",
        "Après une amélioration initiale, la patiente est maintenue en surveillance.",
      ),
      qroc(
        "Quel phénomène explique la nouvelle bradypnée ?",
        "Renarcotisation|Récidive de l’effet opioïde",
        ["b00024", "b00066", "b00119"],
        "La naloxone disparaît alors que l’agoniste morphinique demeure actif.",
        "Quarante minutes plus tard, Mme Silva redevient somnolente et respire à 8/min.",
      ),
      qroc(
        "Quel mode d’administration devient alors pertinent ?",
        "Perfusion continue de naloxone|Naloxone en perfusion",
        ["b00035", "b00066"],
        "Une perfusion titrée maintient l’antagonisme pendant la persistance de l’opioïde.",
        "Un nouveau bolus corrige la ventilation mais une seconde récidive est redoutée.",
      ),
    ],
  },
  {
    title: "Buprénorphine et insuffisance rénale terminale",
    vignette:
      "M. Chen, patient de 64 ans dialysé, souffre d’une douleur chronique sévère et reçoit de la buprénorphine transdermique. Il est opéré d’une fistule vasculaire. Au réveil, il reste très somnolent après l’ajout non anticipé d’un autre opioïde par voie intraveineuse.",
    questions: [
      qroc(
        "Quelle voie d’élimination caractérise la buprénorphine ?",
        "Voie biliaire|Élimination biliaire",
        ["b00059"],
        "Cette élimination explique son intérêt relatif en insuffisance rénale avancée.",
      ),
      qroc(
        "Quel type d’activité exerce-t-elle sur le récepteur mu ?",
        "Agoniste partiel|Agonisme partiel mu",
        ["b00058"],
        "Son activité partielle s’accompagne d’une très forte affinité pour le récepteur.",
        "Le dossier confirme un timbre de buprénorphine actif depuis la veille.",
      ),
      qroc(
        "Quelle durée d’action approximative faut-il anticiper ?",
        "12 heures|Environ douze heures",
        ["b00058"],
        "La persistance de l’effet impose une surveillance prolongée.",
        "La dernière administration sublinguale remonte à quatre heures.",
      ),
      qroc(
        "Pourquoi la naloxone peut-elle corriger difficilement le tableau ?",
        "Forte affinité de la buprénorphine pour le récepteur mu|Affinité mu élevée",
        ["b00058"],
        "L’antagoniste déplace difficilement une molécule fortement liée au récepteur.",
        "Une première microdose de naloxone améliore peu la vigilance.",
      ),
      qroc(
        "Quel support reste prioritaire devant une hypoventilation ?",
        "Ventilation assistée|Assistance ventilatoire",
        ["b00058", "b00066"],
        "La sécurité respiratoire ne doit pas attendre une antagonisation pharmacologique incertaine.",
        "La fréquence respiratoire tombe à 6/min malgré l’oxygène.",
      ),
      qroc(
        "Quel risque résulte de l’ajout d’un second opioïde ?",
        "Dépression respiratoire additive|Sédation opioïde cumulative",
        ["b00024", "b00058"],
        "Les effets centraux peuvent se cumuler malgré l’agonisme partiel de fond.",
        "La feuille d’anesthésie révèle plusieurs bolus d’agoniste mu puissant.",
      ),
      qroc(
        "Quelle information doit être signalée pour les soins futurs ?",
        "Traitement chronique par buprénorphine|Timbre de buprénorphine actif",
        ["b00058", "b00059"],
        "La connaissance du traitement évite une superposition opioïde non planifiée.",
        "M. Chen récupère une ventilation stable après surveillance prolongée.",
      ),
    ],
  },
  {
    title: "Kétamine et réaction d’émergence",
    vignette:
      "Mme Meunier, patiente de 29 ans, reçoit une faible perfusion de kétamine comme coanalgésique pendant une chirurgie douloureuse. Elle n’a pas reçu de dose excessive d’opioïde. Au réveil, elle décrit des images effrayantes, devient agitée et présente une tachycardie modérée.",
    questions: [
      qroc(
        "Quel récepteur explique l’effet antalgique principal de la kétamine ?",
        "Récepteur NMDA|NMDA",
        ["b00070"],
        "L’antagonisme NMDA diminue sensibilisation centrale et hyperalgésie.",
      ),
      qroc(
        "Quel effet neuropsychique décrit le mieux ce réveil ?",
        "Réaction d’émergence|Effet psychotomimétique",
        ["b00070", "b00071"],
        "Hallucinations et agitation au réveil caractérisent cette complication.",
        "Mme Meunier rapporte des hallucinations visuelles très réalistes.",
      ),
      qroc(
        "Quel mécanisme explique la tachycardie associée ?",
        "Stimulation sympathique|Activation sympathoadrénergique",
        ["b00071"],
        "La kétamine augmente l’activité sympathique et peut élever fréquence et pression.",
        "La pression artérielle s’élève parallèlement sans signe hémorragique.",
      ),
      qroc(
        "Quel autre effet sécrétoire faut-il surveiller ?",
        "Hypersalivation|Augmentation des sécrétions salivaires",
        ["b00071"],
        "La kétamine peut augmenter les sécrétions et gêner la gestion des voies aériennes.",
        "Une salivation abondante apparaît pendant la surveillance.",
      ),
      qroc(
        "Quel bénéfice respiratoire distingue la faible dose de kétamine des opioïdes ?",
        "Absence de dépression respiratoire significative|Préservation de la ventilation",
        ["b00069", "b00072"],
        "L’analgésie subanesthésique ne supprime pas la commande ventilatoire comme un agoniste mu.",
        "La patiente maintient une fréquence respiratoire et une saturation normales.",
      ),
      qroc(
        "Quel objectif justifiait son emploi pendant la chirurgie ?",
        "Épargne opioïde|Réduction des besoins morphiniques",
        ["b00072"],
        "Son mécanisme complémentaire permet de diminuer la consommation d’opioïdes.",
        "La feuille montre une consommation morphinique inférieure au schéma habituel.",
      ),
      qroc(
        "Quelle donnée doit guider une exposition ultérieure ?",
        "Antécédent de réaction d’émergence|Hallucinations sous kétamine",
        ["b00070", "b00071"],
        "La traçabilité permet une décision individualisée et une prévention adaptée.",
        "Les hallucinations régressent et Mme Meunier retrouve une orientation normale.",
      ),
    ],
  },
  {
    title: "Prégabaline chez un patient insuffisant rénal",
    vignette:
      "M. Okafor, patient de 73 ans avec neuropathie diabétique, commence une prégabaline. Sa clairance de créatinine est à 22 mL/min, mais la dose prescrite correspond à une fonction rénale normale. Après quelques jours, il marche difficilement et dort une grande partie de la journée.",
    questions: [
      qroc(
        "Quelle cible moléculaire est liée par la prégabaline ?",
        "Sous-unité α2δ des canaux calciques|Sous-unité alpha-2-delta",
        ["b00076"],
        "Cette liaison réduit la libération présynaptique de médiateurs excitateurs.",
      ),
      qroc(
        "Quelle fonction impose ici une réduction de dose ?",
        "Fonction rénale|Clairance de créatinine",
        ["b00077", "b00082"],
        "La prégabaline est éliminée par le rein et s’accumule lorsque la clairance baisse.",
        "Le pharmacien relève une clairance à 22 mL/min.",
      ),
      qroc(
        "Quel effet indésirable explique la marche instable ?",
        "Ataxie|Trouble de la coordination",
        ["b00076", "b00077"],
        "L’ataxie est un effet neurologique dose-dépendant des gabapentinoïdes.",
        "L’examen montre une démarche ébrieuse sans déficit moteur focal.",
      ),
      qroc(
        "Quel effet explique le sommeil diurne prolongé ?",
        "Somnolence|Sédation",
        ["b00077", "b00080", "b00082"],
        "L’accumulation augmente la baisse de vigilance et le risque de chute.",
        "La famille décrit des endormissements répétés pendant les repas.",
      ),
      qroc(
        "Quel trouble visuel faut-il rechercher ?",
        "Diplopie|Vision embrouillée",
        ["b00076", "b00082"],
        "Les perturbations visuelles peuvent accompagner une exposition excessive.",
        "M. Okafor signale que les objets lui paraissent parfois doubles.",
      ),
      qroc(
        "Quelle adaptation immédiate est nécessaire ?",
        "Réduire ou suspendre la prégabaline|Diminution de dose",
        ["b00077", "b00080"],
        "La toxicité neurologique sous insuffisance rénale impose une correction rapide du schéma.",
        "Les symptômes compromettent désormais ses déplacements à domicile.",
      ),
      qroc(
        "Quel principe doit guider une éventuelle reprise ?",
        "Titration lente adaptée à la clairance|Dose rénale progressive",
        ["b00076", "b00077", "b00082"],
        "Une faible dose réévaluée limite le retour de l’accumulation neurologique.",
        "Les symptômes régressent après interruption et une reprise est discutée.",
      ),
    ],
  },
  {
    title: "Tricyclique et charge anticholinergique",
    vignette:
      "Mme Bernard, patiente de 78 ans présentant des douleurs neuropathiques, reçoit de l’amitriptyline. Elle a un glaucome, une constipation chronique et des difficultés mictionnelles. Après augmentation de dose, sa famille observe une confusion, une bouche sèche et une instabilité au lever.",
    questions: [
      qroc(
        "Quel mécanisme antalgique central est recherché avec l’amitriptyline ?",
        "Inhibition de la recapture de sérotonine et noradrénaline|Renforcement des voies descendantes monoaminergiques",
        ["b00085", "b00086"],
        "L’augmentation des monoamines spinales renforce le contrôle descendant de la douleur.",
      ),
      qroc(
        "Quel type d’effet explique bouche sèche et constipation ?",
        "Effet anticholinergique|Blocage muscarinique",
        ["b00088", "b00095"],
        "Le bloc muscarinique réduit les sécrétions et ralentit le transit.",
        "Mme Bernard décrit une xérostomie majeure et quatre jours sans selle.",
      ),
      qroc(
        "Quel terrain oculaire aggrave le risque de ce traitement ?",
        "Glaucome",
        ["b00093", "b00095"],
        "L’activité anticholinergique peut décompenser un glaucome prédisposé.",
        "Le dossier ophtalmologique confirme un glaucome traité.",
      ),
      qroc(
        "Quel effet explique l’instabilité au lever ?",
        "Hypotension orthostatique|Effet anti-alpha-1",
        ["b00099"],
        "Le blocage α1 altère la vasoconstriction réflexe lors du passage debout.",
        "La pression systolique chute nettement lors de l’orthostatisme.",
      ),
      qroc(
        "Quelle amine secondaire pourrait être mieux tolérée ?",
        "Nortriptyline|Désipramine",
        ["b00088"],
        "Les amines secondaires ont une activité anticholinergique moins marquée.",
        "La douleur reste gênante mais l’amitriptyline doit être arrêtée.",
      ),
      qroc(
        "Quel risque urinaire faut-il rechercher ?",
        "Rétention urinaire",
        ["b00093", "b00095", "b00097"],
        "Le bloc muscarinique peut aggraver les difficultés de vidange vésicale.",
        "Mme Bernard ne parvient plus à uriner depuis plusieurs heures.",
      ),
      qroc(
        "Quel critère impose ici une révision complète du traitement ?",
        "Confusion aiguë|Syndrome confusionnel",
        ["b00088", "b00095", "b00097"],
        "La toxicité cognitive compromet la sécurité et dépasse le bénéfice antalgique attendu.",
        "La famille confirme que l’état cognitif était normal avant l’augmentation de dose.",
      ),
    ],
  },
  {
    title: "Cannabinoïdes et douleur chronique",
    vignette:
      "M. Rossi, patient de 55 ans atteint de sclérose en plaques, demande un traitement cannabinoïde pour des douleurs chroniques avec spasticité. Il a déjà présenté des épisodes anxieux et doit conduire quotidiennement. Il souhaite comparer un spray THC-CBD à une huile de composition incertaine.",
    questions: [
      qroc(
        "Quel produit pharmaceutique associe THC et CBD ?",
        "Nabiximols",
        ["b00107"],
        "Le nabiximols est une préparation oromucosale standardisée combinant les deux cannabinoïdes.",
      ),
      qroc(
        "Quel cannabinoïde est principalement psychoactif ?",
        "THC|Tétrahydrocannabinol",
        ["b00103", "b00104"],
        "L’agonisme central CB1 du THC altère cognition et perception.",
        "M. Rossi craint particulièrement un effet euphorisant ou anxiogène.",
      ),
      qroc(
        "Quel cannabinoïde n’active pas directement CB1 ?",
        "CBD|Cannabidiol",
        ["b00105"],
        "Le CBD n’est pas psychoactif et agit par d’autres cibles pharmacologiques.",
        "L’huile présentée est annoncée riche en CBD mais sans dosage certifié.",
      ),
      qroc(
        "Quel effet cognitif doit être discuté pour la conduite ?",
        "Altération de la mémoire et de l’attention|Troubles cognitifs",
        ["b00111"],
        "Les effets centraux du THC peuvent rendre la conduite dangereuse.",
        "Le patient doit reprendre des trajets professionnels quotidiens.",
      ),
      qroc(
        "Quel effet cardiovasculaire peut survenir ?",
        "Tachycardie|Hypotension orthostatique",
        ["b00111"],
        "Les cannabinoïdes peuvent accélérer le rythme ou perturber l’adaptation tensionnelle.",
        "M. Rossi rapporte des palpitations après un essai ancien de cannabis.",
      ),
      qroc(
        "Quel cadre douloureux possède davantage de données que la douleur postopératoire aiguë ?",
        "Douleur chronique réfractaire|Douleur neuropathique chronique",
        ["b00111", "b00112"],
        "Les cannabinoïdes ont surtout été évalués dans certaines douleurs chroniques.",
        "Le spécialiste confirme une douleur chronique malgré plusieurs traitements.",
      ),
      qroc(
        "Quelle condition sécurise la comparaison des options ?",
        "Produit standardisé et suivi spécialisé|Composition connue avec surveillance",
        ["b00107", "b00111"],
        "Une composition mesurable et un suivi des effets facilitent une décision bénéfice-risque.",
        "Le patient accepte une évaluation spécialisée avant toute initiation.",
      ),
    ],
  },
];

function buildDpQroc() {
  return DP_QROC.map((entry, index) => ({
    label: `DP QROC ${index + 1} · ${entry.title}`,
    vignette: entry.vignette,
    allowed_voies: ["externe"],
    questions: entry.questions,
  }));
}

function validateSourceBlocks(extract, fiche, flashcards, series) {
  const valid = new Set((extract.blocs || []).map((block) => block.id));
  const refs = [
    ...fiche.sourceBlocks,
    ...flashcards.flatMap((entry) => entry.sourceBlocks),
    ...series.flatMap((entry) =>
      entry.questions.flatMap((question) => question.sourceBlocks),
    ),
  ];
  const invalid = [...new Set(refs.filter((id) => !valid.has(id)))];
  if (invalid.length)
    throw new Error(`Blocs sources inconnus : ${invalid.join(", ")}`);
}

export function buildChapter17(extract) {
  const fiche = buildFiche();
  const flashcards = buildFlashcards();
  const series = [
    ...buildIsolatedQcm(),
    ...buildDpQcm(),
    ...buildIsolatedQroc(),
    ...buildDpQroc(),
  ];
  validateSourceBlocks(extract, fiche, flashcards, series);
  const result = { fiche, flashcards, series };
  return result;
}

export default buildChapter17;
