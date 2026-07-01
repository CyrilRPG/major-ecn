/**
 * Contenu éditorial des 4 pages de résultat du diagnostic « Profil EVC ».
 *
 * Reproduit fidèlement les maquettes fournies (PREPARATION A CONSTRUIRE,
 * PROFIL A RENFORCER, PREPARATION SOLIDE, PROFIL AVANCEE). Les blocs communs
 * (CTA, badges de confiance) sont factorisés ; seul le haut de page varie.
 */
import type { ProfileKey } from './scoring';

export type Strength = { icon: string; title: string; desc: string };
export type ProfileContent = {
  key: ProfileKey;
  badge: string;
  /** Titre : segments avec emphase colorée optionnelle. */
  headline: { text: string; accent?: boolean }[];
  intro: string[];
  strengths: Strength[];
  warning: {
    title: string;
    lead?: string;
    reasons: string[];
    note: string;
  };
  why: { title: string; checklist: string[]; aside: string };
  priority: { title: string; text: string };
  objective: { title: string; text: string };
  closing: string;
  /** Illustration d'entête (icône lucide). */
  heroIcon: string;
};

export const PROFILES_CONTENT: Record<ProfileKey, ProfileContent> = {
  construire: {
    key: 'construire',
    badge: 'VOTRE DIAGNOSTIC EVC',
    heroIcon: 'Compass',
    headline: [
      { text: 'Votre préparation demande encore ' },
      { text: 'à être construite.', accent: true },
    ],
    intro: [
      "Vous disposez d'un potentiel réel. Il est maintenant temps de construire une préparation capable de répondre aux exigences des EVC.",
      "Votre parcours médical constitue une base précieuse. Cependant, réussir les EVC ne repose pas uniquement sur les connaissances médicales. Chaque année, des médecins expérimentés échouent faute d'une préparation ciblée, d'un entraînement régulier et d'une méthode adaptée aux attentes de l'épreuve.",
      "Votre diagnostic montre qu'il est encore temps de construire ces bases essentielles.",
    ],
    strengths: [
      { icon: 'Flame', title: 'Motivation et détermination', desc: "Vous êtes engagé dans un objectif clair et la volonté de réussir les EVC." },
      { icon: 'Stethoscope', title: 'Une expérience médicale sur laquelle vous appuyer', desc: 'Votre parcours constitue une base solide à valoriser.' },
      { icon: 'TrendingUp', title: 'Un potentiel de progression important', desc: "Une méthode adaptée et un travail régulier peuvent tout changer." },
      { icon: 'Rocket', title: 'Une marge de progression importante', desc: 'Chaque semaine de préparation structurée compte réellement.' },
    ],
    warning: {
      title: "Chaque année, des médecins très motivés échouent, alors qu'ils avaient les capacités de réussir.",
      lead: "Ils ne manquaient pas de motivation. Ils ne manquaient pas d'intelligence. Ils ont surtout perdu des points parce qu'ils :",
      reasons: [
        'travaillaient sans méthode claire',
        'consacraient du temps à des chapitres peu rentables',
        'mobilisaient insuffisamment les recommandations françaises',
        "s'entraînaient trop peu sur des dossiers représentatifs",
        "arrivaient le jour de l'épreuve sans stratégie claire",
      ],
      note: "Une année supplémentaire peut se jouer sur quelques détails. La bonne nouvelle : ce sont précisément ces points que nous identifions et corrigeons ensemble.",
    },
    why: {
      title: 'COMMENT MAJOR ECN VOUS FAIT GAGNER UN TEMPS PRÉCIEUX',
      checklist: [
        'Vous savez exactement quoi travailler chaque semaine.',
        'Vous ne perdez plus de temps sur des chapitres secondaires.',
        'Vous travaillez les dossiers réellement représentatifs des EVC.',
        'Vous appliquez précisément les recommandations françaises les plus récentes.',
        'Vous savez précisément où vous en êtes.',
        "Vous bénéficiez d'un accompagnement régulier jusqu'au jour J.",
      ],
      aside: "Chaque semaine gagnée aujourd'hui est une semaine supplémentaire pour préparer sereinement les EVC. Une préparation régulière est toujours plus efficace qu'une préparation intensive commencée trop tard.",
    },
    priority: {
      title: 'POURQUOI COMMENCER DÈS MAINTENANT ?',
      text: "Chaque semaine gagnée aujourd'hui est une semaine de préparation en plus. Plus tôt vous structurez votre travail, plus vous transformez votre potentiel en points concrets.",
    },
    objective: {
      title: 'NOTRE OBJECTIF',
      text: "Vous aider à transformer chaque heure de travail en progression concrète vers les EVC, grâce à une méthode claire, un programme structuré et un accompagnement jusqu'au jour J.",
    },
    closing: 'Ensemble, construisons une préparation méthodique, efficace et parfaitement adaptée aux exigences des EVC.',
  },

  renforcer: {
    key: 'renforcer',
    badge: 'VOTRE DIAGNOSTIC EVC',
    heroIcon: 'TrendingUp',
    headline: [
      { text: 'Votre préparation est ' },
      { text: 'à renforcer.', accent: true },
    ],
    intro: [
      "Vous disposez déjà de plusieurs atouts grâce à votre parcours et à votre expérience.",
      "Cependant, votre préparation spécifique aux EVC reste incomplète et devra être considérablement renforcée.",
      "Avec plus de méthode, de régularité, d'entraînement ciblé et un accompagnement structuré, vous avez toutes les clés pour transformer vos bases en réussite le jour de l'épreuve.",
    ],
    strengths: [
      { icon: 'MapPin', title: 'Expérience en France', desc: "Vous justifiez d'une expérience en France et d'une connaissance du système de santé français." },
      { icon: 'Layers', title: 'Des bases existantes', desc: 'Vous avez déjà posé les premières bases de votre préparation.' },
      { icon: 'Target', title: 'Potentiel réel', desc: 'Vous avez les capacités nécessaires pour réussir les EVC.' },
      { icon: 'Rocket', title: 'Volonté de progression', desc: "Vous avez l'envie et la motivation d'aller plus loin." },
    ],
    warning: {
      title: "Chaque année, des candidats avec un profil proche du vôtre échouent aux EVC.",
      lead: "Pas parce qu'ils manquent d'intelligence ou de motivation, mais parce qu'ils :",
      reasons: [
        'travaillent sans méthode efficace',
        'perdent du temps sur les mauvais chapitres',
        'maîtrisent insuffisamment les recommandations françaises',
        "s'entraînent trop peu sur les dossiers EVC",
        'arrivent le jour J sans stratégie claire',
      ],
      note: 'Une année supplémentaire peut parfois se jouer sur quelques détails.',
    },
    why: {
      title: 'POURQUOI MAJOR ECN PEUT FAIRE TOUTE LA DIFFÉRENCE',
      checklist: [
        'Vous savez exactement quoi travailler chaque semaine.',
        'Vous concentrez votre temps sur les chapitres qui rapportent des points.',
        'Vous évitez les erreurs classiques qui coûtent des places au classement.',
        'Vous travaillez les dossiers les plus représentatifs des épreuves.',
        'Vous appliquez directement les recommandations françaises les plus récentes.',
        'Vous bénéficiez d’un accompagnement méthodologique pour rester régulier jusqu’au jour J.',
      ],
      aside: "Vous avez déjà les premières bases : bien orientées, elles peuvent rapidement se transformer en points au classement.",
    },
    priority: {
      title: "POURQUOI CERTAINS CANDIDATS N'ATTEIGNENT PAS L'ADMISSION ?",
      text: 'Parce qu’ils travaillent beaucoup… mais pas toujours sur les bonnes priorités.',
    },
    objective: {
      title: 'NOTRE OBJECTIF',
      text: "Vous aider à transformer votre investissement en résultats concrets grâce à une méthode structurée, des entraînements ciblés et un accompagnement régulier jusqu'au jour J.",
    },
    closing: 'Vous avez déjà posé les premières bases. Ensemble, renforçons votre préparation pour transformer votre potentiel en réussite le jour des EVC.',
  },

  solide: {
    key: 'solide',
    badge: 'VOTRE DIAGNOSTIC EVC',
    heroIcon: 'ShieldCheck',
    headline: [
      { text: 'Votre préparation est solide… mais encore ' },
      { text: 'insuffisamment compétitive.', accent: true },
    ],
    intro: [
      'Vous avez construit des bases sérieuses. Il est maintenant temps de les transformer en véritable avantage le jour des EVC.',
      "Vous avez déjà investi du temps dans votre préparation : c'est un véritable atout. Cependant, aux EVC, disposer de bonnes bases ne suffit généralement pas pour être admis.",
      "Votre objectif n'est pas seulement d'apprendre. Il est désormais de gagner les derniers points qui font la différence avec les autres candidats.",
    ],
    strengths: [
      { icon: 'BookMarked', title: 'Des bases solides', desc: 'Vous maîtrisez déjà une partie du programme.' },
      { icon: 'TrendingUp', title: 'Une préparation engagée', desc: 'Vous avez déjà investi du temps et de l’énergie.' },
      { icon: 'Lightbulb', title: 'Un potentiel de progression élevé', desc: 'Vous pouvez encore gagner de nombreux points.' },
      { icon: 'Target', title: 'Une volonté d’aller plus loin', desc: 'Vous avez la motivation nécessaire pour franchir le cap.' },
    ],
    warning: {
      title: "BEAUCOUP DE CANDIDATS AYANT UN BON NIVEAU NE FRANCHISSENT JAMAIS LE SEUIL D'ADMISSION.",
      lead: 'Ils ne manquent pas de connaissances. Ils perdent simplement les quelques points qui séparent un candidat admis d’un candidat recalé. Pourquoi ?',
      reasons: [
        'recommandations françaises imparfaitement maîtrisées',
        'dossiers EVC encore insuffisants',
        'gestion du temps perfectible',
        'priorités de révision non optimales',
        'stratégie de préparation peu optimisée',
      ],
      note: 'Dans un concours, ce ne sont pas les connaissances qui manquent, mais les détails qui font la différence.',
    },
    why: {
      title: 'POURQUOI MAJOR ECN FAIT SOUVENT LA DIFFÉRENCE À CE STADE',
      checklist: [
        'Nous identifions précisément les derniers points qui limitent votre classement.',
        'Nous concentrons votre travail uniquement sur ce qui rapporte réellement des points.',
        'Nous vous entraînons sur des dossiers EVC et QCM représentatifs des épreuves.',
        'Nous optimisons votre stratégie jusqu’au jour J.',
        'Nous sécurisons chaque point pouvant faire la différence.',
      ],
      aside: "Vous avez déjà fait le plus dur. L'enjeu, désormais, est de transformer vos efforts en un classement gagnant.",
    },
    priority: {
      title: 'VOTRE PRIORITÉ : TRANSFORMER VOS BASES EN ADMISSION',
      text: "Vous avez déjà fait le plus dur : bâtir un socle solide. Il s'agit maintenant de convertir ce socle en points décisifs.",
    },
    objective: {
      title: 'NOTRE OBJECTIF',
      text: 'Transformer un bon niveau en niveau réellement compétitif, pour que chaque point compte réellement le jour des EVC.',
    },
    closing: 'Aux EVC, il ne suffit pas d’avoir un bon niveau. Ce sont ceux qui ont préparé les bons points, au bon moment, qui sont admis.',
  },

  avancee: {
    key: 'avancee',
    badge: 'VOTRE DIAGNOSTIC EVC',
    heroIcon: 'Award',
    headline: [
      { text: 'Votre préparation est ' },
      { text: 'avancée.', accent: true },
    ],
    intro: [
      "Vous disposez d'un potentiel très intéressant. Votre parcours montre que vous avez déjà construit des bases utiles pour préparer les EVC.",
      'Cependant, les EVC sont un concours très sélectif. Avoir de bonnes bases ne garantit pas l’admission.',
      "Ce sont souvent les derniers points, les plus difficiles à gagner, qui font la différence entre les candidats admis et ceux qui échouent à quelques dixièmes le jour de l'épreuve.",
    ],
    strengths: [
      { icon: 'BookMarked', title: 'Des bases déjà construites', desc: 'Vous avez acquis des connaissances et certaines compétences dans votre spécialité.' },
      { icon: 'Target', title: 'Un potentiel réel', desc: 'Votre profil montre que vous avez déjà atteint un niveau élevé.' },
      { icon: 'TrendingUp', title: 'Une préparation engagée', desc: 'Vous avez déjà investi du temps et mis en place des habitudes de travail utiles.' },
      { icon: 'Flame', title: 'Une motivation présente', desc: 'Votre volonté et votre implication sont des atouts majeurs.' },
    ],
    warning: {
      title: 'Les candidats ayant un bon niveau ne réussissent pas toujours aux EVC.',
      lead: "Chaque année, de nombreux médecins ayant déjà une solide expérience se présentent aux EVC sans améliorer significativement leur classement. Pourquoi ? Parce que leurs efforts restent souvent concentrés sur ce qu'ils savent déjà :",
      reasons: [
        'les recommandations françaises les plus récentes',
        'la maîtrise des dossiers relevant de votre spécialité',
        'la gestion du temps',
        'les priorités de révision',
        'une préparation réellement stratégique',
      ],
      note: 'Dans un concours, ce ne sont pas les heures qui font la différence, mais la manière dont elles sont utilisées.',
    },
    why: {
      title: 'POURQUOI MAJOR ECN EST PARTICULIÈREMENT UTILE À CE STADE',
      checklist: [
        'Nous identifions précisément les points qui vous coûtent encore des places.',
        'Nous concentrons vos efforts sur les notions à plus forte valeur ajoutée.',
        'Nous vous aidons à éviter les erreurs qui empêchent de franchir le seuil d’admission.',
        'Nous optimisons votre stratégie de travail et votre organisation.',
        'Nous vous entraînons dans des conditions proches des EVC et vous préparons à gérer la pression.',
      ],
      aside: 'À votre niveau, chaque semaine bien utilisée prend une longueur d’avance sur vos concurrents.',
    },
    priority: {
      title: 'VOTRE PRIORITÉ MAINTENANT',
      text: "Travailler mieux, pas seulement plus. L'objectif est de transformer votre potentiel en résultats concrets, avec les bons contenus, la bonne méthode, au bon moment.",
    },
    objective: {
      title: 'NOTRE OBJECTIF',
      text: 'Vous aider à atteindre un niveau supérieur à celui des autres candidats pour sécuriser votre admission.',
    },
    closing: 'Aux EVC, il ne suffit pas d’avoir un bon niveau : il faut atteindre un niveau supérieur à celui des autres candidats. C’est cette différence que nous vous aidons à construire.',
  },
};

/** Badges de confiance (communs aux 4 profils). */
export const TRUST_BADGES: { icon: string; title: string; desc: string }[] = [
  { icon: 'Users', title: 'Plus de 9 000 médecins accompagnés', desc: 'depuis plus de 15 ans dans toutes les spécialités.' },
  { icon: 'Award', title: '15 ans d’expertise unique', desc: 'sur les EVC.' },
  { icon: 'Stethoscope', title: 'Spécialité exclusivement EVC', desc: 'toutes les spécialités, de l’interne à l’externe.' },
  { icon: 'TrendingUp', title: 'Taux de réussite élevé', desc: 'parmi nos élèves actifs.' },
  { icon: 'Lock', title: '100 % confidentiel', desc: 'vos données restent strictement privées.' },
  { icon: 'BadgeCheck', title: 'Méthode éprouvée', desc: 'structurée et adaptée aux EVC.' },
  { icon: 'UserCheck', title: 'Suivi personnalisé', desc: 'un accompagnement régulier jusqu’au jour J.' },
  { icon: 'HeartHandshake', title: 'Accompagnement humain', desc: 'une équipe disponible à vos côtés.' },
];
