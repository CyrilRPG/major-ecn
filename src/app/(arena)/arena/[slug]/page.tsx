import { ArenaPage } from '@/components/arena/arena-shell';
import { Container } from '@/components/arena/arena-ui';
import { BODY, CAPS, ARENA, HEADLINE } from '@/components/arena/tokens';
import { Leaderboard } from '@/components/arena/leaderboard';
import { Stadium } from '@/components/arena/stadium';
import { LandingBareme, type BaremeCard } from '@/components/arena/landing/bareme-board';
import { LandingChrono } from '@/components/arena/landing/chrono';
import { LandingFinal } from '@/components/arena/landing/final';
import { LandingFormat } from '@/components/arena/landing/format';
import { ArenaFxStyles, Bib, StadiumScreen } from '@/components/arena/landing/fx';
import { LandingHero, type HeroState } from '@/components/arena/landing/hero';
import { LandingPillars } from '@/components/arena/landing/pillars';
import { LandingTrack, type TrackRound } from '@/components/arena/landing/track';
import { computeTournamentStandings, effectiveBareme, roundMaxScore } from '@/lib/arena/db';
import { leaderboardRows } from '@/lib/arena/ranking';
import { describeBareme } from '@/lib/arena/scoring';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { PUBLIC_RULES, WARNING_CONNECTION, WARNING_NATURE } from '@/lib/arena/texts';
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
 * Landing d'un tournoi (§8.1) — parcours « entrer dans l'arène » dans la DA
 * des maquettes : hero photo → piliers → la piste → le format → le
 * chronomètre → le barème → l'écran des Meilleurs scores → le règlement →
 * l'entrée finale. Contenu réel dans le HTML servi ; état en direct.
 */
