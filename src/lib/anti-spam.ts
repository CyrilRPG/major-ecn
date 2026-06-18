/**
 * Anti-spam léger, indépendant de toute configuration (fonctionne même si
 * Cloudflare Turnstile n'est pas activé) :
 *
 *  - Honeypot : un champ caché (`hp`) que les humains ne voient jamais mais
 *    que les bots remplissent automatiquement. S'il est rempli → spam.
 *  - Piège temporel : on mesure le temps écoulé entre l'affichage du
 *    formulaire et l'envoi (`elapsedMs`). Un humain met plusieurs secondes ;
 *    un bot soumet quasi instantanément.
 *
 * À combiner avec Turnstile (défense en profondeur). Les deux champs sont
 * envoyés par le formulaire client.
 */

export type AntiSpamFields = { hp?: unknown; elapsedMs?: unknown };

/** Délai minimal plausible (ms) entre affichage et envoi d'un formulaire. */
const MIN_FILL_MS = 2000;

export function spamCheck(f: AntiSpamFields): { ok: true } | { ok: false; reason: string } {
  if (typeof f.hp === 'string' && f.hp.trim() !== '') {
    return { ok: false, reason: 'honeypot' };
  }
  const elapsed = typeof f.elapsedMs === 'number' ? f.elapsedMs : Number(f.elapsedMs);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_FILL_MS) {
    return { ok: false, reason: 'too_fast' };
  }
  return { ok: true };
}
