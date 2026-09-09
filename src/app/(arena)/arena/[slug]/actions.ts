'use server';

import { revalidatePath } from 'next/cache';
import { estAvatarPlanche } from '@/components/arena/avatars';
import { z } from 'zod';
import { siteUrl } from '@/lib/email/send';
import { currentStaff, registrationOpen, visibleSnapshot, visibleTournament } from '@/lib/arena/access';
import {
  arenaDb, arenaLog, currentParticipant, effectiveBareme, findParticipantByEmail, getAttempt, getAttemptById, getPreviewAttempt,
  getQuestion, getRound, getTournament, listAnswers, listQuestions, questionSeconds, roundTotalSeconds,
} from '@/lib/arena/db';
import { confirmationEmail, deletedEmail, inviteEmail, loginEmail, reportAckEmail, sendArenaEmail } from '@/lib/arena/emails';
import { finalizeAttempt, gradeOne } from '@/lib/arena/grading';
import type { Bareme } from '@/lib/arena/scoring';
import { anonymizeParticipant } from '@/lib/arena/sequence';
import { clearSessionCookie, newToken } from '@/lib/arena/session';
import { attemptDeadline, questionDeadline, roundState, toDate } from '@/lib/arena/time';
import { CONSENT_VERSION, pseudoForbidden } from '@/lib/arena/texts';
import { isValidPseudo, normalizeEmail, pseudoKey, randomAvatarSeed, type AttemptRow, type QuestionRow, type TournamentRow } from '@/lib/arena/types';

/**
 * EVC Arena — actions serveur du parcours participant (§3, §8, §10).
 * Chaque action revérifie la session et l'état du tournoi côté serveur ;
 * rien ne fait confiance au client (chronomètre, ordre des questions, type de
 * question).
 */

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };

const ANSWER_GRACE_MS = 5_000;

function err(error: string): Err {
  return { ok: false, error };
}

function inviteCode(): string {
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz';
  let s = '';
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

/* ------------------------------------------------------------------ */
/* Inscription et connexion                                            */
/* ------------------------------------------------------------------ */

const RegisterSchema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(80),
  lastName: z.string().trim().min(1, 'Nom requis').max(80),
  email: z.string().trim().email('Adresse email invalide').max(160),
  specialty: z.string().trim().min(1, 'Spécialité requise').max(120),
  pseudo: z.string().trim().min(3, 'Pseudonyme : 3 caractères minimum').max(24, 'Pseudonyme : 24 caractères maximum'),
  avatarSeed: z.string().trim().min(1).max(32),
  consentTournament: z.literal(true, { message: 'Le consentement au traitement des données est obligatoire.' }),
  consentMarketing: z.boolean().default(false),
  timezone: z.string().trim().max(64).nullable().optional(),
  source: z.string().trim().max(64).nullable().optional(),
  utm: z.record(z.string(), z.string().max(200)).nullable().optional(),
  inviteCode: z.string().trim().max(32).nullable().optional(),
});

export type RegisterInput = z.input<typeof RegisterSchema>;

