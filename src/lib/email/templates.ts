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
