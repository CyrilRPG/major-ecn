import { ACCROCHE_FORMULE } from '@/lib/formules-accroches';

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

/**
 * La boucle de progression, en six temps.
 *
 * Les textes sont volontairement courts : le visiteur doit saisir le cycle d'un
 * coup d'œil, pas lire six paragraphes. Le message de fond — chaque entraînement
 * sert à identifier ce qui doit être retravaillé — est porté par la phrase de
 * conclusion du bloc, pas répété sous chaque étape.
 *
 * « + de 2 000 questions » a été retiré d'ici : le chiffre est réservé à la
 * bande de preuves du haut de page, au bloc plateforme et à la formule
 * Essentielle. Répété partout, il cessait d'être un argument.
 */
export const PSY_METHODE = [
  ["S’entraîner", "QCM, dossiers cliniques et annales"],
  ["Comprendre", "Corrections détaillées et fiches explicatives"],
  ["Identifier", "Vos erreurs récurrentes et vos lacunes"],
  ["Retravailler", "Les connaissances à consolider, de façon ciblée"],
  ["Retester", "Pour vérifier que c’est acquis"],
  ["Automatiser", "Jusqu’à répondre sans hésiter le jour J"],
];

/** Les quatre bénéfices annoncés dès le hero. */
export const PSY_HERO_BENEFICES = [
  "Programme ciblé de psychiatrie",
  "QCM ou entraînement rédactionnel selon votre voie",
  "Annales et corrections détaillées",
  "Accompagnement par des médecins spécialistes",
];

/**
 * Bande de preuves, juste sous le hero. Quatre chiffres, lisibles en quelques
 * secondes : l'échéance, la dotation, l'antériorité, l'expérience.
 */
export const PSY_CHIFFRES_CLES = [
  { valeur: "10 décembre 2026", libelle: "Date des épreuves", note: "Espace Jean-Monnet, Rungis" },
  { valeur: "198 postes", libelle: "Voie externe" },
  { valeur: "+ 9 000", libelle: "médecins accompagnés" },
  { valeur: "+ 15 ans", libelle: "d’expérience dans la préparation aux concours et examens médicaux" },
];

/**
 * Aperçu tarifaire remonté dans la première moitié de page.
 *
 * POURQUOI. Un visiteur qui cherche le prix l'obtenait au terme d'un long
 * défilement. Ce bloc lui répond tout de suite ; celui qui veut comparer
 * descend au comparatif complet, que ce bloc ne duplique pas — trois ou quatre
 * lignes par formule, pas la liste entière.
 */
export const PSY_APERCU_TARIFS = [
  {
    nom: "Essentielle",
    prix: "495 €",
    lignes: [
      "Plateforme complète",
      "Entraînements & annales",
      "Supports pédagogiques",
      "Questions à l’équipe pédagogique",
    ],
  },
  {
    nom: "Intensive",
    prix: "995 €",
    lignes: ["Tout Essentielle", "≈ 18–20 h de révisions guidées"],
  },
  {
    nom: "Approfondie",
    prefixe: "À partir de",
    prix: "2 095 €",
    lignes: [
      "Plateforme complète",
      "Programme d’enseignement approfondi",
      "Accompagnement renforcé",
    ],
  },
];

/**
 * Montée en gamme, à comprendre en trois secondes.
 *
 * Le comparatif détaillé reste plus bas ; ceci répond à la seule question que
 * se pose le visiteur devant trois prix : pourquoi trois niveaux ?
 */
export const PSY_MONTEE_GAMME = [
  ["Essentielle", "Plateforme + questions pédagogiques"],
  ["Intensive", "Plateforme + questions + révisions en direct"],
  ["Approfondie", "Plateforme + programme d’enseignement approfondi + accompagnement renforcé"],
];

/**
 * « Votre temps sert à réviser » — version courte.
 *
 * Le tableau d'origine comptait six lignes et quatre colonnes. Trois
 * problématiques suffisent à faire comprendre l'idée, et la colonne « gain de
 * temps » disparaît : elle répétait en trois mots ce que la colonne précédente
 * venait de dire.
 */
