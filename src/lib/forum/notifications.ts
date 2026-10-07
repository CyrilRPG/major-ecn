import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { forumNewQuestionEmail } from '@/lib/email/templates';
import { CONTACT_EMAIL, button, esc, majorEmail, majorText, pHtml, quote, summaryTable } from '@/lib/email/layout';
import { lireScopeEquipe, recoitQuestionEleve } from '@/lib/auth/collaborateurs';
import { contexteRoutage } from '@/lib/forum/routage';

/**
 * Notifications du forum — partagées par l'action web `askQuestionAction`
 * et la route de l'app `/api/mobile/forum`.
 */

/**
 * Envoie un email à chaque professeur RÉFÉRENT du collège de la question
 * (`recoitQuestionEleve`) : comptes actifs et non expirés, enseignants dont la
 * case « Professeur référent » n'est pas décochée — jamais un monteur vidéo,
 * un commercial ni un rédacteur blog. En médecine générale, seuls les
 * référents du sous-collège choisi par l'élève ; un professeur limité à
 * certains items ne reçoit que les questions des collèges de ces items. Une
 * question hors collège part aux référents de la spécialité de l'élève. Le
 * mail ne porte PAS l'adresse de l'élève.
 */
export async function notifyProfessorsOfNewQuestion(args: {
  questionId: string;
  matiereId: string | null;
  /** `permission_scope` de l'élève : routage d'une question hors cours. */
  eleveScope: unknown;
  studentPseudo: string;
  studentName: string;
  studentContext: string;
  coursTitre: string | null;
  matiereNom: string | null;
  body: string;
  /** Question QCM jointe : « Série 2 — Question 4 : énoncé… ». */
  questionJointe?: string | null;
}) {
  const admin = createAdminClient();
  const { data: profs } = await admin
    .from('profiles')
    .select('id, role, first_name, email, permission_scope, is_active, access_end')
    .eq('role', 'professor');

  if (!profs?.length) return;

  const ctx = await contexteRoutage(profs.map((p) => lireScopeEquipe(p.permission_scope)));
  const targets = profs.filter((p) => recoitQuestionEleve(p, args.matiereId, args.eleveScope, ctx));

  if (targets.length === 0) return;

  const qaUrl = `${siteUrl()}/admin/qa`;
  await Promise.all(
    targets.map(async (p) => {
      const { subject, html, text } = forumNewQuestionEmail({
        professorFirstName: p.first_name ?? '',
        studentPseudo: args.studentPseudo,
        studentName: args.studentName,
        studentEmail: null,
        studentContext: args.studentContext,
        coursTitre: args.coursTitre,
        matiereNom: args.matiereNom,
        questionBody: args.body,
        questionJointe: args.questionJointe ?? null,
        qaUrl,
      });
      await sendEmail({ to: p.email!, subject, html, text }).catch(() => null);
    }),
  );
}

/**
 * Signalement d'un contenu du forum par un élève (règle Apple 1.2 : tout
 * contenu publié par des utilisateurs doit pouvoir être signalé, et l'équipe
 * prévenue). Le mail part à l'équipe (adresse de contact), avec le texte
 * signalé, son auteur affiché (pseudo) et le motif. Aucune donnée
 * personnelle de l'élève qui signale n'y figure en dehors de son pseudo.
 */
export async function notifyTeamOfForumReport(args: {
  questionId: string;
  cible: 'question' | 'reponse' | 'relance';
  extrait: string;
  auteurAffiche: string;
  signalePar: string;
  motif: string;
}): Promise<boolean> {
  const cible = args.cible === 'question' ? 'Question' : args.cible === 'reponse' ? 'Réponse d’enseignant' : 'Message du fil';
  const preview = args.extrait.length > 600 ? `${args.extrait.slice(0, 600)}…` : args.extrait;
  const qaUrl = `${siteUrl()}/admin/qa`;
  const subject = 'Signalement sur le forum — Major ECN';
  const html = majorEmail({
    subject,
    audience: 'internal',
    preheader: `${cible} signalée : ${preview.slice(0, 90)}`,
    title: 'Contenu signalé sur le forum',
    intro: pHtml(`Un élève (<strong>${esc(args.signalePar)}</strong>) a signalé un contenu depuis l’application mobile.`),
    bodyHtml: [
      summaryTable([
        ['Contenu', esc(cible)],
        ['Auteur affiché', esc(args.auteurAffiche)],
        ['Motif', esc(args.motif || 'Non précisé')],
        ['Question', esc(args.questionId)],
      ]),
      quote(preview, { label: 'Texte signalé' }),
      button(qaUrl, 'Ouvrir les questions / réponses'),
    ].join('\n'),
  });
  const text = majorText([
    'Contenu signalé sur le forum',
    '',
    `${cible} de ${args.auteurAffiche}, signalée par ${args.signalePar}.`,
    `Motif : ${args.motif || 'Non précisé'}`,
    `Question : ${args.questionId}`,
    '',
    preview,
    '',
    `Modérer : ${qaUrl}`,
  ], { audience: 'internal' });
  const res = await sendEmail({ to: CONTACT_EMAIL, subject, html, text }).catch(() => null);
  return !!res && res.ok;
}
