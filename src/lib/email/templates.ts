/**
 * Templates HTML — charte Major ECN (palette bordeaux + tricolore arc-en-ciel,
 * Plus Jakarta Sans / Manrope). Compatibles tous clients : tables inline,
 * couleurs en hex, pas d'images externes obligatoires.
 */

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

  const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#FAFAF8;font-family:'Manrope',-apple-system,Segoe UI,Roboto,sans-serif;color:#2D2D2D;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #ECEEF1;border-radius:20px;overflow:hidden;">
            <!-- Brand bar -->
            <tr>
              <td style="background-color:#0E1626;padding:24px 28px;text-align:center;" bgcolor="#0E1626">
                <span style="font-family:'Plus Jakarta Sans','Manrope',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#FFFFFF;">
                  Major <span style="color:#C84A5A;">ECN</span>
                </span>
              </td>
            </tr>
            <!-- Tricolour rule (arc-en-ciel) -->
            <tr><td style="height:3px;background-color:#6B1A2A;background:linear-gradient(90deg,#6B1A2A 0%,#3B82F6 50%,#14B8A6 100%);font-size:0;line-height:0;" bgcolor="#6B1A2A">&nbsp;</td></tr>

            <!-- Body -->
            <tr>
              <td style="padding:36px 28px 28px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#6B1A2A;">
                  ${escapeHtml(eyebrow)}
                </p>
                <h1 style="margin:0 0 14px;font-family:'Plus Jakarta Sans','Manrope',sans-serif;font-size:26px;line-height:1.18;font-weight:800;letter-spacing:-0.02em;color:#2D2D2D;">
                  ${escapeHtml(title)}
                </h1>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#4A5568;">
                  Bonjour <strong style="color:#2D2D2D;">${escapeHtml(firstName || 'et bienvenue')}</strong>,<br />
                  ${escapeHtml(intro)}
                </p>

                <!-- Button (bulletproof : bgcolor + solid fallback + gradient) -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px auto 22px;">
                  <tr>
                    <td align="center" bgcolor="#6B1A2A" style="background-color:#6B1A2A;background:linear-gradient(90deg,#6B1A2A 0%,#8B2A3A 100%);border-radius:12px;mso-padding-alt:0;">
                      <a href="${escapeAttr(setupUrl)}" target="_blank" rel="noopener"
                         style="display:inline-block;padding:16px 32px;font-family:'Plus Jakarta Sans','Manrope',sans-serif;font-weight:800;font-size:16px;color:#FFFFFF;text-decoration:none;border-radius:12px;mso-line-height-rule:exactly;line-height:20px;">
                        <span style="color:#FFFFFF;">Choisir mon mot de passe →</span>
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:#7A7A7A;">
                  Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
                </p>
                <p style="margin:0 0 26px;word-break:break-all;font-family:'IBM Plex Mono',Menlo,Consolas,monospace;font-size:11px;line-height:1.5;">
                  <a href="${escapeAttr(setupUrl)}" style="color:#6B1A2A;text-decoration:underline;font-weight:600;">${escapeHtml(setupUrl)}</a>
                </p>

                ${isProf ? '' : `
                <div style="background-color:#F9F0F2;border:1px solid #F2D5DA;border-radius:14px;padding:16px 18px;margin:0 0 22px;">
                  <p style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:#6B1A2A;">
                    ✓ Votre espace découverte est actif
                  </p>
                  <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#3D3D3D;">
                    Aperçu concret de la plateforme et de notre méthode de préparation aux EVC :
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                    <tr><td style="padding:3px 0;font-size:13px;color:#3D3D3D;line-height:1.55;"><strong style="color:#6B1A2A;">•</strong> 10 QCM EVC</td></tr>
                    <tr><td style="padding:3px 0;font-size:13px;color:#3D3D3D;line-height:1.55;"><strong style="color:#6B1A2A;">•</strong> 1 cas clinique</td></tr>
                    <tr><td style="padding:3px 0;font-size:13px;color:#3D3D3D;line-height:1.55;"><strong style="color:#6B1A2A;">•</strong> 1 fiche pédagogique</td></tr>
                    <tr><td style="padding:3px 0;font-size:13px;color:#3D3D3D;line-height:1.55;"><strong style="color:#6B1A2A;">•</strong> 10 flashcards</td></tr>
                  </table>
                  <p style="margin:10px 0 0;font-size:12px;line-height:1.55;color:#6B6B6B;font-style:italic;">
                    Sans carte bancaire · Sans engagement.
                  </p>
                </div>`}

                <p style="margin:0;font-size:12px;line-height:1.6;color:#7A7A7A;">
                  Lien valable 1 heure et à usage unique. Une question ? Écrivez-nous à
                  <a href="mailto:contact@major-ecn.fr" style="color:#6B1A2A;font-weight:600;text-decoration:none;">contact@major-ecn.fr</a>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:18px 28px;background-color:#FAFAF8;border-top:1px solid #ECEEF1;" bgcolor="#FAFAF8">
                <p style="margin:0;font-size:11px;color:#9AA1AE;text-align:center;">
                  © Major ECN — Préparation EVC.<br />
                  Vous recevez cet email parce qu’un compte a été créé avec cette adresse.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    title,
    '',
    `Bonjour ${firstName || ''},`,
    '',
    intro,
    '',
    `Choisissez votre mot de passe : ${setupUrl}`,
    '',
    'Lien valable 1 heure et à usage unique. Pour toute question : contact@major-ecn.fr',
    '— Major ECN',
  ].join('\n');

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}
function escapeAttr(s: string): string {
  return escapeHtml(s);
}

