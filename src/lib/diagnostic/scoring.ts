/**
 * Moteur de scoring du diagnostic « Profil EVC ».
 *
 * Source unique de vérité : définitions des questions Q2→Q11, barème exact,
 * règle métier (< 20 h/semaine → jamais « Préparation solide » ni au-dessus),
 * et calcul du profil final sur 4 tranches (score max 163).
 *
 * Q1 (spécialité) et Q10 (obstacle) valent 0 point : elles ne servent qu'à
 * personnaliser le diagnostic. Q1 est collectée dans le formulaire d'infos.
 */

export type Option = {
  value: string;
  label: string;
  points: number;
  /** Sous-groupe d'affichage (ex. « France » / « Étranger » / « Autre »). */
  group?: string;
  /** Champ texte optionnel attaché à l'option (ex. nom de l'organisme). */
  detailPlaceholder?: string;
  /** Marque une option « moins de 20 h » (déclenche la règle métier Q6). */
  sub20?: boolean;
};

export type Question = {
  id: string;
  index: number; // numéro affiché (2..11)
  step: number; // étape 1..10
  maxPoints: number;
  /** Titre de la question. */
  title: string;
  /** Sous-titre / consigne. */
  hint?: string;
  /** Encart « À quoi sert cette question ? ». */
  why: string;
  options: Option[];
  /** Icône lucide (nom) pour l'entête de question. */
  icon: string;
  /** Q10 = obstacle : 0 point, stocké pour personnalisation. */
  scored: boolean;
  /** Choix multiple (cases à cocher) plutôt que réponse unique. */
  multi?: boolean;
};

