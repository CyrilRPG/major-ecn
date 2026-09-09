'use client';

import Link from 'next/link';
import { GENERAL_RANKING_NOTICE } from '@/lib/arena/format';
import { ArenaAvatar } from '@/components/arena/arena-avatar';
import { avatarAppearance, AVATAR_DISTINCTIONS } from '@/lib/arena/avatar-appearance';
import { ARENA, BODY, CAPS, DISPLAY, HEADLINE, TABULAR } from './arena-ui';

/* ============================================================
   « Meilleurs scores » (§7.2) — classement public cumulé, style tableau
   d'affichage des maquettes : rang, pseudonyme + avatar, score cumulé sur
   le maximum et l’effectif correspondant. Habillage de l'avatar fondé sur
   le rang cumulé actuel, même quand la liste concerne une manche.
   ============================================================ */

export type LeaderboardRowView = {
  rank: number;
  pseudo: string;
  avatarSeed: string;
  totalScore: number;
  roundsPlayed: number;
  me?: boolean;
  avatarRank?: number | null;
};

const fr = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export function Leaderboard({
  rows = [],
  subtitle = 'Classement provisoire (cumulé)',
  totalMax = 0,
  rulesHref = '#regles',
  emptyMessage,
  flat = false,
  effectif, general = false, roundOnly = false,
}: {
  rows?: LeaderboardRowView[];
  subtitle?: string;
  totalMax?: number;
  rulesHref?: string;
  emptyMessage?: string;
  /** Sans cadre propre (déjà encadré par un écran de stade). */
  flat?: boolean;
  effectif?: number;
  general?: boolean;
  roundOnly?: boolean;
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
        {totalMax > 0 && <p className="text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Score {roundOnly ? 'de manche' : 'cumulé'} sur {fr(totalMax)} · mis à jour à chaque publication</p>}
      </div>
      {effectif !== undefined && <p className="px-5 pt-3 text-sm sm:px-7" style={{ color: ARENA.textSoft }}>{general ? 'Effectif général' : roundOnly ? 'Effectif de manche' : 'Participants au classement cumulé provisoire'} : {effectif}</p>}

      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm sm:px-7" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          {emptyMessage ?? 'Le classement s’affichera après la publication des résultats de la première manche.'}
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-[1.7rem_minmax(0,1fr)_4.5rem] items-center gap-2 px-3 pb-2 text-[10.5px] font-bold uppercase tracking-[0.2em] sm:grid-cols-[3.4rem_1fr_7rem] sm:gap-3 sm:px-7" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
            <span>#</span>
            <span>Pseudonyme</span>
            <span className="text-right">{roundOnly ? 'Score' : 'Score cumulé'}</span>
          </div>
          <ol style={{ borderTop: `1px solid ${ARENA.line}` }}>
            {rows.map((r) => {
              const podium = r.rank <= 3;
              return (
                <li
                  key={`${r.rank}-${r.pseudo}`}
                  className="relative grid grid-cols-[1.7rem_minmax(0,1fr)_4.5rem] items-center gap-2 px-3 py-3 sm:grid-cols-[3.4rem_1fr_7rem] sm:gap-3 sm:px-7"
                  style={{ borderBottom: `1px solid ${ARENA.line}`, background: r.me ? 'rgba(228,0,43,0.10)' : podium ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                >
                  <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: ARENA.red, opacity: r.me ? 1 : 0 }} />
                  <span className="text-[1.6rem] leading-none sm:text-[1.9rem]" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em', color: podium ? AVATAR_DISTINCTIONS[avatarAppearance(r.rank)].color : ARENA.textMuted }}>
                    {r.rank.toString().padStart(2, '0')}
                  </span>
                  <span className="flex min-w-0 items-center gap-3">
                    <ArenaAvatar seed={r.avatarSeed} rank={r.avatarRank === undefined ? r.rank : r.avatarRank} size={46} title={r.pseudo} />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold [overflow-wrap:anywhere] sm:text-[15px]" style={{ fontFamily: BODY, color: ARENA.text }}>
                        {r.pseudo}
                        {r.me && <span className="ml-2 rounded px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-[0.12em]" style={{ background: ARENA.red, color: '#fff', fontFamily: DISPLAY }}>vous</span>}
                      </span>
                      <span className="block text-[11.5px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
                        {AVATAR_DISTINCTIONS[avatarAppearance(r.avatarRank === undefined ? r.rank : r.avatarRank)].label}
                      </span>
                    </span>
                  </span>
                  <span className="text-right text-[1.35rem] leading-none sm:text-[1.5rem]" style={{ ...TABULAR, color: podium || r.me ? ARENA.text : ARENA.textSoft }}>
                    {fr(r.totalScore)}<span className="mt-1 block text-[0.7em] sm:mt-0 sm:ml-1 sm:inline" style={{ color: ARENA.textMuted }}>/ {fr(totalMax)}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-7">
        {general && <p className="w-full text-xs" style={{ color: ARENA.textSoft }}>{GENERAL_RANKING_NOTICE}</p>}
        <p className="text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
          N’y figurent que les participants dont le score atteint le seuil. Égalité : points, puis réponses parfaites, puis temps moyen par manche.
        </p>
        <Link href={rulesHref} className="text-[12px] font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          Comment est calculé le classement ?
        </Link>
      </div>
    </div>
  );
}
