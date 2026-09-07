import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AlertTriangle, ArrowRight, Ban, CalendarClock, Clock3, ListChecks, LockKeyhole, Wifi } from 'lucide-react';
import { ArenaLogoStack } from '@/components/arena/arena-logo';
import { ArenaPage, Notice, Panel } from '@/components/arena/arena-shell';
import { BigScore, Container } from '@/components/arena/arena-ui';
import { buttonClass, buttonStyle } from '@/components/arena/tokens';
import { Countdown, LocalTime } from '@/components/arena/countdown';
import { RoundRunner } from '@/components/arena/round-runner';
import { RestartPreviewButton, StartRoundButton } from '@/components/arena/start-round-button';
import { Stadium } from '@/components/arena/stadium';
import { ARENA, BODY, CAPS, DISPLAY, HEADLINE, TABULAR } from '@/components/arena/tokens';
import { computeTournamentStandings, effectiveBareme, getAttempt, getPreviewAttempt, listAnswers, roundDuration, roundMaxScore } from '@/lib/arena/db';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { describeBareme, MODE_LABEL } from '@/lib/arena/scoring';
import { UNDER_THRESHOLD_MESSAGE, WARNING_CONNECTION, buttonTruncated, warningTruncated } from '@/lib/arena/texts';
import { clockLabel, minutesLabel, roundState, toDate } from '@/lib/arena/time';
import { qrpNs, toPublicQuestion } from '@/lib/arena/types';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string; n: string }>; searchParams: Promise<{ preview?: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug, n } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: `Manche ${n}`, noindex: true });
}

const fr = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
const ordinal = (r: number) => `${r}${r === 1 ? 'er' : 'e'}`;

/**
 * Manche (§3.4, maquettes 3 → 6) : « Avant » (thème, horaires, règles de la
 * manche, barème, avertissements, bouton), « Pendant » (RoundRunner), « Après »
 * (score de la manche, cumul, rang si seuil atteint, prochaine manche). Mode
 * prévisualisation pour le personnel (§15.2) via `?preview=1`, à tout statut.
 */
