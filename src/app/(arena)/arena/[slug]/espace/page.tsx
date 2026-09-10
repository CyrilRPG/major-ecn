import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { ArenaPage, Notice, Panel } from '@/components/arena/arena-shell';
import { BigScore, Container } from '@/components/arena/arena-ui';
import { buttonClass, buttonStyle } from '@/components/arena/tokens';
import { Countdown, LocalTime } from '@/components/arena/countdown';
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
import { ARENA, BODY, CAPS, HEADLINE, TABULAR } from '@/components/arena/tokens';
import { arenaDb, computeTournamentStandings, effectiveBareme, listAnswers, listAttemptsForRounds, roundDuration, roundMaxScore } from '@/lib/arena/db';
import { questionMaxUnit } from '@/lib/arena/scoring';
import { performanceAnalysis } from '@/lib/arena/result-summary';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { correctionsAccess } from '@/lib/arena/corrections-access';
import { UNDER_THRESHOLD_MESSAGE, buttonTruncated, warningTruncated } from '@/lib/arena/texts';
import { clockLabel, minutesLabel, roundState } from '@/lib/arena/time';
import { siteUrl } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ bienvenue?: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: 'Mon espace', noindex: true });
}

const fr = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
const STATE_LABEL = { open: 'Ouverte', upcoming: 'À venir', closed: 'Clôturée', unscheduled: 'À programmer' } as const;

