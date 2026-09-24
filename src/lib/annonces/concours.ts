import type { PermissionScope } from '@/types/domain';

/**
 * Annonces de l'accueil — refonte du 24/09/2026.
 *
 * AVANT : un bloc par information ET par spécialité (compte à rebours de la
 * MG, calendrier de la MG, nombre de postes de la MG, puis la même chose pour
 * chaque spécialité…), plus une carte MG écrite en dur. Une élève de médecine
 * générale voyait huit blocs dont trois « J−113 ».
 *
 * MAINTENANT : la structure commune à toutes les annonces de concours est
 * posée UNE fois, ici. Chaque spécialité n'a qu'une « fiche concours » où l'on
 * ne saisit que ce qui change : date de l'épreuve, période d'inscription,
 * postes par voie, dates clés, lien utile. L'élève voit UNE carte par
 * spécialité, où tout est regroupé, et rien de ce qui est passé.
 *
 * Stockage : `homepage_generic_data`, `section_key = 'concours'`, une ligne par
 * collège. Les anciennes sections (`countdown`, `inscription`, `postes`,
 * `dates_cles`) et les anciens blocs `homepage_announcements` de type compte à
 * rebours / calendrier / statistique ciblés sur un collège sont relus en repli
 * tant qu'ils n'ont pas été convertis : rien ne disparaît au déploiement.
 *
 * Module PUR (importable côté client) : aucune lecture base ici.
 */

export const SECTION_CONCOURS = 'concours';
export const SECTIONS_HERITEES = ['countdown', 'inscription', 'postes', 'dates_cles'] as const;

/** Libellés communs à toutes les fiches — la « structure commune ». */
export const TEXTES_COMMUNS = {
  session: 'EVC — Session 2026',
  avantCompteur: 'Il vous reste',
  apresCompteur: 'avant l’épreuve écrite',
} as const;

export type DateCle = { label: string; date: string };

export type FicheConcours = {
  /** Date de l'épreuve écrite (AAAA-MM-JJ) : alimente le compte à rebours. */
  date_epreuve: string | null;
  /** Période d'inscription (AAAA-MM-JJTHH:mm, heure de Paris). */
  inscription_debut: string | null;
  inscription_fin: string | null;
  /** Texte libre hérité (« Du 17 juin 14 h au… ») quand les dates manquent. */
  inscription_texte: string | null;
  postes_externe: number | null;
  postes_interne: number | null;
  /** Calendrier : résultats, oral, choix de poste… */
  dates: DateCle[];
  /** Note libre héritée des anciennes « Dates clés ». */
  note: string | null;
  lien_label: string | null;
  lien_url: string | null;
  /** Fiche retirée par l'administrateur (neutralise les anciens blocs). */
  retiree: boolean;
};

export function ficheVide(): FicheConcours {
  return {
    date_epreuve: null, inscription_debut: null, inscription_fin: null, inscription_texte: null,
    postes_externe: null, postes_interne: null, dates: [], note: null, lien_label: null, lien_url: null, retiree: false,
  };
}

const texte = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);
const nombre = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};
const dateValide = (v: unknown): string | null => {
  const s = texte(v);
  return s && !Number.isNaN(new Date(s).getTime()) ? s : null;
};

export function normaliserFiche(raw: unknown): FicheConcours {
  if (!raw || typeof raw !== 'object') return ficheVide();
  const r = raw as Record<string, unknown>;
  const dates = Array.isArray(r.dates)
    ? (r.dates as unknown[])
      .map((d) => (d && typeof d === 'object' ? d as Record<string, unknown> : {}))
      .map((d) => ({ label: texte(d.label) ?? '', date: dateValide(d.date) ?? '' }))
      .filter((d) => d.label && d.date)
    : [];
  return {
    date_epreuve: dateValide(r.date_epreuve),
    inscription_debut: dateValide(r.inscription_debut),
    inscription_fin: dateValide(r.inscription_fin),
    inscription_texte: texte(r.inscription_texte),
    postes_externe: nombre(r.postes_externe),
    postes_interne: nombre(r.postes_interne),
    dates: dates.sort((a, b) => a.date.localeCompare(b.date)),
    note: texte(r.note),
    lien_label: texte(r.lien_label),
    lien_url: texte(r.lien_url),
    retiree: r.retiree === true,
  };
}

/** Une fiche n'a-t-elle rien à afficher ? */
export function ficheEstVide(f: FicheConcours): boolean {
  return !f.date_epreuve && !f.inscription_debut && !f.inscription_fin && !f.inscription_texte
    && !f.postes_externe && !f.postes_interne && f.dates.length === 0 && !f.note && !(f.lien_label && f.lien_url);
}

/**
 * Complète `base` avec ce que `repli` apporte, champ par champ, sans jamais
 * écraser une valeur déjà saisie. Sert à relire les anciens blocs.
 */
