// Chapitre 16 - Les bloqueurs de la jonction neuromusculaire.
// Module éditorial autonome, fondé exclusivement sur extract.json.

const src = (...ids) => ids;
const n2 = (text, ...children) => ({ text, children });
const row = (concept, bullets, sourceBlocks, image) => ({
  concept,
  bullets,
  sourceBlocks,
  ...(image ? { image } : {}),
});
const fullImage = (path, caption, sourceCaption) => ({
  path,
  position: "after",
  size: "large",
  layout: "full_width",
  containsText: true,
  caption,
  sourceCaption,
});

const IMAGES = {
  unit: fullImage(
    "img/img_001.png",
    "Un motoneurone coordonne plusieurs fibres au sein d’une unité motrice",
    "FIGURE 16.1 Représentation schématique de l'unité motrice constituée de l'ensemble neurone moteur et fibres musculaires qui lui sont rattachées",
  ),
  junction: fullImage(
    "img/img_002.png",
    "De l’exocytose d’acétylcholine au potentiel d’action musculaire",
    "FIGURE 16.2 Représentation schématique de la jonction neuromusculaire",
  ),
  receptor: fullImage(
    "img/img_003.png",
    "Récepteur nicotinique musculaire : deux sites α commandent un canal ionique",
    "FIGURE 16.3 Représentation schématique d’un récepteur postsynaptique à l’acétylcholine (vue supérieure en haut et en coupe longitudinale en bas)",
  ),
  metabolism: fullImage(
    "img/img_004.png",
    "Voies d’élimination comparées des principaux curares",
    "TABLEAU 16.1 Principales voies métaboliques des curares mentionnées par ordre d'ancienneté",
  ),
  dynamics: fullImage(
    "img/img_005.png",
    "Doses, délais et durées d’action des curares usuels",
    "TABLEAU 16.2 Pharmacodynamie comparée des curares mentionnés par ordre d’ancienneté",
  ),
  succContra: fullImage(
    "img/img_006.png",
    "Situations contre-indiquant la succinylcholine",
    "TABLEAU 16.3 Contre-indications à la succinyicholine",
  ),
  indications: fullImage(
    "img/img_007.png",
    "Indications cliniques et agents adaptés",
    "TABLEAU 16.4 Principales indications des curares (suggestions d'agents à utiliser)",
  ),
  choice: fullImage(
    "img/img_008.png",
    "Questions cliniques guidant le choix du curare",
    "TABLEAU 16.5 Critères de choix d’un curare",
  ),
  tof: fullImage(
    "img/img_009.png",
    "Train-de-quatre : compter les réponses et quantifier la fatigue",
    "FIGURE 16.4 Stimulation par train-de-quatre (Td4)",
  ),
  neo: fullImage(
    "img/img_010.png",
    "Néostigmine : attendre quatre réponses avant la décurarisation",
    "FIGURE 16.5 Algorithme 1: mode opératoire de la décurarisation avec la néostigmine utilisable avec l’atracurium ou le cisatracurium (benzylisoquinoline) ou le rocuronium (stéroïde)",
  ),
  sug: fullImage(
    "img/img_011.png",
    "Sugammadex : adapter la dose à la profondeur du bloc au rocuronium",
    "FIGURE 16.6 Algorithme 2: mode opératoire de la décurarisation avec le sugammadex utilisable uniquement avec le rocuronium",
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Sécuriser l’emploi d’un curare et comprendre sa cible",
      sections: [
        {
          title:
            "Une paralysie périphérique qui ne remplace jamais l’anesthésie",
          rows: [
            row(
              "Place dans l’anesthésie balancée",
              [
                n2(
                  "Dissocier trois objectifs pharmacologiques",
                  "L’hypnotique produit la perte de conscience.",
                  "Le morphinique assure l’analgésie.",
                  "Le curare procure immobilité et relâchement musculaire.",
                ),
                "La dose de chaque composante est ajustée entre induction, entretien et réveil.",
              ],
              src("b00003"),
            ),
            row(
              "Prérequis de sécurité",
              [
                n2(
                  "Avant toute injection, garantir trois protections",
                  "Une sédation adaptée prévient une paralysie consciente.",
                  "Un dispositif de contrôle des voies aériennes doit être immédiatement disponible.",
                  "Une ventilation assistée compense la paralysie des muscles respiratoires.",
                ),
              ],
              src("b00003", "b00104", "b00106", "b00107"),
            ),
            row(
              "Indications fonctionnelles",
              [
                "Les curares facilitent la ventilation au masque, l’intubation trachéale et l’immobilité opératoire.",
                "En réanimation, ils peuvent faciliter la ventilation mécanique d’une hypoxémie réfractaire, notamment au cours d’un SDRA.",
              ],
              src("b00003", "b00108"),
              IMAGES.indications,
            ),
          ],
        },
        {
          title: "De l’unité motrice à la dépolarisation musculaire",
          renderChunks: [3, 3],
          rows: [
            row(
              "Unité motrice",
              [
                "Un motoneurone de la corne antérieure commande plusieurs fibres musculaires par les branches de son axone.",
                "La fréquence des potentiels d’action coordonne la contraction de toutes les fibres rattachées.",
              ],
              src("b00005"),
              IMAGES.unit,
            ),
            row(
              "Plaque motrice spécialisée",
              [
                "La terminaison nerveuse non myélinisée fait face aux plis sous-synaptiques de la fibre musculaire.",
                n2(
                  "Organiser les protéines selon leur fonction",
                  "Les récepteurs nicotiniques se concentrent sur les crêtes.",
                  "Les canaux sodiques occupent le fond des plis.",
                  "L’acétylcholinestérase abonde dans la lame basale.",
                ),
              ],
              src("b00008", "b00013", "b00014", "b00015", "b00016"),
              IMAGES.junction,
            ),
            row(
              "Libération synchrone",
              [
                n2(
                  "Transformer l’influx nerveux en signal chimique",
                  "La dépolarisation ouvre localement les canaux calciques présynaptiques.",
                  "Le calcium déclenche la fusion des vésicules et l’exocytose d’acétylcholine.",
                  "L’acétylcholine atteint simultanément de nombreux récepteurs postsynaptiques.",
                ),
              ],
              src("b00009", "b00014"),
            ),
            row(
              "Récepteur nicotinique musculaire",
              [
                "Le récepteur comporte cinq sous-unités, dont deux sous-unités α portant les sites de liaison.",
                n2(
                  "Exiger deux molécules d’acétylcholine",
                  "La double occupation modifie la conformation du récepteur.",
                  "Le canal laisse diffuser sodium et potassium.",
                  "La dépolarisation locale ouvre les canaux sodiques et propage le potentiel musculaire.",
                ),
              ],
              src("b00010", "b00017"),
              IMAGES.receptor,
            ),
            row(
              "Extinction du signal",
              [
                "L’acétylcholinestérase hydrolyse l’acétylcholine en quelques millisecondes.",
                "La baisse rapide de concentration libère les récepteurs et rend possible une nouvelle transmission.",
              ],
              src("b00009", "b00014", "b00015", "b00016"),
            ),
          ],
        },
      ],
    },
    {
      title: "Maîtriser le bloc dépolarisant par succinylcholine",
      sections: [
        {
          title: "Un agoniste prolongé au profil cinétique unique",
          rows: [
            row(
              "Trois leviers pharmacologiques",
              [
                "La succinylcholine active puis désensibilise le récepteur nicotinique.",
                "Les curares non dépolarisants empêchent compétitivement l’ouverture du canal.",
                "La néostigmine augmente l’acétylcholine en inhibant transitoirement son hydrolyse.",
              ],
              src("b00020", "b00021", "b00022", "b00023", "b00024", "b00025"),
            ),
            row(
              "Mécanisme",
              [
                "La succinylcholine réunit deux molécules d’acétylcholine et active le récepteur nicotinique.",
                "Non hydrolysée par l’acétylcholinestérase, elle maintient la dépolarisation puis désensibilise la fibre.",
              ],
              src("b00038"),
            ),
            row(
              "Élimination plasmatique",
              [
                "La butyrylcholinestérase hépatique circulante hydrolyse la succinylcholine en quelques minutes.",
                "Une anomalie quantitative ou qualitative peut prolonger le bloc pendant plusieurs heures.",
              ],
              src("b00038", "b00045"),
              IMAGES.metabolism,
            ),
            row(
              "Cinétique clinique",
              [
                "Le délai d’action est inférieur ou voisin d’une minute ; la durée utile est d’environ 5 à 15 minutes.",
                "Cette association rapidité-profondeur-brièveté explique sa place en induction en séquence rapide.",
              ],
              src("b00038", "b00110"),
              IMAGES.dynamics,
            ),
            row(
              "Signature du bloc de phase I",
              [
                n2(
                  "Reconnaître cinq caractères",
                  "Fasciculations à l’installation.",
                  "Diminution de la réponse isolée sans fatigue au train-de-quatre ni au tétanos.",
                  "Absence de facilitation post-tétanique.",
                  "Majoration par les inhibiteurs de l’acétylcholinestérase.",
                ),
              ],
              src("b00039", "b00040", "b00041", "b00042", "b00043"),
            ),
          ],
        },
        {
          title: "Indiquer vite, exclure méthodiquement",
          rows: [
            row(
              "Usages privilégiés",
              [
                n2(
                  "Relier la cinétique aux indications urgentes",
                  "La dose adulte habituelle est de 1 mg/kg de masse réelle pour faciliter l’intubation.",
                  "Les autres situations comprennent électroconvulsivothérapie, laryngospasme et mauvaise tolérance prévisible à l’apnée.",
                ),
              ],
              src("b00049"),
            ),
            row(
              "Précurarisation",
              [
                "Une très faible dose préalable de rocuronium peut réduire fasciculations et myalgies.",
                "L’antagonisme compétitif impose alors d’augmenter la succinylcholine à 1,5-2 mg/kg.",
              ],
              src("b00049"),
            ),
            row(
              "Hyperkaliémie dangereuse",
              [
                "Chez un sujet sain, la kaliémie augmente habituellement de 0,5 à 1,0 mEq/L.",
                n2(
                  "Repérer les terrains à prolifération extrajonctionnelle",
                  "Dénervation chronique.",
                  "Brûlure étendue ou profonde après 48 heures.",
                  "Traumatisme grave avec rhabdomyolyse ou acidose.",
                ),
              ],
              src("b00044", "b00046", "b00048"),
              IMAGES.succContra,
            ),
            row(
              "Muscle et température",
              [
                "Fasciculations immédiates et myalgies à 24-48 heures sont liées à l’excitation initiale.",
                "Les myopathies exposent à une rigidité ; l’association à un halogéné peut aggraver une hyperthermie maligne.",
              ],
              src("b00044", "b00046", "b00048"),
            ),
            row(
              "Cœur et cholinestérase",
              [
                "Une bradycardie parasympathomimétique, fréquente chez le nourrisson, peut être prévenue ou traitée par atropine.",
                "Une mutation autosomique récessive de BCHE doit être évoquée devant une apnée prolongée familiale ; le traitement reste ventilation et sédation.",
              ],
              src("b00045", "b00048"),
            ),
          ],
        },
      ],
    },
    {
      title: "Choisir et utiliser un curare non dépolarisant",
      sections: [
        {
          title: "Antagonisme compétitif et marge de sécurité",
          rows: [
            row(
              "Récepteur maintenu fermé",
              [
                "Une seule sous-unité α occupée par l’antagoniste suffit à empêcher l’ouverture du canal.",
                "La compétition dépend des affinités et des concentrations respectives d’acétylcholine et de curare.",
              ],
              src("b00054"),
            ),
            row(
              "Réserve de récepteurs",
              [
                "Le bloc devient cliniquement détectable vers 75 % d’occupation et complet vers 92 %.",
                "Le diaphragme récupère avant les muscles pharyngés : respirer ne garantit donc pas la protection des voies aériennes.",
              ],
              src("b00054"),
            ),
            row(
              "Signature du bloc compétitif",
              [
                n2(
                  "Identifier le profil non dépolarisant",
                  "Pas de fasciculation.",
                  "Fatigue au train-de-quatre et au tétanos.",
                  "Facilitation post-tétanique.",
                  "Décurarisation possible par un inhibiteur de l’acétylcholinestérase.",
                ),
              ],
              src(
                "b00055",
                "b00056",
                "b00057",
                "b00058",
                "b00059",
                "b00060",
                "b00061",
              ),
            ),
          ],
        },
        {
          title: "Comparer familles, cinétique et terrains",
          renderChunks: [3, 3],
          rows: [
            row(
              "Deux familles",
              [
                "Atracurium et cisatracurium sont des benzylisoquinolines ; le rocuronium est un aminostéroïde.",
                "Tous ont une durée intermédiaire, mais le rocuronium possède le délai le plus court.",
              ],
              src("b00062", "b00065"),
              IMAGES.choice,
            ),
            row(
              "Dose, puissance et délai",
              [
                "Augmenter la dose réduit le délai d’installation mais prolonge la récupération.",
                "À effet égal, un produit puissant est injecté à faible concentration et atteint plus lentement sa cible.",
              ],
              src("b00034", "b00035", "b00075"),
            ),
            row(
              "Distribution hydrosoluble",
              [
                "Le volume de distribution correspond surtout au secteur extracellulaire, environ 0,2-0,4 L/kg.",
                "Il est proportionnellement plus grand chez le nourrisson et diminue avec l’âge.",
              ],
              src("b00067", "b00068", "b00069", "b00070", "b00071", "b00072"),
            ),
            row(
              "Atracurium",
              [
                "La réaction de Hofmann augmente avec la température et le pH ; des estérases plasmatiques non spécifiques participent aussi à l’hydrolyse.",
                "La fonction rénale, hépatique et la butyrylcholinestérase atypique modifient peu sa dégradation.",
              ],
              src("b00073", "b00074"),
            ),
            row(
              "Cisatracurium",
              [
                "Cet isomère puissant suit surtout la voie de Hofmann, libère très peu d’histamine et produit presque pas de laudanosine.",
                "À 0,1 mg/kg, le délai est de 5-7 minutes pour une durée de 30-50 minutes ; il convient à une curarisation prolongée de SDRA.",
              ],
              src("b00075"),
            ),
            row(
              "Rocuronium",
              [
                "Sa redistribution explique une action de 30-45 minutes malgré une demi-vie de 60-120 minutes.",
                "L’insuffisance rénale et les administrations répétées prolongent l’effet ; l’excrétion biliaire se fait sans métabolite actif identifié.",
                "En séquence rapide si la succinylcholine est contre-indiquée : 0,9-1,2 mg/kg de masse idéale.",
              ],
              src("b00076", "b00077", "b00078", "b00079"),
            ),
          ],
        },
        {
          title: "Prévenir les effets indésirables",
          rows: [
            row(
              "Histaminolibération",
              [
                "L’atracurium peut provoquer rougeur, œdème, tachycardie et hypotension, surtout si dose et vitesse d’injection augmentent.",
                "Le mécanisme non immunologique est reproductible et dose-dépendant ; le cisatracurium en est presque dépourvu.",
              ],
              src("b00080"),
            ),
            row(
              "Allergie vraie",
              [
                "Tout curare peut déclencher une réaction IgE-dépendante, sans relation simple avec la dose.",
                "Une sensibilisation préalable ou croisée distingue l’anaphylaxie de l’histaminolibération pharmacologique.",
              ],
              src("b00080", "b00081", "b00082", "b00083", "b00112"),
            ),
            row(
              "Choix contextualisé",
              [
                n2(
                  "Interroger successivement la situation",
                  "Estomac plein et urgence d’intubation.",
                  "Durée prévue et profondeur chirurgicale recherchée.",
                  "Fonctions rénale et hépatique, âge, terrain neuromusculaire et allergique.",
                ),
              ],
              src("b00063", "b00065"),
            ),
          ],
        },
      ],
    },
    {
      title: "Piloter la curarisation par monitorage objectif",
      sections: [
        {
          title: "Stimuler le nerf, mesurer la réponse du muscle",
          rows: [
            row(
              "Site de référence",
              [
                n2(
                  "Construire une mesure reproductible au pouce",
                  "La stimulation du nerf ulnaire au poignet fait contracter l’adducteur du pouce.",
                  "La réponse doit être mesurée avant curarisation puis suivie dans le temps avec un dispositif objectif.",
                ),
              ],
              src("b00085", "b00109", "b00112"),
            ),
            row(
              "Train-de-quatre",
              [
                "Quatre stimulations sont délivrées à 2 Hz, donc toutes les 0,5 seconde.",
                "Sans curare, quatre réponses égales apparaissent ; sous bloc non dépolarisant, l’amplitude décroît de T1 à T4.",
              ],
              src("b00085", "b00088", "b00089", "b00090"),
              IMAGES.tof,
            ),
            row(
              "Compter puis quantifier",
              [
                n2(
                  "Adapter l’indicateur à la profondeur",
                  "De zéro à quatre réponses, le nombre de contractions estime le bloc.",
                  "Quand quatre réponses existent, le rapport T4/T1 quantifie la fatigue.",
                  "Un rapport inférieur à 0,9 définit une curarisation résiduelle.",
                ),
              ],
              src("b00088", "b00089", "b00090", "b00112", "b00113"),
            ),
            row(
              "Objectif chirurgical",
              [
                "Une à trois réponses conviennent à la plupart des chirurgies ; un bloc plus profond peut être requis selon le geste.",
                "La dose de curare est réadministrée en fonction de l’objectif et non d’un intervalle fixe.",
              ],
              src("b00090", "b00109"),
            ),
          ],
        },
        {
          title: "Ne pas confondre ventilation et récupération complète",
          rows: [
            row(
              "Récupération séquentielle",
              [
                "T1 réapparaît avant T2, puis T3 et T4 ; la présence de quatre réponses ne prouve pas un rapport supérieur à 0,9.",
                "L’adducteur du pouce documente mieux le risque résiduel que la simple observation clinique.",
              ],
              src("b00090"),
            ),
            row(
              "Fréquence du bloc résiduel",
              [
                "Un rapport T4/T1 inférieur à 0,9 concerne environ 40 à 60 % des fins d’intervention sans stratégie rigoureuse.",
                "Le dépistage impose accéléromyographie, électromyographie ou cinémyographie.",
              ],
              src("b00090", "b00112", "b00113"),
            ),
            row(
              "Conséquences respiratoires",
              [
                n2(
                  "Relier faiblesse pharyngée et morbidité",
                  "Obstruction des voies aériennes supérieures et hypoxémie.",
                  "Diminution des réflexes de protection et pneumonie.",
                  "Allongement du séjour en SSPI, atteinte anoxique, voire décès.",
                ),
              ],
              src("b00090", "b00113"),
            ),
            row(
              "Critère d’extubation",
              [
                "Ne lever le support respiratoire qu’après récupération neuromusculaire objective complète.",
                "La décurarisation pharmacologique complète, mais ne remplace jamais, le monitorage.",
              ],
              src("b00103", "b00104", "b00109", "b00115"),
            ),
          ],
        },
      ],
    },
    {
      title: "Décurariser selon le produit et la profondeur du bloc",
      sections: [
        {
          title: "Néostigmine : augmenter l’acétylcholine au bon moment",
          rows: [
            row(
              "Condition préalable",
              [
                n2(
                  "Attendre une récupération spontanée suffisante",
                  "La néostigmine n’est administrée qu’après réapparition de quatre réponses à l’adducteur du pouce.",
                  "En bloc plus profond, il faut maintenir ventilation et sédation jusqu’à une récupération spontanée suffisante.",
                ),
              ],
              src("b00090", "b00092", "b00114"),
              IMAGES.neo,
            ),
            row(
              "Dose et plafond",
              [
                "La dose recommandée est de 0,04-0,05 mg/kg, sans bénéfice à dépasser 40-50 µg/kg.",
                "L’effet plafond empêche de neutraliser de façon fiable un bloc profond.",
              ],
              src("b00092", "b00114"),
            ),
            row(
              "Protection antimuscarinique",
              [
                "L’excès d’acétylcholine stimule aussi les récepteurs muscariniques et expose à bradycardie ou bronchospasme.",
                "Associer atropine 0,01-0,02 mg/kg ou glycopyrrolate 0,005-0,01 mg/kg.",
              ],
              src("b00092", "b00114"),
            ),
          ],
        },
        {
          title: "Sugammadex : encapsuler spécifiquement le rocuronium",
          rows: [
            row(
              "Spécificité moléculaire",
              [
                "Une molécule de sugammadex encapsule une molécule de rocuronium dans un complexe stable.",
                "Le complexe est éliminé inchangé par le rein ; atracurium et cisatracurium ne sont pas concernés.",
              ],
              src("b00093", "b00102"),
            ),
            row(
              "Dose guidée par le monitorage",
              [
                n2(
                  "Faire correspondre profondeur et dose",
                  "Deux réponses au Td4 : 2 mg/kg.",
                  "Une à deux réponses au compte post-tétanique : 4 mg/kg.",
                  "Décurarisation immédiate après rocuronium : 8 à 16 mg/kg.",
                ),
                "Un sous-dosage expose à une recurarisation ; une dose excessive est inutilement coûteuse.",
              ],
              src("b00099", "b00101", "b00102"),
              IMAGES.sug,
            ),
            row(
              "Limite rénale",
              [
                "L’usage n’est pas recommandé en insuffisance rénale terminale.",
                "Le monitorage reste indispensable après injection jusqu’à un rapport T4/T1 au moins égal à 0,9.",
              ],
              src("b00102"),
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
          section.rows.flatMap((item) => item.sourceBlocks),
        ),
      ),
    ),
  ];
  return {
    matiere: "Anesthésie-Réanimation",
    title: "Les bloqueurs de la jonction neuromusculaire",
    year: "2026-2027",
    coverSubtitle:
      "Choisir, monitorer et antagoniser un curare sans exposer le patient à une paralysie résiduelle",
    sourceBlocks,
    parts,
    imageOmissions: [],
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur"],
        rows: [
          ["Bloc non dépolarisant détectable", "≈ 75 % des récepteurs occupés"],
          ["Bloc complet", "≈ 92 % des récepteurs occupés"],
          ["Succinylcholine adulte", "1 mg/kg de masse réelle"],
          ["Hausse usuelle de kaliémie", "0,5 à 1,0 mEq/L"],
          ["Rocuronium en séquence rapide", "0,9 à 1,2 mg/kg de masse idéale"],
          ["Train-de-quatre", "4 stimulations à 2 Hz"],
          ["Récupération complète", "T4/T1 ≥ 0,9"],
          ["Curarisation résiduelle", "40 à 60 % sans stratégie rigoureuse"],
        ],
      },
      tables: [
        {
          title: "Décurarisation pratique",
          headers: ["Situation", "Conduite"],
          rows: [
            [
              "Atracurium, cisatracurium ou rocuronium ; 4 réponses",
              "Néostigmine 0,04-0,05 mg/kg + antimuscarinique",
            ],
            ["Rocuronium ; 2 réponses au Td4", "Sugammadex 2 mg/kg"],
            ["Rocuronium ; 1-2 réponses post-tétaniques", "Sugammadex 4 mg/kg"],
            ["Rocuronium ; décurarisation immédiate", "Sugammadex 8-16 mg/kg"],
          ],
        },
      ],
      keyPoints: [
        "Un curare paralyse sans hypnotiser ni analgésier : sédation, voie aérienne et ventilation sont indissociables.",
        "La succinylcholine agit vite et brièvement, mais ses contre-indications hyperkaliémiques et musculaires doivent être recherchées.",
        "Le rocuronium est l’alternative de séquence rapide lorsque la succinylcholine est contre-indiquée.",
        "Le diaphragme récupère avant le pharynx : la ventilation spontanée ne prouve pas la sécurité de l’extubation.",
        "Le monitorage quantitatif au nerf ulnaire guide entretien, décurarisation et extubation.",
        "Quatre réponses au Td4 autorisent la néostigmine mais ne prouvent pas une récupération complète.",
        "Le sugammadex n’antagonise que le rocuronium et sa dose dépend de la profondeur du bloc.",
        "Un rapport T4/T1 inférieur à 0,9 définit la curarisation résiduelle.",
      ],
      eclair: [
        "Curare = immobilité périphérique ; hypnotique = conscience ; morphinique = analgésie.",
        "Récepteur nicotinique musculaire : deux sites α et un canal cationique.",
        "Succinylcholine : dépolarisation prolongée, fasciculations, pas de fatigue en phase I.",
        "Non dépolarisant : antagonisme compétitif, fatigue au Td4 et facilitation post-tétanique.",
        "Succinylcholine 1 mg/kg réel ; rocuronium séquence rapide 0,9-1,2 mg/kg idéal.",
        "Nerf ulnaire-adducteur du pouce : quatre réponses puis rapport T4/T1.",
        "Néostigmine seulement à quatre réponses, toujours avec antimuscarinique.",
        "Sugammadex : 2, 4 ou 8-16 mg/kg selon la profondeur du bloc au rocuronium.",
      ],
    },
  };
}

