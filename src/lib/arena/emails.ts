import 'server-only';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { arenaDb } from './db';
import { signedLinkToken } from './session';
import { describeBareme, type Bareme } from './scoring';
import { parisAndLocalLabel } from './time';
import { COMMERCIAL_AFTER_M3, publicRules, UNDER_THRESHOLD_MESSAGE, WARNING_CONNECTION, WARNING_NATURE } from './texts';
import { DEFAULT_SECONDS_PER_QUESTION, type EmailKind, type ParticipantRow, type TournamentRow } from './types';

/**
 * EVC Arena — emails (§11). Modèles sobres, texte + HTML, envoi journalisé
 * dans `arena_emails` avec clé de dédoublonnage pour les envois automatiques :
 * un cron relancé n'envoie jamais deux fois le même email.
 */

const RED = '#E4002B';
const NAVY = '#14254E';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function para(s: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1F2937">${esc(s)}</p>`;
}

function button(label: string, url: string): string {
  return `<p style="margin:22px 0"><a href="${esc(url)}" style="display:inline-block;background:${RED};color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:10px;font-size:15px">${esc(label)}</a></p>`;
}

function box(html: string): string {
  return `<div style="border-left:4px solid ${RED};background:#FBF7F7;padding:12px 16px;margin:16px 0;border-radius:6px">${html}</div>`;
}

export function arenaUrls(t: TournamentRow) {
  const base = `${siteUrl()}/arena/${t.slug}`;
  return {
    landing: base,
    space: `${base}/espace`,
    rules: `${base}/regles`,
    leaderboard: `${base}/classement`,
    round: (n: number) => `${base}/manche/${n}`,
    corrections: (n: number) => `${base}/manche/${n}/corrections`,
    invite: (code: string) => `${base}?i=${encodeURIComponent(code)}`,
  };
}

