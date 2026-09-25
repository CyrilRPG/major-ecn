import Link from 'next/link';
import { ArrowRight, CalendarDays, Check, FileText, Timer } from 'lucide-react';
import { Countdown } from '../countdown';
import { HelmetDivider } from '../arena-footers';
import { Leaderboard, type LeaderboardRowView } from '../leaderboard';

export type RoundCard = {
  number: number; theme: string; opensAt: string | null; closesAt: string | null;
  state: 'unscheduled' | 'upcoming' | 'open' | 'closed';
  href: string | null;
  /** Nombre réel de questions (non neutralisées) de la manche. */
  questions?: number;
  /** Durée par question (s) ; null quand certaines questions ont leur propre durée. */
  seconds?: number | null;
};

const paris = (iso: string) => {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(d);
  const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(d).replace(':', 'h');
  return { day, time };
};

/**
 * « Les 3 manches du tournoi » + carte « Meilleurs scores » — maquette client
 * du 24/09/2026 (15_10_06) : casque sur le filet doré, trois cartes à bandeau
 * (thème, nombre de questions, durée, date et heure de Paris, statut), carte
 * du classement cumulé à liseré doré. Valeurs réelles du tournoi.
 */
export function LandingRounds({
  rounds, rulesHref, leaderboardHref, board, boardSubtitle, totalMax, boardRounds = 1, boardEmpty, leaderboardEnabled, general = false, effectif, distinctionPct,
}: {
  rounds: RoundCard[]; rulesHref: string; leaderboardHref: string;
  board: LeaderboardRowView[]; boardSubtitle: string; totalMax: number; boardRounds?: number; boardEmpty: string; leaderboardEnabled: boolean;
  general?: boolean; effectif?: number; distinctionPct?: number;
}) {
  return (
    <section id="manches" className="ev-rounds" aria-labelledby="ev-rounds-title">
      <HelmetDivider />
      <div className={`ev-wrap ev-rounds-grid${leaderboardEnabled ? '' : ' ev-rounds-grid--solo'}`}>
        <div className="ev-rounds-main">
          <div className="ev-rounds-head">
            <div>
              <h2 id="ev-rounds-title"><span aria-hidden className="ev-rule" />Les <em>{rounds.length || 3} manches</em> du tournoi</h2>
              <p>Trois étapes, trois thématiques, un classement cumulé.</p>
            </div>
            <Link href={rulesHref} className="ev-link-caps">Voir le calendrier et les règles <ArrowRight aria-hidden /></Link>
          </div>
          <ol className="ev-round-cards">
            {rounds.map((r) => {
              const when = r.opensAt ? paris(r.opensAt) : null;
              return (
                <li key={r.number} className={`ev-round-card is-${r.state}`}>
                  <p className="ev-round-band">Manche {r.number}</p>
                  <h3>{r.theme || `Manche ${r.number}`}</h3>
                  <ul>
                    {r.questions !== undefined && r.questions > 0 && <li><FileText aria-hidden strokeWidth={1.5} /><span>{r.questions} questions</span></li>}
                    <li><Timer aria-hidden strokeWidth={1.5} /><span>{r.seconds ? <>{r.seconds} secondes<br />par question</> : <>Durée indiquée<br />à chaque question</>}</span></li>
                    <li><CalendarDays aria-hidden strokeWidth={1.5} /><span>{when ? <>{when.day}<br />à {when.time} (heure de Paris)</> : 'Date annoncée prochainement'}</span></li>
                  </ul>
                  <div className="ev-round-foot">
                    {r.state === 'open' && r.href ? (
                      <Link href={r.href} className="ev-round-status is-open">Manche ouverte <ArrowRight aria-hidden /></Link>
                    ) : r.state === 'closed' ? (
                      r.href
                        ? <Link href={r.href} className="ev-round-status" aria-label={`Manche ${r.number} clôturée — voir les corrections`}><Check aria-hidden />Clôturée</Link>
                        : <span className="ev-round-status"><Check aria-hidden />Clôturée</span>
                    ) : r.state === 'upcoming' ? (
                      <span className="ev-round-status is-upcoming">À venir</span>
                    ) : (
                      <span className="ev-round-status">À programmer</span>
                    )}
                    {r.state === 'upcoming' && r.opensAt && <p className="ev-round-countdown"><Countdown target={r.opensAt} label="Ouvre dans" /></p>}
                    {r.state === 'open' && r.closesAt && <p className="ev-round-countdown"><Countdown target={r.closesAt} label="Se termine dans" /></p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {leaderboardEnabled && (
          <Leaderboard rows={board} subtitle={boardSubtitle} totalMax={totalMax} roundsCount={boardRounds} rulesHref={`${rulesHref}#classement`} emptyMessage={boardEmpty}
            moreHref={leaderboardHref} general={general} effectif={effectif} distinctionPct={distinctionPct} compact />
        )}
      </div>
    </section>
  );
}
