/** Textes des maquettes fournies, sans les pictogrammes décoratifs. */
export type SpecialtyKind = "psychiatrie" | "radiologie";

export const PSY_PROGRAMME = [
  {
    title: "Psychiatrie de l’adulte",
    items: [
      "Psychoses et schizophrénie",
      "Troubles de l’humeur",
      "Troubles anxieux & TOC",
      "Troubles de la personnalité",
      "Sémiologie & diagnostics",
    ],
  },
  {
    title: "Urgences & cadre légal",
    items: [
      "Risque suicidaire",
      "Agitation & états délirants",
      "Soins sans consentement",
      "Législation & certificats",
      "Conduites à tenir urgentes",
    ],
  },
  {
    title: "Populations spécifiques",
    items: [
      "Pédopsychiatrie",
      "Psychiatrie du sujet âgé",
      "Addictologie",
      "Troubles du neurodéveloppement",
      "Situations particulières",
    ],
  },
  {
    title: "Thérapeutiques",
    items: [
      "Psychopharmacologie",
      "Antipsychotiques",
      "Antidépresseurs",
      "Thymorégulateurs, Lithium",
      "ECT & autres thérapeutiques",
      "Surveillance & effets indésirables",
    ],
  },
];

export const RADIO_PROGRAMME = [
  {
    title: "Imagerie d’urgence",
    items: [
      "Urgences thoraciques",
      "Urgences abdominales",
      "Urgences neurovasculaires",
      "Traumatologie",
      "…",
    ],
  },
  {
    title: "Imagerie thoracique",
    items: [
      "Parenchyme pulmonaire",
      "Plèvre & médiastin",
      "Pathologies tumorales",
      "Infectieuses, vasculaires",
      "…",
    ],
  },
  {
    title: "Neuroradiologie & ORL",
    items: [
      "AVC & pathologies vasculaires",
      "Pathologies tumorales",
      "Rachis",
      "ORL & massif facial",
      "…",
    ],
  },
  {
    title: "Imagerie abdomino-pelvienne",
    items: [
      "Foie, voies biliaires",
      "Pancréas, rate",
      "Tube digestif",
      "Bassin et pelvis",
      "…",
    ],
  },
  {
    title: "Imagerie ostéo-articulaire",
    items: [
      "Traumatologie",
      "Pathologies tumorales",
      "Infectieuses",
      "Dégénératives & inflammatoires",
      "…",
    ],
  },
  {
    title: "Imagerie cardiovasculaire",
    items: [
      "Pathologies vasculaires",
      "Cardiopathies",
      "Imagerie en coupe",
      "IRM cardiaque",
      "…",
    ],
  },
  {
    title: "Imagerie uro-génitale",
    items: [
      "Rein & voies urinaires",
      "Prostate",
      "Organes génitaux",
      "Fertilité, tumeurs",
      "…",
    ],
  },
  {
    title: "Sénologie & imagerie gynécologique",
    items: [
      "Pathologies mammaires",
      "Dépistage",
      "Imagerie gynécologique et pelvienne",
      "…",
    ],
  },
  {
    title: "Imagerie pédiatrique",
    items: [
      "Particularités pédiatriques",
      "Urgences",
      "Pathologies fréquentes en imagerie pédiatrique",
      "…",
    ],
  },
  {
    title: "Principes et techniques d’imagerie",
    items: [
      "Radiographie, échographie, scanner, IRM",
      "Produits de contraste",
      "Radioprotection, indications",
      "…",
    ],
  },
];

export const PSY_METHODE = [
  ["S’entraîner", "+ de 2 000 questions, QCM, dossiers, annales"],
  ["Comprendre", "Corrections détaillées et fiches explicatives"],
  ["Identifier", "Erreurs récurrentes et lacunes personnelles"],
  ["Retravailler", "Connaissances clés et fiches ciblées"],
  ["Retester", "Nouveaux QCM pour ancrer vos acquis"],
  ["Acquérir des automatismes", "et être prêt le jour J"],
];

export const RADIO_METHODE = [
  [
    "Savoir quoi travailler",
    "Concentrez-vous sur les connaissances essentielles et les thèmes les plus fréquemment évalués.",
  ],
  [
    "Savoir comment répondre",
    "Méthodologie spécifique à votre voie : QCM pour la voie interne, QROC & rédaction pour la voie externe.",
  ],
  [
    "S’entraîner intensivement",
    "QCM, QROC, dossiers cliniques et cas d’imagerie pour acquérir les bons réflexes.",
  ],
  [
    "Travailler les annales",
    "Annales EVC corrigées et commentées pour comprendre les attentes et progresser.",
  ],
  [
    "Être accompagné jusqu’au jour J",
    "Cours en direct, replays et réponses à vos questions pour vous aider tout au long de votre préparation.",
  ],
];

