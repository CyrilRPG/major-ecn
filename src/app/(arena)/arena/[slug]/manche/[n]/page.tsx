import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArenaPage, Notice } from "@/components/arena/arena-shell";
import { RoundLobby } from "@/components/arena/round-lobby";
import {
  MissedRound,
  RoundResults,
  type NextRound,
} from "@/components/arena/round-results";
import { RoundRunner } from "@/components/arena/round-runner";
import {
  RestartPreviewButton,
  StartRoundButton,
} from "@/components/arena/start-round-button";
import {
  arenaDb,
  computeTournamentStandings,
  effectiveBareme,
  getAttempt,
  getPreviewAttempt,
  listAnswers,
  listQuestionMarks,
  roundDuration,
  roundMaxScore,
} from "@/lib/arena/db";
import { arenaMetadata, loadArenaPage } from "@/lib/arena/page-context";
import { MODE_LABEL } from "@/lib/arena/scoring";
import {
  UNDER_THRESHOLD_MESSAGE,
  buttonTruncated,
  warningTruncated,
} from "@/lib/arena/texts";
import { minutesLabel, roundState, toDate } from "@/lib/arena/time";
import { qrpNs, toPublicQuestion } from "@/lib/arena/types";
import { resultBreakdown } from "@/lib/arena/result-summary";

export const dynamic = "force-dynamic";
type Params = {
  params: Promise<{ slug: string; n: string }>;
  searchParams: Promise<{ preview?: string }>;
};
export async function generateMetadata({ params }: Params) {
  const { slug, n } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: "Manche " + n, noindex: true });
}

