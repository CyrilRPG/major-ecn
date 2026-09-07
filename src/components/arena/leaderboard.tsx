'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { DrawnAvatar } from '@/components/avatar/drawn-avatar';
import { ARENA, BODY, DISPLAY, TABULAR } from './arena-ui';

/* ============================================================
   « Meilleurs scores » (§7.2) — classement public cumulé.
   Aucun effectif, aucune mention « Top 10 », au plus `size` entrées,
   colonnes pseudonyme / avatar / score cumulé. Codes sportifs :
   lignes de classement, halos, grands chiffres.
   ============================================================ */

export type LeaderboardRowView = {
  rank: number;
  pseudo: string;
  avatarSeed: string;
  totalScore: number;
  roundsPlayed: number;
  me?: boolean;
};

const DEMO_ROWS: LeaderboardRowView[] = [
  { rank: 1, pseudo: 'Dr_Nadir', totalScore: 22.4, roundsPlayed: 2, avatarSeed: 'nadir' },
  { rank: 2, pseudo: 'Sahar.K', totalScore: 21.9, roundsPlayed: 2, avatarSeed: 'sahar' },
  { rank: 3, pseudo: 'Interniste75', totalScore: 21.2, roundsPlayed: 2, avatarSeed: 'int75' },
  { rank: 4, pseudo: 'Yassine_M', totalScore: 20.7, roundsPlayed: 2, avatarSeed: 'yassine' },
  { rank: 5, pseudo: 'Lina', totalScore: 20.1, roundsPlayed: 2, avatarSeed: 'lina' },
  { rank: 6, pseudo: 'Karim_B', totalScore: 19.6, roundsPlayed: 2, avatarSeed: 'karim' },
  { rank: 7, pseudo: 'DocTunis', totalScore: 19.4, roundsPlayed: 2, avatarSeed: 'doctunis', me: true },
  { rank: 8, pseudo: 'Amel.R', totalScore: 18.8, roundsPlayed: 2, avatarSeed: 'amel' },
  { rank: 9, pseudo: 'Mehdi', totalScore: 18.3, roundsPlayed: 1, avatarSeed: 'mehdi' },
  { rank: 10, pseudo: 'Sami_L', totalScore: 17.5, roundsPlayed: 2, avatarSeed: 'sami' },
];

const fr = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function Leaderboard({
  rows = DEMO_ROWS,
  subtitle = 'Classement provisoire cumulé · après M2',
  totalMax = 24,
  rulesHref = '#regles',
  emptyMessage,
}: {
  rows?: LeaderboardRowView[];
  subtitle?: string;
  totalMax?: number;
  rulesHref?: string;
  emptyMessage?: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-[1.5rem]"
      style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}, 0 40px 80px -30px rgba(0,0,0,0.8)` }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-6 sm:px-8">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>{subtitle}</p>
          <h3 className="mt-1.5 text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: DISPLAY, letterSpacing: '-0.03em' }}>Meilleurs scores</h3>
        </div>
        <p className="text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Score cumulé sur {fr(totalMax)} · mis à jour à chaque clôture</p>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm sm:px-8" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          {emptyMessage ?? 'Le classement s’affichera après la publication des résultats de la première manche.'}
        </p>
      ) : (
        <>
          <div
            className="mt-5 grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-5 pb-2 text-[10.5px] font-bold uppercase tracking-[0.18em] sm:grid-cols-[3.5rem_1fr_6rem] sm:px-8"
            style={{ color: ARENA.textMuted, fontFamily: BODY }}
          >
            <span>Rang</span>
            <span>Participant</span>
            <span className="text-right">Score</span>
          </div>
          <ol style={{ borderTop: `1px solid ${ARENA.line}` }}>
            {rows.map((r, i) => {
              const podium = r.rank <= 3;
              return (
                <motion.li
                  key={`${r.rank}-${r.pseudo}`}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: Math.min(i, 10) * 0.04, ease: 'easeOut' }}
                  className="relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-5 py-3.5 sm:grid-cols-[3.5rem_1fr_6rem] sm:px-8"
                  style={{ borderBottom: `1px solid ${ARENA.line}`, background: r.me ? 'rgba(228,0,43,0.07)' : 'transparent' }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ background: ARENA.red, opacity: podium || r.me ? 1 : 0, boxShadow: podium ? '0 0 18px rgba(228,0,43,0.7)' : 'none' }}
                  />
                  <span className="text-2xl leading-none sm:text-3xl" style={{ ...TABULAR, color: podium ? ARENA.redSoft : ARENA.textMuted, fontWeight: podium ? 500 : 400 }}>
                    {r.rank.toString().padStart(2, '0')}
                  </span>
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className="shrink-0 rounded-full"
                      style={{ boxShadow: `0 0 0 2px ${podium ? 'rgba(228,0,43,0.6)' : ARENA.lineStrong}` }}
                    >
                      <DrawnAvatar seed={r.avatarSeed} size={36} title={r.pseudo} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-extrabold" style={{ fontFamily: DISPLAY, letterSpacing: '-0.01em' }}>
                        {r.pseudo}
                        {r.me && (
                          <span className="ml-2 rounded-full px-2 py-0.5 align-middle text-[10px] font-extrabold uppercase tracking-[0.12em]" style={{ background: ARENA.red, color: '#fff', fontFamily: BODY }}>
                            vous
                          </span>
                        )}
                      </span>
                      <span className="block text-[11.5px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
                        {r.roundsPlayed} manche{r.roundsPlayed > 1 ? 's' : ''} jouée{r.roundsPlayed > 1 ? 's' : ''}
                      </span>
                    </span>
                  </span>
                  <span className="text-right text-2xl leading-none sm:text-[1.7rem]" style={{ ...TABULAR, color: podium || r.me ? ARENA.text : ARENA.textSoft, fontWeight: 500 }}>
                    {fr(r.totalScore)}
                  </span>
                </motion.li>
              );
            })}
          </ol>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-8">
        <p className="text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
          N’y figurent que les participants dont le score cumulé atteint le seuil. Égalité : points, puis réponses parfaites, puis temps moyen par manche.
        </p>
        <Link href={rulesHref} className="text-xs font-bold underline-offset-4 hover:underline" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          Comment est calculé le classement ?
        </Link>
      </div>
    </div>
  );
}
