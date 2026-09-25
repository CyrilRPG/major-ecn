import { ArenaBackdropPhoto } from '@/components/arena/arena-backdrop';
import { ArenaPage } from '@/components/arena/arena-shell';
import { PHOTOS } from '@/components/arena/tokens';
import { LandingBareme, LandingRulesTeaser, type BaremeCard } from '@/components/arena/landing/bareme-board';
import { LandingCorrections } from '@/components/arena/landing/corrections';
import { ArenaFxStyles } from '@/components/arena/landing/fx';
import { LandingHero, type HeroState } from '@/components/arena/landing/hero';
import { LandingRounds, type RoundCard } from '@/components/arena/landing/rounds';
import { LandingSteps } from '@/components/arena/landing/steps';
import { TournamentPicker } from '@/components/arena/landing/tournament-picker';
import { loadTournamentCards } from '@/lib/arena/cards-data';
import { computeTournamentStandings, effectiveBareme, listTournaments, roundMaxScore } from '@/lib/arena/db';
import { leaderboardRows } from '@/lib/arena/ranking';
import { NO_RANKED_BODY, NO_RANKED_TITLE } from '@/lib/arena/performance-texts';
import { describeBareme } from '@/lib/arena/scoring';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { correctionsAccess } from '@/lib/arena/corrections-access';
import { roundState } from '@/lib/arena/time';
import { qrpNs } from '@/lib/arena/types';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap);
}

/**
 * Landing d'un tournoi (§8.1), sur le modèle de page principale fourni par le
 * client (07/09/2026) : hero avec la manche en cours → 01 · 02 · 03 (clair) →
 * les manches et les Meilleurs scores → les corrections → le barème → le
 * règlement. Contenu réel dans le HTML servi ; état en direct.
 */
