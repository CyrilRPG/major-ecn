import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ArenaBackdrop } from '@/components/arena/arena-backdrop';
import { ArenaPage, Notice, Panel } from '@/components/arena/arena-shell';
import { ARENA, ArenaButton, BODY, Container, DISPLAY, Eyebrow, Rise, SectionHead, TABULAR } from '@/components/arena/arena-ui';
import { Countdown, LocalTime } from '@/components/arena/countdown';
import { Leaderboard } from '@/components/arena/leaderboard';
import { computeTournamentStandings, effectiveBareme, roundMaxScore } from '@/lib/arena/db';
import { leaderboardRows } from '@/lib/arena/ranking';
import { describeBareme } from '@/lib/arena/scoring';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { PUBLIC_RULES, WARNING_CONNECTION, WARNING_NATURE } from '@/lib/arena/texts';
import { roundState, toDate } from '@/lib/arena/time';
import { qrpNs } from '@/lib/arena/types';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap);
}

/**
 * Landing d'un tournoi (§8.1) : contenu réel dans le HTML servi (règles,
 * principe, spécialité), état en direct (compte à rebours, manche ouverte,
 * classement), appels à l'inscription.
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
  const firstRound = rounds[0] ?? null;

  const standings = t.leaderboard_enabled ? await computeTournamentStandings(snap) : null;
  const board = standings ? leaderboardRows(standings.standings, t.leaderboard_size, participant?.id ?? null) : [];
  const totalMax = standings?.countedRounds.reduce((a, r) => a + roundMaxScore(snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r)), 0) ?? 0;

  const baremeRound = openRound ?? nextRound ?? firstRound;
  const bareme = baremeRound ? effectiveBareme(t, baremeRound) : t.bareme;
  const ns = qrpNs(baremeRound ? snap.questionsByRound.get(baremeRound.id) ?? [] : []);

  const primaryCta = participant
    ? openRound
      ? { href: `${base}/manche/${openRound.number}`, label: `Jouer la manche ${openRound.number}` }
      : { href: `${base}/espace`, label: 'Ouvrir mon espace' }
    : ctx.registrationOpen
      ? { href: registerHref, label: 'S’inscrire au tournoi' }
      : { href: `${base}/classement`, label: 'Voir le classement final' };

  return (
    <ArenaPage nav={nav}>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <ArenaBackdrop className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: `radial-gradient(ellipse 80% 70% at 50% 40%, transparent 30%, ${ARENA.bg} 95%), linear-gradient(180deg, transparent 70%, ${ARENA.bg} 100%)` }} />
        <Container className="pb-16 pt-12 sm:pb-24 sm:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            {sp.erreur === 'bloque' && <div className="mb-6"><Notice tone="red">Votre participation à ce tournoi a été suspendue. Contactez Major ECN pour toute question.</Notice></div>}
            <Eyebrow>Tournoi de QCM · {t.specialty}{t.edition_label ? ` · ${t.edition_label}` : ''}</Eyebrow>
            <h1 className="mt-6 text-[clamp(3.6rem,15vw,10rem)] font-extrabold leading-[0.9]" style={{ fontFamily: DISPLAY, letterSpacing: '-0.05em' }}>
              EVC
              <span className="block bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(100deg, ${ARENA.redSoft} 0%, ${ARENA.red} 50%, #FF6A3D 100%)` }}>ARENA</span>
            </h1>
            <div aria-hidden className="mx-auto mt-8 h-[3px] w-40 rounded-full sm:w-56" style={{ background: ARENA.red, boxShadow: '0 0 24px rgba(228,0,43,0.9)' }} />
            <p className="mx-auto mt-8 max-w-2xl text-[1.15rem] font-bold leading-snug sm:text-[1.5rem]" style={{ fontFamily: DISPLAY, letterSpacing: '-0.02em' }}>
              {rounds.length || 3} manches. {t.questions_per_round} questions. {t.round_duration_minutes} minutes.
              <span className="block" style={{ color: ARENA.textSoft }}>Une seule tentative — et un classement à défendre.</span>
            </p>
            {t.intro_text && <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{t.intro_text}</p>}

            {/* État en direct */}
            <div className="mx-auto mt-10 inline-block rounded-2xl px-5 py-5 sm:px-8" style={{ background: 'rgba(6,10,20,0.55)', backdropFilter: 'blur(10px)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}` }}>
              {openRound && openRound.closes_at ? (
                <>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>Manche {openRound.number} ouverte</p>
                  <p className="mt-2 text-2xl font-medium" style={TABULAR}><Countdown target={openRound.closes_at} label="Se termine dans" /></p>
                  <p className="mt-2 text-xs" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Clôture le <LocalTime iso={openRound.closes_at} /></p>
                </>
              ) : nextRound && nextRound.opens_at ? (
                <>
                  <Countdown target={nextRound.opens_at} label={`La manche ${nextRound.number} ouvre dans`} big />
                  <p className="mt-4 text-xs" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Ouverture le <LocalTime iso={nextRound.opens_at} />.</p>
                </>
              ) : finished ? (
                <p className="text-[15px] font-bold" style={{ fontFamily: DISPLAY }}>Tournoi terminé — classement final publié.</p>
              ) : (
                <p className="text-[15px] font-bold" style={{ fontFamily: DISPLAY }}>Dates des manches annoncées prochainement.</p>
              )}
            </div>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={primaryCta.href}><ArenaButton className="w-full sm:w-auto">{primaryCta.label} <ArrowRight className="h-4 w-4" /></ArenaButton></Link>
              <Link href={participant ? `${base}/espace#inviter` : `${base}/regles`}><ArenaButton variant="ghost" className="w-full sm:w-auto">{participant ? 'Inviter un collègue' : 'Lire les règles'}</ArenaButton></Link>
            </div>
            <p className="mt-4 text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
              Inscription ouverte pendant toute la durée du tournoi · pseudonyme public, identité privée · aucune dotation
            </p>
          </div>

          {/* Piste des manches */}
          {rounds.length > 0 && (
            <div className="mt-16 grid gap-3 sm:mt-20 sm:grid-cols-3">
              {rounds.map((r) => {
                const st = roundState(r, now);
                const chip = st === 'open' ? 'Ouverte' : st === 'closed' ? 'Clôturée' : st === 'upcoming' ? 'À venir' : 'Date à venir';
                const opens = toDate(r.opens_at);
                const closes = toDate(r.closes_at);
                return (
                  <div key={r.id} className="relative overflow-hidden rounded-2xl p-5" style={{ background: st === 'open' ? 'rgba(228,0,43,0.10)' : 'rgba(12,19,34,0.75)', boxShadow: `inset 0 0 0 1px ${st === 'open' ? 'rgba(228,0,43,0.45)' : ARENA.line}` }}>
                    <div className="flex items-start justify-between">
                      <span className="text-5xl leading-none" style={{ ...TABULAR, color: st === 'open' ? ARENA.redSoft : ARENA.textMuted, fontWeight: 500 }}>M{r.number}</span>
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ background: 'rgba(255,255,255,0.06)', color: ARENA.textSoft, fontFamily: BODY }}>{chip}</span>
                    </div>
                    <p className="mt-4 text-[15px] font-extrabold" style={{ fontFamily: DISPLAY, letterSpacing: '-0.01em' }}>
                      {opens && closes ? <LocalTime iso={r.opens_at as string} /> : 'Date annoncée prochainement'}
                    </p>
                    <p className="mt-1 text-[13px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{r.theme || `Thème annoncé avant la manche ${r.number}`}</p>
                    {st === 'closed' && r.results_published_at && (
                      <Link href={`${base}/manche/${r.number}/corrections`} className="mt-3 inline-block text-xs font-bold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft, fontFamily: BODY }}>Corrections</Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* FORMAT */}
      <section className="py-16 sm:py-24" style={{ borderTop: `1px solid ${ARENA.line}` }}>
        <Container>
          <Rise><SectionHead eyebrow="Le format" title="Court, exigeant, sans rattrapage." lead="Une parenthèse compétitive de quelques minutes, pensée pour des médecins seniors : le barème est annoncé, le temps est compté, chaque validation est définitive." /></Rise>
          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl lg:grid-cols-4" style={{ background: ARENA.line }}>
            {[
              { value: String(rounds.length || 3), label: 'manches', detail: 'Dates fixées par édition, chaque manche ouverte 24 h.' },
              { value: String(t.questions_per_round), label: 'questions', detail: 'QRM, QRU et QRP, une question par écran.' },
              { value: String(t.round_duration_minutes), label: 'minutes', detail: 'Chronomètre côté serveur, aucun retour en arrière.' },
              { value: '1', label: 'tentative', detail: `Par manche. ${t.min_rounds_final} manches suffisent pour figurer au classement final.` },
            ].map((f, i) => (
              <Rise key={f.label} delay={i * 0.06}>
                <div className="h-full p-6 sm:p-8" style={{ background: ARENA.surface }}>
                  <p className="text-[4rem] leading-none sm:text-[5.5rem]" style={{ ...TABULAR, fontWeight: 500 }}>{f.value}</p>
                  <p className="mt-2 text-sm font-extrabold uppercase tracking-[0.16em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>{f.label}</p>
                  <p className="mt-3 text-[13px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{f.detail}</p>
                </div>
              </Rise>
            ))}
          </div>
        </Container>
      </section>

      {/* BARÈME */}
      <section className="py-16 sm:py-24" style={{ borderTop: `1px solid ${ARENA.line}` }}>
        <Container>
          <Rise><SectionHead eyebrow="Barème annoncé avant chaque manche" title="Vous connaissez la règle avant de jouer votre manche." lead="Une correction par discordance et une correction tout ou rien appellent des stratégies opposées. Le barème retenu est affiché sur l’écran d’accueil de chaque manche et rappelé question par question." /></Rise>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {(['QRM', 'QRU', 'QRP'] as const).map((k, i) => {
              const d = describeBareme(k, bareme, ns);
              return (
                <Rise key={k} delay={i * 0.06}>
                  <div className="h-full rounded-2xl p-6" style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-extrabold" style={{ fontFamily: DISPLAY, letterSpacing: '-0.03em', color: ARENA.redSoft }}>{k}</span>
                      <span className="text-sm font-bold" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{d.title}</span>
                    </div>
                    <dl className="mt-5">
                      {d.lines.map((l) => (
                        <div key={l.situation} className="flex items-center justify-between gap-3 py-2" style={{ borderTop: `1px solid ${ARENA.line}` }}>
                          <dt className="text-[13px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{l.situation}</dt>
                          <dd className="shrink-0 text-base" style={{ ...TABULAR, fontWeight: 500 }}>{l.points}</dd>
                        </div>
                      ))}
                    </dl>
                    {d.notes.map((n) => <p key={n} className="mt-3 text-xs leading-relaxed" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{n}</p>)}
                  </div>
                </Rise>
              );
            })}
          </div>
        </Container>
      </section>

      {/* MEILLEURS SCORES */}
      {t.leaderboard_enabled && standings && standings.countedRounds.length > 0 && (
        <section className="py-16 sm:py-24" style={{ borderTop: `1px solid ${ARENA.line}` }}>
          <Container>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-14">
              <Rise className="lg:sticky lg:top-10">
                <SectionHead eyebrow="Le fil rouge" title="Une position à défendre, manche après manche." lead="Le classement est cumulatif : provisoire après M1, cumulé après M2, final après M3. Il se gagne, se perd et se rattrape. Seul votre pseudonyme apparaît." />
              </Rise>
              <Rise delay={0.1}>
                <Leaderboard
                  rows={board}
                  subtitle={standings.isFinal ? 'Classement final' : `Classement provisoire cumulé · après M${Math.max(...standings.countedRounds.map((r) => r.number))}`}
                  totalMax={totalMax}
                  rulesHref={`${base}/regles`}
                />
              </Rise>
            </div>
          </Container>
        </section>
      )}

      {/* RÈGLES */}
      <section id="regles" className="py-16 sm:py-24" style={{ borderTop: `1px solid ${ARENA.line}` }}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <Rise>
              <SectionHead eyebrow="Règles publiques" title="Les règles de l’arène." />
              <ol className="mt-8 space-y-3">
                {PUBLIC_RULES.map((r, i) => (
                  <li key={i} className="flex gap-4 text-[14px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                    <span className="shrink-0 pt-0.5 text-sm" style={{ ...TABULAR, color: ARENA.redSoft }}>{(i + 1).toString().padStart(2, '0')}</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ol>
            </Rise>
            <Rise delay={0.1}>
              <Panel>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Nature du dispositif</p>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: BODY }}>{WARNING_NATURE}</p>
                <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Connexion</p>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: BODY }}>{WARNING_CONNECTION}</p>
                <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Après la clôture</p>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: BODY }}>
                  Chaque participant reçoit les corrections détaillées de la manche : réponses attendues, pièges de l’énoncé, erreurs les plus fréquentes et encadré méthodologique. C’est la contrepartie de la participation.
                </p>
              </Panel>
            </Rise>
          </div>
        </Container>
      </section>

      {/* CTA FINAL */}
      <section className="relative isolate overflow-hidden py-20 sm:py-28" style={{ borderTop: `1px solid ${ARENA.line}` }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(228,0,43,0.28), transparent 70%)' }} />
        <Container>
          <Rise className="mx-auto max-w-3xl text-center">
            <Eyebrow>{t.edition_label || 'Édition en cours'} · {t.specialty}</Eyebrow>
            <h2 className="mt-5 text-[2.4rem] font-extrabold leading-[0.95] sm:text-[3.6rem] lg:text-[4.4rem]" style={{ fontFamily: DISPLAY, letterSpacing: '-0.045em' }}>Entrez dans l’arène.</h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed sm:text-base" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
              Prénom, nom, email, spécialité et pseudonyme. Un email de confirmation, puis rendez-vous {firstRound?.opens_at ? <>le <LocalTime iso={firstRound.opens_at} /></> : 'à l’ouverture de la première manche'}.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={primaryCta.href}><ArenaButton className="w-full sm:w-auto">{primaryCta.label} <ArrowRight className="h-4 w-4" /></ArenaButton></Link>
            </div>
          </Rise>
        </Container>
      </section>
    </ArenaPage>
  );
}
