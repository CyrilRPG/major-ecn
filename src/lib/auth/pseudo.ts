/**
 * Pseudo auto-généré à partir du prénom, du nom et de la promotion.
 * Format : `prenom.nom.promo` (slugifié, en minuscules, sans accents).
 * L'utilisateur pourra le modifier depuis son profil.
 */

function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generatePseudo(firstName: string, lastName: string, promotion: string | null | undefined): string {
  const p = slug(firstName);
  const n = slug(lastName);
  const promo = (promotion ?? 'X').replace(/[^A-Za-z0-9]/g, '');
  const base = [p, n].filter(Boolean).join('.');
  return base ? `${base}.${promo}` : `eleve.${promo}.${Math.floor(Math.random() * 9000 + 1000)}`;
}

/**
 * Returns a pseudo guaranteed unique against the supplied checker.
 * Appends -2, -3, … if a collision is detected.
 */
export async function uniquePseudo(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  if (!(await exists(base))) return base;
  for (let i = 2; i < 200; i++) {
    const c = `${base}-${i}`;
    if (!(await exists(c))) return c;
  }
  return `${base}-${Date.now().toString(36)}`;
}
