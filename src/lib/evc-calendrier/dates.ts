import type { CalendrierEvc, EpreuveEvc, ReglagesEvc } from './types';

/**
 * Calendrier EVC — toute la logique de dates, en module PUR (importable côté
 * client, testé par tests/evc-calendrier.test.ts).
 *
 * RÈGLE D'OR (brief B6) : tout se calcule en JOURS CALENDAIRES DE PARIS, jamais
 * à l'heure locale du navigateur. Un candidat à Nouméa (UTC+11) ou à Tahiti
 * (UTC−10) voit le même « J-N » qu'un candidat à Paris : l'épreuve a lieu à
 * Rungis, c'est l'heure de Rungis qui compte. Le jour calendaire est obtenu par
 * Intl.DateTimeFormat (timeZone 'Europe/Paris'), qui applique seul les
 * changements d'heure ; l'écart entre deux jours se compte ensuite sur des
 * dates UTC « nues » (Date.UTC), sans heure ni fuseau : aucun jour de 23 ou
 * 25 heures ne peut fausser la division.
 *
 * Les libellés (« vendredi 15 janvier 2027 ») sont construits À LA MAIN, pas par
 * toLocaleDateString : le serveur (ICU de Node) et le navigateur doivent
 * produire exactement la même chaîne, sinon l'hydratation échoue.
 */

export const FUSEAU = 'Europe/Paris';
const JOUR_MS = 86_400_000;

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/* ───────────────────────── jours calendaires de Paris ───────────────────────── */

