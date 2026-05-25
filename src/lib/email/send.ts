import 'server-only';

/**
 * Envoi d'emails personnalisés via Resend (https://resend.com).
 * Pas de SDK : on tape directement l'API REST.
 *
 * Variables d'environnement attendues :
 *   RESEND_API_KEY        clé secrète (préfixe `re_…`)
 *   EMAIL_FROM            ex. "Major ECN <noreply@majorecn.fr>"
 *                         (le domaine doit être vérifié dans Resend)
 *   NEXT_PUBLIC_SITE_URL  URL publique pour construire les liens
 */

const RESEND_URL = 'https://api.resend.com/emails';

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  /** Plain-text fallback pour les clients qui ne rendent pas le HTML. */
  text?: string;
  /** Optional reply-to header. */
  replyTo?: string;
};

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, '');
  return 'http://localhost:3000';
}

export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'Major ECN <noreply@majorecn.fr>';
  if (!key) return { ok: false, error: 'RESEND_API_KEY non configurée.' };

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
  }
  const j = (await res.json().catch(() => ({}))) as { id?: string };
  return { ok: true, id: j.id ?? 'unknown' };
}
