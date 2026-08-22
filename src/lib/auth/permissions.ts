import type { Offer, PermissionScope } from '@/types/domain';
import { OFFERS, highestOffer } from '@/types/domain';

function parseOffer(raw: unknown): Offer {
  if (raw && typeof raw === 'object') {
    const r = raw as { offer?: unknown; espace_decouverte?: unknown; paid_formule?: unknown; type?: unknown };
    const o = r.offer;
    if (o === 'decouverte') return 'decouverte';
    if (o === 'intensif' || o === 'premium') return 'intensif';
    if (o === 'approfondi') return 'approfondi';
    if (o === 'essentiel' || o === 'basic') return 'essentiel';
    if (r.espace_decouverte === true && !r.paid_formule) return 'decouverte';
    if (r.type === 'all') return 'approfondi';
  }
  return 'decouverte';
}

/** Lit `permission_scope.offers` (union multi-formules). Renvoie undefined si
 *  absent/vide → scope mono-formule. Filtre les valeurs invalides. */
function parseOffers(raw: unknown): Offer[] | undefined {
  if (raw && typeof raw === 'object') {
    const arr = (raw as { offers?: unknown }).offers;
    if (Array.isArray(arr)) {
      const list = arr.filter((x): x is Offer => typeof x === 'string' && (OFFERS as string[]).includes(x));
      const uniq = Array.from(new Set(list));
      if (uniq.length > 0) return uniq;
    }
  }
  return undefined;
}

function parseVoie(raw: unknown): 'interne' | 'externe' | null {
  if (raw && typeof raw === 'object') {
    const v = (raw as { paid_voie?: unknown; voie?: unknown }).paid_voie ?? (raw as { voie?: unknown }).voie;
    // Accepte les valeurs normalisées ('externe'/'interne') ET les libellés bruts
    // des formulaires ('Voie externe'/'Voie interne') — cf. current_voie() côté RLS.
    if (typeof v === 'string') {
      const n = v.trim().toLowerCase().replace(/^voie\s+/, '');
      if (n === 'interne' || n === 'externe') return n;
    }
  }
  return null;
}

function parseContentOverrides(raw: unknown): Record<string, boolean> | undefined {
  if (raw && typeof raw === 'object') {
    const co = (raw as { content_overrides?: unknown }).content_overrides;
    if (co && typeof co === 'object' && !Array.isArray(co)) {
      const result: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(co as Record<string, unknown>)) {
        if (typeof v === 'boolean') result[k] = v;
      }
      if (Object.keys(result).length > 0) return result;
    }
  }
  return undefined;
}

export function parseScope(raw: unknown): PermissionScope {
  const offers = parseOffers(raw);
  // `offer` = offre d'affichage/de rang. Si une union `offers` est présente, on
  // prend l'offre de plus haut rang ; sinon on lit l'offre unique historique.
  const offer = offers ? highestOffer(offers) : parseOffer(raw);
  const voie = parseVoie(raw);
  const offersField = offers ? { offers } : {};
  const contentOverrides = parseContentOverrides(raw);
  const overridesField = contentOverrides ? { content_overrides: contentOverrides } : {};
  if (raw && typeof raw === 'object' && 'type' in raw) {
    const t = (raw as { type: unknown }).type;
    if (t === 'all') return { type: 'all', offer, ...offersField, voie, ...overridesField };
    if (t === 'college') {
      const cs = (raw as { colleges?: unknown }).colleges;
      const list = Array.isArray(cs) ? cs.filter((x): x is string => typeof x === 'string') : [];
      const co = (raw as { cours?: unknown }).cours;
      const cours = Array.isArray(co) ? co.filter((x): x is string => typeof x === 'string') : undefined;
      return { type: 'college', colleges: list, offer, ...offersField, voie, ...(cours && cours.length > 0 ? { cours } : {}), ...overridesField };
    }
    // Legacy faculty-scoped accounts → full access (single EVC faculté now).
    if (t === 'faculty') return { type: 'all', offer, ...offersField, voie, ...overridesField };
  }
  return { type: 'all', offer, ...offersField, voie, ...overridesField };
}

/** Union des formules détenues par le scope (au moins une). Base de l'accès
 *  multi-formules : les droits sont l'UNION (OR) des droits de chaque offre. */
export function scopeOffers(scope: PermissionScope): Offer[] {
  return scope.offers && scope.offers.length > 0 ? scope.offers : [scope.offer];
}

function normalizeSpecialty(value: unknown): string {
  return typeof value === 'string'
    ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
    : '';
}

