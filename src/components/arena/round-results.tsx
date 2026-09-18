import {
  ArenaBars as ChartNoAxesColumnIncreasing,
  ArenaTarget as Target,
} from "./experience-icons";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Brain,
  CalendarDays,
  CircleAlert,
  Clock3,
  Crown,
  FileText,
  Flame,
  Info,
  Medal,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { ArenaLogoStack } from "./arena-logo";
import { ArenaAvatar } from "./arena-avatar";
import { CalendarLink } from "./calendar-link";
import { PasserelleBlock } from "./passerelle-block";
import { arenaDate, type LobbyRound } from "./round-lobby";
import { NOTE_PAR_MANCHE, formatNote, noteSur10 } from "@/lib/arena/note";
import {
  DEFAULT_THRESHOLDS,
  DISTINCTION_LABEL,
  ordinalRank,
  outcomeVariant,
  thresholdNote,
  type Distinction,
  type PerformanceThresholds,
  type RoundOutcome,
} from "@/lib/arena/performance";
import { HIGH_PERFORMANCE_AXES, outcomeCopy } from "@/lib/arena/performance-texts";
import type { PasserelleContent } from "@/lib/arena/passerelle";
import "./result-outcome.css";

export type NextRound = LobbyRound & {
  questionCount: number;
  max: number;
  duration: number;
};
export type RoundResultsProps = {
  round: LobbyRound;
  total: number;
  base: string;
  next: NextRound | null;
  /** Correction détaillée consultable (manche close + résultats publiés, ou prévisualisation). */
  correctionsAvailable: boolean;
  /** Classement de la manche (null si le classement public est désactivé ou non publié). */
  leaderboardHref?: string | null;
  preview?: boolean;
  children?: ReactNode;
};

const time = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(iso))
    .replace(":", " h ");

function ResultHeader({
  round,
  total,
  missed = false,
}: {
  round: LobbyRound;
  total: number;
  missed?: boolean;
}) {
  return (
    <header className="ae-result-header">
      <ArenaLogoStack size="sm" priority />
      <h1>
        {missed
          ? `Manche ${round.number} / ${total} terminée`
          : `Résultats — manche ${round.number} / ${total}`}
      </h1>
      <p>{round.theme}</p>
    </header>
  );
}