const card = (recto, verso, sourceBlocks) => ({
  recto,
  verso,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});
const T = (enonce, justification) => [true, enonce, justification];
const F = (enonce, justification) => [false, enonce, justification];
const qcm = (
  enonce,
  sourceBlocks,
  correction_generale,
  items,
  newInformation,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qcm",
  sourceBlocks,
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
  items: items.map(([is_correct, itemEnonce, justification], index) => ({
    lettre: "ABCDE"[index],
    enonce: itemEnonce,
    is_correct,
    justification,
  })),
});
const qroc = (
  enonce,
  reponse_attendue,
  sourceBlocks,
  correction_generale,
  newInformation,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qroc",
  reponse_attendue,
  sourceBlocks,
  correction_generale,
  items: [],
  ...(newInformation ? { newInformation } : {}),
});

const FLASHCARDS = [
  card(
    "Quels sont les trois piliers de l’anesthésie balancée ?",
    "Hypnose, analgésie et immobilité musculaire.",
    src("b00003"),
  ),
  card(
    "Sur quelle structure périphérique un curare agit-il ?",
    "La jonction neuromusculaire du muscle strié squelettique.",
    src("b00003", "b00106"),
  ),
  card(
    "Un curare provoque-t-il une perte de conscience ?",
    "Non. Il ne remplace jamais l’hypnotique.",
    src("b00003"),
  ),
  card(
    "Un curare procure-t-il une analgésie ?",
    "Non. L’analgésie doit être assurée séparément.",
    src("b00003"),
  ),
  card(
    "Quels moyens doivent accompagner toute curarisation ?",
    "Sédation adaptée, contrôle des voies aériennes et ventilation.",
    src("b00003", "b00107"),
  ),
  card(
    "Pourquoi un curare peut-il entraîner un arrêt respiratoire ?",
    "Il paralyse aussi les muscles ventilatoires.",
    src("b00003", "b00106"),
  ),
  card(
    "Quelles étapes de l’anesthésie nécessitent d’ajuster les trois composantes ?",
    "Induction, entretien et réveil.",
    src("b00003"),
  ),
  card(
    "Quelles sont les indications anesthésiques principales des curares ?",
    "Ventilation au masque, intubation et conditions opératoires.",
    src("b00003", "b00108"),
  ),
  card(
    "Dans quelle atteinte de réanimation un curare peut-il faciliter la ventilation ?",
    "Le SDRA avec hypoxémie réfractaire.",
    src("b00003", "b00108"),
  ),
  card(
    "Qu’est-ce qu’une unité motrice ?",
    "Un motoneurone et l’ensemble des fibres musculaires qu’il commande.",
    src("b00005", "b00006"),
  ),
  card(
    "Qu’est-ce que la plaque motrice ?",
    "La région spécialisée de la fibre située face à la terminaison nerveuse.",
    src("b00008"),
  ),
  card(
    "Quel neuromédiateur assure la transmission neuromusculaire ?",
    "L’acétylcholine.",
    src("b00009"),
  ),
  card(
    "Où l’acétylcholine est-elle stockée avant sa libération ?",
    "Dans les vésicules synaptiques de la terminaison motrice.",
    src("b00009", "b00014"),
  ),
  card(
    "Quel événement nerveux déclenche l’exocytose d’acétylcholine ?",
    "L’arrivée du potentiel d’action à la terminaison motrice.",
    src("b00009"),
  ),
  card(
    "Quel type de récepteur cholinergique siège sur la plaque motrice ?",
    "Le récepteur nicotinique musculaire.",
    src("b00010"),
  ),
  card(
    "Combien de sous-unités possède le récepteur nicotinique musculaire ?",
    "Cinq sous-unités protéiques.",
    src("b00010"),
  ),
  card(
    "Combien de molécules d’acétylcholine activent un récepteur nicotinique ?",
    "Deux, fixées simultanément sur les deux sous-unités alpha.",
    src("b00017"),
  ),
  card(
    "Que provoque l’activation du récepteur nicotinique ?",
    "L’ouverture d’un canal cationique et la dépolarisation musculaire.",
    src("b00017"),
  ),
  card(
    "Quelle enzyme hydrolyse rapidement l’acétylcholine synaptique ?",
    "L’acétylcholinestérase.",
    src("b00015", "b00016"),
  ),
  card(
    "Qu’est-ce que le couplage excitation-contraction ?",
    "La conversion du potentiel musculaire en contraction synchronisée.",
    src("b00020", "b00021"),
  ),
  card(
    "Quelles sont les deux classes fonctionnelles de curares ?",
    "Dépolarisants et non dépolarisants.",
    src("b00022", "b00024"),
  ),
  card(
    "Comment un curare rend-il la paralysie réversible ?",
    "L’effet cesse quand l’occupation nicotinique devient insuffisante.",
    src("b00024"),
  ),
  card(
    "Quel est le seul curare dépolarisant disponible ?",
    "La succinylcholine.",
    src("b00038"),
  ),
  card(
    "De quoi la succinylcholine est-elle structurellement formée ?",
    "De deux molécules d’acétylcholine mises bout à bout.",
    src("b00038"),
  ),
  card(
    "Pourquoi la succinylcholine dépolarise-t-elle durablement la plaque ?",
    "Elle résiste à l’acétylcholinestérase synaptique.",
    src("b00038"),
  ),
  card(
    "Quelle enzyme plasmatique métabolise la succinylcholine ?",
    "La butyrylcholinestérase.",
    src("b00038"),
  ),
  card(
    "Quel profil cinétique caractérise la succinylcholine ?",
    "Installation en moins d’une minute, durée de 10 à 15 minutes.",
    src("b00110"),
  ),
  card(
    "Quelle manifestation précède souvent le bloc de succinylcholine ?",
    "Des fasciculations brèves et désordonnées.",
    src("b00039", "b00041", "b00042"),
  ),
  card(
    "Le bloc dépolarisant de phase I présente-t-il une fatigue au Td4 ?",
    "Non, les réponses restent proportionnellement maintenues.",
    src("b00039", "b00043"),
  ),
  card(
    "Existe-t-il une facilitation post-tétanique en phase I ?",
    "Non.",
    src("b00043"),
  ),
  card(
    "Quel est l’effet de la néostigmine sur un bloc dépolarisant de phase I ?",
    "Elle le majore au lieu de l’antagoniser.",
    src("b00043"),
  ),
  card(
    "Quelle dose adulte de succinylcholine est utilisée pour l’intubation ?",
    "1 mg/kg de masse corporelle réelle.",
    src("b00030", "b00049"),
  ),
  card(
    "Quelle hausse usuelle de kaliémie suit la succinylcholine ?",
    "Environ 0,5 à 1,0 mEq/L.",
    src("b00044"),
  ),
  card(
    "Pourquoi la dénervation contre-indique-t-elle la succinylcholine ?",
    "La prolifération de récepteurs expose à une hyperkaliémie massive.",
    src("b00044", "b00046"),
  ),
  card(
    "Quel trouble musculaire aigu peut suivre la succinylcholine ?",
    "Des myalgies après fasciculations.",
    src("b00044"),
  ),
  card(
    "Quel risque thermique grave est associé à la succinylcholine ?",
    "Le déclenchement d’une hyperthermie maligne chez un sujet susceptible.",
    src("b00044", "b00046"),
  ),
  card(
    "Quel effet cardiaque est fréquent avant un an avec la succinylcholine ?",
    "Une bradycardie parasympathomimétique.",
    src("b00045"),
  ),
  card(
    "Quel médicament prévient ou traite la bradycardie liée à la succinylcholine ?",
    "L’atropine.",
    src("b00045"),
  ),
  card(
    "Que faire lors d’un bloc prolongé par déficit en butyrylcholinestérase ?",
    "Maintenir sédation et ventilation jusqu’à récupération spontanée.",
    src("b00045", "b00048"),
  ),
  card(
    "Quelle indication privilégie la succinylcholine ?",
    "L’intubation en séquence rapide, notamment estomac plein.",
    src("b00049", "b00110"),
  ),
  card(
    "Faut-il entretenir une curarisation par succinylcholine répétée ?",
    "Non, choisir ensuite un curare non dépolarisant.",
    src("b00049"),
  ),
  card(
    "Quel est le mécanisme d’un curare non dépolarisant ?",
    "Un antagonisme compétitif de l’acétylcholine au récepteur nicotinique.",
    src("b00054"),
  ),
  card(
    "Un antagoniste non dépolarisant ouvre-t-il le canal nicotinique ?",
    "Non : il occupe un site alpha sans activer le pore.",
    src("b00054"),
  ),
  card(
    "Quelle occupation nicotinique rend le bloc non dépolarisant détectable ?",
    "Environ 75 % des récepteurs.",
    src("b00054"),
  ),
  card(
    "Quelle occupation nicotinique correspond à un bloc complet ?",
    "Environ 92 % des récepteurs.",
    src("b00054"),
  ),
  card(
    "Le bloc non dépolarisant débute-t-il par des fasciculations ?",
    "Non : l’antagoniste n’excite pas la plaque avant de la bloquer.",
    src("b00057"),
  ),
  card(
    "Quel profil au Td4 caractérise le bloc non dépolarisant ?",
    "Une fatigue progressive de T1 à T4.",
    src("b00055", "b00058"),
  ),
  card(
    "Le bloc non dépolarisant présente-t-il une facilitation post-tétanique ?",
    "Oui.",
    src("b00059"),
  ),
  card(
    "Quelle enzyme peut être inhibée pour antagoniser un bloc compétitif ?",
    "L’acétylcholinestérase, afin d’augmenter l’acétylcholine disponible.",
    src("b00060", "b00061"),
  ),
  card(
    "Quelles molécules sont des benzylisoquinolines ?",
    "Atracurium et cisatracurium.",
    src("b00062", "b00111"),
  ),
  card(
    "Quel curare non dépolarisant a une structure stéroïdienne ?",
    "Le rocuronium.",
    src("b00062", "b00111"),
  ),
  card(
    "Quel curare remplace la succinylcholine en séquence rapide ?",
    "Le rocuronium à dose élevée.",
    src("b00034", "b00065"),
  ),
  card(
    "Quelle dose de rocuronium convient à une séquence rapide ?",
    "0,9 à 1,2 mg/kg de masse idéale.",
    src("b00034"),
  ),
  card(
    "Quel effet a l’augmentation de dose du rocuronium sur son délai ?",
    "Elle accélère l’installation du bloc.",
    src("b00034"),
  ),
  card(
    "Pourquoi les curares de longue durée ont-ils été abandonnés ?",
    "Ils exposaient fortement à la curarisation résiduelle.",
    src("b00065"),
  ),
  card(
    "Les non-dépolarisants sont-ils contre-indiqués après dénervation ?",
    "Non, ils n’entraînent pas l’hyperkaliémie propre à la succinylcholine.",
    src("b00066"),
  ),
  card(
    "De quoi dépend le début clinique d’un bloc neuromusculaire ?",
    "Du franchissement d’un seuil de concentration à la jonction.",
    src("b00067"),
  ),
  card(
    "Pourquoi l’effet cesse-t-il avant l’élimination totale du curare ?",
    "La concentration au site effecteur repasse sous le seuil actif.",
    src("b00067", "b00069"),
  ),
  card(
    "Quel est le volume de distribution habituel d’un curare hydrosoluble ?",
    "Environ 0,2 à 0,4 L/kg, proche du secteur extracellulaire.",
    src("b00071"),
  ),
  card(
    "Comment le volume de distribution par kg varie-t-il chez le nourrisson ?",
    "Il est augmenté.",
    src("b00071"),
  ),
  card(
    "Quelle durée clinique partagent atracurium et rocuronium ?",
    "Environ 30 à 45 minutes.",
    src("b00073", "b00077"),
  ),
  card(
    "Combien d’isomères contient le mélange atracurium ?",
    "Dix.",
    src("b00074"),
  ),
  card(
    "Qu’est-ce que la réaction de Hofmann ?",
    "Une dégradation non enzymatique de l’atracurium.",
    src("b00074"),
  ),
  card(
    "Quels facteurs accélèrent la réaction de Hofmann ?",
    "L’élévation de la température et du pH.",
    src("b00074"),
  ),
  card(
    "Pourquoi le cisatracurium a-t-il été développé ?",
    "Pour limiter l’histaminolibération observée avec l’atracurium.",
    src("b00075"),
  ),
  card(
    "Quel lien structural unit cisatracurium et atracurium ?",
    "Le cisatracurium est un isomère puissant de l’atracurium.",
    src("b00075"),
  ),
  card(
    "Quelle est la demi-vie d’élimination du rocuronium ?",
    "Environ 60 à 120 minutes.",
    src("b00076", "b00077"),
  ),
  card(
    "Pourquoi l’effet du rocuronium est-il plus court que sa demi-vie ?",
    "Une redistribution importante abaisse rapidement la concentration d’effet.",
    src("b00076", "b00077"),
  ),
  card(
    "Quelle voie participe à l’élimination du rocuronium ?",
    "L’excrétion biliaire.",
    src("b00077"),
  ),
  card(
    "Pourquoi les perfusions prolongées posent-elles davantage problème en réanimation ?",
    "L’accumulation et des métabolites actifs peuvent prolonger le bloc.",
    src("b00078", "b00079"),
  ),
  card(
    "Quel effet autonome peut apparaître avec rocuronium au-delà de 1,5 mg/kg ?",
    "Une vagolyse avec tachycardie.",
    src("b00080"),
  ),
  card(
    "Quel effet cardiovasculaire évoque une histaminolibération de benzylisoquinoline ?",
    "Hypotension avec tachycardie et manifestations cutanées.",
    src("b00080"),
  ),
  card(
    "L’histaminolibération de l’atracurium est-elle toujours allergique ?",
    "Non, elle peut être pharmacologique et non immunitaire.",
    src("b00075", "b00080"),
  ),
  card(
    "Tous les curares peuvent-ils provoquer une anaphylaxie IgE-dépendante ?",
    "Oui, quelle que soit leur classe.",
    src("b00081", "b00112"),
  ),
  card(
    "Quel ordre de grandeur est proposé pour l’allergie aux curares ?",
    "Environ 1 sur 5 000 à 1 sur 10 000.",
    src("b00082", "b00083"),
  ),
  card(
    "Pourquoi faut-il monitorer chaque patient curarisé ?",
    "La réponse à une même dose varie fortement entre individus.",
    src("b00085"),
  ),
  card(
    "Quel couple nerf-muscle est privilégié pour le monitorage ?",
    "Nerf ulnaire et adducteur du pouce.",
    src("b00085", "b00097"),
  ),
  card(
    "Combien de stimuli comporte un train-de-quatre ?",
    "Quatre.",
    src("b00090"),
  ),
  card(
    "À quelle fréquence les stimuli du Td4 sont-ils délivrés ?",
    "2 Hz, soit un stimulus toutes les 0,5 seconde.",
    src("b00090"),
  ),
  card(
    "Que mesure le compte du Td4 ?",
    "Le nombre de contractions perceptibles, de zéro à quatre.",
    src("b00088", "b00090"),
  ),
  card(
    "Que mesure le rapport du Td4 ?",
    "L’amplitude de T4 rapportée à celle de T1.",
    src("b00088"),
  ),
  card(
    "Quel rapport T4/T1 définit une récupération complète ?",
    "Au moins 0,9.",
    src("b00090", "b00113"),
  ),
  card(
    "Quel rapport T4/T1 définit une curarisation résiduelle ?",
    "Une valeur inférieure à 0,9.",
    src("b00113"),
  ),
  card(
    "Pourquoi quatre réponses ne suffisent-elles pas avant extubation ?",
    "Une fatigue résiduelle peut persister malgré quatre contractions visibles.",
    src("b00090", "b00113"),
  ),
  card(
    "Quel muscle récupère avant les muscles pharyngés ?",
    "Le diaphragme.",
    src("b00090"),
  ),
  card(
    "La ventilation spontanée prouve-t-elle une décurarisation complète ?",
    "Non, le pharynx peut rester faible après récupération diaphragmatique.",
    src("b00090", "b00113"),
  ),
  card(
    "Quelles conséquences expose un bloc résiduel ?",
    "Faiblesse, inconfort, séjour prolongé et complications respiratoires.",
    src("b00092", "b00113"),
  ),
  card(
    "Quelle proportion de patients peut présenter un bloc résiduel ?",
    "Environ 40 à 60 % sans stratégie rigoureuse.",
    src("b00092"),
  ),
  card(
    "Quels sont les trois objectifs du monitorage neuromusculaire ?",
    "Adapter la dose, évaluer la récupération et guider l’antagonisation.",
    src("b00109"),
  ),
  card(
    "Quel antagoniste convient à tous les non-dépolarisants cités ?",
    "La néostigmine.",
    src("b00092", "b00114"),
  ),
  card(
    "Quand peut-on administrer la néostigmine ?",
    "Lorsque quatre réponses sont visibles à l’adducteur du pouce.",
    src("b00092", "b00114"),
  ),
  card(
    "Quelle dose de néostigmine est recommandée ?",
    "0,04 à 0,05 mg/kg, sans dépasser son effet plafond.",
    src("b00114"),
  ),
  card(
    "Pourquoi associer un antimuscarinique à la néostigmine ?",
    "Pour prévenir bradycardie et hypersécrétions muscariniques.",
    src("b00092", "b00114"),
  ),
  card(
    "Quels antimuscariniques peuvent accompagner la néostigmine ?",
    "Atropine ou glycopyrrolate.",
    src("b00092"),
  ),
  card(
    "Pourquoi la néostigmine échoue-t-elle sur un bloc profond ?",
    "Son effet plafond ne compense pas une forte occupation nicotinique.",
    src("b00092", "b00114"),
  ),
  card(
    "Quel curare le sugammadex antagonise-t-il ?",
    "Le rocuronium uniquement.",
    src("b00093", "b00102", "b00115"),
  ),
  card(
    "Quel est le mécanisme du sugammadex ?",
    "Il encapsule le rocuronium dans un complexe stable.",
    src("b00093"),
  ),
  card(
    "Comment le complexe sugammadex-rocuronium est-il éliminé ?",
    "Inchangé par le rein.",
    src("b00093", "b00102"),
  ),
  card(
    "Le sugammadex antagonise-t-il l’atracurium ?",
    "Non : sa cavité reconnaît le rocuronium, pas les benzylisoquinolines.",
    src("b00102"),
  ),
  card(
    "Quelle dose de sugammadex utiliser avec deux réponses au Td4 ?",
    "2 mg/kg.",
    src("b00099", "b00102"),
  ),
  card(
    "Quelle dose de sugammadex utiliser avec une à deux réponses post-tétaniques ?",
    "4 mg/kg.",
    src("b00099", "b00102"),
  ),
  card(
    "Quelle dose de sugammadex permet une décurarisation immédiate ?",
    "8 à 16 mg/kg après rocuronium.",
    src("b00099", "b00102"),
  ),
  card(
    "Pourquoi la dose de sugammadex dépend-elle du monitorage ?",
    "La quantité nécessaire augmente avec la profondeur du bloc.",
    src("b00102", "b00115"),
  ),
  card(
    "Quel risque expose un sous-dosage de sugammadex ?",
    "Une recurarisation par rocuronium non encapsulé.",
    src("b00102"),
  ),
  card(
    "Dans quel terrain le sugammadex n’est-il pas recommandé ?",
    "L’insuffisance rénale terminale.",
    src("b00102"),
  ),
  card(
    "Quelle cible objective doit précéder l’extubation ?",
    "Un rapport T4/T1 au moins égal à 0,9.",
    src("b00104", "b00109", "b00113"),
  ),
  card(
    "La décurarisation pharmacologique remplace-t-elle le monitorage ?",
    "Non, elle doit être guidée puis contrôlée objectivement.",
    src("b00109", "b00115"),
  ),
];

