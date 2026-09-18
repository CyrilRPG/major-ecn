'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { affecterEleveAction, majSuiviEleveAction } from '@/app/admin/suivi/eleves/actions';
import { Button } from '@/components/ui/button';
import { STATUTS_SUIVI, STATUT_SUIVI_LABEL, type Collaborateur, type StatutSuivi } from '@/lib/suivi/eleves-pure';

/** Statut de suivi, prochain contact et affectation, sur la fiche d'un élève. */
export function SuiviControls({
  userId, statut, prochainContact, affecteA, collaborateurs, peutAffecter, peutRediger,
}: {
  userId: string; statut: StatutSuivi; prochainContact: string | null; affecteA: string | null;
  collaborateurs: Collaborateur[]; peutAffecter: boolean; peutRediger: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [s, setS] = useState<StatutSuivi>(statut);
  const [date, setDate] = useState(prochainContact ?? '');
  const [collab, setCollab] = useState(affecteA ?? '');
  const INPUT = 'h-9 rounded-lg border border-(--color-border) bg-white px-3 text-sm text-(--color-ink)';

  const enregistrer = () => {
    setError(null);
    start(async () => {
      if (peutRediger) {
        const r = await majSuiviEleveAction({ userId, statut: s, prochainContact: date });
        if (!r.ok) { setError(r.error); return; }
      }
      if (peutAffecter && (collab || affecteA) && collab !== (affecteA ?? '')) {
        const r = await affecterEleveAction({ userId, collaborateurId: collab || null });
        if (!r.ok) { setError(r.error); return; }
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="block"><span className={LABEL}>Statut de suivi</span>
        <select value={s} disabled={!peutRediger} onChange={(e) => setS(e.target.value as StatutSuivi)} className={INPUT}>
          {STATUTS_SUIVI.map((x) => <option key={x} value={x}>{STATUT_SUIVI_LABEL[x]}</option>)}
        </select>
      </label>
      <label className="block"><span className={LABEL}>Prochain contact prévu</span>
        <input type="date" value={date} disabled={!peutRediger} onChange={(e) => setDate(e.target.value)} className={INPUT} />
      </label>
      <label className="block"><span className={LABEL}>Affecté à</span>
        <select value={collab} disabled={!peutAffecter} onChange={(e) => setCollab(e.target.value)} className={INPUT}>
          <option value="">— Personne —</option>
          {collaborateurs.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
      </label>
      {(peutRediger || peutAffecter) && (
        <Button size="sm" onClick={enregistrer} disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null} Enregistrer</Button>
      )}
      {error && <p className="w-full text-sm font-medium text-[#A91D2C]">{error}</p>}
    </div>
  );
}

const LABEL = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)';
