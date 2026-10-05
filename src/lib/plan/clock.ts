/**
 * Horloges du planificateur (§18.1) — module PUR.
 *
 * Deux horloges sont utilisées volontairement :
 *  - calculs liés à l'EVC et à l'orchestrateur : Europe/Paris (jour civil) ;
 *  - clôture de la journée de travail : fuseau du candidat (`candidate_timezone`,
 *    repli Europe/Paris), à `close_time` (04:00) — une journée de travail va
 *    de 04:00 à 04:00 le lendemain, heure locale du candidat.
 */
export type DayKey = string;
export const PARIS_TZ = 'Europe/Paris';

const pad = (n: number) => String(n).padStart(2, '0');

type Parts = { y: number; m: number; d: number; h: number; min: number };
const fmtCache = new Map<string, Intl.DateTimeFormat>();
function formatter(tz: string): Intl.DateTimeFormat {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    fmtCache.set(tz, f);
  }
  return f;
}
export function safeTimezone(tz: string | null | undefined, fallback = PARIS_TZ): string {
  if (!tz) return fallback;
  try { formatter(tz); return tz; } catch { return fallback; }
}
function partsIn(date: Date, tz: string): Parts {
  const o: Record<string, number> = {};
  for (const p of formatter(tz).formatToParts(date)) if (p.type !== 'literal') o[p.type] = Number(p.value);
  return { y: o.year, m: o.month, d: o.day, h: o.hour === 24 ? 0 : o.hour, min: o.minute };
}

export function dayKeyIn(date: Date, tz: string): DayKey {
  const p = partsIn(date, tz);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}
/** Jour civil de Paris (horloge EVC / orchestrateur). */
export function parisDay(date: Date | string): DayKey {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const d = typeof date === 'string' ? new Date(date) : date;
  return Number.isNaN(d.getTime()) ? String(date).slice(0, 10) : dayKeyIn(d, PARIS_TZ);
}

export function addDays(day: DayKey, n: number): DayKey {
  const [y, m, d] = day.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}
export function daysBetween(from: DayKey, to: DayKey): number {
  const [y1, m1, d1] = from.split('-').map(Number);
  const [y2, m2, d2] = to.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}
/** Jour ISO (1 = lundi … 7 = dimanche). */
export function isoWeekday(day: DayKey): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const [y, m, d] = day.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return (wd === 0 ? 7 : wd) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}
export function weekStart(day: DayKey): DayKey {
  return addDays(day, 1 - isoWeekday(day));
}

function minutesOf(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Journée de travail en cours pour le candidat : avant `closeTime` (04:00
 * locale), on est encore dans la journée de la veille.
 */
export function workDay(now: Date, tz: string, closeTime: string): DayKey {
  const p = partsIn(now, safeTimezone(tz));
  const local = `${p.y}-${pad(p.m)}-${pad(p.d)}`;
  return p.h * 60 + p.min < minutesOf(closeTime) ? addDays(local, -1) : local;
}

/** Instant UTC correspondant à `day` + `time` dans le fuseau `tz`. */
export function zonedInstant(day: DayKey, time: string, tz: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  const mins = minutesOf(time);
  const guess = Date.UTC(y, m - 1, d, Math.floor(mins / 60), mins % 60);
  const offsetAt = (utc: number) => {
    const p = partsIn(new Date(utc), tz);
    return (Date.UTC(p.y, p.m - 1, p.d, p.h, p.min) - utc) / 60_000;
  };
  const off1 = offsetAt(guess);
  let utc = guess - off1 * 60_000;
  const off2 = offsetAt(utc);
  if (off2 !== off1) utc = guess - off2 * 60_000;
  return new Date(utc);
}

/** Fenêtre [début, fin[ d'une journée de travail (04:00 → 04:00 locale). */
export function workDayWindow(day: DayKey, tz: string, closeTime: string): { start: Date; end: Date } {
  const zone = safeTimezone(tz);
  return { start: zonedInstant(day, closeTime, zone), end: zonedInstant(addDays(day, 1), closeTime, zone) };
}

/** Journée de travail à laquelle appartient un instant (heure locale du candidat). */
export function workDayOf(at: Date | string, tz: string, closeTime: string): DayKey {
  return workDay(typeof at === 'string' ? new Date(at) : at, tz, closeTime);
}

/** Âge en jours (fractionnaire) entre deux instants. */
export function ageDays(from: string | Date, now: Date): number {
  const t = typeof from === 'string' ? Date.parse(from) : from.getTime();
  return Number.isFinite(t) ? Math.max(0, (now.getTime() - t) / 86_400_000) : 0;
}

export function isDayKey(v: unknown): v is DayKey {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
}
