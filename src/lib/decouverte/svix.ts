import crypto from 'node:crypto';

/**
 * Vérification de signature des webhooks Resend (format Svix) :
 * signature = base64(HMAC-SHA256(clé, `${svix-id}.${svix-timestamp}.${corps}`)),
 * clé = base64 après le préfixe `whsec_`. En-tête `svix-signature` : liste
 * « v1,<sig> » séparée par des espaces (rotation des secrets). Horodatage
 * accepté à ± 5 minutes (anti-rejeu).
 *
 * Aucune dépendance serveur Next : testable directement.
 */
export function verifierSignatureSvix(
  secret: string,
  entetes: { id: string | null; timestamp: string | null; signature: string | null },
  corps: string,
  maintenantSec = Math.floor(Date.now() / 1000),
): boolean {
  const { id, timestamp, signature } = entetes;
  if (!secret || !id || !timestamp || !signature) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(maintenantSec - ts) > 300) return false;
  let cle: Buffer;
  try {
    cle = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  } catch {
    return false;
  }
  if (cle.length === 0) return false;
  const attendue = crypto.createHmac('sha256', cle).update(`${id}.${timestamp}.${corps}`).digest();
  return signature.split(' ').some((part) => {
    const [version, sig] = part.split(',');
    if (version !== 'v1' || !sig) return false;
    let recue: Buffer;
    try { recue = Buffer.from(sig, 'base64'); } catch { return false; }
    return recue.length === attendue.length && crypto.timingSafeEqual(recue, attendue);
  });
}