export async function registerParticipant(slug: string, raw: RegisterInput): Promise<Ok<{ participantId: string; alreadyConfirmed: boolean }> | Err> {
  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Formulaire invalide.');
  const input = parsed.data;
  const v = await visibleSnapshot(slug);
  if (!v) return err('Tournoi introuvable.');
  if (!registrationOpen(v.snap) && !v.staff) return err('Les inscriptions sont closes.');
  const t = v.snap.tournament;

  if (!isValidPseudo(input.pseudo)) return err('Pseudonyme invalide : lettres, chiffres, espaces, tirets et points uniquement.');
  if (pseudoForbidden(input.pseudo)) return err('Ce pseudonyme n’est pas autorisé.');

  const email = normalizeEmail(input.email);
  const db = arenaDb();
  const existing = await findParticipantByEmail(t.id, email);
  if (existing) {
    if (existing.email_confirmed_at) return { ok: true, participantId: existing.id, alreadyConfirmed: true };
    // Inscription non confirmée : on renvoie simplement un nouveau lien.
    const r = await resendConfirmation(slug, email);
    if (!r.ok) return r;
    return { ok: true, participantId: existing.id, alreadyConfirmed: false };
  }

  const key = pseudoKey(input.pseudo);
  const { data: clash } = await db.from('arena_participants').select('id').eq('tournament_id', t.id).eq('pseudo_key', key).maybeSingle();
  if (clash) return err('Ce pseudonyme est déjà pris dans ce tournoi.');

  let invitedBy: string | null = null;
  if (input.inviteCode) {
    const { data: inviter } = await db.from('arena_participants').select('id').eq('tournament_id', t.id).eq('invite_code', input.inviteCode).maybeSingle();
    invitedBy = inviter?.id ?? null;
  }

  const { token, hash } = newToken();
  const { data: created, error } = await db
    .from('arena_participants')
    .insert({
      tournament_id: t.id,
      first_name: input.firstName,
      last_name: input.lastName,
      email,
      specialty: input.specialty,
      pseudo: input.pseudo,
      pseudo_key: key,
      avatar_seed: input.avatarSeed || randomAvatarSeed(),
      timezone: input.timezone ?? null,
      confirmation_token_hash: hash,
      confirmation_sent_at: new Date().toISOString(),
      consent_tournament_at: new Date().toISOString(),
      consent_tournament_version: CONSENT_VERSION,
      consent_marketing: input.consentMarketing,
      consent_marketing_at: input.consentMarketing ? new Date().toISOString() : null,
      consent_marketing_version: input.consentMarketing ? CONSENT_VERSION : null,
      acquisition_source: invitedBy ? 'invitation' : input.source ?? null,
      utm: input.utm ?? null,
      invited_by: invitedBy,
      invite_code: inviteCode(),
    })
    .select('*')
    .single();
  if (error || !created) {
    if (String(error?.code) === '23505') return err('Ce pseudonyme ou cette adresse est déjà utilisé.');
    return err(error?.message ?? 'Inscription impossible.');
  }

  const url = `${siteUrl()}/arena/confirmer?t=${encodeURIComponent(token)}`;
  const sent = await sendArenaEmail({ tournament: t, participant: created, to: email, kind: 'confirmation', mail: confirmationEmail(t, created, url) });
  if (!sent.ok && !sent.skipped) {
    console.error('[arena] email de confirmation', sent.error);
  }
  return { ok: true, participantId: created.id, alreadyConfirmed: false };
}

export async function resendConfirmation(slug: string, rawEmail: string): Promise<Ok | Err> {
  const v = await visibleTournament(slug);
  if (!v) return err('Tournoi introuvable.');
  const email = normalizeEmail(rawEmail);
  const p = await findParticipantByEmail(v.tournament.id, email);
  // Réponse identique que le compte existe ou non : aucune énumération d'adresses.
  if (!p || p.email_confirmed_at || p.anonymized_at) return { ok: true };
  const last = p.confirmation_sent_at ? new Date(p.confirmation_sent_at).getTime() : 0;
  if (Date.now() - last < 60_000) return err('Un email vient d’être envoyé. Patientez une minute avant de redemander.');
  const { token, hash } = newToken();
  await arenaDb().from('arena_participants').update({ confirmation_token_hash: hash, confirmation_sent_at: new Date().toISOString() }).eq('id', p.id);
  const url = `${siteUrl()}/arena/confirmer?t=${encodeURIComponent(token)}`;
  await sendArenaEmail({ tournament: v.tournament, participant: p, to: email, kind: 'confirmation', mail: confirmationEmail(v.tournament, p, url) });
  return { ok: true };
}

