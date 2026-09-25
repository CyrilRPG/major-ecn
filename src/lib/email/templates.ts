/**
 * Gabarits des e-mails Major ECN (transactionnels, équipe, notifications
 * internes). La mise en page — en-tête, bandeau, boutons, encadrés, pied de
 * page — vit dans `./layout` : ce fichier ne porte que le CONTENU de chaque
 * message. Chaque gabarit renvoie { subject, html, text }.
 */

import { presentationPoste, type ScopeEquipe } from '@/lib/auth/collaborateurs';
import {
  button,
  callout,
  divider,
  esc,
  greeting,
  iconList,
  linkFallback,
  mailto,
  majorEmail,
  majorText,
  MAJOR,
  mono,
  note,
  p,
  pHtml,
  quote,
  sectionTitle,
  signature,
  small,
  summaryTable,
  buttonSecondary,
  EMAIL_SITE,
  CONTACT_EMAIL,
} from './layout';

/**
 * Durée de validité annoncée dans les e-mails, en heures.
 *
 * SOURCE DE VÉRITÉ UNIQUE — elle doit refléter le réglage réel
 * « Email OTP Expiration » du dashboard Supabase (Authentication → Emails).
 * Les gabarits promettaient « 24 h » pendant que la valeur effective était
 * l'heure par défaut de GoTrue : des élèves attendaient donc tranquillement
 * avec un lien déjà mort. Un seul endroit à changer désormais.
 *
 * Réglable sans redéploiement via NEXT_PUBLIC_LINK_TTL_HOURS.
 */
const TTL_LIEN_HEURES = Number(process.env.NEXT_PUBLIC_LINK_TTL_HOURS) || 1;

/** « 1 heure », « 24 heures »… tel qu'affiché à l'élève. */
export function dureeLien(): string {
  return TTL_LIEN_HEURES === 1 ? '1 heure' : `${TTL_LIEN_HEURES} heures`;
}

const contactLine = (lead: string) =>
  note(`${esc(lead)} ${mailto(CONTACT_EMAIL, MAJOR.red)}.`);

/* ============================================================
   Bienvenue — activation d'un compte (découverte ou professeur)
   ============================================================ */
type WelcomeArgs = {
  firstName: string;
  setupUrl: string;
  /** 'student' = espace découverte, 'professor' = compte intervenant. */
  role: 'student' | 'professor';
};

export function welcomeEmail({ firstName, setupUrl, role }: WelcomeArgs): { subject: string; html: string; text: string } {
  const isProf = role === 'professor';
  const eyebrow = isProf ? 'Bienvenue dans l’équipe pédagogique' : 'Bienvenue chez Major ECN';
  const title = isProf ? 'Activez votre espace professeur' : 'Activez votre compte étudiant';
  const intro = isProf
    ? `Votre compte intervenant Major ECN est créé. Cliquez sur le bouton ci-dessous pour choisir votre mot de passe et accéder à l’espace « Questions / Réponses » où vous serez notifié des questions de vos élèves.`
    : `Votre inscription à l’espace découverte Major ECN est enregistrée. Cliquez sur le bouton ci-dessous pour choisir votre mot de passe et accéder immédiatement à votre aperçu de la plateforme.`;
  const subject = isProf
    ? '🩺 Activez votre espace professeur — Major ECN'
    : '🎓 Bienvenue chez Major ECN — activez votre espace découverte';

  const bodyHtml = [
    greeting(firstName, 'et bienvenue'),
    p(intro),
    button(setupUrl, 'Choisir mon mot de passe'),
    linkFallback(setupUrl),
    isProf ? '' : callout({
      tone: 'brand',
      title: 'Votre espace découverte est actif',
      icon: '&#10003;',
      html: small('Aperçu concret de la plateforme et de notre méthode de préparation aux EVC :', { margin: '0 0 12px' })
        + iconList(['10 QCM EVC', '1 cas clinique', '1 fiche pédagogique', '10 flashcards'], { size: 14 })
        + small('Sans carte bancaire · Sans engagement.', { color: MAJOR.muted, italic: true }),
    }),
    note(`Lien valable ${esc(dureeLien())} et à usage unique. Une question ? Écrivez-nous à ${mailto(CONTACT_EMAIL, MAJOR.red)}.`),
    signature({ closing: 'À très bientôt,' }),
  ].join('\n');

  const html = majorEmail({
    subject,
    preheader: isProf ? 'Choisissez votre mot de passe pour accéder à votre espace professeur.' : 'Choisissez votre mot de passe et découvrez la plateforme Major ECN.',
    eyebrow,
    title,
    tag: isProf ? 'Espace professeur' : 'Espace découverte',
    bodyHtml,
    reason: 'Vous recevez cet e-mail parce qu’un compte a été créé avec cette adresse.',
  });

  const text = majorText([
    title,
    '',
    `Bonjour ${firstName || ''},`,
    '',
    intro,
    '',
    `Choisissez votre mot de passe : ${setupUrl}`,
    ...(isProf ? [] : ['', 'Votre espace découverte est actif : 10 QCM EVC, 1 cas clinique, 1 fiche pédagogique, 10 flashcards. Sans carte bancaire · Sans engagement.']),
    '',
    `Lien valable ${dureeLien()} et à usage unique. Pour toute question : contact@major-ecn.fr`,
    '— Major ECN',
  ]);

  return { subject, html, text };
}

/* ============================================================
   Invitation d'un membre de l'équipe (Équipe & Permissions)
   ============================================================ */
type InvitationEquipeArgs = {
  firstName: string;
  setupUrl: string;
  /** Scope du collaborateur (modules + périmètre) ; ignoré pour un administrateur. */
  scope: ScopeEquipe | null;
  /** Compte administrateur (tous droits). */
  administrateur?: boolean;
  /** Date de fin d'accès (YYYY-MM-DD ou ISO), pour un prestataire. */
  accesJusquau?: string | null;
};

/**
 * Invitation adaptée au POSTE de la personne : un monteur vidéo n'est pas
 * accueilli comme un « professeur ». Intitulé = sa fonction saisie, sinon son
 * rôle modèle (Commercial, Gestionnaire vidéo…), sinon « Collaborateur » ; la
 * liste de ce à quoi il aura accès suit ses permissions réelles (pagesDuScope).
 */
