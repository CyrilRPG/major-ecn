import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ArenaPage, Notice } from '@/components/arena/arena-shell';
import { InviteBox } from '@/components/arena/invite-box';
import { SpaceSettings } from '@/components/arena/space-settings';
import { ProfileDetails } from '@/components/arena/profile-details';
import { RoundLobby } from '@/components/arena/round-lobby';
import { TournamentFinal } from '@/components/arena/tournament-final';
import { tournamentFinalSummary } from '@/lib/arena/final-summary';
import { AvatarRankHistory } from '@/components/arena/avatar-rank-history';
import { participantRankHistory } from '@/lib/arena/rank-history-db';
import { qrpNs } from '@/lib/arena/types';
import { StartRoundButton } from '@/components/arena/start-round-button';
import { arenaDb, computeTournamentStandings, effectiveBareme, listAnswers, listAttemptsForRounds, roundDuration, roundMaxScore } from '@/lib/arena/db';
import { questionMaxUnit } from '@/lib/arena/scoring';
import { performanceAnalysis } from '@/lib/arena/result-summary';
import { arenaMetadata, loadArenaPage, redirectToAccess } from '@/lib/arena/page-context';
import { correctionsAccess } from '@/lib/arena/corrections-access';
import { buttonTruncated, warningTruncated } from '@/lib/arena/texts';
import { minutesLabel, roundState } from '@/lib/arena/time';
import { siteUrl } from '@/lib/email/send';
import { roundOutcome } from '@/lib/arena/performance';
import { passerelleContent, passerelleUrl, studentTrainingUrl } from '@/lib/arena/passerelle';
import { participantAudience } from '@/lib/arena/major-ecn';
import { collegeIdForSpecialty } from '@/lib/data/enrollable-colleges';
import { PasserelleBlock } from '@/components/arena/passerelle-block';
import { SpaceProgress } from '@/components/arena/space-progress';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ bienvenue?: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: 'Mon espace', noindex: true });
}

