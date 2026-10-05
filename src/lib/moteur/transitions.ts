/**
 * Matrice des transitions de l'état d'un item (I§6 à §17, O§13 à §17) —
 * module PUR, déterministe : mêmes signaux dans le même ordre, même état.
 *
 * PRINCIPE (I§6) : statut ≠ action. Toute erreur, quelle que soit sa source,
 * déclenche une action pédagogique (révision et/ou contrôle) ; la FORCE de la
 * source détermine seulement si l'erreur suffit, à elle seule, à modifier le
 * statut. On ne dit jamais « cela ne compte pas » : l'item est retravaillé.
 *
 * Choix d'interprétation documentés (le cahier des charges ne les tranche pas) :
 *  - les signaux positifs comptés pour « En bonne voie » et « Maîtrise
 *    consolidée » sont ceux reçus DEPUIS la dernière erreur forte ou
 *    intermédiaire (une erreur sérieuse remet la consolidation à zéro) ;
 *  - un partiel fort/intermédiaire compte comme une erreur forte/intermédiaire
 *    pour les fenêtres de 14 jours (il n'est pas plus pénalisant : il mène à
 *    « À consolider », jamais à « À revoir ») ; un partiel faible ne compte
 *    dans aucune fenêtre ni dans le compteur des deux erreurs faibles ;
 *  - un statut ne monte que sur un résultat fort ou intermédiaire, d'une
 *    marche à la fois ; un résultat faible ne fait jamais monter seul (I§7).
 */
import { isStrongOrIntermediate } from './signal';
import type { MasteryStatus, OrchestratorConfig, PedagoSignal, ResultType, Strength } from './types';
import { STATUS_LABEL, STATUS_RANK } from './types';

export type PositiveMark = { at: string; s: Strength; k: string; q: string | null };
export type ErrorMark = { at: string; s: Strength; q: string | null; partial?: boolean };
export type WeakErrorMark = { q: string; at: string };

export type ItemState = {
  status: MasteryStatus;
  statusReason: string | null;
  statusChangedAt: string | null;
  positives: PositiveMark[];
  errors: ErrorMark[];
  weakErrors: WeakErrorMark[];
  controlPending: boolean;
  controlReason: ControlReason | null;
  controlRequestedAt: string | null;
  masteryConfirmedAt: string | null;
  positiveCount: number;
  partialCount: number;
  negativeCount: number;
  recentErrorAt: string | null;
  recentStrongErrorAt: string | null;
  lastResult: 'positive' | 'partial' | 'incorrect' | null;
  lastResultSource: string | null;
  lastResultStrength: Strength | null;
  lastResultAt: string | null;
  lastActivityAt: string | null;
};

export type ControlReason = 'maitrise_perdue' | 'erreur_faible' | 'deux_erreurs_faibles';
export const CONTROL_REASON_LABEL: Record<ControlReason, string> = {
  maitrise_perdue: 'Contrôle obligatoire après une erreur sur un item maîtrisé',
  erreur_faible: 'Contrôle après une erreur détectée',
  deux_erreurs_faibles: 'Contrôle après deux difficultés distinctes',
};

export function emptyItemState(): ItemState {
  return {
    status: 'non_evalue', statusReason: null, statusChangedAt: null, positives: [], errors: [], weakErrors: [],
    controlPending: false, controlReason: null, controlRequestedAt: null, masteryConfirmedAt: null,
    positiveCount: 0, partialCount: 0, negativeCount: 0, recentErrorAt: null, recentStrongErrorAt: null,
    lastResult: null, lastResultSource: null, lastResultStrength: null, lastResultAt: null, lastActivityAt: null,
  };
}

/** Action déclenchée par un signal : le moteur la transforme en besoin, réactivation, événement. */
export type TransitionAction =
  /** Besoin de travail sur l'item (révision prioritaire ou consolidation). */
  | { type: 'need_travail'; needType: 'review' | 'consolidate'; priority: 'prioritaire' | 'normale'; reason: string }
  /** Contrôle par une activité forte ou intermédiaire (control_pending). */
  | { type: 'need_controle'; reason: string }
  /** Le contrôle attendu a été réalisé (résultat fort/intermédiaire). */
  | { type: 'control_done'; result: 'positive' | 'partial' | 'incorrect' }
  | { type: 'mastery_lost' }
  | { type: 'mastery_confirmed' }
  /** Réactivation : l'item entre dans le cycle, ou la prochaine échéance est rapprochée. */
  | { type: 'review_cycle'; mode: 'enter' | 'closer' };