/**
 * Le Parcours du Major est un contenu propre à la Médecine générale.
 *
 * `paid_specialty` est la source prioritaire lorsqu'elle existe, puis
 * `specialty_wish`. Pour les anciens comptes sans ces métadonnées, on se
 * rabat sur les collèges attribués. Les comptes Gériatrie sont exclus de ce
 * repli, car leur bonus pédagogique ajoute techniquement des collèges MG sans
 * constituer une inscription à la spécialité Médecine générale.
 */
export function hasMedecineGeneraleAccess(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const scope = raw as {
    paid_specialty?: unknown;
    specialty_wish?: unknown;
    colleges?: unknown;
  };

  const paidSpecialty = normalizeSpecialty(scope.paid_specialty);
  if (paidSpecialty) return paidSpecialty === 'medecine generale';

  const specialtyWish = normalizeSpecialty(scope.specialty_wish);
  if (specialtyWish) return specialtyWish === 'medecine generale';

  const colleges = Array.isArray(scope.colleges)
    ? scope.colleges.filter((value): value is string => typeof value === 'string')
    : [];
  const hasMgCollege = colleges.some(
    (college) => college === 'col-medecine-generale' || college.startsWith('col-mg-'),
  );
  return hasMgCollege && !colleges.includes('col-geriatrie');
}

/**
 * Vérifie l'accès à un collège.
 * `accessType` (depuis `matieres.access_type`) :
 *  - 'all' (défaut) : accessible si `scope.type === 'all'` OU si le collège
 *                     est dans `scope.colleges`.
 *  - 'specific'     : exige que le collège soit explicitement dans
 *                     `scope.colleges` (les utilisateurs 'all' doivent quand
 *                     même recevoir un accès nominatif).
 */
export function canAccessCollege(
  scope: PermissionScope,
  collegeId: string,
  accessType: 'all' | 'specific' = 'all',
): boolean {
  if (accessType === 'specific') {
    return scope.type === 'college' && scope.colleges.includes(collegeId);
  }
  if (scope.type === 'all') return true;
  return scope.colleges.includes(collegeId);
}

/** Vérifie l'accès à un cours précis :
 *  - 'all' → toujours autorisé (sauf si le cours lui-même est 'specific')
 *  - 'college' sans liste de cours → autorisé si le collège du cours est dans la liste
 *  - 'college' avec liste de cours → autorisé si le cours est dans la liste explicite
 *  - `accessType` (depuis `cours.access_type`) : si 'specific', le cours doit
 *    être explicitement listé dans `scope.cours` même pour un utilisateur 'all'.
 */
export function canAccessCours(
  scope: PermissionScope,
  collegeId: string,
  coursId: string,
  accessType: 'all' | 'specific' = 'all',
): boolean {
  if (accessType === 'specific') {
    if (scope.type !== 'college') return false;
    if (!scope.colleges.includes(collegeId)) return false;
    return !!scope.cours && scope.cours.includes(coursId);
  }
  if (scope.type === 'all') return true;
  if (!scope.colleges.includes(collegeId)) return false;
  if (scope.cours && scope.cours.length > 0) return scope.cours.includes(coursId);
  return true;
}

/**
 * Droit d'IMPRESSION / TÉLÉCHARGEMENT des fiches, par spécialité (collège).
 *
 *  - admin                → toujours autorisé ;
 *  - `can_download = true`→ droit GLOBAL, toutes spécialités confondues ;
 *  - sinon                → uniquement les collèges listés dans
 *    `download_colleges` (ex. `col-mg-neurologie` pour n'autoriser que la
 *    Neurologie de Médecine générale).
 *
 * `collegeId` est le `matiere_id` du cours dont on veut la fiche.
 */
export function canDownloadFiche(
  profile: { role?: string | null; can_download?: boolean | null; download_colleges?: string[] | null },
  collegeId: string | null | undefined,
): boolean {
  if (profile.role === 'admin') return true;
  if (profile.can_download === true) return true;
  if (!collegeId) return false;
  return (profile.download_colleges ?? []).includes(collegeId);
}

/** Legacy faculté gate kept for unreferenced faculté routes; no-op under the EVC model. */
export function canAccessFaculte(scope: PermissionScope, _faculteId: string): boolean {
  return scope.type === 'all' || scope.type === 'college';
}