export async function requestLoginLink(slug: string, rawEmail: string): Promise<Ok | Err> {
  const v = await visibleTournament(slug);
  if (!v) return err('Tournoi introuvable.');
  const email = normalizeEmail(rawEmail);
  const p = await findParticipantByEmail(v.tournament.id, email);
  if (!p || p.anonymized_at || p.blocked_at) return { ok: true };
  if (!p.email_confirmed_at) return resendConfirmation(slug, email);
  const { token, hash } = newToken();
  await arenaDb().from('arena_participants').update({ login_token_hash: hash, login_token_expires_at: new Date(Date.now() + 3_600_000).toISOString() }).eq('id', p.id);
  const url = `${siteUrl()}/arena/connecter?t=${encodeURIComponent(token)}`;
  await sendArenaEmail({ tournament: v.tournament, participant: p, to: email, kind: 'login', mail: loginEmail(v.tournament, p, url) });
  return { ok: true };
}

export async function logoutArena(): Promise<void> {
  await clearSessionCookie();
}

/* ------------------------------------------------------------------ */
/* Manche : démarrage, réponses, expiration                             */
/* ------------------------------------------------------------------ */

type Actor = { kind: 'participant'; id: string } | { kind: 'preview'; userId: string };

async function resolveActor(tournamentId: string, preview: boolean): Promise<Actor | null> {
  if (preview) {
    const staff = await currentStaff();
    return staff ? { kind: 'preview', userId: staff.id } : null;
  }
  const p = await currentParticipant(tournamentId);
  return p ? { kind: 'participant', id: p.id } : null;
}

export type StartResult = Ok<{ attemptId: string }> | Err;

export async function startAttempt(slug: string, roundNumber: number, preview = false): Promise<StartResult> {
  const v = await visibleSnapshot(slug);
  if (!v) return err('Tournoi introuvable.');
  const t = v.snap.tournament;
  const round = v.snap.rounds.find((r) => r.number === roundNumber);
  if (!round) return err('Manche introuvable.');
  const actor = await resolveActor(t.id, preview);
  if (!actor) return err(preview ? 'Prévisualisation réservée au personnel.' : 'Session expirée : reconnectez-vous.');

  const now = new Date();
  const state = roundState(round, now);
  if (actor.kind === 'participant' && state !== 'open') return err(state === 'upcoming' ? 'La manche n’est pas encore ouverte.' : 'La manche est clôturée.');

  const questions = (v.snap.questionsByRound.get(round.id) ?? []).filter((q) => !q.neutralized_at);
  if (questions.length === 0) return err('Cette manche ne contient aucune question.');

  const existing = actor.kind === 'participant' ? await getAttempt(round.id, actor.id) : await getPreviewAttempt(round.id, actor.userId);
  if (existing) {
    if (existing.status !== 'in_progress') return err('Vous avez déjà joué cette manche : une seule tentative par manche.');
    return { ok: true, attemptId: existing.id };
  }

  const closes = actor.kind === 'participant' ? toDate(round.closes_at) : null;
  // Temps alloué = somme des durées propres à chaque question (§3.4).
  const { deadline, truncated } = attemptDeadline(now, roundTotalSeconds(t, questions), closes);
  const { data, error } = await arenaDb()
    .from('arena_attempts')
    .insert({
      round_id: round.id,
      participant_id: actor.kind === 'participant' ? actor.id : null,
      is_preview: actor.kind === 'preview',
      preview_user_id: actor.kind === 'preview' ? actor.userId : null,
      started_at: now.toISOString(),
      deadline_at: deadline.toISOString(),
      truncated,
      question_order: questions.map((q) => q.id),
    })
    .select('id')
    .single();
  if (error || !data) {
    // Course entre deux clics : la tentative existe déjà.
    const again = actor.kind === 'participant' ? await getAttempt(round.id, actor.id) : await getPreviewAttempt(round.id, actor.userId);
    if (again) return { ok: true, attemptId: again.id };
    return err(error?.message ?? 'Impossible de démarrer la manche.');
  }
  revalidatePath(`/arena/${slug}/manche/${roundNumber}`);
  return { ok: true, attemptId: data.id };
}

