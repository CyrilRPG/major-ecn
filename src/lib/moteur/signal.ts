/**
 * Signaux standardisés (O§3 à O§8) — module PUR.
 *
 * - `signalStrength` : la force est une propriété du RÉSULTAT, pas du module
 *   (O§5). Elle dépend de l'activité qui l'a produit, de l'origine de la
 *   question, de l'auto-évaluation et de la récence de la question.
 * - `validateSignal` : un signal mal formé est rejeté (et journalisé par
 *   l'appelant) ; `item_id = null` interdit tout besoin ciblé par item.
 */
import {
  CONTENT_SOURCES, MEASURE_RESULTS, NEED_TYPES, RESULT_TYPES, SIGNAL_SOURCES, STRENGTHS,
  type ContentSource, type NeedType, type PedagoSignal, type ResultType, type SignalSource, type Strength,
} from './types';

const ORDER: Record<Strength, number> = { weak: 0, intermediate: 1, strong: 2 };
export const weaker = (a: Strength, b: Strength): Strength => (ORDER[a] <= ORDER[b] ? a : b);
export const isStrongOrIntermediate = (s: Strength | null | undefined): boolean => s === 'strong' || s === 'intermediate';

/** Force de base d'un résultat selon l'activité (O§6, I§5). */
export const BASE_STRENGTH: Record<SignalSource, Strength> = {
  checkup: 'strong',
  concours_blanc: 'strong',
  transversal_review: 'intermediate',
  planner_activity: 'intermediate',
  training: 'weak',
  evc_arena: 'weak',
};

export type StrengthInput = {
  source: SignalSource;
  contentSource: ContentSource | null;
  /** QROC auto-évaluée (checkup_qroc_self_assessed) : source faible (I§44). */
  selfAssessed?: boolean;
  /** Question déjà présentée dans la fenêtre d'anti-répétition (I§5, O§6). */
  recentlySeen?: boolean;
  /** Activité réellement évaluative ? Une révision qui consiste à relire ne mesure rien (O§7). */
  evaluative?: boolean;
};

/**
 * Force d'un résultat de maîtrise, ou null si l'activité n'est pas évaluative.
 *  - Check-up et concours blanc : forte ; révision transversale évaluative et
 *    activité évaluative du planificateur : intermédiaire ; entraînement libre
 *    et EVC Arena : faible ;
 *  - une annale reste au plus INTERMÉDIAIRE (elle a pu être travaillée hors
 *    plateforme), même présentée dans un Check-up ;
 *  - une QROC auto-évaluée et une question récemment vue sont faibles.
 */
export function signalStrength(i: StrengthInput): Strength | null {
  if (i.evaluative === false) return null;
  let s = BASE_STRENGTH[i.source];
  if (i.contentSource === 'evc_annale') s = weaker(s, 'intermediate');
  if (i.selfAssessed) s = 'weak';
  if (i.recentlySeen) s = 'weak';
  return s;
}

/** Une question est récemment vue si sa dernière présentation date de moins de `days` jours. */
export function isRecentlySeen(prevSeenAt: string | null | undefined, at: string, days: number): boolean {
  if (!prevSeenAt || days <= 0) return false;
  const delta = Date.parse(at) - Date.parse(prevSeenAt);
  return Number.isFinite(delta) && delta >= 0 && delta < days * 86_400_000;
}

/** Besoin associé à un résultat (O§8) : erreur → revoir, partiel → consolider, réussite → aucun. */
export function needForResult(result: ResultType): NeedType {
  switch (result) {
    case 'incorrect': return 'review';
    case 'partial': return 'consolidate';
    case 'review_due': return 'reactivate';
    default: return 'none';
  }
}