export type TransitionResult = {
  state: ItemState;
  oldStatus: MasteryStatus;
  newStatus: MasteryStatus;
  statusChanged: boolean;
  /** Explication courte (I§54) : pourquoi ce statut. */
  reason: string;
  actions: TransitionAction[];
  /** Le signal compte-t-il comme erreur faible distincte nouvelle ? */
  newDistinctWeakError: boolean;
};

const DAY = 86_400_000;
const ms = (iso: string) => Date.parse(iso);
const withinDays = (iso: string, now: string, days: number) => ms(now) - ms(iso) < days * DAY && ms(now) - ms(iso) >= -DAY;

/** Fenêtres d'historique conservées (les plus longues règles + marge). */
const KEEP_ERRORS_DAYS = 60;
const KEEP_POSITIVES = 24;

/** Élague les fenêtres glissantes à l'instant `now`. */
export function pruneState(state: ItemState, now: string, config: OrchestratorConfig): ItemState {
  const weakDays = config.weak_errors.window_days;
  return {
    ...state,
    weakErrors: state.weakErrors.filter((e) => withinDays(e.at, now, weakDays)),
    errors: state.errors.filter((e) => withinDays(e.at, now, Math.max(KEEP_ERRORS_DAYS, config.consolidated.no_error_days, config.on_track.no_strong_error_days))),
    positives: state.positives.slice(-KEEP_POSITIVES),
  };
}

/** Erreur forte/intermédiaire (incorrecte ou partielle) dans les `days` derniers jours ? */
function strongErrorWithin(state: ItemState, now: string, days: number): boolean {
  return state.errors.some((e) => isStrongOrIntermediate(e.s) && withinDays(e.at, now, days));
}
/** Erreur quelconque (incorrecte de toute force, partielle forte/intermédiaire) dans les `days` jours ? */
function anyErrorWithin(state: ItemState, now: string, days: number): boolean {
  return state.errors.some((e) => (!e.partial || isStrongOrIntermediate(e.s)) && withinDays(e.at, now, days));
}

/**
 * EN BONNE VOIE — règle d'entrée (I§12) : au moins 2 signaux positifs, dont au
 * moins 1 fort ou intermédiaire, aucune erreur forte ou intermédiaire dans les
 * 14 derniers jours.
 */
export function onTrackRule(state: ItemState, now: string, config: OrchestratorConfig): boolean {
  const c = config.on_track;
  const pos = state.positives;
  if (pos.length < c.min_positive) return false;
  if (pos.filter((p) => isStrongOrIntermediate(p.s)).length < c.min_strong_or_intermediate) return false;
  return !strongErrorWithin(state, now, c.no_strong_error_days);
}

/**
 * MAÎTRISE CONSOLIDÉE — règle d'entrée (I§13, O§17, Check-up §21) : il existe
 * 3 signaux positifs sur l'item dont au moins 2 forts ou intermédiaires,
 * répartis sur au moins 2 sessions distinctes, au moins 7 jours entre le
 * premier et le dernier, et aucune erreur sur l'item dans les 14 derniers jours.
 * Une accumulation de signaux faibles ne suffit jamais seule.
 */
export function consolidatedRule(state: ItemState, now: string, config: OrchestratorConfig): boolean {
  const c = config.consolidated;
  if (anyErrorWithin(state, now, c.no_error_days)) return false;
  return hasConsolidatingSubset(state.positives, c);
}

/** Existe-t-il un sous-ensemble de `c.positives` signaux qui satisfait la règle ? (recherche exacte, listes courtes) */
export function hasConsolidatingSubset(positives: PositiveMark[], c: OrchestratorConfig['consolidated']): boolean {
  const list = [...positives].sort((a, b) => a.at.localeCompare(b.at)).slice(-KEEP_POSITIVES);
  const n = list.length;
  const k = c.positives;
  if (n < k) return false;
  const idx: number[] = [];
  const ok = (sel: number[]): boolean => {
    const picked = sel.map((i) => list[i]);
    const strong = picked.filter((p) => isStrongOrIntermediate(p.s)).length;
    if (strong < c.min_strong_or_intermediate) return false;
    if (new Set(picked.map((p) => p.k)).size < c.min_sessions) return false;
    const spread = (ms(picked[picked.length - 1].at) - ms(picked[0].at)) / DAY;
    return spread >= c.min_spread_days;
  };
  const rec = (start: number): boolean => {
    if (idx.length === k) return ok(idx);
    for (let i = start; i <= n - (k - idx.length); i++) {
      idx.push(i);
      if (rec(i + 1)) return true;
      idx.pop();
    }
    return false;
  };
  return rec(0);
}