const QCM_SERIES = [
  {
    label: "QCM — Série 1 · Principes et sécurité",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles affirmations décrivent correctement l’anesthésie balancée ?",
        src("b00003"),
        "Hypnose, analgésie et immobilité reposent sur des agents distincts ; le curare ne remplace ni l’hypnotique ni le morphinique.",
        [
          T("L’hypnotique assure la perte de conscience.", "Il constitue la composante centrale de l’hypnose."),
          T("Le morphinique contribue à supprimer la douleur.", "Son rôle est analgésique et non paralysant."),
          F("Le curare remplace l’analgésique lorsque l’immobilité est complète.", "Le bloc de la jonction neuromusculaire supprime le mouvement mais ne traite pas la nociception."),
          F("Le curare suffit à prévenir la mémorisation.", "La paralysie ne modifie pas la conscience."),
          F("Les trois agents doivent garder une dose fixe pendant toute l’intervention.", "Chaque composante est adaptée à l’induction, à l’entretien et au réveil.")
        ]
      ),
      qcm(
        "Quelles précautions sont indissociables de l’injection d’un curare ?",
        src("b00003", "b00107"),
        "La curarisation exige une hypnose préalable, un contrôle immédiatement disponible des voies aériennes et une capacité de ventilation assistée.",
        [
          F("Reporter l’hypnose jusqu’après la vérification de l’intubation.", "L’hypnose doit précéder la paralysie afin d’éviter une curarisation consciente."),
          T("Disposer d’un moyen de contrôle des voies aériennes.", "La faiblesse pharyngée peut abolir leur protection."),
          F("Maintenir une ventilation spontanée non assistée pendant toute la curarisation.", "Une dose curarisante peut paralyser les muscles respiratoires et rendre la ventilation assistée indispensable."),
          F("Attendre l’apnée avant de préparer le ventilateur.", "Le support doit être immédiatement disponible avant l’administration."),
          F("Considérer la réponse motrice comme un indicateur de profondeur hypnotique.", "Le curare dissocie mouvement et niveau de conscience.")
        ]
      ),
      qcm(
        "Quelles situations cliniques peuvent justifier un bloc neuromusculaire ?",
        src("b00003", "b00108"),
        "L’intubation urgente, la laparoscopie et la ventilation mécanique d’un SDRA réfractaire sont des indications ; douleur et anxiété exigent d’autres traitements.",
        [
          T("Intubation trachéale en urgence.", "Une installation rapide améliore les conditions de laryngoscopie."),
          T("Relâchement lors d’une laparoscopie.", "L’immobilité facilite l’exposition opératoire."),
          T("Ventilation mécanique d’un SDRA hypoxémique réfractaire.", "La suppression des efforts peut améliorer la synchronisation."),
          F("Traitement isolé d’une douleur postopératoire.", "La paralysie n’a aucun effet antalgique."),
          F("Sédation anxiolytique d’un patient ventilant spontanément.", "Un curare supprimerait la respiration sans traiter l’anxiété.")
        ]
      ),
      qcm(
        "Quelles conséquences découlent de l’action périphérique des curares ?",
        src("b00003", "b00106"),
        "L’effet porte sur les muscles striés, y compris respiratoires, sans procurer les effets centraux de l’anesthésie.",
        [
          T("Une paralysie diaphragmatique est possible.", "Le diaphragme est un muscle strié squelettique."),
          F("La curarisation préserve systématiquement une ventilation spontanée efficace.", "Le bloc périphérique peut atteindre le diaphragme et interrompre la ventilation spontanée."),
          F("Une amnésie dose-dépendante accompagne nécessairement le bloc.", "Le système nerveux central n’est pas la cible."),
          F("L’analgésie augmente parallèlement à l’occupation nicotinique.", "Les récepteurs de la plaque motrice ne médiatisent pas la douleur."),
          T("L’absence de mouvement ne prouve pas l’inconscience.", "Une réponse motrice abolie peut masquer un éveil.")
        ]
      ),
      qcm(
        "Quels objectifs justifient un monitorage neuromusculaire ?",
        src("b00085", "b00109"),
        "La mesure objective individualise l’entretien du bloc, sa récupération et le choix de l’antagonisation.",
        [
          T("Adapter le complément de curare au besoin opératoire.", "La variabilité interindividuelle exclut une dose uniforme."),
          F("Déterminer la concentration plasmatique exacte du curare.", "La réponse musculaire renseigne sur l’effet à la jonction, pas sur un dosage plasmatique du médicament."),
          F("Prédire une réaction allergique lors de la prochaine injection.", "Le monitorage neuromusculaire mesure la transmission motrice et n’évalue pas une sensibilisation immunologique."),
          F("Remplacer toute surveillance ventilatoire.", "Le monitorage moteur ne mesure ni oxygénation ni ventilation."),
          F("Déterminer à lui seul la profondeur de l’hypnose.", "Il renseigne sur la jonction et non sur le cerveau.")
        ]
      ),
    ],
  },
  {
    label: "QCM — Série 2 · Transmission neuromusculaire",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles affirmations décrivent correctement une unité motrice ?",
        src("b00005", "b00006"),
        "Une unité motrice associe un motoneurone, son axone ramifié et toutes les fibres musculaires qu’il commande en parallèle.",
        [
          T("Le corps cellulaire d’un motoneurone.", "Il génère les potentiels d’action moteurs."),
          T("Les ramifications terminales de son axone.", "Elles distribuent le signal vers plusieurs plaques motrices."),
          T("L’ensemble des fibres musculaires qu’il commande.", "Ces fibres se contractent sous le contrôle du même neurone."),
          T("L’axone moteur se divise en arborisations au niveau du muscle.", "Ces branches terminales distribuent la commande du motoneurone à ses différentes fibres musculaires."),
          T("Un même motoneurone commande simultanément plusieurs fibres musculaires.", "La fréquence de ses potentiels d’action coordonne la contraction de l’ensemble des fibres qui lui sont rattachées.")
        ]
      ),
      qcm(
        "Comment l’acétylcholine transmet-elle le signal à la plaque motrice ?",
        src("b00009", "b00017"),
        "Libérée par exocytose, l’acétylcholine occupe les deux sites alpha puis ouvre un pore cationique à l’origine de la dépolarisation musculaire.",
        [
          T("Elle est libérée depuis des vésicules présynaptiques.", "La terminaison motrice constitue la réserve synaptique."),
          T("Deux molécules doivent se fixer au récepteur.", "Les deux sous-unités alpha doivent être occupées."),
          T("La fixation change la conformation du canal.", "L’ouverture résulte de cette transition structurale."),
          F("Elle traverse la membrane pour se lier à l’ADN musculaire.", "La transmission reste membranaire et ionique."),
          T("L’ouverture du pore permet des flux de sodium et de potassium.", "Le passage de ces ions à travers le récepteur produit la dépolarisation locale de la plaque motrice.")
        ]
      ),
      qcm(
        "Quelles propriétés caractérisent le récepteur nicotinique musculaire ?",
        src("b00010", "b00017"),
        "Ce récepteur pentamérique possède deux sites alpha et commande un canal cationique postsynaptique.",
        [
          T("Il comporte cinq sous-unités protéiques.", "L’assemblage pentamérique forme le pore central."),
          F("Le site de liaison de l’acétylcholine se trouve uniquement sur une sous-unité bêta.", "Les deux sites fonctionnels sont portés par les sous-unités alpha du récepteur musculaire."),
          T("Son ouverture dépolarise la membrane musculaire.", "Le flux cationique produit le potentiel de plaque."),
          T("Il forme un canal ionique intégré à la membrane postsynaptique.", "Le complexe nicotinique constitue directement le pore cationique de la plaque motrice."),
          T("Son pore central est fermé au repos.", "L’occupation simultanée des deux sites alpha provoque le changement de conformation qui l’ouvre.")
        ]
      ),
      qcm(
        "Quel rôle joue l’acétylcholinestérase dans la jonction ?",
        src("b00015", "b00016", "b00022"),
        "L’enzyme de la lame basale interrompt rapidement le message cholinergique et sa modulation peut faciliter la décurarisation compétitive.",
        [
          F("Elle prolonge spontanément la présence d’acétylcholine dans la fente.", "L’enzyme active hydrolyse au contraire rapidement le médiateur après sa libération."),
          F("Elle assure la synthèse présynaptique de l’acétylcholine.", "Sa fonction est l’hydrolyse dans la fente ; la synthèse du médiateur appartient à la terminaison nerveuse."),
          F("Elle métabolise principalement le rocuronium dans le plasma.", "Le rocuronium n’est pas éliminé par cette enzyme synaptique."),
          F("Elle synthétise les vésicules présynaptiques.", "La fonction enzymatique est la dégradation du médiateur."),
          T("Elle contribue à terminer chaque activation de plaque.", "La transmission doit rester brève pour permettre une nouvelle commande.")
        ]
      ),
      qcm(
        "Quelles étapes relient le potentiel nerveux à la contraction ?",
        src("b00009", "b00017", "b00020", "b00021"),
        "Le signal électrique nerveux devient signal chimique synaptique, puis dépolarisation et contraction musculaires.",
        [
          T("Arrivée du potentiel d’action dans la terminaison.", "Cette étape initie la libération du médiateur."),
          F("Le potentiel nerveux déclenche directement la contraction sans médiateur synaptique.", "À la jonction, une étape chimique d’exocytose puis de liaison de l’acétylcholine est indispensable."),
          T("Ouverture des récepteurs nicotiniques.", "Le canal transmet le message à la fibre."),
          T("Déclenchement du couplage excitation-contraction.", "La dépolarisation recrute l’appareil contractile."),
          F("Passage du curare dans le motoneurone pour créer le potentiel.", "Le curare bloque la transmission et ne génère pas le signal.")
        ]
      ),
    ],
  },
  {
    label: "QCM — Série 3 · Succinylcholine",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles propriétés expliquent le bloc produit par la succinylcholine ?",
        src("b00038", "b00039"),
        "Agoniste nicotinique résistant à l’acétylcholinestérase, elle maintient la plaque dépolarisée après une excitation initiale.",
        [
          T("Sa structure associe deux molécules d’acétylcholine.", "Cette parenté lui permet d’activer le récepteur nicotinique."),
          T("Elle ouvre d’abord le canal nicotinique.", "La phase initiale est agoniste et excitatrice."),
          T("Elle persiste plus longtemps que l’acétylcholine dans la fente.", "L’acétylcholinestérase ne la dégrade pas."),
          T("Elle active initialement le récepteur nicotinique avant de maintenir la dépolarisation.", "La première phase agoniste ouvre le canal, puis la persistance de l’agent rend la plaque inexcitabile."),
          T("La butyrylcholinestérase plasmatique assure son hydrolyse.", "Cette enzyme circulante explique la disparition habituellement rapide de la succinylcholine."),
        ]
      ),
      qcm(
        "Quels signes définissent un bloc dépolarisant de phase I ?",
        src("b00039", "b00040", "b00041", "b00042", "b00043"),
        "La phase I associe fasciculations, baisse globale de réponse sans fade, absence de facilitation et aggravation par néostigmine.",
        [
          T("Des fasciculations peuvent accompagner l’installation.", "Elles traduisent l’excitation initiale des plaques."),
          T("Les réponses répétées restent sans fatigue relative.", "Le Td4 ne présente pas de fade caractéristique en phase I."),
          T("La facilitation post-tétanique est absente.", "Le bloc n’est pas un antagonisme compétitif présynaptique."),
          T("Un inhibiteur de l’acétylcholinestérase peut majorer le bloc.", "Davantage d’agoniste entretient la dépolarisation."),
          T("L’amplitude de la réponse musculaire isolée diminue.", "La dépolarisation persistante réduit la réponse globale sans créer le fade relatif caractéristique d’un bloc compétitif."),
        ]
      ),
      qcm(
        "Quels avantages cinétiques rendent la succinylcholine utile en urgence ?",
        src("b00049", "b00110"),
        "Une installation inférieure à une minute et une récupération en 10 à 15 minutes conviennent à la séquence rapide.",
        [
          T("L’effet débute en moins d’une minute.", "Le délai court améliore rapidement les conditions d’intubation."),
          T("Le bloc obtenu est profond.", "La dose d’intubation supprime efficacement la motricité."),
          T("La durée habituelle reste de 10 à 15 minutes.", "La métabolisation plasmatique limite l’exposition."),
          T("La butyrylcholinestérase plasmatique limite rapidement l’exposition.", "L’hydrolyse circulante contribue à la brièveté du bloc chez un patient sans anomalie enzymatique."),
          F("Elle est privilégiée pour une perfusion d’entretien de plusieurs jours.", "Les effets indésirables interdisent cette stratégie.")
        ]
      ),
      qcm(
        "Quelles situations exposent à une hyperkaliémie dangereuse après succinylcholine ?",
        src("b00044", "b00046"),
        "Les états avec dénervation ou prolifération extrasynaptique amplifient la sortie de potassium provoquée par la dépolarisation.",
        [
          T("Une lésion médullaire ancienne.", "La dénervation augmente le nombre de récepteurs diffus."),
          F("Une brûlure superficielle récente limitée à quelques centimètres carrés.", "Le risque hyperkaliémique concerne surtout les brûlures étendues et évoluées avec prolifération de récepteurs extrasynaptiques."),
          T("Une immobilisation prolongée avec atteinte neuromusculaire.", "Le muscle déconditionné peut exprimer des récepteurs extrasynaptiques."),
          F("Une appendicite aiguë sans maladie musculaire.", "Ce contexte ne crée pas de prolifération nicotinique particulière."),
          F("Une myopie isolée stable.", "Elle n’influence pas la réponse potassique de la plaque.")
        ]
      ),
      qcm(
        "Quels effets indésirables doivent être recherchés avec la succinylcholine ?",
        src("b00044", "b00045", "b00046"),
        "La phase agoniste et ses effets autonomes expliquent myalgies, kaliémie, bradycardie et risques musculaires graves.",
        [
          T("Des myalgies après fasciculations.", "Les contractions initiales peuvent léser transitoirement les fibres."),
          F("Une accélération cardiaque constante chez le nourrisson.", "L’effet autonome attendu à cet âge est plutôt une bradycardie parasympathomimétique, non une tachycardie constante."),
          T("Une hyperthermie maligne chez un sujet susceptible.", "La succinylcholine fait partie des déclencheurs."),
          T("Un bloc prolongé si la butyrylcholinestérase est déficitaire.", "La clairance plasmatique devient très lente."),
          F("Une neutralisation spécifique par sugammadex.", "Le sugammadex n’encapsule que le rocuronium.")
        ]
      ),
    ],
  },
  {
    label: "QCM — Série 4 · Non-dépolarisants",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles propriétés définissent un bloc non dépolarisant ?",
        src("b00054", "b00055", "b00057", "b00058", "b00059"),
        "L’antagonisme compétitif empêche l’ouverture du canal et produit fade, facilitation post-tétanique et absence de fasciculations.",
        [
          T("Une seule sous-unité alpha occupée peut empêcher l’activation.", "Les deux sites doivent recevoir l’acétylcholine pour ouvrir le canal."),
          T("L’installation ne comporte pas de fasciculations.", "Le récepteur n’est pas activé avant d’être bloqué."),
          T("La réponse s’épuise lors d’une stimulation répétée.", "Le fade est typique du bloc compétitif."),
          T("Une facilitation post-tétanique peut être observée.", "Le tétanos augmente transitoirement la disponibilité d’acétylcholine."),
          T("L’augmentation d’acétylcholine peut antagoniser un bloc déjà superficiel.", "La néostigmine favorise la compétition du médiateur avec le curare lorsque des réponses au train-de-quatre sont revenues."),
        ]
      ),
      qcm(
        "Quels agents appartiennent aux familles de non-dépolarisants disponibles ?",
        src("b00062", "b00111"),
        "Atracurium et cisatracurium sont des benzylisoquinolines ; rocuronium est un aminostéroïde.",
        [
          T("L’atracurium est une benzylisoquinoline.", "Sa structure le place dans cette famille."),
          T("Le cisatracurium est une benzylisoquinoline.", "Il correspond à un isomère sélectionné de l’atracurium."),
          T("Le rocuronium est un composé stéroïdien.", "Sa charpente diffère des benzylisoquinolines."),
          F("La succinylcholine est un aminostéroïde non dépolarisant.", "Elle constitue le dépolarisant disponible."),
          T("L’atracurium et le cisatracurium appartiennent à la même famille benzylisoquinolinique.", "Le cisatracurium est un isomère sélectionné au sein du mélange moléculaire de l’atracurium."),
        ]
      ),
      qcm(
        "Comment interpréter la marge d’occupation des récepteurs ?",
        src("b00054"),
        "Une importante réserve synaptique retarde le déficit : le bloc apparaît vers 75 % et devient complet vers 92 % d’occupation.",
        [
          T("Une occupation modérée peut rester cliniquement silencieuse.", "La plaque dispose d’une marge de sécurité fonctionnelle."),
          F("Un effet clinique apparaît dès qu’un quart des récepteurs est occupé.", "La marge de sécurité de la plaque retarde la faiblesse mesurable jusqu’à une occupation beaucoup plus importante, proche de 75 %."),
          F("Le bloc complet exige l’occupation absolue de tous les récepteurs.", "La transmission peut être totalement interrompue dès environ 92 % d’occupation, avant la saturation complète."),
          F("Un seul récepteur occupé paralyse toute la fibre.", "Le bloc dépend d’une fraction élevée de la population réceptrice."),
          F("La force reste normale jusqu’à 100 % d’occupation.", "Le déficit complet précède l’occupation absolue.")
        ]
      ),
      qcm(
        "Quels avantages ont les non-dépolarisants sur la succinylcholine ?",
        src("b00065", "b00066"),
        "Ils évitent la dépolarisation et ses complications, au prix d’une installation ou d’une durée souvent moins favorables.",
        [
          T("Ils ne provoquent pas de fasciculations d’installation.", "Ils n’activent pas la plaque motrice."),
          F("Ils déclenchent une dépolarisation musculaire préalable au bloc.", "Ces agents sont des antagonistes compétitifs : ils gardent le canal fermé sans phase agoniste initiale."),
          T("Ils peuvent être utilisés en contexte de dénervation.", "La prolifération réceptrice ne produit pas de sortie potassique agoniste."),
          F("Ils sont tous plus rapides et plus courts que la succinylcholine.", "Aucun ne reproduit exactement les deux avantages cinétiques."),
          F("Ils sont dépourvus de tout risque allergique.", "Une anaphylaxie IgE-dépendante reste possible avec toute classe.")
        ]
      ),
      qcm(
        "Quels éléments influencent le choix d’un curare non dépolarisant ?",
        src("b00063", "b00065", "b00073", "b00075", "b00077"),
        "Le délai requis, la durée prévue, le terrain, les voies d’élimination et la possibilité d’antagonisation orientent la molécule.",
        [
          F("La profondeur hypnotique mesurée par l’électroencéphalogramme.", "Le choix du curare dépend de la cinétique neuromusculaire, du terrain et de la réversibilité, non d’une mesure corticale de l’hypnose."),
          T("Une défaillance hépatobiliaire.", "Elle peut prolonger l’élimination du rocuronium."),
          T("Le risque d’histaminolibération.", "Il distingue notamment atracurium et cisatracurium."),
          T("La disponibilité d’un antagoniste spécifique.", "Le sugammadex offre une option propre au rocuronium."),
          F("La couleur de l’ampoule comme critère pharmacologique.", "Le conditionnement ne prédit pas la cinétique chez le patient.")
        ]
      ),
    ],
  },
  {
    label: "QCM — Série 5 · Pharmacologie comparée",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles affirmations concernent la distribution des curares ?",
        src("b00067", "b00068", "b00069", "b00071"),
        "Hydrosolubles, ils restent surtout extracellulaires ; l’effet suit avec retard la concentration plasmatique et un seuil au site d’action.",
        [
          T("Leur volume de distribution est généralement limité.", "La faible liposolubilité réduit la pénétration tissulaire."),
          T("Le volume habituel se rapproche de 0,2 à 0,4 L/kg.", "Cette valeur correspond au secteur extracellulaire."),
          T("La concentration de la jonction retarde sur le plasma.", "Le site effecteur n’est pas instantanément équilibré."),
          T("Leur hydrosolubilité limite leur pénétration dans les tissus lipidiques.", "La distribution reste principalement extracellulaire, ce qui explique un volume apparent relativement faible."),
          T("La concentration au site d’action peut devenir inefficace avant l’élimination complète.", "Redistribution et franchissement du seuil jonctionnel dissocient la durée clinique de la demi-vie terminale."),
        ]
      ),
      qcm(
        "Quelles caractéristiques pharmacologiques appartiennent à l’atracurium ?",
        src("b00073", "b00074", "b00075"),
        "L’atracurium est un mélange de benzylisoquinolines dégradé notamment par Hofmann, avec potentiel histaminolibérateur.",
        [
          T("Il contient dix isomères.", "Le produit est un mélange moléculaire."),
          T("La réaction de Hofmann participe à sa dégradation.", "Ce mécanisme est spontané et non enzymatique."),
          T("Une hausse de température accélère cette réaction.", "La vitesse de Hofmann dépend de la température."),
          T("Une administration rapide peut libérer de l’histamine.", "Cet effet non immunologique est dose et vitesse dépendant."),
          T("Des estérases plasmatiques non spécifiques participent à son hydrolyse.", "Cette voie complète la dégradation spontanée de Hofmann et réduit la dépendance aux organes d’élimination."),
        ]
      ),
      qcm(
        "Pourquoi le cisatracurium diffère-t-il de l’atracurium ?",
        src("b00075"),
        "La sélection d’un isomère plus puissant réduit la dose et l’histaminolibération tout en conservant une élimination organo-indépendante.",
        [
          T("Il correspond à un isomère de l’atracurium.", "Il a été isolé du mélange initial de dix structures moléculaires."),
          T("Sa plus grande puissance réduit la quantité injectée.", "Une dose massique moindre suffit à produire le bloc."),
          T("Il libère moins d’histamine aux doses usuelles.", "C’était un objectif majeur de son développement."),
          F("Il est le seul curare dépolarisant.", "Cette place appartient à la succinylcholine."),
          T("Il conserve une dégradation par la réaction de Hofmann.", "La sélection de l’isomère modifie la puissance et l’histaminolibération sans supprimer cette voie organo-indépendante."),
        ]
      ),
      qcm(
        "Quelles données décrivent le rocuronium ?",
        src("b00034", "b00076", "b00077", "b00080"),
        "Le rocuronium s’installe rapidement à forte dose, se redistribue, s’élimine en partie par la bile et devient vagolytique à très forte dose.",
        [
          T("Sa demi-vie d’élimination est de 60 à 120 minutes.", "Cette valeur dépasse sa durée clinique habituelle."),
          T("Une redistribution explique un effet de 30 à 45 minutes.", "La concentration jonctionnelle décroît avant l’élimination complète."),
          T("Une excrétion biliaire participe à sa clairance.", "Le terrain hépatobiliaire peut donc modifier sa cinétique."),
          T("Au-delà de 1,5 mg/kg, une vagolyse est possible.", "La tachycardie devient un effet autonome envisageable."),
          T("Une dose élevée accélère son installation.", "L’augmentation de la dose de rocuronium raccourcit le délai jusqu’au bloc nécessaire à l’intubation."),
        ]
      ),
      qcm(
        "Quels phénomènes peuvent prolonger un bloc lors d’administrations répétées ?",
        src("b00069", "b00078", "b00079"),
        "L’accumulation, la baisse de clairance et des métabolites actifs deviennent surtout pertinentes pendant les expositions prolongées.",
        [
          F("Une clairance rénale accélérée pendant une perfusion courte.", "Une élimination plus rapide abaisse l’exposition et ne constitue pas un mécanisme d’accumulation du curare."),
          T("Une perfusion poursuivie plusieurs jours.", "Les compartiments et métabolites ont le temps de s’accumuler."),
          F("Un intervalle large laissant revenir quatre réponses entre les bolus.", "Une récupération documentée avant chaque complément limite la superposition des effets résiduels."),
          F("Une redistribution toujours instantanée et complète.", "Une telle hypothèse raccourcirait plutôt l’exposition."),
          F("L’absence totale de métabolite actif.", "Elle ne peut expliquer une prolongation liée aux métabolites.")
        ]
      ),
    ],
  },
  {
    label: "QCM — Série 6 · Effets indésirables",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Comment distinguer histaminolibération et allergie à un curare ?",
        src("b00075", "b00080", "b00081", "b00112"),
        "L’histaminolibération peut être pharmacologique avec les benzylisoquinolines ; l’anaphylaxie est immunitaire et concerne toute molécule.",
        [
          T("L’atracurium peut libérer directement de l’histamine.", "Cette réaction n’exige pas d’anticorps spécifique."),
          T("Une allergie IgE-dépendante peut survenir avec le rocuronium.", "La structure stéroïdienne ne protège pas de l’anaphylaxie."),
          T("La vitesse d’injection influence l’histaminolibération non spécifique.", "Un pic élevé favorise les manifestations cardiovasculaires."),
          T("L’atracurium peut provoquer une histaminolibération pharmacologique sans intervention des IgE.", "La libération directe d’histamine dépend notamment de la dose et de la vitesse d’injection."),
          T("Une anaphylaxie IgE-dépendante reste possible avec toute famille de curare.", "La faible histaminolibération non spécifique d’une molécule ne supprime pas son éventuel risque immunitaire."),
        ]
      ),
      qcm(
        "Quels effets cardiovasculaires peuvent accompagner les curares ?",
        src("b00045", "b00075", "b00080"),
        "Bradycardie cholinergique, vagolyse et histaminolibération varient selon la molécule et la dose.",
        [
          T("Une bradycardie après succinylcholine chez le nourrisson.", "L’effet parasympathomimétique est particulièrement fréquent."),
          T("Une tachycardie après très forte dose de rocuronium.", "La vagolyse apparaît au-delà des doses usuelles."),
          T("Une hypotension après injection rapide d’atracurium.", "L’histamine provoque une vasodilatation."),
          T("Une vasodilatation hypotensive après histaminolibération.", "L’histamine libérée par certaines benzylisoquinolines peut diminuer les résistances vasculaires."),
          T("Un ralentissement sinusal lié à l’effet cholinergique de la succinylcholine.", "L’activité parasympathomimétique expose surtout le nourrisson à une baisse de la fréquence cardiaque."),
        ]
      ),
      qcm(
        "Quels éléments font suspecter un déficit en butyrylcholinestérase ?",
        src("b00038", "b00045", "b00048"),
        "Une apnée très prolongée après une dose normalement brève oriente vers un défaut de métabolisme plasmatique de la succinylcholine.",
        [
          F("Une récupération complète dans les dix minutes suivant la dose.", "Une dissipation dans le délai habituel n’oriente pas vers un déficit de la cholinestérase plasmatique."),
          T("Une récupération lente malgré l’absence de nouvelle dose.", "La molécule reste active tant qu’elle n’est pas hydrolysée."),
          T("La nécessité de prolonger ventilation et sédation.", "Le traitement est un support jusqu’à dissipation du bloc."),
          F("Une réponse immédiate au sugammadex.", "La succinylcholine ne peut pas être encapsulée."),
          T("Une apnée disproportionnée peut persister plusieurs heures.", "Une hydrolyse très ralentie maintient la succinylcholine active et impose ventilation et sédation jusqu’à récupération."),
        ]
      ),
      qcm(
        "Quelles conduites sont adaptées face aux risques de succinylcholine ?",
        src("b00044", "b00045", "b00046", "b00048"),
        "Le terrain doit être dépisté avant l’injection et le support ventilatoire maintenu si l’effet se prolonge.",
        [
          T("Rechercher une dénervation ou une brûlure ancienne.", "Ces contextes augmentent le risque hyperkaliémique."),
          F("Administrer la succinylcholine malgré une susceptibilité familiale à l’hyperthermie maligne.", "Ce terrain contre-indique l’agent dépolarisant, qui peut déclencher une crise hypermétabolique fulminante."),
          T("Préparer de l’atropine chez le très jeune enfant.", "La bradycardie parasympathomimétique y est fréquente."),
          F("Administrer de la néostigmine pour raccourcir une phase I.", "Elle peut au contraire renforcer ce bloc."),
          T("Poursuivre la ventilation lors d’une apnée enzymatique.", "La récupération survient avec l’élimination progressive.")
        ]
      ),
      qcm(
        "Que peut-on conclure sur l’incidence des allergies aux curares ?",
        src("b00081", "b00082", "b00083", "b00112"),
        "Le risque est rare mais grave, estimé autour de 1/5 000 à 1/10 000, avec variations géographiques et dénominateurs imparfaits.",
        [
          F("Le risque allergique est réservé aux curares aminostéroïdes.", "Les benzylisoquinolines peuvent également provoquer une anaphylaxie immunologique."),
          F("Les estimations publiées reposent toujours sur un dénominateur exact.", "Le nombre réel d’expositions est souvent imparfaitement connu, ce qui limite la précision de l’incidence."),
          T("Le dénominateur rend l’incidence difficile à préciser.", "Le nombre réel d’expositions n’est pas toujours connu."),
          F("Le risque est nul avec les benzylisoquinolines.", "Elles peuvent provoquer une réaction immunitaire en plus de l’histamine directe."),
          F("Une fréquence identique est démontrée partout.", "Les enquêtes rapportent des écarts géographiques.")
        ]
      ),
    ],
  },
  {
    label: "QCM — Série 7 · Monitorage",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Comment réaliser et interpréter un train-de-quatre ?",
        src("b00085", "b00088", "b00090"),
        "Quatre stimuli à 2 Hz sont appliqués au nerf ulnaire ; le compte décrit la profondeur et T4/T1 la fatigue résiduelle.",
        [
          T("Les quatre impulsions sont séparées de 0,5 seconde.", "Cette cadence correspond à une fréquence de stimulation de 2 Hz."),
          T("L’adducteur du pouce fournit la réponse musculaire.", "Il est accessible et innervé par le nerf ulnaire."),
          T("Le compte varie de zéro à quatre contractions.", "Les réponses réapparaissent progressivement pendant la récupération."),
          T("Le rapport compare l’amplitude de T4 à T1.", "Il quantifie le fade quand quatre réponses existent."),
          T("Lorsque quatre réponses existent, T4/T1 quantifie la fatigue résiduelle.", "Le rapport d’amplitude détecte un fade que le simple compte des contractions ne mesure pas."),
        ]
      ),
      qcm(
        "Quelles limites comporte l’évaluation clinique de la récupération ?",
        src("b00090", "b00092", "b00113"),
        "Des mouvements ou une ventilation peuvent réapparaître alors que les muscles pharyngés et le rapport T4/T1 restent insuffisants.",
        [
          T("Le diaphragme peut récupérer avant le pharynx.", "Une respiration présente ne garantit donc pas la protection des voies aériennes."),
          F("La palpation de quatre contractions garantit un rapport supérieur à 0,9.", "Le toucher distingue mal un fade modéré et peut surestimer la récupération quantitative."),
          F("Une ventilation spontanée normale prouve la récupération pharyngée complète.", "Le diaphragme récupère avant les muscles des voies aériennes supérieures, qui peuvent rester faibles."),
          F("Lever la tête exclut toujours un rapport inférieur à 0,9.", "Les tests cliniques manquent de sensibilité pour un bloc léger."),
          F("La reprise ventilatoire dispense d’une mesure quantitative.", "Le risque pharyngé persiste après récupération diaphragmatique.")
        ]
      ),
      qcm(
        "Quels résultats traduisent une profondeur croissante du bloc ?",
        src("b00088", "b00090"),
        "Le rapport baisse d’abord, puis le nombre de réponses diminue jusqu’à zéro ; le compte post-tétanique explore alors un bloc profond.",
        [
          F("Un T4 aussi ample que T1 traduit une aggravation du bloc.", "Des réponses égales correspondent à l’absence de fade et orientent vers une récupération avancée."),
          T("Deux réponses signifient un bloc plus profond que quatre réponses.", "Davantage de transmissions sont devenues inefficaces."),
          T("Zéro réponse au Td4 peut nécessiter un compte post-tétanique.", "Le tétanos révèle parfois une transmission encore très déprimée."),
          T("La disparition successive de T4 puis de T3 traduit un approfondissement du bloc.", "Le nombre de contractions perceptibles diminue progressivement lorsque davantage de jonctions deviennent inefficaces."),
          F("La disparition de T4 suffit à calculer précisément T4/T1.", "Un rapport n’est exploitable que si T4 est mesurable.")
        ]
      ),
      qcm(
        "Quelles situations définissent ou favorisent une curarisation résiduelle ?",
        src("b00065", "b00092", "b00113"),
        "Un rapport inférieur à 0,9, une molécule longue et l’absence de monitorage exposent aux complications postopératoires.",
        [
          T("Un rapport T4/T1 mesuré à 0,82.", "La valeur reste sous le seuil de récupération complète."),
          F("Une récupération spontanée complète avant le réveil.", "Le retour documenté de la transmission avant l’émergence écarte un reliquat neuromusculaire au moment considéré."),
          T("Une extubation fondée sur la seule ventilation spontanée.", "Le pharynx peut encore être déficitaire."),
          F("Un rapport quantitatif stable à 0,95.", "Cette mesure dépasse le seuil de 0,9."),
          T("L’absence de monitorage quantitatif en fin d’intervention.", "Sans mesure de T4/T1, un bloc léger peut persister malgré des signes cliniques rassurants."),
        ]
      ),
      qcm(
        "Quels bénéfices apporte une mesure objective au nerf ulnaire ?",
        src("b00085", "b00109", "b00113"),
        "La mesure rend visibles la variabilité individuelle, le degré de bloc et la récupération pharyngée indirectement sécurisée par T4/T1.",
        [
          F("Garantir qu’aucun bolus d’entretien ne sera jamais nécessaire.", "La mesure guide les compléments selon le besoin opératoire mais ne supprime pas toute indication de redose."),
          F("Exclure à lui seul toute faiblesse pharyngée future.", "Le résultat décrit l’état neuromusculaire au moment de la mesure sans garantir l’évolution ultérieure."),
          F("Identifier chimiquement le curare présent dans le plasma.", "La stimulation ulnaire mesure une fonction musculaire et ne réalise aucune analyse pharmacologique du sang."),
          T("Quantifier la profondeur actuelle du bloc par la réponse de l’adducteur du pouce.", "Le compte des contractions puis le rapport T4/T1 objectivent l’intensité et la récupération du bloc."),
          F("Mesurer directement la concentration plasmatique du curare.", "Le dispositif enregistre une réponse fonctionnelle musculaire.")
        ]
      ),
    ],
  },
  {
    label: "QCM — Série 8 · Décurarisation",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles conditions permettent une décurarisation par néostigmine ?",
        src("b00092", "b00114"),
        "La néostigmine convient aux blocs non dépolarisants déjà superficiels, avec quatre réponses, et doit être associée à un antimuscarinique.",
        [
          T("Quatre réponses sont visibles à l’adducteur du pouce.", "Une récupération spontanée suffisante limite l’effet plafond."),
          T("Le curare peut être atracurium, cisatracurium ou rocuronium.", "L’augmentation d’acétylcholine antagonise chaque compétiteur."),
          T("Une dose de 0,04 à 0,05 mg/kg est utilisée.", "Cette plage atteint l’effet maximal utile."),
          T("Un antimuscarinique doit accompagner l’anticholinestérasique.", "L’atropine ou le glycopyrrolate prévient les effets autonomes de l’excès d’acétylcholine."),
          T("Son effet plafond limite l’antagonisation d’un bloc encore profond.", "La néostigmine ne devient fiable qu’après une récupération spontanée suffisante de la transmission."),
        ]
      ),
      qcm(
        "Pourquoi associer atropine ou glycopyrrolate à la néostigmine ?",
        src("b00092", "b00114"),
        "L’augmentation diffuse d’acétylcholine stimule les récepteurs muscariniques et impose une protection cardiovasculaire et sécrétoire.",
        [
          T("Prévenir une bradycardie.", "L’activité vagale cardiaque augmente avec l’acétylcholine."),
          T("Limiter les sécrétions.", "Les glandes répondent à la stimulation muscarinique."),
          F("Accélérer l’encapsulation du rocuronium.", "Ce mécanisme appartient au sugammadex."),
          T("Limiter une bronchoconstriction liée à la stimulation muscarinique.", "Le blocage des récepteurs muscariniques réduit les effets cholinergiques sur le muscle lisse bronchique."),
          T("Compenser les effets muscariniques sans annuler l’effet nicotinique utile.", "L’antimuscarinique protège les organes autonomes.")
        ]
      ),
      qcm(
        "Quelles propriétés distinguent le sugammadex ?",
        src("b00093", "b00102", "b00115"),
        "L’encapsulation sélective du rocuronium permet une antagonisation profonde dont la dose est dictée par le monitorage.",
        [
          F("Une molécule de sugammadex encapsule simultanément plusieurs molécules de rocuronium.", "La stœchiométrie repose sur un complexe stable associant une cavité de sugammadex à une molécule de rocuronium."),
          T("L’atracurium n’est pas neutralisé.", "Sa structure ne s’insère pas dans la cavité du sugammadex."),
          F("Le complexe rocuronium-sugammadex est principalement éliminé par voie biliaire.", "Le complexe stable est excrété sous forme inchangée par le rein, ce qui motive la prudence en insuffisance rénale terminale."),
          F("Le produit augmente l’acétylcholine synaptique.", "Il ne bloque pas l’acétylcholinestérase."),
          F("Une dose unique convient à toutes les profondeurs.", "La quantité doit couvrir la charge de rocuronium disponible.")
        ]
      ),
      qcm(
        "Comment choisir la dose de sugammadex ?",
        src("b00099", "b00102"),
        "Le monitorage distingue bloc modéré, profond et antagonisation immédiate, correspondant respectivement à 2, 4 et 8–16 mg/kg.",
        [
          T("Deux réponses au Td4 orientent vers 2 mg/kg.", "Ce niveau correspond à un bloc modéré."),
          T("Un bloc profond objectivé par le comptage post-tétanique impose 4 mg/kg.", "Le rocuronium encore fixé sur les récepteurs y demeure beaucoup plus abondant."),
          T("Une décurarisation immédiate après forte dose requiert 8 à 16 mg/kg.", "La quantité injectée doit encapsuler une charge maximale."),
          F("La profondeur n’a aucune influence sur la dose.", "Un sous-dosage expose à une reprise du bloc."),
          F("Le poids n’entre jamais dans le calcul.", "Les recommandations sont exprimées en mg/kg.")
        ]
      ),
      qcm(
        "Quelles vérifications restent nécessaires après un antagoniste ?",
        src("b00102", "b00104", "b00109", "b00113"),
        "L’antagonisation ne dispense ni de surveiller la ventilation ni de confirmer T4/T1 ≥0,9 avant l’extubation.",
        [
          F("Un rapport T4/T1 estimé au toucher suffit après l’antagoniste.", "L’évaluation tactile manque de sensibilité ; une mesure quantitative doit confirmer un rapport au moins égal à 0,9."),
          F("La reprise de la ventilation autorise l’arrêt immédiat de toute surveillance.", "Le diaphragme peut récupérer avant le pharynx et une recurarisation reste possible après sous-dosage."),
          T("Rechercher une recurarisation après sous-dosage.", "Du rocuronium libre peut redevenir disponible."),
          T("Tenir compte d’une insuffisance rénale terminale avec sugammadex.", "L’élimination du complexe dépend du rein."),
          F("Extuber dès que trois réponses sont visibles.", "Le compte ne garantit pas un rapport supérieur à 0,9.")
        ]
      ),
    ],
  },
];

