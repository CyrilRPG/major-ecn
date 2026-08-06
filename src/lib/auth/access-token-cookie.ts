/**
 * Extraction locale de la session Supabase SSR depuis les cookies.
 *
 * Ne déclenche AUCUN appel réseau — contrairement à `auth.getSession()`,
 * qui renouvelle le refresh_token dès que le JWT est proche de l'expiration
 * et peut bloquer 10–25 s quand l'API Auth / Postgres est saturée.
 */

type CookieLike = { name: string; value: string };

export type CookieSession = {
  accessToken: string;
  refreshToken: string | null;
  /** `true` si `exp` du JWT est dépassé (ou illisible). */
  accessExpired: boolean;
};

function decodeJwtExp(token: string): number | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { exp?: unknown };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function parseSessionObject(raw: string): CookieSession | null {
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
      const parsed = JSON.parse(text) as Record<string, unknown> | unknown[];
      const session = (Array.isArray(parsed) ? parsed[0] : parsed) as Record<string, unknown> | null;
      if (!session || typeof session !== 'object') continue;
      const accessToken =
        typeof session.access_token === 'string' ? session.access_token : null;
      if (!accessToken || accessToken.split('.').length !== 3) continue;
      const refreshToken =
        typeof session.refresh_token === 'string' ? session.refresh_token : null;
      const exp = decodeJwtExp(accessToken);
      // Marge 30 s : on considère « bientôt expiré » comme expiré pour
      // déclencher un refresh avant que getClaims ne le refuse.
      const accessExpired = exp === null || exp < Math.floor(Date.now() / 1000) + 30;
      return { accessToken, refreshToken, accessExpired };
    } catch {
      /* cookie illisible */
    }
  }
  return null;
}

function readAuthCookieRaw(cookies: CookieLike[]): string | null {
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
    if (raw) return raw;
  }
  return null;
}

/** Lit access + refresh token dans une liste de cookies (Edge ou `cookies()`). */
export function extractSessionFromCookies(cookies: CookieLike[]): CookieSession | null {
  const raw = readAuthCookieRaw(cookies);
  if (!raw) return null;
  return parseSessionObject(raw);
}

/** Lit l'access_token seul (compat. API routes / bearer). */
export function extractAccessTokenFromCookies(cookies: CookieLike[]): string | null {
  return extractSessionFromCookies(cookies)?.accessToken ?? null;
}
