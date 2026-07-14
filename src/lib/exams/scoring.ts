import { gradeQroc } from '@/lib/qcm/grade';

/* ============================================================
   Types partagés du module Épreuves Blanches
   ============================================================ */
export type ExamBaremeMode = 'classic' | 'custom' | 'discordance';
export type QrocMode = 'self' | 'ai';
export type ExamStatus = 'draft' | 'published' | 'archived';
export type ExamMode = 'free' | 'scheduled';
export type QuestionFormat = 'qcm' | 'qroc';
export type SelfGrade = 'correct' | 'partial' | 'incorrect';

/** Une proposition A-E d'une question QCM. */
export type ExamItem = { lettre: string; enonce: string; is_correct: boolean; justification?: string };
/** Un palier de la table de discordances : jusqu'à `d` discordances → `p` points. */
export type DiscordanceTier = { d: number; p: number };
/** Un mot-clé QROC (correction IA, Phase 2). */
export type ExamKeyword = { label: string; points: number; mandatory?: boolean };

/** Question telle que nécessaire au calcul (sous-ensemble des colonnes DB). */
export type GradableQuestion = {
  id: string;
  format: QuestionFormat;
  points: number;
  items: ExamItem[];
  reponse_attendue?: string | null;
  college_id?: string | null;
};

/** Réponse d'un candidat à une question. */
export type CandidateAnswer = {
  selected_items: string[];
  text_answer?: string | null;
  self_grade?: SelfGrade | null;
};

export type BaremeConfig = {
  qcm_bareme_mode: ExamBaremeMode;
  discordance_table: DiscordanceTier[];
};

export type GradedAnswer = {
  is_correct: boolean | null;
  discordances: number | null;
  points_awarded: number;
  max_points: number;
  /** Suggestion d'auto-correction QROC (comparaison à reponse_attendue). */
  qrocAutoMatch?: boolean;
};

/* ============================================================
   Barème par discordances
   ============================================================ */
/** Table triée par seuil croissant. */
function sortedTable(table: DiscordanceTier[]): DiscordanceTier[] {
  return [...(table ?? [])].filter((t) => Number.isFinite(t.d) && Number.isFinite(t.p)).sort((a, b) => a.d - b.d);
}

/** Points obtenus pour un nombre de discordances donné (0 si au-delà du dernier seuil). */
export function discordancePoints(table: DiscordanceTier[], discordances: number): number {
  for (const tier of sortedTable(table)) {
    if (discordances <= tier.d) return tier.p;
  }
  return 0;
}

/** Note maximale d'une question notée par discordances (= points à 0 discordance). */
export function discordanceMax(table: DiscordanceTier[]): number {
  const sorted = sortedTable(table);
  if (sorted.length === 0) return 0;
  // La meilleure note est celle du plus petit seuil de discordances (souvent d=0).
  return sorted.reduce((best, t) => Math.max(best, t.p), 0);
}

/** Table de discordances par défaut (proche des barèmes des examens médicaux FR). */
export const DEFAULT_DISCORDANCE_TABLE: DiscordanceTier[] = [
  { d: 0, p: 10 },
  { d: 1, p: 5 },
  { d: 2, p: 2 },
  { d: 3, p: 0 },
];

/* ============================================================
   Notation d'une question
   ============================================================ */
export function questionMaxPoints(q: GradableQuestion, bareme: BaremeConfig): number {
  if (q.format === 'qroc') return q.points ?? 1;
  switch (bareme.qcm_bareme_mode) {
    case 'custom':
      return q.points ?? 1;
    case 'discordance':
      return discordanceMax(bareme.discordance_table);
    default:
      return 1; // classique : +1 / 0
  }
}

/**
 * Note une réponse. QCM : nb de discordances (items dont la sélection diffère de
 * la vérité) → barème (classique / personnalisé / discordances). QROC :
 * auto-évaluation du candidat (correct = plein, partiel = moitié, incorrect = 0).
 */
