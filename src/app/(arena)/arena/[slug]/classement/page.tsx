import { ArenaPage, Notice } from '@/components/arena/arena-shell';
import { Container, Eyebrow } from '@/components/arena/arena-ui';
import { ARENA, BODY, CAPS } from '@/components/arena/tokens';
import { Leaderboard } from '@/components/arena/leaderboard';
import { computeTournamentStandings, effectiveBareme, roundMaxScore } from '@/lib/arena/db';
import { leaderboardRows } from '@/lib/arena/ranking';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { correctionsAccess } from '@/lib/arena/corrections-access';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ manche?: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: 'Meilleurs scores' });
}

/** « Meilleurs scores » (§7.2) — activable/désactivable par l'administrateur. */
export default async function LeaderboardPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  const t = ctx.snap.tournament;
  const standings = await computeTournamentStandings(ctx.snap);
  const roundNumber = Number((await searchParams).manche);
  const round = standings.countedRounds.find(r => r.number === roundNumber);
  const cohort = round ? standings.byRound[round.id] : null;
  const source = cohort?.standings ?? standings.standings;
  const rows = leaderboardRows(source, Infinity, ctx.participant?.id ?? null).map(row => ({ ...row, avatarRank: standings.standings.find(s => s.pseudo === row.pseudo)?.rank ?? null }));
  const totalMax = (round ? [round] : standings.countedRounds).reduce((a, r) => a + roundMaxScore(ctx.snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r)), 0);
  const effectif = cohort?.effectifManche ?? (standings.isFinal ? standings.effectifGeneral : standings.standings.filter(s => s.roundsPlayed > 0).length);
  const last = standings.countedRounds.length ? Math.max(...standings.countedRounds.map((r) => r.number)) : null;
  // Depuis le classement, le participant rejoint sa correction détaillée (manche close + résultats publiés).
  const correctionRounds = ctx.participant
    ? (round ? [round] : standings.countedRounds).filter((r) => correctionsAccess({ round: r, tournamentId: t.id, participant: ctx.participant }).allowed)
    : [];

  return (
    <ArenaPage nav={ctx.nav} immersive>
      <Container className="ae-document max-w-3xl py-12 sm:py-16">
        <Eyebrow>{t.specialty}{t.edition_label ? ` · ${t.edition_label}` : ''}</Eyebrow>
        <h1 className="mt-4 text-[2.4rem] leading-[0.95] sm:text-[3.4rem]" style={{ ...CAPS, color: ARENA.text }}>Meilleurs scores</h1>
        <p className="mt-3 text-[15px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          Classement cumulé, provisoire après chaque manche et final après la dernière.
        </p>
        <nav aria-label="Classements" className="flex flex-wrap gap-4 mt-6"><Link aria-current={!round ? 'page' : undefined} className="underline" href={`/arena/${slug}/classement`}>{standings.isFinal ? 'Classement général' : 'Cumul provisoire'}</Link>{standings.countedRounds.map(r => <Link key={r.id} className="underline" aria-current={r.id === round?.id ? 'page' : undefined} href={`/arena/${slug}/classement?manche=${r.number}`}>Manche {r.number}</Link>)}</nav>
        <div className="mt-8">
          {!t.leaderboard_enabled ? (
            <Notice>Le classement public n’est pas publié pour ce tournoi. Votre rang personnel reste visible dans votre espace.</Notice>
          ) : (
            <Leaderboard
              rows={rows}
              subtitle={round ? `Classement de la manche ${round.number}` : standings.isFinal ? 'Classement général final' : last ? `Classement provisoire cumulé · après M${last}` : 'En attente de la première manche'}
              effectif={effectif} general={standings.isFinal && !round} roundOnly={Boolean(round)}
              totalMax={totalMax}
              rulesHref={`/arena/${slug}/regles#classement`}
              emptyMessage={last ? 'Aucun participant n’atteint encore le seuil du classement.' : undefined}
            />
          )}
        </div>
        {correctionRounds.length > 0 && (
          <section aria-labelledby="mes-corrections" className="mt-8 rounded-2xl p-5 sm:p-7" style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
            <p id="mes-corrections" className="text-[11px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.24em' }}>Ma correction détaillée</p>
            <p className="mt-2 text-[13.5px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
              Vos réponses face aux réponses attendues, avec les explications, les pièges et les erreurs les plus fréquentes. Consultable à tout moment dans votre espace.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {correctionRounds.map((r) => (
                <Link key={r.id} className="ae-button ae-button-outline" href={`/arena/${slug}/manche/${r.number}/corrections`}>
                  <FileText aria-hidden />
                  <span>Voir ma correction détaillée{correctionRounds.length > 1 || !round ? ` · manche ${r.number}` : ''}</span>
                  <ArrowRight aria-hidden />
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </ArenaPage>
  );
}
