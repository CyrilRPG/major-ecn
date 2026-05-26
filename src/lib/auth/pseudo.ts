/**
 * Pseudo auto-généré — discret, ne révèle pas le prénom/nom en clair.
 * Format : `{initiales}-{promo}-{base36}` (ex. `jd-D2-7k3` pour Jean Dupont D2).
 * Les initiales (1–3 lettres), la promo et un suffixe court garantissent
 * l'unicité tout en restant énigmatiques (pas de prénom ou nom lisible).
 */

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

function initialsOf(firstName: string, lastName: string): string {
  const fi = normalize(firstName).slice(0, 1);
  const li = normalize(lastName).slice(0, 1);
  const li2 = normalize(lastName).slice(1, 2); // 2ᵉ lettre du nom pour densifier
  return (fi + li + li2) || 'm';
}

function randSuffix(len = 3): string {
  // base36 court (lettres + chiffres), évite les ambigus 0/o/1/l
  const chars = '23456789abcdefghijkmnpqrstuvwxyz';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function generatePseudo(firstName: string, lastName: string, promotion: string | null | undefined): string {
  const ini = initialsOf(firstName, lastName);
  const promo = (promotion ?? 'X').replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'X';
  return `${ini}-${promo}-${randSuffix(3)}`;
}

/**
 * Returns a pseudo guaranteed unique against the supplied checker.
 * Regénère un suffixe différent jusqu'à en trouver un libre.
 */
export async function uniquePseudo(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  if (!(await exists(base))) return base;
  // Replace just the suffix and retry — keep initials/promo stable.
  const root = base.replace(/-[^-]+$/, '');
  for (let i = 0; i < 200; i++) {
    const c = `${root}-${randSuffix(3)}`;
    if (!(await exists(c))) return c;
  }
  return `${root}-${Date.now().toString(36)}`;
}

