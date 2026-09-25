import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Rendu de TOUS les gabarits d'e-mails (Major ECN + EVC Arena) avec des
 * données d'exemple : aucune valeur manquante affichée, liens et visuels
 * absolus en https, images décrites (alt/width/height), désinscription dans
 * les mails marketing et Arena, poids < 100 Ko (Gmail tronque au-delà de 102 Ko).
 */
import * as T from '../src/lib/email/templates';
import * as C from '../src/lib/email/campaigns';
import * as A from '../src/lib/arena/emails';
import { emailShell, textToHtml } from '../src/lib/suivi/emails';
import { composerScope, ROLES_MODELES } from '../src/lib/auth/collaborateurs';
import { DEFAULT_BAREME } from '../src/lib/arena/scoring';

// Lu à l'appel (siteUrl, signature des liens, base des visuels) : fixé avant tout rendu.
process.env.NEXT_PUBLIC_SITE_URL = 'https://www.major-ecn.fr';
process.env.ARENA_SESSION_SECRET ??= 'test-secret-email-templates';
delete process.env.EMAIL_ASSETS_URL;

type Mail = { subject: string; html: string; text?: string };
const setup = 'https://www.major-ecn.fr/auth/confirm?token_hash=abc&type=recovery';
const t = { id: 't1', slug: 'demo', title: 'EVC Arena Psychiatrie', specialty: 'Psychiatrie', edition_label: 'Saison 2026', distinction_pct: 70, threshold_pct: 50, seconds_per_question: 60, questions_per_round: 12, bareme: DEFAULT_BAREME } as unknown as Parameters<typeof A.resultsEmail>[0];
const p = { id: 'p1', first_name: 'Lina', email: 'lina@example.test', pseudo: 'NeuroLina', timezone: 'Europe/Paris' } as unknown as Parameters<typeof A.resultsEmail>[1];
const d = (s: string) => new Date(s);
const scope = composerScope({ modules: ROLES_MODELES.enseignant_relecteur.modules, perimetre: { specialites: 'toutes', formules: {} } } as Parameters<typeof composerScope>[0]);

const marketing: Record<string, Mail> = Object.fromEntries((['j1', 'j3', 'j5', 'j7'] as const).map((k) => [`campagne-${k}`, { subject: k, html: C.renderCampaignHtml(k), text: C.renderCampaignText(k) }]));

const arenaParticipant: Record<string, Mail> = {
  'arena-login': A.loginEmail(t, p, 'https://www.major-ecn.fr/arena/connecter?t=x'),
  'arena-validated': A.validatedEmail(t, p, { m1Open: d('2026-10-05T16:00:00Z'), m1Theme: 'Humeur', bareme: DEFAULT_BAREME, qrpNs: [3] }),
  'arena-j7': A.roundReminderEmail(t, p, 'j7', { number: 2, theme: 'Addictologie', opens_at: d('2026-10-12T16:00:00Z'), closes_at: d('2026-10-14T21:59:00Z') }),
  'arena-j1': A.roundReminderEmail(t, p, 'j1', { number: 2, theme: '', opens_at: d('2026-10-12T16:00:00Z'), closes_at: d('2026-10-14T21:59:00Z') }),
  'arena-opening': A.roundOpeningEmail(t, p, { number: 2, theme: 'Addictologie', closes_at: d('2026-10-14T21:59:00Z') }, '2 j 05 h'),
  'arena-relance': A.relanceEmail(t, p, { number: 2, theme: 'Addictologie' }, '3 h 00'),
  'arena-results': A.resultsEmail(t, p, { number: 2, theme: 'X', score: 14.2, max: 17, cumulScore: 27.9, cumulMax: 34, cumulRounds: 2, rank: 1, distinction: 'gold', isLast: false, next: { number: 3, opens_at: d('2026-10-19T16:00:00Z'), theme: '' } }),
  'arena-results-unranked': A.resultsEmail(t, p, { number: 3, theme: '', score: null, max: 17, cumulScore: 0, cumulMax: 0, cumulRounds: 0, rank: null, isLast: true, next: null }),
  'arena-report-ack': A.reportAckEmail(t, p, 2, 7),
  'arena-report-update': A.reportUpdateEmail(t, p, 2, 7, 'rejected', ''),
  'arena-neutralized': A.neutralizedEmail(t, p, 2, 7, ''),
};