export function completerFiche(base: FicheConcours, repli: Partial<FicheConcours>): FicheConcours {
  const out = { ...base };
  for (const k of ['date_epreuve', 'inscription_debut', 'inscription_fin', 'inscription_texte', 'postes_externe', 'postes_interne', 'note', 'lien_label', 'lien_url'] as const) {
    if (out[k] == null && repli[k] != null) (out as Record<string, unknown>)[k] = repli[k];
  }
  if (repli.dates && repli.dates.length > 0) {
    const vus = new Set(out.dates.map((d) => `${d.label.toLowerCase()}|${d.date}`));
    const ajout = repli.dates.filter((d) => !vus.has(`${d.label.toLowerCase()}|${d.date}`));
    out.dates = [...out.dates, ...ajout].sort((a, b) => a.date.localeCompare(b.date));
  }
  return out;
}

/* ───────────────────────── lecture des anciens blocs ───────────────────────── */

/** Anciennes sections génériques d'un collège → morceau de fiche. */
export function ficheDepuisSection(sectionKey: string, data: Record<string, unknown>): Partial<FicheConcours> {
  switch (sectionKey) {
    case 'countdown': return { date_epreuve: dateValide(data.target_date) };
    case 'inscription': return { inscription_texte: texte(data.body) };
    case 'postes': return { postes_externe: nombre(data.externe), postes_interne: nombre(data.interne) };
    case 'dates_cles': return { note: texte(data.body) };
    case SECTION_CONCOURS: return normaliserFiche(data);
    default: return {};
  }
}

export type AncienBloc = {
  id: string;
  kind: string;
  title: string;
  data: Record<string, unknown>;
  target_scope: string | null;
  target_colleges: string[] | null;
};

/** Blocs de l'ancien système remplacés par les fiches concours. */
export const TYPES_REMPLACES = new Set(['countdown', 'event_list', 'stat']);

/** Ancien bloc compte à rebours / calendrier / statistique → morceau de fiche. */
export function ficheDepuisAncienBloc(b: AncienBloc): Partial<FicheConcours> {
  const d = b.data ?? {};
  if (b.kind === 'countdown') return { date_epreuve: dateValide(d.target_date) };
  if (b.kind === 'event_list') {
    const events = Array.isArray(d.events) ? d.events as Record<string, unknown>[] : [];
    return {
      dates: events
        .map((e) => ({ label: texte(e?.label) ?? '', date: dateValide(e?.date) ?? '' }))
        .filter((e) => e.label && e.date),
    };
  }
  if (b.kind === 'stat') {
    const subs = Array.isArray(d.sub_stats) ? d.sub_stats as Record<string, unknown>[] : [];
    const val = (re: RegExp) => nombre(subs.find((s) => re.test(String(s?.label ?? '')))?.value);
    return { postes_externe: val(/extern/i), postes_interne: val(/intern/i) };
  }
  return {};
}

/** Collèges précisément visés par un ancien bloc (vide = bloc global). */
export function collegesVises(b: AncienBloc): string[] {
  return b.target_scope === 'college' ? (b.target_colleges ?? []) : [];
}

/* ───────────────────────── périmètre de l'élève ───────────────────────── */

/**
 * Spécialités dont l'élève doit voir la fiche. Un sous-collège renvoie à son
 * parent (Ophtalmologie MG → Médecine générale). Un élève gériatrie a les
 * collèges MG en bonus pédagogique : il n'est pas inscrit au concours de MG.
 * `null` = accès intégral (toutes les spécialités).
 */
export function specialitesDeLEleve(scope: PermissionScope, parentDe: ReadonlyMap<string, string | null>): string[] | null {
  if (scope.type !== 'college') return null;
  const geriatrie = scope.colleges.includes('col-geriatrie');
  const out = new Set<string>();
  for (const c of scope.colleges) {
    if (c === 'col-decouverte') continue;
    const top = parentDe.get(c) ?? c;
    if (geriatrie && top === 'col-medecine-generale') continue;
    out.add(top);
  }
  return [...out];
}

/* ───────────────────────── calculs d'affichage ───────────────────────── */

const JOUR = 86_400_000;

/** Jours restants avant une date (AAAA-MM-JJ), à minuit heure locale. */
export function joursAvant(dateIso: string, maintenant = Date.now()): number {
  const cible = new Date(dateIso.length === 10 ? `${dateIso}T00:00:00` : dateIso).getTime();
  return Math.max(0, Math.ceil((cible - maintenant) / JOUR));
}

export type EtatInscription =
  | { etat: 'a_venir'; debut: string; fin: string | null }
  | { etat: 'ouverte'; fin: string | null; joursRestants: number | null }
  | { etat: 'close' }
  | { etat: 'texte'; texte: string }
  | null;

