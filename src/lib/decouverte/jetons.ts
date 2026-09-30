import 'server-only';
import crypto from 'node:crypto';

/**
 * Jetons des liens d'e-mail (accès, vidéo, désinscription, version
 * navigateur) — 32 octets pseudo-aléatoires en base64url, AUCUNE donnée
 * personnelle dans l'URL.
 *
 * La base ne stocke que le HASH SHA-256 du jeton. Le jeton lui-même est
 * DÉRIVÉ (HMAC-SHA-256) de l'identifiant aléatoire de la ligne `decouverte_liens`
 * et d'un secret serveur : il n'est écrit nulle part, mais le serveur peut le
 * recalculer pour rejouer un envoi interrompu À L'IDENTIQUE (même charge utile,
 * même clé d'idempotence Resend → jamais de second e-mail). Une fuite de la
 * base seule ne donne aucun jeton.
 *
 * Secret : DECOUVERTE_LIENS_SECRET si défini, sinon dérivé de la clé
 * service-role (toujours présente côté serveur, jamais exposée).
 */

export const JETON_RE = /^[A-Za-z0-9_-]{20,128}$/;
/** Emplacement du jeton dans les gabarits stockés (version navigateur, reprise). */
export const JETON_PLACEHOLDER = 'JETON_DECOUVERTE_A_REMPLACER';

function secret(): Buffer {
  const s = process.env.DECOUVERTE_LIENS_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error('Secret des liens indisponible (DECOUVERTE_LIENS_SECRET ou SUPABASE_SERVICE_ROLE_KEY).');
  return crypto.createHash('sha256').update(`major-ecn|decouverte-liens|${s}`).digest();
}

export function jetonDuLien(lienId: string): string {
  return crypto.createHmac('sha256', secret()).update(`lien:${lienId}`).digest('base64url');
}

export function hashJeton(jeton: string): string {
  return crypto.createHash('sha256').update(jeton).digest('hex');
}

/** Lien de désinscription de la campagne J1-J7 : identifiant du destinataire + signature. */
export function jetonCampagne(destinataireId: string): string {
  const sig = crypto.createHmac('sha256', secret()).update(`campagne:${destinataireId}`).digest('base64url').slice(0, 32);
  return `${destinataireId}.${sig}`;
}

export function lireJetonCampagne(jeton: string): string | null {
  const m = /^([0-9a-f-]{36})\.([A-Za-z0-9_-]{32})$/i.exec(jeton);
  if (!m) return null;
  const attendu = jetonCampagne(m[1]);
  const a = Buffer.from(jeton), b = Buffer.from(attendu);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? m[1] : null;
}
