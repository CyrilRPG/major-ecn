import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, CircleDashed, FileText, Info, Star, Timer, UserPlus } from 'lucide-react';
import { ArenaBars, ArenaTarget } from './experience-icons';
import { Countdown } from './countdown';
import { durationText } from '@/lib/arena/format';
import { formatNote, noteMax, noteSur10 } from '@/lib/arena/note';
import { DISTINCTION_LABEL, isPodiumRank, type Distinction } from '@/lib/arena/performance';
import { UNDER_THRESHOLD_MESSAGE } from '@/lib/arena/texts';
import './tournament-final.css';

export type SpaceRoundView = {
  number: number;
  theme: string;
  opensAt: string | null;
  closesAt: string | null;
  state: 'unscheduled' | 'upcoming' | 'open' | 'closed';
  questionCount: number;
  /** Tentative terminée (score brut, maximum brut, durée) ; `inProgress` : manche commencée. */
  played: { score: number; max: number; seconds: number; truncated: boolean } | null;
  inProgress: boolean;
  correctionsAllowed: boolean;
};

const date = (iso: string | null) => iso
  ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date(iso))
  : 'Date annoncée prochainement';
const ordinal = (rank: number) => `${rank}${rank === 1 ? 'er' : 'e'}`;

/**
 * Espace participant pendant le tournoi — même vocabulaire que la maquette
 * client du 24/09/2026 (14_51_05) : cartes Manche 1 · 2 · 3 (note sur 10,
 * questions, temps, statut réel), barre Score cumulé · Classement · Temps ·
 * Parcours, puis actions. Le rang ne s'affiche que s'il est publié (seuil
 * atteint) ; jamais d'effectif (§7) ; la note est sur 10 × n manches.
 */