export function MissedRound({
  round,
  total,
  base,
  next,
  correctionsAvailable,
  preview,
  children,
  noAttempt = false,
}: RoundResultsProps & { noAttempt?: boolean }) {
  return (
    <section className="ae-result ae-missed">
      <ResultHeader round={round} total={total} missed />
      <div className="ae-result-intro">
        <Clock3 aria-hidden />
        <h2>
          Vous n’avez pas pu participer
          <br />à cette manche.
        </h2>
      </div>
      <p className="ae-missed-copy">
        {noAttempt
          ? "La manche a été clôturée à la fin du temps imparti."
          : "La manche a été clôturée automatiquement à la fin du temps imparti."}
        <br />
        Aucune réponse n’a été enregistrée.
      </p>
      <div className="ae-subtle-info">
        <Info aria-hidden />
        <span>
          Ce n’est pas un échec : chaque manche est une nouvelle opportunité de
          vous évaluer et de progresser.
        </span>
      </div>
      {next ? (
        <div className="ae-missed-next">
          <p className="ae-kicker">Prochaine manche</p>
          <h2 className="ae-caps">
            <CalendarDays aria-hidden />
            {next.theme}
          </h2>
          <div className="ae-next-details">
            <div>
              <CalendarDays aria-hidden />
              <strong>
                {next.opens_at
                  ? arenaDate(next.opens_at)
                  : "Date annoncée prochainement"}
              </strong>
            </div>
            <div>
              <Timer aria-hidden />
              <span className="ae-muted">
                Ouverture :{" "}
                <strong>
                  {next.opens_at ? time(next.opens_at) : "à venir"}
                </strong>
                <br />
                Fermeture :{" "}
                <strong>
                  {next.closes_at ? time(next.closes_at) : "à venir"}
                </strong>
              </span>
            </div>
            <div>
              <FileText aria-hidden />
              <span className="ae-muted">
                {next.questionCount} questions
                <br />(notée sur {NOTE_PAR_MANCHE})
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="ae-missed-copy">
          Le tournoi est terminé. Retrouvez votre parcours dans votre espace.
        </p>
      )}
      <div className="ae-missed-actions">
        <Link
          className="ae-button"
          href={
            next
              ? `${base}/manche/${next.number}${preview ? "?preview=1" : ""}`
              : `${base}/espace`
          }
        >
          {next ? "Voir la prochaine manche" : "Voir mon espace"}
          <ArrowRight aria-hidden />
        </Link>
        {correctionsAvailable ? (
          <Link
            className="ae-button ae-button-outline"
            href={`${base}/manche/${round.number}/corrections${preview ? "?preview=1" : ""}`}
          >
            <FileText className="ae-gold" aria-hidden />
            <span>
              Voir ma correction détaillée
              <br />
              de la manche {round.number}
            </span>
          </Link>
        ) : (
          <span className="ae-button ae-button-outline ae-disabled-action">
            <FileText aria-hidden />
            Correction détaillée disponible
            <br />
            après la clôture
          </span>
        )}
      </div>
      {next?.opens_at && (
        <CalendarLink
          title={`EVC Arena — ${next.theme}`}
          opensAt={next.opens_at}
          closesAt={next.closes_at}
          href={`${base}/manche/${next.number}`}
        />
      )}
      <p className="ae-missed-quote">
        « Chaque évaluation est une étape vers votre réussite. »
        <span>EVC ARENA</span>
      </p>
      {children && <div className="ae-result-extra">{children}</div>}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Résultat d'une manche jouée                                          */
/* ------------------------------------------------------------------ */

const CONFETTI_COLORS = ["#ffd05e", "#fff1b4", "#e4002b", "#ffffff", "#c4d3e9", "#ff5470"];

/** Pluie de confettis déterministe (pas de hasard au rendu : même HTML serveur et client). */
function Confetti({ count = 42 }: { count?: number }) {
  return (
    <div className="ae-confetti" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const x = (i * 37 + 11) % 100;
        const delay = 2.4 + ((i * 13) % 9) / 10;
        const duration = 2.6 + ((i * 7) % 8) / 10;
        const rotation = 360 + ((i * 53) % 540);
        return (
          <span
            key={i}
            style={{
              ["--x" as string]: `${x}%`,
              ["--c" as string]: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              ["--delay" as string]: `${delay}s`,
              ["--d" as string]: `${duration}s`,
              ["--r" as string]: `${rotation}deg`,
            }}
          />
        );
      })}
    </div>
  );
}

/** Silhouette de podium (objectif « intégrer le classement »), sans effectif ni nom. */
function PodiumSilhouette() {
  return (
    <svg className="ae-objective-podium" viewBox="0 0 140 100" aria-hidden>
      <g fill="#3f4f5a">
        <rect x="8" y="46" width="40" height="46" rx="3" />
        <rect x="50" y="26" width="40" height="66" rx="3" />
        <rect x="92" y="58" width="40" height="34" rx="3" />
      </g>
      <g fill="#8494a0" fontFamily="var(--font-oswald), sans-serif" fontSize="16" textAnchor="middle">
        <text x="28" y="72">2</text>
        <text x="70" y="56">1</text>
        <text x="112" y="80">3</text>
      </g>
      <path d="M62 6l4 8 9 1-6.5 6 1.6 9L62 25.5 53.9 30l1.6-9L49 15l9-1z" fill="#5d6c77" />
    </svg>
  );
}

const AXIS_ICONS = [Zap, Target, Brain, Timer, Flame] as const;

function medalLabel(rank: number): string {
  return rank === 1 ? "1re place" : `${rank}e place`;
}