function shell(t: TournamentRow, p: ParticipantRow | null, title: string, bodyHtml: string): string {
  const unsub = p ? `${siteUrl()}/arena/desinscription?t=${signedLinkToken('unsub', p.id)}` : null;
  const urls = arenaUrls(t);
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#F3F4F6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:24px 0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:14px;overflow:hidden">
<tr><td style="background:#0B0F14;padding:24px 28px;border-bottom:4px solid #E4002B">
  <span style="font-family:Impact,'Arial Narrow',Oswald,sans-serif;font-size:26px;font-weight:700;color:#fff;letter-spacing:0.02em;text-transform:uppercase">EVC</span>
  <span style="font-family:Impact,'Arial Narrow',Oswald,sans-serif;font-size:26px;font-weight:700;color:#E4002B;letter-spacing:0.08em;margin-left:8px;text-transform:uppercase">ARENA</span>
  <span style="font-size:10px;font-weight:700;color:#B8BEC8;letter-spacing:0.3em;margin-left:12px;text-transform:uppercase">Major ECN</span>
  <span style="display:block;font-size:12px;color:#B8BEC8;margin-top:6px">${esc(t.title)}${t.edition_label ? ` · ${esc(t.edition_label)}` : ''}</span>
</td></tr>
<tr><td style="padding:28px">
  <h1 style="margin:0 0 18px;font-size:22px;line-height:1.25;color:${NAVY}">${esc(title)}</h1>
  ${bodyHtml}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #E5E7EB;font-size:12px;line-height:1.6;color:#6B7280">
  Vous recevez cet email parce que vous êtes inscrit(e) au tournoi EVC Arena de Major ECN.
  <a href="${esc(urls.space)}" style="color:#6B7280">Mon espace</a> ·
  <a href="${esc(urls.rules)}" style="color:#6B7280">Règles</a>
  ${unsub ? ` · <a href="${esc(unsub)}" style="color:#6B7280">Ne plus recevoir les informations Major ECN</a>` : ''}
  <br>Major ECN — préparation aux EVC depuis 2011.
</td></tr>
</table></td></tr></table></body></html>`;
}

export type Mail = { subject: string; html: string; text: string };

/* ------------------------------------------------------------------ */
/* Modèles                                                             */
/* ------------------------------------------------------------------ */

export function confirmationEmail(t: TournamentRow, p: ParticipantRow, confirmUrl: string): Mail {
  const subject = `Confirmez votre adresse email — EVC Arena ${t.specialty}`;
  const html = shell(t, null, 'Confirmez votre adresse email', [
    para(`Bonjour ${p.first_name},`),
    para(`Votre inscription au tournoi EVC Arena (${t.specialty}) est enregistrée sous le pseudonyme « ${p.pseudo} ». Pour accéder aux manches, confirmez votre adresse email en cliquant sur le bouton ci-dessous.`),
    button('Confirmer mon adresse email', confirmUrl),
    para('Ce lien est personnel. Si vous n’êtes pas à l’origine de cette inscription, ignorez simplement cet email.'),
  ].join(''));
  const text = `Bonjour ${p.first_name},\n\nConfirmez votre adresse email pour accéder aux manches du tournoi EVC Arena (${t.specialty}) :\n${confirmUrl}\n\nSi vous n'êtes pas à l'origine de cette inscription, ignorez cet email.`;
  return { subject, html, text };
}

export function loginEmail(t: TournamentRow, p: ParticipantRow, loginUrl: string): Mail {
  const subject = `Votre lien de connexion — EVC Arena`;
  const html = shell(t, p, 'Votre lien de connexion', [
    para(`Bonjour ${p.first_name},`),
    para('Cliquez sur le bouton ci-dessous pour ouvrir votre espace EVC Arena. Le lien est valable deux heures et s’ouvre d’un clic sur « Ouvrir mon espace ».'),
    button('Ouvrir mon espace', loginUrl),
  ].join(''));
  return { subject, html, text: `Bonjour ${p.first_name},\n\nVotre lien de connexion (valable deux heures) :\n${loginUrl}` };
}

export function validatedEmail(t: TournamentRow, p: ParticipantRow, opts: { m1Open: Date | null; m1Theme: string; bareme: Bareme; qrpNs: number[] }): Mail {
  const urls = arenaUrls(t);
  const when = opts.m1Open ? parisAndLocalLabel(opts.m1Open, p.timezone, true) : 'date annoncée prochainement';
  const baremeHtml = (['QRM', 'QRU', 'QRP'] as const)
    .map((k) => {
      const d = describeBareme(k, opts.bareme, opts.qrpNs);
      return `<p style="margin:10px 0 4px;font-weight:700;color:${NAVY}">${k} — ${esc(d.title)}</p><ul style="margin:0;padding-left:18px;color:#374151;font-size:14px">${d.lines.map((l) => `<li>${esc(l.situation)} : <strong>${esc(l.points)}</strong></li>`).join('')}</ul>`;
    })
    .join('');
  const subject = `Inscription confirmée — manche 1 le ${opts.m1Open ? parisAndLocalLabel(opts.m1Open, null).split(' à ')[0] : 'bientôt'}`;
  const html = shell(t, p, 'Votre inscription est confirmée', [
    para(`Bonjour ${p.first_name},`),
    para(`Vous participez au tournoi EVC Arena ${t.specialty} sous le pseudonyme « ${p.pseudo} ».`),
    box(`<p style="margin:0;font-weight:700;color:${NAVY}">Manche 1 : ${esc(when)}</p>${opts.m1Theme ? `<p style="margin:6px 0 0;color:#374151">Thème : ${esc(opts.m1Theme)}</p>` : ''}`),
    `<p style="margin:18px 0 6px;font-weight:700;color:${NAVY}">Les règles</p><ul style="margin:0;padding-left:18px;color:#374151;font-size:14px">${publicRules(t).map((r: string) => `<li>${esc(r)}</li>`).join('')}</ul>`,
    `<p style="margin:18px 0 6px;font-weight:700;color:${NAVY}">Le barème de la manche 1</p>${baremeHtml}`,
    box(`<p style="margin:0;color:#374151;font-size:14px">${esc(WARNING_NATURE)}</p>`),
    button('Ouvrir mon espace', urls.space),
    para('Invitez un collègue : partagez votre lien personnel depuis votre espace.'),
  ].join(''));
  const text = `Bonjour ${p.first_name},\n\nVotre inscription au tournoi EVC Arena ${t.specialty} est confirmée (pseudonyme : ${p.pseudo}).\nManche 1 : ${when}${opts.m1Theme ? ` — thème : ${opts.m1Theme}` : ''}.\n\nRègles :\n${publicRules(t).map((r: string) => `- ${r}`).join('\n')}\n\n${WARNING_NATURE}\n\nMon espace : ${urls.space}`;
  return { subject, html, text };
}

export function roundReminderEmail(t: TournamentRow, p: ParticipantRow, kind: 'j7' | 'j1', round: { number: number; theme: string; opens_at: Date; closes_at: Date }): Mail {
  const urls = arenaUrls(t);
  const open = parisAndLocalLabel(round.opens_at, p.timezone, true);
  const close = parisAndLocalLabel(round.closes_at, p.timezone, true);
  const subject = kind === 'j7'
    ? `Manche ${round.number} dans 7 jours — ${round.theme || t.specialty}`
    : `Demain : manche ${round.number} — ${round.theme || t.specialty}`;
  const html = shell(t, p, kind === 'j7' ? `Manche ${round.number} : rendez-vous dans une semaine` : `Manche ${round.number} : c’est demain`, [
    para(`Bonjour ${p.first_name},`),
    box(`<p style="margin:0;font-weight:700;color:${NAVY}">Ouverture : ${esc(open)}</p><p style="margin:6px 0 0;color:#374151">Clôture : ${esc(close)}. Questions chronométrées une par une, une seule tentative. Retrouvez le nombre de questions et les durées sur l’écran de la manche.</p>${round.theme ? `<p style="margin:6px 0 0;color:#374151">Thème : ${esc(round.theme)}</p>` : ''}`),
    para(WARNING_CONNECTION),
    button('Voir mon espace', urls.space),
  ].join(''));
  const text = `Bonjour ${p.first_name},\n\nManche ${round.number}${round.theme ? ` — ${round.theme}` : ''}\nOuverture : ${open}\nClôture : ${close}. Questions chronométrées une par une, une seule tentative. Le nombre de questions et les durées sont indiqués sur l’écran de la manche.\n\n${WARNING_CONNECTION}\n\nMon espace : ${urls.space}`;
  return { subject, html, text };
}

export function roundOpeningEmail(t: TournamentRow, p: ParticipantRow, round: { number: number; theme: string; closes_at: Date }, remaining: string): Mail {
  const urls = arenaUrls(t);
  const subject = `La manche ${round.number} est ouverte — ${remaining} restantes`;
  const html = shell(t, p, `La manche ${round.number} est ouverte`, [
    para(`Bonjour ${p.first_name},`),
    para(`Vous pouvez jouer la manche ${round.number}${round.theme ? ` (${round.theme})` : ''} dès maintenant. Il vous reste ${remaining} avant la clôture.`),
    box(`<p style="margin:0;color:#374151;font-size:14px">${esc(WARNING_CONNECTION)}</p>`),
    button('Commencer la manche', urls.round(round.number)),
  ].join(''));
  return { subject, html, text: `Bonjour ${p.first_name},\n\nLa manche ${round.number} est ouverte. Il vous reste ${remaining} avant la clôture.\n${WARNING_CONNECTION}\n\nJouer : ${urls.round(round.number)}` };
}

export function relanceEmail(t: TournamentRow, p: ParticipantRow, round: { number: number; theme: string }, remaining: string): Mail {
  const urls = arenaUrls(t);
  const subject = `Manche ${round.number} : il reste ${remaining}`;
  const html = shell(t, p, `Il reste ${remaining} pour jouer la manche ${round.number}`, [
    para(`Bonjour ${p.first_name},`),
    para(`Vous n’avez pas encore joué la manche ${round.number}. La manche se termine dans ${remaining}. La participation aux trois manches est nécessaire pour figurer au classement général.`),
    para(`Chaque question est chronométrée séparément (${t.seconds_per_question ?? DEFAULT_SECONDS_PER_QUESTION} s par défaut ; une durée spécifique peut être indiquée). Si vous commencez trop près de la clôture, votre temps sera limité au temps restant.`),
    button('Jouer maintenant', urls.round(round.number)),
  ].join(''));
  return { subject, html, text: `Bonjour ${p.first_name},\n\nVous n'avez pas encore joué la manche ${round.number}. Elle se termine dans ${remaining}.\n\nJouer : ${urls.round(round.number)}` };
}

