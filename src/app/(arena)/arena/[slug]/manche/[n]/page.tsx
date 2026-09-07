import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Wifi } from 'lucide-react';
import { ArenaPage, Notice, Panel } from '@/components/arena/arena-shell';
import { Container, Eyebrow } from '@/components/arena/arena-ui';
import { ARENA, BODY, DISPLAY, TABULAR } from '@/components/arena/tokens';
import { Countdown, LocalTime } from '@/components/arena/countdown';
import { RoundRunner } from '@/components/arena/round-runner';
import { RestartPreviewButton, StartRoundButton } from '@/components/arena/start-round-button';
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

/**
 * Manche (§3.4) : « Avant » (thème, horaires, règles, barème, avertissements,
 * bouton), « Pendant » (RoundRunner), « Après » (score de manche, cumul, rang
 * si seuil atteint, prochaine manche). Mode prévisualisation pour le personnel
 * (§15.2) via `?preview=1`, à tout statut.
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
  const now = new Date();
  const base = `/arena/${slug}`;
  const state = roundState(round, now);
  const bareme = effectiveBareme(t, round);
  const questions = (ctx.snap.questionsByRound.get(round.id) ?? []).filter((q) => !q.neutralized_at);
  const duration = roundDuration(t, round);
  const ns = qrpNs(questions);

  const attempt = preview ? await getPreviewAttempt(round.id, ctx.staff!.id) : await getAttempt(round.id, ctx.participant!.id);

  const nav = ctx.nav;

  /* ---------- Pendant ---------- */
  if (attempt && attempt.status === 'in_progress' && new Date(attempt.deadline_at).getTime() > now.getTime()) {
    const answers = await listAnswers(attempt.id);
    const ordered = attempt.question_order.map((id) => questions.find((q) => q.id === id)).filter((q): q is NonNullable<typeof q> => Boolean(q));
    return (
      <ArenaPage nav={nav}>
        <Container className="max-w-3xl py-8 sm:py-12">
          <RoundRunner
            attemptId={attempt.id}
            deadlineIso={attempt.deadline_at}
            questions={ordered.map(toPublicQuestion)}
            answeredIds={answers.map((a) => a.question_id)}
            baremeLabel={{ QRM: MODE_LABEL[bareme.QRM.mode], QRU: MODE_LABEL[bareme.QRU.mode], QRP: MODE_LABEL[bareme.QRP.mode] }}
            roundNumber={number}
            preview={preview}
          />
          <p className="mt-4 text-center text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{WARNING_CONNECTION}</p>
        </Container>
      </ArenaPage>
    );
  }

  /* ---------- Après ---------- */
  if (attempt) {
    // Tentative expirée mais pas encore balayée : on la clôt maintenant pour afficher un résultat juste.
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
    const published = Boolean(round.results_published_at);
    return (
      <ArenaPage nav={nav}>
        <Container className="max-w-3xl py-10 sm:py-14">
          {preview && <div className="mb-6"><Notice tone="amber">Mode prévisualisation — aucun score n’est enregistré. Le classement n’est pas calculé pour une tentative de prévisualisation.</Notice></div>}
          <Eyebrow>Manche {number} terminée{round.theme ? ` · ${round.theme}` : ''}</Eyebrow>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Score de la manche</p>
              <p className="mt-1.5 text-6xl leading-none" style={{ ...TABULAR, color: ARENA.redSoft }}>{fr(Number(a.score ?? 0))}<span className="ml-2 text-xl" style={{ color: ARENA.textMuted }}>/ {fr(max)}</span></p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Réponses parfaites</p>
              <p className="mt-1.5 text-4xl leading-none" style={TABULAR}>{a.perfect_count ?? 0}<span className="ml-2 text-xl" style={{ color: ARENA.textMuted }}>/ {questions.length}</span></p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Temps de la manche</p>
              <p className="mt-1.5 text-4xl leading-none" style={TABULAR}>{clockLabel(a.duration_seconds ?? 0)}</p>
              {a.truncated && <p className="mt-1 text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Fenêtre réduite : exclue du temps moyen.</p>}
            </div>
          </div>
          {a.status === 'expired' && <div className="mt-6"><Notice>Temps écoulé : la manche a été clôturée automatiquement, vos réponses validées sont conservées.</Notice></div>}

          {!preview && (
            <Panel className="mt-8" accent>
              {published && standings && standings.countedRounds.length > 0 ? (
                me?.rank ? (
                  <p className="text-[15px]" style={{ fontFamily: BODY }}>
                    Score cumulé <strong>{fr(me.totalScore)} / {fr(cumulMax)}</strong> — <strong>{me.rank}{me.rank === 1 ? 'er' : 'e'}</strong> au classement {standings.isFinal ? 'final' : 'provisoire'}.
                  </p>
                ) : (
                  <>
                    <p className="text-[15px]" style={{ fontFamily: BODY }}>Score cumulé <strong>{fr(me?.totalScore ?? 0)} / {fr(cumulMax)}</strong>.</p>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{UNDER_THRESHOLD_MESSAGE}</p>
                  </>
                )
              ) : (
                <p className="text-[15px]" style={{ fontFamily: BODY }}>Le score cumulé et le classement sont publiés à la clôture de la manche{round.closes_at ? <>, le <LocalTime iso={round.closes_at} /></> : ''}. Les corrections détaillées suivent.</p>
              )}
              {next && (
                <p className="mt-3 text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                  Prochaine manche : M{next.number}{next.opens_at ? <> — <LocalTime iso={next.opens_at} withYear /></> : ''}{next.theme ? ` · ${next.theme}` : ''}.
                </p>
              )}
              {isLast && <p className="mt-3 text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>C’était la dernière manche : le classement final est publié après la clôture.</p>}
            </Panel>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {published && <Link href={`${base}/manche/${number}/corrections${preview ? '?preview=1' : ''}`} className="text-sm font-bold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft, fontFamily: BODY }}>Consulter les corrections</Link>}
            {preview ? <RestartPreviewButton slug={slug} roundNumber={number} /> : <Link href={`${base}/espace`} className="text-sm font-bold underline-offset-4 hover:underline" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Retour à mon espace</Link>}
            {!preview && <Link href={`${base}/espace#inviter`} className="text-sm font-bold underline-offset-4 hover:underline" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Inviter un collègue</Link>}
          </div>
        </Container>
      </ArenaPage>
    );
  }

  /* ---------- Avant ---------- */
  const opens = toDate(round.opens_at);
  const closes = toDate(round.closes_at);
  const remainingSec = closes ? Math.max(0, Math.floor((closes.getTime() - now.getTime()) / 1000)) : duration * 60;
  const truncated = !preview && remainingSec < duration * 60;
  const gateBlocked = !preview && state !== 'open';

  return (
    <ArenaPage nav={nav}>
      <Container className="max-w-3xl py-10 sm:py-14">
        <Eyebrow>Manche {number} · {t.specialty}</Eyebrow>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl" style={{ fontFamily: DISPLAY, letterSpacing: '-0.04em' }}>{round.theme || `Manche ${number}`}</h1>
        <p className="mt-3 text-[15px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          {opens && closes ? <>Ouverte du <LocalTime iso={round.opens_at as string} /> au <LocalTime iso={round.closes_at as string} />.</> : 'Dates annoncées prochainement.'}
        </p>

        {gateBlocked ? (
          <div className="mt-8 space-y-4">
            {state === 'upcoming' && round.opens_at ? (
              <Panel accent><Countdown target={round.opens_at} label="La manche ouvre dans" big /></Panel>
            ) : state === 'closed' ? (
              <Notice>Cette manche est clôturée.{round.results_published_at && <> <Link href={`${base}/manche/${number}/corrections`} className="font-bold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>Consulter les corrections</Link></>}</Notice>
            ) : (
              <Notice>Cette manche n’est pas encore programmée.</Notice>
            )}
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Panel><p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Questions</p><p className="mt-1 text-4xl" style={TABULAR}>{questions.length}</p></Panel>
              <Panel><p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Durée</p><p className="mt-1 text-4xl" style={TABULAR}>{clockLabel(Math.min(duration * 60, remainingSec))}</p></Panel>
              <Panel><p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Tentative</p><p className="mt-1 text-4xl" style={TABULAR}>1</p></Panel>
            </div>

            <h2 className="mt-10 text-xl font-extrabold" style={{ fontFamily: DISPLAY, letterSpacing: '-0.02em' }}>Barème applicable</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {(['QRM', 'QRU', 'QRP'] as const).map((k) => {
                const d = describeBareme(k, bareme, ns);
                return (
                  <div key={k} className="rounded-xl p-4" style={{ background: ARENA.raised, boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
                    <p className="text-sm font-extrabold" style={{ fontFamily: DISPLAY }}>{k} <span className="text-xs font-bold" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{d.title}</span></p>
                    <ul className="mt-2 space-y-1">
                      {d.lines.map((l) => <li key={l.situation} className="flex justify-between gap-2 text-[12.5px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}><span>{l.situation}</span><span style={{ ...TABULAR, color: ARENA.text }}>{l.points}</span></li>)}
                    </ul>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Une seule tentative · une question par écran · validation irréversible · sauvegarde immédiate de chaque réponse · soumission automatique à l’expiration.</p>

            <div className="mt-8 space-y-3">
              {truncated && <Notice tone="red">{warningTruncated(minutesLabel(remainingSec))}</Notice>}
              <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(228,0,43,0.08)', boxShadow: 'inset 0 0 0 1px rgba(228,0,43,0.25)' }}>
                <Wifi className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ARENA.redSoft }} />
                <p className="text-[13px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{WARNING_CONNECTION}</p>
              </div>
              {preview && <Notice tone="amber">Mode prévisualisation — aucun score n’est enregistré, aucune statistique, aucun email. Rejouable autant de fois que nécessaire.</Notice>}
              {questions.length === 0 ? (
                <Notice>Cette manche ne contient pas encore de questions.</Notice>
              ) : (
                <StartRoundButton slug={slug} roundNumber={number} preview={preview} label={truncated ? buttonTruncated(Math.max(1, Math.floor(remainingSec / 60))) : 'Commencer la manche'} />
              )}
            </div>
          </>
        )}
      </Container>
    </ArenaPage>
  );
}