async function ownedAttempt(attemptId: string): Promise<{ attempt: AttemptRow; slug: string } | Err> {
  const attempt = await getAttemptById(attemptId);
  if (!attempt) return err('Tentative introuvable.');
  const round = await getRound(attempt.round_id);
  if (!round) return err('Manche introuvable.');
  const { data: t } = await arenaDb().from('arena_tournaments').select('id, slug').eq('id', round.tournament_id).maybeSingle();
  if (!t) return err('Tournoi introuvable.');
  const actor = await resolveActor(t.id, attempt.is_preview);
  if (!actor) return err('Session expirée : reconnectez-vous.');
  const owns = actor.kind === 'participant' ? attempt.participant_id === actor.id : attempt.preview_user_id === actor.userId;
  if (!owns) return err('Cette tentative ne vous appartient pas.');
  return { attempt, slug: t.slug };
}

export type AnswerResult = Ok<{ finished: boolean; answeredCount: number; expired?: boolean }> | Err;

/** Validation irréversible d'une question (§3.4) ; la dernière clôt la manche. */
export async function answerQuestion(attemptId: string, questionId: string, selectedRaw: string[]): Promise<AnswerResult> {
  const owned = await ownedAttempt(attemptId);
  if ('ok' in owned) return owned;
  const { attempt } = owned;
  if (attempt.status !== 'in_progress') return err('Cette manche est terminée.');
  const now = Date.now();
  if (now > new Date(attempt.deadline_at).getTime() + ANSWER_GRACE_MS) {
    await finalizeAttempt(attempt.id, 'expired');
    return err('Temps écoulé : la manche a été clôturée automatiquement.');
  }
  if (!attempt.question_order.includes(questionId)) return err('Question inconnue pour cette manche.');
  const q = await getQuestion(questionId);
  if (!q) return err('Question introuvable.');
  const round = await getRound(attempt.round_id);
  const t = round ? await getTournament(round.tournament_id) : null;
  if (!round || !t) return err('Manche introuvable.');
  const bareme = effectiveBareme(t, round);

  // Chaque question a sa propre échéance. Passée celle-ci, les cases cochées
  // ne sont plus recevables : la question est enregistrée SANS réponse, comme
  // si le participant n'avait rien validé. On ne rejette pas l'appel — sinon
  // la manche resterait bloquée sur une question dont le temps est écoulé.
  const echeance = await deadlineDeLaQuestion(attempt, t, q);
  if (now > echeance.getTime() + ANSWER_GRACE_MS) {
    return enregistrerSansReponse(attempt, q, bareme);
  }

  const valid = new Set(q.items.map((i) => i.lettre));
  const selected = [...new Set(selectedRaw.map((l) => String(l).trim().toUpperCase()))].filter((l) => valid.has(l));
  if (q.type === 'QRU' && selected.length > 1) return err('Une QRU n’admet qu’une seule proposition.');
  if (q.type === 'QRP') {
    const n = q.expected_count ?? q.items.filter((i) => i.is_correct).length;
    if (selected.length !== n) return err(`Cochez exactement ${n} proposition${n > 1 ? 's' : ''}.`);
  }

  const g = gradeOne(q, selected, bareme);
  const { error } = await arenaDb().from('arena_answers').insert({
    attempt_id: attempt.id,
    question_id: q.id,
    selected,
    score: g.score,
    max_score: g.max,
    discordances: g.discordances,
    is_perfect: g.is_perfect,
    rule_triggered: g.rule_triggered,
  });
  if (error && String(error.code) !== '23505') return err(error.message);

  const answers = await listAnswers(attempt.id);
  const finished = attempt.question_order.every((id) => answers.some((a) => a.question_id === id));
  if (finished) await finalizeAttempt(attempt.id, 'submitted');
  return { ok: true, finished, answeredCount: answers.length };
}

/** Heure limite de la question en cours : la précédente validation fait foi. */
async function deadlineDeLaQuestion(attempt: AttemptRow, t: TournamentRow, q: QuestionRow): Promise<Date> {
  const answers = await listAnswers(attempt.id);
  const dernier = answers.reduce<number>((max, a) => Math.max(max, new Date(a.validated_at).getTime()), 0);
  return questionDeadline({
    startedAt: new Date(attempt.started_at),
    lastValidatedAt: dernier ? new Date(dernier) : null,
    durationSeconds: questionSeconds(t, q),
    attemptDeadline: new Date(attempt.deadline_at),
  });
}

