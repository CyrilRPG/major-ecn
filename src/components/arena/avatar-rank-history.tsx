import { Trophy } from 'lucide-react';
import { ArenaAvatar } from './arena-avatar';
import { avatarAppearance, AVATAR_DISTINCTIONS, rankLabel } from '@/lib/arena/avatar-appearance';
import type { RankHistoryEntry } from '@/lib/arena/rank-history';
import { GENERAL_RANKING_NOTICE, type individualGeneralRank } from '@/lib/arena/format';

/** Personal history; only the current rank decorates the participant's avatar. */
export function AvatarRankHistory({ seed, pseudo, rank, entries, final = false, general }: {
  seed: string; pseudo: string; rank: number | null; entries: readonly RankHistoryEntry[];
  final?: boolean; general?: ReturnType<typeof individualGeneralRank>;
}) {
  const distinction = AVATAR_DISTINCTIONS[avatarAppearance(rank)];
  return <section className="ae-palmares" aria-labelledby="palmares-title">
    <h2 id="palmares-title"><Trophy aria-hidden />Mon palmarès</h2>
    <div className="ae-palmares-current">
      <ArenaAvatar seed={seed} rank={rank} size={80} title={pseudo} />
      <div><p>Apparence actuelle</p><strong style={{ color: distinction.color }}>{distinction.label}</strong><span>{final ? general?.text ?? 'Non classé au général' : rank ? `${rankLabel(rank)} au classement cumulé` : 'En attente de classement'}</span></div>
    </div>
    {entries.length ? <ol>{entries.map(entry => <li key={entry.roundId}>
      <span className="ae-palmares-rank" style={{ color: AVATAR_DISTINCTIONS[avatarAppearance(entry.rank)].color }}>{entry.isFinal && final ? general ? `${rankLabel(general.rank)}${general.effectif !== null ? ` sur ${general.effectif}` : ''}` : '—' : rankLabel(entry.rank)}</span>
      <div><strong>{entry.isFinal ? 'Classement final' : `Classement après manche ${entry.roundNumber}`}</strong><span>{entry.totalScore.toLocaleString('fr-FR')} / {entry.totalMax.toLocaleString('fr-FR')} points cumulés{entry.reconstructed ? ' · Reconstitué' : ''}</span></div>
    </li>)}</ol> : <p className="ae-palmares-empty">Votre parcours apparaîtra ici après la publication des résultats de chaque manche.</p>}
    <p className="ae-palmares-note">Votre avatar peut monter ou redescendre avec votre classement. Vos positions précédentes restent dans votre palmarès.</p>
    {final && <p className="ae-palmares-note">{GENERAL_RANKING_NOTICE}</p>}
    {entries.some(e => e.reconstructed) && <p className="ae-palmares-note">Les classements antérieurs à l’activation du palmarès sont reconstitués à partir des résultats disponibles.</p>}
  </section>;
}