const all: Record<string, Mail> = {
  'welcome-student': T.welcomeEmail({ firstName: '', setupUrl: setup, role: 'student' }),
  'welcome-professor': T.welcomeEmail({ firstName: 'Claire', setupUrl: setup, role: 'professor' }),
  'invitation-equipe': T.invitationEquipeEmail({ firstName: 'Anne', setupUrl: setup, scope }),
  'invitation-admin': T.invitationEquipeEmail({ firstName: 'Paul', setupUrl: setup, scope: null, administrateur: true }),
  'forum-question-sans-email': T.forumNewQuestionEmail({ professorFirstName: 'Claire', studentPseudo: 'Hippo-42', coursTitre: null, matiereNom: null, questionBody: 'Question ?', qaUrl: 'https://www.major-ecn.fr/admin/qa' }),
  'forum-answer': T.forumNewAnswerEmail({ studentFirstName: 'Sara', professorName: 'Dr Martin', coursTitre: null, answerBody: 'Réponse.', forumUrl: 'https://www.major-ecn.fr/forum' }),
  'admin-signup': T.adminSignupNotificationEmail({ firstName: 'Léa', lastName: 'Morel', email: 'lea@example.test', promotion: null, collegesWish: null, adminUrl: 'https://www.major-ecn.fr/admin' }),
  satisfaction: T.satisfactionSubmittedEmail({ formTitle: 'Bilan', studentName: 'Sara', studentEmail: null, responsesUrl: 'https://www.major-ecn.fr/admin/formulaires/1' }),
  contact: T.contactMessageEmail({ name: 'Nadia', email: 'nadia@example.test', phone: null, subject: 'Question', message: 'Bonjour' }),
  recrutement: T.recrutementEmail({ name: 'Julien', email: 'julien@example.test', phone: null, message: null, attachmentNames: [] }),
  'purchase-confirmation': T.purchaseConfirmationEmail({ firstName: 'Karim', formuleName: 'Formule Intensive', amountEuros: 1490, installments: 3, setupUrl: setup, specialty: null }),
  'reset-password': T.resetPasswordEmail({ firstName: null, resetUrl: setup }),
  'decouverte-notification': T.decouverteSignupNotificationEmail({ firstName: 'Sara', lastName: '', email: 'sara@example.test' }),
  'purchase-notification': T.purchaseNotificationEmail({ email: 'k@example.test', formuleName: 'Intensive', amountEuros: 990, installments: 1 }),
  relance: T.relanceInactiveEmail({ firstName: null, setupUrl: setup }),
  'specialite-disponible': T.specialiteDisponibleEmail({ firstName: '', specialtyName: 'Anesthésie-réanimation', setupUrl: setup }),
  callback: T.callbackRequestEmail({ firstName: 'Mehdi', lastName: 'Saidi', email: 'm@example.test', phone: '0600000000' }),
  diagnostic: T.diagnosticLeadEmail({ firstName: 'Rania', email: 'r@example.test', score: 100, maxScore: 163, profileLabel: 'Méthodique' }),
  'guide-lead': T.guideLeadNotificationEmail({ firstName: 'Omar', email: 'o@example.test', phone: '0600000000', abVariant: 'A' }),
  'guide-delivery': T.guideDeliveryEmail({ firstName: 'Omar', guideUrl: 'https://major-ecn.fr/guides/guide-methodologie-evc-2026.pdf' }),
  broadcast: T.adminBroadcastEmail({ subject: 'Info', message: 'Bonjour\n\nVoir https://www.major-ecn.fr/revisions' }),
  'suivi-shell': { subject: 'RDV', html: emailShell({ title: 'RDV confirmé', bodyHtml: textToHtml('Bonjour Sara,\n\nVotre rendez-vous est confirmé.'), cta: { label: 'Voir mes rendez-vous', url: 'https://www.major-ecn.fr/mes-rendez-vous' } }) },
  'arena-confirmation': A.confirmationEmail(t, p, 'https://www.major-ecn.fr/arena/confirmer?t=x'),
  'arena-invite': A.inviteEmail(t, null, 'https://www.major-ecn.fr/arena/demo?i=ABC', null),
  'arena-deleted': A.deletedEmail(t, 'Lina'),
  ...arenaParticipant,
  ...marketing,
};

/** Texte visible : balises, commentaires conditionnels Outlook et styles retirés. */
function visible(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
}

