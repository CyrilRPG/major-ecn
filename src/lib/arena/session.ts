import 'server-only';
import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * EVC Arena — session participant (§3.2).
 *
 * Les participants n'ont pas de compte Supabase Auth : l'inscription est
 * authentifiée par le lien de confirmation reçu par email, puis par un cookie
 * signé (HMAC) qui porte l'identifiant du participant et une date d'expiration.
 * La reconnexion passe par un lien magique. Aucun mot de passe.
 *
 * Les jetons envoyés par email ne sont jamais stockés en clair : seule leur
 * empreinte SHA-256 est en base.
 */

export const ARENA_COOKIE = 'arena_session';
const SESSION_DAYS = 60;

function secret(): string {
  const s = process.env.ARENA_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error('ARENA_SESSION_SECRET (ou SUPABASE_SERVICE_ROLE_KEY) manquant : impossible de signer les sessions Arena.');
  return s;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

/** Jeton aléatoire (URL-safe) et son empreinte. */
export function newToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function encodeSession(participantId: string, tournamentId: string): string {
  const exp = Date.now() + SESSION_DAYS * 86_400_000;
  const payload = `${participantId}.${tournamentId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(value: string | undefined | null): { participantId: string; tournamentId: string } | null {
  if (!value) return null;
  const parts = value.split('.');
  if (parts.length !== 4) return null;
  const [participantId, tournamentId, expStr, sig] = parts;
  const payload = `${participantId}.${tournamentId}.${expStr}`;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expStr) < Date.now()) return null;
  return { participantId, tournamentId };
}

export async function setSessionCookie(participantId: string, tournamentId: string): Promise<void> {
  const store = await cookies();
  store.set(ARENA_COOKIE, encodeSession(participantId, tournamentId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(ARENA_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
}

/** Session courante lue depuis le cookie (sans accès base). */
export async function readSession(): Promise<{ participantId: string; tournamentId: string } | null> {
  const store = await cookies();
  return decodeSession(store.get(ARENA_COOKIE)?.value);
}

/* ------------------------------------------------------------------ */
/* Liens signés sans état (désinscription marketing, suppression)      */
/* ------------------------------------------------------------------ */

/** Jeton signé `kind:participantId` — vérifiable sans accès base, sans expiration. */
export function signedLinkToken(kind: string, participantId: string): string {
  const payload = `${kind}.${participantId}`;
  return Buffer.from(`${payload}.${sign(payload)}`).toString('base64url');
}

export function verifySignedLinkToken(token: string, kind: string): string | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const [k, participantId, sig] = raw.split('.');
    if (k !== kind || !participantId || !sig) return null;
    const expected = sign(`${k}.${participantId}`);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return participantId;
  } catch {
    return null;
  }
}