export type ContentAccess = {
  fiche: boolean;
  ficheExpress: boolean;
  video: boolean;
  qcm: boolean;
  entrainement: boolean;
  seanceProf: boolean;
  flashcards: boolean;
  interrogation: boolean;
  seanceApprofondie: boolean;
  notes: boolean;
  parcoursMajor: boolean;
};

export function getContentAccess(offer: Offer): ContentAccess {
  switch (offer) {
    case 'essentiel':
      return { fiche: false, ficheExpress: true, video: false, qcm: true, entrainement: true, seanceProf: false, flashcards: true, interrogation: true, seanceApprofondie: false, notes: true, parcoursMajor: false };
    case 'intensif':
      return { fiche: true, ficheExpress: true, video: true, qcm: true, entrainement: true, seanceProf: false, flashcards: true, interrogation: true, seanceApprofondie: false, notes: true, parcoursMajor: true };
    case 'approfondi':
      // « Tout sauf cours vidéo » (+ restriction voie sur les séries MG,
      // appliquée par la RLS). Séances prof/approfondies incluses ; entraînement
      // ciblé conservé (QCM pour la voie interne, QROC pour la voie externe).
      return { fiche: true, ficheExpress: true, video: false, qcm: true, entrainement: true, seanceProf: true, flashcards: true, interrogation: true, seanceApprofondie: true, notes: true, parcoursMajor: true };
    default:
      return { fiche: true, ficheExpress: true, video: true, qcm: true, entrainement: true, seanceProf: true, flashcards: true, interrogation: true, seanceApprofondie: true, notes: true, parcoursMajor: false };
  }
}

/** OR booléen de deux matrices d'accès (union des droits multi-formules). */
export function mergeAccess(a: ContentAccess, b: ContentAccess): ContentAccess {
  return {
    fiche: a.fiche || b.fiche,
    ficheExpress: a.ficheExpress || b.ficheExpress,
    video: a.video || b.video,
    qcm: a.qcm || b.qcm,
    entrainement: a.entrainement || b.entrainement,
    seanceProf: a.seanceProf || b.seanceProf,
    flashcards: a.flashcards || b.flashcards,
    interrogation: a.interrogation || b.interrogation,
    seanceApprofondie: a.seanceApprofondie || b.seanceApprofondie,
    notes: a.notes || b.notes,
    parcoursMajor: a.parcoursMajor || b.parcoursMajor,
  };
}

const NO_ACCESS: ContentAccess = {
  fiche: false, ficheExpress: false, video: false, qcm: false, entrainement: false,
  seanceProf: false, flashcards: false, interrogation: false, seanceApprofondie: false, notes: false, parcoursMajor: false,
};

/** Accès combiné (union) de plusieurs offres, version hardcodée. */
export function getContentAccessMulti(offers: Offer[]): ContentAccess {
  return offers.map(getContentAccess).reduce(mergeAccess, NO_ACCESS);
}

export function offerLabel(offer: Offer): string {
  if (offer === 'decouverte') return 'Espace Découverte';
  if (offer === 'intensif') return 'Formule Intensive';
  if (offer === 'approfondi') return 'Programme Approfondi';
  return 'Formule Essentielle';
}

export function describeScope(scope: PermissionScope): string {
  if (scope.type === 'all') return 'Toute l’offre';
  if (scope.colleges.length === 0) return 'Aucun collège';
  return `${scope.colleges.length} collège${scope.colleges.length > 1 ? 's' : ''}`;
}

/**
 * Contenus configurables (ordre + libellé) — alignés sur Config Permissions.
 *
 * Défini ici et non dans `formula-permissions.ts` : cette constante est lue par
 * des composants client (éditeur d'accès élève), or `formula-permissions.ts`
 * importe le client Supabase serveur — l'y laisser tirait `next/headers` dans le
 * bundle navigateur et cassait le build.
 */
export const CONTENT_ACCESS_LABELS: { key: keyof ContentAccess; label: string }[] = [
  { key: 'fiche', label: 'Fiche de cours' },
  { key: 'ficheExpress', label: 'Fiche Express' },
  { key: 'video', label: 'Résumé vidéo' },
  { key: 'qcm', label: 'QCM / DP / QROC' },
  { key: 'entrainement', label: 'QCM Entraînement' },
  { key: 'seanceProf', label: 'Séance du professeur' },
  { key: 'flashcards', label: 'Flashcards' },
  { key: 'interrogation', label: 'Interrogation' },
  { key: 'seanceApprofondie', label: 'Séance approfondie' },
  { key: 'notes', label: 'Prise de notes' },
  { key: 'parcoursMajor', label: 'Parcours du Major' },
];