export function SpaceProgress({ base, rounds, cumul, invite, children }: {
  base: string;
  rounds: SpaceRoundView[];
  cumul: { score: number; max: number; counted: number; lastCounted: number | null; rank: number | null; distinction: Distinction | null; final: boolean; thresholdPct: number; distinctionPct: number };
  /** Encadré « Inviter un collègue » (composant client). */
  invite: ReactNode;
  children?: ReactNode;
}) {
  const played = rounds.filter((r) => r.played);
  const totalSeconds = played.reduce((a, r) => a + (r.played?.seconds ?? 0), 0);
  const anyCorrections = rounds.some((r) => r.correctionsAllowed);
  const lastPlayed = [...rounds].reverse().find((r) => r.played)?.number ?? null;
  return (
    <section className="af-final af-space" aria-label="Mon parcours dans le tournoi">
      <div className="af-rounds">
        {rounds.map((r) => (
          <article key={r.number} className={`af-round af-panel ${r.played || r.state === 'open' ? '' : 'is-unplayed'}${r.state === 'open' && !r.played ? ' is-open' : ''}`}>
            <h2>MANCHE {r.number}</h2>
            {r.played && <span className="af-round-badge"><CheckCircle2 aria-hidden />Validée</span>}
            {!r.played && r.state === 'open' && <span className="af-round-badge af-round-badge--open">Ouverte</span>}
            <p className="af-round-date">{date(r.opensAt)}</p>
            <div className="af-round-content">
              <div className="af-round-rank">
                {r.played ? <CheckCircle2 aria-label="Manche disputée" /> : <CircleDashed aria-hidden />}
              </div>
              <div className="af-round-score">
                {r.played ? (
                  <>
                    <p><b>{formatNote(noteSur10(r.played.score, r.played.max))}</b> / {formatNote(noteMax())}</p>
                    <span>{r.questionCount} questions</span>
                    <span>Temps : {durationText(r.played.seconds)}{r.played.truncated ? ' (fenêtre réduite)' : ''}</span>
                    {r.correctionsAllowed
                      ? <Link className="af-round-link" href={`${base}/manche/${r.number}/corrections`}>Voir ma correction <ArrowRight aria-hidden /></Link>
                      : <span className="af-round-muted">Correction détaillée après la clôture</span>}
                  </>
                ) : r.inProgress ? (
                  <>
                    <p>En cours</p>
                    <Link className="af-round-link" href={`${base}/manche/${r.number}`}>Reprendre la manche <ArrowRight aria-hidden /></Link>
                  </>
                ) : r.state === 'open' ? (
                  <>
                    <p>Ouverte</p>
                    {r.theme && <span className="af-round-theme">{r.theme}</span>}
                    {r.closesAt && <span><Countdown target={r.closesAt} label="Se termine dans" /></span>}
                    <Link className="af-round-link" href={`${base}/manche/${r.number}`}>Jouer la manche {r.number} <ArrowRight aria-hidden /></Link>
                  </>
                ) : r.state === 'upcoming' ? (
                  <>
                    <p>À venir</p>
                    {r.opensAt ? <span><Countdown target={r.opensAt} label="Ouvre dans" /></span> : <span>{r.theme}</span>}
                  </>
                ) : r.state === 'closed' ? (
                  <>
                    <p>Non jouée</p>
                    <span>Compte pour zéro dans le cumul</span>
                    {r.correctionsAllowed && <Link className="af-round-link" href={`${base}/manche/${r.number}/corrections`}>Voir la correction <ArrowRight aria-hidden /></Link>}
                  </>
                ) : (
                  <>
                    <p>À programmer</p>
                    <span>Date annoncée prochainement</span>
                  </>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="af-totals af-panel">
        <div className="af-metric">
          <ArenaTarget aria-hidden />
          <div>
            <h2>SCORE CUMULÉ</h2>
            {cumul.counted ? (
              <>
                <p>{formatNote(noteSur10(cumul.score, cumul.max, cumul.counted))} <em>/ {formatNote(noteMax(cumul.counted))}</em></p>
                <span>après la manche {cumul.lastCounted}</span>
              </>
            ) : (
              <>
                <p>—</p>
                <span>Après la 1re publication</span>
              </>
            )}
          </div>
        </div>
        <div className="af-metric">
          <ArenaBars aria-hidden />
          <div>
            <h2>CLASSEMENT</h2>
            <p>{cumul.rank ? ordinal(cumul.rank) : cumul.counted ? 'Non classé' : 'En attente'}</p>
            <span>{cumul.rank ? (cumul.distinction ? `Distinction ${DISTINCTION_LABEL[cumul.distinction]}` : isPodiumRank(cumul.rank) ? 'Podium · trophée à conquérir' : cumul.final ? 'Classement final' : 'Provisoire · cumulé') : cumul.counted ? `Seuil : ${cumul.thresholdPct} % du score cumulé` : 'Résultats non publiés'}</span>
          </div>
        </div>
        <div className="af-metric">
          <Timer aria-hidden />
          <div>
            <h2>TEMPS TOTAL</h2>
            <p>{played.length ? durationText(totalSeconds) : '—'}</p>
            <span>{played.length ? `Moyenne : ${durationText(Math.round(totalSeconds / played.length))} / manche` : 'Aucune manche disputée'}</span>
          </div>
        </div>
        <div className="af-metric">
          <Star aria-hidden fill="currentColor" />
          <div>
            <h2>PARCOURS</h2>
            <p>{played.length} <em>/ {rounds.length} {rounds.length > 1 ? 'manches disputées' : 'manche disputée'}</em></p>
            <span>Chaque étape compte</span>
          </div>
        </div>
      </div>
      {cumul.counted > 0 && (
        <p className="af-space-note">
          <Info aria-hidden />
          <span>
            {cumul.rank
              ? cumul.distinction
                ? `Distinction ${DISTINCTION_LABEL[cumul.distinction]} EVC Arena : podium et score cumulé au niveau de distinction.`
                : isPodiumRank(cumul.rank)
                  ? `Podium sans trophée : le trophée EVC Arena exige un score cumulé d’au moins ${cumul.distinctionPct} %.`
                  : `Prochain objectif : gagner des places, viser le podium et décrocher un trophée (dès ${cumul.distinctionPct} %).`
              : `${UNDER_THRESHOLD_MESSAGE} Prochain objectif : intégrer le classement EVC Arena (dès ${cumul.thresholdPct} %).`}
            {' '}<Link href={`${base}/regles#classement`}>Comment est calculé le classement ?</Link>
          </span>
        </p>
      )}

      <div className="af-bottom af-bottom-row af-space-actions">
        <Link className="af-action af-action-analysis" href={lastPlayed ? `${base}/manche/${lastPlayed}` : `${base}/regles`}>
          <FileText aria-hidden />
          <span>
            <strong>VOTRE ANALYSE</strong>
            <small>{lastPlayed ? `Vos réponses, votre score et vos axes de progression sur la manche ${lastPlayed}.` : 'Votre analyse apparaîtra ici après votre première manche. En attendant, lisez les règles du tournoi.'}</small>
          </span>
          <ArrowRight aria-hidden />
        </Link>
        {anyCorrections ? (
          <Link className="af-action af-action-red" href={`${base}/corrections`}>
            <FileText aria-hidden />
            <span><strong>VOIR LES CORRECTIONS</strong><small>{played.length > 1 ? `Revivez vos ${played.length} manches en détail` : 'Revivez votre manche en détail'}</small></span>
            <ArrowRight aria-hidden />
          </Link>
        ) : (
          <Link className="af-action af-action-red" href={`${base}/regles`}>
            <FileText aria-hidden />
            <span><strong>LES RÈGLES DU TOURNOI</strong><small>Barème, classement et distinctions</small></span>
            <ArrowRight aria-hidden />
          </Link>
        )}
        <Link className="af-action af-action-gold" href="/arena/calendrier">
          <CalendarDays aria-hidden />
          <span><strong>DÉCOUVRIR<br />LES PROCHAINES ÉDITIONS</strong><small>Ne manquez pas la prochaine manche</small></span>
          <ArrowRight aria-hidden />
        </Link>
      </div>

      <div className="af-panel af-space-invite" id="inviter">
        <h2><UserPlus aria-hidden />Invitez un collègue à rejoindre l’Arena</h2>
        <p>Plus on est de médecins, plus le défi est stimulant. Votre lien d’invitation personnalisé :</p>
        {invite}
      </div>
      {children}
    </section>
  );
}