/**
 * Applique UN signal de maîtrise à l'état d'un item. Les signaux sans force
 * (échéance, réalisation) ne passent pas par ici : ils n'entrent jamais dans
 * l'arbitrage de maîtrise (O§13).
 */
export function applyResult(
  prev: ItemState,
  signal: Pick<PedagoSignal, 'source_strength' | 'result_type' | 'created_at' | 'origin_activity_id' | 'origin_question_id' | 'source'>,
  config: OrchestratorConfig,
): TransitionResult {
  const s = signal.source_strength;
  const r = signal.result_type;
  const at = signal.created_at;
  if (!s || (r !== 'positive' && r !== 'partial' && r !== 'incorrect')) {
    return { state: prev, oldStatus: prev.status, newStatus: prev.status, statusChanged: false, reason: prev.statusReason ?? '', actions: [], newDistinctWeakError: false };
  }
  const strongish = isStrongOrIntermediate(s);
  const q = signal.origin_question_id;
  const state = pruneState({ ...prev, positives: [...prev.positives], errors: [...prev.errors], weakErrors: [...prev.weakErrors] }, at, config);
  const old = state.status;
  const actions: TransitionAction[] = [];
  let next: MasteryStatus = old;
  let reason = state.statusReason ?? '';
  let newDistinctWeakError = false;

  state.lastActivityAt = maxIso(state.lastActivityAt, at);
  state.lastResult = r as 'positive' | 'partial' | 'incorrect';
  state.lastResultSource = signal.source;
  state.lastResultStrength = s;
  state.lastResultAt = at;

  // Contrôle : seule une activité forte ou intermédiaire peut le valider ou
  // l'infirmer (I§14) ; une source faible le laisse en attente.
  if (strongish && state.controlPending) {
    actions.push({ type: 'control_done', result: r as 'positive' | 'partial' | 'incorrect' });
    state.controlPending = false;
    state.controlReason = null;
    state.controlRequestedAt = null;
  }

  if (r === 'positive') {
    state.positiveCount++;
    state.positives.push({ at, s, k: signal.origin_activity_id, q });
    state.positives = state.positives.slice(-KEEP_POSITIVES);
    if (strongish) {
      switch (old) {
        case 'non_evalue':
          next = 'a_consolider';
          reason = 'Premier résultat positif sérieux : l’item doit encore être consolidé.';
          break;
        case 'a_revoir':
          next = 'a_consolider';
          reason = 'Progression : un résultat correct après des difficultés, la consolidation continue.';
          break;
        case 'a_consolider':
          if (onTrackRule(state, at, config)) { next = 'en_bonne_voie'; reason = 'Plusieurs résultats positifs récents, sans erreur sérieuse depuis 14 jours.'; }
          else reason = 'Résultat positif enregistré : la consolidation se poursuit.';
          break;
        case 'en_bonne_voie':
          if (consolidatedRule(state, at, config)) { next = 'maitrise_consolidee'; reason = 'Maîtrise confirmée par des résultats répétés, espacés et sans erreur récente.'; }
          else reason = 'Résultat positif enregistré : encore quelques confirmations espacées dans le temps.';
          break;
        case 'maitrise_consolidee':
          reason = 'Maîtrise confirmée et entretenue.';
          break;
      }
    } else {
      // Signal positif faible : enregistré, ne fait jamais monter le statut seul (I§7).
      reason = old === 'non_evalue' ? 'Bon résultat enregistré ; un résultat évaluatif confirmera le niveau.' : (state.statusReason ?? reason);
    }
    if (old === 'non_evalue' && next !== 'non_evalue') actions.push({ type: 'review_cycle', mode: 'enter' });
  } else if (r === 'partial') {
    state.partialCount++;
    state.errors.push({ at, s, q, partial: true });
    if (strongish) {
      // Partiel fort/intermédiaire → À consolider (I§8), quel que soit le statut.
      next = 'a_consolider';
      reason = 'Réponse partielle lors d’une activité évaluative : l’item est à consolider.';
      state.recentStrongErrorAt = at;
      state.positives = [];
      if (old === 'maitrise_consolidee') actions.push({ type: 'mastery_lost' });
      actions.push({ type: 'need_travail', needType: 'consolidate', priority: 'normale', reason: 'Réponse partielle : consolidation programmée.' });
      actions.push({ type: 'review_cycle', mode: old === 'non_evalue' ? 'enter' : 'closer' });
    } else if (old === 'non_evalue') {
      next = 'a_consolider';
      reason = 'Réponse partielle sur un item non encore évalué : à consolider.';
      actions.push({ type: 'need_travail', needType: 'consolidate', priority: 'normale', reason: 'Réponse partielle : consolidation programmée.' });
      actions.push({ type: 'review_cycle', mode: 'enter' });
    } else {
      // Partiel faible, item déjà évalué → statut conservé + révision de consolidation (I§8).
      actions.push({ type: 'need_travail', needType: 'consolidate', priority: 'normale', reason: 'Réponse partielle : une révision de consolidation est proposée.' });
    }
  } else {
    // Résultat incorrect (I§9).
    state.negativeCount++;
    state.recentErrorAt = at;
    state.errors.push({ at, s, q });
    if (strongish) {
      state.recentStrongErrorAt = at;
      state.positives = [];
      if (old === 'maitrise_consolidee') {
        // Première erreur forte/intermédiaire sur une maîtrise consolidée (I§10).
        next = 'a_consolider';
        reason = 'Erreur sur un item maîtrisé : consolidation et contrôle obligatoire.';
        actions.push({ type: 'mastery_lost' });
        actions.push({ type: 'need_travail', needType: 'review', priority: 'prioritaire', reason: 'Erreur sur un item maîtrisé : révision prioritaire.' });
        actions.push({ type: 'need_controle', reason: CONTROL_REASON_LABEL.maitrise_perdue });
        state.controlPending = true;
        state.controlReason = 'maitrise_perdue';
        state.controlRequestedAt = at;
      } else {
        next = 'a_revoir';
        reason = prev.controlPending && prev.controlReason === 'maitrise_perdue'
          ? 'Nouvelle erreur lors du contrôle : l’item est à revoir.'
          : 'Erreur lors d’une activité évaluative : l’item est à revoir en priorité.';
        actions.push({ type: 'need_travail', needType: 'review', priority: 'prioritaire', reason: 'Erreur détectée : révision prioritaire.' });
      }
      actions.push({ type: 'review_cycle', mode: old === 'non_evalue' ? 'enter' : 'closer' });
    } else {
      // Erreur faible : mémorisée comme erreur DISTINCTE (question_id + date) sur 14 jours glissants.
      const key = q ?? `${signal.origin_activity_id}:${at}`;
      if (!state.weakErrors.some((e) => e.q === key)) {
        state.weakErrors.push({ q: key, at });
        newDistinctWeakError = true;
      }
      const distinct = state.weakErrors.length;
      if (distinct >= config.weak_errors.threshold) {
        // Deux erreurs faibles distinctes sur le même item en 14 jours → À revoir (I§9, O§14).
        next = 'a_revoir';
        reason = 'Deux difficultés distinctes détectées récemment.';
        if (old === 'maitrise_consolidee') actions.push({ type: 'mastery_lost' });
        actions.push({ type: 'need_travail', needType: 'review', priority: 'prioritaire', reason: 'Deux difficultés distinctes détectées récemment : révision prioritaire.' });
        actions.push({ type: 'need_controle', reason: CONTROL_REASON_LABEL.deux_erreurs_faibles });
        state.controlPending = true;
        state.controlReason = 'deux_erreurs_faibles';
        state.controlRequestedAt = at;
        actions.push({ type: 'review_cycle', mode: old === 'non_evalue' ? 'enter' : 'closer' });
      } else if (old === 'non_evalue') {
        next = 'a_consolider';
        reason = 'Une difficulté détectée sur un item non encore évalué : à consolider.';
        actions.push({ type: 'need_travail', needType: 'review', priority: 'normale', reason: 'Erreur détectée : une révision est proposée.' });
        actions.push({ type: 'review_cycle', mode: 'enter' });
      } else {
        // Item déjà évalué (y compris maîtrise consolidée) : statut conservé,
        // révision prioritaire et réactivation de contrôle (I§9, §10).
        actions.push({ type: 'need_travail', needType: 'review', priority: 'prioritaire', reason: 'Erreur détectée : révision prioritaire.' });
        actions.push({ type: 'need_controle', reason: CONTROL_REASON_LABEL.erreur_faible });
        state.controlPending = true;
        state.controlReason = state.controlReason ?? 'erreur_faible';
        state.controlRequestedAt = state.controlRequestedAt ?? at;
        reason = old === 'maitrise_consolidee'
          ? 'Maîtrise conservée malgré une erreur isolée ; un contrôle est programmé.'
          : (state.statusReason ?? reason);
      }
    }
  }

  if (next === 'maitrise_consolidee' && old !== 'maitrise_consolidee') {
    actions.push({ type: 'mastery_confirmed' });
    state.masteryConfirmedAt = at;
  }
  if (next !== 'maitrise_consolidee' && old === 'maitrise_consolidee') state.masteryConfirmedAt = null;
  const changed = next !== old;
  state.status = next;
  state.statusReason = reason;
  if (changed) state.statusChangedAt = at;
  return { state, oldStatus: old, newStatus: next, statusChanged: changed, reason, actions: dedupeActions(actions), newDistinctWeakError };
}

