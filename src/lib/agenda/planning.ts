/**
 * « Mes 30 prochains jours » — planning de la colonne droite de l'accueil élève.
 *
 * Module PUR (aucune dépendance serveur) : filtrage des séances de la
 * plateforme, grille du mois, regroupement par jour, horaires et libellés. Le
 * chargement vit dans `planning-server.ts`, l'affichage dans
 * `components/student/planning-30-jours*.tsx`.
 *
 * Dates : `platform_events.date` et `user_agenda_events.date` sont des dates
 * calendaires saisies à l'heure de Paris, `start_time` / `end_time` des heures
 * murales de Paris. On raisonne donc en chaînes « AAAA-MM-JJ » / « HH:MM » et on
 * ne convertit que l'instant présent vers Europe/Paris — jamais l'inverse.
 */
import { scopeOffers } from '../auth/permissions';
import type { PermissionScope } from '../../types/domain';

export const FUSEAU_PLANNING = 'Europe/Paris';
/** Horizon de la liste « Prochaines séances » (aujourd'hui inclus + 30 jours). */
export const HORIZON_JOURS = 30;

/* ------------------------------------------------------------------ */
/* Sources                                                             */
/* ------------------------------------------------------------------ */

/** Colonnes lues dans `platform_events` (mêmes que la page /agenda). */
export type EvenementPlateformeBrut = {
  id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  college: string | null;
  intervenant: string | null;
  zoom_url: string | null;
  notes: string | null;
  required_offers: string[] | null;
  scope_type: 'all' | 'college';
  scope_colleges: string[] | null;
  voies: string[] | null;
};

/** Colonnes lues dans `user_agenda_events` (évènements personnels). */
export type EvenementPersoBrut = {
  id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  category: string | null;
  notes: string | null;
};

/**
 * Séances de la plateforme visibles par l'élève — règle IDENTIQUE à celle de
 * la page /agenda (src/app/(student)/agenda/page.tsx) :
 *  - formule : union des formules de l'élève ∩ `required_offers` (absent =
 *    les trois formules payantes) ;
 *  - voie : une liste non vide exclut l'élève d'une autre voie (voie inconnue
 *    = pas de restriction) ;
 *  - spécialités : `scope_type = 'college'` restreint aux collèges cochés
 *    (aucun coché = toutes ; accès intégral = tout).
 */