/** Écrit une réponse VIDE pour une question dont le temps est écoulé, et clôt
 *  la manche si c'était la dernière. Le barème s'applique normalement à une
 *  absence de réponse — aucune pénalité inventée ici. */
async function enregistrerSansReponse(attempt: AttemptRow, q: QuestionRow, bareme: Bareme): Promise<AnswerResult> {
  const g = gradeOne(q, [], bareme);
  const { error } = await arenaDb().from('arena_answers').insert({
    attempt_id: attempt.id,
    question_id: q.id,
    selected: [],
    score: g.score,
    max_score: g.max,
    discordances: g.discordances,
    is_perfect: g.is_perfect,
    rule_triggered: g.rule_triggered,
  });
  if (error && String(error.code) !== '23505') return err(error.message);
  const answers = await listAnswers(attempt.id);
  const finished = attempt.question_order.every((id) => answers.some((a) => a.question_id === id));
  if (finished) await finalizeAttempt(attempt.id, 'submitted');
  return { ok: true, finished, answeredCount: answers.length, expired: true };
}

/**
 * Appelé par le client quand le chronomètre d'UNE question tombe à zéro.
 *
 * Le serveur revérifie l'heure : un client en avance ne peut pas sauter une
 * question, et un client en retard ne prolonge rien. Tant que l'échéance n'est
 * pas atteinte, on ne fait rien et le client se resynchronise.
 */
export async function expireQuestion(attemptId: string, questionId: string): Promise<AnswerResult> {
  const owned = await ownedAttempt(attemptId);
  if ('ok' in owned) return owned;
  const { attempt } = owned;
  if (attempt.status !== 'in_progress') return err('Cette manche est terminée.');
  if (!attempt.question_order.includes(questionId)) return err('Question inconnue pour cette manche.');
  const q = await getQuestion(questionId);
  if (!q) return err('Question introuvable.');
  const round = await getRound(attempt.round_id);
  const t = round ? await getTournament(round.tournament_id) : null;
  if (!round || !t) return err('Manche introuvable.');
  const echeance = await deadlineDeLaQuestion(attempt, t, q);
  if (Date.now() < echeance.getTime()) {
    const answers = await listAnswers(attempt.id);
    return { ok: true, finished: false, answeredCount: answers.length, expired: false };
  }
  return enregistrerSansReponse(attempt, q, effectiveBareme(t, round));
}

/** Appelé par le client à l'expiration du chronomètre ; le serveur reste seul juge de l'heure. */
export async function expireAttempt(attemptId: string): Promise<Ok<{ expired: boolean }> | Err> {
  const owned = await ownedAttempt(attemptId);
  if ('ok' in owned) return owned;
  const { attempt } = owned;
  if (attempt.status !== 'in_progress') return { ok: true, expired: true };
  if (Date.now() < new Date(attempt.deadline_at).getTime()) return { ok: true, expired: false };
  await finalizeAttempt(attempt.id, 'expired');
  return { ok: true, expired: true };
}

