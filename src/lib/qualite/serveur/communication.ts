import 'server-only';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { button, esc, greeting, majorEmail, p } from '@/lib/email/layout';
import type { ActionInactivite } from '../parametres';
import { FAMILLE_LABEL, type Famille } from '../types';
import { qdb } from './base';

/**
 * Communication du module Qualité : notifications de l'espace élève (cloche,
 * table `pedago_notifications`, une ligne par candidat et par `group_key`) et
 * e-mails (Resend, clé d'idempotence : un même envoi ne part jamais deux fois).
 */

export type Notification = { userId: string; groupKey: string; kind: string; titre: string; corps?: string; ctaLabel?: string; ctaHref?: string };

export async function notifier(lignes: Notification[]): Promise<void> {
  if (!lignes.length) return;
  const now = new Date().toISOString();
  const rows = lignes.map((l) => ({
    user_id: l.userId, kind: l.kind, group_key: l.groupKey, title: l.titre, body: l.corps ?? null,
    cta_label: l.ctaLabel ?? null, cta_href: l.ctaHref ?? null, channel: 'dashboard', payload: {},
    count: 1, created_at: now, updated_at: now, displayed_at: null, dismissed_at: null,
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await qdb().from('pedago_notifications').upsert(rows.slice(i, i + 500), { onConflict: 'user_id,group_key' });
    if (error) console.error('[qualite] notifications :', error.message);
  }
}

/** Retire la notification d'un questionnaire complété. */
export async function retirerNotification(userId: string, groupKey: string): Promise<void> {
  await qdb().from('pedago_notifications').update({ dismissed_at: new Date().toISOString() }).eq('user_id', userId).eq('group_key', groupKey);
}

function shell(o: { subject: string; title: string; intro: string; cta?: { label: string; url: string }; reason?: string; internal?: boolean }): string {
  return majorEmail({
    subject: o.subject,
    preheader: o.intro.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120),
    eyebrow: 'Qualité & suivi',
    title: o.title,
    intro: o.internal ? undefined : o.intro,
    bodyHtml: (o.internal ? o.intro : '') + (o.cta ? button(o.cta.url, o.cta.label) : ''),
    audience: o.internal ? 'internal' : 'service',
    reason: o.internal ? undefined : (o.reason ?? 'Cet e-mail vous est envoyé dans le cadre du suivi qualité de votre formation Major ECN.'),
  });
}

const DESCR: Record<Famille, string> = {
  HOT: 'Donnez-nous votre avis sur la séance que vous venez de suivre : trente secondes suffisent.',
  PROGRESS: 'Vous avez franchi une étape de votre parcours. Ce court bilan nous permet de vérifier que tout se passe bien et de vous aider si besoin.',
  FINAL: 'Votre première épreuve approche. Avant vos dernières révisions, dites-nous ce que vous avez pensé de votre formation : une fois ce bilan complété, vous retrouvez immédiatement tous vos contenus.',
  POST_EXAM: 'Vos épreuves sont terminées. Votre retour aidera directement les promotions suivantes. Ce questionnaire est facultatif et ne prend que quelques minutes.',
  FOLLOW_UP: 'Six mois ont passé depuis la fin de votre formation. Quelques questions sur votre devenir et sur ce que la formation vous a apporté.',
  FUNDER_SURVEY: "Questionnaire demandé par l'organisme qui finance votre formation.",
};

export async function emailQuestionnaire(input: {
  envoiId: string; to: string; prenom: string | null; famille: Famille; titre: string; url: string; relance?: number;
}) {
  const relance = input.relance ?? 0;
  const subject = relance > 0 ? `Rappel : ${input.titre}` : input.titre;
  const html = shell({
    subject,
    title: input.titre,
    intro: greeting(input.prenom) + p(DESCR[input.famille]) + (relance > 0 ? p('Nous ne voulons pas vous importuner : ce message est un simple rappel.') : ''),
    cta: { label: 'Répondre au questionnaire', url: input.url },
  });
  const text = `Bonjour${input.prenom ? ' ' + input.prenom : ''},\n\n${DESCR[input.famille]}\n\nRépondre : ${input.url}\n\nMajor ECN`;
  return sendEmail({ to: input.to, subject, html, text, idempotencyKey: `qualite-envoi-${input.envoiId}-${relance}`, sansBcc: true });
}

const INACTIVITE: Record<ActionInactivite, { sujet: string; titre: string; corps: (prenom: string | null, jours: number, progression: number | null) => string; cta: string }> = {
  rappel: {
    sujet: 'Votre préparation vous attend',
    titre: 'On reprend ?',
    corps: (_p, jours) => `Nous n'avons pas vu d'activité pédagogique sur votre compte depuis ${jours} jours. Quelques questions par jour suffisent à garder le rythme : votre programme du jour est prêt.`,
    cta: 'Reprendre ma préparation',
  },
  relance: {
    sujet: 'Où en êtes-vous de votre préparation ?',
    titre: 'Votre préparation en un coup d’œil',
    corps: (_p, jours, prog) => `Cela fait ${jours} jours que vous ne vous êtes pas entraîné(e).${prog !== null ? ` Votre parcours est avancé à ${Math.round(prog)} %.` : ''} Si quelque chose vous freine (organisation, difficulté sur un cours, fatigue), répondez simplement à cet e-mail : l'équipe pédagogique vous aidera.`,
    cta: 'Voir mon programme du jour',
  },
  signalement: {
    sujet: 'Votre préparation',
    titre: 'Votre préparation',
    corps: () => '',
    cta: '',
  },
  accompagnement: {
    sujet: 'Un accompagnement individuel pour reprendre',
    titre: 'Nous vous proposons un accompagnement',
    corps: (_p, jours) => `Vous n'avez pas travaillé sur la plateforme depuis ${jours} jours. Ce n'est pas un reproche : chaque préparation a ses passages difficiles. L'équipe pédagogique peut vous proposer un échange individuel pour faire le point et réorganiser votre travail. Répondez à cet e-mail ou prenez rendez-vous depuis votre espace.`,
    cta: 'Ouvrir mon espace',
  },
};

export async function emailInactivite(input: { userId: string; to: string; prenom: string | null; action: ActionInactivite; jours: number; progression: number | null; cle: string }) {
  const m = INACTIVITE[input.action];
  if (!m.cta) return { ok: true as const, id: 'aucun-email' };
  const url = `${siteUrl()}/accueil`;
  const html = shell({
    subject: m.sujet, title: m.titre,
    intro: greeting(input.prenom) + p(m.corps(input.prenom, input.jours, input.progression)),
    cta: { label: m.cta, url },
    reason: 'Cet e-mail vous est envoyé dans le cadre du suivi pédagogique de votre formation Major ECN.',
  });
  const text = `Bonjour${input.prenom ? ' ' + input.prenom : ''},\n\n${m.corps(input.prenom, input.jours, input.progression)}\n\n${url}\n\nMajor ECN`;
  return sendEmail({ to: input.to, subject: m.sujet, html, text, idempotencyKey: `qualite-inactivite-${input.cle}`, sansBcc: true });
}

export async function emailAlertesDirection(input: { to: string[]; sujet: string; lignes: { titre: string; detail: string | null; lien: string }[]; cle: string }) {
  if (!input.to.length || !input.lignes.length) return { ok: true as const, id: 'aucun' };
  const liste = input.lignes.slice(0, 40).map((l) =>
    `<li style="margin:0 0 10px"><a href="${esc(l.lien)}" style="font-weight:600;color:#8A1538">${esc(l.titre)}</a>${l.detail ? `<br><span style="color:#555">${esc(l.detail.slice(0, 300))}</span>` : ''}</li>`).join('');
  const plus = input.lignes.length > 40 ? p(`… et ${input.lignes.length - 40} autre(s).`) : '';
  const html = shell({
    subject: input.sujet, title: input.sujet, internal: true,
    intro: `<ul style="padding-left:18px;margin:0 0 16px">${liste}</ul>${plus}`,
    cta: { label: 'Ouvrir le module Qualité', url: `${siteUrl()}/admin/qualite/alertes` },
  });
  const text = input.lignes.map((l) => `- ${l.titre}${l.detail ? ` — ${l.detail}` : ''}\n  ${l.lien}`).join('\n');
  return sendEmail({ to: input.to, subject: input.sujet, html, text, idempotencyKey: `qualite-direction-${input.cle}`, sansBcc: true });
}

export const libelleFamille = (f: Famille) => FAMILLE_LABEL[f];
