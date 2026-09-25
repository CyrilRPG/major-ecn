import Link from 'next/link';
import { ChevronRight, Info, Trophy } from 'lucide-react';
import { ArenaAvatar } from './arena-avatar';
import { avatarAppearance, AVATAR_DISTINCTIONS, rankLabel } from '@/lib/arena/avatar-appearance';
import type { RankHistoryEntry } from '@/lib/arena/rank-history';
import { GENERAL_RANKING_NOTICE, type individualGeneralRank } from '@/lib/arena/format';
import { formatNote, noteMax, noteSur10 } from '@/lib/arena/note';
import { DEFAULT_THRESHOLDS, DISTINCTION_LABEL, distinctionFor, isPodiumRank, scorePct, type Distinction, type PerformanceThresholds } from '@/lib/arena/performance';

const dateLabel = (iso: string | null | undefined) => iso
  ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date(iso))
  : null;

/**
 * « Mon palmarès » — maquette client du 24/09/2026 (14_50_00) : apparence
 * actuelle, une ligne par publication (manche 1, manche 2, finale) avec la
 * note cumulée sur 10 × n manches et le rang, encart des distinctions.
 *
 * Seule la distinction ACTUELLE habille l'avatar. Les distinctions passées sont
 * relues depuis les scores enregistrés à chaque publication (rang + score
 * cumulé / maximum) avec les seuils actuels du tournoi : une distinction
 * décrochée reste dans le palmarès. Jamais de « 1er » sans rang publié.
 */
export function AvatarRankHistory({ seed, pseudo, rank, distinction = null, entries, thresholds = DEFAULT_THRESHOLDS, final = false, general, base, roundDates = {}, countedAt = {} }: {
  seed: string; pseudo: string; rank: number | null; distinction?: Distinction | null; entries: readonly RankHistoryEntry[];
  thresholds?: PerformanceThresholds; final?: boolean; general?: ReturnType<typeof individualGeneralRank>;
  /** `/arena/<slug>` : chaque manche renvoie à son écran de résultats. */
  base?: string;
  /** Date d'ouverture de chaque manche (numéro → ISO). */
  roundDates?: Record<number, string | null>;
  /** Nombre de manches comptées dans le cumul à la publication de chaque manche (numéro → n).
   *  Indispensable pour un inscrit tardif : sa 1re ligne peut être la manche 2 (cumul sur 20). */
  countedAt?: Record<number, number>;
}) {
  const info = AVATAR_DISTINCTIONS[avatarAppearance(distinction)];
  const entryDistinction = (entry: RankHistoryEntry) => distinctionFor(entry.rank, scorePct(entry.totalScore, entry.totalMax), thresholds);
  const trophies = entries.filter(e => entryDistinction(e)).length;
  return <section className="ae-palmares ev-palmares" aria-labelledby="palmares-title">
    <h2 id="palmares-title"><Trophy aria-hidden />Mon palmarès</h2>
    <div className="ae-palmares-current">
      <ArenaAvatar seed={seed} rank={rank} distinction={distinction} size={84} title={pseudo} />
      <div>
        <p>Apparence actuelle</p>
        <strong style={{ color: info.color }}>{info.label}</strong>
        <span>{final ? general?.text ?? 'Non classé au général' : rank ? `${rankLabel(rank)} au classement cumulé` : 'En attente de classement'}</span>
        {!final && rank && !distinction && isPodiumRank(rank) && <span>Podium sans trophée : le seuil de distinction ({thresholds.distinctionPct} %) reste à atteindre.</span>}
      </div>
    </div>
    {entries.length ? <ol className="ev-palmares-rows">{entries.map((entry, i) => {
      const d = entryDistinction(entry);
      const rounds = countedAt[entry.roundNumber] ?? i + 1;
      const finalRow = entry.isFinal && final;
      const when = dateLabel(roundDates[entry.roundNumber]);
      const place = finalRow
        ? general ? `${rankLabel(general.rank)}${general.effectif !== null ? ` sur ${general.effectif}` : ''} du général` : 'Non classé au général'
        : entry.rank ? `${rankLabel(entry.rank)} au classement cumulé` : 'Non classé';
      return <li key={entry.roundId} className={finalRow ? 'is-final' : undefined}>
        <div className="ev-palmares-name">
          {finalRow ? <strong><Trophy aria-hidden />Finale</strong> : <strong>{entry.isFinal ? 'Classement final' : `Manche ${entry.roundNumber}`}</strong>}
          {!finalRow && when && <small>{when}</small>}
        </div>
        <div className="ev-palmares-score">
          <p><b>{formatNote(noteSur10(entry.totalScore, entry.totalMax, rounds))}</b> / {formatNote(noteMax(rounds))} <small>note cumulée</small></p>
          <span style={d ? { color: AVATAR_DISTINCTIONS[avatarAppearance(d)].color } : undefined}>{place}{d ? ` · Distinction ${DISTINCTION_LABEL[d]}` : ''}{entry.reconstructed ? ' · reconstitué' : ''}</span>
        </div>
        {base && !finalRow
          ? <Link className="ev-palmares-go" href={`${base}/manche/${entry.roundNumber}`} aria-label={`Résultats de la manche ${entry.roundNumber}`}><ChevronRight aria-hidden /></Link>
          : <span className="ev-palmares-dash" aria-hidden>—</span>}
      </li>;
    })}</ol> : <p className="ae-palmares-empty">Votre parcours apparaîtra ici après la publication des résultats de chaque manche.</p>}
    <p className="ev-palmares-info"><Info aria-hidden /><span>Votre distinction évolue avec votre classement cumulé : Bronze, Argent ou Or. Les distinctions sont attribuées aux candidats du podium atteignant le seuil requis ({thresholds.distinctionPct} % du score cumulé).</span></p>
    {trophies > 0 && <p className="ae-palmares-note">{trophies} distinction{trophies > 1 ? 's' : ''} EVC Arena conservée{trophies > 1 ? 's' : ''} dans votre palmarès.</p>}
    <p className="ae-palmares-note">{GENERAL_RANKING_NOTICE}</p>
    {entries.some(e => e.reconstructed) && <p className="ae-palmares-note">Les classements antérieurs à l’activation du palmarès sont reconstitués à partir des résultats disponibles.</p>}
  </section>;
}