/* ============================================================
   Layout commun — header navy + bande tricolore + footer
   ============================================================ */
function layout({ subject, eyebrow, title, bodyHtml }: { subject: string; eyebrow: string; title: string; bodyHtml: string }): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#FAFAF8;font-family:'Manrope',-apple-system,Segoe UI,Roboto,sans-serif;color:#2D2D2D;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #ECEEF1;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background:#0E1626;padding:24px 28px;text-align:center;">
                <span style="font-family:'Plus Jakarta Sans','Manrope',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#FFFFFF;">
                  Major <span style="color:#C84A5A;">ECN</span>
                </span>
              </td>
            </tr>
            <tr><td style="height:3px;background:linear-gradient(90deg,#6B1A2A 0%,#3B82F6 50%,#14B8A6 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr>
              <td style="padding:36px 28px 28px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#6B1A2A;">
                  ${escapeHtml(eyebrow)}
                </p>
                <h1 style="margin:0 0 14px;font-family:'Plus Jakarta Sans','Manrope',sans-serif;font-size:26px;line-height:1.18;font-weight:800;letter-spacing:-0.02em;color:#2D2D2D;">
                  ${escapeHtml(title)}
                </h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#FAFAF8;border-top:1px solid #ECEEF1;">
                <p style="margin:0;font-size:11px;color:#9AA1AE;text-align:center;">
                  © Major ECN — Préparation EVC.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buttonHtml(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px auto 22px;">
    <tr>
      <td align="center" bgcolor="#6B1A2A" style="background-color:#6B1A2A;background:linear-gradient(90deg,#6B1A2A 0%,#8B2A3A 100%);border-radius:12px;">
        <a href="${escapeAttr(href)}" target="_blank" rel="noopener" style="display:inline-block;padding:16px 32px;font-family:'Plus Jakarta Sans','Manrope',sans-serif;font-weight:800;font-size:16px;color:#FFFFFF;text-decoration:none;border-radius:12px;mso-line-height-rule:exactly;line-height:20px;">
          <span style="color:#FFFFFF;">${escapeHtml(label)} →</span>
        </a>
      </td>
    </tr>
  </table>`;
}

/* ============================================================
   Forum : nouvelle question pour le professeur
   ============================================================ */
type ForumQuestionArgs = {
  professorFirstName: string;
  studentPseudo: string;
  coursTitre: string | null;
  matiereNom: string | null;
  questionBody: string;
  qaUrl: string;
};
export function forumNewQuestionEmail({ professorFirstName, studentPseudo, coursTitre, matiereNom, questionBody, qaUrl }: ForumQuestionArgs) {
  const subject = '✉️ Nouvelle question d’élève — Major ECN';
  const ctx = [matiereNom, coursTitre].filter(Boolean).join(' · ');
  const preview = questionBody.length > 240 ? questionBody.slice(0, 240) + '…' : questionBody;

  const bodyHtml = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#4A5568;">
      Bonjour <strong style="color:#2D2D2D;">${escapeHtml(professorFirstName || '')}</strong>,<br />
      <strong>${escapeHtml(studentPseudo)}</strong> vient de poser une question${ctx ? ` sur <em>${escapeHtml(ctx)}</em>` : ''}.
    </p>
    <div style="background:#F6F7F9;border:1px solid #ECEEF1;border-radius:14px;padding:14px 16px;margin:0 0 22px;">
      <p style="margin:0;font-size:13px;line-height:1.6;color:#2D2D2D;white-space:pre-wrap;">${escapeHtml(preview)}</p>
    </div>
    ${buttonHtml(qaUrl, 'Répondre à la question')}
    <p style="margin:0;font-size:12px;line-height:1.6;color:#7A7A7A;">
      Vous recevez cet email car vous êtes intervenant sur ce collège.
    </p>`;
  const html = layout({ subject, eyebrow: 'Forum — Questions / Réponses', title: 'Nouvelle question d’élève', bodyHtml });
  const text = [
    'Nouvelle question d’élève — Major ECN',
    '',
    `${studentPseudo} vient de poser une question${ctx ? ` (${ctx})` : ''} :`,
    '',
    preview,
    '',
    `Répondre : ${qaUrl}`,
    '— Major ECN',
  ].join('\n');
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

  const bodyHtml = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#4A5568;">
      Bonjour <strong style="color:#2D2D2D;">${escapeHtml(studentFirstName || '')}</strong>,<br />
      <strong>${escapeHtml(professorName)}</strong> a répondu à ta question${coursTitre ? ` sur <em>${escapeHtml(coursTitre)}</em>` : ''}.
    </p>
    <div style="background:#F9F0F2;border:1px solid #F2D5DA;border-radius:14px;padding:14px 16px;margin:0 0 22px;">
      <p style="margin:0;font-size:13px;line-height:1.6;color:#2D2D2D;white-space:pre-wrap;">${escapeHtml(preview)}</p>
    </div>
    ${buttonHtml(forumUrl, 'Lire la réponse complète')}`;
  const html = layout({ subject, eyebrow: 'Forum — Ta question a une réponse', title: 'Un prof t’a répondu', bodyHtml });
  const text = [
    'Un professeur a répondu à ta question — Major ECN',
    '',
    `${professorName} a répondu${coursTitre ? ` (${coursTitre})` : ''} :`,
    '',
    preview,
    '',
    `Lire la réponse : ${forumUrl}`,
    '— Major ECN',
  ].join('\n');
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
  const bodyHtml = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#4A5568;">
      Un nouveau prospect s’est inscrit via la vitrine.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 22px;">
      <tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Prénom</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-weight:600;">${escapeHtml(firstName)}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Nom</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-weight:600;">${escapeHtml(lastName)}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Email</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-family:monospace;">${escapeHtml(email)}</td></tr>
      ${promotion ? `<tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Promotion</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-weight:600;">${escapeHtml(promotion)}</td></tr>` : ''}
      ${collegesWish ? `<tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;vertical-align:top;">Collèges</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;">${escapeHtml(collegesWish)}</td></tr>` : ''}
    </table>
    ${buttonHtml(adminUrl, 'Ouvrir le panneau admin')}`;
  const html = layout({ subject, eyebrow: 'Administration', title: 'Nouvelle inscription', bodyHtml });
  const text = [
    `Nouvelle inscription : ${firstName} ${lastName}`,
    `Email : ${email}`,
    promotion ? `Promotion : ${promotion}` : '',
    collegesWish ? `Collèges : ${collegesWish}` : '',
    '',
    `Admin : ${adminUrl}`,
  ].filter(Boolean).join('\n');
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
  const bodyHtml = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#4A5568;">
      <strong>${escapeHtml(studentName)}</strong>${studentEmail ? ` (<span style="font-family:monospace;font-size:12px;">${escapeHtml(studentEmail)}</span>)` : ''} vient de répondre au formulaire
      <strong>« ${escapeHtml(formTitle)} »</strong>.
    </p>
    ${buttonHtml(responsesUrl, 'Voir la réponse')}`;
  const html = layout({ subject, eyebrow: 'Administration', title: 'Nouvelle réponse de satisfaction', bodyHtml });
  const text = [
    `Nouvelle réponse au formulaire "${formTitle}"`,
    `Étudiant : ${studentName}${studentEmail ? ` (${studentEmail})` : ''}`,
    '',
    `Voir : ${responsesUrl}`,
  ].join('\n');
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
  const bodyHtml = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#4A5568;">
      Nouveau message reçu via le formulaire de contact de la vitrine.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 18px;">
      <tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Nom</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-weight:600;">${escapeHtml(name)}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Email</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-family:monospace;">${escapeHtml(email)}</td></tr>
      ${phone ? `<tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Téléphone</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-weight:600;">${escapeHtml(phone)}</td></tr>` : ''}
      <tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Sujet</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-weight:600;">${escapeHtml(subject)}</td></tr>
    </table>
    <div style="margin:0 0 8px;padding:16px 18px;background:#FAFAF8;border:1px solid #ECEEF1;border-radius:12px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7A7A7A;">Message</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#2D2D2D;white-space:pre-wrap;">${escapeHtml(message)}</p>
    </div>
    <p style="margin:18px 0 0;font-size:13px;color:#7A7A7A;">
      Répondez directement à cet email pour contacter ${escapeHtml(name)}.
    </p>`;
  const html = layout({ subject: mailSubject, eyebrow: 'Formulaire de contact', title: subject, bodyHtml });
  const text = [
    `Nouveau message de contact`,
    `Nom : ${name}`,
    `Email : ${email}`,
    phone ? `Téléphone : ${phone}` : '',
    `Sujet : ${subject}`,
    '',
    message,
  ].filter(Boolean).join('\n');
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
  attachmentNames: string[];
};
export function recrutementEmail({ name, email, phone, message, attachmentNames }: RecrutementArgs) {
  const mailSubject = `🎓 Nouvelle candidature — ${name}`;
  const bodyHtml = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#4A5568;">
      Nouvelle candidature reçue via le formulaire de recrutement de la vitrine.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 18px;">
      <tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Nom</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-weight:600;">${escapeHtml(name)}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Email</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-family:monospace;">${escapeHtml(email)}</td></tr>
      ${phone ? `<tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Téléphone</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-weight:600;">${escapeHtml(phone)}</td></tr>` : ''}
      <tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Documents</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-weight:600;">${attachmentNames.length ? escapeHtml(attachmentNames.join(', ')) : 'Aucun'}</td></tr>
    </table>
    ${message ? `<div style="margin:0 0 8px;padding:16px 18px;background:#FAFAF8;border:1px solid #ECEEF1;border-radius:12px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7A7A7A;">Message</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#2D2D2D;white-space:pre-wrap;">${escapeHtml(message)}</p>
    </div>` : ''}
    <p style="margin:18px 0 0;font-size:13px;color:#7A7A7A;">
      Répondez directement à cet email pour contacter ${escapeHtml(name)}. Les documents sont joints à ce message.
    </p>`;
  const html = layout({ subject: mailSubject, eyebrow: 'Formulaire de recrutement', title: 'Nouvelle candidature', bodyHtml });
  const text = [
    `Nouvelle candidature`,
    `Nom : ${name}`,
    `Email : ${email}`,
    phone ? `Téléphone : ${phone}` : '',
    `Documents : ${attachmentNames.length ? attachmentNames.join(', ') : 'Aucun'}`,
    '',
    message ?? '',
  ].filter(Boolean).join('\n');
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
};

export function purchaseConfirmationEmail({
  firstName,
  formuleName,
  amountEuros,
  installments,
  setupUrl,
}: PurchaseConfirmationArgs) {
  const subject = `✅ Confirmation d'inscription — ${formuleName} | Major ECN`;
  const installmentsText =
    installments > 1
      ? ` (en ${installments} mensualités de ${(amountEuros / installments).toFixed(2)} €)`
      : '';
  const intro = `Votre paiement pour la <strong>${escapeHtml(formuleName)}</strong> a bien été enregistré (montant : <strong>${amountEuros.toFixed(2)} €</strong>${escapeHtml(installmentsText)}).<br /><br />Votre compte étudiant a été créé automatiquement. Cliquez sur le bouton ci-dessous pour choisir votre mot de passe et accéder immédiatement à la plateforme.`;
  const bodyHtml = `
    <p style="margin:0 0 8px;font-size:13px;color:#9AA1AE;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
      Bienvenue chez Major ECN
    </p>
    <h1 style="margin:0 0 16px;font-family:'Plus Jakarta Sans','Manrope',sans-serif;font-size:24px;line-height:1.25;color:#0F1F4D;font-weight:800;letter-spacing:-0.02em;">
      Activez votre compte étudiant
    </h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#2D2D2D;">
      Bonjour <strong style="color:#2D2D2D;">${escapeHtml(firstName || '')}</strong>,<br />
      ${intro}
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;background:#FDEEEF;border:1px solid #F5D0D5;border-radius:14px;padding:18px 20px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:12px;color:#9AA1AE;text-transform:uppercase;letter-spacing:0.06em;">Récapitulatif</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#0F1F4D;">${escapeHtml(formuleName)}</p>
          <p style="margin:6px 0 0;font-size:13px;color:#5A5A5A;">
            Montant total : <strong style="color:#C0112E;">${amountEuros.toFixed(2)} €</strong>${escapeHtml(installmentsText)}
          </p>
          <p style="margin:4px 0 0;font-size:12px;color:#7A7A7A;">
            Accès complet à la <strong>Médecine Générale (Voie interne + Voie externe)</strong>.
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px auto 8px;">
      <tr>
        <td align="center" bgcolor="#8B0E22" style="background-color:#8B0E22;background:linear-gradient(90deg,#8B0E22 0%,#C0112E 100%);border-radius:12px;">
          <a href="${escapeAttr(setupUrl)}" target="_blank" rel="noopener"
             style="display:inline-block;padding:16px 32px;color:#FFFFFF;font-size:16px;font-weight:800;border-radius:12px;text-decoration:none;font-family:'Plus Jakarta Sans','Manrope',sans-serif;mso-line-height-rule:exactly;line-height:20px;">
            <span style="color:#FFFFFF;">Activer mon compte</span>
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:18px 0 0;font-size:12px;color:#7A7A7A;line-height:1.6;">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br />
      <a href="${escapeAttr(setupUrl)}" style="color:#C0112E;word-break:break-all;text-decoration:underline;">${escapeHtml(setupUrl)}</a>
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;background:#F8FAFC;border:1px solid #E5E9F0;border-radius:14px;padding:14px 18px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7A8499;">Documents contractuels (PDF en pièces jointes)</p>
          <p style="margin:0;font-size:13px;color:#1F2937;line-height:1.55;">
            Vous trouverez en pièces jointes les documents contractuels acceptés au moment de
            votre souscription : <strong>CGU</strong>, <strong>CGS</strong> et
            <strong>Conditions Particulières</strong>. Ils sont également consultables sur
            <a href="https://www.major-ecn.fr/cgu" style="color:#C0112E;text-decoration:underline;">major-ecn.fr/cgu</a>,
            <a href="https://www.major-ecn.fr/cgs" style="color:#C0112E;text-decoration:underline;">/cgs</a>
            et <a href="https://www.major-ecn.fr/conditions-particulieres" style="color:#C0112E;text-decoration:underline;">/conditions-particulieres</a>.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:13px;color:#5A5A5A;line-height:1.6;">
      Une question sur votre préparation ? Écrivez-nous à
      <a href="mailto:contact@major-ecn.fr" style="color:#C0112E;text-decoration:none;font-weight:600;">contact@major-ecn.fr</a>.
    </p>`;

  const html = layout({
    subject,
    eyebrow: 'Confirmation de paiement',
    title: 'Activez votre compte étudiant',
    bodyHtml,
  });

  const text = [
    `Bonjour ${firstName || ''},`,
    ``,
    `Votre paiement pour la ${formuleName} a bien été enregistré.`,
    `Montant total : ${amountEuros.toFixed(2)} €${installmentsText}.`,
    ``,
    `Accès complet à la Médecine Générale (Voie interne + Voie externe).`,
    ``,
    `Activez votre compte : ${setupUrl}`,
    ``,
    `Documents contractuels en pièces jointes : CGU, CGS, Conditions Particulières.`,
    `Également consultables sur major-ecn.fr/cgu, /cgs, /conditions-particulieres.`,
    ``,
    `L'équipe Major ECN`,
  ].join('\n');

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
  const intro =
    `Vous avez demandé à réinitialiser votre mot de passe Major ECN. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.<br /><br />` +
    `Le lien est valable <strong>1 heure</strong>. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email — votre mot de passe actuel reste inchangé.`;
  const bodyHtml = `
    <p style="margin:0 0 8px;font-size:13px;color:#9AA1AE;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
      Sécurité du compte
    </p>
    <h1 style="margin:0 0 16px;font-family:'Plus Jakarta Sans','Manrope',sans-serif;font-size:24px;line-height:1.25;color:#0F1F4D;font-weight:800;letter-spacing:-0.02em;">
      Réinitialisez votre mot de passe
    </h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#2D2D2D;">
      Bonjour <strong style="color:#2D2D2D;">${escapeHtml(firstName ?? '')}</strong>,<br />
      ${intro}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px auto 8px;">
      <tr>
        <td align="center" bgcolor="#8B0E22" style="background-color:#8B0E22;background:linear-gradient(90deg,#8B0E22 0%,#C0112E 100%);border-radius:12px;">
          <a href="${escapeAttr(resetUrl)}" target="_blank" rel="noopener"
             style="display:inline-block;padding:16px 32px;color:#FFFFFF;font-size:16px;font-weight:800;border-radius:12px;text-decoration:none;font-family:'Plus Jakarta Sans','Manrope',sans-serif;mso-line-height-rule:exactly;line-height:20px;">
            <span style="color:#FFFFFF;">Choisir un nouveau mot de passe</span>
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:18px 0 0;font-size:12px;color:#7A7A7A;line-height:1.6;">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br />
      <a href="${escapeAttr(resetUrl)}" style="color:#C0112E;word-break:break-all;text-decoration:underline;">${escapeHtml(resetUrl)}</a>
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#5A5A5A;line-height:1.6;">
      Besoin d'aide ? Écrivez-nous à
      <a href="mailto:contact@major-ecn.fr" style="color:#C0112E;text-decoration:none;font-weight:600;">contact@major-ecn.fr</a>.
    </p>`;
  const html = layout({
    subject,
    eyebrow: 'Sécurité du compte',
    title: 'Réinitialisez votre mot de passe',
    bodyHtml,
  });
  const text = [
    `Bonjour ${firstName ?? ''},`,
    ``,
    `Vous avez demandé à réinitialiser votre mot de passe Major ECN.`,
    `Choisissez votre nouveau mot de passe : ${resetUrl}`,
    ``,
    `Le lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — votre mot de passe actuel reste inchangé.`,
    ``,
    `— L'équipe Major ECN`,
  ].join('\n');
  return { subject, html, text };
}

