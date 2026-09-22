import { ACCROCHE_FORMULE } from '@/lib/formules-accroches';

/** Textes des maquettes fournies, sans les pictogrammes décoratifs. */
export type SpecialtyKind = "psychiatrie" | "radiologie";

/**
 * Programme de psychiatrie — cinq axes, trois volets chacun.
 *
 * Tout ce texte est rendu dans le HTML servi, y compris les axes repliés
 * (panneaux `hidden`, jamais montés au clic) : c'est le seul contenu de la
 * page propre à la psychiatrie, il doit être lu par les moteurs.
 */
export type AxeProgramme = { titre: string; volets: { titre: string; texte: string }[] };

export const PSY_PROGRAMME: AxeProgramme[] = [
  {
    titre: "Psychiatrie de l’adulte",
    volets: [
      {
        titre: "Sémiologie & diagnostic",
        texte: "Sémiologie et conduite de l’entretien psychiatrique, construction du diagnostic positif et différentiel.",
      },
      {
        titre: "Pathologies psychiatriques",
        texte: "Troubles psychotiques, troubles de l’humeur, troubles anxieux et apparentés.",
      },
      {
        titre: "Personnalité & comportement alimentaire",
        texte: "Troubles de la personnalité et troubles du comportement alimentaire.",
      },
    ],
  },
  {
    titre: "Urgences & cadre légal",
    volets: [
      {
        titre: "Urgences psychiatriques",
        texte: "Crise suicidaire, agitation, états délirants aigus : évaluation et conduite à tenir.",
      },
      {
        titre: "Soins sans consentement",
        texte: "Soins psychiatriques sans consentement : modalités, certificats et chronologie réglementaire.",
      },
      {
        titre: "Libertés & responsabilité",
        texte: "Isolement et contention, mesures de protection juridique, responsabilité et secret professionnel.",
      },
    ],
  },
  {
    titre: "Populations spécifiques",
    volets: [
      {
        titre: "Pédopsychiatrie",
        texte: "Troubles du neurodéveloppement, troubles du comportement de l’adolescent, repérage de l’enfance en danger.",
      },
      {
        titre: "Psychiatrie périnatale",
        texte: "Psychiatrie périnatale et prescription chez la femme enceinte.",
      },
      {
        titre: "Sujet âgé",
        texte: "Psychiatrie du sujet âgé : dépression, troubles neurocognitifs et diagnostic différentiel.",
      },
    ],
  },
  {
    titre: "Addictologie",
    volets: [
      {
        titre: "Alcool, tabac, opiacés",
        texte: "Repérage, sevrage et traitements de maintien.",
      },
      {
        titre: "Mésusage des psychotropes",
        texte: "Mésusage des psychotropes et protocoles de sevrage.",
      },
      {
        titre: "Comorbidités",
        texte: "Comorbidités psychiatriques des conduites addictives.",
      },
    ],
  },
  {
    titre: "Thérapeutiques",
    volets: [
      {
        titre: "Psychotropes",
        texte: "Indications, effets indésirables et surveillance, par grande famille.",
      },
      {
        titre: "ECT & psychothérapies",
        texte: "Électroconvulsivothérapie et psychothérapies : indications et articulation avec le traitement médicamenteux.",
      },
      {
        titre: "Organisation des soins",
        texte: "Organisation des soins, observance et alliance thérapeutique.",
      },
    ],
  },
];

/** Textes de référence du programme, cités en tête du bloc programme. */
export const PSY_TEXTES_REFERENCE = {
  /** Arrêté du 9 juillet 2021 portant modalités d'organisation des EVC (annexe I = programme). */
  arrete2021: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000043776575/",
  /** Arrêté du 22 septembre 2004 fixant la liste et la réglementation des DES de médecine. */
  arrete2004: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000807238",
};

/**
 * Articles du blog qui forment le cluster éditorial psychiatrie, dans l'ordre
 * d'affichage. La page ne garde que ceux qui sont publiés (statiques ou base) :
 * un article dépublié disparaît de la liste au lieu de produire un lien mort.
 * Le lien retour (article → page) est posé par `ArticleGuideFooter` pour tout
 * article dont le slug contient « psychiatrie ».
 */
export const PSY_ARTICLES_CLUSTER = [
  "reviser-evc-psychiatrie-10-semaines",
  "evc-2026-psychiatrie-mipic-medecine-generale",
  "psychiatrie-mip-medecine-generale-specialite-evc-padhue-2026",
  "dernieres-semaines-avant-les-evc",
  "evc-rungis-acces-hotels-jour-j",
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
  "QCM ou entraînements rédactionnels selon votre voie",
  "Annales et corrections détaillées",
  "Accompagnement par des médecins spécialistes",
];