export const PSY_GAIN_TEMPS_COURT = [
  {
    titre: "Savoir quoi travailler",
    seul: "Chercher les ressources et déterminer les priorités.",
    major: "Programme structuré et connaissances à maîtriser identifiées.",
  },
  {
    titre: "Savoir comment s’entraîner",
    seul: "Chercher QCM, dossiers et annales adaptés.",
    major: "Entraînements directement intégrés à la préparation.",
  },
  {
    titre: "Savoir quoi retravailler",
    seul: "Analyser ses erreurs et organiser seul ses révisions.",
    major: "Corrections détaillées, suivi de progression et révisions ciblées.",
  },
];

/**
 * Le parcours dans la plateforme, illustré par de VRAIES captures.
 *
 * ⚠ `public/cours.png` et `public/fiche.png` ne sont pas utilisables ici : leur
 * filigrane porte le nom et l'adresse e-mail d'un compte, lisibles à l'écran.
 * Les trois captures retenues en sont exemptes. La quatrième vignette utilise
 * l'image de cours de psychiatrie déjà présente sur la page.
 */
export const PSY_PLATEFORME = [
  {
    cle: "Apprenez",
    texte: "Cours, fiches et connaissances essentielles.",
    image: "/specialites/psychiatrie/cours.webp",
    alt: "Cours de psychiatrie consacré à l’évaluation du risque suicidaire",
    largeur: 317,
    hauteur: 167,
  },
  {
    cle: "Entraînez-vous",
    texte: "QCM ou entraînements rédactionnels selon votre voie, dossiers cliniques et annales.",
    image: "/qcm.png",
    alt: "Question à choix multiples en cours de réalisation sur la plateforme Major ECN",
    largeur: 1500,
    hauteur: 935,
  },
  {
    cle: "Analysez",
    texte: "Résultats, erreurs et points à renforcer.",
    image: "/accueil.png",
    alt: "Tableau de bord Major ECN : progression, performance et priorités de révision",
    largeur: 1903,
    hauteur: 935,
  },
  {
    cle: "Consolidez",
    texte: "Corrections détaillées et révisions ciblées.",
    image: "/entrainement.png",
    alt: "Entraînement ciblé construit à partir des questions les plus souvent ratées",
    largeur: 1915,
    hauteur: 940,
  },
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

/**
 * Formules — même structure que les autres pages spécialité du site
 * (orthopédie, pédiatrie, anesthésie) : un encadré « ce que reprend la
 * formule précédente », puis la liste de ce qu'elle ajoute. Les couleurs
 * viennent de `lib/formules-palette` : vert, rouge, bleu foncé.
 */
export type FormuleSpecialite = {
  n: number;
  nom: string;
  accroche: string;
  prefixe?: string;
  prix: string;
  encadre: { fort: string; suite?: string; plus?: string[] };
  items: string[];
  href: string;
  recommandee?: boolean;
  /**
   * Ce que la formule permet de faire, en une phrase — « Pour travailler à
   * votre rythme avec tous les outils essentiels ». Distinct de `accroche`,
   * qui est commune à tout le site (`formules-accroches.ts`) et ne doit pas
   * varier d'une page à l'autre. Optionnel : les pages qui ne le renseignent
   * pas gardent leur rendu actuel.
   */
  positionnement?: string;
  /**
   * La ligne à faire ressortir visuellement dans la carte : ce qui justifie à
   * lui seul le passage au niveau supérieur.
   */
  soulignement?: string;
};

/** Rappel commun aux trois formules, colonne de droite du bloc tarifs. */
export const TOUTES_FORMULES: { fort: string; suite: string }[] = [
  { fort: "Plateforme complète", suite: "Accessible pendant toute la période de préparation" },
  { fort: "Méthode adaptée à votre voie", suite: "QCM pour la voie interne, QROC et rédaction pour la voie externe" },
  { fort: "Encadrement par des médecins spécialistes", suite: "qui connaissent les EVC et votre spécialité" },
  { fort: "Paiement 100 % sécurisé", suite: "en plusieurs fois sans frais" },
  { fort: "Accompagnement selon les modalités", suite: "de la formule choisie" },
];

export const PSY_FORMULES: FormuleSpecialite[] = [
  {
    n: 1,
    nom: "Essentielle",
    accroche: ACCROCHE_FORMULE.essentielle,
    positionnement: "Pour travailler à votre rythme avec tous les outils essentiels",
    prix: "495 €",
    href: "/formules/essentielle",
    encadre: { fort: "La base complète", suite: "de la préparation Major ECN." },
    items: [
      "Plateforme pédagogique complète",
      "Supports et fiches de cours",
      "QCM ou entraînements rédactionnels selon la voie",
      "Dossiers cliniques",
      "Annales",
      "Corrections détaillées",
      "Flashcards et outils de révision",
      "Suivi de progression",
      "Questions pédagogiques via la plateforme ou par e-mail",
    ],
    // L'Essentielle n'est PAS une formule « en autonomie totale » : le candidat
    // garde la possibilité de poser ses questions pédagogiques. C'est un
    // élément de valeur réel, longtemps invisible sur la page.
    soulignement: "Travaillez à votre rythme tout en pouvant solliciter l’équipe pédagogique.",
  },
  {
    n: 2,
    nom: "Intensive",
    accroche: ACCROCHE_FORMULE.intensive,
    positionnement: "Pour ajouter des révisions guidées avec nos enseignants",
    prix: "995 €",
    href: "/formules/intensive",
    encadre: {
      fort: "Tout le contenu de l’Essentielle",
      suite: "Environ 18 à 20 h de révisions guidées",
    },
    items: [
      "Cours en direct",
      "Entraînements ciblés",
      "Annales",
      "Corrections",
      "Méthodologie EVC",
      "Échanges avec les enseignants",
      "Replays selon le programme",
    ],
    soulignement: "Plateforme complète + révisions guidées avec les enseignants",
  },
  {
    n: 3,
    nom: "Approfondie",
    accroche: ACCROCHE_FORMULE.approfondie,
    positionnement: "Pour reprendre le programme en profondeur avec nos enseignants",
    prefixe: "À partir de",
    prix: "2 095 €",
    href: "/formules/programme-approfondi",
    recommandee: true,
    encadre: {
      fort: "Tout le contenu de l’Essentielle",
      plus: [
        "Programme d’enseignement approfondi",
        "Accompagnement renforcé jusqu’aux EVC",
      ],
    },
    items: [
      "Nombreuses séances avec les enseignants",
      "Reprise structurée des connaissances",
      "Dossiers et situations cliniques",
      "Méthodologie approfondie",
      "Annales et corrections",
      "Accompagnement renforcé jusqu’aux EVC",
    ],
    soulignement: "Volume d’enseignement adapté au parcours et au programme choisi.",
  },
];

export const RADIO_FORMULES: FormuleSpecialite[] = [
  {
    n: 1,
    nom: "Essentielle",
    accroche: ACCROCHE_FORMULE.essentielle,
    prix: "495 €",
    href: "/formules/essentielle",
    encadre: { fort: "La base complète", suite: "de la préparation Major ECN." },
    items: [
      "Accès à la plateforme complète",
      "QCM, QROC, dossiers et annales",
      "Fiches de cours et ressources",
      "Suivi de progression",
      "Réponses à vos questions",
    ],
  },
  {
    n: 2,
    nom: "Intensive",
    accroche: ACCROCHE_FORMULE.intensive,
    prix: "995 €",
    href: "/formules/intensive",
    encadre: { fort: "Tout le contenu de la formule Essentielle" },
    items: [
      "Cours en direct et replays",
      "Annales corrigées",
      "Entraînements intensifs",
      "Corrections détaillées",
      "Accompagnement renforcé",
    ],
  },
  {
    n: 3,
    nom: "Approfondie",
    accroche: ACCROCHE_FORMULE.approfondie,
    prefixe: "À partir de",
    prix: "2 295 €",
    href: "/formules/programme-approfondi",
    recommandee: true,
    encadre: {
      fort: "Tout le contenu de la formule Intensive",
      plus: ["Programme approfondi de cours"],
    },
    items: [
      "Dossiers avancés et cas complexes",
      "Méthodologie renforcée",
      "Accompagnement personnalisé",
    ],
  },
];
