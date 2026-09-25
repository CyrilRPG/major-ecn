import { ArenaPage, Notice } from '@/components/arena/arena-shell';
import { Leaderboard } from '@/components/arena/leaderboard';
import { computeTournamentStandings, effectiveBareme, roundMaxScore } from '@/lib/arena/db';
import { leaderboardRows } from '@/lib/arena/ranking';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { correctionsAccess } from '@/lib/arena/corrections-access';
import { NO_RANKED_BODY, NO_RANKED_TITLE } from '@/lib/arena/performance-texts';
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
  // Trophée de la liste affichée (manche ou cumul) + habillage de l'avatar par la distinction cumulée.
  const rows = leaderboardRows(source, Infinity, ctx.participant?.id ?? null).map(row => ({
    ...row,
    avatarDistinction: standings.standings.find(s => s.pseudo === row.pseudo)?.distinction ?? null,
  }));
  const totalMax = (round ? [round] : standings.countedRounds).reduce((a, r) => a + roundMaxScore(ctx.snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r)), 0);
  const effectif = cohort?.effectifManche ?? (standings.isFinal ? standings.effectifGeneral : standings.standings.filter(s => s.roundsPlayed > 0).length);
  const last = standings.countedRounds.length ? Math.max(...standings.countedRounds.map((r) => r.number)) : null;
  // Depuis le classement, le participant rejoint sa correction détaillée (manche close + résultats publiés).
  const correctionRounds = ctx.participant
    ? (round ? [round] : standings.countedRounds).filter((r) => correctionsAccess({ round: r, tournamentId: t.id, participant: ctx.participant }).allowed)
    : [];
  // §10 : personne n'atteint le seuil → aucun podium, message d'encouragement.
  const nobodyRanked = last ? (
    <div className="ev-board-nobody">
      <p className="ev-board-nobody-title">{NO_RANKED_TITLE}</p>
      {NO_RANKED_BODY.map((line, i) => <p key={line} className={i === NO_RANKED_BODY.length - 1 ? 'ev-gold' : undefined}>{line}</p>)}
    </div>
  ) : undefined;

  return (
    <ArenaPage nav={ctx.nav} immersive>
      <section className="ev-scores" aria-labelledby="ev-scores-title">
        <div className="ev-wrap ev-scores-wrap">
          <header className="ev-scores-head">
            <p className="ev-eyebrow"><span aria-hidden className="ev-rule" />{t.specialty}{t.edition_label ? ` · ${t.edition_label}` : ''}</p>
            <h1 id="ev-scores-title" className="ev-title-xl">Meilleurs <span className="ev-gold">scores</span></h1>
            <p>Classement cumulé, provisoire après chaque manche et final après la dernière. Les trophées Or, Argent et Bronze exigent le podium et un score d’au moins {t.distinction_pct} %.</p>
            <nav aria-label="Classements" className="ev-scores-tabs">
              <Link aria-current={!round ? 'page' : undefined} href={`/arena/${slug}/classement`}>{standings.isFinal ? 'Classement général' : 'Cumul provisoire'}</Link>
              {standings.countedRounds.map(r => <Link key={r.id} aria-current={r.id === round?.id ? 'page' : undefined} href={`/arena/${slug}/classement?manche=${r.number}`}>Manche {r.number}</Link>)}
            </nav>
          </header>
          {!t.leaderboard_enabled ? (
            <Notice>Le classement public n’est pas publié pour ce tournoi. Votre rang personnel reste visible dans votre espace.</Notice>
          ) : (
            <Leaderboard
              rows={rows}
              subtitle={round ? `Classement de la manche ${round.number}` : standings.isFinal ? 'Classement final (cumulé)' : last ? `Classement provisoire (cumulé) · après M${last}` : 'En attente de la première manche'}
              effectif={t.afficher_effectif_general ? effectif : undefined} general={standings.isFinal && !round} roundOnly={Boolean(round)}
              totalMax={totalMax}
              roundsCount={round ? 1 : standings.countedRounds.length}
              rulesHref={`/arena/${slug}/regles#classement`}
              emptyMessage={nobodyRanked}
              distinctionPct={t.distinction_pct}
            />
          )}
          {correctionRounds.length > 0 && (
            <section aria-labelledby="mes-corrections" className="ev-scores-corrections">
              <p id="mes-corrections" className="ev-eyebrow"><span aria-hidden className="ev-rule" />Ma correction détaillée</p>
              <p>Vos réponses face aux réponses attendues, avec les explications, les pièges et les erreurs les plus fréquentes. Consultable à tout moment dans votre espace.</p>
              <div>
                {correctionRounds.map((r) => (
                  <Link key={r.id} className="ev-btn ev-btn--gold ev-btn--sm ev-btn--square" href={`/arena/${slug}/manche/${r.number}/corrections`}>
                    <FileText aria-hidden />
                    <span>Voir ma correction détaillée{correctionRounds.length > 1 || !round ? ` · manche ${r.number}` : ''}</span>
                    <ArrowRight aria-hidden />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </ArenaPage>
  );
}
