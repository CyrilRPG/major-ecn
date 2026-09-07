/**
 * Dates du module de suivi — module PUR, fuseau Europe/Paris.
 *
 * POURQUOI. Les créneaux sont saisis en heure de Paris (« lundi 9 h ») mais
 * stockés en UTC (`timestamptz`). Le dépôt n'embarque pas date-fns : la
 * conversion locale → UTC passe par `Intl.DateTimeFormat`, qui connaît les
 * changements d'heure, et fonctionne à l'identique côté client, serveur et
 * dans les tests Node.
 */
export const PARIS_TZ = 'Europe/Paris';

export type DayKey = string; // 'YYYY-MM-DD'

const partsFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: PARIS_TZ,
  hourCycle: 'h23',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
});

export type ParisParts = { y: number; m: number; d: number; h: number; min: number; s: number };

/** Décompose un instant en composantes heure de Paris. */
export function parisParts(date: Date): ParisParts {
  const parts = partsFmt.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { y: get('year'), m: get('month'), d: get('day'), h: get('hour'), min: get('minute'), s: get('second') };
}

/** Décalage (minutes) entre l'heure de Paris et l'UTC à un instant donné. */
function offsetMinutesAt(utcMs: number): number {
  const p = parisParts(new Date(utcMs));
  const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s);
  return Math.round((asUtc - utcMs) / 60_000);
}

/** « 2026-01-12 » + « 09:00 » (heure de Paris) → instant UTC. */
export function zonedToUtc(day: DayKey, time: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm ?? 0);
  const off1 = offsetMinutesAt(guess);
  let utc = guess - off1 * 60_000;
  // À la frontière d'un changement d'heure, le premier décalage peut être faux :
  // on recalcule une fois avec l'instant corrigé.
  const off2 = offsetMinutesAt(utc);
  if (off2 !== off1) utc = guess - off2 * 60_000;
  return new Date(utc);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Clé jour heure de Paris d'un instant. */
export function dayKeyOf(date: Date | string): DayKey {
  const p = parisParts(typeof date === 'string' ? new Date(date) : date);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}

export function todayKey(now: Date = new Date()): DayKey {
  return dayKeyOf(now);
}

/** Ajoute n jours à une clé jour (calendaire, sans fuseau). */
export function addDays(day: DayKey, n: number): DayKey {
  const [y, m, d] = day.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** Jour ISO (1 = lundi … 7 = dimanche) d'une clé jour. */
export function isoWeekday(day: DayKey): number {
  const [y, m, d] = day.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return wd === 0 ? 7 : wd;
}

/** Lundi de la semaine contenant la clé jour. */
export function weekStart(day: DayKey): DayKey {
  return addDays(day, 1 - isoWeekday(day));
}

/** Premier jour du mois d'une clé jour. */
export function monthStart(day: DayKey): DayKey {
  return `${day.slice(0, 7)}-01`;
}

export function addMonths(day: DayKey, n: number): DayKey {
  const [y, m] = day.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-01`;
}

/** Nombre de jours d'un mois. */
export function daysInMonth(day: DayKey): number {
  const [y, m] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Lundi de la semaine ISO n de l'année y. */
export function isoWeekToMonday(year: number, week: number): DayKey {
  // Le 4 janvier est toujours dans la semaine ISO 1.
  const jan4 = `${year}-01-04`;
  return addDays(weekStart(jan4), (week - 1) * 7);
}

export function isValidDayKey(s: unknown): s is DayKey {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
}

/* ─── Affichage fr-FR ─── */
const fmtLong = new Intl.DateTimeFormat('fr-FR', { timeZone: PARIS_TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fmtShort = new Intl.DateTimeFormat('fr-FR', { timeZone: PARIS_TZ, day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtMedium = new Intl.DateTimeFormat('fr-FR', { timeZone: PARIS_TZ, weekday: 'short', day: 'numeric', month: 'short' });
const fmtTimeF = new Intl.DateTimeFormat('fr-FR', { timeZone: PARIS_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const fmtMonthYear = new Intl.DateTimeFormat('fr-FR', { timeZone: PARIS_TZ, month: 'long', year: 'numeric' });

function toDate(v: Date | string | null | undefined): Date | null {
  if (!v) return null;
  const d = typeof v === 'string' ? new Date(v) : v;
  return Number.isNaN(d.getTime()) ? null : d;
}

/** « lundi 12 janvier 2026 » */
export function fmtDateLong(v: Date | string | null | undefined): string {
  const d = toDate(v);
  return d ? fmtLong.format(d) : '—';
}
/** « 12/01/2026 » */
export function fmtDateShort(v: Date | string | null | undefined): string {
  const d = toDate(v);
  return d ? fmtShort.format(d) : '—';
}
/** « lun. 12 janv. » */
export function fmtDateMedium(v: Date | string | null | undefined): string {
  const d = toDate(v);
  return d ? fmtMedium.format(d) : '—';
}
/** « 09:10 » */
export function fmtTime(v: Date | string | null | undefined): string {
  const d = toDate(v);
  return d ? fmtTimeF.format(d) : '—';
}
/** « 12/01/2026 à 09:10 » */
export function fmtDateTime(v: Date | string | null | undefined): string {
  const d = toDate(v);
  return d ? `${fmtShort.format(d)} à ${fmtTimeF.format(d)}` : '—';
}
/** « janvier 2026 » */
export function fmtMonthLabel(day: DayKey): string {
  return fmtMonthYear.format(zonedToUtc(day, '12:00'));
}
/** Clé jour → « lundi 12 janvier 2026 » */
export function fmtDayKeyLong(day: DayKey): string {
  return fmtLong.format(zonedToUtc(day, '12:00'));
}
export function fmtDayKeyMedium(day: DayKey): string {
  return fmtMedium.format(zonedToUtc(day, '12:00'));
}

/** Durée en minutes → « 2 h 30 » / « 40 min ». */
export function fmtMinutes(total: number): string {
  const m = Math.max(0, Math.round(total));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} min`;
  return r === 0 ? `${h} h` : `${h} h ${pad(r)}`;
}

export function minutesBetween(a: string | Date, b: string | Date): number {
  const da = toDate(a); const db = toDate(b);
  if (!da || !db) return 0;
  return Math.round((db.getTime() - da.getTime()) / 60_000);
}

/** Valeur pour un `<input type="datetime-local">` en heure de Paris. */
export function toLocalInputValue(v: Date | string | null | undefined): string {
  const d = toDate(v);
  if (!d) return '';
  const p = parisParts(d);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}T${pad(p.h)}:${pad(p.min)}`;
}

/** Inverse de `toLocalInputValue` : « 2026-01-12T09:00 » (Paris) → ISO UTC. */
export function fromLocalInputValue(s: string): string | null {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(s);
  if (!m) return null;
  const d = zonedToUtc(m[1], m[2]);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
