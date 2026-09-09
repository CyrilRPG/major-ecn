import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  FileText,
  GraduationCap,
  Info,
  Star,
  Timer,
  Trophy,
} from "lucide-react";
import { ArenaBars, ArenaTarget } from "./experience-icons";
import type { FinalSummary } from "@/lib/arena/final-summary";
import { durationText, GENERAL_RANKING_NOTICE } from "@/lib/arena/format";
import "./tournament-final.css";

const score = (value: number) =>
  value.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
const ordinal = (rank: number) => `${rank}${rank === 1 ? "er" : "e"}`;
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Paris",
      }).format(new Date(value))
    : "Date non renseignée";

export function TournamentFinal({
  summary: s,
  base,
  leaderboardEnabled = true,
}: {
  summary: FinalSummary;
  base: string;
  leaderboardEnabled?: boolean;
}) {
  const incomplete = s.variant === "progress";
  const podium = ["champion", "silver", "bronze"].includes(s.variant);
  const edition = `EVC ARENA ${s.edition}`.trim();
  const average = durationText(s.meanSeconds);
  return (
    <section
      className={`af-final af-${s.variant}`}
      aria-label="Bilan du tournoi"
    >
      <div className="af-edition-banner" aria-hidden="true">
        <Image
          src="/arena/final/banner.png"
          alt=""
          width={154}
          height={400}
          sizes="154px"
        />
        <div>
          <strong>
            {s.variant === "champion"
              ? "CHAMPION"
              : s.variant === "silver"
                ? "2ÈME"
                : s.variant === "bronze"
                  ? "3ÈME"
                  : "EVC ARENA"}
          </strong>
          <span>{s.edition}</span>
        </div>
      </div>
      <div className="af-hero">
        <div className="af-celebration">
          <div className="af-title-panel">
            {s.variant === "champion" ? (
              <>
                <h1 className="af-champion">CHAMPION</h1>
                <p className="af-edition">{edition}</p>
                <p className="af-hero-rank">{s.general?.text}</p>
              </>
            ) : s.variant === "silver" || s.variant === "bronze" ? (
              <>
                <p className="af-kicker">FÉLICITATIONS !</p>
                <h1 className="af-podium-place">
                  {s.variant === "silver" ? "2ÈME" : "3ÈME"}
                </h1>
                <p className="af-hero-rank">
                  {s.general?.effectif !== null &&
                  s.general?.effectif !== undefined
                    ? `SUR ${s.general.effectif} `
                    : ""}
                  DU CLASSEMENT GÉNÉRAL
                </p>
                <p className="af-edition">{edition}</p>
              </>
            ) : incomplete ? (
              <>
                <p className="af-kicker">VOTRE PARCOURS</p>
                <h1 className="af-journey-title">
                  VOUS AVEZ DISPUTÉ
                  <br />
                  {s.played} MANCHE{s.played > 1 ? "S" : ""} SUR 3
                </h1>
                <p className="af-journey-edition">Votre parcours {edition}</p>
                <p className="af-journey-copy">
                  {s.played
                    ? `Les corrections détaillées de vos ${s.played} manche${s.played > 1 ? "s" : ""} sont disponibles.`
                    : "Les corrections détaillées du tournoi sont disponibles."}
                  <br />
                  Analysez vos réponses pour identifier les points à renforcer.
                </p>
              </>
            ) : s.variant === "top" ? (
              <>
                <p className="af-kicker">BRAVO !</p>
                <h1 className="af-top-title">TOP {s.topPercent} %</h1>
                <p className="af-hero-rank">{s.general?.text}</p>
                <p className="af-edition">{edition}</p>
              </>
            ) : (
              <>
                <h1 className="af-progress-title">
                  CONTINUEZ
                  <br />
                  VOTRE PROGRESSION
                </h1>
                <p className="af-progress-copy">
                  L’important est d’aller plus loin à chaque étape.
                </p>
                <p className="af-edition">{edition}</p>
                {s.general && <p className="af-hero-rank">{s.general.text}</p>}
              </>
            )}
            <p className="af-values">
              {podium
                ? "RÉGULARITÉ · CONSTANCE · EXCELLENCE"
                : s.variant === "top"
                  ? "RÉGULARITÉ · PROGRESSION · PERFORMANCE"
                  : "APPRENDRE · S’ÉVALUER · PROGRESSER"}
            </p>
          </div>
          <div className="af-trophy" aria-hidden="true">
            <Image
              src={`/arena/final/${s.variant}.png`}
              alt=""
              width={1254}
              height={1254}
              sizes="(max-width: 560px) 280px, (max-width: 1100px) 340px, 450px"
              priority
            />
            {s.variant === "champion" && (
              <span className="af-plaque">
                CHAMPION
                <br />
                {edition}
              </span>
            )}
          </div>
        </div>
        <aside className="af-performance af-panel">
          <h2>
            {incomplete ? "VOTRE PARCOURS EN DÉTAIL" : "VOTRE PERFORMANCE"}
          </h2>
          {incomplete ? (
            <>
              <ol className="af-participation">
                {s.rounds.map((r) => (
                  <li key={r.id} className={r.played ? "is-played" : ""}>
                    <b>{r.number}</b>
                    <span>
                      Manche {r.number}
                      <br />
                      {r.played ? "Disputée" : "Non jouée"}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="af-eligibility">
                <Info aria-hidden />
                Le classement général nécessite la participation aux 3 manches.
                Votre classement ne peut pas être établi pour cette édition.
              </p>
            </>
          ) : (
            <>
              <div className="af-history-line">
                <ArenaBars aria-hidden />
                <dl>
                  {s.history.map((h) => (
                    <div key={h.number}>
                      <dt>
                        {h.final ? "Rang final" : `Rang après M${h.number}`}
                      </dt>
                      <dd>
                        {h.rank ? (
                          <>
                            {ordinal(h.rank)}
                            {h.final &&
                            s.general?.effectif !== null &&
                            s.general?.effectif !== undefined
                              ? ` sur ${s.general.effectif}`
                              : ""}
                          </>
                        ) : (
                          "Non affiché"
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              {s.gap && (
                <div className="af-performance-line">
                  <ArenaTarget aria-hidden />
                  <span>{s.gap.label}</span>
                  <strong>
                    {s.gap.value > 0 ? "+" : ""}
                    {score(s.gap.value)} point
                    {Math.abs(s.gap.value) !== 1 ? "s" : ""}
                  </strong>
                </div>
              )}
              <div className="af-performance-line">
                <FileText aria-hidden />
                <span>Questions parfaites</span>
                <strong>
                  {s.perfect} <em>/ {s.questionCount}</em>
                </strong>
              </div>
              {!podium && s.analysis ? (
                <>
                  <div className="af-performance-line">
                    <Star aria-hidden />
                    <span>Point fort</span>
                    <strong>{s.analysis.strong}</strong>
                  </div>
                  <div className="af-performance-line">
                    <ArenaBars aria-hidden />
                    <span>À renforcer</span>
                    <strong>{s.analysis.weak}</strong>
                  </div>
                </>
              ) : (
                <div className="af-performance-line af-feedback">
                  <Trophy aria-hidden />
                  <span>
                    {s.variant === "champion"
                      ? "Départage : score → questions parfaites → temps"
                      : podium
                        ? "Bravo pour votre régularité sur l’ensemble des manches !"
                        : "Chaque correction vous aide à cibler vos prochaines révisions."}
                  </span>
                </div>
              )}
            </>
          )}
          <p className="af-notice">{GENERAL_RANKING_NOTICE}</p>
        </aside>
      </div>
      <div className="af-rounds">
        {s.rounds.map((r) => (
          <article
            key={r.id}
            className={`af-round af-panel ${r.played ? "" : "is-unplayed"}`}
          >
            <h2>MANCHE {r.number}</h2>
            <p className="af-round-date">{date(r.date)}</p>
            <div className="af-round-content">
              <div
                className={`af-round-rank af-medal-${r.rank === 1 ? "gold" : r.rank === 2 ? "silver" : r.rank === 3 ? "bronze" : "normal"}`}
              >
                {r.played ? (
                  r.rank ? (
                    <>
                      <Trophy aria-hidden />
                      <strong>{ordinal(r.rank)}</strong>
                    </>
                  ) : (
                    <CheckCircle2 aria-label="Manche disputée" />
                  )
                ) : (
                  <CircleDashed aria-hidden />
                )}
              </div>
              <div className="af-round-score">
                {r.played ? (
                  <>
                    <p>
                      <b>{score(r.score)}</b> / {score(r.max)} points
                    </p>
                    <span>{r.questionCount} questions</span>
                    <span>Temps : {durationText(r.seconds)}</span>
                  </>
                ) : (
                  <>
                    <p>Non jouée</p>
                    <span>Prochaine édition à venir</span>
                  </>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div
        className={`af-totals af-panel ${s.variant === "champion" && s.edition.includes("2026") ? "af-has-badge" : ""}`}
      >
        <div className="af-metric">
          <ArenaTarget aria-hidden />
          <div>
            <h2>SCORE TOTAL</h2>
            <p>
              {score(s.score)} <em>/ {score(s.max)} points</em>
            </p>
            <span>
              {incomplete
                ? `sur les ${s.played} manches disputées`
                : `sur ${s.questionCount} questions`}
            </span>
          </div>
        </div>
        <div className="af-metric">
          <ArenaBars aria-hidden />
          <div>
            <h2>CLASSEMENT GÉNÉRAL</h2>
            <p>
              {s.general ? (
                <>
                  {ordinal(s.general.rank)}
                  {s.general.effectif !== null && (
                    <em> sur {s.general.effectif}</em>
                  )}
                </>
              ) : incomplete ? (
                "Non établi"
              ) : (
                "Non affiché"
              )}
            </p>
            <span>
              {incomplete
                ? "3 manches requises"
                : s.general
                  ? "sur les 3 manches"
                  : "Seuil de classement non atteint"}
            </span>
          </div>
        </div>
        <div className="af-metric">
          <Timer aria-hidden />
          <div>
            <h2>TEMPS TOTAL</h2>
            <p>{durationText(s.totalSeconds)}</p>
            <span>Moyenne : {average} / manche</span>
          </div>
        </div>
        <div className="af-metric">
          <Star aria-hidden fill="currentColor" />
          <div>
            <h2>{podium ? "PALMARÈS" : "PARCOURS"}</h2>
            <p>
              {podium ? s.wins : s.played}{" "}
              <em>/ 3 manches {podium ? "remportées" : "disputées"}</em>
            </p>
            <span>
              {s.wins === 3
                ? "Performance parfaite"
                : podium
                  ? "Une régularité remarquable"
                  : incomplete
                    ? "Chaque étape compte"
                    : "Parcours complet"}
            </span>
          </div>
        </div>
        {s.variant === "champion" && s.edition.includes("2026") && (
          <Image
            className="af-champion-badge"
            src="/arena/final/badge.png"
            alt="Distinction Champion EVC Arena 2026"
            width={150}
            height={150}
          />
        )}
      </div>
      <p className="af-notice af-totals-notice">{GENERAL_RANKING_NOTICE}</p>
      <div className={`af-bottom ${incomplete ? "af-bottom-incomplete" : ""}`}>
        {incomplete && (
          <section className="af-analysis af-panel">
            <h2>
              <FileText aria-hidden />
              VOTRE ANALYSE
            </h2>
            {s.analysis ? (
              <div>
                <p>
                  <Star aria-hidden />
                  <span>
                    Point fort<strong>{s.analysis.strong}</strong>Continuez à
                    consolider ces acquis.
                  </span>
                </p>
                <p>
                  <ArenaBars aria-hidden />
                  <span>
                    À renforcer<strong>{s.analysis.weak}</strong>Reprenez les
                    corrections pour cibler vos révisions.
                  </span>
                </p>
              </div>
            ) : (
              <p>
                Retrouvez vos réponses et les explications détaillées dans les
                corrections des manches.
              </p>
            )}
          </section>
        )}
        <div className="af-actions">
          <Link
            className={`af-action ${incomplete ? "af-action-red" : ""}`}
            href={`${base}/corrections`}
          >
            <FileText aria-hidden />
            <span>
              <strong>
                {incomplete
                  ? "VOIR LES CORRECTIONS"
                  : "VOIR TOUTES LES CORRECTIONS"}
              </strong>
              <small>
                {s.played
                  ? `Revivez vos ${s.played} manche${s.played > 1 ? "s" : ""} en détail`
                  : "Découvrez les explications détaillées"}
              </small>
            </span>
            <ArrowRight aria-hidden />
          </Link>
          {incomplete ? (
            <Link className="af-action" href="/arena">
              <CalendarDays aria-hidden />
              <strong>
                DÉCOUVRIR
                <br />
                LES PROCHAINES ÉDITIONS
              </strong>
              <ArrowRight aria-hidden />
            </Link>
          ) : (
            leaderboardEnabled && (
              <Link
                className="af-action af-action-red"
                href={`${base}/classement`}
              >
                <ArenaBars aria-hidden />
                <span>
                  <strong>CONSULTER LE CLASSEMENT FINAL</strong>
                  <small>Voir le classement complet</small>
                </span>
                <ArrowRight aria-hidden />
              </Link>
            )
          )}
          {incomplete && (
            <Link className="af-continue" href="/">
              <GraduationCap aria-hidden />
              <span>
                <strong>CONTINUEZ VOTRE PRÉPARATION AVEC MAJOR ECN</strong>
                <small>
                  Entraînements ciblés, fiches synthèse et corrections
                  détaillées pour progresser sur vos points à renforcer.
                </small>
              </span>
              <ArrowRight aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
