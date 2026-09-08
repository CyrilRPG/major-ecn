'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArenaAvatar } from '@/components/arena/arena-avatar';
import { ARENA, BODY, CAPS, DISPLAY, HEADLINE, TABULAR } from './arena-ui';

/* ============================================================
   « Meilleurs scores » (§7.2) — classement public cumulé, style tableau
   d'affichage des maquettes : rang, pseudonyme + avatar, score cumulé sur
   le maximum. Aucun effectif, aucune mention « Top 10 », au plus `size`
   entrées, aucun trophée ni médaille (§13).
   ============================================================ */

export type LeaderboardRowView = {
  rank: number;
  pseudo: string;
  avatarSeed: string;
  totalScore: number;
  roundsPlayed: number;
  me?: boolean;
};

const fr = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export function Leaderboard({
  rows = [],
  subtitle = 'Classement provisoire (cumulé)',
  totalMax = 0,
  rulesHref = '#regles',
  emptyMessage,
  flat = false,
}: {
  rows?: LeaderboardRowView[];
  subtitle?: string;
  totalMax?: number;
  rulesHref?: string;
  emptyMessage?: string;
  /** Sans cadre propre (déjà encadré par un écran de stade). */
  flat?: boolean;
}) {
  return (
    <div
      className={flat ? '' : 'overflow-hidden rounded-2xl'}
      style={flat ? undefined : { background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}, 0 40px 80px -30px rgba(0,0,0,0.8)` }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-5 sm:px-7">
        <div>
          <p className="text-[11px]" style={{ ...CAPS, color: ARENA.textMuted, letterSpacing: '0.22em' }}>{subtitle}</p>
          <h3 className="mt-1 text-[2rem] leading-none sm:text-[2.4rem]" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em', color: ARENA.text }}>Meilleurs <span style={{ color: ARENA.red }}>scores</span></h3>
        </div>
        {totalMax > 0 && <p className="text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Score cumulé sur {fr(totalMax)} · mis à jour à chaque clôture</p>}
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm sm:px-7" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          {emptyMessage ?? 'Le classement s’affichera après la publication des résultats de la première manche.'}
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-[2.6rem_1fr_auto] items-center gap-3 px-5 pb-2 text-[10.5px] font-bold uppercase tracking-[0.2em] sm:grid-cols-[3.4rem_1fr_7rem] sm:px-7" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
            <span>#</span>
            <span>Pseudonyme</span>
            <span className="text-right">Score cumulé</span>
          </div>
          <ol style={{ borderTop: `1px solid ${ARENA.line}` }}>
            {rows.map((r, i) => {
              const podium = r.rank <= 3;
              return (
                <motion.li
                  key={`${r.rank}-${r.pseudo}`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.3, delay: Math.min(i, 10) * 0.04, ease: 'easeOut' }}
                  className="relative grid grid-cols-[2.6rem_1fr_auto] items-center gap-3 px-5 py-3 sm:grid-cols-[3.4rem_1fr_7rem] sm:px-7"
                  style={{ borderBottom: `1px solid ${ARENA.line}`, background: r.me ? 'rgba(228,0,43,0.10)' : podium ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                >
                  <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: ARENA.red, opacity: r.me ? 1 : 0 }} />
                  <span className="text-[1.6rem] leading-none sm:text-[1.9rem]" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em', color: podium ? ARENA.red : ARENA.textMuted }}>
                    {r.rank.toString().padStart(2, '0')}
                  </span>
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 rounded-full" style={{ boxShadow: `0 0 0 2px ${podium || r.me ? 'rgba(228,0,43,0.7)' : ARENA.lineStrong}` }}>
                      <ArenaAvatar seed={r.avatarSeed} size={34} title={r.pseudo} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold" style={{ fontFamily: BODY, color: ARENA.text }}>
                        {r.pseudo}
                        {r.me && <span className="ml-2 rounded px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-[0.12em]" style={{ background: ARENA.red, color: '#fff', fontFamily: DISPLAY }}>vous</span>}
                      </span>
                      <span className="block text-[11.5px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
                        {r.roundsPlayed} manche{r.roundsPlayed > 1 ? 's' : ''} jouée{r.roundsPlayed > 1 ? 's' : ''}
                      </span>
                    </span>
                  </span>
                  <span className="text-right text-[1.35rem] leading-none sm:text-[1.5rem]" style={{ ...TABULAR, color: podium || r.me ? ARENA.text : ARENA.textSoft }}>
                    {fr(r.totalScore)}<span className="ml-1 text-[0.7em]" style={{ color: ARENA.textMuted }}>/ {fr(totalMax)}</span>
                  </span>
                </motion.li>
              );
            })}
          </ol>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-7">
        <p className="text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
          N’y figurent que les participants dont le score cumulé atteint le seuil. Égalité : points, puis réponses parfaites, puis temps moyen par manche.
        </p>
        <Link href={rulesHref} className="text-[12px] font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          Comment est calculé le classement ?
        </Link>
      </div>
    </div>
  );
}
