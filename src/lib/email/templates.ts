/**
 * Templates HTML — charte Major ECN (palette bordeaux + tricolore arc-en-ciel,
 * Plus Jakarta Sans / Manrope). Compatibles tous clients : tables inline,
 * couleurs en hex, pas d'images externes obligatoires.
 */

type WelcomeArgs = {
  firstName: string;
  setupUrl: string;
  /** 'student' = essai 7 jours, 'professor' = compte intervenant. */
  role: 'student' | 'professor';
};

export function welcomeEmail({ firstName, setupUrl, role }: WelcomeArgs): { subject: string; html: string; text: string } {
  const isProf = role === 'professor';
  const eyebrow = isProf ? 'Bienvenue dans l’équipe pédagogique' : 'Bienvenue chez Major ECN';
  const title = isProf ? 'Activez votre espace professeur' : 'Activez votre compte étudiant';
  const intro = isProf
    ? `Votre compte intervenant Major ECN est créé. Cliquez sur le bouton ci-dessous pour choisir votre mot de passe et accéder à l’espace « Questions / Réponses » où vous serez notifié des questions de vos élèves.`
    : `Votre inscription à Major ECN est enregistrée. Cliquez sur le bouton ci-dessous pour choisir votre mot de passe — vous accéderez immédiatement à la plateforme avec 7 jours d’essai gratuit, sans engagement.`;
  const subject = isProf
    ? '🩺 Activez votre espace professeur — Major ECN'
    : '🎓 Bienvenue chez Major ECN — activez votre compte';

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
              <td style="background:#0E1626;padding:24px 28px;text-align:center;">
                <span style="font-family:'Plus Jakarta Sans','Manrope',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#FFFFFF;">
                  Major <span style="color:#C84A5A;">ECN</span>
                </span>
              </td>
            </tr>
            <!-- Tricolour rule (arc-en-ciel) -->
            <tr><td style="height:3px;background:linear-gradient(90deg,#6B1A2A 0%,#3B82F6 50%,#14B8A6 100%);font-size:0;line-height:0;">&nbsp;</td></tr>

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

                <!-- Button -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;">
                  <tr>
                    <td style="background:linear-gradient(90deg,#6B1A2A 0%,#8B2A3A 100%);border-radius:12px;">
                      <a href="${escapeAttr(setupUrl)}"
                         style="display:inline-block;padding:14px 26px;font-family:'Plus Jakarta Sans','Manrope',sans-serif;font-weight:800;font-size:15px;color:#FFFFFF;text-decoration:none;">
                        Choisir mon mot de passe →
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:#7A7A7A;">
                  Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
                </p>
                <p style="margin:0 0 26px;word-break:break-all;font-family:'IBM Plex Mono',Menlo,Consolas,monospace;font-size:11px;line-height:1.5;color:#6B1A2A;">
                  ${escapeHtml(setupUrl)}
                </p>

                ${isProf ? '' : `
                <div style="background:#F9F0F2;border:1px solid #F2D5DA;border-radius:14px;padding:14px 16px;margin:0 0 22px;">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#6B1A2A;">✓ Votre essai 7 jours est actif</p>
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#5A5A5A;">
                    Accès complet à 4 200+ QCM, flashcards, annales et IA pédagogique. Sans engagement,
                    annulation instantanée.
                  </p>
                </div>`}

                <p style="margin:0;font-size:12px;line-height:1.6;color:#7A7A7A;">
                  Lien valable 24 h. Une question ? Écrivez-nous à
                  <a href="mailto:inscriptionmajorecn@gmail.com" style="color:#6B1A2A;font-weight:600;text-decoration:none;">inscriptionmajorecn@gmail.com</a>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:18px 28px;background:#FAFAF8;border-top:1px solid #ECEEF1;">
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
    'Lien valable 24 h. Pour toute question : inscriptionmajorecn@gmail.com',
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
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;">
    <tr>
      <td style="background:linear-gradient(90deg,#6B1A2A 0%,#8B2A3A 100%);border-radius:12px;">
        <a href="${escapeAttr(href)}" style="display:inline-block;padding:14px 26px;font-family:'Plus Jakarta Sans','Manrope',sans-serif;font-weight:800;font-size:15px;color:#FFFFFF;text-decoration:none;">
          ${escapeHtml(label)} →
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
   Welcome (existant) — voir welcomeEmail() au-dessus
   ============================================================ */
