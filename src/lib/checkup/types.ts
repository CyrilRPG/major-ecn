/**
 * EVC CHECK-UP — types, formats, statuts, réglages, textes imposés.
 * Module PUR.
 *
 * Références : « Cahier des charges définitif — EVC Check-up » (noté §) et
 * « Complément définitif — sources de questions » (noté C§).
 *
 * Boucle (§1) : évaluation → score → lacunes → plan de reprise → révision →
 * réévaluation. Le Check-up ne se termine jamais par un simple score (§43).
 */
import type { ContentSource } from '@/lib/moteur/types';

export type Voie = 'interne' | 'externe';
export type CheckupFormat = 'interne_40_60' | 'externe_3_60' | 'externe_5_120';
export type CheckupMode = 'global' | 'categories' | 'items';
export type CheckupStatus = 'active' | 'expired' | 'pending_self_review' | 'completed' | 'abandoned' | 'cancelled_technical';
export type QuestionType = 'QRU' | 'QRM' | 'QROC';
export type QuestionResult = 'correct' | 'partial' | 'incorrect';
/** Familles de contenus utilisables par le Check-up (C§2). */
export type BankFamily = Extract<ContentSource, 'structured_item' | 'des_bank' | 'transversal_bank' | 'evc_annale'>;
export const BANK_FAMILIES: BankFamily[] = ['structured_item', 'des_bank', 'transversal_bank', 'evc_annale'];

export const STATUS_LABEL: Record<CheckupStatus, string> = {
  active: 'En cours', expired: 'Temps écoulé', pending_self_review: 'Correction à terminer', completed: 'Terminé',
  abandoned: 'Abandonné', cancelled_technical: 'Neutralisé (incident technique)',
};

export const FORMAT_LABEL: Record<CheckupFormat, string> = {
  interne_40_60: '40 questions — 60 min',
  externe_3_60: '3 blocs — 60 min',
  externe_5_120: '5 blocs — 120 min',
};
export const FORMAT_VOIE: Record<CheckupFormat, Voie> = { interne_40_60: 'interne', externe_3_60: 'externe', externe_5_120: 'externe' };
export const FORMATS_OF_VOIE: Record<Voie, CheckupFormat[]> = { interne: ['interne_40_60'], externe: ['externe_3_60', 'externe_5_120'] };

/** Statuts qui produisent un résultat pédagogique (§33). */
export const RESULT_STATUSES: CheckupStatus[] = ['completed', 'expired'];
/** Statuts exclus des courbes et du niveau (§31, §32, §33). */
export const EXCLUDED_STATUSES: CheckupStatus[] = ['abandoned', 'cancelled_technical'];

export type CheckupConfig = {
  /** Anti-répétition (§6, C§7) : fenêtre « récemment vue », en jours. */
  cooldown_days: number;
  /** Barème QRM par discordances (§9) : 0, 1, 2, ≥3 discordances. */
  qrm_points: [number, number, number, number];
  /** Volumes et durées (§7, §13). */
  interne: { questions: number; minutes: number; tolerance: number };
  externe_60: { blocks: number; minutes: number };
  externe_120: { blocks: number; minutes: number };
  /** Alertes de temps restant (§27), en minutes. */
  alerts_60: number[];
  alerts_120: number[];
  /** Règles de diversité (§4). */
  diversity: {
    /** Part d'items étoilés visée quand les deux existent. */
    starred_share: number;
    /** Part maximale de questions issues de dossiers progressifs (voie interne). */
    interne_dp_max_share: number;
    /** Dossier plus long : non éligible en voie interne (jamais coupé). */
    interne_unit_max_questions: number;
  };
  /** Sources complémentaires (C§8, C§9, C§11) : plafonds, jamais des quotas. */
  sources: {
    des_transversal_max_share: number;
    annales_single_year_max: number;
    annales_multi_year_max: number;
    /** Facteur de diversité : part visée = part dans la banque × ce facteur, dans la limite du plafond. */
    diversity_boost: number;
    externe_annale_blocks_60: number;
    externe_annale_blocks_120: number;
  };
  /** Blocs de la voie externe (§13, C§12). */
  externe_blocks: { min_questions: number; max_questions_60: number; max_questions_120: number; isolated_size_60: number; isolated_size_120: number };
  /** Tolérance réseau à la sauvegarde d'une réponse après l'échéance (secondes). */
  grace_seconds: number;
};