export function resultsEmail(
  t: TournamentRow,
  p: ParticipantRow,
  r: { number: number; theme: string; score: number | null; max: number; cumulScore: number; cumulMax: number; rank: number | null; isLast: boolean; next: { number: number; opens_at: Date | null; theme: string } | null; pdfUrl: string | null },
): Mail {
  const urls = arenaUrls(t);
  const fr = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  const subject = `Résultats de la manche ${r.number} — corrections disponibles`;
  const played = r.score !== null;
  const lines: string[] = [para(`Bonjour ${p.first_name},`)];
  if (played) {
    lines.push(box(`<p style="margin:0;font-weight:700;color:${NAVY}">Score de la manche ${r.number} : ${fr(r.score as number)} / ${fr(r.max)}</p><p style="margin:6px 0 0;color:#374151">Score cumulé : ${fr(r.cumulScore)} / ${fr(r.cumulMax)}${r.rank !== null ? ` — rang ${r.rank}` : ''}</p>`));
    if (r.rank === null) lines.push(para(UNDER_THRESHOLD_MESSAGE));
  } else {
    lines.push(para(`Vous n’avez pas joué la manche ${r.number}. Le classement général nécessite les trois manches. Vos résultats, vos rangs de manche et vos corrections restent disponibles pour les manches disputées.`));
  }
  lines.push(para('Les corrections détaillées de la manche sont disponibles : réponses attendues, explications, pièges de l’énoncé et erreurs les plus fréquentes.'));
  lines.push(button('Consulter les corrections', urls.corrections(r.number)));
  if (r.pdfUrl) lines.push(para(`Version PDF : ${r.pdfUrl}`));
  if (r.next) {
    lines.push(box(`<p style="margin:0;font-weight:700;color:${NAVY}">Prochaine manche : M${r.next.number}${r.next.opens_at ? ` — ${esc(parisAndLocalLabel(r.next.opens_at, p.timezone, true))}` : ''}</p>${r.next.theme ? `<p style="margin:6px 0 0;color:#374151">Thème : ${esc(r.next.theme)}</p>` : ''}`));
  }
  if (r.isLast) lines.push(para(COMMERCIAL_AFTER_M3), `<p style="margin:0"><a href="${esc(siteUrl())}" style="color:${RED}">major-ecn.fr</a></p>`);
  const html = shell(t, p, `Résultats de la manche ${r.number}`, lines.join(''));
  const text = [
    `Bonjour ${p.first_name},`,
    played ? `Score de la manche ${r.number} : ${fr(r.score as number)} / ${fr(r.max)}\nScore cumulé : ${fr(r.cumulScore)} / ${fr(r.cumulMax)}${r.rank !== null ? ` — rang ${r.rank}` : ''}` : `Vous n'avez pas joué la manche ${r.number}.`,
    r.rank === null && played ? UNDER_THRESHOLD_MESSAGE : '',
    `Corrections : ${urls.corrections(r.number)}`,
    r.pdfUrl ? `PDF : ${r.pdfUrl}` : '',
    r.next ? `Prochaine manche : M${r.next.number}${r.next.opens_at ? ` — ${parisAndLocalLabel(r.next.opens_at, p.timezone, true)}` : ''}` : '',
    r.isLast ? `${COMMERCIAL_AFTER_M3} ${siteUrl()}` : '',
  ].filter(Boolean).join('\n\n');
  return { subject, html, text };
}