export default async function RoundPage({ params, searchParams }: Params) {
  const { slug, n } = await params;
  const { preview: previewParam } = await searchParams;
  const number = Number(n);
  if (!Number.isInteger(number)) notFound();
  const wantPreview = previewParam === "1";
  const ctx = await loadArenaPage(slug, { preview: wantPreview });
  const preview = wantPreview && Boolean(ctx.staff);
  if (wantPreview && !ctx.staff)
    redirect("/arena/" + slug + "/manche/" + number);
  if (!preview && !ctx.participant) redirect("/arena/connexion");
  const t = ctx.snap.tournament;
  const round = ctx.snap.rounds.find((r) => r.number === number);
  if (!round) notFound();
  const total = ctx.snap.rounds.length;
  const now = new Date();
  const base = "/arena/" + slug;
  const state = roundState(round, now);
  const bareme = effectiveBareme(t, round);
  const questions = (ctx.snap.questionsByRound.get(round.id) ?? []).filter(
    (q) => !q.neutralized_at,
  );
  const duration = roundDuration(t, round, questions);
  const attempt = preview
    ? await getPreviewAttempt(round.id, ctx.staff!.id)
    : await getAttempt(round.id, ctx.participant!.id);
  const nav = ctx.nav;
  const nextRow = ctx.snap.rounds.find((r) => r.number > number) ?? null;
  const nextQuestions = nextRow
    ? (ctx.snap.questionsByRound.get(nextRow.id) ?? []).filter(
        (q) => !q.neutralized_at,
      )
    : [];
  const next: NextRound | null = nextRow
    ? {
        ...nextRow,
        questionCount: nextQuestions.length,
        max: roundMaxScore(nextQuestions, effectiveBareme(t, nextRow)),
        duration: roundDuration(t, nextRow, nextQuestions),
      }
    : null;
  const correctionsAvailable =
    preview || (state === "closed" && Boolean(round.results_published_at));

  if (
    attempt &&
    attempt.status === "in_progress" &&
    new Date(attempt.deadline_at).getTime() > now.getTime()
  ) {
    const answers = await listAnswers(attempt.id);
    const ordered = attempt.question_order
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q));
    const lastValidated = answers.reduce<string | null>(
      (max, a) => (!max || a.validated_at > max ? a.validated_at : max),
      null,
    );
    return (
      <ArenaPage nav={nav} bare immersive>
        <div className="ae-question-wrap">
          <RoundRunner
            attemptId={attempt.id}
            deadlineIso={attempt.deadline_at}
            startedIso={attempt.started_at}
            lastValidatedIso={lastValidated}
            questions={ordered.map((q) =>
              toPublicQuestion(q, t.seconds_per_question),
            )}
            answeredIds={answers.map((a) => a.question_id)}
            markedIds={await listQuestionMarks(attempt.id)}
            baremeLabel={{
              QRM: MODE_LABEL[bareme.QRM.mode],
              QRU: MODE_LABEL[bareme.QRU.mode],
              QRP: MODE_LABEL[bareme.QRP.mode],
            }}
            roundNumber={number}
            roundTotal={total}
            roundTheme={round.theme}
            preview={preview}
          />
        </div>
      </ArenaPage>
    );
  }

  if (attempt) {
    let a = attempt;
    if (a.status === "in_progress") {
      const { finalizeAttempt } = await import("@/lib/arena/grading");
      a = (await finalizeAttempt(a.id, "expired", now)) ?? a;
    }
    const answers = await listAnswers(a.id);
    const restart = preview ? (
      <RestartPreviewButton slug={slug} roundNumber={number} />
    ) : undefined;
    const shared = { round, total, base, next, correctionsAvailable, preview };
    if (a.status === "expired" && answers.length === 0)
      return (
        <ArenaPage nav={nav} immersive>
          <MissedRound {...shared}>{restart}</MissedRound>
        </ArenaPage>
      );
    const standings = preview
      ? null
      : await computeTournamentStandings(ctx.snap);
    const me =
      standings?.byRound[round.id]?.standings.find(
        (s) => s.participantId === ctx.participant!.id,
      ) ?? null;
    const published = Boolean(round.results_published_at);
    const score = Number(a.score ?? 0);
    const max = roundMaxScore(questions, bareme);
    const counts = resultBreakdown(questions, answers);
    return (
      <ArenaPage nav={nav} immersive>
        <RoundResults
          {...shared}
          score={score}
          max={max}
          {...counts}
          durationSeconds={a.duration_seconds ?? 0}
          durationMinutes={duration}
          truncated={a.truncated}
          position={
            preview
              ? "Mode prévisualisation"
              : published && me?.rank
                ? me.rank + (me.rank === 1 ? "er" : "e") + " au classement"
                : published
                  ? "Poursuivez votre progression"
                  : "Classement à venir"
          }
          positionDetail={
            preview
              ? "Aucun classement ni score enregistré."
              : published && !me?.rank
                ? UNDER_THRESHOLD_MESSAGE
                : published
                  ? "Votre rang parmi les participants ayant disputé cette manche."
                  : "Le classement complet sera publié à la clôture de la manche."
          }
          weakTheme={max > 0 && score / max < 0.5 ? round.theme : null}
        >
          {restart}
          {standings?.isFinal && <Link className="ae-button mt-4" href={`${base}/espace`}>Voir mon bilan du tournoi →</Link>}
        </RoundResults>
      </ArenaPage>
    );
  }

  if (state === "closed" && !preview)
    return (
      <ArenaPage nav={nav} immersive>
        <MissedRound
          round={round}
          total={total}
          base={base}
          next={next}
          correctionsAvailable={correctionsAvailable}
          noAttempt
        />
      </ArenaPage>
    );
  const closes = toDate(round.closes_at);
  const remainingSec = closes
    ? Math.max(0, Math.floor((closes.getTime() - now.getTime()) / 1000))
    : duration * 60;
  const truncated = !preview && remainingSec < duration * 60;
  const gateBlocked = !preview && state !== "open";
  const { count } = await arenaDb()
    .from("arena_participants")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", t.id)
    .not("email_confirmed_at", "is", null)
    .is("blocked_at", null)
    .is("anonymized_at", null);
  return (
    <ArenaPage nav={nav} immersive>
      <RoundLobby
        slug={slug}
        round={round}
        rounds={ctx.snap.rounds}
        participant={nav.participant}
        questionCount={questions.length}
        duration={duration}
        bareme={bareme}
        ns={qrpNs(questions)}
        participantCount={count ?? 0}
        nowIso={now.toISOString()}
        preview={preview}
        notices={
          truncated && !gateBlocked ? (
            <Notice tone="amber">
              {warningTruncated(minutesLabel(remainingSec))}
            </Notice>
          ) : undefined
        }
      >
        {gateBlocked ? (
          <Notice>
            {state === "upcoming"
              ? "La manche sera accessible dès son ouverture."
              : "Cette manche n’est pas encore programmée."}{" "}
            <Link href={base + "/espace"} className="underline">
              Mon espace
            </Link>
          </Notice>
        ) : questions.length === 0 ? (
          <Notice>Cette manche ne contient pas encore de questions.</Notice>
        ) : (
          <StartRoundButton
            slug={slug}
            roundNumber={number}
            preview={preview}
            immersive
            label={
              truncated
                ? buttonTruncated(Math.max(1, Math.floor(remainingSec / 60)))
                : "Entrer dans l’arène — manche " + number
            }
          />
        )}
      </RoundLobby>
    </ArenaPage>
  );
}