export type SignalValidation = { ok: true; signal: PedagoSignal } | { ok: false; reason: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validation du format unique (O§3). Règles :
 *  - champs minimum présents et valeurs dans les énumérations ;
 *  - `source_strength` null obligatoire pour un résultat qui ne mesure pas la
 *    maîtrise (échéance, réalisation), et obligatoire pour une mesure ;
 *  - `item_id` null interdit tout besoin ciblé par item (`need_type` ≠ none).
 */
export function validateSignal(raw: Partial<PedagoSignal> | null | undefined): SignalValidation {
  if (!raw || typeof raw !== 'object') return { ok: false, reason: 'signal absent' };
  const s = raw as Partial<PedagoSignal>;
  if (typeof s.signal_id !== 'string' || s.signal_id.length < 3 || s.signal_id.length > 300) return { ok: false, reason: 'signal_id invalide' };
  if (typeof s.candidate_id !== 'string' || !UUID.test(s.candidate_id)) return { ok: false, reason: 'candidate_id invalide' };
  if (s.item_id !== null && s.item_id !== undefined && (typeof s.item_id !== 'string' || !UUID.test(s.item_id))) return { ok: false, reason: 'item_id invalide' };
  if (!s.source || !SIGNAL_SOURCES.includes(s.source)) return { ok: false, reason: 'source invalide' };
  if (s.content_source !== null && s.content_source !== undefined && !CONTENT_SOURCES.includes(s.content_source)) return { ok: false, reason: 'content_source invalide' };
  if (!s.result_type || !RESULT_TYPES.includes(s.result_type)) return { ok: false, reason: 'result_type invalide' };
  if (!s.need_type || !NEED_TYPES.includes(s.need_type)) return { ok: false, reason: 'need_type invalide' };
  const measures = MEASURE_RESULTS.includes(s.result_type);
  if (s.source_strength !== null && s.source_strength !== undefined && !STRENGTHS.includes(s.source_strength)) return { ok: false, reason: 'source_strength invalide' };
  if (measures && !s.source_strength) return { ok: false, reason: 'un résultat de maîtrise exige une force' };
  if (!measures && s.source_strength) return { ok: false, reason: 'un signal sans mesure de maîtrise n’a pas de force (not_applicable)' };
  if ((s.item_id === null || s.item_id === undefined) && s.need_type !== 'none') return { ok: false, reason: 'item_id null : aucun besoin ciblé par item' };
  if (typeof s.origin_activity_id !== 'string' || s.origin_activity_id.length === 0) return { ok: false, reason: 'origin_activity_id manquant' };
  if (s.origin_question_id !== null && s.origin_question_id !== undefined && (typeof s.origin_question_id !== 'string' || !UUID.test(s.origin_question_id))) {
    return { ok: false, reason: 'origin_question_id invalide' };
  }
  const created = typeof s.created_at === 'string' ? Date.parse(s.created_at) : NaN;
  if (!Number.isFinite(created)) return { ok: false, reason: 'created_at invalide' };
  if (s.expires_at !== null && s.expires_at !== undefined && !Number.isFinite(Date.parse(s.expires_at))) return { ok: false, reason: 'expires_at invalide' };
  if (s.estimated_duration_minutes !== null && s.estimated_duration_minutes !== undefined
    && (!Number.isFinite(s.estimated_duration_minutes) || s.estimated_duration_minutes < 0 || s.estimated_duration_minutes > 600)) {
    return { ok: false, reason: 'estimated_duration_minutes invalide' };
  }
  return {
    ok: true,
    signal: {
      signal_id: s.signal_id, candidate_id: s.candidate_id, item_id: s.item_id ?? null, source: s.source,
      content_source: s.content_source ?? null, source_strength: s.source_strength ?? null, result_type: s.result_type,
      need_type: s.need_type, created_at: new Date(created).toISOString(), expires_at: s.expires_at ?? null,
      origin_activity_id: s.origin_activity_id, origin_question_id: s.origin_question_id ?? null,
      estimated_duration_minutes: s.estimated_duration_minutes ?? null, metadata: s.metadata && typeof s.metadata === 'object' ? s.metadata : {},
    },
  };
}

/** Le résultat mesure-t-il la maîtrise ? */
export function isMeasure(signal: Pick<PedagoSignal, 'result_type' | 'source_strength'>): boolean {
  return MEASURE_RESULTS.includes(signal.result_type) && !!signal.source_strength;
}

/** Ordre de traitement stable : chronologique puis par identifiant. */
export function sortSignals<T extends Pick<PedagoSignal, 'created_at' | 'signal_id'>>(signals: T[]): T[] {
  return [...signals].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.signal_id.localeCompare(b.signal_id));
}