export function invitationEquipeEmail({ firstName, setupUrl, scope, administrateur = false, accesJusquau = null }: InvitationEquipeArgs): { subject: string; html: string; text: string } {
  const p0 = administrateur
    ? {
        intitule: 'Administrateur',
        enseignant: false,
        mission: 'administrer l’ensemble de la plateforme Major ECN.',
        acces: ['Toute l’administration Major ECN (élèves, contenus, équipe, configuration)'],
      }
    : presentationPoste(scope);
  const prenom = firstName?.trim() || '';
  const eyebrow = p0.enseignant ? 'Bienvenue dans l’équipe pédagogique' : 'Bienvenue dans l’équipe Major ECN';
  const title = p0.enseignant ? 'Activez votre espace enseignant' : 'Activez votre accès collaborateur';
  const subject = p0.enseignant
    ? '🩺 Activez votre espace enseignant — Major ECN'
    : `Activez votre accès collaborateur (${p0.intitule}) — Major ECN`;
  const intro = `Un accès à l’administration Major ECN vient d’être créé pour vous en tant que « ${p0.intitule} ». Votre rôle : ${p0.mission}`;
  const mfa = !administrateur && scope?.mfa_obligatoire;
  const finAcces = accesJusquau ? new Date(accesJusquau.length === 10 ? `${accesJusquau}T12:00:00` : accesJusquau) : null;
  const finLisible = finAcces && Number.isFinite(finAcces.getTime())
    ? finAcces.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
    : null;
  const notes = [
    mfa ? 'La double authentification (2FA) vous sera demandée à votre première connexion.' : null,
    finLisible ? `Votre accès est ouvert jusqu’au ${finLisible}.` : null,
  ].filter((x): x is string => !!x);

  const notesHtml = notes.length > 0 ? small(notes.map(esc).join('<br>'), { color: MAJOR.muted, italic: true, margin: '4px 0 0' }) : '';
  const bodyHtml = [
    greeting(prenom, 'et bienvenue'),
    p(intro),
    p('Cliquez sur le bouton ci-dessous pour choisir votre mot de passe.'),
    button(setupUrl, 'Choisir mon mot de passe'),
    linkFallback(setupUrl),
    p0.acces.length > 0
      ? callout({ tone: 'navy', title: 'Ce à quoi vous aurez accès', icon: '&#10003;', html: iconList(p0.acces, { tone: 'navy', size: 14 }) + notesHtml })
      : notes.length > 0 ? callout({ tone: 'neutral', html: notesHtml }) : '',
    note(`Lien valable ${esc(dureeLien())} et à usage unique. Une question ? Écrivez-nous à ${mailto(CONTACT_EMAIL, MAJOR.red)}.`),
    signature({ closing: 'Bienvenue parmi nous,' }),
  ].join('\n');

  const html = majorEmail({
    subject,
    preheader: `Votre accès « ${p0.intitule} » est prêt : choisissez votre mot de passe.`,
    eyebrow,
    title,
    tag: p0.intitule,
    bodyHtml,
    reason: 'Vous recevez cet e-mail parce qu’un accès à l’administration Major ECN a été créé pour cette adresse.',
  });

  const text = majorText([
    title,
    '',
    `Bonjour ${prenom},`,
    '',
    intro,
    '',
    `Choisissez votre mot de passe : ${setupUrl}`,
    ...(p0.acces.length > 0 ? ['', 'Ce à quoi vous aurez accès :', ...p0.acces.map((l) => `• ${l}`)] : []),
    ...(notes.length > 0 ? ['', ...notes] : []),
    '',
    `Lien valable ${dureeLien()} et à usage unique. Pour toute question : contact@major-ecn.fr`,
    '— Major ECN',
  ]);

  return { subject, html, text };
}

/* ============================================================
   Forum : nouvelle question pour le professeur
   ============================================================ */
type ForumQuestionArgs = {
  professorFirstName: string;
  studentPseudo: string;
  /** Identité réelle : ce mail est réservé à l'équipe, qui doit savoir à qui répondre. */
  studentName?: string | null;
  /** Facultatif : n'est affiché que s'il est transmis. */
  studentEmail?: string | null;
  /** « Gériatrie · voie interne · Formule Intensive » */
  studentContext?: string | null;
  coursTitre: string | null;
  matiereNom: string | null;
  questionBody: string;
  qaUrl: string;
};
export function forumNewQuestionEmail({ professorFirstName, studentPseudo, studentName, studentEmail, studentContext, coursTitre, matiereNom, questionBody, qaUrl }: ForumQuestionArgs) {
  const subject = '✉️ Nouvelle question d’élève — Major ECN';
  const ctx = [matiereNom, coursTitre].filter(Boolean).join(' · ');
  const preview = questionBody.length > 240 ? questionBody.slice(0, 240) + '…' : questionBody;
  const nom = (studentName ?? '').trim() || studentPseudo;
  const auteurHtml = `<strong style="color:${MAJOR.ink};">${esc(nom)}</strong>${nom !== studentPseudo ? ` <span style="color:${MAJOR.muted};">(${esc(studentPseudo)})</span>` : ''}`;
  const identiteText = [nom !== studentPseudo ? `(${studentPseudo})` : null, studentEmail, studentContext].filter(Boolean).join(' · ');

  const bodyHtml = [
    greeting(professorFirstName),
    pHtml(`${auteurHtml} vient de poser une question${ctx ? ` sur <em>${esc(ctx)}</em>` : ''}.`),
    summaryTable([
      ['Élève', `${esc(nom)}${nom !== studentPseudo ? ` <span style="color:${MAJOR.muted};font-weight:400;">(${esc(studentPseudo)})</span>` : ''}`],
      studentEmail ? ['E-mail', mailto(studentEmail)] : null,
      studentContext ? ['Profil', esc(studentContext)] : null,
      ctx ? ['Cours', esc(ctx)] : null,
    ]),
    quote(preview, { label: 'Question' }),
    button(qaUrl, 'Répondre à la question'),
  ].join('\n');

  const html = majorEmail({
    subject,
    preheader: `${nom}${ctx ? ` · ${ctx}` : ''} : ${preview.slice(0, 90)}`,
    eyebrow: 'Forum — Questions / Réponses',
    title: 'Nouvelle question d’élève',
    tag: 'Questions / Réponses',
    bodyHtml,
    reason: 'Vous recevez cet e-mail car vous êtes intervenant sur ce collège.',
  });
  const text = majorText([
    'Nouvelle question d’élève — Major ECN',
    '',
    `${nom} vient de poser une question${ctx ? ` (${ctx})` : ''} :`,
    ...(identiteText ? [identiteText] : []),
    '',
    preview,
    '',
    `Répondre : ${qaUrl}`,
    '— Major ECN',
  ]);
  return { subject, html, text };
}