const DP_QCM_SERIES = [
  {
    label: "DP QCM 1 · Occlusion et séquence rapide",
    vignette:
      "Un homme de 62 ans est opéré en urgence d’une occlusion digestive. Il a vomi une heure auparavant, sans maladie neuromusculaire connue. Il est conscient, dyspnéique en décubitus et sa pression artérielle est stable. L’équipe prépare une induction en séquence rapide avec préoxygénation, aspiration fonctionnelle et ventilateur contrôlé.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quels objectifs pharmacologiques doivent être simultanément assurés pendant l’induction ?",
        src("b00003", "b00049"),
        "La séquence rapide associe hypnose, analgésie adaptée et relâchement sans confondre les fonctions de chaque agent.",
        [
          T("Obtenir une perte de conscience par hypnotique.", "Le curare ne produit aucune hypnose."),
          T("Prévenir la douleur par une stratégie analgésique.", "L’immobilité n’est pas une analgésie."),
          T("Créer rapidement de bonnes conditions d’intubation.", "Le bloc facilite la laryngoscopie en supprimant la contraction laryngée."),
          T("Vérifier une hypnose effective avant l’injection du curare.", "La paralysie abolit le mouvement sans protéger de la conscience ni de la mémorisation."),
          T("Préparer ventilation et aspiration avant le curare.", "L’apnée et le risque d’inhalation sont prévisibles.")
        ]
      ),
      qcm(
        "Quel choix est cohérent pour le curare d’intubation ?",
        src("b00034", "b00049", "b00110"),
        "La succinylcholine offre la cinétique de référence ; le rocuronium à forte dose constitue l’alternative non dépolarisante.",
        [
          T("Succinylcholine 1 mg/kg de masse réelle.", "Cette dose fournit un bloc profond en moins d’une minute."),
          T("Rocuronium 0,9 à 1,2 mg/kg de masse idéale.", "La dose élevée raccourcit son délai."),
          F("Atracurium en microdose pour obtenir le délai le plus court.", "Son installation ne reproduit pas la séquence rapide."),
          T("La succinylcholine reste envisageable en l’absence de contre-indication identifiée.", "Sa cinétique rapide et brève convient à la séquence rapide lorsque le terrain ne comporte pas de risque spécifique."),
          T("Choisir après recherche des contre-indications à la succinylcholine.", "Le bénéfice cinétique ne supprime pas les risques du terrain.")
        ],
        "Le bilan préinduction montre une kaliémie normale et aucun antécédent d’hyperthermie maligne."
      ),
      qcm(
        "Quels signes de monitorage sont attendus juste après succinylcholine ?",
        src("b00039", "b00041", "b00042", "b00043"),
        "La phase I débute par une excitation possible puis abaisse les réponses sans fatigue relative ni facilitation post-tétanique.",
        [
          T("Des fasciculations brèves peuvent précéder l’immobilité.", "L’agonisme nicotinique excite d’abord les fibres."),
          T("Les réponses du Td4 diminuent de façon comparable.", "Le bloc dépolarisant pur ne produit pas de fade."),
          F("Une fatigue marquée de T4 est obligatoire.", "Ce motif évoquerait un bloc compétitif."),
          F("Une facilitation post-tétanique doit être constante.", "Elle est absente pendant la phase I du bloc dépolarisant."),
          T("La néostigmine risquerait de majorer ce bloc.", "Davantage d’acétylcholine entretient la dépolarisation.")
        ],
        "Après injection, des fasciculations apparaissent puis toute réponse motrice devient faible."
      ),
      qcm(
        "Comment interpréter cette évolution et que faire ?",
        src("b00038", "b00045", "b00048", "b00110"),
        "Une durée très supérieure à 15 minutes évoque une hydrolyse plasmatique déficiente ; le traitement est ventilatoire et sédatif jusqu’au retour.",
        [
          F("Attribuer l’apnée prolongée à la seule persistance de l’effet hypnotique.", "L’absence de récupération motrice après une dose unique de succinylcholine oriente vers un bloc neuromusculaire anormalement prolongé."),
          T("Poursuivre la ventilation contrôlée.", "Le diaphragme reste pharmacologiquement paralysé."),
          F("Interrompre la sédation alors que la paralysie persiste.", "Le patient doit rester inconscient et ventilé jusqu’au retour effectif de la transmission neuromusculaire."),
          T("Poursuivre une sédation adaptée jusqu’au retour de la transmission.", "L’apnée pharmacologique peut durer plusieurs heures sans altérer la conscience, ce qui impose de maintenir l’hypnose."),
          F("Extuber car la chirurgie est terminée.", "L’absence de récupération rendrait l’extubation dangereuse.")
        ],
        "Quarante minutes plus tard, aucune ventilation spontanée efficace n’est revenue et aucune dose supplémentaire n’a été donnée."
      ),
      qcm(
        "Quelles données renforcent l’hypothèse enzymatique ?",
        src("b00038", "b00045", "b00048"),
        "Une exposition isolée, une durée normalement brève et une stabilité par ailleurs correcte rendent le défaut de métabolisme plausible.",
        [
          T("La dose unique était standard.", "Une accumulation posologique est exclue."),
          T("La température et le pH sont normaux.", "Une cause physiologique majeure de prolongation est moins probable."),
          F("L’administration concomitante d’un non-dépolarisant de longue durée.", "Une seconde molécule fournirait une autre explication au bloc prolongé et affaiblirait l’hypothèse enzymatique isolée."),
          F("Une réponse immédiate à la néostigmine serait attendue.", "L’inhibiteur peut aggraver la phase dépolarisante."),
          F("Une demi-vie normale de rocuronium expliquerait ce cas.", "Aucun rocuronium n’a été administré.")
        ],
        "Le dossier confirme une dose unique, une normothermie et l’absence de tout autre curare."
      ),
      qcm(
        "Quels critères autorisent finalement l’extubation ?",
        src("b00085", "b00090", "b00113"),
        "La reprise clinique doit être complétée par une mesure quantitative montrant un rapport T4/T1 au moins égal à 0,9.",
        [
          T("Quatre réponses sont présentes.", "Le compte confirme une récupération avancée."),
          T("Le rapport T4/T1 atteint au moins 0,9.", "Cette cible exclut le bloc résiduel défini."),
          T("La ventilation est régulière et efficace.", "Le support peut être levé après confirmation fonctionnelle."),
          T("Une toux vigoureuse accompagne la récupération motrice.", "Le retour d’une force respiratoire et pharyngée efficace complète le critère quantitatif avant le retrait de la sonde."),
          T("Aucune fatigabilité respiratoire n’apparaît après la reprise ventilatoire.", "Une ventilation durablement efficace concorde avec la levée du bloc objectivée par T4/T1.")
        ],
        "Après poursuite du support, les quatre réponses réapparaissent et le patient recommence à ventiler."
      ),
      qcm(
        "Quelles informations doivent être transmises au patient ?",
        src("b00045", "b00048", "b00104"),
        "L’apnée prolongée doit être documentée comme suspicion de déficit enzymatique afin d’éviter une nouvelle exposition non anticipée.",
        [
          T("La probable anomalie de métabolisme de la succinylcholine.", "Elle explique l’effet anormalement long."),
          F("L’assurance qu’une nouvelle dose de succinylcholine serait sans risque.", "Une nouvelle exposition pourrait reproduire une apnée prolongée tant que l’anomalie enzymatique reste possible."),
          T("Le fait que la paralysie n’était pas une allergie par elle-même.", "Le mécanisme observé est pharmacocinétique."),
          T("Le risque d’une nouvelle apnée prolongée avec la succinylcholine.", "La même dépendance à la butyrylcholinestérase expose à une récidive lors d’une réadministration."),
          T("L’intérêt d’une exploration spécialisée de la butyrylcholinestérase.", "La confirmation d’un déficit quantitatif ou qualitatif permet d’adapter les anesthésies ultérieures.")
        ],
        "Le rapport T4/T1 atteint 0,94 et l’extubation se déroule sans incident."
      ),
    ],
  },
  {
    label: "DP QCM 2 · Brûlé en urgence respiratoire",
    vignette:
      "Un patient de 35 ans, brûlé sur 45 % de la surface corporelle depuis trois semaines, développe une détresse respiratoire nécessitant une intubation. Il est hospitalisé en réanimation, présente une faiblesse acquise et reçoit une oxygénothérapie à haut débit devenue insuffisante. Une induction urgente est décidée avec contrôle immédiat des voies aériennes.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles précautions dominent avant le choix du curare ?",
        src("b00003", "b00044", "b00046"),
        "Le terrain brûlé expose à une réponse hyperkaliémique à la succinylcholine et impose une stratégie ventilatoire préparée.",
        [
          F("Une kaliémie normale autorise la succinylcholine malgré la brûlure évoluée.", "La prolifération extrasynaptique peut provoquer une sortie massive de potassium même si la valeur initiale est normale."),
          F("Une brûlure datant de trois semaines ne modifie plus la réponse potassique.", "À ce délai, le remodelage des récepteurs musculaires rend justement la succinylcholine dangereuse."),
          T("Préparer une ventilation immédiate.", "Tout curare peut abolir les efforts respiratoires."),
          F("Renoncer à toute sédation.", "L’intubation paralysée exige une hypnose."),
          F("Choisir la molécule selon son effet antalgique.", "Aucun curare ne traite la douleur liée à la procédure.")
        ]
      ),
      qcm(
        "Quel schéma d’intubation est approprié ?",
        src("b00034", "b00065", "b00066"),
        "Le rocuronium à dose de séquence rapide évite le mécanisme hyperkaliémique tout en offrant une installation accélérée.",
        [
          F("Rocuronium 0,3 mg/kg pour obtenir un bloc profond en moins d’une minute.", "Cette faible dose n’offre pas la vitesse d’installation recherchée ; la séquence rapide utilise environ 0,9 à 1,2 mg/kg de masse idéale."),
          F("Succinylcholine 1 mg/kg malgré la brûlure.", "Le terrain constitue une contre-indication hyperkaliémique."),
          T("Monitorer le bloc dès l’induction.", "La réponse individuelle reste imprévisible."),
          F("Précurariser avec une petite dose de succinylcholine.", "Une moindre dose n’annule pas la sortie de potassium."),
          T("Disposer d’un plan d’antagonisation par sugammadex.", "Le rocuronium peut être encapsulé si nécessaire.")
        ],
        "La kaliémie est à 4,6 mmol/L, mais la brûlure date de vingt et un jours."
      ),
      qcm(
        "Comment interpréter le train-de-quatre après le bolus ?",
        src("b00054", "b00058", "b00088", "b00090"),
        "Le fade avec deux réponses confirme un bloc compétitif modéré à profond induit par rocuronium.",
        [
          F("Deux réponses correspondent à une récupération presque complète.", "L’absence de T3 et T4 témoigne encore d’un bloc significatif et ne permet pas de conclure à une récupération avancée."),
          T("Le profil est compatible avec un non-dépolarisant.", "La fatigue différencie ce bloc de la phase I."),
          F("L’absence de fasciculations exclut l’efficacité.", "Elle est précisément attendue avec rocuronium."),
          T("Le compte de deux réponses qualifie la profondeur même sans calcul de T4/T1.", "Lorsque T4 est absente, le nombre de contractions visibles reste l’indicateur utilisable pour guider la conduite."),
          T("Un complément doit dépendre du besoin clinique et du monitorage.", "La dose ne se répète pas automatiquement.")
        ],
        "Deux réponses décroissantes sont observées au Td4 après l’intubation."
      ),
      qcm(
        "Quels objectifs guident l’entretien en réanimation ?",
        src("b00078", "b00079", "b00109"),
        "L’entretien vise la synchronisation utile avec la dose minimale, réévaluée objectivement afin de limiter l’accumulation.",
        [
          T("Définir une profondeur cible liée à la ventilation.", "Un bloc maximal permanent n’est pas toujours nécessaire."),
          T("Réévaluer régulièrement le nombre de réponses.", "La variabilité évolue dans le temps."),
          T("Réduire la perfusion si l’effet s’accumule.", "La charge corporelle augmente lors d’une exposition prolongée."),
          T("Surveiller la fonction hépatobiliaire pendant l’exposition prolongée.", "Une cholestase peut ralentir la clairance du rocuronium et favoriser son accumulation."),
          T("Poursuivre hypnose et analgésie indépendamment du niveau de bloc.", "Le curare facilite la ventilation sans produire ni perte de conscience ni traitement de la douleur.")
        ],
        "Un SDRA sévère impose finalement une perfusion de curare pendant quarante-huit heures."
      ),
      qcm(
        "Quels facteurs peuvent expliquer une récupération lente ?",
        src("b00076", "b00077", "b00078", "b00079"),
        "L’exposition prolongée et l’atteinte hépatobiliaire maintiennent la concentration de rocuronium au-dessus du seuil d’effet.",
        [
          F("Une perfusion de quarante-huit heures exclut toute accumulation.", "Une exposition prolongée augmente la charge corporelle et peut retarder la récupération."),
          T("Une cholestase apparue en réanimation.", "La voie biliaire participe à l’élimination."),
          F("Des bolus rapprochés accélèrent la clairance hépatobiliaire du rocuronium.", "Les compléments augmentent la charge à éliminer et ne stimulent pas la voie biliaire."),
          F("Une réaction de Hofmann trop rapide.", "Le rocuronium n’est pas dégradé par cette voie."),
          F("Une butyrylcholinestérase basse.", "Cette enzyme concerne la succinylcholine.")
        ],
        "À l’arrêt de la perfusion, le patient présente une cholestase et ne récupère que lentement ses réponses."
      ),
      qcm(
        "Quelle antagonisation est cohérente à ce stade ?",
        src("b00093", "b00099", "b00102"),
        "Deux réponses au Td4 après rocuronium correspondent à une décurarisation par sugammadex 2 mg/kg.",
        [
          T("Administrer 2 mg/kg de sugammadex.", "Le bloc est modéré avec deux réponses."),
          F("Choisir 4 mg/kg de néostigmine.", "Cette dose n’est pas une posologie de néostigmine et un bloc profond dépasserait son plafond."),
          F("Utiliser l’atropine seule.", "Elle n’augmente pas la transmission nicotinique."),
          T("Contrôler ensuite le rapport T4/T1.", "L’efficacité de l’antagonisation doit être objectivée par une nouvelle mesure."),
          F("Injecter du sugammadex sans tenir compte du rein.", "Le complexe dépend de l’excrétion rénale.")
        ],
        "Après plusieurs heures, deux réponses réapparaissent au train-de-quatre et la fonction rénale reste normale."
      ),
      qcm(
        "Quels éléments confirment une récupération sûre ?",
        src("b00090", "b00104", "b00113"),
        "La force ventilatoire doit s’accompagner d’un rapport quantitatif supérieur au seuil de bloc résiduel.",
        [
          T("Rapport T4/T1 à 0,93.", "La valeur dépasse 0,9 et exclut la définition du bloc résiduel."),
          T("Absence de fatigue mesurable.", "Les quatre réponses ont retrouvé une amplitude comparable."),
          T("Ventilation spontanée soutenue.", "La récupération respiratoire est cliniquement utile."),
          T("Un rapport quantitatif reste stable au-dessus de 0,9.", "Le maintien de la valeur au-delà du seuil réduit la probabilité d’un bloc résiduel ou d’une recurarisation."),
          T("Une toux vigoureuse accompagne le retour de quatre réponses.", "La force clinique des muscles respiratoires et pharyngés concorde alors avec la récupération mesurée.")
        ],
        "Trente minutes plus tard, le patient ventile et le rapport mesuré atteint 0,93."
      ),
    ],
  },
  {
    label: "DP QCM 3 · Curarisation chez un insuffisant hépatique",
    vignette:
      "Une femme de 58 ans atteinte de cirrhose doit subir une chirurgie abdominale de trois heures. La fonction rénale est conservée. Son bilan montre une cholestase modérée, sans encéphalopathie, et l’intubation ne présente pas de critère de difficulté. Le chirurgien souhaite un relâchement stable, tandis que l’anesthésiste veut limiter la dépendance aux organes d’élimination.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quels critères doivent orienter le choix du curare ?",
        src("b00063", "b00069", "b00071", "b00074", "b00077"),
        "Le terrain organique, la durée, le besoin d’intubation et les voies de dégradation sont plus utiles qu’une habitude fixe.",
        [
          T("La dépendance hépatobiliaire de l’élimination.", "La cirrhose peut ralentir certaines molécules."),
          T("La durée opératoire prévue.", "Elle conditionne le risque d’accumulation."),
          T("Le délai souhaité pour l’intubation.", "Les agents diffèrent par leur installation."),
          F("La capacité du curare à hypnotiser.", "Aucun bloqueur neuromusculaire ne possède cet effet hypnotique central."),
          T("La possibilité d’un monitorage quantitatif.", "Elle permet d’individualiser l’administration.")
        ]
      ),
      qcm(
        "Quel choix limite la dépendance hépatique ?",
        src("b00074", "b00075"),
        "Le cisatracurium conserve une dégradation de type Hofmann et limite l’histaminolibération par rapport au mélange atracurium.",
        [
          F("Privilégier le rocuronium malgré la cholestase pour éviter toute élimination biliaire.", "Le rocuronium dépend précisément en partie de la voie hépatobiliaire, qui peut être ralentie sur ce terrain."),
          T("Titrer la dose au monitorage.", "Même une cinétique favorable varie entre patients."),
          T("La dégradation de Hofmann du cisatracurium réduit la dépendance biliaire.", "Cette réaction spontanée rend son élimination moins tributaire de la fonction hépatique."),
          T("Choisir le cisatracurium pour sa cinétique largement organo-indépendante.", "Ce profil convient à une chirurgie prolongée chez une patiente présentant une cholestase."),
          T("Conserver une ventilation contrôlée pendant le bloc.", "La paralysie respiratoire reste complète quelle que soit la molécule.")
        ],
        "La chirurgie ne nécessite pas de séquence rapide et l’équipe souhaite éviter une élimination biliaire dominante."
      ),
      qcm(
        "Quelles propriétés expliquent ce choix ?",
        src("b00074", "b00075"),
        "Le cisatracurium est l’isomère puissant, moins histaminolibérateur, d’un mélange dégradé par des voies non strictement organiques.",
        [
          T("Il dérive de l’atracurium.", "Il en représente un isomère sélectionné."),
          T("Sa puissance réduit la masse administrée.", "Une quantité moindre suffit pour le même bloc."),
          T("Il provoque moins d’histaminolibération usuelle.", "La sélection de cet isomère a nettement réduit ce profil histaminique."),
          T("La réaction de Hofmann participe à son élimination.", "La dégradation spontanée contribue à la faible dépendance du cisatracurium envers les fonctions hépatique et rénale."),
          T("Sa faible histaminolibération favorise la stabilité tensionnelle observée.", "La sélection de cet isomère réduit les manifestations vasodilatatrices par rapport au mélange d’atracurium.")
        ],
        "Le cisatracurium est injecté et la pression artérielle reste stable."
      ),
      qcm(
        "Comment guider les bolus d’entretien ?",
        src("b00085", "b00088", "b00090", "b00109"),
        "Le train-de-quatre indique si la profondeur correspond encore à l’objectif chirurgical et évite un redosage calendaire.",
        [
          F("Programmer les bolus à intervalles fixes sans tenir compte du train-de-quatre.", "La variabilité de récupération interdit un redosage purement calendaire."),
          F("Ajouter un complément dès qu’une seule contraction est absente, quel que soit l’objectif.", "Le compte doit être interprété selon la profondeur réellement nécessaire au geste chirurgical."),
          T("Éviter de répéter une dose si le bloc est déjà suffisant.", "L’accumulation inutile prolongerait le réveil."),
          F("Utiliser la pression artérielle comme seule mesure du bloc.", "L’hémodynamique ne quantifie pas la transmission."),
          F("Attendre une réaction motrice opératoire avant chaque contrôle.", "Le monitorage permet d’anticiper la récupération.")
        ],
        "Après quatre-vingt-dix minutes, le chirurgien demande encore un relâchement profond."
      ),
      qcm(
        "Quelle stratégie de décurarisation est possible ?",
        src("b00092", "b00114"),
        "Avec quatre réponses, la néostigmine peut antagoniser le cisatracurium à condition d’être associée à une protection muscarinique.",
        [
          F("Administrer 0,2 mg/kg de néostigmine pour dépasser son effet plafond.", "Une dose aussi élevée augmente les effets muscariniques sans procurer un antagonisme neuromusculaire illimité."),
          T("Associer atropine ou glycopyrrolate.", "Les effets muscariniques doivent être prévenus."),
          F("Sugammadex 2 mg/kg.", "Le cisatracurium n’est pas encapsulé."),
          T("La présence de quatre réponses rend le bloc accessible à la néostigmine.", "La récupération spontanée est alors suffisante pour que l’augmentation d’acétylcholine surmonte la compétition."),
          T("Continuer le monitorage après l’injection.", "L’antagonisation doit atteindre la cible objective.")
        ],
        "En fin d’intervention, quatre réponses sont visibles avec une fatigue nette."
      ),
      qcm(
        "Quels effets indésirables de néostigmine faut-il prévenir ?",
        src("b00092", "b00114"),
        "L’excès cholinergique muscarinique peut ralentir le cœur et stimuler les sécrétions, d’où l’association antimuscarinique.",
        [
          T("Bradycardie.", "Le nœud sinusal subit la stimulation vagale."),
          T("Hypersécrétions.", "Les glandes répondent aux récepteurs muscariniques."),
          F("Hyperkaliémie par prolifération nicotinique.", "Ce mécanisme appartient à la succinylcholine."),
          T("Une bronchoconstriction par stimulation muscarinique.", "L’excès d’acétylcholine peut contracter le muscle lisse bronchique en l’absence de protection antimuscarinique."),
          T("Effet plafond en cas de bloc trop profond.", "Augmenter au-delà de 0,05 mg/kg n’apporte pas un antagonisme illimité.")
        ],
        "La fréquence cardiaque est à 54/min avant l’antagonisation."
      ),
      qcm(
        "Quelle donnée permet l’extubation ?",
        src("b00090", "b00113"),
        "Une récupération à T4/T1 ≥0,9 complète les critères cliniques et réduit le risque pharyngé postopératoire.",
        [
          F("Un rapport quantitatif à 0,81 malgré une respiration régulière.", "La ventilation peut reprendre avant la force pharyngée ; une valeur inférieure à 0,9 définit encore un bloc résiduel."),
          T("Quatre réponses de force presque égale.", "L’absence de fade accompagne la mesure correcte."),
          F("Un rapport estimé à 0,6 au toucher.", "La fatigue reste importante et le toucher manque de précision."),
          F("La seule ouverture des yeux.", "Elle évalue l’éveil, pas la jonction."),
          T("Une ventilation efficace après levée du support.", "La fonction clinique doit correspondre au résultat moteur.")
        ],
        "Après traitement, le rapport T4/T1 est mesuré à 0,91 et la ventilation spontanée est satisfaisante."
      ),
    ],
  },
  {
    label: "DP QCM 4 · Hyperthermie maligne familiale",
    vignette:
      "Un homme de 29 ans doit être opéré d’une fracture. Sa sœur a présenté une hyperthermie maligne confirmée pendant une anesthésie. Le patient n’a jamais reçu d’anesthésique général, sa kaliémie est normale et il n’a aucune faiblesse musculaire. L’intervention doit débuter rapidement, mais l’équipe dispose d’un moniteur neuromusculaire quantitatif et d’un support ventilatoire complet.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles conséquences cet antécédent a-t-il sur la curarisation ?",
        src("b00044", "b00046", "b00066"),
        "La succinylcholine doit être évitée ; un non-dépolarisant n’expose pas au même déclenchement musculaire.",
        [
          F("Considérer l’absence d’antécédent personnel comme une preuve d’absence de susceptibilité.", "Une première anesthésie peut révéler la maladie ; l’antécédent familial suffit à imposer les précautions."),
          T("Exclure la succinylcholine.", "La succinylcholine est un déclencheur reconnu de la crise familiale."),
          T("Un rocuronium peut être envisagé.", "Les non-dépolarisants n’ont pas cet effet musculaire."),
          F("Interdire tous les curares sans distinction.", "Le risque n’est pas partagé par leur mécanisme entier."),
          F("Utiliser la succinylcholine si la kaliémie est normale.", "La susceptibilité thermique persiste indépendamment du potassium.")
        ]
      ),
      qcm(
        "Quel agent convient pour une intubation rapide ?",
        src("b00034", "b00065", "b00066"),
        "Le rocuronium à dose élevée fournit une alternative rapide sans activation dépolarisante de la plaque.",
        [
          T("Pour cette induction sans succinylcholine, rocuronium 0,9 à 1,2 mg/kg idéal.", "Cette posologie réduit le délai d’installation."),
          F("Une dose de succinylcholine calculée sur la masse réelle.", "Le terrain familial contre-indique ce déclencheur musculaire."),
          T("Prévoir un monitorage objectif.", "La forte dose peut prolonger le bloc."),
          T("Anticiper le sugammadex si une levée urgente est nécessaire.", "L’antagoniste est spécifique du rocuronium."),
          T("Le rocuronium évite le mécanisme déclencheur propre à la succinylcholine.", "Ce non-dépolarisant n’active pas durablement la plaque motrice et constitue une alternative sur ce terrain familial.")
        ],
        "La fracture nécessite une induction urgente, sans estomac plein mais avec immobilisation douloureuse."
      ),
      qcm(
        "Comment expliquer le profil observé ?",
        src("b00054", "b00057", "b00058", "b00059"),
        "Le rocuronium produit un bloc compétitif sans fasciculation, avec fade et facilitation post-tétanique.",
        [
          T("L’absence de fasciculation est attendue.", "Le canal nicotinique n’est pas ouvert."),
          F("Une fatigue au Td4 indique ici une phase I dépolarisante.", "La phase I de succinylcholine conserve des réponses proportionnelles, tandis que le fade observé caractérise le bloc non dépolarisant."),
          F("Une facilitation post-tétanique exclut un bloc compétitif.", "L’augmentation transitoire de libération d’acétylcholine après un tétanos est justement compatible avec ce mécanisme."),
          F("L’absence de fasciculation prouve que la plaque motrice n’a pas été bloquée.", "Un non-dépolarisant peut abolir la transmission sans contraction préalable visible."),
          F("Le curare agit en stimulant durablement le muscle.", "Il empêche l’activation du récepteur.")
        ],
        "Après rocuronium, aucune fasciculation n’a été vue et les réponses répétées s’épuisent."
      ),
      qcm(
        "Quelle conduite adopter si l’intervention s’achève très tôt ?",
        src("b00093", "b00099", "b00102"),
        "Une antagonisation immédiate d’une forte dose récente de rocuronium requiert une dose élevée de sugammadex guidée par le contexte et le monitorage.",
        [
          T("Envisager 8 à 16 mg/kg de sugammadex.", "La charge de rocuronium est encore maximale."),
          F("Donner 2 mg/kg quel que soit le bloc.", "Cette dose correspond à deux réponses au Td4."),
          T("Maintenir une hypnose suffisante jusqu’au retour de la motricité.", "L’interruption de la chirurgie ne supprime ni la conscience ni le risque de mémorisation pendant la paralysie."),
          T("Maintenir la ventilation jusqu’à récupération mesurée.", "L’antagoniste n’autorise pas une extubation instantanée non contrôlée."),
          T("Tenir compte de la fonction rénale.", "Le complexe est éliminé par le rein.")
        ],
        "Une complication technique impose d’arrêter l’intervention cinq minutes après le bolus d’intubation."
      ),
      qcm(
        "Pourquoi le monitorage reste-t-il indispensable ?",
        src("b00102", "b00109", "b00113"),
        "La mesure vérifie l’efficacité réelle du sugammadex, détecte un sous-dosage et établit la cible d’extubation.",
        [
          T("Confirmer le retour de quatre réponses.", "Le compte montre la progression de la récupération."),
          T("Mesurer T4/T1 plutôt que se fier au toucher.", "Un bloc léger est difficile à percevoir manuellement."),
          T("Repérer une recurarisation.", "Du rocuronium libre peut réoccuper les récepteurs."),
          T("Vérifier que le rapport T4/T1 franchit 0,9 avant l’extubation.", "Ce seuil objectif confirme une récupération suffisante des muscles respiratoires et pharyngés."),
          T("Documenter la valeur atteinte dans le dossier d’anesthésie.", "La traçabilité du rapport final justifie la décision d’extubation et éclaire les anesthésies ultérieures.")
        ],
        "Le rapport augmente rapidement après la dose de sugammadex."
      ),
      qcm(
        "Quelles conclusions tirer avant l’extubation ?",
        src("b00090", "b00113"),
        "Seule une valeur durablement supérieure à 0,9 mesurée à l’adducteur du pouce autorise l’extubation ; le site proximal, l’examen clinique isolé et la mesure unique exposent tous à méconnaître un reliquat.",
        [
          F("Un rapport T4/T1 à 0,75 suffit si le patient ouvre les yeux.", "L’éveil ne compense pas une valeur nettement inférieure à 0,9 ni la faiblesse pharyngée associée."),
          F("Une valeur à 0,96 dispense d’évaluer la force de la toux.", "Le chiffre instrumental complète l’examen clinique des voies aériennes mais ne le remplace pas."),
          F("Un rapport supérieur à 0,9 obtenu au sourcilier valide l’extubation.", "Ce site surestime la récupération ; la référence demeure l’adducteur du pouce."),
          F("Ce résultat écarte définitivement une recurarisation en salle de surveillance.", "Une réapparition du bloc reste possible, notamment après une antagonisation insuffisante."),
          T("La stabilité du rapport lors d’une mesure répétée.", "Une valeur durablement supérieure à 0,9 réduit le risque d’une faiblesse secondaire.")
        ],
        "Dix minutes plus tard, quatre réponses égales donnent un rapport à 0,96."
      ),
      qcm(
        "Quelles informations doivent figurer dans le dossier ?",
        src("b00044", "b00046", "b00104"),
        "La susceptibilité familiale, l’évitement de la succinylcholine et la stratégie utilisée doivent être clairement transmissibles.",
        [
          T("La susceptibilité familiale à l’hyperthermie maligne doit rester signalée.", "L’absence d’épisode chez ce patient n’efface pas le risque héréditaire lors d’une anesthésie future."),
          T("Le rocuronium et la dose administrée.", "La traçabilité explique la durée et l’antagonisation."),
          T("La dose de sugammadex et le rapport final.", "Ces données documentent la récupération."),
          T("La consigne explicite d’éviter la succinylcholine.", "Cette information empêche une exposition ultérieure à un déclencheur de l’hyperthermie maligne."),
          F("Un rapport final normal prouve que la succinylcholine sera sans danger à l’avenir.", "La récupération après rocuronium ne renseigne pas sur la susceptibilité aux agents déclencheurs de l’hyperthermie maligne.")
        ],
        "Le patient quitte la SSPI sans symptôme et demande les précautions pour une future opération."
      ),
    ],
  },
  {
    label: "DP QCM 5 · Anaphylaxie après induction",
    vignette:
      "Une femme de 46 ans reçoit propofol, morphinique et rocuronium pour une chirurgie programmée. Deux minutes plus tard surviennent hypotension, bronchospasme et érythème. Elle est intubée, ventilée et profondément curarisée ; aucun antibiotique n’a encore été administré. La chirurgie est suspendue pendant le traitement du choc et l’équipe conserve les horaires précis de chaque injection.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles interprétations initiales sont compatibles ?",
        src("b00081", "b00082", "b00083", "b00112"),
        "Le tableau temporel évoque une réaction immédiate sévère ; tout curare peut être allergène malgré la rareté globale.",
        [
          T("Une anaphylaxie IgE-dépendante au curare est possible.", "Le rocuronium appartient aux agents impliqués."),
          F("Attribuer d’emblée le choc au propofol sans analyser les autres injections.", "Plusieurs produits ont été administrés presque simultanément et aucun ne peut être désigné sur la seule chronologie globale."),
          F("La structure stéroïdienne exclut l’allergie.", "Toutes les classes peuvent déclencher une réaction."),
          T("Le bronchospasme associé à l’hypotension traduit une réaction systémique sévère.", "L’atteinte simultanée respiratoire et circulatoire deux minutes après l’induction est compatible avec une anaphylaxie."),
          T("La chronologie immédiate renforce une cause administrée à l’induction.", "Les signes suivent de très près l’exposition.")
        ]
      ),
      qcm(
        "Quelles distinctions pharmacologiques faut-il garder ?",
        src("b00075", "b00080", "b00081"),
        "L’histaminolibération non immune est surtout décrite avec les benzylisoquinolines, tandis qu’une anaphylaxie peut impliquer le rocuronium.",
        [
          F("Une histaminolibération directe prouve une sensibilisation IgE préalable.", "Cette réaction pharmacologique peut survenir sans anticorps spécifiques ni exposition sensibilisante connue."),
          F("La structure aminostéroïde du rocuronium exclut une anaphylaxie.", "Les réactions immunes concernent aussi les curares aminostéroïdes."),
          F("Tout érythème après curare est forcément non immunitaire.", "Les signes cutanés se rencontrent dans l’anaphylaxie."),
          F("Le cisatracurium garantit l’absence d’allergie future.", "Il réduit surtout l’histamine non spécifique."),
          T("L’enquête devra considérer chaque agent administré.", "La chronologie seule ne désigne pas définitivement le responsable.")
        ],
        "L’équipe se demande si la réaction peut être une simple histaminolibération."
      ),
      qcm(
        "Quelles mesures concernant la curarisation sont prudentes ?",
        src("b00003", "b00085", "b00112"),
        "La sécurité immédiate prime, avec maintien ventilatoire et traçabilité exacte des expositions pour l’enquête ultérieure.",
        [
          F("Réadministrer une petite dose de rocuronium afin de confirmer le responsable.", "Une provocation pendant un choc suspect exposerait à une aggravation immédiate et n’a aucune place diagnostique."),
          T("Noter l’heure et la dose de chaque produit.", "La séquence d’exposition sera essentielle."),
          F("Retirer du dossier les produits jugés moins probables avant l’enquête.", "Tous les agents administrés doivent rester tracés afin que le bilan spécialisé ne soit pas biaisé."),
          T("Continuer à mesurer la profondeur du bloc.", "Le besoin de support dépend aussi du reliquat pharmacologique."),
          F("Réveiller la patiente sans ventilation car le curare traite le bronchospasme.", "Le bloc n’a aucun effet bronchodilatateur.")
        ],
        "La chirurgie est interrompue, mais le bloc neuromusculaire persiste."
      ),
      qcm(
        "Quelle option peut lever le bloc au rocuronium ?",
        src("b00093", "b00102"),
        "Le sugammadex encapsule le rocuronium ; sa dose reste fonction du niveau de bloc et non de la seule réaction allergique.",
        [
          T("Utiliser le sugammadex si une décurarisation rapide est souhaitée.", "La cible moléculaire est bien le rocuronium."),
          F("Choisir la dose de sugammadex uniquement sur la gravité du choc.", "La quantité nécessaire dépend du niveau du bloc au Td4 ou au compte post-tétanique, indépendamment de la sévérité hémodynamique."),
          F("Considérer le sugammadex comme traitement unique du choc.", "La levée du bloc ne remplace pas le traitement de l’anaphylaxie."),
          F("Attendre un effet de la néostigmine malgré l’absence de réponse au Td4.", "Son effet plafond ne permet pas de lever ce bloc profond avant une récupération spontanée plus avancée."),
          T("Poursuivre le support jusqu’à T4/T1 suffisant.", "L’encapsulation doit être confirmée fonctionnellement.")
        ],
        "La patiente est stabilisée, et une réponse post-tétanique apparaît sans réponse au Td4."
      ),
      qcm(
        "Quelle dose correspond à cette profondeur ?",
        src("b00099", "b00102"),
        "Une à deux réponses post-tétaniques définissent un bloc profond compatible avec 4 mg/kg de sugammadex.",
        [
          F("Sugammadex 16 mg/kg pour deux réponses post-tétaniques.", "Cette dose est réservée à la réversion immédiate après une forte dose récente de rocuronium ; 4 mg/kg correspond ici au bloc profond mesuré."),
          F("Limiter le sugammadex à 2 mg/kg malgré le bloc post-tétanique.", "Cette quantité est prévue lorsque deux réponses au Td4 existent."),
          F("Sugammadex 0,04 mg/kg.", "Cette valeur correspond à l’ordre de dose de néostigmine."),
          T("Réévaluer ensuite le rapport T4/T1.", "Le succès de l’encapsulation doit être mesuré par le rapport du Td4."),
          F("Ajouter de la succinylcholine pour accélérer la récupération.", "Un second bloc dépolarisant aggraverait la paralysie.")
        ],
        "Le compte post-tétanique montre deux réponses, la fonction rénale est normale."
      ),
      qcm(
        "Quels critères permettent la levée du support ventilatoire ?",
        src("b00090", "b00104", "b00113"),
        "La stabilité hémodynamique ne suffit pas : une récupération motrice quantitative et respiratoire est nécessaire.",
        [
          T("T4/T1 au moins égal à 0,9.", "Ce seuil définit la sortie du bloc résiduel."),
          T("Ventilation efficace sans fatigue.", "Le patient doit soutenir les échanges."),
          T("Voies aériennes jugées protectrices.", "La force pharyngée est essentielle après bronchospasme."),
          T("Absence d’obstruction pharyngée lors de la levée du support.", "La stabilité des voies aériennes complète le rapport quantitatif et la ventilation efficace."),
          F("Retour de T1 sans T4.", "Le bloc reste profond puisque la quatrième transmission demeure absente.")
        ],
        "Après traitement, l’hémodynamique se normalise et quatre réponses réapparaissent."
      ),
      qcm(
        "Quelles consignes sont pertinentes à distance ?",
        src("b00081", "b00083", "b00112"),
        "Un accident immédiat doit conduire à une enquête allergologique et à une documentation précise, sans conclure sur la seule apparence.",
        [
          T("Organiser une exploration allergologique spécialisée.", "Elle aidera à identifier l’agent et les alternatives."),
          F("Interdire définitivement tous les curares avant les tests spécialisés.", "L’enquête peut identifier des alternatives tolérées ; une éviction globale non documentée n’est pas justifiée."),
          F("Conclure à une simple histaminolibération parce que l’érythème a disparu rapidement.", "La régression cutanée ne permet pas d’écarter une anaphylaxie ayant associé hypotension et bronchospasme."),
          T("Expliquer que réaction immune et histaminolibération diffèrent.", "Les mécanismes n’ont pas la même portée ultérieure."),
          F("Affirmer que le risque est identique dans tous les pays.", "Les estimations montrent des variations géographiques.")
        ],
        "La patiente récupère avec un rapport à 0,95 et doit être adressée après sa sortie."
      ),
    ],
  },
  {
    label: "DP QCM 6 · Bloc résiduel en salle de réveil",
    vignette:
      "Un homme de 70 ans reçoit de l’atracurium pendant une colectomie. Il est extubé après reprise de la ventilation sans mesure quantitative. Dix minutes plus tard en salle de réveil, il se dit très faible, tousse mal et présente une obstruction pharyngée intermittente. L’équipe dispose maintenant d’un stimulateur quantitatif au nerf ulnaire.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quels risques persistent malgré la ventilation spontanée ?",
        src("b00090", "b00092", "b00113"),
        "Le diaphragme récupère avant les muscles pharyngés ; un bloc léger peut donc menacer les voies aériennes après extubation.",
        [
          F("Une ventilation spontanée garantit la protection des voies aériennes.", "Le diaphragme peut récupérer alors que les muscles pharyngés restent trop faibles pour maintenir leur perméabilité."),
          F("Le diaphragme est toujours le dernier muscle à récupérer.", "Sa récupération précède souvent celle des muscles des voies aériennes supérieures."),
          T("Un séjour prolongé en SSPI.", "Les complications respiratoires retardent la sortie."),
          T("Une inhalation liée à une déglutition inefficace.", "Le reliquat pharyngé altère la protection laryngée malgré la reprise ventilatoire."),
          F("Une protection certaine contre l’inhalation.", "La faiblesse pharyngée augmente au contraire ce risque.")
        ]
      ),
      qcm(
        "Quels éléments orientent vers une curarisation résiduelle ?",
        src("b00090", "b00113"),
        "La faiblesse postopératoire et le rapport inférieur à 0,9 établissent un reliquat neuromusculaire.",
        [
          F("Un rapport à 0,62 est compatible avec une récupération complète si le patient est éveillé.", "La conscience ne modifie pas le seuil quantitatif de 0,9 nécessaire à la récupération neuromusculaire."),
          T("Un rapport T4/T1 à 0,62.", "La valeur est très sous le seuil de 0,9 définissant la récupération complète."),
          T("Quatre réponses tactiles malgré le fade quantitatif.", "Le compte seul surestime la récupération."),
          T("La faiblesse de la toux concorde avec le rapport très abaissé.", "Ce signe clinique reflète l’atteinte des muscles respiratoires et pharyngés par le bloc résiduel."),
          T("Le délai écoulé depuis la dernière injection ne garantit pas à lui seul la récupération.", "Seule la mesure du rapport atteste la levée du bloc, quelle que soit la durée observée.")
        ],
        "En SSPI, il se plaint de faiblesse, tousse mal et son rapport T4/T1 est mesuré à 0,62."
      ),
      qcm(
        "Quelles mesures immédiates sont adaptées ?",
        src("b00003", "b00092", "b00113"),
        "Le patient doit être oxygéné, ventilé si nécessaire et antagonisé selon la profondeur sans attendre une aggravation.",
        [
          T("Assurer la perméabilité des voies aériennes.", "La faiblesse pharyngée peut rapidement obstruer."),
          T("Soutenir la ventilation si elle devient insuffisante.", "Le bloc touche les muscles respiratoires."),
          T("Réévaluer le Td4 avant de choisir un antagoniste.", "La profondeur conditionne l’efficacité."),
          T("Réinstaller immédiatement une oxygénation adaptée.", "L’hypoxémie impose une correction sans attendre l’effet d’une éventuelle antagonisation."),
          T("Maintenir le support ventilatoire jusqu’à récupération objective.", "La disparition du tirage ne suffit pas tant que le rapport quantitatif n’a pas dépassé 0,9.")
        ],
        "La saturation chute à 89 % avec tirage et ventilation superficielle."
      ),
      qcm(
        "Quelle décurarisation est possible avec l’atracurium ?",
        src("b00092", "b00102", "b00114"),
        "Le sugammadex est inefficace ; la néostigmine devient possible lorsque quatre réponses sont présentes, avec antimuscarinique.",
        [
          F("Administrer la néostigmine sans protection antimuscarinique.", "L’inhibition de l’acétylcholinestérase expose à la bradycardie et aux hypersécrétions en l’absence d’atropine ou de glycopyrrolate."),
          T("Associer du glycopyrrolate ou de l’atropine.", "Il faut prévenir les effets muscariniques."),
          F("Choisir 2 mg/kg de sugammadex pour neutraliser l’atracurium.", "L’atracurium n’entre pas dans la cavité moléculaire du sugammadex."),
          F("Dépasser fortement 0,05 mg/kg si la réponse est lente.", "L’effet plafond rend cette escalade inutile."),
          T("Garder un support respiratoire pendant l’action.", "La récupération n’est pas instantanée.")
        ],
        "Quatre réponses sont visibles, et l’atracurium est le seul curare reçu."
      ),
      qcm(
        "Quels effets de la néostigmine doivent être anticipés ?",
        src("b00092", "b00114"),
        "L’inhibition de l’acétylcholinestérase accroît l’activité muscarinique en même temps que la compétition nicotinique utile.",
        [
          T("Une bradycardie.", "L’acétylcholine stimule le cœur par voie vagale."),
          T("Une augmentation des sécrétions.", "Les glandes sont sensibles au signal muscarinique."),
          F("Une hyperthermie maligne.", "Ce n’est pas un déclencheur décrit de cette crise."),
          F("Une élimination rénale d’un complexe rocuronium.", "Ce mécanisme est propre au sugammadex."),
          T("Une efficacité limitée si le bloc était plus profond.", "Le plafond impose une récupération spontanée préalable.")
        ],
        "La fréquence cardiaque est à 58/min avant l’administration."
      ),
      qcm(
        "Quels résultats montrent l’efficacité de la prise en charge ?",
        src("b00088", "b00090", "b00113"),
        "La normalisation du rapport et des fonctions respiratoires confirme la sortie du bloc résiduel.",
        [
          T("T4/T1 passe à 0,92.", "La mesure dépasse la limite de 0,9."),
          T("La toux devient vigoureuse.", "La fonction respiratoire s’améliore parallèlement."),
          T("La saturation se normalise sans support invasif.", "Les échanges redeviennent efficaces."),
          T("L’obstruction pharyngée a disparu.", "Le retour du tonus des voies aériennes concorde avec la récupération quantitative et la toux efficace."),
          T("Le rapport reste supérieur à 0,9 lors d’un contrôle répété.", "La stabilité de la mesure écarte une faiblesse secondaire précoce.")
        ],
        "Après traitement et soutien, le rapport atteint 0,92 et la toux redevient efficace."
      ),
      qcm(
        "Comment prévenir une récidive de ce scénario ?",
        src("b00085", "b00109", "b00113"),
        "Une stratégie continue de monitorage, de dosage raisonné et de récupération objectivée doit remplacer l’extubation fondée sur des signes grossiers.",
        [
          F("Installer le monitorage seulement après l’extubation si une faiblesse apparaît.", "Une mesure initiée avant les doses d’entretien permet de prévenir le reliquat au lieu de le constater tardivement."),
          T("Éviter les bolus automatiques.", "Le besoin réel doit être mesuré avant toute nouvelle administration."),
          T("Antagoniser selon le compte du Td4.", "La profondeur détermine le moyen efficace."),
          T("Exiger T4/T1 ≥0,9 avant extubation.", "Cette cible quantitative réduit le risque de reliquat pharyngé postopératoire."),
          T("Former l’équipe à ne pas confondre reprise diaphragmatique et récupération pharyngée.", "La ventilation peut redevenir spontanée alors que la protection des voies aériennes reste insuffisante.")
        ],
        "Le dossier est revu lors de la réunion qualité du service."
      ),
    ],
  },
  {
    label: "DP QCM 7 · Insuffisance rénale terminale et rocuronium",
    vignette:
      "Une patiente dialysée doit subir une intervention abdominale. Un rocuronium a été utilisé pour l’intubation. La séance de dialyse a eu lieu la veille, la kaliémie est normale et la fonction hépatique est conservée. L’intervention n’est pas urgente, mais un relâchement modéré sera nécessaire pendant deux heures et l’équipe souhaite anticiper la stratégie de récupération.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles données doivent être anticipées ?",
        src("b00077", "b00093", "b00102"),
        "Le rocuronium est surtout hépatobiliaire, mais son antagoniste forme un complexe rénal dont l’usage est déconseillé au stade terminal.",
        [
          F("La dialyse de la veille rend inutile le suivi objectif du bloc.", "La séance ne supprime ni la variabilité du rocuronium ni la nécessité de mesurer la récupération."),
          F("Le complexe rocuronium–sugammadex est éliminé indépendamment du rein.", "Son excrétion est rénale, ce qui rend l’antagoniste problématique au stade terminal."),
          F("La dialyse rend la succinylcholine toujours sûre.", "La sécurité dépend notamment du potassium et du terrain musculaire."),
          T("Une récupération spontanée ou la néostigmine peut être discutée selon le Td4.", "L’alternative dépend de la profondeur."),
          F("Le rocuronium est dégradé par butyrylcholinestérase.", "Cette enzyme métabolise la succinylcholine.")
        ]
      ),
      qcm(
        "Comment gérer l’entretien du bloc ?",
        src("b00067", "b00069", "b00085"),
        "Les compléments sont titrés au besoin opératoire et à la réponse musculaire, non à une durée moyenne.",
        [
          T("Contrôler le compte avant chaque redose.", "Le seuil d’effet varie entre patients."),
          T("Employer la plus petite dose compatible avec la chirurgie.", "Moins de reliquat facilitera la récupération."),
          F("Injecter à heure fixe sans stimulation.", "La cinétique moyenne ne décrit pas cette patiente."),
          T("Maintenir hypnose et analgésie pendant toute paralysie mesurée.", "Un Td4 nul témoigne seulement du bloc moteur et ne protège ni de la conscience ni de la nociception."),
          T("Tracer toutes les doses et leurs horaires.", "La charge cumulée aide à anticiper la fin.")
        ],
        "Après l’intubation, la chirurgie se prolonge et un relâchement modéré suffit."
      ),
      qcm(
        "Quelle interprétation faire en fin d’intervention ?",
        src("b00088", "b00090"),
        "Quatre réponses avec fade indiquent un bloc superficiel mais encore incompatible avec une extubation sûre tant que T4/T1 reste sous 0,9.",
        [
          F("Quatre réponses visibles autorisent l’extubation sans mesurer leur rapport.", "Les contractions peuvent rester très inégales ; seule la quantification de T4/T1 détecte ce reliquat."),
          F("Une appréciation tactile suffit à certifier un rapport supérieur à 0,9.", "Le toucher ne perçoit pas de façon fiable les fades faibles mais cliniquement importants."),
          F("La présence de T4 impose 4 mg/kg de sugammadex.", "Cette dose correspond à un bloc post-tétanique profond."),
          F("Un fade exclut un bloc non dépolarisant.", "Il en constitue un signe caractéristique."),
          T("La néostigmine peut être envisagée si le rapport confirme un bloc superficiel.", "La présence des quatre réponses fournit la récupération spontanée préalable nécessaire à son action.")
        ],
        "Quatre réponses sont visibles, mais T4 reste nettement plus faible que T1."
      ),
      qcm(
        "Quelle stratégie respecte le terrain rénal ?",
        src("b00092", "b00102", "b00114"),
        "Chez cette patiente terminale, la néostigmine avec antimuscarinique est cohérente si quatre réponses existent ; le sugammadex est déconseillé.",
        [
          F("Attendre qu’il ne reste qu’une réponse au Td4 avant d’injecter la néostigmine.", "Un bloc plus profond réduit l’efficacité de cet antagoniste à effet plafond ; quatre réponses sont préférables."),
          T("Laisser le bloc régresser spontanément sous surveillance avant toute antagonisation.", "Sans contrainte horaire, cette attente limite le recours à un produit dont l’élimination dépend du rein."),
          T("Écarter le sugammadex en première intention à ce stade.", "Le complexe formé avec le rocuronium est excrété par voie rénale, ce qui déconseille son emploi."),
          T("Réserver la néostigmine à un bloc superficiel objectivé par quatre réponses au Td4.", "Son effet plafond impose une régression préalable, quel que soit l’état du rein."),
          T("Prolonger la ventilation jusqu’à récupération vérifiée.", "La sécurité prime sur l’heure de fin.")
        ],
        "La fonction rénale est terminale et aucune urgence d’extubation n’existe."
      ),
      qcm(
        "Pourquoi ne pas augmenter indéfiniment la néostigmine ?",
        src("b00092", "b00114"),
        "Son effet plafond limite l’antagonisme nicotinique tandis que les effets muscariniques continuent d’exposer la patiente.",
        [
          F("Doubler indéfiniment la dose finit par encapsuler le rocuronium.", "La néostigmine inhibe une enzyme et ne forme aucun complexe avec le curare."),
          F("Les effets muscariniques disparaissent lorsque la dose dépasse 0,05 mg/kg.", "La bradycardie et les hypersécrétions persistent ou augmentent avec l’excès cholinergique."),
          T("La quantité d’acétylcholine disponible atteint un plafond utile.", "Au-delà de la dose recommandée, le gain nicotinique devient minime malgré une exposition accrue."),
          T("Une escalade expose davantage aux sécrétions bronchiques.", "L’inhibition cholinestérasique renforce aussi les réponses muscariniques glandulaires."),
          T("La bradycardie reste un risque malgré le faible bénéfice neuromusculaire supplémentaire.", "L’effet vagal continue d’augmenter alors que l’antagonisme nicotinique plafonne.")
        ],
        "L’interne propose de doubler la dose si le rapport monte lentement."
      ),
      qcm(
        "Quand l’extubation devient-elle acceptable ?",
        src("b00090", "b00113"),
        "Le rapport quantitatif doit franchir 0,9 et s’accompagner d’une ventilation soutenue et de voies aériennes protectrices.",
        [
          F("Un rapport de 0,84 devient acceptable du seul fait de l’insuffisance rénale.", "Le terrain ne modifie pas le seuil de récupération : T4/T1 doit rester au moins égal à 0,9."),
          F("Une ventilation régulière suffit même si la déglutition reste faible.", "La reprise diaphragmatique peut précéder la récupération des muscles pharyngés."),
          T("Toux efficace.", "Elle suggère une meilleure protection pharyngée."),
          T("La déglutition et la toux protègent efficacement les voies aériennes.", "Ces fonctions complètent la mesure quantitative avant le retrait du support."),
          T("Le rapport reste à 0,94 lors d’une seconde mesure.", "La stabilité au-dessus de 0,9 réduit le risque de recurarisation précoce.")
        ],
        "Après attente et traitement, le rapport atteint 0,94."
      ),
      qcm(
        "Quels enseignements organisationnels retenir ?",
        src("b00085", "b00109", "b00115"),
        "Le terrain rénal doit modifier le plan d’antagonisation avant l’induction et non au dernier moment.",
        [
          F("Décider de l’antagoniste seulement après la dernière dose de curare.", "Le stade rénal terminal doit orienter le plan de récupération dès la préparation anesthésique."),
          F("Prévoir une extubation horaire sans marge pour la récupération spontanée.", "L’alternative au sugammadex peut être lente et impose d’intégrer ce délai au programme opératoire."),
          F("Ne conserver que le rapport final et effacer les mesures intermédiaires.", "La tendance complète permet d’expliquer les décisions, la lenteur de récupération et les doses administrées."),
          T("Tracer le stade rénal et la stratégie d’antagonisation dans le dossier.", "Cette information évite une administration ultérieure de sugammadex non anticipée."),
          F("Interdire toute curarisation ultérieure chez cette patiente dialysée.", "Une nouvelle anesthésie reste possible avec un agent, des doses, un monitorage et une stratégie de récupération adaptés.")
        ],
        "La patiente est extubée sans complication après récupération complète."
      ),
    ],
  },
  {
    label: "DP QCM 8 · Myasthénie et chirurgie thymique",
    vignette:
      "Une femme de 42 ans atteinte de myasthénie est programmée pour une thymectomie. Elle présente une fatigabilité mais ventile spontanément. Son état est stable sous traitement chronique, sans crise récente, et une surveillance postopératoire en unité spécialisée est prévue. L’équipe prépare une dose réduite de rocuronium, un monitorage quantitatif et une stratégie d’antagonisation.",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Pourquoi ce terrain impose-t-il une titration particulière ?",
        src("b00054", "b00055", "b00085"),
        "La myasthénie réduit la marge de transmission et rapproche le patient du mécanisme fonctionnel d’un bloc compétitif.",
        [
          T("La réponse à une dose standard de rocuronium peut être amplifiée.", "La réserve nicotinique déjà diminuée augmente la sensibilité aux non-dépolarisants."),
          T("Le monitorage doit être installé avant la première injection.", "Une référence individuelle est nécessaire pour interpréter une réponse particulièrement variable."),
          F("La myasthénie confère au curare un effet analgésique.", "La maladie ne transforme pas un bloqueur moteur périphérique en traitement de la nociception."),
          T("La ventilation postopératoire doit être anticipée.", "Une faiblesse respiratoire peut persister."),
          F("La stabilité sous traitement chronique élimine toute variabilité de réponse.", "Même équilibrée, la myasthénie réduit la marge de transmission et justifie une titration individualisée.")
        ]
      ),
      qcm(
        "Quelle stratégie est prudente ?",
        src("b00062", "b00066", "b00085"),
        "Un non-dépolarisant peut être utilisé en dose soigneusement réduite et titrée, avec une option d’antagonisation adaptée.",
        [
          F("Préférer la succinylcholine parce que sa brièveté annule tout risque myasthénique.", "La réponse aux curares dépolarisants est elle aussi imprévisible sur ce terrain et leur brièveté habituelle ne suffit pas à garantir la sécurité."),
          F("Administrer d’emblée une dose standard unique de rocuronium.", "La sensibilité aux non-dépolarisants impose une réduction initiale et des fractions guidées par la réponse."),
          T("Préserver hypnose et analgésie indépendamment.", "La faiblesse ne couvre ni conscience ni douleur."),
          F("Injecter une dose élevée sans mesure pour vaincre la myasthénie.", "Cela risque un bloc très prolongé chez cette patiente particulièrement sensible."),
          F("Se fier uniquement à la durée moyenne du produit.", "La pathologie myasthénique modifie fortement la réponse pharmacodynamique.")
        ],
        "L’équipe retient une faible dose fractionnée de rocuronium sous monitorage."
      ),
      qcm(
        "Comment interpréter la disparition rapide des réponses ?",
        src("b00054", "b00085"),
        "La réserve réduite explique qu’une faible quantité compétitive produise un bloc profond ; aucune redose n’est indiquée.",
        [
          F("L’absence de réponse exclut un bloc réel puisque la dose était faible.", "La réserve nicotinique réduite permet précisément à une faible quantité de rocuronium de produire un bloc profond."),
          F("Redoser immédiatement pour compenser la faible quantité injectée.", "Le Td4 nul montre que la paralysie est déjà maximale et contre-indique tout complément."),
          T("La ventilation contrôlée doit être poursuivie.", "L’absence de réponse implique une paralysie importante."),
          F("La faible dose prouve un défaut du stimulateur.", "Le terrain fournit une explication pharmacodynamique cohérente."),
          T("L’absence de réponse impose de maintenir le support et de suivre la récupération avant toute nouvelle dose.", "Le monitorage, et non la quantité théorique administrée, établit ici la profondeur du bloc.")
        ],
        "Après une dose bien inférieure à l’ordinaire, aucune réponse au Td4 n’est obtenue."
      ),
      qcm(
        "Quelle donnée permet de quantifier un bloc encore profond ?",
        src("b00088", "b00090", "b00099"),
        "Quand le Td4 reste nul, le compte post-tétanique aide à situer la récupération et à doser le sugammadex.",
        [
          T("Rechercher une réponse après stimulation tétanique.", "La facilitation révèle une transmission très faible."),
          F("Deux réponses post-tétaniques correspondent déjà à un bloc modéré compatible avec l’extubation.", "Ce résultat avec un Td4 nul décrit encore un bloc profond nécessitant ventilation et antagonisation adaptée."),
          F("Calculer T4/T1 alors que T4 est absente.", "Le rapport T4/T1 n’est pas défini lorsque la quatrième réponse est absente."),
          T("Qualifier le bloc de profond lorsque le Td4 est nul et que deux réponses post-tétaniques persistent.", "Cette combinaison situe la récupération avant le retour des contractions du train-de-quatre."),
          T("Attendre une tendance avant toute redose.", "La récupération spontanée doit être suivie.")
        ],
        "En fin d’intervention, le Td4 est encore nul mais deux réponses post-tétaniques apparaissent."
      ),
      qcm(
        "Quelle antagonisation correspond à ce résultat ?",
        src("b00093", "b00099", "b00102"),
        "Deux réponses post-tétaniques après rocuronium indiquent un bloc profond relevant de sugammadex 4 mg/kg.",
        [
          F("Attendre l’extubation sans antagonisation au motif que la dose de rocuronium était faible.", "Le niveau mesuré, non la dose initiale, impose ici la levée du bloc profond avant tout retrait du support."),
          F("Réduire le sugammadex à 2 mg/kg malgré l’absence de Td4.", "Il faudrait deux réponses au Td4 pour retenir cette dose plus faible."),
          F("Néostigmine 0,05 mg/kg seule.", "Le bloc est trop profond et l’antimuscarinique manquerait."),
          T("Poursuivre la ventilation pendant la récupération.", "La fonction ne revient qu’après encapsulation suffisante."),
          T("Mesurer ensuite le rapport T4/T1.", "Le succès doit atteindre au moins 0,9.")
        ],
        "La fonction rénale est normale et le rocuronium est l’unique curare."
      ),
      qcm(
        "Quels éléments doivent faire différer l’extubation ?",
        src("b00090", "b00113"),
        "La myasthénie et le bloc résiduel cumulent leurs effets ; toute mesure sous 0,9 ou toux faible impose la poursuite du support.",
        [
          F("Le diagnostic de myasthénie suffit à différer l’extubation malgré un rapport stable à 0,95 et une ventilation soutenue.", "Lorsque récupération quantitative et fonction respiratoire sont durables, le diagnostic seul ne constitue pas un bloc résiduel."),
          T("Une toux faible malgré quatre réponses.", "La protection des voies aériennes est incertaine."),
          T("Une ventilation qui s’épuise.", "La fatigabilité myasthénique ajoute un risque."),
          F("Une douleur sternale correctement contrôlée.", "L’efficacité analgésique ne renseigne ni sur le bloc pharmacologique ni sur la fatigabilité respiratoire."),
          F("Quatre réponses égales et force clinique normale.", "Ce profil n’impose pas à lui seul un délai.")
        ],
        "Après antagonisation, quatre réponses reviennent mais le premier rapport n’est que de 0,84."
      ),
      qcm(
        "Quels critères finaux sont nécessaires ?",
        src("b00104", "b00109", "b00113"),
        "La mesure quantitative, la stabilité ventilatoire et l’évaluation clinique spécifique du terrain doivent toutes être satisfaisantes.",
        [
          T("Un rapport T4/T1 durablement supérieur à 0,9.", "Des mesures répétées au-dessus du seuil confirment la levée du bloc pharmacologique."),
          T("L’absence de fatigabilité pendant une observation respiratoire prolongée.", "Le terrain myasthénique impose de vérifier que la ventilation reste soutenue dans le temps."),
          F("Une déglutition encore déficitaire malgré une toux présente.", "La faiblesse pharyngée persistante s’oppose au retrait sécurisé de la sonde."),
          T("Une déglutition efficace sans encombrement des voies aériennes.", "La fonction pharyngée doit être restaurée avant le retrait du support chez cette patiente fragile."),
          F("Arrêter toute surveillance dès le retrait de la sonde trachéale.", "La fatigabilité myasthénique peut réapparaître après une récupération pharmacologique initialement satisfaisante.")
        ],
        "Après surveillance prolongée, le rapport atteint 0,95 sans fatigue ventilatoire."
      ),
    ],
  },
];

