import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { ArenaPage, Notice, Panel } from '@/components/arena/arena-shell';
import { ARENA, ArenaButton, BODY, Container, DISPLAY, Eyebrow, TABULAR } from '@/components/arena/arena-ui';
import { Countdown, LocalTime } from '@/components/arena/countdown';
import { InviteBox } from '@/components/arena/invite-box';
import { SpaceSettings } from '@/components/arena/space-settings';
import { computeTournamentStandings, effectiveBareme, listAttemptsForRounds, roundMaxScore } from '@/lib/arena/db';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { UNDER_THRESHOLD_MESSAGE } from '@/lib/arena/texts';
import { clockLabel, roundState } from '@/lib/arena/time';
import { siteUrl } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ bienvenue?: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: 'Mon espace', noindex: true });
}

const fr = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

/** Espace participant : manches, scores, rang (si seuil atteint), corrections, invitation, réglages. */
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
  const cumulMax = standings.countedRounds.reduce((a, r) => a + roundMaxScore(ctx.snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r)), 0);
  const inviteUrl = `${siteUrl()}/arena/${slug}?i=${p.invite_code}&utm_source=invitation`;

  return (
    <ArenaPage nav={ctx.nav}>
      <Container className="py-12 sm:py-16">
        {bienvenue && <div className="mb-6"><Notice tone="red">Votre adresse est confirmée : vous êtes officiellement dans l’arène sous le pseudonyme « {p.pseudo} ».</Notice></div>}
        <Eyebrow>Mon espace · {t.specialty}</Eyebrow>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl" style={{ fontFamily: DISPLAY, letterSpacing: '-0.04em' }}>Bonjour {p.first_name}.</h1>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-4">
            {ctx.snap.rounds.map((r) => {
              const st = roundState(r, now);
              const a = attempts.find((x) => x.round_id === r.id);
              const max = roundMaxScore(ctx.snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r));
              const played = a && a.status !== 'in_progress';
              return (
                <Panel key={r.id} accent={st === 'open' && !played}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>Manche {r.number}{r.theme ? ` · ${r.theme}` : ''}</p>
                      <p className="mt-1.5 text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                        {r.opens_at ? <LocalTime iso={r.opens_at} withYear /> : 'Date annoncée prochainement'}
                      </p>
                    </div>
                    <span className="text-4xl leading-none" style={{ ...TABULAR, color: st === 'open' ? ARENA.redSoft : ARENA.textMuted, fontWeight: 500 }}>M{r.number}</span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    {played ? (
                      <>
                        <p style={{ fontFamily: BODY }}>
                          <span className="text-3xl" style={{ ...TABULAR, fontWeight: 500 }}>{fr(Number(a.score ?? 0))}</span>
                          <span className="ml-1 text-sm" style={{ color: ARENA.textMuted }}>/ {fr(max)}</span>
                          <span className="ml-4 text-sm" style={{ color: ARENA.textSoft }}>temps {clockLabel(a.duration_seconds ?? 0)}{a.truncated ? ' (fenêtre réduite)' : ''}</span>
                        </p>
                        {r.results_published_at ? (
                          <Link href={`${base}/manche/${r.number}/corrections`} className="text-sm font-bold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft, fontFamily: BODY }}>Corrections</Link>
                        ) : (
                          <span className="text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Corrections après la clôture</span>
                        )}
                      </>
                    ) : a ? (
                      <Link href={`${base}/manche/${r.number}`}><ArenaButton>Reprendre la manche <ArrowRight className="h-4 w-4" /></ArenaButton></Link>
                    ) : st === 'open' ? (
                      <>
                        <Link href={`${base}/manche/${r.number}`}><ArenaButton>Jouer la manche {r.number} <ArrowRight className="h-4 w-4" /></ArenaButton></Link>
                        {r.closes_at && <p className="text-sm" style={{ fontFamily: BODY }}><Countdown target={r.closes_at} label="Se termine dans" /></p>}
                      </>
                    ) : st === 'upcoming' && r.opens_at ? (
                      <p className="text-sm" style={{ fontFamily: BODY }}><Countdown target={r.opens_at} label="Ouvre dans" /></p>
                    ) : st === 'closed' ? (
                      <p className="text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                        Manche non jouée (compte pour zéro).{' '}
                        {r.results_published_at && <Link href={`${base}/manche/${r.number}/corrections`} className="font-bold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>Voir les corrections</Link>}
                      </p>
                    ) : (
                      <p className="text-sm" style={{ color: ARENA.textMuted, fontFamily: BODY }}>En attente de programmation.</p>
                    )}
                  </div>
                </Panel>
              );
            })}
          </div>

          <div className="space-y-4">
            <Panel accent>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>Ma position</p>
              {standings.countedRounds.length === 0 ? (
                <p className="mt-3 text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Le classement apparaît après la publication des résultats de la première manche.</p>
              ) : me?.rank ? (
                <>
                  <div className="mt-2 flex items-end gap-4">
                    <span className="text-6xl leading-none" style={{ ...TABULAR, fontWeight: 500 }}>{me.rank}<sup className="text-xl" style={{ color: ARENA.textMuted }}>{me.rank === 1 ? 'er' : 'e'}</sup></span>
                    <span className="pb-1 text-sm leading-snug" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                      Score cumulé <span className="font-bold" style={{ color: ARENA.text }}>{fr(me.totalScore)} / {fr(cumulMax)}</span>
                      <br />{standings.isFinal ? 'Classement final.' : 'Classement provisoire.'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm" style={{ fontFamily: BODY }}>
                    Score cumulé <span className="font-bold">{fr(me?.totalScore ?? 0)} / {fr(cumulMax)}</span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{UNDER_THRESHOLD_MESSAGE}</p>
                </>
              )}
              <Link href={`${base}/regles#classement`} className="mt-4 inline-block text-xs font-bold underline-offset-4 hover:underline" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Comment est calculé le classement ?</Link>
            </Panel>

            <Panel>
              <h2 id="inviter" className="text-xl font-extrabold" style={{ fontFamily: DISPLAY, letterSpacing: '-0.02em' }}>Inviter un collègue</h2>
              <p className="mt-1.5 mb-5 text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>L’arène est plus intéressante à plusieurs. Votre lien personnel :</p>
              <InviteBox slug={slug} inviteUrl={inviteUrl} specialty={t.specialty} />
            </Panel>

            <Panel>
              <h2 className="text-xl font-extrabold" style={{ fontFamily: DISPLAY, letterSpacing: '-0.02em' }}>Mon compte</h2>
              <div className="mt-5">
                <SpaceSettings slug={slug} pseudo={p.pseudo} avatarSeed={p.avatar_seed} marketing={p.consent_marketing && !p.marketing_unsubscribed_at} canChangePseudo={attempts.length === 0} email={p.email} />
              </div>
            </Panel>
          </div>
        </div>
      </Container>
    </ArenaPage>
  );
}
