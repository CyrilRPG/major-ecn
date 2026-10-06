import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { annalesDeliveryEmail, annalesLeadNotificationEmail } from '@/lib/email/templates';
import { createAdminClient } from '@/lib/supabase/admin';
import { enrollInCampaign } from '@/lib/email/campaign-enroll';
import { spamCheck } from '@/lib/anti-spam';
import { verifyTurnstile, clientIp } from '@/lib/turnstile';
import { recueilParSlug } from '@/lib/data/annales-evc';
import {
  BUCKET_ANNALES,
  cheminRecueilAnnales,
  jetonTelechargementAnnales,
  nomFichierAnnales,
} from '@/lib/annales-evc/lien';

/**
 * Demande d'un recueil d'annales EVC (/annales-evc).
 *
 * Enregistre le contact, envoie le PDF par e-mail (en pièce jointe quand il est
 * léger, toujours avec un lien de téléchargement durable) et renvoie ce lien au
 * navigateur pour un téléchargement immédiat. L'envoi d'e-mail est secondaire :
 * le candidat a droit au recueil dès qu'il a rempli le formulaire, même si Resend
 * est indisponible.
 */
export const maxDuration = 30;

const CONTACT_EMAIL = 'contact@major-ecn.fr';
/** Au-delà, le PDF n'est pas joint (messageries qui refusent les gros e-mails) : le lien suffit. */
const PIECE_JOINTE_MAX = 10 * 1024 * 1024;

const Schema = z.object({
  prenom: z.string().trim().min(1, 'Prénom requis').max(80),
  nom: z.string().trim().min(1, 'Nom requis').max(80),
  email: z.string().trim().toLowerCase().email('Adresse e-mail invalide').max(160),
  telephone: z
    .string()
    .trim()
    .max(40)
    .refine((v) => v.replace(/\D/g, '').length >= 8, 'Numéro de téléphone invalide'),
  specialite: z.string().trim().min(1, 'Choisissez votre spécialité').max(80),
  consentement: z.literal(true, { message: 'Merci d’accepter d’être recontacté(e).' }),
  hp: z.string().optional().default(''),
  elapsedMs: z.number().optional(),
  turnstileToken: z.string().optional().default(''),
  utm: z.record(z.string(), z.string().max(200)).optional().default({}),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const d = parsed.data;

  // Robot : on fait semblant d'accepter, sans rien enregistrer ni envoyer.
  if (!spamCheck({ hp: d.hp, elapsedMs: d.elapsedMs }).ok) return NextResponse.json({ ok: true });
  const captcha = await verifyTurnstile(d.turnstileToken, clientIp(req));
  if (!captcha.ok) return NextResponse.json({ error: captcha.error }, { status: 400 });

  const recueil = recueilParSlug(d.specialite);
  if (!recueil) return NextResponse.json({ error: 'Spécialité inconnue.' }, { status: 400 });

  const admin = createAdminClient();
  const utm = Object.fromEntries(
    Object.entries(d.utm).filter(([k]) => /^(utm_(source|medium|campaign|term|content)|gclid|fbclid|ref)$/.test(k)),
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lead, error } = await (admin as any)
    .from('annales_leads')
    .insert({
      first_name: d.prenom,
      last_name: d.nom,
      email: d.email,
      phone: d.telephone,
      specialty_code: recueil.code,
      specialty: recueil.nom,
      utm,
    })
    .select('id')
    .single();
  if (error || !lead) {
    console.error('[annales-evc] enregistrement impossible :', error?.message);
    return NextResponse.json(
      { error: `Votre demande n’a pas pu être enregistrée. Réessayez ou écrivez-nous à ${CONTACT_EMAIL}.` },
      { status: 500 },
    );
  }

  enrollInCampaign(d.email, d.prenom, 'annales_lead').catch(() => {});

  const lienTelechargement = `${siteUrl()}/api/annales-evc/telecharger?t=${encodeURIComponent(jetonTelechargementAnnales(lead.id, recueil.slug))}`;

  // Pièce jointe : Resend télécharge le fichier depuis une URL signée de courte durée.
  let attachments: { filename: string; path: string }[] | undefined;
  if (recueil.octets <= PIECE_JOINTE_MAX) {
    const { data: signe } = await admin.storage.from(BUCKET_ANNALES).createSignedUrl(cheminRecueilAnnales(recueil.slug), 3600);
    if (signe?.signedUrl) attachments = [{ filename: nomFichierAnnales(recueil.slug), path: signe.signedUrl }];
  }

  const livraison = annalesDeliveryEmail({ prenom: d.prenom, recueil, lien: lienTelechargement, joint: !!attachments });
  const notification = annalesLeadNotificationEmail({
    prenom: d.prenom, nom: d.nom, email: d.email, telephone: d.telephone, specialite: recueil.nom, utm,
  });
  const [envoi, interne] = await Promise.all([
    sendEmail({
      to: d.email,
      subject: livraison.subject,
      html: livraison.html,
      text: livraison.text,
      attachments,
      idempotencyKey: `annales-evc-${lead.id}`,
      timeoutMs: 20_000,
    }),
    sendEmail({ to: CONTACT_EMAIL, subject: notification.subject, html: notification.html, text: notification.text, replyTo: d.email }),
  ]);
  if (!interne.ok) console.error('[annales-evc] notification interne échouée :', interne.error);
  if (!envoi.ok) console.error('[annales-evc] envoi au candidat échoué :', envoi.error);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from('annales_leads')
    .update({ email_sent: envoi.ok, email_error: envoi.ok ? null : String(envoi.error ?? '').slice(0, 500) })
    .eq('id', lead.id);

  return NextResponse.json({ ok: true, emailSent: envoi.ok, lien: lienTelechargement });
}
