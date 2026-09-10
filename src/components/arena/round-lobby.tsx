import { ArenaBars as ChartNoAxesColumnIncreasing } from "./experience-icons";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Ban,
  CalendarCheck2,
  ChevronDown,
  Clock3,
  FileText,
  LockKeyhole,
  UserRound,
  Trophy,
  UsersRound,
} from "lucide-react";
import { ArenaAvatar } from "./arena-avatar";
import { ArenaOriflammes } from "./arena-oriflammes";
import { Countdown } from "./countdown";
import { describeBareme, type Bareme } from "@/lib/arena/scoring";
import { roundState } from "@/lib/arena/time";
import type { RoundRow } from "@/lib/arena/types";

export const arenaDate = (iso: string, withTime = false) =>
  new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    ...(!withTime ? { weekday: "long" as const } : {}),
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));

export type LobbyRound = Pick<
  RoundRow,
  "number" | "theme" | "opens_at" | "closes_at"
>;
export function RoundLobby({
  slug,
  round,
  rounds,
  participant,
  questionCount,
  duration,
  bareme,
  ns,
  participantCount,
  nowIso,
  children,
  notices,
  preview = false,
  countdownText,
}: {
  slug: string;
  round: LobbyRound;
  rounds: LobbyRound[];
  participant: { pseudo: string; avatar_seed?: string; rank?: number | null } | null;
  questionCount: number;
  duration: number;
  bareme: Bareme;
  ns: number[];
  participantCount: number;
  nowIso: string;
  children: ReactNode;
  notices?: ReactNode;
  preview?: boolean;
  countdownText?: string;
}) {
  const state = roundState(
    { ...round, duration_minutes: null },
    new Date(nowIso),
  );
  const isCng = Object.values(bareme).every((b) => b.mode === "cng");
  const seasonDate = rounds.find(r => r.opens_at)?.opens_at;
  const season = seasonDate ? new Intl.DateTimeFormat('fr-FR', { year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date(seasonDate)) : null;
  const target =
    state === "open"
      ? round.closes_at
      : state === "upcoming"
        ? round.opens_at
        : null;
  return (
    <section className="ae-lobby">
      <ArenaOriflammes season={season} />
      <div className="ae-lobby-hero">
        <div className="ae-lobby-heading">
          <p className="ae-caps">
            Manche {round.number} / {rounds.length}
          </p>
          <h1 className="ae-caps">{round.theme || `Manche ${round.number}`}</h1>
          <div className="ae-lobby-rules">
            <span>
              <FileText aria-hidden />
              {questionCount} questions
            </span>
            <span>
              <Clock3 aria-hidden />
              {duration} minutes
            </span>
            <span>
              <LockKeyhole aria-hidden />
              Une seule tentative
            </span>
            <span>
              <Ban aria-hidden />
              Pas de retour en arrière
            </span>
          </div>
          <ol className="ae-timeline" aria-label="Progression du tournoi">
            {rounds.map((r) => {
              const st = roundState(
                { ...r, duration_minutes: null },
                new Date(nowIso),
              );
              return (
                <li
                  key={r.number}
                  aria-current={r.number === round.number ? "step" : undefined}
                >
                  <Link
                    href={`/arena/${slug}/manche/${r.number}${preview ? "?preview=1" : ""}`}
                  >
                    <span className="ae-timeline-dot" aria-hidden />
                    <strong>Manche {r.number}</strong>
                    <span>
                      {r.opens_at
                        ? new Intl.DateTimeFormat("fr-FR", {
                            timeZone: "Europe/Paris",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(r.opens_at))
                        : "À venir"}
                    </span>
                    {st === "open" ? (
                      <em>(en cours)</em>
                    ) : st === "closed" ? (
                      <em>Terminée</em>
                    ) : (
                      <LockKeyhole aria-label="Manche à venir" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="ae-lobby-profile">
          <ArenaAvatar seed={participant?.avatar_seed ?? "casque"} rank={participant?.rank} size={174} title={participant?.pseudo} />
          <strong>{participant?.pseudo ?? "Prévisualisation"}</strong>
          <span>{preview ? "Prévisualisation" : "Participant"}</span>
          {participant && (
            <Link
              href={`/arena/${slug}/espace#palmares-title`}
              className="ae-avatar-edit"
            >
              <UserRound aria-hidden />
              Mon profil
            </Link>
          )}
        </div>
        <aside className="ae-panel ae-window-card">
          <div className="ae-window-main">
            <CalendarCheck2 aria-hidden />
            <div>
              <h2 className="ae-caps">
                {state === "open"
                  ? "Manche ouverte"
                  : state === "upcoming"
                    ? "Prochaine manche"
                    : "Manche terminée"}
              </h2>
              <p className="ae-window-countdown">
                {countdownText ??
                  (target ? <Countdown target={target} label="" /> : "—")}
              </p>
              <p className="ae-muted">
                {state === "open"
                  ? "avant fermeture"
                  : state === "upcoming"
                    ? "avant ouverture"
                    : "Rendez-vous à la prochaine manche"}
              </p>
            </div>
          </div>
          <p className="ae-window-close">
            <Clock3 aria-hidden />
            <span>
              {state === "open" ? "Ferme" : "Ouvre"}{" "}
              {target
                ? `le ${arenaDate(target, true)}`
                : "à une date annoncée prochainement"}
            </span>
          </p>
        </aside>
      </div>
      <div className="ae-lobby-panels">
        <section className="ae-panel ae-lobby-panel">
          <h2 className="ae-panel-heading ae-caps">
            <ChartNoAxesColumnIncreasing aria-hidden />
            Barème applicable{isCng ? " – CNG" : ""}
          </h2>
          <details className="ae-bareme-details">
            <summary>
              <span>
                QRM / QRU / QRP –{" "}
                {isCng ? "Barème officiel du CNG" : "Barème de la manche"}
              </span>
              <span>
                Voir le détail du barème <ChevronDown aria-hidden />
              </span>
            </summary>
            <div className="ae-bareme-grid">
              {(["QRM", "QRU", "QRP"] as const).map((type) => {
                const d = describeBareme(type, bareme, ns);
                return (
                  <div key={type}>
                    <h3 className="ae-caps">
                      {type} · {d.title}
                    </h3>
                    {d.lines.map((line) => (
                      <p key={line.situation}>
                        <span>{line.situation}</span>
                        <strong>{line.points}</strong>
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          </details>
          <div className="ae-warning">
            <span className="ae-alert-icon" aria-hidden>
              !
            </span>
            <div>
              <p>
                <strong>
                  Une fois la manche lancée, elle ne peut pas être interrompue.
                </strong>
              </p>
              <p>
                Prévoyez {duration} minutes et une connexion internet stable.
              </p>
            </div>
          </div>
        </section>
        <section className="ae-panel ae-lobby-panel">
          <h2 className="ae-panel-heading ae-caps">
            <ChartNoAxesColumnIncreasing aria-hidden />
            Informations et progression
          </h2>
          <div className="ae-info-tiles">
            <div className="ae-info-tile">
              <UsersRound aria-hidden />
              <b>{participantCount}</b>
              <span>
                participants
                <br />
                inscrits et confirmés
              </span>
            </div>
            <div className="ae-info-tile">
              <Trophy aria-hidden />
              <strong>Classement</strong>
              <span>
                disponible après
                <br />
                publication des résultats
              </span>
            </div>
            <div className="ae-info-tile">
              <FileText aria-hidden />
              <strong>Corrections</strong>
              <span>
                détaillées
                <br />
                disponibles à la fin
                <br />
                de la manche
              </span>
            </div>
          </div>
        </section>
      </div>
      {notices && <div className="ae-lobby-extra">{notices}</div>}
      <div className="ae-lobby-start">{children}</div>
    </section>
  );
}