export const QUESTIONS: Question[] = [
  {
    id: 'q2_activite',
    index: 2,
    step: 1,
    maxPoints: 25,
    icon: 'Activity',
    scored: true,
    title: 'Où exercez-vous actuellement ?',
    hint: 'Sélectionnez votre situation actuelle.',
    why: "Ces informations nous permettent d'évaluer la nature de votre expérience clinique et d'estimer votre niveau actuel d'adaptation aux recommandations et exigences attendues aux EVC.",
    options: [
      { group: 'France', value: 'fr_plus_3', label: 'Plus de 3 ans', points: 25 },
      { group: 'France', value: 'fr_1_3', label: '1 à 3 ans', points: 22 },
      { group: 'France', value: 'fr_6_12', label: '6 à 12 mois', points: 18 },
      { group: 'France', value: 'fr_3_6', label: '3 à 6 mois', points: 13 },
      { group: 'France', value: 'fr_1_3m', label: '1 à 3 mois', points: 8 },
      { group: 'France', value: 'fr_moins_1m', label: "Moins d'un mois", points: 5 },
      { group: 'France', value: 'fr_autre_spe', label: 'Dans une autre spécialité', points: 3 },
      { group: 'Étranger', value: 'et_plus_5', label: 'Plus de 5 ans', points: 10 },
      { group: 'Étranger', value: 'et_3_5', label: '3 à 5 ans', points: 8 },
      { group: 'Étranger', value: 'et_1_3', label: '1 à 3 ans', points: 6 },
      { group: 'Étranger', value: 'et_6_12', label: '6 à 12 mois', points: 4 },
      { group: 'Étranger', value: 'et_moins_6', label: 'Moins de 6 mois', points: 2 },
      { group: 'Autre situation', value: 'nex', label: "Je n'exerce pas actuellement", points: 0 },
    ],
  },
  {
    id: 'q3_continuite',
    index: 3,
    step: 2,
    maxPoints: 15,
    icon: 'GitCommitHorizontal',
    scored: true,
    title: "Votre activité médicale dans la spécialité que vous présenterez aux EVC a-t-elle été continue ces dernières années ?",
    hint: 'Sélectionnez la réponse qui correspond le mieux à votre situation.',
    why: "Évaluer la continuité de votre pratique médicale dans la spécialité présentée aux EVC permet d'adapter nos recommandations à votre niveau d'expérience récente.",
    options: [
      { value: 'c_sans', label: 'Oui, sans interruption', points: 15 },
      { value: 'c_moins_1', label: 'Oui, avec une interruption inférieure à 1 an', points: 11 },
      { value: 'c_1_3', label: 'Oui, avec une interruption comprise entre 1 et 3 ans', points: 6 },
      { value: 'c_plus_3', label: 'Oui, avec une interruption supérieure à 3 ans', points: 2 },
      { value: 'c_jamais', label: "Je n'ai jamais exercé dans cette spécialité (ou je n'exerce pas actuellement en tant que médecin)", points: 0 },
    ],
  },
  {
    id: 'q4_participation',
    index: 4,
    step: 3,
    maxPoints: 8,
    icon: 'CalendarCheck',
    scored: true,
    title: 'Lors de quelle session avez-vous présenté les EVC pour la dernière fois ?',
    hint: 'Sélectionnez la réponse qui correspond à votre situation.',
    why: "Cette information nous aide à mieux comprendre votre expérience des EVC et vos recommandations selon un parcours et à votre niveau actuel.",
    options: [
      { value: 'p_2025', label: 'Session 2025', points: 8 },
      { value: 'p_2024', label: 'Session 2024', points: 6 },
      { value: 'p_2023', label: 'Session 2023 ou antérieure', points: 4 },
      { value: 'p_jamais', label: 'Je n’ai jamais présenté les EVC', points: 5 },
    ],
  },
  {
    id: 'q5_ecart',
    index: 5,
    step: 4,
    maxPoints: 15,
    icon: 'Ruler',
    scored: true,
    title: 'Quel a été votre écart avec le dernier candidat admis lors de votre dernière tentative ?',
    hint: 'Sélectionnez la réponse qui correspond à votre situation.',
    why: "L'écart avec le dernier admis est un indicateur précieux du chemin restant à parcourir pour sécuriser votre admission.",
    options: [
      { value: 'e_moins_05', label: 'Moins de 0,5 point', points: 15 },
      { value: 'e_05_1', label: 'Entre 0,5 et 1 point', points: 13 },
      { value: 'e_1_2', label: 'Entre 1 et 2 points', points: 10 },
      { value: 'e_2_4', label: 'Entre 2 et 4 points', points: 6 },
      { value: 'e_plus_4', label: 'Plus de 4 points', points: 2 },
      { value: 'e_jamais', label: 'Je n’ai jamais présenté les EVC', points: 0 },
    ],
  },
  {
    id: 'q6_temps',
    index: 6,
    step: 5,
    maxPoints: 25,
    icon: 'Clock',
    scored: true,
    title: "En moyenne, combien d'heures de travail réellement disponibles pourriez-vous consacrer chaque semaine à votre préparation jusqu'aux EVC ?",
    hint: "Répondez honnêtement : votre temps réel de travail hebdomadaire influence directement le plan de préparation le plus adapté à votre situation.",
    why: "Le nombre d'heures que vous pouvez consacrer chaque semaine conditionne le rythme et la densité de préparation les plus adaptés à votre réalité.",
    options: [
      { value: 't_plus_50', label: 'Plus de 50 heures par semaine', points: 25 },
      { value: 't_35_50', label: 'Entre 35 et 50 heures par semaine', points: 21 },
      { value: 't_20_35', label: 'Entre 20 et 35 heures par semaine', points: 15 },
      { value: 't_10_20', label: 'Entre 10 et 20 heures par semaine', points: 8, sub20: true },
      { value: 't_moins_10', label: 'Moins de 10 heures par semaine', points: 2, sub20: true },
    ],
  },
  {
    id: 'q7_reco',
    index: 7,
    step: 6,
    maxPoints: 20,
    icon: 'BookMarked',
    scored: true,
    title: 'Aujourd’hui, où en êtes-vous avec les recommandations françaises de votre spécialité ?',
    hint: 'Sélectionnez la réponse qui correspond le mieux à votre situation actuelle.',
    why: "La maîtrise des recommandations françaises est un élément central des EVC : c'est un attendu majeur du jury.",
    options: [
      { value: 'r_regulier', label: 'Je les révise régulièrement', points: 20 },
      { value: 'r_majorite', label: "J'en ai étudié la majorité", points: 16 },
      { value: 'r_moitie', label: "J'en ai étudié environ la moitié", points: 10 },
      { value: 'r_quelques', label: "J'en ai étudié quelques-unes", points: 5 },
      { value: 'r_aucune', label: 'Je ne les ai pas commencées', points: 0 },
    ],
  },
  {
    id: 'q8_avancement',
    index: 8,
    step: 7,
    maxPoints: 20,
    icon: 'BookOpen',
    scored: true,
    title: 'Où en êtes-vous dans l’avancement du programme des EVC de votre spécialité ?',
    hint: 'Sélectionnez la réponse qui correspond le mieux à votre situation actuelle.',
    why: "Situer votre avancement dans le programme permet de calibrer le volume de travail restant et de prioriser les items.",
    options: [
      { value: 'a_complet', label: 'Programme entièrement parcouru', points: 20 },
      { value: 'a_75', label: 'Plus de 75 %', points: 16 },
      { value: 'a_50', label: 'Environ 50 %', points: 11 },
      { value: 'a_25', label: 'Environ 25 %', points: 6 },
      { value: 'a_items', label: 'Quelques items', points: 3 },
      { value: 'a_rien', label: 'Rien commencé', points: 0 },
    ],
  },
  {
    id: 'q9_dossiers',
    index: 9,
    step: 8,
    maxPoints: 20,
    icon: 'ClipboardList',
    scored: true,
    title: 'Où en êtes-vous dans votre entraînement sur les dossiers type EVC ?',
    hint: 'Sélectionnez la réponse qui correspond le mieux à votre situation actuelle.',
    why: "L'entraînement régulier sur des dossiers type EVC est le meilleur prédicteur de performance le jour de l'épreuve.",
    options: [
      { value: 'd_regulier', label: 'Entraînement régulier', points: 20 },
      { value: 'd_plusieurs', label: 'Plusieurs dossiers réalisés', points: 14 },
      { value: 'd_quelques', label: 'Quelques dossiers consultés', points: 6 },
      { value: 'd_aucun', label: 'Aucun dossier', points: 0 },
    ],
  },
  {
    id: 'q10_obstacle',
    index: 10,
    step: 9,
    maxPoints: 0,
    icon: 'AlertCircle',
    scored: false,
    multi: true,
    title: 'Quels sont aujourd’hui vos plus grands obstacles pour réussir les EVC ?',
    hint: 'Sélectionnez une ou plusieurs réponses (plusieurs choix possibles).',
    why: "Cette question nous permet d'identifier votre principal frein afin de vous proposer un accompagnement et des ressources adaptés à vos besoins prioritaires.",
    options: [
      { value: 'o_temps', label: 'Je manque de temps', points: 0 },
      { value: 'o_methode', label: "Je manque de méthode et d'organisation", points: 0 },
      { value: 'o_connaissances', label: 'Je manque de connaissances et de maîtrise des contenus', points: 0 },
      { value: 'o_entrainement', label: "Je manque d'entraînement (QCM, dossiers, examens blancs)", points: 0 },
      { value: 'o_confiance', label: 'Je manque de confiance en moi', points: 0 },
      { value: 'o_accompagnement', label: "Je manque d'accompagnement et de suivi personnalisé", points: 0 },
    ],
  },
  {
    id: 'q11_preparation',
    index: 11,
    step: 10,
    maxPoints: 15,
    icon: 'GraduationCap',
    scored: true,
    title: 'Avez-vous déjà suivi une préparation spécifique aux EVC dans la spécialité que vous présenterez ?',
    hint: 'Sélectionnez la réponse correspondant à votre situation.',
    why: "Connaître votre parcours de préparation permet d'évaluer ce qui a déjà fonctionné pour vous et d'ajuster nos recommandations.",
    options: [
      { value: 'pr_major', label: 'Major ECN', points: 15, detailPlaceholder: 'Ex : Préparation intensive EVC' },
      { value: 'pr_etablissement', label: 'Une préparation financée par mon établissement', points: 12, detailPlaceholder: "Nom de l'établissement (facultatif)" },
      { value: 'pr_organisme', label: 'Un autre organisme de préparation', points: 8, detailPlaceholder: "Nom de l'organisme (facultatif)" },
      { value: 'pr_autre', label: 'Autre', points: 5, detailPlaceholder: 'Précisez (facultatif)' },
      { value: 'pr_aucune', label: "Je n'ai jamais suivi de préparation spécifique aux EVC", points: 0 },
    ],
  },
  {
    id: 'q12_source',
    index: 12,
    step: 11,
    maxPoints: 0,
    icon: 'Megaphone',
    scored: false,
    title: 'Comment avez-vous connu Major ECN ?',
    hint: 'Sélectionnez votre réponse.',
    why: "Cette information nous aide à comprendre comment vous nous avez découverts et à améliorer notre accompagnement.",
    options: [
      { value: 'src_youtube', label: 'YouTube', points: 0 },
      { value: 'src_reco', label: 'Recommandations (bouche-à-oreille)', points: 0 },
      { value: 'src_reseaux', label: 'Autres réseaux sociaux', points: 0, detailPlaceholder: 'Lequel ? (Instagram, TikTok, Facebook, LinkedIn…)' },
      { value: 'src_hopital', label: 'Milieu hospitalier', points: 0 },
      { value: 'src_internet', label: 'Recherche internet', points: 0 },
      { value: 'src_autre', label: 'Autre', points: 0, detailPlaceholder: 'Précisez' },
    ],
  },
];

