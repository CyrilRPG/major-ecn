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

/**
 * Destinataires explicites des récapitulatifs internes d'inscription
 * (découverte ET payant). Les deux adresses sont en `to` (visibles) afin que
 * l'équipe et le gérant reçoivent chaque nouvelle inscription, indépendamment
 * du BCC global.
 */
export const INTERNAL_NOTIFY_EMAILS = ['contact@major-ecn.fr', 'abonan1@yahoo.fr'];

export type EmailAttachment = {
  /** Nom de fichier affiché dans le mail (ex: "CGU.pdf"). */
  filename: string;
  /** Soit un contenu base64, soit un path absolu côté serveur (Resend
   *  supporte aussi l'URL publique via `path`). */
  content?: string;
  path?: string;
};

export type SendEmailInput = {
  /** Destinataire principal. Accepte une liste pour notifier plusieurs
   *  adresses explicites (ex. récap interne → contact@ + abonan1@). */
  to: string | string[];
  subject: string;
  html: string;
  /** Plain-text fallback pour les clients qui ne rendent pas le HTML. */
  text?: string;
  /** Optional reply-to header. */
  replyTo?: string;
  /** Pièces jointes à joindre via l'API Resend. */
  attachments?: EmailAttachment[];
};

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Base URL publique de l'app pour construire les liens d'email.
 *
 *  Le domaine canonique de production est **https://major-ecn.fr** : tous les
 *  emails transactionnels (activation, réinitialisation de mot de passe…)
 *  doivent y pointer, jamais sur une URL Vercel temporaire dont les cookies
 *  ne sont pas partagés avec le domaine custom.
 *
 *  Cascade :
 *   1. NEXT_PUBLIC_SITE_URL (override explicite, utile en preview/staging).
 *   2. NODE_ENV === 'production' → https://major-ecn.fr (forcé canonique).
 *   3. VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL (previews uniquement).
 *   4. localhost (dev uniquement). */
export function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env && env.trim().length > 0) return env.replace(/\/+$/, '');
  if (process.env.NODE_ENV === 'production') return 'https://major-ecn.fr';
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
      to: Array.isArray(input.to) ? input.to : [input.to],
      ...(bcc.length > 0 ? { bcc } : {}),
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      ...(input.attachments && input.attachments.length > 0
        ? { attachments: input.attachments }
        : {}),
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