export default async function TournamentLandingPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const sp = await searchParams;
  const ctx = await loadArenaPage(slug);
  const { snap, participant, nav } = ctx;
  const t = snap.tournament;
  const rounds = snap.rounds;
  const questionCounts = rounds.map(r => (snap.questionsByRound.get(r.id) ?? []).filter(q => !q.neutralized_at).length);
  const formatQuestions = new Set(questionCounts).size > 1 ? questionCounts.join(' / ') : questionCounts[0] ?? t.questions_per_round;
  const now = new Date();
  const base = `/arena/${slug}`;
  const inviteQuery = sp.i ? `?i=${encodeURIComponent(sp.i)}` : '';
  const registerHref = `${base}/inscription${inviteQuery}`;

  const openRound = rounds.find((r) => roundState(r, now) === 'open') ?? null;
  const nextRound = rounds.find((r) => roundState(r, now) === 'upcoming') ?? null;
  const finished = snap.status === 'finished';

  const heroState: HeroState = openRound && openRound.closes_at
    ? { kind: 'open', round: openRound.number, theme: openRound.theme, opensAt: openRound.opens_at, closesAt: openRound.closes_at }
    : nextRound && nextRound.opens_at
      ? { kind: 'upcoming', round: nextRound.number, theme: nextRound.theme, opensAt: nextRound.opens_at }
      : finished ? { kind: 'finished' } : { kind: 'unscheduled' };

  const primary = participant
    ? openRound ? { href: `${base}/manche/${openRound.number}`, label: `Je joue la manche ${openRound.number}` } : { href: `${base}/espace`, label: 'Ouvrir mon espace' }
    : ctx.registrationOpen ? { href: registerHref, label: openRound ? `Je participe à la manche ${openRound.number}` : 'Je m’inscris au tournoi' } : t.leaderboard_enabled ? { href: `${base}/classement`, label: 'Voir les classements' } : { href: `${base}/regles`, label: 'Consulter les règles du tournoi' };

  const standings = t.leaderboard_enabled ? await computeTournamentStandings(snap) : null;
  const board = standings ? leaderboardRows(standings.standings, t.leaderboard_size, participant?.id ?? null) : [];
  const totalMax = standings?.countedRounds.reduce((a, r) => a + roundMaxScore(snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r)), 0) ?? 0;
  const lastCounted = standings && standings.countedRounds.length ? Math.max(...standings.countedRounds.map((r) => r.number)) : null;

  const baremeRound = openRound ?? nextRound ?? rounds[0] ?? null;
  const bareme = baremeRound ? effectiveBareme(t, baremeRound) : t.bareme;
  const ns = qrpNs(baremeRound ? snap.questionsByRound.get(baremeRound.id) ?? [] : []);
  const cards: BaremeCard[] = (['QRM', 'QRU', 'QRP'] as const).map((k) => ({ type: k, ...describeBareme(k, bareme, ns) }));

  const roundCards: RoundCard[] = rounds.map((r, i) => {
    const st = roundState(r, now);
    const own = (snap.questionsByRound.get(r.id) ?? []).filter((q) => !q.neutralized_at).some((q) => q.duration_seconds && q.duration_seconds !== t.seconds_per_question);
    return {
      number: r.number, theme: r.theme, opensAt: r.opens_at, closesAt: r.closes_at, state: st,
      questions: questionCounts[i], seconds: own ? null : t.seconds_per_question,
      href: st === 'open' ? (participant ? `${base}/manche/${r.number}` : registerHref) : st === 'closed' && r.results_published_at ? `${base}/manche/${r.number}/corrections` : null,
    };
  });

  // « Voir un exemple de correction » (maquette) : il n'existe pas d'exemple public ; le participant qui a
  // accès à ses corrections y va directement, les autres lisent la règle des corrections.
  const myCorrections = participant && rounds.some((r) => correctionsAccess({ round: r, tournamentId: t.id, participant, now }).allowed);
  const correctionsCta = myCorrections ? { href: `${base}/corrections`, label: 'Voir mes corrections' } : { href: `${base}/regles#regle-03`, label: 'Découvrir les corrections' };
  const editions = Object.fromEntries((await listTournaments()).map((x) => [x.slug, x.edition_label]));

  return (
    <ArenaPage nav={nav} immersive footer="details">
      {/* Landing du tournoi : l'image d'origine (médecin au Colisée) remplace la plaque commune. */}
      <ArenaBackdropPhoto src={PHOTOS.heroArena} srcMobile={PHOTOS.heroArenaMobile} veil="light" />
      <ArenaFxStyles />
      <LandingHero
        specialty={t.specialty}
        rounds={rounds.length || 3}
        questions={formatQuestions}
        secondsPerQuestion={t.seconds_per_question}
        minRounds={t.min_rounds_final}
        state={heroState}
        primary={primary}
        secondary={participant ? { href: `${base}/espace`, label: 'Ouvrir mon espace' } : { href: `${base}/regles`, label: 'Lire les règles' }}
        registrationOpen={ctx.registrationOpen && !participant}
      />

      {/* « Choisissez votre tournoi » (maquette client du 10/09/2026) : les
          autres arènes ouvertes ou à venir, juste sous le hero ; le reste de la
          page est inchangé. */}
      <TournamentPicker groups={await loadTournamentCards(now)} editions={editions} currentSlug={slug} calendarHref={`${base}#manches`} source={`arena:${slug}`} />

      <LandingSteps questions={questionCounts} seconds={[t.seconds_per_question]} />

      <LandingRounds
        rounds={roundCards}
        rulesHref={`${base}/regles`}
        leaderboardHref={`${base}/classement`}
        board={board}
        boardSubtitle={standings?.isFinal ? 'Classement final (cumulé)' : lastCounted ? `Classement provisoire (cumulé) · après M${lastCounted}` : 'Classement provisoire (cumulé)'}
        totalMax={totalMax}
        boardRounds={standings?.countedRounds.length ?? 1}
        boardEmpty={lastCounted ? `${NO_RANKED_TITLE}. ${NO_RANKED_BODY[0]} ${NO_RANKED_BODY[2]}` : 'Le tableau s’allumera après la publication des résultats de la première manche.'}
        leaderboardEnabled={t.leaderboard_enabled}
        distinctionPct={t.distinction_pct}
        general={standings?.isFinal} effectif={standings?.isFinal && t.afficher_effectif_general ? standings.effectifGeneral : undefined}
      />

      <LandingCorrections specialty={t.specialty} cta={correctionsCta} />

      <LandingRulesTeaser rulesHref={`${base}/regles`} />

      <LandingBareme
        cards={cards}
        roundLabel={baremeRound ? `Barème affiché : manche ${baremeRound.number}${baremeRound.bareme_locked_at ? ' (verrouillé)' : ''}.` : ''}
      />
    </ArenaPage>
  );
}
