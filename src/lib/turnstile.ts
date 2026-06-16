/**
 * Vérification serveur du captcha Cloudflare Turnstile.
 *
 * Anti-spam / anti-bot pour les formulaires publics (contact, inscriptions,
 * rappels, candidatures). Le widget client (turnstile-widget.tsx) produit un
 * token à usage unique ; on le valide ici via l'endpoint /siteverify.
 *
 * Activation progressive : si `TURNSTILE_SECRET_KEY` n'est pas configurée
 * (ex. en local), la vérification est volontairement neutralisée (renvoie
 * `ok: true`) pour ne pas bloquer le développement. Le captcha devient donc
 * actif dès que les clés sont renseignées dans l'environnement.
 */

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; error: string };

/** Indique si Turnstile est configuré côté serveur. */
export function isTurnstileConfigured(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY;
}

/**
 * Valide un token Turnstile. `remoteip` est optionnel mais recommandé.
 * Renvoie `{ ok: true, skipped: true }` si le secret n'est pas configuré.
 */
export async function verifyTurnstile(
  token: string | undefined | null,
  remoteip?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, skipped: true };

  if (!token) {
    return { ok: false, error: 'Captcha manquant. Merci de valider le test anti-robot.' };
  }

  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token);
  if (remoteip) form.set('remoteip', remoteip);

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    if (data.success) return { ok: true };
    return {
      ok: false,
      error: 'Échec de la vérification anti-robot. Merci de réessayer.',
    };
  } catch {
    return {
      ok: false,
      error: 'Vérification anti-robot indisponible. Réessayez dans un instant.',
    };
  }
}

/** Extrait l'IP cliente d'une requête (en-têtes proxy Vercel). */
export function clientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() ?? null;
  return req.headers.get('cf-connecting-ip');
}
