import {
  CalendarCheck, CalendarDays, CalendarRange, ClipboardCheck, Compass, Gauge, Home, LineChart, NotebookPen, PencilRuler, PenLine,
  RefreshCcw, Star, StickyNote, Target, Trophy, type LucideIcon,
} from 'lucide-react';

/**
 * Registre UNIQUE des rubriques du menu élève : nom, icône, famille, à quoi
 * elle sert, quand l'utiliser et comment elle s'insère dans la boucle
 * pédagogique. Le menu (groupes et infobulles), l'aide « ? » de chaque page et
 * la carte « Bien démarrer » de l'accueil lisent tous ce fichier : un libellé
 * ou une explication se change ici, et partout à la fois.
 */

export type RubriqueCle =
  | 'accueil' | 'planning' | 'priorites' | 'checkup' | 'evaluations'
  | 'entrainement' | 'transversales' | 'epreuves' | 'parcours'
  | 'agenda' | 'rendez-vous' | 'notes' | 'post-it' | 'revoir' | 'mes-entrainements' | 'mode-emploi';

export type Famille = 'piloter' | 'entrainer' | 'outils';

export const FAMILLES: { cle: Famille; titre: string }[] = [
  { cle: 'piloter', titre: 'Piloter' },
  { cle: 'entrainer', titre: 'S’entraîner' },
  { cle: 'outils', titre: 'Mes outils' },
];

export type Rubrique = {
  cle: RubriqueCle;
  href: string;
  label: string;
  famille: Famille;
  Icon: LucideIcon;
  /** À quoi sert la rubrique (infobulle du menu, aide de la page). */
  role: string;
  /** Quand l'utiliser. */
  quand: string;
  /** Sa place dans la boucle pédagogique (ce qu'elle reçoit ou alimente). */
  lien: string;
  /** Rubriques liées, proposées en raccourcis dans l'aide. */
  vers: RubriqueCle[];
};

