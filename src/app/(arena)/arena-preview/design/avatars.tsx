'use client';

import { useState } from 'react';
import { AvatarDistinctions } from '@/components/arena/avatar-distinctions';
import { AvatarRankHistory } from '@/components/arena/avatar-rank-history';
import { AVATARS_PLANCHE, DEFAULT_ARENA_AVATAR } from '@/components/arena/avatars';
import { Leaderboard } from '@/components/arena/leaderboard';
import { ArenaPage, type ShellNav } from '@/components/arena/arena-shell';
import type { RankHistoryEntry } from '@/lib/arena/rank-history';

/** Local fixtures, behind the preview route's development-only guard. */
export function AvatarShowcase({ nav }: { nav: ShellNav }) {
  const [seed, setSeed] = useState(DEFAULT_ARENA_AVATAR);
  const [scenario, setScenario] = useState('1,2,1');
  const [step, setStep] = useState(0);
  const ranks = scenario.split(',').map(Number);
  const rank = step ? ranks[step - 1] : null;
  const history: RankHistoryEntry[] = ranks.slice(0, step).map((r, i) => ({
    roundId: `demo-${i}`, roundNumber: i + 1, rank: r, totalScore: (i + 1) * 10,
    totalMax: (i + 1) * 13, recordedAt: `2026-09-${10 + i}T12:00:00Z`, isFinal: i === 2, reconstructed: false,
  }));
  const rows = step ? Array.from({ length: 6 }, (_, i) => ({
    rank: i + 1, pseudo: rank === i + 1 ? 'DrHorus27' : ['Asclepios', 'DrMinerva', 'Medicus', 'Hygie', 'DrAtlas', 'Panacee'][i],
    avatarSeed: rank === i + 1 ? seed : ['medecin-01', 'medecin-02', 'medecin-03', 'lion', 'hibou', 'casque'][i],
    totalScore: rank ? step * 10 + rank - i - 1 : 0, roundsPlayed: step, me: rank === i + 1,
  })) : [];
  return <ArenaPage nav={{ ...nav, participant: { pseudo: 'DrHorus27', avatar_seed: seed, rank } }} immersive bare><div className="ae-avatar-showcase">
    <header><p className="ae-kicker">VOTRE IDENTITÉ DANS L’ARENA</p><h1>Un personnage. Votre classement actuel.</h1><p>Votre avatar reste le même pendant toute l’Arena. Après chaque manche, son habillage évolue selon votre position au classement cumulé, à la hausse comme à la baisse.</p></header>
    <AvatarDistinctions seed={seed} />
    <section className="ae-panel ae-avatar-simulation">
      <h2>Simulation du parcours</h2><p>Aperçu local avec des données fictives. Publiez les trois manches pour vérifier l’apparence actuelle et le palmarès.</p>
      <div className="ae-avatar-controls">
        <label>Personnage<select value={seed} disabled={step > 0} onChange={e => setSeed(e.target.value)}>{AVATARS_PLANCHE.map(a => <option value={a.id} key={a.id}>{a.label}</option>)}</select></label>
        <label>Parcours<select value={scenario} onChange={e => { setScenario(e.target.value); setStep(0); }}><option value="1,2,1">1er → 2e → 1er</option><option value="3,6,2">3e → 6e → 2e</option></select></label>
        <button disabled={step === 3} onClick={() => setStep(n => n + 1)}>Publier la manche {Math.min(3, step + 1)}</button>
        <button disabled={step === 0} onClick={() => setStep(0)}>Recommencer</button>
      </div>
      <div className="ae-avatar-simulation-grid">
        <div aria-live="polite"><AvatarRankHistory seed={seed} pseudo="DrHorus27" rank={rank} entries={history} /></div>
        <Leaderboard rows={rows} totalMax={step * 13} subtitle={step === 3 ? 'Classement final (cumulé)' : 'Classement provisoire (cumulé)'} rulesHref="?state=avatars" />
      </div>
    </section>
  </div></ArenaPage>;
}