/** Espace participant (maquette 7) : position, manches, scores, rang (si seuil), corrections, invitation, réglages. */
export default async function SpacePage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { bienvenue } = await searchParams;
  const ctx = await loadArenaPage(slug);
  if (!ctx.participant) redirectToAccess(ctx, `/arena/${slug}/espace`);
  const p = ctx.participant;
  const t = ctx.snap.tournament;
  const now = new Date();
  const base = `/arena/${slug}`;

  const attempts = (await listAttemptsForRounds(ctx.snap.rounds.map((r) => r.id))).filter((a) => a.participant_id === p.id);
  const standings = await computeTournamentStandings(ctx.snap);
  const me = standings.standings.find((s) => s.participantId === p.id) ?? null;
  const rankHistory = await participantRankHistory(p.id);
  // Cahier des charges complémentaire (18/09/2026) : niveau du cumul → discours de la passerelle.
  const thresholds = { thresholdPct: t.threshold_pct, distinctionPct: t.distinction_pct };
  const cumulOutcome = roundOutcome({ score: me?.totalScore ?? 0, max: me?.totalMax ?? 0, rank: me?.rank ?? null, published: standings.countedRounds.length > 0, thresholds });
  const passerelle = t.passerelle_enabled && standings.countedRounds.length > 0
    ? passerelleContent({
        enabled: true, level: cumulOutcome.level, audience: await participantAudience(p),
        prospectUrl: passerelleUrl(t), studentUrl: studentTrainingUrl(collegeIdForSpecialty(t.specialty)), ctaOverride: t.passerelle_cta,
      })
    : null;
  // Profil (maquette du 24/09/2026, 14_50_00) : dates des manches et participation réelle.
  const roundDates = Object.fromEntries(ctx.snap.rounds.map((r) => [r.number, r.opens_at]));
  // Manches comptées au cumul à chaque publication : l'échelle de la note (10 × n) d'une ligne du palmarès.
  const countedAt = Object.fromEntries(ctx.snap.rounds.map((r) => [r.number, standings.countedRounds.filter((c) => c.number <= r.number).length]));
  const playedCount = attempts.filter((a) => a.status !== 'in_progress').length;
  if (standings.isFinal) {
    const playedAttempts = attempts.filter(a => me?.perRound[a.round_id]);
    const answers = (await Promise.all(playedAttempts.map(a => listAnswers(a.id)))).flat();
    const byQuestion = new Map(answers.map(a => [a.question_id, a]));
    const analysis = performanceAnalysis(ctx.snap.rounds.filter(r => me?.perRound[r.id]).flatMap(r =>
      (ctx.snap.questionsByRound.get(r.id) ?? []).filter(q => !q.neutralized_at).map(q => ({ type: q.type, score: Number(byQuestion.get(q.id)?.score ?? 0), max: questionMaxUnit(q, effectiveBareme(t, r)) * q.weight }))));
    const summary = tournamentFinalSummary({
      participantId: p.id, edition: t.edition_label, afficherEffectifGeneral: t.afficher_effectif_general,
      rankings: standings, history: rankHistory, thresholdPct: t.threshold_pct, distinctionPct: t.distinction_pct,
      analysis,
      rounds: ctx.snap.rounds.map(r => {
        const questions = (ctx.snap.questionsByRound.get(r.id) ?? []).filter(q => !q.neutralized_at);
        return { id: r.id, number: r.number, date: r.opens_at, theme: r.theme, questionCount: questions.length, max: roundMaxScore(questions, effectiveBareme(t, r)) };
      }),
    });
    return <ArenaPage nav={ctx.nav} immersive>
      <TournamentFinal summary={summary} base={base} leaderboardEnabled={t.leaderboard_enabled} passerelle={passerelle} />
      <ProfileDetails>
        <AvatarRankHistory seed={p.avatar_seed} pseudo={p.pseudo} rank={me?.rank ?? null} distinction={me?.distinction ?? null} thresholds={thresholds} entries={rankHistory} final general={summary.general} base={base} roundDates={roundDates} countedAt={countedAt} />
        <SpaceSettings slug={slug} pseudo={p.pseudo} avatarSeed={p.avatar_seed} rank={me?.rank} distinction={me?.distinction ?? null} marketing={p.consent_marketing && !p.marketing_unsubscribed_at} canChangePseudo={attempts.length === 0} email={p.email}
          specialty={p.specialty || t.specialty} edition={t.edition_label} played={playedCount} roundsTotal={ctx.snap.rounds.length} />
      </ProfileDetails>
    </ArenaPage>;
  }
  const cumulMax = standings.countedRounds.reduce((a, r) => a + roundMaxScore(ctx.snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r)), 0);
  const inviteUrl = `${siteUrl()}/arena/${slug}?i=${p.invite_code}&utm_source=invitation`;
  const openRound = ctx.snap.rounds.find((r) => roundState(r, now) === 'open') ?? null;
  const featured = openRound ?? ctx.snap.rounds.find((r) => roundState(r, now) === 'upcoming') ?? ctx.snap.rounds.at(-1);
  const featuredRemaining = featured?.closes_at ? Math.max(0, Math.floor((new Date(featured.closes_at).getTime() - now.getTime()) / 1000)) : Infinity;
  const featuredTruncated = featured && roundState(featured, now) === 'open' && featuredRemaining < roundDuration(t, featured, ctx.snap.questionsByRound.get(featured.id)) * 60;
  const featuredAttempt = featured ? attempts.find((a) => a.round_id === featured.id) : null;
  const featuredQuestions = featured ? (ctx.snap.questionsByRound.get(featured.id) ?? []).filter((q) => !q.neutralized_at) : [];
  // §7 : aucun effectif affiché, sauf activation explicite par l'administration.
  const { count: participantCount } = !t.afficher_effectif_general ? { count: null } : await arenaDb().from('arena_participants').select('id', { count: 'exact', head: true }).eq('tournament_id', t.id).not('email_confirmed_at', 'is', null).is('blocked_at', null).is('anonymized_at', null);
  const lastCounted = standings.countedRounds.length ? Math.max(...standings.countedRounds.map((r) => r.number)) : null;

  return (
    <ArenaPage nav={ctx.nav} immersive>
      {featured && <RoundLobby slug={slug} round={featured} rounds={ctx.snap.rounds} participant={ctx.nav.participant}
        questionCount={featuredQuestions.length} duration={roundDuration(t, featured, featuredQuestions)} bareme={effectiveBareme(t, featured)} ns={qrpNs(featuredQuestions)} participantCount={t.afficher_effectif_general ? participantCount ?? 0 : null} nowIso={now.toISOString()}
        notices={<div className="space-y-3">{bienvenue && <Notice tone="ok">Votre adresse est confirmée : vous êtes officiellement dans l’arène sous le pseudonyme « {p.pseudo} ».</Notice>}{featuredTruncated && !featuredAttempt && <Notice tone="amber">{warningTruncated(minutesLabel(featuredRemaining))}</Notice>}</div>}
      >{featuredAttempt ? <Link className="ae-button" href={base + '/manche/' + featured.number}>{featuredAttempt.status === 'in_progress' ? 'Reprendre la manche' : 'Voir mes résultats'}<ArrowRight aria-hidden /></Link> : roundState(featured, now) === 'open' && featuredQuestions.length > 0 ? <StartRoundButton slug={slug} roundNumber={featured.number} preview={false} immersive label={featuredTruncated ? buttonTruncated(Math.max(1, Math.floor(featuredRemaining / 60))) : 'Entrer dans l’arène — manche ' + featured.number} /> : <Link className="ae-button" href={base + '/manche/' + featured.number}>Voir la manche {featured.number}<ArrowRight aria-hidden /></Link>}</RoundLobby>}

      <SpaceProgress
        base={base}
        rounds={ctx.snap.rounds.map((r) => {
          const a = attempts.find((x) => x.round_id === r.id);
          const questions = (ctx.snap.questionsByRound.get(r.id) ?? []).filter((q) => !q.neutralized_at);
          const done = a && a.status !== 'in_progress';
          return {
            number: r.number, theme: r.theme, opensAt: r.opens_at, closesAt: r.closes_at, state: roundState(r, now), questionCount: questions.length,
            played: done ? { score: Number(a.score ?? 0), max: roundMaxScore(ctx.snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r)), seconds: a.duration_seconds ?? 0, truncated: Boolean(a.truncated) } : null,
            inProgress: Boolean(a && a.status === 'in_progress'),
            correctionsAllowed: correctionsAccess({ round: r, tournamentId: t.id, participant: p, now }).allowed,
          };
        })}
        cumul={{ score: me?.totalScore ?? 0, max: cumulMax, counted: standings.countedRounds.length, lastCounted, rank: me?.rank ?? null, distinction: me?.distinction ?? null, final: standings.isFinal, thresholdPct: t.threshold_pct, distinctionPct: t.distinction_pct }}
        invite={<InviteBox slug={slug} inviteUrl={inviteUrl} specialty={t.specialty} questions={t.questions_per_round} secondsPerQuestion={t.seconds_per_question ?? 60} />}
      >
        {passerelle && <PasserelleBlock content={passerelle} variant="cream" />}
      </SpaceProgress>
      <ProfileDetails>
        <AvatarRankHistory seed={p.avatar_seed} pseudo={p.pseudo} rank={me?.rank ?? null} distinction={me?.distinction ?? null} thresholds={thresholds} entries={rankHistory} base={base} roundDates={roundDates} countedAt={countedAt} />
        <SpaceSettings slug={slug} pseudo={p.pseudo} avatarSeed={p.avatar_seed} rank={me?.rank} distinction={me?.distinction ?? null} marketing={p.consent_marketing && !p.marketing_unsubscribed_at} canChangePseudo={attempts.length === 0} email={p.email}
          specialty={p.specialty || t.specialty} edition={t.edition_label} played={playedCount} roundsTotal={ctx.snap.rounds.length} />
      </ProfileDetails>
    </ArenaPage>
  );
}