/** Prévisualisation (§15.2) : rejouable à volonté — la tentative staff est effacée. */
export async function restartPreview(slug: string, roundNumber: number): Promise<Ok | Err> {
  const staff = await currentStaff();
  if (!staff) return err('Réservé au personnel.');
  const v = await visibleSnapshot(slug);
  if (!v) return err('Tournoi introuvable.');
  const round = v.snap.rounds.find((r) => r.number === roundNumber);
  if (!round) return err('Manche introuvable.');
  await arenaDb().from('arena_attempts').delete().eq('round_id', round.id).eq('preview_user_id', staff.id).eq('is_preview', true);
  revalidatePath(`/arena/${slug}/manche/${roundNumber}`);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Espace participant                                                  */
/* ------------------------------------------------------------------ */

export async function sendInvites(slug: string, rawEmails: string[], message: string | null): Promise<Ok<{ sent: number }> | Err> {
  const v = await visibleTournament(slug);
  if (!v) return err('Tournoi introuvable.');
  const p = await currentParticipant(v.tournament.id);
  if (!p) return err('Session expirée.');
  const emails = [...new Set(rawEmails.map(normalizeEmail).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)))].slice(0, 10);
  if (emails.length === 0) return err('Indiquez au moins une adresse email valide.');
  const { count } = await arenaDb().from('arena_emails').select('id', { count: 'exact', head: true }).eq('participant_id', p.id).eq('kind', 'invite').gte('sent_at', new Date(Date.now() - 86_400_000).toISOString());
  if ((count ?? 0) + emails.length > 30) return err('Limite de 30 invitations par jour atteinte.');
  const landing = `${siteUrl()}/arena/${v.tournament.slug}?i=${p.invite_code}&utm_source=invitation`;
  let sent = 0;
  for (const to of emails) {
    const r = await sendArenaEmail({ tournament: v.tournament, participant: p, to, kind: 'invite', mail: inviteEmail(v.tournament, p, landing, message?.trim().slice(0, 300) || null) });
    if (r.ok) sent++;
  }
  return { ok: true, sent };
}

const ReportSchema = z.object({
  questionId: z.string().uuid(),
  motif: z.enum(['erreur_medicale', 'enonce_ambigu', 'reponse_contestable', 'recommandation_obsolete', 'autre']),
  comment: z.string().trim().max(2000).default(''),
  reference: z.string().trim().max(300).nullable().optional(),
});

export async function submitReport(slug: string, raw: z.input<typeof ReportSchema>): Promise<Ok | Err> {
  const parsed = ReportSchema.safeParse(raw);
  if (!parsed.success) return err('Signalement invalide.');
  const v = await visibleSnapshot(slug);
  if (!v) return err('Tournoi introuvable.');
  const p = await currentParticipant(v.snap.tournament.id);
  if (!p) return err('Session expirée.');
  const q = await getQuestion(parsed.data.questionId);
  const round = q ? v.snap.rounds.find((r) => r.id === q.round_id) : null;
  if (!q || !round) return err('Question introuvable.');
  // Jamais pendant la manche : uniquement à la consultation des corrections (§10.1).
  if (roundState(round) !== 'closed') return err('Le signalement est possible à la consultation des corrections, après la clôture de la manche.');
  const db = arenaDb();
  const { error } = await db.from('arena_reports').insert({
    question_id: q.id, participant_id: p.id, motif: parsed.data.motif, comment: parsed.data.comment, reference: parsed.data.reference ?? null,
  });
  if (error) {
    if (String(error.code) === '23505') return err('Vous avez déjà signalé cette question.');
    return err(error.message);
  }
  const questions = await listQuestions(round.id);
  const index = questions.findIndex((x) => x.id === q.id) + 1;
  await sendArenaEmail({ tournament: v.snap.tournament, participant: p, to: p.email, kind: 'report_ack', mail: reportAckEmail(v.snap.tournament, p, round.number, index), roundId: round.id });
  return { ok: true };
}

/**
 * Choix d'un médaillon de la planche (§3.1 : l'avatar est public dans le
 * classement). L'identifiant est vérifié contre le catalogue : on n'écrit pas
 * en base une valeur venue du navigateur.
 */
export async function choisirAvatar(slug: string, avatarId: string): Promise<Ok<{ seed: string }> | Err> {
  const v = await visibleTournament(slug);
  if (!v) return err('Tournoi introuvable.');
  const p = await currentParticipant(v.tournament.id);
  if (!p) return err('Session expirée.');
  if (!estAvatarPlanche(avatarId)) return err('Avatar inconnu.');
  await arenaDb().from('arena_participants').update({ avatar_seed: avatarId }).eq('id', p.id);
  revalidatePath(`/arena/${slug}/espace`);
  return { ok: true, seed: avatarId };
}