/* ============================================================
   Forum : nouvelle réponse pour l'élève
   ============================================================ */
type ForumAnswerArgs = {
  studentFirstName: string;
  professorName: string;
  coursTitre: string | null;
  answerBody: string;
  forumUrl: string;
};
export function forumNewAnswerEmail({ studentFirstName, professorName, coursTitre, answerBody, forumUrl }: ForumAnswerArgs) {
  const subject = '💬 Un professeur a répondu à ta question — Major ECN';
  const preview = answerBody.length > 280 ? answerBody.slice(0, 280) + '…' : answerBody;

  const bodyHtml = [
    greeting(studentFirstName),
    pHtml(`<strong style="color:${MAJOR.ink};">${esc(professorName)}</strong> a répondu à ta question${coursTitre ? ` sur <em>${esc(coursTitre)}</em>` : ''}.`),
    quote(preview, { label: `Réponse de ${professorName}`, tone: 'brand' }),
    button(forumUrl, 'Lire la réponse complète'),
    signature({ closing: 'Bonnes révisions,' }),
  ].join('\n');
  const html = majorEmail({
    subject,
    preheader: `${professorName} : ${preview.slice(0, 100)}`,
    eyebrow: 'Forum — Ta question a une réponse',
    title: 'Un prof t’a répondu',
    tag: 'Questions / Réponses',
    bodyHtml,
    reason: 'Tu reçois cet e-mail car tu as posé une question sur le forum Major ECN.',
  });
  const text = majorText([
    'Un professeur a répondu à ta question — Major ECN',
    '',
    `${professorName} a répondu${coursTitre ? ` (${coursTitre})` : ''} :`,
    '',
    preview,
    '',
    `Lire la réponse : ${forumUrl}`,
    '— Major ECN',
  ]);
  return { subject, html, text };
}

/* ============================================================
   Admin : nouvelle inscription (prospect via marketing)
   ============================================================ */
type AdminSignupArgs = {
  firstName: string;
  lastName: string;
  email: string;
  promotion: string | null;
  collegesWish: string | null;
  adminUrl: string;
};
export function adminSignupNotificationEmail({ firstName, lastName, email, promotion, collegesWish, adminUrl }: AdminSignupArgs) {
  const subject = `🎓 Nouvelle inscription : ${firstName} ${lastName}`;
  const bodyHtml = [
    p('Un nouveau prospect s’est inscrit via la vitrine.'),
    summaryTable([
      ['Prénom', esc(firstName)],
      ['Nom', esc(lastName)],
      ['Email', mono(email)],
      promotion ? ['Promotion', esc(promotion)] : null,
      collegesWish ? ['Collèges', esc(collegesWish)] : null,
    ], { title: 'Prospect' }),
    button(adminUrl, 'Ouvrir le panneau admin'),
  ].join('\n');
  const html = majorEmail({ subject, preheader: `${firstName} ${lastName} · ${email}`, eyebrow: 'Administration', title: 'Nouvelle inscription', bodyHtml, audience: 'internal' });
  const text = majorText([
    `Nouvelle inscription : ${firstName} ${lastName}`,
    `Email : ${email}`,
    promotion ? `Promotion : ${promotion}` : '',
    collegesWish ? `Collèges : ${collegesWish}` : '',
    '',
    `Admin : ${adminUrl}`,
  ].filter(Boolean), { audience: 'internal' });
  return { subject, html, text };
}

/* ============================================================
   Admin : nouvelle réponse à un formulaire de satisfaction
   ============================================================ */
type SatisfactionSubmittedArgs = {
  formTitle: string;
  studentName: string;
  studentEmail: string | null;
  responsesUrl: string;
};
export function satisfactionSubmittedEmail({ formTitle, studentName, studentEmail, responsesUrl }: SatisfactionSubmittedArgs) {
  const subject = `📋 Nouvelle réponse : ${formTitle}`;
  const bodyHtml = [
    pHtml(`<strong style="color:${MAJOR.ink};">${esc(studentName)}</strong>${studentEmail ? ` (${mono(studentEmail)})` : ''} vient de répondre au formulaire <strong style="color:${MAJOR.ink};">« ${esc(formTitle)} »</strong>.`),
    summaryTable([
      ['Formulaire', esc(formTitle)],
      ['Étudiant', esc(studentName)],
      studentEmail ? ['Email', mono(studentEmail)] : null,
    ]),
    button(responsesUrl, 'Voir la réponse'),
  ].join('\n');
  const html = majorEmail({ subject, preheader: `${studentName} a répondu au formulaire « ${formTitle} ».`, eyebrow: 'Administration', title: 'Nouvelle réponse de satisfaction', bodyHtml, audience: 'internal' });
  const text = majorText([
    `Nouvelle réponse au formulaire "${formTitle}"`,
    `Étudiant : ${studentName}${studentEmail ? ` (${studentEmail})` : ''}`,
    '',
    `Voir : ${responsesUrl}`,
  ], { audience: 'internal' });
  return { subject, html, text };
}

/* ============================================================
   Contact : message envoyé depuis le formulaire « Nous contacter »
   ============================================================ */
