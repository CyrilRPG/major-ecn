/**
 * Dates du module de relances — TOUT calcul d'échéance se fait en JOUR
 * CALENDAIRE DE PARIS (Europe/Paris), jamais en UTC : « J+7 » d'un accès créé
 * le 3 à 23 h 30 (heure de Paris) tombe le 10, pas le 11. Jamais de
 * `toISOString().slice(0, 10)` ici.
 *
 * Module PUR (client et serveur).
 */

const TZ = 'Europe/Paris';

const FMT_PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

type Parts = { y: number; m: number; d: number; h: number; mi: number; s: number };

function parts(ms: number): Parts {
  const o: Record<string, string> = {};
  for (const p of FMT_PARTS.formatToParts(new Date(ms))) o[p.type] = p.value;
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second };
}

const pad = (n: number, l = 2) => String(n).padStart(l, '0');

function ms(d: Date | string | number): number {
  return typeof d === 'number' ? d : typeof d === 'string' ? Date.parse(d) : d.getTime();
}

/** Jour calendaire de Paris, « AAAA-MM-JJ ». */
export function jourParis(d: Date | string | number): string {
  const p = parts(ms(d));
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}

/** Heure de Paris, « HH:MM ». */
export function heureParis(d: Date | string | number): string {
  const p = parts(ms(d));
  return `${pad(p.h)}:${pad(p.mi)}`;
}

function utcDuJour(jour: string): number {
  const [y, m, d] = jour.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Jour calendaire + n jours (arithmétique de dates pures, sans fuseau). */
export function ajouterJours(jour: string, n: number): string {
  const t = new Date(utcDuJour(jour) + n * 86_400_000);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** Nombre de jours calendaires de `a` à `b` (b − a). */
export function ecartJours(a: string, b: string): number {
  return Math.round((utcDuJour(b) - utcDuJour(a)) / 86_400_000);
}

export function maxJour(a: string, b: string | null | undefined): string {
  return b && b > a ? b : a;
}

/** Décalage de Paris (minutes) à l'instant UTC donné. */
function decalageParis(utcMs: number): number {
  const p = parts(utcMs);
  return (Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - utcMs) / 60_000;
}

/**
 * Date + heure SAISIES en heure de Paris → instant ISO (UTC). Sert à la saisie
 * et à l'import de l'historique (« 12/09/2026 14:30 » = heure de Paris).
 */
export function parisVersIso(jour: string, heure = '12:00'): string {
  const [y, m, d] = jour.split('-').map(Number);
  const [h, mi] = heure.split(':').map(Number);
  const naif = Date.UTC(y, m - 1, d, h || 0, mi || 0);
  let t = naif - decalageParis(naif) * 60_000;
  t = naif - decalageParis(t) * 60_000;
  return new Date(t).toISOString();
}

/** « 30/09/2026 » (jour de Paris). */
export function formatJour(d: Date | string | number | null | undefined): string {
  if (d === null || d === undefined || d === '') return '';
  const j = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : jourParis(d);
  const [y, m, dd] = j.split('-');
  return `${dd}/${m}/${y}`;
}

/** « 30/09/2026 14:05 » (heure de Paris). */
export function formatDateHeure(d: Date | string | number | null | undefined): string {
  if (d === null || d === undefined || d === '') return '';
  return `${formatJour(d)} ${heureParis(d)}`;
}

/** Durée lisible : « 3 h 20 », « 2 j 4 h », « 12 min ». */
export function formatDuree(sec: number | null | undefined): string {
  if (sec === null || sec === undefined || !Number.isFinite(sec)) return '';
  const s = Math.max(0, Math.round(sec));
  const j = Math.floor(s / 86_400), h = Math.floor((s % 86_400) / 3600), m = Math.floor((s % 3600) / 60);
  if (j > 0) return h > 0 ? `${j} j ${h} h` : `${j} j`;
  if (h > 0) return m > 0 ? `${h} h ${pad(m)}` : `${h} h`;
  return `${m} min`;
}

/** Lit « JJ/MM/AAAA », « AAAA-MM-JJ » ou « JJ-MM-AAAA » → « AAAA-MM-JJ » (null si invalide). */
export function lireJour(s: string): string | null {
  const t = s.trim();
  let y: number, m: number, d: number;
  let r = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (r) { y = +r[1]; m = +r[2]; d = +r[3]; }
  else if ((r = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(t))) { d = +r[1]; m = +r[2]; y = +r[3]; }
  else return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Lit « 14:30 », « 14h30 », « 9h » → « HH:MM » (null si invalide). */
export function lireHeure(s: string): string | null {
  const r = /^(\d{1,2})\s*[:hH]\s*(\d{2})?$/.exec(s.trim());
  if (!r) return null;
  const h = +r[1], m = r[2] ? +r[2] : 0;
  if (h > 23 || m > 59) return null;
  return `${pad(h)}:${pad(m)}`;
}