/** Bloc « rang / statut » du verdict, animé par étapes (§4, §7, §9). */
function VerdictRank({ outcome, thresholds }: { outcome: RoundOutcome; thresholds: PerformanceThresholds }) {
  const variant = outcomeVariant(outcome);
  const copy = outcomeCopy(outcome);
  if (variant === "pending")
    return (
      <div className="ae-verdict-rank ae-reveal" data-step="3">
        <p className="ae-verdict-status">{copy.status}</p>
        <p className="ae-verdict-unranked">Le classement de la manche est publié à sa clôture.</p>
      </div>
    );
  if (variant === "unranked")
    return (
      <div className="ae-verdict-rank ae-reveal" data-step="3">
        <p className="ae-verdict-status">{copy.status}</p>
        <p className="ae-verdict-unranked">
          Seuil du classement : {formatNote(thresholdNote(thresholds.thresholdPct))} / {NOTE_PAR_MANCHE}. Votre score est conservé, votre correction et votre analyse sont disponibles.
        </p>
      </div>
    );
  const rank = outcome.rank as number;
  if (variant === "trophy") {
    const d = outcome.distinction as Distinction;
    return (
      <div className="ae-verdict-rank">
        <div className="ae-verdict-trophy"><Trophy aria-hidden /></div>
        <p className="ae-verdict-status ae-reveal" data-step="4">Distinction {DISTINCTION_LABEL[d]}</p>
        <span className="ae-rank-number">{rank}<small>{rank === 1 ? "er" : "e"}</small></span>
        <p className="ae-verdict-medal ae-reveal" data-step="4"><Medal aria-hidden />Trophée EVC Arena</p>
      </div>
    );
  }
  if (variant === "podium")
    return (
      <div className="ae-verdict-rank">
        {rank === 1 && <Crown className="ae-verdict-crown ae-reveal" data-step="4" aria-hidden />}
        <span className="ae-rank-number">{rank}</span>
        <p className="ae-verdict-medal ae-reveal" data-step="4"><Medal aria-hidden />{medalLabel(rank)}</p>
        <p className="ae-verdict-status ae-reveal" data-step="4">{rank === 1 ? "Vous terminez en tête de ce Battle" : "Podium de ce Battle"}</p>
      </div>
    );
  return (
    <div className="ae-verdict-rank">
      <p className="ae-verdict-status ae-reveal" data-step="3">Votre rang</p>
      <span className="ae-rank-number">{rank}<small>{rank === 1 ? "er" : "e"}</small></span>
      <p className="ae-verdict-status ae-reveal" data-step="4">au classement de ce Battle</p>
      {variant === "high" && <span className="ae-verdict-badge ae-reveal" data-step="4">Niveau de distinction atteint</span>}
    </div>
  );
}

