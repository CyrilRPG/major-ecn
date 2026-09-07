import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { LocalTime } from '../countdown';
import { Leaderboard, type LeaderboardRowView } from '../leaderboard';
import { Container } from '../arena-ui';
import { ARENA, BODY, CAPS, DISPLAY } from '../tokens';

export type RoundCard = {
  number: number; theme: string; opensAt: string | null; closesAt: string | null;
  state: 'unscheduled' | 'upcoming' | 'open' | 'closed';
  href: string | null;
};

const STATE_LABEL = { open: 'Ouverte', upcoming: 'À venir', closed: 'Clôturée', unscheduled: 'À programmer' } as const;

/** Section sombre « Les 3 manches du tournoi » + « Meilleurs scores » du modèle (sans médaille ni effectif, §7 et §13). */
export function LandingRounds({
  rounds, rulesHref, leaderboardHref, board, boardSubtitle, totalMax, boardEmpty, leaderboardEnabled,
}: {
  rounds: RoundCard[]; rulesHref: string; leaderboardHref: string;
  board: LeaderboardRowView[]; boardSubtitle: string; totalMax: number; boardEmpty: string; leaderboardEnabled: boolean;
}) {
  return (
    <section id="manches" className="py-12 sm:py-16" style={{ background: ARENA.bg }}>
      <Container>
        <div className={`grid gap-8 ${leaderboardEnabled ? 'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]' : ''}`}>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="inline-flex items-center gap-3 text-[13px]" style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.24em' }}>
                <span aria-hidden className="h-[3px] w-8 rounded-full" style={{ background: ARENA.warn }} />
                Les {rounds.length || 3} manches du tournoi
              </p>
              <Link href={rulesHref} className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] hover:text-white" style={{ color: ARENA.textSoft, fontFamily: DISPLAY }}>
                Voir le calendrier et les règles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {rounds.map((r) => {
                const open = r.state === 'open';
                const inner = (
                  <div
                    className="flex h-full flex-col items-center rounded-2xl px-4 py-6 text-center transition-transform hover:-translate-y-0.5"
                    style={{
                      background: open ? `linear-gradient(180deg, ${ARENA.redDeep}, #6A0818)` : ARENA.surface,
                      boxShadow: open ? '0 30px 60px -30px rgba(228,0,43,0.7), inset 0 0 0 1px rgba(255,255,255,0.12)' : `inset 0 0 0 1px ${ARENA.line}`,
                    }}
                  >
                    <p className="text-[11px]" style={{ ...CAPS, color: open ? '#FFD7DD' : ARENA.textMuted, letterSpacing: '0.26em' }}>Manche {r.number}</p>
                    <p className="mt-2 min-h-[2.6em] text-[1.1rem] font-bold leading-snug" style={{ fontFamily: BODY, color: ARENA.text }}>{r.theme || `Manche ${r.number}`}</p>
                    <CalendarDays className="mt-4 h-8 w-8" style={{ color: ARENA.warn }} strokeWidth={1.6} />
                    <p className="mt-3 text-[14px] leading-snug" style={{ color: ARENA.text, fontFamily: BODY }}>
                      {r.opensAt ? <LocalTime iso={r.opensAt} withYear /> : 'Date annoncée prochainement'}
                    </p>
                    <span className="mt-4 inline-block rounded-full px-4 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.2em]" style={{ fontFamily: DISPLAY, color: open ? '#fff' : ARENA.textSoft, background: open ? ARENA.red : 'transparent', boxShadow: open ? 'none' : `inset 0 0 0 1.5px ${ARENA.lineStrong}` }}>
                      {STATE_LABEL[r.state]}
                    </span>
                  </div>
                );
                return r.href ? <Link key={r.number} href={r.href} className="block">{inner}</Link> : <div key={r.number}>{inner}</div>;
              })}
            </div>
          </div>

          {leaderboardEnabled && (
            <div className="overflow-hidden rounded-2xl" style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}, 0 30px 60px -30px rgba(0,0,0,0.9)` }}>
              <div className="flex items-center justify-end px-5 pt-4 sm:px-7">
                <Link href={leaderboardHref} className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] hover:text-white" style={{ color: ARENA.textSoft, fontFamily: DISPLAY }}>
                  Voir tous les scores <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <Leaderboard rows={board} subtitle={boardSubtitle} totalMax={totalMax} rulesHref={`${rulesHref}#classement`} emptyMessage={boardEmpty} flat />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