export const RUBRIQUES: Record<RubriqueCle, Rubrique> = {
  accueil: {
    cle: 'accueil', href: '/accueil', label: 'Accueil', famille: 'piloter', Icon: Home,
    role: 'Votre tableau de bord : le programme du jour, vos alertes, votre progression et vos prochaines séances.',
    quand: 'À chaque connexion : c’est votre point de départ.',
    lien: 'Le programme du jour rassemble ce que le moteur pédagogique a retenu pour vous aujourd’hui : activités du planning, révisions dues, contrôles.',
    vers: ['planning', 'priorites', 'transversales'],
  },
  planning: {
    cle: 'planning', href: '/planificateur', label: 'Mon planning', famille: 'piloter', Icon: CalendarRange,
    role: 'Votre programme jour par jour jusqu’à l’EVC, construit selon vos disponibilités, votre niveau et vos priorités.',
    quand: 'Chaque jour : ouvrez « Aujourd’hui » et suivez le programme. Ajustez vos disponibilités dans « Mes objectifs ».',
    lien: 'Il se réorganise tout seul à partir de vos résultats : Check-up, révisions, épreuves blanches.',
    vers: ['priorites', 'checkup'],
  },
  priorites: {
    cle: 'priorites', href: '/mes-priorites', label: 'Mes priorités', famille: 'piloter', Icon: Gauge,
    role: 'L’état de chaque item (à revoir, à consolider, en bonne voie, maîtrisé), avec sa raison et l’action à faire.',
    quand: 'Après un Check-up, puis chaque semaine pour voir ce qui doit être retravaillé.',
    lien: 'Alimentée par tous vos résultats, elle décide de vos révisions ciblées et de l’ordre de votre planning.',
    vers: ['checkup', 'transversales', 'planning'],
  },
  checkup: {
    cle: 'checkup', href: '/checkup', label: 'EVC Check-up', famille: 'piloter', Icon: ClipboardCheck,
    role: 'Une évaluation chronométrée qui mesure votre niveau et repère vos lacunes, item par item.',
    quand: 'Au démarrage, puis chaque fois qu’un nouveau Check-up vous est recommandé.',
    lien: 'Vos lacunes deviennent des priorités et entrent dans votre planning.',
    vers: ['priorites', 'planning'],
  },
  evaluations: {
    cle: 'evaluations', href: '/evaluations', label: 'Mes évaluations', famille: 'piloter', Icon: LineChart,
    role: 'Toutes vos évaluations notées au même endroit (Check-up, épreuves blanches, interrogations, réévaluations, Parcours du Major) et votre courbe de progression.',
    quand: 'Après chaque évaluation, pour situer votre résultat et mesurer le chemin parcouru.',
    lien: 'Chaque résultat s’y ajoute tout seul, sans jamais remplacer le précédent ; il met aussi à jour vos priorités et votre planning.',
    vers: ['checkup', 'priorites', 'epreuves'],
  },
  entrainement: {
    cle: 'entrainement', href: '/entrainement', label: 'Entraînement ciblé', famille: 'entrainer', Icon: Target,
    role: 'Une session de questions tirées des collèges où vous faites le plus d’erreurs.',
    quand: 'Quand vous avez un quart d’heure et voulez travailler vos points faibles.',
    lien: 'Chaque réponse met à jour vos priorités.',
    vers: ['priorites'],
  },
  transversales: {
    cle: 'transversales', href: '/revisions-transversales', label: 'Révisions transversales', famille: 'entrainer', Icon: RefreshCcw,
    role: 'Des questions de toutes les spécialités déjà étudiées, pour ne rien oublier, et vos révisions ciblées du jour.',
    quand: 'Tous les jours, un peu : la révision du jour prend 15 à 25 minutes.',
    lien: 'Chaque réponse met à jour vos priorités ; un item raté revient au bon moment.',
    vers: ['priorites'],
  },
  epreuves: {
    cle: 'epreuves', href: '/epreuves-blanches', label: 'Épreuves blanches', famille: 'entrainer', Icon: PencilRuler,
    role: 'Des épreuves complètes en temps limité, dans les conditions du concours.',
    quand: 'Dès qu’une épreuve est publiée : composez dans le créneau prévu.',
    lien: 'Vos résultats mettent à jour vos priorités et votre planning.',
    vers: ['priorites', 'planning'],
  },
  parcours: {
    cle: 'parcours', href: '/parcours', label: 'Parcours du Major', famille: 'entrainer', Icon: Trophy,
    role: 'La méthodologie du Major : des coachings courts pour apprendre à travailler et à répondre aux questions.',
    quand: 'Chaque semaine, dans l’ordre : deux nouveaux parcours ouvrent le lundi.',
    lien: 'Votre planning vous propose ces coachings au bon moment de votre préparation.',
    vers: ['planning'],
  },
  agenda: {
    cle: 'agenda', href: '/agenda', label: 'Agenda', famille: 'outils', Icon: CalendarDays,
    role: 'Les cours en direct de la semaine et vos sessions de travail personnelles.',
    quand: 'En début de semaine, pour repérer les séances et réserver vos créneaux de révision.',
    lien: 'Les séances en direct apparaissent aussi sur l’accueil, dans « Mes 30 prochains jours ».',
    vers: ['accueil'],
  },
  'rendez-vous': {
    cle: 'rendez-vous', href: '/mes-rendez-vous', label: 'Mes rendez-vous', famille: 'outils', Icon: CalendarCheck,
    role: 'Vos rendez-vous de suivi individuel avec l’équipe pédagogique.',
    quand: 'Pour faire le point sur votre préparation avec un membre de l’équipe.',
    lien: 'Vos priorités et votre planning servent de base à l’échange.',
    vers: ['priorites', 'planning'],
  },
  notes: {
    cle: 'notes', href: '/notes', label: 'Prises de notes', famille: 'outils', Icon: NotebookPen,
    role: 'Toutes vos notes de cours, retrouvables par item, par collège ou par mot-clé.',
    quand: 'En relisant un item, ou juste avant une révision.',
    lien: 'Vos notes se prennent depuis l’onglet « Prise de notes » de chaque item.',
    vers: [],
  },
  'post-it': {
    cle: 'post-it', href: '/mes-post-it', label: 'Mes Post-it', famille: 'outils', Icon: StickyNote,
    role: 'Vos Post-it : des notes et listes de tâches posées sur l’accueil ou sur vos items, retrouvables ici par mot-clé, spécialité ou date.',
    quand: 'Pour noter une idée en révisant, ou planifier une tâche : datée, elle rejoint votre agenda.',
    lien: 'Indépendants du planificateur : cocher une tâche ne change ni vos priorités ni vos statistiques.',
    vers: ['agenda'],
  },
  revoir: {
    cle: 'revoir', href: '/revoir', label: 'Questions à revoir', famille: 'outils', Icon: Star,
    role: 'Les questions que vous avez mises de côté pendant vos entraînements, classées par collège.',
    quand: 'Avant une épreuve, ou pour retravailler les questions qui vous ont posé problème.',
    lien: 'Dans un dossier, l’étoile en haut à droite d’une question l’ajoute ici.',
    vers: [],
  },
  'mes-entrainements': {
    cle: 'mes-entrainements', href: '/mes-entrainements', label: 'Mes entraînements', famille: 'outils', Icon: PenLine,
    role: 'Vos flashcards et QCM personnels, visibles de vous seul.',
    quand: 'Pour fixer une notion difficile avec vos propres questions.',
    lien: 'Créez-les depuis un item (Flashcards ou Dossiers progressifs & QI) ; les meilleurs peuvent rejoindre la base commune.',
    vers: [],
  },
  'mode-emploi': {
    cle: 'mode-emploi', href: '/mode-emploi', label: 'Mode d’emploi', famille: 'outils', Icon: Compass,
    role: 'Comment fonctionne Major ECN : la boucle pédagogique, votre journée type et chaque rubrique expliquée.',
    quand: 'Au démarrage, puis dès que vous vous demandez à quoi sert une page.',
    lien: 'Il relie toutes les rubriques entre elles : chaque résultat met à jour vos priorités, qui réorganisent votre planning.',
    vers: ['accueil', 'checkup', 'priorites'],
  },
};

/** Ordre d'affichage dans le menu, par famille. */
export const ORDRE_MENU: Record<Famille, RubriqueCle[]> = {
  piloter: ['accueil', 'planning', 'priorites', 'checkup', 'evaluations'],
  entrainer: ['entrainement', 'transversales', 'epreuves', 'parcours'],
  outils: ['agenda', 'rendez-vous', 'notes', 'post-it', 'revoir', 'mes-entrainements', 'mode-emploi'],
};

/** Étapes de la boucle pédagogique (aide « ? ») et rubriques qui les portent. */
export const BOUCLE: { titre: string; rubriques: RubriqueCle[] }[] = [
  { titre: 'Mesurer', rubriques: ['checkup', 'evaluations'] },
  { titre: 'Prioriser', rubriques: ['priorites'] },
  { titre: 'Planifier', rubriques: ['planning', 'accueil'] },
  { titre: 'Réviser et s’entraîner', rubriques: ['transversales', 'entrainement', 'epreuves', 'parcours'] },
];

/** Rubrique d'une adresse (null hors menu élève). */
export function rubriqueDe(pathname: string): RubriqueCle | null {
  for (const r of Object.values(RUBRIQUES)) {
    if (pathname === r.href || pathname.startsWith(`${r.href}/`)) return r.cle;
  }
  return null;
}