export function inviteEmail(t: TournamentRow, from: ParticipantRow | null, landingUrl: string, message: string | null): Mail {
  const who = from ? `${from.first_name} vous invite` : 'Un confrère vous invite';
  const subject = `${who} au tournoi EVC Arena ${t.specialty}`;
  const html = shell(t, null, `${who} à entrer dans l’arène`, [
    para(`Le tournoi EVC Arena ${t.specialty} de Major ECN : trois manches de QCM chronométrés, une seule tentative, un classement cumulé entre médecins candidats aux EVC. Le format de chaque manche est indiqué sur la page du tournoi.`),
    message ? box(`<p style="margin:0;color:#374151;font-style:italic">${esc(message)}</p>`) : '',
    button('Découvrir le tournoi', landingUrl),
    para(WARNING_NATURE),
  ].join(''));
  return { subject, html, text: `${who} au tournoi EVC Arena ${t.specialty} (Major ECN).\n${message ? `\n« ${message} »\n` : ''}\n${landingUrl}\n\n${WARNING_NATURE}` };
}

export function reportAckEmail(t: TournamentRow, p: ParticipantRow, roundNumber: number, questionIndex: number): Mail {
  const subject = `Signalement reçu — manche ${roundNumber}, question ${questionIndex}`;
  const html = shell(t, p, 'Votre signalement a bien été reçu', [
    para(`Bonjour ${p.first_name},`),
    para(`Nous avons bien reçu votre signalement concernant la question ${questionIndex} de la manche ${roundNumber}. Il sera examiné par l’équipe pédagogique de Major ECN. Si la question est neutralisée, tous les participants de la manche en seront informés et les scores seront recalculés.`),
  ].join(''));
  return { subject, html, text: `Bonjour ${p.first_name},\n\nNous avons bien reçu votre signalement (manche ${roundNumber}, question ${questionIndex}). Il sera examiné par l'équipe pédagogique.` };
}