type ContactMessageArgs = {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
};
export function contactMessageEmail({ name, email, phone, subject, message }: ContactMessageArgs) {
  const mailSubject = `📩 Nouveau message — ${subject}`;
  const bodyHtml = [
    p('Nouveau message reçu via le formulaire de contact de la vitrine.'),
    summaryTable([
      ['Nom', esc(name)],
      ['Email', mailto(email)],
      phone ? ['Téléphone', esc(phone)] : null,
      ['Sujet', esc(subject)],
    ], { title: 'Expéditeur' }),
    quote(message, { label: 'Message' }),
    note(`Répondez directement à cet email pour contacter ${esc(name)}.`),
  ].join('\n');
  const html = majorEmail({ subject: mailSubject, preheader: `${name} : ${message.slice(0, 100)}`, eyebrow: 'Formulaire de contact', title: subject, bodyHtml, audience: 'internal' });
  const text = majorText([
    `Nouveau message de contact`,
    `Nom : ${name}`,
    `Email : ${email}`,
    phone ? `Téléphone : ${phone}` : '',
    `Sujet : ${subject}`,
    '',
    message,
  ].filter(Boolean), { audience: 'internal' });
  return { subject: mailSubject, html, text };
}

/* ============================================================
   Candidature — formulaire de recrutement de la vitrine
   ============================================================ */
type RecrutementArgs = {
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  /** Profil professionnel et disponibilités (libellé → réponse). */
  details?: { label: string; value: string }[];
  attachmentNames: string[];
};
export function recrutementEmail({ name, email, phone, message, details = [], attachmentNames }: RecrutementArgs) {
  const mailSubject = `🎓 Nouvelle candidature — ${name}`;
  const bodyHtml = [
    p('Nouvelle candidature reçue via le formulaire de recrutement de la vitrine.'),
    summaryTable([
      ['Nom', esc(name)],
      ['Email', mailto(email)],
      phone ? ['Téléphone', esc(phone)] : null,
      ['Documents', attachmentNames.length ? esc(attachmentNames.join(', ')) : 'Aucun'],
    ], { title: 'Candidat' }),
    details.length > 0 ? summaryTable(details.map((d) => [d.label, esc(d.value)] as [string, string]), { title: 'Profil et disponibilités', labelWidth: 42 }) : '',
    message ? quote(message, { label: 'Message' }) : '',
    note(`Répondez directement à cet email pour contacter ${esc(name)}. Les documents sont joints à ce message.`),
  ].join('\n');
  const html = majorEmail({ subject: mailSubject, preheader: `${name} · ${attachmentNames.length} document(s) joint(s)`, eyebrow: 'Formulaire de recrutement', title: 'Nouvelle candidature', bodyHtml, audience: 'internal' });
  const text = majorText([
    `Nouvelle candidature`,
    `Nom : ${name}`,
    `Email : ${email}`,
    phone ? `Téléphone : ${phone}` : '',
    `Documents : ${attachmentNames.length ? attachmentNames.join(', ') : 'Aucun'}`,
    ...details.map((d) => `${d.label} : ${d.value}`),
    '',
    message ?? '',
  ].filter(Boolean), { audience: 'internal' });
  return { subject: mailSubject, html, text };
}

/* ============================================================
   Confirmation d'achat — envoyé après paiement Stripe réussi
   ============================================================ */
type PurchaseConfirmationArgs = {
  firstName: string;
  formuleName: string;
  amountEuros: number;
  /** 1 = paiement intégral, 3 ou 4 = paiement en plusieurs fois. */
  installments: number;
  /** URL de setup-password (compte créé via admin SDK). */
  setupUrl: string;
  /** Spécialité achetée (libellé du collège débloqué). Le récapitulatif doit
   *  décrire CE périmètre : annoncer une autre spécialité était un contresens
   *  pour tout achat hors Médecine générale. */
  specialty?: string | null;
  /** Spécialité vendue avant la mise en ligne de ses contenus. */
  contentPending?: boolean;
};

export function purchaseConfirmationEmail({
  firstName,
  formuleName,
  amountEuros,
  installments,
  setupUrl,
  specialty,
  contentPending,
}: PurchaseConfirmationArgs) {
  const subject = `✅ Confirmation d'inscription — ${formuleName} | Major ECN`;
  const installmentsText =
    installments > 1
      ? ` (en ${installments} mensualités de ${(amountEuros / installments).toFixed(2)} €)`
      : '';
  // Une seule voie de concours est ouverte (celle choisie à l'inscription) :
  // on ne mentionne donc aucune voie ici.
  const specialtyLabel = (specialty ?? '').trim();
  const accessLine = specialtyLabel
    ? (contentPending
        ? `Accès à <strong>${esc(specialtyLabel)}</strong> dès la mise en ligne des contenus.`
        : `Accès complet aux contenus de <strong>${esc(specialtyLabel)}</strong>.`)
    : `Accès complet aux contenus de la spécialité choisie lors de votre inscription.`;
  const accessLineText = specialtyLabel
    ? (contentPending
        ? `Accès à ${specialtyLabel} dès la mise en ligne des contenus.`
        : `Accès complet aux contenus de ${specialtyLabel}.`)
    : `Accès complet aux contenus de la spécialité choisie lors de votre inscription.`;
  const amount = `${amountEuros.toFixed(2)} €`;
  const legalLink = (path: string, label: string) =>
    `<a href="${EMAIL_SITE}${path}" style="color:${MAJOR.red};text-decoration:underline;">${label}</a>`;

  const bodyHtml = [
    greeting(firstName),
    pHtml(`Votre paiement pour la <strong style="color:${MAJOR.ink};">${esc(formuleName)}</strong> a bien été enregistré (montant : <strong style="color:${MAJOR.ink};">${amount}</strong>${esc(installmentsText)}).`),
    p('Votre compte étudiant a été créé automatiquement. Cliquez sur le bouton ci-dessous pour choisir votre mot de passe et accéder immédiatement à la plateforme.'),
    summaryTable([
      ['Formule', `<span style="font-family:Georgia,'Times New Roman',serif;font-size:16px;">${esc(formuleName)}</span>`],
      ['Montant total', `<span style="color:${MAJOR.red};font-size:17px;font-weight:800;">${amount}</span>${installmentsText ? `<br><span style="font-weight:400;color:${MAJOR.muted};font-size:13px;">${esc(installmentsText.trim())}</span>` : ''}`],
      ['Accès', `<span style="font-weight:400;">${accessLine}</span>`],
    ], { title: 'Récapitulatif' }),
    button(setupUrl, 'Activer mon compte'),
    linkFallback(setupUrl, 'Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :'),
    callout({
      tone: 'navy',
      title: 'Documents contractuels (PDF en pièces jointes)',
      html: small(`<strong style="color:${MAJOR.ink};">Nous avons bien pris en compte votre renonciation au droit de rétractation.</strong> Elle vous ouvre l&rsquo;accès immédiat à la plateforme, conformément à l&rsquo;article L.&nbsp;221-28 13° du code de la consommation et aux CGS (§&nbsp;10.1).`, { margin: '0 0 10px' })
        + small(`Vous trouverez en pièces jointes les documents contractuels acceptés au moment de votre souscription : <strong>CGU</strong>, <strong>CGS</strong> et <strong>Conditions Particulières</strong>. Ils sont également consultables sur ${legalLink('/cgu', 'major-ecn.fr/cgu')}, ${legalLink('/cgs', '/cgs')} et ${legalLink('/conditions-particulieres', '/conditions-particulieres')}.`),
    }),
    contactLine('Une question sur votre préparation ? Écrivez-nous à'),
    signature({ closing: 'Bienvenue chez Major ECN,' }),
  ].join('\n');

  const html = majorEmail({
    subject,
    preheader: `Paiement enregistré : ${formuleName} (${amount}). Activez votre compte étudiant.`,
    eyebrow: 'Confirmation de paiement',
    title: 'Activez votre compte étudiant',
    lead: 'Bienvenue chez Major ECN.',
    tag: 'Confirmation d’inscription',
    bodyHtml,
    reason: 'Vous recevez cet e-mail suite à votre inscription payante sur Major ECN.',
  });

  const text = majorText([
    `Bonjour ${firstName || ''},`,
    ``,
    `Votre paiement pour la ${formuleName} a bien été enregistré.`,
    `Montant total : ${amount}${installmentsText}.`,
    ``,
    accessLineText,
    ``,
    `Activez votre compte : ${setupUrl}`,
    ``,
    `Nous avons bien pris en compte votre renonciation au droit de rétractation.`,
    `Elle vous ouvre l'accès immédiat à la plateforme (article L. 221-28 13° du code de la consommation, CGS § 10.1).`,
    ``,
    `Documents contractuels en pièces jointes : CGU, CGS, Conditions Particulières.`,
    `Également consultables sur major-ecn.fr/cgu, /cgs, /conditions-particulieres.`,
    ``,
    `L'équipe Major ECN`,
  ]);

  return { subject, html, text };
}

