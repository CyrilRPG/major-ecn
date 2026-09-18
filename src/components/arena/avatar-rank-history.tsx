import { Trophy } from 'lucide-react';
import { ArenaAvatar } from './arena-avatar';
import { avatarAppearance, AVATAR_DISTINCTIONS, rankLabel } from '@/lib/arena/avatar-appearance';
import type { RankHistoryEntry } from '@/lib/arena/rank-history';
import { GENERAL_RANKING_NOTICE, type individualGeneralRank } from '@/lib/arena/format';
import { DEFAULT_THRESHOLDS, DISTINCTION_LABEL, distinctionFor, isPodiumRank, scorePct, type Distinction, type PerformanceThresholds } from '@/lib/arena/performance';

/**
 * Personal history; only the current distinction decorates the participant's
 * avatar. Les distinctions passées sont relues depuis les scores enregistrés à
 * chaque publication (rang + score cumulé / maximum) avec les seuils actuels
 * du tournoi : une distinction décrochée reste dans le palmarès.
 */
export function AvatarRankHistory({ seed, pseudo, rank, distinction = null, entries, thresholds = DEFAULT_THRESHOLDS, final = false, general }: {
  seed: string; pseudo: string; rank: number | null; distinction?: Distinction | null; entries: readonly RankHistoryEntry[];
  thresholds?: PerformanceThresholds; final?: boolean; general?: ReturnType<typeof individualGeneralRank>;
}) {
  const info = AVATAR_DISTINCTIONS[avatarAppearance(distinction)];
  const entryDistinction = (entry: RankHistoryEntry) => distinctionFor(entry.rank, scorePct(entry.totalScore, entry.totalMax), thresholds);
  const trophies = entries.filter(e => entryDistinction(e)).length;
  return <section className="ae-palmares" aria-labelledby="palmares-title">
    <h2 id="palmares-title"><Trophy aria-hidden />Mon palmarès</h2>
    <div className="ae-palmares-current">
      <ArenaAvatar seed={seed} rank={rank} distinction={distinction} size={80} title={pseudo} />
      <div>
        <p>Apparence actuelle</p>
        <strong style={{ color: info.color }}>{info.label}</strong>
        <span>{final ? general?.text ?? 'Non classé au général' : rank ? `${rankLabel(rank)} au classement cumulé` : 'En attente de classement'}</span>
        {!final && rank && !distinction && isPodiumRank(rank) && <span>Podium sans trophée : le seuil de distinction ({thresholds.distinctionPct} %) reste à atteindre.</span>}
      </div>
    </div>
    {entries.length ? <ol>{entries.map(entry => {
      const d = entryDistinction(entry);
      return <li key={entry.roundId}>
        <span className="ae-palmares-rank" style={{ color: AVATAR_DISTINCTIONS[avatarAppearance(d)].color }}>{entry.isFinal && final ? general ? `${rankLabel(general.rank)}${general.effectif !== null ? ` sur ${general.effectif}` : ''}` : '—' : rankLabel(entry.rank)}</span>
        <div>
          <strong>{entry.isFinal ? 'Classement final' : `Classement après manche ${entry.roundNumber}`}{d ? ` · Distinction ${DISTINCTION_LABEL[d]}` : ''}</strong>
          <span>{entry.totalScore.toLocaleString('fr-FR')} / {entry.totalMax.toLocaleString('fr-FR')} points cumulés{entry.reconstructed ? ' · Reconstitué' : ''}</span>
        </div>
      </li>;
    })}</ol> : <p className="ae-palmares-empty">Votre parcours apparaîtra ici après la publication des résultats de chaque manche.</p>}
    {trophies > 0 && <p className="ae-palmares-note">{trophies} distinction{trophies > 1 ? 's' : ''} EVC Arena conservée{trophies > 1 ? 's' : ''} dans votre palmarès.</p>}
    <p className="ae-palmares-note">Votre avatar peut monter ou redescendre avec votre classement : Or, Argent ou Bronze exigent le podium et un score cumulé d’au moins {thresholds.distinctionPct} %. Vos positions précédentes restent dans votre palmarès.</p>
    {final && <p className="ae-palmares-note">{GENERAL_RANKING_NOTICE}</p>}
    {entries.some(e => e.reconstructed) && <p className="ae-palmares-note">Les classements antérieurs à l’activation du palmarès sont reconstitués à partir des résultats disponibles.</p>}
  </section>;
}