/* ============================================================
   Récap interne — nouvelle inscription Espace Découverte (gratuit)
   Envoyé à contact@major-ecn.fr + abonan1@yahoo.fr à chaque création
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
  const row = (label: string, value: string | null | undefined) =>
    value
      ? `<tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">${escapeHtml(label)}</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-weight:600;">${escapeHtml(value)}</td></tr>`
      : '';
  const bodyHtml = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#4A5568;">
      Un nouvel étudiant vient de créer un compte <strong>Espace Découverte</strong> (gratuit).
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 18px;">
      ${row('Prénom', firstName)}
      ${row('Nom', lastName)}
      <tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Email</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-family:monospace;">${escapeHtml(email)}</td></tr>
      ${row('Téléphone', phone)}
      ${row('Spécialité', specialty)}
      ${row('Voie', voie)}
      ${row('Session', session)}
      ${row('Pays de résidence', country)}
      ${row('A passé les EVC', passedEvc)}
    </table>
    <p style="margin:0;font-size:13px;color:#7A7A7A;">
      Récapitulatif automatique — aucune action requise.
    </p>`;
  const html = layout({ subject, eyebrow: 'Inscription — Espace Découverte', title: 'Nouvelle inscription Découverte', bodyHtml });
  const text = [
    `Nouvelle inscription Espace Découverte (gratuit)`,
    `Nom : ${fullName}`,
    `Email : ${email}`,
    phone ? `Téléphone : ${phone}` : '',
    specialty ? `Spécialité : ${specialty}` : '',
    voie ? `Voie : ${voie}` : '',
    session ? `Session : ${session}` : '',
    country ? `Pays : ${country}` : '',
    passedEvc ? `A passé les EVC : ${passedEvc}` : '',
  ].filter(Boolean).join('\n');
  return { subject, html, text };
}

/* ============================================================
   Récap interne — nouvelle souscription payante (après paiement Stripe)
   Envoyé à contact@major-ecn.fr + abonan1@yahoo.fr une seule fois
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
  const row = (label: string, value: string | null | undefined) =>
    value
      ? `<tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">${escapeHtml(label)}</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-weight:600;">${escapeHtml(value)}</td></tr>`
      : '';
  const bodyHtml = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#4A5568;">
      Un étudiant vient de souscrire à une <strong>offre payante</strong>.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 18px;">
      <tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Formule</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-weight:700;">${escapeHtml(formuleName)}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Montant</td><td style="padding:6px 0;font-size:13px;color:#C0112E;font-weight:700;">${escapeHtml(paymentLabel)}</td></tr>
      ${row('Prénom', firstName)}
      ${row('Nom', lastName)}
      <tr><td style="padding:6px 0;font-size:13px;color:#7A7A7A;">Email</td><td style="padding:6px 0;font-size:13px;color:#2D2D2D;font-family:monospace;">${escapeHtml(email)}</td></tr>
      ${row('Téléphone', phone)}
      ${row('Spécialité', specialty)}
      ${row('Voie', voie)}
    </table>
    <p style="margin:0;font-size:13px;color:#7A7A7A;">
      Récapitulatif automatique — paiement confirmé côté Stripe.
    </p>`;
  const html = layout({ subject, eyebrow: 'Souscription payante', title: 'Nouvelle souscription payante', bodyHtml });
  const text = [
    `Nouvelle souscription payante`,
    `Formule : ${formuleName}`,
    `Montant : ${paymentLabel}`,
    fullName ? `Nom : ${fullName}` : '',
    `Email : ${email}`,
    phone ? `Téléphone : ${phone}` : '',
    specialty ? `Spécialité : ${specialty}` : '',
    voie ? `Voie : ${voie}` : '',
  ].filter(Boolean).join('\n');
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
  const bodyHtml = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#3D3D3D;">
      Bonjour <strong style="color:#2D2D2D;">${escapeHtml(hello)}</strong>,
    </p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4A5568;">
      On ne vous a pas encore vu sur la plateforme et on tenait à vous le dire simplement&nbsp;:
      votre espace Major ECN est prêt et il n'attend plus que vous.
    </p>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#4A5568;">
      Quelques minutes suffisent pour choisir votre mot de passe et commencer votre préparation aux EVC
      avec les fiches, les QCM et les dossiers progressifs. Chaque jour compte, et le meilleur moment
      pour s'y mettre, c'est maintenant.
    </p>
    ${buttonHtml(setupUrl, 'Activer mon espace')}
    <p style="margin:8px 0 0;font-size:13px;line-height:1.7;color:#5A5A5A;">
      Une question ou un souci pour vous connecter&nbsp;? Répondez simplement à cet email ou écrivez-nous à
      <a href="mailto:contact@major-ecn.fr" style="color:#6B1A2A;font-weight:600;text-decoration:none;">contact@major-ecn.fr</a>.
      Nous sommes là pour vous accompagner.
    </p>
    <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#2D2D2D;">
      À très vite,<br />
      <strong>L'équipe Major ECN</strong>
    </p>`;
  const html = layout({ subject, eyebrow: 'On pense à vous', title: 'Votre place vous attend', bodyHtml });
  const text = [
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
  ].join('\n');
  return { subject, html, text };
}

/* ============================================================
   Welcome (existant) — voir welcomeEmail() au-dessus
   ============================================================ */
