/**
 * Relecture des contenus par les professeurs — partie PURE, sans dépendance
 * serveur : importable par les composants client (case « relue ») comme par le
 * chargeur serveur (`relectures.ts`). Ne jamais y importer le client
 * service-role : un composant client qui l'entraînerait ferait tomber toute
 * l'application (« server-only » dans un bundle navigateur, 18/09/2026).
 */

export type Relecture = {
  reviewedBy: string;
  reviewedByName: string | null;
  reviewedAt: string;
};

/** Erreur PostgREST « relation inexistante » : la migration n'est pas passée. */
export function estTableRelecturesAbsente(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  return error.code === '42P01' || error.code === 'PGRST205' || /content_reviews/.test(error.message ?? '');
}

/** « Relue par Marie Dupont le 18 sept. » — libellé commun aux badges. */
export function libelleRelecture(r: Relecture, feminin = true): string {
  const date = new Date(r.reviewedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const qui = r.reviewedByName?.trim() ? ` par ${r.reviewedByName.trim()}` : '';
  return `${feminin ? 'Relue' : 'Relu'}${qui} le ${date}`;
}
