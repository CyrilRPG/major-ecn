import 'server-only';
import { INTERNAL_NOTIFY_EMAILS, sendEmail, siteUrl } from '@/lib/email/send';
import { renderTemplate, type TemplateVars } from './templates';
import { addHistory, getTemplate } from './db';
import { fmtDateLong, fmtTime } from './format';
import type { AlertRow, AppointmentRow, EmailTemplateKey, SuiviSettings } from './types';
import { button, majorEmail, MAJOR } from '@/lib/email/layout';

/**
 * Envoi des emails du module (§15) : rendu des variables, habillage HTML
 * Major ECN, envoi Resend et journalisation SYSTÉMATIQUE dans `suivi_history`
 * (kind `invite` / `announce` / `relance` / `email`, payload = modèle, objet,
 * identifiant Resend ou erreur). Un envoi non tracé n'existe pas (§15).
 */
const RED = MAJOR.red;

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Texte brut → paragraphes HTML, URL cliquables. */
export function textToHtml(text: string): string {
  const paragraphs = text.replace(/\r\n/g, '\n').split(/\n{2,}/);
  return paragraphs
    .map((p) => {
      const escaped = escapeHtml(p).replace(/\n/g, '<br>');
      const linked = escaped.replace(/(https?:\/\/[^\s<]+)/g, (url) =>
        `<a href="${url}" style="color:${RED};font-weight:600;word-break:break-all">${url}</a>`);
      return `<p style="margin:0 0 14px 0;line-height:1.55">${linked}</p>`;
    })
    .join('');
}

/**
 * Habillage Major ECN commun (src/lib/email/layout.ts) : en-tête, bandeau
 * marine, bouton bulletproof et pied de page. Les administrateurs reçoivent
 * la variante « interne » (alertes).
 */
