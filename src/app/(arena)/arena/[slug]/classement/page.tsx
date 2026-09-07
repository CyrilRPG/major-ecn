import { ArenaPage, Notice } from '@/components/arena/arena-shell';
import { Container, Eyebrow } from '@/components/arena/arena-ui';
import { ARENA, BODY, DISPLAY } from '@/components/arena/tokens';
import { Leaderboard } from '@/components/arena/leaderboard';
import { computeTournamentStandings, effectiveBareme, roundMaxScore } from '@/lib/arena/db';
import { leaderboardRows } from '@/lib/arena/ranking';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: 'Meilleurs scores' });
}

/** « Meilleurs scores » (§7.2) — activable/désactivable par l'administrateur. */
export default async function LeaderboardPage({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  const t = ctx.snap.tournament;
  const standings = await computeTournamentStandings(ctx.snap);
  const rows = leaderboardRows(standings.standings, t.leaderboard_size, ctx.participant?.id ?? null);
  const totalMax = standings.countedRounds.reduce((a, r) => a + roundMaxScore(ctx.snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r)), 0);
  const last = standings.countedRounds.length ? Math.max(...standings.countedRounds.map((r) => r.number)) : null;

  return (
    <ArenaPage nav={ctx.nav}>
      <Container className="max-w-3xl py-12 sm:py-16">
        <Eyebrow>{t.specialty}{t.edition_label ? ` · ${t.edition_label}` : ''}</Eyebrow>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl" style={{ fontFamily: DISPLAY, letterSpacing: '-0.04em' }}>Meilleurs scores</h1>
        <p className="mt-3 text-[15px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          Classement cumulé, provisoire après chaque manche et final après la dernière.
        </p>
        <div className="mt-8">
          {!t.leaderboard_enabled ? (
            <Notice>Le classement public n’est pas publié pour ce tournoi. Votre rang personnel reste visible dans votre espace.</Notice>
          ) : (
            <Leaderboard
              rows={rows}
              subtitle={standings.isFinal ? 'Classement final' : last ? `Classement provisoire cumulé · après M${last}` : 'En attente de la première manche'}
              totalMax={totalMax}
              rulesHref={`/arena/${slug}/regles#classement`}
              emptyMessage={last ? 'Aucun participant n’atteint encore le seuil du classement.' : undefined}
            />
          )}
        </div>
      </Container>
    </ArenaPage>
  );
}
