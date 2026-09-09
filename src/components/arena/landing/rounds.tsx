import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { LocalTime } from '../countdown';
import { Leaderboard, type LeaderboardRowView } from '../leaderboard';
import { Container } from '../arena-ui';
import { ARENA, BODY, CAPS, DISPLAY } from '../tokens';
import { GoldEyebrow, Reveal } from './fx';

export type RoundCard = {
  number: number; theme: string; opensAt: string | null; closesAt: string | null;
  state: 'unscheduled' | 'upcoming' | 'open' | 'closed';
  href: string | null;
};

const STATE_LABEL = { open: 'Ouverte', upcoming: 'À venir', closed: 'Clôturée', unscheduled: 'À programmer' } as const;

/** Section sombre « Les 3 manches du tournoi » + « Meilleurs scores » du modèle (sans médaille ni effectif, §7 et §13). */
export function LandingRounds({
  rounds, rulesHref, leaderboardHref, board, boardSubtitle, totalMax, boardEmpty, leaderboardEnabled, general = false, effectif,
}: {
  rounds: RoundCard[]; rulesHref: string; leaderboardHref: string;
  board: LeaderboardRowView[]; boardSubtitle: string; totalMax: number; boardEmpty: string; leaderboardEnabled: boolean;
  general?: boolean; effectif?: number;
}) {
  return (
    <section id="manches" className="py-12 sm:py-16" style={{ background: ARENA.bg }}>
      <Container>
        <div className={`grid gap-8 ${leaderboardEnabled ? 'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]' : ''}`}>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <GoldEyebrow><span style={{ color: ARENA.text }}>Les {rounds.length || 3} manches du tournoi</span></GoldEyebrow>
              <Link href={rulesHref} className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] hover:text-white" style={{ color: ARENA.goldSoft, fontFamily: DISPLAY }}>
                Voir le calendrier et les règles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {rounds.map((r) => {
                const open = r.state === 'open';
                const inner = (
                  <div
                    className="arena-lift flex h-full flex-col items-center rounded-2xl px-4 py-6 text-center"
                    style={{
                      background: open ? `linear-gradient(180deg, ${ARENA.redDeep}, #6A0818)` : ARENA.surface,
                      boxShadow: open ? '0 30px 60px -30px rgba(228,0,43,0.7), inset 0 0 0 1px rgba(255,255,255,0.12)' : `inset 0 0 0 1px ${ARENA.line}, 0 0 0 1px rgba(212,169,74,0.10)`,
                    }}
                  >
                    <p className="text-[11px]" style={{ ...CAPS, color: open ? '#FFD7DD' : ARENA.textMuted, letterSpacing: '0.26em' }}>Manche {r.number}</p>
                    <p className="mt-2 min-h-[2.6em] text-[1.1rem] font-bold leading-snug" style={{ fontFamily: BODY, color: ARENA.text }}>{r.theme || `Manche ${r.number}`}</p>
                    <CalendarDays className="mt-4 h-8 w-8" style={{ color: ARENA.gold }} strokeWidth={1.6} />
                    <p className="mt-3 text-[14px] leading-snug" style={{ color: ARENA.text, fontFamily: BODY }}>
                      {r.opensAt ? <LocalTime iso={r.opensAt} withYear /> : 'Date annoncée prochainement'}
                    </p>
                    <span className="mt-4 inline-block rounded-full px-4 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.2em]" style={{ fontFamily: DISPLAY, color: open ? '#fff' : ARENA.textSoft, background: open ? ARENA.red : 'transparent', boxShadow: open ? 'none' : `inset 0 0 0 1.5px ${ARENA.lineStrong}` }}>
                      {STATE_LABEL[r.state]}
                    </span>
                  </div>
                );
                return <Reveal key={r.number} delay={0.1 * r.number} className="h-full">{r.href ? <Link href={r.href} className="block h-full">{inner}</Link> : inner}</Reveal>;
              })}
            </div>
          </div>

          {leaderboardEnabled && (
            <Reveal delay={0.2} className="overflow-hidden rounded-2xl">
            <div style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}, 0 0 0 1px rgba(212,169,74,0.10), 0 30px 60px -30px rgba(0,0,0,0.9)` }}>
              <div aria-hidden className="arena-shimmer h-[3px] w-full" style={{ backgroundImage: 'linear-gradient(90deg, rgba(212,169,74,0) 0%, #E8C878 30%, #D4A94A 50%, #E8C878 70%, rgba(212,169,74,0) 100%)' }} />
              <div className="flex items-center justify-end px-5 pt-4 sm:px-7">
                <Link href={leaderboardHref} className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] hover:text-white" style={{ color: ARENA.goldSoft, fontFamily: DISPLAY }}>
                  Voir tous les scores <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <Leaderboard rows={board} subtitle={boardSubtitle} totalMax={totalMax} rulesHref={`${rulesHref}#classement`} emptyMessage={boardEmpty} flat general={general} effectif={effectif} />
            </div>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
