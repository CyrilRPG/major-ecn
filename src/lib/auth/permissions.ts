import type { Offer, PermissionScope } from '@/types/domain';

function parseOffer(raw: unknown): Offer {
  if (raw && typeof raw === 'object') {
    const o = (raw as { offer?: unknown }).offer;
    if (o === 'premium') return 'premium';
    if (o === 'intensif') return 'intensif';
    // 'basic' is the legacy value — treated as 'essentiel'.
    if (o === 'essentiel' || o === 'basic') return 'essentiel';
  }
  return 'essentiel';
}

export function parseScope(raw: unknown): PermissionScope {
  const offer = parseOffer(raw);
  if (raw && typeof raw === 'object' && 'type' in raw) {
    const t = (raw as { type: unknown }).type;
    if (t === 'all') return { type: 'all', offer };
    if (t === 'college') {
      const cs = (raw as { colleges?: unknown }).colleges;
      const list = Array.isArray(cs) ? cs.filter((x): x is string => typeof x === 'string') : [];
      const co = (raw as { cours?: unknown }).cours;
      const cours = Array.isArray(co) ? co.filter((x): x is string => typeof x === 'string') : undefined;
      return { type: 'college', colleges: list, offer, ...(cours && cours.length > 0 ? { cours } : {}) };
    }
    // Legacy faculty-scoped accounts → full access (single EVC faculté now).
    if (t === 'faculty') return { type: 'all', offer };
  }
  return { type: 'all', offer };
}

export function canAccessCollege(scope: PermissionScope, collegeId: string): boolean {
  if (scope.type === 'all') return true;
  return scope.colleges.includes(collegeId);
}

/** Vérifie l'accès à un cours précis :
 *  - 'all' → toujours autorisé
 *  - 'college' sans liste de cours → autorisé si le collège du cours est dans la liste
 *  - 'college' avec liste de cours → autorisé si le cours est dans la liste explicite
 */
export function canAccessCours(scope: PermissionScope, collegeId: string, coursId: string): boolean {
  if (scope.type === 'all') return true;
  if (!scope.colleges.includes(collegeId)) return false;
  if (scope.cours && scope.cours.length > 0) return scope.cours.includes(coursId);
  return true;
}

/** Legacy faculté gate kept for unreferenced faculté routes; no-op under the EVC model. */
export function canAccessFaculte(scope: PermissionScope, _faculteId: string): boolean {
  return scope.type === 'all' || scope.type === 'college';
}

export function offerLabel(offer: Offer): string {
  if (offer === 'premium') return 'Premium';
  if (offer === 'intensif') return 'Intensif';
  return 'Essentiel';
}

export function describeScope(scope: PermissionScope): string {
  if (scope.type === 'all') return 'Toute l’offre';
  if (scope.colleges.length === 0) return 'Aucun collège';
  return `${scope.colleges.length} collège${scope.colleges.length > 1 ? 's' : ''}`;
}