export default async function TournamentLandingPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const sp = await searchParams;
  const ctx = await loadArenaPage(slug);
  const { snap, participant, nav } = ctx;
  const t = snap.tournament;
  const rounds = snap.rounds;
  const now = new Date();
  const base = `/arena/${slug}`;
  const inviteQuery = sp.i ? `?i=${encodeURIComponent(sp.i)}` : '';
  const registerHref = `${base}/inscription${inviteQuery}`;

  const openRound = rounds.find((r) => roundState(r, now) === 'open') ?? null;
  const nextRound = rounds.find((r) => roundState(r, now) === 'upcoming') ?? null;
  const finished = snap.status === 'finished';

  const heroState: HeroState = openRound && openRound.closes_at
    ? { kind: 'open', round: openRound.number, theme: openRound.theme, closesAt: openRound.closes_at }
    : nextRound && nextRound.opens_at
      ? { kind: 'upcoming', round: nextRound.number, theme: nextRound.theme, opensAt: nextRound.opens_at }
      : finished ? { kind: 'finished' } : { kind: 'unscheduled' };

  const primary = participant
    ? openRound ? { href: `${base}/manche/${openRound.number}`, label: `Jouer la manche ${openRound.number}` } : { href: `${base}/espace`, label: 'Ouvrir mon espace' }
    : ctx.registrationOpen ? { href: registerHref, label: 'S’inscrire au tournoi' } : { href: `${base}/classement`, label: 'Voir le classement final' };
  const secondary = participant ? { href: `${base}/espace#inviter`, label: 'Inviter un collègue' } : { href: `${base}/regles`, label: 'Lire les règles' };

  const standings = t.leaderboard_enabled ? await computeTournamentStandings(snap) : null;
  const board = standings ? leaderboardRows(standings.standings, t.leaderboard_size, participant?.id ?? null) : [];
  const totalMax = standings?.countedRounds.reduce((a, r) => a + roundMaxScore(snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r)), 0) ?? 0;
  const lastCounted = standings && standings.countedRounds.length ? Math.max(...standings.countedRounds.map((r) => r.number)) : null;

  const baremeRound = openRound ?? nextRound ?? rounds[0] ?? null;
  const bareme = baremeRound ? effectiveBareme(t, baremeRound) : t.bareme;
  const ns = qrpNs(baremeRound ? snap.questionsByRound.get(baremeRound.id) ?? [] : []);
  const cards: BaremeCard[] = (['QRM', 'QRU', 'QRP'] as const).map((k) => ({ type: k, ...describeBareme(k, bareme, ns) }));

  const trackRounds: TrackRound[] = rounds.map((r) => {
    const st = roundState(r, now);
    return {
      number: r.number, theme: r.theme, opensAt: r.opens_at, closesAt: r.closes_at, state: st,
      correctionsHref: st === 'closed' && r.results_published_at ? `${base}/manche/${r.number}/corrections` : null,
      playHref: st === 'open' ? (participant ? `${base}/manche/${r.number}` : registerHref) : null,
    };
  });

  const ticker = [
    `${rounds.length || 3} manches`, `${t.questions_per_round} questions`, `${t.round_duration_minutes} minutes`, 'Une seule tentative', 'Score cumulé', 'Barème annoncé',
    'Corrections après chaque manche', 'Pseudonyme public, identité privée', 'Aucune dotation', 'Entraînement ludique, pas un concours blanc',
  ];

  return (
    <ArenaPage nav={nav}>
      <ArenaFxStyles />
      <LandingHero
        specialty={t.specialty}
        edition={t.edition_label}
        rounds={rounds.length || 3}
        questions={t.questions_per_round}
        minutes={t.round_duration_minutes}
        introText={t.intro_text}
        state={heroState}
        primary={primary}
        secondary={secondary}
        tickerItems={ticker}
      />

      <LandingPillars />

      <LandingTrack
        rounds={trackRounds}
        cumulative="Chaque manche est ouverte 24 h. Les points de chaque manche jouée s’additionnent dans un score cumulé ; une manche manquée compte pour zéro. Le classement est provisoire après chaque manche, final après la dernière."
      />

      <LandingFormat
        rounds={rounds.length || 3}
        questions={t.questions_per_round}
        minutes={t.round_duration_minutes}
        minRounds={t.min_rounds_final}
        title="Court. Exigeant. Chaque réponse compte."
        lead={`Un format compétitif de ${t.round_duration_minutes} minutes, pensé pour des médecins : le barème est annoncé, le temps est compté, chaque validation est définitive.`}
      />

      <LandingChrono minutes={t.round_duration_minutes} questions={t.questions_per_round} />

      <LandingBareme
        cards={cards}
        roundLabel={baremeRound ? `Barème affiché : manche ${baremeRound.number}${baremeRound.bareme_locked_at ? ' (verrouillé)' : ''}.` : ''}
      />

      {/* MEILLEURS SCORES — écran de stade */}
      {t.leaderboard_enabled && (
        <section className="relative isolate overflow-hidden py-16 sm:py-24" style={{ background: `linear-gradient(180deg, ${ARENA.surface}, ${ARENA.bg})` }}>
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(228,0,43,0.20), transparent 65%)' }} />
          <Container>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-14">
              <div className="lg:sticky lg:top-10">
                <Bib>Le fil rouge</Bib>
                <h2 className="mt-4 text-[2.1rem] leading-[0.98] sm:text-[2.9rem] lg:text-[3.4rem]" style={{ ...CAPS, color: ARENA.text }}>Une position à défendre, <span style={{ color: ARENA.red }}>manche après manche.</span></h2>
                <p className="mt-4 text-[15px] leading-relaxed sm:text-base" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                  Le classement est cumulatif : provisoire après M1, cumulé après M2, final après M3. Il se gagne, se perd et se rattrape. Seul votre pseudonyme apparaît, jamais votre identité.
                </p>
              </div>
              <StadiumScreen title={standings?.isFinal ? 'Classement final' : lastCounted ? `Classement provisoire cumulé · après M${lastCounted}` : 'Le tableau s’allume après la manche 1'}>
                <Leaderboard
                  rows={board}
                  subtitle={standings?.isFinal ? 'Classement final (cumulé)' : lastCounted ? `Classement provisoire (cumulé) · après M${lastCounted}` : 'Classement provisoire (cumulé)'}
                  totalMax={totalMax}
                  rulesHref={`${base}/regles#classement`}
                  emptyMessage={lastCounted ? 'Aucun participant n’atteint encore le seuil du classement.' : 'Le tableau s’allumera après la publication des résultats de la première manche.'}
                  flat
                />
              </StadiumScreen>
            </div>
          </Container>
        </section>
      )}

      {/* RÈGLEMENT — sur l'amphithéâtre */}
      <Stadium photo="amphitheatre" darken={0.7} tint={0.35} position="center 60%" className="py-16 sm:py-24">
        <section id="regles">
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <Bib>Règlement</Bib>
                <h2 className="mt-4 text-[2.1rem] leading-[0.98] sm:text-[2.9rem] lg:text-[3.4rem]" style={{ ...CAPS, color: ARENA.text }}>Les règles <span style={{ color: ARENA.red }}>de l’arène.</span></h2>
                <ol className="mt-8 space-y-3">
                  {PUBLIC_RULES.map((r, i) => (
                    <li key={i} className="flex gap-4 text-[14.5px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                      <span className="shrink-0 pt-0.5 text-[15px] leading-none" style={{ fontFamily: HEADLINE, color: ARENA.redSoft, letterSpacing: '0.06em' }}>{(i + 1).toString().padStart(2, '0')}</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(11,15,20,0.78)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}`, backdropFilter: 'blur(8px)' }}>
                <p className="text-[11px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.22em' }}>Nature du dispositif</p>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: BODY, color: ARENA.text }}>{WARNING_NATURE}</p>
                <p className="mt-7 text-[11px]" style={{ ...CAPS, color: ARENA.warn, letterSpacing: '0.22em' }}>Connexion</p>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: BODY, color: ARENA.text }}>{WARNING_CONNECTION}</p>
                <p className="mt-7 text-[11px]" style={{ ...CAPS, color: ARENA.textMuted, letterSpacing: '0.22em' }}>Après la clôture</p>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: BODY, color: ARENA.textSoft }}>
                  Chaque participant reçoit les corrections détaillées de la manche : réponses attendues, pièges de l’énoncé, erreurs les plus fréquentes et encadré méthodologique. C’est la contrepartie de la participation.
                </p>
              </div>
            </div>
          </Container>
        </section>
      </Stadium>

      <LandingFinal
        eyebrow={`${t.edition_label || 'Édition en cours'} · ${t.specialty}`}
        primary={primary}
        secondary={secondary}
        note={`Prénom, nom, email, spécialité et pseudonyme. Un email de confirmation, puis rendez-vous ${rounds[0]?.opens_at ? 'à l’ouverture de la manche 1' : 'à l’ouverture de la première manche'}.`}
      />
    </ArenaPage>
  );
}
