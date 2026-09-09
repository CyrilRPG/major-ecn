import {
  ArenaBars as ChartNoAxesColumnIncreasing,
  ArenaTarget as Target,
} from "./experience-icons";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Clock3,
  FileText,
  Info,
  Timer,
} from "lucide-react";
import { ArenaLogoStack } from "./arena-logo";
import { CalendarLink } from "./calendar-link";
import { arenaDate, type LobbyRound } from "./round-lobby";

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
  correctionsAvailable: boolean;
  preview?: boolean;
  children?: ReactNode;
};
const fr = (v: number) =>
  v.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
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
                <br />({fr(next.max)} points au total)
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
              Voir les corrections
              <br />
              de la manche {round.number}
            </span>
          </Link>
        ) : (
          <span className="ae-button ae-button-outline ae-disabled-action">
            <FileText aria-hidden />
            Corrections disponibles
            <br />
            après publication
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

export function RoundResults({
  round,
  total,
  base,
  next,
  correctionsAvailable,
  preview,
  score,
  max,
  perfect,
  partial,
  failed,
  durationSeconds,
  durationMinutes,
  position,
  positionDetail,
  weakTheme,
  feedbackSubject = "cette manche",
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
  position: string;
  positionDetail: string;
  weakTheme: string | null;
  feedbackSubject?: string;
  truncated?: boolean;
}) {
  const strong = max > 0 && score / max >= 0.5;
  const almostAllTime = durationSeconds >= durationMinutes * 60 * 0.9;
  return (
    <section className="ae-result">
      <ResultHeader round={round} total={total} />
      <div className="ae-result-intro">
        <span className="ae-result-icon"><ChartNoAxesColumnIncreasing aria-hidden /></span>
        <div>
          <h2>
            {strong
              ? "Vous avez consolidé vos connaissances."
              : "Vous avez identifié vos points faibles"}
            {!strong && (
              <>
                <br />
                sur {feedbackSubject}.
              </>
            )}
          </h2>
          <p>
            {correctionsAvailable
              ? "Les corrections détaillées sont désormais disponibles."
              : "Les corrections détaillées seront disponibles à la clôture de la manche."}
          </p>
        </div>
      </div>
      <div className="ae-panel ae-scoreboard">
        <div className="ae-score-value">
          <p>Votre score</p>
          <div className="ae-score-number">
            {fr(score)} <span>/ {fr(max)}</span>
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
        </div>
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
      </div>
      <div className="ae-panel ae-result-insights">
        <div>
          <ChartNoAxesColumnIncreasing aria-hidden />
          <div>
            <p className="ae-kicker">Votre position</p>
            <h3>{position}</h3>
            <p>{positionDetail}</p>
          </div>
        </div>
        <div>
          <Target aria-hidden />
          <div>
            <p className="ae-kicker">
              {weakTheme ? "À renforcer" : "Pour progresser"}
            </p>
            <h3>{weakTheme ?? "Poursuivez votre préparation"}</h3>
            <p>
              {weakTheme
                ? "Consultez les corrections pour cibler vos révisions."
                : "Analysez vos réponses en détail et préparez la prochaine manche."}
            </p>
          </div>
        </div>
      </div>
      <div className="ae-result-actions">
        {correctionsAvailable ? (
          <Link
            className="ae-button ae-button-outline"
            href={`${base}/manche/${round.number}/corrections${preview ? "?preview=1" : ""}`}
          >
            <FileText aria-hidden />
            <span>
              Voir les corrections<small>Analysez vos réponses en détail</small>
            </span>
            <ArrowRight aria-hidden />
          </Link>
        ) : (
          <div className="ae-button ae-button-outline ae-disabled-action">
            <FileText aria-hidden />
            <span>
              Les corrections<small>Disponibles après publication</small>
            </span>
          </div>
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
            {next ? `Voir la manche ${next.number}` : "Voir mon espace"}
            <small>
              {next?.theme ?? "Retrouvez vos résultats et votre progression"}
            </small>
          </span>
          <ArrowRight aria-hidden />
        </Link>
      </div>
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
            {next.questionCount} questions • {fr(next.max)} points au total •{" "}
            {next.duration} minutes
          </span>
        </p>
      )}
      {children && <div className="ae-result-extra">{children}</div>}
    </section>
  );
}
