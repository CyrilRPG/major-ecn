/**
 * Revision Engine (§16) — répétition espacée, module PUR.
 *
 * Intervalles de base configurables (J+7 → J+14 → J+30 → J+60), modulés par
 * le résultat : un excellent résultat espace davantage, un échec rapproche.
 */
import type { PlanConfig } from './types';

/**
 * Prochain intervalle (jours) après la `count`-ième réactivation, en fonction
 * du dernier score (0–100) : ≥ 90 % → intervalle ×1,5 ; < seuil de
 * consolidation → intervalle ÷2 (jamais moins de 2 jours).
 */
export function nextInterval(count: number, lastScore: number | null, config: PlanConfig): number {
  const list = config.intervals_days;
  const base = list[Math.min(Math.max(0, count), list.length - 1)] ?? 7;
  if (lastScore === null) return base;
  if (lastScore >= 90) return Math.round(base * 1.5);
  if (lastScore < config.thresholds.consolidation) return Math.max(2, Math.round(base / 2));
  return base;
}

/**
 * Dates (clé jour) des réactivations à venir d'un item validé le jour
 * `fromDay`, jusqu'à `untilDay` exclu : une par intervalle successif.
 */
export function reactivationDays(fromDay: string, untilDay: string, startCount: number, lastScore: number | null, config: PlanConfig): string[] {
  const out: string[] = [];
  let cursor = fromDay;
  let count = startCount;
  for (let k = 0; k < config.intervals_days.length - startCount && k < 8; k++) {
    const interval = nextInterval(count, lastScore, config);
    cursor = addDaysKey(cursor, interval);
    if (cursor >= untilDay) break;
    out.push(cursor);
    count++;
  }
  return out;
}

const pad = (n: number) => String(n).padStart(2, '0');
export function addDaysKey(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}
export function daysBetween(from: string, to: string): number {
  const [y1, m1, d1] = from.split('-').map(Number);
  const [y2, m2, d2] = to.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}
export function isoWeekdayKey(day: string): '1' | '2' | '3' | '4' | '5' | '6' | '7' {
  const [y, m, d] = day.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return String(wd === 0 ? 7 : wd) as '1' | '2' | '3' | '4' | '5' | '6' | '7';
}
