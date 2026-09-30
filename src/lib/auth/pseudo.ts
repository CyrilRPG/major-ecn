/**
 * Pseudo auto-généré — discret, ne révèle pas le prénom/nom en clair.
 * Format : `{initiales}-{base36}` (ex. `jdu-7k3` pour Jean Dupont).
 * Les initiales (1–3 lettres) et un suffixe court garantissent l'unicité
 * (uniquePseudo) tout en restant énigmatiques (pas de prénom ou nom lisible).
 * La promotion n'y entre plus depuis le 30/09/2026 (notion retirée de la
 * plateforme) ; les pseudos déjà attribués (« jd-X-7k3 ») restent valables.
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

export function generatePseudo(firstName: string, lastName: string): string {
  return `${initialsOf(firstName, lastName)}-${randSuffix(3)}`;
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
  // Replace just the suffix and retry — keep the initials stable.
  const root = base.replace(/-[^-]+$/, '');
  for (let i = 0; i < 200; i++) {
    const c = `${root}-${randSuffix(3)}`;
    if (!(await exists(c))) return c;
  }
  return `${root}-${Date.now().toString(36)}`;
}

