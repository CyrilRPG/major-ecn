/**
 * Barème du Check-up (§8 à §10, §14, §15, §18) — module PUR.
 *
 * Toute question vaut au plus 1 point :
 *  - QRU : correcte = 1 ; incorrecte ou non répondue = 0 ;
 *  - QRM (discordance EVC Arena) : 0 discordance = 1 ; 1 = 0,5 ; 2 = 0,2 ;
 *    3 ou plus = 0. Discordance = bonne proposition oubliée OU mauvaise
 *    proposition cochée ;
 *  - QROC : auto-correction sans IA — correcte = 1, partielle = 0,5,
 *    incorrecte = 0 ; une QROC laissée VIDE vaut 0 automatiquement.
 * Score = points obtenus / points possibles × 100 ; une question non
 * répondue vaut 0. En voie externe, un dossier vaut points / nombre de ses
 * questions et le score global = total obtenu / total possible (jamais la
 * moyenne de dossiers de tailles différentes, §18).
 */
import type { CheckupConfig, QuestionResult, QuestionType } from './types';

export type QcmItemTruth = { lettre: string; is_correct: boolean };

export type ScoredAnswer = {
  points: number;
  result: QuestionResult;
  discordances: number | null;
  /** Origine du résultat (§19) : automatique, auto-évalué, ou QROC vide. */
  origin: 'auto' | 'auto_evaluee' | 'vide';
  answered: boolean;
};

/** Points QRM selon le nombre de discordances. */
export function qrmPoints(discordances: number, table: CheckupConfig['qrm_points']): number {
  if (discordances <= 0) return table[0];
  if (discordances === 1) return table[1];
  if (discordances === 2) return table[2];
  return table[3];
}

/** Lecture pédagogique (§9, §20) : 1 = correct ; 0,5 = à consolider ; 0,2 ou 0 = à revoir. */
export function resultOf(points: number): QuestionResult {
  if (points >= 0.999) return 'correct';
  if (points >= 0.5 - 1e-9) return 'partial';
  return 'incorrect';
}

export function normalizeSelection(selected: unknown, items: QcmItemTruth[]): string[] {
  if (!Array.isArray(selected)) return [];
  const letters = new Set(items.map((i) => i.lettre));
  return Array.from(new Set(selected.filter((x): x is string => typeof x === 'string' && letters.has(x)))).sort();
}

export function scoreQcm(type: 'QRU' | 'QRM', items: QcmItemTruth[], selectedRaw: unknown, config: CheckupConfig): ScoredAnswer {
  const selected = normalizeSelection(selectedRaw, items);
  if (selected.length === 0) {
    // Non répondue = 0, quel que soit le barème (§10).
    return { points: 0, result: 'incorrect', discordances: null, origin: 'auto', answered: false };
  }
  const chosen = new Set(selected);
  const discordances = items.filter((it) => it.is_correct !== chosen.has(it.lettre)).length;
  if (type === 'QRU') {
    const ok = selected.length === 1 && items.some((it) => it.is_correct && it.lettre === selected[0]);
    return { points: ok ? 1 : 0, result: ok ? 'correct' : 'incorrect', discordances, origin: 'auto', answered: true };
  }
  const points = qrmPoints(discordances, config.qrm_points);
  return { points, result: resultOf(points), discordances, origin: 'auto', answered: true };
}

/** Une réponse QROC est-elle vide (rien de rédigé) ? */
export function isBlankText(text: unknown): boolean {
  return typeof text !== 'string' || text.replace(/\s+/g, '').length === 0;
}

/**
 * QROC (§14, §15) : vide → 0 automatique ; rédigée → auto-correction du
 * candidat. Tant que l'auto-correction n'est pas faite : AUCUN zéro attribué
 * (null : résultat en attente).
 */
export function scoreQroc(text: unknown, selfGrade: QuestionResult | null): ScoredAnswer | null {
  if (isBlankText(text)) return { points: 0, result: 'incorrect', discordances: null, origin: 'vide', answered: false };
  if (!selfGrade) return null;
  const points = selfGrade === 'correct' ? 1 : selfGrade === 'partial' ? 0.5 : 0;
  return { points, result: selfGrade, discordances: null, origin: 'auto_evaluee', answered: true };
}

export type ScoredQuestion = { type: QuestionType; points: number | null; block: number; dossierId: string | null };

/**
 * Score d'ensemble. Une question encore en attente d'auto-correction compte
 * dans les points POSSIBLES mais n'a pas de score : `pending` > 0 empêche tout
 * score définitif (§15).
 */
export function aggregate(questions: ScoredQuestion[]): { obtained: number; possible: number; percent: number; pending: number } {
  let obtained = 0;
  let pending = 0;
  for (const q of questions) {
    if (q.points === null) pending++;
    else obtained += q.points;
  }
  const possible = questions.length;
  return { obtained: round2(obtained), possible, percent: possible > 0 ? round2((obtained / possible) * 100) : 0, pending };
}

/** Score de dossier/bloc (§18) : points / nombre de questions du bloc. */
export function blockScores(questions: ScoredQuestion[]): { block: number; obtained: number; possible: number; percent: number }[] {
  const by = new Map<number, ScoredQuestion[]>();
  for (const q of questions) by.set(q.block, [...(by.get(q.block) ?? []), q]);
  return Array.from(by.entries()).sort((a, b) => a[0] - b[0]).map(([block, list]) => {
    const a = aggregate(list);
    return { block, obtained: a.obtained, possible: a.possible, percent: a.percent };
  });
}

export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

/**
 * Affichage d'un sous-score (C§21) : au moins 5 questions → pourcentage et
 * fraction (« 70 % (7/10) ») ; moins de 5 → la fraction seule (« 1/2 »). Le
 * score GLOBAL reste affiché en pourcentage.
 */
export function formatSubscore(obtained: number, possible: number): string {
  const frac = `${fmtPoints(obtained)}/${possible}`;
  if (possible < 5) return frac;
  return `${Math.round((obtained / possible) * 100)} % (${frac})`;
}
export function fmtPoints(v: number): string {
  return Number.isInteger(v) ? String(v) : String(round2(v)).replace('.', ',');
}
