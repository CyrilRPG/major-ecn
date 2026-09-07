import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { siteUrl } from '@/lib/email/send';
import { suiviDb } from './db';
import type { BookingTokenRow } from './types';

/**
 * Liens sécurisés de réservation (§7).
 *
 * Le jeton (32 octets aléatoires, base64url) n'est JAMAIS stocké : seule son
 * empreinte SHA-256 l'est. Il reste utilisable jusqu'à expiration (30 jours) :
 * `used_at` marque la première réservation, mais le candidat doit pouvoir
 * DÉPLACER son rendez-vous depuis le même lien (rappel J-1, §9).
 */
const TOKEN_TTL_DAYS = 30;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function bookingUrl(token: string): string {
  return `${siteUrl()}/reservation/${token}`;
}

/** Crée un jeton pour un candidat (et une campagne) et rend l'URL complète. */
export async function createBookingToken(userId: string, campaignId: string | null): Promise<{ token: string; url: string; expiresAt: string }> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 86_400_000).toISOString();
  const { error } = await suiviDb().from('suivi_booking_tokens').insert({
    user_id: userId,
    campaign_id: campaignId,
    token_hash: hashToken(token),
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);
  return { token, url: bookingUrl(token), expiresAt };
}

/**
 * Lien de réservation pour un candidat : on ne peut pas retrouver un jeton
 * existant (seule l'empreinte est conservée), on en émet donc un nouveau à
 * chaque email. Les anciens restent valables jusqu'à leur expiration.
 */
export async function bookingLinkFor(userId: string, campaignId: string | null): Promise<string> {
  const { url } = await createBookingToken(userId, campaignId);
  return url;
}

/** Résout un jeton présenté par le navigateur ; `null` si inconnu ou expiré. */
export async function resolveBookingToken(token: string): Promise<BookingTokenRow | null> {
  if (!token || token.length < 20 || token.length > 200 || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
  const { data } = await suiviDb().from('suivi_booking_tokens').select('*').eq('token_hash', hashToken(token)).maybeSingle();
  const row = data as BookingTokenRow | null;
  if (!row) return null;
  if (row.expires_at < new Date().toISOString()) return null;
  return row;
}

export async function markTokenUsed(id: string): Promise<void> {
  await suiviDb().from('suivi_booking_tokens').update({ used_at: new Date().toISOString() }).eq('id', id).is('used_at', null);
}

/** Purge des jetons expirés (cron). */
export async function purgeExpiredTokens(): Promise<number> {
  const { data } = await suiviDb().from('suivi_booking_tokens').delete().lt('expires_at', new Date().toISOString()).select('id');
  return Array.isArray(data) ? data.length : 0;
}