const QROC_SERIES = [
  {
    label: "QROC — Série 1 · Sécurité",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Nommez la composante de l’anesthésie balancée assurée par un curare.",
        "Immobilité|Relâchement musculaire",
        src("b00003"),
        "Le bloc périphérique supprime le mouvement sans modifier conscience ni douleur.",
      ),
      qroc(
        "Citez les trois moyens indispensables lors d’une curarisation.",
        "Sédation|Contrôle des voies aériennes|Ventilation assistée",
        src("b00003"),
        "La paralysie respiratoire impose ces trois protections simultanées.",
      ),
      qroc(
        "Quel site anatomique constitue la cible des curares ?",
        "Jonction neuromusculaire|Plaque motrice",
        src("b00003", "b00022"),
        "Ils interrompent la transmission périphérique du motoneurone au muscle.",
      ),
      qroc(
        "Quelle atteinte respiratoire de réanimation peut justifier une curarisation ?",
        "SDRA avec hypoxémie réfractaire|SDRA sévère",
        src("b00003", "b00108"),
        "Le bloc peut améliorer la synchronisation avec la ventilation mécanique.",
      ),
      qroc(
        "Quelle fonction centrale un curare ne possède-t-il jamais ?",
        "Hypnose|Analgésie",
        src("b00003"),
        "L’immobilité ne doit jamais être confondue avec une anesthésie complète.",
      ),
    ],
  },
  {
    label: "QROC — Série 2 · Physiologie",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Définissez une unité motrice.",
        "Un motoneurone et les fibres musculaires qu’il innerve",
        src("b00005", "b00006"),
        "Un même axone commande en parallèle plusieurs fibres.",
      ),
      qroc(
        "Quel médiateur est libéré par la terminaison motrice ?",
        "Acétylcholine|ACh",
        src("b00009"),
        "L’acétylcholine transforme le signal électrique en message synaptique.",
      ),
      qroc(
        "Combien de molécules d’acétylcholine ouvrent un récepteur nicotinique musculaire ?",
        "Deux|2",
        src("b00017"),
        "Les deux sites portés par les sous-unités alpha doivent être occupés.",
      ),
      qroc(
        "Quelle enzyme termine le signal cholinergique dans la fente ?",
        "Acétylcholinestérase|AChE",
        src("b00015", "b00016"),
        "Son hydrolyse rapide fait chuter la concentration d’acétylcholine.",
      ),
      qroc(
        "Comment nomme-t-on le passage de la dépolarisation à la contraction ?",
        "Couplage excitation-contraction",
        src("b00020", "b00021"),
        "La fibre convertit le potentiel de membrane en travail mécanique.",
      ),
    ],
  },
  {
    label: "QROC — Série 3 · Succinylcholine",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel curare dépolarise la plaque motrice en clinique ?",
        "Succinylcholine|Suxaméthonium",
        src("b00038"),
        "Elle est l’unique représentant disponible de cette classe.",
      ),
      qroc(
        "Quelle enzyme plasmatique élimine la succinylcholine ?",
        "Butyrylcholinestérase|Pseudocholinestérase",
        src("b00038"),
        "Un déficit explique une apnée anormalement prolongée.",
      ),
      qroc(
        "Quel mouvement bref peut précéder le bloc dépolarisant ?",
        "Fasciculations",
        src("b00041", "b00042"),
        "L’activation initiale désordonnée précède la paralysie.",
      ),
      qroc(
        "Quelle est la durée clinique habituelle de la succinylcholine ?",
        "10 à 15 minutes|10-15 min",
        src("b00110"),
        "Sa dégradation plasmatique rend l’effet normalement bref.",
      ),
      qroc(
        "Quel curare choisir en priorité pour une séquence rapide sans contre-indication ?",
        "Succinylcholine",
        src("b00049", "b00110"),
        "Son délai inférieur à une minute reste la référence cinétique.",
      ),
    ],
  },
  {
    label: "QROC — Série 4 · Non-dépolarisants",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel type d’antagonisme exerce le rocuronium au récepteur nicotinique ?",
        "Antagonisme compétitif",
        src("b00054"),
        "Il occupe un site alpha sans ouvrir le canal.",
      ),
      qroc(
        "À quelle occupation réceptrice un bloc devient-il détectable ?",
        "Environ 75 %|75 %",
        src("b00054"),
        "La marge de sécurité masque les occupations plus faibles.",
      ),
      qroc(
        "À quelle occupation réceptrice le bloc devient-il complet ?",
        "Environ 92 %|92 %",
        src("b00054"),
        "La transmission devient impossible avant 100 % d’occupation.",
      ),
      qroc(
        "Citez les deux benzylisoquinolines disponibles.",
        "Atracurium et cisatracurium",
        src("b00062"),
        "Elles partagent une famille distincte du rocuronium stéroïdien.",
      ),
      qroc(
        "Quel signe au Td4 caractérise un bloc compétitif ?",
        "Fatigue|Fade|Diminution de T4 par rapport à T1",
        src("b00055", "b00058"),
        "La réponse n’est pas soutenue lors des stimulations répétées.",
      ),
    ],
  },
  {
    label: "QROC — Série 5 · Pharmacocinétique",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel volume physiologique approche la distribution d’un curare hydrosoluble ?",
        "Volume extracellulaire|0,2 à 0,4 L/kg",
        src("b00071"),
        "La faible liposolubilité limite la pénétration tissulaire.",
      ),
      qroc(
        "Quel mécanisme non enzymatique dégrade l’atracurium ?",
        "Réaction de Hofmann|Élimination de Hofmann",
        src("b00074"),
      "Sa vitesse augmente nettement avec l’élévation de la température et du pH.",
      ),
      qroc(
        "Quel isomère de l’atracurium libère moins d’histamine ?",
        "Cisatracurium",
        src("b00075"),
        "Sa puissance permet une moindre masse administrée.",
      ),
      qroc(
        "Quelle voie d’excrétion participe à la clairance du rocuronium ?",
        "Voie biliaire|Excrétion biliaire",
        src("b00077"),
        "Une atteinte hépatobiliaire peut prolonger l’exposition.",
      ),
      qroc(
        "Quelle durée clinique partagent rocuronium et atracurium ?",
        "30 à 45 minutes|30-45 min",
        src("b00073", "b00077"),
        "Des cinétiques différentes aboutissent à une durée comparable.",
      ),
    ],
  },
  {
    label: "QROC — Série 6 · Risques",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quelle variation habituelle de kaliémie suit la succinylcholine ?",
        "Hausse de 0,5 à 1,0 mEq/L|+0,5 à +1 mmol/L",
        src("b00044"),
        "La dépolarisation provoque une sortie transitoire de potassium.",
      ),
      qroc(
        "Quel terrain musculaire familial contre-indique la succinylcholine ?",
        "Susceptibilité à l’hyperthermie maligne",
        src("b00044", "b00046"),
        "La molécule peut déclencher une crise fulminante.",
      ),
      qroc(
        "Quel effet cardiaque est fréquent chez le nourrisson après succinylcholine ?",
        "Bradycardie",
        src("b00045"),
        "L’effet parasympathomimétique peut être prévenu par atropine.",
      ),
      qroc(
        "Quel type de réaction l’atracurium peut-il provoquer sans IgE ?",
        "Histaminolibération non spécifique",
        src("b00075", "b00080"),
        "Elle est pharmacologique et favorisée par la dose ou l’injection rapide.",
      ),
      qroc(
        "Quel ordre de grandeur décrit l’allergie aux curares ?",
        "1/5 000 à 1/10 000",
        src("b00082", "b00083"),
        "L’estimation varie selon les pays et les dénominateurs.",
      ),
    ],
  },
  {
    label: "QROC — Série 7 · Monitorage",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel nerf stimule-t-on classiquement pour observer l’adducteur du pouce ?",
        "Nerf ulnaire",
        src("b00085", "b00097"),
      "Ce couple nerf-muscle est accessible, reproductible et bien standardisé.",
      ),
      qroc(
        "Quelle fréquence utilise le train-de-quatre ?",
        "2 Hz|Deux hertz",
        src("b00090"),
        "Les quatre impulsions sont séparées d’une demi-seconde.",
      ),
      qroc(
        "Quelle formule définit le rapport du train-de-quatre ?",
        "T4/T1",
        src("b00088"),
        "L’amplitude de la quatrième réponse est comparée à la première.",
      ),
      qroc(
        "Quel seuil définit une récupération neuromusculaire complète ?",
        "T4/T1 ≥ 0,9|Rapport au moins égal à 0,9",
        src("b00090", "b00113"),
        "Sous cette valeur persiste une curarisation résiduelle.",
      ),
      qroc(
        "Pourquoi une ventilation spontanée ne suffit-elle pas avant extubation ?",
        "Le diaphragme récupère avant les muscles pharyngés",
        src("b00090", "b00113"),
        "La protection des voies aériennes peut rester déficitaire.",
      ),
    ],
  },
  {
    label: "QROC — Série 8 · Antagonisation",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Combien de réponses au Td4 faut-il avant néostigmine ?",
        "Quatre|4",
        src("b00092", "b00114"),
        "Son effet plafond impose un bloc déjà superficiel.",
      ),
      qroc(
        "Quelle dose maximale utile de néostigmine administre-t-on ?",
        "0,04 à 0,05 mg/kg|40 à 50 µg/kg",
        src("b00114"),
        "Une dose supérieure n’apporte pas d’antagonisme supplémentaire fiable.",
      ),
      qroc(
        "Quel médicament faut-il associer à la néostigmine ?",
        "Atropine ou glycopyrrolate|Un antimuscarinique",
        src("b00092"),
        "L’association prévient bradycardie et hypersécrétions.",
      ),
      qroc(
        "Quel curare est encapsulé par le sugammadex ?",
        "Rocuronium",
        src("b00093", "b00102"),
        "Les benzylisoquinolines ne sont pas reconnues.",
      ),
      qroc(
        "Quelle dose de sugammadex correspond à deux réponses au Td4 ?",
        "2 mg/kg",
        src("b00099", "b00102"),
      "Ce niveau de deux réponses décrit un bloc modéré au rocuronium.",
      ),
    ],
  },
];