export const GAIN_TEMPS = [
  [
    "Trouver les bonnes ressources",
    "Cours, recommandations, annales, QCM…",
    "Rechercher, comparer, vérifier la fiabilité",
    "Des ressources sélectionnées et structurées",
    "Des heures de recherche évitées",
  ],
  [
    "Déterminer les priorités",
    "Identifier ce qui est vraiment évalué",
    "Analyser le programme, hiérarchiser seul",
    "Des priorités claires par spécialité",
    "Une priorisation déjà faite",
  ],
  [
    "Construire son programme",
    "Planifier les semaines, arbitrer selon le temps",
    "Organiser son planning, ajuster en permanence",
    "Un parcours de travail structuré et adapté à votre profil",
    "Une organisation simplifiée",
  ],
  [
    "Savoir quoi revoir",
    "Identifier ses lacunes",
    "Reprendre ses notes, faire le point seul",
    "Un suivi de progression et des révisions ciblées",
    "Moins de temps à décider",
  ],
  [
    "Choisir ses entraînements",
    "Trouver les bons exercices",
    "Chercher des QCM/QROC, des cas cliniques, des annales",
    "Des entraînements intégrés dans la plateforme",
    "Une recherche évitée",
  ],
  [
    "Analyser ses erreurs",
    "Comprendre pourquoi on se trompe",
    "Chercher les explications seul, parfois sans réponse claire",
    "Des corrections détaillées et des statistiques par thème",
    "Une analyse facilitée",
  ],
];

export const PSY_FORMULES = [
  {
    name: "Essentielle",
    subtitle: "Autonomie guidée",
    price: "495 €",
    href: "/formules/essentielle",
    items: [
      "Accès à la plateforme complète",
      "+ de 2 000 questions, dossiers et annales",
      "Fiches et ressources pédagogiques",
      "Capsules méthodologiques ciblées",
      "Suivi de progression",
      "Réponses à vos questions par email",
    ],
  },
  {
    name: "Intensive",
    subtitle: "Révision finale accompagnée",
    price: "995 €",
    href: "/formules/intensive",
    items: [
      "Tout le contenu de l’Essentielle",
      "Environ 18 à 20 h de révisions guidées",
      "Cours en direct & replays selon le programme",
      "Méthodologie EVC",
      "Entraînements intensifs & corrections détaillées",
      "Accompagnement renforcé",
    ],
  },
  {
    name: "Approfondie",
    subtitle: "Préparation la plus complète",
    price: "2 095 €",
    href: "/formules/programme-approfondi",
    items: [
      "Tout le contenu de l’Intensive",
      "Reprise approfondie des connaissances essentielles",
      "Programme d’enseignement complet",
      "Nombreux cours en direct & replays",
      "Dossiers et situations cliniques complets",
      "Méthodologie renforcée",
      "Annales corrigées",
      "Accompagnement jusqu’aux EVC",
    ],
  },
];

export const RADIO_FORMULES = [
  {
    name: "Essentielle",
    subtitle: "Travaillez à votre rythme",
    price: "495 €",
    href: "/formules/essentielle",
    items: [
      "Accès à la plateforme complète",
      "QCM, QROC, dossiers et annales",
      "Fiches de cours et ressources",
      "Suivi de progression",
      "Réponses à vos questions",
    ],
  },
  {
    name: "Intensive",
    subtitle: "Consolidez et entraînez-vous",
    price: "995 €",
    href: "/formules/intensive",
    items: [
      "Tout le contenu de la formule Essentielle",
      "Cours en direct et replays",
      "Entraînements intensifs",
      "Corrections détaillées",
      "Accompagnement renforcé",
    ],
  },
  {
    name: "Approfondie",
    subtitle: "Reprenez en profondeur les points clés avec nos enseignants",
    price: "2 295 €",
    href: "/formules/programme-approfondi",
    items: [
      "Tout le contenu de la formule Intensive",
      "Programme approfondi de cours",
      "Dossiers avancés et cas complexes",
      "Méthodologie renforcée",
      "Accompagnement personnalisé",
    ],
  },
];