export function gradeExamAnswer(
  q: GradableQuestion,
  answer: CandidateAnswer,
  bareme: BaremeConfig,
): GradedAnswer {
  const maxPoints = questionMaxPoints(q, bareme);

  if (q.format === 'qroc') {
    const sg = answer.self_grade ?? null;
    const points = sg === 'correct' ? maxPoints : sg === 'partial' ? maxPoints / 2 : 0;
    const qrocAutoMatch = q.reponse_attendue
      ? gradeQroc(answer.text_answer ?? '', q.reponse_attendue)
      : undefined;
    return {
      is_correct: sg === 'correct',
      discordances: null,
      points_awarded: Math.round(points * 100) / 100,
      max_points: maxPoints,
      qrocAutoMatch,
    };
  }

  // QCM — nb de discordances = items dont la sélection diffère de la vérité
  // (même règle tout-ou-rien que gradeQuestion, cf. src/lib/qcm/grade.ts).
  const items = q.items ?? [];
  const selected = new Set(answer.selected_items ?? []);
  const discordances = items.filter((it) => it.is_correct !== selected.has(it.lettre)).length;
  const isCorrect = discordances === 0;

  let points = 0;
  if (bareme.qcm_bareme_mode === 'discordance') {
    points = discordancePoints(bareme.discordance_table, discordances);
  } else {
    points = isCorrect ? maxPoints : 0;
  }

  return {
    is_correct: isCorrect,
    discordances,
    points_awarded: Math.round(points * 100) / 100,
    max_points: maxPoints,
  };
}

/* ============================================================
   Agrégation & analyse pédagogique
   ============================================================ */
export type PerCollege = Record<string, { correct: number; total: number; points: number; maxPoints: number; pct: number }>;

export type ExamSummary = {
  score: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  total: number;
  perCollege: PerCollege;
};

export function summarizeExam(
  questions: GradableQuestion[],
  graded: { question_id: string; is_correct: boolean | null; points_awarded: number; max_points: number }[],
): ExamSummary {
  const byId = new Map(graded.map((g) => [g.question_id, g]));
  let score = 0;
  let maxScore = 0;
  let correctCount = 0;
  const perCollege: PerCollege = {};

  for (const q of questions) {
    const g = byId.get(q.id);
    const pts = g?.points_awarded ?? 0;
    const maxPts = g?.max_points ?? questionMaxPoints(q, { qcm_bareme_mode: 'classic', discordance_table: [] });
    score += pts;
    maxScore += maxPts;
    if (g?.is_correct) correctCount += 1;

    const key = q.college_id || 'Autres';
    const c = perCollege[key] ?? { correct: 0, total: 0, points: 0, maxPoints: 0, pct: 0 };
    c.total += 1;
    if (g?.is_correct) c.correct += 1;
    c.points += pts;
    c.maxPoints += maxPts;
    perCollege[key] = c;
  }
  for (const k of Object.keys(perCollege)) {
    const c = perCollege[k];
    c.pct = c.maxPoints > 0 ? Math.round((c.points / c.maxPoints) * 100) : 0;
  }

  return {
    score: Math.round(score * 100) / 100,
    maxScore: Math.round(maxScore * 100) / 100,
    percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    correctCount,
    total: questions.length,
    perCollege,
  };
}

/* ============================================================
   Commentaire pédagogique par niveau
   ============================================================ */
export type LevelTier = 'insuffisant' | 'intermediaire' | 'bon';

export function examLevel(percentage: number): { tier: LevelTier; title: string; body: string } {
  if (percentage < 50) {
    return {
      tier: 'insuffisant',
      title: 'Niveau insuffisant',
      body: 'Votre niveau reste actuellement insuffisant. Vous devez encore renforcer plusieurs connaissances fondamentales.',
    };
  }
  if (percentage < 75) {
    return {
      tier: 'intermediaire',
      title: 'Niveau intermédiaire',
      body: 'Vous disposez déjà de bonnes bases. Certaines notions restent néanmoins insuffisamment maîtrisées : concentrez vos prochaines révisions sur les items ci-dessous.',
    };
  }
  return {
    tier: 'bon',
    title: 'Bon niveau',
    body: 'Votre préparation est solide. Continuez à travailler régulièrement jusqu’au jour des EVC — les derniers points feront souvent la différence.',
  };
}

/** Spécialités prioritaires (les plus faibles), triées par % croissant. */
export function weakColleges(perCollege: PerCollege, threshold = 75): { name: string; pct: number }[] {
  return Object.entries(perCollege)
    .filter(([, c]) => c.total > 0 && c.pct < threshold)
    .map(([name, c]) => ({ name, pct: c.pct }))
    .sort((a, b) => a.pct - b.pct);
}
