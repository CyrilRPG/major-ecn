/**
 * EVC Arena — temps et fuseaux (cahier des charges §2.4, §5).
 *
 * Stockage UTC ; affichage en heure de Paris avec rappel explicite, et en heure
 * locale du visiteur quand elle diffère ; comptes à rebours en temps restant,
 * jamais en heure absolue. Module pur, utilisable côté client et serveur.
 */

export const PARIS_TZ = 'Europe/Paris';

const dateFmt = (tz: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: tz });
const dateYearFmt = (tz: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: tz });
const timeFmt = (tz: string) => new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: tz });
const weekdayFmt = (tz: string) => new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz });

export function toDate(v: string | Date | null | undefined): Date | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** « 09h00 » */
export function hourLabel(d: Date, tz = PARIS_TZ): string {
  return timeFmt(tz).format(d).replace(':', 'h');
}

/** « 20 septembre » */
export function dayLabel(d: Date, tz = PARIS_TZ, withYear = false): string {
  return (withYear ? dateYearFmt(tz) : dateFmt(tz)).format(d);
}

/** « samedi 20 septembre » */
export function weekdayLabel(d: Date, tz = PARIS_TZ): string {
  return weekdayFmt(tz).format(d);
}

/** « 20 septembre à 09h00 (heure de Paris) » */
export function parisLabel(d: Date, withYear = false): string {
  return `${dayLabel(d, PARIS_TZ, withYear)} à ${hourLabel(d)} (heure de Paris)`;
}

/**
 * « 20 septembre à 09h00 (heure de Paris) — soit 08h00 chez vous » (§5.1).
 * Sans fuseau, ou si c'est celui de Paris, la mention locale est omise.
 */
export function parisAndLocalLabel(d: Date, tz: string | null | undefined, withYear = false): string {
  const base = parisLabel(d, withYear);
  if (!tz || tz === PARIS_TZ) return base;
  try {
    const local = timeFmt(tz).format(d);
    const paris = timeFmt(PARIS_TZ).format(d);
    if (local === paris) return base;
    const sameDay = dateFmt(tz).format(d) === dateFmt(PARIS_TZ).format(d);
    return `${base} — soit ${local.replace(':', 'h')}${sameDay ? '' : ` le ${dateFmt(tz).format(d)}`} chez vous`;
  } catch {
    return base;
  }
}

/** Fuseau du navigateur, ou null si indisponible. */
export function browserTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

/** Temps restant lisible : « 3 j 12 h », « 3 h 12 », « 7 min », « 45 s ». */
export function remainingLabel(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d >= 1) return `${d} j ${h.toString().padStart(2, '0')} h`;
  if (h >= 1) return `${h} h ${m.toString().padStart(2, '0')}`;
  if (m >= 1) return `${m} min`;
  return `${s} s`;
}

/** « 8:32 » */
export function clockLabel(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

/** « 7 minutes » / « 1 minute » — pour l'avertissement de durée réduite (§2.4). */
export function minutesLabel(seconds: number): string {
  const m = Math.max(1, Math.floor(seconds / 60));
  return `${m} minute${m > 1 ? 's' : ''}`;
}

/* ------------------------------------------------------------------ */
/* Fenêtres de manche et de tentative                                  */
/* ------------------------------------------------------------------ */

export type RoundWindow = { opens_at: string | Date | null; closes_at: string | Date | null; duration_minutes: number | null };
export type RoundState = 'unscheduled' | 'upcoming' | 'open' | 'closed';

export function roundState(r: RoundWindow, now: Date = new Date()): RoundState {
  const o = toDate(r.opens_at);
  const c = toDate(r.closes_at);
  if (!o || !c) return 'unscheduled';
  if (now < o) return 'upcoming';
  if (now >= c) return 'closed';
  return 'open';
}

/**
 * Échéance d'une tentative (§2.4) : durée effective = min(durée de manche,
 * temps restant avant clôture). `truncated` signale une fenêtre réduite,
 * exclue du calcul du temps moyen (§6.13).
 */
export function attemptDeadline(startedAt: Date, durationMinutes: number, closesAt: Date | null): { deadline: Date; truncated: boolean; effectiveSeconds: number } {
  const full = new Date(startedAt.getTime() + durationMinutes * 60_000);
  if (closesAt && closesAt < full) {
    return { deadline: closesAt, truncated: true, effectiveSeconds: Math.max(0, Math.floor((closesAt.getTime() - startedAt.getTime()) / 1000)) };
  }
  return { deadline: full, truncated: false, effectiveSeconds: durationMinutes * 60 };
}

/* ------------------------------------------------------------------ */
/* Statut de tournoi (§15.1) — manuel jusqu'aux inscriptions, puis piloté par les dates */
/* ------------------------------------------------------------------ */

export type TournamentStatus = 'draft' | 'scheduled' | 'registration_open' | 'round_open' | 'round_closed' | 'finished' | 'archived';

export const STATUS_LABEL: Record<TournamentStatus, string> = {
  draft: 'Brouillon',
  scheduled: 'Programmé',
  registration_open: 'Inscriptions ouvertes',
  round_open: 'Manche ouverte',
  round_closed: 'Manche clôturée',
  finished: 'Tournoi terminé',
  archived: 'Archivé',
};

export const PUBLIC_STATUSES: ReadonlySet<TournamentStatus> = new Set(['registration_open', 'round_open', 'round_closed', 'finished']);

/**
 * Statut effectif : les transitions manuelles (brouillon → programmé →
 * inscriptions ouvertes, archivage) sont stockées ; l'ouverture et la clôture
 * des manches et la fin du tournoi découlent des dates.
 */
export function effectiveStatus(stored: TournamentStatus, rounds: readonly (RoundWindow & { number: number })[], now: Date = new Date()): { status: TournamentStatus; openRound: number | null } {
  if (stored === 'draft' || stored === 'scheduled' || stored === 'archived') return { status: stored, openRound: null };
  const scheduled = rounds.filter((r) => toDate(r.opens_at) && toDate(r.closes_at));
  const open = scheduled.find((r) => roundState(r, now) === 'open');
  if (open) return { status: 'round_open', openRound: open.number };
  if (scheduled.length > 0 && scheduled.every((r) => roundState(r, now) === 'closed')) return { status: 'finished', openRound: null };
  if (scheduled.some((r) => roundState(r, now) === 'closed')) return { status: 'round_closed', openRound: null };
  return { status: 'registration_open', openRound: null };
}
