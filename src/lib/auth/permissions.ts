import type { Offer, PermissionScope } from '@/types/domain';

function parseOffer(raw: unknown): Offer {
  if (raw && typeof raw === 'object' && (raw as { offer?: unknown }).offer === 'premium') return 'premium';
  return 'basic';
}

export function parseScope(raw: unknown): PermissionScope {
  const offer = parseOffer(raw);
  if (raw && typeof raw === 'object' && 'type' in raw) {
    const t = (raw as { type: unknown }).type;
    if (t === 'all') return { type: 'all', offer };
    if (t === 'college') {
      const cs = (raw as { colleges?: unknown }).colleges;
      const list = Array.isArray(cs) ? cs.filter((x): x is string => typeof x === 'string') : [];
      return { type: 'college', colleges: list, offer };
    }
    // Legacy faculty-scoped accounts → full access (single EDN faculté now).
    if (t === 'faculty') return { type: 'all', offer };
  }
  return { type: 'all', offer };
}

export function canAccessCollege(scope: PermissionScope, collegeId: string): boolean {
  if (scope.type === 'all') return true;
  return scope.colleges.includes(collegeId);
}

/** Legacy faculté gate kept for unreferenced faculté routes; no-op under the EDN model. */
export function canAccessFaculte(scope: PermissionScope, _faculteId: string): boolean {
  return scope.type === 'all' || scope.type === 'college';
}

export function offerLabel(offer: Offer): string {
  return offer === 'premium' ? 'Premium' : 'Basic';
}

export function describeScope(scope: PermissionScope): string {
  if (scope.type === 'all') return 'Toute l’offre';
  if (scope.colleges.length === 0) return 'Aucun collège';
  return `${scope.colleges.length} collège${scope.colleges.length > 1 ? 's' : ''}`;
}