export function etatInscription(f: FicheConcours, maintenant = Date.now()): EtatInscription {
  const debut = f.inscription_debut ? new Date(f.inscription_debut).getTime() : null;
  const fin = f.inscription_fin ? new Date(f.inscription_fin).getTime() : null;
  if (debut == null && fin == null) return f.inscription_texte ? { etat: 'texte', texte: f.inscription_texte } : null;
  if (fin != null && fin < maintenant) return { etat: 'close' };
  if (debut != null && debut > maintenant) return { etat: 'a_venir', debut: f.inscription_debut!, fin: f.inscription_fin };
  return { etat: 'ouverte', fin: f.inscription_fin, joursRestants: fin != null ? Math.ceil((fin - maintenant) / JOUR) : null };
}

/** Dates clés à venir (celles du jour comprises), les passées disparaissent. */
export function datesAVenir(f: FicheConcours, maintenant = Date.now()): DateCle[] {
  const aujourdhui = new Date(maintenant);
  aujourdhui.setHours(0, 0, 0, 0);
  return f.dates.filter((d) => new Date(d.date.length === 10 ? `${d.date}T23:59:59` : d.date).getTime() >= aujourdhui.getTime());
}

/** L'épreuve est-elle passée ? (la fiche n'a alors plus rien d'utile à dire) */
export function epreuvePassee(f: FicheConcours, maintenant = Date.now()): boolean {
  if (!f.date_epreuve) return false;
  return new Date(`${f.date_epreuve.slice(0, 10)}T23:59:59`).getTime() < maintenant && datesAVenir(f, maintenant).length === 0;
}

/* ───────────────────────── messages libres ───────────────────────── */

export const OFFER_RANK: Record<string, number> = { decouverte: 0, essentiel: 1, intensif: 2, approfondi: 3 };

export type MessageAnnonce = {
  id: string;
  kind: string;
  title: string;
  data: Record<string, unknown>;
  min_offer: string | null;
  target_scope: string | null;
  target_colleges: string[] | null;
  voies: string[] | null;
};

/**
 * Un message libre est-il visible pour cet élève ? Règles, dans l'ordre :
 * formule minimale, voie, date de fin d'affichage, puis audience — « tous »,
 * « accès intégral », ou des spécialités cochées (cocher une spécialité
 * parente vise aussi les élèves de ses sous-collèges). L'interface interdit
 * d'enregistrer « spécialités » sans en cocher une ; une ancienne annonce
 * dans ce cas reste visible de tous, comme avant.
 */
export function messageVisiblePour(
  m: MessageAnnonce,
  scope: PermissionScope,
  specialites: string[] | null,
  maintenant = Date.now(),
): boolean {
  if (m.min_offer && (OFFER_RANK[scope.offer] ?? 0) < (OFFER_RANK[m.min_offer] ?? 0)) return false;
  const vs = m.voies ?? [];
  if (vs.length === 1 && scope.voie && !vs.includes(scope.voie)) return false;
  const fin = texte(m.data?.fin_affichage);
  if (fin && new Date(`${fin.slice(0, 10)}T23:59:59`).getTime() < maintenant) return false;
  const ts = m.target_scope ?? 'all';
  if (ts === 'full') return scope.type === 'all';
  if (ts === 'college') {
    const ids = m.target_colleges ?? [];
    if (ids.length === 0) return true;
    if (specialites === null) return true;
    // Collèges détenus en propre (hors bonus MG d'un élève gériatrie).
    const geriatrie = scope.type === 'college' && scope.colleges.includes('col-geriatrie');
    const directs = scope.type === 'college'
      ? scope.colleges.filter((c) => !geriatrie || (c !== 'col-medecine-generale' && !c.startsWith('col-mg-')))
      : [];
    return ids.some((id) => specialites.includes(id) || directs.includes(id));
  }
  return true;
}

/* ───────────────────────── heure de Paris (formulaires) ───────────────────────── */

function partiesParis(d: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  return { y: p.year, m: p.month, d: p.day, h: p.hour, min: p.minute };
}

/** ISO (UTC) → valeur d'un <input type="datetime-local">, lue à l'heure de Paris. */
export function isoVersSaisieParis(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = partiesParis(d);
  return `${p.y}-${p.m}-${p.d}T${p.h}:${p.min}`;
}

/** Valeur saisie « AAAA-MM-JJTHH:mm » (heure de Paris) → ISO UTC, quel que soit le fuseau du navigateur. */
export function saisieParisVersIso(v: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const naif = new Date(`${v}:00Z`);
  const p = partiesParis(naif);
  const commeUtc = Date.UTC(+p.y, +p.m - 1, +p.d, +p.h, +p.min);
  return new Date(naif.getTime() - (commeUtc - naif.getTime())).toISOString();
}