/* ============================================================
   Reset password — déclenché depuis /forgot-password
   ============================================================ */
type ResetPasswordArgs = {
  firstName?: string | null;
  resetUrl: string;
};
export function resetPasswordEmail({ firstName, resetUrl }: ResetPasswordArgs) {
  const subject = '🔐 Réinitialisation de votre mot de passe — Major ECN';
  const bodyHtml = [
    greeting(firstName),
    p('Vous avez demandé à réinitialiser votre mot de passe Major ECN. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.'),
    button(resetUrl, 'Choisir un nouveau mot de passe'),
    linkFallback(resetUrl),
    callout({
      tone: 'neutral',
      title: 'Sécurité',
      html: small(`Le lien est valable <strong style="color:${MAJOR.ink};">${esc(dureeLien())}</strong>. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email — votre mot de passe actuel reste inchangé.`),
    }),
    contactLine('Besoin d’aide ? Écrivez-nous à'),
    signature({ closing: 'Bien cordialement,' }),
  ].join('\n');
  const html = majorEmail({
    subject,
    preheader: `Choisissez un nouveau mot de passe. Lien valable ${dureeLien()}.`,
    eyebrow: 'Sécurité du compte',
    title: 'Réinitialisez votre mot de passe',
    tag: 'Sécurité du compte',
    bodyHtml,
    reason: 'Vous recevez cet e-mail suite à une demande de réinitialisation du mot de passe de votre compte Major ECN.',
  });
  const text = majorText([
    `Bonjour ${firstName ?? ''},`,
    ``,
    `Vous avez demandé à réinitialiser votre mot de passe Major ECN.`,
    `Choisissez votre nouveau mot de passe : ${resetUrl}`,
    ``,
    `Le lien est valable ${dureeLien()}. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — votre mot de passe actuel reste inchangé.`,
    ``,
    `— L'équipe Major ECN`,
  ]);
  return { subject, html, text };
}

/* ============================================================
   Récap interne — nouvelle inscription Espace Découverte (gratuit)
   Envoyé à contact@major-ecn.fr (INTERNAL_NOTIFY_EMAILS) à chaque création
   de compte découverte, avec toutes les infos saisies.
   ============================================================ */
type DecouverteSignupNotificationArgs = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  specialty?: string | null;
  voie?: string | null;
  session?: string | null;
  country?: string | null;
  passedEvc?: string | null;
};
export function decouverteSignupNotificationEmail({
  firstName,
  lastName,
  email,
  phone,
  specialty,
  voie,
  session,
  country,
  passedEvc,
}: DecouverteSignupNotificationArgs) {
  const fullName = `${firstName} ${lastName}`.trim();
  const subject = `🆕 Inscription Découverte : ${fullName || email}`;
  const row = (label: string, value: string | null | undefined): [string, string] | null => (value ? [label, esc(value)] : null);
  const bodyHtml = [
    pHtml(`Un nouvel étudiant vient de créer un compte <strong style="color:${MAJOR.ink};">Espace Découverte</strong> (gratuit).`),
    summaryTable([
      row('Prénom', firstName),
      row('Nom', lastName),
      ['Email', mailto(email)],
      row('Téléphone', phone),
      row('Spécialité', specialty),
      row('Voie', voie),
      row('Session', session),
      row('Pays de résidence', country),
      row('A passé les EVC', passedEvc),
    ], { title: 'Nouvel inscrit' }),
    note('Récapitulatif automatique — aucune action requise.'),
  ].join('\n');
  const html = majorEmail({ subject, preheader: `${fullName || email}${specialty ? ` · ${specialty}` : ''}`, eyebrow: 'Inscription — Espace Découverte', title: 'Nouvelle inscription Découverte', bodyHtml, audience: 'internal' });
  const text = majorText([
    `Nouvelle inscription Espace Découverte (gratuit)`,
    `Nom : ${fullName}`,
    `Email : ${email}`,
    phone ? `Téléphone : ${phone}` : '',
    specialty ? `Spécialité : ${specialty}` : '',
    voie ? `Voie : ${voie}` : '',
    session ? `Session : ${session}` : '',
    country ? `Pays : ${country}` : '',
    passedEvc ? `A passé les EVC : ${passedEvc}` : '',
  ].filter(Boolean), { audience: 'internal' });
  return { subject, html, text };
}