const FORMAT_PARIS = new Intl.DateTimeFormat('en-GB', {
  timeZone: FUSEAU, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

/** Date et heure « murales » de Paris pour un instant donné. */
export function partiesParis(instant: number | Date): { a: number; m: number; j: number; h: number; min: number } {
  const p: Record<string, string> = {};
  for (const x of FORMAT_PARIS.formatToParts(typeof instant === 'number' ? new Date(instant) : instant)) p[x.type] = x.value;
  // Certains moteurs anciens rendent minuit « 24 » malgré hourCycle h23.
  const h = Number(p.hour) % 24;
  return { a: Number(p.year), m: Number(p.month), j: Number(p.day), h, min: Number(p.minute) };
}

const deux = (n: number) => String(n).padStart(2, '0');

/** Jour calendaire de Paris, 'AAAA-MM-JJ', pour un instant donné. */
export function jourParis(instant: number | Date): string {
  const p = partiesParis(instant);
  return `${p.a}-${deux(p.m)}-${deux(p.j)}`;
}

function utcDuJour(jour: string): number {
  const [a, m, j] = jour.slice(0, 10).split('-').map(Number);
  return Date.UTC(a, m - 1, j);
}

/** Nombre de jours calendaires de `de` à `a` (négatif si `a` est passé). */
export function ecartJours(de: string, a: string): number {
  return Math.round((utcDuJour(a) - utcDuJour(de)) / JOUR_MS);
}

/** 'AAAA-MM-JJ' + n jours. */
export function ajouterJours(jour: string, n: number): string {
  const d = new Date(utcDuJour(jour) + n * JOUR_MS);
  return `${d.getUTCFullYear()}-${deux(d.getUTCMonth() + 1)}-${deux(d.getUTCDate())}`;
}

/** Heure murale de Paris ('AAAA-MM-JJ' + 'HH:mm') → instant (ms UTC), changements d'heure compris. */
export function instantParis(jour: string, heure = '00:00'): number {
  const [h, min] = heure.split(':').map(Number);
  const [a, m, j] = jour.slice(0, 10).split('-').map(Number);
  const naif = Date.UTC(a, m - 1, j, h, min);
  // Deux passes : la première estime le décalage, la seconde le corrige s'il
  // change entre l'estimation et le résultat (nuits de changement d'heure).
  let t = naif;
  for (let i = 0; i < 2; i++) {
    const p = partiesParis(t);
    const commeUtc = Date.UTC(p.a, p.m - 1, p.j, p.h, p.min);
    t = naif - (commeUtc - t);
  }
  return t;
}

/** Délai (ms) jusqu'au prochain minuit de Paris — pour recalculer pile au changement de jour. */
export function delaiAvantMinuitParis(maintenant: number): number {
  return Math.max(1_000, instantParis(ajouterJours(jourParis(maintenant), 1)) - maintenant);
}

/**
 * Délai avant le prochain recalcul d'un affichage de calendrier : au plus une
 * heure, et jamais au-delà du prochain minuit de Paris (+ 1 s de marge).
 */
export function delaiProchainRecalcul(maintenant: number): number {
  return Math.min(60 * 60_000, delaiAvantMinuitParis(maintenant) + 1_000);
}

/* ───────────────────────── libellés ───────────────────────── */

/** 'AAAA-MM-JJ' → « vendredi 15 janvier 2027 » (« 1er » pour le premier du mois). */
export function formatJour(jour: string, opts: { semaine?: boolean; annee?: boolean } = {}): string {
  const { semaine = true, annee = true } = opts;
  const d = new Date(utcDuJour(jour));
  const n = d.getUTCDate();
  const morceaux = [
    semaine ? JOURS[d.getUTCDay()] : null,
    n === 1 ? '1er' : String(n),
    MOIS[d.getUTCMonth()],
    annee ? String(d.getUTCFullYear()) : null,
  ];
  return morceaux.filter(Boolean).join(' ');
}

/** « 14 h », « 14 h 30 ». */
export function formatHeure(h: number, min: number): string {
  return min === 0 ? `${h} h` : `${h} h ${deux(min)}`;
}

/** Instant ISO → jour et heure de Paris, déjà mis en forme. */
export function formatInstantParis(iso: string): { jour: string; heure: string } {
  const t = Date.parse(iso);
  const p = partiesParis(t);
  return { jour: formatJour(jourParis(t)), heure: formatHeure(p.h, p.min) };
}

/** « J-107 » : trait d'union ASCII, comme dans la capture du tableau de bord. */
export function libelleJ(jours: number): string {
  return `J-${jours}`;
}

/* ───────────────────────── sélection des épreuves ───────────────────────── */

/** Sessions dont les épreuves s'affichent : la session en cours, plus la suivante si elle est publiée. */
export function sessionsVisibles(r: ReglagesEvc): number[] {
  return r.prochaine_session_publiee ? [r.session_en_cours, r.session_en_cours + 1] : [r.session_en_cours];
}

const parDate = (a: EpreuveEvc, b: EpreuveEvc) =>
  (a.date_epreuve ?? '9999').localeCompare(b.date_epreuve ?? '9999') || a.ordre - b.ordre || a.nom.localeCompare(b.nom);

/** Épreuves actives et datées des sessions visibles, dans l'ordre chronologique. */
export function epreuvesDatees(cal: Pick<CalendrierEvc, 'epreuves' | 'reglages'>): EpreuveEvc[] {
  const sessions = sessionsVisibles(cal.reglages);
  return cal.epreuves.filter((e) => e.actif && e.date_epreuve && sessions.includes(e.session)).sort(parDate);
}

/** Épreuves actives de la session en cours (datées ou non), dans l'ordre chronologique. */
export function epreuvesSession(cal: Pick<CalendrierEvc, 'epreuves' | 'reglages'>, session = cal.reglages.session_en_cours): EpreuveEvc[] {
  return cal.epreuves.filter((e) => e.actif && e.session === session).sort(parDate);
}

/** Ligne d'une spécialité (slug) : session en cours d'abord, sinon la plus récente. */
export function epreuveParSlug(cal: Pick<CalendrierEvc, 'epreuves' | 'reglages'>, slug: string): EpreuveEvc | null {
  const lignes = cal.epreuves.filter((e) => e.actif && e.slug === slug);
  return lignes.find((e) => e.session === cal.reglages.session_en_cours)
    ?? lignes.sort((a, b) => b.session - a.session)[0]
    ?? null;
}

/* ───────────────────────── B2 / B5 — bandeau ───────────────────────── */

export type EtatBandeau =
  /** Le jour d'une épreuve : la (ou les) spécialité(s) du jour restent affichées, « Jour J ». */
  | { etat: 'jour_j'; date: string; epreuves: EpreuveEvc[] }
  /** Prochaine épreuve à venir. */
  | { etat: 'a_venir'; jours: number; date: string; epreuves: EpreuveEvc[] }
  /** Dernière épreuve passée, session suivante non publiée : « Session N : calendrier à paraître ». */
  | { etat: 'a_paraitre'; annee: number; url: string };

export function etatBandeau(cal: Pick<CalendrierEvc, 'epreuves' | 'reglages'>, maintenant: number): EtatBandeau {
  const aujourdhui = jourParis(maintenant);
  const datees = epreuvesDatees(cal);
  const prochaine = datees.find((e) => e.date_epreuve! >= aujourdhui);
  if (!prochaine) {
    const derniere = datees.reduce((m, e) => Math.max(m, e.session), cal.reglages.session_en_cours);
    return { etat: 'a_paraitre', annee: derniere + 1, url: cal.reglages.url_deroule };
  }
  const date = prochaine.date_epreuve!;
  const epreuves = datees.filter((e) => e.date_epreuve === date);
  const jours = ecartJours(aujourdhui, date);
  return jours === 0 ? { etat: 'jour_j', date, epreuves } : { etat: 'a_venir', jours, date, epreuves };
}

/* ───────────────────────── B3 — compteur de la capture ───────────────────────── */

export type EtatCompteur =
  | { etat: 'j_moins'; jours: number }
  | { etat: 'jour_j' }
  /** Épreuve passée (ou non datée) : le compteur disparaît, jamais de valeur négative. */
  | { etat: 'masque' };

export function etatCompteur(epreuve: Pick<EpreuveEvc, 'date_epreuve'> | null, maintenant: number): EtatCompteur {
  if (!epreuve?.date_epreuve) return { etat: 'masque' };
  const jours = ecartJours(jourParis(maintenant), epreuve.date_epreuve);
  if (jours > 0) return { etat: 'j_moins', jours };
  if (jours === 0) return { etat: 'jour_j' };
  return { etat: 'masque' };
}

/**
 * Épreuve présentée dans la capture du hero (réglage `slug_capture_hero`,
 * médecine générale par défaut) : la prochaine à venir parmi les sessions
 * visibles, sinon la plus récente (son compteur sera alors masqué).
 */
export function epreuveCapture(cal: Pick<CalendrierEvc, 'epreuves' | 'reglages'>, maintenant: number): EpreuveEvc | null {
  const aujourdhui = jourParis(maintenant);
  const sessions = sessionsVisibles(cal.reglages);
  const lignes = cal.epreuves
    .filter((e) => e.actif && e.slug === cal.reglages.slug_capture_hero && sessions.includes(e.session))
    .sort(parDate);
  return lignes.find((e) => e.date_epreuve && e.date_epreuve >= aujourdhui)
    ?? [...lignes].sort((a, b) => b.session - a.session || parDate(b, a))[0]
    ?? null;
}

/* ───────────────────────── B4 — période d'inscription ───────────────────────── */

export type EtatInscriptionEvc =
  | { etat: 'a_venir'; session: number; debut: string; fin: string | null }
  | { etat: 'ouverte'; session: number; debut: string | null; fin: string | null }
  | { etat: 'close'; session: number }
  | { etat: 'inconnue'; session: number };

function evaluerPeriode(debut: string | null, fin: string | null, session: number, maintenant: number): EtatInscriptionEvc | null {
  if (!debut && !fin) return null;
  if (fin && maintenant > Date.parse(fin)) return { etat: 'close', session };
  if (debut && maintenant < Date.parse(debut)) return { etat: 'a_venir', session, debut, fin };
  return { etat: 'ouverte', session, debut, fin };
}

/**
 * Pendant la période → ouverture et clôture ; avant → « Ouverture le … » ;
 * après la clôture → la période de la session suivante si elle est connue
 * (réglages), sinon « Inscriptions closes pour la session N ».
 */
export function etatInscriptionEvc(
  e: Pick<EpreuveEvc, 'session' | 'inscription_debut' | 'inscription_fin'>,
  r: Pick<ReglagesEvc, 'session_en_cours' | 'prochaine_inscription_debut' | 'prochaine_inscription_fin'>,
  maintenant: number,
): EtatInscriptionEvc {
  const courante = evaluerPeriode(e.inscription_debut, e.inscription_fin, e.session, maintenant);
  if (courante && courante.etat !== 'close') return courante;
  const suivante = e.session === r.session_en_cours
    ? evaluerPeriode(r.prochaine_inscription_debut, r.prochaine_inscription_fin, e.session + 1, maintenant)
    : null;
  return suivante ?? courante ?? { etat: 'inconnue', session: e.session };
}

/* ───────────────────────── agrégats (section postes, texte de fond) ───────────────────────── */

/** Première et dernière date d'épreuve d'une session. */
export function bornesSession(epreuves: EpreuveEvc[]): { premiere: string; derniere: string } | null {
  const dates = epreuves.map((e) => e.date_epreuve).filter((d): d is string => !!d).sort();
  return dates.length ? { premiere: dates[0], derniere: dates[dates.length - 1] } : null;
}

/** Totaux de postes : ceux des réglages (officiels), sinon la somme des lignes. */
export function totauxPostes(cal: Pick<CalendrierEvc, 'epreuves' | 'reglages'>): { externe: number; interne: number; specialitesExterne: number } {
  const lignes = epreuvesSession(cal);
  const somme = (k: 'postes_externe' | 'postes_interne') => lignes.reduce((s, e) => s + (e[k] ?? 0), 0);
  return {
    externe: cal.reglages.postes_total_externe ?? somme('postes_externe'),
    interne: cal.reglages.postes_total_interne ?? somme('postes_interne'),
    specialitesExterne: lignes.filter((e) => (e.postes_externe ?? 0) > 0).length,
  };
}

/** « 1 003 » — espace ordinaire (jamais l'espace fine d'Intl : erreur d'hydratation). */
export function nombreFr(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/* ───────────────────────── fiches concours de l'espace élève ───────────────────────── */

/**
 * Période d'inscription à reporter dans une fiche concours : celle de la
 * session de l'épreuve tant qu'elle n'est pas close, puis celle de la session
 * suivante dès qu'elle est connue (réglages).
 */
export function inscriptionEffective(
  e: Pick<EpreuveEvc, 'session' | 'inscription_debut' | 'inscription_fin'>,
  r: Pick<ReglagesEvc, 'session_en_cours' | 'prochaine_inscription_debut' | 'prochaine_inscription_fin'>,
  maintenant: number,
): { debut: string | null; fin: string | null } {
  const etat = etatInscriptionEvc(e, r, maintenant);
  if (etat.session !== e.session) return { debut: r.prochaine_inscription_debut, fin: r.prochaine_inscription_fin };
  return { debut: e.inscription_debut, fin: e.inscription_fin };
}

/**
 * Ligne du calendrier reliée à un collège de la plateforme : la prochaine
 * épreuve à venir parmi les sessions visibles, sinon la plus récente.
 */
export function epreuveParCollege(cal: Pick<CalendrierEvc, 'epreuves' | 'reglages'>, collegeId: string, maintenant: number): EpreuveEvc | null {
  const aujourdhui = jourParis(maintenant);
  const sessions = sessionsVisibles(cal.reglages);
  const lignes = cal.epreuves.filter((e) => e.actif && e.college_id === collegeId && sessions.includes(e.session)).sort(parDate);
  return lignes.find((e) => e.date_epreuve && e.date_epreuve >= aujourdhui)
    ?? [...lignes].sort((a, b) => b.session - a.session || parDate(b, a))[0]
    ?? null;
}