export function evenementVisiblePourEleve(e: EvenementPlateformeBrut, scope: PermissionScope): boolean {
  const offers = e.required_offers ?? ['essentiel', 'intensif', 'approfondi'];
  if (!scopeOffers(scope).some((o) => offers.includes(o))) return false;
  const evVoies = e.voies ?? [];
  if (evVoies.length > 0 && scope.voie && !evVoies.includes(scope.voie)) return false;
  if (e.scope_type === 'college') {
    const ids = e.scope_colleges ?? [];
    if (ids.length === 0) return true;
    if (scope.type === 'all') return true;
    return ids.some((cid) => scope.colleges.includes(cid));
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Modèle affiché                                                      */
/* ------------------------------------------------------------------ */

export type EvenementPlanning = {
  id: string;
  /** `direct` = séance de la plateforme ; `autre` = évènement personnel. */
  genre: 'direct' | 'autre';
  titre: string;
  /** AAAA-MM-JJ (Paris). */
  date: string;
  /** HH:MM (Paris) ou null. */
  debut: string | null;
  fin: string | null;
  intervenant: string | null;
  /** Lien de la visio (séances en direct seulement). */
  lien: string | null;
  /** Catégorie d'un évènement personnel (« Révision », « Examen »…). */
  categorie: string | null;
};

/** « 20:30:00 » → « 20:30 » ; valeur illisible → null. */
export function normaliserHeure(h: string | null | undefined): string | null {
  const m = /^(\d{1,2}):(\d{2})/.exec((h ?? '').trim());
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh > 24 || mm > 59) return null;
  return `${String(hh).padStart(2, '0')}:${m[2]}`;
}

function lienValide(url: string | null | undefined): string | null {
  const u = (url ?? '').trim();
  return /^https?:\/\//i.test(u) ? u : null;
}

/** Fusionne les deux sources (séances déjà filtrées) et trie par date/heure. */
export function versEvenementsPlanning(
  plateforme: EvenementPlateformeBrut[],
  perso: EvenementPersoBrut[],
): EvenementPlanning[] {
  const tous: EvenementPlanning[] = [
    ...plateforme.map((e) => ({
      id: `p:${e.id}`,
      genre: 'direct' as const,
      titre: e.title?.trim() || 'Séance en direct',
      date: e.date.slice(0, 10),
      debut: normaliserHeure(e.start_time),
      fin: normaliserHeure(e.end_time),
      intervenant: e.intervenant?.trim() || null,
      lien: lienValide(e.zoom_url),
      categorie: null,
    })),
    ...perso.map((e) => ({
      id: `u:${e.id}`,
      genre: 'autre' as const,
      titre: e.title?.trim() || 'Évènement',
      date: e.date.slice(0, 10),
      debut: normaliserHeure(e.start_time),
      fin: normaliserHeure(e.end_time),
      intervenant: null,
      lien: null,
      categorie: e.category?.trim() || null,
    })),
  ];
  return tous.sort(comparerEvenements);
}

/** Tri : date, puis heure de début (sans heure = en fin de journée), direct d'abord. */
export function comparerEvenements(a: EvenementPlanning, b: EvenementPlanning): number {
  return a.date.localeCompare(b.date)
    || (a.debut ?? '99:99').localeCompare(b.debut ?? '99:99')
    || (a.genre === b.genre ? 0 : a.genre === 'direct' ? -1 : 1)
    || a.titre.localeCompare(b.titre, 'fr');
}

/** Regroupe par date (AAAA-MM-JJ), chaque jour trié. */
export function regrouperParJour(evenements: EvenementPlanning[]): Map<string, EvenementPlanning[]> {
  const parJour = new Map<string, EvenementPlanning[]>();
  for (const e of [...evenements].sort(comparerEvenements)) {
    const liste = parJour.get(e.date);
    if (liste) liste.push(e);
    else parJour.set(e.date, [e]);
  }
  return parJour;
}

/* ------------------------------------------------------------------ */
/* Temps présent à Paris                                               */
/* ------------------------------------------------------------------ */

export type InstantParis = { date: string; heure: string };

/** Date (AAAA-MM-JJ) et heure (HH:MM) murales de Paris à l'instant donné. */
export function instantParis(maintenant: Date = new Date()): InstantParis {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: FUSEAU_PLANNING, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(maintenant);
  const v = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? '00';
  return { date: `${v('year')}-${v('month')}-${v('day')}`, heure: `${v('hour')}:${v('minute')}` };
}

/** Ajoute n jours à une date calendaire AAAA-MM-JJ (arithmétique UTC, sans fuseau). */
export function ajouterJours(iso: string, n: number): string {
  const [a, m, j] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, j + n)).toISOString().slice(0, 10);
}

/**
 * Fenêtre chargée : du 1er du mois courant (pour les points des jours passés du
 * mois affiché) à aujourd'hui + 30 jours.
 */
export function fenetrePlanning(maintenant: Date = new Date()): { debut: string; fin: string; aujourdHui: InstantParis } {
  const aujourdHui = instantParis(maintenant);
  return { debut: `${aujourdHui.date.slice(0, 8)}01`, fin: ajouterJours(aujourdHui.date, HORIZON_JOURS), aujourdHui };
}

/** Un évènement n'est pas terminé (fin, sinon début, sinon fin de journée). */
export function estAVenir(e: EvenementPlanning, present: InstantParis): boolean {
  if (e.date !== present.date) return e.date > present.date;
  const borne = finEffective(e) ?? '24:00';
  return borne > present.heure;
}

/** Heure de fin ; une fin antérieure au début (séance qui passe minuit) court jusqu'à 24:00. */
function finEffective(e: EvenementPlanning): string | null {
  if (e.fin && e.debut && e.fin <= e.debut) return '24:00';
  return e.fin ?? e.debut;
}

/** Évènements à venir dans l'horizon (aujourd'hui → +30 jours), triés. */
export function evenementsAVenir(evenements: EvenementPlanning[], present: InstantParis, genre?: EvenementPlanning['genre']): EvenementPlanning[] {
  const limite = ajouterJours(present.date, HORIZON_JOURS);
  return evenements
    .filter((e) => (!genre || e.genre === genre) && e.date <= limite && estAVenir(e, present))
    .sort(comparerEvenements);
}

/**
 * Jour mis en avant à l'ouverture : celui de la prochaine séance en direct,
 * sinon du prochain évènement, sinon aujourd'hui.
 */
export function jourParDefaut(evenements: EvenementPlanning[], present: InstantParis): string {
  return evenementsAVenir(evenements, present, 'direct')[0]?.date
    ?? evenementsAVenir(evenements, present)[0]?.date
    ?? present.date;
}