/**
 * Bande de preuves, juste sous le hero. Quatre chiffres, lisibles en quelques
 * secondes : l'échéance, la dotation, l'antériorité, l'expérience.
 */
export const PSY_CHIFFRES_CLES = [
  { valeur: "10 décembre 2026", libelle: "Date des épreuves", note: "Espace Jean-Monnet, Rungis" },
  // Arrêté du 12 juin 2026 : annexe II (voie interne) et annexe I (voie externe).
  { valeur: "450 postes", libelle: "Voie interne" },
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
/**
 * L'échelle des trois formules. Le même couple de phrases que les cartes
 * (`positionnement` / `resume`) : le prospect lit deux fois la même chose,
 * ce qui est voulu — il doit pouvoir trancher avant d'ouvrir les listes.
 */
export const PSY_MONTEE_GAMME = [
  ["Essentielle", "Je travaille en autonomie — plateforme complète + équipe pédagogique"],
  ["Intensive", "Je veux aussi réviser en direct — Essentielle + 18–20 h avec les enseignants"],
  ["Approfondie", "Je veux reprendre le programme en profondeur — programme approfondi + accompagnement renforcé"],
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
    // Recadrage de `accueil.png` sur les seules cartes de suivi : la capture
    // entière affiche le calendrier d'une autre session que celle vendue ici.
    image: "/suivi-progression.png",
    alt: "Tableau de bord Major ECN : progression, performance et priorités de révision",
    largeur: 1190,
    hauteur: 560,
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
   * Le contenu de la formule en une demi-ligne, juste sous le positionnement :
   * « Plateforme complète + équipe pédagogique ». Le couple
   * positionnement/résumé doit permettre de distinguer les trois formules en
   * quelques secondes, avant même de lire les listes.
   */
  resume?: string;
  /**
   * Le bandeau en haut de carte. On préfère un libellé qui dit *pourquoi*
   * (« Préparation la plus complète ») à un simple « Recommandée », qui
   * n'informe pas alors que l'écart de prix est important.
   */
  badge?: string;
  /**
   * La ligne à faire ressortir visuellement dans la carte : ce qui justifie à
   * lui seul le passage au niveau supérieur.
   */
  soulignement?: string;
};

/**
 * Rappel commun aux trois formules, colonne de droite du bloc tarifs.
 *
 * Le libellé de la voie dépend de la spécialité : la psychiatrie n'emploie
 * jamais le mot « QROC », elle dit « réponses rédactionnelles », et ce
 * vocabulaire doit être identique d'un bout à l'autre de sa page.
 */
export function toutesFormules(psy: boolean): { fort: string; suite: string }[] {
  return TOUTES_FORMULES.map((t) =>
    t.fort === "Méthode adaptée à votre voie" && psy
      ? { ...t, suite: "QCM pour la voie interne, réponses rédactionnelles pour la voie externe" }
      : t,
  );
}

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
    positionnement: "Je travaille en autonomie",
    resume: "Plateforme complète + équipe pédagogique",
    prix: "495 €",
    href: "/formules/essentielle",
    encadre: { fort: "La base complète", suite: "de la préparation Major ECN." },
    items: [
      "Plateforme pédagogique complète",
      "Supports et fiches de cours",
      "QCM pour la voie interne, entraînements rédactionnels pour la voie externe",
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
    positionnement: "Je veux aussi réviser en direct",
    resume: "Essentielle + 18–20 h avec les enseignants",
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
    positionnement: "Je veux reprendre le programme en profondeur",
    resume: "Programme approfondi + accompagnement renforcé",
    prefixe: "À partir de",
    prix: "2 095 €",
    href: "/formules/programme-approfondi",
    recommandee: true,
    badge: "Préparation la plus complète",
    encadre: {
      fort: "Tout le contenu de l’Essentielle",
      plus: [
        "Programme d’enseignement approfondi",
        "Accompagnement renforcé jusqu’aux EVC",
      ],
    },
    // « Accompagnement renforcé jusqu'aux EVC » est déjà annoncé dans
    // `encadre.plus` : le répéter ici le faisait apparaître deux fois dans la
    // même carte.
    items: [
      "Nombreuses séances avec les enseignants",
      "Reprise structurée des connaissances",
      "Dossiers et situations cliniques",
      "Méthodologie approfondie",
      "Annales et corrections",
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