export const DEFAULT_CHECKUP_CONFIG: CheckupConfig = {
  cooldown_days: 30,
  qrm_points: [1, 0.5, 0.2, 0],
  interne: { questions: 40, minutes: 60, tolerance: 2 },
  externe_60: { blocks: 3, minutes: 60 },
  externe_120: { blocks: 5, minutes: 120 },
  alerts_60: [30, 10, 5],
  alerts_120: [60, 30, 10, 5],
  diversity: { starred_share: 0.6, interne_dp_max_share: 0.4, interne_unit_max_questions: 12 },
  sources: {
    des_transversal_max_share: 0.2, annales_single_year_max: 2, annales_multi_year_max: 4, diversity_boost: 3,
    externe_annale_blocks_60: 1, externe_annale_blocks_120: 2,
  },
  externe_blocks: { min_questions: 3, max_questions_60: 12, max_questions_120: 14, isolated_size_60: 8, isolated_size_120: 10 },
  grace_seconds: 15,
};

const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {}) as Record<string, unknown>;
const num = (v: unknown, d: number, min: number, max: number) => (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : d);
const int = (v: unknown, d: number, min: number, max: number) => Math.round(num(v, d, min, max));
const minutesList = (v: unknown, d: number[]) => {
  if (!Array.isArray(v)) return [...d];
  const l = (v as unknown[]).filter((x): x is number => typeof x === 'number' && x >= 1 && x <= 240).map(Math.round);
  return l.length > 0 ? Array.from(new Set(l)).sort((a, b) => b - a) : [...d];
};

export function mergeCheckupConfig(raw: unknown): CheckupConfig {
  const r = obj(raw);
  const D = DEFAULT_CHECKUP_CONFIG;
  const q = Array.isArray(r.qrm_points) ? (r.qrm_points as unknown[]) : [];
  const qrm = [0, 1, 2, 3].map((i) => num(q[i], D.qrm_points[i], 0, 1)) as CheckupConfig['qrm_points'];
  const it = obj(r.interne); const e60 = obj(r.externe_60); const e120 = obj(r.externe_120);
  const dv = obj(r.diversity); const sc = obj(r.sources); const eb = obj(r.externe_blocks);
  const out: CheckupConfig = {
    cooldown_days: int(r.cooldown_days, D.cooldown_days, 0, 365),
    qrm_points: qrm,
    interne: { questions: int(it.questions, D.interne.questions, 5, 200), minutes: int(it.minutes, D.interne.minutes, 5, 300), tolerance: int(it.tolerance, D.interne.tolerance, 0, 10) },
    externe_60: { blocks: int(e60.blocks, D.externe_60.blocks, 1, 20), minutes: int(e60.minutes, D.externe_60.minutes, 5, 300) },
    externe_120: { blocks: int(e120.blocks, D.externe_120.blocks, 1, 20), minutes: int(e120.minutes, D.externe_120.minutes, 5, 300) },
    alerts_60: minutesList(r.alerts_60, D.alerts_60),
    alerts_120: minutesList(r.alerts_120, D.alerts_120),
    diversity: {
      starred_share: num(dv.starred_share, D.diversity.starred_share, 0, 1),
      interne_dp_max_share: num(dv.interne_dp_max_share, D.diversity.interne_dp_max_share, 0, 1),
      interne_unit_max_questions: int(dv.interne_unit_max_questions, D.diversity.interne_unit_max_questions, 1, 60),
    },
    sources: {
      des_transversal_max_share: num(sc.des_transversal_max_share, D.sources.des_transversal_max_share, 0, 1),
      annales_single_year_max: int(sc.annales_single_year_max, D.sources.annales_single_year_max, 0, 50),
      annales_multi_year_max: int(sc.annales_multi_year_max, D.sources.annales_multi_year_max, 0, 50),
      diversity_boost: num(sc.diversity_boost, D.sources.diversity_boost, 0, 20),
      externe_annale_blocks_60: int(sc.externe_annale_blocks_60, D.sources.externe_annale_blocks_60, 0, 10),
      externe_annale_blocks_120: int(sc.externe_annale_blocks_120, D.sources.externe_annale_blocks_120, 0, 10),
    },
    externe_blocks: {
      min_questions: int(eb.min_questions, D.externe_blocks.min_questions, 1, 50),
      max_questions_60: int(eb.max_questions_60, D.externe_blocks.max_questions_60, 1, 80),
      max_questions_120: int(eb.max_questions_120, D.externe_blocks.max_questions_120, 1, 80),
      isolated_size_60: int(eb.isolated_size_60, D.externe_blocks.isolated_size_60, 1, 50),
      isolated_size_120: int(eb.isolated_size_120, D.externe_blocks.isolated_size_120, 1, 50),
    },
    grace_seconds: int(r.grace_seconds, D.grace_seconds, 0, 120),
  };
  // Barème : décroissant avec les discordances.
  if (!(out.qrm_points[0] >= out.qrm_points[1] && out.qrm_points[1] >= out.qrm_points[2] && out.qrm_points[2] >= out.qrm_points[3])) out.qrm_points = [...D.qrm_points];
  if (out.externe_blocks.min_questions > out.externe_blocks.max_questions_60) out.externe_blocks = { ...D.externe_blocks };
  return out;
}