const DP_QROC_SERIES = [
  {
    label: "DP QROC 1 · Apnée prolongée après intubation",
    vignette:
      "Une femme de 31 ans reçoit une dose unique de succinylcholine pour une césarienne urgente. Elle n’a aucun antécédent neuromusculaire connu, la kaliémie est normale et l’intubation se déroule facilement. Après la naissance, l’anesthésie est poursuivie sous ventilation contrôlée, mais la récupération motrice attendue ne survient pas dans le délai habituel.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel profil cinétique devait normalement être attendu ?",
        "Installation <1 minute et durée 10 à 15 minutes",
        src("b00110"),
        "La succinylcholine associe rapidité et brièveté.",
      ),
      qroc(
        "Quel phénomène visible précède souvent la paralysie ?",
        "Fasciculations",
        src("b00041", "b00042"),
        "L’agonisme nicotinique excite d’abord les fibres.",
        "Des contractions désordonnées sont observées après l’injection.",
      ),
      qroc(
        "Quelle enzyme faut-il suspecter si l’apnée persiste ?",
        "Butyrylcholinestérase|Pseudocholinestérase",
        src("b00038", "b00045"),
        "Son déficit ralentit l’hydrolyse plasmatique.",
        "Après quarante minutes, aucune respiration efficace ne revient.",
      ),
      qroc(
        "Quel support doit être poursuivi ?",
        "Ventilation mécanique|Assistance ventilatoire",
        src("b00048", "b00107"),
        "Le traitement est symptomatique jusqu’à l’élimination.",
        "La patiente reste inconsciente et stable sous anesthésie.",
      ),
      qroc(
        "Quel antagoniste spécifique ne serait pas efficace ici ?",
        "Sugammadex",
        src("b00093", "b00102"),
        "Il encapsule le rocuronium, pas la succinylcholine.",
        "L’équipe envisage un médicament de décurarisation.",
      ),
      qroc(
        "Quel rapport objectif doit être atteint avant extubation ?",
        "T4/T1 ≥ 0,9",
        src("b00090", "b00113"),
      "La cible supérieure à 0,9 exclut le reliquat neuromusculaire défini.",
        "Les quatre réponses réapparaissent progressivement.",
      ),
      qroc(
        "Quelle information doit être signalée lors d’une future anesthésie ?",
        "Suspicion de déficit en butyrylcholinestérase",
        src("b00045", "b00048"),
        "Une réexposition pourrait reproduire l’apnée.",
        "La récupération complète survient après deux heures.",
      ),
    ],
  },
  {
    label: "DP QROC 2 · Brûlure étendue",
    vignette:
      "Un homme de 40 ans brûlé sur la moitié du corps depuis un mois doit être intubé pour une pneumopathie hypoxémiante. Il est immobilisé en réanimation depuis plusieurs semaines, présente une faiblesse musculaire diffuse et sa kaliémie se situe à la limite haute. La préoxygénation est difficile et l’équipe prépare une induction avec contrôle rapide des voies aériennes.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel curare est contre-indiqué sur ce terrain ?",
        "Succinylcholine",
        src("b00044", "b00046"),
        "La dénervation fonctionnelle expose à une sortie massive de potassium.",
      ),
      qroc(
        "Quelle complication biologique est redoutée ?",
        "Hyperkaliémie sévère",
        src("b00044"),
        "Les récepteurs extrasynaptiques amplifient la dépolarisation.",
        "La kaliémie initiale est déjà à 5,1 mmol/L.",
      ),
      qroc(
        "Quel non-dépolarisant peut offrir un délai rapide ?",
        "Rocuronium",
        src("b00034", "b00065"),
        "Une forte dose constitue l’alternative de séquence rapide.",
        "Une intubation immédiate est nécessaire.",
      ),
      qroc(
        "Quelle posologie de séquence rapide peut être utilisée ?",
        "0,9 à 1,2 mg/kg de masse idéale",
        src("b00034"),
      "L’augmentation de la dose de rocuronium raccourcit son délai d’installation.",
        "Le patient pèse 110 kg avec une obésité importante.",
      ),
      qroc(
        "Quel profil au Td4 confirme un bloc compétitif ?",
        "Fatigue de T4 par rapport à T1|Fade",
        src("b00055", "b00058"),
      "La réponse répétée n’est pas soutenue pendant un bloc nicotinique compétitif.",
        "Trois contractions décroissantes sont visibles.",
      ),
      qroc(
        "Quel antagoniste spécifique pourra lever ce bloc ?",
        "Sugammadex",
        src("b00093"),
      "Il encapsule sélectivement le rocuronium sans agir sur les benzylisoquinolines.",
        "La chirurgie est annulée après l’intubation.",
      ),
      qroc(
        "Quelle dose correspond à deux réponses au Td4 ?",
        "2 mg/kg",
        src("b00099", "b00102"),
      "Le bloc modéré avec deux réponses au Td4 requiert cette quantité de sugammadex.",
        "Deux réponses sont présentes et le rein fonctionne normalement.",
      ),
    ],
  },
  {
    label: "DP QROC 3 · Cirrhose et cisatracurium",
    vignette:
      "Une patiente de 63 ans cirrhotique doit subir une chirurgie abdominale longue sans urgence d’intubation. La fonction rénale est normale, mais la bilirubine est élevée et l’échographie montre une cholestase. Le relâchement opératoire devra être maintenu pendant plusieurs heures. Un moniteur quantitatif est posé au nerf ulnaire avant l’induction.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel agent limite la dépendance à l’élimination hépatique ?",
        "Cisatracurium",
        src("b00074", "b00075"),
        "Sa dégradation conserve une voie organo-indépendante.",
      ),
      qroc(
        "À quelle famille chimique appartient-il ?",
        "Benzylisoquinoline",
        src("b00062", "b00111"),
      "Le cisatracurium dérive du mélange des dix isomères de l’atracurium.",
        "Le produit choisi est préparé en salle.",
      ),
      qroc(
        "Quel mécanisme non enzymatique participe à sa dégradation ?",
        "Réaction de Hofmann",
        src("b00074"),
        "La réaction dépend du pH et de la température.",
        "La patiente est maintenue normotherme.",
      ),
      qroc(
        "Quel avantage a-t-il sur l’atracurium concernant l’histamine ?",
        "Moindre histaminolibération",
        src("b00075"),
        "Sa plus grande puissance réduit la masse administrée.",
        "Aucune hypotension ni rougeur n’apparaît.",
      ),
      qroc(
        "Quel antagoniste est possible avec quatre réponses ?",
        "Néostigmine",
        src("b00092", "b00114"),
        "Un bloc superficiel compétitif répond à l’inhibition enzymatique.",
        "En fin d’intervention, quatre réponses avec fade sont visibles.",
      ),
      qroc(
        "Quel co-médicament doit accompagner cet antagoniste ?",
        "Atropine ou glycopyrrolate",
        src("b00092"),
      "L’antimuscarinique bloque les effets cardiaques et sécrétoires de l’acétylcholine.",
        "La fréquence cardiaque est à 56/min.",
      ),
      qroc(
        "Quelle valeur valide la récupération finale ?",
        "T4/T1 ≥ 0,9",
        src("b00090", "b00113"),
        "La mesure protège d’une extubation avec faiblesse résiduelle.",
        "Le rapport augmente après traitement.",
      ),
    ],
  },
  {
    label: "DP QROC 4 · Myasthénie",
    vignette:
      "Un patient de 38 ans myasthénique reçoit une faible dose de rocuronium pour thymectomie. Sa maladie est stable, mais il décrit une fatigabilité en fin de journée et une dysphagie intermittente. La ventilation préopératoire est correcte. L’équipe prévoit une surveillance neuromusculaire continue et un passage postopératoire en unité de soins intensifs.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Pourquoi une faible dose peut-elle produire un bloc profond ?",
        "Réserve nicotinique réduite|Sensibilité accrue au non-dépolarisant",
        src("b00054", "b00055"),
        "La maladie reproduit une transmission déjà fragile.",
      ),
      qroc(
        "Quel appareil doit guider toute dose supplémentaire ?",
        "Moniteur neuromusculaire|Train-de-quatre",
        src("b00085", "b00109"),
        "La sensibilité individuelle ne peut être prédite.",
        "Aucune réponse n’est visible après le premier bolus.",
      ),
      qroc(
        "Quel test utilise-t-on lorsque le Td4 reste nul ?",
        "Compte post-tétanique",
        src("b00090", "b00099"),
        "La facilitation permet d’explorer un bloc très profond.",
        "La chirurgie se termine plus tôt que prévu.",
      ),
      qroc(
        "Quelle dose de sugammadex correspond à deux réponses post-tétaniques ?",
        "4 mg/kg",
        src("b00099", "b00102"),
        "Cette profondeur nécessite plus que les 2 mg/kg du bloc modéré.",
        "Deux réponses post-tétaniques apparaissent.",
      ),
      qroc(
        "Quel organe élimine le complexe formé ?",
        "Rein",
        src("b00093", "b00102"),
      "Le complexe sugammadex-rocuronium est excrété inchangé par la voie rénale.",
        "La créatinine est normale.",
      ),
      qroc(
        "Quelle valeur encore insuffisante impose d’attendre ?",
        "T4/T1 < 0,9|0,84",
        src("b00113"),
      "Le bloc résiduel persiste tant que le rapport demeure sous le seuil de 0,9.",
        "Le premier rapport après antagonisation est à 0,84.",
      ),
      qroc(
        "Quel autre risque doit être contrôlé malgré un rapport normal ?",
        "Fatigabilité respiratoire myasthénique",
        src("b00055", "b00104"),
        "La maladie peut limiter la ventilation indépendamment du curare.",
        "Le rapport atteint 0,95 mais la surveillance se prolonge.",
      ),
    ],
  },
  {
    label: "DP QROC 5 · Récupération insuffisante",
    vignette:
      "Un patient de 74 ans est extubé après atracurium sur la seule reprise de la ventilation spontanée. Aucun rapport quantitatif n’a été mesuré au bloc. À l’arrivée en salle de réveil, il présente une voix faible, une toux inefficace et des épisodes de désaturation avec obstruction des voies aériennes supérieures. Un moniteur au nerf ulnaire est immédiatement installé.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel muscle peut récupérer avant le pharynx ?",
        "Diaphragme",
        src("b00090"),
        "La respiration ne garantit donc pas la protection des voies aériennes.",
      ),
      qroc(
        "Quel diagnostic évoque un rapport T4/T1 à 0,68 ?",
        "Curarisation résiduelle",
        src("b00113"),
        "Toute valeur inférieure à 0,9 répond à la définition.",
        "En SSPI, le patient tousse mal et désature.",
      ),
      qroc(
        "Quel support immédiat doit être assuré ?",
        "Contrôle des voies aériennes et assistance ventilatoire",
        src("b00003", "b00107"),
        "La faiblesse respiratoire peut s’aggraver rapidement.",
        "Une obstruction pharyngée intermittente apparaît.",
      ),
      qroc(
        "Quel antagoniste convient à l’atracurium avec quatre réponses ?",
        "Néostigmine",
        src("b00092", "b00114"),
        "Le bloc superficiel compétitif est accessible à cette stratégie.",
        "Le Td4 montre quatre contractions inégales.",
      ),
      qroc(
        "Quelle dose de cet antagoniste utiliser ?",
        "0,04 à 0,05 mg/kg",
        src("b00114"),
      "Cette plage posologique atteint l’effet utile maximal de la néostigmine.",
        "La décision d’antagoniser est prise.",
      ),
      qroc(
        "Quel effet cardiaque faut-il prévenir ?",
        "Bradycardie",
        src("b00092"),
        "Un antimuscarinique doit accompagner l’inhibition de l’AChE.",
        "La fréquence est à 60/min.",
      ),
      qroc(
        "Quel rapport permet de considérer le bloc levé ?",
        "T4/T1 ≥ 0,9",
        src("b00090", "b00113"),
        "La mesure finale doit dépasser la limite de sécurité.",
        "La toux s’améliore après traitement.",
      ),
    ],
  },
  {
    label: "DP QROC 6 · Décurarisation urgente",
    vignette:
      "Une patiente de 55 ans reçoit 1,2 mg/kg de rocuronium pour une intubation difficile, puis l’intervention doit être abandonnée. Le bolus date de quelques minutes, aucune réponse au train-de-quatre n’est visible et la ventilation reste entièrement contrôlée. Sa fonction rénale est normale. L’équipe souhaite restaurer la transmission neuromusculaire aussi rapidement que possible.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Pourquoi cette dose de rocuronium a-t-elle été choisie ?",
        "Réduire le délai d’installation|Séquence rapide",
        src("b00034"),
      "Une dose unitaire élevée de rocuronium accélère l’installation du bloc compétitif.",
      ),
      qroc(
        "Quel antagoniste agit spécifiquement sur cette molécule ?",
        "Sugammadex",
        src("b00093"),
      "Le sugammadex emprisonne le rocuronium libre dans un complexe stable.",
        "L’équipe souhaite restaurer rapidement la force.",
      ),
      qroc(
        "Quelle dose est requise pour une décurarisation immédiate ?",
        "8 à 16 mg/kg",
        src("b00099", "b00102"),
      "La charge circulante de rocuronium est encore très élevée quelques minutes après le bolus.",
        "Le bolus de rocuronium date de trois minutes.",
      ),
      qroc(
        "Quel mécanisme explique la levée du bloc ?",
        "Encapsulation du rocuronium",
        src("b00093"),
      "Le gradient créé par l’encapsulation retire progressivement le curare de la jonction.",
        "Le médicament antagoniste est injecté.",
      ),
      qroc(
        "Quelle défaillance d’organe limiterait ce choix ?",
        "Insuffisance rénale terminale",
        src("b00102"),
        "Le complexe stable dépend de l’excrétion rénale.",
        "La fonction rénale est vérifiée.",
      ),
      qroc(
        "Quel risque suit un sous-dosage ?",
        "Recurarisation",
        src("b00102"),
        "Du rocuronium non capté peut redevenir disponible.",
        "La première mesure s’améliore puis stagne.",
      ),
      qroc(
        "Quelle cible doit être documentée avant extubation ?",
        "T4/T1 ≥ 0,9",
        src("b00109", "b00113"),
        "L’antagonisation ne remplace pas la vérification quantitative.",
        "Quatre réponses sont maintenant présentes.",
      ),
    ],
  },
  {
    label: "DP QROC 7 · Réaction après atracurium",
    vignette:
      "Après injection rapide d’atracurium, un patient de 50 ans présente rougeur et hypotension transitoire sans bronchospasme. La pression se corrige rapidement, aucun autre signe de choc n’apparaît et l’intervention peut se poursuivre. L’équipe distingue une libération pharmacologique d’histamine d’une réaction allergique immune et prépare le plan d’une anesthésie ultérieure.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel mécanisme non immunitaire est probable ?",
        "Histaminolibération non spécifique",
        src("b00075", "b00080"),
        "L’atracurium peut libérer directement de l’histamine.",
      ),
      qroc(
        "Quel facteur d’administration a favorisé la réaction ?",
        "Injection rapide|Dose unitaire élevée",
        src("b00033", "b00080"),
      "Un pic plasmatique élevé augmente l’effet histaminique non immunitaire de l’atracurium.",
        "Le bolus a été injecté en quelques secondes.",
      ),
      qroc(
        "Quel isomère serait moins histaminolibérateur ?",
        "Cisatracurium",
        src("b00075"),
      "La plus grande puissance du cisatracurium réduit la quantité massique nécessaire.",
        "Une autre intervention est prévue.",
      ),
      qroc(
        "Cette réaction exclut-elle une allergie aux autres curares ?",
        "Non",
        src("b00081", "b00112"),
        "Réaction directe et anaphylaxie sont des mécanismes distincts.",
        "Le patient demande si tout curare est désormais interdit.",
      ),
      qroc(
        "Quel ordre de grandeur décrit l’anaphylaxie aux curares ?",
        "1/5 000 à 1/10 000",
        src("b00082", "b00083"),
      "L’anaphylaxie aux curares reste rare mais peut rapidement engager le pronostic vital.",
        "L’équipe explique le risque immunitaire séparé.",
      ),
      qroc(
        "Quel antagoniste peut être utilisé si quatre réponses existent ?",
        "Néostigmine",
        src("b00092", "b00114"),
        "L’atracurium répond à l’augmentation d’acétylcholine.",
        "En fin d’acte, quatre réponses sont visibles.",
      ),
      qroc(
        "Quel antagoniste ne fonctionnera pas sur l’atracurium ?",
        "Sugammadex",
        src("b00102"),
      "Le sugammadex est spécifique du rocuronium et n’encapsule pas l’atracurium.",
        "Un interne propose une encapsulation.",
      ),
    ],
  },
  {
    label: "DP QROC 8 · Curarisation prolongée en réanimation",
    vignette:
      "Un patient de 67 ans atteint de SDRA reçoit une perfusion de rocuronium pendant plusieurs jours. La curarisation avait été instaurée pour améliorer la synchronisation avec le ventilateur. Une cholestase et une faiblesse acquise apparaissent pendant le séjour. Lorsque l’oxygénation s’améliore, la perfusion est arrêtée mais la récupération motrice reste très lente.",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel objectif respiratoire peut justifier le curare dans ce contexte ?",
        "Faciliter la ventilation mécanique|Améliorer la synchronisation",
        src("b00003", "b00108"),
        "Le bloc supprime les efforts incompatibles avec le ventilateur.",
      ),
      qroc(
        "Quel volume de distribution explique sa faible diffusion graisseuse ?",
        "Volume extracellulaire|0,2 à 0,4 L/kg",
        src("b00071"),
      "Le rocuronium est hydrosoluble et reste surtout dans le secteur extracellulaire.",
        "Le patient présente une obésité importante.",
      ),
      qroc(
        "Quelle voie d’élimination peut être altérée par une cholestase ?",
        "Excrétion biliaire",
        src("b00077"),
        "Le rocuronium dépend partiellement du foie et de la bile.",
        "Une cholestase apparaît au troisième jour.",
      ),
      qroc(
        "Quel phénomène explique l’allongement après plusieurs jours ?",
        "Accumulation",
        src("b00078", "b00079"),
        "L’exposition longue charge les compartiments et retarde la décroissance.",
        "La perfusion est arrêtée mais le Td4 reste nul.",
      ),
      qroc(
        "Quel test explore la récupération d’un bloc sans réponse au Td4 ?",
        "Compte post-tétanique",
        src("b00090", "b00099"),
        "Il devient informatif lorsque les quatre réponses sont abolies.",
        "Une stimulation tétanique est préparée.",
      ),
      qroc(
        "Quelle dose de sugammadex correspond à une ou deux réponses post-tétaniques ?",
        "4 mg/kg",
        src("b00099", "b00102"),
      "Ce niveau post-tétanique indique un bloc profond nécessitant 4 mg/kg.",
        "Deux réponses post-tétaniques sont obtenues.",
      ),
      qroc(
        "Quelle mesure clôt la surveillance neuromusculaire avant extubation ?",
        "Rapport T4/T1 ≥ 0,9",
        src("b00109", "b00113"),
        "La reprise respiratoire isolée ne suffit pas.",
        "Le patient recommence à ventiler après antagonisation.",
      ),
    ],
  },
];



export function buildChapter16(extract) {
  void extract;
  const result = {
    fiche: buildFiche(),
    flashcards: FLASHCARDS,
    series: [
      ...QCM_SERIES,
      ...DP_QCM_SERIES,
      ...QROC_SERIES,
      ...DP_QROC_SERIES,
    ],
  };
  return result;
}

export default buildChapter16;