/** Espace participant (maquette 7) : position, manches, scores, rang (si seuil), corrections, invitation, réglages. */
export default async function SpacePage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { bienvenue } = await searchParams;
  const ctx = await loadArenaPage(slug);
  if (!ctx.participant) redirect(`/arena/connexion`);
  const p = ctx.participant;
  const t = ctx.snap.tournament;
  const now = new Date();
  const base = `/arena/${slug}`;

  const attempts = (await listAttemptsForRounds(ctx.snap.rounds.map((r) => r.id))).filter((a) => a.participant_id === p.id);
  const standings = await computeTournamentStandings(ctx.snap);
  const me = standings.standings.find((s) => s.participantId === p.id) ?? null;
  const rankHistory = await participantRankHistory(p.id);
  if (standings.isFinal) {
    const playedAttempts = attempts.filter(a => me?.perRound[a.round_id]);
    const answers = (await Promise.all(playedAttempts.map(a => listAnswers(a.id)))).flat();
    const byQuestion = new Map(answers.map(a => [a.question_id, a]));
    const analysis = performanceAnalysis(ctx.snap.rounds.filter(r => me?.perRound[r.id]).flatMap(r =>
      (ctx.snap.questionsByRound.get(r.id) ?? []).filter(q => !q.neutralized_at).map(q => ({ type: q.type, score: Number(byQuestion.get(q.id)?.score ?? 0), max: questionMaxUnit(q, effectiveBareme(t, r)) * q.weight }))));
    const summary = tournamentFinalSummary({
      participantId: p.id, edition: t.edition_label, afficherEffectifGeneral: t.afficher_effectif_general,
      rankings: standings, history: rankHistory, thresholdPct: t.threshold_pct,
      analysis,
      rounds: ctx.snap.rounds.map(r => {
        const questions = (ctx.snap.questionsByRound.get(r.id) ?? []).filter(q => !q.neutralized_at);
        return { id: r.id, number: r.number, date: r.opens_at, theme: r.theme, questionCount: questions.length, max: roundMaxScore(questions, effectiveBareme(t, r)) };
      }),
    });
    return <ArenaPage nav={ctx.nav} immersive>
      <TournamentFinal summary={summary} base={base} leaderboardEnabled={t.leaderboard_enabled} />
      <ProfileDetails>
        <AvatarRankHistory seed={p.avatar_seed} pseudo={p.pseudo} rank={me?.rank ?? null} entries={rankHistory} final general={summary.general} />
        <SpaceSettings slug={slug} pseudo={p.pseudo} avatarSeed={p.avatar_seed} rank={me?.rank} marketing={p.consent_marketing && !p.marketing_unsubscribed_at} canChangePseudo={attempts.length === 0} email={p.email} />
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
  const { count: participantCount } = await arenaDb().from('arena_participants').select('id', { count: 'exact', head: true }).eq('tournament_id', t.id).not('email_confirmed_at', 'is', null).is('blocked_at', null).is('anonymized_at', null);
  const lastCounted = standings.countedRounds.length ? Math.max(...standings.countedRounds.map((r) => r.number)) : null;

  return (
    <ArenaPage nav={ctx.nav} immersive>
      {featured && <RoundLobby slug={slug} round={featured} rounds={ctx.snap.rounds} participant={ctx.nav.participant}
        questionCount={featuredQuestions.length} duration={roundDuration(t, featured, featuredQuestions)} bareme={effectiveBareme(t, featured)} ns={qrpNs(featuredQuestions)} participantCount={participantCount ?? 0} nowIso={now.toISOString()}
        notices={<div className="space-y-3">{bienvenue && <Notice tone="ok">Votre adresse est confirmée : vous êtes officiellement dans l’arène sous le pseudonyme « {p.pseudo} ».</Notice>}{featuredTruncated && !featuredAttempt && <Notice tone="amber">{warningTruncated(minutesLabel(featuredRemaining))}</Notice>}</div>}
      >{featuredAttempt ? <Link className="ae-button" href={base + '/manche/' + featured.number}>{featuredAttempt.status === 'in_progress' ? 'Reprendre la manche' : 'Voir mes résultats'}<ArrowRight aria-hidden /></Link> : roundState(featured, now) === 'open' && featuredQuestions.length > 0 ? <StartRoundButton slug={slug} roundNumber={featured.number} preview={false} immersive label={featuredTruncated ? buttonTruncated(Math.max(1, Math.floor(featuredRemaining / 60))) : 'Entrer dans l’arène — manche ' + featured.number} /> : <Link className="ae-button" href={base + '/manche/' + featured.number}>Voir la manche {featured.number}<ArrowRight aria-hidden /></Link>}</RoundLobby>}

      <Container className="py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="min-w-0 space-y-4">
            {ctx.snap.rounds.map((r) => {
              const st = roundState(r, now);
              const a = attempts.find((x) => x.round_id === r.id);
              const max = roundMaxScore(ctx.snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r));
              const played = a && a.status !== 'in_progress';
              const open = st === 'open' && !played;
              return (
                <Panel key={r.id} accent={open}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.24em' }}>Manche {r.number}</span>
                        <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ background: open ? ARENA.red : ARENA.raised2, color: open ? '#fff' : ARENA.textSoft, fontFamily: BODY }}>{played ? 'Jouée' : STATE_LABEL[st]}</span>
                      </p>
                      <p className="mt-1.5 text-[1.3rem] leading-tight" style={{ ...CAPS, color: ARENA.text }}>{r.theme || `Manche ${r.number}`}</p>
                      <p className="mt-1 text-[13px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                        {r.opens_at ? <LocalTime iso={r.opens_at} withYear /> : 'Date annoncée prochainement'}
                      </p>
                    </div>
                    <span className="text-[3rem] leading-none" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em', color: open ? ARENA.redSoft : ARENA.textMuted }}>M{r.number}</span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    {played ? (
                      <>
                        <BigScore value={fr(Number(a.score ?? 0))} max={fr(max)} color={ARENA.text} size="md" />
                        <span className="text-[13px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>temps {clockLabel(a.duration_seconds ?? 0)}{a.truncated ? ' (fenêtre réduite)' : ''}</span>
                        <Link href={`${base}/manche/${r.number}`} className="text-[13px] font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Résultats</Link>
                        {correctionsAccess({ round: r, tournamentId: t.id, participant: p, now }).allowed ? (
                          <Link href={`${base}/manche/${r.number}/corrections`} className="text-[13px] font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft, fontFamily: BODY }}>Voir ma correction détaillée</Link>
                        ) : (
                          <span className="text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Correction détaillée après la clôture</span>
                        )}
                      </>
                    ) : a ? (
                      <Link href={`${base}/manche/${r.number}`} className={buttonClass('primary')} style={buttonStyle('primary')}>Reprendre la manche <ArrowRight className="h-4 w-4" /></Link>
                    ) : st === 'open' ? (
                      <>
                        <Link href={`${base}/manche/${r.number}`} className={buttonClass('primary')} style={buttonStyle('primary')}>Jouer la manche {r.number} <ArrowRight className="h-4 w-4" /></Link>
                        {r.closes_at && <p className="text-[13px]" style={{ fontFamily: BODY }}><Countdown target={r.closes_at} label="Se termine dans" /></p>}
                      </>
                    ) : st === 'upcoming' && r.opens_at ? (
                      <p className="text-[13px]" style={{ fontFamily: BODY }}><Countdown target={r.opens_at} label="Ouvre dans" /></p>
                    ) : st === 'closed' ? (
                      <p className="text-[13px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                        Manche non jouée (compte pour zéro).{' '}
                        {correctionsAccess({ round: r, tournamentId: t.id, participant: p, now }).allowed && <Link href={`${base}/manche/${r.number}/corrections`} className="font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>Voir ma correction détaillée</Link>}
                      </p>
                    ) : (
                      <p className="text-[13px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>En attente de programmation.</p>
                    )}
                  </div>
                </Panel>
              );
            })}
          </div>

          <div className="min-w-0 space-y-4">
            <Panel accent>
              <p className="text-[11px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.24em' }}>Ma position</p>
              {standings.countedRounds.length === 0 ? (
                <p className="mt-3 text-[13.5px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Le classement apparaît après la publication des résultats de la première manche.</p>
              ) : (
                <>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Score cumulé{lastCounted ? ` · après M${lastCounted}` : ''}</p>
                  <div className="mt-1"><BigScore value={fr(me?.totalScore ?? 0)} max={fr(cumulMax)} color={ARENA.text} size="md" /></div>
                  {me?.rank ? (
                    <>
                      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Classement {standings.isFinal ? 'final' : 'provisoire'}</p>
                      <p className="mt-1 text-[3.6rem] leading-none" style={{ fontFamily: HEADLINE, color: ARENA.ok, letterSpacing: '0.04em' }}>{me.rank}<span className="text-[0.5em]">{me.rank === 1 ? 'er' : 'e'}</span></p>
                    </>
                  ) : (
                    <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{UNDER_THRESHOLD_MESSAGE}</p>
                  )}
                </>
              )}
              <Link href={`${base}/regles#classement`} className="mt-4 inline-block text-[12px] font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Comment est calculé le classement ?</Link>
            </Panel>

            <Panel>
              <h2 id="inviter" className="text-[1.4rem] leading-none" style={{ ...CAPS, color: ARENA.text }}>Invitez un collègue à rejoindre l’Arena</h2>
              <p className="mt-2 mb-5 text-[13px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Plus on est de médecins, plus le défi est stimulant. Votre lien d’invitation personnalisé :</p>
              <InviteBox slug={slug} inviteUrl={inviteUrl} specialty={t.specialty} questions={t.questions_per_round} secondsPerQuestion={t.seconds_per_question ?? 60} />
            </Panel>

            <Panel>
              <AvatarRankHistory seed={p.avatar_seed} pseudo={p.pseudo} rank={me?.rank ?? null} entries={rankHistory} />
            </Panel>

            <Panel>
              <h2 id="compte" className="text-[1.4rem] leading-none" style={{ ...CAPS, color: ARENA.text }}>Mon compte</h2>
              <div className="mt-5">
                <SpaceSettings slug={slug} pseudo={p.pseudo} avatarSeed={p.avatar_seed} rank={me?.rank} marketing={p.consent_marketing && !p.marketing_unsubscribed_at} canChangePseudo={attempts.length === 0} email={p.email} />
              </div>
            </Panel>
          </div>
        </div>
        <p className="mt-8 text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}><span style={{ ...TABULAR }}>{attempts.filter((a) => a.status !== 'in_progress').length}</span> manche(s) jouée(s) sur {ctx.snap.rounds.length}.</p>
      </Container>
    </ArenaPage>
  );
}