/* ============================================================
   Récap interne — nouvelle souscription payante (après paiement Stripe)
   Envoyé à contact@major-ecn.fr (INTERNAL_NOTIFY_EMAILS) une seule fois
   (déduplication via stripe_provisioning_log).
   ============================================================ */
type PurchaseNotificationArgs = {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  formuleName: string;
  amountEuros: number;
  /** 1 = paiement comptant, 3 ou 4 = paiement en plusieurs fois. */
  installments: number;
  specialty?: string | null;
  voie?: string | null;
};
export function purchaseNotificationEmail({
  firstName,
  lastName,
  email,
  phone,
  formuleName,
  amountEuros,
  installments,
  specialty,
  voie,
}: PurchaseNotificationArgs) {
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  const subject = `💳 Souscription payante : ${formuleName} — ${fullName || email}`;
  const paymentLabel =
    installments > 1
      ? `${amountEuros.toFixed(2)} € en ${installments}× (${(amountEuros / installments).toFixed(2)} €/mois)`
      : `${amountEuros.toFixed(2)} € (comptant)`;
  const row = (label: string, value: string | null | undefined): [string, string] | null => (value ? [label, esc(value)] : null);
  const bodyHtml = [
    pHtml(`Un étudiant vient de souscrire à une <strong style="color:${MAJOR.ink};">offre payante</strong>.`),
    summaryTable([
      ['Formule', `<strong>${esc(formuleName)}</strong>`],
      ['Montant', `<span style="color:${MAJOR.red};font-weight:800;">${esc(paymentLabel)}</span>`],
      row('Prénom', firstName),
      row('Nom', lastName),
      ['Email', mailto(email)],
      row('Téléphone', phone),
      row('Spécialité', specialty),
      row('Voie', voie),
    ], { title: 'Souscription' }),
    note('Récapitulatif automatique — paiement confirmé côté Stripe.'),
  ].join('\n');
  const html = majorEmail({ subject, preheader: `${formuleName} · ${paymentLabel} · ${fullName || email}`, eyebrow: 'Souscription payante', title: 'Nouvelle souscription payante', bodyHtml, audience: 'internal' });
  const text = majorText([
    `Nouvelle souscription payante`,
    `Formule : ${formuleName}`,
    `Montant : ${paymentLabel}`,
    fullName ? `Nom : ${fullName}` : '',
    `Email : ${email}`,
    phone ? `Téléphone : ${phone}` : '',
    specialty ? `Spécialité : ${specialty}` : '',
    voie ? `Voie : ${voie}` : '',
  ].filter(Boolean), { audience: 'internal' });
  return { subject, html, text };
}

/* ============================================================
   Relance — élève jamais connecté (cadence 7 jours)
   Message chaud et humain, sans parenthèses, avec le logo Major ECN.
   ============================================================ */
type RelanceArgs = {
  firstName?: string | null;
  setupUrl: string;
};
export function relanceInactiveEmail({ firstName, setupUrl }: RelanceArgs) {
  const hello = firstName && firstName.trim() ? firstName.trim() : 'et bienvenue';
  const subject = 'Votre accès Major ECN vous attend';
  const bodyHtml = [
    greeting(hello),
    pHtml('On ne vous a pas encore vu sur la plateforme et on tenait à vous le dire simplement&nbsp;: votre espace Major ECN est prêt et il n\'attend plus que vous.'),
    p('Quelques minutes suffisent pour choisir votre mot de passe et commencer votre préparation aux EVC avec les fiches, les QCM et les dossiers progressifs. Chaque jour compte, et le meilleur moment pour s\'y mettre, c\'est maintenant.'),
    button(setupUrl, 'Activer mon espace'),
    pHtml(`Une question ou un souci pour vous connecter&nbsp;? Répondez simplement à cet email ou écrivez-nous à ${mailto(CONTACT_EMAIL, MAJOR.red)}. Nous sommes là pour vous accompagner.`, { size: 14, color: MAJOR.muted }),
    signature({ closing: 'À très vite,' }),
  ].join('\n');
  const html = majorEmail({
    subject,
    preheader: 'Votre espace Major ECN est prêt : quelques minutes suffisent pour commencer.',
    eyebrow: 'On pense à vous',
    title: 'Votre place vous attend',
    tag: 'Votre espace',
    bodyHtml,
    reason: 'Vous recevez cet e-mail parce qu’un compte Major ECN a été créé pour vous et n’a pas encore été activé.',
  });
  const text = majorText([
    `Bonjour ${hello},`,
    '',
    `On ne vous a pas encore vu sur la plateforme et votre espace Major ECN est prêt.`,
    `Quelques minutes suffisent pour choisir votre mot de passe et commencer votre préparation aux EVC.`,
    '',
    `Activer mon espace : ${setupUrl}`,
    '',
    `Une question pour vous connecter ? Écrivez-nous à contact@major-ecn.fr.`,
    '',
    `À très vite,`,
    `L'équipe Major ECN`,
  ]);
  return { subject, html, text };
}

/* ============================================================
   Mise en ligne d'une spécialité vendue « contenus à venir »
   ============================================================ */

type SpecialiteDisponibleArgs = {
  firstName: string;
  /** Libellé commercial de la spécialité (ex. « Anesthésie-réanimation »). */
  specialtyName: string;
  /** Lien d'activation / de connexion (recovery link ou /login). */
  setupUrl: string;
  /** Compte ayant déjà un mot de passe : on l'invite à se connecter, pas à en
   *  choisir un (cf. lib/admin/student-invite.ts). */
  dejaActive?: boolean;
};

/**
 * Adressé aux étudiants qui ont acheté une spécialité AVANT la publication de
 * ses contenus (`permission_scope.content_pending`) : leur accès vient d'être
 * ouvert, on les invite à se connecter. Remplace le message « contenus à venir »
 * reçu au moment de l'achat.
 */
