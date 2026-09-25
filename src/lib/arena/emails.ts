import 'server-only';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { arenaDb } from './db';
import { signedLinkToken } from './session';
import { isQaSandboxSlug } from './qa-sandbox';
import { describeBareme, type Bareme } from './scoring';
import { formatNote, noteMax, noteSur10 } from './note';
import { parisAndLocalLabel } from './time';
import { COMMERCIAL_AFTER_M3, publicRules, UNDER_THRESHOLD_MESSAGE, WARNING_CONNECTION, WARNING_NATURE } from './texts';
import { DISTINCTION_LABEL, isPodiumRank, ordinalRank, type Distinction } from './performance';
import { DEFAULT_SECONDS_PER_QUESTION, type EmailKind, type ParticipantRow, type TournamentRow } from './types';
import { esc as escAttr } from '@/lib/email/layout';
import { aButton, aFacts, aHello, aLabel, aLine, aList, aP, aPanel, aPHtml, aRule, aStats, ARENA_MAIL, arenaShell, arenaTextFooter, type ArenaPlusLoin } from './email-layout';
import { passerelleUrl, studentTrainingUrl, type PasserelleAudience } from './passerelle';
import { collegeIdForSpecialty } from '@/lib/data/enrollable-colleges';

/**
 * EVC Arena — emails (§11). Texte + HTML, envoi journalisé dans
 * `arena_emails` avec clé de dédoublonnage pour les envois automatiques :
 * un cron relancé n'envoie jamais deux fois le même email.
 *
 * Présentation (bandeau, grands chiffres, panneaux, pied de page) :
 * `./email-layout.ts`. Ce fichier ne porte que le contenu des messages.
 */

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

function unsubscribeUrl(p: ParticipantRow | null): string | null {
  return p ? `${siteUrl()}/arena/desinscription?t=${signedLinkToken('unsub', p.id)}` : null;
}

/**
 * Bloc « Pour aller plus loin » (passerelle §11-§20) : un élève Major ECN
 * n'a jamais de CTA d'achat — il est renvoyé vers sa préparation ; un
 * prospect vers la page de la spécialité (ou l'URL / le libellé fixés par
 * l'administration). Statut inconnu : libellé neutre vers le site.
 * `passerelle_enabled = false` masque le bloc.
 */