export default async function RoundPage({ params, searchParams }: Params) {
  const { slug, n } = await params;
  const { preview: previewParam } = await searchParams;
  const number = Number(n);
  if (!Number.isInteger(number)) notFound();
  const wantPreview = previewParam === '1';
  const ctx = await loadArenaPage(slug, { preview: wantPreview });
  const preview = wantPreview && Boolean(ctx.staff);
  if (wantPreview && !ctx.staff) redirect(`/arena/${slug}/manche/${number}`);
  if (!preview && !ctx.participant) redirect('/arena/connexion');

  const t = ctx.snap.tournament;
  const round = ctx.snap.rounds.find((r) => r.number === number);
  if (!round) notFound();
  const total = ctx.snap.rounds.length;
  const now = new Date();
  const base = `/arena/${slug}`;
  const state = roundState(round, now);
  const bareme = effectiveBareme(t, round);
  const questions = (ctx.snap.questionsByRound.get(round.id) ?? []).filter((q) => !q.neutralized_at);
  const duration = roundDuration(t, round);
  const ns = qrpNs(questions);

  const attempt = preview ? await getPreviewAttempt(round.id, ctx.staff!.id) : await getAttempt(round.id, ctx.participant!.id);
  const nav = ctx.nav;

  /* ---------- Pendant (maquette 4) ---------- */
  if (attempt && attempt.status === 'in_progress' && new Date(attempt.deadline_at).getTime() > now.getTime()) {
    const answers = await listAnswers(attempt.id);
    const ordered = attempt.question_order.map((id) => questions.find((q) => q.id === id)).filter((q): q is NonNullable<typeof q> => Boolean(q));
    const totalSeconds = Math.max(60, Math.round((new Date(attempt.deadline_at).getTime() - new Date(attempt.started_at).getTime()) / 1000));
    return (
      <ArenaPage nav={nav} bare>
        <Stadium photo="lightsFog" darken={0.55} tint={0.1} className="min-h-[calc(100svh-4.5rem)] py-6 sm:py-10">
          <Container className="max-w-3xl">
            <RoundRunner
              attemptId={attempt.id}
              deadlineIso={attempt.deadline_at}
              totalSeconds={totalSeconds}
              questions={ordered.map(toPublicQuestion)}
              answeredIds={answers.map((a) => a.question_id)}
              baremeLabel={{ QRM: MODE_LABEL[bareme.QRM.mode], QRU: MODE_LABEL[bareme.QRU.mode], QRP: MODE_LABEL[bareme.QRP.mode] }}
              roundNumber={number}
              roundTheme={round.theme}
              preview={preview}
            />
            <p className="mt-4 text-center text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{WARNING_CONNECTION}</p>
          </Container>
        </Stadium>
      </ArenaPage>
    );
  }

  /* ---------- Après (maquettes 5 et 6) ---------- */
  if (attempt) {
    let a = attempt;
    if (a.status === 'in_progress') {
      const { finalizeAttempt } = await import('@/lib/arena/grading');
      a = (await finalizeAttempt(a.id, 'expired', now)) ?? a;
    }
    const max = roundMaxScore(questions, bareme);
    const standings = preview ? null : await computeTournamentStandings(ctx.snap);
    const me = standings?.standings.find((s) => s.participantId === ctx.participant!.id) ?? null;
    const cumulMax = standings ? standings.countedRounds.reduce((s, r) => s + roundMaxScore(ctx.snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r)), 0) : 0;
    const next = ctx.snap.rounds.find((r) => r.number === number + 1) ?? null;
    const isLast = !next;
    const published = Boolean(round.results_published_at) && Boolean(standings && standings.countedRounds.length > 0);
    const score = Number(a.score ?? 0);
    const strong = max > 0 && score / max >= 0.5;

    return (
      <ArenaPage nav={nav}>
        <Stadium photo="floodlights" darken={0.55} tint={0.22} position="center 30%" className="py-10 sm:py-16">
          <Container className="max-w-2xl">
            <div className="rounded-[1.6rem] px-6 py-9 text-center sm:px-10" style={{ background: 'rgba(11,15,20,0.84)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}, 0 50px 100px -40px rgba(0,0,0,0.95)`, backdropFilter: 'blur(10px)' }}>
              {preview && <div className="mb-6 text-left"><Notice tone="amber">Mode prévisualisation — aucun score n’est enregistré. Le classement n’est pas calculé pour une tentative de prévisualisation.</Notice></div>}
              <ArenaLogoStack size="sm" />
              <p className="mt-6 text-[1.4rem] leading-none sm:text-[1.7rem]" style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.12em' }}>
                Manche {number} / {total} terminée
              </p>
              {round.theme && <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{round.theme}</p>}

              <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Votre score sur la manche</p>
              <div className="mt-2"><BigScore value={fr(score)} max={fr(max)} color={strong ? ARENA.ok : ARENA.redSoft} size="xl" /></div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[12.5px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                <span><span style={{ ...TABULAR, color: ARENA.text }}>{a.perfect_count ?? 0}</span> / {questions.length} réponses parfaites</span>
                <span>temps <span style={{ ...TABULAR, color: ARENA.text }}>{clockLabel(a.duration_seconds ?? 0)}</span>{a.truncated ? ' (fenêtre réduite, exclue du temps moyen)' : ''}</span>
              </div>
              {a.status === 'expired' && <p className="mt-3 text-[12.5px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Temps écoulé : la manche a été clôturée automatiquement, vos réponses validées sont conservées.</p>}

              {!preview && (
                <div className="mt-8 rounded-2xl px-5 py-5" style={{ background: 'rgba(255,255,255,0.03)', boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
                  {published && standings ? (
                    <>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Score cumulé</p>
                      <div className="mt-1"><BigScore value={fr(me?.totalScore ?? 0)} max={fr(cumulMax)} color={ARENA.text} size="md" /></div>
                      {me?.rank ? (
                        <>
                          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Classement cumulatif {standings.isFinal ? 'final' : 'provisoire'}</p>
                          <p className="mt-1 text-[3.4rem] leading-none" style={{ fontFamily: HEADLINE, color: ARENA.ok, letterSpacing: '0.04em' }}>{ordinal(me.rank)}</p>
                        </>
                      ) : (
                        <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{UNDER_THRESHOLD_MESSAGE}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-[14px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                      Le score cumulé et le classement sont publiés à la clôture de la manche{round.closes_at ? <>, le <LocalTime iso={round.closes_at} /></> : ''}.
                    </p>
                  )}
                  <p className="mt-4 text-[12.5px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Les corrections détaillées vous seront envoyées à la clôture de la manche.</p>
                </div>
              )}

              {next && (
                <div className="mt-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Prochaine manche</p>
                  <p className="mt-1 text-[1.3rem] leading-tight" style={{ ...CAPS, color: ARENA.text }}>{next.theme || `Manche ${next.number}`}</p>
                  <p className="mt-1 text-[13px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{next.opens_at ? <LocalTime iso={next.opens_at} withYear /> : 'Date annoncée prochainement'}</p>
                </div>
              )}
              {isLast && <p className="mt-6 text-[13.5px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>C’était la dernière manche : le classement final est publié après la clôture.</p>}

              <div className="mt-8 flex flex-col items-center gap-3">
                {preview ? (
                  <RestartPreviewButton slug={slug} roundNumber={number} />
                ) : (
                  <Link href={`${base}/espace`} className={`${buttonClass('primary', 'lg')} w-full sm:w-auto`} style={buttonStyle('primary')}>Voir mon récap <ArrowRight className="h-5 w-5" /></Link>
                )}
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px]" style={{ fontFamily: BODY }}>
                  {published && <Link href={`${base}/manche/${number}/corrections${preview ? '?preview=1' : ''}`} className="font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>Consulter les corrections</Link>}
                  {!preview && <Link href={`${base}/espace#inviter`} className="font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.textSoft }}>Inviter un collègue</Link>}
                </div>
              </div>
            </div>
          </Container>
        </Stadium>
      </ArenaPage>
    );
  }

  /* ---------- Avant (maquette 3) ---------- */
  const opens = toDate(round.opens_at);
  const closes = toDate(round.closes_at);
  const remainingSec = closes ? Math.max(0, Math.floor((closes.getTime() - now.getTime()) / 1000)) : duration * 60;
  const truncated = !preview && remainingSec < duration * 60;
  const gateBlocked = !preview && state !== 'open';
  const rules = [
    { icon: ListChecks, text: `${questions.length || t.questions_per_round} questions` },
    { icon: Clock3, text: `${duration} minutes` },
    { icon: LockKeyhole, text: 'Une seule tentative' },
    { icon: Ban, text: 'Pas de retour en arrière' },
  ];

  return (
    <ArenaPage nav={nav}>
      <Stadium photo="floodlights" darken={0.58} tint={0.25} position="center 30%" className="py-10 sm:py-16">
        <Container className="max-w-2xl">
          <div className="overflow-hidden rounded-[1.6rem]" style={{ background: 'rgba(11,15,20,0.86)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}, 0 50px 100px -40px rgba(0,0,0,0.95)`, backdropFilter: 'blur(10px)' }}>
            <div className="px-6 pt-8 text-center sm:px-10">
              <p className="text-[12px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.3em' }}>Manche {number} / {total}</p>
              <h1 className="mt-2 text-[2.2rem] leading-[0.98] sm:text-[3rem]" style={{ ...CAPS, color: ARENA.text }}>{round.theme || `Manche ${number}`}</h1>
              <div className="mx-auto mt-5 grid max-w-md gap-2 text-left">
                <p className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13.5px]" style={{ background: 'rgba(255,255,255,0.04)', boxShadow: `inset 0 0 0 1px ${ARENA.line}`, fontFamily: BODY }}>
                  <CalendarClock className="h-4 w-4 shrink-0" style={{ color: ARENA.redSoft }} />
                  <span><span style={{ color: ARENA.textMuted }}>Ouverture :</span> <span style={{ color: ARENA.text }}>{opens ? <LocalTime iso={round.opens_at as string} withYear /> : 'annoncée prochainement'}</span></span>
                </p>
                <p className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13.5px]" style={{ background: 'rgba(255,255,255,0.04)', boxShadow: `inset 0 0 0 1px ${ARENA.line}`, fontFamily: BODY }}>
                  <CalendarClock className="h-4 w-4 shrink-0" style={{ color: ARENA.redSoft }} />
                  <span><span style={{ color: ARENA.textMuted }}>Fermeture :</span> <span style={{ color: ARENA.text }}>{closes ? <LocalTime iso={round.closes_at as string} withYear /> : 'annoncée prochainement'}</span></span>
                </p>
              </div>
            </div>

            <div className="px-6 pb-8 pt-7 sm:px-10">
              {gateBlocked ? (
                <div className="space-y-4">
                  {state === 'upcoming' && round.opens_at ? (
                    <Panel accent><Countdown target={round.opens_at} label="La manche ouvre dans" big /></Panel>
                  ) : state === 'closed' ? (
                    <Notice>Cette manche est clôturée.{round.results_published_at && <> <Link href={`${base}/manche/${number}/corrections`} className="font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>Consulter les corrections</Link></>}</Notice>
                  ) : (
                    <Notice>Cette manche n’est pas encore programmée.</Notice>
                  )}
                </div>
              ) : (
                <>
                  <div className="rounded-2xl p-5" style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
                    <p className="text-[11px]" style={{ ...CAPS, color: ARENA.warn, letterSpacing: '0.24em' }}>Règles de la manche</p>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {rules.map((r) => (
                        <li key={r.text} className="flex items-center gap-3 text-[14px]" style={{ color: ARENA.text, fontFamily: BODY }}>
                          <r.icon className="h-4 w-4 shrink-0" style={{ color: ARENA.textMuted }} /> {r.text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 rounded-2xl p-5" style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
                    <p className="text-[11px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.24em' }}>Barème applicable{round.bareme_locked_at ? ' · verrouillé' : ''}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {(['QRM', 'QRU', 'QRP'] as const).map((k) => {
                        const d = describeBareme(k, bareme, ns);
                        return (
                          <div key={k}>
                            <p className="flex items-baseline gap-2"><span className="text-[1.6rem] leading-none" style={{ fontFamily: HEADLINE, color: ARENA.text, letterSpacing: '0.04em' }}>{k}</span><span className="text-[10.5px] uppercase tracking-[0.12em]" style={{ color: ARENA.textMuted, fontFamily: DISPLAY }}>{d.title}</span></p>
                            <ul className="mt-1.5 space-y-1">
                              {d.lines.map((l) => <li key={l.situation} className="flex justify-between gap-2 text-[12px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}><span>{l.situation}</span><span style={{ ...TABULAR, color: ARENA.text }}>{l.points}</span></li>)}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-[11.5px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Réponses indispensables et inacceptables prioritaires sur le barème · une question par écran · validation irréversible · sauvegarde immédiate · soumission automatique à l’expiration.</p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {truncated ? (
                      <Notice tone="red" icon={<AlertTriangle className="h-4 w-4" style={{ color: ARENA.redSoft }} />}><strong>Attention :</strong> {warningTruncated(minutesLabel(remainingSec)).replace(/^Attention : /, '')}</Notice>
                    ) : (
                      <Notice tone="red" icon={<AlertTriangle className="h-4 w-4" style={{ color: ARENA.redSoft }} />}><strong>Attention :</strong> une fois la partie lancée, le chronomètre démarre et ne peut pas être arrêté. Assurez-vous d’avoir {duration} minutes disponibles.</Notice>
                    )}
                    <Notice tone="amber" icon={<Wifi className="h-4 w-4" style={{ color: ARENA.warn }} />}><strong>Qualité de connexion recommandée :</strong> {WARNING_CONNECTION}</Notice>
                    {preview && <Notice tone="amber">Mode prévisualisation — aucun score n’est enregistré, aucune statistique, aucun email. Rejouable autant de fois que nécessaire.</Notice>}
                    {questions.length === 0 ? (
                      <Notice>Cette manche ne contient pas encore de questions.</Notice>
                    ) : (
                      <StartRoundButton slug={slug} roundNumber={number} preview={preview} label={truncated ? buttonTruncated(Math.max(1, Math.floor(remainingSec / 60))) : 'Commencer la manche'} />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Container>
      </Stadium>
    </ArenaPage>
  );
}
