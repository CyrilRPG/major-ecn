'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Info, Trophy, UsersRound } from 'lucide-react';
import { GENERAL_RANKING_NOTICE } from '@/lib/arena/format';
import { formatNote, noteMax, noteSur10 } from '@/lib/arena/note';
import { ArenaAvatar } from '@/components/arena/arena-avatar';
import { avatarAppearance, AVATAR_DISTINCTIONS } from '@/lib/arena/avatar-appearance';
import { DISTINCTION_LABEL, type Distinction } from '@/lib/arena/performance';

/* ============================================================
   « Meilleurs scores » (§7.2) — carte à liseré doré de la maquette client
   du 24/09/2026 (15_10_06) : sur-titre, titre bicolore, coupe, note
   cumulée sur 10 × n manches, effectif (seulement quand la page le
   fournit), rangs, puis rappels du classement.

   Cahier des charges complémentaire (18/09/2026) : n'y figurent que les
   participants au-dessus du seuil de classement ; un trophée (Or / Argent /
   Bronze) n'apparaît que pour un podium AU niveau de distinction. L'habillage
   de l'avatar suit la distinction cumulée, même quand la liste concerne une
   manche.
   ============================================================ */

export type LeaderboardRowView = {
  rank: number;
  pseudo: string;
  avatarSeed: string;
  totalScore: number;
  roundsPlayed: number;
  me?: boolean;
  /** Trophée de CE classement (manche ou cumul). */
  distinction?: Distinction | null;
  /** Distinction cumulée actuelle (habillage de l'avatar) ; défaut = `distinction`. */
  avatarDistinction?: Distinction | null;
};

const fr = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export function Leaderboard({
  rows = [],
  subtitle = 'Classement provisoire (cumulé)',
  totalMax = 0,
  /** Nombre de manches cumulées dans `totalMax` : la note est sur 10 × n. */
  roundsCount = 1,
  rulesHref = '#regles',
  emptyMessage,
  effectif, general = false, roundOnly = false,
  distinctionPct,
  moreHref,
  compact = false,
}: {
  rows?: LeaderboardRowView[];
  subtitle?: string;
  totalMax?: number;
  roundsCount?: number;
  rulesHref?: string;
  emptyMessage?: ReactNode;
  /** Conservé pour compatibilité : la carte porte toujours son propre cadre. */
  flat?: boolean;
  effectif?: number;
  general?: boolean;
  roundOnly?: boolean;
  /** Seuil de distinction affiché dans la note de bas de tableau. */
  distinctionPct?: number;
  /** Lien « Voir tous les scores » (aperçu de la page d'accueil du tournoi). */
  moreHref?: string;
  /** Aperçu de la page d'accueil (liste déjà limitée par `leaderboard_size`) : cadre plus serré. */
  compact?: boolean;
}) {
  const shown = rows;
  return (
    <div className={`ev-board${compact ? ' ev-board--compact' : ''}`}>
      {moreHref && <Link href={moreHref} className="ev-link-caps ev-board-more">Voir tous les scores <ArrowRight aria-hidden /></Link>}
      <div className="ev-board-head">
        <p className="ev-board-kicker">{subtitle}</p>
        <h3>Meilleurs <span>scores</span></h3>
        {totalMax > 0 && <p className="ev-board-meta">Score {roundOnly ? 'de manche' : 'cumulé'} sur {formatNote(noteMax(roundsCount))} · mis à jour à chaque publication</p>}
        {effectif !== undefined && <p className="ev-board-effectif"><UsersRound aria-hidden strokeWidth={1.6} />{general ? 'Effectif général' : roundOnly ? 'Effectif de manche' : 'Participants au classement cumulé provisoire'} : {effectif}</p>}
        <Image className="ev-board-trophy" src="/arena/refonte/trophee-coupe.png" alt="" width={324} height={546} sizes="110px" aria-hidden />
      </div>

      {shown.length === 0 ? (
        <div className="ev-board-empty">
          {emptyMessage ?? 'Le classement s’affichera après la publication des résultats de la première manche.'}
        </div>
      ) : (
        <>
          <div className="ev-board-cols" aria-hidden>
            <span>#</span>
            <span>Pseudonyme</span>
            <span>{roundOnly ? 'Score' : 'Score cumulé'}</span>
          </div>
          <ol className="ev-board-rows">
            {shown.map((r) => {
              const podium = r.rank <= 3;
              const trophy = r.distinction ?? null;
              const avatarDistinction = r.avatarDistinction === undefined ? trophy : r.avatarDistinction;
              const trophyColor = trophy ? AVATAR_DISTINCTIONS[avatarAppearance(trophy)].color : undefined;
              return (
                <li key={`${r.rank}-${r.pseudo}`} className={`${podium ? 'is-podium' : ''}${r.me ? ' is-me' : ''}`}>
                  <span className="ev-board-rank" style={trophyColor ? { color: trophyColor } : undefined}>{r.rank.toString().padStart(2, '0')}</span>
                  <span className="ev-board-who">
                    <ArenaAvatar seed={r.avatarSeed} rank={r.rank} distinction={avatarDistinction} size={44} title={r.pseudo} />
                    <span>
                      <strong>{r.pseudo}{r.me && <em>vous</em>}</strong>
                      <small style={trophyColor ? { color: trophyColor } : undefined}>
                        {trophy ? <><Trophy aria-hidden />Distinction {DISTINCTION_LABEL[trophy]}</> : podium ? 'Podium · trophée à conquérir' : AVATAR_DISTINCTIONS[avatarAppearance(avatarDistinction)].label}
                      </small>
                    </span>
                  </span>
                  <span className="ev-board-score">
                    {formatNote(noteSur10(r.totalScore, totalMax, roundsCount))}<small> / {formatNote(noteMax(roundsCount))}</small>
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      )}

      <div className="ev-board-foot">
        {general && <p className="ev-board-info"><Info aria-hidden />{GENERAL_RANKING_NOTICE}</p>}
        <p className="ev-board-note">
          N’y figurent que les participants dont le score atteint le seuil du classement. Les trophées Or, Argent et Bronze exigent le podium{distinctionPct !== undefined ? ` et un score cumulé d’au moins ${fr(distinctionPct)} %` : ' et le niveau de distinction'}. En cas d’égalité : nombre de points, puis réponses parfaites, puis temps moyen par manche.
        </p>
        <Link href={rulesHref} className="ev-board-rules">Comment est calculé le classement ? <ArrowRight aria-hidden /></Link>
      </div>
    </div>
  );
}