export function plusLoinBlock(t: TournamentRow, audience: PasserelleAudience | null | undefined, title: string): ArenaPlusLoin | null {
  if (t.passerelle_enabled === false) return null;
  const site = siteUrl();
  const abs = (u: string) => (/^https?:\/\//.test(u) ? u : `${site}${u.startsWith('/') ? '' : '/'}${u}`);
  if (audience === 'student') {
    return { title, lead: 'Retrouvez votre préparation Major ECN et mettez toutes les chances de votre côté pour les EVC.', label: 'Continuer sur ma plateforme', href: abs(studentTrainingUrl(collegeIdForSpecialty(t.specialty))) };
  }
  const lead = 'Poursuivez votre préparation avec Major ECN et mettez toutes les chances de votre côté pour les EVC.';
  if (audience === 'prospect') {
    return { title, lead, label: (t.passerelle_cta ?? '').trim() || 'Poursuivre ma préparation', href: abs(passerelleUrl(t)) };
  }
  return { title, lead, label: 'Poursuivre ma préparation', href: site };
}

type ShellOptions = {
  plusLoin?: ArenaPlusLoin | null;
  eyebrow?: string;
  preheader?: string;
  /** Lien « Mon espace » du pied de page (confirmation / connexion). */
  accessUrl?: string;
  /** La mention §9 figure déjà dans le corps : pas de doublon en pied de page. */
  noLegal?: boolean;
  reason?: string;
};

function shell(t: TournamentRow, p: ParticipantRow | null, subject: string, title: string, bodyHtml: string, o: ShellOptions = {}): string {
  const urls = arenaUrls(t);
  return arenaShell({
    subject,
    preheader: o.preheader,
    eyebrow: o.eyebrow,
    title,
    bodyHtml,
    tournament: { title: t.title, edition_label: t.edition_label, specialty: t.specialty },
    links: { landing: urls.landing, space: urls.space, rules: urls.rules },
    accessUrl: o.accessUrl ?? null,
    unsubscribeUrl: unsubscribeUrl(p),
    reason: o.reason ?? null,
    legalNotice: o.noLegal ? null : WARNING_NATURE,
    siteUrl: siteUrl(),
    plusLoin: o.plusLoin ?? null,
  });
}

function textWithFooter(t: TournamentRow, p: ParticipantRow | null, body: string, o: { noLegal?: boolean; space?: string } = {}): string {
  return `${body}\n${arenaTextFooter({ space: o.space ?? arenaUrls(t).space, unsubscribeUrl: unsubscribeUrl(p), legalNotice: o.noLegal ? null : WARNING_NATURE })}`;
}

/** Lien de secours sous un bouton d'accès. */
function fallback(url: string): string {
  return aPHtml(`Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><a href="${escAttr(url)}" style="color:${ARENA_MAIL.gold};text-decoration:underline;word-break:break-all;font-size:12px;">${escAttr(url)}</a>`, { size: 13, color: ARENA_MAIL.muted, margin: '-6px 0 20px' });
}

const strong = (s: string) => `<strong style="color:${ARENA_MAIL.text};">${escAttr(s)}</strong>`;
const gold = (s: string) => `<strong style="color:${ARENA_MAIL.gold};">${escAttr(s)}</strong>`;

export type Mail = { subject: string; html: string; text: string };

/* ------------------------------------------------------------------ */
/* Modèles                                                             */
/* ------------------------------------------------------------------ */

export function confirmationEmail(t: TournamentRow, p: ParticipantRow, confirmUrl: string): Mail {
  const subject = `Confirmez votre adresse email — EVC Arena ${t.specialty}`;
  const html = shell(t, null, subject, 'Confirmez votre adresse email', [
    aHello(p.first_name),
    aPHtml(`Votre inscription au tournoi EVC Arena (${escAttr(t.specialty)}) est enregistrée sous le pseudonyme « ${gold(p.pseudo)} ». Pour accéder aux manches, confirmez votre adresse email en cliquant sur le bouton ci-dessous.`),
    aButton('Confirmer mon adresse email', confirmUrl),
    fallback(confirmUrl),
    aPanel(aLine('Ce lien est personnel et valable sept jours. Si vous n’êtes pas à l’origine de cette inscription, ignorez simplement cet email.'), { accent: 'none' }),
  ].join(''), { eyebrow: 'Inscription · Dernière étape', preheader: `Une dernière étape pour entrer dans l’arène : confirmez votre adresse (pseudonyme « ${p.pseudo} »).`, accessUrl: confirmUrl, reason: 'Vous recevez cet email suite à votre inscription au tournoi EVC Arena de Major ECN.' });
  const text = textWithFooter(t, null, `Bonjour ${p.first_name},\n\nConfirmez votre adresse email pour accéder aux manches du tournoi EVC Arena (${t.specialty}) :\n${confirmUrl}\n\nCe lien est valable sept jours. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.`, { space: confirmUrl });
  return { subject, html, text };
}

export function loginEmail(t: TournamentRow, p: ParticipantRow, loginUrl: string): Mail {
  const subject = `Votre lien de connexion — EVC Arena`;
  const html = shell(t, p, subject, 'Votre lien de connexion', [
    aHello(p.first_name),
    aP('Cliquez sur le bouton ci-dessous pour ouvrir votre espace EVC Arena. Le lien est valable deux heures et s’ouvre d’un clic sur « Ouvrir mon espace ».'),
    aButton('Ouvrir mon espace', loginUrl),
    fallback(loginUrl),
  ].join(''), { eyebrow: 'Connexion sécurisée', preheader: 'Votre lien personnel pour ouvrir votre espace EVC Arena (valable deux heures).', accessUrl: loginUrl });
  return { subject, html, text: textWithFooter(t, p, `Bonjour ${p.first_name},\n\nVotre lien de connexion (valable deux heures) :\n${loginUrl}`, { space: loginUrl }) };
}

/** Manche à annoncer à un nouvel inscrit : `open` = jouable maintenant. */
export type WelcomeRound = { number: number; open: boolean; opens_at: Date | null; closes_at: Date | null; theme: string };

/**
 * Prochaine manche réellement jouable pour une inscription faite maintenant :
 * la manche ouverte s'il y en a une, sinon la prochaine à venir (puis une
 * manche pas encore programmée). `null` quand toutes les manches sont closes.
 * On n'annonce jamais une manche passée (inscription pendant M2/M3, §2.4).
 */
export function nextPlayableRound<R extends { number: number; opens_at: string | Date | null; closes_at: string | Date | null; theme?: string | null }>(
  rounds: readonly R[],
  now: Date = new Date(),
): { round: R; info: WelcomeRound } | null {
  const date = (v: string | Date | null) => (v ? new Date(v) : null);
  const valid = (d: Date | null) => (d && Number.isFinite(d.getTime()) ? d : null);
  const sorted = [...rounds].sort((x, y) => x.number - y.number);
  const withDates = sorted.map((r) => ({ r, o: valid(date(r.opens_at)), c: valid(date(r.closes_at)) }));
  const pick = (x: (typeof withDates)[number] | undefined, open: boolean) =>
    x ? { round: x.r, info: { number: x.r.number, open, opens_at: x.o, closes_at: x.c, theme: x.r.theme ?? '' } } : null;
  const open = withDates.find((x) => x.o && x.c && x.o <= now && now < x.c);
  if (open) return pick(open, true);
  const upcoming = withDates.filter((x) => x.o && x.o > now).sort((x, y) => x.o!.getTime() - y.o!.getTime())[0];
  if (upcoming) return pick(upcoming, false);
  return pick(withDates.find((x) => !x.o || !x.c), false);
}

/**
 * Email « inscription validée ». `round` désigne la manche à annoncer (cf.
 * `nextPlayableRound`) ; `null` = plus aucune manche à jouer. Sans `round`
 * (appel historique), `m1Open`/`m1Theme` décrivent la manche 1.
 */
export function validatedEmail(t: TournamentRow, p: ParticipantRow, opts: { m1Open: Date | null; m1Theme: string; bareme: Bareme; qrpNs: number[]; round?: WelcomeRound | null; audience?: PasserelleAudience | null }): Mail {
  const urls = arenaUrls(t);
  const round: WelcomeRound | null = opts.round === undefined
    ? { number: 1, open: false, opens_at: opts.m1Open, closes_at: null, theme: opts.m1Theme }
    : opts.round;
  const theme = round ? (round.theme || '') : '';
  const when = round?.opens_at ? parisAndLocalLabel(round.opens_at, p.timezone, true) : 'date annoncée prochainement';
  const closeLabel = round?.closes_at ? parisAndLocalLabel(round.closes_at, p.timezone, true) : null;
  const baremeHtml = (['QRM', 'QRU', 'QRP'] as const)
    .map((k) => {
      const d = describeBareme(k, opts.bareme, opts.qrpNs);
      return aPanel(
        aLine(`${escAttr(k)} — ${escAttr(d.title)}`, { strong: true, margin: '0 0 8px', size: 15 })
        + d.lines.map((l) => aLine(`${escAttr(l.situation)} : <strong style="color:${ARENA_MAIL.text};">${escAttr(l.points)}</strong>`, { margin: '0 0 4px' })).join(''),
        { accent: 'none' },
      );
    })
    .join('');
  const subject = !round
    ? `Inscription confirmée — EVC Arena ${t.specialty}`
    : round.open
      ? `Inscription confirmée — la manche ${round.number} est ouverte`
      : `Inscription confirmée — manche ${round.number} le ${round.opens_at ? parisAndLocalLabel(round.opens_at, null).split(' à ')[0] : 'bientôt'}`;
  const annonce = !round
    ? 'Toutes les manches du tournoi sont closes : vos résultats et le classement restent consultables depuis votre espace.'
    : round.open
      ? `La manche ${round.number} est ouverte${closeLabel ? `, fermeture le ${closeLabel}` : ''}.`
      : `Manche ${round.number} : ${when}.`;
  const facts = !round
    ? ''
    : aFacts(round.open
      ? [
          [`Manche ${round.number}`, strong('Ouverte maintenant')],
          closeLabel ? ['Fermeture', strong(closeLabel)] : null,
          theme ? ['Thème', escAttr(theme)] : null,
        ]
      : [
          [`Manche ${round.number}`, strong(when)],
          theme ? ['Thème', escAttr(theme)] : null,
        ]);
  const cta = round?.open ? aButton(`Jouer la manche ${round.number}`, urls.round(round.number)) : aButton('Ouvrir mon espace', urls.space);
  const html = shell(t, p, subject, 'Votre inscription est confirmée', [
    aHello(p.first_name),
    aPHtml(`Vous participez au tournoi EVC Arena ${escAttr(t.specialty)} sous le pseudonyme « ${gold(p.pseudo)} ».`),
    round ? facts : aPanel(aLine(escAttr(annonce)), { accent: 'none' }),
    round?.open ? aPanel(aLine(escAttr(WARNING_CONNECTION)), { accent: 'red', title: 'Avant de commencer' }) : '',
    aLabel('Les règles'),
    aList(publicRules(t), { numbered: true }),
    aLabel(round ? `Le barème de la manche ${round.number}` : 'Le barème'),
    baremeHtml,
    aPanel(aLine(escAttr(WARNING_NATURE)), { accent: 'red', title: 'Nature du dispositif' }),
    cta,
    aP('Invitez un collègue : partagez votre lien personnel depuis votre espace.', { size: 14, color: ARENA_MAIL.muted }),
  ].join(''), { eyebrow: 'Bienvenue dans l’arène', preheader: `${annonce} Règles et barème à l’intérieur.`, noLegal: true, plusLoin: plusLoinBlock(t, opts.audience, 'Faites de chaque manche un véritable progrès') });
  const annonceText = round && !round.open ? `Manche ${round.number} : ${when}${theme ? ` — thème : ${theme}` : ''}.` : `${annonce}${round && theme ? ` Thème : ${theme}.` : ''}`;
  const text = textWithFooter(t, p, `Bonjour ${p.first_name},\n\nVotre inscription au tournoi EVC Arena ${t.specialty} est confirmée (pseudonyme : ${p.pseudo}).\n${annonceText}${round?.open ? `\nJouer : ${urls.round(round.number)}\n${WARNING_CONNECTION}` : ''}\n\nRègles :\n${publicRules(t).map((r: string) => `- ${r}`).join('\n')}\n\n${WARNING_NATURE}\n\nMon espace : ${urls.space}`, { noLegal: true });
  return { subject, html, text };
}

export function roundReminderEmail(t: TournamentRow, p: ParticipantRow, kind: 'j7' | 'j1', round: { number: number; theme: string; opens_at: Date; closes_at: Date }): Mail {
  const urls = arenaUrls(t);
  const open = parisAndLocalLabel(round.opens_at, p.timezone, true);
  const close = parisAndLocalLabel(round.closes_at, p.timezone, true);
  const subject = kind === 'j7'
    ? `Manche ${round.number} dans 7 jours — ${round.theme || t.specialty}`
    : `Demain : manche ${round.number} — ${round.theme || t.specialty}`;
  const title = kind === 'j7' ? `Manche ${round.number} : rendez-vous dans une semaine` : `Manche ${round.number} : c’est demain`;
  const html = shell(t, p, subject, title, [
    aHello(p.first_name),
    aFacts([
      ['Ouverture', strong(open)],
      ['Clôture', escAttr(close)],
      round.theme ? ['Thème', escAttr(round.theme)] : null,
    ]),
    aP('Questions chronométrées une par une, une seule tentative. Retrouvez le nombre de questions et les durées sur l’écran de la manche.'),
    aPanel(aLine(escAttr(WARNING_CONNECTION)), { accent: 'red', title: 'Avant de commencer' }),
    aButton('Voir mon espace', urls.space),
  ].join(''), { eyebrow: `Manche ${round.number} · ${kind === 'j7' ? 'J-7' : 'J-1'}`, preheader: `Ouverture : ${open}.` });
  const text = textWithFooter(t, p, `Bonjour ${p.first_name},\n\nManche ${round.number}${round.theme ? ` — ${round.theme}` : ''}\nOuverture : ${open}\nClôture : ${close}. Questions chronométrées une par une, une seule tentative. Le nombre de questions et les durées sont indiqués sur l’écran de la manche.\n\n${WARNING_CONNECTION}\n\nMon espace : ${urls.space}`);
  return { subject, html, text };
}

export function roundOpeningEmail(t: TournamentRow, p: ParticipantRow, round: { number: number; theme: string; closes_at: Date }, remaining: string): Mail {
  const urls = arenaUrls(t);
  const subject = `La manche ${round.number} est ouverte — ${remaining} restantes`;
  const html = shell(t, p, subject, `La manche ${round.number} est ouverte`, [
    aHello(p.first_name),
    aStats([{ label: 'Temps restant avant la clôture', value: remaining, accent: 'gold' }]),
    aP(`Vous pouvez jouer la manche ${round.number}${round.theme ? ` (${round.theme})` : ''} dès maintenant. Il vous reste ${remaining} avant la clôture.`),
    aPanel(aLine(escAttr(WARNING_CONNECTION)), { accent: 'red', title: 'Avant de commencer' }),
    aButton('Commencer la manche', urls.round(round.number)),
  ].join(''), { eyebrow: `Manche ${round.number}${round.theme ? ` · ${round.theme}` : ''}`, preheader: `Il vous reste ${remaining} pour jouer la manche ${round.number}.` });
  return { subject, html, text: textWithFooter(t, p, `Bonjour ${p.first_name},\n\nLa manche ${round.number} est ouverte. Il vous reste ${remaining} avant la clôture.\n${WARNING_CONNECTION}\n\nJouer : ${urls.round(round.number)}`) };
}

export function relanceEmail(t: TournamentRow, p: ParticipantRow, round: { number: number; theme: string }, remaining: string): Mail {
  const urls = arenaUrls(t);
  const subject = `Manche ${round.number} : il reste ${remaining}`;
  const html = shell(t, p, subject, `Il reste ${remaining} pour jouer la manche ${round.number}`, [
    aHello(p.first_name),
    aP(`Vous n’avez pas encore joué la manche ${round.number}. La manche se termine dans ${remaining}. La participation aux trois manches est nécessaire pour figurer au classement général.`),
    aPanel(aLine(escAttr(`Chaque question est chronométrée séparément (${t.seconds_per_question ?? DEFAULT_SECONDS_PER_QUESTION} s par défaut ; une durée spécifique peut être indiquée). Si vous commencez trop près de la clôture, votre temps sera limité au temps restant.`)), { accent: 'red', title: 'Chronométrage' }),
    aButton('Jouer maintenant', urls.round(round.number)),
  ].join(''), { eyebrow: `Manche ${round.number} · Dernier rappel`, preheader: `La manche ${round.number} se termine dans ${remaining}.` });
  return { subject, html, text: textWithFooter(t, p, `Bonjour ${p.first_name},\n\nVous n'avez pas encore joué la manche ${round.number}. Elle se termine dans ${remaining}.\n\nJouer : ${urls.round(round.number)}`) };
}

/**
 * Résultats de manche (§11). La correction détaillée n'est JAMAIS jointe ni
 * liée sous forme de fichier : l'email annonce sa disponibilité dans l'espace
 * EVC Arena (visionneuse intégrée, filigrane nominatif) et renvoie vers
 * l'espace personnel ; la connexion passe par le lien de connexion habituel.
 */
export function resultsEmail(
  t: TournamentRow,
  p: ParticipantRow,
  r: { number: number; theme: string; score: number | null; max: number; cumulScore: number; cumulMax: number; cumulRounds: number; rank: number | null; distinction?: Distinction | null; isLast: boolean; next: { number: number; opens_at: Date | null; theme: string } | null; audience?: PasserelleAudience | null },
): Mail {
  const urls = arenaUrls(t);
  // Notes affichées sur 10 par manche (cf. lib/arena/note.ts).
  const valManche = formatNote(noteSur10(r.score ?? 0, r.max));
  const valCumul = formatNote(noteSur10(r.cumulScore, r.cumulMax, r.cumulRounds));
  const maxCumul = formatNote(noteMax(r.cumulRounds));
  const noteManche = `${valManche} / ${formatNote(noteMax())}`;
  const noteCumul = `${valCumul} / ${maxCumul}`;
  const subject = `Résultats de la manche ${r.number} — votre correction détaillée est disponible`;
  const played = r.score !== null;
  // Cahier des charges complémentaire §5-§9 : être classé ≠ trophée. Le trophée
  // (Or / Argent / Bronze) exige le podium ET le seuil de distinction.
  const distinctionLine = r.rank !== null
    ? r.distinction
      ? `Distinction ${DISTINCTION_LABEL[r.distinction]} EVC Arena : ${ordinalRank(r.rank)} du classement cumulé au niveau de distinction. Elle est conservée dans votre palmarès.`
      : isPodiumRank(r.rank)
        ? `Vous occupez la ${ordinalRank(r.rank)} place du classement cumulé. Le trophée EVC Arena reste à conquérir : il exige un score d’au moins ${t.distinction_pct} %.`
        : null
    : null;
  const lines: string[] = [aHello(p.first_name)];
  if (played) {
    lines.push(aStats([
      { label: `Note · manche ${r.number}`, value: valManche, unit: `/ ${formatNote(noteMax())}`, accent: 'gold' },
      { label: 'Note · cumul', value: valCumul, unit: `/ ${maxCumul}`, accent: 'text' },
      ...(r.rank !== null ? [{ label: 'Rang · cumul', value: String(r.rank), accent: 'red' as const }] : []),
    ]));
    if (r.rank === null) lines.push(aPanel(aLine(escAttr(UNDER_THRESHOLD_MESSAGE)), { accent: 'none', title: 'Classement' }));
    else if (distinctionLine) lines.push(aPanel(aLine(escAttr(distinctionLine), { size: 15, color: ARENA_MAIL.text }), { accent: 'gold', title: r.distinction ? `Distinction ${DISTINCTION_LABEL[r.distinction]}` : 'Podium', icon: { file: 'arena-trophee.png', alt: r.distinction ? `Trophée ${DISTINCTION_LABEL[r.distinction]}` : 'Podium' } }));
  } else {
    lines.push(aPanel(aLine(escAttr(`Vous n’avez pas joué la manche ${r.number}. Le classement général nécessite les trois manches. Vos résultats, vos rangs de manche et vos corrections détaillées restent disponibles pour les manches disputées.`)), { accent: 'none', title: `Manche ${r.number}` }));
  }
  lines.push(aLabel('Correction détaillée'));
  lines.push(aP(`Votre correction détaillée de la manche ${r.number} est maintenant disponible dans votre espace EVC Arena : réponses attendues, explications, pièges de l’énoncé et erreurs les plus fréquentes, en regard de vos réponses.`));
  lines.push(aPHtml(`Elle reste consultable à tout moment depuis votre espace : ${strong(`Mon espace → Manche ${r.number} → Résultats → Correction détaillée`)}.`, { size: 14 }));
  lines.push(aButton('Ouvrir mon espace EVC Arena', urls.space));
  if (r.next) {
    lines.push(aFacts([
      ['Prochaine manche', `${strong(`M${r.next.number}`)}${r.next.opens_at ? ` — ${escAttr(parisAndLocalLabel(r.next.opens_at, p.timezone, true))}` : ''}`],
      r.next.theme ? ['Thème', escAttr(r.next.theme)] : null,
    ]));
  }
  if (r.isLast) {
    lines.push(aRule(), aPHtml(`${escAttr(COMMERCIAL_AFTER_M3)} <a href="${escAttr(siteUrl())}" style="color:${ARENA_MAIL.red};font-weight:700;text-decoration:none;">major-ecn.fr&nbsp;→</a>`, { size: 14, color: ARENA_MAIL.muted }));
  }
  const html = shell(t, p, subject, `Résultats de la manche ${r.number}`, lines.join(''), {
    eyebrow: `Manche ${r.number}${r.theme ? ` · ${r.theme}` : ''}`,
    preheader: played ? `Note de la manche ${r.number} : ${noteManche}. Votre correction détaillée vous attend.` : `Votre correction détaillée de la manche ${r.number} est disponible.`,
    plusLoin: plusLoinBlock(t, r.audience, 'Faites de vos résultats un véritable progrès'),
  });
  const text = textWithFooter(t, p, [
    `Bonjour ${p.first_name},`,
    played ? `Note de la manche ${r.number} : ${noteManche}\nNote cumulée : ${noteCumul}${r.rank !== null ? ` — rang ${r.rank}` : ''}` : `Vous n'avez pas joué la manche ${r.number}.`,
    r.rank === null && played ? UNDER_THRESHOLD_MESSAGE : '',
    played && distinctionLine ? distinctionLine : '',
    `Votre correction détaillée de la manche ${r.number} est maintenant disponible dans votre espace EVC Arena (Mon espace → Manche ${r.number} → Résultats → Correction détaillée).\nOuvrir mon espace : ${urls.space}`,
    r.next ? `Prochaine manche : M${r.next.number}${r.next.opens_at ? ` — ${parisAndLocalLabel(r.next.opens_at, p.timezone, true)}` : ''}` : '',
    r.isLast ? `${COMMERCIAL_AFTER_M3} ${siteUrl()}` : '',
  ].filter(Boolean).join('\n\n'));
  return { subject, html, text };
}

export function inviteEmail(t: TournamentRow, from: ParticipantRow | null, landingUrl: string, message: string | null): Mail {
  const who = from ? `${from.first_name} vous invite` : 'Un confrère vous invite';
  const subject = `${who} au tournoi EVC Arena ${t.specialty}`;
  const html = shell(t, null, subject, `${who} à entrer dans l’arène`, [
    aP(`Le tournoi EVC Arena ${t.specialty} de Major ECN : trois manches de QCM chronométrés, une seule tentative, un classement cumulé entre médecins candidats aux EVC. Le format de chaque manche est indiqué sur la page du tournoi.`),
    message ? aPanel(aLine(`<em>« ${escAttr(message)} »</em>`, { size: 15, color: ARENA_MAIL.text }), { accent: 'gold', title: from ? `Message de ${from.first_name}` : 'Message' }) : '',
    aButton('Découvrir le tournoi', landingUrl),
    aPanel(aLine(escAttr(WARNING_NATURE), { size: 13 }), { accent: 'none', title: 'Nature du dispositif' }),
  ].join(''), {
    eyebrow: `Invitation · ${t.specialty}`,
    preheader: 'Trois manches de QCM chronométrés, un classement cumulé entre médecins candidats aux EVC.',
    noLegal: true,
    reason: 'Vous recevez cet email car un participant du tournoi EVC Arena de Major ECN a souhaité vous le faire découvrir.',
  });
  return { subject, html, text: textWithFooter(t, null, `${who} au tournoi EVC Arena ${t.specialty} (Major ECN).\n${message ? `\n« ${message} »\n` : ''}\n${landingUrl}\n\n${WARNING_NATURE}`, { noLegal: true, space: landingUrl }) };
}

export function reportAckEmail(t: TournamentRow, p: ParticipantRow, roundNumber: number, questionIndex: number): Mail {
  const subject = `Signalement reçu — manche ${roundNumber}, question ${questionIndex}`;
  const html = shell(t, p, subject, 'Votre signalement a bien été reçu', [
    aHello(p.first_name),
    aFacts([['Manche', strong(String(roundNumber))], ['Question', strong(String(questionIndex))]]),
    aP(`Nous avons bien reçu votre signalement concernant la question ${questionIndex} de la manche ${roundNumber}. Il sera examiné par l’équipe pédagogique de Major ECN. Si la question est neutralisée, tous les participants de la manche en seront informés et les scores seront recalculés.`),
  ].join(''), { eyebrow: 'Signalement', preheader: `Votre signalement (manche ${roundNumber}, question ${questionIndex}) sera examiné par l’équipe pédagogique.` });
  return { subject, html, text: textWithFooter(t, p, `Bonjour ${p.first_name},\n\nNous avons bien reçu votre signalement (manche ${roundNumber}, question ${questionIndex}). Il sera examiné par l'équipe pédagogique.`) };
}

export function reportUpdateEmail(t: TournamentRow, p: ParticipantRow, roundNumber: number, questionIndex: number, status: 'validated' | 'rejected', response: string): Mail {
  const subject = `Suite à votre signalement — manche ${roundNumber}, question ${questionIndex}`;
  const html = shell(t, p, subject, status === 'validated' ? 'Votre signalement a été retenu' : 'Réponse à votre signalement', [
    aHello(p.first_name),
    aP(status === 'validated' ? `La question ${questionIndex} de la manche ${roundNumber} a été neutralisée : elle est retirée du barème et les scores de la manche ont été recalculés.` : `Après examen, la question ${questionIndex} de la manche ${roundNumber} est maintenue.`),
    response ? aPanel(aLine(escAttr(response), { color: ARENA_MAIL.text }), { accent: 'gold', title: 'Réponse de l’équipe pédagogique' }) : '',
  ].join(''), { eyebrow: `Signalement · ${status === 'validated' ? 'Retenu' : 'Examiné'}`, preheader: status === 'validated' ? `Question ${questionIndex} neutralisée, scores recalculés.` : `La question ${questionIndex} de la manche ${roundNumber} est maintenue.` });
  return { subject, html, text: textWithFooter(t, p, `Bonjour ${p.first_name},\n\n${status === 'validated' ? `La question ${questionIndex} de la manche ${roundNumber} a été neutralisée et les scores recalculés.` : `La question ${questionIndex} de la manche ${roundNumber} est maintenue.`}${response ? `\n\n${response}` : ''}`) };
}

export function neutralizedEmail(t: TournamentRow, p: ParticipantRow, roundNumber: number, questionIndex: number, reason: string): Mail {
  const urls = arenaUrls(t);
  const subject = `Manche ${roundNumber} : une question a été neutralisée`;
  const html = shell(t, p, subject, `Une question de la manche ${roundNumber} a été neutralisée`, [
    aHello(p.first_name),
    aP(`La question ${questionIndex} de la manche ${roundNumber} a été retirée du barème${reason ? ` (${reason})` : ''}. Les scores de la manche et le classement cumulé ont été recalculés pour tous les participants.`),
    aButton('Voir mon espace', urls.space),
  ].join(''), { eyebrow: `Manche ${roundNumber} · Mise à jour`, preheader: 'Les scores et le classement cumulé ont été recalculés.' });
  return { subject, html, text: textWithFooter(t, p, `Bonjour ${p.first_name},\n\nLa question ${questionIndex} de la manche ${roundNumber} a été retirée du barème${reason ? ` (${reason})` : ''}. Les scores ont été recalculés.\n\n${urls.space}`) };
}

export function deletedEmail(t: TournamentRow, firstName: string): Mail {
  const subject = 'Votre compte EVC Arena a été supprimé';
  const html = shell(t, null, subject, 'Compte supprimé', [aHello(firstName), aP('Votre compte EVC Arena et vos données personnelles ont été supprimés conformément à votre demande. Vos réponses éventuelles ont été anonymisées.')].join(''), {
    eyebrow: 'Données personnelles',
    preheader: 'Votre compte EVC Arena et vos données personnelles ont été supprimés.',
    noLegal: true,
    reason: 'Vous recevez cet email suite à votre demande de suppression de compte EVC Arena.',
  });
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

export type SendArenaResult = { ok: true; id: string } | { ok: false; skipped?: boolean; uncertain?: boolean; error: string };

export async function sendArenaEmail(input: SendArenaInput): Promise<SendArenaResult> {
  // Envoi à blanc en local : la base est celle de la production, on ne consomme
  // aucune clé de dédoublonnage d'un vrai tournoi. Seul le bac à sable de
  // recette (`qa-sim-*`) est journalisé, avec une copie locale du contenu.
  const dryRun = process.env.EMAIL_DRY_RUN === '1' && process.env.NODE_ENV !== 'production';
  if (dryRun && !isQaSandboxSlug(input.tournament.slug)) {
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
  let res;
  try {
    // Resend limite le débit (2 requêtes/s par défaut) : un balayage qui envoie
    // des centaines d'ouvertures prend des 429. On patiente et on réessaie.
    for (let attempt = 0; ; attempt++) {
      res = await sendEmail({ to: input.to, subject: input.mail.subject, html: input.mail.html, text: input.mail.text, timeoutMs: 15_000 });
      if (res.ok || attempt >= 3 || transientStatus(res.error) !== 429) break;
      await new Promise((resolve) => setTimeout(resolve, 1_100 * (attempt + 1)));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur réseau';
    await db.from('arena_emails').update({ error: 'Envoi non confirmé : ' + message }).eq('id', logRow.id);
    console.error('[arena:email] delivery_unconfirmed', { emailId: logRow.id, kind: input.kind });
    return { ok: false, uncertain: true, error: 'Le service d’email n’a pas confirmé l’envoi.' };
  }
  // Échec passager (débit, panne du fournisseur) : la clé de dédoublonnage est
  // libérée pour que le prochain balayage réessaie ; la ligne reste au journal.
  // Un refus définitif (adresse invalide…) garde sa clé : pas de relance infinie.
  const retryLater = !res.ok && transientStatus(res.error) !== null;
  await db.from('arena_emails').update(res.ok ? { resend_id: res.id } : { error: res.error, ...(retryLater ? { dedupe_key: null } : {}) }).eq('id', logRow.id);
  if (dryRun) await dumpSandboxMail(logRow.id, input);
  return res.ok ? { ok: true, id: res.id } : { ok: false, error: res.error };
}

/** Copie locale d'un email à blanc du bac à sable (`tmp/_arena-sim/mails`), pour contrôler liens et variables. */
async function dumpSandboxMail(id: string, input: SendArenaInput): Promise<void> {
  try {
    const { mkdir, writeFile } = await import('node:fs/promises');
    const path = await import('node:path');
    const dir = path.join(process.cwd(), 'tmp', '_arena-sim', 'mails');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${id}.json`), JSON.stringify({
      id, kind: input.kind, to: input.to, tournament: input.tournament.slug, participantId: input.participant?.id ?? null,
      roundId: input.roundId ?? null, dedupeKey: input.dedupeKey ?? null, subject: input.mail.subject, html: input.mail.html, text: input.mail.text,
      at: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('[arena:email] dump', error);
  }
}

/** Statut HTTP d'un échec Resend passager (429 ou 5xx), sinon null. */
export function transientStatus(error: string | undefined): number | null {
  const m = /^Resend (\d{3})/.exec(error ?? '');
  if (!m) return null;
  const status = Number(m[1]);
  return status === 429 || status >= 500 ? status : null;
}
