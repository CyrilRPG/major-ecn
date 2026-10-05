'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemRow } from '@/lib/plan/pages';
import { restoreItemAction } from '@/app/(student)/planificateur/actions';
import { ErrorText, fmtDay } from './today/dialogs';

/**
 * « Mes révisions » : chaque item avec le niveau OBSERVÉ par Major ECN dès
 * qu'il existe (moteur central), sinon « Votre estimation » (§5.4) — jamais
 * un score brut. Prochaine réactivation, erreurs à reprendre, items retirés.
 */
export function RevisionsList({ items, domains, today }: { items: ItemRow[]; domains: { id: string; label: string }[]; today: string }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [domain, setDomain] = useState('');
  const [filter, setFilter] = useState<'tous' | 'erreurs' | 'reactivations' | 'retires'>('tous');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const shown = useMemo(() => items.filter((i) => (!q || norm(i.name).includes(norm(q))) && (!domain || i.domainId === domain)
    && (filter === 'tous' || (filter === 'erreurs' && i.openErrors > 0) || (filter === 'reactivations' && !!i.nextReview) || (filter === 'retires' && (i.excluded || i.shortVersion)))), [items, q, domain, filter]);
  const groups = useMemo(() => {
    const m = new Map<string, ItemRow[]>();
    for (const i of shown) { const k = i.domainLabel ?? 'Programme'; m.set(k, [...(m.get(k) ?? []), i]); }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0], 'fr'));
  }, [shown]);
  const counts = { erreurs: items.filter((i) => i.openErrors > 0).length, reactivations: items.filter((i) => !!i.nextReview).length, retires: items.filter((i) => i.excluded || i.shortVersion).length };
  const restore = (id: string) => start(async () => { setError(null); const r = await restoreItemAction(id); if (!r.ok) setError(r.error); else router.refresh(); });
  return (
    <div className="mt-[18px] space-y-[14px]">
      <div className="pl-card flex flex-wrap items-center gap-3 px-[18px] py-[12px]">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--pl-muted)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un item" aria-label="Rechercher un item" className="h-[40px] w-full rounded-full border border-(--pl-card-border) bg-(--pl-card) pl-9 pr-3 text-[14.5px]" />
        </label>
        {domains.length > 0 && (
          <select value={domain} onChange={(e) => setDomain(e.target.value)} aria-label="Spécialité" className="h-[40px] rounded-full border border-(--pl-card-border) bg-(--pl-card) px-3 text-[14.5px]">
            <option value="">Toutes les spécialités</option>
            {domains.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        )}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtre">
          {([['tous', `Tous (${items.length})`], ['erreurs', `Erreurs à reprendre (${counts.erreurs})`], ['reactivations', `Réactivations prévues (${counts.reactivations})`], ['retires', `Retirés / versions courtes (${counts.retires})`]] as const).map(([k, l]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={cn('rounded-full border px-3 py-1.5 text-[13px]', filter === k ? 'border-(--pl-pill) bg-(--pl-pill) font-semibold text-white' : 'border-(--pl-card-border) text-(--pl-text)')}>{l}</button>
          ))}
        </div>
      </div>
      <ErrorText error={error} />
      {groups.length === 0 && <p className="pl-card px-5 py-4 text-[14.5px] text-(--pl-text)">Aucun item ne correspond.</p>}
      {groups.map(([label, list]) => (
        <section key={label} className="pl-card overflow-hidden">
          <h2 className="border-b border-(--pl-card-border) bg-(--pl-rose-50) px-[18px] py-2.5 text-[15px] font-bold text-(--pl-ink)">{label} <span className="font-normal text-(--pl-muted)">· {list.length}</span></h2>
          <ul className="divide-y divide-(--pl-card-border)">
            {list.map((i) => (
              <li key={i.id} className="flex flex-col gap-1.5 px-[18px] py-[10px] md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold text-(--pl-ink)">{i.coursId ? <Link href={`/cours/${i.coursId}`} className="hover:underline">{i.name}</Link> : i.name}{i.hardPriority && <span className="ml-2 rounded-full bg-(--pl-rose-100) px-2 py-0.5 text-[11px] font-bold text-(--pl-bordeaux)">Priorité EVC</span>}</p>
                  <p className="text-[12.5px] text-(--pl-muted)">{i.level}{i.nextReview ? ` · prochaine réactivation le ${fmtDay(i.nextReview, false)}` : ''}{i.openErrors > 0 ? ` · ${i.openErrors} erreur${i.openErrors > 1 ? 's' : ''} à reprendre` : ''}{i.excluded ? ' · retiré de votre planning' : i.shortVersion ? ' · version courte' : ''}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span className={cn('rounded-full px-3 py-1 text-[12.5px] font-semibold', i.display.kind === 'observed' ? 'bg-(--pl-rose-100) text-(--pl-bordeaux)' : 'bg-(--pl-info) text-(--pl-text)')}>
                    {i.display.kind === 'observed' ? 'Niveau observé : ' : i.display.kind === 'estimate' ? 'Votre estimation : ' : ''}{i.display.label}
                  </span>
                  {(i.excluded || i.shortVersion) && <button type="button" disabled={pending} onClick={() => restore(i.id)} className="rounded-full border border-(--pl-pill) px-3 py-1 text-[12.5px] font-semibold text-(--pl-pill)">Remettre au programme</button>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-[12.5px] text-(--pl-muted)">Le niveau observé vient de vos résultats réels sur Major ECN (Check-up, révisions, planning, concours blancs) ; votre estimation ne sert qu’au départ et vous pouvez la modifier à tout moment. Aujourd’hui : {fmtDay(today)}.</p>
    </div>
  );
}