function dedupeActions(actions: TransitionAction[]): TransitionAction[] {
  const seen = new Set<string>();
  const out: TransitionAction[] = [];
  for (const a of actions) {
    const key = a.type === 'need_travail' ? `need_travail` : a.type;
    if (seen.has(key)) {
      // Deux besoins de travail : le plus exigeant l'emporte (review > consolidate, prioritaire > normale).
      if (a.type === 'need_travail') {
        const i = out.findIndex((x) => x.type === 'need_travail');
        const cur = out[i] as Extract<TransitionAction, { type: 'need_travail' }>;
        if ((a.needType === 'review' && cur.needType !== 'review') || (a.priority === 'prioritaire' && cur.priority !== 'prioritaire')) {
          out[i] = { ...cur, needType: a.needType === 'review' ? 'review' : cur.needType, priority: a.priority === 'prioritaire' ? 'prioritaire' : cur.priority, reason: a.reason };
        }
      }
      continue;
    }
    seen.add(key);
    out.push(a);
  }
  return out;
}

function maxIso(a: string | null, b: string): string {
  return !a || b > a ? b : a;
}

/** Applique une suite de signaux dans l'ordre chronologique. */
export function applyResults(
  state: ItemState,
  signals: Pick<PedagoSignal, 'source_strength' | 'result_type' | 'created_at' | 'origin_activity_id' | 'origin_question_id' | 'source'>[],
  config: OrchestratorConfig,
): { state: ItemState; results: TransitionResult[] } {
  const results: TransitionResult[] = [];
  let cur = state;
  for (const sg of [...signals].sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    const r = applyResult(cur, sg, config);
    results.push(r);
    cur = r.state;
  }
  return { state: cur, results };
}

/** Le statut a-t-il monté ou descendu ? */
export function statusDirection(from: MasteryStatus, to: MasteryStatus): 'up' | 'down' | 'same' {
  if (from === to) return 'same';
  if (from === 'non_evalue') return to === 'a_revoir' ? 'down' : 'up';
  return STATUS_RANK[to] > STATUS_RANK[from] ? 'up' : 'down';
}

/** Phrase lisible d'un changement de statut (I§33, I§54). */
export function describeTransition(from: MasteryStatus, to: MasteryStatus): string {
  return `${STATUS_LABEL[from]} → ${STATUS_LABEL[to]}`;
}

/** Résultat d'une question selon le barème (Check-up §9, I§16) : 1 = correct, 0,5 = partiel, 0,2 / 0 = incorrect. */
export function resultFromPoints(points: number): Extract<ResultType, 'positive' | 'partial' | 'incorrect'> {
  if (points >= 0.999) return 'positive';
  if (points >= 0.5 - 1e-9) return 'partial';
  return 'incorrect';
}