test('aucun gabarit n’affiche undefined / NaN / null', () => {
  for (const [id, m] of Object.entries(all)) {
    for (const [part, s] of [['objet', m.subject], ['html', visible(m.html)], ['texte', m.text ?? '']] as const) {
      assert.doesNotMatch(s, /\bundefined\b|\bNaN\b|\bnull\b|\[object Object\]/, `${id} (${part})`);
    }
    assert.doesNotMatch(m.html, /="(undefined|null|NaN)"|\$\{/, `${id} : attribut ou interpolation vide`);
  }
});

test('liens et visuels absolus en https (mailto/tel tolérés), jamais de SVG', () => {
  for (const [id, m] of Object.entries(all)) {
    const urls = [...m.html.matchAll(/\b(?:href|src)="([^"]*)"/g)].map((x) => x[1]);
    assert.ok(urls.length > 0, id);
    for (const u of urls) {
      assert.match(u, /^(https:\/\/|mailto:|tel:)/, `${id} : lien non absolu ${u}`);
      assert.doesNotMatch(u, /\.svg(\?|$)/i, `${id} : SVG interdit ${u}`);
    }
    assert.doesNotMatch(m.html, /<svg/i, id);
  }
});

test('chaque image porte alt, width et height', () => {
  for (const [id, m] of Object.entries(all)) {
    for (const img of m.html.match(/<img\b[^>]*>/g) ?? []) {
      assert.match(img, /\salt="[^"]*"/, `${id} : ${img.slice(0, 80)}`);
      assert.match(img, /\swidth="\d+"/, `${id} : ${img.slice(0, 80)}`);
      assert.match(img, /\sheight="\d+"/, `${id} : ${img.slice(0, 80)}`);
    }
  }
});

test('structure e-mail robuste : doctype, préheader, 600 px, color-scheme, bouton VML, poids < 100 Ko', () => {
  for (const [id, m] of Object.entries(all)) {
    assert.match(m.html, /^<!DOCTYPE html>/, id);
    assert.match(m.html, /<meta name="color-scheme" content="(light|dark)">/, id);
    assert.match(m.html, /max-width:600px/, id);
    assert.match(m.html, /mso-hide:all;">/, `${id} : préheader`);
    if (/class="em-btn"/.test(m.html)) assert.match(m.html, /<v:roundrect/, `${id} : bouton sans VML Outlook`);
    assert.ok(Buffer.byteLength(m.html) < 100 * 1024, `${id} : ${Buffer.byteLength(m.html)} octets`);
  }
});

test('les mails marketing portent un lien de désinscription fonctionnel (HTML et texte)', () => {
  for (const [id, m] of Object.entries(marketing)) {
    const link = m.html.match(/<a href="([^"]+)"[^>]*>Se désabonner<\/a>/);
    assert.ok(link, id);
    assert.notEqual(link![1], '#', id);
    assert.match(m.text ?? '', /Se désabonner : mailto:/, id);
  }
});

test('les mails Arena d’un participant proposent la désinscription et la mention §9', () => {
  for (const [id, m] of Object.entries(arenaParticipant)) {
    assert.match(m.html, /\/arena\/desinscription\?t=/, id);
    assert.match(m.html, /tournoi ludique d’entraînement/, id);
    assert.match(m.text ?? '', /\/arena\/desinscription\?t=/, id);
  }
});

test('la note Arena reste sur 10 et le rang n’apparaît jamais sous le seuil', () => {
  const r = all['arena-results'];
  assert.match(r.html, /8,4/);
  assert.match(r.html, /\/ 10/);
  assert.match(r.text ?? '', /Note de la manche 2 : 8,4 \/ 10/);
  const u = A.resultsEmail(t, p, { number: 1, theme: '', score: 6, max: 20, cumulScore: 6, cumulMax: 20, cumulRounds: 1, rank: null, isLast: false, next: null });
  assert.doesNotMatch(visible(u.html), /Rang/);
});

test('mail aux professeurs : l’e-mail de l’élève n’est affiché que s’il est transmis', () => {
  const sans = all['forum-question-sans-email'];
  assert.doesNotMatch(sans.html, /mailto:(?!contact@major-ecn\.fr)/);
  const avec = T.forumNewQuestionEmail({ professorFirstName: 'C', studentPseudo: 'H', studentEmail: 'eleve@example.test', coursTitre: null, matiereNom: null, questionBody: 'Q', qaUrl: 'https://www.major-ecn.fr/admin/qa' });
  assert.match(avec.html, /mailto:eleve@example\.test/);
});
