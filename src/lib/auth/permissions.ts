import type { Offer, PermissionScope } from '@/types/domain';

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

function parseVoie(raw: unknown): 'interne' | 'externe' | null {
  if (raw && typeof raw === 'object') {
    const v = (raw as { paid_voie?: unknown; voie?: unknown }).paid_voie ?? (raw as { voie?: unknown }).voie;
    if (v === 'interne' || v === 'externe') return v;
  }
  return null;
}

export function parseScope(raw: unknown): PermissionScope {
  const offer = parseOffer(raw);
  const voie = parseVoie(raw);
  if (raw && typeof raw === 'object' && 'type' in raw) {
    const t = (raw as { type: unknown }).type;
    if (t === 'all') return { type: 'all', offer, voie };
    if (t === 'college') {
      const cs = (raw as { colleges?: unknown }).colleges;
      const list = Array.isArray(cs) ? cs.filter((x): x is string => typeof x === 'string') : [];
      const co = (raw as { cours?: unknown }).cours;
      const cours = Array.isArray(co) ? co.filter((x): x is string => typeof x === 'string') : undefined;
      return { type: 'college', colleges: list, offer, voie, ...(cours && cours.length > 0 ? { cours } : {}) };
    }
    // Legacy faculty-scoped accounts → full access (single EVC faculté now).
    if (t === 'faculty') return { type: 'all', offer, voie };
  }
  return { type: 'all', offer, voie };
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
};

export function getContentAccess(offer: Offer): ContentAccess {
  switch (offer) {
    case 'essentiel':
      return { fiche: false, ficheExpress: false, video: false, qcm: true, entrainement: true, seanceProf: false, flashcards: true, interrogation: true, seanceApprofondie: false, notes: true };
    case 'intensif':
      return { fiche: true, ficheExpress: true, video: true, qcm: true, entrainement: true, seanceProf: false, flashcards: true, interrogation: true, seanceApprofondie: false, notes: true };
    case 'approfondi':
      // « Tout sauf cours vidéo » (+ restriction voie sur les séries MG,
      // appliquée par la RLS). Séances prof/approfondies incluses ; entraînement
      // ciblé conservé (QCM pour la voie interne, QROC pour la voie externe).
      return { fiche: true, ficheExpress: true, video: false, qcm: true, entrainement: true, seanceProf: true, flashcards: true, interrogation: true, seanceApprofondie: true, notes: true };
    default:
      return { fiche: true, ficheExpress: true, video: true, qcm: true, entrainement: true, seanceProf: true, flashcards: true, interrogation: true, seanceApprofondie: true, notes: true };
  }
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
