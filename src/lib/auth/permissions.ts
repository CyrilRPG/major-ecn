import type { PermissionScope } from '@/types/domain';

export function parseScope(raw: unknown): PermissionScope {
  if (raw && typeof raw === 'object' && 'type' in raw) {
    const t = (raw as { type: unknown }).type;
    if (t === 'all') return { type: 'all' };
    if (t === 'faculty') {
      const fs = (raw as { faculties?: unknown }).faculties;
      const list = Array.isArray(fs) ? fs.filter((x): x is string => typeof x === 'string') : [];
      return { type: 'faculty', faculties: list };
    }
  }
  return { type: 'all' };
}

export function canAccessFaculte(scope: PermissionScope, faculteId: string): boolean {
  if (scope.type === 'all') return true;
  return scope.faculties.includes(faculteId);
}

export function describeScope(scope: PermissionScope): string {
  if (scope.type === 'all') return 'Toute l’offre';
  if (scope.faculties.length === 0) return 'Aucune faculté';
  return `${scope.faculties.length} faculté${scope.faculties.length > 1 ? 's' : ''}`;
}