/**
 * Liste « Prochaines séances » : les séances en direct à venir qui suivent
 * celle déjà mise en avant (la première), au plus `n`. Sans séance en direct,
 * les prochains évènements personnels prennent le relais.
 */
export function prochainesSeances(evenements: EvenementPlanning[], present: InstantParis, n = 3): { genre: 'direct' | 'autre'; liste: EvenementPlanning[] } {
  const directs = evenementsAVenir(evenements, present, 'direct');
  if (directs.length > 0) return { genre: 'direct', liste: directs.slice(1, 1 + n) };
  return { genre: 'autre', liste: evenementsAVenir(evenements, present).slice(0, n) };
}

/* ------------------------------------------------------------------ */
/* Calendrier                                                          */
/* ------------------------------------------------------------------ */

export type Mois = { annee: number; mois: number /* 1-12 */ };

export function moisDe(iso: string): Mois {
  return { annee: Number(iso.slice(0, 4)), mois: Number(iso.slice(5, 7)) };
}

export function decalerMois({ annee, mois }: Mois, n: number): Mois {
  const index = annee * 12 + (mois - 1) + n;
  return { annee: Math.floor(index / 12), mois: (index % 12) + 1 };
}

export function comparerMois(a: Mois, b: Mois): number {
  return a.annee - b.annee || a.mois - b.mois;
}

/**
 * Grille du mois, lundi en premier : des semaines de 7 cases, `null` hors du
 * mois. 4 à 6 semaines selon le mois.
 */
export function grilleDuMois({ annee, mois }: Mois): (string | null)[][] {
  const premier = new Date(Date.UTC(annee, mois - 1, 1));
  const nbJours = new Date(Date.UTC(annee, mois, 0)).getUTCDate();
  const decalage = (premier.getUTCDay() + 6) % 7; // lundi = 0
  const cases: (string | null)[] = Array.from({ length: decalage }, () => null);
  for (let j = 1; j <= nbJours; j++) {
    cases.push(`${annee}-${String(mois).padStart(2, '0')}-${String(j).padStart(2, '0')}`);
  }
  while (cases.length % 7 !== 0) cases.push(null);
  const semaines: (string | null)[][] = [];
  for (let i = 0; i < cases.length; i += 7) semaines.push(cases.slice(i, i + 7));
  return semaines;
}

/* ------------------------------------------------------------------ */
/* Libellés                                                            */
/* ------------------------------------------------------------------ */

const capitaliser = (s: string) => (s ? s[0].toLocaleUpperCase('fr-FR') + s.slice(1) : s);

function dateUtc(iso: string): Date {
  const [a, m, j] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, j, 12));
}

/** « Septembre 2026 ». */
export function titreMois({ annee, mois }: Mois): string {
  const nom = new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(annee, mois - 1, 15)));
  return `${capitaliser(nom)} ${annee}`;
}

/** « Dimanche 27 septembre 2026 ». */
export function libelleJourLong(iso: string): string {
  return capitaliser(new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(dateUtc(iso)));
}

/** { jour: « Mar. », numero: 6, mois: « octobre » }. */
export function libelleJourCourt(iso: string): { jour: string; numero: number; mois: string } {
  const d = dateUtc(iso);
  const jour = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', timeZone: 'UTC' }).format(d).replace(/\.?$/, '.');
  const mois = new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' }).format(d);
  return { jour: capitaliser(jour), numero: d.getUTCDate(), mois };
}

/** « 20:30 » → « 20h30 ». */
export function heureCourte(h: string | null | undefined): string | null {
  const n = normaliserHeure(h);
  return n ? n.replace(':', 'h') : null;
}

function minutes(h: string): number {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
}

/** Durée lisible : « 3 h », « 1 h 30 », « 45 min » ; null sans début ou fin. */
export function dureeLisible(debut: string | null | undefined, fin: string | null | undefined): string | null {
  const d = normaliserHeure(debut);
  const f = normaliserHeure(fin);
  if (!d || !f) return null;
  let total = minutes(f) - minutes(d);
  if (total <= 0) total += 24 * 60; // passe minuit
  if (total <= 0 || total >= 24 * 60) return null;
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

/** « 20h30 - 23h30 », « À partir de 20h30 », ou null (journée entière). */
export function plageHoraire(debut: string | null | undefined, fin: string | null | undefined): string | null {
  const d = heureCourte(debut);
  const f = heureCourte(fin);
  if (d && f) return `${d} - ${f}`;
  if (d) return `À partir de ${d}`;
  return null;
}