export function emailShell(opts: { title: string; bodyHtml: string; cta?: { label: string; url: string } | null; internal?: boolean }): string {
  return majorEmail({
    subject: opts.title,
    preheader: opts.bodyHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/&(amp|lt|gt|quot|#39);/g, (_m, e: string) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[e as 'amp'] ?? '')
      .replace(/\s+/g, ' ')
      .replace(/^\s*Bonjour[^,]*,\s*/, '')
      .trim()
      .slice(0, 120),
    eyebrow: 'Suivi individuel',
    tag: 'Suivi individuel',
    title: opts.title,
    bodyHtml: opts.bodyHtml + (opts.cta ? button(opts.cta.url, opts.cta.label) : ''),
    audience: opts.internal ? 'internal' : 'service',
    reason: opts.internal ? null : 'Cet email est envoyé dans le cadre de votre accompagnement individuel Major ECN.',
  });
}

function historyKindFor(key: EmailTemplateKey): string {
  if (key === 'invite') return 'invite';
  if (key === 'planning_announce') return 'announce';
  if (key === 'reminder_no_booking') return 'relance';
  return 'email';
}

export type TemplateSendInput = {
  key: EmailTemplateKey;
  to: string;
  vars: TemplateVars;
  /** Texte modifié avant envoi (§15) : prime sur le modèle en base. */
  override?: { subject?: string; body?: string } | null;
  userId: string | null;
  campaignId?: string | null;
  appointmentId?: string | null;
  actorId?: string | null;
  /** Kind d'historique forcé (ex. `relance` pour une relance automatique). */
  historyKind?: string;
};

export type SendOutcome = { ok: true; id: string } | { ok: false; error: string };

/** Envoie un email issu de la bibliothèque et le journalise. */
export async function sendTemplateEmail(input: TemplateSendInput): Promise<SendOutcome> {
  const tpl = await getTemplate(input.key);
  const subjectSrc = input.override?.subject?.trim() || tpl.subject;
  const bodySrc = input.override?.body?.trim() || tpl.body;
  const subject = renderTemplate(subjectSrc, input.vars);
  const text = renderTemplate(bodySrc, input.vars);
  const lien = input.vars.lien;
  const ctaLabel = input.key === 'reminder_before' ? 'Déplacer mon rendez-vous' : input.key === 'absence' ? 'Reprogrammer un rendez-vous' : 'Choisir mon créneau';
  const html = emailShell({
    title: subject,
    bodyHtml: textToHtml(text),
    cta: lien && text.includes(lien) ? { label: ctaLabel, url: lien } : null,
  });
  const res = await sendEmail({ to: input.to, subject, html, text });
  await addHistory({
    user_id: input.userId,
    campaign_id: input.campaignId ?? null,
    appointment_id: input.appointmentId ?? null,
    kind: input.historyKind ?? historyKindFor(input.key),
    actor_id: input.actorId ?? null,
    payload: {
      template_key: input.key,
      subject,
      to: input.to,
      ...(res.ok ? { resend_id: res.id } : { error: res.error }),
      ...(input.override ? { edited: true } : {}),
    },
  });
  return res;
}

/**
 * Confirmation transactionnelle de réservation / déplacement (§7). Texte fixe
 * dans le code : ce n'est pas un modèle de la bibliothèque.
 */
export async function sendBookingConfirmation(input: {
  to: string;
  prenom: string;
  appointment: AppointmentRow;
  moved: boolean;
  moveUrl: string | null;
  actorId?: string | null;
}): Promise<SendOutcome> {
  const date = fmtDateLong(input.appointment.starts_at);
  const heure = fmtTime(input.appointment.starts_at);
  const subject = input.moved
    ? `Votre rendez-vous de suivi est déplacé au ${date} à ${heure}`
    : `Votre rendez-vous de suivi est confirmé : ${date} à ${heure}`;
  const text =
    `Bonjour ${input.prenom},\n\n` +
    (input.moved
      ? `Votre rendez-vous de suivi individuel a bien été déplacé. Nouveau créneau : ${date} à ${heure}.\n\n`
      : `Votre rendez-vous de suivi individuel est confirmé le ${date} à ${heure}.\n\n`) +
    `Vous le retrouverez dans votre espace personnel (rubrique « Mes rendez-vous »).\n` +
    (input.moveUrl ? `Un empêchement ? Vous pouvez le déplacer à tout moment :\n${input.moveUrl}\n\n` : '\n') +
    `À très bientôt,\nL’équipe Major ECN`;
  const html = emailShell({
    title: subject,
    bodyHtml: textToHtml(text),
    cta: { label: 'Voir mes rendez-vous', url: `${siteUrl()}/mes-rendez-vous` },
  });
  const res = await sendEmail({ to: input.to, subject, html, text });
  await addHistory({
    user_id: input.appointment.user_id,
    campaign_id: input.appointment.campaign_id,
    appointment_id: input.appointment.id,
    kind: 'email',
    actor_id: input.actorId ?? null,
    payload: { template_key: input.moved ? 'confirmation_deplacement' : 'confirmation_reservation', subject, to: input.to, ...(res.ok ? { resend_id: res.id } : { error: res.error }) },
  });
  return res;
}

/** Email d'alerte administrateur (§4) au responsable défini. */
export async function sendAlertEmail(alert: AlertRow, settings: SuiviSettings): Promise<SendOutcome> {
  const to = alert.recipient_email?.trim() || settings.alert_email?.trim() || INTERNAL_NOTIFY_EMAILS;
  const subject = `[Suivi individuel] Alerte : ${alert.title}`;
  const url = `${siteUrl()}/admin/suivi/alertes`;
  const text =
    `Alerte programmée dans le module de suivi individuel.\n\n` +
    `Titre : ${alert.title}\nÉchéance : ${fmtDateLong(alert.due_at)} à ${fmtTime(alert.due_at)}\n` +
    (alert.note ? `Note : ${alert.note}\n` : '') +
    `\nL’alerte reste affichée dans l’espace d’administration jusqu’à son traitement, son report ou sa clôture :\n${url}`;
  const html = emailShell({ title: subject, bodyHtml: textToHtml(text), cta: { label: 'Ouvrir les alertes', url }, internal: true });
  const res = await sendEmail({ to, subject, html, text });
  await addHistory({
    campaign_id: alert.campaign_id,
    kind: 'email',
    payload: { template_key: 'alerte_admin', alert_id: alert.id, subject, to, ...(res.ok ? { resend_id: res.id } : { error: res.error }) },
  });
  return res;
}
