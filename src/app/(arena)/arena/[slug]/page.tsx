import { ArenaBackdropPhoto } from '@/components/arena/arena-backdrop';
import { ArenaPage } from '@/components/arena/arena-shell';
import { Container } from '@/components/arena/arena-ui';
import { ARENA, BODY, CAPS, HEADLINE, PHOTOS } from '@/components/arena/tokens';
import { Stadium } from '@/components/arena/stadium';
import { LandingBareme, type BaremeCard } from '@/components/arena/landing/bareme-board';
import { LandingCorrections } from '@/components/arena/landing/corrections';
import { ArenaFxStyles, GoldEyebrow, Reveal } from '@/components/arena/landing/fx';
import { LandingHero, type HeroState } from '@/components/arena/landing/hero';
import { LandingRounds, type RoundCard } from '@/components/arena/landing/rounds';
import { LandingSteps } from '@/components/arena/landing/steps';
import { TournamentPicker } from '@/components/arena/landing/tournament-picker';
import { loadTournamentCards } from '@/lib/arena/cards-data';
import { computeTournamentStandings, effectiveBareme, roundMaxScore } from '@/lib/arena/db';
import { leaderboardRows } from '@/lib/arena/ranking';
import { describeBareme } from '@/lib/arena/scoring';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { publicRules, WARNING_CONNECTION, WARNING_NATURE } from '@/lib/arena/texts';
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

  const roundCards: RoundCard[] = rounds.map((r) => {
    const st = roundState(r, now);
    return {
      number: r.number, theme: r.theme, opensAt: r.opens_at, closesAt: r.closes_at, state: st,
      href: st === 'open' ? (participant ? `${base}/manche/${r.number}` : registerHref) : st === 'closed' && r.results_published_at ? `${base}/manche/${r.number}/corrections` : null,
    };
  });

  return (
    <ArenaPage nav={nav}>
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
      <TournamentPicker groups={await loadTournamentCards(now)} currentSlug={slug} calendarHref={`${base}#manches`} source={`arena:${slug}`} />

      <LandingSteps questions={formatQuestions} secondsPerQuestion={t.seconds_per_question} />

      <LandingRounds
        rounds={roundCards}
        rulesHref={`${base}/regles`}
        leaderboardHref={`${base}/classement`}
        board={board}
        boardSubtitle={standings?.isFinal ? 'Classement final (cumulé)' : lastCounted ? `Classement provisoire (cumulé) · après M${lastCounted}` : 'Classement provisoire (cumulé)'}
        totalMax={totalMax}
        boardEmpty={lastCounted ? 'Aucun participant n’atteint encore le seuil du classement.' : 'Le tableau s’allumera après la publication des résultats de la première manche.'}
        leaderboardEnabled={t.leaderboard_enabled}
        general={standings?.isFinal} effectif={standings?.isFinal ? standings.effectifGeneral : undefined}
      />

      <LandingCorrections specialty={t.specialty} href={`${base}/regles`} />

      <LandingBareme
        cards={cards}
        roundLabel={baremeRound ? `Barème affiché : manche ${baremeRound.number}${baremeRound.bareme_locked_at ? ' (verrouillé)' : ''}.` : ''}
      />

      {/* RÈGLEMENT — sur l'amphithéâtre */}
      <Stadium photo="amphitheatre" darken={0.7} tint={0.35} position="center 60%" className="py-16 sm:py-24">
        <section id="regles">
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <GoldEyebrow>Règlement</GoldEyebrow>
                <h2 className="mt-4 text-[2.1rem] leading-[0.98] sm:text-[2.9rem] lg:text-[3.4rem]" style={{ ...CAPS, color: ARENA.text }}>Les règles <span style={{ color: ARENA.red }}>de l’arène.</span></h2>
                <ol className="mt-8 space-y-3">
                  {publicRules(t).map((r: string, i: number) => (
                    <li key={i} className="flex gap-4 text-[14.5px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                      <span className="shrink-0 pt-0.5 text-[15px] leading-none" style={{ fontFamily: HEADLINE, color: ARENA.gold, letterSpacing: '0.06em' }}>{(i + 1).toString().padStart(2, '0')}</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <Reveal delay={0.15}>
              <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(11,15,20,0.78)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}, 0 0 0 1px rgba(212,169,74,0.12)`, backdropFilter: 'blur(8px)' }}>
                <p className="text-[11px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.22em' }}>Nature du dispositif</p>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: BODY, color: ARENA.text }}>{WARNING_NATURE}</p>
                <p className="mt-7 text-[11px]" style={{ ...CAPS, color: ARENA.gold, letterSpacing: '0.22em' }}>Connexion</p>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: BODY, color: ARENA.text }}>{WARNING_CONNECTION}</p>
                <p className="mt-7 text-[11px]" style={{ ...CAPS, color: ARENA.textMuted, letterSpacing: '0.22em' }}>Le score est cumulatif</p>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: BODY, color: ARENA.textSoft }}>
                  Chaque manche jouée ajoute ses points à votre total ; une manche non jouée compte pour zéro. Le classement se lit sur ce total, provisoire après M1 et M2, final après M3, avec au moins {t.min_rounds_final} manches jouées.
                </p>
              </div>
              </Reveal>
            </div>
          </Container>
        </section>
      </Stadium>
    </ArenaPage>
  );
}