export function reportUpdateEmail(t: TournamentRow, p: ParticipantRow, roundNumber: number, questionIndex: number, status: 'validated' | 'rejected', response: string): Mail {
  const subject = `Suite à votre signalement — manche ${roundNumber}, question ${questionIndex}`;
  const html = shell(t, p, status === 'validated' ? 'Votre signalement a été retenu' : 'Réponse à votre signalement', [
    para(`Bonjour ${p.first_name},`),
    para(status === 'validated' ? `La question ${questionIndex} de la manche ${roundNumber} a été neutralisée : elle est retirée du barème et les scores de la manche ont été recalculés.` : `Après examen, la question ${questionIndex} de la manche ${roundNumber} est maintenue.`),
    response ? box(`<p style="margin:0;color:#374151">${esc(response)}</p>`) : '',
  ].join(''));
  return { subject, html, text: `Bonjour ${p.first_name},\n\n${status === 'validated' ? `La question ${questionIndex} de la manche ${roundNumber} a été neutralisée et les scores recalculés.` : `La question ${questionIndex} de la manche ${roundNumber} est maintenue.`}${response ? `\n\n${response}` : ''}` };
}

export function neutralizedEmail(t: TournamentRow, p: ParticipantRow, roundNumber: number, questionIndex: number, reason: string): Mail {
  const urls = arenaUrls(t);
  const subject = `Manche ${roundNumber} : une question a été neutralisée`;
  const html = shell(t, p, `Une question de la manche ${roundNumber} a été neutralisée`, [
    para(`Bonjour ${p.first_name},`),
    para(`La question ${questionIndex} de la manche ${roundNumber} a été retirée du barème${reason ? ` (${reason})` : ''}. Les scores de la manche et le classement cumulé ont été recalculés pour tous les participants.`),
    button('Voir mon espace', urls.space),
  ].join(''));
  return { subject, html, text: `Bonjour ${p.first_name},\n\nLa question ${questionIndex} de la manche ${roundNumber} a été retirée du barème${reason ? ` (${reason})` : ''}. Les scores ont été recalculés.\n\n${urls.space}` };
}

export function deletedEmail(t: TournamentRow, firstName: string): Mail {
  const subject = 'Votre compte EVC Arena a été supprimé';
  const html = shell(t, null, 'Compte supprimé', [para(`Bonjour ${firstName},`), para('Votre compte EVC Arena et vos données personnelles ont été supprimés conformément à votre demande. Vos réponses éventuelles ont été anonymisées.')].join(''));
  return { subject, html, text: `Bonjour ${firstName},\n\nVotre compte EVC Arena et vos données personnelles ont été supprimés.` };
}

/* ------------------------------------------------------------------ */
/* Envoi journalisé                                                    */
/* ------------------------------------------------------------------ */

export type SendArenaInput = {
  tournament: TournamentRow;
  participant: ParticipantRow | null;
  to: string;
  kind: EmailKind;
  mail: Mail;
  roundId?: string | null;
  /** Clé unique : si un envoi existe déjà avec cette clé, on n'envoie pas. */
  dedupeKey?: string | null;
  triggeredBy?: string | null;
};

export type SendArenaResult = { ok: true; id: string } | { ok: false; skipped?: boolean; error: string };

export async function sendArenaEmail(input: SendArenaInput): Promise<SendArenaResult> {
  if (process.env.EMAIL_DRY_RUN === '1' && process.env.NODE_ENV !== 'production') {
    return { ok: false, error: 'Les emails sont en mode simulation. Activez le service d’envoi pour utiliser cette action.' };
  }
  const db = arenaDb();
  if (input.participant && (input.participant.blocked_at || input.participant.anonymized_at)) {
    return { ok: false, skipped: true, error: 'Participant bloqué ou anonymisé.' };
  }
  const { data: logRow, error: logErr } = await db
    .from('arena_emails')
    .insert({
      tournament_id: input.tournament.id,
      participant_id: input.participant?.id ?? null,
      round_id: input.roundId ?? null,
      kind: input.kind,
      dedupe_key: input.dedupeKey ?? null,
      subject: input.mail.subject,
      to_email: input.to,
      triggered_by: input.triggeredBy ?? null,
    })
    .select('id')
    .single();
  if (logErr) {
    if (String(logErr.code) === '23505') return { ok: false, skipped: true, error: 'Déjà envoyé.' };
    return { ok: false, error: logErr.message };
  }
  const res = await sendEmail({ to: input.to, subject: input.mail.subject, html: input.mail.html, text: input.mail.text });
  await db.from('arena_emails').update(res.ok ? { resend_id: res.id } : { error: res.error }).eq('id', logRow.id);
  return res.ok ? { ok: true, id: res.id } : { ok: false, error: res.error };
}
