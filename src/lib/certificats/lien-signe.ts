import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Lien signé et éphémère vers le certificat PDF d'un élève
 * (`/api/certificate/[cours]?t=…`).
 *
 * POURQUOI. La route du certificat s'authentifie par cookie ; l'app mobile
 * ouvre le PDF dans le navigateur système (Browser.open), qui n'a ni cookie ni
 * jeton. `/api/mobile/certificate` (Bearer + appareil) délivre donc un lien
 * valable quelques minutes, lié à UN élève et UN cours : le PDF s'affiche, se
 * télécharge et se partage comme sur le web, sans exposer de session.
 */
const DUREE_MS = 10 * 60_000;

function secret(): string {
  const s = process.env.CERTIFICATE_LINK_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error('Secret de signature des certificats absent');
  // Clé dérivée : la clé de service n'est jamais utilisée telle quelle.
  return createHmac('sha256', s).update('certificat-lien-v1').digest('hex');
}

function signature(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function signerLienCertificat(userId: string, coursId: string, maintenant = Date.now()): string {
  const exp = maintenant + DUREE_MS;
  const payload = `${userId}.${coursId}.${exp}`;
  return `${Buffer.from(payload).toString('base64url')}.${signature(payload)}`;
}

/** L'élève désigné par un jeton valide pour ce cours, ou null. */
export function verifierLienCertificat(jeton: string, coursId: string, maintenant = Date.now()): string | null {
  const [corps, sig] = jeton.split('.');
  if (!corps || !sig) return null;
  let payload: string;
  try { payload = Buffer.from(corps, 'base64url').toString('utf8'); } catch { return null; }
  const attendue = Buffer.from(signature(payload));
  const recue = Buffer.from(sig);
  if (attendue.length !== recue.length || !timingSafeEqual(attendue, recue)) return null;
  const [userId, cours, exp] = payload.split('.');
  if (!userId || cours !== coursId || !(Number(exp) > maintenant)) return null;
  return userId;
}

/* ------------------------------------------------------------------ */
/* Jetons signés génériques (même secret, clé dérivée PAR USAGE)       */
/* ------------------------------------------------------------------ */

function secretUsage(usage: string): string {
  const s = process.env.CERTIFICATE_LINK_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error('Secret de signature absent');
  return createHmac('sha256', s).update(`jeton-signe-v1:${usage}`).digest('hex');
}

/**
 * Jeton HMAC éphémère portant une charge JSON, pour un usage donné (la clé
 * est dérivée de `usage` : un jeton d'un usage ne vaut rien pour un autre).
 * Format : `base64url(JSON { d, e }).base64url(hmac)`.
 */
export function signerJeton(usage: string, donnees: unknown, dureeMs: number, maintenant = Date.now()): string {
  const payload = JSON.stringify({ d: donnees, e: maintenant + dureeMs });
  const sig = createHmac('sha256', secretUsage(usage)).update(payload).digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

/** La charge d'un jeton valide et non expiré pour cet usage, ou `null`. */
export function verifierJeton<T = unknown>(usage: string, jeton: string, maintenant = Date.now()): T | null {
  if (typeof jeton !== 'string') return null;
  const [corps, sig] = jeton.split('.');
  if (!corps || !sig) return null;
  let payload: string;
  try { payload = Buffer.from(corps, 'base64url').toString('utf8'); } catch { return null; }
  const attendue = Buffer.from(createHmac('sha256', secretUsage(usage)).update(payload).digest('base64url'));
  const recue = Buffer.from(sig);
  if (attendue.length !== recue.length || !timingSafeEqual(attendue, recue)) return null;
  let parsed: { d?: unknown; e?: unknown };
  try { parsed = JSON.parse(payload) as { d?: unknown; e?: unknown }; } catch { return null; }
  if (!(Number(parsed.e) > maintenant)) return null;
  return (parsed.d ?? null) as T | null;
}