export const MAX_SCORE = 163;

export type ProfileKey = 'construire' | 'renforcer' | 'solide' | 'avancee';

export type ProfileMeta = {
  key: ProfileKey;
  label: string;
  emoji: string;
  min: number;
  max: number;
  /** Couleur d'accent principale du profil. */
  color: string;
  colorSoft: string;
};

export const PROFILES: ProfileMeta[] = [
  { key: 'construire', label: 'Préparation à construire', emoji: '🔴', min: 0, max: 74, color: '#C0112E', colorSoft: '#FDE7E9' },
  { key: 'renforcer', label: 'Préparation à renforcer', emoji: '🟠', min: 75, max: 114, color: '#E8742C', colorSoft: '#FEF0E4' },
  { key: 'solide', label: 'Préparation solide', emoji: '🟢', min: 115, max: 144, color: '#16793C', colorSoft: '#E7F6EC' },
  { key: 'avancee', label: 'Préparation avancée', emoji: '⭐', min: 145, max: 163, color: '#1D4ED8', colorSoft: '#E5EDFF' },
];

export type Answers = Record<string, { value: string; detail?: string; values?: string[] }>;

/** Somme des points des réponses (les questions non scorées valent 0). */
export function computeScore(answers: Answers): number {
  let total = 0;
  for (const q of QUESTIONS) {
    if (!q.scored) continue;
    const a = answers[q.id];
    if (!a) continue;
    const opt = q.options.find((o) => o.value === a.value);
    if (opt) total += opt.points;
  }
  return total;
}