export function specialiteDisponibleEmail({ firstName, specialtyName, setupUrl, dejaActive }: SpecialiteDisponibleArgs) {
  const hello = firstName && firstName.trim() ? firstName.trim() : 'à vous';
  const subject = `${specialtyName} est en ligne — votre accès Major ECN est ouvert`;
  const bodyHtml = [
    greeting(hello),
    pHtml(`Lors de votre inscription, nous vous avions indiqué que les contenus d&rsquo;${esc(specialtyName)} n&rsquo;étaient pas encore disponibles sur la plateforme. C&rsquo;est désormais chose faite&nbsp;: ils sont en ligne, et votre compte a été paramétré avec les accès correspondant à votre formule.`),
    p('Vous y retrouverez :'),
    iconList(['Les fiches de cours', 'Les QCM', 'Les dossiers progressifs', 'Les flashcards de la spécialité']),
    p(dejaActive
      ? 'Connectez-vous avec vos identifiants habituels pour en profiter.'
      : 'Cliquez ci-dessous pour choisir votre mot de passe et commencer votre préparation.'),
    button(setupUrl, dejaActive ? 'Me connecter' : 'Activer mon espace'),
    pHtml(`Une question, un souci de connexion&nbsp;? Répondez simplement à cet email ou écrivez-nous à ${mailto(CONTACT_EMAIL, MAJOR.red)}. Merci de votre patience.`, { size: 14, color: MAJOR.muted }),
    signature({ closing: 'À très vite,' }),
  ].join('\n');
  const html = majorEmail({
    subject,
    preheader: `Les contenus d’${specialtyName} sont en ligne : fiches, QCM, dossiers progressifs et flashcards.`,
    eyebrow: 'Vos contenus sont disponibles',
    title: `${specialtyName} est en ligne`,
    tag: 'Nouveaux contenus',
    bodyHtml,
    reason: 'Vous recevez cet e-mail car vous êtes inscrit(e) à cette spécialité sur Major ECN.',
  });
  const text = majorText([
    `Bonjour ${hello},`,
    '',
    `Les contenus d'${specialtyName} sont désormais en ligne sur la plateforme Major ECN,`,
    `et votre compte a été paramétré avec les accès correspondant à votre formule.`,
    '',
    `Fiches de cours, QCM, dossiers progressifs et flashcards vous attendent.`,
    '',
    dejaActive ? `Me connecter : ${setupUrl}` : `Activer mon espace : ${setupUrl}`,
    '',
    `Une question, un souci de connexion ? Écrivez-nous à contact@major-ecn.fr.`,
    '',
    `À très vite,`,
    `L'équipe Major ECN`,
  ]);
  return { subject, html, text };
}

/* ============================================================
   Leads — demande de rappel (Programme Approfondi)
   ============================================================ */
type CallbackRequestArgs = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty?: string | null;
  message?: string | null;
  source?: string | null;
};
export function callbackRequestEmail({ firstName, lastName, email, phone, specialty, message, source }: CallbackRequestArgs) {
  const subject = `📞 Demande de rappel — ${firstName} ${lastName} (${specialty ?? 'spécialité non précisée'})`;
  const rows: [string, string][] = [
    ['Prénom', firstName],
    ['Nom', lastName],
    ['Email', email],
    ['Téléphone', phone],
    ['Spécialité', specialty || '—'],
    ['Source', source || 'site Major ECN'],
  ];
  const bodyHtml = [
    pHtml(`Un visiteur souhaite être recontacté par téléphone pour le <strong style="color:${MAJOR.ink};">Programme Approfondi</strong>.`),
    summaryTable(rows.map(([k, v]) => [k, k === 'Email' ? mailto(v) : k === 'Téléphone' ? `<a href="tel:${esc(v.replace(/[^\d+]/g, ''))}" style="color:${MAJOR.navy};text-decoration:underline;">${esc(v)}</a>` : esc(v)] as [string, string]), { title: 'À rappeler' }),
    message ? quote(message, { label: 'Message', tone: 'brand' }) : '',
    note(`Répondez directement à cet email pour contacter ${esc(firstName)} ${esc(lastName)} (${esc(email)}).`),
  ].join('\n');
  const html = majorEmail({ subject, preheader: `${firstName} ${lastName} · ${phone}`, eyebrow: 'Leads — Programme Approfondi', title: 'Nouvelle demande de rappel', bodyHtml, audience: 'internal' });
  const text = majorText([
    'Nouvelle demande de rappel - Programme Approfondi',
    '',
    ...rows.map(([k, v]) => `${k} : ${v}`),
    '',
    message ? `Message :\n${message}` : '',
  ].filter(Boolean), { audience: 'internal' });
  return { subject, html, text };
}

/* ============================================================
   Leads — diagnostic EVC complété
   ============================================================ */
type DiagnosticLeadArgs = {
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  specialty?: string | null;
  voie?: string | null;
  sessionEvc?: string | null;
  score: number;
  maxScore: number;
  profileLabel: string;
  obstacle?: string | null;
  answers?: Record<string, string>;
};
export function diagnosticLeadEmail(d: DiagnosticLeadArgs) {
  const subject = `📊 Diagnostic EVC — ${d.firstName} ${d.lastName || ''} · ${d.profileLabel} (${d.score}/${d.maxScore})`.trim();
  const rows: [string, string][] = [
    ['Nom', `${d.firstName} ${d.lastName || ''}`.trim()],
    ['Email', d.email],
    ['Téléphone', d.phone || '—'],
    ['Spécialité', d.specialty || '—'],
    ['Voie', d.voie || '—'],
    ['Session EVC visée', d.sessionEvc || '—'],
    ['Score', `${d.score} / ${d.maxScore}`],
    ['Profil', d.profileLabel],
    ['Principal obstacle', d.obstacle || '—'],
  ];
  const answers = Object.entries(d.answers ?? {});
  const bodyHtml = [
    summaryTable(rows.map(([k, v]) => [k, k === 'Email' ? mailto(v) : k === 'Score' ? `<span style="color:${MAJOR.red};font-size:16px;font-weight:800;">${esc(v)}</span>` : esc(v)] as [string, string]), { title: 'Candidat' }),
    answers.length > 0 ? summaryTable(answers.map(([k, v]) => [k, `<span style="font-weight:400;">${esc(v)}</span>`] as [string, string]), { title: 'Détail des réponses', labelWidth: 42 }) : '',
    note(`Répondez à cet email pour contacter ${esc(d.firstName)} (${esc(d.email)}).`),
  ].join('\n');
  const html = majorEmail({ subject, preheader: `${d.profileLabel} · ${d.score}/${d.maxScore}`, eyebrow: 'Leads — Diagnostic', title: 'Nouveau diagnostic — Profil EVC', bodyHtml, audience: 'internal' });
  const text = majorText([
    'Nouveau diagnostic — Profil EVC',
    '',
    ...rows.map(([k, v]) => `${k} : ${v}`),
  ], { audience: 'internal' });
  return { subject, html, text };
}