export async function changePseudo(slug: string, rawPseudo: string): Promise<Ok | Err> {
  const v = await visibleSnapshot(slug);
  if (!v) return err('Tournoi introuvable.');
  const p = await currentParticipant(v.snap.tournament.id);
  if (!p) return err('Session expirée.');
  const pseudo = rawPseudo.trim();
  if (!isValidPseudo(pseudo)) return err('Pseudonyme invalide.');
  if (pseudoForbidden(pseudo)) return err('Ce pseudonyme n’est pas autorisé.');
  const { count } = await arenaDb().from('arena_attempts').select('id', { count: 'exact', head: true }).eq('participant_id', p.id);
  if ((count ?? 0) > 0) return err('Le pseudonyme ne peut plus changer une fois la première manche jouée.');
  const { error } = await arenaDb().from('arena_participants').update({ pseudo, pseudo_key: pseudoKey(pseudo) }).eq('id', p.id);
  if (error) return err(String(error.code) === '23505' ? 'Ce pseudonyme est déjà pris.' : error.message);
  revalidatePath(`/arena/${slug}/espace`);
  return { ok: true };
}

export async function setMarketingConsent(slug: string, value: boolean): Promise<Ok | Err> {
  const v = await visibleTournament(slug);
  if (!v) return err('Tournoi introuvable.');
  const p = await currentParticipant(v.tournament.id);
  if (!p) return err('Session expirée.');
  await arenaDb().from('arena_participants').update({
    consent_marketing: value,
    consent_marketing_at: value ? new Date().toISOString() : p.consent_marketing_at,
    consent_marketing_version: value ? CONSENT_VERSION : p.consent_marketing_version,
    marketing_unsubscribed_at: value ? null : new Date().toISOString(),
  }).eq('id', p.id);
  revalidatePath(`/arena/${slug}/espace`);
  return { ok: true };
}

/** Suppression du compte et des données à la demande (§3.1). */
export async function deleteMyAccount(slug: string): Promise<Ok | Err> {
  const v = await visibleTournament(slug);
  if (!v) return err('Tournoi introuvable.');
  const p = await currentParticipant(v.tournament.id);
  if (!p) return err('Session expirée.');
  const mail = deletedEmail(v.tournament, p.first_name);
  await sendArenaEmail({ tournament: v.tournament, participant: p, to: p.email, kind: 'deleted', mail });
  await anonymizeParticipant(p, 'request');
  await arenaLog({ tournamentId: v.tournament.id, kind: 'participant_deleted', details: `Suppression à la demande du participant ${p.pseudo}.` });
  await clearSessionCookie();
  return { ok: true };
}


/* ------------------------------------------------------------------ */
/* Vérification du pseudonyme en direct (maquette « modération »)      */
/* ------------------------------------------------------------------ */

export type PseudoCheck = { status: 'ok' | 'short' | 'invalid' | 'forbidden' | 'taken'; message: string };

/** Filtre automatique (§3.3) + disponibilité dans le tournoi, sans effet de bord. */
export async function checkPseudo(slug: string, rawPseudo: string): Promise<PseudoCheck> {
  const pseudo = String(rawPseudo ?? '').trim();
  if (pseudo.length < 3) return { status: 'short', message: '3 caractères minimum.' };
  if (pseudo.length > 24) return { status: 'invalid', message: '24 caractères maximum.' };
  if (!isValidPseudo(pseudo) || pseudoForbidden(pseudo)) return { status: 'forbidden', message: 'Ce pseudonyme contient un mot ou un format non autorisé.' };
  const v = await visibleSnapshot(slug);
  if (!v) return { status: 'invalid', message: 'Tournoi introuvable.' };
  const { data } = await arenaDb().from('arena_participants').select('id').eq('tournament_id', v.snap.tournament.id).eq('pseudo_key', pseudoKey(pseudo)).maybeSingle();
  if (data) return { status: 'taken', message: 'Ce pseudonyme est déjà pris dans ce tournoi.' };
  return { status: 'ok', message: 'Ce pseudonyme est disponible.' };
}