/** True si la réponse Q6 est « moins de 20 h/semaine » (règle métier). */
export function isSub20(answers: Answers): boolean {
  const a = answers['q6_temps'];
  if (!a) return false;
  const q6 = QUESTIONS.find((q) => q.id === 'q6_temps')!;
  const opt = q6.options.find((o) => o.value === a.value);
  return !!opt?.sub20;
}

/**
 * Détermine le profil final à partir du score, en appliquant la règle métier :
 * un candidat travaillant moins de 20 h/semaine ne peut jamais dépasser
 * « Préparation à renforcer », quel que soit son score.
 */
export function computeProfile(score: number, answers: Answers): ProfileMeta {
  let profile = PROFILES.find((p) => score >= p.min && score <= p.max) ?? PROFILES[0];
  if (isSub20(answers)) {
    // Plafond à « renforcer » (index 1) : jamais « solide » ni « avancée ».
    const renforcer = PROFILES[1];
    if (profile.key === 'solide' || profile.key === 'avancee') {
      profile = renforcer;
    }
  }
  return profile;
}

/** Libellé lisible de la réponse choisie (pour stockage / affichage admin). */
export function answerLabel(questionId: string, value: string): string {
  const q = QUESTIONS.find((qq) => qq.id === questionId);
  return q?.options.find((o) => o.value === value)?.label ?? '';
}

/** Libellés joints d'un ensemble de réponses (questions à choix multiple). */
export function answerLabels(questionId: string, values: string[]): string {
  return values.map((v) => answerLabel(questionId, v)).filter(Boolean).join(', ');
}