/* ============================================================
   Leads — Guide Méthodologie EVC 2026 (notification + envoi au visiteur)
   ============================================================ */
type GuideLeadArgs = {
  firstName: string;
  lastName?: string | null;
  email: string;
  phone: string;
  specialty?: string | null;
  voie?: string | null;
  abVariant: string;
  ctaVariant?: string | null;
};
export function guideLeadNotificationEmail({ firstName, lastName, email, phone, specialty, voie, abVariant, ctaVariant }: GuideLeadArgs) {
  const subject = `📘 Guide EVC 2026 téléchargé — ${firstName} ${lastName || ''}`.trim();
  const rows: [string, string][] = [
    ['Nom', firstName],
    ['Prénom', lastName || '—'],
    ['Email', email],
    ['Téléphone', phone],
    ['Spécialité', specialty || '—'],
    ['Voie', voie || '—'],
    ['Variante formulaire', abVariant],
    ['Variante CTA', ctaVariant || '—'],
  ];
  const bodyHtml = [
    pHtml(`Un visiteur a téléchargé le <strong style="color:${MAJOR.ink};">Guide Méthodologie EVC 2026</strong>.`),
    summaryTable(rows.map(([k, v]) => [k, k === 'Email' ? mailto(v) : esc(v)] as [string, string]), { title: 'Nouveau lead' }),
    note(`Répondez directement à cet email pour contacter ${esc(firstName)} (${esc(email)}).`),
  ].join('\n');
  const html = majorEmail({ subject, preheader: `${firstName} ${lastName || ''} · ${phone}`.trim(), eyebrow: 'Leads — Guide EVC 2026', title: 'Nouveau lead — Guide EVC 2026', bodyHtml, audience: 'internal' });
  const text = majorText([
    'Nouveau lead — Guide Méthodologie EVC 2026',
    '',
    ...rows.map(([k, v]) => `${k} : ${v}`),
  ], { audience: 'internal' });
  return { subject, html, text };
}

export function guideDeliveryEmail({ firstName, guideUrl }: { firstName: string; guideUrl: string }) {
  const subject = `Votre Guide Méthodologie EVC 2026 — Major ECN`;
  const bodyHtml = [
    greeting(firstName),
    pHtml(`Nous vous remercions pour votre confiance. Votre <strong style="color:${MAJOR.ink};">Guide Méthodologie EVC 2026</strong> (39 pages) est prêt à être téléchargé.`),
    p('Ce guide vous apporte les méthodes, les réflexes et les conseils les plus utiles pour mieux comprendre les attentes des EVC et structurer votre préparation.'),
    button(guideUrl, 'Télécharger mon guide'),
    pHtml('PDF&nbsp;&nbsp;•&nbsp;&nbsp;39 pages&nbsp;&nbsp;•&nbsp;&nbsp;Téléchargement immédiat', { size: 13, color: MAJOR.muted, align: 'center', margin: '-8px 0 28px' }),
    divider(),
    sectionTitle('Pour aller plus loin'),
    p('Ce guide vous apporte une méthode de travail solide. Pour transformer cette méthode en véritables automatismes, Major ECN met à votre disposition une plateforme complète avec des QCM, des cas cliniques, des corrections détaillées et un suivi personnalisé.', { size: 15 }),
    buttonSecondary(`${EMAIL_SITE}/plateforme`, 'Découvrir la plateforme'),
    signature({ closing: 'Nous vous souhaitons une excellente préparation !' }),
  ].join('\n');
  const html = majorEmail({
    subject,
    preheader: 'Votre guide de 39 pages est prêt : méthodes, réflexes et conseils pour les EVC.',
    eyebrow: 'Guide offert',
    title: 'Votre Guide Méthodologie EVC 2026',
    lead: 'La méthode qui fait la différence aux EVC.',
    tag: 'Guide EVC 2026',
    bodyHtml,
    reason: 'Vous recevez cet e-mail car vous avez demandé le Guide Méthodologie EVC 2026 sur major-ecn.fr.',
  });
  const text = majorText([
    `Bonjour ${firstName},`,
    '',
    'Votre Guide Méthodologie EVC 2026 est prêt à être téléchargé.',
    '',
    `Télécharger : ${guideUrl}`,
    '',
    'Nous vous souhaitons une excellente préparation !',
    '',
    'Major ECN — major-ecn.fr',
  ]);
  return { subject, html, text };
}

/* ============================================================
   Envoi groupé libre (admin → élèves)
   ============================================================ */
/** Message libre saisi par l'administration : texte brut, paragraphes et liens conservés. */
export function adminBroadcastEmail({ subject, message }: { subject: string; message: string }) {
  const paragraphs = message.replace(/\r\n/g, '\n').split(/\n{2,}/).map((para) =>
    pHtml(esc(para).replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, (u) => `<a href="${u}" style="color:${MAJOR.red};font-weight:600;word-break:break-all;">${u}</a>`)));
  const bodyHtml = [...paragraphs, signature({ closing: 'Bien à vous,' })].join('\n');
  const html = majorEmail({
    subject,
    preheader: message.slice(0, 110),
    eyebrow: 'Message de l’équipe',
    title: subject,
    tag: 'Information',
    bodyHtml,
    reason: 'Vous recevez cet e-mail en tant qu’élève inscrit(e) sur Major ECN.',
  });
  return { subject, html, text: majorText([message, '', '— L’équipe Major ECN']) };
}