/** Spécification d'un format : volume, durée, alertes. */
export function formatSpec(format: CheckupFormat, c: CheckupConfig): { voie: Voie; minutes: number; questions: number | null; blocks: number | null; alerts: number[] } {
  if (format === 'interne_40_60') return { voie: 'interne', minutes: c.interne.minutes, questions: c.interne.questions, blocks: null, alerts: c.alerts_60 };
  if (format === 'externe_3_60') return { voie: 'externe', minutes: c.externe_60.minutes, questions: null, blocks: c.externe_60.blocks, alerts: c.alerts_60 };
  return { voie: 'externe', minutes: c.externe_120.minutes, questions: null, blocks: c.externe_120.blocks, alerts: c.alerts_120 };
}

/* ─── Textes imposés (§34, §42, C§10) ─── */
export const TEXTS = {
  name: 'EVC CHECK-UP',
  signature: 'Mesurez votre niveau. Identifiez vos points faibles. Sachez quoi retravailler.',
  launchTitle: 'EVC Check-up - Où en êtes-vous aujourd’hui ?',
  launchCta: 'Lancer mon Check-up',
  siteCard: 'EVC CHECK-UP - Savez-vous vraiment où vous en êtes ?',
  fallbackNotice: 'Votre évaluation sera complétée à partir des banques d’entraînement disponibles pour cette spécialité.',
  otherDevice: 'Un EVC Check-up est déjà en cours sur un autre appareil. Reprenez-le sur l’appareil utilisé au démarrage.',
  pendingTitle: 'Vous avez une correction à terminer',
  pendingCta: 'Terminer ma correction',
  backToEval: 'Revenir à mon évaluation',
  validate: 'Valider définitivement',
  markReview: 'Marquer à revoir',
  ctaReviewItems: 'Revoir mes items',
  ctaTrainGaps: 'M’entraîner sur mes lacunes',
  ctaAddRevisions: 'Ajouter à mes révisions',
  ctaAddPlanning: 'Ajouter à mon planning',
  finalPrinciple: 'Nous mesurons votre progression réelle, pour ajuster la suite.',
  comparisonNotice: 'Chaque Check-up est un tirage différent : la comparaison entre deux évaluations est indicative tant que la banque n’est pas calibrée.',
} as const;