export function RoundResults({
  round,
  total,
  base,
  next,
  correctionsAvailable,
  leaderboardHref = null,
  preview,
  score,
  max,
  perfect,
  partial,
  failed,
  durationSeconds,
  durationMinutes,
  outcome,
  thresholds = DEFAULT_THRESHOLDS,
  participant = null,
  cumul = null,
  passerelle = null,
  weakTheme,
  truncated,
  children,
}: RoundResultsProps & {
  score: number;
  max: number;
  perfect: number;
  partial: number;
  failed: number;
  durationSeconds: number;
  durationMinutes: number;
  /** Lecture du résultat (score, rang, niveau, distinction). */
  outcome: RoundOutcome;
  thresholds?: PerformanceThresholds;
  participant?: { pseudo: string; avatarSeed: string } | null;
  /** Position au classement cumulé (après publication), pour le rappel. */
  cumul?: { rank: number | null; distinction: Distinction | null; rounds: number } | null;
  /** Passerelle Major ECN (§11-§14), null = masquée. */
  passerelle?: PasserelleContent | null;
  weakTheme: string | null;
  truncated?: boolean;
}) {
  const variant = outcomeVariant(outcome);
  const copy = outcomeCopy(outcome);
  const almostAllTime = durationSeconds >= durationMinutes * 60 * 0.9;
  const classes = [
    "ae-result",
    "ae-outcome",
    `ae-outcome--${variant}`,
    outcome.distinction ? `ae-outcome--${outcome.distinction}` : "",
    outcome.rank ? `ae-outcome--rank-${Math.min(outcome.rank, 4)}` : "",
  ].filter(Boolean).join(" ");
  const showAxes = variant === "high" || variant === "trophy";
  return (
    <section className={classes} aria-live="polite">
      <ResultHeader round={round} total={total} />

      {/* 1. SCORE → 2. RANG / STATUT */}
      <div className="ae-verdict">
        {variant === "trophy" && <Confetti />}
        <div className="ae-verdict-score ae-reveal" data-step="1">
          <p className="ae-kicker">Votre score</p>
          <div className="ae-score-number">
            {formatNote(noteSur10(score, max))} <span>/ {NOTE_PAR_MANCHE}</span>
          </div>
          <div
            className="ae-score-segments"
            role="meter"
            aria-label="Votre score"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={max || 1}
          >
            {Array.from({ length: 7 }, (_, i) => (
              <span
                key={i}
                data-filled={
                  max > 0 && i < Math.round((score / max) * 7) ? "" : undefined
                }
              />
            ))}
          </div>
          <p className="ae-verdict-thresholds">
            Classement dès {formatNote(thresholdNote(thresholds.thresholdPct))} / {NOTE_PAR_MANCHE} · distinction dès {formatNote(thresholdNote(thresholds.distinctionPct))} / {NOTE_PAR_MANCHE}
          </p>
        </div>
        <div className="ae-verdict-avatar ae-reveal" data-step="2">
          <ArenaAvatar
            seed={participant?.avatarSeed ?? "casque"}
            rank={outcome.rank}
            distinction={outcome.distinction}
            size={150}
            title={participant?.pseudo}
          />
          {participant && <span className="ae-verdict-pseudo">{participant.pseudo}</span>}
        </div>
        <VerdictRank outcome={outcome} thresholds={thresholds} />
      </div>

      {/* 3. MESSAGE DE MOTIVATION */}
      <h2 className="ae-verdict-title ae-reveal" data-step="4">{copy.title}</h2>
      <div className="ae-motivation ae-reveal" data-step="4">
        {copy.paragraphs.map((p) => <p key={p}>{p}</p>)}
        {preview && <p><strong>Mode prévisualisation :</strong> aucun classement ni score enregistré.</p>}
      </div>

      {/* 4. CORRECTION / ANALYSE */}
      <div className="ae-panel ae-scoreboard ae-reveal" data-step="5">
        <div className="ae-answer-stats">
          <FileText aria-hidden />
          <div>
            <p className="ae-kicker">Vos réponses</p>
            <p>
              <strong>{perfect}</strong> questions totalement réussies
            </p>
            <p>
              <strong>{partial}</strong> questions partiellement réussies
            </p>
            <p>
              <strong>{failed}</strong> questions non réussies
            </p>
          </div>
        </div>
        <div className="ae-time-stats">
          <div>
            <Timer aria-hidden />
            <div>
              <p className="ae-kicker">Temps utilisé</p>
              <p className="ae-time-number">
                {Math.floor(durationSeconds / 60)} min{" "}
                {String(durationSeconds % 60).padStart(2, "0")}
              </p>
              <p className="ae-time-total">sur {durationMinutes} min</p>
            </div>
          </div>
          {almostAllTime && (
            <div className="ae-time-warning">
              <CircleAlert aria-hidden />
              <p>
                Vous avez utilisé la quasi-totalité du temps. La gestion du
                rythme est un axe de travail.
              </p>
            </div>
          )}
          {truncated && (
            <p className="ae-time-warning">
              Fenêtre réduite par l’heure de clôture de la manche.
            </p>
          )}
        </div>
        <div className="ae-answer-stats">
          <ChartNoAxesColumnIncreasing aria-hidden />
          <div>
            <p className="ae-kicker">Classement cumulé</p>
            {preview ? (
              <p>Aucun classement en prévisualisation.</p>
            ) : !outcome.published ? (
              <p>Publié à la clôture de la manche.</p>
            ) : cumul?.rank ? (
              <>
                <p><strong>{ordinalRank(cumul.rank)}</strong> après {cumul.rounds} manche{cumul.rounds > 1 ? "s" : ""}</p>
                <p>{cumul.distinction ? `Distinction ${DISTINCTION_LABEL[cumul.distinction]} au cumul` : cumul.rank <= 3 ? "Podium au cumul · trophée à conquérir" : "Continuez à gagner des places"}</p>
              </>
            ) : (
              <p>Non classé au cumul pour l’instant : le seuil est réévalué à chaque manche.</p>
            )}
          </div>
        </div>
      </div>
      <div className="ae-panel ae-result-insights ae-reveal" data-step="5">
        <div>
          <Target aria-hidden />
          <div>
            <p className="ae-kicker">
              {weakTheme ? "À renforcer" : "Pour progresser"}
            </p>
            <h3>{weakTheme ?? "Poursuivez votre préparation"}</h3>
            <p>
              {weakTheme
                ? "Consultez votre correction détaillée pour cibler vos révisions."
                : "Analysez vos réponses en détail et préparez la prochaine manche."}
            </p>
          </div>
        </div>
        <div>
          <FileText aria-hidden />
          <div>
            <p className="ae-kicker">Votre analyse</p>
            <h3>{correctionsAvailable ? "Correction détaillée disponible" : "Correction détaillée à la clôture"}</h3>
            <p>
              {correctionsAvailable
                ? "Vos réponses face aux réponses attendues, avec les explications, les pièges et les erreurs les plus fréquentes."
                : "Votre correction détaillée sera disponible dans votre espace à la clôture de la manche."}
            </p>
          </div>
        </div>
      </div>
      <div className="ae-result-actions ae-reveal" data-step="5">
        {correctionsAvailable ? (
          <Link
            className="ae-button ae-button-outline"
            href={`${base}/manche/${round.number}/corrections${preview ? "?preview=1" : ""}`}
          >
            <FileText aria-hidden />
            <span>
              Voir ma correction<small>Vos réponses face aux réponses attendues</small>
            </span>
            <ArrowRight aria-hidden />
          </Link>
        ) : (
          <div className="ae-button ae-button-outline ae-disabled-action">
            <FileText aria-hidden />
            <span>
              Correction détaillée<small>Disponible après la clôture</small>
            </span>
          </div>
        )}
        {leaderboardHref && (
          <Link className="ae-button ae-button-outline" href={leaderboardHref}>
            <ChartNoAxesColumnIncreasing aria-hidden />
            <span>
              Voir le classement<small>Classement de la manche {round.number}</small>
            </span>
            <ArrowRight aria-hidden />
          </Link>
        )}
        <Link
          className="ae-button"
          href={
            next
              ? `${base}/manche/${next.number}${preview ? "?preview=1" : ""}`
              : `${base}/espace`
          }
        >
          <span>
            {next ? "Me préparer au prochain Battle" : "Voir mon espace"}
            <small>
              {next ? `Manche ${next.number} · ${next.theme}` : "Retrouvez vos résultats et votre progression"}
            </small>
          </span>
          <ArrowRight aria-hidden />
        </Link>
      </div>

      {/* 5. PROCHAIN OBJECTIF EVC ARENA */}
      <div className="ae-objective ae-reveal" data-step="6">
        <div className="ae-objective-visual" aria-hidden>
          {variant === "unranked" || variant === "pending" ? <PodiumSilhouette /> : <Trophy className="ae-objective-trophy" />}
        </div>
        <div>
          <p className="ae-kicker">Prochain objectif</p>
          <h3><Trophy aria-hidden />{copy.objective.title}</h3>
          <p>{copy.objective.body}</p>
          {copy.objective.closing && <p>{copy.objective.closing}</p>}
          {showAxes && (
            <ul className="ae-objective-axes">
              {HIGH_PERFORMANCE_AXES.map((axis, i) => {
                const Icon = AXIS_ICONS[i];
                return <li key={axis}><Icon aria-hidden />{axis}</li>;
              })}
            </ul>
          )}
          <p className="ae-objective-thresholds">
            {variant === "unranked" || variant === "pending"
              ? `Intégrer le classement : ${formatNote(thresholdNote(thresholds.thresholdPct))} / ${NOTE_PAR_MANCHE}. Trophées EVC Arena : podium et ${formatNote(thresholdNote(thresholds.distinctionPct))} / ${NOTE_PAR_MANCHE}.`
              : variant === "trophy"
                ? `Distinction conservée dans votre palmarès. Elle se joue à chaque Battle : podium et ${formatNote(thresholdNote(thresholds.distinctionPct))} / ${NOTE_PAR_MANCHE}.`
                : `Trophées EVC Arena : une place sur le podium et un score d’au moins ${formatNote(thresholdNote(thresholds.distinctionPct))} / ${NOTE_PAR_MANCHE}.`}
          </p>
        </div>
      </div>

      {/* 6. PASSERELLE MAJOR ECN — toujours en dernier */}
      {passerelle && !preview && <PasserelleBlock content={passerelle} />}

      {next && (
        <p className="ae-next-date">
          <CalendarDays aria-hidden />
          <span>
            <strong className="text-white font-normal">
              Prochaine manche :{" "}
              {next.opens_at
                ? arenaDate(next.opens_at, true)
                : "date annoncée prochainement"}
            </strong>
            <br />
            {next.questionCount} questions • notée sur {NOTE_PAR_MANCHE} •{" "}
            {next.duration} minutes
          </span>
        </p>
      )}
      {children && <div className="ae-result-extra">{children}</div>}
    </section>
  );
}
