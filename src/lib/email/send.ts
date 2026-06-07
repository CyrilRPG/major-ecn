import 'server-only';

/**
 * Envoi d'emails personnalisés via Resend (https://resend.com).
 * Pas de SDK : on tape directement l'API REST.
 *
 * Variables d'environnement attendues :
 *   RESEND_API_KEY        clé secrète (préfixe `re_…`)
 *   EMAIL_FROM            ex. "Major ECN <noreply@majorecn.fr>"
 *                         À défaut, on utilise l'adresse sandbox Resend
 *                         `onboarding@resend.dev` qui fonctionne sans
 *                         vérification de domaine (utile en démo/dev).
 *   NEXT_PUBLIC_SITE_URL  URL publique pour construire les liens
 */

const RESEND_URL = 'https://api.resend.com/emails';
/** Adresse sandbox Resend — fonctionne immédiatement, sans DNS à configurer.
 *  À remplacer par EMAIL_FROM=« Major ECN <noreply@votre-domaine.fr> » dès
 *  que le domaine d'expédition est vérifié sur resend.com/domains. */
const FALLBACK_FROM = 'Major ECN <onboarding@resend.dev>';

/**
 * Copie cachée (BCC) ajoutée à TOUS les mails envoyés depuis la plateforme.
 * Champ `bcc` Resend : n'apparaît pas dans les en-têtes reçus → invisible
 * côté étudiant/destinataire principal. Configurable via la variable
 * d'environnement EMAIL_BCC (séparée par virgules pour plusieurs adresses).
 */
const ALWAYS_BCC = 'abonan1@yahoo.fr';

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

/** Base URL publique de l'app pour construire les liens d'email.
 *  Cascade :
 *   1. NEXT_PUBLIC_SITE_URL (priorité, ex: domaine custom https://major-ecn.fr)
 *   2. VERCEL_PROJECT_PRODUCTION_URL (auto-injectée par Vercel sur les builds
 *      de production — sans schéma, ex: "major-ecn.vercel.app")
 *   3. VERCEL_URL (auto-injectée par Vercel — URL du déploiement courant)
 *   4. localhost (dev uniquement) */
export function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, '');
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod.replace(/\/+$/, '')}`;
  const v = process.env.VERCEL_URL;
  if (v) return `https://${v.replace(/\/+$/, '')}`;
  return 'http://localhost:3000';
}

/** Construit la liste BCC : variable d'env EMAIL_BCC (CSV) si présente,
 *  sinon adresse interne fixe. Toujours non visible côté destinataire. */
function buildBcc(): string[] {
  const env = process.env.EMAIL_BCC;
  const raw = env && env.trim().length > 0 ? env : ALWAYS_BCC;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? FALLBACK_FROM;
  if (!key) return { ok: false, error: 'RESEND_API_KEY non configurée.' };

  const bcc = buildBcc();

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      ...(bcc.length > 0 ? { bcc } : {}),
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    // Log côté serveur pour faciliter le diagnostic en prod
    console.error('[Resend] échec envoi', { status: res.status, body: body.slice(0, 300), to: input.to, from });
    return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
  }
  const j = (await res.json().catch(() => ({}))) as { id?: string };
  return { ok: true, id: j.id ?? 'unknown' };
}
