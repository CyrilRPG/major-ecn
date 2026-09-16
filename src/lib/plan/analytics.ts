/**
 * Analytics (§21, complément §6, §11) — module PUR.
 *
 * Deux notions TOUJOURS distinctes :
 *  - l'avancement du planning (séances réalisées / prévues) ;
 *  - la couverture du programme (items maîtrisés ou à consolider / total).
 * « 100 % du planning réalisé » ne signifie jamais « 100 % du programme maîtrisé ».
 */
import { deriveStatus, type MasteryValue } from './mastery';
import type { MasteryStatus, PlanConfig, PlanItem, PlanSession } from './types';

export type ItemStatusRow = { item: PlanItem; status: MasteryStatus; mastery: MasteryValue | null };

export type CoverageReport = {
  total: number;
  counts: Record<MasteryStatus, number>;
  /** (maîtrisés + à réactiver + à consolider) / total, en % entier. */
  coveragePct: number;
  masteredPct: number;
  /** Items insuffisamment travaillés (non évalués, à travailler, programmés, en cours). */
  insufficientIds: string[];
};

export function computeCoverage(rows: ItemStatusRow[]): CoverageReport {
  const counts: Record<MasteryStatus, number> = { non_evalue: 0, a_travailler: 0, programme: 0, en_cours: 0, a_consolider: 0, maitrise: 0, a_reactiver: 0 };
  for (const r of rows) counts[r.status]++;
  const total = rows.length;
  const covered = counts.maitrise + counts.a_reactiver + counts.a_consolider;
  const insufficient = rows.filter((r) => ['non_evalue', 'a_travailler', 'programme', 'en_cours'].includes(r.status)).map((r) => r.item.id);
  return {
    total,
    counts,
    coveragePct: total > 0 ? Math.round((covered / total) * 100) : 0,
    masteredPct: total > 0 ? Math.round(((counts.maitrise + counts.a_reactiver) / total) * 100) : 0,
    insufficientIds: insufficient,
  };
}

export type PlanExecution = {
  planned: number;
  done: number;
  postponed: number;
  skipped: number;
  /** % de séances terminées parmi celles prévues sur la période (hors annulées). */
  pct: number;
  plannedMinutes: number;
  doneMinutes: number;
};

export function computeExecution(sessions: PlanSession[], from: string, to: string): PlanExecution {
  const inRange = sessions.filter((s) => s.day >= from && s.day <= to && s.status !== 'annulee');
  const done = inRange.filter((s) => s.status === 'terminee');
  const postponed = inRange.filter((s) => s.status === 'reportee').length;
  const skipped = inRange.filter((s) => s.status === 'sautee').length;
  const planned = inRange.length;
  return {
    planned, done: done.length, postponed, skipped,
    pct: planned > 0 ? Math.round((done.length / planned) * 100) : 0,
    plannedMinutes: inRange.reduce((n, s) => n + s.minutes, 0),
    doneMinutes: done.reduce((n, s) => n + (s.actual_minutes ?? s.minutes), 0),
  };
}

/** Niveau de maîtrise estimé global : moyenne des scores (items non évalués comptés à 0). */
export function estimatedMastery(rows: ItemStatusRow[]): number {
  if (rows.length === 0) return 0;
  const sum = rows.reduce((n, r) => n + (r.mastery?.score ?? 0), 0);
  return Math.round(sum / rows.length);
}

export type StatusDerivationInput = {
  items: PlanItem[];
  mastery: Map<string, { score: number; confidence: number; lastEvaluatedAt: string | null; reactivationCount: number; minutesDone: number }>;
  sessions: PlanSession[];
  now: Date;
  config: PlanConfig;
};

/** Statut de chaque item du programme (complément §5). */
export function deriveItemStatuses(input: StatusDerivationInput): ItemStatusRow[] {
  const planned = new Set(input.sessions.filter((s) => s.status === 'planifiee' || s.status === 'en_cours').map((s) => s.item_id));
  const started = new Set(input.sessions.filter((s) => s.status === 'terminee' || s.status === 'en_cours').map((s) => s.item_id));
  return input.items.map((item) => {
    const m = input.mastery.get(item.id);
    const mastery = m && m.confidence > 0 ? { score: m.score, confidence: m.confidence } : null;
    const status = deriveStatus({
      mastery,
      hasPlannedSession: planned.has(item.id),
      hasStartedWork: started.has(item.id) || (m?.minutesDone ?? 0) > 0,
      lastEvaluatedAt: m?.lastEvaluatedAt ?? null,
      reactivationCount: m?.reactivationCount ?? 0,
      now: input.now,
      config: input.config,
    });
    return { item, status, mastery };
  });
}

export function fmtMinutes(total: number): string {
  const m = Math.max(0, Math.round(total));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} min`;
  return r === 0 ? `${h} h` : `${h} h ${String(r).padStart(2, '0')}`;
}
