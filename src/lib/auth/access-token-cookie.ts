/**
 * Extraction locale de l'access_token depuis les cookies Supabase SSR.
 *
 * Ne déclenche AUCUN appel réseau — contrairement à `auth.getSession()`,
 * qui renouvelle le refresh_token dès que le JWT est proche de l'expiration
 * et peut bloquer 10–25 s quand l'API Auth / Postgres est saturée.
 */

type CookieLike = { name: string; value: string };

function parseSessionJson(raw: string): string | null {
  const candidates = [raw];
  if (raw.startsWith('base64-')) candidates.push(raw.slice('base64-'.length));

  for (const candidate of candidates) {
    try {
      let text = candidate;
      if (!text.startsWith('{') && !text.startsWith('[')) {
        try {
          text = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
        } catch {
          /* pas du base64 */
        }
      }
      const parsed = JSON.parse(text) as { access_token?: unknown } | unknown[];
      const session = Array.isArray(parsed) ? parsed[0] : parsed;
      const token =
        session &&
        typeof session === 'object' &&
        typeof (session as { access_token?: unknown }).access_token === 'string'
          ? (session as { access_token: string }).access_token
          : null;
      if (token && token.split('.').length === 3) return token;
    } catch {
      /* cookie illisible */
    }
  }
  return null;
}

/** Lit l'access_token dans une liste de cookies (middleware Edge ou `cookies()`). */
export function extractAccessTokenFromCookies(cookies: CookieLike[]): string | null {
  const byName = new Map(cookies.map((c) => [c.name, c.value]));

  const bases = new Set<string>();
  for (const { name } of cookies) {
    if (!name.includes('-auth-token')) continue;
    bases.add(name.replace(/\.\d+$/, ''));
  }

  for (const base of bases) {
    let raw = byName.get(base) ?? '';
    if (!raw) {
      const parts: string[] = [];
      for (let i = 0; ; i++) {
        const piece = byName.get(`${base}.${i}`);
        if (piece === undefined) break;
        parts.push(piece);
      }
      raw = parts.join('');
    }
    if (!raw) continue;
    const token = parseSessionJson(raw);
    if (token) return token;
  }
  return null;
}
